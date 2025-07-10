const { ethers } = require('ethers');

/**
 * Consensus Service - Implements quadratic staking mechanism for voting results
 */

/**
 * Calculate quadratic voting weight based on USD stake amount
 * Formula: weight = sqrt(usdValue)
 * @param {number} usdValue - USD value of stake
 * @returns {number} - Quadratic voting weight
 */
const calculateQuadraticWeight = (usdValue) => {
  if (usdValue <= 0) return 0;
  return Math.sqrt(usdValue);
};

/**
 * Convert token amount to USD value (simplified - in production use real price feeds)
 * @param {number} tokenType - Token type (0=BTC, 1=ETH, 2=USDFC, etc.)
 * @param {string} amount - Token amount as string
 * @returns {number} - USD value
 */
const convertToUSD = (tokenType, amount) => {
  // Simplified price conversion - in production, use real price oracles
  const prices = {
    0: 45000,  // BTC
    1: 2500,   // ETH/tFIL
    2: 1,      // USDFC
    3: 0.8,    // MATIC
    4: 5,      // FIL
    5: 1,      // USDC
    6: 1,      // USDT
    7: 6,      // DOT
    8: 100,    // SOL
  };
  
  const decimals = {
    0: 8,   // BTC
    1: 18,  // ETH/tFIL
    2: 6,   // USDFC
    3: 18,  // MATIC
    4: 18,  // FIL
    5: 6,   // USDC
    6: 6,   // USDT
    7: 10,  // DOT
    8: 9,   // SOL
  };
  
  const price = prices[tokenType] || 1;
  const decimal = decimals[tokenType] || 18;
  const tokenAmount = parseFloat(amount);
  
  return tokenAmount * price;
};

/**
 * Calculate consensus results using quadratic staking mechanism
 * @param {Array} votes - Array of vote objects
 * @returns {Object} - Consensus results
 */
const calculateConsensusResults = async (votes) => {
  if (!votes || votes.length === 0) {
    return {
      verdict: null,
      confidence: 0,
      totalStaked: 0,
      participantCount: 0,
      voteBreakdown: { accept: 0, reject: 0, abstain: 0 },
      quadraticWeights: { accept: 0, reject: 0, abstain: 0 }
    };
  }

  const voteBreakdown = { accept: 0, reject: 0, abstain: 0 };
  const quadraticWeights = { accept: 0, reject: 0, abstain: 0 };
  const confidenceSum = { accept: 0, reject: 0, abstain: 0 };
  const confidenceCount = { accept: 0, reject: 0, abstain: 0 };
  
  let totalStaked = 0;
  let totalQuadraticWeight = 0;

  // Process each vote
  for (const vote of votes) {
    try {
      // Convert stake to USD
      const usdValue = convertToUSD(vote.tokenType, vote.stakeAmount);
      totalStaked += usdValue;
      
      // Calculate quadratic weight
      const quadraticWeight = calculateQuadraticWeight(usdValue);
      totalQuadraticWeight += quadraticWeight;
      
      // Determine vote type
      let voteType;
      switch (parseInt(vote.vote)) {
        case 0:
          voteType = 'reject';
          break;
        case 1:
          voteType = 'accept';
          break;
        case 2:
        default:
          voteType = 'abstain';
          break;
      }
      
      // Add to vote breakdown
      voteBreakdown[voteType] += 1;
      quadraticWeights[voteType] += quadraticWeight;
      
      // Add confidence (weighted by quadratic stake)
      const confidence = parseInt(vote.confidence) || 5;
      confidenceSum[voteType] += confidence * quadraticWeight;
      confidenceCount[voteType] += quadraticWeight;
      
    } catch (error) {
      console.error('Error processing vote:', error);
      // Continue processing other votes
    }
  }

  // Determine winning verdict based on quadratic weights
  let verdict = null;
  let maxWeight = 0;
  let winningConfidence = 0;

  for (const [voteType, weight] of Object.entries(quadraticWeights)) {
    if (weight > maxWeight) {
      maxWeight = weight;
      verdict = voteType;
      // Calculate weighted average confidence for winning option
      winningConfidence = confidenceCount[voteType] > 0 
        ? Math.round(confidenceSum[voteType] / confidenceCount[voteType])
        : 0;
    }
  }

  // Require minimum participation and consensus threshold
  const participantCount = votes.length;
  const consensusThreshold = 0.51; // 51% of quadratic weight needed
  const consensusReached = maxWeight / totalQuadraticWeight >= consensusThreshold;

  // Map verdict to display format
  let finalVerdict = null;
  if (consensusReached && verdict) {
    switch (verdict) {
      case 'accept':
        finalVerdict = 'real';
        break;
      case 'reject':
        finalVerdict = 'fake';
        break;
      case 'abstain':
        finalVerdict = 'abstained';
        break;
    }
  }

  return {
    verdict: finalVerdict,
    confidence: winningConfidence,
    totalStaked: Math.round(totalStaked * 100) / 100, // Round to 2 decimal places
    participantCount,
    voteBreakdown,
    quadraticWeights,
    consensusReached,
    consensusThreshold: consensusThreshold * 100, // Convert to percentage
    winningWeight: maxWeight,
    totalWeight: totalQuadraticWeight
  };
};

/**
 * Check if voting period has ended for content
 * @param {Object} content - Content object
 * @returns {boolean} - Whether voting has ended
 */
const hasVotingEnded = (content) => {
  const now = Date.now();
  const submissionTime = new Date(content.createdAt).getTime();
  const votingEndTime = submissionTime + (24 * 60 * 60 * 1000); // 24 hours voting period
  
  return now >= votingEndTime;
};

/**
 * Check if rewards can be claimed for content
 * @param {Object} content - Content object
 * @returns {boolean} - Whether rewards can be claimed
 */
const canClaimRewards = (content) => {
  const now = Date.now();
  const submissionTime = new Date(content.createdAt).getTime();
  const rewardClaimTime = submissionTime + (72 * 60 * 60 * 1000); // 72 hours total (24h voting + 48h delay)
  
  return now >= rewardClaimTime;
};

/**
 * Process consensus for content that has ended voting
 * @param {Object} content - Content object
 * @param {Array} votes - Array of votes for this content
 * @returns {Object} - Updated content with consensus results
 */
const processContentConsensus = async (content, votes) => {
  if (!hasVotingEnded(content)) {
    return {
      ...content,
      consensusResult: null,
      status: 'voting'
    };
  }

  const consensusResult = await calculateConsensusResults(votes);
  const canClaim = canClaimRewards(content);
  
  return {
    ...content,
    consensusResult: {
      ...consensusResult,
      canClaimRewards: canClaim,
      rewardClaimAvailableAt: new Date(new Date(content.createdAt).getTime() + (72 * 60 * 60 * 1000))
    },
    status: 'results'
  };
};

module.exports = {
  calculateQuadraticWeight,
  convertToUSD,
  calculateConsensusResults,
  hasVotingEnded,
  canClaimRewards,
  processContentConsensus
};