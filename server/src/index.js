const app = require('./app');

// Enrollments route (handled by courses router for now)
app.get('/api/enrollments', async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prisma } = require('./lib/prisma');

        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
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

