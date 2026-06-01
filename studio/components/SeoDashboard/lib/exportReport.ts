// Bundles every snapshot the dashboard reads into one JSON file and
// triggers a browser download. The file is intended primarily as
// AI-tool context — paste the JSON into Claude / ChatGPT to brainstorm
// content improvements ("here's the last 30 days of search data, what
// blog posts should we publish?").
//
// The JSON shape is identical to the snapshot files on disk, just
// keyed by section under a single top-level wrapper for easy
// addressing in an AI prompt.

import {
  loadOverview,
  loadQueries,
  loadPages,
  loadStriking,
  loadLocaleAggregate,
  loadCtrOutliers,
} from './loadSnapshot';
import type {
  OverviewSnapshot,
  QueriesSnapshot,
  PagesSnapshot,
  StrikingSnapshot,
  LocaleSnapshot,
  CtrOutliersSnapshot,
  DataSourceKind,
} from './types';

export interface FullReport {
  /** ISO timestamp the export was generated client-side. */
  exportedAt: string;
  /** Site the report describes. */
  siteUrl: string;
  /** Rolling window in days. Read from the Overview snapshot. */
  rangeDays: number;
  /**
   * Overall freshness of the bundle. `mock` if every section is mock,
   * `gsc` if every section is real Google Search Console data, `mixed`
   * if it's a transitional state.
   */
  dataSource: DataSourceKind | 'mixed';
  /** A line of context for whoever (human or AI) reads this file first. */
  readme: string;
  sections: {
    overview: OverviewSnapshot;
    queries: QueriesSnapshot;
    pages: PagesSnapshot;
    striking: StrikingSnapshot;
    byLocale: LocaleSnapshot;
    ctrOutliers: CtrOutliersSnapshot;
  };
}

const README_TEXT = [
  'SEO Insights export from the aitoken.global Sanity Studio dashboard.',
  '',
  'Contents:',
  '  - overview        : 4 headline metrics (clicks, impressions, CTR, avg position) with WoW deltas',
  '  - queries         : top search terms bringing traffic',
  '  - pages           : top URLs by clicks',
  '  - striking        : queries ranking page 2 (~pos 11-20) — biggest editorial-leverage opportunities',
  '  - byLocale        : per-locale (EN/ES/ID) aggregate metrics + top query/page per locale',
  '  - ctrOutliers     : pages where CTR is below the position-typical curve (rewrite title/meta)',
  '',
  'CTRs are fractions in [0, 1] (e.g. 0.0293 = 2.93%).',
  'Average position: lower is better (1 = top of Google search results).',
  '',
  'Suggested AI prompt: "Here is the last N days of SEO data for our site.',
  'Identify the 5 highest-leverage content opportunities (blog posts to write or refresh,',
  'titles/meta-descriptions to rewrite, locale gaps to fill) and explain why each one matters."',
].join('\n');

export function buildFullReport(): FullReport {
  const overview = loadOverview();
  const queries = loadQueries();
  const pages = loadPages();
  const striking = loadStriking();
  const byLocale = loadLocaleAggregate();
  const ctrOutliers = loadCtrOutliers();

  const sources: DataSourceKind[] = [
    overview.meta.dataSource,
    queries.meta.dataSource,
    pages.meta.dataSource,
    striking.meta.dataSource,
    byLocale.meta.dataSource,
    ctrOutliers.meta.dataSource,
  ];
  const allMock = sources.every((s) => s === 'mock');
  const allReal = sources.every((s) => s === 'gsc');
  const dataSource: FullReport['dataSource'] = allMock ? 'mock' : allReal ? 'gsc' : 'mixed';

  return {
    exportedAt: new Date().toISOString(),
    siteUrl: overview.meta.siteUrl,
    rangeDays: overview.meta.rangeDays,
    dataSource,
    readme: README_TEXT,
    sections: { overview, queries, pages, striking, byLocale, ctrOutliers },
  };
}

/**
 * Build the full report and trigger a browser download of a JSON file.
 * Filename pattern: `seo-insights-<siteUrl>-<YYYY-MM-DD>.json`.
 */
export function downloadFullReportAsJson(): void {
  const report = buildFullReport();
  const date = report.exportedAt.slice(0, 10);
  const filename = `seo-insights-${report.siteUrl}-${date}.json`;
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
