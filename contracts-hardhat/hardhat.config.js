require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load environment variables
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    goerli: {
      url: INFURA_API_KEY
        ? `https://goerli.infura.io/v3/${INFURA_API_KEY}`
        : "",
      accounts:
        PRIVATE_KEY !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
          ? [PRIVATE_KEY]
          : [],
      chainId: 5,
    },
    sepolia: {
      url: INFURA_API_KEY
        ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
        : "",
      accounts:
        PRIVATE_KEY !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
          ? [PRIVATE_KEY]
          : [],
      chainId: 11155111,
    },
    mainnet: {
      url: INFURA_API_KEY
        ? `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
        : "",
      accounts:
        PRIVATE_KEY !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
          ? [PRIVATE_KEY]
          : [],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
