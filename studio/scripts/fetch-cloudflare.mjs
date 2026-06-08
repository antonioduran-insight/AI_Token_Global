// fetch-cloudflare.mjs — pulls Cloudflare Web Analytics via the GraphQL Analytics
// API and writes the cloudflare-*.json snapshots the dashboard reads. Auth: API
// token (Account Analytics read scope). Run from studio/:
//   node scripts/fetch-cloudflare.mjs
//
// Verified against the live API. The RUM pageload dataset exposes `count` (page
// views), `sum.visits`, and dimensions requestPath / refererHost / countryName.
// Median page-load time comes from the SEPARATE RUM performance dataset
// (rumPerformanceEventsAdaptiveGroups → quantiles.pageLoadTimeP50, in ms). The
// dashboard shows an empty-state when there's no data — no mock fallback.

import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, '../seo-data/cloudflare');
const RANGE_DAYS = 30;
const SITE_URL = 'aitoken.global';
const LOCALES = new Set(['en', 'es', 'id']);

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const SITE_TAG = process.env.CLOUDFLARE_SITE_TAG; // = the public beacon token
if (!TOKEN || !ACCOUNT || !SITE_TAG) {
  console.error('Missing CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, or CLOUDFLARE_SITE_TAG in studio/.env');
  process.exit(1);
}

const GQL_URL = 'https://api.cloudflare.com/client/v4/graphql';
const day = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
const CURRENT = { start: day(30), end: day(0) }; // include today (fresh beacon data lands today)
const PREVIOUS = { start: day(60), end: day(31) };
const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);
const META = { siteUrl: SITE_URL, snapshotDate: SNAPSHOT_DATE, rangeDays: RANGE_DAYS, dataSource: 'cloudflare' };

const FILTER = '{ siteTag: $siteTag, date_geq: $start, date_leq: $end }';

function localeOf(path) {
  const seg = (path || '').split('/').filter(Boolean)[0];
  return LOCALES.has(seg) ? seg : null;
}

async function gql(selection, range, limit = 5000) {
  const query = `query($account:String!,$siteTag:String!,$start:Date!,$end:Date!){
    viewer { accounts(filter:{ accountTag:$account }) {
      rumPageloadEventsAdaptiveGroups(filter:${FILTER}, limit:${limit}) {
        count
        sum { visits }
        ${selection}
      }
    }}
  }`;
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { account: ACCOUNT, siteTag: SITE_TAG, start: range.start, end: range.end } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error('Cloudflare GraphQL errors:\n' + JSON.stringify(json.errors, null, 2));
  return json.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups ?? [];
}

async function write(section, payload) {
  await mkdir(OUT_DIR, { recursive: true });
  const file = resolve(OUT_DIR, `cloudflare-${section}-${SNAPSHOT_DATE}.json`);
  await writeFile(file, JSON.stringify(payload, null, 2) + '\n');
  console.log(`✓ wrote ${file}`);
}

// Median page-load time lives in the SEPARATE RUM performance dataset (not the
// pageload dataset above). pageLoadTimeP50 is the p50 (median) full page-load
// time — Cloudflare reports RUM timings in MICROSECONDS, so we divide by 1000
// to get milliseconds. Returns 0 when there are no performance samples.
async function fetchMedianLoadMs(range) {
  const query = `query($account:String!,$siteTag:String!,$start:Date!,$end:Date!){
    viewer { accounts(filter:{ accountTag:$account }) {
      rumPerformanceEventsAdaptiveGroups(filter:${FILTER}, limit:1) {
        quantiles { pageLoadTimeP50 }
      }
    }}
  }`;
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { account: ACCOUNT, siteTag: SITE_TAG, start: range.start, end: range.end } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error('Cloudflare GraphQL errors (performance):\n' + JSON.stringify(json.errors, null, 2));
  const g = json.data?.viewer?.accounts?.[0]?.rumPerformanceEventsAdaptiveGroups?.[0];
  return Math.round((g?.quantiles?.pageLoadTimeP50 ?? 0) / 1000); // µs → ms
}

async function overviewBucket(range) {
  // visits + page views come from the RUM pageload dataset; median load time
  // comes from the separate RUM performance dataset (see fetchMedianLoadMs).
  const g = (await gql('', range, 1))[0];
  return {
    visits: g?.sum?.visits ?? 0,
    pageViews: g?.count ?? 0,
    medianLoadMs: await fetchMedianLoadMs(range),
  };
}

async function overview() {
  await write('overview', { meta: META, current: await overviewBucket(CURRENT), previous: await overviewBucket(PREVIOUS) });
}

async function pages() {
  const g = await gql('dimensions { requestPath }', CURRENT);
  const rows = [];
  for (const x of g) {
    const path = x.dimensions?.requestPath ?? '';
    const locale = localeOf(path);
    if (!locale) continue;
    rows.push({ page: path, locale, visits: x.sum?.visits ?? 0, pageViews: x.count ?? 0 });
  }
  rows.sort((a, b) => b.visits - a.visits);
  await write('pages', { meta: META, rows: rows.slice(0, 50) });
}

async function referrers() {
  const g = await gql('dimensions { refererHost }', CURRENT);
  const rows = g
    .map((x) => ({ referrer: x.dimensions?.refererHost || 'Direct / none', visits: x.sum?.visits ?? 0 }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 25);
  await write('referrers', { meta: META, rows });
}

async function countries() {
  const g = await gql('dimensions { countryName }', CURRENT);
  const rows = g
    .map((x) => ({ country: x.dimensions?.countryName || '(unknown)', visits: x.sum?.visits ?? 0 }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 25);
  await write('countries', { meta: META, rows });
}

async function main() {
  console.log(`Cloudflare fetch → account ${ACCOUNT.slice(0, 6)}…, site ${SITE_TAG.slice(0, 6)}…, window ${RANGE_DAYS}d`);
  await overview();
  await pages();
  await referrers();
  await countries();
  console.log('Done. Rebuild the Studio to see real data.');
}

main().catch((err) => {
  console.error('Cloudflare fetch failed:', err.message);
  process.exit(1);
});
