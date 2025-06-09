import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { config } from '../config/environment.js';

const router = Router();

// AI Chat endpoint - placeholder for context-aware AI system
router.post('/chat', 
  authenticate,
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

      // TODO: Implement OpenRouter integration in Phase 2
      // For now, return a placeholder response
      const response = {
        reply: `I received your message: "${message}". The AI system will be fully implemented in Phase 2 with context-aware capabilities.`,
        context: {
          userId: req.user?._id,
          timestamp: new Date().toISOString(),
          messageLength: message.length,
          ...context,
        },
        aiModel: 'placeholder',
        usage: {
          tokensUsed: 0,
          estimatedCost: 0,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'AI service temporarily unavailable',
      });
    }
  }
);

// Health check for AI services
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'operational',
      services: {
        openai: config.ai.openaiApiKey ? 'configured' : 'not_configured',
        openrouter: config.ai.openrouterApiKey ? 'configured' : 'not_configured',
      },
      timestamp: new Date().toISOString(),
      phase: 'Phase 1 - Basic Setup',
      nextPhase: 'Phase 2 - AI Infrastructure Implementation',
    };

    res.json(health);
  } catch (error) {
    console.error('AI Health check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Health check failed',
    });
  }
});

export default router;
