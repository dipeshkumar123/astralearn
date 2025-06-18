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
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
}, { timestamps: true });

const lessonSchema = new mongoose.Schema({
  title: String,
  content: String,
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  order: Number
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
const Module = mongoose.model('Module', moduleSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

async function seedCourseContent() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/astralearn');
    console.log('✅ Connected to MongoDB');

    // Find an existing course
    const course = await Course.findOne();
    if (!course) {
      console.log('❌ No courses found. Creating a sample course...');
      const newCourse = new Course({
        title: 'Sample Course',
        description: 'A sample course for testing'
      });
      await newCourse.save();
      console.log('✅ Created sample course');
      return;
    }

    console.log(`📋 Found course: ${course.title}`);

    // Check if course already has modules
    const existingModules = await Module.find({ course: course._id });
    if (existingModules.length > 0) {
      console.log(`✅ Course already has ${existingModules.length} modules`);
      return;
    }

    // Create modules
    console.log('📚 Creating modules...');
    const module1 = new Module({
      title: 'Introduction and Setup',
      description: 'Getting started with the course',
      course: course._id
    });
    await module1.save();

    const module2 = new Module({
      title: 'Core Concepts',
      description: 'Essential concepts and fundamentals',
      course: course._id
    });
    await module2.save();

    // Create lessons for module 1
    console.log('📖 Creating lessons for module 1...');    const lesson1 = new Lesson({
      title: 'Welcome and Overview',
      content: 'Welcome to this course! In this lesson, we will cover the basics and what you can expect to learn.',
      moduleId: module1._id,
      order: 1
    });
    await lesson1.save();

    const lesson2 = new Lesson({
      title: 'Setting Up Your Environment',
      content: 'Let\'s set up your development environment. Follow these steps to get everything ready.',
      moduleId: module1._id,
      order: 2
    });
    await lesson2.save();

    // Create lessons for module 2
    console.log('📖 Creating lessons for module 2...');    const lesson3 = new Lesson({
      title: 'Understanding the Fundamentals',
      content: 'In this lesson, we dive deep into the core concepts that form the foundation of this subject.',
      moduleId: module2._id,
      order: 1
    });
    await lesson3.save();

    const lesson4 = new Lesson({
      title: 'Practical Applications',
      content: 'Now let\'s apply what we\'ve learned with some practical examples and exercises.',
      moduleId: module2._id,
      order: 2
    });
    await lesson4.save();    // Update modules with lessons - remove this part since Module doesn't have lessons array
    // module1.lessons = [lesson1._id, lesson2._id];
    // await module1.save();

    // module2.lessons = [lesson3._id, lesson4._id];
    // await module2.save();

    // Update course with modules
    course.modules = [module1._id, module2._id];
    await course.save();

    console.log('✅ Successfully added course content!');
    console.log(`📚 Added 2 modules with 4 lessons to "${course.title}"`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedCourseContent();
