import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright configuration for ORI369 E2E tests
 * Supports comprehensive testing across all platform features
 * 
 * Key Features:
 * - Multi-browser testing (Chrome, Firefox, Safari)
 * - Mobile testing (iOS, Android)
 * - Enhanced reporting with screenshots and videos
 * - Isolated test environment setup
 * - Security testing capabilities
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run tests sequentially to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2, // Increased workers for parallel testing (except CI)
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: 'test-results/html-report'
    }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Global setup and teardown (disabled - setup file needs refactoring)
  // globalSetup: './tests/e2e/global-setup.ts',
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  // Multi-browser testing
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Development server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },

  // Test output directories
  outputDir: 'test-results/',
  
  // Timeouts and expectations
  timeout: 60000, // Global test timeout
  expect: {
    timeout: 10000, // Expect timeout
  },
});
