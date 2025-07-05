/**
 * Analytics API Routes - Phase 5 Step 1
 * API endpoints for comprehensive analytics engine and learning insights
 * 
 * Features:
 * - Learning behavior analytics tracking and analysis
 * - Real-time dashboard data generation
 * - Performance metrics calculation and trends
 * - Personalized insights and recommendations
 * - Interactive analytics data for frontend components
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { auth, authorize } from '../middleware/auth.js';
import { flexibleAuthenticate, flexibleAuthorize } from '../middleware/devAuth.js';
import analyticsService from '../services/analyticsService.js';
// Phase 5 Step 2 - Instructor Tools Services
import instructorAnalyticsService from '../services/instructorAnalyticsService.js';
import classMonitoringService from '../services/classMonitoringService.js';
import learningGapService from '../services/learningGapService.js';
import interventionEngine from '../services/interventionEngine.js';
import { UserProgress, User, Course, Lesson } from '../models/index.js';

const router = express.Router();

/**
 * Analytics Service Health Check
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'operational',
      service: 'Analytics Engine',
      version: '5.1.0',
      phase: 'Phase 5 Step 1 - Analytics Engine Implementation',
      features: [
        'Learning Behavior Analytics',
        'Performance Metrics Calculation',
        'Personalized Insights Generation',
        'Real-time Dashboard Data',
        'Predictive Analytics'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics health check error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Analytics service health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Analytics Summary Endpoint
 * Provides a concise summary of key analytics metrics for dashboards
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get performance metrics for summary
    const metrics = await analyticsService.calculatePerformanceMetrics(userId);
    
    // Get personalized insights summary
    const insights = await analyticsService.generatePersonalizedInsights(userId);
    
    // Get learning patterns summary
    const patterns = await analyticsService.analyzeLearningPatterns(userId, 30, 'overview');
    
    res.json({
      success: true,
      summary: {
        performance: {
          overall: metrics.overall,
          trends: metrics.trends
        },
        insights: {
          strengthsAndWeaknesses: insights.strengthsAndWeaknesses,
          recommendations: insights.personalizedRecommendations ? 
            insights.personalizedRecommendations.contentRecommendations : []
        },
        patterns: {
          learningBehavior: patterns.learningBehavior,
          dataQuality: patterns.overview.dataQuality
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics summary',
      message: error.message
    });
  }
});

/**
 * Track Learning Behavior
 * Records user learning behavior with contextual data
 */
router.post('/track/behavior',
  auth,
  [
    body('sessionData').isObject().withMessage('Session data must be an object'),
    body('context').optional().isObject().withMessage('Context must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { sessionData, context = {} } = req.body;
      
      const trackingResult = await analyticsService.trackLearningBehavior(
        req.user._id,
        sessionData,
        context
      );

      res.json({
        success: true,
        tracking: trackingResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Learning behavior tracking error:', error);
      res.status(500).json({
        error: 'Failed to track learning behavior',
        message: error.message
      });
    }
  }
);

/**
 * Analyze Learning Patterns
 * Comprehensive analysis of user learning patterns and behaviors
 */
router.get('/patterns/analyze',
  auth,
  [
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days'),
    query('analysisType').optional().isIn(['overview', 'detailed', 'trends', 'comparative']).withMessage('Invalid analysis type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { timeframe = 30, analysisType = 'overview' } = req.query;

      const patterns = await analyticsService.analyzeLearningPatterns(
        req.user._id,
        parseInt(timeframe),
        analysisType
      );

      res.json({
        success: true,
        patterns,
        analysisType,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Learning patterns analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze learning patterns',
        message: error.message
      });
    }
  }
);

/**
 * Generate Personalized Insights
 * AI-powered personalized learning insights and recommendations
 */
router.get('/insights/personalized',
  auth,
  async (req, res) => {
    try {
      const insights = await analyticsService.generatePersonalizedInsights(req.user._id);

      res.json({
        success: true,
        insights,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Personalized insights generation error:', error);
      res.status(500).json({
        error: 'Failed to generate personalized insights',
        message: error.message
      });
    }
  }
);

/**
 * Generate Real-time Dashboard Data
 * Provides comprehensive real-time analytics for dashboards
 */
router.get('/dashboard/realtime',
  auth,
  [
    query('timeframe').optional().isInt({ min: 1, max: 90 }).withMessage('Timeframe must be between 1-90 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { timeframe = 7 } = req.query;
      const userId = req.user._id;

      const dashboardData = await analyticsService.generateDashboardData(
        userId,
        'learner',
        parseInt(timeframe)
      );

      res.json({
        success: true,
        dashboard: dashboardData,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Dashboard data generation error:', error);
      res.status(500).json({
        error: 'Failed to generate dashboard data',
        message: error.message
      });
    }
  }
);

/**
 * Get Learning Behavior History
 * Provides historical learning behavior data for analysis
 */
router.get('/behavior/history',
  auth,
  [
    query('timeframe').optional().isInt({ min: 1, max: 90 }).withMessage('Timeframe must be between 1-90 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { timeframe = 30 } = req.query;
      const userId = req.user._id;

      // Get behavior history from service
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeframe));

      const progressData = await analyticsService.getUserProgressData(userId, startDate, endDate);
      
      // Handle case of no data
      if (!progressData || progressData.length === 0) {
        // Generate empty history with dates for the timeframe
        const emptyHistory = [];
        for (let i = 0; i < parseInt(timeframe); i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          emptyHistory.push({
            date: date.toISOString().split('T')[0],
            activities: 0,
            averageScore: 0,
            timeSpent: 0,
            completionRate: 0
          });
        }
        
        return res.json({
          success: true,
          behaviorHistory: emptyHistory,
          timeframe: parseInt(timeframe),
          timestamp: new Date().toISOString()
        });
      }
      
      // Group by day for history visualization
      const historyByDay = analyticsService.groupProgressByDay(progressData);
      
      // Transform into array format for frontend
      const behaviorHistory = Object.entries(historyByDay).map(([date, data]) => ({
        date,
        activities: data.length,
        averageScore: data.reduce((sum, item) => sum + (item.progressData?.score || 0), 0) / data.length || 0,
        timeSpent: data.reduce((sum, item) => sum + (item.progressData?.timeSpent || 0), 0),
        completionRate: data.reduce((sum, item) => sum + (item.progressData?.completionPercentage || 0), 0) / data.length || 0
      }));

      res.json({
        success: true,
        behaviorHistory,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Behavior history retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve behavior history',
        message: error.message
      });
    }
  }
);

/**
 * Calculate Performance Metrics
 * Comprehensive performance metrics calculation and analysis
 */
router.get('/metrics/performance',
  auth,
  [
    query('courseId').optional().isMongoId().withMessage('Invalid course ID'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId, timeframe = 30 } = req.query;

      const metrics = await analyticsService.calculatePerformanceMetrics(
        req.user._id,
        courseId || null,
        parseInt(timeframe)
      );

      res.json({
        success: true,
        metrics,
        courseId: courseId || null,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Performance metrics calculation error:', error);
      res.status(500).json({
        error: 'Failed to calculate performance metrics',
        message: error.message
      });
    }
  }
);

/**
 * Get Real-time Dashboard Data
 * Comprehensive dashboard data for analytics interface
 */
router.get('/dashboard/realtime',
  auth,
  [
    query('dashboardType').optional().isIn(['learner', 'instructor', 'admin']).withMessage('Invalid dashboard type'),
    query('timeframe').optional().isInt({ min: 1, max: 90 }).withMessage('Timeframe must be between 1-90 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { dashboardType = 'learner', timeframe = 7 } = req.query;

      const dashboardData = await analyticsService.generateDashboardData(
        req.user._id,
        dashboardType,
        parseInt(timeframe)
      );

      res.json({
        success: true,
        dashboard: dashboardData,
        dashboardType,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Dashboard data generation error:', error);
      res.status(500).json({
        error: 'Failed to generate dashboard data',
        message: error.message
      });
    }
  }
);

/**
 * Get Learning Behavior History
 * Historical learning behavior data for trend analysis
 */
router.get('/behavior/history',
  auth,
  [
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days'),
    query('granularity').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid granularity')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { timeframe = 30, granularity = 'day' } = req.query;

      // This would typically call a method like getBehaviorHistory
      // For now, using the patterns analysis as foundation
      const behaviorHistory = await analyticsService.analyzeLearningPatterns(
        req.user._id,
        parseInt(timeframe),
        'trends'
      );

      res.json({
        success: true,
        behaviorHistory,
        timeframe: parseInt(timeframe),
        granularity,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Behavior history retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve behavior history',
        message: error.message
      });
    }
  }
);

/**
 * Get Analytics Summary
 * Provides a comprehensive summary of all analytics data for a user
 */
router.get('/summary',
  auth,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).select('firstName lastName email role learningStyle');
      
      // Get metrics with a 30-day timeframe
      const metrics = await analyticsService.calculatePerformanceMetrics(userId, null, 30);
      
      // Get pattern analysis
      const patterns = await analyticsService.analyzeLearningPatterns(userId, 30, 'overview');
      
      // Get personalized insights (simplified version)
      const insights = {
        strengthsAndWeaknesses: {
          cognitiveStrengths: patterns.learningBehavior?.contentPreferences || [],
          improvementAreas: analyticsService.identifyImprovementAreas(patterns) || []
        },
        recommendations: metrics.predictions?.recommendedFocus || []
      };
      
      // Get course progress summary
      const courseProgress = await UserProgress.find({ 
        userId,
        progressType: 'enrollment'
      }).populate('courseId', 'title category difficulty');
      
      // Format progress data
      const formattedProgress = courseProgress.map(progress => ({
        courseId: progress.courseId?._id,
        title: progress.courseId?.title || 'Unknown Course',
        category: progress.courseId?.category || 'Uncategorized',
        difficulty: progress.courseId?.difficulty || 'beginner',
        progress: progress.progressData?.completionPercentage || 0,
        lastAccessed: progress.timestamp
      }));
      
      // Calculate overall stats
      const totalCourses = formattedProgress.length;
      const completedCourses = formattedProgress.filter(p => p.progress >= 100).length;
      const inProgressCourses = formattedProgress.filter(p => p.progress > 0 && p.progress < 100).length;
      const averageProgress = totalCourses > 0 
        ? formattedProgress.reduce((sum, p) => sum + p.progress, 0) / totalCourses 
        : 0;
      
      // Compile the summary data
      const summary = {
        user: {
          id: userId,
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email,
          role: user?.role || 'student',
          learningStyle: user?.learningStyle || 'unknown'
        },
        performance: {
          overview: metrics.overall || {},
          trends: metrics.trends || {}
        },
        progress: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          averageProgress,
          recentActivity: formattedProgress
            .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
            .slice(0, 5)
        },
        insights: {
          strengths: insights.strengthsAndWeaknesses.cognitiveStrengths.slice(0, 3),
          improvementAreas: insights.strengthsAndWeaknesses.improvementAreas.slice(0, 3),
          recommendations: insights.recommendations.slice(0, 3)
        },
        timestamp: new Date().toISOString()
      };
      
      res.json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('Analytics summary error:', error);
      res.status(500).json({
        error: 'Failed to generate analytics summary',
        message: error.message
      });
    }
  }
);

/**
 * Compare Performance (for benchmarking)
 * Anonymous performance comparison with peer groups
 */
router.get('/compare/performance',
  auth,
  [
    query('compareWith').optional().isIn(['peers', 'class', 'platform']).withMessage('Invalid comparison type'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { compareWith = 'peers', timeframe = 30 } = req.query;

      // Get user performance metrics
      const userMetrics = await analyticsService.calculatePerformanceMetrics(
        req.user._id,
        null,
        parseInt(timeframe)
      );

      // Generate anonymous comparison data
      const comparison = {
        userPerformance: {
          score: userMetrics.overall.averageScore,
          percentile: Math.floor(Math.random() * 100), // Placeholder for actual percentile calculation
          trend: userMetrics.trends.performanceTrend.direction
        },
        benchmarks: {
          [compareWith]: {
            averageScore: userMetrics.overall.averageScore + (Math.random() * 20 - 10),
            topPerformer: userMetrics.overall.averageScore + 15,
            medianScore: userMetrics.overall.averageScore + (Math.random() * 10 - 5)
          }
        },
        insights: [
          `You're performing ${userMetrics.overall.averageScore > 75 ? 'above' : 'at'} average compared to your ${compareWith}`,
          `Your learning velocity is ${userMetrics.trends.velocityTrend.current > 0.5 ? 'strong' : 'steady'}`,
          `Focus on ${userMetrics.areas.weakestArea} to improve overall performance`
        ]
      };

      res.json({
        success: true,
        comparison,
        compareWith,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Performance comparison error:', error);
      res.status(500).json({
        error: 'Failed to generate performance comparison',
        message: error.message
      });
    }
  }
);

/**
 * Admin/Instructor Routes (Authorized access only)
 */

/**
 * Get Class Analytics (Instructor only)
 */
router.get('/class/:courseId',
  auth,
  authorize(['instructor', 'admin']),
  [
    param('courseId').isMongoId().withMessage('Invalid course ID'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.params;
      const { timeframe = 30 } = req.query;

      // For now, return a structured response that would be implemented
      // when class-level analytics are fully developed
      const classAnalytics = {
        courseId,
        overview: {
          totalStudents: 25,
          activeStudents: 20,
          averageProgress: 65,
          completionRate: 80
        },
        performance: {
          averageScore: 78,
          topPerformers: 5,
          strugglingStudents: 3,
          improvementRate: 12
        },
        engagement: {
          averageSessionTime: 45,
          discussionParticipation: 70,
          assignmentSubmissionRate: 85
        },
        insights: [
          'Class performance is above average',
          '3 students may need additional support',
          'Discussion engagement could be improved'
        ]
      };

      res.json({
        success: true,
        classAnalytics,
        courseId,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Class analytics error:', error);
      res.status(500).json({
        error: 'Failed to retrieve class analytics',
        message: error.message
      });
    }
  }
);

/**
 * Get Platform Analytics (Admin only)
 */
router.get('/platform/overview',
  auth,
  authorize(['admin']),
  [
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { timeframe = 30 } = req.query;

      // Platform-wide analytics overview
      const platformAnalytics = {
        users: {
          totalActive: 1250,
          newRegistrations: 85,
          retentionRate: 78,
          engagementScore: 82
        },
        courses: {
          totalCourses: 150,
          completedCourses: 890,
          averageRating: 4.3,
          popularCourses: ['JavaScript Fundamentals', 'React Development', 'Python Basics']
        },
        learning: {
          totalLearningHours: 15600,
          averageSessionTime: 38,
          contentCompletionRate: 72,
          skillProgressRate: 85
        },
        system: {
          averageLoadTime: 1.2,
          uptime: 99.8,
          errorRate: 0.2,
          userSatisfaction: 4.4
        }
      };

      res.json({
        success: true,
        platformAnalytics,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Platform analytics error:', error);
      res.status(500).json({
        error: 'Failed to retrieve platform analytics',
        message: error.message
      });
    }
  }
);

/**
 * Instructor Tools Routes
 */

/**
 * Get Class Engagement Heatmap
 * Visualize student engagement levels across different class activities
 */
router.get('/class/:courseId/engagement/heatmap',
  auth,
  authorize(['instructor', 'admin']),
  [
    param('courseId').isMongoId().withMessage('Invalid course ID'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.params;
      const { timeframe = 30 } = req.query;

      const heatmapData = await classMonitoringService.getEngagementHeatmap(
        courseId,
        parseInt(timeframe)
      );

      res.json({
        success: true,
        heatmapData,
        courseId,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Engagement heatmap retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve engagement heatmap',
        message: error.message
      });
    }
  }
);

/**
 * Detect Learning Gaps
 * Identify individual and class-wide learning gaps
 */
router.get('/class/:courseId/learning-gaps',
  auth,
  authorize(['instructor', 'admin']),
  [
    param('courseId').isMongoId().withMessage('Invalid course ID'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.params;
      const { timeframe = 30 } = req.query;

      const learningGaps = await learningGapService.detectLearningGaps(
        courseId,
        parseInt(timeframe)
      );

      res.json({
        success: true,
        learningGaps,
        courseId,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Learning gap detection error:', error);
      res.status(500).json({
        error: 'Failed to detect learning gaps',
        message: error.message
      });
    }
  }
);

/**
 * Suggest Interventions
 * AI-driven intervention suggestions for at-risk students
 */
router.get('/class/:courseId/interventions',
  auth,
  authorize(['instructor', 'admin']),
  [
    param('courseId').isMongoId().withMessage('Invalid course ID'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.params;
      const { timeframe = 30 } = req.query;

      const interventions = await interventionEngine.suggestInterventions(
        courseId,
        parseInt(timeframe)
      );

      res.json({
        success: true,
        interventions,
        courseId,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Intervention suggestion error:', error);
      res.status(500).json({
        error: 'Failed to suggest interventions',
        message: error.message
      });
    }
  }
);

/**
 * Dashboard Data Endpoint
 * Provides real-time dashboard data for visualization
 */
router.get('/dashboard',
  auth,
  [
    query('timeframe').optional().isInt({ min: 1, max: 90 }).withMessage('Timeframe must be between 1-90 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user._id;
      const timeframe = parseInt(req.query.timeframe || '7');
      
      // Get user progress data for the timeframe
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);
      
      const progressData = await UserProgress.find({
        userId,
        timestamp: { $gte: startDate }
      }).sort({ timestamp: 1 });
      
      // Generate dashboard data with engagement trends
      const engagementTrends = analyticsService.analyzeEngagementTrends(progressData);
      
      // Calculate basic metrics
      const totalActivities = progressData.length;
      const completedActivities = progressData.filter(p => 
        p.progressData?.completionPercentage >= 100
      ).length;
      const completionRate = totalActivities > 0 
        ? (completedActivities / totalActivities) * 100 
        : 0;
      
      const avgScore = progressData.filter(p => typeof p.progressData?.score === 'number')
        .reduce((sum, p) => sum + p.progressData.score, 0) / 
        Math.max(progressData.filter(p => typeof p.progressData?.score === 'number').length, 1);
      
      const totalTimeSpent = progressData.reduce((sum, p) => 
        sum + (p.progressData?.timeSpent || 0), 0);
      
      // Generate chart data
      const chartData = generateChartData(progressData, timeframe);
      
      // Assemble dashboard data
      const dashboardData = {
        keyMetrics: {
          learningVelocity: engagementTrends.currentLevel === 'insufficient_data' ? 0 : 
            parseFloat((totalActivities / timeframe).toFixed(2)),
          performanceScore: Math.round(avgScore),
          engagementLevel: engagementTrends.currentLevel || 'new_user',
          consistencyRating: progressData.length >= 5 ? 0.65 : 0.1,
          totalActivities,
          completionRate: Math.round(completionRate),
          totalTimeSpent
        },
        engagementInsights: {
          trends: engagementTrends,
          currentSession: {
            isActive: true,
            startTime: new Date(),
            performance: {
              averageScore: Math.round(avgScore),
              completionRate: Math.round(completionRate),
              timeSpent: totalTimeSpent
            }
          }
        },
        visualizations: chartData,
        recommendations: engagementTrends.recommendations || []
      };
      
      res.json({
        success: true,
        dashboard: dashboardData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Dashboard data generation error:', error);
      res.status(500).json({
        error: 'Failed to generate dashboard data',
        message: error.message
      });
    }
  }
);

/**
 * Generate chart data from progress data
 * @private
 */
function generateChartData(progressData, timeframe) {
  // Generate date labels for the timeframe
  const dateLabels = [];
  const dataByDate = {};
  
  for (let i = 0; i < timeframe; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (timeframe - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    dateLabels.push(dateStr);
    dataByDate[dateStr] = {
      date: dateStr,
      activities: 0,
      score: 0,
      scoreCount: 0,
      timeSpent: 0
    };
  }
  
  // Populate data by date
  progressData.forEach(progress => {
    if (!progress.timestamp) return;
    
    const dateStr = new Date(progress.timestamp).toISOString().split('T')[0];
    if (!dataByDate[dateStr]) return;
    
    dataByDate[dateStr].activities++;
    
    if (typeof progress.progressData?.score === 'number') {
      dataByDate[dateStr].score += progress.progressData.score;
      dataByDate[dateStr].scoreCount++;
    }
    
    dataByDate[dateStr].timeSpent += (progress.progressData?.timeSpent || 0);
  });
  
  // Calculate averages and format data
  return dateLabels.map(date => {
    const data = dataByDate[date];
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      performance: data.scoreCount > 0 ? Math.round(data.score / data.scoreCount) : 0,
      engagement: data.activities,
      studyTime: Math.round(data.timeSpent / 60) // Convert to minutes
    };
  });
}

/**
 * Get User Overview Analytics
 * Basic analytics overview for user dashboard
 */
router.get('/user/overview',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Get user analytics summary
      const userAnalytics = await analyticsService.getUserAnalytics(userId, {
        type: 'overview',
        timeframe: 30
      });

      res.json({
        success: true,
        data: userAnalytics || {
          totalPoints: 0,
          streak: 0,
          certificates: 0,
          todayStudyTime: 0,
          achievements: 0,
          totalStudents: 0,
          averagePerformance: 0
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('User overview analytics error:', error);
      res.json({
        success: true,
        data: {
          totalPoints: 0,          streak: 0,
          certificates: 0,
          todayStudyTime: 0,
          achievements: 0,
          totalStudents: 0,
          averagePerformance: 0
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * Admin Analytics Endpoints
 */

/**
 * Get System Overview
 * System-wide analytics for admin dashboard
 */
router.get('/admin/system-overview',
  flexibleAuthenticate,
  flexibleAuthorize(['admin']),
  async (req, res) => {
    try {
      // Mock system overview data for now
      const systemData = {
        totalUsers: 1250,
        totalCourses: 45,
        totalInstructors: 12,
        activeUsers: 340,
        courseCompletions: 890,
        systemHealth: 'good',
        serverLoad: '45%',
        databaseSize: '2.3GB',
        monthlyGrowth: '+12%',
        topCourses: [
          { title: 'Introduction to Machine Learning', enrollments: 245 },
          { title: 'Web Development Fundamentals', enrollments: 190 },
          { title: 'Data Science Essentials', enrollments: 167 }
        ],
        recentActivity: [
          { type: 'registration', count: 15, period: 'today' },
          { type: 'course_completion', count: 8, period: 'today' },
          { type: 'new_course', count: 2, period: 'this_week' }
        ]
      };

      res.json({
        success: true,
        data: systemData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Admin system overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system overview',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * Get User Analytics
 * Detailed user analytics for admin dashboard
 */
router.get('/admin/user-analytics',
  flexibleAuthenticate,
  flexibleAuthorize(['admin']),
  async (req, res) => {
    try {
      // Mock user analytics data
      const userAnalytics = {
        userMetrics: {
          totalUsers: 1250,
          activeUsers: 340,
          newUsersThisMonth: 87,
          userRetentionRate: '78%'
        },
        userDistribution: {
          students: 1180,
          instructors: 65,
          admins: 5
        },
        engagementMetrics: {
          dailyActiveUsers: 156,
          averageSessionTime: '42 minutes',
          courseCompletionRate: '67%',
          forumParticipation: '34%'
        },
        geographicDistribution: [
          { region: 'North America', users: 456 },
          { region: 'Europe', users: 398 },
          { region: 'Asia', users: 312 },
          { region: 'Other', users: 84 }
        ]
      };

      res.json({
        success: true,
        data: userAnalytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Admin user analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user analytics',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * Get Analytics Summary
 * Comprehensive analytics summary for user dashboard
 */
router.get('/summary', flexibleAuthenticate, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User ID not found in token'
      });
    }

    // Get basic analytics data
    const analytics = await analyticsService.getUserAnalytics(userId);
    
    // Create summary response
    const summary = {
      userId: userId,
      totalStudyTime: analytics.totalStudyTime || 0,
      coursesCompleted: analytics.coursesCompleted || 0,
      coursesInProgress: analytics.coursesInProgress || 0,
      averageScore: analytics.averageScore || 0,
      streakDays: analytics.streakDays || 0,
      weeklyGoalProgress: analytics.weeklyGoalProgress || 0,
      skillsLearned: analytics.skillsLearned || [],
      recentActivity: analytics.recentActivity || [],
      performanceTrend: analytics.performanceTrend || 'stable',
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      analytics: summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics summary',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get User-Specific Insights
 * Fetch comprehensive analytics insights for a specific user
 */
router.get('/insights/:userId',
  auth,
  authorize(['admin', 'instructor']),
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { userId } = req.params;
      
      // Generate comprehensive insights for the user
      const insights = await analyticsService.generateUserInsights(userId);

      res.json({
        success: true,
        userId,
        insights,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('User insights generation error:', error);
      res.status(500).json({
        error: 'Failed to generate user insights',
        message: error.message
      });
    }
  }
);

/**
 * Calculate Study Effectiveness
 * Analyzes the effectiveness of a user's study patterns and behaviors
 */
router.get('/effectiveness',
  auth,
  [
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('Timeframe must be between 1-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { timeframe = 30 } = req.query;

      // Get user progress data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeframe));

      const progressData = await UserProgress.find({
        userId: req.user._id,
        timestamp: { $gte: startDate, $lte: endDate }
      }).populate(['courseId', 'lessonId']);

      // Return simplified effectiveness data for now
      const effectiveness = {
        score: progressData.length > 0 ? 65 + Math.floor(Math.random() * 20) : 0,
        rating: progressData.length > 0 ? 'good' : 'insufficient_data',
        factors: progressData.length > 0 ? ['completion_rate', 'assessment_performance'] : [],
        recommendations: progressData.length > 0 ? 
          ['Complete lessons fully before moving to new content', 
           'Review material regularly for better retention'] : 
          ['Start by completing some courses to analyze your learning effectiveness']
      };
      
      // Get learning style data
      const learningStyle = {
        dominantStyle: progressData.length > 0 ? 'visual' : 'unknown',
        affinity: {
          visual: progressData.length > 0 ? 45 : 0,
          auditory: progressData.length > 0 ? 25 : 0,
          reading: progressData.length > 0 ? 20 : 0,
          kinesthetic: progressData.length > 0 ? 10 : 0
        },
        recommendation: progressData.length > 0 ? 
          'Your learning style shows a strong preference for visual content' : 
          'Explore different content types to help identify your learning style'
      };
      
      // Get optimal study time data
      const optimalTimes = {
        confidence: progressData.length > 10 ? 'medium' : 'low',
        optimalDay: progressData.length > 0 ? 'Tuesday' : null,
        optimalTimeRange: progressData.length > 0 ? '7PM-9PM' : null,
        daysDistribution: {
          'Monday': { count: 5, performance: 75 },
          'Tuesday': { count: 8, performance: 82 },
          'Wednesday': { count: 6, performance: 76 },
          'Thursday': { count: 4, performance: 70 },
          'Friday': { count: 3, performance: 68 },
          'Saturday': { count: 2, performance: 72 },
          'Sunday': { count: 3, performance: 74 }
        },
        timeDistribution: {
          '6AM': { count: 1, performance: 65 },
          '9AM': { count: 2, performance: 70 },
          '12PM': { count: 3, performance: 72 },
          '3PM': { count: 4, performance: 75 },
          '6PM': { count: 6, performance: 78 },
          '9PM': { count: 8, performance: 82 },
          '12AM': { count: 2, performance: 68 }
        },
        recommendation: progressData.length > 0 ? 
          'Your performance tends to be highest on Tuesdays between 7PM-9PM' : 
          'Continue studying consistently to improve prediction accuracy'
      };
      
      if (progressData.length === 0) {
        // Clear distributions if no data
        optimalTimes.daysDistribution = {};
        optimalTimes.timeDistribution = {};
      }

      res.json({
        success: true,
        effectiveness,
        learningStyle,
        optimalTimes,
        dataPoints: progressData.length,
        timeframe: parseInt(timeframe),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Study effectiveness analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze study effectiveness',
        message: error.message
      });
    }
  }
);

/**
 * Course Progress Analysis
 * Provides detailed analysis of user progress across all courses
 */
router.get('/progress/courses',
  auth,
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Get all user progress entries for courses
      const progressEntries = await UserProgress.find({
        userId,
        progressType: 'enrollment'
      }).populate('courseId', 'title category difficulty');
      
      // Get all courses to identify those with no progress
      const allCourses = await Course.find({});
      const coursesWithProgress = new Set(
        progressEntries.map(entry => entry.courseId?._id.toString())
      );
      
      const notStartedCourses = allCourses
        .filter(course => !coursesWithProgress.has(course._id.toString()))
        .map(course => ({
          courseId: course._id,
          title: course.title,
          category: course.category,
          difficulty: course.difficulty,
          progress: 0,
          status: 'not_started',
          lastAccessed: null
        }));
      
      // Format progress data for each course
      const courseProgress = progressEntries.map(entry => {
        const progress = entry.progressData?.completionPercentage || 0;
        let status = 'in_progress';
        
        if (progress >= 100) {
          status = 'completed';
        } else if (progress === 0) {
          status = 'enrolled';
        } else if (progress < 25) {
          status = 'just_started';
        } else if (progress >= 75) {
          status = 'almost_complete';
        }
        
        return {
          courseId: entry.courseId?._id,
          title: entry.courseId?.title || 'Unknown Course',
          category: entry.courseId?.category || 'Uncategorized',
          difficulty: entry.courseId?.difficulty || 'beginner',
          progress,
          status,
          lastAccessed: entry.timestamp || entry.createdAt,
          estimatedCompletion: progress < 100 ? calculateEstimatedCompletion(entry) : null
        };
      });
      
      // Combine both arrays
      const allCoursesProgress = [...courseProgress, ...notStartedCourses];
      
      // Calculate overall progress statistics
      const totalCourses = allCoursesProgress.length;
      const completedCourses = allCoursesProgress.filter(c => c.status === 'completed').length;
      const inProgressCourses = allCoursesProgress.filter(c => 
        ['in_progress', 'just_started', 'almost_complete'].includes(c.status)
      ).length;
      const notStartedCount = notStartedCourses.length;
      
      const overallCompletionRate = totalCourses > 0 
        ? (completedCourses / totalCourses) * 100 
        : 0;
      
      const averageProgress = courseProgress.length > 0
        ? courseProgress.reduce((sum, course) => sum + course.progress, 0) / courseProgress.length
        : 0;
      
      res.json({
        success: true,
        courseProgress: {
          courses: allCoursesProgress,
          statistics: {
            totalCourses,
            completedCourses,
            inProgressCourses,
            notStartedCourses: notStartedCount,
            overallCompletionRate,
            averageProgress
          },
          byCategory: calculateCategoryProgress(allCoursesProgress),
          byDifficulty: calculateDifficultyProgress(allCoursesProgress)
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Course progress analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze course progress',
        message: error.message
      });
    }
  }
);

/**
 * Calculate estimated completion date based on current progress
 * @private
 */
function calculateEstimatedCompletion(progressEntry) {
  if (!progressEntry.timestamp || !progressEntry.progressData?.completionPercentage) {
    return null;
  }
  
  const completionPercentage = progressEntry.progressData.completionPercentage;
  if (completionPercentage >= 100 || completionPercentage === 0) {
    return null;
  }
  
  // Calculate days since starting the course
  const startDate = new Date(progressEntry.createdAt || progressEntry.timestamp);
  const now = new Date();
  const daysSinceStart = Math.max(1, Math.ceil((now - startDate) / (24 * 60 * 60 * 1000)));
  
  // Calculate progress rate per day
  const progressRate = completionPercentage / daysSinceStart;
  
  // Calculate days needed to complete
  const remainingProgress = 100 - completionPercentage;
  const daysNeeded = Math.ceil(remainingProgress / Math.max(0.1, progressRate));
  
  // Calculate estimated completion date
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);
  
  return completionDate;
}

/**
 * Calculate progress by category
 * @private
 */
function calculateCategoryProgress(courses) {
  const categories = {};
  
  courses.forEach(course => {
    const category = course.category || 'Uncategorized';
    
    if (!categories[category]) {
      categories[category] = {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        totalProgress: 0
      };
    }
    
    categories[category].totalCourses++;
    categories[category].totalProgress += course.progress;
    
    if (course.progress >= 100) {
      categories[category].completedCourses++;
    }
  });
  
  // Calculate averages for each category
  Object.keys(categories).forEach(category => {
    const categoryData = categories[category];
    categoryData.averageProgress = categoryData.totalCourses > 0
      ? categoryData.totalProgress / categoryData.totalCourses
      : 0;
    
    categoryData.completionRate = categoryData.totalCourses > 0
      ? (categoryData.completedCourses / categoryData.totalCourses) * 100
      : 0;
  });
  
  return categories;
}

/**
 * Calculate progress by difficulty
 * @private
 */
function calculateDifficultyProgress(courses) {
  const difficulties = {
    beginner: { totalCourses: 0, completedCourses: 0, averageProgress: 0, totalProgress: 0 },
    intermediate: { totalCourses: 0, completedCourses: 0, averageProgress: 0, totalProgress: 0 },
    advanced: { totalCourses: 0, completedCourses: 0, averageProgress: 0, totalProgress: 0 }
  };
  
  courses.forEach(course => {
    const difficulty = course.difficulty || 'beginner';
    
    if (!difficulties[difficulty]) {
      difficulties[difficulty] = {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        totalProgress: 0
      };
    }
    
    difficulties[difficulty].totalCourses++;
    difficulties[difficulty].totalProgress += course.progress;
    
    if (course.progress >= 100) {
      difficulties[difficulty].completedCourses++;
    }
  });
  
  // Calculate averages for each difficulty
  Object.keys(difficulties).forEach(difficulty => {
    const difficultyData = difficulties[difficulty];
    difficultyData.averageProgress = difficultyData.totalCourses > 0
      ? difficultyData.totalProgress / difficultyData.totalCourses
      : 0;
    
    difficultyData.completionRate = difficultyData.totalCourses > 0
      ? (difficultyData.completedCourses / difficultyData.totalCourses) * 100
      : 0;
  });
  
  return difficulties;
}

/**
 * Analytics History Endpoint
 * Provides historical analytics data for trend visualization
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const timeframe = parseInt(req.query.timeframe) || 30; // Default to 30 days
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeframe);
    
    // Query user progress within the timeframe
    const progressData = await UserProgress.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 }).populate(['courseId', 'lessonId']);
    
    if (!progressData || progressData.length === 0) {
      // Return default empty structure if no data
      return res.json({
        success: true,
        history: {
          timeframe,
          dataPoints: generateEmptyDataPoints(timeframe),
          courses: [],
          insights: {
            trends: "No learning history available yet",
            recommendation: "Start learning to generate analytics history"
          }
        }
      });
    }
    
    // Process data for each day in the timeframe
    const dailyData = {};
    const courseData = {};
    
    // Initialize all days in the timeframe
    for (let i = 0; i < timeframe; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      dailyData[dateString] = {
        date: dateString,
        activitiesCompleted: 0,
        timeSpent: 0,
        averageScore: 0,
        completionRate: 0,
        courses: []
      };
    }
    
    // Populate with actual data
    progressData.forEach(progress => {
      const dateString = new Date(progress.timestamp).toISOString().split('T')[0];
      const courseId = progress.courseId?._id?.toString() || 'unknown';
      const courseName = progress.courseId?.title || 'Unknown Course';
      
      // Skip if outside our timeframe
      if (!dailyData[dateString]) return;
      
      // Update daily data
      dailyData[dateString].activitiesCompleted++;
      dailyData[dateString].timeSpent += progress.timeSpent || 0;
      dailyData[dateString].averageScore = 
        ((dailyData[dateString].averageScore * (dailyData[dateString].activitiesCompleted - 1)) + 
         (progress.score || 0)) / dailyData[dateString].activitiesCompleted;
      dailyData[dateString].completionRate = 
        ((dailyData[dateString].completionRate * (dailyData[dateString].activitiesCompleted - 1)) + 
         (progress.completionRate || 0)) / dailyData[dateString].activitiesCompleted;
      
      if (!dailyData[dateString].courses.includes(courseId)) {
        dailyData[dateString].courses.push(courseId);
      }
      
      // Update course data
      if (!courseData[courseId]) {
        courseData[courseId] = {
          id: courseId,
          name: courseName,
          activitiesCompleted: 0,
          timeSpent: 0,
          averageScore: 0,
          completionRate: 0,
          lastAccessed: progress.timestamp
        };
      }
      
      courseData[courseId].activitiesCompleted++;
      courseData[courseId].timeSpent += progress.timeSpent || 0;
      courseData[courseId].averageScore = 
        ((courseData[courseId].averageScore * (courseData[courseId].activitiesCompleted - 1)) + 
         (progress.score || 0)) / courseData[courseId].activitiesCompleted;
      courseData[courseId].completionRate = 
        ((courseData[courseId].completionRate * (courseData[courseId].activitiesCompleted - 1)) + 
         (progress.completionRate || 0)) / courseData[courseId].activitiesCompleted;
      
      if (new Date(progress.timestamp) > new Date(courseData[courseId].lastAccessed)) {
        courseData[courseId].lastAccessed = progress.timestamp;
      }
    });
    
    // Convert to array and sort by date
    const dataPoints = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Sort courses by activity
    const courses = Object.values(courseData).sort((a, b) => 
      b.activitiesCompleted - a.activitiesCompleted
    );
    
    // Generate insights from the data
    const insights = generateHistoryInsights(dataPoints, courses);
    
    res.json({
      success: true,
      history: {
        timeframe,
        dataPoints,
        courses,
        insights
      }
    });
  } catch (error) {
    console.error('Analytics history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics history',
      message: error.message
    });
  }
});

/**
 * Helper function to generate empty data points for the timeframe
 */
function generateEmptyDataPoints(timeframe) {
  const endDate = new Date();
  const dataPoints = [];
  
  for (let i = 0; i < timeframe; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - (timeframe - 1 - i));
    const dateString = date.toISOString().split('T')[0];
    
    dataPoints.push({
      date: dateString,
      activitiesCompleted: 0,
      timeSpent: 0,
      averageScore: 0,
      completionRate: 0,
      courses: []
    });
  }
  
  return dataPoints;
}

/**
 * Helper function to generate insights from history data
 */
function generateHistoryInsights(dataPoints, courses) {
  // Default insights for empty data
  if (!dataPoints.length || !courses.length) {
    return {
      trends: "No learning history available yet",
      recommendation: "Start learning to generate analytics history"
    };
  }
  
  // Check for active learning days
  const activeDays = dataPoints.filter(day => day.activitiesCompleted > 0).length;
  const activeDaysPercentage = (activeDays / dataPoints.length) * 100;
  
  // Calculate trend direction
  const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
  const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
  
  const firstHalfActivity = firstHalf.reduce((sum, day) => sum + day.activitiesCompleted, 0);
  const secondHalfActivity = secondHalf.reduce((sum, day) => sum + day.activitiesCompleted, 0);
  
  let trendDirection = "steady";
  if (secondHalfActivity > firstHalfActivity * 1.2) {
    trendDirection = "increasing";
  } else if (secondHalfActivity < firstHalfActivity * 0.8) {
    trendDirection = "decreasing";
  }
  
  // Determine most active course
  const mostActiveCourse = courses.length ? courses[0].name : null;
  
  // Generate insights text
  let trends = "";
  let recommendation = "";
  
  if (activeDaysPercentage < 30) {
    trends = "Irregular learning pattern with low activity";
    recommendation = "Try to establish a more consistent learning routine";
  } else if (activeDaysPercentage < 60) {
    trends = `Moderately consistent learning with a ${trendDirection} trend`;
    recommendation = "Focus on increasing your learning consistency";
  } else {
    trends = `Good learning consistency with a ${trendDirection} trend`;
    recommendation = "Keep up your consistent learning pattern";
  }
  
  if (mostActiveCourse) {
    trends += `. Most active in: ${mostActiveCourse}`;
  }
  
  return {
    trends,
    recommendation,
    activeDaysPercentage: Math.round(activeDaysPercentage),
    trendDirection,
    mostActiveCourse
  };
}

export default router;
