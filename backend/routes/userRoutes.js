const express = require("express");
const {
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
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const { validateBody, schemas } = require("../middleware/validationMiddleware");

const router = express.Router();

// Public routes
router.post("/", authLimiter, validateBody(schemas.registerUser), registerUser);
router.get("/:address", getUserProfileById);
router.get("/:address/votes", getUserVotingHistoryById);
router.get("/:address/reputation-history", getUserReputationHistoryById);
router.get("/:address/content", getUserContent);

// Protected routes
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateProfile);
router.post("/verify", protect, verifyIdentity);
router.get("/me/votes", protect, getMyVotingHistory);
router.get("/me/reputation-history", protect, getMyReputationHistory);
router.get("/me/content", protect, getMyContent);
router.post("/me/content/:contentId/claim-reward", protect, claimContentReward);

module.exports = router;
