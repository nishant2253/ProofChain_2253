# Manual Contract Redeployment Instructions

## Issue Fixed
Updated `MIN_VOTING_PERIOD` from `24 hours` to `1 minutes` in the smart contract.

## Steps to Redeploy:

1. **Navigate to contracts directory:**
   ```bash
   cd contracts-hardhat
   ```

2. **Compile the updated contract:**
   ```bash
   npm run compile
   ```

3. **Deploy the new contract:**
   ```bash
   npm run deploy
   ```

4. **Update the contract address in backend .env:**
   - Copy the new contract address from the deployment output
   - Update `CONTRACT_ADDRESS` in `backend/.env`

5. **Restart the backend server:**
   ```bash
   cd ../backend
   npm start
   ```

## What Changed:
- Smart contract now allows minimum voting period of 1 minute instead of 24 hours
- Frontend validation already updated to 1 minute minimum
- Backend validation already updated to 60 seconds minimum
- All documentation updated

## Verification:
After redeployment, you should be able to set voting periods as short as 1 minute without getting the "must be greater than or equal to 86400" error.