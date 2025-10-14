# 🌍 Multi-Language Translation Implementation Guide

## ✅ What's Been Created

### Translation Files (5 Languages)
- ✅ **Slovenian (sl.json)** - Default language
- ✅ **English (en.json)** - International
- ✅ **German (de.json)** - German market
- ✅ **Croatian (hr.json)** - Regional
- ✅ **Hungarian (hu.json)** - Regional

### Translation System
- ✅ **lib/i18n.tsx** - Translation context and hooks
- ✅ **components/LanguageSelector.tsx** - Language switcher component

### Updated Data
- ✅ **Address corrected:** "Ulica škofa Maksimilijana Držečnika 11, 2000 Maribor, Slovenia"
- ✅ **Phone numbers updated:** "051 302 206" and "041 458 931"
- ✅ **Footer updated** with correct address
- ✅ **Contact page updated** with correct address

---

## 🚀 How to Implement Translations

### Step 1: Wrap App with LanguageProvider

**File:** `app/layout.tsx`

```tsx
import { LanguageProvider } from '@/lib/i18n';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl">
      <body>
        <LanguageProvider>
          {/* Your existing layout */}
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add Language Selector to Header

**File:** `components/layout/Header.tsx`

```tsx
import LanguageSelector from '@/components/LanguageSelector';

// Inside your header component, add:
<LanguageSelector />
```

**Example placement:**
```tsx
<header>
  <nav>
    {/* Logo */}
    {/* Navigation links */}
    
    {/* Add language selector */}
    <LanguageSelector />
    
    {/* Login/Register buttons */}
  </nav>
</header>
```

### Step 3: Use Translations in Components

**Example: Contact Page**

```tsx
'use client';

import { useLanguage } from '@/lib/i18n';

export default function ContactPage() {
  const { t, translations } = useLanguage();

  return (
    <div>
      <h1>{t('contact.title')}</h1>
      <p>{t('contact.subtitle')}</p>
      
      {/* Phone numbers with +386 for non-Slovenian */}
      <div>
        {translations.site?.phone?.map((phone: string, idx: number) => (
          <a key={idx} href={`tel:${phone}`}>
            {phone}
          </a>
        ))}
      </div>
      
      {/* Address */}
      <p>{translations.site?.address}</p>
      
      {/* Working hours */}
      <p>{translations.site?.hours?.weekdays}</p>
      <p>{translations.site?.hours?.saturday}</p>
    </div>
  );
}
```

**Example: Navigation**

```tsx
'use client';

import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';

export default function Navigation() {
  const { t } = useLanguage();

  return (
    <nav>
      <Link href="/">{t('nav.home')}</Link>
      <Link href="/terapije">{t('nav.therapies')}</Link>
      <Link href="/paketi">{t('nav.packages')}</Link>
      <Link href="/o-nas">{t('nav.about')}</Link>
      <Link href="/kontakt">{t('nav.contact')}</Link>
    </nav>
  );
}
```

---

## 📋 Translation Keys Structure

### Navigation
```
nav.home
nav.therapies
nav.packages
nav.about
nav.contact
nav.login
nav.register
nav.dashboard
nav.admin
nav.logout
```

### Hero Section
```
hero.title
hero.subtitle
hero.cta
```

### Contact Page
```
contact.title
contact.subtitle
contact.email
contact.phone
contact.address
contact.hours
contact.weekdays
contact.saturday
contact.openInMaps
contact.bookNow
contact.bookMessage
```

### Authentication
```
auth.login
auth.register
auth.email
auth.password
auth.fullName
auth.phone
auth.confirmPassword
auth.loginButton
auth.registerButton
auth.forgotPassword
auth.noAccount
auth.haveAccount
auth.signUp
auth.signIn
```

### Dashboard
```
dashboard.welcome
dashboard.myBookings
dashboard.totalBookings
dashboard.activeBookings
dashboard.profile
dashboard.settings
dashboard.newBooking
dashboard.noBookings
dashboard.createFirst
dashboard.cancel
dashboard.status.pending
dashboard.status.confirmed
dashboard.status.completed
dashboard.status.cancelled
```

### Admin Panel
```
admin.title
admin.subtitle
admin.bookings
admin.services
admin.users
admin.stats.total
admin.stats.pending
admin.stats.confirmed
admin.stats.completed
admin.addService
admin.editService
admin.deleteService
admin.serviceName
admin.duration
admin.price
admin.active
admin.save
admin.cancel
admin.delete
```

### Common
```
common.loading
common.save
common.cancel
common.delete
common.edit
common.close
common.confirm
common.back
common.next
common.submit
common.search
common.filter
common.all
common.yes
common.no
```

---

## 🌍 Phone Number Format by Language

### Slovenian (sl)
```json
"phone": ["051 302 206", "041 458 931"]
```

### All Other Languages (en, de, hr, hu)
```json
"phone": ["+386 51 302 206", "+386 41 458 931"]
```

**Why?**
- Slovenian users recognize local format without country code
- International users need +386 country code

---

## 🎨 Language Selector Styling

The language selector includes:
- 🌍 Globe icon
- 🇸🇮 Flag emoji
- Language name (hidden on mobile)
- Dropdown with all languages
- Checkmark for active language

**Desktop view:**
```
🌍 🇸🇮 Slovenščina ▼
```

**Mobile view:**
```
🌍 🇸🇮 ▼
```

---

## 📱 Example: Complete Page with Translations

```tsx
'use client';

import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function HomePage() {
  const { t, translations, language } = useLanguage();

  return (
    <div>
      {/* Header with language selector */}
      <header>
        <nav>
          <div>Logo</div>
          <div>
            <a href="/">{t('nav.home')}</a>
            <a href="/terapije">{t('nav.therapies')}</a>
            <a href="/paketi">{t('nav.packages')}</a>
          </div>
          <LanguageSelector />
        </nav>
      </header>

      {/* Hero section */}
      <section>
        <h1>{t('hero.title')}</h1>
        <p>{t('hero.subtitle')}</p>
        <button>{t('hero.cta')}</button>
      </section>

      {/* Contact info */}
      <section>
        <h2>{t('contact.title')}</h2>
        
        {/* Phone - shows +386 for non-Slovenian */}
        <div>
          {translations.site?.phone?.map((phone: string, idx: number) => (
            <a key={idx} href={`tel:${phone.replace(/\s/g, '')}`}>
              {phone}
            </a>
          ))}
        </div>
        
        {/* Address */}
        <p>{translations.site?.address}</p>
        
        {/* Hours */}
        <p>{translations.site?.hours?.weekdays}</p>
        <p>{translations.site?.hours?.saturday}</p>
      </section>
    </div>
  );
}
```

---

## 🔧 Advanced Usage

### Conditional Content by Language

```tsx
const { language } = useLanguage();

{language === 'sl' ? (
  <p>Slovenian-specific content</p>
) : (
  <p>International content</p>
)}
```

### Dynamic Translations

```tsx
const { t } = useLanguage();

const status = 'pending';
const statusText = t(`dashboard.status.${status}`);
// Returns: "Na čakanju" (sl) or "Pending" (en)
```

### Fallback to Key

If translation is missing, the key is returned:
```tsx
t('missing.key') // Returns: "missing.key"
```

---

## ✅ Implementation Checklist

### Phase 1: Setup (5 minutes)
- [ ] Wrap app with `LanguageProvider` in `layout.tsx`
- [ ] Add `LanguageSelector` to header
- [ ] Test language switching

### Phase 2: Update Pages (30 minutes)
- [ ] Homepage - Hero section
- [ ] Contact page
- [ ] About page
- [ ] Therapies page
- [ ] Packages page

### Phase 3: Update Components (30 minutes)
- [ ] Header/Navigation
- [ ] Footer
- [ ] Auth forms (Login/Register)
- [ ] Dashboard
- [ ] Booking form

### Phase 4: Admin Panel (15 minutes)
- [ ] Admin dashboard
- [ ] Service management
- [ ] Booking management

### Phase 5: Testing (15 minutes)
- [ ] Test all 5 languages
- [ ] Check phone number formats
- [ ] Verify address displays correctly
- [ ] Test language persistence (localStorage)

---

## 🌟 Benefits

### For Users
- ✅ Choose preferred language
- ✅ Correct phone format (+386 for international)
- ✅ Language persists across sessions
- ✅ Easy language switching

### For Business
- ✅ Reach international customers
- ✅ Regional markets (Croatia, Hungary)
- ✅ German-speaking tourists
- ✅ Professional appearance

### For Developers
- ✅ Easy to add new languages
- ✅ Centralized translations
- ✅ Type-safe with TypeScript
- ✅ Simple API (`t('key')`)

---

## 📝 Adding New Translations

### 1. Add to Translation Files

Edit all 5 files:
- `public/locales/sl.json`
- `public/locales/en.json`
- `public/locales/de.json`
- `public/locales/hr.json`
- `public/locales/hu.json`

### 2. Use in Component

```tsx
const { t } = useLanguage();
<p>{t('your.new.key')}</p>
```

---

## 🎯 Quick Start Example

**1. Update layout.tsx:**
```tsx
import { LanguageProvider } from '@/lib/i18n';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

**2. Update Header.tsx:**
```tsx
import LanguageSelector from '@/components/LanguageSelector';

// Add to your header:
<LanguageSelector />
```

**3. Update any page:**
```tsx
'use client';
import { useLanguage } from '@/lib/i18n';

export default function Page() {
  const { t } = useLanguage();
  return <h1>{t('hero.title')}</h1>;
}
```

**Done! 🎉**

---

## 📞 Contact Information by Language

| Language | Phone Format | Address |
|----------|-------------|---------|
| Slovenian | 051 302 206<br>041 458 931 | Ulica škofa Maksimilijana Držečnika 11, 2000 Maribor, Slovenia |
| English | +386 51 302 206<br>+386 41 458 931 | Ulica škofa Maksimilijana Držečnika 11, 2000 Maribor, Slovenia |
| German | +386 51 302 206<br>+386 41 458 931 | Ulica škofa Maksimilijana Držečnika 11, 2000 Maribor, Slowenien |
| Croatian | +386 51 302 206<br>+386 41 458 931 | Ulica škofa Maksimilijana Držečnika 11, 2000 Maribor, Slovenija |
| Hungarian | +386 51 302 206<br>+386 41 458 931 | Ulica škofa Maksimilijana Držečnika 11, 2000 Maribor, Szlovénia |

---

**Status:** ✅ READY TO IMPLEMENT  
**Estimated Time:** 1-2 hours for full implementation  
**Languages:** 5 (Slovenian, English, German, Croatian, Hungarian)  
**Files Created:** 7 (5 translation files + i18n system + selector component)
