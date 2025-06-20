// Test script to verify the infinite loop issue is resolved
const axios = require('axios');

async function testCourseHierarchyStability() {
    console.log('Testing course hierarchy endpoint stability...');
    
    try {
        // Get available courses first
        const coursesResponse = await axios.get('http://localhost:3000/api/courses');
        const courses = coursesResponse.data.courses;
        
        if (courses.length === 0) {
            console.log('No courses found. Please run the course seeder first.');
            return;
        }
        
        const testCourse = courses[0];
        console.log(`Testing with course: ${testCourse.title} (ID: ${testCourse._id})`);
        
        // Test multiple rapid requests to ensure no infinite loop
        console.log('\nTesting multiple rapid requests...');
        const startTime = Date.now();
        
        const requests = [];
        for (let i = 0; i < 5; i++) {
            requests.push(
                axios.get(`http://localhost:3000/api/course-management/${testCourse._id}/hierarchy`)
                    .then(response => ({
                        request: i + 1,
                        success: response.data.success,
                        hasModules: response.data.course.modules && response.data.course.modules.length > 0,
                        moduleCount: response.data.course.modules ? response.data.course.modules.length : 0
                    }))
                    .catch(error => ({
                        request: i + 1,
                        error: error.message
                    }))
            );
        }
        
        const results = await Promise.all(requests);
        const endTime = Date.now();
        
        console.log('\nResults:');
        results.forEach(result => {
            if (result.error) {
                console.log(`Request ${result.request}: ERROR - ${result.error}`);
            } else {
                console.log(`Request ${result.request}: SUCCESS - ${result.moduleCount} modules found`);
            }
        });
        
        console.log(`\nTotal time for 5 requests: ${endTime - startTime}ms`);
        console.log(`Average time per request: ${(endTime - startTime) / 5}ms`);
        
        // Verify all requests succeeded
        const allSuccessful = results.every(r => !r.error && r.success);
        console.log(`\nAll requests successful: ${allSuccessful}`);
        
        if (allSuccessful) {
            console.log('✅ Course hierarchy endpoint is stable - no infinite loop detected');
        } else {
            console.log('❌ Some requests failed - check for issues');
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testCourseHierarchyStability();
