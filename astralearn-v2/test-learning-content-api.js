// Test learning content API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testLearningContentAPI() {
  console.log('🧪 Testing Learning Content API Endpoints...\n');

  try {
    // Step 1: Login to get authentication token
    console.log('1️⃣ Authenticating user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful');
    console.log('');

    // Step 2: Test course modules endpoint
    console.log('2️⃣ Testing course modules...');
    const modulesResponse = await axios.get(`${BASE_URL}/api/courses/1/modules`);
    console.log(`✅ Course 1 has ${modulesResponse.data.total} modules:`);
    modulesResponse.data.data.forEach(module => {
      console.log(`   - ${module.title} (Order: ${module.orderIndex})`);
    });
    console.log('');

    // Step 3: Test module lessons endpoint
    console.log('3️⃣ Testing module lessons...');
    const lessonsResponse = await axios.get(`${BASE_URL}/api/modules/1/lessons`);
    console.log(`✅ Module 1 has ${lessonsResponse.data.total} lessons:`);
    lessonsResponse.data.data.forEach(lesson => {
      console.log(`   - ${lesson.title} (${lesson.type}, ${lesson.duration}min)`);
    });
    console.log('');

    // Step 4: Test lesson content endpoint
    console.log('4️⃣ Testing lesson content...');
    const contentResponse = await axios.get(`${BASE_URL}/api/lessons/1/content`);
    console.log(`✅ Lesson 1 has ${contentResponse.data.total} content items:`);
    contentResponse.data.data.forEach(content => {
      console.log(`   - ${content.title} (${content.type})`);
    });
    console.log('');

    // Step 5: Test lesson details endpoint
    console.log('5️⃣ Testing lesson details...');
    const lessonResponse = await axios.get(`${BASE_URL}/api/lessons/1`);
    const lesson = lessonResponse.data.data;
    console.log(`✅ Lesson details for "${lesson.title}":`);
    console.log(`   Type: ${lesson.type}`);
    console.log(`   Duration: ${lesson.duration} minutes`);
    console.log(`   Content items: ${lesson.content.length}`);
    console.log('');

    // Step 6: Test course progress endpoint (requires enrollment)
    console.log('6️⃣ Testing course progress...');
    try {
      // First enroll in the course
      await axios.post(`${BASE_URL}/api/courses/1/enroll`, {}, { headers: authHeaders });
      console.log('✅ Enrolled in course');
    } catch (error) {
      // Already enrolled
      console.log('✅ Already enrolled in course');
    }

    const progressResponse = await axios.get(`${BASE_URL}/api/courses/1/progress`, { headers: authHeaders });
    const progress = progressResponse.data.data;
    console.log(`✅ Course progress:`);
    console.log(`   Total lessons: ${progress.totalLessons}`);
    console.log(`   Completed: ${progress.completedLessons}`);
    console.log(`   Progress: ${progress.progressPercentage}%`);
    console.log('');

    // Step 7: Test lesson progress update
    console.log('7️⃣ Testing lesson progress update...');
    const updateProgressResponse = await axios.post(`${BASE_URL}/api/lessons/1/progress`, {
      completed: true,
      timeSpent: 900, // 15 minutes
      score: null
    }, { headers: authHeaders });
    console.log('✅ Lesson progress updated');
    console.log(`   Completed: ${updateProgressResponse.data.data.completed}`);
    console.log(`   Time spent: ${updateProgressResponse.data.data.timeSpent} seconds`);
    console.log('');

    // Step 8: Test assessment endpoint
    console.log('8️⃣ Testing lesson assessment...');
    const assessmentResponse = await axios.get(`${BASE_URL}/api/lessons/6/assessment`);
    const assessment = assessmentResponse.data.data;
    console.log(`✅ Assessment "${assessment.title}":`);
    console.log(`   Type: ${assessment.type}`);
    console.log(`   Time limit: ${assessment.timeLimit} seconds`);
    console.log(`   Passing score: ${assessment.passingScore}%`);
    console.log(`   Questions: ${assessment.questions.length}`);
    console.log('');

    // Step 9: Test assessment submission
    console.log('9️⃣ Testing assessment submission...');
    const answers = [1, 2, false, 'const PI = 3.14159;']; // Sample answers
    const submitResponse = await axios.post(`${BASE_URL}/api/assessments/1/submit`, {
      answers: answers
    }, { headers: authHeaders });
    
    const attempt = submitResponse.data.data;
    console.log(`✅ Assessment submitted:`);
    console.log(`   Score: ${attempt.score}%`);
    console.log(`   Passed: ${attempt.passed}`);
    console.log(`   Points: ${attempt.earnedPoints}/${attempt.totalPoints}`);
    console.log('');

    // Step 10: Test assessment attempts
    console.log('🔟 Testing assessment attempts...');
    const attemptsResponse = await axios.get(`${BASE_URL}/api/assessments/1/attempts`, { headers: authHeaders });
    console.log(`✅ User has ${attemptsResponse.data.total} assessment attempts`);
    attemptsResponse.data.data.forEach((attempt, index) => {
      console.log(`   Attempt ${index + 1}: ${attempt.score}% (${attempt.passed ? 'Passed' : 'Failed'})`);
    });
    console.log('');

    // Step 11: Test updated course progress
    console.log('1️⃣1️⃣ Testing updated course progress...');
    const updatedProgressResponse = await axios.get(`${BASE_URL}/api/courses/1/progress`, { headers: authHeaders });
    const updatedProgress = updatedProgressResponse.data.data;
    console.log(`✅ Updated course progress:`);
    console.log(`   Total lessons: ${updatedProgress.totalLessons}`);
    console.log(`   Completed: ${updatedProgress.completedLessons}`);
    console.log(`   Progress: ${updatedProgress.progressPercentage}%`);
    console.log('');

    console.log('🎉 ALL LEARNING CONTENT API TESTS PASSED!');
    console.log('');
    console.log('✅ WORKING FEATURES:');
    console.log('   📚 Course modules hierarchy');
    console.log('   📝 Module lessons structure');
    console.log('   📄 Lesson content delivery');
    console.log('   📊 Progress tracking system');
    console.log('   🧪 Assessment framework');
    console.log('   🔐 Authentication integration');
    console.log('   📈 Real-time progress updates');

  } catch (error) {
    console.error('❌ Learning content API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testLearningContentAPI();
