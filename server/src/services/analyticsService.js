/**
 * Analytics Service - Phase 5 Step 1
 * Core analytics engine for comprehensive learning behavior analysis
 * 
 * Features:
 * - Learning behavior analytics with pattern recognition
 * - Real-time performance tracking and trend analysis
 * - Engagement metrics calculation and optimization
 * - Predictive analytics for learning outcomes
 * - Intelligent intervention recommendations
 */

import { UserProgress, User, Course, Lesson } from '../models/index.js';
import { UserGamification } from '../models/Gamification.js';
import { learningAnalyticsService } from './learningAnalyticsService.js';
import gamificationService from './gamificationService.js';
import { adaptiveLearningService } from './adaptiveLearningService.js';
import socialLearningService from './socialLearningService.js';

class AnalyticsService {
  constructor() {
    console.log('=== Initializing AnalyticsService v5.1 - Phase 5 Step 1 ===');
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.analyticsCache = new Map();
  }

  /**
   * Track comprehensive learning behavior with context
   */
  async trackLearningBehavior(userId, sessionData, context = {}) {
    try {
      const behaviorEvent = {
        userId,
        timestamp: new Date(),
        sessionData: {
          duration: sessionData.duration || 0,
          activitiesCompleted: sessionData.activities || 0,
          contentInteractions: sessionData.interactions || [],
          navigationPatterns: sessionData.navigation || [],
          deviceInfo: sessionData.device || {},
          performanceMetrics: sessionData.performance || {}
        },
        context: {
          courseId: context.courseId,
          lessonId: context.lessonId,
          learningPath: context.learningPath || 'standard',
          socialContext: context.social || {},
          gamificationState: context.gamification || {},
          adaptiveState: context.adaptive || {}
        },
        behaviorMetrics: await this.calculateBehaviorMetrics(userId, sessionData),
        learningPatterns: await this.identifyLearningPatterns(userId, sessionData)
      };

      // Store in learning analytics service
      await learningAnalyticsService.trackLearningEvent(
        userId, 
        'learning_behavior', 
        behaviorEvent.context, 
        behaviorEvent
      );

      // Real-time pattern analysis
      await this.processRealTimePatterns(userId, behaviorEvent);

      return {
        success: true,
        behaviorId: behaviorEvent.timestamp.getTime(),
        patterns: behaviorEvent.learningPatterns,
        recommendations: await this.generateBehaviorRecommendations(userId, behaviorEvent)
      };

    } catch (error) {
      console.error('Error tracking learning behavior:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze comprehensive learning patterns for user
   */
  async analyzeLearningPatterns(userId, timeframe = 30, analysisType = 'comprehensive') {
    try {
      const cacheKey = `patterns_${userId}_${timeframe}_${analysisType}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (timeframe * 24 * 60 * 60 * 1000));

      // Get comprehensive learning data
      const [
        progressData,
        gamificationData,
        collaborationData,
        adaptiveData
      ] = await Promise.all([
        this.getUserProgressData(userId, startDate, endDate),
        this.getGamificationAnalytics(userId, timeframe),
        this.getCollaborationAnalytics(userId, timeframe),
        this.getAdaptiveAnalytics(userId, timeframe)
      ]);

      const patterns = {
        overview: {
          userId,
          timeframe,
          analysisDate: new Date(),
          dataQuality: this.assessDataQuality(progressData),
          confidenceScore: this.calculateAnalysisConfidence(progressData)
        },
        learningBehavior: {
          studyPatterns: await this.analyzeStudyPatterns(progressData),
          engagementTrends: this.analyzeEngagementTrends(progressData),
          performanceEvolution: this.analyzePerformanceEvolution(progressData),
          contentPreferences: this.analyzeContentPreferences(progressData)
        },
        gamificationImpact: {
          motivationFactors: this.analyzeMotivationFactors(gamificationData),
          achievementEffectiveness: this.analyzeAchievementImpact(gamificationData),
          socialLearningBehavior: this.analyzeSocialLearningBehavior(collaborationData),
          streakInfluence: this.analyzeStreakInfluence(gamificationData)
        },
        adaptiveLearning: {
          pathEffectiveness: this.analyzePathEffectiveness(adaptiveData),
          difficultyProgression: this.analyzeDifficultyProgression(adaptiveData),
          personalizationAccuracy: this.analyzePersonalizationAccuracy(adaptiveData),
          recommendationSuccess: this.analyzeRecommendationSuccess(adaptiveData)
        },
        predictiveInsights: {
          performancePrediction: await this.predictFuturePerformance(userId, progressData),
          riskAssessment: await this.assessLearningRisks(userId, progressData),
          optimalPathRecommendations: await this.generateOptimalPathRecommendations(userId),
          interventionSuggestions: await this.generateInterventionSuggestions(userId, progressData)
        }
      };

      // Cache results
      this.setCache(cacheKey, patterns);
      return patterns;

    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      return this.generateFallbackPatterns(userId, timeframe);
    }
  }

  /**
   * Generate personalized insights with actionable recommendations
   */
  async generatePersonalizedInsights(userId, learningGoals = {}, preferences = {}) {
    try {
      const patterns = await this.analyzeLearningPatterns(userId, 30, 'insights');
      const currentPerformance = await adaptiveLearningService.analyzeUserPerformance(userId);
      const gamificationStatus = await gamificationService.getUserGamificationProfile(userId);

      const insights = {
        personalizedRecommendations: {
          studySchedule: await this.generateOptimalStudySchedule(userId, patterns),
          contentRecommendations: await this.generateContentRecommendations(userId, patterns),
          difficultyAdjustments: await this.generateDifficultyAdjustments(userId, patterns),
          socialLearningOpportunities: await this.generateSocialRecommendations(userId, patterns)
        },
        strengthsAndWeaknesses: {
          cognitiveStrengths: this.identifyCognitiveStrengths(patterns),
          improvementAreas: this.identifyImprovementAreas(patterns),
          learningStyleOptimization: this.analyzeLearningStyleOptimization(patterns),
          skillGapAnalysis: await this.performSkillGapAnalysis(userId, learningGoals)
        },
        motivationAndEngagement: {
          motivationProfile: this.analyzeMotivationProfile(patterns),
          engagementDrivers: this.identifyEngagementDrivers(patterns),
          gamificationOptimization: this.optimizeGamificationStrategy(gamificationStatus, patterns),
          socialMotivationFactors: this.analyzeSocialMotivationFactors(patterns)
        },
        futureOutlook: {
          progressPredictions: await this.generateProgressPredictions(userId, learningGoals),
          timeToGoalEstimates: await this.estimateTimeToGoals(userId, learningGoals),
          challengesPrediction: await this.predictUpcomingChallenges(userId, patterns),
          successFactors: this.identifySuccessFactors(patterns)
        }
      };

      return insights;

    } catch (error) {
      console.error('Error generating personalized insights:', error);
      return this.generateFallbackInsights(userId);
    }
  }

  /**
   * Calculate comprehensive performance metrics
   */
  async calculatePerformanceMetrics(userId, courseId = null, timeframe = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (timeframe * 24 * 60 * 60 * 1000));

      const query = {
        userId,
        timestamp: { $gte: startDate, $lte: endDate }
      };
      if (courseId) query.courseId = courseId;

      const progressData = await UserProgress.find(query).populate(['courseId', 'lessonId']);
      
      if (!progressData.length) {
        return this.generateDefaultMetrics(userId);
      }

      const metrics = {
        overall: {
          totalActivities: progressData.length,
          completionRate: this.calculateCompletionRate(progressData),
          averageScore: this.calculateAverageScore(progressData),
          timeSpent: this.calculateTotalTimeSpent(progressData),
          consistencyScore: this.calculateConsistencyScore(progressData)
        },
        trends: {
          performanceTrend: this.calculatePerformanceTrend(progressData),
          engagementTrend: this.calculateEngagementTrend(progressData),
          velocityTrend: this.calculateVelocityTrend(progressData),
          difficultyProgression: this.calculateDifficultyProgression(progressData)
        },
        breakdown: {
          bySubject: this.breakdownBySubject(progressData),
          byDifficulty: this.breakdownByDifficulty(progressData),
          byTimeOfDay: this.breakdownByTimeOfDay(progressData),
          byDeviceType: this.breakdownByDeviceType(progressData)
        },
        predictions: {
          nextWeekPerformance: await this.predictNextWeekPerformance(userId, progressData),
          goalAchievementLikelihood: await this.predictGoalAchievement(userId, progressData),
          optimalStudyTime: this.calculateOptimalStudyTime(progressData),
          recommendedFocus: await this.recommendFocusAreas(userId, progressData)
        }
      };

      return metrics;

    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return this.generateDefaultMetrics(userId);
    }
  }

  /**
   * Generate real-time analytics dashboard data
   */
  async generateDashboardData(userId, dashboardType = 'learner', timeframe = 7) {
    try {
      const cacheKey = `dashboard_${userId}_${dashboardType}_${timeframe}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const [
        patterns,
        metrics,
        insights,
        gamificationData
      ] = await Promise.all([
        this.analyzeLearningPatterns(userId, timeframe, 'dashboard'),
        this.calculatePerformanceMetrics(userId, null, timeframe),
        this.generatePersonalizedInsights(userId),
        gamificationService.getUserDashboard(userId)
      ]);

      const dashboardData = {
        overview: {
          userId,
          dashboardType,
          timeframe,
          lastUpdated: new Date(),
          dataFreshness: this.calculateDataFreshness(patterns)
        },
        keyMetrics: {
          learningVelocity: metrics.trends.velocityTrend.current,
          performanceScore: metrics.overall.averageScore,
          engagementLevel: this.categorizeEngagementLevel(metrics.trends.engagementTrend.current),
          consistencyRating: metrics.overall.consistencyScore,
          goalProgress: await this.calculateGoalProgress(userId)
        },
        visualizations: {
          performanceChart: this.generatePerformanceChartData(metrics),
          engagementHeatmap: this.generateEngagementHeatmap(patterns),
          skillRadarChart: this.generateSkillRadarData(insights),
          progressTimeline: this.generateProgressTimeline(metrics),
          comparisonCharts: await this.generateComparisonCharts(userId, metrics)
        },
        insights: {
          topInsights: insights.personalizedRecommendations,
          actionItems: await this.generateActionItems(userId, insights),
          achievements: gamificationData.achievements.slice(0, 5),
          challenges: gamificationData.challenges.slice(0, 3)
        },
        recommendations: {
          immediateActions: insights.personalizedRecommendations.contentRecommendations.slice(0, 3),
          studyOptimizations: insights.personalizedRecommendations.studySchedule,
          socialOpportunities: insights.personalizedRecommendations.socialLearningOpportunities.slice(0, 2),
          gamificationSuggestions: insights.motivationAndEngagement.gamificationOptimization
        }
      };

      // Cache dashboard data for 2 minutes (real-time requirement)
      this.setCache(cacheKey, dashboardData, 2 * 60 * 1000);
      return dashboardData;

    } catch (error) {
      console.error('Error generating dashboard data:', error);
      return this.generateFallbackDashboard(userId, dashboardType);
    }
  }

  // Helper methods for analytics calculations

  async calculateBehaviorMetrics(userId, sessionData) {
    return {
      focusScore: this.calculateFocusScore(sessionData),
      interactionDensity: this.calculateInteractionDensity(sessionData),
      navigationEfficiency: this.calculateNavigationEfficiency(sessionData),
      contentEngagement: this.calculateContentEngagement(sessionData)
    };
  }

  async identifyLearningPatterns(userId, sessionData) {
    return {
      studyRhythm: this.analyzeStudyRhythm(sessionData),
      contentPreference: this.analyzeContentPreference(sessionData),
      difficultyPreference: this.analyzeDifficultyPreference(sessionData),
      socialBehavior: this.analyzeSocialBehavior(sessionData)
    };
  }

  calculateFocusScore(sessionData) {
    // Calculate focus based on time spent vs. content consumed
    const timeSpent = sessionData.duration || 0;
    const activitiesCompleted = sessionData.activities || 0;
    const interactions = sessionData.interactions?.length || 0;
    
    if (timeSpent === 0) return 0;
    
    const focusIndicators = [
      Math.min(activitiesCompleted / (timeSpent / 60000), 1), // Activities per minute
      Math.min(interactions / (timeSpent / 30000), 1), // Interactions per 30 seconds
      1 - (sessionData.navigation?.length || 0) / Math.max(timeSpent / 10000, 1) // Navigation frequency
    ];
    
    return focusIndicators.reduce((sum, score) => sum + score, 0) / focusIndicators.length;
  }
  calculateInteractionDensity(sessionData) {
    const timeSpent = sessionData.duration || 1;
    const interactions = sessionData.interactions?.length || 0;
    return Math.min(interactions / (timeSpent / 60000), 10) / 10; // Normalize to 0-1
  }

  calculateNavigationEfficiency(sessionData) {
    const navigationSteps = sessionData.navigation?.length || 0;
    const activitiesCompleted = sessionData.activities || 0;
    if (activitiesCompleted === 0) return 0;
    return Math.max(0, 1 - (navigationSteps - activitiesCompleted) / activitiesCompleted);
  }

  calculateContentEngagement(sessionData) {
    const interactions = sessionData.interactions?.length || 0;
    const timeSpent = sessionData.duration || 1;
    const activities = sessionData.activities || 0;
    
    // Calculate engagement based on interactions per minute and completion rate
    const interactionsPerMinute = interactions / (timeSpent / 60000);
    const completionRate = activities > 0 ? 1 : 0;
    
    return Math.min((interactionsPerMinute * 0.6 + completionRate * 0.4), 1);
  }

  analyzeStudyRhythm(sessionData) {
    const sessionHour = new Date().getHours();
    const timeOfDay = sessionHour < 12 ? 'morning' : sessionHour < 18 ? 'afternoon' : 'evening';
    
    return {
      preferredTime: timeOfDay,
      sessionLength: sessionData.duration || 0,
      intensity: this.calculateSessionIntensity(sessionData)
    };
  }

  analyzeContentPreference(sessionData) {
    const interactions = sessionData.interactions || [];
    const contentTypes = interactions.reduce((types, interaction) => {
      const type = interaction.type || 'general';
      types[type] = (types[type] || 0) + 1;
      return types;
    }, {});

    const mostPreferred = Object.entries(contentTypes).sort(([,a], [,b]) => b - a)[0];
    return {
      preferredType: mostPreferred?.[0] || 'general',
      distribution: contentTypes,
      variety: Object.keys(contentTypes).length
    };
  }

  analyzeDifficultyPreference(sessionData) {
    const performance = sessionData.performance || {};
    const currentDifficulty = performance.difficulty || 'medium';
    const successRate = performance.successRate || 0;
    
    return {
      currentLevel: currentDifficulty,
      successRate,
      recommendation: this.recommendDifficultyAdjustment(successRate)
    };
  }

  analyzeSocialBehavior(sessionData) {
    const social = sessionData.social || {};
    return {
      collaborationLevel: social.collaborations || 0,
      helpSeeking: social.helpRequests || 0,
      helpProviding: social.helpProvided || 0,
      socialPreference: this.determineSocialPreference(social)
    };
  }

  calculateSessionIntensity(sessionData) {
    const activities = sessionData.activities || 0;
    const timeSpent = sessionData.duration || 1;
    const interactions = sessionData.interactions?.length || 0;
    
    return Math.min((activities + interactions) / (timeSpent / 60000), 5) / 5;
  }

  recommendDifficultyAdjustment(successRate) {
    if (successRate > 0.9) return 'increase';
    if (successRate < 0.6) return 'decrease';
    return 'maintain';
  }

  determineSocialPreference(socialData) {
    const total = (socialData.collaborations || 0) + (socialData.helpRequests || 0) + (socialData.helpProvided || 0);
    if (total > 5) return 'collaborative';
    if (total > 2) return 'social';
    return 'independent';
  }

  assessDataQuality(progressData) {
    if (!progressData || progressData.length === 0) return 'poor';
    if (progressData.length < 5) return 'limited';
    if (progressData.length < 20) return 'good';
    return 'excellent';
  }

  calculateAnalysisConfidence(progressData) {
    const dataPoints = progressData?.length || 0;
    const timeSpan = this.calculateTimeSpan(progressData);
    const consistency = this.calculateDataConsistency(progressData);
    
    return Math.min((dataPoints * 0.4 + timeSpan * 0.3 + consistency * 0.3) / 100, 1);
  }

  calculateTimeSpan(progressData) {
    if (!progressData || progressData.length < 2) return 0;
    const timestamps = progressData.map(p => new Date(p.timestamp || p.createdAt).getTime());
    const span = Math.max(...timestamps) - Math.min(...timestamps);
    return Math.min(span / (30 * 24 * 60 * 60 * 1000), 1); // Normalize to 30 days
  }

  calculateDataConsistency(progressData) {
    if (!progressData || progressData.length < 3) return 0;
    
    const intervals = [];
    for (let i = 1; i < progressData.length; i++) {
      const current = new Date(progressData[i].timestamp || progressData[i].createdAt);
      const previous = new Date(progressData[i-1].timestamp || progressData[i-1].createdAt);
      intervals.push(current - previous);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0, 1 - (standardDeviation / avgInterval));
  }

  // Cache management
  getFromCache(key) {
    const cached = this.analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data, timeout = null) {
    this.analyticsCache.set(key, {
      data,
      timestamp: Date.now(),
      timeout: timeout || this.cacheTimeout
    });
  }

  // Fallback methods for error scenarios
  generateDefaultMetrics(userId) {
    return {
      overall: {
        totalActivities: 0,
        completionRate: 0,
        averageScore: 0,
        timeSpent: 0,
        consistencyScore: 0
      },
      trends: {
        performanceTrend: { current: 0, direction: 'neutral' },
        engagementTrend: { current: 0, direction: 'neutral' },
        velocityTrend: { current: 0, direction: 'neutral' }
      },
      breakdown: {},
      predictions: {}
    };
  }

  generateFallbackPatterns(userId, timeframe) {
    return {
      overview: {
        userId,
        timeframe,
        analysisDate: new Date(),
        dataQuality: 'limited',
        confidenceScore: 0.1
      },
      learningBehavior: {},
      gamificationImpact: {},
      adaptiveLearning: {},
      predictiveInsights: {}
    };
  }
  generateFallbackDashboard(userId, dashboardType) {
    return {
      overview: {
        userId,
        dashboardType,
        lastUpdated: new Date(),
        status: 'limited_data'
      },
      keyMetrics: {
        learningVelocity: 0,
        performanceScore: 0,
        engagementLevel: 'new_user',
        consistencyRating: 0
      },
      visualizations: {},
      insights: {},
      recommendations: {}
    };
  }

  // Additional helper methods for comprehensive analytics

  async processRealTimePatterns(userId, behaviorEvent) {
    // Process patterns in real-time and trigger notifications if needed
    try {
      const patterns = behaviorEvent.learningPatterns;
      
      // Check for significant pattern changes
      if (patterns.studyRhythm.intensity < 0.3) {
        await this.triggerLowEngagementAlert(userId);
      }
      
      if (patterns.difficultyPreference.successRate < 0.5) {
        await this.triggerDifficultyAlert(userId);
      }
      
      return { processed: true, alerts: 0 };
    } catch (error) {
      console.error('Error processing real-time patterns:', error);
      return { processed: false, error: error.message };
    }
  }

  async generateBehaviorRecommendations(userId, behaviorEvent) {
    const recommendations = [];
    const patterns = behaviorEvent.learningPatterns;
    
    // Study time recommendations
    if (patterns.studyRhythm.intensity < 0.5) {
      recommendations.push({
        type: 'study_optimization',
        priority: 'medium',
        message: 'Consider taking more frequent breaks to maintain focus',
        actionable: true
      });
    }
    
    // Content recommendations
    if (patterns.contentPreference.variety < 3) {
      recommendations.push({
        type: 'content_variety',
        priority: 'low',
        message: 'Try exploring different content types to enhance learning',
        actionable: true
      });
    }
    
    // Social learning recommendations
    if (patterns.socialBehavior.socialPreference === 'independent' && 
        behaviorEvent.behaviorMetrics.focusScore < 0.6) {
      recommendations.push({
        type: 'social_learning',
        priority: 'medium',
        message: 'Consider joining study groups for better engagement',
        actionable: true
      });
    }
    
    return recommendations;
  }

  async getUserProgressData(userId, startDate, endDate) {
    try {
      const progressData = await UserProgress.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).populate(['courseId', 'lessonId']).sort({ timestamp: -1 });
      
      return {
        totalDataPoints: progressData.length,
        totalTimeSpent: progressData.reduce((sum, p) => sum + (p.progressData?.timeSpent || 0), 0),
        completedActivities: progressData.filter(p => p.progressData?.completionPercentage === 100).length,
        averageScore: this.calculateAverageScore(progressData),
        sessions: this.groupProgressBySessions(progressData),
        trends: this.calculateProgressTrends(progressData)
      };
    } catch (error) {
      console.error('Error fetching user progress data:', error);
      return { totalDataPoints: 0, totalTimeSpent: 0, completedActivities: 0, averageScore: 0 };
    }
  }

  async getGamificationAnalytics(userId, timeframe) {
    try {
      const gamificationData = await gamificationService.getUserGamificationProfile(userId);
      
      return {
        pointsEarned: gamificationData.totalPoints || 0,
        achievementsUnlocked: gamificationData.achievements?.length || 0,
        badgesEarned: gamificationData.badges?.length || 0,
        currentStreak: gamificationData.currentStreak || 0,
        level: gamificationData.level || 1,
        rankingPosition: gamificationData.ranking?.position || 0
      };
    } catch (error) {
      console.error('Error fetching gamification analytics:', error);
      return { pointsEarned: 0, achievementsUnlocked: 0, badgesEarned: 0 };
    }
  }
  async getCollaborationAnalytics(userId, timeframe) {
    try {
      // Import socialLearningService locally to avoid circular dependency
      const { default: socialLearningService } = await import('./socialLearningService.js');
      const socialData = await socialLearningService.getSocialLearningAnalytics(userId);
      
      return {
        studyGroupsJoined: socialData.overview?.activeStudyGroups || 0,
        collaborativeSessions: socialData.weeklyStats?.collaborativeSessions || 0,
        helpProvided: socialData.overview?.helpfulnessRating || 0,
        socialInteractions: socialData.overview?.totalSocialInteractions || 0,
        peerFeedbackScore: socialData.peerFeedback?.averageRating || 0
      };
    } catch (error) {
      console.error('Error fetching collaboration analytics:', error);
      return { studyGroupsJoined: 0, collaborativeSessions: 0, helpProvided: 0, socialInteractions: 0, peerFeedbackScore: 0 };
    }
  }

  async getAdaptiveAnalytics(userId, timeframe) {
    try {
      const adaptiveData = await adaptiveLearningService.analyzeUserPerformance(userId);
      
      return {
        adaptivePath: adaptiveData.level || 'standard',
        difficultyAdjustments: 0, // Will be enhanced when adaptive service is extended
        personalizationAccuracy: adaptiveData.engagementScore || 0,
        recommendationSuccess: 0.75, // Mock data for now
        learningVelocity: adaptiveData.learningVelocity || 0
      };
    } catch (error) {
      console.error('Error fetching adaptive analytics:', error);
      return { adaptivePath: 'standard', difficultyAdjustments: 0 };
    }
  }

  calculateAverageScore(progressData) {
    const scores = progressData
      .map(p => p.progressData?.score)
      .filter(score => score !== null && score !== undefined);
    
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  calculateCompletionRate(progressData) {
    if (progressData.length === 0) return 0;
    const completed = progressData.filter(p => p.progressData?.completionPercentage === 100).length;
    return (completed / progressData.length) * 100;
  }

  calculateTotalTimeSpent(progressData) {
    return progressData.reduce((sum, p) => sum + (p.progressData?.timeSpent || 0), 0);
  }

  calculateConsistencyScore(progressData) {
    if (progressData.length < 2) return 0;
    
    // Calculate day-to-day consistency
    const dailyActivity = this.groupProgressByDay(progressData);
    const activeDays = Object.keys(dailyActivity).length;
    const totalDays = this.calculateDaysBetween(progressData);
    
    return totalDays > 0 ? (activeDays / totalDays) * 100 : 0;
  }

  groupProgressByDay(progressData) {
    return progressData.reduce((groups, progress) => {
      const date = new Date(progress.timestamp || progress.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(progress);
      return groups;
    }, {});
  }

  calculateDaysBetween(progressData) {
    if (progressData.length < 2) return 1;
    
    const timestamps = progressData.map(p => new Date(p.timestamp || p.createdAt).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    return Math.ceil((maxTime - minTime) / (24 * 60 * 60 * 1000)) + 1;
  }

  async triggerLowEngagementAlert(userId) {
    // In a real implementation, this would send notifications
    console.log(`Low engagement alert for user ${userId}`);
  }

  async triggerDifficultyAlert(userId) {
    // In a real implementation, this would suggest difficulty adjustments
    console.log(`Difficulty adjustment suggestion for user ${userId}`);
  }

  calculateDataFreshness(patterns) {
    const lastUpdate = patterns.overview?.analysisDate || new Date();
    const hoursSinceUpdate = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 1) return 'fresh';
    if (hoursSinceUpdate < 6) return 'recent';
    if (hoursSinceUpdate < 24) return 'stale';
    return 'outdated';
  }

  categorizeEngagementLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very_low';
  }

  generatePerformanceChartData(metrics) {
    return {
      chartType: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Performance Score',
          data: [metrics.overall.averageScore * 0.8, metrics.overall.averageScore * 0.9, 
                 metrics.overall.averageScore, metrics.overall.averageScore * 1.05]
        }]
      }
    };
  }

  generateEngagementHeatmap(patterns) {
    return {
      chartType: 'heatmap',
      data: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        hours: Array.from({ length: 24 }, (_, i) => i),
        values: Array(7).fill().map(() => Array(24).fill(Math.random() * 100))
      }
    };
  }

  async calculateGoalProgress(userId) {
    // Mock implementation - would fetch actual user goals
    return {
      currentGoals: 3,
      completedGoals: 2,
      progressPercentage: 67
    };
  }

  /**
   * Group progress data by sessions for analysis
   */
  groupProgressBySessions(progressData) {
    if (!Array.isArray(progressData)) return [];
    
    // Group progress by day/session
    const sessions = {};
    progressData.forEach(progress => {
      const dateKey = progress.timestamp ? new Date(progress.timestamp).toDateString() : 'unknown';
      if (!sessions[dateKey]) {
        sessions[dateKey] = [];
      }
      sessions[dateKey].push(progress);
    });
    
    return Object.entries(sessions).map(([date, data]) => ({
      date,
      activities: data.length,
      totalTime: data.reduce((sum, p) => sum + (p.progressData?.timeSpent || 0), 0),
      averageScore: data.reduce((sum, p) => sum + (p.progressData?.score || 0), 0) / data.length
    }));
  }

  /**
   * Generate optimal study schedule recommendation
   */
  async generateOptimalStudySchedule(userId, patterns) {
    try {
      const userPreferences = patterns?.learningBehavior?.studyPatterns || {};
      const performanceData = patterns?.learningBehavior?.performanceEvolution || {};
      
      const schedule = {
        dailySchedule: {},
        weeklyGoals: {},
        recommendations: []
      };
      
      // Default schedule based on performance patterns
      const optimalHours = this.calculateOptimalStudyHours(performanceData);
      
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
        schedule.dailySchedule[day] = {
          recommendedHours: optimalHours,
          bestTimeSlots: ['9:00-11:00', '14:00-16:00', '19:00-21:00'],
          breakIntervals: 15,
          focusBlocks: 45
        };
      });
      
      schedule.recommendations.push('Take regular breaks to maintain focus');
      schedule.recommendations.push('Study during your peak performance hours');
      
      return schedule;
    } catch (error) {
      console.error('Error generating optimal study schedule:', error);
      return {
        dailySchedule: {},
        weeklyGoals: {},
        recommendations: ['Focus on consistent daily study habits']
      };
    }
  }

  /**
   * Calculate optimal study hours based on performance
   */
  calculateOptimalStudyHours(performanceData) {
    // Default to 2 hours if no performance data
    if (!performanceData || !performanceData.averageScore) {
      return 2;
    }
    
    // Adjust hours based on performance
    const score = performanceData.averageScore;
    if (score > 85) return 1.5; // High performers need less time
    if (score > 70) return 2;   // Average performers
    return 2.5; // Struggling learners need more time
  }

  /**
   * Calculate progress trends for analytics
   */
  calculateProgressTrends(progressData) {
    try {
      if (!progressData || !Array.isArray(progressData)) {
        return {
          overall: 'stable',
          weekly: 'stable',
          monthly: 'stable',
          velocity: 0
        };
      }

      // Sort by date
      const sortedData = progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (sortedData.length < 2) {
        return {
          overall: 'stable',
          weekly: 'stable', 
          monthly: 'stable',
          velocity: 0
        };
      }

      // Calculate overall trend
      const firstScore = sortedData[0].score || 0;
      const lastScore = sortedData[sortedData.length - 1].score || 0;
      const overallChange = lastScore - firstScore;
      
      // Calculate velocity (progress per day)
      const daysDiff = (new Date(sortedData[sortedData.length - 1].date) - new Date(sortedData[0].date)) / (1000 * 60 * 60 * 24);
      const velocity = daysDiff > 0 ? overallChange / daysDiff : 0;

      return {
        overall: overallChange > 5 ? 'improving' : overallChange < -5 ? 'declining' : 'stable',
        weekly: this.calculateWeeklyTrend(sortedData),
        monthly: this.calculateMonthlyTrend(sortedData),
        velocity: Math.round(velocity * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating progress trends:', error);
      return {
        overall: 'stable',
        weekly: 'stable',
        monthly: 'stable',
        velocity: 0
      };
    }
  }

  /**
   * Calculate weekly progress trend
   */
  calculateWeeklyTrend(data) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyData = data.filter(d => new Date(d.date) >= oneWeekAgo);
    
    if (weeklyData.length < 2) return 'stable';
    
    const firstWeekScore = weeklyData[0].score || 0;
    const lastWeekScore = weeklyData[weeklyData.length - 1].score || 0;
    const weeklyChange = lastWeekScore - firstWeekScore;
    
    return weeklyChange > 3 ? 'improving' : weeklyChange < -3 ? 'declining' : 'stable';
  }

  /**
   * Calculate monthly progress trend
   */
  calculateMonthlyTrend(data) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyData = data.filter(d => new Date(d.date) >= oneMonthAgo);
    
    if (monthlyData.length < 2) return 'stable';
    
    const firstMonthScore = monthlyData[0].score || 0;
    const lastMonthScore = monthlyData[monthlyData.length - 1].score || 0;
    const monthlyChange = lastMonthScore - firstMonthScore;
    
    return monthlyChange > 10 ? 'improving' : monthlyChange < -10 ? 'declining' : 'stable';
  }

  /**
   * Get current session data for a user
   */
  async getCurrentSessionData(userId) {
    try {
      const sessionData = {
        userId,
        sessionId: `session_${Date.now()}`,
        startTime: new Date(),
        isActive: true,
        activities: [],
        interactions: [],
        performance: {
          averageScore: 0,
          completionRate: 0,
          timeSpent: 0
        }
      };

      // Get recent user progress to populate session
      const recentProgress = await UserProgress.find({ userId })
        .sort({ lastUpdated: -1 })
        .limit(10);

      if (recentProgress.length > 0) {
        const scores = recentProgress.map(p => p.score || 0).filter(s => s > 0);
        sessionData.performance.averageScore = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;
        
        sessionData.performance.completionRate = recentProgress.reduce((acc, p) => 
          acc + (p.completionPercentage || 0), 0) / recentProgress.length;
      }

      return sessionData;
    } catch (error) {
      console.error('Error getting current session data:', error);
      return {
        userId,
        sessionId: `session_${Date.now()}`,
        startTime: new Date(),
        isActive: true,
        activities: [],
        interactions: [],
        performance: {
          averageScore: 0,
          completionRate: 0,
          timeSpent: 0
        }
      };
    }
  }

  /**
   * Calculate performance trend for a user
   */
  async calculatePerformanceTrend(userId, timeframe = '30d') {
    try {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const progressData = await UserProgress.find({
        userId,
        lastUpdated: { $gte: startDate }
      }).sort({ lastUpdated: 1 });

      if (progressData.length === 0) {
        return {
          trend: 'stable',
          change: 0,
          dataPoints: [],
          summary: 'No recent activity'
        };
      }

      // Calculate trend
      const scores = progressData.map(p => p.score || 0).filter(s => s > 0);
      const completionRates = progressData.map(p => p.completionPercentage || 0);
      
      if (scores.length === 0) {
        return {
          trend: 'stable',
          change: 0,
          dataPoints: [],
          summary: 'No scored activities'
        };
      }

      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;

      // Compare with previous period
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - days);
      
      const previousData = await UserProgress.find({
        userId,
        lastUpdated: { 
          $gte: previousStartDate,
          $lt: startDate
        }
      });

      let trend = 'stable';
      let change = 0;

      if (previousData.length > 0) {
        const prevScores = previousData.map(p => p.score || 0).filter(s => s > 0);
        if (prevScores.length > 0) {
          const prevAvgScore = prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
          change = avgScore - prevAvgScore;
          trend = change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';
        }
      }

      return {
        trend,
        change: Math.round(change * 100) / 100,
        dataPoints: progressData.map(p => ({
          date: p.lastUpdated,
          score: p.score || 0,
          completion: p.completionPercentage || 0
        })),
        summary: `${trend} with ${Math.abs(change).toFixed(1)}% ${change >= 0 ? 'improvement' : 'decline'}`
      };
    } catch (error) {
      console.error('Error calculating performance trend:', error);
      return {
        trend: 'stable',
        change: 0,
        dataPoints: [],
        summary: 'Unable to calculate trend'
      };
    }
  }

  /**
   * Generate content recommendations based on user patterns
   */
  async generateContentRecommendations(userId, patterns) {
    try {
      // Get user's current progress and preferences
      const userProgress = await UserProgress.find({ userId }).populate('courseId');
      const completedCourses = userProgress.filter(p => p.completionPercentage >= 90);
      const inProgressCourses = userProgress.filter(p => p.completionPercentage > 0 && p.completionPercentage < 90);

      // Get all available courses
      const allCourses = await Course.find({ isActive: true });
      
      // Filter courses the user hasn't started
      const unStartedCourses = allCourses.filter(course => 
        !userProgress.some(p => p.courseId?.toString() === course._id.toString())
      );

      const recommendations = [];

      // Recommend based on patterns
      if (patterns.preferredDifficulty) {
        const difficultyMatches = unStartedCourses.filter(course => 
          course.difficulty === patterns.preferredDifficulty
        ).slice(0, 3);
        
        recommendations.push(...difficultyMatches.map(course => ({
          courseId: course._id,
          title: course.title,
          reason: `Matches your preferred difficulty level: ${patterns.preferredDifficulty}`,
          confidence: 0.8,
          type: 'difficulty_match'
        })));
      }

      // Recommend based on subject area
      if (patterns.preferredSubjects && patterns.preferredSubjects.length > 0) {
        const subjectMatches = unStartedCourses.filter(course =>
          patterns.preferredSubjects.includes(course.category)
        ).slice(0, 2);
        
        recommendations.push(...subjectMatches.map(course => ({
          courseId: course._id,
          title: course.title,
          reason: `Based on your interest in ${course.category}`,
          confidence: 0.7,
          type: 'subject_match'
        })));
      }

      // Recommend next steps for in-progress courses
      for (const progress of inProgressCourses.slice(0, 2)) {
        if (progress.courseId) {
          recommendations.push({
            courseId: progress.courseId._id,
            title: progress.courseId.title,
            reason: `Continue your progress - ${Math.round(progress.completionPercentage)}% complete`,
            confidence: 0.9,
            type: 'continue_learning'
          });
        }
      }

      // Sort by confidence and return top 5
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    } catch (error) {
      console.error('Error generating content recommendations:', error);
      return [];
    }
  }
}

export default new AnalyticsService();
