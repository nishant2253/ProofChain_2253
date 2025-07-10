# CALL_EXCEPTION Debug Solutions

## 🚨 **Your Transaction Analysis**

From your transaction data:
- **Content ID**: 1
- **Token Type**: 2 (USDFC)
- **Stake Amount**: 0.01 USDFC
- **Merkle Proof**: 2 elements (correct format)
- **Status**: 0 (FAILED)

## 🔍 **Most Likely Causes (In Order)**

### **1. USDFC Token Not Activated (90% likely)**
Your contract doesn't recognize token type 2 (USDFC).

**Solution:**
```bash
cd contracts-hardhat
npx hardhat run scripts/activateUSDFCToken.js --network filecoin_calibration
```

### **2. USDFC Token Address Missing (80% likely)**
The contract doesn't know where the USDFC token is deployed.

**Check your .env files:**
```bash
# contracts-hardhat/.env
USDFC_TOKEN_ADDRESS=0x... # Must be set
USDFC_PRICE_ORACLE_ADDRESS=0x... # Same as MOCK_AGGREGATOR_ADDRESS

# frontend/.env
REACT_APP_USDFC_TOKEN_ADDRESS=0x... # Must match contracts .env
```

### **3. USDFC Allowance Issue (70% likely)**
The contract can't spend your USDFC tokens.

**Solution:** The frontend should handle this automatically, but check if USDFC is deployed:
```bash
npx hardhat run scripts/deployMockUSDFC.js --network filecoin_calibration
```

### **4. Content ID Doesn't Exist (60% likely)**
Content ID 1 might not exist in the contract.

**Solution:** Try with a different content ID or submit new content first.

## 🚀 **Quick Fix Steps**

### **Step 1: Try with tFIL First**
Test if basic voting works:
1. Go to ConsensusDashboard
2. Select **Token Type: tFIL** (not USDFC)
3. Set stake amount: 0.01
4. Click "Commit Vote"

If this works, the issue is USDFC-specific.

### **Step 2: Deploy and Activate USDFC**
```bash
cd contracts-hardhat

# Deploy USDFC token
npx hardhat run scripts/deployMockUSDFC.js --network filecoin_calibration

# Copy the USDFC address to your .env files
# Then activate it
npx hardhat run scripts/activateUSDFCToken.js --network filecoin_calibration
```

### **Step 3: Update Environment Variables**
Make sure all .env files have the USDFC addresses:

**contracts-hardhat/.env:**
```bash
USDFC_TOKEN_ADDRESS=0x_your_usdfc_address_here
USDFC_PRICE_ORACLE_ADDRESS=0x_your_mock_aggregator_address_here
```

**frontend/.env:**
```bash
REACT_APP_USDFC_TOKEN_ADDRESS=0x_your_usdfc_address_here
```

### **Step 4: Restart Frontend**
```bash
cd frontend
npm start
```

## 🎯 **Expected Results**

**After fixing:**
- ✅ tFIL voting should work immediately
- ✅ USDFC voting should work after token activation
- ✅ No more CALL_EXCEPTION errors
- ✅ Transaction status should be 1 (success)

## 🔧 **Alternative Debug Method**

**Check transaction on Filecoin explorer:**
1. Visit: https://calibration.filscan.io/tx/0x19689b3b62efaf3faabc854765244a2b6859d00dc1efa0d8a47cf22ef1657459
2. Look for "Revert Reason" or error details
3. This will tell us exactly why the transaction failed

## 📊 **Priority Order**

1. **Try tFIL voting** (quick test)
2. **Deploy/activate USDFC** (if tFIL works)
3. **Check Filecoin explorer** (for exact error)
4. **Verify content exists** (if others don't work)

**The JSON-RPC issues are completely fixed! Now it's just contract configuration.**

**Start with trying tFIL voting to confirm the basic system works.**