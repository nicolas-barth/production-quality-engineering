import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('common/home');
    await this.waitForPageLoad();
  }

  // ─── Carousel ─────────────────────────────────────────────────────────────

  get carousel(): Locator {
    return this.page.locator('#slideshow0');
  }

  get carouselNextButton(): Locator {
    return this.page.locator('#slideshow0 .swiper-button-next');
  }

  get carouselPauseButton(): Locator {
    // RISK-001 — check if pause control exists (WCAG 2.2.2)
    return this.page.locator('#slideshow0 [aria-label*="pause" i]');
  }

  // ─── Featured Products ────────────────────────────────────────────────────

  get featuredSection(): Locator {
    return this.page
      .locator('#content h3')
      .filter({ hasText: /featured/i })
      .locator('..');
  }

  get featuredProductCards(): Locator {
    return this.page.locator('.product-thumb');
  }

  get featuredProductNames(): Locator {
    return this.page.locator('.product-thumb .caption h4 a');
  }

  // ─── Product Card Interactions ────────────────────────────────────────────

  getProductCardByName(name: string): Locator {
    return this.page
      .locator('.product-thumb')
      .filter({ has: this.page.locator(`a:has-text("${name}")`) });
  }

  getAddToCartButtonForProduct(name: string): Locator {
    return this.getProductCardByName(name).locator('button[onclick*="cart.add"]');
  }

  getAddToWishlistButtonForProduct(name: string): Locator {
    return this.getProductCardByName(name).locator('button[onclick*="wishlist.add"]');
  }

  async addProductToCartByName(name: string): Promise<void> {
    await this.getAddToCartButtonForProduct(name).click();
    await this.successAlert.waitFor({ state: 'visible' });
  }

  async clickProductByName(name: string): Promise<void> {
    await this.getProductCardByName(name).locator('h4 a').click();
  }

  async getFirstProductName(): Promise<string | null> {
    return this.featuredProductNames.first().textContent();
  }

  async getFeaturedProductCount(): Promise<number> {
    return this.featuredProductCards.count();
  }
}
