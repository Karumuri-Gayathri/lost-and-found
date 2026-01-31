// Import libraries
const mongoose = require('mongoose');  // Database library
const bcrypt = require('bcrypt');      // Password encryption library

const userSchema = new mongoose.Schema({
  name: {
    type: String,                           // Must be text
    required: [true, 'Please provide a name'],  // Name is required
    trim: true,                             // Remove extra spaces
    maxlength: [50, 'Name cannot be more than 50 characters']  // Max 50 characters
  },
  
  // User's email address
  email: {
    type: String,                           // Must be text
    required: [true, 'Please provide an email'],  // Email is required
    unique: true,                           // No two users can have same email
    lowercase: true,                        // Convert to lowercase
    trim: true,                             // Remove extra spaces
    // Check if email format is valid (like: user@example.com)
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  // User's password (encrypted/hashed)
  password: {
    type: String,                           // Must be text
    required: [true, 'Please provide a password'],  // Password is required
    minlength: [6, 'Password must be at least 6 characters'],  // Minimum 6 characters
    select: false                           // Don't show password when fetching users
  },
  
  // User's role (what permissions they have)
  role: {
    type: String,                           // Must be text
    enum: ['user', 'admin'],                // Only 'user' or 'admin' allowed
    default: 'user'                         // New users are 'user' by default
  },
  
  // When the user was created
  createdAt: {
    type: Date,                             // Must be a date
    default: Date.now                       // Automatically set to current time
  },

  // Is the user blocked by admin?
  isBlocked: {
    type: Boolean,                          // Must be true or false
    default: false                          // By default, users are not blocked
  }
});
userSchema.pre('save', async function()
{
  if (!this.isModified('password')) {
    return ;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(enteredPassword) {

  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
