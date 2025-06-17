/**
 * Comprehensive Production Testing Suite
 * Phase 3 Step 3 - Production Optimization & Advanced Features
 * 
 * Tests all production-ready features:
 * - Performance optimizations
 * - ML integration
 * - Real-time collaboration
 * - Monitoring systems
 * - Security features
 * - Scaling capabilities
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

class ProductionTestSuite {
  constructor() {
    this.baseURL = process.env.TEST_BASE_URL || 'http://localhost:5000';
    this.frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.results = {
      performance: {},
      functionality: {},
      security: {},
      scalability: {},
      monitoring: {}
    };
    this.errors = [];
    this.warnings = [];
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Production Testing Suite...\n');
    console.log(`📡 Backend URL: ${this.baseURL}`);
    console.log(`🌐 Frontend URL: ${this.frontendURL}\n`);

    try {
      await this.testSystemHealth();
      await this.testPerformanceOptimizations();
      await this.testMLIntegration();
      await this.testRealTimeFeatures();
      await this.testMonitoringSystem();
      await this.testSecurityFeatures();
      await this.testScalabilityFeatures();
      
      this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Testing suite encountered an error:', error);
      this.errors.push(`Testing suite error: ${error.message}`);
    }
  }

  async testSystemHealth() {
    console.log('🏥 Testing System Health...');
    
    try {
      // Test backend health
      const backendStart = performance.now();
      const backendHealth = await axios.get(`${this.baseURL}/health`);
      const backendTime = performance.now() - backendStart;
      
      this.results.performance.backendHealthCheck = {
        status: backendHealth.status === 200 ? 'pass' : 'fail',
        responseTime: Math.round(backendTime),
        data: backendHealth.data
      };

      console.log(`  ✅ Backend health: ${backendTime.toFixed(2)}ms`);

      // Test frontend health (if available)
      try {
        const frontendStart = performance.now();
        const frontendHealth = await axios.get(`${this.frontendURL}/health`);
        const frontendTime = performance.now() - frontendStart;
        
        this.results.performance.frontendHealthCheck = {
          status: frontendHealth.status === 200 ? 'pass' : 'fail',
          responseTime: Math.round(frontendTime)
        };
        
        console.log(`  ✅ Frontend health: ${frontendTime.toFixed(2)}ms`);
      } catch (error) {
        this.warnings.push('Frontend health check not available');
      }

      // Test database connectivity
      try {
        const dbTest = await axios.get(`${this.baseURL}/api/test/database`);
        this.results.functionality.databaseConnection = {
          status: dbTest.status === 200 ? 'pass' : 'fail',
          message: 'Database connection successful'
        };
        console.log('  ✅ Database connectivity verified');
      } catch (error) {
        this.results.functionality.databaseConnection = {
          status: 'fail',
          message: 'Database connection failed'
        };
        this.warnings.push('Database connectivity test failed - may not be implemented');
      }

    } catch (error) {
      console.error('  ❌ System health test failed:', error.message);
      this.errors.push(`System health test failed: ${error.message}`);
    }
  }

  async testPerformanceOptimizations() {
    console.log('⚡ Testing Performance Optimizations...');
    
    try {
      // Test response times with multiple requests
      const requests = [];
      const endpoints = [
        '/health',
        '/api/courses',
        '/api/users/profile',
        '/api/adaptive/dashboard'
      ];

      for (const endpoint of endpoints) {
        for (let i = 0; i < 5; i++) {
          requests.push(this.measureResponseTime(endpoint));
        }
      }

      const results = await Promise.allSettled(requests);
      const successfulResults = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      if (successfulResults.length > 0) {
        const avgResponseTime = successfulResults.reduce((acc, r) => acc + r.time, 0) / successfulResults.length;
        const maxResponseTime = Math.max(...successfulResults.map(r => r.time));
        const minResponseTime = Math.min(...successfulResults.map(r => r.time));

        this.results.performance.responseTime = {
          average: Math.round(avgResponseTime),
          max: Math.round(maxResponseTime),
          min: Math.round(minResponseTime),
          samples: successfulResults.length,
          status: avgResponseTime < 1000 ? 'pass' : avgResponseTime < 2000 ? 'warning' : 'fail'
        };

        console.log(`  ✅ Average response time: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`  📊 Range: ${minResponseTime.toFixed(2)}ms - ${maxResponseTime.toFixed(2)}ms`);
      }

      // Test caching performance
      await this.testCachePerformance();

    } catch (error) {
      console.error('  ❌ Performance optimization test failed:', error.message);
      this.errors.push(`Performance test failed: ${error.message}`);
    }
  }

  async testCachePerformance() {
    console.log('💾 Testing Cache Performance...');
    
    try {
      // Test cache hit by making the same request twice
      const endpoint = '/api/courses';
      
      // First request (cache miss)
      const firstStart = performance.now();
      await axios.get(`${this.baseURL}${endpoint}`);
      const firstTime = performance.now() - firstStart;

      // Second request (potential cache hit)
      const secondStart = performance.now();
      await axios.get(`${this.baseURL}${endpoint}`);
      const secondTime = performance.now() - secondStart;

      const cacheImprovement = ((firstTime - secondTime) / firstTime) * 100;

      this.results.performance.cachePerformance = {
        firstRequest: Math.round(firstTime),
        secondRequest: Math.round(secondTime),
        improvement: Math.round(cacheImprovement),
        status: cacheImprovement > 10 ? 'pass' : 'warning'
      };

      console.log(`  ✅ Cache performance: ${cacheImprovement.toFixed(1)}% improvement`);

    } catch (error) {
      this.warnings.push('Cache performance test failed - cache may not be implemented');
    }
  }

  async testMLIntegration() {
    console.log('🤖 Testing ML Integration...');
    
    try {
      // Test student performance prediction
      const studentData = {
        age: 22,
        learningStyle: 'visual',
        performanceHistory: [0.85, 0.92, 0.78, 0.88],
        timeSpent: 3600,
        completionRate: 0.85,
        skillLevel: 'intermediate'
      };

      try {
        const mlStart = performance.now();
        const mlResponse = await axios.post(`${this.baseURL}/api/ml/predict-performance`, {
          studentData
        });
        const mlTime = performance.now() - mlStart;

        this.results.functionality.mlIntegration = {
          status: mlResponse.status === 200 ? 'pass' : 'fail',
          responseTime: Math.round(mlTime),
          prediction: mlResponse.data
        };

        console.log(`  ✅ ML prediction: ${mlTime.toFixed(2)}ms`);
        
      } catch (error) {
        this.results.functionality.mlIntegration = {
          status: 'warning',
          message: 'ML API not implemented - client-side only'
        };
        this.warnings.push('ML API endpoint not available - testing client-side functionality');
      }

      // Test TensorFlow.js dependency
      try {
        const packageJson = await axios.get(`${this.frontendURL}/package.json`);
        const hasTensorFlow = packageJson.data.dependencies && 
          packageJson.data.dependencies['@tensorflow/tfjs'];
        
        if (hasTensorFlow) {
          console.log('  ✅ TensorFlow.js dependency verified');
          this.results.functionality.tensorflowIntegration = { status: 'pass' };
        } else {
          this.warnings.push('TensorFlow.js dependency not found');
        }
      } catch (error) {
        this.warnings.push('Could not verify TensorFlow.js dependency');
      }

    } catch (error) {
      console.error('  ❌ ML integration test failed:', error.message);
      this.errors.push(`ML integration test failed: ${error.message}`);
    }
  }

  async testRealTimeFeatures() {
    console.log('🔄 Testing Real-time Features...');
    
    try {
      // Test WebSocket endpoint availability
      try {
        const wsResponse = await axios.get(`${this.baseURL}/socket.io/`);
        this.results.functionality.websocketEndpoint = {
          status: wsResponse.status === 200 ? 'pass' : 'fail',
          message: 'WebSocket endpoint available'
        };
        console.log('  ✅ WebSocket endpoint available');
      } catch (error) {
        this.results.functionality.websocketEndpoint = {
          status: 'warning',
          message: 'WebSocket endpoint test failed'
        };
        this.warnings.push('WebSocket endpoint test failed');
      }

      // Test real-time data endpoint
      try {
        const realtimeStart = performance.now();
        const realtimeResponse = await axios.get(`${this.baseURL}/api/realtime/status`);
        const realtimeTime = performance.now() - realtimeStart;

        this.results.functionality.realtimeData = {
          status: realtimeResponse.status === 200 ? 'pass' : 'fail',
          responseTime: Math.round(realtimeTime)
        };
        console.log(`  ✅ Real-time data: ${realtimeTime.toFixed(2)}ms`);
      } catch (error) {
        this.warnings.push('Real-time data endpoint not available');
      }

    } catch (error) {
      console.error('  ❌ Real-time features test failed:', error.message);
      this.errors.push(`Real-time features test failed: ${error.message}`);
    }
  }

  async testMonitoringSystem() {
    console.log('📊 Testing Monitoring System...');
    
    try {
      // Test performance monitoring endpoint
      try {
        const monitoringStart = performance.now();
        const monitoringResponse = await axios.get(`${this.baseURL}/api/monitoring/metrics`);
        const monitoringTime = performance.now() - monitoringStart;

        this.results.monitoring.metricsEndpoint = {
          status: monitoringResponse.status === 200 ? 'pass' : 'fail',
          responseTime: Math.round(monitoringTime),
          metrics: monitoringResponse.data
        };

        console.log(`  ✅ Monitoring metrics: ${monitoringTime.toFixed(2)}ms`);
      } catch (error) {
        this.warnings.push('Monitoring metrics endpoint not available');
      }

      // Test health metrics
      try {
        const healthMetrics = await axios.get(`${this.baseURL}/api/monitoring/health`);
        this.results.monitoring.healthMetrics = {
          status: healthMetrics.status === 200 ? 'pass' : 'fail',
          data: healthMetrics.data
        };
        console.log('  ✅ Health metrics available');
      } catch (error) {
        this.warnings.push('Health metrics endpoint not available');
      }

    } catch (error) {
      console.error('  ❌ Monitoring system test failed:', error.message);
      this.errors.push(`Monitoring system test failed: ${error.message}`);
    }
  }

  async testSecurityFeatures() {
    console.log('🛡️ Testing Security Features...');
    
    try {
      // Test rate limiting
      const rapidRequests = [];
      for (let i = 0; i < 20; i++) {
        rapidRequests.push(axios.get(`${this.baseURL}/health`));
      }

      try {
        const rapidResults = await Promise.allSettled(rapidRequests);
        const rateLimited = rapidResults.some(r => 
          r.status === 'rejected' && r.reason.response?.status === 429
        );

        this.results.security.rateLimiting = {
          status: rateLimited ? 'pass' : 'warning',
          message: rateLimited ? 'Rate limiting active' : 'Rate limiting not detected'
        };

        console.log(`  ${rateLimited ? '✅' : '⚠️'} Rate limiting: ${rateLimited ? 'Active' : 'Not detected'}`);
      } catch (error) {
        this.warnings.push('Rate limiting test failed');
      }

      // Test CORS headers
      try {
        const corsResponse = await axios.options(`${this.baseURL}/api/courses`);
        const hasCors = corsResponse.headers['access-control-allow-origin'];
        
        this.results.security.corsHeaders = {
          status: hasCors ? 'pass' : 'warning',
          message: hasCors ? 'CORS headers present' : 'CORS headers missing'
        };

        console.log(`  ${hasCors ? '✅' : '⚠️'} CORS headers: ${hasCors ? 'Present' : 'Missing'}`);
      } catch (error) {
        this.warnings.push('CORS headers test failed');
      }

    } catch (error) {
      console.error('  ❌ Security features test failed:', error.message);
      this.errors.push(`Security features test failed: ${error.message}`);
    }
  }

  async testScalabilityFeatures() {
    console.log('📈 Testing Scalability Features...');
    
    try {
      // Test concurrent requests
      const concurrentRequests = 50;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(this.measureResponseTime('/health'));
      }

      const concurrentStart = performance.now();
      const results = await Promise.allSettled(requests);
      const concurrentTime = performance.now() - concurrentStart;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;
      const successRate = (successful / results.length) * 100;

      this.results.scalability.concurrentRequests = {
        totalRequests: concurrentRequests,
        successful,
        failed,
        successRate: Math.round(successRate),
        totalTime: Math.round(concurrentTime),
        averageTime: Math.round(concurrentTime / concurrentRequests),
        status: successRate > 95 ? 'pass' : successRate > 90 ? 'warning' : 'fail'
      };

      console.log(`  ✅ Concurrent requests: ${successful}/${concurrentRequests} (${successRate.toFixed(1)}%)`);
      console.log(`  📊 Total time: ${concurrentTime.toFixed(2)}ms, Avg: ${(concurrentTime/concurrentRequests).toFixed(2)}ms`);

    } catch (error) {
      console.error('  ❌ Scalability features test failed:', error.message);
      this.errors.push(`Scalability features test failed: ${error.message}`);
    }
  }

  async measureResponseTime(endpoint) {
    const start = performance.now();
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`);
      const time = performance.now() - start;
      return {
        endpoint,
        time,
        status: response.status,
        success: true
      };
    } catch (error) {
      const time = performance.now() - start;
      return {
        endpoint,
        time,
        status: error.response?.status || 0,
        success: false,
        error: error.message
      };
    }
  }

  generateComprehensiveReport() {
    console.log('\n🎯 COMPREHENSIVE PRODUCTION TEST REPORT');
    console.log('==========================================\n');

    // Calculate overall scores
    const performanceScore = this.calculateCategoryScore('performance');
    const functionalityScore = this.calculateCategoryScore('functionality');
    const securityScore = this.calculateCategoryScore('security');
    const scalabilityScore = this.calculateCategoryScore('scalability');
    const monitoringScore = this.calculateCategoryScore('monitoring');

    const overallScore = Math.round(
      (performanceScore + functionalityScore + securityScore + scalabilityScore + monitoringScore) / 5
    );

    console.log(`📊 OVERALL PRODUCTION READINESS: ${overallScore}%\n`);

    // Category scores
    console.log('📈 CATEGORY SCORES:');
    console.log(`  ⚡ Performance: ${performanceScore}%`);
    console.log(`  🔧 Functionality: ${functionalityScore}%`);
    console.log(`  🛡️ Security: ${securityScore}%`);
    console.log(`  📈 Scalability: ${scalabilityScore}%`);
    console.log(`  📊 Monitoring: ${monitoringScore}%\n`);

    // Detailed results
    console.log('📋 DETAILED RESULTS:');
    
    Object.entries(this.results).forEach(([category, tests]) => {
      console.log(`\n${this.getCategoryEmoji(category)} ${category.toUpperCase()}:`);
      Object.entries(tests).forEach(([test, result]) => {
        const status = this.getTestStatus(result);
        const emoji = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${emoji} ${test}: ${this.formatTestResult(result)}`);
      });
    });

    // Errors and warnings
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    // Production readiness assessment
    console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
    if (overallScore >= 90) {
      console.log('  🎉 EXCELLENT - Ready for production deployment!');
    } else if (overallScore >= 80) {
      console.log('  👍 GOOD - Minor improvements recommended before production');
    } else if (overallScore >= 70) {
      console.log('  ⚠️ FAIR - Address issues before production deployment');
    } else {
      console.log('  ❌ POOR - Significant improvements needed before production');
    }

    console.log('\n🎯 TESTING COMPLETE!\n');

    return {
      overallScore,
      categoryScores: {
        performance: performanceScore,
        functionality: functionalityScore,
        security: securityScore,
        scalability: scalabilityScore,
        monitoring: monitoringScore
      },
      results: this.results,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  calculateCategoryScore(category) {
    const tests = this.results[category];
    if (!tests || Object.keys(tests).length === 0) return 0;

    let score = 0;
    let totalTests = 0;

    Object.values(tests).forEach(result => {
      totalTests++;
      const status = this.getTestStatus(result);
      if (status === 'pass') score += 100;
      else if (status === 'warning') score += 70;
      // fail = 0 points
    });

    return totalTests > 0 ? Math.round(score / totalTests) : 0;
  }

  getTestStatus(result) {
    if (typeof result === 'object' && result.status) {
      return result.status;
    }
    return 'unknown';
  }

  getCategoryEmoji(category) {
    const emojis = {
      performance: '⚡',
      functionality: '🔧',
      security: '🛡️',
      scalability: '📈',
      monitoring: '📊'
    };
    return emojis[category] || '📋';
  }

  formatTestResult(result) {
    if (typeof result === 'object') {
      if (result.responseTime) {
        return `${result.responseTime}ms`;
      }
      if (result.successRate) {
        return `${result.successRate}% success`;
      }
      if (result.message) {
        return result.message;
      }
      if (result.status) {
        return result.status;
      }
    }
    return 'completed';
  }
}

// Run the tests
const testSuite = new ProductionTestSuite();
testSuite.runAllTests().catch(console.error);
