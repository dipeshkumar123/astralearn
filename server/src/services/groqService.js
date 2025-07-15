/**
 * Groq API Integration Service
 * Handles communication with Groq AI models
 */

import Groq from 'groq-sdk';
import { config } from '../config/environment.js';

class GroqService {
  constructor() {
    this.apiKey = config.ai.groqApiKey;
    this.defaultModel = 'llama-3.3-70b-versatile';
    this.maxRetries = 3;
    this.retryDelay = 1000;
    
    // Initialize Groq client if API key is available
    if (this.apiKey) {
      this.client = new Groq({
        apiKey: this.apiKey,
        maxRetries: this.maxRetries,
      });
    } else {
      console.warn('⚠️  Groq API key not configured. AI features will use fallback responses.');
    }
  }

  /**
   * Check if Groq is properly configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.client);
  }

  /**
   * Get available models from Groq
   */
  async getAvailableModels() {
    if (!this.isConfigured()) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await this.client.models.list();
      return response.data.filter(model => model.active);
    } catch (error) {
      console.error('❌ Failed to fetch Groq models:', error.message);
      throw error;
    }
  }

  /**
   * Send a chat completion request to Groq
   */
  async createChatCompletion(messages, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Groq API key not configured');
    }

    const requestData = {
      model: options.model || this.defaultModel,
      messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      top_p: options.topP || 1,
      frequency_penalty: options.frequencyPenalty || 0,
      presence_penalty: options.presencePenalty || 0,
      stream: options.stream || false,
    };

    // Remove undefined/null values
    Object.keys(requestData).forEach(key => {
      if (requestData[key] === undefined || requestData[key] === null) {
        delete requestData[key];
      }
    });

    try {
      console.log('🤖 Making Groq API request:', {
        model: requestData.model,
        messageCount: messages.length,
        maxTokens: requestData.max_tokens,
        temperature: requestData.temperature
      });

      const response = await this.client.chat.completions.create(requestData);
      
      console.log('✅ Groq API response received:', {
        model: response.model,
        usage: response.usage,
        finishReason: response.choices[0]?.finish_reason
      });

      return response;
    } catch (error) {
      console.error('❌ Groq API request failed:', {
        error: error.message,
        status: error.status,
        type: error.type
      });
      
      // Handle specific Groq errors
      if (error.status === 401) {
        throw new Error('Invalid Groq API key');
      } else if (error.status === 429) {
        throw new Error('Groq API rate limit exceeded');
      } else if (error.status >= 500) {
        throw new Error('Groq API server error');
      }
      
      throw error;
    }
  }

  /**
   * Generate a simple text completion
   */
  async generateText(prompt, options = {}) {
    const messages = [
      { role: 'user', content: prompt }
    ];
    
    const response = await this.createChatCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Test the Groq connection
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Groq API key not configured'
      };
    }

    try {
      const models = await this.getAvailableModels();
      return {
        success: true,
        modelsCount: models.length,
        defaultModel: this.defaultModel,
        availableModels: models.slice(0, 5).map(m => m.id) // First 5 models
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get service health and status
   */
  async getServiceHealth() {
    const health = {
      service: 'Groq',
      configured: this.isConfigured(),
      defaultModel: this.defaultModel,
    };

    if (this.isConfigured()) {
      try {
        const testResult = await this.testConnection();
        health.connectionTest = testResult;
        health.status = testResult.success ? 'healthy' : 'unhealthy';
      } catch (error) {
        health.connectionTest = { success: false, error: error.message };
        health.status = 'unhealthy';
      }
    } else {
      health.status = 'not_configured';
    }

    return health;
  }

  /**
   * Update service configuration
   */
  updateConfiguration(newConfig = {}) {
    if (newConfig.defaultModel) {
      this.defaultModel = newConfig.defaultModel;
    }
    if (newConfig.maxRetries !== undefined) {
      this.maxRetries = newConfig.maxRetries;
    }
    if (newConfig.retryDelay !== undefined) {
      this.retryDelay = newConfig.retryDelay;
    }

    console.log('🔧 Groq service configuration updated:', {
      defaultModel: this.defaultModel,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay
    });
  }
}

// Create a singleton instance
const groqService = new GroqService();

export default groqService;
export { GroqService };
