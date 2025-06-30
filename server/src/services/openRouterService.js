/**
 * OpenRouter Service - Direct Integration with OpenRouter API
 * Part of Phase 1 Step 3: AI Infrastructure
 */

import axios from 'axios';
import { config } from '../config/environment.js';

class OpenRouterService {
  constructor() {
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.defaultModel = 'anthropic/claude-3-haiku';
    this.requestTimeout = 30000;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    
    this.isConfigured = Boolean(this.apiKey);
    
    if (!this.isConfigured) {
      console.warn('⚠️  OpenRouter API key not configured. AI features will use fallback responses.');
    }
  }

  /**
   * Create chat completion using OpenRouter API
   */
  async createChatCompletion(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('OpenRouter API key not configured');
    }

    const requestData = {
      model: options.model || this.defaultModel,
      messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 1,
      frequency_penalty: options.frequencyPenalty || 0,
      presence_penalty: options.presencePenalty || 0,
      stream: options.stream || false,
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
      'X-Title': process.env.YOUR_SITE_NAME || 'AstraLearn',
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          requestData,
          {
            headers,
            timeout: this.requestTimeout,
          }
        );

        return {
          ...response.data,
          usage: response.data.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
          model: response.data.model || requestData.model,
        };

      } catch (error) {
        const isLastAttempt = attempt === this.retryAttempts;
        
        if (error.response?.status === 429) {
          // Rate limit - wait longer before retry
          if (!isLastAttempt) {
            await this.delay(this.retryDelay * attempt * 2);
            continue;
          }
        }
        
        if (error.response?.status >= 500 && !isLastAttempt) {
          // Server error - retry with delay
          await this.delay(this.retryDelay * attempt);
          continue;
        }

        // Log error details
        console.error(`OpenRouter API error (attempt ${attempt}):`, {
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message,
          model: requestData.model,
        });

        if (isLastAttempt) {
          throw new Error(
            `OpenRouter API failed after ${this.retryAttempts} attempts: ${
              error.response?.data?.error?.message || error.message
            }`
          );
        }
      }
    }
  }

  /**
   * Test OpenRouter connection
   */
  async testConnection() {
    try {
      const testMessages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Respond briefly.',
        },
        {
          role: 'user',
          content: 'Say "Hello from AstraLearn!" to test the connection.',
        },
      ];

      const response = await this.createChatCompletion(testMessages, {
        max_tokens: 50,
        temperature: 0.1,
      });

      return {
        success: true,
        message: 'OpenRouter connection successful',
        response: response.choices[0]?.message?.content || 'Connection test completed',
        model: response.model,
        usage: response.usage,
      };

    } catch (error) {
      return {
        success: false,
        message: 'OpenRouter connection failed',
        error: error.message,
      };
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels() {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'API key not configured',
        models: [],
      };
    }

    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      });

      return {
        success: true,
        models: response.data.data || [],
        count: response.data.data?.length || 0,
      };

    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error.message);
      return {
        success: false,
        error: error.message,
        models: [],
      };
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'Not configured',
      baseURL: this.baseURL,
      defaultModel: this.defaultModel,
      timeout: this.requestTimeout,
      retryAttempts: this.retryAttempts,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    if (newConfig.apiKey) {
      this.apiKey = newConfig.apiKey;
      this.isConfigured = Boolean(this.apiKey);
    }
    if (newConfig.defaultModel) {
      this.defaultModel = newConfig.defaultModel;
    }
    if (newConfig.timeout) {
      this.requestTimeout = newConfig.timeout;
    }
    if (newConfig.retryAttempts) {
      this.retryAttempts = newConfig.retryAttempts;
    }

    console.log('OpenRouter configuration updated');
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create and export singleton instance
const openRouterService = new OpenRouterService();

export default openRouterService;
export { OpenRouterService };
