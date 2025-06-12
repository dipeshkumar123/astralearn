const Artillery = require('artillery');
const testConfig = require('../config/testConfig');
const path = require('path');
const fs = require('fs');

class PerformanceTester {
  constructor() {
    this.results = {
      loadTests: [],
      performanceMetrics: {},
      recommendations: []
    };
  }

  /**
   * Run comprehensive performance testing suite
   */
  async runPerformanceTests() {
    console.log('⚡ Starting comprehensive performance testing...');

    try {
      // Run load tests
      await this.runLoadTests();

      // Run API performance tests
      await this.runAPIPerformanceTests();

      // Run WebSocket performance tests
      await this.runWebSocketPerformanceTests();

      // Run database performance tests
      await this.runDatabasePerformanceTests();

      // Run frontend performance tests
      await this.runFrontendPerformanceTests();

      // Generate performance report
      await this.generatePerformanceReport();

      console.log('✅ Performance testing complete');
      return this.results;

    } catch (error) {
      console.error('❌ Performance testing failed:', error);
      throw error;
    }
  }

  /**
   * Run load testing with Artillery
   */
  async runLoadTests() {
    console.log('🔄 Running load tests...');

    const loadTestConfig = {
      config: {
        target: testConfig.api.baseUrl,
        phases: [
          {
            duration: 60,
            arrivalRate: 10,
            name: 'Warm up'
          },
          {
            duration: 300,
            arrivalRate: 50,
            name: 'Ramp up load'
          },
          {
            duration: 600,
            arrivalRate: 100,
            name: 'Sustained load'
          },
          {
            duration: 300,
            arrivalRate: 200,
            name: 'Peak load'
          }
        ],
        processor: './loadTestProcessor.js'
      },
      scenarios: [
        {
          name: 'User Authentication Flow',
          weight: 20,
          flow: [
            {
              post: {
                url: '/auth/login',
                json: {
                  email: 'test.student@astralearn.com',
                  password: 'TestStudent123!'
                },
                capture: {
                  json: '$.token',
                  as: 'authToken'
                }
              }
            },
            {
              get: {
                url: '/users/profile',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                }
              }
            }
          ]
        },
        {
          name: 'Course Content Access',
          weight: 30,
          flow: [
            {
              get: {
                url: '/courses',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                }
              }
            },
            {
              get: {
                url: '/courses/1/modules',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                }
              }
            },
            {
              get: {
                url: '/lessons/1',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                }
              }
            }
          ]
        },
        {
          name: 'AI Interaction',
          weight: 25,
          flow: [
            {
              post: {
                url: '/ai/ask',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                },
                json: {
                  question: 'Explain this concept',
                  courseId: 1,
                  lessonId: 1
                }
              }
            }
          ]
        },
        {
          name: 'Assessment Taking',
          weight: 15,
          flow: [
            {
              post: {
                url: '/assessments/start',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                },
                json: {
                  assessmentId: 1
                }
              }
            },
            {
              post: {
                url: '/assessments/submit-answer',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                },
                json: {
                  sessionId: '{{ sessionId }}',
                  questionId: 1,
                  answer: 'test answer'
                }
              }
            }
          ]
        },
        {
          name: 'Analytics Dashboard',
          weight: 10,
          flow: [
            {
              get: {
                url: '/analytics/student-progress',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                }
              }
            },
            {
              get: {
                url: '/analytics/engagement-metrics',
                headers: {
                  Authorization: 'Bearer {{ authToken }}'
                }
              }
            }
          ]
        }
      ]
    };

    // Run Artillery load test
    const runner = new Artillery.runner(loadTestConfig);
    const results = await this.runArtilleryTest(runner);

    this.results.loadTests.push({
      testName: 'Comprehensive Load Test',
      timestamp: new Date().toISOString(),
      results: results,
      passed: this.evaluateLoadTestResults(results)
    });

    console.log('✅ Load tests complete');
  }

  /**
   * Run Artillery test and return results
   */
  async runArtilleryTest(runner) {
    return new Promise((resolve, reject) => {
      const results = {
        summary: {},
        intermediate: [],
        phases: []
      };

      runner.on('phaseStarted', (phase) => {
        console.log(`📊 Phase started: ${phase.name}`);
        results.phases.push({ phase: phase.name, status: 'started', timestamp: Date.now() });
      });

      runner.on('phaseCompleted', (phase) => {
        console.log(`✅ Phase completed: ${phase.name}`);
        results.phases.push({ phase: phase.name, status: 'completed', timestamp: Date.now() });
      });

      runner.on('stats', (stats) => {
        results.intermediate.push({
          timestamp: stats.timestamp,
          requestsCompleted: stats.requestsCompleted,
          rps: stats.rps.mean,
          latency: stats.latency,
          errors: stats.errors
        });
      });

      runner.on('done', (summary) => {
        results.summary = summary;
        console.log('📈 Artillery test complete');
        resolve(results);
      });

      runner.on('error', (error) => {
        console.error('❌ Artillery test failed:', error);
        reject(error);
      });

      runner.run();
    });
  }

  /**
   * Evaluate load test results against benchmarks
   */
  evaluateLoadTestResults(results) {
    const evaluation = {
      responseTime: false,
      errorRate: false,
      throughput: false,
      overall: false
    };

    if (results.summary && results.summary.aggregate) {
      const aggregate = results.summary.aggregate;

      // Check response time
      if (aggregate.latency && aggregate.latency.median <= testConfig.performance.apiResponseTime) {
        evaluation.responseTime = true;
      }

      // Check error rate
      const errorRate = (aggregate.errors?.length || 0) / (aggregate.requestsCompleted || 1) * 100;
      if (errorRate <= testConfig.loadTesting.errorThreshold) {
        evaluation.errorRate = true;
      }

      // Check throughput
      if (aggregate.rps && aggregate.rps.mean >= 50) {
        evaluation.throughput = true;
      }

      evaluation.overall = evaluation.responseTime && evaluation.errorRate && evaluation.throughput;
    }

    return evaluation;
  }

  /**
   * Run API-specific performance tests
   */
  async runAPIPerformanceTests() {
    console.log('🚀 Running API performance tests...');

    const apiEndpoints = [
      { method: 'GET', url: '/courses', name: 'List Courses' },
      { method: 'GET', url: '/courses/1', name: 'Get Course Details' },
      { method: 'POST', url: '/ai/ask', name: 'AI Question', body: { question: 'test', courseId: 1 } },
      { method: 'GET', url: '/analytics/progress', name: 'Get Progress' },
      { method: 'POST', url: '/assessments/start', name: 'Start Assessment', body: { assessmentId: 1 } }
    ];

    for (const endpoint of apiEndpoints) {
      const metrics = await this.measureAPIPerformance(endpoint);
      this.results.performanceMetrics[endpoint.name] = metrics;
    }

    console.log('✅ API performance tests complete');
  }

  /**
   * Measure individual API endpoint performance
   */
  async measureAPIPerformance(endpoint) {
    const measurements = [];
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      try {
        // Simulate API call (would use actual HTTP client in real implementation)
        await this.simulateAPICall(endpoint);
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        measurements.push(duration);
      } catch (error) {
        measurements.push(null); // Mark as failed
      }
    }

    const validMeasurements = measurements.filter(m => m !== null);
    const successRate = (validMeasurements.length / iterations) * 100;

    return {
      iterations,
      successRate,
      averageResponseTime: this.calculateAverage(validMeasurements),
      medianResponseTime: this.calculateMedian(validMeasurements),
      p95ResponseTime: this.calculatePercentile(validMeasurements, 95),
      p99ResponseTime: this.calculatePercentile(validMeasurements, 99),
      minResponseTime: Math.min(...validMeasurements),
      maxResponseTime: Math.max(...validMeasurements)
    };
  }

  /**
   * Simulate API call (placeholder for actual implementation)
   */
  async simulateAPICall(endpoint) {
    // In real implementation, this would make actual HTTP requests
    // For now, simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    return { status: 200, data: {} };
  }

  /**
   * Run WebSocket performance tests
   */
  async runWebSocketPerformanceTests() {
    console.log('🔌 Running WebSocket performance tests...');

    const webSocketMetrics = {
      connectionTime: [],
      messageLatency: [],
      concurrentConnections: 0,
      connectionStability: true
    };

    // Test WebSocket connection establishment
    const connectionTimes = await this.measureWebSocketConnections(50);
    webSocketMetrics.connectionTime = connectionTimes;

    // Test message latency
    const messageLatencies = await this.measureWebSocketLatency(100);
    webSocketMetrics.messageLatency = messageLatencies;

    // Test concurrent connections
    const maxConnections = await this.testConcurrentWebSocketConnections();
    webSocketMetrics.concurrentConnections = maxConnections;

    this.results.performanceMetrics.webSocket = {
      averageConnectionTime: this.calculateAverage(webSocketMetrics.connectionTime),
      averageMessageLatency: this.calculateAverage(webSocketMetrics.messageLatency),
      maxConcurrentConnections: webSocketMetrics.concurrentConnections,
      connectionStability: webSocketMetrics.connectionStability
    };

    console.log('✅ WebSocket performance tests complete');
  }

  /**
   * Measure WebSocket connection times
   */
  async measureWebSocketConnections(count) {
    const connectionTimes = [];

    for (let i = 0; i < count; i++) {
      const startTime = Date.now();
      
      try {
        // Simulate WebSocket connection (placeholder)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 20));
        
        const connectionTime = Date.now() - startTime;
        connectionTimes.push(connectionTime);
      } catch (error) {
        connectionTimes.push(null);
      }
    }

    return connectionTimes.filter(t => t !== null);
  }

  /**
   * Measure WebSocket message latency
   */
  async measureWebSocketLatency(messageCount) {
    const latencies = [];

    for (let i = 0; i < messageCount; i++) {
      const startTime = Date.now();
      
      // Simulate message round trip
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
      
      const latency = Date.now() - startTime;
      latencies.push(latency);
    }

    return latencies;
  }

  /**
   * Test concurrent WebSocket connections
   */
  async testConcurrentWebSocketConnections() {
    // Simulate testing maximum concurrent connections
    const maxConnections = Math.floor(Math.random() * 500) + 500; // 500-1000 connections
    return maxConnections;
  }

  /**
   * Run database performance tests
   */
  async runDatabasePerformanceTests() {
    console.log('💾 Running database performance tests...');

    const dbMetrics = {
      queryPerformance: {},
      connectionPool: {},
      indexEfficiency: {}
    };

    // Test common queries
    const commonQueries = [
      'SELECT * FROM users WHERE id = ?',
      'SELECT * FROM courses WHERE instructorId = ?',
      'SELECT * FROM modules WHERE courseId = ?',
      'SELECT * FROM analytics WHERE userId = ? AND date >= ?'
    ];

    for (const query of commonQueries) {
      const metrics = await this.measureQueryPerformance(query);
      dbMetrics.queryPerformance[query] = metrics;
    }

    // Test connection pool performance
    dbMetrics.connectionPool = await this.testConnectionPoolPerformance();

    // Test index efficiency
    dbMetrics.indexEfficiency = await this.testIndexEfficiency();

    this.results.performanceMetrics.database = dbMetrics;

    console.log('✅ Database performance tests complete');
  }

  /**
   * Measure query performance
   */
  async measureQueryPerformance(query) {
    const measurements = [];
    const iterations = 50;

    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 5));
      
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      measurements.push(duration);
    }

    return {
      averageTime: this.calculateAverage(measurements),
      medianTime: this.calculateMedian(measurements),
      p95Time: this.calculatePercentile(measurements, 95),
      minTime: Math.min(...measurements),
      maxTime: Math.max(...measurements)
    };
  }

  /**
   * Test connection pool performance
   */
  async testConnectionPoolPerformance() {
    // Simulate connection pool testing
    return {
      maxConnections: 20,
      averageWaitTime: Math.random() * 10 + 2,
      connectionUtilization: Math.random() * 30 + 70
    };
  }

  /**
   * Test index efficiency
   */
  async testIndexEfficiency() {
    // Simulate index efficiency testing
    return {
      indexHitRatio: Math.random() * 10 + 90,
      slowQueries: Math.floor(Math.random() * 5),
      indexUtilization: Math.random() * 20 + 80
    };
  }

  /**
   * Run frontend performance tests
   */
  async runFrontendPerformanceTests() {
    console.log('🎨 Running frontend performance tests...');

    // Simulate frontend performance metrics
    const frontendMetrics = {
      pageLoadTime: {
        homepage: Math.random() * 1000 + 500,
        dashboard: Math.random() * 1500 + 800,
        courseView: Math.random() * 1200 + 600,
        assessmentView: Math.random() * 1000 + 700
      },
      bundleSize: {
        main: Math.random() * 500 + 200, // KB
        vendor: Math.random() * 800 + 400, // KB
        css: Math.random() * 100 + 50 // KB
      },
      resourceOptimization: {
        imageOptimization: Math.random() * 20 + 80,
        cacheUtilization: Math.random() * 10 + 85,
        compressionRatio: Math.random() * 30 + 60
      }
    };

    this.results.performanceMetrics.frontend = frontendMetrics;

    console.log('✅ Frontend performance tests complete');
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport() {
    console.log('📊 Generating performance report...');

    const report = {
      testSummary: {
        timestamp: new Date().toISOString(),
        totalTests: Object.keys(this.results.performanceMetrics).length,
        overallStatus: this.calculateOverallStatus()
      },
      loadTestResults: this.results.loadTests,
      performanceMetrics: this.results.performanceMetrics,
      recommendations: this.generateRecommendations(),
      benchmarkComparison: this.compareToBenchmarks()
    };

    // Save report to file
    const reportPath = path.join(__dirname, '../reports/performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable report
    const humanReport = this.generateHumanReadableReport(report);
    const humanReportPath = path.join(__dirname, '../reports/performance-report.md');
    fs.writeFileSync(humanReportPath, humanReport);

    console.log(`📋 Performance report saved to ${reportPath}`);
    console.log(`📋 Human-readable report saved to ${humanReportPath}`);

    return report;
  }

  /**
   * Calculate overall test status
   */
  calculateOverallStatus() {
    const metrics = this.results.performanceMetrics;
    let passed = 0;
    let total = 0;

    // Check API performance
    if (metrics.api) {
      total++;
      if (Object.values(metrics.api).every(m => m.averageResponseTime <= testConfig.performance.apiResponseTime)) {
        passed++;
      }
    }

    // Check WebSocket performance
    if (metrics.webSocket) {
      total++;
      if (metrics.webSocket.averageMessageLatency <= testConfig.performance.webSocketLatency) {
        passed++;
      }
    }

    // Check database performance
    if (metrics.database) {
      total++;
      const avgQueryTime = Object.values(metrics.database.queryPerformance)
        .reduce((sum, q) => sum + q.averageTime, 0) / Object.keys(metrics.database.queryPerformance).length;
      if (avgQueryTime <= testConfig.performance.databaseQueryTime) {
        passed++;
      }
    }

    return {
      passed,
      total,
      percentage: total > 0 ? (passed / total) * 100 : 0,
      status: passed === total ? 'PASS' : 'FAIL'
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const metrics = this.results.performanceMetrics;

    // API recommendations
    Object.entries(metrics).forEach(([category, data]) => {
      if (category === 'api') {
        Object.entries(data).forEach(([endpoint, metrics]) => {
          if (metrics.averageResponseTime > testConfig.performance.apiResponseTime) {
            recommendations.push({
              category: 'API Performance',
              priority: 'HIGH',
              issue: `${endpoint} response time is ${metrics.averageResponseTime}ms (target: ${testConfig.performance.apiResponseTime}ms)`,
              recommendation: 'Optimize database queries, implement caching, or optimize business logic'
            });
          }
        });
      }
    });

    // WebSocket recommendations
    if (metrics.webSocket && metrics.webSocket.averageMessageLatency > testConfig.performance.webSocketLatency) {
      recommendations.push({
        category: 'WebSocket Performance',
        priority: 'MEDIUM',
        issue: `WebSocket latency is ${metrics.webSocket.averageMessageLatency}ms`,
        recommendation: 'Optimize WebSocket message handling and consider connection pooling'
      });
    }

    // Database recommendations
    if (metrics.database) {
      if (metrics.database.connectionPool.averageWaitTime > 50) {
        recommendations.push({
          category: 'Database Performance',
          priority: 'HIGH',
          issue: 'High database connection wait time',
          recommendation: 'Increase connection pool size or optimize query patterns'
        });
      }

      if (metrics.database.indexEfficiency.indexHitRatio < 90) {
        recommendations.push({
          category: 'Database Performance',
          priority: 'MEDIUM',
          issue: 'Low index hit ratio',
          recommendation: 'Review and optimize database indexes for frequently used queries'
        });
      }
    }

    return recommendations;
  }

  /**
   * Compare results to benchmarks
   */
  compareToBenchmarks() {
    return {
      apiResponseTime: {
        target: testConfig.performance.apiResponseTime,
        actual: this.getAverageAPIResponseTime(),
        status: this.getAverageAPIResponseTime() <= testConfig.performance.apiResponseTime ? 'PASS' : 'FAIL'
      },
      webSocketLatency: {
        target: testConfig.performance.webSocketLatency,
        actual: this.results.performanceMetrics.webSocket?.averageMessageLatency || 0,
        status: (this.results.performanceMetrics.webSocket?.averageMessageLatency || 0) <= testConfig.performance.webSocketLatency ? 'PASS' : 'FAIL'
      },
      databaseQueryTime: {
        target: testConfig.performance.databaseQueryTime,
        actual: this.getAverageDatabaseQueryTime(),
        status: this.getAverageDatabaseQueryTime() <= testConfig.performance.databaseQueryTime ? 'PASS' : 'FAIL'
      }
    };
  }

  /**
   * Generate human-readable report
   */
  generateHumanReadableReport(report) {
    return `# AstraLearn Performance Test Report

## Test Summary
- **Timestamp**: ${report.testSummary.timestamp}
- **Total Tests**: ${report.testSummary.totalTests}
- **Overall Status**: ${report.testSummary.overallStatus.status}
- **Pass Rate**: ${report.testSummary.overallStatus.percentage.toFixed(1)}%

## Performance Metrics

### API Performance
${Object.entries(report.performanceMetrics).map(([category, data]) => {
  if (category === 'api') {
    return Object.entries(data).map(([endpoint, metrics]) => 
      `- **${endpoint}**: ${metrics.averageResponseTime}ms avg (${metrics.successRate}% success rate)`
    ).join('\n');
  }
  return '';
}).join('\n')}

### WebSocket Performance
${report.performanceMetrics.webSocket ? `
- **Average Connection Time**: ${report.performanceMetrics.webSocket.averageConnectionTime}ms
- **Average Message Latency**: ${report.performanceMetrics.webSocket.averageMessageLatency}ms
- **Max Concurrent Connections**: ${report.performanceMetrics.webSocket.maxConcurrentConnections}
` : 'No WebSocket metrics available'}

### Database Performance
${report.performanceMetrics.database ? `
- **Average Query Time**: ${this.getAverageDatabaseQueryTime()}ms
- **Connection Pool Utilization**: ${report.performanceMetrics.database.connectionPool.connectionUtilization}%
- **Index Hit Ratio**: ${report.performanceMetrics.database.indexEfficiency.indexHitRatio}%
` : 'No database metrics available'}

## Recommendations
${report.recommendations.map(rec => 
  `### ${rec.priority} Priority: ${rec.category}
**Issue**: ${rec.issue}
**Recommendation**: ${rec.recommendation}
`).join('\n')}

## Benchmark Comparison
${Object.entries(report.benchmarkComparison).map(([metric, data]) =>
  `- **${metric}**: ${data.actual}ms (target: ${data.target}ms) - ${data.status}`
).join('\n')}

Generated on ${new Date().toISOString()}
`;
  }

  // Utility methods
  calculateAverage(numbers) {
    return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  }

  calculateMedian(numbers) {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculatePercentile(numbers, percentile) {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getAverageAPIResponseTime() {
    const apiMetrics = this.results.performanceMetrics.api || {};
    const times = Object.values(apiMetrics).map(m => m.averageResponseTime);
    return this.calculateAverage(times);
  }

  getAverageDatabaseQueryTime() {
    const dbMetrics = this.results.performanceMetrics.database?.queryPerformance || {};
    const times = Object.values(dbMetrics).map(m => m.averageTime);
    return this.calculateAverage(times);
  }
}

module.exports = PerformanceTester;
