// Test course page with authentication
const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';

async function testCoursePageWithAuth() {
  console.log('🧪 Testing Course Page with Authentication...\n');

  try {
    // Test 1: Try accessing course page without authentication
    console.log('1️⃣ Testing unauthenticated access...');
    try {
      const unauthResponse = await axios.get(`${FRONTEND_URL}/courses`, {
        maxRedirects: 0, // Don't follow redirects
        validateStatus: function (status) {
          return status < 400; // Accept any status less than 400
        }
      });
      console.log(`✅ Unauthenticated access: Status ${unauthResponse.status}`);
    } catch (error) {
      if (error.response?.status === 302 || error.response?.status === 301) {
        console.log(`✅ Unauthenticated access: Redirected (${error.response.status}) - Expected behavior`);
      } else {
        console.log(`❌ Unauthenticated access failed: ${error.message}`);
      }
    }

    // Test 2: Login and get session
    console.log('');
    console.log('2️⃣ Testing login and session...');
    try {
      const loginResponse = await axios.post(`${FRONTEND_URL}/api/auth/login`, {
        identifier: 'jane.student@astralearn.com',
        password: 'password123'
      });
      
      const token = loginResponse.data.data.tokens.accessToken;
      console.log('✅ Login successful, token received');
      
      // Test authenticated API access
      const authApiResponse = await axios.get(`${FRONTEND_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Authenticated API access: ${authApiResponse.data.total} courses`);
      
    } catch (error) {
      console.log(`❌ Login/API test failed: ${error.message}`);
    }

    // Test 3: Check if course page loads with proper session
    console.log('');
    console.log('3️⃣ Testing course page with session...');
    console.log('   Note: This test shows the HTML response, not the React app state');
    
    try {
      const coursePageResponse = await axios.get(`${FRONTEND_URL}/courses`);
      const htmlContent = coursePageResponse.data;
      
      if (htmlContent.includes('Browse Courses') || htmlContent.includes('Available Courses')) {
        console.log('✅ Course page HTML contains expected content');
      } else if (htmlContent.includes('login') || htmlContent.includes('Login')) {
        console.log('⚠️ Course page redirected to login (authentication required)');
      } else {
        console.log('❓ Course page returned unexpected content');
      }
      
    } catch (error) {
      console.log(`❌ Course page test failed: ${error.message}`);
    }

    console.log('');
    console.log('📋 COURSE PAGE AUTHENTICATION ANALYSIS:');
    console.log('');
    console.log('🔍 AUTHENTICATION FLOW:');
    console.log('   1. Course page is wrapped in ProtectedRoute');
    console.log('   2. ProtectedRoute checks isAuthenticated from auth store');
    console.log('   3. If not authenticated, redirects to /login');
    console.log('   4. User must login first, then navigate to courses');
    console.log('');
    console.log('✅ EXPECTED BEHAVIOR:');
    console.log('   - Unauthenticated users: Redirected to login page');
    console.log('   - Authenticated users: Can access course page');
    console.log('   - Course data loads via API with auth token');
    console.log('');
    console.log('🧪 MANUAL TESTING STEPS:');
    console.log('   1. Open http://localhost:3000');
    console.log('   2. You should see the landing page');
    console.log('   3. Click "Sign in" or go to http://localhost:3000/login');
    console.log('   4. Login with: jane.student@astralearn.com / password123');
    console.log('   5. You should be redirected to dashboard');
    console.log('   6. Click "Browse Courses" button');
    console.log('   7. Course page should load with course list');
    console.log('');
    console.log('🔧 IF COURSE PAGE SHOWS "NOT FOUND":');
    console.log('   - Check browser console for JavaScript errors');
    console.log('   - Verify you are logged in (check dashboard first)');
    console.log('   - Clear browser cache and cookies');
    console.log('   - Check network tab for failed API requests');
    console.log('   - Use debug page: http://localhost:3000/course-debug');

  } catch (error) {
    console.error('❌ Course page authentication test failed:', error.message);
  }
}

testCoursePageWithAuth();
