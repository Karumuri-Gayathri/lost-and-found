const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  
  // Title of the item (e.g., "Lost Black iPhone 13")
  title: {
    type: String,                          // Must be text
    required: [true, 'Please provide a title'],  // Required field
    trim: true,                            // Remove extra spaces
    maxlength: [100, 'Title cannot be more than 100 characters']  // Max 100 characters
  },
  
  // Detailed description of the item
  description: {
    type: String,                          // Must be text
    required: [true, 'Please provide a description'],  // Required field
    maxlength: [1000, 'Description cannot be more than 1000 characters']  // Max 1000 characters
  },
  
  // Category the item belongs to
  category: {
    type: String,                          // Must be text
    required: [true, 'Please provide a category'],  // Required field
    enum: [                                // Only these values are allowed
      'Electronics',
      'Books',
      'Clothing',
      'Accessories',
      'ID Cards',
      'Keys',
      'Bags',
      'Others'
    ]
  },
  
  // Where the item was lost or found
  location: {
    type: String,                          // Must be text
    required: [true, 'Please provide a location'],  // Required field
    trim: true                             // Remove extra spaces
  },
  
  // When the item was lost or found
  date: {
    type: Date,                            // Must be a date
    required: [true, 'Please provide the date when item was lost/found'],  // Required
    default: Date.now                      // Automatically set to today if not provided
  },
  
  // Is it a lost or found item?
  type: {
    type: String,                          // Must be text
    required: [true, 'Please specify if item is lost or found'],  // Required
    enum: ['lost', 'found'],               // Only 'lost' or 'found' allowed
    lowercase: true                        // Convert to lowercase automatically
  },
  
  // Status of the item: active, being claimed, or resolved
  status: {
    type: String,                          // Must be text
    enum: ['active', 'resolved'],          // active = available, resolved = claimed and closed
    default: 'active'                      // Items start as active
  },
  
  // User who claimed this item (populated when claim is approved)
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,  // This is a User ID
    ref: 'User',                           // Links to User model
    default: null                          // Null until someone claims it
  },
  
  // Picture of the item (URL/link to image)
  imageUrl: {
    type: String,                          // Must be text
    default: ''                            // Empty string if no image
  },
  
  // Who posted this item (reference to User)
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,  // This is a User ID
    ref: 'User',                           // Links to User model
    required: true                         // Every item must have a poster
  },
  
  // When this item was posted
  createdAt: {
    type: Date,                            // Must be a date
    default: Date.now                      // Automatically set to current time
  },

  // Has the admin approved this item post?
  isApproved: {
    type: Boolean,                         // Must be true or false
    default: false                         // Items start as pending approval
  }
});

module.exports = mongoose.model('Item', itemSchema);
