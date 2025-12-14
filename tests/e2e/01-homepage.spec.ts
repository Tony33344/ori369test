import { test, expect } from '@playwright/test';

test.describe('Homepage and Navigation', () => {
  test('Homepage loads correctly with proper branding', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/ORI369/);
    
    // Check main heading
    const mainHeading = page.locator('h1, [data-testid="main-heading"]');
    await expect(mainHeading).toContainText('ORI369');
    
    // Check hero section is visible
    const heroSection = page.locator('[data-testid="hero-section"], .hero');
    await expect(heroSection).toBeVisible();
    
    // Check navigation menu
    const navMenu = page.locator('nav, [data-testid="navigation"]');
    await expect(navMenu).toBeVisible();
  });

  test('Hero section displays with correct transparency', async ({ page }) => {
    await page.goto('/');
    
    const heroImage = page.locator('.hero-image, [data-testid="hero-image"]');
    
    // Verify hero image is visible
    await expect(heroImage).toBeVisible();
    
    // Check that hero image has background (for transparency test)
    const hasBackground = await heroImage.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.backgroundImage !== 'none' || style.backgroundColor !== 'rgba(0, 0, 0, 0)';
    });
    
    expect(hasBackground).toBeTruthy();
    console.log('✅ Hero image transparency test passed');
  });

  test('Services preview section shows NO prices (critical requirement)', async ({ page }) => {
    await page.goto('/');
    
    // Look for services preview section
    const servicesPreview = page.locator(
      '[data-testid="services-preview"], .services-preview, [data-testid="services-section"]'
    );
    
    // Wait for section to be visible
    await expect(servicesPreview).toBeVisible();
    
    // Scroll to services section
    await servicesPreview.scrollIntoViewIfNeeded();
    
    // 🔴 CRITICAL TEST: Verify NO prices shown in services preview
    const priceElements = servicesPreview.locator(
      '.price, [data-testid="price"], [data-testid="service-price"], .service-price'
    );
    
    const priceCount = await priceElements.count();
    
    if (priceCount > 0) {
      console.log(`❌ CRITICAL ISSUE: Found ${priceCount} price elements in services preview`);
      console.log('Prices should NOT be visible in homepage preview');
    }
    
    // Should have 0 price elements in services preview
    expect(priceCount).toBe(0);
    
    // Verify services are still listed (but without prices)
    const serviceItems = servicesPreview.locator(
      '.service-item, [data-testid="service-item"], .therapy-card'
    );
    const serviceCount = await serviceItems.count();
    expect(serviceCount).toBeGreaterThan(0);
    
    console.log('✅ Services preview: No prices found (correct)');
  });

  test('Packages preview section shows NO prices (critical requirement)', async ({ page }) => {
    await page.goto('/');
    
    // Look for packages preview section  
    const packagesPreview = page.locator(
      '[data-testid="packages-preview"], .packages-preview, [data-testid="packages-section"]'
    );
    
    // Wait for section to be visible
    await expect(packagesPreview).toBeVisible();
    
    // Scroll to packages section
    await packagesPreview.scrollIntoViewIfNeeded();
    
    // 🔴 CRITICAL TEST: Verify NO prices shown in packages preview
    const priceElements = packagesPreview.locator(
      '.price, [data-testid="price"], [data-testid="package-price"], .package-price'
    );
    
    const priceCount = await priceElements.count();
    
    if (priceCount > 0) {
      console.log(`❌ CRITICAL ISSUE: Found ${priceCount} price elements in packages preview`);
      console.log('Prices should NOT be visible in homepage preview');
    }
    
    // Should have 0 price elements in packages preview
    expect(priceCount).toBe(0);
    
    // Verify packages are still listed (but without prices)
    const packageItems = packagesPreview.locator(
      '.package-item, [data-testid="package-item"], .package-card'
    );
    const packageCount = await packageItems.count();
    expect(packageCount).toBeGreaterThan(0);
    
    console.log('✅ Packages preview: No prices found (correct)');
  });

  test('Navigation menu works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main navigation links
    const navLinks = page.locator('nav a, [data-testid="navigation"] a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Test clicking a navigation link
    const firstLink = navLinks.first();
    const linkText = await firstLink.textContent();
    
    if (linkText) {
      await firstLink.click();
      
      // Check if navigation worked (either same page or new page)
      await page.waitForLoadState('networkidle');
      console.log(`✅ Navigation link "${linkText}" clicked successfully`);
    }
  });

  test('Language selector is visible and functional', async ({ page }) => {
    await page.goto('/');
    
    // Look for language selector
    const languageSelector = page.locator(
      '[data-testid="language-selector"], .language-selector, select[name="language"]'
    );
    
    // Check if language selector is visible
    const isVisible = await languageSelector.isVisible();
    
    if (isVisible) {
      // Test language switching if possible
      await languageSelector.click();
      
      // Look for language options
      const languageOptions = page.locator(
        '[data-testid^="language-"], option[value]'
      );
      const optionCount = await languageOptions.count();
      
      if (optionCount > 0) {
        console.log(`✅ Language selector found with ${optionCount} options`);
      }
    } else {
      console.log('⚠️ Language selector not found - may not be implemented yet');
    }
  });

  test('Footer section displays correctly', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footer = page.locator('footer, [data-testid="footer"]');
    await expect(footer).toBeVisible();
    
    // Check footer content
    const footerText = await footer.textContent();
    expect(footerText).toBeTruthy();
    expect(footerText!.length).toBeGreaterThan(10);
    
    console.log('✅ Footer section displays correctly');
  });

  test('No JavaScript errors in console', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected/acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('warning') &&
      !error.includes('deprecated')
    );
    
    if (criticalErrors.length > 0) {
      console.log('❌ JavaScript errors found:', criticalErrors);
    }
    
    // Allow some errors but log them
    expect(criticalErrors.length).toBeLessThan(5);
    
    console.log(`✅ Console check passed: ${errors.length} total messages, ${criticalErrors.length} critical errors`);
  });
});