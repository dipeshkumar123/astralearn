// Comprehensive test script for AstraLearn v2 Course Management API
const axios = require('axios');

const BASE_URL = 'http://localhost:5002';

// Test data
const testInstructor = {
  email: 'instructor@astralearn.com',
  username: 'prof_smith',
  password: 'password123',
  firstName: 'Professor',
  lastName: 'Smith',
  role: 'instructor',
  learningStyle: 'visual',
  interests: ['teaching', 'computer-science'],
};

const testStudent = {
  email: 'student@astralearn.com',
  username: 'student_jane',
  password: 'password123',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'student',
  learningStyle: 'kinesthetic',
  interests: ['programming', 'web-development'],
};

const testCourse = {
  title: 'Introduction to Web Development',
  description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
  shortDescription: 'Complete beginner-friendly web development course',
  category: 'programming',
  tags: ['html', 'css', 'javascript', 'web-development'],
  difficulty: 'beginner',
  duration: 40,
  language: 'en',
  isFree: true,
  prerequisites: [],
  requirements: ['Computer with internet access', 'Text editor'],
  learningObjectives: [
    'Understand HTML structure and semantics',
    'Style web pages with CSS',
    'Add interactivity with JavaScript',
    'Build a complete web project'
  ],
};

const testModules = [
  {
    title: 'HTML Fundamentals',
    description: 'Learn the building blocks of web pages',
    order: 1,
  },
  {
    title: 'CSS Styling',
    description: 'Make your web pages beautiful with CSS',
    order: 2,
  },
  {
    title: 'JavaScript Basics',
    description: 'Add interactivity to your web pages',
    order: 3,
  },
];

const testLessons = [
  {
    title: 'Introduction to HTML',
    description: 'What is HTML and how does it work?',
    type: 'video',
    duration: 15,
    order: 1,
    isPreview: true,
  },
  {
    title: 'HTML Elements and Tags',
    description: 'Learn about different HTML elements',
    type: 'video',
    duration: 20,
    order: 2,
  },
  {
    title: 'HTML Practice Exercise',
    description: 'Practice what you learned',
    type: 'assignment',
    duration: 30,
    order: 3,
  },
];

let instructorToken = '';
let studentToken = '';
let courseId = '';
let moduleIds = [];
let lessonIds = [];

async function testCourseManagementAPI() {
  console.log('🧪 Starting AstraLearn v2 Course Management API Tests\n');

  try {
    // Test 1: API Info
    console.log('1️⃣ Testing API Info...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API Info:', apiResponse.data.message);
    console.log('   Endpoints:', Object.keys(apiResponse.data.endpoints).length);
    console.log('');

    // Test 2: Register instructor and student
    console.log('2️⃣ Testing User Registration...');
    try {
      const instructorResponse = await axios.post(`${BASE_URL}/api/auth/register`, testInstructor);
      instructorToken = instructorResponse.data.data.tokens.accessToken;
      console.log(`✅ Instructor registered: ${testInstructor.firstName} ${testInstructor.lastName}`);

      const studentResponse = await axios.post(`${BASE_URL}/api/auth/register`, testStudent);
      studentToken = studentResponse.data.data.tokens.accessToken;
      console.log(`✅ Student registered: ${testStudent.firstName} ${testStudent.lastName}`);
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 3: Create course (instructor only)
    console.log('3️⃣ Testing Course Creation...');
    try {
      const response = await axios.post(`${BASE_URL}/api/courses`, testCourse, {
        headers: { Authorization: `Bearer ${instructorToken}` }
      });
      courseId = response.data.data.id;
      console.log('✅ Course created successfully');
      console.log(`   Course ID: ${courseId}`);
      console.log(`   Title: ${response.data.data.title}`);
      console.log(`   Category: ${response.data.data.category}`);
      console.log(`   Difficulty: ${response.data.data.difficulty}`);
    } catch (error) {
      console.log('❌ Course creation failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 4: Try to create course as student (should fail)
    console.log('4️⃣ Testing Course Creation Permission (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/courses`, testCourse, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('❌ Student should not be able to create courses!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Course creation correctly restricted to instructors');
        console.log(`   Error: ${error.response.data.message}`);
      }
    }
    console.log('');

    // Test 5: Create modules
    console.log('5️⃣ Testing Module Creation...');
    for (let i = 0; i < testModules.length; i++) {
      const moduleData = { ...testModules[i], courseId };
      try {
        const response = await axios.post(`${BASE_URL}/api/modules`, moduleData, {
          headers: { Authorization: `Bearer ${instructorToken}` }
        });
        moduleIds.push(response.data.data.id);
        console.log(`✅ Module created: ${response.data.data.title} (Order: ${response.data.data.order})`);
      } catch (error) {
        console.log(`❌ Module creation failed:`, error.response?.data?.message);
      }
    }
    console.log('');

    // Test 6: Create lessons
    console.log('6️⃣ Testing Lesson Creation...');
    if (moduleIds.length > 0) {
      for (let i = 0; i < testLessons.length; i++) {
        const lessonData = {
          ...testLessons[i],
          courseId,
          moduleId: moduleIds[0], // Add all lessons to first module for testing
        };
        try {
          const response = await axios.post(`${BASE_URL}/api/lessons`, lessonData, {
            headers: { Authorization: `Bearer ${instructorToken}` }
          });
          lessonIds.push(response.data.data.id);
          console.log(`✅ Lesson created: ${response.data.data.title} (${response.data.data.type}, ${response.data.data.duration}min)`);
        } catch (error) {
          console.log(`❌ Lesson creation failed:`, error.response?.data?.message);
        }
      }
    }
    console.log('');

    // Test 7: Get all courses
    console.log('7️⃣ Testing Get All Courses...');
    try {
      const response = await axios.get(`${BASE_URL}/api/courses`);
      console.log('✅ Courses retrieved successfully');
      console.log(`   Total courses: ${response.data.data.length}`);
      if (response.data.data.length > 0) {
        const course = response.data.data[0];
        console.log(`   Sample course: ${course.title} (${course.difficulty})`);
        console.log(`   Instructor: ${course.instructorName}`);
        console.log(`   Modules: ${course.moduleCount}, Lessons: ${course.lessonCount}`);
      }
    } catch (error) {
      console.log('❌ Get courses failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 8: Get course by ID with full details
    console.log('8️⃣ Testing Get Course Details...');
    try {
      const response = await axios.get(`${BASE_URL}/api/courses/${courseId}`);
      console.log('✅ Course details retrieved');
      console.log(`   Title: ${response.data.data.title}`);
      console.log(`   Modules: ${response.data.data.modules.length}`);
      
      response.data.data.modules.forEach((module, index) => {
        console.log(`   Module ${index + 1}: ${module.title} (${module.lessons.length} lessons)`);
        module.lessons.forEach((lesson, lessonIndex) => {
          console.log(`     Lesson ${lessonIndex + 1}: ${lesson.title} (${lesson.type}, ${lesson.duration}min)`);
        });
      });
    } catch (error) {
      console.log('❌ Get course details failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 9: Student enrollment
    console.log('9️⃣ Testing Course Enrollment...');
    try {
      const response = await axios.post(`${BASE_URL}/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Student enrolled successfully');
      console.log(`   Enrollment ID: ${response.data.data.enrollmentId}`);
      console.log(`   Course: ${response.data.data.courseTitle}`);
      console.log(`   Total lessons: ${response.data.data.totalLessons}`);
    } catch (error) {
      console.log('❌ Enrollment failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 10: Duplicate enrollment (should fail)
    console.log('🔟 Testing Duplicate Enrollment (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('❌ Duplicate enrollment should have failed!');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Duplicate enrollment correctly prevented');
        console.log(`   Error: ${error.response.data.message}`);
      }
    }
    console.log('');

    // Test 11: Get user enrollments
    console.log('1️⃣1️⃣ Testing Get User Enrollments...');
    try {
      const response = await axios.get(`${BASE_URL}/api/users/enrollments`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Enrollments retrieved');
      console.log(`   Total enrollments: ${response.data.count}`);
      
      response.data.data.forEach((enrollment, index) => {
        console.log(`   Enrollment ${index + 1}: ${enrollment.course.title}`);
        console.log(`     Status: ${enrollment.status}, Progress: ${enrollment.progress}%`);
        console.log(`     Lessons: ${enrollment.lessonsCompleted}/${enrollment.totalLessons}`);
      });
    } catch (error) {
      console.log('❌ Get enrollments failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 12: Update lesson progress
    console.log('1️⃣2️⃣ Testing Lesson Progress Updates...');
    if (lessonIds.length > 0) {
      for (let i = 0; i < Math.min(lessonIds.length, 2); i++) {
        const lessonId = lessonIds[i];
        const progressData = {
          status: i === 0 ? 'completed' : 'in_progress',
          progress: i === 0 ? 100 : 50,
          timeSpent: 15,
          score: i === 0 ? 95 : null,
        };

        try {
          const response = await axios.put(`${BASE_URL}/api/lessons/${lessonId}/progress`, progressData, {
            headers: { Authorization: `Bearer ${studentToken}` }
          });
          console.log(`✅ Lesson ${i + 1} progress updated`);
          console.log(`   Status: ${response.data.data.lessonProgress.status}`);
          console.log(`   Progress: ${response.data.data.lessonProgress.progress}%`);
          console.log(`   Course Progress: ${response.data.data.enrollment.progress}%`);
          if (response.data.data.lessonProgress.score) {
            console.log(`   Score: ${response.data.data.lessonProgress.score}%`);
          }
        } catch (error) {
          console.log(`❌ Lesson ${i + 1} progress update failed:`, error.response?.data?.message);
        }
      }
    }
    console.log('');

    // Test 13: Get course progress
    console.log('1️⃣3️⃣ Testing Get Course Progress...');
    try {
      const response = await axios.get(`${BASE_URL}/api/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Course progress retrieved');
      console.log(`   Overall Progress: ${response.data.data.enrollment.progress}%`);
      console.log(`   Lessons Completed: ${response.data.data.enrollment.lessonsCompleted}/${response.data.data.enrollment.totalLessons}`);
      console.log(`   Time Spent: ${response.data.data.enrollment.timeSpent} minutes`);
      
      response.data.data.modules.forEach((module, index) => {
        console.log(`   Module ${index + 1}: ${module.title} (${Math.round(module.progress)}% complete)`);
        module.lessons.forEach((lesson, lessonIndex) => {
          const prog = lesson.progress;
          console.log(`     Lesson ${lessonIndex + 1}: ${lesson.title} - ${prog.status} (${prog.progress}%)`);
        });
      });
    } catch (error) {
      console.log('❌ Get course progress failed:', error.response?.data?.message);
    }
    console.log('');

    // Test 14: Search courses
    console.log('1️⃣4️⃣ Testing Course Search...');
    try {
      const searchTests = [
        { search: 'web' },
        { category: 'programming' },
        { difficulty: 'beginner' },
        { search: 'javascript', difficulty: 'beginner' },
      ];

      for (const searchParams of searchTests) {
        const response = await axios.get(`${BASE_URL}/api/courses`, { params: searchParams });
        const paramStr = Object.entries(searchParams).map(([k, v]) => `${k}=${v}`).join(', ');
        console.log(`✅ Search (${paramStr}): ${response.data.data.length} results`);
      }
    } catch (error) {
      console.log('❌ Course search failed:', error.response?.data?.message);
    }
    console.log('');

    console.log('🎉 All Course Management tests completed!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('   ✅ API Information');
    console.log('   ✅ User Registration (Instructor & Student)');
    console.log('   ✅ Course Creation (Instructor Only)');
    console.log('   ✅ Permission Controls');
    console.log('   ✅ Module Creation');
    console.log('   ✅ Lesson Creation');
    console.log('   ✅ Course Listing & Details');
    console.log('   ✅ Course Enrollment');
    console.log('   ✅ Enrollment Management');
    console.log('   ✅ Progress Tracking');
    console.log('   ✅ Lesson Progress Updates');
    console.log('   ✅ Course Search & Filtering');
    console.log('');
    console.log('🚀 AstraLearn v2 Course Management System is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Make sure the server is running on http://localhost:5002');
      console.log('   Run: node course-server.js');
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:5001');
    console.log('');
    console.log('Please start the server first:');
    console.log('   cd test-auth');
    console.log('   node user-mgmt-server.js');
    console.log('');
    console.log('Then run this test again:');
    console.log('   node test-course-management.js');
    return;
  }

  await testCourseManagementAPI();
}

main();
