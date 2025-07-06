import { ethers } from "ethers";

// ABI for the ProofChainMultiTokenVoting contract
// This is a minimal ABI containing only the functions we need to interact with
const CONTRACT_ABI = [
  "function commitMultiTokenVote(uint256 contentId, bytes32 commitHash, uint8 tokenType, uint256 stakeAmount, bytes32[] calldata merkleProof) external payable",
  "function revealMultiTokenVote(uint256 contentId, uint8 vote, uint256 confidence, uint256 salt) external",
  "function finalizeMultiTokenVoting(uint256 contentId) external",
  "function submitContent(string calldata ipfsHash, uint256 votingDuration) external returns (uint256 contentId)",
  "function getTokenPriceUSD(uint8 tokenType) public view returns (uint256)",
  "function convertToUSD(uint8 tokenType, uint256 tokenAmount) public view returns (uint256)",
  "function calculateQuadraticWeightUSD(uint256 usdValue) public pure returns (uint256)",
  "function isVerifiedIdentity(address user, bytes32[] calldata merkleProof) public view returns (bool)",
  "event ContentSubmitted(uint256 indexed contentId, string ipfsHash, uint256 commitDeadline, uint256 revealDeadline)",
  "event MultiTokenVoteCommitted(uint256 indexed contentId, address indexed voter, uint8 tokenType, uint256 stakeAmount, uint256 usdValue)",
  "event MultiTokenVoteRevealed(uint256 indexed contentId, address indexed voter, uint8 vote, uint256 confidence, uint256 quadraticWeight)",
  "event VotingFinalized(uint256 indexed contentId, uint8 winningOption, uint256 totalParticipants, uint256 totalUSDStaked)",
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