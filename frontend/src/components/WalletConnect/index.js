import React, { useState } from "react";
import useWallet from "../../hooks/useWallet";
import { motion, AnimatePresence } from "framer-motion";

const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum Mainnet" },
  { id: 5, name: "Goerli Testnet" },
  { id: 11155111, name: "Sepolia Testnet" },
  { id: 31337, name: "Hardhat Local" },
  { id: 1337, name: "Hardhat Local" },
];

const WalletConnect = () => {
  const {
    isConnected,
    address,
    chainId,
    connect,
    disconnect,
    switchChain,
    error,
  } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChainSwitching, setIsChainSwitching] = useState(false);

  const handleConnect = async () => {
    console.log("Connect button clicked");
    console.log("window.ethereum exists:", !!window.ethereum);

    if (!window.ethereum) {
      alert(
        "MetaMask is not installed. Please install MetaMask to connect your wallet."
      );
      return;
    }

    await connect();
  };

  const handleChainSwitch = async (targetChainId) => {
    setIsChainSwitching(true);
    try {
      await switchChain(targetChainId);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error("Chain switch error:", err);
    } finally {
      setIsChainSwitching(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getCurrentChainName = () => {
    const chain = SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
    return chain ? chain.name : "Unsupported Network";
  };

  return (
    <div className="relative">
      {/* Connect/Disconnect Button */}
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          className="btn-primary wallet-connect-button"
        >
          Connect Wallet
        </motion.button>
      ) : (
        <div className="flex items-center space-x-2">
          {/* Network Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium
                ${
                  SUPPORTED_CHAINS.find((chain) => chain.id === chainId)
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }
              `}
            >
              {isChainSwitching ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Switching...
                </div>
              ) : (
                getCurrentChainName()
              )}
            </button>

            {/* Network Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50"
                >
                  {SUPPORTED_CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => handleChainSwitch(chain.id)}
                      className={`
                        w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                        ${
                          chainId === chain.id
                            ? "text-primary-600 dark:text-primary-400 font-medium"
                            : "text-gray-700 dark:text-gray-300"
                        }
                      `}
                    >
                      {chain.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Address Display & Disconnect */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {formatAddress(address)}
            </button>

            {/* Account Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Copy Address
                  </button>
                  <button
                    onClick={() => {
                      disconnect();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                  >
                    Disconnect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnect;
