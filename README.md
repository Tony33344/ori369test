# ORI 369 - Enhanced Website Clone

A complete, modern clone of ori369.com with enhanced features including Supabase backend, real-time booking system, admin dashboard, and Google Calendar integration.

## 🌟 Features

### Frontend
- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **Animations**: Smooth animations with Framer Motion
- **SEO Optimized**: Meta tags, semantic HTML, proper structure

### Backend & Database
- **Supabase Integration**: PostgreSQL database with real-time subscriptions
- **Authentication**: Email/password authentication with Supabase Auth
- **Row Level Security**: Secure data access with RLS policies
- **Real-time Updates**: Live booking updates for admin dashboard

### Booking System
- **Smart Booking**: Real-time availability checking
- **User-friendly Interface**: Calendar-based date selection
- **Service Selection**: Support for both individual therapies and packages
- **Booking Management**: Users can view and manage their bookings

### Admin Dashboard
- **Real-time Monitoring**: Live booking updates and statistics
- **Booking Management**: Update status, edit, or delete bookings
- **Google Calendar Sync**: One-click sync to Google Calendar
- **Analytics**: Quick stats on bookings and status

### Pages
- **Home**: Hero, services showcase, packages, testimonials
- **Terapije**: All therapy services with details
- **Paketi**: Holistic therapy packages
- **O nas**: About page with mission and values
- **Kontakt**: Contact page with map integration
- **Rezervacija**: Smart booking system
- **Dashboard**: User booking management
- **Admin**: Full admin dashboard (admin role required)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- Supabase CLI installed and configured
- Netlify CLI installed and configured

### Installation

1. **Clone and Install Dependencies**
```bash
cd ori369test-clone
npm install
```

2. **Environment Setup**
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kbmclkpqjbdmnevnxmfa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
ADMIN_EMAILS=admin@ori369.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Database Setup**

The database is already set up via Supabase CLI. The migration includes:
- User profiles with role-based access
- Services and packages
- Bookings with real-time support
- Availability slots
- Row Level Security policies

To push migrations again (if needed):
```bash
supabase db push
```

4. **Create Admin User**

After signing up through the app, manually update your user role in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

5. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

### Tables
- **profiles**: User profiles extending Supabase auth
- **services**: Therapy services and packages
- **bookings**: User bookings with status tracking
- **availability_slots**: Available time slots by day

### Key Features
- Automatic profile creation on signup
- Real-time subscriptions enabled for bookings
- Comprehensive RLS policies for security
- Google Calendar event ID storage

## 🔐 Authentication & Authorization

### User Roles
- **user**: Default role, can create and manage own bookings
- **admin**: Can access admin dashboard, manage all bookings, sync to Google Calendar

### Protected Routes
- `/dashboard`: Requires authentication
- `/admin`: Requires admin role
- `/rezervacija`: Requires authentication for booking submission

## 📅 Google Calendar Integration

### Setup Instructions

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Calendar API

2. **Create OAuth Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback` and `https://ori369test.netlify.app/api/auth/google/callback`

3. **Add Credentials to Environment**
   - Copy Client ID and Client Secret to `.env.local`

4. **OAuth Flow** (First Time)
   - Implement OAuth flow to get refresh token
   - Store refresh token securely
   - Use refresh token for API calls

### Current Implementation
The Google Calendar sync endpoint (`/api/google-calendar/sync/route.ts`) is ready but requires OAuth setup to be completed.

## 🌐 Deployment

### Netlify Deployment

The project is already linked to Netlify (`ori369test.netlify.app`).

1. **Set Environment Variables in Netlify**
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://kbmclkpqjbdmnevnxmfa.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set GOOGLE_CLIENT_ID "your-client-id"
netlify env:set GOOGLE_CLIENT_SECRET "your-client-secret"
netlify env:set NEXT_PUBLIC_SITE_URL "https://ori369test.netlify.app"
```

2. **Deploy**
```bash
# Build and deploy
npm run build
netlify deploy --prod
```

Alternatively, push to GitHub and enable automatic deployments.

## 📁 Project Structure

```
ori369test-clone/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (Google Calendar)
│   ├── dashboard/          # User dashboard
│   ├── kontakt/            # Contact page
│   ├── o-nas/              # About page
│   ├── paketi/             # Packages page
│   ├── prijava/            # Login page
│   ├── registracija/       # Registration page
│   ├── rezervacija/        # Booking page
│   ├── terapije/           # Therapies page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── layout/             # Header, Footer
│   └── sections/           # Hero, Services, Packages, Testimonials
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   └── auth.ts             # Auth helpers
├── public/
│   └── assets/
│       └── data.json       # Site content data
├── supabase/
│   └── migrations/         # Database migrations
├── .env.example            # Environment variables template
├── netlify.toml            # Netlify configuration
└── README.md               # This file
```

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Netlify
- **Calendar**: Google Calendar API

## 📝 Key Improvements Over Original

1. **Real-time Booking System**: Live availability checking and booking management
2. **User Authentication**: Secure user accounts with booking history
3. **Admin Dashboard**: Comprehensive booking management interface
4. **Google Calendar Integration**: Automatic event creation and syncing
5. **Modern UI/UX**: Smooth animations, responsive design, better user flow
6. **Performance**: Optimized images, lazy loading, efficient data fetching
7. **Security**: RLS policies, secure authentication, protected routes
8. **Scalability**: Database-driven content, easy to add services/packages

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check Supabase project status
supabase projects list

# Reconnect if needed
supabase link --project-ref kbmclkpqjbdmnevnxmfa
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Environment Variables Not Loading
- Ensure `.env.local` exists in project root
- Restart dev server after changing env vars
- For Netlify, set env vars in dashboard or via CLI

## 📞 Support

For issues or questions:
- Email: Info@ori369.com
- Phone: +386 41 458 931 | 051 302 206

## 📄 License

This project is created for ORI 369. All rights reserved.
