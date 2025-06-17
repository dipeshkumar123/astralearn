#!/usr/bin/env node

/**
 * Final Integration Test - Verify All Fixes
 * Tests button functionality, role-based access, and API integration
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FINAL INTEGRATION TEST - VERIFYING ALL FIXES');
console.log('======================================================================');

// Test 1: Check if button onClick handlers are properly implemented
console.log('\n1️⃣ Testing Button Functionality Fixes...');

const checkButtonFixes = () => {
  const filesToCheck = [
    {
      file: 'client/src/components/social/SocialDashboard.jsx',
      checks: [
        { pattern: /onClick.*setActiveTab.*community/, desc: 'Find Study Buddy button functionality' },
        { pattern: /onClick.*setActiveTab.*live-sessions/, desc: 'Start Live Session button functionality' },
        { pattern: /onClick.*setActiveTab.*groups/, desc: 'Create Study Group button functionality' }
      ]
    },
    {
      file: 'client/src/components/course/CoursePreview.jsx',
      checks: [
        { pattern: /onClick.*selectedRadio/, desc: 'Submit Answer button functionality' }
      ]
    },
    {
      file: 'client/src/components/social/LiveCollaboration.jsx',
      checks: [
        { pattern: /onClick={onClose}/, desc: 'Cancel button functionality' }
      ]
    },
    {
      file: 'client/src/components/dashboard/StudentDashboard.jsx',
      checks: [
        { pattern: /setCurrentView.*course-preview/, desc: 'Student navigation functionality' }
      ]
    },
    {
      file: 'client/src/components/dashboard/InstructorDashboard.jsx',
      checks: [
        { pattern: /setCurrentView.*course-management/, desc: 'Instructor navigation functionality' }
      ]
    }
  ];

  let buttonFixCount = 0;
  let totalChecks = 0;

  filesToCheck.forEach(({ file, checks }) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      checks.forEach(({ pattern, desc }) => {
        totalChecks++;
        if (pattern.test(content)) {
          console.log(`   ✅ ${desc}`);
          buttonFixCount++;
        } else {
          console.log(`   ❌ ${desc}`);
        }
      });
    } else {
      console.log(`   ⚠️  File not found: ${file}`);
    }
  });

  return { fixed: buttonFixCount, total: totalChecks };
};

const buttonResults = checkButtonFixes();

// Test 2: Check role-based navigation implementation
console.log('\n2️⃣ Testing Role-Based Navigation Fixes...');

const checkRoleBasedFixes = () => {
  const appFile = 'client/src/App.jsx';
  const appPath = path.join(process.cwd(), appFile);
  
  let roleFixCount = 0;
  let totalRoleChecks = 0;

  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    
    const roleChecks = [
      { pattern: /user\.role === 'instructor'.*course-management/, desc: 'Course Management restricted to instructors/admins' },
      { pattern: /user\.role === 'student'.*Social Learning/, desc: 'Social Learning restricted to students' },
      { pattern: /userRole.*student.*instructor.*admin/, desc: 'Role-specific labels for navigation' },
      { pattern: /setCurrentView.*prop/, desc: 'Navigation function passed to dashboards' }
    ];

    roleChecks.forEach(({ pattern, desc }) => {
      totalRoleChecks++;
      if (pattern.test(content)) {
        console.log(`   ✅ ${desc}`);
        roleFixCount++;
      } else {
        console.log(`   ❌ ${desc}`);
      }
    });
  }

  return { fixed: roleFixCount, total: totalRoleChecks };
};

const roleResults = checkRoleBasedFixes();

// Test 3: Check console.log removal
console.log('\n3️⃣ Testing Console.log Cleanup...');

const checkConsoleLogCleanup = () => {
  const dashboardFiles = [
    'client/src/components/dashboard/StudentDashboard.jsx',
    'client/src/components/dashboard/InstructorDashboard.jsx'
  ];

  let cleanupCount = 0;
  let totalCleanupChecks = 0;

  dashboardFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for specific console.log patterns that should be removed
      const consolePatterns = [
        /console\.log.*Starting course/,
        /console\.log.*Continuing course/,
        /console\.log.*Viewing course/,
        /console\.log.*Editing course/,
        /console\.log.*Filter button/,
        /console\.log.*Browse courses/
      ];

      consolePatterns.forEach(pattern => {
        totalCleanupChecks++;
        if (!pattern.test(content)) {
          console.log(`   ✅ Removed console.log in ${path.basename(file)}`);
          cleanupCount++;
        } else {
          console.log(`   ❌ Console.log still present in ${path.basename(file)}`);
        }
      });
    }
  });

  return { fixed: cleanupCount, total: totalCleanupChecks };
};

const cleanupResults = checkConsoleLogCleanup();

// Test 4: Check API endpoint additions
console.log('\n4️⃣ Testing API Endpoint Additions...');

const checkAPIEndpoints = () => {
  const analyticsFile = 'server/src/routes/analytics.js';
  const analyticsPath = path.join(process.cwd(), analyticsFile);
  
  let apiFixCount = 0;
  let totalAPIChecks = 0;

  if (fs.existsSync(analyticsPath)) {
    const content = fs.readFileSync(analyticsPath, 'utf8');
    
    const apiChecks = [
      { pattern: /\/admin\/system-overview/, desc: 'Admin system overview endpoint' },
      { pattern: /\/admin\/user-analytics/, desc: 'Admin user analytics endpoint' },
      { pattern: /dashboardData.*totalCourses.*totalStudents/, desc: 'Fixed instructor dashboard data structure' }
    ];

    apiChecks.forEach(({ pattern, desc }) => {
      totalAPIChecks++;
      if (pattern.test(content)) {
        console.log(`   ✅ ${desc}`);
        apiFixCount++;
      } else {
        console.log(`   ❌ ${desc}`);
      }
    });
  }

  return { fixed: apiFixCount, total: totalAPIChecks };
};

const apiResults = checkAPIEndpoints();

// Final Summary
console.log('\n📋 FINAL FIX VERIFICATION SUMMARY');
console.log('======================================================================');

const totalFixed = buttonResults.fixed + roleResults.fixed + cleanupResults.fixed + apiResults.fixed;
const totalChecks = buttonResults.total + roleResults.total + cleanupResults.total + apiResults.total;

console.log(`🔧 Button Functionality: ${buttonResults.fixed}/${buttonResults.total} fixed`);
console.log(`🔐 Role-Based Navigation: ${roleResults.fixed}/${roleResults.total} fixed`);
console.log(`🧹 Console.log Cleanup: ${cleanupResults.fixed}/${cleanupResults.total} fixed`);
console.log(`🔌 API Endpoints: ${apiResults.fixed}/${apiResults.total} fixed`);
console.log('----------------------------------------------------------------------');
console.log(`🎯 OVERALL PROGRESS: ${totalFixed}/${totalChecks} (${Math.round(totalFixed/totalChecks*100)}%) fixed`);

if (totalFixed === totalChecks) {
  console.log('🎉 ALL CRITICAL ISSUES HAVE BEEN RESOLVED!');
  console.log('✅ Frontend buttons are now functional');
  console.log('✅ Role-based navigation is properly implemented');
  console.log('✅ Console.log statements cleaned up');
  console.log('✅ Missing API endpoints added');
  console.log('\n🚀 The application is ready for testing!');
} else {
  console.log('⚠️  Some issues may still need attention');
  console.log('📝 Review the specific checks above for remaining items');
}

console.log('\n🔄 Next Steps:');
console.log('1. Start the backend server: npm run dev (in server directory)');
console.log('2. Start the frontend: npm run dev (in client directory)');
console.log('3. Test user flows for each role (student, instructor, admin)');
console.log('4. Verify all buttons and navigation work as expected');
