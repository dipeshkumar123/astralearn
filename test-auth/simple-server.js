// Simple AstraLearn v2 Authentication Test Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5001;

// Configuration
const JWT_SECRET = 'astralearn-super-secret-jwt-key-for-development-only-change-in-production-32chars';

// In-memory user store with enhanced user data
const users = [];
let userIdCounter = 1;

// Enhanced user model with additional fields
function createUser(userData) {
  return {
    id: userIdCounter.toString(),
    email: userData.email.toLowerCase(),
    username: userData.username.toLowerCase(),
    password: userData.password, // Will be hashed
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role || 'student',

    // Profile information
    avatar: userData.avatar || null,
    bio: userData.bio || '',
    dateOfBirth: userData.dateOfBirth || null,
    location: userData.location || '',
    timezone: userData.timezone || 'UTC',

    // Learning preferences
    learningStyle: userData.learningStyle || null,
    preferredLanguage: userData.preferredLanguage || 'en',
    difficultyLevel: userData.difficultyLevel || 'beginner',
    interests: userData.interests || [],

    // Account settings
    emailVerified: false,
    isActive: true,
    lastLoginAt: null,

    // Statistics
    stats: {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      totalPoints: 0,
      level: 1,
      studyGroupsJoined: 0,
      lessonsCompleted: 0,
      timeSpentLearning: 0, // in minutes
      streakDays: 0,
      achievements: [],
    },

    // Privacy settings
    privacy: {
      profileVisibility: 'public', // public, friends, private
      showEmail: false,
      showProgress: true,
      allowMessages: true,
    },

    // Notification preferences
    notifications: {
      email: true,
      push: true,
      courseUpdates: true,
      socialActivity: true,
      achievements: true,
      reminders: true,
    },

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AstraLearn v2 Simple Auth Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    usersCount: users.length,
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'AstraLearn v2 User Management API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      // System
      health: 'GET /health',

      // Authentication
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        users: 'GET /api/auth/users',
      },

      // User Management
      users: {
        getUser: 'GET /api/users/:id',
        updateProfile: 'PUT /api/users/profile',
        updatePrivacy: 'PUT /api/users/privacy',
        updateNotifications: 'PUT /api/users/notifications',
        getStats: 'GET /api/users/stats',
        updateStats: 'PUT /api/users/stats',
        searchUsers: 'GET /api/users/search?q=term&role=student&limit=10',
        deactivateAccount: 'DELETE /api/users/account',
      },
    },
    features: [
      'User Authentication & Authorization',
      'Profile Management',
      'Privacy Controls',
      'Notification Preferences',
      'User Statistics & Progress Tracking',
      'User Search & Discovery',
      'Account Management',
    ],
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, role = 'student' } = req.body;

    // Basic validation
    if (!email || !username || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'All fields are required',
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

    // Create user with enhanced model
    const userData = {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      learningStyle: req.body.learningStyle,
      interests: req.body.interests || [],
      preferredLanguage: req.body.preferredLanguage,
      timezone: req.body.timezone,
    };

    const newUser = createUser(userData);
    users.push(newUser);
    userIdCounter++;

    // Generate token
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
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
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
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login time
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

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

// Get all users endpoint (for testing)
app.get('/api/auth/users', (req, res) => {
  res.json({
    success: true,
    data: users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    })),
    count: users.length,
  });
});

// ===== USER MANAGEMENT API ENDPOINTS =====

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id && u.isActive);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Return public profile (exclude sensitive data)
    const publicProfile = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      location: user.privacy.profileVisibility !== 'private' ? user.location : null,
      stats: user.privacy.showProgress ? user.stats : null,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Update user profile (authenticated)
app.put('/api/users/profile', async (req, res) => {
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

    // Update allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'bio', 'avatar', 'location', 'timezone',
      'learningStyle', 'preferredLanguage', 'difficultyLevel', 'interests'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    user.updatedAt = new Date();

    console.log(`✅ Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        timezone: user.timezone,
        learningStyle: user.learningStyle,
        preferredLanguage: user.preferredLanguage,
        difficultyLevel: user.difficultyLevel,
        interests: user.interests,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Update user privacy settings (authenticated)
app.put('/api/users/privacy', async (req, res) => {
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

    // Update privacy settings
    const allowedPrivacyFields = ['profileVisibility', 'showEmail', 'showProgress', 'allowMessages'];

    allowedPrivacyFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user.privacy[field] = req.body[field];
      }
    });

    user.updatedAt = new Date();

    console.log(`✅ Privacy settings updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: user.privacy,
    });
  } catch (error) {
    console.error('❌ Update privacy error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Update notification preferences (authenticated)
app.put('/api/users/notifications', async (req, res) => {
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

    // Update notification preferences
    const allowedNotificationFields = [
      'email', 'push', 'courseUpdates', 'socialActivity', 'achievements', 'reminders'
    ];

    allowedNotificationFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user.notifications[field] = req.body[field];
      }
    });

    user.updatedAt = new Date();

    console.log(`✅ Notification preferences updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.notifications,
    });
  } catch (error) {
    console.error('❌ Update notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Get user statistics (authenticated)
app.get('/api/users/stats', async (req, res) => {
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

    res.json({
      success: true,
      data: {
        ...user.stats,
        profileCompleteness: calculateProfileCompleteness(user),
        memberSince: user.createdAt,
        lastActive: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Update user statistics (for testing/simulation)
app.put('/api/users/stats', async (req, res) => {
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

    // Update statistics (for testing purposes)
    const allowedStatFields = [
      'coursesEnrolled', 'coursesCompleted', 'totalPoints', 'level',
      'studyGroupsJoined', 'lessonsCompleted', 'timeSpentLearning', 'streakDays'
    ];

    allowedStatFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user.stats[field] = req.body[field];
      }
    });

    // Add achievements if provided
    if (req.body.achievements && Array.isArray(req.body.achievements)) {
      user.stats.achievements = [...new Set([...user.stats.achievements, ...req.body.achievements])];
    }

    user.updatedAt = new Date();

    console.log(`✅ Statistics updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Statistics updated successfully',
      data: user.stats,
    });
  } catch (error) {
    console.error('❌ Update stats error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Search users
app.get('/api/users/search', async (req, res) => {
  try {
    const { q, role, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Search query must be at least 2 characters long',
      });
    }

    const searchTerm = q.toLowerCase();
    let filteredUsers = users.filter(user => {
      if (!user.isActive) return false;
      if (user.privacy.profileVisibility === 'private') return false;

      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.bio.toLowerCase().includes(searchTerm);

      const matchesRole = !role || user.role === role;

      return matchesSearch && matchesRole;
    });

    // Limit results
    filteredUsers = filteredUsers.slice(0, parseInt(limit));

    const results = filteredUsers.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      stats: user.privacy.showProgress ? {
        level: user.stats.level,
        totalPoints: user.stats.totalPoints,
        coursesCompleted: user.stats.coursesCompleted,
      } : null,
    }));

    res.json({
      success: true,
      data: results,
      count: results.length,
      query: q,
    });
  } catch (error) {
    console.error('❌ Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Deactivate user account (authenticated)
app.delete('/api/users/account', async (req, res) => {
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

    // Soft delete - deactivate account
    user.isActive = false;
    user.updatedAt = new Date();

    console.log(`✅ Account deactivated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    console.error('❌ Deactivate account error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user) {
  const fields = [
    user.firstName, user.lastName, user.bio, user.avatar,
    user.location, user.learningStyle, user.interests.length > 0
  ];

  const completedFields = fields.filter(field => field && field !== '').length;
  return Math.round((completedFields / fields.length) * 100);
}

// Start server
app.listen(PORT, () => {
  console.log('🚀 AstraLearn v2 User Management Server Started');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('🔐 Authentication Endpoints:');
  console.log(`   📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   👤 Profile: GET http://localhost:${PORT}/api/auth/me`);
  console.log(`   👥 Users: GET http://localhost:${PORT}/api/auth/users`);
  console.log('');
  console.log('👤 User Management Endpoints:');
  console.log(`   🔍 Get User: GET http://localhost:${PORT}/api/users/:id`);
  console.log(`   ✏️  Update Profile: PUT http://localhost:${PORT}/api/users/profile`);
  console.log(`   🔒 Privacy Settings: PUT http://localhost:${PORT}/api/users/privacy`);
  console.log(`   🔔 Notifications: PUT http://localhost:${PORT}/api/users/notifications`);
  console.log(`   📊 Statistics: GET/PUT http://localhost:${PORT}/api/users/stats`);
  console.log(`   🔍 Search Users: GET http://localhost:${PORT}/api/users/search`);
  console.log(`   🗑️  Deactivate: DELETE http://localhost:${PORT}/api/users/account`);
  console.log('');
  console.log('✅ Ready to accept requests!');
});
