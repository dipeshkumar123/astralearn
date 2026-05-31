const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

async function getCurrentUser(req, res) {
    const { userId: clerkId } = req.auth();
    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true }
    });

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return null;
    }

    return user;
}

router.get('/', requireAuth(), async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return;

        const savedCourses = await prisma.savedCourse.findMany({
            where: { userId: user.id },
            include: {
                course: {
                    include: {
                        sections: {
                            include: {
                                lessons: true
                            }
                        },
                        _count: {
                            select: {
                                enrollments: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(savedCourses);
    } catch (error) {
        console.error('Saved courses fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:courseId', requireAuth(), async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return;

        const course = await prisma.course.findUnique({
            where: { id: req.params.courseId },
            select: { id: true, isPublished: true }
        });

        if (!course || !course.isPublished) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const savedCourse = await prisma.savedCourse.upsert({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: course.id
                }
            },
            update: {},
            create: {
                userId: user.id,
                courseId: course.id
            }
        });

        res.status(201).json(savedCourse);
    } catch (error) {
        console.error('Saved course create error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:courseId', requireAuth(), async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return;

        await prisma.savedCourse.deleteMany({
            where: {
                userId: user.id,
                courseId: req.params.courseId
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Saved course delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
