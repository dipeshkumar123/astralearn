import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Mock course fetch
  await page.route('**/api/courses/*', async route => {
    const courseId = route.request().url().split('/').pop();
    const json = {
      id: courseId,
      title: 'E2E Test Course',
      description: 'A course used in E2E tests',
      sections: [
        {
          id: 'sec-1',
          title: 'Module One',
          position: 0,
          lessons: [
            { id: 'l1', title: 'Intro', description: 'Welcome', position: 0, videoUrl: 'https://example.com/video1.mp4' },
            { id: 'l2', title: 'Basics', description: 'Basics desc', position: 1, videoUrl: 'https://example.com/video2.mp4' },
          ],
        },
        {
          id: 'sec-2',
          title: 'Module Two',
          position: 1,
          lessons: [
            { id: 'l3', title: 'Advanced', description: 'Advanced desc', position: 0, videoUrl: 'https://example.com/video3.mp4' },
          ],
        },
      ],
      instructor: { id: 'u1', firstName: 'Test', lastName: 'Teacher', email: 'teacher@test.com' },
      _count: { enrollments: 0 },
    };
    await route.fulfill({ json });
  });

  // Mock AI chat
  await page.route('**/api/ai/chat', async route => {
    await route.fulfill({
      json: {
        answer: 'Mocked AI answer based on course materials.',
        sources: [
          { contentType: 'text', similarity: 0.87, chunkIndex: 0, content: 'Lorem ipsum...' },
        ],
        messageId: 'm1',
      },
    });
  });
});

test('Course page loads, sidebar renders, AI chat works', async ({ page }) => {
  await page.goto('/courses/test-course');

  // Title and current lesson header
  await expect(page.getByRole('heading', { name: 'E2E Test Course' })).toBeVisible();

  // Sidebar shows modules and lessons
  await expect(page.getByText('Course Content')).toBeVisible();
  await expect(page.getByText('Module One')).toBeVisible();
  await expect(page.getByText('Module Two')).toBeVisible();

  // Select a lesson from sidebar
  await page.getByText('Basics').click();
  await expect(page.getByText('Basics desc')).toBeVisible();

  // Switch to AI Tutor tab and ask a question
  await page.getByRole('button', { name: 'ai tutor' }).click();
  const input = page.getByPlaceholder('Ask a question...');
  await input.waitFor({ state: 'visible' });
  await input.fill('What will I learn?');
  // Fallback: locate send button by icon + text or form submit
  const sendButton = page.locator('form button:has(svg)').first();
  await sendButton.waitFor({ state: 'visible' });
  await sendButton.click();

  await expect(page.getByText('Mocked AI answer based on course materials.')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Sources:')).toBeVisible();
});
