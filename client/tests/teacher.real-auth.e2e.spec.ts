import { test, expect } from '@playwright/test';

test.describe('Real Auth Teacher Journey', () => {
  test('teacher can access teacher studio with real Clerk session', async ({ page }) => {
    await page.goto('/teacher', { waitUntil: 'networkidle' });
    await expect(page.getByText(/Instructor Studio|Checking permissions/i)).toBeVisible();
    await page.waitForURL(/\/teacher$/, { timeout: 30_000 });
  });
});
