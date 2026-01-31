// Load environment variables from .env file
require('dotenv').config();
const express = require('express');          // Web framework
const cors = require('cors');                // Enable frontend to access API
const connectDB = require('./config/db');    // Database connection
const errorHandler = require('./middleware/errorHandler');  // Error handler

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const claimRoutes = require('./routes/claimRoutes');

connectDB();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// JSON Parser - Convert incoming JSON data to JavaScript objects
app.use(express.json());

// URL Encoded Parser - Handle form data
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

// All item routes start with /api/items
app.use('/api/items', itemRoutes);

// All notification routes start with /api/notifications
app.use('/api/notifications', notificationRoutes);

// All claim routes start with /api/claims
app.use('/api/claims', claimRoutes);

// All admin routes start with /api/admin (protected with JWT + admin role)
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send("From server");
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

// STEP 8: Start the Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;