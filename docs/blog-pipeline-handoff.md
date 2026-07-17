# Adding aitokenglobal as a destination for the blog pipeline

Your existing blog-generation pipeline (triggered via Claude Code) already
does: **scrape/source candidate videos → draft the article → SEO-score it →
post to a Wix site** (`aitoken.com.tw`). This doc covers the one thing that
changes: **adding aitokenglobal as a second destination** in that last step,
with automatic translation across every language subdirectory this site
supports.

Nothing about sourcing, drafting, or SEO scoring needs to change. This is
purely about what happens *after* an article clears your existing score
threshold.

## 1. Access & credentials checklist

| What | Where to get it | Used for |
|---|---|---|
| GitHub access to `aitokenglobal` | Repo Settings → Collaborators | Running the scripts below |
| Sanity project access (Editor role) | sanity.io/manage → project `mq3wxr8n` → Members | Studio access |
| Sanity API token (Editor permission) | sanity.io/manage → project → API → Tokens | Non-interactive writes (`SANITY_TOKEN`) |

None of this repo's scripts load a `.env` file automatically (no `dotenv`
dependency) — export these in your shell before running anything:

```bash
export SANITY_TOKEN=sk-...
```

## 2. What's different about this destination

- **One schema, not one-per-language.** aitokenglobal's Sanity project has a
  single `post` document type (`studio/schemas/post.ts`) shared across all
  languages, distinguished by a `language` field — not a separate schema per
  subdirectory.
- **Supported languages today: `en`, `es`, `id`, `vi`. No Chinese.** The
  article needs an **English** version — either translate the already
  SEO-approved Chinese draft into English, or generate the English version
  in parallel from the same source transcript.
- **Required field the current draft doesn't produce:** `articleNumber`
  (must be unique — see Step 2 below).
- **Images are optional — just don't send any.** `coverImage` and the image
  block type in `body` (`studio/schemas/post.ts`) are both optional fields,
  not required. This pipeline never produces images, and that's fine as-is:
  omit `coverImage` entirely and the frontend falls back to a
  category-tinted gradient placeholder automatically (already built into
  the blog index, post page, and homepage teaser — nothing to change).
  Don't build any image-sourcing step for this destination. (Older posts
  that already have real cover/inline images from the previous
  Hermes/ComfyUI pipeline keep them — this only affects new posts going
  forward, since that pipeline is now disabled.)
- **Category taxonomy differs** from the existing 8-category system — see
  mapping table below.
- **Deploy model:** Astro SSG on AWS Amplify, rebuilds only on `git push` to
  `main`. The Sanity→Amplify webhook (auto-rebuild on publish) is documented
  in `go-live-guide.md` §6.4 but **not yet wired up** — see step 5 below.

### Category mapping

| Existing category (8 total) | aitokenglobal category (7 total) |
|---|---|
| `ai-token-basics` | `fundamentals` |
| `ai-token-calculation` | `calculation` |
| `ai-token-pricing` | `pricing` |
| `ai-model-comparison` | `models` |
| `ai-platforms-tools-procurement` | `platform` |
| `enterprise-ai-security-compliance` | `compliance` |
| `ai-token-guides` | `tutorials` |
| `ai-industry-insights` | ⚠ no equivalent — default to `fundamentals`, or route to the existing `aiTrendsPage` singleton instead of a blog post |

## 3. The new "post to aitokenglobal" step

This slots in alongside the existing Wix-posting step, once an article has
cleared the SEO score threshold.

### Step 1 — Get (or produce) the English version of the approved article
Translate the approved draft to English, or generate it in English from the
same sourced transcript.

### Step 2 — Convert it into a Sanity-ready document
Reference `scripts/import-posts.mjs` in *this* repo — its Portable Text
block conversion already matches `studio/schemas/post.ts` exactly (more
accurate than adapting `build_sanity_post.py` from the AITK side, which has
drifted from this schema).

Before assigning `articleNumber`, query the current max:
```bash
cd studio && npx sanity documents query '*[_type=="post"] | order(articleNumber desc)[0]{articleNumber}'
```
Use `max + 1`.

### Step 3 — Write the English post into Sanity
```bash
node scripts/import-posts.mjs path/to/new-post.json
cd studio && npx sanity dataset import ../path/to/new-post.ndjson production --replace
```
`--replace` only overwrites a document whose `_id` already matches — safe to
run per-post, doesn't touch anything else in the dataset.

### Step 4 — Translate into every other language subdirectory
Already built as ready-made subagents in this repo. Once the English post
is live, for each of `es`, `id`, `vi`, in a fresh chat:
```
Spawn the @translator agent on post with target language es. Variant: slug=<the-post-slug>.
```
It fetches the EN doc from Sanity, translates it, and writes the
new-language version back automatically (report in
`translation/reports/post/<lang>/`). Then, per language:
```
Spawn the @proofreader agent on post with target language es. Variant: slug=<the-post-slug>.
```
Read-only QA pass — flags anything critical for human review, doesn't touch
content.

### Step 5 — ⚠ Make sure the site actually rebuilds
Publishing to Sanity alone does **not** update the live site today —
Amplify only rebuilds on `git push` to `main`, and the Sanity webhook that
would auto-trigger a rebuild on publish isn't wired up yet. Two options:
- **Recommended:** wire up the Sanity → Amplify webhook once (~15 min,
  documented in `go-live-guide.md` §6.4: Amplify → App settings → Build
  settings → Incoming webhooks → Create; then Sanity → API → Webhooks →
  point it at that URL, trigger on Create/Update/Delete).
- **Stopgap:** end each publishing batch with a trivial commit + push to
  `main` to force a rebuild.

### Step 6 — Verify live
Check `/en/blog/<slug>`, `/es/blog/<slug>`, `/id/blog/<slug>`,
`/vi/blog/<slug>` on the deployed site.

## Open decisions (flag to Frank/Alice if unclear)

1. Where should `ai-industry-insights`-type content go — `fundamentals`
   catch-all, or the `aiTrendsPage` singleton?
2. ~~Should cover-image sourcing be automated or stay a manual step?~~
   **Resolved:** don't build it. This pipeline is now the sole source of
   new posts on aitokenglobal (the previous Hermes/ComfyUI cron pipeline
   is disabled). `coverImage` stays in the schema as an optional field —
   nothing was removed — but new posts from this pipeline simply omit it,
   and the frontend's existing gradient-placeholder fallback handles that
   automatically. Older posts that already have real images are unaffected.
3. Does this destination need the same fact-review gates (pricing/
   compliance/industry-claim content) the existing pipeline uses, or a
   lighter process since it's a different brand/audience?
