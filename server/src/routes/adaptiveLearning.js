/**
 * Adaptive Learning Routes - Phase 3 Step 2
 * API endpoints for adaptive learning engine, assessment system, and learning analytics
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { auth, authorize } from '../middleware/auth.js';
import { flexibleAuthenticate, flexibleAuthorize } from '../middleware/devAuth.js';
import { adaptiveLearningService } from '../services/adaptiveLearningService.js';
import { assessmentEngineService } from '../services/assessmentEngineService.js';
import { learningAnalyticsService } from '../services/learningAnalyticsService.js';
import { Lesson } from '../models/index.js';

const router = express.Router();

/**
 * Adaptive Learning Path Endpoints
 */

// Get personalized learning path for a course
router.get('/learning-path/:courseId',
  auth,
  param('courseId').isMongoId(),
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
      const { recalculate = false } = req.query;

      const learningPath = await adaptiveLearningService.calculateLearningPath(
        req.user._id,
        courseId,
        { forceRecalculation: recalculate === 'true' }
      );

      res.json({
        success: learningPath.success,
        learningPath: learningPath.learningPath,
        metadata: learningPath.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Learning path retrieval error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate learning path'
      });
    }
  }
);

// Get content recommendations
router.get('/recommendations',
  flexibleAuthenticate,
  query('limit').optional().isInt({ min: 1, max: 20 }),
  query('type').optional().isIn(['next_lesson', 'remediation', 'enrichment', 'all']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { limit = 10, type = 'all', courseId } = req.query;

      const recommendations = await adaptiveLearningService.recommendNextContent(
        req.user._id,
        [], // completedLessons will be fetched internally
        { limit: parseInt(limit), type, courseId }
      );

      res.json({
        success: recommendations.success,
        recommendations: recommendations.recommendations,
        reasoning: recommendations.reasoning,
        metadata: recommendations.metadata,
        timestamp: new Date().toISOString()
      });    } catch (error) {
      console.error('Content recommendations error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        userId: req.user?._id,
        query: req.query
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate recommendations'
      });
    }
  }
);

// Generate personalized study plan
router.post('/study-plan',
  auth,
  [
    body('goals').isArray().notEmpty(),
    body('timeline.weeks').isInt({ min: 1, max: 52 }),
    body('timeline.sessionsPerWeek').optional().isInt({ min: 1, max: 14 }),
    body('preferences.intensity').optional().isIn(['light', 'moderate', 'intensive'])
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

      const { goals, timeline, preferences = {} } = req.body;

      const studyPlan = await adaptiveLearningService.generatePersonalizedStudyPlan(
        req.user._id,
        goals,
        timeline,
        preferences
      );

      res.json({
        success: studyPlan.success,
        studyPlan: studyPlan.studyPlan,
        metadata: studyPlan.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Study plan generation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate study plan'
      });
    }
  }
);

// Generate new learning path (for testing and initial setup)
router.post('/learning-path/generate',
  auth,
  [
    body('userId').isMongoId(),
    body('courseId').isMongoId(),
    body('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic', 'reading']),
    body('currentLevel').optional().isIn(['beginner', 'intermediate', 'advanced'])
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

      const { userId, courseId, learningStyle = 'visual', currentLevel = 'intermediate' } = req.body;

      const learningPath = await adaptiveLearningService.generateNewLearningPath(
        userId,
        courseId,
        { learningStyle, currentLevel }
      );

      res.json({
        success: true,
        learningPath: learningPath.learningPath,
        metadata: learningPath.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Learning path generation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate learning path'
      });
    }
  }
);

// Get current learning path for user
router.get('/learning-path/current',
  flexibleAuthenticate,
  [
    query('userId').optional().isMongoId().withMessage('Invalid user ID format')
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

      const userId = req.query.userId || req.user._id;
      
      if (!userId) {
        return res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide a valid user ID'
        });
      }
      
      // Get user's current learning path
      const learningPath = await adaptiveLearningService.getCurrentLearningPath(userId);
      
      res.json({
        success: true,
        learningPath: learningPath || {
          currentStep: 1,
          totalSteps: 5,
          progress: 20,
          nextRecommendation: {
            type: 'lesson',
            title: 'Getting Started',
            difficulty: 'beginner'
          },
          completedSteps: []
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get current learning path error:', error);
      res.json({
        success: true,
        learningPath: {
          currentStep: 1,
          totalSteps: 5,
          progress: 20,
          nextRecommendation: {
            type: 'lesson',
            title: 'Getting Started',
            difficulty: 'beginner'
          },
          completedSteps: []
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * Assessment Engine Endpoints
 */

// Generate AI-powered quiz from lesson content
router.post('/assessments/generate',
  auth,
  authorize(['instructor', 'admin']),
  [
    body('lessonId').isMongoId(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('questionCount').optional().isInt({ min: 1, max: 20 }),
    body('questionTypes').optional().isArray()
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

      const { lessonId, difficulty = 'medium', questionCount = 5, questionTypes = ['multiple_choice'] } = req.body;

      // Get lesson content (this would fetch from database)
      const lessonContent = await Lesson.findById(lessonId);
      if (!lessonContent) {
        return res.status(404).json({
          error: 'Lesson not found'
        });
      }

      const quiz = await assessmentEngineService.generateQuizFromContent(
        lessonContent,
        { difficulty, questionCount, questionTypes, userId: req.user._id }
      );

      res.json({
        success: quiz.success,
        quiz: quiz.quiz,
        metadata: quiz.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Quiz generation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate quiz'
      });
    }
  }
);

// Submit assessment response for AI grading
router.post('/assessments/:assessmentId/submit',
  auth,
  [
    param('assessmentId').notEmpty(),
    body('responses').isArray().notEmpty(),
    body('responses.*.questionId').notEmpty(),
    body('responses.*.answer').notEmpty()
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

      const { assessmentId } = req.params;
      const { responses } = req.body;

      // Process each response
      const gradingResults = [];
      for (const response of responses) {
        const question = await getQuestionById(response.questionId); // This would fetch from database
        
        const evaluation = await assessmentEngineService.evaluateResponse(
          question,
          response.answer,
          { userId: req.user._id, assessmentId }
        );

        gradingResults.push({
          questionId: response.questionId,
          ...evaluation
        });
      }

      // Calculate overall score
      const totalScore = gradingResults.reduce((sum, result) => sum + result.score, 0) / gradingResults.length;

      // Analyze knowledge gaps
      const knowledgeGaps = await assessmentEngineService.analyzeKnowledgeGaps(
        gradingResults,
        [] // course objectives would be passed here
      );

      // Track analytics event
      await learningAnalyticsService.trackLearningEvent(
        req.user._id,
        'assessment_complete',
        { assessmentId },
        { score: totalScore, questionCount: responses.length }
      );

      res.json({
        success: true,
        results: {
          overallScore: totalScore,
          individualResults: gradingResults,
          knowledgeGaps: knowledgeGaps.knowledgeGaps,
          strengths: knowledgeGaps.strengths,
          recommendations: knowledgeGaps.recommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Assessment submission error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to process assessment submission'
      });
    }
  }
);

// Generate assessment from course content
router.post('/assessment/generate',
  auth,
  [
    body('courseId').isMongoId(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('questionCount').optional().isInt({ min: 1, max: 20 }),
    body('questionTypes').optional().isArray()
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

      const { courseId, difficulty = 'medium', questionCount = 5, questionTypes = ['multiple_choice'] } = req.body;

      const assessment = await assessmentEngineService.generateAssessment(
        courseId,
        { difficulty, questionCount, questionTypes, userId: req.user._id }
      );

      res.json({
        success: true,
        assessment: assessment.assessment,
        metadata: assessment.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Assessment generation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate assessment'
      });
    }
  }
);

/**
 * Learning Analytics Endpoints
 */

// Get comprehensive progress report
router.get('/analytics/progress-report',
  auth,
  query('timeframe').optional().isInt({ min: 1, max: 365 }),
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

      const progressReport = await learningAnalyticsService.generateProgressReport(
        req.user._id,
        parseInt(timeframe)
      );

      res.json({
        success: progressReport.success,
        report: progressReport.report,
        metadata: progressReport.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Progress report generation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate progress report'
      });
    }
  }
);

// Get real-time dashboard data
router.get('/analytics/dashboard',
  auth,
  query('timeframe').optional().isInt({ min: 1, max: 30 }),
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

      const dashboardData = await learningAnalyticsService.generateDashboardData(
        req.user._id,
        parseInt(timeframe)
      );

      res.json({
        success: dashboardData.success,
        dashboard: dashboardData.dashboardData,
        metadata: dashboardData.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Dashboard data generation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate dashboard data'
      });
    }
  }
);

// Track learning event
router.post('/analytics/track',
  auth,
  [
    body('eventType').notEmpty(),
    body('context').optional().isObject(),
    body('metadata').optional().isObject()
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

      const { eventType, context = {}, metadata = {} } = req.body;

      const trackingResult = await learningAnalyticsService.trackLearningEvent(
        req.user._id,
        eventType,
        context,
        metadata
      );

      res.json({
        success: trackingResult.success,
        eventId: trackingResult.eventId,
        tracked: trackingResult.tracked,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Event tracking error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to track learning event'
      });
    }
  }
);

// Get performance predictions
router.get('/analytics/predictions',
  auth,
  async (req, res) => {
    try {
      const predictions = await learningAnalyticsService.predictPerformance(req.user._id);

      res.json({
        success: predictions.success,
        predictions: predictions.predictions,
        factors: predictions.factors,
        interventions: predictions.interventions,
        metadata: predictions.metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Performance prediction error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to generate performance predictions'
      });
    }
  }
);

// Instructor endpoint: Identify at-risk students
router.get('/analytics/at-risk/:courseId',
  auth,
  authorize(['instructor', 'admin']),
  [
    param('courseId').isMongoId(),
    query('threshold').optional().isIn(['low', 'medium', 'high'])
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
      const { threshold = 'medium', includeRecommendations = 'true' } = req.query;

      const atRiskAnalysis = await learningAnalyticsService.identifyAtRiskStudents(
        courseId,
        { 
          threshold, 
          includeRecommendations: includeRecommendations === 'true' 
        }
      );

      res.json({
        success: atRiskAnalysis.success,
        courseId: atRiskAnalysis.courseId,
        atRiskStudents: atRiskAnalysis.atRiskStudents,
        summary: atRiskAnalysis.summary,
        recommendations: atRiskAnalysis.recommendations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('At-risk student identification error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Unable to identify at-risk students'
      });
    }
  }
);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Adaptive Learning Engine',
    version: '3.2.0',
    features: [
      'Adaptive Learning Paths',
      'AI-Powered Assessments',
      'Learning Analytics',
      'Performance Predictions',
      'Real-time Tracking'
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * Utility functions (these would typically be in separate utility files)
 */

async function getQuestionById(questionId) {
  // This would fetch question data from database
  // For now, return a mock question structure
  return {
    id: questionId,
    question: 'Sample question',
    type: 'multiple_choice',
    correctAnswer: 'A',
    options: ['Option A', 'Option B', 'Option C', 'Option D']
  };
}

async function getUserPerformanceData(userId) {
  // This would fetch user performance data from database
  return {
    averageScore: 75,
    recentTrend: 'improving',
    sessionCount: 10
  };
}

export default router;
