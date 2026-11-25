/**
 * patch-champion-facts.mjs
 *
 * Fixes the factual errors the champion audit (audits/2026-11-24/champion-audit.csv,
 * branch antonio/champion-audit-2026-11-24) found in six post bodies — 5 en, 1 es —
 * plus the same passages in the five vi translations (same block _keys):
 *
 *   1. en ai-token-vs-quota-explained — the "$0.10 per token … only $150" credits
 *      example, the "1000 units of processing power" and "unit of processing
 *      volume" token definitions, the unsourced bulk-discount claim, and the
 *      "Subsection: " prefix leaked into two h3 headings.
 *   2. en ai-token-input-output-explanation — the Model A / Model B example that
 *      never gives Model A's output price.
 *   3. en ai-api-tokens-explained-for-beginners — "tokens are calculated based on
 *      the complexity of your request" and its follow-up.
 *   4. en why-does-claude-keep-cutting-off-mid-conversation and its es sibling —
 *      the "Chinese character" sentence left over from the zh-TW source. Only
 *      that sentence is replaced; the rest of the block stays as is.
 *   5. en geminiapi-vs-gemina-apps-for-beginners — the bulk-discount claim and the
 *      made-up "basic, premium, enterprise" plan names.
 *
 * Every price in the new text comes from src/lib/pricing.ts at run time (imported
 * directly, Node 22.6+), so re-running after a pricing update picks up the new
 * numbers. Models are picked by role (cheapest / dearest per provider), not by
 * name, so models replaced in pricing.ts don't break the script. The arithmetic
 * is computed here too, never typed by hand.
 *
 * Only the span text of the listed blocks changes. Title, slug, seo, excerpt,
 * block style, marks and every other block are left alone.
 *
 * Same pattern as patch-portable-text.mjs:
 *   - DRY RUN BY DEFAULT. --apply needs SANITY_TOKEN from the shell.
 *   - Guards, each skip reported: exactly one published post at that language +
 *     slug, with the expected _id; no draft exists; the block is still there,
 *     holds a single unmarked span, and its text is still exactly what the plan
 *     expects (a whole-block match, or for a sentence fix the sentence appears
 *     exactly once). Anything that drifted is skipped, not guessed at.
 *   - Every touched document is backed up to audits/2026-11-24/champion-facts-backup/
 *     before the write (an earlier backup is never overwritten), with a sidecar
 *     <id>.edits.json recording each span's before/after text. All patches go in
 *     ONE transaction, each pinned to the _rev read in this run. Each document is
 *     re-read afterwards.
 *   - Logs: champion-facts-log.md for --apply, champion-facts-dryrun.md otherwise.
 *
 * --revert puts back the original span text from the sidecars, only where the
 * span still holds exactly what this script wrote. Dry run by default;
 * --revert --apply writes, one transaction pinned to _rev.
 *
 * Drafts are not readable without a token. A dry run checks them only when
 * SANITY_TOKEN or SANITY_READ_TOKEN is set, and says so; --apply always does.
 *
 * Usage:
 *   node scripts/patch-champion-facts.mjs                         # dry run
 *   SANITY_TOKEN=… node scripts/patch-champion-facts.mjs --apply
 *   node scripts/patch-champion-facts.mjs --revert                # dry run of the undo
 *   SANITY_TOKEN=… node scripts/patch-champion-facts.mjs --revert --apply
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MODELS, formatIsoDate, formatPrice } from '../src/lib/pricing.ts';

const APPLY = process.argv.includes('--apply');
const REVERT = process.argv.includes('--revert');
const TOKEN = process.env.SANITY_TOKEN;
const READ_TOKEN = TOKEN || process.env.SANITY_READ_TOKEN;
const OUT_DIR = 'audits/2026-11-24';
const BACKUP_DIR = join(OUT_DIR, 'champion-facts-backup');

// ── Number helpers: every figure in the new text goes through these ──────
/** Dollars, two decimals when that is exact, otherwise as many as it takes (max 4). */
function usd(n) {
  for (const d of [2, 3, 4]) if (Math.abs(Number(n.toFixed(d)) - n) < 1e-9) return `$${n.toFixed(d)}`;
  return `about $${n.toFixed(2)}`;
}
/** Cost of `tokens` at `perMillion` USD per 1M tokens. */
const cost = (tokens, perMillion) => (tokens * perMillion) / 1_000_000;
/** "50 million" / "about 333.3 million" (or the locale's words for it). */
function millions(n, locale = 'en-US', about = 'about ', word = ' million') {
  const r = Math.round(n * 10) / 10;
  return `${Math.abs(r - n) < 1e-9 ? '' : about}${r.toLocaleString(locale)}${word}`;
}
const pct = n => Math.round(n * 100);
function must(cond, msg) {
  if (!cond) throw new Error(`[champion-facts] ${msg} — pricing.ts changed in a way the example text no longer fits; rewrite the example.`);
}

// ── Which models the examples use: picked by role, not by name ───────────
// pricing.ts gets re-verified and models get replaced, so the examples choose
// from whatever it holds when the script runs: the cheapest and the dearest
// Anthropic model (credits example), the cheapest Anthropic vs the cheapest
// Google model (input/output example), the dearest Google model (Gemini API).
const byInput = (a, b) => a.inputPerMillion - b.inputPerMillion || a.outputPerMillion - b.outputPerMillion;
const of = provider => MODELS.filter(m => m.provider === provider).sort(byInput);
function pick() {
  const anthropic = of('Anthropic'), google = of('Google');
  must(anthropic.length >= 2, 'need at least two Anthropic models');
  must(google.length >= 1, 'need at least one Google model');
  return { cheap: anthropic[0], dear: anthropic.at(-1), a: anthropic[0], b: google[0], gemini: google.at(-1) };
}
const M = pick();

// Locale words for the generated sentences. USD keeps formatPrice's "$2.00" in every locale.
const L = {
  en: { int: n => n.toLocaleString('en-US'), mil: n => millions(n, 'en-US', 'about ', ' million'), date: 'en-US' },
  vi: { int: n => n.toLocaleString('vi-VN'), mil: n => millions(n, 'vi-VN', 'khoảng ', ' triệu'), date: 'vi-VN' },
};

// ── New text, built from pricing.ts ──────────────────────────────────────
function creditsExample(lang) {
  const { cheap, dear } = M, budget = 100, l = L[lang];
  must(dear.inputPerMillion > cheap.inputPerMillion, `${dear.displayName} input must cost more than ${cheap.displayName}`);
  must(cheap.outputPerMillion > cheap.inputPerMillion && dear.outputPerMillion > dear.inputPerMillion, 'output must cost more than input');
  const nCheap = l.mil(budget / cheap.inputPerMillion), nDear = l.mil(budget / dear.inputPerMillion);
  if (lang === 'vi') {
    return `Ví dụ, nếu bạn có $${budget} credits trong tài khoản và dùng ${cheap.displayName}, với giá ${formatPrice(cheap.inputPerMillion)} cho mỗi 1 triệu token đầu vào, `
      + `số credits đó đủ cho ${nCheap} token đầu vào. Nếu chuyển sang ${dear.displayName} với giá ${formatPrice(dear.inputPerMillion)} cho mỗi 1 triệu token đầu vào, `
      + `cùng $${budget} chỉ đủ cho ${nDear} token. Token đầu ra đắt hơn (lần lượt ${formatPrice(cheap.outputPerMillion)} và ${formatPrice(dear.outputPerMillion)} `
      + 'cho mỗi 1 triệu token), nên một khối lượng công việc thực tế có cả đầu vào lẫn đầu ra sẽ nhận được ít token hơn với cùng số credits.';
  }
  return `For instance, if you have $${budget} worth of credits in your account and use ${cheap.displayName}, which charges `
    + `${formatPrice(cheap.inputPerMillion)} per 1 million input tokens, those credits cover ${nCheap} input tokens. `
    + `Switch to ${dear.displayName} at ${formatPrice(dear.inputPerMillion)} per 1 million input tokens and the same $${budget} covers only `
    + `${nDear}. Output tokens cost more (${formatPrice(cheap.outputPerMillion)} and `
    + `${formatPrice(dear.outputPerMillion)} per 1 million respectively), so a real workload that mixes input and output gets fewer tokens for the same credits.`;
}

function inputOutputExample(lang) {
  const { a, b } = M, l = L[lang];
  const inTok = 100_000, outTok = 1_000_000;
  const aIn = cost(inTok, a.inputPerMillion), aOut = cost(outTok, a.outputPerMillion), aTot = aIn + aOut;
  const bIn = cost(inTok, b.inputPerMillion), bOut = cost(outTok, b.outputPerMillion), bTot = bIn + bOut;
  const aShare = pct(aOut / aTot), bShare = pct(bOut / bTot);
  must(aShare > 50 && bShare > 50, 'output must be most of the bill for this workload');
  must(aTot !== bTot, 'the two models must cost different amounts');
  const aWins = aTot < bTot, gap = usd(Math.round(Math.abs(bTot - aTot) * 10000) / 10000);
  if (lang === 'vi') {
    const share = aShare === bShare ? `khoảng ${aShare}% của cả hai hóa đơn` : `khoảng ${aShare}% hóa đơn của Mô hình A và ${bShare}% hóa đơn của Mô hình B`;
    return `Ví dụ, Mô hình A (${a.displayName}) tính ${formatPrice(a.inputPerMillion)} cho mỗi 1 triệu token đầu vào và `
      + `${formatPrice(a.outputPerMillion)} cho mỗi 1 triệu token đầu ra, trong khi Mô hình B (${b.displayName}) tính `
      + `${formatPrice(b.inputPerMillion)} và ${formatPrice(b.outputPerMillion)}. Một tác vụ gửi ${l.int(inTok)} token đầu vào và nhận về `
      + `${l.int(outTok)} token đầu ra tốn ${usd(aIn)} + ${usd(aOut)} = ${usd(aTot)} trên Mô hình A và ${usd(bIn)} + ${usd(bOut)} = `
      + `${usd(bTot)} trên Mô hình B. Đầu ra chiếm ${share}, vì vậy nếu ứng dụng của bạn tạo ra nhiều token đầu ra, hãy so sánh giá đầu ra trước: `
      + `trong ví dụ này, ${aWins ? 'Mô hình A' : 'Mô hình B'} rẻ hơn ${gap}.`;
  }
  const share = aShare === bShare ? `about ${aShare}% of both bills` : `about ${aShare}% of Model A's bill and ${bShare}% of Model B's`;
  return `For instance, Model A (${a.displayName}) charges ${formatPrice(a.inputPerMillion)} per 1 million input tokens and `
    + `${formatPrice(a.outputPerMillion)} per 1 million output tokens, while Model B (${b.displayName}) charges `
    + `${formatPrice(b.inputPerMillion)} and ${formatPrice(b.outputPerMillion)}. A job that sends ${l.int(inTok)} input tokens and gets `
    + `${l.int(outTok)} output tokens back costs ${usd(aIn)} + ${usd(aOut)} = ${usd(aTot)} on Model A and ${usd(bIn)} + ${usd(bOut)} = `
    + `${usd(bTot)} on Model B. Output is ${share}, so if your application generates a lot of output tokens, compare output prices first: `
    + `here that makes ${aWins ? 'Model A' : 'Model B'} the cheaper option by ${gap}.`;
}

function geminiApiPricing(lang) {
  const m = M.gemini, date = formatIsoDate(m.lastChecked, L[lang].date);
  if (lang === 'vi') {
    return 'Sự khác biệt chính giữa Gemini API và Gemini Apps nằm ở mô hình định giá. Gemini API tính phí theo token, với giá riêng cho token '
      + `đầu vào và đầu ra: ví dụ, ${m.displayName} có giá ${formatPrice(m.inputPerMillion)} cho mỗi 1 triệu token đầu vào và `
      + `${formatPrice(m.outputPerMillion)} cho mỗi 1 triệu token đầu ra (giá thông thường của Google, kiểm tra ngày ${date}).`;
  }
  return 'The primary difference between Gemini API and Gemini Apps lies in their pricing models. Gemini API is billed per token, '
    + `with input and output tokens priced separately: ${m.displayName}, for example, costs ${formatPrice(m.inputPerMillion)} per 1 million `
    + `input tokens and ${formatPrice(m.outputPerMillion)} per 1 million output tokens (Google's regular price, checked ${date}).`;
}

// ── The plan ─────────────────────────────────────────────────────────────
// kind 'block': the whole span text must equal `before`.
// kind 'sentence': `before` must appear exactly once in the span text; only it is replaced.
const PLAN = [
  {
    _id: 'VdSyE50eHa1ZkhVq3OmrQL', lang: 'en', slug: 'ai-token-vs-quota-explained',
    edits: [
      {
        key: 'zqbxp1gj', kind: 'block', why: 'token defined as a unit of processing power',
        before: 'For instance, if a particular AI model requires 1000 units of processing power to complete a single task, and each unit is equivalent to one token, then you would need 1000 tokens to run that specific model. However, not all models consume the same amount of resources; some might require more or fewer tokens for the same task.',
        after: () => 'In practice, a token is a chunk of text: roughly ¾ of an English word, or about 4 characters, so 1,000 tokens is about 750 words. Your usage is the number of tokens you send in (input) plus the number the model writes back (output). Models use different tokenizers and charge different prices per token, so the same task can use a different number of tokens, and cost a different amount, on each model.',
      },
      {
        key: 'jhxescf5', kind: 'block', why: '"Subsection: " prefix in heading',
        before: 'Subsection: Token vs Quota Limits',
        after: () => 'Token vs Quota Limits',
      },
      {
        key: 'anax9hxh', kind: 'block', why: '$0.10/token example, backwards "only $150" logic',
        before: 'For instance, if you have $100 worth of credits in your account, and each token costs $0.10, then you can buy 1000 tokens with those credits. However, if the price per token increases to $0.15, your initial 1000 tokens would cost only $150.',
        after: creditsExample,
      },
      {
        key: 'ib3eeq87', kind: 'block', why: '"Subsection: " prefix in heading',
        before: 'Subsection: Pay-Per-Use vs Tiered Pricing',
        after: () => 'Pay-Per-Use vs Tiered Pricing',
      },
      {
        key: 'd63528ga', kind: 'block', why: 'token defined as "a unit of processing volume"',
        before: "At its core, an AI token represents a unit of processing volume used by AI models. It's akin to a currency that enables you to access and utilize the computing power of these sophisticated algorithms. The value of an AI token varies depending on several factors, including the complexity of the task, the type of model, and even the provider's pricing strategy. Understanding how tokens are calculated can help you anticipate your costs better.",
        after: () => 'At its core, an AI token is a chunk of text that an AI model reads or writes: often a whole word, sometimes part of a word, a punctuation mark or a space. Providers count the tokens you send in and the tokens the model writes back, and charge a price per million tokens that depends on the model. Understanding how tokens are counted can help you anticipate your costs better.',
      },
      {
        key: 'j5zo08ha', kind: 'block', why: 'unsourced "discounts for bulk purchases" claim',
        before: 'Each AI platform has its own pricing strategy for tokens, which can range from pay-per-use to tiered pricing. Some providers offer discounts for bulk purchases or long-term commitments, while others might charge extra for premium services or support.',
        after: () => 'Each AI platform has its own pricing strategy for tokens, which can range from pay-per-use to tiered pricing. Prices usually differ from model to model, and input and output tokens are often priced separately.',
      },
    ],
  },
  {
    _id: 'uomub2hTG94T3nqbFXOMbR', lang: 'en', slug: 'ai-token-input-output-explanation',
    edits: [
      {
        key: 'jqhoplw5', kind: 'block', why: 'Model A output price missing; conclusion unsupported; prices ~1,000x real',
        before: 'For instance, Model A charges $0.01 per input token, while Model B charges $0.005 per input token but $0.05 per output token. If your application requires a high number of output tokens, Model A might be more cost-effective.',
        after: inputOutputExample,
      },
    ],
  },
  {
    _id: 'uomub2hTG94T3nqbFWRf9c', lang: 'en', slug: 'ai-api-tokens-explained-for-beginners',
    edits: [
      {
        key: 'by95mph8', kind: 'block', why: 'tokens "calculated based on the complexity of your request"',
        before: "AI API tokens are calculated based on the complexity of your request. This can include factors such as text length, query parameters, and even the AI model's processing power required.",
        after: () => "AI API tokens are counted from the text itself: the input you send (your prompt, instructions and any conversation history) plus the output the model generates. The model's tokenizer splits that text into tokens, each roughly ¾ of an English word, and both the input and the output tokens count toward your usage.",
      },
      {
        key: 'oy34stad', kind: 'block', why: 'follow-up repeats the "complexity / processing requirements" claim',
        before: "For instance, if you're using a conversational AI model to generate responses for a customer service chatbot, the number of tokens used will depend on the complexity of the conversations and the model's processing requirements.",
        after: () => "For instance, if you're using a conversational AI model to generate responses for a customer service chatbot, the number of tokens used will depend on how much text goes in (the customer's messages plus the conversation history sent with each request) and how long the model's replies are.",
      },
    ],
  },
  {
    _id: 'aitk-en-150', lang: 'en', slug: 'why-does-claude-keep-cutting-off-mid-conversation',
    edits: [
      {
        key: 'b2', kind: 'sentence', why: '"Chinese character" sentence left from the zh-TW source',
        before: 'A single Chinese character or English word is often split into one or more tokens.',
        after: () => 'A common English word is usually one token, while longer or rarer words get split into several.',
      },
    ],
  },
  {
    _id: 'aitk-es-150', lang: 'es', slug: 'por-que-claude-sigue-interrumpiendo-la-conversacion-a-mitad-de-camino',
    edits: [
      {
        key: 'b2', kind: 'sentence', why: '"carácter chino" sentence left from the zh-TW source',
        before: 'Un solo carácter chino o una palabra en inglés suele dividirse en uno o más tokens.',
        after: () => 'En español, una palabra corta y común suele ser un solo token, mientras que las palabras más largas o poco frecuentes se dividen en varios.',
      },
    ],
  },
  {
    _id: 'g3jTIj9ubDWnGQfo9PTTiG', lang: 'en', slug: 'geminiapi-vs-gemina-apps-for-beginners',
    edits: [
      {
        key: 'mwx1g3er', kind: 'block', why: '"tiered pricing … discounts for bulk token purchases"',
        before: 'The primary difference between Gemini API and Gemini Apps lies in their pricing models. Gemini API offers a tiered pricing structure based on token usage, with discounts available for bulk token purchases.',
        after: geminiApiPricing,
      },
      {
        key: '14ryqo61', kind: 'block', why: 'made-up "basic, premium, and enterprise" plan tiers',
        // Plan names checked 2026-11-24 on https://gemini.google/subscriptions/ (free tier + Google AI Plus / Pro / Ultra, monthly).
        source: 'https://gemini.google/subscriptions/ (checked 2026-11-24)',
        before: 'In contrast, Gemini Apps operates on a subscription-based model, with plans tailored to specific use cases and user requirements. Users can choose from various tiers, including basic, premium, and enterprise options, depending on their AI needs and budget.',
        after: () => 'In contrast, the Gemini app is not billed per token. It has a free version and paid monthly Google AI plans (Google AI Plus, Google AI Pro and Google AI Ultra).',
      },
    ],
  },

  // ── vi: the same wrong passages in the Vietnamese translations (same block _keys) ──
  {
    _id: 'VdSyE50eHa1ZkhVq3OmrQL-vi', lang: 'vi', slug: 'ai-token-vs-quota-explained',
    edits: [
      {
        key: 'zqbxp1gj', kind: 'block', why: 'token defined as a unit of processing power',
        before: 'Ví dụ, nếu một mô hình AI cụ thể cần 1000 đơn vị sức mạnh xử lý để hoàn thành một tác vụ, và mỗi đơn vị tương đương một token, thì bạn sẽ cần 1000 token để chạy mô hình đó. Tuy nhiên, không phải tất cả các mô hình đều tiêu thụ cùng một lượng tài nguyên — một số có thể cần nhiều hoặc ít token hơn cho cùng một tác vụ.',
        after: () => 'Trên thực tế, token là một mẩu văn bản: khoảng ¾ một từ tiếng Anh, tức chừng 4 ký tự, nên 1.000 token tương đương khoảng 750 từ tiếng Anh. Mức sử dụng của bạn là số token bạn gửi vào (đầu vào) cộng với số token mô hình trả về (đầu ra). Mỗi mô hình có bộ tách token (tokenizer) và mức giá riêng, nên cùng một tác vụ có thể dùng số token khác nhau và tốn chi phí khác nhau trên từng mô hình.',
      },
      {
        key: 'jhxescf5', kind: 'block', why: '"Tiểu mục: " prefix in heading',
        before: 'Tiểu mục: So sánh giới hạn Token và Quota',
        after: () => 'So sánh giới hạn Token và Quota',
      },
      {
        key: 'anax9hxh', kind: 'block', why: '$0.10/token example',
        before: 'Ví dụ, nếu bạn có $100 credits trong tài khoản và mỗi token có giá $0.10, thì bạn có thể mua 1000 token với số credits đó. Tuy nhiên, nếu giá mỗi token tăng lên $0.15, thì 1000 token ban đầu sẽ có giá $150.',
        after: creditsExample,
      },
      {
        key: 'ib3eeq87', kind: 'block', why: '"Tiểu mục: " prefix in heading',
        before: 'Tiểu mục: Pay-Per-Use và Định giá theo tầng',
        after: () => 'Pay-Per-Use và Định giá theo tầng',
      },
      {
        key: 'd63528ga', kind: 'block', why: 'token defined as "a unit of processing volume"',
        before: 'Về cơ bản, một token AI đại diện cho một đơn vị khối lượng xử lý mà các mô hình AI sử dụng. Bạn có thể coi nó như một loại tiền tệ cho phép bạn truy cập và tận dụng sức mạnh tính toán của các thuật toán tinh vi này. Giá trị của một token AI thay đổi tùy thuộc vào nhiều yếu tố, bao gồm độ phức tạp của tác vụ, loại mô hình, và thậm chí cả chiến lược định giá của nhà cung cấp. Hiểu cách token được tính toán sẽ giúp bạn dự đoán chi phí tốt hơn.',
        after: () => 'Về cơ bản, một token AI là một mẩu văn bản mà mô hình AI đọc hoặc viết ra: thường là cả một từ, đôi khi là một phần của từ, một dấu câu hoặc một khoảng trắng. Nhà cung cấp đếm số token bạn gửi vào và số token mô hình trả về, rồi tính phí theo mức giá cho mỗi 1 triệu token, tùy theo từng mô hình. Hiểu cách token được đếm sẽ giúp bạn dự đoán chi phí tốt hơn.',
      },
      {
        key: 'j5zo08ha', kind: 'block', why: 'unsourced "discounts for bulk purchases" claim',
        before: 'Mỗi nền tảng AI có chiến lược định giá token riêng, có thể dao động từ trả theo lượng sử dụng (pay-per-use) đến định giá theo tầng (tiered pricing). Một số nhà cung cấp cung cấp chiết khấu cho việc mua số lượng lớn hoặc cam kết dài hạn, trong khi những nhà cung cấp khác có thể tính thêm phí cho các dịch vụ hoặc hỗ trợ cao cấp.',
        after: () => 'Mỗi nền tảng AI có chiến lược định giá token riêng, có thể dao động từ trả theo lượng sử dụng (pay-per-use) đến định giá theo tầng (tiered pricing). Giá thường khác nhau giữa các mô hình, và token đầu vào và đầu ra thường được tính giá riêng.',
      },
    ],
  },
  {
    _id: 'uomub2hTG94T3nqbFXOMbR-vi', lang: 'vi', slug: 'ai-token-input-output-explanation',
    edits: [
      {
        key: 'jqhoplw5', kind: 'block', why: 'Model A output price missing; conclusion unsupported; prices ~1,000x real',
        before: 'Ví dụ, Mô hình A tính $0.01 cho mỗi token đầu vào, trong khi Mô hình B tính $0.005 cho mỗi token đầu vào nhưng $0.05 cho mỗi token đầu ra. Nếu ứng dụng của bạn cần nhiều token đầu ra, Mô hình A có thể tiết kiệm chi phí hơn.',
        after: inputOutputExample,
      },
    ],
  },
  {
    _id: 'uomub2hTG94T3nqbFWRf9c-vi', lang: 'vi', slug: 'ai-api-tokens-explained-for-beginners',
    edits: [
      {
        key: 'by95mph8', kind: 'block', why: 'tokens "calculated based on the complexity of your request"',
        before: 'Token AI qua API được tính toán dựa trên độ phức tạp của yêu cầu. Các yếu tố ảnh hưởng có thể bao gồm độ dài văn bản, tham số truy vấn, và thậm chí cả sức mạnh xử lý mà mô hình AI cần dùng.',
        after: () => 'Token AI qua API được đếm từ chính văn bản: phần đầu vào bạn gửi (prompt, hướng dẫn và lịch sử hội thoại) cộng với phần đầu ra mà mô hình tạo ra. Bộ tách token (tokenizer) của mô hình chia văn bản đó thành các token, mỗi token khoảng ¾ một từ tiếng Anh, và cả token đầu vào lẫn đầu ra đều được tính vào mức sử dụng của bạn.',
      },
      {
        key: 'oy34stad', kind: 'block', why: 'follow-up repeats the "complexity / processing requirements" claim',
        before: 'Ví dụ, nếu bạn đang dùng mô hình AI hội thoại để tạo phản hồi cho chatbot chăm sóc khách hàng, số lượng token sử dụng sẽ phụ thuộc vào độ phức tạp của các cuộc trò chuyện và yêu cầu xử lý của mô hình.',
        after: () => 'Ví dụ, nếu bạn đang dùng mô hình AI hội thoại để tạo phản hồi cho chatbot chăm sóc khách hàng, số lượng token sử dụng sẽ phụ thuộc vào lượng văn bản gửi vào (tin nhắn của khách hàng cộng với lịch sử hội thoại gửi kèm mỗi yêu cầu) và độ dài câu trả lời của mô hình.',
      },
    ],
  },
  {
    _id: 'aitk-vi-150', lang: 'vi', slug: 'tai-sao-claude-bi-ngat-giua-chung',
    edits: [
      {
        key: 'b2', kind: 'sentence', why: '"ký tự Hán" sentence left from the zh-TW source',
        before: 'Một ký tự Hán hoặc một từ tiếng Anh thường được tách thành một hoặc nhiều token.',
        after: () => 'Một từ ngắn, thông dụng thường chỉ là một token, còn những từ dài hơn hoặc ít gặp sẽ bị tách thành nhiều token.',
      },
    ],
  },
  {
    _id: 'g3jTIj9ubDWnGQfo9PTTiG-vi', lang: 'vi', slug: 'geminiapi-vs-gemina-apps-for-beginners',
    edits: [
      {
        key: 'mwx1g3er', kind: 'block', why: '"tiered pricing … discounts for bulk token purchases"',
        before: 'Sự khác biệt chính giữa Gemini API và Gemini Apps nằm ở mô hình định giá. Gemini API cung cấp cấu trúc giá theo bậc dựa trên mức sử dụng token, với chiết khấu cho việc mua token số lượng lớn.',
        after: geminiApiPricing,
      },
      {
        key: '14ryqo61', kind: 'block', why: 'made-up "basic, premium, enterprise" plan tiers',
        source: 'https://gemini.google/subscriptions/ (checked 2026-11-24)',
        before: 'Ngược lại, Gemini Apps hoạt động theo mô hình đăng ký, với các gói được điều chỉnh theo từng trường hợp sử dụng cụ thể và nhu cầu người dùng. Bạn có thể chọn từ nhiều bậc khác nhau, bao gồm tùy chọn cơ bản, premium và doanh nghiệp, tùy thuộc vào nhu cầu AI và ngân sách của bạn.',
        after: () => 'Ngược lại, ứng dụng Gemini không tính phí theo token. Ứng dụng có phiên bản miễn phí và các gói Google AI trả phí hằng tháng (Google AI Plus, Google AI Pro và Google AI Ultra).',
      },
    ],
  },
];
const urlOf = d => `/${d.lang}/blog/${d.slug}/`;

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
  for (const p of patches) tx.patch(p.id, p.build);
  try { await tx.commit({ visibility: 'sync' }); return true; } catch (err) { say(`FAILED, nothing written: ${err.message}`); problems++; return false; }
}
/** The block's single, unmarked span — or the reason it can't be patched safely. */
function soleSpan(block) {
  if (!block) return { skip: 'block is gone' };
  if (block._type !== 'block') return { skip: `now a ${block._type}, not a text block` };
  const kids = block.children ?? [];
  if (kids.length !== 1) return { skip: `has ${kids.length} spans, expected 1` };
  const span = kids[0];
  if (span._type !== 'span' || typeof span.text !== 'string') return { skip: 'child is not a plain text span' };
  if ((span.marks ?? []).length) return { skip: `span carries marks (${span.marks.join(', ')})` };
  return { span };
}
const spanPath = (key, spanKey) => `body[_key=="${key}"].children[_key=="${spanKey}"].text`;
const quote = t => t.split('\n').map(l => `> ${l}`).join('\n');

// ── --revert: put back the original span text from the sidecars ──────────
if (REVERT) {
  say(`# Champion post facts REVERT ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
  say('');
  const sidecars = existsSync(BACKUP_DIR)
    ? readdirSync(BACKUP_DIR).filter(f => f.endsWith('.edits.json')).map(f => JSON.parse(readFileSync(join(BACKUP_DIR, f), 'utf8')))
    : [];
  say(`Edit records in ${BACKUP_DIR}/: ${sidecars.length}${sidecars.length ? '' : ' — nothing has been applied, nothing to revert.'}`);
  say('');
  const ids = sidecars.map(s => s._id);
  const current = new Map((await client.fetch('*[_id in $ids]{_id, _rev, body}', { ids })).map(d => [d._id, d]));
  const drafts = await existingDrafts(ids);
  const patches = [], skips = [];
  for (const s of sidecars) {
    const doc = current.get(s._id);
    const where = `\`${s._id}\` ${s.url}`;
    if (!doc) { skips.push(`${where}: no longer published`); continue; }
    if (drafts.has(`drafts.${s._id}`)) { skips.push(`${where}: a draft exists; revert it in Studio instead`); continue; }
    const sets = {};
    for (const e of s.edits) {
      const span = doc.body?.find(b => b._key === e.key)?.children?.find(c => c._key === e.spanKey);
      if (span?.text !== e.after) { skips.push(`${where} \`${e.key}\`: text changed since the apply; revert by hand from the backup`); continue; }
      sets[spanPath(e.key, e.spanKey)] = e.before;
      say(`- ${where} \`${e.key}\`: back to the original text`);
    }
    if (Object.keys(sets).length) patches.push({ id: s._id, sets, build: q => q.set(sets).ifRevisionId(doc._rev) });
  }
  say('');
  say(`## Guard skips: ${skips.length}${draftNote}`);
  for (const s of skips) say(`- ${s}`);
  say('');
  say(`## ${APPLY ? 'Reverting' : 'Would revert'}: ${patches.length} document(s) in ONE transaction`);
  say('');
  if (APPLY && patches.length && await commit(patches)) {
    say('### Re-read');
    for (const p of patches) {
      const body = (await client.fetch('*[_id == $id][0].body', { id: p.id })) ?? [];
      const ok = Object.entries(p.sets).every(([path, text]) => {
        const [, key, spanKey] = path.match(/_key=="([^"]+)"\]\.children\[_key=="([^"]+)"/);
        return body.find(b => b._key === key)?.children?.find(c => c._key === spanKey)?.text === text;
      });
      say(`- \`${p.id}\`: ${ok ? 'original text restored' : 'FAILED'}`);
      if (!ok) problems++;
    }
    say('');
  }
  writeLog(APPLY ? 'champion-facts-revert-log.md' : 'champion-facts-revert-dryrun.md');
}

// ── Apply / dry run ──────────────────────────────────────────────────────
say(`# Champion post facts ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');
say('Source: `audits/2026-11-24/champion-audit.csv` (branch antonio/champion-audit-2026-11-24), column claims_stale_or_wrong / typos_title_slug_headings.');
say('Prices: `src/lib/pricing.ts`, read at run time — '
  + [...new Set(Object.values(M))]
    .map(m => `${m.displayName} ${formatPrice(m.inputPerMillion)}/${formatPrice(m.outputPerMillion)} (checked ${m.lastChecked})`).join(' · ')
  + ' — USD per 1M input/output tokens.');
say('Only the span text of the blocks below changes. Title, slug, seo, excerpt, style and every other block are untouched.');
say('');

// Fetched by slug; each plan entry then matches on language + slug below (other locales are never touched).
const docs = await client.fetch(
  '*[_type == "post" && !(_id in path("drafts.**")) && slug.current in $slugs]{_id, _rev, language, "slug": slug.current, body}',
  { slugs: PLAN.map(p => p.slug) },
);
const drafts = await existingDrafts(PLAN.map(p => p._id));

const patches = [], skips = [];
let planned = 0;
for (const p of PLAN) {
  const where = `\`${p._id}\` ${urlOf(p)}`;
  say(`## ${p.lang} · ${p.slug}`);
  say('');
  const matches = docs.filter(d => d.language === p.lang && d.slug === p.slug);
  const doc = matches[0];
  const docSkip = matches.length !== 1 ? `${matches.length} published posts at language=${p.lang} + slug, expected 1`
    : doc._id !== p._id ? `that language + slug is now _id ${doc._id}, expected ${p._id}`
    : drafts.has(`drafts.${p._id}`) ? 'a draft exists; Studio would show it, and publishing it later would undo this'
    : null;
  if (docSkip) { skips.push(`${where}: ${docSkip}`); say(`Skipped: ${docSkip}`); say(''); continue; }
  say(`Document \`${doc._id}\` · _rev \`${doc._rev}\``);
  say('');

  const sets = {}, edits = [];
  for (const e of p.edits) {
    const block = doc.body?.find(b => b._key === e.key);
    const { span, skip } = soleSpan(block);
    let after = null, reason = skip;
    if (span) {
      if (e.kind === 'block') {
        if (span.text !== e.before) reason = 'text drifted from the audited wording';
        else after = e.after(p.lang);
      } else {
        const n = span.text.split(e.before).length - 1;
        if (n !== 1) reason = `target sentence found ${n} times, expected 1`;
        else after = span.text.replace(e.before, () => e.after(p.lang));
      }
    }
    if (!after) {
      skips.push(`${where} \`${e.key}\`: ${reason}`);
      say(`### \`${e.key}\` — SKIPPED: ${reason}`);
      say('');
      continue;
    }
    planned++;
    sets[spanPath(e.key, span._key)] = after;
    edits.push({ key: e.key, spanKey: span._key, before: span.text, after });
    say(`### \`${e.key}\` (${block.style ?? 'normal'}, span \`${span._key}\`) — ${e.why}${e.kind === 'sentence' ? ' · sentence-only change' : ''}`);
    if (e.source) say(`Source: ${e.source}`);
    say('');
    say('Before:');
    say('');
    say(quote(e.kind === 'sentence' ? e.before : span.text));
    say('');
    say('After:');
    say('');
    say(quote(e.kind === 'sentence' ? e.after(p.lang) : after));
    say('');
  }
  if (edits.length) patches.push({ id: doc._id, url: urlOf(p), doc, sets, edits, build: q => q.set(sets).ifRevisionId(doc._rev) });
}

say(`## Guard skips: ${skips.length}${draftNote}`);
for (const s of skips) say(`- ${s}`);
say('');
say(`## ${APPLY ? 'Writing' : 'Would write'}: ${planned} span(s) in ${patches.length} document(s), ONE transaction, each pinned to the _rev read now`);
say('');

if (APPLY && patches.length) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  let kept = 0;
  for (const p of patches) {
    const file = join(BACKUP_DIR, `${p.id}.json`);
    // An earlier backup is the original state; never overwrite it.
    if (existsSync(file)) kept++;
    else writeFileSync(file, JSON.stringify(await client.fetch('*[_id == $id][0]', { id: p.id }), null, 2) + '\n');
    writeFileSync(join(BACKUP_DIR, `${p.id}.edits.json`), JSON.stringify({ _id: p.id, url: p.url, rev: p.doc._rev, edits: p.edits }, null, 2) + '\n');
  }
  say(`Backed up ${patches.length - kept} document(s) to ${BACKUP_DIR}/${kept ? ` (${kept} earlier backup(s) kept)` : ''}.`);
  if (await commit(patches)) {
    say('');
    say('### Re-read');
    for (const p of patches) {
      const after = await client.fetch('{"body": *[_id == $id][0].body, "draft": defined(*[_id == $d][0])}', { id: p.id, d: `drafts.${p.id}` });
      const ok = !after.draft && p.edits.every(e => after.body?.find(b => b._key === e.key)?.children?.find(c => c._key === e.spanKey)?.text === e.after);
      say(`- \`${p.id}\`: ${ok ? `${p.edits.length} span(s) hold the new text` : 'FAILED'}${after.draft ? ' (a draft appeared)' : ''}`);
      if (!ok) problems++;
    }
  }
  say('');
}

say('Undo: `node scripts/patch-champion-facts.mjs --revert` (dry run), then `SANITY_TOKEN=… … --revert --apply`.');
say('');

writeLog(APPLY ? 'champion-facts-log.md' : 'champion-facts-dryrun.md');
