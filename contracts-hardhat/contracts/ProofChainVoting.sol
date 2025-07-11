// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ProofChainVoting
 * @dev A simplified voting contract with token staking and quadratic voting
 * Features:
 * - Simple direct voting (no commit-reveal)
 * - Multiple token support (ETH, ERC20 tokens)
 * - Quadratic voting based on USD value
 * - Identity verification via Merkle proofs
 * - Configurable voting periods (1 minute to 7 days)
 */
contract ProofChainVoting is Ownable, ReentrancyGuard {
    
    // ============ ENUMS ============
    
    enum VoteOption { REJECT, APPROVE, ABSTAIN }
    enum TokenType { NONE, ETH, FIL, USDC, USDT, DAI, WBTC, LINK, UNI }
    
    // ============ STRUCTS ============
    
    struct TokenInfo {
        address tokenAddress;      // Token contract address (0x0 for ETH)
        address priceOracle;       // Chainlink price oracle address
        uint8 decimals;           // Token decimals
        uint256 bonusMultiplier;  // Bonus multiplier (1000 = 100%)
        uint256 minStakeAmount;   // Minimum stake amount
        bool isActive;            // Whether token is active for voting
    }
    
    struct ContentInfo {
        string ipfsHash;          // IPFS hash of content
        uint256 submissionTime;   // When content was submitted
        uint256 votingDeadline;   // When voting ends
        address creator;          // Content creator
        bool isActive;            // Whether voting is active
        bool isFinalized;         // Whether voting is finalized
        uint256[3] voteDistribution; // [REJECT, APPROVE, ABSTAIN] counts
        uint256 participantCount; // Total number of voters
        uint256 totalUSDValue;    // Total USD value staked
        VoteOption winningOption; // Winning vote option
    }
    
    struct UserVote {
        bool hasVoted;            // Whether user has voted
        VoteOption vote;          // User's vote choice
        uint8 confidence;         // Confidence level (1-10)
        TokenType tokenType;      // Token used for staking
        uint256 stakeAmount;      // Amount staked
        uint256 votingWeight;     // Calculated voting weight
        uint256 timestamp;        // When vote was cast
    }
    
    // ============ STATE VARIABLES ============
    
    bytes32 public merkleRoot;                    // Merkle root for identity verification
    uint256 public contentCounter;                // Counter for content IDs
    uint256 public constant MIN_VOTING_PERIOD = 1 minutes;  // Minimum voting period
    uint256 public constant MAX_VOTING_PERIOD = 7 days;     // Maximum voting period
    
    // Mappings
    mapping(TokenType => TokenInfo) public supportedTokens;
    mapping(uint256 => ContentInfo) public contents;
    mapping(uint256 => mapping(address => UserVote)) public userVotes;
    
    // ============ EVENTS ============
    
    event ContentSubmitted(
        uint256 indexed contentId,
        string ipfsHash,
        uint256 votingDeadline,
        address indexed creator
    );
    
    event VoteSubmitted(
        uint256 indexed contentId,
        address indexed voter,
        VoteOption vote,
        uint8 confidence,
        TokenType tokenType,
        uint256 stakeAmount,
        uint256 votingWeight
    );
    
    event VotingFinalized(
        uint256 indexed contentId,
        VoteOption winningOption,
        uint256 totalParticipants,
        uint256 totalUSDValue
    );
    
    event TokenAdded(
        TokenType indexed tokenType,
        address tokenAddress,
        address priceOracle
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
        contentCounter = 0;
    }
    
    // ============ CONTENT SUBMISSION ============
    
    /**
     * @dev Submit content for voting
     * @param ipfsHash IPFS hash of the content
     * @param votingDuration Duration of voting period in seconds
     * @return contentId The ID of the submitted content
     */
    function submitContent(
        string calldata ipfsHash,
        uint256 votingDuration
    ) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(
            votingDuration >= MIN_VOTING_PERIOD && votingDuration <= MAX_VOTING_PERIOD,
            "Invalid voting duration"
        );
        
        contentCounter++;
        uint256 contentId = contentCounter;
        uint256 votingDeadline = block.timestamp + votingDuration;
        
        contents[contentId] = ContentInfo({
            ipfsHash: ipfsHash,
            submissionTime: block.timestamp,
            votingDeadline: votingDeadline,
            creator: msg.sender,
            isActive: true,
            isFinalized: false,
            voteDistribution: [uint256(0), uint256(0), uint256(0)],
            participantCount: 0,
            totalUSDValue: 0,
            winningOption: VoteOption.REJECT
        });
        
        emit ContentSubmitted(contentId, ipfsHash, votingDeadline, msg.sender);
        return contentId;
    }
    
    // ============ VOTING ============
    
    /**
     * @dev Submit a vote on content
     * @param contentId ID of the content to vote on
     * @param vote Vote choice (REJECT, APPROVE, ABSTAIN)
     * @param confidence Confidence level (1-10)
     * @param tokenType Type of token to stake
     * @param stakeAmount Amount of tokens to stake
     * @param merkleProof Merkle proof for identity verification
     */
    function submitVote(
        uint256 contentId,
        VoteOption vote,
        uint8 confidence,
        TokenType tokenType,
        uint256 stakeAmount,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant {
        ContentInfo storage content = contents[contentId];
        require(content.isActive, "Content not found or inactive");
        require(block.timestamp <= content.votingDeadline, "Voting period ended");
        require(!userVotes[contentId][msg.sender].hasVoted, "Already voted");
        require(confidence >= 1 && confidence <= 10, "Invalid confidence level");
        require(supportedTokens[tokenType].isActive, "Token not supported");
        require(stakeAmount >= supportedTokens[tokenType].minStakeAmount, "Stake amount too low");
        
        // Verify identity if merkle proof provided
        if (merkleProof.length > 0) {
            require(isVerifiedIdentity(msg.sender, merkleProof), "Invalid identity proof");
        }
        
        // Handle token staking
        if (tokenType == TokenType.ETH) {
            require(msg.value == stakeAmount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not expected for ERC20 tokens");
            TokenInfo memory tokenInfo = supportedTokens[tokenType];
            IERC20(tokenInfo.tokenAddress).transferFrom(msg.sender, address(this), stakeAmount);
        }
        
        // Calculate voting weight
        uint256 usdValue = convertToUSD(tokenType, stakeAmount);
        uint256 bonusMultiplier = supportedTokens[tokenType].bonusMultiplier;
        uint256 votingWeight = calculateVotingWeight(usdValue, confidence, bonusMultiplier);
        
        // Record vote
        userVotes[contentId][msg.sender] = UserVote({
            hasVoted: true,
            vote: vote,
            confidence: confidence,
            tokenType: tokenType,
            stakeAmount: stakeAmount,
            votingWeight: votingWeight,
            timestamp: block.timestamp
        });
        
        // Update content statistics
        content.voteDistribution[uint256(vote)] += votingWeight;
        content.participantCount++;
        content.totalUSDValue += usdValue;
        
        emit VoteSubmitted(contentId, msg.sender, vote, confidence, tokenType, stakeAmount, votingWeight);
    }
    
    // ============ FINALIZATION ============
    
    /**
     * @dev Finalize voting for a content item
     * @param contentId ID of the content to finalize
     */
    function finalizeVoting(uint256 contentId) external {
        ContentInfo storage content = contents[contentId];
        require(content.isActive, "Content not found or inactive");
        require(block.timestamp > content.votingDeadline, "Voting period not ended");
        require(!content.isFinalized, "Already finalized");
        
        // Determine winning option
        VoteOption winningOption = VoteOption.REJECT;
        uint256 maxVotes = content.voteDistribution[0]; // REJECT
        
        if (content.voteDistribution[1] > maxVotes) { // APPROVE
            winningOption = VoteOption.APPROVE;
            maxVotes = content.voteDistribution[1];
        }
        
        if (content.voteDistribution[2] > maxVotes) { // ABSTAIN
            winningOption = VoteOption.ABSTAIN;
        }
        
        content.winningOption = winningOption;
        content.isFinalized = true;
        content.isActive = false;
        
        emit VotingFinalized(contentId, winningOption, content.participantCount, content.totalUSDValue);
    }
    
    // ============ TOKEN MANAGEMENT ============
    
    /**
     * @dev Add a new supported token
     * @param tokenType Type of token to add
     * @param tokenAddress Contract address of the token (0x0 for ETH)
     * @param priceOracle Chainlink price oracle address
     * @param decimals Number of decimals for the token
     * @param bonusMultiplier Bonus multiplier for this token (1000 = 100%)
     * @param minStakeAmount Minimum stake amount for this token
     */
    function addToken(
        TokenType tokenType,
        address tokenAddress,
        address priceOracle,
        uint8 decimals,
        uint256 bonusMultiplier,
        uint256 minStakeAmount
    ) external onlyOwner {
        require(tokenType != TokenType.NONE, "Invalid token type");
        require(priceOracle != address(0), "Invalid price oracle");
        
        supportedTokens[tokenType] = TokenInfo({
            tokenAddress: tokenAddress,
            priceOracle: priceOracle,
            decimals: decimals,
            bonusMultiplier: bonusMultiplier,
            minStakeAmount: minStakeAmount,
            isActive: true
        });
        
        emit TokenAdded(tokenType, tokenAddress, priceOracle);
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Get token price in USD from Chainlink oracle
     * @param tokenType Type of token
     * @return price Price in USD with 8 decimals
     */
    function getTokenPriceUSD(TokenType tokenType) public view returns (uint256) {
        require(supportedTokens[tokenType].isActive, "Token not supported");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            supportedTokens[tokenType].priceOracle
        );
        
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        
        return uint256(price);
    }
    
    /**
     * @dev Convert token amount to USD value
     * @param tokenType Type of token
     * @param tokenAmount Amount of tokens
     * @return usdValue USD value with 8 decimals
     */
    function convertToUSD(TokenType tokenType, uint256 tokenAmount) public view returns (uint256) {
        uint256 priceUSD = getTokenPriceUSD(tokenType);
        uint8 tokenDecimals = supportedTokens[tokenType].decimals;
        
        // Convert to USD: (tokenAmount * priceUSD) / (10^tokenDecimals)
        return (tokenAmount * priceUSD) / (10 ** tokenDecimals);
    }
    
    /**
     * @dev Calculate voting weight using quadratic formula
     * @param usdValue USD value of stake
     * @param confidence Confidence level (1-10)
     * @param bonusMultiplier Bonus multiplier for token type
     * @return weight Calculated voting weight
     */
    function calculateVotingWeight(
        uint256 usdValue,
        uint8 confidence,
        uint256 bonusMultiplier
    ) public pure returns (uint256) {
        // Quadratic voting: weight = sqrt(usdValue) * confidence * bonusMultiplier / 1000
        uint256 sqrtUSD = sqrt(usdValue);
        return (sqrtUSD * confidence * bonusMultiplier) / 1000;
    }
    
    /**
     * @dev Verify user identity using Merkle proof
     * @param user User address
     * @param merkleProof Merkle proof
     * @return isVerified Whether identity is verified
     */
    function isVerifiedIdentity(
        address user,
        bytes32[] calldata merkleProof
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(user));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
    /**
     * @dev Get complete content information
     * @param contentId ID of the content
     * @return ipfsHash IPFS hash of the content
     * @return submissionTime When content was submitted
     * @return votingDeadline When voting ends
     * @return isActive Whether voting is active
     * @return isFinalized Whether voting is finalized
     * @return voteDistribution Array of vote counts [REJECT, APPROVE, ABSTAIN]
     * @return participantCount Total number of voters
     * @return totalUSDValue Total USD value staked
     * @return winningOption Winning vote option
     */
    function getContentInfo(uint256 contentId) external view returns (
        string memory ipfsHash,
        uint256 submissionTime,
        uint256 votingDeadline,
        bool isActive,
        bool isFinalized,
        uint256[] memory voteDistribution,
        uint256 participantCount,
        uint256 totalUSDValue,
        VoteOption winningOption
    ) {
        ContentInfo memory content = contents[contentId];
        uint256[] memory distribution = new uint256[](3);
        distribution[0] = content.voteDistribution[0];
        distribution[1] = content.voteDistribution[1];
        distribution[2] = content.voteDistribution[2];
        
        return (
            content.ipfsHash,
            content.submissionTime,
            content.votingDeadline,
            content.isActive,
            content.isFinalized,
            distribution,
            content.participantCount,
            content.totalUSDValue,
            content.winningOption
        );
    }
    
    /**
     * @dev Get user's vote for specific content
     * @param contentId ID of the content
     * @param user User address
     * @return hasVoted Whether user has voted
     * @return vote User's vote choice
     * @return confidence Confidence level (1-10)
     * @return tokenType Token used for staking
     * @return stakeAmount Amount staked
     * @return votingWeight Calculated voting weight
     * @return timestamp When vote was cast
     */
    function getUserVote(uint256 contentId, address user) external view returns (
        bool hasVoted,
        VoteOption vote,
        uint8 confidence,
        TokenType tokenType,
        uint256 stakeAmount,
        uint256 votingWeight,
        uint256 timestamp
    ) {
        UserVote memory userVote = userVotes[contentId][user];
        return (
            userVote.hasVoted,
            userVote.vote,
            userVote.confidence,
            userVote.tokenType,
            userVote.stakeAmount,
            userVote.votingWeight,
            userVote.timestamp
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update merkle root for identity verification
     * @param newMerkleRoot New merkle root
     */
    function updateMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
    }
    
    /**
     * @dev Deactivate a token
     * @param tokenType Type of token to deactivate
     */
    function deactivateToken(TokenType tokenType) external onlyOwner {
        supportedTokens[tokenType].isActive = false;
    }
    
    /**
     * @dev Emergency withdraw function for owner
     * @param tokenType Type of token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(TokenType tokenType, uint256 amount) external onlyOwner {
        if (tokenType == TokenType.ETH) {
            payable(owner()).transfer(amount);
        } else {
            TokenInfo memory tokenInfo = supportedTokens[tokenType];
            IERC20(tokenInfo.tokenAddress).transfer(owner(), amount);
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calculate square root using Babylonian method
     * @param x Number to calculate square root of
     * @return y Square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}