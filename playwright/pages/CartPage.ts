import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('checkout/cart');
    await this.waitForPageLoad();
  }

  // ─── Cart State ───────────────────────────────────────────────────────────

  get emptyCartMessage(): Locator {
    return this.page.locator('#content p').filter({ hasText: /your shopping cart is empty/i });
  }

  get cartTable(): Locator {
    return this.page.locator('.table-bordered');
  }

  get cartRows(): Locator {
    return this.page.locator('.table-bordered tbody tr');
  }

  // ─── Cart Items ───────────────────────────────────────────────────────────

  getCartItemByName(productName: string): Locator {
    return this.cartRows.filter({ hasText: productName });
  }

  getQuantityInputForItem(productName: string): Locator {
    return this.getCartItemByName(productName).locator('input[name^="quantity"]');
  }

  getUpdateButtonForItem(productName: string): Locator {
    return this.getCartItemByName(productName).locator('button[data-original-title="Update"]');
  }

  getRemoveButtonForItem(productName: string): Locator {
    return this.getCartItemByName(productName).locator('button[data-original-title="Remove"]');
  }

  // ─── Order Summary ────────────────────────────────────────────────────────

  get subTotal(): Locator {
    return this.page
      .locator('#content')
      .getByText(/sub-total/i)
      .locator('..')
      .locator('td')
      .last();
  }

  get totalAmount(): Locator {
    return this.page
      .locator('#content')
      .getByText(/total/i)
      .last()
      .locator('..')
      .locator('td')
      .last();
  }

  get couponInput(): Locator {
    return this.page.locator('#input-coupon');
  }

  get applyCouponButton(): Locator {
    return this.page.locator('#button-coupon');
  }

  get voucherInput(): Locator {
    return this.page.locator('#input-voucher');
  }

  get applyVoucherButton(): Locator {
    return this.page.locator('#button-voucher');
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  get proceedToCheckoutButton(): Locator {
    return this.page.locator('a[href*="route=checkout/checkout"]').filter({ hasText: /checkout/i });
  }

  get continueShoppingLink(): Locator {
    return this.page.locator('a[href*="route=common/home"]').filter({ hasText: /continue/i });
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async updateItemQuantity(productName: string, newQuantity: number): Promise<void> {
    const input = this.getQuantityInputForItem(productName);
    await input.clear();
    await input.fill(newQuantity.toString());
    await this.getUpdateButtonForItem(productName).click();
    await this.waitForPageLoad();
  }

  async removeItem(productName: string): Promise<void> {
    await this.getRemoveButtonForItem(productName).click();
    await this.waitForPageLoad();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
    await this.waitForPageLoad();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
    await this.waitForPageLoad();
  }

  async isCartEmpty(): Promise<boolean> {
    return this.emptyCartMessage.isVisible();
  }

  async getItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async getTotalText(): Promise<string | null> {
    return this.totalAmount.textContent();
  }
}
