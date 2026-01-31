 import { useState } from 'react';
import { claimService } from '../services/claimService';

const ClaimForm = ({ itemId, onSuccess, onCancel }) => {
  const [proofMessage, setProofMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!proofMessage.trim()) {
      setError('Please provide proof of ownership');
      return;
    }

    if (proofMessage.trim().length < 10) {
      setError('Proof must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await claimService.submitClaim(itemId, proofMessage);
      setSuccess('Claim submitted successfully! The item owner will review your proof.');
      setProofMessage('');
      
      // Call parent callback after 2 seconds
      setTimeout(() => {
        onSuccess?.(response.data.data);
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit claim';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Claim This Item</h3>
      <p className="text-gray-600 text-sm mb-4">
        Describe why you believe this is your item. Provide identifying details.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Proof Message Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proof of Ownership
          </label>
          <textarea
            value={proofMessage}
            onChange={(e) => setProofMessage(e.target.value)}
            placeholder="Example: I lost my black wallet with my ID and credit cards. The wallet has a tear on the left side..."
            rows="5"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            {proofMessage.length}/500 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 disabled:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClaimForm;
