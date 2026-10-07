/**
 * build-content-corpus.mjs
 *
 * Pulls every published post from Sanity and flattens each Portable Text body
 * to plain text, so the whole blog can be analysed offline as one JSON file.
 * scripts/analyse-content-corpus.mjs reads what this writes.
 *
 * READ-ONLY. It only ever calls `client.fetch`. The token, when given, is a
 * read token; nothing in this file creates, patches or deletes a document.
 *
 * Usage:
 *   node scripts/build-content-corpus.mjs [output.json]
 *   SANITY_READ_TOKEN=sk... node scripts/build-content-corpus.mjs
 *
 * Defaults to audits/<today>/content-corpus.json. Project and dataset come from
 * PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET, falling back to .env. The
 * production dataset is public, so the token is optional; set
 * SANITY_READ_TOKEN only if the dataset is ever made private.
 *
 * ── What counts as text ──
 * Only `block` entries (paragraphs and headings) become plainText, joined by a
 * blank line. `image` and `imagePrompt` entries are skipped: images carry no
 * body copy, and imagePrompt art-direction notes are dropped by the renderer
 * (src/lib/portable-text.ts), so readers never see them. blockCount still
 * counts every body entry, so it matches `count(body)` in GROQ.
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// ── Config ────────────────────────────────────────────────────────────────
function fromDotEnv(key) {
  if (!existsSync('.env')) return undefined;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    if (line.startsWith('#') || !line.includes('=')) continue;
    const at = line.indexOf('=');
    if (line.slice(0, at).trim() !== key) continue;
    return line.slice(at + 1).trim().replace(/^["']|["']$/g, '');
  }
  return undefined;
}

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID ?? fromDotEnv('PUBLIC_SANITY_PROJECT_ID');
const DATASET = process.env.PUBLIC_SANITY_DATASET ?? fromDotEnv('PUBLIC_SANITY_DATASET') ?? 'production';
const TOKEN = process.env.SANITY_READ_TOKEN || undefined;

if (!PROJECT_ID) {
  console.error('No PUBLIC_SANITY_PROJECT_ID in the environment or .env.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const OUT = resolve(process.argv[2] ?? `audits/${today}/content-corpus.json`);

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
  // With a token the API also returns drafts; `perspective` pins it to what is live.
  perspective: 'published',
});

// ── Fetch ─────────────────────────────────────────────────────────────────
const posts = await client.fetch(`*[_type == "post" && !(_id in path("drafts.**"))] | order(language asc, articleNumber asc) {
  _id, articleNumber, translationKey, language, "slug": slug.current, title,
  publishedAt, _updatedAt, category, body
}`);

// ── Flatten ───────────────────────────────────────────────────────────────
/** A block's visible text: its spans concatenated, nothing else. */
function blockText(block) {
  return (block.children ?? []).map(child => child.text ?? '').join('');
}

function flatten(body = []) {
  const parts = [];
  for (const block of body) {
    if (block._type !== 'block') continue;
    const text = blockText(block).trim();
    if (text) parts.push(text);
  }
  return parts.join('\n\n');
}

function countWords(text) {
  const words = text.match(/\S+/g);
  return words ? words.length : 0;
}

const corpus = posts.map(post => {
  const plainText = flatten(post.body);
  return {
    _id: post._id,
    articleNumber: post.articleNumber ?? null,
    translationKey: post.translationKey ?? null,
    language: post.language ?? null,
    slug: post.slug ?? null,
    title: post.title ?? null,
    publishedAt: post.publishedAt ?? null,
    _updatedAt: post._updatedAt,
    category: post.category ?? null,
    wordCount: countWords(plainText),
    blockCount: (post.body ?? []).length,
    plainText,
    // Kept so the analysis can count headings and empty blocks without a second
    // fetch. Style only, no text — the text already lives in plainText.
    blocks: (post.body ?? []).map(block => ({
      type: block._type,
      style: block.style ?? null,
      empty: block._type === 'block' ? blockText(block).trim() === '' : false,
    })),
  };
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  projectId: PROJECT_ID,
  dataset: DATASET,
  count: corpus.length,
  posts: corpus,
}, null, 2) + '\n');

const perLang = {};
for (const post of corpus) perLang[post.language] = (perLang[post.language] ?? 0) + 1;
console.log(`Wrote ${corpus.length} posts to ${OUT}`);
console.log(Object.entries(perLang).map(([lang, n]) => `  ${lang}: ${n}`).join('\n'));
