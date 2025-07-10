# Merkle Data Generation Fix

## 🔧 What was the problem?
The `generateMerkleData.js` script was trying to access multiple signers that don't exist on remote networks like Filecoin Calibration. On localhost, Hardhat provides test accounts, but on remote networks, only your private key account is available.

## ✅ What I fixed:
1. **Added error handling** for missing signers
2. **Used only the deployer address** from your private key
3. **Added example addresses** for a complete whitelist
4. **Improved output formatting** with clear instructions

## 🚀 Next Steps:

### 1. Update the script with your MetaMask address (if different)
If your MetaMask address is different from your deployer address, edit the script:

```javascript
// In generateMerkleData.js, replace this line:
const addresses = [
    deployer.address, // Your deployer address
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Example address 1
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Example address 2
    "YOUR_METAMASK_ADDRESS_HERE", // Add your actual MetaMask address
];

// And change the target address:
const targetAddress = "YOUR_METAMASK_ADDRESS_HERE";
```

### 2. Run the fixed script:
```bash
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration
```

### 3. Copy the output to your .env files:
The script will now provide exact values to copy to your environment files.

## 📝 Example Output:
```
=== MERKLE DATA GENERATED ===
Merkle Root: 0x1234567890abcdef...
Target Address: 0xYourAddress...
Target Merkle Proof: ["0xproof1...", "0xproof2..."]

=== UPDATE YOUR .ENV FILES ===
MERKLE_ROOT=0x1234567890abcdef...
REACT_APP_MERKLE_PROOF=["0xproof1...", "0xproof2..."]
```

## 🎯 Important:
- The **Target Address** should match your **MetaMask address**
- The **Merkle Proof** is what proves your address is in the whitelist
- You can add multiple addresses to the whitelist for testing