/**
 * User Routes - Phase 2 Step 1 Implementation
 * Enhanced user profile management with learning style assessment and preferences
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { UserProgress } from '../models/UserProgress.js';
import aiContextService from '../services/aiContextService.js';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile could not be retrieved',
      });
    }

    // Get enhanced context for the user
    const userContext = await aiContextService.getComprehensiveContext(user._id);

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(user);

    res.json({
      success: true,
      profile: user,
      context: userContext,
      profileCompletion,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not retrieve user profile',
    });
  }
});

// Update user profile
router.put('/profile', 
  authenticate,
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic', 'reading']),
    body('preferences').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { firstName, lastName, learningStyle, preferences } = req.body;
      
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (learningStyle !== undefined) updateData.learningStyle = learningStyle;
      if (preferences !== undefined) updateData.preferences = preferences;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -refreshTokens -emailVerificationToken -passwordResetToken -passwordResetExpires');

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile could not be updated',
        });
      }

      // Clear user context cache to ensure fresh data
      aiContextService.clearUserCache(req.user._id);

      // Get updated context
      const userContext = await aiContextService.getComprehensiveContext(user._id);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: user,
        context: userContext,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not update user profile',
      });
    }
  }
);

// Learning style assessment endpoint
router.post('/learning-style-assessment',
  authenticate,
  [
    body('responses').isArray().isLength({ min: 10, max: 50 }),
    body('responses.*.questionId').isString(),
    body('responses.*.answer').isIn(['A', 'B', 'C', 'D']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { responses } = req.body;
      
      // Analyze responses to determine learning style
      const learningStyleResult = analyzeLearningStyleResponses(responses);
      
      // Update user's learning style
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
          learningStyle: learningStyleResult.primaryStyle,
          learningStyleAssessment: {
            completedAt: new Date(),
            responses,
            scores: learningStyleResult.scores,
            confidence: learningStyleResult.confidence,
          }
        },
        { new: true }
      );

      // Clear context cache
      aiContextService.clearUserCache(req.user._id);

      res.json({
        success: true,
        message: 'Learning style assessment completed',
        result: learningStyleResult,
        profile: {
          learningStyle: user.learningStyle,
          assessmentCompleted: true,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Learning style assessment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not complete learning style assessment',
      });
    }
  }
);

// Get learning analytics for user
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const analytics = await aiContextService.getLearningAnalytics(
      req.user._id, 
      parseInt(days)
    );

    // Get recent progress
    const recentProgress = await aiContextService.getRecentProgress(req.user._id, 20);

    // Calculate learning insights
    const insights = generateLearningInsights(analytics, recentProgress);

    res.json({
      success: true,
      analytics,
      recentProgress,
      insights,
      period: `${days} days`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not retrieve learning analytics',
    });
  }
});

// Get learning recommendations based on user profile and progress
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const userContext = await aiContextService.getComprehensiveContext(req.user._id);
    const recommendations = generatePersonalizedRecommendations(userContext);

    res.json({
      success: true,
      recommendations,
      basedOn: {
        learningStyle: userContext.user.learning_style,
        experienceLevel: userContext.user.experience_level,
        recentPerformance: userContext.analytics.performance_trend,
        improvementAreas: userContext.analytics.improvement_areas,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not generate recommendations',
    });
  }
});

// Update learning preferences
router.put('/preferences',
  authenticate,
  [
    body('studyReminders').optional().isBoolean(),
    body('preferredStudyTime').optional().isIn(['morning', 'afternoon', 'evening', 'night']),
    body('difficultyPreference').optional().isIn(['easy', 'moderate', 'challenging']),
    body('notificationSettings').optional().isObject(),
    body('accessibilityOptions').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
          preferences: {
            ...req.body,
            updatedAt: new Date(),
          }
        },
        { new: true }
      );

      // Clear context cache
      aiContextService.clearUserCache(req.user._id);

      res.json({
        success: true,
        message: 'Learning preferences updated successfully',
        preferences: user.preferences,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not update learning preferences',
      });
    }
  }
);

// Helper Functions

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(user) {
  const fields = [
    'firstName',
    'lastName', 
    'email',
    'learningStyle',
    'preferences',
  ];

  const completed = fields.filter(field => {
    const value = user[field];
    return value !== null && value !== undefined && value !== '';
  }).length;

  const percentage = Math.round((completed / fields.length) * 100);

  return {
    percentage,
    completed: completed,
    total: fields.length,
    missing: fields.filter(field => {
      const value = user[field];
      return value === null || value === undefined || value === '';
    }),
  };
}

/**
 * Analyze learning style assessment responses
 */
function analyzeLearningStyleResponses(responses) {
  const scores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    reading: 0,
  };

  // Simple scoring algorithm - in production, use validated assessment tool
  responses.forEach(response => {
    switch (response.answer) {
      case 'A':
        scores.visual += 1;
        break;
      case 'B':
        scores.auditory += 1;
        break;
      case 'C':
        scores.kinesthetic += 1;
        break;
      case 'D':
        scores.reading += 1;
        break;
    }
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentages = {};
  Object.entries(scores).forEach(([style, score]) => {
    percentages[style] = Math.round((score / total) * 100);
  });

  const primaryStyle = Object.entries(percentages)
    .sort(([,a], [,b]) => b - a)[0][0];

  const confidence = percentages[primaryStyle];

  return {
    primaryStyle,
    scores: percentages,
    confidence,
    recommendation: generateStyleRecommendation(primaryStyle, confidence),
  };
}

/**
 * Generate learning style recommendation
 */
function generateStyleRecommendation(style, confidence) {
  const recommendations = {
    visual: {
      strategies: ['Use diagrams and charts', 'Color-code notes', 'Watch educational videos', 'Create mind maps'],
      tools: ['Flashcards', 'Infographics', 'Visual organizers', 'Highlighted text'],
    },
    auditory: {
      strategies: ['Listen to lectures', 'Join study groups', 'Read aloud', 'Use mnemonics'],
      tools: ['Audio recordings', 'Podcasts', 'Discussion forums', 'Voice notes'],
    },
    kinesthetic: {
      strategies: ['Hands-on practice', 'Take breaks while studying', 'Use real examples', 'Physical movement'],
      tools: ['Interactive simulations', 'Lab exercises', 'Field trips', 'Building models'],
    },
    reading: {
      strategies: ['Read extensively', 'Take detailed notes', 'Create outlines', 'Use bullet points'],
      tools: ['Text-based resources', 'Research papers', 'Written summaries', 'Note-taking apps'],
    },
  };

  return {
    confidence: confidence > 40 ? 'high' : confidence > 25 ? 'moderate' : 'low',
    ...recommendations[style],
  };
}

/**
 * Generate learning insights from analytics
 */
function generateLearningInsights(analytics, recentProgress) {
  const insights = [];

  if (analytics.performance_trend === 'improving') {
    insights.push({
      type: 'positive',
      title: 'Performance Improving',
      message: 'Your recent scores show an upward trend. Keep up the great work!',
      action: 'Continue with your current study approach',
    });
  } else if (analytics.performance_trend === 'declining') {
    insights.push({
      type: 'concern',
      title: 'Performance Declining',
      message: 'Your recent scores show a downward trend. Consider adjusting your study strategy.',
      action: 'Review difficult topics and seek additional help',
    });
  }

  if (analytics.session_frequency === 'infrequent') {
    insights.push({
      type: 'suggestion',
      title: 'Study More Regularly',
      message: 'Regular study sessions lead to better retention and understanding.',
      action: 'Try to study a little bit each day rather than cramming',
    });
  }

  if (analytics.improvement_areas?.length > 0) {
    insights.push({
      type: 'focus',
      title: 'Areas for Improvement',
      message: `Focus on: ${analytics.improvement_areas.join(', ')}`,
      action: 'Dedicate extra time to these topics in your next study session',
    });
  }

  return insights;
}

/**
 * Generate personalized recommendations
 */
function generatePersonalizedRecommendations(userContext) {
  const recommendations = [];
  
  const { user, analytics, progress } = userContext;

  // Learning style based recommendations
  if (user.learning_style === 'visual') {
    recommendations.push({
      type: 'study_method',
      title: 'Visual Learning Resources',
      description: 'Try interactive diagrams and video content for better comprehension',
      priority: 'high',
    });
  }

  // Performance based recommendations
  if (analytics.performance_trend === 'declining') {
    recommendations.push({
      type: 'study_strategy',
      title: 'Review Fundamentals',
      description: 'Consider reviewing earlier topics to strengthen your foundation',
      priority: 'high',
    });
  }

  // Activity based recommendations
  if (analytics.session_frequency === 'infrequent') {
    recommendations.push({
      type: 'schedule',
      title: 'Consistent Study Schedule',
      description: 'Regular short sessions are more effective than infrequent long sessions',
      priority: 'medium',
    });
  }

  // Experience level recommendations
  if (user.experience_level === 'beginner') {
    recommendations.push({
      type: 'pace',
      title: 'Take Your Time',
      description: 'Focus on understanding concepts thoroughly before moving to advanced topics',
      priority: 'medium',
    });
  }

  return recommendations;
}

export default router;
