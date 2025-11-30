const request = require('supertest');

jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req, _res, next) => { req.auth = () => ({ userId: 'clerk_student' }); next(); },
  requireAuth: () => (req, _res, next) => { if (typeof req.auth !== 'function') req.auth = () => ({ userId: 'clerk_student' }); next(); }
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn((body, sig, secret) => ({
        type: 'checkout.session.completed',
        data: { object: { metadata: { userId: 'uWH', courseId: 'cWH' } } }
      }))
    }
  }));
});

jest.mock('../src/lib/prisma', () => ({
  purchase: { create: jest.fn(async () => ({ id: 'pWH' })) },
  enrollment: { create: jest.fn(async () => ({ id: 'eWH' })) },
}));

const app = require('../src/app');

describe('Stripe webhook simulation', () => {
  test('Webhook creates purchase and enrollment', async () => {
    const rawBody = Buffer.from(JSON.stringify({ dummy: true }));
    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('stripe-signature', 'testsig')
      .send(rawBody);
    expect(res.status).toBe(200);
    const prisma = require('../src/lib/prisma');
    expect(prisma.purchase.create).toHaveBeenCalled();
    expect(prisma.enrollment.create).toHaveBeenCalled();
  });
});
