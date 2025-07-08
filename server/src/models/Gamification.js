import mongoose, { Schema } from 'mongoose';

/**
 * Badge Schema
 * @module models/Gamification
 * @description Represents a badge for gamification, with category, rarity, and criteria.
 * Arrays: badges, milestone, etc. are not capped but should be paginated at the API/service layer if large.
 * Business logic: All business logic should be implemented in service/model methods, not in the schema definition.
 * Middleware: Add robust pre/post hooks for validation, notifications, etc. as needed.
 */
// Badge Schema
const badgeSchema = new Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['learning', 'consistency', 'collaboration', 'achievement', 'special'],
    required: true,
    index: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  iconUrl: {
    type: String,
    required: true
  },
  criteria: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  /**
   * Custom toJSON transform to remove MongoDB internals and sensitive fields from API responses.
   * - Removes _id, __v
   * - Optionally remove or mask any sensitive fields here
   * @param {Document} doc
   * @param {Object} ret
   */
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Add additional sensitive field removals here if needed
      return ret;
    }
  }
});

// User Gamification Profile Schema
const userGamificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experiencePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsBreakdown: {
    learning: { type: Number, default: 0 },
    consistency: { type: Number, default: 0 },
    collaboration: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 }
  },
  badges: [{
    badgeId: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      current: { type: Number, default: 0 },
      required: { type: Number, default: 1 }
    }
  }],
  streaks: {
    current: {
      dailyLearning: { type: Number, default: 0 },
      weeklyGoals: { type: Number, default: 0 },
      assessmentStreak: { type: Number, default: 0 }
    },
    longest: {
      dailyLearning: { type: Number, default: 0 },
      weeklyGoals: { type: Number, default: 0 },
      assessmentStreak: { type: Number, default: 0 }
    },
    lastActivity: {
      date: { type: Date },
      type: { type: String }
    }
  },
  achievements: [{
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    progress: {
      current: { type: Number, default: 0 },
      target: { type: Number, required: true }
    }
  }],
  preferences: {
    showPublicProfile: { type: Boolean, default: true },
    allowLeaderboards: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    preferredChallenges: [{ type: String }]
  },
  statistics: {
    totalLessonsCompleted: { type: Number, default: 0 },
    totalAssessmentsCompleted: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    averageScore: { type: Number, default: 0 },
    collaborationsCount: { type: Number, default: 0 },
    helpfulAnswers: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Points Activity Schema
const pointsActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: [
      'lesson_complete',
      'assessment_complete',
      'daily_login',
      'streak_bonus',
      'collaboration',
      'help_peer',
      'create_content',
      'challenge_complete',
      'badge_earned',
      'level_up'
    ],
    required: true,
    index: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    assessmentId: { type: String },
    collaborationId: { type: String },
    challengeId: { type: String },
    multiplier: { type: Number, default: 1 },
    streakBonus: { type: Boolean, default: false }
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Leaderboard Schema
const leaderboardSchema = new Schema({
  type: {
    type: String,
    enum: ['global', 'course', 'weekly', 'monthly', 'friends', 'study_group'],
    required: true,
    index: true
  },
  scope: {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    groupId: { type: String },
    period: {
      start: { type: Date },
      end: { type: Date }
    }
  },
  rankings: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    change: {
      type: Number,
      default: 0 // Change from previous period
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Achievement Definition Schema
const achievementSchema = new Schema({
  achievementId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['milestone', 'streak', 'performance', 'collaboration', 'special'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'streak', 'score', 'time', 'custom'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    metric: {
      type: String,
      required: true
    },
    conditions: [{
      field: { type: String },
      operator: { type: String, enum: ['gte', 'lte', 'eq', 'ne', 'in'] },
      value: { type: Schema.Types.Mixed }
    }]
  },
  rewards: {
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    title: { type: String }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for performance
userGamificationSchema.index({ userId: 1 });
userGamificationSchema.index({ totalPoints: -1 });
userGamificationSchema.index({ level: -1 });

pointsActivitySchema.index({ userId: 1, createdAt: -1 });
pointsActivitySchema.index({ activityType: 1, createdAt: -1 });

leaderboardSchema.index({ type: 1, 'scope.courseId': 1 });
leaderboardSchema.index({ type: 1, lastUpdated: -1 });

achievementSchema.index({ category: 1, isActive: 1 });
badgeSchema.index({ category: 1, isActive: 1 });

// Export models
export const Badge = mongoose.model('Badge', badgeSchema);
export const UserGamification = mongoose.model('UserGamification', userGamificationSchema);
export const PointsActivity = mongoose.model('PointsActivity', pointsActivitySchema);
export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export const Achievement = mongoose.model('Achievement', achievementSchema);
