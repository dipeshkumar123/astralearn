import type { PlaywrightTestConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readRootClerkPublishableKey(): string {
  const rootEnvPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(rootEnvPath)) return '';
  const content = fs.readFileSync(rootEnvPath, 'utf-8');
  const match = content.match(/^CLERK_PUBLISHABLE_KEY=(.+)$/m);
  return match ? match[1].trim() : '';
}

const clerkPublishableKey = readRootClerkPublishableKey();

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  globalSetup: './tests/global.clerk.setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: [
    {
      command: 'npm start',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: false,
      timeout: 120_000,
      cwd: '../server',
      env: {
        PORT: '3000',
      },
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        VITE_CLERK_PUBLISHABLE_KEY: clerkPublishableKey,
        VITE_E2E_AUTH_BYPASS: '0',
      },
    },
  ],
  projects: [
    {
      name: 'setup-student',
      testMatch: /auth\.student\.setup\.ts/,
    },
    {
      name: 'setup-teacher',
      testMatch: /auth\.teacher\.setup\.ts/,
    },
    {
      name: 'real-auth-student',
      testMatch: /student\.real-auth\.e2e\.spec\.ts/,
      dependencies: ['setup-student'],
      use: {
        storageState: 'playwright/.auth/student.json',
      },
    },
    {
      name: 'real-auth-teacher',
      testMatch: /teacher\.real-auth\.e2e\.spec\.ts/,
      dependencies: ['setup-teacher'],
      use: {
        storageState: 'playwright/.auth/teacher.json',
      },
    },
  ],
};

export default config;
