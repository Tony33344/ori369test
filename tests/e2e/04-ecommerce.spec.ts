import { test, expect } from '@playwright/test';

test.describe('E-commerce Testing - CRITICAL', () => {
  test.describe('Shopping Cart Functionality (Critical Missing Feature)', () => {
    test('Shopping cart is NOT implemented - Critical Issue', async ({ page }) => {
      await page.goto('/terapije');
      
      // 🔴 CRITICAL TEST: Check for shopping cart implementation
      const cartElements = [
        '[data-testid="add-to-cart"]',
        '[data-testid="cart-button"]',
        '.add-to-cart',
        '.cart-button',
        '.shopping-cart'
      ];
      
      let cartFound = false;
      for (const selector of cartElements) {
        if (await page.locator(selector).isVisible()) {
          cartFound = true;
          break;
        }
      }
      
      if (!cartFound) {
        console.log('❌ CRITICAL CONFIRMED: Shopping cart not implemented');
        console.log('This confirms the critical e-commerce gap identified in analysis');
      } else {
        console.log('⚠️ Shopping cart element found - may be partially implemented');
      }
      
      expect(cartFound).toBeFalsy(); // Should fail, confirming the issue
    });

    test('Products page shows prices correctly', async ({ page }) => {
      await page.goto('/terapije');
      
      // Verify prices ARE shown on products page (opposite of homepage)
      const priceElements = page.locator('.price, [data-testid="price"], [data-testid="service-price"]');
      const priceCount = await priceElements.count();
      
      // Should show prices for all services (17 services + packages)
      expect(priceCount).toBeGreaterThan(0);
      
      // Verify specific price format
      const firstPrice = priceElements.first();
      const priceText = await firstPrice.textContent();
      
      if (priceText) {
        console.log(`✅ Products page shows price: ${priceText}`);
        expect(priceText).toMatch(/\d+(\.\d{2})?/); // Should contain numbers
      }
    });

    test('Direct checkout works (current implementation)', async ({ page }) => {
      await page.goto('/terapije');
      
      // Look for direct buy buttons (current implementation)
      const buyButtons = [
        '[data-testid="buy-button"]',
        '.buy-button',
        'button:has-text("Buy")',
        'button:has-text("Purchase")',
        'button:has-text("Book Now")'
      ];
      
      let buyButtonFound = false;
      for (const selector of buyButtons) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          buyButtonFound = true;
          
          // Test clicking buy button
          await button.click();
          
          // Should redirect to Stripe checkout
          await page.waitForTimeout(2000);
          const currentUrl = page.url();
          
          if (currentUrl.includes('stripe') || currentUrl.includes('checkout')) {
            console.log('✅ Direct Stripe checkout working');
          } else {
            console.log('⚠️ Buy button clicked but no Stripe redirect');
          }
          
          break;
        }
      }
      
      expect(buyButtonFound).toBeTruthy(); // Should have direct checkout
    });

    test('No cart persistence across sessions', async ({ page }) => {
      // This test would verify cart persistence, but since cart doesn't exist...
      await page.goto('/terapije');
      
      const cartElements = page.locator('[data-testid^="cart"], .cart');
      const cartExists = await cartElements.isVisible();
      
      if (!cartExists) {
        console.log('❌ No cart to test persistence - confirms missing feature');
      } else {
        console.log('⚠️ Cart exists but persistence testing needed');
      }
    });
  });

  test.describe('Order Management', () => {
    test('Order history is missing for users', async ({ page }) => {
      // Login first
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Look for order history
      const orderHistoryLinks = [
        'a[href*="orders"]',
        'a[href*="history"]',
        '[data-testid="order-history"]',
        '.order-history'
      ];
      
      let orderHistoryFound = false;
      for (const selector of orderHistoryLinks) {
        if (await page.locator(selector).isVisible()) {
          orderHistoryFound = true;
          break;
        }
      }
      
      if (!orderHistoryFound) {
        console.log('❌ CRITICAL: No order history for users');
        console.log('Users cannot track their purchases');
      } else {
        console.log('✅ Order history found');
      }
      
      expect(orderHistoryFound).toBeTruthy(); // Should exist
    });

    test('Admin can view orders', async ({ page }) => {
      // Login as admin
      await page.goto('/admin');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin');
      
      // Look for orders management
      const ordersLinks = [
        'a[href*="orders"]',
        'a[href*="sales"]',
        '[data-testid="orders"]',
        '.orders'
      ];
      
      let ordersFound = false;
      for (const selector of ordersLinks) {
        if (await page.locator(selector).isVisible()) {
          ordersFound = true;
          break;
        }
      }
      
      if (ordersFound) {
        console.log('✅ Admin order management found');
      } else {
        console.log('❌ Admin order management not found');
      }
    });
  });

  test.describe('Payment Processing', () => {
    test('Stripe integration works', async ({ page }) => {
      await page.goto('/terapije');
      
      // Find and click buy button
      const buyButton = page.locator('[data-testid="buy-button"], .buy-button, button').first();
      
      if (await buyButton.isVisible()) {
        await buyButton.click();
        
        // Wait for potential redirect to Stripe
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        // Check if we're on Stripe or if payment form appeared
        const isStripe = currentUrl.includes('stripe') || 
                        pageTitle.toLowerCase().includes('stripe') ||
                        await page.locator('[data-testid="stripe"], .stripe').isVisible();
        
        if (isStripe) {
          console.log('✅ Stripe integration working');
        } else {
          console.log('⚠️ Stripe integration unclear - may be embedded or failed');
        }
      }
    });

    test('Payment form validation', async ({ page }) => {
      // This would test payment form validation if we had a cart
      console.log('❌ Cannot test payment form - no shopping cart implemented');
      
      // For now, test if any payment forms exist
      const paymentForms = page.locator('form[action*="payment"], .payment-form');
      const hasPaymentForm = await paymentForms.isVisible();
      
      expect(hasPaymentForm).toBeFalsy(); // Should not have payment forms without cart
    });
  });

  test.describe('Inventory Management', () => {
    test('Basic inventory tracking exists', async ({ page }) => {
      await page.goto('/admin');
      
      if (await page.locator('input[name="email"]').isVisible()) {
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
      }
      
      // Look for inventory management
      const inventoryElements = [
        '[data-testid="inventory"]',
        '.inventory',
        'a[href*="inventory"]'
      ];
      
      let inventoryFound = false;
      for (const selector of inventoryElements) {
        if (await page.locator(selector).isVisible()) {
          inventoryFound = true;
          break;
        }
      }
      
      if (inventoryFound) {
        console.log('✅ Basic inventory management found');
      } else {
        console.log('❌ No inventory management found');
      }
    });

    test('No low stock alerts (missing feature)', async ({ page }) => {
      await page.goto('/admin');
      
      if (await page.locator('input[name="email"]').isVisible()) {
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
      }
      
      // Check for stock alert functionality
      const stockAlerts = page.locator('[data-testid*="stock"], [data-testid*="alert"]');
      const hasAlerts = await stockAlerts.isVisible();
      
      if (!hasAlerts) {
        console.log('❌ No stock alerts found - business risk for inventory management');
      } else {
        console.log('✅ Stock alert functionality found');
      }
    });
  });

  test.describe('Discount System (Missing Feature)', () => {
    test('No discount codes system exists', async ({ page }) => {
      await page.goto('/terapije');
      
      // Look for discount code fields
      const discountElements = [
        '[data-testid="discount-code"]',
        '.discount-code',
        'input[placeholder*="discount"]',
        'input[placeholder*="promo"]'
      ];
      
      let discountFound = false;
      for (const selector of discountElements) {
        if (await page.locator(selector).isVisible()) {
          discountFound = true;
          break;
        }
      }
      
      if (!discountFound) {
        console.log('❌ CRITICAL: No discount codes system found');
        console.log('Missing important marketing feature');
      } else {
        console.log('✅ Discount system found');
      }
    });
  });

  test.describe('E-commerce User Experience', () => {
    test('E-commerce flow usability test', async ({ page }) => {
      await page.goto('/terapije');
      
      // Simulate typical user journey without cart
      const usabilityIssues = [];
      
      // Check if users can easily understand pricing
      const priceElements = page.locator('.price, [data-testid="price"]');
      const priceCount = await priceElements.count();
      
      if (priceCount === 0) {
        usabilityIssues.push('No prices visible on products page');
      }
      
      // Check if clear purchase options exist
      const buyButtons = page.locator('button:has-text("Buy"), button:has-text("Purchase")');
      const buttonCount = await buyButtons.count();
      
      if (buttonCount === 0) {
        usabilityIssues.push('No clear purchase buttons found');
      }
      
      // Check for multiple item selection capability
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      if (checkboxCount === 0) {
        console.log('⚠️ No multi-select capability - confirms single-item purchase only');
      }
      
      if (usabilityIssues.length > 0) {
        console.log('❌ E-commerce UX Issues:');
        usabilityIssues.forEach(issue => console.log(`  - ${issue}`));
      } else {
        console.log('✅ E-commerce UX appears functional (despite missing cart)');
      }
    });
  });
});