const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const proofChainContractAddress = process.env.PROOFCHAIN_CONTRACT_ADDRESS;
  const proofChain = await hre.ethers.getContractAt("ProofChainMultiTokenVoting", proofChainContractAddress, deployer);

  const fil_price_oracle_address = process.env.MOCK_AGGREGATOR_ADDRESS; // Use same mock aggregator
  
  // TokenType.FIL - position 4 in enum (BTC=0, ETH=1, USDFC=2, MATIC=3, FIL=4)
  const FIL_TOKEN_TYPE = 4;
  const FIL_DECIMALS = 18; // FIL uses 18 decimals like ETH
  const FIL_BONUS_MULTIPLIER = 1000; // 1000 = 100%
  const FIL_MIN_STAKE_AMOUNT = hre.ethers.parseUnits("0.1", FIL_DECIMALS); // 0.1 FIL

  console.log("Activating FIL token...");
  console.log(`FIL Token Type: ${FIL_TOKEN_TYPE}`);
  console.log(`FIL Price Oracle: ${fil_price_oracle_address}`);
  
  // For FIL token, we need to use a placeholder address since the contract requires a valid address
  // We'll use the deployer address as a placeholder for native tokens
  const fil_token_address = deployer.address; // Use deployer address as placeholder
  
  console.log(`Using placeholder address for FIL: ${fil_token_address}`);
  
  const tx = await proofChain.addOrUpdateToken(
    FIL_TOKEN_TYPE,
    fil_token_address, // Use placeholder address instead of ZeroAddress
    fil_price_oracle_address,
    FIL_DECIMALS,
    true, // isActive
    FIL_BONUS_MULTIPLIER,
    FIL_MIN_STAKE_AMOUNT
  );
  await tx.wait();

  console.log("FIL token activated successfully!");
  console.log(`Transaction hash: ${tx.hash}`);
  
  console.log("\n=== FIL TOKEN CONFIGURATION ===");
  console.log(`Token Type: ${FIL_TOKEN_TYPE} (FIL)`);
  console.log(`Decimals: ${FIL_DECIMALS}`);
  console.log(`Min Stake: ${hre.ethers.formatUnits(FIL_MIN_STAKE_AMOUNT, FIL_DECIMALS)} FIL`);
  console.log(`Bonus Multiplier: ${FIL_BONUS_MULTIPLIER / 10}%`);
  
  console.log("\n=== VERIFICATION ON EXPLORER ===");
  if (hre.network.name === "filecoin_calibration") {
    console.log(`https://filfox.info/en/tx/${tx.hash}`);
    console.log(`https://calibration.filscan.io/tx/${tx.hash}`);
  } else {
    console.log(`Transaction hash: ${tx.hash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });