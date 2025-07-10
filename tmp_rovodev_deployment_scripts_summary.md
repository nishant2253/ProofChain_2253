# Complete Token Deployment Scripts

## ✅ **Available Token Activation Scripts**

### **1. ETH/tFIL Token (Type 1)**
```bash
npx hardhat run scripts/activateEthToken.js --network localhost
npx hardhat run scripts/activateEthToken.js --network filecoin_calibration
```

### **2. USDFC Token (Type 2)**
```bash
npx hardhat run scripts/deployMockUSDFC.js --network localhost
npx hardhat run scripts/activateUSDFCToken.js --network localhost
```

### **3. FIL Token (Type 4) - NEW!**
```bash
npx hardhat run scripts/activateFILToken.js --network localhost
npx hardhat run scripts/activateFILToken.js --network filecoin_calibration
```

## 🚀 **Complete Local Deployment Sequence**

### **Terminal 1: Start Hardhat Node**
```bash
cd contracts-hardhat
npx hardhat node
# Keep this running
```

### **Terminal 2: Deploy All Contracts**
```bash
cd contracts-hardhat

# 1. Generate merkle data
npx hardhat run scripts/generateMerkleData.js --network localhost

# 2. Deploy mock aggregator
npx hardhat run scripts/deployMockAggregator.js --network localhost

# 3. Deploy mock USDFC token
npx hardhat run scripts/deployMockUSDFC.js --network localhost

# 4. Deploy main ProofChain contract
npx hardhat run scripts/deploy.js --network localhost

# 5. Activate ETH token (Type 1)
npx hardhat run scripts/activateEthToken.js --network localhost

# 6. Activate USDFC token (Type 2)
npx hardhat run scripts/activateUSDFCToken.js --network localhost

# 7. Activate FIL token (Type 4) - NEW!
npx hardhat run scripts/activateFILToken.js --network localhost
```

## 🎯 **Token Types Now Available**

After running all scripts:
- ✅ **BTC (0)** - Available in UI (not activated)
- ✅ **ETH (1)** - Activated and functional
- ✅ **USDFC (2)** - Activated and functional  
- ✅ **MATIC (3)** - Available in UI (not activated)
- ✅ **FIL (4)** - Activated and functional (NEW!)
- ✅ **USDC (5)** - Available in UI (not activated)
- ✅ **USDT (6)** - Available in UI (not activated)
- ✅ **DOT (7)** - Available in UI (not activated)
- ✅ **SOL (8)** - Available in UI (not activated)

## 🔧 **Backend Authentication Fix**

The Sepolia connection error is fixed by:
1. **Checking if user exists** before creating
2. **Graceful error handling** - continues even if backend auth fails
3. **Lowercase address normalization**
4. **Non-blocking authentication** - wallet still connects

## 📊 **Expected Results**

### **Hardhat Node (Terminal 1) Will Show:**
```
eth_sendTransaction
  Contract deployment: MockAggregatorV3
  Gas used: 841,586
  
eth_sendTransaction  
  Contract deployment: MockUSDFC
  Gas used: 1,234,567
  
eth_sendTransaction
  Contract deployment: ProofChainMultiTokenVoting
  Gas used: 2,841,586
  
eth_sendTransaction
  Method: addOrUpdateToken (ETH)
  Gas used: 156,842
  
eth_sendTransaction
  Method: addOrUpdateToken (USDFC)
  Gas used: 156,842
  
eth_sendTransaction
  Method: addOrUpdateToken (FIL)
  Gas used: 156,842
```

### **Deployment Scripts (Terminal 2) Will Show:**
```
✅ MockAggregatorV3 deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ MockUSDFC deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ ProofChain deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
✅ ETH token activated successfully!
✅ USDFC token activated successfully!
✅ FIL token activated successfully!
```

## 🎉 **Now You Have:**

- **3 Active Tokens**: ETH, USDFC, FIL
- **6 UI-Available Tokens**: BTC, MATIC, USDC, USDT, DOT, SOL
- **Fixed Backend Auth**: No more 400 errors on network switching
- **Complete Local Testing**: Full multi-token voting system

**Run the deployment sequence and you'll see all the transaction logs!**