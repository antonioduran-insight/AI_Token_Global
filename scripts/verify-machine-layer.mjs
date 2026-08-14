/**
 * Verifies the machine-readable layer of the built site: hreflang targets that
 * actually exist, internal links that carry a trailing slash, JSON-LD that parses
 * and contains no empty or placeholder values, dates that agree between the page
 * and its structured data, and a sitemap where every entry has a lastmod.
 *
 * Reads dist/ only — no network, no browser. Run after `npm run build`:
 *
 *   node scripts/verify-machine-layer.mjs
 *
 * Exits non-zero if any check fails, so it can gate a deploy.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';

const DIST = join(process.cwd(), 'dist');
const ORIGIN = 'https://www.aitoken.global';

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

// ── Collect the built pages ───────────────────────────────────────────────
function htmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(path, out);
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

const pages = htmlFiles(DIST).map(file => ({
  file,
  rel: relative(DIST, file),
  $: cheerio.load(readFileSync(file, 'utf8')),
}));

/** Does a site path resolve to a file the build actually produced? */
function resolves(pathname) {
  const clean = pathname.split(/[?#]/)[0];
  const candidates = clean.endsWith('/')
    ? [join(DIST, clean, 'index.html')]
    : [join(DIST, clean), join(DIST, `${clean}.html`), join(DIST, clean, 'index.html')];
  return candidates.some(c => existsSync(c) && statSync(c).isFile());
}

const failures = [];
const note = (label, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

console.log(`\nBuilt pages: ${pages.length}\n`);

// ── 1. Every hreflang target exists ───────────────────────────────────────
console.log('hreflang');
let hreflangTotal = 0;
let hreflangResolved = 0;
let xDefaultTotal = 0;
const deadTargets = new Map();
const offOrigin = new Set();

for (const { rel, $ } of pages) {
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    const isXDefault = $(el).attr('hreflang') === 'x-default';
    if (isXDefault) xDefaultTotal++;
    else hreflangTotal++;
    let url;
    try {
      url = new URL(href);
    } catch {
      deadTargets.set(href, rel);
      return;
    }
    if (url.origin !== ORIGIN) offOrigin.add(href);
    if (resolves(url.pathname)) {
      if (!isXDefault) hreflangResolved++;
    } else {
      deadTargets.set(href, rel);
    }
  });
}

note(
  `${hreflangTotal} hreflang links checked, ${hreflangResolved} resolve to a built page`,
  hreflangTotal === hreflangResolved && deadTargets.size === 0,
  deadTargets.size ? `${deadTargets.size} dead: ${[...deadTargets.keys()].slice(0, 5).join(', ')}` : ''
);
note(`${xDefaultTotal} x-default links, all on ${ORIGIN}`, offOrigin.size === 0,
  offOrigin.size ? [...offOrigin].slice(0, 3).join(', ') : '');

// Cluster sizes: a post translated into four locales advertises four alternates,
// a post that exists only in English advertises one.
const postPages = pages.filter(p => /(^|\/)[a-z]{2}\/blog\/[^/]+\/index\.html$/.test(p.rel));
const byCount = new Map();
for (const { rel, $ } of postPages) {
  const n = $('link[rel="alternate"][hreflang]').not('[hreflang="x-default"]').length;
  if (!byCount.has(n)) byCount.set(n, []);
  byCount.get(n).push(rel);
}
for (const [n, list] of [...byCount].sort((a, b) => a[0] - b[0])) {
  console.log(`       ${list.length} post(s) with ${n} alternate(s)`);
}
note('≥3 posts carry 4 alternates', (byCount.get(4)?.length ?? 0) >= 3,
  (byCount.get(4) ?? []).slice(0, 3).join(', '));
note('≥3 posts carry 1 alternate', (byCount.get(1)?.length ?? 0) >= 3,
  (byCount.get(1) ?? []).slice(0, 3).join(', '));
note('no post carries 0 alternates', !byCount.has(0), (byCount.get(0) ?? []).slice(0, 3).join(', '));

// ── 2. Internal links carry a trailing slash ───────────────────────────────
console.log('\ntrailing slashes');
const HAS_EXTENSION = /\/[^/]*\.[a-z0-9]+$/i;
let internalHrefs = 0;
const slashless = new Map();

for (const { rel, $ } of pages) {
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (!href.startsWith('/') || href.startsWith('//')) return;
    const path = href.split(/[?#]/)[0];
    if (!path) return; // pure fragment or query
    internalHrefs++;
    if (!path.endsWith('/') && !HAS_EXTENSION.test(path)) slashless.set(href, rel);
  });
}
note(`${internalHrefs} internal links, ${slashless.size} missing a trailing slash`, slashless.size === 0,
  slashless.size ? [...slashless].slice(0, 5).map(([h, r]) => `${h} (${r})`).join(', ') : '');

const brokenInternal = new Map();
for (const { rel, $ } of pages) {
  $('a[href^="/"]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (href.startsWith('//')) return;
    const path = href.split(/[?#]/)[0];
    if (path && !resolves(path)) brokenInternal.set(href, rel);
  });
}
note('every internal link resolves to a built file', brokenInternal.size === 0,
  brokenInternal.size ? [...brokenInternal].slice(0, 5).map(([h, r]) => `${h} (${r})`).join(', ') : '');

// ── 3. JSON-LD parses and carries no empty or placeholder values ───────────
console.log('\nJSON-LD');
// Deliberately narrow, in two parts, because loose patterns kept matching real
// prose: "your-" hit the slug "…-apis-for-your-business", and a case-insensitive
// TODO hit the Spanish word "todo". Scaffolding markers count only in caps.
const PLACEHOLDER_ANY_CASE = /(lorem ipsum|placehold\.co|example\.com|\[object Object\])/i;
const PLACEHOLDER_CAPS = /\b(TODO|TBD|FIXME|XXX|undefined|null)\b/;
const isPlaceholder = value => PLACEHOLDER_ANY_CASE.test(value) || PLACEHOLDER_CAPS.test(value);
let blocks = 0;
const badJson = [];
const emptyValues = [];
const placeholders = [];
const typeCounts = new Map();

function inspect(value, path, rel) {
  if (value === null || value === undefined) { emptyValues.push(`${rel} ${path} = ${value}`); return; }
  if (typeof value === 'string') {
    if (value.trim() === '') emptyValues.push(`${rel} ${path} = ""`);
    else if (isPlaceholder(value)) placeholders.push(`${rel} ${path} = ${value.slice(0, 60)}`);
    return;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) emptyValues.push(`${rel} ${path} = []`);
    value.forEach((item, i) => inspect(item, `${path}[${i}]`, rel));
    return;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) emptyValues.push(`${rel} ${path} = {}`);
    for (const key of keys) inspect(value[key], `${path}.${key}`, rel);
  }
}

const orgPages = new Set();
for (const { rel, $ } of pages) {
  $('script[type="application/ld+json"]').each((_, el) => {
    blocks++;
    const raw = $(el).html() ?? '';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      badJson.push(`${rel}: ${error.message}`);
      return;
    }
    const type = parsed['@type'];
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    if (type === 'Organization') orgPages.add(rel);
    inspect(parsed, type ?? '?', rel);
  });
}
for (const [type, n] of [...typeCounts].sort((a, b) => b[1] - a[1])) {
  console.log(`       ${n} × ${type}`);
}
note(`${blocks} JSON-LD blocks all parse`, badJson.length === 0, badJson.slice(0, 3).join(' | '));
note('no empty, null or blank values', emptyValues.length === 0, emptyValues.slice(0, 5).join(' | '));
note('no placeholder values', placeholders.length === 0, placeholders.slice(0, 5).join(' | '));
// dist/index.html is the locale-less root: a meta-refresh stub to /en/ that does
// not render through BaseLayout, so it carries no Organization block by design.
const layoutPages = pages.filter(p => p.rel !== 'index.html');
const missingOrg = layoutPages.filter(p => !orgPages.has(p.rel)).map(p => p.rel);
note(`Organization on all ${layoutPages.length} BaseLayout pages`, missingOrg.length === 0,
  missingOrg.slice(0, 5).join(', '));

// ── 4. Blog post dates agree between JSON-LD and the page ─────────────────
console.log('\ndates');
const dateProblems = [];
for (const { rel, $ } of postPages) {
  let article = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() ?? '');
      if (parsed['@type'] === 'Article') article = parsed;
    } catch { /* reported above */ }
  });
  if (!article) { dateProblems.push(`${rel}: no Article block`); continue; }
  if (!article.datePublished) { dateProblems.push(`${rel}: no datePublished`); continue; }
  if (!article.dateModified) { dateProblems.push(`${rel}: no dateModified`); continue; }

  const stamps = $('time[datetime]').map((_, el) => $(el).attr('datetime')).get();
  if (!stamps.length) { dateProblems.push(`${rel}: no <time datetime>`); continue; }
  const day = article.datePublished.slice(0, 10);
  if (!stamps.some(s => (s ?? '').slice(0, 10) === day)) {
    dateProblems.push(`${rel}: datePublished ${day} matches no <time> (${stamps.slice(0, 3).join(', ')})`);
  }
}
note(`${postPages.length} posts carry datePublished + dateModified and a matching <time>`,
  dateProblems.length === 0, dateProblems.slice(0, 5).join(' | '));

// ── 5. Sitemap ────────────────────────────────────────────────────────────
console.log('\nsitemap');
const chunks = readdirSync(DIST).filter(f => /^sitemap-\d+\.xml$/.test(f));
let locs = 0;
let withLastmod = 0;
const noLastmod = [];
for (const chunk of chunks) {
  const xml = readFileSync(join(DIST, chunk), 'utf8');
  for (const entry of xml.split('<url>').slice(1)) {
    locs++;
    const loc = /<loc>([^<]+)<\/loc>/.exec(entry)?.[1] ?? '?';
    if (/<lastmod>[^<]+<\/lastmod>/.test(entry)) withLastmod++;
    else noLastmod.push(loc);
  }
}
note(`${locs} sitemap entries, ${withLastmod} carry lastmod`, locs > 0 && noLastmod.length === 0,
  noLastmod.slice(0, 5).join(', '));

// ── 6. The 404 page ───────────────────────────────────────────────────────
console.log('\n404');
const notFound = join(DIST, '404.html');
if (!existsSync(notFound)) {
  note('dist/404.html exists', false);
} else {
  const $ = cheerio.load(readFileSync(notFound, 'utf8'));
  note('dist/404.html exists', true);
  note('is noindex', /noindex/i.test($('meta[name="robots"]').attr('content') ?? ''),
    $('meta[name="robots"]').attr('content') ?? 'no robots meta');
  note('has an h1', $('h1').length === 1, `${$('h1').length} h1(s)`);
  note('emits no hreflang', $('link[rel="alternate"][hreflang]').length === 0,
    `${$('link[rel="alternate"][hreflang]').length} found`);
  const dead = $('a[href^="/"]').map((_, el) => $(el).attr('href')).get()
    .filter(href => !href.startsWith('//') && !resolves(href.split(/[?#]/)[0]));
  note('every link resolves', dead.length === 0, dead.slice(0, 5).join(', '));
}

// ── 7. Legal pages have a sidebar ─────────────────────────────────────────
console.log('\nlegal sidebar');
for (const doc of ['privacy', 'terms']) {
  for (const lang of ['en', 'es', 'id', 'vi']) {
    const file = join(DIST, lang, doc, 'index.html');
    if (!existsSync(file)) { note(`/${lang}/${doc}/ built`, false); continue; }
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    const links = $('nav[id="legal-toc"] a').length;
    const cards = $('aside[class*="legal-sidebar"]').length;
    const anchorsResolve = $('nav[id="legal-toc"] a').toArray()
      .every(el => $(`[id="${($(el).attr('href') ?? '').slice(1)}"]`).length === 1);
    note(`/${lang}/${doc}/ sidebar rendered`, cards === 1, `${links} TOC link(s)`);
    if (links) note(`/${lang}/${doc}/ TOC anchors all hit a heading`, anchorsResolve);
  }
}

console.log('');
if (failures.length) {
  console.error(`${failures.length} check(s) failed:\n - ${failures.join('\n - ')}\n`);
  process.exit(1);
}
console.log('All checks passed.\n');
