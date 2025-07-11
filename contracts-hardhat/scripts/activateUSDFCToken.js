const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const proofChainContractAddress = process.env.PROOFCHAIN_CONTRACT_ADDRESS;
  const proofChain = await hre.ethers.getContractAt("ProofChainVoting", proofChainContractAddress, deployer);

  const usdfc_token_address = process.env.USDFC_TOKEN_ADDRESS;
  const usdfc_price_oracle_address = process.env.USDFC_PRICE_ORACLE_ADDRESS;

  // TokenType.USDFC - now at position 2 in the enum (BTC=0, ETH=1, USDFC=2)
  const USDFC_TOKEN_TYPE = 2;
  const USDFC_DECIMALS = 6; // USDFC typically uses 6 decimals like USDC
  const USDFC_BONUS_MULTIPLIER = 1000; // 1000 = 100%
  const USDFC_MIN_STAKE_AMOUNT = hre.ethers.parseUnits("1", USDFC_DECIMALS); // 1 USDFC

  console.log("Activating USDFC token...");
  console.log(`USDFC Token Address: ${usdfc_token_address}`);
  console.log(`USDFC Price Oracle: ${usdfc_price_oracle_address}`);
  
  const tx = await proofChain.addToken(
    USDFC_TOKEN_TYPE,
    usdfc_token_address,
    usdfc_price_oracle_address,
    USDFC_DECIMALS,
    true, // isActive
    USDFC_BONUS_MULTIPLIER,
    USDFC_MIN_STAKE_AMOUNT
  );
  await tx.wait();

  console.log("USDFC token activated successfully!");
  console.log(`Transaction hash: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });