import fs from 'node:fs';
import path from 'node:path';
import { clerkSetup } from '@clerk/testing/playwright';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readRootEnvValue(key: string): string {
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(rootEnvPath)) return '';
  const content = fs.readFileSync(rootEnvPath, 'utf-8');
  const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

export default async function globalSetup() {
  const publishableKey = readRootEnvValue('CLERK_PUBLISHABLE_KEY');
  const secretKey = readRootEnvValue('CLERK_SECRET_KEY');

  if (!publishableKey || !secretKey) {
    // Allow suite to skip gracefully if Clerk keys aren't available.
    return;
  }

  process.env.CLERK_SECRET_KEY = secretKey;
  await clerkSetup({ publishableKey, secretKey, dotenv: false });
}
