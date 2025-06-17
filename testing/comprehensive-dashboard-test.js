/**
 * Comprehensive Dashboard Test Suite
 * Tests all dashboard functionality, API endpoints, and navigation
 */

import fetch from 'node-fetch';

class DashboardTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.token = 'demo-token';
    this.userId = '684fc088b383c0bf66879aec';
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async runTest(testName, testFn) {
    try {
      console.log(`🧪 Running test: ${testName}`);
      await testFn();
      this.testResults.passed++;
      this.testResults.details.push({ name: testName, status: 'PASSED' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({ 
        name: testName, 
        status: 'FAILED', 
        error: error.message 
      });
      console.error(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async testStudentDashboardEndpoints() {
    await this.runTest('Student Enrolled Courses', async () => {
      const data = await this.makeRequest('/courses/my/enrolled');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Student Learning Analytics', async () => {
      const data = await this.makeRequest('/analytics/summary');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Student Recommendations', async () => {
      const data = await this.makeRequest('/adaptive-learning/recommendations');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Student Learning Path', async () => {
      const data = await this.makeRequest(`/adaptive-learning/learning-path/current?userId=${this.userId}`);
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });
  }

  async testGamificationEndpoints() {
    await this.runTest('Gamification Dashboard', async () => {
      const data = await this.makeRequest('/gamification/dashboard');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Weekly Challenges', async () => {
      const data = await this.makeRequest('/gamification/challenges/weekly');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Active Challenges', async () => {
      const data = await this.makeRequest('/gamification/challenges/active');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Completed Challenges', async () => {
      const data = await this.makeRequest('/gamification/challenges/completed');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('All Challenges', async () => {
      const data = await this.makeRequest('/gamification/challenges');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('User Achievements', async () => {
      const data = await this.makeRequest('/gamification/achievements');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Leaderboard', async () => {
      const data = await this.makeRequest('/gamification/leaderboard');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });
  }

  async testAdaptiveLearningEndpoints() {
    await this.runTest('Adaptive Learning Dashboard', async () => {
      const data = await this.makeRequest(`/adaptive-learning/dashboard?userId=${this.userId}`);
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Learning Preferences', async () => {
      const data = await this.makeRequest(`/adaptive-learning/preferences?userId=${this.userId}`);
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Performance Analytics', async () => {
      const data = await this.makeRequest(`/adaptive-learning/performance?userId=${this.userId}`);
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });
  }

  async testSocialLearningEndpoints() {
    await this.runTest('Social Dashboard', async () => {
      const data = await this.makeRequest('/social-learning/dashboard');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Study Groups', async () => {
      const data = await this.makeRequest('/social-learning/study-groups');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Discussion Forums', async () => {
      const data = await this.makeRequest('/social-learning/forums');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });
  }

  async testCourseManagementEndpoints() {
    await this.runTest('Available Courses', async () => {
      const data = await this.makeRequest('/courses/available');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Course Categories', async () => {
      const data = await this.makeRequest('/courses/categories');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });
  }

  async testAuthenticationEndpoints() {
    await this.runTest('User Profile', async () => {
      const data = await this.makeRequest('/auth/profile');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });

    await this.runTest('Authentication Status', async () => {
      const data = await this.makeRequest('/auth/status');
      if (typeof data !== 'object') throw new Error('Invalid response format');
    });
  }
  async testHealthEndpoints() {
    await this.runTest('API Health Check', async () => {
      const response = await fetch(`http://localhost:5000/health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      const data = await response.json();
      if (data.status !== 'OK' && data.status !== 'healthy') throw new Error(`System not healthy: ${data.status}`);
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Dashboard Test Suite\n');
    
    await this.testHealthEndpoints();
    await this.testAuthenticationEndpoints();
    await this.testStudentDashboardEndpoints();
    await this.testGamificationEndpoints();
    await this.testAdaptiveLearningEndpoints();
    await this.testSocialLearningEndpoints();
    await this.testCourseManagementEndpoints();

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);

    if (this.testResults.failed > 0) {
      console.log('\n💥 Failed Tests Details:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  ❌ ${test.name}: ${test.error}`);
        });
    }

    console.log('\n🎯 Next Steps:');
    if (this.testResults.failed === 0) {
      console.log('  ✅ All tests passed! Dashboard is fully functional.');
    } else {
      console.log('  🔧 Fix the failed endpoints to improve dashboard functionality.');
      console.log('  📝 Check backend logs for detailed error information.');
      console.log('  🔄 Re-run tests after fixes are applied.');
    }

    return {
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      successRate: (this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100
    };
  }
}

// Run the test suite
const testSuite = new DashboardTestSuite();
testSuite.runAllTests()
  .then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite execution failed:', error);
    process.exit(1);
  });
