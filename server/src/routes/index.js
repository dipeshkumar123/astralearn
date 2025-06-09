import { Router } from 'express';
import authRoutes from './auth-test.js';
import courseRoutes from './courses.js';
// import lessonRoutes from './lessons.js';
import aiRoutes from './ai.js';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
// router.use('/lessons', lessonRoutes);
router.use('/ai', aiRoutes);

// Health check for API routes
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AstraLearn API Routes are healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      lessons: '/api/lessons',
      ai: '/api/ai',
    },
  });
});

export default router;
