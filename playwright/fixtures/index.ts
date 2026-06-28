import { test as base, type Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountPage } from '../pages/AccountPage';
import { isCloudflareBlocking, CF_SKIP_REASON } from '../utils/cloudflare-guard';
import { setupMockRouter } from '../mock/router';

export const MOCK_MODE = process.env.MOCK === 'true';

type QELabFixtures = {
  page: Page;
  homePage: HomePage;
  searchPage: SearchResultsPage;
  pdpPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountPage: AccountPage;
  _cfGuard: void;
};

export const test = base.extend<QELabFixtures>({
  page: async ({ page }, use) => {
    if (MOCK_MODE) {
      await setupMockRouter(page);
    }
    await use(page);
  },

  _cfGuard: [
    // eslint-disable-next-line no-empty-pattern -- Playwright fixture API requires {} when no fixtures are needed
    async ({}, use: () => Promise<void>): Promise<void> => {
      if (!MOCK_MODE) {
        test.skip(isCloudflareBlocking(), CF_SKIP_REASON);
      }
      await use();
    },
    { auto: true },
  ],

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  pdpPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
});

// re-export so test files can use a single import source
export { expect } from '@playwright/test';
