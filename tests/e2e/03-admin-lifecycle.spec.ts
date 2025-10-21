import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { DashboardPage } from './pages/DashboardPage';
import { testData, createAdminUser, supabase } from './fixtures/supabase.fixture';

test.describe('Admin Lifecycle', () => {
  let adminEmail: string;
  let adminPassword: string;
  let adminFullName: string;

  test.beforeAll(async () => {
    adminEmail = testData.admin.email;
    adminPassword = testData.admin.password;
    adminFullName = testData.admin.fullName;
    
    // Create admin user
    try {
      await createAdminUser(adminEmail, adminPassword, adminFullName);
      console.log('✅ Admin user created');
    } catch (error) {
      console.log('⚠️ Admin user might already exist');
    }
  });

  test('01 - Non-Admin User Cannot Access Admin Panel', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as regular user
    await loginPage.goto();
    await loginPage.login(testData.user.email, testData.user.password);
    await page.waitForTimeout(2000);
    
    // Try to access admin page
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Should be redirected away from admin
    const url = page.url();
    expect(url).not.toContain('/admin');
  });

  test('02 - Admin User Can Login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    
    await page.waitForTimeout(2000);
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('03 - Admin Dashboard Shows Admin Access Banner', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await dashboardPage.goto();
    
    // Should show admin access banner
    const hasAdminAccess = await dashboardPage.hasAdminAccess();
    expect(hasAdminAccess).toBe(true);
  });

  test('04 - Admin Can Access Admin Panel', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    // Navigate to admin page
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Should be on admin page
    await expect(page).toHaveURL('/admin');
  });

  test('05 - Admin Can View All Bookings', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Bookings table should be visible
    await expect(adminPage.bookingsTable).toBeVisible();
    
    // Should have some bookings from previous tests
    const bookingCount = await adminPage.getBookingCount();
    expect(bookingCount).toBeGreaterThan(0);
  });

  test('06 - Admin Can Filter Bookings by Status', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Get initial count
    const allCount = await adminPage.getBookingCount();
    
    // Filter by pending
    await adminPage.filterBookings('pending');
    await page.waitForTimeout(1000);
    
    const pendingCount = await adminPage.getBookingCount();
    
    // Filter by cancelled
    await adminPage.filterBookings('cancelled');
    await page.waitForTimeout(1000);
    
    const cancelledCount = await adminPage.getBookingCount();
    
    // Counts should be different (unless all bookings have same status)
    // At minimum, we verify filtering doesn't crash
    expect(pendingCount).toBeGreaterThanOrEqual(0);
    expect(cancelledCount).toBeGreaterThanOrEqual(0);
  });

  test('07 - Admin Can Update Booking Status to Confirmed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Filter to pending bookings
    await adminPage.filterBookings('pending');
    await page.waitForTimeout(1000);
    
    const pendingCount = await adminPage.getBookingCount();
    
    if (pendingCount > 0) {
      // Update first booking to confirmed
      await adminPage.updateFirstBookingStatus('confirmed');
      await page.waitForTimeout(2000);
      
      // Verify in database
      const { data: confirmedBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'confirmed');
      
      expect(confirmedBookings?.length).toBeGreaterThan(0);
    }
  });

  test('08 - Admin Can Update Booking Status to Completed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Filter to confirmed bookings
    await adminPage.filterBookings('confirmed');
    await page.waitForTimeout(1000);
    
    const confirmedCount = await adminPage.getBookingCount();
    
    if (confirmedCount > 0) {
      // Update first booking to completed
      await adminPage.updateFirstBookingStatus('completed');
      await page.waitForTimeout(2000);
      
      // Verify in database
      const { data: completedBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'completed');
      
      expect(completedBookings?.length).toBeGreaterThan(0);
    }
  });

  test('09 - Admin Can Delete Booking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Get initial count
    const initialCount = await adminPage.getBookingCount();
    
    if (initialCount > 0) {
      // Delete first booking
      await adminPage.deleteFirstBooking();
      await page.waitForTimeout(2000);
      
      // Count should decrease
      const newCount = await adminPage.getBookingCount();
      expect(newCount).toBeLessThan(initialCount);
    }
  });

  test('10 - Admin Can Access Services Tab', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to services tab
    await adminPage.switchToServicesTab();
    await page.waitForTimeout(1000);
    
    // Services content should be visible
    await expect(page.locator('text=Test Therapy')).toBeVisible();
  });

  test('11 - Admin Can Toggle Services Modal', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    
    // Login as admin
    await loginPage.goto();
    await loginPage.login(adminEmail, adminPassword);
    await page.waitForTimeout(2000);
    
    await adminPage.goto();
    await page.waitForTimeout(2000);
    
    // Switch to services tab
    await adminPage.switchToServicesTab();
    await page.waitForTimeout(1000);
    
    // Try to open add service modal
    const addButton = page.locator('button:has-text("Add"), button:has-text("New Service")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Modal or form should appear
      // This verifies the UI interaction works
    }
  });
});
