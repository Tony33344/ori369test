const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'assets', 'shop-products', 'products.json');
const BASE = 'https://4endurance.com';

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[+]/g, ' plus ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(caps|capsules|softgels|sachets|servings)\b/g, ' ')
    .replace(/\bmg\b/g, ' ')
    .replace(/\bg\b/g, ' ')
    .replace(/\bml\b/g, ' ')
    .replace(/\beur\b/g, ' ')
    .replace(/\b4endurance\b/g, ' ')
    .replace(/\bnduranz\b/g, ' ')
    .replace(/\bpro\b/g, ' ')
    .replace(/\bformula\b/g, ' ')
    .replace(/\brecovery\b/g, ' ')
    .replace(/\bwhey\b/g, ' ')
    .replace(/\bprotein\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(s) {
  const n = normalize(s);
  if (!n) return new Set();
  return new Set(n.split(' ').filter(Boolean));
}

function jaccard(a, b) {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${BASE}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'ori369-product-discovery/1.0',
        accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const data = await res.json();
    const products = data && data.products ? data.products : [];
    if (!products.length) break;
    all.push(...products);
    if (products.length < 250) break;
    page++;
    if (page > 20) break;
  }
  return all;
}

function bestMatch(manifestItem, products) {
  const target = manifestItem.name;
  let best = null;
  let bestScore = 0;
  let secondScore = 0;

  for (const p of products) {
    const title = p.title || '';
    const score = jaccard(target, title);
    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      best = p;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  // Require a clear winner
  const uniqueGap = bestScore - secondScore;
  const ok = best && bestScore >= 0.72 && uniqueGap >= 0.08;
  return ok ? { product: best, score: bestScore, gap: uniqueGap } : null;
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) throw new Error('Manifest must be a JSON array');

  console.log('Fetching 4endurance.com product catalog...');
  const products = await fetchAllProducts();
  console.log(`Catalog size: ${products.length}`);

  let matched = 0;
  let skipped = 0;

  for (const item of manifest) {
    if (!item || item.source_url) {
      skipped++;
      continue;
    }

    const match = bestMatch(item, products);
    if (!match) continue;

    const handle = match.product.handle;
    if (!handle) continue;

    item.source_url = `${BASE}/products/${handle}`;
    item.discovery = {
      method: 'shopify-products-json',
      matched_title: match.product.title,
      score: match.score,
      gap: match.gap,
    };
    matched++;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log('Done.');
  console.log({ matched, skipped_already_had_url: skipped, manifest: path.relative(process.cwd(), MANIFEST_PATH) });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
