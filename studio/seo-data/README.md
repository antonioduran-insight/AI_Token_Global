# SEO data snapshots

The SEO dashboard reads its data from JSON snapshot files in this directory.
Each "section" of the dashboard (Overview, Top Queries, Top Pages, etc.) has
its own snapshot. JSON files in this folder are imported at build time by
[`../components/SeoDashboard/lib/loadSnapshot.ts`](../components/SeoDashboard/lib/loadSnapshot.ts)
and rendered by the corresponding section component.

## Folder layout

```
seo-data/
  mock/                ← hand-crafted placeholder data, used while real data is unavailable
    overview.json
    queries.json
    pages.json
    striking.json
    locale.json
    ctr-outliers.json
  gsc/                 ← real Google Search Console snapshots, dated
    overview-YYYY-MM-DD.json
    queries-YYYY-MM-DD.json
    ...
```

## How the loader picks a file (per section)

For each section, the loader follows this rule:

1. Look in `gsc/<section>-*.json`. If any files exist, pick the **most recent by
   filename date** (filenames sort lexicographically because dates are
   `YYYY-MM-DD`).
2. Otherwise, fall back to `mock/<section>.json`.

This means **no component code ever has to change** to swap mock for real data.
Adding a new GSC snapshot is just a matter of dropping a new file into `gsc/`.

## When to use mock vs. gsc

- **mock/**: currently in use because `aitoken.global` is not yet verified in
  Google Search Console. See `TASK5_PROGRESS.md §1.5 Q1` for the pending
  Antonio ask.
- **gsc/**: starts being populated as soon as we can fetch real data. Eventually
  a small script (`studio/scripts/fetch-seo-snapshots.*`) will write new dated
  files here periodically.

## Naming convention for GSC files

```
gsc/<section>-<YYYY-MM-DD>.json
```

- `<section>` is one of: `overview`, `queries`, `pages`, `striking`, `locale`, `ctr-outliers`.
- `<YYYY-MM-DD>` is the date the snapshot was generated (UTC).
- Old files don't need to be deleted — the loader always picks the newest.
  Keeping a couple of weeks of history is useful for week-over-week comparisons
  done outside the loader.

## Snapshot meta — what's configurable per snapshot

Every snapshot has a `meta` object at the top. These values flow straight into
the dashboard's rendering, so they're how you change behaviour without touching
component code:

| Field | Effect |
|---|---|
| `siteUrl` | Displayed below the dashboard title |
| `snapshotDate` | Currently informational; available for future "data freshness" indicators |
| `rangeDays` | Drives every "Last N days" label and the WoW comparison framing. Change this to whatever window the fetch script queried — 7, 28, 30, 90, etc. The dashboard adapts automatically. |
| `dataSource` | `mock` or `gsc`. Used by the dashboard header to decide whether to show the "Mock data" badge. |
| `mockNote` | Free-form annotation, shown to humans reading the JSON. Never displayed in the UI. |

## Schema

JSON files must match the TypeScript interfaces in
[`../components/SeoDashboard/lib/types.ts`](../components/SeoDashboard/lib/types.ts).
Mismatches are caught by TypeScript at build time.

## Do not edit the snapshots by hand

Once real GSC data starts flowing, treat the files in `gsc/` as generated
output. If a number looks wrong, the source of truth is GSC; fix it there and
regenerate. Mock files in `mock/` are the only ones intended for manual
authoring, and only while the dashboard is in placeholder mode.

---

## Extending the dashboard with new sections / data sources

When new data becomes available (GA4 traffic sources, GA4 bounce rate, Ahrefs
backlink profile, Bing Webmaster Tools, etc.), follow this recipe to add a new
section. Each step is a small, isolated change:

### 1. Define the snapshot shape

Add an interface to [`../components/SeoDashboard/lib/types.ts`](../components/SeoDashboard/lib/types.ts):

```ts
export interface TrafficSourceRow {
  source: string;          // e.g. "google / organic"
  locale: 'en' | 'es' | 'id';
  sessions: number;
  users: number;
  bounceRate: number;      // fraction [0, 1]
}

export interface TrafficSourcesSnapshot {
  meta: SnapshotMeta;
  rows: TrafficSourceRow[];
}
```

### 2. Add a loader

In [`../components/SeoDashboard/lib/loadSnapshot.ts`](../components/SeoDashboard/lib/loadSnapshot.ts),
copy the pattern used for the existing sections:

```ts
const realTrafficSourcesModules = import.meta.glob<Loaded<TrafficSourcesSnapshot>>(
  '../../../seo-data/ga4/traffic-sources-*.json',  // or gsc/, depending on the data provider
  { eager: true },
);
const mockTrafficSourcesModules = import.meta.glob<Loaded<TrafficSourcesSnapshot>>(
  '../../../seo-data/mock/traffic-sources.json',
  { eager: true },
);

export function loadTrafficSources(): TrafficSourcesSnapshot {
  const real = Object.entries(realTrafficSourcesModules).sort(([a], [b]) => b.localeCompare(a));
  if (real.length > 0) return real[0][1].default;
  return Object.values(mockTrafficSourcesModules)[0].default;
}
```

### 3. Write a mock JSON

Drop a hand-crafted `studio/seo-data/mock/traffic-sources.json` matching the
shape. Use realistic numbers so the section feels right when previewed.

### 4. Build the section component

Create `studio/components/SeoDashboard/SeoTrafficSources.tsx`. Reuse the existing
building blocks:

- `<SectionHeader />` for the title + range label
- `<SortableTable />` + `useSortableData` if it's a tabular view
- `<LocaleFilter />` + `filterByLocale` + `countByLocale` for the locale chips
- Helpers in `lib/formatters.ts` for number / percent / position formatting

If it's a non-tabular view (like By Locale's comparison grid), follow that
pattern instead. The shared `SectionHeader` is the only thing every section
should reuse.

### 5. Wire the section into the dashboard

Add the import and the `<SeoTrafficSources />` render to
[`../components/SeoDashboard/index.tsx`](../components/SeoDashboard/index.tsx).

### 6. (Optional) Surface in the JSON report export

If you want the section's data to appear in the "Download report" JSON, add it
to [`../components/SeoDashboard/lib/exportReport.ts`](../components/SeoDashboard/lib/exportReport.ts).
Otherwise, leave it out — the export will silently skip unknown sections.

### 7. Once real data is available

When the fetch script can produce real snapshots, drop a dated file into the
appropriate provider folder (`gsc/`, `ga4/`, etc.). The loader picks it up on
the next build; no further code changes are required.
