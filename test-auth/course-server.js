// AstraLearn v2 Course Management Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5002;
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
    stats: {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      totalPoints: 0,
      level: 1,
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

function createModule(moduleData) {
  return {
    id: moduleIdCounter.toString(),
    courseId: moduleData.courseId,
    title: moduleData.title,
    description: moduleData.description || '',
    order: moduleData.order || 1,
    lessonCount: 0,
    duration: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createLesson(lessonData) {
  return {
    id: lessonIdCounter.toString(),
    courseId: lessonData.courseId,
    moduleId: lessonData.moduleId,
    title: lessonData.title,
    description: lessonData.description || '',
    order: lessonData.order || 1,
    type: lessonData.type || 'video',
    duration: lessonData.duration || 0,
    isActive: true,
    isPreview: lessonData.isPreview || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createEnrollment(enrollmentData) {
  return {
    id: enrollmentIdCounter.toString(),
    userId: enrollmentData.userId,
    courseId: enrollmentData.courseId,
    status: 'active',
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: enrollmentData.totalLessons,
    timeSpent: 0,
    lastAccessedAt: new Date(),
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createLessonProgress(progressData) {
  return {
    id: progressIdCounter.toString(),
    userId: progressData.userId,
    courseId: progressData.courseId,
    moduleId: progressData.moduleId,
    lessonId: progressData.lessonId,
    status: progressData.status || 'not_started',
    progress: progressData.progress || 0,
    timeSpent: progressData.timeSpent || 0,
    score: progressData.score || null,
    startedAt: progressData.status !== 'not_started' ? new Date() : null,
    completedAt: progressData.status === 'completed' ? new Date() : null,
    lastAccessedAt: new Date(),
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
    message: 'AstraLearn v2 Course Management Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    stats: {
      users: users.length,
      courses: courses.length,
      modules: modules.length,
      lessons: lessons.length,
      enrollments: enrollments.length,
    },
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
      },
      courses: {
        getAllCourses: 'GET /api/courses',
        getCourse: 'GET /api/courses/:id',
        createCourse: 'POST /api/courses',
        enrollInCourse: 'POST /api/courses/:id/enroll',
        getCourseProgress: 'GET /api/courses/:id/progress',
      },
      modules: {
        createModule: 'POST /api/modules',
      },
      lessons: {
        createLesson: 'POST /api/lessons',
        updateLessonProgress: 'PUT /api/lessons/:id/progress',
      },
      users: {
        getEnrollments: 'GET /api/users/enrollments',
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

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const filteredCourses = courses.filter(course => course.isPublished && course.isActive);

    const coursesWithStats = filteredCourses.map(course => ({
      id: course.id,
      title: course.title,
      shortDescription: course.shortDescription,
      category: course.category,
      tags: course.tags,
      difficulty: course.difficulty,
      duration: course.duration,
      instructorName: course.instructorName,
      isFree: course.isFree,
      enrollmentCount: course.enrollmentCount,
      averageRating: course.averageRating,
      moduleCount: course.moduleCount,
      lessonCount: course.lessonCount,
      createdAt: course.createdAt,
    }));

    res.json({
      success: true,
      data: coursesWithStats,
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

// Create course
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

    const { title, description, shortDescription, category, tags, difficulty, duration } = req.body;

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
      instructorId: user.id,
      instructorName: `${user.firstName} ${user.lastName}`,
      isFree: true,
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

// Create module
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

// Create lesson
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

    const { courseId, moduleId, title, description, type, duration, order, isPreview } = req.body;

    if (!courseId || !moduleId || !title) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Course ID, module ID, and title are required',
      });
    }

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
      duration: duration || 0,
      order: order || (lessons.filter(l => l.moduleId === moduleId).length + 1),
      isPreview: isPreview || false,
    };

    const newLesson = createLesson(lessonData);
    lessons.push(newLesson);
    lessonIdCounter++;

    module.lessonCount++;
    module.duration += newLesson.duration;
    course.lessonCount++;
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
    const course = courses.find(c => c.id === courseId && c.isActive);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'COURSE_NOT_FOUND',
        message: 'Course not found',
      });
    }

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

    course.enrollmentCount++;
    course.updatedAt = new Date();

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

    if (completedLessons === enrollment.totalLessons && enrollment.status === 'active') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      user.stats.coursesCompleted++;
      user.stats.totalPoints += 100;
      user.updatedAt = new Date();

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

// Get course progress
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

    const lessonProgress = progress.filter(p =>
      p.userId === user.id && p.courseId === courseId
    );

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

// Start server
app.listen(PORT, () => {
  console.log('🚀 AstraLearn v2 Course Management Server Started');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('');
  console.log('📚 Course Management Features:');
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
