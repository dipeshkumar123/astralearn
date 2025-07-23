import { z } from 'zod';
import { DifficultyLevel, PublishStatus, ProgressStatus } from './common.types';

// Course Schema
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  shortDescription: z.string().max(300).optional(),
  instructorId: z.string(),
  instructor: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
  }).optional(),
  thumbnail: z.string().url().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  difficulty: DifficultyLevel,
  estimatedDuration: z.number().positive(), // in hours
  objectives: z.array(z.string().min(1)),
  prerequisites: z.array(z.string()),
  status: PublishStatus,
  isPublished: z.boolean(),
  isFeatured: z.boolean().default(false),
  enrollmentCount: z.number().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().nonnegative().default(0),
  price: z.number().nonnegative().default(0),
  currency: z.string().default('USD'),
  language: z.string().default('en'),
  modules: z.array(z.string()).optional(), // Module IDs
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Course = z.infer<typeof CourseSchema>;

// Module Schema
export const ModuleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  position: z.number().positive(),
  objectives: z.array(z.string()),
  estimatedDuration: z.number().positive(), // in minutes
  difficulty: DifficultyLevel,
  prerequisites: z.array(z.string()),
  isPublished: z.boolean().default(false),
  lessons: z.array(z.string()).optional(), // Lesson IDs
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Module = z.infer<typeof ModuleSchema>;

// Lesson Schema
export const LessonSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string(),
  type: z.enum(['text', 'video', 'interactive', 'quiz', 'assignment']),
  position: z.number().positive(),
  estimatedDuration: z.number().positive(), // in minutes
  objectives: z.array(z.string()),
  resources: z.array(z.object({
    type: z.enum(['link', 'file', 'video', 'document']),
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
  })),
  isPublished: z.boolean().default(false),
  isFree: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Lesson = z.infer<typeof LessonSchema>;

// Course Enrollment Schema
export const CourseEnrollmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string(),
  enrolledAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: ProgressStatus,
  lastAccessedAt: z.string().datetime().optional(),
  timeSpent: z.number().nonnegative().default(0), // in minutes
  certificateIssued: z.boolean().default(false),
  certificateUrl: z.string().url().optional(),
});

export type CourseEnrollment = z.infer<typeof CourseEnrollmentSchema>;

// Lesson Progress Schema
export const LessonProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.string(),
  moduleId: z.string(),
  courseId: z.string(),
  status: ProgressStatus,
  progress: z.number().min(0).max(100).default(0),
  timeSpent: z.number().nonnegative().default(0), // in minutes
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  lastAccessedAt: z.string().datetime(),
  attempts: z.number().nonnegative().default(0),
  score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;

// Course Creation/Update Schemas
export const CreateCourseRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  shortDescription: z.string().max(300).optional(),
  category: z.string(),
  tags: z.array(z.string()),
  difficulty: DifficultyLevel,
  estimatedDuration: z.number().positive(),
  objectives: z.array(z.string().min(1)),
  prerequisites: z.array(z.string()),
  price: z.number().nonnegative().default(0),
  language: z.string().default('en'),
});

export const UpdateCourseRequestSchema = CreateCourseRequestSchema.partial();

export type CreateCourseRequest = z.infer<typeof CreateCourseRequestSchema>;
export type UpdateCourseRequest = z.infer<typeof UpdateCourseRequestSchema>;

// Module Creation/Update Schemas
export const CreateModuleRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  position: z.number().positive(),
  objectives: z.array(z.string()),
  estimatedDuration: z.number().positive(),
  difficulty: DifficultyLevel,
  prerequisites: z.array(z.string()),
});

export const UpdateModuleRequestSchema = CreateModuleRequestSchema.partial();

export type CreateModuleRequest = z.infer<typeof CreateModuleRequestSchema>;
export type UpdateModuleRequest = z.infer<typeof UpdateModuleRequestSchema>;

// Lesson Creation/Update Schemas
export const CreateLessonRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string(),
  type: z.enum(['text', 'video', 'interactive', 'quiz', 'assignment']),
  position: z.number().positive(),
  estimatedDuration: z.number().positive(),
  objectives: z.array(z.string()),
  resources: z.array(z.object({
    type: z.enum(['link', 'file', 'video', 'document']),
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
  })),
  isFree: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export const UpdateLessonRequestSchema = CreateLessonRequestSchema.partial();

export type CreateLessonRequest = z.infer<typeof CreateLessonRequestSchema>;
export type UpdateLessonRequest = z.infer<typeof UpdateLessonRequestSchema>;

// Course Search and Filter Schemas
export const CourseSearchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  difficulty: DifficultyLevel.optional(),
  tags: z.array(z.string()).optional(),
  instructor: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().nonnegative().optional(),
  language: z.string().optional(),
  featured: z.boolean().optional(),
});

export type CourseSearchQuery = z.infer<typeof CourseSearchQuerySchema>;
