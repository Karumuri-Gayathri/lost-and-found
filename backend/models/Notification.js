
const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,  // This is a User ID
    ref: 'User',                           // Links to User model
    required: [true, 'Notification must have a user']  // Required
  },
  
  // The found item that matched with lost item
  item: {
    type: mongoose.Schema.Types.ObjectId,  // This is an Item ID
    ref: 'Item',                           // Links to Item model
    required: [true, 'Notification must have an item']  // Required
  },
  
  // Notification message
  message: {
    type: String,                          // Must be text
    required: [true, 'Notification must have a message'],  // Required
    maxlength: [500, 'Message cannot exceed 500 characters']  // Max length
  },
  
  // Has user read this notification?
  isRead: {
    type: Boolean,                         // Must be true or false
    default: false                         // Start as unread
  },
  createdAt: {
    type: Date,                            // Must be a date
    default: Date.now                      // Automatically set to current time
  }
});
module.exports = mongoose.model('Notification', notificationSchema);
