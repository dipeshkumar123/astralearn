// Test file to validate ES module imports
console.log('Testing ES module imports...');

try {
  // Test the services that use named exports
  console.log('Testing adaptiveLearningService...');
  const { adaptiveLearningService } = await import('./src/services/adaptiveLearningService.js');
  console.log('✓ adaptiveLearningService imported successfully');

  console.log('Testing learningAnalyticsService...');
  const { learningAnalyticsService } = await import('./src/services/learningAnalyticsService.js');
  console.log('✓ learningAnalyticsService imported successfully');

  // Test one of the services that imports these
  console.log('Testing analyticsService...');
  const analyticsServiceDefault = await import('./src/services/analyticsService.js');
  console.log('✓ analyticsService imported successfully');

  console.log('Testing instructorAnalyticsService...');
  const instructorAnalyticsServiceDefault = await import('./src/services/instructorAnalyticsService.js');
  console.log('✓ instructorAnalyticsService imported successfully');

  console.log('Testing learningGapService...');
  const learningGapServiceDefault = await import('./src/services/learningGapService.js');
  console.log('✓ learningGapService imported successfully');

  console.log('\n🎉 All imports are working correctly!');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  process.exit(1);
}
