import { Page, Locator } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly totalBookingsCard: Locator;
  readonly confirmedBookingsCard: Locator;
  readonly revenueCard: Locator;
  readonly pageViewsCard: Locator;
  readonly conversionCard: Locator;
  readonly topServicesChart: Locator;
  readonly bookingTrendChart: Locator;
  readonly servicePerformanceTable: Locator;
  readonly periodSelector: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalBookingsCard = page.locator('text=Total Bookings').locator('..');
    this.confirmedBookingsCard = page.locator('text=Confirmed').locator('..');
    this.revenueCard = page.locator('text=Revenue').locator('..');
    this.pageViewsCard = page.locator('text=Page Views').locator('..');
    this.conversionCard = page.locator('text=Conversion').locator('..');
    this.topServicesChart = page.locator('text=Top Services').locator('..');
    this.bookingTrendChart = page.locator('text=Booking Trend').locator('..');
    this.servicePerformanceTable = page.locator('text=Service Performance').locator('..');
    this.periodSelector = page.locator('select');
    this.errorMessage = page.locator('text=Failed to load analytics data');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.totalBookingsCard.waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async getTotalBookings(): Promise<number> {
    const text = await this.totalBookingsCard.locator('p').first().textContent();
    return parseInt(text || '0');
  }

  async getRevenue(): Promise<number> {
    const text = await this.revenueCard.locator('p').first().textContent();
    const match = text?.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async changePeriod(period: '7' | '30' | '90') {
    await this.periodSelector.selectOption(period);
  }

  async areChartsVisible(): Promise<boolean> {
    const topServicesVisible = await this.topServicesChart.isVisible();
    const trendVisible = await this.bookingTrendChart.isVisible();
    return topServicesVisible && trendVisible;
  }
}
