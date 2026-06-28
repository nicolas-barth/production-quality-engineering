import { readFileSync } from 'fs';
import { join } from 'path';

interface EnvCheck {
  cloudflareBlocking: boolean;
  httpStatus?: number;
  pageTitle?: string;
  checkedAt?: string;
  target?: string;
}

export function isCloudflareBlocking(): boolean {
  try {
    const raw = readFileSync(join(process.cwd(), 'playwright', 'env-check.json'), 'utf8');
    const json = JSON.parse(raw) as EnvCheck;
    return json.cloudflareBlocking === true;
  } catch {
    return false;
  }
}

export const CF_SKIP_REASON =
  'Cloudflare WAF is blocking automated access to demo.opencart.com in this environment. ' +
  'Push to GitHub Actions — CI runners have different IP addresses and are not affected. ' +
  'This is an environment constraint, not a test or code defect.';
