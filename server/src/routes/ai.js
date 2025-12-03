const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireTeacher, requireCourseOwnership } = require('../middleware/auth');
const { generateEmbedding, generateResponse } = require('../lib/gemini');
const { processContent, cosineSimilarity } = require('../lib/content-processor');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/ai/ingest - Ingest content and create embeddings
 */
router.post('/ingest', requireAuth(), requireTeacher(), upload.single('file'), async (req, res) => {
    try {
        const { courseId, contentType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
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
router.post('/ingest-text', requireAuth(), requireTeacher(), async (req, res) => {
    try {
        const { courseId, text } = req.body;

        if (!courseId || !text) {
            return res.status(400).json({ error: 'courseId and text are required' });
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const chunks = processContent(Buffer.from(text), 'text');
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
router.post('/chat', requireAuth(), async (req, res) => {
    try {
        const { question, courseId } = req.body;
        const { userId: clerkId } = req.auth();

        if (!question || !courseId) {
            return res.status(400).json({ error: 'Question and courseId required' });
        }

        // Get internal user ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
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
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ai/context/:courseId - Get indexed content stats
 */
router.get('/context/:courseId', async (req, res) => {
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

module.exports = router;
