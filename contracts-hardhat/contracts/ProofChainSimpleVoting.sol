// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title IERC20
 * @dev Minimal interface for ERC20 token interaction.
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ProofChainSimpleVoting
 * @dev Simplified DAO voting system with multi-token support (no commit-reveal)
 * KEY FEATURES:
 * 1. Direct Voting: Single-step voting process for better UX
 * 2. Multi-Token Support: Vote with BTC, ETH, USDFC, MATIC, FIL, USDC, USDT, DOT, SOL
 * 3. Quadratic Voting: Mitigates whale dominance using USD-based quadratic cost function
 * 4. Anti-Sybil Protection: Uses merkle proofs for identity validation
 * 5. Price Oracle Integration: Real-time USD conversion for fair cross-token voting
 */
contract ProofChainSimpleVoting is ReentrancyGuard, Ownable {
    
    // ==================== ENUMS & CONSTANTS ====================
    
    enum TokenType { BTC, ETH, USDFC, MATIC, FIL, USDC, USDT, DOT, SOL }
    enum VoteOption { REJECT, ACCEPT, ABSTAIN }
    
    // ==================== STRUCTS ====================
    
    struct SupportedToken {
        address tokenAddress;           // Contract address for the token
        AggregatorV3Interface priceOracle; // Chainlink price feed
        uint8 decimals;                // Token decimals
        bool isActive;                 // Whether token is currently supported
        uint256 bonusMultiplier;       // Bonus multiplier (1000 = 100%, 1200 = 120%)
        uint256 minStakeAmount;        // Minimum stake required for this token
    }
    
    struct ContentItem {
        string ipfsHash;               // IPFS hash of content
        uint256 submissionTime;        // When content was submitted
        uint256 votingDeadline;        // When voting period ends
        mapping(TokenType => uint256) totalStakedByToken; // Total staked per token type
        uint256 totalUSDValue;         // Total USD value of all stakes
        bool isActive;                 // Whether voting is active
        bool isFinalized;              // Whether results are finalized
        mapping(address => VoteInfo) votes;
        uint256[] voteDistribution;    // [reject_votes, accept_votes, abstain_votes] (weighted)
        uint256 participantCount;
        address[] participants;        // Array of all participants for reward distribution
        VoteOption winningOption;      // Final result
    }
    
    struct VoteInfo {
        VoteOption vote;               // User's vote choice
        uint8 confidence;              // Confidence level (1-10)
        TokenType tokenType;           // Token used for staking
        uint256 stakeAmount;           // Amount staked
        uint256 usdValue;              // USD value at time of vote
        uint256 weight;                // Calculated voting weight
        bool hasVoted;                 // Whether user has voted
        uint256 timestamp;             // When vote was cast
    }
    
    // ==================== STATE VARIABLES ====================
    
    mapping(TokenType => SupportedToken) public supportedTokens;
    mapping(uint256 => ContentItem) public contentItems;
    mapping(bytes32 => bool) public usedMerkleLeaves;
    
    uint256 public nextContentId = 1;
    uint256 public defaultVotingDuration = 24 hours;
    uint256 public minimumStakeUSD = 10; // $10 minimum stake
    bytes32 public merkleRoot;
    
    // ==================== EVENTS ====================
    
    event ContentSubmitted(uint256 indexed contentId, string ipfsHash, uint256 votingDeadline, address indexed creator);
    event VoteSubmitted(uint256 indexed contentId, address indexed voter, VoteOption vote, uint8 confidence, TokenType tokenType, uint256 stakeAmount, uint256 weight);
    event VotingFinalized(uint256 indexed contentId, VoteOption winningOption, uint256 totalParticipants, uint256 totalUSDValue);
    event TokenAdded(TokenType indexed tokenType, address tokenAddress, address priceOracle);
    event TokenUpdated(TokenType indexed tokenType, bool isActive, uint256 bonusMultiplier);
    
    // ==================== MODIFIERS ====================
    
    modifier validContentId(uint256 contentId) {
        require(contentId > 0 && contentId < nextContentId, "Invalid content ID");
        _;
    }
    
    modifier votingActive(uint256 contentId) {
        ContentItem storage item = contentItems[contentId];
        require(item.isActive, "Voting not active");
        require(block.timestamp <= item.votingDeadline, "Voting period ended");
        require(!item.isFinalized, "Voting already finalized");
        _;
    }
    
    modifier hasNotVoted(uint256 contentId) {
        require(!contentItems[contentId].votes[msg.sender].hasVoted, "Already voted");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }
    
    // ==================== CONTENT SUBMISSION ====================
    
    function submitContent(
        string calldata ipfsHash,
        uint256 votingDuration
    ) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        if (votingDuration == 0) {
            votingDuration = defaultVotingDuration;
        }
        require(votingDuration >= 1 minutes && votingDuration <= 7 days, "Invalid voting duration");
        
        uint256 contentId = nextContentId++;
        ContentItem storage item = contentItems[contentId];
        
        item.ipfsHash = ipfsHash;
        item.submissionTime = block.timestamp;
        item.votingDeadline = block.timestamp + votingDuration;
        item.isActive = true;
        item.voteDistribution = new uint256[](3); // [reject, accept, abstain]
        
        emit ContentSubmitted(contentId, ipfsHash, item.votingDeadline, msg.sender);
        return contentId;
    }
    
    // ==================== VOTING ====================
    
    function submitVote(
        uint256 contentId,
        VoteOption vote,
        uint8 confidence,
        TokenType tokenType,
        uint256 stakeAmount,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant validContentId(contentId) votingActive(contentId) hasNotVoted(contentId) {
        
        require(confidence >= 1 && confidence <= 10, "Confidence must be 1-10");
        require(uint8(vote) <= 2, "Invalid vote option");
        
        // Verify identity using merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid identity proof");
        require(!usedMerkleLeaves[leaf], "Identity already used");
        
        SupportedToken storage token = supportedTokens[tokenType];
        require(token.isActive, "Token not supported");
        require(stakeAmount >= token.minStakeAmount, "Stake below minimum");
        
        // Handle token transfer
        uint256 usdValue;
        if (tokenType == TokenType.ETH) {
            require(msg.value == stakeAmount, "Incorrect ETH amount");
            usdValue = getTokenPriceUSD(tokenType) * stakeAmount / (10 ** token.decimals);
        } else {
            require(msg.value == 0, "ETH not required for token stake");
            IERC20(token.tokenAddress).transferFrom(msg.sender, address(this), stakeAmount);
            usdValue = getTokenPriceUSD(tokenType) * stakeAmount / (10 ** token.decimals);
        }
        
        require(usdValue >= minimumStakeUSD, "Stake below minimum USD value");
        
        // Calculate voting weight (quadratic voting based on USD value)
        uint256 weight = calculateVotingWeight(usdValue, confidence, token.bonusMultiplier);
        
        // Store vote
        ContentItem storage item = contentItems[contentId];
        VoteInfo storage voteInfo = item.votes[msg.sender];
        
        voteInfo.vote = vote;
        voteInfo.confidence = confidence;
        voteInfo.tokenType = tokenType;
        voteInfo.stakeAmount = stakeAmount;
        voteInfo.usdValue = usdValue;
        voteInfo.weight = weight;
        voteInfo.hasVoted = true;
        voteInfo.timestamp = block.timestamp;
        
        // Update aggregates
        item.voteDistribution[uint8(vote)] += weight;
        item.totalStakedByToken[tokenType] += stakeAmount;
        item.totalUSDValue += usdValue;
        item.participants.push(msg.sender);
        item.participantCount++;
        
        // Mark identity as used
        usedMerkleLeaves[leaf] = true;
        
        emit VoteSubmitted(contentId, msg.sender, vote, confidence, tokenType, stakeAmount, weight);
    }
    
    // ==================== FINALIZATION ====================
    
    function finalizeVoting(uint256 contentId) external validContentId(contentId) {
        ContentItem storage item = contentItems[contentId];
        require(block.timestamp > item.votingDeadline, "Voting period not ended");
        require(!item.isFinalized, "Already finalized");
        
        // Determine winning option
        uint256 maxVotes = 0;
        VoteOption winningOption = VoteOption.REJECT;
        
        for (uint8 i = 0; i < 3; i++) {
            if (item.voteDistribution[i] > maxVotes) {
                maxVotes = item.voteDistribution[i];
                winningOption = VoteOption(i);
            }
        }
        
        item.winningOption = winningOption;
        item.isFinalized = true;
        item.isActive = false;
        
        emit VotingFinalized(contentId, winningOption, item.participantCount, item.totalUSDValue);
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    function getContentInfo(uint256 contentId) external view validContentId(contentId) returns (
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
        ContentItem storage item = contentItems[contentId];
        return (
            item.ipfsHash,
            item.submissionTime,
            item.votingDeadline,
            item.isActive,
            item.isFinalized,
            item.voteDistribution,
            item.participantCount,
            item.totalUSDValue,
            item.winningOption
        );
    }
    
    function getUserVote(uint256 contentId, address user) external view validContentId(contentId) returns (
        bool hasVoted,
        VoteOption vote,
        uint8 confidence,
        TokenType tokenType,
        uint256 stakeAmount,
        uint256 weight,
        uint256 timestamp
    ) {
        VoteInfo storage voteInfo = contentItems[contentId].votes[user];
        return (
            voteInfo.hasVoted,
            voteInfo.vote,
            voteInfo.confidence,
            voteInfo.tokenType,
            voteInfo.stakeAmount,
            voteInfo.weight,
            voteInfo.timestamp
        );
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    function calculateVotingWeight(uint256 usdValue, uint8 confidence, uint256 bonusMultiplier) public pure returns (uint256) {
        // Quadratic voting: weight = sqrt(usdValue) * confidence * bonus
        uint256 baseWeight = sqrt(usdValue);
        uint256 confidenceWeight = baseWeight * confidence / 10;
        return confidenceWeight * bonusMultiplier / 1000;
    }
    
    function getTokenPriceUSD(TokenType tokenType) public view returns (uint256) {
        SupportedToken storage token = supportedTokens[tokenType];
        require(address(token.priceOracle) != address(0), "Price oracle not set");
        
        (, int256 price, , , ) = token.priceOracle.latestRoundData();
        require(price > 0, "Invalid price");
        
        return uint256(price);
    }
    
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    function addToken(
        TokenType tokenType,
        address tokenAddress,
        address priceOracle,
        uint8 decimals,
        uint256 bonusMultiplier,
        uint256 minStakeAmount
    ) external onlyOwner {
        SupportedToken storage token = supportedTokens[tokenType];
        token.tokenAddress = tokenAddress;
        token.priceOracle = AggregatorV3Interface(priceOracle);
        token.decimals = decimals;
        token.isActive = true;
        token.bonusMultiplier = bonusMultiplier;
        token.minStakeAmount = minStakeAmount;
        
        emit TokenAdded(tokenType, tokenAddress, priceOracle);
    }
    
    function updateToken(TokenType tokenType, bool isActive, uint256 bonusMultiplier) external onlyOwner {
        supportedTokens[tokenType].isActive = isActive;
        supportedTokens[tokenType].bonusMultiplier = bonusMultiplier;
        
        emit TokenUpdated(tokenType, isActive, bonusMultiplier);
    }
    
    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
    
    function setDefaultVotingDuration(uint256 _duration) external onlyOwner {
        require(_duration >= 1 hours && _duration <= 7 days, "Invalid duration");
        defaultVotingDuration = _duration;
    }
}