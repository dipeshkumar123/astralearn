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
        create: jest.fn().mockResolvedValue({ id: 'upload_123', url: 'https://upload.mux.com/upload_123' }),
        get: jest.fn().mockResolvedValue({ id: 'upload_123', url: 'https://upload.mux.com/upload_123' }),
        cancel: jest.fn().mockResolvedValue({ id: 'upload_123' }),
      },
      assets: {
        get: jest.fn().mockResolvedValue({ id: 'asset_123', status: 'ready' }),
        retrieve: jest.fn().mockResolvedValue({ id: 'asset_123', status: 'ready', playback_ids: [{ id: 'playback_123' }] }),
        delete: jest.fn().mockResolvedValue({ id: 'asset_123' }),
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
  enrollment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  progress: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const request = require('supertest');
const prisma = require('../src/lib/prisma');
const app = require('../src/index');

describe('Authentication & Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Authentication', () => {
    test('Should auto-create user on first API call', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null); // First call returns null
      prisma.user.create.mockResolvedValueOnce({
        id: 'u1',
        clerkId: 'user_test123',
        email: 'user_test123@astralearn.local',
        role: 'STUDENT'
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer test_token');

      expect(prisma.user.create).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('Should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
    });

    test('Should use unique email format for new users', async () => {
      const clerkId = 'user_test123';
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValueOnce({
        id: 'u1',
        clerkId,
        email: `user_${clerkId}@astralearn.local`,
        role: 'STUDENT'
      });

      await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer test_token');

      const createCall = prisma.user.create.mock.calls[0];
      expect(createCall[0].data.email).toContain('@astralearn.local');
    });
  });

  describe('Course Ownership Security', () => {
    test('Teacher should only be able to edit their own courses', async () => {
      const teacherId = 'u1';
      const courseId = 'c1';

      prisma.user.findUnique.mockResolvedValue({ id: teacherId });
      prisma.course.findUnique.mockResolvedValue({
        id: courseId,
        instructorId: 'u2' // Different instructor
      });

      const response = await request(app)
        .patch(`/api/courses/${courseId}`)
        .set('Authorization', 'Bearer test_token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not course instructor');
    });

    test('Teacher should be able to edit their own courses', async () => {
      const teacherId = 'u1';
      const courseId = 'c1';

      prisma.user.findUnique.mockResolvedValue({ id: teacherId });
      prisma.course.findUnique.mockResolvedValue({
        id: courseId,
        instructorId: teacherId // Same instructor
      });
      prisma.course.update.mockResolvedValue({
        id: courseId,
        title: 'Updated Title'
      });

      const response = await request(app)
        .patch(`/api/courses/${courseId}`)
        .set('Authorization', 'Bearer test_token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
    });
  });

  describe('AI Content Ingestion Security', () => {
    test('Teacher cannot index content to courses they do not own', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2' // Different instructor
      });

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          text: 'Sample content'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    test('Teacher can index content to their own courses', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1' // Same instructor
      });

      // Mock content processor
      jest.mock('../src/lib/content-processor', () => ({
        processText: jest.fn().mockResolvedValue([
          { content: 'chunk 1', startIndex: 0, endIndex: 50 }
        ])
      }));

      const response = await request(app)
        .post('/api/ai/ingest-text')
        .set('Authorization', 'Bearer test_token')
        .send({
          courseId: 'c1',
          text: 'Sample content'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Role-Based Access Control', () => {
    test('Student should not access teacher endpoints', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        role: 'STUDENT'
      });

      const response = await request(app)
        .post('/api/mux/upload-url')
        .set('Authorization', 'Bearer test_token')
        .send({ courseId: 'c1' });

      expect(response.status).toBe(403);
    });

    test('Teacher can access teacher-only endpoints', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        role: 'TEACHER'
      });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });

      // Mock Mux client - the mock returns the constructor function
      const mockMux = require('@mux/mux-node');
      const muxInstance = mockMux();
      muxInstance.video.uploads.create.mockResolvedValue({
        id: 'upload_123',
        url: 'https://upload.mux.com/upload_123'
      });

      const response = await request(app)
        .post('/api/mux/upload-url')
        .set('Authorization', 'Bearer test_token')
        .send({ courseId: 'c1' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uploadUrl');
    });
  });
});
