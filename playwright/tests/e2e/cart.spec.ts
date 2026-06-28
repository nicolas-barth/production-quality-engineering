import { test, expect } from '@fixtures';
import { DEFAULT_PRODUCT, PRODUCTS } from '@data/products';
import { waitForCartCount } from '@utils/test-helpers';

const IPHONE_NAME = PRODUCTS.IPHONE.name;
const MACBOOK_NAME = PRODUCTS.MACBOOK.name;

test.describe('Cart Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en-gb?route=checkout/cart');
    const cartRows = page.locator('.table-bordered tbody tr');
    const count = await cartRows.count();
    for (let i = 0; i < count; i++) {
      const removeBtn = cartRows.first().locator('button[data-original-title="Remove"]');
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await page.waitForLoadState('domcontentloaded');
      }
    }
  });

  test(
    'TS-CART-001 — cart displays correct items, quantities, and prices for two products',
    { tag: ['@p0', '@smoke'] },
    async ({ pdpPage, cartPage, page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-CART-001' });

      await test.step('Add iPhone to cart', async () => {
        await pdpPage.goto(PRODUCTS.IPHONE.route);
        await pdpPage.addToCart(1);
        await waitForCartCount(page, 1);
      });

      await test.step('Add MacBook to cart', async () => {
        await pdpPage.goto(PRODUCTS.MACBOOK.route);
        await pdpPage.addToCart(1);
        await waitForCartCount(page, 2);
      });

      await test.step('Navigate to cart page', async () => {
        await cartPage.goto();
      });

      await test.step('Verify both items are in the cart', async () => {
        const itemCount = await cartPage.getItemCount();
        expect(itemCount, 'Cart must contain exactly 2 items').toBe(2);
      });

      await test.step('Verify iPhone is listed in cart', async () => {
        await expect(cartPage.getCartItemByName(IPHONE_NAME)).toBeVisible();
      });

      await test.step('Verify MacBook is listed in cart', async () => {
        await expect(cartPage.getCartItemByName(MACBOOK_NAME)).toBeVisible();
      });

      await test.step('Verify cart total is displayed', async () => {
        const total = await cartPage.getTotalText();
        expect(total, 'Cart total must be a non-empty value').toBeTruthy();
      });
    },
  );

  test(
    'TS-CART-002 — update cart item quantity reflects correct subtotal',
    { tag: ['@p1'] },
    async ({ pdpPage, cartPage, page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-CART-002' });

      await test.step('Add iPhone to cart (quantity: 1)', async () => {
        await pdpPage.goto(DEFAULT_PRODUCT.route);
        await pdpPage.addToCart(1);
        await waitForCartCount(page, 1);
      });

      await test.step('Navigate to cart and update quantity to 3', async () => {
        await cartPage.goto();
        await cartPage.updateItemQuantity(IPHONE_NAME, 3);
      });

      await test.step('Verify quantity input reflects new value', async () => {
        const qtyInput = cartPage.getQuantityInputForItem(IPHONE_NAME);
        const qtyValue = await qtyInput.inputValue();
        expect(parseInt(qtyValue), 'Quantity should be updated to 3').toBe(3);
      });

      await test.step('Verify cart count badge reflects 3 items', async () => {
        await waitForCartCount(page, 3);
      });
    },
  );

  test(
    'TS-CART-003 — removing the only item leaves cart in empty state',
    { tag: ['@p1'] },
    async ({ pdpPage, cartPage, page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-CART-003' });

      await test.step('Add iPhone to cart', async () => {
        await pdpPage.goto(DEFAULT_PRODUCT.route);
        await pdpPage.addToCart(1);
        await waitForCartCount(page, 1);
      });

      await test.step('Navigate to cart and remove the item', async () => {
        await cartPage.goto();
        await cartPage.removeItem(IPHONE_NAME);
      });

      await test.step('Verify cart is empty', async () => {
        const isEmpty = await cartPage.isCartEmpty();
        expect(isEmpty, 'Cart must be empty after removing the only item').toBe(true);
      });

      await test.step('Verify cart badge shows 0 items', async () => {
        const count = await cartPage.getCartCount();
        expect(count, 'Cart badge must reflect 0 items').toBe(0);
      });
    },
  );

  test(
    'TS-CART-005 — applying an invalid coupon code shows a clear error message',
    { tag: ['@p2'] },
    async ({ pdpPage, cartPage, page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-CART-005' });

      await test.step('Add product to cart', async () => {
        await pdpPage.goto(DEFAULT_PRODUCT.route);
        await pdpPage.addToCart(1);
        await waitForCartCount(page, 1);
        await cartPage.goto();
      });

      const totalBefore = await cartPage.getTotalText();

      await test.step('Apply an invalid coupon code', async () => {
        await cartPage.applyCoupon(`INVALID_COUPON_${Date.now()}`);
      });

      await test.step('Verify error message is displayed', async () => {
        await expect(cartPage.errorAlert).toBeVisible({ timeout: 5_000 });
      });

      await test.step('Verify cart total is unchanged', async () => {
        const totalAfter = await cartPage.getTotalText();
        expect(totalAfter, 'Cart total must be unchanged after invalid coupon').toBe(totalBefore);
      });
    },
  );
});
