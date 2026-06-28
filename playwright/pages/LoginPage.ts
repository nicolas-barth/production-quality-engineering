import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('account/login');
    await this.waitForPageLoad();
  }

  // ─── Locators ─────────────────────────────────────────────────────────────

  get emailInput(): Locator {
    return this.page.locator('#input-email');
  }

  get passwordInput(): Locator {
    return this.page.locator('#input-password');
  }

  get loginButton(): Locator {
    return this.page.locator('input[value="Login"], button[type="submit"]').first();
  }

  get forgotPasswordLink(): Locator {
    return this.page.locator('a[href*="route=account/forgotten"]');
  }

  get rememberMeCheckbox(): Locator {
    return this.page.locator('input[name="remember"]');
  }

  get loginErrorAlert(): Locator {
    return this.page.locator('.alert-danger');
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────

  get forgotPasswordEmailInput(): Locator {
    return this.page.locator('#input-email');
  }

  get forgotPasswordSubmitButton(): Locator {
    return this.page.locator('input[value="Continue"]');
  }

  get forgotPasswordSuccessAlert(): Locator {
    return this.page.locator('.alert-success');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForPageLoad();
  }

  async loginWithRememberMe(email: string, password: string): Promise<void> {
    await this.rememberMeCheckbox.check();
    await this.login(email, password);
  }

  async getErrorMessage(): Promise<string | null> {
    await this.loginErrorAlert.waitFor({ state: 'visible' });
    return this.loginErrorAlert.textContent();
  }

  async isLoginErrorVisible(): Promise<boolean> {
    return this.loginErrorAlert.isVisible();
  }

  async submitForgotPassword(email: string): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.waitForPageLoad();
    await this.forgotPasswordEmailInput.fill(email);
    await this.forgotPasswordSubmitButton.click();
    await this.waitForPageLoad();
  }
}
