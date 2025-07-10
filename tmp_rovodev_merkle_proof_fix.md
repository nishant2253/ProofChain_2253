# Merkle Proof JSON Format Fix

## 🚨 **The Problem**
Your `REACT_APP_MERKLE_PROOF` in `frontend/.env` has invalid JSON format, causing a parsing error.

## 🔧 **How to Fix**

### Step 1: Check Your Current frontend/.env
Open `frontend/.env` and look for the `REACT_APP_MERKLE_PROOF` line. It probably looks something like this (WRONG):

```bash
# WRONG FORMAT (causes error)
REACT_APP_MERKLE_PROOF=["0x1234...", "0x5678..."] extra text here
REACT_APP_MERKLE_PROOF="["0x1234...", "0x5678..."]"
REACT_APP_MERKLE_PROOF=['0x1234...', '0x5678...']
```

### Step 2: Fix the Format
The correct format should be (RIGHT):

```bash
# CORRECT FORMAT
REACT_APP_MERKLE_PROOF=["0x1234567890abcdef...", "0x9876543210fedcba..."]
```

### Step 3: Get the Correct Merkle Proof

**Option A: Regenerate Merkle Data**
```bash
cd contracts-hardhat
npx hardhat run scripts/generateMerkleData.js --network filecoin_calibration
```

Copy the exact output from `REACT_APP_MERKLE_PROOF=...` line.

**Option B: Use Empty Proof for Testing**
```bash
# In frontend/.env - use empty array for testing
REACT_APP_MERKLE_PROOF=[]
```

### Step 4: Example of Correct Format

```bash
# frontend/.env
REACT_APP_MERKLE_PROOF=["0x070e8db97b197cc0e4a1790c5e6c3667bab32d733db7f815fbe84f5824c7168d"]
```

## ✅ **Validation Rules**

Your `REACT_APP_MERKLE_PROOF` must:
1. **Start with `[`** and **end with `]`**
2. **Use double quotes** around strings: `"0x..."`
3. **No extra text** after the closing bracket
4. **No quotes** around the entire array
5. **Valid hex strings** starting with `0x`

## 🎯 **Quick Test**

After fixing, you should see in browser console:
```
Successfully parsed merkle proof: ["0x..."]
```

Instead of:
```
Failed to parse REACT_APP_MERKLE_PROOF: SyntaxError...
```

## 🚀 **Next Steps**

1. **Fix the REACT_APP_MERKLE_PROOF format** in frontend/.env
2. **Restart your frontend** (`npm start`)
3. **Try voting again** - should work without JSON errors

**What does your current REACT_APP_MERKLE_PROOF line look like in frontend/.env?**