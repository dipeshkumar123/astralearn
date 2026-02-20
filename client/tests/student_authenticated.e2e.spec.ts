import { test, expect } from '@playwright/test';

test.describe('Authenticated Student Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async route => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/api/courses') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'student-course-1',
              title: 'JavaScript Foundations',
              description: 'Learn core JS concepts',
              category: 'Development',
              level: 'Beginner',
              price: 0,
              sections: [{ id: 's1', lessons: [{ id: 'l1' }, { id: 'l2' }] }],
            },
            {
              id: 'student-course-2',
              title: 'React in Practice',
              description: 'Build production UIs',
              category: 'Development',
              level: 'Intermediate',
              price: 49,
              sections: [{ id: 's2', lessons: [{ id: 'l3' }] }],
            },
          ]),
        });
      }

      if (url.includes('/api/users/me') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-student-1',
            role: 'STUDENT',
            enrollments: [
              {
                course: {
                  id: 'student-course-1',
                  title: 'JavaScript Foundations',
                  description: 'Learn core JS concepts',
                  category: 'Development',
                  level: 'Beginner',
                  price: 0,
                  sections: [{ id: 's1', lessons: [{ id: 'l1' }, { id: 'l2' }] }],
                },
              },
            ],
          }),
        });
      }

      if (url.includes('/api/users/user-student-1/stats') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            points: 240,
            currentStreak: 6,
            hoursLearned: 18,
          }),
        });
      }

      if (url.includes('/api/users/leaderboard') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'u1', firstName: 'Ava', lastName: 'Stone', points: 320, streak: 10, badges: ['Fast Learner'] },
            { id: 'u2', firstName: 'Noah', lastName: 'Kim', points: 280, streak: 8, badges: [] },
          ]),
        });
      }

      if (url.includes('/api/reviews/stats/') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ average: 4.7, count: 12 }),
        });
      }

      return route.continue();
    });
  });

  test('student can open dashboard and switch between browse/my courses', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByText(/day streak/i).first()).toBeVisible();
    await expect(page.getByText(/points/i).first()).toBeVisible();

    await page.getByRole('button', { name: 'My Courses' }).click();
    await expect(page.getByText(/No enrollments yet/i)).toBeVisible();

    await page.getByRole('button', { name: 'Browse', exact: true }).click();
    await expect(page.getByText('JavaScript Foundations')).toBeVisible();
    await expect(page.getByText('React in Practice')).toBeVisible();
  });
});
