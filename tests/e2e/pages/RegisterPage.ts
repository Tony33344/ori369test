import { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator('input[type="text"]').first();
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.loginLink = page.locator('a[href="/prijava"]');
  }

  async goto() {
    await this.page.goto('/registracija');
  }

  async register(fullName: string, email: string, password: string) {
    await this.fullNameInput.fill(fullName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async waitForSuccessToast() {
    await this.page.waitForSelector('.Toaster', { timeout: 5000 });
  }

  async waitForRedirect() {
    await this.page.waitForURL('/prijava', { timeout: 10000 });
  }
}
