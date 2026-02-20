import { Page, expect } from '@playwright/test';

export async function signInWithClerk(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
  await expect(emailInput).toBeVisible({ timeout: 30_000 });
  await emailInput.fill(email);

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  const passwordEnabled = await passwordInput.isEnabled();

  if (!passwordEnabled) {
    // Submit the identifier step through the active form only to avoid social-login buttons.
    await emailInput.press('Enter');
    await expect(passwordInput).toBeVisible({ timeout: 30_000 });
    await expect(passwordInput).toBeEnabled({ timeout: 30_000 });
  }

  await passwordInput.fill(password);

  const submitButton = page
    .getByRole('button', { name: /^Continue$|^Sign in$/i })
    .first();
  await submitButton.click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 45_000 });
}
