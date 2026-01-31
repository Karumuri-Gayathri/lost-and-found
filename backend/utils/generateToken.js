const jwt = require('jsonwebtoken');
const generateToken = (id) => {
  return jwt.sign(
    { id },                                  // What information is in the token
    process.env.JWT_SECRET,                  // Secret key to sign the token (from .env)
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'  // Token expires after 7 days
    }
  );
};
module.exports = { generateToken };