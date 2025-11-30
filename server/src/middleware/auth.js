const { getAuth } = require('@clerk/express');
const prisma = require('../lib/prisma');

const requireAuth = () => {
    return (req, res, next) => {
        // Test bypass: allow injecting auth when TEST_AUTH=1
        if (process.env.TEST_AUTH === '1') {
            const injectedId = process.env.TEST_AUTH_CLERK_ID || 'test_clerk_user';
            req.auth = () => ({ userId: injectedId });
            return next();
        }
        // Use getAuth(req) for Clerk Express v1.x
        const auth = getAuth(req);
        if (!auth || !auth.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Attach auth function to req for compatibility
        req.auth = () => auth;
        next();
    };
};

/**
 * Middleware to check if user is a teacher
 */
const requireTeacher = () => {
    return async (req, res, next) => {
        try {
            const auth = req.auth ? req.auth() : getAuth(req);
            if (!auth || !auth.userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { userId: clerkId } = auth;
            const user = await prisma.user.findUnique({
                where: { clerkId },
                select: { role: true }
            });

            if (!user || user.role !== 'TEACHER') {
                return res.status(403).json({ error: 'Access denied. Teacher role required.' });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

/**
 * Middleware to check if user is enrolled in a course or is the instructor
 */
const requireEnrollment = (courseIdParam = 'courseId') => {
    return async (req, res, next) => {
        try {
            const auth = req.auth ? req.auth() : getAuth(req);
            if (!auth || !auth.userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { userId: clerkId } = auth;
            const courseId = req.params[courseIdParam] || req.body[courseIdParam];

            if (!courseId) {
                return res.status(400).json({ error: 'Course ID required' });
            }

            const user = await prisma.user.findUnique({
                where: { clerkId },
                select: { id: true, role: true }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if user is the course instructor
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { instructorId: true }
            });

            if (course && course.instructorId === user.id) {
                req.user = user;
                return next();
            }

            // Check if user is enrolled or has purchased
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId
                    }
                }
            });

            if (!enrollment) {
                return res.status(403).json({ 
                    error: 'Access denied. You must be enrolled in this course.' 
                });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

/**
 * Middleware to check if user owns a course (is the instructor)
 */
const requireCourseOwnership = (courseIdParam = 'courseId') => {
    return async (req, res, next) => {
        try {
            const auth = req.auth ? req.auth() : getAuth(req);
            if (!auth || !auth.userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { userId: clerkId } = auth;
            const courseId = req.params[courseIdParam] || req.body[courseIdParam];

            if (!courseId) {
                return res.status(400).json({ error: 'Course ID required' });
            }

            const user = await prisma.user.findUnique({
                where: { clerkId },
                select: { id: true }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { instructorId: true }
            });

            if (!course || course.instructorId !== user.id) {
                return res.status(403).json({ 
                    error: 'Access denied. You must be the course instructor.' 
                });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = { 
    requireAuth, 
    requireTeacher, 
    requireEnrollment, 
    requireCourseOwnership 
};
