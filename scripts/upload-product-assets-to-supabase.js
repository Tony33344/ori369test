const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const MANIFEST_PATH = path.join(__dirname, '..', 'assets', 'shop-products', 'products.json');
const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'shop-products', 'images');

const BUCKET = process.env.PRODUCT_IMAGES_BUCKET || 'product-images';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function contentTypeFromExt(ext) {
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

async function uploadImage(localPath, destPath) {
  const buf = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(destPath, buf, {
      upsert: true,
      contentType: contentTypeFromExt(ext),
      cacheControl: '31536000',
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
  return data.publicUrl;
}

async function updateProductRowBySlug(slug, patch) {
  const { error } = await supabase.from('shop_products').update(patch).eq('slug', slug);
  if (error) throw error;
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) throw new Error('Manifest must be an array');

  const dryRun = process.argv.includes('--dry-run');
  const updateDescription = process.argv.includes('--with-description');

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of manifest) {
    if (!item?.slug) continue;

    if (!item.image_filename) {
      skipped++;
      continue;
    }

    const localPath = path.join(IMAGES_DIR, item.image_filename);
    if (!fs.existsSync(localPath)) {
      skipped++;
      continue;
    }

    const destPath = item.image_filename;

    let publicUrl = item.image_public_url || null;

    if (!dryRun) {
      publicUrl = await uploadImage(localPath, destPath);
      uploaded++;
    }

    const patch = {
      image_url: publicUrl,
    };

    if (updateDescription && item.description_text) {
      patch.description = item.description_text;
    }

    if (!dryRun) {
      await updateProductRowBySlug(item.slug, patch);
      updated++;
    }

    item.image_public_url = publicUrl;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log('Done.');
  console.log({ dryRun, uploaded, updated_rows: updated, skipped });
  console.log(`Bucket: ${BUCKET}`);
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
