const request = require('supertest');

jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req, _res, next) => { req.auth = () => ({ userId: 'clerk_student' }); next(); },
  requireAuth: () => (req, _res, next) => { if (typeof req.auth !== 'function') req.auth = () => ({ userId: 'clerk_student' }); next(); }
}));

// Mock prisma for quiz fail scenario
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: { findUnique: jest.fn(async () => ({ id: 'uFail' })) },
    quiz: { findUnique: jest.fn(async () => ({ id: 'qFail', passingScore: 70, questions: [ { id: 'q1', points: 5, correctAnswer: 'A' }, { id: 'q2', points: 5, correctAnswer: 'B' } ] })) },
    quizAttempt: { create: jest.fn(async (data) => ({ id: 'attemptFail', ...data })) }
  }))
}));

const app = require('../src/app');

describe('Quiz failure grading', () => {
  test('POST /api/quizzes/qFail/attempt with wrong answers yields not passed', async () => {
    const res = await request(app)
      .post('/api/quizzes/qFail/attempt')
      .send({ answers: { q1: 'X', q2: 'Y' } });
    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.score).toBe(0);
    expect(res.body.totalPoints).toBe(10);
  });
});
