const asyncHandler = require("express-async-handler");
const {
  createContent,
  getContentById,
  getContentList,
  commitVote,
  revealVote,
  getSavedCommitData,
} = require("../services/contentService");
const { finalizeMultiTokenVoting } = require("../services/blockchainService");
const { ethers } = require("ethers");

/**
 * @desc    Create new content
 * @route   POST /api/content
 * @access  Private
 */
const createNewContent = asyncHandler(async (req, res) => {
  const { title, description, votingStartTime, votingEndTime, tags } = req.body;
  let { contentType } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }

  // File is optional - check if it exists
  let fileBuffer = null;
  let fileName = null;

  if (req.files && req.files.file) {
    const file = req.files.file;
    fileBuffer = file.data;
    fileName = file.name;
  } else {
    // If no file is provided, default to "text" content type
    contentType = contentType || "text";
  }

  // File handling is now done above

  let wallet;

  // Check if blockchain is disabled
  if (process.env.DISABLE_BLOCKCHAIN === "true") {
    console.log("Blockchain disabled. Using mock wallet.");
    wallet = {
      address: "0x1234567890123456789012345678901234567890",
    };
  } else {
    // Create signer from private key (in a real app, this would be from the frontend wallet)
    // This is just for demo purposes
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL
    );
    wallet = new ethers.Wallet(process.env.DEMO_PRIVATE_KEY, provider);
  }

  const contentData = {
    title,
    description,
    contentType,
    votingStartTime: votingStartTime ? parseInt(votingStartTime) : undefined,
    votingEndTime: votingEndTime ? parseInt(votingEndTime) : undefined,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
  };

  const content = await createContent(
    contentData,
    fileBuffer,
    fileName,
    wallet
  );

  res.status(201).json(content);
});

/**
 * @desc    Get content by ID
 * @route   GET /api/content/:id
 * @access  Public
 */
const getContent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await getContentById(id);

  if (!content) {
    res.status(404);
    throw new Error("Content not found");
  }

  res.json(content);
});

/**
 * @desc    Get content list with pagination and filtering
 * @route   GET /api/content
 * @access  Public
 */
const listContent = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "submissionTime",
    sortOrder = "desc",
    status,
    creator,
    contentType,
    tags,
  } = req.query;

  // Parse tags if provided
  const parsedTags = tags
    ? tags.split(",").map((tag) => tag.trim())
    : undefined;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    status,
    creator,
    contentType,
    tags: parsedTags,
  };

  const contentList = await getContentList(options);

  res.json(contentList);
});

/**
 * @desc    Commit vote for content
 * @route   POST /api/content/:id/commit
 * @access  Private
 */
const commitVoteForContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vote, confidence, tokenType, stakeAmount, merkleProof, transactionHash, salt, blockNumber } = req.body;

  // In development mode, we'll provide a mock merkleProof if it's not provided
  let proofToUse = merkleProof;

  if (!proofToUse && process.env.NODE_ENV === "development") {
    console.log("Using mock merkleProof for development");
    proofToUse = [
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ];
  }

  console.log("Received commit vote request:");
  console.log("  vote:", vote);
  console.log("  confidence:", confidence);
  console.log("  tokenType:", tokenType);
  console.log("  stakeAmount:", stakeAmount);
  console.log("  merkleProof:", merkleProof);
  console.log("  proofToUse:", proofToUse);
  console.log("  transactionHash:", transactionHash);
  console.log("  salt:", salt);
  console.log("  blockNumber:", blockNumber);
  console.log("  user address:", req.user?.address);

  if (
    vote === undefined ||
    confidence === undefined ||
    tokenType === undefined ||
    stakeAmount === undefined ||
    !proofToUse ||
    !transactionHash
  ) {
    res.status(400);
    throw new Error(
      "Vote, confidence, tokenType, stakeAmount, merkleProof, and transactionHash are required"
    );
  }

  // Convert MongoDB ObjectId to numeric contentId for smart contract
  let contentId;
  if (!isNaN(id)) {
    contentId = parseInt(id);
  } else {
    // Convert MongoDB ObjectId to numeric value using hash
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(id));
    contentId = ethers.BigNumber.from(hash).mod(ethers.BigNumber.from("999999999")).toNumber();
  }
  
  console.log("Converting MongoDB ID to contentId for commit smart contract:");
  console.log("  MongoDB ID:", id);
  console.log("  Numeric contentId:", contentId);

  const result = await commitVote(
    contentId,
    parseInt(vote),
    parseInt(confidence),
    parseInt(tokenType),
    stakeAmount,
    proofToUse,
    transactionHash,
    req.user?.address,
    salt
  );

  res.json(result);
});

/**
 * @desc    Reveal vote for content
 * @route   POST /api/content/:id/reveal
 * @access  Private
 */
const revealVoteForContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vote, confidence, salt } = req.body;

  if (vote === undefined || !confidence || !salt) {
    res.status(400);
    throw new Error("Vote, confidence, and salt are required");
  }

  // Create signer from private key (in a real app, this would be from the frontend wallet)
  // This is just for demo purposes
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL
  );
  const wallet = new ethers.Wallet(process.env.DEMO_PRIVATE_KEY, provider);

  // Convert MongoDB ObjectId to numeric contentId for smart contract
  let contentId;
  if (!isNaN(id)) {
    contentId = parseInt(id);
  } else {
    // Convert MongoDB ObjectId to numeric value using hash
    const { ethers } = require("ethers");
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(id));
    contentId = ethers.BigNumber.from(hash).mod(ethers.BigNumber.from("999999999")).toNumber();
  }
  
  console.log("Converting MongoDB ID to contentId for smart contract:");
  console.log("  MongoDB ID:", id);
  console.log("  Numeric contentId:", contentId);

  const result = await revealVote(
    contentId,
    parseInt(vote),
    parseInt(confidence),
    salt,
    wallet
  );

  res.json(result);
});

/**
 * @desc    Get saved commit data for content
 * @route   GET /api/content/:id/commit
 * @access  Public (with address parameter) or Private
 */
const getSavedCommit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { address } = req.query;

  // Get user address from query params or authenticated user
  let userAddress;

  if (address) {
    // If address is provided in query params, use it
    userAddress = address;
  } else if (req.user && req.user.address) {
    // If user is authenticated, use their address
    userAddress = req.user.address;
  } else {
    // If no address is provided and user is not authenticated
    res.status(401);
    throw new Error(
      "You must provide an address or be logged in to check vote status"
    );
  }

  // Convert id to number if it's a numeric string
  const contentId = !isNaN(id) ? parseInt(id) : id;

  // First check if the content exists
  const content = await getContentById(contentId);
  if (!content) {
    res.status(404);
    throw new Error("Content not found");
  }

  const commitData = await getSavedCommitData(contentId, userAddress);

  if (!commitData) {
    // Return a 200 status with a message instead of a 404 error
    return res.status(200).json({
      hasVoted: false,
      message:
        "No saved commit found for this content. You haven't voted on this content yet.",
    });
  }

  // Add hasVoted flag to the response
  res.json({
    ...commitData,
    hasVoted: true,
  });
});

/**
 * @desc    Finalize voting for content
 * @route   POST /api/content/:id/finalize
 * @access  Private
 */
const finalizeVoting = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Create signer from private key (in a real app, this would be from the frontend wallet)
  // This is just for demo purposes
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL
  );
  const wallet = new ethers.Wallet(process.env.DEMO_PRIVATE_KEY, provider);

  const result = await finalizeMultiTokenVoting(id, wallet);

  res.json(result);
});

module.exports = {
  createNewContent,
  getContent,
  listContent,
  commitVoteForContent,
  revealVoteForContent,
  getSavedCommit,
  finalizeVoting,
};
