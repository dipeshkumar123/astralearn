const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// GET user progress for a course
router.get('/course/:courseId', requireAuth(), async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const progress = await prisma.progress.findMany({
            where: {
                userId: user.id,
                lesson: {
                    courseId
                }
            },
            include: {
                lesson: true
            }
        });

        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST mark lesson as complete
router.post('/lesson/:lessonId', requireAuth(), async (req, res) => {
    try {
        const { lessonId } = req.params;

        if (!lessonId) {
            return res.status(400).json({ error: 'Lesson ID is required' });
        }

        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { id: true, courseId: true }
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const course = await prisma.course.findUnique({
            where: { id: lesson.courseId },
            select: { instructorId: true }
        });

        const isInstructor = course && course.instructorId === user.id;
        if (!isInstructor) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId: lesson.courseId
                    }
                },
                select: { userId: true }
            });

            if (!enrollment) {
                return res.status(403).json({
                    error: 'Access denied. You must be enrolled in this course.'
                });
            }
        }

        const progress = await prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId
                }
            },
            update: {
                isCompleted: true
            },
            create: {
                userId: user.id,
                lessonId,
                isCompleted: true
            }
        });

        res.json(progress);
    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE unmark lesson (mark as incomplete)
router.delete('/lesson/:lessonId', requireAuth(), async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { id: true, courseId: true }
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const course = await prisma.course.findUnique({
            where: { id: lesson.courseId },
            select: { instructorId: true }
        });

        const isInstructor = course && course.instructorId === user.id;
        if (!isInstructor) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId: lesson.courseId
                    }
                },
                select: { userId: true }
            });

            if (!enrollment) {
                return res.status(403).json({
                    error: 'Access denied. You must be enrolled in this course.'
                });
            }
        }

        await prisma.progress.delete({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId
                }
            }
        });

        res.json({ message: 'Progress removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
