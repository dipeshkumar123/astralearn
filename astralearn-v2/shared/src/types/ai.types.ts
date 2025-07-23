import { z } from 'zod';

// AI Chat Message Schema
export const AIChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().datetime(),
  metadata: z.object({
    tokens: z.number().optional(),
    model: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
    processingTime: z.number().optional(),
  }).optional(),
});

export type AIChatMessage = z.infer<typeof AIChatMessageSchema>;

// AI Chat Session Schema
export const AIChatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().optional(),
  context: z.object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    moduleId: z.string().optional(),
    topic: z.string().optional(),
    difficulty: z.string().optional(),
    learningObjectives: z.array(z.string()).optional(),
  }),
  messages: z.array(AIChatMessageSchema),
  status: z.enum(['active', 'completed', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AIChatSession = z.infer<typeof AIChatSessionSchema>;

// AI Request Schema
export const AIRequestSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    moduleId: z.string().optional(),
    sessionId: z.string().optional(),
    userProgress: z.record(z.any()).optional(),
    learningStyle: z.string().optional(),
    difficulty: z.string().optional(),
  }).optional(),
  type: z.enum(['chat', 'explanation', 'feedback', 'recommendation', 'debug']).default('chat'),
  options: z.object({
    includeExamples: z.boolean().default(false),
    includeResources: z.boolean().default(false),
    maxLength: z.number().positive().optional(),
    tone: z.enum(['formal', 'casual', 'encouraging', 'technical']).default('encouraging'),
  }).optional(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;

// AI Response Schema
export const AIResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  sessionId: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.enum(['article', 'video', 'exercise', 'documentation']),
    description: z.string().optional(),
  })).optional(),
  followUpQuestions: z.array(z.string()).optional(),
  metadata: z.object({
    model: z.string(),
    tokens: z.number(),
    processingTime: z.number(),
    confidence: z.number().min(0).max(1),
  }),
  timestamp: z.string().datetime(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// AI Explanation Request Schema
export const AIExplanationRequestSchema = z.object({
  concept: z.string(),
  context: z.object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  }).optional(),
  options: z.object({
    includeExamples: z.boolean().default(true),
    includeAnalogies: z.boolean().default(true),
    includeVisualAids: z.boolean().default(false),
    depth: z.enum(['brief', 'detailed', 'comprehensive']).default('detailed'),
  }).optional(),
});

export type AIExplanationRequest = z.infer<typeof AIExplanationRequestSchema>;

// AI Feedback Request Schema
export const AIFeedbackRequestSchema = z.object({
  type: z.enum(['assignment', 'quiz', 'project', 'discussion']),
  content: z.string(),
  rubric: z.object({
    criteria: z.array(z.object({
      name: z.string(),
      description: z.string(),
      weight: z.number().min(0).max(1),
      levels: z.array(z.object({
        name: z.string(),
        description: z.string(),
        points: z.number(),
      })),
    })),
    totalPoints: z.number().positive(),
  }).optional(),
  context: z.object({
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
    learningObjectives: z.array(z.string()).optional(),
  }).optional(),
});

export type AIFeedbackRequest = z.infer<typeof AIFeedbackRequestSchema>;

// AI Recommendation Schema
export const AIRecommendationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['course', 'lesson', 'resource', 'study_path', 'study_buddy', 'study_group']),
  title: z.string(),
  description: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  priority: z.enum(['low', 'medium', 'high']),
  targetId: z.string(), // ID of the recommended item
  metadata: z.record(z.any()),
  actions: z.array(z.object({
    type: z.string(),
    label: z.string(),
    url: z.string().optional(),
    data: z.record(z.any()).optional(),
  })),
  validUntil: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

// AI Study Plan Schema
export const AIStudyPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    targetDate: z.string().datetime(),
    priority: z.enum(['low', 'medium', 'high']),
    metrics: z.object({
      type: z.string(),
      target: z.number(),
      current: z.number().default(0),
    }),
  })),
  schedule: z.array(z.object({
    date: z.string(), // YYYY-MM-DD
    activities: z.array(z.object({
      type: z.enum(['lesson', 'quiz', 'assignment', 'review', 'practice']),
      title: z.string(),
      duration: z.number(), // in minutes
      courseId: z.string().optional(),
      lessonId: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']),
    })),
    totalDuration: z.number(), // in minutes
  })),
  adaptations: z.array(z.object({
    date: z.string().datetime(),
    reason: z.string(),
    changes: z.array(z.string()),
  })),
  progress: z.object({
    completedActivities: z.number().nonnegative().default(0),
    totalActivities: z.number().positive(),
    completionPercentage: z.number().min(0).max(100).default(0),
    onTrack: z.boolean().default(true),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AIStudyPlan = z.infer<typeof AIStudyPlanSchema>;
