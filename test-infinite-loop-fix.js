/**
 * Test script to verify the infinite loop fix
 * This will check that course hierarchy endpoint is called only once per course load
 */

const puppeteer = require('puppeteer');

async function testInfiniteLoopFix() {
  console.log('🔧 Testing Infinite Loop Fix...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();
    
    // Track network requests to the course hierarchy endpoint
    const hierarchyRequests = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/course-management/') && url.includes('/hierarchy')) {
        hierarchyRequests.push({
          url,
          timestamp: Date.now()
        });
        console.log(`📡 Course hierarchy request: ${url}`);
      }
    });
    
    // Navigate to the dashboard
    console.log('1. Navigating to dashboard...');
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for a course preview button
    console.log('2. Looking for course preview/continue buttons...');
    
    // Try to find and click a preview button
    try {
      await page.waitForSelector('button:has-text("Preview")', { timeout: 5000 });
      console.log('3. Found Preview button, clicking...');
      await page.click('button:has-text("Preview")');
      
      // Wait and monitor requests for 10 seconds
      console.log('4. Monitoring requests for 10 seconds...');
      await page.waitForTimeout(10000);
      
      // Check request count
      console.log(`\n📊 Total hierarchy requests made: ${hierarchyRequests.length}`);
      
      if (hierarchyRequests.length === 0) {
        console.log('⚠️ No hierarchy requests detected - course may not have loaded');
      } else if (hierarchyRequests.length === 1) {
        console.log('✅ Perfect! Only 1 hierarchy request made - infinite loop fixed!');
      } else if (hierarchyRequests.length <= 3) {
        console.log('⚠️ Multiple requests detected but not infinite - needs investigation');
      } else {
        console.log('❌ Too many requests detected - infinite loop may still exist');
      }
      
      // Log all requests with timestamps
      hierarchyRequests.forEach((req, index) => {
        const timeDiff = index > 0 ? req.timestamp - hierarchyRequests[0].timestamp : 0;
        console.log(`   ${index + 1}. ${req.url} (+${timeDiff}ms)`);
      });
      
    } catch (error) {
      console.log('⚠️ Could not find Preview button, trying alternative approach...');
      
      // Try to find continue button instead
      try {
        await page.waitForSelector('button:has-text("Continue")', { timeout: 5000 });
        console.log('3. Found Continue button, clicking...');
        await page.click('button:has-text("Continue")');
        
        await page.waitForTimeout(10000);
        
        console.log(`\n📊 Total hierarchy requests made: ${hierarchyRequests.length}`);
        if (hierarchyRequests.length <= 1) {
          console.log('✅ Infinite loop appears to be fixed!');
        } else {
          console.log('❌ Multiple requests detected - needs more investigation');
        }
        
      } catch (continueError) {
        console.log('⚠️ Could not find Continue button either');
        console.log('ℹ️ This may be because there are no courses with content in the database');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run test if called directly
if (require.main === module) {
  testInfiniteLoopFix().then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = testInfiniteLoopFix;
