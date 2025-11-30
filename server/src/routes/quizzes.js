const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Teacher
 */
router.post('/', requireAuth(), async (req, res) => {
    try {
        const { lessonId, title, description, passingScore, timeLimit } = req.body;

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
 * @desc    Get quiz with questions
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { includeAnswers } = req.query;

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
                        correctAnswer: includeAnswers === 'true',
                        explanation: includeAnswers === 'true',
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
 * @route   GET /api/lessons/:lessonId/quizzes
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
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, passingScore, timeLimit } = req.body;

        const quiz = await prisma.quiz.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(passingScore && { passingScore }),
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
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

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
router.post('/:id/questions', async (req, res) => {
    try {
        const { id: quizId } = req.params;
        const { type, question, options, correctAnswer, explanation, order, points } = req.body;

        const newQuestion = await prisma.question.create({
            data: {
                quizId,
                type,
                question,
                options,
                correctAnswer,
                explanation,
                order,
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
router.patch('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, question, options, correctAnswer, explanation, order, points } = req.body;

        const updated = await prisma.question.update({
            where: { id },
            data: {
                ...(type && { type }),
                ...(question && { question }),
                ...(options !== undefined && { options }),
                ...(correctAnswer && { correctAnswer }),
                ...(explanation !== undefined && { explanation }),
                ...(order !== undefined && { order }),
                ...(points && { points })
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
router.delete('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;

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
 * @access  Student
 */
router.post('/:id/attempt', requireAuth(), async (req, res) => {
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
