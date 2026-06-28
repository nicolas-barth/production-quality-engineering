import { test, expect } from '@fixtures';
import { generateUser } from '@data/users';
import type { UserData } from '@data/users';
import { RegisterPage } from '@pages/RegisterPage';
import { isCloudflareBlocking, CF_SKIP_REASON } from '@utils/cloudflare-guard';
import { MOCK_MODE } from '@fixtures';
import { setupMockRouter } from '../../mock/router';

test.describe('Registration', () => {
  test(
    'TS-AUTH-001 — successful registration with valid data',
    { tag: ['@p1', '@smoke'] },
    async ({ registerPage, page }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-AUTH-001' },
          { type: 'Risk', description: 'RISK-007' },
        );

      const user = generateUser();

      await test.step('Navigate to registration page', async () => {
        await registerPage.goto();
      });

      await test.step('Fill and submit form with valid data', async () => {
        await registerPage.register(user);
      });

      await test.step('Verify account created and user is on success page', async () => {
        await expect(page).toHaveURL(/route=account\/success/, {
          timeout: 15_000,
        });
      });
    },
  );

  test(
    'TS-AUTH-003 — registration blocked with single-character password (boundary)',
    { tag: ['@p1'] },
    async ({ registerPage }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-AUTH-003' },
          { type: 'Risk', description: 'RISK-007' },
          { type: 'Type', description: 'Boundary — password length' },
        );

      const user = generateUser();
      await registerPage.goto();

      await test.step('Submit form with 1-character password', async () => {
        await registerPage.registerWithPassword(user, 'a', 'a');
      });

      await test.step('Verify password validation error is present', async () => {
        const errors = await registerPage.getAllValidationErrors();
        const hasPasswordError = errors.some((e) => e.toLowerCase().includes('password'));
        expect(
          hasPasswordError,
          `Expected a password length error. Got: ${JSON.stringify(errors)}`,
        ).toBe(true);
      });
    },
  );
});

test.describe('Login', () => {
  let loginUser: UserData;

  test.beforeAll(async ({ browser }) => {
    if (!MOCK_MODE) {
      test.skip(isCloudflareBlocking(), CF_SKIP_REASON);
    }

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    if (MOCK_MODE) {
      await setupMockRouter(page);
    }
    const registerPage = new RegisterPage(page);
    loginUser = generateUser();
    await registerPage.goto();
    await registerPage.register(loginUser);
    await ctx.close();
  });

  test(
    'TS-AUTH-005 — successful login with valid credentials',
    { tag: ['@p0', '@smoke'] },
    async ({ loginPage, page }) => {
      test.info().annotations.push({ type: 'Scenario ID', description: 'TS-AUTH-005' });

      await test.step('Navigate to login page', async () => {
        await loginPage.goto();
      });

      await test.step('Submit valid credentials', async () => {
        await loginPage.login(loginUser.email, loginUser.password);
      });

      await test.step('Verify authenticated session — account dashboard shown', async () => {
        await expect(page).toHaveURL(/route=account\/account/, { timeout: 15_000 });
      });
    },
  );

  test(
    'TS-AUTH-006 — login fails with invalid password — generic error, no credential exposure',
    { tag: ['@p1'] },
    async ({ loginPage }) => {
      test
        .info()
        .annotations.push(
          { type: 'Scenario ID', description: 'TS-AUTH-006' },
          { type: 'Risk', description: 'RISK-005' },
        );

      await loginPage.goto();

      await test.step('Submit valid email with incorrect password', async () => {
        await loginPage.login(loginUser.email, 'DefinitelyWrongP@ss!99');
      });

      await test.step('Verify generic error shown — no credential enumeration', async () => {
        const errorText = await loginPage.getErrorMessage();
        expect(errorText, 'Error alert must be visible').toBeTruthy();
        expect(errorText).not.toContain(loginUser.email);
        expect(errorText).not.toContain(loginUser.password);
      });
    },
  );
});
