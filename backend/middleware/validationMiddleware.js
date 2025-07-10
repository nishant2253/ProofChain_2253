const Joi = require("joi");

/**
 * Validate request body against schema
 * @param {Object} schema - Joi schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      res.status(400);
      const err = new Error(error.details[0].message);
      err.details = error.details; // Attach Joi details
      throw err;
    }

    next();
  };
};

/**
 * Validate request query against schema
 * @param {Object} schema - Joi schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);

    if (error) {
      res.status(400);
      const err = new Error(error.details[0].message);
      err.details = error.details; // Attach Joi details
      throw err;
    }

    next();
  };
};

/**
 * Validate request params against schema
 * @param {Object} schema - Joi schema
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);

    if (error) {
      res.status(400);
      const err = new Error(error.details[0].message);
      err.details = error.details; // Attach Joi details
      throw err;
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  // User schemas
  registerUser: Joi.object({
    address: Joi.string().required(),
    signature: Joi.string().optional(),
    userData: Joi.object({
      username: Joi.string().optional(),
      email: Joi.string().email().optional(),
      bio: Joi.string().optional(),
      profileImageUrl: Joi.string().uri().optional(),
    }).optional(),
  }),

  // Content schemas
  createContent: Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    contentType: Joi.string().valid(
      "image",
      "video",
      "article",
      "audio",
      "other"
    ),
    votingDuration: Joi.number().integer().min(86400), // Minimum 24 hours
    tags: Joi.string(),
  }),

  commitVote: Joi.object({
    vote: Joi.number().integer().min(0).max(2).required(),
    confidence: Joi.number().integer().min(1).max(10).required(),
    tokenType: Joi.number().integer().min(0).max(7).required(),
    stakeAmount: Joi.string().required(),
    merkleProof: Joi.array().items(Joi.string()).required(),
    transactionHash: Joi.string().required(),
    salt: Joi.string().optional(), // Salt is stored separately for reveal phase
    blockNumber: Joi.number().integer().optional(),
  }),

  revealVote: Joi.object({
    vote: Joi.number().integer().min(0).max(2).required(),
    confidence: Joi.number().integer().min(1).max(10).required(),
    salt: Joi.string().required(),
    transactionHash: Joi.string().optional(),
  }),

  // Token schemas
  convertToUSD: Joi.object({
    tokenType: Joi.number().integer().min(0).max(7).required(),
    amount: Joi.string().required(),
  }),
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  schemas,
};
