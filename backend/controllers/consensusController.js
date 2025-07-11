const ContentItem = require("../models/ContentItem");

/**
 * @desc    Get consensus statistics
 * @route   GET /api/consensus/stats
 * @access  Public
 */
const getConsensusStats = async (req, res) => {
  try {
  // Mock data for now - in production this would come from actual voting data
  const stats = {
    totalVotes: Math.floor(Math.random() * 10000),
    activeVotings: Math.floor(Math.random() * 50),
    totalStaked: Math.floor(Math.random() * 1000000),
    averageConfidence: (Math.random() * 10).toFixed(1),
    consensusReached: Math.floor(Math.random() * 100),
    participationRate: (Math.random() * 100).toFixed(1),
    lastUpdated: new Date().toISOString()
  };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getConsensusStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get consensus stats"
    });
  }
};

/**
 * @desc    Get voting timeline data
 * @route   GET /api/consensus/timeline
 * @access  Public
 */
const getVotingTimeline = async (req, res) => {
  try {
  // Mock timeline data for now
  const timeline = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      votes: Math.floor(Math.random() * 100),
      staked: Math.floor(Math.random() * 10000),
      consensus: Math.floor(Math.random() * 20)
    });
  }

    res.json({
      success: true,
      data: timeline.reverse(),
    });
  } catch (error) {
    console.error("Error in getVotingTimeline:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get voting timeline"
    });
  }
};

/**
 * @desc    Submit a simple vote
 * @route   POST /api/consensus/vote
 * @access  Private
 */
const submitSimpleVote = async (req, res) => {
  try {
    const { contentId, vote, tokenType, stakeAmount, confidence } = req.body;
    const userId = req.user?.id;
    const userAddress = req.user?.address;

    // Validate required fields
    if (!contentId || vote === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: contentId, vote"
      });
    }

    // Validate user authentication
    if (!userAddress) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }
    // Find the content item by contentId (numeric) first, then try _id if it's a valid ObjectId
    let content;
    
    // Convert contentId to number if it's a string number
    const numericContentId = parseInt(contentId);
    
    // First try to find by contentId (numeric field)
    if (!isNaN(numericContentId)) {
      content = await ContentItem.findOne({ contentId: numericContentId });
    }
    
    // If not found and contentId looks like an ObjectId, try finding by _id
    if (!content && typeof contentId === 'string' && contentId.match(/^[0-9a-fA-F]{24}$/)) {
      content = await ContentItem.findById(contentId);
    }
    
    console.log(`Looking for content with contentId: ${contentId}, found: ${!!content}`);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    // Check if voting is currently active
    const now = new Date();
    if (now < content.votingStartTime) {
      return res.status(400).json({
        success: false,
        message: "Voting has not started yet"
      });
    }

    if (now > content.votingEndTime) {
      return res.status(400).json({
        success: false,
        message: "Voting period has ended"
      });
    }

    // Check if user has already voted
    const existingVote = content.votes?.find(v => 
      v.voter.toLowerCase() === userAddress.toLowerCase()
    );

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this content"
      });
    }

    // Add the vote to the content
    const newVote = {
      voter: userAddress.toLowerCase(),
      vote: parseInt(vote),
      tokenType: parseInt(tokenType),
      stakeAmount: stakeAmount,
      confidence: parseInt(confidence) || 5,
      timestamp: new Date()
    };

    if (!content.votes) {
      content.votes = [];
    }
    content.votes.push(newVote);

    // Update vote counts
    if (vote === 1) {
      content.upvotes = (content.upvotes || 0) + 1;
    } else {
      content.downvotes = (content.downvotes || 0) + 1;
    }

    await content.save();

    res.json({
      success: true,
      message: "Vote submitted successfully",
      data: {
        contentId: content.contentId || content._id,
        vote: newVote.vote,
        totalVotes: content.votes.length,
        upvotes: content.upvotes || 0,
        downvotes: content.downvotes || 0
      }
    });

  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit vote"
    });
  }
};

module.exports = {
  getConsensusStats,
  getVotingTimeline,
  submitSimpleVote,
};