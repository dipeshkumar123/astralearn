// DB-backed integration tests using real Prisma models and seed data
// Assumes DATABASE_URL points to a dev Postgres and seed.js has been run (or we run it here)

const path = require('path');
const request = require('supertest');
const prisma = require('../../src/lib/prisma');
const app = require('../../src/app');

// Simple helper to ensure seed executed once
let seeded = false;

beforeAll(async () => {
  if (!seeded) {
    // Dynamically import seed script
    const seedPath = path.resolve(__dirname, '../../prisma/seed.js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(seedPath); // seed.js runs immediately
    // wait briefly for async completion (seed script disconnects prisma at end)
    await new Promise(r => setTimeout(r, 500));
    // Re-initialize prisma after seed since seed disconnected
    seeded = true;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Integration workflow', () => {
  test('Courses list returns published courses', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('Fetch single course includes sections and lessons', async () => {
    const course = await prisma.course.findFirst({});
    const res = await request(app).get(`/api/courses/${course.id}`);
    expect(res.status).toBe(200);
    expect(res.body.sections).toBeDefined();
    expect(res.body.sections.length).toBeGreaterThanOrEqual(1);
  });

  test('Teacher can create a new section', async () => {
    process.env.TEST_AUTH_CLERK_ID = 'user_teacher1';
    const course = await prisma.course.findFirst({ where: { instructorId: (await prisma.user.findFirst({ where: { clerkId: 'user_teacher1' } })).id } });
    const res = await request(app).post('/api/sections').send({ title: 'Integration Section', courseId: course.id });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Integration Section');
  });

  test('Student can submit quiz attempt', async () => {
    process.env.TEST_AUTH_CLERK_ID = 'user_student1';
    const quiz = await prisma.quiz.findFirst({});
    const questions = await prisma.question.findMany({ where: { quizId: quiz.id } });
    const answers = {};
    questions.forEach(q => { answers[q.id] = q.correctAnswer; });
    const res = await request(app).post(`/api/quizzes/${quiz.id}/attempt`).send({ answers, timeSpent: 55 });
    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
  });
});
