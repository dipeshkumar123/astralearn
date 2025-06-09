import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import JWTManager from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const jwtManager = JWTManager.getInstance();

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('username').isLength({ min: 3, max: 30 }).trim(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password, firstName, lastName, username, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'Email or username already taken',
      });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      username,
      role,
    });

    await user.save();

    // Generate tokens
    const tokens = user.generateAuthTokens();

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not create user',
    });
  }
});

// Login endpoint
router.post('/login', [
  body('identifier').notEmpty().trim(), // email or username
  body('password').notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await (User as any).findByCredentials(identifier);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = user.generateAuthTokens();

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not authenticate user',
    });
  }
});

// Refresh token endpoint
router.post('/refresh', [
  body('refreshToken').notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const payload = jwtManager.verifyRefreshToken(refreshToken);
    
    // Find user to ensure they still exist
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found',
      });
    }

    // Generate new tokens
    const tokens = user.generateAuthTokens();

    res.json({
      message: 'Tokens refreshed successfully',
      tokens,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid refresh token',
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not authenticated',
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user: req.user.toJSON(),
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not fetch profile',
    });
  }
});

// Update user profile
router.put('/profile', [
  authenticate,
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic', 'reading']),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not authenticated',
      });
    }

    const { firstName, lastName, learningStyle } = req.body;

    // Update fields
    if (firstName !== undefined) req.user.firstName = firstName;
    if (lastName !== undefined) req.user.lastName = lastName;
    if (learningStyle !== undefined) req.user.learningStyle = learningStyle;

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON(),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not update profile',
    });
  }
});

// Logout endpoint
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Could not logout',
    });
  }
});

export default router;
