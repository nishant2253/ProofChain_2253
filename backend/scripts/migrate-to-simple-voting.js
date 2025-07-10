const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proofchain';

async function migrateToSimpleVoting() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all content items that have old commit-reveal fields
    const oldContentItems = await ContentItem.find({
      $or: [
        { commitDeadline: { $exists: true } },
        { revealDeadline: { $exists: true } }
      ]
    });

    console.log(`Found ${oldContentItems.length} content items to migrate`);

    for (const content of oldContentItems) {
      console.log(`Migrating content ID: ${content.contentId}`);
      
      // Convert old deadlines to new voting periods
      const now = new Date();
      let votingStartTime, votingEndTime;

      if (content.commitDeadline && content.revealDeadline) {
        // Use existing deadlines as reference
        votingStartTime = content.submissionTime || now;
        votingEndTime = content.revealDeadline;
      } else {
        // Set default voting period (24 hours from now)
        votingStartTime = now;
        votingEndTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }

      // Update the content item
      await ContentItem.updateOne(
        { _id: content._id },
        {
          $set: {
            votingStartTime: votingStartTime,
            votingEndTime: votingEndTime,
            votes: content.votes || [],
            upvotes: content.upvotes || 0,
            downvotes: content.downvotes || 0
          },
          $unset: {
            commitDeadline: "",
            revealDeadline: ""
          }
        }
      );

      console.log(`✓ Migrated content ${content.contentId}`);
    }

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateToSimpleVoting();