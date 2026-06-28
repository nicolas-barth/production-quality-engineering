import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  async goto(productRoute: string): Promise<void> {
    await super.goto(productRoute);
    await this.waitForPageLoad();
  }

  // ─── Product Information ──────────────────────────────────────────────────

  get productTitle(): Locator {
    return this.page.locator('h1.title-product, #content h1').first();
  }

  get productPrice(): Locator {
    return this.page.locator('.price-new, h2.price').first();
  }

  get productSpecialPrice(): Locator {
    return this.page.locator('.price-new');
  }

  get productOldPrice(): Locator {
    return this.page.locator('.price-old');
  }

  get stockStatus(): Locator {
    return this.page.locator('#product-tab-description li').filter({ hasText: /availability/i });
  }

  get productModel(): Locator {
    return this.page.locator('#product-tab-description li').filter({ hasText: /model/i });
  }

  // ─── Images ───────────────────────────────────────────────────────────────

  get mainProductImage(): Locator {
    return this.page.locator('#image-main, .thumbnails img').first();
  }

  get thumbnailImages(): Locator {
    return this.page.locator('.thumbnails li a');
  }

  // ─── Add to Cart ──────────────────────────────────────────────────────────

  get quantityInput(): Locator {
    return this.page.locator('#input-quantity');
  }

  get addToCartButton(): Locator {
    return this.page.locator('#button-cart');
  }

  get addToWishlistButton(): Locator {
    return this.page.locator(
      '[data-original-title="Add to Wish List"], button[onclick*="wishlist.add"]',
    );
  }

  get compareButton(): Locator {
    return this.page.locator(
      '[data-original-title="Compare this Product"], button[onclick*="compare.add"]',
    );
  }

  // ─── Tabs ─────────────────────────────────────────────────────────────────

  get descriptionTab(): Locator {
    return this.page.locator('a[href="#tab-description"]');
  }

  get specificationTab(): Locator {
    return this.page.locator('a[href="#tab-specification"]');
  }

  get reviewsTab(): Locator {
    return this.page.locator('a[href="#tab-review"]');
  }

  get reviewForm(): Locator {
    return this.page.locator('#form-review');
  }

  get reviewAuthorInput(): Locator {
    return this.page.locator('#input-name');
  }

  get reviewTextInput(): Locator {
    return this.page.locator('#input-review');
  }

  get reviewRatingStars(): Locator {
    return this.page.locator('.rating label[for^="input-rating"]');
  }

  get submitReviewButton(): Locator {
    return this.page.locator('#button-review');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async addToCart(quantity = 1): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
    await this.addToCartButton.click();
    await this.successAlert.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.clear();
    await this.quantityInput.fill(quantity.toString());
  }

  async selectOption(optionLabel: string, value: string): Promise<void> {
    const optionGroup = this.page.locator('.product-options').filter({ hasText: optionLabel });
    await optionGroup.locator('select').selectOption({ label: value });
  }

  async openReviewsTab(): Promise<void> {
    await this.reviewsTab.click();
    await this.reviewForm.waitFor({ state: 'visible' });
  }

  async submitReview(author: string, text: string, rating: 1 | 2 | 3 | 4 | 5): Promise<void> {
    await this.openReviewsTab();
    await this.reviewAuthorInput.fill(author);
    await this.reviewTextInput.fill(text);
    await this.page.locator(`#input-rating-${rating}`).check();
    await this.submitReviewButton.click();
  }

  async getTitle(): Promise<string | null> {
    return this.productTitle.textContent();
  }

  async isAddToCartEnabled(): Promise<boolean> {
    return this.addToCartButton.isEnabled();
  }
}
