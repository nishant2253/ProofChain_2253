# Localhost Issues Fix Guide

## 🚨 **Current Issues Identified:**

### 1. **Network Mismatch**
- **Problem**: MetaMask is on Sepolia (Chain ID: 11155111)
- **Frontend expects**: Filecoin Calibration (Chain ID: 314159)
- **Solution**: Switch MetaMask network or update frontend config

### 2. **Backend Server Issues**
- **Problem**: 404/400 errors from `http://localhost:3000/api`
- **Cause**: Backend server not running or misconfigured
- **Solution**: Start backend server properly

### 3. **Multiple Authentication Attempts**
- **Problem**: Duplicate authentication requests
- **Solution**: Added prevention for simultaneous auth attempts

## 🔧 **Quick Fixes Applied:**

### **1. Enhanced Network Detection**
- Removed hardcoded network assumptions
- Better error handling for network mismatches
- Graceful fallback when network detection fails

### **2. Backend Health Check**
- Added backend availability check before authentication
- Prevents 404 errors when backend is down
- Graceful degradation without backend

### **3. Authentication Deduplication**
- Prevents multiple simultaneous auth attempts
- Cleaner error handling and logging

## 🚀 **Solutions to Try:**

### **Option 1: Fix Network Mismatch**
**Switch MetaMask to Filecoin Calibration:**
1. Open MetaMask
2. Click network dropdown
3. Select "Filecoin Calibration" (or add it if missing)
4. Refresh the page

### **Option 2: Use Local Hardhat Network**
**Switch to localhost for testing:**
1. **Start Hardhat node** (if not running):
   ```bash
   cd contracts-hardhat
   npx hardhat node
   ```

2. **Switch MetaMask to Localhost**:
   - Network: Localhost 8545
   - Chain ID: 31337
   - RPC: http://localhost:8545

3. **Update frontend/.env**:
   ```bash
   REACT_APP_CHAIN_ID=31337
   REACT_APP_BLOCKCHAIN_NETWORK=localhost
   ```

### **Option 3: Start Backend Server**
**Make sure backend is running:**
```bash
cd backend
npm install
npm start
```

**Should see:**
```
✅ Server running on port 3000
✅ MongoDB connected
✅ API available at http://localhost:3000/api
```

### **Option 4: Skip Backend for Frontend Testing**
**Test frontend without backend:**
1. The frontend will now work without backend
2. Wallet connection will succeed
3. You can test the UI components
4. Backend features will be disabled gracefully

## ✅ **Expected Results After Fix:**

### **Console Should Show:**
```
✅ Detected network: {name: "sepolia", chainId: 11155111}
✅ Backend not available, skipping authentication
✅ Wallet connected successfully
```

### **Instead of:**
```
❌ Network detection failed, using fallback
❌ Failed to load resource: 404 (Not Found)
❌ Error authenticating with backend: 400 (Bad Request)
```

## 🎯 **Recommended Action:**

1. **Restart your frontend** to get the fixes
2. **Choose Option 1 or 2** based on what you want to test
3. **Start backend** if you need full functionality
4. **Test wallet connection** - should work smoothly now

**The frontend will now handle network mismatches and backend issues gracefully!**