#!/usr/bin/env node

/**
 * Debug AI Endpoints Script
 * Tests the actual endpoints the frontend calls
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

// Test authentication by trying to get a token first
async function getAuthToken() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'securepassword123'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    } else {
      console.log('⚠️ Could not get auth token - testing without auth');
      return null;
    }
  } catch (error) {
    console.log('⚠️ Auth test failed:', error.message);
    return null;
  }
}

async function testAIEndpoints() {
  console.log('🧪 Testing AI Endpoints that Frontend Uses...\n');

  // Get auth token
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Using authentication token');
  } else {
    console.log('⚠️ Testing without authentication');
  }

  // Test data
  const testMessage = "Hello! Can you tell me about JavaScript variables?";
  const testContext = {
    user: {
      user_name: "Alice",
      learning_style: "visual"
    },
    course: {
      course_title: "JavaScript Basics"
    },
    lesson: {
      lesson_title: "Variables and Data Types"
    }
  };

  // Test endpoints
  const endpoints = [
    {
      name: 'Direct Chat',
      method: 'POST',
      url: `${BASE_URL}/ai/chat`,
      body: {
        message: testMessage,
        context: testContext
      }
    },
    {
      name: 'Orchestrated Chat',
      method: 'POST',
      url: `${BASE_URL}/ai/orchestrated/chat`,
      body: {
        content: testMessage,
        context: testContext
      }
    },
    {
      name: 'AI Test (No Auth)',
      method: 'POST',
      url: `${BASE_URL}/ai/test`,
      body: {},
      noAuth: true
    },
    {
      name: 'AI Health',
      method: 'GET',
      url: `${BASE_URL}/ai/health`,
      noAuth: true
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`📍 URL: ${endpoint.url}`);

    try {
      const requestHeaders = endpoint.noAuth ? 
        { 'Content-Type': 'application/json' } : 
        headers;

      const options = {
        method: endpoint.method,
        headers: requestHeaders,
      };

      if (endpoint.body && Object.keys(endpoint.body).length > 0) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(endpoint.url, options);
      const data = await response.json();

      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      
      if (endpoint.name.includes('Chat')) {
        // Check if it's a real AI response or fallback
        const reply = data.reply || data.response?.reply || 'No reply found';
        const isFallback = reply.includes('experiencing some technical difficulties') || 
                          reply.includes('temporarily unavailable');
        
        console.log(`💬 Response Type: ${isFallback ? '🔄 Fallback' : '🤖 AI Generated'}`);
        console.log(`💬 Reply Preview: ${reply.substring(0, 100)}...`);
        
        if (data.metadata) {
          console.log(`📊 Metadata:`, {
            fallback: data.metadata.fallback,
            model: data.metadata.model,
            usage: data.metadata.usage
          });
        }
      } else {
        console.log(`📊 Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
      }

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n🔍 Summary:');
  console.log('If you see "Fallback" responses, the issue is likely:');
  console.log('1. Frontend calling wrong endpoint');
  console.log('2. Authentication issues');
  console.log('3. Context not being passed correctly');
  console.log('4. AI service readiness check failing');
}

// Run the test
testAIEndpoints().catch(console.error);
