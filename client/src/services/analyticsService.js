/**
 * Analytics Service - Frontend API Integration
 * 
 * Provides centralized access to all analytics endpoints with proper
 * error handling, caching, and data transformation for frontend components.
 */

const API_BASE = 'http://localhost:5000/api';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Make an authenticated API call
   */
  async apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get from cache if available and fresh
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   */
  setCache(key, data, timeout = null) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout: timeout || this.cacheTimeout
    });
  }

  /**
   * Get analytics summary data
   */
  async getSummary(refresh = false) {
    const cacheKey = 'analytics_summary';
    
    if (!refresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const data = await this.apiCall('/analytics/summary');
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch analytics summary:', error);
      throw error;
    }
  }

  /**
   * Get personalized learning insights
   */
  async getPersonalizedInsights(refresh = false) {
    const cacheKey = 'personalized_insights';
    
    if (!refresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const data = await this.apiCall('/analytics/insights/personalized');
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch personalized insights:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(timeframe = 30, courseId = null, refresh = false) {
    const cacheKey = `performance_metrics_${timeframe}_${courseId || 'all'}`;
    
    if (!refresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      let endpoint = `/analytics/metrics/performance?timeframe=${timeframe}`;
      if (courseId) {
        endpoint += `&courseId=${courseId}`;
      }
      
      const data = await this.apiCall(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get learning patterns analysis
   */
  async getLearningPatterns(timeframe = 30, analysisType = 'overview', refresh = false) {
    const cacheKey = `learning_patterns_${timeframe}_${analysisType}`;
    
    if (!refresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const endpoint = `/analytics/patterns/analyze?timeframe=${timeframe}&analysisType=${analysisType}`;
      const data = await this.apiCall(endpoint);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch learning patterns:', error);
      throw error;
    }
  }

  /**
   * Track learning behavior
   */
  async trackLearningBehavior(sessionData, context = {}) {
    try {
      return await this.apiCall('/analytics/track/behavior', {
        method: 'POST',
        body: JSON.stringify({ sessionData, context })
      });
    } catch (error) {
      console.error('Failed to track learning behavior:', error);
      throw error;
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getDashboardData(timeframe = 7, refresh = false) {
    const cacheKey = `dashboard_data_${timeframe}`;
    
    if (!refresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const endpoint = `/analytics/dashboard?timeframe=${timeframe}`;
      const data = await this.apiCall(endpoint);
      // Use a shorter cache timeout for real-time data
      this.setCache(cacheKey, data, 2 * 60 * 1000); // 2 minutes
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Clear all cached analytics data
   */
  clearCache() {
    this.cache.clear();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
