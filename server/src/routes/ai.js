const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireTeacher, requireEnrollment } = require('../middleware/auth');
const { generateEmbedding, generateResponse } = require('../lib/llm');
const { processContent, cosineSimilarity } = require('../lib/content-processor');
const { z, validateBody } = require('../lib/validation');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and text files are allowed'), false);
        }
    }
});

const ingestBodySchema = z.object({
    courseId: z.string().trim().min(1, 'Course ID is required'),
    contentType: z.enum(['pdf', 'text']),
}).passthrough();

const ingestTextSchema = z.object({
    courseId: z.string().trim().min(1, 'courseId is required'),
    text: z.string().trim().min(1, 'text is required').max(100000),
}).passthrough();

const chatSchema = z.object({
    question: z.string().trim().min(1, 'Question is required').max(2000),
    courseId: z.string().trim().min(1, 'courseId is required'),
}).passthrough();

/**
 * POST /api/ai/ingest - Ingest content and create embeddings
 * Requires course ownership - teachers can only index their own courses
 */
router.post('/ingest', requireAuth(), requireTeacher(), upload.single('file'), validateBody(ingestBodySchema), async (req, res) => {
    try {
        const { courseId, contentType } = req.body;
        const file = req.file;
        const { userId: clerkId } = req.auth();

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        // Verify user exists and get their ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify course exists and user is the instructor
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { instructorId: true }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (user.role !== 'ADMIN' && course.instructorId !== user.id) {
            return res.status(403).json({ error: 'Access denied. You can only index content for your own courses.' });
        }

        // Process content into chunks
        const chunks = await processContent(file.buffer, contentType);

        // Generate embeddings and save to database
        const savedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await generateEmbedding(chunks[i]);

            const courseContent = await prisma.courseContent.create({
                data: {
                    courseId,
                    contentType,
                    chunkIndex: i,
                    content: chunks[i],
                    embedding: JSON.stringify(embedding)
                }
            });

            savedChunks.push(courseContent);
        }

        res.json({
            message: 'Content ingested successfully',
            chunksCreated: savedChunks.length
        });
    } catch (error) {
        console.error('Ingestion error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ai/ingest-text - Ingest raw text content (e.g., lesson descriptions)
 * Restricted to teachers who own the course
 */
router.post('/ingest-text', requireAuth(), requireTeacher(), validateBody(ingestTextSchema), async (req, res) => {
    try {
        const { courseId, text } = req.body;
        const { userId: clerkId } = req.auth();

        // Verify user exists and get their ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify course exists and user is the instructor
        const course = await prisma.course.findUnique({ 
            where: { id: courseId },
            select: { instructorId: true }
        });
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (user.role !== 'ADMIN' && course.instructorId !== user.id) {
            return res.status(403).json({ error: 'Access denied. You can only index content for your own courses.' });
        }

        const chunks = await processContent(Buffer.from(text), 'text');
        const saved = [];
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await generateEmbedding(chunks[i]);
            const cc = await prisma.courseContent.create({
                data: {
                    courseId,
                    contentType: 'text',
                    chunkIndex: i,
                    content: chunks[i],
                    embedding: JSON.stringify(embedding)
                }
            });
            saved.push(cc);
        }
        res.json({ message: 'Text ingested', chunksCreated: saved.length });
    } catch (error) {
        console.error('Ingest text error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ai/chat - Chat with AI tutor
 */
router.post('/chat', requireAuth(), validateBody(chatSchema), async (req, res) => {
    try {
        const { question, courseId } = req.body;
        const { userId: clerkId } = req.auth();

        // Get internal user ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure requester can access this course's indexed content
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { instructorId: true }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const isInstructor = course.instructorId === user.id;
        if (!isInstructor) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId
                    }
                },
                select: { userId: true }
            });

            if (!enrollment) {
                return res.status(403).json({ error: 'Access denied. You must be enrolled in this course.' });
            }
        }

        // Generate embedding for the question
        const questionEmbedding = await generateEmbedding(question);

        // Fetch all course content with embeddings
        const allContent = await prisma.courseContent.findMany({
            where: { courseId }
        });

        if (allContent.length === 0) {
            return res.json({
                answer: "I don't have any course materials indexed yet. Please ask your instructor to upload course content.",
                sources: []
            });
        }

        // Calculate similarities and get top 3
        const similarities = allContent.map(content => ({
            content,
            similarity: cosineSimilarity(
                questionEmbedding,
                JSON.parse(content.embedding)
            )
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);
        const top = similarities.slice(0, 3);
        const topChunks = top.map(s => s.content);

        // Generate AI response
        const answer = await generateResponse(question, topChunks);

        // Save chat message
        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId: user.id,
                courseId,
                question,
                answer,
                sources: JSON.stringify(topChunks.map(c => ({
                    chunkIndex: c.chunkIndex,
                    contentType: c.contentType
                })))
            }
        });

        res.json({
            answer,
            sources: top.map(s => ({
                contentType: s.content.contentType,
                similarity: s.similarity,
                chunkIndex: s.content.chunkIndex,
                content: (s.content.content || '').substring(0, 200) + '...'
            })),
            messageId: chatMessage.id
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Chat error:', error);
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ai/context/:courseId - Get indexed content stats
 */
router.get('/context/:courseId', requireAuth(), requireEnrollment('courseId'), async (req, res) => {
    try {
        const { courseId } = req.params;

        const count = await prisma.courseContent.count({
            where: { courseId }
        });

        const contentTypes = await prisma.courseContent.groupBy({
            by: ['contentType'],
            where: { courseId },
            _count: true
        });

        res.json({
            totalChunks: count,
            contentTypes: contentTypes.map(ct => ({
                type: ct.contentType,
                count: ct._count
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ai/recommendations - Get personalized AI recommendations
 */
router.get('/recommendations', requireAuth(), async (req, res) => {
    try {
        const { userId: clerkId } = req.auth();

        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch recent quiz attempts and study goals
        const recentAttempts = await prisma.quizAttempt.findMany({
            where: { userId: user.id },
            orderBy: { completedAt: 'desc' },
            take: 5,
            include: {
                quiz: { select: { title: true } }
            }
        });

        const studyGoal = await prisma.studyGoal.findUnique({
            where: { userId: user.id }
        });

        const progress = await prisma.progress.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: {
                lesson: { select: { title: true } }
            }
        });

        const studentData = {
            recentQuizzes: recentAttempts.map(a => ({ quiz: a.quiz.title, score: a.score, passed: a.passed })),
            studyGoal: studyGoal || "No specific goal set",
            recentLessonsCompleted: progress.filter(p => p.isCompleted).map(p => p.lesson.title)
        };

        const { generatePersonalizedRecommendations } = require('../lib/llm');
        const recommendations = await generatePersonalizedRecommendations(studentData);
        
        res.json(recommendations);
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
