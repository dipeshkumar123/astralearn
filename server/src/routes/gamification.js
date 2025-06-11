import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import gamificationService from '../services/gamificationService.js';
import { flexibleAuthenticate, flexibleAuthorize } from '../middleware/devAuth.js';

const router = Router();

/**
 * Gamification Routes for AstraLearn
 * Handles points, badges, achievements, streaks, and leaderboards
 */

// Get user's gamification dashboard
router.get('/dashboard',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      console.log('gamificationService methods:', Object.getOwnPropertyNames(gamificationService));
      console.log('gamificationService prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(gamificationService)));
      console.log('typeof getUserDashboard:', typeof gamificationService.getUserDashboard);
      
      const dashboard = await gamificationService.getUserDashboard(req.user._id);
      res.json(dashboard);
    } catch (error) {
      console.error('Get gamification dashboard error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve gamification dashboard'
      });
    }
  }
);

// Get user's complete gamification profile
router.get('/profile',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      const profile = await gamificationService.getUserGamificationProfile(req.user._id);
      
      res.json({
        success: true,
        profile: {
          totalPoints: profile.totalPoints,
          level: profile.level,
          experiencePoints: profile.experiencePoints,
          pointsBreakdown: profile.pointsBreakdown,
          badges: profile.badges,
          streaks: profile.streaks,
          achievements: profile.achievements,
          statistics: profile.statistics,
          preferences: profile.preferences
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get gamification profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve gamification profile'
      });
    }
  }
);

// Award points manually (admin only)
router.post('/points/award',
  flexibleAuthenticate,
  flexibleAuthorize(['admin', 'instructor']),
  [
    body('userId').isMongoId().withMessage('Valid user ID required'),
    body('activityType').isIn([
      'lesson_complete', 'assessment_complete', 'daily_login', 'streak_bonus',
      'collaboration', 'help_peer', 'create_content', 'challenge_complete'
    ]).withMessage('Valid activity type required'),
    body('metadata').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { userId, activityType, metadata = {} } = req.body;
      
      const result = await gamificationService.awardPoints(userId, activityType, metadata);
      
      res.json({
        success: true,
        message: 'Points awarded successfully',
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Award points error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not award points'
      });
    }
  }
);

// Award points to current user (for development and lesson completion)
router.post('/points/self-award',
  flexibleAuthenticate,
  [
    body('activityType').isIn([
      'lesson_complete', 'assessment_complete', 'daily_login', 'streak_bonus',
      'collaboration', 'help_peer', 'create_content', 'challenge_complete'
    ]).withMessage('Valid activity type required'),
    body('metadata').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { activityType, metadata = {} } = req.body;
      
      const result = await gamificationService.awardPoints(req.user._id, activityType, metadata);
      
      res.json({
        success: true,
        message: 'Points awarded successfully',
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Self award points error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not award points'
      });
    }
  }
);

// Award badge manually (admin only)
router.post('/badges/award',
  flexibleAuthenticate,
  flexibleAuthorize(['admin', 'instructor']),
  [
    body('userId').isMongoId().withMessage('Valid user ID required'),
    body('badgeId').notEmpty().withMessage('Badge ID required'),
    body('progress').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { userId, badgeId, progress } = req.body;
      
      const result = await gamificationService.awardBadge(userId, badgeId, progress);
      
      res.json({
        success: true,
        message: 'Badge awarded successfully',
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Award badge error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not award badge'
      });
    }
  }
);

// Get leaderboard
router.get('/leaderboard',
  flexibleAuthenticate,
  [
    query('type').optional().isIn(['global', 'course', 'weekly', 'monthly', 'friends'])
      .withMessage('Invalid leaderboard type'),
    query('courseId').optional().isMongoId().withMessage('Valid course ID required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1 and 365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { type = 'global', courseId, limit = 50, timeframe } = req.query;
      
      const options = {
        courseId: courseId || undefined,
        limit: parseInt(limit),
        timeframe: timeframe ? parseInt(timeframe) : undefined
      };

      const leaderboard = await gamificationService.getLeaderboard(type, options);
      
      res.json(leaderboard);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve leaderboard'
      });
    }
  }
);

// Get user's rank in leaderboard
router.get('/leaderboard/rank',
  flexibleAuthenticate,
  [
    query('type').optional().isIn(['global', 'course', 'weekly', 'monthly'])
      .withMessage('Invalid leaderboard type'),
    query('courseId').optional().isMongoId().withMessage('Valid course ID required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { type = 'global', courseId } = req.query;
      
      // Get full leaderboard and find user's position
      const leaderboard = await gamificationService.getLeaderboard(type, { 
        courseId, 
        limit: 1000 
      });
      
      const userRank = leaderboard.leaderboard.findIndex(
        entry => entry.userId.toString() === req.user._id.toString()
      );

      if (userRank === -1) {
        return res.json({
          success: true,
          rank: null,
          message: 'User not found in leaderboard',
          totalParticipants: leaderboard.totalEntries
        });
      }

      const userEntry = leaderboard.leaderboard[userRank];
      
      res.json({
        success: true,
        rank: userRank + 1,
        entry: userEntry,
        totalParticipants: leaderboard.totalEntries,
        percentile: Math.round((1 - userRank / leaderboard.totalEntries) * 100)
      });
    } catch (error) {
      console.error('Get user rank error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve user rank'
      });
    }
  }
);

// Get available badges
router.get('/badges',
  flexibleAuthenticate,
  [
    query('category').optional().isIn(['learning', 'consistency', 'collaboration', 'achievement', 'special'])
      .withMessage('Invalid badge category'),
    query('earned').optional().isBoolean().withMessage('Earned must be boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { Badge } = await import('../models/Gamification.js');
      const { category, earned } = req.query;
      
      let query = { isActive: true };
      if (category) {
        query.category = category;
      }

      const badges = await Badge.find(query).sort({ category: 1, rarity: 1 });
      
      // If user wants to filter by earned status
      if (earned !== undefined) {
        const userProfile = await gamificationService.getUserGamificationProfile(req.user._id);
        const earnedBadgeIds = userProfile.badges.map(b => b.badgeId);
        
        const filteredBadges = badges.filter(badge => {
          const isEarned = earnedBadgeIds.includes(badge.badgeId);
          return earned === 'true' ? isEarned : !isEarned;
        });
        
        return res.json({
          success: true,
          badges: filteredBadges,
          total: filteredBadges.length
        });
      }
      
      res.json({
        success: true,
        badges,
        total: badges.length
      });
    } catch (error) {
      console.error('Get badges error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve badges'
      });
    }
  }
);

// Get achievements
router.get('/achievements',
  flexibleAuthenticate,
  [
    query('category').optional().isIn(['milestone', 'streak', 'performance', 'collaboration', 'special'])
      .withMessage('Invalid achievement category'),
    query('completed').optional().isBoolean().withMessage('Completed must be boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { Achievement } = await import('../models/Gamification.js');
      const { User } = await import('../models/User.js');
      const { category, completed } = req.query;
      
      let query = { isActive: true, isHidden: false };
      if (category) {
        query.category = category;
      }

      const achievements = await Achievement.find(query).sort({ difficulty: 1, category: 1 });
      const userProfile = await gamificationService.getUserGamificationProfile(req.user._id);
      const user = await User.findById(req.user._id);
      
      const achievementsWithProgress = [];
      
      for (const achievement of achievements) {
        const existingAchievement = userProfile.achievements.find(
          a => a.achievementId === achievement.achievementId
        );
        
        let progress;
        let isCompleted = false;
        
        if (existingAchievement) {
          progress = existingAchievement.progress;
          isCompleted = true;
        } else {
          const criteria = await gamificationService.checkAchievementCriteria(achievement, user, userProfile);
          progress = criteria.progress;
          isCompleted = criteria.earned;
        }
        
        // Filter by completion status if specified
        if (completed !== undefined) {
          const shouldInclude = completed === 'true' ? isCompleted : !isCompleted;
          if (!shouldInclude) continue;
        }
        
        achievementsWithProgress.push({
          ...achievement.toJSON(),
          progress,
          completed: isCompleted,
          unlockedAt: existingAchievement?.unlockedAt || null
        });
      }
      
      res.json({
        success: true,
        achievements: achievementsWithProgress,
        total: achievementsWithProgress.length
      });
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve achievements'
      });
    }
  }
);

// Get user's recent activity
router.get('/activity',
  flexibleAuthenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('activityType').optional().isIn([
      'lesson_complete', 'assessment_complete', 'daily_login', 'streak_bonus',
      'collaboration', 'help_peer', 'create_content', 'challenge_complete',
      'badge_earned', 'level_up'
    ]).withMessage('Invalid activity type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { PointsActivity } = await import('../models/Gamification.js');
      const { limit = 20, activityType } = req.query;
      
      let query = { userId: req.user._id };
      if (activityType) {
        query.activityType = activityType;
      }

      const activities = await PointsActivity.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();
      
      res.json({
        success: true,
        activities,
        total: activities.length
      });
    } catch (error) {
      console.error('Get activity error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve activity'
      });
    }
  }
);

// Update user preferences
router.put('/preferences',
  flexibleAuthenticate,
  [
    body('showPublicProfile').optional().isBoolean(),
    body('allowLeaderboards').optional().isBoolean(),
    body('notificationsEnabled').optional().isBoolean(),
    body('preferredChallenges').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { UserGamification } = await import('../models/Gamification.js');
      const updates = req.body;
      
      const profile = await UserGamification.findOne({ userId: req.user._id });
      
      // Update preferences
      Object.keys(updates).forEach(key => {
        if (profile.preferences[key] !== undefined) {
          profile.preferences[key] = updates[key];
        }
      });
      
      await profile.save();
      
      res.json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: profile.preferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not update preferences'
      });
    }
  }
);

// Get gamification statistics (admin only)
router.get('/statistics',
  flexibleAuthenticate,
  flexibleAuthorize(['admin']),
  async (req, res) => {
    try {
      const { UserGamification, PointsActivity, Badge, Achievement } = await import('../models/Gamification.js');
      
      // Get basic statistics
      const totalUsers = await UserGamification.countDocuments();
      const totalPointsAwarded = await PointsActivity.aggregate([
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]);
      const totalBadges = await Badge.countDocuments({ isActive: true });
      const totalAchievements = await Achievement.countDocuments({ isActive: true });
      
      // Get top users
      const topUsers = await UserGamification.find()
        .sort({ totalPoints: -1 })
        .limit(10)
        .populate('userId', 'firstName lastName username')
        .lean();
      
      // Get activity distribution
      const activityDistribution = await PointsActivity.aggregate([
        {
          $group: {
            _id: '$activityType',
            count: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }
        }
      ]);
      
      res.json({
        success: true,
        statistics: {
          totalUsers,
          totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
          totalBadges,
          totalAchievements,
          topUsers,
          activityDistribution
        },
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve statistics'
      });
    }
  }
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Gamification API',
    version: '4.1.0',
    features: [
      'Points & Scoring System',
      'Badge System',
      'Achievement Tracking',
      'Streak Management',
      'Leaderboards',
      'User Analytics'
    ],
    timestamp: new Date().toISOString()
  });
});

// =============================
// STREAK MANAGEMENT ENDPOINTS
// =============================

// Get user's streak data and history
router.get('/streaks',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      const streakData = await gamificationService.getStreakData(req.user._id);
      
      res.json({
        success: true,
        streaks: streakData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get streak data error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve streak data'
      });
    }
  }
);

// Get streak history for specific date range
router.get('/streaks/history',
  flexibleAuthenticate,
  [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { days = 30 } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      
      const { PointsActivity } = await import('../models/Gamification.js');
      
      const activities = await PointsActivity.find({
        userId: req.user._id,
        createdAt: { $gte: startDate, $lte: endDate },
        activityType: { $in: ['lesson_complete', 'assessment_complete', 'daily_login'] }
      }).sort({ createdAt: 1 });
      
      const dailyActivity = gamificationService.calculateDailyActivity(activities);
      
      res.json({
        success: true,
        history: dailyActivity,
        period: { startDate, endDate, days: parseInt(days) },
        summary: {
          totalDays: dailyActivity.length,
          activeDays: dailyActivity.filter(d => d.completed).length,
          consistency: Math.round((dailyActivity.filter(d => d.completed).length / dailyActivity.length) * 100)
        }
      });
    } catch (error) {
      console.error('Get streak history error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve streak history'
      });
    }
  }
);

// Update daily streak (called when user completes activities)
router.post('/streaks/update',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      const profile = await gamificationService.getUserGamificationProfile(req.user._id);
      const today = new Date().toISOString().split('T')[0];
      
      // Check if user already has activity today
      const { PointsActivity } = await import('../models/Gamification.js');
      const todayActivity = await PointsActivity.findOne({
        userId: req.user._id,
        createdAt: {
          $gte: new Date(today),
          $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (todayActivity) {
        return res.json({
          success: true,
          message: 'Streak already updated for today',
          currentStreak: profile.streaks.current.dailyLearning
        });
      }
      
      // Update streak
      const updatedProfile = await gamificationService.updateDailyStreak(req.user._id);
      
      res.json({
        success: true,
        message: 'Streak updated successfully',
        currentStreak: updatedProfile.streaks.current.dailyLearning,
        multiplier: gamificationService.calculateStreakMultipliers(updatedProfile.streaks.current.dailyLearning)
      });
    } catch (error) {
      console.error('Update streak error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not update streak'
      });
    }
  }
);

// =============================
// DAILY GOALS ENDPOINTS
// =============================

// Get user's daily goals
router.get('/goals/daily',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      const goals = await gamificationService.getDailyGoals(req.user._id);
      
      res.json({
        success: true,
        goals,
        date: new Date().toISOString().split('T')[0],
        summary: {
          total: goals.length,
          completed: goals.filter(g => g.completed).length,
          totalPoints: goals.reduce((sum, g) => sum + (g.completed ? g.points : 0), 0),
          possiblePoints: goals.reduce((sum, g) => sum + g.points, 0)
        }
      });
    } catch (error) {
      console.error('Get daily goals error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve daily goals'
      });
    }
  }
);

// Complete a daily goal
router.post('/goals/daily/:goalId/complete',
  flexibleAuthenticate,
  [
    param('goalId').notEmpty().withMessage('Goal ID required'),
    body('metadata').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { goalId } = req.params;
      const { metadata = {} } = req.body;
      
      // Get goals to find the specific one
      const goals = await gamificationService.getDailyGoals(req.user._id);
      const goal = goals.find(g => g.id === goalId);
      
      if (!goal) {
        return res.status(404).json({
          error: 'Goal not found',
          message: 'Daily goal not found'
        });
      }
      
      if (goal.completed) {
        return res.json({
          success: true,
          message: 'Goal already completed',
          goal
        });
      }
      
      // Award points for completing goal
      const result = await gamificationService.awardPoints(req.user._id, 'daily_goal_complete', {
        goalId,
        goalTitle: goal.title,
        goalPoints: goal.points,
        ...metadata
      });
      
      res.json({
        success: true,
        message: 'Daily goal completed',
        goal: { ...goal, completed: true },
        pointsAwarded: result.pointsAwarded,
        newAchievements: result.newAchievements
      });
    } catch (error) {
      console.error('Complete daily goal error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not complete daily goal'
      });
    }
  }
);

// =============================
// CHALLENGE SYSTEM ENDPOINTS
// =============================

// Get available challenges
router.get('/challenges',
  flexibleAuthenticate,
  [
    query('type').optional().isIn(['daily', 'weekly', 'special', 'milestone'])
      .withMessage('Invalid challenge type'),
    query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert'])
      .withMessage('Invalid difficulty level'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { type, difficulty, limit = 10 } = req.query;
      
      const challenges = await gamificationService.getAvailableChallenges(req.user._id, {
        type,
        difficulty,
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        challenges,
        total: challenges.length
      });
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve challenges'
      });
    }
  }
);

// Get user's active challenges
router.get('/challenges/active',
  flexibleAuthenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { limit = 10 } = req.query;
      
      const challenges = await gamificationService.getActiveChallenges(req.user._id, {
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        challenges,
        total: challenges.length
      });
    } catch (error) {
      console.error('Get active challenges error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve active challenges'
      });
    }
  }
);

// Join a challenge
router.post('/challenges/:challengeId/join',
  flexibleAuthenticate,
  [
    param('challengeId').isMongoId().withMessage('Valid challenge ID required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { challengeId } = req.params;
      
      const challenge = await gamificationService.joinChallenge(challengeId, req.user._id);
      
      res.json({
        success: true,
        message: 'Successfully joined challenge',
        challenge,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Join challenge error:', error);
      
      if (error.message === 'Challenge not found') {
        return res.status(404).json({
          error: 'Challenge not found',
          message: 'The specified challenge does not exist'
        });
      }
      
      if (error.message === 'Already participating in this challenge') {
        return res.status(400).json({
          error: 'Already participating',
          message: 'You are already participating in this challenge'
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not join challenge'
      });
    }
  }
);

// Create a new challenge (admin or instructor only)
router.post('/challenges/create',
  flexibleAuthenticate,
  flexibleAuthorize(['admin', 'instructor']),
  [
    body('title').notEmpty().withMessage('Challenge title required'),
    body('description').notEmpty().withMessage('Challenge description required'),
    body('type').isIn(['daily', 'weekly', 'special', 'milestone']).withMessage('Valid challenge type required'),
    body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Valid difficulty required'),
    body('duration').notEmpty().withMessage('Duration required'),
    body('rewards').isArray().withMessage('Rewards array required'),
    body('requirements').isArray().withMessage('Requirements array required'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const challengeData = req.body;
      const challenge = await gamificationService.createChallenge(challengeData, req.user._id);
      
      res.json({
        success: true,
        message: 'Challenge created successfully',
        challenge,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create challenge error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not create challenge'
      });
    }
  }
);

// Get completed challenges
router.get('/challenges/completed',
  flexibleAuthenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation error',
          details: errors.array()
        });
      }

      const { limit = 20 } = req.query;
      
      const { Challenge } = await import('../models/Gamification.js');
      
      const completedChallenges = await Challenge.find({
        participants: req.user._id,
        isCompleted: true
      })
        .sort({ completedAt: -1 })
        .limit(parseInt(limit))
        .populate('createdBy', 'name username');
      
      res.json({
        success: true,
        challenges: completedChallenges,
        total: completedChallenges.length
      });
    } catch (error) {
      console.error('Get completed challenges error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve completed challenges'
      });
    }
  }
);

// Get weekly challenge
router.get('/challenges/weekly',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      const { Challenge } = await import('../models/Gamification.js');
      
      // Get current week's challenge
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weeklyChallenge = await Challenge.findOne({
        type: 'weekly',
        isActive: true,
        startDate: { $gte: weekStart },
        endDate: { $lte: weekEnd }
      });
      
      if (!weeklyChallenge) {
        return res.json({
          success: true,
          challenge: null,
          message: 'No weekly challenge available'
        });
      }
      
      // Calculate user's progress if participating
      let progress = null;
      if (weeklyChallenge.participants.includes(req.user._id)) {
        progress = await gamificationService.calculateChallengeProgress(weeklyChallenge._id, req.user._id);
      }
      
      res.json({
        success: true,
        challenge: {
          ...weeklyChallenge.toObject(),
          progress,
          timeRemaining: gamificationService.calculateTimeRemaining(weeklyChallenge.endDate),
          isParticipating: weeklyChallenge.participants.includes(req.user._id)
        }
      });
    } catch (error) {
      console.error('Get weekly challenge error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve weekly challenge'
      });
    }
  }
);

export default router;
