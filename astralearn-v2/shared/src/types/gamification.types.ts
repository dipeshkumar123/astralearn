import { z } from 'zod';

// Badge Schema
export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(['learning', 'social', 'achievement', 'milestone']),
  criteria: z.object({
    type: z.enum(['points', 'streak', 'completion', 'social', 'time']),
    threshold: z.number(),
    timeframe: z.string().optional(),
  }),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  points: z.number().nonnegative(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

export type Badge = z.infer<typeof BadgeSchema>;

// User Badge Schema
export const UserBadgeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  badgeId: z.string(),
  badge: BadgeSchema.optional(),
  earnedAt: z.string().datetime(),
  progress: z.object({
    current: z.number().nonnegative(),
    required: z.number().positive(),
    percentage: z.number().min(0).max(100),
  }).optional(),
});

export type UserBadge = z.infer<typeof UserBadgeSchema>;

// Achievement Schema
export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(['learning', 'social', 'engagement', 'milestone']),
  type: z.enum(['progress', 'milestone', 'challenge', 'social']),
  criteria: z.object({
    metric: z.string(),
    operator: z.enum(['gte', 'lte', 'eq', 'in']),
    value: z.union([z.number(), z.string(), z.array(z.string())]),
    timeframe: z.string().optional(),
  }),
  rewards: z.object({
    points: z.number().nonnegative().default(0),
    badges: z.array(z.string()).default([]),
    title: z.string().optional(),
  }),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

export type Achievement = z.infer<typeof AchievementSchema>;

// User Achievement Schema
export const UserAchievementSchema = z.object({
  id: z.string(),
  userId: z.string(),
  achievementId: z.string(),
  achievement: AchievementSchema.optional(),
  progress: z.number().min(0).max(100),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
  currentValue: z.number().nonnegative().default(0),
  targetValue: z.number().positive(),
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;

// Leaderboard Schema
export const LeaderboardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['global', 'course', 'weekly', 'monthly']),
  metric: z.enum(['points', 'streak', 'completion', 'time']),
  timeframe: z.enum(['all_time', 'weekly', 'monthly', 'yearly']).default('all_time'),
  entries: z.array(z.object({
    userId: z.string(),
    user: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      avatar: z.string().optional(),
    }).optional(),
    value: z.number(),
    rank: z.number().positive(),
    change: z.number().optional(), // Change from previous period
  })),
  lastUpdated: z.string().datetime(),
});

export type Leaderboard = z.infer<typeof LeaderboardSchema>;

// User Gamification Profile Schema
export const UserGamificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  totalPoints: z.number().nonnegative().default(0),
  level: z.number().positive().default(1),
  experiencePoints: z.number().nonnegative().default(0),
  pointsToNextLevel: z.number().nonnegative().default(100),
  currentStreak: z.number().nonnegative().default(0),
  longestStreak: z.number().nonnegative().default(0),
  lastActivityDate: z.string().datetime().optional(),
  pointsBreakdown: z.object({
    learning: z.number().nonnegative().default(0),
    social: z.number().nonnegative().default(0),
    achievements: z.number().nonnegative().default(0),
    streaks: z.number().nonnegative().default(0),
    bonus: z.number().nonnegative().default(0),
  }),
  badges: z.array(UserBadgeSchema).default([]),
  achievements: z.array(UserAchievementSchema).default([]),
  ranks: z.object({
    global: z.number().positive().optional(),
    weekly: z.number().positive().optional(),
    monthly: z.number().positive().optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserGamification = z.infer<typeof UserGamificationSchema>;

// Point Transaction Schema
export const PointTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['earned', 'spent', 'bonus', 'penalty']),
  category: z.enum(['learning', 'social', 'achievement', 'streak', 'bonus']),
  points: z.number(),
  reason: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export type PointTransaction = z.infer<typeof PointTransactionSchema>;
