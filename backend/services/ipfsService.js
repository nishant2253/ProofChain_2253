const axios = require("axios");
const FormData = require("form-data");
const { setCache, getCache } = require("../utils/redis");
const crypto = require("crypto");

// IPFS gateway URLs
const IPFS_GATEWAY_URL =
  process.env.IPFS_GATEWAY ||
  "https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/";
const IPFS_API_URL =
  process.env.IPFS_API_URL || "https://api.pinata.cloud/pinning";

// Flag to use mock IPFS in development
const USE_MOCK_IPFS =
  !process.env.IPFS_PROJECT_ID || !process.env.IPFS_API_SECRET;

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

    const response = await axios.post(`${IPFS_API_URL}/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.IPFS_API_SECRET}`,
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
 * Upload content metadata to IPFS
 * @param {Object} metadata - Content metadata
 * @returns {Promise<String>} - IPFS hash
 */
const uploadMetadataToIPFS = async (metadata) => {
  try {
    // Use mock implementation in development mode
    if (USE_MOCK_IPFS) {
      console.log("Using mock IPFS implementation for metadata");
      const hash = generateMockIpfsHash();
      mockIpfsStorage.set(hash, {
        content: JSON.stringify(metadata),
        fileName: "metadata.json",
        timestamp: Date.now(),
      });
      console.log(`Mock metadata uploaded with hash: ${hash}`);
      return hash;
    }

    const formData = new FormData();
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    formData.append("file", metadataBuffer, { filename: "metadata.json" });

    const response = await axios.post(`${IPFS_API_URL}/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.IPFS_API_SECRET}`,
      },
    });

    if (response.data && response.data.IpfsHash) {
      console.log(`Metadata uploaded to IPFS with hash: ${response.data.IpfsHash}`);
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
 * Get content from IPFS
 * @param {String} ipfsHash - IPFS hash
 * @returns {Promise<Object>} - Content data
 */
const getFromIPFS = async (ipfsHash) => {
  try {
    // Check mock storage first in development mode
    if (USE_MOCK_IPFS && mockIpfsStorage.has(ipfsHash)) {
      console.log(`Getting mock content for hash: ${ipfsHash}`);
      return mockIpfsStorage.get(ipfsHash).content;
    }

    // Check cache first
    const cacheKey = `ipfs:${ipfsHash}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
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

    // Cache the result
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

    const response = await axios.post(
      `${IPFS_API_URL}/pin/add?arg=${ipfsHash}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.IPFS_API_SECRET}`,
        },
      }
    );

    if (
      response.data &&
      response.data.Pins &&
      response.data.Pins.includes(ipfsHash)
    ) {
      console.log(`Content pinned to IPFS: ${ipfsHash}`);
      return true;
    } else {
      throw new Error("Failed to pin content to IPFS");
    }
  } catch (error) {
    console.error("Error pinning content to IPFS:", error);
    // Don't throw error for pinning failures, just log it
    return false;
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
  getFromIPFS,
  pinToIPFS,
  getIPFSUrl,
};