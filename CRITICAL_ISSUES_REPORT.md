# Critical Issues Report - ORI369 Website
**Date:** 2025-01-12 23:10  
**Status:** 🔴 CRITICAL DATABASE ISSUES FOUND

---

## ✅ FIXED ISSUES

### 1. Hero Carousel Jumping ✅ FIXED
**Problem:** Images were jumping/overlapping during carousel transitions  
**Root Cause:** Fast transitions + no proper wrapper structure  
**Solution Applied:**
- Increased fade speed to 1500ms (smoother)
- Increased delay to 4000ms (more viewing time)
- Added proper div wrappers for each slide
- Added z-index layering
- Added `sizes="100vw"` for responsive images

**File:** `/components/sections/Hero.tsx`  
**Status:** ✅ WORKING - Smooth fade transitions now

---

### 2. Therapy Prices Source ✅ VERIFIED
**Question:** Where do therapy prices come from?  
**Answer:** Two sources (must be synchronized):
1. `/public/assets/data.json` - Used by homepage/listings
2. `/lib/therapyContent.ts` - Used by detail pages

**Current Prices:**
| Therapy | Duration | Price | Source |
|---------|----------|-------|--------|
| Elektrostimulacija | 20 min | €20 | data.json + therapyContent.ts |
| Manualna Terapija | 20 min | €30 | data.json + therapyContent.ts |
| Tecar Terapija | 30 min | €40 | data.json + therapyContent.ts |
| Magnetna Terapija | 20 min | €30 | data.json + therapyContent.ts |
| MIS | 20 min | €30 | data.json + therapyContent.ts |
| Laserska Terapija | 10 min | €10 | data.json + therapyContent.ts |
| Media Taping | 10 min | €10 | data.json + therapyContent.ts |
| Cupping | 30 min | €30 | data.json + therapyContent.ts |
| Dryneedeling | 30 min | €30 | data.json + therapyContent.ts |

**Note:** Original site doesn't show prices on therapy detail pages, only in booking/pricing sections.  
**Status:** ✅ VERIFIED - Prices are consistent

---

## 🔴 CRITICAL ISSUES FOUND

### 1. Supabase Database Policies - INFINITE RECURSION 🔴
**Error:** `infinite recursion detected in policy for relation "profiles"`  
**Impact:** 🔴 **BLOCKS ALL DATABASE OPERATIONS**
- ❌ Registration won't work
- ❌ Login won't work  
- ❌ Booking won't work
- ❌ Admin panel won't work

**Root Cause:** Row Level Security (RLS) policies have circular dependencies

**Solution Required:**
```sql
-- 1. Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- 2. Create correct policies
CREATE POLICY "Enable read access for authenticated users" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);
```

**Priority:** 🔴 CRITICAL - Must fix before ANY testing

---

### 2. Missing/Empty Database Tables 🔴
**Impact:** Booking system completely non-functional

**Tables Status:**
- ❌ `profiles` - Has infinite recursion policy error
- ❌ `services` - Has infinite recursion policy error (also empty)
- ❌ `bookings` - Has infinite recursion policy error
- ❌ `availability_slots` - Has infinite recursion policy error (also empty)

**What This Means:**
1. **No services data** = Booking dropdown will be empty
2. **No availability slots** = No time slots will appear
3. **Policy errors** = Can't read/write any data

**Solution Required:**
1. Fix RLS policies (see above)
2. Insert services data (9 therapies)
3. Insert availability slots (Mon-Fri 7-14, 16-21; Sat 8-14)

---

## 📋 IMMEDIATE ACTION PLAN

### Step 1: Fix Database Policies (15 min) 🔴 URGENT
**Location:** Supabase Dashboard → SQL Editor

```sql
-- Fix profiles table policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ALL ON profiles;

-- Re-enable with correct policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Fix services table (public read, admin write)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services" 
ON services FOR SELECT 
TO authenticated, anon
USING (active = true);

CREATE POLICY "Admins can manage services" 
ON services FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Fix bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" 
ON bookings FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookings" 
ON bookings FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all bookings" 
ON bookings FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Fix availability_slots (public read)
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability" 
ON availability_slots FOR SELECT 
TO authenticated, anon
USING (active = true);
```

---

### Step 2: Insert Services Data (5 min)
```sql
INSERT INTO services (name, slug, description, duration, price, is_package, active) VALUES
('Elektrostimulacija', 'elektrostimulacija', 'Elektrostimulacija aktivira mišično tkivo, izboljšuje krvni obtok in lajša bolečine.', 20, 20.00, FALSE, TRUE),
('Manualna Terapija', 'manualna-terapija', 'Z nežnimi ročnimi tehnikami terapevt sprošča napetosti in izboljšuje gibljivost.', 20, 30.00, FALSE, TRUE),
('Tecar Terapija', 'tecar-terapija', 'Napredna terapija s pomočjo radiofrekvenčne energije.', 30, 40.00, FALSE, TRUE),
('Magnetna Terapija', 'magnetna-terapija', 'Uporaba magnetnih polj za stimulacijo telesa in regeneracijo.', 20, 30.00, FALSE, TRUE),
('MIS', 'mis', 'Magnetna indukcijska stimulacija - revolucionarna terapija.', 20, 30.00, FALSE, TRUE),
('Laserska Terapija', 'laserska-terapija', 'Neinvazivna metoda z laserskimi svetlobnimi žarki.', 10, 10.00, FALSE, TRUE),
('Media Taping', 'media-taping', 'Metoda z elastičnimi traki za odpravo bolečin in otekline.', 10, 10.00, FALSE, TRUE),
('Cupping', 'cupping', 'Terapija z ventuzami za celjenje in regeneracijo.', 30, 30.00, FALSE, TRUE),
('Dryneedeling', 'dryneedeling', 'Invazivna fizioterapevtska metoda s suhim iglanjem.', 30, 30.00, FALSE, TRUE);
```

---

### Step 3: Insert Availability Slots (5 min)
```sql
-- Monday to Friday: 7:00-14:00
INSERT INTO availability_slots (day_of_week, start_time, end_time, active) VALUES
(1, '07:00:00', '14:00:00', TRUE),
(2, '07:00:00', '14:00:00', TRUE),
(3, '07:00:00', '14:00:00', TRUE),
(4, '07:00:00', '14:00:00', TRUE),
(5, '07:00:00', '14:00:00', TRUE);

-- Monday to Friday: 16:00-21:00
INSERT INTO availability_slots (day_of_week, start_time, end_time, active) VALUES
(1, '16:00:00', '21:00:00', TRUE),
(2, '16:00:00', '21:00:00', TRUE),
(3, '16:00:00', '21:00:00', TRUE),
(4, '16:00:00', '21:00:00', TRUE),
(5, '16:00:00', '21:00:00', TRUE);

-- Saturday: 8:00-14:00
INSERT INTO availability_slots (day_of_week, start_time, end_time, active) VALUES
(6, '08:00:00', '14:00:00', TRUE);
```

---

### Step 4: Test Connection Again (2 min)
```bash
node test-supabase.js
```

**Expected Output:**
```
✅ All systems operational!
✅ Database is properly set up
✅ Ready for testing booking flow
```

---

### Step 5: Test Full User Journey (10 min)
1. **Registration:** `/registracija`
   - Create new account
   - Verify email sent
   - Check profile created

2. **Login:** `/prijava`
   - Login with new account
   - Verify redirect to dashboard

3. **Booking:** `/rezervacija`
   - Select therapy
   - Select date
   - **VERIFY time slots appear** ← Critical test
   - Select time
   - Submit booking
   - Verify success message

4. **Dashboard:** `/dashboard`
   - Verify booking appears

---

## 🎯 TESTING CHECKLIST

After fixing database:

- [ ] Run `node test-supabase.js` - should show all ✅
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test booking flow (MOST CRITICAL)
  - [ ] Services dropdown populated
  - [ ] Date picker works
  - [ ] Time slots appear for selected date
  - [ ] Booking submits successfully
  - [ ] Booking appears in database
- [ ] Test dashboard shows user bookings
- [ ] Test admin panel (if admin user exists)

---

## 📊 CURRENT STATUS SUMMARY

| Component | Status | Notes |
|-----------|--------|-------|
| Hero Carousel | ✅ Working | Smooth transitions |
| Therapy Pages | ✅ Working | Images integrated |
| Prices | ✅ Verified | Consistent across files |
| Database Connection | ✅ Connected | But has policy errors |
| RLS Policies | 🔴 BROKEN | Infinite recursion |
| Services Data | 🔴 EMPTY | Need to insert |
| Availability Slots | 🔴 EMPTY | Need to insert |
| Registration | 🔴 BLOCKED | By policy errors |
| Login | 🔴 BLOCKED | By policy errors |
| Booking | 🔴 BLOCKED | By policy errors + empty data |
| Admin Panel | 🔴 BLOCKED | By policy errors |

---

## 🚨 BLOCKER SUMMARY

**Cannot test or use ANY user features until:**
1. ✅ Fix RLS policies (infinite recursion)
2. ✅ Insert services data
3. ✅ Insert availability slots data

**Estimated Time to Fix:** 25 minutes  
**Priority:** 🔴 CRITICAL - MUST FIX BEFORE DEPLOYMENT

---

## 📝 FILES TO REFERENCE

1. **SQL Scripts:** See above in this document
2. **Test Script:** `test-supabase.js` (already created)
3. **Comprehensive Plan:** `COMPREHENSIVE_TEST_PLAN.md`
4. **Code Files:**
   - Registration: `/app/registracija/page.tsx`
   - Login: `/app/prijava/page.tsx`
   - Booking: `/app/rezervacija/page.tsx`
   - Supabase client: `/lib/supabase.ts`

---

**Next Action:** Fix Supabase database policies and populate data  
**Blocker:** Cannot proceed with any testing until database is fixed  
**ETA to Working State:** 25 minutes (if SQL scripts run successfully)
