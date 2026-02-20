import { Request, Response, NextFunction } from 'express';
import { jwtService, JWTPayload } from '@/utils/jwt.js';
import { User, IUser } from '@/models/User.js';
import { AuthenticationError, AuthorizationError } from '@/utils/errors.js';
import { logSecurity } from '@/utils/logger.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('Authorization header missing');
    }

    const token = jwtService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      throw new AuthenticationError('Invalid authorization header format');
    }

    // Verify token
    const payload: JWTPayload = jwtService.verifyAccessToken(token);
    
    // Find user
    const user = await User.findById(payload.userId).select('+refreshTokens');
    
    if (!user) {
      logSecurity('User not found for valid token', payload.userId, req.ip);
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      logSecurity('Inactive user attempted access', user.id, req.ip);
      throw new AuthenticationError('Account is inactive');
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      logSecurity('Authentication failed', undefined, req.ip, {
        error: error.message,
        url: req.originalUrl,
        method: req.method,
      });
    }
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if missing
 */
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = jwtService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next();
    }

    // Verify token
    const payload: JWTPayload = jwtService.verifyAccessToken(token);
    
    // Find user
    const user = await User.findById(payload.userId);
    
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors in optional auth
    next();
  }
};

/**
 * Authorization middleware factory
 * Checks if user has required role(s)
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      logSecurity('Authorization failed', req.user.id, req.ip, {
        requiredRoles: roles,
        userRole: req.user.role,
        url: req.originalUrl,
        method: req.method,
      });
      throw new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`);
    }

    next();
  };
};

/**
 * Resource ownership middleware
 * Checks if user owns the resource or has admin role
 */
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Get resource user ID from request params, body, or query
    const resourceUserId = req.params[resourceUserIdField] || 
                          req.body[resourceUserIdField] || 
                          req.query[resourceUserIdField];

    if (!resourceUserId) {
      throw new AuthorizationError('Resource ownership cannot be determined');
    }

    if (req.user.id !== resourceUserId) {
      logSecurity('Resource access denied', req.user.id, req.ip, {
        resourceUserId,
        url: req.originalUrl,
        method: req.method,
      });
      throw new AuthorizationError('Access denied. You can only access your own resources');
    }

    next();
  };
};

/**
 * Email verification middleware
 * Checks if user's email is verified
 */
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (!req.user.isEmailVerified) {
    throw new AuthorizationError('Email verification required');
  }

  next();
};

/**
 * Rate limiting by user ID
 */
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize user limit
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      logSecurity('User rate limit exceeded', userId, req.ip, {
        maxRequests,
        windowMs,
        url: req.originalUrl,
      });
      
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this user',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
        timestamp: new Date().toISOString(),
      });
    }

    // Increment request count
    userLimit.count++;
    next();
  };
};

/**
 * Instructor or admin authorization
 */
export const requireInstructorOrAdmin = authorize('instructor', 'admin');

/**
 * Admin only authorization
 */
export const requireAdmin = authorize('admin');

/**
 * Student authorization (any authenticated user)
 */
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }
  next();
};

/**
 * Course instructor authorization
 * Checks if user is the instructor of the course or admin
 */
export const requireCourseInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Admin can access any course
    if (req.user.role === 'admin') {
      return next();
    }

    const courseId = req.params.courseId || req.body.courseId || req.query.courseId;
    
    if (!courseId) {
      throw new AuthorizationError('Course ID required');
    }

    // Import Course model dynamically to avoid circular dependency
    const { Course } = await import('@/models/Course.js');
    const course = await Course.findById(courseId);

    if (!course) {
      throw new AuthorizationError('Course not found');
    }

    if (course.instructorId.toString() !== req.user.id) {
      logSecurity('Course access denied', req.user.id, req.ip, {
        courseId,
        instructorId: course.instructorId.toString(),
        url: req.originalUrl,
      });
      throw new AuthorizationError('Access denied. You are not the instructor of this course');
    }

    next();
  } catch (error) {
    next(error);
  }
};
