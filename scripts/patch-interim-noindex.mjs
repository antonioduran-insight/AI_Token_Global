/**
 * patch-interim-noindex.mjs
 *
 * Index diet, interim step: sets `seo.noindex = true` on the published es/id
 * posts whose body is still English and that earn no search traffic — the
 * NOINDEX_INTERIM rows of audits/2026-10-19/index-diet.csv (built by
 * scripts/build-index-diet.mjs). KEEP, PROTECTED_TRANSLATE_FIRST, RETIRED_S8 and
 * UNPUBLISHED_HYGIENE rows are never touched.
 *
 * TEMPORARY. The real fix is translating the bodies
 * (scripts/patch-translate-bodies.mjs); as each one is translated, clear its
 * noindex. --revert undoes this whole run from the backups.
 *
 * BaseLayout prints `<meta name="robots" content="noindex, nofollow">` from the
 * field; the sitemap and hreflang clusters leave noindex posts out (see
 * astro.config.mjs and getPostAlternates in src/lib/sanity.ts).
 *
 * Same pattern as patch-retire-not-indexed.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs SANITY_TOKEN from the shell.
 *   - Guards, each skip reported: the document is still published; it has the
 *     CSV's _id and lives at the CSV's URL; no draft exists (Studio would show
 *     the draft, and publishing it later would silently drop the noindex);
 *     seo.noindex is not already true.
 *   - Every touched document is backed up to audits/2026-10-19/noindex-backup/
 *     before the write. All patches go in ONE transaction, each pinned to the
 *     revision that was read. Each document is re-read afterwards.
 *   - Logs: noindex-log.md for --apply, noindex-dryrun.md otherwise.
 *
 * Drafts are not readable without a token. A dry run checks them only when
 * SANITY_TOKEN or SANITY_READ_TOKEN is set, and says so; --apply always does.
 *
 * Usage:
 *   node scripts/patch-interim-noindex.mjs                          # dry run
 *   SANITY_TOKEN=… node scripts/patch-interim-noindex.mjs --apply
 *   node scripts/patch-interim-noindex.mjs --check-dist             # after the build
 *   node scripts/patch-interim-noindex.mjs --revert                 # dry run of the undo
 *   SANITY_TOKEN=… node scripts/patch-interim-noindex.mjs --revert --apply
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const REVERT = process.argv.includes('--revert');
const CHECK_DIST = process.argv.includes('--check-dist');
const TOKEN = process.env.SANITY_TOKEN;
const READ_TOKEN = TOKEN || process.env.SANITY_READ_TOKEN;
const OUT_DIR = 'audits/2026-10-19';
const CSV = join(OUT_DIR, 'index-diet.csv');
const BACKUP_DIR = join(OUT_DIR, 'noindex-backup');
const SITE = 'https://www.aitoken.global';

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
const table = parseCsv(readFileSync(CSV, 'utf8'));
const rows = table.filter(r => r.action === 'NOINDEX_INTERIM');
const pathOf = url => new URL(url).pathname;
const LOCALES = ['es', 'id'];

// ── --check-dist: after the build, dist/ must match the table ─────────────
if (CHECK_DIST) {
  if (!existsSync('dist')) { console.error('No dist/. Run npm run build first.'); process.exit(1); }
  const ROBOTS_NOINDEX = /<meta name="robots" content="noindex/;
  const fails = { noindexMissing: [], noindexUnexpected: [], missingPage: [], inSitemap: [], inHreflang: [] };
  const noindexPaths = new Set(rows.map(r => pathOf(r.url)));

  for (const r of table) {
    if (!['NOINDEX_INTERIM', 'KEEP', 'PROTECTED_TRANSLATE_FIRST'].includes(r.action)) continue;
    const path = pathOf(r.url);
    const file = join('dist', path, 'index.html');
    if (!existsSync(file)) { fails.missingPage.push(`${r.action} ${path}`); continue; }
    const has = ROBOTS_NOINDEX.test(readFileSync(file, 'utf8'));
    if (r.action === 'NOINDEX_INTERIM' && !has) fails.noindexMissing.push(path);
    if (r.action !== 'NOINDEX_INTERIM' && has) fails.noindexUnexpected.push(`${r.action} ${path}`);
  }

  for (const f of readdirSync('dist').filter(f => /^sitemap-.*\.xml$/.test(f))) {
    for (const m of readFileSync(join('dist', f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (noindexPaths.has(pathOf(m[1]))) fails.inSitemap.push(`${pathOf(m[1])} in ${f}`);
    }
  }

  // hreflang on every other page must not name a noindex post.
  const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(join(d, e.name)) : e.name === 'index.html' ? [join(d, e.name)] : []));
  for (const file of walk('dist')) {
    const self = '/' + file.slice('dist/'.length, -'index.html'.length);
    for (const m of readFileSync(file, 'utf8').matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g)) {
      const target = pathOf(m[1]);
      if (target !== self && noindexPaths.has(target)) fails.inHreflang.push(`${self} → ${target}`);
    }
  }

  const checked = table.filter(r => ['NOINDEX_INTERIM', 'KEEP', 'PROTECTED_TRANSLATE_FIRST'].includes(r.action)).length;
  console.log(`check-dist: ${checked} pages (${rows.length} NOINDEX_INTERIM)`);
  const report = (label, list) => {
    console.log(`${list.length ? 'FAIL' : 'PASS'} ${label}: ${list.length}`);
    for (const x of list.slice(0, 10)) console.log(`  - ${x}`);
    if (list.length > 10) console.log(`  … and ${list.length - 10} more`);
  };
  report('NOINDEX_INTERIM pages without the robots noindex meta', fails.noindexMissing);
  report('KEEP/PROTECTED pages with a robots noindex meta', fails.noindexUnexpected);
  report('pages missing from dist/', fails.missingPage);
  report('NOINDEX_INTERIM URLs in a sitemap', fails.inSitemap);
  report('hreflang links pointing at a NOINDEX_INTERIM URL', fails.inHreflang);
  if (fails.noindexMissing.length === rows.length && rows.length) {
    console.log('\nEvery NOINDEX_INTERIM page lacks the meta: expected until --apply has run and the site is rebuilt.');
  }
  process.exit(Object.values(fails).some(l => l.length) ? 1 : 0);
}

if (APPLY && !TOKEN) {
  console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  process.exit(1);
}
const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'raw', token: APPLY ? TOKEN : READ_TOKEN,
});

const log = [];
const say = line => { console.log(line); log.push(line); };
let problems = 0;
const draftsChecked = Boolean(APPLY || READ_TOKEN);
const draftNote = draftsChecked ? '' : ' (not checked: no token in this dry run; --apply always checks)';

async function existingDrafts(ids) {
  if (!draftsChecked) return new Set();
  return new Set(await client.fetch('*[_id in $d]._id', { d: ids.map(i => `drafts.${i}`) }));
}

function writeLog(name) {
  mkdirSync(OUT_DIR, { recursive: true });
  const logPath = join(OUT_DIR, name);
  writeFileSync(logPath, log.join('\n') + '\n');
  console.log(`Log → ${logPath}${problems ? `\n${problems} problem(s); see above.` : ''}`);
  process.exit(problems ? 1 : 0);
}

// ── --revert: put seo.noindex back the way the backups recorded it ────────
if (REVERT) {
  say(`# Interim noindex REVERT ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
  say('');
  const backups = existsSync(BACKUP_DIR)
    ? readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join(BACKUP_DIR, f), 'utf8')))
    : [];
  say(`Backups in ${BACKUP_DIR}/: ${backups.length}${backups.length ? '' : ' — nothing has been applied, nothing to revert.'}`);
  say('');
  const ids = backups.map(b => b._id);
  const current = new Map((await client.fetch('*[_id in $ids]{_id, _rev, seo}', { ids })).map(d => [d._id, d]));
  const drafts = await existingDrafts(ids);
  const plan = [], skips = [];
  for (const b of backups) {
    const doc = current.get(b._id);
    const where = `\`${b._id}\` /${b.language}/blog/${b.slug?.current}/`;
    if (!doc) { skips.push(`${where}: no longer published`); continue; }
    if (doc.seo?.noindex !== true) { skips.push(`${where}: seo.noindex is not true now; changed since, left alone`); continue; }
    if (drafts.has(`drafts.${b._id}`)) { skips.push(`${where}: a draft exists; revert it in Studio instead`); continue; }
    const had = b.seo?.noindex;
    // Restore exactly: unset when the backup had no value, drop `seo` itself if the apply created it.
    const unsetSeo = b.seo === undefined && Object.keys(doc.seo ?? {}).every(k => k === 'noindex');
    plan.push({ b, doc, where, op: had === undefined ? { unset: [unsetSeo ? 'seo' : 'seo.noindex'] } : { set: { 'seo.noindex': had } } });
  }
  say(`## ${APPLY ? 'Reverting' : 'Would revert'}: ${plan.length} document(s) in ONE transaction`);
  for (const p of plan) say(`- ${p.where}: ${p.op.unset ? `unset ${p.op.unset[0]}` : `seo.noindex → ${p.op.set['seo.noindex']}`}`);
  say('');
  say(`## Guard skips: ${skips.length}${draftNote}`);
  for (const s of skips) say(`- ${s}`);
  say('');
  if (APPLY && plan.length) {
    const tx = client.transaction();
    for (const p of plan) tx.patch(p.b._id, q => (p.op.unset ? q.unset(p.op.unset) : q.set(p.op.set)).ifRevisionId(p.doc._rev));
    try { await tx.commit({ visibility: 'sync' }); } catch (err) { say(`FAILED, nothing written: ${err.message}`); problems++; }
    say('### Re-read');
    for (const p of plan) {
      const after = await client.fetch('{"seo": *[_id == $id][0].seo, "draft": defined(*[_id == $d][0])}', { id: p.b._id, d: `drafts.${p.b._id}` });
      const ok = after.seo?.noindex === p.b.seo?.noindex && !after.draft;
      say(`- ${p.where}: seo.noindex=${after.seo?.noindex} (backup ${p.b.seo?.noindex})${ok ? '' : '  FAILED'}`);
      if (!ok) problems++;
    }
    say('');
  }
  writeLog(APPLY ? 'noindex-revert-log.md' : 'noindex-revert-dryrun.md');
}

// ── Apply / dry run ───────────────────────────────────────────────────────
say(`# Interim noindex ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');
say(`Table: \`${CSV}\` — ${table.length} rows, ${rows.length} NOINDEX_INTERIM. Only those rows are read below.`);
say('');

const ids = rows.map(r => r.doc_id);
const published = new Map((await client.fetch(
  '*[_id in $ids && !(_id in path("drafts.**"))]{_id, _rev, _type, language, "slug": slug.current, seo}', { ids },
)).map(d => [d._id, d]));
const drafts = await existingDrafts(ids);

const plan = [], skips = [];
for (const r of rows) {
  const path = pathOf(r.url);
  const doc = published.get(r.doc_id);
  const where = `\`${r.doc_id}\` ${path}`;
  if (!doc) { skips.push(`${where}: no longer published`); continue; }
  if (doc._type !== 'post' || `/${doc.language}/blog/${doc.slug}/` !== path) { skips.push(`${where}: that _id now lives at /${doc.language}/blog/${doc.slug}/ (${doc._type})`); continue; }
  if (drafts.has(`drafts.${r.doc_id}`)) { skips.push(`${where}: a draft exists; publishing it later would drop the noindex`); continue; }
  if (doc.seo?.noindex === true) { skips.push(`${where}: seo.noindex is already true`); continue; }
  plan.push({ row: r, doc, path });
}

const sum = (list, k) => list.reduce((n, p) => n + (+p.row[k] || 0), 0);
say('## Plan: set seo.noindex = true on the published document');
say('');
say('| | es | id | Total | 28d impressions | 28d clicks |');
say('|---|---:|---:|---:|---:|---:|');
say(`| NOINDEX_INTERIM rows | ${LOCALES.map(l => rows.filter(r => r.locale === l).length).join(' | ')} | ${rows.length} | | |`);
say(`| **Would write** | ${LOCALES.map(l => plan.filter(p => p.doc.language === l).length).join(' | ')} | ${plan.length} | ${sum(plan, 'gsc_impr_28d')} | ${sum(plan, 'gsc_clicks_28d')} |`);
say('');
say(`Untouched: ${['KEEP', 'PROTECTED_TRANSLATE_FIRST', 'RETIRED_S8', 'UNPUBLISHED_HYGIENE'].map(a => `${a} ${table.filter(r => r.action === a).length}`).join(' · ')}`);
say('');
say(`## Guard skips: ${skips.length}${draftNote}`);
for (const s of skips) say(`- ${s}`);
say('');

say('<details><summary>Documents</summary>');
say('');
for (const p of plan) say(`- \`${p.doc._id}\` ${p.path} — seo.noindex ${p.doc.seo?.noindex ?? 'unset'} → true`);
say('');
say('</details>');
say('');

// S7e phase 1 unpublished 16 posts; the table only carries the ones GSC had seen.
const s7eIds = [...readFileSync('audits/2026-10-13/per-token-phase1-log.md', 'utf8').matchAll(/^- `([^`]+)`: published=false/gm)].map(m => m[1]);
const tableIds = new Set(table.map(r => r.doc_id));
const notInTable = s7eIds.filter(id => !tableIds.has(id));
say(`## Not in table: ${notInTable.length} S7e posts (unpublished 13 Oct, never seen by GSC)`);
say('');
for (const id of notInTable) {
  const file = join('audits/2026-10-13/per-token-phase1-backup', `${id}.json`);
  const d = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  say(`- \`${id}\` /${d.language ?? '?'}/blog/${d.slug?.current ?? '?'}/`);
}
say('');

say(`## ${APPLY ? 'Writing' : 'Would write'}: ${plan.length} patch(es) in ONE transaction, each pinned to its _rev`);
say('');

if (APPLY && plan.length) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  let kept = 0;
  for (const p of plan) {
    const file = join(BACKUP_DIR, `${p.doc._id}.json`);
    // An earlier backup is the original state; never overwrite it.
    if (existsSync(file)) { kept++; continue; }
    writeFileSync(file, JSON.stringify(await client.fetch('*[_id == $id][0]', { id: p.doc._id }), null, 2) + '\n');
  }
  say(`Backed up ${plan.length - kept} document(s) to ${BACKUP_DIR}/${kept ? ` (${kept} earlier backup(s) kept)` : ''}.`);
  const tx = client.transaction();
  for (const p of plan) tx.patch(p.doc._id, q => q.setIfMissing({ seo: {} }).set({ 'seo.noindex': true }).ifRevisionId(p.doc._rev));
  try { await tx.commit({ visibility: 'sync' }); } catch (err) { say(`FAILED, nothing written: ${err.message}`); problems++; }
  say('');
  say('### Re-read');
  for (const p of plan) {
    const after = await client.fetch('{"noindex": *[_id == $id][0].seo.noindex, "draft": defined(*[_id == $d][0])}', { id: p.doc._id, d: `drafts.${p.doc._id}` });
    const ok = after.noindex === true && !after.draft;
    say(`- \`${p.doc._id}\` ${p.path}: seo.noindex=${after.noindex} draft=${after.draft}${ok ? '' : '  FAILED'}`);
    if (!ok) problems++;
  }
  say('');
}

say('## After the next build');
say('');
say('`npm run build && node scripts/patch-interim-noindex.mjs --check-dist`: every NOINDEX_INTERIM page carries the robots noindex meta, no KEEP/PROTECTED page does, and no sitemap or hreflang link names a NOINDEX_INTERIM URL.');
say('');
say('Undo: `node scripts/patch-interim-noindex.mjs --revert` (dry run), then with `SANITY_TOKEN=… --revert --apply`.');
say('');

writeLog(APPLY ? 'noindex-log.md' : 'noindex-dryrun.md');
