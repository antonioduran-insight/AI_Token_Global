/**
 * analyse-content-corpus.mjs
 *
 * Reads the corpus written by scripts/build-content-corpus.mjs and reports, per
 * post, what a content review needs to look at. It reports; it does not judge.
 * Nothing here says what to keep, merge or cut.
 *
 * READ-ONLY. It reads two local files and src/lib/pricing.ts and writes two
 * report files. It never talks to Sanity.
 *
 * Usage (Node 22.6+ — it imports pricing.ts directly):
 *   node scripts/analyse-content-corpus.mjs [corpus.json] [gsc.csv]
 *
 * Defaults:
 *   corpus  audits/<today>/content-corpus.json
 *   gsc     "Claude outputs/gsc-traffic-by-page-<today>.csv"
 * Writes content-findings.csv and content-findings.md next to the corpus.
 *
 * ── Finding types (CSV `finding_type`), in output order ──
 *   PRICE_CLAIM       every currency figure in a body, with 100 chars each side.
 *                     status MISMATCH (high confidence, then low) → MATCH → UNVERIFIABLE.
 *   NEAR_DUP_BODY     same-language pairs, Jaccard of 5-word shingles > 0.70.
 *   NEAR_DUP_TITLE    any-language pairs, Jaccard of title words > 0.80.
 *   TITLE_PREFIX_GROUP 3+ same-language posts whose titles open with the same
 *                     three words (case-insensitive, leading articles dropped).
 *                     One row per post; status = the prefix, figure_value =
 *                     group size, detail = every title in the group.
 *   SAME_KEY_SAME_LANG two posts in one language sharing a translationKey.
 *   STALE_MARKER      old years, old model names, "as of <date>" phrasing.
 *   STRUCTURE         SHORT (<400 words), NO_HEADINGS, EMPTY_BLOCKS,
 *                     MISSING_TRANSLATION_KEY.
 *
 * ── How a price claim is judged ──
 * The model is the nearest MODELS name inside the ±100-char window, preferring
 * one written before the figure (prose names a model, then prices it). The
 * figure is compared with that model's inputPerMillion / outputPerMillion —
 * the base fields, never upcomingChange (the Sonnet 5 rise it describes was
 * cancelled; see PR #34). If the text says "input" or "output" next to the
 * figure, only that side is compared.
 *
 *   MATCH         the figure equals the expected price (a per-1K figure is
 *                 scaled ×1000 first). Also MATCH, with a note, when it equals
 *                 the price of a different model that is in the same window.
 *   MISMATCH      a model is in the window and the figure equals neither price.
 *                 confidence=high when the text marks it as a token price
 *                 (per million / per 1K / per token / input / output) and no
 *                 cache or batch wording is nearby; low otherwise.
 *   UNVERIFIABLE  no MODELS name in the window; the nearest model named is not
 *                 in MODELS (GPT-5.6 Sol, Opus 4.8, a bare "Claude"); the
 *                 figure is a cached-input / cache-write / batch price, which
 *                 pricing.ts does not hold; or it is priced per something that
 *                 is not tokens (month, user, image, hour…).
 *
 * A MISMATCH is also low confidence when long-context / Fast / Batch wording
 * appears in the 300 chars before it: those tiers have their own prices.
 *
 * ── Traffic ──
 * The GSC export's blog rows are /{locale}/blog/{slug}/. They are joined onto
 * every finding by locale + slug. "#fragment" rows are folded into their post
 * (clicks and impressions summed, position impression-weighted). A post with
 * no row gets clicks=0, impressions=0 and a blank avg_position: it did not
 * appear in search during the export's window, so it has no position.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { MODELS } from '../src/lib/pricing.ts';

const today = new Date().toISOString().slice(0, 10);
const CORPUS = resolve(process.argv[2] ?? `audits/${today}/content-corpus.json`);
const GSC = resolve(process.argv[3] ?? `Claude outputs/gsc-traffic-by-page-${today}.csv`);
const OUT_DIR = dirname(CORPUS);
const OUT_CSV = join(OUT_DIR, 'content-findings.csv');
const OUT_MD = join(OUT_DIR, 'content-findings.md');

const BODY_THRESHOLD = 0.70;
const TITLE_THRESHOLD = 0.80;
const TITLE_PREFIX_MIN = 3;
const SHINGLE = 5;
const WINDOW = 100;
const SHORT_WORDS = 400;

if (!existsSync(CORPUS)) {
  console.error(`No corpus at ${CORPUS}. Run scripts/build-content-corpus.mjs first.`);
  process.exit(1);
}
const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'));
const posts = corpus.posts;

// ── Traffic ───────────────────────────────────────────────────────────────
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter(r => r.length > 1 || r[0]);
  return body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const trafficKey = (locale, slug) => `${locale}|${decodeURIComponent(slug ?? '').toLowerCase()}`;
const traffic = new Map();
const gscStats = { found: existsSync(GSC), blogRows: 0, fragmentRows: 0, unmatched: [] };

if (gscStats.found) {
  for (const row of parseCsv(readFileSync(GSC, 'utf8'))) {
    const match = row.path.match(/^\/([a-z]{2})\/blog\/([^/#]+)\/?(#.*)?$/);
    if (!match) continue;
    gscStats.blogRows++;
    if (match[3]) gscStats.fragmentRows++;
    const key = trafficKey(match[1], match[2]);
    const clicks = Number(row.clicks) || 0;
    const impressions = Number(row.impressions) || 0;
    const position = Number(row.avg_position) || 0;
    const entry = traffic.get(key) ?? { clicks: 0, impressions: 0, weighted: 0, paths: [] };
    entry.clicks += clicks;
    entry.impressions += impressions;
    entry.weighted += position * impressions;
    entry.paths.push(row.path);
    traffic.set(key, entry);
  }
  const postKeys = new Set(posts.map(p => trafficKey(p.language, p.slug)));
  for (const [key, entry] of traffic) if (!postKeys.has(key)) gscStats.unmatched.push({ key, ...entry });
} else {
  console.warn(`No GSC export at ${GSC}; traffic columns will be blank.`);
}

function trafficFor(post) {
  if (!post || !gscStats.found) return { clicks: '', impressions: '', avg_position: '' };
  const entry = traffic.get(trafficKey(post.language, post.slug));
  if (!entry || entry.impressions === 0) {
    return { clicks: entry?.clicks ?? 0, impressions: 0, avg_position: '' };
  }
  return {
    clicks: entry.clicks,
    impressions: entry.impressions,
    avg_position: (entry.weighted / entry.impressions).toFixed(2),
  };
}

// ── Text helpers ──────────────────────────────────────────────────────────
const words = text => (text ?? '').normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) ?? [];

function shingles(text, n = SHINGLE) {
  const w = words(text);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let inter = 0;
  for (const x of small) if (large.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

const oneLine = s => s.replace(/\s+/g, ' ').trim();
function contextAround(text, start, end, width = WINDOW) {
  const from = Math.max(0, start - width);
  const to = Math.min(text.length, end + width);
  return oneLine((from > 0 ? '…' : '') + text.slice(from, to) + (to < text.length ? '…' : ''));
}

// ── Findings ──────────────────────────────────────────────────────────────
const findings = [];
function add(type, post, fields, other) {
  findings.push({ finding_type: type, post, other, ...fields });
}

// 1. Near-duplicates ─────────────────────────────────────────────────────────
// Clusters first: posts sharing a translationKey are one article in several
// languages and are never compared with each other. When either post has no
// key, the fallback is a shared slug in different languages — the keyless
// es/id/vi posts reuse the English slug. articleNumber is no fallback: in the
// 2026-10-07 corpus every keyless post has a number of its own, so it links
// none of them to their translations.
function sameCluster(a, b) {
  if (a.translationKey && b.translationKey) return a.translationKey === b.translationKey;
  return a.language !== b.language && a.slug === b.slug;
}
const shingleSets = new Map(posts.map(p => [p._id, shingles(p.plainText)]));
const titleSets = new Map(posts.map(p => [p._id, new Set(words(p.title))]));

let bodyPairsCompared = 0;
for (let i = 0; i < posts.length; i++) {
  for (let j = i + 1; j < posts.length; j++) {
    const a = posts[i], b = posts[j];
    const clustered = sameCluster(a, b);
    const sameLang = a.language === b.language;

    if (sameLang && a.translationKey && a.translationKey === b.translationKey) {
      add('SAME_KEY_SAME_LANG', a, { detail: `translationKey ${a.translationKey} held by two ${a.language} posts` }, b);
    }

    if (!clustered) {
      const titleScore = jaccard(titleSets.get(a._id), titleSets.get(b._id));
      if (titleScore > TITLE_THRESHOLD) {
        add('NEAR_DUP_TITLE', a, {
          score: titleScore.toFixed(3),
          detail: sameLang ? 'same language' : `cross-language (${a.language}/${b.language})`,
        }, b);
      }
    }

    if (sameLang && !(a.translationKey && a.translationKey === b.translationKey)) {
      bodyPairsCompared++;
      const bodyScore = jaccard(shingleSets.get(a._id), shingleSets.get(b._id));
      if (bodyScore > BODY_THRESHOLD) {
        add('NEAR_DUP_BODY', a, {
          score: bodyScore.toFixed(3),
          detail: `${SHINGLE}-word shingles: ${shingleSets.get(a._id).size} vs ${shingleSets.get(b._id).size}`,
        }, b);
      }
    }
  }
}

// Title prefixes: 0.80 word-Jaccard misses titles that only share an opening,
// so also group same-language posts by their first three title words.
const LEADING_ARTICLES = new Set(['the', 'a', 'an', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'các', 'những', 'một']);
const titlePrefix = title => {
  const w = words(title);
  while (w.length && LEADING_ARTICLES.has(w[0])) w.shift();
  return w.length >= 3 ? w.slice(0, 3).join(' ') : null;
};
const prefixGroups = new Map();
for (const post of posts) {
  const prefix = titlePrefix(post.title);
  if (!prefix) continue;
  const key = `${post.language}|${prefix}`;
  if (!prefixGroups.has(key)) prefixGroups.set(key, []);
  prefixGroups.get(key).push(post);
}
const titleGroups = [...prefixGroups.entries()]
  .filter(([, group]) => group.length >= TITLE_PREFIX_MIN)
  .map(([key, group]) => ({ language: key.split('|')[0], prefix: key.split('|')[1], group }))
  .sort((a, b) => b.group.length - a.group.length || a.language.localeCompare(b.language));
for (const { prefix, group } of titleGroups) {
  const titles = group.map(p => p.title).join(' | ');
  for (const post of group) {
    add('TITLE_PREFIX_GROUP', post, { status: prefix, figure_value: String(group.length), detail: titles });
  }
}

// 2. Price claims ────────────────────────────────────────────────────────────
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every way a MODELS entry is written in the posts: full name, and without the vendor prefix. */
const MODEL_ALIASES = MODELS.flatMap(model => {
  const names = new Set([model.displayName]);
  names.add(model.displayName.replace(/^(Claude|GPT-[\d.]+)\s+/, ''));
  return [...names].map(name => ({
    model,
    name,
    // Not followed by more version digits: "Opus 5" must not match "Opus 5.1".
    re: new RegExp(`(?<![\\p{L}\\p{N}-])${escapeRe(name)}(?![\\p{L}\\p{N}]|[.-]\\d)`, 'gu'),
  }));
});

const CURRENCY_RE = new RegExp([
  String.raw`(?:US)?\$\s?(\d[\d.,]*)`,
  String.raw`\bUSD\s?(\d[\d.,]*)`,
  String.raw`(?<![\p{L}\p{N}.,$])(\d[\d.,]*)\s?(?:USD\b|US\s?dollars?\b|dollars?\b|d[óo]lar(?:es)?\b|đô\s?la\b)`,
].join('|'), 'giu');

/** A figure as written → a number, reading "1.000" as a thousand in es/id/vi and "2,50" as a decimal. */
function parseFigure(raw, locale) {
  const s = raw.replace(/[.,]+$/, '');
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return Number(s.replace(/,/g, ''));
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s) && locale !== 'en' && !s.startsWith('0')) {
    return Number(s.replace(/\./g, '').replace(',', '.'));
  }
  if (/^\d+,\d{1,2}$/.test(s)) return Number(s.replace(',', '.'));
  return Number(s.replace(/,/g, ''));
}

const UNIT_PATTERNS = [
  ['per_million', /^[^.!?\n]{0,25}?(?:per\s(?:1\s?|one\s)?(?:million|m\b)(?!\s(?:queries|requests|characters|images|words|calls))|\/\s?1?\s?m(?:illion)?\b|\/\s?1?m\stokens|1m\stokens|por\s(?:1\s|cada\s|un\s)?mill[oó]n|per\s(?:1\s)?juta|\/\s?juta|(?:cho\s|trên\s)?mỗi\s(?:1\s)?triệu|\/\s?(?:1\s)?triệu)/iu],
  ['per_thousand', /^[^.!?\n]{0,25}?(?:per\s(?:1,000|1000|1k|thousand|one thousand)|\/\s?1k\b|\/\s?1,?000\b|por\s(?:cada\s)?(?:mil|1\.000|1,000)\b|per\s(?:seribu|1\.000)|mỗi\s(?:nghìn|ngàn|1\.000))/iu],
  ['per_token', /^[^.!?\n]{0,15}?(?:per\s(?:input\s|output\s)?token\b|por\stoken\b|per\stoken\b|mỗi\stoken\b)/iu],
  ['non_token', /^[^.!?\n]{0,25}?(?:\/\s?(?:mo|month|yr|year|user|seat|image|hour|hr|min|minute|request|call)\b|per\s(?:month|year|user|seat|image|hour|minute|request|call|day|query|page)|a\s(?:month|year)\b|monthly|annually|al\smes|por\s(?:mes|año|usuario|imagen|hora|minuto|solicitud|día)|mensual|anual|per\s(?:bulan|tahun|pengguna|gambar|jam|menit|permintaan|hari)|\/\s?(?:bulan|tahun|jam|hari)|mỗi\s(?:tháng|năm|người\sdùng|ảnh|hình|giờ|phút|yêu\scầu|ngày)|\/\s?(?:tháng|năm|giờ|ngày))/iu],
];

function unitOf(after) {
  for (const [unit, re] of UNIT_PATTERNS) if (re.test(after)) return unit;
  return 'unstated';
}

const INPUT_RE = /\b(?:input|entrada|masukan|prompt)\b|đầu\svào/giu;
const OUTPUT_RE = /\b(?:output|salida|keluaran|completion)\b|đầu\sra/giu;
const CACHE_RE = /cach(?:e|ed|ing)|caché|batch|lote|\bdiskon\b|giảm\sgiá|discount|descuento/iu;

/** The first input/output word in a slice, nearest the figure. */
function sideIn(slice, fromEnd) {
  let best = null;
  for (const [side, re] of [['input', INPUT_RE], ['output', OUTPUT_RE]]) {
    for (const m of slice.matchAll(re)) {
      const dist = fromEnd ? slice.length - (m.index + m[0].length) : m.index;
      if (!best || dist < best.dist) best = { side, dist };
    }
  }
  return best?.side ?? null;
}

/**
 * Which side the prose says a figure is. The words right after it win
 * ("$10 per million output tokens", "$5 de entrada"), then the words right
 * before it ("Input $4.00"). Neither look crosses punctuation or another
 * figure, so a table row "Output $12.00 GPT-5.6 Luna: Input $0.20" gives
 * $12.00 to output, not to the Input that starts the next row.
 */
function sideOf(text, start, end) {
  const right = text.slice(end, end + 30).split(/[$,;:\n.()]/)[0];
  const left = text.slice(Math.max(0, start - 25), start).split(/[$,;:\n.()]/).pop();
  return sideIn(right, false) ?? sideIn(left, true);
}

/** Wording for a price tier pricing.ts does not hold, within 300 chars before the figure. */
const TIER_RE = /long[\s-]context|contexto\slargo|konteks\spanjang|ngữ\scảnh\sdài|fast\smode|modo\srápido|batch|lote|priority|flex(?:\stier)?/iu;

/** Cached-input, cache-write and batch prices: pricing.ts has no figure to compare them with. */
const CACHE_LEFT_RE = /(?:cach(?:e|ed)\s(?:input|read|write|hit)s?|cache\swrites?|batch|caché|lote|bộ\snhớ\sđệm|cache)[^$]{0,12}$/iu;

/**
 * Model names that are not in MODELS. A price written right after one of these
 * belongs to that model, even when a MODELS name sits a little further back.
 */
const OTHER_MODEL_RE = /(?<![\p{L}\p{N}-])(?:GPT-?\d[\d.]*(?:\s?(?:Sol|Terra|Luna|Turbo|mini|nano|Pro|o))?|o\d(?:-mini|-pro)?|ChatGPT|Claude(?:\s(?:Opus|Sonnet|Haiku))?(?:\s\d+(?:\.\d+)?)?|(?:Opus|Sonnet|Haiku)\s\d+(?:\.\d+)?|Gemini(?:\s\d+(?:\.\d+)?)?(?:\s(?:Pro|Flash(?:-Lite)?|Ultra|Nano|Live))?|Llama\s?[\d.]*|Mistral(?:\s(?:Large|Medium|Small))?|DeepSeek(?:[\s-][A-Z]?\d[\w.]*)?|Grok\s?[\d.]*|Qwen[\w.-]*|Kimi[\w.\s-]{0,4}|GLM-?[\d.]*|Sol)(?![\p{L}\p{N}])/gu;

/** Every model mention in the window, MODELS or not, nearest-first, preceding ones before following. */
function mentionsInWindow(text, start, end) {
  const from = Math.max(0, start - WINDOW), to = Math.min(text.length, end + WINDOW);
  const slice = text.slice(from, to);
  const known = [];
  for (const alias of MODEL_ALIASES) {
    for (const m of slice.matchAll(alias.re)) known.push({ model: alias.model, s: from + m.index, e: from + m.index + m[0].length });
  }
  const other = [];
  for (const m of slice.matchAll(OTHER_MODEL_RE)) {
    const s = from + m.index, e = s + m[0].length;
    if (!known.some(k => k.s < e && s < k.e)) other.push({ model: null, name: m[0], s, e });
  }
  const all = [...known, ...other]
    .filter(x => x.e <= start || x.s >= end)
    .map(x => ({ ...x, before: x.e <= start, dist: x.e <= start ? start - x.e : x.s - end }));
  // Nearest preceding mention wins; a following one only when nothing precedes.
  all.sort((a, b) => (b.before - a.before) || (a.dist - b.dist));
  return all;
}

function modelsInWindow(mentions) {
  const unique = [];
  for (const m of mentions) if (m.model && !unique.some(u => u.model === m.model)) unique.push(m);
  return unique;
}

const eq = (a, b) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b)) + 1e-9;
const money = n => `$${n.toFixed(2)}`;

function judge(value, unit, side, model) {
  const perMillion = unit === 'per_thousand' ? value * 1000 : unit === 'per_token' ? value * 1e6 : value;
  const sides = side ? [side] : ['input', 'output'];
  const expected = sides.map(s => `${s} ${money(s === 'input' ? model.inputPerMillion : model.outputPerMillion)}`).join(' / ');
  const hit = sides.some(s => eq(perMillion, s === 'input' ? model.inputPerMillion : model.outputPerMillion));
  return { hit, expected, perMillion };
}

let currencyFigures = 0;
for (const post of posts) {
  const text = post.plainText;
  for (const m of text.matchAll(CURRENCY_RE)) {
    const raw = m[1] ?? m[2] ?? m[3];
    if (!raw || !/\d/.test(raw)) continue;
    currencyFigures++;
    const start = m.index, end = m.index + m[0].replace(/[.,]+$/, '').length;
    const value = parseFigure(raw, post.language);
    const after = text.slice(end, end + 60);
    const unit = unitOf(after);
    const side = sideOf(text, start, end);
    const nearby = text.slice(Math.max(0, start - 60), end + 60);
    const mentions = mentionsInWindow(text, start, end);
    const candidates = modelsInWindow(mentions);
    const base = {
      figure: oneLine(m[0].replace(/[.,]+$/, '')),
      figure_value: Number.isFinite(value) ? String(value) : '',
      unit,
      context: contextAround(text, start, end),
    };

    if (!candidates.length) {
      add('PRICE_CLAIM', post, { ...base, status: 'UNVERIFIABLE', detail: 'no MODELS name within ±100 chars' });
      continue;
    }
    const allNames = candidates.map(c => c.model.displayName).join('; ');
    if (!mentions[0].model) {
      add('PRICE_CLAIM', post, {
        ...base, status: 'UNVERIFIABLE',
        detail: `nearest model named is "${oneLine(mentions[0].name)}", which is not in MODELS`,
        other_models_in_window: allNames,
      });
      continue;
    }
    if (CACHE_LEFT_RE.test(text.slice(Math.max(0, start - 30), start))) {
      add('PRICE_CLAIM', post, {
        ...base, status: 'UNVERIFIABLE', model_matched: candidates[0].model.displayName,
        detail: 'cached-input / cache-write / batch price; pricing.ts has no such figure',
        other_models_in_window: candidates.slice(1).map(c => c.model.displayName).join('; '),
      });
      continue;
    }
    const primary = candidates[0].model;
    const others = candidates.slice(1).map(c => c.model.displayName).join('; ');
    if (unit === 'non_token') {
      add('PRICE_CLAIM', post, {
        ...base, status: 'UNVERIFIABLE', model_matched: primary.displayName,
        detail: 'priced per something other than tokens', other_models_in_window: others,
      });
      continue;
    }

    const result = judge(value, unit, side, primary);
    const notes = [];
    if (side) notes.push(`text marks it as ${side}`);
    if (unit === 'per_thousand' || unit === 'per_token') notes.push(`${unit} figure compared as ${money(result.perMillion)}/1M`);

    if (result.hit) {
      add('PRICE_CLAIM', post, {
        ...base, status: 'MATCH', model_matched: primary.displayName, expected: result.expected,
        detail: notes.join('; '), other_models_in_window: others,
      });
      continue;
    }

    const byValue = candidates.slice(1).find(c => judge(value, unit, side, c.model).hit);
    if (byValue) {
      notes.push(`nearest model was ${primary.displayName}; figure equals ${byValue.model.displayName}'s price`);
      add('PRICE_CLAIM', post, {
        ...base, status: 'MATCH', model_matched: byValue.model.displayName,
        expected: judge(value, unit, side, byValue.model).expected,
        detail: notes.join('; '), other_models_in_window: others,
      });
      continue;
    }

    const up = primary.upcomingChange;
    if (up && (eq(result.perMillion, up.inputPerMillion) || eq(result.perMillion, up.outputPerMillion))) {
      notes.push(`equals the upcomingChange price (${money(up.inputPerMillion)}/${money(up.outputPerMillion)} from ${up.effectiveDate}) that PR #34 removes as cancelled`);
    }
    const tokenPriced = unit !== 'unstated' || side !== null;
    const cacheNearby = CACHE_RE.test(nearby);
    const tier = text.slice(Math.max(0, start - 300), start).match(TIER_RE);
    if (!tokenPriced) notes.push('text does not say it is a per-token price');
    if (cacheNearby) notes.push('cache/batch/discount wording nearby');
    if (tier) notes.push(`"${tier[0]}" in the preceding 300 chars — may be a tier pricing.ts does not hold`);
    add('PRICE_CLAIM', post, {
      ...base, status: 'MISMATCH', confidence: tokenPriced && !cacheNearby && !tier ? 'high' : 'low',
      model_matched: primary.displayName, expected: result.expected,
      detail: notes.join('; '), other_models_in_window: others,
    });
  }
}

// 3. Stale markers ───────────────────────────────────────────────────────────
const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|januari|februari|maret|mei|juni|juli|agustus|oktober|desember|tháng\s?\d{1,2}';
const DATE = `(?:\\b(?:${MONTHS})\\b|\\b(?:19|20)\\d{2}\\b|\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b|\\bQ[1-4]\\b)`;
const PHRASES = [
  'as of', 'currently', 'at the time of writing',
  'a fecha de', 'actualmente', '(?:al|en el) momento de (?:escribir|redactar)(?: este artículo)?',
  'per tanggal', 'saat ini', 'pada saat (?:penulisan|artikel ini ditulis)',
  'tính đến', 'hiện tại', 'hiện nay', 'vào thời điểm viết(?: bài)?',
];
const STALE = [
  ['year 2023', /\b2023\b/g],
  ['year 2024', /\b2024\b/g],
  ['GPT-4o', /\bGPT-?4o\b/gi],
  ['GPT-4', /\bGPT-?4(?!o)(?:\.\d)?(?:\s?Turbo)?\b/gi],
  ['Claude 3.5', /\bClaude\s3\.5\b/gi],
  ['Claude 3', /\bClaude\s3(?!\.5)(?:\.\d)?\b/gi],
  ['Gemini 1.5', /\bGemini\s1\.5\b/gi],
  ['Gemini 2', /\bGemini\s2(?:\.\d)?\b/gi],
  ['phrase + date', new RegExp(`(?:${PHRASES.map(p => `\\b${p}`).join('|')})[^.!?\\n]{0,30}?${DATE}`, 'giu')],
];

for (const post of posts) {
  for (const [marker, re] of STALE) {
    const hits = [...post.plainText.matchAll(re)];
    if (!hits.length) continue;
    const first = hits[0];
    add('STALE_MARKER', post, {
      status: marker,
      figure: [...new Set(hits.map(h => oneLine(h[0])))].slice(0, 5).join(' | '),
      figure_value: String(hits.length),
      detail: `${hits.length} occurrence${hits.length === 1 ? '' : 's'}`,
      context: contextAround(post.plainText, first.index, first.index + first[0].length),
    });
  }
}

// 4. Structure ───────────────────────────────────────────────────────────────
for (const post of posts) {
  const headings = post.blocks.filter(b => b.type === 'block' && /^h[1-6]$/.test(b.style ?? '')).length;
  const empty = post.blocks.filter(b => b.empty).length;
  if (post.wordCount < SHORT_WORDS) add('STRUCTURE', post, { status: 'SHORT', figure_value: String(post.wordCount), detail: `${post.wordCount} words` });
  if (headings === 0) add('STRUCTURE', post, { status: 'NO_HEADINGS', figure_value: '0', detail: `${post.blockCount} blocks, none a heading` });
  if (empty > 0) add('STRUCTURE', post, { status: 'EMPTY_BLOCKS', figure_value: String(empty), detail: `${empty} of ${post.blockCount} blocks have no text` });
  if (!post.translationKey) add('STRUCTURE', post, { status: 'MISSING_TRANSLATION_KEY', detail: `articleNumber ${post.articleNumber ?? '(none)'}` });
}

// ── Order ─────────────────────────────────────────────────────────────────
const TYPE_ORDER = ['PRICE_CLAIM', 'NEAR_DUP_BODY', 'NEAR_DUP_TITLE', 'TITLE_PREFIX_GROUP', 'SAME_KEY_SAME_LANG', 'STALE_MARKER', 'STRUCTURE'];
const PRICE_ORDER = f => f.status === 'MISMATCH' ? (f.confidence === 'high' ? 0 : 1) : f.status === 'MATCH' ? 2 : 3;
const LANG_ORDER = ['en', 'es', 'id', 'vi'];
findings.sort((a, b) =>
  TYPE_ORDER.indexOf(a.finding_type) - TYPE_ORDER.indexOf(b.finding_type)
  || (a.finding_type === 'PRICE_CLAIM' ? PRICE_ORDER(a) - PRICE_ORDER(b) : 0)
  || (Number(b.score ?? 0) - Number(a.score ?? 0))
  || String(a.status ?? '').localeCompare(String(b.status ?? ''))
  || LANG_ORDER.indexOf(a.post.language) - LANG_ORDER.indexOf(b.post.language)
  || String(a.post.slug).localeCompare(String(b.post.slug)));

// ── CSV ───────────────────────────────────────────────────────────────────
const COLUMNS = [
  'finding_type', 'status', 'confidence', 'locale', 'slug', 'title', '_id', 'articleNumber', 'translationKey',
  'figure', 'figure_value', 'unit', 'model_matched', 'expected', 'score', 'detail', 'other_models_in_window', 'context',
  'other_locale', 'other_slug', 'other_title', 'other_id',
  'clicks', 'impressions', 'avg_position', 'other_clicks', 'other_impressions', 'other_avg_position',
];

function toRow(f) {
  const t = trafficFor(f.post);
  const o = f.other ? trafficFor(f.other) : { clicks: '', impressions: '', avg_position: '' };
  return {
    ...f,
    locale: f.post.language, slug: f.post.slug, title: f.post.title, _id: f.post._id,
    articleNumber: f.post.articleNumber ?? '', translationKey: f.post.translationKey ?? '',
    other_locale: f.other?.language ?? '', other_slug: f.other?.slug ?? '',
    other_title: f.other?.title ?? '', other_id: f.other?._id ?? '',
    clicks: t.clicks, impressions: t.impressions, avg_position: t.avg_position,
    other_clicks: o.clicks, other_impressions: o.impressions, other_avg_position: o.avg_position,
  };
}

const cell = v => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const rows = findings.map(toRow);
writeFileSync(OUT_CSV, [COLUMNS.join(','), ...rows.map(r => COLUMNS.map(c => cell(r[c])).join(','))].join('\n') + '\n');

// ── Summary ───────────────────────────────────────────────────────────────
const count = (type, status) => findings.filter(f => f.finding_type === type && (status === undefined || f.status === status)).length;
const price = findings.filter(f => f.finding_type === 'PRICE_CLAIM');
const mismatches = price.filter(f => f.status === 'MISMATCH');
const perLang = Object.fromEntries(LANG_ORDER.map(l => [l, posts.filter(p => p.language === l).length]));
const zeroImpr = posts.filter(p => trafficFor(p).impressions === 0);
const zeroByLang = Object.fromEntries(LANG_ORDER.map(l => [l, zeroImpr.filter(p => p.language === l).length]));
const mdCell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

const tally = (list, key) => {
  const out = {};
  for (const f of list) out[key(f)] = (out[key(f)] ?? 0) + 1;
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
};

const md = [];
md.push(`# Content corpus findings — ${today}`, '');
md.push(`Corpus: ${posts.length} published posts (${LANG_ORDER.map(l => `${l} ${perLang[l]}`).join(', ')}), pulled ${corpus.generatedAt}. `
  + `Prices checked against \`src/lib/pricing.ts\` base fields. Full rows: \`content-findings.csv\` (${rows.length} rows). `
  + `This file reports; it does not recommend.`, '');

md.push('## 1. Price claims', '');
md.push(`${currencyFigures} currency figures found. `
  + `MISMATCH ${mismatches.length} (high confidence ${mismatches.filter(f => f.confidence === 'high').length}, low ${mismatches.filter(f => f.confidence === 'low').length}) · `
  + `MATCH ${count('PRICE_CLAIM', 'MATCH')} · UNVERIFIABLE ${count('PRICE_CLAIM', 'UNVERIFIABLE')}.`, '');
md.push('Mismatches by model and locale:', '');
md.push('| Model | en | es | id | vi | Total |', '|---|---|---|---|---|---|');
for (const [model] of tally(mismatches, f => f.model_matched)) {
  const of = mismatches.filter(f => f.model_matched === model);
  md.push(`| ${model} | ${LANG_ORDER.map(l => of.filter(f => f.post.language === l).length).join(' | ')} | ${of.length} |`);
}
md.push('', 'Most frequent mismatched figures:', '');
md.push('| Model | Figure | Expected | Posts | Confidence |', '|---|---|---|---|---|');
const byFigure = new Map();
for (const f of mismatches) {
  const key = `${f.model_matched}|${f.figure_value}|${f.expected}`;
  const e = byFigure.get(key) ?? { f, posts: new Set(), high: 0 };
  e.posts.add(f.post._id);
  if (f.confidence === 'high') e.high++;
  byFigure.set(key, e);
}
for (const e of [...byFigure.values()].sort((a, b) => b.posts.size - a.posts.size).slice(0, 15)) {
  md.push(`| ${e.f.model_matched} | $${e.f.figure_value} | ${e.f.expected} | ${e.posts.size} | ${e.high ? 'high' : 'low'} |`);
}
const upcoming = mismatches.filter(f => /upcomingChange/.test(f.detail ?? ''));
if (upcoming.length) md.push('', `${upcoming.length} mismatches equal the Sonnet 5 \`upcomingChange\` price ($3/$15) that PR #34 removes as cancelled.`);

md.push('', '## 2. Near-duplicates', '');
md.push(`Body: ${count('NEAR_DUP_BODY')} same-language pairs above ${BODY_THRESHOLD} (${bodyPairsCompared} pairs compared, translation clusters excluded). `
  + `Titles: ${count('NEAR_DUP_TITLE')} pairs above ${TITLE_THRESHOLD}. Same translationKey in one language: ${count('SAME_KEY_SAME_LANG')}.`, '');
const bodyPairs = findings.filter(f => f.finding_type === 'NEAR_DUP_BODY');
if (bodyPairs.length) {
  md.push('| Score | Locale | Post A | Post B |', '|---|---|---|---|');
  for (const f of bodyPairs.slice(0, 15)) md.push(`| ${f.score} | ${f.post.language} | ${mdCell(f.post.slug)} | ${mdCell(f.other.slug)} |`);
  if (bodyPairs.length > 15) md.push('', `…${bodyPairs.length - 15} more in the CSV.`);
  md.push('', `Per locale: ${tally(bodyPairs, f => f.post.language).map(([l, n]) => `${l} ${n}`).join(', ')}.`);
}
const titlePairs = findings.filter(f => f.finding_type === 'NEAR_DUP_TITLE');
if (titlePairs.length) {
  md.push('', '| Title score | Post A | Post B | |', '|---|---|---|---|');
  for (const f of titlePairs.slice(0, 15)) {
    md.push(`| ${f.score} | ${f.post.language} · ${mdCell(f.post.title)} | ${f.other.language} · ${mdCell(f.other.title)} | ${f.detail} |`);
  }
}
md.push('', `Title prefixes: ${titleGroups.length} groups of ${TITLE_PREFIX_MIN}+ same-language posts share their first three title words `
  + `(case-insensitive, leading articles ignored), covering ${titleGroups.reduce((n, g) => n + g.group.length, 0)} posts `
  + `(${LANG_ORDER.map(l => `${l} ${titleGroups.filter(g => g.language === l).length}`).join(', ')} groups).`);
if (titleGroups.length) {
  md.push('', '| Posts | Locale | First three words | Titles |', '|---|---|---|---|');
  for (const g of titleGroups) {
    md.push(`| ${g.group.length} | ${g.language} | ${mdCell(g.prefix)} | ${g.group.map(p => mdCell(p.title)).join('<br>')} |`);
  }
}

md.push('', '## 3. Stale markers', '');
md.push('| Marker | Posts | en | es | id | vi |', '|---|---|---|---|---|---|');
for (const [marker] of STALE) {
  const of = findings.filter(f => f.finding_type === 'STALE_MARKER' && f.status === marker);
  md.push(`| ${marker} | ${of.length} | ${LANG_ORDER.map(l => of.filter(f => f.post.language === l).length).join(' | ')} |`);
}
const anyStale = new Set(findings.filter(f => f.finding_type === 'STALE_MARKER').map(f => f.post._id)).size;
md.push('', `${anyStale} posts carry at least one marker.`);

md.push('', '## 4. Structure', '');
md.push('| Check | Posts | en | es | id | vi |', '|---|---|---|---|---|---|');
for (const status of ['SHORT', 'NO_HEADINGS', 'EMPTY_BLOCKS', 'MISSING_TRANSLATION_KEY']) {
  const of = findings.filter(f => f.finding_type === 'STRUCTURE' && f.status === status);
  md.push(`| ${status} | ${of.length} | ${LANG_ORDER.map(l => of.filter(f => f.post.language === l).length).join(' | ')} |`);
}
const keyless = posts.filter(p => !p.translationKey);
if (keyless.length) {
  const numbers = keyless.map(p => p.articleNumber).filter(n => typeof n === 'number');
  const distinct = new Set(numbers).size;
  const sharedSlugs = keyless.filter(p => p.language !== 'en' && keyless.some(q => q.language === 'en' && q.slug === p.slug)).length;
  md.push('', `Keyless posts: ${distinct} distinct articleNumbers across ${keyless.length} posts`
    + (numbers.length ? ` (${Math.min(...numbers)}–${Math.max(...numbers)})` : '')
    + `; ${sharedSlugs} non-en keyless posts reuse an en keyless slug, which is what the near-duplicate pass clusters them by.`);
}

md.push('', '## 5. Traffic join', '');
if (gscStats.found) {
  const matched = posts.length - zeroImpr.length;
  md.push(`Source: \`${GSC.replace(resolve('.') + '/', '')}\`, ${gscStats.blogRows} blog rows `
    + `(${gscStats.fragmentRows} "#fragment" rows folded into their post).`, '');
  md.push(`- **${zeroImpr.length} of ${posts.length} posts have no GSC row** and are marked impressions=0 `
    + `(${LANG_ORDER.map(l => `${l} ${zeroByLang[l]}/${perLang[l]}`).join(', ')}). `
    + `Their avg_position is blank — there is no position to report.`);
  md.push(`- ${matched} posts matched a GSC row.`);
  md.push(`- ${gscStats.unmatched.length} GSC blog rows match no current post (renamed or deleted slugs)`
    + (gscStats.unmatched.length ? `: ${gscStats.unmatched.slice(0, 10).map(u => `\`${u.paths[0]}\` (${u.impressions} impr)`).join(', ')}${gscStats.unmatched.length > 10 ? ', …' : ''}.` : '.'));
} else {
  md.push(`No GSC export found at \`${GSC}\`; traffic columns are blank.`);
}
md.push('');
writeFileSync(OUT_MD, md.join('\n'));

console.log(`${rows.length} findings → ${OUT_CSV}`);
console.log(`Summary → ${OUT_MD}`);
console.log(`Price: ${mismatches.length} MISMATCH (${mismatches.filter(f => f.confidence === 'high').length} high), ${count('PRICE_CLAIM', 'MATCH')} MATCH, ${count('PRICE_CLAIM', 'UNVERIFIABLE')} UNVERIFIABLE`);
console.log(`Near-dup body ${count('NEAR_DUP_BODY')}, title ${count('NEAR_DUP_TITLE')}; zero-impression posts ${zeroImpr.length}/${posts.length}`);
