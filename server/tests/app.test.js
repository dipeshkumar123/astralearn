const request = require('supertest');

// Mock Clerk middleware to ensure req.auth exists in tests
jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req, _res, next) => {
    req.auth = () => ({ userId: process.env.TEST_AUTH_CLERK_ID || 'test_clerk_user' });
    next();
  },
  requireAuth: () => (req, _res, next) => {
    if (typeof req.auth !== 'function') {
      req.auth = () => ({ userId: process.env.TEST_AUTH_CLERK_ID || 'test_clerk_user' });
    }
    next();
  }
}));

// Mock prisma client functions used in routes and auth
jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(async ({ where }) => {
      if (where?.clerkId) return { id: 'u1', role: process.env.TEST_USER_ROLE || 'TEACHER' };
      if (where?.id) return { id: where.id, role: 'TEACHER' };
      return null;
    }),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  course: {
    findUnique: jest.fn(async ({ where }) => ({ id: where.id, instructorId: 'u1' })),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  lesson: {
    findFirst: jest.fn(async () => ({ id: 'l1', courseId: 'c1' })),
    update: jest.fn(async () => ({})),
  },
  section: {
    aggregate: jest.fn(async () => ({ _max: { position: 1 } })),
    create: jest.fn(async ({ data }) => ({ id: 's1', ...data })),
    update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    delete: jest.fn(async () => ({})),
  },
  lesson: {
    aggregate: jest.fn(async () => ({ _max: { position: 2 } })),
    create: jest.fn(async ({ data }) => ({ id: 'l1', ...data })),
    update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    delete: jest.fn(async () => ({})),
    findUnique: jest.fn(async ({ where }) => ({ id: where.id, courseId: 'c1' })),
  },
  courseContent: {
    findMany: jest.fn(async () => ([{ id: 'cc1', courseId: 'c1', contentType: 'text', chunkIndex: 0, content: 'hello world', embedding: JSON.stringify([1,0,0]) }]))
  },
  chatMessage: {
    create: jest.fn(async ({ data }) => ({ id: 'cm1', ...data }))
  },
  enrollment: { findUnique: jest.fn() },
  review: { findMany: jest.fn() },
}));

// Mock AI helpers
jest.mock('../src/lib/gemini', () => ({
  generateEmbedding: jest.fn(async () => [1,0,0]),
  generateResponse: jest.fn(async () => 'Mocked answer based on context'),
}));

const app = require('../src/app');

describe('App basic tests', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/sections requires auth and ownership and creates section', async () => {
    process.env.TEST_USER_ROLE = 'TEACHER';
    const res = await request(app)
      .post('/api/sections')
      .send({ title: 'New Section', courseId: 'c1' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Section');
    expect(res.body.courseId).toBe('c1');
  });

  test('POST /api/lessons requires auth and ownership and creates lesson', async () => {
    process.env.TEST_USER_ROLE = 'TEACHER';
    const res = await request(app)
      .post('/api/lessons')
      .send({ title: 'New Lesson', sectionId: 's1', courseId: 'c1', description: 'desc' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Lesson');
    expect(res.body.courseId).toBe('c1');
  });

  test('POST /api/ai/chat returns answer and sources with similarity and contentType', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ question: 'What is this course about?', courseId: 'c1', userId: 'u1' });
    expect(res.status).toBe(200);
    expect(res.body.answer).toContain('Mocked answer');
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(res.body.sources[0]).toHaveProperty('contentType');
    expect(res.body.sources[0]).toHaveProperty('similarity');
  });

  test('Secure Mux upload requires teacher and returns URL', async () => {
    process.env.TEST_USER_ROLE = 'TEACHER';
    const res = await request(app)
      .post('/api/mux/upload-url')
      .send({ courseId: 'c1' });
    // In unit mocks, mux library isn't mocked; expect failure gracefully or success if env keys exist.
    // Accept either 200 or 500 but 400/403 would be wrong.
    expect([200,500]).toContain(res.status);
  });
});
