const express = require('express');
const router = express.Router();

//Import authentication and authorization middleware
const { protect } = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

const {
  // User management
  getAllUsers,
  blockUser,
  unblockUser,
  // Item management
  getAllItems,
  approveItem,
  rejectItem,
  deleteItem,
  // Statistics
  getPlatformStats
} = require('../controllers/adminController');


router.use(protect, adminMiddleware);

router.get('/users', getAllUsers);

router.put('/users/:id/block', blockUser);

router.put('/users/:id/unblock', unblockUser);

router.get('/items', getAllItems);

router.put('/items/:id/approve', approveItem);

router.put('/items/:id/reject', rejectItem);

router.delete('/items/:id', deleteItem);

router.get('/stats', getPlatformStats);

module.exports = router;
