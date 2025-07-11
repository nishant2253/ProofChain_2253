import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import useWallet from "../../hooks/useWallet";
import { getSupportedTokens, submitVote, getVoteStatus } from "../../utils/api";
import {
  generateCommitHash,
  generateRandomSalt,
  getContract,
} from "../../utils/blockchain";
import {
  parseErrorMessage,
  formatDate,
  getVotingPhase,
} from "../../utils/helpers";
import { ethers } from "ethers";

const VotingInterface = ({ content, onVoteComplete }) => {
  const { isConnected, signer, address } = useWallet();

  const [votingPhase, setVotingPhase] = useState("");
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [savedCommit, setSavedCommit] = useState(null);
  const [vote, setVote] = useState(null);
  const [confidence, setConfidence] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVote, setExistingVote] = useState(null);

  // Commit phase state
  const [commitForm, setCommitForm] = useState({
    vote: "",
    confidence: 5, // Default confidence (1-10)
    tokenType: "0", // Default token type (ETH)
    stakeAmount: "0.1", // Default stake amount (increased for contract requirements)
  });

  // Reveal phase state
  const [revealForm, setRevealForm] = useState({
    vote: "",
    confidence: 5,
    salt: "",
  });

  // Load supported tokens on mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await getSupportedTokens();
        setSupportedTokens(response);
      } catch (err) {
        console.error("Error fetching supported tokens:", err);
        setError("Failed to load supported tokens");
      }
    };

    fetchTokens();
  }, []);

  // Fetch saved commit data for the current user
  const fetchSavedCommit = useCallback(async () => {
    try {
      // Use getVoteStatus instead since getSavedCommitData is not available
      const response = await getVoteStatus(content.contentId, address);
      setSavedCommit(response);

      // Pre-fill reveal form with saved data if commit data exists
      if (response && response.commitHash) {
        setRevealForm({
          vote: response.vote ? "true" : "false",
          confidence: response.confidence || 5,
          salt: response.salt || "",
        });
      }
    } catch (err) {
      console.log("No saved commit found or error fetching commit data");
      // Not setting error state here as it's normal for a user to not have a saved commit
    }
  }, [content.contentId, address]);

  // Determine voting phase when content changes
  useEffect(() => {
    if (content) {
      const phase = getVotingPhase(content);
      setVotingPhase(phase);

      // If in reveal phase, try to load saved commit data
      if (phase === "reveal" && isConnected) {
        fetchSavedCommit();
      }
    }
  }, [content, isConnected, fetchSavedCommit]);

  // Check if user has already voted
  useEffect(() => {
    const checkExistingVote = async () => {
      if (!isConnected || !address || !content.contentId) return;

      try {
        console.log(
          "Checking vote status for content:",
          content.contentId,
          "address:",
          address
        );
        const voteStatus = await getVoteStatus(content.contentId, address);
        console.log("Vote status response:", voteStatus);

        // Check if the user has voted using the hasVoted flag
        if (voteStatus.hasVoted) {
          setExistingVote(voteStatus);
          setVote(voteStatus.vote);
          setConfidence(voteStatus.confidence);
        } else {
          // User hasn't voted yet - this is normal, not an error
          console.log(
            "User hasn't voted on this content yet:",
            voteStatus.message
          );
        }
      } catch (err) {
        console.error("Error checking vote status:", err);
        console.error("Error details:", {
          contentId: content.contentId,
          address,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        });

        // Handle different error types
        if (err.response) {
          if (err.response.status === 404) {
            // Check if it's a "content not found" error
            if (err.response.data?.message?.includes("Content not found")) {
              setError("Error: This content does not exist in the database.");
            }
          } else if (err.response.status === 401) {
            setError("You must be logged in to check your vote status.");
          } else {
            setError(
              `Error checking vote status: ${
                err.response.data?.message || "Please try again."
              }`
            );
          }
        } else {
          setError(
            "Network error. Please check your connection and try again."
          );
        }
      }
    };

    checkExistingVote();
  }, [isConnected, address, content.contentId]);

  // Handle commit form changes
  const handleCommitChange = (e) => {
    const { name, value } = e.target;
    setCommitForm({
      ...commitForm,
      [name]: value,
    });
  };

  // Handle reveal form changes
  const handleRevealChange = (e) => {
    const { name, value } = e.target;
    setRevealForm({
      ...revealForm,
      [name]: value,
    });
  };

  // Submit commit vote
  const handleCommitSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate a random salt
      const salt = generateRandomSalt();

      // Generate commit hash
      const vote = commitForm.vote === "true" ? 1 : 0;
      const confidence = parseInt(commitForm.confidence);
      const tokenType = parseInt(commitForm.tokenType);
      const stakeAmount = commitForm.stakeAmount;

      // Get selected token details to determine decimals
      const selectedToken = supportedTokens.find(
        (token) => token.tokenType === tokenType
      );
      if (!selectedToken) {
        throw new Error("Selected token not found.");
      }

      const commitHash = generateCommitHash(
        vote,
        confidence,
        salt,
        address,
        tokenType
      );

      console.log(
        "Raw REACT_APP_MERKLE_PROOF:",
        process.env.REACT_APP_MERKLE_PROOF
      );
      const merkleProof = JSON.parse(
        process.env.REACT_APP_MERKLE_PROOF || "[]"
      );

      // Convert stakeAmount to BigNumber based on token decimals
      const stakeAmountWei = ethers.utils.parseUnits(
        stakeAmount,
        selectedToken.decimals
      );

      // Show MetaMask prompt message
      setSuccess("Please confirm the transaction in MetaMask...");

      // Interact with smart contract
      const contract = getContract(signer);
      
      console.log("Attempting to submit vote with:", {
        contentId: content.contentId,
        vote,
        confidence,
        tokenType,
        stakeAmountWei: stakeAmountWei.toString(),
        merkleProof
      });

      let tx;
      if (tokenType === 1) {
        // ETH token type
        tx = await contract.submitVote(
          content.contentId,
          vote,
          confidence,
          tokenType,
          stakeAmountWei,
          merkleProof,
          { value: stakeAmountWei }
        );
      } else {
        // Other ERC-20 tokens (requires prior approval)
        // For now, we'll assume approval is handled or not needed for mock tokens
        tx = await contract.submitVote(
          content.contentId,
          vote,
          confidence,
          tokenType,
          stakeAmountWei,
          merkleProof
        );
      }

      setSuccess("Transaction submitted! Waiting for confirmation...");
      
      const receipt = await tx.wait();
      const transactionHash = receipt.transactionHash;

      // Prepare data for API (backend will store transaction hash)
      const commitData = {
        vote,
        confidence,
        tokenType,
        stakeAmount,
        merkleProof,
        transactionHash, // Send the actual transaction hash
      };

      // Submit vote to backend (simple voting, no commit)
      await submitVote(content._id, { ...commitData, type: "vote" });

      setSuccess(
        `Vote committed successfully! Transaction: ${transactionHash.substring(0, 10)}... Save your salt for the reveal phase: ${salt}`
      );

      // Notify parent component
      if (onVoteComplete) {
        onVoteComplete("commit");
      }
    } catch (err) {
      console.error("Error committing vote:", err);
      
      // Enhanced error handling for MetaMask and blockchain errors
      let errorMessage = "Failed to commit vote";
      
      if (err.code === 4001) {
        errorMessage = "Transaction rejected by user in MetaMask";
      } else if (err.code === -32603) {
        errorMessage = "Internal JSON-RPC error. Please check your wallet connection.";
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient funds for transaction. Please check your wallet balance.";
      } else if (err.message?.includes('user rejected')) {
        errorMessage = "Transaction rejected by user";
      } else if (err.message?.includes('execution reverted')) {
        errorMessage = "Transaction failed: " + (err.reason || "Smart contract execution reverted");
      } else if (err.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = parseErrorMessage(err);
      }
      
      setError(errorMessage);
      setSuccess(null); // Clear any success messages
    } finally {
      setIsLoading(false);
    }
  };

  // Submit reveal vote
  const handleRevealSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data for API
      const revealData = {
        vote: revealForm.vote === "true" ? 1 : 0,
        confidence: parseInt(revealForm.confidence),
        salt: revealForm.salt,
      };

      // Submit reveal vote
      await submitVote(content._id, { ...revealData, type: "reveal" });

      setSuccess("Vote revealed successfully!");

      // Notify parent component
      if (onVoteComplete) {
        onVoteComplete("reveal");
      }
    } catch (err) {
      console.error("Error revealing vote:", err);
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle finalization
  const handleFinalize = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await submitVote(content._id, { type: "finalize" });

      setSuccess("Voting finalized successfully!");

      // Notify parent component
      if (onVoteComplete) {
        onVoteComplete("finalize");
      }
    } catch (err) {
      console.error("Error finalizing voting:", err);
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!isConnected) {
      setError("Please connect your wallet to vote");
      return;
    }

    if (vote === null) {
      setError("Please select your vote");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create vote message
      const message = {
        contentId: content._id,
        vote,
        confidence,
        timestamp: Date.now(),
        address,
      };

      // Sign the message
      const messageHash = ethers.utils.hashMessage(JSON.stringify(message));
      const signature = await signer.signMessage(messageHash);

      // Submit vote to backend
      await submitVote(content._id, {
        ...message,
        signature,
      });

      setSuccess("Vote submitted successfully!");
      onVoteComplete?.();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Vote submission error:", err);
      setError(err.message || "Failed to submit vote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render appropriate interface based on voting phase
  const renderVotingInterface = () => {
    if (!isConnected) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Connect your wallet to participate in voting
          </p>
        </div>
      );
    }

    switch (votingPhase) {
      case "commit":
        return renderCommitPhase();
      case "reveal":
        return renderRevealPhase();
      case "pending":
        return renderPendingPhase();
      case "finalized":
        return renderFinalizedPhase();
      default:
        return <div>Loading voting interface...</div>;
    }
  };

  // Render commit phase interface
  const renderCommitPhase = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Commit Your Vote</h2>
        <p className="text-gray-600 mb-6">
          In this phase, you commit to a vote without revealing your choice.
          Your vote will be securely hashed and stored on the blockchain.
        </p>

        {/* Debug information for tokens */}
        <div className="bg-gray-50 p-3 mb-4 rounded text-xs">
          <p>Available tokens: {supportedTokens.length}</p>
          <ul>
            {supportedTokens.map((token) => (
              <li key={token.tokenType}>
                {token.symbol} - {token.name}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleCommitSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="vote-approve"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Vote
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  id="vote-approve"
                  type="radio"
                  name="vote"
                  value="true"
                  checked={commitForm.vote === "true"}
                  onChange={handleCommitChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  required
                />
                <span className="ml-2">Approve</span>
              </label>
              <label className="flex items-center">
                <input
                  id="vote-reject"
                  type="radio"
                  name="vote"
                  value="false"
                  checked={commitForm.vote === "false"}
                  onChange={handleCommitChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Reject</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="confidence-slider"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confidence Level (1-10)
            </label>
            <input
              id="confidence-slider"
              type="range"
              name="confidence"
              min="1"
              max="10"
              value={commitForm.confidence}
              onChange={handleCommitChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <div className="text-center mt-1">
              <span className="font-medium">{commitForm.confidence}</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="token-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Token Type
            </label>
            <select
              id="token-type"
              name="tokenType"
              value={commitForm.tokenType}
              onChange={handleCommitChange}
              className="input-field"
              required
            >
              {supportedTokens && supportedTokens.length > 0 ? (
                supportedTokens.map((token) => (
                  <option key={token.tokenType} value={token.tokenType}>
                    {token.symbol} - {token.name}
                  </option>
                ))
              ) : (
                <option value="0">Loading tokens...</option>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="stake-amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stake Amount
            </label>
            <input
              id="stake-amount"
              type="number"
              name="stakeAmount"
              value={commitForm.stakeAmount}
              onChange={handleCommitChange}
              step="0.01"
              min="0.1"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher stakes increase your voting power (quadratically)
            </p>
          </div>

          <div className="pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "Submitting..." : "Commit Vote"}
            </motion.button>
          </div>
        </form>
      </div>
    );
  };

  // Render reveal phase interface
  const renderRevealPhase = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Reveal Your Vote</h2>
        <p className="text-gray-600 mb-6">
          In this phase, you reveal your vote by providing the same vote,
          confidence level, and salt that you used during the commit phase.
        </p>

        {savedCommit ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-800">
              We found your previously committed vote. The form has been
              pre-filled with your data.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800">
              No saved commit found. Make sure you use the exact same values you
              used during the commit phase.
            </p>
          </div>
        )}

        <form onSubmit={handleRevealSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reveal-vote-approve"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Vote
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  id="reveal-vote-approve"
                  type="radio"
                  name="vote"
                  value="true"
                  checked={revealForm.vote === "true"}
                  onChange={handleRevealChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  required
                />
                <span className="ml-2">Approve</span>
              </label>
              <label className="flex items-center">
                <input
                  id="reveal-vote-reject"
                  type="radio"
                  name="vote"
                  value="false"
                  checked={revealForm.vote === "false"}
                  onChange={handleRevealChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Reject</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="reveal-confidence"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confidence Level (1-10)
            </label>
            <input
              id="reveal-confidence"
              type="range"
              name="confidence"
              min="1"
              max="10"
              value={revealForm.confidence}
              onChange={handleRevealChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1">
              <span className="font-medium">{revealForm.confidence}</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="reveal-salt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Salt
            </label>
            <input
              id="reveal-salt"
              type="text"
              name="salt"
              value={revealForm.salt}
              onChange={handleRevealChange}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This must match the salt used in the commit phase
            </p>
          </div>

          <div className="pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "Submitting..." : "Reveal Vote"}
            </motion.button>
          </div>
        </form>
      </div>
    );
  };

  // Render pending finalization phase
  const renderPendingPhase = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Voting Period Ended</h2>
        <p className="text-gray-600 mb-6">
          The voting period has ended. The results can now be finalized on the
          blockchain.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFinalize}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? "Processing..." : "Finalize Voting"}
        </motion.button>
      </div>
    );
  };

  // Render finalized phase
  const renderFinalizedPhase = () => {
    const result = content.blockchainResults || {};
    const winningOption = result.winningOption === 1 ? "Approved" : "Rejected";

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Voting Finalized</h2>
        <p className="text-gray-600 mb-2">
          This content has been {winningOption.toLowerCase()} by the community.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-700">Result:</span>
            <span className="font-medium">{winningOption}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Total Participants:</span>
            <span className="font-medium">{result.totalParticipants || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Total USD Value Staked:</span>
            <span className="font-medium">${result.totalUSDValue || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Finalized On:</span>
            <span className="font-medium">
              {formatDate(content.finalizedAt)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 text-red-700 p-4 rounded-md mb-6"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 text-green-700 p-4 rounded-md mb-6"
        >
          {success}
        </motion.div>
      )}

      {existingVote && !existingVote.canModify && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Your Vote
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">
                {existingVote.vote ? "Approved" : "Rejected"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {existingVote.confidence}/10
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Submitted: {new Date(existingVote.timestamp).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Your vote has been recorded and cannot be modified
            </p>
          </div>
        </div>
      )}

      {renderVotingInterface()}

      <div className="mt-6">
        <button
          onClick={handleVoteSubmit}
          disabled={isSubmitting || vote === null}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700"
            }
            transition-colors duration-200
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Submitting...
            </div>
          ) : existingVote ? (
            "Update Vote"
          ) : (
            "Submit Vote"
          )}
        </button>
      </div>
    </div>
  );
};

export default VotingInterface;
