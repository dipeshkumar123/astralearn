// Debug AI Context and Template Replacement
const axios = require('axios');

async function debugAIContext() {
  console.log('🔍 Debugging AI Context and Template Replacement...\n');
  
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
    
    // Step 2: Test context gathering directly
    console.log('\n2. 🧪 Testing AI Context Service...');
    
    const contextTestResponse = await axios.post(`${API_BASE}/ai/context/test`, {
      courseId: 'test-course',
      lessonId: 'test-lesson'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📊 Context Quality:', contextTestResponse.data.contextQuality);
    console.log('📋 Gathered Context Keys:', Object.keys(contextTestResponse.data.gatheredContext));
    
    // Step 3: Test AI chat with enhanced context
    console.log('\n3. 🤖 Testing AI Chat with Context...');
    
    const chatResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
      content: 'Hello, I need help with learning',
      context: {
        courseId: 'ai-fundamentals',
        lessonId: 'intro-to-ai',
        course: {
          title: 'Introduction to AI',
          category: 'Technology'
        },
        lesson: {
          title: 'AI Basics',
          objectives: ['Understand AI concepts', 'Learn basic terminology']
        },
        user: {
          firstName: 'Test',
          learning_style: 'visual'
        }
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📤 AI Response Analysis:');
    console.log('Success:', chatResponse.data.success);
    console.log('Response length:', chatResponse.data.response?.reply?.length || 0);
    console.log('Context quality score:', chatResponse.data.metadata?.contextQuality?.score);
    console.log('Learning style adapted:', chatResponse.data.metadata?.learningStyleAdapted);
    
    // Check for template variables in response
    const aiResponse = chatResponse.data.response?.reply || '';
    const templateVariables = aiResponse.match(/\{[^}]+\}/g);
    
    if (templateVariables) {
      console.log('\n❌ Found unreplaced template variables:');
      templateVariables.forEach(variable => console.log(`  - ${variable}`));
      
      console.log('\n🔧 Raw AI Response (first 500 chars):');
      console.log(aiResponse.substring(0, 500) + '...');
      
      // Check what context was actually passed
      console.log('\n📋 Context Data Structure:');
      const context = chatResponse.data.response || {};
      console.log('User context:', context.user || 'Missing');
      console.log('Course context:', context.course || 'Missing');
      console.log('Lesson context:', context.lesson || 'Missing');
      
    } else {
      console.log('\n✅ Template variables properly replaced');
      console.log('First 200 chars of response:');
      console.log(aiResponse.substring(0, 200) + '...');
    }
    
    console.log('\n📊 Full Response Structure:');
    console.log('Keys in response:', Object.keys(chatResponse.data));
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// Run debug
debugAIContext().catch(console.error);
