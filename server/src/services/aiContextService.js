/**
 * AI Context Service - Phase 2 Implementation
 * Automatically gathers rich context from database for AI interactions
 */

import { User, Course, Lesson, UserProgress } from '../models/index.js';

class AIContextService {
  constructor() {
    this.contextCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive context for AI interactions
   */
  async getComprehensiveContext(userId, additionalContext = {}) {
    try {
      // Check cache first
      const cacheKey = `${userId}_${JSON.stringify(additionalContext)}`;
      const cached = this.contextCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.context;
      }

      // Gather context from database
      const context = await this.gatherDatabaseContext(userId, additionalContext);
      
      // Cache the result
      this.contextCache.set(cacheKey, {
        context,
        timestamp: Date.now(),
      });

      // Clean old cache entries
      this.cleanCache();

      return context;

    } catch (error) {
      console.error('Error gathering AI context:', error);
      return this.getFallbackContext(userId, additionalContext);
    }
  }

  /**
   * Gather context from database
   */
  async gatherDatabaseContext(userId, additionalContext = {}) {
    const promises = [
      this.getUserContext(userId),
      this.getRecentProgress(userId),
      this.getCurrentCourseContext(userId, additionalContext.courseId),
      this.getCurrentLessonContext(additionalContext.lessonId),
      this.getLearningAnalytics(userId),
    ];

    const [
      userContext,
      progressContext,
      courseContext,
      lessonContext,
      analyticsContext,
    ] = await Promise.allSettled(promises);

    return {
      user: userContext.status === 'fulfilled' ? userContext.value : {},
      progress: progressContext.status === 'fulfilled' ? progressContext.value : {},
      course: courseContext.status === 'fulfilled' ? courseContext.value : {},
      lesson: lessonContext.status === 'fulfilled' ? lessonContext.value : {},
      analytics: analyticsContext.status === 'fulfilled' ? analyticsContext.value : {},
      metadata: {
        contextGatheredAt: new Date().toISOString(),
        userId,
        additionalContext,
      },
    };
  }

  /**
   * Get user context from database
   */
  async getUserContext(userId) {
    if (!userId) return {};

    const user = await User.findById(userId).select(
      'firstName lastName email username role learningStyle progress createdAt lastLoginAt'
    );

    if (!user) return {};

    return {
      userId: user._id,
      user_name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      email: user.email,
      role: user.role,
      learning_style: user.learningStyle || 'visual',
      experience_level: this.determineExperienceLevel(user.progress, user.createdAt),
      progress_percentage: user.progress,
      enrollment_date: user.createdAt,
      last_login: user.lastLoginAt,
      account_age_days: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    };
  }

  /**
   * Get recent progress context
   */
  async getRecentProgress(userId, limit = 10) {
    if (!userId) return {};

    const recentActivity = await UserProgress.getRecentActivity(userId, limit);
    
    const progressSummary = {
      recent_activities: recentActivity.map(activity => ({
        type: activity.progressType,
        course: activity.courseId?.title || 'Unknown Course',
        lesson: activity.lessonId?.title || 'Unknown Lesson',
        score: activity.progressData?.score,
        time_spent: activity.progressData?.timeSpent,
        completion_percentage: activity.progressData?.completionPercentage,
        timestamp: activity.timestamp,
      })),
      total_activities: recentActivity.length,
      last_activity_date: recentActivity[0]?.timestamp,
    };

    // Calculate learning patterns
    const patterns = this.analyzeLearningPatterns(recentActivity);
    
    return {
      ...progressSummary,
      learning_patterns: patterns,
    };
  }

  /**
   * Get current course context
   */
  async getCurrentCourseContext(userId, courseId) {
    if (!courseId && !userId) return {};

    let course;

    if (courseId) {
      // Get specific course
      course = await Course.findById(courseId)
        .populate('instructor', 'firstName lastName email')
        .populate('lessons');
    } else if (userId) {
      // Get user's most recent course
      const recentProgress = await UserProgress.findOne({ userId })
        .sort({ timestamp: -1 })
        .populate('courseId');
      
      course = recentProgress?.courseId;
    }

    if (!course) return {};

    // Get user's progress in this course
    let userCourseProgress = {};
    if (userId) {
      const progressRecords = await UserProgress.find({
        userId,
        courseId: course._id,
      }).sort({ timestamp: -1 });

      userCourseProgress = this.calculateCourseProgress(progressRecords);
    }

    return {
      courseId: course._id,
      course_title: course.title,
      course_description: course.description,
      course_category: course.category,
      difficulty_level: course.difficulty,
      estimated_duration: course.estimatedDuration,
      course_objectives: course.objectives,
      prerequisites: course.prerequisites,
      instructor_name: course.instructor ? 
        `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown',
      total_lessons: course.lessons?.length || 0,
      course_tags: course.tags,
      user_progress: userCourseProgress,
    };
  }

  /**
   * Get current lesson context
   */
  async getCurrentLessonContext(lessonId) {
    if (!lessonId) return {};

    const lesson = await Lesson.findById(lessonId)
      .populate('courseId', 'title category');

    if (!lesson) return {};

    return {
      lessonId: lesson._id,
      lesson_title: lesson.title,
      lesson_content: lesson.content?.substring(0, 500) + '...', // Truncate for context
      lesson_objectives: lesson.objectives,
      lesson_type: lesson.type,
      estimated_duration: lesson.estimatedDuration,
      lesson_resources: lesson.resources,
      lesson_order: lesson.order,
      course_title: lesson.courseId?.title,
      course_category: lesson.courseId?.category,
    };
  }

  /**
   * Get learning analytics context
   */
  async getLearningAnalytics(userId, days = 30) {
    if (!userId) return {};

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const analytics = await UserProgress.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$progressType',
          count: { $sum: 1 },
          avgScore: { $avg: '$progressData.score' },
          totalTimeSpent: { $sum: '$progressData.timeSpent' },
          completionRate: { $avg: '$progressData.completionPercentage' },
        },
      },
    ]);

    // Calculate performance trends
    const recentScores = await UserProgress.find({
      userId,
      timestamp: { $gte: since },
      'progressData.score': { $exists: true },
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .select('progressData.score timestamp');

    const scores = recentScores.map(r => r.progressData.score).filter(s => s != null);
    const trend = this.calculateTrend(scores);

    return {
      analytics_period_days: days,
      activity_breakdown: analytics,
      recent_scores: scores,
      average_performance: scores.length > 0 ? 
        Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      performance_trend: trend,
      total_time_spent_minutes: analytics.reduce((sum, a) => sum + (a.totalTimeSpent || 0), 0),
      session_frequency: this.calculateSessionFrequency(recentScores),
      improvement_areas: this.identifyImprovementAreas(analytics, scores),
      strengths: this.identifyStrengths(analytics, scores),
    };
  }

  /**
   * Helper methods for context analysis
   */
  determineExperienceLevel(progress, createdAt) {
    const accountAge = Date.now() - createdAt.getTime();
    const daysSinceJoined = accountAge / (1000 * 60 * 60 * 24);

    if (progress < 20 && daysSinceJoined < 7) return 'beginner';
    if (progress < 50 && daysSinceJoined < 30) return 'novice';
    if (progress < 75) return 'intermediate';
    return 'advanced';
  }

  analyzeLearningPatterns(activities) {
    if (!activities.length) return {};

    const timeSlots = activities.reduce((slots, activity) => {
      const hour = new Date(activity.timestamp).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      slots[timeSlot] = (slots[timeSlot] || 0) + 1;
      return slots;
    }, {});

    const preferredTime = Object.entries(timeSlots)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';

    return {
      preferred_learning_time: preferredTime,
      activity_distribution: timeSlots,
      consistency_score: this.calculateConsistency(activities),
    };
  }

  calculateCourseProgress(progressRecords) {
    const lessonCompletions = progressRecords.filter(r => 
      r.progressType === 'lesson_complete'
    ).length;

    const quizAttempts = progressRecords.filter(r => 
      r.progressType === 'quiz_attempt'
    );

    const avgQuizScore = quizAttempts.length > 0 ?
      quizAttempts.reduce((sum, q) => sum + (q.progressData?.score || 0), 0) / quizAttempts.length : 0;

    return {
      lessons_completed: lessonCompletions,
      quiz_attempts: quizAttempts.length,
      average_quiz_score: Math.round(avgQuizScore),
      last_activity: progressRecords[0]?.timestamp,
      total_time_spent: progressRecords.reduce((sum, r) => 
        sum + (r.progressData?.timeSpent || 0), 0
      ),
    };
  }

  calculateTrend(scores) {
    if (scores.length < 2) return 'insufficient_data';
    
    const recent = scores.slice(0, Math.ceil(scores.length / 2));
    const older = scores.slice(Math.ceil(scores.length / 2));
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  calculateSessionFrequency(activities) {
    if (activities.length < 2) return 'insufficient_data';
    
    const sessions = activities.length;
    const timeSpan = new Date(activities[0].timestamp) - new Date(activities[activities.length - 1].timestamp);
    const days = timeSpan / (1000 * 60 * 60 * 24);
    
    const frequency = sessions / Math.max(days, 1);
    
    if (frequency > 1) return 'daily';
    if (frequency > 0.5) return 'frequent';
    if (frequency > 0.2) return 'moderate';
    return 'infrequent';
  }

  identifyImprovementAreas(analytics, scores) {
    const areas = [];
    
    const quizData = analytics.find(a => a._id === 'quiz_attempt');
    if (quizData && quizData.avgScore < 70) {
      areas.push('quiz_performance');
    }
    
    if (scores.length > 3 && this.calculateTrend(scores) === 'declining') {
      areas.push('performance_consistency');
    }
    
    const completionData = analytics.find(a => a._id === 'lesson_complete');
    if (completionData && completionData.completionRate < 80) {
      areas.push('lesson_completion');
    }
    
    return areas;
  }

  identifyStrengths(analytics, scores) {
    const strengths = [];
    
    const quizData = analytics.find(a => a._id === 'quiz_attempt');
    if (quizData && quizData.avgScore > 85) {
      strengths.push('strong_quiz_performance');
    }
    
    if (scores.length > 3 && this.calculateTrend(scores) === 'improving') {
      strengths.push('improving_performance');
    }
    
    const completionData = analytics.find(a => a._id === 'lesson_complete');
    if (completionData && completionData.completionRate > 90) {
      strengths.push('consistent_completion');
    }
    
    return strengths;
  }

  calculateConsistency(activities) {
    if (activities.length < 3) return 0;
    
    const timestamps = activities.map(a => new Date(a.timestamp).getTime());
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i-1] - timestamps[i]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length;
    
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / avgInterval;
    
    // Convert to a 0-100 score where lower variation = higher consistency
    return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  }

  /**
   * Get fallback context when database retrieval fails
   */
  getFallbackContext(userId, additionalContext) {
    return {
      user: {
        userId,
        user_name: 'User',
        learning_style: 'visual',
        experience_level: 'intermediate',
      },
      course: additionalContext.course || {},
      lesson: additionalContext.lesson || {},
      progress: {},
      analytics: {},
      metadata: {
        contextGatheredAt: new Date().toISOString(),
        fallback: true,
        error: 'Database context retrieval failed',
      },
    };
  }

  /**
   * Clean old cache entries
   */
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.contextCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.contextCache.delete(key);
      }
    }
  }

  /**
   * Clear cache for specific user (useful after user updates)
   */
  clearUserCache(userId) {
    for (const key of this.contextCache.keys()) {
      if (key.startsWith(userId)) {
        this.contextCache.delete(key);
      }
    }
  }

  /**
   * Get context statistics for monitoring
   */
  getContextStats() {
    return {
      cacheSize: this.contextCache.size,
      cacheTimeout: this.cacheTimeout,
      timestamp: new Date().toISOString(),
    };
  }
}

// Create singleton instance
const aiContextService = new AIContextService();

export default aiContextService;
export { AIContextService };
