/**
 * patch-retire-not-indexed.mjs
 *
 * S8: unpublishes the RETIRE and MERGE rows of the "crawled – currently not
 * indexed" triage (audits/2026-10-13/not-indexed-triage.csv), and deletes the
 * two reading-list blocks that link to retired pages. KEEP and ALREADY RETIRED
 * rows are never touched. MERGE rows are retired like the rest: no redirect,
 * they return 404.
 *
 * Unpublish = Sanity's unpublish action: the published document moves into its
 * draft. Nothing is deleted, and every post can be republished from the Studio.
 * A block deletion is an edit action (unset the block, creating the draft from
 * the published document) followed by a publish action pinned to the published
 * revision that was read.
 *
 * Same pattern as patch-per-token-phase1.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs SANITY_TOKEN from the shell.
 *   - Guards, each skip reported:
 *       retire:  the document must still be published, at the CSV's URL, under
 *                the CSV's _id, with no draft (unpublishing would replace it);
 *       block:   the block must still link to the expected retired page, the
 *                link must be the block's whole content, and the post must
 *                have no draft (publishing it would ship unrelated edits).
 *   - Every touched document is backed up to audits/2026-10-13/retire-backup/
 *     before the write. All actions go in ONE request, which Sanity applies as
 *     one transaction. Each document is re-read afterwards.
 *   - Logs: retire-log.md for --apply, retire-dryrun.md otherwise.
 *
 * After the next site build:
 *   node scripts/patch-retire-not-indexed.mjs --check-dist
 * scans every file in dist/ for each retired URL and expects zero hits.
 *
 * Usage:
 *   node scripts/patch-retire-not-indexed.mjs                 # dry run
 *   SANITY_TOKEN=… node scripts/patch-retire-not-indexed.mjs --apply
 *   node scripts/patch-retire-not-indexed.mjs --check-dist    # after the build
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const CHECK_DIST = process.argv.includes('--check-dist');
const TOKEN = process.env.SANITY_TOKEN;
const OUT_DIR = 'audits/2026-10-13';
const CSV = join(OUT_DIR, 'not-indexed-triage.csv');
const IN_SCOPE = new Set(['RETIRE', 'MERGE']);

/** Reading-list entries whose whole content is a link to a page retired here. */
const BLOCK_DELETES = [
  { _id: 'HgaihXXCLvBQsD0m2XZoFY', lang: 'vi', field: 'body', blockKey: 'b39', target: '/vi/blog/optimizing-ai-token-costs-for-small-businesses/' },
  { _id: 'YDnwDiutEyNP1AlOwB4V1v', lang: 'id', field: 'body', blockKey: 'b39', target: '/id/blog/optimasi-biaya-token-ai-usaha-kecil/' },
];

function parseCsv(text) {
  const rows = []; let r = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; }
    else f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  const [h, ...b] = rows.filter(x => x.length > 1);
  return b.map(x => Object.fromEntries(h.map((k, i) => [k, x[i] ?? ''])));
}
const rows = parseCsv(readFileSync(CSV, 'utf8')).filter(r => IN_SCOPE.has(r.action));
const pathOf = url => new URL(url).pathname;
const sitePath = href => (href ?? '').replace(/^https?:\/\/(www\.)?aitoken\.global/, '').replace(/\/?$/, '/');

// ── --check-dist: after the build, no file may mention a retired URL ──────
if (CHECK_DIST) {
  const paths = rows.map(r => pathOf(r.url));
  const files = [];
  const walk = d => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(html|xml|txt|json)$/.test(e.name)) files.push(p); } };
  if (!existsSync('dist')) { console.error('No dist/. Run npm run build first.'); process.exit(1); }
  walk('dist');
  const hits = [];
  for (const f of files) {
    const s = readFileSync(f, 'utf8');
    for (const p of paths) if (s.includes(p) || s.includes(p.slice(0, -1) + '"') || s.includes(p.slice(0, -1) + '<')) hits.push(`${p} in ${f}`);
  }
  const gone = paths.filter(p => !existsSync(join('dist', p))).length;
  console.log(`check-dist: ${paths.length} retired URLs, ${files.length} files scanned; pages absent from dist/: ${gone}/${paths.length}; mentions found: ${hits.length}`);
  for (const h of hits) console.log(`- ${h}`);
  process.exit(hits.length || gone !== paths.length ? 1 : 0);
}

if (APPLY && !TOKEN) {
  console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  process.exit(1);
}
const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'raw', token: APPLY ? TOKEN : undefined,
});

const log = [];
const say = line => { console.log(line); log.push(line); };
let problems = 0;
const textOf = b => (b?.children ?? []).map(c => c.text ?? '').join('');

say(`# S8 retire ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');

// ── 1. Unpublish plan ─────────────────────────────────────────────────────
const ids = rows.map(r => r._id);
const published = new Map((await client.fetch(
  '*[_id in $ids && !(_id in path("drafts.**"))]{_id, _rev, language, "slug": slug.current, translationKey}', { ids },
)).map(d => [d._id, d]));
const allDraftIds = [...ids, ...BLOCK_DELETES.map(b => b._id)].map(i => `drafts.${i}`);
const drafts = APPLY ? new Set(await client.fetch('*[_id in $d]._id', { d: allDraftIds })) : new Set();

const plan = [];
const skips = [];
for (const r of rows) {
  const path = pathOf(r.url);
  const doc = published.get(r._id);
  if (!doc) { skips.push(`retire \`${r._id}\` ${path}: no longer published`); continue; }
  if (`/${doc.language}/blog/${doc.slug}/` !== path) { skips.push(`retire \`${r._id}\` ${path}: that _id now lives at /${doc.language}/blog/${doc.slug}/`); continue; }
  if (drafts.has(`drafts.${r._id}`)) { skips.push(`retire \`${r._id}\` ${path}: a draft already exists; unpublishing would replace it`); continue; }
  plan.push({ row: r, doc, path });
}
const retiring = new Set(plan.map(p => p.path));

const L = ['vi', 'en', 'es', 'id'];
const sum = (list, k) => list.reduce((n, p) => n + (+p.row[k] || 0), 0);
say('## 1. Unpublish (moved to draft, never deleted; all return 404 after the next build)');
say('');
say('| Triage action | vi | en | es | id | Total | Impressions | Clicks |');
say('|---|---:|---:|---:|---:|---:|---:|---:|');
for (const a of ['RETIRE', 'MERGE']) {
  const ps = plan.filter(p => p.row.action === a);
  say(`| ${a} | ${L.map(l => ps.filter(p => p.doc.language === l).length).join(' | ')} | ${ps.length} | ${sum(ps, 'impressions')} | ${sum(ps, 'clicks')} |`);
}
say(`| **Total** | ${L.map(l => plan.filter(p => p.doc.language === l).length).join(' | ')} | ${plan.length} | ${sum(plan, 'impressions')} | ${sum(plan, 'clicks')} |`);
say('');
say('MERGE rows are retired like the rest: unpublished, no redirect.');
say('');

// ── 2. Block deletions ────────────────────────────────────────────────────
say('## 2. Reading-list blocks that link to a retired page (deleted)');
say('');
const blockPlan = [];
for (const bd of BLOCK_DELETES) {
  const doc = await client.fetch('*[_id == $id][0]{_id, _rev, language, "slug": slug.current, body}', { id: bd._id });
  const where = `\`${bd._id}\` (${bd.lang}${doc ? ` /${doc.language}/blog/${doc.slug}/` : ''}) block \`${bd.blockKey}\``;
  if (!doc) { skips.push(`block ${where}: document not published`); continue; }
  const block = (doc[bd.field] ?? []).find(b => b._key === bd.blockKey);
  const link = (block?.markDefs ?? []).find(m => sitePath(m.href) === bd.target);
  const anchor = link ? block.children.filter(c => c.marks?.includes(link._key)).map(c => c.text).join('') : '';
  if (!block) { skips.push(`block ${where}: block not found`); continue; }
  if (!link) { skips.push(`block ${where}: no longer links to ${bd.target}`); continue; }
  if (anchor.trim() !== textOf(block).trim()) { skips.push(`block ${where}: the link is not the block's whole content ("${textOf(block)}")`); continue; }
  if (!retiring.has(bd.target)) { skips.push(`block ${where}: ${bd.target} is not in this run's retire plan`); continue; }
  if (drafts.has(`drafts.${bd._id}`)) { skips.push(`block ${where}: the post has a draft; publishing it would ship unrelated edits`); continue; }
  say(`- DELETE ${where}: "${anchor}" → ${bd.target}`);
  blockPlan.push({ ...bd, doc });
}
if (!blockPlan.length) say('None.');
say('');

// Any other published block still linking to a page retired here.
const others = [];
for (const d of await client.fetch('*[!(_type match "sanity.*") && !(_type match "system.*") && !(_id in path("drafts.**"))]')) {
  if (plan.some(p => p.doc._id === d._id)) continue;
  for (const [field, val] of Object.entries(d)) {
    if (!Array.isArray(val)) continue;
    for (const b of val) {
      if (b?._type !== 'block') continue;
      for (const md of b.markDefs ?? []) {
        if (!retiring.has(sitePath(md.href))) continue;
        if (blockPlan.some(x => x._id === d._id && x.blockKey === b._key)) continue;
        others.push(`\`${d._id}\` ${field} block \`${b._key}\` → ${sitePath(md.href)}: "${textOf(b).slice(0, 120)}"`);
      }
    }
  }
}
say(`Other published links into retired pages, not handled here: ${others.length}`);
for (const o of others) say(`- ${o}`);
say('');

say(`## Guard skips: ${skips.length}`);
for (const s of skips) say(`- ${s}`);
say('');

// ── 3. Translation siblings ───────────────────────────────────────────────
const keys = [...new Set(plan.map(p => p.doc.translationKey).filter(Boolean))];
const siblings = await client.fetch('*[_type == "post" && translationKey in $keys && !(_id in path("drafts.**"))]{_id, translationKey}', { keys });
const retiringIds = new Set(plan.map(p => p.doc._id));
const mixed = keys.filter(k => siblings.some(s => s.translationKey === k && !retiringIds.has(s._id))).length;
say(`## 3. Translation groups with a sibling that stays published: ${mixed}`);
say('');
say('No action needed: hreflang alternates come from published posts only (getAlternatesForPost, src/lib/sanity.ts), so the next build stops emitting pairs to retired pages.');
say('');

// ── Write ─────────────────────────────────────────────────────────────────
const actions = [
  ...plan.map(p => ({ actionType: 'sanity.action.document.unpublish', publishedId: p.doc._id, draftId: `drafts.${p.doc._id}` })),
  ...blockPlan.flatMap(b => [
    { actionType: 'sanity.action.document.edit', publishedId: b._id, draftId: `drafts.${b._id}`, patch: { unset: [`${b.field}[_key=="${b.blockKey}"]`] } },
    { actionType: 'sanity.action.document.publish', publishedId: b._id, draftId: `drafts.${b._id}`, ifPublishedRevisionId: b.doc._rev },
  ]),
];
say(`## ${APPLY ? 'Writing' : 'Would write'}: ${plan.length} unpublish + ${blockPlan.length} block deletion(s) = ${actions.length} action(s) in ONE request (one transaction)`);
say('');

if (APPLY && actions.length) {
  const dir = join(OUT_DIR, 'retire-backup');
  mkdirSync(dir, { recursive: true });
  const toBackUp = [...plan.map(p => p.doc._id), ...blockPlan.map(b => b._id)];
  for (const id of toBackUp) {
    const full = await client.fetch('*[_id == $id][0]', { id });
    writeFileSync(join(dir, `${id}.json`), JSON.stringify(full, null, 2) + '\n');
  }
  say(`Backed up ${toBackUp.length} document(s) to ${dir}/.`);
  try {
    await client.action(actions);
  } catch (err) {
    say(`FAILED, nothing written: ${err.message}`);
    problems++;
  }
  say('');
  say('### Re-read');
  for (const p of plan) {
    const after = await client.fetch('{"published": defined(*[_id == $id][0]), "draft": defined(*[_id == $d][0])}', { id: p.doc._id, d: `drafts.${p.doc._id}` });
    const ok = !after.published && after.draft;
    say(`- \`${p.doc._id}\` ${p.path}: published=${after.published} draft=${after.draft}${ok ? '' : '  FAILED'}`);
    if (!ok) problems++;
  }
  for (const b of blockPlan) {
    const after = await client.fetch(`{"block": defined(*[_id == $id][0].${b.field}[_key == $k][0]), "draft": defined(*[_id == $d][0])}`, { id: b._id, k: b.blockKey, d: `drafts.${b._id}` });
    const ok = !after.block && !after.draft;
    say(`- \`${b._id}\` block \`${b.blockKey}\`: ${ok ? 'deleted and published, no draft left' : `FAILED (block present=${after.block}, draft=${after.draft})`}`);
    if (!ok) problems++;
  }
  say('');
}

say('## After the next build');
say('');
say('`npm run build && node scripts/patch-retire-not-indexed.mjs --check-dist` scans every .html/.xml/.txt/.json file in dist/ for each retired URL. Expect: all pages absent from dist/, zero mentions.');
say('');

mkdirSync(OUT_DIR, { recursive: true });
const logPath = join(OUT_DIR, APPLY ? 'retire-log.md' : 'retire-dryrun.md');
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`Log → ${logPath}${problems ? `\n${problems} problem(s); see above.` : ''}`);
process.exit(problems ? 1 : 0);
