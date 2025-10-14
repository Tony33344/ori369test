# 🚀 QUICK FIX GUIDE - Get Website Working in 25 Minutes

## ✅ WHAT'S ALREADY DONE
- Hero carousel fixed (smooth transitions)
- All images integrated (29 images)
- Therapy pages working
- Build passing

## 🔴 WHAT'S BROKEN
- Database not configured
- Registration/Login/Booking ALL BLOCKED

---

## 🎯 3-STEP FIX (25 minutes)

### STEP 1: Fix Database Policies (15 min)

**Go to:** Supabase Dashboard → SQL Editor → New Query

**Paste and run this:**

```sql
-- 1. Fix profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

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

-- 2. Fix services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services" 
ON services FOR SELECT 
TO authenticated, anon
USING (active = true);

-- 3. Fix bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" 
ON bookings FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookings" 
ON bookings FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. Fix availability_slots
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability" 
ON availability_slots FOR SELECT 
TO authenticated, anon
USING (active = true);
```

---

### STEP 2: Add Services (5 min)

**New Query, paste and run:**

```sql
INSERT INTO services (name, slug, description, duration, price, is_package, active) VALUES
('Elektrostimulacija', 'elektrostimulacija', 'Elektrostimulacija aktivira mišično tkivo', 20, 20.00, FALSE, TRUE),
('Manualna Terapija', 'manualna-terapija', 'Z nežnimi ročnimi tehnikami', 20, 30.00, FALSE, TRUE),
('Tecar Terapija', 'tecar-terapija', 'Napredna terapija s pomočjo radiofrekvenčne energije', 30, 40.00, FALSE, TRUE),
('Magnetna Terapija', 'magnetna-terapija', 'Uporaba magnetnih polj', 20, 30.00, FALSE, TRUE),
('MIS', 'mis', 'Magnetna indukcijska stimulacija', 20, 30.00, FALSE, TRUE),
('Laserska Terapija', 'laserska-terapija', 'Neinvazivna metoda', 10, 10.00, FALSE, TRUE),
('Media Taping', 'media-taping', 'Metoda z elastičnimi traki', 10, 10.00, FALSE, TRUE),
('Cupping', 'cupping', 'Terapija z ventuzami', 30, 30.00, FALSE, TRUE),
('Dryneedeling', 'dryneedeling', 'Invazivna fizioterapevtska metoda', 30, 30.00, FALSE, TRUE);
```

---

### STEP 3: Add Business Hours (5 min)

**New Query, paste and run:**

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

## ✅ VERIFY IT WORKS

**In terminal:**
```bash
cd /home/jack/Documents/augment-projects/ori369/ori369test-clone
node test-supabase.js
```

**Expected output:**
```
✅ Profiles table exists
✅ Services table exists
   Found 9 service(s)
✅ Bookings table exists
✅ Availability slots table exists
   Found 11 slot(s)
✅ All systems operational!
```

---

## 🧪 TEST THE WEBSITE

**Start dev server:**
```bash
npm run dev
```

**Open:** http://localhost:3000

**Test these in order:**

1. **Registration** → http://localhost:3000/registracija
   - Fill form
   - Submit
   - Should see success message

2. **Login** → http://localhost:3000/prijava
   - Use registered email/password
   - Should redirect to dashboard

3. **Booking** → http://localhost:3000/rezervacija
   - Select therapy (dropdown should have 9 options)
   - Select date
   - **Time slots should appear!**
   - Select time
   - Submit
   - Should see success message

---

## 🎯 SUCCESS CHECKLIST

- [ ] Step 1 SQL ran without errors
- [ ] Step 2 SQL inserted 9 services
- [ ] Step 3 SQL inserted 11 time slots
- [ ] Test script shows all ✅
- [ ] Registration works
- [ ] Login works
- [ ] Booking shows services
- [ ] Booking shows time slots
- [ ] Booking submits successfully

---

## 🚨 IF SOMETHING FAILS

**Error: "relation does not exist"**
→ Tables not created. Check Supabase dashboard → Table Editor

**Error: "infinite recursion"**
→ Step 1 didn't work. Try running it again

**No services in dropdown**
→ Step 2 didn't work. Check services table in Supabase

**No time slots appear**
→ Step 3 didn't work. Check availability_slots table

**Can't register/login**
→ Check Supabase Auth is enabled

---

## 📞 AFTER IT WORKS

**Deploy to Netlify:**
```bash
netlify deploy --prod --build
```

**Or push to Git:**
```bash
git add .
git commit -m "Fix: Database setup and hero carousel"
git push
```

---

## 📊 CURRENT STATUS

✅ **Code:** 100% ready  
🔴 **Database:** Needs 3 SQL scripts  
⏱️ **Time:** 25 minutes  
🚀 **Then:** Fully functional website

---

**DO THIS NOW:**
1. Open Supabase Dashboard
2. Run 3 SQL scripts above
3. Run `node test-supabase.js`
4. Test booking flow
5. Deploy!

**Questions?** Check `CRITICAL_ISSUES_REPORT.md` for details.
