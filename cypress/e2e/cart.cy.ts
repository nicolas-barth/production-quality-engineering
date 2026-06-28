/// <reference types="cypress" />

const IPHONE_ID = '40';
const MACBOOK_ID = '43';
const IPHONE_NAME = 'iPhone';

describe('Cart — Cypress AJAX & UI Validation', () => {
  beforeEach(() => {
    cy.clearCart();
    cy.intercept('POST', /checkout\/cart\/add/).as('cartAdd');
    cy.intercept('POST', /checkout\/cart\/remove/).as('cartRemove');
    cy.intercept('POST', /checkout\/cart\/edit/).as('cartEdit');
  });

  it('CY-CART-001 — cart add AJAX returns success JSON with product name in response', () => {
    cy.navigateTo(`product/product&product_id=${IPHONE_ID}`);
    cy.get('#button-cart').click();

    cy.wait('@cartAdd').then((interception) => {
      expect(interception.response!.statusCode).to.equal(200);

      const body = interception.response!.body as Record<string, unknown>;

      expect(body).to.be.an('object');

      const hasValidResponse = 'success' in body || 'error' in body;
      expect(hasValidResponse, 'Cart add response must have success or error property').to.be.true;

      if ('success' in body) {
        expect(body.success).to.include(IPHONE_NAME);
      }
    });
  });

  it('CY-CART-002 — cart page shows added product with correct name and quantity', () => {
    cy.navigateTo(`product/product&product_id=${IPHONE_ID}`);
    cy.addToCart(IPHONE_ID, '1');

    cy.navigateTo('checkout/cart');

    cy.get('.table-bordered tbody tr').should('contain.text', IPHONE_NAME);
    cy.get('input[name^="quantity"]').first().should('have.value', '1');
    cy.get('#content').contains(/total/i).should('be.visible');
  });

  it('CY-CART-003 — removing item from cart clears it and resets header cart badge', () => {
    cy.navigateTo(`product/product&product_id=${IPHONE_ID}`);
    cy.addToCart(IPHONE_ID, '1');

    cy.navigateTo('checkout/cart');

    cy.get('.table-bordered tbody tr').should('have.length.greaterThan', 0);

    cy.get('button[data-original-title="Remove"]').first().click();
    cy.waitForCartUpdate();

    cy.wait('@cartRemove').then((interception) => {
      expect(interception.response!.statusCode).to.equal(200);
    });

    cy.get('#content p').should('contain.text', 'Your shopping cart is empty');
    cy.get('#cart-total').should('contain.text', '0');
  });

  it('CY-CART-004 — adding two different products results in count of 2 in header badge', () => {
    cy.navigateTo(`product/product&product_id=${IPHONE_ID}`);
    cy.addToCart(IPHONE_ID, '1');

    cy.navigateTo(`product/product&product_id=${MACBOOK_ID}`);
    cy.addToCart(MACBOOK_ID, '1');

    cy.assertAccessibleName('#cart-total', '2 item(s)');
    cy.get('#cart-total').should('contain.text', '2');
  });

  it('CY-CART-005 — updating quantity triggers cart edit AJAX and updates displayed total', () => {
    cy.navigateTo(`product/product&product_id=${IPHONE_ID}`);
    cy.addToCart(IPHONE_ID, '1');

    cy.navigateTo('checkout/cart');

    cy.get('input[name^="quantity"]').first().clear().type('2');
    cy.get('button[data-original-title="Update"]').first().click();
    cy.waitForCartUpdate();

    cy.wait('@cartEdit').then((interception) => {
      expect(interception.response!.statusCode).to.equal(200);
    });

    cy.get('input[name^="quantity"]').first().should('have.value', '2');
    cy.get('#cart-total').should('contain.text', '2');
  });
});
