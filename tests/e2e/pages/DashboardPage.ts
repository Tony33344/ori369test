import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly totalBookingsCard: Locator;
  readonly activeBookingsCard: Locator;
  readonly newBookingButton: Locator;
  readonly adminAccessBanner: Locator;
  readonly goToAdminButton: Locator;
  readonly bookingsTable: Locator;
  readonly cancelButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.locator('h1').first();
    this.totalBookingsCard = page.locator('text=Total Bookings').locator('..');
    this.activeBookingsCard = page.locator('text=Active Bookings').locator('..');
    this.newBookingButton = page.locator('a[href="/rezervacija"]').first();
    this.adminAccessBanner = page.locator('text=Admin Access').locator('..');
    this.goToAdminButton = page.locator('a[href="/admin"]');
    this.bookingsTable = page.locator('.divide-y');
    this.cancelButtons = page.locator('button:has-text("Cancel")');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getTotalBookings(): Promise<number> {
    const text = await this.totalBookingsCard.locator('p').first().textContent();
    return parseInt(text || '0');
  }

  async getActiveBookings(): Promise<number> {
    const text = await this.activeBookingsCard.locator('p').first().textContent();
    return parseInt(text || '0');
  }

  async clickNewBooking() {
    await this.newBookingButton.click();
  }

  async cancelFirstBooking() {
    await this.cancelButtons.first().click();
    // Confirm the dialog
    this.page.on('dialog', dialog => dialog.accept());
  }

  async hasAdminAccess(): Promise<boolean> {
    return await this.adminAccessBanner.isVisible();
  }

  async goToAdmin() {
    await this.goToAdminButton.click();
  }
}
