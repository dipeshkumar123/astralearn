/**
 * OpenRouter API Integration Service
 * Handles communication with OpenRouter AI models
 */

import { config } from '../config/environment.js';

// Ensure fetch is available (Node.js 18+ has built-in fetch)
const fetchApi = global.fetch || (async () => {
  const { default: fetch } = await import('node-fetch');
  return fetch;
})();

class OpenRouterService {
  constructor() {
    this.apiKey = config.ai.openrouterApiKey;
    this.baseUrl = config.ai.openrouterBaseUrl;
    this.defaultModel = 'anthropic/claude-3-haiku';
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Check if OpenRouter is properly configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.baseUrl);
  }
  /**
   * Get available models from OpenRouter
   */
  async getAvailableModels() {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const fetchFn = typeof fetch !== 'undefined' ? fetch : await fetchApi;
      const response = await fetchFn(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw error;
    }
  }

  /**
   * Send a chat completion request to OpenRouter
   */
  async createChatCompletion(messages, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }

    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
      retries = this.maxRetries,
    } = options;

    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    let lastError;
      for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const fetchFn = typeof fetch !== 'undefined' ? fetch : await fetchApi;
        const response = await fetchFn(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://astralearn.app',
            'X-Title': 'AstraLearn - Context-Aware LMS',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // Add usage tracking
        const usage = {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
          model: data.model || model,
          timestamp: new Date().toISOString(),
        };

        return {
          ...data,
          usage,
        };

      } catch (error) {
        lastError = error;
        
        if (attempt < retries) {
          console.warn(`OpenRouter API attempt ${attempt + 1} failed, retrying in ${this.retryDelay}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Generate a simple text completion
   */
  async generateText(prompt, options = {}) {
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await this.createChatCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Test the OpenRouter connection
   */
  async testConnection() {
    try {
      const testMessages = [
        {
          role: 'user',
          content: 'Say "Hello from AstraLearn!" and nothing else.',
        },
      ];

      const response = await this.createChatCompletion(testMessages, {
        maxTokens: 50,
        temperature: 0,
      });

      return {
        success: true,
        message: 'OpenRouter connection successful',
        response: response.choices[0]?.message?.content || '',
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
   * Get current API usage/credits (if supported by OpenRouter)
   */
  async getUsage() {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }    try {
      const fetchFn = typeof fetch !== 'undefined' ? fetch : await fetchApi;
      const response = await fetchFn(`${this.baseUrl}/auth/key`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching OpenRouter usage:', error);
      return {
        error: error.message,
        available: false,
      };
    }
  }
}

// Create a singleton instance
const openRouterService = new OpenRouterService();

export default openRouterService;
export { OpenRouterService };
