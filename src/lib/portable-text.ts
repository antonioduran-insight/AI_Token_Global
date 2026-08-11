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

function boundaryNeedsSpace(left: string, right: string): boolean {
  if (!left || !right) return false;
  // Already separated — never create a double space.
  if (/[\s ]$/u.test(left) || /^[\s ]/u.test(right)) return false;
  if (NEVER_SPACE_AFTER.test(left)) return false;
  return NEEDS_SPACE_AFTER.test(left) && NEEDS_SPACE_BEFORE.test(right);
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
export function repairSpanSpacing<T>(blocks: T): T {
  if (Array.isArray(blocks)) return blocks.map(repairBlock) as unknown as T;
  return blocks;
}

function repairBlock(block: any): any {
  if (!block || block._type !== 'block' || !Array.isArray(block.children)) return block;

  const children = block.children.map((child: any) => child);
  let changed = false;

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

export interface RenderOptions {
  /** Inline style applied to `<strong>`. Some pages tint bold text. */
  strongStyle?: string;
  /** Inline style applied to `<a>`. */
  linkStyle?: string;
  /** Extra serializers merged in — block styles, custom types, list items. */
  components?: Record<string, any>;
}

/**
 * Render portable text to HTML with span spacing repaired first.
 *
 * Every page renders through here so the repair cannot be forgotten on a new
 * page, and so there is one place to change if the marks config needs to move.
 */
export function renderPortableText(blocks: any[] | undefined, options: RenderOptions = {}): string {
  if (!blocks?.length) return '';
  const { strongStyle, linkStyle, components = {} } = options;
  const { marks: extraMarks, ...restComponents } = components;

  return toHTML(repairSpanSpacing(blocks), {
    components: {
      marks: {
        strong: ({ children }: any) => `<strong${strongStyle ? ` style="${strongStyle}"` : ''}>${children}</strong>`,
        em: ({ children }: any) => `<em>${children}</em>`,
        link: ({ value, children }: any) => {
          const href = value?.href ?? '#';
          const external = typeof href === 'string' && href.startsWith('http');
          return `<a href="${href}"${linkStyle ? ` style="${linkStyle}"` : ''} target="${external ? '_blank' : '_self'}" rel="noopener noreferrer">${children}</a>`;
        },
        ...(extraMarks ?? {}),
      },
      ...restComponents,
    },
  });
}
