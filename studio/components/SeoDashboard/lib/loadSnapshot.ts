// Snapshot loader for the SEO dashboard.
//
// Each section reads a dated JSON file from studio/seo-data/<source>/. The loader
// discovers files at build time via Vite's `import.meta.glob` and picks the most
// recent by filename (dates are YYYY-MM-DD, so they sort lexicographically).
//
// There is NO mock fallback. If a section has no real snapshot yet, the loader
// returns an EMPTY snapshot (zeroed buckets / empty rows) and the section renders
// its empty-state. Real snapshots are produced by studio/scripts/fetch-*.mjs and
// committed under seo-data/{gsc,ga4,cloudflare}/.

import type {
  OverviewSnapshot,
  QueriesSnapshot,
  PagesSnapshot,
  StrikingSnapshot,
  LocaleSnapshot,
  CtrOutliersSnapshot,
  Ga4OverviewSnapshot,
  Ga4ChannelsSnapshot,
  Ga4PagesSnapshot,
  Ga4EventsSnapshot,
  Ga4LocaleSnapshot,
  CloudflareOverviewSnapshot,
  CloudflarePagesSnapshot,
  CloudflareReferrersSnapshot,
  CloudflareCountriesSnapshot,
  SnapshotMeta,
  DataSourceKind,
} from './types';

type Loaded<T> = { default: T };

/**
 * Normalise a snapshot so callers can always read `.meta.*`. Most fetch scripts
 * nest meta under `meta`, but some (e.g. the service-account fetch-gsc) write the
 * meta fields at the top level. Without this, components doing `data.meta.rangeDays`
 * crash on the top-level shape.
 */
function withMeta<T>(snap: unknown): T | null {
  if (!snap || typeof snap !== 'object') return null;
  const s = snap as Record<string, unknown>;
  if (s.meta) return snap as T;
  if (s.siteUrl !== undefined || s.rangeDays !== undefined || s.dataSource !== undefined) {
    const { siteUrl, snapshotDate, rangeDays, dataSource, ...rest } = s;
    return { meta: { siteUrl, snapshotDate, rangeDays, dataSource }, ...rest } as T;
  }
  return snap as T;
}

/** Most recent file (by filename date) from a glob result, or null if none. */
function newest<T>(modules: Record<string, Loaded<T>>): T | null {
  const entries = Object.entries(modules).sort(([a], [b]) => b.localeCompare(a));
  return entries.length > 0 ? withMeta<T>(entries[0][1].default) : null;
}

const RANGE_DAYS = 30;
function emptyMeta(dataSource: DataSourceKind): SnapshotMeta {
  return { siteUrl: 'aitoken.global', snapshotDate: '', rangeDays: RANGE_DAYS, dataSource };
}
const EMPTY_GSC = { clicks: 0, impressions: 0, ctr: 0, avgPosition: 0 };
const EMPTY_GA4 = { users: 0, engagedSessions: 0, engagementRate: 0, avgEngagementSeconds: 0 };
const EMPTY_CF = { visits: 0, pageViews: 0, medianLoadMs: 0 };

// ---- Google Search Console -------------------------------------------------

const overviewModules = import.meta.glob<Loaded<OverviewSnapshot>>('../../../seo-data/gsc/overview-*.json', { eager: true });
export function loadOverview(): OverviewSnapshot {
  return newest(overviewModules) ?? { meta: emptyMeta('gsc'), current: EMPTY_GSC, previous: EMPTY_GSC };
}

const queriesModules = import.meta.glob<Loaded<QueriesSnapshot>>('../../../seo-data/gsc/queries-*.json', { eager: true });
export function loadQueries(): QueriesSnapshot {
  return newest(queriesModules) ?? { meta: emptyMeta('gsc'), rows: [] };
}

const pagesModules = import.meta.glob<Loaded<PagesSnapshot>>('../../../seo-data/gsc/pages-*.json', { eager: true });
export function loadPages(): PagesSnapshot {
  return newest(pagesModules) ?? { meta: emptyMeta('gsc'), rows: [] };
}

const strikingModules = import.meta.glob<Loaded<StrikingSnapshot>>('../../../seo-data/gsc/striking-*.json', { eager: true });
export function loadStriking(): StrikingSnapshot {
  return newest(strikingModules) ?? { meta: emptyMeta('gsc'), rows: [] };
}

const localeModules = import.meta.glob<Loaded<LocaleSnapshot>>('../../../seo-data/gsc/locale-*.json', { eager: true });
export function loadLocaleAggregate(): LocaleSnapshot {
  return newest(localeModules) ?? { meta: emptyMeta('gsc'), locales: [] };
}

const ctrOutliersModules = import.meta.glob<Loaded<CtrOutliersSnapshot>>('../../../seo-data/gsc/ctr-outliers-*.json', { eager: true });
export function loadCtrOutliers(): CtrOutliersSnapshot {
  return newest(ctrOutliersModules) ?? { meta: emptyMeta('gsc'), rows: [] };
}

// ---- Google Analytics 4 ----------------------------------------------------

const ga4OverviewModules = import.meta.glob<Loaded<Ga4OverviewSnapshot>>('../../../seo-data/ga4/ga4-overview-*.json', { eager: true });
export function loadGa4Overview(): Ga4OverviewSnapshot {
  return newest(ga4OverviewModules) ?? { meta: emptyMeta('ga4'), current: EMPTY_GA4, previous: EMPTY_GA4 };
}

const ga4ChannelsModules = import.meta.glob<Loaded<Ga4ChannelsSnapshot>>('../../../seo-data/ga4/ga4-channels-*.json', { eager: true });
export function loadGa4Channels(): Ga4ChannelsSnapshot {
  return newest(ga4ChannelsModules) ?? { meta: emptyMeta('ga4'), rows: [] };
}

const ga4PagesModules = import.meta.glob<Loaded<Ga4PagesSnapshot>>('../../../seo-data/ga4/ga4-pages-*.json', { eager: true });
export function loadGa4Pages(): Ga4PagesSnapshot {
  return newest(ga4PagesModules) ?? { meta: emptyMeta('ga4'), rows: [] };
}

const ga4EventsModules = import.meta.glob<Loaded<Ga4EventsSnapshot>>('../../../seo-data/ga4/ga4-events-*.json', { eager: true });
export function loadGa4Events(): Ga4EventsSnapshot {
  return newest(ga4EventsModules) ?? { meta: emptyMeta('ga4'), rows: [] };
}

const ga4LocaleModules = import.meta.glob<Loaded<Ga4LocaleSnapshot>>('../../../seo-data/ga4/ga4-locale-*.json', { eager: true });
export function loadGa4Locale(): Ga4LocaleSnapshot {
  return newest(ga4LocaleModules) ?? { meta: emptyMeta('ga4'), locales: [] };
}

// ---- Cloudflare Web Analytics ----------------------------------------------

const cfOverviewModules = import.meta.glob<Loaded<CloudflareOverviewSnapshot>>('../../../seo-data/cloudflare/cloudflare-overview-*.json', { eager: true });
export function loadCloudflareOverview(): CloudflareOverviewSnapshot {
  return newest(cfOverviewModules) ?? { meta: emptyMeta('cloudflare'), current: EMPTY_CF, previous: EMPTY_CF };
}

const cfPagesModules = import.meta.glob<Loaded<CloudflarePagesSnapshot>>('../../../seo-data/cloudflare/cloudflare-pages-*.json', { eager: true });
export function loadCloudflarePages(): CloudflarePagesSnapshot {
  return newest(cfPagesModules) ?? { meta: emptyMeta('cloudflare'), rows: [] };
}

const cfReferrersModules = import.meta.glob<Loaded<CloudflareReferrersSnapshot>>('../../../seo-data/cloudflare/cloudflare-referrers-*.json', { eager: true });
export function loadCloudflareReferrers(): CloudflareReferrersSnapshot {
  return newest(cfReferrersModules) ?? { meta: emptyMeta('cloudflare'), rows: [] };
}

const cfCountriesModules = import.meta.glob<Loaded<CloudflareCountriesSnapshot>>('../../../seo-data/cloudflare/cloudflare-countries-*.json', { eager: true });
export function loadCloudflareCountries(): CloudflareCountriesSnapshot {
  return newest(cfCountriesModules) ?? { meta: emptyMeta('cloudflare'), rows: [] };
}
