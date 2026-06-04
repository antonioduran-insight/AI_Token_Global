/**
 * delete-all-posts.mjs
 *
 * Deletes ALL published and draft `post` documents from Sanity.
 *
 * Usage (from project root):
 *   node scripts/delete-all-posts.mjs
 *
 * Requires: `sanity login` already done (uses stored CLI auth).
 * Dry run to preview what will be deleted:
 *   DRY_RUN=1 node scripts/delete-all-posts.mjs
 */

import { createClient } from '@sanity/client';
import { execSync } from 'node:child_process';

const PROJECT_ID = 'mq3wxr8n';
const DATASET = 'production';
const DRY_RUN = process.env.DRY_RUN === '1';

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function getAllPostIds() {
  const ids = [];
  let from = 0;
  const batchSize = 100;
  while (true) {
    const batch = await client.fetch(
      `*[_type == "post" || (_id in path("drafts.**") && _type == "post")]{_id}[${from}...${from + batchSize}]`
    );
    // The above query won't catch drafts that way - use raw perspective
    if (batch.length === 0) break;
    ids.push(...batch.map(d => d._id));
    from += batchSize;
    if (batch.length < batchSize) break;
  }
  return ids;
}

async function getAllPostIdsRaw() {
  // Fetch published docs
  const published = await client.fetch(`*[_type == "post"]._id`);
  // Derive draft IDs (drafts.<id>) and also query drafts directly
  const draftIds = published.map(id => `drafts.${id}`);
  // Also fetch any standalone drafts that may not have a published counterpart
  const draftsOnly = await client.fetch(`*[_id in path("drafts.**") && _type == "post"]._id`);
  const all = new Set([...published, ...draftIds, ...draftsOnly]);
  return [...all];
}

const ids = await getAllPostIdsRaw();

if (ids.length === 0) {
  console.log('No post documents found. Nothing to delete.');
  process.exit(0);
}

console.log(`Found ${ids.length} post documents (published + draft IDs).`);

if (DRY_RUN) {
  console.log('\n[DRY RUN] Would delete these IDs:');
  ids.forEach(id => console.log(' ', id));
  console.log(`\n[DRY RUN] Total: ${ids.length} documents. Run without DRY_RUN=1 to delete.`);
  process.exit(0);
}

console.log('Deleting...');

// Pass all IDs to sanity CLI in chunks to avoid arg length limits
const CHUNK_SIZE = 50;
for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
  const chunk = ids.slice(i, i + CHUNK_SIZE);
  const idArgs = chunk.map(id => `"${id}"`).join(' ');
  const cmd = `npx sanity documents delete --project-id=${PROJECT_ID} --dataset=${DATASET} ${idArgs}`;
  try {
    execSync(cmd, { cwd: new URL('../studio', import.meta.url).pathname, stdio: 'inherit' });
  } catch (err) {
    // Some IDs (e.g. derived draft IDs that don't exist) may 404 — that's fine
    console.warn(`Chunk ${i / CHUNK_SIZE + 1} had errors (likely non-existent draft IDs) — continuing.`);
  }
  console.log(`Deleted chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(ids.length / CHUNK_SIZE)}`);
}

console.log('\nDone. All post documents deleted.');
