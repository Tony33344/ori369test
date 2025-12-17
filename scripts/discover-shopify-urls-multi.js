const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'assets', 'shop-products', 'products.json');

const BASES = [
  'https://4endurance.com',
  'https://nduranz.com',
];

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

function jaccard(aTokens, bTokens) {
  if (!aTokens.size || !bTokens.size) return 0;
  let inter = 0;
  for (const t of aTokens) if (bTokens.has(t)) inter++;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union ? inter / union : 0;
}

async function fetchCatalog(base) {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${base}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'ori369-product-discovery/1.0',
        accept: 'application/json',
      },
    });
    if (!res.ok) break;
    const data = await res.json();
    const products = data && data.products ? data.products : [];
    if (!products.length) break;
    all.push(...products);
    if (products.length < 250) break;
    page++;
    if (page > 30) break;
  }
  return all;
}

function bestMatch(itemName, products) {
  const target = tokenSet(itemName);

  let best = null;
  let bestScore = 0;
  let second = 0;

  for (const p of products) {
    const title = p?.title || '';
    const score = jaccard(target, tokenSet(title));
    if (score > bestScore) {
      second = bestScore;
      bestScore = score;
      best = p;
    } else if (score > second) {
      second = score;
    }
  }

  const gap = bestScore - second;
  const ok = best && bestScore >= 0.58 && gap >= 0.05;
  return ok ? { best, bestScore, gap } : null;
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) throw new Error('Manifest must be an array');

  const catalogs = {};
  for (const base of BASES) {
    console.log(`Fetching catalog: ${base}`);
    const prods = await fetchCatalog(base);
    catalogs[base] = prods;
    console.log(`- ${base} catalog size: ${prods.length}`);
  }

  let matched = 0;
  let already = 0;
  let noMatch = 0;

  for (const item of manifest) {
    if (!item) continue;
    if (item.source_url) {
      already++;
      continue;
    }

    let chosen = null;
    let chosenBase = null;

    for (const base of BASES) {
      const prods = catalogs[base] || [];
      const m = bestMatch(item.name, prods);
      if (!m) continue;

      if (!chosen || m.bestScore > chosen.bestScore) {
        chosen = m;
        chosenBase = base;
      }
    }

    if (!chosen || !chosenBase) {
      noMatch++;
      continue;
    }

    const handle = chosen.best?.handle;
    if (!handle) {
      noMatch++;
      continue;
    }

    item.source_url = `${chosenBase}/products/${handle}`;
    item.discovery = {
      method: 'shopify-products-json-multi',
      base: chosenBase,
      matched_title: chosen.best?.title || null,
      score: chosen.bestScore,
      gap: chosen.gap,
    };

    matched++;
    console.log(`Matched: ${item.slug} -> ${item.source_url}`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Done.');
  console.log({ matched, already_had_url: already, no_match: noMatch, manifest: path.relative(process.cwd(), MANIFEST_PATH) });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
