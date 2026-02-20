import { Router } from 'express';
import { authController } from '@/controllers/AuthController.js';
import { authenticate, optionalAuthenticate } from '@/middleware/auth.js';
import { authRateLimit } from '@/middleware/security.js';

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authRateLimit, authController.register);
router.post('/login', authRateLimit, authController.login);
router.post('/refresh', authRateLimit, authController.refreshToken);
router.post('/forgot-password', authRateLimit, authController.forgotPassword);
router.post('/reset-password', authRateLimit, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authRateLimit, authController.resendVerificationEmail);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.getProfile);
router.get('/validate', authenticate, authController.validateToken);

export { router as authRoutes };
