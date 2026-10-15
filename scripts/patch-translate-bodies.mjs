/**
 * patch-translate-bodies.mjs
 *
 * S9: replaces the English body text of es/id posts with the translations in
 * audits/2026-10-14/translations/<locale>-<slug>.json. Each file holds one
 * translated string per text span, keyed by block _key and span _key, made from
 * that post's own live body at `sourceRev`.
 *
 * Only span `text` changes. Titles, excerpts, SEO fields, slugs, image alts and
 * every other field are never written; nothing is deleted; no redirects.
 *
 * Same pattern as patch-retire-not-indexed.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs SANITY_TOKEN from the shell.
 *   - Guards (a post that fails any is skipped and reported; nothing written):
 *       * the published post is still at <locale>/<slug> under the file's _id
 *       * its _rev still equals the file's sourceRev (nobody edited it since)
 *       * the translation covers exactly the post's text spans: none missing,
 *         none extra, none empty
 *       * the patched body has the same blocks, _keys, _types, styles,
 *         listItems, levels, marks, markDefs and link hrefs as before
 *       * per span, every number, price, percentage, URL, code string and
 *         model/brand name appears identically in source and translation
 *       * no per-token price figure that the source does not already have
 *       * links to /en/ pages are reported (there are none in batch 1)
 *   - --apply backs up each post to audits/2026-10-14/translate-backup/, writes
 *     one transaction per post pinned to sourceRev, and re-reads every span.
 *   - Logs: translate-dryrun.md (committed for review) or translate-log.md.
 *
 *   node scripts/patch-translate-bodies.mjs                 # dry run
 *   SANITY_TOKEN=… node scripts/patch-translate-bodies.mjs --apply
 *   node scripts/patch-translate-bodies.mjs --check-dist    # after the build
 *
 * --check-dist reads dist/<locale>/blog/<slug>/index.html for each post: the
 * page must exist at the same URL and its article body must be under 5%
 * English stopwords.
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const CHECK_DIST = process.argv.includes('--check-dist');
const TOKEN = process.env.SANITY_TOKEN;
const OUT_DIR = 'audits/2026-10-14';
const TR_DIR = join(OUT_DIR, 'translations');
const files = readdirSync(TR_DIR).filter(f => f.endsWith('.json')).sort();
const translations = files.map(f => ({ file: f, ...JSON.parse(readFileSync(join(TR_DIR, f), 'utf8')) }));

// ── Language and invariant helpers ────────────────────────────────────────
const EN_STOP = /\b(the|and|with|that|this|for|are|is|of|to|you|your|it|in|on|be|as|by|or|an|can|will|from|they|when|which)\b/gi;
const wordCount = t => (t.match(/[\p{L}\p{N}]+/gu) ?? []).length;
const enShare = t => (t.match(EN_STOP) ?? []).length / Math.max(1, wordCount(t));

const BRANDS = ['ChatGPT', 'OpenAI', 'Anthropic', 'Claude', 'Gemini', 'Google Cloud', 'Google', 'AWS', 'Azure', 'HashiCorp', 'Vault', 'Llama', 'Mistral', 'DeepSeek', 'Qwen', 'Responses API', 'Cohere', 'Hugging Face', 'Meta'];
const MODEL_RE = /\b(?:GPT|o)-?\d[\w.-]*|\b(?:Claude|Gemini|Llama|Mistral|Qwen|DeepSeek)\s\d[\w.]*/g;
/** Everything that must survive translation unchanged, as a sorted multiset. */
function invariants(t) {
  const out = [];
  for (const m of t.matchAll(/https?:\/\/\S+/g)) out.push('url:' + m[0]);
  for (const m of t.matchAll(/`[^`]+`/g)) out.push('code:' + m[0]);
  for (const m of t.matchAll(/(?:US)?\$\s?\d[\d.,]*\d|\$\d|\d[\d.,]*\d%?|\d%?/g)) out.push('num:' + m[0].replace(/\s/g, ''));
  for (const m of t.matchAll(MODEL_RE)) out.push('model:' + m[0]);
  let rest = t;
  for (const b of BRANDS) { const re = new RegExp(`(?<![\\p{L}])${b.replace(/ /g, '\\s')}(?![\\p{L}])`, 'gu'); const n = (rest.match(re) ?? []).length; for (let i = 0; i < n; i++) out.push('brand:' + b); rest = rest.replace(re, ' '); }
  return out.sort();
}
const diff = (a, b) => { const x = [...a], missing = []; for (const v of b) { const i = x.indexOf(v); if (i >= 0) x.splice(i, 1); else missing.push('+' + v); } return [...x.map(v => '-' + v), ...missing]; };

// Per-token price figures, as the S7e sweep and PRICE_SCALE read them.
const FIG = /(?:US)?\$\s?\d[\d.,]*\d|(?:US)?\$\s?\d|\b\d[\d.,]*\s?(?:USD|dólares?|dolar|đô la)\b/giu;
const AFTER_TOKEN = /^\s*(?:\/\s?token\b|(?:per|a|each|por(?: cada)?|setiap|mỗi)\s(?:input\s|output\s)?tokens?\b)/iu;
const BEFORE_TOKEN = /(?:per[- ]token|each token|every token|por token|cada token|setiap token|biaya per token|harga per token|mỗi token)[^.$\n]{0,30}$/iu;
const figures = t => [...t.matchAll(FIG)].map(m => {
  const start = m.index, end = start + m[0].length;
  const perToken = AFTER_TOKEN.test(t.slice(end, end + 40)) || BEFORE_TOKEN.test(t.slice(Math.max(0, start - 45), start));
  const value = Number(m[0].replace(/[^\d.]/g, ''));
  return { figure: m[0], index: start, perToken, perMillion: perToken ? value * 1e6 : null };
});
/** The sentence around position `at`. A sentence ends at . ! ? followed by whitespace or the end, so "$0.10" is never a boundary. */
function sentenceAt(t, at, len) {
  const isEnd = i => /[.!?]/.test(t[i]) && (i + 1 >= t.length || /\s/.test(t[i + 1]));
  let s = at; while (s > 0 && !isEnd(s - 1)) s--;
  let e = at + len; while (e < t.length && !isEnd(e)) e++;
  return t.slice(s, Math.min(t.length, e + 1)).trim();
}
/** Position of the n-th occurrence (0-based) of `needle` in `t`. */
function nthIndex(t, needle, n) { let i = -1; for (let k = 0; k <= n; k++) { i = t.indexOf(needle, i + 1); if (i < 0) return -1; } return i; }

// ── --check-dist ──────────────────────────────────────────────────────────
if (CHECK_DIST) {
  let fail = 0;
  for (const tr of translations) {
    const f = join('dist', tr.locale, 'blog', tr.slug, 'index.html');
    if (!existsSync(f)) { console.log(`FAIL /${tr.locale}/blog/${tr.slug}/: page missing from dist/`); fail++; continue; }
    const html = readFileSync(f, 'utf8');
    const m = html.match(/<div class="article-body"[^>]*>([\s\S]*?)<\/div>\s*<!--|<div class="article-body"[^>]*>([\s\S]*?)<section class="post-tools/);
    const body = (m?.[1] ?? m?.[2] ?? '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
    const share = enShare(body);
    const ok = body.length > 500 && share < 0.05;
    if (!ok) fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'} /${tr.locale}/blog/${tr.slug}/: English stopwords ${(100 * share).toFixed(1)}% of ${wordCount(body)} words`);
  }
  process.exit(fail ? 1 : 0);
}

if (APPLY && !TOKEN) {
  console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  process.exit(1);
}
const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'published', token: APPLY ? TOKEN : undefined,
});

const log = [];
const say = line => { console.log(line); log.push(line); };
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
let problems = 0;
const priceRows = [];
const ready = [];

say(`# S9 translate bodies ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');
say(`${translations.length} translation file(s) in \`${TR_DIR}/\`. Only span text is written; titles, excerpts, SEO fields, slugs and image alts are not touched.`);
say('');

for (const tr of translations) {
  const where = `${tr.locale} \`/${tr.locale}/blog/${tr.slug}/\``;
  const doc = await client.fetch('*[_type == "post" && language == $l && slug.current == $s][0]{_id, _rev, language, "slug": slug.current, title, excerpt, "seoTitle": seo.seoTitle, "seoDescription": seo.seoDescription, body}', { l: tr.locale, s: tr.slug });
  say(`## ${where}`);
  say('');
  const skip = why => { say(`**SKIP:** ${why}`); say(''); problems++; };
  if (!doc) { skip('not published'); continue; }
  if (doc._id !== tr._id) { skip(`published _id is \`${doc._id}\`, file says \`${tr._id}\``); continue; }
  if (doc._rev !== tr.sourceRev) { skip(`edited since translation: _rev \`${doc._rev}\`, translated from \`${tr.sourceRev}\``); continue; }

  // Coverage: exactly the post's text spans.
  const errs = [];
  const spans = [];
  for (const b of doc.body ?? []) {
    if (b._type !== 'block') continue;
    for (const c of b.children ?? []) {
      if (c._type !== 'span') continue;
      const t = tr.spans?.[b._key]?.[c._key];
      if (typeof t !== 'string' || !t.trim()) { if ((c.text ?? '').trim()) errs.push(`missing translation for ${b._key}/${c._key}`); continue; }
      spans.push({ block: b, span: c, source: c.text ?? '', target: t });
    }
  }
  for (const [bk, sp] of Object.entries(tr.spans ?? {})) for (const sk of Object.keys(sp)) {
    if (!spans.some(x => x.block._key === bk && x.span._key === sk)) errs.push(`translation for ${bk}/${sk}, which is not a text span in the post`);
  }

  // Structure: simulate the patch and compare everything except span text.
  const patched = JSON.parse(JSON.stringify(doc.body));
  for (const x of spans) patched.find(b => b._key === x.block._key).children.find(c => c._key === x.span._key).text = x.target;
  const shape = body => JSON.stringify(body.map(b => ({ ...b, children: b.children?.map(c => ({ ...c, text: undefined })) })));
  if (shape(patched) !== shape(doc.body)) errs.push('patched body differs from the source in something other than span text');

  // Invariants per span.
  const invariantFails = [];
  let tokenFigsSource = 0, tokenFigsTarget = 0;
  for (const x of spans) {
    const d = diff(invariants(x.source), invariants(x.target));
    if (d.length) invariantFails.push(`${x.block._key}: ${d.join(' ')}`);
    tokenFigsSource += figures(x.source).filter(f => f.perToken).length;
    tokenFigsTarget += figures(x.target).filter(f => f.perToken).length;
    const seen = {};
    for (const f of figures(x.source)) {
      const n = seen[f.figure] = (seen[f.figure] ?? -1) + 1;
      const ti = nthIndex(x.target, f.figure, n);
      priceRows.push({ where, block: x.block._key, figure: f.figure, perToken: f.perToken, perMillion: f.perMillion,
        source: sentenceAt(x.source, f.index, f.figure.length), target: ti >= 0 ? sentenceAt(x.target, ti, f.figure.length) : '(not found)' });
    }
  }
  if (invariantFails.length) errs.push(`numbers/names/URLs changed in ${invariantFails.length} span(s): ${invariantFails.join('; ')}`);
  if (tokenFigsTarget > tokenFigsSource) errs.push(`translation has ${tokenFigsTarget} per-token price figures, source has ${tokenFigsSource}`);

  const enLinks = (doc.body ?? []).flatMap(b => (b.markDefs ?? []).map(m => m.href)).filter(h => /aitoken\.global\/en\/|^\/en\//.test(h ?? ''));
  const sourceText = spans.map(x => x.source).join(' '), targetText = spans.map(x => x.target).join(' ');

  if (errs.length) { skip(errs.join(' · ')); continue; }
  say(`Guards: **pass** · ${spans.length} spans in ${new Set(spans.map(x => x.block._key)).size} blocks · structure unchanged · numbers/names/URLs identical · per-token figures ${tokenFigsSource} → ${tokenFigsTarget} · links to /en/: ${enLinks.length}`);
  say(`English stopwords in body: ${(100 * enShare(sourceText)).toFixed(1)}% → ${(100 * enShare(targetText)).toFixed(1)}% · words ${wordCount(sourceText)} → ${wordCount(targetText)} · \`_rev\` pinned to \`${doc._rev}\``);
  if (tr.reviewNotes) say(`Translator notes: ${tr.reviewNotes}`);
  say(`Not written: title "${esc(doc.title)}" · excerpt · SEO title "${esc(doc.seoTitle)}" · meta description · slug · image alts.`);
  say('');
  // Five sample paragraphs: the longest normal blocks, in page order.
  const samples = spans.filter(x => x.block.style === 'normal').sort((a, b) => b.source.length - a.source.length).slice(0, 5)
    .sort((a, b) => doc.body.indexOf(a.block) - doc.body.indexOf(b.block));
  say('| Block | Source (live) | Translation |');
  say('|---|---|---|');
  for (const x of samples) say(`| \`${x.block._key}\` | ${esc(x.source)} | ${esc(x.target)} |`);
  say('');
  ready.push({ tr, doc, spans });
}

say('## Price figures in batch 1 (translated exactly as they are; not fixed in this pass)');
say('');
say('| Post | Block | Figure | Source sentence | Translated sentence | Per-token sweep / PRICE_SCALE |');
say('|---|---|---|---|---|---|');
for (const r of priceRows) {
  const verdict = r.perToken
    ? `**flagged**: per-token, = $${r.perMillion.toLocaleString('en')} per 1M tokens (real prices $0.20–$30)`
    : 'not flagged (not priced per token)';
  say(`| ${r.where} | \`${r.block}\` | ${esc(r.figure)} | ${esc(r.source)} | ${esc(r.target)} | ${verdict} |`);
}
say('');
say(`${priceRows.length} figures, ${priceRows.filter(r => r.perToken).length} flagged.`);
say('');
say('Not caught by the scanner, because neither is written as "per token": in `membeli-token-ai-pemula`, "$10 for 100 tokens" (`cmow8c1d`, `cvx3nxea`) and "$50 for 500 tokens" (`cmow8c1d`) both imply $0.10 per token, the same $100,000 per 1M tokens as the flagged `94vhyrzk`. "$0.001 per word" (`token-ai-vs-api-key-pemula`) at 10 tokens per word is $0.0001 per token = $100 per 1M tokens, at the top edge of PRICE_SCALE\'s $0.05–$100 range.');
say('');

say(`## ${APPLY ? 'Writing' : 'Would write'}: ${ready.length} post(s), one transaction each`);
say('');
if (APPLY) {
  const dir = join(OUT_DIR, 'translate-backup');
  mkdirSync(dir, { recursive: true });
  for (const { tr, doc, spans } of ready) {
    const full = await client.fetch('*[_id == $id][0]', { id: doc._id });
    writeFileSync(join(dir, `${doc._id}.json`), JSON.stringify(full, null, 2) + '\n');
    const set = Object.fromEntries(spans.map(x => [`body[_key=="${x.block._key}"].children[_key=="${x.span._key}"].text`, x.target]));
    try {
      await client.transaction().patch(doc._id, p => p.ifRevisionId(tr.sourceRev).set(set)).commit();
      const after = await client.fetch('*[_id == $id][0].body', { id: doc._id });
      const bad = spans.filter(x => after.find(b => b._key === x.block._key)?.children?.find(c => c._key === x.span._key)?.text !== x.target);
      say(`- \`${doc._id}\` /${tr.locale}/blog/${tr.slug}/: ${bad.length ? `FAILED, ${bad.length} span(s) do not match on re-read` : `written, ${spans.length} spans re-read and match`}`);
      if (bad.length) problems++;
    } catch (err) {
      say(`- \`${doc._id}\` /${tr.locale}/blog/${tr.slug}/: FAILED, nothing written for this post: ${err.message}`);
      problems++;
    }
  }
  say('');
  say(`Backups: ${dir}/`);
  say('');
}

mkdirSync(OUT_DIR, { recursive: true });
const logPath = join(OUT_DIR, APPLY ? 'translate-log.md' : 'translate-dryrun.md');
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`Log → ${logPath}${problems ? `\n${problems} problem(s); see above.` : ''}`);
process.exit(problems ? 1 : 0);
