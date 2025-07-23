import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

// Simple in-memory user store for testing
interface SimpleUser {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor';
  createdAt: Date;
}

const users: SimpleUser[] = [];
let userIdCounter = 1;

export class SimpleAuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, username, password, firstName, lastName, role = 'student' } = req.body;

      // Basic validation
      if (!email || !username || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'All fields are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === email || u.username === username);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'USER_EXISTS',
          message: 'User with this email or username already exists',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser: SimpleUser = {
        id: userIdCounter.toString(),
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
      };

      users.push(newUser);
      userIdCounter++;

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId: newUser.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      logger.info('User registration successful', { 
        userId: newUser.id,
        email: newUser.email 
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            createdAt: newUser.createdAt,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Login user
   * POST /api/auth/login
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, password } = req.body;

      // Basic validation
      if (!identifier || !password) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email/username and password are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Find user
      const user = users.find(u => 
        u.email === identifier.toLowerCase() || 
        u.username === identifier.toLowerCase()
      );

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      logger.info('User login successful', { 
        userId: user.id,
        email: user.email 
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            createdAt: user.createdAt,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Get all users (for testing)
   * GET /api/auth/users
   */
  public getUsers = async (_req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      })),
      timestamp: new Date().toISOString(),
    });
  };
}
