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
import { repairSpanSpacing } from './portable-text.ts';

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
