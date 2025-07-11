const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const proofChainContractAddress = process.env.PROOFCHAIN_CONTRACT_ADDRESS;
  const proofChain = await hre.ethers.getContractAt("ProofChainVoting", proofChainContractAddress, deployer);

  const ethPriceOracleAddress = process.env.MOCK_AGGREGATOR_ADDRESS;

  // TokenType.ETH is 1
  const ETH_TOKEN_TYPE = 1;
  const ETH_DECIMALS = 18;
  const ETH_BONUS_MULTIPLIER = 1000; // 1000 = 100%
  const ETH_MIN_STAKE_AMOUNT = hre.ethers.parseUnits("0.01", ETH_DECIMALS); // 0.01 ETH

  console.log("Activating ETH token...");
  const tx = await proofChain.addToken(
    ETH_TOKEN_TYPE,
    "0x0000000000000000000000000000000000000000", // ETH token address (zero address for native ETH)
    ethPriceOracleAddress,
    ETH_DECIMALS,
    ETH_BONUS_MULTIPLIER,
    ETH_MIN_STAKE_AMOUNT
  );
  await tx.wait();

  console.log("ETH token activated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });