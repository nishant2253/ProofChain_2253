// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  // Default merkle root for the contract deployment
  const merkleRoot = process.env.MERKLE_ROOT;

  console.log("Deploying ProofChainVoting contract...");
  console.log(`Using merkle root: ${merkleRoot}`);

  const ProofChain = await hre.ethers.getContractFactory(
    "ProofChainVoting"
  );
  const proofChain = await ProofChain.deploy(merkleRoot);

  // Wait for the contract to be deployed
  await proofChain.waitForDeployment();

  // Get the contract address
  const proofChainAddress = await proofChain.getAddress();

  console.log(`ProofChainVoting deployed to: ${proofChainAddress}`);
  console.log("Contract deployment completed successfully!");

  // Log deployment information for verification
  console.log("\nTo verify on Etherscan:");
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${proofChainAddress} "${merkleRoot}"`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
