// Core types for AstraLearn platform
import { z } from 'zod';

// User Management
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['student', 'instructor', 'admin']),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Course Management
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  instructor: z.string(), // User ID
  modules: z.array(z.string()), // Module IDs
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedHours: z.number().positive(),
  tags: z.array(z.string()),
  isPublished: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Course = z.infer<typeof CourseSchema>;

// Module/Lesson Structure
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  moduleId: z.string(),
  order: z.number(),
  objectives: z.array(z.string()),
  estimatedMinutes: z.number().positive(),
  resources: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Lesson = z.infer<typeof LessonSchema>;

// AI Context
export const AIContextSchema = z.object({
  user: UserSchema.pick({ id: true, learningStyle: true, progress: true }),
  course: CourseSchema.pick({ id: true, title: true, difficulty: true }),
  lesson: LessonSchema.pick({ id: true, title: true, objectives: true }),
  analytics: z.object({
    recentScores: z.array(z.number()),
    timeSpent: z.string(),
    strugglingTopics: z.array(z.string()),
  }),
});

export type AIContext = z.infer<typeof AIContextSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}