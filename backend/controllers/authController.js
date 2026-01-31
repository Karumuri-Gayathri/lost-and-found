const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

const register = async (req, res,next) => {
  try {
    // Get data from the request body (name, email, password from signup form)
    const { name, email, password, role } = req.body;

    // STEP 1: Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // STEP 2: Check if user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // STEP 3: Create new user in database
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'  // Default role is 'user' if not specified
    });

    // STEP 4: Generate a JWT token for the user
    const token = generateToken(user._id);

    // STEP 5: Send success response with user data and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token                        // Send this token to frontend
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // STEP 1: Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    // STEP 2: Find user by email
    const user = await User.findOne({ email }).select('+password');

    // If user not found, send error (don't say "user not found" for security)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // STEP 3: Compare entered password with hashed password in database
    const isPasswordMatch = await user.comparePassword(password);

    // If passwords don't match, send error
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // STEP 4: If everything checks out, generate a new token
    const token = generateToken(user._id);
    // STEP 5: Send success response with user data and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token                        // Frontend saves this token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is set by the 'protect' middleware after verifying the token
    const user = await User.findById(req.user.id);

    // Send the user data back
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  register,
  login,
  getMe
};