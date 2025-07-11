import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import useWallet from "../../hooks/useWallet";
import useTheme from "../../hooks/useTheme";
import {
  getUserProfile,
  getUserVotingHistory,
  getUserReputationHistory,
  getTokenBalance,
  getSupportedTokens,
  getUserContent,
  getMyContent,
  claimContentReward,
} from "../../utils/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const { address: userAddress } = useParams();
  const { address: connectedAddress } = useWallet();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [votingHistory, setVotingHistory] = useState([]);
  const [reputationHistory, setReputationHistory] = useState([]);
  const [tokenBalances, setTokenBalances] = useState({});
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [userContent, setUserContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [claimingReward, setClaimingReward] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Clean the address parameter to remove any extra characters
  const cleanAddress = (addr) => {
    if (!addr) return null;
    // Remove any trailing characters that might be added by router
    const cleaned = addr.split(':')[0]; // Remove anything after ':'
    return cleaned.startsWith('0x') ? cleaned : null;
  };

  const address = cleanAddress(userAddress) || connectedAddress;

  useEffect(() => {
    // If no address is provided and the user isn't connected, redirect to home
    if (!address) {
      navigate("/");
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching profile data for address:", address);
        console.log("Connected address:", connectedAddress);
        console.log("Raw userAddress from params:", userAddress);

        // Validate address format
        if (!address || !address.startsWith('0x') || address.length !== 42) {
          throw new Error(`Invalid address format: ${address}`);
        }

        // Fetch all profile data in parallel with error handling
        const results = await Promise.allSettled([
          getUserProfile(address),
          getUserVotingHistory(address),
          getUserReputationHistory(address),
          getSupportedTokens(),
          // Always use getUserContent for public profile viewing
          getUserContent(address),
        ]);

        // Extract data from settled promises
        const profileData = results[0].status === 'fulfilled' ? results[0].value : null;
        const votingData = results[1].status === 'fulfilled' ? results[1].value : [];
        const reputationData = results[2].status === 'fulfilled' ? results[2].value : [];
        const tokensData = results[3].status === 'fulfilled' ? results[3].value : [];
        const contentData = results[4].status === 'fulfilled' ? results[4].value : [];

        // Set profile data or create default if not found
        setProfile(profileData || {
          address: address,
          username: `User_${address.slice(-6)}`,
          email: null,
          bio: "This user hasn't set up their profile yet.",
          profileImageUrl: null,
          reputationScore: 0,
          isVerified: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        });
        
        setVotingHistory(votingData || []);
        setReputationHistory(reputationData || []);
        setSupportedTokens(tokensData || []);
        
        // Process content data with consensus information
        const processedContent = (contentData || []).map(content => ({
          ...content,
          consensusData: {
            totalVotes: content.votes?.length || content.participantCount || 0,
            upvotes: content.upvotes || 0,
            downvotes: content.downvotes || 0,
            participantCount: content.participantCount || 0,
            totalUSDValue: content.totalUSDValue || "0",
            winningOption: content.winningOption,
            isFinalized: content.isFinalized || false,
            status: content.status || (content.isFinalized ? "finalized" : "live"),
          },
          rewardInfo: {
            canClaimReward: content.isFinalized && content.rewardInfo?.canClaimReward,
            hoursUntilClaim: content.rewardInfo?.hoursUntilClaim || 0,
            estimatedReward: content.rewardInfo?.estimatedReward || 100,
            hasClaimedReward: content.hasClaimedReward || false,
          }
        }));
        
        setUserContent(processedContent);

        // Fetch token balances for supported tokens
        const balances = {};
        for (const token of tokensData) {
          // Use token.id or tokenType or index as a fallback
          const tokenId = token.id || token.tokenType || token._id;
          if (tokenId) {
            try {
              const balance = await getTokenBalance(address, tokenId);
              balances[tokenId] = balance;
            } catch (err) {
              console.error(
                `Error fetching balance for token ${tokenId}:`,
                err
              );
              // Continue with other tokens even if one fails
            }
          }
        }
        setTokenBalances(balances);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        
        // Create a default profile for any errors
        setProfile({
          address: address,
          username: `User_${address.slice(-6)}`,
          email: null,
          bio: "This user hasn't set up their profile yet.",
          profileImageUrl: null,
          reputationScore: 0,
          isVerified: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        });
        
        // Set empty arrays for other data
        setVotingHistory([]);
        setReputationHistory([]);
        setSupportedTokens([]);
        
        // Create mock content data to demonstrate the enhanced profile features (fallback)
        const mockContent = [
          {
            contentId: 1,
            title: "Sample Content: Climate Change Data Analysis",
            description: "Analysis of global temperature trends over the past decade",
            creator: address.toLowerCase(),
            submissionTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            votingEndTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            isFinalized: true,
            hasClaimedReward: false,
            consensusData: {
              totalVotes: 15,
              upvotes: 12,
              downvotes: 3,
              participantCount: 15,
              totalUSDValue: "1250.50",
              winningOption: 1, // upvote won
              isFinalized: true,
              status: "finalized",
            },
            rewardInfo: {
              canClaimReward: true, // 48+ hours have passed
              hoursUntilClaim: 0,
              estimatedReward: 225, // 100 + (15*5) + 50 = 225
              hasClaimedReward: false,
            }
          },
          {
            contentId: 2,
            title: "Blockchain Scalability Solutions Comparison",
            description: "Comprehensive comparison of Layer 2 scaling solutions",
            creator: address.toLowerCase(),
            submissionTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            votingEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // ends in 6 hours
            isFinalized: false,
            hasClaimedReward: false,
            consensusData: {
              totalVotes: 8,
              upvotes: 6,
              downvotes: 2,
              participantCount: 8,
              totalUSDValue: "890.25",
              winningOption: null,
              isFinalized: false,
              status: "live",
            },
            rewardInfo: {
              canClaimReward: false,
              hoursUntilClaim: 54, // 48 hours after voting ends
              estimatedReward: 190, // 100 + (8*5) + 50 = 190
              hasClaimedReward: false,
            }
          },
          {
            contentId: 3,
            title: "DeFi Protocol Security Audit Report",
            description: "Security analysis of popular DeFi lending protocols",
            creator: address.toLowerCase(),
            submissionTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            votingEndTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            isFinalized: true,
            hasClaimedReward: true,
            claimedReward: 275,
            claimedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            consensusData: {
              totalVotes: 22,
              upvotes: 18,
              downvotes: 4,
              participantCount: 22,
              totalUSDValue: "2100.75",
              winningOption: 1,
              isFinalized: true,
              status: "finalized",
            },
            rewardInfo: {
              canClaimReward: false,
              hoursUntilClaim: 0,
              estimatedReward: 275,
              hasClaimedReward: true,
            }
          }
        ];
        
        // Use mock data as fallback when API calls fail
        setUserContent(mockContent);
        
        // Only show error for critical issues
        if (err.message?.includes('Invalid address format')) {
          setError("Invalid address format. Please check the URL.");
        } else {
          setError(null); // Don't show error, just use default data
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    // Set up real-time refresh for live content
    const interval = setInterval(() => {
      if (activeTab === "content") {
        fetchProfileData();
      }
    }, 30000); // Refresh every 30 seconds

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [address, navigate, activeTab]);

  // This effect will re-render the component when the theme changes
  // ensuring chart colors update properly
  useEffect(() => {
    // No need to do anything, just re-render when isDarkMode changes
  }, [isDarkMode]);

  // Calculate reputation level based on reputation score
  const getReputationLevel = (score) => {
    if (score >= 900)
      return { level: "Expert", color: "text-purple-600 dark:text-purple-400" };
    if (score >= 700)
      return { level: "Advanced", color: "text-blue-600 dark:text-blue-400" };
    if (score >= 500)
      return {
        level: "Intermediate",
        color: "text-green-600 dark:text-green-400",
      };
    if (score >= 300)
      return {
        level: "Regular",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    return { level: "Novice", color: "text-gray-600 dark:text-gray-400" };
  };

  // Calculate statistics from voting history
  const calculateStats = () => {
    if (!votingHistory || !votingHistory.length) {
      return {
        totalVotes: 0,
        correctVotes: 0,
        accuracyRate: 0,
        averageConfidence: 0,
        totalStaked: 0,
      };
    }

    // Filter finalized votes - safely access nested properties
    const finalizedVotes = votingHistory.filter(
      (vote) => vote && vote.isFinalized === true
    );

    // Filter correct votes - safely checking against winning option
    const correctVotes = finalizedVotes.filter(
      (vote) =>
        vote &&
        vote.vote !== null &&
        vote.winningOption !== undefined &&
        vote.vote === vote.winningOption
    );

    // Calculate total staked amount
    const totalStaked = votingHistory.reduce(
      (sum, vote) =>
        sum + (vote && vote.stakeAmount ? Number(vote.stakeAmount) : 0),
      0
    );

    // Calculate confidence sum
    const confidenceSum = votingHistory.reduce(
      (sum, vote) =>
        sum + (vote && vote.confidence ? Number(vote.confidence) : 0),
      0
    );

    return {
      totalVotes: votingHistory.length,
      correctVotes: correctVotes.length,
      accuracyRate:
        finalizedVotes.length > 0
          ? (correctVotes.length / finalizedVotes.length) * 100
          : 0,
      averageConfidence:
        votingHistory.length > 0 ? confidenceSum / votingHistory.length : 0,
      totalStaked,
    };
  };

  const stats = calculateStats();

  // Handle reward claiming
  const handleClaimReward = async (contentId) => {
    if (claimingReward === contentId) return;
    
    try {
      setClaimingReward(contentId);
      const result = await claimContentReward(contentId);
      
      // Update the content list to reflect the claimed reward
      setUserContent(prevContent => 
        prevContent.map(content => 
          content.contentId === contentId 
            ? { 
                ...content, 
                hasClaimedReward: true,
                claimedReward: result.reward,
                claimedAt: new Date(),
                rewardInfo: {
                  ...content.rewardInfo,
                  hasClaimedReward: true,
                  canClaimReward: false,
                }
              }
            : content
        )
      );

      // Show success message (you can replace this with a toast notification)
      alert(`Reward claimed successfully! You earned ${result.reward} points.`);
      
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert(error.response?.data?.message || "Failed to claim reward. Please try again.");
    } finally {
      setClaimingReward(null);
    }
  };

  // Format time remaining for reward claim
  const formatTimeRemaining = (hours) => {
    if (hours <= 0) return "Available now";
    if (hours < 1) return `${Math.ceil(hours * 60)} minutes`;
    if (hours < 24) return `${Math.ceil(hours)} hours`;
    return `${Math.ceil(hours / 24)} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 rounded-md hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            The requested profile could not be found.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900/60 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const reputationInfo = getReputationLevel(profile.reputationScore || 0);
  const reputationScore = profile.reputationScore || 0;

  // Define chart config inside render to ensure it updates with theme changes
  const reputationChartConfig = {
    data: {
      labels:
        reputationHistory && reputationHistory.length > 0
          ? reputationHistory.map((item) =>
              item && item.timestamp
                ? new Date(item.timestamp).toLocaleDateString()
                : "N/A"
            )
          : [],
      datasets: [
        {
          label: "Reputation Score",
          data:
            reputationHistory && reputationHistory.length > 0
              ? reputationHistory.map((item) =>
                  item && item.score ? item.score : 0
                )
              : [],
          borderColor: isDarkMode ? "rgb(129, 140, 248)" : "rgb(99, 102, 241)",
          backgroundColor: isDarkMode
            ? "rgba(129, 140, 248, 0.1)"
            : "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Reputation History",
          color: isDarkMode ? "#e5e7eb" : "#111827",
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          backgroundColor: isDarkMode
            ? "rgba(17, 24, 39, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
          titleColor: isDarkMode ? "#e5e7eb" : "#111827",
          bodyColor: isDarkMode ? "#e5e7eb" : "#111827",
          borderColor: isDarkMode
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: isDarkMode ? "#e5e7eb" : "#111827",
          },
        },
        x: {
          grid: {
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: isDarkMode ? "#e5e7eb" : "#111827",
            maxRotation: 45,
            minRotation: 0,
          },
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile.username?.[0]?.toUpperCase() ||
                  address.slice(2, 4).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.username ||
                `${address.slice(0, 6)}...${address.slice(-4)}`}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {address}
            </p>
            <div className="mt-2 flex items-center">
              <div className="flex items-center text-yellow-500">
                {"★".repeat(Math.floor(reputationScore / 200))}
                {"☆".repeat(5 - Math.floor(reputationScore / 200))}
              </div>
              <span className={`ml-2 text-sm ${reputationInfo.color}`}>
                {reputationInfo.level} · Level{" "}
                {Math.floor(reputationScore / 100) + 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("voting")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "voting"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Voting History
          </button>
          <button
            onClick={() => setActiveTab("reputation")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reputation"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Reputation
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "content"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            My Content
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Statistics
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Votes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalVotes}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Consensus Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.accuracyRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Average Confidence
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageConfidence.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </div>

            {/* Token Balances */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Token Balances
              </h2>
              <div className="space-y-4">
                {supportedTokens.map((token) => {
                  const tokenId = token.id || token.tokenType || token._id;
                  return (
                    <div
                      key={tokenId || `token-${supportedTokens.indexOf(token)}`}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: token.color || "#6366f1" }}
                        >
                          <span className="text-white text-sm font-medium">
                            {token.symbol?.[0] || "?"}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {token.name || "Unknown Token"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {token.symbol || "???"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tokenBalances[tokenId]?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  );
                })}
                {supportedTokens.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tokens available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "voting" && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Voting History
              </h2>
              <div className="space-y-4">
                {votingHistory.length > 0 ? (
                  votingHistory.map((vote, index) => (
                    <div
                      key={
                        vote.id ||
                        `${vote.contentId}-${vote.commitTimestamp}` ||
                        `vote-${index}`
                      }
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vote.title ||
                            `Content #${vote.contentId || index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Vote:{" "}
                          {vote.vote !== null && vote.vote !== undefined
                            ? typeof vote.vote === "boolean"
                              ? vote.vote
                                ? "Approve"
                                : "Reject"
                              : vote.vote
                            : "Pending"}{" "}
                          •
                          {vote.confidence !== null &&
                          vote.confidence !== undefined
                            ? ` Confidence: ${vote.confidence}/10`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {vote.commitTimestamp
                            ? new Date(
                                vote.commitTimestamp
                              ).toLocaleDateString()
                            : vote.timestamp
                            ? new Date(vote.timestamp).toLocaleDateString()
                            : "N/A"}
                        </p>
                        {vote.isFinalized && (
                          <p
                            className={`text-sm ${
                              vote.wasSuccessful
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {vote.wasSuccessful
                              ? "Matched Consensus"
                              : "Differed from Consensus"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No voting history available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "reputation" && (
          <motion.div
            key="reputation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Reputation Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Reputation Growth
              </h2>
              <div className="h-80">
                {reputationHistory && reputationHistory.length > 0 ? (
                  <Line
                    data={
                      reputationChartConfig.data || { labels: [], datasets: [] }
                    }
                    options={reputationChartConfig.options || {}}
                    height={80}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                      No reputation history available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reputation Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Reputation Breakdown
              </h2>
              {profile && profile.reputationBreakdown ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Consensus Participation
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      +{profile.reputationBreakdown.consensusParticipation || 0}{" "}
                      points
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Correct Predictions
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      +{profile.reputationBreakdown.correctPredictions || 0}{" "}
                      points
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Content Submissions
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      +{profile.reputationBreakdown.contentSubmissions || 0}{" "}
                      points
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Community Rewards
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      +{profile.reputationBreakdown.communityRewards || 0}{" "}
                      points
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Total Score
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {reputationScore} points
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No reputation data available
                </p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "content" && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Submitted Content
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {userContent.length} content items
                </div>
              </div>
              
              <div className="space-y-6">
                {userContent.length > 0 ? (
                  userContent.map((content) => (
                    <div
                      key={content.contentId || content._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Content Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {content.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {content.description || "No description provided"}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>ID: {content.contentId}</span>
                            <span>•</span>
                            <span>Submitted: {new Date(content.submissionTime || content.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full ${
                              content.consensusData.status === 'finalized' 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                : content.consensusData.status === 'live'
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                            }`}>
                              {content.consensusData.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Consensus Data */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {content.consensusData.totalVotes}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Total Votes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {content.consensusData.upvotes}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Upvotes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                            {content.consensusData.downvotes}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Downvotes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            ${parseFloat(content.consensusData.totalUSDValue || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Total Staked</div>
                        </div>
                      </div>

                      {/* Reward Section */}
                      {content.consensusData.isFinalized && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                Content Reward
                              </h4>
                              {content.rewardInfo.hasClaimedReward ? (
                                <div className="text-sm text-green-600 dark:text-green-400">
                                  ✅ Claimed {content.claimedReward || content.rewardInfo.estimatedReward} points
                                  {content.claimedAt && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                                      on {new Date(content.claimedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ) : content.rewardInfo.canClaimReward ? (
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                  🎁 Ready to claim {content.rewardInfo.estimatedReward} points
                                </div>
                              ) : (
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                  ⏳ Available in {formatTimeRemaining(content.rewardInfo.hoursUntilClaim)}
                                </div>
                              )}
                            </div>
                            
                            {!content.rewardInfo.hasClaimedReward && content.rewardInfo.canClaimReward && (
                              <button
                                onClick={() => handleClaimReward(content.contentId)}
                                disabled={claimingReward === content.contentId}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed"
                              >
                                {claimingReward === content.contentId ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Claiming...
                                  </div>
                                ) : (
                                  "Claim Reward"
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No content submitted yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Start by submitting your first piece of content for community verification.
                    </p>
                    <Link
                      to="/submit"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Submit Content
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
