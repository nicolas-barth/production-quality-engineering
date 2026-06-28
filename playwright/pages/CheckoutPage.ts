import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { AddressData } from '../data/addresses';

export class CheckoutPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('checkout/checkout');
    await this.waitForPageLoad();
  }

  // ─── Step 1: Account ──────────────────────────────────────────────────────

  get guestCheckoutOption(): Locator {
    return this.page.locator('#input-guest');
  }

  get guestEmailInput(): Locator {
    return this.page.locator('#input-email');
  }

  get step1ContinueButton(): Locator {
    return this.page.locator('#button-account');
  }

  get loginOptionRadio(): Locator {
    return this.page.locator('#input-login');
  }

  // ─── Step 2: Billing Details ──────────────────────────────────────────────

  get firstNameInput(): Locator {
    return this.page.locator('#input-payment-firstname');
  }
  get lastNameInput(): Locator {
    return this.page.locator('#input-payment-lastname');
  }
  get companyInput(): Locator {
    return this.page.locator('#input-payment-company');
  }
  get address1Input(): Locator {
    return this.page.locator('#input-payment-address-1');
  }
  get address2Input(): Locator {
    return this.page.locator('#input-payment-address-2');
  }
  get cityInput(): Locator {
    return this.page.locator('#input-payment-city');
  }
  get postcodeInput(): Locator {
    return this.page.locator('#input-payment-postcode');
  }
  get countrySelect(): Locator {
    return this.page.locator('#input-payment-country');
  }
  get regionSelect(): Locator {
    return this.page.locator('#input-payment-zone');
  }

  get step2ContinueButton(): Locator {
    return this.page.locator('#button-payment-address');
  }

  // ─── Step 3: Delivery Address ─────────────────────────────────────────────

  get sameAddressCheckbox(): Locator {
    return this.page
      .locator('input[name="same_address"]')
      .or(this.page.locator('#input-shipping-address-0'));
  }

  get step3ContinueButton(): Locator {
    return this.page.locator('#button-shipping-address');
  }

  // ─── Step 4: Delivery Method ──────────────────────────────────────────────

  get deliveryMethodRadios(): Locator {
    return this.page.locator('input[name="shipping_method"]');
  }

  get step4ContinueButton(): Locator {
    return this.page.locator('#button-shipping-method');
  }

  // ─── Step 5: Payment Method ───────────────────────────────────────────────

  get paymentMethodRadios(): Locator {
    return this.page.locator('input[name="payment_method"]');
  }

  get step5ContinueButton(): Locator {
    return this.page.locator('#button-payment-method');
  }

  // ─── Step 6: Order Review & Confirmation ──────────────────────────────────

  get termsAndConditionsCheckbox(): Locator {
    return this.page.locator('input[name="agree"]');
  }

  get confirmOrderButton(): Locator {
    return this.page.locator('#button-confirm');
  }

  get orderSuccessHeading(): Locator {
    return this.page.getByRole('heading', { name: /your order has been placed/i });
  }

  get orderIdLink(): Locator {
    return this.page.locator('a[href*="route=account/order/info"]');
  }

  // ─── Validation Error ─────────────────────────────────────────────────────

  get billingFormErrors(): Locator {
    return this.page.locator('#payment-address .text-danger');
  }

  // ─── Step Actions ─────────────────────────────────────────────────────────

  async selectGuestCheckout(email: string): Promise<void> {
    await this.guestCheckoutOption.check();
    await this.guestEmailInput.fill(email);
    await this.step1ContinueButton.click();
    await this.waitForPageLoad();
  }

  async fillBillingAddress(address: AddressData): Promise<void> {
    await this.firstNameInput.fill(address.firstName);
    await this.lastNameInput.fill(address.lastName);
    await this.address1Input.fill(address.address1);
    await this.cityInput.fill(address.city);
    await this.postcodeInput.fill(address.postcode);
    await this.countrySelect.selectOption({ label: address.country });

    // RISK-013: Wait for AJAX region cascade to complete before selecting region
    await this.page
      .waitForResponse((r) => r.url().includes('country') && r.status() === 200, {
        timeout: 10_000,
      })
      .catch(() => {
        // Graceful fallback: proceed even if response interceptor misses the call
      });
    await this.regionSelect.waitFor({ state: 'visible' });
    await this.regionSelect.selectOption({ label: address.region });

    await this.step2ContinueButton.click();
    await this.waitForPageLoad();
  }

  async useDeliveryAddressSameAsBilling(): Promise<void> {
    await this.sameAddressCheckbox.check();
    await this.step3ContinueButton.click();
    await this.waitForPageLoad();
  }

  async selectFirstAvailableDeliveryMethod(): Promise<void> {
    await this.deliveryMethodRadios.first().check();
    await this.step4ContinueButton.click();
    await this.waitForPageLoad();
  }

  async selectFirstAvailablePaymentMethod(): Promise<void> {
    await this.paymentMethodRadios.first().check();
    await this.step5ContinueButton.click();
    await this.waitForPageLoad();
  }

  async confirmOrder(): Promise<void> {
    await this.termsAndConditionsCheckbox.check();
    await this.confirmOrderButton.click();
  }

  async getOrderId(): Promise<string | null> {
    const text = await this.orderIdLink.textContent();
    return text?.trim() ?? null;
  }

  // ─── Full Flow Orchestrator ────────────────────────────────────────────────

  async completeGuestCheckout(email: string, address: AddressData): Promise<string | null> {
    await this.selectGuestCheckout(email);
    await this.fillBillingAddress(address);
    await this.useDeliveryAddressSameAsBilling();
    await this.selectFirstAvailableDeliveryMethod();
    await this.selectFirstAvailablePaymentMethod();
    await this.confirmOrder();
    await expect(this.orderSuccessHeading).toBeVisible({ timeout: 20_000 });
    return this.getOrderId();
  }
}
