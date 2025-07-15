#!/usr/bin/env node

/**
 * Debug Prompt Building
 * Shows what prompt is actually being sent to AI
 */

import dotenv from 'dotenv';
import promptTemplates from './src/services/promptTemplates.js';

dotenv.config();

async function debugPromptBuilding() {
  console.log('🔍 Debugging Prompt Building Process...\n');

  const testContext = {
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
  };

  const testMessage = "What is this course about?";

  console.log('📊 Input Context:');
  console.log(JSON.stringify(testContext, null, 2));

  console.log('\n🔧 Building Context-Aware Prompt...');
  
  try {
    const fullPrompt = promptTemplates.buildContextAwarePrompt(testMessage, testContext);
    
    console.log('\n📝 Generated Prompt:');
    console.log('='.repeat(80));
    console.log(fullPrompt);
    console.log('='.repeat(80));

    // Check if specific course data appears in the prompt
    const promptLower = fullPrompt.toLowerCase();
    const courseMentioned = promptLower.includes('mobile app development with flutter');
    const lessonMentioned = promptLower.includes('introduction to flutter widgets');
    const hasPlaceholders = fullPrompt.includes('[') && fullPrompt.includes('not specified]');

    console.log('\n🔍 Prompt Analysis:');
    console.log(`✅ Course mentioned: ${courseMentioned ? '✅' : '❌'}`);
    console.log(`✅ Lesson mentioned: ${lessonMentioned ? '✅' : '❌'}`);
    console.log(`❌ Has placeholders: ${hasPlaceholders ? '⚠️  YES' : '✅ NO'}`);

    if (hasPlaceholders) {
      console.log('\n⚠️  Placeholder Analysis:');
      const placeholders = fullPrompt.match(/\[[^\]]+not specified\]/g);
      if (placeholders) {
        placeholders.forEach(placeholder => {
          console.log(`   - ${placeholder}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error building prompt:', error.message);
  }
}

debugPromptBuilding().catch(console.error);
