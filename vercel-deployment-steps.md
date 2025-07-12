# 🚀 ProofChain Vercel Deployment Guide

> **Complete step-by-step guide to deploy ProofChain on Vercel Web Dashboard**

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Smart Contract Artifacts (Optional)](#smart-contract-artifacts-optional)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Domain Configuration](#domain-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Accounts & Services
- ✅ **Vercel Account** - [Sign up at vercel.com](https://vercel.com)
- ✅ **GitHub Account** - Your code repository
- ✅ **MongoDB Atlas** - Database hosting
- ✅ **Pinata Account** - IPFS storage (optional)
- ✅ **Infura Account** - Blockchain RPC (optional)

### Required Information
- MongoDB Atlas connection string
- JWT secret key (minimum 32 characters)
- Blockchain RPC URL
- Contract addresses
- IPFS/Pinata API keys

---

## 🔙 Backend Deployment

### Step 1: Prepare Backend Repository
1. **Ensure vercel.json exists** in `/backend/` directory
2. **Verify package.json** has correct start script: `"start": "node server.js"`
3. **Check server.js** exports are correct for Vercel

### Step 2: Deploy Backend on Vercel Web
1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import from Git Repository**
   - Select your ProofChain repository
   - **Root Directory**: Set to `backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### Step 3: Configure Backend Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```bash
# Required Environment Variables
NODE_ENV=production
PORT=3000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proofchain

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRATION=7d

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=your-private-key-for-blockchain-transactions

# IPFS Configuration (Choose one)
# Option 1: Pinata
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_KEY=your-pinata-secret-key
PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/

# Option 2: Infura IPFS
IPFS_PROJECT_ID=your-infura-ipfs-project-id
IPFS_API_SECRET=your-infura-ipfs-secret
IPFS_GATEWAY_URL=https://ipfs.infura.io/ipfs/

# Security & CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Feature Flags
DISABLE_BLOCKCHAIN=false
DISABLE_REDIS=true
```

### Step 4: Deploy Backend
1. **Click "Deploy"**
2. **Wait for deployment** (usually 1-3 minutes)
3. **Note your backend URL**: `https://your-backend-name.vercel.app`

---

## 🎨 Frontend Deployment

### Step 1: Prepare Frontend Repository
1. **Ensure vercel.json exists** in `/frontend/` directory
2. **Verify package.json** build script uses `react-app-rewired`
3. **Check config-overrides.js** for webpack configuration

### Step 2: Deploy Frontend on Vercel Web
1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import from Git Repository**
   - Select your ProofChain repository (or create new import)
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Step 3: Configure Frontend Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```bash
# Backend API Configuration
REACT_APP_API_URL=https://your-backend-name.vercel.app

# Blockchain Configuration
REACT_APP_BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
REACT_APP_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# IPFS Configuration
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=your-pinata-api-key
REACT_APP_PINATA_SECRET_KEY=your-pinata-secret-key

# Environment
REACT_APP_ENVIRONMENT=production

# Build Configuration
GENERATE_SOURCEMAP=false
CI=false
```

### Step 4: Deploy Frontend
1. **Click "Deploy"**
2. **Wait for deployment** (usually 2-5 minutes)
3. **Note your frontend URL**: `https://your-frontend-name.vercel.app`

---

## 📜 Smart Contract Artifacts (Optional)

> **Note**: Smart contracts are deployed to blockchain networks, not Vercel. This section is for hosting contract artifacts and ABIs for easy access.

### When to Deploy Contract Artifacts
- ✅ **Public API Access** - Provide ABIs for third-party integrations
- ✅ **Documentation** - Host contract documentation and interfaces
- ✅ **Development Tools** - Share artifacts with team members
- ✅ **Verification** - Public access to contract source code

### Step 1: Prepare Contract Artifacts
1. **Compile Contracts** in your local environment:
   ```bash
   cd contracts-hardhat
   npx hardhat compile
   ```

2. **Verify artifacts exist** in `/artifacts/` directory
3. **Ensure vercel.json exists** in `/contracts-hardhat/` directory

### Step 2: Deploy Contract Artifacts (Optional)
1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import from Git Repository**
   - Select your ProofChain repository
   - **Root Directory**: Set to `contracts-hardhat`
   - **Framework Preset**: Other
   - **Build Command**: `npx hardhat compile`
   - **Output Directory**: `artifacts`
   - **Install Command**: `npm install`

### Step 3: Configure Contract Environment (Optional)
```bash
# Optional environment variables for contract artifacts
NODE_ENV=production
HARDHAT_NETWORK=mainnet
```

### Step 4: Access Contract Artifacts
After deployment, artifacts will be available at:
- **Contract ABIs**: `https://your-contracts-name.vercel.app/artifacts/contracts/ProofChainSimpleVoting.sol/ProofChainSimpleVoting.json`
- **All Artifacts**: `https://your-contracts-name.vercel.app/artifacts/`

### Important Notes
- ⚠️ **Smart contracts themselves** are deployed to blockchain networks (Ethereum, Polygon, etc.)
- ⚠️ **This deployment only hosts** compiled artifacts and documentation
- ⚠️ **Contract deployment** still requires blockchain deployment via Hardhat
- ⚠️ **Update contract addresses** in backend and frontend after blockchain deployment

---

## 🔧 Environment Variables Setup

### MongoDB Atlas Setup (Recommended for Production)

#### Step 1: Create MongoDB Atlas Account
1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Click "Try Free"**
3. **Sign up** with email or Google account
4. **Verify your email** if required

#### Step 2: Create a New Project
1. **Click "New Project"** in Atlas dashboard
2. **Enter project name**: `ProofChain` or your preferred name
3. **Click "Next"** and **"Create Project"**

#### Step 3: Create a Database Cluster
1. **Click "Build a Database"**
2. **Choose deployment option**:
   - **FREE (M0)**: For development/testing
   - **Dedicated**: For production (recommended)
3. **Select Cloud Provider**: AWS, Google Cloud, or Azure
4. **Choose Region**: Select closest to your users
5. **Cluster Name**: Keep default or rename (e.g., `ProofChain-Cluster`)
6. **Click "Create Cluster"** (takes 3-7 minutes)

#### Step 4: Create Database User
1. **In "Security" → "Database Access"**
2. **Click "Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `proofchain-user` (or your choice)
5. **Password**: Generate secure password or create custom
   - ⚠️ **Save this password** - you'll need it for connection string
6. **Database User Privileges**: 
   - Select **"Read and write to any database"**
   - Or create custom role for specific database
7. **Click "Add User"**

#### Step 5: Configure Network Access
1. **In "Security" → "Network Access"**
2. **Click "Add IP Address"**
3. **For Vercel deployment**:
   - **Click "Allow Access from Anywhere"**
   - **IP Address**: `0.0.0.0/0`
   - **Comment**: `Vercel Deployment Access`
4. **Click "Confirm"**

#### Step 6: Get Connection String
1. **Go to "Deployment" → "Database"**
2. **Click "Connect" button** on your cluster
3. **Choose connection method**: "Connect your application"
4. **Select Driver**: Node.js
5. **Select Version**: 4.1 or later
6. **Copy the connection string**:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace placeholders**:
   - `<username>`: Your database username
   - `<password>`: Your database password
   - Add database name: `/proofchain` before the `?`
   
   **Final format**:
   ```
   mongodb+srv://proofchain-user:your-password@cluster0.xxxxx.mongodb.net/proofchain?retryWrites=true&w=majority
   ```

#### Step 7: Test Connection (Optional)
1. **In Atlas dashboard**, click **"Connect"** → **"MongoDB Compass"**
2. **Copy the connection string**
3. **Open MongoDB Compass** on your computer
4. **Paste connection string** and connect
5. **Create database**: `proofchain`
6. **Verify connection** works

---

### MongoDB Compass Setup (Local Development)

> **Note**: MongoDB Compass is primarily for local development. For production, use MongoDB Atlas.

#### Step 1: Install MongoDB Community Server
1. **Download MongoDB** from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. **Install MongoDB** following platform-specific instructions
3. **Start MongoDB service**:
   - **Windows**: MongoDB starts automatically
   - **macOS**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

#### Step 2: Install MongoDB Compass
1. **Download Compass** from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. **Install and launch** MongoDB Compass
3. **Connect to local MongoDB**:
   - **Connection String**: `mongodb://localhost:27017`
   - **Click "Connect"**

#### Step 3: Create Database and Collections
1. **Click "Create Database"**
2. **Database Name**: `proofchain`
3. **Collection Name**: `users` (or any initial collection)
4. **Click "Create Database"**

#### Step 4: Get Local Connection String
For local development, use:
```
mongodb://localhost:27017/proofchain
```

#### Step 5: Configure for Production
⚠️ **Important**: Local MongoDB is NOT suitable for Vercel production deployment
- **Vercel functions** cannot connect to local databases
- **Use MongoDB Atlas** for production deployment
- **Keep local setup** only for development

---

### Connection String Examples

#### MongoDB Atlas (Production)
```bash
# Standard Atlas connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/proofchain?retryWrites=true&w=majority

# With additional options
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/proofchain?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000
```

#### Local MongoDB (Development Only)
```bash
# Local development
MONGODB_URI=mongodb://localhost:27017/proofchain

# Local with authentication
MONGODB_URI=mongodb://username:password@localhost:27017/proofchain
```

#### Connection String Parameters Explained
- **retryWrites=true**: Automatically retry write operations
- **w=majority**: Write concern for data durability
- **maxPoolSize=10**: Maximum connection pool size
- **serverSelectionTimeoutMS=5000**: Timeout for server selection

### Troubleshooting MongoDB Connection

#### Common Issues and Solutions

**Issue**: "Authentication failed"
**Solution**: 
- Verify username and password in connection string
- Check database user permissions in Atlas
- Ensure user has correct database access

**Issue**: "Network timeout" or "Connection refused"
**Solution**:
- Verify IP whitelist includes `0.0.0.0/0` for Vercel
- Check cluster is running and accessible
- Verify connection string format

**Issue**: "Database not found"
**Solution**:
- Ensure database name is included in connection string
- Database will be created automatically when first document is inserted
- Verify database name matches your application code

**Issue**: "Too many connections"
**Solution**:
- Reduce `maxPoolSize` in connection string
- Implement connection pooling in your application
- Monitor connection usage in Atlas dashboard

### JWT Secret Generation
Generate a secure JWT secret (minimum 32 characters):
```bash
# Use online generator or command line
openssl rand -base64 32
```

### Blockchain Configuration
- **Polygon Mainnet RPC**: `https://polygon-rpc.com`
- **Ethereum Mainnet RPC**: `https://mainnet.infura.io/v3/YOUR_API_KEY`
- **Testnet RPCs**: Use appropriate testnet URLs

### IPFS Configuration Options

#### Option 1: Pinata (Recommended)
1. **Create Pinata Account**
2. **Generate API Keys**
3. **Use Gateway**: `https://gateway.pinata.cloud/ipfs/`

#### Option 2: Infura IPFS
1. **Create Infura Account**
2. **Create IPFS Project**
3. **Get Project ID and Secret**

---

## 🌐 Domain Configuration

### Custom Domain Setup (Optional)
1. **Go to Project Settings → Domains**
2. **Add Custom Domain**
3. **Configure DNS Records**:
   - Type: CNAME
   - Name: your-subdomain
   - Value: cname.vercel-dns.com

### Update CORS Configuration
After getting final URLs, update backend environment:
```bash
CORS_ORIGIN=https://your-custom-domain.com
```

---

## ✅ Post-Deployment Verification

### Backend Health Check
1. **Visit**: `https://your-backend-name.vercel.app/health`
2. **Expected Response**:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

### Frontend Functionality Check
1. **Visit**: `https://your-frontend-name.vercel.app`
2. **Verify**:
   - ✅ Page loads without errors
   - ✅ Dark/Light theme toggle works
   - ✅ Wallet connection button appears
   - ✅ API calls to backend work

### API Connectivity Test
1. **Open Browser DevTools**
2. **Check Network Tab** for API calls
3. **Verify** backend responses are successful

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Build Failures
**Problem**: Frontend build fails
**Solution**: 
- Check `config-overrides.js` is present
- Verify all dependencies in `package.json`
- Set `CI=false` in environment variables

#### CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**:
- Update `CORS_ORIGIN` in backend environment
- Ensure frontend URL is correct in backend settings

#### Environment Variables Not Working
**Problem**: Variables not accessible in application
**Solution**:
- Frontend: Ensure variables start with `REACT_APP_`
- Backend: Verify variables are set in Vercel dashboard
- Redeploy after adding new variables

#### Database Connection Issues
**Problem**: MongoDB connection fails
**Solution**:
- Verify connection string format
- Check database user permissions
- Ensure IP whitelist includes 0.0.0.0/0

#### Function Timeout
**Problem**: Vercel function times out
**Solution**:
- Check `maxDuration` in `vercel.json`
- Optimize database queries
- Add error handling for long operations

### Deployment Logs
1. **Go to Vercel Dashboard**
2. **Select Project → Deployments**
3. **Click on specific deployment**
4. **View Build Logs** for error details

### Environment Variables Check
```javascript
// Add to backend server.js for debugging
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
});
```

---

## 🎯 Final Checklist

### Before Going Live
- [ ] Backend health endpoint responds
- [ ] Frontend loads without console errors
- [ ] Database connection established
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active
- [ ] API rate limiting configured
- [ ] Smart contracts deployed to target blockchain
- [ ] Contract addresses updated in environment variables
- [ ] Contract artifacts accessible (if deployed)

### Security Considerations
- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] Private keys are properly protected
- [ ] CORS origins are restrictive
- [ ] Rate limiting is enabled
- [ ] Smart contract addresses are verified
- [ ] Blockchain RPC endpoints are secure
- [ ] Contract artifacts don't expose sensitive data

---

## 📞 Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **React Deployment Guide**: [create-react-app.dev/docs/deployment](https://create-react-app.dev/docs/deployment)

---

**🎉 Congratulations! Your ProofChain application is now deployed on Vercel!**

Remember to update your environment variables whenever you change services or configurations, and always test thoroughly after deployment.