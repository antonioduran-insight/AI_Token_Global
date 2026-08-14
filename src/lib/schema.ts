import { repairSpanSpacing } from './portable-text.ts';

/**
 * JSON-LD builders.
 *
 * ── The one rule ──
 * A field with no real source is omitted. Not guessed, not filled with a
 * plausible default, not padded to make a validator happy. A structured-data
 * block is a set of machine-readable claims about the business, and a wrong claim
 * is worse than a missing one — `author: "Admin"` or an invented `foundingDate`
 * would be a fabricated trust signal aimed at a search engine. Every builder here
 * runs its output through `pruneJsonLd`, so an absent input disappears rather
 * than emitting `null`, `""` or an empty array.
 *
 * That is why `Article` carries no `author`: the site has no author records yet.
 * When it has them, add the field — until then the omission is the honest answer.
 */

// ── Brand facts ───────────────────────────────────────────────────────────
// Every value below is verifiable: the name is what the header, footer and the
// LinkedIn company page all say, and the logo is the mark used in the header.
export const ORGANIZATION_NAME = 'AI Token King';
export const ORGANIZATION_LINKEDIN = 'https://www.linkedin.com/company/ai-token-king';
/** PNG rather than the header's .avif — Google's logo parser does not read AVIF. */
export const ORGANIZATION_LOGO_PATH = '/logo.png';

/** Stable node id so `publisher` can reference the Organization instead of restating it. */
export function organizationId(siteOrigin: string): string {
  return `${siteOrigin}/#organization`;
}

export function organizationSchema(siteOrigin: string): Record<string, unknown> {
  return pruneJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId(siteOrigin),
    name: ORGANIZATION_NAME,
    url: `${siteOrigin}/`,
    logo: `${siteOrigin}${ORGANIZATION_LOGO_PATH}`,
    sameAs: [ORGANIZATION_LINKEDIN],
    // No foundingDate, address or numberOfEmployees: none of those are recorded
    // anywhere, and a search engine is the last place to start inventing them.
  });
}

// ── Article ───────────────────────────────────────────────────────────────

export interface ArticleSchemaInput {
  siteOrigin: string;
  /** Absolute canonical URL of the post. */
  url: string;
  headline: string;
  description?: string;
  /** ISO 8601. */
  datePublished?: string;
  /** ISO 8601 — Sanity's `_updatedAt`. */
  dateModified?: string;
  imageUrl?: string;
  /** BCP-47 tag, e.g. `en-US`. */
  inLanguage: string;
}

export function articleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return pruneJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${input.url}#article`,
    url: input.url,
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    image: input.imageUrl,
    inLanguage: input.inLanguage,
    publisher: { '@id': organizationId(input.siteOrigin) },
  });
}

// ── BreadcrumbList ────────────────────────────────────────────────────────

export interface Crumb {
  name: string;
  /** Absolute URL, trailing slash included. */
  url: string;
}

/**
 * A one-item trail says nothing a search engine can use, so anything shorter
 * than Home → page returns `null` and emits no block.
 */
export function breadcrumbSchema(crumbs: Crumb[]): Record<string, unknown> | null {
  if (crumbs.length < 2) return null;
  return pruneJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  });
}

/**
 * URL segment → the i18n key that already names that page in the nav or footer.
 *
 * Reusing the navigation labels keeps the trail localized and keeps it matching
 * what the reader clicked to get here. A segment missing from this map has no
 * real name, and `buildBreadcrumbs` then emits nothing rather than showing a
 * search engine a URL slug dressed up as a page title.
 */
const ROUTE_LABEL_KEY: Record<string, string> = {
  'ai-trends': 'nav.aiTrends',
  'api-compare': 'nav.compareModels',
  'beginners-guide': 'nav.beginnersGuide',
  blog: 'nav.blog',
  'chatgpt-api': 'footer.chatgptApi',
  'claude-api': 'footer.claudeApi',
  compliance: 'nav.compliance',
  contact: 'nav.contact',
  'gemini-api': 'footer.geminiApi',
  privacy: 'footer.privacy',
  terms: 'footer.terms',
  'token-calculator': 'nav.tokenCalculator',
  'use-cases': 'nav.useCases',
  'user-guide': 'footer.userGuide',
};

export interface BreadcrumbInput {
  pathname: string;
  lang: string;
  siteOrigin: string;
  t: (key: string) => string;
  /** Real name for the last crumb when the URL segment is not one — a post title. */
  leafLabel?: string;
}

export function buildBreadcrumbs({ pathname, lang, siteOrigin, t, leafLabel }: BreadcrumbInput): Crumb[] {
  const prefix = `/${lang}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) return [];

  const rest = pathname.slice(prefix.length).replace(/^\/+|\/+$/g, '');
  if (!rest) return []; // the locale home page is not a breadcrumb of itself

  const crumbs: Crumb[] = [{ name: t('common.home'), url: `${siteOrigin}/${lang}/` }];
  const segments = rest.split('/');
  let path = prefix;

  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    const name = resolveSegmentName(segments[i], t) ?? (i === segments.length - 1 ? leafLabel?.trim() : undefined);
    if (!name) return [];
    crumbs.push({ name, url: `${siteOrigin}${path}/` });
  }
  return crumbs;
}

/** `useTranslations` echoes the key back when it is missing, which is not a name. */
function resolveSegmentName(segment: string, t: (key: string) => string): string | undefined {
  const labelKey = ROUTE_LABEL_KEY[segment];
  if (!labelKey) return undefined;
  const label = t(labelKey).trim();
  return label && label !== labelKey ? label : undefined;
}

// ── FAQPage ───────────────────────────────────────────────────────────────

export interface FaqEntry {
  question?: string;
  /** Portable-text blocks straight from Sanity. */
  answer?: unknown;
}

/**
 * Only ever called with a page's real FAQ content, and returns `null` when there
 * is none — a page without questions must not claim to be an FAQPage.
 */
export function faqPageSchema(entries: FaqEntry[] | undefined, source: string): Record<string, unknown> | null {
  const mainEntity = (entries ?? [])
    .map(entry => ({
      question: entry.question?.trim() ?? '',
      answer: portableTextToPlain(entry.answer, source),
    }))
    .filter(entry => entry.question && entry.answer)
    .map(entry => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    }));

  if (!mainEntity.length) return null;
  return pruneJsonLd({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity });
}

/**
 * Portable text flattened to one line of plain prose.
 *
 * Goes through the same `repairSpanSpacing` the HTML renderer uses, so an answer
 * whose stored spans lost their separating spaces reads the same in the structured
 * data as it does on the page.
 */
export function portableTextToPlain(blocks: unknown, source = 'unknown document'): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  const parts: string[] = [];
  for (const block of repairSpanSpacing(blocks, source)) {
    const children = (block as any)?.children;
    if ((block as any)?._type !== 'block' || !Array.isArray(children)) continue;
    const text = children.map((child: any) => (typeof child?.text === 'string' ? child.text : '')).join('');
    if (text.trim()) parts.push(text.trim());
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ── Emission ──────────────────────────────────────────────────────────────

/**
 * Recursively drop what carries no information: `undefined`, `null`, blank
 * strings, and arrays or objects left empty once their own members were dropped.
 */
export function pruneJsonLd<T>(value: T): T {
  return prune(value) as T;
}

function prune(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  if (Array.isArray(value)) {
    const kept = value.map(prune).filter(item => item !== undefined);
    return kept.length ? kept : undefined;
  }
  if (value && typeof value === 'object') {
    const kept: Record<string, unknown> = {};
    for (const [key, member] of Object.entries(value)) {
      const pruned = prune(member);
      if (pruned !== undefined) kept[key] = pruned;
    }
    return Object.keys(kept).length ? kept : undefined;
  }
  return value ?? undefined;
}

/**
 * `<` is escaped so a `</script>` sequence inside content — an FAQ answer that
 * quotes markup, say — cannot close the tag the block is written into.
 */
export function serializeJsonLd(block: unknown): string {
  return JSON.stringify(block).replace(/</g, '\\u003c');
}
