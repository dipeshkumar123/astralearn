#!/usr/bin/env node

/**
 * Debug Context Data Flow
 * Tests what context data is actually reaching the AI service
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function debugContextFlow() {
  console.log('🔍 Debugging Context Data Flow...\n');

  const testContext = {
    user: {
      user_name: "Alice",
      learning_style: "visual"
    },
    course: {
      course_title: "Mobile App Development with Flutter",
      course_description: "Learn to build cross-platform mobile apps using Flutter framework",
      course_category: "Mobile Development",
      title: "Mobile App Development with Flutter", // Alternative format
      description: "Learn to build cross-platform mobile apps using Flutter framework",
      category: "Mobile Development"
    },
    lesson: {
      lesson_title: "Introduction to Flutter Widgets",
      lesson_number: 1,
      title: "Introduction to Flutter Widgets", // Alternative format
      number: 1
    }
  };

  console.log('📤 Sending Context Data:');
  console.log(JSON.stringify(testContext, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/ai/orchestrated/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: "What is this course about? Please tell me the exact course title and description.",
        context: testContext
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      const reply = data.response?.reply || data.reply || 'No reply found';
      
      console.log('\n📥 Received Response:');
      console.log('Full Reply:', reply);
      
      // Check if the AI mentions the specific course details
      const mentionsFlutter = reply.toLowerCase().includes('flutter');
      const mentionsMobileApp = reply.toLowerCase().includes('mobile app');
      const mentionsCourseTitle = reply.toLowerCase().includes('mobile app development with flutter');
      
      console.log('\n🔍 Context Analysis:');
      console.log(`Mentions Flutter: ${mentionsFlutter ? '✅' : '❌'}`);
      console.log(`Mentions Mobile App: ${mentionsMobileApp ? '✅' : '❌'}`);
      console.log(`Mentions Full Course Title: ${mentionsCourseTitle ? '✅' : '❌'}`);
      
      if (data.metadata) {
        console.log('\n📊 Metadata:', JSON.stringify(data.metadata, null, 2));
      }
      
    } else {
      console.log(`❌ Error: ${response.status} - ${data.error || data.message}`);
    }

  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  // Test direct AI service call to compare
  console.log('\n\n🔍 Testing Direct AI Service Call for Comparison...');
  
  try {
    const directResponse = await fetch(`${BASE_URL}/ai/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Test message"
      })
    });

    const directData = await directResponse.json();
    
    if (directResponse.ok) {
      console.log('✅ Direct AI Service Response Preview:');
      console.log(directData.response.substring(0, 200) + '...');
    }
  } catch (error) {
    console.log(`❌ Direct test failed: ${error.message}`);
  }
}

debugContextFlow().catch(console.error);
