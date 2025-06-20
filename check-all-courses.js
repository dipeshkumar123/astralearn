// Check which courses have modules and lessons
const axios = require('axios');

async function checkAllCourses() {
    console.log('📋 Checking all courses for modules and lessons...\n');
    
    try {
        const coursesResponse = await axios.get('http://localhost:3000/api/courses');
        const courses = coursesResponse.data.courses;
        
        console.log(`Found ${courses.length} courses:\n`);
        
        for (const course of courses) {
            console.log(`🔍 Checking: ${course.title} (${course._id})`);
            
            try {
                const hierarchyResponse = await axios.get(`http://localhost:3000/api/course-management/${course._id}/hierarchy`);
                const courseData = hierarchyResponse.data.course;
                
                const moduleCount = courseData.modules ? courseData.modules.length : 0;
                let totalLessons = 0;
                
                if (courseData.modules) {
                    totalLessons = courseData.modules.reduce((sum, module) => {
                        return sum + (module.lessons ? module.lessons.length : 0);
                    }, 0);
                }
                
                console.log(`   📊 Modules: ${moduleCount}, Lessons: ${totalLessons}`);
                
                if (moduleCount > 0) {
                    console.log(`   📝 Module details:`);
                    courseData.modules.forEach((module, index) => {
                        const lessonCount = module.lessons ? module.lessons.length : 0;
                        console.log(`      ${index + 1}. ${module.title} (${lessonCount} lessons)`);
                    });
                }
                
                console.log('');
                
            } catch (error) {
                console.log(`   ❌ Error loading hierarchy: ${error.message}\n`);
            }
        }
        
    } catch (error) {
        console.error('❌ Failed to check courses:', error.message);
    }
}

checkAllCourses();
