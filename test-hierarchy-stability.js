/**
 * Simple test to verify course hierarchy endpoint behavior
 */

async function testCourseHierarchy() {
  console.log('🧪 Testing Course Hierarchy Endpoint...\n');
  
  try {
    // 1. Get available courses
    console.log('1. Fetching available courses...');
    const coursesResponse = await fetch('http://localhost:5000/api/courses');
    
    if (!coursesResponse.ok) {
      throw new Error(`Failed to fetch courses: ${coursesResponse.status}`);
    }
    
    const coursesData = await coursesResponse.json();
    const courses = coursesData.courses || [];
    
    console.log(`   Found ${courses.length} courses`);
    
    if (courses.length === 0) {
      console.log('❌ No courses found - need to seed database first');
      return;
    }
    
    // 2. Test hierarchy endpoint for the first course
    const firstCourse = courses[0];
    console.log(`\n2. Testing hierarchy endpoint for: ${firstCourse.title}`);
    console.log(`   Course ID: ${firstCourse._id}`);
    
    const hierarchyResponse = await fetch(`http://localhost:5000/api/course-management/${firstCourse._id}/hierarchy?includeContent=true`);
    
    if (!hierarchyResponse.ok) {
      console.log(`⚠️ Hierarchy endpoint failed: ${hierarchyResponse.status}`);
      console.log('   This might be why infinite loops were happening');
      return;
    }
    
    const hierarchyData = await hierarchyResponse.json();
    console.log('✅ Hierarchy endpoint working correctly!');
    console.log(`   Course: ${hierarchyData.course?.title}`);
    console.log(`   Modules: ${hierarchyData.course?.modules?.length || 0}`);
    console.log(`   Total lessons: ${hierarchyData.course?.modules?.reduce((total, mod) => total + (mod.lessons?.length || 0), 0) || 0}`);
    
    // 3. Test multiple rapid requests to simulate frontend behavior
    console.log('\n3. Testing multiple rapid requests (simulating potential infinite loop)...');
    
    const startTime = Date.now();
    const promises = [];
    
    // Make 5 simultaneous requests
    for (let i = 0; i < 5; i++) {
      promises.push(
        fetch(`http://localhost:5000/api/course-management/${firstCourse._id}/hierarchy?includeContent=true`)
          .then(res => ({ status: res.status, requestId: i + 1 }))
      );
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`   All requests completed in ${endTime - startTime}ms`);
    results.forEach(result => {
      console.log(`   Request ${result.requestId}: ${result.status === 200 ? '✅' : '❌'} ${result.status}`);
    });
    
    const successCount = results.filter(r => r.status === 200).length;
    console.log(`\n📊 Summary: ${successCount}/5 requests successful`);
    
    if (successCount === 5) {
      console.log('✅ Backend hierarchy endpoint is stable and ready for frontend');
    } else {
      console.log('⚠️ Some requests failed - backend may have issues');
    }
    
  } catch (error) {
    console.error('❌ Error testing course hierarchy:', error.message);
  }
}

// Run the test
testCourseHierarchy().then(() => {
  console.log('\n🏁 Course hierarchy test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
