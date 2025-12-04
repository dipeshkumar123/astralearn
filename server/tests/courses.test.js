const request = require('supertest');
const prisma = require('../src/lib/prisma');

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

jest.mock('../src/lib/prisma');

const app = require('../src/index');

describe('Course Management Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/courses/instructor', () => {
    test('Should return teacher courses', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
      prisma.course.findMany.mockResolvedValue([
        {
          id: 'c1',
          title: 'Course 1',
          instructorId: 'u1',
          isPublished: true,
          thumbnail: 'https://example.com/thumb.jpg'
        },
        {
          id: 'c2',
          title: 'Course 2',
          instructorId: 'u1',
          isPublished: false,
          thumbnail: null
        }
      ]);

      const response = await request(app)
        .get('/api/courses/instructor')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('isPublished');
    });

    test('Should return empty array for new teacher with no courses', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
      prisma.course.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/courses/instructor')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/courses', () => {
    test('Should create a new course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.create.mockResolvedValue({
        id: 'c1',
        title: 'New Course',
        description: 'Description',
        instructorId: 'u1',
        isPublished: false
      });

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer test_token')
        .send({
          title: 'New Course',
          description: 'Description'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.instructorId).toBe('u1');
    });

    test('Should validate course title is required', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer test_token')
        .send({
          description: 'Description without title'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/courses/:courseId', () => {
    test('Should update course for owner', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });
      prisma.course.update.mockResolvedValue({
        id: 'c1',
        title: 'Updated Title',
        instructorId: 'u1'
      });

      const response = await request(app)
        .put('/api/courses/c1')
        .set('Authorization', 'Bearer test_token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    test('Should not allow non-owner to update course', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u2'
      });

      const response = await request(app)
        .put('/api/courses/c1')
        .set('Authorization', 'Bearer test_token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/courses/:courseId', () => {
    test('Should delete course for owner', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.course.findUnique.mockResolvedValue({
        id: 'c1',
        instructorId: 'u1'
      });
      prisma.course.delete.mockResolvedValue({ id: 'c1' });

      const response = await request(app)
        .delete('/api/courses/c1')
        .set('Authorization', 'Bearer test_token');

      expect(response.status).toBe(200);
      expect(prisma.course.delete).toHaveBeenCalled();
    });
  });
});
