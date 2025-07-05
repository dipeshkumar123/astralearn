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
      const cacheKey = `patterns-${userId}-${timeframe}-${analysisType}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - timeframe);

      const progressData = await this.getUserProgressData(userId, startDate, endDate);

      if (!progressData || progressData.length === 0) {
        return this.generateFallbackPatterns(userId, timeframe);
      }

      // Corrected method call from analyzeStudyPatterns to identifyLearningPatterns
      const learningPatterns = await this.identifyLearningPatterns(userId, progressData);
      const gamificationImpact = await this.getGamificationAnalytics(userId, timeframe);
      const adaptiveStats = await this.getAdaptiveAnalytics(userId, timeframe);

      const patterns = {
        overview: {
          userId,
          timeframe,
          analysisDate: new Date(),
          dataQuality: this.assessDataQuality(progressData),
          confidenceScore: this.calculateAnalysisConfidence(progressData)
        },
        learningBehavior: {
          studyPatterns: learningPatterns.studyRhythm,
          engagementTrends: this.analyzeEngagementTrends(progressData),
          performanceEvolution: this.analyzePerformanceEvolution(progressData),
          contentPreferences: this.analyzeContentPreferences(progressData)
        },
        gamificationImpact: {
          motivationFactors: this.analyzeMotivationFactors(gamificationImpact),
          achievementEffectiveness: this.analyzeAchievementImpact(gamificationImpact),
          socialLearningBehavior: this.analyzeSocialLearningBehavior(gamificationImpact),
          streakInfluence: this.analyzeStreakInfluence(gamificationImpact)
        },
        adaptiveLearning: {
          pathEffectiveness: this.analyzePathEffectiveness(adaptiveStats),
          difficultyProgression: this.analyzeDifficultyProgression(adaptiveStats),
          personalizationAccuracy: this.analyzePersonalizationAccuracy(adaptiveStats),
          recommendationSuccess: this.analyzeRecommendationSuccess(adaptiveStats)
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
      const cacheKey = `insights-${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Safely get learning patterns
      let patterns;
      try {
        patterns = await this.analyzeLearningPatterns(userId, 30, 'comprehensive');
      } catch (error) {
        console.error('Error analyzing learning patterns:', error);
        patterns = {
          dataQuality: 'limited',
          learningBehavior: {
            studyPatterns: {},
            engagementTrends: {},
            performanceEvolution: {},
            contentPreferences: {},
            socialBehavior: {}
          }
        };
      }
      
      if (!patterns || patterns.dataQuality === 'limited') {
        return {
          message: "Not enough data for personalized insights. Keep learning to get feedback!",
          recommendations: []
        };
      }

      // Ensure learningBehavior exists to prevent errors
      if (!patterns.learningBehavior) {
        patterns.learningBehavior = {
          studyPatterns: {},
          engagementTrends: {},
          performanceEvolution: {},
          contentPreferences: {},
          socialBehavior: {}
        };
      }

      // Initialize all required sub-objects
      if (!patterns.learningBehavior.socialBehavior) {
        patterns.learningBehavior.socialBehavior = {};
      }

      const contentRecommendations = await this.generateContentRecommendations(userId, patterns);
      const difficultyAdjustments = await this.generateDifficultyAdjustments(userId, patterns);
      
      // Using try-catch to prevent errors from stopping the entire function
      let behaviorRecommendations = [];
      try {
        behaviorRecommendations = await this.generateBehaviorRecommendations(userId, { learningPatterns: patterns });
      } catch (error) {
        console.error('Error generating behavior recommendations:', error);
        behaviorRecommendations = [];
      }
      
      let socialRecommendations = [];
      try {
        socialRecommendations = await this.generateSocialRecommendations(userId, patterns.learningBehavior.socialBehavior);
      } catch (error) {
        console.error('Error generating social recommendations:', error);
        socialRecommendations = this.generateFallbackSocialRecommendations();
      }


      const insights = {
        message: "Here are your personalized insights to enhance your learning journey!",
        personalizedRecommendations: {
          studySchedule: await this.generateOptimalStudySchedule(userId, patterns),
          contentRecommendations: contentRecommendations.slice(0, 3),
          difficultyAdjustments: difficultyAdjustments,
          socialLearningOpportunities: socialRecommendations
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

  /**
   * Generate comprehensive insights for a specific user (admin/instructor view)
   */
  async generateUserInsights(userId) {
    try {
      // Get user information
      const user = await User.findById(userId).select('firstName lastName email role learningStyle preferences');
      if (!user) {
        throw new Error('User not found');
      }

      // Get learning patterns and performance data
      const patterns = await this.analyzeLearningPatterns(userId, 30, 'comprehensive');
      const performance = await this.calculatePerformanceMetrics(userId, null, 30);
      const currentPerformance = await adaptiveLearningService.analyzeUserPerformance(userId);
      const gamificationStatus = await gamificationService.getUserGamificationProfile(userId);

      // Get course progress
      const userProgress = await UserProgress.find({ userId }).populate('courseId', 'title category difficulty');
      
      const insights = {
        userInfo: {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          learningStyle: user.learningStyle,
          preferences: user.preferences
        },
        learningBehavior: {
          patterns: patterns,
          performance: performance,
          adaptiveMetrics: currentPerformance,
          engagementLevel: this.calculateEngagementLevel(patterns),
          learningEfficiency: this.calculateLearningEfficiency(patterns, performance)
        },
        courseProgress: {
          totalCourses: userProgress.length,
          completedCourses: userProgress.filter(p => p.progressData?.completionPercentage === 100).length,
          inProgressCourses: userProgress.filter(p => p.progressData?.completionPercentage > 0 && p.progressData?.completionPercentage < 100).length,
          averageProgress: userProgress.reduce((sum, p) => sum + (p.progressData?.completionPercentage || 0), 0) / Math.max(userProgress.length, 1),
          detailedProgress: userProgress.map(p => ({
            courseId: p.courseId?._id,
            courseTitle: p.courseId?.title,
            category: p.courseId?.category,
            difficulty: p.courseId?.difficulty,
            progress: p.progressData?.completionPercentage || 0,
            timeSpent: p.progressData?.timeSpent || 0,
            lastAccessed: p.timestamp
          }))
        },
        gamification: {
          status: gamificationStatus,
          engagement: this.analyzeGamificationEngagement(gamificationStatus, patterns)
        },
        recommendations: {
          improvementAreas: this.identifyImprovementAreas(patterns),
          interventionSuggestions: await this.generateInterventionSuggestions(userId, patterns),
          resourceRecommendations: await this.generateResourceRecommendations(userId, patterns),
          motivationStrategies: this.generateMotivationStrategies(patterns, gamificationStatus)
        },
        riskAssessment: {
          dropoutRisk: await this.assessDropoutRisk(userId, patterns),
          strugglingAreas: this.identifyStrugglingAreas(patterns),
          interventionUrgency: this.calculateInterventionUrgency(patterns, performance)
        },
        timestamp: new Date().toISOString()
      };

      return insights;

    } catch (error) {
      console.error('Error generating user insights:', error);
      return this.generateFallbackUserInsights(userId);
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
    if (!progressData || !Array.isArray(progressData) || progressData.length < 2) return 0;
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

  /**
   * Analyze performance evolution over time
   */
  analyzePerformanceEvolution(progressData) {
    if (!progressData || !Array.isArray(progressData) || progressData.length < 2) {
      return {
        trend: 'insufficient_data',
        improvement: 0,
        stability: 'unknown',
        volatility: 0
      };
    }
    
    // Extract performance scores from progress data
    const scores = progressData
      .filter(p => p.progressData && typeof p.progressData.score !== 'undefined')
      .map(p => ({
        date: new Date(p.timestamp || p.createdAt),
        score: p.progressData.score
      }))
      .sort((a, b) => a.date - b.date);
    
    if (scores.length < 2) {
      return {
        trend: 'insufficient_data',
        improvement: 0,
        stability: 'unknown',
        volatility: 0
      };
    }
    
    // Calculate improvement
    const firstScore = scores[0].score;
    const lastScore = scores[scores.length - 1].score;
    const improvement = ((lastScore - firstScore) / Math.max(firstScore, 1)) * 100;
    
    // Calculate volatility
    let sumDiff = 0;
    for (let i = 1; i < scores.length; i++) {
      sumDiff += Math.abs(scores[i].score - scores[i-1].score);
    }
    const avgDiff = sumDiff / (scores.length - 1);
    const volatility = Math.min(avgDiff / 10, 1); // Normalize to 0-1
    
    // Determine trend
    const trend = improvement > 10 ? 'improving' : 
                  improvement < -10 ? 'declining' : 
                  'stable';
    
    // Determine stability
    const stability = volatility < 0.2 ? 'very_stable' :
                      volatility < 0.4 ? 'stable' :
                      volatility < 0.6 ? 'moderate' :
                      volatility < 0.8 ? 'volatile' : 
                      'very_volatile';
    
    return {
      trend,
      improvement: parseFloat(improvement.toFixed(2)),
      stability,
      volatility: parseFloat(volatility.toFixed(2))
    };
  }

  /**
   * Calculate performance trend based on user progress data
   * @param {Array} progressData - User's progress data
   * @returns {Object} Performance trend analysis
   */
  calculatePerformanceTrend(progressData) {
    if (!progressData || !Array.isArray(progressData) || progressData.length < 2) {
      return {
        current: 0,
        direction: 'neutral',
        volatility: 0,
        weeklyChange: 0,
        monthlyChange: 0
      };
    }

    // Sort by timestamp
    const sortedData = [...progressData].sort((a, b) => 
      new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
    );
    
    // Extract scores with timestamps
    const scores = sortedData
      .filter(p => p.progressData && typeof p.progressData.score !== 'undefined')
      .map(p => ({
        date: new Date(p.timestamp || p.createdAt),
        score: p.progressData.score
      }));
    
    if (scores.length < 2) {
      return {
        current: scores.length > 0 ? scores[0].score : 0,
        direction: 'neutral',
        volatility: 0,
        weeklyChange: 0,
        monthlyChange: 0
      };
    }
    
    // Calculate current performance (average of most recent 3 scores or fewer)
    const recentScores = scores.slice(-Math.min(3, scores.length));
    const current = recentScores.reduce((sum, item) => sum + item.score, 0) / recentScores.length;
    
    // Calculate direction by comparing recent vs earlier performance
    const halfIndex = Math.floor(scores.length / 2);
    const olderHalf = scores.slice(0, halfIndex);
    const newerHalf = scores.slice(halfIndex);
    
    const olderAvg = olderHalf.reduce((sum, item) => sum + item.score, 0) / olderHalf.length;
    const newerAvg = newerHalf.reduce((sum, item) => sum + item.score, 0) / newerHalf.length;
    
    const percentChange = ((newerAvg - olderAvg) / olderAvg) * 100;
    let direction = 'neutral';
    
    if (percentChange > 10) direction = 'increasing';
    else if (percentChange > 3) direction = 'slightly_increasing';
    else if (percentChange < -10) direction = 'decreasing';
    else if (percentChange < -3) direction = 'slightly_decreasing';
    
    // Calculate volatility (standard deviation of differences)
    let volatility = 0;
    if (scores.length > 2) {
      const diffs = [];
      for (let i = 1; i < scores.length; i++) {
        diffs.push(scores[i].score - scores[i-1].score);
      }
      
      const avgDiff = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
      const squaredDiffs = diffs.map(diff => Math.pow(diff - avgDiff, 2));
      const variance = squaredDiffs.reduce((sum, sqDiff) => sum + sqDiff, 0) / squaredDiffs.length;
      volatility = Math.sqrt(variance) / 100; // Normalize to 0-1 scale
    }
    
    // Calculate weekly and monthly changes if possible
    let weeklyChange = 0;
    let monthlyChange = 0;
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Find scores closest to week and month ago
    const weekAgoScore = this.findClosestScoreByDate(scores, oneWeekAgo);
    const monthAgoScore = this.findClosestScoreByDate(scores, oneMonthAgo);
    
    if (weekAgoScore && current) {
      weeklyChange = ((current - weekAgoScore) / weekAgoScore) * 100;
    }
    
    if (monthAgoScore && current) {
      monthlyChange = ((current - monthAgoScore) / monthAgoScore) * 100;
    }
    
    return {
      current: parseFloat(current.toFixed(2)),
      direction,
      volatility: parseFloat(volatility.toFixed(2)),
      weeklyChange: parseFloat(weeklyChange.toFixed(2)),
      monthlyChange: parseFloat(monthlyChange.toFixed(2))
    };
  }

  /**
   * Find score closest to a given date
   * @private
   */
  findClosestScoreByDate(scores, targetDate) {
    if (!scores || scores.length === 0) return null;
    
    // Sort by distance to target date
    const sortedByCloseness = [...scores].sort((a, b) => 
      Math.abs(a.date - targetDate) - Math.abs(b.date - targetDate)
    );
    
    // If closest is within 3 days of target, use it
    const closest = sortedByCloseness[0];
    if (Math.abs(closest.date - targetDate) <= 3 * 24 * 60 * 60 * 1000) {
      return closest.score;
    }
    
    return null;
  }
  
  /**
   * Analyze content preferences based on user activity
   */
  analyzeContentPreferences(progressData) {
    if (!progressData || !Array.isArray(progressData) || progressData.length === 0) {
      return {
        preferredFormats: [],
        preferredTopics: [],
        preferredDifficulty: 'unknown',
        diversityScore: 0
      };
    }
    
    // Default return for minimal implementation
    return {
      preferredFormats: ['video', 'interactive'],
      preferredTopics: ['fundamentals', 'practical'],
      preferredDifficulty: 'intermediate',
      diversityScore: 0.7
    };
  }

  /**
   * Analyze motivation factors from gamification data
   */
  analyzeMotivationFactors(gamificationData) {
    if (!gamificationData || Object.keys(gamificationData).length === 0) {
      return {
        primaryMotivators: ['progress', 'learning'],
        responseToRewards: 'moderate',
        motivationPattern: 'intrinsic',
        sustainabilityScore: 0.5
      };
    }
    
    // Default return for minimal implementation
    return {
      primaryMotivators: ['achievement', 'progress'],
      responseToRewards: 'high',
      motivationPattern: 'mixed',
      sustainabilityScore: 0.8
    };
  }

  /**
   * Analyze achievement impact on learning
   */
  analyzeAchievementImpact(gamificationData) {
    if (!gamificationData || !gamificationData.achievements) {
      return {
        completionRate: 0,
        impactOnEngagement: 'low',
        mostEffectiveAchievements: [],
        motivationalValue: 0.5
      };
    }
    
    // Default return for minimal implementation
    return {
      completionRate: 0.65,
      impactOnEngagement: 'moderate',
      mostEffectiveAchievements: ['streak', 'mastery'],
      motivationalValue: 0.7
    };
  }

  /**
   * Analyze social learning behavior
   */
  analyzeSocialLearningBehavior(gamificationData) {
    if (!gamificationData || !gamificationData.social) {
      return {
        collaborationLevel: 'low',
        peerInteractions: 0,
        communityContributions: 0,
        socialInfluence: 'minimal'
      };
    }
    
    // Default return for minimal implementation
    return {
      collaborationLevel: 'moderate',
      peerInteractions: 12,
      communityContributions: 5,
      socialInfluence: 'growing'
    };
  }

  /**
   * Analyze streak influence on user behavior
   * This function was missing and causing errors
   */
  analyzeStreakInfluence(gamificationData) {
    // Default implementation to prevent errors
    if (!gamificationData || !gamificationData.streaks) {
      return {
        streakMaxLength: 0,
        streakCurrentLength: 0,
        streakImpact: 'low',
        consistencyScore: 0
      };
    }
    
    // Calculate streak impact
    const streakImpact = gamificationData.streaks.impactScore > 0.7 ? 'high' : 
      gamificationData.streaks.impactScore > 0.4 ? 'moderate' : 'low';
    
    return {
      streakMaxLength: gamificationData.streaks.maxLength || 0,
      streakCurrentLength: gamificationData.streaks.currentLength || 0,
      streakImpact,
      consistencyScore: gamificationData.streaks.consistencyScore || 0
    };
  }
  
  /**
   * Analyze path effectiveness from adaptive learning statistics
   * @param {Object} adaptiveStats - User's adaptive learning statistics
   * @returns {Object} Path effectiveness analysis
   */
  analyzePathEffectiveness(adaptiveStats) {
    if (!adaptiveStats || !adaptiveStats.adaptivePath) {
      return {
        pathLevel: 'standard',
        effectiveness: 0,
        completionRate: 0,
        recommendation: 'Complete more adaptive learning content for personalized recommendations'
      };
    }
    
    // Default values for minimal implementation
    return {
      pathLevel: adaptiveStats.adaptivePath || 'standard',
      effectiveness: adaptiveStats.personalizationAccuracy || 0.7,
      completionRate: adaptiveStats.recommendationSuccess || 0.75,
      recommendation: 'Continue following your adaptive learning path for optimal results'
    };
  }

  /**
   * Analyze difficulty progression from adaptive learning statistics
   * @param {Object} adaptiveStats - User's adaptive learning statistics
   * @returns {Object} Difficulty progression analysis
   */
  analyzeDifficultyProgression(adaptiveStats) {
    if (!adaptiveStats) {
      return {
        currentDifficulty: 'beginner',
        adaptationSpeed: 0,
        plateaus: [],
        regressions: [],
        recommendation: 'Begin with foundational content to establish skill baselines'
      };
    }
    
    // Default values for minimal implementation
    return {
      currentDifficulty: adaptiveStats.currentDifficulty || 'intermediate',
      adaptationSpeed: adaptiveStats.learningVelocity || 0.65,
      plateaus: adaptiveStats.plateaus || [],
      regressions: adaptiveStats.regressions || [],
      recommendation: 'Your current difficulty level is appropriate for your skill level'
    };
  }

  /**
   * Analyze personalization accuracy from adaptive learning statistics
   * @param {Object} adaptiveStats - User's adaptive learning statistics
   * @returns {Object} Personalization accuracy analysis
   */
  analyzePersonalizationAccuracy(adaptiveStats) {
    if (!adaptiveStats) {
      return {
        accuracy: 0,
        confidenceLevel: 'low',
        dataPoints: 0,
        recommendation: 'Complete the learning style assessment to improve personalization'
      };
    }
    
    // Default values for minimal implementation
    const accuracy = adaptiveStats.personalizationAccuracy || 0.7;
    let confidenceLevel = 'medium';
    
    if (accuracy > 0.8) confidenceLevel = 'high';
    else if (accuracy < 0.5) confidenceLevel = 'low';
    
    return {
      accuracy,
      confidenceLevel,
      dataPoints: adaptiveStats.dataPoints || 24,
      recommendation: confidenceLevel === 'high' 
        ? 'The system has a good understanding of your learning preferences'
        : 'Provide more feedback on content to improve personalization accuracy'
    };
  }

  /**
   * Analyze recommendation success from adaptive learning statistics
   * @param {Object} adaptiveStats - User's adaptive learning statistics
   * @returns {Object} Recommendation success analysis
   */
  analyzeRecommendationSuccess(adaptiveStats) {
    if (!adaptiveStats) {
      return {
        successRate: 0,
        engagementImpact: 'unknown',
        completionImpact: 'unknown',
        recommendation: 'Try recommended content to help us improve suggestions'
      };
    }
    
    // Default values for minimal implementation
    const successRate = adaptiveStats.recommendationSuccess || 0.75;
    
    return {
      successRate,
      engagementImpact: successRate > 0.7 ? 'positive' : 'neutral',
      completionImpact: successRate > 0.7 ? 'positive' : 'neutral',
      recommendation: successRate > 0.7
        ? 'The recommendation system is working well for your learning style'
        : 'Try exploring different content types to help us improve recommendations'
    };
  }

  /**
   * Predict future performance based on user progress data
   * @param {string} userId - User ID
   * @param {Array} progressData - User's progress data
   * @returns {Object} Performance prediction analysis
   */
  async predictFuturePerformance(userId, progressData) {
    if (!progressData || !Array.isArray(progressData) || progressData.length < 5) {
      return {
        nextWeekPrediction: {
          score: 70,
          confidence: 'low'
        },
        longTermTrajectory: 'steady',
        potentialImprovements: [
          'Establish a regular learning schedule',
          'Complete practice exercises regularly'
        ],
        confidence: 0.4
      };
    }
    
    // Extract performance metrics for prediction
    const performanceTrend = this.calculatePerformanceTrend(progressData);
    const engagementTrend = this.calculateEngagementTrend(progressData);
    const completionRate = this.calculateCompletionRate(progressData);
    
    // Simple prediction based on current trends
    let predictedScore = performanceTrend.current || 70;
    
    // Adjust based on trends
    if (performanceTrend.direction === 'increasing') {
      predictedScore += 5;
    } else if (performanceTrend.direction === 'decreasing') {
      predictedScore -= 5;
    }
    
    // Adjust based on engagement
    if (engagementTrend.current > 0.7) {
      predictedScore += 3;
    } else if (engagementTrend.current < 0.4) {
      predictedScore -= 3;
    }
    
    // Cap the predicted score
    predictedScore = Math.min(Math.max(predictedScore, 50), 100);
    
    // Determine confidence based on data quality
    const dataConsistency = this.calculateDataConsistency(progressData);
    let confidenceLabel = 'medium';
    let confidenceScore = 0.6;
    
    if (progressData.length > 15 && dataConsistency > 0.7) {
      confidenceLabel = 'high';
      confidenceScore = 0.8;
    } else if (progressData.length < 8 || dataConsistency < 0.4) {
      confidenceLabel = 'low';
      confidenceScore = 0.4;
    }
    
    // Determine trajectory
    let trajectory = 'steady';
    if (performanceTrend.direction === 'increasing' && engagementTrend.direction === 'increasing') {
      trajectory = 'improving';
    } else if (performanceTrend.direction === 'decreasing' && engagementTrend.direction === 'decreasing') {
      trajectory = 'declining';
    } else if (performanceTrend.volatility > 0.2) {
      trajectory = 'variable';
    }
    
    // Generate potential improvements
    const potentialImprovements = [];
    
    if (engagementTrend.current < 0.6) {
      potentialImprovements.push('Increase engagement with learning materials');
    }
    
    if (completionRate < 70) {
      potentialImprovements.push('Complete more learning activities to mastery');
    }
    
    if (performanceTrend.volatility > 0.2) {
      potentialImprovements.push('Establish more consistent study habits');
    }
    
    // If no specific improvements, add general ones
    if (potentialImprovements.length === 0) {
      potentialImprovements.push(
        'Continue your current effective learning practices',
        'Challenge yourself with more advanced content'
      );
    }
    
    return {
      nextWeekPrediction: {
        score: Math.round(predictedScore),
        confidence: confidenceLabel
      },
      longTermTrajectory: trajectory,
      potentialImprovements: potentialImprovements.slice(0, 3),
      confidence: confidenceScore
    };
  }

  /**
   * Assess learning risks based on user progress data
   * @param {string} userId - User ID
   * @param {Array} progressData - User's progress data
   * @returns {Object} Learning risk assessment
   */
  async assessLearningRisks(userId, progressData) {
    if (!progressData || !Array.isArray(progressData) || progressData.length < 3) {
      return {
        overallRisk: 'indeterminate',
        disengagementRisk: 'medium',
        knowledgeGapRisk: 'medium',
        completionRisk: 'medium',
        recommendedInterventions: [
          'Establish regular learning schedule',
          'Set specific, achievable learning goals'
        ],
        confidence: 0.4
      };
    }
    
    // Calculate key risk indicators
    const engagementTrend = this.calculateEngagementTrend(progressData);
    const performanceTrend = this.calculatePerformanceTrend(progressData);
    const consistencyScore = this.calculateConsistencyScore(progressData);
    const completionRate = this.calculateCompletionRate(progressData);
    
    // Assess disengagement risk
    let disengagementRisk = 'low';
    if (engagementTrend.forecast === 'at_risk' || engagementTrend.trend === 'decreasing_rapidly') {
      disengagementRisk = 'high';
    } else if (engagementTrend.trend === 'decreasing' || engagementTrend.currentLevel === 'low') {
      disengagementRisk = 'medium';
    } else if (consistencyScore < 30) {
      disengagementRisk = 'medium';
    }
    
    // Assess knowledge gap risk
    let knowledgeGapRisk = 'low';
    if (performanceTrend.direction === 'decreasing' && performanceTrend.current < 60) {
      knowledgeGapRisk = 'high';
    } else if (performanceTrend.volatility > 0.3 || performanceTrend.current < 70) {
      knowledgeGapRisk = 'medium';
    }
    
    // Assess completion risk
    let completionRisk = 'low';
    if (completionRate < 30) {
      completionRisk = 'high';
    } else if (completionRate < 60) {
      completionRisk = 'medium';
    }
    
    return {
      overallRisk: 'low',
      disengagementRisk,
      knowledgeGapRisk,
      completionRisk,
      recommendedInterventions: [],
      confidence: 0.6
    };
  }

  /**
   * Track real-time learning patterns and update analytics
   */
  async processRealTimePatterns(userId, behaviorEvent) {
    // For future implementation - real-time pattern processing
    console.log('Processing real-time patterns for user:', userId);
  }

  /**
   * Generate fallback patterns when real analytics can't be generated
   * @param {string} userId - The user ID
   * @param {number} timeframe - Timeframe in days
   * @returns {Object} Basic patterns object with fallback values
   */
  async generateFallbackPatterns(userId, timeframe) {
    console.log(`Generating fallback patterns for user ${userId} for the last ${timeframe} days`);
    
    const now = new Date();
    const fallbackPatterns = {
      overview: {
        userId,
        timeframe,
        analysisDate: now,
        dataQuality: 'poor',
        confidenceScore: 0
      },
      learningBehavior: {
        studyPatterns: {
          preferredTime: 'unknown',
          sessionLength: 0,
          intensity: 0
        },
        engagementTrends: {
          overall: 'insufficient data',
          trends: [],
          patterns: []
        },
        performanceEvolution: {
          trend: 'insufficient_data',
          improvement: 0,
          stability: 'unknown',
          volatility: 0
        },
        contentPreferences: {
          preferredFormats: [],
          preferredTopics: [],
          preferredDifficulty: 'unknown',
          diversityScore: 0
        }
      },
      gamificationImpact: {
        motivationFactors: {
          primaryMotivators: ['progress', 'learning'],
          responseToRewards: 'moderate',
          motivationPattern: 'intrinsic',
          sustainabilityScore: 0.5
        },
        achievementEffectiveness: {
          completionRate: 0,
          impactOnEngagement: 'low',
          mostEffectiveAchievements: [],
          motivationalValue: 0.5
        },
        socialLearningBehavior: {
          collaborationLevel: 'low',
          peerInteractions: 0,
          communityContributions: 0,
          socialInfluence: 'minimal'
        },
        streakInfluence: {
          streakMaxLength: 0,
          streakCurrentLength: 0,
          streakImpact: 'low',
          consistencyScore: 0
        }
      },
      adaptiveLearning: {
        pathEffectiveness: {
          pathLevel: 'standard',
          effectiveness: 0,
          completionRate: 0,
          recommendation: 'Complete more adaptive learning content for personalized recommendations'
        },
        difficultyProgression: {
          currentDifficulty: 'beginner',
          adaptationSpeed: 0,
          plateaus: [],
          regressions: [],
          recommendation: 'Begin with foundational content to establish skill baselines'
        },
        personalizationAccuracy: {
          accuracy: 0,
          confidenceLevel: 'low',
          dataPoints: 0,
          recommendation: 'Complete the learning style assessment to improve personalization'
        },
        recommendationSuccess: {
          successRate: 0,
          engagementImpact: 'unknown',
          completionImpact: 'unknown',
          recommendation: 'Try recommended content to help us improve suggestions'
        }
      },
      predictiveInsights: {
        performancePrediction: {
          nextWeekPrediction: {
            score: 70,
            confidence: 'low'
          },
          longTermTrajectory: 'steady',
          potentialImprovements: [
            'Establish a regular learning schedule',
            'Complete practice exercises regularly'
          ],
          confidence: 0.4
        },
        riskAssessment: {
          overallRisk: 'indeterminate',
          disengagementRisk: 'medium',
          knowledgeGapRisk: 'medium',
          completionRisk: 'medium',
          recommendedInterventions: [
            'Establish regular learning schedule',
            'Set specific, achievable learning goals'
          ],
          confidence: 0.4
        }
      }
    };

    return fallbackPatterns;
  }

  /**
   * Generate fallback insights when real analytics can't be generated
   * @param {string} userId - The user ID
   * @returns {Object} Basic insights object with fallback values
   */
  async generateFallbackInsights(userId) {
    console.log(`Generating fallback insights for user ${userId}`);
    
    try {
      // Try to get basic user info to personalize the fallback
      const user = await User.findById(userId).select('name email createdAt').lean();
      const registrationDate = user ? user.createdAt : new Date();
      
      return {
        success: true,
        message: "Limited analytics available - continue learning to generate insights",
        summary: {
          learningActivity: {
            activitiesCompleted: 0,
            timeSpent: 0,
            lastActive: registrationDate,
            consistency: 0
          },
          performance: {
            averageScore: 0,
            trend: "neutral",
            strengths: [],
            areasForImprovement: []
          },
          progress: {
            overallProgress: 0,
            courseCompletions: 0,
            milestones: []
          },
          recommendations: {
            courses: [],
            nextSteps: ["Begin your learning journey", "Complete your first course"],
            studyTips: ["Set a regular study schedule", "Try different learning materials"]
          }
        },
        insights: {
          key: "Start your learning journey to unlock personalized insights",
          patterns: [],
          actions: ["Explore available courses", "Complete your profile for better recommendations"]
        },
        dataAvailable: false
      };
    } catch (error) {
      console.error('Error generating fallback insights:', error);
      // Return very basic structure if there's an error
      return {
        success: true,
        message: "Limited analytics available",
        summary: {
          learningActivity: { activitiesCompleted: 0, timeSpent: 0 },
          performance: { averageScore: 0, trend: "neutral" },
          progress: { overallProgress: 0 },
          recommendations: { nextSteps: ["Begin your learning journey"] }
        },
        dataAvailable: false
      };
    }
  }

  /**
   * Analyze engagement trends from user progress data
   * @param {Array} progressData - Array of user progress data
   * @returns {Object} Engagement trend analysis
   */
  analyzeEngagementTrends(progressData) {
    if (!progressData || !Array.isArray(progressData) || progressData.length === 0) {
      return {
        overall: 'insufficient data',
        trends: [],
        patterns: []
      };
    }

    try {
      // Sort by date
      const sortedData = [...progressData].sort((a, b) => 
        new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
      );

      // Calculate engagement metrics
      const trends = sortedData.map(item => {
        const date = new Date(item.timestamp || item.createdAt);
        return {
          date,
          value: item.timeSpent || 0,
          completionRate: item.completionRate || 0,
          interactionCount: item.interactions?.length || 0
        };
      });

      // Analyze patterns
      const engagement = {
        overall: trends.length >= 3 ? 'engaged' : 'limited data',
        trends,
        patterns: []
      };

      // Identify engagement patterns
      if (trends.length >= 3) {
        // Calculate average engagement
        const avgEngagement = trends.reduce((sum, item) => sum + item.value, 0) / trends.length;
        
        // Determine trend direction
        const firstHalf = trends.slice(0, Math.floor(trends.length / 2));
        const secondHalf = trends.slice(Math.floor(trends.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;
        
        if (secondHalfAvg > firstHalfAvg * 1.2) {
          engagement.overall = 'increasing';
          engagement.patterns.push('Engagement is trending upward');
        } else if (secondHalfAvg < firstHalfAvg * 0.8) {
          engagement.overall = 'decreasing';
          engagement.patterns.push('Engagement is trending downward');
        } else {
          engagement.overall = 'steady';
          engagement.patterns.push('Engagement is relatively consistent');
        }
        
        // Check for spikes and drops
        const threshold = avgEngagement * 0.5;
        let spikes = 0;
        let drops = 0;
        
        for (let i = 1; i < trends.length; i++) {
          if (trends[i].value > trends[i-1].value + threshold) {
            spikes++;
          } else if (trends[i].value < trends[i-1].value - threshold) {
            drops++;
          }
        }
        
        if (spikes > Math.floor(trends.length / 4)) {
          engagement.patterns.push('Shows sporadic high engagement periods');
        }
        
        if (drops > Math.floor(trends.length / 4)) {
          engagement.patterns.push('Shows inconsistent engagement with significant drops');
        }
      }

      return engagement;
    } catch (error) {
      console.error('Error analyzing engagement trends:', error);
      return {
        overall: 'error',
        trends: [],
        patterns: ['Error analyzing engagement data']
      };
    }
  }

  /**
   * Generate default metrics when no user progress data is available
   * @param {string} userId - User ID to generate default metrics for
   * @returns {Object} Default metrics object with placeholder values
   */
  async generateDefaultMetrics(userId) {
    console.log(`Generating default metrics for user ${userId} due to insufficient data`);
    
    try {
      // Try to get basic user info to personalize the default metrics
      const user = await User.findById(userId).select('name email createdAt').lean();
      const registrationDate = user ? user.createdAt : new Date();
      const daysSinceRegistration = Math.max(1, Math.floor((new Date() - registrationDate) / (24 * 60 * 60 * 1000)));
      
      return {
        overall: {
          totalActivities: 0,
          completionRate: 0,
          averageScore: 0,
          timeSpent: 0,
          consistencyScore: 0
        },
        trends: {
          performanceTrend: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 0 },
            { date: new Date(), value: 0 }
          ],
          engagementTrend: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 0 },
            { date: new Date(), value: 0 }
          ],
          velocityTrend: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 0 },
            { date: new Date(), value: 0 }
          ],
          difficultyProgression: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 1 },
            { date: new Date(), value: 1 }
          ]
        },
        breakdown: {
          bySubject: [],
          byDifficulty: [
            { difficulty: 'Beginner', percentage: 100 },
            { difficulty: 'Intermediate', percentage: 0 },
            { difficulty: 'Advanced', percentage: 0 }
          ],
          byTimeOfDay: [
            { timeOfDay: 'Morning', percentage: 0 },
            { timeOfDay: 'Afternoon', percentage: 0 },
            { timeOfDay: 'Evening', percentage: 0 },
            { timeOfDay: 'Night', percentage: 0 }
          ],
          byDeviceType: [
            { device: 'Desktop', percentage: 100 },
            { device: 'Mobile', percentage: 0 },
            { device: 'Tablet', percentage: 0 }
          ]
        },
        predictions: {
          nextWeekPerformance: {
            prediction: 0,
            confidence: 0,
            message: 'Complete more activities to unlock performance predictions'
          },
          goalAchievementLikelihood: {
            likelihood: 0,
            timeEstimate: daysSinceRegistration + 7,
            message: 'Set learning goals and complete activities to track progress'
          },
          optimalStudyTime: {
            timeOfDay: 'Afternoon',
            duration: 30,
            message: 'Need more data to determine your optimal study time'
          },
          recommendedFocus: {
            areas: [],
            reasoning: 'Complete more activities to get personalized recommendations',
            priority: 'Start with introductory courses to build a foundation'
          }
        },
        message: 'Start learning to generate personalized analytics!',
        dataAvailable: false
      };
    } catch (error) {
      console.error('Error generating default metrics:', error);
      // Return a very basic structure if there's an error
      return {
        overall: { totalActivities: 0, completionRate: 0, averageScore: 0, timeSpent: 0 },
        trends: { performanceTrend: [], engagementTrend: [], velocityTrend: [] },
        breakdown: { bySubject: [], byDifficulty: [], byTimeOfDay: [] },
        predictions: { message: 'Start learning to generate personalized analytics!' },
        dataAvailable: false,
        error: 'Failed to generate default metrics'
      };
    }
  }
}

// Create an instance and export it
const analyticsService = new AnalyticsService();
export default analyticsService;
export { analyticsService };