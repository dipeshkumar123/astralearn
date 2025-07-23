const os = require('os');
const { performance } = require('perf_hooks');

// Test configuration
const BACKEND_URL = 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  metrics: []
};

// Test utilities
function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name} - ${status} ${details}`);
  
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.metrics.push({ name, status, details, timestamp: new Date().toISOString() });
}

// Performance measurement utilities
function measureTime(fn) {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    return { result, duration: end - start };
  };
}

// API helper
async function apiCall(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return {
    status: response.status,
    ok: response.ok,
    data: await response.json().catch(() => null)
  };
}

// Authentication helper
async function authenticate() {
  const response = await apiCall('POST', '/auth/login', {
    identifier: 'jane.student@astralearn.com',
    password: 'password123'
  });
  
  if (response.ok && response.data.success) {
    return response.data.data.tokens.accessToken;
  }
  throw new Error('Authentication failed');
}

// Test suites
async function testAPIResponseTimes() {
  console.log('\n⚡ Testing API Response Times...');
  
  const endpoints = [
    { method: 'GET', path: '/health', name: 'Health Check' },
    { method: 'GET', path: '/courses', name: 'Get Courses' },
    { method: 'GET', path: '/courses/1', name: 'Get Course Details' },
    { method: 'GET', path: '/forum/posts', name: 'Get Forum Posts' },
    { method: 'GET', path: '/forum/stats', name: 'Get Forum Stats' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const measuredCall = measureTime(apiCall);
      const { result, duration } = await measuredCall(endpoint.method, endpoint.path);
      
      if (result.ok && duration < 500) {
        logTest(`${endpoint.name} Response Time`, 'PASS', `${duration.toFixed(2)}ms`);
      } else if (result.ok && duration < 1000) {
        logTest(`${endpoint.name} Response Time`, 'PASS', `${duration.toFixed(2)}ms (acceptable)`);
      } else {
        logTest(`${endpoint.name} Response Time`, 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
      }
    } catch (error) {
      logTest(`${endpoint.name} Response Time`, 'FAIL', error.message);
    }
  }
}

async function testAuthenticatedEndpoints() {
  console.log('\n🔐 Testing Authenticated Endpoint Performance...');
  
  let token;
  try {
    const measuredAuth = measureTime(authenticate);
    const { result, duration } = await measuredAuth();
    token = result;
    
    if (duration < 1000) {
      logTest('Authentication Performance', 'PASS', `${duration.toFixed(2)}ms`);
    } else {
      logTest('Authentication Performance', 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
    }
  } catch (error) {
    logTest('Authentication Performance', 'FAIL', error.message);
    return;
  }
  
  const authenticatedEndpoints = [
    { method: 'GET', path: '/notifications', name: 'Get Notifications' },
    { method: 'GET', path: '/courses/1/progress', name: 'Get Course Progress' },
    { method: 'GET', path: '/ai/recommendations', name: 'AI Recommendations' },
    { method: 'GET', path: '/payments/history', name: 'Payment History' }
  ];
  
  for (const endpoint of authenticatedEndpoints) {
    try {
      const measuredCall = measureTime(apiCall);
      const { result, duration } = await measuredCall(endpoint.method, endpoint.path, null, token);
      
      if (result.ok && duration < 1000) {
        logTest(`${endpoint.name} Performance`, 'PASS', `${duration.toFixed(2)}ms`);
      } else if (result.ok && duration < 2000) {
        logTest(`${endpoint.name} Performance`, 'PASS', `${duration.toFixed(2)}ms (acceptable)`);
      } else {
        logTest(`${endpoint.name} Performance`, 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
      }
    } catch (error) {
      logTest(`${endpoint.name} Performance`, 'FAIL', error.message);
    }
  }
}

async function testConcurrentRequests() {
  console.log('\n🔄 Testing Concurrent Request Handling...');
  
  const concurrentRequests = 10;
  const endpoint = '/courses';
  
  try {
    const startTime = performance.now();
    
    // Create multiple concurrent requests
    const promises = Array(concurrentRequests).fill().map(() => 
      apiCall('GET', endpoint)
    );
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    const avgDuration = totalDuration / concurrentRequests;
    
    const successfulRequests = results.filter(r => r.ok).length;
    
    if (successfulRequests === concurrentRequests && avgDuration < 1000) {
      logTest('Concurrent Request Handling', 'PASS', 
        `${successfulRequests}/${concurrentRequests} successful, avg: ${avgDuration.toFixed(2)}ms`);
    } else if (successfulRequests >= concurrentRequests * 0.8) {
      logTest('Concurrent Request Handling', 'PASS', 
        `${successfulRequests}/${concurrentRequests} successful (acceptable)`);
    } else {
      logTest('Concurrent Request Handling', 'FAIL', 
        `Only ${successfulRequests}/${concurrentRequests} successful`);
    }
  } catch (error) {
    logTest('Concurrent Request Handling', 'FAIL', error.message);
  }
}

async function testMemoryUsage() {
  console.log('\n💾 Testing Memory Usage...');
  
  const initialMemory = process.memoryUsage();
  
  try {
    // Perform memory-intensive operations
    const operations = [];
    
    for (let i = 0; i < 100; i++) {
      operations.push(apiCall('GET', '/courses'));
    }
    
    await Promise.all(operations);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
    
    if (memoryIncrease < 50) {
      logTest('Memory Usage', 'PASS', `Memory increase: ${memoryIncrease.toFixed(2)}MB`);
    } else if (memoryIncrease < 100) {
      logTest('Memory Usage', 'PASS', `Memory increase: ${memoryIncrease.toFixed(2)}MB (acceptable)`);
    } else {
      logTest('Memory Usage', 'FAIL', `High memory increase: ${memoryIncrease.toFixed(2)}MB`);
    }
    
    // Test memory cleanup
    setTimeout(() => {
      const cleanupMemory = process.memoryUsage();
      const finalIncrease = (cleanupMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      
      if (finalIncrease < memoryIncrease * 0.8) {
        logTest('Memory Cleanup', 'PASS', `Memory cleaned up: ${finalIncrease.toFixed(2)}MB remaining`);
      } else {
        logTest('Memory Cleanup', 'FAIL', `Poor memory cleanup: ${finalIncrease.toFixed(2)}MB remaining`);
      }
    }, 2000);
    
  } catch (error) {
    logTest('Memory Usage', 'FAIL', error.message);
  }
}

async function testDatabaseOperations() {
  console.log('\n🗄️ Testing Database Operation Performance...');
  
  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Database Tests Setup', 'FAIL', 'Authentication failed');
    return;
  }
  
  // Test read operations
  try {
    const measuredRead = measureTime(apiCall);
    const { result, duration } = await measuredRead('GET', '/courses', null, token);
    
    if (result.ok && duration < 200) {
      logTest('Database Read Performance', 'PASS', `${duration.toFixed(2)}ms`);
    } else if (result.ok && duration < 500) {
      logTest('Database Read Performance', 'PASS', `${duration.toFixed(2)}ms (acceptable)`);
    } else {
      logTest('Database Read Performance', 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
    }
  } catch (error) {
    logTest('Database Read Performance', 'FAIL', error.message);
  }
  
  // Test write operations
  try {
    const measuredWrite = measureTime(apiCall);
    const { result, duration } = await measuredWrite('POST', '/lessons/1/progress', {
      completed: true,
      timeSpent: 300,
      score: 85
    }, token);
    
    if (result.ok && duration < 500) {
      logTest('Database Write Performance', 'PASS', `${duration.toFixed(2)}ms`);
    } else if (result.ok && duration < 1000) {
      logTest('Database Write Performance', 'PASS', `${duration.toFixed(2)}ms (acceptable)`);
    } else {
      logTest('Database Write Performance', 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
    }
  } catch (error) {
    logTest('Database Write Performance', 'FAIL', error.message);
  }
}

async function testFileOperationPerformance() {
  console.log('\n📁 Testing File Operation Performance...');
  
  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('File Operation Tests Setup', 'FAIL', 'Authentication failed');
    return;
  }
  
  // Test certificate generation performance
  try {
    const measuredCertGen = measureTime(apiCall);
    const { result, duration } = await measuredCertGen('POST', '/courses/1/certificate', null, token);
    
    if (result.ok && duration < 2000) {
      logTest('Certificate Generation Performance', 'PASS', `${duration.toFixed(2)}ms`);
      
      // Test certificate download performance
      if (result.data.data.certificateId) {
        const downloadStart = performance.now();
        const downloadResponse = await fetch(`${API_URL}/certificates/${result.data.data.certificateId}/download`);
        const downloadDuration = performance.now() - downloadStart;
        
        if (downloadResponse.ok && downloadDuration < 1000) {
          logTest('Certificate Download Performance', 'PASS', `${downloadDuration.toFixed(2)}ms`);
        } else {
          logTest('Certificate Download Performance', 'FAIL', `${downloadDuration.toFixed(2)}ms (too slow)`);
        }
      }
    } else {
      logTest('Certificate Generation Performance', 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
    }
  } catch (error) {
    logTest('Certificate Generation Performance', 'FAIL', error.message);
  }
}

async function testSystemResourceUsage() {
  console.log('\n🖥️ Testing System Resource Usage...');
  
  const initialCPU = process.cpuUsage();
  const startTime = performance.now();
  
  try {
    // Perform CPU-intensive operations
    const operations = [];
    for (let i = 0; i < 50; i++) {
      operations.push(apiCall('GET', '/ai/recommendations', null, await authenticate()));
    }
    
    await Promise.all(operations);
    
    const endTime = performance.now();
    const finalCPU = process.cpuUsage(initialCPU);
    const cpuUsage = (finalCPU.user + finalCPU.system) / 1000; // Convert to milliseconds
    const duration = endTime - startTime;
    const cpuPercentage = (cpuUsage / duration) * 100;
    
    if (cpuPercentage < 80) {
      logTest('CPU Usage', 'PASS', `${cpuPercentage.toFixed(2)}% CPU usage`);
    } else {
      logTest('CPU Usage', 'FAIL', `High CPU usage: ${cpuPercentage.toFixed(2)}%`);
    }
    
    // Test system memory
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercentage = (usedMemory / totalMemory) * 100;
    
    if (memoryUsagePercentage < 80) {
      logTest('System Memory Usage', 'PASS', `${memoryUsagePercentage.toFixed(2)}% system memory used`);
    } else {
      logTest('System Memory Usage', 'FAIL', `High system memory usage: ${memoryUsagePercentage.toFixed(2)}%`);
    }
    
  } catch (error) {
    logTest('System Resource Usage', 'FAIL', error.message);
  }
}

async function testScalabilityMetrics() {
  console.log('\n📈 Testing Scalability Metrics...');
  
  const testSizes = [1, 5, 10, 20];
  const results = [];
  
  for (const size of testSizes) {
    try {
      const startTime = performance.now();
      
      const promises = Array(size).fill().map(() => apiCall('GET', '/courses'));
      await Promise.all(promises);
      
      const duration = performance.now() - startTime;
      const avgResponseTime = duration / size;
      
      results.push({ size, duration, avgResponseTime });
      
      if (avgResponseTime < 500) {
        logTest(`Scalability Test (${size} requests)`, 'PASS', 
          `Avg response: ${avgResponseTime.toFixed(2)}ms`);
      } else {
        logTest(`Scalability Test (${size} requests)`, 'FAIL', 
          `Slow avg response: ${avgResponseTime.toFixed(2)}ms`);
      }
    } catch (error) {
      logTest(`Scalability Test (${size} requests)`, 'FAIL', error.message);
    }
  }
  
  // Analyze scalability trend
  if (results.length >= 2) {
    const firstResult = results[0];
    const lastResult = results[results.length - 1];
    const scalabilityRatio = lastResult.avgResponseTime / firstResult.avgResponseTime;
    
    if (scalabilityRatio < 2) {
      logTest('Scalability Trend', 'PASS', `Good scalability ratio: ${scalabilityRatio.toFixed(2)}x`);
    } else {
      logTest('Scalability Trend', 'FAIL', `Poor scalability ratio: ${scalabilityRatio.toFixed(2)}x`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('⚡ Starting Comprehensive Performance Tests...\n');
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    await testAPIResponseTimes();
    await testAuthenticatedEndpoints();
    await testConcurrentRequests();
    await testMemoryUsage();
    await testDatabaseOperations();
    await testFileOperationPerformance();
    await testSystemResourceUsage();
    await testScalabilityMetrics();
    
  } catch (error) {
    console.error('Performance testing failed:', error);
    logTest('Performance Test Suite', 'FAIL', error.message);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n⏱️  Performance tests completed in ${duration} seconds`);
  console.log(`📊 Results: ${testResults.passed}/${testResults.total} tests passed`);
  
  return testResults;
}

module.exports = { runAllTests, testResults };
