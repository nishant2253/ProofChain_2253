import { ethers } from "ethers";

// ABI for the unified ProofChainVoting contract
const CONTRACT_ABI = [
  "function submitContent(string calldata ipfsHash, uint256 votingDuration) external returns (uint256)",
  "function submitVote(uint256 contentId, uint8 vote, uint8 confidence, uint8 tokenType, uint256 stakeAmount, bytes32[] calldata merkleProof) external payable",
  "function finalizeVoting(uint256 contentId) external",
  "function getContentInfo(uint256 contentId) external view returns (string memory ipfsHash, uint256 submissionTime, uint256 votingDeadline, bool isActive, bool isFinalized, uint256[] memory voteDistribution, uint256 participantCount, uint256 totalUSDValue, uint8 winningOption)",
  "function getUserVote(uint256 contentId, address user) external view returns (bool hasVoted, uint8 vote, uint8 confidence, uint8 tokenType, uint256 stakeAmount, uint256 votingWeight, uint256 timestamp)",
  "function getTokenPriceUSD(uint8 tokenType) public view returns (uint256)",
  "function calculateVotingWeight(uint256 usdValue, uint8 confidence, uint256 bonusMultiplier) public pure returns (uint256)",
  "event ContentSubmitted(uint256 indexed contentId, string ipfsHash, uint256 votingDeadline, address indexed creator)",
  "event VoteSubmitted(uint256 indexed contentId, address indexed voter, uint8 vote, uint8 confidence, uint8 tokenType, uint256 stakeAmount, uint256 votingWeight)",
  "event VotingFinalized(uint256 indexed contentId, uint8 winningOption, uint256 totalParticipants, uint256 totalUSDValue)",
];

// Get contract address from environment variables
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const getContract = (signerOrProvider) => {
  if (!CONTRACT_ADDRESS) {
    console.error("Contract address not defined in environment variables");
    throw new Error("Contract address not defined in environment variables");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

export const generateCommitHash = (vote, confidence, salt, address, tokenType) => {
  // Ensure salt is a proper bytes32 value
  let saltBytes32;
  if (typeof salt === 'string' && salt.startsWith('0x') && salt.length === 66) {
    // Already a 32-byte hex string
    saltBytes32 = salt;
  } else {
    // Hash the salt to get a proper bytes32 value
    saltBytes32 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(salt.toString()));
  }
  
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["uint8", "uint256", "bytes32", "address", "uint8"],
    [vote, confidence, saltBytes32, address, tokenType]
  );
  return ethers.utils.keccak256(encoded);
};

export const generateRandomSalt = () => {
  return ethers.utils.hexlify(ethers.utils.randomBytes(32));
};

// Submit vote with token staking to blockchain
export const submitVoteToBlockchain = async (signer, contentId, vote, tokenType, stakeAmount, confidence) => {
  try {
    const contract = getContract(signer);
    
    console.log("Submitting vote to blockchain:", {
      contentId,
      vote,
      confidence,
      tokenType,
      stakeAmount,
      contractAddress: contract.address
    });

    // Convert stake amount to wei for ETH (tokenType 1)
    let stakeAmountWei;
    if (tokenType === 1) { // ETH
      stakeAmountWei = ethers.utils.parseEther(stakeAmount.toString());
    } else {
      // For other tokens, you might need different conversion
      stakeAmountWei = ethers.utils.parseUnits(stakeAmount.toString(), 18);
    }

    // Empty merkle proof for now (identity verification can be added later)
    const merkleProof = [];

    // For ETH, we need to send value with the transaction
    const txOptions = {};
    if (tokenType === 1) { // ETH
      txOptions.value = stakeAmountWei;
    }

    const tx = await contract.submitVote(
      contentId,
      vote,
      confidence,
      tokenType,
      stakeAmountWei,
      merkleProof,
      txOptions
    );
    
    console.log("Vote transaction submitted:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Vote transaction confirmed:", receipt);
    
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error("Blockchain vote submission error:", error);
    throw error;
  }
};