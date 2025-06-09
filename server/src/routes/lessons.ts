import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Lesson } from '../models/Lesson.js';
import { Course } from '../models/Course.js';
import { UserProgress } from '../models/UserProgress.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Get all lessons for a course
router.get('/course/:courseId', authenticate, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to the course
    if (req.user?.role === 'student') {
      const userProgress = await UserProgress.findOne({
        userId: req.user._id,
        courseId: course._id,
      });
      
      if (!userProgress) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
    }

    const lessons = await Lesson.find({ courseId })
      .sort({ order: 1 });

    res.json({ lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific lesson
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('courseId');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user has access
    if (req.user?.role === 'student') {
      const userProgress = await UserProgress.findOne({
        userId: req.user._id,
        courseId: lesson.courseId,
      });
      
      if (!userProgress) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new lesson (instructors and admins only)
router.post('/', 
  authenticate, 
  authorize(['instructor', 'admin']),
  [
    body('title').notEmpty().trim(),
    body('content').notEmpty(),
    body('courseId').isMongoId(),
    body('order').isNumeric(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { title, content, courseId, order, type = 'text', estimatedDuration } = req.body;

      // Check if course exists and user has permission
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }      if (req.user?.role === 'instructor' && course.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const lesson = new Lesson({
        title,
        content,
        courseId,
        order,
        type,
        estimatedDuration,
        createdBy: req.user?._id,
      });

      await lesson.save();

      res.status(201).json({
        message: 'Lesson created successfully',
        lesson,
      });
    } catch (error) {
      console.error('Create lesson error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Health check for lessons service
router.get('/health', async (req: Request, res: Response) => {
  try {
    const lessonCount = await Lesson.countDocuments();
    
    res.json({
      status: 'operational',
      totalLessons: lessonCount,
      timestamp: new Date().toISOString(),
      service: 'lessons',
    });
  } catch (error) {
    console.error('Lessons health check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Health check failed',
    });
  }
});

export default router;
