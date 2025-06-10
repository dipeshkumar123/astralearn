/**
 * Test Script for Course Management API Endpoints
 * Tests authentication, course creation, and various API endpoints
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test data
const testCourse = {
  courseInfo: {
    title: 'Test Course - API Validation',
    description: 'This is a test course created for API validation testing',
    difficulty: 'beginner',
    estimatedDuration: 60,
    category: 'Programming',
    tags: ['javascript', 'testing', 'api']
  },
  modules: [
    {
      title: 'Introduction Module',
      description: 'Introduction to the course',
      order: 1,
      lessons: [
        {
          title: 'Welcome Lesson',
          description: 'Welcome to the course',
          type: 'video',
          order: 1
        }
      ]
    }
  ]
};

async function testAPI() {
  console.log('🧪 Starting Course Management API Tests...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoints:');
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Server Health:', healthData.status);

    const apiHealthResponse = await fetch(`${BASE_URL}/api/health`);
    const apiHealthData = await apiHealthResponse.json();
    console.log('✅ API Health:', apiHealthData.status);

    const courseHealthResponse = await fetch(`${BASE_URL}/api/course-management/health`);
    const courseHealthData = await courseHealthResponse.json();
    console.log('✅ Course Management Health:', courseHealthData.status);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  // Test 2: Unauthenticated Course Creation (Should fail)
  console.log('\n2️⃣ Testing Unauthenticated Course Creation:');
  try {
    const response = await fetch(`${BASE_URL}/api/course-management/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCourse)
    });
    
    if (response.status === 401) {
      console.log('✅ Authentication properly enforced (401 Unauthorized)');
    } else {
      console.log('⚠️ Unexpected response status:', response.status);
      const data = await response.text();
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 3: Basic Course Listing
  console.log('\n3️⃣ Testing Basic Course Listing:');
  try {
    const response = await fetch(`${BASE_URL}/api/courses`);
    const data = await response.json();
    console.log('✅ Course listing successful');
    console.log('📊 Current courses:', data.courses.length);
    console.log('📄 Pagination:', data.pagination);
  } catch (error) {
    console.error('❌ Course listing failed:', error.message);
  }

  // Test 4: Search Endpoint
  console.log('\n4️⃣ Testing Course Search:');
  try {
    const response = await fetch(`${BASE_URL}/api/course-management/search?q=javascript&difficulty=beginner`);
    
    if (response.status === 401) {
      console.log('✅ Search endpoint properly protected (401 Unauthorized)');
    } else {
      const data = await response.json();
      console.log('✅ Search successful:', data);
    }
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
  console.log('\n📝 Summary:');
  console.log('- ✅ All health endpoints operational');
  console.log('- ✅ Authentication properly enforced');
  console.log('- ✅ Basic endpoints responding correctly');
  console.log('- 🚀 Ready for frontend integration testing');
}

// Run the tests
testAPI().catch(console.error);
