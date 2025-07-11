const ContentItem = require("../models/ContentItem");

/**
 * @desc    Get voting results for expired content
 * @route   GET /api/results/:contentId
 * @access  Public
 */
const getVotingResults = async (req, res) => {
  try {
    const { contentId } = req.params;

    // Find content by contentId (numeric) or _id
    let content;
    const numericContentId = parseInt(contentId);
    
    if (!isNaN(numericContentId)) {
      content = await ContentItem.findOne({ contentId: numericContentId });
    }
    
    if (!content && typeof contentId === 'string' && contentId.match(/^[0-9a-fA-F]{24}$/)) {
      content = await ContentItem.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    // Check if voting has expired - auto-update status if needed
    const now = new Date();
    const votingEndTime = content.votingEndTime || content.votingDeadline || content.revealDeadline;
    
    if (votingEndTime && new Date(votingEndTime) <= now && content.status !== 'expired' && content.status !== 'finalized') {
      // Auto-update status to expired
      content.status = 'expired';
      await content.save();
      console.log(`Auto-updated content ${content.contentId || content._id} status to expired`);
    }
    
    const isExpired = content.status === 'expired' || content.status === 'finalized';
    
    if (!isExpired) {
      return res.status(400).json({
        success: false,
        message: "Voting is still active. Results not available yet."
      });
    }

    // Calculate quadratic voting results
    const results = calculateQuadraticResults(content);

    res.json({
      success: true,
      data: {
        contentId: content.contentId || content._id,
        title: content.title,
        status: content.status,
        votingEndTime: content.votingEndTime || content.votingDeadline,
        totalVotes: content.votes?.length || 0,
        totalParticipants: content.participantCount || content.votes?.length || 0,
        results: results,
        isFinalized: content.isFinalized || false,
        winningOption: content.winningOption,
        finalVerdict: results.verdict
      }
    });

  } catch (error) {
    console.error("Error getting voting results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get voting results"
    });
  }
};

/**
 * Calculate quadratic voting results based on votes
 * Implements the same logic as the smart contract
 */
function calculateQuadraticResults(content) {
  const votes = content.votes || [];
  
  if (votes.length === 0) {
    return {
      realVotes: 0,
      fakeVotes: 0,
      totalWeight: 0,
      verdict: "No votes cast",
      confidence: 0,
      breakdown: {
        upvotes: { count: 0, weight: 0 },
        downvotes: { count: 0, weight: 0 }
      }
    };
  }

  let realWeight = 0;
  let fakeWeight = 0;
  let upvoteCount = 0;
  let downvoteCount = 0;
  let upvoteWeight = 0;
  let downvoteWeight = 0;

  // Process each vote using quadratic voting formula
  votes.forEach(vote => {
    // Calculate USD value (simplified - in production this would use real price feeds)
    const usdValue = parseFloat(vote.stakeAmount) || 1; // Fallback to $1 if no stake
    
    // Quadratic voting formula: weight = sqrt(usdValue) * confidence * bonus
    // Using simplified bonus of 1.0 (100%) for now
    const baseWeight = Math.sqrt(usdValue);
    const confidence = vote.confidence || 5;
    const weight = baseWeight * (confidence / 10); // Normalize confidence to 0-1 range
    
    if (vote.vote === 1) {
      // Upvote = Real content
      realWeight += weight;
      upvoteCount++;
      upvoteWeight += weight;
    } else {
      // Downvote = Fake content
      fakeWeight += weight;
      downvoteCount++;
      downvoteWeight += weight;
    }
  });

  const totalWeight = realWeight + fakeWeight;
  const realPercentage = totalWeight > 0 ? (realWeight / totalWeight) * 100 : 0;
  const fakePercentage = totalWeight > 0 ? (fakeWeight / totalWeight) * 100 : 0;

  // Determine verdict based on weighted votes
  let verdict;
  let confidence;
  
  if (realWeight > fakeWeight) {
    verdict = "REAL";
    confidence = realPercentage;
  } else if (fakeWeight > realWeight) {
    verdict = "FAKE";
    confidence = fakePercentage;
  } else {
    verdict = "TIE";
    confidence = 50;
  }

  return {
    realVotes: realWeight,
    fakeVotes: fakeWeight,
    totalWeight: totalWeight,
    verdict: verdict,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
    breakdown: {
      upvotes: { 
        count: upvoteCount, 
        weight: Math.round(upvoteWeight * 100) / 100,
        percentage: Math.round(realPercentage * 100) / 100
      },
      downvotes: { 
        count: downvoteCount, 
        weight: Math.round(downvoteWeight * 100) / 100,
        percentage: Math.round(fakePercentage * 100) / 100
      }
    },
    votingMethod: "Quadratic Voting",
    formula: "weight = sqrt(usdValue) * confidence"
  };
}

/**
 * @desc    Finalize voting results (admin only)
 * @route   POST /api/results/:contentId/finalize
 * @access  Private (Admin)
 */
const finalizeVotingResults = async (req, res) => {
  try {
    const { contentId } = req.params;

    // Find content
    let content;
    const numericContentId = parseInt(contentId);
    
    if (!isNaN(numericContentId)) {
      content = await ContentItem.findOne({ contentId: numericContentId });
    }
    
    if (!content && typeof contentId === 'string' && contentId.match(/^[0-9a-fA-F]{24}$/)) {
      content = await ContentItem.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    // Check if voting has expired
    if (content.status !== 'expired') {
      return res.status(400).json({
        success: false,
        message: "Cannot finalize active voting"
      });
    }

    // Calculate final results
    const results = calculateQuadraticResults(content);
    
    // Update content with final results
    content.isFinalized = true;
    content.winningOption = results.verdict === "REAL" ? 1 : 0; // 1 for real, 0 for fake
    
    await content.save();

    res.json({
      success: true,
      message: "Voting results finalized",
      data: {
        contentId: content.contentId || content._id,
        finalVerdict: results.verdict,
        confidence: results.confidence,
        isFinalized: true
      }
    });

  } catch (error) {
    console.error("Error finalizing voting results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to finalize voting results"
    });
  }
};

module.exports = {
  getVotingResults,
  finalizeVotingResults
};