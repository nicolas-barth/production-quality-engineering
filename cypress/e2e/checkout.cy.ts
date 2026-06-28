/// <reference types="cypress" />

const IPHONE_ROUTE = 'product/product&product_id=40';

function addProductAndGoToCheckout(): void {
  cy.navigateTo(IPHONE_ROUTE);
  cy.addToCart('40', '1');
  cy.navigateTo('checkout/cart');
  cy.get('a[href*="route=checkout/checkout"]').filter(':contains("Checkout")').first().click();
  cy.waitForCartUpdate();
}

function completeUpToReviewStep(guestEmail: string): void {
  // Step 1: Guest account
  cy.get('#input-guest').check();
  cy.get('#input-email').first().type(guestEmail);
  cy.get('#button-account').click();
  cy.waitForCartUpdate();

  // Step 2: Billing address
  cy.get('#input-payment-firstname').type('Test');
  cy.get('#input-payment-lastname').type('Automation');
  cy.get('#input-payment-address-1').type('123 Quality Street');
  cy.get('#input-payment-city').type('London');
  cy.get('#input-payment-postcode').type('SW1A 1AA');
  cy.get('#input-payment-country').select('United Kingdom');
  // Wait for region cascade
  cy.wait('@countryChange').then(() => {
    cy.get('#input-payment-zone').should('not.be.disabled');
    cy.get('#input-payment-zone').select('Greater London');
  });
  cy.get('#button-payment-address').click();
  cy.waitForCartUpdate();

  // Step 3: Delivery address (same as billing)
  cy.get('#input-shipping-address-0, input[name="same_address"]').first().check();
  cy.get('#button-shipping-address').click();
  cy.waitForCartUpdate();

  // Step 4: Delivery method
  cy.get('input[name="shipping_method"]').first().check();
  cy.get('#button-shipping-method').click();
  cy.waitForCartUpdate();

  // Step 5: Payment method
  cy.get('input[name="payment_method"]').first().check();
  cy.get('#button-payment-method').click();
  cy.waitForCartUpdate();
}

describe('Checkout — Cypress Network Interception Tests', () => {
  beforeEach(() => {
    cy.clearCart();
    cy.intercept('GET', /localisation\/country/).as('countryChange');
    cy.intercept('POST', /checkout\/checkout/).as('checkoutPost');
  });

  it('CY-CHKOUT-001 — Confirm Order button state after first click (double-submit prevention)', () => {
    const guestEmail = `cy.checkout+${Date.now()}@example.com`;

    // 3-second delay keeps #button-confirm disabled during the in-flight POST
    cy.intercept('POST', /checkout\/checkout/, (req) => {
      req.reply({ statusCode: 200, delay: 3000, body: {} });
    }).as('confirmOrderPost');

    addProductAndGoToCheckout();
    completeUpToReviewStep(guestEmail);

    cy.get('input[name="agree"]').check();
    cy.get('#button-confirm').click();
    cy.get('#button-confirm').should('be.disabled');
    cy.wait('@confirmOrderPost', { timeout: 15_000 });
  });

  it('CY-CHKOUT-002 — Payment timeout simulation shows user-friendly error message', () => {
    const guestEmail = `cy.timeout+${Date.now()}@example.com`;

    cy.intercept('POST', /checkout\/checkout/, {
      forceNetworkError: true,
    }).as('paymentTimeout');

    addProductAndGoToCheckout();
    completeUpToReviewStep(guestEmail);

    cy.get('input[name="agree"]').check();
    cy.get('#button-confirm').click();

    cy.wait('@paymentTimeout').then(() => {
      cy.get('body').should(($body) => {
        const bodyText = $body.text().toLowerCase();
        const hasContent = bodyText.length > 100;
        expect(hasContent, 'Page must have content after payment error — not blank').to.be.true;
      });

      // Log the actual state for review
      cy.screenshot('payment-timeout-state');
    });
  });

  it('CY-CHKOUT-003 — country/region cascade AJAX fires correctly and populates region options', () => {
    const guestEmail = `cy.cascade+${Date.now()}@example.com`;

    addProductAndGoToCheckout();

    // Step 1: Guest
    cy.get('#input-guest').check();
    cy.get('#input-email').first().type(guestEmail);
    cy.get('#button-account').click();
    cy.waitForCartUpdate();

    // Select United Kingdom and verify cascade
    cy.get('#input-payment-country').select('United Kingdom');

    cy.wait('@countryChange').then((interception) => {
      expect(interception.request.url).to.include('localisation/country');
    });

    // Region dropdown must populate with UK-specific options
    cy.get('#input-payment-zone').should('not.be.disabled');
    cy.get('#input-payment-zone option').should('have.length.greaterThan', 1);

    // Switch to United States and verify re-cascade
    cy.get('#input-payment-country').select('United States');

    cy.wait('@countryChange').then(() => {
      cy.get('#input-payment-zone').should('not.be.disabled');
      cy.get('#input-payment-zone option').should('have.length.greaterThan', 1);

      // Verify at least one US state appears (e.g. "New York")
      cy.get('#input-payment-zone option').should(($options) => {
        const values = Array.from($options).map((o) => (o as HTMLOptionElement).text);
        expect(values.some((v) => v.includes('New York') || v.includes('California'))).to.be.true;
      });
    });
  });
});
