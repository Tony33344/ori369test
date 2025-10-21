# E2E Test Suite File Structure

Complete overview of the Playwright E2E testing infrastructure.

## 📂 Directory Structure

```
ori369test-clone/
├── tests/
│   └── e2e/
│       ├── fixtures/
│       │   └── supabase.fixture.ts          # Supabase client, test data, seeding
│       ├── pages/
│       │   ├── LoginPage.ts                 # Login page object model
│       │   ├── RegisterPage.ts              # Registration page object model
│       │   ├── DashboardPage.ts             # Dashboard page object model
│       │   ├── BookingPage.ts               # Booking page object model
│       │   ├── AdminPage.ts                 # Admin panel page object model
│       │   └── AnalyticsPage.ts             # Analytics page object model
│       ├── 01-user-lifecycle.spec.ts        # User flow tests (9 tests)
│       ├── 02-booking-flows.spec.ts         # Booking scenarios (9 tests)
│       ├── 03-admin-lifecycle.spec.ts       # Admin tests (11 tests)
│       ├── 04-analytics.spec.ts             # Analytics & error handling (8 tests)
│       ├── global-setup.ts                  # Pre-test database seeding
│       ├── verify-setup.ts                  # Setup verification script
│       ├── README.md                        # Detailed documentation
│       ├── QUICK_REFERENCE.md               # Command reference
│       └── FILE_STRUCTURE.md                # This file
├── playwright.config.ts                     # Playwright configuration
├── E2E_TESTING_GUIDE.md                     # Main testing guide
└── package.json                             # Test scripts added

```

## 📄 File Descriptions

### Configuration Files

#### `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Workers: 1 (sequential execution)
- Global setup: Seeds database before tests
- Auto-starts dev server
- Screenshot/video on failure

#### `package.json` (updated)
New scripts added:
- `test:e2e` - Run all tests
- `test:e2e:ui` - Interactive UI mode
- `test:e2e:headed` - See browser
- `test:e2e:report` - View HTML report

### Test Fixtures

#### `fixtures/supabase.fixture.ts`
**Purpose**: Database utilities and test data generation

**Exports**:
- `supabase` - Pre-configured Supabase client
- `testData` - Unique test user credentials
- `seedServices()` - Seed test services
- `seedAvailability()` - Seed availability slots
- `createAdminUser()` - Create admin user
- `cleanupTestData()` - Clean test data
- `getFutureDate()` - Get valid booking date
- `getPastDate()` - Get past date for validation

**Test Data**:
```typescript
{
  user: {
    email: `test-user-${timestamp}@ori369test.com`,
    password: 'TestPassword123!',
    fullName: 'Test User'
  },
  admin: {
    email: `test-admin-${timestamp}@ori369test.com`,
    password: 'AdminPassword123!',
    fullName: 'Test Admin'
  }
}
```

### Page Object Models

#### `pages/LoginPage.ts`
**Locators**:
- `emailInput` - Email field
- `passwordInput` - Password field
- `submitButton` - Login button
- `registerLink` - Link to registration

**Methods**:
- `goto()` - Navigate to login page
- `login(email, password)` - Perform login
- `waitForRedirect(url)` - Wait for redirect

#### `pages/RegisterPage.ts`
**Locators**:
- `fullNameInput` - Full name field
- `emailInput` - Email field
- `passwordInput` - Password field
- `submitButton` - Register button
- `loginLink` - Link to login

**Methods**:
- `goto()` - Navigate to registration
- `register(name, email, password)` - Perform registration
- `waitForSuccessToast()` - Wait for success message
- `waitForRedirect()` - Wait for redirect to login

#### `pages/DashboardPage.ts`
**Locators**:
- `welcomeHeading` - Welcome message
- `totalBookingsCard` - Total bookings stat
- `activeBookingsCard` - Active bookings stat
- `newBookingButton` - Create booking button
- `adminAccessBanner` - Admin access banner
- `bookingsTable` - Bookings list
- `cancelButtons` - Cancel booking buttons

**Methods**:
- `goto()` - Navigate to dashboard
- `getTotalBookings()` - Get total booking count
- `getActiveBookings()` - Get active booking count
- `clickNewBooking()` - Navigate to booking page
- `cancelFirstBooking()` - Cancel first booking
- `hasAdminAccess()` - Check if admin banner visible
- `goToAdmin()` - Navigate to admin panel

#### `pages/BookingPage.ts`
**Locators**:
- `serviceSelect` - Service dropdown
- `dateSelect` - Date dropdown
- `timeSlots` - Available time slot buttons
- `notesTextarea` - Notes field
- `submitButton` - Submit booking button
- `loginRequiredBanner` - Login required message

**Methods**:
- `goto(packageSlug?)` - Navigate to booking (with optional package)
- `selectService(name)` - Select service by name
- `selectDate(date)` - Select date
- `selectTimeSlot(time)` - Select specific time
- `selectFirstAvailableTimeSlot()` - Select first available
- `fillNotes(notes)` - Add notes
- `submitBooking()` - Submit form
- `createBooking(service, date, notes?)` - Complete booking flow
- `isLoginRequired()` - Check if login required

#### `pages/AdminPage.ts`
**Locators**:
- `bookingsTab` - Bookings tab button
- `servicesTab` - Services tab button
- `analyticsTab` - Analytics tab button
- `bookingsTable` - Bookings table
- `filterSelect` - Status filter dropdown
- `statusButtons` - Confirm/Complete buttons
- `deleteButtons` - Delete booking buttons

**Methods**:
- `goto()` - Navigate to admin panel
- `switchToBookingsTab()` - Switch to bookings
- `switchToServicesTab()` - Switch to services
- `switchToAnalyticsTab()` - Switch to analytics
- `filterBookings(status)` - Filter by status
- `getBookingCount()` - Get visible booking count
- `updateFirstBookingStatus(status)` - Update status
- `deleteFirstBooking()` - Delete booking

#### `pages/AnalyticsPage.ts`
**Locators**:
- `totalBookingsCard` - Total bookings metric
- `confirmedBookingsCard` - Confirmed bookings metric
- `revenueCard` - Revenue metric
- `pageViewsCard` - Page views metric
- `conversionCard` - Conversion rate metric
- `topServicesChart` - Top services chart
- `bookingTrendChart` - Booking trend chart
- `servicePerformanceTable` - Performance table
- `periodSelector` - Period dropdown
- `errorMessage` - Error message element

**Methods**:
- `isLoaded()` - Check if analytics loaded
- `hasErrorMessage()` - Check if error shown
- `getTotalBookings()` - Get total bookings value
- `getRevenue()` - Get revenue value
- `changePeriod(period)` - Change time period
- `areChartsVisible()` - Check if charts rendered

### Test Suites

#### `01-user-lifecycle.spec.ts` (9 tests)
1. User Registration Flow
2. User Login with Wrong Password
3. User Login with Correct Credentials
4. Dashboard Displays User Stats
5. Create a Booking
6. Dashboard Shows Created Booking
7. Cancel a Booking
8. Logout Flow
9. Session Persistence Across Reloads

#### `02-booking-flows.spec.ts` (9 tests)
1. Booking Requires Login
2. Package Shortcut Booking
3. Form Validation - Missing Service
4. Form Validation - Missing Date
5. Available Time Slots Load Correctly
6. Double Booking Prevention
7. Past Date Validation
8. Booking with Notes
9. Multiple Bookings for Same User

#### `03-admin-lifecycle.spec.ts` (11 tests)
1. Non-Admin User Cannot Access Admin Panel
2. Admin User Can Login
3. Admin Dashboard Shows Admin Access Banner
4. Admin Can Access Admin Panel
5. Admin Can View All Bookings
6. Admin Can Filter Bookings by Status
7. Admin Can Update Booking Status to Confirmed
8. Admin Can Update Booking Status to Completed
9. Admin Can Delete Booking
10. Admin Can Access Services Tab
11. Admin Can Toggle Services Modal

#### `04-analytics.spec.ts` (8 tests)
1. Admin Can Access Analytics Tab
2. Analytics Dashboard Displays Summary Cards
3. Analytics Charts Render
4. Analytics Period Selector Works
5. Analytics API Success with Mock Data
6. **Analytics API Failure Shows Error Message** (500 response)
7. Analytics API Network Error Handling
8. Analytics Loads After Period Change

### Setup & Utilities

#### `global-setup.ts`
**Purpose**: Runs once before all tests

**Actions**:
- Seeds test services (Test Therapy, Test Package)
- Seeds availability slots (Mon-Fri 09:00-17:00)
- Logs setup progress

#### `verify-setup.ts`
**Purpose**: Verify test environment configuration

**Checks**:
1. Environment variables exist
2. Supabase connection works
3. Required tables exist (profiles, services, bookings, availability_slots)
4. Test services are seeded
5. Availability slots are seeded

**Usage**: `npx ts-node tests/e2e/verify-setup.ts`

### Documentation

#### `README.md`
Detailed documentation including:
- Test coverage overview
- Prerequisites
- Running tests
- Project structure
- Configuration
- Troubleshooting
- Writing new tests

#### `QUICK_REFERENCE.md`
Quick command reference:
- Common commands
- Test file descriptions
- Key scenarios
- Setup verification
- Troubleshooting table

#### `FILE_STRUCTURE.md`
This file - complete file structure overview

#### `E2E_TESTING_GUIDE.md` (root level)
Comprehensive guide:
- Quick start
- What's included
- Architecture
- Test coverage highlights
- Running tests
- Database seeding
- Cleanup
- CI/CD integration

## 📊 Test Statistics

| Metric | Value |
|--------|-------|
| Total Test Files | 4 |
| Total Tests | 37+ |
| Page Objects | 6 |
| Test Fixtures | 1 |
| Setup Scripts | 2 |
| Documentation Files | 4 |

## 🔄 Test Execution Flow

```
1. Global Setup
   └─ Seed services & availability

2. Test Suite 01: User Lifecycle
   ├─ Create unique test user
   ├─ Register → Login → Dashboard
   ├─ Create booking → Cancel
   └─ Logout → Session check

3. Test Suite 02: Booking Flows
   ├─ Login enforcement
   ├─ Package shortcuts
   ├─ Form validation
   └─ Edge cases

4. Test Suite 03: Admin Lifecycle
   ├─ Create admin user
   ├─ Access control
   ├─ Booking management
   └─ Status updates

5. Test Suite 04: Analytics
   ├─ Dashboard rendering
   ├─ API mocking
   ├─ Error handling (500)
   └─ Network errors

6. Cleanup (manual)
   └─ Remove test data
```

## 🎯 Key Features

✅ **Page Object Model** - Maintainable, reusable page objects  
✅ **Sequential Execution** - Prevents database conflicts  
✅ **Auto-Seeding** - Database seeded before tests  
✅ **Unique Test Data** - Timestamp-based user generation  
✅ **Error Handling** - Tests for API failures and network errors  
✅ **Comprehensive Coverage** - User flows, admin workflows, edge cases  
✅ **CI/CD Ready** - GitHub Actions example included  
✅ **Well Documented** - Multiple documentation files  

## 📦 Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.56.0",
    "@types/node": "^20.19.21"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.75.0",
    "dotenv": "^17.2.3"
  }
}
```

---

**Total Lines of Code**: ~3,500+ lines  
**Test Coverage**: Complete user and admin lifecycles  
**Maintenance**: Page objects make updates easy  
