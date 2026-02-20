const app = require('./app');
const prisma = require('./lib/prisma');
const { requireAuth } = require('./middleware/auth');

// Enrollments route (handled by courses router for now)
app.get('/api/enrollments', requireAuth(), async (req, res) => {
    try {
        const { userId: clerkId } = req.auth();
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id },
            include: {
                course: {
                    include: {
                        instructor: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        },
                        _count: {
                            select: {
                                enrollments: true,
                                lessons: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
});

const PORT = process.env.PORT || 5000;

// Export app for testing
module.exports = app;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test' && !process.env.TEST_AUTH) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

