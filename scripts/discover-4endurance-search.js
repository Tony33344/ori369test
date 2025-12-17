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
    .replace(/\bwith\b/g, ' ')
    .replace(/\bmg\b/g, ' ')
    .replace(/\bg\b/g, ' ')
    .replace(/\bml\b/g, ' ')
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

function jaccardTokens(aTokens, bTokens) {
  if (!aTokens.size || !bTokens.size) return 0;
  let inter = 0;
  for (const t of aTokens) if (bTokens.has(t)) inter++;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union ? inter / union : 0;
}

async function suggestProducts(query) {
  const u = new URL(`${BASE}/search/suggest.json`);
  u.searchParams.set('q', query);
  u.searchParams.set('resources[type]', 'product');
  u.searchParams.set('resources[limit]', '10');
  u.searchParams.set('resources[options][unavailable_products]', 'last');
  u.searchParams.set('resources[options][fields]', 'title,product_type,variants.title,variants.sku');

  const res = await fetch(u.toString(), {
    redirect: 'follow',
    headers: {
      'user-agent': 'ori369-product-discovery/1.0',
      accept: 'application/json',
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  const products = data?.resources?.results?.products;
  return Array.isArray(products) ? products : [];
}

function bestMatch(name, candidates) {
  const targetTokens = tokenSet(name);

  let best = null;
  let bestScore = 0;
  let second = 0;

  for (const c of candidates) {
    const title = c?.title || '';
    const score = jaccardTokens(targetTokens, tokenSet(title));
    if (score > bestScore) {
      second = bestScore;
      bestScore = score;
      best = c;
    } else if (score > second) {
      second = score;
    }
  }

  const gap = bestScore - second;
  const ok = best && bestScore >= 0.62 && gap >= 0.06;
  return ok ? { best, bestScore, gap } : null;
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) throw new Error('Manifest must be an array');

  let updated = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const item of manifest) {
    if (!item || item.source_url) {
      skipped++;
      continue;
    }

    const q = item.name;
    const candidates = await suggestProducts(q);
    const match = bestMatch(q, candidates);

    if (!match) {
      noMatch++;
      continue;
    }

    const handle = match.best?.handle;
    if (!handle) {
      noMatch++;
      continue;
    }

    item.source_url = `${BASE}/products/${handle}`;
    item.discovery = {
      method: 'shopify-search-suggest',
      matched_title: match.best?.title || null,
      score: match.bestScore,
      gap: match.gap,
    };

    updated++;
    console.log(`Matched: ${item.slug} -> ${handle} (score=${match.bestScore.toFixed(2)})`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Done.');
  console.log({ updated, skipped_already_had_url: skipped, no_match: noMatch });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
