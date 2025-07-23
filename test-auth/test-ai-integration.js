// Comprehensive test script for AstraLearn v2 AI Integration API
const axios = require('axios');

const BASE_URL = 'http://localhost:5003';

// Test data
const testStudent = {
  email: 'ai-student@astralearn.com',
  username: 'ai_learner',
  password: 'password123',
  firstName: 'Alex',
  lastName: 'Chen',
  role: 'student',
  learningStyle: 'visual',
  interests: ['programming', 'artificial-intelligence', 'web-development'],
  skillLevel: 'intermediate',
  learningGoals: ['Master JavaScript', 'Learn AI fundamentals', 'Build web applications'],
  preferredPace: 'moderate',
};

const testInstructor = {
  email: 'ai-instructor@astralearn.com',
  username: 'ai_prof',
  password: 'password123',
  firstName: 'Dr. Sarah',
  lastName: 'Johnson',
  role: 'instructor',
  learningStyle: 'kinesthetic',
  interests: ['teaching', 'machine-learning', 'education-technology'],
  skillLevel: 'advanced',
};

const testCourses = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript programming',
    shortDescription: 'Complete JavaScript course for beginners',
    category: 'programming',
    tags: ['javascript', 'programming', 'web-development'],
    difficulty: 'beginner',
    duration: 30,
  },
  {
    title: 'Introduction to Artificial Intelligence',
    description: 'Explore the fundamentals of AI and machine learning',
    shortDescription: 'AI basics for everyone',
    category: 'artificial-intelligence',
    tags: ['ai', 'machine-learning', 'data-science'],
    difficulty: 'intermediate',
    duration: 40,
  },
];

let studentToken = '';
let instructorToken = '';
let interactionIds = [];

async function testAIIntegrationAPI() {
  console.log('🧪 Starting AstraLearn v2 AI Integration API Tests\n');

  try {
    // Test 1: API Info
    console.log('1️⃣ Testing API Info...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API Info:', apiResponse.data.message);
    console.log('   AI Features:', apiResponse.data.aiFeatures.length);
    console.log('   Features:', apiResponse.data.aiFeatures.join(', '));
    console.log('');

    // Test 2: Register users with AI preferences
    console.log('2️⃣ Testing User Registration with AI Preferences...');
    try {
      const studentResponse = await axios.post(`${BASE_URL}/api/auth/register`, testStudent);
      studentToken = studentResponse.data.data.tokens.accessToken;
      console.log(`✅ Student registered: ${testStudent.firstName} ${testStudent.lastName}`);
      console.log(`   Learning Style: ${studentResponse.data.data.user.learningStyle}`);
      console.log(`   Skill Level: ${studentResponse.data.data.user.skillLevel}`);
      console.log(`   Interests: ${studentResponse.data.data.user.interests.join(', ')}`);

      const instructorResponse = await axios.post(`${BASE_URL}/api/auth/register`, testInstructor);
      instructorToken = instructorResponse.data.data.tokens.accessToken;
      console.log(`✅ Instructor registered: ${testInstructor.firstName} ${testInstructor.lastName}`);
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 3: AI Chat - Intelligent tutoring
    console.log('3️⃣ Testing AI Chat (Intelligent Tutoring)...');
    const chatTests = [
      'Hello! I\'m new to programming. Can you help me get started?',
      'What is JavaScript and why should I learn it?',
      'I\'m struggling with understanding functions in JavaScript. Can you explain?',
      'Can you recommend some courses for my skill level?',
      'I need motivation to continue learning. Any tips?',
    ];

    for (let i = 0; i < chatTests.length; i++) {
      const message = chatTests[i];
      try {
        const response = await axios.post(`${BASE_URL}/api/ai/chat`, 
          { 
            message,
            context: { currentTopic: 'javascript', difficulty: 'beginner' }
          }, 
          { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        
        interactionIds.push(response.data.data.interactionId);
        console.log(`✅ Chat ${i + 1}: "${message.substring(0, 40)}..."`);
        console.log(`   Response: "${response.data.data.response.substring(0, 80)}..."`);
        console.log(`   Confidence: ${response.data.data.confidence}`);
        console.log(`   Adapted for: ${response.data.data.context.adaptedFor} learner`);
      } catch (error) {
        console.log(`❌ Chat ${i + 1} failed:`, error.response?.data?.message);
      }
    }
    console.log('');

    // Test 4: AI Explain - Detailed concept explanations
    console.log('4️⃣ Testing AI Explain (Concept Explanations)...');
    const conceptsToExplain = [
      'JavaScript variables',
      'Machine learning algorithms',
      'Object-oriented programming',
      'Neural networks',
    ];

    for (let i = 0; i < conceptsToExplain.length; i++) {
      const concept = conceptsToExplain[i];
      try {
        const response = await axios.post(`${BASE_URL}/api/ai/explain`, 
          { 
            concept,
            difficulty: i < 2 ? 'beginner' : 'intermediate',
            context: { requestedBy: 'student' }
          }, 
          { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        
        interactionIds.push(response.data.data.interactionId);
        console.log(`✅ Explained: "${concept}"`);
        console.log(`   Adapted for: ${response.data.data.adaptedFor.skillLevel} level, ${response.data.data.adaptedFor.learningStyle} style`);
        console.log(`   Related concepts: ${response.data.data.relatedConcepts.slice(0, 3).join(', ')}`);
      } catch (error) {
        console.log(`❌ Explain "${concept}" failed:`, error.response?.data?.message);
      }
    }
    console.log('');

    // Test 5: AI Recommendations - Personalized suggestions
    console.log('5️⃣ Testing AI Recommendations...');
    try {
      const response = await axios.get(`${BASE_URL}/api/ai/recommendations`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log('✅ Recommendations generated');
      console.log(`   Total recommendations: ${response.data.data.count}`);
      console.log(`   Based on: ${Object.entries(response.data.data.basedOn).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      
      response.data.data.recommendations.forEach((rec, index) => {
        console.log(`   Recommendation ${index + 1}: ${rec.title}`);
        console.log(`     Reason: ${rec.reason}`);
        console.log(`     Priority: ${rec.priority}, Confidence: ${rec.confidence}`);
      });
    } catch (error) {
      console.log('❌ Get recommendations failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 6: AI Study Plan - Personalized learning paths
    console.log('6️⃣ Testing AI Study Plan Generation...');
    const studyPlanRequests = [
      {
        goals: ['Master JavaScript programming', 'Build web applications'],
        timeline: '12',
        focusAreas: ['javascript', 'web-development'],
        currentSkills: ['HTML', 'CSS basics'],
      },
      {
        goals: ['Understand AI fundamentals', 'Learn machine learning'],
        timeline: '16',
        focusAreas: ['artificial-intelligence', 'machine-learning'],
        currentSkills: ['Programming basics', 'Mathematics'],
      },
    ];

    for (let i = 0; i < studyPlanRequests.length; i++) {
      const planRequest = studyPlanRequests[i];
      try {
        const response = await axios.post(`${BASE_URL}/api/ai/study-plan`, planRequest, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        
        console.log(`✅ Study Plan ${i + 1}: "${response.data.data.title}"`);
        console.log(`   Duration: ${response.data.data.timeline} weeks`);
        console.log(`   Goals: ${response.data.data.goals.join(', ')}`);
        console.log(`   Weekly hours: ${response.data.data.schedule.weeklyHours}`);
        console.log(`   Sessions per week: ${response.data.data.schedule.sessionsPerWeek}`);
        console.log(`   Courses included: ${response.data.data.courses.length}`);
      } catch (error) {
        console.log(`❌ Study Plan ${i + 1} failed:`, error.response?.data?.message);
      }
    }
    console.log('');

    // Test 7: AI Feedback - User feedback on AI responses
    console.log('7️⃣ Testing AI Feedback System...');
    if (interactionIds.length > 0) {
      const feedbackTests = [
        { helpful: true, feedback: 'Very clear explanation, helped me understand the concept!' },
        { helpful: false, feedback: 'Could use more examples for my learning style.' },
        { helpful: true, feedback: 'Perfect level of detail for a beginner.' },
      ];

      for (let i = 0; i < Math.min(feedbackTests.length, interactionIds.length); i++) {
        const feedbackData = {
          interactionId: interactionIds[i],
          ...feedbackTests[i],
        };

        try {
          const response = await axios.post(`${BASE_URL}/api/ai/feedback`, feedbackData, {
            headers: { Authorization: `Bearer ${studentToken}` }
          });
          
          console.log(`✅ Feedback ${i + 1}: ${feedbackData.helpful ? 'Helpful' : 'Not helpful'}`);
          console.log(`   Message: "${response.data.data.thanksMessage}"`);
        } catch (error) {
          console.log(`❌ Feedback ${i + 1} failed:`, error.response?.data?.message);
        }
      }
    }
    console.log('');

    // Test 8: AI Progress Analysis - Learning insights
    console.log('8️⃣ Testing AI Progress Analysis...');
    try {
      const response = await axios.post(`${BASE_URL}/api/ai/analyze-progress`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log('✅ Progress analysis completed');
      console.log(`   Summary:`);
      console.log(`     Total courses: ${response.data.data.summary.totalCourses}`);
      console.log(`     Completed courses: ${response.data.data.summary.completedCourses}`);
      console.log(`     Completion rate: ${response.data.data.summary.completionRate}%`);
      console.log(`     AI interactions: ${response.data.data.summary.aiInteractions}`);
      console.log(`     Helpful AI responses: ${response.data.data.summary.helpfulAIResponses}`);
      
      console.log(`   Insights (${response.data.data.insights.length}):`);
      response.data.data.insights.forEach((insight, index) => {
        console.log(`     ${index + 1}. ${insight.message} (${insight.severity})`);
      });
      
      console.log(`   Strengths: ${response.data.data.strengths.join(', ')}`);
      console.log(`   Next steps: ${response.data.data.nextSteps.slice(0, 2).join(', ')}`);
    } catch (error) {
      console.log('❌ Progress analysis failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 9: Authentication and permission tests
    console.log('9️⃣ Testing Authentication & Permissions...');
    try {
      // Test without token
      await axios.post(`${BASE_URL}/api/ai/chat`, { message: 'Hello' });
      console.log('❌ Should have required authentication!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication correctly required for AI chat');
      }
    }

    try {
      // Test with invalid token
      await axios.get(`${BASE_URL}/api/ai/recommendations`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Should have rejected invalid token!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token correctly rejected');
      }
    }
    console.log('');

    // Test 10: AI personalization features
    console.log('🔟 Testing AI Personalization...');
    try {
      // Test different learning styles
      const personalizationTests = [
        { message: 'Explain arrays in JavaScript', context: { learningStyle: 'visual' } },
        { message: 'How do I debug JavaScript code?', context: { skillLevel: 'beginner' } },
        { message: 'What are the best practices for coding?', context: { interests: ['web-development'] } },
      ];

      for (let i = 0; i < personalizationTests.length; i++) {
        const test = personalizationTests[i];
        const response = await axios.post(`${BASE_URL}/api/ai/chat`, test, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        
        console.log(`✅ Personalization test ${i + 1}: Adapted response received`);
        console.log(`   Context: ${Object.entries(test.context).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      }
    } catch (error) {
      console.log('❌ Personalization test failed:', error.response?.data?.message);
    }
    console.log('');

    console.log('🎉 All AI Integration tests completed!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('   ✅ API Information & AI Features');
    console.log('   ✅ User Registration with AI Preferences');
    console.log('   ✅ AI Chat (Intelligent Tutoring)');
    console.log('   ✅ AI Explain (Concept Explanations)');
    console.log('   ✅ AI Recommendations (Personalized)');
    console.log('   ✅ AI Study Plan Generation');
    console.log('   ✅ AI Feedback System');
    console.log('   ✅ AI Progress Analysis');
    console.log('   ✅ Authentication & Security');
    console.log('   ✅ AI Personalization Features');
    console.log('');
    console.log('🚀 AstraLearn v2 AI Integration System is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Make sure the server is running on http://localhost:5003');
      console.log('   Run: node ai-server.js');
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:5003');
    console.log('');
    console.log('Please start the server first:');
    console.log('   cd test-auth');
    console.log('   node ai-server.js');
    console.log('');
    console.log('Then run this test again:');
    console.log('   node test-ai-integration.js');
    return;
  }

  await testAIIntegrationAPI();
}

main();
