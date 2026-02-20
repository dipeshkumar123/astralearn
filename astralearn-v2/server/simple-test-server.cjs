// Simple test server for AstraLearn v2
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
// const OpenAI = require('openai'); // Commented out for mock implementation

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = 5000;
const JWT_SECRET = 'astralearn-super-secret-jwt-key-for-development-only-change-in-production-32chars';

// In-memory stores for testing
const users = [];
const courses = [];
const enrollments = [];

// Learning content stores
const modules = [];
const lessons = [];
const lessonContent = [];
const userProgress = [];
const assessments = [];
const assessmentQuestions = [];
const userAssessmentAttempts = [];

// Real-time notification stores
const notifications = [];
const userNotifications = [];
const connectedUsers = new Map(); // userId -> socketId mapping

// Certificate stores
const certificates = [];
const certificateVerifications = new Map(); // certificateId -> verification data

// Payment stores
const payments = [];
const subscriptions = [];
const premiumAccess = []; // userId -> courseId mappings for premium access

// AI stores
const aiRecommendations = [];
const aiConversations = [];
const aiGeneratedContent = [];

// ID counters
let userIdCounter = 1;
let courseIdCounter = 1;
let enrollmentIdCounter = 1;
let moduleIdCounter = 1;
let lessonIdCounter = 1;
let contentIdCounter = 1;
let progressIdCounter = 1;
let assessmentIdCounter = 1;
let questionIdCounter = 1;
let attemptIdCounter = 1;
let notificationIdCounter = 1;
let certificateIdCounter = 1;
let paymentIdCounter = 1;
let subscriptionIdCounter = 1;
let aiRecommendationIdCounter = 1;
let aiConversationIdCounter = 1;
let aiContentIdCounter = 1;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle user authentication for socket
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => u.id === decoded.userId);

      if (user) {
        socket.userId = user.id;
        connectedUsers.set(user.id, socket.id);
        console.log(`✅ Socket authenticated for user: ${user.email}`);

        // Send unread notifications to user
        const unreadNotifications = userNotifications
          .filter(un => un.userId === user.id && !un.read)
          .map(un => notifications.find(n => n.id === un.notificationId))
          .filter(Boolean);

        if (unreadNotifications.length > 0) {
          socket.emit('unread_notifications', unreadNotifications);
        }
      }
    } catch (error) {
      console.error('❌ Socket authentication failed:', error.message);
    }
  });

  // Handle marking notifications as read
  socket.on('mark_notification_read', (notificationId) => {
    if (socket.userId) {
      const userNotification = userNotifications.find(
        un => un.userId === socket.userId && un.notificationId === notificationId
      );
      if (userNotification) {
        userNotification.read = true;
        userNotification.readAt = new Date().toISOString();
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`🔌 User disconnected: ${socket.userId}`);
    }
  });
});

// Notification helper functions
function createNotification(type, title, message, data = {}) {
  const notification = {
    id: notificationIdCounter.toString(),
    type,
    title,
    message,
    data,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);
  notificationIdCounter++;

  return notification;
}

function sendNotificationToUser(userId, notification) {
  // Store notification for user
  userNotifications.push({
    id: `${userId}-${notification.id}`,
    userId,
    notificationId: notification.id,
    read: false,
    createdAt: new Date().toISOString()
  });

  // Send real-time notification if user is connected
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('new_notification', notification);
  }
}

function sendNotificationToMultipleUsers(userIds, notification) {
  userIds.forEach(userId => sendNotificationToUser(userId, notification));
}

// Certificate generation helper functions
function generateCertificateId() {
  return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateVerificationHash(certificateData) {
  const dataString = JSON.stringify({
    certificateId: certificateData.certificateId,
    userId: certificateData.userId,
    courseId: certificateData.courseId,
    completionDate: certificateData.completionDate,
    grade: certificateData.grade
  });
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

async function generateCertificatePDF(certificateData) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Certificate background and styling
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fillAndStroke('#f8f9fa', '#dee2e6');

      // Header border
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
         .lineWidth(3)
         .stroke('#007bff');

      // Inner border
      doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
         .lineWidth(1)
         .stroke('#6c757d');

      // Title
      doc.fontSize(36)
         .fillColor('#007bff')
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF COMPLETION', 0, 120, { align: 'center' });

      // Subtitle
      doc.fontSize(18)
         .fillColor('#6c757d')
         .font('Helvetica')
         .text('This is to certify that', 0, 180, { align: 'center' });

      // Student name
      doc.fontSize(32)
         .fillColor('#212529')
         .font('Helvetica-Bold')
         .text(certificateData.studentName, 0, 220, { align: 'center' });

      // Course completion text
      doc.fontSize(18)
         .fillColor('#6c757d')
         .font('Helvetica')
         .text('has successfully completed the course', 0, 280, { align: 'center' });

      // Course name
      doc.fontSize(28)
         .fillColor('#007bff')
         .font('Helvetica-Bold')
         .text(certificateData.courseName, 0, 320, { align: 'center' });

      // Completion details
      doc.fontSize(16)
         .fillColor('#6c757d')
         .font('Helvetica')
         .text(`Completed on: ${new Date(certificateData.completionDate).toLocaleDateString()}`, 0, 380, { align: 'center' });

      if (certificateData.grade) {
        doc.text(`Final Grade: ${certificateData.grade}%`, 0, 405, { align: 'center' });
      }

      // Certificate ID and verification
      doc.fontSize(12)
         .fillColor('#6c757d')
         .text(`Certificate ID: ${certificateData.certificateId}`, 80, doc.page.height - 120);

      doc.text(`Verification Hash: ${certificateData.verificationHash.substring(0, 16)}...`, 80, doc.page.height - 100);

      // Generate QR code for verification
      const qrCodeData = `https://astralearn.com/verify/${certificateData.certificateId}`;
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, { width: 100 });

      doc.image(qrCodeBuffer, doc.page.width - 180, doc.page.height - 140, { width: 80, height: 80 });

      doc.fontSize(10)
         .text('Scan to verify', doc.page.width - 180, doc.page.height - 50, { width: 80, align: 'center' });

      // AstraLearn branding
      doc.fontSize(24)
         .fillColor('#007bff')
         .font('Helvetica-Bold')
         .text('AstraLearn', 80, doc.page.height - 160);

      doc.fontSize(12)
         .fillColor('#6c757d')
         .font('Helvetica')
         .text('Online Learning Platform', 80, doc.page.height - 140);

      // Instructor signature area (if available)
      if (certificateData.instructorName) {
        doc.fontSize(14)
           .fillColor('#212529')
           .text('_________________________', doc.page.width - 300, doc.page.height - 120);

        doc.fontSize(12)
           .fillColor('#6c757d')
           .text(certificateData.instructorName, doc.page.width - 300, doc.page.height - 100);

        doc.text('Course Instructor', doc.page.width - 300, doc.page.height - 85);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Payment helper functions
function generatePaymentId() {
  return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateTransactionId() {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
}

function simulatePaymentProcessing(amount, paymentMethod) {
  // Simulate payment processing delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 95% success rate
      const success = Math.random() > 0.05;

      if (success) {
        resolve({
          success: true,
          transactionId: generateTransactionId(),
          status: 'completed',
          processingFee: Math.round(amount * 0.029 * 100) / 100, // 2.9% processing fee
          netAmount: Math.round((amount - (amount * 0.029)) * 100) / 100
        });
      } else {
        resolve({
          success: false,
          status: 'failed',
          error: 'PAYMENT_DECLINED',
          message: 'Payment was declined by the payment processor'
        });
      }
    }, Math.random() * 2000 + 500); // 0.5-2.5 second delay
  });
}

function calculateCoursePrice(course, discountCode = null) {
  let basePrice = course.price || 0;

  // Apply discount if provided
  if (discountCode) {
    const discounts = {
      'STUDENT10': 0.10,
      'EARLY20': 0.20,
      'BUNDLE30': 0.30,
      'NEWUSER15': 0.15
    };

    const discountRate = discounts[discountCode] || 0;
    basePrice = basePrice * (1 - discountRate);
  }

  return Math.round(basePrice * 100) / 100;
}

function hasAccessToCourse(userId, courseId) {
  // Check if user has premium access to the course
  return premiumAccess.some(access =>
    access.userId === userId && access.courseId === courseId &&
    (!access.expiresAt || new Date(access.expiresAt) > new Date())
  );
}

function grantCourseAccess(userId, courseId, duration = null) {
  const access = {
    id: `ACCESS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    userId,
    courseId,
    grantedAt: new Date().toISOString(),
    expiresAt: duration ? new Date(Date.now() + duration).toISOString() : null
  };

  premiumAccess.push(access);
  return access;
}

// Mock AI helper functions (simulating OpenAI responses)
async function mockOpenAICompletion(prompt, options = {}) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

  const { maxTokens = 150, temperature = 0.7, type = 'text' } = options;

  // Mock responses based on prompt content
  if (prompt.includes('recommend courses') || prompt.includes('course recommendation')) {
    return {
      choices: [{
        message: {
          content: `Based on your learning history and interests, I recommend:

1. **Advanced JavaScript Patterns** - Perfect for building on your JavaScript foundation
2. **React Native Mobile Development** - Expand your React skills to mobile platforms
3. **Node.js Backend Development** - Complete your full-stack journey
4. **TypeScript Fundamentals** - Add type safety to your JavaScript projects

These courses align with current industry trends and your demonstrated interest in modern web development.`
        }
      }],
      usage: { total_tokens: Math.floor(Math.random() * 100) + 50 }
    };
  }

  if (prompt.includes('learning path') || prompt.includes('study plan')) {
    return {
      choices: [{
        message: {
          content: `Here's your personalized learning path:

**Phase 1: Foundation (2-3 weeks)**
- Complete JavaScript fundamentals
- Practice with coding exercises daily
- Build 2-3 small projects

**Phase 2: Framework Mastery (4-6 weeks)**
- Deep dive into React concepts
- Learn state management (Redux/Context)
- Build a portfolio project

**Phase 3: Advanced Topics (3-4 weeks)**
- Explore testing frameworks
- Learn deployment strategies
- Study performance optimization

**Phase 4: Specialization (Ongoing)**
- Choose: Mobile (React Native) or Backend (Node.js)
- Contribute to open source projects
- Build complex applications`
        }
      }],
      usage: { total_tokens: Math.floor(Math.random() * 150) + 100 }
    };
  }

  if (prompt.includes('explain') || prompt.includes('what is')) {
    const topic = prompt.match(/explain (.+)|what is (.+)/i);
    const subject = topic ? (topic[1] || topic[2]) : 'this concept';

    return {
      choices: [{
        message: {
          content: `${subject} is a fundamental concept in programming that involves:

• **Definition**: A clear explanation of what ${subject} means
• **Purpose**: Why it's important and when to use it
• **Examples**: Practical applications and use cases
• **Best Practices**: How to implement it effectively

Understanding ${subject} will help you write better, more maintainable code and advance your programming skills.`
        }
      }],
      usage: { total_tokens: Math.floor(Math.random() * 80) + 40 }
    };
  }

  if (prompt.includes('quiz') || prompt.includes('questions')) {
    return {
      choices: [{
        message: {
          content: `Here are some practice questions:

**Question 1**: What is the difference between let and var in JavaScript?
A) No difference  B) Scope and hoisting  C) Performance  D) Syntax

**Question 2**: Which React hook is used for side effects?
A) useState  B) useEffect  C) useContext  D) useReducer

**Question 3**: What does API stand for?
A) Application Programming Interface  B) Advanced Programming Integration
C) Automated Program Interaction  D) Application Process Integration

**Answers**: 1-B, 2-B, 3-A`
        }
      }],
      usage: { total_tokens: Math.floor(Math.random() * 120) + 80 }
    };
  }

  // Default response
  return {
    choices: [{
      message: {
        content: `I understand you're asking about: "${prompt.substring(0, 50)}..."

As your AI learning assistant, I'm here to help you with:
• Course recommendations based on your progress
• Personalized learning paths
• Concept explanations and clarifications
• Practice questions and quizzes
• Study tips and best practices

How can I assist you with your learning journey today?`
      }
    }],
    usage: { total_tokens: Math.floor(Math.random() * 100) + 60 }
  };
}

function generatePersonalizedRecommendations(user, userProgress, userEnrollments) {
  const recommendations = [];

  // Analyze user's completed courses
  const completedCourses = userEnrollments.filter(e => e.completed);
  const inProgressCourses = userEnrollments.filter(e => !e.completed);

  // Mock recommendation logic
  if (completedCourses.some(e => e.courseId === '1')) { // JavaScript completed
    recommendations.push({
      courseId: '2',
      title: 'Advanced React Development',
      reason: 'Perfect next step after mastering JavaScript fundamentals',
      confidence: 0.92,
      difficulty: 'advanced',
      estimatedTime: '6-8 weeks'
    });
  }

  if (completedCourses.length === 0) {
    recommendations.push({
      courseId: '1',
      title: 'Introduction to JavaScript',
      reason: 'Great starting point for programming beginners',
      confidence: 0.95,
      difficulty: 'beginner',
      estimatedTime: '4-6 weeks'
    });
  }

  if (completedCourses.length >= 2) {
    recommendations.push({
      courseId: '3',
      title: 'Data Science with Python',
      reason: 'Expand your skills into data analysis and machine learning',
      confidence: 0.78,
      difficulty: 'intermediate',
      estimatedTime: '8-10 weeks'
    });
  }

  return recommendations;
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AstraLearn v2 Test Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    usersCount: users.length,
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'AstraLearn v2 Test API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me',
      courses: 'GET /api/courses',
      courseDetails: 'GET /api/courses/:id',
      createCourse: 'POST /api/courses',
      enrollCourse: 'POST /api/courses/:id/enroll',
      courseModules: 'GET /api/courses/:courseId/modules',
      moduleLessons: 'GET /api/modules/:moduleId/lessons',
      lessonContent: 'GET /api/lessons/:lessonId/content',
      lessonDetails: 'GET /api/lessons/:lessonId',
      courseProgress: 'GET /api/courses/:courseId/progress',
      updateProgress: 'POST /api/lessons/:lessonId/progress',
      lessonAssessment: 'GET /api/lessons/:lessonId/assessment',
      submitAssessment: 'POST /api/assessments/:assessmentId/submit',
      assessmentAttempts: 'GET /api/assessments/:assessmentId/attempts',
    },
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request:', req.body);
    
    const { email, username, password, firstName, lastName, role = 'student' } = req.body;

    // Basic validation
    if (!email || !username || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'All fields are required',
        details: {
          email: !email ? 'Email is required' : null,
          username: !username ? 'Username is required' : null,
          password: !password ? 'Password is required' : null,
          firstName: !firstName ? 'First name is required' : null,
          lastName: !lastName ? 'Last name is required' : null,
        }
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: userIdCounter.toString(),
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    userIdCounter++;

    // Generate token
    const accessToken = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
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
          isActive: newUser.isActive,
          emailVerified: newUser.emailVerified,
          createdAt: newUser.createdAt,
        },
        tokens: {
          accessToken,
        },
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: error.message,
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    const { identifier, password } = req.body;

    // Basic validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email/username and password are required',
      });
    }

    // Find user
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
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
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        tokens: {
          accessToken,
        },
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: error.message,
    });
  }
});

// Get profile endpoint
app.get('/api/auth/me', async (req, res) => {
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
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired token',
    });
  }
});

// Course Management Endpoints

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    console.log('Get courses request');

    const { category, difficulty, search } = req.query;
    let filteredCourses = [...courses];

    // Apply filters
    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }
    if (difficulty) {
      filteredCourses = filteredCourses.filter(course => course.difficulty === difficulty);
    }
    if (search) {
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredCourses,
      total: filteredCourses.length,
    });
  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// IMPORTANT: Specific routes must come before parameterized routes
// Get instructor courses (moved from line 2585)
app.get('/api/courses/instructor', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Instructor role required.',
        timestamp: new Date().toISOString()
      });
    }

    const instructorCourses = courses.filter(c => c.instructorId === req.user.id);

    // Add enrollment and progress statistics
    const coursesWithStats = instructorCourses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
      const courseModules = modules.filter(m => m.courseId === course.id);
      const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.moduleId));

      // Calculate average progress
      const allProgress = courseEnrollments.map(enrollment => {
        const userProgressData = userProgress.filter(p =>
          p.userId === enrollment.userId &&
          courseLessons.some(l => l.id === p.lessonId)
        );
        const completedLessons = userProgressData.filter(p => p.status === 'completed').length;
        return courseLessons.length > 0 ? (completedLessons / courseLessons.length) * 100 : 0;
      });

      const averageProgress = allProgress.length > 0 ?
        allProgress.reduce((sum, progress) => sum + progress, 0) / allProgress.length : 0;

      return {
        ...course,
        stats: {
          enrollments: courseEnrollments.length,
          averageProgress: Math.round(averageProgress),
          totalLessons: courseLessons.length,
          totalModules: courseModules.length,
          lastUpdated: course.updatedAt
        }
      };
    });

    res.json({
      success: true,
      data: coursesWithStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch instructor courses',
      timestamp: new Date().toISOString()
    });
  }
});

// Advanced course search (moved from line 2871)
app.get('/api/courses/search', async (req, res) => {
  try {
    const {
      q = '',
      category,
      difficulty,
      instructor,
      tags,
      sortBy = 'relevance',
      limit = 20,
      offset = 0
    } = req.query;

    let filteredCourses = [...courses];

    // Text search
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }

    // Difficulty filter
    if (difficulty) {
      filteredCourses = filteredCourses.filter(course => course.difficulty === difficulty);
    }

    // Instructor filter
    if (instructor) {
      filteredCourses = filteredCourses.filter(course => course.instructorId === parseInt(instructor));
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',');
      filteredCourses = filteredCourses.filter(course =>
        tagArray.some(tag => course.tags?.includes(tag))
      );
    }

    // Sort results
    if (sortBy === 'title') {
      filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      filteredCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'popularity') {
      filteredCourses.sort((a, b) => {
        const aEnrollments = enrollments.filter(e => e.courseId === a.id).length;
        const bEnrollments = enrollments.filter(e => e.courseId === b.id).length;
        return bEnrollments - aEnrollments;
      });
    }

    // Pagination
    const total = filteredCourses.length;
    const paginatedCourses = filteredCourses.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Add enrollment counts and instructor info
    const coursesWithDetails = paginatedCourses.map(course => {
      const instructor = users.find(u => u.id === course.instructorId);
      const enrollmentCount = enrollments.filter(e => e.courseId === course.id).length;

      return {
        ...course,
        instructor: instructor ? {
          id: instructor.id,
          firstName: instructor.firstName,
          lastName: instructor.lastName
        } : null,
        enrollmentCount,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10 // Simulated rating 3.0-5.0
      };
    });

    res.json({
      success: true,
      data: coursesWithDetails,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      filters: {
        categories: [...new Set(courses.map(c => c.category))],
        difficulties: [...new Set(courses.map(c => c.difficulty))],
        instructors: [...new Set(courses.map(c => c.instructorId))]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Course search error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to search courses',
      timestamp: new Date().toISOString()
    });
  }
});

// Get popular course tags (moved from line 2986)
app.get('/api/courses/tags', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Extract all tags from courses
    const allTags = [];
    courses.forEach(course => {
      if (course.tags) {
        allTags.push(...course.tags);
      }
    });

    // Count tag frequency
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Sort by frequency and limit
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, parseInt(limit))
      .map(([tag, count]) => ({
        tag,
        count,
        courses: courses.filter(c => c.tags?.includes(tag)).length
      }));

    res.json({
      success: true,
      data: popularTags,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get course tags error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch course tags',
      timestamp: new Date().toISOString()
    });
  }
});

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('❌ Get course error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Create course (instructor only)
app.post('/api/courses', async (req, res) => {
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
    const user = users.find(u => u.id === decoded.userId);

    if (!user || user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Only instructors can create courses',
      });
    }

    const { title, description, category, difficulty, price, duration } = req.body;

    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title, description, category, and difficulty are required',
      });
    }

    const newCourse = {
      id: courseIdCounter.toString(),
      title,
      description,
      category,
      difficulty,
      price: price || 0,
      duration: duration || 0,
      instructorId: user.id,
      instructorName: `${user.firstName} ${user.lastName}`,
      enrollmentCount: 0,
      rating: 0,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    courses.push(newCourse);
    courseIdCounter++;

    console.log(`✅ Course created: ${newCourse.title} by ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse,
    });
  } catch (error) {
    console.error('❌ Create course error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Enroll in course
app.post('/api/courses/:id/enroll', async (req, res) => {
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
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const courseId = req.params.id;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = enrollments.find(e => e.userId === user.id && e.courseId === courseId);
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        error: 'ALREADY_ENROLLED',
        message: 'Already enrolled in this course',
      });
    }

    const enrollment = {
      id: enrollmentIdCounter.toString(),
      userId: user.id,
      courseId: courseId,
      enrolledAt: new Date(),
      progress: 0,
      completed: false,
    };

    enrollments.push(enrollment);
    enrollmentIdCounter++;

    // Update course enrollment count
    course.enrollmentCount++;

    console.log(`✅ User enrolled: ${user.email} in ${course.title}`);

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment,
    });
  } catch (error) {
    console.error('❌ Enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Learning Content Management Endpoints

// Get modules for a course
app.get('/api/courses/:courseId/modules', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
      });
    }

    const courseModules = modules
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    res.json({
      success: true,
      data: courseModules,
      total: courseModules.length,
    });
  } catch (error) {
    console.error('❌ Get modules error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Get lessons for a module
app.get('/api/modules/:moduleId/lessons', async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const module = modules.find(m => m.id === moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'MODULE_NOT_FOUND',
        message: 'Module not found',
      });
    }

    const moduleLessons = lessons
      .filter(l => l.moduleId === moduleId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    res.json({
      success: true,
      data: moduleLessons,
      total: moduleLessons.length,
    });
  } catch (error) {
    console.error('❌ Get lessons error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Get lesson content
app.get('/api/lessons/:lessonId/content', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const lesson = lessons.find(l => l.id === lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'LESSON_NOT_FOUND',
        message: 'Lesson not found',
      });
    }

    const content = lessonContent
      .filter(c => c.lessonId === lessonId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    res.json({
      success: true,
      data: content,
      total: content.length,
    });
  } catch (error) {
    console.error('❌ Get lesson content error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Get lesson details with content
app.get('/api/lessons/:lessonId', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const lesson = lessons.find(l => l.id === lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'LESSON_NOT_FOUND',
        message: 'Lesson not found',
      });
    }

    const content = lessonContent
      .filter(c => c.lessonId === lessonId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const lessonWithContent = {
      ...lesson,
      content: content
    };

    res.json({
      success: true,
      data: lessonWithContent,
    });
  } catch (error) {
    console.error('❌ Get lesson details error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Progress Tracking Endpoints

// Get user progress for a course
app.get('/api/courses/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    // Check if user is enrolled, auto-enroll if not
    let enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (!enrollment) {
      // Auto-enroll user for better UX
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'COURSE_NOT_FOUND',
          message: 'Course not found',
        });
      }

      // Create enrollment
      enrollment = {
        id: enrollmentIdCounter.toString(),
        userId: userId,
        courseId: courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completed: false
      };

      enrollments.push(enrollment);
      enrollmentIdCounter++;

      // Update course enrollment count
      course.enrollmentCount = (course.enrollmentCount || 0) + 1;

      console.log(`✅ Auto-enrolled user ${userId} in course ${courseId}`);
    }

    const courseModules = modules.filter(m => m.courseId === courseId);
    const moduleIds = courseModules.map(m => m.id);
    const courseLessons = lessons.filter(l => moduleIds.includes(l.moduleId));
    const lessonIds = courseLessons.map(l => l.id);

    const userProgressRecords = userProgress.filter(p =>
      p.userId === userId && lessonIds.includes(p.lessonId)
    );

    const totalLessons = courseLessons.length;
    const completedLessons = userProgressRecords.filter(p => p.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.json({
      success: true,
      data: {
        courseId,
        userId,
        totalLessons,
        completedLessons,
        progressPercentage,
        lessons: userProgressRecords
      }
    });
  } catch (error) {
    console.error('❌ Get progress error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Update lesson progress
app.post('/api/lessons/:lessonId/progress', authenticateToken, async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = req.user.id;
    const { completed, timeSpent, score } = req.body;

    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'LESSON_NOT_FOUND',
        message: 'Lesson not found',
      });
    }

    // Find the course this lesson belongs to
    const module = modules.find(m => m.id === lesson.moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'MODULE_NOT_FOUND',
        message: 'Module not found for this lesson',
      });
    }

    const courseId = module.courseId;

    // Auto-enroll user in course if not already enrolled
    let enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (!enrollment) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        enrollment = {
          id: enrollmentIdCounter.toString(),
          userId: userId,
          courseId: courseId,
          enrolledAt: new Date().toISOString(),
          progress: 0,
          completed: false
        };

        enrollments.push(enrollment);
        enrollmentIdCounter++;

        // Update course enrollment count
        course.enrollmentCount = (course.enrollmentCount || 0) + 1;

        console.log(`✅ Auto-enrolled user ${userId} in course ${courseId} via lesson progress`);
      }
    }

    // Find existing progress record
    let progressRecord = userProgress.find(p => p.userId === userId && p.lessonId === lessonId);

    if (progressRecord) {
      // Update existing record
      progressRecord.completed = completed !== undefined ? completed : progressRecord.completed;
      progressRecord.timeSpent = (progressRecord.timeSpent || 0) + (timeSpent || 0);
      progressRecord.score = score !== undefined ? score : progressRecord.score;
      progressRecord.lastAccessedAt = new Date();
      progressRecord.updatedAt = new Date();
    } else {
      // Create new progress record
      progressRecord = {
        id: progressIdCounter.toString(),
        userId,
        lessonId,
        completed: completed || false,
        timeSpent: timeSpent || 0,
        score: score || null,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userProgress.push(progressRecord);
      progressIdCounter++;
    }

    // Check if course is completed after this lesson progress update
    if (completed && enrollment) {
      // Get all lessons in the course
      const courseModules = modules.filter(m => m.courseId === courseId);
      const courseLessons = lessons.filter(l =>
        courseModules.some(m => m.id === l.moduleId)
      );

      // Get user's progress for all lessons in this course
      const userCourseLessons = userProgress.filter(p =>
        p.userId === userId &&
        courseLessons.some(l => l.id === p.lessonId) &&
        p.completed
      );

      // Check if all lessons are completed
      const allLessonsCompleted = courseLessons.length > 0 &&
        userCourseLessons.length === courseLessons.length;

      if (allLessonsCompleted && !enrollment.completed) {
        // Mark course as completed
        enrollment.completed = true;
        enrollment.completedAt = new Date().toISOString();
        enrollment.progress = 100;

        console.log(`🎓 User ${userId} completed course ${courseId}!`);

        // Create course completion notification
        const course = courses.find(c => c.id === courseId);
        if (course) {
          const notification = createNotification(
            'course_completion',
            'Course Completed! 🎓',
            `Congratulations! You have successfully completed "${course.title}". You can now generate your certificate.`,
            {
              courseId: courseId,
              courseName: course.title,
              completionDate: enrollment.completedAt,
              certificateAvailable: true,
              url: `/courses/${courseId}/certificate`
            }
          );

          sendNotificationToUser(userId, notification);
          console.log(`📢 Sent course completion notification to user ${userId}`);
        }
      }
    }

    res.json({
      success: true,
      data: progressRecord,
    });
  } catch (error) {
    console.error('❌ Update progress error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Assessment Endpoints

// Get assessment for a lesson
app.get('/api/lessons/:lessonId/assessment', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const assessment = assessments.find(a => a.lessonId === lessonId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'ASSESSMENT_NOT_FOUND',
        message: 'No assessment found for this lesson',
      });
    }

    const questions = assessmentQuestions
      .filter(q => q.assessmentId === assessment.id)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(q => ({
        ...q,
        correctAnswer: undefined, // Don't send correct answers to client
        explanation: undefined
      }));

    res.json({
      success: true,
      data: {
        ...assessment,
        questions
      }
    });
  } catch (error) {
    console.error('❌ Get assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Submit assessment attempt
app.post('/api/assessments/:assessmentId/submit', authenticateToken, async (req, res) => {
  try {
    const assessmentId = req.params.assessmentId;
    const userId = req.user.id;
    const { answers } = req.body;

    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'ASSESSMENT_NOT_FOUND',
        message: 'Assessment not found',
      });
    }

    // Check attempt limit
    const userAttempts = userAssessmentAttempts.filter(a =>
      a.userId === userId && a.assessmentId === assessmentId
    );

    if (userAttempts.length >= assessment.maxAttempts) {
      return res.status(403).json({
        success: false,
        error: 'MAX_ATTEMPTS_REACHED',
        message: 'Maximum attempts reached for this assessment',
      });
    }

    // Get questions and calculate score
    const questions = assessmentQuestions
      .filter(q => q.assessmentId === assessmentId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    let totalPoints = 0;
    let earnedPoints = 0;
    const results = [];

    questions.forEach((question, index) => {
      totalPoints += question.points;
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        earnedPoints += question.points;
      }

      results.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      });
    });

    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercentage >= assessment.passingScore;

    // Save attempt
    const attempt = {
      id: attemptIdCounter.toString(),
      userId,
      assessmentId,
      answers,
      results,
      score: scorePercentage,
      earnedPoints,
      totalPoints,
      passed,
      submittedAt: new Date(),
      createdAt: new Date(),
    };

    userAssessmentAttempts.push(attempt);
    attemptIdCounter++;

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error('❌ Submit assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Get user's assessment attempts
app.get('/api/assessments/:assessmentId/attempts', authenticateToken, async (req, res) => {
  try {
    const assessmentId = req.params.assessmentId;
    const userId = req.user.id;

    const attempts = userAssessmentAttempts
      .filter(a => a.userId === userId && a.assessmentId === assessmentId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.json({
      success: true,
      data: attempts,
      total: attempts.length,
    });
  } catch (error) {
    console.error('❌ Get attempts error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
  });
});

// Moved 404 handler to end of file after all endpoints

// Database seeding function
async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  try {
    // Create sample users
    const sampleUsers = [
      {
        email: 'john.instructor@astralearn.com',
        username: 'johninstructor',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'instructor'
      },
      {
        email: 'jane.student@astralearn.com',
        username: 'janestudent',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'student'
      },
      {
        email: 'mike.student@astralearn.com',
        username: 'mikestudent',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'student'
      }
    ];

    // Create users
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = {
        id: userIdCounter.toString(),
        email: userData.email.toLowerCase(),
        username: userData.username.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(user);
      userIdCounter++;
    }

    // Create sample courses
    const instructorId = users.find(u => u.role === 'instructor').id;
    const sampleCourses = [
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming language',
        category: 'Programming',
        difficulty: 'beginner',
        price: 49.99,
        duration: 120,
        instructorId: instructorId,
        instructorName: 'John Smith',
        enrollmentCount: 0,
        rating: 4.5,
        isPublished: true,
      },
      {
        title: 'Advanced React Development',
        description: 'Master advanced React concepts and patterns',
        category: 'Programming',
        difficulty: 'advanced',
        price: 99.99,
        duration: 180,
        instructorId: instructorId,
        instructorName: 'John Smith',
        enrollmentCount: 0,
        rating: 4.8,
        isPublished: true,
      },
      {
        title: 'Data Science with Python',
        description: 'Learn data analysis and machine learning with Python',
        category: 'Data Science',
        difficulty: 'intermediate',
        price: 79.99,
        duration: 200,
        instructorId: instructorId,
        instructorName: 'John Smith',
        enrollmentCount: 0,
        rating: 4.6,
        isPublished: true,
      }
    ];

    for (const courseData of sampleCourses) {
      const course = {
        id: courseIdCounter.toString(),
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      courses.push(course);
      courseIdCounter++;
    }

    // Create modules for courses
    const sampleModules = [
      // JavaScript Course Modules
      {
        courseId: '1',
        title: 'Getting Started with JavaScript',
        description: 'Introduction to JavaScript basics and setup',
        orderIndex: 1,
        isPublished: true
      },
      {
        courseId: '1',
        title: 'Variables and Data Types',
        description: 'Understanding JavaScript variables and data types',
        orderIndex: 2,
        isPublished: true
      },
      {
        courseId: '1',
        title: 'Functions and Control Flow',
        description: 'Learn about functions, loops, and conditionals',
        orderIndex: 3,
        isPublished: true
      },
      // React Course Modules
      {
        courseId: '2',
        title: 'Advanced React Patterns',
        description: 'Higher-order components and render props',
        orderIndex: 1,
        isPublished: true
      },
      {
        courseId: '2',
        title: 'State Management',
        description: 'Redux, Context API, and state patterns',
        orderIndex: 2,
        isPublished: true
      },
      // Python Course Modules
      {
        courseId: '3',
        title: 'Python for Data Analysis',
        description: 'Pandas, NumPy, and data manipulation',
        orderIndex: 1,
        isPublished: true
      }
    ];

    for (const moduleData of sampleModules) {
      const module = {
        id: moduleIdCounter.toString(),
        ...moduleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      modules.push(module);
      moduleIdCounter++;
    }

    // Create lessons for modules
    const sampleLessons = [
      // Module 1 lessons (Getting Started with JavaScript)
      {
        moduleId: '1',
        title: 'What is JavaScript?',
        description: 'Introduction to JavaScript and its uses',
        orderIndex: 1,
        duration: 15,
        type: 'video',
        isPublished: true
      },
      {
        moduleId: '1',
        title: 'Setting up Development Environment',
        description: 'Install Node.js and set up your first project',
        orderIndex: 2,
        duration: 20,
        type: 'video',
        isPublished: true
      },
      {
        moduleId: '1',
        title: 'Your First JavaScript Program',
        description: 'Write and run your first JavaScript code',
        orderIndex: 3,
        duration: 25,
        type: 'interactive',
        isPublished: true
      },
      // Module 2 lessons (Variables and Data Types)
      {
        moduleId: '2',
        title: 'Understanding Variables',
        description: 'Learn about var, let, and const',
        orderIndex: 1,
        duration: 18,
        type: 'video',
        isPublished: true
      },
      {
        moduleId: '2',
        title: 'Data Types in JavaScript',
        description: 'Strings, numbers, booleans, and objects',
        orderIndex: 2,
        duration: 22,
        type: 'video',
        isPublished: true
      },
      {
        moduleId: '2',
        title: 'Variables Practice Quiz',
        description: 'Test your knowledge of variables and data types',
        orderIndex: 3,
        duration: 10,
        type: 'assessment',
        isPublished: true
      }
    ];

    for (const lessonData of sampleLessons) {
      const lesson = {
        id: lessonIdCounter.toString(),
        ...lessonData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      lessons.push(lesson);
      lessonIdCounter++;
    }

    // Create lesson content
    const sampleContent = [
      {
        lessonId: '1',
        type: 'video',
        title: 'JavaScript Introduction Video',
        content: {
          videoUrl: 'https://example.com/videos/js-intro.mp4',
          transcript: 'Welcome to JavaScript! In this video, we will explore...',
          duration: 900 // 15 minutes in seconds
        },
        orderIndex: 1
      },
      {
        lessonId: '1',
        type: 'text',
        title: 'JavaScript Overview',
        content: {
          markdown: `# What is JavaScript?

JavaScript is a versatile programming language that runs in web browsers and on servers. It's used for:

- **Web Development**: Making websites interactive
- **Server-side Development**: Building APIs and web servers
- **Mobile Apps**: Creating cross-platform mobile applications
- **Desktop Apps**: Building desktop applications

## Key Features

1. **Dynamic Typing**: Variables can hold different types of data
2. **First-class Functions**: Functions can be assigned to variables
3. **Prototype-based**: Object-oriented programming through prototypes
4. **Event-driven**: Responds to user interactions and system events`
        },
        orderIndex: 2
      },
      {
        lessonId: '2',
        type: 'video',
        title: 'Development Environment Setup',
        content: {
          videoUrl: 'https://example.com/videos/setup.mp4',
          transcript: 'Let\'s set up your development environment...',
          duration: 1200 // 20 minutes
        },
        orderIndex: 1
      },
      {
        lessonId: '3',
        type: 'interactive',
        title: 'Code Exercise: Hello World',
        content: {
          instructions: 'Write a JavaScript program that displays "Hello, World!" in the console.',
          starterCode: '// Write your code here\n',
          solution: 'console.log("Hello, World!");',
          testCases: [
            {
              input: '',
              expectedOutput: 'Hello, World!'
            }
          ]
        },
        orderIndex: 1
      }
    ];

    for (const contentData of sampleContent) {
      const content = {
        id: contentIdCounter.toString(),
        ...contentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      lessonContent.push(content);
      contentIdCounter++;
    }

    // Create assessments
    const sampleAssessments = [
      {
        lessonId: '6', // Variables Practice Quiz
        title: 'Variables and Data Types Quiz',
        description: 'Test your understanding of JavaScript variables and data types',
        type: 'quiz',
        timeLimit: 600, // 10 minutes
        passingScore: 70,
        maxAttempts: 3,
        isPublished: true
      }
    ];

    for (const assessmentData of sampleAssessments) {
      const assessment = {
        id: assessmentIdCounter.toString(),
        ...assessmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      assessments.push(assessment);
      assessmentIdCounter++;
    }

    // Create assessment questions
    const sampleQuestions = [
      {
        assessmentId: '1',
        type: 'multiple-choice',
        question: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
        options: ['var', 'let', 'const', 'function'],
        correctAnswer: 1, // 'let'
        explanation: 'The "let" keyword declares a block-scoped variable that can be reassigned.',
        points: 10,
        orderIndex: 1
      },
      {
        assessmentId: '1',
        type: 'multiple-choice',
        question: 'What data type is returned by typeof null in JavaScript?',
        options: ['null', 'undefined', 'object', 'string'],
        correctAnswer: 2, // 'object'
        explanation: 'This is a well-known quirk in JavaScript. typeof null returns "object".',
        points: 10,
        orderIndex: 2
      },
      {
        assessmentId: '1',
        type: 'true-false',
        question: 'JavaScript is a statically typed language.',
        correctAnswer: false,
        explanation: 'JavaScript is dynamically typed, meaning variable types are determined at runtime.',
        points: 5,
        orderIndex: 3
      },
      {
        assessmentId: '1',
        type: 'code',
        question: 'Write a variable declaration that creates a constant named "PI" with the value 3.14159.',
        correctAnswer: 'const PI = 3.14159;',
        explanation: 'Use const to declare constants that cannot be reassigned.',
        points: 15,
        orderIndex: 4
      }
    ];

    for (const questionData of sampleQuestions) {
      const question = {
        id: questionIdCounter.toString(),
        ...questionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      assessmentQuestions.push(question);
      questionIdCounter++;
    }

    console.log(`✅ Seeded comprehensive learning content:`);
    console.log(`   👥 ${users.length} users`);
    console.log(`   📚 ${courses.length} courses`);
    console.log(`   📖 ${modules.length} modules`);
    console.log(`   📝 ${lessons.length} lessons`);
    console.log(`   📄 ${lessonContent.length} content items`);
    console.log(`   🧪 ${assessments.length} assessments`);
    console.log(`   ❓ ${assessmentQuestions.length} questions`);

    console.log('👥 Sample Users:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    console.log('📚 Sample Courses:');
    courses.forEach(course => {
      console.log(`   - ${course.title} (${course.difficulty})`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// ============================================================================
// PHASE 3: ADVANCED FEATURES - DISCUSSION FORUMS, ANALYTICS, RECOMMENDATIONS
// ============================================================================

// Additional in-memory stores for Phase 3 features
const forumPosts = [];
const forumReplies = [];
const forumVotes = [];
const userAnalytics = [];
const userActivities = [];
const recommendations = [];
const learningPaths = [];
const instructorAnalytics = [];
const courseTags = [];
const courseMaterials = [];

// Additional ID counters
let forumPostIdCounter = 1;
let forumReplyIdCounter = 1;
let forumVoteIdCounter = 1;
let analyticsIdCounter = 1;
let activityIdCounter = 1;
let recommendationIdCounter = 1;
let learningPathIdCounter = 1;
let tagIdCounter = 1;
let materialIdCounter = 1;

// ============================================================================
// DISCUSSION FORUMS API
// ============================================================================

// Get all forum posts
app.get('/api/forum/posts', async (req, res) => {
  try {
    const { category, sortBy = 'recent', limit = 20 } = req.query;

    let filteredPosts = [...forumPosts];

    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }

    // Sort posts
    if (sortBy === 'recent') {
      filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'popular') {
      filteredPosts.sort((a, b) => b.votes - a.votes);
    }

    // Limit results
    filteredPosts = filteredPosts.slice(0, parseInt(limit));

    // Add user info and reply count
    const postsWithDetails = filteredPosts.map(post => {
      const author = users.find(u => u.id === post.authorId);
      const replyCount = forumReplies.filter(r => r.postId === post.id).length;
      const userVote = forumVotes.find(v => v.postId === post.id && v.userId === req.user?.id);

      return {
        ...post,
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          role: author.role
        } : null,
        replyCount,
        userVote: userVote?.type || null
      };
    });

    res.json({
      success: true,
      data: postsWithDetails,
      pagination: {
        total: forumPosts.length,
        limit: parseInt(limit),
        hasMore: forumPosts.length > parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get forum posts error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch forum posts',
      timestamp: new Date().toISOString()
    });
  }
});

// Create forum post
app.post('/api/forum/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, category = 'general', tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and content are required',
        timestamp: new Date().toISOString()
      });
    }

    const newPost = {
      id: forumPostIdCounter++,
      title,
      content,
      category,
      tags,
      authorId: req.user.id,
      votes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    forumPosts.push(newPost);

    // Add to user activity
    userActivities.push({
      id: activityIdCounter++,
      userId: req.user.id,
      type: 'forum_post_created',
      data: { postId: newPost.id, title: newPost.title },
      timestamp: new Date().toISOString()
    });

    // Create and send notification to interested users (excluding the author)
    const notification = createNotification(
      'forum_new_post',
      'New Forum Post',
      `${req.user.name} created a new post: "${title}"`,
      {
        postId: newPost.id,
        authorId: req.user.id,
        authorName: req.user.name,
        category: category,
        url: `/forum/posts/${newPost.id}`
      }
    );

    // Send notification to users interested in this category (for now, send to all users except author)
    const interestedUsers = users
      .filter(u => u.id !== req.user.id)
      .map(u => u.id);

    if (interestedUsers.length > 0) {
      sendNotificationToMultipleUsers(interestedUsers, notification);
      console.log(`📢 Sent new post notification to ${interestedUsers.length} users`);
    }

    res.status(201).json({
      success: true,
      data: newPost,
      message: 'Forum post created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Create forum post error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to create forum post',
      timestamp: new Date().toISOString()
    });
  }
});

// Get forum post by ID
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = forumPosts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Forum post not found',
        timestamp: new Date().toISOString()
      });
    }

    const author = users.find(u => u.id === post.authorId);
    const replies = forumReplies.filter(r => r.postId === postId);
    const userVote = forumVotes.find(v => v.postId === postId && v.userId === req.user?.id);

    const postWithDetails = {
      ...post,
      author: author ? {
        id: author.id,
        firstName: author.firstName,
        lastName: author.lastName,
        role: author.role
      } : null,
      replies: replies.map(reply => {
        const replyAuthor = users.find(u => u.id === reply.authorId);
        return {
          ...reply,
          author: replyAuthor ? {
            id: replyAuthor.id,
            firstName: replyAuthor.firstName,
            lastName: replyAuthor.lastName,
            role: replyAuthor.role
          } : null
        };
      }),
      userVote: userVote?.type || null
    };

    res.json({
      success: true,
      data: postWithDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get forum post error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch forum post',
      timestamp: new Date().toISOString()
    });
  }
});

// Get forum post replies
app.get('/api/forum/posts/:id/replies', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = forumPosts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Forum post not found',
        timestamp: new Date().toISOString()
      });
    }

    const replies = forumReplies.filter(r => r.postId === postId);
    const repliesWithAuthors = replies.map(reply => {
      const author = users.find(u => u.id === reply.authorId);
      return {
        ...reply,
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          role: author.role
        } : null
      };
    });

    res.json({
      success: true,
      data: repliesWithAuthors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get forum replies error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch forum replies',
      timestamp: new Date().toISOString()
    });
  }
});

// Create forum reply
app.post('/api/forum/posts/:id/replies', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Content is required',
        timestamp: new Date().toISOString()
      });
    }

    const post = forumPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Forum post not found',
        timestamp: new Date().toISOString()
      });
    }

    const newReply = {
      id: forumReplyIdCounter++,
      postId,
      content,
      authorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    forumReplies.push(newReply);

    // Add to user activity
    userActivities.push({
      id: activityIdCounter++,
      userId: req.user.id,
      type: 'forum_reply_created',
      data: { postId, replyId: newReply.id, postTitle: post.title },
      timestamp: new Date().toISOString()
    });

    // Create and send notification to post author (if not replying to own post)
    if (post.authorId !== req.user.id) {
      const notification = createNotification(
        'forum_new_reply',
        'New Reply to Your Post',
        `${req.user.name} replied to your post: "${post.title}"`,
        {
          postId: postId,
          replyId: newReply.id,
          authorId: req.user.id,
          authorName: req.user.name,
          postTitle: post.title,
          url: `/forum/posts/${postId}#reply-${newReply.id}`
        }
      );

      sendNotificationToUser(post.authorId, notification);
      console.log(`📢 Sent reply notification to post author (user ${post.authorId})`);
    }

    // Also notify other users who have replied to this post (excluding current user and post author)
    const otherRepliers = forumReplies
      .filter(r => r.postId === postId && r.authorId !== req.user.id && r.authorId !== post.authorId)
      .map(r => r.authorId);

    const uniqueRepliers = [...new Set(otherRepliers)];

    if (uniqueRepliers.length > 0) {
      const notification = createNotification(
        'forum_thread_activity',
        'New Activity in Thread',
        `${req.user.name} replied to a post you're following: "${post.title}"`,
        {
          postId: postId,
          replyId: newReply.id,
          authorId: req.user.id,
          authorName: req.user.name,
          postTitle: post.title,
          url: `/forum/posts/${postId}#reply-${newReply.id}`
        }
      );

      sendNotificationToMultipleUsers(uniqueRepliers, notification);
      console.log(`📢 Sent thread activity notification to ${uniqueRepliers.length} users`);
    }

    res.status(201).json({
      success: true,
      data: newReply,
      message: 'Reply created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Create forum reply error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to create reply',
      timestamp: new Date().toISOString()
    });
  }
});

// Vote on forum post
app.post('/api/forum/posts/:id/vote', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { type } = req.body; // 'up' or 'down'

    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Vote type must be "up" or "down"',
        timestamp: new Date().toISOString()
      });
    }

    const post = forumPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Forum post not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already voted
    const existingVoteIndex = forumVotes.findIndex(v => v.postId === postId && v.userId === req.user.id);

    if (existingVoteIndex !== -1) {
      const existingVote = forumVotes[existingVoteIndex];

      // Remove previous vote effect
      if (existingVote.type === 'up') {
        post.votes--;
      } else {
        post.votes++;
      }

      // If same vote type, remove vote; otherwise update
      if (existingVote.type === type) {
        forumVotes.splice(existingVoteIndex, 1);

        res.json({
          success: true,
          data: { postId, votes: post.votes, userVote: null },
          message: 'Vote removed',
          timestamp: new Date().toISOString()
        });
        return;
      } else {
        existingVote.type = type;
        existingVote.updatedAt = new Date().toISOString();
      }
    } else {
      // Create new vote
      forumVotes.push({
        id: forumVoteIdCounter++,
        postId,
        userId: req.user.id,
        type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Apply new vote effect
    if (type === 'up') {
      post.votes++;
    } else {
      post.votes--;
    }

    // Send notification for upvotes (only to post author, and only if not voting on own post)
    if (type === 'up' && post.authorId !== req.user.id) {
      const notification = createNotification(
        'forum_post_upvoted',
        'Your Post Received an Upvote!',
        `${req.user.name} upvoted your post: "${post.title}"`,
        {
          postId: postId,
          voterId: req.user.id,
          voterName: req.user.name,
          postTitle: post.title,
          currentVotes: post.votes,
          url: `/forum/posts/${postId}`
        }
      );

      sendNotificationToUser(post.authorId, notification);
      console.log(`👍 Sent upvote notification to post author (user ${post.authorId})`);
    }

    res.json({
      success: true,
      data: { postId, votes: post.votes, userVote: type },
      message: 'Vote recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Vote on forum post error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to record vote',
      timestamp: new Date().toISOString()
    });
  }
});

// Get forum statistics
app.get('/api/forum/stats', async (req, res) => {
  try {
    const totalPosts = forumPosts.length;
    const totalReplies = forumReplies.length;
    const totalVotes = forumVotes.length;
    const activeUsers = new Set([...forumPosts.map(p => p.authorId), ...forumReplies.map(r => r.authorId)]).size;

    const categories = {};
    forumPosts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalPosts,
        totalReplies,
        totalVotes,
        activeUsers,
        categories,
        recentActivity: userActivities
          .filter(a => a.type.startsWith('forum_'))
          .slice(-10)
          .reverse()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get forum stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch forum statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// REAL-TIME NOTIFICATIONS API
// ============================================================================

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let userNotifs = userNotifications.filter(un => un.userId === userId);

    if (unreadOnly === 'true') {
      userNotifs = userNotifs.filter(un => !un.read);
    }

    // Sort by creation date (newest first)
    userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedNotifs = userNotifs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Get full notification details
    const notificationsWithDetails = paginatedNotifs.map(un => {
      const notification = notifications.find(n => n.id === un.notificationId);
      return {
        ...notification,
        read: un.read,
        readAt: un.readAt,
        userNotificationId: un.id
      };
    }).filter(Boolean);

    res.json({
      success: true,
      data: {
        notifications: notificationsWithDetails,
        total: userNotifs.length,
        unreadCount: userNotifications.filter(un => un.userId === userId && !un.read).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// Mark notification as read
app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const userNotification = userNotifications.find(
      un => un.notificationId === notificationId && un.userId === userId
    );

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }

    userNotification.read = true;
    userNotification.readAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to mark notification as read',
      timestamp: new Date().toISOString()
    });
  }
});

// Mark all notifications as read
app.post('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const timestamp = new Date().toISOString();

    const userNotifs = userNotifications.filter(un => un.userId === userId && !un.read);

    userNotifs.forEach(un => {
      un.read = true;
      un.readAt = timestamp;
    });

    res.json({
      success: true,
      message: `Marked ${userNotifs.length} notifications as read`,
      data: { markedCount: userNotifs.length },
      timestamp
    });
  } catch (error) {
    console.error('❌ Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to mark all notifications as read',
      timestamp: new Date().toISOString()
    });
  }
});

// Get notification statistics
app.get('/api/notifications/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userNotifs = userNotifications.filter(un => un.userId === userId);
    const unreadCount = userNotifs.filter(un => !un.read).length;
    const totalCount = userNotifs.length;

    // Count by type
    const typeStats = {};
    userNotifs.forEach(un => {
      const notification = notifications.find(n => n.id === un.notificationId);
      if (notification) {
        typeStats[notification.type] = (typeStats[notification.type] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
        byType: typeStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch notification statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// CERTIFICATE GENERATION API
// ============================================================================

// Generate certificate for course completion
app.post('/api/courses/:courseId/certificate', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.id;

    // Check if user is enrolled and has completed the course
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'NOT_ENROLLED',
        message: 'User not enrolled in this course',
        timestamp: new Date().toISOString()
      });
    }

    if (!enrollment.completed) {
      return res.status(400).json({
        success: false,
        error: 'COURSE_NOT_COMPLETED',
        message: 'Course must be completed before generating certificate',
        timestamp: new Date().toISOString()
      });
    }

    // Check if certificate already exists
    const existingCertificate = certificates.find(c => c.userId === userId && c.courseId === courseId);
    if (existingCertificate) {
      return res.json({
        success: true,
        data: existingCertificate,
        message: 'Certificate already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Get course and user details
    const course = courses.find(c => c.id === courseId);
    const user = users.find(u => u.id === userId);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Course or user not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get instructor details
    const instructor = users.find(u => u.id === course.instructorId);

    // Calculate final grade (average of all assessment attempts)
    const userAttempts = userAssessmentAttempts.filter(a => a.userId === userId);
    const courseAssessments = assessments.filter(a => {
      const lesson = lessons.find(l => l.id === a.lessonId);
      if (!lesson) return false;
      const module = modules.find(m => m.id === lesson.moduleId);
      return module && module.courseId === courseId;
    });

    let finalGrade = null;
    if (courseAssessments.length > 0 && userAttempts.length > 0) {
      const relevantAttempts = userAttempts.filter(a =>
        courseAssessments.some(ca => ca.id === a.assessmentId)
      );

      if (relevantAttempts.length > 0) {
        const totalScore = relevantAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
        finalGrade = Math.round(totalScore / relevantAttempts.length);
      }
    }

    // Generate certificate data
    const certificateId = generateCertificateId();
    const completionDate = enrollment.completedAt || new Date().toISOString();

    const certificateData = {
      certificateId,
      userId,
      courseId,
      studentName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
      courseName: course.title,
      instructorName: instructor && instructor.firstName && instructor.lastName
        ? `${instructor.firstName} ${instructor.lastName}`
        : instructor ? instructor.username : 'AstraLearn Team',
      completionDate,
      grade: finalGrade,
      issuedAt: new Date().toISOString()
    };

    // Generate verification hash
    const verificationHash = generateVerificationHash(certificateData);
    certificateData.verificationHash = verificationHash;

    // Store certificate
    const certificate = {
      id: certificateIdCounter.toString(),
      ...certificateData,
      createdAt: new Date().toISOString()
    };

    certificates.push(certificate);
    certificateIdCounter++;

    // Store verification data
    certificateVerifications.set(certificateId, {
      certificateId,
      userId,
      courseId,
      studentName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
      courseName: course.title,
      completionDate,
      grade: finalGrade,
      verificationHash,
      issuedAt: certificate.createdAt,
      verified: true
    });

    res.status(201).json({
      success: true,
      data: certificate,
      message: 'Certificate generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Generate certificate error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate certificate',
      timestamp: new Date().toISOString()
    });
  }
});

// Download certificate PDF
app.get('/api/certificates/:certificateId/download', async (req, res) => {
  try {
    const certificateId = req.params.certificateId;

    // Find certificate
    const certificate = certificates.find(c => c.certificateId === certificateId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Certificate not found',
        timestamp: new Date().toISOString()
      });
    }

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(certificate);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Download certificate error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to download certificate',
      timestamp: new Date().toISOString()
    });
  }
});

// Verify certificate
app.get('/api/certificates/:certificateId/verify', async (req, res) => {
  try {
    const certificateId = req.params.certificateId;

    // Check verification data
    const verificationData = certificateVerifications.get(certificateId);
    if (!verificationData) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Certificate not found or invalid',
        verified: false,
        timestamp: new Date().toISOString()
      });
    }

    // Find the actual certificate
    const certificate = certificates.find(c => c.certificateId === certificateId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'CERTIFICATE_NOT_FOUND',
        message: 'Certificate record not found',
        verified: false,
        timestamp: new Date().toISOString()
      });
    }

    // Verify hash integrity
    const expectedHash = generateVerificationHash(certificate);
    const isValid = expectedHash === certificate.verificationHash;

    res.json({
      success: true,
      data: {
        certificateId,
        verified: isValid,
        studentName: verificationData.studentName,
        courseName: verificationData.courseName,
        completionDate: verificationData.completionDate,
        grade: verificationData.grade,
        issuedAt: verificationData.issuedAt,
        verificationHash: certificate.verificationHash
      },
      message: isValid ? 'Certificate is valid' : 'Certificate verification failed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Verify certificate error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to verify certificate',
      verified: false,
      timestamp: new Date().toISOString()
    });
  }
});

// Get user certificates
app.get('/api/users/:userId/certificates', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user can access these certificates (own certificates or admin)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Get user certificates
    const userCertificates = certificates.filter(c => c.userId === userId);

    // Enrich with course details
    const enrichedCertificates = userCertificates.map(cert => {
      const course = courses.find(c => c.id === cert.courseId);
      return {
        ...cert,
        courseTitle: course ? course.title : 'Unknown Course',
        courseDescription: course ? course.description : '',
        downloadUrl: `/api/certificates/${cert.certificateId}/download`,
        verifyUrl: `/api/certificates/${cert.certificateId}/verify`
      };
    });

    res.json({
      success: true,
      data: {
        certificates: enrichedCertificates,
        total: enrichedCertificates.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get user certificates error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch certificates',
      timestamp: new Date().toISOString()
    });
  }
});

// Get certificate statistics
app.get('/api/certificates/stats', authenticateToken, async (req, res) => {
  try {
    // Only allow admin or instructor access
    if (!['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    const totalCertificates = certificates.length;
    const certificatesThisMonth = certificates.filter(c => {
      const certDate = new Date(c.createdAt);
      const now = new Date();
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
    }).length;

    // Group by course
    const byCourse = {};
    certificates.forEach(cert => {
      const course = courses.find(c => c.id === cert.courseId);
      const courseName = course ? course.title : 'Unknown Course';
      byCourse[courseName] = (byCourse[courseName] || 0) + 1;
    });

    // Group by month
    const byMonth = {};
    certificates.forEach(cert => {
      const date = new Date(cert.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total: totalCertificates,
        thisMonth: certificatesThisMonth,
        byCourse,
        byMonth,
        averageGrade: certificates.filter(c => c.grade).length > 0
          ? Math.round(certificates.filter(c => c.grade).reduce((sum, c) => sum + c.grade, 0) / certificates.filter(c => c.grade).length)
          : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get certificate stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch certificate statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// MOCK PAYMENT SYSTEM API
// ============================================================================

// Create payment intent for course purchase
app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  try {
    const { courseId, paymentMethod = 'card', discountCode } = req.body;
    const userId = req.user.id;

    // Validate course
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already has access
    if (hasAccessToCourse(userId, courseId)) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_PURCHASED',
        message: 'You already have access to this course',
        timestamp: new Date().toISOString()
      });
    }

    // Calculate price with discount
    const originalPrice = course.price || 0;
    const finalPrice = calculateCoursePrice(course, discountCode);
    const discount = originalPrice - finalPrice;

    // Create payment intent
    const paymentIntent = {
      id: generatePaymentId(),
      userId,
      courseId,
      courseName: course.title,
      originalPrice,
      discountCode,
      discountAmount: discount,
      finalPrice,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };

    res.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        amount: finalPrice,
        currency: 'USD',
        courseName: course.title,
        originalPrice,
        discountAmount: discount,
        expiresAt: paymentIntent.expiresAt
      },
      message: 'Payment intent created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to create payment intent',
      timestamp: new Date().toISOString()
    });
  }
});

// Process payment
app.post('/api/payments/:paymentIntentId/confirm', authenticateToken, async (req, res) => {
  try {
    const paymentIntentId = req.params.paymentIntentId;
    const { paymentDetails } = req.body;
    const userId = req.user.id;

    // Find payment intent (in real system, this would be stored)
    // For mock system, we'll recreate the intent data
    const course = courses.find(c => c.id === req.body.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
        timestamp: new Date().toISOString()
      });
    }

    const finalPrice = calculateCoursePrice(course, req.body.discountCode);

    // Simulate payment processing
    console.log(`💳 Processing payment of $${finalPrice} for course: ${course.title}`);
    const paymentResult = await simulatePaymentProcessing(finalPrice, paymentDetails?.method || 'card');

    if (paymentResult.success) {
      // Create payment record
      const payment = {
        id: paymentIdCounter.toString(),
        paymentIntentId,
        userId,
        courseId: course.id,
        courseName: course.title,
        amount: finalPrice,
        currency: 'USD',
        paymentMethod: paymentDetails?.method || 'card',
        transactionId: paymentResult.transactionId,
        status: 'completed',
        processingFee: paymentResult.processingFee,
        netAmount: paymentResult.netAmount,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      payments.push(payment);
      paymentIdCounter++;

      // Grant course access
      const access = grantCourseAccess(userId, course.id);

      // Auto-enroll user in the course
      const enrollment = {
        id: enrollmentIdCounter.toString(),
        userId,
        courseId: course.id,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completed: false,
        isPremium: true
      };

      enrollments.push(enrollment);
      enrollmentIdCounter++;

      // Update course enrollment count
      course.enrollmentCount = (course.enrollmentCount || 0) + 1;

      // Send success notification
      const notification = createNotification(
        'course_purchased',
        'Course Purchased Successfully! 🎉',
        `You now have premium access to "${course.title}". Start learning now!`,
        {
          courseId: course.id,
          courseName: course.title,
          amount: finalPrice,
          transactionId: paymentResult.transactionId,
          url: `/courses/${course.id}`
        }
      );

      sendNotificationToUser(userId, notification);

      console.log(`✅ Payment successful: User ${userId} purchased course ${course.id} for $${finalPrice}`);

      res.json({
        success: true,
        data: {
          payment,
          access,
          enrollment
        },
        message: 'Payment processed successfully',
        timestamp: new Date().toISOString()
      });

    } else {
      // Payment failed
      console.log(`❌ Payment failed: ${paymentResult.message}`);

      res.status(400).json({
        success: false,
        error: paymentResult.error,
        message: paymentResult.message,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Process payment error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process payment',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user payment history
app.get('/api/payments/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Get user payments
    const userPayments = payments
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Calculate totals
    const totalSpent = payments
      .filter(p => p.userId === userId && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTransactions = payments.filter(p => p.userId === userId).length;

    res.json({
      success: true,
      data: {
        payments: userPayments,
        summary: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          totalTransactions,
          averageAmount: totalTransactions > 0 ? Math.round((totalSpent / totalTransactions) * 100) / 100 : 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch payment history',
      timestamp: new Date().toISOString()
    });
  }
});

// Get payment statistics (admin/instructor only)
app.get('/api/payments/stats', authenticateToken, async (req, res) => {
  try {
    // Only allow admin or instructor access
    if (!['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTransactions = payments.filter(p => p.status === 'completed').length;
    const failedTransactions = payments.filter(p => p.status === 'failed').length;

    // Revenue by course
    const revenueByCourse = {};
    payments.filter(p => p.status === 'completed').forEach(payment => {
      revenueByCourse[payment.courseName] = (revenueByCourse[payment.courseName] || 0) + payment.amount;
    });

    // Revenue by month
    const revenueByMonth = {};
    payments.filter(p => p.status === 'completed').forEach(payment => {
      const date = new Date(payment.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + payment.amount;
    });

    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTransactions,
        failedTransactions,
        successRate: totalTransactions > 0 ? Math.round((totalTransactions / (totalTransactions + failedTransactions)) * 100) : 0,
        averageTransactionValue: totalTransactions > 0 ? Math.round((totalRevenue / totalTransactions) * 100) / 100 : 0,
        revenueByCourse,
        revenueByMonth
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch payment statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Validate discount code
app.post('/api/payments/validate-discount', authenticateToken, async (req, res) => {
  try {
    const { discountCode, courseId } = req.body;

    if (!discountCode) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Discount code is required',
        timestamp: new Date().toISOString()
      });
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
        timestamp: new Date().toISOString()
      });
    }

    // Mock discount validation
    const discounts = {
      'STUDENT10': { rate: 0.10, description: '10% Student Discount' },
      'EARLY20': { rate: 0.20, description: '20% Early Bird Discount' },
      'BUNDLE30': { rate: 0.30, description: '30% Bundle Discount' },
      'NEWUSER15': { rate: 0.15, description: '15% New User Discount' }
    };

    const discount = discounts[discountCode.toUpperCase()];

    if (!discount) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DISCOUNT',
        message: 'Invalid discount code',
        timestamp: new Date().toISOString()
      });
    }

    const originalPrice = course.price || 0;
    const discountAmount = Math.round(originalPrice * discount.rate * 100) / 100;
    const finalPrice = Math.round((originalPrice - discountAmount) * 100) / 100;

    res.json({
      success: true,
      data: {
        discountCode: discountCode.toUpperCase(),
        description: discount.description,
        discountRate: discount.rate,
        originalPrice,
        discountAmount,
        finalPrice
      },
      message: 'Discount code is valid',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Validate discount error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to validate discount code',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// AI-POWERED FEATURES API
// ============================================================================

// Get AI-powered course recommendations
app.get('/api/ai/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5, includeReasoning = true } = req.query;

    // Get user data for personalization
    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const userProgressData = userProgress.filter(p => p.userId === userId);

    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(req.user, userProgressData, userEnrollments);

    // Enhance with AI reasoning
    const enhancedRecommendations = [];

    for (const rec of recommendations.slice(0, parseInt(limit))) {
      const course = courses.find(c => c.id === rec.courseId);
      if (course) {
        let aiReasoning = null;

        if (includeReasoning === 'true') {
          const prompt = `Explain why "${course.title}" would be a good next course for a student who has completed: ${userEnrollments.filter(e => e.completed).map(e => courses.find(c => c.id === e.courseId)?.title).join(', ')}`;

          const aiResponse = await mockOpenAICompletion(prompt, { maxTokens: 100 });
          aiReasoning = aiResponse.choices[0].message.content;
        }

        enhancedRecommendations.push({
          ...rec,
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            price: course.price,
            rating: course.rating
          },
          aiReasoning
        });
      }
    }

    // Store recommendation for analytics
    const recommendation = {
      id: aiRecommendationIdCounter.toString(),
      userId,
      recommendations: enhancedRecommendations,
      generatedAt: new Date().toISOString(),
      algorithm: 'personalized_ai_v1'
    };

    aiRecommendations.push(recommendation);
    aiRecommendationIdCounter++;

    res.json({
      success: true,
      data: {
        recommendations: enhancedRecommendations,
        generatedAt: recommendation.generatedAt,
        algorithm: recommendation.algorithm
      },
      message: 'AI recommendations generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate AI recommendations',
      timestamp: new Date().toISOString()
    });
  }
});

// AI-powered learning path generation
app.post('/api/ai/learning-path', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal, timeframe, currentLevel, preferences } = req.body;

    if (!goal) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Learning goal is required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user context
    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const completedCourses = userEnrollments.filter(e => e.completed);

    // Generate AI learning path
    const prompt = `Create a personalized learning path for a student with goal: "${goal}", timeframe: "${timeframe || 'flexible'}", current level: "${currentLevel || 'beginner'}". They have completed: ${completedCourses.map(e => courses.find(c => c.id === e.courseId)?.title).join(', ') || 'no courses yet'}.`;

    const aiResponse = await mockOpenAICompletion(prompt, { maxTokens: 200, type: 'learning_path' });
    const learningPath = aiResponse.choices[0].message.content;

    // Store the generated path
    const pathRecord = {
      id: aiContentIdCounter.toString(),
      userId,
      goal,
      timeframe,
      currentLevel,
      preferences,
      generatedPath: learningPath,
      createdAt: new Date().toISOString(),
      tokensUsed: aiResponse.usage.total_tokens
    };

    aiGeneratedContent.push(pathRecord);
    aiContentIdCounter++;

    res.json({
      success: true,
      data: {
        learningPath,
        goal,
        timeframe,
        estimatedDuration: timeframe || '8-12 weeks',
        difficulty: currentLevel || 'beginner',
        generatedAt: pathRecord.createdAt
      },
      message: 'AI learning path generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI learning path error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate learning path',
      timestamp: new Date().toISOString()
    });
  }
});

// AI-powered Q&A assistant
app.post('/api/ai/ask', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { question, context, courseId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Question is required',
        timestamp: new Date().toISOString()
      });
    }

    // Get course context if provided
    let courseContext = '';
    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        courseContext = `Context: This question is about the course "${course.title}" (${course.description}).`;
      }
    }

    // Generate AI response
    const prompt = `${courseContext} Student question: "${question}". ${context ? `Additional context: ${context}` : ''} Provide a helpful, educational response.`;

    const aiResponse = await mockOpenAICompletion(prompt, { maxTokens: 200 });
    const answer = aiResponse.choices[0].message.content;

    // Store conversation
    const conversation = {
      id: aiConversationIdCounter.toString(),
      userId,
      question,
      answer,
      context,
      courseId,
      createdAt: new Date().toISOString(),
      tokensUsed: aiResponse.usage.total_tokens
    };

    aiConversations.push(conversation);
    aiConversationIdCounter++;

    res.json({
      success: true,
      data: {
        question,
        answer,
        conversationId: conversation.id,
        relatedCourse: courseId ? courses.find(c => c.id === courseId)?.title : null,
        timestamp: conversation.createdAt
      },
      message: 'AI response generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Q&A error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate AI response',
      timestamp: new Date().toISOString()
    });
  }
});

// Generate AI practice questions
app.post('/api/ai/generate-quiz', authenticateToken, async (req, res) => {
  try {
    const { courseId, topic, difficulty = 'intermediate', questionCount = 5 } = req.body;

    if (!courseId && !topic) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Either courseId or topic is required',
        timestamp: new Date().toISOString()
      });
    }

    // Get course context
    let context = topic || 'general programming';
    if (courseId) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        context = `${course.title} - ${course.description}`;
      }
    }

    // Generate quiz questions
    const prompt = `Generate ${questionCount} ${difficulty} level quiz questions about: ${context}. Include multiple choice answers and explanations.`;

    const aiResponse = await mockOpenAICompletion(prompt, { maxTokens: 300, type: 'quiz' });
    const quizContent = aiResponse.choices[0].message.content;

    // Store generated content
    const generatedQuiz = {
      id: aiContentIdCounter.toString(),
      userId: req.user.id,
      courseId,
      topic: context,
      difficulty,
      questionCount,
      content: quizContent,
      createdAt: new Date().toISOString(),
      tokensUsed: aiResponse.usage.total_tokens
    };

    aiGeneratedContent.push(generatedQuiz);
    aiContentIdCounter++;

    res.json({
      success: true,
      data: {
        quiz: quizContent,
        topic: context,
        difficulty,
        questionCount,
        generatedAt: generatedQuiz.createdAt
      },
      message: 'AI quiz generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI quiz generation error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate AI quiz',
      timestamp: new Date().toISOString()
    });
  }
});

// Get AI usage statistics
app.get('/api/ai/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate user's AI usage
    const userRecommendations = aiRecommendations.filter(r => r.userId === userId);
    const userConversations = aiConversations.filter(c => c.userId === userId);
    const userGeneratedContent = aiGeneratedContent.filter(c => c.userId === userId);

    const totalTokensUsed = [
      ...userConversations,
      ...userGeneratedContent
    ].reduce((sum, item) => sum + (item.tokensUsed || 0), 0);

    // Get recent activity
    const recentActivity = [
      ...userConversations.map(c => ({ type: 'question', timestamp: c.createdAt, data: c.question })),
      ...userGeneratedContent.map(c => ({ type: 'generation', timestamp: c.createdAt, data: c.topic || c.goal })),
      ...userRecommendations.map(r => ({ type: 'recommendation', timestamp: r.generatedAt, data: `${r.recommendations.length} courses` }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      success: true,
      data: {
        totalRecommendations: userRecommendations.length,
        totalQuestions: userConversations.length,
        totalGeneratedContent: userGeneratedContent.length,
        totalTokensUsed,
        recentActivity,
        aiFeatures: {
          recommendations: 'Available',
          learningPaths: 'Available',
          qnaAssistant: 'Available',
          quizGeneration: 'Available'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch AI statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// LEARNING ANALYTICS API
// ============================================================================

// Get user learning analytics
app.get('/api/analytics/learning/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Calculate learning analytics
    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const userProgressData = userProgress.filter(p => p.userId === userId);
    const userAssessments = userAssessmentAttempts.filter(a => a.userId === userId);
    const userForumActivity = userActivities.filter(a => a.userId === userId && a.type.startsWith('forum_'));

    // Calculate completion rates
    const completedLessons = userProgressData.filter(p => p.status === 'completed').length;
    const totalLessons = lessons.length;
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Calculate average assessment score
    const assessmentScores = userAssessments.map(a => a.score);
    const averageScore = assessmentScores.length > 0 ?
      assessmentScores.reduce((sum, score) => sum + score, 0) / assessmentScores.length : 0;

    // Calculate learning streak
    const recentActivities = userActivities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const learningStreak = calculateLearningStreak(recentActivities);

    // Time spent learning (simulated)
    const timeSpentMinutes = userProgressData.length * 15; // Assume 15 minutes per lesson

    const analytics = {
      userId,
      overview: {
        coursesEnrolled: userEnrollments.length,
        lessonsCompleted: completedLessons,
        totalLessons,
        completionRate: Math.round(completionRate),
        averageScore: Math.round(averageScore),
        timeSpentMinutes,
        learningStreak,
        forumParticipation: userForumActivity.length
      },
      progress: {
        daily: generateDailyProgress(userProgressData),
        weekly: generateWeeklyProgress(userProgressData),
        monthly: generateMonthlyProgress(userProgressData)
      },
      achievements: generateAchievements(user, userProgressData, userAssessments, userForumActivity),
      recommendations: generateLearningRecommendations(user, userEnrollments, userProgressData)
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get learning analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch learning analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user learning statistics
app.get('/api/users/:id/learning-stats', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const userProgressData = userProgress.filter(p => p.userId === userId);
    const userAssessments = userAssessmentAttempts.filter(a => a.userId === userId);

    const stats = {
      coursesEnrolled: userEnrollments.length,
      coursesCompleted: userEnrollments.filter(e => {
        const courseModules = modules.filter(m => m.courseId === e.courseId);
        const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.moduleId));
        const completedLessons = userProgressData.filter(p =>
          courseLessons.some(l => l.id === p.lessonId) && p.status === 'completed'
        );
        return completedLessons.length === courseLessons.length;
      }).length,
      lessonsCompleted: userProgressData.filter(p => p.status === 'completed').length,
      assessmentsCompleted: userAssessments.length,
      averageScore: userAssessments.length > 0 ?
        Math.round(userAssessments.reduce((sum, a) => sum + a.score, 0) / userAssessments.length) : 0,
      totalTimeSpent: userProgressData.length * 15, // Simulated time in minutes
      lastActivity: userActivities
        .filter(a => a.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp || null
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get user learning stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch user learning statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user recent activity
app.get('/api/users/:id/recent-activity', async (req, res) => {
  try {
    const userId = req.params.id;
    const { limit = 10 } = req.query;

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const recentActivities = userActivities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit))
      .map(activity => {
        // Enrich activity with additional context
        let enrichedActivity = { ...activity };

        if (activity.type === 'lesson_completed' && activity.data.lessonId) {
          const lesson = lessons.find(l => l.id === activity.data.lessonId);
          if (lesson) {
            enrichedActivity.data.lessonTitle = lesson.title;
          }
        }

        if (activity.type === 'course_enrolled' && activity.data.courseId) {
          const course = courses.find(c => c.id === activity.data.courseId);
          if (course) {
            enrichedActivity.data.courseTitle = course.title;
          }
        }

        return enrichedActivity;
      });

    res.json({
      success: true,
      data: recentActivities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get user recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch user recent activity',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user enrolled courses
app.get('/api/users/:id/enrolled-courses', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const enrolledCourses = userEnrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (!course) return null;

      // Calculate progress for this course
      const courseModules = modules.filter(m => m.courseId === course.id);
      const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.moduleId));
      const completedLessons = userProgress.filter(p =>
        p.userId === userId &&
        courseLessons.some(l => l.id === p.lessonId) &&
        p.status === 'completed'
      );

      const progressPercentage = courseLessons.length > 0 ?
        Math.round((completedLessons.length / courseLessons.length) * 100) : 0;

      return {
        ...course,
        enrollmentDate: enrollment.enrolledAt,
        progress: progressPercentage,
        totalLessons: courseLessons.length,
        completedLessons: completedLessons.length,
        lastAccessed: userProgress
          .filter(p => p.userId === userId && courseLessons.some(l => l.id === p.lessonId))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.updatedAt || enrollment.enrolledAt
      };
    }).filter(Boolean);

    res.json({
      success: true,
      data: enrolledCourses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get user enrolled courses error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch enrolled courses',
      timestamp: new Date().toISOString()
    });
  }
});

// Get progress analytics
app.get('/api/analytics/progress/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { timeframe = '30d' } = req.query;

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const userProgressData = userProgress.filter(p => p.userId === userId);
    const userActivityData = userActivities.filter(a => a.userId === userId);

    // Generate progress data based on timeframe
    let progressData = [];
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayProgress = userProgressData.filter(p =>
        p.updatedAt.startsWith(dateStr) && p.status === 'completed'
      ).length;

      const dayActivities = userActivityData.filter(a =>
        a.timestamp.startsWith(dateStr)
      ).length;

      progressData.push({
        date: dateStr,
        lessonsCompleted: dayProgress,
        activities: dayActivities,
        timeSpent: dayProgress * 15 // Simulated time in minutes
      });
    }

    res.json({
      success: true,
      data: {
        timeframe,
        progressData,
        summary: {
          totalLessonsCompleted: userProgressData.filter(p => p.status === 'completed').length,
          totalActivities: userActivityData.length,
          averageDailyProgress: Math.round(
            progressData.reduce((sum, day) => sum + day.lessonsCompleted, 0) / days
          ),
          totalTimeSpent: userProgressData.length * 15
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get progress analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch progress analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions for analytics
function calculateLearningStreak(activities) {
  if (activities.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) { // Check last 30 days
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const hasActivity = activities.some(a => a.timestamp.startsWith(dateStr));

    if (hasActivity) {
      streak++;
    } else if (i > 0) { // Allow for today to not have activity yet
      break;
    }
  }

  return streak;
}

function generateDailyProgress(progressData) {
  const last7Days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayProgress = progressData.filter(p =>
      p.updatedAt.startsWith(dateStr) && p.status === 'completed'
    ).length;

    last7Days.push({
      date: dateStr,
      lessonsCompleted: dayProgress
    });
  }

  return last7Days;
}

function generateWeeklyProgress(progressData) {
  // Simplified weekly progress
  return [
    { week: 'This Week', lessonsCompleted: Math.floor(Math.random() * 10) + 5 },
    { week: 'Last Week', lessonsCompleted: Math.floor(Math.random() * 10) + 3 },
    { week: '2 Weeks Ago', lessonsCompleted: Math.floor(Math.random() * 10) + 2 },
    { week: '3 Weeks Ago', lessonsCompleted: Math.floor(Math.random() * 10) + 1 }
  ];
}

function generateMonthlyProgress(progressData) {
  // Simplified monthly progress
  return [
    { month: 'This Month', lessonsCompleted: progressData.filter(p => p.status === 'completed').length },
    { month: 'Last Month', lessonsCompleted: Math.floor(Math.random() * 20) + 10 },
    { month: '2 Months Ago', lessonsCompleted: Math.floor(Math.random() * 15) + 5 }
  ];
}

function generateAchievements(user, progressData, assessments, forumActivity) {
  const achievements = [];

  const completedLessons = progressData.filter(p => p.status === 'completed').length;
  const averageScore = assessments.length > 0 ?
    assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length : 0;

  if (completedLessons >= 10) {
    achievements.push({
      id: 'lessons_10',
      title: 'Dedicated Learner',
      description: 'Completed 10 lessons',
      icon: '📚',
      unlockedAt: new Date().toISOString()
    });
  }

  if (averageScore >= 90) {
    achievements.push({
      id: 'high_achiever',
      title: 'High Achiever',
      description: 'Maintained 90%+ average score',
      icon: '🏆',
      unlockedAt: new Date().toISOString()
    });
  }

  if (forumActivity.length >= 5) {
    achievements.push({
      id: 'community_contributor',
      title: 'Community Contributor',
      description: 'Active in forum discussions',
      icon: '💬',
      unlockedAt: new Date().toISOString()
    });
  }

  return achievements;
}

function generateLearningRecommendations(user, enrollments, progressData) {
  const recommendations = [];

  // Simple recommendation logic
  if (enrollments.length === 0) {
    recommendations.push({
      type: 'course',
      title: 'Start Your Learning Journey',
      description: 'Enroll in your first course to begin learning',
      courseId: courses[0]?.id,
      priority: 'high'
    });
  } else if (progressData.filter(p => p.status === 'completed').length < 5) {
    recommendations.push({
      type: 'engagement',
      title: 'Keep Learning',
      description: 'Complete more lessons to build momentum',
      priority: 'medium'
    });
  }

  return recommendations;
}

// ============================================================================
// AI RECOMMENDATIONS API
// ============================================================================

// Get AI recommendations for user
app.get('/api/recommendations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const userProgressData = userProgress.filter(p => p.userId === userId);

    // Generate AI recommendations based on user data
    const recommendations = generateAIRecommendations(user, userEnrollments, userProgressData);

    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get AI recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch AI recommendations',
      timestamp: new Date().toISOString()
    });
  }
});

// Get learning paths
app.get('/api/learning-paths', async (req, res) => {
  try {
    const { category, difficulty, userId } = req.query;

    // Generate learning paths
    const paths = generateLearningPaths(category, difficulty, userId);

    res.json({
      success: true,
      data: paths,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get learning paths error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch learning paths',
      timestamp: new Date().toISOString()
    });
  }
});

// Submit recommendation feedback
app.post('/api/recommendations/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const recommendationId = parseInt(req.params.id);
    const { rating, feedback, helpful } = req.body;

    // Store feedback (in real app, this would update ML models)
    const feedbackEntry = {
      id: Date.now(),
      recommendationId,
      userId: req.user.id,
      rating,
      feedback,
      helpful,
      timestamp: new Date().toISOString()
    };

    // Add to user activity
    userActivities.push({
      id: activityIdCounter++,
      userId: req.user.id,
      type: 'recommendation_feedback',
      data: { recommendationId, rating, helpful },
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: feedbackEntry,
      message: 'Feedback recorded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Submit recommendation feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to record feedback',
      timestamp: new Date().toISOString()
    });
  }
});

// Bookmark recommendation
app.post('/api/recommendations/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const recommendationId = parseInt(req.params.id);

    // Add to user activity
    userActivities.push({
      id: activityIdCounter++,
      userId: req.user.id,
      type: 'recommendation_bookmarked',
      data: { recommendationId },
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Recommendation bookmarked',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Bookmark recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to bookmark recommendation',
      timestamp: new Date().toISOString()
    });
  }
});

// Dismiss recommendation
app.post('/api/recommendations/:id/dismiss', authenticateToken, async (req, res) => {
  try {
    const recommendationId = parseInt(req.params.id);

    // Add to user activity
    userActivities.push({
      id: activityIdCounter++,
      userId: req.user.id,
      type: 'recommendation_dismissed',
      data: { recommendationId },
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Recommendation dismissed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Dismiss recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to dismiss recommendation',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions for AI recommendations
function generateAIRecommendations(user, enrollments, progressData) {
  const recommendations = [];

  // Course recommendations based on user progress and interests
  if (enrollments.length === 0) {
    recommendations.push({
      id: 1,
      type: 'course',
      title: 'Start with JavaScript Fundamentals',
      description: 'Perfect for beginners to programming',
      courseId: courses.find(c => c.title.includes('JavaScript'))?.id,
      reason: 'Popular choice for new learners',
      confidence: 0.9,
      priority: 'high'
    });
  } else {
    // Recommend next courses based on completed ones
    const completedCourses = enrollments.filter(e => {
      const courseModules = modules.filter(m => m.courseId === e.courseId);
      const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.moduleId));
      const completedLessons = progressData.filter(p =>
        courseLessons.some(l => l.id === p.lessonId) && p.status === 'completed'
      );
      return completedLessons.length === courseLessons.length;
    });

    if (completedCourses.length > 0) {
      recommendations.push({
        id: 2,
        type: 'course',
        title: 'Advanced React Development',
        description: 'Take your skills to the next level',
        courseId: courses.find(c => c.title.includes('React'))?.id,
        reason: 'Based on your JavaScript progress',
        confidence: 0.8,
        priority: 'medium'
      });
    }
  }

  // Study habit recommendations
  const recentActivity = progressData.filter(p => {
    const activityDate = new Date(p.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activityDate > weekAgo;
  });

  if (recentActivity.length < 3) {
    recommendations.push({
      id: 3,
      type: 'habit',
      title: 'Set a Daily Learning Goal',
      description: 'Aim for 15 minutes of learning each day',
      reason: 'Consistency improves retention',
      confidence: 0.7,
      priority: 'medium'
    });
  }

  return recommendations;
}

function generateLearningPaths(category, difficulty, userId) {
  const paths = [
    {
      id: 1,
      title: 'Full-Stack Web Development',
      description: 'Complete path from beginner to advanced web developer',
      category: 'programming',
      difficulty: 'beginner',
      estimatedHours: 120,
      courses: [
        { courseId: 1, order: 1, title: 'Introduction to JavaScript' },
        { courseId: 2, order: 2, title: 'Advanced React Development' },
        { courseId: 3, order: 3, title: 'Backend Development with Node.js' }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Databases'],
      popularity: 95
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      description: 'Learn data analysis and machine learning basics',
      category: 'data-science',
      difficulty: 'intermediate',
      estimatedHours: 80,
      courses: [
        { courseId: 3, order: 1, title: 'Data Science with Python' },
        { courseId: 4, order: 2, title: 'Statistics for Data Science' },
        { courseId: 5, order: 3, title: 'Machine Learning Basics' }
      ],
      skills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
      popularity: 87
    }
  ];

  // Filter by category and difficulty if provided
  let filteredPaths = paths;
  if (category) {
    filteredPaths = filteredPaths.filter(p => p.category === category);
  }
  if (difficulty) {
    filteredPaths = filteredPaths.filter(p => p.difficulty === difficulty);
  }

  return filteredPaths;
}

// ============================================================================
// INSTRUCTOR FEATURES API
// ============================================================================

// Duplicate instructor courses route removed (moved to top)

// Get instructor analytics
app.get('/api/analytics/instructor', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Instructor role required.',
        timestamp: new Date().toISOString()
      });
    }

    const instructorCourses = courses.filter(c => c.instructorId === req.user.id);
    const allEnrollments = enrollments.filter(e =>
      instructorCourses.some(c => c.id === e.courseId)
    );

    // Calculate analytics
    const totalStudents = new Set(allEnrollments.map(e => e.userId)).size;
    const totalEnrollments = allEnrollments.length;

    // Calculate completion rates
    const completionRates = instructorCourses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
      const courseModules = modules.filter(m => m.courseId === course.id);
      const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.moduleId));

      const completedStudents = courseEnrollments.filter(enrollment => {
        const userProgressData = userProgress.filter(p =>
          p.userId === enrollment.userId &&
          courseLessons.some(l => l.id === p.lessonId) &&
          p.status === 'completed'
        );
        return userProgressData.length === courseLessons.length;
      }).length;

      return {
        courseId: course.id,
        courseTitle: course.title,
        enrollments: courseEnrollments.length,
        completions: completedStudents,
        completionRate: courseEnrollments.length > 0 ?
          Math.round((completedStudents / courseEnrollments.length) * 100) : 0
      };
    });

    const averageCompletionRate = completionRates.length > 0 ?
      Math.round(completionRates.reduce((sum, rate) => sum + rate.completionRate, 0) / completionRates.length) : 0;

    // Recent activity
    const recentEnrollments = allEnrollments
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, 10)
      .map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        const student = users.find(u => u.id === enrollment.userId);
        return {
          ...enrollment,
          courseTitle: course?.title,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown'
        };
      });

    const analytics = {
      overview: {
        totalCourses: instructorCourses.length,
        totalStudents,
        totalEnrollments,
        averageCompletionRate
      },
      coursePerformance: completionRates,
      recentActivity: recentEnrollments,
      monthlyStats: generateInstructorMonthlyStats(allEnrollments)
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get instructor analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch instructor analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get course analytics
app.get('/api/courses/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Course not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user is instructor of this course
    if (req.user.role !== 'instructor' || course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. You must be the instructor of this course.',
        timestamp: new Date().toISOString()
      });
    }

    const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
    const courseModules = modules.filter(m => m.courseId === courseId);
    const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.moduleId));

    // Student progress analysis
    const studentProgress = courseEnrollments.map(enrollment => {
      const student = users.find(u => u.id === enrollment.userId);
      const studentProgressData = userProgress.filter(p =>
        p.userId === enrollment.userId &&
        courseLessons.some(l => l.id === p.lessonId)
      );

      const completedLessons = studentProgressData.filter(p => p.status === 'completed').length;
      const progressPercentage = courseLessons.length > 0 ?
        Math.round((completedLessons / courseLessons.length) * 100) : 0;

      return {
        studentId: enrollment.userId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        enrolledAt: enrollment.enrolledAt,
        progress: progressPercentage,
        completedLessons,
        totalLessons: courseLessons.length,
        lastActivity: studentProgressData
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.updatedAt || enrollment.enrolledAt
      };
    });

    // Lesson completion rates
    const lessonAnalytics = courseLessons.map(lesson => {
      const completions = userProgress.filter(p =>
        p.lessonId === lesson.id && p.status === 'completed'
      ).length;

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        completions,
        completionRate: courseEnrollments.length > 0 ?
          Math.round((completions / courseEnrollments.length) * 100) : 0
      };
    });

    const analytics = {
      course: {
        id: course.id,
        title: course.title,
        totalEnrollments: courseEnrollments.length,
        totalModules: courseModules.length,
        totalLessons: courseLessons.length
      },
      studentProgress,
      lessonAnalytics,
      summary: {
        averageProgress: studentProgress.length > 0 ?
          Math.round(studentProgress.reduce((sum, s) => sum + s.progress, 0) / studentProgress.length) : 0,
        completedStudents: studentProgress.filter(s => s.progress === 100).length,
        activeStudents: studentProgress.filter(s => {
          const lastActivity = new Date(s.lastActivity);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastActivity > weekAgo;
        }).length
      }
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get course analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch course analytics',
      timestamp: new Date().toISOString()
    });
  }
});

function generateInstructorMonthlyStats(enrollments) {
  const monthlyStats = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const monthEnrollments = enrollments.filter(e => {
      const enrollDate = new Date(e.enrolledAt);
      return enrollDate.getMonth() === month.getMonth() &&
             enrollDate.getFullYear() === month.getFullYear();
    }).length;

    monthlyStats.push({
      month: monthStr,
      enrollments: monthEnrollments
    });
  }

  return monthlyStats;
}

// ============================================================================
// ADVANCED SEARCH API
// ============================================================================

// Duplicate search route removed (moved to top)

// Duplicate tags route removed (moved to top)

// ============================================================================
// FILE MANAGEMENT API
// ============================================================================

// Upload course material
app.post('/api/courses/:id/materials', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, description, type = 'document', url, size } = req.body;

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Course not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user is instructor of this course
    if (req.user.role !== 'instructor' || course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. You must be the instructor of this course.',
        timestamp: new Date().toISOString()
      });
    }

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and URL are required',
        timestamp: new Date().toISOString()
      });
    }

    const newMaterial = {
      id: materialIdCounter++,
      courseId,
      title,
      description,
      type,
      url,
      size: size || 0,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      downloads: 0
    };

    courseMaterials.push(newMaterial);

    res.status(201).json({
      success: true,
      data: newMaterial,
      message: 'Material uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Upload material error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to upload material',
      timestamp: new Date().toISOString()
    });
  }
});

// Download material
app.get('/api/materials/:id/download', async (req, res) => {
  try {
    const materialId = parseInt(req.params.id);
    const material = courseMaterials.find(m => m.id === materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Material not found',
        timestamp: new Date().toISOString()
      });
    }

    // Increment download count
    material.downloads++;

    // In a real application, this would serve the actual file
    res.json({
      success: true,
      data: {
        downloadUrl: material.url,
        filename: material.title,
        size: material.size,
        type: material.type
      },
      message: 'Download initiated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Download material error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to download material',
      timestamp: new Date().toISOString()
    });
  }
});

// Get material metadata
app.get('/api/materials/:id', async (req, res) => {
  try {
    const materialId = parseInt(req.params.id);
    const material = courseMaterials.find(m => m.id === materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Material not found',
        timestamp: new Date().toISOString()
      });
    }

    const uploader = users.find(u => u.id === material.uploadedBy);
    const course = courses.find(c => c.id === material.courseId);

    const materialWithDetails = {
      ...material,
      uploader: uploader ? {
        id: uploader.id,
        firstName: uploader.firstName,
        lastName: uploader.lastName
      } : null,
      course: course ? {
        id: course.id,
        title: course.title
      } : null
    };

    res.json({
      success: true,
      data: materialWithDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get material metadata error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch material metadata',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

// API Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    services: {
      database: 'connected', // In-memory data is always available
      api: 'operational'
    }
  };

  res.status(200).json({
    success: true,
    data: health,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLING - MUST BE LAST
// ============================================================================

// 404 handler - must be after all route definitions
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, async () => {
  console.log('🚀 AstraLearn v2 Enhanced Test Server Started');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🔔 WebSocket: ws://localhost:${PORT}`);
  console.log('');

  // Seed database
  await seedDatabase();
  console.log('');

  console.log('🔐 Authentication Endpoints:');
  console.log(`   📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   👤 Profile: GET http://localhost:${PORT}/api/auth/me`);
  console.log('');
  console.log('📚 Course Endpoints:');
  console.log(`   📋 List Courses: GET http://localhost:${PORT}/api/courses`);
  console.log(`   📖 Get Course: GET http://localhost:${PORT}/api/courses/:id`);
  console.log(`   ➕ Create Course: POST http://localhost:${PORT}/api/courses`);
  console.log(`   🎓 Enroll: POST http://localhost:${PORT}/api/courses/:id/enroll`);
  console.log('');
  console.log('📖 Learning Content Endpoints:');
  console.log(`   📚 Course Modules: GET http://localhost:${PORT}/api/courses/:courseId/modules`);
  console.log(`   📝 Module Lessons: GET http://localhost:${PORT}/api/modules/:moduleId/lessons`);
  console.log(`   📄 Lesson Content: GET http://localhost:${PORT}/api/lessons/:lessonId/content`);
  console.log(`   📖 Lesson Details: GET http://localhost:${PORT}/api/lessons/:lessonId`);
  console.log('');
  console.log('📊 Progress Tracking Endpoints:');
  console.log(`   📈 Course Progress: GET http://localhost:${PORT}/api/courses/:courseId/progress`);
  console.log(`   ✅ Update Progress: POST http://localhost:${PORT}/api/lessons/:lessonId/progress`);
  console.log('');
  console.log('🧪 Assessment Endpoints:');
  console.log(`   📝 Lesson Assessment: GET http://localhost:${PORT}/api/lessons/:lessonId/assessment`);
  console.log(`   📤 Submit Assessment: POST http://localhost:${PORT}/api/assessments/:assessmentId/submit`);
  console.log(`   📊 Assessment Attempts: GET http://localhost:${PORT}/api/assessments/:assessmentId/attempts`);
  console.log('');
  console.log('✅ Ready to accept requests!');
});
