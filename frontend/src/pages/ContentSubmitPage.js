import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { submitContent } from "../utils/api";
import useWallet from "../hooks/useWallet";

const ContentSubmitPage = () => {
  const { address, isConnected } = useWallet();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    file: null,
    votingStartDate: "",
    votingStartTime: "",
    votingEndDate: "",
    votingEndTime: ""
  });

  // Helper function to set default voting period (24 hours from now)
  const setDefaultVotingPeriod = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours after start
    
    setFormData(prev => ({
      ...prev,
      votingStartDate: startTime.toISOString().split('T')[0],
      votingStartTime: startTime.toTimeString().slice(0, 5),
      votingEndDate: endTime.toISOString().split('T')[0],
      votingEndTime: endTime.toTimeString().slice(0, 5)
    }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { label: "News & Articles", value: "article" },
    { label: "Research Papers", value: "article" }, 
    { label: "Images & Photos", value: "image" },
    { label: "Videos", value: "video" },
    { label: "Documents", value: "other" },
    { label: "Social Media Posts", value: "other" },
    { label: "Other", value: "other" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setSubmitStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    // Validate voting period
    if (!formData.votingStartDate || !formData.votingStartTime || !formData.votingEndDate || !formData.votingEndTime) {
      setSubmitStatus({
        type: "error",
        message: "Please set both voting start and end date/time"
      });
      return;
    }

    const votingStart = new Date(`${formData.votingStartDate}T${formData.votingStartTime}`);
    const votingEnd = new Date(`${formData.votingEndDate}T${formData.votingEndTime}`);
    const now = new Date();

    if (votingStart <= now) {
      setSubmitStatus({
        type: "error",
        message: "Voting start time must be in the future"
      });
      return;
    }

    if (votingEnd <= votingStart) {
      setSubmitStatus({
        type: "error",
        message: "Voting end time must be after start time"
      });
      return;
    }

    // Check minimum voting duration (1 hour)
    const durationMs = votingEnd - votingStart;
    const durationHours = durationMs / (1000 * 60 * 60);
    const minDurationHours = 1;
    const maxDurationDays = 7;
    
    if (durationHours < minDurationHours) {
      setSubmitStatus({
        type: "error",
        message: `Voting period must be at least ${minDurationHours} hour(s). Current duration: ${durationHours.toFixed(1)} hours.`
      });
      return;
    }
    
    if (durationHours > (maxDurationDays * 24)) {
      setSubmitStatus({
        type: "error",
        message: `Voting period must be at most ${maxDurationDays} days. Current duration: ${(durationHours / 24).toFixed(1)} days.`
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('contentType', formData.category);
      submitData.append('tags', formData.tags);
      submitData.append('votingStartTime', votingStart.getTime());
      submitData.append('votingEndTime', votingEnd.getTime());
      
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      console.log('Submitting content with data:', {
        title: formData.title,
        description: formData.description,
        contentType: formData.category,
        tags: formData.tags,
        votingStartTime: votingStart.getTime(),
        votingEndTime: votingEnd.getTime(),
        hasFile: !!formData.file
      });

      const response = await submitContent(submitData);
      
      // Create IPFS URL if available
      const ipfsUrl = response.ipfsHash 
        ? `https://amaranth-genetic-bear-101.mypinata.cloud/ipfs/${response.ipfsHash}`
        : null;
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Content submitted successfully! Voting will be available during the specified period.',
        data: response,
        ipfsUrl: ipfsUrl
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        file: null,
        votingStartDate: "",
        votingStartTime: "",
        votingEndDate: "",
        votingEndTime: ""
      });
      
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Failed to submit content. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="glass p-12 text-center">
          <div className="mb-6">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4"
            >
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h9l4 4 4-4z"></path>
            </svg>
          </div>
          <h2 
            className="text-2xl font-light mb-4"
            style={{ color: 'var(--text-main)', fontWeight: '300' }}
          >
            Wallet Connection Required
          </h2>
          <p 
            className="text-lg font-light mb-8"
            style={{ color: 'var(--text-sub)', fontWeight: '300' }}
          >
            Please connect your wallet to submit content for verification
          </p>
          <button 
            className="btn-primary"
            onClick={() => {
              document.querySelector('.wallet-connect-button')?.click();
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 
          className="text-4xl font-light mb-4"
          style={{ 
            color: 'var(--text-main)', 
            fontWeight: '300',
            letterSpacing: '-0.02em'
          }}
        >
          Submit Content for Verification
        </h1>
        <p 
          className="text-lg font-light max-w-2xl mx-auto"
          style={{ color: 'var(--text-sub)', fontWeight: '300' }}
        >
          Upload your content to the decentralized verification system. The community will vote on its authenticity.
        </p>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {submitStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`glass p-6 mb-8 border-l-4 ${
              submitStatus.type === 'success' 
                ? 'border-green-400' 
                : 'border-red-400'
            }`}
          >
            <div>
              <div className="flex items-center mb-3">
                <div className="mr-3">
                  {submitStatus.type === 'success' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  )}
                </div>
                <p style={{ color: 'var(--text-main)', margin: 0 }}>
                  {submitStatus.message}
                </p>
              </div>
              
              {submitStatus.type === 'success' && submitStatus.data && (
                <div className="mt-4 space-y-2">
                  {submitStatus.data.contentId && (
                    <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: 0 }}>
                      <strong>Content ID:</strong> {submitStatus.data.contentId}
                    </p>
                  )}
                  {submitStatus.ipfsUrl && (
                    <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', margin: 0 }}>
                      <strong>IPFS URL:</strong> 
                      <a 
                        href={submitStatus.ipfsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-blue)', marginLeft: '0.5rem', textDecoration: 'underline' }}
                      >
                        View on IPFS
                      </a>
                    </p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <Link to="/dashboard">
                      <button className="btn-secondary text-sm">
                        View Dashboard
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <div className="glass p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-main)' }}
            >
              Content Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter a descriptive title for your content"
            />
          </div>

          {/* Description */}
          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-main)' }}
            >
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="input-field resize-none"
              placeholder="Provide a detailed description of the content and why it needs verification"
            />
          </div>

          {/* Category and Tags Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-main)' }}
              >
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="input-field"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-main)' }}
              >
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., news, politics, technology (comma-separated)"
              />
            </div>
          </div>

          {/* Voting Period Section */}
          <div className="space-y-6">
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--text-main)' }}
              >
                Voting Period *
              </h3>
              <div className="flex items-center justify-between mb-6">
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-sub)' }}
                >
                  Set the start and end time for when users can vote on this content
                </p>
                <button
                  type="button"
                  onClick={setDefaultVotingPeriod}
                  className="text-sm px-3 py-1 rounded border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                >
                  Set Default (24h)
                </button>
              </div>
            </div>

            {/* Voting Start Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--text-main)' }}
                >
                  Voting Start Date *
                </label>
                <input
                  type="date"
                  name="votingStartDate"
                  value={formData.votingStartDate}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--text-main)' }}
                >
                  Voting Start Time *
                </label>
                <input
                  type="time"
                  name="votingStartTime"
                  value={formData.votingStartTime}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            {/* Voting End Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--text-main)' }}
                >
                  Voting End Date *
                </label>
                <input
                  type="date"
                  name="votingEndDate"
                  value={formData.votingEndDate}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  min={formData.votingStartDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--text-main)' }}
                >
                  Voting End Time *
                </label>
                <input
                  type="time"
                  name="votingEndTime"
                  value={formData.votingEndTime}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            {/* Voting Period Preview */}
            {formData.votingStartDate && formData.votingStartTime && formData.votingEndDate && formData.votingEndTime && (
              <div className="glass p-4 border-l-4 border-blue-400">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Voting Period Preview
                </h4>
                <div className="space-y-1 text-sm" style={{ color: 'var(--text-sub)' }}>
                  <p>
                    <strong>Start:</strong> {new Date(`${formData.votingStartDate}T${formData.votingStartTime}`).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong> {new Date(`${formData.votingEndDate}T${formData.votingEndTime}`).toLocaleString()}
                  </p>
                  <p>
                    <strong>Duration:</strong> {
                      Math.round((new Date(`${formData.votingEndDate}T${formData.votingEndTime}`) - new Date(`${formData.votingStartDate}T${formData.votingStartTime}`)) / (1000 * 60 * 60 * 24))
                    } days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-main)' }}
            >
              Upload File (Optional)
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ 
                borderColor: dragActive ? 'var(--accent-blue)' : 'var(--divider)',
                background: dragActive ? 'rgba(91, 226, 255, 0.1)' : 'transparent'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />
              
              {formData.file ? (
                <div className="space-y-2">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                  </svg>
                  <p style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                    {formData.file.name}
                  </p>
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
                    {formatFileSize(formData.file.size)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <p style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                    Drop your file here, or click to browse
                  </p>
                  <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
                    Supports images, videos, documents (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17,8 12,3 7,8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Submit for Verification</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="glass p-6">
          <h3 
            className="text-lg font-medium mb-3"
            style={{ color: 'var(--text-main)', fontWeight: '400' }}
          >
            How It Works
          </h3>
          <ul className="space-y-2" style={{ color: 'var(--text-sub)' }}>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">1.</span>
              Submit your content with detailed information
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">2.</span>
              Community members stake tokens to vote
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">3.</span>
              Two-phase voting ensures fair consensus
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">4.</span>
              Results are recorded on blockchain
            </li>
          </ul>
        </div>

        <div className="glass p-6">
          <h3 
            className="text-lg font-medium mb-3"
            style={{ color: 'var(--text-main)', fontWeight: '400' }}
          >
            Submission Guidelines
          </h3>
          <ul className="space-y-2" style={{ color: 'var(--text-sub)' }}>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">-</span>
              Provide clear, descriptive titles
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">-</span>
              Include relevant context and sources
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">-</span>
              Choose appropriate categories
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">-</span>
              Respect copyright and privacy laws
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContentSubmitPage;