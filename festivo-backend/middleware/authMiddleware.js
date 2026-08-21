const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided, authorization denied'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded user ID and organizer status to req
    req.user = decoded.id;
    req.userRole = decoded.role || 'student';
    req.isOrganizer = decoded.isOrganizer || false;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

const requireOrganizer = (req, res, next) => {
  if (!req.isOrganizer) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizer privileges required.'
    });
  }
  next();
};

authMiddleware.authMiddleware = authMiddleware;
authMiddleware.requireOrganizer = requireOrganizer;

module.exports = authMiddleware;
