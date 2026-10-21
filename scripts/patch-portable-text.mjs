/**
 * patch-portable-text.mjs
 *
 * Fixes the 15 document/defect pairs behind the build warning
 *   "[portable-text] 51 node(s) rendered as nothing, 3 node(s) recovered but
 *    still malformed in Sanity — across 15 document/defect pair(s)."
 * (reported by src/lib/portable-text.ts). Two defects, both in post bodies:
 *
 *   A. `imagePrompt` blocks — 51 in 12 posts (en, vi). Art-direction notes for
 *      images that were never made; the type is not in the Studio schema and the
 *      renderer drops them. Each is deleted by `_key`. Their text is exported
 *      first to audits/2026-10-21/image-prompts.csv, which is also the plan:
 *      --apply deletes only blocks listed there, with the same text.
 *   B. `span.text` stored as an array — block `bgy4aea5` in 3 posts (vi, es, id),
 *      a 3-item pricing-tier list flattened into one span. Replaced by 3 bullet
 *      blocks, one string each, text kept exactly (no rewording). Whether those
 *      tier prices are true is an accuracy question, not this script's.
 *
 * Same pattern as patch-interim-noindex.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs SANITY_TOKEN from the shell.
 *   - Guards, each skip reported: the document is still published; it has the
 *     planned _id and lives at the planned URL; no draft exists; the defect is
 *     still present (A: the block is still an imagePrompt with the exported
 *     text; B: the span text is still an array of strings and the new keys are
 *     free).
 *   - Every touched document is backed up to audits/2026-10-21/portable-text-backup/
 *     before the write (an earlier backup is never overwritten). All patches go
 *     in ONE transaction, each pinned to the _rev read in this run. Each document
 *     is re-read afterwards.
 *   - Logs: portable-text-log.md for --apply, portable-text-dryrun.md otherwise.
 *
 * --revert restores ONLY the body blocks this script touched — the deleted
 * imagePrompt blocks go back at their original positions, the 3 bullets go back
 * to the original single block — computed against the document as it is now,
 * so any other edit made since (a translation, a noindex) is kept. Dry run by
 * default; --revert --apply writes, one transaction pinned to _rev.
 *
 * --check-dist <build.log> reads a saved build log and dist/: the log must hold
 * no [portable-text] defect lines, and each tier string must render inside <li>.
 * build.log is gitignored.
 *
 * Drafts are not readable without a token. A dry run checks them only when
 * SANITY_TOKEN or SANITY_READ_TOKEN is set, and says so; --apply always does.
 *
 * Usage:
 *   node scripts/patch-portable-text.mjs                         # dry run (writes the export once)
 *   SANITY_TOKEN=… node scripts/patch-portable-text.mjs --apply
 *   npm run build 2>&1 | tee build.log
 *   node scripts/patch-portable-text.mjs --check-dist build.log
 *   node scripts/patch-portable-text.mjs --revert                # dry run of the undo
 *   SANITY_TOKEN=… node scripts/patch-portable-text.mjs --revert --apply
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const REVERT = process.argv.includes('--revert');
const CHECK_DIST = process.argv.includes('--check-dist');
const TOKEN = process.env.SANITY_TOKEN;
const READ_TOKEN = TOKEN || process.env.SANITY_READ_TOKEN;
const OUT_DIR = 'audits/2026-10-21';
const EXPORT_CSV = join(OUT_DIR, 'image-prompts.csv');
const BACKUP_DIR = join(OUT_DIR, 'portable-text-backup');
const SITE = 'https://www.aitoken.global';

// ── The plan, from the Phase 1 report (build log of 19 Oct) ───────────────
const PROMPT_DOCS = [
  { _id: '5bTmGH4csQ2ze7LA77pImv', lang: 'en', slug: 'ai-token-usage-dashboard-interpreter' },
  { _id: '5bTmGH4csQ2ze7LA77pImv-vi', lang: 'vi', slug: 'ai-token-usage-dashboard-interpreter' },
  { _id: 'Lu5cRtKnjW1G8cWSaZkY55', lang: 'en', slug: 'ai-token-price-comparison' },
  { _id: 'Lu5cRtKnjW1G8cWSaZkY55-vi', lang: 'vi', slug: 'ai-token-price-comparison' },
  { _id: 'PXBreekz6ug9jLuKVwZKwz', lang: 'en', slug: 'ai-api-pricing-token-fees-vs-functionality-costs' },
  { _id: 'VKNTFpWe8NfJwy5gVWHDkk-vi', lang: 'vi', slug: 'cloud-agency-contracts-ai-api-risks' },
  { _id: 'dShP6JdGzwBHy3qr2AsvVI-vi', lang: 'vi', slug: 'lowering-ai-token-expenses-strategies-for-cost-optimization' },
  { _id: 'g3jTIj9ubDWnGQfo9PjMAq', lang: 'en', slug: 'multi-model-platform-benefits-applications' },
  { _id: 'lT0MJhwbFtcMofmR8I8yJt-vi', lang: 'vi', slug: 'choosing-affordable-ai-apis-for-new-users' },
  { _id: 'uomub2hTG94T3nqbFWijkq-vi', lang: 'vi', slug: 'confidential-documents-ai-apis-risks-precautions' },
  { _id: 'uomub2hTG94T3nqbFXWzo9', lang: 'en', slug: 'calculating-ai-token-costs-made-easy' },
  { _id: 'uomub2hTG94T3nqbFXWzo9-vi', lang: 'vi', slug: 'calculating-ai-token-costs-made-easy' },
];
const SPLIT_DOCS = [
  { _id: 'VdSyE50eHa1ZkhVq3P8eci-vi', lang: 'vi', slug: 'ai-token-basics-for-beginners', blockKey: 'bgy4aea5' },
  { _id: 'VdSyE50eHa1ZkhVq3P8fQs', lang: 'es', slug: 'tokens-de-inteligencia-artificial-basico', blockKey: 'bgy4aea5' },
  { _id: 'VdSyE50eHa1ZkhVq3P8fpx', lang: 'id', slug: 'token-ai-basik', blockKey: 'bgy4aea5' },
];
const ALL_DOCS = [...PROMPT_DOCS, ...SPLIT_DOCS];
const urlOf = d => `/${d.lang}/blog/${d.slug}/`;
/** Keys of the bullets that replace a split block: `bgy4aea5-1`, `bgy4aea5-2`, … */
const splitKey = (blockKey, i) => `${blockKey}-${i + 1}`;

// ── CSV helpers ───────────────────────────────────────────────────────────
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
const csvCell = v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── --check-dist <build.log> ──────────────────────────────────────────────
if (CHECK_DIST) {
  const logFile = process.argv[process.argv.indexOf('--check-dist') + 1];
  if (!logFile || logFile.startsWith('--') || !existsSync(logFile)) {
    console.error('Usage: npm run build 2>&1 | tee build.log && node scripts/patch-portable-text.mjs --check-dist build.log');
    process.exit(1);
  }
  if (!existsSync('dist')) { console.error('No dist/. Run npm run build first.'); process.exit(1); }
  const fails = [];
  const defectLines = readFileSync(logFile, 'utf8').split('\n').filter(l => l.includes('[portable-text]'));
  console.log(`${defectLines.length ? 'FAIL' : 'PASS'} [portable-text] lines in ${logFile}: ${defectLines.length}`);
  for (const l of defectLines.slice(0, 20)) console.log(`  - ${l.trim().slice(0, 200)}`);
  if (defectLines.length) fails.push('build log');

  // The tier strings come from the backups (what was split), so this needs --apply to have run.
  for (const d of SPLIT_DOCS) {
    const file = join('dist', urlOf(d), 'index.html');
    const backup = join(BACKUP_DIR, `${d._id}.json`);
    if (!existsSync(file)) { console.log(`FAIL ${urlOf(d)}: missing from dist/`); fails.push(d._id); continue; }
    if (!existsSync(backup)) { console.log(`FAIL ${urlOf(d)}: no backup in ${BACKUP_DIR}/ — --apply has not run`); fails.push(d._id); continue; }
    const html = readFileSync(file, 'utf8');
    const block = (JSON.parse(readFileSync(backup, 'utf8')).body ?? []).find(b => b._key === d.blockKey);
    const items = (block?.children ?? []).flatMap(c => (Array.isArray(c.text) ? c.text : []));
    const inLi = items.filter(t => html.includes(`<li>${escapeHtml(t)}</li>`));
    const ok = items.length > 0 && inLi.length === items.length;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${urlOf(d)}: ${inLi.length}/${items.length} tier strings render as <li>`);
    if (!ok) fails.push(d._id);
  }
  if (fails.length && !existsSync(BACKUP_DIR)) {
    console.log('\nExpected before --apply: the defects are still in Sanity and nothing has been split yet.');
  }
  process.exit(fails.length ? 1 : 0);
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
const draftNote = draftsChecked ? '' : ' (drafts not checked: no token in this dry run; --apply always checks)';

async function existingDrafts(ids) {
  if (!draftsChecked) return new Set();
  return new Set(await client.fetch('*[_id in $d]._id', { d: ids.map(i => `drafts.${i}`) }));
}
async function fetchPublished(ids) {
  return new Map((await client.fetch(
    '*[_id in $ids && !(_id in path("drafts.**"))]{_id, _rev, _type, language, "slug": slug.current, body}', { ids },
  )).map(d => [d._id, d]));
}
/** Published, at the planned URL, no draft — or the reason it is skipped. */
function docSkip(plan, doc, drafts) {
  if (!doc) return 'no longer published';
  if (doc._type !== 'post' || doc.language !== plan.lang || doc.slug !== plan.slug) return `that _id now lives at /${doc.language}/blog/${doc.slug}/ (${doc._type})`;
  if (drafts.has(`drafts.${plan._id}`)) return 'a draft exists; Studio would show it, and publishing it later would undo this';
  return null;
}
function writeLog(name) {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, name);
  writeFileSync(path, log.join('\n') + '\n');
  console.log(`Log → ${path}${problems ? `\n${problems} problem(s); see above.` : ''}`);
  process.exit(problems ? 1 : 0);
}
async function commit(patches) {
  const tx = client.transaction();
  for (const p of patches) tx.patch(p.id, p.build);
  try { await tx.commit({ visibility: 'sync' }); return true; } catch (err) { say(`FAILED, nothing written: ${err.message}`); problems++; return false; }
}

// ── --revert: put back only the blocks this script touched ────────────────
if (REVERT) {
  say(`# Portable-text REVERT ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
  say('');
  const backups = existsSync(BACKUP_DIR)
    ? readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join(BACKUP_DIR, f), 'utf8')))
    : [];
  say(`Backups in ${BACKUP_DIR}/: ${backups.length}${backups.length ? '' : ' — nothing has been applied, nothing to revert.'}`);
  say('');
  const current = await fetchPublished(backups.map(b => b._id));
  const drafts = await existingDrafts(backups.map(b => b._id));
  const plan = [], skips = [];
  for (const b of backups) {
    const target = ALL_DOCS.find(d => d._id === b._id);
    const doc = current.get(b._id);
    const where = `\`${b._id}\` ${target ? urlOf(target) : '(not in plan)'}`;
    const skip = !target ? 'not one of this script\'s documents' : docSkip(target, doc, drafts);
    if (skip) { skips.push(`${where}: ${skip}`); continue; }

    const split = SPLIT_DOCS.find(d => d._id === b._id);
    let body = [...doc.body];
    const notes = [];
    if (split) {
      const original = b.body.find(x => x._key === split.blockKey);
      const items = original.children.flatMap(c => (Array.isArray(c.text) ? c.text : [c.text]));
      const bullets = items.map((_, i) => body.findIndex(x => x._key === splitKey(split.blockKey, i)));
      const intact = bullets.every(i => i >= 0) && bullets.every((at, i) => body[at].children?.map(c => c.text).join('') === items[i]);
      if (!intact) { skips.push(`${where}: the bullets were edited or moved since; revert by hand from the backup`); continue; }
      body.splice(bullets[0], bullets.length, original);
      notes.push(`3 bullets → original block \`${split.blockKey}\``);
    } else {
      // Re-insert each deleted imagePrompt after the nearest block that preceded it.
      const deleted = b.body.filter(x => x._type === 'imagePrompt' && !body.some(y => y._key === x._key));
      if (!deleted.length) { skips.push(`${where}: no deleted imagePrompt blocks to restore`); continue; }
      for (const block of deleted) {
        const at = b.body.findIndex(x => x._key === block._key);
        let anchor = -1;
        for (let i = at - 1; i >= 0 && anchor < 0; i--) anchor = body.findIndex(y => y._key === b.body[i]._key);
        body.splice(anchor + 1, 0, block);
      }
      notes.push(`${deleted.length} imagePrompt block(s) restored at their original positions`);
    }
    plan.push({ id: b._id, rev: doc._rev, body, where, notes });
  }
  say(`## ${APPLY ? 'Reverting' : 'Would revert'}: ${plan.length} document(s) in ONE transaction`);
  for (const p of plan) say(`- ${p.where}: ${p.notes.join('; ')}`);
  say('');
  say(`## Guard skips: ${skips.length}${draftNote}`);
  for (const s of skips) say(`- ${s}`);
  say('');
  if (APPLY && plan.length && await commit(plan.map(p => ({ id: p.id, build: q => q.set({ body: p.body }).ifRevisionId(p.rev) })))) {
    say('### Re-read');
    for (const p of plan) {
      const keys = (await client.fetch('*[_id == $id][0].body[]._key', { id: p.id })) ?? [];
      const ok = keys.join() === p.body.map(x => x._key).join();
      say(`- ${p.where}: ${ok ? 'body matches the reverted plan' : 'FAILED: body differs from the plan'}`);
      if (!ok) problems++;
    }
    say('');
  }
  writeLog(APPLY ? 'portable-text-revert-log.md' : 'portable-text-revert-dryrun.md');
}

// ── Apply / dry run ───────────────────────────────────────────────────────
say(`# Portable-text fixes ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');
const published = await fetchPublished(ALL_DOCS.map(d => d._id));
const drafts = await existingDrafts(ALL_DOCS.map(d => d._id));

// Export the prompts before anything else. Written once: after --apply the blocks
// are gone, and a re-run must not replace the record with an empty file.
if (!existsSync(EXPORT_CSV)) {
  const rows = [];
  for (const d of PROMPT_DOCS) {
    for (const b of published.get(d._id)?.body ?? []) {
      if (b?._type === 'imagePrompt') rows.push({ doc_id: d._id, locale: d.lang, url: SITE + urlOf(d), _key: b._key, text: b.text ?? '' });
    }
  }
  if (APPLY) { console.error(`${EXPORT_CSV} is missing. Run the dry run first, review the export, then --apply.`); process.exit(1); }
  mkdirSync(OUT_DIR, { recursive: true });
  const cols = ['doc_id', 'locale', 'url', '_key', 'text'];
  writeFileSync(EXPORT_CSV, [cols.join(','), ...rows.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\n') + '\n');
  say(`Exported ${rows.length} imagePrompt block(s) to \`${EXPORT_CSV}\`.`);
} else {
  say(`Export \`${EXPORT_CSV}\` already exists; kept as is.`);
}
const exported = parseCsv(readFileSync(EXPORT_CSV, 'utf8'));
say('');

const patches = [], skips = [], lines = [];
let deletions = 0, splits = 0;

// A. imagePrompt deletions — only the blocks in the export, with the same text.
for (const d of PROMPT_DOCS) {
  const doc = published.get(d._id);
  const where = `\`${d._id}\` ${urlOf(d)}`;
  const skip = docSkip(d, doc, drafts);
  if (skip) { skips.push(`${where}: ${skip}`); continue; }
  const keys = [];
  for (const row of exported.filter(r => r.doc_id === d._id)) {
    const block = doc.body.find(b => b._key === row._key);
    if (!block) { skips.push(`${where} \`${row._key}\`: block already gone`); continue; }
    if (block._type !== 'imagePrompt') { skips.push(`${where} \`${row._key}\`: now a ${block._type}, not an imagePrompt`); continue; }
    if ((block.text ?? '') !== row.text) { skips.push(`${where} \`${row._key}\`: text differs from the export`); continue; }
    if (Object.keys(block).some(k => !['_key', '_type', 'text'].includes(k))) { skips.push(`${where} \`${row._key}\`: carries fields beyond text; check by hand`); continue; }
    keys.push(row._key);
  }
  const unexported = doc.body.filter(b => b?._type === 'imagePrompt' && !exported.some(r => r._key === b._key && r.doc_id === d._id));
  if (unexported.length) skips.push(`${where}: ${unexported.length} imagePrompt block(s) not in the export, left alone`);
  if (!keys.length) continue;
  deletions += keys.length;
  lines.push(`- A ${where}: delete ${keys.length} imagePrompt block(s) (${keys.map(k => `\`${k}\``).join(', ')})`);
  patches.push({ id: d._id, doc, keys, build: q => q.unset(keys.map(k => `body[_key=="${k}"]`)).ifRevisionId(doc._rev) });
}

// B. split the flattened tier list into bullets, text kept exactly.
for (const d of SPLIT_DOCS) {
  const doc = published.get(d._id);
  const where = `\`${d._id}\` ${urlOf(d)}`;
  const skip = docSkip(d, doc, drafts);
  if (skip) { skips.push(`${where}: ${skip}`); continue; }
  const block = doc.body.find(b => b._key === d.blockKey);
  if (!block) { skips.push(`${where}: block \`${d.blockKey}\` is gone`); continue; }
  const children = block.children ?? [];
  const span = children.length === 1 ? children[0] : null;
  if (!span || span._type !== 'span' || !Array.isArray(span.text) || !span.text.every(t => typeof t === 'string')) {
    skips.push(`${where}: block \`${d.blockKey}\` no longer holds exactly one span with an array of strings`); continue;
  }
  const newKeys = span.text.map((_, i) => splitKey(d.blockKey, i));
  if (newKeys.some(k => doc.body.some(b => b._key === k))) { skips.push(`${where}: key ${newKeys.join('/')} already in use`); continue; }
  const bullets = span.text.map((text, i) => ({
    _type: 'block', _key: newKeys[i], style: block.style ?? 'normal', listItem: 'bullet', level: 1,
    markDefs: block.markDefs ?? [],
    children: [{ _type: 'span', _key: `${span._key ?? 's'}-${i + 1}`, marks: span.marks ?? [], text }],
  }));
  splits++;
  lines.push(`- B ${where}: block \`${d.blockKey}\` → ${bullets.length} bullets: ${span.text.map(t => `"${t}"`).join(' · ')}`);
  patches.push({ id: d._id, doc, bullets, build: q => q.insert('replace', `body[_key=="${d.blockKey}"]`, bullets).ifRevisionId(doc._rev) });
}

say(`## Plan: ${deletions} imagePrompt deletion(s) in ${patches.filter(p => p.keys).length} doc(s) · ${splits} block split(s)`);
say('');
for (const l of lines) say(l);
say('');
say(`## Guard skips: ${skips.length}${draftNote}`);
for (const s of skips) say(`- ${s}`);
say('');
say(`## ${APPLY ? 'Writing' : 'Would write'}: ${patches.length} patch(es) in ONE transaction, each pinned to the _rev read now`);
say('');

if (APPLY && patches.length) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  let kept = 0;
  for (const p of patches) {
    const file = join(BACKUP_DIR, `${p.id}.json`);
    // An earlier backup is the original state; never overwrite it.
    if (existsSync(file)) { kept++; continue; }
    writeFileSync(file, JSON.stringify(await client.fetch('*[_id == $id][0]', { id: p.id }), null, 2) + '\n');
  }
  say(`Backed up ${patches.length - kept} document(s) to ${BACKUP_DIR}/${kept ? ` (${kept} earlier backup(s) kept)` : ''}.`);
  if (await commit(patches)) {
    say('');
    say('### Re-read');
    for (const p of patches) {
      const after = await client.fetch('{"body": *[_id == $id][0].body, "draft": defined(*[_id == $d][0])}', { id: p.id, d: `drafts.${p.id}` });
      const keys = new Set((after.body ?? []).map(b => b._key));
      const ok = !after.draft && (p.keys
        ? p.keys.every(k => !keys.has(k))
        : p.bullets.every(n => after.body.find(b => b._key === n._key)?.children?.[0]?.text === n.children[0].text));
      say(`- \`${p.id}\`: ${ok ? (p.keys ? `${p.keys.length} block(s) gone` : `${p.bullets.length} bullets present, text exact`) : 'FAILED'}${after.draft ? ' (a draft appeared)' : ''}`);
      if (!ok) problems++;
    }
  }
  say('');
}

say('## After the next build');
say('');
say('`npm run build 2>&1 | tee build.log && node scripts/patch-portable-text.mjs --check-dist build.log`: expect 0 [portable-text] lines and every tier string inside <li>.');
say('');
say('Undo: `node scripts/patch-portable-text.mjs --revert` (dry run), then `SANITY_TOKEN=… … --revert --apply`.');
say('');

writeLog(APPLY ? 'portable-text-log.md' : 'portable-text-dryrun.md');
