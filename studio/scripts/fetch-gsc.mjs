// fetch-gsc.mjs — pulls Google Search Console data via the Search Console API and
// writes the gsc/*.json snapshots the dashboard reads. Auth: service account
// (aitokenglobal-data-reader) added as a Full user on the GSC property.
// Run from studio/: node scripts/fetch-gsc.mjs

import 'dotenv/config';
import { google } from 'googleapis';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, '../seo-data/gsc');
const RANGE_DAYS = 30;
const SITE_URL_META = 'aitoken.global';
const LOCALES = new Set(['en', 'es', 'id']);
const LOCALE_LABEL = { en: 'English', es: 'Español', id: 'Indonesia' };

const SITE = process.env.GSC_SITE_URL; // sc-domain:aitoken.global
const KEYFILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE;

if (!SITE) {
    console.error('Missing GSC_SITE_URL in studio/.env (expected sc-domain:aitoken.global)');
    process.exit(1);
}
if (!KEYFILE) {
    console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEYFILE in studio/.env');
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    keyFile: resolve(HERE, '..', KEYFILE),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

const day = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
const CURRENT = { startDate: day(30), endDate: day(1) };
const PREVIOUS = { startDate: day(60), endDate: day(31) };
const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);
const META = { siteUrl: SITE_URL_META, snapshotDate: SNAPSHOT_DATE, rangeDays: RANGE_DAYS, dataSource: 'gsc' };

let webmasters;
async function query(body) {
    const res = await webmasters.searchanalytics.query({ siteUrl: SITE, requestBody: body });
    return res.data.rows ?? [];
}

function pathOf(url) {
    try { return new URL(url).pathname; } catch { return url; }
}
function localeOf(path) {
    const seg = (path || '').split('/').filter(Boolean)[0];
    return LOCALES.has(seg) ? seg : null;
}
async function write(section, payload) {
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(resolve(OUT_DIR, `${section}-${SNAPSHOT_DATE}.json`), JSON.stringify(payload, null, 2) + '\n');
    console.log(`✓ wrote ${section}-${SNAPSHOT_DATE}.json`);
}

async function bucket(range) {
    const r = (await query({ startDate: range.startDate, endDate: range.endDate }))[0];
    return { clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0, ctr: r?.ctr ?? 0, avgPosition: r?.position ?? 0 };
}

async function buildQueries() {
    const rows = await query({ startDate: CURRENT.startDate, endDate: CURRENT.endDate, dimensions: ['query', 'page'], rowLimit: 5000 });
    const byQuery = new Map();
    for (const r of rows) {
          const q = r.keys[0];
          const loc = localeOf(pathOf(r.keys[1]));
          if (!loc) continue;
          const a = byQuery.get(q) ?? { query: q, clicks: 0, impressions: 0, posW: 0, byLocale: {} };
          a.clicks += r.clicks;
          a.impressions += r.impressions;
          a.posW += r.position * r.impressions;
          a.byLocale[loc] = (a.byLocale[loc] ?? 0) + r.clicks;
          byQuery.set(q, a);
    }
    return [...byQuery.values()]
      .map((a) => ({
              query: a.query,
              locale: Object.entries(a.byLocale).sort((x, y) => y[1] - x[1])[0]?.[0] ?? 'en',
              clicks: a.clicks,
              impressions: a.impressions,
              ctr: a.impressions ? a.clicks / a.impressions : 0,
              position: a.impressions ? a.posW / a.impressions : 0,
      }))
      .sort((a, b) => b.impressions - a.impressions);
}

async function buildPages() {
    const rows = await query({ startDate: CURRENT.startDate, endDate: CURRENT.endDate, dimensions: ['page'], rowLimit: 1000 });
    return rows
      .map((r) => ({
              page: pathOf(r.keys[0]),
              locale: localeOf(pathOf(r.keys[0])) ?? 'en',
              clicks: r.clicks,
              impressions: r.impressions,
              ctr: r.ctr,
              position: r.position,
      }))
      .sort((a, b) => b.impressions - a.impressions);
}

async function buildLocales() {
    const rows = await query({ startDate: CURRENT.startDate, endDate: CURRENT.endDate, dimensions: ['page'], rowLimit: 5000 });
    const byLocale = {};
    for (const r of rows) {
          const loc = localeOf(pathOf(r.keys[0]));
          if (!loc) continue;
          const a = byLocale[loc] ?? { locale: loc, label: LOCALE_LABEL[loc], clicks: 0, impressions: 0, posW: 0 };
          a.clicks += r.clicks;
          a.impressions += r.impressions;
          a.posW += r.position * r.impressions;
          byLocale[loc] = a;
    }
    return Object.values(byLocale).map((a) => ({
          locale: a.locale,
          label: a.label,
          clicks: a.clicks,
          impressions: a.impressions,
          ctr: a.impressions ? a.clicks / a.impressions : 0,
          avgPosition: a.impressions ? a.posW / a.impressions : 0,
    }));
}

async function main() {
    webmasters = google.webmasters({ version: 'v3', auth: await auth.getClient() });

  const [cur, prev] = await Promise.all([bucket(CURRENT), bucket(PREVIOUS)]);
    await write('overview', { ...META, current: cur, previous: prev });

  const queries = await buildQueries();
    const striking = queries.filter((q) => q.position >= 4 && q.position <= 20 && q.impressions >= 50);
    const ctrOutliers = queries.filter((q) => q.impressions >= 100 && q.ctr < 0.02);
    await write('queries', { ...META, rows: queries, strikingDistance: striking, ctrOutliers });

  const pages = await buildPages();
    await write('pages', { ...META, rows: pages });

  const locales = await buildLocales();
    await write('locales', { ...META, rows: locales });

  console.log(`GSC fetch → ${SITE}, window ${RANGE_DAYS}d, date ${SNAPSHOT_DATE}`);
}

main().catch((err) => {
    console.error('GSC fetch failed: ***');
    console.error(err);
    console.error('***');
    process.exit(1);
});
