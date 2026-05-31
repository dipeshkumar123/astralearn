const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { z, validateBody } = require('../lib/validation');

const studyGoalSchema = z.object({
    weeklyTargetLessons: z.coerce.number().int().min(1).max(50).optional(),
    targetMinutesPerDay: z.coerce.number().int().min(5).max(240).optional(),
    focusAreas: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
    preferredStudyTime: z.string().trim().min(1).max(40).optional()
}).passthrough();

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

function defaultGoal(userId) {
    return {
        userId,
        weeklyTargetLessons: 5,
        targetMinutesPerDay: 25,
        focusAreas: [],
        preferredStudyTime: 'Evening'
    };
}

router.get('/me', requireAuth(), async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return;

        const goal = await prisma.studyGoal.findUnique({
            where: { userId: user.id }
        });

        res.json(goal || defaultGoal(user.id));
    } catch (error) {
        console.error('Study goal fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.patch('/me', requireAuth(), validateBody(studyGoalSchema), async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return;

        const goal = await prisma.studyGoal.upsert({
            where: { userId: user.id },
            update: req.body,
            create: {
                ...defaultGoal(user.id),
                ...req.body
            }
        });

        res.json(goal);
    } catch (error) {
        console.error('Study goal update error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
