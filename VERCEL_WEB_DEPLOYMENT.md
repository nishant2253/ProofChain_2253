# 🌐 ProofChain Vercel Web Dashboard Deployment Guide

Deploy your ProofChain application directly through the Vercel website without using the terminal.

## 📋 Prerequisites

1. **GitHub/GitLab Account** with your ProofChain repository
2. **Vercel Account** (free tier available at [vercel.com](https://vercel.com))
3. **MongoDB Atlas Account** (free tier available)
4. **Pinata Account** (free tier available)

## 🚀 Step-by-Step Web Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub/GitLab:**
   - Make sure both `frontend/` and `backend/` folders are in your repository
   - Ensure `vercel.json` files are present in both directories
   - Commit and push all changes

### Step 2: Deploy Backend

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "New Project"**

3. **Import your repository:**
   - Select your ProofChain repository
   - Click "Import"

4. **Configure Backend Project:**
   - **Project Name:** `proofchain-backend`
   - **Framework Preset:** `Other`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. **Click "Deploy"** (it will fail first time - that's expected)

6. **Set Environment Variables:**
   - Go to your project dashboard
   - Click "Settings" → "Environment Variables"
   - Add these variables one by one:

   ```
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/proofchain
   JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters
   BLOCKCHAIN_RPC_URL = https://polygon-rpc.com
   CONTRACT_ADDRESS = 0x1234567890123456789012345678901234567890
   IPFS_GATEWAY_URL = https://gateway.pinata.cloud/ipfs/
   PINATA_API_KEY = your-pinata-api-key
   PINATA_SECRET_KEY = your-pinata-secret-key
   PINATA_GATEWAY_URL = https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/
   DISABLE_BLOCKCHAIN = false
   CORS_ORIGIN = https://your-frontend-domain.vercel.app
   RATE_LIMIT_WINDOW = 900000
   RATE_LIMIT_MAX = 100
   ```

7. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

### Step 3: Deploy Frontend

1. **Click "New Project" again**

2. **Import the same repository**

3. **Configure Frontend Project:**
   - **Project Name:** `proofchain-frontend`
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. **Click "Deploy"** (will fail first time)

5. **Set Environment Variables:**
   - Go to project dashboard
   - Click "Settings" → "Environment Variables"
   - Add these variables:

   ```
   REACT_APP_API_URL = https://your-backend-domain.vercel.app
   REACT_APP_BLOCKCHAIN_RPC_URL = https://polygon-rpc.com
   REACT_APP_CONTRACT_ADDRESS = 0x1234567890123456789012345678901234567890
   REACT_APP_IPFS_GATEWAY = https://gateway.pinata.cloud/ipfs/
   REACT_APP_PINATA_API_KEY = your-pinata-api-key
   REACT_APP_PINATA_SECRET_KEY = your-pinata-secret-key
   REACT_APP_ENVIRONMENT = production
   GENERATE_SOURCEMAP = false
   CI = false
   ```

6. **Update Backend CORS:**
   - Go back to backend project
   - Update `CORS_ORIGIN` environment variable with your frontend URL
   - Redeploy backend

7. **Redeploy Frontend:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## 🔧 Environment Variables Setup Guide

### Backend Environment Variables

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `MONGODB_URI` | MongoDB Atlas Dashboard | `mongodb+srv://user:pass@cluster.mongodb.net/proofchain` |
| `JWT_SECRET` | Generate random 32+ char string | `your-super-secret-jwt-key-here` |
| `PINATA_API_KEY` | Pinata Dashboard → API Keys | `your-pinata-api-key` |
| `PINATA_SECRET_KEY` | Pinata Dashboard → API Keys | `your-pinata-secret-key` |
| `CORS_ORIGIN` | Your frontend Vercel URL | `https://proofchain-frontend.vercel.app` |

### Frontend Environment Variables

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `REACT_APP_API_URL` | Your backend Vercel URL | `https://proofchain-backend.vercel.app` |
| `REACT_APP_PINATA_API_KEY` | Same as backend | `your-pinata-api-key` |
| `REACT_APP_PINATA_SECRET_KEY` | Same as backend | `your-pinata-secret-key` |

## 🗄️ MongoDB Atlas Setup

1. **Create Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Shared" (free)
   - Select region closest to you
   - Click "Create Cluster"

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `proofchain`
   - Generate secure password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `proofchain`

## 📁 Pinata IPFS Setup

1. **Create Account:**
   - Go to [Pinata](https://pinata.cloud)
   - Sign up for free

2. **Get API Keys:**
   - Go to "API Keys" in dashboard
   - Click "New Key"
   - Enable "Admin" permissions
   - Name it "ProofChain"
   - Click "Create Key"
   - **Save the API Key and Secret Key immediately**

3. **Get Gateway URL:**
   - Go to "Gateways"
   - Note your dedicated gateway URL (e.g., `https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/`)

## 🔍 Verification Steps

### After Backend Deployment:
1. Visit `https://your-backend.vercel.app/api/health` (should return status)
2. Check Vercel function logs for errors

### After Frontend Deployment:
1. Visit your frontend URL
2. Check browser console for errors
3. Test wallet connection
4. Try creating content

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check Node.js version in build logs
   - Verify all dependencies are in package.json
   - Check for syntax errors

2. **Environment Variables Not Working:**
   - Ensure variables are set in correct project
   - Redeploy after adding variables
   - Check variable names (case-sensitive)

3. **CORS Errors:**
   - Verify `CORS_ORIGIN` in backend matches frontend URL exactly
   - Include `https://` in the URL
   - Redeploy backend after updating

4. **Database Connection Fails:**
   - Check MongoDB URI format
   - Verify username/password
   - Ensure network access allows all IPs

5. **IPFS Upload Fails:**
   - Verify Pinata API keys are correct
   - Check API key permissions
   - Test keys in Pinata dashboard

## 📊 Monitoring Your Deployment

### Vercel Dashboard Features:
- **Deployments:** View build logs and deployment history
- **Functions:** Monitor serverless function performance
- **Analytics:** Track usage and performance metrics
- **Domains:** Manage custom domains

### Useful URLs:
- **Backend Dashboard:** `https://vercel.com/your-username/proofchain-backend`
- **Frontend Dashboard:** `https://vercel.com/your-username/proofchain-frontend`
- **Backend API:** `https://your-backend.vercel.app/api`
- **Frontend App:** `https://your-frontend.vercel.app`

## 🎉 Success Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] All environment variables set
- [ ] MongoDB connection working
- [ ] Pinata IPFS working
- [ ] CORS configured correctly
- [ ] Frontend can connect to backend
- [ ] Wallet connection works
- [ ] Content creation works
- [ ] Voting system works

## 🔄 Making Updates

### To update your deployment:
1. Push changes to your GitHub/GitLab repository
2. Vercel will automatically redeploy
3. Or manually redeploy from Vercel dashboard

### For environment variable changes:
1. Update variables in Vercel dashboard
2. Manually redeploy the affected project

Your ProofChain application is now live on Vercel! 🚀