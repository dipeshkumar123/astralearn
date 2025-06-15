/**
 * Test Suite for Dashboard API Endpoints
 * Tests all endpoints that are causing JSON parsing errors
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test endpoints without authentication first
const testEndpoints = [
  // Health checks (should work without auth)
  { url: `${BASE_URL}/health`, method: 'GET', requiresAuth: false },
  { url: `${BASE_URL}/analytics/health`, method: 'GET', requiresAuth: false },
  { url: `${BASE_URL}/gamification/health`, method: 'GET', requiresAuth: false },
  { url: `${BASE_URL}/adaptive-learning/health`, method: 'GET', requiresAuth: false },
  
  // Dashboard endpoints (should now work with flexible auth)
  { url: `${BASE_URL}/analytics/user/overview`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/analytics/instructor/dashboard-overview`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/courses/my/enrolled`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/courses/instructor`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/gamification/dashboard`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/gamification/leaderboard/rank`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/gamification/recommendations/social`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/adaptive-learning/learning-path/current`, method: 'GET', requiresAuth: true },
  { url: `${BASE_URL}/social-learning/dashboard/social`, method: 'GET', requiresAuth: true },
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing: ${endpoint.method} ${endpoint.url}`);
    
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(endpoint.url, options);
    const contentType = response.headers.get('content-type');
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const body = await response.text();
      try {
        const json = JSON.parse(body);
        console.log(`   ✅ Valid JSON response`);
        if (json.error) {
          console.log(`   ℹ️  Error: ${json.error} - ${json.message}`);
        }
        return { success: true, status: response.status, data: json };
      } catch (parseError) {
        console.log(`   ❌ Invalid JSON: ${parseError.message}`);
        console.log(`   📄 Raw response: ${body.substring(0, 200)}...`);
        return { success: false, status: response.status, error: 'JSON parse error', body };
      }
    } else {
      const body = await response.text();
      console.log(`   ❌ Non-JSON response`);
      console.log(`   📄 Raw response: ${body.substring(0, 200)}...`);
      return { success: false, status: response.status, error: 'Non-JSON response', body };
    }
  } catch (error) {
    console.log(`   💥 Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Dashboard API Endpoint Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ ...endpoint, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const authRequired = results.filter(r => r.status === 401);
  const notFound = results.filter(r => r.status === 404);
  const serverError = results.filter(r => r.status >= 500);
  
  console.log(`✅ Total tests: ${results.length}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`🔐 Auth required (401): ${authRequired.length}`);
  console.log(`❓ Not found (404): ${notFound.length}`);
  console.log(`💥 Server errors (5xx): ${serverError.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    failed.forEach(result => {
      console.log(`   ${result.method} ${result.url} - ${result.error || `Status ${result.status}`}`);
    });
  }
  
  if (authRequired.length > 0) {
    console.log('\n🔐 ENDPOINTS REQUIRING AUTH (These should work with dev auth):');
    authRequired.forEach(result => {
      console.log(`   ${result.method} ${result.url}`);
    });
  }
  
  console.log('\n🎯 All endpoints should return JSON (no HTML 404 pages)');
  console.log('🎯 Auth-required endpoints should work in development mode');
}

// Run the tests
runTests().catch(console.error);
