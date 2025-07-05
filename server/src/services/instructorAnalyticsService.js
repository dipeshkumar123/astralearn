/**
 * Instructor Analytics Service - Phase 5 Step 2
 * Comprehensive instructor tools for class management and educational insights
 * 
 * Features:
 * - Class performance monitoring and analytics
 * - Individual student detailed analytics
 * - Engagement pattern analysis and heatmaps
 * - Learning gap detection and intervention recommendations
 * - Real-time class activity monitoring
 */

import { User, Course, UserProgress, Lesson, Module } from '../models/index.js';
import { LearningEvent, LearningSession, DailyAnalytics } from '../models/Analytics.js';
import { UserGamification } from '../models/Gamification.js';
import analyticsService from './analyticsService.js';
import { learningAnalyticsService } from './learningAnalyticsService.js';
import { adaptiveLearningService } from './adaptiveLearningService.js';
import gamificationService from './gamificationService.js';

// Debugging log
console.log('=== InstructorAnalyticsService: Successfully imported analyticsService ===');

class InstructorAnalyticsService {
  constructor() {
    console.log('=== Initializing InstructorAnalyticsService v2.0 - Phase 5 Step 2 ===');
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.instructorCache = new Map();
    
    // Risk assessment thresholds
    this.riskThresholds = {
      performance: {
        critical: 0.4,
        high: 0.6,
        medium: 0.75,
        low: 0.85
      },
      engagement: {
        critical: 0.3,
        high: 0.5,
        medium: 0.7,
        low: 0.8
      },
      consistency: {
        critical: 0.2,
        high: 0.4,
        medium: 0.6,
        low: 0.75
      }
    };
  }

  /**
   * Get comprehensive class performance overview for instructor
   */
  async getClassPerformanceOverview(instructorId, courseId, timeframe = 30) {
    try {
      const cacheKey = `class_overview_${instructorId}_${courseId}_${timeframe}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Get all students enrolled in the course
      const courseStudents = await this.getCourseStudents(courseId);
      
      if (courseStudents.length === 0) {
        return this.generateEmptyClassOverview(courseId);
      }

      // Parallel processing for performance optimization
      const [
        classMetrics,
        individualPerformances,
        engagementMetrics,
        assessmentAnalytics,
        riskAnalysis
      ] = await Promise.all([
        this.calculateClassMetrics(courseId, courseStudents, timeframe),
        this.getIndividualPerformances(courseStudents, courseId, timeframe),
        this.calculateClassEngagement(courseId, courseStudents, timeframe),
        this.analyzeAssessmentPerformance(courseId, timeframe),
        this.identifyAtRiskStudents(courseStudents, courseId, timeframe)
      ]);

      const overview = {
        courseInfo: {
          courseId,
          instructorId,
          totalStudents: courseStudents.length,
          activeStudents: individualPerformances.filter(p => p.isActive).length,
          timeframe,
          lastUpdated: new Date()
        },
        classMetrics: {
          overall: {
            averagePerformance: classMetrics.averagePerformance,
            completionRate: classMetrics.completionRate,
            averageEngagement: engagementMetrics.averageEngagement,
            classConsistency: classMetrics.consistency,
            improvementTrend: classMetrics.trend
          },
          distribution: {
            performanceDistribution: this.calculatePerformanceDistribution(individualPerformances),
            engagementDistribution: this.calculateEngagementDistribution(individualPerformances),
            progressDistribution: this.calculateProgressDistribution(individualPerformances)
          },
          trends: {
            weeklyProgress: classMetrics.weeklyTrends,
            engagementTrends: engagementMetrics.trends,
            performanceTrends: classMetrics.performanceTrends
          }
        },
        studentInsights: {
          topPerformers: this.identifyTopPerformers(individualPerformances, 5),
          strugglingStudents: riskAnalysis.strugglingStudents,
          atRiskStudents: riskAnalysis.atRiskStudents,
          disengagedStudents: this.identifyDisengagedStudents(individualPerformances, 5)
        },
        assessmentAnalytics: {
          overallAssessmentData: assessmentAnalytics.overall,
          difficultyAnalysis: assessmentAnalytics.difficulty,
          questionAnalytics: assessmentAnalytics.questions,
          improvementAreas: assessmentAnalytics.improvements
        },
        interventionRecommendations: await this.generateClassInterventions(
          classMetrics, 
          riskAnalysis, 
          assessmentAnalytics
        ),
        alerts: await this.generateInstructorAlerts(riskAnalysis, classMetrics),
        visualizationData: {
          performanceChart: this.generatePerformanceVisualization(individualPerformances),
          engagementHeatmap: await this.generateEngagementHeatmapData(courseId, timeframe),
          progressTimeline: this.generateProgressTimeline(classMetrics.weeklyTrends),
          riskMatrix: this.generateRiskMatrix(riskAnalysis)
        }
      };

      // Cache the results
      this.setCache(cacheKey, overview);
      return overview;

    } catch (error) {
      console.error('Error generating class performance overview:', error);
      return this.generateErrorOverview(courseId, error);
    }
  }

  /**
   * Get detailed analytics for individual student
   */
  async getStudentDetailedAnalytics(studentId, courseId, analysisType = 'comprehensive') {
    try {
      const cacheKey = `student_analytics_${studentId}_${courseId}_${analysisType}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const [
        studentProfile,
        performanceMetrics,
        engagementAnalysis,
        learningPatterns,
        gamificationData,
        assessmentDetails,
        learningGaps,
        recommendations
      ] = await Promise.all([
        this.getStudentProfile(studentId),
        analyticsService.calculatePerformanceMetrics(studentId, courseId, 30),
        this.analyzeStudentEngagement(studentId, courseId, 30),
        analyticsService.analyzeLearningPatterns(studentId, 30, 'detailed'),
        gamificationService.getUserGamificationProfile(studentId),
        this.getStudentAssessmentDetails(studentId, courseId),
        this.detectStudentLearningGaps(studentId, courseId),
        this.generateStudentRecommendations(studentId, courseId)
      ]);

      const analytics = {
        studentInfo: {
          studentId,
          courseId,
          profile: studentProfile,
          enrollmentDate: studentProfile.enrollmentDate,
          lastActivity: studentProfile.lastActivity,
          analysisType,
          generatedAt: new Date()
        },
        performance: {
          overall: {
            currentGrade: performanceMetrics.overall.averageScore,
            completion: performanceMetrics.overall.completionRate,
            consistency: performanceMetrics.overall.consistencyScore,
            improvement: performanceMetrics.trends.performanceTrend.direction
          },
          detailed: {
            byModule: performanceMetrics.breakdown.bySubject,
            byDifficulty: performanceMetrics.breakdown.byDifficulty,
            overtime: performanceMetrics.trends,
            predictions: performanceMetrics.predictions
          },
          comparative: await this.getComparativePerformance(studentId, courseId)
        },
        engagement: {
          overall: {
            level: engagementAnalysis.level,
            score: engagementAnalysis.score,
            consistency: engagementAnalysis.consistency,
            trends: engagementAnalysis.trends
          },
          patterns: {
            studyTimes: engagementAnalysis.studyPatterns.preferredTimes,
            sessionDuration: engagementAnalysis.studyPatterns.averageDuration,
            contentPreferences: engagementAnalysis.contentPreferences,
            socialBehavior: engagementAnalysis.socialBehavior
          },
          activities: {
            lessonsCompleted: engagementAnalysis.activities.lessons,
            assessmentsTaken: engagementAnalysis.activities.assessments,
            resourcesAccessed: engagementAnalysis.activities.resources,
            collaborations: engagementAnalysis.activities.social
          }
        },
        learningBehavior: {
          patterns: learningPatterns.learningBehavior,
          adaptiveResponse: learningPatterns.adaptiveLearning,
          gamificationImpact: learningPatterns.gamificationImpact,
          insights: learningPatterns.predictiveInsights
        },
        assessmentAnalysis: {
          overall: assessmentDetails.overall,
          byType: assessmentDetails.byType,
          skillAnalysis: assessmentDetails.skills,
          timeAnalysis: assessmentDetails.timing,
          difficultyProgression: assessmentDetails.difficulty
        },
        learningGaps: {
          identified: learningGaps.gaps,
          severity: learningGaps.severity,
          prerequisites: learningGaps.prerequisites,
          recommendations: learningGaps.interventions
        },
        riskAssessment: {
          overallRisk: this.calculateStudentRisk(performanceMetrics, engagementAnalysis),
          riskFactors: this.identifyRiskFactors(studentId, performanceMetrics, engagementAnalysis),
          interventionPriority: this.calculateInterventionPriority(learningGaps, performanceMetrics),
          successPrediction: await this.predictStudentSuccess(studentId, courseId)
        },
        recommendations: {
          immediate: recommendations.immediate,
          shortTerm: recommendations.shortTerm,
          longTerm: recommendations.longTerm,
          interventions: recommendations.interventions
        },
        gamification: {
          progress: gamificationData,
          effectiveness: await this.analyzeGamificationEffectiveness(studentId, performanceMetrics)
        }
      };

      this.setCache(cacheKey, analytics);
      return analytics;

    } catch (error) {
      console.error('Error generating student detailed analytics:', error);
      return this.generateErrorStudentAnalytics(studentId, courseId, error);
    }
  }

  /**
   * Generate engagement heatmap data for visualization
   */
  async generateEngagementHeatmap(courseId, timeframe = 30, granularity = 'hour') {
    try {
      const cacheKey = `engagement_heatmap_${courseId}_${timeframe}_${granularity}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Get all learning events for the course within timeframe
      const learningEvents = await LearningEvent.find({
        'context.courseId': courseId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).populate('userId', 'firstName lastName');

      const heatmapData = this.processHeatmapData(learningEvents, granularity);

      const result = {
        courseId,
        timeframe,
        granularity,
        generatedAt: new Date(),
        data: {
          heatmap: heatmapData.matrix,
          labels: heatmapData.labels,
          metrics: heatmapData.metrics,
          insights: heatmapData.insights
        },
        visualization: {
          colorScale: this.generateColorScale(heatmapData.metrics),
          annotations: this.generateHeatmapAnnotations(heatmapData),
          recommendations: this.generateEngagementRecommendations(heatmapData)
        }
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error generating engagement heatmap:', error);
      return this.generateErrorHeatmap(courseId, error);
    }
  }

  /**
   * Detect learning gaps for course students
   */
  async detectLearningGaps(courseId, studentIds = null, analysisDepth = 'standard') {
    try {
      const students = studentIds || await this.getCourseStudents(courseId);
      const gaps = [];

      for (const student of students) {
        const studentGaps = await this.detectStudentLearningGaps(
          student.userId || student._id,
          courseId,
          analysisDepth
        );
        gaps.push({
          studentId: student.userId || student._id,
          studentName: student.name || `${student.firstName} ${student.lastName}`,
          gaps: studentGaps
        });
      }

      // Aggregate class-wide gaps
      const classGaps = this.aggregateClassGaps(gaps);

      return {
        courseId,
        analysisDepth,
        totalStudents: students.length,
        studentsWithGaps: gaps.filter(g => g.gaps.gaps.length > 0).length,
        individualGaps: gaps,
        classWideGaps: classGaps,
        recommendations: await this.generateClassGapRecommendations(classGaps),
        interventionPriority: this.prioritizeInterventions(gaps),
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error detecting learning gaps:', error);
      return { error: error.message, courseId, gaps: [] };
    }
  }

  /**
   * Generate intervention recommendations based on analysis
   */
  async generateInterventionRecommendations(studentId, gapAnalysis, contextData = {}) {
    try {
      const studentProfile = await this.getStudentProfile(studentId);
      const performanceData = await analyticsService.calculatePerformanceMetrics(studentId);
      
      const recommendations = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        resources: [],
        strategies: []
      };

      // Analyze gaps and generate specific recommendations
      for (const gap of gapAnalysis.gaps || []) {
        const interventions = await this.generateGapSpecificInterventions(
          gap,
          studentProfile,
          performanceData
        );
        
        recommendations.immediate.push(...interventions.immediate);
        recommendations.shortTerm.push(...interventions.shortTerm);
        recommendations.longTerm.push(...interventions.longTerm);
      }

      // Add performance-based recommendations
      const performanceInterventions = this.generatePerformanceInterventions(
        performanceData,
        studentProfile
      );
      
      recommendations.strategies.push(...performanceInterventions);

      // Add resource recommendations
      const resourceRecommendations = await this.generateResourceRecommendations(
        studentId,
        gapAnalysis,
        contextData
      );
      
      recommendations.resources.push(...resourceRecommendations);

      return {
        studentId,
        totalRecommendations: this.countRecommendations(recommendations),
        priority: this.calculateRecommendationPriority(gapAnalysis, performanceData),
        recommendations,
        implementation: {
          timeline: this.generateImplementationTimeline(recommendations),
          resources: this.calculateResourceRequirements(recommendations),
          expectedOutcomes: this.predictInterventionOutcomes(recommendations, studentProfile)
        },
        tracking: {
          metrics: this.defineTrackingMetrics(recommendations),
          checkpoints: this.generateCheckpoints(recommendations),
          successCriteria: this.defineSuccessCriteria(recommendations)
        },
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating intervention recommendations:', error);
      return this.generateErrorRecommendations(studentId, error);
    }
  }

  // Helper methods for class analytics

  async getCourseStudents(courseId) {
    try {
      // In a real implementation, this would query enrollment data
      // For now, find users with progress in this course
      const students = await UserProgress.aggregate([
        { $match: { courseId: courseId } },
        { $group: { _id: '$userId' } },
        { $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        { $project: {
            userId: '$_id',
            firstName: '$userInfo.firstName',
            lastName: '$userInfo.lastName',
            email: '$userInfo.email',
            name: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] }
          }
        }
      ]);

      return students;
    } catch (error) {
      console.error('Error fetching course students:', error);
      return [];
    }
  }

  async calculateClassMetrics(courseId, students, timeframe) {
    const studentIds = students.map(s => s.userId);
    const performances = [];

    for (const studentId of studentIds) {
      const metrics = await analyticsService.calculatePerformanceMetrics(studentId, courseId, timeframe);
      performances.push(metrics.overall);
    }

    return {
      averagePerformance: this.calculateAverage(performances.map(p => p.averageScore)),
      completionRate: this.calculateAverage(performances.map(p => p.completionRate)),
      consistency: this.calculateAverage(performances.map(p => p.consistencyScore)),
      trend: this.calculateClassTrend(performances),
      weeklyTrends: await this.calculateWeeklyTrends(courseId, timeframe),
      performanceTrends: this.analyzePerformanceTrends(performances)
    };
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
  }

  async getIndividualPerformances(students, courseId, timeframe) {
    const performances = [];

    for (const student of students) {
      try {
        const metrics = await analyticsService.calculatePerformanceMetrics(student.userId, courseId, timeframe);
        const engagement = await this.analyzeStudentEngagement(student.userId, courseId, timeframe);
        
        performances.push({
          studentId: student.userId,
          studentName: student.name,
          performance: metrics.overall.averageScore || 0,
          completion: metrics.overall.completionRate || 0,
          engagement: engagement.score || 0,
          consistency: metrics.overall.consistencyScore || 0,
          isActive: (metrics.overall.totalActivities || 0) > 0,
          risk: this.calculateStudentRisk(metrics, engagement),
          lastActivity: metrics.lastActivity || new Date()
        });
      } catch (error) {
        console.error(`Error processing student ${student.userId}:`, error);
        performances.push({
          studentId: student.userId,
          studentName: student.name,
          performance: 0,
          completion: 0,
          engagement: 0,
          consistency: 0,
          isActive: false,
          risk: 'unknown',
          lastActivity: null
        });
      }
    }

    return performances;
  }

  calculateStudentRisk(performanceMetrics, engagementAnalysis) {
    const performance = performanceMetrics.overall?.averageScore || 0;
    const engagement = engagementAnalysis.score || 0;
    const consistency = performanceMetrics.overall?.consistencyScore || 0;

    const weightedRisk = (
      (100 - performance) * 0.4 +
      (100 - engagement) * 0.35 +
      (100 - consistency * 100) * 0.25
    ) / 100;

    if (weightedRisk >= 0.7) return 'critical';
    if (weightedRisk >= 0.5) return 'high';
    if (weightedRisk >= 0.3) return 'medium';
    return 'low';
  }

  // Cache management
  getFromCache(key) {
    const cached = this.instructorCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data, timeout = null) {
    this.instructorCache.set(key, {
      data,
      timestamp: Date.now(),
      timeout: timeout || this.cacheTimeout
    });
  }

  // Fallback methods for error scenarios
  generateEmptyClassOverview(courseId) {
    return {
      courseInfo: { courseId, totalStudents: 0, activeStudents: 0 },
      classMetrics: { overall: {}, distribution: {}, trends: {} },
      studentInsights: { topPerformers: [], strugglingStudents: [], atRiskStudents: [] },
      assessmentAnalytics: {},
      interventionRecommendations: [],
      alerts: [],
      visualizationData: {}
    };
  }

  generateErrorOverview(courseId, error) {
    return {
      error: true,
      message: error.message,
      courseId,
      fallbackData: this.generateEmptyClassOverview(courseId)
    };
  }
}

export default new InstructorAnalyticsService();
