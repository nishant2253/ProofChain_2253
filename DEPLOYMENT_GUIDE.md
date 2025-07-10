# ProofChain Deployment Guide

This guide will help you deploy both the frontend and backend of ProofChain to Vercel.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Git** repository
4. **Vercel account** (free tier available)
5. **MongoDB Atlas** account (for database)
6. **Pinata** account (for IPFS)

## 🚀 Quick Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Backend

```bash
# Navigate to project root
cd /path/to/proofchain

# Make deployment script executable
chmod +x deploy-backend.sh

# Run backend deployment
./deploy-backend.sh
```

### Step 4: Deploy Frontend

```bash
# Make deployment script executable
chmod +x deploy-frontend.sh

# Run frontend deployment
./deploy-frontend.sh
```

## 📋 Detailed Deployment Instructions

### Backend Deployment

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Initialize Vercel project:**
   ```bash
   vercel
   ```
   - Choose "Link to existing project" or "Create new project"
   - Select your GitHub/GitLab repository
   - Choose "backend" as the root directory

3. **Set Environment Variables:**
   Go to Vercel Dashboard → Your Project → Settings → Environment Variables

   **Required Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proofchain
   JWT_SECRET=your-super-secret-jwt-key-here
   BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
   CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
   IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
   PINATA_API_KEY=your-pinata-api-key
   PINATA_SECRET_KEY=your-pinata-secret-key
   PINATA_GATEWAY_URL=https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/
   DISABLE_BLOCKCHAIN=false
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Frontend Deployment

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Initialize Vercel project:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend-domain.vercel.app
   REACT_APP_BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
   REACT_APP_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
   REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
   REACT_APP_PINATA_API_KEY=your-pinata-api-key
   REACT_APP_PINATA_SECRET_KEY=your-pinata-secret-key
   REACT_APP_ENVIRONMENT=production
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables Setup

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `BLOCKCHAIN_RPC_URL` | Blockchain RPC endpoint | `https://polygon-rpc.com` |
| `CONTRACT_ADDRESS` | Smart contract address | `0x123...` |
| `PINATA_API_KEY` | Pinata API key | `your-api-key` |
| `PINATA_SECRET_KEY` | Pinata secret key | `your-secret` |
| `DISABLE_BLOCKCHAIN` | Disable blockchain for testing | `false` |
| `CORS_ORIGIN` | Frontend domain for CORS | `https://yourapp.vercel.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://api.yourapp.vercel.app` |
| `REACT_APP_BLOCKCHAIN_RPC_URL` | Blockchain RPC endpoint | `https://polygon-rpc.com` |
| `REACT_APP_CONTRACT_ADDRESS` | Smart contract address | `0x123...` |
| `REACT_APP_IPFS_GATEWAY` | IPFS gateway URL | `https://gateway.pinata.cloud/ipfs/` |
| `REACT_APP_ENVIRONMENT` | Environment mode | `production` |

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account

2. **Create Cluster:**
   - Choose "Build a Database"
   - Select "Shared" (free tier)
   - Choose your preferred region

3. **Create Database User:**
   - Go to "Database Access"
   - Add new database user
   - Choose "Password" authentication
   - Save username and password

4. **Configure Network Access:**
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)

5. **Get Connection String:**
   - Go to "Databases"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## 📁 IPFS Setup (Pinata)

1. **Create Pinata Account:**
   - Go to [Pinata](https://pinata.cloud)
   - Sign up for free account

2. **Get API Keys:**
   - Go to "API Keys"
   - Create new key with admin permissions
   - Save API Key and Secret Key

3. **Get Gateway URL:**
   - Go to "Gateways"
   - Note your dedicated gateway URL

## 🔗 Custom Domain Setup (Optional)

### For Frontend:
1. Go to Vercel Dashboard → Your Frontend Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### For Backend:
1. Go to Vercel Dashboard → Your Backend Project → Settings → Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update frontend `REACT_APP_API_URL` to use custom domain

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Check for TypeScript/ESLint errors

2. **Environment Variables Not Working:**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names (case-sensitive)

3. **CORS Errors:**
   - Update `CORS_ORIGIN` in backend
   - Ensure frontend domain is correct

4. **Database Connection Issues:**
   - Check MongoDB URI format
   - Verify network access settings
   - Test connection locally first

5. **IPFS Upload Failures:**
   - Verify Pinata API keys
   - Check API key permissions
   - Test Pinata connection

## 📊 Monitoring and Logs

1. **Vercel Dashboard:**
   - Monitor deployments
   - View function logs
   - Check performance metrics

2. **MongoDB Atlas:**
   - Monitor database performance
   - View connection logs
   - Set up alerts

## 🔄 Continuous Deployment

### Automatic Deployments:
1. Connect your GitHub repository to Vercel
2. Enable automatic deployments on push
3. Set up branch-specific deployments

### Manual Deployments:
```bash
# Deploy specific branch
vercel --prod --branch main

# Deploy with specific build command
vercel --prod --build-env NODE_ENV=production
```

## 📝 Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] Database connection works
- [ ] IPFS uploads work
- [ ] Wallet connection works
- [ ] Content creation works
- [ ] Voting system works
- [ ] Environment variables are set
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active
- [ ] Monitoring set up

## 🎉 Success!

Your ProofChain application should now be live on Vercel! 

- **Frontend URL:** `https://your-frontend.vercel.app`
- **Backend URL:** `https://your-backend.vercel.app`

Remember to update any hardcoded URLs in your application to use the production URLs.