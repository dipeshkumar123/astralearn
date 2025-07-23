import { z } from 'zod';
import {
  PaginationQuerySchema,
  SortQuerySchema,
  SearchQuerySchema
} from './common.types';

// Generic API Response Types (re-exported from common.types)
export type { ApiSuccessResponse, ApiErrorResponse } from './common.types';

// Authentication API Types
export const LoginApiRequestSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
  rememberMe: z.boolean().default(false),
});

export const RegisterApiRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['student', 'instructor']).default('student'),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
});

export const RefreshTokenApiRequestSchema = z.object({
  refreshToken: z.string(),
});

export type LoginApiRequest = z.infer<typeof LoginApiRequestSchema>;
export type RegisterApiRequest = z.infer<typeof RegisterApiRequestSchema>;
export type RefreshTokenApiRequest = z.infer<typeof RefreshTokenApiRequestSchema>;

// Course API Types
export const CourseQuerySchema = z.object({
  ...PaginationQuerySchema.shape,
  ...SortQuerySchema.shape,
  ...SearchQuerySchema.shape,
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  instructor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  enrolled: z.boolean().optional(),
});

export const CreateCourseApiRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  shortDescription: z.string().max(300).optional(),
  category: z.string(),
  tags: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedDuration: z.number().positive(),
  objectives: z.array(z.string().min(1)),
  prerequisites: z.array(z.string()),
  price: z.number().nonnegative().default(0),
  language: z.string().default('en'),
});

export type CourseQuery = z.infer<typeof CourseQuerySchema>;
export type CreateCourseApiRequest = z.infer<typeof CreateCourseApiRequestSchema>;

// User API Types
export const UpdateProfileApiRequestSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export const ChangePasswordApiRequestSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export const UpdatePreferencesApiRequestSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    courseUpdates: z.boolean(),
    socialActivity: z.boolean(),
    achievements: z.boolean(),
    reminders: z.boolean(),
  }).partial().optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']),
    showProgress: z.boolean(),
    showAchievements: z.boolean(),
    allowMessages: z.boolean(),
  }).partial().optional(),
  learning: z.object({
    autoplay: z.boolean(),
    playbackSpeed: z.number().min(0.5).max(2),
    subtitles: z.boolean(),
    darkMode: z.boolean(),
    reducedMotion: z.boolean(),
  }).partial().optional(),
});

export type UpdateProfileApiRequest = z.infer<typeof UpdateProfileApiRequestSchema>;
export type ChangePasswordApiRequest = z.infer<typeof ChangePasswordApiRequestSchema>;
export type UpdatePreferencesApiRequest = z.infer<typeof UpdatePreferencesApiRequestSchema>;

// Analytics API Types
export const AnalyticsQuerySchema = z.object({
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).default('monthly'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  courseId: z.string().optional(),
  includeComparison: z.boolean().default(false),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

// File Upload API Types
export const FileUploadResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string().url(),
  type: z.enum(['image', 'video', 'audio', 'document', 'archive']),
  uploadedAt: z.string().datetime(),
});

export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

// Search API Types
export const SearchApiRequestSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['all', 'courses', 'lessons', 'discussions', 'users']).default('all'),
  filters: z.object({
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).optional(),
  }).optional(),
  ...PaginationQuerySchema.shape,
  ...SortQuerySchema.shape,
});

export const SearchApiResponseSchema = z.object({
  results: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    description: z.string().optional(),
    url: z.string(),
    relevanceScore: z.number().min(0).max(1),
    highlights: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  })),
  totalResults: z.number().nonnegative(),
  searchTime: z.number().positive(),
  suggestions: z.array(z.string()).optional(),
});

export type SearchApiRequest = z.infer<typeof SearchApiRequestSchema>;
export type SearchApiResponse = z.infer<typeof SearchApiResponseSchema>;

// Notification API Types
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error', 'achievement', 'social', 'course']),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const NotificationQuerySchema = z.object({
  ...PaginationQuerySchema.shape,
  type: z.enum(['info', 'success', 'warning', 'error', 'achievement', 'social', 'course']).optional(),
  isRead: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;

// WebSocket Event Types
export const WebSocketEventSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type WebSocketEvent = z.infer<typeof WebSocketEventSchema>;

// Health Check Response
export const HealthCheckResponseSchema = z.object({
  status: z.enum(['OK', 'ERROR']),
  message: z.string(),
  timestamp: z.string().datetime(),
  environment: z.string(),
  version: z.string(),
  services: z.record(z.string()),
  uptime: z.number().optional(),
  memory: z.record(z.number()).optional(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
