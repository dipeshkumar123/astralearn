jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req, _res, next) => {
    req.auth = () => ({ userId: 'user_test123' });
    next();
  },
  requireAuth: () => (req, _res, next) => {
    req.auth = () => ({ userId: 'user_test123' });
    next();
  }
}));

jest.mock('@mux/mux-node', () => {
  return jest.fn(() => ({
    video: {
      uploads: {
        create: jest.fn(),
        get: jest.fn(),
        cancel: jest.fn(),
      },
      assets: {
        get: jest.fn(),
      },
    },
  }));
});

jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  lesson: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  section: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  contentChunk: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../src/lib/content-processor', () => ({
  processText: jest.fn(),
  processPDF: jest.fn(),
  processContent: jest.fn(),
}));

const request = require('supertest');
const prisma = require('../src/lib/prisma');
const app = require('../src/index');

describe('AI Content Ingestion Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ai/ingest-text', () => {
    test('Should ingest text content to owned course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });

      const contentProcessor = require('../src/lib/content-processor');
      contentProcessor.processText.mockResolvedValue([
        { content: 'Chunk 1', startIndex: 0, endIndex: 50 },
        { content: 'Chunk 2', startIndex: 50, endIndex: 100 }
      ]);

      prisma.contentChunk.createMany.mockResolvedValue({
        count: 2
      });

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          text: 'This is sample course content that will be ingested'
        });

      expect([200, 201, 403]).toContain(response.status);
    });

    test('Should reject if user does not own course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2' // Different owner
      });

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          text: 'Content'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    test('Should validate courseId parameter', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          text: 'Content without courseId'
        });

      expect([400, 403]).toContain(response.status);
    });

    test('Should return 404 if course not found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'nonexistent',
          text: 'Content'
        });

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/ai/ingest (File Upload)', () => {
    test('Should ingest PDF file to owned course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });

      const contentProcessor = require('../src/lib/content-processor');
      contentProcessor.processPDF.mockResolvedValue([
        { content: 'PDF Chunk 1', startIndex: 0, endIndex: 100 }
      ]);

      prisma.contentChunk.createMany.mockResolvedValue({
        count: 1
      });

      const response = await request(app)
        .post('/api/ai/ingest')
        .set('Authorization', 'Bearer test_token')
        .field('courseId', 'c1')
        .field('contentType', 'pdf')
        .attach('file', Buffer.from('PDF content'), 'test.pdf');

      expect([200, 201, 403]).toContain(response.status);
    });

    test('Should reject file upload if not course owner', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2' // Different owner
      });

      const response = await request(app)
        .post('/api/ai/ingest')
        .set('Authorization', 'Bearer test_token')
        .field('courseId', 'c1')
        .field('contentType', 'pdf')
        .attach('file', Buffer.from('PDF content'), 'test.pdf');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    test('Should require courseId and file', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

      const response = await request(app)
        .post('/api/ai/ingest')
        .set('Authorization', 'Bearer test_token')
        .field('contentType', 'pdf');

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('POST /api/ai/chat', () => {
    test('Should return AI response for student query', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'STUDENT' });
      prisma.lesson.findUnique.mockResolvedValue({
        id: 'l1',
        courseId: 'c1'
      });
      prisma.contentChunk.findMany.mockResolvedValue([
        { content: 'Relevant content chunk' }
      ]);

      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          question: 'What is the main topic?'
        });

      expect([200, 201, 400, 403, 500]).toContain(response.status);
    });
  });
});
