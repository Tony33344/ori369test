# ORI 369 - Complete Content Extraction & Cloning Plan

## ❌ CRITICAL ISSUES IDENTIFIED

### Problem Summary:
1. **NO images downloaded** from ori369.com
2. **NO individual therapy pages** created (9 pages missing)
3. **Homepage shows PRICES** (original doesn't)
4. **Invented/shortened content** instead of exact clones
5. **Missing full articles** for each therapy

---

## 📋 COMPLETE SITE STRUCTURE (ori369.com)

### Main Pages
- ✅ `/` - Homepage (partial - needs fixing)
- ⚠️ `/o-nas/` - About page (incomplete content)
- ❌ `/cenik/` - Pricing page (has data, no page)
- ❌ `/kontakt/` - Contact page (incomplete)
- ❌ `/dogodki-in-delavnice/` - Events page (MISSING entirely)

### Therapy Detail Pages (ALL MISSING!)
1. ❌ `/elektrostimulacija/` - Full article
2. ❌ `/manualna-terapija/` - Full article
3. ❌ `/tecar-terapija/` - Full article
4. ❌ `/magnetna-terapija/` - Full article
5. ❌ `/mis/` - Full article
6. ❌ `/laserska-terapija/` - Full article
7. ❌ `/media-taping/` - Full article
8. ❌ `/cupping/` - Full article
9. ❌ `/dryneedeling-terapija/` - Full article

### Package Pages
- ❌ Individual package detail pages (if exist)

---

## 🖼️ IMAGES TO DOWNLOAD

### From ori369.com:
1. **Hero/Header Images**
   - Main hero background
   - Logo (full version)
   - Brand assets

2. **Therapy Images** (9 therapies)
   - Each therapy has feature image
   - Each therapy has detail page images
   
3. **Team Photos**
   - Staff/practitioner photos
   - About us section images

4. **Facility Photos**
   - Interior shots
   - Equipment photos
   - Treatment rooms

5. **Icons & Graphics**
   - Service icons
   - Decorative elements
   
6. **Testimonials/Social Proof**
   - Client photos (if any)
   - Before/after (if any)

---

## 📄 CONTENT TO EXTRACT

### Homepage Content
```
Current: Shows therapy cards WITH PRICES
Needed: Therapy cards WITHOUT prices, just descriptions + "Več informacij" links
```

Content sections on homepage:
- [ ] Hero section text (exact copy)
- [ ] Services section (exact descriptions)
- [ ] Packages section (exact descriptions)
- [ ] Contact section
- [ ] Hero images
- [ ] Background graphics

### Individual Therapy Pages
Each page needs:
- [ ] Full article text (multiple sections)
- [ ] Feature image
- [ ] Section images
- [ ] Proper headings structure
- [ ] CTA sections
- [ ] Footer content

**Example structure (Elektrostimulacija):**
```
- Title: Elektrostimulacija
- Section: Kaj je Elektrostimulacijska Terapija?
- Section: Kako Deluje... (TENS)
- Section: Kakšni so Glavni Učinki... (FES)
- Section: Katere Poškodbe... (indications)
- Section: Kdaj je Odsvetovana... (contraindications)
- Section: Koliko Čas Traja... (duration)
- CTA: Contact section
```

### O nas Page
- [ ] Full "Kdo smo?" text
- [ ] "Naše poslanstvo" text
- [ ] "Kaj je ORI Center 3 6 9?" text
- [ ] "Magične frekvence: 3 6 9" text
- [ ] "Zakaj izbrati ORI Center?" list
- [ ] Team photos
- [ ] Facility photos

### Cenik Page
- [ ] Create actual page (not just data.json)
- [ ] Layout matching original
- [ ] All prices with descriptions
- [ ] Package descriptions
- [ ] Individual services

### Kontakt Page
- [ ] Full contact information
- [ ] Map embed
- [ ] Contact form (if exists)
- [ ] Social media links
- [ ] Hours of operation

---

## 🔧 SYSTEMATIC EXTRACTION PROCESS

### Phase 1: Images (IN PROGRESS)
```bash
# Downloading all images from ori369.com
wget -r -l 1 -H -t 1 -nd -N -np -A jpg,jpeg,png,gif,webp,svg -erobots=off https://ori369.com/wp-content/uploads/
```

### Phase 2: Extract Full Content
For each therapy page:
1. Read full article from ori369.com
2. Save complete HTML/Markdown
3. Extract all sections
4. Note all images used
5. Document structure

### Phase 3: Create Missing Pages
1. Create `/app/terapije/[slug]/page.tsx` dynamic route
2. Create individual pages for each therapy
3. Implement exact layout from original
4. Add all images
5. Add all text content

### Phase 4: Fix Homepage
1. Remove prices from therapy cards
2. Keep only short descriptions
3. Add "Več informacij →" links
4. Match original layout exactly
5. Add proper images

### Phase 5: Complete Other Pages
1. Full O nas page
2. Cenik page
3. Kontakt page
4. Events page (if exists)

---

## 📊 EXTRACTION STATUS

### Therapy Content Extraction

#### 1. Elektrostimulacija
- Status: ❌ Not extracted
- Sections needed: 7+
- Images: Unknown
- URL: https://ori369.com/elektrostimulacija/

#### 2. Manualna Terapija
- Status: ❌ Not extracted
- Sections needed: Unknown
- Images: Unknown
- URL: https://ori369.com/manualna-terapija/

#### 3. Tecar Terapija
- Status: ❌ Not extracted
- Sections needed: Unknown
- Images: Unknown
- URL: https://ori369.com/tecar-terapija/

#### 4. Magnetna Terapija
- Status: ❌ Not extracted
- Sections needed: Unknown
- Images: Unknown
- URL: https://ori369.com/magnetna-terapija/

#### 5. MIS
- Status: ⚠️ Partially viewed
- Sections needed: 3-4
- Images: Unknown
- URL: https://ori369.com/mis/

#### 6. Laserska Terapija
- Status: ❌ Not extracted
- Sections needed: Unknown
- Images: Unknown
- URL: https://ori369.com/laserska-terapija/

#### 7. Media Taping
- Status: ❌ Not extracted
- Sections needed: Unknown
- Images: Unknown
- URL: https://ori369.com/media-taping/

#### 8. Cupping
- Status: ❌ Not extracted
- Sections needed: Unknown
- Images: Unknown
- URL: https://ori369.com/cupping/

#### 9. Dryneedeling
- Status: ❌ Not extracted
- Sections needed: Unknown
- Images: Unknown
- URL: https://ori369.com/dryneedeling-terapija/

---

## 🎯 NEXT IMMEDIATE ACTIONS

1. **Wait for image download to complete**
2. **Extract ALL therapy page content systematically**
3. **Create markdown files for each therapy** with complete content
4. **Build dynamic therapy detail page route**
5. **Update homepage to remove prices**
6. **Add all downloaded images to pages**

---

## 📝 NOTES

### What I Did WRONG:
- Used shortened/invented content instead of exact copies
- Showed prices on homepage (original doesn't)
- Didn't download ANY images
- Didn't create individual therapy pages
- Made assumptions instead of cloning exactly

### What I Should Have Done:
- Download ALL images FIRST
- Extract ALL text content EXACTLY
- Create ALL pages that exist on original
- Match layout and structure EXACTLY
- THEN improve/enhance

### Current vs Target:

| Element | Current | Target |
|---------|---------|--------|
| Images | 0 from original | ALL images |
| Therapy pages | 0 | 9 complete pages |
| Homepage prices | Shows prices | NO prices |
| Content | Shortened | EXACT copy |
| Layout | Approximated | EXACT match |

---

**BOTTOM LINE:** I need to CLONE FIRST, IMPROVE LATER.

**Started:** 2025-01-12 19:16
**Status:** Image download in progress, content extraction pending
