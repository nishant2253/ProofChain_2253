import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getContentList, submitVote, getVoteStatus } from "../../utils/api";
import useWallet from "../../hooks/useWallet";
import { getContract, generateCommitHash, generateRandomSalt } from "../../utils/blockchain";
import { ethers } from "ethers";

// Content Preview Component with proper error handling
const ContentPreview = ({ content }) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (content.contentType === 'image') {
    return (
      <div className="mb-3">
        {!imageError ? (
          <img
            src={`https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/${content.ipfsHash}`}
            alt={content.title}
            className="max-w-full h-48 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Image failed to load
            </p>
          </div>
        )}
      </div>
    );
  }

  if (content.contentType === 'video') {
    return (
      <div className="mb-3">
        {!videoError ? (
          <video
            controls
            className="max-w-full h-48 rounded-lg"
            onError={() => setVideoError(true)}
          >
            <source src={`https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/${content.ipfsHash}`} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Video failed to load
            </p>
          </div>
        )}
      </div>
    );
  }

  if (content.contentType === 'article') {
    return (
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
        {!iframeError ? (
          <iframe
            src={`https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/${content.ipfsHash}`}
            className="w-full h-32 border-0 rounded"
            title={content.title}
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Article preview not available
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Content type: {content.contentType}
      </p>
    </div>
  );
};

const ConsensusDashboard = () => {
  const { address, isConnected, signer } = useWallet();
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedContent, setExpandedContent] = useState(new Set());
  const [selectedContent, setSelectedContent] = useState(null);
  const [voteData, setVoteData] = useState({
    vote: '',
    confidence: 5,
    tokenType: 1, // Default to ETH
    stakeAmount: '0.01'
  });
  const [isVoting, setIsVoting] = useState(false);
  const [voteStatus, setVoteStatus] = useState(null);
  const [userVoteHistory, setUserVoteHistory] = useState(new Map()); // Track votes per content

  const voteOptions = [
    { value: 0, label: "Reject", color: "#ef4444", description: "Content is fake/inauthentic" },
    { value: 1, label: "Accept", color: "#10b981", description: "Content is authentic" },
    { value: 2, label: "Abstain", color: "#6b7280", description: "Insufficient information" }
  ];

  const tokenTypes = [
    { value: 0, label: "BTC", symbol: "BTC", disabled: true },
    { value: 1, label: "ETH", symbol: "ETH", disabled: false },
    { value: 2, label: "MATIC", symbol: "MATIC", disabled: true },
    { value: 3, label: "FIL", symbol: "FIL", disabled: true },
    { value: 4, label: "USDC", symbol: "USDC", disabled: true },
    { value: 5, label: "USDT", symbol: "USDT", disabled: true },
    { value: 6, label: "DOT", symbol: "DOT", disabled: true },
    { value: 7, label: "SOL", symbol: "SOL", disabled: true }
  ];

  const fetchContentList = async () => {
    try {
      setLoading(true);
      console.log('Fetching content list...');
      const response = await getContentList(1, 20);
      console.log('API Response:', response);
      
      const contentArray = response.results || response.content || response || [];
      console.log('Content array:', contentArray);
      
      setContentList(contentArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content list: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchContentList();
      
      // Auto-refresh every 30 seconds to get new content
      const interval = setInterval(() => {
        fetchContentList();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const toggleContentExpansion = (contentId) => {
    const newExpanded = new Set(expandedContent);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    setExpandedContent(newExpanded);
  };

  const openVotingModal = (content) => {
    setSelectedContent(content);
    // Reset voting state when opening modal
    setVoteStatus(null);
    setIsVoting(false);
  };

  const getContentStatus = (content) => {
    if (content.status) {
      switch (content.status) {
        case 'pending':
          return { phase: 'pending', label: 'Voting Pending', color: '#f59e0b' };
        case 'live':
          return { phase: 'live', label: 'Voting Live', color: '#10b981' };
        case 'expired':
          return { phase: 'expired', label: 'Voting Expired', color: '#ef4444' };
        case 'finalized':
          return { phase: 'finalized', label: 'Results Finalized', color: '#3b82f6' };
        default:
          return { phase: 'pending', label: 'Voting Pending', color: '#f59e0b' };
      }
    }

    const now = Date.now();
    const commitDeadline = new Date(content.commitDeadline).getTime();
    const revealDeadline = new Date(content.revealDeadline).getTime();

    if (now < commitDeadline) {
      return { phase: 'commit', label: 'Commit Phase', color: '#3b82f6' };
    } else if (now < revealDeadline) {
      return { phase: 'reveal', label: 'Reveal Phase', color: '#8b5cf6' };
    } else {
      return { phase: 'ended', label: 'Voting Ended', color: '#6b7280' };
    }
  };

  const formatTimeRemaining = (content) => {
    if (content.timeRemaining !== undefined) {
      const timeLeft = content.timeRemaining;
      if (timeLeft <= 0) return 'Ended';

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }
      return `${hours}h ${minutes}m`;
    }

    const now = Date.now();
    const votingStartTime = new Date(content.votingStartTime).getTime();
    const votingEndTime = new Date(content.votingEndTime).getTime();

    const status = getContentStatus(content);
    let targetTime;

    if (status.phase === 'pending') {
      targetTime = votingStartTime;
    } else if (status.phase === 'live') {
      targetTime = votingEndTime;
    } else {
      return 'Ended';
    }

    const timeLeft = targetTime - now;
    if (timeLeft <= 0) return 'Ended';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleVote = async (e) => {
    e.preventDefault();
    if (!selectedContent || !signer) return;

    // Check authentication
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found, attempting to authenticate...");
      try {
        // Try to authenticate with backend using current address
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000/api";
        const response = await fetch(`${apiUrl}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            signature: null,
            userData: {
              username: `User_${address.substring(0, 8)}`,
              email: null,
              bio: null,
              profileImageUrl: null
            },
          }),
        });
        
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          console.log("Authentication successful, token stored");
        } else {
          setVoteStatus({
            type: 'error',
            message: 'Authentication failed. Please refresh the page and reconnect your wallet.'
          });
          return;
        }
      } catch (authError) {
        console.error("Authentication error:", authError);
        setVoteStatus({
          type: 'error',
          message: 'Authentication failed. Please refresh the page and reconnect your wallet.'
        });
        return;
      }
    }

    // Check if user has already voted for this content
    const contentKey = selectedContent._id;
    const userVotes = userVoteHistory.get(contentKey) || {};
    
    if (userVotes.hasVoted) {
      setVoteStatus({
        type: 'error',
        message: 'You have already voted for this content.'
      });
      return;
    }

    setIsVoting(true);
    setVoteStatus(null);

    try {
      setVoteStatus({ type: 'info', message: 'Submitting your vote...' });

      // Submit vote directly to backend API (simplified voting)
      const voteSubmission = {
        contentId: selectedContent.contentId || selectedContent._id,
        vote: parseInt(voteData.vote),
        tokenType: parseInt(voteData.tokenType),
        stakeAmount: voteData.stakeAmount,
        confidence: parseInt(voteData.confidence)
      };

      const response = await submitVote(voteSubmission);
      console.log('Vote submission response:', response);
      
      // Update user vote history
      const updatedVotes = { ...userVotes, hasVoted: true, voteData: voteData };
      const newHistory = new Map(userVoteHistory);
      newHistory.set(contentKey, updatedVotes);
      setUserVoteHistory(newHistory);
      
      setVoteStatus({
        type: 'success',
        message: 'Vote submitted successfully! Thank you for participating.'
      });

      // Refresh content list and close modal after a short delay
      setTimeout(() => {
        setSelectedContent(null);
        setVoteStatus(null);
        fetchContentList(); // Refresh to show updated vote counts
      }, 2000);

    } catch (error) {
      console.error('Vote submission error:', error);
      let errorMessage = 'Failed to submit vote';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setVoteStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsVoting(false);
    }
  };


  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-lg shadow-md">
          <h2 className="text-2xl font-light mb-4 text-gray-900 dark:text-white">
            Connect Your Wallet
          </h2>
          <p className="text-lg font-light mb-8 text-gray-600 dark:text-gray-300">
            Please connect your MetaMask wallet to participate in blockchain-based voting
          </p>
          <div className="text-sm space-y-1 text-gray-500 dark:text-gray-400">
            <p>• Secure commit-reveal voting</p>
            <p>• Multi-token staking support</p>
            <p>• Quadratic voting mechanism</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-light text-gray-900 dark:text-white">
            Content Dashboard
          </h1>
          <button
            onClick={() => {
              console.log('Manual refresh clicked');
              fetchContentList();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
              <polyline points="23,4 23,10 17,10"></polyline>
              <polyline points="1,20 1,14 7,14"></polyline>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
            </svg>
            <span>Refresh ({loading ? 'Loading...' : 'Click to update'})</span>
          </button>
        </div>
        <p className="text-lg font-light max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Participate in the decentralized verification process by voting on content authenticity
        </p>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Auto-refreshes every 30 seconds | {contentList.length} content items available
          {error && <div className="text-red-400 mt-2">Error: {error}</div>}
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-lg shadow-md">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading content...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-800 p-8 text-center border-l-4 border-red-400 rounded-lg shadow-md">
          <p className="text-gray-900 dark:text-white">{error}</p>
        </div>
      ) : contentList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-lg shadow-md">
          <p className="text-gray-600 dark:text-gray-300">No content available for voting</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {contentList.map((content) => {
            const status = getContentStatus(content);
            const timeRemaining = formatTimeRemaining(content);
            const isExpanded = expandedContent.has(content._id);
            
            return (
              <motion.div
                key={content._id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                        {content.title}
                      </h3>
                      <button
                        onClick={() => toggleContentExpansion(content._id)}
                        className="ml-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title={isExpanded ? "Minimize" : "Maximize"}
                      >
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
                      {content.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>ID: {content.contentId || content._id}</span>
                      <span>Type: {content.contentType}</span>
                      {content.tags && content.tags.length > 0 && (
                        <span>Tags: {content.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div 
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-2"
                      style={{ 
                        backgroundColor: `${status.color}20`,
                        color: status.color,
                        border: `1px solid ${status.color}40`
                      }}
                    >
                      {status.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {timeRemaining}
                    </div>
                  </div>
                </div>

                {/* Expandable Content Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                    >
                      {/* IPFS and Content Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Content Details */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Content Details</h4>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Content ID:</span>
                              <span className="text-gray-900 dark:text-white font-mono text-sm">{content.contentId || content._id}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Content Type:</span>
                              <span className="text-gray-900 dark:text-white">{content.contentType}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                              <span className="text-gray-900 dark:text-white">{new Date(content.createdAt).toLocaleString()}</span>
                            </div>
                            
                            {content.ipfsHash && (
                              <>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">IPFS Hash:</span>
                                  <span className="text-gray-900 dark:text-white font-mono text-sm">{content.ipfsHash.substring(0, 20)}...</span>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">IPFS URL:</span>
                                  <a
                                    href={`https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/${content.ipfsHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                  >
                                    View on IPFS →
                                  </a>
                                </div>
                              </>
                            )}
                            
                            {content.submitter && (
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Submitter:</span>
                                <span className="text-gray-900 dark:text-white font-mono text-sm">{content.submitter.substring(0, 10)}...{content.submitter.substring(content.submitter.length - 8)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column - Content Preview */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Content Preview</h4>
                          
                          {content.ipfsHash ? (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <ContentPreview content={content} />
                              <div className="mt-3 flex justify-center">
                                <a
                                  href={`https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/${content.ipfsHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15,3 21,3 21,9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                  </svg>
                                  View Full Content on IPFS
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                              <p className="text-gray-500 dark:text-gray-400">No IPFS content available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Voting Buttons */}
                <div className="flex justify-end mt-4 gap-2">
                  {(() => {
                    const userVotes = userVoteHistory.get(content._id) || {};
                    const hasVoted = userVotes.hasVoted;
                    
                    if (hasVoted) {
                      return (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ Vote Submitted
                        </div>
                      );
                    }
                    
                    if (status.phase === 'live') {
                      return (
                        <button
                          onClick={() => openVotingModal(content)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Vote Now
                        </button>
                      );
                    } else if (status.phase === 'pending') {
                      return (
                        <button
                          disabled
                          className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                        >
                          Voting Not Started
                        </button>
                      );
                    } else if (status.phase === 'expired') {
                      return (
                        <button
                          disabled
                          className="bg-red-400 text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                        >
                          Voting Expired
                        </button>
                      );
                    } else {
                      return (
                        <button
                          disabled
                          className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                        >
                          Voting Ended
                        </button>
                      );
                    }
                  })()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Voting Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-8 max-w-md w-full rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
                Vote on: {selectedContent.title}
              </h3>

              {voteStatus && (
                <div className={`p-4 rounded-lg mb-4 ${
                  voteStatus.type === 'success' ? 'bg-green-100 border border-green-400' : 
                  voteStatus.type === 'info' ? 'bg-blue-100 border border-blue-400' :
                  'bg-red-100 border border-red-400'
                }`}>
                  <p className={
                    voteStatus.type === 'success' ? 'text-green-800' : 
                    voteStatus.type === 'info' ? 'text-blue-800' :
                    'text-red-800'
                  }>
                    {voteStatus.message}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Vote Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Your Vote *
                  </label>
                  <div className="space-y-2">
                    {voteOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="vote"
                          value={option.value}
                          checked={voteData.vote === option.value.toString()}
                          onChange={(e) => setVoteData(prev => ({ ...prev, vote: e.target.value }))}
                          className="mr-3"
                          required
                        />
                        <div>
                          <span style={{ color: option.color, fontWeight: '500' }}>
                            {option.label}
                          </span>
                          <span className="text-sm ml-2 text-gray-500 dark:text-gray-400">
                            - {option.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Confidence Level: {voteData.confidence}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={voteData.confidence}
                    onChange={(e) => setVoteData(prev => ({ ...prev, confidence: e.target.value }))}
                    className="w-full"
                  />
                </div>

                {/* Token Type */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Token Type
                  </label>
                  <select
                    value={voteData.tokenType}
                    onChange={(e) => setVoteData(prev => ({ ...prev, tokenType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {tokenTypes.map((token) => (
                      <option key={token.value} value={token.value} disabled={token.disabled}>
                        {token.label} ({token.symbol}) {token.disabled ? '(Coming Soon)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    Currently only ETH is supported. Other tokens coming soon.
                  </p>
                </div>

                {/* Stake Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Stake Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={voteData.stakeAmount}
                    onChange={(e) => setVoteData(prev => ({ ...prev, stakeAmount: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Simple Voting Buttons */}
                <div className="space-y-3 pt-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedContent(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVote}
                      disabled={isVoting || !signer || !voteData.vote || (userVoteHistory.get(selectedContent._id)?.hasVoted)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        userVoteHistory.get(selectedContent._id)?.hasVoted
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white'
                      }`}
                    >
                      {isVoting ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting Vote...
                        </span>
                      ) : userVoteHistory.get(selectedContent._id)?.hasVoted ? (
                        '✓ Vote Submitted'
                      ) : !signer ? (
                        'Wallet Not Connected'
                      ) : !voteData.vote ? (
                        'Select Your Vote'
                      ) : (
                        'Submit Vote'
                      )}
                    </button>
                  </div>

                  {/* Voting Process Instructions */}
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium mb-1">Simple Voting Process:</p>
                    <p>Select your vote and click "Submit Vote" to participate in the consensus process.</p>
                    <p>Your vote will be recorded immediately and cannot be changed.</p>
                    {!signer && (
                      <p className="text-red-500 mt-2">⚠️ Please ensure your wallet is connected</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsensusDashboard;
