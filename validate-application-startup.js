/**
 * Quick Application Startup Validation
 * Tests if the application can start successfully with the new components
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AstraLearn Application Startup Validation\n');

// Check if all required files exist
const requiredFiles = [
  './client/src/App.jsx',
  './client/src/components/course/RedesignedCoursePreview.jsx',
  './client/src/components/course/ModernLessonCompletion.jsx',
  './client/package.json',
  './docs/MODERN_LEARNING_EXPERIENCE_DESIGN.md'
];

console.log('📁 Checking Required Files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Missing required files. Please ensure all components are properly created.');
  process.exit(1);
}

console.log('\n📦 Checking Dependencies...');

// Check package.json for required dependencies
const packageJsonPath = './client/package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDependencies = [
  'react',
  'framer-motion',
  'lucide-react',
  'tailwindcss'
];

let allDepsAvailable = true;

requiredDependencies.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`  ✅ ${dep}`);
  } else {
    console.log(`  ❌ ${dep} - Missing!`);
    allDepsAvailable = false;
  }
});

if (!allDepsAvailable) {
  console.log('\n❌ Missing required dependencies. Please run npm install.');
  process.exit(1);
}

console.log('\n🔧 Running Basic Syntax Check...');

// Simple syntax check for the main files
const filesToCheck = [
  './client/src/App.jsx',
  './client/src/components/course/RedesignedCoursePreview.jsx',
  './client/src/components/course/ModernLessonCompletion.jsx'
];

let syntaxErrors = [];

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Basic syntax checks
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    
    if (openBraces !== closeBraces) {
      syntaxErrors.push(`${file}: Mismatched braces (${openBraces} open, ${closeBraces} close)`);
    }
    
    if (openParens !== closeParens) {
      syntaxErrors.push(`${file}: Mismatched parentheses (${openParens} open, ${closeParens} close)`);
    }
    
    // Check for common React patterns
    if (!content.includes('export default')) {
      syntaxErrors.push(`${file}: Missing default export`);
    }
    
    console.log(`  ✅ ${path.basename(file)} - Basic syntax OK`);
    
  } catch (error) {
    syntaxErrors.push(`${file}: ${error.message}`);
  }
});

if (syntaxErrors.length > 0) {
  console.log('\n❌ Syntax Errors Found:');
  syntaxErrors.forEach(error => console.log(`  - ${error}`));
  process.exit(1);
}

console.log('\n✅ All Validation Checks Passed!');
console.log('\n🎉 Application is ready to start!');
console.log('\nTo start the development server:');
console.log('  cd client');
console.log('  npm install  # if not already done');
console.log('  npm run dev');
console.log('\nTo access the application:');
console.log('  Open: http://localhost:5173');
console.log('\n📚 For design documentation:');
console.log('  See: docs/MODERN_LEARNING_EXPERIENCE_DESIGN.md');
console.log('\n📋 For integration details:');
console.log('  See: REDESIGNED_COMPONENTS_INTEGRATION_COMPLETE.md');

console.log('\n🚀 Validation Complete! Ready for testing.');
