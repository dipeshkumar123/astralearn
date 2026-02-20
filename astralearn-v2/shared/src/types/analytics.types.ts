import { z } from 'zod';

// Learning Event Schema
export const LearningEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    'lesson_started',
    'lesson_completed',
    'quiz_attempted',
    'quiz_completed',
    'course_enrolled',
    'course_completed',
    'discussion_posted',
    'study_session_joined',
    'achievement_earned',
    'login',
    'logout'
  ]),
  context: z.object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    moduleId: z.string().optional(),
    sessionId: z.string().optional(),
    deviceType: z.string().optional(),
    platform: z.string().optional(),
    userAgent: z.string().optional(),
    location: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      timezone: z.string().optional(),
    }).optional(),
  }),
  data: z.object({
    duration: z.number().optional(), // in milliseconds
    score: z.number().optional(),
    completionPercentage: z.number().optional(),
    difficulty: z.string().optional(),
    interactions: z.array(z.object({
      type: z.string(),
      timestamp: z.string().datetime(),
      duration: z.number().optional(),
      data: z.record(z.any()).optional(),
    })).optional(),
    performance: z.object({
      accuracy: z.number().optional(),
      speed: z.number().optional(),
      confidence: z.number().optional(),
      attempts: z.number().optional(),
    }).optional(),
    behavioral: z.object({
      focusScore: z.number().optional(),
      engagementLevel: z.string().optional(),
      navigationPattern: z.array(z.string()).optional(),
      timeDistribution: z.record(z.number()).optional(),
    }).optional(),
  }),
  timestamp: z.string().datetime(),
});

export type LearningEvent = z.infer<typeof LearningEventSchema>;

// Learning Session Schema
export const LearningSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().nonnegative(), // in minutes
  activeDuration: z.number().nonnegative(), // actual active time
  events: z.array(z.string()).default([]), // Event IDs
  metrics: z.object({
    lessonsCompleted: z.number().nonnegative().default(0),
    quizzesAttempted: z.number().nonnegative().default(0),
    averageScore: z.number().min(0).max(100).optional(),
    engagementScore: z.number().min(0).max(100).optional(),
    focusScore: z.number().min(0).max(100).optional(),
  }),
  deviceInfo: z.object({
    type: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
  }).optional(),
});

export type LearningSession = z.infer<typeof LearningSessionSchema>;

// Daily Analytics Schema
export const DailyAnalyticsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // YYYY-MM-DD format
  metrics: z.object({
    totalStudyTime: z.number().nonnegative().default(0), // in minutes
    activeStudyTime: z.number().nonnegative().default(0),
    lessonsCompleted: z.number().nonnegative().default(0),
    quizzesCompleted: z.number().nonnegative().default(0),
    averageQuizScore: z.number().min(0).max(100).optional(),
    coursesAccessed: z.number().nonnegative().default(0),
    socialInteractions: z.number().nonnegative().default(0),
    pointsEarned: z.number().nonnegative().default(0),
    streakMaintained: z.boolean().default(false),
  }),
  goals: z.object({
    dailyStudyTime: z.number().positive().default(60), // target minutes
    lessonsPerDay: z.number().positive().default(2),
    quizzesPerDay: z.number().positive().default(1),
  }),
  achievements: z.array(z.string()).default([]), // Achievement IDs earned today
  createdAt: z.string().datetime(),
});

export type DailyAnalytics = z.infer<typeof DailyAnalyticsSchema>;

// Learning Insight Schema
export const LearningInsightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    'performance_trend',
    'learning_pattern',
    'strength_weakness',
    'recommendation',
    'goal_progress',
    'comparison'
  ]),
  title: z.string(),
  description: z.string(),
  data: z.record(z.any()),
  priority: z.enum(['low', 'medium', 'high']),
  actionable: z.boolean().default(false),
  actions: z.array(z.object({
    type: z.string(),
    label: z.string(),
    url: z.string().optional(),
    data: z.record(z.any()).optional(),
  })).default([]),
  validUntil: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type LearningInsight = z.infer<typeof LearningInsightSchema>;

// Performance Metrics Schema
export const PerformanceMetricsSchema = z.object({
  userId: z.string(),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']),
  period: z.string(), // e.g., "2024-01", "2024-W01", "2024-01-01"
  learning: z.object({
    totalStudyTime: z.number().nonnegative(),
    averageSessionDuration: z.number().nonnegative(),
    lessonsCompleted: z.number().nonnegative(),
    coursesCompleted: z.number().nonnegative(),
    averageCompletionRate: z.number().min(0).max(100),
  }),
  assessment: z.object({
    quizzesAttempted: z.number().nonnegative(),
    quizzesCompleted: z.number().nonnegative(),
    averageScore: z.number().min(0).max(100),
    improvementRate: z.number(),
    strongSubjects: z.array(z.string()),
    weakSubjects: z.array(z.string()),
  }),
  engagement: z.object({
    loginDays: z.number().nonnegative(),
    currentStreak: z.number().nonnegative(),
    longestStreak: z.number().nonnegative(),
    socialInteractions: z.number().nonnegative(),
    forumPosts: z.number().nonnegative(),
    studyGroupParticipation: z.number().nonnegative(),
  }),
  gamification: z.object({
    pointsEarned: z.number().nonnegative(),
    badgesEarned: z.number().nonnegative(),
    achievementsUnlocked: z.number().nonnegative(),
    currentLevel: z.number().positive(),
    rankPosition: z.number().positive().optional(),
  }),
  trends: z.object({
    studyTimeChange: z.number(),
    scoreChange: z.number(),
    engagementChange: z.number(),
    streakChange: z.number(),
  }),
  calculatedAt: z.string().datetime(),
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
