import { test, expect } from '@playwright/test';

// Helper mock data
const courseMock = {
  id: 'course_e2e',
  title: 'E2E Testing Course',
  sections: [
    {
      id: 'section1',
      title: 'Module 1',
      lessons: [
        {
          id: 'lesson_video',
          title: 'Intro Video',
          description: 'Welcome lesson',
          type: 'video',
          videoUrl: 'https://example.com/video.mp4',
          muxPlaybackId: 'mockPlayback'
        },
        {
          id: 'lesson_quiz',
          title: 'Knowledge Check',
          description: 'Quiz lesson',
          type: 'quiz',
          content: {
            id: 'quiz1',
            title: 'Sample Quiz',
            passingScore: 60,
            timeLimit: null,
            questions: [
              {
                id: 'q1',
                question: 'What is 2 + 2?',
                type: 'multiple_choice',
                points: 5,
                options: ['3', '4', '5'],
                answer: '4'
              }
            ]
          }
        }
      ]
    }
  ],
  reviews: []
};

// Intercept helper
function mockApiRoutes(page) {
  page.route('**/api/courses/course_e2e', route => {
    route.fulfill({ status: 200, body: JSON.stringify(courseMock), headers: { 'Content-Type': 'application/json' } });
  });

  page.route('**/api/progress/lesson/*', route => {
    if (route.request().method() === 'POST') {
      route.fulfill({ status: 200, body: JSON.stringify({ status: 'marked' }) });
    } else if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 200, body: JSON.stringify({ status: 'unmarked' }) });
    } else {
      route.fulfill({ status: 405 });
    }
  });

  page.route('**/api/quizzes/*/attempt', route => {
    const req = route.request();
    req.postDataJSON();
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        passed: true,
        score: 100,
        earnedPoints: 5,
        totalPoints: 5,
        results: {
          q1: { correct: true, userAnswer: '4', correctAnswer: '4' }
        }
      })
    });
  });

  page.route('**/api/reviews', route => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      route.fulfill({ status: 201, body: JSON.stringify({ id: 'rev1', ...body }) });
    } else {
      route.fulfill({ status: 200, body: JSON.stringify([]) });
    }
  });
}

// The main test

test('Quiz attempt, review submission, progress mark/unmark flow', async ({ page }) => {
  mockApiRoutes(page);
  await page.goto('http://localhost:5173/courses/course_e2e');

  // Mark progress
  await page.getByTestId('mark-complete').click();
  await expect(page.getByTestId('unmark-complete')).toBeVisible();

  // Navigate to quiz lesson via sidebar text
  await page.getByText('Knowledge Check').click();

  // Select answer (first correct "4")
  await page.getByText('4').click();

  // Submit quiz
  await page.getByTestId('quiz-submit').click();
  await expect(page.getByText('Congratulations! You Passed!')).toBeVisible({ timeout: 10000 });

  // Go to Reviews tab
  await page.getByText('reviews').click();

  // Click 5th star (rating = 5)
  const stars = page.locator('button:has(svg)').nth(4); // zero-based
  await stars.click();

  await page.fill('textarea[placeholder="What did you think of the course?"]', 'Great course!');
  await page.getByTestId('review-submit').click();

  // Assert submit button re-enabled after submission
  await expect(page.getByTestId('review-submit')).toBeEnabled();

  // Return to overview tab and original lesson to unmark
  await page.getByText('overview').click();
  await page.getByText('Intro Video').click();
  await page.getByTestId('unmark-complete').click();
  await expect(page.getByTestId('mark-complete')).toBeVisible();
});
