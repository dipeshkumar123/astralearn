import { Router } from 'express';
import { SimpleAuthController } from '../controllers/SimpleAuthController';

const router = Router();
const authController = new SimpleAuthController();

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getProfile);
router.get('/users', authController.getUsers); // For testing

export { router as simpleAuthRoutes };
