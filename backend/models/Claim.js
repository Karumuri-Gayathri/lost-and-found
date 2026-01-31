const mongoose = require('mongoose');
const claimSchema = new mongoose.Schema({
  
  // Reference to the item being claimed
  item: {
    type: mongoose.Schema.Types.ObjectId,  // This is an Item ID
    ref: 'Item',                           // Links to Item model
    required: [true, 'Item ID is required']
  },

  // Reference to the user claiming the item
  claimant: {
    type: mongoose.Schema.Types.ObjectId,  // This is a User ID
    ref: 'User',                           // Links to User model
    required: [true, 'Claimant user ID is required']
  },

  // Proof message - why the user believes they own/lost this item
  // Security: This helps prevent fake claims
  proofMessage: {
    type: String,                          // Must be text
    required: [true, 'Please provide proof of ownership'],  // Required field
    minlength: [10, 'Proof message must be at least 10 characters'],
    maxlength: [500, 'Proof message cannot be more than 500 characters']  // Max 500 characters
  },

  // Status of the claim
  status: {
    type: String,                          // Must be text
    enum: ['pending', 'approved', 'rejected'],  // Claim can have these statuses
    default: 'pending'                     // Starts as pending waiting for owner review
  },
  createdAt: {
    type: Date,                            // Must be a date
    default: Date.now                      // Automatically set to current time
  },
  updatedAt: {
    type: Date,                            // Must be a date
    default: Date.now                      // Automatically set to current time
  }
});
module.exports = mongoose.model('Claim', claimSchema);