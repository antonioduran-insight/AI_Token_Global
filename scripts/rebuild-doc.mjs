// scripts/rebuild-doc.mjs
//
// Rebuilds a Sanity document with translated strings, then updates
// `_id` and `language` to mark it as a different-language version.
//
// Inputs:
//   - source .ndjson  (the English original, structure preserved)
//   - translations    (JSON array of { path, text } with translated text)
//   - target lang     (e.g. 'id')
//
// Output: new .ndjson document to stdout (single line, no formatting).
//
// Usage:
//   node scripts/rebuild-doc.mjs <source.ndjson> <translations.json> <target-lang>

import { readFileSync } from 'node:fs';

function setAtPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]];
    if (cur === undefined) {
      throw new Error(`Path ${path.join('.')} does not exist in source document`);
    }
  }
  cur[path[path.length - 1]] = value;
}

// ─── Main ────────────────────────────────────────────────────────────────
const [, , sourcePath, translationsPath, targetLang] = process.argv;

if (!sourcePath || !translationsPath || !targetLang) {
  console.error('Usage: node scripts/rebuild-doc.mjs <source.ndjson> <translations.json> <target-lang>');
  process.exit(1);
}

let sourceRaw, translationsRaw;
try {
  sourceRaw = readFileSync(sourcePath, 'utf-8').trim();
} catch (err) {
  console.error(`Cannot read source ${sourcePath}: ${err.message}`);
  process.exit(1);
}

try {
  translationsRaw = readFileSync(translationsPath, 'utf-8').trim();
} catch (err) {
  console.error(`Cannot read translations ${translationsPath}: ${err.message}`);
  process.exit(1);
}

let doc, translations;
try {
  doc = JSON.parse(sourceRaw);
} catch (err) {
  console.error(`Invalid JSON in source: ${err.message}`);
  process.exit(1);
}

try {
  translations = JSON.parse(translationsRaw);
} catch (err) {
  console.error(`Invalid JSON in translations: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(translations)) {
  console.error('Translations file must be a JSON array.');
  process.exit(1);
}

// Deep clone so we never mutate the input doc
const output = JSON.parse(JSON.stringify(doc));

// Apply each translation at its path
let applied = 0;
for (const entry of translations) {
  if (!entry || !Array.isArray(entry.path) || typeof entry.text !== 'string') {
    console.error(`Skipping malformed translation entry: ${JSON.stringify(entry)}`);
    continue;
  }
  try {
    setAtPath(output, entry.path, entry.text);
    applied++;
  } catch (err) {
    console.error(`Failed to apply translation at path [${entry.path.join(',')}]: ${err.message}`);
  }
}

// Update identity fields so this becomes a distinct Sanity document
output.language = targetLang;
if (typeof output._id === 'string') {
  output._id = output._id.replace(/-en$/, `-${targetLang}`);
}

// Emit as .ndjson — one line, no pretty-printing
process.stdout.write(JSON.stringify(output) + '\n');

// Diagnostics go to stderr so they don't pollute the .ndjson output
console.error(`Applied ${applied} translations out of ${translations.length}.`);
