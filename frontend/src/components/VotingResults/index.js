import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const VotingResults = ({ contentId, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [contentId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/results/${contentId}`);
      
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.response?.data?.message || 'Failed to fetch voting results');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'REAL':
        return 'text-green-600 bg-green-100';
      case 'FAKE':
        return 'text-red-600 bg-red-100';
      case 'TIE':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'REAL':
        return '✅';
      case 'FAKE':
        return '❌';
      case 'TIE':
        return '⚖️';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading results...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-2">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={fetchResults}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Voting Results</h2>
            <p className="text-gray-600 mt-1">{results.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Final Verdict */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getVerdictColor(results.finalVerdict)}`}>
            <span className="mr-2 text-xl">{getVerdictIcon(results.finalVerdict)}</span>
            Content is: {results.finalVerdict}
          </div>
          {results.confidence > 0 && (
            <p className="text-gray-600 mt-2">
              Confidence: {results.confidence}%
            </p>
          )}
        </div>

        {/* Voting Method Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Quadratic Voting System</h3>
          <p className="text-blue-800 text-sm mb-2">
            This result was calculated using quadratic voting to prevent whale dominance.
          </p>
          <p className="text-blue-700 text-xs font-mono">
            Formula: {results.results?.formula || "weight = sqrt(usdValue) × confidence"}
          </p>
        </div>

        {/* Vote Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Real Votes */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-900">✅ Real Votes</h4>
              <span className="text-green-700 font-bold">
                {results.results?.breakdown?.upvotes?.percentage || 0}%
              </span>
            </div>
            <div className="space-y-1 text-sm text-green-800">
              <div>Count: {results.results?.breakdown?.upvotes?.count || 0}</div>
              <div>Weight: {results.results?.breakdown?.upvotes?.weight || 0}</div>
            </div>
          </div>

          {/* Fake Votes */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-red-900">❌ Fake Votes</h4>
              <span className="text-red-700 font-bold">
                {results.results?.breakdown?.downvotes?.percentage || 0}%
              </span>
            </div>
            <div className="space-y-1 text-sm text-red-800">
              <div>Count: {results.results?.breakdown?.downvotes?.count || 0}</div>
              <div>Weight: {results.results?.breakdown?.downvotes?.weight || 0}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Real</span>
            <span>Fake</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-l-full transition-all duration-500"
              style={{ 
                width: `${results.results?.breakdown?.upvotes?.percentage || 0}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Voting Statistics */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">📈 Voting Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Participants:</span>
              <span className="font-semibold ml-2">{results.totalParticipants}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Votes:</span>
              <span className="font-semibold ml-2">{results.totalVotes}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Weight:</span>
              <span className="font-semibold ml-2">{results.results?.totalWeight?.toFixed(2) || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold ml-2 capitalize">{results.status}</span>
            </div>
          </div>
        </div>

        {/* Voting End Time */}
        {results.votingEndTime && (
          <div className="text-center text-gray-500 text-sm mb-4">
            Voting ended: {new Date(results.votingEndTime).toLocaleString()}
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingResults;