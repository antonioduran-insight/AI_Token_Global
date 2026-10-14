import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Picks the "Related articles" for every post in a locale, once per build.
 *
 * ── Why this is a plan, not a per-page query ──
 * The old rule ("the 3 newest posts in the same category") gave every post in a
 * category the same three cards: 1,773 slots went to 115 posts and 479 of 593
 * published posts were never shown (audits/2026-10-14/internal-links-audit.md).
 * Spreading slots needs to know what every other page already picked, so the
 * whole locale is planned in one deterministic pass and each page reads its row.
 *
 * ── Rules ──
 *   - same locale only; never the page itself
 *   - never a thin post: under MIN_WORDS words, or an es/id/vi post whose body is
 *     mostly English (the untranslated copies)
 *   - same category first; then topic overlap (shared tags, shared title words)
 *   - favour posts with 0–1 inbound links and posts with search impressions
 *   - no post is picked more than `cap` times, so the slots spread out
 * Ties break on slug, and sources are processed in slug order: same input,
 * same output, every build.
 */

export interface RelatedSource {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  articleNumber?: number;
  language?: string;
  coverImage?: { asset?: { url: string } };
  /** Plain text of the body, for word count and language check. */
  text?: string;
  /** Every link href in the body. */
  hrefs?: (string | null)[];
}

export const MIN_WORDS = 600;
const COMMON_SHARE = 0.3;
const TOPIC_WEIGHT = 300;
const PER_PAGE = 3;

const EN_WORDS = /\b(the|and|with|that|this|for|are|is|of|to|you|your)\b/gi;
const LOCAL_WORDS: Record<string, RegExp> = {
  es: /\b(el|los|las|que|con|para|una|del|por|es|y)\b/gi,
  id: /\b(yang|dan|untuk|dengan|ini|dari|adalah|di|ke|tidak)\b/gi,
  vi: /(của|và|là|các|những|cho|với|được|trong|không)/gi,
};

export function wordCount(text = ''): number {
  return (text.match(/\S+/g) ?? []).length;
}

/** An es/id/vi body where English function words outnumber the locale's own. */
export function hasEnglishBody(lang: string, text = ''): boolean {
  const local = LOCAL_WORDS[lang];
  if (!local) return false;
  return (text.match(EN_WORDS) ?? []).length > (text.match(local) ?? []).length;
}

export function isThin(p: RelatedSource): boolean {
  return wordCount(p.text) < MIN_WORDS || hasEnglishBody(p.language ?? 'en', p.text);
}

/**
 * Impressions per page path from the newest committed GSC snapshot
 * (studio/seo-data/gsc/pages-*.json, refreshed weekly in CI). Missing or
 * unreadable → no preference, never a failed build.
 */
function loadImpressions(): Map<string, number> {
  const out = new Map<string, number>();
  try {
    const dir = join(process.cwd(), 'studio/seo-data/gsc');
    const latest = readdirSync(dir).filter(f => /^pages-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().at(-1);
    if (!latest) return out;
    const { rows } = JSON.parse(readFileSync(join(dir, latest), 'utf8'));
    for (const r of rows ?? []) {
      const path = String(r.page).split('#')[0].replace(/\/?$/, '/');
      out.set(path, (out.get(path) ?? 0) + (Number(r.impressions) || 0));
    }
  } catch {
    // no snapshot: rank without it
  }
  return out;
}

const tokens = (s = '') => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
const topicText = (p: RelatedSource) => `${p.title} ${(p.tags ?? []).join(' ')} ${p.excerpt ?? ''}`;
function jaccard(a: Set<string>, b: Set<string>): number {
  let i = 0;
  for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i || 1);
}
const pathOf = (lang: string, slug: string) => `/${lang}/blog/${slug}/`;
const sitePath = (href: string) => href.replace(/^https?:\/\/(www\.)?aitoken\.global/, '').split(/[?#]/)[0].replace(/\/?$/, '/');

export interface RelatedPlan {
  bySlug: Map<string, RelatedSource[]>;
  stats: string;
}

export function planRelated(lang: string, posts: RelatedSource[]): RelatedPlan {
  const impressions = loadImpressions();
  const sources = [...posts].sort((a, b) => a.slug.current.localeCompare(b.slug.current));
  const eligible = sources.filter(p => !isThin(p));

  // Inbound links that exist regardless of this plan: links in other posts' bodies.
  const bodyInbound = new Map<string, number>();
  for (const p of sources) {
    const targets = new Set((p.hrefs ?? []).filter((h): h is string => !!h).map(sitePath));
    targets.delete(pathOf(lang, p.slug.current));
    for (const t of targets) bodyInbound.set(t, (bodyInbound.get(t) ?? 0) + 1);
  }
  const inboundOf = (p: RelatedSource) => bodyInbound.get(pathOf(lang, p.slug.current)) ?? 0;

  // Topic words: title + tags + excerpt, minus words common to the whole locale
  // ("ai", "token", "the"), which would make every pair look related.
  const df = new Map<string, number>();
  for (const p of sources) for (const w of new Set(tokens(topicText(p)))) df.set(w, (df.get(w) ?? 0) + 1);
  const common = (w: string) => (df.get(w) ?? 0) > COMMON_SHARE * sources.length || w.length < 3;
  const topic = new Map(sources.map(p => [p._id, new Set(tokens(topicText(p)).filter(w => !common(w)))]));

  const cap = Math.max(4, Math.ceil((PER_PAGE * sources.length) / Math.max(1, eligible.length)) + 2);
  const picks = new Map<string, number>();
  const bySlug = new Map<string, RelatedSource[]>();

  for (const src of sources) {
    const srcTags = new Set((src.tags ?? []).map(t => t.toLowerCase()));
    const scored = eligible
      .filter(c => c._id !== src._id && c.slug.current !== src.slug.current && (picks.get(c._id) ?? 0) < cap)
      .map(c => {
        const shared = (c.tags ?? []).filter(t => srcTags.has(t.toLowerCase())).length;
        const picked = picks.get(c._id) ?? 0;
        const inbound = inboundOf(c) + picked;
        const score =
          (src.category && c.category === src.category ? 1000 : 0) +
          30 * shared +
          TOPIC_WEIGHT * jaccard(topic.get(src._id)!, topic.get(c._id)!) +
          (inbound <= 1 ? 40 : 0) +
          8 * Math.log2(1 + (impressions.get(pathOf(lang, c.slug.current)) ?? 0)) -
          15 * picked;
        return { c, score };
      })
      .sort((a, b) => b.score - a.score || a.c.slug.current.localeCompare(b.c.slug.current));
    const chosen = scored.slice(0, PER_PAGE).map(s => s.c);
    for (const c of chosen) picks.set(c._id, (picks.get(c._id) ?? 0) + 1);
    bySlug.set(src.slug.current, chosen);
  }

  // Before/after, for the build log: the old rule versus this plan.
  const newest = (list: RelatedSource[]) => [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || (a.articleNumber ?? 0) - (b.articleNumber ?? 0));
  const oldPicks = new Map<string, number>();
  for (const src of sources) {
    const pool = newest(sources.filter(p => p._id !== src._id));
    const same = pool.filter(p => src.category && p.category === src.category).slice(0, PER_PAGE);
    const fill = pool.filter(p => !same.includes(p)).slice(0, PER_PAGE - same.length);
    for (const c of [...same, ...fill]) oldPicks.set(c._id, (oldPicks.get(c._id) ?? 0) + 1);
  }
  const summary = (m: Map<string, number>) => {
    const counts = sources.map(p => m.get(p._id) ?? 0).sort((a, b) => a - b);
    const orphans = sources.filter(p => inboundOf(p) + (m.get(p._id) ?? 0) <= 1).length;
    return `max ${counts.at(-1) ?? 0}, median ${counts[Math.floor(counts.length / 2)] ?? 0}, never picked ${counts.filter(n => n === 0).length}, ≤1 inbound ${orphans}`;
  };
  const stats = `[related] ${lang}: ${sources.length} posts, ${sources.length - eligible.length} thin (skipped as picks), cap ${cap} · before: ${summary(oldPicks)} · after: ${summary(picks)}`;
  return { bySlug, stats };
}
