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
    findFirst: jest.fn(),
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

const request = require('supertest');
const prisma = require('../src/lib/prisma');
const app = require('../src/index');

describe('Video Upload & Mux Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/mux/upload-url', () => {
    test('Should generate upload URL for teacher', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });

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
      expect(response.body).toHaveProperty('uploadId');
      expect(response.body).toHaveProperty('uploadUrl');
      expect(response.body.uploadId).toBe('upload_123');
    });

    test('Should reject if teacher does not own course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2' // Different instructor
      });

      const response = await request(app)
        .post('/api/mux/upload-url')
        .set('Authorization', 'Bearer test_token')
        .send({ courseId: 'c1' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not course instructor');
    });

    test('Should require courseId parameter', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });

      const response = await request(app)
        .post('/api/mux/upload-url')
        .set('Authorization', 'Bearer test_token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('courseId');
    });

    test('Should return 404 if course not found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
      prisma.course.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/mux/upload-url')
        .set('Authorization', 'Bearer test_token')
        .send({ courseId: 'nonexistent' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/mux/asset/:assetId', () => {
    test('Should retrieve asset status', async () => {
      const mockMux = require('@mux/mux-node');
      const muxInstance = mockMux();
      muxInstance.video.assets.retrieve.mockResolvedValue({
        id: 'asset_123',
        status: 'ready',
        playback_ids: [{ id: 'playback_123' }],
        duration: 120
      });

      const response = await request(app)
        .get('/api/mux/asset/asset_123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body.playbackId).toBe('playback_123');
      expect(response.body.duration).toBe(120);
    });

    test('Should handle asset not found', async () => {
      const mockMux = require('@mux/mux-node');
      const muxInstance = mockMux();
      muxInstance.video.assets.retrieve.mockRejectedValue(
        new Error('Asset not found')
      );

      const response = await request(app)
        .get('/api/mux/asset/nonexistent');

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/mux/asset/:assetId', () => {
    test('Should delete asset for course owner', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.lesson.findFirst.mockResolvedValue({
        id: 'l1',
        courseId: 'c1'
      });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });
      prisma.lesson.update.mockResolvedValue({ id: 'l1' });

      const mockMux = require('@mux/mux-node').default;
      mockMux().video.assets.delete.mockResolvedValue({});

      const response = await request(app)
        .delete('/api/mux/asset/asset_123')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(prisma.lesson.update).toHaveBeenCalled();
    });

    test('Should reject if not course owner', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.lesson.findFirst.mockResolvedValue({
        id: 'l1',
        courseId: 'c1'
      });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2' // Different owner
      });

      const response = await request(app)
        .delete('/api/mux/asset/asset_123')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(403);
    });
  });
});
