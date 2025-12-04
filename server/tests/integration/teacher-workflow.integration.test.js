jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req, _res, next) => {
    req.auth = () => ({ userId: 'user_teacher_123' });
    next();
  },
  requireAuth: () => (req, _res, next) => {
    req.auth = () => ({ userId: 'user_teacher_123' });
    next();
  }
}));

jest.mock('../../src/lib/prisma', () => ({
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

jest.mock('../../src/lib/content-processor');

const request = require('supertest');
const prisma = require('../../src/lib/prisma');

const app = require('../../src/index');

describe('Complete Teacher Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full Course Creation and Content Ingestion Flow', () => {
    test('Should complete full workflow: create course -> upload video -> ingest content', async () => {
      // Step 1: User auto-creation on first API call
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // First call - user doesn't exist
        .mockResolvedValue({ id: 'u1', role: 'TEACHER' }); // Subsequent calls

      prisma.user.create.mockResolvedValue({
        id: 'u1',
        clerkId: 'user_teacher_123',
        email: 'user_teacher_123@astralearn.local',
        role: 'TEACHER'
      });

      // Step 2: Create a course
      prisma.course.create.mockResolvedValue({
        id: 'c1',
        title: 'Advanced JavaScript',
        description: 'Learn advanced JS concepts',
        instructorId: 'u1',
        isPublished: false
      });

      const createCourseResponse = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer test_token')
        .send({
          title: 'Advanced JavaScript',
          description: 'Learn advanced JS concepts'
        });

      expect(createCourseResponse.status).toBe(201);
      expect(createCourseResponse.body.id).toBe('c1');

      // Step 3: Get upload URL for video
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });

      const mockMux = require('@mux/mux-node').default;
      mockMux().video.uploads.create.mockResolvedValue({
        id: 'upload_123',
        url: 'https://upload.mux.com/upload_123'
      });

      const uploadUrlResponse = await request(app)
        .post('/api/mux/upload-url')
        .set('Authorization', 'Bearer test_token')
        .send({ courseId: 'c1' });

      expect(uploadUrlResponse.status).toBe(200);
      expect(uploadUrlResponse.body.uploadUrl).toBe('https://upload.mux.com/upload_123');

      // Step 4: Ingest text content
      const contentProcessor = require('../src/lib/content-processor');
      contentProcessor.processText.mockResolvedValue([
        { content: 'JavaScript fundamentals', startIndex: 0, endIndex: 100 },
        { content: 'Advanced patterns', startIndex: 100, endIndex: 200 }
      ]);

      prisma.contentChunk.createMany.mockResolvedValue({
        count: 2
      });

      const ingestResponse = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          text: 'JavaScript fundamentals and advanced patterns'
        });

      expect(ingestResponse.status).toBe(200);
      expect(ingestResponse.body.chunksCreated).toBe(2);

      // Step 5: Publish course
      prisma.course.update.mockResolvedValue({
        id: 'c1',
        isPublished: true
      });

      const publishResponse = await request(app)
        .patch(`/api/courses/c1`)
        .set('Authorization', 'Bearer test_token')
        .send({ isPublished: true });

      expect(publishResponse.status).toBe(200);
    });

    test('Should prevent teacher from accessing other teacher courses', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });

      // Try to edit another teacher's course
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2' // Different teacher
      });

      const response = await request(app)
        .patch('/api/courses/c1')
        .set('Authorization', 'Bearer test_token')
        .send({ title: 'Hacked Course' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not course instructor');

      // Also verify they can't ingest content to other courses
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2'
      });

      const ingestResponse = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          text: 'Malicious content'
        });

      expect(ingestResponse.status).toBe(403);
      expect(ingestResponse.body.error).toContain('Access denied');
    });
  });

  describe('Student Access Control', () => {
    test('Student should not be able to create courses', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'STUDENT' });

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer test_token')
        .send({
          title: 'New Course',
          description: 'Description'
        });

      expect(response.status).toBe(403);
    });

    test('Student should not access video upload endpoints', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'STUDENT' });

      const response = await request(app)
        .post('/api/mux/upload-url')
        .set('Authorization', 'Bearer test_token')
        .send({ courseId: 'c1' });

      expect(response.status).toBe(403);
    });

    test('Student should not access content ingestion', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'STUDENT' });

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          text: 'Content'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Course Selector Functionality', () => {
    test('Teacher should get list of their courses for selector', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
      prisma.course.findMany.mockResolvedValue([
        {
          id: 'c1',
          title: 'Python Basics',
          isPublished: true,
          instructorId: 'u1'
        },
        {
          id: 'c2',
          title: 'Advanced Python',
          isPublished: false,
          instructorId: 'u1'
        },
        {
          id: 'c3',
          title: 'JavaScript',
          isPublished: true,
          instructorId: 'u1'
        }
      ]);

      const response = await request(app)
        .get('/api/courses/instructor')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      
      // Verify response includes necessary fields for dropdown
      response.body.forEach(course => {
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('title');
        expect(course).toHaveProperty('isPublished');
      });
    });

    test('Courses list should only include teacher own courses', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
      prisma.course.findMany.mockResolvedValue([
        {
          id: 'c1',
          title: 'My Course',
          isPublished: true,
          instructorId: 'u1'
        }
      ]);

      const response = await request(app)
        .get('/api/courses/instructor')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(200);
      expect(response.body[0].instructorId).toBe('u1');
    });
  });

  describe('Email Constraint Handling', () => {
    test('Should create user with unique email format', async () => {
      const clerkId = 'user_teacher_123';
      
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        clerkId,
        email: `user_${clerkId}@astralearn.local`,
        role: 'STUDENT'
      });

      await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer test_token');

      const createCall = prisma.user.create.mock.calls[0];
      expect(createCall[0].data.email).toMatch(/@astralearn\.local$/);
      expect(createCall[0].data.email).toContain('user_');
    });

    test('Should handle duplicate user gracefully', async () => {
      // First call returns the existing user (no creation needed)
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        clerkId: 'user_teacher_123',
        email: 'user_teacher_123@astralearn.local',
        role: 'TEACHER'
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(200);
      // User.create should not be called on subsequent request
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    test('Should return appropriate error when course not found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/courses/nonexistent')
        .set('Authorization', 'Bearer test_token')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
    });

    test('Should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/users/me'); // No Authorization header

      expect(response.status).toBe(401);
    });

    test('Should handle malformed courseId in ingestion', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'invalid-id-format',
          text: 'Content'
        });

      expect(response.status).toBe(404);
    });
  });
});
