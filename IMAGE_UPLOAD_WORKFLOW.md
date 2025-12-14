# Image Upload Workflow - Complete Guide

## ⚠️ IMPORTANT: Two-Step Process

Adding images to CMS content requires **TWO STEPS**:

### Step 1: Upload Image (Local Preview)
- Image appears in admin panel
- Image is stored in Supabase Storage
- **NOT YET saved to database**

### Step 2: Save All Changes (Database)
- Click **"💾 Save All Changes"** button
- Image is now permanently saved to database
- Image appears on website

---

## 🎯 Complete Workflow

### Adding an Image to a Page

**1. Go to Admin Panel**
```
http://localhost:3000/admin → CMS tab
```

**2. Select a Page**
- Click on page in left sidebar (e.g., "MotioScan")

**3. Add Image Block**
- Scroll to "Add new block" section
- Click **"🖼️ Add Image"** button (purple)

**4. Upload Image**
- Click upload area or drag & drop
- Select image file (PNG, JPG, GIF, WebP)
- Wait for upload to complete
- ✅ Image preview appears

**5. Configure Image**
- **Alt Text**: Describe the image (accessibility)
- **Size**: Small (25%), Medium (50%), Large (75%), Full Width
- **Alignment**: Left, Center, Right
- **Caption**: Optional text below image

**6. ⚠️ SAVE ALL CHANGES** ← THIS IS CRITICAL!
- Click **"💾 Save All Changes"** button at top
- Wait for success message
- Image is now saved to database

**7. Verify on Website**
- Go to `http://localhost:3000/cms/motioscan`
- Image should be visible on the page

---

## 🔴 Common Mistakes

### ❌ Mistake 1: Upload but Don't Save
```
Upload image → See preview → Navigate away
Result: Image is LOST (not in database)
```

**Fix:** Always click "💾 Save All Changes" after uploading

### ❌ Mistake 2: Refresh Page After Upload
```
Upload image → Refresh page
Result: Image disappears (not saved yet)
```

**Fix:** Click Save before refreshing

### ❌ Mistake 3: Edit Block but Don't Save
```
Upload image → Edit other blocks → Navigate away
Result: All changes are LOST
```

**Fix:** Click Save after ALL edits

---

## ✅ Correct Workflow

```
1. Upload image → See preview ✓
2. Configure (size, alignment, caption) ✓
3. Click "💾 Save All Changes" ✓
4. See success message ✓
5. Check website - image is there ✓
```

---

## 🎨 Visual Indicators

### Image Block States

**Before Upload:**
```
📝 Add Image
[Upload area]
```

**After Upload (Not Saved):**
```
🖼️ Image    ⚠️ Not Saved  ← Pulsing warning
[Image preview]
```

**After Save:**
```
🖼️ Image
[Image preview]
```

---

## 📍 Where to Click Save

### Location 1: Top Right (Main Save)
```
┌─────────────────────────────────────┐
│ MotioScan                           │
│ /motioscan                          │
│                    👁️  💾 Save All Changes │
└─────────────────────────────────────┘
```

**Use this to save ALL changes on the page**

### Location 2: Inside Block Editor
```
┌─────────────────────────────────────┐
│ ✏️ Edit 🖼️ Image                     │
│                                     │
│ [Upload area]                       │
│ [Alt text input]                    │
│ [Size dropdown]                     │
│ [Alignment dropdown]                │
│ [Caption input]                     │
│                                     │
│ [Cancel]  [Save] ← Save this block  │
└─────────────────────────────────────┘
```

**Use this to save changes within the block editor**

---

## 🔄 Full Example: Adding Image to MotioScan

1. **Go to Admin**
   - Navigate to `http://localhost:3000/admin`
   - Click **CMS** tab

2. **Select MotioScan**
   - Click "MotioScan" in left sidebar

3. **Add Image Block**
   - Scroll down to "Add new block"
   - Click **"🖼️ Add Image"** button

4. **Upload Image**
   - Click upload area
   - Select image file
   - Wait for upload
   - See image preview

5. **Configure**
   - Alt Text: "MotioScan equipment"
   - Size: "Large (75%)"
   - Alignment: "Center"
   - Caption: "Advanced 3D motion analysis"

6. **Save Block** (if editing)
   - Click [Save] inside block editor
   - Or skip if just uploading

7. **Save All Changes** ← CRITICAL!
   - Click **"💾 Save All Changes"** at top
   - Wait for "Content saved!" message

8. **Verify**
   - Go to `http://localhost:3000/cms/motioscan`
   - Scroll down
   - Image should be visible

---

## 🐛 Troubleshooting

### Image Disappears After Refresh
**Problem:** Image was uploaded but not saved
**Solution:** Always click "💾 Save All Changes" before refreshing

### Image Not Showing on Website
**Problem:** Image was uploaded but not saved to database
**Solution:** Check admin panel - if image has "⚠️ Not Saved" badge, click Save

### Upload Fails
**Problem:** File too large or wrong format
**Solution:** Use PNG, JPG, GIF, or WebP under 50MB

### Image Shows in Admin but Not Website
**Problem:** Changes not saved
**Solution:** Click "💾 Save All Changes" button

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Upload Image                                         │
│    ↓                                                    │
│    Supabase Storage (cms-images bucket)                │
│    ↓                                                    │
│    Public URL generated                                │
│    ↓                                                    │
│    Image preview shows in admin (LOCAL STATE)          │
└─────────────────────────────────────────────────────────┘
                         ↓
                    SAVE REQUIRED
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Click "Save All Changes"                             │
│    ↓                                                    │
│    Convert blocks to HTML                              │
│    ↓                                                    │
│    Send to /api/cms/blocks (PUT)                       │
│    ↓                                                    │
│    Update block_translations table                     │
│    ↓                                                    │
│    Success message                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Website Loads Content                                │
│    ↓                                                    │
│    GET /api/cms/pages?slug=motioscan                   │
│    ↓                                                    │
│    Returns HTML with image URL                         │
│    ↓                                                    │
│    Image displays on website                           │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Before Leaving Admin

- [ ] Image uploaded ✓
- [ ] Image preview visible ✓
- [ ] Size configured ✓
- [ ] Alignment set ✓
- [ ] Caption added (if needed) ✓
- [ ] **"💾 Save All Changes" clicked** ✓
- [ ] Success message appeared ✓
- [ ] Website shows image ✓

---

## 🚀 Quick Reference

| Action | Result | Saved? |
|--------|--------|--------|
| Upload image | Preview shows | ❌ No |
| Configure image | Settings applied | ❌ No |
| Click "Save" in block | Block saved | ✅ Yes |
| Click "Save All Changes" | All changes saved | ✅ Yes |
| Refresh page | Data persists | ✅ Yes |
| Go to website | Image visible | ✅ Yes |

---

**Remember: Upload → Configure → SAVE! 💾**
