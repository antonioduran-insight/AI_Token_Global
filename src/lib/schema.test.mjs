/**
 * Tests for the JSON-LD builders.
 *
 *   npm test
 *
 * The rule these protect: a field with no real source is omitted, never guessed
 * and never emitted empty. Most of the assertions below are absence assertions
 * for exactly that reason.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  articleSchema,
  breadcrumbSchema,
  buildBreadcrumbs,
  faqPageSchema,
  organizationSchema,
  portableTextToPlain,
  pruneJsonLd,
  serializeJsonLd,
} from './schema.ts';

const ORIGIN = 'https://www.aitoken.global';
/** Stand-in for useTranslations: echoes the key back when it is missing, as it does. */
const t = key => ({
  'common.home': 'Home',
  'nav.blog': 'Blog',
  'nav.tokenCalculator': 'Token Calculator',
}[key] ?? key);

// ── pruneJsonLd ───────────────────────────────────────────────────────────

test('pruneJsonLd drops undefined, null, blank strings and empty containers', () => {
  const pruned = pruneJsonLd({
    keep: 'yes',
    undef: undefined,
    nul: null,
    blank: '',
    spaces: '   ',
    emptyList: [],
    emptyObject: {},
    nested: { blank: '', kept: 'x' },
    listWithHoles: ['a', '', null, 'b'],
  });
  assert.deepEqual(pruned, {
    keep: 'yes',
    nested: { kept: 'x' },
    listWithHoles: ['a', 'b'],
  });
});

test('pruneJsonLd drops an object left empty by its own pruning', () => {
  // Nothing survived, so the whole block disappears — BaseLayout filters those out
  // rather than writing an empty <script type="application/ld+json">.
  assert.equal(pruneJsonLd({ outer: { inner: '' } }), undefined);
  assert.equal(pruneJsonLd({ outer: { inner: '' }, kept: 'x' }).outer, undefined);
});

test('pruneJsonLd keeps a reference node that carries only an @id', () => {
  const pruned = pruneJsonLd({ publisher: { '@id': `${ORIGIN}/#organization` } });
  assert.deepEqual(pruned.publisher, { '@id': `${ORIGIN}/#organization` });
});

test('pruneJsonLd keeps falsy values that carry meaning', () => {
  const pruned = pruneJsonLd({ position: 0, flag: false });
  assert.equal(pruned.position, 0);
  assert.equal(pruned.flag, false);
});

// ── Organization ──────────────────────────────────────────────────────────

test('organizationSchema states only what is on record', () => {
  const org = organizationSchema(ORIGIN);
  assert.equal(org['@type'], 'Organization');
  assert.equal(org.name, 'AI Token King');
  assert.deepEqual(org.sameAs, ['https://www.linkedin.com/company/ai-token-king']);
  assert.equal(org.logo, `${ORIGIN}/logo.png`);
  for (const invented of ['foundingDate', 'address', 'numberOfEmployees', 'telephone', 'email']) {
    assert.equal(org[invented], undefined, `${invented} has no source and must not be emitted`);
  }
});

// ── Article ───────────────────────────────────────────────────────────────

const article = overrides => articleSchema({
  siteOrigin: ORIGIN,
  url: `${ORIGIN}/en/blog/a-post/`,
  headline: 'A post',
  description: 'What it says.',
  datePublished: '2026-06-03T09:00:00Z',
  dateModified: '2026-07-11T14:20:00Z',
  imageUrl: 'https://cdn.example/cover.png',
  inLanguage: 'en-US',
  ...overrides,
});

test('articleSchema never emits an author, because there is no author data', () => {
  assert.equal('author' in article(), false);
});

test('articleSchema omits image and description when the post has neither', () => {
  const built = article({ imageUrl: undefined, description: undefined });
  assert.equal('image' in built, false);
  assert.equal('description' in built, false);
  // The dates and the publisher reference still stand.
  assert.equal(built.datePublished, '2026-06-03T09:00:00Z');
  assert.deepEqual(built.publisher, { '@id': `${ORIGIN}/#organization` });
});

test('articleSchema omits dateModified when Sanity has no _updatedAt', () => {
  assert.equal('dateModified' in article({ dateModified: undefined }), false);
});

// ── BreadcrumbList ────────────────────────────────────────────────────────

test('buildBreadcrumbs names a post trail from the nav labels plus the title', () => {
  const crumbs = buildBreadcrumbs({
    pathname: '/en/blog/a-post/',
    lang: 'en',
    siteOrigin: ORIGIN,
    t,
    leafLabel: 'A post',
  });
  assert.deepEqual(crumbs, [
    { name: 'Home', url: `${ORIGIN}/en/` },
    { name: 'Blog', url: `${ORIGIN}/en/blog/` },
    { name: 'A post', url: `${ORIGIN}/en/blog/a-post/` },
  ]);
});

test('buildBreadcrumbs gives the locale home page no trail of its own', () => {
  assert.deepEqual(buildBreadcrumbs({ pathname: '/en/', lang: 'en', siteOrigin: ORIGIN, t }), []);
});

test('buildBreadcrumbs refuses a trail it cannot name rather than showing a slug', () => {
  // No leafLabel and no i18n entry for the segment: emit nothing.
  assert.deepEqual(
    buildBreadcrumbs({ pathname: '/en/some-new-page/', lang: 'en', siteOrigin: ORIGIN, t }),
    []
  );
});

test('buildBreadcrumbs ignores a path outside the current locale', () => {
  assert.deepEqual(buildBreadcrumbs({ pathname: '/404', lang: 'en', siteOrigin: ORIGIN, t }), []);
});

test('breadcrumbSchema needs at least two crumbs to say anything', () => {
  assert.equal(breadcrumbSchema([{ name: 'Home', url: `${ORIGIN}/en/` }]), null);
  const built = breadcrumbSchema([
    { name: 'Home', url: `${ORIGIN}/en/` },
    { name: 'Blog', url: `${ORIGIN}/en/blog/` },
  ]);
  assert.equal(built['@type'], 'BreadcrumbList');
  assert.deepEqual(built.itemListElement.map(i => i.position), [1, 2]);
});

// ── FAQPage ───────────────────────────────────────────────────────────────

const answer = text => [{
  _type: 'block',
  style: 'normal',
  children: [{ _type: 'span', text, marks: [] }],
}];

test('faqPageSchema returns null for a page with no FAQ content', () => {
  assert.equal(faqPageSchema(undefined, 'test'), null);
  assert.equal(faqPageSchema([], 'test'), null);
});

test('faqPageSchema drops an entry missing its question or its answer', () => {
  const built = faqPageSchema([
    { question: 'What is a token?', answer: answer('A chunk of text.') },
    { question: '', answer: answer('Orphan answer.') },
    { question: 'Unanswered?', answer: [] },
  ], 'test');
  assert.equal(built.mainEntity.length, 1);
  assert.equal(built.mainEntity[0].name, 'What is a token?');
  assert.equal(built.mainEntity[0].acceptedAnswer.text, 'A chunk of text.');
});

test('faqPageSchema returns null when every entry is unusable', () => {
  assert.equal(faqPageSchema([{ question: 'Q?', answer: [] }], 'test'), null);
});

// ── portableTextToPlain ───────────────────────────────────────────────────

test('portableTextToPlain joins blocks and repairs dropped span spacing', () => {
  const blocks = [{
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      { _type: 'span', text: 'read', marks: [] },
      { _type: 'span', text: 'AI Token Basics', marks: ['strong'] },
      { _type: 'span', text: 'before comparing.', marks: [] },
    ],
  }];
  assert.equal(portableTextToPlain(blocks, 'test'), 'read AI Token Basics before comparing.');
});

test('portableTextToPlain returns an empty string for nothing usable', () => {
  assert.equal(portableTextToPlain(undefined), '');
  assert.equal(portableTextToPlain([]), '');
  assert.equal(portableTextToPlain([{ _type: 'image', asset: {} }]), '');
});

// ── Emission ──────────────────────────────────────────────────────────────

test('serializeJsonLd escapes < so content cannot close the script tag', () => {
  const json = serializeJsonLd({ text: 'use </script> carefully' });
  assert.equal(json.includes('</script>'), false);
  assert.equal(JSON.parse(json).text, 'use </script> carefully');
});
