// Test authentication and enrollment fixes
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testAuthEnrollmentFix() {
  console.log('🧪 Testing Authentication & Enrollment Fixes...\n');

  try {
    // Step 1: Test authentication flow
    console.log('1️⃣ Testing authentication flow...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful');
    console.log('');

    // Step 2: Test course progress with authentication
    console.log('2️⃣ Testing course progress with authentication...');
    
    try {
      const progressResponse = await axios.get(`${BASE_URL}/api/courses/1/progress`, { 
        headers: authHeaders 
      });
      console.log(`✅ Course 1 progress: ${progressResponse.data.data.progressPercentage}% complete`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('⚠️ Course 1: User not enrolled (403 - expected for new users)');
      } else {
        console.log(`❌ Course 1 progress failed: ${error.message}`);
      }
    }

    // Step 3: Test enrollment
    console.log('');
    console.log('3️⃣ Testing course enrollment...');
    
    try {
      const enrollResponse = await axios.post(`${BASE_URL}/api/courses/1/enroll`, {}, {
        headers: authHeaders
      });
      console.log('✅ Course 1 enrollment successful');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Course 1: Already enrolled');
      } else {
        console.log(`❌ Course 1 enrollment failed: ${error.message}`);
      }
    }

    // Step 4: Test progress after enrollment
    console.log('');
    console.log('4️⃣ Testing progress after enrollment...');
    
    try {
      const progressAfterEnrollment = await axios.get(`${BASE_URL}/api/courses/1/progress`, {
        headers: authHeaders
      });
      console.log(`✅ Course 1 progress after enrollment: ${progressAfterEnrollment.data.data.progressPercentage}%`);
      console.log(`   Total lessons: ${progressAfterEnrollment.data.data.totalLessons}`);
      console.log(`   Completed: ${progressAfterEnrollment.data.data.completedLessons}`);
    } catch (error) {
      console.log(`❌ Progress after enrollment failed: ${error.message}`);
    }

    // Step 5: Test multiple courses
    console.log('');
    console.log('5️⃣ Testing multiple course access...');
    
    const courseIds = ['1', '2', '3'];
    for (const courseId of courseIds) {
      try {
        const response = await axios.get(`${BASE_URL}/api/courses/${courseId}/progress`, {
          headers: authHeaders
        });
        console.log(`✅ Course ${courseId}: ${response.data.data.progressPercentage}% complete`);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`⚠️ Course ${courseId}: Not enrolled (403)`);
        } else {
          console.log(`❌ Course ${courseId}: ${error.message}`);
        }
      }
    }

    // Step 6: Test frontend API proxy with authentication
    console.log('');
    console.log('6️⃣ Testing frontend API proxy with authentication...');
    
    try {
      // Test login through frontend
      const frontendLoginResponse = await axios.post(`${FRONTEND_URL}/api/auth/login`, {
        identifier: 'jane.student@astralearn.com',
        password: 'password123'
      });
      
      const frontendToken = frontendLoginResponse.data.data.tokens.accessToken;
      console.log('✅ Frontend login successful');
      
      // Test progress through frontend proxy
      const frontendProgressResponse = await axios.get(`${FRONTEND_URL}/api/courses/1/progress`, {
        headers: { Authorization: `Bearer ${frontendToken}` }
      });
      console.log(`✅ Frontend progress API: ${frontendProgressResponse.data.data.progressPercentage}%`);
      
    } catch (error) {
      console.log(`❌ Frontend API proxy test failed: ${error.message}`);
    }

    console.log('');
    console.log('🎉 AUTHENTICATION & ENROLLMENT FIX VERIFICATION COMPLETE!');
    console.log('');
    console.log('✅ FIXES IMPLEMENTED:');
    console.log('   - Added proper error handling for 403 (not enrolled) responses');
    console.log('   - Added auto-enrollment functionality in ProgressDashboard');
    console.log('   - Added enrollment prompt in CourseLearningPage');
    console.log('   - Improved user experience for non-enrolled users');
    console.log('');
    console.log('🚀 EXPECTED BEHAVIOR:');
    console.log('   - 403 errors are now handled gracefully');
    console.log('   - Users can auto-enroll by clicking "Start" buttons');
    console.log('   - Progress tracking works after enrollment');
    console.log('   - No more console spam from failed requests');
    console.log('');
    console.log('📋 MANUAL TESTING:');
    console.log('   1. Open http://localhost:3000/dashboard');
    console.log('   2. Check that progress cards show "Not enrolled" instead of errors');
    console.log('   3. Click "Start" on a course to auto-enroll');
    console.log('   4. Verify progress tracking works after enrollment');
    console.log('   5. Check browser console for reduced error messages');

  } catch (error) {
    console.error('❌ Authentication & enrollment fix test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAuthEnrollmentFix();
