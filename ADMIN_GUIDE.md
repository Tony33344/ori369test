# 🔐 Admin Panel Guide - ORI369

## Access

**URL:** `/admin`

**Requirements:**
- Must be logged in
- User role must be `admin` in database

---

## Features

### 1. 📅 Rezervacije (Bookings Management)

**View all bookings with:**
- Client name and email
- Service/therapy booked
- Date and time
- Current status

**Actions:**
- **Change Status:** Click dropdown to update (Pending → Confirmed → Completed)
- **Sync to Google Calendar:** Click calendar icon (if configured)
- **Delete Booking:** Click trash icon

**Filters:**
- All bookings
- Pending (waiting for confirmation)
- Confirmed
- Completed

**Statistics Dashboard:**
- Total bookings
- Pending count
- Confirmed count
- Completed count

---

### 2. 🏥 Storitve & Cene (Services & Prices Management)

**Manage all therapies and packages without coding!**

#### View Services Table

Each service shows:
- **Name:** Service/therapy name
- **Type:** Terapija (therapy) or Paket (package)
- **Duration:** In minutes
- **Price:** In euros (€)
- **Status:** Active or Inactive
- **Actions:** Edit or Delete

#### Add New Service

Click **"Dodaj Storitev"** button

**Form Fields:**
1. **Ime storitve** (Service Name) *required*
   - Example: "Elektrostimulacija"
   - Slug is auto-generated from name

2. **Slug (URL)** *required*
   - Auto-generated, but can be edited
   - Example: "elektrostimulacija"
   - Used in URLs: `/terapije/elektrostimulacija`

3. **Opis** (Description)
   - Short description of the service
   - Optional

4. **Trajanje (Duration)** *required*
   - In minutes
   - Example: 30, 45, 60

5. **Cena (Price)** *required*
   - In euros
   - Example: 20.00, 35.50

6. **To je paket** (This is a package)
   - Check if this is a package (not single therapy)
   - If checked, shows "Število seans" (Number of sessions)

7. **Število seans** (Number of Sessions)
   - Only for packages
   - Example: 3, 5, 10

8. **Aktivna storitev** (Active Service)
   - Checked = visible on website
   - Unchecked = hidden from website

#### Edit Existing Service

1. Click **Edit icon** (pencil) on any service
2. Modify any fields
3. Click **"Posodobi"** (Update)

#### Delete Service

1. Click **Trash icon** on any service
2. Confirm deletion
3. Service is permanently removed

**⚠️ Warning:** Deleting a service that has bookings may cause issues. Consider deactivating instead.

#### Toggle Active/Inactive

Click the **status badge** (Aktivno/Neaktivno) to quickly toggle service visibility on the website.

---

## How to Access Admin Panel

### Step 1: Create Admin User

You need to manually set a user as admin in Supabase:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find your user (or create one via registration)
4. Edit the row
5. Change `role` from `user` to `admin`
6. Save

### Step 2: Login

1. Go to `/prijava`
2. Login with admin credentials
3. Navigate to `/admin`

---

## Common Tasks

### Change Therapy Price

1. Go to Admin Panel → **Storitve & Cene** tab
2. Find the therapy in the table
3. Click **Edit icon** (pencil)
4. Update the **Cena** field
5. Click **Posodobi**
6. ✅ Price updated instantly on website!

### Add New Therapy

1. Go to Admin Panel → **Storitve & Cene** tab
2. Click **"Dodaj Storitev"**
3. Fill in all required fields:
   - Name: "Nova Terapija"
   - Duration: 45
   - Price: 40.00
4. Leave "To je paket" unchecked
5. Click **Dodaj**
6. ✅ New therapy appears on website!

### Create Package

1. Go to Admin Panel → **Storitve & Cene** tab
2. Click **"Dodaj Storitev"**
3. Fill in fields:
   - Name: "Wellness Paket"
   - Duration: 60
   - Price: 150.00
4. **Check** "To je paket"
5. Set "Število seans": 5
6. Click **Dodaj**
7. ✅ Package appears on `/paketi` page!

### Hide Service Temporarily

1. Find service in table
2. Click status badge (Aktivno)
3. Status changes to "Neaktivno"
4. ✅ Service hidden from website (but not deleted)

### Confirm Booking

1. Go to **Rezervacije** tab
2. Find booking with status "Na čakanju"
3. Click status dropdown
4. Select "Potrjeno"
5. ✅ Status updated!

---

## Database Structure

### Services Table Fields

```
id: UUID (auto-generated)
name: TEXT (service name)
slug: TEXT (URL-friendly name)
description: TEXT (optional description)
duration: INTEGER (minutes)
price: DECIMAL (euros)
is_package: BOOLEAN (true for packages)
sessions: INTEGER (number of sessions for packages)
active: BOOLEAN (visible on website)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

---

## Tips & Best Practices

### Pricing

- Use whole numbers when possible (€20, €30, €40)
- For packages, price should reflect discount
- Update prices during off-peak hours

### Slugs

- Keep slugs simple and readable
- Use lowercase
- Use hyphens for spaces
- Avoid special characters
- Example: "tecar-terapija", "wellness-paket"

### Descriptions

- Keep short and clear
- Focus on benefits
- Use simple language
- Avoid medical jargon

### Packages

- Clearly indicate number of sessions
- Price should show value vs individual sessions
- Use descriptive names

### Service Status

- Use "Inactive" instead of deleting
- Inactive services can be reactivated anytime
- Deleted services are gone forever

---

## Troubleshooting

### Can't access /admin

**Problem:** Redirected to login or homepage

**Solution:**
1. Check if logged in
2. Verify user role is `admin` in database
3. Check Supabase profiles table

### Changes not appearing on website

**Problem:** Updated service but website shows old data

**Solution:**
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Check if service is marked as "Active"
3. Verify changes saved (check Supabase table)

### Can't delete service

**Problem:** Error when trying to delete

**Solution:**
1. Check if service has existing bookings
2. Consider deactivating instead of deleting
3. Delete related bookings first (if appropriate)

### Slug already exists

**Problem:** Error when creating service

**Solution:**
1. Change the slug to be unique
2. Add number or modifier: "terapija-2", "nova-terapija"

---

## Security Notes

- Only admin users can access `/admin`
- All changes are logged with timestamps
- Deleted data cannot be recovered
- Always backup before bulk changes

---

## Quick Reference

### Keyboard Shortcuts

- `Esc` - Close modal
- `Enter` - Submit form (when in input field)

### Status Colors

- 🟡 **Yellow** - Pending (Na čakanju)
- 🟢 **Green** - Confirmed (Potrjeno) / Active (Aktivno)
- 🔵 **Blue** - Completed (Zaključeno)
- 🔴 **Red** - Cancelled (Preklicano)
- ⚪ **Gray** - Inactive (Neaktivno)

---

## Support

For technical issues or questions:
1. Check this guide first
2. Review database in Supabase
3. Check browser console for errors
4. Contact developer if needed

---

**Last Updated:** October 13, 2025  
**Version:** 1.0
