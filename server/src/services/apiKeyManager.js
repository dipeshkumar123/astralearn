/**
 * API Key Management Service
 * Handles validation, storage, and rotation of API keys
 */

import { config } from '../config/environment.js';

class ApiKeyManager {
  constructor() {
    this.supportedProviders = {
      groq: {
        name: 'Groq',
        keyPattern: /^gsk_[a-zA-Z0-9]{52}$/,
        testEndpoint: '/models',
        required: true,
      },
    };
  }

  /**
   * Validate API key format for a specific provider
   */
  validateKeyFormat(provider, apiKey) {
    const providerConfig = this.supportedProviders[provider];
    
    if (!providerConfig) {
      throw new Error(`Unsupported API provider: ${provider}`);
    }

    if (!apiKey) {
      return {
        valid: false,
        error: `${providerConfig.name} API key is required`,
        provider,
      };
    }

    const isValidFormat = providerConfig.keyPattern.test(apiKey);
    
    return {
      valid: isValidFormat,
      error: isValidFormat ? null : `Invalid ${providerConfig.name} API key format`,
      provider,
      masked: this.maskApiKey(apiKey),
    };
  }

  /**
   * Mask API key for safe logging/display
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) return '****';
    
    const start = apiKey.substring(0, 8);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '*'.repeat(Math.max(0, apiKey.length - 12));
    
    return `${start}${middle}${end}`;
  }

  /**
   * Get all configured API keys status
   */
  getApiKeysStatus() {
    const status = {};
    
    // Check Groq
    const groqKey = config.ai.groqApiKey;
    status.groq = {
      ...this.validateKeyFormat('groq', groqKey),
      configured: Boolean(groqKey),
      environment: 'GROQ_API_KEY',
    };

    return status;
  }

  /**
   * Test API key validity by making a test request
   */
  async testApiKey(provider, apiKey) {
    const providerConfig = this.supportedProviders[provider];
    
    if (!providerConfig) {
      throw new Error(`Unsupported API provider: ${provider}`);
    }

    // First validate format
    const formatValidation = this.validateKeyFormat(provider, apiKey);
    if (!formatValidation.valid) {
      return {
        valid: false,
        error: formatValidation.error,
        provider,
      };
    }

    try {
      let baseUrl;
      let headers;

      switch (provider) {
        case 'groq':
          baseUrl = 'https://api.groq.com/openai/v1';
          headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          };
          break;
          
        default:
          throw new Error(`Test not implemented for provider: ${provider}`);
      }

      const response = await fetch(`${baseUrl}${providerConfig.testEndpoint}`, {
        method: 'GET',
        headers,
        timeout: 10000,
      });

      if (response.ok) {
        return {
          valid: true,
          provider,
          status: response.status,
          message: `${providerConfig.name} API key is valid`,
          masked: this.maskApiKey(apiKey),
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          valid: false,
          provider,
          status: response.status,
          error: errorData.error?.message || `${providerConfig.name} API key validation failed`,
          masked: this.maskApiKey(apiKey),
        };
      }

    } catch (error) {
      return {
        valid: false,
        provider,
        error: `Network error testing ${providerConfig.name} API key: ${error.message}`,
        masked: this.maskApiKey(apiKey),
      };
    }
  }

  /**
   * Validate all configured API keys
   */
  async validateAllKeys() {
    const results = {};
    const status = this.getApiKeysStatus();

    for (const [provider, keyStatus] of Object.entries(status)) {
      if (keyStatus.configured) {
        const apiKey = config.ai.groqApiKey;
          
        results[provider] = await this.testApiKey(provider, apiKey);
      } else {
        results[provider] = {
          valid: false,
          configured: false,
          error: `${keyStatus.provider} API key not configured`,
          required: this.supportedProviders[provider]?.required || false,
        };
      }
    }

    return results;
  }

  /**
   * Get security recommendations for API key management
   */
  getSecurityRecommendations() {
    return {
      recommendations: [
        'Store API keys in environment variables, never in code',
        'Use separate API keys for development and production environments',
        'Regularly rotate API keys',
        'Monitor API usage for unusual patterns',
        'Implement rate limiting to prevent key abuse',
        'Use least-privilege access when configuring API keys',
      ],
      environmentFiles: [
        'server/.env (for local development)',
        'server/.env.production (for production deployment)',
        'Never commit .env files to version control',
      ],
      keyFormats: Object.entries(this.supportedProviders).map(([key, config]) => ({
        provider: key,
        name: config.name,
        pattern: config.keyPattern.toString(),
        required: config.required,
      })),
    };
  }

  /**
   * Generate a report of current API configuration status
   */
  async generateStatusReport() {
    const keyStatus = this.getApiKeysStatus();
    const validationResults = await this.validateAllKeys();
    const recommendations = this.getSecurityRecommendations();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProviders: Object.keys(this.supportedProviders).length,
        configuredProviders: Object.values(keyStatus).filter(k => k.configured).length,
        validProviders: Object.values(validationResults).filter(k => k.valid).length,
        requiredProviders: Object.values(this.supportedProviders).filter(p => p.required).length,
      },
      providers: {},
      recommendations,
    };

    for (const [provider, validation] of Object.entries(validationResults)) {
      report.providers[provider] = {
        ...keyStatus[provider],
        ...validation,
        required: this.supportedProviders[provider].required,
      };
    }

    return report;
  }
}

// Create a singleton instance
const apiKeyManager = new ApiKeyManager();

export default apiKeyManager;
export { ApiKeyManager };
