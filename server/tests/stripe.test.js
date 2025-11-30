const request = require('supertest');

jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req, _res, next) => { req.auth = () => ({ userId: process.env.TEST_AUTH_CLERK_ID || 'test_clerk_user' }); next(); },
  requireAuth: () => (req, _res, next) => { if (typeof req.auth !== 'function') { req.auth = () => ({ userId: process.env.TEST_AUTH_CLERK_ID || 'test_clerk_user' }); } next(); }
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: { create: jest.fn(async () => ({ id: 'cus_test' })) },
    checkout: { sessions: { create: jest.fn(async () => ({ url: 'https://stripe.test/session' })) } },
    webhooks: { constructEvent: jest.fn(() => ({ type: 'checkout.session.completed', data: { object: { metadata: { userId: 'u1', courseId: 'c1' } } } })) }
  }));
});

jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(async ({ where }) => {
      if (where.clerkId) return { id: 'u1', role: 'STUDENT', email: 'user@test.dev', stripeCustomerId: null };
      if (where.id) return { id: where.id, role: 'STUDENT', email: 'user@test.dev', stripeCustomerId: null };
      return null;
    }),
    update: jest.fn(async () => ({})),
  },
  course: {
    findUnique: jest.fn(async ({ where }) => ({ id: where.id, title: 'Stripe Test Course', description: 'Desc', price: 49.99 })),
  },
  purchase: { findUnique: jest.fn(async () => null), create: jest.fn(async () => ({ id: 'p1' })) },
  enrollment: { create: jest.fn(async () => ({ id: 'e1' })) }
}));

const app = require('../src/app');

describe('Stripe checkout', () => {
  test('POST /api/stripe/checkout creates session and returns url', async () => {
    const res = await request(app)
      .post('/api/stripe/checkout')
      .send({ courseId: 'c1' });
    expect(res.status).toBe(200);
    expect(res.body.url).toContain('https://stripe.test/session');
  });

  test('Duplicate purchase returns 400', async () => {
    // Mock purchase exists now
    const prisma = require('../src/lib/prisma');
    prisma.purchase.findUnique.mockResolvedValueOnce({ id: 'pExisting', userId: 'u1', courseId: 'c1' });
    const res = await request(app)
      .post('/api/stripe/checkout')
      .send({ courseId: 'c1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Already purchased/i);
  });
});
