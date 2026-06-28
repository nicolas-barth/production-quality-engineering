import { Page, expect } from '@playwright/test';

export function generateUniqueEmail(prefix = 'qa.test'): string {
  return `${prefix}+${Date.now()}@example.com`;
}

export function generateUniqueUsername(): string {
  return `TestUser${Date.now()}`;
}

export async function waitForSuccessAlert(page: Page, timeout = 10_000): Promise<string | null> {
  const alert = page.locator('.alert-success');
  await alert.waitFor({ state: 'visible', timeout });
  return alert.textContent();
}

export async function waitForErrorAlert(page: Page, timeout = 5_000): Promise<string | null> {
  const alert = page.locator('.alert-danger');
  await alert.waitFor({ state: 'visible', timeout });
  return alert.textContent();
}

export async function waitForCartCount(
  page: Page,
  expectedCount: number,
  timeout = 10_000,
): Promise<void> {
  const cartBadge = page.locator('#cart-total');
  await expect(cartBadge).toContainText(expectedCount.toString(), { timeout });
}

export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function assertFieldError(page: Page, fieldId: string): Promise<void> {
  const errorLocator = page.locator(`#error-${fieldId}, [class*="text-danger"]`).first();
  await expect(errorLocator).toBeVisible();
}

export async function captureEvidence(page: Page, name: string): Promise<Buffer> {
  return page.screenshot({ fullPage: true, path: `test-results/${name}.png` });
}
