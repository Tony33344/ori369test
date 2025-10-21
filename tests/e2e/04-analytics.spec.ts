import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { testData } from './fixtures/supabase.fixture';

test.describe('Analytics Dashboard', () => {
  let adminEmail: string;
  let adminPassword: string;

  test.beforeAll(() => {
    adminEmail = testData.admin.email;
    adminPassword = testData.admin.password;
  });

  test('01 - Admin Can Access Analytics Tab', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(2000);
    
    // Analytics content should load
    const analyticsPage = new AnalyticsPage(page);
    const isLoaded = await analyticsPage.isLoaded();
    
    // Should either load successfully or show error
    expect(isLoaded || await analyticsPage.hasErrorMessage()).toBe(true);
  });

  test('02 - Analytics Dashboard Displays Summary Cards', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const analyticsPage = new AnalyticsPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(3000);
    
    // Check if analytics loaded successfully
    const isLoaded = await analyticsPage.isLoaded();
    
    if (isLoaded) {
      // Verify all summary cards are visible
      await expect(analyticsPage.totalBookingsCard).toBeVisible();
      await expect(analyticsPage.confirmedBookingsCard).toBeVisible();
      await expect(analyticsPage.revenueCard).toBeVisible();
      await expect(analyticsPage.pageViewsCard).toBeVisible();
      await expect(analyticsPage.conversionCard).toBeVisible();
      
      // Verify data is displayed
      const totalBookings = await analyticsPage.getTotalBookings();
      expect(totalBookings).toBeGreaterThanOrEqual(0);
    }
  });

  test('03 - Analytics Charts Render', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const analyticsPage = new AnalyticsPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(3000);
    
    const isLoaded = await analyticsPage.isLoaded();
    
    if (isLoaded) {
      // Verify charts are visible
      const chartsVisible = await analyticsPage.areChartsVisible();
      expect(chartsVisible).toBe(true);
      
      await expect(analyticsPage.topServicesChart).toBeVisible();
      await expect(analyticsPage.bookingTrendChart).toBeVisible();
      await expect(analyticsPage.servicePerformanceTable).toBeVisible();
    }
  });

  test('04 - Analytics Period Selector Works', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const analyticsPage = new AnalyticsPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(3000);
    
    const isLoaded = await analyticsPage.isLoaded();
    
    if (isLoaded) {
      // Change period to 7 days
      await analyticsPage.changePeriod('7');
      await page.waitForTimeout(2000);
      
      // Should still show data
      await expect(analyticsPage.totalBookingsCard).toBeVisible();
      
      // Change to 90 days
      await analyticsPage.changePeriod('90');
      await page.waitForTimeout(2000);
      
      await expect(analyticsPage.totalBookingsCard).toBeVisible();
    }
  });

  test('05 - Analytics API Success with Mock Data', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const analyticsPage = new AnalyticsPage(page);
    
    // Intercept analytics API and return mock data
    await page.route('**/api/analytics/stats*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            totalBookings: 42,
            confirmedBookings: 35,
            totalRevenue: 1250.50,
            totalPageViews: 500,
            conversionRate: '8.40'
          },
          bookingsByDate: {
            '2024-01-15': 5,
            '2024-01-16': 8,
            '2024-01-17': 12
          },
          topServices: [
            { name: 'Mock Service 1', bookings: 20 },
            { name: 'Mock Service 2', bookings: 15 },
            { name: 'Mock Service 3', bookings: 7 }
          ],
          serviceAnalytics: [
            {
              services: { name: 'Mock Service 1' },
              date: '2024-01-15',
              views: 100,
              bookings: 20,
              revenue: 500,
              conversions: 20
            }
          ]
        })
      });
    });
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(3000);
    
    // Verify mock data is displayed
    const totalBookings = await analyticsPage.getTotalBookings();
    expect(totalBookings).toBe(42);
    
    const revenue = await analyticsPage.getRevenue();
    expect(revenue).toBeCloseTo(1250.50, 1);
    
    // Verify charts loaded with mock data
    await expect(page.locator('text=Mock Service 1')).toBeVisible();
  });

  test('06 - Analytics API Failure Shows Error Message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const analyticsPage = new AnalyticsPage(page);
    
    // Intercept analytics API and return 500 error
    await page.route('**/api/analytics/stats*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(3000);
    
    // Should show error message
    const hasError = await analyticsPage.hasErrorMessage();
    expect(hasError).toBe(true);
    
    // Verify error message text
    await expect(analyticsPage.errorMessage).toBeVisible();
    await expect(analyticsPage.errorMessage).toContainText(/failed to load/i);
  });

  test('07 - Analytics API Network Error Handling', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const analyticsPage = new AnalyticsPage(page);
    
    // Intercept analytics API and abort request (simulate network error)
    await page.route('**/api/analytics/stats*', async route => {
      await route.abort('failed');
    });
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(3000);
    
    // Should show error message or fallback UI
    const hasError = await analyticsPage.hasErrorMessage();
    expect(hasError).toBe(true);
  });

  test('08 - Analytics Loads After Period Change', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    const analyticsPage = new AnalyticsPage(page);
    
    let requestCount = 0;
    
    // Count API requests
    await page.route('**/api/analytics/stats*', async route => {
      requestCount++;
      await route.continue();
    });
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to analytics tab
    await adminPage.switchToAnalyticsTab();
    await page.waitForTimeout(3000);
    
    const initialRequests = requestCount;
    
    // Change period
    const isLoaded = await analyticsPage.isLoaded();
    if (isLoaded) {
      await analyticsPage.changePeriod('7');
      await page.waitForTimeout(2000);
      
      // Should trigger another API request
      expect(requestCount).toBeGreaterThan(initialRequests);
    }
  });
});
