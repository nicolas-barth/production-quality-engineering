import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface EnvCheckResult {
  cloudflareBlocking: boolean;
  httpStatus: number;
  pageTitle: string;
  checkedAt: string;
  target: string;
}

export default async function globalSetup(): Promise<void> {
  const outPath = join(process.cwd(), 'playwright', 'env-check.json');

  if (process.env.MOCK === 'true') {
    const result: EnvCheckResult = {
      cloudflareBlocking: false,
      httpStatus: 0,
      pageTitle: '(mock mode — no network check)',
      checkedAt: new Date().toISOString(),
      target: 'https://demo.opencart.com',
    };
    writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
    console.log('\n[global-setup] MOCK MODE — local fixtures active. All tests will run.\n');
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let cloudflareBlocking = false;
  let httpStatus = 0;
  let pageTitle = '(navigation failed)';

  try {
    const response = await page.goto('https://demo.opencart.com/en-gb', {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });

    httpStatus = response?.status() ?? 0;
    pageTitle = await page.title();

    cloudflareBlocking =
      /just a moment|um momento|checking your browser|attention required/i.test(pageTitle) ||
      httpStatus === 403;
  } catch {
    cloudflareBlocking = true;
  } finally {
    await browser.close();
  }

  const result: EnvCheckResult = {
    cloudflareBlocking,
    httpStatus,
    pageTitle,
    checkedAt: new Date().toISOString(),
    target: 'https://demo.opencart.com',
  };

  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');

  console.log('\n[global-setup] Environment check:');
  console.log(`  Target:              ${result.target}`);
  console.log(`  HTTP status:         ${result.httpStatus}`);
  console.log(`  Page title:          "${result.pageTitle}"`);
  console.log(`  Cloudflare blocking: ${result.cloudflareBlocking}`);

  if (cloudflareBlocking) {
    console.log(
      '  → Tests will be SKIPPED (not failed) in this environment.\n' +
        '  → Run with MOCK=true for local execution: npm run test:mock\n' +
        '  → Push to GitHub Actions — CI runners are not blocked.\n',
    );
  } else {
    console.log('  → Site reachable. Tests will run.\n');
  }
}
