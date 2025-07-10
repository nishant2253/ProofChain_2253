# Filecoin Calibration Testnet Deployment Guide

## Overview
This guide will help you deploy your ProofChain smart contracts to Filecoin Calibration testnet and integrate USDFC stablecoin support.

## Prerequisites

1. **MetaMask Setup for Filecoin Calibration**
   - Network Name: Filecoin Calibration
   - RPC URL: https://filecoin-calibration.chainup.net/rpc/v1
   - Chain ID: 314159
   - Currency Symbol: tFIL
   - Block Explorer: https://calibration.filscan.io

2. **Get Test tFIL**
   - Visit: https://faucet.calibration.fildev.network/
   - Enter your wallet address to receive test tFIL

## Step 1: Environment Configuration

### contracts-hardhat/.env
Create your `.env` file based on `.env.example`:

```bash
# Your private key (without 0x prefix)
PRIVATE_KEY=your_actual_private_key_here

# Filecoin Calibration testnet RPC URL
FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1

# Contract configuration (will be filled after deployment)
MERKLE_ROOT=your_merkle_root_here
PROOFCHAIN_CONTRACT_ADDRESS=your_deployed_contract_address_here
MOCK_AGGREGATOR_ADDRESS=your_mock_aggregator_address_here

# USDFC Token Configuration (update with actual addresses)
USDFC_TOKEN_ADDRESS=your_usdfc_token_address_here
USDFC_PRICE_ORACLE_ADDRESS=your_usdfc_price_oracle_address_here

# Gas reporting
REPORT_GAS=true
```

### frontend/.env
Create your frontend `.env` file:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000/api

# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address_here
REACT_APP_BLOCKCHAIN_NETWORK=filecoin_calibration
REACT_APP_CHAIN_ID=314159
REACT_APP_MERKLE_PROOF=your_merkle_proof_for_metamask_account_here

# Filecoin Configuration
REACT_APP_FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
REACT_APP_FILECOIN_EXPLORER=https://calibration.filscan.io

# USDFC Token Configuration
REACT_APP_USDFC_TOKEN_ADDRESS=your_usdfc_token_address_here
REACT_APP_USDFC_DECIMALS=6

# IPFS Configuration
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Feature Flags
REACT_APP_ENABLE_TESTNET=true
REACT_APP_DISABLE_ANIMATIONS=false
```

## Step 2: Generate Merkle Data

```bash
cd contracts-hardhat
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration
```

Copy the generated merkle root to your `.env` files.

## Step 3: Deploy Contracts

### Deploy Mock Price Aggregator
```bash
npx hardhat run scripts/deployMockAggregator.js --network filecoin_calibration
```

### Deploy ProofChain Contract
```bash
npx hardhat run scripts/deploy.js --network filecoin_calibration
```

### Activate ETH Token
```bash
npx hardhat run scripts/activateEthToken.js --network filecoin_calibration
```

### Activate USDFC Token (if available)
```bash
npx hardhat run scripts/activateUSDFCToken.js --network filecoin_calibration
```

## Step 4: Update Environment Variables

After deployment, update your `.env` files with the actual contract addresses.

## Step 5: Frontend Integration

The frontend now supports:
- Filecoin Calibration network switching
- USDFC token balance checking
- USDFC token approval for voting
- Multi-token voting with both tFIL and USDFC

## Step 6: Testing

1. **Connect MetaMask to Filecoin Calibration**
2. **Ensure you have test tFIL**
3. **Test wallet connection in frontend**
4. **Submit test content**
5. **Test voting with both tFIL and USDFC (if available)**

## Commands Summary

```bash
# Generate merkle data
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration

# Deploy mock aggregator
npx hardhat run scripts/deployMockAggregator.js --network filecoin_calibration

# Deploy main contract
npx hardhat run scripts/deploy.js --network filecoin_calibration

# Activate ETH token
npx hardhat run scripts/activateEthToken.js --network filecoin_calibration

# Activate USDFC token (optional)
npx hardhat run scripts/activateUSDFCToken.js --network filecoin_calibration
```

## Notes

- Replace `localhost` with `filecoin_calibration` in all deployment commands
- Ensure your private key has sufficient tFIL for gas fees
- USDFC integration is ready but requires actual USDFC token address on Filecoin
- The frontend automatically detects and supports Filecoin Calibration network