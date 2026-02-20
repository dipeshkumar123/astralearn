import { test } from '@playwright/test';
import fs from 'node:fs';
import { clerk } from '@clerk/testing/playwright';
import { createClerkUser } from './utils/clerkUsers';

test('authenticate student and store session', async ({ page }) => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  test.skip(!secretKey, 'Missing CLERK_SECRET_KEY; cannot run real auth setup.');

  const stamp = Date.now();
  const email = `e2e.student.${stamp}@example.com`;
  await createClerkUser(email, 'E2E', 'Student');

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await clerk.signIn({ page, emailAddress: email });
  await page.goto('/onboard?role=STUDENT', { waitUntil: 'networkidle' });

  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: 'playwright/.auth/student.json' });
});
