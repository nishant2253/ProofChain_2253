# Filecoin Calibration RPC Options Guide

## 🌐 **Official Filecoin Calibration RPC Endpoints**

Based on the official Filecoin documentation, here are the verified RPC endpoints:

### **1. Glif (Recommended - Currently Using)**
```bash
HTTPS: https://api.calibration.node.glif.io/rpc/v1
WebSocket: wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1
```
- ✅ **Currently configured**
- ⚠️ **Note**: Only guarantees 2000 latest blocks

### **2. Ankr (Alternative)**
```bash
HTTPS: https://rpc.ankr.com/filecoin_testnet
```
- ✅ **Good alternative option**
- 🔄 **Try if Glif has issues**

### **3. ChainupCloud (Alternative)**
```bash
HTTPS: https://filecoin-calibration.chainup.net/rpc/v1
```
- ✅ **Another reliable option**
- 🔄 **Try if others fail**

## 🔧 **How to Switch RPC Endpoints**

### **If Still Getting JSON-RPC Errors:**

#### Option 1: Try Ankr RPC
Update your `.env` files:
```bash
# contracts-hardhat/.env
FILECOIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet

# backend/.env
BLOCKCHAIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet

# frontend/.env
REACT_APP_FILECOIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet
```

#### Option 2: Try ChainupCloud RPC
```bash
# All .env files
FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
BLOCKCHAIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
REACT_APP_FILECOIN_RPC_URL=https://filecoin-calibration.chainup.net/rpc/v1
```

### **Update MetaMask Network Too:**
When changing RPC, also update MetaMask:
1. **MetaMask** → Networks → Filecoin Calibration → Edit
2. **Change RPC URL** to match your .env files
3. **Save** and reconnect

## 🎯 **Current Issues & Solutions**

### **1. Fix REACT_APP_MERKLE_PROOF First**
```bash
# In frontend/.env - CORRECT format:
REACT_APP_MERKLE_PROOF=["0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9","0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0"]
```

### **2. If Still Getting RPC Errors, Try Different Endpoint**
Test each RPC endpoint:
```bash
# Test Ankr
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' https://rpc.ankr.com/filecoin_testnet

# Test ChainupCloud  
curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' https://filecoin-calibration.chainup.net/rpc/v1
```

Should return: `{"jsonrpc":"2.0","id":1,"result":"0x4cb2f"}`

## 🚀 **Recommended Action Plan**

1. **First**: Fix the REACT_APP_MERKLE_PROOF format in frontend/.env
2. **Restart frontend**: `npm start`
3. **Test voting**: Should work with current Glif RPC
4. **If still RPC errors**: Try Ankr RPC endpoint
5. **Update MetaMask**: Match the RPC you're using

## ✅ **Expected Results**

After fixing:
- ✅ No JSON parsing errors
- ✅ MetaMask opens properly
- ✅ Transactions succeed on Filecoin Calibration
- ✅ Both tFIL and USDFC voting work

**Try fixing the REACT_APP_MERKLE_PROOF first, then we can switch RPC if needed!**