import { Router } from 'express';
import mongoose from 'mongoose';
import { Course, User, UserProgress } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';
import { flexibleAuthenticate, flexibleAuthorize } from '../middleware/devAuth.js';
import { awardLessonPoints } from '../middleware/gamificationMiddleware.js';

const router = Router();

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, difficulty } = req.query;
    
    // Build query filters
    const filters = { isPublished: true };
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (difficulty) {
      filters.difficulty = difficulty;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const courses = await Course.find(filters)
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(filters);

    res.json({
      courses,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
    hasNext: skip + courses.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check endpoint - must be before /:id route
router.get('/health', async (req, res) => {
  try {
    const Course = (await import('../models/Course.js')).Course;
    const courseCount = await Course.countDocuments();
    
    res.json({
      status: 'operational',
      service: 'Courses API',
      version: '3.1.0',
      statistics: {
        totalCourses: courseCount,
        timestamp: new Date()
      },
      endpoints: {
        list: 'GET /',
        getById: 'GET /:id',
        create: 'POST /',
        update: 'PUT /:id',
        delete: 'DELETE /:id'
      }
    });

  } catch (error) {
    console.error('Courses health check error:', error);
    res.status(500).json({
      status: 'error',
      service: 'Courses API',
      error: error.message
    });
  }
});

// Get instructor's courses  
router.get('/instructor', flexibleAuthenticate, flexibleAuthorize(['instructor', 'admin']), async (req, res) => {
  try {
    const courses = await Course.find({ 
      instructor: req.user._id    })
    .populate('instructor', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Get course ID:', req.params.id);
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email')
      .populate('modules');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }    // Manually populate lessons for each module
    if (course.modules && course.modules.length > 0) {
      const Lesson = mongoose.model('Lesson');
      for (let module of course.modules) {
        const lessons = await Lesson.find({
          $or: [
            { moduleId: module._id },
            { module: module._id }
          ]
        })
          .sort({ position: 1 })
          .select('title content objectives estimatedDuration difficulty position');
        module.lessons = lessons;
      }
    }

    // If user is authenticated, get their progress
    let userProgress = null;
    if (req.user) {
      userProgress = await UserProgress.findOne({
        userId: req.user._id,
        courseId: course._id,
      });
    }

    res.json({
      course,
      userProgress,
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new course (instructor/admin only)
router.post('/', auth, authorize(['instructor', 'admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      objectives,
      prerequisites,
      tags,
    } = req.body;

    const course = new Course({
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      objectives,
      prerequisites,
      tags,
      instructor: req.user?.role === 'instructor' ? req.user._id : undefined,
    });

    await course.save();
    await course.populate('instructor', 'firstName lastName email');

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update course (instructor/admin only)
router.put('/:id', auth, authorize(['instructor', 'admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }    // Check ownership (instructors can only edit their own courses)
    if (req.user?.role === 'instructor' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.assign(course, updates);
    course.updatedAt = new Date();

    await course.save();
    await course.populate('instructor', 'firstName lastName email');

    res.json({
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete course (instructor/admin only)
router.delete('/:id', auth, authorize(['instructor', 'admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }    // Check ownership
    if (req.user?.role === 'instructor' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Enroll in course
router.post('/:id/enroll', flexibleAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Ensure we have a valid course ID string
    const courseId = String(req.params.id);

    // Check if course ID is valid MongoDB ObjectId format
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid course ID format',
        details: 'The provided course ID is not in a valid format'
      });
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: 'Course is not published' });
    }    // Check if already enrolled
    const existingProgress = await UserProgress.findOne({
      userId: req.user._id,
      courseId: course._id,
      progressType: 'enrollment',
    });

    if (existingProgress) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }    // Create user progress record for enrollment
    const userProgress = new UserProgress({
      userId: req.user._id,
      courseId: course._id,
      progressType: 'enrollment',
      progressData: {
        completionPercentage: 0,
        timeSpent: 0
      },
      timestamp: new Date(),
    });

    await userProgress.save();

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    res.status(201).json({
      message: 'Successfully enrolled in course',
      userProgress,
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's enrolled courses
router.get('/my/enrolled', flexibleAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userProgress = await UserProgress.find({ 
      userId: req.user._id,
      progressType: 'enrollment'
    })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructor',
          select: 'firstName lastName email',
        },
      })
      .sort({ timestamp: -1 });

    res.json({
      enrolledCourses: userProgress.map(progress => ({
        ...progress.toObject(),
        course: progress.courseId,
        enrolledAt: progress.timestamp,
      })),
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get courses by instructor ID
router.get('/instructor/:instructorId', flexibleAuthenticate, async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    const courses = await Course.find({ 
      instructor: instructorId 
    })
    .populate('instructor', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get instructor courses by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get course progress
router.get('/:id/progress', flexibleAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id: courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    // Get all progress records for this course and user
    const progressRecords = await UserProgress.find({
      userId: req.user._id,
      courseId
    }).sort({ lastUpdated: -1 });

    // Get overall course progress
    let overallProgress = progressRecords.find(p => 
      p.progressType === 'course' && !p.moduleId && !p.lessonId
    );
    
    // If no course-level progress found, check for enrollment progress with timeSpent/progress
    if (!overallProgress) {
      const enrollmentProgress = progressRecords.find(p => 
        p.progressType === 'enrollment' && 
        (p.progressData?.timeSpent > 0 || p.progressData?.completionPercentage > 0)
      );
      
      if (enrollmentProgress) {
        overallProgress = {
          courseId,
          completionPercentage: enrollmentProgress.progressData?.completionPercentage || 0,
          timeSpent: enrollmentProgress.progressData?.timeSpent || 0,
          completionStatus: enrollmentProgress.progressData?.completionStatus || 'in-progress'
        };
      }
    }

    // Get module-level progress
    const moduleProgress = progressRecords.filter(p => 
      p.progressType === 'module' && p.moduleId && !p.lessonId
    );

    // Get lesson-level progress
    const lessonProgress = progressRecords.filter(p => 
      (p.progressType === 'lesson_complete' || p.progressType === 'lesson_start') && p.lessonId
    );

    // Structure the response
    res.status(200).json({
      success: true,
      progress: {
        overall: overallProgress || {
          courseId,
          completionPercentage: 0,
          timeSpent: 0,
          completionStatus: 'not-started'
        },
        modules: moduleProgress,
        lessons: lessonProgress,
        lastUpdated: progressRecords.length > 0 
          ? progressRecords.reduce((latest, record) => {
              const recordDate = new Date(record.lastUpdated || record.timestamp);
              return recordDate > latest ? recordDate : latest;
            }, new Date(0))
          : null
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark lesson as complete
router.post('/:id/lessons/:lessonId/complete', flexibleAuthenticate, async (req, res, next) => {
  try {
    const { id: courseId, lessonId } = req.params;
    const userId = req.user._id;
    const { moduleIndex, lessonIndex, timeSpent } = req.body;

    // Find or create progress record
    let userProgress = await UserProgress.findOne({
      userId,
      courseId,
      lessonId,
      progressType: 'lesson_complete'
    });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        courseId,
        lessonId,
        progressType: 'lesson_complete',
        progressData: {
          moduleIndex: moduleIndex || 0,
          lessonIndex: lessonIndex || 0,
          completed: true,
          timeSpent: timeSpent || 300,
          completedAt: new Date()
        }
      });
    } else {
      userProgress.progressData.completed = true;
      userProgress.progressData.timeSpent = (userProgress.progressData.timeSpent || 0) + (timeSpent || 300);
      userProgress.progressData.completedAt = new Date();
      userProgress.timestamp = new Date();
    }

    await userProgress.save();

    // Set up gamification data for middleware
    res.locals.activityCompleted = true;
    res.locals.activityData = {
      lessonId,
      lessonTitle: req.body.lessonTitle || 'Lesson',
      timeSpent: timeSpent || 300,
      score: null
    };

    res.json({
      success: true,
      timeSpent: userProgress.progressData.timeSpent,
      completedAt: userProgress.progressData.completedAt
    });

    // Call next to trigger gamification middleware
    next();
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}, awardLessonPoints);

// Submit quiz answers
router.post('/:id/lessons/:lessonId/quiz', flexibleAuthenticate, async (req, res) => {
  try {
    const { id: courseId, lessonId } = req.params;
    const userId = req.user._id;
    const { answers } = req.body;

    // Get the course and lesson to find correct answers
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the lesson with quiz
    let targetLesson = null;
    let moduleIndex = -1;
    let lessonIndex = -1;

    for (let mi = 0; mi < course.modules.length; mi++) {
      const module = course.modules[mi];
      for (let li = 0; li < module.lessons.length; li++) {
        const lesson = module.lessons[li];
        if (lesson._id.toString() === lessonId) {
          targetLesson = lesson;
          moduleIndex = mi;
          lessonIndex = li;
          break;
        }
      }
      if (targetLesson) break;
    }

    if (!targetLesson || !targetLesson.quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    const quiz = targetLesson.quiz;
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Save quiz result
    const quizProgress = new UserProgress({
      userId,
      courseId,
      progressType: 'quiz',
      progressData: {
        lessonId,
        moduleIndex,
        lessonIndex,
        answers,
        score,
        correctAnswers,
        totalQuestions,
        completedAt: new Date()
      }
    });

    await quizProgress.save();

    res.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions,
      passed: score >= 70 // 70% passing grade
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update course progress
router.post('/:id/progress', flexibleAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id: courseId } = req.params;
    const { moduleId, lessonId, progress, timeSpent, completionStatus, quizScore } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find existing progress record or create a new one
    let progressRecord;
    
    if (moduleId || lessonId) {
      // Looking for specific module or lesson progress
      progressRecord = await UserProgress.findOne({
        userId: req.user._id,
        courseId,
        moduleId: moduleId || null,
        lessonId: lessonId || null
      });
    } else {
      // Looking for course-level progress (not enrollment)
      progressRecord = await UserProgress.findOne({
        userId: req.user._id,
        courseId,
        progressType: 'course',
        moduleId: null,
        lessonId: null
      });
    }

    const now = new Date();

    if (progressRecord) {
      // Update existing record
      progressRecord.progressData = {
        ...progressRecord.progressData,
        completionPercentage: progress || progressRecord.progressData?.completionPercentage || 0,
        timeSpent: (progressRecord.progressData?.timeSpent || 0) + (timeSpent || 0),
        completionStatus: completionStatus || progressRecord.progressData?.completionStatus || 'in-progress',
        quizScore: quizScore !== undefined ? quizScore : progressRecord.progressData?.quizScore
      };
      progressRecord.lastUpdated = now;
    } else {
      // Create new progress record
      progressRecord = new UserProgress({
        userId: req.user._id,
        courseId,
        moduleId: moduleId || null,
        lessonId: lessonId || null,
        progressType: lessonId ? 'lesson' : moduleId ? 'module' : 'course',
        progressData: {
          completionPercentage: progress || 0,
          timeSpent: timeSpent || 0,
          completionStatus: completionStatus || 'in-progress',
          quizScore: quizScore
        },
        timestamp: now,
        lastUpdated: now
      });
    }

    await progressRecord.save();

    // Update overall course progress if this is a lesson completion
    if (lessonId && (completionStatus === 'completed' || progress === 100)) {
      await updateOverallCourseProgress(req.user._id, courseId);
    }

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      progress: progressRecord
    });
  } catch (error) {
    console.error('Update course progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to update overall course progress
async function updateOverallCourseProgress(userId, courseId) {
  try {
    // Get all completed lessons for this course
    const lessonProgress = await UserProgress.find({
      userId,
      courseId,
      progressType: 'lesson',
      'progressData.completionStatus': 'completed'
    });
    
    // Get course structure to determine total lessons
    const course = await Course.findById(courseId);
    if (!course || !course.modules) {
      return;
    }
    
    // Count total lessons in the course
    let totalLessons = 0;
    course.modules.forEach(module => {
      totalLessons += (module.lessons?.length || 0);
    });
    
    if (totalLessons === 0) {
      return;
    }
    
    // Calculate overall progress percentage
    const completedLessons = lessonProgress.length;
    const progressPercentage = Math.min(
      Math.round((completedLessons / totalLessons) * 100),
      100
    );
    
    // Find or create overall course progress record
    let courseProgress = await UserProgress.findOne({
      userId,
      courseId,
      progressType: 'course',
      moduleId: null,
      lessonId: null
    });
    
    const now = new Date();
    
    if (courseProgress) {
      courseProgress.progressData = {
        ...courseProgress.progressData,
        completionPercentage: progressPercentage,
        completedLessons,
        totalLessons
      };
      courseProgress.lastUpdated = now;
    } else {
      courseProgress = new UserProgress({
        userId,
        courseId,
        progressType: 'course',
        progressData: {
          completionPercentage: progressPercentage,
          completedLessons,
          totalLessons,
          timeSpent: 0,
          completionStatus: progressPercentage === 100 ? 'completed' : 'in-progress'
        },
        timestamp: now,
        lastUpdated: now
      });
    }
    
    await courseProgress.save();
    
    return courseProgress;
  } catch (error) {
    console.error('Error updating overall course progress:', error);
    throw error;
  }
}

export default router;
