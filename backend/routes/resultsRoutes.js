const express = require("express");
const { getVotingResults, finalizeVotingResults } = require("../controllers/resultsController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const router = express.Router();

// Public routes
router.get("/:contentId", getVotingResults);

// Admin routes
router.post("/:contentId/finalize", protect, admin, finalizeVotingResults);

module.exports = router;