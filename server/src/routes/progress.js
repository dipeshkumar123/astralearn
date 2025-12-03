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

        console.log(`DEBUG: Marking lesson ${lessonId} complete for user ${user.id}`);

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
