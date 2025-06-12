/**
 * Class Monitoring Service - Phase 5 Step 2
 * Real-time class activity monitoring and engagement tracking
 * 
 * Features:
 * - Real-time student activity tracking
 * - Live engagement monitoring and alerts
 * - Class session analytics and reporting
 * - Automated engagement notifications
 * - Performance trend monitoring
 */

import { LearningEvent, LearningSession } from '../models/Analytics.js';
import { UserProgress } from '../models/index.js';
import instructorAnalyticsService from './instructorAnalyticsService.js';
import webSocketService from './webSocketService.js';

class ClassMonitoringService {
  constructor() {
    console.log('=== Initializing ClassMonitoringService v1.0 - Phase 5 Step 2 ===');
    this.activeMonitoringSessions = new Map();
    this.alertThresholds = {
      lowEngagement: 30, // seconds of inactivity
      dropOffAlert: 0.3, // 30% of students inactive
      performanceAlert: 0.6, // performance below 60%
      consistencyAlert: 0.4 // consistency below 40%
    };
    
    // Real-time monitoring intervals
    this.monitoringInterval = 10000; // 10 seconds
    this.alertCooldown = 60000; // 1 minute between similar alerts
    this.lastAlerts = new Map();
  }

  /**
   * Start real-time monitoring for a class session
   */
  async trackRealTimeClassActivity(courseId, sessionId, instructorId) {
    try {
      console.log(`Starting real-time monitoring for course ${courseId}, session ${sessionId}`);
      
      const monitoringSession = {
        courseId,
        sessionId,
        instructorId,
        startTime: new Date(),
        isActive: true,
        students: new Map(),
        metrics: {
          totalStudents: 0,
          activeStudents: 0,
          averageEngagement: 0,
          sessionDuration: 0
        },
        alerts: [],
        intervalId: null
      };

      // Initialize student tracking
      const courseStudents = await instructorAnalyticsService.getCourseStudents(courseId);
      courseStudents.forEach(student => {
        monitoringSession.students.set(student.userId.toString(), {
          studentId: student.userId,
          studentName: student.name,
          isActive: false,
          lastActivity: null,
          currentEngagement: 0,
          sessionProgress: 0,
          alerts: []
        });
      });

      monitoringSession.metrics.totalStudents = courseStudents.length;

      // Start real-time monitoring interval
      monitoringSession.intervalId = setInterval(async () => {
        await this.performRealTimeCheck(courseId, sessionId, monitoringSession);
      }, this.monitoringInterval);

      // Store active session
      this.activeMonitoringSessions.set(sessionId, monitoringSession);

      // Initialize WebSocket room for real-time updates
      await this.initializeWebSocketRoom(sessionId, instructorId);

      return {
        success: true,
        sessionId,
        courseId,
        startTime: monitoringSession.startTime,
        totalStudents: monitoringSession.metrics.totalStudents,
        message: 'Real-time monitoring started successfully'
      };

    } catch (error) {
      console.error('Error starting real-time class monitoring:', error);
      return {
        success: false,
        error: error.message,
        sessionId,
        courseId
      };
    }
  }

  /**
   * Monitor student engagement levels in real-time
   */
  async monitorStudentEngagement(courseId, studentIds = null, realTimeUpdates = true) {
    try {
      const students = studentIds || (await instructorAnalyticsService.getCourseStudents(courseId)).map(s => s.userId);
      const engagementData = {};

      for (const studentId of students) {
        const recentActivity = await this.getRecentStudentActivity(studentId, 300); // Last 5 minutes
        const engagementScore = this.calculateRealTimeEngagement(recentActivity);
        
        engagementData[studentId] = {
          studentId,
          currentEngagement: engagementScore,
          isActive: recentActivity.length > 0,
          lastActivity: recentActivity[0]?.timestamp || null,
          activityCount: recentActivity.length,
          engagementLevel: this.categorizeEngagement(engagementScore),
          trend: await this.calculateEngagementTrend(studentId, 30) // Last 30 minutes
        };
      }

      // If real-time updates are enabled, broadcast to instructors
      if (realTimeUpdates) {
        await this.broadcastEngagementUpdate(courseId, engagementData);
      }

      return {
        courseId,
        timestamp: new Date(),
        totalStudents: students.length,
        activeStudents: Object.values(engagementData).filter(e => e.isActive).length,
        averageEngagement: this.calculateAverageEngagement(Object.values(engagementData)),
        engagementData,
        alerts: await this.generateEngagementAlerts(engagementData, courseId)
      };

    } catch (error) {
      console.error('Error monitoring student engagement:', error);
      return {
        success: false,
        error: error.message,
        courseId
      };
    }
  }

  /**
   * Generate automated engagement alerts
   */
  async generateEngagementAlerts(thresholds = null, notificationPreferences = {}) {
    try {
      const activeThresholds = thresholds || this.alertThresholds;
      const alerts = [];

      // Check all active monitoring sessions
      for (const [sessionId, session] of this.activeMonitoringSessions) {
        const sessionAlerts = await this.checkSessionAlerts(session, activeThresholds);
        alerts.push(...sessionAlerts);
      }

      // Process and send notifications
      for (const alert of alerts) {
        await this.processAlert(alert, notificationPreferences);
      }

      return {
        totalAlerts: alerts.length,
        alertsByType: this.groupAlertsByType(alerts),
        criticalAlerts: alerts.filter(a => a.severity === 'critical'),
        processed: alerts.length,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error generating engagement alerts:', error);
      return {
        success: false,
        error: error.message,
        alerts: []
      };
    }
  }

  /**
   * Calculate comprehensive class metrics
   */
  async calculateClassMetrics(courseId, metricsType = 'comprehensive', aggregationLevel = 'class') {
    try {
      const courseStudents = await instructorAnalyticsService.getCourseStudents(courseId);
      const studentIds = courseStudents.map(s => s.userId);

      const metrics = {
        overview: {
          totalStudents: courseStudents.length,
          activeStudents: 0,
          averagePerformance: 0,
          averageEngagement: 0,
          completionRate: 0
        },
        engagement: {
          realTime: await this.calculateRealTimeClassEngagement(courseId),
          historical: await this.calculateHistoricalEngagement(courseId, 7),
          trends: await this.calculateEngagementTrends(courseId, 30)
        },
        performance: {
          current: await this.calculateCurrentClassPerformance(studentIds, courseId),
          trends: await this.calculatePerformanceTrends(studentIds, courseId, 30),
          distribution: await this.calculatePerformanceDistribution(studentIds, courseId)
        },
        activity: {
          liveActivity: await this.getLiveActivityMetrics(courseId),
          sessionMetrics: await this.getSessionMetrics(courseId, 7),
          contentInteraction: await this.getContentInteractionMetrics(courseId)
        },
        alerts: {
          active: await this.getActiveAlerts(courseId),
          recent: await this.getRecentAlerts(courseId, 24),
          trends: await this.getAlertTrends(courseId, 7)
        }
      };

      // Aggregate based on level
      if (aggregationLevel === 'individual') {
        metrics.individualMetrics = await this.calculateIndividualMetrics(studentIds, courseId);
      }

      return {
        courseId,
        metricsType,
        aggregationLevel,
        generatedAt: new Date(),
        metrics,
        recommendations: await this.generateMetricsRecommendations(metrics)
      };

    } catch (error) {
      console.error('Error calculating class metrics:', error);
      return {
        success: false,
        error: error.message,
        courseId
      };
    }
  }

  /**
   * Analyze assignment performance in real-time
   */
  async analyzeAssignmentPerformance(assignmentId, courseId) {
    try {
      // Get assignment submissions and progress
      const assignmentProgress = await UserProgress.find({
        courseId,
        'progressData.assignmentId': assignmentId
      }).populate('userId', 'firstName lastName');

      const analysis = {
        assignmentInfo: {
          assignmentId,
          courseId,
          totalSubmissions: assignmentProgress.length,
          analysisDate: new Date()
        },
        performance: {
          averageScore: this.calculateAverageScore(assignmentProgress),
          submissionRate: await this.calculateSubmissionRate(assignmentId, courseId),
          timeToCompletion: this.calculateAverageCompletionTime(assignmentProgress),
          difficultyAnalysis: this.analyzeDifficulty(assignmentProgress)
        },
        distribution: {
          scoreDistribution: this.calculateScoreDistribution(assignmentProgress),
          timeDistribution: this.calculateTimeDistribution(assignmentProgress),
          attemptDistribution: this.calculateAttemptDistribution(assignmentProgress)
        },
        insights: {
          strugglingStudents: this.identifyStrugglingStudents(assignmentProgress),
          quickCompletions: this.identifyQuickCompletions(assignmentProgress),
          qualityIndicators: this.calculateQualityIndicators(assignmentProgress),
          improvementAreas: this.identifyImprovementAreas(assignmentProgress)
        },
        recommendations: {
          instructorActions: this.generateInstructorRecommendations(assignmentProgress),
          contentAdjustments: this.suggestContentAdjustments(assignmentProgress),
          studentSupport: this.generateStudentSupportRecommendations(assignmentProgress)
        }
      };

      return analysis;

    } catch (error) {
      console.error('Error analyzing assignment performance:', error);
      return {
        success: false,
        error: error.message,
        assignmentId
      };
    }
  }

  /**
   * Generate comprehensive class report
   */
  async generateClassReport(courseId, reportType = 'comprehensive', dateRange = 7) {
    try {
      const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const report = {
        reportInfo: {
          courseId,
          reportType,
          dateRange: { start: startDate, end: endDate, days: dateRange },
          generatedAt: new Date(),
          generatedBy: 'system'
        },
        executive: await this.generateExecutiveSummary(courseId, startDate, endDate),
        performance: await this.generatePerformanceReport(courseId, startDate, endDate),
        engagement: await this.generateEngagementReport(courseId, startDate, endDate),
        participation: await this.generateParticipationReport(courseId, startDate, endDate),
        interventions: await this.generateInterventionReport(courseId, startDate, endDate),
        recommendations: await this.generateReportRecommendations(courseId, startDate, endDate),
        appendices: {
          detailedMetrics: await this.generateDetailedMetrics(courseId, startDate, endDate),
          studentProfiles: await this.generateStudentProfiles(courseId),
          alertHistory: await this.generateAlertHistory(courseId, startDate, endDate)
        }
      };

      return report;

    } catch (error) {
      console.error('Error generating class report:', error);
      return {
        success: false,
        error: error.message,
        courseId
      };
    }
  }

  // Real-time monitoring helper methods

  async performRealTimeCheck(courseId, sessionId, monitoringSession) {
    try {
      // Update session duration
      monitoringSession.metrics.sessionDuration = Date.now() - monitoringSession.startTime.getTime();

      // Check each student's current activity
      let activeStudentCount = 0;
      let totalEngagement = 0;

      for (const [studentId, studentData] of monitoringSession.students) {
        const recentActivity = await this.getRecentStudentActivity(studentId, this.monitoringInterval / 1000);
        
        if (recentActivity.length > 0) {
          studentData.isActive = true;
          studentData.lastActivity = recentActivity[0].timestamp;
          studentData.currentEngagement = this.calculateRealTimeEngagement(recentActivity);
          activeStudentCount++;
        } else {
          studentData.isActive = false;
          studentData.currentEngagement = Math.max(0, studentData.currentEngagement - 0.1); // Decay
        }

        totalEngagement += studentData.currentEngagement;
      }

      // Update session metrics
      monitoringSession.metrics.activeStudents = activeStudentCount;
      monitoringSession.metrics.averageEngagement = totalEngagement / monitoringSession.metrics.totalStudents;

      // Check for alerts
      const alerts = await this.checkSessionAlerts(monitoringSession, this.alertThresholds);
      
      // Broadcast updates via WebSocket
      await this.broadcastSessionUpdate(sessionId, {
        timestamp: new Date(),
        activeStudents: activeStudentCount,
        totalStudents: monitoringSession.metrics.totalStudents,
        averageEngagement: monitoringSession.metrics.averageEngagement,
        alerts: alerts.length,
        students: Array.from(monitoringSession.students.values())
      });

    } catch (error) {
      console.error('Error in real-time check:', error);
    }
  }

  async getRecentStudentActivity(studentId, timeWindowSeconds) {
    const cutoffTime = new Date(Date.now() - timeWindowSeconds * 1000);
    
    try {
      return await LearningEvent.find({
        userId: studentId,
        timestamp: { $gte: cutoffTime }
      }).sort({ timestamp: -1 }).limit(50);
    } catch (error) {
      console.error('Error fetching recent student activity:', error);
      return [];
    }
  }

  calculateRealTimeEngagement(recentActivity) {
    if (recentActivity.length === 0) return 0;

    // Weight recent activities more heavily
    let engagementScore = 0;
    const now = Date.now();

    for (const activity of recentActivity) {
      const ageMinutes = (now - new Date(activity.timestamp).getTime()) / (1000 * 60);
      const weight = Math.max(0, 1 - ageMinutes / 5); // Decay over 5 minutes
      const activityScore = this.getActivityEngagementScore(activity.eventType);
      engagementScore += activityScore * weight;
    }

    return Math.min(100, engagementScore);
  }

  getActivityEngagementScore(eventType) {
    const scores = {
      'session_start': 20,
      'lesson_start': 15,
      'content_interaction': 10,
      'assessment_start': 25,
      'assessment_complete': 30,
      'help_request': 8,
      'collaboration_join': 15,
      'resource_access': 5
    };

    return scores[eventType] || 5;
  }

  categorizeEngagement(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very_low';
  }

  async checkSessionAlerts(session, thresholds) {
    const alerts = [];
    const now = Date.now();

    // Check low engagement alert
    if (session.metrics.averageEngagement < 40) {
      const alertKey = `low_engagement_${session.courseId}`;
      if (!this.lastAlerts.has(alertKey) || now - this.lastAlerts.get(alertKey) > this.alertCooldown) {
        alerts.push({
          type: 'low_engagement',
          severity: 'warning',
          courseId: session.courseId,
          sessionId: session.sessionId,
          message: 'Class engagement is below average',
          value: session.metrics.averageEngagement,
          threshold: 40,
          timestamp: new Date()
        });
        this.lastAlerts.set(alertKey, now);
      }
    }

    // Check student drop-off alert
    const dropOffRate = 1 - (session.metrics.activeStudents / session.metrics.totalStudents);
    if (dropOffRate > thresholds.dropOffAlert) {
      const alertKey = `drop_off_${session.courseId}`;
      if (!this.lastAlerts.has(alertKey) || now - this.lastAlerts.get(alertKey) > this.alertCooldown) {
        alerts.push({
          type: 'student_dropoff',
          severity: 'critical',
          courseId: session.courseId,
          sessionId: session.sessionId,
          message: `${Math.round(dropOffRate * 100)}% of students are inactive`,
          value: dropOffRate,
          threshold: thresholds.dropOffAlert,
          timestamp: new Date()
        });
        this.lastAlerts.set(alertKey, now);
      }
    }

    return alerts;
  }

  async initializeWebSocketRoom(sessionId, instructorId) {
    // Initialize WebSocket room for real-time updates
    if (webSocketService && typeof webSocketService.createRoom === 'function') {
      await webSocketService.createRoom(`class_monitor_${sessionId}`, instructorId);
    }
  }

  async broadcastSessionUpdate(sessionId, updateData) {
    // Broadcast updates via WebSocket
    if (webSocketService && typeof webSocketService.broadcastToRoom === 'function') {
      await webSocketService.broadcastToRoom(`class_monitor_${sessionId}`, {
        type: 'session_update',
        data: updateData
      });
    }
  }

  async broadcastEngagementUpdate(courseId, engagementData) {
    // Broadcast engagement updates to instructors
    if (webSocketService && typeof webSocketService.broadcastToRoom === 'function') {
      await webSocketService.broadcastToRoom(`course_${courseId}`, {
        type: 'engagement_update',
        data: engagementData
      });
    }
  }

  /**
   * Stop real-time monitoring for a session
   */
  stopRealTimeMonitoring(sessionId) {
    const session = this.activeMonitoringSessions.get(sessionId);
    if (session) {
      if (session.intervalId) {
        clearInterval(session.intervalId);
      }
      session.isActive = false;
      session.endTime = new Date();
      
      // Store session summary
      this.storeFinalSessionSummary(session);
      
      // Remove from active sessions
      this.activeMonitoringSessions.delete(sessionId);
      
      return {
        success: true,
        sessionId,
        duration: session.endTime - session.startTime,
        summary: this.generateSessionSummary(session)
      };
    }
    
    return { success: false, message: 'Session not found' };
  }

  generateSessionSummary(session) {
    return {
      sessionId: session.sessionId,
      courseId: session.courseId,
      duration: session.endTime - session.startTime,
      totalStudents: session.metrics.totalStudents,
      peakActiveStudents: session.metrics.peakActiveStudents || session.metrics.activeStudents,
      averageEngagement: session.metrics.averageEngagement,
      totalAlerts: session.alerts.length,
      completedAt: session.endTime
    };
  }

  async storeFinalSessionSummary(session) {
    try {
      // In a real implementation, store the session summary to database
      console.log('Storing session summary:', this.generateSessionSummary(session));
    } catch (error) {
      console.error('Error storing session summary:', error);
    }
  }
}

export default new ClassMonitoringService();
