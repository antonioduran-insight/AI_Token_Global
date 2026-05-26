// scripts/translate-page.mjs
//
// Translates any *-en.ndjson Sanity document into a target language using Claude.
// Walks the document recursively, collects all translatable strings, sends them
// to Claude in one batched call, and reconstructs the document.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... node scripts/translate-page.mjs <input-file> <target-lang>
//
// Examples:
//   node scripts/translate-page.mjs scripts/data/homePage-en.ndjson es
//   node scripts/translate-page.mjs scripts/data/beginnersGuidePage-en.ndjson es
//
// Output is written to scripts/data/<docType>-<lang>.ndjson
// Import: cd studio && npx sanity dataset import ../scripts/data/<file> production --replace

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, basename } from 'node:path';

// ── Config ─────────────────────────────────────────────────────────────
const CLAUDE_MODEL   = 'claude-sonnet-4.6';
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY ?? process.env.AI_TOKEN_KING_KEY;
const API_BASE_URL   = process.env.AI_TOKEN_KING_KEY
  ? 'https://api.aitokenking.com.tw/api'
  : 'https://api.anthropic.com';
const LANG_NAMES     = { es: 'Spanish (Latin American)', id: 'Indonesian', fr: 'French', de: 'German', ja: 'Japanese', zh: 'Traditional Chinese (Taiwan)' };

// ── Keys that are NEVER translated ─────────────────────────────────────
// Sanity internal fields, slugs, identifiers, URLs, colors, enums
const SKIP_KEYS = new Set([
  '_id', '_type', '_key', '_rev', '_createdAt', '_updatedAt',
  'language', 'modelSlug', 'heroAccent', 'icon', 'anchorId',
  'statNumber',   // e.g. "60+" — keep as-is
  'url', 'linkUrl', 'proposalCtaUrl', 'sidebarCtaUrl', 'ctaUrl',
  'stepNumber', 'accentColor',
]);

// ── Values that look like non-text (skip regardless of key) ────────────
function isNonText(val) {
  if (typeof val !== 'string') return true;
  if (val.trim() === '') return true;
  if (/^(\/|https?:|#)/.test(val)) return true;  // URLs and paths
  if (/^#[0-9a-fA-F]{3,6}$/.test(val)) return true; // hex colors
  if (/^\$[\d.,]+/.test(val)) return true;            // prices like "$2.50"
  if (/^\d+[\d.,+%KMB]*$/.test(val.trim())) return true; // pure numbers
  if (val.length < 2) return true;
  return false;
}

// ── Collect all translatable strings from the document ─────────────────
// Returns: { strings: string[], paths: any[][] }
// paths[i] is the key-path to restore strings[i] back into the document
function collectStrings(obj, path = []) {
  const strings = [];
  const paths   = [];

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      // Plain string element (e.g. summaryPoints: ['...', '...']) —
      // recurse won't pick it up because neither branch of the next
      // call handles primitives, so handle it here.
      if (typeof item === 'string' && !isNonText(item)) {
        strings.push(item); paths.push([...path, i]);
        return;
      }
      const { strings: s, paths: p } = collectStrings(item, [...path, i]);
      strings.push(...s); paths.push(...p);
    });
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (SKIP_KEYS.has(k)) continue;

      // Portable Text span text — translate the `text` field inside a span
      if (k === 'text' && obj._type === 'span' && typeof v === 'string' && !isNonText(v)) {
        strings.push(v); paths.push([...path, k]);
        continue;
      }

      if (typeof v === 'string' && !isNonText(v)) {
        strings.push(v); paths.push([...path, k]);
      } else if (typeof v === 'object') {
        const { strings: s, paths: p } = collectStrings(v, [...path, k]);
        strings.push(...s); paths.push(...p);
      }
    }
  }
  return { strings, paths };
}

// ── Set a value at a key-path inside a (cloned) document ───────────────
function setAtPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

// ── Call Claude API ────────────────────────────────────────────────────
async function translateBatch(strings, targetLang) {
  const langName = LANG_NAMES[targetLang] ?? targetLang;

  // Build numbered list to preserve order and prevent hallucination
  const numbered = strings.map((s, i) => `[${i + 1}] ${s}`).join('\n');

  const prompt = `You are a professional translator. Translate the following numbered strings from English to ${langName}.

Rules:
- Preserve the exact numbering format [N]
- Keep brand names unchanged: AI Token King, OpenAI, Anthropic, Google, ChatGPT, Claude, Gemini, GPT-4o, DeepSeek, Qwen, OpenClaw
- Keep technical terms unchanged: API, token, GROQ, SDK, URL, SOP, BPE
- Keep prices, numbers, and symbols unchanged: $2.50, 60+, 1M, 200K
- Translate marketing copy naturally — not word-for-word literal
- Do not add explanations or notes — return ONLY the numbered translations

Strings to translate:
${numbered}`;

  const response = await fetch(`${API_BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANTHROPIC_KEY}`,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw  = data.content[0].text;

  // Parse [N] translated text lines
  const translations = new Array(strings.length);
  const lines = raw.split('\n');
  let currentIdx = null;
  let buffer = [];

  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]\s*(.*)/);
    if (match) {
      if (currentIdx !== null) translations[currentIdx] = buffer.join('\n').trim();
      currentIdx = parseInt(match[1], 10) - 1;
      buffer = [match[2]];
    } else if (currentIdx !== null) {
      buffer.push(line);
    }
  }
  if (currentIdx !== null) translations[currentIdx] = buffer.join('\n').trim();

  // Fill any gaps with original (safety net)
  return translations.map((t, i) => t ?? strings[i]);
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  const [,, inputPath, targetLang] = process.argv;

  if (!inputPath || !targetLang) {
    console.error('Usage: node scripts/translate-page.mjs <input-ndjson> <target-lang>');
    console.error('Example: node scripts/translate-page.mjs scripts/data/homePage-en.ndjson es');
    process.exit(1);
  }

  if (!ANTHROPIC_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  if (!LANG_NAMES[targetLang]) {
    console.warn(`Warning: "${targetLang}" not in known language list. Known: ${Object.keys(LANG_NAMES).join(', ')}`);
    console.warn('Continuing anyway — make sure STUDIO_LANGUAGES includes this language code.\n');
  }

  // Read input
  const raw  = readFileSync(inputPath, 'utf-8').trim();
  const doc  = JSON.parse(raw);

  console.log(`📄 Input:  ${inputPath}`);
  console.log(`🌐 Target: ${targetLang} (${LANG_NAMES[targetLang] ?? targetLang})`);

  // Collect strings
  const { strings, paths } = collectStrings(doc);
  console.log(`📝 Strings to translate: ${strings.length}`);

  if (strings.length === 0) {
    console.log('No translatable strings found.');
    process.exit(0);
  }

  // Translate in batches of 80 strings to stay within token limits
  const BATCH_SIZE = 80;
  const translated = [];
  for (let i = 0; i < strings.length; i += BATCH_SIZE) {
    const batch  = strings.slice(i, i + BATCH_SIZE);
    const batchN = Math.floor(i / BATCH_SIZE) + 1;
    const total  = Math.ceil(strings.length / BATCH_SIZE);
    console.log(`⏳ Translating batch ${batchN}/${total} (${batch.length} strings)…`);
    const result = await translateBatch(batch, targetLang);
    translated.push(...result);
  }

  // Clone doc and apply translations
  const output = JSON.parse(JSON.stringify(doc));

  // Update identity fields
  output.language = targetLang;
  output._id      = doc._id.replace(/-en$/, `-${targetLang}`);

  // Apply translated strings
  paths.forEach((path, i) => setAtPath(output, path, translated[i]));

  // Write output
  const inputBase  = basename(inputPath, '.ndjson');   // e.g. homePage-en
  const outputBase = inputBase.replace(/-en$/, `-${targetLang}`);
  const outputPath = `scripts/data/${outputBase}.ndjson`;

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(output) + '\n');

  console.log(`\n✓ Wrote ${outputPath}`);
  console.log(`\nImport: cd studio && npx sanity dataset import ../${outputPath} production --replace`);
}

main().catch(err => { console.error(err); process.exit(1); });
