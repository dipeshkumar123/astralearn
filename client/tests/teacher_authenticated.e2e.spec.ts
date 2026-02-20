import { test, expect } from '@playwright/test';

test.describe('Authenticated Teacher Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async route => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/api/courses/instructor') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 't-course-1',
              title: 'Full Stack TypeScript',
              isPublished: true,
              sections: [
                { id: 'sec-1', lessons: [{ id: 'les-1' }, { id: 'les-2' }] },
                { id: 'sec-2', lessons: [{ id: 'les-3' }] },
              ],
            },
            {
              id: 't-course-2',
              title: 'System Design Essentials',
              isPublished: false,
              sections: [{ id: 'sec-3', lessons: [{ id: 'les-4' }] }],
            },
          ]),
        });
      }

      return route.continue();
    });
  });

  test('teacher can open studio and navigate to AI ingestion', async ({ page }) => {
    await page.goto('http://localhost:5173/teacher', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /Instructor Studio/i })).toBeVisible();
    await expect(page.getByText('Total Courses')).toBeVisible();
    await expect(page.getByText('Lessons Created')).toBeVisible();

    await page.getByRole('link', { name: /AI Ingestion/i }).click();
    await expect(page).toHaveURL(/\/teacher\/content-ingestion$/);
    await expect(page.getByRole('heading', { name: /AI Content Indexing/i })).toBeVisible();
  });
});
