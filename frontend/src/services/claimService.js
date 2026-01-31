import axios from 'axios';

const backendUrl = 'https://lost-and-found-xm9i.onrender.com'
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const claimService = {
  // Submit a claim for an item with proof message
  submitClaim: (itemId, proofMessage) =>
    axios.post(backendUrl + `/api/claims/${itemId}`, { proofMessage }, { 
      withCredentials: true, 
      headers: getAuthHeaders() 
    }),

  // Get all claims submitted by the current user
  getMyClaims: () =>
    axios.get(backendUrl + '/api/claims/my-claims', { 
      withCredentials: true, 
      headers: getAuthHeaders() 
    }),

  // Get all claims for a specific item (only item owner)
  getClaimsByItem: (itemId) =>
    axios.get(backendUrl + `/api/claims/item/${itemId}`, { 
      withCredentials: true, 
      headers: getAuthHeaders() 
    }),

  // Get details of a specific claim
  getClaimById: (claimId) =>
    axios.get(backendUrl + `/api/claims/${claimId}`, { 
      withCredentials: true, 
      headers: getAuthHeaders() 
    }),

  // Approve a claim (item owner only)
  approveClaim: (claimId) =>
    axios.put(backendUrl + `/api/claims/${claimId}/approve`, {}, { 
      withCredentials: true, 
      headers: getAuthHeaders() 
    }),

  // Reject a claim (item owner only)
  rejectClaim: (claimId, reason) =>
    axios.put(backendUrl + `/api/claims/${claimId}/reject`, { reason }, { 
      withCredentials: true, 
      headers: getAuthHeaders() 
    }),

  // Get user's posted items (items they posted that may have claims)
  getMyItems: () =>
    axios.get(backendUrl + '/api/items/user/dashboard', { 
      withCredentials: true, 
      headers: getAuthHeaders() 
    })
};
