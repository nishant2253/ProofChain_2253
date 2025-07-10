# USDFC Token Addresses and Configuration Explanation

## 🔍 What are these addresses?

### 1. **USDFC_TOKEN_ADDRESS**
This is the **smart contract address** of the USDFC stablecoin token on Filecoin Calibration testnet.

**Current Status**: 
- ❌ **Not yet available** - USDFC may not be deployed on Filecoin Calibration testnet yet
- 🔍 **Need to research** if USDFC exists on Filecoin network
- 🛠️ **Alternative**: We might need to deploy a mock USDFC token for testing

**What it looks like**: `0x1234567890abcdef1234567890abcdef12345678` (42-character hex address)

### 2. **USDFC_PRICE_ORACLE_ADDRESS**
This is the **Chainlink price oracle** contract address that provides USDFC/USD price feeds.

**Current Status**:
- ❌ **Not available** - Chainlink oracles may not exist for USDFC on Filecoin Calibration
- 🛠️ **Solution**: We'll use a mock price oracle (like we do for ETH)

**What it looks like**: `0xabcdef1234567890abcdef1234567890abcdef12` (42-character hex address)

## 🚀 Recommended Approach

### Option 1: Use Mock USDFC (Recommended for Testing)
```bash
# Deploy a mock USDFC token for testing
npx hardhat run scripts/deployMockUSDFC.js --network filecoin_calibration

# Use the same mock aggregator for USDFC price (set to $1.00)
USDFC_PRICE_ORACLE_ADDRESS=same_as_mock_aggregator_address
```

### Option 2: Research Real USDFC on Filecoin
- Check if USDFC is actually deployed on Filecoin networks
- Look for official Filecoin documentation about stablecoins
- Contact Filecoin community for USDFC contract addresses

## 📝 Current Configuration Values

### For Backend (.env):
```bash
# Filecoin Calibration RPC URL
BLOCKCHAIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1

# Will be filled after deployment
CONTRACT_ADDRESS=your_deployed_proofchain_address
USDFC_TOKEN_ADDRESS=your_mock_or_real_usdfc_address
USDFC_PRICE_ORACLE_ADDRESS=your_mock_aggregator_address
```

### For Contracts (.env):
```bash
# Same values as backend
FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
USDFC_TOKEN_ADDRESS=your_mock_or_real_usdfc_address
USDFC_PRICE_ORACLE_ADDRESS=your_mock_aggregator_address
```

### For Frontend (.env):
```bash
# Filecoin configuration
REACT_APP_FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
REACT_APP_CHAIN_ID=314159

# USDFC configuration
REACT_APP_USDFC_TOKEN_ADDRESS=your_mock_or_real_usdfc_address
REACT_APP_USDFC_DECIMALS=6
```

## 🛠️ Next Steps

1. **Deploy Mock USDFC** (I can create this script)
2. **Use Mock Price Oracle** (reuse the existing one)
3. **Test the integration** with mock tokens
4. **Research real USDFC** on Filecoin if needed later

## 💡 Important Notes

- **Mock tokens are perfect for testing** - they behave exactly like real tokens
- **Price oracles can return fixed values** (e.g., $1.00 for USDFC)
- **All functionality will work** even with mock contracts
- **Easy to swap** mock addresses for real ones later

Would you like me to create a mock USDFC deployment script?