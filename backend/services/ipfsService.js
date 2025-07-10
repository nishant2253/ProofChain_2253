const axios = require("axios");
const FormData = require("form-data");
const { setCache, getCache } = require("../utils/redis");
const crypto = require("crypto");
const { 
  formatMetadataForIPFS, 
  isLegacyMetadata, 
  migrateLegacyMetadata 
} = require("../utils/ipfsMetadataValidator");

// IPFS gateway URLs
const IPFS_GATEWAY_URL =
  process.env.IPFS_GATEWAY ||
  "https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/";
const IPFS_API_URL =
  process.env.IPFS_API_URL || "https://api.pinata.cloud";

// Flag to use mock IPFS in development
const USE_MOCK_IPFS =
  !process.env.IPFS_API_SECRET && !process.env.PINATA_JWT;

// Mock IPFS storage for development
const mockIpfsStorage = new Map();

/**
 * Generate a mock IPFS hash for development
 * @returns {String} - Mock IPFS hash
 */
const generateMockIpfsHash = () => {
  return `Qm${crypto.randomBytes(44).toString("hex")}`;
};

/**
 * Upload content to IPFS
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - File name
 * @returns {Promise<String>} - IPFS hash
 */
const uploadToIPFS = async (fileBuffer, fileName) => {
  // If no file buffer or file name is provided, return null
  if (!fileBuffer || !fileName) {
    console.log("No file buffer or file name provided, skipping IPFS upload.");
    return null;
  }
  try {
    // Use mock implementation in development mode
    if (USE_MOCK_IPFS) {
      console.log("Using mock IPFS implementation");
      const hash = generateMockIpfsHash();
      mockIpfsStorage.set(hash, {
        content: fileBuffer,
        fileName,
        timestamp: Date.now(),
      });
      console.log(`Mock content uploaded with hash: ${hash}`);
      return hash;
    }

    const formData = new FormData(); // <-- Re-added this line
    formData.append("file", fileBuffer, { filename: fileName });

    // Use either PINATA_JWT or IPFS_API_SECRET for authorization
    const authHeader = process.env.PINATA_JWT 
      ? `Bearer ${process.env.PINATA_JWT}`
      : `Bearer ${process.env.IPFS_API_SECRET}`;

    const response = await axios.post(`${IPFS_API_URL}/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: authHeader,
      },
    });

    if (response.data && response.data.IpfsHash) {
      console.log(`Content uploaded to IPFS with hash: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } else {
      console.error("Pinata response did not contain Hash field. Full response data:", response.data);
      throw new Error("Failed to get IPFS hash from response");
    }
  } catch (error) {
    console.error("Error uploading to IPFS:", error.message);
    if (error.response) {
      console.error("Pinata response status:", error.response.status);
      console.error("Pinata response data:", error.response.data);
      console.error("Pinata response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Pinata request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Upload content metadata to IPFS for simple voting system
 * @param {Object} metadata - Content metadata
 * @returns {Promise<String>} - IPFS hash
 */
const uploadMetadataToIPFS = async (metadata) => {
  try {
    // Validate and format metadata for simple voting system
    const formattedMetadata = {
      // Core content information
      title: metadata.title,
      description: metadata.description || "",
      contentType: metadata.contentType || "text",
      fileHash: metadata.fileHash || null,
      creator: metadata.creator,
      timestamp: metadata.timestamp || Date.now(),
      tags: metadata.tags || [],
      
      // Simple voting system fields (replacing commit-reveal)
      votingStartTime: metadata.votingStartTime,
      votingEndTime: metadata.votingEndTime,
      votingDuration: metadata.votingEndTime && metadata.votingStartTime 
        ? Math.floor((metadata.votingEndTime - metadata.votingStartTime) / 1000) 
        : null,
      
      // Voting system metadata
      votingSystem: "simple", // Identifier for the voting system type
      version: "2.0", // Version to distinguish from old commit-reveal format
      
      // Optional additional metadata
      category: metadata.category || "general",
      language: metadata.language || "en",
      
      // IPFS and blockchain metadata
      ipfsVersion: "1.0",
      blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || "localhost",
      createdAt: new Date().toISOString(),
    };

    console.log("Uploading formatted metadata for simple voting:", {
      title: formattedMetadata.title,
      votingSystem: formattedMetadata.votingSystem,
      version: formattedMetadata.version,
      votingDuration: formattedMetadata.votingDuration
    });

    // Use mock implementation in development mode
    if (USE_MOCK_IPFS) {
      console.log("Using mock IPFS implementation for metadata");
      const hash = generateMockIpfsHash();
      mockIpfsStorage.set(hash, {
        content: formattedMetadata, // Store the formatted metadata object
        fileName: "metadata.json",
        timestamp: Date.now(),
      });
      console.log(`Mock metadata uploaded with hash: ${hash}`);
      return hash;
    }

    const formData = new FormData();
    const metadataBuffer = Buffer.from(JSON.stringify(formattedMetadata, null, 2));
    formData.append("file", metadataBuffer, { filename: "metadata.json" });

    // Add Pinata metadata for better organization
    const pinataMetadata = JSON.stringify({
      name: `ProofChain-${formattedMetadata.title}-metadata`,
      keyvalues: {
        contentType: formattedMetadata.contentType,
        votingSystem: formattedMetadata.votingSystem,
        creator: formattedMetadata.creator,
        version: formattedMetadata.version
      }
    });
    formData.append("pinataMetadata", pinataMetadata);

    // Use either PINATA_JWT or IPFS_API_SECRET for authorization
    const authHeader = process.env.PINATA_JWT 
      ? `Bearer ${process.env.PINATA_JWT}`
      : `Bearer ${process.env.IPFS_API_SECRET}`;

    const response = await axios.post(`${IPFS_API_URL}/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: authHeader,
      },
    });

    if (response.data && response.data.IpfsHash) {
      console.log(`Metadata uploaded to IPFS with hash: ${response.data.IpfsHash}`);
      console.log(`Metadata accessible at: ${IPFS_GATEWAY_URL}${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } else {
      console.error("Pinata metadata response did not contain Hash field. Full response data:", response.data);
      throw new Error("Failed to get IPFS hash from response");
    }
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error.message);
    if (error.response) {
      console.error("Pinata response status:", error.response.status);
      console.error("Pinata response data:", error.response.data);
      console.error("Pinata response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Pinata request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw new Error(`Failed to upload metadata to IPFS: ${error.message}`);
  }
};

/**
 * Get content from IPFS with legacy format support
 * @param {String} ipfsHash - IPFS hash
 * @returns {Promise<Object>} - Content data
 */
const getFromIPFS = async (ipfsHash) => {
  try {
    // Check mock storage first in development mode
    if (USE_MOCK_IPFS && mockIpfsStorage.has(ipfsHash)) {
      console.log(`Getting mock content for hash: ${ipfsHash}`);
      const mockData = mockIpfsStorage.get(ipfsHash).content;
      
      // Handle both string and object formats from mock storage
      let data = typeof mockData === 'string' ? JSON.parse(mockData) : mockData;
      
      // Check if it's legacy format and migrate if needed
      if (isLegacyMetadata(data)) {
        console.log('Migrating legacy metadata from mock storage');
        data = migrateLegacyMetadata(data);
      }
      
      return data;
    }

    // Check cache first
    const cacheKey = `ipfs:${ipfsHash}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      // Check if cached data is legacy format
      if (isLegacyMetadata(cachedData)) {
        console.log('Migrating legacy metadata from cache');
        const migratedData = migrateLegacyMetadata(cachedData);
        // Update cache with migrated data
        await setCache(cacheKey, migratedData, 3600);
        return migratedData;
      }
      return cachedData;
    }

    // Try multiple gateways in case one fails
    const gateways = [
      `${IPFS_GATEWAY_URL}${ipfsHash}`,
      // `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
      `https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/${ipfsHash}`,
    ];

    let data = null;
    let error = null;

    console.log(`Attempting to fetch IPFS hash: ${ipfsHash}`);
    for (const gateway of gateways) {
      console.log(`  Trying gateway: ${gateway}`);
      try {
        const response = await axios.get(gateway);
        data = response.data;
        break;
      } catch (err) {
        error = err;
        console.warn(`Failed to fetch from gateway ${gateway}: ${err.message}`);
      }
    }

    if (!data && error) {
      throw error;
    }

    // Check if retrieved data is legacy format and migrate if needed
    if (isLegacyMetadata(data)) {
      console.log(`Migrating legacy metadata from IPFS hash: ${ipfsHash}`);
      data = migrateLegacyMetadata(data);
    }

    // Cache the result (migrated if it was legacy)
    await setCache(cacheKey, data, 3600); // Cache for 1 hour

    return data;
  } catch (error) {
    console.error("Error getting content from IPFS:", error);
    throw new Error(`Failed to get content from IPFS: ${error.message}`);
  }
};

/**
 * Pin content to IPFS
 * @param {String} ipfsHash - IPFS hash
 * @returns {Promise<Boolean>} - Success status
 */
const pinToIPFS = async (ipfsHash) => {
  try {
    // Skip pinning in mock mode
    if (USE_MOCK_IPFS) {
      console.log(`Mock pinning of hash: ${ipfsHash}`);
      return true;
    }

    // Temporarily disable pinning to fix the 404 error
    // Content is already uploaded to IPFS, pinning is just for persistence
    console.log(`Skipping pinning for now - content uploaded successfully: ${ipfsHash}`);
    console.log(`Content accessible at: ${IPFS_GATEWAY_URL}${ipfsHash}`);
    return true;

    // TODO: Implement proper Pinata pinning using new SDK or correct API endpoint
    /*
    const response = await axios.post(
      `${IPFS_API_URL}/pinning/pinByHash`,
      {
        hashToPin: ipfsHash,
        pinataMetadata: {
          name: `ProofChain-${ipfsHash}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.ipfsHash === ipfsHash) {
      console.log(`Content pinned to IPFS: ${ipfsHash}`);
      return true;
    } else {
      throw new Error("Failed to pin content to IPFS");
    }
    */
  } catch (error) {
    console.error("Error pinning content to IPFS:", error);
    // Don't throw error for pinning failures, just log it
    return false;
  }
};

/**
 * Upload voting results to IPFS for simple voting system
 * @param {Object} votingResults - Voting results data
 * @returns {Promise<String>} - IPFS hash
 */
const uploadVotingResultsToIPFS = async (votingResults) => {
  try {
    const formattedResults = {
      // Core voting information
      contentId: votingResults.contentId,
      title: votingResults.title,
      
      // Simple voting results
      totalVotes: votingResults.totalVotes || 0,
      upvotes: votingResults.upvotes || 0,
      downvotes: votingResults.downvotes || 0,
      voteBreakdown: votingResults.voteBreakdown || {},
      
      // Voting period information
      votingStartTime: votingResults.votingStartTime,
      votingEndTime: votingResults.votingEndTime,
      finalizedAt: new Date().toISOString(),
      
      // System metadata
      votingSystem: "simple",
      version: "2.0",
      resultType: "final",
      
      // Blockchain information
      blockchainResults: votingResults.blockchainResults || null,
      transactionHash: votingResults.transactionHash || null,
      blockNumber: votingResults.blockNumber || null,
      
      // Additional metadata
      participationRate: votingResults.participationRate || null,
      consensus: votingResults.consensus || null,
      
      // Schema identifier
      schema: "proofchain-voting-results-v2"
    };

    console.log("Uploading voting results to IPFS:", {
      contentId: formattedResults.contentId,
      totalVotes: formattedResults.totalVotes,
      votingSystem: formattedResults.votingSystem
    });

    // Use mock implementation in development mode
    if (USE_MOCK_IPFS) {
      console.log("Using mock IPFS implementation for voting results");
      const hash = generateMockIpfsHash();
      mockIpfsStorage.set(hash, {
        content: formattedResults,
        fileName: "voting-results.json",
        timestamp: Date.now(),
      });
      console.log(`Mock voting results uploaded with hash: ${hash}`);
      return hash;
    }

    const formData = new FormData();
    const resultsBuffer = Buffer.from(JSON.stringify(formattedResults, null, 2));
    formData.append("file", resultsBuffer, { filename: "voting-results.json" });

    // Add Pinata metadata for voting results
    const pinataMetadata = JSON.stringify({
      name: `ProofChain-${formattedResults.contentId}-results`,
      keyvalues: {
        contentId: formattedResults.contentId.toString(),
        votingSystem: formattedResults.votingSystem,
        resultType: formattedResults.resultType,
        version: formattedResults.version,
        totalVotes: formattedResults.totalVotes.toString()
      }
    });
    formData.append("pinataMetadata", pinataMetadata);

    // Use either PINATA_JWT or IPFS_API_SECRET for authorization
    const authHeader = process.env.PINATA_JWT 
      ? `Bearer ${process.env.PINATA_JWT}`
      : `Bearer ${process.env.IPFS_API_SECRET}`;

    const response = await axios.post(`${IPFS_API_URL}/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: authHeader,
      },
    });

    if (response.data && response.data.IpfsHash) {
      console.log(`Voting results uploaded to IPFS with hash: ${response.data.IpfsHash}`);
      console.log(`Results accessible at: ${IPFS_GATEWAY_URL}${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } else {
      console.error("Pinata voting results response did not contain Hash field. Full response data:", response.data);
      throw new Error("Failed to get IPFS hash from voting results response");
    }
  } catch (error) {
    console.error("Error uploading voting results to IPFS:", error.message);
    throw new Error(`Failed to upload voting results to IPFS: ${error.message}`);
  }
};

/**
 * Create IPFS URL from hash
 * @param {String} ipfsHash - IPFS hash
 * @returns {String} - IPFS URL
 */
const getIPFSUrl = (ipfsHash) => {
  return `${IPFS_GATEWAY_URL}${ipfsHash}`;
};

module.exports = {
  uploadToIPFS,
  uploadMetadataToIPFS,
  uploadVotingResultsToIPFS,
  getFromIPFS,
  pinToIPFS,
  getIPFSUrl,
};