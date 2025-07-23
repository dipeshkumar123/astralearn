// AstraLearn v2 User Management Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5001;
const JWT_SECRET = 'astralearn-super-secret-jwt-key-for-development-only-change-in-production-32chars';

// In-memory data stores
const users = [];
const courses = [];
const modules = [];
const lessons = [];
const enrollments = [];
const progress = [];

let userIdCounter = 1;
let courseIdCounter = 1;
let moduleIdCounter = 1;
let lessonIdCounter = 1;
let enrollmentIdCounter = 1;
let progressIdCounter = 1;

// Course Management Data Models

// Course model
function createCourse(courseData) {
  return {
    id: courseIdCounter.toString(),
    title: courseData.title,
    description: courseData.description,
    shortDescription: courseData.shortDescription || '',
    thumbnail: courseData.thumbnail || null,
    category: courseData.category || 'general',
    tags: courseData.tags || [],
    difficulty: courseData.difficulty || 'beginner', // beginner, intermediate, advanced
    duration: courseData.duration || 0, // estimated hours
    language: courseData.language || 'en',

    // Instructor information
    instructorId: courseData.instructorId,
    instructorName: courseData.instructorName,

    // Course settings
    isPublished: courseData.isPublished || false,
    isActive: courseData.isActive !== false,
    isFree: courseData.isFree !== false,
    price: courseData.price || 0,

    // Course structure
    moduleCount: 0,
    lessonCount: 0,
    totalDuration: 0,

    // Enrollment and ratings
    enrollmentCount: 0,
    completionCount: 0,
    averageRating: 0,
    ratingCount: 0,

    // Prerequisites and requirements
    prerequisites: courseData.prerequisites || [],
    requirements: courseData.requirements || [],
    learningObjectives: courseData.learningObjectives || [],

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: courseData.isPublished ? new Date() : null,
  };
}

// Module model
function createModule(moduleData) {
  return {
    id: moduleIdCounter.toString(),
    courseId: moduleData.courseId,
    title: moduleData.title,
    description: moduleData.description || '',
    order: moduleData.order || 1,

    // Module content
    lessonCount: 0,
    duration: 0, // calculated from lessons

    // Module settings
    isActive: moduleData.isActive !== false,
    isPreview: moduleData.isPreview || false, // can be accessed without enrollment

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Lesson model
function createLesson(lessonData) {
  return {
    id: lessonIdCounter.toString(),
    courseId: lessonData.courseId,
    moduleId: lessonData.moduleId,
    title: lessonData.title,
    description: lessonData.description || '',
    order: lessonData.order || 1,

    // Lesson content
    type: lessonData.type || 'video', // video, text, quiz, assignment, interactive
    content: lessonData.content || '',
    videoUrl: lessonData.videoUrl || null,
    duration: lessonData.duration || 0, // in minutes

    // Lesson settings
    isActive: lessonData.isActive !== false,
    isPreview: lessonData.isPreview || false,
    isMandatory: lessonData.isMandatory !== false,

    // Resources and attachments
    resources: lessonData.resources || [], // PDFs, links, etc.
    attachments: lessonData.attachments || [],

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Enrollment model
function createEnrollment(enrollmentData) {
  return {
    id: enrollmentIdCounter.toString(),
    userId: enrollmentData.userId,
    courseId: enrollmentData.courseId,

    // Enrollment status
    status: 'active', // active, completed, dropped, suspended
    progress: 0, // percentage 0-100

    // Progress tracking
    lessonsCompleted: 0,
    totalLessons: 0,
    timeSpent: 0, // in minutes
    lastAccessedAt: new Date(),

    // Completion tracking
    startedAt: new Date(),
    completedAt: null,
    certificateIssued: false,

    // Performance
    averageScore: 0,
    quizzesTaken: 0,
    assignmentsSubmitted: 0,

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Lesson Progress model
function createLessonProgress(progressData) {
  return {
    id: progressIdCounter.toString(),
    userId: progressData.userId,
    courseId: progressData.courseId,
    moduleId: progressData.moduleId,
    lessonId: progressData.lessonId,

    // Progress status
    status: progressData.status || 'not_started', // not_started, in_progress, completed
    progress: progressData.progress || 0, // percentage 0-100
    timeSpent: progressData.timeSpent || 0, // in minutes

    // Completion tracking
    startedAt: progressData.status !== 'not_started' ? new Date() : null,
    completedAt: progressData.status === 'completed' ? new Date() : null,
    lastAccessedAt: new Date(),

    // Performance (for quizzes/assignments)
    score: progressData.score || null,
    attempts: progressData.attempts || 0,

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Enhanced user model
function createUser(userData) {
  return {
    id: userIdCounter.toString(),
    email: userData.email.toLowerCase(),
    username: userData.username.toLowerCase(),
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role || 'student',
    avatar: userData.avatar || null,
    bio: userData.bio || '',
    location: userData.location || '',
    timezone: userData.timezone || 'UTC',
    learningStyle: userData.learningStyle || null,
    preferredLanguage: userData.preferredLanguage || 'en',
    interests: userData.interests || [],
    emailVerified: false,
    isActive: true,
    lastLoginAt: null,
    stats: {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      totalPoints: 0,
      level: 1,
      studyGroupsJoined: 0,
      lessonsCompleted: 0,
      timeSpentLearning: 0,
      streakDays: 0,
      achievements: [],
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showProgress: true,
      allowMessages: true,
    },
    notifications: {
      email: true,
      push: true,
      courseUpdates: true,
      socialActivity: true,
      achievements: true,
      reminders: true,
    },
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
    message: 'AstraLearn v2 User Management Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    usersCount: users.length,
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'AstraLearn v2 Course Management API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
      },
      users: {
        getUser: 'GET /api/users/:id',
        updateProfile: 'PUT /api/users/profile',
        updatePrivacy: 'PUT /api/users/privacy',
        updateNotifications: 'PUT /api/users/notifications',
        getStats: 'GET /api/users/stats',
        updateStats: 'PUT /api/users/stats',
        searchUsers: 'GET /api/users/search',
      },
      courses: {
        getAllCourses: 'GET /api/courses',
        getCourse: 'GET /api/courses/:id',
        createCourse: 'POST /api/courses',
        updateCourse: 'PUT /api/courses/:id',
        deleteCourse: 'DELETE /api/courses/:id',
        searchCourses: 'GET /api/courses/search',
        getCourseModules: 'GET /api/courses/:id/modules',
        enrollInCourse: 'POST /api/courses/:id/enroll',
        getEnrollments: 'GET /api/users/enrollments',
        getCourseProgress: 'GET /api/courses/:id/progress',
      },
      modules: {
        createModule: 'POST /api/modules',
        updateModule: 'PUT /api/modules/:id',
        deleteModule: 'DELETE /api/modules/:id',
        getModuleLessons: 'GET /api/modules/:id/lessons',
      },
      lessons: {
        createLesson: 'POST /api/lessons',
        updateLesson: 'PUT /api/lessons/:id',
        deleteLesson: 'DELETE /api/lessons/:id',
        getLessonProgress: 'GET /api/lessons/:id/progress',
        updateLessonProgress: 'PUT /api/lessons/:id/progress',
      },
    },
    features: [
      'User Authentication & Management',
      'Course Creation & Management',
      'Module & Lesson Organization',
      'Course Enrollment System',
      'Progress Tracking',
      'Course Search & Discovery',
      'Instructor Tools',
      'Student Dashboard',
    ],
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
      preferredLanguage: req.body.preferredLanguage,
      timezone: req.body.timezone,
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
          createdAt: newUser.createdAt,
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

    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

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
          createdAt: user.createdAt,
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

// Get profile
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
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        timezone: user.timezone,
        learningStyle: user.learningStyle,
        preferredLanguage: user.preferredLanguage,
        interests: user.interests,
        stats: user.stats,
        privacy: user.privacy,
        notifications: user.notifications,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
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

// Update profile
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

    const allowedFields = [
      'firstName', 'lastName', 'bio', 'avatar', 'location', 'timezone',
      'learningStyle', 'preferredLanguage', 'interests'
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
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        timezone: user.timezone,
        learningStyle: user.learningStyle,
        preferredLanguage: user.preferredLanguage,
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

// ===== COURSE MANAGEMENT API ENDPOINTS =====

// Get all courses (public)
app.get('/api/courses', async (req, res) => {
  try {
    const { category, difficulty, search, limit = 20, offset = 0 } = req.query;

    let filteredCourses = courses.filter(course => course.isPublished && course.isActive);

    // Apply filters
    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }

    if (difficulty) {
      filteredCourses = filteredCourses.filter(course => course.difficulty === difficulty);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    // Format response
    const coursesWithStats = paginatedCourses.map(course => ({
      id: course.id,
      title: course.title,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      category: course.category,
      tags: course.tags,
      difficulty: course.difficulty,
      duration: course.duration,
      language: course.language,
      instructorName: course.instructorName,
      isFree: course.isFree,
      price: course.price,
      enrollmentCount: course.enrollmentCount,
      averageRating: course.averageRating,
      ratingCount: course.ratingCount,
      moduleCount: course.moduleCount,
      lessonCount: course.lessonCount,
      createdAt: course.createdAt,
    }));

    res.json({
      success: true,
      data: coursesWithStats,
      pagination: {
        total: filteredCourses.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < filteredCourses.length,
      },
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

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = courses.find(c => c.id === id && c.isActive);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
      });
    }

    // Get course modules and lessons
    const courseModules = modules
      .filter(m => m.courseId === id && m.isActive)
      .sort((a, b) => a.order - b.order);

    const modulesWithLessons = courseModules.map(module => {
      const moduleLessons = lessons
        .filter(l => l.moduleId === module.id && l.isActive)
        .sort((a, b) => a.order - b.order)
        .map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          duration: lesson.duration,
          order: lesson.order,
          isPreview: lesson.isPreview,
        }));

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessonCount: moduleLessons.length,
        duration: moduleLessons.reduce((sum, lesson) => sum + lesson.duration, 0),
        lessons: moduleLessons,
      };
    });

    res.json({
      success: true,
      data: {
        ...course,
        modules: modulesWithLessons,
      },
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
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user || user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Only instructors can create courses',
      });
    }

    const {
      title,
      description,
      shortDescription,
      category,
      tags,
      difficulty,
      duration,
      language,
      isFree,
      price,
      prerequisites,
      requirements,
      learningObjectives,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Title and description are required',
      });
    }

    const courseData = {
      title,
      description,
      shortDescription,
      category,
      tags: Array.isArray(tags) ? tags : [],
      difficulty,
      duration,
      language,
      instructorId: user.id,
      instructorName: `${user.firstName} ${user.lastName}`,
      isFree: isFree !== false,
      price: isFree ? 0 : (price || 0),
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
    };

    const newCourse = createCourse(courseData);
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
    const user = users.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const { id: courseId } = req.params;
    const course = courses.find(c => c.id === courseId && c.isActive && c.isPublished);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found or not available',
      });
    }

    // Check if already enrolled
    const existingEnrollment = enrollments.find(e =>
      e.userId === user.id && e.courseId === courseId && e.status === 'active'
    );

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        error: 'ALREADY_ENROLLED',
        message: 'Already enrolled in this course',
      });
    }

    // Calculate total lessons for progress tracking
    const courseModules = modules.filter(m => m.courseId === courseId && m.isActive);
    const totalLessons = lessons.filter(l =>
      courseModules.some(m => m.id === l.moduleId) && l.isActive
    ).length;

    const enrollmentData = {
      userId: user.id,
      courseId: courseId,
      totalLessons,
    };

    const newEnrollment = createEnrollment(enrollmentData);
    enrollments.push(newEnrollment);
    enrollmentIdCounter++;

    // Update course enrollment count
    course.enrollmentCount++;
    course.updatedAt = new Date();

    // Update user stats
    user.stats.coursesEnrolled++;
    user.updatedAt = new Date();

    console.log(`✅ User enrolled: ${user.email} in ${course.title}`);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollmentId: newEnrollment.id,
        courseId: course.id,
        courseTitle: course.title,
        enrolledAt: newEnrollment.createdAt,
        totalLessons: totalLessons,
      },
    });
  } catch (error) {
    console.error('❌ Enroll course error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Get user enrollments
app.get('/api/users/enrollments', async (req, res) => {
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

    const userEnrollments = enrollments.filter(e => e.userId === user.id);

    const enrollmentsWithCourseInfo = userEnrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      return {
        id: enrollment.id,
        status: enrollment.status,
        progress: enrollment.progress,
        lessonsCompleted: enrollment.lessonsCompleted,
        totalLessons: enrollment.totalLessons,
        timeSpent: enrollment.timeSpent,
        lastAccessedAt: enrollment.lastAccessedAt,
        startedAt: enrollment.startedAt,
        completedAt: enrollment.completedAt,
        course: course ? {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          category: course.category,
          difficulty: course.difficulty,
          instructorName: course.instructorName,
        } : null,
      };
    });

    res.json({
      success: true,
      data: enrollmentsWithCourseInfo,
      count: enrollmentsWithCourseInfo.length,
    });
  } catch (error) {
    console.error('❌ Get enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Get course progress for enrolled user
app.get('/api/courses/:id/progress', async (req, res) => {
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

    const { id: courseId } = req.params;
    const enrollment = enrollments.find(e =>
      e.userId === user.id && e.courseId === courseId && e.status === 'active'
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'ENROLLMENT_NOT_FOUND',
        message: 'Not enrolled in this course',
      });
    }

    // Get lesson progress for this course
    const lessonProgress = progress.filter(p =>
      p.userId === user.id && p.courseId === courseId
    );

    // Get course structure with progress
    const courseModules = modules
      .filter(m => m.courseId === courseId && m.isActive)
      .sort((a, b) => a.order - b.order);

    const modulesWithProgress = courseModules.map(module => {
      const moduleLessons = lessons
        .filter(l => l.moduleId === module.id && l.isActive)
        .sort((a, b) => a.order - b.order);

      const lessonsWithProgress = moduleLessons.map(lesson => {
        const lessonProg = lessonProgress.find(p => p.lessonId === lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          duration: lesson.duration,
          order: lesson.order,
          progress: lessonProg ? {
            status: lessonProg.status,
            progress: lessonProg.progress,
            timeSpent: lessonProg.timeSpent,
            completedAt: lessonProg.completedAt,
            score: lessonProg.score,
          } : {
            status: 'not_started',
            progress: 0,
            timeSpent: 0,
            completedAt: null,
            score: null,
          },
        };
      });

      const moduleProgress = lessonsWithProgress.reduce((sum, lesson) =>
        sum + lesson.progress.progress, 0
      ) / lessonsWithProgress.length || 0;

      return {
        id: module.id,
        title: module.title,
        order: module.order,
        progress: moduleProgress,
        lessons: lessonsWithProgress,
      };
    });

    res.json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          lessonsCompleted: enrollment.lessonsCompleted,
          totalLessons: enrollment.totalLessons,
          timeSpent: enrollment.timeSpent,
          startedAt: enrollment.startedAt,
          lastAccessedAt: enrollment.lastAccessedAt,
        },
        modules: modulesWithProgress,
      },
    });
  } catch (error) {
    console.error('❌ Get course progress error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Create module (instructor only)
app.post('/api/modules', async (req, res) => {
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

    if (!user || user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Only instructors can create modules',
      });
    }

    const { courseId, title, description, order } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Course ID and title are required',
      });
    }

    // Verify course ownership
    const course = courses.find(c => c.id === courseId && c.instructorId === user.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found or access denied',
      });
    }

    const moduleData = {
      courseId,
      title,
      description,
      order: order || (modules.filter(m => m.courseId === courseId).length + 1),
    };

    const newModule = createModule(moduleData);
    modules.push(newModule);
    moduleIdCounter++;

    // Update course module count
    course.moduleCount++;
    course.updatedAt = new Date();

    console.log(`✅ Module created: ${newModule.title} in ${course.title}`);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: newModule,
    });
  } catch (error) {
    console.error('❌ Create module error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Create lesson (instructor only)
app.post('/api/lessons', async (req, res) => {
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

    if (!user || user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Only instructors can create lessons',
      });
    }

    const {
      courseId,
      moduleId,
      title,
      description,
      type,
      content,
      videoUrl,
      duration,
      order,
      isPreview,
    } = req.body;

    if (!courseId || !moduleId || !title) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Course ID, module ID, and title are required',
      });
    }

    // Verify course and module ownership
    const course = courses.find(c => c.id === courseId && c.instructorId === user.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found or access denied',
      });
    }

    const module = modules.find(m => m.id === moduleId && m.courseId === courseId);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'MODULE_NOT_FOUND',
        message: 'Module not found',
      });
    }

    const lessonData = {
      courseId,
      moduleId,
      title,
      description,
      type,
      content,
      videoUrl,
      duration: duration || 0,
      order: order || (lessons.filter(l => l.moduleId === moduleId).length + 1),
      isPreview: isPreview || false,
    };

    const newLesson = createLesson(lessonData);
    lessons.push(newLesson);
    lessonIdCounter++;

    // Update module and course lesson counts
    module.lessonCount++;
    module.duration += newLesson.duration;
    course.lessonCount++;
    course.totalDuration += newLesson.duration;
    course.updatedAt = new Date();

    console.log(`✅ Lesson created: ${newLesson.title} in ${module.title}`);

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: newLesson,
    });
  } catch (error) {
    console.error('❌ Create lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Update lesson progress
app.put('/api/lessons/:id/progress', async (req, res) => {
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

    const { id: lessonId } = req.params;
    const { status, progress: progressPercent, timeSpent, score } = req.body;

    const lesson = lessons.find(l => l.id === lessonId && l.isActive);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'LESSON_NOT_FOUND',
        message: 'Lesson not found',
      });
    }

    // Check enrollment
    const enrollment = enrollments.find(e =>
      e.userId === user.id && e.courseId === lesson.courseId && e.status === 'active'
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'NOT_ENROLLED',
        message: 'Not enrolled in this course',
      });
    }

    // Find or create lesson progress
    let lessonProgress = progress.find(p =>
      p.userId === user.id && p.lessonId === lessonId
    );

    if (!lessonProgress) {
      const progressData = {
        userId: user.id,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        lessonId: lessonId,
        status: status || 'in_progress',
        progress: progressPercent || 0,
        timeSpent: timeSpent || 0,
        score,
      };

      lessonProgress = createLessonProgress(progressData);
      progress.push(lessonProgress);
      progressIdCounter++;
    } else {
      // Update existing progress
      if (status) lessonProgress.status = status;
      if (progressPercent !== undefined) lessonProgress.progress = progressPercent;
      if (timeSpent !== undefined) lessonProgress.timeSpent += timeSpent;
      if (score !== undefined) lessonProgress.score = score;

      if (status === 'completed') {
        lessonProgress.completedAt = new Date();
        lessonProgress.progress = 100;
      }

      lessonProgress.lastAccessedAt = new Date();
      lessonProgress.updatedAt = new Date();
    }

    // Update enrollment progress
    const userLessonProgress = progress.filter(p =>
      p.userId === user.id && p.courseId === lesson.courseId
    );

    const completedLessons = userLessonProgress.filter(p => p.status === 'completed').length;
    const totalProgress = userLessonProgress.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = totalProgress / enrollment.totalLessons || 0;

    enrollment.lessonsCompleted = completedLessons;
    enrollment.progress = Math.round(averageProgress);
    enrollment.timeSpent += timeSpent || 0;
    enrollment.lastAccessedAt = new Date();
    enrollment.updatedAt = new Date();

    // Check if course is completed
    if (completedLessons === enrollment.totalLessons && enrollment.status === 'active') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      // Update user stats
      user.stats.coursesCompleted++;
      user.stats.totalPoints += 100; // Award completion points
      user.updatedAt = new Date();

      // Update course completion count
      const course = courses.find(c => c.id === lesson.courseId);
      if (course) {
        course.completionCount++;
      }
    }

    console.log(`✅ Lesson progress updated: ${user.email} - ${lesson.title} (${lessonProgress.status})`);

    res.json({
      success: true,
      message: 'Lesson progress updated successfully',
      data: {
        lessonProgress: {
          id: lessonProgress.id,
          status: lessonProgress.status,
          progress: lessonProgress.progress,
          timeSpent: lessonProgress.timeSpent,
          score: lessonProgress.score,
          completedAt: lessonProgress.completedAt,
        },
        enrollment: {
          progress: enrollment.progress,
          lessonsCompleted: enrollment.lessonsCompleted,
          totalLessons: enrollment.totalLessons,
          status: enrollment.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 AstraLearn v2 Course Management Server Started');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('🔐 Authentication Endpoints:');
  console.log(`   📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   👤 Profile: GET http://localhost:${PORT}/api/auth/me`);
  console.log('');
  console.log('👤 User Management Endpoints:');
  console.log(`   ✏️  Update Profile: PUT http://localhost:${PORT}/api/users/profile`);
  console.log(`   📊 Statistics: GET/PUT http://localhost:${PORT}/api/users/stats`);
  console.log(`   📚 Enrollments: GET http://localhost:${PORT}/api/users/enrollments`);
  console.log('');
  console.log('📚 Course Management Endpoints:');
  console.log(`   📋 All Courses: GET http://localhost:${PORT}/api/courses`);
  console.log(`   📖 Get Course: GET http://localhost:${PORT}/api/courses/:id`);
  console.log(`   ➕ Create Course: POST http://localhost:${PORT}/api/courses`);
  console.log(`   📝 Enroll: POST http://localhost:${PORT}/api/courses/:id/enroll`);
  console.log(`   📊 Progress: GET http://localhost:${PORT}/api/courses/:id/progress`);
  console.log(`   📑 Create Module: POST http://localhost:${PORT}/api/modules`);
  console.log(`   📄 Create Lesson: POST http://localhost:${PORT}/api/lessons`);
  console.log(`   ✅ Update Progress: PUT http://localhost:${PORT}/api/lessons/:id/progress`);
  console.log('');
  console.log('✅ Ready to accept requests!');
});
