# Updated .env.example Files Summary

## ✅ **All .env.example Files Updated**

### 1. **contracts-hardhat/.env.example**
```bash
# Private key for contract deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Filecoin Calibration testnet RPC URL (try alternative if having issues)
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
# Alternative: https://filecoin-calibration.chainup.net/rpc/v1
# Alternative: https://calibration.filfox.info/rpc/v1

# API keys for services
INFURA_API_KEY=your_infura_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract configuration
MERKLE_ROOT=your_merkle_root_here
PROOFCHAIN_CONTRACT_ADDRESS=your_proofchain_contract_address_here
MOCK_AGGREGATOR_ADDRESS=your_mock_aggregator_address_here

# USDFC Token Configuration for Filecoin
USDFC_TOKEN_ADDRESS=your_usdfc_token_address_here
USDFC_PRICE_ORACLE_ADDRESS=your_usdfc_price_oracle_address_here

# Gas reporting
REPORT_GAS=true
```

### 2. **backend/.env.example**
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

# Blockchain Configuration - Filecoin Calibration Testnet
BLOCKCHAIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
CONTRACT_ADDRESS=your_proofchain_contract_address_here
DEMO_PRIVATE_KEY=your_filecoin_demo_private_key

# USDFC Token Configuration for Filecoin
USDFC_TOKEN_ADDRESS=your_usdfc_token_address_here
USDFC_PRICE_ORACLE_ADDRESS=your_usdfc_price_oracle_address_here

# Alternative Filecoin RPC URLs (if primary fails)
# BLOCKCHAIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
# BLOCKCHAIN_RPC_URL=https://calibration.filfox.info/rpc/v1

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

### 3. **frontend/.env.example**
```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000/api

# Blockchain Configuration - Filecoin Calibration Testnet
REACT_APP_CONTRACT_ADDRESS=your_proofchain_contract_address_here
REACT_APP_BLOCKCHAIN_NETWORK=filecoin_calibration
REACT_APP_CHAIN_ID=314159
REACT_APP_MERKLE_PROOF=your_merkle_proof_for_metamask_account_here

# MetaMask Network Configuration for Filecoin Calibration:
# Network Name: Filecoin - Calibration testnet
# RPC URL: https://api.calibration.node.glif.io/rpc/v1
# Chain ID: 314159
# Currency Symbol: tFIL
# Block Explorer: https://calibration.filscan.io

# Filecoin Configuration - Calibration Testnet
REACT_APP_FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
REACT_APP_FILECOIN_EXPLORER=https://calibration.filscan.io

# Alternative Filecoin RPC URLs (if primary fails)
# REACT_APP_FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
# REACT_APP_FILECOIN_RPC_URL=https://calibration.filfox.info/rpc/v1

# USDFC Token Configuration
REACT_APP_USDFC_TOKEN_ADDRESS=your_usdfc_token_address_here
REACT_APP_USDFC_DECIMALS=6

# IPFS Configuration
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Feature Flags
REACT_APP_ENABLE_TESTNET=true
REACT_APP_DISABLE_ANIMATIONS=false
```

## 🎯 **Key Updates Made:**

### **Primary RPC URL Changed:**
- **From**: `https://filecoin-calibration.chainup.net/rpc/v1`
- **To**: `https://api.calibration.node.glif.io/rpc/v1`

### **Added Alternative RPC URLs:**
- Commented backup options for reliability
- Multiple RPC endpoints to choose from

### **Enhanced Documentation:**
- Clear MetaMask configuration instructions
- Filecoin-specific comments and labels
- Better organization and readability

### **Network Configuration:**
- Chain ID: 314159 (Filecoin Calibration)
- Currency: tFIL
- Explorer: https://calibration.filscan.io

## 🚀 **Ready for Production:**

All .env.example files now contain:
- ✅ **Working Filecoin RPC URLs**
- ✅ **Complete USDFC token configuration**
- ✅ **MetaMask setup instructions**
- ✅ **Alternative RPC options**
- ✅ **Proper documentation**

Users can now copy these .env.example files to create their .env files with the correct Filecoin Calibration configuration!