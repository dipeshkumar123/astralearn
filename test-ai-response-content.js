// Detailed AI Response Test - Check placeholder replacement
const axios = require('axios');

async function testAIResponseContent() {
  console.log('🔍 Testing AI Response Content and Placeholder Replacement\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  try {
    // Step 1: Login
    console.log('1. 🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.tokens.accessToken;
    const user = loginResponse.data.user;
    console.log(`✅ Authenticated as: ${user.firstName} ${user.lastName}`);
    
    // Step 2: Test AI chat with detailed logging
    console.log('\n2. 🤖 Testing AI Chat with Context...');
    
    const chatResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
      content: 'Hello! Can you help me understand how to get started with learning?',
      context: {
        page: 'dashboard',
        userLevel: 'beginner',
        courseId: '507f1f77bcf86cd799439011', // Mock course ID
        lessonId: '507f1f77bcf86cd799439012', // Mock lesson ID
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📋 Response Analysis:');
    console.log('Status:', chatResponse.status);
    console.log('Success:', chatResponse.data.success);
    
    if (chatResponse.data.response) {
      const responseText = chatResponse.data.response.reply || chatResponse.data.response;
      console.log('\n📝 AI Response Content:');
      console.log('━'.repeat(80));
      console.log(responseText);
      console.log('━'.repeat(80));
      
      // Check for remaining placeholders
      const placeholderMatches = responseText.match(/\{[^}]+\}/g);
      if (placeholderMatches) {
        console.log('\n⚠️  Found unresolved placeholders:');
        placeholderMatches.forEach(placeholder => console.log(`  - ${placeholder}`));
      } else {
        console.log('\n✅ No unresolved placeholders found');
      }
      
      // Response metrics
      console.log('\n📊 Response Metrics:');
      console.log(`  • Length: ${responseText.length} characters`);
      console.log(`  • Lines: ${responseText.split('\n').length}`);
      console.log(`  • Contains user name: ${responseText.includes(user.firstName) ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ No response content found');
      console.log('Full response data:', JSON.stringify(chatResponse.data, null, 2));
    }
    
    // Step 3: Test with more specific context
    console.log('\n3. 🎯 Testing with Specific Course Context...');
    
    const specificResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
      content: 'What should I study next in this course?',
      context: {
        course: {
          title: 'Web Development Fundamentals',
          category: 'Programming',
          difficulty: 'beginner'
        },
        lesson: {
          title: 'Introduction to HTML',
          objectives: ['Learn HTML structure', 'Understand tags', 'Create basic web page']
        },
        progress: {
          completed_lessons: 3,
          total_lessons: 15,
          overall_progress: 20
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (specificResponse.data.response) {
      const specificText = specificResponse.data.response.reply || specificResponse.data.response;
      console.log('\n📝 Specific Context Response:');
      console.log('━'.repeat(80));
      console.log(specificText);
      console.log('━'.repeat(80));
      
      // Check if context data appears in response
      console.log('\n🔍 Context Integration Check:');
      console.log(`  • Mentions course: ${specificText.includes('Web Development') ? '✅' : '❌'}`);
      console.log(`  • Mentions lesson: ${specificText.includes('HTML') ? '✅' : '❌'}`);
      console.log(`  • Shows progress: ${specificText.includes('3') || specificText.includes('20') ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the detailed test
testAIResponseContent().catch(console.error);
