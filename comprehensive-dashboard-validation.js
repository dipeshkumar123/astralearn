/**
 * Comprehensive Dashboard Real-Time Data Validation
 * Verifies all dashboard components use real backend data, not mock data
 * Tests component integration and data consistency
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class DashboardValidator {
  constructor() {
    this.results = {
      componentsAnalyzed: 0,
      mockDataIssues: [],
      integrationIssues: [],
      realTimeDataComponents: [],
      passedTests: 0,
      totalTests: 0
    };
  }

  async validateDashboardComponents() {
    console.log('🔍 COMPREHENSIVE DASHBOARD REAL-TIME DATA VALIDATION');
    console.log('=' .repeat(70));
    console.log('Objective: Verify all components use real backend data, not mock data\n');

    // Step 1: Analyze component files for mock data usage
    await this.analyzeComponentFiles();
    
    // Step 2: Test API integration
    await this.testAPIIntegration();
    
    // Step 3: Validate data consistency across components
    await this.validateDataConsistency();
    
    // Step 4: Generate comprehensive report
    this.generateReport();
  }

  async analyzeComponentFiles() {
    console.log('📁 STEP 1: ANALYZING COMPONENT FILES FOR MOCK DATA');
    console.log('-' .repeat(50));

    const componentPaths = [
      'client/src/components/dashboard/StudentDashboard.jsx',
      'client/src/components/dashboard/InstructorDashboard.jsx',
      'client/src/components/dashboard/AdminDashboard.jsx',
      'client/src/components/analytics/AnalyticsDashboard.jsx',
      'client/src/components/analytics/LearningInsights.jsx',
      'client/src/components/analytics/InstructorAnalytics.jsx',
      'client/src/components/gamification/GamificationDashboard.jsx',
      'client/src/components/gamification/Leaderboard.jsx',
      'client/src/components/gamification/AchievementProgress.jsx',
      'client/src/components/social/SocialDashboard.jsx',
      'client/src/components/social/StudyBuddies.jsx',
      'client/src/components/course/CourseManagementDashboard.jsx',
      'client/src/contexts/DataSyncProvider.jsx'
    ];

    for (const componentPath of componentPaths) {
      await this.analyzeComponent(componentPath);
    }
  }

  async analyzeComponent(componentPath) {
    const fullPath = path.join(__dirname, componentPath);
    
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  ${componentPath}: File not found`);
        return;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const componentName = path.basename(componentPath, '.jsx');
      
      console.log(`\n🔍 Analyzing ${componentName}...`);
      this.results.componentsAnalyzed++;

      // Check for mock data patterns
      const mockDataPatterns = [
        { pattern: /Math\.random\(\)/g, severity: 'HIGH', description: 'Math.random() usage' },
        { pattern: /\bmockData\b/gi, severity: 'HIGH', description: 'Mock data references' },
        { pattern: /\bfakeData\b/gi, severity: 'HIGH', description: 'Fake data references' },
        { pattern: /\bsampleData\b/gi, severity: 'MEDIUM', description: 'Sample data references' },
        { pattern: /\btestData\b/gi, severity: 'MEDIUM', description: 'Test data references' },
        { pattern: /\bdummyData\b/gi, severity: 'MEDIUM', description: 'Dummy data references' },
        { pattern: /\bhardcoded.*?data\b/gi, severity: 'MEDIUM', description: 'Hardcoded data references' },
        { pattern: /\bplaceholder.*?data\b/gi, severity: 'LOW', description: 'Placeholder data references' },
        { pattern: /\bfallback.*?data\b/gi, severity: 'LOW', description: 'Fallback data references' }
      ];

      const foundIssues = [];
      
      for (const { pattern, severity, description } of mockDataPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          foundIssues.push({
            component: componentName,
            severity,
            description,
            count: matches.length,
            matches: matches.slice(0, 3) // Show first 3 matches
          });
        }
      }

      // Check for real data integration patterns
      const realDataPatterns = [
        /useDataSync\(\)/g,
        /useAuth\(\)/g,
        /fetch\s*\(/g,
        /axios\./g,
        /api\//g,
        /Bearer\s+/g,
        /Authorization:/g,
        /\.then\(/g,
        /\.catch\(/g,
        /async\s+/g,
        /await\s+/g
      ];

      const realDataScore = realDataPatterns.reduce((score, pattern) => {
        const matches = content.match(pattern);
        return score + (matches ? matches.length : 0);
      }, 0);

      if (foundIssues.length > 0) {
        console.log(`   ❌ Found ${foundIssues.length} mock data issues:`);
        foundIssues.forEach(issue => {
          console.log(`      - ${issue.severity}: ${issue.description} (${issue.count} instances)`);
          this.results.mockDataIssues.push(issue);
        });
      } else {
        console.log(`   ✅ No mock data patterns detected`);
      }

      if (realDataScore > 5) {
        console.log(`   ✅ Real data integration score: ${realDataScore}/10+`);
        this.results.realTimeDataComponents.push({
          component: componentName,
          score: realDataScore,
          hasApiIntegration: content.includes('api/'),
          hasDataSync: content.includes('useDataSync'),
          hasAuth: content.includes('useAuth')
        });
      } else {
        console.log(`   ⚠️  Low real data integration score: ${realDataScore}/10+`);
        this.results.integrationIssues.push({
          component: componentName,
          issue: 'Low real data integration score',
          score: realDataScore
        });
      }

    } catch (error) {
      console.log(`   ❌ Error analyzing ${componentPath}: ${error.message}`);
    }
  }

  async testAPIIntegration() {
    console.log('\n\n🌐 STEP 2: TESTING API INTEGRATION');
    console.log('-' .repeat(50));

    const API_BASE = 'http://localhost:5000/api';
    
    try {
      // Test authentication
      console.log('🔐 Testing authentication...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        identifier: 'alice@example.com',
        password: 'password123'
      });

      const token = loginResponse.data.tokens.accessToken;
      const user = loginResponse.data.user;
      console.log(`✅ Authenticated as: ${user.firstName} ${user.lastName}`);

      // Test dashboard endpoints
      const dashboardEndpoints = [
        { url: '/analytics/summary', name: 'Analytics Summary', component: 'AnalyticsDashboard' },
        { url: '/courses/my/enrolled', name: 'Enrolled Courses', component: 'StudentDashboard' },
        { url: '/gamification/dashboard', name: 'Gamification Data', component: 'GamificationDashboard' },
        { url: '/social-learning/dashboard/social', name: 'Social Learning', component: 'SocialDashboard' },
        { url: '/adaptive-learning/recommendations', name: 'AI Recommendations', component: 'StudentDashboard' },
        { url: '/analytics/instructor/dashboard-overview', name: 'Instructor Analytics', component: 'InstructorAnalytics' },
        { url: '/courses/instructor', name: 'Instructor Courses', component: 'InstructorDashboard' },
        { url: '/gamification/leaderboard/rank', name: 'Leaderboard Rank', component: 'Leaderboard' }
      ];

      for (const endpoint of dashboardEndpoints) {
        this.results.totalTests++;
        
        try {
          const response = await axios.get(`${API_BASE}${endpoint.url}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const hasData = response.data && Object.keys(response.data).length > 0;
          const dataQuality = this.assessDataQuality(response.data);
          
          if (response.status === 200 && hasData && dataQuality.score >= 3) {
            console.log(`   ✅ ${endpoint.name}: Real data (Quality: ${dataQuality.score}/5)`);
            this.results.passedTests++;
          } else if (response.status === 200 && hasData) {
            console.log(`   ⚠️  ${endpoint.name}: Low quality data (Quality: ${dataQuality.score}/5)`);
          } else {
            console.log(`   ❌ ${endpoint.name}: Empty or invalid response`);
          }

        } catch (error) {
          console.log(`   ❌ ${endpoint.name}: API Error (${error.response?.status})`);
        }
      }

    } catch (authError) {
      console.log('❌ Authentication failed - cannot test API integration');
    }
  }

  assessDataQuality(data) {
    let score = 0;
    
    if (!data || typeof data !== 'object') return { score: 0 };

    // Check for meaningful data structure
    const keys = Object.keys(data);
    if (keys.length > 0) score += 1;

    // Check for arrays with content
    for (const key in data) {
      const value = data[key];
      if (Array.isArray(value) && value.length > 0) score += 1;
      if (value && typeof value === 'object' && Object.keys(value).length > 0) score += 1;
      if (typeof value === 'string' && value.length > 10) score += 0.5;
      if (typeof value === 'number' && value > 0) score += 0.5;
    }

    return { score: Math.min(score, 5) };
  }

  async validateDataConsistency() {
    console.log('\n\n🔄 STEP 3: VALIDATING DATA CONSISTENCY');
    console.log('-' .repeat(50));

    // Check DataSyncProvider integration
    const dataSyncPath = path.join(__dirname, 'client/src/contexts/DataSyncProvider.jsx');
    
    if (fs.existsSync(dataSyncPath)) {
      const content = fs.readFileSync(dataSyncPath, 'utf8');
      
      console.log('🔍 Analyzing DataSyncProvider...');
      
      const hasRealTimeUpdates = content.includes('useEffect') && content.includes('fetch');
      const hasErrorHandling = content.includes('catch') && content.includes('error');
      const hasLoadingStates = content.includes('loading') && content.includes('setLoading');
      const hasDataCaching = content.includes('localStorage') || content.includes('sessionStorage');
      
      console.log(`   ${hasRealTimeUpdates ? '✅' : '❌'} Real-time updates: ${hasRealTimeUpdates ? 'Implemented' : 'Missing'}`);
      console.log(`   ${hasErrorHandling ? '✅' : '❌'} Error handling: ${hasErrorHandling ? 'Implemented' : 'Missing'}`);
      console.log(`   ${hasLoadingStates ? '✅' : '❌'} Loading states: ${hasLoadingStates ? 'Implemented' : 'Missing'}`);
      console.log(`   ${hasDataCaching ? '✅' : '❌'} Data caching: ${hasDataCaching ? 'Implemented' : 'Missing'}`);
      
      if (hasRealTimeUpdates && hasErrorHandling && hasLoadingStates) {
        console.log('   ✅ DataSyncProvider is properly integrated');
        this.results.passedTests++;
      } else {
        console.log('   ⚠️  DataSyncProvider needs improvements');
        this.results.integrationIssues.push({
          component: 'DataSyncProvider',
          issue: 'Missing core functionality',
          details: {
            realTimeUpdates: hasRealTimeUpdates,
            errorHandling: hasErrorHandling,
            loadingStates: hasLoadingStates
          }
        });
      }
      
      this.results.totalTests++;
    }
  }

  generateReport() {
    console.log('\n\n📊 COMPREHENSIVE VALIDATION REPORT');
    console.log('=' .repeat(70));
    
    const successRate = this.results.totalTests > 0 ? 
      (this.results.passedTests / this.results.totalTests) * 100 : 0;
    
    console.log(`📈 Overall Success Rate: ${this.results.passedTests}/${this.results.totalTests} (${successRate.toFixed(1)}%)`);
    console.log(`📁 Components Analyzed: ${this.results.componentsAnalyzed}`);
    console.log(`✅ Real-Time Data Components: ${this.results.realTimeDataComponents.length}`);
    console.log(`❌ Mock Data Issues: ${this.results.mockDataIssues.length}`);
    console.log(`⚠️  Integration Issues: ${this.results.integrationIssues.length}`);
    
    // Mock Data Issues Summary
    if (this.results.mockDataIssues.length > 0) {
      console.log('\n🚨 MOCK DATA ISSUES FOUND:');
      const highSeverityIssues = this.results.mockDataIssues.filter(issue => issue.severity === 'HIGH');
      const mediumSeverityIssues = this.results.mockDataIssues.filter(issue => issue.severity === 'MEDIUM');
      const lowSeverityIssues = this.results.mockDataIssues.filter(issue => issue.severity === 'LOW');
      
      if (highSeverityIssues.length > 0) {
        console.log('   🔴 HIGH PRIORITY:');
        highSeverityIssues.forEach(issue => {
          console.log(`      - ${issue.component}: ${issue.description} (${issue.count} instances)`);
        });
      }
      
      if (mediumSeverityIssues.length > 0) {
        console.log('   🟡 MEDIUM PRIORITY:');
        mediumSeverityIssues.forEach(issue => {
          console.log(`      - ${issue.component}: ${issue.description} (${issue.count} instances)`);
        });
      }
      
      if (lowSeverityIssues.length > 0) {
        console.log('   🟢 LOW PRIORITY:');
        lowSeverityIssues.forEach(issue => {
          console.log(`      - ${issue.component}: ${issue.description} (${issue.count} instances)`);
        });
      }
    }
    
    // Real-Time Data Components
    if (this.results.realTimeDataComponents.length > 0) {
      console.log('\n✅ COMPONENTS USING REAL-TIME DATA:');
      this.results.realTimeDataComponents.forEach(component => {
        console.log(`   - ${component.component}: Score ${component.score}/10+`);
        console.log(`     ${component.hasApiIntegration ? '✅' : '❌'} API Integration`);
        console.log(`     ${component.hasDataSync ? '✅' : '❌'} DataSync Hook`);
        console.log(`     ${component.hasAuth ? '✅' : '❌'} Authentication`);
      });
    }
    
    // Integration Issues
    if (this.results.integrationIssues.length > 0) {
      console.log('\n⚠️  INTEGRATION ISSUES:');
      this.results.integrationIssues.forEach(issue => {
        console.log(`   - ${issue.component}: ${issue.issue}`);
      });
    }
    
    // Final Assessment
    console.log('\n🎯 FINAL ASSESSMENT:');
    if (successRate >= 90 && this.results.mockDataIssues.filter(i => i.severity === 'HIGH').length === 0) {
      console.log('🎉 EXCELLENT: Dashboard is using real-time data with proper integration!');
    } else if (successRate >= 75 && this.results.mockDataIssues.filter(i => i.severity === 'HIGH').length <= 2) {
      console.log('✅ GOOD: Dashboard mostly uses real-time data, minor issues to fix');
    } else if (successRate >= 50) {
      console.log('⚠️  PARTIAL: Dashboard partially integrated, significant work needed');
    } else {
      console.log('❌ POOR: Dashboard heavily relies on mock data, major integration needed');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.mockDataIssues.filter(i => i.severity === 'HIGH').length > 0) {
      console.log('1. 🔴 URGENT: Remove all Math.random() and mock data references');
    }
    if (this.results.integrationIssues.length > 0) {
      console.log('2. 🔧 Improve API integration in components with low scores');
    }
    if (this.results.realTimeDataComponents.length < this.results.componentsAnalyzed * 0.8) {
      console.log('3. 🔗 Enhance DataSyncProvider usage across all components');
    }
    console.log('4. 🧪 Run integration tests to ensure data consistency');
    console.log('5. 📱 Test user experience with real backend data');
    
    // Save detailed report
    this.saveDetailedReport();
  }

  saveDetailedReport() {
    const reportContent = {
      timestamp: new Date().toISOString(),
      summary: {
        componentsAnalyzed: this.results.componentsAnalyzed,
        successRate: this.results.totalTests > 0 ? (this.results.passedTests / this.results.totalTests) * 100 : 0,
        mockDataIssues: this.results.mockDataIssues.length,
        integrationIssues: this.results.integrationIssues.length,
        realTimeDataComponents: this.results.realTimeDataComponents.length
      },
      details: this.results
    };
    
    fs.writeFileSync('DASHBOARD_REAL_TIME_DATA_VALIDATION_REPORT.json', JSON.stringify(reportContent, null, 2));
    console.log('\n📄 Detailed report saved: DASHBOARD_REAL_TIME_DATA_VALIDATION_REPORT.json');
  }
}

// Run the validation
const validator = new DashboardValidator();
validator.validateDashboardComponents().catch(console.error);
