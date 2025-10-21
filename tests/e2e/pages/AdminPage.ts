import { Page, Locator } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly bookingsTab: Locator;
  readonly servicesTab: Locator;
  readonly analyticsTab: Locator;
  readonly bookingsTable: Locator;
  readonly filterSelect: Locator;
  readonly statusButtons: Locator;
  readonly deleteButtons: Locator;
  readonly addServiceButton: Locator;
  readonly serviceModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bookingsTab = page.locator('button:has-text("Bookings")');
    this.servicesTab = page.locator('button:has-text("Services")');
    this.analyticsTab = page.locator('button:has-text("Analytics")');
    this.bookingsTable = page.locator('table').first();
    this.filterSelect = page.locator('select').first();
    this.statusButtons = page.locator('button:has-text("Confirm"), button:has-text("Complete")');
    this.deleteButtons = page.locator('button[title*="Delete"], button:has-text("Delete")');
    this.addServiceButton = page.locator('button:has-text("Add Service")');
    this.serviceModal = page.locator('[role="dialog"]');
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async switchToBookingsTab() {
    await this.bookingsTab.click();
  }

  async switchToServicesTab() {
    await this.servicesTab.click();
  }

  async switchToAnalyticsTab() {
    await this.analyticsTab.click();
  }

  async filterBookings(status: string) {
    await this.filterSelect.selectOption(status);
  }

  async getBookingCount(): Promise<number> {
    const rows = await this.bookingsTable.locator('tbody tr').count();
    return rows;
  }

  async updateFirstBookingStatus(status: 'confirmed' | 'completed') {
    const button = this.page.locator(`button:has-text("${status === 'confirmed' ? 'Confirm' : 'Complete'}")`).first();
    await button.click();
  }

  async deleteFirstBooking() {
    this.page.on('dialog', dialog => dialog.accept());
    await this.deleteButtons.first().click();
  }

  async openAddServiceModal() {
    await this.addServiceButton.click();
  }

  async isServiceModalVisible(): Promise<boolean> {
    return await this.serviceModal.isVisible();
  }

  async waitForRedirectToHome() {
    await this.page.waitForURL('/', { timeout: 5000 });
  }
}
