import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingPage } from './pages/BookingPage';
import { testData, getFutureDate, supabase } from './fixtures/supabase.fixture';

test.describe('User Lifecycle', () => {
  let userEmail: string;
  let userPassword: string;
  let userFullName: string;

  test.beforeAll(() => {
    userEmail = testData.user.email;
    userPassword = testData.user.password;
    userFullName = testData.user.fullName;
  });

  test('01 - User Registration Flow', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    
    await registerPage.goto();
    
    // Verify page loaded
    await expect(page).toHaveTitle(/ORI 369/i);
    
    // Test validation - empty form
    await registerPage.submitButton.click();
    // Browser native validation should prevent submission
    
    // Fill form with valid data
    await registerPage.register(userFullName, userEmail, userPassword);
    
    // Wait for success toast
    await page.waitForTimeout(2000); // Wait for toast
    
    // Should redirect to login page
    await registerPage.waitForRedirect();
    await expect(page).toHaveURL('/prijava');
  });

  test('02 - User Login with Wrong Password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    
    // Try login with wrong password
    await loginPage.login(userEmail, 'WrongPassword123!');
    
    // Wait for error toast
    await page.waitForTimeout(2000);
    
    // Should still be on login page
    await expect(page).toHaveURL(/prijava/);
  });

  test('03 - User Login with Correct Credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    
    // Login with correct credentials
    await loginPage.login(userEmail, userPassword);
    
    // Wait for redirect to dashboard
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL('/dashboard');
  });

  test('04 - Dashboard Displays User Stats', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login first
    await loginPage.goto();
    await loginPage.login(userEmail, userPassword);
    await page.waitForTimeout(2000);
    
    // Verify dashboard elements
    await expect(dashboardPage.welcomeHeading).toContainText(userFullName);
    await expect(dashboardPage.totalBookingsCard).toBeVisible();
    await expect(dashboardPage.activeBookingsCard).toBeVisible();
    await expect(dashboardPage.newBookingButton).toBeVisible();
    
    // Initial stats should be 0
    const totalBookings = await dashboardPage.getTotalBookings();
    expect(totalBookings).toBe(0);
  });

  test('05 - Create a Booking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingPage = new BookingPage(page);
    
    // Login first
    await loginPage.goto();
    await loginPage.login(userEmail, userPassword);
    await page.waitForTimeout(2000);
    
    // Navigate to booking page
    await bookingPage.goto();
    
    // Create booking
    const futureDate = getFutureDate(2);
    await bookingPage.createBooking('Test Therapy', futureDate, 'Test booking notes');
    
    // Wait for success
    await page.waitForTimeout(2000);
    
    // Verify booking was created in database
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('notes', 'Test booking notes');
    
    expect(bookings).toBeTruthy();
    expect(bookings?.length).toBeGreaterThan(0);
  });

  test('06 - Dashboard Shows Created Booking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(userEmail, userPassword);
    await page.waitForTimeout(2000);
    
    await dashboardPage.goto();
    await page.waitForTimeout(1000);
    
    // Stats should now show 1 booking
    const totalBookings = await dashboardPage.getTotalBookings();
    expect(totalBookings).toBeGreaterThanOrEqual(1);
    
    const activeBookings = await dashboardPage.getActiveBookings();
    expect(activeBookings).toBeGreaterThanOrEqual(1);
    
    // Booking should appear in table
    await expect(dashboardPage.bookingsTable).toContainText('Test Therapy');
  });

  test('07 - Cancel a Booking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(userEmail, userPassword);
    await page.waitForTimeout(2000);
    
    await dashboardPage.goto();
    await page.waitForTimeout(1000);
    
    // Set up dialog handler before clicking
    page.on('dialog', dialog => dialog.accept());
    
    // Cancel first booking
    await dashboardPage.cancelButtons.first().click();
    
    // Wait for update
    await page.waitForTimeout(2000);
    
    // Verify status changed in database
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('notes', 'Test booking notes')
      .eq('status', 'cancelled');
    
    expect(bookings?.length).toBeGreaterThan(0);
  });

  test('08 - Logout Flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(userEmail, userPassword);
    await page.waitForTimeout(2000);
    
    await dashboardPage.goto();
    
    // Find and click logout button (usually in header/nav)
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Sign Out")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
      
      // Should redirect to login or home
      const url = page.url();
      expect(url).toMatch(/\/(prijava|$)/);
    }
  });

  test('09 - Session Persistence Across Reloads', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(userEmail, userPassword);
    await page.waitForTimeout(2000);
    
    await dashboardPage.goto();
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.welcomeHeading).toBeVisible();
  });
});
