class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  startTimer(operationId) {
    this.startTimes.set(operationId, performance.now());
  }

  endTimer(operationId, metadata = {}) {
    const startTime = this.startTimes.get(operationId);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationId}`);
      return null;
    }

    const duration = performance.now() - startTime;
    const metric = {
      operationId,
      duration,
      timestamp: Date.now(),
      ...metadata
    };

    this.metrics.set(operationId, metric);
    this.startTimes.delete(operationId);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${operationId} took ${duration.toFixed(2)}ms`);
    }

    return metric;
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }

  getMetricsByType(type) {
    return this.getMetrics().filter(metric => metric.type === type);
  }

  getAverageTime(operationType) {
    const metrics = this.getMetricsByType(operationType);
    if (metrics.length === 0) return 0;
    
    const totalTime = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalTime / metrics.length;
  }

  clearMetrics() {
    this.metrics.clear();
    this.startTimes.clear();
  }

  // Monitor React component render times
  measureComponentRender(componentName, renderFn) {
    const operationId = `component-render-${componentName}-${Date.now()}`;
    this.startTimer(operationId);
    
    const result = renderFn();
    
    this.endTimer(operationId, {
      type: 'component-render',
      component: componentName
    });

    return result;
  }

  // Monitor API call performance
  async measureApiCall(endpoint, apiCall) {
    const operationId = `api-call-${endpoint}-${Date.now()}`;
    this.startTimer(operationId);

    try {
      const result = await apiCall();
      this.endTimer(operationId, {
        type: 'api-call',
        endpoint,
        success: true
      });
      return result;
    } catch (error) {
      this.endTimer(operationId, {
        type: 'api-call',
        endpoint,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  // Monitor adaptive learning algorithm performance
  measureAdaptiveAlgorithm(algorithmName, algorithm) {
    const operationId = `adaptive-algorithm-${algorithmName}-${Date.now()}`;
    this.startTimer(operationId);
    
    const result = algorithm();
    
    this.endTimer(operationId, {
      type: 'adaptive-algorithm',
      algorithm: algorithmName
    });

    return result;
  }

  // Get performance summary
  getSummary() {
    const metrics = this.getMetrics();
    const summary = {
      totalOperations: metrics.length,
      averageResponseTime: metrics.length > 0 ? 
        metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length : 0,
      slowOperations: metrics.filter(m => m.duration > 1000).length,
      componentRenders: this.getMetricsByType('component-render').length,
      apiCalls: this.getMetricsByType('api-call').length,
      adaptiveAlgorithms: this.getMetricsByType('adaptive-algorithm').length
    };

    return summary;
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: this.getMetrics(),
      summary: this.getSummary()
    };
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const measureRender = (componentName, renderFn) => {
    return performanceMonitor.measureComponentRender(componentName, renderFn);
  };

  const measureApi = async (endpoint, apiCall) => {
    return performanceMonitor.measureApiCall(endpoint, apiCall);
  };

  const getMetrics = () => performanceMonitor.getMetrics();
  const getSummary = () => performanceMonitor.getSummary();

  return {
    measureRender,
    measureApi,
    getMetrics,
    getSummary,
    startTimer: (id) => performanceMonitor.startTimer(id),
    endTimer: (id, metadata) => performanceMonitor.endTimer(id, metadata)
  };
};

export default performanceMonitor;
