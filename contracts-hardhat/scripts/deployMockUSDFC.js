const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying MockUSDFC with account:", deployer.address);
  
  // Get balance using provider instead of signer
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "tFIL");

  // Deploy MockUSDFC
  const MockUSDFC = await hre.ethers.getContractFactory("MockUSDFC");
  const mockUSDFC = await MockUSDFC.deploy();

  await mockUSDFC.waitForDeployment();
  const usdfc_address = await mockUSDFC.getAddress();

  console.log(`MockUSDFC deployed to: ${usdfc_address}`);
  
  // Get token info
  const name = await mockUSDFC.name();
  const symbol = await mockUSDFC.symbol();
  const decimals = await mockUSDFC.decimals();
  const totalSupply = await mockUSDFC.totalSupply();
  
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Token Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  
  // Test the faucet function
  console.log("\nTesting faucet function...");
  const faucetTx = await mockUSDFC.faucet();
  await faucetTx.wait();
  
  const deployerBalance = await mockUSDFC.balanceOf(deployer.address);
  console.log(`Deployer balance after faucet: ${hre.ethers.formatUnits(deployerBalance, decimals)} ${symbol}`);
  
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`MockUSDFC Address: ${usdfc_address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  
  console.log("\n=== UPDATE YOUR .ENV FILES ===");
  console.log(`USDFC_TOKEN_ADDRESS=${usdfc_address}`);
  console.log(`REACT_APP_USDFC_TOKEN_ADDRESS=${usdfc_address}`);
  
  console.log("\n=== VERIFICATION ON FILECOIN EXPLORER ===");
  console.log(`https://filfox.info/en/address/${usdfc_address}`);
  console.log(`https://calibration.filscan.io/address/${usdfc_address}`);
  
  console.log("\n=== HARDHAT VERIFICATION (if supported) ===");
  console.log(`npx hardhat verify --network ${hre.network.name} ${usdfc_address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });