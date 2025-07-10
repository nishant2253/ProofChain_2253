# Filecoin RPC Troubleshooting Guide

## 🚨 **"Internal JSON-RPC Error" Solutions**

### Option 1: Try Alternative Filecoin RPC URLs

The current RPC `https://filecoin-calibration.chainup.net/rpc/v1` might be having issues. Try these alternatives:

#### **Update your hardhat.config.js:**
```javascript
filecoin_calibration: {
  url: "https://api.calibration.node.glif.io/rpc/v1", // Alternative RPC
  accounts: PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [PRIVATE_KEY] : [],
  chainId: 314159,
  gasPrice: "auto",
  gas: "auto",
},
```

#### **Alternative RPC URLs to try:**
1. `https://api.calibration.node.glif.io/rpc/v1`
2. `https://calibration.filfox.info/rpc/v1`
3. `https://filecoin-calibration.chainstacklabs.com/rpc/v1`

### Option 2: Update MetaMask Network Settings

**Manually add/update Filecoin Calibration in MetaMask:**

1. **Open MetaMask** → Networks → Add Network
2. **Use these exact settings:**
   ```
   Network Name: Filecoin Calibration
   RPC URL: https://api.calibration.node.glif.io/rpc/v1
   Chain ID: 314159
   Currency Symbol: tFIL
   Block Explorer: https://calibration.filscan.io
   ```

### Option 3: Check Network Status

**Verify Filecoin Calibration is working:**
- Visit: https://calibration.filscan.io
- Check if the network is operational

### Option 4: Test with curl

**Test RPC connectivity:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://api.calibration.node.glif.io/rpc/v1
```

Should return: `{"jsonrpc":"2.0","id":1,"result":"0x4cb2f"}`

## 🔧 **Quick Fix Steps:**

### Step 1: Update RPC URL
```bash
# Edit contracts-hardhat/hardhat.config.js
# Change the filecoin_calibration URL to:
url: "https://api.calibration.node.glif.io/rpc/v1"
```

### Step 2: Update Environment Files
```bash
# contracts-hardhat/.env
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# backend/.env  
BLOCKCHAIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# frontend/.env
REACT_APP_FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
```

### Step 3: Update MetaMask Network
- Remove old Filecoin Calibration network
- Add new one with the alternative RPC URL

### Step 4: Test Connection
```bash
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration
```

## 🎯 **Expected Results:**

After fixing the RPC:
- ✅ No more "Internal JSON-RPC error"
- ✅ MetaMask connects successfully
- ✅ Transactions work properly

## 🚨 **If Still Having Issues:**

1. **Try localhost testing first:**
   ```bash
   # Start local hardhat node
   npx hardhat node
   
   # Deploy locally
   npx hardhat run scripts/deploy.js --network localhost
   ```

2. **Check Filecoin faucet:**
   - Ensure you have tFIL: https://faucet.calibration.fildev.network/

3. **Verify wallet balance:**
   - Check you have enough tFIL for gas fees

**Try updating the RPC URL first and let me know if that resolves the issue!**