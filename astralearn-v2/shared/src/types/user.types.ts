import { z } from 'zod';
import { UserRole, LearningStyle } from './common.types';

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: UserRole,
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  learningStyle: LearningStyle.optional(),
  timezone: z.string().optional(),
  language: z.string().default('en'),
  isEmailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  profileCompleteness: z.number().min(0).max(100).default(0),
  lastLoginAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// User Preferences Schema
export const UserPreferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    courseUpdates: z.boolean().default(true),
    socialActivity: z.boolean().default(true),
    achievements: z.boolean().default(true),
    reminders: z.boolean().default(true),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']).default('public'),
    showProgress: z.boolean().default(true),
    showAchievements: z.boolean().default(true),
    allowMessages: z.boolean().default(true),
  }),
  learning: z.object({
    autoplay: z.boolean().default(false),
    playbackSpeed: z.number().min(0.5).max(2).default(1),
    subtitles: z.boolean().default(false),
    darkMode: z.boolean().default(false),
    reducedMotion: z.boolean().default(false),
  }),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Authentication Schemas
export const LoginRequestSchema = z.object({
  identifier: z.string().min(1), // email or username
  password: z.string().min(6),
  rememberMe: z.boolean().default(false),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: UserRole.default('student'),
  learningStyle: LearningStyle.optional(),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const AuthResponseSchema = z.object({
  user: UserProfileSchema,
  tokens: AuthTokensSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Password Reset Schemas
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// Profile Update Schemas
export const UpdateProfileRequestSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  learningStyle: LearningStyle.optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// User Statistics Schema
export const UserStatsSchema = z.object({
  coursesEnrolled: z.number().nonnegative(),
  coursesCompleted: z.number().nonnegative(),
  totalLearningTime: z.number().nonnegative(), // in minutes
  streakDays: z.number().nonnegative(),
  totalPoints: z.number().nonnegative(),
  level: z.number().positive(),
  badgesEarned: z.number().nonnegative(),
  achievementsUnlocked: z.number().nonnegative(),
  studyGroupsJoined: z.number().nonnegative(),
  helpfulAnswers: z.number().nonnegative(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

// User Activity Schema
export const UserActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    'login',
    'logout',
    'course_enrolled',
    'lesson_completed',
    'quiz_completed',
    'badge_earned',
    'achievement_unlocked',
    'study_group_joined',
    'discussion_posted',
    'profile_updated',
  ]),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export type UserActivity = z.infer<typeof UserActivitySchema>;
