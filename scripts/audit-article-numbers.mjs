/**
 * audit-article-numbers.mjs
 *
 * Reports every `articleNumber` carried by more than one post in the same
 * language, suggests which posts look like translations of each other, and lists
 * the numbers nothing is using.
 *
 * READ-ONLY. It creates no client token and calls nothing but `fetch`, so it
 * cannot write to Sanity even by accident. Re-run it after fixing numbers in the
 * Studio to confirm the collisions are gone.
 *
 * Usage:
 *   node scripts/audit-article-numbers.mjs [output.md]
 *
 * Defaults to audits/<today>/articlenumber-collisions.md. Reads the project id
 * and dataset from PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET, falling
 * back to .env, which is all a public dataset needs.
 *
 * ── Why the grouping is only a suggestion ──
 * Nothing in the data says "this Spanish post is the translation of that English
 * one". The script infers it from four signals that happen to line up in this
 * dataset, and reports which of them agreed so a human can judge:
 *
 *   cover image  a translation reuses the source article's image asset
 *   body blocks  a translation has the same number of blocks as its source
 *   publishedAt  a cluster was written within seconds; separate articles, minutes
 *   slug         en and vi frequently share one, which pairs them outright
 *
 * Agreement is strong evidence, not proof. Nobody should reassign a number on
 * this file alone without opening the two posts.
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

if (!PROJECT_ID) {
  console.error('No PUBLIC_SANITY_PROJECT_ID in the environment or .env.');
  process.exit(1);
}

// No `token`: this audit must never be able to write.
const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2024-01-01', useCdn: false });

const LANGS = ['en', 'es', 'id', 'vi'];

// ── Fetch ─────────────────────────────────────────────────────────────────
const posts = await client.fetch(`*[_type == "post" && !(_id in path("drafts.**"))]{
  _id, _createdAt, articleNumber, language, title, "slug": slug.current,
  publishedAt, category, tags, "coverRef": coverImage.asset._ref, "blocks": count(body)
}`);

// ── Group ─────────────────────────────────────────────────────────────────
const byNumber = new Map();
for (const post of posts) {
  const key = typeof post.articleNumber === 'number' ? post.articleNumber : null;
  if (!byNumber.has(key)) byNumber.set(key, []);
  byNumber.get(key).push(post);
}

/** Numbers where one language holds more than one post. */
const collisions = [...byNumber.entries()]
  .filter(([number]) => number !== null)
  .map(([number, group]) => {
    const perLang = {};
    for (const post of group) perLang[post.language] = (perLang[post.language] ?? 0) + 1;
    return { number, group, perLang };
  })
  .filter(({ perLang }) => Object.values(perLang).some(n => n > 1))
  .sort((a, b) => a.number - b.number);

/**
 * Split a colliding group into suggested translation clusters.
 *
 * Cover image first, because in this dataset it is the one field a translation
 * inherits verbatim. Posts with no cover fall back to a key that still has to
 * agree on block count and publication minute.
 */
function suggestClusters(group) {
  const clusters = new Map();
  for (const post of group) {
    const key = post.coverRef ?? `nocover:${post.blocks}:${(post.publishedAt ?? '').slice(0, 16)}`;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(post);
  }
  return [...clusters.values()].map(members => {
    const sorted = [...members].sort((a, b) => LANGS.indexOf(a.language) - LANGS.indexOf(b.language));
    const times = members.map(m => Date.parse(m.publishedAt ?? '')).filter(Number.isFinite);
    const spreadSeconds = times.length ? Math.round((Math.max(...times) - Math.min(...times)) / 1000) : null;
    const langs = members.map(m => m.language);
    const anyCover = members.some(m => m.coverRef);
    const agreed = {
      // Neutral when no post in the cluster has a cover at all: absent evidence is
      // not evidence against, and grading those "needs review" buried clusters
      // that every other signal agreed on.
      cover: anyCover && members.every(m => m.coverRef) && new Set(members.map(m => m.coverRef)).size === 1,
      coverUnknown: !anyCover,
      blocks: new Set(members.map(m => m.blocks)).size === 1,
      published: spreadSeconds !== null && spreadSeconds <= 30,
      tags: new Set(members.map(m => JSON.stringify(m.tags ?? []))).size === 1,
      sharedSlug: new Set(members.map(m => m.slug)).size < members.length,
    };
    const oneEach = langs.length === new Set(langs).size;
    const corroborated = agreed.blocks && agreed.published;
    let confidence = 'needs review';
    // A cluster of one has nothing to corroborate: it is an article that shares a
    // number with articles it has nothing to do with, and simply needs its own.
    if (members.length === 1) confidence = 'single';
    else if (oneEach && corroborated && agreed.cover) confidence = 'strong';
    else if (oneEach && corroborated && agreed.coverUnknown && (agreed.tags || agreed.sharedSlug)) confidence = 'likely';
    return { members: sorted, spreadSeconds, agreed, oneEach, confidence, langs };
  }).sort((a, b) => (a.members[0].publishedAt ?? '').localeCompare(b.members[0].publishedAt ?? ''));
}

/** Two documents in one language that are the same post, not two posts. */
function duplicateDocuments(group) {
  const seen = new Map();
  const dupes = [];
  for (const post of group) {
    const key = `${post.language}|${post.slug}`;
    if (seen.has(key)) dupes.push([seen.get(key), post]);
    else seen.set(key, post);
  }
  return dupes;
}

// ── Unused numbers ────────────────────────────────────────────────────────
const used = new Set(posts.map(p => p.articleNumber).filter(n => typeof n === 'number'));
const highest = Math.max(...used);
const gaps = [];
for (let n = 1; n <= highest; n++) if (!used.has(n)) gaps.push(n);

/** Collapse [3,4,5,9] into "3–5, 9". */
function ranges(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    let j = i;
    while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
    out.push(i === j ? String(list[i]) : `${list[i]}–${list[j]}`);
    i = j;
  }
  return out;
}

// How many posts each number holds, to show which clusters are complete.
const missingNumbers = new Map();
for (const [number, group] of byNumber) {
  if (number === null) continue;
  const langs = new Set(group.map(p => p.language));
  const absent = LANGS.filter(l => !langs.has(l));
  if (absent.length) missingNumbers.set(number, absent);
}

// ── Report ────────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const outPath = resolve(process.cwd(), process.argv[2] ?? `audits/${today}/articlenumber-collisions.md`);
const L = [];
const w = line => L.push(line);

const affected = collisions.reduce((n, c) => n + c.group.length, 0);
const noNumber = (byNumber.get(null) ?? []).length;

w(`# \`articleNumber\` collisions`);
w('');
w(`Generated ${today} by \`node scripts/audit-article-numbers.mjs\` against the \`${DATASET}\` dataset. Read-only — this script cannot write to Sanity.`);
w('');
w('## Summary');
w('');
w('| | |');
w('|---|---|');
w(`| Published posts | ${posts.length} |`);
w(`| Distinct \`articleNumber\`s in use | ${used.size} |`);
w(`| Highest number in use | ${highest} |`);
w(`| Numbers colliding within a language | **${collisions.length}** (${collisions.map(c => c.number).join(', ')}) |`);
w(`| Posts affected | **${affected}** |`);
w(`| Posts with no number at all | ${noNumber} |`);
w('');
w('`articleNumber` is the only thing connecting a post to its translations, so a');
w('collision breaks hreflang: where two posts in the same language share a number,');
w('nothing identifies which one a Spanish post translates. The site handles that by');
w('emitting a self-referencing hreflang only and warning at build time, rather than');
w('guessing a pair — a wrong pair is a claim Google acts on.');
w('');

// ── Ordering warning ──
w('## Before reassigning anything: this changes what readers see');
w('');
w('`articleNumber` is not only a key. It is the sort order posts are fetched in');
w('(`getAllPosts` orders by `coalesce(articleNumber, 999999) asc`), so changing a');
w('number moves the post in three reader-facing places:');
w('');
w('| Where | What `articleNumber` decides |');
w('|---|---|');
w('| Home page | Which 7 posts appear at all (`allPosts.slice(0, 7)`), and which is the large featured card (`blogPosts[0]`) |');
w('| Blog index | Which post fills the featured slot — `pickFeatured` takes the first match in DOM order, and DOM order is this sort |');
w('| Blog index | The "Most Popular" sort option, which is `articleNumber` ascending |');
w('');
w('The blog index defaults to "Latest" (publication date), so the main grid order');
w('does not move — but the featured slot and the whole home-page selection do.');
w('Lowest number wins in each case, so moving a post to a low free number promotes');
w('it to the home page, and moving it high removes it from there.');
w('');

// ── Collisions ──
w('## The collisions');
w('');
w('For each number: every post that currently carries it, then a **suggested**');
w('grouping of which look like translations of each other.');
w('');
w('The suggestion is inferred, not recorded. Signals used, in order of weight:');
w('cover image asset (a translation reuses the source article\'s image), body block');
w('count, publication timestamp (a cluster was written within seconds of itself),');
w('and shared slug (`en` and `vi` often share one). Each cluster below says which');
w('signals agreed. **Open both posts before acting on any of it.**');
w('');

for (const { number, group, perLang } of collisions) {
  const dupes = duplicateDocuments(group);
  w(`### \`articleNumber\` ${number} — ${group.length} posts`);
  w('');
  w(`Per language: ${LANGS.filter(l => perLang[l]).map(l => `${l} ×${perLang[l]}`).join(', ')}`);
  w('');
  w('| Language | Title | Slug | Cover asset | Blocks | publishedAt |');
  w('|---|---|---|---|---|---|');
  for (const p of [...group].sort((a, b) =>
    LANGS.indexOf(a.language) - LANGS.indexOf(b.language) || (a.slug ?? '').localeCompare(b.slug ?? ''))) {
    const cover = p.coverRef ? `\`…${p.coverRef.slice(6, 14)}\`` : '—';
    w(`| ${p.language} | ${p.title} | \`${p.slug}\` | ${cover} | ${p.blocks} | ${p.publishedAt} |`);
  }
  w('');

  if (dupes.length) {
    w(`> **⚠️ Not a translation problem — duplicate documents.** ${dupes.length} pair(s) below are two Sanity documents with the same language *and* the same slug, so they are the same post twice. Two documents cannot both own one URL: the build writes one over the other, and whichever loses is unreachable. Delete the redundant document rather than renumbering it.`);
    w('>');
    for (const [a, b] of dupes) {
      w(`> - \`${a.language}\` / \`${a.slug}\` — \`${a._id}\` (created ${a._createdAt}) and \`${b._id}\` (created ${b._createdAt})`);
    }
    w('');
  }

  w('**Suggested clusters** (each should end up with its own number):');
  w('');
  const clusters = suggestClusters(group);
  clusters.forEach((cluster, i) => {
    const signals = [];
    if (cluster.agreed.cover) signals.push('same cover image');
    if (cluster.agreed.blocks) signals.push(`same block count (${cluster.members[0].blocks})`);
    if (cluster.agreed.published) signals.push(`published within ${cluster.spreadSeconds}s`);
    if (cluster.agreed.tags) signals.push('identical tags');
    if (cluster.agreed.sharedSlug) signals.push('shares a slug across locales');
    if (cluster.agreed.coverUnknown) signals.push('no cover image on any member, so that signal is silent');
    const flag = { strong: '✅ strong', likely: '🟡 likely', single: 'ℹ️ single post, no translations found',
                   'needs review': '⚠️ needs review' }[cluster.confidence];
    const langNote = cluster.oneEach ? '' : ` — **${cluster.langs.length} posts but only ${new Set(cluster.langs).size} distinct language(s)**`;
    const detail = cluster.confidence === 'single' ? '' : ` — ${signals.join(', ') || 'no corroborating signal'}`;
    w(`${i + 1}. ${flag}${langNote}${detail}`);
    for (const m of cluster.members) w(`   - \`${m.language}\` \`${m.slug}\` — ${m.title}`);
  });
  w('');
  const tally = c => clusters.filter(x => x.confidence === c).length;
  w(`${tally('strong')} strong, ${tally('likely')} likely, ${tally('single')} single, ${tally('needs review')} needing review. ` +
    `Number ${number} can stay with one cluster; every other cluster needs a free number.`);
  w('');
}

// ── Duplicate documents across the whole dataset ──
// Surfaced by this audit rather than sought by it: the same missing constraint
// that let numbers collide also let two documents claim one slug, and that one is
// already costing the site pages.
const bySlugLang = new Map();
for (const post of posts) {
  const key = `${post.language}|${post.slug}`;
  if (!bySlugLang.has(key)) bySlugLang.set(key, []);
  bySlugLang.get(key).push(post);
}
const slugDupes = [...bySlugLang.entries()].filter(([, group]) => group.length > 1);

w('## Also found: documents sharing one URL');
w('');
if (!slugDupes.length) {
  w('No two published posts share a language and a slug.');
} else {
  w(`**${slugDupes.length} slug${slugDupes.length === 1 ? '' : 's'} are claimed by more than one document in the same language**, covering ${slugDupes.reduce((n, [, g]) => n + g.length, 0)} documents. This is not an \`articleNumber\` problem and it is worse than one: a language and a slug together decide the URL, so only one of these documents can be served at \`/<lang>/blog/<slug>/\`. The build writes them in fetch order and the last one wins, which means the others are unreachable — their content is live in Sanity and absent from the site.`);
  w('');
  w('| Language | Slug | Documents | `articleNumber`s | Document IDs |');
  w('|---|---|---|---|---|');
  for (const [key, group] of slugDupes.sort((a, b) => b[1].length - a[1].length)) {
    const [lang, slug] = key.split('|');
    const ids = group.map(p => `\`${p._id}\` (${p._createdAt.slice(0, 10)})`).join('<br>');
    w(`| ${lang} | \`${slug}\` | ${group.length} | ${group.map(p => p.articleNumber).join(', ')} | ${ids} |`);
  }
  w('');
  w('Only one of these overlaps the collision list above, so fixing the numbers');
  w('alone would leave the rest in place. Each needs a decision in the Studio:');
  w('keep one document and delete the others, or give the survivors distinct slugs.');
  w('');
  const suffixed = posts.filter(p => /-(en|es|id|vi)$/.test(p._id));
  w(`For context on the IDs: ${suffixed.length} documents carry a \`-<language>\` suffix, which is how the translation pipeline names a locale copy. A document whose suffix matches its own \`language\` — an \`-en\` document that is already English — is a copy the pipeline should not have made, and is worth checking first.`);
}
w('');

// ── Free numbers ──
w('## Numbers that are free');
w('');
if (gaps.length) {
  w(`Unused below the current maximum of ${highest}: **${ranges(gaps).join(', ')}** (${gaps.length} number${gaps.length === 1 ? '' : 's'}).`);
} else {
  w(`Nothing below the current maximum of ${highest} is free.`);
}
w('');
w(`Everything from **${highest + 1}** upward is also free.`);
w('');
w('Which to use depends on what the number should do to the ordering described');
w('above. A gap low in the range promotes a post toward the home page; a number');
w(`above ${highest} sends it to the end of the fetch order and off the home page.`);
w('');

const needed = collisions.reduce((n, { group }) => n + Math.max(0, suggestClusters(group).length - 1), 0);
w(`Resolving the ${collisions.length} collisions needs **${needed} free number${needed === 1 ? '' : 's'}** if every suggested cluster keeps a distinct one.`);
w('');

// ── Incomplete clusters, as context ──
const incomplete = [...missingNumbers.entries()].sort((a, b) => a[0] - b[0]);
w('## Context: numbers missing a locale');
w('');
w(`Not a collision and not a bug, but it shapes how many hreflang links a post gets. ${incomplete.length} number(s) are missing at least one locale:`);
w('');
const byMissing = new Map();
for (const [number, absent] of incomplete) {
  const key = absent.join(', ');
  if (!byMissing.has(key)) byMissing.set(key, []);
  byMissing.get(key).push(number);
}
w('| Missing locale(s) | Count | Numbers |');
w('|---|---|---|');
for (const [key, numbers] of [...byMissing.entries()].sort((a, b) => b[1].length - a[1].length)) {
  w(`| ${key} | ${numbers.length} | ${ranges(numbers.sort((a, b) => a - b)).join(', ')} |`);
}
w('');
w('---');
w('');
w('Re-run `node scripts/audit-article-numbers.mjs` after editing in the Studio to');
w('confirm the collision count is zero.');
w('');

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, L.join('\n'));

console.log(`Wrote ${outPath}`);
console.log(`${collisions.length} colliding number(s) across ${affected} post(s); ${needed} free number(s) needed.`);
for (const { number, group } of collisions) {
  const dupes = duplicateDocuments(group);
  console.log(`  ${number}: ${group.length} posts, ${suggestClusters(group).length} suggested cluster(s)` +
    (dupes.length ? `, ${dupes.length} duplicate document pair(s)` : ''));
}
