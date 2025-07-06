const { ContentItem, CommitInfo, RevealInfo } = require("../models");
const {
  uploadToIPFS,
  uploadMetadataToIPFS,
  getFromIPFS,
  pinToIPFS,
} = require("./ipfsService");
const {
  submitContent,
  getMultiTokenResults,
  commitMultiTokenVote,
  revealMultiTokenVote,
} = require("./blockchainService");
const { generateCommitHash, formatUSDValue } = require("../utils/helpers");
const {
  setCache,
  getCache,
  clearCacheByPattern,
  deleteCache,
} = require("../utils/redis");
const { MIN_VOTING_PERIOD } = require("../utils/constants");

/**
 * Create new content
 * @param {Object} contentData - Content data
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - File name
 * @param {Object} signer - Ethers.js signer or mock wallet
 * @returns {Promise<Object>} - Created content
 */
const createContent = async (contentData, fileBuffer, fileName, signer) => {
  try {
    // Upload file to IPFS
    const fileHash = await uploadToIPFS(fileBuffer, fileName);

    // Create metadata
    const metadata = {
      title: contentData.title,
      description: contentData.description || "",
      contentType: contentData.contentType || "image",
      fileHash,
      creator: signer.address.toLowerCase(),
      timestamp: Date.now(),
      tags: contentData.tags || [],
    };

    // Upload metadata to IPFS
    const metadataHash = await uploadMetadataToIPFS(metadata);

    // Pin both hashes to ensure persistence
    await Promise.all([pinToIPFS(fileHash), pinToIPFS(metadataHash)]);

    // Calculate voting duration in seconds
    const votingDuration = contentData.votingDuration || MIN_VOTING_PERIOD;

    // Submit content to blockchain
    const { contentId, transactionHash } = await submitContent(
      metadataHash,
      votingDuration,
      signer
    );

    // Create content in database
    const content = new ContentItem({
      contentId,
      ipfsHash: metadataHash,
      title: metadata.title,
      description: metadata.description,
      contentType: metadata.contentType,
      contentUrl: `ipfs://${fileHash}`,
      thumbnailUrl: `ipfs://${fileHash}`,
      creator: signer.address.toLowerCase(),
      tags: metadata.tags,
      submissionTime: new Date(),
      commitDeadline: new Date(Date.now() + (votingDuration * 1000) / 2), // 50% for commit phase
      revealDeadline: new Date(Date.now() + votingDuration * 1000),
      isActive: true,
      transactionHash,
    });

    await content.save();

    // Clear content list cache
    await clearCacheByPattern("content:list:*");

    return content;
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};

/**
 * Get content by ID
 * @param {Number} contentId - Content ID
 * @returns {Promise<Object>} - Content data
 */
const getContentById = async (contentId) => {
  try {
    // Check cache first
    const cacheKey = `content:${contentId}:data`;
    const cachedContent = await getCache(cacheKey);
    if (cachedContent) {
      return cachedContent;
    }

    // Find content in database
    const content = await ContentItem.findOne({ contentId });

    if (!content) {
      return null;
    }

    // Get metadata from IPFS
    let metadata = {};
    try {
      metadata = await getFromIPFS(content.ipfsHash);
    } catch (error) {
      console.warn(
        `Failed to get metadata from IPFS for content ${contentId}:`,
        error
      );
    }

    // Get commit and reveal counts
    const commitCount = await CommitInfo.countDocuments({ contentId });
    const revealCount = await RevealInfo.countDocuments({ contentId });

    // Get blockchain results if finalized
    let blockchainResults = null;
    if (content.isFinalized) {
      try {
        blockchainResults = await getMultiTokenResults(contentId);
      } catch (error) {
        console.warn(
          `Failed to get blockchain results for content ${contentId}:`,
          error
        );
      }
    }

    // Combine data
    const contentData = {
      ...content.toObject(),
      metadata,
      commitCount,
      revealCount,
      blockchainResults,
      status: content.status, // Virtual property
      timeRemaining: content.timeRemaining, // Virtual property
      formattedTotalUSDValue: formatUSDValue(content.totalUSDValue),
    };

    // Cache content data
    await setCache(cacheKey, contentData, 300); // Cache for 5 minutes

    return contentData;
  } catch (error) {
    console.error(`Error getting content ${contentId}:`, error);
    throw error;
  }
};

/**
 * Get content list with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Paginated content list
 */
const getContentList = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "submissionTime",
      sortOrder = "desc",
      status,
      creator,
      contentType,
      tags,
    } = options;

    // Build cache key
    const cacheKey = `content:list:${page}:${limit}:${sortBy}:${sortOrder}:${
      status || "all"
    }:${creator || "all"}:${contentType || "all"}:${
      tags ? tags.join(",") : "all"
    }`;

    // Check cache first
    const cachedList = await getCache(cacheKey);
    if (cachedList) {
      return cachedList;
    }

    // Build query
    const query = {};

    if (status) {
      // Convert status to query conditions
      switch (status) {
        case "committing":
          query.isActive = true;
          query.commitDeadline = { $gt: new Date() };
          break;
        case "revealing":
          query.isActive = true;
          query.commitDeadline = { $lte: new Date() };
          query.revealDeadline = { $gt: new Date() };
          break;
        case "pendingFinalization":
          query.isActive = true;
          query.revealDeadline = { $lte: new Date() };
          query.isFinalized = false;
          break;
        case "finalized":
          query.isFinalized = true;
          break;
      }
    }

    if (creator) {
      query.creator = creator.toLowerCase();
    }

    if (contentType) {
      query.contentType = contentType;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const [contents, total] = await Promise.all([
      ContentItem.find(query).sort(sort).skip(skip).limit(limit),
      ContentItem.countDocuments(query),
    ]);

    // Format results
    const results = await Promise.all(
      contents.map(async (content) => {
        const commitCount = await CommitInfo.countDocuments({
          contentId: content.contentId,
        });
        const revealCount = await RevealInfo.countDocuments({
          contentId: content.contentId,
        });

        return {
          ...content.toObject(),
          commitCount,
          revealCount,
          status: content.status, // Virtual property
          timeRemaining: content.timeRemaining, // Virtual property
          formattedTotalUSDValue: formatUSDValue(content.totalUSDValue),
        };
      })
    );

    // Prepare pagination data
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginatedResults = {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    // Cache results
    await setCache(cacheKey, paginatedResults, 300); // Cache for 5 minutes

    return paginatedResults;
  } catch (error) {
    console.error("Error getting content list:", error);
    throw error;
  }
};

/**
 * Commit vote for content
 * @param {Number} contentId - Content ID
 * @param {Number} vote - Vote option
 * @param {Number} confidence - Confidence level (1-100)
 * @param {Number} tokenType - Token type
 * @param {String} stakeAmount - Stake amount
 * @param {Array} merkleProof - Merkle proof
 * @param {Object} signer - Ethers.js signer or mock wallet object
 * @returns {Promise<Object>} - Transaction receipt
 */
const commitVote = async (
  contentId,
  vote,
  confidence,
  tokenType,
  stakeAmount,
  merkleProof,
  transactionHash,
  userAddress,
  providedSalt = null
) => {
  try {
    // Use provided salt or generate random salt
    const salt = providedSalt || Math.floor(Math.random() * 1000000000).toString();

    // Get signer address (from authenticated user)
    const signerAddress = userAddress || "0x1234567890123456789012345678901234567890";

    // Generate commit hash (for internal record, not sent to blockchain by backend)
    const commitHash = generateCommitHash(
      vote,
      confidence,
      salt,
      signerAddress,
      tokenType
    );

    // Store salt for later reveal
    const cacheKey = `commit:${contentId}:${signerAddress}`;
    await setCache(cacheKey, { vote, confidence, salt, transactionHash }, 86400 * 7); // Cache for 7 days

    return { transactionHash, commitHash, salt };
  } catch (error) {
    console.error("Error committing vote:", error);
    throw error;
  }
};

/**
 * Reveal vote for content
 * @param {Number} contentId - Content ID
 * @param {Number} vote - Vote option
 * @param {Number} confidence - Confidence level (1-100)
 * @param {String} salt - Salt used in commit
 * @param {Object} signer - Ethers.js signer
 * @returns {Promise<Object>} - Transaction receipt
 */
const revealVote = async (contentId, vote, confidence, salt, signer) => {
  try {
    // Reveal vote on blockchain
    const result = await revealMultiTokenVote(
      contentId,
      vote,
      confidence,
      salt,
      signer
    );

    // Clear commit cache
    const cacheKey = `commit:${contentId}:${signer.address.toLowerCase()}`;
    await deleteCache(cacheKey);

    return result;
  } catch (error) {
    console.error("Error revealing vote:", error);
    throw error;
  }
};

/**
 * Get saved commit data for content
 * @param {Number|String} contentId - Content ID
 * @param {String} address - User address
 * @returns {Promise<Object>} - Commit data
 */
const getSavedCommitData = async (contentId, address) => {
  try {
    // Normalize address to lowercase
    address = address.toLowerCase();

    // Ensure contentId is a number or string
    contentId = !isNaN(contentId) ? parseInt(contentId) : contentId;

    // Check cache for saved commit data
    const cacheKey = `commit:${contentId}:${address}`;
    const savedCommit = await getCache(cacheKey);

    return savedCommit;
  } catch (error) {
    console.error(
      `Error getting saved commit data for ${address} on content ${contentId}:`,
      error
    );
    return null;
  }
};

module.exports = {
  createContent,
  getContentById,
  getContentList,
  commitVote,
  revealVote,
  getSavedCommitData,
};
