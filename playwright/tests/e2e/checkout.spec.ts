import { test, expect } from '@fixtures';
import { generateGuestEmail } from '@data/users';
import { DEFAULT_PRODUCT } from '@data/products';
import { UK_ADDRESS } from '@data/addresses';
import { waitForCartCount } from '@utils/test-helpers';

async function prepareCheckout(
  pdpPage: { goto: (r: string) => Promise<void>; addToCart: (q: number) => Promise<void> },
  cartPage: { goto: () => Promise<void>; proceedToCheckout: () => Promise<void> },
  page: import('@playwright/test').Page,
): Promise<void> {
  await pdpPage.goto(DEFAULT_PRODUCT.route);
  await pdpPage.addToCart(1);
  await waitForCartCount(page, 1);
  await cartPage.goto();
  await cartPage.proceedToCheckout();
}

test.describe('Guest Checkout', () => {
  test(
    'TS-CHKOUT-001 — complete guest checkout end-to-end on all browsers and viewports',
    { tag: ['@p0', '@smoke', '@critical'] },
    async ({ pdpPage, cartPage, checkoutPage, page }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-CHKOUT-001' },
          { type: 'Risk', description: 'RISK-004, RISK-006, RISK-008' },
        );

      const guestEmail = generateGuestEmail();

      await test.step('Add product to cart', async () => {
        await prepareCheckout(pdpPage, cartPage, page);
      });

      await test.step('Complete full guest checkout flow', async () => {
        const orderId = await checkoutPage.completeGuestCheckout(guestEmail, UK_ADDRESS);
        expect(orderId, 'Order ID must be returned after successful checkout').toBeTruthy();
      });

      await test.step('Verify order success page is displayed', async () => {
        await expect(checkoutPage.orderSuccessHeading).toBeVisible({ timeout: 20_000 });
        await expect(page).toHaveURL(/route=checkout\/success/);
      });

      await test.step('Verify cart is cleared after successful order', async () => {
        const cartCount = await checkoutPage.getCartCount();
        expect(cartCount, 'Cart must be empty after order placement').toBe(0);
      });
    },
  );

  test(
    'TS-CHKOUT-002 — checkout billing address validation — required fields cannot be empty',
    { tag: ['@p1'] },
    async ({ pdpPage, cartPage, checkoutPage, page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-CHKOUT-002' });

      await test.step('Add product and navigate to checkout', async () => {
        await prepareCheckout(pdpPage, cartPage, page);
      });

      await test.step('Select guest checkout option', async () => {
        await checkoutPage.selectGuestCheckout(generateGuestEmail());
      });

      await test.step('Submit billing form with all required fields empty', async () => {
        await checkoutPage.step2ContinueButton.click();
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('Verify validation errors are shown for required fields', async () => {
        const errors = checkoutPage.billingFormErrors;
        const errorCount = await errors.count();
        expect(
          errorCount,
          'Required field validation errors must appear when billing form is submitted empty',
        ).toBeGreaterThan(0);
      });

      await test.step('Verify user remains on billing step — form did not proceed', async () => {
        await expect(checkoutPage.firstNameInput).toBeVisible();
      });
    },
  );

  test(
    'TS-CHKOUT-007 — full guest checkout completes at 375px mobile viewport',
    { tag: ['@p1', '@mobile'] },
    async ({ pdpPage, cartPage, checkoutPage, page }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-CHKOUT-007' },
          { type: 'Risk', description: 'RISK-008' },
        );

      await page.setViewportSize({ width: 375, height: 812 });

      const guestEmail = generateGuestEmail();

      await test.step('Add product to cart at mobile viewport', async () => {
        await pdpPage.goto(DEFAULT_PRODUCT.route);
        await pdpPage.addToCartButton.scrollIntoViewIfNeeded();
        await pdpPage.addToCart(1);
        await waitForCartCount(page, 1);
      });

      await test.step('Navigate to cart and proceed to checkout at mobile', async () => {
        await cartPage.goto();
        await cartPage.proceedToCheckoutButton.scrollIntoViewIfNeeded();
        await cartPage.proceedToCheckout();
      });

      await test.step('Complete full guest checkout flow at 375px', async () => {
        const orderId = await checkoutPage.completeGuestCheckout(guestEmail, UK_ADDRESS);
        expect(orderId, 'Checkout must succeed at 375px viewport').toBeTruthy();
      });

      await test.step('Verify order success page renders at mobile viewport', async () => {
        await expect(checkoutPage.orderSuccessHeading).toBeVisible({ timeout: 20_000 });
      });
    },
  );
});
