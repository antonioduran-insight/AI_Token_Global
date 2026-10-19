/**
 * build-index-diet.mjs
 *
 * One table for every URL the site serves or has stopped serving, with the
 * action each one gets: audits/2026-10-19/index-diet.csv.
 *
 * READ-ONLY. It reads dist/, the content corpus, a GSC export and two earlier
 * audit files, and calls `client.fetch` for the non-post CMS documents. It never
 * creates, patches or deletes anything. scripts/patch-interim-noindex.mjs is the
 * only thing that acts on the table, and only on its NOINDEX_INTERIM rows.
 *
 * Usage (run after `npm run build`, so dist/ matches what is live):
 *   node scripts/build-content-corpus.mjs /tmp/corpus.json
 *   node scripts/build-index-diet.mjs --corpus /tmp/corpus.json --gsc <Pages.csv>
 *
 * --gsc is the Pages.csv from a Search Console "Performance → Export" zip with
 * the date filter set to "Last 28 days".
 *
 * ── Actions ──
 *   NOINDEX_INTERIM            es/id post whose body is English, no search traffic
 *   PROTECTED_TRANSLATE_FIRST  same, but clicks > 0 or impressions >= 10 in 28 days
 *   KEEP                       everything else in the sitemap
 *   RETIRED_S8                 unpublished by S8, or already gone when S8 ran
 *   UNPUBLISHED_HYGIENE        duplicate-slug docs unpublished by H1 (#47)
 *
 * ── "Body is English" ──
 * The S9 test (scripts/patch-translate-bodies.mjs): the share of words that are
 * common English stopwords. Spanish and Indonesian bodies score under 1%; English
 * ones 10–37%. Nothing on the site falls between 1% and 10%, so the 10% line is
 * not a judgement call.
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const arg = name => {
  const at = process.argv.indexOf(name);
  return at > 0 ? process.argv[at + 1] : undefined;
};
const CORPUS = arg('--corpus');
const GSC = arg('--gsc');
const OUT = arg('--out') ?? 'audits/2026-10-19/index-diet.csv';
if (!CORPUS || !GSC) {
  console.error('Usage: node scripts/build-index-diet.mjs --corpus <corpus.json> --gsc <Pages.csv> [--out <csv>]');
  process.exit(1);
}

const SITE = 'https://www.aitoken.global';
const SCOPE_LOCALES = new Set(['es', 'id']);
const EN_THRESHOLD = 0.10;
const PROTECT = { clicks: 1, impressions: 10 };

// ── Helpers ───────────────────────────────────────────────────────────────
function fromDotEnv(key) {
  if (!existsSync('.env')) return undefined;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    if (line.startsWith('#') || !line.includes('=')) continue;
    const at = line.indexOf('=');
    if (line.slice(0, at).trim() === key) return line.slice(at + 1).trim().replace(/^["']|["']$/g, '');
  }
  return undefined;
}

const EN_STOP = /\b(the|and|with|that|this|for|are|is|of|to|you|your|it|in|on|be|as|by|or|an|can|will|from|they|when|which)\b/gi;
const wordCount = t => (t.match(/[\p{L}\p{N}]+/gu) ?? []).length;
const enShare = t => (t.match(EN_STOP) ?? []).length / Math.max(1, wordCount(t));
const bodyLanguage = (text, locale) => (enShare(text) >= EN_THRESHOLD ? 'en' : locale);

/** Site-relative path with a trailing slash; folds apex, http and no-slash variants. */
function normPath(url) {
  let path;
  try { path = decodeURI(new URL(url, SITE).pathname); } catch { return null; }
  return path.endsWith('/') ? path : `${path}/`;
}
const localeOf = path => path.split('/')[1] ?? '';

/** Minimal RFC 4180 reader — the triage CSV has quoted commas in its reasons. */
function readCsv(file) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const text = readFileSync(file, 'utf8').replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const csvCell = v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Visible text of a built page: <main> minus scripts, styles, nav and footer. */
function pageText(path) {
  const file = join('dist', path, 'index.html');
  if (!existsSync(file)) return null;
  let html = readFileSync(file, 'utf8');
  html = html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? html;
  return html
    .replace(/<(script|style|nav|footer)[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ');
}

// ── Inputs ────────────────────────────────────────────────────────────────
const sitemapXml = readFileSync('dist/sitemap-0.xml', 'utf8');
const livePaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => normPath(m[1]));

const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'));
const postByPath = new Map(corpus.posts.map(p => [`/${p.language}/blog/${p.slug}/`, p]));

const gsc = new Map();
for (const row of readCsv(GSC)) {
  const url = row['Top pages'] ?? row.Page ?? row.url;
  const path = url && normPath(url);
  if (!path) continue;
  const prev = gsc.get(path) ?? { clicks: 0, impressions: 0 };
  gsc.set(path, {
    clicks: prev.clicks + Number(row.Clicks ?? 0),
    impressions: prev.impressions + Number(row.Impressions ?? 0),
  });
}

const triage = readCsv('audits/2026-10-13/not-indexed-triage.csv');
const hygiene = JSON.parse(readFileSync('audits/2026-10-16/hygiene-plan.json', 'utf8'));

// Non-post CMS documents, so page rows carry the _id that renders them.
const projectId = process.env.PUBLIC_SANITY_PROJECT_ID ?? fromDotEnv('PUBLIC_SANITY_PROJECT_ID');
const client = createClient({
  projectId,
  dataset: process.env.PUBLIC_SANITY_DATASET ?? fromDotEnv('PUBLIC_SANITY_DATASET') ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});
const DOC_ROUTE = {
  homePage: () => '/',
  aiTrendsPage: () => '/ai-trends/',
  apiComparePage: () => '/api-compare/',
  beginnersGuidePage: () => '/beginners-guide/',
  compliancePage: () => '/compliance/',
  tokenCalculatorPage: () => '/token-calculator/',
  useCasesPage: () => '/use-cases/',
  userGuidePage: () => '/user-guide/',
  apiModelPage: d => (d.modelSlug ? `/${d.modelSlug}-api/` : null),
  legalPage: d => (d.docType ? `/${d.docType}/` : null),
};
const cmsDocs = await client.fetch(
  `*[_type in $types && !(_id in path("drafts.**"))]{ _id, _type, language, modelSlug, docType }`,
  { types: Object.keys(DOC_ROUTE) },
);
const cmsByPath = new Map();
for (const d of cmsDocs) {
  const route = DOC_ROUTE[d._type]?.(d);
  if (route && d.language) cmsByPath.set(`/${d.language}${route}`, d);
}

// ── Rows ──────────────────────────────────────────────────────────────────
const rows = [];

for (const path of livePaths) {
  const locale = localeOf(path);
  const traffic = gsc.get(path) ?? { clicks: 0, impressions: 0 };
  const post = postByPath.get(path);
  const row = {
    url: SITE + path, locale, doc_type: '', doc_id: '', words: '', body_language: '',
    gsc_clicks_28d: traffic.clicks, gsc_impr_28d: traffic.impressions, action: 'KEEP', reason: '',
  };

  if (post) {
    row.doc_type = 'post';
    row.doc_id = post._id;
    row.words = post.wordCount ?? wordCount(post.plainText);
    row.body_language = bodyLanguage(post.plainText, locale);
  } else {
    const text = pageText(path) ?? '';
    const doc = cmsByPath.get(path);
    const legalFallback = !doc && /^\/[a-z]{2}\/(privacy|terms)\/$/.test(path);
    const enDoc = legalFallback ? cmsByPath.get(path.replace(/^\/[a-z]{2}/, '/en')) : null;
    row.doc_type = doc?._type ?? enDoc?._type ?? (path.endsWith('/blog/') ? 'blogIndex' : 'page');
    row.doc_id = doc?._id ?? enDoc?._id ?? '';
    row.words = wordCount(text);
    row.body_language = bodyLanguage(text, locale);
    if (legalFallback) {
      row.reason = 'renders the English legalPage (no locale doc); its seo.noindex would also hit /en/ — needs a code-side noindex for fallbacks';
    }
  }

  if (SCOPE_LOCALES.has(locale) && row.doc_type === 'post' && row.body_language === 'en') {
    const earns = traffic.clicks >= PROTECT.clicks || traffic.impressions >= PROTECT.impressions;
    row.action = earns ? 'PROTECTED_TRANSLATE_FIRST' : 'NOINDEX_INTERIM';
    row.reason = earns
      ? `English body, but ${traffic.clicks} click(s) / ${traffic.impressions} impression(s) in 28 days — translate, do not noindex`
      : 'English body on an es/id URL, no search traffic in 28 days';
  }
  rows.push(row);
}

const live = new Set(livePaths);
const triageReason = {
  RETIRE: 'S8 retire (13 Oct): crawled, not indexed, no traffic',
  MERGE: 'S8 retire (13 Oct): near-duplicate, unpublished without redirect',
  'ALREADY RETIRED': 'already unpublished when S8 ran (S7e per-token, 13 Oct)',
};
for (const t of triage) {
  if (!triageReason[t.action]) continue;
  const path = normPath(t.url);
  rows.push({
    url: SITE + path, locale: t.locale, doc_type: t.type || 'post', doc_id: t._id, words: t.word_count,
    body_language: '', gsc_clicks_28d: gsc.get(path)?.clicks ?? 0, gsc_impr_28d: gsc.get(path)?.impressions ?? 0,
    action: 'RETIRED_S8',
    reason: triageReason[t.action] + (live.has(path) ? ' — WARNING: URL is back in the sitemap' : ''),
  });
}
for (const h of hygiene.unpublish) {
  const path = `/${h.locale}/blog/${h.slug}/`;
  rows.push({
    url: SITE + path, locale: h.locale, doc_type: 'post', doc_id: h._id, words: '', body_language: '',
    gsc_clicks_28d: '', gsc_impr_28d: '', action: 'UNPUBLISHED_HYGIENE',
    reason: `H1 (19 Oct): duplicate slug, moved to draft; URL still served by ${h.sharesUrlWith.filter(id => !hygiene.unpublish.some(u => u._id === id)).join(', ')}`,
  });
}

// ── Output ────────────────────────────────────────────────────────────────
const COLS = ['url', 'locale', 'doc_type', 'doc_id', 'words', 'body_language', 'gsc_clicks_28d', 'gsc_impr_28d', 'action', 'reason'];
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, [COLS.join(','), ...rows.map(r => COLS.map(c => csvCell(r[c])).join(','))].join('\n') + '\n');

const ACTIONS = ['KEEP', 'NOINDEX_INTERIM', 'PROTECTED_TRANSLATE_FIRST', 'RETIRED_S8', 'UNPUBLISHED_HYGIENE'];
const LOCALES = ['en', 'es', 'id', 'vi'];
const pad = (s, n) => String(s).padEnd(n);
console.log(`${OUT}: ${rows.length} rows (${livePaths.length} sitemap URLs)\n`);
console.log(pad('action', 28) + LOCALES.map(l => pad(l, 6)).join('') + 'total');
for (const a of ACTIONS) {
  const of = rows.filter(r => r.action === a);
  console.log(pad(a, 28) + LOCALES.map(l => pad(of.filter(r => r.locale === l).length, 6)).join('') + of.length);
}
const enBodies = rows.filter(r => r.doc_type === 'post' && r.body_language === 'en' && live.has(normPath(r.url)));
console.log(`\nEnglish-body posts by locale: ${LOCALES.map(l => `${l} ${enBodies.filter(r => r.locale === l).length}`).join(' · ')}`);
const unmapped = rows.filter(r => live.has(normPath(r.url)) && !r.doc_id && r.doc_type !== 'blogIndex' && r.doc_type !== 'page');
if (unmapped.length) console.log(`Live rows with no doc_id: ${unmapped.map(r => r.url).join(', ')}`);
