/**
 * Analytics Data Models - Phase 5 Step 1
 * Comprehensive analytics data models for learning behavior tracking
 * 
 * Features:
 * - Learning event tracking and analytics
 * - Real-time analytics data storage
 * - User session analytics and metrics
 * - Aggregated analytics for performance
 */

import mongoose from 'mongoose';
const { Schema } = mongoose;

// Learning Event Schema - Individual learning events for real-time tracking
const learningEventSchema = new Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'session_start', 'session_end', 'lesson_start', 'lesson_complete',
      'assessment_start', 'assessment_complete', 'content_interaction',
      'help_request', 'resource_access', 'collaboration_join',
      'achievement_unlock', 'badge_earn', 'level_up', 'streak_update',
      'difficulty_adjust', 'path_change', 'goal_set', 'goal_complete'
    ],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  context: {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module' },
    sessionId: String,
    deviceType: String,
    platform: String,
    userAgent: String,
    location: {
      country: String,
      region: String,
      timezone: String
    }
  },
  data: {
    duration: Number, // in milliseconds
    score: Number,
    completionPercentage: Number,
    difficulty: String,
    interactions: [{
      type: String,
      timestamp: Date,
      duration: Number,
      data: Schema.Types.Mixed
    }],
    performance: {
      accuracy: Number,
      speed: Number,
      confidence: Number,
      attempts: Number
    },
    behavioral: {
      focusScore: Number,
      engagementLevel: String,
      navigationPattern: [String],
      timeDistribution: Schema.Types.Mixed
    }
  },
  metadata: {
    weight: { type: Number, default: 1 },
    category: String,
    tags: [String],
    processed: { type: Boolean, default: false },
    processingErrors: [String]
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Learning Session Schema - Aggregated session data
const learningSessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    index: true
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  context: {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    deviceInfo: {
      type: String,
      platform: String,
      browserName: String,
      browserVersion: String,
      screenResolution: String
    },
    location: {
      country: String,
      region: String,
      timezone: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  activities: {
    lessonsCompleted: { type: Number, default: 0 },
    assessmentsTaken: { type: Number, default: 0 },
    resourcesAccessed: { type: Number, default: 0 },
    socialInteractions: { type: Number, default: 0 },
    helpRequestsMade: { type: Number, default: 0 },
    achievementsEarned: { type: Number, default: 0 }
  },
  performance: {
    averageScore: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 },
    learningVelocity: { type: Number, default: 0 }
  },
  engagement: {
    overallScore: { type: Number, default: 0 },
    focusScore: { type: Number, default: 0 },
    interactionDensity: { type: Number, default: 0 },
    navigationEfficiency: { type: Number, default: 0 },
    contentEngagement: { type: Number, default: 0 }
  },
  behavioral: {
    studyPattern: {
      peakHours: [Number],
      preferredDuration: Number,
      breakFrequency: Number,
      multitaskingLevel: Number
    },
    learningStyle: {
      visualPreference: Number,
      auditoryPreference: Number,
      kinestheticPreference: Number,
      readingPreference: Number
    },
    socialBehavior: {
      collaborationLevel: Number,
      helpSeekingBehavior: Number,
      helpProvidingBehavior: Number,
      communicationFrequency: Number
    }
  },
  events: [{
    eventId: String,
    eventType: String,
    timestamp: Date,
    duration: Number,
    data: Schema.Types.Mixed
  }],
  analytics: {
    totalEvents: { type: Number, default: 0 },
    uniqueActivities: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    satisfactionScore: { type: Number, default: 0 },
    difficultyLevel: String,
    adaptiveAdjustments: Number
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

// Daily Analytics Schema - Aggregated daily metrics
const dailyAnalyticsSchema = new Schema({
  analyticsId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  summary: {
    totalStudyTime: { type: Number, default: 0 }, // in minutes
    sessionsCount: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    assessmentsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 }
  },
  performance: {
    overallScore: { type: Number, default: 0 },
    improvementRate: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    velocityScore: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  engagement: {
    overallEngagement: { type: Number, default: 0 },
    contentEngagement: { type: Number, default: 0 },
    socialEngagement: { type: Number, default: 0 },
    platformEngagement: { type: Number, default: 0 },
    peakActivityHour: { type: Number, default: 12 },
    engagementTrend: String // 'increasing', 'stable', 'decreasing'
  },
  learning: {
    conceptsMastered: { type: Number, default: 0 },
    skillsImproved: [String],
    difficultyProgression: { type: Number, default: 0 },
    adaptivePathChanges: { type: Number, default: 0 },
    personalizedRecommendations: { type: Number, default: 0 }
  },
  social: {
    collaborativeSessions: { type: Number, default: 0 },
    helpRequestsMade: { type: Number, default: 0 },
    helpRequestsFulfilled: { type: Number, default: 0 },
    studyGroupParticipation: { type: Number, default: 0 },
    peerInteractions: { type: Number, default: 0 }
  },
  gamification: {
    pointsEarned: { type: Number, default: 0 },
    badgesEarned: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 },
    streakUpdates: { type: Number, default: 0 },
    levelProgressions: { type: Number, default: 0 },
    challengesCompleted: { type: Number, default: 0 }
  },
  patterns: {
    studyTimeDistribution: [{
      hour: Number,
      minutes: Number,
      engagementScore: Number
    }],
    contentPreferences: [{
      type: String,
      interactionCount: Number,
      averageEngagement: Number
    }],
    difficultyPreferences: [{
      level: String,
      successRate: Number,
      timeSpent: Number
    }]
  },
  predictions: {
    nextDayEngagement: { type: Number, default: 0 },
    nextWeekPerformance: { type: Number, default: 0 },
    goalAchievementLikelihood: { type: Number, default: 0 },
    riskFactors: [String],
    recommendations: [String]
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

// Learning Insights Schema - Processed insights and recommendations
const learningInsightSchema = new Schema({
  insightId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  insightType: {
    type: String,
    required: true,
    enum: [
      'performance_trend', 'engagement_pattern', 'learning_style',
      'difficulty_preference', 'study_optimization', 'social_behavior',
      'goal_progress', 'risk_assessment', 'recommendation', 'prediction'
    ],
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  data: {
    title: String,
    description: String,
    evidence: [String],
    metrics: Schema.Types.Mixed,
    visualizationData: Schema.Types.Mixed,
    actionableSteps: [String],
    expectedOutcome: String,
    timeframe: String
  },
  context: {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    timeframe: {
      start: Date,
      end: Date,
      duration: Number
    },
    triggerEvents: [String],
    relatedInsights: [String]
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'dismissed', 'acted_upon', 'expired'],
    default: 'active',
    index: true
  },
  feedback: {
    userRating: { type: Number, min: 1, max: 5 },
    userComment: String,
    actionTaken: Boolean,
    effectiveness: { type: Number, min: 0, max: 1 },
    ratedAt: Date
  },
  metadata: {
    generatedBy: String, // 'system', 'ml_model', 'instructor'
    modelVersion: String,
    processingTime: Number,
    dataQuality: String,
    tags: [String]
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

// Learning Goals Analytics Schema - Goal tracking and analytics
const learningGoalAnalyticsSchema = new Schema({
  goalAnalyticsId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalId: {
    type: String,
    required: true
  },
  goalDetails: {
    title: String,
    description: String,
    targetValue: Number,
    currentValue: { type: Number, default: 0 },
    unit: String, // 'lessons', 'hours', 'points', 'certificates'
    category: String,
    deadline: Date,
    priority: String
  },
  progress: {
    completionPercentage: { type: Number, default: 0 },
    milestones: [{
      milestone: String,
      targetValue: Number,
      achievedValue: { type: Number, default: 0 },
      completedAt: Date,
      isCompleted: { type: Boolean, default: false }
    }],
    weeklyProgress: [{
      week: Date,
      value: Number,
      velocity: Number
    }]
  },
  analytics: {
    timeToCompletion: {
      estimated: Number, // in days
      actual: Number,
      accuracy: Number
    },
    velocity: {
      current: Number,
      average: Number,
      trend: String, // 'increasing', 'stable', 'decreasing'
      projectedCompletion: Date
    },
    challenges: [{
      challenge: String,
      impact: Number,
      frequency: Number,
      solutions: [String]
    }],
    supportFactors: [{
      factor: String,
      impact: Number,
      frequency: Number
    }]
  },
  predictions: {
    likelihoodOfCompletion: { type: Number, default: 0.5 },
    estimatedCompletionDate: Date,
    riskFactors: [String],
    recommendations: [String],
    interventionsNeeded: Boolean
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled', 'overdue'],
    default: 'active',
    index: true
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

// Indexes for performance optimization
learningEventSchema.index({ userId: 1, timestamp: -1 });
learningEventSchema.index({ eventType: 1, timestamp: -1 });
learningEventSchema.index({ 'context.courseId': 1, timestamp: -1 });
learningEventSchema.index({ 'metadata.processed': 1, timestamp: -1 });

learningSessionSchema.index({ userId: 1, startTime: -1 });
learningSessionSchema.index({ 'context.courseId': 1, startTime: -1 });
learningSessionSchema.index({ endTime: -1 });

dailyAnalyticsSchema.index({ userId: 1, date: -1 });
dailyAnalyticsSchema.index({ date: -1 });

learningInsightSchema.index({ userId: 1, insightType: 1, status: 1 });
learningInsightSchema.index({ priority: 1, status: 1, createdAt: -1 });

learningGoalAnalyticsSchema.index({ userId: 1, status: 1 });
learningGoalAnalyticsSchema.index({ goalId: 1 });

// Pre-save middleware for automatic field updates
learningSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = this.endTime - this.startTime;
  }
  next();
});

dailyAnalyticsSchema.pre('save', function(next) {
  // Auto-calculate overall scores
  if (this.performance && this.engagement) {
    const perfAvg = (this.performance.overallScore + this.performance.consistencyScore + 
                    this.performance.velocityScore) / 3;
    const engAvg = (this.engagement.overallEngagement + this.engagement.contentEngagement + 
                   this.engagement.socialEngagement) / 3;
    
    this.summary.averageScore = (perfAvg + engAvg) / 2;
  }
  next();
});

learningGoalAnalyticsSchema.pre('save', function(next) {
  // Auto-calculate completion percentage
  if (this.goalDetails.targetValue && this.goalDetails.currentValue) {
    this.progress.completionPercentage = Math.min(
      (this.goalDetails.currentValue / this.goalDetails.targetValue) * 100,
      100
    );
  }
  next();
});

// Static methods for analytics queries
learningEventSchema.statics.getEventsByTimeframe = function(userId, startDate, endDate, eventTypes = []) {
  const query = {
    userId,
    timestamp: { $gte: startDate, $lte: endDate }
  };
  
  if (eventTypes.length > 0) {
    query.eventType = { $in: eventTypes };
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

learningSessionSchema.statics.getSessionSummary = function(userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId: userId,
        startTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' },
        totalLessons: { $sum: '$activities.lessonsCompleted' },
        avgScore: { $avg: '$performance.averageScore' },
        avgEngagement: { $avg: '$engagement.overallScore' }
      }
    }
  ]);
};

dailyAnalyticsSchema.statics.getTrendData = function(userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.find({
    userId,
    date: { $gte: startDate }
  }).sort({ date: 1 });
};

// Export models
export const LearningEvent = mongoose.model('LearningEvent', learningEventSchema);
export const LearningSession = mongoose.model('LearningSession', learningSessionSchema);
export const DailyAnalytics = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
export const LearningInsight = mongoose.model('LearningInsight', learningInsightSchema);
export const LearningGoalAnalytics = mongoose.model('LearningGoalAnalytics', learningGoalAnalyticsSchema);
