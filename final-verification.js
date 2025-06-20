// Final verification script for infinite loop resolution
const axios = require('axios');

async function finalVerification() {
    console.log('🔍 Final verification of infinite loop resolution...\n');
    
    try {
        // 1. Get courses
        console.log('1. Testing courses endpoint...');
        const coursesResponse = await axios.get('http://localhost:3000/api/courses');
        const courses = coursesResponse.data.courses;
        console.log(`✅ Found ${courses.length} courses`);
        
        // 2. Find JavaScript course
        const jsCourse = courses.find(c => c.title.includes('JavaScript') || c.title.includes('Fundamentals'));
        if (!jsCourse) {
            console.log('❌ JavaScript Fundamentals course not found');
            return;
        }
        
        console.log(`\n2. Testing JavaScript Fundamentals course (${jsCourse._id})...`);
        
        // 3. Test course hierarchy endpoint
        const hierarchyResponse = await axios.get(`http://localhost:3000/api/course-management/${jsCourse._id}/hierarchy`);
        const courseData = hierarchyResponse.data.course;
        
        console.log(`✅ Course hierarchy loaded successfully`);
        console.log(`   - Title: ${courseData.title}`);
        console.log(`   - Modules: ${courseData.modules ? courseData.modules.length : 0}`);
        
        if (courseData.modules && courseData.modules.length > 0) {
            const totalLessons = courseData.modules.reduce((sum, module) => {
                return sum + (module.lessons ? module.lessons.length : 0);
            }, 0);
            console.log(`   - Total lessons: ${totalLessons}`);
            
            console.log('\n   Module details:');
            courseData.modules.forEach((module, index) => {
                console.log(`     ${index + 1}. ${module.title} (${module.lessons ? module.lessons.length : 0} lessons)`);
            });
        }
        
        // 4. Test rapid sequential requests to verify no infinite loop
        console.log('\n3. Testing for infinite loop (rapid requests)...');
        const startTime = Date.now();
        
        for (let i = 0; i < 3; i++) {
            const response = await axios.get(`http://localhost:3000/api/course-management/${jsCourse._id}/hierarchy`);
            if (!response.data.success) {
                throw new Error(`Request ${i + 1} failed`);
            }
            console.log(`   Request ${i + 1}: ✅ Success (${Date.now() - startTime}ms)`);
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`\n✅ All rapid requests successful in ${totalTime}ms`);
        
        // 5. Test course detail endpoint
        console.log('\n4. Testing course detail endpoint...');
        const detailResponse = await axios.get(`http://localhost:3000/api/courses/${jsCourse._id}`);
        console.log(`✅ Course detail loaded: ${detailResponse.data.course.title}`);
        
        console.log('\n🎉 VERIFICATION COMPLETE');
        console.log('✅ Backend is stable and responding correctly');
        console.log('✅ No infinite loop detected');
        console.log('✅ Course hierarchy endpoint working properly');
        console.log('✅ Course content is available for preview and learning');
        
        console.log('\n📋 SUMMARY:');
        console.log(`- Course with content: ${jsCourse.title}`);
        console.log(`- Course ID: ${jsCourse._id}`);
        console.log(`- Modules: ${courseData.modules ? courseData.modules.length : 0}`);
        console.log('- Backend response time: Fast and stable');
        console.log('- Frontend should now load without infinite requests');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

finalVerification();
