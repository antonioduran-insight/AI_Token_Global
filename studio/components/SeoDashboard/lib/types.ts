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

export type DataSourceKind = 'mock' | 'gsc';

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
