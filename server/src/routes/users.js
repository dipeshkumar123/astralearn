const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// GET /api/users/me - Get or create current user
router.get('/me', requireAuth(), async (req, res) => {
    try {
        const auth = req.auth();
        const { userId: clerkId } = auth;
        const { email } = auth.claims || {}; // Clerk claims might have email

        // Try to find user
        let user = await prisma.user.findUnique({
            where: { clerkId },
            include: {
                enrollments: {
                    include: {
                        course: true
                    }
                }
            }
        });

        // If not found, create
        if (!user) {
            if (process.env.NODE_ENV !== 'test') {
                console.log(`Creating new user for Clerk ID: ${clerkId}`);
            }
            const uniqueEmail = email || `user_${clerkId.replace('user_', '')}@astralearn.local`;
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: uniqueEmail,
                    firstName: 'New',
                    lastName: 'Student',
                    role: 'STUDENT'
                }
            });
        }

        res.json(user);
    } catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/:userId/stats - Get user statistics
router.get('/:userId/stats', requireAuth(), async (req, res) => {
    try {
        const { userId } = req.params;
        const { userId: clerkId } = req.auth();

        const requester = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true, role: true }
        });

        if (!requester) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Users can only read their own stats unless they are a teacher/admin role in future.
        if (requester.id !== userId && requester.role !== 'TEACHER') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // 1. Calculate Average Quiz Score
        const attempts = await prisma.quizAttempt.findMany({
            where: { userId }
        });

        const avgScore = attempts.length > 0
            ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
            : 0;

        // 2. Calculate Hours Learned (Estimate: 15 mins per completed lesson)
        const completedLessons = await prisma.progress.count({
            where: {
                userId,
                isCompleted: true
            }
        });
        const hoursLearned = (completedLessons * 15 / 60).toFixed(1);

        // 3. Calculate Completed Courses
        // A course is completed if the user has completed all lessons in it
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        sections: {
                            include: {
                                lessons: true
                            }
                        }
                    }
                }
            }
        });

        let completedCourses = 0;
        for (const enrollment of enrollments) {
            const allLessons = enrollment.course.sections.flatMap(s => s.lessons);
            if (allLessons.length === 0) continue;

            const completedCount = await prisma.progress.count({
                where: {
                    userId,
                    lessonId: { in: allLessons.map(l => l.id) },
                    isCompleted: true
                }
            });

            if (completedCount === allLessons.length) {
                completedCourses++;
            }
        }

        // 4. Get User Gamification Data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true, streak: true, badges: true }
        });

        res.json({
            avgScore,
            hoursLearned,
            completedCourses,
            currentStreak: user?.streak || 0,
            points: user?.points || 0,
            badges: user?.badges || []
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/leaderboard - Get top users
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            orderBy: { points: 'desc' },
            take: 10,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                points: true,
                badges: true,
                streak: true
            }
        });
        res.json(topUsers);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/users/me/role - Update user role
router.patch('/me/role', requireAuth(), async (req, res) => {
    try {
        const { role } = req.body;
        const { userId: clerkId } = req.auth();

        if (!role || !['STUDENT', 'TEACHER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be STUDENT or TEACHER' });
        }

        // Try to find existing user first
        let user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (user) {
            // User exists, just update role
            user = await prisma.user.update({
                where: { clerkId },
                data: { role }
            });
        } else {
            // User doesn't exist, create with unique email
            const uniqueEmail = `user_${clerkId.replace('user_', '')}@astralearn.local`;
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: uniqueEmail,
                    firstName: 'New',
                    lastName: role === 'TEACHER' ? 'Teacher' : 'Student',
                    role
                }
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
