#!/usr/bin/env node

/**
 * Real AI Response Test
 * Tests if AI gives contextual vs generic responses
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testContextualResponses() {
  console.log('🧪 Testing AI Contextual Response Quality...\n');

  const tests = [
    {
      name: 'Flutter Course Question',
      message: "What is this course about?",
      context: {
        user: {
          user_name: "Alice",
          learning_style: "visual"
        },
        course: {
          course_title: "Mobile App Development with Flutter",
          course_description: "Learn to build cross-platform mobile apps using Flutter framework",
          course_category: "Mobile Development"
        },
        lesson: {
          lesson_title: "Introduction to Flutter Widgets",
          lesson_number: 1
        }
      }
    },
    {
      name: 'Python Data Science Question',
      message: "What is this course about?",
      context: {
        user: {
          user_name: "Alice",
          learning_style: "visual"
        },
        course: {
          course_title: "Python for Data Science", 
          course_description: "Master data analysis, visualization, and machine learning with Python",
          course_category: "Data Science"
        },
        lesson: {
          lesson_title: "Pandas Data Manipulation",
          lesson_number: 3
        }
      }
    },
    {
      name: 'JavaScript Question',
      message: "Explain variables to me",
      context: {
        user: {
          user_name: "Alice",
          learning_style: "visual"
        },
        course: {
          course_title: "JavaScript Fundamentals",
          course_description: "Learn JavaScript programming from basics to advanced concepts",
          course_category: "Web Development"
        },
        lesson: {
          lesson_title: "Variables and Data Types",
          lesson_number: 2
        }
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n🔍 Test: ${test.name}`);
    console.log(`❓ Question: "${test.message}"`);
    console.log(`📚 Course: ${test.context.course.course_title}`);

    try {
      const response = await fetch(`${BASE_URL}/ai/orchestrated/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: test.message,
          context: test.context
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const reply = data.response?.reply || data.reply || 'No reply found';
        
        // Check if response mentions the specific course
        const mentionsCourse = reply.toLowerCase().includes(test.context.course.course_title.toLowerCase());
        const mentionsLesson = reply.toLowerCase().includes(test.context.lesson.lesson_title.toLowerCase());
        const isFallback = reply.includes('experiencing some technical difficulties') || 
                          reply.includes('temporarily unavailable');
        
        console.log(`✅ Response received (${reply.length} chars)`);
        console.log(`🎯 Course-specific: ${mentionsCourse ? '✅' : '❌'}`);
        console.log(`📖 Lesson-aware: ${mentionsLesson ? '✅' : '❌'}`);
        console.log(`🤖 AI-generated: ${!isFallback ? '✅' : '❌'}`);
        console.log(`📝 Preview: "${reply.substring(0, 150)}..."`);
        
        if (data.metadata) {
          console.log(`⚙️ Model used: ${data.metadata.model || 'Unknown'}`);
        }
        
      } else {
        console.log(`❌ Error: ${response.status} - ${data.error || data.message}`);
      }

    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log('✅ If responses mention specific courses/lessons = AI is context-aware');
  console.log('❌ If responses are generic = Context not being processed correctly');
  console.log('🤖 If no fallback messages = Groq API is working properly');
}

testContextualResponses().catch(console.error);
