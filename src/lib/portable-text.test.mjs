/**
 * Tests for the portable-text span-spacing repair.
 *
 *   npm test
 *
 * Node's built-in runner; no framework. `.ts` is imported directly — Node strips
 * the types, so the tests exercise the shipped implementation rather than a copy.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repairSpanSpacing, renderPortableText, headingAnchors, countWords, blockText, withTrailingSlash } from './portable-text.ts';

/** Build a portable-text block from [text, marks] pairs. */
const block = (...spans) => ({
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: spans.map(([text, marks = []], i) => ({ _type: 'span', _key: `k${i}`, text, marks })),
});

/** The plain text a block renders to, spans joined. */
const flatten = b => b.children.map(c => c.text).join('');

const repair = b => flatten(repairSpanSpacing([b])[0]);

test('restores the space dropped between two unmarked spans', () => {
  // The reported /en/gemini-api paragraph. Marks were stripped from the data too,
  // which is why the rule cannot key off marks.
  const b = block(
    ['If you’re not yet familiar with how tokens work, read'],
    ['AI Token Basics'],
    ['and'],
    ['Gemini Token Cost Calculation'],
    ['before comparing prices.'],
  );
  assert.equal(
    repair(b),
    'If you’re not yet familiar with how tokens work, read AI Token Basics and Gemini Token Cost Calculation before comparing prices.',
  );
});

test('restores the space around a bold run', () => {
  const b = block(['Cada llamada se factura en tokens:'], ['tokens de entrada', ['strong']], ['(lo que envías)']);
  assert.equal(repair(b), 'Cada llamada se factura en tokens: tokens de entrada (lo que envías)');
});

test('never inserts a space before closing punctuation', () => {
  assert.equal(repair(block(['a settled conclusion', ['strong']], ['.'])), 'a settled conclusion.');
  assert.equal(repair(block(['Token Limit Again”', ['link']], [', reorganized'])), 'Token Limit Again”, reorganized');
  assert.equal(repair(block(['TechStartups', ['link']], ['), and their'])), 'TechStartups), and their');
  assert.equal(repair(block(['?v=4k3RreudH24', ['link']], ['. The Bloomberg'])), '?v=4k3RreudH24. The Bloomberg');
});

test('leaves a mid-construct boundary alone', () => {
  assert.equal(repair(block(['multi-'], ['model'])), 'multi-model');
  assert.equal(repair(block(['$'], ['2.00'])), '$2.00');
  assert.equal(repair(block(['input/'], ['output'])), 'input/output');
});

test('does not create a double space where spacing was already correct', () => {
  assert.equal(repair(block(['start with '], ['AI Token Basics', ['strong']], [' first.'])), 'start with AI Token Basics first.');
  assert.equal(repair(block(['read'], [' AI Token Basics'])), 'read AI Token Basics');
  assert.equal(repair(block(['read '], ['AI Token Basics'])), 'read AI Token Basics');
});

test('is idempotent', () => {
  const b = block(['tokens work, read'], ['AI Token Basics'], ['and'], ['more.']);
  const once = repairSpanSpacing([b]);
  const twice = repairSpanSpacing(once);
  assert.equal(flatten(twice[0]), flatten(once[0]));
});

test('does not mutate the input', () => {
  const b = block(['tokens work, read'], ['AI Token Basics']);
  const before = JSON.stringify(b);
  repairSpanSpacing([b]);
  assert.equal(JSON.stringify(b), before);
});

test('puts the space outside a mark, never inside it', () => {
  const marked = repairSpanSpacing([block(['read'], ['AI Token Basics', ['link']])])[0];
  assert.equal(marked.children[1].text, 'AI Token Basics', 'link text must not gain whitespace');
  assert.equal(marked.children[0].text, 'read ');

  const trailing = repairSpanSpacing([block(['AI Token Basics', ['strong']], ['first.'])])[0];
  assert.equal(trailing.children[0].text, 'AI Token Basics', 'bold run must not gain whitespace');
  assert.equal(trailing.children[1].text, ' first.');
});

// ── Non-spacing scripts ────────────────────────────────────────────────────────
// \p{L} matches Han, Hiragana, Katakana, Hangul and Thai. Those scripts do not
// separate words with spaces, so the repair must not fire at their boundaries.
// zh-CN is on the roadmap and Chinese already appears inside English articles.

test('leaves Chinese span boundaries untouched', () => {
  const b = block(
    ['使用 AI 模型时，你需要了解'],   // 使用 AI 模型时，你需要了解
    ['输入代币', ['strong']],                                      // 输入代币
    ['和'],                                                                     // 和
    ['输出代币', ['strong']],                                      // 输出代币
    ['的区别。'],                                                   // 的区别。
  );
  const expected = '使用 AI 模型时，你需要了解输入代币和输出代币的区别。';
  assert.equal(repair(b), expected, 'no space may be inserted between Chinese spans');
  assert.ok(!repair(b).includes(' 输'), 'no space before a Han character');
});

test('leaves a Chinese phrase quoted inside English alone', () => {
  // The boundary is Latin on one side, Han on the other. Skipping is the safe
  // call: a wrong space inside CJK text is worse than a missing thin space.
  const b = block(['The Chinese term is'], ['代币', ['strong']], ['。']);
  assert.equal(repair(b), 'The Chinese term is代币。');
});

test('leaves Japanese, Korean and Thai boundaries untouched', () => {
  assert.equal(repair(block(['トークンの'], ['料金', ['strong']])), 'トークンの料金');
  assert.equal(repair(block(['토큰'], ['가격', ['strong']])), '토큰가격');
  assert.equal(repair(block(['ค่าโทเคน'], ['สำหรับ', ['strong']])), 'ค่าโทเคนสำหรับ');
});

test('still repairs Latin boundaries on a page that also contains Chinese', () => {
  // A zh-CN page quoting model names must still get its Latin spacing fixed.
  const b = block(['比较'], ['Claude Opus 5'], ['and'], ['Gemini 3.1 Pro'], ['的价格。']);
  assert.equal(repair(b), '比较Claude Opus 5 and Gemini 3.1 Pro的价格。');
});

test('leaves the spacing-relevant scripts we do serve working', () => {
  // Vietnamese is Latin with diacritics — it takes spaces and must be repaired.
  assert.equal(
    repair(block(['hãy đọc'], ['Kiến Thức Cơ Bản', ['link']], ['trước.'])),
    'hãy đọc Kiến Thức Cơ Bản trước.',
  );
  assert.equal(repair(block(['bacalah'], ['Dasar-Dasar Token AI', ['strong']])), 'bacalah Dasar-Dasar Token AI');
});

test('ignores non-span children and short blocks', () => {
  assert.deepEqual(repairSpanSpacing(undefined), undefined);
  assert.deepEqual(repairSpanSpacing([]), []);
  const img = { _type: 'image', asset: { url: 'x' } };
  assert.deepEqual(repairSpanSpacing([img]), [img]);
  assert.equal(repair(block(['only one span'])), 'only one span');
});

// ── Nodes the renderer cannot use ──────────────────────────────────────────────
// The library's defaults write "Unknown block type …, specify a component for it
// in the `components.types` option" into the page. That message is for us; it
// must never ship. 90 occurrences of it reached production via `imagePrompt`.

const WARNING_TEXT = /Unknown block type|specify a component/;

test('an unrecognised block type renders nothing, not a warning', () => {
  // Real shape from post/en/ai-token-usage-dashboard-interpreter: art-direction
  // notes for illustrating the article, never meant for readers.
  const html = renderPortableText([
    { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'Before.', marks: [] }] },
    { _type: 'imagePrompt', _key: 'or29pfog', text: 'Token flow diagram showing input, processing, and output' },
    { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'After.', marks: [] }] },
  ], { source: 'post/en/test-fixture' });

  assert.doesNotMatch(html, WARNING_TEXT, 'no serializer warning may reach the page');
  assert.ok(!html.includes('Token flow diagram'), 'the prompt text itself must not render');
  assert.equal(html, '<p>Before.</p><p>After.</p>');
});

test('no unknown type can leak, whatever it is called', () => {
  for (const type of ['imagePrompt', 'somethingNobodyAddedYet', 'videoPrompt', 'internalNote']) {
    const html = renderPortableText([{ _type: type, text: 'scaffolding' }], { source: 'post/en/test-fixture' });
    assert.doesNotMatch(html, WARNING_TEXT, `${type} leaked a warning`);
    assert.equal(html, '', `${type} rendered something`);
  }
});

test('an unknown mark keeps its text and loses only the styling', () => {
  // Dropping the node would delete a reader's sentence over a presentation detail.
  const html = renderPortableText([{
    _type: 'block', style: 'normal', markDefs: [],
    children: [
      { _type: 'span', text: 'keep ', marks: [] },
      { _type: 'span', text: 'this text', marks: ['someUnregisteredMark'] },
    ],
  }], { source: 'post/en/test-fixture' });
  assert.doesNotMatch(html, WARNING_TEXT);
  assert.ok(html.includes('this text'), 'text under an unknown mark must survive');
});

test('an unknown block style keeps its text', () => {
  const html = renderPortableText([{
    _type: 'block', style: 'someUnregisteredStyle', markDefs: [],
    children: [{ _type: 'span', text: 'still readable', marks: [] }],
  }], { source: 'post/en/test-fixture', components: { block: { normal: ({ children }) => `<p>${children}</p>` } } });
  assert.doesNotMatch(html, WARNING_TEXT);
  assert.ok(html.includes('still readable'));
});

test('recovers a span whose text is an array instead of a string', () => {
  // post/en/ai-token-basics-for-beginners body[14] — three pricing tiers
  // flattened into one span. The serializer could not read it, so all three
  // vanished from the article.
  const tiers = [
    'Tier 1: 10 tokens/second ($0.01/token)',
    'Tier 2: 100 tokens/second ($0.005/token)',
    'Tier 3: 1,000 tokens/second ($0.001/token)',
  ];
  const html = renderPortableText([{
    _type: 'block', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 'bgy4aea5c', text: tiers, marks: [] }],
  }], { source: 'post/en/test-fixture' });

  assert.doesNotMatch(html, WARNING_TEXT);
  for (const tier of tiers) assert.ok(html.includes(tier), `lost: ${tier}`);
});

test('a span with a text type we cannot use renders empty, not a warning', () => {
  const html = renderPortableText([{
    _type: 'block', style: 'normal', markDefs: [],
    children: [{ _type: 'span', text: { nope: true }, marks: [] }],
  }], { source: 'post/en/test-fixture' });
  assert.doesNotMatch(html, WARNING_TEXT);
  assert.equal(html, '<p></p>');
});

test('span normalisation does not mutate the input', () => {
  const block = {
    _type: 'block', style: 'normal', markDefs: [],
    children: [{ _type: 'span', text: ['a', 'b'], marks: [] }],
  };
  const before = JSON.stringify(block);
  repairSpanSpacing([block], 'post/en/test-fixture');
  assert.equal(JSON.stringify(block), before);
});

// ── withTrailingSlash ─────────────────────────────────────────────────────

test('withTrailingSlash adds the slash to a site-internal path', () => {
  assert.equal(withTrailingSlash('/en/blog'), '/en/blog/');
  assert.equal(withTrailingSlash('/en/blog/a-post'), '/en/blog/a-post/');
});

test('withTrailingSlash leaves a path that already has one', () => {
  assert.equal(withTrailingSlash('/en/blog/'), '/en/blog/');
});

test('withTrailingSlash keeps a query string or fragment on the end', () => {
  assert.equal(withTrailingSlash('/en/api-compare#pricing'), '/en/api-compare/#pricing');
  assert.equal(withTrailingSlash('/en/api-compare?tab=text'), '/en/api-compare/?tab=text');
});

test('withTrailingSlash leaves files, external and protocol-relative links alone', () => {
  assert.equal(withTrailingSlash('/en/rss.xml'), '/en/rss.xml');
  assert.equal(withTrailingSlash('/og-image.png'), '/og-image.png');
  assert.equal(withTrailingSlash('https://openai.com/api/pricing'), 'https://openai.com/api/pricing');
  assert.equal(withTrailingSlash('//cdn.example/x'), '//cdn.example/x');
  assert.equal(withTrailingSlash('mailto:hello@example.com'), 'mailto:hello@example.com');
  assert.equal(withTrailingSlash('#pricing'), '#pricing');
});

// ── Heading anchors ───────────────────────────────────────────────────────

const heading = (style, text) => ({
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _type: 'span', text, marks: [] }],
});

test('headingAnchors lists h2s and gives both h2 and h3 matching ids', () => {
  const blocks = [
    heading('h2', 'Who we are'),
    heading('h3', 'Contact details'),
    heading('h2', 'What we collect, and when'),
    heading('normal', 'Body copy.'),
  ];
  const { headings, components } = headingAnchors(blocks);
  assert.deepEqual(headings, [
    { id: 'who-we-are', text: 'Who we are' },
    { id: 'what-we-collect-and-when', text: 'What we collect, and when' },
  ]);

  // The render pass must reproduce the same ids, in document order.
  const rendered = blocks
    .filter(b => b.style === 'h2' || b.style === 'h3')
    .map(b => components.block[b.style]({ value: b, children: blockText(b) }));
  assert.equal(rendered[0], '<h2 id="who-we-are">Who we are</h2>');
  assert.equal(rendered[1], '<h3 id="contact-details">Contact details</h3>');
  assert.equal(rendered[2], '<h2 id="what-we-collect-and-when">What we collect, and when</h2>');
});

test('headingAnchors de-duplicates repeated headings the same way in both passes', () => {
  const blocks = [heading('h2', 'Overview'), heading('h2', 'Overview')];
  const { headings, components } = headingAnchors(blocks);
  assert.deepEqual(headings.map(h => h.id), ['overview', 'overview-2']);
  const rendered = blocks.map(b => components.block.h2({ value: b, children: 'Overview' }));
  assert.equal(rendered[1], '<h2 id="overview-2">Overview</h2>');
});

test('headingAnchors does not let an empty heading shift the ids after it', () => {
  const blocks = [heading('h2', ''), heading('h2', 'Real section')];
  const { headings, components } = headingAnchors(blocks);
  assert.deepEqual(headings, [{ id: 'real-section', text: 'Real section' }]);
  assert.equal(components.block.h2({ value: blocks[0], children: '' }), '<h2></h2>');
  assert.equal(
    components.block.h2({ value: blocks[1], children: 'Real section' }),
    '<h2 id="real-section">Real section</h2>'
  );
});

test('headingAnchors on a document with no headings yields no sidebar', () => {
  assert.deepEqual(headingAnchors([heading('normal', 'Just prose.')]).headings, []);
  assert.deepEqual(headingAnchors(undefined).headings, []);
});

// ── Word count ────────────────────────────────────────────────────────────

test('countWords counts text blocks only', () => {
  assert.equal(countWords([heading('normal', 'one two three'), { _type: 'image', asset: {} }]), 3);
  assert.equal(countWords(undefined), 0);
});
