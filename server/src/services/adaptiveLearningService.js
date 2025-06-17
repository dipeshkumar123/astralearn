/**
 * Adaptive Learning Service - Phase 3 Step 2
 * Provides intelligent learning path calculation, content recommendations,
 * and performance-based adaptations for personalized learning experiences.
 */

import { Course, Module, Lesson, UserProgress, User } from '../models/index.js';

class AdaptiveLearningService {
  constructor() {
    // Learning path weights and thresholds
    this.performanceThresholds = {
      struggling: 60,
      average: 75,
      good: 85,
      excelling: 95
    };

    this.learningStyleWeights = {
      visual: { videos: 0.4, images: 0.3, text: 0.2, interactive: 0.1 },
      auditory: { videos: 0.3, audio: 0.4, text: 0.2, interactive: 0.1 },
      kinesthetic: { interactive: 0.5, videos: 0.2, text: 0.2, exercises: 0.1 },
      reading: { text: 0.5, documents: 0.3, videos: 0.1, interactive: 0.1 }
    };

    this.difficultyProgression = {
      beginner: ['beginner', 'intermediate'],
      intermediate: ['beginner', 'intermediate', 'advanced'],
      advanced: ['intermediate', 'advanced']
    };
  }

  /**
   * Calculate personalized learning path for a user in a course
   */
  async calculateLearningPath(userId, courseId, options = {}) {
    try {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId).populate('modules lessons');
      const userProgress = await UserProgress.find({ userId, courseId });

      if (!user || !course) {
        throw new Error('User or course not found');
      }

      // Analyze current performance and learning patterns
      const performanceAnalysis = await this.analyzeUserPerformance(userId, courseId);
      const learningPatterns = await this.identifyLearningPatterns(userId);
      
      // Generate adaptive learning path
      const adaptivePath = await this.generateAdaptivePath({
        user,
        course,
        userProgress,
        performanceAnalysis,
        learningPatterns,
        options
      });

      return {
        success: true,
        learningPath: adaptivePath,
        metadata: {
          adaptedFor: user.learningStyle,
          performanceLevel: performanceAnalysis.level,
          pathStrategy: adaptivePath.strategy,
          estimatedCompletion: adaptivePath.estimatedDuration,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Learning path calculation error:', error);
      return {
        success: false,
        error: error.message,
        fallbackPath: await this.generateFallbackPath(courseId)
      };
    }
  }

  /**
   * Generate adaptive learning path based on user data
   */
  async generateAdaptivePath({ user, course, userProgress, performanceAnalysis, learningPatterns, options }) {
    const completedLessons = userProgress.map(p => p.lessonId?.toString()).filter(Boolean);
    const allLessons = course.lessons || [];
    
    // Determine learning strategy based on performance
    const strategy = this.determinePathStrategy(performanceAnalysis, learningPatterns);
    
    // Generate path phases
    const pathPhases = await this.generatePathPhases({
      course,
      completedLessons,
      strategy,
      userPreferences: user.learningPreferences,
      learningStyle: user.learningStyle
    });

    // Calculate estimated duration
    const estimatedDuration = this.calculatePathDuration(pathPhases, user.learningPreferences);

    return {
      strategy,
      phases: pathPhases,
      totalLessons: pathPhases.reduce((sum, phase) => sum + phase.lessons.length, 0),
      estimatedDuration,
      adaptations: this.generatePathAdaptations(strategy, user.learningStyle),
      checkpoints: this.generateProgressCheckpoints(pathPhases),
      nextRecommendation: pathPhases[0]?.lessons[0] || null
    };
  }

  /**
   * Determine optimal learning strategy based on performance analysis
   */
  determinePathStrategy(performanceAnalysis, learningPatterns) {
    const { level, trends, strugglingAreas, strengths } = performanceAnalysis;

    if (level === 'struggling') {
      return {
        type: 'reinforcement',
        focus: 'remediation',
        pacing: 'extended',
        support: 'high',
        characteristics: [
          'More practice exercises',
          'Repeated concepts in different formats',
          'Frequent checkpoints and feedback',
          'Lower cognitive load per session'
        ]
      };
    }

    if (level === 'excelling') {
      return {
        type: 'acceleration',
        focus: 'advancement',
        pacing: 'fast-track',
        support: 'minimal',
        characteristics: [
          'Skip redundant content',
          'Advanced challenges and projects',
          'Cross-curricular connections',
          'Independent exploration opportunities'
        ]
      };
    }

    return {
      type: 'standard',
      focus: 'balanced',
      pacing: 'normal',
      support: 'moderate',
      characteristics: [
        'Sequential progression with variations',
        'Mix of content types and difficulties',
        'Regular assessments and feedback',
        'Personalized content emphasis'
      ]
    };
  }

  /**
   * Generate learning path phases with adaptive content selection
   */
  async generatePathPhases({ course, completedLessons, strategy, userPreferences, learningStyle }) {
    const allLessons = course.lessons || [];
    const remainingLessons = allLessons.filter(lesson => 
      !completedLessons.includes(lesson._id?.toString())
    );

    // Group lessons by modules and difficulty
    const lessonsByModule = this.groupLessonsByModule(remainingLessons);
    const phases = [];

    for (const [moduleId, lessons] of Object.entries(lessonsByModule)) {
      const module = course.modules?.find(m => m._id.toString() === moduleId);
      
      if (!module) continue;

      // Sort lessons based on adaptive strategy
      const sortedLessons = this.sortLessonsAdaptively(lessons, strategy, learningStyle);
      
      // Create adaptive phase
      const phase = {
        moduleId,
        moduleName: module.title,
        phaseType: this.determinePhaseType(module, strategy),
        lessons: sortedLessons.map(lesson => ({
          ...lesson.toObject(),
          adaptiveMetadata: this.generateLessonAdaptations(lesson, strategy, learningStyle),
          estimatedDuration: this.estimateLessonDuration(lesson, userPreferences)
        })),
        checkpoints: this.generatePhaseCheckpoints(sortedLessons, strategy),
        adaptations: this.generatePhaseAdaptations(module, strategy, learningStyle)
      };

      phases.push(phase);
    }

    return phases;
  }

  /**
   * Recommend next best content based on current progress
   */
  async recommendNextContent(userId, completedLessons = [], options = {}) {
    try {
      const user = await User.findById(userId);
      const userProgress = await UserProgress.find({ userId }).populate('courseId lessonId');
      
      // Analyze current learning context
      const currentContext = await this.analyzeCurrentLearningContext(userId, userProgress);
      
      // Generate recommendations based on multiple factors
      const recommendations = await this.generateContentRecommendations({
        user,
        currentContext,
        completedLessons,
        options
      });

      return {
        success: true,
        recommendations,
        reasoning: this.explainRecommendationReasoning(recommendations, currentContext),
        metadata: {
          totalRecommendations: recommendations.length,
          confidenceScore: this.calculateRecommendationConfidence(recommendations),
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Content recommendation error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRecommendations: await this.generateFallbackRecommendations(userId)
      };
    }
  }

  /**
   * Generate personalized content recommendations
   */
  async generateContentRecommendations({ user, currentContext, completedLessons, options }) {
    const recommendations = [];

    // 1. Next logical lesson in current course
    const nextLesson = await this.findNextLogicalLesson(currentContext, completedLessons);
    if (nextLesson) {
      recommendations.push({
        type: 'next_lesson',
        priority: 'high',
        content: nextLesson,
        reasoning: 'Natural progression in current learning path',
        adaptations: this.generateLessonAdaptations(nextLesson, currentContext.strategy, user.learningStyle)
      });
    }

    // 2. Remediation for struggling areas
    const remediationContent = await this.findRemediationContent(currentContext.strugglingAreas, user);
    remediationContent.forEach(content => {
      recommendations.push({
        type: 'remediation',
        priority: 'high',
        content,
        reasoning: `Reinforcement for ${content.topic}`,
        adaptations: this.generateRemediationAdaptations(content, user.learningStyle)
      });
    });

    // 3. Enrichment for strengths
    const enrichmentContent = await this.findEnrichmentContent(currentContext.strengths, user);
    enrichmentContent.forEach(content => {
      recommendations.push({
        type: 'enrichment',
        priority: 'medium',
        content,
        reasoning: `Advanced exploration of ${content.topic}`,
        adaptations: this.generateEnrichmentAdaptations(content, user.learningStyle)
      });
    });

    // 4. Cross-curricular connections
    const crossCurricularContent = await this.findCrossCurricularContent(currentContext, user);
    crossCurricularContent.forEach(content => {
      recommendations.push({
        type: 'cross_curricular',
        priority: 'low',
        content,
        reasoning: `Related to your interests in ${content.relatedArea}`,
        adaptations: this.generateCrossCurricularAdaptations(content, user.learningStyle)
      });
    });

    // Sort by priority and relevance
    return this.prioritizeRecommendations(recommendations, user.learningPreferences);
  }

  /**
   * Analyze user performance patterns and learning effectiveness
   */
  async analyzeUserPerformance(userId, courseId, timeframe = 30) {
    const userProgress = await UserProgress.find({
      userId,
      courseId,
      timestamp: { $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) }
    }).populate('lessonId');

    if (userProgress.length === 0) {
      return {
        level: 'new',
        averageScore: 0,
        trends: { direction: 'neutral', confidence: 0 },
        strugglingAreas: [],
        strengths: [],
        learningVelocity: 0,
        engagementScore: 0
      };
    }

    // Calculate performance metrics
    const scores = userProgress.map(p => p.progressData?.score || 0).filter(score => score > 0);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Determine performance level
    const level = this.categorizePerformanceLevel(averageScore);

    // Analyze learning trends
    const trends = this.analyzeLearningTrends(userProgress);

    // Identify struggling areas and strengths
    const { strugglingAreas, strengths } = this.identifyPerformanceAreas(userProgress);

    // Calculate learning velocity and engagement
    const learningVelocity = this.calculateLearningVelocity(userProgress);
    const engagementScore = this.calculateEngagementScore(userProgress);

    return {
      level,
      averageScore,
      trends,
      strugglingAreas,
      strengths,
      learningVelocity,
      engagementScore,
      totalSessions: userProgress.length,
      timeSpent: userProgress.reduce((sum, p) => sum + (p.progressData?.timeSpent || 0), 0)
    };
  }

  /**
   * Identify learning patterns from user behavior
   */
  async identifyLearningPatterns(userId) {
    const userProgress = await UserProgress.find({ userId })
      .populate('lessonId courseId')
      .sort({ timestamp: -1 })
      .limit(100);

    if (userProgress.length === 0) {
      return { patterns: [], confidence: 0 };
    }

    const patterns = [];

    // 1. Time-based patterns
    const timePatterns = this.analyzeTimeBasedPatterns(userProgress);
    patterns.push(...timePatterns);

    // 2. Content preference patterns
    const contentPatterns = this.analyzeContentPreferencePatterns(userProgress);
    patterns.push(...contentPatterns);

    // 3. Learning session patterns
    const sessionPatterns = this.analyzeSessionPatterns(userProgress);
    patterns.push(...sessionPatterns);

    // 4. Performance patterns
    const performancePatterns = this.analyzePerformancePatterns(userProgress);
    patterns.push(...performancePatterns);

    return {
      patterns,
      confidence: this.calculatePatternConfidence(patterns),
      lastAnalyzed: new Date().toISOString()
    };
  }

  /**
   * Generate personalized study plan based on goals and timeline
   */
  async generatePersonalizedStudyPlan(userId, goals, timeline, options = {}) {
    try {
      const user = await User.findById(userId);
      const userProgress = await UserProgress.find({ userId });
      const performanceAnalysis = await this.analyzeUserPerformance(userId);

      // Define study plan parameters
      const planParameters = {
        duration: timeline.weeks || 4,
        sessionsPerWeek: timeline.sessionsPerWeek || 3,
        sessionDuration: user.learningPreferences?.sessionDuration || 60,
        intensity: options.intensity || 'moderate'
      };

      // Generate study plan structure
      const studyPlan = await this.createStudyPlanStructure({
        user,
        goals,
        planParameters,
        performanceAnalysis,
        options
      });

      return {
        success: true,
        studyPlan,
        metadata: {
          totalSessions: studyPlan.weeks.reduce((sum, week) => sum + week.sessions.length, 0),
          estimatedHours: studyPlan.totalEstimatedHours,
          adaptedFor: user.learningStyle,
          difficultyProgression: studyPlan.difficultyProgression,
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Study plan generation error:', error);
      return {
        success: false,
        error: error.message,
        fallbackPlan: await this.generateBasicStudyPlan(goals, timeline)
      };
    }
  }

  /**
   * Utility methods for adaptive learning calculations
   */

  categorizePerformanceLevel(averageScore) {
    if (averageScore < this.performanceThresholds.struggling) return 'struggling';
    if (averageScore < this.performanceThresholds.average) return 'average';
    if (averageScore < this.performanceThresholds.good) return 'good';
    return 'excelling';
  }

  groupLessonsByModule(lessons) {
    return lessons.reduce((groups, lesson) => {
      const moduleId = lesson.moduleId?.toString() || 'unassigned';
      if (!groups[moduleId]) groups[moduleId] = [];
      groups[moduleId].push(lesson);
      return groups;
    }, {});
  }

  sortLessonsAdaptively(lessons, strategy, learningStyle) {
    // Sort based on adaptive strategy requirements
    return lessons.sort((a, b) => {
      // Priority factors based on strategy
      let scoreA = 0, scoreB = 0;

      // Learning style preference
      const styleWeights = this.learningStyleWeights[learningStyle] || {};
      scoreA += this.calculateContentStyleScore(a, styleWeights);
      scoreB += this.calculateContentStyleScore(b, styleWeights);

      // Strategy-specific sorting
      if (strategy.type === 'reinforcement') {
        // Prioritize fundamental concepts
        scoreA += a.difficulty === 'beginner' ? 10 : 0;
        scoreB += b.difficulty === 'beginner' ? 10 : 0;
      } else if (strategy.type === 'acceleration') {
        // Prioritize advanced content
        scoreA += a.difficulty === 'advanced' ? 10 : 0;
        scoreB += b.difficulty === 'advanced' ? 10 : 0;
      }

      return scoreB - scoreA;
    });
  }

  calculateContentStyleScore(lesson, styleWeights) {
    let score = 0;
    
    // Analyze lesson content types and apply weights
    if (lesson.contentType === 'video') score += styleWeights.videos || 0;
    if (lesson.contentType === 'text') score += styleWeights.text || 0;
    if (lesson.contentType === 'interactive') score += styleWeights.interactive || 0;
    
    return score * 10; // Scale for sorting
  }

  generateLessonAdaptations(lesson, strategy, learningStyle) {
    const adaptations = {
      contentEmphasis: [],
      presentationStyle: '',
      additionalResources: [],
      assessmentAdjustments: {}
    };

    // Learning style adaptations
    switch (learningStyle) {
      case 'visual':
        adaptations.contentEmphasis.push('diagrams', 'charts', 'visual examples');
        adaptations.presentationStyle = 'visual-rich';
        break;
      case 'auditory':
        adaptations.contentEmphasis.push('explanations', 'discussions', 'audio content');
        adaptations.presentationStyle = 'conversational';
        break;
      case 'kinesthetic':
        adaptations.contentEmphasis.push('hands-on exercises', 'simulations', 'practical applications');
        adaptations.presentationStyle = 'interactive';
        break;
      case 'reading':
        adaptations.contentEmphasis.push('detailed text', 'comprehensive notes', 'written resources');
        adaptations.presentationStyle = 'text-heavy';
        break;
    }

    // Strategy-based adaptations
    if (strategy?.type === 'reinforcement') {
      adaptations.additionalResources.push('practice exercises', 'review materials', 'concept reinforcement');
      adaptations.assessmentAdjustments.allowMultipleAttempts = true;
      adaptations.assessmentAdjustments.providedHints = true;
    }

    return adaptations;
  }

  estimateLessonDuration(lesson, userPreferences) {
    const baseDuration = lesson.estimatedDuration || 30; // minutes
    const userSessionDuration = userPreferences?.sessionDuration || 30;
    
    // Adjust based on user's preferred session length
    const adjustmentFactor = userSessionDuration / 30; // Normalize to 30-min baseline
    
    return Math.round(baseDuration * adjustmentFactor);
  }

  calculatePathDuration(pathPhases, userPreferences) {
    const totalMinutes = pathPhases.reduce((sum, phase) => {
      return sum + phase.lessons.reduce((phaseSum, lesson) => {
        return phaseSum + (lesson.estimatedDuration || 30);
      }, 0);
    }, 0);

    const sessionDuration = userPreferences?.sessionDuration || 60;
    const estimatedSessions = Math.ceil(totalMinutes / sessionDuration);

    return {
      totalMinutes,
      estimatedSessions,
      estimatedWeeks: Math.ceil(estimatedSessions / (userPreferences?.sessionsPerWeek || 3)),
      averageSessionLength: sessionDuration
    };
  }

  /**
   * Generate fallback learning path when adaptive calculation fails
   */
  async generateFallbackPath(courseId) {
    try {
      const course = await Course.findById(courseId).populate('lessons');
      
      return {
        strategy: { type: 'standard', focus: 'sequential' },
        phases: [{
          moduleName: 'Standard Progression',
          lessons: course.lessons || [],
          adaptations: { type: 'basic', support: 'standard' }
        }],
        isFallback: true
      };
    } catch (error) {
      return {
        strategy: { type: 'error', focus: 'manual' },
        phases: [],
        error: 'Unable to generate learning path'
      };
    }
  }

  /**
   * Analyze current learning context for a user
   */
  async analyzeCurrentLearningContext(userId, userProgress = []) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: 'User not found' };
      }
      // Get recent progress
      const recentProgress = userProgress.slice(-10);
      // Calculate basic metrics
      const averageScore = recentProgress.length > 0 
        ? recentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / recentProgress.length
        : 0;
      return {
        userId,
        recentProgress,
        averageScore,
        totalLessonsCompleted: userProgress.length,
        learningStyle: user.learningStyle || 'visual',
        currentLevel: this.determineCurrentLevel(averageScore),
        strugglingAreas: [],
        strengths: [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error analyzing learning context:', error);
      return { error: error.message };
    }
  }

  /**
   * Generate fallback recommendations when main algorithm fails
   */
  async generateFallbackRecommendations(userId) {
    try {
      // Get basic course recommendations
      const courses = await Course.find({ isActive: true }).limit(3);
      return courses.map(course => ({
        type: 'course',
        id: course._id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty || 'beginner',
        reason: 'General recommendation',
        confidence: 0.5
      }));
    } catch (error) {
      console.error('Error generating fallback recommendations:', error);
      return [{
        type: 'lesson',
        title: 'Getting Started',
        description: 'Start your learning journey',
        difficulty: 'beginner',
        reason: 'Default recommendation',
        confidence: 0.3
      }];
    }
  }

  /**
   * Determine current learning level based on average score
   */
  determineCurrentLevel(averageScore) {
    if (averageScore >= 85) return 'advanced';
    if (averageScore >= 70) return 'intermediate';
    return 'beginner';
  }

  /**
   * Explain recommendation reasoning
   */
  explainRecommendationReasoning(recommendations, context) {
    if (!recommendations || recommendations.length === 0) {
      return 'No specific recommendations available at this time.';
    }
    const reasons = recommendations.map(rec => rec.reason || 'Recommended based on your progress');
    return reasons.join('; ');
  }

  /**
   * Calculate recommendation confidence score
   */
  calculateRecommendationConfidence(recommendations) {
    if (!recommendations || recommendations.length === 0) return 0;
    const avgConfidence = recommendations.reduce((sum, rec) => sum + (rec.confidence || 0.5), 0) / recommendations.length;
    return Math.round(avgConfidence * 100) / 100;
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();
