# 🔐 How to Set Up First Admin User

## Quick Steps

### 1. Register a User Account

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open browser: `http://localhost:3000`

3. Go to **Registracija** (or `/registracija`)

4. Fill in the form:
   - **Name:** Your Name
   - **Email:** admin@ori369.com (or your email)
   - **Password:** Your secure password

5. Click **Registracija**

6. Check your email for confirmation (if email is configured)
   - If no email provider configured, user is created but may need manual activation in Supabase

---

### 2. Set User as Admin

**Option A: Using NPM Script (Recommended)**

```bash
npm run set-admin admin@ori369.com
```

Replace `admin@ori369.com` with the email you registered with.

**Expected Output:**
```
🔐 ORI369 - Set User as Admin

Looking for user with email: admin@ori369.com

✅ User found:
   Name: Your Name
   Email: admin@ori369.com
   Current Role: user

✅ SUCCESS! User is now an admin!

Next steps:
1. User should logout and login again
2. Navigate to /admin
3. Admin panel will be accessible
```

**Option B: Manually in Supabase Dashboard**

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select **profiles** table
4. Find your user row
5. Click **Edit**
6. Change `role` from `user` to `admin`
7. Click **Save**

---

### 3. Login as Admin

1. **Logout** if currently logged in
2. Go to **Prijava** (or `/prijava`)
3. Enter your credentials
4. Click **Prijava**

---

### 4. Access Admin Panel

1. After login, you'll be on Dashboard
2. You should see a blue banner: **"Imate administratorski dostop"**
3. Click **"Pojdi na Admin Dashboard"**
4. Or navigate directly to `/admin`

---

## Troubleshooting

### "No user found with that email"

**Problem:** User doesn't exist in profiles table

**Solutions:**
1. Make sure you registered first
2. Check if email is correct
3. Check Supabase profiles table manually
4. User might need to confirm email first

### "User is already an admin"

**Problem:** User already has admin role

**Solution:** This is not an error! User is already admin. Just login and go to `/admin`

### Can't access /admin after setting as admin

**Problem:** Session not updated

**Solutions:**
1. **Logout completely**
2. **Clear browser cache** (Ctrl+Shift+Del)
3. **Login again**
4. Try accessing `/admin`

### Script says "Missing Supabase credentials"

**Problem:** .env.local file missing or incorrect

**Solution:**
1. Check if `.env.local` exists in project root
2. Verify it contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. Restart dev server after adding

---

## Setting Additional Admins

Once you have one admin, you can set others:

### Method 1: Using Script (Recommended)

```bash
npm run set-admin another@example.com
```

### Method 2: Future Feature (Not Yet Implemented)

In the future, admins will be able to promote users from the admin panel.

**For now, use the script or Supabase dashboard.**

---

## Security Notes

### Why Can't Admins Create Admins in UI?

**Security reasons:**
- Prevents unauthorized admin creation
- Requires database/server access
- Logs are kept in terminal/Supabase
- Reduces attack surface

### Best Practices

1. **Use strong passwords** for admin accounts
2. **Limit admin access** to trusted people only
3. **Don't share admin credentials**
4. **Regularly audit** admin users
5. **Use personal emails** (not shared accounts)

---

## Quick Reference

### Commands

```bash
# Set user as admin
npm run set-admin <email>

# Test database connection
npm run test:db

# Start dev server
npm run dev
```

### URLs

- Registration: `/registracija`
- Login: `/prijava`
- Dashboard: `/dashboard`
- Admin Panel: `/admin`
- Settings: `/nastavitve`

---

## Example: Complete Setup

```bash
# 1. Start server
npm run dev

# 2. Register at http://localhost:3000/registracija
#    Email: jack@ori369.com
#    Password: SecurePass123

# 3. Set as admin
npm run set-admin jack@ori369.com

# 4. Login at http://localhost:3000/prijava

# 5. Go to http://localhost:3000/admin

# ✅ Done! You're now an admin!
```

---

## Next Steps After Setup

1. **Add Services**
   - Go to Admin → Storitve & Cene
   - Add your therapies and packages

2. **Configure Availability**
   - Check availability_slots table
   - Adjust working hours if needed

3. **Test Booking Flow**
   - Create test user
   - Make test booking
   - Verify in admin panel

4. **Customize Content**
   - Update contact information
   - Add your branding
   - Test all pages

---

**Need Help?**

Check these files:
- `ADMIN_GUIDE.md` - Complete admin documentation
- `TESTING_GUIDE.md` - Testing procedures
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Full feature list
