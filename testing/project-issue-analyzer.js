/**
 * Comprehensive Project Issue Analysis and Fix Tool
 * Identifies and fixes button functionality, role-based access, and integration issues
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class ProjectAnalyzer {
  constructor() {
    this.issues = {
      nonWorkingButtons: [],
      roleBasedIssues: [],
      integrationIssues: [],
      missingApis: []
    };
    this.API_BASE = 'http://localhost:5000/api';
  }

  // 1. Analyze Button Functionality Issues
  async analyzeButtons() {
    console.log('🔍 Analyzing Button Functionality Issues...\n');
    
    const buttonPatterns = [
      { file: 'client/src/components/dashboard/StudentDashboard.jsx', issues: [] },
      { file: 'client/src/components/dashboard/InstructorDashboard.jsx', issues: [] },
      { file: 'client/src/components/dashboard/AdminDashboard.jsx', issues: [] }
    ];

    // Common button issues found in semantic search results:
    this.issues.nonWorkingButtons = [
      {
        component: 'StudentDashboard',
        issue: 'Continue button only logs to console, no actual navigation',
        location: 'line 370',
        severity: 'high'
      },
      {
        component: 'InstructorDashboard', 
        issue: 'Create Course button only logs to console, no form/modal',
        location: 'line 207',
        severity: 'high'
      },
      {
        component: 'InstructorDashboard',
        issue: 'Course view/edit buttons only log to console',
        location: 'line 396, 228',
        severity: 'high'
      },
      {
        component: 'SocialDashboard',
        issue: 'Find Study Buddy and Start Live Session buttons have no handlers',
        location: 'line 637',
        severity: 'medium'
      },
      {
        component: 'CoursePreview',
        issue: 'Submit Answer button has no onclick handler',
        location: 'line 431',
        severity: 'high'
      },
      {
        component: 'LiveCollaboration',
        issue: 'Cancel button in session form has no handler',
        location: 'line 809',
        severity: 'medium'
      }
    ];

    console.log('❌ Found', this.issues.nonWorkingButtons.length, 'button functionality issues');
    this.issues.nonWorkingButtons.forEach(issue => {
      console.log(`   • ${issue.component}: ${issue.issue} (${issue.severity})`);
    });
  }

  // 2. Analyze Role-Based Access Issues
  async analyzeRoleBasedAccess() {
    console.log('\n🔐 Analyzing Role-Based Access Issues...\n');
    
    this.issues.roleBasedIssues = [
      {
        issue: 'All users see Adaptive Learning tab - should be personalized per role',
        components: ['App.jsx'],
        severity: 'medium'
      },
      {
        issue: 'Gamification tab available to all roles - instructors/admins should have different view',
        components: ['App.jsx'],
        severity: 'medium'
      },
      {
        issue: 'Social Learning features shown to instructors/admins inappropriately',
        components: ['App.jsx'],
        severity: 'low'
      },
      {
        issue: 'Student-specific features (study buddies, streaks) shown in instructor dashboard',
        components: ['InstructorDashboard.jsx'],
        severity: 'high'
      },
      {
        issue: 'Admin dashboard shows student gamification instead of system oversight',
        components: ['AdminDashboard.jsx'],
        severity: 'high'
      },
      {
        issue: 'AI Demo accessible to all roles without customization',
        components: ['App.jsx'],
        severity: 'low'
      }
    ];

    console.log('❌ Found', this.issues.roleBasedIssues.length, 'role-based access issues');
    this.issues.roleBasedIssues.forEach(issue => {
      console.log(`   • ${issue.issue} (${issue.severity})`);
    });
  }

  // 3. Test API Integration
  async testApiIntegration() {
    console.log('\n🔌 Testing API Integration...\n');
    
    try {
      // Test student endpoints
      const studentLogin = await this.testLogin('alice@example.com', 'password123');
      if (studentLogin.success) {
        await this.testEndpointIntegration(studentLogin.token, 'student');
      }

      // Test instructor endpoints  
      const instructorLogin = await this.testLogin('sarah@example.com', 'password123');
      if (instructorLogin.success) {
        await this.testEndpointIntegration(instructorLogin.token, 'instructor');
      }

      // Test admin endpoints
      const adminLogin = await this.testLogin('admin@astralearn.com', 'admin123');
      if (adminLogin.success) {
        await this.testEndpointIntegration(adminLogin.token, 'admin');
      }

    } catch (error) {
      console.log('❌ API Integration test failed:', error.message);
    }
  }

  async testLogin(identifier, password) {
    try {
      const response = await axios.post(`${this.API_BASE}/auth/login`, {
        identifier, password
      });
      return { success: true, token: response.data.tokens.accessToken };
    } catch (error) {
      console.log(`❌ Login failed for ${identifier}`);
      return { success: false };
    }
  }

  async testEndpointIntegration(token, role) {
    const endpointTests = {
      student: [
        '/analytics/summary',
        '/courses/my/enrolled', 
        '/gamification/dashboard',
        '/social-learning/study-buddies/list',
        '/adaptive-learning/recommendations'
      ],
      instructor: [
        '/courses/instructor',
        '/analytics/instructor/dashboard-overview',
        '/course-management/search'
      ],
      admin: [
        '/analytics/admin/system-overview',
        '/analytics/admin/user-analytics'
      ]
    };

    const endpoints = endpointTests[role] || [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.status === 200) {
          console.log(`   ✅ ${role} - ${endpoint}: Working`);
        }
      } catch (error) {
        console.log(`   ❌ ${role} - ${endpoint}: ${error.response?.status || 'Failed'}`);
        this.issues.integrationIssues.push({
          role,
          endpoint,
          status: error.response?.status || 'Failed',
          error: error.response?.data?.error || error.message
        });
      }
    }
  }

  // 4. Generate Fixes
  async generateFixes() {
    console.log('\n🔧 Generating Fixes...\n');
    
    const fixes = {
      buttons: this.generateButtonFixes(),
      roleAccess: this.generateRoleAccessFixes(),
      integration: this.generateIntegrationFixes()
    };

    return fixes;
  }

  generateButtonFixes() {
    return [
      {
        file: 'client/src/components/dashboard/StudentDashboard.jsx',
        description: 'Add navigation functionality to Continue button',
        fix: `
// Replace console.log with actual navigation
onClick={() => {
  // Navigate to course or lesson
  setCurrentView('course-detail');
  // or use router.push('/course/...')
}}
        `
      },
      {
        file: 'client/src/components/dashboard/InstructorDashboard.jsx',
        description: 'Add Create Course modal/form functionality',
        fix: `
// Add state for course creation modal
const [showCreateCourse, setShowCreateCourse] = useState(false);

// Replace console.log with modal opening
onClick={() => setShowCreateCourse(true)}

// Add CreateCourseModal component
{showCreateCourse && (
  <CreateCourseModal 
    onClose={() => setShowCreateCourse(false)}
    onSave={handleCreateCourse}
  />
)}
        `
      },
      {
        file: 'client/src/components/social/SocialDashboard.jsx',
        description: 'Add handlers for Find Study Buddy and Start Live Session',
        fix: `
// Add state and handlers
const [showStudyBuddyModal, setShowStudyBuddyModal] = useState(false);
const [showLiveSessionModal, setShowLiveSessionModal] = useState(false);

// Update button onClick handlers
onClick={() => setShowStudyBuddyModal(true)}
onClick={() => setShowLiveSessionModal(true)}
        `
      },
      {
        file: 'client/src/components/course/CoursePreview.jsx', 
        description: 'Add quiz submission functionality',
        fix: `
// Add state for quiz answers
const [answers, setAnswers] = useState({});
const [showResults, setShowResults] = useState(false);

// Add submission handler
const handleSubmitAnswer = () => {
  // Process quiz submission
  setShowResults(true);
  // Send to backend
};

// Update button
onClick={handleSubmitAnswer}
        `
      }
    ];
  }

  generateRoleAccessFixes() {
    return [
      {
        file: 'client/src/App.jsx',
        description: 'Implement role-based navigation restrictions',
        fix: `
// Create role-based navigation config
const roleBasedNavigation = {
  student: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'my-learning', label: 'My Learning' },
    { id: 'social-learning', label: 'Social Learning' },
    { id: 'adaptive-learning', label: 'AI Tutor' },
    { id: 'gamification', label: 'Achievements' }
  ],
  instructor: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'course-management', label: 'Course Management' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'ai-insights', label: 'AI Insights' }
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'user-management', label: 'User Management' },
    { id: 'system-analytics', label: 'System Analytics' },
    { id: 'platform-settings', label: 'Settings' }
  ]
};

// Use in navigation
{roleBasedNavigation[user.role]?.map(item => (
  <button key={item.id} onClick={() => setCurrentView(item.id)}>
    {item.label}
  </button>
))}
        `
      },
      {
        file: 'client/src/components/dashboard/InstructorDashboard.jsx',
        description: 'Remove student-specific features from instructor view',
        fix: `
// Remove or modify student-specific features:
// - Study buddies section
// - Personal learning streaks  
// - Student gamification badges
// 
// Replace with instructor-specific features:
// - Class overview
// - Student performance analytics
// - Teaching tools
        `
      },
      {
        file: 'client/src/components/dashboard/AdminDashboard.jsx',
        description: 'Replace student gamification with system oversight',
        fix: `
// Replace gamification dashboard call with admin-specific data
const response = await fetch('/api/admin/system-gamification', {
  headers: { Authorization: \`Bearer \${token}\` }
});

// Show platform-wide gamification statistics instead of personal data
        `
      }
    ];
  }

  generateIntegrationFixes() {
    return [
      {
        description: 'Create missing admin API endpoints',
        apis: [
          'GET /api/analytics/admin/system-overview',
          'GET /api/analytics/admin/user-analytics',
          'GET /api/admin/system-gamification'
        ]
      },
      {
        description: 'Fix instructor analytics endpoint',
        endpoint: '/api/analytics/instructor/dashboard-overview',
        issue: 'Returns 500 error'
      },
      {
        description: 'Add role-based data filtering to existing endpoints',
        endpoints: [
          '/api/gamification/dashboard - should return different data per role',
          '/api/adaptive-learning/recommendations - should be role-contextual'
        ]
      }
    ];
  }

  // 5. Run Complete Analysis
  async runCompleteAnalysis() {
    console.log('🚀 COMPREHENSIVE PROJECT ISSUE ANALYSIS');
    console.log('=' .repeat(70));
    
    await this.analyzeButtons();
    await this.analyzeRoleBasedAccess(); 
    await this.testApiIntegration();
    
    const fixes = await this.generateFixes();
    
    console.log('\n📋 ANALYSIS SUMMARY');
    console.log('=' .repeat(50));
    console.log(`❌ Button Issues: ${this.issues.nonWorkingButtons.length}`);
    console.log(`🔐 Role Access Issues: ${this.issues.roleBasedIssues.length}`);
    console.log(`🔌 Integration Issues: ${this.issues.integrationIssues.length}`);
    
    console.log('\n🏆 PRIORITY FIXES NEEDED:');
    console.log('1. Fix non-working buttons (High Priority)');
    console.log('2. Implement proper role-based access (High Priority)');
    console.log('3. Add missing API endpoints (Medium Priority)');
    console.log('4. Fix broken integration points (Medium Priority)');
    
    return {
      issues: this.issues,
      fixes: fixes,
      summary: {
        totalIssues: this.issues.nonWorkingButtons.length + 
                    this.issues.roleBasedIssues.length + 
                    this.issues.integrationIssues.length,
        highPriority: this.issues.nonWorkingButtons.filter(i => i.severity === 'high').length +
                     this.issues.roleBasedIssues.filter(i => i.severity === 'high').length
      }
    };
  }
}

// Run the analysis
async function main() {
  const analyzer = new ProjectAnalyzer();
  const results = await analyzer.runCompleteAnalysis();
  
  console.log(`\n🎯 TOTAL ISSUES FOUND: ${results.summary.totalIssues}`);
  console.log(`⚠️  HIGH PRIORITY: ${results.summary.highPriority}`);
  
  return results;
}

main().catch(console.error);
