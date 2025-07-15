/**
 * AI Service - Main orchestration layer for AI functionality
 * Integrates Groq API, prompt templates, and context management
 */

import groqService from './groqService.js';
import apiKeyManager from './apiKeyManager.js';
import promptTemplates from './promptTemplates.js';

class AIService {
  constructor() {
    this.groq = groqService;
    this.keyManager = apiKeyManager;
    this.prompts = promptTemplates;
    
    // Default configuration
    this.defaultConfig = {
      model: 'llama-3.3-70b-versatile',
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
      const groqReady = this.groq.isConfigured();
      
      return {
        ready: groqReady && keyValidation.groq?.valid,
        services: {
          groq: {
            configured: groqReady,
            valid: keyValidation.groq?.valid || false,
            error: keyValidation.groq?.error || null,
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
    try {
      // Check if services are ready
      const readiness = await this.isReady();
      
      // If not ready, use fallback but don't throw error
      if (!readiness.ready) {
        console.warn('AI services not fully ready, using fallback response');
        return {
          success: false,
          reply: this.generateFallbackResponse(userMessage, context),
          metadata: {
            fallback: true,
            reason: 'AI services not ready',
            readiness: readiness,
            timestamp: new Date().toISOString(),
          },
        };
      }

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

      // Send to Groq
      const response = await this.groq.createChatCompletion(messages, requestOptions);
      
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
    const userName = context.user?.user_name || 'there';
    
    // Analyze the user message to provide contextual responses
    const messageWords = userMessage.toLowerCase().split(' ');
    
    // Programming-related keywords
    if (messageWords.some(word => ['code', 'programming', 'function', 'variable', 'loop', 'array', 'object'].includes(word))) {
      return `Hi ${userName}! I'd be happy to help with your programming question about ${lessonName}. While I'm temporarily unable to provide detailed code assistance, I recommend checking the course materials for ${courseName} or trying the interactive code examples. You can also reach out to your instructor for personalized help.`;
    }
    
    // React-related keywords
    if (messageWords.some(word => ['react', 'component', 'jsx', 'props', 'state', 'hook'].includes(word))) {
      return `Great question about React! While my AI capabilities are temporarily limited, for React-specific help with ${lessonName}, I suggest reviewing the React documentation or checking the ${courseName} code examples. The React community is also very helpful on forums like Stack Overflow.`;
    }
    
    // JavaScript-related keywords
    if (messageWords.some(word => ['javascript', 'js', 'promise', 'async', 'await', 'closure'].includes(word))) {
      return `JavaScript questions are always interesting! For ${lessonName}, you might find helpful resources in the ${courseName} materials. MDN Web Docs is also an excellent reference for JavaScript concepts. Feel free to ask your instructor for clarification on specific topics.`;
    }
    
    // General learning questions
    if (messageWords.some(word => ['how', 'what', 'why', 'explain', 'help', 'understand'].includes(word))) {
      return `I understand you're looking for help with ${lessonName}. While I'm experiencing some technical difficulties, here are some suggestions: 1) Review the course materials for ${courseName}, 2) Check any provided examples or exercises, 3) Join study groups or discussion forums, 4) Reach out to your instructor for clarification. Learning is a journey, and asking questions shows you're engaged!`;
    }
    
    // Error or debugging help
    if (messageWords.some(word => ['error', 'bug', 'debug', 'fix', 'problem', 'issue'].includes(word))) {
      return `Debugging can be challenging! While I can't analyze your specific issue right now, here's a general approach: 1) Read the error message carefully, 2) Check your syntax and variable names, 3) Use console.log to trace your code execution, 4) Break down the problem into smaller parts. The ${courseName} materials might have similar examples that could help.`;
    }
    
    // Default responses with variety
    const generalResponses = [
      `Hello ${userName}! I'm temporarily experiencing some technical difficulties, but I'm here to help you with ${lessonName}. Please try asking your question again in a moment, or check the ${courseName} resources for immediate assistance.`,
      
      `Thanks for your question about ${lessonName}! While my AI services are currently limited, you can find great information in the ${courseName} materials. I'll be back to full functionality soon to provide more personalized help.`,
      
      `I appreciate your patience! My AI capabilities are temporarily reduced, but don't let that stop your learning in ${courseName}. Check out the lesson materials, practice exercises, or connect with fellow students for support.`,
      
      `Great to see you're engaged with ${lessonName}! While I'm having some technical issues, the ${courseName} has excellent resources to help you. Consider reviewing the documentation or reaching out to your instructor for detailed guidance.`
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
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
      
      let groqTest = null;
      if (readiness.ready) {
        groqTest = await this.groq.testConnection();
      }

      return {
        status: readiness.ready ? 'operational' : 'degraded',
        readiness,
        keyManagement: keyStatus,
        groqTest,
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
