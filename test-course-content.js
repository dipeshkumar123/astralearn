/**
 * Quick test of the specific course with content
 */

async function testCourseWithContent() {
  console.log('🧪 Testing course with content...');

  try {
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'alice@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Get JavaScript Fundamentals course
    const courseDetailResponse = await fetch('http://localhost:5000/api/courses/684fc08bb383c0bf66879afe', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (courseDetailResponse.ok) {
      const courseDetail = await courseDetailResponse.json();
      console.log('✅ JavaScript Fundamentals course:');
      console.log(`   - Title: ${courseDetail.title}`);
      console.log(`   - Modules: ${courseDetail.modules ? courseDetail.modules.length : 0}`);
      
      if (courseDetail.modules && courseDetail.modules.length > 0) {
        let totalLessons = 0;
        courseDetail.modules.forEach((module, index) => {
          const lessons = module.lessons ? module.lessons.length : 0;
          totalLessons += lessons;
          console.log(`   - Module ${index + 1}: ${module.title || module.name || 'Unnamed'} (${lessons} lessons)`);
        });
        console.log(`   - Total Lessons: ${totalLessons}`);
        
        if (totalLessons > 0) {
          console.log('✅ Course has complete content structure!');
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCourseWithContent();
