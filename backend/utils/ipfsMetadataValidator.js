/**
 * IPFS Metadata Validator for Simple Voting System
 * Validates and formats metadata before uploading to IPFS/Pinata
 */

/**
 * Validate metadata structure for simple voting system
 * @param {Object} metadata - Raw metadata object
 * @returns {Object} - Validation result with isValid flag and errors
 */
const validateMetadata = (metadata) => {
  const errors = [];
  const warnings = [];

  // Required fields validation
  if (!metadata.title || typeof metadata.title !== 'string') {
    errors.push('Title is required and must be a string');
  }

  if (!metadata.creator || typeof metadata.creator !== 'string') {
    errors.push('Creator address is required and must be a string');
  }

  if (!metadata.votingStartTime || !metadata.votingEndTime) {
    errors.push('Voting start time and end time are required');
  }

  // Voting period validation
  if (metadata.votingStartTime && metadata.votingEndTime) {
    const startTime = new Date(metadata.votingStartTime);
    const endTime = new Date(metadata.votingEndTime);
    
    if (startTime >= endTime) {
      errors.push('Voting end time must be after voting start time');
    }

    const duration = endTime - startTime;
    const minDuration = 60 * 60 * 1000; // 1 hour minimum
    const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days maximum

    if (duration < minDuration) {
      warnings.push('Voting period is less than 1 hour');
    }

    if (duration > maxDuration) {
      warnings.push('Voting period is longer than 30 days');
    }
  }

  // Content type validation
  const validContentTypes = ['text', 'image', 'video', 'audio', 'document', 'other'];
  if (metadata.contentType && !validContentTypes.includes(metadata.contentType)) {
    warnings.push(`Content type '${metadata.contentType}' is not in standard list: ${validContentTypes.join(', ')}`);
  }

  // Tags validation
  if (metadata.tags && !Array.isArray(metadata.tags)) {
    errors.push('Tags must be an array');
  }

  if (metadata.tags && metadata.tags.length > 10) {
    warnings.push('More than 10 tags may affect performance');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Format metadata for IPFS storage with simple voting system
 * @param {Object} rawMetadata - Raw metadata from content creation
 * @returns {Object} - Formatted metadata ready for IPFS
 */
const formatMetadataForIPFS = (rawMetadata) => {
  const validation = validateMetadata(rawMetadata);
  
  if (!validation.isValid) {
    throw new Error(`Metadata validation failed: ${validation.errors.join(', ')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Metadata warnings:', validation.warnings);
  }

  const formattedMetadata = {
    // Core content information
    title: rawMetadata.title.trim(),
    description: (rawMetadata.description || "").trim(),
    contentType: rawMetadata.contentType || "text",
    fileHash: rawMetadata.fileHash || null,
    creator: rawMetadata.creator.toLowerCase(),
    timestamp: rawMetadata.timestamp || Date.now(),
    tags: (rawMetadata.tags || []).map(tag => tag.trim().toLowerCase()),
    
    // Simple voting system fields
    votingStartTime: rawMetadata.votingStartTime,
    votingEndTime: rawMetadata.votingEndTime,
    votingDuration: Math.floor((rawMetadata.votingEndTime - rawMetadata.votingStartTime) / 1000),
    
    // System metadata
    votingSystem: "simple",
    version: "2.0",
    ipfsVersion: "1.0",
    
    // Additional metadata
    category: rawMetadata.category || "general",
    language: rawMetadata.language || "en",
    submissionMethod: rawMetadata.submissionMethod || "api",
    blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || "localhost",
    
    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Schema identifier for future compatibility
    schema: "proofchain-simple-voting-v2"
  };

  return formattedMetadata;
};

/**
 * Check if metadata is from old commit-reveal system
 * @param {Object} metadata - Metadata object
 * @returns {Boolean} - True if old format
 */
const isLegacyMetadata = (metadata) => {
  return (
    metadata.commitDeadline ||
    metadata.revealDeadline ||
    metadata.votingSystem === "commit-reveal" ||
    (!metadata.version || metadata.version === "1.0")
  );
};

/**
 * Migrate legacy metadata to new format
 * @param {Object} legacyMetadata - Old commit-reveal metadata
 * @returns {Object} - Migrated metadata
 */
const migrateLegacyMetadata = (legacyMetadata) => {
  console.log('Migrating legacy metadata to simple voting format');
  
  const migratedMetadata = {
    ...legacyMetadata,
    
    // Convert commit-reveal deadlines to voting periods
    votingStartTime: legacyMetadata.timestamp || Date.now(),
    votingEndTime: legacyMetadata.revealDeadline || (Date.now() + 24 * 60 * 60 * 1000),
    
    // Update system identifiers
    votingSystem: "simple",
    version: "2.0",
    
    // Remove old fields
    commitDeadline: undefined,
    revealDeadline: undefined,
    
    // Add migration metadata
    migratedFrom: "commit-reveal",
    migrationDate: new Date().toISOString(),
    schema: "proofchain-simple-voting-v2"
  };

  // Clean up undefined fields
  Object.keys(migratedMetadata).forEach(key => {
    if (migratedMetadata[key] === undefined) {
      delete migratedMetadata[key];
    }
  });

  return migratedMetadata;
};

module.exports = {
  validateMetadata,
  formatMetadataForIPFS,
  isLegacyMetadata,
  migrateLegacyMetadata
};