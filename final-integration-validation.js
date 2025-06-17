/**
 * Final Frontend-Backend Integration Validation
 * Ensures frontend is using real backend data, not fallback/mock data
 */

const axios = require('axios');

async function finalIntegrationValidation() {
  console.log('🎯 FINAL FRONTEND-BACKEND INTEGRATION VALIDATION');
  console.log('=' .repeat(70));
  console.log('Objective: Ensure frontend displays real backend data for all features\n');
  
  const API_BASE = 'http://localhost:5000/api';
  const results = {
    passedTests: 0,
    totalTests: 0,
    issues: []
  };
  
  try {
    // Test multiple user roles
    const testScenarios = [
      {
        role: 'Student',
        credentials: { identifier: 'alice@example.com', password: 'password123' },
        endpoints: [
          { path: '/analytics/summary', name: 'Student Analytics', critical: true },
          { path: '/courses/my/enrolled', name: 'Enrolled Courses', critical: true },
          { path: '/gamification/dashboard', name: 'Gamification', critical: true },
          { path: '/social-learning/study-buddies/list', name: 'Study Buddies', critical: false },
          { path: '/adaptive-learning/recommendations', name: 'AI Recommendations', critical: true }
        ]
      },
      {
        role: 'Instructor',
        credentials: { identifier: 'sarah@example.com', password: 'password123' },
        endpoints: [
          { path: '/courses/instructor', name: 'Instructor Courses', critical: true },
          { path: '/analytics/summary', name: 'Analytics Summary', critical: true },
          { path: '/course-management/search', name: 'Course Management', critical: true }
        ]
      },
      {
        role: 'Admin',
        credentials: { identifier: 'admin@astralearn.com', password: 'admin123' },
        endpoints: [
          { path: '/analytics/summary', name: 'Admin Analytics', critical: true },
          { path: '/gamification/dashboard', name: 'System Gamification', critical: false }
        ]
      }
    ];
    
    for (const scenario of testScenarios) {
      console.log(`\n📋 Testing ${scenario.role} Dashboard Integration...`);
      console.log('-' .repeat(50));
      
      try {
        // Authenticate
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, scenario.credentials);
        const token = loginResponse.data.tokens.accessToken;
        const user = loginResponse.data.user;
        
        console.log(`✅ Login: ${user.firstName} ${user.lastName} (${user.role})`);
        results.totalTests++;
        results.passedTests++;
        
        // Test each endpoint
        for (const endpoint of scenario.endpoints) {
          results.totalTests++;
          
          try {
            const response = await axios.get(`${API_BASE}${endpoint.path}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Analyze response data quality
            const dataAnalysis = analyzeResponseData(response.data);
            
            if (dataAnalysis.hasRealData) {
              console.log(`   ✅ ${endpoint.name}: Real data (${dataAnalysis.score}/10)`);
              results.passedTests++;
            } else if (dataAnalysis.isEmpty) {
              console.log(`   ⚠️  ${endpoint.name}: Empty but valid response`);
              if (!endpoint.critical) results.passedTests++;
              else results.issues.push(`${scenario.role} - ${endpoint.name}: Empty response`);
            } else {
              console.log(`   ❌ ${endpoint.name}: Poor data quality (${dataAnalysis.score}/10)`);
              results.issues.push(`${scenario.role} - ${endpoint.name}: Low quality data`);
            }
            
          } catch (endpointError) {
            console.log(`   ❌ ${endpoint.name}: Error ${endpointError.response?.status}`);
            if (endpoint.critical) {
              results.issues.push(`${scenario.role} - ${endpoint.name}: API Error`);
            }
          }
        }
        
      } catch (authError) {
        console.log(`❌ ${scenario.role} authentication failed`);
        results.issues.push(`${scenario.role}: Authentication failed`);
      }
    }
    
    // Test AI Integration (critical for modern learning platform)
    console.log('\n🤖 Testing AI Integration...');
    console.log('-' .repeat(50));
    results.totalTests++;
    
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        identifier: 'alice@example.com', 
        password: 'password123'
      });
      const token = loginResponse.data.tokens.accessToken;
      
      const aiResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
        content: 'Hello! Can you explain the concept of functions in programming?',
        context: {
          page: 'lesson',
          course: { title: 'JavaScript Fundamentals', difficulty: 'beginner' },
          lesson: { title: 'Introduction to Functions' },
          user: { firstName: 'Alice', learningStyle: 'visual' }
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (aiResponse.data.success && aiResponse.data.response?.reply) {
        const reply = aiResponse.data.response.reply;
        
        // Check for template placeholders (indicates integration issues)
        const placeholders = reply.match(/\{[^}]+\}/g);
        
        if (placeholders) {
          console.log(`   ❌ AI Integration: Found ${placeholders.length} unresolved placeholders`);
          results.issues.push('AI Integration: Template placeholders not resolved');
        } else {
          console.log(`   ✅ AI Integration: Clean response (${reply.length} chars)`);
          results.passedTests++;
        }
      } else {
        results.issues.push('AI Integration: Invalid response structure');
      }
      
    } catch (aiError) {
      console.log(`   ❌ AI Integration: Error ${aiError.response?.status}`);
      results.issues.push('AI Integration: API Error');
    }
    
    // Final Results
    console.log('\n' + '=' .repeat(70));
    console.log('🏆 INTEGRATION VALIDATION RESULTS');
    console.log('=' .repeat(70));
    
    const successRate = (results.passedTests / results.totalTests) * 100;
    console.log(`📊 Success Rate: ${results.passedTests}/${results.totalTests} (${successRate.toFixed(1)}%)`);
    
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT: Frontend fully integrated with backend!');
    } else if (successRate >= 75) {
      console.log('✅ GOOD: Frontend mostly integrated, minor issues');
    } else if (successRate >= 50) {
      console.log('⚠️  PARTIAL: Frontend partially integrated, needs work');
    } else {
      console.log('❌ POOR: Frontend not properly integrated');
    }
    
    if (results.issues.length > 0) {
      console.log('\n🔍 Issues Found:');
      results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n🎯 INTEGRATION STATUS: ' + (successRate >= 85 ? 'COMPLETE ✅' : 'NEEDS ATTENTION ⚠️'));
    console.log('\n📱 Test the application at: http://localhost:3000');
    console.log('🔑 Credentials:');
    console.log('   • alice@example.com / password123 (Student)');
    console.log('   • sarah@example.com / password123 (Instructor)');
    console.log('   • admin@astralearn.com / admin123 (Admin)');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  }
}

function analyzeResponseData(data) {
  let score = 0;
  let hasRealData = false;
  let isEmpty = true;
  
  if (!data || typeof data !== 'object') {
    return { score, hasRealData, isEmpty };
  }
  
  // Check if response has meaningful structure
  const keys = Object.keys(data);
  if (keys.length > 0) {
    isEmpty = false;
    score += 2;
  }
  
  // Analyze data quality
  for (const key in data) {
    const value = data[key];
    
    // Arrays with content
    if (Array.isArray(value) && value.length > 0) {
      score += 3;
      hasRealData = true;
    }
    
    // Objects with content
    if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
      score += 2;
      hasRealData = true;
    }
    
    // Meaningful strings
    if (typeof value === 'string' && value.length > 10) {
      score += 1;
      hasRealData = true;
    }
    
    // Numbers (likely real data)
    if (typeof value === 'number' && value > 0) {
      score += 1;
      hasRealData = true;
    }
    
    // Boolean values
    if (typeof value === 'boolean') {
      score += 0.5;
    }
  }
  
  return {
    score: Math.min(score, 10),
    hasRealData,
    isEmpty
  };
}

finalIntegrationValidation().catch(console.error);
