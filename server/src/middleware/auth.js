import { User } from '../models/User.js';
import JWTManager from '../utils/jwt.js';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (req, res, next) => {
  try {
    const jwtManager = JWTManager.getInstance();
    const token = jwtManager.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided',
      });
    }

    // Verify the token
    const decoded = jwtManager.verifyAccessToken(token);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found',
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token',
    });
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const jwtManager = JWTManager.getInstance();
    const token = jwtManager.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = jwtManager.verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const checkOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required',
      });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.role !== 'admin' && req.user._id.toString() !== resourceUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own resources',
      });
    }

    next();
  };
};

// Export aliases for compatibility
export const auth = authenticate;
