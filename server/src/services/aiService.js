/**
 * AI Service - Main orchestration layer for AI functionality
 * Integrates OpenRouter API, prompt templates, and context management
 */

import openRouterService from './openrouter.js';
import apiKeyManager from './apiKeyManager.js';
import promptTemplates from './promptTemplates.js';

class AIService {
  constructor() {
    this.openRouter = openRouterService;
    this.keyManager = apiKeyManager;
    this.prompts = promptTemplates;
    
    // Default configuration
    this.defaultConfig = {
      model: 'anthropic/claude-3-haiku',
      temperature: 0.7,
      maxTokens: 1000,
      timeout: 30000,
    };
  }

  /**
   * Check if AI services are ready
   */
  async isReady() {
    try {
      const keyValidation = await this.keyManager.validateAllKeys();
      const openRouterReady = this.openRouter.isConfigured();
      
      return {
        ready: openRouterReady && keyValidation.openrouter?.valid,
        services: {
          openrouter: {
            configured: openRouterReady,
            valid: keyValidation.openrouter?.valid || false,
            error: keyValidation.openrouter?.error || null,
          },
          apiKeyManager: {
            ready: true,
          },
          promptTemplates: {
            ready: true,
            availableTemplates: this.prompts.getAvailableTemplates(),
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        ready: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }  /**
   * Process a context-aware chat message
   */
  async processContextAwareChat(userMessage, context = {}, options = {}) {
    // Check if services are ready
    const readiness = await this.isReady();
    if (!readiness.ready) {
      throw new Error(`AI services not ready: ${readiness.error || 'Configuration issues'}`);
    }

    try {
      // Build context-aware prompt
      const fullPrompt = this.prompts.buildContextAwarePrompt(userMessage, context);
      
      // Prepare messages for chat completion
      const messages = [
        {
          role: 'system',
          content: fullPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ];

      // Configure request options
      const requestOptions = {
        ...this.defaultConfig,
        ...options,
      };

      // Send to OpenRouter
      const response = await this.openRouter.createChatCompletion(messages, requestOptions);
      
      // Process and return response
      return {
        success: true,
        reply: response.choices[0]?.message?.content || '',
        metadata: {
          model: response.model,
          usage: response.usage,
          context: {
            hasUserContext: Boolean(context.user),
            hasCourseContext: Boolean(context.course),
            hasLessonContext: Boolean(context.lesson),
            hasProgressContext: Boolean(context.progress),
          },
          timestamp: new Date().toISOString(),
        },
      };

    } catch (error) {
      console.error('Context-aware chat error:', error);
      
      return {
        success: false,
        error: error.message,
        reply: this.generateFallbackResponse(userMessage, context),
        metadata: {
          fallback: true,
          originalError: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Generate explanation for a concept with context
   */
  async explainConcept(concept, context = {}, options = {}) {
    const explanationContext = {
      ...context,
      interactionType: 'explanation',
    };

    const explanationPrompt = this.prompts.buildPrompt('user', 'explanation', {
      concept,
      ...context.lesson,
      ...context.course,
      ...context.user,
    });

    return await this.processContextAwareChat(
      `Please explain: ${concept}`,
      explanationContext,
      options
    );
  }

  /**
   * Provide assessment feedback
   */
  async provideFeedback(userWork, assignmentTopic, context = {}, options = {}) {
    const feedbackContext = {
      ...context,
      interactionType: 'assessment',
    };

    const feedbackPrompt = this.prompts.buildPrompt('user', 'assessment', {
      user_work: userWork,
      assignment_topic: assignmentTopic,
      ...context.lesson,
      ...context.course,
      ...context.progress,
    });

    return await this.processContextAwareChat(
      feedbackPrompt,
      feedbackContext,
      options
    );
  }

  /**
   * Help with debugging/problem-solving
   */
  async helpDebug(problemDescription, context = {}, options = {}) {
    const debugContext = {
      ...context,
      interactionType: 'debugging',
    };

    const debugPrompt = this.prompts.buildPrompt('user', 'debugging', {
      problem_description: problemDescription,
      ...context.lesson,
      ...context.course,
      ...context.user,
    });

    return await this.processContextAwareChat(
      debugPrompt,
      debugContext,
      options
    );
  }

  /**
   * Generate a fallback response when AI services fail
   */
  generateFallbackResponse(userMessage, context = {}) {
    const courseName = context.course?.course_title || 'your course';
    const lessonName = context.lesson?.lesson_title || 'this lesson';
    
    const fallbackResponses = [
      `I apologize, but I'm temporarily unable to process your question about ${lessonName}. Please try again in a moment, or refer to the course materials for ${courseName}.`,
      
      `The AI service is currently unavailable. In the meantime, you might find helpful information in the ${courseName} resources or consider reaching out to your instructor.`,
      
      `I'm experiencing technical difficulties right now. For immediate help with ${lessonName}, please check the course documentation or discussion forums.`,
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  /**
   * Test AI functionality
   */
  async testAI() {
    try {
      const readiness = await this.isReady();
      
      if (!readiness.ready) {
        return {
          success: false,
          message: 'AI services not ready for testing',
          details: readiness,
        };
      }

      // Test basic chat functionality
      const testResponse = await this.processContextAwareChat(
        'Hello! Please confirm you are working correctly.',
        {
          user: { user_name: 'Test User' },
          course: { course_title: 'Test Course' },
          lesson: { lesson_title: 'Test Lesson' },
        },
        { maxTokens: 100, temperature: 0 }
      );

      return {
        success: testResponse.success,
        message: 'AI service test completed',
        response: testResponse.reply,
        details: {
          readiness,
          testResponse,
        },
      };

    } catch (error) {
      return {
        success: false,
        message: 'AI service test failed',
        error: error.message,
      };
    }
  }

  /**
   * Get AI service status and diagnostics
   */
  async getServiceStatus() {
    try {
      const readiness = await this.isReady();
      const keyStatus = await this.keyManager.generateStatusReport();
      
      let openRouterTest = null;
      if (readiness.ready) {
        openRouterTest = await this.openRouter.testConnection();
      }

      return {
        status: readiness.ready ? 'operational' : 'degraded',
        readiness,
        keyManagement: keyStatus,
        openRouterTest,
        configuration: {
          defaultModel: this.defaultConfig.model,
          defaultTemperature: this.defaultConfig.temperature,
          maxTokens: this.defaultConfig.maxTokens,
          timeout: this.defaultConfig.timeout,
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Update AI configuration
   */
  updateConfiguration(newConfig = {}) {
    this.defaultConfig = {
      ...this.defaultConfig,
      ...newConfig,
    };

    return {
      success: true,
      message: 'AI configuration updated',
      configuration: this.defaultConfig,
    };
  }
}

// Create a singleton instance
const aiService = new AIService();

export default aiService;
export { AIService };
