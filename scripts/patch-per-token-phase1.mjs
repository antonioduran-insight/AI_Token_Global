/**
 * patch-per-token-phase1.mjs
 *
 * S7e phase 1: the kind C clusters of audits/2026-10-08/per-token-prices.md,
 * the ones that put a made-up per-token price next to a real vendor's name.
 *
 *   1. UNPUBLISH five article clusters, all locales (16 posts). Their invented
 *      vendor pricing is the content, so there is nothing to correct in place.
 *      Sanity's unpublish action moves each post into its draft; nothing is
 *      deleted, and each can be republished from the Studio.
 *   2. Any published block that links to one of the 16 is DELETED when the link
 *      is its whole content (the Sol rule), and REFUSED otherwise; a link inside
 *      prose needs a decision, so it is reported and nothing is written.
 *   3. REWRITE block xn39tmy2 in the four ai-api-platforms-vs-chat-tools posts:
 *      no price, no vendor, and a link to that locale's /api-compare/ page.
 *
 * Same pattern as patch-price-corrections.mjs and patch-titles-meta.mjs:
 * DRY RUN BY DEFAULT; --apply needs SANITY_TOKEN from the shell; a guard that
 * each document still reads what this file expects; every document backed up
 * before it is written (audits/2026-10-13/per-token-phase1-backup/); every
 * write re-read; the --apply log in per-token-phase1-log.md, dry runs in
 * per-token-phase1-dryrun.md. Re-running reports "Already done".
 *
 * Writes go in two requests: one batch of unpublish actions, one transaction
 * of patches.
 *
 * Usage:
 *   node scripts/patch-per-token-phase1.mjs
 *   SANITY_TOKEN=… node scripts/patch-per-token-phase1.mjs --apply
 */
import { createClient } from '@sanity/client';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.argv.includes('--apply');
const TOKEN = process.env.SANITY_TOKEN;
const OUT_DIR = 'audits/2026-10-13';
if (APPLY && !TOKEN) {
  console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  process.exit(1);
}
const client = createClient({
  projectId: 'mq3wxr8n', dataset: 'production', apiVersion: '2025-02-19', useCdn: false,
  perspective: 'raw', token: APPLY ? TOKEN : undefined,
});

// ── 1. The five clusters ──────────────────────────────────────────────────
const UNPUBLISH = [
  { _id: '8VP0t1uN4XaL0VxggVJdz1', lang: 'en', slug: 'ai-token-cost-comparison-openai-anthropic-google' },
  { _id: 'YNVQhbTzP0HGGIRSVz1sqF', lang: 'es', slug: 'como-openai-anthropic-google-calculan-costos-tokens-ia' },
  { _id: 'GWcybyvSzKo1HK4w0CkeUw', lang: 'id', slug: 'perbandingan-biaya-token-ai-openai-anthropic-google' },
  { _id: 'mVT55Z3iQ03m4XFlyzTUfb', lang: 'en', slug: 'ai-token-cost-compliance-social-media-api-strategies' },
  { _id: 'mVT55Z3iQ03m4XFlyzTUwp', lang: 'es', slug: 'restricciones-edad-redes-sociales-gestion-costos-api-ia' },
  { _id: 'mVT55Z3iQ03m4XFlyzTVIM', lang: 'id', slug: 'bagaimana-pembatasan-umur-media-sosial-menentukan-manajemen-biaya-api-ai-untuk-pengembang' },
  { _id: '7Ahi24M7FaSDiVrQowzuqx', lang: 'en', slug: 'calculate-ai-token-costs-enterprise-workloads' },
  { _id: 'PqAgSgFWPa4GzheZz9vLoL', lang: 'es', slug: 'como-calcular-costos-de-tokens-de-ia-para-enterprise-workloads' },
  { _id: 'g6m6Wxfyh3IrlyGdbGN7T1', lang: 'id', slug: 'perhitungan-biaya-token-ai-untuk-beban-kerja-perusahaan' },
  { _id: '7Ahi24M7FaSDiVrQowzuqx-vi', lang: 'vi', slug: 'calculate-ai-token-costs-enterprise-workloads' },
  { _id: 'jIwg3X3cZFUaTrI3KDkAAn', lang: 'en', slug: 'calculate-ai-token-costs-multilingual-applications' },
  { _id: 'hW5DV1JXtq90EFbs5cckt0', lang: 'es', slug: 'como-calcular-costos-tokens-ia-aplicaciones-multilingues' },
  { _id: 'ozCyOlBi58GE7eckjdqeYz', lang: 'id', slug: 'cara-menghitung-biaya-token-ai-untuk-aplikasi-multibahasa' },
  { _id: 'lR0qt56tv2bdxAETnUZSBT', lang: 'en', slug: 'ai-token-basics-guide-tokenization-api-costs' },
  { _id: 'WT5trcS9086b9pTLGR9Q7R', lang: 'es', slug: 'entendiendo-los-tokens-de-ia' },
  { _id: 'WT5trcS9086b9pTLGR9QwB', lang: 'id', slug: 'ai-token-basics-dasar-tokenisasi-dan-biaya-api' },
];

// ── 3. The rewrite ────────────────────────────────────────────────────────
const OLD_EN = 'When it comes to pricing, AI API platforms tend to be more expensive than chat tools due to their complexity and scalability requirements. For instance, a leading AI API platform charges around $0.10 per token for its basic tier, while a popular chat tool offers 100 free tokens per month before scaling up to paid tiers.';
const OLD_VI = 'Về giá cả, nền tảng API AI thường đắt hơn công cụ chat do độ phức tạp và yêu cầu mở rộng của chúng. Ví dụ, một nền tảng API AI hàng đầu tính khoảng $0.10 mỗi token cho gói cơ bản, trong khi một công cụ chat phổ biến cung cấp 100 token miễn phí mỗi tháng trước khi chuyển lên các gói trả phí.';

/** before / link / after: the link text is the middle part. */
const REWRITE = [
  { _id: 'yOXF1XBkRH6Ae7xNfhuRYz', lang: 'en', old: OLD_EN,
    parts: ['When it comes to pricing, AI API platforms and chat tools are billed differently: API platforms charge per token, usually at separate rates for input and output, while chat tools typically charge a flat monthly subscription, often with a free tier. For current per-token rates across providers, see our ', 'AI API price comparison', '.'] },
  { _id: '5bTmGH4csQ2ze7LA77fvwH', lang: 'es', old: OLD_EN,
    parts: ['En cuanto al precio, las plataformas de API de IA y las herramientas de chat se cobran de forma distinta: las plataformas de API cobran por token, normalmente con tarifas separadas para la entrada y la salida, mientras que las herramientas de chat suelen cobrar una suscripción mensual fija, a menudo con un plan gratuito. Para ver las tarifas por token actuales de cada proveedor, consulta nuestra ', 'comparativa de precios de API de IA', '.'] },
  { _id: 'yOXF1XBkRH6Ae7xNfhuRtl', lang: 'id', old: OLD_EN,
    parts: ['Dari sisi harga, platform API AI dan alat chat ditagih dengan cara yang berbeda: platform API mengenakan biaya per token, biasanya dengan tarif terpisah untuk input dan output, sedangkan alat chat umumnya mengenakan biaya langganan bulanan tetap, sering kali dengan paket gratis. Untuk tarif per token terkini dari berbagai penyedia, lihat ', 'perbandingan harga API AI', ' kami.'] },
  { _id: 'yOXF1XBkRH6Ae7xNfhuRYz-vi', lang: 'vi', old: OLD_VI,
    parts: ['Về giá cả, nền tảng API AI và công cụ chat được tính phí theo cách khác nhau: nền tảng API tính phí theo token, thường với mức giá riêng cho đầu vào và đầu ra, trong khi công cụ chat thường thu phí đăng ký cố định hàng tháng, nhiều khi kèm theo gói miễn phí. Để xem mức giá theo token hiện tại của các nhà cung cấp, hãy xem ', 'bảng so sánh giá API AI', ' của chúng tôi.'] },
];
const BLOCK_KEY = 'xn39tmy2';
// www host: the schema's `href` is a Sanity url field, which rejects relative paths.
const compareUrl = lang => `https://www.aitoken.global/${lang}/api-compare/`;

function newBlock(old, r) {
  const mk = `${BLOCK_KEY}mk1`;
  return {
    _key: BLOCK_KEY, _type: 'block', style: old.style ?? 'normal',
    markDefs: [{ _key: mk, _type: 'link', href: compareUrl(r.lang) }],
    children: [
      { _key: `${BLOCK_KEY}s0`, _type: 'span', marks: [], text: r.parts[0] },
      { _key: `${BLOCK_KEY}s1`, _type: 'span', marks: [mk], text: r.parts[1] },
      { _key: `${BLOCK_KEY}s2`, _type: 'span', marks: [], text: r.parts[2] },
    ],
  };
}
const textOf = b => (b?.children ?? []).map(c => c.text).join('');

// ── Run ───────────────────────────────────────────────────────────────────
const log = [];
const say = line => { console.log(line); log.push(line); };
let problems = 0;
const backups = [];
say(`# S7e phase 1 ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');

say('## 1. Unpublish (16 posts, moved to draft, never deleted)');
say('');
const ids = UNPUBLISH.map(u => u._id);
const published = await client.fetch('*[_id in $ids]{_id, _rev, language, "slug": slug.current, translationKey}', { ids });
const drafts = APPLY ? await client.fetch('*[_id in $d]._id', { d: ids.map(i => `drafts.${i}`) }) : [];
const toUnpublish = [];
for (const u of UNPUBLISH) {
  const doc = published.find(p => p._id === u._id);
  const url = `/${u.lang}/blog/${u.slug}/`;
  if (!doc) { say(`- Already done: \`${u._id}\` (${u.lang}) is not published · ${url}`); continue; }
  if (doc.slug !== u.slug || doc.language !== u.lang) { say(`- SKIP \`${u._id}\`: now ${doc.language}/${doc.slug}, expected ${u.lang}/${u.slug}.`); problems++; continue; }
  if (drafts.includes(`drafts.${u._id}`)) { say(`- SKIP \`${u._id}\` (${u.lang}): a draft already exists and unpublishing would replace it.`); problems++; continue; }
  say(`- ${APPLY ? 'UNPUBLISH' : 'would unpublish'} \`${u._id}\` (${u.lang}) · rev ${doc._rev} · ${url} will 404 after the next build`);
  toUnpublish.push(doc);
}
say('');

say('## 2. Inbound links to the 16');
say('');
const paths = UNPUBLISH.map(u => `/${u.lang}/blog/${u.slug}`);
const everything = await client.fetch('*[!(_type match "sanity.*") && !(_type match "system.*") && !(_id in path("drafts.**")) && !(_id in $ids)]', { ids });
const linkFixes = [];
let inbound = 0;
for (const d of everything) {
  if (!paths.some(p => JSON.stringify(d).includes(p))) continue;
  inbound++;
  for (const [field, val] of Object.entries(d)) {
    if (!Array.isArray(val)) continue;
    for (const b of val) {
      if (b?._type !== 'block') continue;
      for (const md of b.markDefs ?? []) {
        if (!paths.some(p => (md.href ?? '').includes(p))) continue;
        const anchor = b.children.filter(c => c.marks?.includes(md._key)).map(c => c.text).join('');
        if (anchor.trim() === textOf(b).trim()) {
          say(`- DELETE block \`${b._key}\` in \`${d._id}\` (${d._type}${d.language ? ', ' + d.language : ''}) · "${anchor}" → ${md.href}`);
          linkFixes.push({ doc: d, field, blockKey: b._key });
        } else {
          say(`- REFUSED \`${d._id}\` block \`${b._key}\`: link inside prose ("${anchor}" in "${textOf(b).slice(0, 120)}…"). Needs a decision; nothing written.`);
          problems++;
        }
      }
    }
  }
  if (!linkFixes.some(f => f.doc._id === d._id)) { say(`- REFUSED \`${d._id}\` (${d._type}): mentions a target URL outside a body link. Check by hand.`); problems++; }
}
if (!inbound) say(`None. Scanned ${everything.length} published documents of every type; none links to any of the 16.`);
say('');

say('## 3. Rewrite block `xn39tmy2` in ai-api-platforms-vs-chat-tools (4 locales)');
say('');
const toPatch = [];
for (const r of REWRITE) {
  const doc = await client.fetch('*[_id == $id][0]{_id, _rev, language, "slug": slug.current, body}', { id: r._id });
  say(`### ${r.lang} · \`${r._id}\` · /${r.lang}/blog/${doc?.slug}/`);
  say('');
  const old = doc?.body?.find(b => b._key === BLOCK_KEY);
  if (!old) { say('SKIP: block not found.'); say(''); problems++; continue; }
  const next = newBlock(old, r);
  if (JSON.stringify(old.children) === JSON.stringify(next.children) && JSON.stringify(old.markDefs) === JSON.stringify(next.markDefs)) { say('Already done.'); say(''); continue; }
  if (textOf(old) !== r.old) { say(`SKIP: the block no longer reads the expected text, so it was edited since this script was written.\n> ${textOf(old)}`); say(''); problems++; continue; }
  say(`Before:\n> ${textOf(old)}`);
  say('');
  say(`After (link on "${r.parts[1]}" → ${compareUrl(r.lang)}):\n> ${r.parts.join('')}`);
  say('');
  toPatch.push({ doc, next, path: `body[_key=="${BLOCK_KEY}"]` });
}
for (const f of linkFixes) toPatch.push({ doc: f.doc, unset: `${f.field}[_key=="${f.blockKey}"]` });

say(`## ${APPLY ? 'Writing' : 'Would write'}: ${toUnpublish.length} unpublish action(s) in one batch, ${toPatch.length} patch(es) in one transaction`);
say('');

if (APPLY && (toUnpublish.length || toPatch.length)) {
  const dir = join(OUT_DIR, 'per-token-phase1-backup');
  mkdirSync(dir, { recursive: true });
  for (const d of [...toUnpublish, ...toPatch.map(p => p.doc)]) {
    if (backups.includes(d._id)) continue;
    const full = await client.fetch('*[_id == $id][0]', { id: d._id });
    writeFileSync(join(dir, `${d._id}.json`), JSON.stringify(full, null, 2) + '\n');
    backups.push(d._id);
  }
  say(`Backed up ${backups.length} document(s) to ${dir}/.`);
  try {
    if (toUnpublish.length) {
      await client.action(toUnpublish.map(d => ({ actionType: 'sanity.action.document.unpublish', publishedId: d._id, draftId: `drafts.${d._id}` })));
    }
    if (toPatch.length) {
      const tx = client.transaction();
      for (const p of toPatch) tx.patch(p.doc._id, x => (p.unset ? x.ifRevisionId(p.doc._rev).unset([p.unset]) : x.ifRevisionId(p.doc._rev).set({ [p.path]: p.next })));
      await tx.commit();
    }
  } catch (err) {
    say(`FAILED: ${err.message}`);
    problems++;
  }
  say('');
  say('### Re-read');
  for (const d of toUnpublish) {
    const after = await client.fetch('{"published": defined(*[_id == $id][0]), "draft": defined(*[_id == $d][0])}', { id: d._id, d: `drafts.${d._id}` });
    const ok = !after.published && after.draft;
    say(`- \`${d._id}\`: published=${after.published} draft=${after.draft}${ok ? '' : '  FAILED'}`);
    if (!ok) problems++;
  }
  for (const p of toPatch) {
    const b = await client.fetch(`*[_id == $id][0].${p.unset ? p.unset.split('[')[0] : 'body'}[_key == $k][0]`, { id: p.doc._id, k: p.unset ? p.unset.match(/"(.+)"/)[1] : BLOCK_KEY });
    const ok = p.unset ? !b : JSON.stringify(b?.children) === JSON.stringify(p.next.children) && JSON.stringify(b?.markDefs) === JSON.stringify(p.next.markDefs);
    say(`- \`${p.doc._id}\` ${p.unset ? 'block deleted' : 'block rewritten'}: ${ok ? 're-read, matches' : 'FAILED'}`);
    if (!ok) problems++;
  }
  say('');
}

mkdirSync(OUT_DIR, { recursive: true });
const logPath = join(OUT_DIR, APPLY ? 'per-token-phase1-log.md' : 'per-token-phase1-dryrun.md');
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`Log → ${logPath}${problems ? `\n${problems} problem(s); see above.` : ''}`);
process.exit(problems ? 1 : 0);
