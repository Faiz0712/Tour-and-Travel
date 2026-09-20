const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tour_travel_user_jwt_secret_2026';

// Middleware to verify user token
const verifyUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }
};

// Optional user auth
const optionalUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore error for optional
    }
  }
  next();
};

module.exports = {
  JWT_SECRET,
  verifyUser,
  optionalUser
};
