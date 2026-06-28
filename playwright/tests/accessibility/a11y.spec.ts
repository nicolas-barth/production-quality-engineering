import { test, expect } from '@fixtures';
import { MOCK_MODE } from '@fixtures';
import { runAccessibilityAudit, assertNoViolations } from '@utils/accessibility';
import { DEFAULT_PRODUCT } from '@data/products';

// Fixtures use minimal CSS — not the real application's design system.
// Color contrast must be validated in Real Mode against live CSS.
const AUDIT_OPTS = MOCK_MODE ? { disableRules: ['color-contrast'] } : {};

test.describe('Accessibility — WCAG 2.1 Level A/AA', () => {
  test(
    'TS-A11Y-001 — homepage passes axe-core scan with zero critical/serious violations',
    { tag: ['@p0', '@accessibility', '@smoke'] },
    async ({ homePage, page }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-A11Y-001' },
          { type: 'Risk', description: 'RISK-001 (L5 × I5 = 25 Critical)' },
          { type: 'Standard', description: 'WCAG 2.1 Level A + AA' },
        );

      await test.step('Navigate to homepage', async () => {
        await homePage.goto();
      });

      await test.step('Run axe-core accessibility audit', async () => {
        const result = await runAccessibilityAudit(page, AUDIT_OPTS);
        test.info().annotations.push({
          type: 'A11y Summary',
          description: result.summary,
        });

        if (result.violations.length > 0) {
          for (const v of result.violations) {
            test.info().annotations.push({
              type: `[${v.impact?.toUpperCase()}] ${v.id}`,
              description: `${v.description} | WCAG: ${v.wcagTags.join(', ')} | Nodes: ${v.nodes} | ${v.helpUrl}`,
            });
          }
        }
      });

      await test.step('Assert zero critical and serious violations', async () => {
        const result = await runAccessibilityAudit(page, AUDIT_OPTS);
        assertNoViolations(result, ['moderate', 'minor']);
      });

      await test.step('Verify WCAG 2.2.2 — carousel pause control exists (BUG-002 tracking)', async () => {
        const pauseButton = homePage.carouselPauseButton;
        const hasPause = await pauseButton.isVisible();
        test.info().annotations.push({
          type: 'WCAG 2.2.2 Check',
          description: hasPause
            ? 'PASS: Carousel pause control found'
            : 'FAIL: No carousel pause control — WCAG 2.2.2 violation (auto-playing content must be pausable)',
        });
      });
    },
  );

  test(
    'TS-A11Y-002 — product detail page passes axe-core scan',
    { tag: ['@p0', '@accessibility'] },
    async ({ pdpPage, page }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-A11Y-002' },
          { type: 'Risk', description: 'RISK-001, RISK-005 (alt text on images)' },
        );

      await test.step('Navigate to product detail page', async () => {
        await pdpPage.goto(DEFAULT_PRODUCT.route);
      });

      await test.step('Run axe-core scan', async () => {
        const result = await runAccessibilityAudit(page, AUDIT_OPTS);
        test.info().annotations.push({
          type: 'A11y Summary',
          description: result.summary,
        });
        if (result.violations.length > 0) {
          for (const v of result.violations) {
            test.info().annotations.push({
              type: `[${v.impact?.toUpperCase()}] ${v.id}`,
              description: `${v.description} | WCAG: ${v.wcagTags.join(', ')} | Nodes: ${v.nodes}`,
            });
          }
        }
      });

      await test.step('Assert zero critical and serious violations', async () => {
        const result = await runAccessibilityAudit(page, AUDIT_OPTS);
        assertNoViolations(result, ['moderate', 'minor']);
      });

      await test.step('Verify product images have alt text', async () => {
        const imagesWithoutAlt = await page.locator('img:not([alt])').count();
        const imagesWithEmptyAlt = await page.locator('img[alt=""]').count();
        test.info().annotations.push({
          type: 'Image Alt Text Check',
          description: `Images without alt: ${imagesWithoutAlt}, Images with empty alt: ${imagesWithEmptyAlt}`,
        });
        expect(imagesWithoutAlt, 'All images on PDP must have alt attributes').toBe(0);
      });
    },
  );

  test(
    'TS-A11Y-005 — registration form passes axe-core scan',
    { tag: ['@p1', '@accessibility'] },
    async ({ registerPage, page }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-A11Y-005' },
          { type: 'Risk', description: 'RISK-001, RISK-011' },
        );

      await test.step('Navigate to registration form', async () => {
        await registerPage.goto();
      });

      await test.step('Run axe-core scan on empty registration form', async () => {
        const result = await runAccessibilityAudit(page, AUDIT_OPTS);
        test.info().annotations.push({
          type: 'A11y Summary',
          description: result.summary,
        });
        if (result.violations.length > 0) {
          for (const v of result.violations) {
            test.info().annotations.push({
              type: `[${v.impact?.toUpperCase()}] ${v.id}`,
              description: `${v.description} | WCAG: ${v.wcagTags.join(', ')} | Nodes: ${v.nodes}`,
            });
          }
        }
      });

      await test.step('Assert zero critical and serious violations on empty form', async () => {
        const result = await runAccessibilityAudit(page, AUDIT_OPTS);
        assertNoViolations(result, ['moderate', 'minor']);
      });

      await test.step('Trigger validation errors and re-scan for WCAG 1.3.1 / RISK-011', async () => {
        await registerPage.submitButton.click();
        await page.waitForLoadState('domcontentloaded');

        const resultWithErrors = await runAccessibilityAudit(page, AUDIT_OPTS);
        test.info().annotations.push({
          type: 'A11y After Validation (RISK-011)',
          description: resultWithErrors.summary,
        });

        if (resultWithErrors.violations.length > 0) {
          for (const v of resultWithErrors.violations) {
            test.info().annotations.push({
              type: `[${v.impact?.toUpperCase()}] POST-VALIDATION ${v.id}`,
              description: `${v.description} | WCAG: ${v.wcagTags.join(', ')} | Nodes: ${v.nodes}`,
            });
          }
        }
        assertNoViolations(resultWithErrors, ['moderate', 'minor']);
      });
    },
  );
});
