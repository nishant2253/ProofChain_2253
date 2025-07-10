const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying MockFIL with account:", deployer.address);
  
  // Get balance using provider instead of signer
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "tFIL");

  // Deploy MockFIL (similar to MockUSDFC but for FIL)
  const MockFIL = await hre.ethers.getContractFactory("MockUSDFC"); // Reuse MockUSDFC contract
  const mockFIL = await MockFIL.deploy();

  await mockFIL.waitForDeployment();
  const fil_address = await mockFIL.getAddress();

  console.log(`MockFIL deployed to: ${fil_address}`);
  
  // Get token info
  const name = await mockFIL.name();
  const symbol = await mockFIL.symbol();
  const decimals = await mockFIL.decimals();
  const totalSupply = await mockFIL.totalSupply();
  
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Token Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  
  // Test the faucet function
  console.log("\nTesting faucet function...");
  const faucetTx = await mockFIL.faucet();
  await faucetTx.wait();
  
  const deployerBalance = await mockFIL.balanceOf(deployer.address);
  console.log(`Deployer balance after faucet: ${hre.ethers.formatUnits(deployerBalance, decimals)} ${symbol}`);
  
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`MockFIL Address: ${fil_address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  
  console.log("\n=== UPDATE YOUR .ENV FILES ===");
  console.log(`FIL_TOKEN_ADDRESS=${fil_address}`);
  console.log(`REACT_APP_FIL_TOKEN_ADDRESS=${fil_address}`);
  
  console.log("\n=== VERIFICATION ON FILECOIN EXPLORER ===");
  if (hre.network.name === "filecoin_calibration") {
    console.log(`https://filfox.info/en/address/${fil_address}`);
    console.log(`https://calibration.filscan.io/address/${fil_address}`);
  }
  
  console.log("\n=== HARDHAT VERIFICATION (if supported) ===");
  console.log(`npx hardhat verify --network ${hre.network.name} ${fil_address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });