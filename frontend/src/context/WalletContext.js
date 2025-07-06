import React, { createContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Get connected accounts
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            setProvider(provider);
            setSigner(signer);
            setAddress(address);
            setChainId(network.chainId);
            setIsConnected(true);

            // Check if we have a token in localStorage
            const token = localStorage.getItem("authToken");
            if (!token) {
              // If no token, authenticate with the backend
              await authenticateWithBackend(address);
            }
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
          setError(error.message);
        }
      }
    };

    checkConnection();
  }, []);

  const authenticateWithBackend = async (address) => {
    try {
      console.log("Authenticating with backend for address:", address);

      // Get API URL from environment variables
      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:3000/api";

      // Call the backend to register/login the user
      const response = await axios.post(`${apiUrl}/users`, {
        address,
        signature: null, // In a real implementation, you would sign a message
        userData: {
          username: `User_${address.substring(0, 8)}`,
          email: null,
          bio: null,
          profileImageUrl: null
        },
      });

      console.log("Authentication response:", response.data);

      // Store the JWT token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        console.log("JWT token stored in localStorage");
        
        // Verify token is stored
        const storedToken = localStorage.getItem("authToken");
        console.log("Stored token:", storedToken ? "Token exists" : "No token stored");
      } else {
        console.error("No token received from backend");
      }
    } catch (error) {
      console.error("Error authenticating with backend:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  };

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect();
    } else {
      // Account changed, update state
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);

      // Re-authenticate with the backend when account changes
      await authenticateWithBackend(address);
    }
  }, []);

  const handleChainChanged = (chainIdHex) => {
    // Chain changed, reload the page as recommended by MetaMask
    window.location.reload();
  };

  // Listen for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [handleAccountsChanged]);

  const connect = async () => {
    console.log("WalletContext: connect function called");

    if (!window.ethereum) {
      console.error("WalletContext: No Ethereum wallet found. Please install MetaMask.");
      setError("No Ethereum wallet found. Please install MetaMask.");
      return false;
    }

    try {
      console.log("WalletContext: Requesting accounts via eth_requestAccounts...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("WalletContext: Accounts received:", accounts);
      if (accounts.length === 0) {
        console.log("WalletContext: No accounts connected.");
        setError("No accounts connected. Please connect an account in MetaMask.");
        return false;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      console.log("WalletContext: Connected to network:", network);
      console.log("WalletContext: Connected with address:", address);

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setChainId(network.chainId);
      setIsConnected(true);
      setError(null);

      console.log("WalletContext: Authenticating with backend after successful connection.");
      await authenticateWithBackend(address);

      return true;
    } catch (error) {
      console.error("WalletContext: Error connecting to wallet:", error);
      setError(error.message);
      return false;
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress("");
    setChainId(null);
    setIsConnected(false);

    // Clear the auth token
    localStorage.removeItem("authToken");
  };

  const switchChain = async (targetChainId) => {
    if (!window.ethereum) {
      setError("No Ethereum wallet found. Please install MetaMask.");
      return false;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexValue(targetChainId) }],
      });
      return true;
    } catch (error) {
      console.error("Error switching chain:", error);

      // Handle different error types
      if (error.code === 4902) {
        // Chain not added to MetaMask
        try {
          // Add the chain to MetaMask
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ethers.utils.hexValue(targetChainId),
                chainName: getChainName(targetChainId),
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [getRpcUrl(targetChainId)],
                blockExplorerUrls: [getBlockExplorerUrl(targetChainId)],
              },
            ],
          });
          return true;
        } catch (addError) {
          setError(
            `Error adding chain: ${addError.message || "Unknown error"}`
          );
          return false;
        }
      } else {
        // Other errors
        setError(`Error switching chain: ${error.message || "Unknown error"}`);
        return false;
      }
    }
  };

  // Helper functions for chain switching
  const getChainName = (chainId) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 5:
        return "Goerli Testnet";
      case 11155111:
        return "Sepolia Testnet";
      case 31337:
        return "Hardhat Local";
      case 1337:
        return "Hardhat Local";
      default:
        return "Unknown Network";
    }
  };

  const getRpcUrl = (chainId) => {
    switch (chainId) {
      case 1:
        return "https://mainnet.infura.io/v3/your-infura-id";
      case 5:
        return "https://goerli.infura.io/v3/your-infura-id";
      case 11155111:
        return "https://sepolia.infura.io/v3/your-infura-id";
      case 31337:
        return "http://localhost:8545";
      case 1337:
        return "http://localhost:8545";
      default:
        return "";
    }
  };

  const getBlockExplorerUrl = (chainId) => {
    switch (chainId) {
      case 1:
        return "https://etherscan.io";
      case 5:
        return "https://goerli.etherscan.io";
      case 11155111:
        return "https://sepolia.etherscan.io";
      default:
        return "";
    }
  };

  const value = {
    provider,
    signer,
    address,
    chainId,
    isConnected,
    error,
    connect,
    disconnect,
    switchChain,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
