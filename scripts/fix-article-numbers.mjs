/**
 * fix-article-numbers.mjs
 *
 * Reassigns `articleNumber` so no number is carried by two posts in the same
 * language, resolving the collisions reported by
 * `audits/2026-08-14/articlenumber-collisions.md`.
 *
 * `articleNumber` is the only field connecting a post to its translations, so a
 * number shared by two same-language posts makes the pairing ambiguous and the
 * site falls back to self-only hreflang (see `buildPostAlternates` in
 * src/lib/sanity.ts). Giving each translation cluster its own number reconnects
 * them.
 *
 * DRY RUN BY DEFAULT. Prints every intended change and writes nothing. Pass
 * `--write` to commit.
 *
 * Usage:
 *   node scripts/fix-article-numbers.mjs                            # dry run
 *   node scripts/fix-article-numbers.mjs --delete-duplicates        # dry run, incl. the delete
 *   SANITY_TOKEN=sk... node scripts/fix-article-numbers.mjs --write --delete-duplicates
 *
 * Flags:
 *   --write               commit. Without it nothing is written and no token is used.
 *   --delete-duplicates   also delete the redundant document behind articleNumber 60
 *                         (see DUPLICATES below). Every delete passes a preflight that
 *                         refuses unless the copy is field-identical to the document
 *                         kept beside it, unreferenced, and has no draft.
 *
 * Env:
 *   PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET  read from .env if unset
 *   SANITY_TOKEN                                     required only for --write
 *                                                    (Editor role; never commit it)
 *
 * ── How members are resolved ──
 * By the (current number, language, slug) triple taken from the audit report —
 * never by title. Three English documents share the slug
 * `ai-token-pricing-models-comparison` at three different numbers, so language +
 * slug alone is not unique; the number the post carries today disambiguates it.
 * Any member that does not resolve to exactly one published document aborts the
 * run before anything is written.
 */
import { createClient } from '@sanity/client';
import { existsSync, readFileSync } from 'node:fs';

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
const TOKEN = process.env.SANITY_TOKEN;
const WRITE = process.argv.includes('--write');

if (!PROJECT_ID) {
  console.error('No PUBLIC_SANITY_PROJECT_ID in the environment or .env.');
  process.exit(1);
}
if (WRITE && !TOKEN) {
  console.error('--write needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  console.error('Run as: SANITY_TOKEN=sk... node scripts/fix-article-numbers.mjs --write');
  process.exit(1);
}

// No token on a dry run: it cannot write even if the code were wrong.
const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  ...(WRITE ? { token: TOKEN } : {}),
});

// ── The assignment ────────────────────────────────────────────────────────
// One entry per translation cluster in the audit report, with the number that
// cluster should end up carrying. `from` is the colliding number the cluster
// lives under today, and is half of how members are resolved.
const CLUSTERS = [
  {
    from: 1, to: 1,
    label: 'Understanding AI Token Pricing Models',
    members: [
      { language: 'en', slug: 'ai-token-pricing-models-comparison' },
      { language: 'es', slug: 'entendiendo-los-modelos-de-precios-de-tokens-ai' },
      { language: 'id', slug: 'mengerti-model-harga-token-ai-panduan-dasar' },
      { language: 'vi', slug: 'ai-token-pricing-models-comparison' },
    ],
  },
  {
    from: 1, to: 167,
    label: 'Calculating AI Token Costs',
    members: [
      { language: 'en', slug: 'calculating-ai-token-costs' },
      { language: 'es', slug: 'calculando-costos-de-token-ai-guia-para-principiantes' },
      { language: 'id', slug: 'menghitung-biaya-token-ai-panduan-pengantar' },
      { language: 'vi', slug: 'calculating-ai-token-costs' },
    ],
  },
  {
    from: 1, to: 168,
    label: 'Optimizing AI Token Costs for Small Businesses',
    members: [
      { language: 'en', slug: 'optimizing-ai-token-costs-for-small-businesses' },
      { language: 'es', slug: 'optimizacion-de-costos-de-tokens-para-pequenas-empresas' },
      { language: 'id', slug: 'optimasi-biaya-token-ai-usaha-kecil' },
      { language: 'vi', slug: 'optimizing-ai-token-costs-for-small-businesses' },
    ],
  },
  {
    from: 1, to: 169,
    label: 'Does AI Token Affect Answer Quality?',
    members: [
      { language: 'en', slug: 'ai-token-impact-answer-quality' },
      { language: 'es', slug: 'token-ai-cualidad-respuesta' },
      { language: 'id', slug: 'apakah-token-ai-mempengaruhi-kualitas-jawaban' },
      { language: 'vi', slug: 'ai-token-impact-answer-quality' },
    ],
  },
  {
    from: 2, to: 2,
    label: 'Understanding AI Token Basics for a Smarter Future',
    members: [
      { language: 'en', slug: 'understanding-ai-token-basics-for-a-smarter-future' },
      { language: 'es', slug: 'comprendiendo-tokens-de-inteligencia-artificial' },
      { language: 'id', slug: 'mengenal-token-ai-untuk-pemula-panduan-lengkap' },
      { language: 'vi', slug: 'understanding-ai-token-basics-for-a-smarter-future' },
    ],
  },
  {
    from: 2, to: 102,
    label: 'AI Token Provider Comparison: Prices, Features, and Use Cases',
    members: [
      { language: 'en', slug: 'ai-token-provider-comparison-prices-features-use-cases' },
      { language: 'es', slug: 'comparativa-proveedores-tokens-inteligencia-artificial' },
      { language: 'id', slug: 'perbandingan-penyedia-token-ai-harga-fitur-dan-kasus-penggunaan' },
      { language: 'vi', slug: 'ai-token-provider-comparison-prices-features-use-cases' },
    ],
  },
  {
    from: 2, to: 170,
    label: 'Understanding Tokenization in AI Platforms',
    members: [
      { language: 'en', slug: 'understanding-tokenization-in-ai-platforms-a-beginners-guide' },
      { language: 'es', slug: 'entendiendo-tokenizacion-en-plataformas-de-inteligencia-artificial-una-guia-para-principiantes' },
      { language: 'id', slug: 'mengerti-tokenisasi-dalam-platform-ai-panduan-untuk-pemula' },
      { language: 'vi', slug: 'understanding-tokenization-in-ai-platforms-a-beginners-guide' },
    ],
  },
  {
    from: 144, to: 144,
    label: 'MCP vs API',
    members: [
      { language: 'en', slug: 'mcp-vs-api-ai-agent-token-cost-efficiency' },
      { language: 'es', slug: 'mcp-vs-api-eficiencia-tokens-agentes-ia' },
      { language: 'id', slug: 'mcp-vs-api-efisiensi-biaya-token-ai-agent' },
      { language: 'vi', slug: 'mcp-vs-api-ai-agent-token-cost-efficiency' },
    ],
  },
  {
    from: 144, to: 171,
    label: "Google's Gemini Enterprise Agent Platform (English only)",
    members: [
      { language: 'en', slug: 'what-is-google-gemini-enterprise-agent-platform-and-pricing' },
    ],
  },
];

// ── The duplicate document ────────────────────────────────────────────────
// `articleNumber` 60 is absent from CLUSTERS above because it is not a numbering
// problem. Its two English documents share a language AND a slug, so they are one
// post stored twice: two documents cannot both be served at
// /en/blog/choosing-the-right-ai-model-for-your-needs/, the build writes one over
// the other, and renumbering either would only hide that. The fix is to delete
// the redundant document, which `--delete-duplicates` does — gated behind the
// preflight below rather than trusted, because a delete cannot be undone.
const DUPLICATES = [
  {
    number: 60,
    keep: 'g3jTIj9ubDWnGQfo9PLqB2',
    remove: 'g3jTIj9ubDWnGQfo9PLqB2-en',
    // Why this one and not the other: the documents are field-for-field identical,
    // so there is no content to lose either way, and the Vietnamese sibling is
    // `g3jTIj9ubDWnGQfo9PLqB2-vi` — derived from the kept ID as its stem. A
    // `-<lang>` suffix marks a locale copy, so an `-en` suffix on a document whose
    // language is already `en` is a copy the pipeline should not have made; no
    // other post in the dataset carries a suffix matching its own language.
    why: 'pipeline artefact: -en suffix on an already-English document, and -vi stems from the kept ID',
  },
];
const DELETE_DUPLICATES = process.argv.includes('--delete-duplicates');

/**
 * Everything that must be true before a delete is allowed.
 *
 * The claim being verified is "this document is redundant", and each check kills a
 * way that claim could be false: content only this copy holds, a link that would
 * 404, or an editor's unpublished draft.
 */
async function preflightDuplicate(dupe) {
  const problems = [];
  const [keep, remove] = await Promise.all([
    client.fetch('*[_id == $id][0]', { id: dupe.keep }),
    client.fetch('*[_id == $id][0]', { id: dupe.remove }),
  ]);

  if (!keep) problems.push(`the document to keep (${dupe.keep}) does not exist`);
  if (!remove) problems.push(`the document to remove (${dupe.remove}) does not exist`);
  if (problems.length) return { problems, differing: [] };

  // Same language and slug is what makes them one post twice rather than two posts.
  if (keep.language !== remove.language) {
    problems.push(`different languages (${keep.language} vs ${remove.language}) — these are not duplicates`);
  }
  if (keep.slug?.current !== remove.slug?.current) {
    problems.push(`different slugs (${keep.slug?.current} vs ${remove.slug?.current}) — these do not share a URL`);
  }

  // Identical content, field by field. Anything that differs is content the delete
  // would destroy, and needs a human to look at it rather than a flag.
  const VOLATILE = ['_id', '_rev', '_createdAt', '_updatedAt'];
  const keys = [...new Set([...Object.keys(keep), ...Object.keys(remove)])].filter(k => !VOLATILE.includes(k));
  const differing = keys.filter(k => JSON.stringify(keep[k]) !== JSON.stringify(remove[k]));
  if (differing.length) {
    problems.push(`${differing.length} field(s) differ, so the copy is not redundant: ${differing.join(', ')}`);
  }

  // A reference would break: Sanity keeps strong references intact, so the delete
  // would fail anyway, and a weak one would dangle.
  const refs = await client.fetch('*[references($id)]{_id, _type}', { id: dupe.remove });
  if (refs.length) {
    problems.push(`${refs.length} document(s) reference it: ${refs.map(r => r._id).join(', ')}`);
  }

  // A draft is unpublished work by a person, which is exactly what nothing here knows about.
  const draft = await client.fetch('*[_id == $id][0]._id', { id: `drafts.${dupe.remove}` });
  if (draft) problems.push(`a draft exists (${draft}) — publish or discard it first`);

  return { problems, differing, refs, keep, remove };
}

// ── Resolve ───────────────────────────────────────────────────────────────
const posts = await client.fetch(`*[_type == "post" && !(_id in path("drafts.**"))]{
  _id, articleNumber, language, title, "slug": slug.current
}`);

const changes = [];
const unchanged = [];
const errors = [];

for (const cluster of CLUSTERS) {
  for (const member of cluster.members) {
    const matches = posts.filter(p =>
      p.articleNumber === cluster.from &&
      p.language === member.language &&
      p.slug === member.slug);

    if (matches.length !== 1) {
      errors.push(`${cluster.label}: ${member.language} \`${member.slug}\` at articleNumber ` +
        `${cluster.from} resolved to ${matches.length} published documents, expected 1` +
        (matches.length > 1 ? ` (${matches.map(m => m._id).join(', ')})` : ''));
      continue;
    }

    const doc = matches[0];
    const row = { _id: doc._id, language: doc.language, slug: doc.slug, title: doc.title,
                  from: cluster.from, to: cluster.to, label: cluster.label };
    if (cluster.from === cluster.to) unchanged.push(row);
    else changes.push(row);
  }
}

// ── Resolve the duplicates ────────────────────────────────────────────────
const deletions = [];
for (const dupe of DUPLICATES) {
  if (!DELETE_DUPLICATES) continue;
  const result = await preflightDuplicate(dupe);
  if (result.problems.length) {
    for (const problem of result.problems) {
      errors.push(`Will not delete ${dupe.remove}: ${problem}`);
    }
    continue;
  }
  deletions.push({ ...dupe, language: result.remove.language, slug: result.remove.slug?.current });
}
const removedIds = new Set(deletions.map(d => d.remove));

// Simulate the dataset after every change and re-check the invariant the whole
// exercise exists to restore: no number carried by two posts in the same
// language. A target some unrelated post already holds would trade one collision
// for another, and this catches that before anything is written.
//
// Deletions count toward the simulation, so with `--delete-duplicates` the guard
// demands a genuinely clean dataset. Without it, number 60 is still expected to
// collide and is excused by name — nothing else is.
const excused = DUPLICATES.filter(d => !removedIds.has(d.remove)).map(d => d.number);
const moved = new Map(changes.map(c => [c._id, c.to]));
const finalPairs = new Map();
for (const post of posts) {
  if (removedIds.has(post._id)) continue;
  const number = moved.get(post._id) ?? post.articleNumber;
  if (typeof number !== 'number') continue;
  const pair = `${number}|${post.language}`;
  if (!finalPairs.has(pair)) finalPairs.set(pair, []);
  finalPairs.get(pair).push(post);
}
for (const [pair, group] of finalPairs) {
  if (group.length < 2) continue;
  const [number] = pair.split('|');
  if (excused.includes(Number(number))) continue;
  errors.push(`After this change, articleNumber ${pair.replace('|', ' in ')} would still be ` +
    `carried by ${group.length} posts: ${group.map(p => `${p._id} \`${p.slug}\``).join(', ')}`);
}

if (errors.length) {
  console.error('Refusing to continue — the assignment does not match the dataset:\n');
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

// ── Report ────────────────────────────────────────────────────────────────
const LANGS = ['en', 'es', 'id', 'vi'];
const order = (a, b) => a.to - b.to || LANGS.indexOf(a.language) - LANGS.indexOf(b.language);

console.log(`${WRITE ? 'WRITE' : 'DRY RUN'} — project ${PROJECT_ID}, dataset ${DATASET}\n`);

console.log(`Changing ${changes.length} document(s):`);
let lastLabel = null;
for (const c of [...changes].sort(order)) {
  if (c.label !== lastLabel) { console.log(`\n  ${c.label}  →  ${c.to}`); lastLabel = c.label; }
  console.log(`    ${c._id} ${c.language} ${c.slug}: ${c.from} → ${c.to}`);
}

console.log(`\nLeaving ${unchanged.length} document(s) on the number they already carry:`);
lastLabel = null;
for (const u of [...unchanged].sort(order)) {
  if (u.label !== lastLabel) { console.log(`\n  ${u.label}  →  ${u.to} (unchanged)`); lastLabel = u.label; }
  console.log(`    ${u._id} ${u.language} ${u.slug}: ${u.from} → ${u.to}`);
}

if (deletions.length) {
  console.log(`\nDeleting ${deletions.length} duplicate document(s) — same language and slug as the`);
  console.log('document kept beside them, every content field identical, nothing referencing them:');
  for (const d of deletions) {
    console.log(`\n  articleNumber ${d.number}`);
    console.log(`    delete ${d.remove} ${d.language} ${d.slug}`);
    console.log(`    keep   ${d.keep} ${d.language} ${d.slug}`);
    console.log(`    why    ${d.why}`);
  }
} else {
  console.log(`\nNot touched: articleNumber ${DUPLICATES.map(d => d.number).join(', ')} — duplicate documents,`);
  console.log('not a numbering problem. Two English documents share both a language and a slug');
  console.log('there, so that collision survives a renumbering and the audit will still report');
  console.log('it. Pass --delete-duplicates to resolve it.');
}

if (!WRITE) {
  console.log('\nDry run — nothing was written. Re-run with --write to commit.');
  if (!DELETE_DUPLICATES && DUPLICATES.length) {
    console.log('Add --delete-duplicates to include the duplicate document above.');
  }
  process.exit(0);
}

// ── Write ─────────────────────────────────────────────────────────────────
// Patch the published document and, where one exists, the draft alongside it.
// A stale draft would show the old number in the Studio and overwrite the fix
// the next time an editor hits Publish.
const draftIds = changes.map(c => `drafts.${c._id}`);
const existingDrafts = new Set(
  await client.fetch(`*[_id in $ids]._id`, { ids: draftIds })
);

const tx = client.transaction();
for (const c of changes) {
  tx.patch(c._id, p => p.set({ articleNumber: c.to }));
  if (existingDrafts.has(`drafts.${c._id}`)) {
    tx.patch(`drafts.${c._id}`, p => p.set({ articleNumber: c.to }));
  }
}
// In the same transaction as the patches: either the dataset ends up consistent
// or it is left exactly as it was. A delete that landed without its patches would
// leave the audit half-fixed and the reason why unrecorded.
for (const d of deletions) tx.delete(d.remove);

console.log(`\nCommitting ${changes.length} published patch(es), ` +
  `${existingDrafts.size} draft patch(es) and ${deletions.length} delete(s) in one transaction...`);

try {
  await tx.commit({ visibility: 'sync' });
} catch (err) {
  console.error(`Transaction failed, nothing was written: ${err.message}`);
  process.exit(1);
}

console.log('Done. Re-run `node scripts/audit-article-numbers.mjs` to confirm.');
