# Quick Fix Steps for Merkle Verification

## 🚀 **Step-by-Step Fix**

### 1. **I've Updated the Script**
The `generateMerkleData.js` script now includes your MetaMask address `0xF17cF1E4F18bbe29bdeBe37Eb3e9aA4C0437a3E5`.

### 2. **Run These Commands in Order:**

```bash
# Navigate to contracts directory
cd contracts-hardhat

# Generate new merkle data with your address
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration
```

### 3. **Copy the Output Values**
You'll see output like:
```
=== MERKLE DATA GENERATED ===
Merkle Root: 0x1234567890abcdef...
Target Address: 0xF17cF1E4F18bbe29bdeBe37Eb3e9aA4C0437a3E5
Target Merkle Proof: ["0xproof1...", "0xproof2..."]

=== UPDATE YOUR .ENV FILES ===
MERKLE_ROOT=0x1234567890abcdef...
REACT_APP_MERKLE_PROOF=["0xproof1...", "0xproof2..."]
```

### 4. **Update Your .env Files:**

**contracts-hardhat/.env:**
```bash
MERKLE_ROOT=paste_the_merkle_root_here
```

**frontend/.env:**
```bash
REACT_APP_MERKLE_PROOF=paste_the_merkle_proof_here
```

### 5. **Redeploy Contract with New Merkle Root:**
```bash
# Deploy with new merkle root
npx hardhat run scripts/deploy.js --network filecoin_calibration

# Activate tokens
npx hardhat run scripts/activateEthToken.js --network filecoin_calibration
npx hardhat run scripts/activateUSDFCToken.js --network filecoin_calibration
```

### 6. **Update Contract Address:**
Copy the new contract address to all your .env files:
- `contracts-hardhat/.env` → `PROOFCHAIN_CONTRACT_ADDRESS=new_address`
- `backend/.env` → `CONTRACT_ADDRESS=new_address`  
- `frontend/.env` → `REACT_APP_CONTRACT_ADDRESS=new_address`

### 7. **Restart Frontend:**
```bash
cd frontend
npm start
```

## 🎯 **Expected Result:**
- ✅ No more "User not verified" error
- ✅ MetaMask opens for transaction confirmation
- ✅ Voting works with both tFIL and USDFC

## 🚨 **If Still Having Issues:**
1. Check that REACT_APP_MERKLE_PROOF is properly formatted in frontend/.env
2. Ensure the contract address is updated everywhere
3. Make sure you're using the correct network (Filecoin Calibration)

**Ready to run the first command?**