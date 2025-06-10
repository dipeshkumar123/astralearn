/**
 * Development Authentication Middleware
 * Bypasses authentication in development mode for testing
 */

import { User } from '../models/User.js';
import { config } from '../config/environment.js';

/**
 * Development authentication bypass
 * Creates or uses a test user in development mode
 */
export const devAuthenticate = async (req, res, next) => {
  // Only bypass in development mode
  if (config.server.environment !== 'development') {
    return res.status(401).json({
      error: 'Access denied',
      message: 'Authentication required',
    });
  }

  try {
    // Look for or create a test user
    let testUser = await User.findOne({ email: 'test@astralearn.dev' });
    
    if (!testUser) {
      // Create a test user for development
      testUser = new User({
        email: 'test@astralearn.dev',
        username: 'testuser',
        password: 'development123', // Will be hashed by the schema
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        learningStyle: 'visual',
        learningStyleAssessment: {
          lastAssessmentDate: new Date(),
          assessmentAnswers: [],
          scores: {
            visual: 75,
            auditory: 60,
            kinesthetic: 55,
            reading: 65
          },
          confidence: 0.8
        },
        learningPreferences: {
          preferredDifficulty: 'intermediate',
          studyTimePreference: 'afternoon',
          sessionDuration: 45,
          reminderSettings: {
            enabled: true,
            frequency: 'daily',
            time: '14:00'
          },
          contentPreferences: {
            includeVideos: true,
            includeText: true,
            includeInteractive: true,
            includeQuizzes: true
          }
        },
        profileCompleteness: 100,
        progress: 65,
        isEmailVerified: true
      });
      
      await testUser.save();
      console.log('📝 Created development test user: test@astralearn.dev');
    }

    // Attach user to request
    req.user = testUser;
    req.token = 'dev-token';
    
    next();
  } catch (error) {
    console.error('❌ Dev authentication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not authenticate development user',
    });
  }
};

/**
 * Flexible authentication that uses real auth in production
 * and dev bypass in development
 */
export const flexibleAuthenticate = async (req, res, next) => {
  // Check if we have authorization header
  const hasAuthHeader = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
  
  // If we have auth header, use real authentication
  if (hasAuthHeader) {
    const { authenticate } = await import('./auth.js');
    return authenticate(req, res, next);
  }
  
  // Otherwise, in development mode, use dev authentication
  if (config.server.environment === 'development') {
    return devAuthenticate(req, res, next);
  }
  
  // In production without auth header, deny access
  return res.status(401).json({
    error: 'Access denied',
    message: 'No token provided',
  });
};

/**
 * Flexible authorization that bypasses role checks in development
 */
export const flexibleAuthorize = (roles = []) => {
  return async (req, res, next) => {
    // In development mode, skip role checking
    if (config.server.environment === 'development') {
      return next();
    }
    
    // In production, use real authorization
    try {
      const { authorize } = await import('./auth.js');
      return authorize(roles)(req, res, next);
    } catch (error) {
      return res.status(500).json({
        error: 'Authorization error',
        message: 'Could not load authorization middleware',
      });
    }
  };
};
