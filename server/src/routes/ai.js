import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { config } from '../config/environment.js';
import aiService from '../services/aiService.js';
import aiContextService from '../services/aiContextService.js';
import aiOrchestrator from '../services/aiOrchestrator.js';

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

// === PHASE 2 STEP 2: AI ORCHESTRATION LAYER ENDPOINTS ===

// Orchestrated AI Chat - Enhanced with learning style adaptation
router.post('/orchestrated/chat', 
  authenticate,
  [
    body('content').notEmpty().trim(),
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

      const { content, context = {}, courseId, lessonId } = req.body;

      // Use AI Orchestrator for enhanced, personalized responses
      const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
        type: 'chat',
        userId: req.user._id,
        content,
        context: { courseId, lessonId, ...context },
        options: {},
      });

      res.json({
        success: orchestratedResponse.success,
        reply: orchestratedResponse.response?.reply || orchestratedResponse.fallbackResponse?.message,
        response: orchestratedResponse.response,
        metadata: orchestratedResponse.metadata,
        personalizedSuggestions: orchestratedResponse.response?.personalizedSuggestions,
        learningStyleEnhancements: {
          visual: orchestratedResponse.response?.visualSuggestions,
          auditory: orchestratedResponse.response?.auditorySuggestions,
          kinesthetic: orchestratedResponse.response?.kinestheticSuggestions,
          reading: orchestratedResponse.response?.readingSuggestions,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Orchestrated AI Chat error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'AI chat service temporarily unavailable',
      });
    }
  }
);

// Personalized Learning Recommendations
router.get('/orchestrated/recommendations', 
  authenticate,
  async (req, res) => {
    try {
      const { courseId, lessonId } = req.query;

      const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
        type: 'recommendation',
        userId: req.user._id,
        content: 'Generate personalized learning recommendations',
        context: { courseId, lessonId },
        options: {},
      });

      res.json({
        success: orchestratedResponse.success,
        recommendations: orchestratedResponse.response?.reply,
        personalizedFor: orchestratedResponse.metadata?.learningStyleAdapted,
        configUsed: orchestratedResponse.metadata?.configUsed,
        contextQuality: orchestratedResponse.metadata?.contextQuality,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('AI Recommendations error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Recommendation service temporarily unavailable',
      });
    }
  }
);

// Adaptive Study Plan Generation
router.post('/orchestrated/study-plan', 
  authenticate,
  [
    body('goals').isArray().withMessage('Goals must be an array'),
    body('timeframe').optional().isString(),
    body('courseId').optional().isString(),
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

      const { goals, timeframe = 'week', courseId } = req.body;

      const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
        type: 'study_plan',
        userId: req.user._id,
        content: { goals, timeframe },
        context: { courseId },
        options: {},
      });

      res.json({
        success: orchestratedResponse.success,
        studyPlan: orchestratedResponse.response?.reply,
        adaptedFor: {
          learningStyle: orchestratedResponse.metadata?.learningStyleAdapted,
          performanceLevel: orchestratedResponse.metadata?.configUsed?.performanceAdjusted,
        },
        personalizedSuggestions: orchestratedResponse.response?.personalizedSuggestions,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('AI Study Plan error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Study plan service temporarily unavailable',
      });
    }
  }
);

// Adaptive Concept Explanation
router.post('/orchestrated/explain', 
  authenticate,
  [
    body('concept').notEmpty().trim(),
    body('courseId').optional().isString(),
    body('lessonId').optional().isString(),
    body('difficulty').optional().isIn(['basic', 'intermediate', 'advanced']),
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

      const { concept, courseId, lessonId, difficulty } = req.body;

      const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
        type: 'explanation',
        userId: req.user._id,
        content: concept,
        context: { courseId, lessonId, requestedDifficulty: difficulty },
        options: {},
      });

      res.json({
        success: orchestratedResponse.success,
        explanation: orchestratedResponse.response?.reply,
        concept,
        adaptedFor: {
          learningStyle: orchestratedResponse.metadata?.learningStyleAdapted,
          difficulty: difficulty || 'adaptive',
        },
        learningStyleEnhancements: {
          visual: orchestratedResponse.response?.visualSuggestions,
          auditory: orchestratedResponse.response?.auditorySuggestions,
          kinesthetic: orchestratedResponse.response?.kinestheticSuggestions,
          reading: orchestratedResponse.response?.readingSuggestions,
        },
        contextQuality: orchestratedResponse.metadata?.contextQuality,
        timestamp: new Date().toISOString(),
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

// Personalized Feedback on Assignments/Exercises
router.post('/orchestrated/feedback', 
  authenticate,
  [
    body('work').notEmpty().withMessage('Work content is required'),
    body('assignmentType').optional().isString(),
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

      const { work, assignmentType, courseId, lessonId } = req.body;

      const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
        type: 'feedback',
        userId: req.user._id,
        content: { work, assignmentType },
        context: { courseId, lessonId },
        options: {},
      });

      res.json({
        success: orchestratedResponse.success,
        feedback: orchestratedResponse.response?.reply,
        adaptedFor: {
          learningStyle: orchestratedResponse.metadata?.learningStyleAdapted,
          performanceLevel: orchestratedResponse.metadata?.configUsed?.performanceAdjusted,
        },
        personalizedSuggestions: orchestratedResponse.response?.personalizedSuggestions,
        encouragementLevel: orchestratedResponse.metadata?.configUsed?.supportLevel,
        timestamp: new Date().toISOString(),
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

// Learning Style Assessment with AI Analysis
router.post('/orchestrated/assess-learning-style', 
  authenticate,
  [
    body('responses').isArray().withMessage('Responses must be an array'),
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

      const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
        type: 'assessment',
        userId: req.user._id,
        content: { assessmentType: 'learning_style', responses },
        context: {},
        options: {},
      });

      res.json({
        success: orchestratedResponse.success,
        analysis: orchestratedResponse.response?.reply,
        detectedLearningStyle: orchestratedResponse.metadata?.configUsed?.personalizedFor,
        confidence: orchestratedResponse.metadata?.contextQuality?.score || 0,
        recommendations: orchestratedResponse.response?.personalizedSuggestions,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('AI Learning Style Assessment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Learning style assessment temporarily unavailable',
      });
    }
  }
);

// AI Orchestrator Health Check
router.get('/orchestrated/health', 
  authenticate,
  async (req, res) => {
    try {
      // Test orchestrator with a simple request
      const testResponse = await aiOrchestrator.orchestrateRequest({
        type: 'chat',
        userId: req.user._id,
        content: 'Health check',
        context: {},
        options: {},
      });

      res.json({
        orchestratorStatus: 'operational',
        testRequestSuccessful: testResponse.success,
        learningStyleConfigs: Object.keys(aiOrchestrator.learningStyleConfigs),
        cacheSize: aiOrchestrator.responseCache.size,
        performanceThresholds: aiOrchestrator.performanceThresholds,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('AI Orchestrator Health Check error:', error);
      res.status(500).json({
        orchestratorStatus: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
