const express = require("express");
const {
  getConsensusStats,
  getVotingTimeline,
  submitSimpleVote,
} = require("../controllers/consensusController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/stats", getConsensusStats);
router.get("/timeline", getVotingTimeline);

// Protected routes
router.post("/vote", protect, submitSimpleVote);

module.exports = router;