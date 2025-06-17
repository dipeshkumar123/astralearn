const axios = require('axios');
const { io } = require('socket.io-client');

async function testWebSocketAuth() {
  const BASE_URL = 'http://localhost:5000';
  const WS_URL = 'ws://localhost:5000';
  
  try {
    // Step 1: Login to get token
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.tokens.accessToken;
    const user = loginResponse.data.user;
    console.log(`✅ Login successful for: ${user.email}`);
    
    // Step 2: Test WebSocket connection
    console.log('\n🌐 Step 2: Testing WebSocket connection...');
      return new Promise((resolve, reject) => {
      const socket = io(WS_URL, {
        auth: {
          token: token
        },
        autoConnect: true,
        timeout: 10000
      });
        const timeout = setTimeout(() => {
        console.log('⏰ Connection timeout');
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }, 10000);
      
      socket.on('connect', () => {
        console.log('✅ WebSocket connection opened');
      });
      
      socket.on('connection:welcome', (data) => {
        try {
          console.log(`📨 Welcome message received: ${data.message}`);
          
          if (data.userId === user.id) {
            console.log(`✅ Welcome message received for: ${user.firstName} ${user.lastName}`);
            console.log('🎉 WebSocket authentication working correctly!');
            clearTimeout(timeout);
            socket.disconnect();
            resolve(true);
          } else {
            console.log(`❌ User ID mismatch: expected ${user.id}, got ${data.userId}`);
            clearTimeout(timeout);
            socket.disconnect();
            reject(new Error('User ID mismatch'));
          }
        } catch (error) {
          console.log(`📨 Raw message: ${JSON.stringify(data)}`);
        }
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        clearTimeout(timeout);
        reject(error);
      });
        socket.on('disconnect', (reason) => {
        console.log(`🔌 WebSocket closed: ${reason}`);
        clearTimeout(timeout);
        // Don't treat client-initiated disconnect as an error
        if (reason !== 'client namespace disconnect' && reason !== 'io client disconnect') {
          reject(new Error(`Connection closed: ${reason}`));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

testWebSocketAuth()
  .then(() => {
    console.log('\n🎯 Test completed successfully!');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
  });
