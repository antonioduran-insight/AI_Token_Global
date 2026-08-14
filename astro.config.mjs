// @ts-check
import { execFileSync } from 'node:child_process';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { createClient } from '@sanity/client';
import { loadEnv } from 'vite';

/**
 * Sitemap `lastmod`.
 *
 * The sitemap shipped 656 URLs with no freshness hint at all, so Google had
 * nothing to prioritise a re-crawl on. Every date below comes from the thing that
 * actually holds the content:
 *
 *   - blog posts and CMS-backed pages → the Sanity document's `_updatedAt`
 *   - each blog index                 → the newest `_updatedAt` in that locale
 *   - pages with no CMS document      → the last commit that touched their source
 *
 * Nothing is stamped with "now": a lastmod that changes on every deploy is a lie
 * about the content, and search engines learn to ignore it.
 *
 * This runs at config load rather than inside the page build because `serialize`
 * needs the whole map up front — hence its own client and its own env read rather
 * than importing src/lib/sanity.ts, whose `import.meta.env` is not populated this
 * early.
 */
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');

/** Sanity doc type → the locale-relative route it renders as. */
const DOC_ROUTE = {
  homePage: () => '/',
  aiTrendsPage: () => '/ai-trends/',
  apiComparePage: () => '/api-compare/',
  beginnersGuidePage: () => '/beginners-guide/',
  compliancePage: () => '/compliance/',
  tokenCalculatorPage: () => '/token-calculator/',
  useCasesPage: () => '/use-cases/',
  userGuidePage: () => '/user-guide/',
  apiModelPage: doc => (doc.modelSlug ? `/${doc.modelSlug}-api/` : null),
  legalPage: doc => (doc.docType ? `/${doc.docType}/` : null),
};

/** Routes with no CMS document, mapped to the source files that are their content. */
const SOURCE_BACKED_ROUTES = [
  {
    route: lang => `/${lang}/contact/`,
    files: lang => ['src/pages/[lang]/contact.astro', `src/i18n/${lang}.json`],
  },
];

const LANGS = ['en', 'es', 'id', 'vi'];
const LEGAL_DOC_TYPES = ['privacy', 'terms'];

function newest(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

/**
 * Commit date of the last change to any of `files`, or null when git cannot
 * answer — a shallow clone, or an export with no history. Null means the URL
 * ships without a lastmod, which is the honest outcome: better than inventing one.
 */
function lastCommitISO(files) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out ? new Date(out).toISOString() : null;
  } catch {
    return null;
  }
}

async function buildLastmodMap() {
  /** @type {Map<string, string>} */
  const map = new Map();
  const set = (path, iso) => {
    if (path && iso) map.set(path, newest(map.get(path), iso));
  };

  for (const lang of LANGS) {
    for (const { route, files } of SOURCE_BACKED_ROUTES) set(route(lang), lastCommitISO(files(lang)));
  }
  set('/', lastCommitISO(['src/pages/index.astro']));

  const projectId = env.PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) {
    console.warn('[sitemap] PUBLIC_SANITY_PROJECT_ID is unset — CMS pages will carry no lastmod.');
    return map;
  }

  try {
    const client = createClient({
      projectId,
      dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
    });

    const [posts, docs] = await Promise.all([
      client.fetch(
        `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))] {
          "slug": slug.current, language, _updatedAt
        }`
      ),
      client.fetch(
        `*[_type in $types && !(_id in path("drafts.**"))] { _type, language, modelSlug, docType, _updatedAt }`,
        { types: Object.keys(DOC_ROUTE) }
      ),
    ]);

    for (const post of posts) {
      if (!post.language) continue;
      set(`/${post.language}/blog/${post.slug}/`, post._updatedAt);
      // The index lists the posts, so its freshest post is its own last change.
      set(`/${post.language}/blog/`, post._updatedAt);
    }

    for (const doc of docs) {
      const route = DOC_ROUTE[doc._type]?.(doc);
      if (!route || !doc.language) continue;
      set(`/${doc.language}${route}`, doc._updatedAt);
    }

    // Legal pages fall back to the English document when a locale has none, so the
    // date has to fall back with them or those URLs would claim no date at all.
    for (const docType of LEGAL_DOC_TYPES) {
      const english = map.get(`/en/${docType}/`);
      if (!english) continue;
      for (const lang of LANGS) {
        if (!map.has(`/${lang}/${docType}/`)) set(`/${lang}/${docType}/`, english);
      }
    }
  } catch (error) {
    console.warn(`[sitemap] could not read Sanity for lastmod dates: ${error?.message ?? error}`);
  }

  return map;
}

const LASTMOD = await buildLastmodMap();
const missingLastmod = new Set();

export default defineConfig({
  site: 'https://www.aitoken.global',
  integrations: [
    sitemap({
      serialize(item) {
        const { pathname } = new URL(item.url);
        const lastmod = LASTMOD.get(pathname);
        if (!lastmod) {
          missingLastmod.add(pathname);
          return item;
        }
        return { ...item, lastmod };
      },
    }),
  ],
  output: 'static',
});

// Report rather than paper over: a URL with no date is a page whose source we
// failed to identify, and that is worth seeing in the build log.
process.on('exit', () => {
  if (!missingLastmod.size) return;
  console.warn(
    `[sitemap] ${missingLastmod.size} URL(s) carry no lastmod: ` +
    [...missingLastmod].slice(0, 10).join(', ') +
    (missingLastmod.size > 10 ? ', …' : '')
  );
});
