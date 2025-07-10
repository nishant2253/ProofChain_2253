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
    commitDeadline: {
      type: Date,
      required: true,
    },
    revealDeadline: {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for status based on deadlines and finalization
contentItemSchema.virtual("status").get(function () {
  const now = new Date();

  if (this.isFinalized) {
    return "finalized";
  } else if (now > this.revealDeadline) {
    return "pendingFinalization";
  } else if (now > this.commitDeadline) {
    return "revealing";
  } else {
    return "committing";
  }
});

// Virtual for time remaining in current phase
contentItemSchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  let deadline;

  if (now <= this.commitDeadline) {
    deadline = this.commitDeadline;
  } else if (now <= this.revealDeadline) {
    deadline = this.revealDeadline;
  } else {
    return 0;
  }

  return Math.max(0, deadline - now);
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
