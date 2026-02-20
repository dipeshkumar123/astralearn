import { test, expect } from '@playwright/test';

test.describe('Real Auth Student Journey', () => {
  test('student can access dashboard with real Clerk session', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
