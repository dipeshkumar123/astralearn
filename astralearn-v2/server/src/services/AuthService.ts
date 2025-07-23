import { User, IUser } from '@/models/User.js';
import { jwtService, TokenPair } from '@/utils/jwt.js';
import { 
  AuthenticationError, 
  ConflictError, 
  NotFoundError,
  ValidationError 
} from '@/utils/errors.js';
import { logger, logSecurity } from '@/utils/logger.js';
// Define local types since shared types might not be available yet
interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'instructor';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | undefined;
}

interface AuthResponse {
  user: any;
  tokens: any;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  public async register(data: RegisterRequest, ip?: string): Promise<AuthResponse> {
    try {
      logger.info('User registration attempt', { email: data.email, username: data.username });

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: data.email.toLowerCase() },
          { username: data.username.toLowerCase() }
        ]
      });

      if (existingUser) {
        const field = existingUser.email === data.email.toLowerCase() ? 'email' : 'username';
        logSecurity('Registration attempt with existing credentials', undefined, ip, {
          field,
          value: field === 'email' ? data.email : data.username,
        });
        throw new ConflictError(`User with this ${field} already exists`);
      }

      // Create new user
      const user = new User({
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'student',
        learningStyle: data.learningStyle,
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      
      await user.save();

      logger.info('User registered successfully', { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      });

      // Generate tokens
      const tokens = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      // TODO: Send verification email
      // await this.sendVerificationEmail(user.email, verificationToken);

      return {
        user: user.toProfileJSON(),
        tokens,
      };
    } catch (error) {
      logger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  public async login(data: LoginRequest, ip?: string): Promise<AuthResponse> {
    try {
      logger.info('User login attempt', { identifier: data.identifier });

      // Find user by email or username
      const user = await User.findByEmailOrUsername(data.identifier);

      if (!user) {
        logSecurity('Login attempt with invalid credentials', undefined, ip, {
          identifier: data.identifier,
        });
        throw new AuthenticationError('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(data.password);

      if (!isPasswordValid) {
        logSecurity('Login attempt with wrong password', user.id, ip);
        throw new AuthenticationError('Invalid credentials');
      }

      // Update last login
      user.lastLoginAt = new Date();
      
      // Generate tokens
      const tokens = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token (limit to 5 active tokens)
      user.refreshTokens.push(tokens.refreshToken);
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      await user.save();

      logger.info('User logged in successfully', { 
        userId: user.id, 
        email: user.email 
      });

      return {
        user: user.toProfileJSON(),
        tokens,
      };
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  public async refreshToken(refreshToken: string, ip?: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = jwtService.verifyRefreshToken(refreshToken);

      // Find user and check if refresh token is valid
      const user = await User.findById(payload.userId).select('+refreshTokens');

      if (!user || !user.isActive) {
        logSecurity('Refresh token used for invalid user', payload.userId, ip);
        throw new AuthenticationError('Invalid refresh token');
      }

      if (!user.refreshTokens.includes(refreshToken)) {
        logSecurity('Invalid refresh token used', user.id, ip);
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new token pair
      const tokens = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Replace old refresh token with new one
      const tokenIndex = user.refreshTokens.indexOf(refreshToken);
      user.refreshTokens[tokenIndex] = tokens.refreshToken;
      
      await user.save();

      logger.info('Token refreshed successfully', { userId: user.id });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  public async logout(refreshToken: string, userId: string, ip?: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+refreshTokens');

      if (user) {
        // Remove refresh token
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        logger.info('User logged out successfully', { userId });
      }
    } catch (error) {
      logger.error('Logout failed', error);
      throw error;
    }
  }

  /**
   * Logout from all devices
   */
  public async logoutAll(userId: string, ip?: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+refreshTokens');

      if (user) {
        // Clear all refresh tokens
        user.refreshTokens = [];
        await user.save();

        logSecurity('User logged out from all devices', userId, ip);
        logger.info('User logged out from all devices', { userId });
      }
    } catch (error) {
      logger.error('Logout all failed', error);
      throw error;
    }
  }

  /**
   * Forgot password
   */
  public async forgotPassword(data: ForgotPasswordRequest, ip?: string): Promise<void> {
    try {
      const user = await User.findOne({ 
        email: data.email.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        // Don't reveal if email exists
        logger.info('Password reset requested for non-existent email', { email: data.email });
        return;
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      logSecurity('Password reset requested', user.id, ip);
      logger.info('Password reset token generated', { userId: user.id });

      // TODO: Send reset email
      // await this.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      logger.error('Forgot password failed', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  public async resetPassword(data: ResetPasswordRequest, ip?: string): Promise<void> {
    try {
      const user = await User.findByResetToken(data.token);

      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // Update password
      user.password = data.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      // Clear all refresh tokens for security
      user.refreshTokens = [];

      await user.save();

      logSecurity('Password reset completed', user.id, ip);
      logger.info('Password reset successfully', { userId: user.id });
    } catch (error) {
      logger.error('Password reset failed', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  public async verifyEmail(token: string, ip?: string): Promise<void> {
    try {
      const user = await User.findByVerificationToken(token);

      if (!user) {
        throw new AuthenticationError('Invalid or expired verification token');
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      logSecurity('Email verified', user.id, ip);
      logger.info('Email verified successfully', { userId: user.id });
    } catch (error) {
      logger.error('Email verification failed', error);
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  public async resendVerificationEmail(email: string, ip?: string): Promise<void> {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true,
        isEmailVerified: false 
      });

      if (!user) {
        throw new NotFoundError('User not found or already verified');
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      logger.info('Verification email resent', { userId: user.id });

      // TODO: Send verification email
      // await this.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      logger.error('Resend verification email failed', error);
      throw error;
    }
  }

  /**
   * Change password (authenticated user)
   */
  public async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string,
    ip?: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password +refreshTokens');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        logSecurity('Invalid current password in change password', userId, ip);
        throw new AuthenticationError('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      
      // Clear all refresh tokens for security
      user.refreshTokens = [];

      await user.save();

      logSecurity('Password changed', userId, ip);
      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Change password failed', error);
      throw error;
    }
  }

  /**
   * Validate token
   */
  public async validateToken(token: string): Promise<IUser> {
    try {
      const payload = jwtService.verifyAccessToken(token);
      
      const user = await User.findById(payload.userId);

      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid token');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
