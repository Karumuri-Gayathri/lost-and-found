
const adminMiddleware = (req, res, next) => {
  // Check if user is authenticated (req.user should be set by protect middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Please login first to access admin resources'
    });
  }

  // Check if user's role is 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admin users can access this resource.',
      userRole: req.user.role
    });
  }
  next();
};

module.exports = adminMiddleware;
