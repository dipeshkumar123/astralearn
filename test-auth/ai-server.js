// AstraLearn v2 AI Integration Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Groq = require('groq-sdk');

const app = express();
const PORT = 5003;
const JWT_SECRET = 'astralearn-super-secret-jwt-key-for-development-only-change-in-production-32chars';

// Initialize GROQ client (you'll need to set your API key)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'your-groq-api-key-here' // Replace with actual key
});

// In-memory data stores
const users = [];
const courses = [];
const modules = [];
const lessons = [];
const enrollments = [];
const progress = [];
const aiInteractions = [];
const recommendations = [];
const studyPlans = [];

let userIdCounter = 1;
let courseIdCounter = 1;
let moduleIdCounter = 1;
let lessonIdCounter = 1;
let enrollmentIdCounter = 1;
let progressIdCounter = 1;
let aiInteractionIdCounter = 1;
let recommendationIdCounter = 1;
let studyPlanIdCounter = 1;

// AI-specific data models
function createAIInteraction(interactionData) {
  return {
    id: aiInteractionIdCounter.toString(),
    userId: interactionData.userId,
    type: interactionData.type, // 'chat', 'recommendation', 'explanation', 'quiz_help'
    context: interactionData.context || {},
    query: interactionData.query,
    response: interactionData.response,
    confidence: interactionData.confidence || 0.8,
    helpful: null, // User feedback: true/false/null
    metadata: interactionData.metadata || {},
    createdAt: new Date(),
  };
}

function createRecommendation(recommendationData) {
  return {
    id: recommendationIdCounter.toString(),
    userId: recommendationData.userId,
    type: recommendationData.type, // 'course', 'lesson', 'topic', 'study_path'
    itemId: recommendationData.itemId,
    itemType: recommendationData.itemType, // 'course', 'lesson', 'topic'
    title: recommendationData.title,
    description: recommendationData.description,
    reason: recommendationData.reason,
    confidence: recommendationData.confidence || 0.8,
    priority: recommendationData.priority || 'medium', // 'high', 'medium', 'low'
    status: 'pending', // 'pending', 'viewed', 'accepted', 'dismissed'
    metadata: recommendationData.metadata || {},
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
}

function createStudyPlan(studyPlanData) {
  return {
    id: studyPlanIdCounter.toString(),
    userId: studyPlanData.userId,
    title: studyPlanData.title,
    description: studyPlanData.description,
    goals: studyPlanData.goals || [],
    timeline: studyPlanData.timeline, // in weeks
    difficulty: studyPlanData.difficulty,
    courses: studyPlanData.courses || [], // Array of course IDs
    schedule: studyPlanData.schedule || {}, // Weekly schedule
    progress: 0,
    status: 'active', // 'active', 'completed', 'paused'
    aiGenerated: true,
    metadata: studyPlanData.metadata || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Basic data models (simplified versions from course-server.js)
function createUser(userData) {
  return {
    id: userIdCounter.toString(),
    email: userData.email.toLowerCase(),
    username: userData.username.toLowerCase(),
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role || 'student',
    isActive: true,
    
    // AI-specific user data
    learningStyle: userData.learningStyle || 'visual',
    interests: userData.interests || [],
    skillLevel: userData.skillLevel || 'beginner',
    learningGoals: userData.learningGoals || [],
    preferredPace: userData.preferredPace || 'moderate', // 'slow', 'moderate', 'fast'
    
    // AI interaction preferences
    aiPreferences: {
      tutorPersonality: 'friendly', // 'friendly', 'professional', 'casual'
      explanationStyle: 'detailed', // 'brief', 'detailed', 'examples'
      difficultyPreference: 'adaptive', // 'easy', 'moderate', 'challenging', 'adaptive'
      reminderFrequency: 'daily', // 'none', 'daily', 'weekly'
    },
    
    stats: {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      totalPoints: 0,
      level: 1,
      aiInteractions: 0,
      helpfulAIResponses: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createCourse(courseData) {
  return {
    id: courseIdCounter.toString(),
    title: courseData.title,
    description: courseData.description,
    shortDescription: courseData.shortDescription || '',
    category: courseData.category || 'general',
    tags: courseData.tags || [],
    difficulty: courseData.difficulty || 'beginner',
    duration: courseData.duration || 0,
    instructorId: courseData.instructorId,
    instructorName: courseData.instructorName,
    isPublished: true,
    isActive: true,
    isFree: courseData.isFree !== false,
    
    // AI-enhanced course data
    aiGenerated: courseData.aiGenerated || false,
    learningObjectives: courseData.learningObjectives || [],
    prerequisites: courseData.prerequisites || [],
    skillsGained: courseData.skillsGained || [],
    
    moduleCount: 0,
    lessonCount: 0,
    enrollmentCount: 0,
    completionCount: 0,
    averageRating: 0,
    ratingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AstraLearn v2 AI Integration Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    aiEnabled: true,
    stats: {
      users: users.length,
      courses: courses.length,
      aiInteractions: aiInteractions.length,
      recommendations: recommendations.length,
      studyPlans: studyPlans.length,
    },
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'AstraLearn v2 AI Integration API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    aiFeatures: [
      'Intelligent Tutoring',
      'Personalized Recommendations',
      'Smart Study Plans',
      'Learning Path Optimization',
      'Content Explanation',
      'Progress Analysis',
      'Adaptive Learning',
    ],
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      ai: {
        chat: 'POST /api/ai/chat',
        explain: 'POST /api/ai/explain',
        recommend: 'GET /api/ai/recommendations',
        studyPlan: 'POST /api/ai/study-plan',
        feedback: 'POST /api/ai/feedback',
        analyze: 'POST /api/ai/analyze-progress',
      },
      courses: {
        getAllCourses: 'GET /api/courses',
        getCourse: 'GET /api/courses/:id',
        createCourse: 'POST /api/courses',
        enrollInCourse: 'POST /api/courses/:id/enroll',
      },
      users: {
        getProfile: 'GET /api/users/profile',
        updateAIPreferences: 'PUT /api/users/ai-preferences',
        getEnrollments: 'GET /api/users/enrollments',
      },
    },
  });
});

// Authentication endpoints (simplified)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, role = 'student' } = req.body;

    if (!email || !username || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'All fields are required',
      });
    }

    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email or username already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      learningStyle: req.body.learningStyle,
      interests: req.body.interests || [],
      skillLevel: req.body.skillLevel,
      learningGoals: req.body.learningGoals || [],
      preferredPace: req.body.preferredPace,
    };

    const newUser = createUser(userData);
    users.push(newUser);
    userIdCounter++;

    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User registered: ${newUser.email} (${newUser.role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          learningStyle: newUser.learningStyle,
          interests: newUser.interests,
          skillLevel: newUser.skillLevel,
        },
        tokens: { accessToken },
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email/username and password are required',
      });
    }

    const user = users.find(u => 
      u.email === identifier.toLowerCase() || 
      u.username === identifier.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          learningStyle: user.learningStyle,
          interests: user.interests,
          skillLevel: user.skillLevel,
          aiPreferences: user.aiPreferences,
        },
        tokens: { accessToken },
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// ===== AI INTEGRATION ENDPOINTS =====

// AI Chat - Intelligent tutoring and Q&A
app.post('/api/ai/chat', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const { message, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Message is required',
      });
    }

    // Build context for AI
    const aiContext = {
      userName: user.firstName,
      learningStyle: user.learningStyle,
      skillLevel: user.skillLevel,
      interests: user.interests,
      tutorPersonality: user.aiPreferences.tutorPersonality,
      explanationStyle: user.aiPreferences.explanationStyle,
      ...context,
    };

    // Create system prompt based on user preferences
    const systemPrompt = `You are an AI tutor for AstraLearn, a personalized learning platform.

User Profile:
- Name: ${aiContext.userName}
- Learning Style: ${aiContext.learningStyle}
- Skill Level: ${aiContext.skillLevel}
- Interests: ${aiContext.interests.join(', ')}
- Preferred Tutor Style: ${aiContext.tutorPersonality}
- Explanation Style: ${aiContext.explanationStyle}

Guidelines:
- Be ${aiContext.tutorPersonality} and encouraging
- Provide ${aiContext.explanationStyle} explanations
- Adapt to their ${aiContext.learningStyle} learning style
- Use examples relevant to their interests when possible
- Break down complex concepts for ${aiContext.skillLevel} level
- Always be supportive and motivating
- If asked about course recommendations, consider their interests and skill level`;

    let aiResponse;
    try {
      // Use GROQ for fast AI response (fallback to mock if API key not available)
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          model: 'llama3-8b-8192',
          temperature: 0.7,
          max_tokens: 1000,
        });
        aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response.';
      } else {
        // Mock AI response for testing
        aiResponse = generateMockAIResponse(message, aiContext);
      }
    } catch (error) {
      console.error('❌ GROQ API error:', error);
      aiResponse = generateMockAIResponse(message, aiContext);
    }

    // Save AI interaction
    const interaction = createAIInteraction({
      userId: user.id,
      type: 'chat',
      context: aiContext,
      query: message,
      response: aiResponse,
      confidence: 0.85,
      metadata: { model: 'llama3-8b-8192' },
    });

    aiInteractions.push(interaction);
    aiInteractionIdCounter++;

    // Update user stats
    user.stats.aiInteractions++;
    user.updatedAt = new Date();

    console.log(`✅ AI Chat: ${user.email} - "${message.substring(0, 50)}..."`);

    res.json({
      success: true,
      data: {
        response: aiResponse,
        interactionId: interaction.id,
        confidence: interaction.confidence,
        context: {
          tutorStyle: aiContext.tutorPersonality,
          adaptedFor: aiContext.learningStyle,
        },
      },
    });
  } catch (error) {
    console.error('❌ AI Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// AI Explain - Detailed explanations of concepts
app.post('/api/ai/explain', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const { concept, context = {}, difficulty = 'auto' } = req.body;

    if (!concept) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Concept to explain is required',
      });
    }

    const targetDifficulty = difficulty === 'auto' ? user.skillLevel : difficulty;

    const systemPrompt = `You are an expert educator explaining concepts for AstraLearn.

User Profile:
- Learning Style: ${user.learningStyle}
- Current Skill Level: ${user.skillLevel}
- Target Explanation Level: ${targetDifficulty}
- Interests: ${user.interests.join(', ')}

Task: Explain "${concept}" in a way that:
- Matches their ${user.learningStyle} learning style
- Is appropriate for ${targetDifficulty} level
- Uses examples from their interests when relevant
- Includes practical applications
- Provides step-by-step breakdown if complex
- Suggests related concepts to explore

Format your response with:
1. Simple definition
2. Detailed explanation
3. Real-world example
4. Key takeaways
5. Next steps for learning`;

    let explanation;
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Please explain: ${concept}` }
          ],
          model: 'llama3-8b-8192',
          temperature: 0.6,
          max_tokens: 1500,
        });
        explanation = completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating the explanation.';
      } else {
        explanation = generateMockExplanation(concept, user);
      }
    } catch (error) {
      console.error('❌ GROQ API error:', error);
      explanation = generateMockExplanation(concept, user);
    }

    // Save AI interaction
    const interaction = createAIInteraction({
      userId: user.id,
      type: 'explanation',
      context: { concept, difficulty: targetDifficulty, ...context },
      query: `Explain: ${concept}`,
      response: explanation,
      confidence: 0.9,
      metadata: { targetDifficulty, learningStyle: user.learningStyle },
    });

    aiInteractions.push(interaction);
    aiInteractionIdCounter++;

    user.stats.aiInteractions++;
    user.updatedAt = new Date();

    console.log(`✅ AI Explain: ${user.email} - "${concept}"`);

    res.json({
      success: true,
      data: {
        concept,
        explanation,
        interactionId: interaction.id,
        adaptedFor: {
          skillLevel: targetDifficulty,
          learningStyle: user.learningStyle,
        },
        relatedConcepts: generateRelatedConcepts(concept),
      },
    });
  } catch (error) {
    console.error('❌ AI Explain error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// AI Recommendations - Personalized course and content recommendations
app.get('/api/ai/recommendations', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Get user's existing recommendations
    const existingRecommendations = recommendations.filter(r =>
      r.userId === user.id && r.status === 'pending' && new Date() < r.expiresAt
    );

    // Generate new recommendations if needed
    if (existingRecommendations.length < 3) {
      const newRecommendations = generatePersonalizedRecommendations(user, courses);

      newRecommendations.forEach(rec => {
        const recommendation = createRecommendation(rec);
        recommendations.push(recommendation);
        recommendationIdCounter++;
      });
    }

    // Get all current recommendations
    const userRecommendations = recommendations.filter(r =>
      r.userId === user.id && r.status === 'pending' && new Date() < r.expiresAt
    ).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    console.log(`✅ AI Recommendations: ${user.email} - ${userRecommendations.length} recommendations`);

    res.json({
      success: true,
      data: {
        recommendations: userRecommendations,
        count: userRecommendations.length,
        generatedAt: new Date().toISOString(),
        basedOn: {
          interests: user.interests,
          skillLevel: user.skillLevel,
          learningStyle: user.learningStyle,
          completedCourses: user.stats.coursesCompleted,
        },
      },
    });
  } catch (error) {
    console.error('❌ AI Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// AI Study Plan - Generate personalized study plans
app.post('/api/ai/study-plan', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const { goals, timeline, focusAreas, currentSkills } = req.body;

    if (!goals || !timeline) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Goals and timeline are required',
      });
    }

    // Generate AI-powered study plan
    const studyPlanData = generateAIStudyPlan({
      user,
      goals,
      timeline,
      focusAreas: focusAreas || [],
      currentSkills: currentSkills || [],
      availableCourses: courses,
    });

    const studyPlan = createStudyPlan(studyPlanData);
    studyPlans.push(studyPlan);
    studyPlanIdCounter++;

    console.log(`✅ AI Study Plan: ${user.email} - "${studyPlan.title}" (${timeline} weeks)`);

    res.status(201).json({
      success: true,
      message: 'AI study plan generated successfully',
      data: studyPlan,
    });
  } catch (error) {
    console.error('❌ AI Study Plan error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// AI Feedback - Provide feedback on AI responses
app.post('/api/ai/feedback', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const { interactionId, helpful, feedback } = req.body;

    if (!interactionId || helpful === undefined) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Interaction ID and helpful flag are required',
      });
    }

    const interaction = aiInteractions.find(i => i.id === interactionId && i.userId === user.id);
    if (!interaction) {
      return res.status(404).json({
        success: false,
        error: 'INTERACTION_NOT_FOUND',
        message: 'AI interaction not found',
      });
    }

    // Update interaction with feedback
    interaction.helpful = helpful;
    interaction.metadata.userFeedback = feedback;
    interaction.metadata.feedbackAt = new Date();

    // Update user stats
    if (helpful) {
      user.stats.helpfulAIResponses++;
    }
    user.updatedAt = new Date();

    console.log(`✅ AI Feedback: ${user.email} - ${helpful ? 'Helpful' : 'Not helpful'}`);

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: {
        interactionId,
        helpful,
        thanksMessage: helpful ?
          'Thank you! Your feedback helps me provide better assistance.' :
          'Thank you for the feedback. I\'ll work on improving my responses.',
      },
    });
  } catch (error) {
    console.error('❌ AI Feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// AI Progress Analysis - Analyze learning progress and provide insights
app.post('/api/ai/analyze-progress', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Analyze user's learning progress
    const analysis = analyzeUserProgress(user, enrollments, progress, aiInteractions);

    console.log(`✅ AI Progress Analysis: ${user.email} - ${analysis.insights.length} insights`);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('❌ AI Progress Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// ===== AI HELPER FUNCTIONS =====

function generateMockAIResponse(message, context) {
  const responses = {
    greeting: `Hello ${context.userName}! I'm your AI tutor, ready to help you learn. What would you like to explore today?`,
    help: `I'm here to help you with your learning journey! I can explain concepts, recommend courses, create study plans, and answer questions. What specific topic interests you?`,
    motivation: `You're doing great, ${context.userName}! Remember, every expert was once a beginner. Keep up the excellent work on your ${context.interests.join(' and ')} journey!`,
    default: `That's a great question! As your ${context.tutorPersonality} AI tutor, I'd love to help you understand this better. Based on your ${context.learningStyle} learning style, let me break this down for you...`,
  };

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) return responses.greeting;
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) return responses.help;
  if (lowerMessage.includes('motivation') || lowerMessage.includes('encourage')) return responses.motivation;

  return responses.default;
}

function generateMockExplanation(concept, user) {
  return `# Understanding ${concept}

## Simple Definition
${concept} is a fundamental concept that's perfect for your ${user.skillLevel} level learning journey.

## Detailed Explanation
Based on your ${user.learningStyle} learning style, let me break this down step by step:

1. **Core Concept**: The basic principle behind ${concept}
2. **How it Works**: The mechanism and process involved
3. **Why it Matters**: The importance in your field of interest

## Real-World Example
Since you're interested in ${user.interests.join(' and ')}, here's how ${concept} applies in that context...

## Key Takeaways
- ${concept} is essential for understanding advanced topics
- It connects to your interests in ${user.interests[0] || 'your field'}
- Practice with hands-on examples will solidify your understanding

## Next Steps
1. Try some practice exercises
2. Explore related concepts like [related topics]
3. Apply this knowledge in a project

Would you like me to explain any part in more detail?`;
}

function generateRelatedConcepts(concept) {
  // Mock related concepts - in real implementation, this would use AI or a knowledge graph
  const conceptMap = {
    'javascript': ['variables', 'functions', 'objects', 'arrays', 'DOM manipulation'],
    'html': ['tags', 'attributes', 'semantic markup', 'forms', 'accessibility'],
    'css': ['selectors', 'flexbox', 'grid', 'animations', 'responsive design'],
    'python': ['variables', 'functions', 'classes', 'modules', 'data structures'],
  };

  const lowerConcept = concept.toLowerCase();
  for (const [key, related] of Object.entries(conceptMap)) {
    if (lowerConcept.includes(key)) {
      return related;
    }
  }

  return ['fundamentals', 'best practices', 'advanced techniques', 'real-world applications'];
}

function generatePersonalizedRecommendations(user, availableCourses) {
  // Mock recommendation generation - in real implementation, this would use ML algorithms
  const recommendations = [];

  // Interest-based recommendations
  user.interests.forEach(interest => {
    const matchingCourses = availableCourses.filter(course =>
      course.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
      course.category.toLowerCase().includes(interest.toLowerCase())
    );

    matchingCourses.slice(0, 2).forEach(course => {
      recommendations.push({
        userId: user.id,
        type: 'course',
        itemId: course.id,
        itemType: 'course',
        title: course.title,
        description: course.shortDescription,
        reason: `Recommended based on your interest in ${interest}`,
        confidence: 0.85,
        priority: 'high',
        metadata: { basedOn: 'interest', interest },
      });
    });
  });

  // Skill level recommendations
  const skillBasedCourses = availableCourses.filter(course =>
    course.difficulty === user.skillLevel
  );

  skillBasedCourses.slice(0, 1).forEach(course => {
    recommendations.push({
      userId: user.id,
      type: 'course',
      itemId: course.id,
      itemType: 'course',
      title: course.title,
      description: course.shortDescription,
      reason: `Perfect for your ${user.skillLevel} skill level`,
      confidence: 0.8,
      priority: 'medium',
      metadata: { basedOn: 'skillLevel', skillLevel: user.skillLevel },
    });
  });

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

function generateAIStudyPlan(params) {
  const { user, goals, timeline, focusAreas, currentSkills, availableCourses } = params;

  // Mock study plan generation
  const relevantCourses = availableCourses.filter(course =>
    focusAreas.some(area =>
      course.tags.includes(area) ||
      course.category.includes(area) ||
      course.title.toLowerCase().includes(area.toLowerCase())
    )
  ).slice(0, 3);

  const weeklyHours = user.preferredPace === 'fast' ? 15 : user.preferredPace === 'slow' ? 5 : 10;

  return {
    userId: user.id,
    title: `Personalized ${focusAreas.join(' & ')} Learning Path`,
    description: `A ${timeline}-week study plan tailored to your ${user.learningStyle} learning style and ${user.skillLevel} skill level.`,
    goals: goals,
    timeline: parseInt(timeline),
    difficulty: user.skillLevel,
    courses: relevantCourses.map(c => c.id),
    schedule: {
      weeklyHours,
      sessionsPerWeek: user.preferredPace === 'fast' ? 5 : 3,
      preferredTimes: ['evening'], // Could be customized
    },
    metadata: {
      generatedFor: focusAreas,
      basedOnSkills: currentSkills,
      adaptedFor: user.learningStyle,
      estimatedCompletion: `${timeline} weeks`,
    },
  };
}

function analyzeUserProgress(user, userEnrollments, userProgress, userAIInteractions) {
  // Mock progress analysis
  const userEnrollmentData = userEnrollments.filter(e => e.userId === user.id);
  const userProgressData = userProgress.filter(p => p.userId === user.id);
  const userAIData = userAIInteractions.filter(i => i.userId === user.id);

  const insights = [];
  const recommendations = [];

  // Analyze completion rate
  const completionRate = userEnrollmentData.length > 0 ?
    (userEnrollmentData.filter(e => e.status === 'completed').length / userEnrollmentData.length) * 100 : 0;

  if (completionRate < 50) {
    insights.push({
      type: 'completion_rate',
      message: 'Your course completion rate could be improved. Consider setting smaller, achievable goals.',
      severity: 'medium',
    });
    recommendations.push('Break down your learning into smaller, manageable chunks');
  } else if (completionRate > 80) {
    insights.push({
      type: 'completion_rate',
      message: 'Excellent completion rate! You\'re very consistent with your learning.',
      severity: 'positive',
    });
  }

  // Analyze AI interaction patterns
  if (userAIData.length > 10) {
    const helpfulResponses = userAIData.filter(i => i.helpful === true).length;
    const helpfulRate = helpfulResponses / userAIData.length;

    if (helpfulRate > 0.8) {
      insights.push({
        type: 'ai_engagement',
        message: 'You\'re making great use of AI tutoring! Keep asking questions.',
        severity: 'positive',
      });
    }
  }

  // Learning style insights
  insights.push({
    type: 'learning_style',
    message: `Your ${user.learningStyle} learning style is well-suited for interactive content. Look for hands-on exercises and visual materials.`,
    severity: 'info',
  });

  return {
    summary: {
      totalCourses: userEnrollmentData.length,
      completedCourses: userEnrollmentData.filter(e => e.status === 'completed').length,
      completionRate: Math.round(completionRate),
      aiInteractions: userAIData.length,
      helpfulAIResponses: userAIData.filter(i => i.helpful === true).length,
    },
    insights,
    recommendations,
    strengths: [
      `Strong ${user.learningStyle} learning approach`,
      `Consistent engagement with ${user.interests.join(' and ')} topics`,
    ],
    areasForImprovement: [
      'Consider exploring new topic areas',
      'Increase interaction with AI tutoring features',
    ],
    nextSteps: [
      'Set weekly learning goals',
      'Join study groups in your interest areas',
      'Practice with hands-on projects',
    ],
  };
}

// Start server
app.listen(PORT, () => {
  console.log('🚀 AstraLearn v2 AI Integration Server Started');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('🤖 AI Features:');
  console.log(`   💬 AI Chat: POST http://localhost:${PORT}/api/ai/chat`);
  console.log(`   📚 Explain: POST http://localhost:${PORT}/api/ai/explain`);
  console.log(`   🎯 Recommendations: GET http://localhost:${PORT}/api/ai/recommendations`);
  console.log(`   📋 Study Plan: POST http://localhost:${PORT}/api/ai/study-plan`);
  console.log(`   👍 Feedback: POST http://localhost:${PORT}/api/ai/feedback`);
  console.log(`   📊 Progress Analysis: POST http://localhost:${PORT}/api/ai/analyze-progress`);
  console.log('');
  console.log('✅ Ready to accept requests!');
});
