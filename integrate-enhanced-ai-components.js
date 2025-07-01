// Enhanced AI Component Integration Script
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Enhanced AI component integration...\n');

const clientPath = path.join(__dirname, 'client', 'src');

// Define dashboard and course pages that should have AI Assistant integration
const targetFiles = [
  'components/dashboard/StudentDashboard.jsx',
  'components/dashboard/InstructorDashboard.jsx', 
  'components/dashboard/AdminDashboard.jsx',
  'components/course/CoursePreview.jsx',
  'components/course/CourseManagementDashboard.jsx',
  'components/analytics/AnalyticsDashboard.jsx',
  'components/adaptive/AdaptiveLearningDashboard.jsx'
];

// Enhanced AI Assistant import statement
const enhancedAIImport = `import EnhancedAIAssistant from '../ai/EnhancedAIAssistant';`;

// AI Assistant component JSX with floating toggle
const aiAssistantJSX = `
      {/* Enhanced AI Assistant - Floating Toggle */}
      <EnhancedAIAssistant />`;

let integrationResults = [];

// Function to integrate AI Assistant into a page
function integrateAIAssistant(filePath) {
  const fullPath = path.join(clientPath, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    integrationResults.push({ file: filePath, status: 'not_found' });
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already integrated
    if (content.includes('EnhancedAIAssistant')) {
      console.log(`✅ ${filePath} - AI Assistant already integrated`);
      integrationResults.push({ file: filePath, status: 'already_integrated' });
      return;
    }
    
    let modified = false;
    
    // Add import if not present
    if (!content.includes("import EnhancedAIAssistant")) {
      // Find the import section and add our import
      const importRegex = /import\s+.*?from\s+['"].*?['"];?\s*\n/g;
      const imports = content.match(importRegex) || [];
      
      if (imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        
        content = content.slice(0, insertIndex) + enhancedAIImport + '\n' + content.slice(insertIndex);
        modified = true;
      }
    }
    
    // Add AI Assistant component before the closing div of the main container
    if (!content.includes('EnhancedAIAssistant')) {
      // Look for the main return JSX and add AI Assistant
      const returnMatch = content.match(/return\s*\(\s*<[^>]+>/);
      if (returnMatch) {
        // Find the closing tag of the main container
        const closingDivRegex = /<\/div>\s*<\/[^>]+>\s*\);?\s*$/;
        const match = content.match(closingDivRegex);
        
        if (match) {
          const insertIndex = content.lastIndexOf(match[0]);
          content = content.slice(0, insertIndex) + aiAssistantJSX + '\n' + content.slice(insertIndex);
          modified = true;
        } else {
          // Try to find the last closing div before the component ends
          const lastClosingDiv = content.lastIndexOf('</div>');
          if (lastClosingDiv !== -1) {
            content = content.slice(0, lastClosingDiv) + aiAssistantJSX + '\n    ' + content.slice(lastClosingDiv);
            modified = true;
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath} - AI Assistant integrated successfully`);
      integrationResults.push({ file: filePath, status: 'integrated' });
    } else {
      console.log(`⚠️ ${filePath} - Could not integrate AI Assistant`);
      integrationResults.push({ file: filePath, status: 'failed' });
    }
    
  } catch (error) {
    console.log(`❌ ${filePath} - Error: ${error.message}`);
    integrationResults.push({ file: filePath, status: 'error', error: error.message });
  }
}

// Function to remove legacy AI components
function removeLegacyComponents() {
  console.log('\n🗑️ Removing legacy AI components...');
  
  const legacyComponents = [
    'components/ai/AIAssistant.jsx',
    'components/ai/MessageBubble.jsx',
    'components/ai/QuickActions.jsx',
    'components/ai/SuggestedActions.jsx',
    'components/ai/ModernAIAssistant.jsx'
  ];
  
  legacyComponents.forEach(component => {
    const fullPath = path.join(clientPath, component);
    if (fs.existsSync(fullPath)) {
      // Move to backup instead of deleting
      const backupPath = fullPath + '.backup';
      fs.renameSync(fullPath, backupPath);
      console.log(`🗑️ Moved ${component} to backup`);
    }
  });
}

// Function to update navigation with AI toggle
function updateNavigation() {
  console.log('\n🎯 Updating navigation with AI toggle...');
  
  const navFiles = [
    'components/navigation/Navigation.jsx',
    'components/layout/Navbar.jsx',
    'components/layout/Header.jsx'
  ];
  
  navFiles.forEach(navFile => {
    const fullPath = path.join(clientPath, navFile);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Add AI toggle button if not present
      if (!content.includes('AI Assistant') && !content.includes('ai-toggle')) {
        // Add AI toggle button to navigation
        const aiToggleButton = `
          <button 
            className="ai-toggle-btn btn btn-sm btn-outline-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('toggleAI'))}
            title="Toggle AI Assistant"
          >
            <i className="fas fa-robot"></i>
            <span className="d-none d-md-inline ms-1">AI Assistant</span>
          </button>`;
        
        // Try to find a good place to insert the button
        const buttonContainerRegex = /<div[^>]*nav|<nav[^>]*>|<ul[^>]*nav/i;
        const match = content.match(buttonContainerRegex);
        
        if (match) {
          const insertIndex = content.indexOf(match[0]) + match[0].length;
          content = content.slice(0, insertIndex) + aiToggleButton + content.slice(insertIndex);
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`✅ Updated ${navFile} with AI toggle`);
        }
      }
    }
  });
}

// Main integration process
console.log('📝 Integrating Enhanced AI Assistant into dashboard pages...');
targetFiles.forEach(integrateAIAssistant);

// Remove legacy components
removeLegacyComponents();

// Update navigation
updateNavigation();

// Generate summary report
console.log('\n📊 INTEGRATION SUMMARY');
console.log('======================');

const successful = integrationResults.filter(r => r.status === 'integrated').length;
const alreadyIntegrated = integrationResults.filter(r => r.status === 'already_integrated').length;
const failed = integrationResults.filter(r => r.status === 'failed' || r.status === 'error').length;

console.log(`Successfully Integrated: ${successful}/${targetFiles.length}`);
console.log(`Already Integrated: ${alreadyIntegrated}/${targetFiles.length}`);
console.log(`Failed: ${failed}/${targetFiles.length}`);

if (failed > 0) {
  console.log('\n⚠️ Integration issues:');
  integrationResults
    .filter(r => r.status === 'failed' || r.status === 'error')
    .forEach(r => console.log(`   - ${r.file}: ${r.status}${r.error ? ` (${r.error})` : ''}`));
}

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  results: integrationResults,
  summary: {
    total: targetFiles.length,
    successful,
    alreadyIntegrated,
    failed
  }
};

fs.writeFileSync('enhanced-ai-integration-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed integration report saved to enhanced-ai-integration-report.json');

console.log('\n🏁 Enhanced AI Integration completed!');
console.log('\n🎯 Next Steps:');
console.log('   1. Test AI Assistant in each dashboard page');
console.log('   2. Verify real-time context updates');
console.log('   3. Check responsive design on different screen sizes');
console.log('   4. Validate accessibility features');
console.log('   5. Conduct user acceptance testing');
console.log('   6. Monitor performance and optimize if needed');
console.log('   7. Deploy to production environment');
