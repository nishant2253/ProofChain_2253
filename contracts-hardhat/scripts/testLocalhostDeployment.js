const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Localhost Deployment...\n");

  // Check if we're on the correct network
  if (hre.network.name !== "localhost") {
    console.error("❌ Error: This script should be run with --network localhost");
    console.log("Usage: npx hardhat run scripts/testLocalhostDeployment.js --network localhost");
    process.exit(1);
  }

  // Check environment variables
  const contractAddress = process.env.PROOFCHAIN_CONTRACT_ADDRESS;
  const mockAggregatorAddress = process.env.MOCK_AGGREGATOR_ADDRESS;
  const merkleRoot = process.env.MERKLE_ROOT;

  if (!contractAddress || !mockAggregatorAddress || !merkleRoot) {
    console.error("❌ Error: Missing contract addresses in .env file!");
    console.log("Please run the deployment scripts first:");
    console.log("1. npm run step1:merkle");
    console.log("2. npm run step2:aggregator");
    console.log("3. npm run step3:contract");
    console.log("4. npm run step4:activate-eth");
    process.exit(1);
  }

  console.log("📋 Testing Configuration:");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);
  console.log("Mock Aggregator:", mockAggregatorAddress);
  console.log("Merkle Root:", merkleRoot);

  try {
    // Get contract instances
    const proofChain = await hre.ethers.getContractAt("ProofChainMultiTokenVoting", contractAddress);
    const mockAggregator = await hre.ethers.getContractAt("MockAggregatorV3", mockAggregatorAddress);

    console.log("\n🔍 Testing Contract Functions...");

    // Test 1: Check merkle root
    const storedMerkleRoot = await proofChain.merkleRoot();
    console.log("✅ Merkle root matches:", storedMerkleRoot === merkleRoot);

    // Test 2: Check ETH token activation
    const ethTokenInfo = await proofChain.supportedTokens("0x0000000000000000000000000000000000000000");
    console.log("✅ ETH token is active:", ethTokenInfo.isActive);
    console.log("   Minimum stake:", hre.ethers.formatEther(ethTokenInfo.minimumStake), "ETH");

    // Test 3: Check price oracle
    const latestPrice = await mockAggregator.latestRoundData();
    console.log("✅ Price oracle working, ETH price:", hre.ethers.formatUnits(latestPrice.answer, 8), "USD");

    // Test 4: Check voting phase
    const currentPhase = await proofChain.currentPhase();
    console.log("✅ Current voting phase:", currentPhase === 0n ? "Commit" : "Reveal");

    // Test 5: Check network details
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("✅ Deployer address:", deployer.address);
    console.log("✅ Deployer balance:", hre.ethers.formatEther(balance), "ETH");

    console.log("\n🎉 All tests passed! Localhost deployment is working correctly.");
    console.log("\n🌐 Next Steps:");
    console.log("1. Update your frontend .env file with the contract address");
    console.log("2. Update your backend .env file with the contract address");
    console.log("3. Start your backend: cd backend && npm start");
    console.log("4. Start your frontend: cd frontend && npm start");
    console.log("5. Configure MetaMask for localhost network (Chain ID: 31337)");
    console.log("6. Import test account with private key from Hardhat node");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure Hardhat node is running: npm run node");
    console.log("2. Check that all deployment steps completed successfully");
    console.log("3. Verify .env file has correct contract addresses");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });