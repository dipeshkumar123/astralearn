const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireCourseOwnership } = require('../middleware/auth');

// GET sections for a course
router.get('/course/:courseId', async (req, res) => {
    try {
        const sections = await prisma.section.findMany({
            where: { courseId: req.params.courseId },
            include: { lessons: true },
            orderBy: { position: 'asc' }
        });
        res.json(sections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attach courseId to params for routes with :id so ownership middleware can use it
router.param('id', async (req, res, next, id) => {
    try {
        const section = await prisma.section.findUnique({ where: { id } });
        if (!section) return res.status(404).json({ error: 'Section not found' });
        // Expose courseId for ownership checks
        req.params.courseId = section.courseId;
        next();
    } catch (error) {
        next(error);
    }
});

// POST create section
router.post('/', requireAuth(), requireCourseOwnership('courseId'), async (req, res) => {
    try {
        const { title, courseId } = req.body;

        // Get max position
        const maxPosition = await prisma.section.aggregate({
            where: { courseId },
            _max: { position: true }
        });

        const section = await prisma.section.create({
            data: {
                title,
                courseId,
                position: (maxPosition._max.position || -1) + 1
            }
        });

        res.status(201).json(section);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH update section
router.patch('/:id', requireAuth(), requireCourseOwnership('courseId'), async (req, res) => {
    try {
        const section = await prisma.section.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(section);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE section
router.delete('/:id', requireAuth(), requireCourseOwnership('courseId'), async (req, res) => {
    try {
        await prisma.section.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Section deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper to attach courseId for reorder from first section id
async function attachCourseIdFromSections(req, res, next) {
    try {
        const { sections } = req.body;
        if (!Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ error: 'sections array required' });
        }
        const first = await prisma.section.findUnique({ where: { id: sections[0].id } });
        if (!first) return res.status(404).json({ error: 'Section not found' });
        req.body.courseId = first.courseId;
        next();
    } catch (error) {
        next(error);
    }
}

// POST reorder sections
router.post('/reorder', requireAuth(), attachCourseIdFromSections, requireCourseOwnership('courseId'), async (req, res) => {
    try {
        const { sections } = req.body; // array of { id, position }

        await Promise.all(
            sections.map(section =>
                prisma.section.update({
                    where: { id: section.id },
                    data: { position: section.position }
                })
            )
        );

        res.json({ message: 'Sections reordered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
