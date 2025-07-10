# Localhost Deployment Guide - ProofChain

## Overview

This guide will help you deploy your ProofChain smart contracts to a local Hardhat network for development and testing.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** package manager
3. **MetaMask** browser extension

## Quick Start

### Step 1: Start Local Blockchain
```bash
cd contracts-hardhat
npm run node
```
This will start a local Hardhat network on `http://127.0.0.1:8545` with 20 test accounts.

### Step 2: Deploy Contracts (In a new terminal)
```bash
cd contracts-hardhat

# Step 1: Generate Merkle Data
npm run step1:merkle

# Step 2: Deploy Mock Aggregator  
npm run step2:aggregator

# Step 3: Deploy ProofChain Contract
npm run step3:contract

# Step 4: Activate ETH Token
npm run step4:activate-eth

# Optional: Deploy and activate additional tokens
npm run deploy:mock-usdfc
npm run step5:activate-usdfc

# Test deployment
npm run test:deployment
```

### Step 3: Update Environment Variables
After each deployment step, copy the output addresses to your `.env` files.

### Step 4: Start Applications
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
cd frontend && npm start
```

## Detailed Steps

### 1. Start Local Blockchain Network

```bash
cd contracts-hardhat
npm run node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

...
```

Keep this terminal running - it's your local blockchain!

### 2. Deploy Contracts Step by Step

**Open a new terminal** and run each step:

#### Step 1: Generate Merkle Data
```bash
cd contracts-hardhat
npm run step1:merkle
```

**Expected Output:**
```
Merkle Root: 0x...
Target Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Target Merkle Proof: ["0x...", "0x..."]
```

**Update contracts-hardhat/.env:**
```bash
MERKLE_ROOT=0x_copy_from_output
```

#### Step 2: Deploy Mock Aggregator
```bash
npm run step2:aggregator
```

**Expected Output:**
```
MockAggregatorV3 deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Update contracts-hardhat/.env:**
```bash
MOCK_AGGREGATOR_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

#### Step 3: Deploy ProofChain Contract
```bash
npm run step3:contract
```

**Expected Output:**
```
Deploying ProofChainMultiTokenVoting contract...
Using merkle root: 0x...
ProofChainMultiTokenVoting deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Update contracts-hardhat/.env:**
```bash
PROOFCHAIN_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

#### Step 4: Activate ETH Token
```bash
npm run step4:activate-eth
```

**Expected Output:**
```
Activating ETH token...
ETH token activated successfully!
```

### 3. Update Frontend and Backend Configuration

#### Update frontend/.env:
```bash
REACT_APP_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_MERKLE_PROOF=["0x...", "0x..."]  # From step 1 output
```

#### Update backend/.env:
```bash
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 4. Configure MetaMask for Localhost

1. **Add Localhost Network to MetaMask:**
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import Test Account:**
   - Use one of the private keys from the Hardhat node output
   - Recommended: Account #1 (matches your merkle proof)
   - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

### 5. Optional: Deploy Additional Tokens

#### Deploy Mock USDFC Token:
```bash
npm run deploy:mock-usdfc
```

**Update .env with USDFC address, then:**
```bash
npm run step5:activate-usdfc
```

#### Deploy Mock FIL Token:
```bash
npm run deploy:mock-fil
npm run step6:activate-fil
```

## Complete Environment Configuration

### contracts-hardhat/.env (after deployment):
```bash
PRIVATE_KEY=
MERKLE_ROOT=0x_your_merkle_root
PROOFCHAIN_CONTRACT_ADDRESS=0x_your_contract_address
MOCK_AGGREGATOR_ADDRESS=0x_your_aggregator_address
USDFC_TOKEN_ADDRESS=0x_your_usdfc_address
USDFC_PRICE_ORACLE_ADDRESS=0x_your_aggregator_address
REPORT_GAS=true
```

### frontend/.env (after deployment):
```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_BLOCKCHAIN_NETWORK=localhost
REACT_APP_CONTRACT_ADDRESS=0x_your_contract_address
REACT_APP_IPFS_GATEWAY=https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/
REACT_APP_CHAIN_ID=31337
REACT_APP_ENABLE_TESTNET=true
REACT_APP_DISABLE_ANIMATIONS=false
REACT_APP_MERKLE_PROOF=["0x...", "0x..."]
REACT_APP_LOCALHOST_RPC_URL=http://127.0.0.1:8545
REACT_APP_USDFC_TOKEN_ADDRESS=0x_your_usdfc_address
REACT_APP_USDFC_DECIMALS=6
```

### backend/.env (after deployment):
```bash
# Keep all your existing configuration, just update:
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x_your_contract_address
```

## Testing Your Deployment

### Test Contract Deployment:
```bash
npm run test:deployment
```

### Start Your Applications:
```bash
# Terminal 1: Keep hardhat node running
cd contracts-hardhat && npm run node

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend
cd frontend && npm start
```

### Test in Browser:
1. Open http://localhost:3000
2. Connect MetaMask to Localhost 8545 network
3. Import test account with private key
4. Test content submission and voting

## Advantages of Localhost Development

✅ **Fast Development**: Instant transactions, no gas fees
✅ **Easy Reset**: Restart node to reset blockchain state  
✅ **Rich Accounts**: 10,000 ETH per test account
✅ **No External Dependencies**: Works offline
✅ **Easy Debugging**: Full control over blockchain state

## Troubleshooting

### If contracts fail to deploy:
- Make sure Hardhat node is running
- Check that .env variables are set correctly
- Restart the Hardhat node if needed

### If MetaMask shows wrong network:
- Switch to Localhost 8545 network
- Reset account in MetaMask if needed

### If frontend can't connect:
- Verify contract addresses in frontend/.env
- Check that backend is running on port 3000
- Ensure MetaMask is connected to correct network

## Ready for Production

When ready to deploy to testnets or mainnet:
1. Update hardhat.config.js with target networks
2. Update .env files with appropriate RPC URLs
3. Use the same deployment scripts with different `--network` parameter

Your localhost development environment is now ready! 🚀