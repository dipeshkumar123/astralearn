// AstraLearn v2 Simple AI Integration Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5003;
const JWT_SECRET = 'astralearn-super-secret-jwt-key-for-development-only-change-in-production-32chars';

// In-memory data stores
const users = [];
const aiInteractions = [];
const recommendations = [];
const studyPlans = [];

let userIdCounter = 1;
let aiInteractionIdCounter = 1;
let recommendationIdCounter = 1;
let studyPlanIdCounter = 1;

// Data models
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
    learningStyle: userData.learningStyle || 'visual',
    interests: userData.interests || [],
    skillLevel: userData.skillLevel || 'beginner',
    learningGoals: userData.learningGoals || [],
    preferredPace: userData.preferredPace || 'moderate',
    aiPreferences: {
      tutorPersonality: 'friendly',
      explanationStyle: 'detailed',
      difficultyPreference: 'adaptive',
      reminderFrequency: 'daily',
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

function createAIInteraction(interactionData) {
  return {
    id: aiInteractionIdCounter.toString(),
    userId: interactionData.userId,
    type: interactionData.type,
    context: interactionData.context || {},
    query: interactionData.query,
    response: interactionData.response,
    confidence: interactionData.confidence || 0.8,
    helpful: null,
    metadata: interactionData.metadata || {},
    createdAt: new Date(),
  };
}

function createRecommendation(recommendationData) {
  return {
    id: recommendationIdCounter.toString(),
    userId: recommendationData.userId,
    type: recommendationData.type,
    itemId: recommendationData.itemId,
    itemType: recommendationData.itemType,
    title: recommendationData.title,
    description: recommendationData.description,
    reason: recommendationData.reason,
    confidence: recommendationData.confidence || 0.8,
    priority: recommendationData.priority || 'medium',
    status: 'pending',
    metadata: recommendationData.metadata || {},
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}

function createStudyPlan(studyPlanData) {
  return {
    id: studyPlanIdCounter.toString(),
    userId: studyPlanData.userId,
    title: studyPlanData.title,
    description: studyPlanData.description,
    goals: studyPlanData.goals || [],
    timeline: studyPlanData.timeline,
    difficulty: studyPlanData.difficulty,
    courses: studyPlanData.courses || [],
    schedule: studyPlanData.schedule || {},
    progress: 0,
    status: 'active',
    aiGenerated: true,
    metadata: studyPlanData.metadata || {},
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
    },
  });
});

// Register
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

// Login
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

// AI Chat endpoint
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

    // Generate AI response based on user profile
    const aiResponse = generateAIResponse(message, user, context);

    // Save interaction
    const interaction = createAIInteraction({
      userId: user.id,
      type: 'chat',
      context: { ...context, learningStyle: user.learningStyle, skillLevel: user.skillLevel },
      query: message,
      response: aiResponse,
      confidence: 0.85,
    });

    aiInteractions.push(interaction);
    aiInteractionIdCounter++;

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
          tutorStyle: user.aiPreferences.tutorPersonality,
          adaptedFor: user.learningStyle,
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

// AI Explain endpoint
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
    const explanation = generateExplanation(concept, user, targetDifficulty);

    const interaction = createAIInteraction({
      userId: user.id,
      type: 'explanation',
      context: { concept, difficulty: targetDifficulty, ...context },
      query: `Explain: ${concept}`,
      response: explanation,
      confidence: 0.9,
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
        relatedConcepts: getRelatedConcepts(concept),
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

// AI Recommendations endpoint
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

    // Generate recommendations
    const newRecommendations = generateRecommendations(user);

    newRecommendations.forEach(rec => {
      const recommendation = createRecommendation(rec);
      recommendations.push(recommendation);
      recommendationIdCounter++;
    });

    const userRecommendations = recommendations.filter(r =>
      r.userId === user.id && r.status === 'pending' && new Date() < r.expiresAt
    );

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

// AI Study Plan endpoint
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

    const studyPlanData = generateStudyPlan(user, goals, timeline, focusAreas, currentSkills);
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

// AI Feedback endpoint
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

    interaction.helpful = helpful;
    interaction.metadata.userFeedback = feedback;

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

// AI Progress Analysis endpoint
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

    const analysis = analyzeProgress(user);

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

// Helper functions
function generateAIResponse(message, user, context) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello ${user.firstName}! I'm your AI tutor, ready to help you learn. Based on your interests in ${user.interests.join(' and ')}, what would you like to explore today?`;
  }

  if (lowerMessage.includes('javascript')) {
    return `Great question about JavaScript! As a ${user.learningStyle} learner at ${user.skillLevel} level, let me explain this in a way that works best for you. JavaScript is a powerful programming language that's perfect for your interests in ${user.interests.filter(i => i.includes('programming') || i.includes('web')).join(' and ')}.`;
  }

  if (lowerMessage.includes('recommend') || lowerMessage.includes('course')) {
    return `Based on your ${user.skillLevel} skill level and interests in ${user.interests.join(', ')}, I'd recommend starting with foundational courses in your areas of interest. Your ${user.learningStyle} learning style means you'll benefit from hands-on, interactive content.`;
  }

  if (lowerMessage.includes('motivation') || lowerMessage.includes('help')) {
    return `You're doing great, ${user.firstName}! Remember, every expert was once a beginner. Your ${user.preferredPace} learning pace is perfect - consistency is key. Keep exploring your interests in ${user.interests.join(' and ')}, and don't hesitate to ask questions!`;
  }

  return `That's a great question! As your ${user.aiPreferences.tutorPersonality} AI tutor, I'd love to help you understand this better. Based on your ${user.learningStyle} learning style and ${user.skillLevel} level, let me break this down for you in a way that makes sense.`;
}

function generateExplanation(concept, user, difficulty) {
  return `# Understanding ${concept}

## Simple Definition
${concept} is a fundamental concept that's perfect for your ${difficulty} level learning journey.

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
2. Explore related concepts
3. Apply this knowledge in a project

Would you like me to explain any part in more detail?`;
}

function getRelatedConcepts(concept) {
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

function generateRecommendations(user) {
  const recommendations = [];

  user.interests.forEach((interest, index) => {
    recommendations.push({
      userId: user.id,
      type: 'course',
      itemId: `course-${index + 1}`,
      itemType: 'course',
      title: `Advanced ${interest.charAt(0).toUpperCase() + interest.slice(1)} Course`,
      description: `Perfect for your ${user.skillLevel} level in ${interest}`,
      reason: `Recommended based on your interest in ${interest}`,
      confidence: 0.85,
      priority: index === 0 ? 'high' : 'medium',
      metadata: { basedOn: 'interest', interest },
    });
  });

  return recommendations.slice(0, 3);
}

function generateStudyPlan(user, goals, timeline, focusAreas, currentSkills) {
  const weeklyHours = user.preferredPace === 'fast' ? 15 : user.preferredPace === 'slow' ? 5 : 10;

  return {
    userId: user.id,
    title: `Personalized ${focusAreas ? focusAreas.join(' & ') : 'Learning'} Path`,
    description: `A ${timeline}-week study plan tailored to your ${user.learningStyle} learning style and ${user.skillLevel} skill level.`,
    goals: goals,
    timeline: parseInt(timeline),
    difficulty: user.skillLevel,
    courses: [`course-1`, `course-2`],
    schedule: {
      weeklyHours,
      sessionsPerWeek: user.preferredPace === 'fast' ? 5 : 3,
      preferredTimes: ['evening'],
    },
    metadata: {
      generatedFor: focusAreas || [],
      basedOnSkills: currentSkills || [],
      adaptedFor: user.learningStyle,
      estimatedCompletion: `${timeline} weeks`,
    },
  };
}

function analyzeProgress(user) {
  const userAIData = aiInteractions.filter(i => i.userId === user.id);

  const insights = [];
  const recommendations = [];

  // AI interaction insights
  if (userAIData.length > 5) {
    const helpfulResponses = userAIData.filter(i => i.helpful === true).length;
    const helpfulRate = helpfulResponses / userAIData.length;

    if (helpfulRate > 0.8) {
      insights.push({
        type: 'ai_engagement',
        message: 'You\'re making great use of AI tutoring! Keep asking questions.',
        severity: 'positive',
      });
    } else if (helpfulRate < 0.5) {
      insights.push({
        type: 'ai_engagement',
        message: 'Consider providing feedback on AI responses to improve your experience.',
        severity: 'medium',
      });
    }
  }

  // Learning style insights
  insights.push({
    type: 'learning_style',
    message: `Your ${user.learningStyle} learning style is well-suited for interactive content. Look for hands-on exercises and visual materials.`,
    severity: 'info',
  });

  // Interest-based insights
  if (user.interests.length > 0) {
    insights.push({
      type: 'interests',
      message: `Your diverse interests in ${user.interests.join(', ')} show great curiosity. Consider exploring interdisciplinary topics.`,
      severity: 'positive',
    });
  }

  return {
    summary: {
      totalCourses: user.stats.coursesEnrolled,
      completedCourses: user.stats.coursesCompleted,
      completionRate: user.stats.coursesEnrolled > 0 ? Math.round((user.stats.coursesCompleted / user.stats.coursesEnrolled) * 100) : 0,
      aiInteractions: user.stats.aiInteractions,
      helpfulAIResponses: user.stats.helpfulAIResponses,
    },
    insights,
    recommendations: [
      'Set weekly learning goals',
      'Engage more with AI tutoring features',
      'Practice with hands-on projects',
    ],
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
