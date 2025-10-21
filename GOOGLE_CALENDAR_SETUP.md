# Google Calendar Integration Setup Guide

## 📋 What You Need to Provide

To connect Google Calendar to your ORI369 booking system, I need the following credentials from you:

### Required from Google Cloud Console:

1. **GOOGLE_CLIENT_ID** - OAuth 2.0 Client ID
2. **GOOGLE_CLIENT_SECRET** - OAuth 2.0 Client Secret
3. **GOOGLE_REFRESH_TOKEN** - Your refresh token (we'll generate this together)

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it: `ORI369-Calendar`
4. Click "Create"

### Step 2: Enable Google Calendar API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it and press **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: `ORI369 Booking System`
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Click **Add or Remove Scopes**
     - Add: `https://www.googleapis.com/auth/calendar.events`
   - Click **Save and Continue**
   - Test users: Add your email
   - Click **Save and Continue**

4. Back to **Credentials** → **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: `ORI369 Calendar Sync`
   - Authorized redirect URIs: Add these:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://ori369test.netlify.app/api/auth/google/callback`
   - Click **Create**

5. **SAVE THESE VALUES:**
   - ✅ Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - ✅ Client Secret (looks like: `GOCSPX-xxxxx`)

---

## 📝 What to Send Me

Once you complete the above steps, send me:

```
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

**DO NOT share these publicly!** Send them privately.

---

## 🔐 Step 4: Generate Refresh Token (We'll do this together)

After you provide the Client ID and Secret, I'll create a simple OAuth flow page where you can:
1. Click "Connect Google Calendar"
2. Authorize the app
3. Get your refresh token
4. Add it to environment variables

---

## 🎯 What This Will Enable

Once configured, the system will:

✅ **Automatically create Google Calendar events** when bookings are made
✅ **Sync booking details** (service, client info, time)
✅ **Send email reminders** to clients automatically
✅ **Show events in your Google Calendar** with all booking details
✅ **Update events** when booking status changes
✅ **Delete events** when bookings are cancelled

---

## 📂 Environment Variables Needed

Add these to your `.env.local` file:

```bash
# Google Calendar Integration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

And in **Netlify Environment Variables** (for production):
- Same variables but with production redirect URI

---

## 🔄 How It Works

### When a booking is created:
```
1. User books appointment on website
2. Booking saved to Supabase database
3. API automatically calls Google Calendar
4. Event created in your Google Calendar
5. Client receives email confirmation
6. You see it in your calendar
```

### Event Details Include:
- **Title**: `ORI 369 - [Service Name]`
- **Description**: Client name, email, booking ID
- **Time**: Exact appointment time
- **Duration**: Based on service
- **Attendees**: Client email (they get notified)
- **Reminders**: 24 hours before (email) + 1 hour before (popup)

---

## 🧪 Testing

Once configured, you can test by:
1. Making a test booking
2. Checking your Google Calendar
3. Event should appear automatically
4. Client should receive email

---

## ⚠️ Important Notes

1. **Keep credentials secret** - Never commit to git
2. **Use test calendar first** - Test with a separate calendar
3. **Verify time zone** - Set to `Europe/Ljubljana`
4. **Check quotas** - Google Calendar API has rate limits

---

## 🆘 Troubleshooting

### Error: "Access blocked: This app's request is invalid"
- Make sure OAuth consent screen is configured
- Add your email to test users

### Error: "Redirect URI mismatch"
- Check that redirect URI in code matches Google Console

### Error: "Invalid refresh token"
- Generate a new refresh token using the OAuth flow

---

## 📞 Next Steps

1. ✅ Complete Steps 1-3 above
2. ✅ Send me Client ID and Client Secret (privately)
3. ✅ I'll create the OAuth flow page
4. ✅ You'll authorize and get refresh token
5. ✅ Add all credentials to environment variables
6. ✅ Test the integration
7. ✅ Deploy to production

---

## 🎉 Ready?

Once you have the **Client ID** and **Client Secret**, send them to me and I'll:
- Create the OAuth authorization flow
- Help you get the refresh token
- Test the integration
- Make sure everything works perfectly

Let me know when you're ready to proceed!
