/**
 * patch-accuracy.mjs
 *
 * S10: corrects wrong numbers and false claims in the body text of 24 posts
 * (6 source articles × 4 locales). The edits live in
 * audits/2026-10-15/accuracy-fixes/<locale>-<slug>.json, one file per post:
 *   { _id, locale, slug, sourceRev, bodyLanguage, item, group, snapshot,
 *     spans: { <blockKey>: { <spanKey>: { before, after, reason } } } }
 * Only the listed span texts change. Titles, excerpts, SEO fields, slugs,
 * image alts, marks, links and every other span stay exactly as they are.
 *
 * Same safety pattern as patch-translate-bodies.mjs:
 *   - DRY RUN BY DEFAULT. Nothing is written without --apply.
 *   - --apply needs --group winner|rest, so the four winner posts (item 1/2)
 *     can be applied separately after review. A dry run without --group
 *     covers both groups.
 *   - Guards, per post (any failure skips the post, never a partial write):
 *       published at its locale/slug, _id matches, _rev equals the one pinned
 *       in the JSON, no draft open (on --apply), every listed span still reads
 *       its "before" text exactly, no residual false claim left in the patched
 *       body, no per-token price figure in any edited span, any "$X per
 *       1 million tokens" inside PRICE_SCALE, every worked calculation
 *       re-computed here and found in the new text, and no English-stopword
 *       rise on translated bodies.
 *   - --apply backs up each document first, writes ONE transaction per post
 *     pinned with ifRevisionId, then re-reads the whole body and checks it
 *     equals the expected body (old body + listed edits, nothing else).
 *   - Every log, backup folder and dry-run report is date-stamped, so no run
 *     overwrites an earlier one.
 *   - --check-dist (after `npm run build`) and --check-live (after the
 *     Amplify rebuild) read the rendered pages: same URL and <title>, none
 *     of the old false strings, every new text present, no stopword regression.
 *
 * Usage:
 *   node scripts/patch-accuracy.mjs                        # dry run, both groups
 *   node scripts/patch-accuracy.mjs --group rest           # dry run, one group
 *   SANITY_TOKEN=… node scripts/patch-accuracy.mjs --apply --group rest
 *   node scripts/patch-accuracy.mjs --check-dist [--group …]
 *   node scripts/patch-accuracy.mjs --check-live [--group …]
 *
 * SANITY_TOKEN: an Editor token from sanity.io/manage → API → Tokens, with an
 * expiry, exported for this run only. Never in .env, never committed.
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const CHECK_DIST = argv.includes('--check-dist');
const CHECK_LIVE = argv.includes('--check-live');
const GROUP = argv.includes('--group') ? argv[argv.indexOf('--group') + 1] : null;
const TOKEN = process.env.SANITY_TOKEN;
if (GROUP !== null && !['winner', 'rest'].includes(GROUP)) { console.error('--group must be "winner" or "rest".'); process.exit(1); }
if (APPLY && !GROUP) { console.error('--apply needs --group winner or --group rest.'); process.exit(1); }

const OUT_DIR = 'audits/2026-10-15';
const FIX_DIR = join(OUT_DIR, 'accuracy-fixes');
const STAMP = new Date().toISOString().replace(/:/g, '').slice(0, 17); // 2026-10-15T081233
const SITE = 'https://www.aitoken.global';

const fixes = readdirSync(FIX_DIR).filter(f => f.endsWith('.json')).sort()
  .map(f => ({ file: f, ...JSON.parse(readFileSync(join(FIX_DIR, f), 'utf8')) }))
  .filter(fx => !GROUP || fx.group === GROUP);
const editsOf = fx => Object.entries(fx.spans).flatMap(([bk, ss]) => Object.entries(ss).map(([sk, e]) => ({ bk, sk, ...e })));

// ── Text helpers ──────────────────────────────────────────────────────────
const EN_STOP = /\b(the|and|with|that|this|for|are|is|of|to|you|your|it|in|on|be|as|by|or|an|can|will|from|they|when|which)\b/gi;
const wordCount = t => (t.match(/[\p{L}\p{N}]+/gu) ?? []).length;
const enShare = t => (t.match(EN_STOP) ?? []).length / Math.max(1, wordCount(t));
const norm = t => t.replace(/\s+/g, ' ').trim();
const bodyText = body => (body ?? []).filter(b => b._type === 'block').flatMap(b => (b.children ?? []).map(s => s.text ?? '')).join('\n');
const decode = s => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

// Old false strings. None may remain in any of the 24 bodies after the fix.
const RESIDUAL = [
  '$0.10 per token', '$0.10/token', '$0.10 mỗi token',
  '$10 for 100 tokens', '$50 for 500 tokens', '$10 untuk 100 token', '$50 untuk 500 token', '$10 cho 100 token', '$50 cho 500 token',
  'each token costs $0.05', 'setiap token berharga $0.05', 'mỗi token có giá $0.05', 'approximately $50', 'total biayanya sekitar $50', 'vào khoảng $50',
  '10 tokens per word', '10 token per kata', '10 token mỗi từ', '$0.001 per word', '$0.001 per kata', '$0.001 mỗi từ',
  'OpenAI will review your application', 'meninjau pengajuanmu', 'xem xét đơn đăng ký',
  'choose between different pricing tiers', 'memilih di antara beberapa tingkatan harga', 'lựa chọn giữa các gói giá khác nhau',
  'GPT-3.5 architecture', 'arquitectura GPT-3.5', 'kiến trúc GPT-3.5', 'tiered pricing plans', 'planes de precios escalonados', 'các gói giá theo bậc',
  'without requiring an additional payment', 'tanpa memerlukan pembayaran tambahan', 'không yêu cầu khoản thanh toán bổ sung',
  'payment method for accessing API', 'metode pembayaran untuk mengakses', 'phương thức thanh toán để truy cập',
  /\bRNN\b/, /\bGNN\b/, "'science'", "'arts'",
  'lack of explicit information on token counts', 'thiếu thông tin rõ ràng về số lượng token',
];
const residualIn = t => RESIDUAL.filter(r => (typeof r === 'string' ? t.includes(r) : r.test(t))).map(String);

// Per-token price figures, as the S7e sweep reads them: none allowed in an edited span.
const FIG = /(?:US)?\$\s?\d[\d.,]*\d|(?:US)?\$\s?\d/gu;
const PER_TOKEN_AFTER = /^\s*(?:\/\s?token\b|(?:per|each|por(?: cada)?|setiap|mỗi)\s(?:input\s|output\s)?tokens?\b)/iu;
const perTokenFigures = t => [...t.matchAll(FIG)].filter(m => PER_TOKEN_AFTER.test(t.slice(m.index + m[0].length, m.index + m[0].length + 30))).map(m => m[0]);
// PRICE_SCALE: an illustrative "$X per 1 million tokens" must sit in $0.05–$100.
const PER_MILLION = /\$\s?(\d[\d.,]*)\s*(?:,\s*)?(?:per|cho mỗi|untuk setiap)\s1\s(?:million|juta|triệu)\s?tokens?/giu;
const perMillionRates = t => [...t.matchAll(PER_MILLION)].map(m => Number(m[1].replace(/,/g, '')));

// Worked calculations, re-computed here. Each must appear in the new text of
// that span in every locale (English bodies write 200,000; translated id/es/vi bodies write 200.000).
const fmt = (n, lang) => ['vi', 'id', 'es'].includes(lang) ? n.toLocaleString('de-DE') : n.toLocaleString('en-US');
const CHECKS = {
  '94vhyrzk': lang => { const tokens = 100 * 2000, cost = tokens / 1e6 * 10; return [
    { label: '100 requests × 2,000 tokens', value: tokens, expect: [fmt(tokens, lang)] },
    { label: `${fmt(tokens, 'en')} tokens × $10 per 1M`, value: cost, expect: [`$${cost} (`] }]; },
  'u0iww5yn': lang => { const tokens = 1000 * 10, cost = tokens / 1e6 * 10; return [
    { label: '1,000 tokens/min × 10 min', value: tokens, expect: [fmt(tokens, lang)] },
    { label: `${fmt(tokens, 'en')} tokens × $10 per 1M`, value: cost, expect: [`$${cost.toFixed(2)}`] },
    { label: 'old text: 10,000 tokens × $0.05 (was printed as $50)', value: tokens * 0.05, expect: [] }]; },
  '24i9nfn2': lang => { const est = Math.round(1000 * 100 / 75), used = 1300, cost = used * 10 / 1e6; return [
    { label: '1,000 words × (100 tokens / 75 words)', value: est, expect: [], within: Math.abs(est - used) / est <= 0.05 },
    { label: `${fmt(used, 'en')} tokens × $10 / 1,000,000`, value: cost, expect: [fmt(used, lang), `$${cost}`] }]; },
  'cmow8c1d': () => [{ label: 'one illustrative rate, $10 per 1M tokens', value: 10, expect: ['$10'] }],
  'cvx3nxea': () => [{ label: 'same illustrative rate, $10 per 1M tokens', value: 10, expect: ['$10'] }],
};

// ── --check-dist / --check-live ───────────────────────────────────────────
async function readPage(fx) {
  const path = `/${fx.locale}/blog/${fx.slug}/`;
  if (CHECK_DIST) {
    const f = join('dist', fx.locale, 'blog', fx.slug, 'index.html');
    return existsSync(f) ? readFileSync(f, 'utf8') : null;
  }
  const res = await fetch(SITE + path, { redirect: 'follow', headers: { 'cache-control': 'no-cache' } });
  return res.ok && res.url.replace(/\/?$/, '/') === SITE + path ? await res.text() : null;
}
if (CHECK_DIST || CHECK_LIVE) {
  const lines = [`# S10 accuracy ${CHECK_DIST ? 'check-dist' : 'check-live'}: ${new Date().toISOString()}`, ''];
  let fail = 0;
  for (const fx of fixes) {
    const path = `/${fx.locale}/blog/${fx.slug}/`;
    const html = await readPage(fx);
    if (!html) { lines.push(`FAIL ${path}: page missing (or redirected)`); fail++; continue; }
    const problems = [];
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical !== SITE + path) problems.push(`canonical is ${canonical}`);
    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    const expected = fx.snapshot.seoTitle ?? fx.snapshot.title;
    if (fx.snapshot.seoTitle ? title !== expected : !title.startsWith(expected)) problems.push(`<title> is "${title}", expected "${expected}"`);
    const m = html.match(/<div class="article-body"[^>]*>([\s\S]*?)<\/div>\s*<!--|<div class="article-body"[^>]*>([\s\S]*?)<section class="post-tools/);
    const body = norm(decode((m?.[1] ?? m?.[2] ?? '').replace(/<[^>]+>/g, ' ')));
    if (body.length < 500) problems.push('article body not found');
    const left = residualIn(body);
    if (left.length) problems.push(`old text still present: ${left.join(' · ')}`);
    const missing = editsOf(fx).filter(e => !body.includes(norm(e.after)));
    if (missing.length) problems.push(`new text missing in ${missing.map(e => e.bk).join(', ')}`);
    const share = enShare(body);
    if (fx.bodyLanguage !== 'en' && share >= 0.05) problems.push(`English stopwords ${(100 * share).toFixed(1)}%`);
    if (problems.length) fail++;
    lines.push(`${problems.length ? 'FAIL' : 'PASS'} [${fx.group}] ${path}: ${problems.length ? problems.join('; ') : `URL + <title> unchanged, 0 old strings, ${editsOf(fx).length}/${editsOf(fx).length} new spans present${fx.bodyLanguage !== 'en' ? `, English stopwords ${(100 * share).toFixed(1)}%` : ''}`}`);
  }
  lines.push('', `${fixes.length - fail}/${fixes.length} pass.`);
  console.log(lines.join('\n'));
  const out = join(OUT_DIR, `accuracy-${CHECK_DIST ? 'check-dist' : 'check-live'}-${GROUP ?? 'all'}-${STAMP}.md`);
  writeFileSync(out, lines.join('\n') + '\n');
  console.log(`Log → ${out}`);
  process.exit(fail ? 1 : 0);
}

// ── Resolve and guard ─────────────────────────────────────────────────────
if (APPLY && !TOKEN) { console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).'); process.exit(1); }
const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'published', token: APPLY ? TOKEN : undefined,
});
const log = [];
const say = line => { console.log(line); log.push(line); };
let skipped = 0;
const ready = [];

say(`# S10 accuracy fixes ${APPLY ? `APPLY --group ${GROUP}` : `DRY RUN${GROUP ? ` --group ${GROUP}` : ' (both groups)'}`}: ${new Date().toISOString()}`);
say('');
say(`${fixes.length} post(s) from \`${FIX_DIR}/\`. Only the listed span texts change; titles, excerpts, SEO fields, slugs, image alts, marks and links are not touched.`);
say('');

for (const fx of fixes) {
  const path = `/${fx.locale}/blog/${fx.slug}/`;
  say(`## ${fx.group === 'winner' ? '★ ' : ''}[${fx.group}] item ${fx.item} · ${fx.locale} \`${path}\` · \`${fx._id}\``);
  say('');
  const found = await client.fetch('*[_type == "post" && language == $l && slug.current == $s]{_id, _rev, language, title, excerpt, seo, body}', { l: fx.locale, s: fx.slug });
  const doc = found[0];
  const problems = [];
  if (found.length !== 1) problems.push(`${found.length} published posts at ${path}`);
  else {
    if (doc._id !== fx._id) problems.push(`_id is ${doc._id}, JSON says ${fx._id}`);
    if (doc._rev !== fx.sourceRev) problems.push(`_rev is ${doc._rev}, pinned ${fx.sourceRev}: edited since the JSON was made`);
    for (const [k, v] of Object.entries(fx.snapshot)) {
      const cur = k.startsWith('seo') ? doc.seo?.[k] ?? null : doc[k] ?? null;
      if (JSON.stringify(cur) !== JSON.stringify(v ?? null)) problems.push(`${k} differs from the snapshot`);
    }
    if (APPLY) {
      const draft = await client.fetch('*[_id == $id][0]._id', { id: `drafts.${fx._id}` }, { perspective: 'raw' });
      if (draft) problems.push('a draft is open in the Studio; publish or discard it first');
    }
  }
  if (problems.length) { say(`SKIP: ${problems.join('; ')}. Nothing written.`); say(''); skipped++; continue; }

  // Simulate the patch on a copy, then check it.
  const expected = structuredClone(doc.body);
  const set = {};
  for (const e of editsOf(fx)) {
    const block = expected.find(b => b._key === e.bk && b._type === 'block');
    const span = block?.children?.find(s => s._key === e.sk && s._type === 'span');
    if (!span) { problems.push(`span ${e.bk}/${e.sk} not found`); continue; }
    if (span.text !== e.before) { problems.push(`span ${e.bk}/${e.sk} no longer reads its "before" text`); continue; }
    if (!e.after || e.after === e.before) { problems.push(`span ${e.bk}/${e.sk} has an empty or unchanged "after"`); continue; }
    span.text = e.after;
    set[`body[_key=="${e.bk}"].children[_key=="${e.sk}"].text`] = e.after;
  }
  const oldText = bodyText(doc.body), newText = bodyText(expected);
  const left = residualIn(newText);
  if (left.length) problems.push(`old false text would remain: ${left.join(' · ')}`);
  for (const e of editsOf(fx)) {
    const pt = perTokenFigures(e.after);
    if (pt.length) problems.push(`per-token figure in ${e.bk}: ${pt.join(', ')}`);
    for (const r of perMillionRates(e.after)) if (r < 0.05 || r > 100) problems.push(`${e.bk}: $${r} per 1M tokens is outside PRICE_SCALE`);
  }
  const checkLines = [];
  for (const e of editsOf(fx)) {
    for (const c of CHECKS[e.bk]?.(fx.bodyLanguage) ?? []) {
      const absent = c.expect.filter(x => !e.after.includes(x));
      const ok = !absent.length && c.within !== false;
      if (!ok) problems.push(`calculation ${e.bk} "${c.label}" not found in the new text (${absent.join(', ') || 'out of range'})`);
      checkLines.push(`- \`${e.bk}\` ${c.label} = ${c.value}${c.expect.length ? ` → text shows ${c.expect.map(x => `"${x}"`).join(', ')}` : ''}: ${ok ? 'ok' : 'FAIL'}`);
    }
  }
  const before = enShare(oldText), after = enShare(newText);
  if (fx.bodyLanguage !== 'en' && after > before + 0.005) problems.push(`English stopwords rise ${(100 * before).toFixed(1)}% → ${(100 * after).toFixed(1)}%`);

  if (problems.length) { say(`SKIP: ${problems.join('; ')}. Nothing written.`); say(''); skipped++; continue; }
  say(`Guards: **pass** · ${editsOf(fx).length} span(s) · \`_rev\` pinned to \`${fx.sourceRev}\` · body language ${fx.bodyLanguage}${fx.bodyLanguage !== fx.locale ? ' (untranslated English copy)' : ''} · old false strings left: 0 · per-token figures in edits: 0 · English stopwords ${(100 * before).toFixed(1)}% → ${(100 * after).toFixed(1)}%`);
  say('Not written: title · excerpt · SEO title · meta description · slug · image alts · marks · links.');
  if (checkLines.length) { say('Calculations:'); checkLines.forEach(say); }
  say('');
  say('| span | before | after | reason |');
  say('|---|---|---|---|');
  const cell = t => t.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  for (const e of editsOf(fx)) say(`| \`${e.bk}\` | ${cell(e.before)} | ${cell(e.after)} | ${cell(e.reason)} |`);
  say('');
  ready.push({ fx, doc, expected, set });
}

// ── Write: one transaction per post ───────────────────────────────────────
say(`## ${APPLY ? 'Writing' : 'Would write'}: ${ready.length} post(s), one transaction each${skipped ? ` · ${skipped} skipped` : ''}`);
for (const g of ['rest', 'winner']) { const n = ready.filter(r => r.fx.group === g).length; if (n) say(`- group ${g}: ${n} post(s), ${ready.filter(r => r.fx.group === g).reduce((a, r) => a + Object.keys(r.set).length, 0)} span(s)`); }
say('');
let failed = 0;
if (APPLY && ready.length) {
  const backupDir = join(OUT_DIR, `accuracy-backup-${GROUP}-${STAMP}`);
  mkdirSync(backupDir, { recursive: true });
  for (const { fx } of ready) {
    const full = await client.fetch('*[_id == $id][0]', { id: fx._id });
    writeFileSync(join(backupDir, `${fx._id}.json`), JSON.stringify(full, null, 2) + '\n');
  }
  say(`Backups → \`${backupDir}/\``);
  for (const { fx, expected, set } of ready) {
    try {
      await client.transaction().patch(fx._id, p => p.ifRevisionId(fx.sourceRev).set(set)).commit();
      const after = await client.fetch('*[_id == $id][0].body', { id: fx._id });
      const ok = JSON.stringify(after) === JSON.stringify(expected);
      if (!ok) failed++;
      say(`- \`${fx._id}\` /${fx.locale}/blog/${fx.slug}/: ${ok ? 're-read, whole body matches the expected body' : 'FAILED, re-read body differs from the expected body (restore from backup)'}`);
    } catch (err) {
      failed++;
      say(`- \`${fx._id}\` /${fx.locale}/blog/${fx.slug}/: NOT WRITTEN, ${err.message}`);
    }
  }
  say('');
}

const logPath = join(OUT_DIR, APPLY ? `accuracy-log-${GROUP}-${STAMP}.md` : `accuracy-dryrun-${GROUP ?? 'all'}-${STAMP}.md`);
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`Log → ${logPath}`);
process.exit(skipped || failed ? 1 : 0);
