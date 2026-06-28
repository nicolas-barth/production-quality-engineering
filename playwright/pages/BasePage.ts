import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  // Language path prefix — Playwright resolves relative paths against baseURL.
  static readonly LANG_PREFIX = '/en-gb';

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto(route: string): Promise<void> {
    await this.page.goto(`${BasePage.LANG_PREFIX}?route=${route}`);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Header: Search ───────────────────────────────────────────────────────

  get searchInput(): Locator {
    return this.page.locator('input[name="search"]');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }

  // ─── Header: Cart ─────────────────────────────────────────────────────────

  get cartButton(): Locator {
    return this.page.locator('#cart > button');
  }

  get cartItemBadge(): Locator {
    return this.page.locator('#cart-total');
  }

  get miniCartDropdown(): Locator {
    return this.page.locator('#cart .dropdown-menu');
  }

  get viewCartLink(): Locator {
    return this.page.locator('a[href*="route=checkout/cart"]').first();
  }

  get miniCartCheckoutLink(): Locator {
    return this.page.locator('#cart a[href*="route=checkout/checkout"]');
  }

  async getCartCount(): Promise<number> {
    const text = await this.cartItemBadge.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async openMiniCart(): Promise<void> {
    await this.cartButton.click();
    await this.miniCartDropdown.waitFor({ state: 'visible' });
  }

  // ─── Header: Account ──────────────────────────────────────────────────────

  get myAccountDropdown(): Locator {
    return this.page.locator('.nav-link[title="My Account"]');
  }

  get loginMenuLink(): Locator {
    return this.page.locator('a[href*="route=account/login"]').nth(0);
  }

  get registerMenuLink(): Locator {
    return this.page.locator('a[href*="route=account/register"]').nth(0);
  }

  get logoutMenuLink(): Locator {
    return this.page.locator('a[href*="route=account/logout"]');
  }

  get myAccountLink(): Locator {
    return this.page.locator('a[href*="route=account/account"]').first();
  }

  async openAccountMenu(): Promise<void> {
    await this.myAccountDropdown.click();
  }

  async navigateToLogin(): Promise<void> {
    await this.openAccountMenu();
    await this.loginMenuLink.click();
  }

  async navigateToRegister(): Promise<void> {
    await this.openAccountMenu();
    await this.registerMenuLink.click();
  }

  async logout(): Promise<void> {
    await this.openAccountMenu();
    await this.logoutMenuLink.click();
  }

  // ─── Header: Currency ─────────────────────────────────────────────────────

  get currencyDropdown(): Locator {
    return this.page.locator('#form-currency button');
  }

  async selectCurrency(currencyCode: string): Promise<void> {
    await this.currencyDropdown.click();
    await this.page.locator(`button[name="${currencyCode}"]`).click();
  }

  // ─── Success / Error Alerts ───────────────────────────────────────────────

  get successAlert(): Locator {
    return this.page.locator('.alert-success');
  }

  get errorAlert(): Locator {
    return this.page.locator('.alert-danger');
  }

  get warningAlert(): Locator {
    return this.page.locator('.alert-warning');
  }

  async getAlertText(): Promise<string | null> {
    const alert = (await this.successAlert.isVisible())
      ? this.successAlert
      : (await this.errorAlert.isVisible())
        ? this.errorAlert
        : this.warningAlert;
    return alert.textContent();
  }
}
