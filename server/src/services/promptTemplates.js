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
}

// Create a singleton instance
const promptTemplates = new PromptTemplates();

export default promptTemplates;
export { PromptTemplates };
