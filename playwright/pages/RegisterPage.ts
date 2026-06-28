import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { UserData } from '../data/users';

export class RegisterPage extends BasePage {
  async goto(): Promise<void> {
    await super.goto('account/register');
    await this.waitForPageLoad();
  }

  // ─── Form Fields ──────────────────────────────────────────────────────────

  get firstNameInput(): Locator {
    return this.page.locator('#input-firstname');
  }
  get lastNameInput(): Locator {
    return this.page.locator('#input-lastname');
  }
  get emailInput(): Locator {
    return this.page.locator('#input-email');
  }
  get telephoneInput(): Locator {
    return this.page.locator('#input-telephone');
  }
  get passwordInput(): Locator {
    return this.page.locator('#input-password');
  }
  get confirmPasswordInput(): Locator {
    return this.page.locator('#input-confirm');
  }

  get newsletterYesRadio(): Locator {
    return this.page.locator('#input-newsletter-yes');
  }

  get newsletterNoRadio(): Locator {
    return this.page.locator('#input-newsletter-no');
  }

  get privacyPolicyCheckbox(): Locator {
    return this.page.locator('input[name="agree"]');
  }

  get submitButton(): Locator {
    return this.page.locator('input[value="Continue"]');
  }

  // ─── Validation Feedback ──────────────────────────────────────────────────

  get firstNameError(): Locator {
    return this.page.locator('#error-firstname');
  }
  get lastNameError(): Locator {
    return this.page.locator('#error-lastname');
  }
  get emailError(): Locator {
    return this.page.locator('#error-email');
  }
  get telephoneError(): Locator {
    return this.page.locator('#error-telephone');
  }
  get passwordError(): Locator {
    return this.page.locator('#error-password');
  }
  get confirmError(): Locator {
    return this.page.locator('#error-confirm');
  }

  get warningAlert(): Locator {
    return this.page.locator('.alert-danger');
  }

  get successAlert(): Locator {
    return this.page.locator('.alert-success');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async fillRegistrationForm(user: UserData): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.telephoneInput.fill(user.telephone);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
  }

  async register(user: UserData, subscribeNewsletter = false): Promise<void> {
    await this.fillRegistrationForm(user);
    if (subscribeNewsletter) {
      await this.newsletterYesRadio.check();
    }
    await this.privacyPolicyCheckbox.check();
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async registerWithPassword(
    user: UserData,
    password: string,
    confirmPassword: string,
  ): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.telephoneInput.fill(user.telephone);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.privacyPolicyCheckbox.check();
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async getWarningText(): Promise<string | null> {
    return this.warningAlert.textContent();
  }

  async isWarningVisible(): Promise<boolean> {
    return this.warningAlert.isVisible();
  }

  async getAllValidationErrors(): Promise<string[]> {
    const errorLocators = [
      this.firstNameError,
      this.lastNameError,
      this.emailError,
      this.telephoneError,
      this.passwordError,
      this.confirmError,
    ];
    const errors: string[] = [];
    for (const loc of errorLocators) {
      if (await loc.isVisible()) {
        const text = await loc.textContent();
        if (text) errors.push(text.trim());
      }
    }
    return errors;
  }
}
