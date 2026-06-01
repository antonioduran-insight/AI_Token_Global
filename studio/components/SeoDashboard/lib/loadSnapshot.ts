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
  Ga4OverviewSnapshot,
  Ga4ChannelsSnapshot,
  Ga4PagesSnapshot,
  Ga4EventsSnapshot,
  Ga4LocaleSnapshot,
  CloudflareOverviewSnapshot,
  CloudflarePagesSnapshot,
  CloudflareReferrersSnapshot,
  CloudflareCountriesSnapshot,
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

// ---- GA4 Behavior Overview -------------------------------------------------
//
// Real GA4 snapshots land in seo-data/ga4/ (written by the GA4 fetch script once
// credentials arrive); mock fallback lives in seo-data/mock/. Same rule as GSC.

const realGa4OverviewModules = import.meta.glob<Loaded<Ga4OverviewSnapshot>>(
  '../../../seo-data/ga4/ga4-overview-*.json',
  { eager: true },
);
const mockGa4OverviewModules = import.meta.glob<Loaded<Ga4OverviewSnapshot>>(
  '../../../seo-data/mock/ga4-overview.json',
  { eager: true },
);

export function loadGa4Overview(): Ga4OverviewSnapshot {
  const real = Object.entries(realGa4OverviewModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockGa4OverviewModules);
  if (mock.length === 0) {
    throw new Error(
      'No GA4 overview snapshot found. Expected either ' +
        'studio/seo-data/ga4/ga4-overview-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/ga4-overview.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- GA4 Traffic Sources ---------------------------------------------------

const realGa4ChannelsModules = import.meta.glob<Loaded<Ga4ChannelsSnapshot>>(
  '../../../seo-data/ga4/ga4-channels-*.json',
  { eager: true },
);
const mockGa4ChannelsModules = import.meta.glob<Loaded<Ga4ChannelsSnapshot>>(
  '../../../seo-data/mock/ga4-channels.json',
  { eager: true },
);

export function loadGa4Channels(): Ga4ChannelsSnapshot {
  const real = Object.entries(realGa4ChannelsModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockGa4ChannelsModules);
  if (mock.length === 0) {
    throw new Error(
      'No GA4 channels snapshot found. Expected either ' +
        'studio/seo-data/ga4/ga4-channels-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/ga4-channels.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- GA4 Top Pages ---------------------------------------------------------

const realGa4PagesModules = import.meta.glob<Loaded<Ga4PagesSnapshot>>(
  '../../../seo-data/ga4/ga4-pages-*.json',
  { eager: true },
);
const mockGa4PagesModules = import.meta.glob<Loaded<Ga4PagesSnapshot>>(
  '../../../seo-data/mock/ga4-pages.json',
  { eager: true },
);

export function loadGa4Pages(): Ga4PagesSnapshot {
  const real = Object.entries(realGa4PagesModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockGa4PagesModules);
  if (mock.length === 0) {
    throw new Error(
      'No GA4 pages snapshot found. Expected either ' +
        'studio/seo-data/ga4/ga4-pages-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/ga4-pages.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- GA4 Events ------------------------------------------------------------

const realGa4EventsModules = import.meta.glob<Loaded<Ga4EventsSnapshot>>(
  '../../../seo-data/ga4/ga4-events-*.json',
  { eager: true },
);
const mockGa4EventsModules = import.meta.glob<Loaded<Ga4EventsSnapshot>>(
  '../../../seo-data/mock/ga4-events.json',
  { eager: true },
);

export function loadGa4Events(): Ga4EventsSnapshot {
  const real = Object.entries(realGa4EventsModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockGa4EventsModules);
  if (mock.length === 0) {
    throw new Error(
      'No GA4 events snapshot found. Expected either ' +
        'studio/seo-data/ga4/ga4-events-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/ga4-events.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- GA4 By Locale ---------------------------------------------------------

const realGa4LocaleModules = import.meta.glob<Loaded<Ga4LocaleSnapshot>>(
  '../../../seo-data/ga4/ga4-locale-*.json',
  { eager: true },
);
const mockGa4LocaleModules = import.meta.glob<Loaded<Ga4LocaleSnapshot>>(
  '../../../seo-data/mock/ga4-locale.json',
  { eager: true },
);

export function loadGa4Locale(): Ga4LocaleSnapshot {
  const real = Object.entries(realGa4LocaleModules).sort(
    ([a], [b]) => b.localeCompare(a),
  );
  if (real.length > 0) return real[0][1].default;

  const mock = Object.values(mockGa4LocaleModules);
  if (mock.length === 0) {
    throw new Error(
      'No GA4 locale snapshot found. Expected either ' +
        'studio/seo-data/ga4/ga4-locale-YYYY-MM-DD.json or ' +
        'studio/seo-data/mock/ga4-locale.json. See studio/seo-data/README.md.',
    );
  }
  return mock[0].default;
}

// ---- Cloudflare Overview ---------------------------------------------------

const realCfOverviewModules = import.meta.glob<Loaded<CloudflareOverviewSnapshot>>(
  '../../../seo-data/cloudflare/cloudflare-overview-*.json',
  { eager: true },
);
const mockCfOverviewModules = import.meta.glob<Loaded<CloudflareOverviewSnapshot>>(
  '../../../seo-data/mock/cloudflare-overview.json',
  { eager: true },
);

export function loadCloudflareOverview(): CloudflareOverviewSnapshot {
  const real = Object.entries(realCfOverviewModules).sort(([a], [b]) => b.localeCompare(a));
  if (real.length > 0) return real[0][1].default;
  const mock = Object.values(mockCfOverviewModules);
  if (mock.length === 0) {
    throw new Error(
      'No Cloudflare overview snapshot found. Expected studio/seo-data/cloudflare/' +
        'cloudflare-overview-YYYY-MM-DD.json or studio/seo-data/mock/cloudflare-overview.json.',
    );
  }
  return mock[0].default;
}

// ---- Cloudflare Top Pages --------------------------------------------------

const realCfPagesModules = import.meta.glob<Loaded<CloudflarePagesSnapshot>>(
  '../../../seo-data/cloudflare/cloudflare-pages-*.json',
  { eager: true },
);
const mockCfPagesModules = import.meta.glob<Loaded<CloudflarePagesSnapshot>>(
  '../../../seo-data/mock/cloudflare-pages.json',
  { eager: true },
);

export function loadCloudflarePages(): CloudflarePagesSnapshot {
  const real = Object.entries(realCfPagesModules).sort(([a], [b]) => b.localeCompare(a));
  if (real.length > 0) return real[0][1].default;
  const mock = Object.values(mockCfPagesModules);
  if (mock.length === 0) {
    throw new Error(
      'No Cloudflare pages snapshot found. Expected studio/seo-data/cloudflare/' +
        'cloudflare-pages-YYYY-MM-DD.json or studio/seo-data/mock/cloudflare-pages.json.',
    );
  }
  return mock[0].default;
}

// ---- Cloudflare Referrers --------------------------------------------------

const realCfReferrersModules = import.meta.glob<Loaded<CloudflareReferrersSnapshot>>(
  '../../../seo-data/cloudflare/cloudflare-referrers-*.json',
  { eager: true },
);
const mockCfReferrersModules = import.meta.glob<Loaded<CloudflareReferrersSnapshot>>(
  '../../../seo-data/mock/cloudflare-referrers.json',
  { eager: true },
);

export function loadCloudflareReferrers(): CloudflareReferrersSnapshot {
  const real = Object.entries(realCfReferrersModules).sort(([a], [b]) => b.localeCompare(a));
  if (real.length > 0) return real[0][1].default;
  const mock = Object.values(mockCfReferrersModules);
  if (mock.length === 0) {
    throw new Error(
      'No Cloudflare referrers snapshot found. Expected studio/seo-data/cloudflare/' +
        'cloudflare-referrers-YYYY-MM-DD.json or studio/seo-data/mock/cloudflare-referrers.json.',
    );
  }
  return mock[0].default;
}

// ---- Cloudflare Countries --------------------------------------------------

const realCfCountriesModules = import.meta.glob<Loaded<CloudflareCountriesSnapshot>>(
  '../../../seo-data/cloudflare/cloudflare-countries-*.json',
  { eager: true },
);
const mockCfCountriesModules = import.meta.glob<Loaded<CloudflareCountriesSnapshot>>(
  '../../../seo-data/mock/cloudflare-countries.json',
  { eager: true },
);

export function loadCloudflareCountries(): CloudflareCountriesSnapshot {
  const real = Object.entries(realCfCountriesModules).sort(([a], [b]) => b.localeCompare(a));
  if (real.length > 0) return real[0][1].default;
  const mock = Object.values(mockCfCountriesModules);
  if (mock.length === 0) {
    throw new Error(
      'No Cloudflare countries snapshot found. Expected studio/seo-data/cloudflare/' +
        'cloudflare-countries-YYYY-MM-DD.json or studio/seo-data/mock/cloudflare-countries.json.',
    );
  }
  return mock[0].default;
}
