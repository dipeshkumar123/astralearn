#!/usr/bin/env node

/**
 * AstraLearn Project Structure Analysis & Cleanup
 * Comprehensive evaluation of all project files and directories
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ASTRALEARN PROJECT STRUCTURE ANALYSIS');
console.log('========================================================');

const projectRoot = process.cwd();

// Analysis categories
const analysis = {
  redundantFiles: [],
  testFiles: [],
  documentationFiles: [],
  coreFiles: {
    frontend: [],
    backend: [],
    shared: []
  },
  duplicateFiles: [],
  unusedDirectories: [],
  recommendations: []
};

// Function to check if file exists and get stats
const analyzeFile = (filePath) => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  }
  return { exists: false };
};

console.log('\n📋 ANALYZING PROJECT STRUCTURE...\n');

// 1. Identify redundant test files
console.log('1️⃣ Test Files Analysis:');
const testFiles = [
  'test-achievement-system.js',
  'test-adaptive-learning.js', 
  'test-ai-chat-fix.js',
  'test-ai-response-content.js',
  'test-api-simple.js',
  'test-auth-complete.js',
  'test-auth-detailed.js',
  'test-auth-integration.js',
  'test-complete-auth-flow.js',
  'test-course-api.js',
  'test-dashboard-comprehensive.js',
  'test-database-context.js',
  'test-endpoints-detailed.js',
  'test-endpoints-fix.js',
  'test-fixed-endpoints.js',
  'test-frontend-api-comprehensive.js',
  'test-frontend-api-comprehensive-fixed.js',
  'test-frontend-integration.js',
  'test-gamification-integration.js',
  'test-login-only.js',
  'test-orchestrated-chat.js',
  'test-production-suite.js',
  'test-template-fix.js',
  'test-websocket-auth.js',
  'test-websocket-auth-fix.js',
  'test-websocket-simple.js',
  'test-websocket-simple-auth.js',
  'simple-frontend-test.js',
  'quick-auth-test.js',
  'quick-debug.js',
  'quick-status-check.js',
  'final-fix-verification.js',
  'final-integration-validation.js',
  'final-validation-test.js',
  'project-issue-analyzer.js'
];

testFiles.forEach(file => {
  const info = analyzeFile(file);
  if (info.exists) {
    analysis.testFiles.push({
      path: file,
      size: info.size,
      recommendation: info.size > 10000 ? 'Move to testSuite/' : 'Consider removing'
    });
    console.log(`   📄 ${file} (${Math.round(info.size/1024)}KB) - ${info.size > 10000 ? 'Keep in testSuite' : 'Remove'}`);
  }
});

// 2. Identify documentation files
console.log('\n2️⃣ Documentation Files Analysis:');
const docFiles = [
  'AI_CHAT_FIX_COMPLETION_REPORT.md',
  'AI_Infrastructure_Summary.md',
  'AI_Orchestration_Summary.md',
  'AI_TEMPLATE_PLACEHOLDER_FIX_REPORT.md',
  'AUTHENTICATION_FLOW_COMPLETION_REPORT.md',
  'AUTHENTICATION_IMPLEMENTATION_COMPLETE.md',
  'COMPREHENSIVE_FIX_COMPLETION_REPORT.md',
  'DASHBOARD_ERROR_HANDLING_COMPLETION_REPORT.md',
  'DEVELOPMENT_CONFIGURATION_GUIDE.md',
  'DEVELOPMENT_ISSUES_FIXED.md',
  'FINAL_COMPREHENSIVE_FIXES_REPORT.md',
  'FINAL_DASHBOARD_AI_FIXES_COMPLETION_REPORT.md',
  'FINAL_VALIDATION_REPORT.md',
  'Frontend_AI_Interface_Summary.md',
  'FRONTEND_BACKEND_INTEGRATION_COMPLETION_REPORT.md',
  'PHASE_2_COMPLETION_SUMMARY.md',
  'PHASE3_STEP1_COMPLETION_SUMMARY.md',
  'PHASE3_STEP1_TESTING_REPORT.md',
  'PHASE3_STEP2_COMPLETION_SUMMARY.md',
  'PHASE3_STEP2_FINAL_COMPLETION_REPORT.md',
  'PHASE3_STEP2_IMPLEMENTATION_PLAN.md',
  'PHASE3_STEP3_COMPLETION_SUMMARY.md',
  'PHASE3_STEP3_IMPLEMENTATION_PLAN.md',
  'PHASE4_IMPLEMENTATION_PLAN.md',
  'PHASE4_STEP2_COMPLETION_SUMMARY.md',
  'PHASE4_STEP2_FINAL_COMPLETION_REPORT.md',
  'PHASE4_STEP3_COMPLETION_SUMMARY.md',
  'PHASE4_STEP3_FINAL_COMPLETION_REPORT.md',
  'PHASE4_STEP3_IMPLEMENTATION_PLAN.md',
  'PHASE5_ANALYTICS_PREPARATION.md',
  'PHASE5_STEP1_IMPLEMENTATION_PLAN.md',
  'PHASE5_STEP2_COMPLETION_SUMMARY.md',
  'PHASE5_STEP2_IMPLEMENTATION_PLAN.md',
  'PHASE6_FINAL_COMPLETION_SUMMARY.md',
  'PHASE6_TESTING_DEPLOYMENT_PLAN.md',
  'PRODUCTION_DEPLOYMENT_GUIDE.md',
  'PROJECT_RESTRUCTURING_COMPLETION_REPORT.md',
  'PROJECT_RESTRUCTURING_PLAN.md',
  'PROJECT_STATUS_COMPREHENSIVE_REPORT.md',
  'SESSION_COMPLETION_SUMMARY.md'
];

let totalDocSize = 0;
docFiles.forEach(file => {
  const info = analyzeFile(file);
  if (info.exists) {
    totalDocSize += info.size;
    analysis.documentationFiles.push({
      path: file,
      size: info.size,
      recommendation: 'Move to docs/ directory'
    });
  }
});
console.log(`   📚 Found ${analysis.documentationFiles.length} documentation files (${Math.round(totalDocSize/1024)}KB total)`);
console.log(`   💡 Recommendation: Consolidate into docs/ directory`);

// 3. Check for duplicate/redundant files
console.log('\n3️⃣ Duplicate Files Analysis:');
const potentialDuplicates = [
  ['client/src/App.jsx', 'client/src/App-optimized.jsx', 'client/src/App.tsx'],
  ['client/src/main.jsx', 'client/src/main.tsx'],
  ['server/src/index.js', 'server/src/index.ts'],
  ['server/src/services/gamificationService.js', 'server/src/services/gamificationService.js.backup'],
  ['server/src/services/performanceMonitorService.js', 'server/src/services/performanceMonitoringService.js']
];

potentialDuplicates.forEach(group => {
  const existing = group.filter(file => analyzeFile(file).exists);
  if (existing.length > 1) {
    console.log(`   🔄 Potential duplicates: ${existing.join(', ')}`);
    analysis.duplicateFiles.push({
      files: existing,
      recommendation: `Keep most recent/complete version, remove others`
    });
  }
});

// 4. Analyze core directories
console.log('\n4️⃣ Core Directory Structure Analysis:');

// Frontend structure
const frontendDirs = [
  'client/src/components/adaptive',
  'client/src/components/ai', 
  'client/src/components/analytics',
  'client/src/components/auth',
  'client/src/components/course',
  'client/src/components/dashboard',
  'client/src/components/gamification',
  'client/src/components/social',
  'client/src/services',
  'client/src/contexts',
  'client/src/hooks',
  'client/src/utils'
];

console.log('   🖥️  Frontend Structure:');
frontendDirs.forEach(dir => {
  const info = analyzeFile(dir);
  if (info.exists && info.isDirectory) {
    const files = fs.readdirSync(path.join(projectRoot, dir));
    console.log(`      ✅ ${dir} (${files.length} files)`);
    analysis.coreFiles.frontend.push({ path: dir, fileCount: files.length });
  } else {
    console.log(`      ❌ Missing: ${dir}`);
  }
});

// Backend structure  
const backendDirs = [
  'server/src/routes',
  'server/src/services',
  'server/src/models',
  'server/src/middleware',
  'server/src/config',
  'server/src/utils'
];

console.log('   🖧  Backend Structure:');
backendDirs.forEach(dir => {
  const info = analyzeFile(dir);
  if (info.exists && info.isDirectory) {
    const files = fs.readdirSync(path.join(projectRoot, dir));
    console.log(`      ✅ ${dir} (${files.length} files)`);
    analysis.coreFiles.backend.push({ path: dir, fileCount: files.length });
  } else {
    console.log(`      ❌ Missing: ${dir}`);
  }
});

// 5. Generate recommendations
console.log('\n🎯 RESTRUCTURING RECOMMENDATIONS:');
console.log('========================================================');

const recommendations = [
  {
    category: 'Test Organization',
    action: 'Consolidate all test files into testSuite/ directory',
    impact: 'High - Cleaner root directory',
    files: analysis.testFiles.length
  },
  {
    category: 'Documentation',
    action: 'Create docs/ directory and move all .md files',
    impact: 'High - Better organization',
    files: analysis.documentationFiles.length
  },
  {
    category: 'Duplicate Removal',
    action: 'Remove duplicate and backup files',
    impact: 'Medium - Reduced confusion',
    files: analysis.duplicateFiles.length
  },
  {
    category: 'Shared Code',
    action: 'Move common utilities to shared/ directory',
    impact: 'Medium - Better code reuse',
    files: 'TBD'
  },
  {
    category: 'Environment Setup',
    action: 'Standardize environment configuration',
    impact: 'High - Easier deployment',
    files: 'Multiple .env files'
  }
];

recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.category}`);
  console.log(`   Action: ${rec.action}`);
  console.log(`   Impact: ${rec.impact}`);
  console.log(`   Affects: ${rec.files} files\n`);
});

// Summary
console.log('📊 ANALYSIS SUMMARY:');
console.log('========================================================');
console.log(`📄 Test Files: ${analysis.testFiles.length}`);
console.log(`📚 Documentation Files: ${analysis.documentationFiles.length}`);
console.log(`🔄 Duplicate Files: ${analysis.duplicateFiles.length}`);
console.log(`🖥️  Frontend Components: ${analysis.coreFiles.frontend.length} directories`);
console.log(`🖧  Backend Services: ${analysis.coreFiles.backend.length} directories`);

console.log('\n✅ Analysis Complete! Ready for restructuring phase...');
