/**
 * Test API Health and Auth Endpoints
 * Debug authentication issues
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAPIHealth() {
  console.log('🔧 Testing API Health and Authentication...\n');

  try {
    // Step 1: Check API health
    console.log('📋 Step 1: Checking API health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API Health:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('❌ API Health check failed:', healthResponse.status);
    }

    // Step 2: Check courses health
    console.log('\n📋 Step 2: Checking courses endpoint health...');
    const coursesHealthResponse = await fetch(`${BASE_URL}/courses/health`);
    
    if (coursesHealthResponse.ok) {
      const coursesHealthData = await coursesHealthResponse.json();
      console.log('✅ Courses Health:', JSON.stringify(coursesHealthData, null, 2));
    } else {
      console.log('❌ Courses health check failed:', coursesHealthResponse.status);
    }

    // Step 3: Test basic registration and login flow
    console.log('\n📋 Step 3: Testing registration...');
    const timestamp = Date.now();
    const testUser = {
      email: `testuser${timestamp}@astralearn.com`,
      username: `testuser${timestamp}`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };

    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful');
      console.log('📋 Token received:', registerData.token ? 'Yes' : 'No');
      console.log('📋 User data:', {
        id: registerData.user?.id,
        email: registerData.user?.email,
        role: registerData.user?.role
      });

      // Test the token immediately
      console.log('\n📋 Step 4: Testing token validity...');
      const profileResponse = await fetch(`${BASE_URL}/users/profile`, {
        headers: { 
          'Authorization': `Bearer ${registerData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Token is valid');
        console.log('📋 Profile:', {
          id: profileData.profile?.id,
          email: profileData.profile?.email,
          role: profileData.profile?.role
        });

        // Now test enrollment with valid token
        console.log('\n📋 Step 5: Testing enrollment with valid token...');
        
        // First get courses
        const coursesResponse = await fetch(`${BASE_URL}/courses`, {
          headers: { Authorization: `Bearer ${registerData.token}` }
        });

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          console.log(`✅ Found ${coursesData.courses?.length || 0} courses`);

          if (coursesData.courses && coursesData.courses.length > 0) {
            const firstCourse = coursesData.courses[0];
            console.log(`📋 Attempting to enroll in "${firstCourse.title}" (ID: ${firstCourse._id || firstCourse.id})...`);

            const enrollResponse = await fetch(`${BASE_URL}/courses/${firstCourse._id || firstCourse.id}/enroll`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${registerData.token}`,
                'Content-Type': 'application/json'
              }
            });

            console.log(`📊 Enrollment Response Status: ${enrollResponse.status}`);

            const enrollText = await enrollResponse.text();
            if (enrollResponse.ok) {
              console.log('✅ Enrollment successful!');
              try {
                const enrollData = JSON.parse(enrollText);
                console.log('📋 Response:', JSON.stringify(enrollData, null, 2));
              } catch (e) {
                console.log('📋 Response (raw):', enrollText);
              }
            } else {
              console.log('❌ Enrollment failed!');
              console.log('📋 Error Response:', enrollText);
            }
          }
        } else {
          const coursesError = await coursesResponse.text();
          console.log('❌ Failed to get courses:', coursesResponse.status, coursesError);
        }

      } else {
        const profileError = await profileResponse.text();
        console.log('❌ Token is invalid:', profileResponse.status, profileError);
      }

    } else {
      const registerError = await registerResponse.text();
      console.log('❌ Registration failed:', registerResponse.status, registerError);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAPIHealth().catch(console.error);
