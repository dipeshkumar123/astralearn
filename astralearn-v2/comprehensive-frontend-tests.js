const puppeteer = require('puppeteer');

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Test utilities
function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name} - ${status} ${details}`);
  
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.tests.push({ name, status, details, timestamp: new Date().toISOString() });
}

// Browser helper
async function createBrowser() {
  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
}

// Page helper with error handling
async function createPage(browser) {
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  // Handle console logs and errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔍 Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`🔍 Page Error: ${error.message}`);
  });
  
  return page;
}

// Wait for element helper
async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

// Test suites
async function testPageLoading(browser) {
  console.log('\n🌐 Testing Page Loading...');
  
  const page = await createPage(browser);
  
  try {
    // Test homepage loading
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const title = await page.title();
    if (title.includes('AstraLearn')) {
      logTest('Homepage Loading', 'PASS', `Title: ${title}`);
    } else {
      logTest('Homepage Loading', 'FAIL', `Unexpected title: ${title}`);
    }
    
    // Test if React app is loaded
    const reactRoot = await page.$('#root');
    if (reactRoot) {
      logTest('React App Initialization', 'PASS', 'React root element found');
    } else {
      logTest('React App Initialization', 'FAIL', 'React root element not found');
    }
    
    // Test navigation elements
    const navExists = await waitForElement(page, 'nav, .navbar, [role="navigation"]');
    if (navExists) {
      logTest('Navigation Component', 'PASS', 'Navigation element found');
    } else {
      logTest('Navigation Component', 'FAIL', 'Navigation element not found');
    }
    
  } catch (error) {
    logTest('Page Loading Tests', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testAuthenticationFlow(browser) {
  console.log('\n🔐 Testing Authentication Flow...');
  
  const page = await createPage(browser);
  
  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Look for login button or form
    const loginButton = await page.$('button:contains("Login"), a:contains("Login"), [data-testid="login"]');
    const loginForm = await page.$('form[data-testid="login"], .login-form, #login-form');
    
    if (loginButton || loginForm) {
      logTest('Login Interface Present', 'PASS', 'Login UI elements found');
      
      // Test login form interaction (if form is visible)
      if (loginForm) {
        const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passwordInput = await page.$('input[type="password"], input[name="password"]');
        
        if (emailInput && passwordInput) {
          logTest('Login Form Fields', 'PASS', 'Email and password fields found');
          
          // Test form validation
          await page.type('input[type="email"], input[name="email"]', 'test@example.com');
          await page.type('input[type="password"], input[name="password"]', 'testpassword');
          
          logTest('Login Form Interaction', 'PASS', 'Form fields can be filled');
        } else {
          logTest('Login Form Fields', 'FAIL', 'Required form fields not found');
        }
      }
    } else {
      logTest('Login Interface Present', 'FAIL', 'Login UI elements not found');
    }
    
    // Test registration interface
    const registerButton = await page.$('button:contains("Register"), a:contains("Sign Up"), [data-testid="register"]');
    if (registerButton) {
      logTest('Registration Interface', 'PASS', 'Registration UI found');
    } else {
      logTest('Registration Interface', 'FAIL', 'Registration UI not found');
    }
    
  } catch (error) {
    logTest('Authentication Flow Tests', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testCourseInterface(browser) {
  console.log('\n📚 Testing Course Interface...');
  
  const page = await createPage(browser);
  
  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Look for courses section
    const coursesSection = await page.$('.courses, [data-testid="courses"], .course-list');
    const courseCards = await page.$$('.course-card, .course-item, [data-testid="course"]');
    
    if (coursesSection || courseCards.length > 0) {
      logTest('Course Display Interface', 'PASS', `Found ${courseCards.length} course elements`);
      
      // Test course card content
      if (courseCards.length > 0) {
        const firstCourse = courseCards[0];
        const courseTitle = await firstCourse.$('.title, .course-title, h1, h2, h3');
        const courseDescription = await firstCourse.$('.description, .course-description, p');
        
        if (courseTitle) {
          logTest('Course Card Content', 'PASS', 'Course titles displayed');
        } else {
          logTest('Course Card Content', 'FAIL', 'Course titles not found');
        }
        
        // Test course interaction
        try {
          await firstCourse.click();
          await page.waitForTimeout(2000); // Wait for navigation or modal
          logTest('Course Card Interaction', 'PASS', 'Course cards are clickable');
        } catch (error) {
          logTest('Course Card Interaction', 'FAIL', 'Course interaction failed');
        }
      }
    } else {
      logTest('Course Display Interface', 'FAIL', 'Course interface not found');
    }
    
    // Test search functionality
    const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], [data-testid="search"]');
    if (searchInput) {
      logTest('Course Search Interface', 'PASS', 'Search input found');
      
      // Test search interaction
      await page.type('input[type="search"], input[placeholder*="search" i]', 'JavaScript');
      await page.waitForTimeout(1000);
      logTest('Search Functionality', 'PASS', 'Search input accepts text');
    } else {
      logTest('Course Search Interface', 'FAIL', 'Search interface not found');
    }
    
  } catch (error) {
    logTest('Course Interface Tests', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testResponsiveDesign(browser) {
  console.log('\n📱 Testing Responsive Design...');
  
  const page = await createPage(browser);
  
  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Test desktop view (1280x720 - already set)
    const desktopNav = await page.$('nav, .navbar');
    if (desktopNav) {
      logTest('Desktop Layout', 'PASS', 'Navigation visible on desktop');
    } else {
      logTest('Desktop Layout', 'FAIL', 'Desktop navigation not found');
    }
    
    // Test tablet view
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const tabletLayout = await page.$('nav, .navbar, .mobile-nav');
    if (tabletLayout) {
      logTest('Tablet Layout', 'PASS', 'Layout adapts to tablet size');
    } else {
      logTest('Tablet Layout', 'FAIL', 'Tablet layout issues');
    }
    
    // Test mobile view
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileLayout = await page.$('nav, .navbar, .mobile-nav, .hamburger');
    if (mobileLayout) {
      logTest('Mobile Layout', 'PASS', 'Layout adapts to mobile size');
    } else {
      logTest('Mobile Layout', 'FAIL', 'Mobile layout issues');
    }
    
    // Test mobile menu functionality
    const hamburgerMenu = await page.$('.hamburger, .mobile-menu-toggle, [data-testid="mobile-menu"]');
    if (hamburgerMenu) {
      logTest('Mobile Menu Toggle', 'PASS', 'Mobile menu toggle found');
      
      try {
        await hamburgerMenu.click();
        await page.waitForTimeout(500);
        logTest('Mobile Menu Interaction', 'PASS', 'Mobile menu is interactive');
      } catch (error) {
        logTest('Mobile Menu Interaction', 'FAIL', 'Mobile menu interaction failed');
      }
    } else {
      logTest('Mobile Menu Toggle', 'FAIL', 'Mobile menu toggle not found');
    }
    
  } catch (error) {
    logTest('Responsive Design Tests', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testAPIIntegration(browser) {
  console.log('\n🔗 Testing API Integration...');
  
  const page = await createPage(browser);
  
  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Monitor network requests
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // Wait for initial API calls
    await page.waitForTimeout(3000);
    
    if (apiRequests.length > 0) {
      logTest('API Requests Made', 'PASS', `${apiRequests.length} API calls detected`);
      
      // Check for common API endpoints
      const hasCoursesAPI = apiRequests.some(req => req.url.includes('/api/courses'));
      const hasAuthAPI = apiRequests.some(req => req.url.includes('/api/auth'));
      const hasHealthAPI = apiRequests.some(req => req.url.includes('/api/health'));
      
      if (hasCoursesAPI) {
        logTest('Courses API Integration', 'PASS', 'Courses API called');
      } else {
        logTest('Courses API Integration', 'FAIL', 'Courses API not called');
      }
      
      if (hasHealthAPI) {
        logTest('Health Check API', 'PASS', 'Health API called');
      } else {
        logTest('Health Check API', 'FAIL', 'Health API not called');
      }
      
    } else {
      logTest('API Requests Made', 'FAIL', 'No API requests detected');
    }
    
    // Test error handling
    await page.evaluate(() => {
      // Simulate network error
      window.fetch = () => Promise.reject(new Error('Network error'));
    });
    
    // Reload page to trigger error handling
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check if error state is handled gracefully
    const errorMessage = await page.$('.error, .error-message, [data-testid="error"]');
    if (errorMessage) {
      logTest('Error State Handling', 'PASS', 'Error states are displayed');
    } else {
      logTest('Error State Handling', 'FAIL', 'Error handling not visible');
    }
    
  } catch (error) {
    logTest('API Integration Tests', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

async function testLoadingStates(browser) {
  console.log('\n⏳ Testing Loading States...');
  
  const page = await createPage(browser);
  
  try {
    // Slow down network to see loading states
    await page.setRequestInterception(true);
    page.on('request', request => {
      setTimeout(() => request.continue(), 1000); // Add 1 second delay
    });
    
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
    
    // Look for loading indicators
    const loadingSpinner = await page.$('.loading, .spinner, .loader, [data-testid="loading"]');
    const loadingSkeleton = await page.$('.skeleton, .placeholder, .loading-skeleton');
    
    if (loadingSpinner || loadingSkeleton) {
      logTest('Loading Indicators Present', 'PASS', 'Loading states are shown');
    } else {
      logTest('Loading Indicators Present', 'FAIL', 'No loading indicators found');
    }
    
    // Wait for content to load
    await page.waitForTimeout(5000);
    
    // Check if loading states are removed
    const stillLoading = await page.$('.loading, .spinner, .loader');
    if (!stillLoading) {
      logTest('Loading State Removal', 'PASS', 'Loading states are properly removed');
    } else {
      logTest('Loading State Removal', 'FAIL', 'Loading states persist');
    }
    
  } catch (error) {
    logTest('Loading States Tests', 'FAIL', error.message);
  } finally {
    await page.close();
  }
}

// Main test runner
async function runAllTests() {
  console.log('🌐 Starting Comprehensive Frontend Integration Tests...\n');
  
  const startTime = Date.now();
  let browser;
  
  try {
    browser = await createBrowser();
    
    // Run all test suites
    await testPageLoading(browser);
    await testAuthenticationFlow(browser);
    await testCourseInterface(browser);
    await testResponsiveDesign(browser);
    await testAPIIntegration(browser);
    await testLoadingStates(browser);
    
  } catch (error) {
    console.error('Frontend testing failed:', error);
    logTest('Frontend Test Suite', 'FAIL', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n⏱️  Frontend tests completed in ${duration} seconds`);
  console.log(`📊 Results: ${testResults.passed}/${testResults.total} tests passed`);
  
  return testResults;
}

module.exports = { runAllTests, testResults };
