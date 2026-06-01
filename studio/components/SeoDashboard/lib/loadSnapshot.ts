// Snapshot loader for the SEO dashboard.
//
// Why this file exists: components must not import individual snapshot JSON
// files directly. As snapshots are refreshed (or as we swap from mock data
// to real Google Search Console data), file names change. Components stay
// stable by going through this loader — it discovers files at build time
// via Vite's `import.meta.glob` and always picks the appropriate one.
//
// Rule for each section:
//   1. If any `gsc/<section>-*.json` exists, use the most recent by filename.
//      (Filenames sort lexicographically because dates are YYYY-MM-DD.)
//   2. Otherwise, fall back to `mock/<section>.json`.
//
// When Antonio enables `aitoken.global` in GSC and we drop a real snapshot
// into `gsc/`, every section auto-upgrades on the next build. No edits here,
// no edits in the section components.
//
// See studio/seo-data/README.md for the on-disk conventions.

import type {
  OverviewSnapshot,
  QueriesSnapshot,
  PagesSnapshot,
  StrikingSnapshot,
  LocaleSnapshot,
  CtrOutliersSnapshot,
} from './types';

type Loaded<T> = { default: T };

// ---- Overview --------------------------------------------------------------

const realOverviewModules = import.meta.glob<Loaded<OverviewSnapshot>>(
  '../../../seo-data/gsc/overview-*.json',
  { eager: true },
);
const mockOverviewModules = import.meta.glob<Loaded<OverviewSnapshot>>(
  '../../../seo-data/mock/overview.json',
  { eager: true },
);

export function loadOverview(): OverviewSnapshot {
  const real = Object.entries(realOverviewModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockOverviewModules);
  if (mock.length === 0) {
    throw new Error(
      'No overview snapshot found. Expected either ' +
        'studio/seo-data/gsc/overview-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/overview.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- Queries ---------------------------------------------------------------

const realQueriesModules = import.meta.glob<Loaded<QueriesSnapshot>>(
  '../../../seo-data/gsc/queries-*.json',
  { eager: true },
);
const mockQueriesModules = import.meta.glob<Loaded<QueriesSnapshot>>(
  '../../../seo-data/mock/queries.json',
  { eager: true },
);

export function loadQueries(): QueriesSnapshot {
  const real = Object.entries(realQueriesModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockQueriesModules);
  if (mock.length === 0) {
    throw new Error(
      'No queries snapshot found. Expected either ' +
        'studio/seo-data/gsc/queries-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/queries.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- Pages -----------------------------------------------------------------

const realPagesModules = import.meta.glob<Loaded<PagesSnapshot>>(
  '../../../seo-data/gsc/pages-*.json',
  { eager: true },
);
const mockPagesModules = import.meta.glob<Loaded<PagesSnapshot>>(
  '../../../seo-data/mock/pages.json',
  { eager: true },
);

export function loadPages(): PagesSnapshot {
  const real = Object.entries(realPagesModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockPagesModules);
  if (mock.length === 0) {
    throw new Error(
      'No pages snapshot found. Expected either ' +
        'studio/seo-data/gsc/pages-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/pages.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- Striking Distance -----------------------------------------------------

const realStrikingModules = import.meta.glob<Loaded<StrikingSnapshot>>(
  '../../../seo-data/gsc/striking-*.json',
  { eager: true },
);
const mockStrikingModules = import.meta.glob<Loaded<StrikingSnapshot>>(
  '../../../seo-data/mock/striking.json',
  { eager: true },
);

export function loadStriking(): StrikingSnapshot {
  const real = Object.entries(realStrikingModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockStrikingModules);
  if (mock.length === 0) {
    throw new Error(
      'No striking-distance snapshot found. Expected either ' +
        'studio/seo-data/gsc/striking-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/striking.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- By-locale aggregate ---------------------------------------------------

const realLocaleModules = import.meta.glob<Loaded<LocaleSnapshot>>(
  '../../../seo-data/gsc/locale-*.json',
  { eager: true },
);
const mockLocaleModules = import.meta.glob<Loaded<LocaleSnapshot>>(
  '../../../seo-data/mock/locale.json',
  { eager: true },
);

export function loadLocaleAggregate(): LocaleSnapshot {
  const real = Object.entries(realLocaleModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockLocaleModules);
  if (mock.length === 0) {
    throw new Error(
      'No locale aggregate snapshot found. Expected either ' +
        'studio/seo-data/gsc/locale-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/locale.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- CTR Outliers ----------------------------------------------------------

const realCtrOutliersModules = import.meta.glob<Loaded<CtrOutliersSnapshot>>(
  '../../../seo-data/gsc/ctr-outliers-*.json',
  { eager: true },
);
const mockCtrOutliersModules = import.meta.glob<Loaded<CtrOutliersSnapshot>>(
  '../../../seo-data/mock/ctr-outliers.json',
  { eager: true },
);

export function loadCtrOutliers(): CtrOutliersSnapshot {
  const real = Object.entries(realCtrOutliersModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockCtrOutliersModules);
  if (mock.length === 0) {
    throw new Error(
      'No CTR outliers snapshot found. Expected either ' +
        'studio/seo-data/gsc/ctr-outliers-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/ctr-outliers.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}
