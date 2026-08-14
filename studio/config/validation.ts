/**
 * Shared validation for fields that have to be unique within one language.
 *
 * ── Why ──
 * `articleNumber` is the only field connecting a post to its translations. The
 * schema asked for a required positive integer and nothing more, so nothing
 * stopped two English posts taking the same number — and four numbers ended up
 * shared, across 38 posts. Where that happens the site cannot tell which Spanish
 * post translates which English one, so it emits a self-referencing hreflang and
 * warns, rather than guessing a pair.
 *
 * ── What this can and cannot do ──
 * Sanity validation is a Studio-side check, not a database constraint. It blocks
 * the Publish button and it is what `npx sanity documents validate` runs over a
 * whole dataset, but it does not run for writes through the client API or a
 * dataset import — which is how these posts were created. Scripts that write
 * posts need the same check of their own; `scripts/audit-article-numbers.mjs`
 * catches whatever slips through either way.
 *
 * It is also a point-in-time query, so two editors publishing the same number at
 * the same moment can both pass. Rare, and the audit script finds it.
 */

/** Sanity's validation context, narrowed to what these helpers touch. */
interface UniquenessContext {
  document?: { _id?: string; _type?: string; language?: unknown } | null;
  getClient: (options: { apiVersion: string }) => {
    fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>;
  };
}

const API_VERSION = '2024-01-01';

/**
 * The document being edited, in both its forms. A draft and its published
 * version are two document ids for one post, and neither should count as a
 * conflict with the other.
 */
function selfIds(context: UniquenessContext): string[] {
  const id = context.document?._id ?? '';
  const published = id.replace(/^drafts\./, '');
  return [published, `drafts.${published}`];
}

function languageOf(context: UniquenessContext): string | null {
  const language = context.document?.language;
  return typeof language === 'string' && language ? language : null;
}

/**
 * Rejects an `articleNumber` another post in the same language already holds.
 *
 * Returns valid when no language is chosen yet: the number cannot be checked
 * against a language that isn't set, and the language field's own `required()`
 * already reports that.
 */
export async function validateUniqueArticleNumber(
  value: number | undefined,
  context: UniquenessContext,
): Promise<true | string> {
  if (typeof value !== 'number') return true; // `required()` covers absence
  const language = languageOf(context);
  if (!language) return true;

  const conflicts = await context.getClient({ apiVersion: API_VERSION }).fetch<
    { _id: string; title?: string }[]
  >(
    `*[_type == $type && articleNumber == $value && language == $language && !(_id in $self)][0...3]{ _id, title }`,
    {
      type: context.document?._type ?? 'post',
      value,
      language,
      self: selfIds(context),
    },
  );

  if (conflicts.length === 0) return true;

  const named = conflicts.map(c => c.title?.trim() || c._id).join(', ');
  return (
    `Article number ${value} is already on another ${language} post: ${named}. ` +
    'This number is what links a post to its translations, so it has to be unique ' +
    'within a language — a shared number means the site cannot tell which post is ' +
    'the translation of which, and drops the hreflang link. Use the "Find by #" ' +
    'tool to see what holds a number before picking one.'
  );
}

/**
 * Rejects a slug another post in the same language already holds.
 *
 * A language and a slug together decide the URL, so two documents sharing both
 * are two documents competing for one page: the build writes one over the other
 * and the loser is unreachable. Three slugs are in that state today, one of them
 * held by three documents.
 *
 * Shaped for a slug field's `options.isUnique`, which receives the string and
 * expects a boolean.
 *
 * Note the level: Sanity reports a non-unique slug as a **warning**, so it is
 * visible in the Studio but does not block publishing — unlike the article-number
 * rule above, which is an error. To make it blocking, move this call into a
 * `Rule.custom` on the slug field returning a message instead of `false`.
 */
export async function isSlugUniqueInLanguage(
  slug: string,
  context: UniquenessContext,
): Promise<boolean> {
  const language = languageOf(context);
  if (!language) return true;

  const taken = await context.getClient({ apiVersion: API_VERSION }).fetch<number>(
    `count(*[_type == $type && slug.current == $slug && language == $language && !(_id in $self)])`,
    {
      type: context.document?._type ?? 'post',
      slug,
      language,
      self: selfIds(context),
    },
  );
  return taken === 0;
}
