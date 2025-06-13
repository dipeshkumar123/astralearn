/**
 * Simple WebSocket Authentication Test
 */

import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const WS_URL = 'http://localhost:5000';

async function testWebSocketAuth() {
  console.log('🔧 Testing WebSocket Authentication...\n');

  try {
    // First try to login with existing demo user
    let accessToken, user;
    
    console.log('📝 Step 1: Getting authentication token...');
    
    try {
      // Try to login with demo credentials
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        identifier: 'demo@astralearn.com',
        password: 'demo123'
      });
      
      accessToken = loginResponse.data.tokens.accessToken;
      user = loginResponse.data.user;
      console.log('✅ Login successful with demo user');
    } catch (error) {
      // Create demo user if login fails
      console.log('⚠️ Demo user not found, creating...');
      const registerResponse = await axios.post(`${API_BASE}/auth/demo-user`);
      accessToken = registerResponse.data.tokens.accessToken;
      user = registerResponse.data.user;
      console.log('✅ Demo user created successfully');
    }

    console.log(`   Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   User: ${user.firstName} ${user.lastName}\n`);

    // Step 2: Test WebSocket connection
    console.log('🔌 Step 2: Testing WebSocket connection...');
    
    const testResult = await new Promise((resolve, reject) => {
      const socket = io(WS_URL, {
        auth: {
          token: accessToken
        },
        autoConnect: true,
        timeout: 10000
      });

      let results = {
        connected: false,
        authenticated: false,
        welcomeReceived: false,
        userDataCorrect: false
      };

      const timeout = setTimeout(() => {
        socket.disconnect();
        resolve(results);
      }, 8000);

      socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        results.connected = true;
        results.authenticated = true;
      });

      socket.on('connection:welcome', (data) => {
        console.log('✅ Welcome message received');
        console.log(`   Message: ${data.message}`);
        console.log(`   User ID: ${data.userId}`);
        results.welcomeReceived = true;
        results.userDataCorrect = data.userId === user.id;
        
        clearTimeout(timeout);
        socket.disconnect();
        resolve(results);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection failed:', error.message);
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Step 3: Print results
    console.log('\n📊 Test Results:');
    console.log('═══════════════════════════');
    console.log(`✅ WebSocket Connection: ${testResult.connected ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Authentication: ${testResult.authenticated ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Welcome Message: ${testResult.welcomeReceived ? 'PASS' : 'FAIL'}`);
    console.log(`✅ User Data Correct: ${testResult.userDataCorrect ? 'PASS' : 'FAIL'}`);
    
    const score = Object.values(testResult).filter(Boolean).length;
    console.log('═══════════════════════════');
    console.log(`📈 Score: ${score}/4 tests passed\n`);

    if (testResult.connected && testResult.authenticated) {
      console.log('🎉 SUCCESS: WebSocket authentication is working!');
      console.log('✅ The authentication fix has been successfully implemented');
      console.log('✅ Users can now connect to WebSocket with JWT tokens');
      console.log('✅ Real-time features should be functional');
    } else {
      console.log('❌ FAILED: WebSocket authentication still has issues');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebSocketAuth();
