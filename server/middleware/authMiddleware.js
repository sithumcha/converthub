const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Read token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    next();
  } catch (err) {
    console.error('❌ Auth Error:', err.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

module.exports = { protect };
