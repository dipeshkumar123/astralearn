import { Router } from 'express';
import authRoutes from './auth-test.js';
import courseRoutes from './courses.js';
import moduleRoutes from './modules.js';
// import lessonRoutes from './lessons.js';
import aiRoutes from './ai.js';
import userRoutes from './users.js';
import courseManagementRoutes from './courseManagement.js';
import adaptiveLearningRoutes from './adaptiveLearning.js';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
// router.use('/lessons', lessonRoutes);
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);
router.use('/course-management', courseManagementRoutes);
router.use('/adaptive-learning', adaptiveLearningRoutes);

// Health check for API routes
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AstraLearn API Routes are healthy',
    timestamp: new Date().toISOString(),    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      lessons: '/api/lessons',
      ai: '/api/ai',
      users: '/api/users',
      courseManagement: '/api/course-management',
      adaptiveLearning: '/api/adaptive-learning',
    },
  });
});

export default router;
