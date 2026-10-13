/**
 * patch-retire-not-indexed.mjs
 *
 * S8: unpublishes the RETIRE and MERGE rows of the "crawled – currently not
 * indexed" triage (audits/2026-10-13/not-indexed-triage.csv). KEEP and
 * ALREADY RETIRED rows are never touched.
 *
 * Unpublish = Sanity's unpublish action: the published document moves into its
 * draft. Nothing is deleted, and every post can be republished from the Studio.
 * A MERGE row is unpublished the same way; the 301 to its survivor is an Amplify
 * console rule, so the dry run prints those redirects for setting by hand.
 *
 * Same pattern as patch-per-token-phase1.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs SANITY_TOKEN from the shell.
 *   - Guard: a row is skipped, and reported, if its document is no longer
 *     published, or if the published document at that URL is not the CSV's _id.
 *   - Every document is backed up to audits/2026-10-13/retire-backup/ before the
 *     write; all unpublishes go in one request; each is re-read afterwards.
 *   - Logs: retire-log.md for --apply, retire-dryrun.md otherwise.
 *
 * The dry run also reports what this script deliberately does not change:
 * published blocks that link to a retired page, and translation siblings that
 * stay published.
 *
 * Usage:
 *   node scripts/patch-retire-not-indexed.mjs
 *   SANITY_TOKEN=… node scripts/patch-retire-not-indexed.mjs --apply
 */
import { createClient } from '@sanity/client';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const TOKEN = process.env.SANITY_TOKEN;
const OUT_DIR = 'audits/2026-10-13';
const CSV = join(OUT_DIR, 'not-indexed-triage.csv');
const IN_SCOPE = new Set(['RETIRE', 'MERGE']);

if (APPLY && !TOKEN) {
  console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  process.exit(1);
}
const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'raw', token: APPLY ? TOKEN : undefined,
});

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

const log = [];
const say = line => { console.log(line); log.push(line); };
let problems = 0;
const textOf = b => (b?.children ?? []).map(c => c.text ?? '').join('');

say(`# S8 retire ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');

// ── Plan ──────────────────────────────────────────────────────────────────
const rows = parseCsv(readFileSync(CSV, 'utf8')).filter(r => IN_SCOPE.has(r.action));
const ids = rows.map(r => r._id);
const published = new Map((await client.fetch(
  '*[_id in $ids && !(_id in path("drafts.**"))]{_id, _rev, language, "slug": slug.current, translationKey, articleNumber}', { ids },
)).map(d => [d._id, d]));
const drafts = APPLY ? new Set(await client.fetch('*[_id in $d]._id', { d: ids.map(i => `drafts.${i}`) })) : new Set();

const plan = [];
const skips = [];
for (const r of rows) {
  const path = new URL(r.url).pathname;
  const doc = published.get(r._id);
  if (!doc) { skips.push(`\`${r._id}\` ${path}: no longer published`); continue; }
  if (`/${doc.language}/blog/${doc.slug}/` !== path) { skips.push(`\`${r._id}\` ${path}: that _id now lives at /${doc.language}/blog/${doc.slug}/`); continue; }
  if (drafts.has(`drafts.${r._id}`)) { skips.push(`\`${r._id}\` ${path}: a draft already exists; unpublishing would replace it`); continue; }
  plan.push({ row: r, doc, path });
}

const L = ['vi', 'en', 'es', 'id'];
const sum = (list, k) => list.reduce((n, p) => n + (+p.row[k] || 0), 0);
say('## Plan');
say('');
say('| | vi | en | es | id | Total | Impressions | Clicks |');
say('|---|---:|---:|---:|---:|---:|---:|---:|');
for (const a of ['RETIRE', 'MERGE']) {
  const ps = plan.filter(p => p.row.action === a);
  say(`| ${a} | ${L.map(l => ps.filter(p => p.doc.language === l).length).join(' | ')} | ${ps.length} | ${sum(ps, 'impressions')} | ${sum(ps, 'clicks')} |`);
}
say(`| **Total** | ${L.map(l => plan.filter(p => p.doc.language === l).length).join(' | ')} | ${plan.length} | ${sum(plan, 'impressions')} | ${sum(plan, 'clicks')} |`);
say('');
say(`Skipped by the guard: ${skips.length}`);
for (const s of skips) say(`- ${s}`);
say('');

const merges = plan.filter(p => p.row.action === 'MERGE');
if (merges.length) {
  say('MERGE rows are unpublished here; set these 301s in the Amplify console (not in git):');
  for (const p of merges) say(`- ${p.path} → ${new URL(p.row.target_url).pathname}`);
  say('');
}

// ── Inbound body links to pages about to go ───────────────────────────────
say('## Published blocks that link to a retired page (not changed by this script)');
say('');
const retiring = new Map(plan.map(p => [p.path, p]));
const everything = await client.fetch('*[!(_type match "sanity.*") && !(_type match "system.*") && !(_id in path("drafts.**"))]');
let inboundCount = 0;
for (const d of everything) {
  if (retiring.has(`/${d.language}/blog/${d.slug?.current}/`) && plan.some(p => p.doc._id === d._id)) continue;
  for (const [field, val] of Object.entries(d)) {
    if (!Array.isArray(val)) continue;
    for (const b of val) {
      if (b?._type !== 'block') continue;
      for (const md of b.markDefs ?? []) {
        const href = md.href ?? '';
        const target = [...retiring.keys()].find(p => href.replace(/^https?:\/\/(www\.)?aitoken\.global/, '').replace(/\/?$/, '/') === p);
        if (!target) continue;
        inboundCount++;
        const anchor = b.children.filter(c => c.marks?.includes(md._key)).map(c => c.text).join('');
        const whole = anchor.trim() === textOf(b).trim();
        say(`- in \`${d._id}\` (${d._type}${d.language ? ', ' + d.language : ''}${d.slug?.current ? ' /' + d.language + '/blog/' + d.slug.current + '/' : ''}), ${field} block \`${b._key}\`, mark \`${md._key}\` → ${target}`);
        say(`  - anchor: "${anchor}"${whole ? ' (the whole block)' : ''}`);
        say(`  - block: "${textOf(b)}"`);
      }
    }
  }
}
if (!inboundCount) say('None.');
say('');

// ── Translation siblings that stay published ──────────────────────────────
say('## Translation groups where a sibling stays published');
say('');
const retiringIds = new Set(plan.map(p => p.doc._id));
const keys = [...new Set(plan.map(p => p.doc.translationKey).filter(Boolean))];
const siblings = await client.fetch('*[_type == "post" && translationKey in $keys && !(_id in path("drafts.**"))]{_id, language, "slug": slug.current, translationKey}', { keys });
let mixed = 0;
for (const k of keys) {
  const all = siblings.filter(s => s.translationKey === k);
  const going = all.filter(s => retiringIds.has(s._id)), staying = all.filter(s => !retiringIds.has(s._id));
  if (!staying.length) continue;
  mixed++;
  say(`- ${going.map(s => `${s.language} /${s.language}/blog/${s.slug}/`).join(', ')} retire; stay: ${staying.map(s => s.language).join('/')}`);
}
if (!mixed) say('None.');
say('');
say(`Groups with a published sibling: ${mixed}. The build drops hreflang to a retired page on its own: alternates come from published posts only (getAlternatesForPost in src/lib/sanity.ts), so the next build stops emitting the pair.`);
say('');

// ── Write ─────────────────────────────────────────────────────────────────
say(`## ${APPLY ? 'Writing' : 'Would write'}: ${plan.length} unpublish action(s) in one request`);
say('');
if (APPLY && plan.length) {
  const dir = join(OUT_DIR, 'retire-backup');
  mkdirSync(dir, { recursive: true });
  for (const p of plan) {
    const full = await client.fetch('*[_id == $id][0]', { id: p.doc._id });
    writeFileSync(join(dir, `${p.doc._id}.json`), JSON.stringify(full, null, 2) + '\n');
  }
  say(`Backed up ${plan.length} document(s) to ${dir}/.`);
  try {
    await client.action(plan.map(p => ({ actionType: 'sanity.action.document.unpublish', publishedId: p.doc._id, draftId: `drafts.${p.doc._id}` })));
  } catch (err) {
    say(`FAILED: ${err.message}`);
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
  say('');
}

mkdirSync(OUT_DIR, { recursive: true });
const logPath = join(OUT_DIR, APPLY ? 'retire-log.md' : 'retire-dryrun.md');
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`Log → ${logPath}${problems ? `\n${problems} problem(s); see above.` : ''}`);
process.exit(problems ? 1 : 0);
