import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment.js';
import type { UserDocument } from '../models/User.js';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

class JWTManager {
  private static instance: JWTManager;

  private constructor() {}

  public static getInstance(): JWTManager {
    if (!JWTManager.instance) {
      JWTManager.instance = new JWTManager();
    }
    return JWTManager.instance;
  }

  /**
   * Generate access token
   */
  public generateAccessToken(user: UserDocument): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      type: 'access',
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'astralearn',
      audience: 'astralearn-client',
    } as SignOptions);
  }

  /**
   * Generate refresh token
   */
  public generateRefreshToken(user: UserDocument): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'astralearn',
      audience: 'astralearn-client',
    } as SignOptions);
  }

  /**
   * Generate both access and refresh tokens
   */
  public generateAuthTokens(user: UserDocument): AuthTokens {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Verify access token
   */
  public verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'astralearn',
        audience: 'astralearn-client',
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  public verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'astralearn',
        audience: 'astralearn-client',
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  public extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Decode token without verification (for debugging)
   */
  public decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

export default JWTManager;
