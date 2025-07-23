// Frontend Code Scanning for Hardcoded Values and Mock Data
const fs = require('fs');
const path = require('path');

const CLIENT_DIR = './client/src';

function scanFrontendCode() {
  console.log('🔍 FRONTEND CODE SCANNING FOR HARDCODED VALUES AND MOCK DATA');
  console.log('=' .repeat(70));
  console.log('');

  const results = {
    hardcodedValues: [],
    mockData: [],
    apiCalls: [],
    errorHandling: [],
    configurations: []
  };

  // Scan all TypeScript/JavaScript files
  const files = getAllFiles(CLIENT_DIR, ['.tsx', '.ts', '.js', '.jsx']);
  
  console.log(`📁 Scanning ${files.length} files in ${CLIENT_DIR}...`);
  console.log('');

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(CLIENT_DIR, file);
    
    // Scan for hardcoded values
    scanHardcodedValues(content, relativePath, results);
    
    // Scan for mock data
    scanMockData(content, relativePath, results);
    
    // Scan for API calls
    scanAPICalls(content, relativePath, results);
    
    // Scan for error handling
    scanErrorHandling(content, relativePath, results);
    
    // Scan for configurations
    scanConfigurations(content, relativePath, results);
  });

  // Generate report
  generateScanReport(results);
}

function getAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

function scanHardcodedValues(content, file, results) {
  const patterns = [
    { pattern: /localhost:\d+/g, type: 'localhost_url', severity: 'high' },
    { pattern: /http:\/\/[^\/\s'"]+/g, type: 'http_url', severity: 'medium' },
    { pattern: /https:\/\/[^\/\s'"]+/g, type: 'https_url', severity: 'low' },
    { pattern: /"[^"]*@example\.com"/g, type: 'example_email', severity: 'medium' },
    { pattern: /password.*=.*["'][^"']+["']/gi, type: 'hardcoded_password', severity: 'high' },
    { pattern: /api_key.*=.*["'][^"']+["']/gi, type: 'api_key', severity: 'high' },
    { pattern: /secret.*=.*["'][^"']+["']/gi, type: 'secret', severity: 'high' },
    { pattern: /token.*=.*["'][^"']+["']/gi, type: 'token', severity: 'medium' }
  ];

  patterns.forEach(({ pattern, type, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        results.hardcodedValues.push({
          file,
          line: lineNumber,
          type,
          value: match,
          severity
        });
      });
    }
  });
}

function scanMockData(content, file, results) {
  const patterns = [
    { pattern: /mock.*data/gi, type: 'mock_data_reference' },
    { pattern: /fallback.*data/gi, type: 'fallback_data' },
    { pattern: /sample.*data/gi, type: 'sample_data' },
    { pattern: /test.*data/gi, type: 'test_data' },
    { pattern: /dummy.*data/gi, type: 'dummy_data' },
    { pattern: /console\.log.*mock/gi, type: 'mock_console_log' },
    { pattern: /using mock data/gi, type: 'mock_data_comment' },
    { pattern: /endpoint not available/gi, type: 'endpoint_fallback' }
  ];

  patterns.forEach(({ pattern, type }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        results.mockData.push({
          file,
          line: lineNumber,
          type,
          value: match
        });
      });
    }
  });

  // Check for large mock data objects
  const mockDataBlocks = content.match(/data:\s*\{[\s\S]*?\}/g);
  if (mockDataBlocks) {
    mockDataBlocks.forEach(block => {
      if (block.length > 500) { // Large data blocks
        const lineNumber = content.substring(0, content.indexOf(block)).split('\n').length;
        results.mockData.push({
          file,
          line: lineNumber,
          type: 'large_mock_object',
          value: `${block.substring(0, 100)}...`
        });
      }
    });
  }
}

function scanAPICalls(content, file, results) {
  const patterns = [
    { pattern: /apiService\.(get|post|put|delete)/g, type: 'api_service_call' },
    { pattern: /axios\.(get|post|put|delete)/g, type: 'axios_call' },
    { pattern: /fetch\(/g, type: 'fetch_call' },
    { pattern: /useQuery\(/g, type: 'react_query' },
    { pattern: /useMutation\(/g, type: 'react_mutation' }
  ];

  patterns.forEach(({ pattern, type }) => {
    const matches = content.match(pattern);
    if (matches) {
      results.apiCalls.push({
        file,
        type,
        count: matches.length
      });
    }
  });
}

function scanErrorHandling(content, file, results) {
  const hasErrorBoundary = /ErrorBoundary|componentDidCatch|getDerivedStateFromError/g.test(content);
  const hasTryCatch = /try\s*\{[\s\S]*?\}\s*catch/g.test(content);
  const hasErrorHandling = /\.catch\(|onError:|error\s*=>/g.test(content);
  const hasRetryDisabled = /retry:\s*false/g.test(content);

  results.errorHandling.push({
    file,
    hasErrorBoundary,
    hasTryCatch,
    hasErrorHandling,
    hasRetryDisabled,
    score: [hasErrorBoundary, hasTryCatch, hasErrorHandling, hasRetryDisabled].filter(Boolean).length
  });
}

function scanConfigurations(content, file, results) {
  const patterns = [
    { pattern: /process\.env\./g, type: 'environment_variable' },
    { pattern: /BASE_URL|API_URL|BACKEND_URL/g, type: 'api_url_config' },
    { pattern: /config\./g, type: 'config_reference' },
    { pattern: /\.env/g, type: 'env_file_reference' }
  ];

  patterns.forEach(({ pattern, type }) => {
    const matches = content.match(pattern);
    if (matches) {
      results.configurations.push({
        file,
        type,
        count: matches.length
      });
    }
  });
}

function generateScanReport(results) {
  console.log('📊 FRONTEND CODE SCAN RESULTS');
  console.log('-'.repeat(50));
  console.log('');

  // Hardcoded Values Report
  console.log('🔴 HARDCODED VALUES FOUND:');
  if (results.hardcodedValues.length === 0) {
    console.log('   ✅ No hardcoded values found');
  } else {
    const groupedByFile = groupBy(results.hardcodedValues, 'file');
    Object.entries(groupedByFile).forEach(([file, values]) => {
      console.log(`   📄 ${file}:`);
      values.forEach(item => {
        const severity = item.severity === 'high' ? '🔴' : item.severity === 'medium' ? '🟡' : '🟢';
        console.log(`      ${severity} Line ${item.line}: ${item.value} (${item.type})`);
      });
    });
  }
  console.log('');

  // Mock Data Report
  console.log('🎭 MOCK DATA INSTANCES:');
  if (results.mockData.length === 0) {
    console.log('   ✅ No mock data found');
  } else {
    const groupedByFile = groupBy(results.mockData, 'file');
    Object.entries(groupedByFile).forEach(([file, items]) => {
      console.log(`   📄 ${file}:`);
      items.forEach(item => {
        console.log(`      🎭 Line ${item.line}: ${item.type}`);
      });
    });
  }
  console.log('');

  // API Calls Report
  console.log('🔌 API CALLS ANALYSIS:');
  const apiCallsByFile = groupBy(results.apiCalls, 'file');
  Object.entries(apiCallsByFile).forEach(([file, calls]) => {
    const totalCalls = calls.reduce((sum, call) => sum + call.count, 0);
    console.log(`   📄 ${file}: ${totalCalls} API calls`);
    calls.forEach(call => {
      console.log(`      - ${call.type}: ${call.count}`);
    });
  });
  console.log('');

  // Error Handling Report
  console.log('⚠️ ERROR HANDLING ANALYSIS:');
  const errorHandlingStats = {
    withErrorBoundary: 0,
    withTryCatch: 0,
    withErrorHandling: 0,
    withRetryDisabled: 0,
    total: results.errorHandling.length
  };

  results.errorHandling.forEach(item => {
    if (item.hasErrorBoundary) errorHandlingStats.withErrorBoundary++;
    if (item.hasTryCatch) errorHandlingStats.withTryCatch++;
    if (item.hasErrorHandling) errorHandlingStats.withErrorHandling++;
    if (item.hasRetryDisabled) errorHandlingStats.withRetryDisabled++;
  });

  console.log(`   📊 Files with Error Boundaries: ${errorHandlingStats.withErrorBoundary}/${errorHandlingStats.total}`);
  console.log(`   📊 Files with Try-Catch: ${errorHandlingStats.withTryCatch}/${errorHandlingStats.total}`);
  console.log(`   📊 Files with Error Handling: ${errorHandlingStats.withErrorHandling}/${errorHandlingStats.total}`);
  console.log(`   📊 Files with Retry Disabled: ${errorHandlingStats.withRetryDisabled}/${errorHandlingStats.total}`);
  console.log('');

  // Configuration Report
  console.log('⚙️ CONFIGURATION ANALYSIS:');
  const configStats = groupBy(results.configurations, 'type');
  Object.entries(configStats).forEach(([type, items]) => {
    const totalCount = items.reduce((sum, item) => sum + item.count, 0);
    console.log(`   📊 ${type}: ${totalCount} references across ${items.length} files`);
  });
  console.log('');

  // Critical Issues
  console.log('🚨 CRITICAL ISSUES TO ADDRESS:');
  const criticalIssues = [];
  
  // High severity hardcoded values
  const highSeverityValues = results.hardcodedValues.filter(item => item.severity === 'high');
  if (highSeverityValues.length > 0) {
    criticalIssues.push(`${highSeverityValues.length} high-severity hardcoded values found`);
  }
  
  // Large number of mock data instances
  if (results.mockData.length > 10) {
    criticalIssues.push(`${results.mockData.length} mock data instances need replacement`);
  }
  
  // Files without error handling
  const filesWithoutErrorHandling = results.errorHandling.filter(item => item.score === 0);
  if (filesWithoutErrorHandling.length > 0) {
    criticalIssues.push(`${filesWithoutErrorHandling.length} files lack error handling`);
  }

  if (criticalIssues.length === 0) {
    console.log('   ✅ No critical issues found!');
  } else {
    criticalIssues.forEach(issue => {
      console.log(`   ❌ ${issue}`);
    });
  }
  console.log('');

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('   1. Replace all mock data with real API calls');
  console.log('   2. Move hardcoded URLs to environment variables');
  console.log('   3. Implement comprehensive error handling in all components');
  console.log('   4. Add retry logic for failed API calls');
  console.log('   5. Create configuration management system');
  console.log('   6. Add loading states for all async operations');
  console.log('   7. Implement proper error boundaries');
  console.log('');

  // Summary
  console.log('📋 SUMMARY:');
  console.log(`   📄 Files Scanned: ${results.errorHandling.length}`);
  console.log(`   🔴 Hardcoded Values: ${results.hardcodedValues.length}`);
  console.log(`   🎭 Mock Data Instances: ${results.mockData.length}`);
  console.log(`   🔌 API Integration Points: ${Object.keys(groupBy(results.apiCalls, 'file')).length} files`);
  console.log(`   ⚠️ Error Handling Coverage: ${Math.round((errorHandlingStats.withErrorHandling / errorHandlingStats.total) * 100)}%`);
  console.log('');

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      filesScanned: results.errorHandling.length,
      hardcodedValues: results.hardcodedValues.length,
      mockDataInstances: results.mockData.length,
      apiIntegrationPoints: Object.keys(groupBy(results.apiCalls, 'file')).length,
      errorHandlingCoverage: Math.round((errorHandlingStats.withErrorHandling / errorHandlingStats.total) * 100)
    },
    details: results
  };

  try {
    fs.writeFileSync('frontend-code-scan-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to: frontend-code-scan-report.json');
  } catch (error) {
    console.log('⚠️ Could not save detailed report:', error.message);
  }
}

function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
}

// Run the scan
try {
  scanFrontendCode();
} catch (error) {
  console.error('❌ Frontend code scan failed:', error.message);
}
