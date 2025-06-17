// Test Database Context - Check if course/lesson data exists
const axios = require('axios');

async function testDatabaseContext() {
  console.log('🔍 Testing Database Context and Data Availability\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  try {
    // Step 1: Login
    console.log('1. 🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.tokens.accessToken;
    const user = loginResponse.data.user;
    console.log(`✅ Authenticated as: ${user.firstName} ${user.lastName}`);
      // Step 2: Check available courses
    console.log('\n2. 📚 Checking available courses...');
    let coursesResponse;
    try {
      coursesResponse = await axios.get(`${API_BASE}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`✅ Found ${coursesResponse.data.length || 0} courses`);
      if (coursesResponse.data.length > 0) {
        const firstCourse = coursesResponse.data[0];
        console.log(`📖 First course: ${firstCourse.title} (ID: ${firstCourse._id})`);
        
        // Try to get lessons for this course
        try {
          const lessonsResponse = await axios.get(`${API_BASE}/courses/${firstCourse._id}/lessons`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`📋 Found ${lessonsResponse.data.length || 0} lessons in this course`);
          if (lessonsResponse.data.length > 0) {
            const firstLesson = lessonsResponse.data[0];
            console.log(`📝 First lesson: ${firstLesson.title} (ID: ${firstLesson._id})`);
            
            // Test AI chat with real course/lesson IDs
            console.log('\n3. 🤖 Testing AI Chat with Real Course/Lesson Data...');
            
            const aiResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
              content: 'Can you help me understand this lesson?',
              context: {
                page: 'lesson',
                timestamp: new Date().toISOString()
              },
              courseId: firstCourse._id,
              lessonId: firstLesson._id,
              timestamp: new Date().toISOString()
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            const responseText = aiResponse.data.response?.reply || aiResponse.data.reply;
            console.log('\n📝 AI Response with Real Data:');
            console.log('━'.repeat(80));
            console.log(responseText);
            console.log('━'.repeat(80));
            
            // Check context integration
            console.log('\n🔍 Context Integration Check:');
            console.log(`  • Mentions course: ${responseText.includes(firstCourse.title) ? '✅' : '❌'}`);
            console.log(`  • Mentions lesson: ${responseText.includes(firstLesson.title) ? '✅' : '❌'}`);
            console.log(`  • Has real course title: ${responseText.includes('your course') ? '❌' : '✅'}`);
            console.log(`  • Has real lesson title: ${responseText.includes('the current lesson') ? '❌' : '✅'}`);
            
          } else {
            console.log('⚠️  No lessons found - will test with mock data');
          }
        } catch (lessonError) {
          console.log('⚠️  Could not fetch lessons:', lessonError.response?.status || lessonError.message);
        }
        
      } else {
        console.log('⚠️  No courses found in database');
      }    } catch (courseError) {
      console.log('⚠️  Could not fetch courses:', courseError.response?.status || courseError.message);
      coursesResponse = { data: [] }; // Set empty array for further logic
    }
    
    // Step 3: Create test course/lesson if none exist
    if (!coursesResponse || coursesResponse.data.length === 0) {
      console.log('\n4. 🏗️  Creating test course and lesson...');
      
      try {
        // Create test course
        const newCourse = await axios.post(`${API_BASE}/courses`, {
          title: 'Introduction to Web Development',
          description: 'Learn the basics of web development including HTML, CSS, and JavaScript',
          category: 'Programming',
          difficulty: 'beginner',
          estimatedDuration: 40,
          objectives: [
            'Understand HTML structure and syntax',
            'Learn CSS styling and layout',
            'Get introduced to JavaScript basics'
          ],
          tags: ['html', 'css', 'javascript', 'web-development'],
          isPublished: true
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`✅ Created course: ${newCourse.data.title} (ID: ${newCourse.data._id})`);
        
        // Create test lesson
        const newLesson = await axios.post(`${API_BASE}/courses/${newCourse.data._id}/lessons`, {
          title: 'Getting Started with HTML',
          content: {
            type: 'text',
            data: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages.',
            duration: 30
          },
          objectives: [
            'Understand what HTML is',
            'Learn basic HTML tags',
            'Create your first HTML document'
          ],
          position: 1,
          keyTopics: ['HTML', 'markup', 'tags', 'elements'],
          contentSummary: 'Introduction to HTML basics and creating simple web pages',
          difficulty: 'beginner',
          prerequisites: ['Basic computer skills'],
          isPublished: true
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`✅ Created lesson: ${newLesson.data.title} (ID: ${newLesson.data._id})`);
        
        // Test AI chat with new course/lesson
        console.log('\n5. 🤖 Testing AI Chat with New Course/Lesson...');
        
        const aiResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
          content: 'Can you help me get started with this lesson?',
          context: {
            page: 'lesson',
            timestamp: new Date().toISOString()
          },
          courseId: newCourse.data._id,
          lessonId: newLesson.data._id,
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const responseText = aiResponse.data.response?.reply || aiResponse.data.reply;
        console.log('\n📝 AI Response with New Data:');
        console.log('━'.repeat(80));
        console.log(responseText);
        console.log('━'.repeat(80));
        
        // Check context integration
        console.log('\n🔍 Context Integration Check:');
        console.log(`  • Mentions course: ${responseText.includes('Web Development') ? '✅' : '❌'}`);
        console.log(`  • Mentions lesson: ${responseText.includes('HTML') ? '✅' : '❌'}`);
        console.log(`  • Has real course title: ${responseText.includes('your course') ? '❌' : '✅'}`);
        console.log(`  • Has real lesson title: ${responseText.includes('the current lesson') ? '❌' : '✅'}`);
        
      } catch (createError) {
        console.log('❌ Failed to create test data:', createError.response?.data || createError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testDatabaseContext().catch(console.error);
