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
            console.log(`Creating new user for Clerk ID: ${clerkId}`);
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: email || `${clerkId}@example.com`, // Fallback if email not in claims
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
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;

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

        // Ensure user exists, then update role
        const user = await prisma.user.upsert({
            where: { clerkId },
            update: { role },
            create: {
                clerkId,
                email: `${clerkId}@example.com`,
                firstName: 'New',
                lastName: role === 'TEACHER' ? 'Teacher' : 'Student',
                role
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
