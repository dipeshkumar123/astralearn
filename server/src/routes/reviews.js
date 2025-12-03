const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('@clerk/express');

// GET /api/reviews/course/:courseId - Get reviews for a course
router.get('/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        clerkId: true // In case we want to fetch avatar from Clerk later
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        console.error('Fetch reviews error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reviews/stats/:courseId - Get average rating and count
router.get('/stats/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const aggregations = await prisma.review.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        res.json({
            average: aggregations._avg.rating || 0,
            count: aggregations._count.rating || 0
        });
    } catch (error) {
        console.error('Review stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/reviews - Create a review
router.post('/', requireAuth(), async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;

        // Validation
        if (!courseId || !rating) {
            return res.status(400).json({ error: 'courseId and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const { userId: clerkId } = req.auth();

        // Get internal user ID
        const user = await prisma.user.findUnique({ 
            where: { clerkId },
            select: { id: true }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ error: 'You must be enrolled to review this course' });
        }

        const review = await prisma.review.create({
            data: {
                userId: user.id,
                courseId,
                rating: parseInt(rating),
                comment: comment || ''
            }
        });

        res.json(review);
    } catch (error) {
        // Handle unique constraint violation (already reviewed)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'You have already reviewed this course' });
        }
        console.error('Create review error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
