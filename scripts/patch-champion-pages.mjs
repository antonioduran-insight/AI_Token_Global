/**
 * patch-champion-pages.mjs
 *
 * Fixes stale copy on the non-article pages that lives in Sanity, not in code
 * (champion audit 2026-11-24, follow-up to PR #56):
 *
 *   1. homePage-{en,es,id,vi} faq "How much does 1,000 AI API calls cost?"
 *      (_key 1c0739d593ea): the GPT-4o mini / GPT-4o example → the current
 *      everyday vs flagship OpenAI models from pricing.ts, with the math shown.
 *   2. apiComparePage-{en,es,id,vi} faq "4. I only need content creation…"
 *      (_key 9e4f450fb294): "GPT-4o or Claude Sonnet" → the current everyday
 *      OpenAI and Anthropic models, with their prices vs the OpenAI flagship.
 *   3. homePage-es faq "¿Qué es una API de Modelo?" (_key 6915e6383bc5):
 *      "GPT-4o, Claude o Gemini" → the current everyday model of each provider.
 *   4. homePage-{en,es,id,vi} heroStats[_key=="94f2946a6713"].statNumber: "60+" → "140+"
 *      (the AI Token King catalog lists 146 models on 2026-11-25).
 *   5. tokenCalculatorPage-id: heroHeadline and seo.seoTitle in Indonesian,
 *      targeting "kalkulator token AI".
 *   6. apiModelPage-{chatgpt,claude,gemini}-{lang} pricingReference: the price
 *      list (GPT-5.6 / Claude Opus 5 / Gemini 3.1 Pro …) → the provider's models
 *      in pricing.ts with input / cached / output, and a re-dated "verified" note.
 *   7. homePage-{lang}.seo.seoDescription and apiComparePage-{lang}.pricingCalloutBody:
 *      "60+" → "140+" (the callout says the 140+ are on AI Token King).
 *   8. homePage-{en,id,vi} faq "What is a Model API?" (_key 6915e6383bc5): "GPT-4"
 *      example → current everyday models (es, which said GPT-4o, is item 3).
 *
 * Models and prices come from src/lib/pricing.ts at run time (Node 22.6+ imports
 * the .ts directly), picked by role — per provider, the cheapest model is the
 * "everyday" one and the dearest the "flagship" — so a pricing.ts refresh is
 * picked up by re-running, never by editing copy. The arithmetic is computed here.
 *
 * Only the listed fields change. For portable-text answers only the one span's
 * text changes; marks, keys and every other block are untouched.
 *
 * Same pattern as patch-champion-facts.mjs / patch-portable-text.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs SANITY_TOKEN from the shell.
 *   - Guards, each skip reported: the document is published, no draft exists,
 *     and every target field still holds exactly the audited text (for a
 *     'phrase' edit the phrase appears exactly once). Anything that drifted is
 *     skipped, not guessed at.
 *   - Every touched document is backed up to audits/2026-11-25/champion-pages-backup/
 *     before the write (an earlier backup is never overwritten), with a sidecar
 *     <id>.edits.json of each field's before/after. All patches go in ONE
 *     transaction, each pinned to the _rev read in this run, then re-read.
 *   - Logs: champion-pages-log.md for --apply, champion-pages-dryrun.md otherwise.
 *
 * --revert puts back the original values from the sidecars, only where the field
 * still holds exactly what this script wrote. Dry run by default.
 *
 * Usage:
 *   node scripts/patch-champion-pages.mjs                         # dry run
 *   SANITY_TOKEN=… node scripts/patch-champion-pages.mjs --apply
 *   node scripts/patch-champion-pages.mjs --revert                # dry run of the undo
 *   SANITY_TOKEN=… node scripts/patch-champion-pages.mjs --revert --apply
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MODELS, formatIsoDate, oldestCheck } from '../src/lib/pricing.ts';

const APPLY = process.argv.includes('--apply');
const REVERT = process.argv.includes('--revert');
const TOKEN = process.env.SANITY_TOKEN;
const READ_TOKEN = TOKEN || process.env.SANITY_READ_TOKEN;
const OUT_DIR = 'audits/2026-11-25';
const BACKUP_DIR = join(OUT_DIR, 'champion-pages-backup');
const LANGS = ['en', 'es', 'id', 'vi'];

function must(cond, msg) {
  if (!cond) throw new Error(`[champion-pages] ${msg} — pricing.ts changed in a way the copy no longer fits; rewrite it.`);
}

// ── Models by role ───────────────────────────────────────────────────────
const byInput = (a, b) => a.inputPerMillion - b.inputPerMillion || a.outputPerMillion - b.outputPerMillion;
const roles = provider => {
  const list = MODELS.filter(m => m.provider === provider).sort(byInput);
  must(list.length >= 1, `no ${provider} model in pricing.ts`);
  return { everyday: list[0], flagship: list.at(-1) };
};
const OPENAI = roles('OpenAI'), ANTHROPIC = roles('Anthropic'), GOOGLE = roles('Google');
must(OPENAI.flagship.inputPerMillion > OPENAI.everyday.inputPerMillion
  && OPENAI.flagship.outputPerMillion > OPENAI.everyday.outputPerMillion, 'OpenAI flagship must cost more than the everyday model');

// ── Locale number formats (each follows what the existing copy in that locale uses) ──
const FMT = {
  en: { locale: 'en-US', dateLocale: 'en-US' },
  es: { locale: 'en-US', dateLocale: 'es-ES' },
  id: { locale: 'id-ID', dateLocale: 'id-ID' },
  vi: { locale: 'vi-VN', dateLocale: 'vi-VN', moneyLocale: 'en-US' },
};
const int = (lang, n) => n.toLocaleString(FMT[lang].locale);
function money(lang, n) {
  const loc = FMT[lang].moneyLocale ?? FMT[lang].locale;
  for (const d of [2, 3, 4]) {
    if (Math.abs(Number(n.toFixed(d)) - n) < 1e-9) return `$${n.toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  }
  return `$${n.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── 1. "How much does 1,000 AI API calls cost?" ──────────────────────────
const SHORT = { in: 500, out: 200 }, LONG = { in: 2000, out: 500 }, CALLS = 1000;
const costOf = (m, w) => (CALLS * (w.in * m.inputPerMillion + w.out * m.outputPerMillion)) / 1_000_000;

function callsFaq(lang) {
  const e = OPENAI.everyday, f = OPENAI.flagship;
  const x = costOf(e, SHORT), y = costOf(f, LONG);
  must(y > x, 'the flagship example must cost more than the everyday one');
  const n = v => int(lang, v), $ = v => money(lang, v);
  const date = formatIsoDate(oldestCheck([e, f]), FMT[lang].dateLocale);
  const mathE = `${n(CALLS)} × (${n(SHORT.in)} × ${$(e.inputPerMillion)} + ${n(SHORT.out)} × ${$(e.outputPerMillion)}) ÷ ${n(1_000_000)} = ${$(x)}`;
  const mathF = `${n(CALLS)} × (${n(LONG.in)} × ${$(f.inputPerMillion)} + ${n(LONG.out)} × ${$(f.outputPerMillion)}) ÷ ${n(1_000_000)} = ${$(y)}`;
  switch (lang) {
    case 'en': return `It depends heavily on the model and your average prompt/response length. With ${e.displayName} (${$(e.inputPerMillion)} per 1M input tokens, ${$(e.outputPerMillion)} per 1M output tokens) and short prompts (~${n(SHORT.in)} tokens in, ~${n(SHORT.out)} out), 1,000 calls cost ${mathE}. With ${f.displayName} (${$(f.inputPerMillion)} / ${$(f.outputPerMillion)}) and longer conversations (~${n(LONG.in)} tokens in, ~${n(LONG.out)} out), the same 1,000 calls cost ${mathF}. Prices as of ${date}. Use our Token Calculator to estimate your specific scenario.`;
    case 'es': return `Depende en gran medida del modelo y de la longitud promedio de tus prompts y respuestas. Con ${e.displayName} (${$(e.inputPerMillion)} por 1M de tokens de entrada y ${$(e.outputPerMillion)} por 1M de tokens de salida) y prompts cortos (~${n(SHORT.in)} tokens de entrada, ~${n(SHORT.out)} de salida), 1,000 llamadas cuestan ${mathE}. Con ${f.displayName} (${$(f.inputPerMillion)} / ${$(f.outputPerMillion)}) y conversaciones más largas (~${n(LONG.in)} tokens de entrada, ~${n(LONG.out)} de salida), esas mismas 1,000 llamadas cuestan ${mathF}. Precios al ${date}. Usa nuestra Calculadora de Tokens para estimar tu escenario específico.`;
    case 'id': return `Sangat tergantung pada model dan rata-rata panjang prompt/respons kamu. Dengan ${e.displayName} (${$(e.inputPerMillion)} per 1 juta token input, ${$(e.outputPerMillion)} per 1 juta token output) dan prompt pendek (~${n(SHORT.in)} token masuk, ~${n(SHORT.out)} keluar), 1.000 panggilan menelan biaya ${mathE}. Dengan ${f.displayName} (${$(f.inputPerMillion)} / ${$(f.outputPerMillion)}) dan percakapan lebih panjang (~${n(LONG.in)} token masuk, ~${n(LONG.out)} keluar), 1.000 panggilan yang sama mencapai ${mathF}. Harga per ${date}. Gunakan Kalkulator Token kami untuk memperkirakan skenario spesifikmu.`;
    case 'vi': return `Điều này phụ thuộc nhiều vào mô hình và độ dài prompt/phản hồi trung bình của bạn. Với ${e.displayName} (${$(e.inputPerMillion)} cho mỗi 1 triệu token đầu vào, ${$(e.outputPerMillion)} cho mỗi 1 triệu token đầu ra) và prompt ngắn (~${n(SHORT.in)} token đầu vào, ~${n(SHORT.out)} đầu ra), 1.000 lệnh gọi tốn ${mathE}. Với ${f.displayName} (${$(f.inputPerMillion)} / ${$(f.outputPerMillion)}) và các cuộc hội thoại dài hơn (~${n(LONG.in)} token đầu vào, ~${n(LONG.out)} đầu ra), 1.000 lệnh gọi tương tự tốn ${mathF}. Giá tính đến ${date}. Hãy dùng Máy tính Token của chúng tôi để ước tính cho tình huống cụ thể của bạn.`;
  }
}

// ── 2. "I only need content creation — which model category is best?" ───
function contentFaq(lang) {
  const a = OPENAI.everyday, b = ANTHROPIC.everyday, f = OPENAI.flagship, $ = v => money(lang, v);
  const prices = `${$(a.inputPerMillion)}`, out = `${$(a.outputPerMillion)}`;
  switch (lang) {
    case 'en': return `. We recommend starting with an everyday model such as ${a.displayName} or ${b.displayName}. They cost much less than the flagship models (${a.displayName}: ${prices} per 1M input tokens and ${out} per 1M output tokens, vs ${$(f.inputPerMillion)} and ${$(f.outputPerMillion)} for ${f.displayName}), and you can move up to a flagship when a task needs it.`;
    case 'es': return `. Te recomendamos empezar con un modelo de uso diario como ${a.displayName} o ${b.displayName}. Cuestan mucho menos que los modelos insignia (${a.displayName}: ${prices} por 1M de tokens de entrada y ${out} por 1M de tokens de salida, frente a ${$(f.inputPerMillion)} y ${$(f.outputPerMillion)} de ${f.displayName}), y puedes pasar a un modelo insignia cuando una tarea lo requiera.`;
    case 'id': return `. Kami sarankan mulai dengan model sehari-hari seperti ${a.displayName} atau ${b.displayName}. Biayanya jauh lebih murah daripada model unggulan (${a.displayName}: ${prices} per 1 juta token input dan ${out} per 1 juta token output, dibandingkan ${$(f.inputPerMillion)} dan ${$(f.outputPerMillion)} untuk ${f.displayName}), dan kamu bisa beralih ke model unggulan saat tugasnya membutuhkan.`;
    case 'vi': return `. Chúng tôi khuyên bạn nên bắt đầu với một mô hình dùng hằng ngày như ${a.displayName} hoặc ${b.displayName}. Chúng rẻ hơn nhiều so với các mô hình hàng đầu (${a.displayName}: ${prices} cho mỗi 1 triệu token đầu vào và ${out} cho mỗi 1 triệu token đầu ra, so với ${$(f.inputPerMillion)} và ${$(f.outputPerMillion)} của ${f.displayName}), và bạn có thể chuyển sang mô hình hàng đầu khi tác vụ cần.`;
  }
}

// ── 6. apiModelPage pricingReference: the per-model price list + its note ─
// The list is a run of bullet blocks followed by a note paragraph. The bullets
// for models no longer in pricing.ts are rewritten in place (keys and marks kept)
// for the provider's current models, flagship first; extra bullets are dropped.
const OLD_LIST = {
  OpenAI: ['GPT-5.6 Sol:', 'GPT-5.6 Terra:', 'GPT-5.6 Luna:'],
  Anthropic: ['Claude Opus 5:', 'Claude Sonnet 5:', 'Claude Haiku 4.5:'],
  Google: ['Gemini 3.1 Pro:', 'Gemini 3.1 Pro (200K+):', 'Gemini 3.6 Flash:', 'Gemini 3.5 Flash-Lite:'],
};
const OLD_VERIFIED = {
  OpenAI: { en: '11 August 2026', es: '11 de agosto de 2026', id: '11 Agustus 2026', vi: '11 tháng 8 năm 2026' },
  Anthropic: { en: '3 September 2026', es: '3 de septiembre de 2026', id: '3 September 2026', vi: '3 tháng 9 năm 2026' },
  Google: { en: '11 August 2026', es: '11 de agosto de 2026', id: '11 Agustus 2026', vi: '11 tháng 8 năm 2026' },
};
/** "25 November 2026" in each locale's existing style for these notes. */
function verifiedDate(lang, iso) {
  const [y, m, d] = iso.split('-').map(Number);
  if (lang === 'vi') return `${d} tháng ${m} năm ${y}`;
  return new Date(y, m - 1, d).toLocaleDateString({ en: 'en-GB', es: 'es-ES', id: 'id-ID' }[lang], { day: 'numeric', month: 'long', year: 'numeric' });
}
const usd2 = n => `$${n.toFixed(2)}`;
function priceLine(m, lang) {
  const [i, c, o] = [usd2(m.inputPerMillion), usd2(m.cachedInputPerMillion), usd2(m.outputPerMillion)];
  switch (lang) {
    case 'en': return `${m.displayName}: ${i} / 1M input tokens · ${c} / 1M cached input tokens · ${o} / 1M output tokens`;
    case 'es': return `${m.displayName}: ${i} / 1M tokens de entrada · ${c} / 1M tokens de entrada en caché · ${o} / 1M tokens de salida`;
    case 'id': return `${m.displayName}: ${i} / 1M token input · ${c} / 1M token input dari cache · ${o} / 1M token output`;
    case 'vi': return `${m.displayName}: ${i} / 1M token đầu vào · ${c} / 1M token đầu vào từ cache · ${o} / 1M token đầu ra`;
  }
}
function priceNote(provider, lang, date) {
  const n = {
    OpenAI: {
      en: `Rates are for the standard tier and prompts up to 272K tokens. Cached input (a repeated prompt prefix) is billed at the cached rate, so repeated system prompts cost far less than a naive estimate suggests. Verified against OpenAI's published pricing on ${date}.`,
      es: `Las tarifas corresponden al nivel estándar y a prompts de hasta 272K tokens. La entrada en caché (un prefijo de prompt repetido) se factura a la tarifa en caché, por lo que los prompts de sistema repetidos cuestan mucho menos de lo que sugiere un cálculo ingenuo. Verificado con los precios publicados por OpenAI el ${date}.`,
      id: `Tarif ini untuk tingkat standar dan prompt hingga 272K token. Input dari cache (awalan prompt yang berulang) ditagih dengan tarif cache, jadi system prompt yang berulang jauh lebih murah daripada perkiraan kasar. Diverifikasi dengan harga resmi OpenAI pada ${date}.`,
      vi: `Các mức giá áp dụng cho bậc tiêu chuẩn và prompt tối đa 272K token. Input được lưu cache (phần đầu prompt lặp lại) được tính theo giá cache, nên các system prompt lặp lại rẻ hơn nhiều so với ước tính thông thường. Đã kiểm chứng với bảng giá chính thức của OpenAI ngày ${date}.`,
    },
    Anthropic: {
      en: `The cached rate applies to prompt-cache hits and refreshes. Verified against Anthropic's published pricing on ${date}.`,
      es: `La tarifa en caché se aplica a los aciertos y renovaciones de la caché de prompts. Verificado con los precios publicados por Anthropic el ${date}.`,
      id: `Tarif cache berlaku untuk cache hit dan refresh pada prompt cache. Diverifikasi dengan harga resmi Anthropic pada ${date}.`,
      vi: `Giá cache áp dụng cho các lần đọc (cache hit) và làm mới prompt cache. Đã kiểm chứng với bảng giá chính thức của Anthropic ngày ${date}.`,
    },
    Google: {
      en: `These are Google's regular standard-tier rates; context-cache storage, where it applies, is billed separately per hour. Verified against Google's published pricing on ${date}.`,
      es: `Son las tarifas regulares del nivel estándar de Google; el almacenamiento de la caché de contexto, cuando aplica, se factura aparte por hora. Verificado con los precios publicados por Google el ${date}.`,
      id: `Ini adalah tarif reguler tingkat standar Google; penyimpanan context cache, jika berlaku, ditagih terpisah per jam. Diverifikasi dengan harga resmi Google pada ${date}.`,
      vi: `Đây là mức giá thông thường ở bậc tiêu chuẩn của Google; phí lưu trữ context cache, nếu có, được tính riêng theo giờ. Đã kiểm chứng với bảng giá chính thức của Google ngày ${date}.`,
    },
  };
  return n[provider][lang];
}
const soleText = b => (b?._type === 'block' && b.children?.length === 1 && b.children[0]._type === 'span') ? b.children[0].text : null;
function priceListEdit(provider, lang) {
  const models = MODELS.filter(m => m.provider === provider).sort((a, b) => -byInput(a, b));
  const old = OLD_LIST[provider];
  const parts = arr => {
    const bullets = arr.filter(b => b.listItem === 'bullet');
    const note = [...arr].reverse().find(b => b.listItem !== 'bullet' && soleText(b));
    return { bullets, note };
  };
  return {
    path: 'pricingReference', kind: 'array',
    why: `price list cites ${old.map(o => o.replace(':', '')).join(', ')}; now ${models.map(m => m.displayName).join(', ')} from pricing.ts`,
    check(arr) {
      if (!Array.isArray(arr)) return 'field is gone or not an array';
      const { bullets, note } = parts(arr);
      if (bullets.length !== old.length) return `has ${bullets.length} bullets, expected ${old.length}`;
      const bad = bullets.findIndex((b, i) => !(soleText(b) ?? '').startsWith(old[i]));
      if (bad >= 0) return `bullet ${bad + 1} no longer starts with "${old[bad]}"`;
      if (!note || !soleText(note).includes(OLD_VERIFIED[provider][lang])) return `note no longer says verified on ${OLD_VERIFIED[provider][lang]}`;
      if (models.length > bullets.length) return `pricing.ts has ${models.length} ${provider} models, more than the ${bullets.length} bullets`;
      return null;
    },
    build(arr) {
      const out = structuredClone(arr);
      const { bullets, note } = parts(out);
      bullets.forEach((b, i) => { if (i < models.length) b.children[0].text = priceLine(models[i], lang); });
      note.children[0].text = priceNote(provider, lang, verifiedDate(lang, oldestCheck(models)));
      const drop = new Set(bullets.slice(models.length).map(b => b._key));
      return out.filter(b => !drop.has(b._key));
    },
  };
}
const renderList = arr => arr.map(b => (b.listItem === 'bullet' ? '• ' : '') + (b.children ?? []).map(c => c.text).join('')).filter(t => t.trim()).join('\n');

// ── The plan ─────────────────────────────────────────────────────────────
// kind 'value': the field must equal `before`.
// kind 'phrase': `before` must appear exactly once in the field; only it is replaced.
// kind 'array': `check(current)` must return null; `build(current)` gives the new array.
const CALLS_BEFORE = {
  en: 'It depends heavily on the model and your average prompt/response length. For GPT-4o mini with short prompts (~500 tokens in, ~200 out), 1,000 calls would cost roughly $0.075–$0.15. For GPT-4o with longer conversations, the same 1,000 calls could cost $5–$20. Use our Token Calculator to estimate your specific scenario.',
  es: 'Depende en gran medida del modelo y de la longitud promedio de tus prompts y respuestas. Con GPT-4o mini y prompts cortos (~500 tokens de entrada, ~200 de salida), 1,000 llamadas costarían aproximadamente $0.075–$0.15. Con GPT-4o y conversaciones más largas, esas mismas 1,000 llamadas podrían costar entre $5 y $20. Usa nuestra Calculadora de Tokens para estimar tu escenario específico.',
  id: 'Sangat tergantung pada model dan rata-rata panjang prompt/respons kamu. Untuk GPT-4o mini dengan prompt pendek (~500 token masuk, ~200 keluar), 1.000 panggilan akan menelan biaya sekitar $0,075–$0,15. Untuk GPT-4o dengan percakapan lebih panjang, 1.000 panggilan yang sama bisa mencapai $5–$20. Gunakan Kalkulator Token kami untuk memperkirakan skenario spesifikmu.',
  vi: 'Điều này phụ thuộc nhiều vào mô hình và độ dài prompt/phản hồi trung bình của bạn. Với GPT-4o mini và prompt ngắn (~500 token đầu vào, ~200 đầu ra), 1.000 lệnh gọi sẽ tốn khoảng $0.075–$0.15. Với GPT-4o và các cuộc hội thoại dài hơn, 1.000 lệnh gọi tương tự có thể tốn $5–$20. Hãy dùng Máy tính Token của chúng tôi để ước tính cho tình huống cụ thể của bạn.',
};
const CONTENT_BEFORE = {
  en: '. We recommend beginning with established models like GPT-4o or Claude Sonnet, as they have the best documentation and largest community support.',
  es: '. Te recomendamos empezar con modelos consolidados como GPT-4o o Claude Sonnet, ya que cuentan con la mejor documentación y el mayor soporte de la comunidad.',
  id: '. Kami sarankan untuk mulai dengan model-model mapan seperti GPT-4o atau Claude Sonnet, karena keduanya memiliki dokumentasi terbaik dan dukungan komunitas terbesar.',
  vi: '. Chúng tôi khuyên bạn nên bắt đầu với các mô hình đã được kiểm chứng như GPT-4o hoặc Claude Sonnet, vì chúng có tài liệu tốt nhất và cộng đồng hỗ trợ lớn nhất.',
};
const MODEL_API_BEFORE = { en: 'GPT-4, Claude, or Gemini', es: 'GPT-4o, Claude o Gemini', id: 'GPT-4, Claude, atau Gemini', vi: 'GPT-4, Claude, hoặc Gemini' };
function modelApiPhrase(lang) {
  const [a, b, c] = [OPENAI.everyday.displayName, ANTHROPIC.everyday.displayName, GOOGLE.everyday.displayName];
  return { en: `${a}, ${b}, or ${c}`, es: `${a}, ${b} o ${c}`, id: `${a}, ${b}, atau ${c}`, vi: `${a}, ${b}, hoặc ${c}` }[lang];
}
const SEO_BEFORE = { en: 'Compare 60+ models', es: 'Compara más de 60+ modelos', id: 'Bandingkan 60+ model', vi: 'So sánh 60+ mô hình' };
const SEO_AFTER = { en: 'Compare 140+ models', es: 'Compara más de 140 modelos', id: 'Bandingkan 140+ model', vi: 'So sánh hơn 140 mô hình' };
const CALLOUT_BEFORE = {
  en: 'Real-time pricing for 60+ models',
  es: 'Precios en tiempo real para más de 60 modelos',
  id: 'Harga real-time untuk 60+ model',
  vi: 'Giá thời gian thực cho 60+ mô hình',
};
const CALLOUT_AFTER = {
  en: 'Real-time pricing for 140+ models on AI Token King',
  es: 'Precios en tiempo real para más de 140 modelos en AI Token King',
  id: 'Harga real-time untuk 140+ model di AI Token King',
  vi: 'Giá thời gian thực cho hơn 140 mô hình trên AI Token King',
};
const CALLS_PATH ='faq[_key=="1c0739d593ea"].answer[_key=="3c53c6c715ae"].children[_key=="3695c687b396"].text';
const CONTENT_PATH = 'faq[_key=="9e4f450fb294"].answer[_key=="d36012b574fd"].children[_key=="fdac3c3d6ded"].text';
const STAT_PATH = 'heroStats[_key=="94f2946a6713"].statNumber';

const PLAN = [
  ...LANGS.map(lang => ({
    _id: `homePage-${lang}`, url: `/${lang}/`,
    edits: [
      { path: CALLS_PATH, kind: 'value', why: 'FAQ "1,000 AI API calls" cites GPT-4o mini / GPT-4o (not in pricing.ts)', before: CALLS_BEFORE[lang], after: () => callsFaq(lang) },
      { path: STAT_PATH, kind: 'value', why: 'hero stat: AI Token King catalog lists 146 models (2026-11-25)', before: '60+', after: () => '140+' },
      {
        path: 'faq[_key=="6915e6383bc5"].answer[_key=="949420912f4d"].children[_key=="73911c7d59ef"].text', kind: 'phrase',
        why: 'FAQ "What is a Model API?" names GPT-4 / GPT-4o as example models',
        before: MODEL_API_BEFORE[lang],
        after: () => modelApiPhrase(lang),
      },
      { path: 'seo.seoDescription', kind: 'phrase', why: 'meta description: "60+" → AI Token King catalog count', before: SEO_BEFORE[lang], after: () => SEO_AFTER[lang] },
    ],
  })),
  ...LANGS.map(lang => ({
    _id: `apiComparePage-${lang}`, url: `/${lang}/api-compare/`,
    edits: [
      { path: CONTENT_PATH, kind: 'value', why: 'FAQ 4 recommends GPT-4o (not in pricing.ts)', before: CONTENT_BEFORE[lang], after: () => contentFaq(lang) },
      { path: 'pricingCalloutBody', kind: 'phrase', why: 'callout above the comparison table: "60+" → 140+, said to be on AI Token King', before: CALLOUT_BEFORE[lang], after: () => CALLOUT_AFTER[lang] },
    ],
  })),
  ...[['chatgpt', 'OpenAI'], ['claude', 'Anthropic'], ['gemini', 'Google']].flatMap(([slug, provider]) => LANGS.map(lang => ({
    _id: `apiModelPage-${slug}-${lang}`, url: `/${lang}/${slug}-api/`,
    edits: [priceListEdit(provider, lang)],
  }))),
  {
    _id: 'tokenCalculatorPage-id', url: '/id/token-calculator/',
    edits: [
      { path: 'heroHeadline', kind: 'value', why: 'H1 in English on the id page; target "kalkulator token AI"', before: 'AI Token Calculator', after: () => 'Kalkulator Token AI' },
      { path: 'seo.seoTitle', kind: 'value', why: '<title> in English on the id page; target "kalkulator token AI"', before: 'AI Token Calculator — Estimasi Biaya Seketika', after: () => 'Kalkulator Token AI — Hitung Token & Estimasi Biaya API' },
    ],
  },
];

// ── Path reading: `a.b[_key=="x"].c` against a fetched document ─────────
function getAt(doc, path) {
  let cur = doc;
  for (const seg of path.split('.')) {
    const m = seg.match(/^([A-Za-z0-9_]+)(?:\[_key=="([^"]+)"\])?$/);
    if (!m || cur == null) return undefined;
    cur = cur[m[1]];
    if (m[2] !== undefined) cur = Array.isArray(cur) ? cur.find(x => x?._key === m[2]) : undefined;
  }
  return cur;
}

// ── Client, log, guards ──────────────────────────────────────────────────
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
function writeLog(name) {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, name);
  writeFileSync(path, log.join('\n') + '\n');
  console.log(`Log → ${path}${problems ? `\n${problems} problem(s); see above.` : ''}`);
  process.exit(problems ? 1 : 0);
}
async function commit(patches) {
  const tx = client.transaction();
  for (const p of patches) tx.patch(p.id, q => q.set(p.sets).ifRevisionId(p.rev));
  try { await tx.commit({ visibility: 'sync' }); return true; } catch (err) { say(`FAILED, nothing written: ${err.message}`); problems++; return false; }
}
async function reread(patches, expect) {
  say('### Re-read');
  for (const p of patches) {
    const r = await client.fetch('{"doc": *[_id == $id][0], "draft": defined(*[_id == $d][0])}', { id: p.id, d: `drafts.${p.id}` });
    const ok = !r.draft && Object.entries(p.sets).every(([path, v]) => same(getAt(r.doc, path), v));
    say(`- \`${p.id}\`: ${ok ? `${Object.keys(p.sets).length} field(s) hold ${expect}` : 'FAILED'}${r.draft ? ' (a draft appeared)' : ''}`);
    if (!ok) problems++;
  }
  say('');
}
const quote = t => String(t).split('\n').map(l => `> ${l}`).join('\n');
/** Deep equality that ignores object key order (Sanity may return keys in a different order). */
const canon = v => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));
const same = (a, b) => canon(a) === canon(b);

// ── --revert ─────────────────────────────────────────────────────────────
if (REVERT) {
  say(`# Champion pages REVERT ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
  say('');
  const sidecars = existsSync(BACKUP_DIR)
    ? readdirSync(BACKUP_DIR).filter(f => f.endsWith('.edits.json')).map(f => JSON.parse(readFileSync(join(BACKUP_DIR, f), 'utf8')))
    : [];
  say(`Edit records in ${BACKUP_DIR}/: ${sidecars.length}${sidecars.length ? '' : ' — nothing has been applied, nothing to revert.'}`);
  say('');
  const ids = sidecars.map(s => s._id);
  const current = new Map((await client.fetch('*[_id in $ids]', { ids })).map(d => [d._id, d]));
  const drafts = await existingDrafts(ids);
  const patches = [], skips = [];
  for (const s of sidecars) {
    const doc = current.get(s._id);
    const where = `\`${s._id}\` ${s.url}`;
    if (!doc) { skips.push(`${where}: no longer published`); continue; }
    if (drafts.has(`drafts.${s._id}`)) { skips.push(`${where}: a draft exists; revert it in Studio instead`); continue; }
    const sets = {};
    for (const e of s.edits) {
      if (!same(getAt(doc, e.path), e.after)) { skips.push(`${where} \`${e.path}\`: changed since the apply; revert by hand from the backup`); continue; }
      sets[e.path] = e.before;
      say(`- ${where} \`${e.path}\`: back to the original value`);
    }
    if (Object.keys(sets).length) patches.push({ id: s._id, rev: doc._rev, sets });
  }
  say('');
  say(`## Guard skips: ${skips.length}${draftNote}`);
  for (const s of skips) say(`- ${s}`);
  say('');
  say(`## ${APPLY ? 'Reverting' : 'Would revert'}: ${patches.length} document(s) in ONE transaction`);
  say('');
  if (APPLY && patches.length && await commit(patches)) await reread(patches, 'the original values');
  writeLog(APPLY ? 'champion-pages-revert-log.md' : 'champion-pages-revert-dryrun.md');
}

// ── Apply / dry run ──────────────────────────────────────────────────────
say(`# Champion pages (Sanity copy) ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');
say('Source: `audits/2026-11-24/champion-audit.csv` (branch antonio/champion-audit-2026-11-24) and PR #56 "Copy in Sanity, left untouched".');
say('Models by role from `src/lib/pricing.ts`, read at run time (USD per 1M input/output tokens): '
  + [['OpenAI everyday', OPENAI.everyday], ['OpenAI flagship', OPENAI.flagship], ['Anthropic everyday', ANTHROPIC.everyday], ['Google everyday', GOOGLE.everyday]]
    .map(([r, m]) => `${r} ${m.displayName} $${m.inputPerMillion.toFixed(2)}/$${m.outputPerMillion.toFixed(2)} (checked ${m.lastChecked})`).join(' · ') + '.');
say('Only the fields below change. Every other field, block, span and mark is untouched.');
say('');

const ids = PLAN.map(p => p._id);
const docs = new Map((await client.fetch('*[_id in $ids]', { ids })).map(d => [d._id, d]));
const drafts = await existingDrafts(ids);
const patches = [], skips = [];
let planned = 0;
for (const p of PLAN) {
  const where = `\`${p._id}\` ${p.url}`;
  say(`## ${p._id} · ${p.url}`);
  say('');
  const doc = docs.get(p._id);
  const docSkip = !doc ? 'not published' : drafts.has(`drafts.${p._id}`) ? 'a draft exists; Studio would show it, and publishing it later would undo this' : null;
  if (docSkip) { skips.push(`${where}: ${docSkip}`); say(`Skipped: ${docSkip}`); say(''); continue; }
  say(`Document \`${doc._id}\` · _rev \`${doc._rev}\``);
  say('');
  const sets = {}, edits = [];
  for (const e of p.edits) {
    const cur = getAt(doc, e.path);
    let after = null, reason = null;
    if (e.kind === 'array') { reason = e.check(cur); if (!reason) after = e.build(cur); }
    else if (typeof cur !== 'string') reason = 'field is gone or not a string';
    else if (e.kind === 'value') { if (cur !== e.before) reason = 'value drifted from the audited text'; else after = e.after(); }
    else {
      const n = cur.split(e.before).length - 1;
      if (n !== 1) reason = `phrase found ${n} times, expected 1`;
      else after = cur.replace(e.before, () => e.after());
    }
    if (!after) { skips.push(`${where} \`${e.path}\`: ${reason}`); say(`### \`${e.path}\` — SKIPPED: ${reason}`); say(''); continue; }
    planned++;
    sets[e.path] = after;
    edits.push({ path: e.path, before: cur, after });
    say(`### \`${e.path}\` — ${e.why}${e.kind === 'phrase' ? ' · phrase-only change' : ''}`);
    say('');
    say('Before:');
    say('');
    say(quote(e.kind === 'phrase' ? e.before : e.kind === 'array' ? renderList(cur) : cur));
    say('');
    say('After:');
    say('');
    say(quote(e.kind === 'phrase' ? e.after() : e.kind === 'array' ? renderList(after) : after));
    say('');
  }
  if (edits.length) patches.push({ id: doc._id, rev: doc._rev, url: p.url, sets, edits });
}

say(`## Guard skips: ${skips.length}${draftNote}`);
for (const s of skips) say(`- ${s}`);
say('');
say(`## ${APPLY ? 'Writing' : 'Would write'}: ${planned} field(s) in ${patches.length} document(s), ONE transaction, each pinned to the _rev read now`);
say('');

if (APPLY && patches.length) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  let kept = 0;
  for (const p of patches) {
    const file = join(BACKUP_DIR, `${p.id}.json`);
    if (existsSync(file)) kept++;
    else writeFileSync(file, JSON.stringify(docs.get(p.id), null, 2) + '\n');
    writeFileSync(join(BACKUP_DIR, `${p.id}.edits.json`), JSON.stringify({ _id: p.id, url: p.url, rev: p.rev, edits: p.edits }, null, 2) + '\n');
  }
  say(`Backed up ${patches.length - kept} document(s) to ${BACKUP_DIR}/${kept ? ` (${kept} earlier backup(s) kept)` : ''}.`);
  say('');
  if (await commit(patches)) await reread(patches, 'the new text');
}

say('Undo: `node scripts/patch-champion-pages.mjs --revert` (dry run), then `SANITY_TOKEN=… … --revert --apply`.');
say('');
writeLog(APPLY ? 'champion-pages-log.md' : 'champion-pages-dryrun.md');
