const asyncHandler = require("express-async-handler");
const {
  createOrUpdateUser,
  getUserProfile,
  verifyUserIdentity,
  generateToken,
  getUserVotingHistory,
  getUserReputationHistory,
} = require("../services/userService");

/**
 * @desc    Register or update user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { address, signature, userData } = req.body;

  if (!address) {
    res.status(400);
    throw new Error("Address is required");
  }

  // In a real implementation, verify the signature to ensure the user owns the address
  // This is simplified for the demo

  const user = await createOrUpdateUser(address, userData);

  // Generate JWT token
  const token = await generateToken(address);

  res.status(201).json({
    user,
    token,
  });
});

/**
 * @desc    Get user profile
 * @route   GET /api/users/:address
 * @access  Public
 */
const getUserProfileById = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { getUserProfile, createOrUpdateUser } = require("../services/userService");

  // Clean and validate address
  const cleanedAddress = address.toLowerCase().trim();
  
  // Validate Ethereum address format
  if (!cleanedAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    res.status(400);
    throw new Error(`Invalid Ethereum address format: ${address}`);
  }

  const user = await getUserProfile(cleanedAddress);

  if (!user) {
    // Instead of throwing an error, create a default profile for new users
    const defaultUser = {
      address: cleanedAddress,
      username: `User_${cleanedAddress.slice(-6)}`,
      email: null,
      bio: null,
      profileImageUrl: null,
      reputationScore: 0,
      isVerified: false,
      joinedAt: new Date(),
      lastActive: new Date(),
    };
    
    // Create the user profile in the database
    const createdUser = await createOrUpdateUser(cleanedAddress, defaultUser);
    return res.json(createdUser);
  }

  res.json(user);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.address);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { username, email, bio, profileImageUrl } = req.body;

  const userData = {
    username,
    email,
    bio,
    profileImageUrl,
  };

  const user = await createOrUpdateUser(req.user.address, userData);

  res.json(user);
});

/**
 * @desc    Verify user identity
 * @route   POST /api/users/verify
 * @access  Private
 */
const verifyIdentity = asyncHandler(async (req, res) => {
  const { merkleProof } = req.body;

  if (!merkleProof || !Array.isArray(merkleProof)) {
    res.status(400);
    throw new Error("Valid merkle proof array is required");
  }

  const isVerified = await verifyUserIdentity(req.user.address, merkleProof);

  if (!isVerified) {
    res.status(400);
    throw new Error("Identity verification failed");
  }

  // Get updated user profile
  const user = await getUserProfile(req.user.address);

  res.json({
    success: true,
    isVerified,
    user,
  });
});

/**
 * @desc    Get user voting history
 * @route   GET /api/users/me/votes
 * @access  Private
 */
const getMyVotingHistory = asyncHandler(async (req, res) => {
  const votingHistory = await getUserVotingHistory(req.user.address);

  res.json(votingHistory);
});

/**
 * @desc    Get user voting history by address
 * @route   GET /api/users/:address/votes
 * @access  Public
 */
const getUserVotingHistoryById = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const votingHistory = await getUserVotingHistory(address);

  res.json(votingHistory);
});

/**
 * @desc    Get user reputation history
 * @route   GET /api/users/me/reputation-history
 * @access  Private
 */
const getMyReputationHistory = asyncHandler(async (req, res) => {
  const reputationHistory = await getUserReputationHistory(req.user.address);

  res.json(reputationHistory);
});

/**
 * @desc    Get user reputation history by address
 * @route   GET /api/users/:address/reputation-history
 * @access  Public
 */
const getUserReputationHistoryById = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const reputationHistory = await getUserReputationHistory(address);

  res.json(reputationHistory);
});

/**
 * @desc    Get user's submitted content with consensus data
 * @route   GET /api/users/:address/content
 * @access  Public
 */
const getUserContent = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const ContentItem = require("../models/ContentItem");

  // Clean and validate address
  const cleanedAddress = address.toLowerCase().trim();
  
  // Validate Ethereum address format
  if (!cleanedAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    res.status(400);
    throw new Error(`Invalid Ethereum address format: ${address}`);
  }

  console.log(`Fetching content for address: ${cleanedAddress}`);

  try {
    // Get all content submitted by this user
    const userContent = await ContentItem.find({ creator: cleanedAddress })
      .sort({ createdAt: -1 })
      .lean();

    // Add consensus data and reward eligibility for each content
    const contentWithConsensus = userContent.map(content => {
      const now = new Date();
      const votingEndTime = content.votingEndTime || content.votingDeadline;
      const timeSinceEnd = votingEndTime ? now - new Date(votingEndTime) : 0;
      const hoursElapsed = timeSinceEnd / (1000 * 60 * 60);
      
      // Check if 48 hours have passed since voting ended
      const canClaimReward = content.isFinalized && hoursElapsed >= 48;
      
      return {
        ...content,
        consensusData: {
          totalVotes: content.votes?.length || 0,
          upvotes: content.upvotes || 0,
          downvotes: content.downvotes || 0,
          participantCount: content.participantCount || 0,
          totalUSDValue: content.totalUSDValue || "0",
          winningOption: content.winningOption,
          isFinalized: content.isFinalized || false,
          status: content.status || (content.isFinalized ? "finalized" : "live"),
        },
        rewardInfo: {
          canClaimReward,
          hoursUntilClaim: canClaimReward ? 0 : Math.max(0, 48 - hoursElapsed),
          estimatedReward: calculateEstimatedReward(content),
          hasClaimedReward: content.hasClaimedReward || false,
        }
      };
    });

    res.json(contentWithConsensus);
  } catch (error) {
    console.error("Error fetching user content:", error);
    res.status(500);
    throw new Error("Failed to fetch user content");
  }
});

/**
 * @desc    Get my submitted content with consensus data
 * @route   GET /api/users/me/content
 * @access  Private
 */
const getMyContent = asyncHandler(async (req, res) => {
  const address = req.user.address;
  req.params.address = address;
  return getUserContent(req, res);
});

/**
 * @desc    Claim reward for finalized content
 * @route   POST /api/users/me/content/:contentId/claim-reward
 * @access  Private
 */
const claimContentReward = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const userAddress = req.user.address;
  const ContentItem = require("../models/ContentItem");

  try {
    const content = await ContentItem.findOne({ 
      contentId: parseInt(contentId),
      creator: userAddress.toLowerCase() 
    });

    if (!content) {
      res.status(404);
      throw new Error("Content not found or you are not the creator");
    }

    if (!content.isFinalized) {
      res.status(400);
      throw new Error("Content voting is not yet finalized");
    }

    if (content.hasClaimedReward) {
      res.status(400);
      throw new Error("Reward has already been claimed");
    }

    // Check if 48 hours have passed since voting ended
    const now = new Date();
    const votingEndTime = content.votingEndTime || content.votingDeadline;
    const timeSinceEnd = votingEndTime ? now - new Date(votingEndTime) : 0;
    const hoursElapsed = timeSinceEnd / (1000 * 60 * 60);

    if (hoursElapsed < 48) {
      res.status(400);
      throw new Error(`Reward can only be claimed 48 hours after voting ends. ${Math.ceil(48 - hoursElapsed)} hours remaining.`);
    }

    // Calculate reward based on participation and consensus
    const reward = calculateContentReward(content);

    // Mark reward as claimed
    content.hasClaimedReward = true;
    content.claimedAt = new Date();
    content.claimedReward = reward;
    await content.save();

    // Update user reputation for successful content submission
    const { getUserProfile, createOrUpdateUser } = require("../services/userService");
    const userProfile = await getUserProfile(userAddress);
    if (userProfile) {
      userProfile.reputationScore = Math.min(userProfile.reputationScore + 50, 1000);
      await createOrUpdateUser(userAddress, userProfile);
    }

    res.json({
      success: true,
      reward,
      message: "Reward claimed successfully!",
      content: {
        contentId: content.contentId,
        title: content.title,
        claimedReward: reward,
        claimedAt: content.claimedAt,
      }
    });

  } catch (error) {
    console.error("Error claiming reward:", error);
    res.status(500);
    throw new Error("Failed to claim reward");
  }
});

// Helper function to calculate estimated reward
const calculateEstimatedReward = (content) => {
  if (!content.isFinalized) return 0;
  
  const baseReward = 100; // Base reward points
  const participationBonus = (content.participantCount || 0) * 5;
  const consensusBonus = content.winningOption !== null ? 50 : 0;
  
  return baseReward + participationBonus + consensusBonus;
};

// Helper function to calculate actual content reward
const calculateContentReward = (content) => {
  const baseReward = 100;
  const participationBonus = (content.participantCount || 0) * 5;
  const consensusBonus = content.winningOption !== null ? 50 : 0;
  const qualityBonus = content.votes?.length > 10 ? 25 : 0;
  
  return baseReward + participationBonus + consensusBonus + qualityBonus;
};

module.exports = {
  registerUser,
  getUserProfileById,
  getMyProfile,
  updateProfile,
  verifyIdentity,
  getMyVotingHistory,
  getUserVotingHistoryById,
  getMyReputationHistory,
  getUserReputationHistoryById,
  getUserContent,
  getMyContent,
  claimContentReward,
};
