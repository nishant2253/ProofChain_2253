# Merkle Verification Fix Guide

## 🚨 **Root Cause of the Error**

The error "User not verified - potential Sybil" means your wallet address `0xF17cF1E4F18bbe29bdeBe37Eb3e9aA4C0437a3E5` is not in the merkle tree whitelist that was generated.

## 🔧 **How to Fix This**

### Option 1: Update Merkle Data with Your Address (Recommended)

1. **Edit the generateMerkleData.js script** to include your actual wallet address:

```javascript
// In contracts-hardhat/scripts/generateMerkleData.js
const addresses = [
    deployer.address, // Your deployer address
    "0xF17cF1E4F18bbe29bdeBe37Eb3e9aA4C0437a3E5", // Your actual MetaMask address
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Example address 1
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Example address 2
];

// And change the target address to your MetaMask address:
const targetAddress = "0xF17cF1E4F18bbe29bdeBe37Eb3e9aA4C0437a3E5";
```

2. **Regenerate the merkle data:**
```bash
cd contracts-hardhat
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration
```

3. **Update your .env files** with the new merkle root and proof:
```bash
# In contracts-hardhat/.env
MERKLE_ROOT=new_merkle_root_here

# In frontend/.env
REACT_APP_MERKLE_PROOF=["new_proof_array_here"]
```

4. **Redeploy the ProofChain contract** with the new merkle root:
```bash
npx hardhat run scripts/deploy.js --network filecoin_calibration
```

### Option 2: Use the Deployer Address for Testing

If your deployer address is the same as your MetaMask address, make sure the merkle proof in frontend/.env matches what was generated.

## 🎯 **Steps to Complete the Fix**

1. **Check your addresses:**
   - Deployer address: (from your private key)
   - MetaMask address: `0xF17cF1E4F18bbe29bdeBe37Eb3e9aA4C0437a3E5`

2. **If they're different, follow Option 1 above**

3. **If they're the same, check your frontend/.env:**
   ```bash
   # Make sure this matches the output from generateMerkleData.js
   REACT_APP_MERKLE_PROOF=["0x...", "0x..."]
   ```

4. **Test the fix:**
   - Try committing a vote again
   - MetaMask should now open for transaction confirmation

## 🔍 **Verification**

After fixing, you should see:
1. ✅ No "User not verified" error
2. ✅ MetaMask opens for transaction confirmation
3. ✅ Transaction succeeds on Filecoin Calibration

## 📝 **Current Status**

- Your wallet: `0xF17cF1E4F18bbe29bdeBe37Eb3e9aA4C0437a3E5`
- Contract: `0x806a5a417a9F71aDaA2fD95F6EE5D56AF899FB5b`
- Issue: Address not in merkle whitelist

**Need help with any of these steps?**