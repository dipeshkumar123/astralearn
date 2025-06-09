import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { config } from '../config/environment.js';
import aiService from '../services/aiService.js';
import aiContextService from '../services/aiContextService.js';

const router = Router();

// AI Chat endpoint - context-aware AI system
router.post('/chat', 
  authenticate,
  [
    body('message').notEmpty().trim(),
    body('context').optional().isObject(),
    body('courseId').optional().isString(),
    body('lessonId').optional().isString(),
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

      const { message, context = {}, courseId, lessonId } = req.body;

      // Gather comprehensive context from database
      const databaseContext = await aiContextService.getComprehensiveContext(
        req.user._id, 
        { courseId, lessonId, ...context }
      );

      // Merge with provided context (provided context takes precedence)
      const enhancedContext = {
        ...databaseContext,
        user: {
          ...databaseContext.user,
          ...context.user,
          userId: req.user._id,
          timestamp: new Date().toISOString(),
        },
        course: {
          ...databaseContext.course,
          ...context.course,
        },
        lesson: {
          ...databaseContext.lesson,
          ...context.lesson,
        },
        progress: {
          ...databaseContext.progress,
          ...context.progress,
        },
        analytics: {
          ...databaseContext.analytics,
          ...context.analytics,
        },
      };

      // Process message with AI service
      const aiResponse = await aiService.processContextAwareChat(
        message, 
        enhancedContext
      );

      // Return structured response
      const response = {
        reply: aiResponse.reply,
        success: aiResponse.success,
        context: enhancedContext,
        metadata: aiResponse.metadata,
      };

      if (!aiResponse.success) {
        return res.status(503).json({
          ...response,
          error: 'AI service unavailable',
          message: 'Using fallback response',
        });
      }

      res.json(response);
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'AI service temporarily unavailable',
        reply: 'I apologize, but I\'m currently experiencing technical difficulties. Please try again in a moment.',
      });
    }
  }
);

// AI Explanation endpoint - get explanations for concepts
router.post('/explain',
  authenticate,
  [
    body('concept').notEmpty().trim(),
    body('context').optional().isObject(),
    body('courseId').optional().isString(),
    body('lessonId').optional().isString(),
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

      const { concept, context = {}, courseId, lessonId } = req.body;

      // Gather comprehensive context from database
      const databaseContext = await aiContextService.getComprehensiveContext(
        req.user._id, 
        { courseId, lessonId, ...context }
      );

      // Enhanced context with user information and database context
      const enhancedContext = {
        ...databaseContext,
        user: {
          ...databaseContext.user,
          ...context.user,
          userId: req.user._id,
        },
        course: {
          ...databaseContext.course,
          ...context.course,
        },
        lesson: {
          ...databaseContext.lesson,
          ...context.lesson,
        },
        interactionType: 'explanation',
      };

      const aiResponse = await aiService.explainConcept(concept, enhancedContext);

      res.json({
        success: aiResponse.success,
        explanation: aiResponse.reply,
        concept,
        context: enhancedContext,
        metadata: aiResponse.metadata,
      });

    } catch (error) {
      console.error('AI Explanation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Explanation service temporarily unavailable',
      });
    }
  }
);

// AI Feedback endpoint - get feedback on assignments
router.post('/feedback',
  authenticate,
  [
    body('work').notEmpty(),
    body('topic').notEmpty().trim(),
    body('context').optional().isObject(),
    body('courseId').optional().isString(),
    body('lessonId').optional().isString(),
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

      const { work, topic, context = {}, courseId, lessonId } = req.body;

      // Gather comprehensive context from database
      const databaseContext = await aiContextService.getComprehensiveContext(
        req.user._id, 
        { courseId, lessonId, ...context }
      );

      // Enhanced context with user information and database context
      const enhancedContext = {
        ...databaseContext,
        user: {
          ...databaseContext.user,
          ...context.user,
          userId: req.user._id,
        },
        course: {
          ...databaseContext.course,
          ...context.course,
        },
        lesson: {
          ...databaseContext.lesson,
          ...context.lesson,
        },
        progress: {
          ...databaseContext.progress,
          ...context.progress,
        },
        interactionType: 'assessment',
      };

      const aiResponse = await aiService.provideFeedback(work, topic, enhancedContext);

      res.json({
        success: aiResponse.success,
        feedback: aiResponse.reply,
        topic,
        context: enhancedContext,
        metadata: aiResponse.metadata,
      });

    } catch (error) {
      console.error('AI Feedback error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Feedback service temporarily unavailable',
      });
    }
  }
);

// AI Debug Help endpoint - help with debugging problems
router.post('/debug',
  authenticate,
  [
    body('problem').notEmpty().trim(),
    body('context').optional().isObject(),
    body('courseId').optional().isString(),
    body('lessonId').optional().isString(),
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

      const { problem, context = {}, courseId, lessonId } = req.body;

      // Gather comprehensive context from database
      const databaseContext = await aiContextService.getComprehensiveContext(
        req.user._id, 
        { courseId, lessonId, ...context }
      );

      // Enhanced context with user information and database context
      const enhancedContext = {
        ...databaseContext,
        user: {
          ...databaseContext.user,
          ...context.user,
          userId: req.user._id,
        },
        course: {
          ...databaseContext.course,
          ...context.course,
        },
        lesson: {
          ...databaseContext.lesson,
          ...context.lesson,
        },
        interactionType: 'debugging',
      };

      const aiResponse = await aiService.helpDebug(problem, enhancedContext);

      res.json({
        success: aiResponse.success,
        help: aiResponse.reply,
        problem,
        context: enhancedContext,
        metadata: aiResponse.metadata,
      });

    } catch (error) {
      console.error('AI Debug Help error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Debug help service temporarily unavailable',
      });
    }
  }
);

// AI Service Test endpoint
router.post('/test',
  authenticate,
  async (req, res) => {
    try {
      const testResult = await aiService.testAI();
      
      res.json({
        ...testResult,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('AI Test error:', error);
      res.status(500).json({
        success: false,
        error: 'Test failed',
        message: error.message,
      });
    }
  }
);

// Health check for AI services
router.get('/health', async (req, res) => {
  try {
    const serviceStatus = await aiService.getServiceStatus();
    
    const statusCode = serviceStatus.status === 'operational' ? 200 : 
                      serviceStatus.status === 'degraded' ? 206 : 503;

    res.status(statusCode).json({
      ...serviceStatus,
      phase: 'Phase 1 Step 3 - AI Infrastructure Setup Complete',
      nextPhase: 'Phase 2 - Context-Aware AI System Implementation',
    });

  } catch (error) {
    console.error('AI Health check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Health check failed',
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

// AI Context Analytics endpoint - get user's learning context and analytics
router.get('/context/:userId?',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.params.userId || req.user._id;
      
      // Ensure user can only access their own context (unless admin)
      if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only access your own learning context',
        });
      }

      const context = await aiContextService.getComprehensiveContext(userId);
      
      res.json({
        success: true,
        userId,
        context,
        contextStats: aiContextService.getContextStats(),
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('AI Context Analytics error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Context analytics temporarily unavailable',
      });
    }
  }
);

// AI Context Test endpoint - test context gathering with specific course/lesson
router.post('/context/test',
  authenticate,
  [
    body('courseId').optional().isString(),
    body('lessonId').optional().isString(),
  ],
  async (req, res) => {
    try {
      const { courseId, lessonId } = req.body;
      
      const context = await aiContextService.getComprehensiveContext(
        req.user._id, 
        { courseId, lessonId }
      );
      
      res.json({
        success: true,
        message: 'Context test completed successfully',
        userId: req.user._id,
        requestedContext: { courseId, lessonId },
        gatheredContext: context,
        contextQuality: {
          hasUserData: Boolean(context.user?.userId),
          hasCourseData: Boolean(context.course?.courseId),
          hasLessonData: Boolean(context.lesson?.lessonId),
          hasProgressData: Boolean(context.progress?.recent_activities?.length),
          hasAnalytics: Boolean(context.analytics?.recent_scores?.length),
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('AI Context Test error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Context test failed',
        details: error.message,
      });
    }
  }
);

// Public demo endpoint for testing AI functionality (no authentication required)
router.post('/demo', 
  [
    body('message').notEmpty().trim(),
    body('context').optional().isObject(),
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

      const { message, context = {} } = req.body;

      // Demo context for testing
      const demoContext = {
        user: {
          user_name: 'Demo User',
          learning_style: 'interactive',
          experience_level: 'beginner',
          ...context.user,
        },
        course: {
          course_title: 'Demo Course',
          course_category: 'Technology',
          ...context.course,
        },
        lesson: {
          lesson_title: 'Demo Lesson',
          lesson_number: 1,
          ...context.lesson,
        },
        ...context,
      };

      // Process message with AI service
      const aiResponse = await aiService.processContextAwareChat(
        message, 
        demoContext
      );

      res.json({
        success: aiResponse.success,
        reply: aiResponse.reply,
        demo: true,
        context: demoContext,
        metadata: aiResponse.metadata,
        note: 'This is a demo endpoint. Use /chat with authentication for full functionality.',
      });

    } catch (error) {
      console.error('AI Demo error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'AI demo service temporarily unavailable',
        reply: 'I apologize, but the demo service is currently experiencing technical difficulties.',
      });
    }
  }
);

export default router;
