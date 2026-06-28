import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  async goto(searchTerm: string): Promise<void> {
    await super.goto(`common/search&search=${encodeURIComponent(searchTerm)}`);
    await this.waitForPageLoad();
  }

  // ─── Results ──────────────────────────────────────────────────────────────

  get resultProductCards(): Locator {
    return this.page.locator('#product-list .product-thumb, #content .product-thumb');
  }

  get noResultsMessage(): Locator {
    return this.page.locator('#content p').filter({ hasText: /no product/i });
  }

  get searchResultsHeading(): Locator {
    return this.page.locator('#content h1, #content h2').first();
  }

  // ─── Sort and Filter ──────────────────────────────────────────────────────

  get sortDropdown(): Locator {
    return this.page.locator('#input-sort');
  }

  get itemsPerPageDropdown(): Locator {
    return this.page.locator('#input-limit');
  }

  get gridViewButton(): Locator {
    return this.page.locator('#button-grid');
  }

  get listViewButton(): Locator {
    return this.page.locator('#button-list');
  }

  // ─── Pagination ───────────────────────────────────────────────────────────

  get pagination(): Locator {
    return this.page.locator('.pagination');
  }

  get nextPageLink(): Locator {
    return this.page.locator('.pagination li:last-child a');
  }

  // ─── Advanced Search ──────────────────────────────────────────────────────

  get minPriceInput(): Locator {
    return this.page.locator('#input-price-min');
  }

  get maxPriceInput(): Locator {
    return this.page.locator('#input-price-max');
  }

  get searchInDescriptionCheckbox(): Locator {
    return this.page.locator('#input-description');
  }

  get categorySelect(): Locator {
    return this.page.locator('#input-category');
  }

  get advancedSearchButton(): Locator {
    return this.page.locator('#button-search');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async sortBy(value: string): Promise<void> {
    await this.sortDropdown.selectOption(value);
    await this.waitForPageLoad();
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageLink.click();
    await this.waitForPageLoad();
  }

  async getResultCount(): Promise<number> {
    return this.resultProductCards.count();
  }

  async getCurrentSortValue(): Promise<string | null> {
    return this.sortDropdown.inputValue();
  }

  async applyPriceFilter(min: string, max: string): Promise<void> {
    await this.minPriceInput.fill(min);
    await this.maxPriceInput.fill(max);
    await this.advancedSearchButton.click();
    await this.waitForPageLoad();
  }

  async hasNoResults(): Promise<boolean> {
    return this.noResultsMessage.isVisible();
  }
}
