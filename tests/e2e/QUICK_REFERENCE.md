# E2E Testing Quick Reference

## 🚀 Common Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View last test report
npm run test:e2e:report

# Run specific test file
npx playwright test 01-user-lifecycle
npx playwright test 02-booking-flows
npx playwright test 03-admin-lifecycle
npx playwright test 04-analytics

# Run specific test by name
npx playwright test -g "User Registration Flow"
npx playwright test -g "Analytics API Failure"

# Debug mode (step through tests)
npx playwright test --debug

# Run only failed tests
npx playwright test --last-failed
```

## 📁 Test Files

| File | Description | Test Count |
|------|-------------|------------|
| `01-user-lifecycle.spec.ts` | Registration, login, dashboard, booking, logout | 9 |
| `02-booking-flows.spec.ts` | Booking scenarios, validation, edge cases | 9 |
| `03-admin-lifecycle.spec.ts` | Admin panel, booking management | 11 |
| `04-analytics.spec.ts` | Analytics dashboard, error handling | 8 |

## 🎯 Key Test Scenarios

### User Flow
```typescript
Register → Login → Dashboard → Create Booking → Cancel → Logout
```

### Admin Flow
```typescript
Login as Admin → View Bookings → Update Status → Analytics → Manage Services
```

### Error Handling
```typescript
Analytics API 500 → "Failed to load analytics data"
Network Error → Error message displayed
Form Validation → Required field errors
```

## 🔧 Setup Verification

```bash
# Verify environment is ready
npx ts-node tests/e2e/verify-setup.ts
```

Checks:
- ✅ Environment variables (`.env.local`)
- ✅ Supabase connection
- ✅ Required tables exist
- ✅ Test data seeded

## 📊 Test Data

### Auto-Generated Users
```typescript
test-user-{timestamp}@ori369test.com     // Regular user
test-admin-{timestamp}@ori369test.com    // Admin user
```

### Seeded Services
- Test Therapy Session (60 min, €50)
- Test Package (5 sessions, €200)

### Availability
- Monday-Friday: 09:00-17:00

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Timeout waiting for server" | Kill port 3000: `lsof -ti:3000 \| xargs kill -9` |
| "Supabase connection failed" | Check `.env.local` credentials |
| "Element not found" | Run `--headed` to see UI, update selectors |
| Tests fail randomly | Already sequential (workers: 1) |

## 📝 Page Objects

```typescript
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingPage } from './pages/BookingPage';
import { AdminPage } from './pages/AdminPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
```

## 🎨 Writing New Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { testData } from './fixtures/supabase.fixture';

test.describe('My Feature', () => {
  test('should work', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.user.email, testData.user.password);
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## 📈 CI/CD

```yaml
- run: npm ci
- run: npx playwright install --with-deps chromium
- run: npm run test:e2e
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 🔍 Useful Playwright Options

```bash
# Run only chromium
npx playwright test --project=chromium

# Run with specific timeout
npx playwright test --timeout=60000

# Run with retries
npx playwright test --retries=2

# Generate trace
npx playwright test --trace=on

# Update snapshots
npx playwright test --update-snapshots
```

## 📚 Documentation

- Full Guide: `E2E_TESTING_GUIDE.md`
- Detailed Docs: `tests/e2e/README.md`
- Playwright Docs: https://playwright.dev

---

**Quick Start**: `npm run test:e2e:ui` 🚀
