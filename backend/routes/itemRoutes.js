const express = require('express');
const {
  createItem,
  getLostItems,
  getFoundItems,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getUserDashboard
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multer');
const { uploadMiddleware } = require('../middleware/multer');

// Create a router object for item routes
const router = express.Router();

router.get('/user/dashboard', protect, getUserDashboard);

// Get all lost items
router.get('/lost', getLostItems);

//  Get all found items
router.get('/found', getFoundItems);

//  Get all items (with optional filters: status, category)
router.get('/', getAllItems);

//  Get single item by ID
router.get('/:id', getItemById);

router.post('/', protect, uploadMiddleware('image'), createItem);

router.put('/:id', protect, uploadMiddleware('image'), updateItem);

router.delete('/:id', protect, deleteItem);

module.exports = router;