const { SupportedToken } = require("../models");
const { getTokenPriceUSD, convertToUSD } = require("./blockchainService");
const { setCache, getCache, clearCacheByPattern } = require("../utils/redis");
const { TOKEN_TYPES } = require("../utils/constants");

/**
 * Get all supported tokens
 * @param {Boolean} activeOnly - Whether to return only active tokens
 * @returns {Promise<Array>} - Supported tokens
 */
const getSupportedTokens = async (activeOnly = false) => {
  try {
    // Check cache first
    const cacheKey = `tokens:all:${activeOnly ? "active" : "all"}`;
    const cachedTokens = await getCache(cacheKey);
    if (cachedTokens) {
      return cachedTokens;
    }

    // Build query
    const query = activeOnly ? { isActive: true } : {};

    // Get tokens from database
    const tokens = await SupportedToken.find(query).sort({ tokenType: 1 });

    // Format tokens
    const formattedTokens = tokens.map((token) => ({
      ...token.toObject(),
      tokenTypeName: token.tokenTypeName, // Virtual property
    }));

    // Cache tokens
    await setCache(cacheKey, formattedTokens, 3600); // Cache for 1 hour

    return formattedTokens;
  } catch (error) {
    console.error("Error getting supported tokens:", error);
    throw error;
  }
};

/**
 * Get token by type
 * @param {Number} tokenType - Token type
 * @returns {Promise<Object>} - Token data
 */
const getTokenByType = async (tokenType) => {
  try {
    // Validate tokenType
    if (tokenType === undefined || tokenType === null || isNaN(tokenType)) {
      throw new Error(`Invalid tokenType: ${tokenType}`);
    }

    const numericTokenType = parseInt(tokenType);
    if (isNaN(numericTokenType)) {
      throw new Error(`TokenType must be a valid number: ${tokenType}`);
    }

    // Check cache first
    const cacheKey = `token:${numericTokenType}:data`;
    const cachedToken = await getCache(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    // Get token from database
    const token = await SupportedToken.findOne({ tokenType: numericTokenType });

    if (!token) {
      return null;
    }

    // Format token
    const formattedToken = {
      ...token.toObject(),
      tokenTypeName: token.tokenTypeName, // Virtual property
    };

    // Cache token
    await setCache(cacheKey, formattedToken, 3600); // Cache for 1 hour

    return formattedToken;
  } catch (error) {
    console.error(`Error getting token by type ${tokenType}:`, error);
    throw error;
  }
};

/**
 * Get token distribution statistics
 * @returns {Promise<Object>} - Token distribution data
 */
const getTokenDistribution = async () => {
  try {
    // Check cache first
    const cacheKey = "tokens:distribution";
    const cachedDistribution = await getCache(cacheKey);
    if (cachedDistribution) {
      return cachedDistribution;
    }

    // Get all active tokens
    const tokens = await getSupportedTokens(true);
    
    // Mock distribution data for now - in production this would come from actual voting data
    const distribution = tokens.map(token => ({
      tokenType: token.tokenType,
      symbol: token.symbol,
      name: token.name,
      totalStaked: Math.floor(Math.random() * 1000000), // Mock data
      totalVotes: Math.floor(Math.random() * 1000),
      averageStake: Math.floor(Math.random() * 1000),
      percentage: Math.floor(Math.random() * 100)
    }));

    // Cache distribution
    await setCache(cacheKey, distribution, 300); // Cache for 5 minutes

    return distribution;
  } catch (error) {
    console.error("Error getting token distribution:", error);
    throw error;
  }
};

/**
 * Update token prices from blockchain
 * @returns {Promise<Array>} - Updated tokens
 */
const updateTokenPrices = async () => {
  try {
    // Get all tokens
    const tokens = await SupportedToken.find({});

    // Update prices
    const updatedTokens = [];

    for (const token of tokens) {
      try {
        // Get price from blockchain
        const priceUSD = await getTokenPriceUSD(token.tokenType);

        // Update token
        token.currentPriceUSD = parseInt(priceUSD) / 1e8; // Convert from 8 decimal places
        token.lastPriceUpdate = new Date();

        await token.save();

        // Clear token cache
        await clearCacheByPattern(`token:${token.tokenType}:*`);

        updatedTokens.push({
          tokenType: token.tokenType,
          symbol: token.symbol,
          currentPriceUSD: token.currentPriceUSD,
        });
      } catch (error) {
        console.error(`Error updating price for token ${token.symbol}:`, error);
      }
    }

    // Clear tokens cache
    await clearCacheByPattern("tokens:*");

    return updatedTokens;
  } catch (error) {
    console.error("Error updating token prices:", error);
    throw error;
  }
};

/**
 * Convert token amount to USD
 * @param {Number} tokenType - Token type
 * @param {String} amount - Token amount
 * @returns {Promise<String>} - USD value
 */
const convertTokenToUSD = async (tokenType, amount) => {
  try {
    // Check if token exists
    const token = await SupportedToken.findOne({ tokenType });

    if (!token) {
      throw new Error(`Token type ${tokenType} not found`);
    }

    // Convert to USD using blockchain
    const usdValue = await convertToUSD(tokenType, amount);

    return usdValue;
  } catch (error) {
    console.error(`Error converting token to USD:`, error);
    throw error;
  }
};

/**
 * Initialize default tokens if they don't exist
 * @returns {Promise<Array>} - Created tokens
 */
const initializeDefaultTokens = async () => {
  try {
    const defaultTokens = [
      {
        tokenType: TOKEN_TYPES.BTC,
        tokenAddress: "0x0000000000000000000000000000000000000000", // Placeholder
        priceOracle: "0x0000000000000000000000000000000000000000", // Placeholder
        decimals: 8,
        isActive: true,
        bonusMultiplier: 1050,
        minStakeAmount: "1000000",
        name: "Bitcoin",
        symbol: "BTC",
        iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
      },
      {
        tokenType: TOKEN_TYPES.ETH,
        tokenAddress: "0x0000000000000000000000000000000000000000", // Placeholder
        priceOracle: "0x0000000000000000000000000000000000000000", // Placeholder
        decimals: 18,
        isActive: true,
        bonusMultiplier: 1000,
        minStakeAmount: "10000000000000000",
        name: "Ethereum",
        symbol: "ETH",
        iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      },
      {
        tokenType: TOKEN_TYPES.MATIC,
        tokenAddress: "0x0000000000000000000000000000000000000000", // Placeholder
        priceOracle: "0x0000000000000000000000000000000000000000", // Placeholder
        decimals: 18,
        isActive: true,
        bonusMultiplier: 1000,
        minStakeAmount: "10000000000000000000",
        name: "Polygon",
        symbol: "MATIC",
        iconUrl: "https://cryptologos.cc/logos/polygon-matic-logo.png",
      },
      {
        tokenType: TOKEN_TYPES.USDC,
        tokenAddress: "0x0000000000000000000000000000000000000000", // Placeholder
        priceOracle: "0x0000000000000000000000000000000000000000", // Placeholder
        decimals: 6,
        isActive: true,
        bonusMultiplier: 1000,
        minStakeAmount: "10000000",
        name: "USD Coin",
        symbol: "USDC",
        iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      },
    ];

    const createdTokens = [];

    for (const tokenData of defaultTokens) {
      // Check if token already exists
      const existingToken = await SupportedToken.findOne({
        tokenType: tokenData.tokenType,
      });

      if (!existingToken) {
        // Create new token
        const token = new SupportedToken(tokenData);
        await token.save();
        createdTokens.push(token);

        console.log(`Created default token: ${tokenData.symbol}`);
      }
    }

    // Clear tokens cache
    await clearCacheByPattern("tokens:*");

    return createdTokens;
  } catch (error) {
    console.error("Error initializing default tokens:", error);
    throw error;
  }
};

module.exports = {
  getSupportedTokens,
  getTokenByType,
  updateTokenPrices,
  convertTokenToUSD,
  initializeDefaultTokens,
  getTokenDistribution,
};
