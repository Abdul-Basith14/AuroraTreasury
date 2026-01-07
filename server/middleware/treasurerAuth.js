/**
 * Middleware to authorize treasurer-only routes
 * Must be used AFTER the auth middleware (protect)
 * 
 * Usage: 
 * router.get('/route', protect, treasurerAuth, controller);
 */
const treasurerAuth = (req, res, next) => {
  try {
    // req.user is already set by the protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }
    
    // Check if user role is treasurer
    if (req.user.role !== 'treasurer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Treasurer role required.'
      });
    }
    
    // User is authenticated and is a treasurer
    next();
  } catch (error) {
    console.error('Treasurer authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization failed',
      error: error.message
    });
  }
};

export default treasurerAuth;
