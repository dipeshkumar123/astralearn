const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { z, validateBody } = require('../lib/validation');

// --- Validation schemas ---
const createQuizSchema = z.object({
    lessonId: z.string().trim().min(1, 'lessonId is required'),
    title: z.string().trim().min(1, 'title is required').max(200),
    description: z.string().max(2000).optional().nullable(),
    passingScore: z.coerce.number().int().min(0).max(100).optional(),
    timeLimit: z.coerce.number().int().min(1).max(600).optional().nullable(),
}).passthrough();

const createQuestionSchema = z.object({
    type: z.enum(['multiple_choice', 'true_false']),
    question: z.string().trim().min(1, 'question text is required').max(5000),
    options: z.any().optional().nullable(),
    correctAnswer: z.string().trim().min(1, 'correctAnswer is required').max(1000),
    explanation: z.string().max(5000).optional().nullable(),
    order: z.coerce.number().int().min(0).optional(),
    points: z.coerce.number().int().min(1).max(100).optional(),
}).passthrough();

const submitAttemptSchema = z.object({
    answers: z.record(z.string(), z.string()),
    timeSpent: z.coerce.number().int().min(0).optional().nullable(),
}).passthrough();

// --- Helpers ---
async function getStaffUser(req) {
    const auth = req.auth ? req.auth() : null;
    if (!auth?.userId) return null;

    const user = await prisma.user.findUnique({
        where: { clerkId: auth.userId },
        select: { id: true, role: true }
    });

    if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) return null;
    return user;
}

async function canManageLesson(req, lessonId) {
    const user = await getStaffUser(req);
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: {
            course: {
                select: { instructorId: true }
            }
        }
    });

    return lesson?.course?.instructorId === user.id;
}

async function canManageQuiz(req, quizId) {
    const user = await getStaffUser(req);
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: {
            lesson: {
                select: {
                    course: {
                        select: { instructorId: true }
                    }
                }
            }
        }
    });

    return quiz?.lesson?.course?.instructorId === user.id;
}

async function canManageQuestion(req, questionId) {
    const user = await getStaffUser(req);
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: {
            quiz: {
                select: {
                    lesson: {
                        select: {
                            course: {
                                select: { instructorId: true }
                            }
                        }
                    }
                }
            }
        }
    });

    return question?.quiz?.lesson?.course?.instructorId === user.id;
}

/**
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Teacher
 */
router.post('/', requireAuth(), validateBody(createQuizSchema), async (req, res) => {
    try {
        const { lessonId, title, description, passingScore, timeLimit } = req.body;

        if (!(await canManageLesson(req, lessonId))) {
            return res.status(403).json({ error: 'Access denied. Teacher role and course ownership required.' });
        }

        const quiz = await prisma.quiz.create({
            data: {
                lessonId,
                title,
                description,
                passingScore: passingScore || 70,
                timeLimit
            }
        });

        res.json(quiz);
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get quiz with questions. Answers only visible to course staff.
 * @access  Public (answers restricted)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Determine if requester is a teacher/admin who can see answers
        let canSeeAnswers = false;
        try {
            canSeeAnswers = await canManageQuiz(req, id);
        } catch {
            // Not authenticated or lookup failed — default to no answers
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        type: true,
                        question: true,
                        options: true,
                        correctAnswer: canSeeAnswers,
                        explanation: canSeeAnswers,
                        order: true,
                        points: true
                    }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/quizzes/lesson/:lessonId
 * @desc    Get all quizzes for a lesson
 * @access  Public
 */
router.get('/lesson/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;

        const quizzes = await prisma.quiz.findMany({
            where: { lessonId },
            include: {
                questions: {
                    select: { id: true }
                },
                _count: {
                    select: { questions: true, attempts: true }
                }
            }
        });

        res.json(quizzes);
    } catch (error) {
        console.error('Get lesson quizzes error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/quizzes/:id
 * @desc    Update quiz
 * @access  Teacher
 */
router.patch('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, passingScore, timeLimit } = req.body;

        if (!(await canManageQuiz(req, id))) {
            return res.status(403).json({ error: 'Access denied. Teacher role and course ownership required.' });
        }

        const quiz = await prisma.quiz.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(passingScore !== undefined && { passingScore }),
                ...(timeLimit !== undefined && { timeLimit })
            }
        });

        res.json(quiz);
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete quiz
 * @access  Teacher
 */
router.delete('/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;

        if (!(await canManageQuiz(req, id))) {
            return res.status(403).json({ error: 'Access denied. Teacher role and course ownership required.' });
        }

        await prisma.quiz.delete({
            where: { id }
        });

        res.json({ message: 'Quiz deleted' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/quizzes/:id/questions
 * @desc    Add question to quiz
 * @access  Teacher
 */
router.post('/:id/questions', requireAuth(), validateBody(createQuestionSchema), async (req, res) => {
    try {
        const { id: quizId } = req.params;
        const { type, question, options, correctAnswer, explanation, order, points } = req.body;

        if (!(await canManageQuiz(req, quizId))) {
            return res.status(403).json({ error: 'Access denied. Teacher role and course ownership required.' });
        }

        const newQuestion = await prisma.question.create({
            data: {
                quizId,
                type,
                question,
                options,
                correctAnswer,
                explanation,
                order: order || 0,
                points: points || 1
            }
        });

        res.json(newQuestion);
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PATCH /api/questions/:id
 * @desc    Update question
 * @access  Teacher
 */
router.patch('/questions/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { type, question, options, correctAnswer, explanation, order, points } = req.body;

        if (!(await canManageQuestion(req, id))) {
            return res.status(403).json({ error: 'Access denied. Teacher role and course ownership required.' });
        }

        const updated = await prisma.question.update({
            where: { id },
            data: {
                ...(type && { type }),
                ...(question && { question }),
                ...(options !== undefined && { options }),
                ...(correctAnswer && { correctAnswer }),
                ...(explanation !== undefined && { explanation }),
                ...(order !== undefined && { order }),
                ...(points !== undefined && { points })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete question
 * @access  Teacher
 */
router.delete('/questions/:id', requireAuth(), async (req, res) => {
    try {
        const { id } = req.params;

        if (!(await canManageQuestion(req, id))) {
            return res.status(403).json({ error: 'Access denied. Teacher role and course ownership required.' });
        }

        await prisma.question.delete({
            where: { id }
        });

        res.json({ message: 'Question deleted' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/quizzes/:id/attempt
 * @desc    Submit quiz attempt
 * @access  Student (authenticated)
 */
router.post('/:id/attempt', requireAuth(), validateBody(submitAttemptSchema), async (req, res) => {
    try {
        const { id: quizId } = req.params;
        const { answers, timeSpent } = req.body;
        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Grade the quiz
        let totalPoints = 0;
        let earnedPoints = 0;
        const results = {};

        quiz.questions.forEach((question) => {
            totalPoints += question.points;
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;

            if (isCorrect) {
                earnedPoints += question.points;
            }

            results[question.id] = {
                correct: isCorrect,
                userAnswer,
                correctAnswer: question.correctAnswer
            };
        });

        const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const passed = score >= quiz.passingScore;

        // Save attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId,
                userId: user.id,
                answers,
                score,
                passed,
                timeSpent
            }
        });

        res.json({
            attemptId: attempt.id,
            score,
            passed,
            results,
            earnedPoints,
            totalPoints
        });
    } catch (error) {
        console.error('Submit attempt error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/quizzes/:id/results
 * @desc    Get quiz results for current user
 * @access  Private
 */
router.get('/:id/results', requireAuth(), async (req, res) => {
    try {
        const { id: quizId } = req.params;
        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const attempts = await prisma.quizAttempt.findMany({
            where: {
                quizId,
                userId: user.id
            },
            orderBy: {
                completedAt: 'desc'
            }
        });

        res.json(attempts);
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
