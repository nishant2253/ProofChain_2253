const { ContentItem, CommitInfo } = require("../models");
const { VOTE_OPTIONS } = require("../utils/constants");

/**
 * Finalize voting for content that has passed its deadline
 */
const finalizeExpiredContent = async () => {
  try {
    const now = new Date();
    
    // Find content that needs finalization
    const expiredContent = await ContentItem.find({
      isFinalized: false,
      commitDeadline: { $lt: now }
    });

    console.log(`Found ${expiredContent.length} content items ready for finalization`);

    for (const content of expiredContent) {
      await finalizeContentVoting(content);
    }

    return expiredContent.length;
  } catch (error) {
    console.error("Error in finalizeExpiredContent:", error);
    throw error;
  }
};

/**
 * Finalize voting for a specific content item
 */
const finalizeContentVoting = async (content) => {
  try {
    console.log(`Finalizing voting for content ${content.contentId}`);

    // Get all votes for this content
    const votes = await CommitInfo.find({ contentId: content.contentId });
    
    if (votes.length === 0) {
      console.log(`No votes found for content ${content.contentId}, marking as finalized with no result`);
      content.isFinalized = true;
      content.winningOption = null;
      await content.save();
      return;
    }

    // Calculate vote distribution and determine winner
    const voteDistribution = [0, 0, 0]; // [reject, accept, abstain]
    let totalStakedUSD = 0;
    const participants = new Set();

    for (const vote of votes) {
      const voteOption = vote.vote;
      const confidence = vote.confidence || 5;
      const stakeAmount = parseFloat(vote.stakeAmount || '0');
      const usdValue = parseFloat(vote.usdValueAtStake || '0');
      
      // Weight calculation: USD value * confidence factor
      const weight = usdValue * (confidence / 10);
      
      if (voteOption >= 0 && voteOption <= 2) {
        voteDistribution[voteOption] += weight;
      }
      
      totalStakedUSD += usdValue;
      participants.add(vote.voter);
    }

    // Determine winning option
    const maxVotes = Math.max(...voteDistribution);
    let winningOption = null;
    
    if (maxVotes > 0) {
      winningOption = voteDistribution.indexOf(maxVotes);
    }

    // Update content with results
    content.voteDistribution = voteDistribution.map(v => v.toString());
    content.totalUSDValue = totalStakedUSD.toString();
    content.participantCount = participants.size;
    content.participants = Array.from(participants);
    content.winningOption = winningOption;
    content.isFinalized = true;

    await content.save();

    console.log(`Content ${content.contentId} finalized:`, {
      winningOption,
      voteDistribution,
      totalStakedUSD,
      participantCount: participants.size
    });

    return {
      contentId: content.contentId,
      winningOption,
      voteDistribution,
      totalStakedUSD,
      participantCount: participants.size
    };

  } catch (error) {
    console.error(`Error finalizing content ${content.contentId}:`, error);
    throw error;
  }
};

/**
 * Get finalization status for content
 */
const getFinalizationStatus = async (contentId) => {
  try {
    const content = await ContentItem.findOne({ contentId });
    if (!content) {
      throw new Error("Content not found");
    }

    const now = new Date();
    const commitDeadline = new Date(content.commitDeadline);
    const votingEnded = now > commitDeadline;
    const timeRemaining = Math.max(0, commitDeadline.getTime() - now.getTime());
    
    console.log(`Finalization status for ${contentId}:`, {
      now: now.toISOString(),
      commitDeadline: commitDeadline.toISOString(),
      votingEnded,
      timeRemaining,
      isFinalized: content.isFinalized
    });
    
    return {
      contentId,
      votingEnded,
      isFinalized: content.isFinalized,
      canFinalize: votingEnded && !content.isFinalized,
      status: content.status,
      timeRemaining,
      results: content.isFinalized ? {
        winningOption: content.winningOption,
        voteDistribution: content.voteDistribution,
        totalStakedUSD: content.totalUSDValue,
        participantCount: content.participantCount
      } : null
    };
  } catch (error) {
    console.error(`Error getting finalization status for ${contentId}:`, error);
    throw error;
  }
};

/**
 * Start automatic finalization service
 */
const startFinalizationService = () => {
  console.log("Starting automatic finalization service...");
  
  // Run finalization check every 5 minutes
  const interval = setInterval(async () => {
    try {
      const finalizedCount = await finalizeExpiredContent();
      if (finalizedCount > 0) {
        console.log(`Automatically finalized ${finalizedCount} content items`);
      }
    } catch (error) {
      console.error("Error in automatic finalization:", error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Also run once immediately
  setTimeout(async () => {
    try {
      const finalizedCount = await finalizeExpiredContent();
      if (finalizedCount > 0) {
        console.log(`Initial finalization completed: ${finalizedCount} items`);
      }
    } catch (error) {
      console.error("Error in initial finalization:", error);
    }
  }, 5000); // 5 seconds after startup

  return interval;
};

module.exports = {
  finalizeExpiredContent,
  finalizeContentVoting,
  getFinalizationStatus,
  startFinalizationService
};