const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireTeacher, requireCourseOwnership } = require('../middleware/auth');

// GET all courses with filtering
router.get('/', async (req, res) => {
    try {
        const { search, category, level } = req.query;

        const where = {
            isPublished: true
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category && category !== 'All') {
            where.category = category;
        }

        if (level && level !== 'All') {
            where.level = level;
        }

        const courses = await prisma.course.findMany({
            where,
            include: {
                sections: {
                    include: {
                        lessons: {
                            include: {
                                quizzes: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET enrolled courses for current user
router.get('/my-courses', requireAuth(), async (req, res) => {
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
                        sections: {
                            include: {
                                lessons: true
                            }
                        },
                        instructor: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        const courses = enrollments.map(e => e.course);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET instructor's courses
router.get('/instructor', requireAuth(), async (req, res) => {
    try {
        const { userId: clerkId } = req.auth();
        
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            // Return empty array instead of 404 - user might be newly created
            return res.json([]);
        }

        const courses = await prisma.course.findMany({
            where: { instructorId: user.id },
            include: {
                sections: {
                    include: {
                        lessons: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true,
                        sections: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single course
router.get('/:id', async (req, res) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id },
            include: {
                sections: {
                    include: {
                        lessons: {
                            include: {
                                quizzes: true
                            },
                            orderBy: {
                                position: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        position: 'asc'
                    }
                },
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create course
router.post('/', requireAuth(), requireTeacher(), async (req, res) => {
    try {
        const { title, description, category, level, price, thumbnail } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({ error: 'title is required' });
        }

        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        const course = await prisma.course.create({
            data: {
                title,
                description,
                category: category || 'Uncategorized',
                level: level || 'Beginner',
                price: price || 0,
                thumbnail,
                instructorId: user.id
            }
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update course (full update)
router.put('/:id', requireAuth(), requireCourseOwnership('id'), async (req, res) => {
    try {
        const { title, description, category, level, price, thumbnail, isPublished } = req.body;
        
        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                category,
                level,
                price,
                thumbnail,
                isPublished
            }
        });

        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH update course
router.patch('/:id', requireAuth(), requireCourseOwnership('id'), async (req, res) => {
    try {
        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE course
router.delete('/:id', requireAuth(), requireCourseOwnership('id'), async (req, res) => {
    try {
        await prisma.course.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST enroll in a course (free enrollment)
router.post('/:id/enroll', requireAuth(), async (req, res) => {
    try {
        const courseId = req.params.id;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Already enrolled' });
        }

        // For paid courses, check if purchased
        if (course.price > 0) {
            const purchase = await prisma.purchase.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId
                    }
                }
            });

            if (!purchase) {
                return res.status(403).json({ error: 'Please purchase this course first' });
            }
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId
            }
        });

        res.status(201).json(enrollment);
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET check enrollment status
router.get('/:id/enrollment-status', requireAuth(), async (req, res) => {
    try {
        const courseId = req.params.id;
        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.json({ enrolled: false, purchased: false });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        const purchase = await prisma.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        res.json({ 
            enrolled: !!enrollment, 
            purchased: !!purchase 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
