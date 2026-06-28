import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('account/account');
    await this.waitForPageLoad();
  }

  // ─── Account Dashboard Links ──────────────────────────────────────────────

  get orderHistoryLink(): Locator {
    return this.page.locator('a[href*="route=account/order"]');
  }

  get wishlistLink(): Locator {
    return this.page.locator('a[href*="route=account/wishlist"]');
  }

  get editAccountLink(): Locator {
    return this.page.locator('a[href*="route=account/edit"]');
  }

  get changePasswordLink(): Locator {
    return this.page.locator('a[href*="route=account/password"]');
  }

  get addressBookLink(): Locator {
    return this.page.locator('a[href*="route=account/address"]');
  }

  get returnsLink(): Locator {
    return this.page.locator('a[href*="route=account/return"]');
  }

  // ─── Order History ────────────────────────────────────────────────────────

  get orderHistoryTable(): Locator {
    return this.page.locator('#content table');
  }

  get orderHistoryRows(): Locator {
    return this.page.locator('#content table tbody tr');
  }

  getOrderRowByOrderId(orderId: string): Locator {
    return this.orderHistoryRows.filter({ hasText: orderId });
  }

  getViewOrderButton(orderId: string): Locator {
    return this.getOrderRowByOrderId(orderId).locator('a[href*="order/info"]');
  }

  // ─── Wishlist ─────────────────────────────────────────────────────────────

  get wishlistTable(): Locator {
    return this.page.locator('#content table');
  }

  get wishlistRows(): Locator {
    return this.page.locator('#content table tbody tr');
  }

  get wishlistAddToCartButtons(): Locator {
    return this.page.locator('button[onclick*="cart.add"]');
  }

  // ─── Address Book ─────────────────────────────────────────────────────────

  get addNewAddressButton(): Locator {
    return this.page.locator('a[href*="route=account/address/add"]');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async navigateToOrderHistory(): Promise<void> {
    await this.orderHistoryLink.click();
    await this.waitForPageLoad();
  }

  async navigateToWishlist(): Promise<void> {
    await this.wishlistLink.click();
    await this.waitForPageLoad();
  }

  async navigateToAddressBook(): Promise<void> {
    await this.addressBookLink.click();
    await this.waitForPageLoad();
  }

  async viewOrder(orderId: string): Promise<void> {
    await this.getViewOrderButton(orderId).click();
    await this.waitForPageLoad();
  }

  async getOrderCount(): Promise<number> {
    return this.orderHistoryRows.count();
  }

  async isOrderInHistory(orderId: string): Promise<boolean> {
    return this.getOrderRowByOrderId(orderId).isVisible();
  }
}
