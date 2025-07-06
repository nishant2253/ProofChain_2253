const express = require("express");
const {
  getAllTokens,
  getToken,
  updatePrices,
  convertToUSD,
  initializeTokens,
  getDistribution,
} = require("../controllers/tokenController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { validateBody, schemas } = require("../middleware/validationMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllTokens);
router.get("/supported", getAllTokens);
router.get("/distribution", getDistribution);
router.get("/:type", getToken);
router.post("/convert", validateBody(schemas.convertToUSD), convertToUSD);

// Admin routes
router.post("/update-prices", protect, admin, updatePrices);
router.post("/initialize", protect, admin, initializeTokens);

module.exports = router;
