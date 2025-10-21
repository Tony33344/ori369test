# ORI369 End-to-End Testing Guide

Complete Playwright E2E testing suite for the ORI369 booking application built with Next.js 15 and React 19.

## 🎯 Quick Start

### 1. Install Playwright
```bash
npm install
npx playwright install chromium
```

### 2. Ensure Environment is Configured
Verify `.env.local` exists with Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Tests
```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

## 📦 What's Included

### Test Suites (40+ tests)

#### 1. User Lifecycle (`01-user-lifecycle.spec.ts`)
Complete user journey from registration to logout:
- User registration with field validation
- Login with incorrect/correct credentials
- Dashboard stats verification
- Create and cancel bookings
- Logout and session persistence

#### 2. Booking Flows (`02-booking-flows.spec.ts`)
Comprehensive booking scenarios and edge cases:
- Login requirement enforcement
- Package shortcut URLs (`/rezervacija?package=test-package`)
- Form validation (service, date, time required)
- Available time slots loading
- Double-booking prevention
- Past date validation
- Booking with notes
- Multiple bookings per user

#### 3. Admin Lifecycle (`03-admin-lifecycle.spec.ts`)
Admin panel functionality:
- Access control (non-admin redirect)
- View and filter all bookings
- Update booking statuses (pending → confirmed → completed)
- Delete bookings
- Manage services
- Toggle service modal

#### 4. Analytics Dashboard (`04-analytics.spec.ts`)
Analytics features and error handling:
- Summary cards (bookings, revenue, conversion rate)
- Charts rendering (top services, booking trends)
- Period selector (7/30/90 days)
- API mocking with fixture data
- **500 error handling** → Shows "Failed to load analytics data"
- Network error resilience

### Page Object Models

Reusable page objects for maintainable tests:
- `LoginPage` - Login form interactions
- `RegisterPage` - Registration form
- `DashboardPage` - User dashboard
- `BookingPage` - Booking form and calendar
- `AdminPage` - Admin panel navigation
- `AnalyticsPage` - Analytics dashboard

### Test Fixtures

- **Supabase Client** - Pre-configured database connection
- **Test Data Generator** - Unique test users with timestamps
- **Seed Utilities** - Database seeding for services and availability
- **Helper Functions** - Date utilities, cleanup functions

## 🏗️ Architecture

```
tests/e2e/
├── fixtures/
│   └── supabase.fixture.ts          # DB client, test data, seeding
├── pages/
│   ├── LoginPage.ts                 # Login page object
│   ├── RegisterPage.ts              # Registration page object
│   ├── DashboardPage.ts             # Dashboard page object
│   ├── BookingPage.ts               # Booking page object
│   ├── AdminPage.ts                 # Admin panel page object
│   └── AnalyticsPage.ts             # Analytics page object
├── 01-user-lifecycle.spec.ts        # User flow tests
├── 02-booking-flows.spec.ts         # Booking scenarios
├── 03-admin-lifecycle.spec.ts       # Admin tests
├── 04-analytics.spec.ts             # Analytics & error handling
├── global-setup.ts                  # Pre-test database seeding
└── README.md                        # Detailed documentation
```

## 🔍 Test Coverage Highlights

### Authentication & Authorization ✅
- Registration validation (required fields, password min length)
- Login error handling (wrong password shows error toast)
- Session persistence across page reloads
- Admin role enforcement (non-admin users redirected)

### Booking System ✅
- Service selection (therapies vs packages)
- Date/time slot availability based on `availability_slots` table
- Double-booking prevention (booked slots removed from UI)
- Past date validation (only future dates in dropdown)
- Booking cancellation updates status to 'cancelled'
- Notes/special requests saved to database

### Admin Panel ✅
- Access control (redirects non-admin to home)
- View all bookings with user/service details
- Filter by status (all, pending, confirmed, completed, cancelled)
- Update status workflow (pending → confirmed → completed)
- Delete bookings with confirmation dialog
- Service management UI

### Analytics Dashboard ✅
- Summary metrics display (total bookings, confirmed, revenue, page views, conversion)
- Data visualization (top services bar chart, booking trend timeline)
- Period filtering (7/30/90 days) triggers new API request
- **Error Handling**:
  - 500 API response → "Failed to load analytics data" message
  - Network failure → Error message displayed
  - Loading states → Spinner shown

### Edge Cases & Validation ✅
- Empty form submission (browser validation)
- Missing required fields (service, date, time)
- Attempt to book same slot twice
- Attempt to book past dates (not in dropdown)
- Session persistence after reload
- Logout clears session

## 🚀 Running Specific Tests

### Run Single Test File
```bash
npx playwright test 01-user-lifecycle
npx playwright test 02-booking-flows
npx playwright test 03-admin-lifecycle
npx playwright test 04-analytics
```

### Run Single Test by Name
```bash
npx playwright test -g "User Registration Flow"
npx playwright test -g "Analytics API Failure Shows Error Message"
```

### Debug Mode
```bash
npx playwright test --debug
```

### Generate Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- **Test Directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3000`
- **Workers**: 1 (sequential execution prevents DB race conditions)
- **Retries**: 0 locally, 2 in CI
- **Global Setup**: Seeds database before tests
- **Web Server**: Auto-starts `npm run dev`
- **Timeout**: 120s for server startup

### Test Execution Flow
1. **Global Setup** runs once → Seeds services and availability slots
2. **Tests run sequentially** → Prevents database conflicts
3. **Each test** creates unique users with timestamps
4. **Screenshots/videos** captured on failure
5. **HTML report** generated automatically

## 📊 Database Seeding

### Automatic Seeding (Global Setup)
Before tests run, the following data is seeded:

**Services:**
- Test Therapy Session (60 min, €50, single session)
- Test Package (60 min, €200, 5 sessions)

**Availability Slots:**
- Monday-Friday: 09:00-17:00

### Test Data Generation
Each test run creates unique users:
```typescript
test-user-{timestamp}@ori369test.com
test-admin-{timestamp}@ori369test.com
```

This prevents conflicts when running tests multiple times.

## 🧹 Cleanup

### Manual Cleanup
Test data accumulates in Supabase. To clean up:

1. **Bookings**: Delete via Supabase dashboard or SQL:
   ```sql
   DELETE FROM bookings WHERE created_at < NOW() - INTERVAL '1 day';
   ```

2. **Profiles**: Delete test profiles:
   ```sql
   DELETE FROM profiles WHERE email LIKE '%@ori369test.com';
   ```

3. **Auth Users**: Delete via Supabase Auth dashboard (manual)

### Automated Cleanup (Future Enhancement)
Add a cleanup script in `fixtures/supabase.fixture.ts`:
```bash
npm run test:cleanup
```

## 🐛 Troubleshooting

### "Timeout waiting for server"
**Cause**: Dev server not starting or port 3000 in use  
**Fix**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or manually start dev server
npm run dev
```

### "Supabase connection failed"
**Cause**: Invalid credentials or network issue  
**Fix**: 
- Verify `.env.local` has correct Supabase URL and anon key
- Check Supabase project is active
- Test connection: `npm run test:db`

### "Element not found" errors
**Cause**: UI changed or translation issue  
**Fix**: 
- Run in headed mode to see UI: `npm run test:e2e:headed`
- Update selectors in page objects
- Check if i18n language affects element text

### Tests fail randomly
**Cause**: Race conditions or timing issues  
**Fix**: 
- Tests already run sequentially (workers: 1)
- Increase `waitForTimeout` values if needed
- Check for async state updates

### "Database conflict" errors
**Cause**: Parallel test execution  
**Fix**: Already configured with `workers: 1` in config

## 🎨 Writing New Tests

### 1. Create Page Object (if needed)
```typescript
// tests/e2e/pages/SettingsPage.ts
import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.saveButton = page.locator('button:has-text("Save")');
  }

  async goto() {
    await this.page.goto('/nastavitve');
  }

  async updateProfile(name: string) {
    await this.page.fill('input[name="name"]', name);
    await this.saveButton.click();
  }
}
```

### 2. Write Test
```typescript
// tests/e2e/05-settings.spec.ts
import { test, expect } from '@playwright/test';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { testData } from './fixtures/supabase.fixture';

test.describe('Settings', () => {
  test('User can update profile', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const settingsPage = new SettingsPage(page);
    
    await loginPage.goto();
    await loginPage.login(testData.user.email, testData.user.password);
    
    await settingsPage.goto();
    await settingsPage.updateProfile('New Name');
    
    await expect(page.locator('text=Profile updated')).toBeVisible();
  });
});
```

### 3. Run Test
```bash
npx playwright test 05-settings
```

## 🔐 Security Best Practices

- ✅ Test credentials auto-generated with timestamps
- ✅ `.env.local` in `.gitignore` (never committed)
- ✅ Use separate Supabase project for testing (recommended)
- ✅ Clean up test data regularly
- ✅ No hardcoded secrets in test files

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Environment Variables in CI
Add to GitHub Secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js Testing](https://nextjs.org/docs/testing)

## ✅ Test Execution Summary

**Total Tests**: 40+ comprehensive E2E tests  
**Coverage**: User flows, admin workflows, edge cases, error handling  
**Expected Runtime**: 2-5 minutes (sequential execution)  
**Success Criteria**: All tests pass with green status

### Test Breakdown
- **User Lifecycle**: 9 tests
- **Booking Flows**: 9 tests
- **Admin Lifecycle**: 11 tests
- **Analytics**: 8 tests

### Key Scenarios Covered
✅ Complete user registration and login flow  
✅ Booking creation, cancellation, and validation  
✅ Admin panel access control and booking management  
✅ Analytics dashboard with error handling (500 response)  
✅ Session persistence and logout  
✅ Double-booking prevention  
✅ Form validation and edge cases  

---

**Ready to test!** Run `npm run test:e2e` to execute the full suite. 🚀
