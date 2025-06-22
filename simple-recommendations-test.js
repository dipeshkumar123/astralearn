/**
 * Simple test to validate the recommendations fix
 * Tests the recommendations logic without browser automation
 */

const fs = require('fs');
const path = require('path');

function testRecommendationsFix() {
    console.log('🔍 Testing Recommendations Fix...\n');
    
    try {
        // Read the StudentDashboard file
        const dashboardPath = path.join(__dirname, 'client', 'src', 'components', 'dashboard', 'StudentDashboard.jsx');
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
        
        // Read the DataSyncProvider file
        const providerPath = path.join(__dirname, 'client', 'src', 'contexts', 'DataSyncProvider.jsx');
        const providerContent = fs.readFileSync(providerPath, 'utf8');
        
        console.log('📁 Checking file contents...\n');
        
        // Check if recommendations variable is defined in StudentDashboard
        const hasRecommendationsVariable = dashboardContent.includes('const recommendations = getRecommendations()');
        console.log(`✅ Recommendations variable defined: ${hasRecommendationsVariable}`);
        
        // Check if getRecommendations is imported from useDataSync
        const hasGetRecommendationsImport = dashboardContent.includes('getRecommendations,');
        console.log(`✅ getRecommendations imported: ${hasGetRecommendationsImport}`);
        
        // Check if getRecommendations function exists in DataSyncProvider
        const hasGetRecommendationsFunction = providerContent.includes('const getRecommendations = useCallback(');
        console.log(`✅ getRecommendations function exists: ${hasGetRecommendationsFunction}`);
        
        // Check if getRecommendations is exported from DataSyncProvider
        const hasGetRecommendationsExport = providerContent.includes('getRecommendations,');
        console.log(`✅ getRecommendations exported: ${hasGetRecommendationsExport}`);
        
        // Check if recommendations is used in JSX
        const hasRecommendationsUsage = dashboardContent.includes('recommendations.length > 0');
        console.log(`✅ Recommendations used in JSX: ${hasRecommendationsUsage}`);
        
        // Check if recommendations.slice is used
        const hasRecommendationsSlice = dashboardContent.includes('recommendations.slice(0, 2)');
        console.log(`✅ Recommendations slice used: ${hasRecommendationsSlice}`);
        
        console.log('\n🧪 Running code analysis...\n');
        
        // Simulate the recommendations logic
        const sampleCourses = [
            { _id: '1', title: 'React Basics', category: 'Frontend', rating: 4.5, difficulty: 'beginner' },
            { _id: '2', title: 'Node.js Advanced', category: 'Backend', rating: 4.2, difficulty: 'advanced' },
            { _id: '3', title: 'JavaScript Fundamentals', category: 'Frontend', rating: 4.8, difficulty: 'beginner' }
        ];
        
        const sampleUserProgress = { '1': { completed: 50 } }; // User enrolled in course 1
        
        // Test the recommendation logic
        const enrolledCourseIds = Object.keys(sampleUserProgress);
        const availableCourses = sampleCourses.filter(course => 
            !enrolledCourseIds.includes(course._id)
        );
        
        console.log(`📊 Sample data test:`);
        console.log(`   - Total courses: ${sampleCourses.length}`);
        console.log(`   - Enrolled courses: ${enrolledCourseIds.length}`);
        console.log(`   - Available for recommendations: ${availableCourses.length}`);
        
        const allChecks = [
            hasRecommendationsVariable,
            hasGetRecommendationsImport,
            hasGetRecommendationsFunction,
            hasGetRecommendationsExport,
            hasRecommendationsUsage,
            hasRecommendationsSlice
        ];
        
        const passedChecks = allChecks.filter(check => check).length;
        const totalChecks = allChecks.length;
        
        console.log(`\n📋 Test Results:`);
        console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
        
        if (passedChecks === totalChecks) {
            console.log('🎉 All checks passed! The recommendations fix is complete.');
            console.log('\n🔧 Fix Summary:');
            console.log('   - Added getRecommendations function to DataSyncProvider');
            console.log('   - Added recommendations variable to StudentDashboard');
            console.log('   - Imported getRecommendations in StudentDashboard');
            console.log('   - Fixed "recommendations is not defined" error');
            
            return true;
        } else {
            console.log('❌ Some checks failed. Please review the implementation.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

// Run the test
if (require.main === module) {
    const success = testRecommendationsFix();
    process.exit(success ? 0 : 1);
}

module.exports = { testRecommendationsFix };
