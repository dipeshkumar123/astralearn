// Test authentication endpoints with detailed debugging
const testAuth = async () => {
  const BASE_URL = 'http://localhost:5000/api/auth';
  
  console.log('🧪 Testing AstraLearn Authentication System...\n');

  try {
    // 1. Test login with demo user
    console.log('1. Testing login with demo user...');
    const loginData = {
      identifier: 'demo@astralearn.com',
      password: 'demo123'
    };

    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful:', loginResult.message);
      console.log('   User:', loginResult.user.firstName, loginResult.user.lastName);
      console.log('   Username:', loginResult.user.username);
      console.log('   Email:', loginResult.user.email);
      console.log('   Access Token:', loginResult.tokens.accessToken.substring(0, 30) + '...');
      
      // Store token for further tests
      const accessToken = loginResult.tokens.accessToken;
      
      // 2. Test token validation
      console.log('\n2. Testing token validation...');
      const validateResponse = await fetch(`${BASE_URL}/validate`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (validateResponse.ok) {
        const validateData = await validateResponse.json();
        console.log('✅ Token validation successful:', validateData.message);
      } else {
        const error = await validateResponse.json();
        console.log('❌ Token validation failed:', error.message);
      }

      // 3. Test profile retrieval
      console.log('\n3. Testing profile retrieval...');
      const profileResponse = await fetch(`${BASE_URL}/profile`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile retrieval successful');
        console.log('   Name:', profileData.user.firstName, profileData.user.lastName);
        console.log('   Learning Style:', profileData.user.learningStyle);
        console.log('   Role:', profileData.user.role);
      } else {
        const error = await profileResponse.json();
        console.log('❌ Profile retrieval failed:', error.message);
      }

      // 4. Test profile update
      console.log('\n4. Testing profile update...');
      const updateData = {
        firstName: 'Demo Updated',
        learningStyle: 'kinesthetic'
      };

      const updateResponse = await fetch(`${BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('✅ Profile update successful');
        console.log('   Updated Name:', updateResult.user.firstName);
        console.log('   Updated Learning Style:', updateResult.user.learningStyle);
      } else {
        const error = await updateResponse.json();
        console.log('❌ Profile update failed:', error.message);
      }

    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.message || error.error);
      console.log('   Full error:', error);
    }

    // 5. Test registration with unique user
    console.log('\n5. Testing registration with new user...');
    const uniqueId = Date.now();
    const registerData = {
      email: `testuser${uniqueId}@example.com`,
      username: `testuser${uniqueId}`,
      password: 'test123456',
      firstName: 'Test',
      lastName: 'User',
      learningStyle: 'visual'
    };

    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.ok) {
      const regData = await registerResponse.json();
      console.log('✅ Registration successful:', regData.message);
      console.log('   User ID:', regData.user.id);
      console.log('   Username:', regData.user.username);
      console.log('   Email:', regData.user.email);
      console.log('   Access Token:', regData.tokens.accessToken.substring(0, 30) + '...');
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.message || error.error);
      console.log('   Details:', error.details || 'No additional details');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 Authentication system testing completed!');
};

// Run the test
testAuth();
