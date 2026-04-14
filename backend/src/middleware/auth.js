const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Optional auth — attaches user if token present but doesn't block the request.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      req.user = null;
    }
  }
  next();
};

module.exports = { verifyToken, optionalAuth };
