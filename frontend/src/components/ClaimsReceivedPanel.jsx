import { useState, useEffect } from 'react';
import { claimService } from '../services/claimService';

const ClaimsReceivedPanel = ({ itemId }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingClaimId, setRejectingClaimId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (itemId) {
      fetchClaims();
    }
  }, [itemId]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await claimService.getClaimsByItem(itemId);
      setClaims(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId) => {
    if (!window.confirm('Are you sure you want to approve this claim? The claimant will be notified.')) {
      return;
    }

    setActionLoading(claimId);
    setActionError('');
    setSuccessMessage('');

    try {
      await claimService.approveClaim(claimId);
      setClaims(claims.map(c => 
        c._id === claimId ? { ...c, status: 'approved' } : c
      ));
      setSuccessMessage('✓ Claim approved successfully! Notification sent to claimant.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve claim');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (claimId) => {
    setRejectingClaimId(claimId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    setActionLoading(rejectingClaimId);
    setActionError('');
    setSuccessMessage('');

    try {
      await claimService.rejectClaim(rejectingClaimId, rejectionReason);
      setClaims(claims.map(c => 
        c._id === rejectingClaimId ? { ...c, status: 'rejected' } : c
      ));
      setShowRejectModal(false);
      setSuccessMessage('✓ Claim rejected. Notification sent to claimant.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject claim');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No claims received for this item.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 border-yellow-200',
      approved: 'bg-green-50 border-green-200',
      rejected: 'bg-red-50 border-red-200'
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {actionError}
        </div>
      )}

      {/* Claims List */}
      {claims.map((claim) => (
        <div key={claim._id} className={`rounded-lg shadow-md p-6 border ${getStatusColor(claim.status)}`}>
          {/* Claimant Info */}
          <div className="mb-4">
            <h3 className="font-bold text-lg">
              {claim.claimant?.name}
              {claim.status === 'approved' && ' ✓'}
            </h3>
            <p className="text-sm text-gray-600">
              Email: <a href={`mailto:${claim.claimant?.email}`} className="text-blue-600 hover:underline">
                {claim.claimant?.email}
              </a>
            </p>
            {claim.claimant?.phone && (
              <p className="text-sm text-gray-600">
                Phone: <a href={`tel:${claim.claimant?.phone}`} className="text-blue-600 hover:underline">
                  {claim.claimant?.phone}
                </a>
              </p>
            )}
          </div>

          {/* Proof Message */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Their Proof:</p>
            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 italic">
              "{claim.proofMessage}"
            </p>
          </div>

          {/* Timestamps */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">
              Submitted: {new Date(claim.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              claim.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
              claim.status === 'approved' ? 'bg-green-200 text-green-900' :
              'bg-red-200 text-red-900'
            }`}>
              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
            </span>
          </div>

          {/* Actions */}
          {claim.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(claim._id)}
                disabled={actionLoading === claim._id}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {actionLoading === claim._id ? 'Approving...' : '✓ Approve'}
              </button>
              <button
                onClick={() => openRejectModal(claim._id)}
                disabled={actionLoading === claim._id}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                {actionLoading === claim._id ? 'Rejecting...' : '✕ Reject'}
              </button>
            </div>
          )}

          {claim.status === 'approved' && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded">
              <p className="text-sm">
                ✓ This claim has been approved. The claimant has been notified.
              </p>
            </div>
          )}

          {claim.status === 'rejected' && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
              <p className="text-sm">✕ This claim has been rejected.</p>
            </div>
          )}
        </div>
      ))}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Claim</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this claim? The claimant will be notified.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection (optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Let the claimant know why their claim was not approved..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading === rejectingClaimId}
                className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-400 disabled:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === rejectingClaimId}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                {actionLoading === rejectingClaimId ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsReceivedPanel;
