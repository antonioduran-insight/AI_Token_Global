// upload-seo-insights.mjs — mirrors the latest SEO snapshots into Sanity as
// `seoInsights` documents, one singleton per source (seoInsights-gsc / -ga4 /
// -cloudflare), so pipeline agents can read the SEO numbers from the CMS instead
// of parsing the raw JSON under studio/seo-data/. Run from studio/ after the
// fetch-*.mjs scripts have written fresh snapshots:
//   node scripts/upload-seo-insights.mjs           # build + upload
//   node scripts/upload-seo-insights.mjs --dry-run # build + print, no upload
//
// Auth: uses the Sanity CLI (`sanity dataset import --replace`). Locally this
// uses your logged-in CLI session; in CI it uses the SANITY_AUTH_TOKEN env var
// (the token must have write/Editor access to the dataset).

import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const STUDIO = resolve(HERE, '..');
const DATA = resolve(STUDIO, 'seo-data');
const DATASET = 'production';
const DRY_RUN = process.argv.includes('--dry-run');

// ── helpers ────────────────────────────────────────────────────────────────
const num = (n) => Number(n ?? 0).toLocaleString('en-US');
const pct = (f) => `${(Number(f ?? 0) * 100).toFixed(2)}%`;
const secs = (s) => `${Math.round(Number(s ?? 0))}s`;
const ms = (n) => `${Math.round(Number(n ?? 0))} ms`;

/** % change of current vs previous, as a signed string. */
function change(cur, prev) {
    if (!prev) return cur ? 'new' : '—';
    const rel = ((cur - prev) / prev) * 100;
    return `${rel >= 0 ? '+' : ''}${rel.toFixed(1)}%`;
}

/** Most-recent snapshot (by YYYY-MM-DD filename) matching a prefix, or null. */
async function newest(subdir, prefix) {
    const dir = join(DATA, subdir);
    let files;
    try {
          files = (await readdir(dir)).filter((f) => f.startsWith(prefix) && f.endsWith('.json')).sort();
    } catch {
          return null;
    }
    if (!files.length) return null;
    return JSON.parse(await readFile(join(dir, files.at(-1)), 'utf8'));
}

const keyed = (rows) => rows.map((r, i) => ({ _key: `i${i}`, ...r }));

// ── per-source document builders ─────────────────────────────────────────────
async function buildGsc() {
    const ov = await newest('gsc', 'overview-');
    if (!ov) return null;
    const pages = await newest('gsc', 'pages-');
    const c = ov.current, p = ov.previous;
    // Support both top-level fields (new fetch-gsc.mjs) and legacy ov.meta.*
  const meta = ov.meta ?? ov;
    const top = (pages?.rows ?? []).slice(0, 5).map((r) => ({ label: r.page, value: `${num(r.clicks)} clicks` }));
    return {
          _id: 'seoInsights-gsc',
          _type: 'seoInsights',
          title: 'Search Console — last ' + meta.rangeDays + ' days',
          source: 'gsc',
          siteUrl: meta.siteUrl,
          snapshotDate: meta.snapshotDate,
          rangeDays: meta.rangeDays,
          summary:
                  `Google Search Console, last ${meta.rangeDays} days for ${meta.siteUrl}: ` +
                  `${num(c.clicks)} clicks (${change(c.clicks, p.clicks)} vs prior window), ` +
                  `${num(c.impressions)} impressions (${change(c.impressions, p.impressions)}), ` +
                  `${pct(c.ctr)} CTR, average position ${c.avgPosition.toFixed(1)} (lower is better).`,
          metrics: keyed([
            { label: 'Clicks', value: num(c.clicks), change: change(c.clicks, p.clicks) },
            { label: 'Impressions', value: num(c.impressions), change: change(c.impressions, p.impressions) },
            { label: 'CTR', value: pct(c.ctr), change: change(c.ctr, p.ctr) },
            { label: 'Avg. position', value: c.avgPosition.toFixed(1), change: change(c.avgPosition, p.avgPosition) },
                ]),
          topItems: keyed(top),
    };
}

async function buildGa4() {
    const ov = await newest('ga4', 'ga4-overview-');
    if (!ov) return null;
    const pages = await newest('ga4', 'ga4-pages-');
    const c = ov.current, p = ov.previous;
    const top = (pages?.rows ?? []).slice(0, 5).map((r) => ({ label: r.page, value: `${num(r.views)} views` }));
    return {
          _id: 'seoInsights-ga4',
          _type: 'seoInsights',
          title: 'Analytics 4 — last ' + ov.meta.rangeDays + ' days',
          source: 'ga4',
          siteUrl: ov.meta.siteUrl,
          snapshotDate: ov.meta.snapshotDate,
          rangeDays: ov.meta.rangeDays,
          summary:
                  `Google Analytics 4, last ${ov.meta.rangeDays} days for ${ov.meta.siteUrl}: ` +
                  `${num(c.users)} users (${change(c.users, p.users)} vs prior window), ` +
                  `${num(c.engagedSessions)} engaged sessions, ${pct(c.engagementRate)} engagement rate, ` +
                  `${secs(c.avgEngagementSeconds)} average engagement time.`,
          metrics: keyed([
            { label: 'Users', value: num(c.users), change: change(c.users, p.users) },
            { label: 'Engaged sessions', value: num(c.engagedSessions), change: change(c.engagedSessions, p.engagedSessions) },
            { label: 'Engagement rate', value: pct(c.engagementRate), change: change(c.engagementRate, p.engagementRate) },
            { label: 'Avg. engagement', value: secs(c.avgEngagementSeconds), change: change(c.avgEngagementSeconds, p.avgEngagementSeconds) },
                ]),
          topItems: keyed(top),
    };
}

async function buildCloudflare() {
    const ov = await newest('cloudflare', 'cloudflare-overview-');
    if (!ov) return null;
    const pages = await newest('cloudflare', 'cloudflare-pages-');
    const c = ov.current, p = ov.previous;
    const top = (pages?.rows ?? []).slice(0, 5).map((r) => ({ label: r.page, value: `${num(r.pageViews)} views` }));
    return {
          _id: 'seoInsights-cloudflare',
          _type: 'seoInsights',
          title: 'Cloudflare — last ' + ov.meta.rangeDays + ' days',
          source: 'cloudflare',
          siteUrl: ov.meta.siteUrl,
          snapshotDate: ov.meta.snapshotDate,
          rangeDays: ov.meta.rangeDays,
          summary:
                  `Cloudflare Web Analytics, last ${ov.meta.rangeDays} days for ${ov.meta.siteUrl}: ` +
                  `${num(c.pageViews)} page views (${change(c.pageViews, p.pageViews)} vs prior window), ` +
                  `${num(c.visits)} visits (${change(c.visits, p.visits)}), ` +
                  `${ms(c.medianLoadMs)} median page load.`,
          metrics: keyed([
            { label: 'Page views', value: num(c.pageViews), change: change(c.pageViews, p.pageViews) },
            { label: 'Visits', value: num(c.visits), change: change(c.visits, p.visits) },
            { label: 'Median load', value: ms(c.medianLoadMs), change: change(c.medianLoadMs, p.medianLoadMs) },
                ]),
          topItems: keyed(top),
    };
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
    const docs = (await Promise.all([buildGsc(), buildGa4(), buildCloudflare()])).filter(Boolean);
    if (!docs.length) {
          console.log('No snapshot data found — nothing to upload.');
          return;
    }

  const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n';
    const tmpFile = resolve(STUDIO, '.seo-insights-upload.ndjson');

  if (DRY_RUN) {
        console.log('--- DRY RUN ---');
        docs.forEach((d) => console.log(JSON.stringify(d, null, 2)));
        return;
  }

  await writeFile(tmpFile, ndjson);
    try {
          execSync(
                  `npx sanity dataset import --replace ${tmpFile} ${DATASET}`,
            { stdio: 'inherit', cwd: STUDIO, env: { ...process.env } },
                );
          console.log(`✓ uploaded ${docs.length} seoInsights doc(s) to Sanity (${DATASET})`);
    } finally {
          await rm(tmpFile, { force: true });
    }
}

main().catch((err) => {
    console.error('upload-seo-insights failed:', err.message);
    process.exit(1);
});
