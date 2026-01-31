const express = require('express');
const router = express.Router();
const {
  submitClaim,
  getClaimsByItem,
  approveClaim,
  rejectClaim,
  getMyClaims,
  getClaimById
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

// Submit a claim for a found item
router.post('/:itemId', protect, submitClaim);

// Get all claims submitted by the logged-in user
router.get('/my-claims', protect, getMyClaims);

// Get details of a specific claim (claimant or item owner only)
router.get('/:claimId', protect, getClaimById);


//---------ITEM OWNER ROUTES------------
router.get('/item/:itemId', protect, getClaimsByItem);

//Approve a claim (only item owner)
router.put('/:claimId/approve', protect, approveClaim);

router.put('/:claimId/reject', protect, rejectClaim);

module.exports = router;
