const asyncHandler = require("express-async-handler");

/**
 * @desc    Get consensus statistics
 * @route   GET /api/consensus/stats
 * @access  Public
 */
const getConsensusStats = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Get voting timeline data
 * @route   GET /api/consensus/timeline
 * @access  Public
 */
const getVotingTimeline = asyncHandler(async (req, res) => {
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
});

module.exports = {
  getConsensusStats,
  getVotingTimeline,
};