/**
 * Prompt Engineering Templates
 * Base templates for context-aware AI interactions
 */

class PromptTemplates {
  constructor() {
    this.templates = {
      // Core system prompts
      system: {
        base: this.createBaseSystemPrompt(),
        contextAware: this.createContextAwareSystemPrompt(),
        educational: this.createEducationalSystemPrompt(),
        orchestrated: this.createOrchestratedSystemPrompt(),
      },
      
      // User interaction templates
      user: {
        question: this.createQuestionTemplate(),
        explanation: this.createExplanationTemplate(),
        assessment: this.createAssessmentTemplate(),
        debugging: this.createDebuggingTemplate(),
      },
      
      // Context injection templates
      context: {
        user: this.createUserContextTemplate(),
        course: this.createCourseContextTemplate(),
        lesson: this.createLessonContextTemplate(),
        progress: this.createProgressContextTemplate(),
      },

      // Phase 2 Step 2: AI Orchestration Layer Templates
      orchestration: {
        learningStyle: this.createLearningStylePrompts(),
        performance: this.createPerformanceAdaptationPrompts(),
        recommendation: this.createRecommendationPrompts(),
        studyPlan: this.createStudyPlanPrompts(),
        feedback: this.createFeedbackPrompts(),
      },
    };
  }

  /**
   * Base system prompt for AstraLearn AI
   */
  createBaseSystemPrompt() {
    return `You are AstraLearn AI, an intelligent learning assistant designed to provide personalized, context-aware educational support.

Your core principles:
- Provide accurate, helpful, and educational responses
- Adapt your communication style to the user's learning level
- Use context about the user's progress and current lesson to personalize responses
- Encourage learning through guided discovery rather than direct answers
- Be supportive and encouraging while maintaining educational rigor
- Cite sources and provide additional resources when helpful

Always consider:
- The user's current lesson and course context
- Their learning progress and patterns
- Their preferred learning style when available
- The difficulty level of their current content

Respond in a way that enhances their learning experience and helps them achieve their educational goals.`;
  }

  /**
   * Context-aware system prompt template
   */
  createContextAwareSystemPrompt() {
    return `You are AstraLearn AI, a context-aware educational assistant with access to detailed information about the user's learning journey.

CONTEXT AWARENESS:
You have access to:
- User profile: learning style, preferences, progress level
- Current course: title, objectives, structure
- Current lesson: topic, objectives, key concepts
- Learning analytics: recent performance, time spent, difficulty areas

RESPONSE GUIDELINES:
1. Reference the current lesson/course context when relevant
2. Adjust complexity based on the user's demonstrated level
3. Connect new concepts to previously learned material
4. Identify knowledge gaps and provide targeted support
5. Suggest next steps based on progress patterns

PERSONALIZATION:
- Adapt explanations to the user's preferred learning style
- Reference their previous questions and progress
- Provide examples relevant to their course content
- Adjust encouragement based on their recent performance

Always use the provided context to make your responses more relevant and educational.`;
  }

  /**
   * Educational-focused system prompt
   */
  createEducationalSystemPrompt() {
    return `You are AstraLearn AI, an expert educational mentor specializing in personalized learning experiences.

EDUCATIONAL APPROACH:
- Use the Socratic method: guide users to discover answers through questioning
- Provide scaffolded learning: break complex concepts into manageable steps
- Apply spaced repetition principles in your suggestions
- Connect new knowledge to existing understanding
- Encourage critical thinking and problem-solving

TEACHING STRATEGIES:
- Use analogies and real-world examples
- Provide multiple perspectives on complex topics
- Suggest practice exercises and reinforcement activities
- Identify and address misconceptions
- Celebrate learning milestones and progress

ASSESSMENT SUPPORT:
- Help users self-assess their understanding
- Provide constructive feedback on practice attempts
- Suggest areas for further study based on performance
- Offer study strategies tailored to the content type

Remember: Your goal is not just to answer questions, but to facilitate deep learning and understanding.`;
  }

  /**
   * Orchestrated system prompt for enhanced personalization
   */
  createOrchestratedSystemPrompt() {
    return `You are AstraLearn AI with advanced orchestration capabilities, designed to provide highly personalized, context-aware educational support.

ORCHESTRATION FEATURES:
- Learning style adaptation (visual, auditory, kinesthetic, reading/writing)
- Performance-based response adjustment
- Personalized recommendation generation
- Context-aware conversation routing
- Dynamic difficulty adjustment

LEARNING STYLE ADAPTATIONS:
- Visual learners: Include examples, diagrams, step-by-step breakdowns
- Auditory learners: Use conversational tone, analogies, discussion suggestions
- Kinesthetic learners: Focus on practical applications, hands-on exercises
- Reading/Writing learners: Provide comprehensive explanations, additional resources

PERFORMANCE ADJUSTMENTS:
- Struggling learners: More encouragement, simplified explanations, extra support
- Average learners: Balanced approach, moderate challenge level
- Excelling learners: Advanced concepts, challenging questions, independent exploration

PERSONALIZATION PRINCIPLES:
- Always consider the user's learning style when crafting responses
- Adjust tone and content based on recent performance trends
- Provide learning style-specific suggestions and enhancements
- Generate personalized recommendations based on individual patterns
- Maintain consistency with the user's preferences and goals

Remember: Your responses should feel naturally adapted to the individual user while maintaining educational excellence.`;
  }

  /**
   * Question handling template
   */
  createQuestionTemplate() {
    return {
      template: `The user is asking about: {topic}

CONTEXT:
- Current Lesson: {lesson_title}
- Course: {course_title}  
- User Level: {user_level}
- Learning Style: {learning_style}

QUESTION: {user_question}

Provide a response that:
1. Directly addresses their question
2. Connects to their current lesson context
3. Uses their preferred learning style
4. Suggests follow-up questions or exercises
5. References relevant course materials`,
      
      variables: [
        'topic',
        'lesson_title', 
        'course_title',
        'user_level',
        'learning_style',
        'user_question'
      ]
    };
  }

  /**
   * Explanation template for complex concepts
   */
  createExplanationTemplate() {
    return {
      template: `Explain the concept: {concept}

LEARNING CONTEXT:
- Current Lesson: {lesson_title}
- Prerequisite Knowledge: {prerequisites}
- User's Current Understanding Level: {understanding_level}
- Preferred Learning Style: {learning_style}

EXPLANATION REQUIREMENTS:
1. Start with a simple definition
2. Use analogies relevant to {domain}
3. Provide a step-by-step breakdown
4. Include practical examples from {course_context}
5. Connect to previously learned concepts: {related_concepts}
6. Suggest hands-on practice opportunities

Adapt the complexity to match their current level while building toward the lesson objectives.`,
      
      variables: [
        'concept',
        'lesson_title',
        'prerequisites', 
        'understanding_level',
        'learning_style',
        'domain',
        'course_context',
        'related_concepts'
      ]
    };
  }

  /**
   * Assessment and feedback template
   */
  createAssessmentTemplate() {
    return {
      template: `The user has submitted their work on: {assignment_topic}

USER SUBMISSION:
{user_work}

ASSESSMENT CONTEXT:
- Lesson Objectives: {lesson_objectives}
- Expected Level: {expected_level}
- Previous Performance: {performance_history}
- Focus Areas: {focus_areas}

PROVIDE FEEDBACK THAT:
1. Identifies strengths in their approach
2. Points out areas for improvement without giving direct answers
3. Asks guiding questions to help them self-correct
4. Suggests specific resources or practice exercises
5. Encourages continued learning
6. Connects their work to broader course concepts

Be constructive, specific, and encouraging while maintaining educational rigor.`,
      
      variables: [
        'assignment_topic',
        'user_work',
        'lesson_objectives',
        'expected_level', 
        'performance_history',
        'focus_areas'
      ]
    };
  }

  /**
   * Debugging/problem-solving template
   */
  createDebuggingTemplate() {
    return {
      template: `The user is having trouble with: {problem_area}

PROBLEM DETAILS:
{problem_description}

DEBUGGING CONTEXT:
- Course: {course_title}
- Current Lesson: {lesson_title}
- Technology/Tools: {tools_used}
- User's Experience Level: {experience_level}
- Previous Similar Issues: {issue_history}

DEBUGGING APPROACH:
1. Help them identify the root cause through systematic questioning
2. Guide them through troubleshooting steps appropriate to their level
3. Explain the underlying concepts causing the issue
4. Provide preventive strategies for similar future problems
5. Connect the debugging process to learning objectives
6. Encourage good debugging habits and practices

Focus on teaching the debugging process, not just solving the immediate problem.`,
      
      variables: [
        'problem_area',
        'problem_description',
        'course_title',
        'lesson_title',
        'tools_used',
        'experience_level',
        'issue_history'
      ]
    };
  }

  /**
   * User context template
   */
  createUserContextTemplate() {
    return {
      template: `USER PROFILE:
- Name: {user_name}
- Learning Style: {learning_style}
- Experience Level: {experience_level}
- Course Progress: {progress_percentage}%
- Preferred Difficulty: {preferred_difficulty}
- Active Since: {enrollment_date}
- Time Zone: {time_zone}

LEARNING PATTERNS:
- Average Session Duration: {avg_session_time}
- Peak Learning Hours: {peak_hours}
- Completion Rate: {completion_rate}%
- Strong Areas: {strong_subjects}
- Areas for Improvement: {improvement_areas}`,
      
      variables: [
        'user_name',
        'learning_style',
        'experience_level',
        'progress_percentage',
        'preferred_difficulty',
        'enrollment_date',
        'time_zone',
        'avg_session_time',
        'peak_hours',
        'completion_rate',
        'strong_subjects',
        'improvement_areas'
      ]
    };
  }

  /**
   * Course context template
   */
  createCourseContextTemplate() {
    return {
      template: `COURSE CONTEXT:
- Title: {course_title}
- Category: {course_category}
- Difficulty Level: {difficulty_level}
- Duration: {estimated_duration}
- Instructor: {instructor_name}

COURSE STRUCTURE:
- Total Modules: {total_modules}
- Current Module: {current_module} - {module_title}
- Completed Modules: {completed_modules}
- Remaining Modules: {remaining_modules}

LEARNING OBJECTIVES:
{course_objectives}

KEY TECHNOLOGIES/CONCEPTS:
{key_concepts}

PREREQUISITES:
{prerequisites}`,
      
      variables: [
        'course_title',
        'course_category',
        'difficulty_level',
        'estimated_duration',
        'instructor_name',
        'total_modules',
        'current_module',
        'module_title',
        'completed_modules',
        'remaining_modules',
        'course_objectives',
        'key_concepts',
        'prerequisites'
      ]
    };
  }

  /**
   * Lesson context template
   */
  createLessonContextTemplate() {
    return {
      template: `CURRENT LESSON:
- Title: {lesson_title}
- Module: {module_title}
- Position: Lesson {lesson_number} of {total_lessons}
- Duration: {estimated_duration}
- Type: {lesson_type}

LESSON OBJECTIVES:
{lesson_objectives}

KEY CONCEPTS:
{key_concepts}

RESOURCES PROVIDED:
{lesson_resources}

PREVIOUS LESSON:
{previous_lesson_title} - {previous_lesson_status}

NEXT LESSON:
{next_lesson_title}

HANDS-ON ACTIVITIES:
{activities}`,
      
      variables: [
        'lesson_title',
        'module_title',
        'lesson_number',
        'total_lessons',
        'estimated_duration',
        'lesson_type',
        'lesson_objectives',
        'key_concepts',
        'lesson_resources',
        'previous_lesson_title',
        'previous_lesson_status',
        'next_lesson_title',
        'activities'
      ]
    };
  }

  /**
   * Progress context template
   */
  createProgressContextTemplate() {
    return {
      template: `LEARNING PROGRESS:
- Overall Course Progress: {overall_progress}%
- Current Module Progress: {module_progress}%
- Lessons Completed: {completed_lessons}/{total_lessons}
- Time Invested: {total_time_spent}
- Last Activity: {last_activity_date}

PERFORMANCE METRICS:
- Recent Quiz Scores: {recent_scores}
- Average Performance: {average_performance}%
- Improvement Trend: {performance_trend}
- Difficulty Areas: {struggling_topics}
- Strong Areas: {mastered_topics}

ENGAGEMENT PATTERNS:
- Session Frequency: {session_frequency}
- Preferred Learning Times: {preferred_times}
- Content Interaction: {interaction_patterns}
- Help-Seeking Behavior: {help_frequency}`,
      
      variables: [
        'overall_progress',
        'module_progress',
        'completed_lessons',
        'total_lessons',
        'total_time_spent',
        'last_activity_date',
        'recent_scores',
        'average_performance',
        'performance_trend',
        'struggling_topics',
        'mastered_topics',
        'session_frequency',
        'preferred_times',
        'interaction_patterns',
        'help_frequency'
      ]
    };
  }

  /**
   * Build a complete prompt by combining templates
   */
  buildPrompt(templateType, category, variables = {}) {
    const template = this.templates[templateType]?.[category];
    
    if (!template) {
      throw new Error(`Template not found: ${templateType}.${category}`);
    }

    // Handle both string templates and object templates
    const templateContent = typeof template === 'string' ? template : template.template;
    
    // Replace variables in the template
    let prompt = templateContent;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value || '[Not specified]');
    }

    return prompt;
  }

  /**
   * Build a context-aware chat prompt
   */
  buildContextAwarePrompt(userMessage, context = {}) {
    const {
      user = {},
      course = {},
      lesson = {},
      progress = {},
      interactionType = 'question'
    } = context;

    // Build system prompt with context
    const systemPrompt = this.buildPrompt('system', 'contextAware');
    
    // Build user context
    const userContext = this.buildPrompt('context', 'user', user);
    const courseContext = this.buildPrompt('context', 'course', course);
    const lessonContext = this.buildPrompt('context', 'lesson', lesson);
    const progressContext = this.buildPrompt('context', 'progress', progress);

    // Build interaction-specific prompt
    const interactionPrompt = this.buildPrompt('user', interactionType, {
      user_question: userMessage,
      ...user,
      ...course,
      ...lesson,
      ...progress
    });

    // Combine all parts
    const fullPrompt = `${systemPrompt}

${userContext}

${courseContext}

${lessonContext}

${progressContext}

${interactionPrompt}`;

    return fullPrompt;
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    const templateList = {};
    
    for (const [type, categories] of Object.entries(this.templates)) {
      templateList[type] = Object.keys(categories);
    }
    
    return templateList;
  }

  /**
   * Get template variables for a specific template
   */
  getTemplateVariables(templateType, category) {
    const template = this.templates[templateType]?.[category];
    
    if (!template) {
      throw new Error(`Template not found: ${templateType}.${category}`);
    }

    // Return variables if template is an object, otherwise extract from string
    if (typeof template === 'object' && template.variables) {
      return template.variables;
    }

    // Extract variables from template string
    const templateContent = typeof template === 'string' ? template : template.template;
    const matches = templateContent.match(/\{([^}]+)\}/g);
    
    if (!matches) return [];
    
    return matches.map(match => match.slice(1, -1));
  }

  // === PHASE 2 STEP 2: AI ORCHESTRATION LAYER PROMPT TEMPLATES ===

  /**
   * Orchestrated system prompt for enhanced personalization
   */
  createOrchestratedSystemPrompt() {
    return `You are AstraLearn AI with advanced orchestration capabilities, designed to provide highly personalized, context-aware educational support.

ORCHESTRATION FEATURES:
- Learning style adaptation (visual, auditory, kinesthetic, reading/writing)
- Performance-based response adjustment
- Personalized recommendation generation
- Context-aware conversation routing
- Dynamic difficulty adjustment

LEARNING STYLE ADAPTATIONS:
- Visual learners: Include examples, diagrams, step-by-step breakdowns
- Auditory learners: Use conversational tone, analogies, discussion suggestions
- Kinesthetic learners: Focus on practical applications, hands-on exercises
- Reading/Writing learners: Provide comprehensive explanations, additional resources

PERFORMANCE ADJUSTMENTS:
- Struggling learners: More encouragement, simplified explanations, extra support
- Average learners: Balanced approach, moderate challenge level
- Excelling learners: Advanced concepts, challenging questions, independent exploration

PERSONALIZATION PRINCIPLES:
- Always consider the user's learning style when crafting responses
- Adjust tone and content based on recent performance trends
- Provide learning style-specific suggestions and enhancements
- Generate personalized recommendations based on individual patterns
- Maintain consistency with the user's preferences and goals

Remember: Your responses should feel naturally adapted to the individual user while maintaining educational excellence.`;
  }

  /**
   * Learning style specific prompts
   */
  createLearningStylePrompts() {
    return {
      visual: {
        template: `VISUAL LEARNER ADAPTATION:
Adapt your response for a visual learner by:
- Including concrete examples and analogies
- Suggesting visual aids (diagrams, charts, mind maps)
- Breaking down complex concepts into step-by-step visual sequences
- Using spatial and structural descriptions
- Recommending color-coding and visual organization techniques

Content: {content}
Context: {context}
Learning Goal: {learning_goal}

Provide your response with visual learning enhancements.`,
        variables: ['content', 'context', 'learning_goal']
      },

      auditory: {
        template: `AUDITORY LEARNER ADAPTATION:
Adapt your response for an auditory learner by:
- Using conversational and discussion-oriented language
- Including verbal patterns and rhythmic explanations
- Suggesting reading aloud and verbal practice
- Providing analogies that relate to sounds or verbal concepts
- Recommending discussion groups or verbal processing techniques

Content: {content}
Context: {context}
Learning Goal: {learning_goal}

Provide your response with auditory learning enhancements.`,
        variables: ['content', 'context', 'learning_goal']
      },

      kinesthetic: {
        template: `KINESTHETIC LEARNER ADAPTATION:
Adapt your response for a kinesthetic learner by:
- Focusing on practical, hands-on applications
- Suggesting physical activities and movement-based learning
- Including real-world examples and case studies
- Recommending building, creating, or experimenting
- Emphasizing learning through doing and experience

Content: {content}
Context: {context}
Learning Goal: {learning_goal}

Provide your response with kinesthetic learning enhancements.`,
        variables: ['content', 'context', 'learning_goal']
      },

      reading: {
        template: `READING/WRITING LEARNER ADAPTATION:
Adapt your response for a reading/writing learner by:
- Providing comprehensive, detailed explanations
- Suggesting note-taking and summarization techniques
- Including additional reading materials and references
- Recommending written exercises and reflective writing
- Organizing information in clear, logical written structures

Content: {content}
Context: {context}
Learning Goal: {learning_goal}

Provide your response with reading/writing learning enhancements.`,
        variables: ['content', 'context', 'learning_goal']
      }
    };
  }

  /**
   * Performance-based adaptation prompts
   */
  createPerformanceAdaptationPrompts() {
    return {
      struggling: {
        template: `STRUGGLING LEARNER SUPPORT:
The user is currently struggling with their learning (performance below 60%). Adapt your response by:
- Providing extra encouragement and positive reinforcement
- Breaking down concepts into smaller, manageable pieces
- Offering additional practice opportunities and resources
- Using simpler language and more detailed explanations
- Suggesting foundational review and skill-building activities
- Being patient and supportive in your tone

User Performance Data: {performance_data}
Recent Struggles: {struggling_areas}
Learning Context: {context}
Question/Request: {user_request}

Provide a supportive, encouraging response that helps build confidence while addressing their learning needs.`,
        variables: ['performance_data', 'struggling_areas', 'context', 'user_request']
      },

      excelling: {
        template: `ADVANCED LEARNER CHALLENGE:
The user is excelling in their learning (performance above 90%). Adapt your response by:
- Providing more challenging and advanced concepts
- Encouraging independent exploration and research
- Offering extension activities and deeper applications
- Using more sophisticated language and concepts
- Suggesting leadership opportunities (teaching others, peer mentoring)
- Challenging them to make connections across different areas

User Performance Data: {performance_data}
Areas of Excellence: {strong_areas}
Learning Context: {context}
Question/Request: {user_request}

Provide a challenging, intellectually stimulating response that pushes their learning forward.`,
        variables: ['performance_data', 'strong_areas', 'context', 'user_request']
      },

      average: {
        template: `BALANCED LEARNER APPROACH:
The user is performing at an average level (60-90% performance). Adapt your response by:
- Providing a balanced mix of support and challenge
- Offering opportunities for both reinforcement and advancement
- Using moderate complexity in language and concepts
- Suggesting varied practice activities
- Encouraging steady progress and skill development
- Maintaining an encouraging but appropriately challenging tone

User Performance Data: {performance_data}
Learning Patterns: {learning_patterns}
Learning Context: {context}
Question/Request: {user_request}

Provide a balanced response that supports continued growth while building on their current strengths.`,
        variables: ['performance_data', 'learning_patterns', 'context', 'user_request']
      }
    };
  }

  /**
   * Recommendation generation prompts
   */
  createRecommendationPrompts() {
    return {
      personalized: {
        template: `PERSONALIZED LEARNING RECOMMENDATIONS:
Generate highly personalized learning recommendations based on the user's profile:

USER PROFILE:
- Learning Style: {learning_style}
- Performance Level: {performance_level}
- Recent Activity: {recent_activity}
- Struggling Areas: {struggling_areas}
- Strong Areas: {strong_areas}
- Learning Preferences: {learning_preferences}

COURSE CONTEXT:
- Current Course: {course_title}
- Current Lesson: {lesson_title}
- Course Progress: {course_progress}%
- Difficulty Level: {difficulty_level}

ANALYTICS:
- Recent Scores: {recent_scores}
- Study Frequency: {study_frequency}
- Time Spent: {time_spent}
- Performance Trend: {performance_trend}

Generate specific, actionable recommendations for:
1. Next learning steps
2. Study methods aligned with their learning style
3. Resources to address struggling areas
4. Ways to leverage their strengths
5. Study schedule and time management suggestions

Make recommendations practical, achievable, and tailored to their specific situation.`,
        variables: [
          'learning_style', 'performance_level', 'recent_activity', 'struggling_areas',
          'strong_areas', 'learning_preferences', 'course_title', 'lesson_title',
          'course_progress', 'difficulty_level', 'recent_scores', 'study_frequency',
          'time_spent', 'performance_trend'
        ]
      }
    };
  }

  /**
   * Study plan generation prompts
   */
  createStudyPlanPrompts() {
    return {
      personalized: {
        template: `PERSONALIZED STUDY PLAN GENERATION:
Create a detailed, personalized study plan based on the user's profile and goals:

USER PROFILE:
- Learning Style: {learning_style}
- Available Time: {available_time} minutes per session
- Preferred Difficulty: {preferred_difficulty}
- Performance Level: {performance_level}
- Study Frequency: {study_frequency}

LEARNING GOALS:
{goals}

CURRENT CONTEXT:
- Course: {course_title}
- Current Progress: {course_progress}%
- Struggling Areas: {struggling_areas}
- Strong Areas: {strong_areas}

CONSTRAINTS:
- Time Frame: {timeframe}
- Session Duration: {session_duration} minutes
- Preferred Study Times: {preferred_times}

Create a study plan that includes:
1. Daily/weekly schedule aligned with their learning style
2. Specific activities for each study session
3. Progress milestones and checkpoints
4. Methods to address struggling areas
5. Techniques to leverage their strengths
6. Flexibility for different energy levels and time constraints
7. Assessment and adjustment strategies

Ensure the plan is realistic, sustainable, and adapted to their learning style and performance level.`,
        variables: [
          'learning_style', 'available_time', 'preferred_difficulty', 'performance_level',
          'study_frequency', 'goals', 'course_title', 'course_progress', 'struggling_areas',
          'strong_areas', 'timeframe', 'session_duration', 'preferred_times'
        ]
      }
    };
  }

  /**
   * Personalized feedback prompts
   */
  createFeedbackPrompts() {
    return {
      personalized: {
        template: `PERSONALIZED LEARNING FEEDBACK:
Provide personalized feedback on the user's work based on their learning profile:

USER PROFILE:
- Learning Style: {learning_style}
- Performance Level: {performance_level}
- Recent Performance Trend: {performance_trend}
- Encouragement Level Needed: {encouragement_level}

COURSE CONTEXT:
- Course: {course_title}
- Lesson: {lesson_title}
- Learning Objectives: {learning_objectives}

USER'S WORK:
{user_work}

ASSESSMENT CRITERIA:
- Understanding of concepts
- Application of knowledge
- Quality of reasoning
- Areas for improvement
- Strengths demonstrated

Provide feedback that:
1. Acknowledges their learning style preferences
2. Adjusts tone based on their performance level and trends
3. Offers specific, actionable improvement suggestions
4. Highlights strengths and progress made
5. Connects feedback to course objectives
6. Suggests next steps aligned with their learning style
7. Provides appropriate level of encouragement

Make the feedback constructive, specific, and motivating while being honest about areas needing improvement.`,
        variables: [
          'learning_style', 'performance_level', 'performance_trend', 'encouragement_level',
          'course_title', 'lesson_title', 'learning_objectives', 'user_work'
        ]
      }
    };
  }

  /**
   * Enhanced prompt building for orchestration
   */
  buildOrchestratedPrompt(type, category, data = {}) {
    const template = this.templates.orchestration?.[type]?.[category];
    
    if (!template) {
      // Fallback to regular prompt building
      return this.buildPrompt(type, category, data);
    }

    return this.interpolateTemplate(template.template, data);
  }

  /**
   * Get orchestration-specific templates
   */
  getOrchestrationTemplates() {
    return this.templates.orchestration || {};
  }

  /**
   * Validate orchestration template data
   */
  validateOrchestrationData(type, category, data) {
    const template = this.templates.orchestration?.[type]?.[category];
    
    if (!template) {
      return { valid: false, error: `Template not found: orchestration.${type}.${category}` };
    }

    const requiredVars = template.variables || [];
    const missingVars = requiredVars.filter(varName => !(varName in data));

    if (missingVars.length > 0) {
      return {
        valid: false,
        error: `Missing required variables: ${missingVars.join(', ')}`,
        missing: missingVars,
        required: requiredVars,
      };
    }

    return { valid: true };
  }
}

// Create a singleton instance
const promptTemplates = new PromptTemplates();

export default promptTemplates;
export { PromptTemplates };
