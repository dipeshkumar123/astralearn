const io = require('socket.io-client');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

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

// API test helper
async function apiTest(method, endpoint, data = null, headers = {}, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const responseData = await response.json().catch(() => null);
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
      headers: response.headers
    };
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
}

// Authentication helper
async function authenticate(email = 'jane.student@astralearn.com', password = 'password123') {
  const response = await apiTest('POST', '/auth/login', { identifier: email, password });
  if (response.ok && response.data.success) {
    return response.data.data.tokens.accessToken;
  }
  throw new Error('Authentication failed');
}

// Test suites
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  try {
    const response = await apiTest('GET', '/health');
    if (response.ok && response.data.status === 'OK') {
      logTest('Health Check', 'PASS', `Uptime: ${response.data.uptime}s`);
    } else {
      logTest('Health Check', 'FAIL', 'Invalid health response');
    }
  } catch (error) {
    logTest('Health Check', 'FAIL', error.message);
  }
}

async function testAuthenticationEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  // Test user registration
  try {
    const newUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      role: 'student'
    };
    
    const response = await apiTest('POST', '/auth/register', newUser);
    if (response.ok && response.data.success) {
      logTest('User Registration', 'PASS', 'New user created successfully');
    } else {
      logTest('User Registration', 'FAIL', response.data.message || 'Registration failed');
    }
  } catch (error) {
    logTest('User Registration', 'FAIL', error.message);
  }
  
  // Test user login
  try {
    const response = await apiTest('POST', '/auth/login', {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    
    if (response.ok && response.data.success && response.data.data.tokens.accessToken) {
      logTest('User Login', 'PASS', 'Authentication successful');
    } else {
      logTest('User Login', 'FAIL', response.data.message || 'Login failed');
    }
  } catch (error) {
    logTest('User Login', 'FAIL', error.message);
  }
  
  // Test invalid login
  try {
    const response = await apiTest('POST', '/auth/login', {
      identifier: 'invalid@example.com',
      password: 'wrongpassword'
    });
    
    if (!response.ok && response.data.error) {
      logTest('Invalid Login Rejection', 'PASS', 'Invalid credentials properly rejected');
    } else {
      logTest('Invalid Login Rejection', 'FAIL', 'Should reject invalid credentials');
    }
  } catch (error) {
    logTest('Invalid Login Rejection', 'FAIL', error.message);
  }
}

async function testCourseEndpoints() {
  console.log('\n📚 Testing Course Endpoints...');
  
  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Course Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }
  
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  
  // Test get all courses
  try {
    const response = await apiTest('GET', '/courses');
    if (response.ok && Array.isArray(response.data.data)) {
      logTest('Get All Courses', 'PASS', `Found ${response.data.data.length} courses`);
    } else {
      logTest('Get All Courses', 'FAIL', 'Invalid courses response');
    }
  } catch (error) {
    logTest('Get All Courses', 'FAIL', error.message);
  }
  
  // Test get course by ID
  try {
    const response = await apiTest('GET', '/courses/1');
    if (response.ok && response.data.data.id === '1') {
      logTest('Get Course by ID', 'PASS', `Course: ${response.data.data.title}`);
    } else {
      logTest('Get Course by ID', 'FAIL', 'Course not found');
    }
  } catch (error) {
    logTest('Get Course by ID', 'FAIL', error.message);
  }
  
  // Test course enrollment
  try {
    const response = await apiTest('POST', '/courses/1/enroll', null, authHeaders);
    if (response.ok && response.data.success) {
      logTest('Course Enrollment', 'PASS', 'Successfully enrolled in course');
    } else {
      logTest('Course Enrollment', 'FAIL', response.data.message || 'Enrollment failed');
    }
  } catch (error) {
    logTest('Course Enrollment', 'FAIL', error.message);
  }
  
  // Test course progress
  try {
    const response = await apiTest('GET', '/courses/1/progress', null, authHeaders);
    if (response.ok && typeof response.data.data.progressPercentage === 'number') {
      logTest('Course Progress', 'PASS', `Progress: ${response.data.data.progressPercentage}%`);
    } else {
      logTest('Course Progress', 'FAIL', 'Invalid progress response');
    }
  } catch (error) {
    logTest('Course Progress', 'FAIL', error.message);
  }
}

async function testForumEndpoints() {
  console.log('\n💬 Testing Forum Endpoints...');
  
  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Forum Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }
  
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  
  // Test get forum posts
  try {
    const response = await apiTest('GET', '/forum/posts');
    if (response.ok && Array.isArray(response.data.data)) {
      logTest('Get Forum Posts', 'PASS', `Found ${response.data.data.length} posts`);
    } else {
      logTest('Get Forum Posts', 'FAIL', 'Invalid forum posts response');
    }
  } catch (error) {
    logTest('Get Forum Posts', 'FAIL', error.message);
  }
  
  // Test create forum post
  try {
    const newPost = {
      title: `Test Post ${Date.now()}`,
      content: 'This is a test forum post created by automated testing.',
      category: 'general'
    };
    
    const response = await apiTest('POST', '/forum/posts', newPost, authHeaders);
    if (response.ok && response.data.success) {
      logTest('Create Forum Post', 'PASS', `Post ID: ${response.data.data.id}`);
      
      // Test create reply
      const replyResponse = await apiTest('POST', `/forum/posts/${response.data.data.id}/replies`, {
        content: 'This is a test reply.'
      }, authHeaders);
      
      if (replyResponse.ok) {
        logTest('Create Forum Reply', 'PASS', 'Reply created successfully');
      } else {
        logTest('Create Forum Reply', 'FAIL', 'Reply creation failed');
      }
      
      // Test voting
      const voteResponse = await apiTest('POST', `/forum/posts/${response.data.data.id}/vote`, {
        type: 'up'
      }, authHeaders);
      
      if (voteResponse.ok) {
        logTest('Forum Post Voting', 'PASS', 'Vote recorded successfully');
      } else {
        logTest('Forum Post Voting', 'FAIL', 'Voting failed');
      }
      
    } else {
      logTest('Create Forum Post', 'FAIL', response.data.message || 'Post creation failed');
    }
  } catch (error) {
    logTest('Create Forum Post', 'FAIL', error.message);
  }
  
  // Test forum statistics
  try {
    const response = await apiTest('GET', '/forum/stats');
    if (response.ok && typeof response.data.data.totalPosts === 'number') {
      logTest('Forum Statistics', 'PASS', `Total posts: ${response.data.data.totalPosts}`);
    } else {
      logTest('Forum Statistics', 'FAIL', 'Invalid statistics response');
    }
  } catch (error) {
    logTest('Forum Statistics', 'FAIL', error.message);
  }
}

async function testNotificationEndpoints() {
  console.log('\n🔔 Testing Notification Endpoints...');
  
  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Notification Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }
  
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  
  // Test get notifications
  try {
    const response = await apiTest('GET', '/notifications', null, authHeaders);
    if (response.ok && Array.isArray(response.data.data.notifications)) {
      logTest('Get Notifications', 'PASS', `Found ${response.data.data.notifications.length} notifications`);
    } else {
      logTest('Get Notifications', 'FAIL', 'Invalid notifications response');
    }
  } catch (error) {
    logTest('Get Notifications', 'FAIL', error.message);
  }
  
  // Test notification statistics
  try {
    const response = await apiTest('GET', '/notifications/stats', null, authHeaders);
    if (response.ok && typeof response.data.data.total === 'number') {
      logTest('Notification Statistics', 'PASS', `Total: ${response.data.data.total}, Unread: ${response.data.data.unread}`);
    } else {
      logTest('Notification Statistics', 'FAIL', 'Invalid notification stats response');
    }
  } catch (error) {
    logTest('Notification Statistics', 'FAIL', error.message);
  }
  
  // Test mark all as read
  try {
    const response = await apiTest('POST', '/notifications/read-all', null, authHeaders);
    if (response.ok && response.data.success) {
      logTest('Mark All Notifications Read', 'PASS', `Marked ${response.data.data.markedCount} as read`);
    } else {
      logTest('Mark All Notifications Read', 'FAIL', 'Failed to mark notifications as read');
    }
  } catch (error) {
    logTest('Mark All Notifications Read', 'FAIL', error.message);
  }
}

async function testWebSocketConnection() {
  console.log('\n🔌 Testing WebSocket Connection...');
  
  return new Promise((resolve) => {
    try {
      const socket = io(BASE_URL, {
        transports: ['websocket', 'polling']
      });
      
      let connected = false;
      
      socket.on('connect', () => {
        connected = true;
        logTest('WebSocket Connection', 'PASS', `Socket ID: ${socket.id}`);
        socket.disconnect();
        resolve();
      });
      
      socket.on('connect_error', (error) => {
        logTest('WebSocket Connection', 'FAIL', error.message);
        resolve();
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!connected) {
          logTest('WebSocket Connection', 'FAIL', 'Connection timeout');
          socket.disconnect();
        }
        resolve();
      }, 10000);
      
    } catch (error) {
      logTest('WebSocket Connection', 'FAIL', error.message);
      resolve();
    }
  });
}

async function testCertificateEndpoints() {
  console.log('\n🎓 Testing Certificate Endpoints...');

  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Certificate Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Test certificate generation
  try {
    const response = await apiTest('POST', '/courses/1/certificate', null, authHeaders);
    if (response.ok && response.data.success) {
      logTest('Certificate Generation', 'PASS', `Certificate ID: ${response.data.data.certificateId}`);

      // Test certificate verification
      const verifyResponse = await apiTest('GET', `/certificates/${response.data.data.certificateId}/verify`);
      if (verifyResponse.ok && verifyResponse.data.data.verified) {
        logTest('Certificate Verification', 'PASS', 'Certificate verified successfully');
      } else {
        logTest('Certificate Verification', 'FAIL', 'Certificate verification failed');
      }

    } else {
      logTest('Certificate Generation', 'FAIL', response.data.message || 'Certificate generation failed');
    }
  } catch (error) {
    logTest('Certificate Generation', 'FAIL', error.message);
  }

  // Test certificate statistics
  try {
    const instructorToken = await authenticate('john.instructor@astralearn.com', 'password123');
    const response = await apiTest('GET', '/certificates/stats', null, { 'Authorization': `Bearer ${instructorToken}` });
    if (response.ok && typeof response.data.data.total === 'number') {
      logTest('Certificate Statistics', 'PASS', `Total certificates: ${response.data.data.total}`);
    } else {
      logTest('Certificate Statistics', 'FAIL', 'Invalid certificate stats response');
    }
  } catch (error) {
    logTest('Certificate Statistics', 'FAIL', error.message);
  }
}

async function testPaymentEndpoints() {
  console.log('\n💳 Testing Payment Endpoints...');

  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Payment Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Test discount validation
  try {
    const response = await apiTest('POST', '/payments/validate-discount', {
      discountCode: 'STUDENT10',
      courseId: '2'
    }, authHeaders);

    if (response.ok && response.data.data.discountAmount > 0) {
      logTest('Discount Validation', 'PASS', `Discount: $${response.data.data.discountAmount}`);
    } else {
      logTest('Discount Validation', 'FAIL', 'Discount validation failed');
    }
  } catch (error) {
    logTest('Discount Validation', 'FAIL', error.message);
  }

  // Test payment intent creation
  try {
    const response = await apiTest('POST', '/payments/create-intent', {
      courseId: '2',
      paymentMethod: 'card',
      discountCode: 'STUDENT10'
    }, authHeaders);

    if (response.ok && response.data.data.paymentIntentId) {
      logTest('Payment Intent Creation', 'PASS', `Intent ID: ${response.data.data.paymentIntentId}`);
    } else {
      logTest('Payment Intent Creation', 'FAIL', 'Payment intent creation failed');
    }
  } catch (error) {
    logTest('Payment Intent Creation', 'FAIL', error.message);
  }

  // Test payment history
  try {
    const response = await apiTest('GET', '/payments/history', null, authHeaders);
    if (response.ok && Array.isArray(response.data.data.payments)) {
      logTest('Payment History', 'PASS', `Found ${response.data.data.payments.length} payments`);
    } else {
      logTest('Payment History', 'FAIL', 'Invalid payment history response');
    }
  } catch (error) {
    logTest('Payment History', 'FAIL', error.message);
  }
}

async function testAIEndpoints() {
  console.log('\n🤖 Testing AI-Powered Endpoints...');

  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('AI Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Test AI recommendations
  try {
    const response = await apiTest('GET', '/ai/recommendations', null, authHeaders);
    if (response.ok && Array.isArray(response.data.data.recommendations)) {
      logTest('AI Course Recommendations', 'PASS', `Generated ${response.data.data.recommendations.length} recommendations`);
    } else {
      logTest('AI Course Recommendations', 'FAIL', 'AI recommendations failed');
    }
  } catch (error) {
    logTest('AI Course Recommendations', 'FAIL', error.message);
  }

  // Test AI learning path generation
  try {
    const response = await apiTest('POST', '/ai/learning-path', {
      goal: 'Become a full-stack developer',
      timeframe: '6 months',
      currentLevel: 'beginner'
    }, authHeaders);

    if (response.ok && response.data.data.learningPath) {
      logTest('AI Learning Path Generation', 'PASS', 'Learning path generated successfully');
    } else {
      logTest('AI Learning Path Generation', 'FAIL', 'Learning path generation failed');
    }
  } catch (error) {
    logTest('AI Learning Path Generation', 'FAIL', error.message);
  }

  // Test AI Q&A assistant
  try {
    const response = await apiTest('POST', '/ai/ask', {
      question: 'What is JavaScript?',
      context: 'Learning web development',
      courseId: '1'
    }, authHeaders);

    if (response.ok && response.data.data.answer) {
      logTest('AI Q&A Assistant', 'PASS', 'AI response generated successfully');
    } else {
      logTest('AI Q&A Assistant', 'FAIL', 'AI Q&A failed');
    }
  } catch (error) {
    logTest('AI Q&A Assistant', 'FAIL', error.message);
  }

  // Test AI quiz generation
  try {
    const response = await apiTest('POST', '/ai/generate-quiz', {
      courseId: '1',
      difficulty: 'intermediate',
      questionCount: 3
    }, authHeaders);

    if (response.ok && response.data.data.quiz) {
      logTest('AI Quiz Generation', 'PASS', 'Quiz generated successfully');
    } else {
      logTest('AI Quiz Generation', 'FAIL', 'Quiz generation failed');
    }
  } catch (error) {
    logTest('AI Quiz Generation', 'FAIL', error.message);
  }

  // Test AI statistics
  try {
    const response = await apiTest('GET', '/ai/stats', null, authHeaders);
    if (response.ok && typeof response.data.data.totalTokensUsed === 'number') {
      logTest('AI Usage Statistics', 'PASS', `Tokens used: ${response.data.data.totalTokensUsed}`);
    } else {
      logTest('AI Usage Statistics', 'FAIL', 'AI statistics failed');
    }
  } catch (error) {
    logTest('AI Usage Statistics', 'FAIL', error.message);
  }
}

async function testAssessmentEndpoints() {
  console.log('\n📝 Testing Assessment Endpoints...');

  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Assessment Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Test get lesson assessment
  try {
    const response = await apiTest('GET', '/lessons/6/assessment', null, authHeaders);
    if (response.ok && response.data.data.questions) {
      logTest('Get Lesson Assessment', 'PASS', `Found ${response.data.data.questions.length} questions`);
    } else {
      logTest('Get Lesson Assessment', 'FAIL', 'Assessment not found');
    }
  } catch (error) {
    logTest('Get Lesson Assessment', 'FAIL', error.message);
  }

  // Test submit assessment
  try {
    const response = await apiTest('POST', '/assessments/1/submit', {
      answers: [
        { questionId: '1', selectedAnswer: 'A' },
        { questionId: '2', selectedAnswer: 'B' }
      ]
    }, authHeaders);

    if (response.ok && typeof response.data.data.score === 'number') {
      logTest('Submit Assessment', 'PASS', `Score: ${response.data.data.score}%`);
    } else {
      logTest('Submit Assessment', 'FAIL', 'Assessment submission failed');
    }
  } catch (error) {
    logTest('Submit Assessment', 'FAIL', error.message);
  }
}

async function testProgressEndpoints() {
  console.log('\n📈 Testing Progress Tracking Endpoints...');

  let token;
  try {
    token = await authenticate();
  } catch (error) {
    logTest('Progress Tests Setup', 'FAIL', 'Could not authenticate');
    return;
  }

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // Test update lesson progress
  try {
    const response = await apiTest('POST', '/lessons/1/progress', {
      completed: true,
      timeSpent: 300,
      score: 85
    }, authHeaders);

    if (response.ok && response.data.success) {
      logTest('Update Lesson Progress', 'PASS', 'Progress updated successfully');
    } else {
      logTest('Update Lesson Progress', 'FAIL', 'Progress update failed');
    }
  } catch (error) {
    logTest('Update Lesson Progress', 'FAIL', error.message);
  }

  // Test get learning analytics
  try {
    const response = await apiTest('GET', '/analytics/learning/2', null, authHeaders);
    if (response.ok && response.data.data.totalTimeSpent !== undefined) {
      logTest('Learning Analytics', 'PASS', `Total time: ${response.data.data.totalTimeSpent} minutes`);
    } else {
      logTest('Learning Analytics', 'FAIL', 'Analytics retrieval failed');
    }
  } catch (error) {
    logTest('Learning Analytics', 'FAIL', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Comprehensive Backend API Tests...\n');
  
  const startTime = Date.now();
  
  // Run all test suites
  await testHealthEndpoint();
  await testAuthenticationEndpoints();
  await testCourseEndpoints();
  await testForumEndpoints();
  await testNotificationEndpoints();
  await testWebSocketConnection();
  await testCertificateEndpoints();
  await testPaymentEndpoints();
  await testAIEndpoints();
  await testAssessmentEndpoints();
  await testProgressEndpoints();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n⏱️  Backend tests completed in ${duration} seconds`);
  console.log(`📊 Results: ${testResults.passed}/${testResults.total} tests passed`);
  
  return testResults;
}

module.exports = { runAllTests, testResults };
