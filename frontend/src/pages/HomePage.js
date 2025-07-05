import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getContentList } from "../utils/api";
import {
  formatDate,
  getTimeRemaining,
  formatTimeRemaining,
  getVotingPhase,
} from "../utils/helpers";
import useWallet from "../hooks/useWallet";
import BlockchainVisualization from "../components/BlockchainVisualization";

const HomePage = () => {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showHero, setShowHero] = useState(true);
  const { isConnected } = useWallet();

  const fetchContentItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getContentList(page, 10);

      // Check if response exists
      if (!response) {
        console.error("No response received from server");
        setError("Failed to connect to server");
        setContentItems([]);
        return;
      }

      // Handle API response format with results and pagination
      if (response.results && Array.isArray(response.results)) {
        // Use the results array from the response
        if (response.results.length === 0) {
          setHasMore(false);
        } else {
          setContentItems((prev) =>
            page === 1 ? response.results : [...prev, ...response.results]
          );
        }

        // Check pagination info if available
        if (response.pagination) {
          setHasMore(response.pagination.hasNextPage);
        }
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct data array format
        if (response.data.length === 0) {
          setHasMore(false);
        } else {
          setContentItems((prev) =>
            page === 1 ? response.data : [...prev, ...response.data]
          );
        }
      } else {
        console.error("Invalid response format:", response);
        setError("Received invalid data format from server");
        setContentItems([]);
        return;
      }

      setError(null);
    } catch (err) {
      setError("Failed to load content items");
      console.error(err);
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch content items on component mount
  useEffect(() => {
    fetchContentItems();
  }, [fetchContentItems]);

  // Set up timer to update countdown
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render to update countdowns
      setContentItems([...contentItems]);
    }, 1000);

    return () => clearInterval(timer);
  }, [contentItems]);

  // Auto-hide hero after a delay or when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowHero(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Render badge based on voting phase
  const renderPhaseBadge = (content) => {
    const phase = getVotingPhase(content);

    const badgeClasses = {
      commit: "bg-blue-100 text-blue-800",
      reveal: "bg-purple-100 text-purple-800",
      finalized: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
    };

    const phaseLabels = {
      commit: "Commit Phase",
      reveal: "Reveal Phase",
      finalized: "Finalized",
      pending: "Pending Finalization",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClasses[phase]}`}
      >
        {phaseLabels[phase]}
      </span>
    );
  };

  // Render countdown timer
  const renderCountdown = (content) => {
    const phase = getVotingPhase(content);

    if (phase === "finalized") {
      return (
        <span className="text-sm" style={{ color: "var(--text-sub)" }}>
          Voting completed
        </span>
      );
    }

    const deadline =
      phase === "commit"
        ? content.commitDeadline
        : phase === "reveal"
        ? content.revealDeadline
        : null;

    if (!deadline) return null;

    const timeRemaining = getTimeRemaining(deadline);
    const formattedTime = formatTimeRemaining(timeRemaining);

    return (
      <span className="text-sm" style={{ color: "var(--text-sub)" }}>
        {phase === "commit" ? "Commit ends in: " : "Reveal ends in: "}
        <span className="font-medium">{formattedTime}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      {showHero && (
        <section
          className="w-full flex hero-section items-center gap-10 sm:gap-16 z-10"
          style={{ minHeight: "66vh" }}
        >
          {/* Left: Text */}
          <div
            className="flex-1 hero-left flex flex-col items-start justify-center fade-in-blur"
            style={{ animationDelay: "0.2s", minWidth: 0 }}
          >
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-thin tracking-tight mb-5"
              style={{
                color: "var(--text-main)",
                fontWeight: 300,
                letterSpacing: "-0.045em",
                lineHeight: 1.14,
              }}
            >
              Decentralized
              <br />
              <span
                style={{
                  color: "var(--accent-blue)",
                  fontWeight: 300,
                  letterSpacing: "-0.045em",
                }}
              >
                Content Verification
              </span>
            </h1>
            <p
              className="text-lg md:text-xl font-thin mb-9"
              style={{
                fontWeight: 300,
                maxWidth: "520px",
                color: "var(--text-sub)",
              }}
            >
              Ensure authenticity, prevent fraud, and build trust through
              blockchain-powered content verification.
            </p>
            <div className="flex gap-4">
              {isConnected ? (
                <Link to="/submit">
                  <button className="btn-primary fade-in" style={{ animationDelay: "0.36s" }}>
                    Submit Content
                  </button>
                </Link>
              ) : (
                <button className="btn-primary fade-in" style={{ animationDelay: "0.36s" }}>
                  Connect Wallet
                </button>
              )}
              <a href="/docs" className="btn-secondary fade-in" style={{ animationDelay: "0.43s" }}>
                Learn More
              </a>
            </div>
          </div>
          
          {/* Right: Blockchain Visual */}
          <div
            className="flex-1 hero-right flex items-center justify-center fade-in-blur hide-scrollbar"
            style={{ animationDelay: "0.28s", minWidth: 0, width: "100%" }}
          >
            <BlockchainVisualization />
          </div>
        </section>
      )}

      {/* Content Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 
            className="text-3xl font-bold" 
            style={{ color: "var(--text-main)" }}
          >
            Content Verification
          </h2>
          {isConnected && (
            <Link to="/submit">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Submit New Content
              </motion.button>
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        )}

        {contentItems.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: "var(--text-sub)" }}>
              No content items available
            </p>
            {isConnected && (
              <Link
                to="/submit"
                className="hover:underline mt-2 inline-block"
                style={{ color: "var(--accent-blue)" }}
              >
                Submit the first content item
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {contentItems.map((content) => (
              <motion.div
                key={content._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: "var(--text-main)" }}>
                      <Link
                        to={`/content/${content._id}`}
                        className="hover:text-primary-600"
                        style={{ color: "var(--text-main)" }}
                      >
                        {content.title}
                      </Link>
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "var(--text-sub)" }}>
                      Submitted by{" "}
                      {content.creator
                        ? content.creator.substring(0, 8) + "..."
                        : "Unknown"}{" "}
                      on {formatDate(content.submissionTime || content.createdAt)}
                    </p>
                  </div>
                  {renderPhaseBadge(content)}
                </div>

                <p className="mt-4 line-clamp-2" style={{ color: "var(--text-main)" }}>
                  {content.description}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  {renderCountdown(content)}

                  <Link
                    to={`/content/${content._id}`}
                    className="font-medium hover:underline"
                    style={{ color: "var(--accent-blue)" }}
                  >
                    View Details →
                  </Link>
                </div>
              </motion.div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? "Loading..." : "Load More"}
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
