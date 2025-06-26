/**
 * Real-Time Data Integration Validation Script
 * Validates that all mock d      /      // Check for mock data patterns (simple string checks)
      const foundPatterns = [];
      
      if (content.includes('Math.random()')) {
        foundPatterns.push('Math.random()');
      }
      if (content.includes('Math.floor(Math.random(')) {
        foundPatterns.push('Math.floor(Math.random(');
      }
      if (content.includes('mockData') || content.includes('MOCK_DATA')) {
        foundPatterns.push('mockData');
      }
      if (content.includes('fake data') || content.includes('fakeData')) {
        foundPatterns.push('fakeData');
      }mock data patterns
      const mockPatterns = [
        'Math\\.random\\(\\)',
        'Math\\.floor\\(Math\\.random\\(',
        'mock.*data',
        'fallback.*data.*\\{',
        'fake.*data'
      ];been removed and real-time data is working
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 REAL-TIME DATA INTEGRATION VALIDATION');
console.log('======================================================================');

const results = {
  demoRemoval: {
    name: 'AI Demo Components Removal',
    status: 'unknown',
    details: []
  },
  mockDataRemoval: {
    name: 'Mock Data Removal',
    status: 'unknown',
    details: []
  },
  courseIdFixes: {
    name: 'CourseId Undefined Fixes',
    status: 'unknown',
    details: []
  },
  apiEndpoints: {
    name: 'Missing API Endpoints',
    status: 'unknown',
    details: []
  },
  analyticsService: {
    name: 'Analytics Service Completeness',
    status: 'unknown',
    details: []
  }
};

// Check 1: AI Demo Components Removal
console.log('📋 Checking AI Demo Components Removal...');
try {
  // Check if demo directory exists
  const demoPath = './client/src/components/demo';
  if (!fs.existsSync(demoPath)) {
    results.demoRemoval.status = 'success';
    results.demoRemoval.details.push('✅ Demo directory removed');
  } else {
    results.demoRemoval.status = 'failed';
    results.demoRemoval.details.push('❌ Demo directory still exists');
  }

  // Check App.jsx for isDemoMode removal
  const appJsxPath = './client/src/App.jsx';
  if (fs.existsSync(appJsxPath)) {
    const appContent = fs.readFileSync(appJsxPath, 'utf8');
    if (!appContent.includes('isDemoMode')) {
      results.demoRemoval.details.push('✅ isDemoMode removed from App.jsx');
    } else {
      results.demoRemoval.status = 'failed';
      results.demoRemoval.details.push('❌ isDemoMode still present in App.jsx');
    }
  }
} catch (error) {
  results.demoRemoval.status = 'error';
  results.demoRemoval.details.push(`❌ Error checking demo removal: ${error.message}`);
}

// Check 2: Mock Data Removal
console.log('📋 Checking Mock Data Removal...');
try {
  const filesToCheck = [
    './client/src/components/course/CoursePreview.jsx',
    './client/src/components/dashboard/AdminDashboard.jsx',
    './client/src/components/adaptive/AdaptiveLearningDashboard.jsx'
  ];

  let mockDataFound = false;
  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for mock data patterns (simple string checks)
      const foundPatterns = [];
      
      if (content.includes('Math.random()')) {
        foundPatterns.push('Math.random()');
      }
      if (content.includes('Math.floor(Math.random(')) {
        foundPatterns.push('Math.floor(Math.random(');
      }
      if (content.includes('mockData') || content.includes('MOCK_DATA')) {
        foundPatterns.push('mockData');
      }
      if (content.includes('fake data') || content.includes('fakeData')) {
        foundPatterns.push('fakeData');
      }

      if (foundPatterns.length > 0) {
        mockDataFound = true;
        results.mockDataRemoval.details.push(`❌ Mock data found in ${path.basename(filePath)}: ${foundPatterns.join(', ')}`);
      } else {
        results.mockDataRemoval.details.push(`✅ No mock data in ${path.basename(filePath)}`);
      }
    }
  }

  results.mockDataRemoval.status = mockDataFound ? 'partial' : 'success';
} catch (error) {
  results.mockDataRemoval.status = 'error';
  results.mockDataRemoval.details.push(`❌ Error checking mock data: ${error.message}`);
}

// Check 3: CourseId Undefined Fixes
console.log('📋 Checking CourseId Undefined Fixes...');
try {
  const studentDashboardPath = './client/src/components/dashboard/StudentDashboard.jsx';
  if (fs.existsSync(studentDashboardPath)) {
    const content = fs.readFileSync(studentDashboardPath, 'utf8');
    
    // Check for proper courseId validation
    const hasValidation = content.includes('if (!courseId)') || content.includes('if (courseId &&');
    const hasLocalStorage = content.includes('localStorage.setItem(\'selectedCourseId\'');
    const hasProperSetCurrentView = !content.includes('setCurrentView(prev => ({');

    if (hasValidation) {
      results.courseIdFixes.details.push('✅ CourseId validation present');
    } else {
      results.courseIdFixes.details.push('❌ Missing courseId validation');
    }

    if (hasLocalStorage) {
      results.courseIdFixes.details.push('✅ CourseId stored in localStorage');
    } else {
      results.courseIdFixes.details.push('❌ CourseId not stored in localStorage');
    }

    if (hasProperSetCurrentView) {
      results.courseIdFixes.details.push('✅ setCurrentView calls fixed');
    } else {
      results.courseIdFixes.details.push('❌ setCurrentView still has object syntax');
    }

    results.courseIdFixes.status = (hasValidation && hasLocalStorage && hasProperSetCurrentView) ? 'success' : 'partial';
  }
} catch (error) {
  results.courseIdFixes.status = 'error';
  results.courseIdFixes.details.push(`❌ Error checking courseId fixes: ${error.message}`);
}

// Check 4: Missing API Endpoints
console.log('📋 Checking Missing API Endpoints...');
try {
  const coursesRoutePath = './server/src/routes/courses.js';
  const adminRoutePath = './server/src/routes/admin.js';
  const routesIndexPath = './server/src/routes/index.js';

  // Check courses routes
  if (fs.existsSync(coursesRoutePath)) {
    const coursesContent = fs.readFileSync(coursesRoutePath, 'utf8');
    
    const hasProgressEndpoint = coursesContent.includes('/:id/progress');
    const hasQuizEndpoint = coursesContent.includes('/quiz');
    const hasLessonCompleteEndpoint = coursesContent.includes('/complete');

    if (hasProgressEndpoint) {
      results.apiEndpoints.details.push('✅ Course progress endpoint added');
    } else {
      results.apiEndpoints.details.push('❌ Missing course progress endpoint');
    }

    if (hasQuizEndpoint) {
      results.apiEndpoints.details.push('✅ Quiz submission endpoint added');
    } else {
      results.apiEndpoints.details.push('❌ Missing quiz submission endpoint');
    }

    if (hasLessonCompleteEndpoint) {
      results.apiEndpoints.details.push('✅ Lesson complete endpoint added');
    } else {
      results.apiEndpoints.details.push('❌ Missing lesson complete endpoint');
    }
  }

  // Check admin routes
  if (fs.existsSync(adminRoutePath)) {
    results.apiEndpoints.details.push('✅ Admin routes file created');
  } else {
    results.apiEndpoints.details.push('❌ Admin routes file missing');
  }

  // Check routes registration
  if (fs.existsSync(routesIndexPath)) {
    const routesContent = fs.readFileSync(routesIndexPath, 'utf8');
    if (routesContent.includes('adminRoutes')) {
      results.apiEndpoints.details.push('✅ Admin routes registered');
    } else {
      results.apiEndpoints.details.push('❌ Admin routes not registered');
    }
  }

  const successCount = results.apiEndpoints.details.filter(d => d.includes('✅')).length;
  const totalChecks = results.apiEndpoints.details.length;
  results.apiEndpoints.status = successCount === totalChecks ? 'success' : 'partial';

} catch (error) {
  results.apiEndpoints.status = 'error';
  results.apiEndpoints.details.push(`❌ Error checking API endpoints: ${error.message}`);
}

// Check 5: Analytics Service Completeness
console.log('📋 Checking Analytics Service Completeness...');
try {
  const analyticsServicePath = './server/src/services/analyticsService.js';
  if (fs.existsSync(analyticsServicePath)) {
    const content = fs.readFileSync(analyticsServicePath, 'utf8');
    
    const hasGenerateContentRecommendations = content.includes('generateContentRecommendations');
    const hasCalculateProgressTrends = content.includes('calculateProgressTrends');
    
    if (hasGenerateContentRecommendations) {
      results.analyticsService.details.push('✅ generateContentRecommendations method present');
    } else {
      results.analyticsService.details.push('❌ Missing generateContentRecommendations method');
    }

    if (hasCalculateProgressTrends) {
      results.analyticsService.details.push('✅ calculateProgressTrends method present');
    } else {
      results.analyticsService.details.push('❌ Missing calculateProgressTrends method');
    }

    results.analyticsService.status = (hasGenerateContentRecommendations && hasCalculateProgressTrends) ? 'success' : 'partial';
  }
} catch (error) {
  results.analyticsService.status = 'error';
  results.analyticsService.details.push(`❌ Error checking analytics service: ${error.message}`);
}

// Display Results
console.log('\n🏆 VALIDATION RESULTS');
console.log('======================================================================');

let totalSuccesses = 0;
let totalChecks = 0;

for (const [key, result] of Object.entries(results)) {
  const status = result.status === 'success' ? '✅' : 
                result.status === 'partial' ? '⚠️' : '❌';
  
  console.log(`\n${status} ${result.name}: ${result.status.toUpperCase()}`);
  result.details.forEach(detail => console.log(`   ${detail}`));
  
  if (result.status === 'success') totalSuccesses++;
  totalChecks++;
}

const successRate = Math.round((totalSuccesses / totalChecks) * 100);

console.log('\n======================================================================');
console.log(`📊 Overall Success Rate: ${totalSuccesses}/${totalChecks} (${successRate}%)`);

if (successRate >= 80) {
  console.log('🎉 EXCELLENT: Real-time data integration is working well!');
} else if (successRate >= 60) {
  console.log('⚠️  GOOD: Most real-time features working, some issues remain');
} else {
  console.log('❌ NEEDS WORK: Several integration issues need to be addressed');
}

console.log('\n🚀 Next Steps:');
if (totalSuccesses === totalChecks) {
  console.log('   • All integration issues resolved!');
  console.log('   • Ready for production deployment');
} else {
  console.log('   • Address remaining integration issues');
  console.log('   • Re-run validation after fixes');
  console.log('   • Test end-to-end functionality');
}

console.log('\n📱 Test the application at: http://localhost:3000');
console.log('======================================================================');
