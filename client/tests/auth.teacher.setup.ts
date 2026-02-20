import { test } from '@playwright/test';
import fs from 'node:fs';
import { clerk } from '@clerk/testing/playwright';
import { createClerkUser } from './utils/clerkUsers';

test('authenticate teacher and store session', async ({ page }) => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  test.skip(!secretKey, 'Missing CLERK_SECRET_KEY; cannot run real auth setup.');

  const stamp = Date.now();
  const email = `e2e.teacher.${stamp}@example.com`;
  await createClerkUser(email, 'E2E', 'Teacher');

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await clerk.signIn({ page, emailAddress: email });
  // Ensure our backend user role is flipped before hitting /teacher (TeacherGuard relies on /api/users/me).
  const token = await page.evaluate(async () => {
    if (!window.Clerk?.session) return null;
    return window.Clerk.session.getToken();
  });

  test.skip(!token, 'Missing Clerk session token in browser context.');

  const resp = await page.request.patch('http://localhost:3000/api/users/me/role', {
    data: { role: 'TEACHER' },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) {
    throw new Error(`Failed to set teacher role: ${resp.status()} ${await resp.text()}`);
  }

  const me = await page.request.get('http://localhost:3000/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!me.ok()) {
    throw new Error(`Failed to verify role via /api/users/me: ${me.status()} ${await me.text()}`);
  }
  const meJson = await me.json();
  if (meJson?.role !== 'TEACHER') {
    throw new Error(`Role verification failed: expected TEACHER, got ${meJson?.role}`);
  }

  await page.goto('/teacher', { waitUntil: 'networkidle' });

  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: 'playwright/.auth/teacher.json' });
});
