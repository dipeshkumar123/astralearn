import { Router } from 'express';
import { Course, User, UserProgress } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

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

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email')
      .populate('lessons');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
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
      instructorId: req.user?.role === 'instructor' ? req.user._id : undefined,
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
    }

    // Check ownership (instructors can only edit their own courses)
    if (req.user?.role === 'instructor' && course.instructorId.toString() !== req.user._id.toString()) {
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
    }

    // Check ownership
    if (req.user?.role === 'instructor' && course.instructorId.toString() !== req.user._id.toString()) {
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
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: 'Course is not published' });
    }

    // Check if already enrolled
    const existingProgress = await UserProgress.findOne({
      userId: req.user?._id,
      courseId: course._id,
    });

    if (existingProgress) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create user progress record
    const userProgress = new UserProgress({
      userId: req.user?._id,
      courseId: course._id,
      enrolledAt: new Date(),
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
router.get('/my/enrolled', auth, async (req, res) => {
  try {
    const userProgress = await UserProgress.find({ userId: req.user?._id })
      .populate({
        path: 'courseId',
        populate: {
          path: 'instructor',
          select: 'firstName lastName email',
        },
      })
      .sort({ enrolledAt: -1 });

    res.json({
      enrolledCourses: userProgress.map(progress => ({
        ...progress.toObject(),
        course: progress.courseId,
      })),
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
