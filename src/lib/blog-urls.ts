import type { PostAlternate } from './sanity.ts';
import type { Alternate } from './hreflang.ts';
import type { Lang } from '../i18n/index.ts';

/**
 * Blog post paths, in one place.
 *
 * Built by concatenation rather than as a template literal, and deliberately kept
 * out of the page's frontmatter: @astrojs/compiler 4.0.0 has an offset bug that a
 * slash-heavy template literal in `.astro` frontmatter can trip, after which it
 * leaves frontmatter code inside the component function and the build dies with
 * `Unexpected "export"` against an unrelated line number. Plain .ts is never
 * parsed by that compiler, so the paths are safe here.
 * `scripts/check-astro-compile.mjs` guards the pages themselves.
 */
const SEPARATOR = '/';
const BLOG_SEGMENT = 'blog';

/** `/en/blog/my-post/` — leading and trailing slash, matching the built output. */
export function postPath(lang: string, slug: string): string {
  return SEPARATOR + lang + SEPARATOR + BLOG_SEGMENT + SEPARATOR + slug + SEPARATOR;
}

/** The hreflang alternates for a post, as BaseLayout wants them. */
export function postAlternates(alternates: PostAlternate[]): Alternate[] {
  return alternates.map(alternate => ({
    lang: alternate.lang as Lang,
    path: postPath(alternate.lang, alternate.slug),
  }));
}

/**
 * Posts that share one URL (same language and slug). A static build can only
 * write one page per path, so all but one of them are unreachable, and the
 * page silently mixes documents: the body comes from whichever post the slug
 * query returns, the hreflang from whichever cluster is processed last. Each
 * entry lists the colliding _ids, sorted, so the message is stable.
 */
export function duplicateSlugs(posts: { _id: string; slug: string; lang: string }[]): { path: string; ids: string[] }[] {
  const byPath = new Map<string, string[]>();
  for (const p of posts) {
    const path = postPath(p.lang, p.slug);
    byPath.set(path, [...(byPath.get(path) ?? []), p._id]);
  }
  return [...byPath]
    .filter(([, ids]) => ids.length > 1)
    .map(([path, ids]) => ({ path, ids: ids.sort() }))
    .sort((a, b) => a.path.localeCompare(b.path));
}
