/**
 * Constants matching the enums and other values from the smart contract
 */

// Token types from the smart contract enum TokenType
const TOKEN_TYPES = {
  BTC: 0,
  ETH: 1,
  MATIC: 2,
  FIL: 3,
  USDC: 4,
  USDT: 5,
  DOT: 6,
  SOL: 7,
};

// Vote options from the smart contract enum VoteOption
const VOTE_OPTIONS = {
  REAL: 0,
  FAKE: 1,
  AI_GENERATED: 2,
};

// Constants from the smart contract
const MIN_VOTING_PERIOD = 60; // 1 minute in seconds (SimpleVoting contract)
const MIN_STAKE_DURATION = 48 * 60 * 60; // 48 hours in seconds
const MAX_QUADRATIC_VOTES_USD = 10000;
const CONFIDENCE_THRESHOLD = 60;
const ANTI_SYBIL_THRESHOLD_USD = 100;
const BFT_THRESHOLD = 67;

module.exports = {
  TOKEN_TYPES,
  VOTE_OPTIONS,
  MIN_VOTING_PERIOD,
  MIN_STAKE_DURATION,
  MAX_QUADRATIC_VOTES_USD,
  CONFIDENCE_THRESHOLD,
  ANTI_SYBIL_THRESHOLD_USD,
  BFT_THRESHOLD,
};
