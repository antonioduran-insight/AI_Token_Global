// Shared types for SEO dashboard snapshots.
//
// Every snapshot JSON file under studio/seo-data/ matches one of the
// interfaces below. The component imports the JSON and reads it as
// the typed shape. When real GSC data replaces mocks, the JSON
// shape stays the same — only `meta.dataSource` flips to 'gsc'.
//
// `Locale` re-exported from lib/locales.ts so types.ts stays the
// single mental "what's the row shape" reference for anyone wiring
// new sections in.

import type { Locale } from './locales';
export type { Locale };

export type DataSourceKind = 'mock' | 'gsc' | 'ga4';

export interface SnapshotMeta {
  /** Domain or property the data is for (e.g. "aitoken.global"). */
  siteUrl: string;
  /** ISO date the snapshot was taken (YYYY-MM-DD). */
  snapshotDate: string;
  /** Size of the rolling window in days (e.g. 28). */
  rangeDays: number;
  /** Where the numbers came from. 'mock' = hand-crafted placeholders. */
  dataSource: DataSourceKind;
  /** Optional human-readable note (e.g. why mocks are in use). */
  mockNote?: string;
}

// ---- Overview ---------------------------------------------------------

export interface OverviewBucket {
  /** Total clicks in the window. */
  clicks: number;
  /** Total impressions in the window. */
  impressions: number;
  /** Average CTR, as a fraction in [0, 1] (e.g. 0.0293 = 2.93%). */
  ctr: number;
  /** Average organic search position. Lower is better. */
  avgPosition: number;
}

export interface OverviewSnapshot {
  meta: SnapshotMeta;
  /** Most recent N-day window. */
  current: OverviewBucket;
  /** Prior N-day window, for week-over-week comparison. */
  previous: OverviewBucket;
}

// ---- Queries ----------------------------------------------------------

export interface QueryRow {
  /** The search term as Google reported it. */
  query: string;
  /** Locale path this query primarily lands on, e.g. "/en", "/es", "/id". */
  locale: Locale;
  clicks: number;
  impressions: number;
  /** Click-through rate as a fraction in [0, 1]. */
  ctr: number;
  /** Average organic position. Lower is better. */
  position: number;
}

export interface QueriesSnapshot {
  meta: SnapshotMeta;
  rows: QueryRow[];
}

// ---- Pages ------------------------------------------------------------

export interface PageRow {
  /**
   * Site-relative path including the locale segment, e.g. "/en/api/chatgpt-api".
   * Full URL from GSC is normalised to a path (hostname stripped) by the fetch script.
   */
  page: string;
  /** Top-level locale segment of the path. Derived once from `page` for fast filtering. */
  locale: Locale;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface PagesSnapshot {
  meta: SnapshotMeta;
  rows: PageRow[];
}

// ---- Striking Distance --------------------------------------------------
//
// "Striking distance" queries are ones where we already rank well enough
// to appear in Google's results (page 2, positions ~11–20) AND attract
// non-trivial impressions. A modest content update on the corresponding
// page can push the query onto page 1, where CTR typically jumps 3–5×.
//
// Shape is the same as QueryRow — the only difference vs Top Queries is
// the curated row selection done by the fetch script. Component derives
// "potential clicks" and "potential gain" at render time.

export type StrikingRow = QueryRow;

export interface StrikingSnapshot {
  meta: SnapshotMeta;
  /** Filter criteria used by the fetch script when picking rows. Free-form text. */
  criteria?: string;
  rows: StrikingRow[];
}

// ---- By-locale comparison ---------------------------------------------
//
// Per-locale aggregates (clicks, impressions, CTR, position) plus a couple
// of contextual "top performers" so a content lead can scan "how is each
// locale doing" without crossing into the per-row tables.

export interface LocaleAggregate {
  locale: Locale;
  /** Friendly label, e.g. "English", "Español", "Indonesia". */
  label: string;
  /** Aggregate metrics for the current rolling window. */
  current: OverviewBucket;
  /** Same metrics for the prior window, for WoW deltas. */
  previous: OverviewBucket;
  /** Highest-traffic query in this locale during the window. */
  topQuery: string;
  /** Highest-traffic page (path) in this locale during the window. */
  topPage: string;
}

export interface LocaleSnapshot {
  meta: SnapshotMeta;
  locales: LocaleAggregate[];
}

// ---- CTR Outliers -----------------------------------------------------
//
// Pages where actual CTR is meaningfully below the industry-typical CTR
// for the position they rank at. Editorial action = rewrite title/meta
// description, since rankings already exist. Same row shape as PageRow.

export type CtrOutlierRow = PageRow;

export interface CtrOutliersSnapshot {
  meta: SnapshotMeta;
  /** Filter criteria used by the fetch script when picking rows. Free-form text. */
  criteria?: string;
  rows: CtrOutlierRow[];
}

// ---- GA4 Behavior Overview --------------------------------------------
//
// On-site behaviour from Google Analytics 4 (Data API). Complements the GSC
// Overview: GSC answers "how do people find us" (search), GA4 answers "what do
// they do once they're here". Metrics picked for a content site — engagement
// rate replaces the old bounce rate; engagement time measures real attention.
//
// `dataSource` on the meta flips 'mock' -> 'ga4' when real snapshots land in
// studio/seo-data/ga4/. Same loader-with-fallback pattern as the GSC sections.

export interface Ga4OverviewBucket {
  /** Distinct users in the window. */
  users: number;
  /** Sessions that lasted >10s, fired a key event, or had >=2 pageviews. */
  engagedSessions: number;
  /** Engaged sessions / total sessions, fraction in [0, 1]. Replaces bounce rate. */
  engagementRate: number;
  /** Average engagement time per active user, in seconds. */
  avgEngagementSeconds: number;
}

export interface Ga4OverviewSnapshot {
  meta: SnapshotMeta;
  /** Most recent N-day window. */
  current: Ga4OverviewBucket;
  /** Prior N-day window, for period-over-period comparison. */
  previous: Ga4OverviewBucket;
}

// ---- GA4 Traffic Sources ----------------------------------------------
//
// GA4 default channel grouping — how visitors arrive. The angle GSC can't
// give us: GSC is organic-search-only, this is the whole funnel (direct,
// referral, social, email…).

export interface Ga4ChannelRow {
  /** GA4 default channel group, e.g. "Organic Search", "Direct", "Referral". */
  channel: string;
  users: number;
  sessions: number;
  /** Engaged sessions / total sessions for this channel, fraction [0, 1]. */
  engagementRate: number;
  /** Avg engagement time per session, in seconds. */
  avgEngagementSeconds: number;
}

export interface Ga4ChannelsSnapshot {
  meta: SnapshotMeta;
  rows: Ga4ChannelRow[];
}

// ---- GA4 Top Pages -----------------------------------------------------
//
// GA4 Engagement › Pages. Complements GSC Top Pages: that ranks by search
// clicks, this ranks by actual on-site behaviour (views + engaged time).

export interface Ga4PageRow {
  /** Site-relative path incl. locale segment, e.g. "/en/token-calculator". */
  page: string;
  /** Locale segment derived from the path. */
  locale: Locale;
  views: number;
  users: number;
  /** Avg engagement time per session on this page, in seconds. */
  avgEngagementSeconds: number;
}

export interface Ga4PagesSnapshot {
  meta: SnapshotMeta;
  rows: Ga4PageRow[];
}

// ---- GA4 Events --------------------------------------------------------
//
// GA4 Engagement › Events. Surfaces both the auto/enhanced-measurement events
// and our own custom events (cta_get_started, calculator_used, faq_open,
// language_switch) so the content team can see if CTAs and tools get used.

export interface Ga4EventRow {
  /** Event name, e.g. "page_view" or "cta_get_started". */
  event: string;
  count: number;
  users: number;
  /** True for our site-specific custom events; false for GA4 auto events. */
  custom: boolean;
}

export interface Ga4EventsSnapshot {
  meta: SnapshotMeta;
  rows: Ga4EventRow[];
}

// ---- GA4 By Locale -----------------------------------------------------
//
// Per-locale behaviour aggregates (en/es/id), mirroring the GSC By Locale grid
// but with GA4 metrics. Contextual per locale: top page + top acquisition
// channel (GA4 has no search queries, so top channel takes that slot).

export interface Ga4LocaleAggregate {
  locale: Locale;
  /** Friendly label, e.g. "English". */
  label: string;
  current: Ga4OverviewBucket;
  previous: Ga4OverviewBucket;
  /** Highest-traffic page (path) in this locale. */
  topPage: string;
  /** Channel bringing the most users to this locale, e.g. "Organic Search". */
  topChannel: string;
}

export interface Ga4LocaleSnapshot {
  meta: SnapshotMeta;
  locales: Ga4LocaleAggregate[];
}
