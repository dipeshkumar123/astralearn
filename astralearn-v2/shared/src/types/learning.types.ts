import { z } from 'zod';
import { ProgressStatus, AssessmentStatus } from './common.types';

// Learning Path Schema
export const LearningPathSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  courses: z.array(z.object({
    courseId: z.string(),
    position: z.number(),
    isRequired: z.boolean().default(true),
    prerequisites: z.array(z.string()),
  })),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedDuration: z.number().positive(), // in hours
  progress: z.number().min(0).max(100).default(0),
  status: ProgressStatus,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LearningPath = z.infer<typeof LearningPathSchema>;

// Assessment Schema
export const AssessmentSchema = z.object({
  id: z.string(),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['quiz', 'assignment', 'project', 'exam']),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay', 'code']),
    question: z.string(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    points: z.number().positive(),
    explanation: z.string().optional(),
  })),
  timeLimit: z.number().positive().optional(), // in minutes
  passingScore: z.number().min(0).max(100),
  maxAttempts: z.number().positive().default(3),
  isPublished: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Assessment = z.infer<typeof AssessmentSchema>;

// Assessment Attempt Schema
export const AssessmentAttemptSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  userId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    isCorrect: z.boolean().optional(),
    points: z.number().nonnegative().optional(),
  })),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  timeSpent: z.number().nonnegative(), // in minutes
  status: AssessmentStatus,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  feedback: z.string().optional(),
});

export type AssessmentAttempt = z.infer<typeof AssessmentAttemptSchema>;
