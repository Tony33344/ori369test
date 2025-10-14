# Comprehensive Test Plan & Execution - ORI369 Website

## 🎯 CRITICAL ISSUES FIXED

### 1. ✅ Hero Carousel - Fixed Jumping Effect
**Problem:** Images were jumping/overlapping during transitions
**Solution Applied:**
- Increased transition speed to 1500ms (smoother fade)
- Increased delay to 4000ms (more time to view each image)
- Added proper wrapper divs for each slide
- Added z-index to gradient overlay to prevent interference
- Added `sizes="100vw"` to images for proper responsive loading

**Files Modified:**
- `/components/sections/Hero.tsx`

---

## 🧪 TESTING CHECKLIST

### A. Supabase Connection Test
- [ ] Check if .env.local has correct Supabase credentials
- [ ] Test database connection
- [ ] Verify tables exist: profiles, services, bookings, availability_slots

### B. Registration Flow Test
**Steps:**
1. [ ] Navigate to `/registracija`
2. [ ] Fill form: name, email, password
3. [ ] Submit registration
4. [ ] Check for success message
5. [ ] Verify email confirmation sent
6. [ ] Check if profile created in Supabase

**Expected Behavior:**
- Form validates (email format, password min 6 chars)
- Success toast appears
- Redirect to `/prijava`
- Email sent for confirmation
- Profile row created in database

### C. Login Flow Test
**Steps:**
1. [ ] Navigate to `/prijava`
2. [ ] Enter registered email/password
3. [ ] Submit login
4. [ ] Check redirect to dashboard
5. [ ] Verify user session active

**Expected Behavior:**
- Form validates
- Success toast on login
- Redirect to `/dashboard` or specified redirect URL
- User session persists

### D. Reservation Flow Test (CRITICAL)
**Steps:**
1. [ ] User must be logged in first
2. [ ] Navigate to `/rezervacija`
3. [ ] Select service/therapy from dropdown
4. [ ] Select date (next 14 days available)
5. [ ] View available time slots for selected date
6. [ ] Select time slot
7. [ ] Add optional notes
8. [ ] Submit booking
9. [ ] Check success message
10. [ ] Verify booking in Supabase database

**Expected Behavior:**
- If not logged in: show message to login/register
- Services load from Supabase `services` table
- Date picker shows next 14 days
- Time slots load based on:
  - Day of week availability (from `availability_slots`)
  - Existing bookings (from `bookings`)
- Booking creates row in `bookings` table with status 'pending'
- Success toast appears
- Form resets after successful booking

**Potential Issues:**
- ⚠️ Services table might be empty
- ⚠️ Availability_slots table might be empty
- ⚠️ No time slots will show if tables not populated

### E. Dashboard Test
**Steps:**
1. [ ] Login as user
2. [ ] Navigate to `/dashboard`
3. [ ] Check if user bookings display
4. [ ] Check if user profile info shows

### F. Admin Panel Test
**Steps:**
1. [ ] Login as admin user (role='admin' in profiles)
2. [ ] Navigate to `/admin`
3. [ ] Check if all bookings display
4. [ ] Test booking status updates
5. [ ] Test Google Calendar sync (if configured)

---

## 🔍 THERAPY PRICES VERIFICATION

**Source:** `/public/assets/data.json`

**Current Prices:**
| Therapy | Duration | Price |
|---------|----------|-------|
| Elektrostimulacija | 20 min | €20 |
| Manualna Terapija | 20 min | €30 |
| Tecar Terapija | 30 min | €40 |
| Magnetna Terapija | 20 min | €30 |
| MIS | 20 min | €30 |
| Laserska Terapija | 10 min | €10 |
| Media Taping | 10 min | €10 |
| Cupping | 30 min | €30 |
| Dryneedeling | 30 min | €30 |

**Note:** These prices are also in `/lib/therapyContent.ts` and must match!

**Action Required:**
- ✅ Verify these prices with original site (if available)
- ✅ Ensure consistency between data.json and therapyContent.ts
- ⚠️ Original site doesn't show prices on therapy pages - only in booking/pricing page

---

## 🗄️ DATABASE SETUP REQUIRED

### Tables That Must Exist in Supabase:

#### 1. profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. services
```sql
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
```

#### 3. bookings
```sql
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
```

#### 4. availability_slots
```sql
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sample Data to Insert:

#### Services (Therapies):
```sql
INSERT INTO services (name, slug, description, duration, price, is_package) VALUES
('Elektrostimulacija', 'elektrostimulacija', 'Elektrostimulacija aktivira mišično tkivo', 20, 20.00, FALSE),
('Manualna Terapija', 'manualna-terapija', 'Z nežnimi ročnimi tehnikami', 20, 30.00, FALSE),
('Tecar Terapija', 'tecar-terapija', 'Napredna terapija s pomočjo radiofrekvenčne energije', 30, 40.00, FALSE),
('Magnetna Terapija', 'magnetna-terapija', 'Uporaba magnetnih polj', 20, 30.00, FALSE),
('MIS', 'mis', 'Magnetna indukcijska stimulacija', 20, 30.00, FALSE),
('Laserska Terapija', 'laserska-terapija', 'Neinvazivna metoda', 10, 10.00, FALSE),
('Media Taping', 'media-taping', 'Metoda z elastičnimi traki', 10, 10.00, FALSE),
('Cupping', 'cupping', 'Terapija z ventuzami', 30, 30.00, FALSE),
('Dryneedeling', 'dryneedeling', 'Invazivna fizioterapevtska metoda', 30, 30.00, FALSE);
```

#### Availability Slots (Mon-Fri 7-14 and 16-21, Sat 8-14):
```sql
-- Monday to Friday morning (7-14)
INSERT INTO availability_slots (day_of_week, start_time, end_time) VALUES
(1, '07:00', '14:00'), (2, '07:00', '14:00'), (3, '07:00', '14:00'), 
(4, '07:00', '14:00'), (5, '07:00', '14:00');

-- Monday to Friday evening (16-21)
INSERT INTO availability_slots (day_of_week, start_time, end_time) VALUES
(1, '16:00', '21:00'), (2, '16:00', '21:00'), (3, '16:00', '21:00'), 
(4, '16:00', '21:00'), (5, '16:00', '21:00');

-- Saturday (8-14)
INSERT INTO availability_slots (day_of_week, start_time, end_time) VALUES
(6, '08:00', '14:00');
```

---

## ⚠️ KNOWN ISSUES TO FIX

### 1. Environment Variables
**Issue:** Supabase credentials might not be set
**Check:** `.env.local` file must have:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Tables
**Issue:** Tables might not exist in Supabase
**Solution:** Run SQL scripts above in Supabase SQL Editor

### 3. Sample Data
**Issue:** No services or availability slots in database
**Solution:** Insert sample data using SQL above

### 4. Auth Configuration
**Issue:** Supabase Auth might not be configured
**Check:** 
- Email templates configured
- Email provider set up
- Redirect URLs whitelisted

---

## 🚀 TESTING EXECUTION PLAN

### Phase 1: Environment Setup (5 min)
1. Check .env.local exists with Supabase credentials
2. Verify Supabase project is accessible
3. Check database tables exist

### Phase 2: Database Population (10 min)
1. Insert services data
2. Insert availability slots
3. Create test admin user (role='admin')

### Phase 3: Registration Test (5 min)
1. Open `/registracija`
2. Register new test user
3. Verify email sent
4. Check profile created in database

### Phase 4: Login Test (3 min)
1. Open `/prijava`
2. Login with test user
3. Verify redirect to dashboard
4. Check session persists

### Phase 5: Booking Flow Test (10 min)
1. Navigate to `/rezervacija`
2. Select service
3. Select date
4. Verify time slots appear
5. Select time and submit
6. Verify booking in database
7. Check success message

### Phase 6: Admin Test (5 min)
1. Login as admin
2. Open `/admin`
3. Verify bookings display
4. Test status updates

### Phase 7: Full Integration Test (10 min)
1. Complete user journey: register → login → book → view dashboard
2. Admin journey: login → view bookings → update status
3. Test edge cases: double booking, past dates, etc.

---

## 📊 TEST RESULTS TEMPLATE

```
TEST DATE: ___________
TESTER: ___________

[ ] Hero Carousel - Smooth transitions
[ ] Registration - Works end-to-end
[ ] Login - Works end-to-end
[ ] Booking - Services load
[ ] Booking - Dates selectable
[ ] Booking - Time slots appear
[ ] Booking - Submission successful
[ ] Dashboard - Shows user bookings
[ ] Admin - Shows all bookings
[ ] Admin - Status updates work

ISSUES FOUND:
1. ___________
2. ___________

CRITICAL BLOCKERS:
1. ___________
```

---

## 🔧 FIXES APPLIED SO FAR

1. ✅ Hero carousel transition smoothed (speed: 1500ms, delay: 4000ms)
2. ✅ Images properly wrapped in divs
3. ✅ Therapy detail pages have background images
4. ✅ All 18 facility images integrated

---

## 📝 NEXT STEPS

1. **Verify Supabase Setup**
   - Check .env.local
   - Verify database connection
   - Create tables if missing

2. **Populate Database**
   - Insert services
   - Insert availability slots
   - Create test users

3. **Test All Flows**
   - Registration
   - Login
   - Booking (CRITICAL)
   - Admin panel

4. **Fix Any Issues Found**

5. **Deploy to Production**

---

**Status:** Ready for comprehensive testing
**Blocker:** Need to verify Supabase database setup
**Priority:** Test booking flow end-to-end
