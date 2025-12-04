#!/usr/bin/env node

/**
 * AstraLearn - Comprehensive Test Runner
 * Runs all backend and frontend tests with organized reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  section: (title) => console.log(`\n${COLORS.bright}${COLORS.blue}═══════════════════════════════════${COLORS.reset}\n${COLORS.bright}${COLORS.cyan}${title}${COLORS.reset}\n${COLORS.bright}${COLORS.blue}═══════════════════════════════════${COLORS.reset}\n`),
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`)
};

class TestRunner {
  constructor() {
    this.results = {
      backend: [],
      frontend: []
    };
    this.totalTime = 0;
  }

  runCommand(cmd, args, cwd, label) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const process = spawn(cmd, args, { cwd, stdio: 'inherit' });

      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        resolve({
          label,
          code,
          duration,
          success: code === 0
        });
      });

      process.on('error', () => {
        resolve({
          label,
          code: 1,
          duration: Date.now() - startTime,
          success: false
        });
      });
    });
  }

  async runBackendTests() {
    log.section('BACKEND TEST SUITE');

    const rootDir = path.join(__dirname);
    const serverDir = path.join(rootDir, 'server');
    const tests = [
      { name: 'Auth & Security Tests', file: 'auth-security.test.js' },
      { name: 'Course Management Tests', file: 'courses.test.js' },
      { name: 'Video Upload Tests', file: 'video-upload.test.js' },
      { name: 'AI Ingestion Tests', file: 'ai-ingestion.test.js' },
      { name: 'Teacher Workflow Integration', file: 'integration/teacher-workflow.integration.test.js' }
    ];

    for (const test of tests) {
      log.info(`Running: ${test.name}...`);
      const result = await this.runCommand(
        'npm',
        ['test', '--', test.file],
        serverDir,
        test.name
      );
      this.results.backend.push(result);
      
      if (result.success) {
        log.success(`${test.name} passed (${result.duration}ms)`);
      } else {
        log.error(`${test.name} failed`);
      }
    }
  }

  async runFrontendTests() {
    log.section('FRONTEND TEST SUITE');

    const rootDir = path.join(__dirname);
    const clientDir = path.join(rootDir, 'client');

    // Check if testing setup exists
    const packageJsonPath = path.join(clientDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.devDependencies || (!packageJson.devDependencies.jest && !packageJson.devDependencies.vitest)) {
      log.warn('Frontend testing framework not configured');
      log.info('To set up frontend tests, install Jest:');
      log.info('  cd client && npm install --save-dev jest @testing-library/react @testing-library/jest-dom @babel/preset-react');
      return;
    }

    const tests = [
      { name: 'RoleBasedRedirect Tests', file: 'RoleBasedRedirect.test.jsx' },
      { name: 'VideoUpload Tests', file: 'VideoUpload.test.jsx' },
      { name: 'ContentIngestion Tests', file: 'ContentIngestion.test.jsx' },
      { name: 'TeacherDashboard Tests', file: 'TeacherDashboard.test.jsx' }
    ];

    for (const test of tests) {
      log.info(`Running: ${test.name}...`);
      const result = await this.runCommand(
        'npm',
        ['test', '--', test.file],
        clientDir,
        test.name
      );
      this.results.frontend.push(result);

      if (result.success) {
        log.success(`${test.name} passed (${result.duration}ms)`);
      } else {
        log.warn(`${test.name} setup required or skipped`);
      }
    }
  }

  printSummary() {
    log.section('TEST SUMMARY');

    const backendPassed = this.results.backend.filter(r => r.success).length;
    const backendTotal = this.results.backend.length;
    const frontendPassed = this.results.frontend.filter(r => r.success).length;
    const frontendTotal = this.results.frontend.length;

    console.log(`${COLORS.bright}Backend Tests:${COLORS.reset}`);
    console.log(`  ${backendPassed}/${backendTotal} passed`);
    this.results.backend.forEach(result => {
      const status = result.success ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`;
      console.log(`  ${status} ${result.label} (${result.duration}ms)`);
    });

    console.log(`\n${COLORS.bright}Frontend Tests:${COLORS.reset}`);
    console.log(`  ${frontendPassed}/${frontendTotal} passed`);
    this.results.frontend.forEach(result => {
      const status = result.success ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`;
      console.log(`  ${status} ${result.label} (${result.duration}ms)`);
    });

    const totalTests = backendTotal + frontendTotal;
    const totalPassed = backendPassed + frontendPassed;
    const coverage = Math.round((totalPassed / totalTests) * 100);

    console.log(`\n${COLORS.bright}Overall Results:${COLORS.reset}`);
    if (totalPassed === totalTests) {
      log.success(`All tests passed! (${coverage}%)`);
    } else {
      log.error(`${totalTests - totalPassed} test(s) failed (${coverage}% pass rate)`);
    }
  }

  async run() {
    console.log(`${COLORS.bright}${COLORS.cyan}🧪 AstraLearn Comprehensive Test Suite${COLORS.reset}\n`);

    try {
      await this.runBackendTests();
      await this.runFrontendTests();
      this.printSummary();

      process.exit(this.results.backend.concat(this.results.frontend).every(r => r.success) ? 0 : 1);
    } catch (error) {
      log.error(`Test runner error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run tests
const runner = new TestRunner();
runner.run();
