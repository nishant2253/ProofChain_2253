import axios from "axios";

// Get API base URL from environment variables, default to localhost:3000
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api";

console.log("API_BASE_URL:", API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't modify Content-Type if it's FormData (browser will set it automatically)
    const isFormData = config.data instanceof FormData;
    if (isFormData && config.headers["Content-Type"]) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// User endpoints
export const loginUser = (credentials) => api.post("/users/login", credentials);
export const registerUser = (userData) => api.post("/users", userData);
export const updateUserProfile = (data) => api.put("/users/me", data);
export const getUserProfile = (address) => api.get(`/users/${address}`);
export const getMyProfile = () => api.get("/users/me");
export const getUserVotingHistory = (address) =>
  api.get(`/users/${address}/votes`);
export const getUserReputationHistory = (address) =>
  api.get(`/users/${address}/reputation-history`);
export const getMyVotingHistory = () => api.get("/users/me/votes");
export const getMyReputationHistory = () => api.get("/users/me/reputation-history");
export const verifyIdentity = (merkleProof) => 
  api.post("/users/verify", { merkleProof });

// Content endpoints
export const getContentList = (page = 1, limit = 10) =>
  api.get("/content", { params: { page, limit } });
export const getContentById = (contentId) => api.get(`/content/${contentId}`);
export const submitContent = (contentData) => {
  // Check if contentData is FormData
  const isFormData = contentData instanceof FormData;

  // When sending FormData, let the browser set the Content-Type with boundary
  // Don't set Content-Type header manually for FormData
  const config = isFormData
    ? {
        headers: {
          // Remove Content-Type header for FormData - browser will set it automatically with boundary
        },
      }
    : {
        headers: {
          "Content-Type": "application/json",
        },
      };

  return api.post("/content", contentData, config);
};
export const updateContent = (contentId, data) =>
  api.put(`/content/${contentId}`, data);
export const deleteContent = (contentId) => api.delete(`/content/${contentId}`);

// Token endpoints
export const getSupportedTokens = () => api.get("/tokens/supported");
export const getTokenBalance = (address, tokenType) =>
  api.get(`/tokens/balance/${address}`, { params: { tokenType } });
export const getTokenDistribution = () => api.get("/tokens/distribution");

// Consensus endpoints
export const getConsensusStats = () => api.get("/consensus/stats");
export const getVotingTimeline = () => api.get("/consensus/timeline");
export const submitVote = (contentId, voteData) => {
  // Extract type and create a new object without it for the actual payload
  const { type, ...payload } = voteData;

  // Use the correct endpoint based on the vote type
  if (type === "commit") {
    return api.post(`/content/${contentId}/commit`, payload);
  } else if (type === "reveal") {
    return api.post(`/content/${contentId}/reveal`, payload);
  } else if (type === "finalize") {
    return api.post(`/content/${contentId}/finalize`, payload);
  } else {
    // Default fallback to the old endpoint (should not be hit if type is always provided)
    return api.post(`/consensus/${contentId}/vote`, payload);
  }
};
export const getVoteStatus = (contentId, address) =>
  api.get(`/content/${contentId}/commit`, { params: { address } });

// IPFS endpoints
export const uploadToIPFS = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/ipfs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const getFromIPFS = (hash) => api.get(`/ipfs/${hash}`);

// Blockchain endpoints
export const getTransactionStatus = (txHash) =>
  api.get(`/blockchain/tx/${txHash}`);
export const getGasEstimate = (txData) =>
  api.post("/blockchain/estimate-gas", txData);

// Error handler helper
export const handleApiError = (error) => {
  const message =
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred. Please try again.";
  console.error("API Error:", error);
  return { error: true, message };
};

export default api;
