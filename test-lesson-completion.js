// Test script for lesson completion functionality
const mongoose = require('mongoose');

// Simple test schemas  
const UserProgressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  lessonId: mongoose.Schema.Types.ObjectId,
  progressType: String,
  progressData: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  role: String
});

const CourseSchema = new mongoose.Schema({
  title: String
});

const LessonSchema = new mongoose.Schema({
  title: String,
  courseId: mongoose.Schema.Types.ObjectId,
  moduleId: mongoose.Schema.Types.ObjectId,
  position: Number
});

async function testLessonCompletion() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect('mongodb://127.0.0.1:27017/astralearn');

    const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
    const User = mongoose.model('User', UserSchema);
    const Course = mongoose.model('Course', CourseSchema);
    const Lesson = mongoose.model('Lesson', LessonSchema);

    // Find a test user
    const user = await User.findOne({ email: 'alice@example.com' });
    if (!user) {
      console.log('❌ No test user found');
      return;
    }
    console.log('✅ Found user:', user.firstName, user.lastName);

    // Find a test course
    const course = await Course.findOne().lean();
    if (!course) {
      console.log('❌ No test course found');
      return;
    }
    console.log('✅ Found course:', course.title);

    // Find a lesson for this course
    const lesson = await Lesson.findOne({ courseId: course._id }).lean();
    if (!lesson) {
      console.log('❌ No test lesson found');
      return;
    }
    console.log('✅ Found lesson:', lesson.title);

    // Check current progress
    const existingProgress = await UserProgress.find({
      userId: user._id,
      courseId: course._id,
      progressType: 'lesson_complete'
    });
    console.log('📊 Existing lesson completions:', existingProgress.length);

    // Create a lesson completion record (simulating API call)
    const lessonCompletion = new UserProgress({
      userId: user._id,
      courseId: course._id,
      lessonId: lesson._id,
      progressType: 'lesson_complete',
      progressData: {
        moduleIndex: 0,
        lessonIndex: lesson.position - 1, // positions are 1-based
        completed: true,
        timeSpent: 300,
        completedAt: new Date()
      }
    });

    await lessonCompletion.save();
    console.log('✅ Created lesson completion record');

    // Check updated progress
    const updatedProgress = await UserProgress.find({
      userId: user._id,
      courseId: course._id,
      progressType: 'lesson_complete'
    });
    console.log('📊 Updated lesson completions:', updatedProgress.length);

    // Test the course progress API endpoint format
    const allProgress = await UserProgress.find({
      userId: user._id,
      courseId: course._id
    }).sort({ timestamp: -1 });

    console.log('📋 All progress records:');
    allProgress.forEach(record => {
      console.log(`  - ${record.progressType}: ${record.progressData?.completed ? 'COMPLETED' : 'IN_PROGRESS'} ${record.lessonId ? '(Lesson: ' + record.lessonId + ')' : ''}`);
    });

    // Simulate what the /courses/:id/progress endpoint would return
    const lessonProgress = allProgress.filter(p => 
      (p.progressType === 'lesson_complete' || p.progressType === 'lesson_start') && p.lessonId
    );

    console.log('📊 Lesson progress (what API would return):');
    lessonProgress.forEach(progress => {
      console.log(`  - Lesson ${progress.lessonId}: ${progress.progressData?.completed ? 'COMPLETED' : 'STARTED'} at ${progress.timestamp}`);
    });

    console.log('✅ Test completed successfully');
    console.log(`\n🎯 Key findings:`);
    console.log(`   - User ID: ${user._id}`);
    console.log(`   - Course ID: ${course._id}`);
    console.log(`   - Lesson ID: ${lesson._id}`);
    console.log(`   - Total lesson completions: ${lessonProgress.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testLessonCompletion();
