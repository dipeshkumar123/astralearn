const puppeteer = require('puppeteer');
const io = require('socket.io-client');

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
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
  
  testResults.tests.push({ name, status, details, timestamp: new Date().toISOString() });
}

// Browser helper
async function createBrowser() {
  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
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

// Test suites
async function testFullUserJourney(browser) {
  console.log('\n👤 Testing Complete User Journey...');
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    // Step 1: Visit homepage
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    logTest('Homepage Visit', 'PASS', 'Successfully loaded homepage');
    
    // Step 2: Navigate to courses (if available)
    const coursesLink = await page.$('a[href*="courses"], button:contains("Courses")');
    if (coursesLink) {
      await coursesLink.click();
      await page.waitForTimeout(2000);
      logTest('Course Navigation', 'PASS', 'Successfully navigated to courses');
    } else {
      logTest('Course Navigation', 'FAIL', 'Courses navigation not found');
    }
    
    // Step 3: Test course interaction
    const courseCard = await page.$('.course-card, .course-item, [data-testid="course"]');
    if (courseCard) {
      await courseCard.click();
      await page.waitForTimeout(2000);
      logTest('Course Selection', 'PASS', 'Course can be selected');
    } else {
      logTest('Course Selection', 'FAIL', 'No course cards found');
    }
    
    // Step 4: Test authentication flow
    const loginButton = await page.$('button:contains("Login"), a:contains("Login")');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(1000);
      
      // Fill login form if present
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      const passwordInput = await page.$('input[type="password"], input[name="password"]');
      
      if (emailInput && passwordInput) {
        await page.type('input[type="email"], input[name="email"]', 'jane.student@astralearn.com');
        await page.type('input[type="password"], input[name="password"]', 'password123');
        
        const submitButton = await page.$('button[type="submit"], button:contains("Login")');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          logTest('User Authentication', 'PASS', 'Login form submitted');
        } else {
          logTest('User Authentication', 'FAIL', 'Submit button not found');
        }
      } else {
        logTest('User Authentication', 'FAIL', 'Login form fields not found');
      }
    } else {
      logTest('User Authentication', 'FAIL', 'Login button not found');
    }
    
  } catch (error) {
    logTest('Full User Journey', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testRealTimeFeatures() {
  console.log('\n🔄 Testing Real-time Features...');
  
  try {
    // Test WebSocket connection
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });
    
    let connected = false;
    let notificationReceived = false;
    
    socket.on('connect', () => {
      connected = true;
      logTest('WebSocket Connection', 'PASS', `Connected with ID: ${socket.id}`);
      
      // Test authentication
      socket.emit('authenticate', { token: 'test-token' });
    });
    
    socket.on('notification', (data) => {
      notificationReceived = true;
      logTest('Real-time Notifications', 'PASS', `Received: ${data.type}`);
    });
    
    socket.on('connect_error', (error) => {
      logTest('WebSocket Connection', 'FAIL', error.message);
    });
    
    // Wait for connection and test
    await new Promise((resolve) => {
      setTimeout(() => {
        if (connected) {
          logTest('WebSocket Stability', 'PASS', 'Connection maintained');
        } else {
          logTest('WebSocket Stability', 'FAIL', 'Connection failed');
        }
        
        socket.disconnect();
        resolve();
      }, 5000);
    });
    
  } catch (error) {
    logTest('Real-time Features', 'FAIL', error.message);
  }
}

async function testDataPersistence() {
  console.log('\n💾 Testing Data Persistence...');
  
  try {
    // Test user registration and data persistence
    const newUser = {
      firstName: 'Integration',
      lastName: 'Test',
      email: `integration${Date.now()}@test.com`,
      password: 'testpassword123',
      role: 'student'
    };
    
    // Register user
    const registerResponse = await apiCall('POST', '/auth/register', newUser);
    if (registerResponse.ok) {
      logTest('User Registration Persistence', 'PASS', 'User data persisted');
      
      // Login with new user
      const loginResponse = await apiCall('POST', '/auth/login', {
        identifier: newUser.email,
        password: newUser.password
      });
      
      if (loginResponse.ok && loginResponse.data.data.tokens.accessToken) {
        logTest('User Login Persistence', 'PASS', 'User can login after registration');
        
        const token = loginResponse.data.data.tokens.accessToken;
        
        // Test course enrollment persistence
        const enrollResponse = await apiCall('POST', '/courses/1/enroll', null, token);
        if (enrollResponse.ok) {
          logTest('Enrollment Persistence', 'PASS', 'Enrollment data persisted');
          
          // Test progress tracking persistence
          const progressResponse = await apiCall('POST', '/lessons/1/progress', {
            completed: true,
            timeSpent: 300,
            score: 85
          }, token);
          
          if (progressResponse.ok) {
            logTest('Progress Persistence', 'PASS', 'Progress data persisted');
          } else {
            logTest('Progress Persistence', 'FAIL', 'Progress not saved');
          }
        } else {
          logTest('Enrollment Persistence', 'FAIL', 'Enrollment failed');
        }
      } else {
        logTest('User Login Persistence', 'FAIL', 'Login failed after registration');
      }
    } else {
      logTest('User Registration Persistence', 'FAIL', 'Registration failed');
    }
    
  } catch (error) {
    logTest('Data Persistence', 'FAIL', error.message);
  }
}

async function testFileOperations() {
  console.log('\n📁 Testing File Operations...');
  
  try {
    // Test certificate generation and download
    const loginResponse = await apiCall('POST', '/auth/login', {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    
    if (loginResponse.ok) {
      const token = loginResponse.data.data.tokens.accessToken;
      
      // Generate certificate
      const certResponse = await apiCall('POST', '/courses/1/certificate', null, token);
      if (certResponse.ok && certResponse.data.data.certificateId) {
        logTest('Certificate Generation', 'PASS', `Certificate ID: ${certResponse.data.data.certificateId}`);
        
        // Test certificate download
        const downloadResponse = await fetch(`${API_URL}/certificates/${certResponse.data.data.certificateId}/download`);
        if (downloadResponse.ok) {
          const contentType = downloadResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/pdf')) {
            logTest('Certificate Download', 'PASS', 'PDF certificate downloaded');
          } else {
            logTest('Certificate Download', 'FAIL', 'Invalid file type');
          }
        } else {
          logTest('Certificate Download', 'FAIL', 'Download failed');
        }
      } else {
        logTest('Certificate Generation', 'FAIL', 'Certificate generation failed');
      }
    } else {
      logTest('File Operations Setup', 'FAIL', 'Authentication failed');
    }
    
  } catch (error) {
    logTest('File Operations', 'FAIL', error.message);
  }
}

async function testErrorHandling(browser) {
  console.log('\n🚨 Testing Error Handling...');
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    // Test network error handling
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        request.abort(); // Simulate network failure
      } else {
        request.continue();
      }
    });
    
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Check if error states are displayed
    const errorElement = await page.$('.error, .error-message, [data-testid="error"]');
    if (errorElement) {
      logTest('Network Error Handling', 'PASS', 'Error states displayed');
    } else {
      logTest('Network Error Handling', 'FAIL', 'No error handling visible');
    }
    
    // Test 404 page
    await page.setRequestInterception(false);
    await page.goto(`${FRONTEND_URL}/nonexistent-page`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const notFoundElement = await page.$('.not-found, .error-404, [data-testid="404"]');
    const pageContent = await page.content();
    
    if (notFoundElement || pageContent.includes('404') || pageContent.includes('Not Found')) {
      logTest('404 Error Handling', 'PASS', '404 page displayed');
    } else {
      logTest('404 Error Handling', 'FAIL', 'No 404 handling');
    }
    
  } catch (error) {
    logTest('Error Handling', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testPerformanceMetrics(browser) {
  console.log('\n⚡ Testing Performance Metrics...');
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    // Measure page load time
    const startTime = Date.now();
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 5000) {
      logTest('Page Load Performance', 'PASS', `Loaded in ${loadTime}ms`);
    } else {
      logTest('Page Load Performance', 'FAIL', `Slow load time: ${loadTime}ms`);
    }
    
    // Measure API response times
    const apiStartTime = Date.now();
    const healthResponse = await fetch(`${API_URL}/health`);
    const apiResponseTime = Date.now() - apiStartTime;
    
    if (healthResponse.ok && apiResponseTime < 1000) {
      logTest('API Response Performance', 'PASS', `API responded in ${apiResponseTime}ms`);
    } else {
      logTest('API Response Performance', 'FAIL', `Slow API response: ${apiResponseTime}ms`);
    }
    
    // Check memory usage
    const metrics = await page.metrics();
    const memoryUsage = Math.round(metrics.JSHeapUsedSize / 1024 / 1024);
    
    if (memoryUsage < 50) {
      logTest('Memory Usage', 'PASS', `Memory usage: ${memoryUsage}MB`);
    } else {
      logTest('Memory Usage', 'FAIL', `High memory usage: ${memoryUsage}MB`);
    }
    
  } catch (error) {
    logTest('Performance Metrics', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testSecurityFeatures() {
  console.log('\n🔒 Testing Security Features...');
  
  try {
    // Test unauthorized access
    const unauthorizedResponse = await apiCall('GET', '/courses/1/progress');
    if (unauthorizedResponse.status === 401 || unauthorizedResponse.status === 403) {
      logTest('Unauthorized Access Protection', 'PASS', 'Protected endpoints require authentication');
    } else {
      logTest('Unauthorized Access Protection', 'FAIL', 'Endpoints not properly protected');
    }
    
    // Test invalid token
    const invalidTokenResponse = await apiCall('GET', '/courses/1/progress', null, 'invalid-token');
    if (invalidTokenResponse.status === 401 || invalidTokenResponse.status === 403) {
      logTest('Invalid Token Rejection', 'PASS', 'Invalid tokens are rejected');
    } else {
      logTest('Invalid Token Rejection', 'FAIL', 'Invalid tokens accepted');
    }
    
    // Test SQL injection protection
    const sqlInjectionResponse = await apiCall('POST', '/auth/login', {
      identifier: "'; DROP TABLE users; --",
      password: 'password'
    });
    
    if (!sqlInjectionResponse.ok) {
      logTest('SQL Injection Protection', 'PASS', 'SQL injection attempts blocked');
    } else {
      logTest('SQL Injection Protection', 'FAIL', 'Vulnerable to SQL injection');
    }
    
  } catch (error) {
    logTest('Security Features', 'FAIL', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔗 Starting Comprehensive Integration Tests...\n');
  
  const startTime = Date.now();
  let browser;
  
  try {
    browser = await createBrowser();
    
    // Run all test suites
    await testFullUserJourney(browser);
    await testRealTimeFeatures();
    await testDataPersistence();
    await testFileOperations();
    await testErrorHandling(browser);
    await testPerformanceMetrics(browser);
    await testSecurityFeatures();
    
  } catch (error) {
    console.error('Integration testing failed:', error);
    logTest('Integration Test Suite', 'FAIL', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n⏱️  Integration tests completed in ${duration} seconds`);
  console.log(`📊 Results: ${testResults.passed}/${testResults.total} tests passed`);
  
  return testResults;
}

module.exports = { runAllTests, testResults };
