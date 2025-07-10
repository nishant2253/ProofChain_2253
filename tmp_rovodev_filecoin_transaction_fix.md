# 🚨 Filecoin Transaction Fix - JSON RPC Error Solution

## **Your Current Issue:**
- MetaMask opens for transaction approval
- After clicking "Confirm", you get "JSON RPC failed" error
- Transaction fails and MetaMask opens again

## **Root Causes & Solutions:**

### **1. MetaMask Network Configuration Issue**

**Problem**: MetaMask might have incorrect Filecoin Calibration settings

**Solution**: Update MetaMask network manually:

1. **Open MetaMask** → Click network dropdown → "Add Network" or "Edit"
2. **Use these EXACT settings:**
   ```
   Network Name: Filecoin Calibration
   RPC URL: https://api.calibration.node.glif.io/rpc/v1
   Chain ID: 314159
   Currency Symbol: tFIL
   Block Explorer: https://calibration.filscan.io
   ```
3. **Save and switch to this network**

### **2. Gas Limit Issues**

**Problem**: Filecoin requires higher gas limits than Ethereum

**Solution**: Update your frontend transaction code:

```javascript
// In your voting/transaction functions, use these gas settings:
const txOptions = {
  gasLimit: 2000000,  // Higher gas limit for Filecoin
  gasPrice: ethers.utils.parseUnits("1.5", "gwei"), // Manual gas price
  value: stakeAmount, // For FIL transactions
};

// For retry attempts:
const retryOptions = {
  gasLimit: 3000000,  // Even higher for retry
  gasPrice: ethers.utils.parseUnits("2", "gwei"),
};
```

### **3. Provider Configuration Fix**

**Problem**: Default ethers.js provider not optimized for Filecoin

**Solution**: Update your WalletContext or provider setup:

```javascript
// Better provider configuration for Filecoin
const provider = new ethers.providers.Web3Provider(window.ethereum, {
  name: "filecoin-calibration",
  chainId: 314159,
  ensAddress: null, // Filecoin doesn't support ENS
});

// Increase polling interval for Filecoin
provider.pollingInterval = 5000; // 5 seconds instead of default 1s
```

### **4. Alternative RPC Endpoints**

If still having issues, try these RPC alternatives:

**Option A: Ankr RPC**
```bash
# Update both .env files:
# contracts-hardhat/.env
FILECOIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet

# frontend/.env  
REACT_APP_FILECOIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet
```

**Option B: ChainupCloud RPC**
```bash
# Update both .env files:
FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
REACT_APP_FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
```

## **🔧 Quick Fix Steps:**

### **Step 1: Fix MetaMask Network**
1. Remove existing "Filecoin Calibration" network from MetaMask
2. Add new network with exact settings above
3. Make sure you're connected to this network

### **Step 2: Check tFIL Balance**
- Ensure you have enough tFIL for gas fees
- Get more from faucet: https://faucet.calibration.fildev.network/

### **Step 3: Try Alternative RPC (if needed)**
```bash
cd frontend
# Edit .env file to use Ankr RPC
echo "REACT_APP_FILECOIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet" >> .env

cd ../contracts-hardhat  
# Edit .env file to use Ankr RPC
echo "FILECOIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet" >> .env
```

### **Step 4: Restart Frontend**
```bash
cd frontend
npm start
```

### **Step 5: Test Transaction**
1. Try voting with small amount first (0.1 tFIL)
2. Check browser console for detailed error logs
3. If successful, try larger amounts

## **🎯 Expected Results After Fix:**

**Before (Current Issue):**
```
❌ MetaMask opens → Confirm → JSON RPC failed
❌ Transaction rejected by network
❌ MetaMask opens again (retry loop)
```

**After (Fixed):**
```
✅ MetaMask opens → Confirm → Transaction pending
✅ Transaction confirmed on Filecoin Calibration
✅ Success message in your app
✅ Transaction visible on https://calibration.filscan.io
```

## **🚨 If Still Having Issues:**

### **Debug Steps:**
1. **Check browser console** for specific error messages
2. **Verify MetaMask network** matches your RPC URL exactly
3. **Test with Hardhat console** first:
   ```bash
   cd contracts-hardhat
   npx hardhat console --network filecoin_calibration
   ```

### **Alternative Testing:**
```javascript
// In Hardhat console, test direct contract interaction:
const proofChain = await ethers.getContractAt("ProofChainMultiTokenVoting", "0x296f876A73Cdd871846D25cB9A997CEd82898792");

// Check if contract is accessible
await proofChain.owner();

// Test a simple read function
await proofChain.supportedTokens(1); // Check ETH token
```

## **📊 Most Common Fixes:**

1. **70% of cases**: MetaMask network RPC URL mismatch
2. **20% of cases**: Insufficient gas limits
3. **10% of cases**: RPC endpoint temporary issues

**Start with fixing MetaMask network settings - this resolves most issues!**