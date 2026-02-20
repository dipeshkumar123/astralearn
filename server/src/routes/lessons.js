const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireCourseOwnership } = require('../middleware/auth');
const { z, validateBody } = require('../lib/validation');

const createLessonSchema = z.object({
    title: z.string().trim().min(1, 'title is required').max(200),
    sectionId: z.string().trim().min(1, 'sectionId is required'),
    courseId: z.string().trim().min(1, 'courseId is required'),
    description: z.string().max(20000).optional().nullable(),
}).passthrough();

const patchLessonSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(20000).optional().nullable(),
    muxAssetId: z.string().trim().max(255).optional().nullable(),
    muxPlaybackId: z.string().trim().max(255).optional().nullable(),
    sectionId: z.string().trim().min(1).optional(),
    position: z.coerce.number().int().min(0).optional(),
}).passthrough();

// GET lessons for a section
router.get('/section/:sectionId', async (req, res) => {
    try {
        const lessons = await prisma.lesson.findMany({
            where: { sectionId: req.params.sectionId },
            orderBy: { position: 'asc' }
        });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single lesson
router.get('/:id', async (req, res) => {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: req.params.id },
            include: {
                quizzes: {
                    include: {
                        _count: { select: { questions: true, attempts: true } }
                    }
                }
            }
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attach courseId to params for routes with :id so ownership middleware can use it
router.param('id', async (req, res, next, id) => {
    try {
        const lesson = await prisma.lesson.findUnique({ where: { id } });
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
        req.params.courseId = lesson.courseId;
        next();
    } catch (error) {
        next(error);
    }
});

// POST create lesson
router.post('/', requireAuth(), requireCourseOwnership('courseId'), validateBody(createLessonSchema), async (req, res) => {
    try {
        const { title, sectionId, description, courseId } = req.body;

        // Get max position
        const maxPosition = await prisma.lesson.aggregate({
            where: { sectionId },
            _max: { position: true }
        });

        const lesson = await prisma.lesson.create({
            data: {
                title,
                description,
                sectionId,
                courseId,
                position: (maxPosition._max.position || -1) + 1
            }
        });

        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH update lesson
router.patch('/:id', requireAuth(), requireCourseOwnership('courseId'), validateBody(patchLessonSchema), async (req, res) => {
    try {
        const lesson = await prisma.lesson.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE lesson
router.delete('/:id', requireAuth(), requireCourseOwnership('courseId'), async (req, res) => {
    try {
        await prisma.lesson.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Lesson deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
