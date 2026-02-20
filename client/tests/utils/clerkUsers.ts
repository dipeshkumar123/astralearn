import fs from 'node:fs';
import path from 'node:path';

function readRootEnvValue(key: string): string {
  const rootEnvPath = path.resolve(__dirname, '../../../.env');
  if (!fs.existsSync(rootEnvPath)) return '';
  const content = fs.readFileSync(rootEnvPath, 'utf-8');
  const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

export async function createClerkUser(email: string, firstName: string, lastName: string) {
  const secretKey = process.env.CLERK_SECRET_KEY || readRootEnvValue('CLERK_SECRET_KEY');
  if (!secretKey) throw new Error('Missing CLERK_SECRET_KEY for Clerk user creation');

  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [email],
      // Some Clerk instances require passwords at user creation even if tests use ticket sign-in.
      password: `E2E!${Date.now()}_${Math.random().toString(16).slice(2)}`,
      first_name: firstName,
      last_name: lastName,
      skip_password_checks: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create Clerk user (${res.status}): ${text}`);
  }

  return res.json();
}
