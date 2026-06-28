import './commands';

// resets to false for each spec file (support file re-evaluates per spec)
let cfBlocking = false;

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('Script error') ||
    err.message.includes('ResizeObserver loop') ||
    err.message.includes('Non-Error promise rejection')
  ) {
    return false;
  }
  return true;
});

before((): void => {
  if (Cypress.env('MOCK')) return;

  cy.task<boolean>('checkCloudflare').then((blocking): void => {
    cfBlocking = blocking;
    if (cfBlocking) {
      cy.task(
        'log',
        '\n[cloudflare-guard]\n' +
          'Target: https://demo.opencart.com\n' +
          'Cloudflare blocking: true\n' +
          'Tests will be skipped.\n' +
          'Run mock mode for deterministic execution: npm run test:cypress:mock\n' +
          'CI runners are not affected.\n',
      );
    }
  });
});

// Regular function (not arrow) — Mocha's this.skip() is not accessible in arrow functions
beforeEach(function (): void {
  if (cfBlocking) {
    this.skip();
    return;
  }

  cy.task('log', `Starting: ${Cypress.currentTest.title}`);

  if (Cypress.env('MOCK')) {
    cy.setupMockInterceptors();
  }
});
