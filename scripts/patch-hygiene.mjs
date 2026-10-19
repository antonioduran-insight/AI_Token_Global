/**
 * patch-hygiene.mjs
 *
 * Two Sanity hygiene jobs, applied as separate groups:
 *
 *   links      Rewrites internal links in post bodies that use the non-www
 *              host (https://aitoken.global/…) to https://www.aitoken.global/<path>/
 *              with a trailing slash, so each link lands in one hop instead of
 *              two. Only the markDef `href` changes; text, keys, styles, marks
 *              and every other markDef stay identical.
 *   unpublish  Moves the 3 unreachable duplicate-slug posts to draft (Sanity's
 *              unpublish action: nothing is deleted, Publish in the Studio
 *              undoes it). Each shares its locale + slug with a post that is
 *              the one actually rendered, so it has never had a page of its
 *              own, but its articleNumber cluster leaks into hreflang.
 *
 * The plan is generated once (--make-plan) from the live data and committed for
 * review: audits/2026-10-16/hygiene-plan.json. Dry run and --apply both read it.
 *
 * Same safety pattern as patch-accuracy.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs --group links|unpublish and SANITY_TOKEN.
 *   - Guards, per document (any failure skips it, never a partial write):
 *       links:     published at its locale/slug, _rev equals the pinned one,
 *                  every listed markDef still has its "before" href, the new
 *                  target page exists in dist/ (run after a build), and the
 *                  patched body equals the old body with only those hrefs changed.
 *       unpublish: still published at the shared slug, _rev equals the pinned
 *                  one, the reachable twin is still published there, no draft
 *                  exists (unpublishing would replace it), nothing references it.
 *   - --apply backs up each document first (date-stamped folder), then writes
 *     ONE transaction per document: links are pinned with ifRevisionId; unpublish
 *     has no revision precondition in the Actions API, so _rev and draft state
 *     are re-read immediately before the action. Each document is re-read after.
 *   - Every log, backup folder and report is date-stamped.
 *   - --check-dist (after `npm run build`) / --check-live (after the Amplify
 *     rebuild): links: no non-www href left on the 9 pages, every new href
 *     present; unpublish: the shared URLs still render the reachable post, and
 *     every affected page's hreflang equals the expected set in the plan.
 *
 * Usage:
 *   node scripts/patch-hygiene.mjs --make-plan            # once; refuses to overwrite
 *   node scripts/patch-hygiene.mjs [--group links|unpublish]
 *   SANITY_TOKEN=… node scripts/patch-hygiene.mjs --apply --group links
 *   node scripts/patch-hygiene.mjs --check-dist|--check-live [--group …]
 *
 * SANITY_TOKEN: an Editor token from sanity.io/manage → API → Tokens, with an
 * expiry, exported for this run only. Never in .env, never committed.
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const MAKE_PLAN = argv.includes('--make-plan');
const CHECK_DIST = argv.includes('--check-dist');
const CHECK_LIVE = argv.includes('--check-live');
const GROUP = argv.includes('--group') ? argv[argv.indexOf('--group') + 1] : null;
const TOKEN = process.env.SANITY_TOKEN;
if (GROUP !== null && !['links', 'unpublish'].includes(GROUP)) { console.error('--group must be "links" or "unpublish".'); process.exit(1); }
if (APPLY && !GROUP) { console.error('--apply needs --group links or --group unpublish.'); process.exit(1); }
if (APPLY && !TOKEN) { console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).'); process.exit(1); }

const OUT_DIR = 'audits/2026-10-16';
const PLAN = join(OUT_DIR, 'hygiene-plan.json');
const STAMP = new Date().toISOString().replace(/:/g, '').slice(0, 17);
const SITE = 'https://www.aitoken.global';
const NON_WWW = /^https?:\/\/aitoken\.global(?=\/|$)/i;
const want = g => !GROUP || GROUP === g;

const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'published', token: APPLY ? TOKEN : undefined,
});
const log = [];
const say = line => { console.log(line); log.push(line); };
const postPath = (l, s) => `/${l}/blog/${s}/`;
/** https://aitoken.global/en/blog/x?q#h → { path: /en/blog/x/, href: https://www.aitoken.global/en/blog/x/?q#h } */
function rewrite(href) {
  const rest = href.replace(NON_WWW, '') || '/';
  const [, path, tail] = rest.match(/^([^?#]*)(.*)$/);
  const slashed = /\/$/.test(path) || /\.\w+$/.test(path) ? path : `${path}/`;
  return { path: slashed, href: SITE + slashed + tail };
}
const inDist = path => existsSync(join('dist', path, path.endsWith('/') ? 'index.html' : ''));

/** Same rule as buildPostAlternates in src/lib/sanity.ts: cluster by articleNumber, self-only on a per-locale collision. */
function alternatesFor(posts) {
  const map = new Map(), groups = new Map();
  for (const p of posts) {
    if (!p.language) continue;
    if (typeof p.articleNumber !== 'number') { map.set(postPath(p.language, p.slug), [postPath(p.language, p.slug)]); continue; }
    (groups.get(p.articleNumber) ?? groups.set(p.articleNumber, []).get(p.articleNumber)).push(p);
  }
  for (const group of groups.values()) {
    const langs = group.map(p => p.language);
    const collide = langs.length !== new Set(langs).size;
    for (const p of group) map.set(postPath(p.language, p.slug), collide ? [postPath(p.language, p.slug)] : group.map(q => postPath(q.language, q.slug)).sort());
  }
  return map;
}

// ── --make-plan ───────────────────────────────────────────────────────────
const UNPUBLISH_IDS = ['cxG6WGqtby4sD0hmXNirH1', 'lT0MJhwbFtcMofmR8I8IU1', 'GWcybyvSzKo1HK4vzSXwsk'];
if (MAKE_PLAN) {
  if (existsSync(PLAN)) { console.error(`${PLAN} exists; delete it first if you really want a new plan.`); process.exit(1); }
  const posts = await client.fetch('*[_type == "post" && defined(slug.current)]{_id, _rev, language, "slug": slug.current, title, articleNumber, body}');
  const links = [];
  for (const p of posts) {
    const edits = [];
    for (const b of p.body ?? []) for (const m of b.markDefs ?? []) {
      if (typeof m.href === 'string' && NON_WWW.test(m.href)) { const r = rewrite(m.href); edits.push({ blockKey: b._key, markKey: m._key, before: m.href, after: r.href, targetPath: r.path }); }
    }
    if (edits.length) links.push({ _id: p._id, locale: p.language, slug: p.slug, sourceRev: p._rev, edits });
  }
  const unpublish = UNPUBLISH_IDS.map(id => {
    const d = posts.find(p => p._id === id);
    const others = posts.filter(p => p._id !== id && p.language === d.language && p.slug === d.slug);
    return { _id: id, locale: d.language, slug: d.slug, title: d.title, articleNumber: d.articleNumber, sourceRev: d._rev, sharesUrlWith: others.map(o => o._id) };
  });
  // The rendered post at each shared URL: getPostBySlug's unordered [0] returns the lowest _id today.
  const reachable = {};
  for (const u of unpublish) {
    const path = postPath(u.locale, u.slug);
    const keep = posts.filter(p => p.language === u.locale && p.slug === u.slug && !UNPUBLISH_IDS.includes(p._id));
    reachable[path] = keep.map(p => ({ _id: p._id, title: p.title }));
  }
  const before = alternatesFor(posts), after = alternatesFor(posts.filter(p => !UNPUBLISH_IDS.includes(p._id)));
  const nums = new Set(posts.filter(p => UNPUBLISH_IDS.includes(p._id) || Object.values(reachable).flat().some(r => r._id === p._id)).map(p => p.articleNumber));
  const affected = posts.filter(p => nums.has(p.articleNumber) && !UNPUBLISH_IDS.includes(p._id)).map(p => postPath(p.language, p.slug));
  const expectAlternates = Object.fromEntries([...new Set(affected)].sort().map(path => [path, { before: before.get(path), after: after.get(path) }]));
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(PLAN, JSON.stringify({ created: new Date().toISOString(), links, unpublish, reachable, expectAlternates }, null, 2) + '\n');
  console.log(`Plan → ${PLAN}: ${links.length} post(s), ${links.reduce((n, l) => n + l.edits.length, 0)} link(s); ${unpublish.length} unpublish; ${Object.keys(expectAlternates).length} hreflang page(s) to check.`);
  process.exit(0);
}

if (!existsSync(PLAN)) { console.error(`No plan at ${PLAN}. Run --make-plan first.`); process.exit(1); }
const plan = JSON.parse(readFileSync(PLAN, 'utf8'));

// ── --check-dist / --check-live ───────────────────────────────────────────
async function page(path) {
  if (CHECK_DIST) { const f = join('dist', path, 'index.html'); return existsSync(f) ? readFileSync(f, 'utf8') : null; }
  const res = await fetch(SITE + path, { redirect: 'follow', headers: { 'cache-control': 'no-cache' } });
  return res.ok && res.url.replace(/\/?$/, '/') === SITE + path ? res.text() : null;
}
const decode = s => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
if (CHECK_DIST || CHECK_LIVE) {
  const lines = [`# Hygiene ${CHECK_DIST ? 'check-dist' : 'check-live'}${GROUP ? ` --group ${GROUP}` : ''}: ${new Date().toISOString()}`, ''];
  let fail = 0;
  const out = (ok, msg) => { lines.push(`${ok ? 'PASS' : 'FAIL'} ${msg}`); if (!ok) fail++; };
  if (want('links')) for (const l of plan.links) {
    const path = postPath(l.locale, l.slug), html = await page(path);
    if (!html) { out(false, `[links] ${path}: page missing`); continue; }
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m => decode(m[1]));
    const left = hrefs.filter(h => NON_WWW.test(h));
    const missing = l.edits.filter(e => !hrefs.includes(e.after));
    out(!left.length && !missing.length, `[links] ${path}: ${left.length} non-www href(s) left, ${l.edits.length - missing.length}/${l.edits.length} new href(s) present`);
  }
  if (want('unpublish')) {
    for (const [path, keep] of Object.entries(plan.reachable)) {
      const html = await page(path);
      const h1 = decode(html?.match(/<h1[^>]*>([^<]*)/)?.[1] ?? '').trim();
      out(!!html && keep.length === 1 && h1 === keep[0].title, `[unpublish] ${path}: still 200, renders "${h1}"${keep.length === 1 ? ` (expected "${keep[0].title}")` : ''}`);
    }
    for (const [path, exp] of Object.entries(plan.expectAlternates)) {
      const html = await page(path);
      if (!html) { out(false, `[unpublish] ${path}: page missing`); continue; }
      const got = [...html.matchAll(/hreflang="([a-z-]+)" href="([^"]+)"/g)].filter(m => m[1] !== 'x-default').map(m => m[2].replace(SITE, '')).sort();
      const ok = JSON.stringify(got) === JSON.stringify(exp.after);
      out(ok, `[unpublish] ${path}: hreflang ${ok ? 'matches the expected set' : `is ${got.join(', ')}; expected ${exp.after.join(', ')}`}`);
    }
  }
  lines.push('', `${fail ? `${fail} failure(s)` : 'All pass'}.`);
  console.log(lines.join('\n'));
  const f = join(OUT_DIR, `hygiene-${CHECK_DIST ? 'check-dist' : 'check-live'}-${GROUP ?? 'all'}-${STAMP}.md`);
  writeFileSync(f, lines.join('\n') + '\n');
  console.log(`Log → ${f}`);
  process.exit(fail ? 1 : 0);
}

// ── Guards ────────────────────────────────────────────────────────────────
say(`# Hygiene ${APPLY ? `APPLY --group ${GROUP}` : `DRY RUN${GROUP ? ` --group ${GROUP}` : ' (both groups)'}`}: ${new Date().toISOString()}`);
say('');
say(`Plan: \`${PLAN}\` (made ${plan.created}).`);
say('');
let skipped = 0, failed = 0;
const readyLinks = [], readyUnpublish = [];

if (want('links')) {
  say(`## Group links: ${plan.links.length} post(s), ${plan.links.reduce((n, l) => n + l.edits.length, 0)} link(s)`);
  say('');
  say('| post | block / markDef | before | after | target in dist/ |');
  say('|---|---|---|---|---|');
  for (const l of plan.links) {
    const path = postPath(l.locale, l.slug);
    const doc = (await client.fetch('*[_type == "post" && language == $l && slug.current == $s]{_id, _rev, body}', { l: l.locale, s: l.slug })).find(d => d._id === l._id);
    const problems = [];
    if (!doc) problems.push('no longer published at this URL');
    else if (doc._rev !== l.sourceRev) problems.push(`_rev is ${doc._rev}, pinned ${l.sourceRev}`);
    const expected = doc ? structuredClone(doc.body) : [];
    const set = {};
    for (const e of l.edits) {
      const m = expected.find(b => b._key === e.blockKey)?.markDefs?.find(md => md._key === e.markKey);
      if (!m) { problems.push(`markDef ${e.blockKey}/${e.markKey} not found`); continue; }
      if (m.href !== e.before) { problems.push(`markDef ${e.blockKey}/${e.markKey} href is ${m.href}`); continue; }
      if (!inDist(e.targetPath)) problems.push(`target ${e.targetPath} not in dist/ (build first?)`);
      m.href = e.after;
      set[`body[_key=="${e.blockKey}"].markDefs[_key=="${e.markKey}"].href`] = e.after;
      say(`| \`${path}\` | \`${e.blockKey}\` / \`${e.markKey}\` | ${e.before} | ${e.after} | ${inDist(e.targetPath) ? 'yes' : '**no**'} |`);
    }
    if (doc) {
      // Everything except the listed hrefs must be byte-identical.
      const strip = body => JSON.stringify(body, (k, v) => (k === 'href' && typeof v === 'string' && l.edits.some(e => e.before === v || e.after === v) ? '«href»' : v));
      if (strip(doc.body) !== strip(expected)) problems.push('patched body differs beyond the listed hrefs');
    }
    if (problems.length) { say(`| \`${path}\` | SKIP | ${problems.join('; ')} | | |`); skipped++; continue; }
    readyLinks.push({ l, path, expected, set });
  }
  say('');
}

if (want('unpublish')) {
  say(`## Group unpublish: ${plan.unpublish.length} document(s), moved to draft, never deleted`);
  say('');
  for (const u of plan.unpublish) {
    const path = postPath(u.locale, u.slug);
    const doc = await client.fetch('*[_id == $id][0]{_id, _rev, language, "slug": slug.current}', { id: u._id });
    const keep = plan.reachable[path];
    const stillThere = await client.fetch('*[_id in $ids]._id', { ids: keep.map(k => k._id) });
    const refs = await client.fetch('count(*[references($id)])', { id: u._id });
    const draft = APPLY ? await client.fetch('*[_id == $d][0]._id', { d: `drafts.${u._id}` }, { perspective: 'raw' }) : null;
    const problems = [];
    if (!doc) problems.push('no longer published');
    else {
      if (doc._rev !== u.sourceRev) problems.push(`_rev is ${doc._rev}, pinned ${u.sourceRev}`);
      if (postPath(doc.language, doc.slug) !== path) problems.push(`now lives at ${postPath(doc.language, doc.slug)}`);
    }
    if (stillThere.length !== keep.length) problems.push('the reachable post at this URL is no longer published');
    if (refs) problems.push(`${refs} document(s) reference it`);
    if (draft) problems.push('a draft already exists; unpublishing would replace it');
    say(`- \`${u._id}\` ${path} (art #${u.articleNumber}, "${u.title}"): ${problems.length ? `SKIP, ${problems.join('; ')}` : `ready · rev \`${u.sourceRev}\` · the URL keeps rendering \`${keep[0]._id}\` "${keep[0].title}"`}`);
    if (problems.length) { skipped++; continue; }
    readyUnpublish.push({ u, path });
  }
  say('');
  say('hreflang on the affected pages after the next build (from the plan; checked by --check-dist/--check-live):');
  say('');
  say('| page | before | after |');
  say('|---|---|---|');
  for (const [path, e] of Object.entries(plan.expectAlternates)) {
    if (JSON.stringify(e.before) !== JSON.stringify(e.after)) say(`| \`${path}\` | ${e.before.join('<br>')} | ${e.after.join('<br>')} |`);
  }
  say('');
}

// ── Write ─────────────────────────────────────────────────────────────────
const n = readyLinks.length + readyUnpublish.length;
say(`## ${APPLY ? 'Writing' : 'Would write'}: ${n} document(s), one transaction each${skipped ? ` · ${skipped} skipped` : ''}`);
if (want('links')) say(`- links: ${readyLinks.length} post(s), ${readyLinks.reduce((a, r) => a + Object.keys(r.set).length, 0)} href(s)`);
if (want('unpublish')) say(`- unpublish: ${readyUnpublish.length} document(s)`);
say('');
if (APPLY && n) {
  const dir = join(OUT_DIR, `hygiene-backup-${GROUP}-${STAMP}`);
  mkdirSync(dir, { recursive: true });
  for (const id of [...readyLinks.map(r => r.l._id), ...readyUnpublish.map(r => r.u._id)]) {
    writeFileSync(join(dir, `${id}.json`), JSON.stringify(await client.fetch('*[_id == $id][0]', { id }), null, 2) + '\n');
  }
  say(`Backups → \`${dir}/\``);
  for (const { l, path, expected, set } of readyLinks) {
    try {
      await client.transaction().patch(l._id, p => p.ifRevisionId(l.sourceRev).set(set)).commit();
      const after = await client.fetch('*[_id == $id][0].body', { id: l._id });
      const ok = JSON.stringify(after) === JSON.stringify(expected);
      if (!ok) failed++;
      say(`- \`${l._id}\` ${path}: ${ok ? 're-read, whole body matches the expected body' : 'FAILED, re-read body differs (restore from backup)'}`);
    } catch (err) { failed++; say(`- \`${l._id}\` ${path}: NOT WRITTEN, ${err.message}`); }
  }
  for (const { u, path } of readyUnpublish) {
    // No revision precondition exists for unpublish: re-check right before the action.
    const now = await client.fetch('{"rev": *[_id == $id][0]._rev, "draft": defined(*[_id == $d][0])}', { id: u._id, d: `drafts.${u._id}` }, { perspective: 'raw' });
    if (now.rev !== u.sourceRev || now.draft) { failed++; say(`- \`${u._id}\` ${path}: NOT WRITTEN, changed just before the action (rev ${now.rev}, draft ${now.draft})`); continue; }
    try {
      await client.action([{ actionType: 'sanity.action.document.unpublish', publishedId: u._id, draftId: `drafts.${u._id}` }]);
      const after = await client.fetch('{"published": defined(*[_id == $id][0]), "draft": defined(*[_id == $d][0])}', { id: u._id, d: `drafts.${u._id}` }, { perspective: 'raw' });
      const ok = !after.published && after.draft;
      if (!ok) failed++;
      say(`- \`${u._id}\` ${path}: published=${after.published} draft=${after.draft}${ok ? ' (unpublished, kept as draft)' : '  FAILED'}`);
    } catch (err) { failed++; say(`- \`${u._id}\` ${path}: NOT WRITTEN, ${err.message}`); }
  }
  say('');
}

const logPath = join(OUT_DIR, APPLY ? `hygiene-log-${GROUP}-${STAMP}.md` : `hygiene-dryrun-${GROUP ?? 'all'}-${STAMP}.md`);
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`Log → ${logPath}`);
process.exit(skipped || failed ? 1 : 0);
