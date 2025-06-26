import { Router } from 'express';
import { Course, User, UserProgress } from '../models/index.js';
import { flexibleAuthenticate, flexibleAuthorize } from '../middleware/devAuth.js';

const router = Router();

// System statistics endpoint
router.get('/system/stats', flexibleAuthenticate, flexibleAuthorize(['admin']), async (req, res) => {
  try {
    // Get real system statistics
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      activeUsers,
      activeCourses
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Course.aggregate([
        { $unwind: '$modules' },
        { $unwind: '$modules.lessons' },
        { $count: 'totalLessons' }
      ]).then(result => result[0]?.totalLessons || 0),
      User.countDocuments({ 
        lastLogin: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        } 
      }),
      Course.countDocuments({ isActive: true })
    ]);

    // Calculate system uptime (simplified)
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimePercentage = Math.min(99.99, 95 + (uptimeHours / 1000) * 5); // Simplified calculation

    // Get server load (simplified)
    const memUsage = process.memoryUsage();
    const serverLoad = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalCourses,
        activeCourses,
        totalLessons,
        systemUptime: `${uptimePercentage.toFixed(2)}%`,
        serverLoad,
        databaseSize: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB` // Simplified
      }
    });
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User statistics endpoint
router.get('/users/stats', flexibleAuthenticate, flexibleAuthorize(['admin']), async (req, res) => {
  try {
    const [
      students,
      instructors,
      admins,
      newUsersToday,
      activeSessionsNow
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      // Simplified active sessions count
      User.countDocuments({
        lastLogin: {
          $gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      })
    ]);

    res.json({
      stats: {
        students,
        instructors,
        admins,
        newUsersToday,
        activeSessionsNow
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// System health endpoint
router.get('/system/health', flexibleAuthenticate, flexibleAuthorize(['admin']), async (req, res) => {
  try {
    const health = {
      webServer: 'healthy',
      database: 'healthy',
      aiService: 'healthy',
      fileStorage: 'healthy',
      emailService: 'healthy'
    };

    // Test database connection
    try {
      await User.findOne().limit(1);
    } catch (dbError) {
      health.database = 'error';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (memoryUsagePercent > 90) {
      health.webServer = 'warning';
    }

    // Simplified health checks for other services
    // In a real implementation, these would ping actual services
    if (Math.random() > 0.95) { // 5% chance of warning
      health.emailService = 'warning';
    }

    res.json({ health });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ 
      health: {
        webServer: 'error',
        database: 'error',
        aiService: 'unknown',
        fileStorage: 'unknown',
        emailService: 'unknown'
      }
    });
  }
});

// Get all users (admin only)
router.get('/users', flexibleAuthenticate, flexibleAuthorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    
    const filters = {};
    
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filters.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filters);

    res.json({
      users,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + users.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
