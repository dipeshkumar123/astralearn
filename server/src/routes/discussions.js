const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// GET discussions for a lesson
router.get('/lesson/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        const discussions = await prisma.discussion.findMany({
            where: { lessonId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create discussion
router.post('/', requireAuth(), async (req, res) => {
    try {
        const { title, content, lessonId } = req.body;
        const { userId } = req.auth();

        // Get internal user ID
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const discussion = await prisma.discussion.create({
            data: {
                title,
                content,
                lessonId,
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                },
                replies: true
            }
        });

        res.status(201).json(discussion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST reply to discussion
router.post('/:id/reply', requireAuth(), async (req, res) => {
    try {
        const { content } = req.body;
        const discussionId = req.params.id;
        const { userId } = req.auth();

        // Get internal user ID
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const reply = await prisma.discussionReply.create({
            data: {
                content,
                discussionId,
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            }
        });

        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE discussion
router.delete('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.auth();

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        const discussion = await prisma.discussion.findUnique({ where: { id } });

        if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

        // Allow author or teacher/admin to delete
        if (discussion.userId !== user.id && user.role !== 'TEACHER' && user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.discussion.delete({ where: { id } });
        res.json({ message: 'Discussion deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
