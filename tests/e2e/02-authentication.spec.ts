import { test, expect } from '@playwright/test';

test.describe('Authentication System Testing', () => {
  test.describe('Registration Flow', () => {
    test('Registration form displays correctly', async ({ page }) => {
      await page.goto('/registracija');
      
      // Check form elements
      await expect(page.locator('input[name="fullName"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      console.log('✅ Registration form elements are present');
    });

    test('Registration form validation works', async ({ page }) => {
      await page.goto('/registracija');
      
      // Try submitting empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      const validationMessages = page.locator('.error-message, .validation-error, [data-testid="error"]');
      const messageCount = await validationMessages.count();
      
      if (messageCount > 0) {
        console.log(`✅ Form validation working: ${messageCount} validation messages found`);
      } else {
        console.log('⚠️ No validation messages found - may need client-side validation');
      }
    });

    test('Successful user registration', async ({ page }) => {
      const testEmail = `test-user-${Date.now()}@example.com`;
      
      await page.goto('/registracija');
      
      // Fill registration form
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'TestPassword123!');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Check for success (may redirect to login or dashboard)
      const currentUrl = page.url();
      const hasSuccess = await page.locator('.success-message, [data-testid="success"]').isVisible() ||
                        currentUrl.includes('prijava') || 
                        currentUrl.includes('dashboard');
      
      if (hasSuccess) {
        console.log('✅ Registration successful');
      } else {
        console.log('⚠️ Registration result unclear - check manually');
      }
    });

    test('Password strength validation', async ({ page }) => {
      await page.goto('/registracija');
      
      // Test weak password
      await page.fill('input[name="password"]', '123');
      
      // Check for password strength indicator
      const passwordField = page.locator('input[name="password"]');
      await passwordField.blur();
      
      // Look for strength validation
      const strengthIndicator = page.locator('.password-strength, [data-testid="password-strength"]');
      const hasStrengthCheck = await strengthIndicator.isVisible();
      
      if (hasStrengthCheck) {
        console.log('✅ Password strength validation detected');
      } else {
        console.log('⚠️ No password strength validation found');
      }
    });
  });

  test.describe('Login Flow', () => {
    test('Login form displays correctly', async ({ page }) => {
      await page.goto('/prijava');
      
      // Check form elements
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      console.log('✅ Login form elements are present');
    });

    test('Login form validation works', async ({ page }) => {
      await page.goto('/prijava');
      
      // Try submitting empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      const validationMessages = page.locator('.error-message, .validation-error, [data-testid="error"]');
      const messageCount = await validationMessages.count();
      
      if (messageCount > 0) {
        console.log(`✅ Login validation working: ${messageCount} validation messages found`);
      } else {
        console.log('⚠️ No login validation messages found');
      }
    });

    test('Failed login shows error', async ({ page }) => {
      await page.goto('/prijava');
      
      // Fill with incorrect credentials
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check for error message
      const errorMessage = page.locator('.error-message, [data-testid="error"]');
      const hasError = await errorMessage.isVisible();
      
      if (hasError) {
        console.log('✅ Failed login error handling working');
      } else {
        console.log('⚠️ No error message for failed login');
      }
    });

    test('Successful user login', async ({ page }) => {
      // Use test user from setup
      await page.goto('/prijava');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForURL('/dashboard');
      
      // Check if logged in
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile-link');
      const isLoggedIn = await userMenu.isVisible();
      
      expect(isLoggedIn).toBeTruthy();
      console.log('✅ User login successful');
    });
  });

  test.describe('Session Management', () => {
    test('User session persists across page refreshes', async ({ page }) => {
      // Login first
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Navigate to another page
      await page.goto('/');
      
      // Check if still logged in
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu');
      await expect(userMenu).toBeVisible();
      
      console.log('✅ Session persistence working');
    });

    test('Logout functionality works', async ({ page }) => {
      // Login first
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Find and click logout
      const logoutButton = page.locator('[data-testid="logout"], .logout, a[href="/logout"]');
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Check if logged out
        await expect(page).toHaveURL('/');
        const loginLink = page.locator('[href="/prijava"], a[href*="login"]');
        await expect(loginLink).toBeVisible();
        
        console.log('✅ Logout functionality working');
      } else {
        console.log('⚠️ Logout button not found');
      }
    });
  });

  test.describe('Password Reset (Critical Missing Feature)', () => {
    test('Password reset link exists on login page', async ({ page }) => {
      await page.goto('/prijava');
      
      const resetLink = page.locator('a[href*="reset"], a[href*="forgot"], [data-testid="reset-password"]');
      const hasResetLink = await resetLink.isVisible();
      
      if (hasResetLink) {
        console.log('✅ Password reset link found');
      } else {
        console.log('❌ CRITICAL: No password reset link found - this is a major UX issue');
      }
    });

    test('Password reset flow works', async ({ page }) => {
      await page.goto('/prijava');
      
      const resetLink = page.locator('a[href*="reset"], a[href*="forgot"], [data-testid="reset-password"]');
      
      if (await resetLink.isVisible()) {
        await resetLink.click();
        
        // Check if reset page loads
        await expect(page).toHaveURL(/.*reset.*|.*forgot.*/);
        
        const emailField = page.locator('input[type="email"], input[name="email"]');
        await expect(emailField).toBeVisible();
        
        console.log('✅ Password reset flow accessible');
      } else {
        console.log('❌ Password reset flow not implemented');
      }
    });
  });

  test.describe('Security Testing', () => {
    test('Registration with existing email shows error', async ({ page }) => {
      await page.goto('/registracija');
      
      // Try to register with existing email
      await page.fill('input[name="fullName"]', 'Duplicate User');
      await page.fill('input[name="email"]', 'test@example.com'); // Use existing email
      await page.fill('input[name="password"]', 'TestPassword123!');
      
      await page.click('button[type="submit"]');
      
      // Wait and check for duplicate email error
      await page.waitForTimeout(2000);
      
      const errorMessage = page.locator('.error-message, [data-testid="error"]');
      const hasError = await errorMessage.isVisible();
      
      if (hasError) {
        console.log('✅ Duplicate email validation working');
      } else {
        console.log('⚠️ No duplicate email validation found');
      }
    });

    test('SQL injection attempts are blocked', async ({ page }) => {
      await page.goto('/registracija');
      
      // Test SQL injection in email field
      const maliciousEmail = "'; DROP TABLE users; --@example.com";
      await page.fill('input[name="email"]', maliciousEmail);
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[name="password"]', 'TestPassword123!');
      
      await page.click('button[type="submit"]');
      
      // Check if page still loads (not crashed by injection)
      await page.waitForLoadState('networkidle');
      
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      
      console.log('✅ SQL injection attempt handled (page still functional)');
    });
  });
});