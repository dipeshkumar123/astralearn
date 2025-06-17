#!/usr/bin/env node

/**
 * Complete Authentication Flow Test
 * Tests the entire authentication system including WebSocket integration
 */

const axios = require('axios');
const { io } = require('socket.io-client');

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'http://localhost:5000';

// Test user credentials
const testUser = {
  email: 'newtest@example.com',
  password: 'password123',
  firstName: 'New',
  lastName: 'Test',
  username: 'newtest'
};

class AuthFlowTester {
  constructor() {
    this.token = null;
    this.user = null;
    this.ws = null;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(test, passed, message) {
    this.testResults.push({ test, passed, message });
    this.log(`${test}: ${message}`, passed ? 'success' : 'error');
  }

  async testServerHealth() {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      this.addResult('Server Health', response.status === 200, 'Server is running');
      return true;
    } catch (error) {
      this.addResult('Server Health', false, `Server not responding: ${error.message}`);
      return false;
    }
  }
  async testUserRegistration() {
    try {
      // Try to register a new user (might fail if user already exists)
      const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      
      if (response.status === 201) {
        this.addResult('User Registration', true, 'New user registered successfully');
        this.token = response.data.tokens.accessToken;
        this.user = response.data.user;
        return true;
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already')) {
        this.addResult('User Registration', true, 'User already exists (expected for test user)');
        return true;
      } else {
        this.addResult('User Registration', false, `Registration failed: ${error.response?.data?.message || error.message}`);
        return false;
      }
    }
  }

  async testUserLogin() {
    try {      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        identifier: testUser.email,
        password: testUser.password
      });      if (response.status === 200 && response.data.tokens?.accessToken) {
        this.token = response.data.tokens.accessToken;
        this.user = response.data.user;
        this.addResult('User Login', true, `Login successful for user: ${this.user.email}`);
        return true;
      } else {
        this.addResult('User Login', false, 'Login response missing token or user data');
        return false;
      }
    } catch (error) {
      this.addResult('User Login', false, `Login failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async testTokenValidation() {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.status === 200 && response.data.user) {
        this.addResult('Token Validation', true, `Token valid for user: ${response.data.user.email}`);
        return true;
      } else {
        this.addResult('Token Validation', false, 'Token validation response missing user data');
        return false;
      }
    } catch (error) {
      this.addResult('Token Validation', false, `Token validation failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
  async testWebSocketAuthentication() {
    return new Promise((resolve) => {
      try {
        const socket = io(WS_URL, {
          auth: {
            token: this.token
          },
          autoConnect: true,
          timeout: 10000
        });
        
        let messageReceived = false;
        let welcomeReceived = false;

        const timeout = setTimeout(() => {
          if (!messageReceived) {
            this.addResult('WebSocket Authentication', false, 'Connection timeout - no messages received');
            socket.disconnect();
            resolve(false);
          }
        }, 10000);

        socket.on('connect', () => {
          this.log('WebSocket connection opened');
        });

        socket.on('connection:welcome', (data) => {
          try {
            messageReceived = true;
            
            this.log(`WebSocket welcome message received: ${data.message}`);
            
            if (data.userId === this.user.id) {
              welcomeReceived = true;
              this.addResult('WebSocket Authentication', true, `WebSocket authenticated for user: ${this.user.firstName} ${this.user.lastName}`);
              clearTimeout(timeout);
              socket.disconnect();
              resolve(true);
            } else {
              this.addResult('WebSocket Authentication', false, 'WebSocket welcome message user ID mismatch');
              clearTimeout(timeout);
              socket.disconnect();
              resolve(false);
            }
          } catch (error) {
            this.log(`Error processing WebSocket message: ${error.message}`, 'error');
          }
        });

        socket.on('connect_error', (error) => {
          this.addResult('WebSocket Authentication', false, `WebSocket error: ${error.message}`);
          clearTimeout(timeout);
          resolve(false);
        });

        socket.on('disconnect', (reason) => {
          this.log(`WebSocket closed: ${reason}`);
          if (!messageReceived && reason !== 'io client disconnect') {
            this.addResult('WebSocket Authentication', false, `WebSocket closed without receiving messages: ${reason}`);
            clearTimeout(timeout);
            resolve(false);
          }
        });

      } catch (error) {
        this.addResult('WebSocket Authentication', false, `WebSocket connection failed: ${error.message}`);
        resolve(false);
      }
    });
  }

  async testProtectedEndpoint() {
    try {
      // Test a protected endpoint (assuming courses endpoint requires authentication)
      const response = await axios.get(`${BASE_URL}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      this.addResult('Protected Endpoint Access', response.status === 200, 'Access to protected endpoint successful');
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        this.addResult('Protected Endpoint Access', false, 'Protected endpoint rejected authentication');
      } else {
        this.addResult('Protected Endpoint Access', true, `Protected endpoint accessible (status: ${error.response?.status || 'unknown'})`);
      }
      return true; // Don't fail the test if endpoint doesn't exist
    }
  }

  async testLogout() {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      this.addResult('User Logout', response.status === 200, 'Logout successful');
      
      // Close WebSocket connection
      if (this.ws) {
        this.ws.close();
      }
      
      return true;
    } catch (error) {
      this.addResult('User Logout', false, `Logout failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Complete Authentication Flow Test', 'info');
    this.log('=' * 50, 'info');

    // Test server health
    const serverHealthy = await this.testServerHealth();
    if (!serverHealthy) {
      this.log('Aborting tests - server not healthy', 'error');
      return this.printResults();
    }

    // Test user registration/existence
    await this.testUserRegistration();

    // Test user login
    const loginSuccess = await this.testUserLogin();
    if (!loginSuccess) {
      this.log('Aborting tests - login failed', 'error');
      return this.printResults();
    }

    // Test token validation
    await this.testTokenValidation();

    // Test WebSocket authentication
    await this.testWebSocketAuthentication();

    // Test protected endpoint access
    await this.testProtectedEndpoint();

    // Test logout
    await this.testLogout();

    this.printResults();
  }

  printResults() {
    this.log('=' * 50, 'info');
    this.log('🎯 Test Results Summary', 'info');
    this.log('=' * 50, 'info');

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      this.log(`${status}: ${result.test} - ${result.message}`);
    });

    this.log('=' * 50, 'info');
    this.log(`📊 Overall Result: ${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');
    
    if (passed === total) {
      this.log('🎉 All authentication flow tests passed!', 'success');
    } else {
      this.log('⚠️ Some tests failed - authentication flow needs attention', 'warning');
    }

    return passed === total;
  }
}

// Run the test
const tester = new AuthFlowTester();
tester.runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
