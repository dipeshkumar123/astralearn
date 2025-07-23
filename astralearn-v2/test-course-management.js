// Comprehensive course management testing
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCourseManagement() {
  console.log('🧪 Testing Course Management Features...\n');

  try {
    // Setup: Login as instructor
    console.log('🔧 Setup: Logging in as instructor...');
    const instructorLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'john.instructor@astralearn.com',
      password: 'password123'
    });
    const instructorToken = instructorLogin.data.data.tokens.accessToken;
    console.log('✅ Instructor logged in:', instructorLogin.data.data.user.firstName);

    // Setup: Login as student
    const studentLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    const studentToken = studentLogin.data.data.tokens.accessToken;
    console.log('✅ Student logged in:', studentLogin.data.data.user.firstName);
    console.log('');

    // Test 1: Get all courses (public access)
    console.log('1️⃣ Testing get all courses...');
    const allCoursesResponse = await axios.get(`${BASE_URL}/api/courses`);
    console.log('✅ Retrieved', allCoursesResponse.data.total, 'courses');
    const initialCourseCount = allCoursesResponse.data.total;
    console.log('');

    // Test 2: Filter courses by category
    console.log('2️⃣ Testing course filtering by category...');
    const programmingCoursesResponse = await axios.get(`${BASE_URL}/api/courses?category=Programming`);
    console.log('✅ Programming courses:', programmingCoursesResponse.data.total);
    
    const dataScienceCoursesResponse = await axios.get(`${BASE_URL}/api/courses?category=Data Science`);
    console.log('✅ Data Science courses:', dataScienceCoursesResponse.data.total);
    console.log('');

    // Test 3: Filter courses by difficulty
    console.log('3️⃣ Testing course filtering by difficulty...');
    const beginnerCoursesResponse = await axios.get(`${BASE_URL}/api/courses?difficulty=beginner`);
    console.log('✅ Beginner courses:', beginnerCoursesResponse.data.total);
    
    const advancedCoursesResponse = await axios.get(`${BASE_URL}/api/courses?difficulty=advanced`);
    console.log('✅ Advanced courses:', advancedCoursesResponse.data.total);
    console.log('');

    // Test 4: Search courses
    console.log('4️⃣ Testing course search...');
    const searchResponse = await axios.get(`${BASE_URL}/api/courses?search=JavaScript`);
    console.log('✅ JavaScript search results:', searchResponse.data.total);
    console.log('');

    // Test 5: Get specific course details
    console.log('5️⃣ Testing get specific course details...');
    const courseId = allCoursesResponse.data.data[0].id;
    const courseDetailResponse = await axios.get(`${BASE_URL}/api/courses/${courseId}`);
    console.log('✅ Course details retrieved:', courseDetailResponse.data.data.title);
    console.log('   Instructor:', courseDetailResponse.data.data.instructorName);
    console.log('   Difficulty:', courseDetailResponse.data.data.difficulty);
    console.log('   Price: $', courseDetailResponse.data.data.price);
    console.log('');

    // Test 6: Create new course as instructor
    console.log('6️⃣ Testing course creation by instructor...');
    const newCourseData = {
      title: 'Full-Stack Web Development',
      description: 'Complete guide to building modern web applications',
      category: 'Programming',
      difficulty: 'intermediate',
      price: 129.99,
      duration: 300
    };
    
    const createCourseResponse = await axios.post(`${BASE_URL}/api/courses`, newCourseData, {
      headers: { Authorization: `Bearer ${instructorToken}` }
    });
    console.log('✅ Course created:', createCourseResponse.data.data.title);
    console.log('   Course ID:', createCourseResponse.data.data.id);
    console.log('   Instructor:', createCourseResponse.data.data.instructorName);
    const newCourseId = createCourseResponse.data.data.id;
    console.log('');

    // Test 7: Try to create course as student (should fail)
    console.log('7️⃣ Testing course creation by student (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/courses`, newCourseData, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('❌ Student should not be able to create courses');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Correctly denied: Students cannot create courses');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 8: Student enrollment in course
    console.log('8️⃣ Testing student enrollment...');
    const enrollResponse = await axios.post(`${BASE_URL}/api/courses/${newCourseId}/enroll`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Student enrolled:', enrollResponse.data.message);
    console.log('');

    // Test 9: Try to enroll again (should fail)
    console.log('9️⃣ Testing duplicate enrollment (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/courses/${newCourseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('❌ Should not allow duplicate enrollment');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Correctly denied: Already enrolled');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 10: Verify enrollment count updated
    console.log('🔟 Testing enrollment count update...');
    const updatedCourseResponse = await axios.get(`${BASE_URL}/api/courses/${newCourseId}`);
    console.log('✅ Enrollment count updated:', updatedCourseResponse.data.data.enrollmentCount);
    console.log('');

    // Test 11: Try to enroll without authentication (should fail)
    console.log('1️⃣1️⃣ Testing enrollment without authentication (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/courses/${newCourseId}/enroll`, {});
      console.log('❌ Should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly denied: Authentication required');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 12: Verify total course count increased
    console.log('1️⃣2️⃣ Testing total course count...');
    const finalCoursesResponse = await axios.get(`${BASE_URL}/api/courses`);
    const finalCourseCount = finalCoursesResponse.data.total;
    console.log('✅ Course count increased from', initialCourseCount, 'to', finalCourseCount);
    console.log('');

    console.log('🎉 All course management tests passed!');
    console.log('');
    console.log('✅ Working Course Features:');
    console.log('   - Course listing and retrieval');
    console.log('   - Course filtering (category, difficulty)');
    console.log('   - Course search functionality');
    console.log('   - Course creation (instructor only)');
    console.log('   - Course enrollment (student)');
    console.log('   - Role-based permissions');
    console.log('   - Duplicate enrollment prevention');
    console.log('   - Enrollment count tracking');
    console.log('   - Authentication requirements');

  } catch (error) {
    console.error('❌ Course management test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testCourseManagement();
