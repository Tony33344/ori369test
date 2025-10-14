# ORI369 Testing Guide

## 🎯 Recent Changes Implemented

### 1. ✅ Hero Section - Transparency Updated
- **Changed:** Background image opacity from 40% to **70%**
- **File:** `components/sections/Hero.tsx`
- **Line 56:** `className="object-cover opacity-70"`

### 2. ✅ Prices Removed from Preview Sections
- **ServicesPreview:** Removed price and duration display
- **PackagesPreview:** Removed price display
- **Files Modified:**
  - `components/sections/ServicesPreview.tsx`
  - `components/sections/PackagesPreview.tsx`
- **Note:** Prices still visible on full `/terapije` and `/paketi` pages

### 3. ✅ Text Duplication Check
- **Verified:** No duplicate text found in components
- **Confirmed:** Each section has unique headings and content

---

## 🧪 Testing Scripts Created

### 1. Database Setup Script
**File:** `setup-database.js`

**Purpose:** Populates Supabase with initial data
- Inserts 14 therapies + 3 packages into `services` table
- Inserts availability slots for Mon-Fri (7-14, 16-21) and Sat (8-14)

**Run:**
```bash
npm run setup:db
```

### 2. Database Connection Test
**File:** `test-supabase.js`

**Purpose:** Verifies Supabase connection and table setup
- Checks all required tables exist
- Displays current data counts
- Identifies missing data

**Run:**
```bash
npm run test:db
```

### 3. Full Flow End-to-End Test
**File:** `test-full-flow.js`

**Purpose:** Tests complete user journey
- Registration flow
- Login flow
- Service selection
- Time slot availability
- Booking creation
- Dashboard view

**Run:**
```bash
npm run test:flow
```

---

## 📋 Step-by-Step Testing Procedure

### Phase 1: Environment Setup (5 min)

1. **Check `.env.local` exists:**
```bash
ls -la .env.local
```

2. **Verify it contains:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. **Test database connection:**
```bash
npm run test:db
```

**Expected Output:**
- ✅ Profiles table exists
- ✅ Services table exists
- ✅ Bookings table exists
- ✅ Availability slots table exists

---

### Phase 2: Database Population (10 min)

**If tables are empty, run:**
```bash
npm run setup:db
```

**This will insert:**
- 14 individual therapies
- 3 therapy packages
- 11 availability time slots

**Verify:**
```bash
npm run test:db
```

**Expected Output:**
- Found 17 services
- Found 11 availability slots

---

### Phase 3: Full Flow Test (5 min)

**Run automated test:**
```bash
npm run test:flow
```

**This tests:**
1. ✅ Database connection
2. ✅ User registration
3. ✅ Profile creation
4. ✅ User login
5. ✅ Service selection
6. ✅ Time slot availability
7. ✅ Booking creation
8. ✅ Booking retrieval

**Expected Output:**
```
✅ All tests passed successfully!
🎉 Full registration & reservation flow is working!
```

---

### Phase 4: Manual UI Testing (15 min)

**Start the dev server:**
```bash
npm run dev
```

**Test 1: Hero Section**
1. Navigate to `http://localhost:3000`
2. ✅ Verify images are more visible (70% opacity)
3. ✅ Verify smooth carousel transitions
4. ✅ No jumping or overlapping

**Test 2: Services Preview (Homepage)**
1. Scroll to services section
2. ✅ Verify NO prices shown
3. ✅ Verify only service name and description
4. ✅ "Více informacij" button works

**Test 3: Packages Preview (Homepage)**
1. Scroll to packages section
2. ✅ Verify NO prices shown
3. ✅ Verify only package name, description, and benefits
4. ✅ "Více informacij" button works

**Test 4: Full Services Page**
1. Navigate to `/terapije`
2. ✅ Verify prices ARE shown (this is correct)
3. ✅ Verify duration shown
4. ✅ All therapies display correctly

**Test 5: Full Packages Page**
1. Navigate to `/paketi`
2. ✅ Verify prices ARE shown (this is correct)
3. ✅ Verify sessions count shown
4. ✅ "Rezerviraj paket" button works

**Test 6: Registration Flow**
1. Navigate to `/registracija`
2. Fill form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: Test123!
3. Submit
4. ✅ Success message appears
5. ✅ Redirects to `/prijava`
6. ✅ Check email for confirmation (if email configured)

**Test 7: Login Flow**
1. Navigate to `/prijava`
2. Enter credentials from registration
3. Submit
4. ✅ Success message appears
5. ✅ Redirects to `/dashboard`
6. ✅ User session active

**Test 8: Reservation Flow (CRITICAL)**
1. Navigate to `/rezervacija`
2. ✅ If not logged in, shows login prompt
3. After login:
   - ✅ Services dropdown populated
   - ✅ Select a service
   - ✅ Date picker shows next 14 days
   - ✅ Select a date
   - ✅ Time slots appear (if availability configured)
   - ✅ Select a time slot
   - ✅ Add optional notes
   - ✅ Submit booking
   - ✅ Success message appears
   - ✅ Form resets

**Test 9: Dashboard**
1. Navigate to `/dashboard`
2. ✅ User info displays
3. ✅ Bookings list shows
4. ✅ Booking details correct

---

## 🔧 Troubleshooting

### Issue: No time slots available

**Possible causes:**
1. Availability slots not configured for that day
2. All slots already booked
3. Selected date is Sunday (no availability)

**Solution:**
```bash
npm run setup:db
```

### Issue: Services dropdown empty

**Cause:** Services table empty

**Solution:**
```bash
npm run setup:db
```

### Issue: Registration fails

**Possible causes:**
1. Email already registered
2. Password too short (min 6 chars)
3. Supabase Auth not configured

**Check:**
- Supabase Auth settings
- Email provider configured
- Redirect URLs whitelisted

### Issue: Login fails

**Possible causes:**
1. Email not confirmed
2. Wrong credentials
3. User doesn't exist

**Solution:**
- Check Supabase Auth users table
- Confirm email if required
- Re-register if needed

---

## 📊 Test Results Checklist

```
Date: ___________
Tester: ___________

VISUAL CHANGES:
[ ] Hero images 70% opacity (more visible)
[ ] Smooth carousel transitions
[ ] No prices on homepage services preview
[ ] No prices on homepage packages preview
[ ] Prices visible on /terapije page
[ ] Prices visible on /paketi page

DATABASE:
[ ] All tables exist
[ ] Services populated (17 items)
[ ] Availability slots populated (11 items)

REGISTRATION FLOW:
[ ] Form validates correctly
[ ] Registration successful
[ ] Profile created in database
[ ] Redirect to login works

LOGIN FLOW:
[ ] Login successful
[ ] Session persists
[ ] Redirect to dashboard works

RESERVATION FLOW:
[ ] Services load correctly
[ ] Dates selectable (next 14 days)
[ ] Time slots appear
[ ] Booking submission works
[ ] Booking saved to database
[ ] Success message shows

DASHBOARD:
[ ] User info displays
[ ] Bookings list shows
[ ] Data is correct

ISSUES FOUND:
1. ___________
2. ___________
3. ___________
```

---

## 🚀 Quick Commands Reference

```bash
# Setup database with initial data
npm run setup:db

# Test database connection
npm run test:db

# Run full flow test
npm run test:flow

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📝 SQL Scripts (If Manual Setup Needed)

### Create Tables

**Run in Supabase SQL Editor:**

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_package BOOLEAN DEFAULT FALSE,
  sessions INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability slots table
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ Changes Summary

### Implemented:
1. ✅ Hero transparency changed to 70%
2. ✅ Prices removed from ServicesPreview component
3. ✅ Prices removed from PackagesPreview component
4. ✅ Created database setup script
5. ✅ Created database connection test script
6. ✅ Created full flow end-to-end test script
7. ✅ Added npm scripts for easy testing
8. ✅ Verified no text duplication issues

### Ready for Testing:
- Registration flow
- Login flow
- Reservation flow
- Full user journey

---

**Status:** ✅ All changes implemented and ready for testing
**Next Step:** Run `npm run test:db` to verify Supabase setup
