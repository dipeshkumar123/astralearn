/**
 * Assessment Engine Service - Phase 3 Step 2
 * AI-powered assessment system with dynamic quiz generation, intelligent grading,
 * and adaptive difficulty adjustment based on student performance and learning style.
 */

import { Course, Module, Lesson, UserProgress, User } from '../models/index.js';
import aiOrchestrator from './aiOrchestrator.js';
import aiContextService from './aiContextService.js';

class AssessmentEngineService {
  constructor() {
    // Question type configurations
    this.questionTypes = {
      multiple_choice: {
        minOptions: 3,
        maxOptions: 5,
        defaultOptions: 4,
        difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 }
      },
      true_false: {
        options: 2,
        difficultyWeights: { easy: 0.4, medium: 0.4, hard: 0.2 }
      },
      fill_blank: {
        maxBlanks: 3,
        difficultyWeights: { easy: 0.2, medium: 0.5, hard: 0.3 }
      },
      short_answer: {
        maxLength: 200,
        difficultyWeights: { easy: 0.1, medium: 0.4, hard: 0.5 }
      },
      essay: {
        minLength: 100,
        maxLength: 1000,
        difficultyWeights: { easy: 0.0, medium: 0.3, hard: 0.7 }
      },
      coding: {
        languages: ['javascript', 'python', 'java', 'html', 'css'],
        difficultyWeights: { easy: 0.1, medium: 0.4, hard: 0.5 }
      }
    };

    // Difficulty progression thresholds
    this.difficultyThresholds = {
      increase: 0.85, // Increase difficulty if score >= 85%
      decrease: 0.60, // Decrease difficulty if score < 60%
      maintain: [0.60, 0.85] // Maintain difficulty between 60-85%
    };

    // Grading confidence thresholds
    this.gradingConfidence = {
      high: 0.90,
      medium: 0.70,
      low: 0.50
    };
  }

  /**
   * Generate AI-powered quiz from lesson content
   */
  async generateQuizFromContent(lessonContent, options = {}) {
    try {
      const {
        difficulty = 'medium',
        questionCount = 5,
        questionTypes = ['multiple_choice', 'true_false'],
        learningObjectives = [],
        userId = null
      } = options;

      // Get user context for personalization
      let userContext = {};
      if (userId) {
        userContext = await aiContextService.getUserContext(userId);
      }

      // Extract key concepts from content
      const keyContent = await this.extractKeyContent(lessonContent);

      // Generate questions using AI orchestration
      const quizQuestions = await this.generateQuestions({
        content: keyContent,
        difficulty,
        questionCount,
        questionTypes,
        learningObjectives,
        userContext
      });

      // Create quiz structure
      const quiz = {
        id: this.generateQuizId(),
        title: `${lessonContent.title || 'Lesson'} Assessment`,
        description: `Assessment covering key concepts from ${lessonContent.title || 'the lesson'}`,
        difficulty,
        totalQuestions: quizQuestions.length,
        estimatedDuration: this.calculateQuizDuration(quizQuestions),
        questions: quizQuestions,
        metadata: {
          generatedFor: userId,
          learningObjectives,
          contentSource: lessonContent.id || 'unknown',
          generatedAt: new Date().toISOString(),
          aiVersion: '3.2.0'
        }
      };

      return {
        success: true,
        quiz,
        metadata: {
          questionsGenerated: quizQuestions.length,
          averageDifficulty: this.calculateAverageDifficulty(quizQuestions),
          contentCoverage: this.calculateContentCoverage(quizQuestions, keyContent),
          estimatedAccuracy: 0.85 // AI generation accuracy estimate
        }
      };

    } catch (error) {
      console.error('Quiz generation error:', error);
      return {
        success: false,
        error: error.message,
        fallbackQuiz: await this.generateFallbackQuiz(lessonContent, options)
      };
    }
  }

  /**
   * Generate individual questions using AI orchestration
   */
  async generateQuestions({ content, difficulty, questionCount, questionTypes, learningObjectives, userContext }) {
    const questions = [];
    const questionsPerType = Math.ceil(questionCount / questionTypes.length);

    for (const questionType of questionTypes) {
      const typeQuestions = await this.generateQuestionsByType({
        content,
        questionType,
        difficulty,
        count: questionsPerType,
        learningObjectives,
        userContext
      });

      questions.push(...typeQuestions);
    }

    // Trim to exact count and shuffle
    return this.shuffleArray(questions.slice(0, questionCount));
  }

  /**
   * Generate questions of a specific type using AI
   */
  async generateQuestionsByType({ content, questionType, difficulty, count, learningObjectives, userContext }) {
    const questionPrompt = this.buildQuestionGenerationPrompt({
      content,
      questionType,
      difficulty,
      count,
      learningObjectives,
      userContext
    });

    const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
      type: 'assessment_generation',
      userId: userContext.id,
      content: {
        prompt: questionPrompt,
        questionType,
        difficulty,
        count
      },
      context: {
        lesson: content,
        user: userContext
      },
      options: {
        temperature: 0.7,
        maxTokens: 1500
      }
    });

    if (!orchestratedResponse.success) {
      throw new Error('Failed to generate questions with AI');
    }

    // Parse AI response into structured questions
    return this.parseAIQuestions(orchestratedResponse.response.reply, questionType, difficulty);
  }

  /**
   * Build AI prompt for question generation
   */
  buildQuestionGenerationPrompt({ content, questionType, difficulty, count, learningObjectives, userContext }) {
    const learningStyle = userContext.learning_style || 'visual';
    
    const styleInstructions = {
      visual: "Include questions that can reference diagrams, charts, or visual examples.",
      auditory: "Focus on questions about explanations, processes, and conceptual understanding.",
      kinesthetic: "Emphasize practical applications, hands-on scenarios, and real-world examples.",
      reading: "Include detailed text-based questions with comprehensive answer options."
    };

    return `
Generate ${count} ${questionType.replace('_', ' ')} question(s) based on the following lesson content:

LESSON CONTENT:
Title: ${content.title}
Key Concepts: ${content.keyConcepts?.join(', ') || 'N/A'}
Learning Objectives: ${learningObjectives.join(', ') || 'N/A'}
Content Summary: ${content.summary || content.description || 'N/A'}

REQUIREMENTS:
- Difficulty Level: ${difficulty}
- Question Type: ${questionType}
- Learning Style Adaptation: ${styleInstructions[learningStyle]}
- Cover different aspects of the content
- Ensure questions test understanding, not just memorization
- Include clear, unambiguous correct answers
- For multiple choice: provide plausible distractors
- For coding questions: include test cases if applicable

FORMAT THE RESPONSE AS JSON:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "${questionType}",
      "difficulty": "${difficulty}",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // for multiple choice
      "correctAnswer": "Correct answer or index",
      "explanation": "Brief explanation of why this is correct",
      "learningObjective": "Which objective this tests",
      "estimatedTime": 60 // seconds
    }
  ]
}

Generate engaging, educational questions that help assess student understanding.`;
  }

  /**
   * Parse AI-generated questions into structured format
   */
  parseAIQuestions(aiResponse, questionType, difficulty) {
    try {
      // Try to parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        // If JSON parsing fails, try to extract questions from text
        parsedResponse = this.extractQuestionsFromText(aiResponse, questionType);
      }

      const questions = parsedResponse.questions || [];
      
      return questions.map((q, index) => ({
        id: `q_${Date.now()}_${index}`,
        question: q.question,
        type: questionType,
        difficulty: difficulty,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        learningObjective: q.learningObjective || '',
        estimatedTime: q.estimatedTime || this.getDefaultQuestionTime(questionType),
        metadata: {
          generatedBy: 'ai',
          confidence: 0.85,
          reviewed: false
        }
      }));

    } catch (error) {
      console.error('Question parsing error:', error);
      return [];
    }
  }

  /**
   * Evaluate student response with AI-powered grading
   */
  async evaluateResponse(question, userAnswer, context = {}) {
    try {
      // For objective questions (multiple choice, true/false), use traditional grading
      if (['multiple_choice', 'true_false'].includes(question.type)) {
        return this.evaluateObjectiveQuestion(question, userAnswer);
      }

      // For subjective questions, use AI evaluation
      return await this.evaluateSubjectiveQuestion(question, userAnswer, context);

    } catch (error) {
      console.error('Response evaluation error:', error);
      return {
        success: false,
        error: error.message,
        score: 0,
        feedback: 'Unable to evaluate response at this time.'
      };
    }
  }

  /**
   * Evaluate objective questions (multiple choice, true/false)
   */
  evaluateObjectiveQuestion(question, userAnswer) {
    const isCorrect = this.compareAnswers(question.correctAnswer, userAnswer);
    
    return {
      success: true,
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect 
        ? `Correct! ${question.explanation || ''}`
        : `Incorrect. The correct answer is: ${question.correctAnswer}. ${question.explanation || ''}`,
      confidence: 1.0,
      gradingMethod: 'objective'
    };
  }

  /**
   * Evaluate subjective questions using AI
   */
  async evaluateSubjectiveQuestion(question, userAnswer, context) {
    const evaluationPrompt = this.buildEvaluationPrompt(question, userAnswer, context);

    const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
      type: 'assessment_grading',
      userId: context.userId,
      content: {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        rubric: question.rubric || this.getDefaultRubric(question.type)
      },
      context: {
        lesson: context.lesson,
        user: context.user
      },
      options: {
        temperature: 0.3, // Lower temperature for more consistent grading
        maxTokens: 800
      }
    });

    if (!orchestratedResponse.success) {
      throw new Error('AI grading failed');
    }

    // Parse AI grading response
    return this.parseGradingResponse(orchestratedResponse.response.reply, question, userAnswer);
  }

  /**
   * Build evaluation prompt for AI grading
   */
  buildEvaluationPrompt(question, userAnswer, context) {
    return `
Grade the following student response:

QUESTION: ${question.question}
STUDENT ANSWER: ${userAnswer}
EXPECTED ANSWER/CRITERIA: ${question.correctAnswer || 'See rubric below'}

GRADING RUBRIC:
${question.rubric || this.getDefaultRubric(question.type)}

CONTEXT:
- Question Type: ${question.type}
- Difficulty: ${question.difficulty}
- Learning Objective: ${question.learningObjective}

Please provide:
1. Score (0-100)
2. Detailed feedback
3. Specific strengths in the answer
4. Areas for improvement
5. Suggestions for further learning

FORMAT AS JSON:
{
  "score": 85,
  "feedback": "Overall feedback here",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area 1", "Area 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "confidence": 0.9
}

Be fair, constructive, and educational in your evaluation.`;
  }

  /**
   * Parse AI grading response
   */
  parseGradingResponse(aiResponse, question, userAnswer) {
    try {
      const gradingData = JSON.parse(aiResponse);
      
      return {
        success: true,
        isCorrect: gradingData.score >= 70, // 70% threshold for "correct"
        score: gradingData.score,
        feedback: gradingData.feedback,
        strengths: gradingData.strengths || [],
        improvements: gradingData.improvements || [],
        suggestions: gradingData.suggestions || [],
        confidence: gradingData.confidence || 0.8,
        gradingMethod: 'ai_assisted',
        needsReview: gradingData.confidence < this.gradingConfidence.medium
      };

    } catch (error) {
      console.error('Grading response parsing error:', error);
      
      // Fallback scoring based on keyword matching
      return this.fallbackSubjectiveGrading(question, userAnswer);
    }
  }

  /**
   * Calculate adaptive difficulty for next questions
   */
  calculateAdaptiveDifficulty(userPerformance, currentDifficulty) {
    const averageScore = userPerformance.averageScore || 0;
    const recentTrend = userPerformance.recentTrend || 'stable';
    
    let newDifficulty = currentDifficulty;
    
    // Adjust based on performance thresholds
    if (averageScore >= this.difficultyThresholds.increase && recentTrend !== 'declining') {
      newDifficulty = this.increaseDifficulty(currentDifficulty);
    } else if (averageScore < this.difficultyThresholds.decrease || recentTrend === 'declining') {
      newDifficulty = this.decreaseDifficulty(currentDifficulty);
    }
    
    return {
      newDifficulty,
      reasoning: this.explainDifficultyChange(currentDifficulty, newDifficulty, userPerformance),
      confidence: this.calculateDifficultyConfidence(userPerformance)
    };
  }

  /**
   * Analyze knowledge gaps from assessment results
   */
  analyzeKnowledgeGaps(assessmentResults, courseObjectives) {
    const gaps = [];
    const strengths = [];
    
    // Group results by learning objective
    const objectivePerformance = this.groupByObjective(assessmentResults);
    
    for (const [objective, results] of Object.entries(objectivePerformance)) {
      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
      const consistency = this.calculateConsistency(results.map(r => r.score));
      
      if (averageScore < 70) {
        gaps.push({
          objective,
          averageScore,
          consistency,
          questionCount: results.length,
          severity: this.calculateGapSeverity(averageScore, consistency),
          recommendedActions: this.recommendGapActions(objective, averageScore, consistency)
        });
      } else if (averageScore >= 85) {
        strengths.push({
          objective,
          averageScore,
          consistency,
          questionCount: results.length,
          confidence: this.calculateStrengthConfidence(averageScore, consistency)
        });
      }
    }
    
    return {
      knowledgeGaps: gaps.sort((a, b) => b.severity - a.severity),
      strengths: strengths.sort((a, b) => b.confidence - a.confidence),
      overallPerformance: this.calculateOverallPerformance(assessmentResults),
      recommendations: this.generateOverallRecommendations(gaps, strengths)
    };
  }

  /**
   * Generate personalized feedback based on learning style and performance
   */
  async generatePersonalizedFeedback(assessment, userProfile, performanceData) {
    const feedbackPrompt = this.buildFeedbackPrompt(assessment, userProfile, performanceData);
    
    const orchestratedResponse = await aiOrchestrator.orchestrateRequest({
      type: 'assessment_feedback',
      userId: userProfile.id,
      content: {
        assessment,
        performance: performanceData,
        learningStyle: userProfile.learningStyle
      },
      context: {
        user: userProfile,
        course: assessment.courseContext
      },
      options: {
        temperature: 0.6,
        maxTokens: 1200
      }
    });

    if (!orchestratedResponse.success) {
      return this.generateFallbackFeedback(assessment, performanceData);
    }

    return this.parseFeedbackResponse(orchestratedResponse.response.reply, userProfile.learningStyle);
  }

  /**
   * Utility methods for assessment processing
   */

  extractKeyContent(lessonContent) {
    return {
      title: lessonContent.title || '',
      keyConcepts: lessonContent.keyConcepts || [],
      summary: lessonContent.summary || lessonContent.description || '',
      learningObjectives: lessonContent.learningObjectives || [],
      difficulty: lessonContent.difficulty || 'medium',
      contentType: lessonContent.type || 'mixed'
    };
  }

  generateQuizId() {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateQuizDuration(questions) {
    const totalTime = questions.reduce((sum, q) => sum + (q.estimatedTime || 60), 0);
    return Math.ceil(totalTime / 60); // Convert to minutes
  }

  calculateAverageDifficulty(questions) {
    const difficultyValues = { easy: 1, medium: 2, hard: 3 };
    const avgValue = questions.reduce((sum, q) => sum + (difficultyValues[q.difficulty] || 2), 0) / questions.length;
    
    if (avgValue <= 1.33) return 'easy';
    if (avgValue <= 2.33) return 'medium';
    return 'hard';
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  compareAnswers(correct, userAnswer) {
    if (typeof correct === 'number' && typeof userAnswer === 'number') {
      return correct === userAnswer;
    }
    
    const normalizeString = str => str.toString().toLowerCase().trim();
    return normalizeString(correct) === normalizeString(userAnswer);
  }

  getDefaultQuestionTime(questionType) {
    const timeMap = {
      multiple_choice: 60,
      true_false: 30,
      fill_blank: 90,
      short_answer: 180,
      essay: 600,
      coding: 900
    };
    return timeMap[questionType] || 60;
  }

  getDefaultRubric(questionType) {
    const rubrics = {
      short_answer: `
        90-100: Complete, accurate answer demonstrating full understanding
        80-89: Mostly accurate with minor gaps or unclear explanations
        70-79: Partially correct but missing key components
        60-69: Shows some understanding but significant gaps
        0-59: Incorrect or demonstrates lack of understanding
      `,
      essay: `
        90-100: Comprehensive, well-structured response with clear arguments and examples
        80-89: Good understanding with adequate support and organization
        70-79: Basic understanding but lacks depth or clarity
        60-69: Shows effort but misses key points or has structural issues
        0-59: Inadequate response or off-topic
      `,
      coding: `
        90-100: Correct solution that compiles/runs and handles edge cases
        80-89: Mostly correct with minor syntax or logic errors
        70-79: Demonstrates understanding but has significant errors
        60-69: Shows programming concepts but solution doesn't work
        0-59: Incorrect approach or doesn't demonstrate understanding
      `
    };
    
    return rubrics[questionType] || rubrics.short_answer;
  }

  increaseDifficulty(currentDifficulty) {
    const progression = { easy: 'medium', medium: 'hard', hard: 'hard' };
    return progression[currentDifficulty] || currentDifficulty;
  }

  decreaseDifficulty(currentDifficulty) {
    const regression = { hard: 'medium', medium: 'easy', easy: 'easy' };
    return regression[currentDifficulty] || currentDifficulty;
  }

  /**
   * Generate fallback quiz when AI generation fails
   */
  async generateFallbackQuiz(lessonContent, options) {
    return {
      id: this.generateQuizId(),
      title: `${lessonContent.title || 'Lesson'} Review`,
      description: 'Basic assessment questions',
      difficulty: options.difficulty || 'medium',
      questions: [
        {
          id: 'fallback_1',
          question: `What are the main concepts covered in "${lessonContent.title || 'this lesson'}"?`,
          type: 'short_answer',
          difficulty: options.difficulty || 'medium',
          correctAnswer: 'Key concepts from the lesson',
          explanation: 'This question tests general understanding of lesson content.',
          estimatedTime: 180
        }
      ],
      isFallback: true
    };
  }
}

export const assessmentEngineService = new AssessmentEngineService();
