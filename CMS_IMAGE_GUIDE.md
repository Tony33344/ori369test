# CMS Manager with Image Support - Complete Guide

## ✅ What's Working

### 1. **CMS Content Management**
- ✓ Load all pages (Home, O nas, Terapije, Paketi, Kontakt, MotioScan)
- ✓ Edit content blocks visually (no HTML needed)
- ✓ Block types: Heading, Text, List, Numbered List, **Image**
- ✓ Real-time preview of formatted content
- ✓ Save changes directly to Supabase

### 2. **Image Upload & Storage**
- ✓ Upload images to Supabase Storage (`cms-images` bucket)
- ✓ Images are publicly accessible
- ✓ Automatic public URL generation
- ✓ Support for PNG, JPG, GIF, WebP (up to 50MB)

### 3. **Image Formatting Options**
When adding an image block, you can customize:

| Option | Values | Default |
|--------|--------|---------|
| **Size** | Small (25%), Medium (50%), Large (75%), Full Width | Medium |
| **Alignment** | Left, Center, Right | Center |
| **Alt Text** | Any text (for accessibility) | Auto-generated from filename |
| **Caption** | Optional text below image | None |

### 4. **Real-time Updates**
- Edit content in CMS Manager
- Click Save
- Changes immediately appear on the website
- No cache delays or manual deployments needed

---

## 🚀 How to Use

### Adding an Image Block

1. **Go to Admin Panel**
   - Navigate to `http://localhost:3000/admin`
   - Click the **CMS** tab

2. **Select a Page**
   - Choose a page from the left sidebar (e.g., "Home")

3. **Add Image Block**
   - Scroll to "Add new block" section
   - Click the **"Add Image"** button (purple button)

4. **Upload Image**
   - Click the upload area or drag & drop
   - Select an image file (PNG, JPG, GIF, WebP)
   - Wait for upload to complete

5. **Configure Image**
   - **Alt Text**: Describe the image (for accessibility)
   - **Size**: Choose how wide the image should be
   - **Alignment**: Left, Center, or Right
   - **Caption**: Optional text below the image

6. **Preview**
   - Click the eye icon to see how it looks
   - Adjust settings if needed

7. **Save**
   - Click the **"💾 Save"** button
   - Changes are saved to Supabase

### Editing Existing Blocks

1. Hover over any content block
2. Click the **Edit** button (pencil icon)
3. Make changes
4. Click **Save**

### Deleting Blocks

1. Hover over a block
2. Click the **Delete** button (trash icon)
3. Click **Save** to confirm

---

## 📁 Storage Structure

Images are stored in Supabase Storage:
```
cms-images/
├── image-1.png
├── image-2.jpg
├── logo.png
└── ...
```

**Public URL Format:**
```
https://kbmclkpqjbdmnevnxmfa.supabase.co/storage/v1/object/public/cms-images/image-name.png
```

---

## 🔧 Technical Details

### Database Schema

**Pages Table**
```
id | slug | title | status | created_at
```

**Sections Table**
```
id | page_id | type | order_index | visible | settings
```

**Blocks Table**
```
id | section_id | type | order_index | content
```

**Block Translations Table**
```
id | block_id | lang | content (JSON with html field)
```

### Image Block HTML Structure

Images are stored as HTML in `block_translations.content.html`:

```html
<figure class="mx-auto max-w-2xl">
  <img 
    src="https://kbmclkpqjbdmnevnxmfa.supabase.co/storage/v1/object/public/cms-images/image.png"
    alt="Image description"
    class="w-full h-auto rounded-lg"
    data-width="medium"
    data-align="center"
  />
  <figcaption class="text-sm text-gray-600 text-center mt-2">
    Image caption
  </figcaption>
</figure>
```

### API Endpoints

**Get Page Content:**
```
GET /api/cms/pages?slug=home
```

Response includes blocks with translations and image URLs.

**Upload Image:**
```
POST /api/upload-cms-image
Content-Type: multipart/form-data

file: <binary image data>
```

Response:
```json
{
  "url": "https://kbmclkpqjbdmnevnxmfa.supabase.co/storage/v1/object/public/cms-images/image.png"
}
```

**Update Block:**
```
PUT /api/cms/blocks
Content-Type: application/json

{
  "id": "block-id",
  "type": "text",
  "order_index": 0,
  "content": {},
  "translations": {
    "sl": {
      "html": "<p>Content with images...</p>"
    }
  }
}
```

---

## 📝 Content Types

### 1. Heading
- Large, bold text
- Used for section titles
- Renders as `<h2>` tag

### 2. Text Paragraph
- Regular text content
- Renders as `<p>` tag
- Supports multiple paragraphs

### 3. Bullet List
- Unordered list
- One item per line
- Renders as `<ul>` tag

### 4. Numbered List
- Ordered list
- One item per line
- Renders as `<ol>` tag

### 5. Image
- Upload and display images
- Customizable size and alignment
- Optional caption
- Renders as `<figure>` tag with `<img>` and `<figcaption>`

---

## 🎨 Image Size Guide

| Size | Width | Use Case |
|------|-------|----------|
| **Small** | 25% | Sidebar images, thumbnails |
| **Medium** | 50% | Standard content images |
| **Large** | 75% | Featured images |
| **Full Width** | 100% | Hero images, banners |

---

## 🔐 Security

- ✓ Images stored in Supabase Storage (secure cloud)
- ✓ Public bucket (images are meant to be public)
- ✓ File size limit: 50MB per image
- ✓ Admin authentication required for uploads
- ✓ No direct file system access

---

## 🐛 Troubleshooting

### Image Upload Fails
- Check file size (max 50MB)
- Verify file format (PNG, JPG, GIF, WebP)
- Check internet connection
- Ensure Supabase credentials are valid

### Image Not Showing on Website
- Verify image URL in CMS Manager
- Check if image is in Supabase Storage
- Clear browser cache
- Check browser console for errors

### Changes Not Saving
- Ensure you clicked the **Save** button
- Check for error toast notifications
- Verify admin authentication
- Check Supabase connection

### Image Alignment Not Working
- Verify alignment is set correctly
- Check browser zoom level
- Clear browser cache
- Try different alignment option

---

## 📊 Testing

Run the test suite:

```bash
# Test CMS content flow
node scripts/test-cms-flow.js

# Test image upload flow
node scripts/test-image-flow.js

# Clean up test images
node scripts/cleanup-test-images.js
```

---

## 🚀 Next Steps

1. **Add more pages** - Create new pages through CMS Manager
2. **Add rich formatting** - Bold, italic, links in text blocks
3. **Image gallery** - Multiple images in one block
4. **Drag & drop reordering** - Reorder blocks visually
5. **Multi-language support** - Add content in different languages

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review the test scripts
3. Check browser console for errors
4. Verify Supabase connection
5. Check API responses in Network tab

---

**Last Updated:** November 16, 2025
**Status:** ✅ Fully Tested and Working
