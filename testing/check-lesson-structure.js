const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

async function checkLessonStructure() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/astralearn');
    console.log('✅ Connected to MongoDB');

    // Get all lessons
    const lessons = await mongoose.connection.db.collection('lessons').find({}).toArray();
    
    console.log(`📚 Found ${lessons.length} lessons:`);
    lessons.forEach((lesson, index) => {
      console.log(`\n   ${index + 1}. ${lesson.title}`);
      console.log(`      _id: ${lesson._id}`);
      console.log(`      moduleId: ${lesson.moduleId}`);
      console.log(`      module: ${lesson.module}`);
      console.log(`      courseId: ${lesson.courseId}`);
      console.log(`      course: ${lesson.course}`);
    });
    
    // Get module IDs for comparison
    console.log('\n📋 Module IDs:');
    const modules = await mongoose.connection.db.collection('modules').find({}).toArray();
    modules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title}: ${module._id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkLessonStructure();
