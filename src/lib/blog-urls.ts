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
