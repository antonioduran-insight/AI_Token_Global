/**
 * patch-titles-meta.mjs
 *
 * S7d part 1: rewrites seo.seoTitle / seo.seoDescription on the four
 * token-calculator pages and six blog posts. Titles and meta live in Sanity,
 * not in code; the site renders seoTitle as <title> and seoDescription as
 * <meta name="description">.
 *
 * Same shape as scripts/patch-price-corrections.mjs:
 *   - DRY RUN BY DEFAULT. Nothing is written without --apply.
 *   - Guard: a document is written only if its current seoTitle still equals
 *     the "before" value below. Anything else is skipped and reported.
 *   - All writes go in ONE transaction, so Sanity fires one rebuild, not ten.
 *     Each patch is pinned to the revision that was read.
 *   - --apply backs up every document first (audits/2026-10-08/titles-backup/),
 *     then re-reads each one and checks the new values landed.
 *   - Logs: titles-meta-log.md for --apply, titles-meta-dryrun.md otherwise.
 *
 * Usage:
 *   node scripts/patch-titles-meta.mjs
 *   SANITY_TOKEN=… node scripts/patch-titles-meta.mjs --apply
 *
 * SANITY_TOKEN: an Editor token from sanity.io/manage → API → Tokens, with an
 * expiry, exported for this run only. Never in .env, never committed.
 */
import { createClient } from '@sanity/client';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const TOKEN = process.env.SANITY_TOKEN;
const OUT_DIR = 'audits/2026-10-08';

if (APPLY && !TOKEN) {
  console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  process.exit(1);
}

const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'published', token: APPLY ? TOKEN : undefined,
});

// ── Rows ──────────────────────────────────────────────────────────────────
// `title: null` keeps the current seoTitle. `hold: '<reason>'` keeps a row in
// the script but never writes it; the reason is logged. Calculator pages are addressed by
// _id (scripts/import-token-calculator.mjs); posts by language + slug.
const ROWS = [
  { n: 1, kind: 'calculator', _id: 'tokenCalculatorPage-en', lang: 'en', path: '/en/token-calculator/',
    before: 'AI Token Calculator — Estimate Costs Instantly',
    title: 'AI Token Calculator — Count Tokens & Estimate API Cost',
    description: 'Free AI token calculator: paste any text to count tokens and compare input costs across OpenAI, Claude and Gemini models. No sign-up required.' },
  { n: 2, kind: 'calculator', _id: 'tokenCalculatorPage-es', lang: 'es', path: '/es/token-calculator/',
    before: 'Calculadora de Tokens de IA — Estima Costos al Instante',
    title: 'Calculadora de Tokens de IA — Cuenta Tokens y Estima Costos',
    description: 'Calculadora gratuita de tokens de IA: pega cualquier texto para contar tokens y comparar costos de entrada en modelos de OpenAI, Claude y Gemini. Sin registro.' },
  { n: 3, kind: 'calculator', _id: 'tokenCalculatorPage-vi', lang: 'vi', path: '/vi/token-calculator/',
    before: 'Máy Tính Token AI — Ước Tính Chi Phí Ngay Lập Tức',
    title: 'Máy Tính Token AI — Đếm Token & Ước Tính Chi Phí API',
    description: 'Máy tính token AI miễn phí: dán văn bản để đếm token và so sánh chi phí đầu vào giữa các mô hình OpenAI, Claude và Gemini. Không cần đăng ký.' },
  { n: 4, kind: 'calculator', _id: 'tokenCalculatorPage-id', lang: 'id', path: '/id/token-calculator/',
    before: 'AI Token Calculator — Estimasi Biaya Seketika',
    title: null,
    description: 'Kalkulator token AI gratis: tempel teks apa pun untuk menghitung token dan membandingkan biaya input di model OpenAI, Claude, dan Gemini. Tanpa daftar.' },
  { n: 5, kind: 'post', lang: 'en', slug: 'ai-token-vs-quota-explained',
    before: "AI Token vs Quota: A Beginner's Guide",
    title: "AI Token vs Quota vs Credits: What's the Difference?",
    // Softened: the body never covers running out mid-project, and credits are
    // prepaid balance rather than a usage limit.
    description: 'Tokens, quotas and credits all shape how much AI you can use, but each works differently. See what each one means and how to plan your usage around them.' },
  { n: 6, kind: 'post', lang: 'en', slug: 'why-does-claude-keep-cutting-off-mid-conversation',
    before: 'Why Claude Hits Token Limits: How Context Windows Work + 3 Fixes',
    // Softened: the body says the limit cannot be removed ("a process problem"),
    // offers ways to manage it, and never discusses output limits.
    title: 'Why Claude Cuts Off Mid-Conversation and 3 Ways to Manage It',
    description: 'Claude cuts long conversations short at the context window limit. See how context windows work and three practical ways to manage it — no magic prompts.' },
  { n: 7, kind: 'post', lang: 'es', slug: 'por-que-claude-sigue-interrumpiendo-la-conversacion-a-mitad-de-camino',
    // Read from Sanity on 2026-10-08; matches the live page.
    before: 'Por qué Claude alcanza límites de tokens: cómo funcionan las ventanas de contexto + 3 soluciones',
    // Softened: the body says the limit cannot be avoided completely, and never
    // discusses output limits.
    title: 'Por qué Claude se corta a mitad de conversación y qué hacer',
    description: 'Claude corta las conversaciones largas al llegar al límite de contexto. Así funcionan las ventanas de contexto y 3 formas prácticas de gestionarlo.' },
  { n: 8, kind: 'post', lang: 'en', slug: 'claude-token-pricing-guide-for-beginners',
    before: 'Claude Token Pricing Guide for Beginners',
    title: 'Claude API Pricing Explained: Input, Output & Cached Tokens',
    // Softened: the body names no Claude model and has no worked cost example
    // for one; it does cover plan choice.
    description: 'How Claude charges per token: input vs output tokens, prompt caching, and how to choose the right pricing plan for your usage.' },
  { n: 9, kind: 'post', lang: 'en', slug: 'claud-api-vs-chat-version-use-cases',
    before: 'Claude API vs Chat Version: Effective Application Strategies',
    title: 'Claude API vs Claude Chat: Which One Should You Use?',
    // Softened: the body covers structured output (reports, CSV) and high-volume
    // tasks, not file processing.
    description: "Learn when to use Claude's API and when the chat app is enough, covering automation, structured output, high-volume tasks and cost." },
  { n: 10, kind: 'post', lang: 'id', slug: 'harga-token-claude-antropik-api',
    // Held 2026-10-08 while the body was an untranslated copy of the en pricing
    // guide. Un-held 2026-10-15: the body was translated by S9 batch 1 (#43,
    // applied 14 Oct).
    before: 'Mengerti Harga Token Claude',
    title: 'Harga Token Claude API: Input, Output & Cara Menghitungnya',
    description: 'Panduan harga token Claude untuk pemula: beda token input dan output, cara menghitung biaya, dan tips menghemat pemakaian API.' },
];

/** Never written, whatever ROWS says. */
const DO_NOT_TOUCH = [
  { lang: 'id', slug: 'membeli-token-ai-pemula' },
  { lang: 'en', slug: 'buying-ai-tokens-for-personal-use' },
];
const TITLE_MAX = 60;
const DESC_MAX = 160;

const log = [];
const say = line => { console.log(line); log.push(line); };
let problems = 0;

say(`# Titles & meta ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');

// ── Resolve and guard ─────────────────────────────────────────────────────
const ready = [];
for (const row of ROWS) {
  if (DO_NOT_TOUCH.some(x => x.lang === row.lang && x.slug === row.slug)) {
    say(`## Row ${row.n}: REFUSED, ${row.lang}/${row.slug} is on the do-not-touch list.`); problems++; continue;
  }
  if (row.hold) {
    say(`## Row ${row.n} · ${row.lang} · ${row.path ?? `/${row.lang}/blog/${row.slug}/`}: HELD, not written`);
    say('');
    say(`Reason: ${row.hold}.`);
    say('');
    continue;
  }
  let doc;
  if (row.kind === 'calculator') {
    doc = await client.fetch('*[_id == $id][0]{_id, _rev, _type, language, seo}', { id: row._id });
  } else {
    const found = await client.fetch(
      '*[_type == "post" && language == $lang && slug.current == $slug]{_id, _rev, _type, language, "slug": slug.current, seo}',
      { lang: row.lang, slug: row.slug });
    if (found.length !== 1) { say(`## Row ${row.n}: SKIP, ${found.length} posts match ${row.lang}/${row.slug}.`); say(''); problems++; continue; }
    doc = found[0];
  }
  const path = row.path ?? `/${row.lang}/blog/${row.slug}/`;
  say(`## Row ${row.n} · ${row.lang} · ${path} · \`${doc?._id ?? row._id}\``);
  say('');
  if (!doc) { say('SKIP: document not found.'); say(''); problems++; continue; }
  if (doc._type === 'homePage') { say('REFUSED: home page.'); say(''); problems++; continue; }

  const curTitle = doc.seo?.seoTitle ?? null;
  const curDesc = doc.seo?.seoDescription ?? null;
  const newTitle = row.title ?? curTitle;
  if (newTitle === curTitle && row.description === curDesc) { say('Already done: title and description already read the new values.'); say(''); continue; }
  if (curTitle !== row.before) {
    say(`SKIP: current seoTitle is "${curTitle}", expected "${row.before}". Nothing changed.`); say(''); problems++; continue;
  }

  let rejected = false;
  for (const [label, text, max] of [['title', newTitle, TITLE_MAX], ['description', row.description, DESC_MAX]]) {
    if ([...text].length > max) { say(`SKIP: new ${label} is ${[...text].length} chars, over ${max}.`); rejected = true; }
    if (/\$\d|\d+(\.\d+)?\s?(USD|dólares)|\b(GPT|Claude|Gemini|Opus|Sonnet|Haiku)[-\s]?\d/i.test(text)) { say(`SKIP: new ${label} contains a price or model version number.`); rejected = true; }
  }
  if (rejected) { say(''); problems++; continue; }

  say(`Title${row.title === null ? ' (kept)' : ''}:`);
  say(`- before: ${curTitle}`);
  say(`- after:  ${newTitle}  (${[...newTitle].length} chars)`);
  say('Description:');
  say(`- before: ${curDesc}`);
  say(`- after:  ${row.description}  (${[...row.description].length} chars)`);
  say('');
  ready.push({ row, doc, newTitle });
}

// ── Write: one transaction ────────────────────────────────────────────────
say(`## ${APPLY ? 'Writing' : 'Would write'} ${ready.length} document(s) in one transaction`);
say('');
if (APPLY && ready.length) {
  const backupDir = join(OUT_DIR, 'titles-backup');
  mkdirSync(backupDir, { recursive: true });
  for (const { doc } of ready) {
    const full = await client.fetch('*[_id == $id][0]', { id: doc._id });
    writeFileSync(join(backupDir, `${doc._id}.json`), JSON.stringify(full, null, 2) + '\n');
  }
  const tx = client.transaction();
  for (const { row, doc, newTitle } of ready) {
    tx.patch(doc._id, p => p.ifRevisionId(doc._rev).set({ 'seo.seoTitle': newTitle, 'seo.seoDescription': row.description }));
  }
  try {
    await tx.commit();
    for (const { row, doc, newTitle } of ready) {
      const seo = await client.fetch('*[_id == $id][0].seo', { id: doc._id });
      const ok = seo?.seoTitle === newTitle && seo?.seoDescription === row.description;
      say(`- Row ${row.n} \`${doc._id}\`: ${ok ? 're-read, matches' : 'FAILED, re-read does not match'}`);
      if (!ok) problems++;
    }
  } catch (err) {
    say(`FAILED: transaction rejected, nothing written: ${err.message}`);
    problems++;
  }
  say('');
}

mkdirSync(OUT_DIR, { recursive: true });
const logPath = join(OUT_DIR, APPLY ? 'titles-meta-log.md' : 'titles-meta-dryrun.md');
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`Log → ${logPath}${problems ? `\n${problems} problem(s); see above.` : ''}`);
process.exit(problems ? 1 : 0);
