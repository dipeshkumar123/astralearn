// AI Service for Frontend - Connects to Orchestrated AI Backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class AIService {  // Orchestrated Chat - Context-aware conversation
  static async chat({ message, context = {} }) {
    try {
      const response = await api.post('/ai/orchestrated/chat', {
        content: message, // Backend expects 'content' not 'message'
        context,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Chat failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get personalized recommendations
  static async getRecommendations({ userId, context = {}, type = 'general' }) {
    try {
      const response = await api.post('/ai/orchestrated/recommendations', {
        userId,
        context,
        type,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Recommendations failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Generate personalized study plan
  static async createStudyPlan({ userId, goals, timeAvailable, preferences = {} }) {
    try {
      const response = await api.post('/ai/orchestrated/study-plan', {
        userId,
        goals,
        timeAvailable,
        preferences,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Study plan creation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get explanation for specific content
  static async explainContent({ content, level = 'intermediate', context = {} }) {
    try {
      const response = await api.post('/ai/orchestrated/explain', {
        content,
        level,
        context,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Explanation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get feedback on user's work
  static async getFeedback({ userResponse, correctAnswer, context = {} }) {
    try {
      const response = await api.post('/ai/orchestrated/feedback', {
        userResponse,
        correctAnswer,
        context,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Feedback failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Assess learning style
  static async assessLearningStyle({ responses, userId }) {
    try {
      const response = await api.post('/ai/orchestrated/assess-learning-style', {
        responses,
        userId,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Learning style assessment failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Check AI health status
  static async checkHealth() {
    try {
      const response = await api.get('/ai/orchestrated/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get AI suggestions for current context
  static async getSuggestions({ context, type = 'help' }) {
    try {
      // Use chat endpoint with specific prompting for suggestions
      const response = await this.chat({
        message: `Provide ${type} suggestions for the current context`,
        context: {
          ...context,
          requestType: 'suggestions',
          suggestionType: type
        }
      });
      return response;
    } catch (error) {
      throw new Error(`Suggestions failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Stream chat response (for real-time typing effect)
  static async streamChat({ message, context = {}, onChunk }) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/orchestrated/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },        body: JSON.stringify({
          content: message, // Backend expects 'content' not 'message'
          context: {
            ...context,
            stream: true
          },
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        result += chunk;
        
        if (onChunk) {
          onChunk(chunk, result);
        }
      }

      return { response: result, success: true };
    } catch (error) {
      throw new Error(`Stream chat failed: ${error.message}`);
    }
  }
}

export default AIService;
