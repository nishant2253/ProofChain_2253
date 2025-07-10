# 🚰 Get tFIL for Filecoin Calibration Testnet

## **Your Issue: No tFIL for Gas Fees**

You have 0 tFIL in your wallet, but you need tFIL to pay for transaction gas fees on Filecoin Calibration testnet.

## **🎯 Solution: Get tFIL from Faucet**

### **Step 1: Get Your Filecoin Address**

You already have this from your MetaMask, but let's verify:

```bash
cd contracts-hardhat
npx hardhat get-address --network filecoin_calibration
```

This will show:
- **Ethereum address**: `0x...` (use this for faucet)
- **f4 address**: `f410...` (Filecoin native format)

### **Step 2: Get tFIL from Official Faucet**

**Visit the official Filecoin Calibration faucet:**
🔗 **https://faucet.calibration.fildev.network/**

1. **Enter your Ethereum address** (0x... format from MetaMask)
2. **Click "Send Funds"**
3. **Wait 1-2 minutes** for tFIL to arrive

### **Step 3: Verify tFIL Balance**

Check your MetaMask balance:
- Should show **5-10 tFIL** after faucet request
- This is enough for many transactions

Or check via Hardhat:
```bash
npx hardhat console --network filecoin_calibration
# Then in console:
await ethers.provider.getBalance("YOUR_ADDRESS_HERE")
```

## **🚨 Alternative Faucets (if main one fails):**

### **Faucet Option 2: Glif Faucet**
🔗 **https://faucet.glif.io/**
- Select "Calibration" network
- Enter your address
- Request tFIL

### **Faucet Option 3: FilScan Faucet**
🔗 **https://calibration.filscan.io/faucet**
- Enter your f4 address (f410... format)
- Request funds

## **🎯 After Getting tFIL:**

### **Step 1: Verify Balance**
Check MetaMask shows tFIL balance (should be 5-10 tFIL)

### **Step 2: Try Transaction Again**
1. Go back to your voting interface
2. Try voting with small amount (0.1 tFIL)
3. MetaMask should now show proper gas fees
4. Transaction should succeed

### **Step 3: Expected Transaction Details**
After getting tFIL, your transaction should show:
```
Amount: 0.1 tFIL (or your stake amount)
Gas limit: 500,000 units
Gas fee: ~0.001-0.01 tFIL
Total: 0.1 + gas fee tFIL
```

## **🔧 Quick Commands to Get Your Address:**

```bash
# Get your address for faucet
cd contracts-hardhat
npx hardhat get-address --network filecoin_calibration

# Check balance after faucet
npx hardhat console --network filecoin_calibration
# In console:
await ethers.provider.getBalance("0xYOUR_ADDRESS")
```

## **📊 Expected Results:**

**Before (Current):**
```
❌ Balance: 0 tFIL
❌ Cannot pay gas fees
❌ Transaction fails with "insufficient funds"
```

**After Getting tFIL:**
```
✅ Balance: 5-10 tFIL
✅ Can pay gas fees
✅ Transactions succeed
✅ Can vote with FIL and USDFC
```

## **🚀 Next Steps:**

1. **Get your address**: `npx hardhat get-address --network filecoin_calibration`
2. **Visit faucet**: https://faucet.calibration.fildev.network/
3. **Request tFIL** using your Ethereum address (0x...)
4. **Wait 1-2 minutes** for funds to arrive
5. **Try transaction again** - should work now!

**The faucet is the fastest solution - try it now!**