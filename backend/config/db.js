const mongoose = require("mongoose");

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise} MongoDB connection
 */
const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;
    let mongod = null;

    // Check if we should use in-memory MongoDB
    if (
      process.env.NODE_ENV === "development" &&
      (!dbUri || dbUri.includes("localhost")) &&
      process.env.USE_MEMORY_DB === "true" // Only use memory DB if explicitly enabled
    ) {
      try {
        // Dynamically import MongoMemoryServer to avoid requiring it in production
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        console.log("Using MongoDB Memory Server for development");
        mongod = await MongoMemoryServer.create();
        dbUri = mongod.getUri();
      } catch (importError) {
        console.warn(
          "Failed to import mongodb-memory-server. Using configured MongoDB URI."
        );
        console.warn(
          "To use in-memory MongoDB, run: npm install --save-dev mongodb-memory-server"
        );
      }
    } else {
      console.log(`Using MongoDB URI: ${dbUri}`);
    }

    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed some initial data for development
    if (mongod && process.env.NODE_ENV === "development") {
      await seedInitialData();
    }

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(
      "Database operations will fail. Please check your MongoDB connection."
    );
    // Don't exit the process, let the application handle the error gracefully
    return null;
  }
};

// Seed some initial data for development
async function seedInitialData() {
  try {
    const { ContentItem } = require("../models");
    const { VOTE_OPTIONS } = require("../utils/constants");

    // Check if we already have content
    const count = await ContentItem.countDocuments();
    if (count > 0) {
      console.log(
        `Database already has ${count} content items. Skipping seed.`
      );
      return;
    }

    console.log("Seeding initial data...");

    // Create a test content item for unified contract
    const now = new Date();
    const votingDeadline = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now for testing
    const testContent = new ContentItem({
      contentId: 36731,
      ipfsHash:
        "Qm91e44adza7d852fb2e4c57c4399953fb864e318bf330421249a43361c8855e",
      submissionTime: now,
      votingStartTime: now,
      votingEndTime: votingDeadline,
      votingDeadline: votingDeadline, // For unified contract compatibility
      title: "Test Content - Simple Voting",
      description: "This is a test content item for the unified voting system",
      contentType: "image",
      contentUrl: "https://example.com/image.jpg",
      creator: "0xf17cf1e4f18bbe29bdebe37eb3e9aa4c0437a3e5",
      tags: ["test", "development", "simple-voting"],
    });

    await testContent.save();
    console.log("Test content created with ID:", testContent.contentId);
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}

module.exports = connectDB;
