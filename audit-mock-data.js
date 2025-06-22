/**
 * Mock Data Audit and Cleanup Script
 * Identifies and reports all components using mock/hardcoded data
 */

const fs = require('fs');
const path = require('path');

class MockDataAuditor {
  constructor() {
    this.issues = [];
    this.clientDir = path.join(__dirname, 'client', 'src');
    this.patterns = [
      // Mock data patterns
      /Math\.random\(\)/gi,
      /mock|Mock/g,
      /hardcoded|hardcod/gi,
      /sample|Sample/g,
      /placeholder|Placeholder/gi,
      /fallback|Fallback/gi,
      /fake|Fake/g,
      /demo|Demo/g,
      /test.*data/gi,
      // Specific mock data patterns
      /'Alice Johnson'|"Alice Johnson"/g,
      /'Bob Smith'|"Bob Smith"/g,
      /'alice@example\.com'|"alice@example\.com"/g,
      /'bob@example\.com'|"bob@example\.com"/g,
      // Array/object literals that look like mock data
      /\[\s*{\s*id:\s*\d+,\s*name:/g,
      /\[\s*{\s*id:\s*['"\d]/g,
      // Static data assignments
      /setStudentAnalytics\(\[/g,
      /setContentAnalytics\(\{/g,
      /setLearningStats\(\{/g,
      // Common mock values
      /progress:\s*\d+,/g,
      /grade:\s*\d+,/g,
      /engagement:\s*\d+,/g,
    ];
  }

  async audit() {
    console.log('🔍 Starting Mock Data Audit...\n');
    
    await this.scanDirectory(this.clientDir);
    
    this.generateReport();
    
    return this.issues;
  }

  async scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'build', 'dist', '.git'].includes(item)) {
          await this.scanDirectory(fullPath);
        }
      } else if (this.isSourceFile(item)) {
        await this.analyzeFile(fullPath);
      }
    }
  }

  isSourceFile(filename) {
    return /\.(jsx?|tsx?)$/.test(filename);
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.clientDir, filePath);
      
      // Check for mock data patterns
      const mockIssues = this.findMockDataPatterns(content, relativePath);
      
      // Check for hardcoded API responses
      const apiIssues = this.findHardcodedApiResponses(content, relativePath);
      
      // Check for static data arrays/objects
      const staticIssues = this.findStaticDataStructures(content, relativePath);
      
      this.issues.push(...mockIssues, ...apiIssues, ...staticIssues);
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  findMockDataPatterns(content, filePath) {
    const issues = [];
    const lines = content.split('\n');
    
    this.patterns.forEach(pattern => {
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          issues.push({
            type: 'mock_pattern',
            file: filePath,
            line: index + 1,
            content: line.trim(),
            pattern: pattern.source,
            severity: this.getSeverity(pattern.source)
          });
        }
      });
    });
    
    return issues;
  }

  findHardcodedApiResponses(content, filePath) {
    const issues = [];
    const lines = content.split('\n');
    
    // Look for setState calls with hardcoded data
    const setStatePatterns = [
      /set\w+\(\s*\[/g,  // setState([...])
      /set\w+\(\s*\{/g,  // setState({...})
    ];
    
    setStatePatterns.forEach(pattern => {
      lines.forEach((line, index) => {
        if (pattern.test(line) && this.looksLikeMockData(line)) {
          issues.push({
            type: 'hardcoded_state',
            file: filePath,
            line: index + 1,
            content: line.trim(),
            severity: 'high'
          });
        }
      });
    });
    
    return issues;
  }

  findStaticDataStructures(content, filePath) {
    const issues = [];
    
    // Look for large static data structures
    const staticDataRegex = /const\s+\w+\s*=\s*\[[\s\S]*?\];/g;
    let match;
    
    while ((match = staticDataRegex.exec(content)) !== null) {
      const dataBlock = match[0];
      if (dataBlock.length > 200 && this.looksLikeMockData(dataBlock)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        issues.push({
          type: 'static_data_structure',
          file: filePath,
          line: lineNumber,
          content: dataBlock.substring(0, 100) + '...',
          severity: 'medium'
        });
      }
    }
    
    return issues;
  }

  looksLikeMockData(content) {
    const mockIndicators = [
      'alice', 'bob', 'charlie', 'dave', 'emma',
      'johnson', 'smith', 'brown', 'wilson',
      'example.com', 'test.com',
      'lorem ipsum', 'placeholder',
      'Math.random()', 'mock', 'sample', 'fake'
    ];
    
    return mockIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  getSeverity(patternSource) {
    if (patternSource.includes('Math.random') || patternSource.includes('mock')) {
      return 'high';
    }
    if (patternSource.includes('sample') || patternSource.includes('placeholder')) {
      return 'medium';
    }
    return 'low';
  }

  generateReport() {
    console.log('📊 Mock Data Audit Report');
    console.log('=' .repeat(50));
    
    // Group issues by file
    const issuesByFile = this.issues.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    }, {});
    
    // Count by severity
    const severityCounts = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n🚨 Summary:');
    console.log(`Total Issues: ${this.issues.length}`);
    console.log(`High Severity: ${severityCounts.high || 0}`);
    console.log(`Medium Severity: ${severityCounts.medium || 0}`);
    console.log(`Low Severity: ${severityCounts.low || 0}`);
    
    console.log('\n📁 Issues by File:');
    Object.entries(issuesByFile).forEach(([file, issues]) => {
      console.log(`\n${file}:`);
      issues.forEach(issue => {
        const severity = issue.severity === 'high' ? '🔴' : 
                        issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${severity} Line ${issue.line}: ${issue.content}`);
      });
    });
    
    console.log('\n🔧 Recommended Actions:');
    this.generateRecommendations(issuesByFile);
  }

  generateRecommendations(issuesByFile) {
    const recommendations = new Map();
    
    Object.entries(issuesByFile).forEach(([file, issues]) => {
      const fileRecommendations = [];
      
      if (file.includes('Analytics')) {
        fileRecommendations.push('Replace hardcoded analytics data with real API calls');
        fileRecommendations.push('Add loading states and error handling');
      }
      
      if (file.includes('Dashboard')) {
        fileRecommendations.push('Connect to real user progress and course data');
        fileRecommendations.push('Implement proper data fetching with useEffect');
      }
      
      if (file.includes('Course')) {
        fileRecommendations.push('Use actual course data from backend');
        fileRecommendations.push('Remove mock progress calculations');
      }
      
      if (issues.some(i => i.content.includes('Math.random'))) {
        fileRecommendations.push('Remove Math.random() calls and use real data');
      }
      
      if (issues.some(i => i.content.includes('sample') || i.content.includes('mock'))) {
        fileRecommendations.push('Replace sample/mock data with API integration');
      }
      
      if (fileRecommendations.length > 0) {
        recommendations.set(file, fileRecommendations);
      }
    });
    
    recommendations.forEach((recs, file) => {
      console.log(`\n${file}:`);
      recs.forEach(rec => console.log(`  • ${rec}`));
    });
  }
}

// Run the audit
const auditor = new MockDataAuditor();
auditor.audit().then(issues => {
  console.log(`\n✅ Audit completed. Found ${issues.length} potential issues.`);
  
  if (issues.length > 0) {
    console.log('\n🔗 Next Steps:');
    console.log('1. Review each file and replace mock data with real API calls');
    console.log('2. Add proper error handling and loading states');
    console.log('3. Ensure all components are connected to backend services');
    console.log('4. Test data flow from backend to frontend');
    console.log('5. Remove any remaining fallback/placeholder data');
  }
}).catch(console.error);
