/**
 * sweep-per-token-prices.mjs
 *
 * Finds per-token and per-1,000-token prices that name no model nearby — the
 * class analyse-content-corpus.mjs cannot check, because it only judges a
 * figure when a MODELS name sits within ±100 chars of it.
 *
 * READ-ONLY. Reads a corpus written by build-content-corpus.mjs and
 * src/lib/pricing.ts; writes per-token-prices.md and per-token-prices.csv next
 * to the corpus.
 *
 * Usage (Node 22.6+, it imports pricing.ts):
 *   node scripts/sweep-per-token-prices.mjs [corpus.json]
 *
 * Each article cluster (translations grouped by translationKey) gets a kind:
 *   C  a real vendor is named next to the made-up price ("OpenAI charges …")
 *   B  stated as fact, no vendor, not framed as an example
 *   A  framed as an example ("for example", "suppose", "Model A vs B")
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { MODELS } from '../src/lib/pricing.ts';

const today = new Date().toISOString().slice(0, 10);
const CORPUS = resolve(process.argv[2] ?? `audits/${today}/content-corpus.json`);
const OUT_DIR = dirname(CORPUS);
const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'));
const posts = new Map(corpus.posts.map(p => [p._id, p]));
const L = ['en', 'es', 'id', 'vi'];

// \b is ASCII-only in JS, so word edges are spelled out for Vietnamese and Spanish.
const W = s => new RegExp(`(?<![\\p{L}\\p{N}])(?:${s})(?![\\p{L}\\p{N}])`, 'iu');
const FIG = /(?:US)?\$\s?\d[\d.,]*\d|(?:US)?\$\s?\d|\b\d[\d.,]*\s?(?:USD|US dollars?|dollars?|d[óo]lar(?:es)?|đô la)\b/giu;
const AFTER = /^\s*(?:\/\s?token\b|(?:per|a|each|por(?: cada)?|setiap|mỗi|một|cho mỗi|trên mỗi)\s(?:input\s|output\s|de entrada\s|de salida\s)?tokens?\b(?!\s(?:limit|count))|per\s(?:1,000|1000|1k|thousand)\stokens?|por\s(?:cada\s)?(?:1\.000|1,000|mil)\stokens?|per\s(?:1\.000|seribu)\stoken|mỗi\s(?:1\.000|nghìn|ngàn)\stoken)/iu;
const BEFORE = /(?:per[- ]token|each token|every token|a single token|one token|por token|cada token|precio por token|setiap token|biaya per token|harga per token|mỗi token|một token|giá mỗi token)[^.$\n]{0,30}$/iu;
const MODEL = /\b(?:GPT|ChatGPT|Claude|Gemini|Opus|Sonnet|Haiku|Llama|Mistral|DeepSeek|Grok|Qwen|Kimi|GLM|Sol|Terra|Luna|o\d)\b/u;
const CUE = W("suppose|for example|for instance|let's say|imagine|e\\.g\\.|hypothetical|assume|assuming|consider|to illustrate|supongamos|por ejemplo|imagina|digamos|considera|misalnya|contohnya|sebagai contoh|bayangkan|anggap|andaikan|ví dụ|giả sử|chẳng hạn|hãy tưởng tượng|để minh họa|xem xét");
const VENDOR = W('OpenAI|Anthropic|Google|Microsoft|Azure|AWS|Amazon|Meta|Cohere|leading (?:AI )?(?:API )?platform|popular platform|plataforma (?:de API de IA )?líder|platform API AI terkemuka|nền tảng API AI hàng đầu');

const realMax = Math.max(...MODELS.map(m => m.outputPerMillion));
const realMin = Math.min(...MODELS.map(m => m.inputPerMillion));

function sentenceAt(text, at, len) {
  const isEnd = i => /[.!?]/.test(text[i]) && (i + 1 >= text.length || /\s/.test(text[i + 1]));
  let s = at; while (s > 0 && !isEnd(s - 1)) s--;
  let e = at + len; while (e < text.length && !isEnd(e)) e++;
  return [s, Math.min(text.length, e + 1)];
}

/** "$0.002", "$1,500", "$0,002" → number; a comma is a decimal only with ≤2 digits after it, or a leading 0. */
function parseFigure(raw) {
  const s = raw.replace(/[^\d.,]/g, '').replace(/[.,]+$/, '');
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return Number(s.replace(/,/g, ''));
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s) && !s.startsWith('0')) return Number(s.replace(/\./g, '').replace(',', '.'));
  if (/^\d+,\d+$/.test(s)) return Number(s.replace(',', '.'));
  return Number(s.replace(/,/g, ''));
}

// ── Find ──────────────────────────────────────────────────────────────────
const hits = [];
for (const p of corpus.posts) {
  const t = p.plainText;
  for (const m of t.matchAll(FIG)) {
    const start = m.index, end = start + m[0].length;
    const a = t.slice(end, end + 40).match(AFTER);
    const lead = t.slice(Math.max(0, start - 45), start);
    let b = lead.match(BEFORE);
    // "at $0.001 per token, this would cost $2,500": the phrase already has its
    // own figure in front of it, so it does not make the $2,500 total a rate.
    if (b && /(?:\$\s?\d[\d.,]*|\d[\d.,]*\s?(?:USD|dólares?|đô la))\s*$/iu.test(t.slice(Math.max(0, start - 45 - 25), start - 45 + b.index))) b = null;
    if (!a && !b) continue;
    if (MODEL.test(t.slice(Math.max(0, start - 100), end + 100))) continue;
    const unit = a && /1,000|1000|1k|thousand|mil|1\.000|seribu|nghìn|ngàn/i.test(a[0]) ? 'per 1K tokens' : 'per token';
    const [s, e] = sentenceAt(t, start, m[0].length);
    const sentence = t.slice(s, e).replace(/\s+/g, ' ').trim();
    const value = parseFigure(m[0]);
    const perM = unit === 'per 1K tokens' ? value * 1000 : value * 1e6;
    hits.push({
      lang: p.language, slug: p.slug, _id: p._id, figure: m[0], unit, perM, x: perM / realMax,
      cue: CUE.test(t.slice(Math.max(0, s - 220), e)), vendor: (sentence.match(VENDOR) || [null])[0],
      cluster: p.translationKey ?? `slug:${p.slug}`, sentence,
    });
  }
}

// ── Classify ──────────────────────────────────────────────────────────────
const clusters = new Map();
for (const h of hits) { if (!clusters.has(h.cluster)) clusters.set(h.cluster, []); clusters.get(h.cluster).push(h); }
const ORDER = { C: 0, B: 1, A: 2 };
const rows = [...clusters.values()].map(a => {
  const en = a.find(h => h.lang === 'en') ?? a[0];
  const vendor = a.find(h => h.vendor)?.vendor ?? null;
  const cueShare = a.filter(h => h.cue).length / a.length;
  const kind = vendor ? 'C' : cueShare >= 0.5 ? 'A' : 'B';
  return { en, a, vendor, cueShare, kind, maxX: Math.max(...a.map(h => h.x)) };
}).sort((p, q) => ORDER[p.kind] - ORDER[q.kind] || q.a.length - p.a.length);

// ── Write ─────────────────────────────────────────────────────────────────
const money = v => v >= 1000 ? '$' + Math.round(v).toLocaleString('en') : '$' + (+v.toPrecision(3)).toString();
const range = a => {
  const v = a.map(h => h.perM); const lo = Math.min(...v), hi = Math.max(...v);
  return (lo === hi ? money(lo) : `${money(lo)}–${money(hi)}`) + (hi <= realMax && lo >= realMin ? ' (in real range)' : '');
};
const kindRows = k => rows.filter(r => r.kind === k);
const md = [];
md.push(`# Per-token prices with no model named: sweep`, '');
md.push(`Read-only sweep of \`${CORPUS.replace(resolve('.') + '/', '')}\` (${corpus.posts.length} published posts, pulled ${corpus.generatedAt}). A hit is a currency figure priced **per token** or **per 1,000 tokens** with no model name within ±100 characters, which is why the price scanner never flagged it.`, '');
md.push(`Real prices in \`src/lib/pricing.ts\` run from $${realMin.toFixed(2)} to $${realMax.toFixed(2)} per **million** tokens. The "As $ per 1M tokens" column converts each figure so it can be read against that range.`, '');
md.push('## Counts', '');
md.push(`| | ${L.join(' | ')} | Total |`, `|---|${L.map(() => '---:').join('|')}|---:|`);
md.push(`| Figures | ${L.map(l => hits.filter(h => h.lang === l).length).join(' | ')} | ${hits.length} |`);
md.push(`| Posts | ${L.map(l => new Set(hits.filter(h => h.lang === l).map(h => h._id)).size).join(' | ')} | ${new Set(hits.map(h => h._id)).size} |`);
md.push(`| …per token | ${L.map(l => hits.filter(h => h.lang === l && h.unit === 'per token').length).join(' | ')} | ${hits.filter(h => h.unit === 'per token').length} |`);
md.push(`| …per 1K tokens | ${L.map(l => hits.filter(h => h.lang === l && h.unit === 'per 1K tokens').length).join(' | ')} | ${hits.filter(h => h.unit === 'per 1K tokens').length} |`);
md.push('', `${clusters.size} article clusters.`, '');
md.push('## Kinds', '');
md.push(`- **C · real vendor named** (${kindRows('C').length} clusters, ${kindRows('C').reduce((n, r) => n + r.a.length, 0)} figures): reads as a fact about a named company, and is false.`);
md.push(`- **B · stated as fact, no vendor** (${kindRows('B').length} clusters, ${kindRows('B').reduce((n, r) => n + r.a.length, 0)} figures).`);
md.push(`- **A · framed as an example** (${kindRows('A').length} clusters, ${kindRows('A').reduce((n, r) => n + r.a.length, 0)} figures).`, '');
md.push('## By cluster', '');
md.push('| Kind | en slug (locales) | Figures | Framed as example | As $ per 1M tokens | Vendor named | First sentence |', '|---|---|---:|---:|---|---|---|');
for (const r of rows) {
  const first = r.en.sentence.replace(/\|/g, '\\|');
  md.push(`| ${r.kind} | \`${r.en.slug}\` (${[...new Set(r.a.map(h => h.lang))].join(', ')}) | ${r.a.length} | ${Math.round(r.cueShare * 100)}% | ${range(r.a)} | ${r.vendor ?? ''} | ${first.slice(0, 160)}${first.length > 160 ? '…' : ''} |`);
}
md.push('', 'Every figure, with its sentence: `per-token-prices.csv`.', '');
writeFileSync(join(OUT_DIR, 'per-token-prices.md'), md.join('\n'));

const esc = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
writeFileSync(join(OUT_DIR, 'per-token-prices.csv'), [
  'kind,locale,slug,_id,figure,unit,per_million,x_dearest_real,framed_as_example,vendor,sentence',
  ...rows.flatMap(r => r.a.map(h => [r.kind, h.lang, h.slug, h._id, h.figure, h.unit, h.perM, h.x.toFixed(1), h.cue, h.vendor ?? '', h.sentence].map(esc).join(','))),
].join('\n') + '\n');

console.log(`${hits.length} figures in ${new Set(hits.map(h => h._id)).size} posts, ${clusters.size} clusters → ${OUT_DIR}/per-token-prices.{md,csv}`);
console.log(['C', 'B', 'A'].map(k => `${k}: ${kindRows(k).length} clusters / ${kindRows(k).reduce((n, r) => n + r.a.length, 0)} figures`).join(' · '));
