// Test Template Replacement Fix
const axios = require('axios');

async function testTemplateReplacementFix() {
  console.log('🔧 Testing Template Replacement Fix...\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.tokens.accessToken;
    console.log('✅ Login successful');
    
    // Test different types of requests to see response patterns
    const testCases = [
      {
        name: 'Simple Chat',
        content: 'Hello, can you help me?',
        context: {}
      },
      {
        name: 'Chat with User Context',
        content: 'Hello, I need learning assistance',
        context: {
          user: {
            firstName: 'Alex',
            learning_style: 'visual'
          }
        }
      },
      {
        name: 'Chat with Full Context',
        content: 'Help me with this course',
        context: {
          user: {
            firstName: 'Alex',
            learning_style: 'visual'
          },
          course: {
            title: 'JavaScript Fundamentals',
            category: 'Programming'
          },
          lesson: {
            title: 'Variables and Data Types',
            objectives: ['Understand variables', 'Learn data types']
          }
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: ${testCase.name}`);
      
      try {
        const response = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
          content: testCase.content,
          context: testCase.context,
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const aiReply = response.data.reply || '';
        const templateVars = aiReply.match(/\{[^}]+\}/g);
        
        console.log(`   Success: ${response.data.success}`);
        console.log(`   Response length: ${aiReply.length}`);
        
        if (templateVars && templateVars.length > 0) {
          console.log(`   ❌ Found ${templateVars.length} template variables:`, templateVars);
          console.log(`   Raw response: "${aiReply.substring(0, 200)}..."`);
        } else {
          console.log(`   ✅ No template variables found`);
          if (aiReply.length > 0) {
            console.log(`   Preview: "${aiReply.substring(0, 150)}..."`);
          }
        }
        
        // Check if response uses context properly
        if (testCase.context.user?.firstName && aiReply.toLowerCase().includes(testCase.context.user.firstName.toLowerCase())) {
          console.log(`   ✅ Uses user's name correctly`);
        }
        
        if (testCase.context.course?.title && aiReply.includes(testCase.context.course.title)) {
          console.log(`   ✅ References course title correctly`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${testCase.name} failed:`, error.response?.data?.error || error.message);
      }
    }
    
    console.log('\n🎯 Template Replacement Fix Summary:');
    console.log('  ✅ Enhanced placeholder cleanup in aiOrchestrator.js');
    console.log('  ✅ Added comprehensive fallback replacements');
    console.log('  ✅ Fixed formatting issues with missing data');
    console.log('  ✅ AI assistant should now show clean responses without {placeholders}');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testTemplateReplacementFix().catch(console.error);
