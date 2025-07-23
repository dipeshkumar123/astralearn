import { Router } from 'express';
import { authRoutes } from './auth.js';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    message: 'AstraLearn v2 API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      courses: '/api/courses/*',
      modules: '/api/modules/*',
      lessons: '/api/lessons/*',
      analytics: '/api/analytics/*',
      ai: '/api/ai/*',
      social: '/api/social/*',
      gamification: '/api/gamification/*',
    },
    documentation: 'https://docs.astralearn.com/api/v2',
  });
});

// Mount route modules
router.use('/auth', authRoutes);

// TODO: Add other route modules as they are created
// router.use('/users', userRoutes);
// router.use('/courses', courseRoutes);
// router.use('/modules', moduleRoutes);
// router.use('/lessons', lessonRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/ai', aiRoutes);
// router.use('/social', socialRoutes);
// router.use('/gamification', gamificationRoutes);

export { router as apiRoutes };
