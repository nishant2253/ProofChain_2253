# 🔗 ProofChain - Decentralized Content Verification Platform

> **Revolutionizing truth verification through blockchain-powered community consensus**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8+-purple.svg)](https://soliditylang.org/)

## 🎯 **Project Motto & Objective**

**"Empowering Truth Through Collective Intelligence"**

ProofChain is a revolutionary decentralized platform that harnesses the power of community consensus to verify the authenticity of digital content. In an era of misinformation and deepfakes, we provide a transparent, incentivized system where users stake tokens to vote on content authenticity, creating a self-regulating ecosystem of truth verification.

## 🌍 **Problem We're Solving**

### **The Misinformation Crisis**

- **Deepfakes & AI-generated content** flooding the internet
- **Lack of reliable verification** mechanisms for digital content
- **Centralized fact-checking** prone to bias and manipulation
- **No economic incentives** for quality verification
- **Difficulty distinguishing** authentic from fabricated content

### **Our Solution:**

- **Decentralized verification** through community consensus
- **Economic incentives** via token staking and rewards
- **Transparent voting** with quadratic weighting system
- **Real-time consensus** tracking and results
- **Immutable records** on blockchain for accountability

## 🚀 **Impact & Value Proposition**

### **For Content Creators:**

- ✅ **Prove authenticity** of their original work
- ✅ **Earn rewards** for submitting genuine content
- ✅ **Build reputation** through verified contributions
- ✅ **Protect intellectual property** with blockchain records

### **For Verifiers:**

- ✅ **Earn tokens** by participating in verification
- ✅ **Contribute to truth** and fight misinformation
- ✅ **Build expertise** in content analysis
- ✅ **Access exclusive features** through reputation system

### **For Society:**

- ✅ **Reduce misinformation** spread across platforms
- ✅ **Increase trust** in digital content
- ✅ **Create accountability** for content creators
- ✅ **Foster informed decision-making** based on verified information

## ✨ **Key Features**

### 🔐 **Decentralized Verification System**

- **Community-driven consensus** on content authenticity
- **Quadratic voting** with stake-weighted influence
- **48-hour security delays** for reward claiming
- **Transparent results** with confidence scoring

### 💰 **Incentivized Participation**

- **Token staking** for voting participation
- **Progressive rewards** based on consensus contribution
- **Reputation system** with verification badges
- **Real-time earnings** tracking and claiming

### 📊 **Real-Time Consensus Dashboard**

- **Live voting statistics** and participant tracking
- **Interactive content cards** with status indicators
- **Auto-refreshing data** every 30 seconds
- **Mobile-responsive design** with dark/light themes

### 🛡️ **Security & Trust**

- **Smart contract governance** on Filecoin blockchain
- **IPFS storage** for decentralized content hosting
- **Merkle tree verification** for user eligibility
- **Multi-token support** (ETH, USDFC, FIL)

### **4. Access Application**

- **Frontend**: http://localhost:5003
- **Backend API**: http://localhost:3000/api
- **Blockchain**: http://localhost:8545

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │   Blockchain    │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ • User Interface│    │ • API Server    │    │ • Smart Contract│
│ • Wallet Connect│    │ • Database      │    │ • Token Logic   │
│ • Real-time UI  │    │ • IPFS Gateway  │    │ • Voting System │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 **Core Workflow**

### **1. Content Submission Process**

```
User → Upload Content → IPFS Storage → Blockchain Registration → Voting Period Starts
```

### **2. Voting Process**

```
User → Connect Wallet → Stake Tokens → Submit Vote → Blockchain Transaction → Database Record
```

### **3. Consensus & Rewards**

```
Voting Ends → Results Calculated → 48hr Delay → Rewards Claimable → Reputation Updated
```

### **4. Key User Actions**

- **Submit Content**: Upload files/text with metadata to IPFS
- **Vote on Content**: Stake tokens (ETH, USDFC, FIL) with confidence levels
- **Claim Rewards**: Collect earnings after 48-hour security delay
- **Build Reputation**: Gain points through accurate voting and quality content

## 📁 **Project Structure**

### **🎨 Frontend (`/frontend`)**

**Technology Stack:** React.js 18+, Tailwind CSS, ether.js, Axios

**Key Components:**

- **Profile Page**: Real-time consensus data and reward claiming
- **Voting Interface**: Interactive content verification system
- **Wallet Integration**: MetaMask and Web3 wallet support
- **Results Dashboard**: Comprehensive voting results display

**Features:**

- Responsive design with dark/light theme support
- Real-time updates every 30 seconds
- Progressive Web App (PWA) capabilities
- Error boundaries and graceful fallbacks

### **⚙️ Backend (`/backend`)**

**Technology Stack:** Node.js, Express.js, MongoDB, Mongoose, Redis (optional)

**Core Services:**

- **User Management**: Profile creation, reputation tracking
- **Content Service**: IPFS integration, metadata validation
- **Consensus Engine**: Vote processing, result calculation
- **Blockchain Service**: Smart contract interaction
- **Reward System**: 48-hour delay validation, progressive calculation

**API Endpoints:**

```
# User Management
POST /api/users                      # Register new user
GET  /api/users/:address             # Get user profile by address
GET  /api/users/me                   # Get current user profile (protected)
PUT  /api/users/me                   # Update user profile (protected)
POST /api/users/verify               # Verify user identity (protected)
GET  /api/users/:address/votes       # Get user voting history
GET  /api/users/me/votes             # Get my voting history (protected)
GET  /api/users/:address/reputation-history  # Get reputation history
GET  /api/users/me/reputation-history        # Get my reputation (protected)
GET  /api/users/:address/content     # Get user's submitted content
GET  /api/users/me/content           # Get my content (protected)
POST /api/users/me/content/:id/claim-reward  # Claim content reward (protected)

# Content Management
GET  /api/content                    # List all content with pagination
GET  /api/content/:id                # Get specific content by ID
POST /api/content                    # Submit new content (protected)
PUT  /api/content/:id                # Update content (protected)
DELETE /api/content/:id              # Delete content (protected)
GET  /api/content/:id/commit         # Get saved commit for content
POST /api/content/:id/commit         # Commit vote (protected, verified only)
POST /api/content/:id/reveal         # Reveal vote (protected)
POST /api/content/:id/finalize       # Finalize voting (protected)

# Token Management
GET  /api/tokens                     # Get all tokens
GET  /api/tokens/supported           # Get supported tokens
GET  /api/tokens/distribution        # Get token distribution
GET  /api/tokens/:type               # Get specific token info
POST /api/tokens/convert             # Convert token amount to USD
POST /api/tokens/update-prices       # Update token prices (admin)
POST /api/tokens/initialize          # Initialize tokens (admin)
GET  /api/tokens/balance/:address    # Get token balance for address

# Consensus & Voting
GET  /api/consensus/stats            # Get consensus statistics
GET  /api/consensus/timeline         # Get voting timeline
POST /api/consensus/vote             # Submit simple vote (protected)

# Voting Results
GET  /api/results/:contentId         # Get voting results for content
POST /api/results/:contentId/finalize # Finalize voting results (admin)

# IPFS Integration
POST /api/ipfs/upload                # Upload file to IPFS
GET  /api/ipfs/:hash                 # Get file from IPFS

# Blockchain Integration
GET  /api/blockchain/tx/:txHash      # Get transaction status
POST /api/blockchain/estimate-gas    # Estimate gas for transaction
```

### **🔗 Contracts (`/contracts-hardhat`)**

**Technology Stack:** Solidity 0.8+, Hardhat, OpenZeppelin

**Smart Contracts:**

- **ProofChainSimpleVoting.sol**: Main voting logic and token management

## 🔗 **API Endpoints Reference**

### **Content Management**

```bash
# Submit new content
POST /api/content
Body: { title, description, contentType, file?, votingStartTime, votingEndTime }

# Get content list with pagination
GET /api/content?page=1&limit=10&status=live&contentType=image

# Get specific content details
GET /api/content/:id

# Get content voting status
GET /api/content/:id/commit?address=0x...
```

### **Voting & Consensus**

```bash
# Submit vote (requires MetaMask transaction)
POST /api/consensus/vote
Body: { contentId, vote, tokenType, stakeAmount, confidence }

# Get consensus statistics
GET /api/consensus/stats

# Get voting timeline data
GET /api/consensus/timeline
```

### **User Management**

```bash
# Register/login user
POST /api/users
Body: { address, signature?, userData? }

# Get user profile
GET /api/users/:address

# Get my profile (authenticated)
GET /api/users/me

# Update profile
PUT /api/users/me
Body: { username, email, bio, profileImageUrl }

# Verify identity with Merkle proof
POST /api/users/verify
Body: { merkleProof: ["0x..."] }

# Get user's content and rewards
GET /api/users/me/content
GET /api/users/:address/content

# Claim content rewards
POST /api/users/me/content/:contentId/claim-reward
```

### **Token Operations**

```bash
# Get supported tokens
GET /api/tokens/supported?activeOnly=true

# Get token distribution stats
GET /api/tokens/distribution

# Convert token amount to USD
POST /api/tokens/convert
Body: { tokenType: 1, amount: "1000000000000000000" }
```

- **MockUSDFC.sol**: Test USDFC token for development
- **MockAggregatorV3.sol**: Price oracle for token valuation

**Key Features:**

- Quadratic voting with stake weighting
- Multi-token support (ETH, USDFC, FIL)
- Merkle tree user verification
- Automated result calculation
- Gas-optimized operations

## 🛠️ **Technology Stack**

### **Frontend Technologies:**

- **React.js 18+** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Ethers.js 5.7.2** - Ethereum blockchain interaction
- **Axios** - HTTP client for API calls
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Polling (setInterval)** - Real-time updates via 30-second intervals

### **Backend Technologies:**

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Redis** - In-memory caching (optional)
- **JWT** - Authentication tokens
- **Ethers.js 5.7.2** - Ethereum blockchain interaction
- **Express File Upload** - File handling middleware
- **Polling (setInterval)** - Real-time updates via 30-second intervals

### **Blockchain Technologies:**

- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Security-audited contracts
- **Filecoin** - Decentralized storage blockchain
- **IPFS** - Distributed file storage
- **Pinata** - IPFS pinning service

### **Development Tools:**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Hardhat** - Smart contract testing
- **Git** - Version control

## 🚀 **Local Development Setup**

### **Prerequisites**

```bash
# Required software
Node.js 18+
npm or yarn
Git
MongoDB (local or Atlas)
MetaMask browser extension
```

### **Step 1: Clone Repository & Install Dependencies**

```bash
# Clone the repository
git clone <repository-url>
cd proofchain

# Install dependencies for all components
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd contracts-hardhat && npm install && cd ..
```

### **Step 2: Environment Configuration**

#### **Backend Environment Setup**

```bash
cd backend
cp .env.example .env
# Update .env with your configuration
```

**Backend Environment Variables (`backend/.env.example`):**

```bash
# ==============================================
# ProofChain Backend Environment Configuration
# ==============================================
# Copy this file to .env and update the values

# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
# For local development, use MongoDB running on localhost
# For production, use MongoDB Atlas connection string
MONGODB_URI=mongodb://localhost:27017/proofchain

# Redis Configuration (Optional - can be disabled for development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
DISABLE_REDIS=true

# Blockchain Configuration (Updated for Localhost Development)
# Use localhost for development with Hardhat node
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
# Contract address will be filled after deployment
CONTRACT_ADDRESS=replace-your-contract-address
# Demo private key for testing (use Hardhat account private key)
DEMO_PRIVATE_KEY=your_hardhat_account_private_key_here

# JWT Configuration
# Generate a secure random string for production
JWT_SECRET=<randow-jwt-string>
JWT_EXPIRATION=7d

# IPFS Configuration (Updated for Pinata Integration)
# Use Pinata cloud service for IPFS
IPFS_GATEWAY=<https://amaranth-......mypinata.cloud/ipfs/>
IPFS_API_URL=https://api.pinata.cloud/pinning

# Pinata Authentication (JWT Token from Pinata dashboard)
PINATA_JWT=your_pinata_jwt_token_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Blockchain Features
DISABLE_BLOCKCHAIN=false

# Development Bypass Options (for testing)
BYPASS_VERIFICATION=true
BYPASS_AUTH=true
```

#### **Frontend Environment Setup**

```bash
cd frontend
cp .env.example .env
# Update .env with your configuration
```

**Frontend Environment Variables (`frontend/.env.example`):**

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3000/api

# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=<your-contract-address>
REACT_APP_BLOCKCHAIN_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_MERKLE_PROOF=<your-merkle-proof-generated>

# IPFS Configuration
REACT_APP_IPFS_GATEWAY=<https://amarant........mypinata.cloud/ipfs/>

# Localhost Configuration
REACT_APP_LOCALHOST_RPC_URL=http://127.0.0.1:8545

# Feature Flags
REACT_APP_ENABLE_TESTNET=true
REACT_APP_DISABLE_ANIMATIONS=false
```

#### **Contracts Environment Setup**

```bash
cd contracts-hardhat
cp .env.example .env
# Add your MetaMask private key to PRIVATE_KEY (without 0x prefix)
```

**Contracts Environment Variables (`contracts-hardhat/.env.example`):**

```bash
# Private key for contract deployment (without 0x prefix)
# Add your MetaMask private key here (the one with test ETH)
PRIVATE_KEY=your_metamask_private_key_here

# Contract configuration (will be updated after localhost deployment)
MERKLE_ROOT=<replace-with-merkle-root>
PROOFCHAIN_CONTRACT_ADDRESS=<replace-smart-contract-deployed-address>
MOCK_AGGREGATOR_ADDRESS=<mock-aggregator-address>

# Gas reporting
REPORT_GAS=true
```

### **Step 3: Database Setup**

#### **Option A: Local MongoDB**

```bash
# Install and start MongoDB locally
# Ubuntu/Debian:
sudo apt-get install mongodb
sudo systemctl start mongod

# macOS:
brew install mongodb-community
brew services start mongodb-community
```

#### **Option B: MongoDB Atlas (Recommended)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user with read/write permissions
4. Add IP address to whitelist (0.0.0.0/0 for development)
5. Update `MONGODB_URI` in `backend/.env` with connection string

### **Step 4: IPFS Setup (Pinata)**

1. Create account at [Pinata](https://pinata.cloud/)
2. Generate JWT token from dashboard
3. Update `PINATA_JWT` in `backend/.env`

### **Step 5: Localhost Blockchain & Contract Deployment**

#### **Terminal 1: Start Hardhat Node**

```bash
cd contracts-hardhat
npx hardhat node
# Keep this terminal running - provides local blockchain on http://127.0.0.1:8545
```

#### **Terminal 2: Deploy Smart Contracts**

```bash
cd contracts-hardhat

# 1. Generate Merkle Data
npx hardhat run scripts/generateMerkleData.js --network localhost

# 2. Deploy Mock Price Aggregator
npx hardhat run scripts/deployMockAggregator.js --network localhost

# 3. Deploy ProofChain Contract
npx hardhat run scripts/deploy.js --network localhost

# 4. Activate ETH Token
npx hardhat run scripts/activateEthToken.js --network localhost
```

**Important**: After each deployment step, copy the contract addresses from the output and update your `.env` files:

#### **After Step 1 (Generate Merkle Data):**

- Update `MERKLE_ROOT` in `contracts-hardhat/.env`

#### **After Step 2 (Deploy Mock Price Aggregator):**

- Update `MOCK_AGGREGATOR_ADDRESS` in `contracts-hardhat/.env`

#### **After Step 3 (Deploy ProofChain Contract):**

- Update `CONTRACT_ADDRESS` in `backend/.env`
- Update `REACT_APP_CONTRACT_ADDRESS` in `frontend/.env`
- Update `PROOFCHAIN_CONTRACT_ADDRESS` in `contracts-hardhat/.env`

#### **Additional Variables to Update:**

**Backend (.env):**

- `PINATA_JWT` - Your actual Pinata JWT token
- `DEMO_PRIVATE_KEY` - One of the Hardhat account private keys (for testing)
- `MONGODB_URI` - Your MongoDB connection string (if using Atlas)

**Frontend (.env):**

- `REACT_APP_MERKLE_PROOF` - Your wallet's merkle proof (if different from example)

**Contracts (.env):**

- `PRIVATE_KEY` - Your MetaMask private key (without 0x prefix)

### **Step 6: MetaMask Configuration**

1. **Add Localhost Network to MetaMask**:

   - Network Name: Localhost 8545
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
   - Block Explorer: Not needed

2. **Import Test Account**:
   - Copy one of the private keys from Hardhat node output (Terminal 1)
   - Import it into MetaMask for testing

### **Step 7: Start Backend Server**

#### **Terminal 3: Backend**

```bash
cd backend
npm start
# Backend API runs on http://localhost:3000
```

### **Step 8: Start Frontend Application**

#### **Terminal 4: Frontend**

```bash
cd frontend
npm start
# Frontend application runs on http://localhost:5003
```

3. **Add Localhost Network to MetaMask**:

   - Network Name: Localhost 8545
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
   - Block Explorer: Not needed for localhost

### **🗄️ MongoDB Compass Setup & Data Viewing**

#### **Install MongoDB Compass:**

```bash
# Download from: https://www.mongodb.com/products/compass
# Or install via package manager:

# macOS:
brew install --cask mongodb-compass

# Ubuntu/Debian:
wget https://downloads.mongodb.com/compass/mongodb-compass_1.40.4_amd64.deb
sudo dpkg -i mongodb-compass_1.40.4_amd64.deb
```

#### **Connect to Local MongoDB:**

1. **Open MongoDB Compass**
2. **Connection String**: `mongodb://localhost:27017`
3. **Database Name**: `proofchain`
4. **Click Connect**

#### **Connect to MongoDB Atlas:**

1. **Get Connection String** from Atlas dashboard
2. **Format**: `mongodb+srv://username:password@cluster.mongodb.net/proofchain`
3. **Replace** username, password, and cluster details
4. **Click Connect**

5. **Import Test Account**: Use one of the private keys shown in the Hardhat node output

### **Step 9: Access & Test Application**

#### **Application URLs:**

- **Frontend**: http://localhost:5003
- **Backend API**: http://localhost:3000/api
- **Profile Page Example**: http://localhost:5003/profile/0xYourWalletAddress

#### **Testing Workflow:**

1. **Connect MetaMask** to localhost network
2. **Submit Content** for verification
3. **Vote on Content** using test tokens
4. **View Results** and claim rewards
5. **Check Profile** for real-time consensus data

### **Step 10: Verify Setup**

#### **Check All Services:**

```bash
# Check if all services are running:
# Terminal 1: Hardhat node should show "Started HTTP and WebSocket JSON-RPC server"
# Terminal 2: Available for contract operations
# Terminal 3: Backend should show "Server running on port 3000"
# Terminal 4: Frontend should show "webpack compiled successfully"
```

#### **Test API Endpoints:**

```bash
# Test backend API
curl http://localhost:3000/api/tokens/supported

# Test frontend
# Open http://localhost:5003 in browser
```

## 🔧 **Development Workflow Summary**

### **Daily Development Startup:**

1. **Start Hardhat Node**: `cd contracts-hardhat && npx hardhat node`
2. **Start Backend**: `cd backend && npm start`
3. **Start Frontend**: `cd frontend && npm start`
4. **Connect MetaMask** to localhost network
5. **Begin Development** 🚀

### **Contract Redeployment (if needed):**

```bash
# In contracts-hardhat directory:
npx hardhat run scripts/generateMerkleData.js --network localhost
npx hardhat run scripts/deployMockAggregator.js --network localhost
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/activateEthToken.js --network localhost

# Update contract addresses in backend/.env and frontend/.env
# Restart backend and frontend servers
```

## 🧪 **Testing the Application**

### **1. Content Submission**

- Connect MetaMask wallet
- Navigate to "Submit Content"
- Upload file or provide IPFS hash
- Add title and description
- Submit for verification

### **2. Voting Process**

- Browse submitted content
- Connect wallet and stake tokens
- Vote REAL or FAKE with confidence level
- Track voting progress in real-time

### **3. Results & Rewards**

- View voting results after completion
- Check profile for reward eligibility
- Claim rewards after 48-hour security delay
- Track reputation and earnings

## 🔧 **Common Issues & Solutions**

## 🔧 **Comprehensive Troubleshooting Guide**

### **🚨 Port Issues & Process Management**

#### **Kill Processes on Busy Ports:**

```bash
# Check what's running on specific ports
lsof -i :3000  # Backend port
lsof -i :5003  # Frontend port
lsof -i :8545  # Hardhat node port

# Kill processes by port
sudo kill -9 $(lsof -t -i:3000)  # Kill backend
sudo kill -9 $(lsof -t -i:5003)  # Kill frontend
sudo kill -9 $(lsof -t -i:8545)  # Kill hardhat node

# Alternative: Kill by process name
pkill -f "hardhat node"
pkill -f "react-scripts"
pkill -f "node server.js"

# Check all Node.js processes
ps aux | grep node
```

#### **Clean Restart All Services:**

```bash
# Kill all related processes
sudo kill -9 $(lsof -t -i:3000,5003,8545)

# Clean npm cache if needed
npm cache clean --force

# Restart in correct order
cd contracts-hardhat && npx hardhat node &
cd backend && npm start &
cd frontend && npm start &
```

#### **View ProofChain Data:**

```javascript
// Collections you'll see in MongoDB Compass:
proofchain/
├── contentitems          // Submitted content for verification
├── userprofiles         // User accounts and reputation
├── supportedtokens      // Available tokens for voting
├── commitinfos          // Vote commits (if using commit-reveal)
├── revealinfos          // Vote reveals (if using commit-reveal)
└── sessions             // User sessions (if using express-session)
```

#### **Useful MongoDB Compass Queries:**

```javascript
// Find all content items
{}

// Find content by creator
{"creator": "0xYourWalletAddress"}

// Find finalized content
{"isFinalized": true}

// Find content with votes
{"votes": {$exists: true, $ne: []}}

// Find users with reputation > 0
{"reputationScore": {$gt: 0}}

// Find recent content (last 24 hours)
{"createdAt": {$gte: new Date(Date.now() - 24*60*60*1000)}}
```

### **🌐 Application Routes & Pages**

#### **Frontend Route Structure:**

```javascript
// Main Application Routes:
http://localhost:5003/                    // Home/Dashboard
http://localhost:5003/submit              // Submit Content
http://localhost:5003/content/:id         // Content Detail & Voting
http://localhost:5003/profile             // My Profile (requires wallet)
http://localhost:5003/profile/:address    // Public Profile View
```

#### **📊 Dashboard Page (`/`)**

**Purpose**: Main landing page with content overview
**Features**:

- ✅ **Content Feed**: List of all submitted content
- ✅ **Voting Status**: Live/Finalized/Expired indicators
- ✅ **Quick Stats**: Total content, active votes, consensus reached
- ✅ **Filter Options**: By status, creator, date
- ✅ **Search Functionality**: Find content by title/description
- ✅ **Real-time Updates**: Auto-refresh every 30 seconds

**Components Used**:

- `ConsensusDashboard` - Main content grid
- `VotingInterface` - Quick voting actions
- `BlockchainVisualization` - Network status

#### **📝 Submit Content Page (`/submit`)**

**Purpose**: Upload and submit content for verification
**Features**:

- ✅ **File Upload**: Direct file upload to IPFS
- ✅ **IPFS Hash Input**: Manual IPFS hash entry
- ✅ **Metadata Form**: Title, description, content type
- ✅ **Preview**: Content preview before submission
- ✅ **Wallet Integration**: Automatic creator assignment
- ✅ **Transaction Tracking**: Blockchain submission status

**Form Fields**:

```javascript
{
  title: "Content title (required)",
  description: "Detailed description (required)",
  contentType: "article|image|video|document",
  ipfsHash: "Auto-generated or manual entry",
  file: "Direct file upload (optional)"
}
```

#### **🔍 Content Detail Page (`/content/:id`)**

**Purpose**: Detailed view and voting interface for specific content
**Features**:

- ✅ **Content Display**: Full content with IPFS integration
- ✅ **Voting Interface**: REAL/FAKE voting with confidence
- ✅ **Live Statistics**: Real-time vote counts and USD values
- ✅ **Participant List**: Who has voted (if public)
- ✅ **Results Display**: Final verdict when voting ends
- ✅ **Comments Section**: Community discussion
- ✅ **Share Options**: Social sharing and direct links

**Voting Process**:

1. **Connect Wallet** (MetaMask required)
2. **Select Vote**: REAL or FAKE
3. **Set Confidence**: 1-10 scale
4. **Stake Tokens**: Choose amount and token type
5. **Submit Vote**: Blockchain transaction
6. **Track Status**: Real-time vote tracking

#### **👤 Profile Pages (`/profile` & `/profile/:address`)**

**Purpose**: User profile with content history and rewards
**Features**:

- ✅ **Profile Overview**: Username, reputation, join date
- ✅ **My Content Tab**: All submitted content with consensus data
- ✅ **Voting History**: Past votes and outcomes
- ✅ **Reputation Timeline**: Reputation changes over time
- ✅ **Reward System**: Claimable rewards with 48-hour delays
- ✅ **Token Balances**: Current token holdings
- ✅ **Achievement Badges**: Verification status and milestones

**Profile Tabs**:

```javascript
// Tab Structure:
├── Overview          // Basic profile info and stats
├── My Content        // Submitted content with real-time data
├── Voting History    // Past voting activity
└── Reputation        // Reputation timeline and achievements
```

### **🐛 Common Issues & Solutions**

#### **Backend Issues:**

```bash
# MongoDB Connection Error
Error: MongoNetworkError: failed to connect to server
Solution:
- Check if MongoDB is running: sudo systemctl status mongod
- Verify MONGODB_URI in .env
- For Atlas: Check network access and credentials

# Port Already in Use
Error: EADDRINUSE: address already in use :::3000
Solution:
sudo kill -9 $(lsof -t -i:3000)
npm start

# CORS Errors
Error: Access to fetch blocked by CORS policy
Solution:
- Update CORS_ORIGIN in backend/.env
- Restart backend server
- Check frontend API URL configuration
```

## 🔧 **Troubleshooting Common Issues**

### **🚨 Critical Setup Issues**

#### **1. Backend Server Won't Start**

```bash
# Error: "Route.post() requires a callback function"
# Fix: Check middleware imports in routes
cd backend && npm install
# Ensure all route files import correct middleware
```

#### **2. Content Submission Fails**

```bash
# Error: "votingStartTime is not allowed"
# Fix: Update validation middleware
# Check backend/middleware/validationMiddleware.js
```

#### **3. IPFS Upload Errors**

```bash
# Error: "Invalid URL - ERR_ID:00004"
# Fix: Configure Pinata JWT properly
# Update PINATA_JWT in backend/.env
```

#### **4. MetaMask Transaction Failures**

```bash
# Error: "Voting period too short"
# Fix: Ensure voting duration >= 1 hour
# Check smart contract MIN_VOTING_PERIOD
```

#### **5. Database Connection Issues**

```bash
# Error: "MongoServerError"
# Fix: Start MongoDB service
sudo systemctl start mongod
# Or use MongoDB Atlas connection string
```

### **⚡ Quick Fixes**

#### **Contract Deployment Issues**

```bash
# Reset blockchain state
cd contracts-hardhat
npx hardhat clean
npm run node
# Redeploy in correct order
```

#### **Frontend Build Errors**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

#### **Backend API Errors**

```bash
cd backend
# Check environment variables
cat .env
# Restart with logs
npm run dev
```

#### **Frontend Issues:**

```bash
# Wallet Connection Failed
Error: No Ethereum provider found
Solution:
- Install MetaMask browser extension
- Add localhost network (Chain ID: 31337)
- Import test account from Hardhat node

# API Calls Failing
Error: Network Error / 404 Not Found
Solution:
- Check REACT_APP_API_URL in .env
- Verify backend is running on correct port
- Test API endpoint: curl http://localhost:3000/api/tokens/supported

# Contract Interaction Error
Error: Contract not deployed or wrong network
Solution:
- Verify REACT_APP_CONTRACT_ADDRESS in .env
- Check MetaMask is on localhost network
- Redeploy contracts if needed
```

#### **Smart Contract Issues:**

```bash
# Deployment Fails
Error: insufficient funds for intrinsic transaction cost
Solution:
- Check private key has ETH for gas
- Get test ETH from Hardhat node accounts
- Verify network connection

# Transaction Reverts
Error: execution reverted: Voting duration too short
Solution:
- Ensure minimum 1 hour (3600 seconds) voting duration
- Check contract parameters
- Verify token activation

# Gas Estimation Failed
Error: cannot estimate gas
Solution:
- Check contract address is correct
- Verify function parameters
- Ensure wallet has sufficient balance
```

### **📊 Performance Monitoring**

#### **Check Service Health:**

```bash
# Backend Health Check
curl http://localhost:3000/api/tokens/supported

# Frontend Build Check
npm run build  # In frontend directory

# Contract Verification
npx hardhat verify --network localhost <CONTRACT_ADDRESS>

# Database Connection Test
mongosh mongodb://localhost:27017/proofchain
```

#### **Log Monitoring:**

```bash
# Backend Logs
cd backend && npm start | tee backend.log

# Frontend Logs
cd frontend && npm start | tee frontend.log

# Hardhat Node Logs
cd contracts-hardhat && npx hardhat node | tee hardhat.log
```

## 📚 **Additional Resources**

- **Detailed Documentation**: See `implementation-summary.md`
- **Demo Guide**: See `lamendemo.md`
- **Filecoin Documentation**: [docs.filecoin.io](https://docs.filecoin.io)
- **IPFS Documentation**: [docs.ipfs.io](https://docs.ipfs.io)
- **Hardhat Documentation**: [hardhat.org](https://hardhat.org)

## 🤝 **Contributing**

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 **Support**

If you find this project helpful, please give it a star! For questions or support, please open an issue.

---

**Built with ❤️ for a more truthful digital world**

# refresh
