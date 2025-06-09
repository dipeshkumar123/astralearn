// Simple test to check auth route import
async function testAuth() {
  try {
    const auth = await import('./src/routes/auth.ts');
    console.log('Auth route imported successfully');
    console.log('Export keys:', Object.keys(auth));
    console.log('Default export:', auth.default);
  } catch (error) {
    console.error('Error importing auth route:', error);
  }
}

testAuth();
