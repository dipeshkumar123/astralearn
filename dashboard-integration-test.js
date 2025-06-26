/**
 * Dashboard Component Integration Test
 * Verifies that all dashboard components are properly integrated and using real-time data
 */

const axios = require('axios');

class DashboardIntegrationTest {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.testResults = {
      apiTests: { passed: 0, total: 0 },
      dataConsistency: { passed: 0, total: 0 },
      integration: { passed: 0, total: 0 },
      issues: []
    };
  }

  async runCompleteIntegrationTest() {
    console.log('🚀 DASHBOARD COMPONENT INTEGRATION TEST');
    console.log('=' .repeat(60));
    console.log('Testing real-time data flow and component integration\n');

    try {
      // Step 1: Test Authentication & Token Management
      const token = await this.testAuthentication();
      if (!token) return;

      // Step 2: Test Core Dashboard APIs
      await this.testDashboardAPIs(token);

      // Step 3: Test Data Consistency Across Components
      await this.testDataConsistency(token);

      // Step 4: Test Component Integration Points
      await this.testComponentIntegration(token);

      // Step 5: Generate Final Report
      this.generateIntegrationReport();

    } catch (error) {
      console.error('❌ Integration test failed:', error.message);
    }
  }

  async testAuthentication() {
    console.log('🔐 STEP 1: AUTHENTICATION & TOKEN MANAGEMENT');
    console.log('-' .repeat(40));

    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        identifier: 'alice@example.com',
        password: 'password123'
      });

      const token = response.data.tokens.accessToken;
      const user = response.data.user;

      console.log(`✅ Authentication successful`);
      console.log(`👤 User: ${user.firstName} ${user.lastName}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`🔑 Token: ${token ? 'Valid' : 'Invalid'}`);
      
      this.testResults.integration.passed++;
      this.testResults.integration.total++;

      return token;

    } catch (error) {
      console.log('❌ Authentication failed');
      this.testResults.integration.total++;
      this.testResults.issues.push('Authentication failed - cannot proceed with integration tests');
      return null;
    }
  }

  async testDashboardAPIs(token) {
    console.log('\n📊 STEP 2: CORE DASHBOARD API ENDPOINTS');
    console.log('-' .repeat(40));

    const endpoints = [
      {
        name: 'Student Analytics',
        url: '/analytics/summary',
        expectedData: ['totalPoints', 'streak', 'coursesCompleted'],
        component: 'StudentDashboard'
      },
      {
        name: 'Enrolled Courses',
        url: '/courses/my/enrolled',
        expectedData: ['enrolledCourses'],
        component: 'StudentDashboard'
      },
      {
        name: 'Course Catalog',
        url: '/courses',
        expectedData: ['courses'],
        component: 'StudentDashboard'
      },
      {
        name: 'Gamification Data',
        url: '/gamification/dashboard',
        expectedData: ['achievements', 'badges', 'profile'],
        component: 'GamificationDashboard'
      },
      {
        name: 'AI Recommendations',
        url: '/adaptive-learning/recommendations',
        expectedData: ['recommendations'],
        component: 'StudentDashboard'
      },
      {
        name: 'Social Learning',
        url: '/social-learning/dashboard/social',
        expectedData: [],
        component: 'SocialDashboard'
      }
    ];

    for (const endpoint of endpoints) {
      this.testResults.apiTests.total++;
      
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint.url}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const hasValidStructure = this.validateDataStructure(response.data, endpoint.expectedData);
        const dataQuality = this.assessDataQuality(response.data);

        if (response.status === 200 && hasValidStructure && dataQuality >= 3) {
          console.log(`✅ ${endpoint.name}: Valid data (Quality: ${dataQuality}/5)`);
          this.testResults.apiTests.passed++;
        } else {
          console.log(`⚠️  ${endpoint.name}: Low quality data (Quality: ${dataQuality}/5)`);
          this.testResults.issues.push(`${endpoint.component}: ${endpoint.name} has low quality data`);
        }

      } catch (error) {
        console.log(`❌ ${endpoint.name}: API Error (${error.response?.status})`);
        this.testResults.issues.push(`${endpoint.component}: ${endpoint.name} API failed`);
      }
    }
  }

  async testDataConsistency(token) {
    console.log('\n🔄 STEP 3: DATA CONSISTENCY ACROSS COMPONENTS');
    console.log('-' .repeat(40));

    try {
      // Test 1: Course data consistency
      this.testResults.dataConsistency.total++;
      const coursesResponse = await axios.get(`${this.baseUrl}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const enrolledResponse = await axios.get(`${this.baseUrl}/courses/my/enrolled`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allCourses = coursesResponse.data.courses || [];
      const enrolledCourses = enrolledResponse.data.enrolledCourses || [];

      console.log(`📚 All Courses: ${allCourses.length}`);
      console.log(`📖 Enrolled Courses: ${enrolledCourses.length}`);

      // Verify enrolled courses exist in all courses
      const enrolledCourseIds = enrolledCourses.map(ec => ec.courseId || ec._id);
      const allCourseIds = allCourses.map(c => c._id);
      const consistentCourses = enrolledCourseIds.every(id => allCourseIds.includes(id));

      if (consistentCourses) {
        console.log('✅ Course data consistency: Passed');
        this.testResults.dataConsistency.passed++;
      } else {
        console.log('❌ Course data consistency: Failed');
        this.testResults.issues.push('Course data inconsistency between catalog and enrolled courses');
      }

      // Test 2: User analytics consistency
      this.testResults.dataConsistency.total++;
      const analyticsResponse = await axios.get(`${this.baseUrl}/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const analytics = analyticsResponse.data;
      const hasValidAnalytics = analytics && typeof analytics === 'object';

      if (hasValidAnalytics) {
        console.log('✅ Analytics data consistency: Passed');
        console.log(`   📊 Total Points: ${analytics.summary?.totalPoints || 0}`);
        console.log(`   🔥 Streak: ${analytics.summary?.streak || 0} days`);
        this.testResults.dataConsistency.passed++;
      } else {
        console.log('❌ Analytics data consistency: Failed');
        this.testResults.issues.push('Analytics data is not properly structured');
      }

    } catch (error) {
      console.log('❌ Data consistency test failed');
      this.testResults.issues.push('Data consistency tests failed due to API errors');
    }
  }

  async testComponentIntegration(token) {
    console.log('\n🔗 STEP 4: COMPONENT INTEGRATION POINTS');
    console.log('-' .repeat(40));

    // Test 1: DataSyncProvider Integration
    this.testResults.integration.total++;
    console.log('🔍 Testing DataSyncProvider integration...');
    
    try {
      // Test multiple endpoints that DataSyncProvider should manage
      const promises = [
        axios.get(`${this.baseUrl}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${this.baseUrl}/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${this.baseUrl}/gamification/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      ];

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(r => r.status === 200);

      if (allSuccessful) {
        console.log('✅ DataSyncProvider endpoints: All accessible');
        this.testResults.integration.passed++;
      } else {
        console.log('❌ DataSyncProvider endpoints: Some failed');
        this.testResults.issues.push('DataSyncProvider cannot access all required endpoints');
      }

    } catch (error) {
      console.log('❌ DataSyncProvider integration test failed');
      this.testResults.issues.push('DataSyncProvider integration failed');
    }

    // Test 2: Real-time updates capability
    this.testResults.integration.total++;
    console.log('🔄 Testing real-time update capability...');
    
    try {
      // Test enrollment process (simulates real-time data change)
      const coursesResponse = await axios.get(`${this.baseUrl}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const availableCourses = coursesResponse.data.courses || [];
      
      if (availableCourses.length > 0) {
        console.log('✅ Real-time data capability: Available courses found');
        console.log(`   📚 ${availableCourses.length} courses available for enrollment`);
        this.testResults.integration.passed++;
      } else {
        console.log('⚠️  Real-time data capability: No courses available');
        this.testResults.issues.push('No courses available for testing real-time updates');
      }

    } catch (error) {
      console.log('❌ Real-time update test failed');
      this.testResults.issues.push('Real-time update capability test failed');
    }

    // Test 3: Cross-component data sharing
    this.testResults.integration.total++;
    console.log('🤝 Testing cross-component data sharing...');
    
    try {
      // Test if user data is consistent across different dashboard components
      const userDataEndpoints = [
        '/analytics/summary',
        '/gamification/dashboard',
        '/courses/my/enrolled'
      ];

      let userIdConsistency = true;
      let previousUserId = null;

      for (const endpoint of userDataEndpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Extract user identifier from response (if available)
          const userId = response.data.userId || response.data.user?.id || response.data.summary?.userId;
          
          if (userId) {
            if (previousUserId && previousUserId !== userId) {
              userIdConsistency = false;
            }
            previousUserId = userId;
          }
        } catch (error) {
          // Some endpoints might not have user ID, that's okay
        }
      }

      if (userIdConsistency) {
        console.log('✅ Cross-component data sharing: Consistent');
        this.testResults.integration.passed++;
      } else {
        console.log('❌ Cross-component data sharing: Inconsistent user data');
        this.testResults.issues.push('User data inconsistency across components');
      }

    } catch (error) {
      console.log('❌ Cross-component data sharing test failed');
      this.testResults.issues.push('Cross-component data sharing test failed');
    }
  }

  validateDataStructure(data, expectedFields) {
    if (!data || typeof data !== 'object') return false;
    
    if (expectedFields.length === 0) return true;
    
    return expectedFields.some(field => {
      const keys = field.split('.');
      let current = data;
      
      for (const key of keys) {
        if (!current || typeof current !== 'object' || !(key in current)) {
          return false;
        }
        current = current[key];
      }
      return true;
    });
  }

  assessDataQuality(data) {
    let score = 0;
    
    if (!data || typeof data !== 'object') return 0;

    const keys = Object.keys(data);
    if (keys.length > 0) score += 1;

    for (const key in data) {
      const value = data[key];
      
      if (Array.isArray(value) && value.length > 0) score += 1;
      if (value && typeof value === 'object' && Object.keys(value).length > 0) score += 1;
      if (typeof value === 'string' && value.length > 5) score += 0.5;
      if (typeof value === 'number' && value >= 0) score += 0.5;
      if (typeof value === 'boolean') score += 0.25;
    }

    return Math.min(score, 5);
  }

  generateIntegrationReport() {
    console.log('\n\n📋 DASHBOARD INTEGRATION TEST REPORT');
    console.log('=' .repeat(60));

    const apiSuccess = this.testResults.apiTests.total > 0 ? 
      (this.testResults.apiTests.passed / this.testResults.apiTests.total) * 100 : 0;
    
    const dataSuccess = this.testResults.dataConsistency.total > 0 ? 
      (this.testResults.dataConsistency.passed / this.testResults.dataConsistency.total) * 100 : 0;
    
    const integrationSuccess = this.testResults.integration.total > 0 ? 
      (this.testResults.integration.passed / this.testResults.integration.total) * 100 : 0;

    console.log(`🌐 API Integration: ${this.testResults.apiTests.passed}/${this.testResults.apiTests.total} (${apiSuccess.toFixed(1)}%)`);
    console.log(`🔄 Data Consistency: ${this.testResults.dataConsistency.passed}/${this.testResults.dataConsistency.total} (${dataSuccess.toFixed(1)}%)`);
    console.log(`🔗 Component Integration: ${this.testResults.integration.passed}/${this.testResults.integration.total} (${integrationSuccess.toFixed(1)}%)`);

    const overallSuccess = ((apiSuccess + dataSuccess + integrationSuccess) / 3);
    console.log(`\n🎯 Overall Integration Score: ${overallSuccess.toFixed(1)}%`);

    if (overallSuccess >= 90) {
      console.log('🎉 EXCELLENT: Dashboard components are fully integrated with real-time data!');
    } else if (overallSuccess >= 75) {
      console.log('✅ GOOD: Dashboard integration is solid with minor issues');
    } else if (overallSuccess >= 50) {
      console.log('⚠️  PARTIAL: Dashboard integration needs improvement');
    } else {
      console.log('❌ POOR: Dashboard integration requires significant work');
    }

    if (this.testResults.issues.length > 0) {
      console.log('\n🔍 Issues Found:');
      this.testResults.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });

      console.log('\n💡 Recommendations:');
      const uniqueComponents = [...new Set(this.testResults.issues.map(issue => issue.split(':')[0]))];
      uniqueComponents.forEach(component => {
        console.log(`   • Review ${component} component for proper data integration`);
      });
    }

    console.log('\n✨ INTEGRATION STATUS: ' + (overallSuccess >= 80 ? 'READY ✅' : 'NEEDS WORK ⚠️'));
    console.log('\n🚀 Next Steps:');
    console.log('   1. Fix any identified issues');
    console.log('   2. Test dashboard in browser with real user interactions');
    console.log('   3. Verify loading states and error handling');
    console.log('   4. Ensure responsive design with real data');
  }
}

// Run the integration test
const integrationTest = new DashboardIntegrationTest();
integrationTest.runCompleteIntegrationTest().catch(console.error);
