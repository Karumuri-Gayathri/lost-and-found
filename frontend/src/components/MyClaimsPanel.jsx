import { useState, useEffect } from 'react';
import { claimService } from '../services/claimService';

const MyClaimsPanel = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await claimService.getMyClaims();
      setClaims(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claims');
    } finally {
      setLoading(false);
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
        <p className="text-gray-500">You haven't submitted any claims yet.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div key={claim._id} className={`rounded-lg shadow-md p-6 border-l-4 ${
          claim.status === 'pending' ? 'bg-yellow-50 border-yellow-400' :
          claim.status === 'approved' ? 'bg-green-50 border-green-400' :
          'bg-red-50 border-red-400'
        }`}>
          {/* Item Info */}
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{claim.item?.title}</h3>
                <p className="text-sm text-gray-600">Category: {claim.item?.category}</p>
                {claim.item?.location && (
                  <p className="text-sm text-gray-600">Location: {claim.item?.location}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(claim.status)}`}>
                {claim.status === 'pending' ? '⏳ Pending' :
                 claim.status === 'approved' ? '✓ Approved' :
                 '✕ Rejected'}
              </span>
            </div>
          </div>

          {/* Proof Message */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Your Proof:</p>
            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 italic">
              "{claim.proofMessage}"
            </p>
          </div>

          {/* Status Timeline */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>📅 Submitted: {new Date(claim.createdAt).toLocaleDateString()}</span>
              {claim.updatedAt && (
                <>
                  <span>•</span>
                  <span>Updated: {new Date(claim.updatedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>

          {/* Rejection Message */}
          {claim.status === 'rejected' && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
              <p className="text-sm">
                <strong>✕ Claim Rejected</strong><br/>
                The item owner rejected your claim. You can submit another claim with additional proof if you'd like to try again.
              </p>
            </div>
          )}

          {/* Approval Message */}
          {claim.status === 'approved' && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded">
              <p className="text-sm mb-3">
                <strong>✓ Great news!</strong> Your claim was approved!
              </p>
              
              {/* Owner Contact Information */}
              {claim.item?.postedBy && (
                <div className="bg-white border border-green-400 rounded p-3 mt-2">
                  <p className="text-sm font-semibold text-green-900 mb-2">📧 Contact the Owner:</p>
                  <p className="text-sm text-gray-800">
                    <strong>Name:</strong> {claim.item.postedBy.name}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>Email:</strong> <a 
                      href={`mailto:${claim.item.postedBy.email}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {claim.item.postedBy.email}
                    </a>
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Click the email to send a message and arrange pickup.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pending Message */}
          {claim.status === 'pending' && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
              <p className="text-sm">
                <strong>⏳ Waiting for Response</strong><br/>
                The item owner will review your claim and notify you soon.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyClaimsPanel;
