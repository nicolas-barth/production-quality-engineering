export class CheckoutPage {
  visit(): void {
    cy.visit('?route=checkout/checkout');
  }

  // ─── Step 1 ───────────────────────────────────────────────────────────────
  selectGuestCheckout(email: string): void {
    cy.get('#input-guest').check();
    cy.get('#input-email').type(email);
    cy.get('#button-account').click();
  }

  // ─── Step 2 ───────────────────────────────────────────────────────────────
  fillBillingAddress(address: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    postcode: string;
    country: string;
    region: string;
  }): void {
    cy.get('#input-payment-firstname').type(address.firstName);
    cy.get('#input-payment-lastname').type(address.lastName);
    cy.get('#input-payment-address-1').type(address.address1);
    cy.get('#input-payment-city').type(address.city);
    cy.get('#input-payment-postcode').type(address.postcode);
    cy.get('#input-payment-country').select(address.country);
    // Wait for AJAX region cascade (RISK-013)
    cy.get('#input-payment-zone').should('not.be.disabled');
    cy.get('#input-payment-zone').select(address.region);
    cy.get('#button-payment-address').click();
  }

  // ─── Step 3 ───────────────────────────────────────────────────────────────
  useSameDeliveryAddress(): void {
    cy.get('#input-shipping-address-0').check();
    cy.get('#button-shipping-address').click();
  }

  // ─── Step 4 ───────────────────────────────────────────────────────────────
  selectFirstDeliveryMethod(): void {
    cy.get('input[name="shipping_method"]').first().check();
    cy.get('#button-shipping-method').click();
  }

  // ─── Step 5 ───────────────────────────────────────────────────────────────
  selectFirstPaymentMethod(): void {
    cy.get('input[name="payment_method"]').first().check();
    cy.get('#button-payment-method').click();
  }

  // ─── Step 6 ───────────────────────────────────────────────────────────────
  confirmOrder(): void {
    cy.get('input[name="agree"]').check();
    cy.get('#button-confirm').click();
  }

  assertOrderSuccess(): void {
    cy.contains(/your order has been placed/i).should('be.visible');
  }

  assertConfirmButtonDisabledAfterClick(): void {
    cy.get('#button-confirm').then(($btn) => {
      cy.wrap($btn).click();
      cy.wrap($btn).should('be.disabled');
    });
  }
}
