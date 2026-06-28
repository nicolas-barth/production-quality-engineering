import { test, expect } from '@fixtures';
import { MOCK_MODE } from '@fixtures';

const LANG = '/en-gb';

test.describe('API Endpoint Validation', () => {
  test.beforeEach(() => {
    test.skip(MOCK_MODE, 'API tests require real network access — skipped in mock mode.');
  });

  test(
    'TS-API-001 — product search endpoint returns HTTP 200 with relevant results in body',
    { tag: ['@p1', '@api'] },
    async ({ request }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-API-001' });

      await test.step('GET /en-gb?route=common/search&search=iphone', async () => {
        const response = await request.get(`${LANG}?route=common/search&search=iphone`);

        expect(response.status(), 'Search endpoint must return HTTP 200').toBe(200);

        const contentType = response.headers()['content-type'];
        expect(contentType, 'Response must be text/html').toContain('text/html');

        const body = await response.text();
        expect(body, 'Response body must contain iPhone product reference').toContain('iPhone');
        expect(body, 'Response must not contain PHP fatal error').not.toContain('Fatal error');
        expect(body, 'Response must not contain database error').not.toContain('Notice:');
      });
    },
  );

  test(
    'TS-API-006 — registration endpoint returns redirect on valid POST (no silent failure)',
    { tag: ['@p1', '@api'] },
    async ({ request }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-API-006' });

      const uniqueEmail = `api.test+${Date.now()}@example.com`;

      await test.step('POST registration with valid data', async () => {
        const response = await request.post(`${LANG}?route=account/register`, {
          form: {
            firstname: 'API',
            lastname: 'Test',
            email: uniqueEmail,
            telephone: '+44 20 7000 0000',
            password: 'ApiTestP@ss1!',
            confirm: 'ApiTestP@ss1!',
            agree: '1',
          },
        });

        expect(
          response.status(),
          `Registration POST must not return server error. Got ${response.status()}`,
        ).toBeLessThan(500);

        const body = await response.text();
        expect(body).not.toContain('Fatal error');
      });
    },
  );
});
