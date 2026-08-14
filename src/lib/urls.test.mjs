/**
 * Tests for blog post paths and the hreflang route registry.
 *
 *   npm test
 *
 * The rule these protect: an hreflang link is emitted only for a page the build
 * actually produces. Guessing one was what put 1,511 dead alternates on the site.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postAlternates, postPath } from './blog-urls.ts';
import { LOCALIZED_ROUTES, localizedRouteKey, staticPageAlternates } from './hreflang.ts';

// ── Blog paths ────────────────────────────────────────────────────────────

test('postPath matches the directory the build writes', () => {
  assert.equal(postPath('en', 'a-post'), '/en/blog/a-post/');
  assert.equal(postPath('vi', 'bai-viet'), '/vi/blog/bai-viet/');
});

test('postAlternates turns a translation cluster into hreflang entries', () => {
  const alternates = postAlternates([
    { lang: 'en', slug: 'cheap-ai-tokens-total-cost-calculations' },
    { lang: 'es', slug: 'tokens-de-ia-baratos-costo-total' },
  ]);
  assert.deepEqual(alternates, [
    { lang: 'en', path: '/en/blog/cheap-ai-tokens-total-cost-calculations/' },
    { lang: 'es', path: '/es/blog/tokens-de-ia-baratos-costo-total/' },
  ]);
});

// ── hreflang route registry ───────────────────────────────────────────────

test('the route registry finds the localized pages on disk', () => {
  for (const route of ['/', '/blog/', '/token-calculator/', '/privacy/']) {
    assert.equal(LOCALIZED_ROUTES.has(route), true, `${route} should be a known route`);
  }
});

test('the route registry excludes dynamic routes and endpoints', () => {
  // A blog post's existence per locale is a CMS question, and rss.xml is not a page.
  assert.equal([...LOCALIZED_ROUTES].some(r => r.includes('[')), false);
  assert.equal(LOCALIZED_ROUTES.has('/rss.xml/'), false);
  assert.equal(LOCALIZED_ROUTES.has('/rss.xml'), false);
});

test('localizedRouteKey resolves a static page and rejects everything else', () => {
  assert.equal(localizedRouteKey('/en/token-calculator/', 'en'), '/token-calculator/');
  assert.equal(localizedRouteKey('/en/', 'en'), '/');
  // A blog post is not a static route — the CMS decides which locales have it.
  assert.equal(localizedRouteKey('/en/blog/a-post/', 'en'), null);
  // No locale prefix at all.
  assert.equal(localizedRouteKey('/404', 'en'), null);
  // Locale mismatch.
  assert.equal(localizedRouteKey('/es/privacy/', 'en'), null);
});

const LANGS = ['en', 'es', 'id', 'vi'];

test('staticPageAlternates covers every locale for a static page', () => {
  const alternates = staticPageAlternates('/es/use-cases/', 'es', LANGS);
  assert.deepEqual(alternates.map(a => a.lang).sort(), ['en', 'es', 'id', 'vi']);
  assert.deepEqual(
    alternates.find(a => a.lang === 'vi'),
    { lang: 'vi', path: '/vi/use-cases/' }
  );
});

test('staticPageAlternates emits nothing for a page it cannot vouch for', () => {
  assert.deepEqual(staticPageAlternates('/404', 'en', LANGS), []);
  assert.deepEqual(staticPageAlternates('/en/blog/a-post/', 'en', LANGS), []);
});
