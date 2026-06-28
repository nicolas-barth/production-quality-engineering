import { test, expect } from '@fixtures';
import { PRODUCTS, DEFAULT_PRODUCT } from '@data/products';
import { waitForCartCount } from '@utils/test-helpers';

test.describe('Product Detail Page', () => {
  test(
    'TS-PDP-001 — add in-stock product to cart increments cart badge',
    { tag: ['@p0', '@smoke'] },
    async ({ pdpPage, page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-PDP-001' });

      await test.step('Navigate to in-stock product (iPhone)', async () => {
        await pdpPage.goto(DEFAULT_PRODUCT.route);
      });

      await test.step('Verify product title is displayed', async () => {
        const title = await pdpPage.getTitle();
        expect(title?.trim(), 'Product title must be visible').toBeTruthy();
      });

      await test.step('Add product to cart', async () => {
        await pdpPage.addToCart(1);
      });

      await test.step('Verify success alert is shown', async () => {
        await expect(pdpPage.successAlert).toBeVisible();
        const alertText = await pdpPage.successAlert.textContent();
        expect(alertText).toContain(DEFAULT_PRODUCT.name);
      });

      await test.step('Verify cart count increments to 1', async () => {
        await waitForCartCount(page, 1);
      });
    },
  );

  test(
    'TS-PDP-002 — out-of-stock product Add-to-Cart button is disabled or absent',
    { tag: ['@p1'] },
    async ({ page }) => {
      test.info().annotations.push(
        { type: 'Scenario ID', description: 'TS-PDP-002' },
        { type: 'Risk', description: 'RISK-009' },
        {
          type: 'Note',
          description:
            'Demo catalog may not have an out-of-stock product — test verifies UI contract',
        },
      );

      await test.step('Navigate to HP LP3065 (monitor — verify stock status)', async () => {
        await page.goto(`/en-gb?route=${PRODUCTS.HP_LP3065.route}`);
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Verify stock status is visible to the user', async () => {
        const stockInfo = page.locator('ul.list-unstyled').filter({ hasText: /availability/i });
        await expect(stockInfo).toBeVisible();
      });

      await test.step('If out-of-stock, Add-to-Cart button must be disabled', async () => {
        const addToCartBtn = page.locator('#button-cart');
        const isEnabled = await addToCartBtn.isEnabled();
        const stockText = await page
          .locator('ul.list-unstyled')
          .filter({ hasText: /availability/i })
          .textContent();

        if (stockText?.toLowerCase().includes('out of stock')) {
          expect(isEnabled, 'Out-of-stock: Add-to-Cart must be disabled').toBe(false);
        } else {
          expect(isEnabled, 'In-stock: Add-to-Cart must be enabled').toBe(true);
        }
      });
    },
  );
});
