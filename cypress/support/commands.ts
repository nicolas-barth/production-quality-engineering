declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      addToCart(productId?: string, quantity?: string): Chainable<void>;
      clearCart(): Chainable<void>;
      navigateTo(route: string): Chainable<void>;
      waitForCartUpdate(): Chainable<void>;
      assertAccessibleName(selector: string, expectedName: string): Chainable<void>;
      setupMockInterceptors(): Chainable<void>;
    }
  }
}

// Intercept order matters: Cypress uses "last-registered = first-called".
// Generic fallbacks are registered first; specific patterns registered last so they win.
Cypress.Commands.add('setupMockInterceptors', () => {
  cy.intercept('GET', /route=checkout\/cart/, {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=UTF-8' },
    fixture: 'pages/cart.html',
  });

  cy.intercept('GET', /route=checkout\/checkout/, {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=UTF-8' },
    fixture: 'pages/checkout.html',
  });

  cy.intercept('GET', /product_id=40/, {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=UTF-8' },
    fixture: 'pages/product.html',
  });

  cy.intercept('GET', /product_id=43/, {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=UTF-8' },
    fixture: 'pages/macbook.html',
  });

  cy.intercept('POST', /checkout\/cart\/add/, (req) => {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? '');
    if (body.includes('product_id=43')) {
      req.reply({ statusCode: 200, fixture: 'api/cart-add-macbook.json' });
    } else {
      req.reply({ statusCode: 200, fixture: 'api/cart-add-iphone.json' });
    }
  });

  cy.intercept('POST', /checkout\/cart\/remove/, {
    statusCode: 200,
    fixture: 'api/cart-remove.json',
  });

  cy.intercept('POST', /checkout\/cart\/edit/, {
    statusCode: 200,
    fixture: 'api/cart-edit.json',
  });

  cy.intercept('GET', /localisation\/country/, {
    statusCode: 200,
    body: {
      zone_status: '1',
      zone: [
        { zone_id: '2644', name: 'Greater London' },
        { zone_id: '2645', name: 'England' },
        { zone_id: '2646', name: 'Scotland' },
      ],
    },
  });

  cy.intercept('GET', /localisation\/country.*country_id=222/, {
    statusCode: 200,
    body: {
      zone_status: '1',
      zone: [
        { zone_id: '2644', name: 'Greater London' },
        { zone_id: '2645', name: 'England' },
        { zone_id: '2646', name: 'Scotland' },
        { zone_id: '2647', name: 'Wales' },
        { zone_id: '2648', name: 'Northern Ireland' },
      ],
    },
  });

  cy.intercept('GET', /localisation\/country.*country_id=223/, {
    statusCode: 200,
    body: {
      zone_status: '1',
      zone: [
        { zone_id: '3608', name: 'New York' },
        { zone_id: '3604', name: 'California' },
        { zone_id: '3622', name: 'Texas' },
      ],
    },
  });
});

// ─── Authentication ────────────────────────────────────────────────────────────

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('?route=account/login');
  cy.get('#input-email').type(email);
  cy.get('#input-password').type(password, { log: false });
  cy.get('input[value="Login"]').click();
  cy.url().should('include', 'route=account/account');
});

// ─── Cart ──────────────────────────────────────────────────────────────────────

Cypress.Commands.add('addToCart', (_productId?: string, _quantity?: string) => {
  cy.get('#button-cart').click();
  cy.get('.alert-success').should('be.visible');
});

Cypress.Commands.add('clearCart', () => {
  if (Cypress.env('MOCK')) {
    cy.clearLocalStorage('mockCart');
    return;
  }

  // Real mode: navigate to cart and remove each item
  cy.visit('?route=checkout/cart');
  cy.get('body').then(($body) => {
    if ($body.find('.table-bordered').length > 0) {
      cy.get('button[data-original-title="Remove"]').each(($btn) => {
        cy.wrap($btn).click();
        cy.wait(500);
      });
    }
  });
});

// ─── Navigation ───────────────────────────────────────────────────────────────

Cypress.Commands.add('navigateTo', (route: string) => {
  cy.visit(`?route=${route}`);
});

// ─── Cart State ───────────────────────────────────────────────────────────────

Cypress.Commands.add('waitForCartUpdate', () => {
  cy.get('#cart > button').should('not.have.class', 'loading');
});

// ─── Accessibility ────────────────────────────────────────────────────────────

Cypress.Commands.add('assertAccessibleName', (selector: string, expectedName: string) => {
  cy.get(selector).then(($el) => {
    const ariaLabel = $el.attr('aria-label');
    const title = $el.attr('title');
    expect(
      ariaLabel === expectedName || title === expectedName,
      `Element "${selector}" must have aria-label or title equal to "${expectedName}"`,
    ).to.be.true;
  });
});

export {};
