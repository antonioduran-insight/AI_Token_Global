/**
 * Tests for the per-language `articleNumber` validator.
 *
 *   cd studio && npm test
 *
 * Network-free: the Sanity client is stubbed, so these check the logic and the
 * query parameters rather than the dataset. That is the part worth guarding — a
 * validator whose query quietly matches nothing reports every value as unique and
 * is worse than no validator, because it looks like it is working.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateUniqueArticleNumber } from './validation.ts';

/** A context whose client returns `result` and records what it was asked. */
function stubContext({ document, result }) {
  const calls = [];
  return {
    calls,
    context: {
      document,
      getClient({ apiVersion }) {
        return {
          fetch(query, params) {
            calls.push({ apiVersion, query, params });
            return Promise.resolve(result);
          },
        };
      },
    },
  };
}

const post = (overrides = {}) => ({ _id: 'abc123', _type: 'post', language: 'en', ...overrides });

// ── articleNumber ─────────────────────────────────────────────────────────

test('a number no other post in the language holds is valid', async () => {
  const { context } = stubContext({ document: post(), result: [] });
  assert.equal(await validateUniqueArticleNumber(7, context), true);
});

test('a number another post in the same language holds is rejected, and says which', async () => {
  const { context } = stubContext({
    document: post(),
    result: [{ _id: 'other1', title: 'Calculating AI Token Costs' }],
  });
  const message = await validateUniqueArticleNumber(1, context);
  assert.equal(typeof message, 'string');
  assert.match(message, /already on another en post/);
  assert.match(message, /Calculating AI Token Costs/);
  // The message has to tell an editor how to resolve it, not just refuse, and the
  // Studio already has a "Find by #" tool that lists what holds a number.
  assert.match(message, /Find by #/);
});

test('a conflicting post with no title falls back to its id', async () => {
  const { context } = stubContext({ document: post(), result: [{ _id: 'untitled-doc' }] });
  assert.match(await validateUniqueArticleNumber(1, context), /untitled-doc/);
});

test('the query scopes to the language and excludes the document itself', async () => {
  const { context, calls } = stubContext({ document: post({ _id: 'drafts.abc123' }), result: [] });
  await validateUniqueArticleNumber(42, context);
  assert.equal(calls.length, 1);
  const { query, params } = calls[0];
  assert.match(query, /_type == \$type/);
  assert.match(query, /articleNumber == \$value/);
  assert.match(query, /language == \$language/);
  assert.match(query, /!\(_id in \$self\)/);
  assert.deepEqual(params.self, ['abc123', 'drafts.abc123'],
    'a draft and its published version are one post and must not conflict with each other');
  assert.equal(params.language, 'en');
  assert.equal(params.value, 42);
  assert.equal(params.type, 'post');
});

test('a published document also excludes its own draft', async () => {
  const { context, calls } = stubContext({ document: post({ _id: 'abc123' }), result: [] });
  await validateUniqueArticleNumber(42, context);
  assert.deepEqual(calls[0].params.self, ['abc123', 'drafts.abc123']);
});

test('no number to check means nothing to say — required() covers absence', async () => {
  const { context, calls } = stubContext({ document: post(), result: [] });
  assert.equal(await validateUniqueArticleNumber(undefined, context), true);
  assert.equal(calls.length, 0, 'must not query when there is no value');
});

test('no language chosen yet means the check cannot run and must not guess', async () => {
  const { context, calls } = stubContext({ document: post({ language: undefined }), result: [] });
  assert.equal(await validateUniqueArticleNumber(5, context), true);
  assert.equal(calls.length, 0);
});

test('a blank language is treated as no language', async () => {
  const { context, calls } = stubContext({ document: post({ language: '' }), result: [] });
  assert.equal(await validateUniqueArticleNumber(5, context), true);
  assert.equal(calls.length, 0);
});
