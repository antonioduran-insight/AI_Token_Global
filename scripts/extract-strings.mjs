// scripts/extract-strings.mjs
//
// Extracts translatable strings from a Sanity .ndjson document.
// Walks the document recursively, skipping internal fields, URLs, prices,
// hex colors, and other non-translatable values.
//
// Output: JSON array of { path, text } objects to stdout.
// Each `path` is the list of keys/indexes needed to reach `text` inside the doc.
//
// Usage:
//   node scripts/extract-strings.mjs <input.ndjson>
//
// Example:
//   node scripts/extract-strings.mjs translation/results/tokenCalculatorPage-en.ndjson \
//     > translation/results/tokenCalculatorPage-strings-en.json

import { readFileSync } from 'node:fs';

// Field names whose values should NEVER be translated.
const SKIP_KEYS = new Set([
  // Sanity internals
  '_id', '_type', '_key', '_rev', '_createdAt', '_updatedAt',
  // language indicator — handled by rebuild-doc.mjs, not translation
  'language',
  // identifiers / enums / colors / numbers stored as strings
  'modelSlug', 'heroAccent', 'icon', 'anchorId', 'accentColor',
  'statNumber', 'stepNumber',
  // URLs
  'url', 'linkUrl', 'proposalCtaUrl', 'sidebarCtaUrl', 'ctaUrl',
  // Portable Text structural fields
  'style',     // 'normal', 'h2', 'blockquote' etc.
  'markDefs',  // link definitions (we don't translate hrefs)
  'marks',     // ['strong'], ['em'] — formatting flags, not content
]);

function isNonText(val) {
  if (typeof val !== 'string') return true;
  if (val.trim() === '') return true;
  if (/^(\/|https?:|#)/.test(val)) return true;            // URLs and paths
  if (/^#[0-9a-fA-F]{3,6}$/.test(val)) return true;        // hex colors
  if (/^\$[\d.,]+/.test(val)) return true;                 // prices like $2.50
  if (/^\d+[\d.,+%KMB]*$/.test(val.trim())) return true;   // pure numbers like 60+, 1M
  if (val.length < 2) return true;                         // single chars
  return false;
}

function collectStrings(obj, path = [], out = []) {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectStrings(item, [...path, i], out));
    return out;
  }
  if (obj === null || typeof obj !== 'object') return out;

  for (const [k, v] of Object.entries(obj)) {
    if (SKIP_KEYS.has(k)) continue;

    // Portable Text span: { _type: 'span', text: '...', marks: [...] }
    // Translate ONLY the .text field of spans.
    if (k === 'text' && obj._type === 'span' && typeof v === 'string' && !isNonText(v)) {
      out.push({ path: [...path, k], text: v });
      continue;
    }

    if (typeof v === 'string') {
      if (!isNonText(v)) {
        out.push({ path: [...path, k], text: v });
      }
    } else if (typeof v === 'object') {
      collectStrings(v, [...path, k], out);
    }
  }
  return out;
}

// ─── Main ────────────────────────────────────────────────────────────────
const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error('Usage: node scripts/extract-strings.mjs <input.ndjson>');
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(inputPath, 'utf-8').trim();
} catch (err) {
  console.error(`Cannot read ${inputPath}: ${err.message}`);
  process.exit(1);
}

if (!raw) {
  console.error(`File ${inputPath} is empty.`);
  process.exit(1);
}

let doc;
try {
  doc = JSON.parse(raw);
} catch (err) {
  console.error(`Invalid JSON in ${inputPath}: ${err.message}`);
  process.exit(1);
}

const strings = collectStrings(doc);

process.stdout.write(JSON.stringify(strings, null, 2));
