import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getContentById } from "../utils/api";
import {
  formatDate,
  getVotingPhase,
  parseErrorMessage,
} from "../utils/helpers";
import VotingInterface from "../components/VotingInterface";
import VotingResults from "../components/VotingResults";

const ContentDetailPage = () => {
  const { id } = useParams();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const fetchContentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getContentById(id);
      
      // Handle both direct content and wrapped response
      const contentData = response.data || response;
      
      console.log('📊 Content fetched:', {
        id: contentData.contentId || contentData._id,
        title: contentData.title,
        status: contentData.status,
        votingEndTime: contentData.votingEndTime,
        isFinalized: contentData.isFinalized
      });
      
      setContent(contentData);
      setError(null);
    } catch (err) {
      console.error("Error fetching content details:", err);
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch content details on component mount
  useEffect(() => {
    fetchContentDetails();
  }, [fetchContentDetails]);

  // Handle vote completion (refresh data)
  const handleVoteComplete = (phase) => {
    fetchContentDetails();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-6 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
        <p>{error}</p>
        <Link
          to="/"
          className="text-primary-600 hover:underline mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Render not found state
  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Content Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The content you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  // Determine voting phase
  const votingPhase = getVotingPhase(content);
  
  // Debug voting phase detection
  console.log('🔍 Voting Phase Debug:', {
    contentId: content.contentId || content._id,
    status: content.status,
    votingEndTime: content.votingEndTime,
    isFinalized: content.isFinalized,
    detectedPhase: votingPhase,
    shouldShowResults: votingPhase === "expired" || votingPhase === "finalized"
  });

  // Format voting phase for display
  const formatVotingPhase = (phase) => {
    switch (phase) {
      case "live":
        return "Live Voting";
      case "expired":
        return "Voting Expired";
      case "finalized":
        return "Finalized";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="text-primary-600 hover:underline mb-4 inline-block"
        >
          ← Back to Content List
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          {content.title}
        </h1>

        <div className="flex items-center mt-2 space-x-4">
          <span className="text-gray-500">
            Submitted by {content.creator} on{" "}
            {formatDate(content.submissionTime)}
          </span>

          <span
            className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${votingPhase === "live" ? "bg-blue-100 text-blue-800" : ""}
            ${votingPhase === "expired" ? "bg-yellow-100 text-yellow-800" : ""}
            ${votingPhase === "finalized" ? "bg-green-100 text-green-800" : ""}
          `}
          >
            {formatVotingPhase(votingPhase)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4">Content Details</h2>

            <div className="prose max-w-none">
              <p className="text-gray-700">{content.description}</p>
            </div>

            {content.contentUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Content URL</h3>
                <a
                  href={
                    content.contentUrl.startsWith("ipfs://")
                      ? `${
                          process.env.REACT_APP_IPFS_GATEWAY
                        }${content.contentUrl.substring(7)}`
                      : content.contentUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline break-all"
                >
                  {content.contentUrl}
                </a>
              </div>
            )}

            {content.tags && content.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-2">Voting Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Voting Start:</span>
                  <span>{formatDate(content.votingStartTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Voting End:</span>
                  <span>{formatDate(content.votingEndTime || content.votingDeadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Votes:</span>
                  <span>{content.votes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Upvotes:</span>
                  <span>{content.upvotes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Downvotes:</span>
                  <span>{content.downvotes || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Blockchain results (if finalized) */}
          {votingPhase === "finalized" && content.blockchainResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4">Voting Results</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Final Result:</span>
                  <span className="font-medium">
                    {content.blockchainResults.winningOption === 1
                      ? "Approved"
                      : "Rejected"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Total Participants:</span>
                  <span>{content.blockchainResults.totalParticipants}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Total USD Value Staked:</span>
                  <span>${content.blockchainResults.totalUSDValue}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Voting interface */}
        <div className="lg:col-span-1">
          <VotingInterface
            content={content}
            onVoteComplete={handleVoteComplete}
          />
          
          {/* Results Button - Show when voting has expired */}
          {(votingPhase === "expired" || votingPhase === "finalized") && (
            <div className="mt-6">
              <button
                onClick={() => setShowResults(true)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">📊</span>
                View Voting Results
              </button>
              <p className="text-center text-gray-600 text-sm mt-2">
                Voting has ended. Click to see the final verdict based on quadratic voting.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Voting Results Modal */}
      {showResults && (
        <VotingResults
          contentId={content?.contentId || content?._id}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default ContentDetailPage;