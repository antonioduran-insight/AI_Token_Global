import { toHTML } from '@portabletext/to-html';

/**
 * Shared portable-text rendering for every Sanity-backed page.
 *
 * ── Why this file exists ──
 * Content in Sanity has spans whose text was split at a boundary with the
 * separating space dropped, so paragraphs render run together:
 *
 *   "…how tokens work, read" + "AI Token Basics" + "and" + "Gemini Token Cost
 *   Calculation" + "before comparing prices."
 *
 * renders as "readAI Token BasicsandGemini Token Cost Calculationbefore
 * comparing prices". The serializer is faithful — the whitespace is missing from
 * the stored data. `repairSpanSpacing` restores it at render time.
 *
 * The repair is mark-agnostic on purpose. It keys off the characters either side
 * of the boundary, not off whether a span carries `strong`, `em` or a link, so
 * every mark combination is covered — including the damaged spans that lost
 * their marks entirely and would be invisible to a mark-level fix.
 *
 * It must not fire at a boundary that is already correct. A bold run followed by
 * a full stop ("…led conclusion" + ".") and a link followed by a comma
 * ("…Limit Again”" + ", reorganized") are both legitimate and common, so the
 * rule refuses to insert a space before closing punctuation.
 */

/**
 * Characters that end a span where a following word still needs separating:
 * word characters and anything that closes a clause.
 */
const NEEDS_SPACE_AFTER = /[\p{L}\p{N}_)\]}»”’%.,:;!?]$/u;

/**
 * Characters that may start a span needing a space in front of it: a word, a
 * currency amount, an opening bracket or quote, or a dash used as a separator.
 */
const NEEDS_SPACE_BEFORE = /^[\p{L}\p{N}_$€£¥([{«“‘¿¡—–]/u;

/**
 * A span ending in one of these is mid-construct — the next span continues it,
 * so no space belongs at the boundary. Covers "multi-" + "model",
 * "$" + "2.00", "input/" + "output", and any opening bracket or quote.
 */
const NEVER_SPACE_AFTER = /[-–—/\\([{«“‘¿¡$€£¥&@#+=~^<>|]$/u;

/**
 * Scripts that do not separate words with spaces. `\p{L}` covers these too, so
 * without this guard the rule would read a Han character as a word character and
 * insert a space at every span boundary — corrupting the text rather than
 * repairing it. zh-CN is on the roadmap, and Chinese already appears inside
 * English articles today.
 *
 * The check is per-character rather than per-locale on purpose. A zh-CN page will
 * quote Latin model names, where a space between two Latin words is still wanted;
 * an English page quoting a Chinese phrase must still be left alone. Keying off
 * the characters at the boundary handles both, and needs no locale threaded
 * through every caller.
 */
const NON_SPACING_SCRIPT = new RegExp(
  '[' +
  '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\p{Script=Hangul}' +
  '\\p{Script=Thai}\\p{Script=Lao}\\p{Script=Khmer}\\p{Script=Myanmar}' +
  '\\p{Script=Tibetan}' +
  '\\u3000-\\u303F' +   // CJK punctuation: 。 、 「 」 【 】
  '\\uFF00-\\uFFEF' +   // fullwidth and halfwidth forms
  ']', 'u');

function boundaryNeedsSpace(left: string, right: string): boolean {
  if (!left || !right) return false;
  // Already separated — never create a double space.
  if (/[\s ]$/u.test(left) || /^[\s ]/u.test(right)) return false;
  // Either side in a non-spacing script: no space belongs at this boundary.
  if (NON_SPACING_SCRIPT.test(left.slice(-1)) || NON_SPACING_SCRIPT.test(right.slice(0, 1))) return false;
  if (NEVER_SPACE_AFTER.test(left)) return false;
  return NEEDS_SPACE_AFTER.test(left) && NEEDS_SPACE_BEFORE.test(right);
}

/**
 * Build-time reporting for content the renderer could not use as stored.
 *
 * The point is that a defect fails loudly for us and silently for readers: the
 * page renders without the library's diagnostic text, and the build log names
 * the document so somebody can fix it in Sanity.
 *
 * Two outcomes are tracked separately, because they are not the same problem.
 * `dropped` is a node that rendered as nothing — it carried no reader content.
 * `recovered` is a node whose content was salvaged and did render; the stored
 * document is still wrong and still needs an edit.
 *
 * Deduplicated per document + kind + detail, because one bad article carries the
 * same defect five times over and five identical lines teach nothing.
 */
type DefectOutcome = 'dropped' | 'recovered';
const reported = new Map<string, { count: number; outcome: DefectOutcome }>();
let summaryArmed = false;

function reportContentDefect(source: string, kind: string, detail: string, outcome: DefectOutcome): void {
  const key = `${source}\u0000${kind}\u0000${detail}`;
  const entry = reported.get(key);
  if (entry) {
    entry.count++;
  } else {
    reported.set(key, { count: 1, outcome });
    console.warn(`[portable-text] ${kind}: ${detail} — in ${source} (${outcome})`);
  }
  if (!summaryArmed && typeof process !== 'undefined' && process.on) {
    summaryArmed = true;
    process.on('exit', () => {
      if (!reported.size) return;
      const tally = (o: DefectOutcome) =>
        [...reported.values()].filter(e => e.outcome === o).reduce((a, e) => a + e.count, 0);
      const dropped = tally('dropped');
      const recovered = tally('recovered');
      const parts = [];
      if (dropped) parts.push(`${dropped} node(s) rendered as nothing`);
      if (recovered) parts.push(`${recovered} node(s) recovered but still malformed in Sanity`);
      console.warn(
        `\n[portable-text] ${parts.join(', ')} — across ${reported.size} document/defect pair(s). Fix them in Sanity.`
      );
    });
  }
}

/**
 * Coerce a span whose `text` is not a string.
 *
 * Four articles store `text` as an array of strings — a bullet list flattened
 * into one span by whatever wrote the document:
 *
 *   text: ["Tier 1: 10 tokens/second ($0.01/token)", "Tier 2: …", "Tier 3: …"]
 *
 * Portable text requires a string there, so the serializer cannot read the span
 * and falls through to its unknown-node path, dropping all three tiers from the
 * article. Joining the entries recovers every character of the real content and
 * invents no markup; the underlying document still wants fixing into a proper
 * list, which is a CMS edit, not a render-time one.
 */
function normalizeSpanText(child: any, source: string): any {
  if (!child || child._type !== 'span' || typeof child.text === 'string') return child;

  if (Array.isArray(child.text) && child.text.every((t: unknown) => typeof t === 'string')) {
    reportContentDefect(source, 'span.text was an array', `${child.text.length} entries joined`, 'recovered');
    return { ...child, text: child.text.join(' ') };
  }
  reportContentDefect(source, 'span.text was not a string', typeof child.text, 'dropped');
  return { ...child, text: '' };
}

/**
 * Restore the space dropped between two adjacent spans.
 *
 * Pure: returns new block/child objects and never mutates the input, so the
 * same fetched document can be rendered more than once. Idempotent — a boundary
 * that already has whitespace is left alone.
 *
 * The space is added to whichever side carries no marks, so it does not end up
 * inside a bold run or a link's clickable text. When both sides are marked it
 * goes on the right.
 */
export function repairSpanSpacing<T>(blocks: T, source = 'unknown document'): T {
  if (Array.isArray(blocks)) return blocks.map(b => repairBlock(b, source)) as unknown as T;
  return blocks;
}

function repairBlock(block: any, source: string): any {
  if (!block || block._type !== 'block' || !Array.isArray(block.children)) return block;

  // Malformed spans are normalised first, so the spacing pass below sees strings.
  const children = block.children.map((child: any) => normalizeSpanText(child, source));
  let changed = children.some((c: any, i: number) => c !== block.children[i]);

  for (let i = 0; i < children.length - 1; i++) {
    const left = children[i];
    const right = children[i + 1];
    if (typeof left?.text !== 'string' || typeof right?.text !== 'string') continue;
    if (!boundaryNeedsSpace(left.text, right.text)) continue;

    const leftMarked = (left.marks?.length ?? 0) > 0;
    const rightMarked = (right.marks?.length ?? 0) > 0;
    if (leftMarked && !rightMarked) {
      children[i + 1] = { ...right, text: ' ' + right.text };
    } else if (!leftMarked && rightMarked) {
      children[i] = { ...left, text: left.text + ' ' };
    } else {
      children[i + 1] = { ...right, text: ' ' + right.text };
    }
    changed = true;
  }

  return changed ? { ...block, children } : block;
}

/** The plain text of one portable-text block, marks and all. */
export function blockText(block: any): string {
  if (!Array.isArray(block?.children)) return '';
  return block.children.map((child: any) => child?.text ?? '').join('');
}

/** Words across every text block, for reading-time estimates. */
export function countWords(blocks: any[] | undefined): number {
  let total = 0;
  for (const block of blocks ?? []) {
    if (block?._type !== 'block') continue;
    const text = blockText(block).trim();
    if (text) total += text.split(/\s+/).filter(Boolean).length;
  }
  return total;
}

/**
 * A slug generator that de-duplicates within one document: a second "Overview"
 * becomes `overview-2`, so two headings never share an anchor.
 */
export function createSlugger(): (text: string) => string {
  const used = new Set<string>();
  return function slugify(text: string): string {
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
    let slug = base || 'section';
    let n = 2;
    while (used.has(slug)) slug = `${base}-${n++}`;
    used.add(slug);
    return slug;
  };
}

export interface HeadingAnchors {
  /** Headings in document order, for a table of contents. */
  headings: { id: string; text: string }[];
  /** Serializers that stamp the matching `id` on each heading as it renders. */
  components: Record<string, any>;
}

/**
 * Headings and the serializers that anchor them, from one pass over the document.
 *
 * The two must agree or every sidebar link points at nothing, which is why they
 * are produced together: the collect pass and the render pass each get their own
 * slugger, fed the same headings in the same order, so they land on the same ids.
 *
 * `tocStyles` is what the sidebar lists; `anchorStyles` is what gets an id. They
 * differ on purpose — a deep h3 is worth linking to from the body but would bury
 * the sidebar.
 */
export function headingAnchors(
  blocks: any[] | undefined,
  { tocStyles = ['h2'], anchorStyles = ['h2', 'h3'] }: { tocStyles?: string[]; anchorStyles?: string[] } = {},
): HeadingAnchors {
  const collect = createSlugger();
  const headings: { id: string; text: string }[] = [];
  for (const block of blocks ?? []) {
    if (block?._type !== 'block' || !anchorStyles.includes(block?.style)) continue;
    const text = blockText(block).trim();
    if (!text) continue;
    const id = collect(text);
    if (tocStyles.includes(block.style)) headings.push({ id, text });
  }

  const render = createSlugger();
  const block: Record<string, any> = {};
  for (const style of anchorStyles) {
    block[style] = ({ value, children }: any) => {
      const text = blockText(value).trim();
      // An empty heading is skipped above, so it must not consume a slug here
      // either — one extra call would shift every later id by one.
      if (!text) return `<${style}>${children}</${style}>`;
      return `<${style} id="${render(text)}">${children}</${style}>`;
    };
  }
  return { headings, components: { block } };
}

/**
 * Serializers for the non-text nodes an article body can hold. Kept beside the
 * renderer so the markup for a figure or a code block is defined once.
 */
export function articleTypeComponents(): Record<string, any> {
  return {
    image: ({ value }: any) => {
      const url = value?.asset?.url ?? value?.url ?? '';
      if (!url) return '';
      const alt = value?.alt ?? '';
      const caption = value?.caption ?? '';
      const figcaption = caption ? `<figcaption>${caption}</figcaption>` : '';
      return `<figure class="article-figure"><img src="${url}" alt="${alt}" />${figcaption}</figure>`;
    },
    codeBlock: ({ value }: any) => {
      const codeLang = value?.language ?? '';
      const code = (value?.code ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre><code class="language-${codeLang}">${code}</code></pre>`;
    },
  };
}

/** A last path segment carrying an extension is a file, not a directory. */
const FILE_SEGMENT = /\/[^/]*\.[a-z0-9]+$/i;

/**
 * Give a site-internal link the trailing slash the rest of the site uses.
 *
 * The build emits `/en/blog/slug/index.html`, so `/en/blog/slug` only reaches the
 * reader through a redirect — and the audit found 248 URLs indexed in their
 * slash-less form, splitting each page's signals in two. Editors writing links in
 * Sanity should not have to remember the convention, so it is applied here.
 *
 * External links, protocol-relative links, and paths ending in a filename are
 * left exactly as authored. A query string or fragment stays on the end.
 */
export function withTrailingSlash(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const [, path, suffix] = /^([^?#]*)([?#].*)?$/.exec(href) as [string, string, string | undefined];
  if (!path || path.endsWith('/') || FILE_SEGMENT.test(path)) return href;
  return `${path}/${suffix ?? ''}`;
}

export interface RenderOptions {
  /** Inline style applied to `<strong>`. Some pages tint bold text. */
  strongStyle?: string;
  /** Inline style applied to `<a>`. */
  linkStyle?: string;
  /** Extra serializers merged in — block styles, custom types, list items. */
  components?: Record<string, any>;
  /**
   * What is being rendered, for build warnings — e.g. `post/en/my-slug`.
   * Only ever reaches the build log, never the page.
   */
  source?: string;
}

/**
 * Render portable text to HTML with span spacing repaired first.
 *
 * Every page renders through here so the repair cannot be forgotten on a new
 * page, and so there is one place to change if the marks config needs to move.
 */
export function renderPortableText(blocks: any[] | undefined, options: RenderOptions = {}): string {
  if (!blocks?.length) return '';
  const { strongStyle, linkStyle, components = {}, source = 'unknown document' } = options;
  const { marks: extraMarks, ...restComponents } = components;

  return toHTML(repairSpanSpacing(blocks, source), {
    components: {
      marks: {
        strong: ({ children }: any) => `<strong${strongStyle ? ` style="${strongStyle}"` : ''}>${children}</strong>`,
        em: ({ children }: any) => `<em>${children}</em>`,
        link: ({ value, children }: any) => {
          const raw = value?.href ?? '#';
          const href = typeof raw === 'string' ? withTrailingSlash(raw) : raw;
          const external = typeof href === 'string' && href.startsWith('http');
          return `<a href="${href}"${linkStyle ? ` style="${linkStyle}"` : ''} target="${external ? '_blank' : '_self'}" rel="noopener noreferrer">${children}</a>`;
        },
        ...(extraMarks ?? {}),
      },

      // ── Nodes this renderer does not recognise ──
      // The library's defaults write "Unknown block type …, specify a component
      // for it in the `components.types` option" into the page. That is a message
      // for us, shipped to readers. These handlers report it to the build log
      // instead and put nothing on the page.
      //
      // An unknown *object* renders as nothing: it carries no text, and the one
      // real case — `imagePrompt`, art-direction notes for illustrating an
      // article — must never have been published in the first place.
      unknownType: ({ value }: any) => {
        reportContentDefect(source, 'unknown block type', `"${value?._type}"`, 'dropped');
        return '';
      },
      // An unknown *mark*, *style* or *list* wraps real text. Dropping it would
      // delete a reader's content over a presentation detail, so the text is kept
      // and only the styling is lost.
      unknownMark: ({ children }: any) => `${children}`,
      unknownBlockStyle: ({ children }: any) => `<p>${children}</p>`,
      unknownList: ({ children }: any) => `<ul>${children}</ul>`,
      unknownListItem: ({ children }: any) => `<li>${children}</li>`,

      ...restComponents,
    },
  });
}
