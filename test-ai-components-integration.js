// Comprehensive AI Components Integration Test
const path = require('path');
const fs = require('fs');

console.log('🧪 Starting comprehensive AI components integration test...\n');

const clientPath = path.join(__dirname, 'client', 'src', 'components', 'ai');

// Define all expected AI components
const expectedComponents = [
  // Main AI Assistant
  'EnhancedAIAssistant.jsx',
  
  // Core supporting components
  'SmartSuggestions.jsx',
  'ContextualHelp.jsx', 
  'AIInsightsPanels.jsx',
  'ConversationHistory.jsx',
  
  // Subcomponents
  'components/ModernMessageBubble.jsx',
  'components/ChatInterface.jsx',
  'components/VoiceHandler.jsx',
  'components/QuickActionsGrid.jsx',
  'components/SettingsPanel.jsx',
  'components/SuggestedActionsPanel.jsx'
];

// Legacy components that should be replaced/updated
const legacyComponents = [
  'AIAssistant.jsx',
  'MessageBubble.jsx',
  'QuickActions.jsx',
  'SuggestedActions.jsx',
  'ModernAIAssistant.jsx'
];

let allTestsPassed = true;
const testResults = [];

// Test 1: Check if all new components exist
console.log('📁 Test 1: Checking component files existence...');
expectedComponents.forEach(component => {
  const componentPath = path.join(clientPath, component);
  const exists = fs.existsSync(componentPath);
  
  if (exists) {
    const stats = fs.statSync(componentPath);
    const isEmpty = stats.size === 0;
    
    if (isEmpty) {
      console.log(`❌ ${component} exists but is empty`);
      testResults.push({ component, status: 'empty', critical: true });
      allTestsPassed = false;
    } else {
      console.log(`✅ ${component} exists and has content (${Math.round(stats.size / 1024)}KB)`);
      testResults.push({ component, status: 'success', size: stats.size });
    }
  } else {
    console.log(`❌ ${component} missing`);
    testResults.push({ component, status: 'missing', critical: true });
    allTestsPassed = false;
  }
});

// Test 2: Check component content quality
console.log('\n🔍 Test 2: Analyzing component content quality...');
expectedComponents.forEach(component => {
  const componentPath = path.join(clientPath, component);
  if (fs.existsSync(componentPath)) {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check for React component structure
      const hasReactImport = content.includes('import React');
      const hasExportDefault = content.includes('export default');
      const hasJSXReturn = content.includes('return (') || content.includes('return <');
      
      // Check for modern patterns
      const hasHooks = content.includes('useState') || content.includes('useEffect') || content.includes('useMemo');
      const hasTailwind = content.includes('className=');
      const hasTypeScript = component.endsWith('.tsx') || content.includes('interface') || content.includes('type ');
      
      // Check for accessibility
      const hasAccessibility = content.includes('aria-') || content.includes('role=') || content.includes('title=');
      
      // Check for dark mode support
      const hasDarkMode = content.includes('dark:');
      
      // Check for responsiveness
      const hasResponsive = content.includes('md:') || content.includes('lg:') || content.includes('sm:');
      
      const qualityScore = [
        hasReactImport,
        hasExportDefault, 
        hasJSXReturn,
        hasHooks,
        hasTailwind,
        hasAccessibility,
        hasDarkMode,
        hasResponsive
      ].filter(Boolean).length;
      
      if (qualityScore >= 6) {
        console.log(`✅ ${component} - High quality (${qualityScore}/8)`);
      } else if (qualityScore >= 4) {
        console.log(`⚠️ ${component} - Medium quality (${qualityScore}/8)`);
      } else {
        console.log(`❌ ${component} - Low quality (${qualityScore}/8)`);
        allTestsPassed = false;
      }
      
      testResults.find(r => r.component === component).quality = qualityScore;
      
    } catch (error) {
      console.log(`❌ ${component} - Error reading file: ${error.message}`);
      allTestsPassed = false;
    }
  }
});

// Test 3: Check for proper imports and dependencies
console.log('\n🔗 Test 3: Checking imports and dependencies...');
expectedComponents.forEach(component => {
  const componentPath = path.join(clientPath, component);
  if (fs.existsSync(componentPath)) {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check for required imports
      const requiredImports = [
        'react',
        'lucide-react',
        '../../../stores/aiAssistantStore'
      ];
      
      let importIssues = 0;
      requiredImports.forEach(imp => {
        if (imp === 'react' && !content.includes('import React')) importIssues++;
        else if (imp === 'lucide-react' && !content.includes('lucide-react')) importIssues++;
        else if (imp === '../../../stores/aiAssistantStore' && component.includes('components/') && !content.includes('aiAssistantStore')) importIssues++;
        else if (imp === '../../stores/aiAssistantStore' && !component.includes('components/') && !content.includes('aiAssistantStore')) importIssues++;
      });
      
      if (importIssues === 0) {
        console.log(`✅ ${component} - All required imports present`);
      } else {
        console.log(`⚠️ ${component} - ${importIssues} missing import(s)`);
      }
      
    } catch (error) {
      console.log(`❌ ${component} - Error checking imports: ${error.message}`);
    }
  }
});

// Test 4: Check legacy components status
console.log('\n🗂️ Test 4: Checking legacy components status...');
legacyComponents.forEach(component => {
  const componentPath = path.join(clientPath, component);
  const exists = fs.existsSync(componentPath);
  
  if (exists) {
    console.log(`⚠️ Legacy component ${component} still exists - consider updating or removing`);
  } else {
    console.log(`✅ Legacy component ${component} not found (good)`);
  }
});

// Test 5: Check directory structure
console.log('\n📂 Test 5: Checking directory structure...');
const componentsDir = path.join(clientPath, 'components');
const componentsDirExists = fs.existsSync(componentsDir);

if (componentsDirExists) {
  console.log('✅ AI components subdirectory exists');
  
  // Check subcomponent files
  const subComponents = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'));
  console.log(`📊 Found ${subComponents.length} subcomponents: ${subComponents.join(', ')}`);
} else {
  console.log('❌ AI components subdirectory missing');
  allTestsPassed = false;
}

// Test 6: Check for real-time data integration
console.log('\n📡 Test 6: Checking real-time data integration...');
expectedComponents.forEach(component => {
  const componentPath = path.join(clientPath, component);
  if (fs.existsSync(componentPath)) {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check for store usage
      const usesStore = content.includes('useAIAssistantStore');
      const hasRealTimeUpdates = content.includes('useEffect') && content.includes('setInterval');
      const hasContextIntegration = content.includes('currentContext') || content.includes('context');
      
      if (usesStore && hasContextIntegration) {
        console.log(`✅ ${component} - Good real-time integration`);
      } else if (usesStore || hasContextIntegration) {
        console.log(`⚠️ ${component} - Partial real-time integration`);
      } else {
        console.log(`❌ ${component} - No real-time integration detected`);
      }
      
    } catch (error) {
      console.log(`❌ ${component} - Error checking real-time features: ${error.message}`);
    }
  }
});

// Test 7: Final integration validation
console.log('\n🔧 Test 7: Final integration validation...');
const enhancedAssistantPath = path.join(clientPath, 'EnhancedAIAssistant.jsx');
if (fs.existsSync(enhancedAssistantPath)) {
  try {
    const content = fs.readFileSync(enhancedAssistantPath, 'utf8');
    
    // Check if main component imports all supporting components
    const importedComponents = [
      'ModernMessageBubble',
      'SmartSuggestions', 
      'ContextualHelp',
      'AIInsightsPanels',
      'ConversationHistory'
    ];
    
    let missingImports = 0;
    importedComponents.forEach(comp => {
      if (!content.includes(comp)) {
        console.log(`❌ EnhancedAIAssistant missing import: ${comp}`);
        missingImports++;
      }
    });
    
    if (missingImports === 0) {
      console.log('✅ EnhancedAIAssistant has all required component imports');
    } else {
      console.log(`❌ EnhancedAIAssistant missing ${missingImports} component import(s)`);
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ Error validating EnhancedAIAssistant: ${error.message}`);
    allTestsPassed = false;
  }
} else {
  console.log('❌ EnhancedAIAssistant.jsx not found');
  allTestsPassed = false;
}

// Generate test summary
console.log('\n📊 TEST SUMMARY');
console.log('================');

const successfulComponents = testResults.filter(r => r.status === 'success').length;
const totalComponents = expectedComponents.length;
const completionRate = Math.round((successfulComponents / totalComponents) * 100);

console.log(`Components Created: ${successfulComponents}/${totalComponents} (${completionRate}%)`);
console.log(`Overall Status: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 All AI components have been successfully created and integrated!');
  console.log('📋 Next steps:');
  console.log('   1. ✅ Integrate EnhancedAIAssistant into dashboard pages');
  console.log('   2. ✅ Test real-time data flow and context updates');
  console.log('   3. ✅ Conduct user acceptance testing');
  console.log('   4. ✅ Remove or update legacy components');
  console.log('   5. ✅ Deploy to production');
} else {
  console.log('\n⚠️ Some issues need to be addressed before proceeding.');
  console.log('📋 Issues found:');
  testResults.filter(r => r.critical).forEach(result => {
    console.log(`   - ${result.component}: ${result.status}`);
  });
}

console.log('\n🏁 Test completed!');

// Export test results for further analysis
const reportData = {
  timestamp: new Date().toISOString(),
  allTestsPassed,
  completionRate,
  totalComponents,
  successfulComponents,
  testResults,
  summary: {
    created: successfulComponents,
    missing: testResults.filter(r => r.status === 'missing').length,
    empty: testResults.filter(r => r.status === 'empty').length,
    avgQuality: testResults.filter(r => r.quality).reduce((a, b) => a + b.quality, 0) / testResults.filter(r => r.quality).length || 0
  }
};

fs.writeFileSync('ai-components-test-report.json', JSON.stringify(reportData, null, 2));
console.log('📄 Detailed test report saved to ai-components-test-report.json');
