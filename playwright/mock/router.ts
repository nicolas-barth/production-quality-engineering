import { Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES_DIR = join(__dirname, 'fixtures');

function html(name: string): string {
  return readFileSync(join(FIXTURES_DIR, `${name}.html`), 'utf8');
}

interface RouteEntry {
  pattern: RegExp;
  fixture: string;
}

// Order matters — more specific patterns must come before generic ones
const ROUTES: RouteEntry[] = [
  { pattern: /product_id=40/, fixture: 'product-iphone' },
  { pattern: /product_id=43/, fixture: 'product-macbook' },
  { pattern: /product_id=47/, fixture: 'product-hp-lp3065' },
  { pattern: /route=common\/search.*search=iphone/i, fixture: 'search-results' },
  { pattern: /route=common\/search/, fixture: 'search-empty' },
  { pattern: /route=checkout\/cart/, fixture: 'cart' },
  { pattern: /route=checkout\/success/, fixture: 'order-success' },
  { pattern: /route=checkout\/checkout/, fixture: 'checkout' },
  { pattern: /route=account\/success/, fixture: 'register-success' },
  { pattern: /route=account\/register/, fixture: 'register' },
  { pattern: /route=account\/logout/, fixture: 'login' },
  { pattern: /route=account\/login/, fixture: 'login' },
  { pattern: /route=account\/account/, fixture: 'account' },
  { pattern: /route=product\/category/, fixture: 'category-phones' },
  { pattern: /route=common\/home/, fixture: 'home' },
];

export async function setupMockRouter(page: Page): Promise<void> {
  // Handle the country/region AJAX cascade that CheckoutPage.fillBillingAddress() waits for.
  // The response URL must include 'country' and return HTTP 200 for the waitForResponse() guard.
  await page.route('**/localisation/country**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        zone_status: '1',
        zone: [
          { zone_id: '2644', name: 'Greater London' },
          { zone_id: '2645', name: 'England' },
          { zone_id: '2646', name: 'Scotland' },
          { zone_id: '2647', name: 'Wales' },
          { zone_id: '2648', name: 'Northern Ireland' },
        ],
      }),
    });
  });

  await page.route('**/en-gb**', (route) => {
    const url = route.request().url();
    const match = ROUTES.find((r) => r.pattern.test(url));
    void route.fulfill({
      status: 200,
      contentType: 'text/html; charset=UTF-8',
      body: html(match?.fixture ?? 'home'),
    });
  });

  await page.route('**/en-gb', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'text/html; charset=UTF-8',
      body: html('home'),
    });
  });

  // Silently absorb static assets so the browser doesn't log 404 warnings
  await page.route(/\.(css|js|png|jpe?g|gif|ico|svg|woff2?|ttf|eot)(\?.*)?$/, (route) => {
    void route.fulfill({ status: 200, body: '' });
  });
}
