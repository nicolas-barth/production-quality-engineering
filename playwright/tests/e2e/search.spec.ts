import { test, expect } from '@fixtures';

test.describe('Product Search and Discovery', () => {
  test(
    'TS-SEARCH-001 — keyword search returns relevant results',
    { tag: ['@p1', '@smoke'] },
    async ({ searchPage }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-SEARCH-001' });

      await test.step('Execute search for known product keyword', async () => {
        await searchPage.goto('iPhone');
      });

      await test.step('Verify results are displayed', async () => {
        const count = await searchPage.getResultCount();
        expect(count, 'Search for "iPhone" must return at least 1 result').toBeGreaterThan(0);
      });

      await test.step('Verify result contains the searched product', async () => {
        await expect(
          searchPage.resultProductCards.filter({ hasText: /iphone/i }).first(),
        ).toBeVisible();
      });
    },
  );

  test(
    'TS-SEARCH-002 — search for non-existent keyword shows no-results state',
    { tag: ['@p1'] },
    async ({ searchPage }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-SEARCH-002' },
          { type: 'Risk', description: 'RISK-020 (adjacent)' },
        );

      const nonExistentTerm = `ZZZUNKNOWNPRODUCT${Date.now()}`;

      await test.step('Search for a term with no matching products', async () => {
        await searchPage.goto(nonExistentTerm);
      });

      await test.step('Verify no-results message is displayed', async () => {
        const hasNoResults = await searchPage.hasNoResults();
        expect(hasNoResults, 'No-results message should be visible for unknown search term').toBe(
          true,
        );
      });

      await test.step('Verify no product cards are rendered', async () => {
        const count = await searchPage.getResultCount();
        expect(count, 'Result count should be 0 for non-existent product').toBe(0);
      });
    },
  );

  test(
    'TS-SEARCH-008 — category navigation renders products in the correct category',
    { tag: ['@p1'] },
    async ({ page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-SEARCH-008' });

      await test.step('Navigate to Phones & PDAs category via direct URL', async () => {
        await page.goto('/en-gb?route=product/category&path=24');
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Verify category heading is displayed', async () => {
        const heading = page.locator('#content h2').first();
        await expect(heading).toBeVisible();
      });

      await test.step('Verify product cards are rendered in the category page', async () => {
        const products = page.locator('.product-thumb');
        const count = await products.count();
        expect(count, 'Category page must display at least one product').toBeGreaterThan(0);
      });

      await test.step('Verify iPhone is listed in Phones & PDAs category', async () => {
        await expect(
          page
            .locator('.product-thumb')
            .filter({ hasText: /iphone/i })
            .first(),
        ).toBeVisible();
      });
    },
  );

  test(
    'TS-SEARCH-009 — mobile: hamburger menu navigation reaches subcategory page',
    { tag: ['@p1', '@mobile'] },
    async ({ page }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-SEARCH-009' },
          { type: 'Risk', description: 'RISK-002' },
        );

      await page.setViewportSize({ width: 375, height: 812 });

      await test.step('Navigate to homepage', async () => {
        await page.goto('/en-gb');
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Open mobile navigation menu', async () => {
        const hamburger = page.locator(
          'button[data-bs-toggle="collapse"], .navbar-toggler, button:has(.navbar-toggler-icon)',
        );
        await expect(hamburger).toBeVisible({ timeout: 5_000 });
        await hamburger.click();
      });

      await test.step('Navigate to a top-level category link', async () => {
        const categoryLink = page.locator('nav a[href*="route=product/category"]').first();
        await expect(categoryLink).toBeVisible({ timeout: 5_000 });
        await categoryLink.click();
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Verify category page loaded — products are accessible from mobile nav', async () => {
        const products = page.locator('.product-thumb');
        const count = await products.count();
        expect(
          count,
          'Mobile navigation must lead to a category page with at least one product',
        ).toBeGreaterThan(0);
      });
    },
  );
});
