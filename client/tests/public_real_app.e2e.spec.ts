import { test, expect } from '@playwright/test';

test.describe('Public Real App E2E', () => {
  test('landing page renders core CTA actions', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /Master Any Skill/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Learning Free/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Courses/i })).toBeVisible();
  });

  test('courses page filter form works and updates URL params', async ({ page }) => {
    await page.goto('http://localhost:5173/courses', { waitUntil: 'networkidle' });

    const searchInput = page.getByPlaceholder('Search by title or description');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('javascript');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page).toHaveURL(/search=javascript/);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page).toHaveURL(/\/courses$/);
  });

  test('real course detail page opens for a published course if present', async ({ page, request }) => {
    const res = await request.get('http://localhost:3000/api/courses');
    expect(res.ok()).toBeTruthy();
    const courses = await res.json();

    test.skip(!Array.isArray(courses) || courses.length === 0, 'No published courses available for detail-page check');

    const firstCourse = courses[0];
    await page.goto(`http://localhost:5173/courses/${firstCourse.id}`, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(new RegExp(`/courses/${firstCourse.id}$`));

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('Configuration Error');
    expect(bodyText).not.toContain('Something went wrong');
  });
});
