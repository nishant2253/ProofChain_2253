/**
 * Format date to a readable string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format address to a shortened form
 * @param {string} address - Ethereum address
 * @returns {string} Shortened address (e.g., 0x1234...5678)
 */
export const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

/**
 * Format amount with token symbol
 * @param {string|number} amount - Token amount
 * @param {string} tokenType - Token type
 * @returns {string} Formatted amount with token symbol
 */
export const formatAmount = (amount, tokenType) => {
  // Convert to number and handle scientific notation
  const num = parseFloat(amount);

  // Format based on size
  let formatted;
  if (num >= 1e9) {
    formatted = `${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    formatted = `${(num / 1e6).toFixed(2)}M`;
  } else if (num >= 1e3) {
    formatted = `${(num / 1e3).toFixed(2)}K`;
  } else {
    formatted = num.toFixed(4);
  }

  // Remove trailing zeros after decimal
  formatted = formatted.replace(/\.0+$/, "");
  formatted = formatted.replace(/(\.\d*?)0+$/, "$1");

  return `${formatted} ${tokenType}`;
};

/**
 * Format USD amount
 * @param {string|number} amount - USD amount
 * @returns {string} Formatted USD amount
 */
export const formatUSD = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate time remaining until a deadline
 * @param {Date|string|number} deadline - Deadline timestamp
 * @returns {Object} Object with days, hours, minutes, seconds, and isExpired flag
 */
export const getTimeRemaining = (deadline) => {
  const total = new Date(deadline) - new Date();
  const isExpired = total <= 0;

  // Return all zeros if expired
  if (isExpired) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
};

/**
 * Format time remaining as a string
 * @param {Object} timeRemaining - Time remaining object from getTimeRemaining
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (timeRemaining) => {
  if (timeRemaining.isExpired) {
    return "Expired";
  }

  const parts = [];

  if (timeRemaining.days > 0) {
    parts.push(`${timeRemaining.days}d`);
  }

  if (timeRemaining.hours > 0 || parts.length > 0) {
    parts.push(`${timeRemaining.hours}h`);
  }

  if (timeRemaining.minutes > 0 || parts.length > 0) {
    parts.push(`${timeRemaining.minutes}m`);
  }

  parts.push(`${timeRemaining.seconds}s`);

  return parts.join(" ");
};

/**
 * Determine the voting phase based on content data
 * @param {Object} content - Content item data
 * @returns {string} Voting phase ('live', 'expired', 'finalized', or 'pending')
 */
export const getVotingPhase = (content) => {
  if (!content) return "pending";

  // Check if explicitly finalized
  if (content.finalized || content.isFinalized || content.status === 'finalized') {
    return "finalized";
  }

  // Check explicit status first
  if (content.status === 'expired') {
    return "expired";
  }

  if (content.status === 'live' || content.status === 'active') {
    return "live";
  }

  // Check voting deadlines
  const now = new Date().getTime();
  
  // Try different deadline field names (supporting both old and new systems)
  const votingEndTime = content.votingEndTime || content.votingDeadline || content.revealDeadline;
  const votingStartTime = content.votingStartTime || content.commitStartTime;
  
  if (votingEndTime) {
    const endTime = new Date(votingEndTime).getTime();
    
    if (now > endTime) {
      return "expired";
    }
    
    if (votingStartTime) {
      const startTime = new Date(votingStartTime).getTime();
      if (now >= startTime && now <= endTime) {
        return "live";
      }
    } else {
      // If no start time, assume voting is live if not expired
      return "live";
    }
  }

  // Legacy commit-reveal system support
  if (content.commitDeadline && content.revealDeadline) {
    const commitDeadline = new Date(content.commitDeadline).getTime();
    const revealDeadline = new Date(content.revealDeadline).getTime();

    if (now < commitDeadline) {
      return "live"; // Map commit phase to live
    }

    if (now < revealDeadline) {
      return "live"; // Map reveal phase to live
    }

    return "expired"; // Past reveal deadline
  }

  return "pending";
};

/**
 * Check if an object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if object is empty
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Parse error message from API or blockchain error
 * @param {Error} error - Error object
 * @returns {string} Parsed error message
 */
export const parseErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  // Handle axios error
  if (error.response && error.response.data) {
    const { message, error: errorMsg, details } = error.response.data;

    if (details && Array.isArray(details) && details.length > 0) {
      return details.map((d) => d.message).join("\n");
    }
    return message || errorMsg || JSON.stringify(error.response.data);
  }


  // Handle ethers.js error
  if (error.reason) {
    return error.reason;
  }

  // Handle standard error
  return error.message || String(error);
};
