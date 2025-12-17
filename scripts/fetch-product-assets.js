const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'assets', 'shop-products', 'products.json');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'shop-products');
const IMAGES_DIR = path.join(OUT_DIR, 'images');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function tryFetchShopifyProductJson(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/^\/products\/([^/]+)\/?$/);
    if (!m) return null;
    const handle = m[1];
    const jsonUrl = `${u.origin}/products/${handle}.json`;
    const res = await fetch(jsonUrl, {
      redirect: 'follow',
      headers: {
        'user-agent': 'ori369-product-asset-fetcher/1.0',
        accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.product ? data.product : null;
  } catch {
    return null;
  }
}

function stripTags(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeJsonParse(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function findMetaContent(html, propOrName) {
  const escaped = propOrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractJsonLd(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    const parsed = safeJsonParse(raw);
    if (!parsed) continue;
    if (Array.isArray(parsed)) out.push(...parsed);
    else out.push(parsed);
  }
  return out;
}

function pickProductFromJsonLd(jsonLd) {
  const candidates = [];
  for (const node of jsonLd) {
    if (!node) continue;
    if (node['@type'] === 'Product') candidates.push(node);
    if (node['@graph'] && Array.isArray(node['@graph'])) {
      for (const g of node['@graph']) {
        if (g && g['@type'] === 'Product') candidates.push(g);
      }
    }
  }
  return candidates[0] || null;
}

async function downloadToFile(url, filePath) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'ori369-product-asset-fetcher/1.0',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buf);
}

function extensionFromUrl(url) {
  const clean = url.split('?')[0];
  const ext = path.extname(clean).toLowerCase();
  if (ext === '.jpeg' || ext === '.jpg' || ext === '.png' || ext === '.webp') return ext;
  return '.jpg';
}

async function fetchOne(entry) {
  const url = entry.source_url;
  if (!url) return { changed: false };

  const shopifyProduct = await tryFetchShopifyProductJson(url);

  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'ori369-product-asset-fetcher/1.0',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  const html = await res.text();

  const ogImage = findMetaContent(html, 'og:image');
  const ogDesc = findMetaContent(html, 'og:description');

  const jsonLd = extractJsonLd(html);
  const product = pickProductFromJsonLd(jsonLd);

  const descriptionHtml =
    (shopifyProduct && shopifyProduct.body_html) ||
    (product && (product.description || product?.offers?.description)) ||
    ogDesc ||
    null;
  const descriptionText = descriptionHtml ? stripTags(descriptionHtml) : null;

  let imageUrl = null;
  if (shopifyProduct) {
    if (Array.isArray(shopifyProduct.images) && shopifyProduct.images[0] && shopifyProduct.images[0].src) {
      imageUrl = shopifyProduct.images[0].src;
    } else if (shopifyProduct.image && shopifyProduct.image.src) {
      imageUrl = shopifyProduct.image.src;
    }
  }
  if (product) {
    if (typeof product.image === 'string') imageUrl = product.image;
    else if (Array.isArray(product.image) && typeof product.image[0] === 'string') imageUrl = product.image[0];
  }
  if (!imageUrl) imageUrl = ogImage;

  let imageFilename = entry.image_filename;
  if (imageUrl) {
    const ext = extensionFromUrl(imageUrl);
    imageFilename = `${entry.slug}${ext}`;
    const filePath = path.join(IMAGES_DIR, imageFilename);
    if (!fs.existsSync(filePath)) {
      await downloadToFile(imageUrl, filePath);
    }
  }

  const now = new Date().toISOString();
  const changed =
    entry.description_text !== descriptionText ||
    entry.description_html !== descriptionHtml ||
    entry.image_source_url !== imageUrl ||
    entry.image_filename !== imageFilename;

  entry.description_html = descriptionHtml;
  entry.description_text = descriptionText;
  entry.image_source_url = imageUrl;
  entry.image_filename = imageFilename;
  entry.last_fetched_at = now;

  if (shopifyProduct) {
    entry.vendor = shopifyProduct.vendor || entry.vendor || null;
    entry.product_type = shopifyProduct.product_type || entry.product_type || null;
    entry.tags = shopifyProduct.tags || entry.tags || null;
  }

  return { changed };
}

async function main() {
  ensureDir(OUT_DIR);
  ensureDir(IMAGES_DIR);

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) {
    throw new Error('Manifest must be a JSON array');
  }

  let processed = 0;
  let changedCount = 0;

  for (const entry of manifest) {
    if (!entry || !entry.source_url) continue;
    const { changed } = await fetchOne(entry);
    processed++;
    if (changed) changedCount++;
    console.log(`Fetched: ${entry.slug}`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log('Done.');
  console.log({ processed, changed: changedCount, images_dir: path.relative(process.cwd(), IMAGES_DIR) });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
