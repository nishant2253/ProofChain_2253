const ContentItem = require("../models/ContentItem");

/**
 * Update content status based on voting deadlines
 * This should be called periodically or when content is accessed
 */
const updateContentStatuses = async () => {
  try {
    const now = new Date();
    
    // Find content that should be expired but isn't marked as such
    const expiredContent = await ContentItem.find({
      $or: [
        { status: 'live' },
        { status: 'active' },
        { status: { $exists: false } }
      ],
      $or: [
        { votingEndTime: { $lt: now } },
        { votingDeadline: { $lt: now } },
        { revealDeadline: { $lt: now } }
      ]
    });

    console.log(`Found ${expiredContent.length} content items to mark as expired`);

    // Update each expired content
    for (const content of expiredContent) {
      content.status = 'expired';
      await content.save();
      console.log(`Marked content ${content.contentId || content._id} as expired`);
    }

    return expiredContent.length;
  } catch (error) {
    console.error('Error updating content statuses:', error);
    return 0;
  }
};

/**
 * Update a single content item's status
 */
const updateSingleContentStatus = async (contentId) => {
  try {
    let content;
    const numericContentId = parseInt(contentId);
    
    if (!isNaN(numericContentId)) {
      content = await ContentItem.findOne({ contentId: numericContentId });
    }
    
    if (!content && typeof contentId === 'string' && contentId.match(/^[0-9a-fA-F]{24}$/)) {
      content = await ContentItem.findById(contentId);
    }

    if (!content) {
      return null;
    }

    const now = new Date();
    const votingEndTime = content.votingEndTime || content.votingDeadline || content.revealDeadline;
    
    if (votingEndTime && new Date(votingEndTime) < now && content.status !== 'expired' && content.status !== 'finalized') {
      content.status = 'expired';
      await content.save();
      console.log(`Updated content ${content.contentId || content._id} status to expired`);
    }

    return content;
  } catch (error) {
    console.error('Error updating single content status:', error);
    return null;
  }
};

module.exports = {
  updateContentStatuses,
  updateSingleContentStatus
};