# E2E Testing Suite for ORI369

Comprehensive end-to-end testing suite for the ORI369 Next.js 15 / React 19 booking application using Playwright with TypeScript.

## 📋 Test Coverage

### User Lifecycle Tests (`01-user-lifecycle.spec.ts`)
- ✅ User registration with validation
- ✅ Login with wrong/correct credentials
- ✅ Dashboard stats display
- ✅ Create booking
- ✅ Cancel booking
- ✅ Logout flow
- ✅ Session persistence across reloads

### Booking Flow Tests (`02-booking-flows.spec.ts`)
- ✅ Login requirement enforcement
- ✅ Package shortcut booking (`/rezervacija?package=...`)
- ✅ Form validation (missing service, date, time)
- ✅ Available time slots loading
- ✅ Double booking prevention
- ✅ Past date validation
- ✅ Booking with notes
- ✅ Multiple bookings per user

### Admin Lifecycle Tests (`03-admin-lifecycle.spec.ts`)
- ✅ Non-admin access prevention
- ✅ Admin login and dashboard access
- ✅ View all bookings
- ✅ Filter bookings by status
- ✅ Update booking status (confirmed, completed)
- ✅ Delete bookings
- ✅ Access services tab
- ✅ Toggle services modal

### Analytics Tests (`04-analytics.spec.ts`)
- ✅ Access analytics tab
- ✅ Display summary cards (bookings, revenue, conversion)
- ✅ Render charts (top services, booking trend)
- ✅ Period selector functionality
- ✅ API success with mock data
- ✅ **API 500 error handling with fallback UI**
- ✅ Network error handling
- ✅ Analytics reload on period change

## 🚀 Prerequisites

1. **Environment Setup**
   - Ensure `.env.local` exists with valid Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

2. **Database Setup**
   - Supabase project with required tables:
     - `profiles` (with `role` column: 'user' | 'admin')
     - `services`
     - `bookings`
     - `availability_slots`
   - Run database migrations if available

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Install Playwright Browsers**
   ```bash
   npx playwright install chromium
   ```

## 🧪 Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test Suite
```bash
# User lifecycle tests
npx playwright test 01-user-lifecycle

# Booking flows
npx playwright test 02-booking-flows

# Admin tests
npx playwright test 03-admin-lifecycle

# Analytics tests
npx playwright test 04-analytics
```

### Run in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Specific Test
```bash
npx playwright test -g "User Registration Flow"
```

### Debug Mode
```bash
npx playwright test --debug
```

## 📊 View Test Results

### HTML Report
After test run:
```bash
npx playwright show-report
```

### Generate Report Manually
```bash
npx playwright test --reporter=html
```

## 🏗️ Project Structure

```
tests/e2e/
├── fixtures/
│   └── supabase.fixture.ts      # Supabase client, test data, seed utilities
├── pages/
│   ├── LoginPage.ts              # Login page object
│   ├── RegisterPage.ts           # Registration page object
│   ├── DashboardPage.ts          # Dashboard page object
│   ├── BookingPage.ts            # Booking page object
│   ├── AdminPage.ts              # Admin panel page object
│   └── AnalyticsPage.ts          # Analytics page object
├── 01-user-lifecycle.spec.ts     # User flow tests
├── 02-booking-flows.spec.ts      # Booking edge cases
├── 03-admin-lifecycle.spec.ts    # Admin functionality
├── 04-analytics.spec.ts          # Analytics & error handling
├── global-setup.ts               # Database seeding
└── README.md                     # This file
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- **Base URL**: `http://localhost:3000`
- **Workers**: 1 (sequential execution to prevent DB conflicts)
- **Retries**: 0 locally, 2 in CI
- **Web Server**: Auto-starts dev server
- **Timeout**: 120s for server startup

### Test Data
Test users are created with unique timestamps to avoid conflicts:
- Regular user: `test-user-{timestamp}@ori369test.com`
- Admin user: `test-admin-{timestamp}@ori369test.com`

## 🧹 Database Cleanup

Tests create data in Supabase. To clean up:

```bash
# Manual cleanup via Supabase dashboard
# Or use the cleanup utility (if implemented)
```

**Note**: Auth users persist in Supabase Auth and may need manual deletion via dashboard.

## 🎯 Key Features Tested

### Authentication & Authorization
- Registration validation (required fields, password strength)
- Login error handling (wrong credentials)
- Session persistence
- Admin role enforcement

### Booking System
- Service selection (therapies vs packages)
- Date/time slot availability
- Double booking prevention
- Past date validation
- Booking cancellation
- Notes/special requests

### Admin Panel
- Access control (non-admin redirect)
- Booking management (view, filter, update, delete)
- Status transitions (pending → confirmed → completed)
- Service management UI

### Analytics Dashboard
- Summary metrics (bookings, revenue, conversion)
- Data visualization (charts, tables)
- Period filtering (7/30/90 days)
- **Error handling**: 500 response shows "Failed to load analytics data"
- Network error resilience

## 🐛 Troubleshooting

### Tests Fail with "Timeout"
- Ensure dev server is running: `npm run dev`
- Check `.env.local` has valid Supabase credentials
- Increase timeout in `playwright.config.ts`

### "Element not found" Errors
- UI might have changed; update page object selectors
- Check if translations/i18n affect element text
- Use `--headed` mode to debug visually

### Database Conflicts
- Tests run sequentially (workers: 1) to prevent race conditions
- If issues persist, manually clean test data between runs

### Supabase Connection Issues
- Verify Supabase project is active
- Check network connectivity
- Ensure RLS policies allow test operations

## 📝 Writing New Tests

### 1. Create Page Object (if needed)
```typescript
// tests/e2e/pages/NewPage.ts
import { Page, Locator } from '@playwright/test';

export class NewPage {
  readonly page: Page;
  readonly element: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.locator('selector');
  }

  async goto() {
    await this.page.goto('/path');
  }
}
```

### 2. Write Test
```typescript
// tests/e2e/05-new-feature.spec.ts
import { test, expect } from '@playwright/test';
import { NewPage } from './pages/NewPage';

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    const newPage = new NewPage(page);
    await newPage.goto();
    await expect(newPage.element).toBeVisible();
  });
});
```

### 3. Run Test
```bash
npx playwright test 05-new-feature
```

## 🔐 Security Notes

- Test credentials are auto-generated with timestamps
- Never commit `.env.local` to version control
- Use separate Supabase project for testing (recommended)
- Clean up test data regularly

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

## ✅ CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎉 Test Execution Summary

Total test count: **40+ tests** covering:
- Complete user journey (register → login → book → cancel → logout)
- Admin workflows (manage bookings, update statuses, analytics)
- Edge cases (validation, double-booking, API failures)
- Error handling (500 responses, network errors)

**Expected runtime**: ~2-5 minutes (sequential execution)

---

**Happy Testing! 🚀**
