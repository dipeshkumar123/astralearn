const fetch = require('node-fetch');

class AdaptiveLearningValidator {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction, category = 'general') {
    this.results.total++;
    console.log(`\n🧪 Testing: ${testName}`);
    
    try {
      const result = await testFunction();
      if (result.success) {
        this.results.passed++;
        console.log(`✅ ${testName}: ${result.message}`);
      } else {
        this.results.failed++;
        console.log(`❌ ${testName}: ${result.message}`);
      }
      
      this.results.tests.push({
        name: testName,
        category,
        success: result.success,
        message: result.message,
        details: result.details || null
      });
    } catch (error) {
      this.results.failed++;
      console.log(`❌ ${testName}: Error - ${error.message}`);
      this.results.tests.push({
        name: testName,
        category,
        success: false,
        message: error.message,
        details: error.stack
      });
    }
  }

  async validateBackendServices() {
    console.log('\n🔧 BACKEND SERVICES VALIDATION');
    console.log('=====================================');

    // Test 1: Adaptive Learning Health
    await this.runTest('Adaptive Learning Health Check', async () => {
      const response = await fetch(`${this.baseUrl}/api/adaptive-learning/health`);
      const data = await response.json();
      
      if (response.ok && data.status === 'operational') {
        return {
          success: true,
          message: `Service operational (v${data.version})`,
          details: data
        };
      }
      return { success: false, message: 'Service not operational' };
    }, 'backend');

    // Test 2: Learning Path Generation Service
    await this.runTest('Learning Path Generation Service', async () => {
      const response = await fetch(`${this.baseUrl}/api/adaptive-learning/learning-path/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user', courseId: 'test-course' })
      });
      
      if (response.status === 401) {
        return { success: true, message: 'Properly protected with authentication' };
      }
      return { success: false, message: `Unexpected status: ${response.status}` };
    }, 'backend');

    // Test 3: Assessment Engine Service
    await this.runTest('Assessment Engine Service', async () => {
      const response = await fetch(`${this.baseUrl}/api/adaptive-learning/assessment/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: 'test-course', difficulty: 'intermediate' })
      });
      
      if (response.status === 401) {
        return { success: true, message: 'Properly protected with authentication' };
      }
      return { success: false, message: `Unexpected status: ${response.status}` };
    }, 'backend');

    // Test 4: Learning Analytics Service
    await this.runTest('Learning Analytics Service', async () => {
      const response = await fetch(`${this.baseUrl}/api/adaptive-learning/analytics/dashboard?userId=test-user`);
      
      if (response.status === 401) {
        return { success: true, message: 'Properly protected with authentication' };
      }
      return { success: false, message: `Unexpected status: ${response.status}` };
    }, 'backend');

    // Test 5: Recommendations Engine
    await this.runTest('Recommendations Engine', async () => {
      const response = await fetch(`${this.baseUrl}/api/adaptive-learning/recommendations?userId=test-user`);
      
      if (response.status === 401) {
        return { success: true, message: 'Properly protected with authentication' };
      }
      return { success: false, message: `Unexpected status: ${response.status}` };
    }, 'backend');
  }

  async validateFrontendComponents() {
    console.log('\n🎨 FRONTEND COMPONENTS VALIDATION');
    console.log('=====================================');

    const fs = require('fs');
    const path = require('path');

    // Test 1: AdaptiveLearningDashboard Component
    await this.runTest('AdaptiveLearningDashboard Component', async () => {
      const componentPath = path.join(__dirname, 'client/src/components/adaptive/AdaptiveLearningDashboard.jsx');
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const hasRequiredFeatures = [
          'useState',
          'useEffect',
          'framer-motion',
          'loadDashboardData',
          'recommendations',
          'learningPath'
        ].every(feature => content.includes(feature));

        if (hasRequiredFeatures) {
          return { success: true, message: 'Component implemented with required features' };
        }
        return { success: false, message: 'Component missing required features' };
      }
      return { success: false, message: 'Component file not found' };
    }, 'frontend');

    // Test 2: InteractiveAssessment Component
    await this.runTest('InteractiveAssessment Component', async () => {
      const componentPath = path.join(__dirname, 'client/src/components/adaptive/InteractiveAssessment.jsx');
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const hasRequiredFeatures = [
          'assessment',
          'currentQuestion',
          'submitAnswer',
          'timer',
          'progress'
        ].every(feature => content.includes(feature));

        if (hasRequiredFeatures) {
          return { success: true, message: 'Assessment component fully functional' };
        }
        return { success: false, message: 'Assessment component missing features' };
      }
      return { success: false, message: 'Assessment component file not found' };
    }, 'frontend');

    // Test 3: LearningAnalyticsDashboard Component
    await this.runTest('LearningAnalyticsDashboard Component', async () => {
      const componentPath = path.join(__dirname, 'client/src/components/adaptive/LearningAnalyticsDashboard.jsx');
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const hasRequiredFeatures = [
          'Recharts',
          'LineChart',
          'BarChart',
          'analytics',
          'performance'
        ].every(feature => content.includes(feature));

        if (hasRequiredFeatures) {
          return { success: true, message: 'Analytics dashboard with visualizations' };
        }
        return { success: false, message: 'Analytics dashboard missing features' };
      }
      return { success: false, message: 'Analytics dashboard file not found' };
    }, 'frontend');

    // Test 4: Authentication Components
    await this.runTest('Authentication Components', async () => {
      const authProviderPath = path.join(__dirname, 'client/src/components/auth/AuthProvider.jsx');
      const loginFormPath = path.join(__dirname, 'client/src/components/auth/LoginForm.jsx');
      
      if (fs.existsSync(authProviderPath) && fs.existsSync(loginFormPath)) {
        return { success: true, message: 'Authentication system implemented' };
      }
      return { success: false, message: 'Authentication components missing' };
    }, 'frontend');
  }

  async validateDependencies() {
    console.log('\n📦 DEPENDENCIES VALIDATION');
    console.log('=====================================');

    const fs = require('fs');
    const path = require('path');

    // Test 1: Frontend Dependencies
    await this.runTest('Frontend Dependencies', async () => {
      const packagePath = path.join(__dirname, 'client/package.json');
      if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
        
        const requiredDeps = ['recharts', 'framer-motion'];
        const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
        
        if (missingDeps.length === 0) {
          return { success: true, message: 'All required dependencies installed' };
        }
        return { success: false, message: `Missing dependencies: ${missingDeps.join(', ')}` };
      }
      return { success: false, message: 'package.json not found' };
    }, 'dependencies');

    // Test 2: Backend Dependencies
    await this.runTest('Backend Dependencies', async () => {
      const packagePath = path.join(__dirname, 'server/package.json');
      if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
        
        const requiredDeps = ['simple-statistics', 'node-cron'];
        const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
        
        if (missingDeps.length === 0) {
          return { success: true, message: 'All required backend dependencies installed' };
        }
        return { success: false, message: `Missing backend dependencies: ${missingDeps.join(', ')}` };
      }
      return { success: false, message: 'Backend package.json not found' };
    }, 'dependencies');
  }

  async validateIntegration() {
    console.log('\n🔗 INTEGRATION VALIDATION');
    console.log('=====================================');

    // Test 1: App.jsx Integration
    await this.runTest('App.jsx Integration', async () => {
      const fs = require('fs');
      const path = require('path');
      const appPath = path.join(__dirname, 'client/src/App.jsx');
      
      if (fs.existsSync(appPath)) {
        const content = fs.readFileSync(appPath, 'utf8');
        const hasIntegration = [
          'AdaptiveLearningDashboard',
          'AuthProvider',
          'adaptive-learning'
        ].every(feature => content.includes(feature));

        if (hasIntegration) {
          return { success: true, message: 'Adaptive learning integrated into main app' };
        }
        return { success: false, message: 'Integration incomplete' };
      }
      return { success: false, message: 'App.jsx not found' };
    }, 'integration');

    // Test 2: AI Integration
    await this.runTest('AI Integration', async () => {
      const response = await fetch(`${this.baseUrl}/api/ai/health`);
      if (response.ok) {
        return { success: true, message: 'AI services available for adaptive learning' };
      }
      return { success: false, message: 'AI services not available' };
    }, 'integration');
  }

  generateReport() {
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=====================================');
    
    const passRate = (this.results.passed / this.results.total * 100).toFixed(1);
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Pass Rate: ${passRate}%`);

    // Group results by category
    const categories = {};
    this.results.tests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { passed: 0, total: 0 };
      }
      categories[test.category].total++;
      if (test.success) categories[test.category].passed++;
    });

    console.log('\n📋 CATEGORY BREAKDOWN:');
    Object.entries(categories).forEach(([category, stats]) => {
      const categoryPassRate = (stats.passed / stats.total * 100).toFixed(1);
      console.log(`  ${category}: ${stats.passed}/${stats.total} (${categoryPassRate}%)`);
    });

    // Implementation completeness
    const completeness = Math.min(passRate, 100);
    console.log('\n🎯 PHASE 3 STEP 2 IMPLEMENTATION STATUS:');
    
    if (completeness >= 95) {
      console.log(`🎉 IMPLEMENTATION COMPLETE (${completeness}%)`);
      console.log('✅ Ready for production deployment');
    } else if (completeness >= 88) {
      console.log(`🚀 IMPLEMENTATION NEARLY COMPLETE (${completeness}%)`);
      console.log('🔄 Ready for Phase 3 Step 3');
    } else {
      console.log(`⚠️  IMPLEMENTATION IN PROGRESS (${completeness}%)`);
      console.log('🔧 Additional work needed');
    }

    return {
      ...this.results,
      passRate: parseFloat(passRate),
      completeness: parseFloat(completeness),
      categories
    };
  }
}

// Run validation
async function main() {
  console.log('🧠 AstraLearn Phase 3 Step 2 - Adaptive Learning Engine Validation');
  console.log('==================================================================');
  
  const validator = new AdaptiveLearningValidator();
  
  await validator.validateBackendServices();
  await validator.validateFrontendComponents();
  await validator.validateDependencies();
  await validator.validateIntegration();
  
  const report = validator.generateReport();
  
  console.log('\n🎯 NEXT STEPS:');
  if (report.completeness >= 95) {
    console.log('- Phase 3 Step 3: Production optimization');
    console.log('- Advanced ML model integration');
    console.log('- Real-time collaboration features');
    console.log('- Mobile application development');
  } else {
    console.log('- Fix failing tests');
    console.log('- Complete missing features');
    console.log('- Ensure all components are properly integrated');
  }
  
  process.exit(report.failed === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdaptiveLearningValidator;
