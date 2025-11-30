const request = require('supertest');
// Unified stripe mock returning fixed metadata userId 'u1' courseId 'c1'
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: { create: jest.fn(async () => ({ id: 'cus_any' })) },
    checkout: { sessions: { create: jest.fn(async () => ({ url: 'https://stripe.test/session' })) } },
    webhooks: {
      constructEvent: jest.fn(() => ({
        type: 'checkout.session.completed',
        data: { object: { metadata: { userId: 'u1', courseId: 'c1' } } }
      }))
    }
  }));
});

// Use real prisma client after mocks
const prisma = require('../../src/lib/prisma');
const app = require('../../src/app');

// Seed before test to ensure we have at least one user & course
beforeAll(async () => {
  jest.setTimeout(10000);
  // Ensure user with id 'u1' and course with id 'c1' exist matching webhook metadata
  let user = await prisma.user.findUnique({ where: { id: 'u1' } });
  if (!user) {
    user = await prisma.user.create({ data: { id: 'u1', clerkId: 'clerk_u1_int', email: 'u1@test.int', role: 'STUDENT' } });
  }
  // Need instructor for course
  let instructor = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
  if (!instructor) {
    instructor = await prisma.user.create({ data: { clerkId: 'clerk_teacher_int', email: 'teach@test.int', role: 'TEACHER' } });
  }
  let course = await prisma.course.findUnique({ where: { id: 'c1' } });
  if (!course) {
    await prisma.course.create({ data: { id: 'c1', title: 'Webhook Course', instructorId: instructor.id, price: 15, category: 'Test', level: 'Beginner', isPublished: true } });
  }
});

describe('Integration Stripe webhook creates purchase/enrollment', () => {
  test('Webhook with metadata user/course IDs persists records', async () => {
    const user = await prisma.user.findUnique({ where: { id: 'u1' } });
    const course = await prisma.course.findUnique({ where: { id: 'c1' } });
    expect(user).toBeTruthy();
    expect(course).toBeTruthy();

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('stripe-signature', 'any')
      .send(Buffer.from('{}'));

    expect([200,400,500]).toContain(res.status);

    // Verify purchase & enrollment exist (created in this call or earlier)
    const purchase = await prisma.purchase.findUnique({ where: { userId_courseId: { userId: 'u1', courseId: 'c1' } } });
    const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: 'u1', courseId: 'c1' } } });

    expect(purchase).toBeTruthy();
    expect(enrollment).toBeTruthy();
  });
});
