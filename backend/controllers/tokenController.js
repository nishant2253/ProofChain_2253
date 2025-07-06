const asyncHandler = require("express-async-handler");
const {
  getSupportedTokens,
  getTokenByType,
  updateTokenPrices,
  convertTokenToUSD,
  initializeDefaultTokens,
  getTokenDistribution,
} = require("../services/tokenService");

/**
 * @desc    Get all supported tokens
 * @route   GET /api/tokens
 * @access  Public
 */
const getAllTokens = asyncHandler(async (req, res) => {
  const { activeOnly } = req.query;

  console.log("getAllTokens called with activeOnly:", activeOnly);

  try {
    const tokens = await getSupportedTokens(activeOnly === "true");
    console.log("Tokens retrieved from service:", tokens ? tokens.length : 0);

    res.json(tokens);
  } catch (error) {
    console.error("Error in getAllTokens controller:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve tokens", error: error.message });
  }
});

/**
 * @desc    Get token by type
 * @route   GET /api/tokens/:type
 * @access  Public
 */
const getToken = asyncHandler(async (req, res) => {
  const { type } = req.params;

  const token = await getTokenByType(parseInt(type));

  if (!token) {
    res.status(404);
    throw new Error("Token not found");
  }

  res.json(token);
});

/**
 * @desc    Update token prices
 * @route   POST /api/tokens/update-prices
 * @access  Private/Admin
 */
const updatePrices = asyncHandler(async (req, res) => {
  const updatedTokens = await updateTokenPrices();

  res.json({
    success: true,
    updatedTokens,
  });
});

/**
 * @desc    Convert token amount to USD
 * @route   POST /api/tokens/convert
 * @access  Public
 */
const convertToUSD = asyncHandler(async (req, res) => {
  const { tokenType, amount } = req.body;

  if (!tokenType || !amount) {
    res.status(400);
    throw new Error("Token type and amount are required");
  }

  const usdValue = await convertTokenToUSD(parseInt(tokenType), amount);

  res.json({
    tokenType: parseInt(tokenType),
    amount,
    usdValue,
  });
});

/**
 * @desc    Initialize default tokens
 * @route   POST /api/tokens/initialize
 * @access  Private/Admin
 */
const initializeTokens = asyncHandler(async (req, res) => {
  const createdTokens = await initializeDefaultTokens();

  res.json({
    success: true,
    createdTokens,
  });
});

/**
 * @desc    Get token distribution statistics
 * @route   GET /api/tokens/distribution
 * @access  Public
 */
const getDistribution = asyncHandler(async (req, res) => {
  const distribution = await getTokenDistribution();

  res.json({
    success: true,
    data: distribution,
  });
});

module.exports = {
  getAllTokens,
  getToken,
  updatePrices,
  convertToUSD,
  initializeTokens,
  getDistribution,
};
