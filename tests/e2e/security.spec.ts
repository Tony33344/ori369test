import { test, expect, request } from '@playwright/test';

test.describe('Security Testing - CRITICAL', () => {
  test.describe('API Security Testing', () => {
    test('No API rate limiting - CRITICAL SECURITY ISSUE', async ({ request }) => {
      // 🔴 CRITICAL: Test if rate limiting exists
      const requests = [];
      const endpoint = '/api/cms/pages';
      
      // Make many rapid requests
      for (let i = 0; i < 25; i++) {
        requests.push(request.get(endpoint));
      }
      
      const responses = await Promise.all(requests);
      const statusCodes = responses.map(r => r.status());
      
      // Check for rate limiting (429 status)
      const hasRateLimit = statusCodes.some(code => code === 429);
      
      if (!hasRateLimit) {
        console.log('❌ CRITICAL SECURITY ISSUE: No API rate limiting detected');
        console.log(`Made ${requests.length} requests to ${endpoint}`);
        console.log('Status codes:', statusCodes.slice(0, 10));
        console.log('This makes the API vulnerable to DoS attacks');
      } else {
        console.log('✅ API rate limiting detected');
      }
      
      expect(hasRateLimit).toBeTruthy(); // Should have rate limiting
    });

    test('API authentication consistency', async ({ request }) => {
      // Test protected endpoints without auth
      const protectedEndpoints = [
        '/api/cms/pages',
        '/api/cms/sections', 
        '/api/cms/blocks',
        '/api/auth/setup',
        '/api/init'
      ];
      
      for (const endpoint of protectedEndpoints) {
        const response = await request.get(endpoint);
        const status = response.status();
        
        // Should be 401 or 403 (unauthorized)
        if (status === 200) {
          console.log(`❌ SECURITY ISSUE: ${endpoint} accessible without auth`);
        } else if ([401, 403].includes(status)) {
          console.log(`✅ ${endpoint} properly protected (${status})`);
        } else {
          console.log(`⚠️ ${endpoint} returned ${status} (unclear protection)`);
        }
      }
    });

    test('Input sanitization testing', async ({ request }) => {
      // Test XSS attempts in API calls
      const maliciousPayloads = [
        '<script>alert("XSS")</script>',
        '"><script>alert("XSS")</script>',
        "'; DROP TABLE users; --",
        '../../../etc/passwd',
        '<img src=x onerror=alert("XSS")>'
      ];
      
      for (const payload of maliciousPayloads) {
        const response = await request.post('/api/cms/pages', {
          data: {
            title: payload,
            content: payload,
            slug: payload
          }
        });
        
        const responseText = await response.text();
        
        // Check if payload is reflected without sanitization
        const isReflected = responseText.includes(payload) && 
                           !responseText.includes('<script>');
        
        if (isReflected) {
          console.log(`❌ XSS VULNERABILITY: Payload reflected in response`);
          console.log(`Payload: ${payload.substring(0, 50)}...`);
        } else {
          console.log(`✅ Input sanitization working for: ${payload.substring(0, 20)}...`);
        }
      }
    });

    test('CSRF protection missing - CRITICAL', async ({ page }) => {
      await page.goto('/admin');
      
      if (await page.locator('input[name="email"]').isVisible()) {
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
      }
      
      // Check for CSRF tokens in forms
      const csrfTokens = [
        'input[name="csrf_token"]',
        'input[name="_token"]',
        'meta[name="csrf-token"]',
        'meta[name="_token"]'
      ];
      
      let csrfFound = false;
      for (const selector of csrfTokens) {
        if (await page.locator(selector).isVisible()) {
          csrfFound = true;
          console.log(`✅ CSRF token found: ${selector}`);
          break;
        }
      }
      
      if (!csrfFound) {
        console.log('❌ CRITICAL: No CSRF protection found');
        console.log('Forms are vulnerable to CSRF attacks');
      }
      
      expect(csrfFound).toBeTruthy(); // Should have CSRF protection
    });
  });

  test.describe('Authentication Security', () => {
    test('Password policy enforcement', async ({ page }) => {
      await page.goto('/registracija');
      
      // Test weak passwords
      const weakPasswords = ['123', 'password', 'abc', '123456'];
      
      for (const weakPassword of weakPasswords) {
        await page.fill('input[name="password"]', weakPassword);
        await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
        await page.fill('input[name="fullName"]', 'Test User');
        
        // Trigger validation
        await page.locator('input[name="password"]').blur();
        
        // Check for password strength validation
        const validationMessage = page.locator('.password-error, .validation-error, [data-testid="password-error"]');
        const hasValidation = await validationMessage.isVisible();
        
        if (!hasValidation) {
          console.log(`❌ SECURITY ISSUE: Weak password accepted: ${weakPassword}`);
        } else {
          console.log(`✅ Password validation working for: ${weakPassword}`);
        }
      }
    });

    test('Account lockout protection', async ({ page }) => {
      const wrongPassword = 'wrongpassword123';
      const targetEmail = 'nonexistent@example.com';
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.goto('/prijava');
        await page.fill('input[name="email"]', targetEmail);
        await page.fill('input[name="password"]', wrongPassword);
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(1000);
      }
      
      // Check if account gets locked
      const lockoutMessage = page.locator('.error-message:has-text("locked"), .error-message:has-text("too many")');
      const isLocked = await lockoutMessage.isVisible();
      
      if (!isLocked) {
        console.log('❌ SECURITY ISSUE: No account lockout protection');
        console.log('Brute force attacks possible');
      } else {
        console.log('✅ Account lockout protection working');
      }
    });

    test('Session security', async ({ page }) => {
      // Login and check session management
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Check if session cookie is secure
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('auth'));
      
      if (sessionCookie) {
        const isSecure = sessionCookie.secure;
        const isHttpOnly = sessionCookie.httpOnly;
        
        if (!isSecure) {
          console.log('❌ SECURITY ISSUE: Session cookie not marked as secure');
        }
        
        if (!isHttpOnly) {
          console.log('❌ SECURITY ISSUE: Session cookie not marked as httpOnly');
        }
        
        if (isSecure && isHttpOnly) {
          console.log('✅ Session cookie properly secured');
        }
      } else {
        console.log('⚠️ No session cookie found');
      }
    });
  });

  test.describe('Data Protection', () => {
    test('Sensitive data exposure in client-side code', async ({ page }) => {
      await page.goto('/');
      
      // Check page source for exposed sensitive data
      const pageContent = await page.content();
      
      const sensitivePatterns = [
        /sk_live_[a-zA-Z0-9]{24}/, // Stripe live keys
        /pk_live_[a-zA-Z0-9]{24}/, // Stripe public live keys
        /AIza[a-zA-Z0-9_-]{35}/, // Google API keys
        /password.*:.*['"][^'"]*['"]/i, // Hardcoded passwords
        /secret.*:.*['"][^'"]*['"]/i, // Hardcoded secrets
      ];
      
      let exposuresFound = 0;
      for (const pattern of sensitivePatterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          console.log(`❌ SECURITY ISSUE: Potential sensitive data exposure: ${matches[0]}`);
          exposuresFound++;
        }
      }
      
      if (exposuresFound === 0) {
        console.log('✅ No obvious sensitive data exposure in client code');
      }
      
      expect(exposuresFound).toBe(0);
    });

    test('HTTPS enforcement', async ({ page }) => {
      // This test assumes we're testing in development
      // In production, this should verify HTTPS is enforced
      const currentUrl = page.url();
      
      if (currentUrl.startsWith('https://')) {
        console.log('✅ HTTPS is being used');
      } else {
        console.log('⚠️ Not using HTTPS (may be development environment)');
      }
      
      // Check for security headers
      const response = await page.goto('/');
      const headers = response?.headers() || {};
      
      const securityHeaders = {
        'strict-transport-security': 'HSTS header missing',
        'content-security-policy': 'CSP header missing',
        'x-frame-options': 'X-Frame-Options missing',
        'x-content-type-options': 'X-Content-Type-Options missing'
      };
      
      for (const [header, message] of Object.entries(securityHeaders)) {
        if (!headers[header]) {
          console.log(`❌ SECURITY: ${message}`);
        } else {
          console.log(`✅ Security header present: ${header}`);
        }
      }
    });
  });

  test.describe('Access Control Testing', () => {
    test('Admin area protection', async ({ page }) => {
      // Try to access admin area without login
      await page.goto('/admin');
      
      const loginForm = page.locator('input[name="email"], .login-form');
      const isProtected = await loginForm.isVisible();
      
      if (isProtected) {
        console.log('✅ Admin area properly protected');
      } else {
        console.log('❌ SECURITY ISSUE: Admin area not protected');
      }
      
      expect(isProtected).toBeTruthy();
    });

    test('Role-based access control', async ({ page }) => {
      // Login as regular user
      await page.goto('/prijava');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Try to access admin features
      await page.goto('/admin');
      
      const hasAdminAccess = await page.locator('[data-testid="admin-interface"], .admin-interface').isVisible();
      
      if (!hasAdminAccess) {
        console.log('✅ Regular user cannot access admin features');
      } else {
        console.log('❌ SECURITY ISSUE: Regular user has admin access');
      }
      
      expect(hasAdminAccess).toBeFalsy();
    });
  });
});