const axios = require('axios');

async function testSpecificCourse() {
  try {
    console.log('=== Testing Course Endpoints with Content ===');
    
    // Get all courses first
    console.log('1. Getting all courses...');
    const coursesResponse = await axios.get('http://localhost:5000/api/courses');
    console.log('📊 Status:', coursesResponse.status);
    console.log('📋 Found courses:');    const coursesData = coursesResponse.data;
    console.log('📋 Found courses:');
    
    const courses = coursesData.courses || [];
    courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (ID: ${course._id})`);
      console.log(`      Modules: ${course.modules ? course.modules.length : 0}`);
    });
    
    // Find the JavaScript course
    const jsCourse = courses.find(c => c.title.includes('JavaScript'));
    if (!jsCourse) {
      console.log('❌ JavaScript course not found');
      return;
    }
    
    console.log(`\n📋 Testing with course: ${jsCourse.title} (ID: ${jsCourse._id})`);
    
    // Test individual course endpoint
    console.log('\n2. Testing individual course endpoint...');
    const courseResponse = await axios.get(`http://localhost:5000/api/courses/${jsCourse._id}`);
    console.log('📊 Status:', courseResponse.status);    console.log('✅ Individual course endpoint working!');
    console.log('📋 Course details:');
    console.log('📋 Full response:', JSON.stringify(courseResponse.data, null, 2));
    
    // Test course-management endpoint for hierarchy
    console.log('\n3. Testing course-management hierarchy endpoint...');
    const hierarchyResponse = await axios.get(`http://localhost:5000/api/course-management/${jsCourse._id}/hierarchy?includeContent=true`);
    console.log('📊 Course Management Status:', hierarchyResponse.status);    console.log('✅ Course management endpoint working!');
    console.log('📋 Course hierarchy details:');
    console.log('📋 Full hierarchy response:', JSON.stringify(hierarchyResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing course endpoints:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Response:', error.response.data);
    }
  }
}

testSpecificCourse();
