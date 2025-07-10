# Complete Filecoin Deployment Steps with USDFC

## 📋 Step-by-Step Deployment Guide

### Step 1: Environment Setup

#### 1.1 Create contracts-hardhat/.env
```bash
# Your private key (without 0x prefix)
PRIVATE_KEY=your_actual_private_key_here

# Filecoin Calibration testnet RPC URL
FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1

# Will be filled after deployment
MERKLE_ROOT=
PROOFCHAIN_CONTRACT_ADDRESS=
MOCK_AGGREGATOR_ADDRESS=
USDFC_TOKEN_ADDRESS=
USDFC_PRICE_ORACLE_ADDRESS=

# Gas reporting
REPORT_GAS=true
```

#### 1.2 Create backend/.env
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/proofchain

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
DISABLE_REDIS=true

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
CONTRACT_ADDRESS=
DEMO_PRIVATE_KEY=your_filecoin_demo_private_key

# USDFC Token Configuration
USDFC_TOKEN_ADDRESS=
USDFC_PRICE_ORACLE_ADDRESS=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d

# IPFS Configuration
IPFS_API_URL=http://localhost:5001/api/v0
IPFS_GATEWAY=http://localhost:8080/ipfs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### 1.3 Create frontend/.env
```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000/api

# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_BLOCKCHAIN_NETWORK=filecoin_calibration
REACT_APP_CHAIN_ID=314159
REACT_APP_MERKLE_PROOF=

# Filecoin Configuration
REACT_APP_FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
REACT_APP_FILECOIN_EXPLORER=https://calibration.filscan.io

# USDFC Token Configuration
REACT_APP_USDFC_TOKEN_ADDRESS=
REACT_APP_USDFC_DECIMALS=6

# IPFS Configuration
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Feature Flags
REACT_APP_ENABLE_TESTNET=true
REACT_APP_DISABLE_ANIMATIONS=false
```

### Step 2: Get Test Funds
1. Visit: https://faucet.calibration.fildev.network/
2. Enter your wallet address
3. Receive test tFIL for gas fees

### Step 3: Deploy Contracts (Execute in Order)

```bash
cd contracts-hardhat

# 1. Generate Merkle Data
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration
# Copy the merkle root to your .env files

# 2. Deploy Mock Price Aggregator
npx hardhat run scripts/deployMockAggregator.js --network filecoin_calibration
# Copy the address to MOCK_AGGREGATOR_ADDRESS

# 3. Deploy Mock USDFC Token
npx hardhat run scripts/deployMockUSDFC.js --network filecoin_calibration
# Copy the address to USDFC_TOKEN_ADDRESS

# 4. Deploy ProofChain Contract
npx hardhat run scripts/deploy.js --network filecoin_calibration
# Copy the address to PROOFCHAIN_CONTRACT_ADDRESS

# 5. Activate ETH Token
npx hardhat run scripts/activateEthToken.js --network filecoin_calibration

# 6. Activate USDFC Token
# Set USDFC_PRICE_ORACLE_ADDRESS=same_as_MOCK_AGGREGATOR_ADDRESS in .env first
npx hardhat run scripts/activateUSDFCToken.js --network filecoin_calibration
```

### Step 4: Update All .env Files

After each deployment, update the corresponding addresses in all three .env files:
- `contracts-hardhat/.env`
- `backend/.env`
- `frontend/.env`

### Step 5: Test the Integration

```bash
# Start backend
cd backend
npm start

# Start frontend (in new terminal)
cd frontend
npm start

# Test in browser:
# 1. Connect MetaMask to Filecoin Calibration
# 2. Switch to Filecoin network in wallet connect
# 3. Get USDFC tokens from faucet (if needed)
# 4. Submit content and test voting
```

## 🔧 Key Addresses You'll Need

| Component | Address Variable | Source |
|-----------|------------------|---------|
| Mock Aggregator | `MOCK_AGGREGATOR_ADDRESS` | Step 3.2 output |
| Mock USDFC | `USDFC_TOKEN_ADDRESS` | Step 3.3 output |
| ProofChain Contract | `PROOFCHAIN_CONTRACT_ADDRESS` | Step 3.4 output |
| USDFC Price Oracle | `USDFC_PRICE_ORACLE_ADDRESS` | Same as Mock Aggregator |
| Merkle Root | `MERKLE_ROOT` | Step 3.1 output |

## 🎯 Final Configuration Values

### BLOCKCHAIN_RPC_URL (Backend)
```bash
BLOCKCHAIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
```

### USDFC_TOKEN_ADDRESS
```bash
# Will be the address from deployMockUSDFC.js output
USDFC_TOKEN_ADDRESS=0x1234...abcd
```

### USDFC_PRICE_ORACLE_ADDRESS
```bash
# Same as MOCK_AGGREGATOR_ADDRESS (returns $1.00 for USDFC)
USDFC_PRICE_ORACLE_ADDRESS=0x5678...efgh
```

## ✅ Success Indicators

- ✅ All contracts deployed successfully
- ✅ MetaMask connects to Filecoin Calibration
- ✅ Frontend shows both tFIL and USDFC options
- ✅ Can submit content and vote with both tokens
- ✅ Backend connects to Filecoin RPC

## 🚨 Troubleshooting

1. **Gas Issues**: Ensure you have enough tFIL from faucet
2. **RPC Issues**: Verify Filecoin RPC URL is correct
3. **Token Issues**: Make sure all addresses are updated in .env files
4. **Network Issues**: Confirm MetaMask is on Filecoin Calibration (Chain ID: 314159)