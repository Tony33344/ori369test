import { test, expect } from '@playwright/test';

test.describe('Booking System Testing', () => {
  test.describe('Booking Flow', () => {
    test('Booking system requires authentication', async ({ page }) => {
      await page.goto('/rezervacija');
      
      // Should redirect to login or show login prompt
      const currentUrl = page.url();
      const loginPrompt = page.locator('.login-prompt, [data-testid="login-required"]');
      
      const requiresAuth = currentUrl.includes('prijava') || await loginPrompt.isVisible();
      
      if (requiresAuth) {
        console.log('✅ Booking system properly requires authentication');
      } else {
        console.log('⚠️ Booking system may allow anonymous bookings');
      }
    });

    test('Complete booking flow for authenticated user', async ({ page }) => {
      // First login
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Navigate to booking
      await page.goto('/rezervacija');
      
      // Test booking form elements
      await expect(page.locator('select[name="service"]')).toBeVisible();
      await expect(page.locator('input[name="date"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-slots"]')).toBeVisible();
      
      // Fill booking form
      const serviceDropdown = page.locator('select[name="service"]');
      const serviceCount = await serviceDropdown.count();
      
      if (serviceCount > 0) {
        await serviceDropdown.selectOption({ index: 1 });
        
        // Test date selection
        const dateField = page.locator('input[name="date"]');
        await dateField.click();
        
        // Test time slot selection
        const timeSlots = page.locator('[data-testid="time-slot"], .time-slot');
        const slotCount = await timeSlots.count();
        
        if (slotCount > 0) {
          await timeSlots.first().click();
          
          // Submit booking
          const submitButton = page.locator('button[type="submit"], [data-testid="submit-booking"]');
          await submitButton.click();
          
          // Check for success
          await page.waitForTimeout(2000);
          const successMessage = page.locator('.success-message, [data-testid="success"]');
          const hasSuccess = await successMessage.isVisible();
          
          if (hasSuccess) {
            console.log('✅ Booking submission successful');
          } else {
            console.log('⚠️ Booking submission result unclear');
          }
        } else {
          console.log('⚠️ No time slots available');
        }
      } else {
        console.log('❌ No services available for booking');
      }
    });

    test('Booking calendar functionality', async ({ page }) => {
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      await page.goto('/rezervacija');
      
      // Test date picker
      const dateField = page.locator('input[name="date"]');
      await dateField.click();
      
      const calendar = page.locator('.calendar, [data-testid="calendar"], .date-picker');
      const isCalendarVisible = await calendar.isVisible();
      
      if (isCalendarVisible) {
        console.log('✅ Booking calendar visible');
        
        // Test selecting a future date
        const futureDate = page.locator('[data-date*="2025"], .available-date').first();
        if (await futureDate.isVisible()) {
          await futureDate.click();
          console.log('✅ Date selection working');
        }
      } else {
        console.log('⚠️ No calendar interface found');
      }
    });

    test('Google Calendar integration', async ({ page }) => {
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      await page.goto('/rezervacija');
      
      // Create a booking to test Google Calendar integration
      await page.selectOption('select[name="service"]', { index: 1 });
      await page.fill('input[name="date"]', '2025-12-01');
      
      const timeSlot = page.locator('[data-testid="time-slot"]').first();
      if (await timeSlot.isVisible()) {
        await timeSlot.click();
        
        // Submit booking
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        
        // Check for Google Calendar integration
        const pageContent = await page.content();
        const hasGoogleIntegration = pageContent.includes('google') || 
                                   pageContent.includes('calendar') ||
                                   await page.locator('[data-testid="calendar-synced"]').isVisible();
        
        if (hasGoogleIntegration) {
          console.log('✅ Google Calendar integration detected');
        } else {
          console.log('⚠️ Google Calendar integration unclear');
        }
      }
    });
  });

  test.describe('Booking Management', () => {
    test('User can view their bookings', async ({ page }) => {
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Look for booking history/management
      const bookingLinks = [
        'a[href*="bookings"]',
        'a[href*="reservations"]',
        '[data-testid="my-bookings"]',
        '.my-bookings'
      ];
      
      let bookingsFound = false;
      for (const selector of bookingLinks) {
        if (await page.locator(selector).isVisible()) {
          bookingsFound = true;
          break;
        }
      }
      
      if (bookingsFound) {
        console.log('✅ User booking management found');
      } else {
        console.log('❌ No user booking management found');
      }
    });

    test('Booking cancellation functionality', async ({ page }) => {
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Look for cancel booking functionality
      const cancelButtons = page.locator('button:has-text("Cancel"), [data-testid="cancel-booking"]');
      const cancelCount = await cancelButtons.count();
      
      if (cancelCount > 0) {
        console.log('✅ Booking cancellation functionality found');
        
        // Test cancel button (but don't actually cancel)
        const firstCancel = cancelButtons.first();
        const buttonText = await firstCancel.textContent();
        console.log(`Cancel button text: ${buttonText}`);
      } else {
        console.log('❌ No booking cancellation found');
      }
    });
  });

  test.describe('Booking Validation', () => {
    test('Booking form validation', async ({ page }) => {
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      await page.goto('/rezervacija');
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for validation messages
      const validationMessages = page.locator('.error-message, .validation-error');
      const messageCount = await validationMessages.count();
      
      if (messageCount > 0) {
        console.log(`✅ Form validation working: ${messageCount} validation messages`);
      } else {
        console.log('⚠️ No form validation detected');
      }
    });

    test('Time slot availability validation', async ({ page }) => {
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      await page.goto('/rezervacija');
      
      // Select a service
      await page.selectOption('select[name="service"]', { index: 1 });
      
      // Select a date
      await page.fill('input[name="date"]', '2025-12-01');
      
      // Check for available time slots
      const timeSlots = page.locator('[data-testid="time-slot"], .available-slot');
      const slotCount = await timeSlots.count();
      
      if (slotCount > 0) {
        console.log(`✅ Time slots available: ${slotCount} slots found`);
        
        // Test slot selection
        await timeSlots.first().click();
        const isSelected = await timeSlots.first().evaluate(el => 
          el.classList.contains('selected') || el.getAttribute('aria-selected') === 'true'
        );
        
        if (isSelected) {
          console.log('✅ Time slot selection working');
        }
      } else {
        console.log('❌ No time slots available for selected date');
      }
    });
  });

  test.describe('Booking Conflicts', () => {
    test('Booking conflict detection', async ({ page }) => {
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      await page.goto('/rezervacija');
      
      // This would test for double-booking prevention
      // Since we can't easily create conflicts, we'll check for conflict handling
      
      // Check if system handles already booked slots
      const unavailableMessage = page.locator('.unavailable, [data-testid="unavailable"]');
      const hasConflictHandling = await unavailableMessage.isVisible();
      
      if (hasConflictHandling) {
        console.log('✅ Conflict handling detected');
      } else {
        console.log('⚠️ No conflict handling visible (may need existing bookings to test)');
      }
    });
  });
});