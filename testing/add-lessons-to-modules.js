const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

// Simple models
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
}, { timestamps: true });

const moduleSchema = new mongoose.Schema({
  title: String,
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
}, { timestamps: true });

const lessonSchema = new mongoose.Schema({
  title: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  content: {
    type: String,
    data: String
  },
  position: Number
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
const Module = mongoose.model('Module', moduleSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

async function addLessonsToExistingModules() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/astralearn');
    console.log('✅ Connected to MongoDB');    // Find the JavaScript course and its modules
    const jsCourse = await Course.findOne({ title: { $regex: 'JavaScript', $options: 'i' } }).populate('modules');
    
    if (!jsCourse) {
      console.log('❌ JavaScript course not found');
      return;
    }

    console.log(`📋 Found course: ${jsCourse.title}`);
    console.log(`📚 Course has ${jsCourse.modules.length} modules`);

    if (jsCourse.modules.length === 0) {
      console.log('❌ No modules found in the course');
      return;
    }

    // Check if lessons already exist
    const existingLessons = await Lesson.find({ courseId: jsCourse._id });
    if (existingLessons.length > 0) {
      console.log(`✅ Course already has ${existingLessons.length} lessons`);
      return;
    }

    // Add lessons to the first module
    const module1 = jsCourse.modules[0];
    console.log(`📖 Adding lessons to module: ${module1.title}`);
    
    const lesson1 = new Lesson({
      title: 'Welcome and Overview',
      courseId: jsCourse._id,
      moduleId: module1._id,
      content: {
        type: 'text',
        data: 'Welcome to JavaScript Fundamentals! In this lesson, we will cover the basics of JavaScript and what you can expect to learn throughout this course.'
      },
      position: 1
    });
    await lesson1.save();

    const lesson2 = new Lesson({
      title: 'Setting Up Your Environment',
      courseId: jsCourse._id,
      moduleId: module1._id,
      content: {
        type: 'text',
        data: 'Let\'s set up your JavaScript development environment. We\'ll cover installing a code editor, setting up Node.js, and running your first JavaScript program.'
      },
      position: 2
    });
    await lesson2.save();

    // Add lessons to the second module if it exists
    if (jsCourse.modules.length > 1) {
      const module2 = jsCourse.modules[1];
      console.log(`📖 Adding lessons to module: ${module2.title}`);
      
      const lesson3 = new Lesson({
        title: 'Variables and Data Types',
        courseId: jsCourse._id,
        moduleId: module2._id,
        content: {
          type: 'text',
          data: 'In this lesson, we dive deep into JavaScript variables, data types, and how to declare and use them effectively in your programs.'
        },
        position: 1
      });
      await lesson3.save();

      const lesson4 = new Lesson({
        title: 'Functions and Scope',
        courseId: jsCourse._id,
        moduleId: module2._id,
        content: {
          type: 'text',
          data: 'Learn about JavaScript functions, how to create them, pass parameters, return values, and understand function scope and closures.'
        },
        position: 2
      });
      await lesson4.save();
    }

    console.log('✅ Successfully added lessons to JavaScript course!');
    console.log(`📚 Added 4 lessons to "${jsCourse.title}"`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addLessonsToExistingModules();
