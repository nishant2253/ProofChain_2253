const { ContentItem } = require("../models");
const { VOTE_OPTIONS } = require("../utils/constants");
const { uploadVotingResultsToIPFS } = require("./ipfsService");

/**
 * Finalize voting for content that has passed its deadline (Simple Voting System)
 */
const finalizeExpiredContent = async () => {
  try {
    const now = new Date();
    
    // Find content that needs finalization (updated for simple voting system)
    const expiredContent = await ContentItem.find({
      isFinalized: false,
      isActive: true,
      $or: [
        // New simple voting system
        { votingEndTime: { $lt: now } },
        // Legacy commit-reveal system (for backward compatibility)
        { commitDeadline: { $lt: now } }
      ]
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
 * Finalize voting for a specific content item (Simple Voting System)
 */
const finalizeContentVoting = async (content) => {
  try {
    console.log(`Finalizing voting for content ${content.contentId} (${content.title})`);

    // Get votes from the simple voting system (stored in content.votes array)
    const votes = content.votes || [];
    const upvotes = content.upvotes || 0;
    const downvotes = content.downvotes || 0;
    const totalVotes = votes.length;
    
    if (totalVotes === 0) {
      console.log(`No votes found for content ${content.contentId}, marking as finalized with no result`);
      
      // Create voting results for IPFS
      const votingResults = {
        contentId: content.contentId,
        title: content.title,
        totalVotes: 0,
        upvotes: 0,
        downvotes: 0,
        voteBreakdown: { upvotes: 0, downvotes: 0 },
        votingStartTime: content.votingStartTime,
        votingEndTime: content.votingEndTime,
        participationRate: 0,
        consensus: null,
        blockchainResults: null
      };

      // Upload results to IPFS
      try {
        const resultsHash = await uploadVotingResultsToIPFS(votingResults);
        content.resultsIPFSHash = resultsHash;
        console.log(`Empty voting results uploaded to IPFS: ${resultsHash}`);
      } catch (ipfsError) {
        console.warn(`Failed to upload empty results to IPFS: ${ipfsError.message}`);
      }

      content.isFinalized = true;
      content.winningOption = null;
      content.consensus = null;
      await content.save();
      return votingResults;
    }

    // Calculate vote distribution for simple voting system
    const voteBreakdown = {
      upvotes: upvotes,
      downvotes: downvotes
    };

    // Determine consensus (simple majority)
    let consensus = null;
    let winningOption = null;
    
    if (upvotes > downvotes) {
      consensus = "accept";
      winningOption = 1; // Accept
    } else if (downvotes > upvotes) {
      consensus = "reject";
      winningOption = 0; // Reject
    } else {
      consensus = "tie";
      winningOption = null; // Tie
    }

    // Calculate participation rate (if we have expected participants data)
    const participationRate = totalVotes; // Simple count for now

    // Get unique participants
    const participants = [...new Set(votes.map(vote => vote.voter))];
    const participantCount = participants.length;

    // Create comprehensive voting results
    const votingResults = {
      contentId: content.contentId,
      title: content.title,
      totalVotes: totalVotes,
      upvotes: upvotes,
      downvotes: downvotes,
      voteBreakdown: voteBreakdown,
      votingStartTime: content.votingStartTime,
      votingEndTime: content.votingEndTime,
      participationRate: participationRate,
      consensus: consensus,
      winningOption: winningOption,
      participants: participants,
      participantCount: participantCount,
      blockchainResults: null, // Will be populated if blockchain integration is active
      finalizedAt: new Date().toISOString()
    };

    // Upload voting results to IPFS
    try {
      const resultsHash = await uploadVotingResultsToIPFS(votingResults);
      content.resultsIPFSHash = resultsHash;
      console.log(`Voting results uploaded to IPFS: ${resultsHash}`);
    } catch (ipfsError) {
      console.warn(`Failed to upload voting results to IPFS: ${ipfsError.message}`);
      // Continue with finalization even if IPFS upload fails
    }

    // Update content with finalization results
    content.winningOption = winningOption;
    content.consensus = consensus;
    content.participantCount = participantCount;
    content.participants = participants;
    content.isFinalized = true;
    content.finalizedAt = new Date();

    await content.save();

    console.log(`Content ${content.contentId} finalized:`, {
      consensus,
      winningOption,
      totalVotes,
      upvotes,
      downvotes,
      participantCount,
      resultsIPFSHash: content.resultsIPFSHash
    });

    return votingResults;

  } catch (error) {
    console.error(`Error finalizing content ${content.contentId}:`, error);
    throw error;
  }
};

/**
 * Get finalization status for content (Simple Voting System)
 */
const getFinalizationStatus = async (contentId) => {
  try {
    const content = await ContentItem.findOne({ contentId });
    if (!content) {
      throw new Error("Content not found");
    }

    const now = new Date();
    
    // Handle both new simple voting system and legacy commit-reveal
    let votingEndTime, votingEnded, timeRemaining;
    
    if (content.votingEndTime) {
      // New simple voting system
      votingEndTime = new Date(content.votingEndTime);
      votingEnded = now > votingEndTime;
      timeRemaining = Math.max(0, votingEndTime.getTime() - now.getTime());
    } else if (content.commitDeadline) {
      // Legacy commit-reveal system
      votingEndTime = new Date(content.commitDeadline);
      votingEnded = now > votingEndTime;
      timeRemaining = Math.max(0, votingEndTime.getTime() - now.getTime());
    } else {
      // Fallback
      votingEnded = true;
      timeRemaining = 0;
    }
    
    console.log(`Finalization status for ${contentId}:`, {
      now: now.toISOString(),
      votingEndTime: votingEndTime?.toISOString(),
      votingEnded,
      timeRemaining,
      isFinalized: content.isFinalized,
      votingSystem: content.votingEndTime ? 'simple' : 'legacy'
    });
    
    return {
      contentId,
      votingEnded,
      isFinalized: content.isFinalized,
      canFinalize: votingEnded && !content.isFinalized,
      status: content.status,
      timeRemaining,
      votingSystem: content.votingEndTime ? 'simple' : 'legacy',
      results: content.isFinalized ? {
        winningOption: content.winningOption,
        consensus: content.consensus,
        totalVotes: content.votes ? content.votes.length : 0,
        upvotes: content.upvotes || 0,
        downvotes: content.downvotes || 0,
        participantCount: content.participantCount || 0,
        resultsIPFSHash: content.resultsIPFSHash || null,
        finalizedAt: content.finalizedAt || null
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