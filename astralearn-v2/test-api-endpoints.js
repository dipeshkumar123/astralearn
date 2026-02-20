// Comprehensive API endpoints verification
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPIEndpoints() {
  console.log('🧪 Testing All API Endpoints...\n');

  const results = {
    working: [],
    failing: [],
    total: 0
  };

  // Helper function to test endpoint
  async function testEndpoint(name, method, url, data = null, headers = {}) {
    results.total++;
    try {
      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(url, { headers });
          break;
        case 'post':
          response = await axios.post(url, data, { headers });
          break;
        case 'put':
          response = await axios.put(url, data, { headers });
          break;
        case 'delete':
          response = await axios.delete(url, { headers });
          break;
        default:
          throw new Error('Unsupported method');
      }
      
      console.log(`✅ ${name}: ${method.toUpperCase()} ${url} - Status: ${response.status}`);
      results.working.push({ name, method, url, status: response.status });
      return response;
    } catch (error) {
      const status = error.response?.status || 'Connection Error';
      const message = error.response?.data?.message || error.message;
      console.log(`❌ ${name}: ${method.toUpperCase()} ${url} - Status: ${status} - ${message}`);
      results.failing.push({ name, method, url, status, message });
      return null;
    }
  }

  try {
    console.log('🔧 Setting up test data...');
    
    // Get auth tokens
    const instructorLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'john.instructor@astralearn.com',
      password: 'password123'
    });
    const instructorToken = instructorLogin.data.data.tokens.accessToken;
    
    const studentLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    const studentToken = studentLogin.data.data.tokens.accessToken;
    
    console.log('✅ Auth tokens obtained\n');

    // Test 1: Health and Info Endpoints
    console.log('1️⃣ Testing Health & Info Endpoints...');
    await testEndpoint('Health Check', 'GET', `${BASE_URL}/health`);
    await testEndpoint('API Info', 'GET', `${BASE_URL}/api`);
    console.log('');

    // Test 2: Authentication Endpoints
    console.log('2️⃣ Testing Authentication Endpoints...');
    
    // Test registration with new user
    const newUserData = {
      email: 'endpoint.test@astralearn.com',
      username: 'endpointtest',
      password: 'password123',
      firstName: 'Endpoint',
      lastName: 'Test',
      role: 'student'
    };
    await testEndpoint('User Registration', 'POST', `${BASE_URL}/api/auth/register`, newUserData);
    
    // Test login
    await testEndpoint('User Login', 'POST', `${BASE_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    
    // Test profile access
    await testEndpoint('Get Profile', 'GET', `${BASE_URL}/api/auth/me`, null, {
      Authorization: `Bearer ${studentToken}`
    });
    
    // Test invalid token
    await testEndpoint('Invalid Token', 'GET', `${BASE_URL}/api/auth/me`, null, {
      Authorization: 'Bearer invalid-token'
    });
    
    // Test missing token
    await testEndpoint('Missing Token', 'GET', `${BASE_URL}/api/auth/me`);
    console.log('');

    // Test 3: Course Management Endpoints
    console.log('3️⃣ Testing Course Management Endpoints...');
    
    // Get all courses
    const coursesResponse = await testEndpoint('Get All Courses', 'GET', `${BASE_URL}/api/courses`);
    
    // Get courses with filters
    await testEndpoint('Filter by Category', 'GET', `${BASE_URL}/api/courses?category=Programming`);
    await testEndpoint('Filter by Difficulty', 'GET', `${BASE_URL}/api/courses?difficulty=beginner`);
    await testEndpoint('Search Courses', 'GET', `${BASE_URL}/api/courses?search=JavaScript`);
    await testEndpoint('Multiple Filters', 'GET', `${BASE_URL}/api/courses?category=Programming&difficulty=intermediate`);
    
    // Get specific course
    if (coursesResponse && coursesResponse.data.data.length > 0) {
      const courseId = coursesResponse.data.data[0].id;
      await testEndpoint('Get Course by ID', 'GET', `${BASE_URL}/api/courses/${courseId}`);
      
      // Test enrollment
      await testEndpoint('Course Enrollment', 'POST', `${BASE_URL}/api/courses/${courseId}/enroll`, {}, {
        Authorization: `Bearer ${studentToken}`
      });
      
      // Test duplicate enrollment
      await testEndpoint('Duplicate Enrollment', 'POST', `${BASE_URL}/api/courses/${courseId}/enroll`, {}, {
        Authorization: `Bearer ${studentToken}`
      });
    }
    
    // Test course creation
    const newCourseData = {
      title: 'API Test Course',
      description: 'Course created during API testing',
      category: 'Testing',
      difficulty: 'beginner',
      price: 0,
      duration: 30
    };
    await testEndpoint('Create Course (Instructor)', 'POST', `${BASE_URL}/api/courses`, newCourseData, {
      Authorization: `Bearer ${instructorToken}`
    });
    
    // Test course creation as student (should fail)
    await testEndpoint('Create Course (Student)', 'POST', `${BASE_URL}/api/courses`, newCourseData, {
      Authorization: `Bearer ${studentToken}`
    });
    
    // Test course creation without auth (should fail)
    await testEndpoint('Create Course (No Auth)', 'POST', `${BASE_URL}/api/courses`, newCourseData);
    
    // Test non-existent course
    await testEndpoint('Non-existent Course', 'GET', `${BASE_URL}/api/courses/999999`);
    console.log('');

    // Test 4: Error Handling Endpoints
    console.log('4️⃣ Testing Error Handling...');
    
    // Test 404 endpoints
    await testEndpoint('404 Endpoint', 'GET', `${BASE_URL}/api/nonexistent`);
    await testEndpoint('404 Root', 'GET', `${BASE_URL}/nonexistent`);
    
    // Test malformed requests
    await testEndpoint('Malformed Registration', 'POST', `${BASE_URL}/api/auth/register`, {
      email: 'invalid-email',
      // missing required fields
    });
    
    await testEndpoint('Malformed Login', 'POST', `${BASE_URL}/api/auth/login`, {
      // missing credentials
    });
    
    await testEndpoint('Malformed Course', 'POST', `${BASE_URL}/api/courses`, {
      title: 'Test',
      // missing required fields
    }, {
      Authorization: `Bearer ${instructorToken}`
    });
    console.log('');

    // Test 5: HTTP Methods on Endpoints
    console.log('5️⃣ Testing HTTP Methods...');
    
    // Test unsupported methods
    await testEndpoint('PUT on Courses', 'PUT', `${BASE_URL}/api/courses`, {});
    await testEndpoint('DELETE on Health', 'DELETE', `${BASE_URL}/health`);
    console.log('');

    // Test 6: CORS and Headers
    console.log('6️⃣ Testing CORS and Headers...');
    
    // Test with different origins (simulated)
    await testEndpoint('CORS Test', 'GET', `${BASE_URL}/api`, null, {
      'Origin': 'http://localhost:3000'
    });
    
    await testEndpoint('Content-Type Test', 'POST', `${BASE_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    }, {
      'Content-Type': 'application/json'
    });
    console.log('');

    // Results Summary
    console.log('📊 API ENDPOINTS TEST RESULTS');
    console.log('=' .repeat(50));
    console.log(`Total Endpoints Tested: ${results.total}`);
    console.log(`✅ Working: ${results.working.length}`);
    console.log(`❌ Failing: ${results.failing.length}`);
    console.log(`📈 Success Rate: ${((results.working.length / results.total) * 100).toFixed(1)}%`);
    console.log('');

    if (results.working.length > 0) {
      console.log('✅ WORKING ENDPOINTS:');
      results.working.forEach(endpoint => {
        console.log(`   ${endpoint.method} ${endpoint.url} (${endpoint.status})`);
      });
      console.log('');
    }

    if (results.failing.length > 0) {
      console.log('❌ FAILING ENDPOINTS:');
      results.failing.forEach(endpoint => {
        console.log(`   ${endpoint.method} ${endpoint.url} (${endpoint.status})`);
      });
      console.log('');
    }

    console.log('🎉 API Endpoints verification completed!');

  } catch (error) {
    console.error('❌ API endpoints test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAPIEndpoints();
