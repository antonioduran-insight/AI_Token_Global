/**
 * patch-price-corrections.mjs
 *
 * Applies the corrections behind audits/2026-10-07/price-mismatch-extract.md:
 *
 *   1. UNPUBLISH the GPT-5.6 Sol price-cut cluster (translationKey
 *      fafa6a9b-de6b-4f03-8278-a230e528b773, all four locales). Unpublish, not
 *      delete: Sanity's unpublish action moves each published document into
 *      its draft, so it can be published again from the Studio.
 *   2. REPLACE the text of block lmbjugq0 (Gemini 3.1 Pro "$0.020 per token")
 *      in the four AI-model-comparison posts.
 *   3. REPLACE the text of block b21 (Claude Sonnet 5 "$3 / $15") in
 *      aitk-en-155, English only.
 *   4. UNLINK or REPOINT the five links into the unpublished cluster (see the
 *      rule above LINKS). Only marks and markDefs change; the words stay.
 *
 * Replacement copy is not in this file. It comes from a JSON file you write
 * (default scripts/data/price-corrections.json):
 *
 *   {
 *     "lT0MJhwbFtcMofmR8IAAnJ": { "scope": "sentence", "to": "…" },
 *     "aitk-en-155":            { "scope": "block",    "to": "…" }
 *   }
 *
 *   scope "sentence"  replaces only the flagged sentence; the rest of the
 *                     block is kept.
 *   scope "block"     replaces the whole span text.
 *
 * Only the span's `text` changes. The block _key, span _key, style, marks and
 * markDefs are untouched, and each patch is pinned to the revision that was
 * read, so a concurrent Studio edit makes it fail instead of being overwritten.
 *
 * DRY RUN BY DEFAULT. Nothing is written without --apply.
 *
 * Usage:
 *   node scripts/patch-price-corrections.mjs                    # dry run, no token needed
 *   node scripts/patch-price-corrections.mjs [copy.json]        # dry run with replacement copy
 *   SANITY_TOKEN=… node scripts/patch-price-corrections.mjs [copy.json] --apply
 *
 * SANITY_TOKEN must be an Editor token from sanity.io/manage → API → Tokens,
 * exported in the shell for this run only — never in .env, never committed.
 *
 * Idempotent: an already-unpublished post and a block that already reads the
 * replacement are reported as "already done" and skipped. Every run writes a
 * before/after log to audits/<today>/price-corrections-log.md, and --apply
 * also saves each document as it was before the write, under
 * audits/<today>/price-corrections-backup/.
 */
import { createClient } from '@sanity/client';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_ID = 'mq3wxr8n';
const DATASET = 'production';
const APPLY = process.argv.includes('--apply');
const COPY_PATH = process.argv.slice(2).find(a => !a.startsWith('--')) ?? 'scripts/data/price-corrections.json';
const TOKEN = process.env.SANITY_TOKEN;
const today = new Date().toISOString().slice(0, 10);
const OUT_DIR = `audits/${today}`;

if (APPLY && !TOKEN) {
  console.error('--apply needs SANITY_TOKEN (an Editor token from sanity.io/manage → API → Tokens).');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2025-02-19', useCdn: false,
  perspective: 'raw', token: APPLY ? TOKEN : undefined,
});

// ── Targets ───────────────────────────────────────────────────────────────
const SOL_TRANSLATION_KEY = 'fafa6a9b-de6b-4f03-8278-a230e528b773';
const SOL_SLUGS = ['gpt-5-6-sol-price-cut-2026-vs-claude-opus-5', 'gpt-5-6-baja-de-precio-vs-claude-opus-5'];

const GEMINI_EN = "According to Google's pricing plan, Gemini 3.1 Pro costs $0.020 per token, which is significantly lower than GPT-5.4.";
const GEMINI_VI = 'Theo bảng giá của Google, Gemini 3.1 Pro có giá $0.020 mỗi token, thấp hơn đáng kể so với GPT-5.4.';
const SONNET_EN = "Per Anthropic's official announcement, the introductory price ($2 per million input tokens, $10 per million output tokens) runs through August 31, 2026, after which it reverts to standard pricing ($3 per million input tokens, $15 per million output tokens).";

/** The flagged sentence in each block, quoted from the extract. es and id carry the English. */
const BLOCKS = [
  { _id: 'lT0MJhwbFtcMofmR8IAAnJ', lang: 'en', blockKey: 'lmbjugq0', from: GEMINI_EN },
  { _id: 'PXBreekz6ug9jLuKVwmbYV', lang: 'es', blockKey: 'lmbjugq0', from: GEMINI_EN },
  { _id: 'lT0MJhwbFtcMofmR8IADGr', lang: 'id', blockKey: 'lmbjugq0', from: GEMINI_EN },
  { _id: 'lT0MJhwbFtcMofmR8IAAnJ-vi', lang: 'vi', blockKey: 'lmbjugq0', from: GEMINI_VI },
  { _id: 'aitk-en-155', lang: 'en', blockKey: 'b21', from: SONNET_EN },
];

const copy = existsSync(COPY_PATH) ? JSON.parse(readFileSync(COPY_PATH, 'utf8')) : {};
const log = [];
const say = line => { console.log(line); log.push(line); };
let failures = 0;

say(`# Price corrections ${APPLY ? 'APPLY' : 'DRY RUN'}: ${new Date().toISOString()}`);
say('');
say(`Dataset ${PROJECT_ID}/${DATASET}. Replacement copy: ${existsSync(COPY_PATH) ? `\`${COPY_PATH}\`` : `none (\`${COPY_PATH}\` not found)`}.`);
say('');

const backup = doc => {
  if (!APPLY) return;
  const dir = join(OUT_DIR, 'price-corrections-backup');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${doc._id}.json`), JSON.stringify(doc, null, 2) + '\n');
};

// ── 1. Unpublish the Sol cluster ──────────────────────────────────────────
say('## 1. Unpublish the GPT-5.6 Sol price-cut cluster');
say('');
const cluster = await client.fetch(
  `*[_type == "post" && translationKey == $key && !(_id in path("drafts.**"))] | order(language asc)`,
  { key: SOL_TRANSLATION_KEY },
);
const draftsOfCluster = await client.fetch(
  `*[_type == "post" && translationKey == $key && _id in path("drafts.**")]._id`, { key: SOL_TRANSLATION_KEY });

if (!cluster.length) say(`Already done: no published post carries translationKey ${SOL_TRANSLATION_KEY}${draftsOfCluster.length ? ` (drafts present: ${draftsOfCluster.join(', ')})` : ''}.`);

for (const doc of cluster) {
  const url = `/${doc.language}/blog/${doc.slug.current}/`;
  if (draftsOfCluster.includes(`drafts.${doc._id}`)) {
    say(`- SKIP \`${doc._id}\` (${doc.language}): a draft already exists, and unpublishing would replace it. Resolve the draft in the Studio first.`);
    failures++;
    continue;
  }
  say(`- ${APPLY ? 'UNPUBLISH' : 'would unpublish'} \`${doc._id}\` (${doc.language}) · rev ${doc._rev} · ${url} will 404 after the next build`);
  if (APPLY) {
    backup(doc);
    try {
      await client.action({ actionType: 'sanity.action.document.unpublish', publishedId: doc._id, draftId: `drafts.${doc._id}` });
      const after = await client.fetch('{"published": defined(*[_id == $id][0]), "draft": defined(*[_id == $d][0])}', { id: doc._id, d: `drafts.${doc._id}` });
      say(`  after: published=${after.published} draft=${after.draft}`);
      if (after.published || !after.draft) failures++;
    } catch (err) {
      say(`  FAILED: ${err.message}`);
      failures++;
    }
  }
}

// Posts that link to the cluster: their links break when it goes.
const allDocs = await client.fetch(`*[_type == "post" && !(_id in path("drafts.**")) && translationKey != $key]{_id, language, "slug": slug.current, body}`, { key: SOL_TRANSLATION_KEY });
const linking = allDocs.filter(d => SOL_SLUGS.some(s => JSON.stringify(d.body ?? []).includes(s)));
say('');
say(`Published posts linking to the cluster (links break on unpublish): ${linking.length}`);
for (const d of linking) say(`- \`${d._id}\` (${d.language}) /${d.language}/blog/${d.slug}/`);
say('');

// ── 2 & 3. Replace block text ─────────────────────────────────────────────
say('## 2–3. Replace flagged sentences');
say('');
for (const target of BLOCKS) {
  const doc = await client.fetch('*[_id == $id][0]', { id: target._id });
  const head = `### \`${target._id}\` (${target.lang}) · block \`${target.blockKey}\``;
  say(head);
  say('');
  if (!doc) { say('FAILED: document not found.'); say(''); failures++; continue; }
  const block = (doc.body ?? []).find(b => b._key === target.blockKey);
  if (!block || block._type !== 'block' || block.children?.length !== 1 || block.children[0]._type !== 'span') {
    say('FAILED: block missing, or not a single-span text block. Nothing changed; edit it by hand.');
    say(''); failures++; continue;
  }
  const span = block.children[0];
  const entry = copy[target._id];
  if (!entry?.to) { say('No replacement copy for this document yet. Skipped.'); say(''); continue; }
  if (!['sentence', 'block'].includes(entry.scope)) { say(`FAILED: scope must be "sentence" or "block", got ${JSON.stringify(entry.scope)}.`); say(''); failures++; continue; }

  const after = entry.scope === 'block' ? entry.to : span.text.replace(target.from, entry.to);
  if (span.text === after) { say('Already done: the block already reads the replacement.'); say(''); continue; }
  if (entry.scope === 'sentence' && !span.text.includes(target.from)) {
    say('FAILED: the flagged sentence is no longer in this block, so the post was edited since the extract. Nothing changed.');
    say(`Current text:\n> ${span.text}`); say(''); failures++; continue;
  }

  say(`Before:\n> ${span.text}`);
  say('');
  say(`After (${entry.scope}):\n> ${after}`);
  say('');
  if (APPLY) {
    backup(doc);
    try {
      await client.patch(doc._id).ifRevisionId(doc._rev)
        .set({ [`body[_key=="${block._key}"].children[_key=="${span._key}"].text`]: after })
        .commit();
      const check = await client.fetch('*[_id == $id][0].body[_key == $b][0].children[0].text', { id: doc._id, b: block._key });
      say(check === after ? 'Written and re-read: matches.' : 'FAILED: re-read text does not match.');
      if (check !== after) failures++;
    } catch (err) {
      say(`FAILED: ${err.message}`);
      failures++;
    }
    say('');
  }
}

// ── 4. Links into the unpublished cluster ─────────────────────────────────
// Rule: an anchor that names the price cut cannot honestly point anywhere
// else, so its link is removed and its words are kept; a generic anchor
// ("GPT-5.6 Sol pricing", "Sol vs Opus 5") is repointed to /{locale}/api-compare/.
// All five anchors are the cut article's own headline ("Sol Down 20%+"), so
// all five are UNLINK. REPOINT stays supported for any link added later.
const LINKS = [
  { _id: 'WrDyrcpEcKzVA0WNZUlVBJ', lang: 'en', blockKey: 'b44', markKey: 'b44mk1', action: 'unlink' },
  { _id: 'omD0WVM15RlaoFPycaTkzj', lang: 'en', blockKey: 'b34', markKey: 'b34mk1', action: 'unlink' },
  { _id: 'pqZUkO11VFO6GURruenJiC', lang: 'es', blockKey: 'b44', markKey: 'b44mk1', action: 'unlink' },
  { _id: 'Qm3zd23VCf0DzKaRFRhETm', lang: 'id', blockKey: 'b44', markKey: 'b44mk1', action: 'unlink' },
  { _id: 'Qm3zd23VCf0DzKaRFRhEnW', lang: 'vi', blockKey: 'b44', markKey: 'b44mk1', action: 'unlink' },
];
const pointsAtCluster = href => SOL_SLUGS.some(s => (href ?? '').includes(`/blog/${s}`));

say('## 4. Links into the unpublished cluster');
say('');
for (const target of LINKS) {
  say(`### \`${target._id}\` (${target.lang}) · block \`${target.blockKey}\` · ${target.action.toUpperCase()}`);
  say('');
  const doc = await client.fetch('*[_id == $id][0]', { id: target._id });
  const block = doc?.body?.find(b => b._key === target.blockKey);
  if (!block) { say('FAILED: document or block not found.'); say(''); failures++; continue; }
  const def = (block.markDefs ?? []).find(m => m._key === target.markKey);
  const anchor = (block.children ?? []).filter(c => c.marks?.includes(target.markKey)).map(c => c.text).join('');
  const expectedHref = `https://aitoken.global/${target.lang}/api-compare/`;

  if (!def) { say('Already done: the link is gone.'); say(''); continue; }
  if (target.action === 'repoint' && def.href === expectedHref) { say(`Already done: points at ${expectedHref}.`); say(''); continue; }
  if (!pointsAtCluster(def.href)) {
    say(`FAILED: link \`${target.markKey}\` now points at ${def.href}, not at the cluster. Nothing changed.`);
    say(''); failures++; continue;
  }

  say(`Anchor: "${anchor}"`);
  say(`Before: href ${def.href}`);
  const patch = client.patch(doc._id).ifRevisionId(doc._rev);
  if (target.action === 'unlink') {
    // Drop the mark from every span carrying it, then the markDef. Text untouched.
    for (const span of block.children.filter(c => c.marks?.includes(target.markKey))) {
      patch.set({ [`body[_key=="${block._key}"].children[_key=="${span._key}"].marks`]: span.marks.filter(m => m !== target.markKey) });
    }
    patch.unset([`body[_key=="${block._key}"].markDefs[_key=="${target.markKey}"]`]);
    say('After: no link; text unchanged.');
  } else {
    patch.set({ [`body[_key=="${block._key}"].markDefs[_key=="${target.markKey}"].href`]: expectedHref });
    say(`After: href ${expectedHref}`);
  }
  if (APPLY) {
    backup(doc);
    try {
      await patch.commit();
      const check = await client.fetch('*[_id == $id][0].body[_key == $b][0]', { id: doc._id, b: block._key });
      const text = (check.children ?? []).map(c => c.text).join('');
      const ok = text === (block.children ?? []).map(c => c.text).join('')
        && (target.action === 'unlink'
          ? !(check.markDefs ?? []).some(m => m._key === target.markKey) && !check.children.some(c => c.marks?.includes(target.markKey))
          : check.markDefs.find(m => m._key === target.markKey)?.href === expectedHref);
      say(ok ? 'Written and re-read: matches; text unchanged.' : 'FAILED: re-read block does not match.');
      if (!ok) failures++;
    } catch (err) {
      say(`FAILED: ${err.message}`);
      failures++;
    }
  }
  say('');
}

mkdirSync(OUT_DIR, { recursive: true });
const logPath = join(OUT_DIR, 'price-corrections-log.md');
writeFileSync(logPath, log.join('\n') + '\n');
console.log(`\nLog → ${logPath}${failures ? `\n${failures} problem(s); see above.` : ''}`);
process.exit(failures ? 1 : 0);
