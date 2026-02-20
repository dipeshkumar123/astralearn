// AstraLearn v2 Minimal AI Integration Server
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

let userIdCounter = 1;
let aiInteractionIdCounter = 1;

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
    
    const newUser = {
      id: userIdCounter.toString(),
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      learningStyle: req.body.learningStyle || 'visual',
      interests: req.body.interests || [],
      skillLevel: req.body.skillLevel || 'beginner',
      learningGoals: req.body.learningGoals || [],
      preferredPace: req.body.preferredPace || 'moderate',
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

    // Generate AI response
    const aiResponse = generateAIResponse(message, user, context);

    // Save interaction
    const interaction = {
      id: aiInteractionIdCounter.toString(),
      userId: user.id,
      type: 'chat',
      context: { ...context, learningStyle: user.learningStyle, skillLevel: user.skillLevel },
      query: message,
      response: aiResponse,
      confidence: 0.85,
      helpful: null,
      metadata: {},
      createdAt: new Date(),
    };

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

// Start server
app.listen(PORT, () => {
  console.log('🚀 AstraLearn v2 AI Integration Server Started');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('🤖 AI Features:');
  console.log(`   💬 AI Chat: POST http://localhost:${PORT}/api/ai/chat`);
  console.log('');
  console.log('✅ Ready to accept requests!');
});
