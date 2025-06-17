// Test authentication endpoints
const testAuth = async () => {
  const BASE_URL = 'http://localhost:5000/api/auth';
  
  console.log('🧪 Testing Authentication System...\n');

  try {
    // 1. Test creating demo user
    console.log('1. Creating demo user...');
    const createDemoResponse = await fetch(`${BASE_URL}/create-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (createDemoResponse.ok) {
      const demoData = await createDemoResponse.json();
      console.log('✅ Demo user created/exists:', demoData.message);
    } else {
      console.log('❌ Failed to create demo user');
    }

    // 2. Test registration
    console.log('\n2. Testing registration...');
    const registerData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'test123',
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
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.message);
    }

    // 3. Test login with demo user
    console.log('\n3. Testing login with demo user...');
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
      console.log('   Access Token:', loginResult.tokens.accessToken.substring(0, 20) + '...');
      
      // 4. Test token validation
      console.log('\n4. Testing token validation...');
      const validateResponse = await fetch(`${BASE_URL}/validate`, {
        headers: { 
          'Authorization': `Bearer ${loginResult.tokens.accessToken}`
        }
      });

      if (validateResponse.ok) {
        const validateData = await validateResponse.json();
        console.log('✅ Token validation successful:', validateData.message);
      } else {
        console.log('❌ Token validation failed');
      }

    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
testAuth();
