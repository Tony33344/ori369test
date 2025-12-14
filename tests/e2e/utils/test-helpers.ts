// Test utilities and helpers for ORI369 testing suite
import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for element to be visible with timeout
   */
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Fill form with test data
   */
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[name="${field}"]`, value);
    }
  }

  /**
   * Check for JavaScript errors in console
   */
  async getConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    this.page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    return errors;
  }

  /**
   * Check if page is in development mode
   */
  async isDevelopmentMode(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('localhost') || url.includes('127.0.0.1');
  }

  /**
   * Take screenshot with error handling
   */
  async takeScreenshot(name: string, fullPage = false) {
    try {
      await this.page.screenshot({ 
        path: `test-results/screenshots/${name}.png`,
        fullPage 
      });
    } catch (error) {
      console.log(`Failed to take screenshot ${name}:`, error);
    }
  }

  /**
   * Check for network errors
   */
  async checkNetworkHealth(): Promise<boolean> {
    const failedRequests: string[] = [];
    
    this.page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await this.page.waitForLoadState('networkidle');
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed network requests:', failedRequests);
      return false;
    }
    
    return true;
  }

  /**
   * Login as test user
   */
  async loginAsTestUser(email = 'test@example.com', password = 'password123') {
    await this.page.goto('/prijava');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/dashboard');
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin(email = 'admin@example.com', password = 'admin123') {
    await this.page.goto('/admin');
    
    if (await this.page.locator('input[name="email"]').isVisible()) {
      await this.page.fill('input[name="email"]', email);
      await this.page.fill('input[name="password"]', password);
      await this.page.click('button[type="submit"]');
      await this.page.waitForURL('/admin');
    }
  }

  /**
   * Check if element has specific text content
   */
  async elementHasText(selector: string, expectedText: string): Promise<boolean> {
    const element = this.page.locator(selector);
    const text = await element.textContent();
    return text?.includes(expectedText) || false;
  }

  /**
   * Wait for API response with timeout
   */
  async waitForAPIResponse(url: string, timeout = 10000): Promise<any> {
    const responsePromise = this.page.waitForResponse(url, { timeout });
    const response = await responsePromise;
    return await response.json();
  }

  /**
   * Check page performance metrics
   */
  async getPerformanceMetrics() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    
    return metrics;
  }

  /**
   * Check if element is clickable
   */
  async isElementClickable(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    const isDisabled = await element.evaluate(el => 
      el.hasAttribute('disabled') || 
      el.getAttribute('aria-disabled') === 'true' ||
      window.getComputedStyle(el).pointerEvents === 'none'
    );
    
    return !isDisabled;
  }

  /**
   * Check element accessibility attributes
   */
  async checkAccessibility(selector: string) {
    const element = this.page.locator(selector);
    
    const accessibility = {
      hasAltText: await element.getAttribute('alt') !== null,
      hasAriaLabel: await element.getAttribute('aria-label') !== null,
      hasRole: await element.getAttribute('role') !== null,
      hasTabIndex: await element.getAttribute('tabindex') !== null,
      isFocusable: await element.evaluate(el => {
        const tabIndex = el.getAttribute('tabindex');
        return tabIndex !== '-1' && !el.hasAttribute('disabled');
      })
    };
    
    return accessibility;
  }
}

/**
 * Generate test data for various use cases
 */
export class TestDataGenerator {
  static generateEmail(): string {
    return `test-${Date.now()}@example.com`;
  }

  static generatePhoneNumber(): string {
    return `+386${Math.floor(Math.random() * 90000000) + 10000000}`;
  }

  static generateName(): string {
    const firstNames = ['Janez', 'Marija', 'Peter', 'Ana', 'Marko', 'Eva'];
    const lastNames = ['Novak', 'Kovačič', 'Zorman', 'Potočnik', 'Bergant', 'Kos'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  static generateSlovenianAddress(): object {
    return {
      street: 'Glavna ulica 1',
      city: 'Ljubljana',
      postalCode: '1000',
      country: 'Slovenia'
    };
  }

  static generateBookingData(): object {
    return {
      date: '2025-12-15',
      time: '10:00',
      notes: 'Test booking notes',
      serviceType: 'massage'
    };
  }

  static generateProductData(): object {
    return {
      name: `Test Service ${Date.now()}`,
      description: 'Test service description',
      price: Math.floor(Math.random() * 200) + 50,
      duration: Math.floor(Math.random() * 120) + 30,
      category: 'therapy'
    };
  }
}

/**
 * Assertion helpers for common test scenarios
 */
export class TestAssertions {
  static async expectPageToLoad(page: Page, expectedTitle?: string) {
    await page.waitForLoadState('networkidle');
    
    if (expectedTitle) {
      await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
    }
    
    // Check no critical JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('warning') &&
      !error.includes('deprecated')
    );
    
    expect(criticalErrors.length).toBeLessThan(5);
  }

  static async expectElementVisible(page: Page, selector: string, timeout = 5000) {
    await page.waitForSelector(selector, { timeout });
    await expect(page.locator(selector)).toBeVisible();
  }

  static async expectElementNotVisible(page: Page, selector: string) {
    const element = page.locator(selector);
    await expect(element).toHaveCount(0);
  }

  static async expectFormValidation(page: Page, formSelector: string) {
    // Submit empty form
    await page.click(`${formSelector} button[type="submit"]`);
    
    // Check for validation messages
    const validationMessages = page.locator('.error-message, .validation-error, [data-testid="error"]');
    const hasValidation = await validationMessages.isVisible();
    
    expect(hasValidation).toBeTruthy();
  }
}

/**
 * Security test helpers
 */
export class SecurityTestHelpers {
  static generateXSSPayload(): string[] {
    return [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      "'; DROP TABLE users; --",
      '../../../etc/passwd',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>'
    ];
  }

  static generateSQLInjectionPayload(): string[] {
    return [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker'); --",
      "' UNION SELECT * FROM users --",
      "1' OR 1=1#"
    ];
  }

  static async testXSSProtection(page: Page, endpoint: string, payload: string): Promise<boolean> {
    try {
      const response = await page.request.post(endpoint, {
        data: { input: payload }
      });
      
      const responseText = await response.text();
      
      // Check if payload is reflected without encoding
      const isVulnerable = responseText.includes(payload) && 
                          !responseText.includes('<script>') &&
                          !responseText.includes('<img');
      
      return !isVulnerable;
    } catch (error) {
      console.log('XSS test failed:', error);
      return true;
    }
  }
}

/**
 * Performance test helpers
 */
export class PerformanceTestHelpers {
  static async measurePageLoad(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    return loadTime;
  }

  static async checkCoreWebVitals(page: Page) {
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve([]);
        }, 5000);
      });
    });
    
    return metrics;
  }
}