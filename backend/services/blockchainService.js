const { ethers } = require("ethers");
const { getCache, setCache, clearCacheByPattern } = require("../utils/redis");
const { VOTE_OPTIONS } = require("../utils/constants");
const ContentItem = require("../models/ContentItem");

// ABI for the unified ProofChainVoting contract
const contractABI = [
  "function submitContent(string calldata ipfsHash, uint256 votingDuration) external returns (uint256)",
  "function submitVote(uint256 contentId, uint8 vote, uint8 confidence, uint8 tokenType, uint256 stakeAmount, bytes32[] calldata merkleProof) external payable",
  "function finalizeVoting(uint256 contentId) external",
  "function getContentInfo(uint256 contentId) external view returns (string memory ipfsHash, uint256 submissionTime, uint256 votingDeadline, bool isActive, bool isFinalized, uint256[] memory voteDistribution, uint256 participantCount, uint256 totalUSDValue, uint8 winningOption)",
  "function getUserVote(uint256 contentId, address user) external view returns (bool hasVoted, uint8 vote, uint8 confidence, uint8 tokenType, uint256 stakeAmount, uint256 votingWeight, uint256 timestamp)",
  "function getTokenPriceUSD(uint8 tokenType) public view returns (uint256)",
  "function calculateVotingWeight(uint256 usdValue, uint8 confidence, uint256 bonusMultiplier) public pure returns (uint256)",
  "function addToken(uint8 tokenType, address tokenAddress, address priceOracle, uint8 decimals, uint256 bonusMultiplier, uint256 minStakeAmount) external",
  "event ContentSubmitted(uint256 indexed contentId, string ipfsHash, uint256 votingDeadline, address indexed creator)",
  "event VoteSubmitted(uint256 indexed contentId, address indexed voter, uint8 vote, uint8 confidence, uint8 tokenType, uint256 stakeAmount, uint256 votingWeight)",
  "event VotingFinalized(uint256 indexed contentId, uint8 winningOption, uint256 totalParticipants, uint256 totalUSDValue)",
];

let provider;
let contract;

const createMockContract = () => {
  return {
    submitContent: async () => ({
      wait: async () => ({
        events: [{ event: "ContentSubmitted", args: { contentId: ethers.BigNumber.from(1) } }],
      }),
    }),
    submitVote: async () => ({
      wait: async () => ({ transactionHash: "0x123" }),
    }),
    finalizeVoting: async () => ({
      wait: async () => ({ transactionHash: "0x123" }),
    }),
    getContentInfo: async () => ({
      ipfsHash: "QmTest",
      submissionTime: ethers.BigNumber.from(Date.now() / 1000),
      votingDeadline: ethers.BigNumber.from(Date.now() / 1000 + 3600),
      isActive: true,
      isFinalized: false,
      voteDistribution: [0, 0, 0].map((v) => ethers.BigNumber.from(v)),
      participantCount: ethers.BigNumber.from(0),
      totalUSDValue: ethers.BigNumber.from(0),
      winningOption: 0,
    }),
    getUserVote: async () => ({
      hasVoted: false,
      vote: 0,
      confidence: 0,
      tokenType: 0,
      stakeAmount: ethers.BigNumber.from(0),
      weight: ethers.BigNumber.from(0),
      timestamp: ethers.BigNumber.from(0),
    }),
    getTokenPriceUSD: async () => ethers.BigNumber.from(1000000),
    calculateVotingWeight: async () => ethers.BigNumber.from(1000),
    on: (event, callback) => {
      console.log(`Mock listener registered for ${event}`);
    },
  };
};

/**
 * Initialize blockchain connection
 */
const initializeBlockchain = () => {
  try {
    // Check if blockchain is disabled
    if (process.env.DISABLE_BLOCKCHAIN === "true") {
      console.log("Blockchain disabled. Using mock contract.");
      return { provider: null, contract: createMockContract() };
    }

    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;

    if (!contractAddress) {
      throw new Error("CONTRACT_ADDRESS not set in environment variables");
    }

    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey, provider);
      contract = new ethers.Contract(contractAddress, contractABI, wallet);
    } else {
      contract = new ethers.Contract(contractAddress, contractABI, provider);
    }

    console.log(`Blockchain initialized with contract at ${contractAddress}`);
    return { provider, contract };
  } catch (error) {
    console.error("Failed to initialize blockchain:", error);
    console.log("Falling back to mock contract");
    return { provider: null, contract: createMockContract() };
  }
};

/**
 * Initialize event listeners for blockchain events
 */
const initializeEventListeners = () => {
  try {
    const { contract } = initializeBlockchain();
    
    if (!contract || process.env.DISABLE_BLOCKCHAIN === "true") {
      console.log("Event listeners disabled (using mock contract)");
      return;
    }

    // Listen for ContentSubmitted events
    contract.on(
      "ContentSubmitted",
      async (contentId, ipfsHash, votingDeadline, creator, event) => {
        console.log(`ContentSubmitted event: Content ID ${contentId}`);

        try {
          const contentIdStr = contentId.toString();
          const existingContent = await ContentItem.findOne({
            contentId: contentIdStr,
          });

          if (!existingContent) {
            try {
              const votingDeadlineDate = new Date(votingDeadline.toNumber() * 1000);
              const newContent = new ContentItem({
                contentId: contentIdStr,
                ipfsHash,
                votingDeadline: votingDeadlineDate,
                votingStartTime: new Date(),
                votingEndTime: votingDeadlineDate,
                title: `Content #${contentIdStr}`,
                creator: creator,
                transactionHash: event.transactionHash,
              });

              await newContent.save();
              await clearCacheByPattern("content:list:*");
              console.log(`Content ${contentIdStr} saved to database successfully`);
            } catch (saveError) {
              if (saveError.code === 11000) {
                console.log(`Content ${contentIdStr} already exists in database, skipping save`);
              } else {
                throw saveError;
              }
            }
          } else {
            console.log(`Content ${contentIdStr} already exists in database`);
          }
        } catch (error) {
          console.error(
            `Error processing ContentSubmitted event: ${error.message}`
          );
        }
      }
    );

    // Listen for VoteSubmitted events
    contract.on(
      "VoteSubmitted",
      async (contentId, voter, vote, confidence, tokenType, stakeAmount, votingWeight, event) => {
        console.log(`VoteSubmitted event: Content ID ${contentId}, Voter ${voter}`);
        
        try {
          const content = await ContentItem.findOne({ contentId: contentId.toString() });
          if (content) {
            if (!content.participants.includes(voter.toLowerCase())) {
              content.participants.push(voter.toLowerCase());
              content.participantCount = content.participants.length;
            }
            
            const voteIndex = vote;
            if (voteIndex >= 0 && voteIndex < 3) {
              const currentWeight = BigInt(content.voteDistribution[voteIndex] || "0");
              const newWeight = (currentWeight + BigInt(votingWeight.toString())).toString();
              content.voteDistribution[voteIndex] = newWeight;
            }
            
            await content.save();
            await clearCacheByPattern("content:list:*");
          }
        } catch (error) {
          console.error(`Error processing VoteSubmitted event: ${error.message}`);
        }
      }
    );

    // Listen for VotingFinalized events
    contract.on(
      "VotingFinalized",
      async (contentId, winningOption, totalParticipants, totalUSDValue, event) => {
        console.log(`VotingFinalized event: Content ID ${contentId}, Winner ${winningOption}`);
      }
    );

    console.log("Blockchain event listeners initialized");
  } catch (error) {
    console.error("Failed to initialize event listeners:", error);
  }
};

/**
 * Submit content to the blockchain
 */
const submitContent = async (ipfsHash, votingDuration, signer) => {
  try {
    if (process.env.DISABLE_BLOCKCHAIN === "true") {
      console.log("Blockchain disabled. Returning mock content submission.");
      return { contentId: "1", transactionHash: "0x" + Date.now().toString() };
    }

    const { contract } = initializeBlockchain();
    const contractWithSigner = contract.connect(signer);

    const tx = await contractWithSigner.submitContent(ipfsHash, votingDuration);
    const receipt = await tx.wait();

    const event = receipt.events?.find((e) => e.event === "ContentSubmitted");
    if (!event || !event.args) {
      throw new Error("ContentSubmitted event not found in transaction receipt");
    }
    const contentId = event.args.contentId.toString();

    return { contentId, transactionHash: receipt.transactionHash };
  } catch (error) {
    console.error("Failed to submit content:", error);
    throw error;
  }
};

/**
 * Submit vote on the blockchain
 */
const submitVote = async (
  contentId,
  vote,
  confidence,
  tokenType,
  stakeAmount,
  merkleProof,
  signer
) => {
  try {
    if (process.env.DISABLE_BLOCKCHAIN === "true") {
      console.log("Blockchain disabled. Returning mock vote submission.");
      return { transactionHash: "0x" + Date.now().toString() };
    }

    const { contract } = initializeBlockchain();
    const contractWithSigner = contract.connect(signer);

    const tx = await contractWithSigner.submitVote(
      contentId,
      vote,
      confidence,
      tokenType,
      stakeAmount,
      merkleProof
    );
    const receipt = await tx.wait();

    return { transactionHash: receipt.transactionHash };
  } catch (error) {
    console.error("Failed to submit vote:", error);
    throw error;
  }
};

/**
 * Finalize voting on the blockchain
 */
const finalizeVoting = async (contentId, signer) => {
  try {
    if (process.env.DISABLE_BLOCKCHAIN === "true") {
      console.log("Blockchain disabled. Returning mock finalization.");
      return { transactionHash: "0x" + Date.now().toString() };
    }

    const { contract } = initializeBlockchain();
    const contractWithSigner = contract.connect(signer);

    const tx = await contractWithSigner.finalizeVoting(contentId);
    const receipt = await tx.wait();

    return { transactionHash: receipt.transactionHash };
  } catch (error) {
    console.error("Failed to finalize voting:", error);
    throw error;
  }
};

/**
 * Get content results from the blockchain
 */
const getContentResults = async (contentId) => {
  try {
    const cacheKey = `content:${contentId}:results`;
    const cachedResults = await getCache(cacheKey);
    if (cachedResults) return cachedResults;

    if (process.env.DISABLE_BLOCKCHAIN === "true") {
      console.log("Blockchain disabled. Returning mock results.");
      const mockResults = {
        isFinalized: false,
        winningOption: 0,
        winningOptionName: "REJECT",
        voteDistribution: ["0", "0", "0"],
        totalParticipants: "0",
        totalUSDValue: "0",
      };
      await setCache(cacheKey, mockResults, 3600);
      return mockResults;
    }

    const { contract } = initializeBlockchain();
    const results = await contract.getContentInfo(contentId);

    const formattedResults = {
      ipfsHash: results.ipfsHash,
      submissionTime: results.submissionTime.toString(),
      votingDeadline: results.votingDeadline.toString(),
      isActive: results.isActive,
      isFinalized: results.isFinalized,
      winningOption: results.winningOption,
      winningOptionName: Object.keys(VOTE_OPTIONS).find(
        (key) => VOTE_OPTIONS[key] === results.winningOption
      ) || "REJECT",
      voteDistribution: results.voteDistribution.map((v) => v.toString()),
      totalParticipants: results.participantCount.toString(),
      totalUSDValue: results.totalUSDValue.toString(),
    };

    await setCache(cacheKey, formattedResults, 3600);
    return formattedResults;
  } catch (error) {
    console.error(
      `Failed to get content results for content ID ${contentId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get token price in USD
 */
const getTokenPriceUSD = async (tokenType) => {
  try {
    if (process.env.DISABLE_BLOCKCHAIN === "true") {
      return "1000000"; // Mock price: $1000 with 6 decimals
    }

    const { contract } = initializeBlockchain();
    const price = await contract.getTokenPriceUSD(tokenType);
    return price.toString();
  } catch (error) {
    console.error("Failed to get token price:", error);
    throw error;
  }
};

module.exports = {
  initializeBlockchain,
  initializeEventListeners,
  submitContent,
  submitVote,
  finalizeVoting,
  getContentResults,
  getTokenPriceUSD,
  // Legacy exports for backward compatibility
  finalizeMultiTokenVoting: finalizeVoting,
  getMultiTokenResults: getContentResults,
};