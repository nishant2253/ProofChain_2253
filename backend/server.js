const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const { initRedis } = require("./utils/redis");
const { initializeEventListeners } = require("./services/blockchainService");
const { initializeDefaultTokens } = require("./services/tokenService");

// Load environment variables
dotenv.config();

// Connect to database (will handle errors internally)
connectDB().catch((err) => {
  console.error("Database connection error:", err);
});

// Initialize Redis (will handle errors internally)
initRedis().catch((err) => {
  console.error("Redis initialization error:", err);
});

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    abortOnLimit: true,
  })
);

// Logging middleware in development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Apply rate limiting to all routes
app.use("/api", apiLimiter);

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/tokens", require("./routes/tokenRoutes"));
app.use("/api/results", require("./routes/resultsRoutes"));
app.use("/api/consensus", require("./routes/consensusRoutes"));

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ProofChain API",
    version: "1.0.0",
    status: "running",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );

  // Only initialize blockchain services if not disabled
  if (process.env.DISABLE_BLOCKCHAIN !== "true") {
    // Initialize blockchain event listeners
    try {
      await initializeEventListeners();
      console.log("Blockchain event listeners initialized");
    } catch (error) {
      console.error("Failed to initialize blockchain event listeners:", error);
    }

    // Initialize default tokens if needed
    try {
      await initializeDefaultTokens();
      console.log("Default tokens initialized");
    } catch (error) {
      console.error("Failed to initialize default tokens:", error);
    }
  } else {
    console.log("Blockchain services disabled");
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Don't crash the server, just log the error
});

module.exports = { app, server }; // Export for testing
