import { Request, Response } from 'express';
import { authService } from '@/services/AuthService.js';
import { asyncHandler } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import {
  LoginApiRequestSchema,
  RegisterApiRequestSchema,
  RefreshTokenApiRequestSchema,
} from '@astralearn/shared';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validatedData = RegisterApiRequestSchema.parse(req.body);

    // Register user
    const result = await authService.register(validatedData, req.ip);

    logger.info('User registration successful', {
      userId: result.user.id,
      email: result.user.email
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validatedData = LoginApiRequestSchema.parse(req.body);

    // Login user
    const result = await authService.login(validatedData, req.ip);

    logger.info('User login successful', {
      userId: result.user.id,
      email: result.user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validatedData = RefreshTokenApiRequestSchema.parse(req.body);

    // Refresh token
    const tokens = await authService.refreshToken(validatedData.refreshToken, req.ip);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  public logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.body.refreshToken;
    const userId = req.user?.id;

    if (refreshToken && userId) {
      await authService.logout(refreshToken, userId, req.ip);
    }

    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Logout from all devices
   * POST /api/auth/logout-all
   */
  public logoutAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (userId) {
      await authService.logoutAll(userId, req.ip);
    }

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  public forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    await authService.forgotPassword({ email }, req.ip);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  public resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Token and password are required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    await authService.resetPassword({ token, password }, req.ip);

    res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  public verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Verification token is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    await authService.verifyEmail(token, req.ip);

    res.json({
      success: true,
      message: 'Email verified successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  public resendVerificationEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    await authService.resendVerificationEmail(email, req.ip);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Change password (authenticated)
   * POST /api/auth/change-password
   */
  public changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Current password and new password are required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    await authService.changePassword(userId, currentPassword, newPassword, req.ip);

    res.json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  public getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.json({
      success: true,
      data: req.user.toProfileJSON(),
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Validate token
   * GET /api/auth/validate
   */
  public validateToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // If we reach here, the token is valid (middleware already validated it)
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        valid: true,
        user: req.user?.toProfileJSON(),
      },
      timestamp: new Date().toISOString(),
    });
  });
}

// Export controller instance
export const authController = new AuthController();
