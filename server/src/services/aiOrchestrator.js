/**
 * AI Orchestration Layer - Phase 2 Step 2 Implementation
 * Enhanced AI service orchestration with learning style adaptation and personalized routing
 */

import aiService from './aiService.js';
import aiContextService from './aiContextService.js';
import promptTemplates from './promptTemplates.js';

class AIOrchestrator {
  constructor() {
    this.aiService = aiService;
    this.contextService = aiContextService;
    this.prompts = promptTemplates;
    
    // Learning style specific configurations
    this.learningStyleConfigs = {
      visual: {
        temperature: 0.6,
        maxTokens: 1200,
        responseFormat: 'structured_with_examples',
        preferredFormats: ['diagrams', 'examples', 'step_by_step'],
      },
      auditory: {
        temperature: 0.8,
        maxTokens: 1000,
        responseFormat: 'conversational',
        preferredFormats: ['explanations', 'analogies', 'discussions'],
      },
      kinesthetic: {
        temperature: 0.7,
        maxTokens: 1100,
        responseFormat: 'action_oriented',
        preferredFormats: ['exercises', 'practice', 'hands_on'],
      },
      reading: {
        temperature: 0.5,
        maxTokens: 1500,
        responseFormat: 'detailed_text',
        preferredFormats: ['comprehensive', 'references', 'detailed'],
      },
    };

    // Performance-based routing
    this.performanceThresholds = {
      struggling: 60,
      average: 80,
      excelling: 90,
    };

    // Response cache for efficiency
    this.responseCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Main orchestration method - routes AI requests based on context
   */
  async orchestrateRequest(request) {
    try {
      const { type, userId, content, context = {}, options = {} } = request;

      // Gather comprehensive context
      const fullContext = await this.contextService.getComprehensiveContext(
        userId, 
        context
      );

      // Determine optimal AI configuration based on user profile
      const aiConfig = this.determineOptimalConfig(fullContext, type);

      // Route to appropriate AI service method
      const response = await this.routeRequest(type, content, fullContext, aiConfig);

      // Post-process response based on learning style
      const enhancedResponse = await this.postProcessResponse(
        response, 
        fullContext, 
        type
      );

      return {
        success: true,
        response: enhancedResponse,
        metadata: {
          orchestrationType: type,
          learningStyleAdapted: fullContext.user?.learning_style,
          configUsed: aiConfig,
          contextQuality: this.assessContextQuality(fullContext),
          timestamp: new Date().toISOString(),
        },
      };

    } catch (error) {
      console.error('AI Orchestration error:', error);
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.generateIntelligentFallback(request),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Determine optimal AI configuration based on user context
   */
  determineOptimalConfig(context, requestType) {
    const learningStyle = context.user?.learning_style || 'visual';
    const performanceLevel = this.assessPerformanceLevel(context);
    
    // Base configuration from learning style
    const baseConfig = { ...this.learningStyleConfigs[learningStyle] };

    // Adjust based on performance level
    if (performanceLevel === 'struggling') {
      baseConfig.temperature = Math.max(0.4, baseConfig.temperature - 0.2);
      baseConfig.maxTokens = Math.min(1500, baseConfig.maxTokens + 300);
      baseConfig.supportLevel = 'high';
    } else if (performanceLevel === 'excelling') {
      baseConfig.temperature = Math.min(0.9, baseConfig.temperature + 0.1);
      baseConfig.challengeLevel = 'advanced';
    }

    // Request type specific adjustments
    const typeAdjustments = this.getTypeSpecificAdjustments(requestType);
    
    return {
      ...baseConfig,
      ...typeAdjustments,
      requestType,
      personalizedFor: learningStyle,
      performanceAdjusted: performanceLevel,
    };
  }

  /**
   * Route request to appropriate AI service method
   */
  async routeRequest(type, content, context, config) {
    const cacheKey = `${type}_${JSON.stringify(content)}_${context.user?.userId}`;
    
    // Check cache first for non-personalized requests
    if (!this.isPersonalizedRequest(type)) {
      const cached = this.responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.response;
      }
    }

    let response;

    switch (type) {
      case 'chat':
        response = await this.aiService.processContextAwareChat(
          content, 
          context, 
          config
        );
        break;

      case 'explanation':
        response = await this.handleExplanationRequest(content, context, config);
        break;

      case 'assessment':
        response = await this.handleAssessmentRequest(content, context, config);
        break;

      case 'recommendation':
        response = await this.handleRecommendationRequest(content, context, config);
        break;

      case 'feedback':
        response = await this.handleFeedbackRequest(content, context, config);
        break;

      case 'study_plan':
        response = await this.handleStudyPlanRequest(content, context, config);
        break;

      default:
        response = await this.aiService.processContextAwareChat(
          content, 
          context, 
          config
        );
    }

    // Cache non-personalized responses
    if (!this.isPersonalizedRequest(type)) {
      this.responseCache.set(cacheKey, {
        response,
        timestamp: Date.now(),
      });
    }

    return response;
  }

  /**
   * Handle explanation requests with learning style adaptation
   */
  async handleExplanationRequest(concept, context, config) {
    const learningStyle = context.user?.learning_style || 'visual';
    
    // Build learning style specific prompt
    const styleSpecificPrompt = this.buildLearningStylePrompt(
      'explanation', 
      { concept, ...context }, 
      learningStyle
    );

    return await this.aiService.processContextAwareChat(
      styleSpecificPrompt,
      context,
      config
    );
  }

  /**
   * Handle assessment and feedback requests
   */
  async handleAssessmentRequest(assessment, context, config) {
    const performanceLevel = this.assessPerformanceLevel(context);
    
    // Adjust feedback style based on performance
    const feedbackStyle = performanceLevel === 'struggling' ? 'encouraging' : 
                         performanceLevel === 'excelling' ? 'challenging' : 'balanced';

    const assessmentPrompt = this.prompts.buildPrompt('assessment', feedbackStyle, {
      assessment_content: assessment,
      performance_level: performanceLevel,
      learning_style: context.user?.learning_style,
      ...context.course,
      ...context.lesson,
    });

    return await this.aiService.processContextAwareChat(
      assessmentPrompt,
      context,
      config
    );
  }

  /**
   * Handle personalized recommendation requests
   */
  async handleRecommendationRequest(requestData, context, config) {
    const recommendations = {
      learningPath: await this.generateLearningPathRecommendations(context),
      studyMethods: await this.generateStudyMethodRecommendations(context),
      resources: await this.generateResourceRecommendations(context),
      nextSteps: await this.generateNextStepRecommendations(context),
    };

    const recommendationPrompt = this.prompts.buildPrompt('recommendation', 'personalized', {
      recommendations: JSON.stringify(recommendations),
      user_context: context.user,
      performance_data: context.analytics,
      learning_patterns: context.progress?.learning_patterns,
    });

    return await this.aiService.processContextAwareChat(
      recommendationPrompt,
      context,
      config
    );
  }

  /**
   * Handle feedback requests with personalized tone
   */
  async handleFeedbackRequest(work, context, config) {
    const learningStyle = context.user?.learning_style || 'visual';
    const performanceLevel = this.assessPerformanceLevel(context);

    const feedbackPrompt = this.buildFeedbackPrompt(work, context, {
      learningStyle,
      performanceLevel,
      encouragementLevel: performanceLevel === 'struggling' ? 'high' : 'moderate',
    });

    return await this.aiService.processContextAwareChat(
      feedbackPrompt,
      context,
      config
    );
  }

  /**
   * Handle study plan generation
   */
  async handleStudyPlanRequest(goals, context, config) {
    const studyPlan = await this.generatePersonalizedStudyPlan(context, goals);
    
    const planPrompt = this.prompts.buildPrompt('study_plan', 'personalized', {
      study_plan: JSON.stringify(studyPlan),
      learning_style: context.user?.learning_style,
      available_time: context.user?.learningPreferences?.sessionDuration || 30,
      difficulty_preference: context.user?.learningPreferences?.preferredDifficulty,
      ...context.analytics,
    });

    return await this.aiService.processContextAwareChat(
      planPrompt,
      context,
      config
    );
  }

  /**
   * Post-process AI responses based on learning style
   */
  async postProcessResponse(response, context, requestType) {
    if (!response.success) return response;

    const learningStyle = context.user?.learning_style || 'visual';
    let enhancedResponse = { ...response };

    // Add learning style specific enhancements
    switch (learningStyle) {
      case 'visual':
        enhancedResponse = await this.addVisualEnhancements(enhancedResponse, context);
        break;
      case 'auditory':
        enhancedResponse = await this.addAuditoryEnhancements(enhancedResponse, context);
        break;
      case 'kinesthetic':
        enhancedResponse = await this.addKinestheticEnhancements(enhancedResponse, context);
        break;
      case 'reading':
        enhancedResponse = await this.addReadingEnhancements(enhancedResponse, context);
        break;
    }

    // Add personalized suggestions
    enhancedResponse.personalizedSuggestions = await this.generatePersonalizedSuggestions(
      context, 
      requestType
    );

    return enhancedResponse;
  }

  /**
   * Generate learning path recommendations
   */
  async generateLearningPathRecommendations(context) {
    const currentLevel = this.assessPerformanceLevel(context);
    const learningStyle = context.user?.learning_style;
    const strugglingAreas = context.analytics?.improvement_areas || [];
    const strengths = context.analytics?.strengths || [];

    return {
      currentLevel,
      recommendedNext: this.getNextTopics(context),
      reinforcement: strugglingAreas.map(area => ({
        topic: area,
        method: this.getReinforcementMethod(area, learningStyle),
        priority: 'high',
      })),
      advancement: strengths.map(strength => ({
        topic: strength,
        method: this.getAdvancementMethod(strength, learningStyle),
        priority: 'medium',
      })),
    };
  }

  /**
   * Assess user performance level
   */
  assessPerformanceLevel(context) {
    const avgScore = context.analytics?.average_performance || 0;
    
    if (avgScore < this.performanceThresholds.struggling) return 'struggling';
    if (avgScore < this.performanceThresholds.average) return 'average';
    if (avgScore < this.performanceThresholds.excelling) return 'good';
    return 'excelling';
  }

  /**
   * Build learning style specific prompts
   */
  buildLearningStylePrompt(type, data, learningStyle) {
    const styleInstructions = {
      visual: "Include examples, step-by-step breakdowns, and suggest visual aids or diagrams where helpful.",
      auditory: "Use conversational tone, include analogies, and suggest discussing concepts aloud.",
      kinesthetic: "Focus on practical applications, hands-on exercises, and real-world examples.",
      reading: "Provide comprehensive explanations, include references, and offer detailed written resources.",
    };

    const basePrompt = this.prompts.buildPrompt('user', type, data);
    const styleInstruction = styleInstructions[learningStyle] || styleInstructions.visual;

    return `${basePrompt}\n\nPersonalization Note: ${styleInstruction}`;
  }

  /**
   * Utility methods
   */
  isPersonalizedRequest(type) {
    return ['recommendation', 'study_plan', 'feedback', 'assessment'].includes(type);
  }

  getTypeSpecificAdjustments(type) {
    const adjustments = {
      explanation: { maxTokens: 1200, temperature: 0.6 },
      assessment: { maxTokens: 800, temperature: 0.4 },
      recommendation: { maxTokens: 1000, temperature: 0.7 },
      feedback: { maxTokens: 800, temperature: 0.6 },
      study_plan: { maxTokens: 1500, temperature: 0.5 },
    };

    return adjustments[type] || {};
  }

  assessContextQuality(context) {
    let quality = 0;
    if (context.user?.userId) quality += 25;
    if (context.course?.courseId) quality += 25;
    if (context.lesson?.lessonId) quality += 25;
    if (context.analytics?.recent_scores?.length > 0) quality += 25;
    
    return {
      score: quality,
      level: quality >= 75 ? 'high' : quality >= 50 ? 'medium' : 'low',
    };
  }

  generateIntelligentFallback(request) {
    return {
      message: "I'm temporarily unable to provide a personalized response. Here's some general guidance that might help.",
      generalAdvice: this.getGeneralAdviceForType(request.type),
      suggestedActions: ["Try again in a moment", "Check your internet connection", "Contact support if the issue persists"],
    };
  }

  getGeneralAdviceForType(type) {
    const advice = {
      explanation: "Break down complex concepts into smaller parts and use examples from your daily experience.",
      assessment: "Review the key concepts and practice with similar problems.",
      recommendation: "Focus on consistent practice and gradually increase difficulty.",
      feedback: "Use feedback to identify areas for improvement and celebrate your progress.",
      study_plan: "Set realistic goals and maintain a regular study schedule.",
    };

    return advice[type] || "Keep practicing and don't hesitate to ask for help when needed.";
  }

  // Enhanced methods for learning style adaptations
  async addVisualEnhancements(response, context) {
    // Add suggestions for visual aids, diagrams, charts
    response.visualSuggestions = [
      "Consider creating a mind map of this concept",
      "Look for diagrams or flowcharts that illustrate this topic",
      "Try color-coding your notes for better organization",
    ];
    return response;
  }

  async addAuditoryEnhancements(response, context) {
    // Add suggestions for auditory learning
    response.auditorySuggestions = [
      "Try explaining this concept out loud to yourself",
      "Look for podcasts or audio content on this topic",
      "Consider discussing this with a study partner",
    ];
    return response;
  }

  async addKinestheticEnhancements(response, context) {
    // Add suggestions for hands-on learning
    response.kinestheticSuggestions = [
      "Look for practical exercises or labs related to this topic",
      "Try building or creating something that demonstrates this concept",
      "Take breaks to move around while studying",
    ];
    return response;
  }

  async addReadingEnhancements(response, context) {
    // Add suggestions for reading/writing learners
    response.readingSuggestions = [
      "Take detailed notes and create summaries",
      "Look for additional reading materials on this topic",
      "Try writing your own explanation of this concept",
    ];
    return response;
  }

  async generatePersonalizedSuggestions(context, requestType) {
    const suggestions = [];
    const performanceLevel = this.assessPerformanceLevel(context);
    
    if (performanceLevel === 'struggling') {
      suggestions.push({
        type: 'encouragement',
        message: "You're making progress! Consider reviewing foundational concepts and practicing regularly.",
      });
    }

    if (context.analytics?.session_frequency === 'infrequent') {
      suggestions.push({
        type: 'study_habits',
        message: "Try studying for shorter periods more frequently for better retention.",
      });
    }

    return suggestions;
  }

  // Additional helper methods for comprehensive functionality
  getNextTopics(context) {
    // This would integrate with course structure to suggest next topics
    return ["Advanced concepts in current lesson", "Next lesson preview", "Related practice exercises"];
  }

  getReinforcementMethod(area, learningStyle) {
    const methods = {
      visual: `Create visual aids for ${area}`,
      auditory: `Discuss ${area} concepts aloud`,
      kinesthetic: `Practice ${area} with hands-on exercises`,
      reading: `Read additional materials about ${area}`,
    };
    return methods[learningStyle] || methods.visual;
  }

  getAdvancementMethod(strength, learningStyle) {
    const methods = {
      visual: `Create advanced diagrams for ${strength}`,
      auditory: `Teach ${strength} concepts to others`,
      kinesthetic: `Build projects using ${strength}`,
      reading: `Research advanced topics in ${strength}`,
    };
    return methods[learningStyle] || methods.visual;
  }

  async generateStudyMethodRecommendations(context) {
    const learningStyle = context.user?.learning_style;
    const performanceLevel = this.assessPerformanceLevel(context);
    
    const baseMethods = {
      visual: ['Mind mapping', 'Flashcards', 'Diagrams', 'Color coding'],
      auditory: ['Recording lectures', 'Discussion groups', 'Reading aloud', 'Music mnemonics'],
      kinesthetic: ['Hands-on projects', 'Physical models', 'Movement breaks', 'Role playing'],
      reading: ['Note-taking', 'Summarizing', 'Research', 'Writing exercises'],
    };

    return baseMethods[learningStyle] || baseMethods.visual;
  }

  async generateResourceRecommendations(context) {
    // This would integrate with a resource database
    return {
      videos: ["Recommended educational videos"],
      articles: ["Relevant articles and papers"],
      exercises: ["Practice problems and quizzes"],
      tools: ["Helpful learning tools and apps"],
    };
  }

  async generateNextStepRecommendations(context) {
    const currentProgress = context.analytics?.recent_scores || [];
    const trend = context.analytics?.performance_trend || 'stable';
    
    if (trend === 'improving') {
      return ["Continue current study approach", "Consider advancing to next difficulty level"];
    } else if (trend === 'declining') {
      return ["Review recent lessons", "Seek additional help", "Adjust study schedule"];
    }
    
    return ["Maintain consistent practice", "Review challenging concepts"];
  }

  buildFeedbackPrompt(work, context, options) {
    const { learningStyle, performanceLevel, encouragementLevel } = options;
    
    return this.prompts.buildPrompt('feedback', 'personalized', {
      user_work: work,
      learning_style: learningStyle,
      performance_level: performanceLevel,
      encouragement_level: encouragementLevel,
      course_context: context.course,
      lesson_context: context.lesson,
      user_progress: context.analytics,
    });
  }

  async generatePersonalizedStudyPlan(context, goals) {
    const availableTime = context.user?.learningPreferences?.sessionDuration || 30;
    const preferredDifficulty = context.user?.learningPreferences?.preferredDifficulty || 'beginner';
    const learningStyle = context.user?.learning_style || 'visual';
    
    return {
      dailyGoals: this.calculateDailyGoals(availableTime, goals),
      weeklyMilestones: this.calculateWeeklyMilestones(context, goals),
      studyMethods: await this.generateStudyMethodRecommendations(context),
      resources: await this.generateResourceRecommendations(context),
      adjustments: this.getStudyPlanAdjustments(context),
    };
  }

  calculateDailyGoals(timeAvailable, goals) {
    // Calculate realistic daily goals based on available time
    const goalsPerDay = Math.ceil(goals.length / 7); // Distribute over a week
    return goals.slice(0, goalsPerDay);
  }

  calculateWeeklyMilestones(context, goals) {
    // Create weekly milestones based on current progress and goals
    return goals.map((goal, index) => ({
      week: Math.floor(index / 3) + 1,
      milestone: goal,
      estimatedCompletion: `Week ${Math.floor(index / 3) + 1}`,
    }));
  }

  getStudyPlanAdjustments(context) {
    const adjustments = [];
    
    if (context.analytics?.session_frequency === 'infrequent') {
      adjustments.push("Increase study frequency for better retention");
    }
    
    if (context.analytics?.performance_trend === 'declining') {
      adjustments.push("Review fundamentals before advancing");
    }
    
    return adjustments;
  }
}

// Create singleton instance
const aiOrchestrator = new AIOrchestrator();

export default aiOrchestrator;
export { AIOrchestrator };
