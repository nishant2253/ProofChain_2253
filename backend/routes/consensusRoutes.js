const express = require("express");
const {
  getConsensusStats,
  getVotingTimeline,
} = require("../controllers/consensusController");

const router = express.Router();

// Public routes
router.get("/stats", getConsensusStats);
router.get("/timeline", getVotingTimeline);

module.exports = router;