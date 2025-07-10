const mongoose = require("mongoose");
const { TOKEN_TYPES, VOTE_OPTIONS } = require("../utils/constants");

/**
 * ContentItem Schema
 * Matches the ContentItem struct in the smart contract
 */
const contentItemSchema = new mongoose.Schema(
  {
    contentId: {
      type: Number,
      required: true,
      unique: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
    submissionTime: {
      type: Date,
      default: Date.now,
    },
    votingStartTime: {
      type: Date,
      required: true,
    },
    votingEndTime: {
      type: Date,
      required: true,
    },
    // Map to totalStakedByToken in the contract
    totalStakedByToken: {
      type: Map,
      of: String, // Using String to handle large numbers
      default: () => {
        const initialMap = new Map();
        Object.values(TOKEN_TYPES).forEach((tokenType) => {
          initialMap.set(tokenType.toString(), "0");
        });
        return initialMap;
      },
    },
    totalUSDValue: {
      type: String, // Using String to handle large numbers
      default: "0",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
    // Vote distribution array [real_votes, fake_votes, ai_generated_votes]
    voteDistribution: {
      type: [String], // Using String array to handle large numbers
      default: ["0", "0", "0"],
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    participants: {
      type: [String], // Array of participant addresses
      default: [],
    },
    // Additional fields for backend use
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    contentType: {
      type: String,
      enum: ["image", "video", "article", "audio", "text", "other"],
      default: "text",
    },
    contentUrl: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    creator: {
      type: String,
      required: true,
      lowercase: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    winningOption: {
      type: Number,
      enum: [...Object.values(VOTE_OPTIONS), null],
      default: null,
    },
    transactionHash: {
      type: String,
      default: "",
    },
    votes: [{
      voter: {
        type: String,
        required: true,
      },
      vote: {
        type: Number,
        required: true, // 1 for upvote, 0 for downvote
      },
      tokenType: {
        type: Number,
        required: true,
      },
      stakeAmount: {
        type: String,
        required: true,
      },
      confidence: {
        type: Number,
        default: 5,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for status based on voting period and finalization
contentItemSchema.virtual("status").get(function () {
  const now = new Date();

  if (this.isFinalized) {
    return "finalized";
  }
  
  // Handle legacy content with old commit-reveal deadlines
  if (this.commitDeadline && this.revealDeadline && !this.votingStartTime && !this.votingEndTime) {
    if (now < this.commitDeadline) {
      return "pending"; // Treat as pending until migrated
    } else if (now < this.revealDeadline) {
      return "live"; // Treat as live voting period
    } else {
      return "expired";
    }
  }
  
  // New simple voting system
  if (this.votingStartTime && this.votingEndTime) {
    if (now > this.votingEndTime) {
      return "expired";
    } else if (now >= this.votingStartTime && now <= this.votingEndTime) {
      return "live";
    } else {
      return "pending";
    }
  }
  
  // Fallback for content without proper voting periods
  return "pending";
});

// Virtual for time remaining in voting period
contentItemSchema.virtual("timeRemaining").get(function () {
  const now = new Date();

  if (now < this.votingStartTime) {
    // Time until voting starts
    return Math.max(0, this.votingStartTime - now);
  } else if (now <= this.votingEndTime) {
    // Time until voting ends
    return Math.max(0, this.votingEndTime - now);
  } else {
    return 0;
  }
});

// Virtual for winning vote option name
contentItemSchema.virtual("winningOptionName").get(function () {
  if (this.winningOption === null) return null;
  return Object.keys(VOTE_OPTIONS).find(
    (key) => VOTE_OPTIONS[key] === this.winningOption
  );
});

// Method to update total staked amount for a token type
contentItemSchema.methods.updateTotalStakedByToken = function (
  tokenType,
  amount
) {
  const currentAmount = BigInt(
    this.totalStakedByToken.get(tokenType.toString()) || "0"
  );
  const newAmount = (currentAmount + BigInt(amount)).toString();
  this.totalStakedByToken.set(tokenType.toString(), newAmount);
  return newAmount;
};

// Method to update vote distribution
contentItemSchema.methods.updateVoteDistribution = function (
  voteOption,
  weight
) {
  const currentWeight = BigInt(this.voteDistribution[voteOption]);
  const newWeight = (currentWeight + BigInt(weight)).toString();
  this.voteDistribution[voteOption] = newWeight;
  return this.voteDistribution;
};

const ContentItem = mongoose.model("ContentItem", contentItemSchema);

module.exports = ContentItem;
