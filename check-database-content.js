// Check Database for Courses and Lessons
const axios = require('axios');

async function checkDatabaseContent() {
  console.log('🔍 Checking Database for Courses and Lessons...\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  try {
    // Step 1: Login
    console.log('1. 🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.tokens.accessToken;
    console.log('✅ Authentication successful');
    
    // Step 2: Check if there are any courses available
    console.log('\n2. 📚 Checking available courses...');
    
    try {
      const coursesResponse = await axios.get(`${API_BASE}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (coursesResponse.data.length > 0) {
        console.log(`✅ Found ${coursesResponse.data.length} courses:`);
        coursesResponse.data.forEach((course, index) => {
          console.log(`  ${index + 1}. ${course.title} (ID: ${course._id || course.id})`);
        });
        
        // Test with first course
        const firstCourse = coursesResponse.data[0];
        console.log(`\n🎯 Testing with course: ${firstCourse.title}`);
        
        // Check lessons for this course
        try {
          const lessonsResponse = await axios.get(`${API_BASE}/courses/${firstCourse._id || firstCourse.id}/lessons`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (lessonsResponse.data.length > 0) {
            console.log(`✅ Found ${lessonsResponse.data.length} lessons:`);
            lessonsResponse.data.slice(0, 3).forEach((lesson, index) => {
              console.log(`  ${index + 1}. ${lesson.title} (ID: ${lesson._id || lesson.id})`);
            });
            
            // Test AI chat with real course/lesson data
            const firstLesson = lessonsResponse.data[0];
            console.log(`\n🤖 Testing AI chat with real data:`);
            console.log(`   Course: ${firstCourse.title}`);
            console.log(`   Lesson: ${firstLesson.title}`);
            
            const aiResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
              content: 'Can you help me with this lesson?',
              context: {
                courseId: firstCourse._id || firstCourse.id,
                lessonId: firstLesson._id || firstLesson.id
              },
              timestamp: new Date().toISOString()
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('\n📊 AI Response with Real Data:');
            console.log('Success:', aiResponse.data.success);
            console.log('Context quality score:', aiResponse.data.metadata?.contextQuality?.score);
            
            const response = aiResponse.data.response?.reply || '';
            const templateVars = response.match(/\{[^}]+\}/g);
            
            if (templateVars) {
              console.log('❌ Still has template variables:', templateVars);
            } else {
              console.log('✅ Template variables properly replaced');
            }
            
            console.log('\nFirst 300 chars of response:');
            console.log(response.substring(0, 300) + '...');
            
          } else {
            console.log('⚠️ No lessons found for this course');
          }
          
        } catch (lessonError) {
          console.log('⚠️ Could not fetch lessons:', lessonError.response?.status || lessonError.message);
        }
        
      } else {
        console.log('⚠️ No courses found in database');
      }
      
    } catch (courseError) {
      console.log('⚠️ Could not fetch courses:', courseError.response?.status || courseError.message);
    }
    
    // Step 3: Create sample course/lesson for testing
    console.log('\n3. 📝 Creating sample course for testing...');
    
    try {
      const sampleCourse = {
        title: 'AI Fundamentals Demo',
        description: 'A sample course for testing AI features',
        category: 'Technology',
        difficulty: 'beginner',
        objectives: ['Understand AI basics', 'Learn machine learning concepts'],
        tags: ['ai', 'technology', 'beginner']
      };
      
      const courseCreateResponse = await axios.post(`${API_BASE}/courses`, sampleCourse, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`✅ Created sample course: ${courseCreateResponse.data.title} (ID: ${courseCreateResponse.data._id})`);
      
      // Test AI chat with newly created course
      const testResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
        content: 'Hello, I need help with this course',
        context: {
          courseId: courseCreateResponse.data._id
        },
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('\n🎯 AI Response with Sample Course:');
      console.log('Context quality score:', testResponse.data.metadata?.contextQuality?.score);
      
      const testResponseText = testResponse.data.response?.reply || '';
      const testTemplateVars = testResponseText.match(/\{[^}]+\}/g);
      
      if (testTemplateVars) {
        console.log('❌ Still has template variables:', testTemplateVars);
      } else {
        console.log('✅ Template variables properly replaced with sample course');
      }
      
    } catch (createError) {
      console.log('⚠️ Could not create sample course:', createError.response?.status || createError.message);
    }
    
  } catch (error) {
    console.log('❌ Check failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// Run check
checkDatabaseContent().catch(console.error);
