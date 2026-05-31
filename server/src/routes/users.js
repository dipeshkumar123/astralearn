const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireAdmin, ROLES } = require('../middleware/auth');

const VALID_ROLES = Object.values(ROLES);

function listFromEnv(name) {
    return (process.env[name] || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
}

function getAuthEmail(auth) {
    return auth?.claims?.email ||
        auth?.claims?.emailAddress ||
        auth?.sessionClaims?.email ||
        auth?.sessionClaims?.emailAddress ||
        auth?.sessionClaims?.primaryEmailAddress?.emailAddress;
}

function isBootstrapAdmin(auth) {
    const clerkId = auth?.userId?.toLowerCase();
    const email = getAuthEmail(auth)?.toLowerCase();

    return (clerkId && listFromEnv('ADMIN_CLERK_IDS').includes(clerkId)) ||
        (email && listFromEnv('ADMIN_EMAILS').includes(email));
}

// GET /api/users/me - Get or create current user
router.get('/me', requireAuth(), async (req, res) => {
    try {
        const auth = req.auth();
        const { userId: clerkId } = auth;
        const { email } = auth.claims || {}; // Clerk claims might have email
        
        // Sync role from clerk if provided
        const clerkRole = auth.claims?.public_metadata?.role || auth.sessionClaims?.public_metadata?.role;
        const defaultRole = isBootstrapAdmin(auth) ? ROLES.ADMIN : (clerkRole || ROLES.STUDENT);

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
                    role: defaultRole
                }
            });
        } else if (clerkRole && VALID_ROLES.includes(clerkRole) && user.role !== clerkRole && user.role !== ROLES.ADMIN) {
            // Auto sync from Clerk if publicMetadata.role is set and user is not an admin
            user = await prisma.user.update({
                where: { clerkId },
                data: { role: clerkRole },
                include: {
                    enrollments: {
                        include: {
                            course: true
                        }
                    }
                }
            });
        } else if (clerkRole && VALID_ROLES.includes(clerkRole) && user.role !== clerkRole && user.role !== ROLES.ADMIN) {
            // Auto sync from Clerk if publicMetadata.role is set and user is not an admin
            user = await prisma.user.update({
                where: { clerkId },
                data: { role: clerkRole },
                include: {
                    enrollments: {
                        include: {
                            course: true
                        }
                    }
                }
            });
        } else if (defaultRole === ROLES.ADMIN && user.role !== ROLES.ADMIN) {
            user = await prisma.user.update({
                where: { clerkId },
                data: { role: ROLES.ADMIN },
                include: {
                    enrollments: {
                        include: {
                            course: true
                        }
                    }
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

        // Users can only read their own stats unless they are staff.
        if (requester.id !== userId && ![ROLES.TEACHER, ROLES.ADMIN].includes(requester.role)) {
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

// GET /api/users - Admin user management
router.get('/', requireAuth(), requireAdmin(), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                clerkId: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        courses: true,
                        enrollments: true
                    }
                }
            }
        });

        res.json(users);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/users/me/role - Update user role (restricted)
// Students can only confirm STUDENT role. Any escalation requires admin.
router.patch('/me/role', requireAuth(), async (req, res) => {
    try {
        const { role } = req.body;
        const { userId: clerkId } = req.auth();

        if (!role || !VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        let user = await prisma.user.findUnique({
            where: { clerkId }
        });

        // Only allow setting role to STUDENT for self-service
        // Teacher/Admin promotion requires an admin
        if (role !== ROLES.STUDENT) {
            if (!user || user.role !== ROLES.ADMIN) {
                return res.status(403).json({ error: 'Only admins can grant teacher or admin access' });
            }
        }

        if (user) {
            // Only update if role is actually changing to STUDENT (self-service)
            if (role === ROLES.STUDENT && user.role === ROLES.STUDENT) {
                return res.json(user); // noop
            }
            if (role !== ROLES.STUDENT && user.role !== ROLES.ADMIN) {
                return res.status(403).json({ error: 'Only admins can change roles' });
            }
            user = await prisma.user.update({
                where: { clerkId },
                data: { role }
            });
        } else {
            // User doesn't exist, create with STUDENT role only
            const uniqueEmail = `user_${clerkId.replace('user_', '')}@astralearn.local`;
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: uniqueEmail,
                    firstName: 'New',
                    lastName: 'Student',
                    role: ROLES.STUDENT
                }
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/users/:userId/role - Admin updates any user's role
router.patch('/:userId/role', requireAuth(), requireAdmin(), async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !VALID_ROLES.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        res.json(user);
    } catch (error) {
        console.error('Admin role update error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
