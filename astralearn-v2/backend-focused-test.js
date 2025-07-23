#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// ANSI color codes for beautiful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Test results tracking
const testResults = {
  backend: { total: 0, passed: 0, failed: 0, tests: [] },
  performance: { total: 0, passed: 0, failed: 0, metrics: [] },
  integration: { total: 0, passed: 0, failed: 0, tests: [] }
};

// Process management
let backendProcess = null;

// Utility functions
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  const border = '='.repeat(80);
  log(`\n${border}`, colors.cyan);
  log(`🚀 ${message}`, colors.cyan + colors.bright);
  log(`${border}`, colors.cyan);
}

function logSection(message) {
  log(`\n${'─'.repeat(60)}`, colors.blue);
  log(`📋 ${message}`, colors.blue + colors.bright);
  log(`${'─'.repeat(60)}`, colors.blue);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Wait for a condition with timeout
function waitFor(condition, timeout = 30000, interval = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = async () => {
      try {
        if (await condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, interval);
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };
    
    check();
  });
}

// Check if service is running
async function isServiceRunning(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

// Start backend service
function startBackend() {
  return new Promise((resolve, reject) => {
    logInfo('Starting backend server...');
    
    backendProcess = spawn('node', ['simple-test-server.cjs'], {
      cwd: path.join(__dirname, 'server'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    
    backendProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Server: http://localhost:5000')) {
        logSuccess('Backend server started successfully');
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('EADDRINUSE')) {
        logWarning('Port 5000 already in use, assuming backend is running');
        resolve();
      } else {
        logError(`Backend error: ${error}`);
      }
    });

    backendProcess.on('error', (error) => {
      logError(`Failed to start backend: ${error.message}`);
      reject(error);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        logWarning('Backend startup timeout, checking if service is available...');
        resolve(); // Continue anyway, will check service availability
      }
    }, 30000);
  });
}

// Cleanup processes
function cleanup() {
  logInfo('Cleaning up processes...');
  
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
    logInfo('Backend process terminated');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Received SIGINT, cleaning up...', colors.yellow);
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Received SIGTERM, cleaning up...', colors.yellow);
  cleanup();
  process.exit(0);
});

// Test runners
async function runBackendTests() {
  logInfo('Running comprehensive backend tests...');
  try {
    const backendTestModule = require('./comprehensive-backend-tests.js');
    const results = await backendTestModule.runAllTests();
    testResults.backend = results;
    logSuccess(`Backend tests completed: ${results.passed}/${results.total} passed`);
  } catch (error) {
    logError(`Backend tests failed: ${error.message}`);
    testResults.backend.failed = 1;
  }
}

async function runPerformanceTests() {
  logInfo('Running performance benchmark tests...');
  try {
    const performanceTestModule = require('./comprehensive-performance-tests.js');
    const results = await performanceTestModule.runAllTests();
    testResults.performance = results;
    logSuccess(`Performance tests completed: ${results.passed}/${results.total} passed`);
  } catch (error) {
    logError(`Performance tests failed: ${error.message}`);
    testResults.performance.failed = 1;
  }
}

async function runBasicIntegrationTests() {
  logInfo('Running basic integration tests...');
  try {
    // Simple integration tests without browser automation
    const integrationResults = { total: 3, passed: 0, failed: 0, tests: [] };
    
    // Test 1: Health check
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        integrationResults.passed++;
        integrationResults.tests.push({ name: 'Health Check Integration', status: 'PASS' });
      } else {
        integrationResults.failed++;
        integrationResults.tests.push({ name: 'Health Check Integration', status: 'FAIL' });
      }
    } catch (error) {
      integrationResults.failed++;
      integrationResults.tests.push({ name: 'Health Check Integration', status: 'FAIL' });
    }
    
    // Test 2: CORS headers
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      const corsHeader = response.headers.get('access-control-allow-origin');
      if (corsHeader) {
        integrationResults.passed++;
        integrationResults.tests.push({ name: 'CORS Configuration', status: 'PASS' });
      } else {
        integrationResults.failed++;
        integrationResults.tests.push({ name: 'CORS Configuration', status: 'FAIL' });
      }
    } catch (error) {
      integrationResults.failed++;
      integrationResults.tests.push({ name: 'CORS Configuration', status: 'FAIL' });
    }
    
    // Test 3: JSON response format
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      const data = await response.json();
      if (data && typeof data === 'object' && data.success !== undefined) {
        integrationResults.passed++;
        integrationResults.tests.push({ name: 'JSON Response Format', status: 'PASS' });
      } else {
        integrationResults.failed++;
        integrationResults.tests.push({ name: 'JSON Response Format', status: 'FAIL' });
      }
    } catch (error) {
      integrationResults.failed++;
      integrationResults.tests.push({ name: 'JSON Response Format', status: 'FAIL' });
    }
    
    integrationResults.total = integrationResults.passed + integrationResults.failed;
    testResults.integration = integrationResults;
    logSuccess(`Integration tests completed: ${integrationResults.passed}/${integrationResults.total} passed`);
  } catch (error) {
    logError(`Integration tests failed: ${error.message}`);
    testResults.integration.failed = 1;
  }
}

function generateTestReport() {
  const totalTests = testResults.backend.total + testResults.performance.total + testResults.integration.total;
  const totalPassed = testResults.backend.passed + testResults.performance.passed + testResults.integration.passed;
  const totalFailed = testResults.backend.failed + testResults.performance.failed + testResults.integration.failed;
  
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  
  logHeader('📊 COMPREHENSIVE TEST REPORT');
  
  log(`\n🎯 Overall Results:`, colors.bright);
  log(`   Total Tests: ${totalTests}`, colors.white);
  log(`   Passed: ${totalPassed}`, colors.green);
  log(`   Failed: ${totalFailed}`, totalFailed > 0 ? colors.red : colors.green);
  log(`   Success Rate: ${successRate}%`, successRate >= 90 ? colors.green : colors.yellow);
  
  log(`\n📋 Test Categories:`, colors.bright);
  log(`   🔧 Backend API: ${testResults.backend.passed}/${testResults.backend.total}`, 
      testResults.backend.failed === 0 ? colors.green : colors.red);
  log(`   ⚡ Performance: ${testResults.performance.passed}/${testResults.performance.total}`, 
      testResults.performance.failed === 0 ? colors.green : colors.red);
  log(`   🔗 Integration: ${testResults.integration.passed}/${testResults.integration.total}`, 
      testResults.integration.failed === 0 ? colors.green : colors.red);
  
  // Save detailed report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: { totalTests, totalPassed, totalFailed, successRate },
    results: testResults
  };
  
  require('fs').writeFileSync('backend-test-report.json', JSON.stringify(reportData, null, 2));
  logSuccess('Detailed test report saved to backend-test-report.json');
  
  if (successRate >= 95) {
    log(`\n🎉 EXCELLENT! AstraLearn v2 Backend is production-ready!`, colors.green + colors.bright);
  } else if (successRate >= 85) {
    log(`\n✅ GOOD! AstraLearn v2 Backend is mostly ready with minor issues.`, colors.yellow + colors.bright);
  } else {
    log(`\n⚠️  WARNING! AstraLearn v2 Backend needs attention before production.`, colors.red + colors.bright);
  }
}

// Main execution function
async function main() {
  try {
    logHeader('AstraLearn v2 Backend-Focused Testing System');
    
    // Phase 1: Start Backend Service
    logSection('Phase 1: Starting Backend Service');
    
    await startBackend();
    
    // Wait for backend to be ready
    logInfo('Waiting for backend to be ready...');
    await waitFor(() => isServiceRunning('http://localhost:5000/api/health'), 30000);
    logSuccess('Backend service is ready');
    
    // Phase 2: Run Comprehensive Tests
    logSection('Phase 2: Running Comprehensive Backend Tests');
    
    await runBackendTests();
    await runPerformanceTests();
    await runBasicIntegrationTests();
    
    // Phase 3: Generate Report
    logSection('Phase 3: Test Results & Report');
    generateTestReport();
    
    logHeader('🎉 AstraLearn v2 Backend Testing Complete!');
    
    // Keep services running
    logInfo('Backend service is running. Press Ctrl+C to stop.');
    
    // Keep the process alive
    await new Promise(() => {}); // Infinite wait
    
  } catch (error) {
    logError(`Testing failed: ${error.message}`);
    cleanup();
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main().catch((error) => {
    logError(`Fatal error: ${error.message}`);
    cleanup();
    process.exit(1);
  });
}

module.exports = { main, cleanup, testResults };
