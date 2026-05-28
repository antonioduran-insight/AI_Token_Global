/**
 * populate-token-breakdown.mjs
 *
 * Patches the homePage Sanity documents in en/es/id with the new
 * tokenBreakdown demo (added in commit cf27e19). Run once after the
 * schema change so the homepage demo card shows up for each locale.
 *
 * Each locale gets a natural-language example sentence broken into
 * token chunks. The page renders them as alternating purple/blue chips.
 *
 * Usage:
 *   SANITY_TOKEN=sk-... node scripts/populate-token-breakdown.mjs
 *
 * Get a write token from:
 *   https://sanity.io/manage → your project → API → Tokens → Add API token
 *   (give it Editor or Write permission)
 *
 * Safe to re-run: each call overwrites only the `tokenBreakdown` field,
 * leaving every other field on the homePage doc untouched.
 */

import { createClient } from '@sanity/client';

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'mq3wxr8n';
const DATASET    = process.env.PUBLIC_SANITY_DATASET    || process.env.SANITY_DATASET    || 'production';
const TOKEN      = process.env.SANITY_TOKEN;

if (!TOKEN) {
  console.error('✗ Missing SANITY_TOKEN.');
  console.error('  Get one from https://sanity.io/manage → your project → API → Tokens.');
  console.error('  Then run: SANITY_TOKEN=sk-... node scripts/populate-token-breakdown.mjs');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
});

// Per-locale demo. The English sentence matches the original hardcoded one.
// Spanish + Indonesian use a natural greeting that tokenizes into ~12 chunks.
const UPDATES = [
  {
    lang: 'en',
    sentence: "Hello, how are you? I'm learning about AI tokens",
    tokens: ['Hello', ',', 'how', 'are', 'you', '?', 'I', "'m", 'learning', 'about', 'AI', 'tokens'],
    charCount: '~48',
  },
  {
    lang: 'es',
    sentence: '¿Hola, cómo estás? Estoy aprendiendo sobre tokens de IA',
    tokens: ['Hola', ',', '¿', 'cómo', 'estás', '?', 'Estoy', 'aprendiendo', 'sobre', 'tokens', 'de', 'IA'],
    charCount: '~52',
  },
  {
    lang: 'id',
    sentence: 'Halo, bagaimana kabar kamu? Saya sedang belajar tentang token AI',
    tokens: ['Halo', ',', 'bagaimana', 'kabar', 'kamu', '?', 'Saya', 'sedang', 'belajar', 'tentang', 'token', 'AI'],
    charCount: '~56',
  },
];

let okCount = 0;
let skipCount = 0;

for (const { lang, sentence, tokens, charCount } of UPDATES) {
  const doc = await client.fetch(
    `*[_type == "homePage" && language == $lang][0]{ _id, language }`,
    { lang }
  );
  if (!doc) {
    console.log(`⚠  No homePage document found for "${lang}" — skipping (create one in Studio first).`);
    skipCount++;
    continue;
  }
  await client
    .patch(doc._id)
    .set({ tokenBreakdown: { tokens, charCount } })
    .commit();
  console.log(`✓ ${lang.padEnd(2)}  ${doc._id.padEnd(20)} → ${tokens.length} chunks, charCount ${charCount}`);
  console.log(`     sentence: ${sentence}`);
  okCount++;
}

console.log(`\nDone. ${okCount} updated, ${skipCount} skipped.`);
