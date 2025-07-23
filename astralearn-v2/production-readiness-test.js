#!/usr/bin/env node

/**
 * AstraLearn v2 Production Readiness Test
 * Comprehensive test suite to verify production deployment readiness
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:5000';

class ProductionReadinessTest {
  constructor() {
    this.results = {
      api: { passed: 0, failed: 0, tests: [] },
      performance: { passed: 0, failed: 0, tests: [] },
      security: { passed: 0, failed: 0, tests: [] },
      configuration: { passed: 0, failed: 0, tests: [] },
      deployment: { passed: 0, failed: 0, tests: [] }
    };
  }

  async testAPIEndpoints() {
    console.log('\n🔌 TESTING API ENDPOINTS');
    console.log('-'.repeat(40));

    const endpoints = [
      { method: 'GET', url: '/api/health', name: 'Health Check', requiresAuth: false },
      { method: 'GET', url: '/api/courses', name: 'Get Courses', requiresAuth: false },
      { method: 'GET', url: '/api/courses/search?q=JavaScript', name: 'Course Search', requiresAuth: false },
      { method: 'GET', url: '/api/courses/tags', name: 'Course Tags', requiresAuth: false },
      { method: 'GET', url: '/api/forum/posts', name: 'Forum Posts', requiresAuth: false },
      { method: 'GET', url: '/api/forum/stats', name: 'Forum Stats', requiresAuth: false },
      { method: 'POST', url: '/api/auth/login', name: 'User Login', requiresAuth: false, data: {
        identifier: 'jane.student@astralearn.com',
        password: 'password123'
      }}
    ];

    let authToken = null;

    for (const endpoint of endpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${BASE_URL}${endpoint.url}`,
          timeout: 5000
        };

        if (endpoint.data) {
          config.data = endpoint.data;
        }

        if (endpoint.requiresAuth && authToken) {
          config.headers = { Authorization: `Bearer ${authToken}` };
        }

        const response = await axios(config);
        
        // Store auth token for subsequent requests
        if (endpoint.name === 'User Login' && response.data.data?.tokens?.accessToken) {
          authToken = response.data.data.tokens.accessToken;
        }

        console.log(`✅ ${endpoint.name}: ${response.status} (${response.statusText})`);
        this.results.api.passed++;
        this.results.api.tests.push({ name: endpoint.name, status: 'PASS', code: response.status });

      } catch (error) {
        const status = error.response?.status || 'TIMEOUT';
        console.log(`❌ ${endpoint.name}: ${status} (${error.message})`);
        this.results.api.failed++;
        this.results.api.tests.push({ name: endpoint.name, status: 'FAIL', error: error.message });
      }
    }

    // Test authenticated endpoints
    if (authToken) {
      const authEndpoints = [
        { method: 'GET', url: `/api/users/2/learning-stats`, name: 'User Learning Stats' },
        { method: 'GET', url: `/api/users/2/recent-activity`, name: 'User Recent Activity' },
        { method: 'GET', url: `/api/analytics/learning/2`, name: 'Learning Analytics' },
        { method: 'GET', url: `/api/recommendations/2`, name: 'AI Recommendations' }
      ];

      for (const endpoint of authEndpoints) {
        try {
          const response = await axios({
            method: endpoint.method,
            url: `${BASE_URL}${endpoint.url}`,
            headers: { Authorization: `Bearer ${authToken}` },
            timeout: 5000
          });

          console.log(`✅ ${endpoint.name}: ${response.status} (Authenticated)`);
          this.results.api.passed++;
          this.results.api.tests.push({ name: endpoint.name, status: 'PASS', code: response.status });

        } catch (error) {
          const status = error.response?.status || 'TIMEOUT';
          console.log(`❌ ${endpoint.name}: ${status} (${error.message})`);
          this.results.api.failed++;
          this.results.api.tests.push({ name: endpoint.name, status: 'FAIL', error: error.message });
        }
      }
    }
  }

  async testPerformance() {
    console.log('\n⚡ TESTING PERFORMANCE');
    console.log('-'.repeat(40));

    // Test response times
    const performanceTests = [
      { url: '/api/courses', name: 'Course List Load Time', maxTime: 1000 },
      { url: '/api/forum/posts', name: 'Forum Posts Load Time', maxTime: 1000 },
      { url: '/api/courses/search?q=JavaScript', name: 'Search Response Time', maxTime: 1500 }
    ];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${BASE_URL}${test.url}`, { timeout: 5000 });
        const responseTime = Date.now() - startTime;

        if (responseTime <= test.maxTime) {
          console.log(`✅ ${test.name}: ${responseTime}ms (Target: <${test.maxTime}ms)`);
          this.results.performance.passed++;
          this.results.performance.tests.push({ 
            name: test.name, 
            status: 'PASS', 
            responseTime: `${responseTime}ms` 
          });
        } else {
          console.log(`⚠️ ${test.name}: ${responseTime}ms (Exceeds target: ${test.maxTime}ms)`);
          this.results.performance.failed++;
          this.results.performance.tests.push({ 
            name: test.name, 
            status: 'SLOW', 
            responseTime: `${responseTime}ms` 
          });
        }

      } catch (error) {
        console.log(`❌ ${test.name}: Failed (${error.message})`);
        this.results.performance.failed++;
        this.results.performance.tests.push({ name: test.name, status: 'FAIL', error: error.message });
      }
    }

    // Test concurrent requests
    try {
      console.log('\n🔄 Testing concurrent request handling...');
      const concurrentRequests = Array(10).fill().map(() => 
        axios.get(`${BASE_URL}/api/courses`, { timeout: 5000 })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      const successCount = responses.filter(r => r.status === 200).length;
      console.log(`✅ Concurrent Requests: ${successCount}/10 successful in ${totalTime}ms`);
      
      this.results.performance.passed++;
      this.results.performance.tests.push({ 
        name: 'Concurrent Request Handling', 
        status: 'PASS', 
        details: `${successCount}/10 in ${totalTime}ms` 
      });

    } catch (error) {
      console.log(`❌ Concurrent Request Test: Failed (${error.message})`);
      this.results.performance.failed++;
      this.results.performance.tests.push({ 
        name: 'Concurrent Request Handling', 
        status: 'FAIL', 
        error: error.message 
      });
    }
  }

  async testSecurity() {
    console.log('\n🔒 TESTING SECURITY');
    console.log('-'.repeat(40));

    // Test authentication protection
    try {
      await axios.get(`${BASE_URL}/api/users/1/learning-stats`);
      console.log('❌ Protected Endpoint: Accessible without authentication');
      this.results.security.failed++;
      this.results.security.tests.push({ 
        name: 'Authentication Protection', 
        status: 'FAIL', 
        error: 'Endpoint accessible without auth' 
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protected Endpoint: Properly secured (401 Unauthorized)');
        this.results.security.passed++;
        this.results.security.tests.push({ name: 'Authentication Protection', status: 'PASS' });
      } else {
        console.log(`❌ Protected Endpoint: Unexpected error (${error.response?.status})`);
        this.results.security.failed++;
        this.results.security.tests.push({ 
          name: 'Authentication Protection', 
          status: 'FAIL', 
          error: `Unexpected status: ${error.response?.status}` 
        });
      }
    }

    // Test CORS headers
    try {
      const response = await axios.get(`${BASE_URL}/api/courses`);
      const corsHeader = response.headers['access-control-allow-origin'];
      
      if (corsHeader) {
        console.log(`✅ CORS Headers: Present (${corsHeader})`);
        this.results.security.passed++;
        this.results.security.tests.push({ name: 'CORS Headers', status: 'PASS' });
      } else {
        console.log('⚠️ CORS Headers: Not found');
        this.results.security.failed++;
        this.results.security.tests.push({ name: 'CORS Headers', status: 'FAIL', error: 'Missing CORS headers' });
      }
    } catch (error) {
      console.log(`❌ CORS Test: Failed (${error.message})`);
      this.results.security.failed++;
      this.results.security.tests.push({ name: 'CORS Headers', status: 'FAIL', error: error.message });
    }

    // Test rate limiting (if enabled)
    try {
      console.log('\n🚦 Testing rate limiting...');
      const rapidRequests = Array(20).fill().map(() => 
        axios.get(`${BASE_URL}/api/courses`, { timeout: 2000 })
      );

      const responses = await Promise.allSettled(rapidRequests);
      const rateLimited = responses.some(r => 
        r.status === 'rejected' && r.reason?.response?.status === 429
      );

      if (rateLimited) {
        console.log('✅ Rate Limiting: Active (429 Too Many Requests)');
        this.results.security.passed++;
        this.results.security.tests.push({ name: 'Rate Limiting', status: 'PASS' });
      } else {
        console.log('⚠️ Rate Limiting: Not detected');
        this.results.security.passed++; // Not necessarily a failure
        this.results.security.tests.push({ name: 'Rate Limiting', status: 'INFO', note: 'Not detected' });
      }

    } catch (error) {
      console.log(`❌ Rate Limiting Test: Failed (${error.message})`);
      this.results.security.failed++;
      this.results.security.tests.push({ name: 'Rate Limiting', status: 'FAIL', error: error.message });
    }
  }

  async testConfiguration() {
    console.log('\n⚙️ TESTING CONFIGURATION');
    console.log('-'.repeat(40));

    // Check environment files
    const envFiles = ['.env.example', '.env.production', '.env.development'];
    
    for (const file of envFiles) {
      try {
        await fs.access(path.join(process.cwd(), file));
        console.log(`✅ Environment File: ${file} exists`);
        this.results.configuration.passed++;
        this.results.configuration.tests.push({ name: `${file} exists`, status: 'PASS' });
      } catch (error) {
        console.log(`❌ Environment File: ${file} missing`);
        this.results.configuration.failed++;
        this.results.configuration.tests.push({ name: `${file} exists`, status: 'FAIL' });
      }
    }

    // Check PM2 configuration
    try {
      await fs.access(path.join(process.cwd(), 'ecosystem.config.js'));
      console.log('✅ PM2 Configuration: ecosystem.config.js exists');
      this.results.configuration.passed++;
      this.results.configuration.tests.push({ name: 'PM2 Configuration', status: 'PASS' });
    } catch (error) {
      console.log('❌ PM2 Configuration: ecosystem.config.js missing');
      this.results.configuration.failed++;
      this.results.configuration.tests.push({ name: 'PM2 Configuration', status: 'FAIL' });
    }

    // Check deployment guide
    try {
      await fs.access(path.join(process.cwd(), 'PRODUCTION_DEPLOYMENT_GUIDE.md'));
      console.log('✅ Deployment Guide: Available');
      this.results.configuration.passed++;
      this.results.configuration.tests.push({ name: 'Deployment Guide', status: 'PASS' });
    } catch (error) {
      console.log('❌ Deployment Guide: Missing');
      this.results.configuration.failed++;
      this.results.configuration.tests.push({ name: 'Deployment Guide', status: 'FAIL' });
    }
  }

  async testDeploymentReadiness() {
    console.log('\n🚀 TESTING DEPLOYMENT READINESS');
    console.log('-'.repeat(40));

    // Check package.json scripts
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const requiredScripts = ['start', 'dev', 'build'];
      
      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          console.log(`✅ NPM Script: ${script} defined`);
          this.results.deployment.passed++;
          this.results.deployment.tests.push({ name: `NPM Script: ${script}`, status: 'PASS' });
        } else {
          console.log(`❌ NPM Script: ${script} missing`);
          this.results.deployment.failed++;
          this.results.deployment.tests.push({ name: `NPM Script: ${script}`, status: 'FAIL' });
        }
      }
    } catch (error) {
      console.log('❌ Package.json: Cannot read file');
      this.results.deployment.failed++;
      this.results.deployment.tests.push({ name: 'Package.json', status: 'FAIL', error: error.message });
    }

    // Check logs directory
    try {
      await fs.access(path.join(process.cwd(), 'logs'));
      console.log('✅ Logs Directory: Exists');
      this.results.deployment.passed++;
      this.results.deployment.tests.push({ name: 'Logs Directory', status: 'PASS' });
    } catch (error) {
      console.log('⚠️ Logs Directory: Will be created on first run');
      this.results.deployment.passed++;
      this.results.deployment.tests.push({ name: 'Logs Directory', status: 'INFO' });
    }

    // Check optimization script
    try {
      await fs.access(path.join(process.cwd(), 'server/scripts/optimize-production.js'));
      console.log('✅ Optimization Script: Available');
      this.results.deployment.passed++;
      this.results.deployment.tests.push({ name: 'Optimization Script', status: 'PASS' });
    } catch (error) {
      console.log('❌ Optimization Script: Missing');
      this.results.deployment.failed++;
      this.results.deployment.tests.push({ name: 'Optimization Script', status: 'FAIL' });
    }
  }

  generateReport() {
    console.log('\n📊 PRODUCTION READINESS REPORT');
    console.log('='.repeat(50));

    const categories = [
      { name: 'API Endpoints', key: 'api', icon: '🔌' },
      { name: 'Performance', key: 'performance', icon: '⚡' },
      { name: 'Security', key: 'security', icon: '🔒' },
      { name: 'Configuration', key: 'configuration', icon: '⚙️' },
      { name: 'Deployment', key: 'deployment', icon: '🚀' }
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    categories.forEach(({ name, key, icon }) => {
      const result = this.results[key];
      const total = result.passed + result.failed;
      const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;

      console.log(`\n📋 ${icon} ${name.toUpperCase()}: ${result.passed}/${total} passed (${percentage}%)`);
      
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += total;
    });

    const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

    console.log('\n🎯 OVERALL READINESS:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${overallPercentage}%`);

    if (overallPercentage >= 95) {
      console.log('\n🎉 EXCELLENT! AstraLearn v2 is ready for production deployment!');
    } else if (overallPercentage >= 85) {
      console.log('\n✅ GOOD! Minor issues should be addressed before production.');
    } else {
      console.log('\n⚠️ NEEDS WORK: Several critical issues must be resolved.');
    }

    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Address any failed tests');
    console.log('   2. Run optimization script: node server/scripts/optimize-production.js');
    console.log('   3. Configure production environment variables');
    console.log('   4. Set up SSL certificates');
    console.log('   5. Deploy using PM2: pm2 start ecosystem.config.js --env production');
  }

  async run() {
    console.log('🧪 ASTRALEARN V2 PRODUCTION READINESS TEST');
    console.log('='.repeat(50));
    console.log('Testing all systems for production deployment...\n');

    try {
      await this.testAPIEndpoints();
      await this.testPerformance();
      await this.testSecurity();
      await this.testConfiguration();
      await this.testDeploymentReadiness();
      
      this.generateReport();
      
    } catch (error) {
      console.error('\n❌ Production readiness test failed:', error.message);
      process.exit(1);
    }
  }
}

// Run test if called directly
if (require.main === module) {
  const test = new ProductionReadinessTest();
  test.run().catch(console.error);
}

module.exports = ProductionReadinessTest;
