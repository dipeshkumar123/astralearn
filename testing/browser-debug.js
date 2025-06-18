/**
 * Browser Debug Script for StudentDashboard
 * Run this in the browser console to check dashboard state
 */

// Function to check dashboard loading state
function debugDashboard() {
  console.log('🔍 Dashboard Debug Information:');
  console.log('================================');
  
  // Check if React DevTools is available
  if (window.React) {
    console.log('✅ React is loaded');
  } else {
    console.log('❌ React not detected');
  }
  
  // Check localStorage for authentication
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('🔐 Authentication State:');
  console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'Not found');
  console.log('   Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Not found');
  
  // Check network requests
  console.log('🌐 Checking API availability...');
  
  // Test API endpoints
  const testEndpoints = [
    '/api/health',
    '/api/courses',
    '/api/courses/my/enrolled',
    '/api/analytics/summary',
    '/api/adaptive-learning/recommendations',
    '/api/gamification/dashboard'
  ];
  
  testEndpoints.forEach(async (endpoint) => {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`   ${endpoint}: ERROR - ${error.message}`);
    }
  });
  
  // Check for common issues
  console.log('🔧 Common Issues Check:');
  
  // Check if backend is running
  fetch('http://localhost:5000/health')
    .then(response => {
      if (response.ok) {
        console.log('   ✅ Backend server is responding');
      } else {
        console.log('   ❌ Backend server error:', response.status);
      }
    })
    .catch(error => {
      console.log('   ❌ Backend server not reachable:', error.message);
    });
  
  // Check for CORS issues
  console.log('   Checking for CORS issues...');
  
  // Check if dashboard elements exist
  const dashboardElements = document.querySelectorAll('[data-testid], .dashboard, .student-dashboard');
  console.log('   Dashboard elements found:', dashboardElements.length);
  
  // Check for loading indicators
  const loadingIndicators = document.querySelectorAll('.animate-spin, .spinner, [class*="loading"]');
  console.log('   Loading indicators found:', loadingIndicators.length);
  
  // Check console for errors
  console.log('📝 Check browser console for:');
  console.log('   - JavaScript errors (red text)');
  console.log('   - Network errors in Network tab');
  console.log('   - React component errors');
  console.log('   - CORS policy errors');
}

// Function to force stop loading
function forceStopLoading() {
  console.log('🛑 Attempting to force stop loading...');
  
  // Try to find React components and force update
  if (window.React) {
    // This is a hack to try to force React to re-render
    window.dispatchEvent(new Event('storage'));
  }
  
  // Clear any timeouts that might be causing issues
  const highestTimeoutId = setTimeout(';');
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
  
  console.log('   Cleared all timeouts');
  console.log('   Try refreshing the page if dashboard is still loading');
}

// Auto-run debug
console.log('🧪 Running automatic dashboard debug...');
debugDashboard();

// Export functions for manual use
window.debugDashboard = debugDashboard;
window.forceStopLoading = forceStopLoading;

console.log('📋 Available functions:');
console.log('   debugDashboard() - Run full diagnostic');
console.log('   forceStopLoading() - Try to force stop loading');
