# AI Token Global — Phase 5 Task Plan (Productize)

**Date:** 2026-05-19
**Owner:** Antonio Duran (project) · Claude Code (execution) · Claude in Cowork (planning/review)
**Purpose:** Source-of-truth task tracker for Phase 5 (Productize). Each section below maps to an Asana section; each task → Asana task; subtasks nested. Replaces `audits/IMPLEMENTATION_PLAN.md` as the active queue.

## Conventions

- **Effort:** S = under 1 hr · M = 1 hr to 1 day · L = 1+ days
- **Task IDs:** `5A-01` etc. — used in the `Dependencies` column when one task blocks another
- **Status:** ⏳ pending · 🔄 in progress · ✅ done · ⚠️ blocked
- **Owner roles:** *exec* = Claude Code does the work · *review* = Antonio reviews · *manual* = Antonio does in browser / Sanity / dashboard
- **Claude Code prompt:** Where one is included, it is drafted so Antonio can paste into Claude Code in VS Code with minimal edits

## Sequencing summary

```
5A Measurement & Ops Foundation
        ↓
5B Component Fidelity Pass
        ↓
5C ES Blog Automation
        ↓
5D Add zh-CN (Simplified Chinese)  ← stress-tests framework
        ↓
5E Framework Extraction (aitoken-framework-starter)
        ↓
5F Add id-ID (Indonesian)  ← validates new framework
        ↓
5G Content Planning  ← informed by 5A data
        ↓
5H Marketing Planning  ← informed by 5A + 5G
```

Backlog section at end catches pending items from `IMPLEMENTATION_PLAN.md` (Task #8 finish, Task #9 polish, Task #11 ops safety) that fold into the new phases or run on their own cadence.

---

# Section 5A — Measurement & Ops Foundation

**Goal:** Stand up the analytics and operations stack so every later phase has data. Cookie consent is the hard legal prereq before GA4 fires on EU/ES traffic. Lighthouse baseline must be captured before tracking scripts land.

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5A-01 | Capture Lighthouse mobile baseline (pre-tracking) | S | ⏳ | — | Run `npm run build && npx astro preview`, Lighthouse mobile preset against `/en/`, `/en/ai-trends`, `/en/blog/[any-slug]`. Save scores to `audits/lighthouse-baseline-2026-05.md`. **Must precede 5A-04.** |
| 5A-02 | Build cookie consent banner | M | ⏳ | — | Three-button consent (Accept all, Reject, Customize). Implement via Sanity-driven copy keys so it's i18n-aware out of the box. Store consent in a 1st-party cookie. Block GA4 init until granted. |
| 5A-03 | Verify Google Search Console + submit sitemap | S | ⏳ | — | DNS TXT verification (Cloudflare DNS), submit `https://aitokenglobal.com/sitemap.xml`. Confirm hreflang clusters are recognized. |
| 5A-04 | Wire GA4 with Consent Mode v2 | M | ⏳ | 5A-01, 5A-02 | Property + stream setup, GA4 tag in `BaseLayout.astro` gated on consent. Configure consent mode so anonymized hits fire pre-consent. Define initial event taxonomy (see 5A-05). |
| 5A-05 | Define + implement event taxonomy | M | ⏳ | 5A-04 | Events to fire: `outbound_click` (to aitokenking.com.tw), `pdf_download` (AI Trends PDF), `blog_read_75pct` (scroll milestone), `lang_switch`, `nav_open_mobile`, `faq_open`. Document in `docs/analytics/events.md`. |
| 5A-06 | Wire Cloudflare Web Analytics | S | ⏳ | — | Cloudflare token in `BaseLayout.astro`. No consent gate needed (privacy-friendly, no cookies). Serves as the always-on fallback if consent is refused for GA4. |
| 5A-07 | Build Sanity Studio dashboard widget | L | ⏳ | 5A-04, 5A-06 | Custom widget aggregating GA4 Data API + GSC API + CWA via a proxy (Cloudflare Worker or Amplify Lambda) since none are CORS-safe from browser. Widget shows: top pages 7d/30d, top queries 30d, conversion events 7d, traffic by language. |
| 5A-08 | Add Sanity → Amplify webhook | S | ⏳ | — | Outstanding from IMPLEMENTATION_PLAN Task #8. Sanity Studio → API → Webhooks → POST to Amplify build hook on publish of `_type in ["aiTrendsPage","post",...]`. Add 15-min debounce. |
| 5A-09 | Add AWS Budget alarm | S | ⏳ | — | Outstanding from Task #8. Alarms at $20 and $50 monthly thresholds → SNS → email. |
| 5A-10 | Stand up Decision Log (ADR format) | S | ⏳ | — | Create `docs/decisions/` folder, define ADR template (`0001-template.md`). Backfill 8–12 existing decisions: Astro+Sanity+Amplify stack, `[lang]` routing pattern, Portable Text for body, Make.com for blog import, etc. |
| 5A-11 | Weekly Sanity dataset backup | M | ⏳ | — | Outstanding from Task #11. GitHub Action runs Sunday 06:00 UTC, calls `sanity dataset export`, uploads artifact (or S3 if Amplify-region bucket exists). 90-day retention. |
| 5A-12 | Pre-commit secret block (Husky) | S | ⏳ | — | Outstanding from Task #11. Husky `pre-commit` hook scanning staged diff for `sk-...`, `AKIA...`, `mq3wxr8n` paired with literal strings, and `.env` filename. |

## 5A Claude Code prompts (ready to paste)

### Prompt 5A-01 — Lighthouse baseline

> I need to capture a Lighthouse mobile performance baseline before we add any tracking scripts.
>
> 1. Run `npm run build` and serve the result on localhost.
> 2. Use Puppeteer + the `lighthouse` npm package to run a mobile preset audit against three URLs:
>    - `http://localhost:4321/en/`
>    - `http://localhost:4321/en/ai-trends`
>    - `http://localhost:4321/en/blog/` (then pick the first blog post slug and audit that too)
> 3. Capture FCP, LCP, CLS, INP, TBT, Performance score, Accessibility score, SEO score, Best Practices score per URL.
> 4. Save a markdown report to `audits/lighthouse-baseline-2026-05.md` with one table per URL and a summary table aggregating averages.
> 5. Do NOT modify any site code — this is read-only measurement.

### Prompt 5A-02 — Cookie consent banner

> Build a cookie consent banner for AI Token Global.
>
> Requirements:
> - Three actions: Accept all, Reject non-essential, Customize.
> - Customize opens an inline panel with three toggles (Analytics, Marketing, Preferences). Essential is always on.
> - Copy lives in Sanity (new schema `cookieConsent` with fields per language). Banner reads copy via the existing GROQ fetcher pattern.
> - Persist consent in a 1st-party cookie `aitg_consent` (JSON: `{analytics: bool, marketing: bool, preferences: bool, ts: ISO}`), 12-month TTL.
> - Dispatch a custom event `aitg-consent-change` on grant/revoke so GA4 (5A-04) can react.
> - Mobile-first responsive per `CLAUDE.md` rules. Only animate `transform` and `opacity`.
> - Don't add it to `BaseLayout.astro` until I confirm the schema and copy land in Sanity first.

### Prompt 5A-04 — GA4 with Consent Mode

> Wire GA4 to AI Token Global with Google Consent Mode v2.
>
> 1. Add GA4 tag to `BaseLayout.astro` with `gtag('consent', 'default', {...})` set to denied for `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` BEFORE the GA4 config call. Use `wait_for_update: 500`.
> 2. Listen for `aitg-consent-change` (dispatched by 5A-02 banner). When `analytics: true` arrives, call `gtag('consent', 'update', {analytics_storage: 'granted'})`.
> 3. Implement event tracking for: `outbound_click` (all `<a>` with hostname !== aitokenglobal.com), `pdf_download` (any `<a>` href ending in `.pdf`), `blog_read_75pct` (IntersectionObserver on blog post `<article>` 75% mark), `lang_switch` (existing language switcher in `Nav.astro`), `nav_open_mobile`, `faq_open` (existing `window.toggleFaq()`).
> 4. GA4 Measurement ID lives in `PUBLIC_GA4_MEASUREMENT_ID` env var. Add to `.env.example` and Amplify Console.
> 5. Document the event taxonomy in `docs/analytics/events.md` with one row per event: name, trigger, params, business question it answers.

### Prompt 5A-07 — Sanity Studio dashboard widget

> Build a custom Sanity Studio dashboard widget that aggregates analytics inside the Studio.
>
> Data sources (all server-side via a proxy — none are CORS-safe from browser):
> - GA4 Data API (top pages 7d/30d, conversion events 7d, traffic by language)
> - Google Search Console API (top queries 30d, top landing pages 30d, impressions/clicks trend)
> - Cloudflare Web Analytics GraphQL API (pageviews, top countries — fallback when GA4 consent is low)
>
> Build the proxy as a Cloudflare Worker (preferred — same-vendor as our CDN) at `analytics-proxy.aitokenglobal.com`. Worker holds the service-account credentials and exposes three GET endpoints: `/ga4`, `/gsc`, `/cwa`. Restrict CORS to `https://aitokenglobal.sanity.studio`.
>
> In `studio/`, create `studio/widgets/AnalyticsWidget.tsx` that renders three cards (Top Pages, Top Queries, Traffic by Lang) with simple bar/list visualizations. Register it in `sanity.config.ts` as a dashboard tool.
>
> Auth model: editors are already authenticated to Studio; widget calls proxy with a short-lived signed token derived from the Studio user session. Document the auth flow in `docs/analytics/sanity-widget-auth.md`.

### Prompt 5A-10 — Decision Log scaffolding

> Set up an Architecture Decision Record (ADR) system for AI Token Global.
>
> 1. Create `docs/decisions/` and a template at `docs/decisions/0000-template.md` with sections: Status, Context, Decision, Consequences, Date, Supersedes.
> 2. Backfill the following decisions as ADRs 0001–0012 (one file each). For each, write the Context (what problem we were solving), Decision (what we chose), and Consequences (what tradeoffs we accepted). Pull facts from `summary.md` and the audit docs:
>    - 0001 Astro as the static framework
>    - 0002 Sanity as the headless CMS (project mq3wxr8n)
>    - 0003 AWS Amplify for hosting
>    - 0004 `[lang]` dynamic routing with `SUPPORTED_LANGS` constant
>    - 0005 Portable Text for body content (vs. markdown)
>    - 0006 Make.com for blog post import pipeline
>    - 0007 EN+ES as launch language pair
>    - 0008 Kanit + Plus Jakarta Sans typography pairing
>    - 0009 Brand color #6155F1 + design system in global.css
>    - 0010 Sanity-first content policy (no hardcoded English in .astro)
>    - 0011 Mobile-first responsive system (post Task #0f)
>    - 0012 Centralized translation pipeline via translate-page.mjs
> 3. Add an index README at `docs/decisions/README.md` listing all ADRs with date + one-line status.

---

# Section 5B — Component Fidelity Pass

**Goal:** Close the drift between archived HTML prototypes (`archive/`) and the current Astro implementation, so the codebase is clean before we replicate into zh-CN/id-ID. Audit first, then fix the punch list, then visual-regression baseline.

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5B-01 | HTML prototype ↔ Astro diff audit | M | ⏳ | — | Per-page comparison: load each `archive/*.html` and the equivalent `/en/<page>` side-by-side in Puppeteer. Capture DOM/style/spacing differences. Output: `audits/prototype-fidelity-2026-05.md` with one section per page and a numbered punch list of intentional vs. unintentional drift. |
| 5B-02 | Triage the punch list | S | ⏳ | 5B-01 | Antonio reviews each item: **keep current** (intentional change post-prototype), **fix to match prototype** (drift), or **defer** (out of scope for fidelity). Outcome: tagged list. |
| 5B-03 | Fix prioritized drift items (Batch 1: above-the-fold/hero) | M | ⏳ | 5B-02 | Hero sections across all 13 pages — biggest visual impact, sets brand expectations. |
| 5B-04 | Fix prioritized drift items (Batch 2: cards/CTAs/sections) | M | ⏳ | 5B-02 | Card grids, CTA blocks, section transitions. |
| 5B-05 | Fix prioritized drift items (Batch 3: footer/nav/secondary) | S | ⏳ | 5B-02 | Footer, nav, breadcrumbs, secondary nav. |
| 5B-06 | Set up Puppeteer visual regression baseline | M | ⏳ | 5B-03, 5B-04, 5B-05 | Script captures full-page screenshot of each `/en/<page>` and `/es/<page>` at mobile (390px) and desktop (1440px). Stores under `tests/visual-baseline/`. Run on every PR going forward; fail CI on >1% pixel diff. |

## 5B Claude Code prompts

### Prompt 5B-01 — Fidelity audit

> I need a fidelity audit comparing my archived HTML prototypes (`archive/*.html`) against the current Astro EN implementation.
>
> Method:
> 1. Start the Astro dev server (`npm run dev` → port 4321). Use the existing `serve.mjs` at the repo root to serve `archive/` on port 3000.
> 2. For each prototype HTML file in `archive/` that has an Astro equivalent, use Puppeteer to:
>    - Load both URLs at 1440×900 desktop and 390×844 mobile.
>    - Capture full-page screenshots, side by side, into `audits/prototype-fidelity-screenshots/<page>/`.
>    - Diff key DOM/style attributes programmatically: heading text + size + weight + line-height, card padding + gap + border-radius + shadow, button label + bg + border-radius, image aspect ratio, section background color.
>    - Record link href differences (prototype likely has placeholder anchors; Astro uses real routes).
> 3. Build a markdown report at `audits/prototype-fidelity-2026-05.md` with:
>    - One section per page.
>    - Numbered punch list of differences. For each: **what differs**, **where in the code** (file:line of the Astro component), **likely cause** (intentional / drift / unknown).
>    - Summary at top: total pages audited, total differences, count of likely intentional vs likely drift.
> 4. Do NOT fix anything — this is observation only. I'll triage the list and create fix tasks separately.
>
> If a prototype has no clear Astro equivalent (e.g., legacy variant), note it and skip.

---

# Section 5C — ES Blog Automation

**Goal:** Productize the blog translation pipeline so each batch of EN posts auto-generates ES drafts ready for human review. Adapts existing `translate-page.mjs` rather than introducing new tooling.

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5C-01 | Audit `translate-page.mjs` for post-shape compatibility | S | ⏳ | — | Map current page schema vs `post.ts` schema. Identify fields that need different handling: `slug` (must regenerate per language), `category` (map EN slug → ES slug), `coverImage.alt` (translate), `body` (Portable Text — existing pipeline handles). Document deltas. |
| 5C-02 | Build `scripts/translate-post.mjs` | M | ⏳ | 5C-01 | Forks `translate-page.mjs`. Accepts `--source-doc-id` and `--target-lang`. Reads source post from Sanity, generates translated draft, writes back as `_id: drafts.<newId>`, `language: <target>`, `translatedFrom: <sourceId>`. Slug regenerated via slugify on translated title. Cover image reused with translated alt. |
| 5C-03 | Build batch runner `scripts/translate-post-batch.mjs` | S | ⏳ | 5C-02 | Reads a JSON list of source post IDs, calls `translate-post.mjs` for each, writes a manifest of generated drafts to `scripts/data/translation-batch-<date>.json` for the review step. |
| 5C-04 | Document the human review checklist | S | ⏳ | 5C-02 | `docs/pipelines/blog-translation-review.md`: open draft in Studio → verify title, slug, category, first paragraph, FAQ/CTA blocks → spot-check 2–3 body paragraphs → check cover image alt → publish. Target: ~10 min per post. |
| 5C-05 | Run Batch 1: translate existing 10 EN posts to ES | M | ⏳ | 5C-03, 5C-04 | First batch is the validation. Capture review-time-per-post for sizing future batches. Log any translation quality issues for prompt tuning. |
| 5C-06 | Frontend wiring: blog category filter tabs (Task #13 from old plan) | M | ⏳ | — | `category` field already in Sanity; index page `/[lang]/blog` needs filter tabs UI. Mobile-first, sticky on scroll, accessible (radio-group ARIA). Parallel-safe with 5C-01–5C-05. |
| 5C-07 | Define Batch 2 source criteria | S | ⏳ | 5C-05 | Decision: next 10 posts come from which topic cluster on aitoken.com.tw? Cluster decision feeds 5G (content planning). |
| 5C-08 | Run Batch 2 import (EN) + translate (ES) | M | ⏳ | 5C-07 | Existing Make.com scenario does EN import; 5C-03 batch runner does ES. Document end-to-end runbook. |
| 5C-09 | Add ES translation review to weekly cadence | S | ⏳ | 5C-08 | Calendar/recurring task: review pending ES drafts every Friday. |

## 5C Claude Code prompts

### Prompt 5C-02 — translate-post.mjs

> Build `scripts/translate-post.mjs` for blog post translation.
>
> Start from `scripts/translate-page.mjs` (working translation pipeline for page singletons). Fork it; do not modify the original.
>
> Differences from page translation:
> 1. Source document type is `post` (see `studio/schemas/post.ts`).
> 2. `slug.current` must be regenerated for the target language via `slugify(translatedTitle, {lower: true, strict: true})`.
> 3. `category` is a string slug — map via a lookup table at the top of the script:
>    ```js
>    const CATEGORY_MAP = {
>      es: { 'getting-started': 'primeros-pasos', 'api-guides': 'guias-api', ... }
>    };
>    ```
>    Document the table; ask me to fill in the slugs for all categories present in Sanity before running.
> 4. `coverImage.alt` translates; the image asset reference is reused.
> 5. `body` is Portable Text — reuse the existing block-traversal logic from `translate-page.mjs`.
> 6. `faqItems` array — translate each item's `question` and `answer`.
> 7. Output is written to Sanity as a draft: `_id` = `drafts.${nanoid()}`, `language` set to target, `translatedFrom` set to source `_id`. Don't auto-publish.
>
> CLI: `AI_TOKEN_KING_KEY=sk-... node scripts/translate-post.mjs --source <postId> --target es`. Print the new draft's `_id` and a Studio URL to it on success.
>
> Use `claude-sonnet-4.6` (note the dot — aggregator format) via the AI Token King API, same as `translate-page.mjs`.

### Prompt 5C-03 — Batch runner

> Build `scripts/translate-post-batch.mjs` that wraps `translate-post.mjs`.
>
> CLI: `AI_TOKEN_KING_KEY=sk-... node scripts/translate-post-batch.mjs --input batch.json --target es`.
>
> `batch.json` shape: `[{sourceId: "abc123", note?: "optional"}, ...]`.
>
> For each item:
> 1. Spawn `translate-post.mjs` as a subprocess.
> 2. Capture the resulting draft `_id`.
> 3. Append to a manifest at `scripts/data/translation-batch-<ISO-date>.json` with `{sourceId, targetDraftId, targetLang, status: 'pending-review' | 'failed', error?, ts}`.
> 4. If any single post fails, log and continue — do not abort the batch.
>
> Print a summary at the end: `N translated, M failed, manifest at <path>`.
>
> Add basic concurrency (max 3 parallel) to keep API load reasonable.

---

# Section 5D — Add zh-CN (Simplified Chinese)

**Goal:** Add Simplified Chinese as language 3, specifically chosen to stress-test the framework on CJK fonts, character density, hreflang, and JSON-LD locale formats before extracting the reusable starter (5E).

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5D-01 | Verify Kanit + Plus Jakarta Sans CJK fallback | S | ⏳ | — | Neither Kanit nor Plus Jakarta Sans has Simplified Chinese glyph coverage. Pick a CJK display face (Noto Sans SC for body) and decide whether headings use Noto Sans SC bold or a CJK display face like ZCOOL or Long Cang. Document choice in an ADR. |
| 5D-02 | Add zh-CN to `SUPPORTED_LANGS` + `LANG_META` | S | ⏳ | 5D-01 | One-line constant change in `src/i18n/index.ts`. Add `locale: 'zh-CN'`, `dir: 'ltr'`, `displayName: '简体中文'`. |
| 5D-03 | Translate UI strings to `src/i18n/zh-CN.json` | M | ⏳ | 5D-02 | ~60+ keys. Use Claude via translate pipeline OR human translator. Term consistency matters — do a glossary pass first (e.g., "token" → 令牌 or transliterate "代币" — pick one and document). |
| 5D-04 | Glossary + style guide for zh-CN translations | S | ⏳ | — | `docs/translation-style/zh-CN.md`: 15–25 key term mappings, tone (formal/informal, mainland vs. cross-strait), do/don'ts. Distinct from zh-TW (don't treat as a script conversion). |
| 5D-05 | Translate all 13 page documents to zh-CN via pipeline | L | ⏳ | 5D-03, 5D-04 | Run `translate-page.mjs --target zh-CN` for each page. Human review per page. Adjust prompt with glossary context. |
| 5D-06 | Translate first 10 blog posts to zh-CN | M | ⏳ | 5C-02, 5D-04 | Run `translate-post-batch.mjs --target zh-CN`. Human review. |
| 5D-07 | Per-locale OG image for zh-CN | S | ⏳ | 5D-02 | Generate `/og-zh-CN.png` with translated headline. Hook into `BaseLayout.astro` OG tag emission per locale. |
| 5D-08 | Update language switcher visual + sort order | S | ⏳ | 5D-02 | With three languages the switcher may need a different layout. Test on mobile. |
| 5D-09 | Submit zh-CN sitemap to GSC + Baidu Webmaster | S | ⏳ | 5D-05 | Baidu has its own webmaster console — register and submit. |
| 5D-10 | Capture framework gaps surfaced by zh-CN | S | ⏳ | 5D-05 | Running journal `docs/framework-gaps-zh-CN.md`: any pattern, file, or assumption that broke. Feeds 5E extraction. |

## 5D Claude Code prompts

### Prompt 5D-01 — Font verification

> I'm adding Simplified Chinese (zh-CN) as language 3 for AI Token Global. Neither Kanit (current heading font) nor Plus Jakarta Sans (current body font) covers CJK glyphs. I need to pick a CJK fallback that visually integrates with the existing design system.
>
> Tasks:
> 1. Render a sample zh-CN page section (heading + body + button + card text — invent reasonable copy about AI tokens) using each of these CJK fonts: Noto Sans SC, ZCOOL XiaoWei, Long Cang, Noto Serif SC, Source Han Sans SC. Use Puppeteer to load a test HTML page with each font from Google Fonts and screenshot the result.
> 2. Compare against the existing EN/ES design at the same section width — do shapes, weights, and spacing feel consistent?
> 3. Save screenshots to `temporary screenshots/cjk-font-test/` numbered per option.
> 4. Write a recommendation memo at `docs/translation-style/zh-CN-font-decision.md` with: which face for headings, which for body, fallback CSS stack, font-weight mapping (Kanit 700 → CJK <what>?), and notes on character-density compensation (CJK rendered at the same px is visually larger — may need `font-size: 0.95em` adjustment).
> 5. Do NOT yet modify `BaseLayout.astro` or `global.css` — I'll review the recommendation first.

---

# Section 5E — Framework Extraction (aitoken-framework-starter)

**Goal:** With zh-CN proving the pattern works on CJK, extract the reusable parts into a starter repo so future projects (or further internal expansion) get a clean, opinionated foundation. Also: write ADRs and a setup guide.

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5E-01 | Define starter scope | S | ⏳ | 5D-10 | What's in scope: Astro scaffold, Sanity schema base (`post`, `faqItem`, `imageMeta`, `seo` base), i18n harness (`SUPPORTED_LANGS`, `LANG_META`, `useTranslations`), `translate-page.mjs` + `translate-post.mjs`, design system (`global.css` with mobile-first breakpoints), Nav/Footer components, BaseLayout with SEO meta/hreflang/OG, GA4+consent skeleton, ADR template, `amplify.yml`. **Out of scope:** AI Token brand assets, AI Token content, AI Token analytics IDs. |
| 5E-02 | Create `aitoken-framework-starter` repo | S | ⏳ | 5E-01 | New private GitHub repo. Skeleton README with one-paragraph description. |
| 5E-03 | Strip + copy code into starter | M | ⏳ | 5E-02 | Copy in-scope files from `aitokenglobal`. Replace brand assets with `framework-starter` placeholder. Replace AI Token content with Lorem Ipsum. Genericize copy in i18n JSONs ("Project Name" instead of "AI Token Global"). |
| 5E-04 | Parameterize via `framework.config.js` | M | ⏳ | 5E-03 | Top-level config: `brandName`, `primaryColor`, `accentColor`, `headingFont`, `bodyFont`, `supportedLanguages`, `sanityProjectId`. Build step substitutes into the appropriate places. |
| 5E-05 | Write `SETUP.md` | M | ⏳ | 5E-04 | 5-step setup: clone, run `npm run init` (prompts for config), create Sanity project, set env vars, deploy. Target: fresh project to "Hello World on Amplify" in under 1 hour. |
| 5E-06 | Write `ARCHITECTURE.md` | S | ⏳ | 5E-03 | One-page overview: what the framework is, what choices are locked in, what's customizable, the i18n model, the content model. |
| 5E-07 | Migrate ADRs (5A-10) into starter | S | ⏳ | 5A-10, 5E-03 | Copy `docs/decisions/` into the starter as the design-decision baseline. Mark which ADRs are "framework-locked" vs "project-can-override". |
| 5E-08 | Validate starter with a throwaway test project | M | ⏳ | 5E-05 | Run through SETUP.md end-to-end on a clean machine. Capture pain points. Iterate on docs. |
| 5E-09 | Tag starter v0.1.0 | S | ⏳ | 5E-08 | First versioned release. |

---

# Section 5F — Add id-ID (Indonesian)

**Goal:** Validate the new framework by using it (not the legacy aitokenglobal repo patterns) to add Indonesian as language 4. Indonesian is Latin-script and Spanish-similar, so it's a fast follower after zh-CN's stress test.

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5F-01 | Glossary + style guide for id-ID | S | ⏳ | — | `docs/translation-style/id-ID.md`. Indonesian formal vs. informal, English loanword preference (typically high for tech). 15–25 key terms. |
| 5F-02 | Add id-ID to `SUPPORTED_LANGS` + `LANG_META` | S | ⏳ | — | One-line constant change. `locale: 'id-ID'`. |
| 5F-03 | Translate UI strings to `src/i18n/id-ID.json` | M | ⏳ | 5F-01, 5F-02 | ~60+ keys. |
| 5F-04 | Translate all page documents to id-ID | L | ⏳ | 5F-03 | Pipeline run + human review. |
| 5F-05 | Translate first 10 blog posts to id-ID | M | ⏳ | 5C-02, 5F-01 | Pipeline run + human review. |
| 5F-06 | Per-locale OG image + sitemap submission | S | ⏳ | 5F-04 | OG image, GSC submission. Indonesia uses Google primarily — no separate engine like Baidu. |
| 5F-07 | Capture starter improvements from id-ID experience | S | ⏳ | 5F-04 | Anything that surfaced as friction → file as issue against starter repo for next version. |

---

# Section 5G — Content Planning

**Goal:** With analytics baseline in place (5A) and pipeline productized (5C), drive content priority from data instead of intuition. Build an editorial system, not just a calendar.

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5G-01 | GSC + GA4 data pull: what's already working | S | ⏳ | 5A-03, 5A-04 | After 30 days of data: top 20 landing pages, top 20 queries, click-through-rate distribution. Anchors prioritization. |
| 5G-02 | Topic-cluster map | M | ⏳ | 5G-01 | Map existing 13 pages + 10 EN posts to 4–6 pillar clusters (e.g., "AI APIs", "Tokenomics & Costs", "Compliance", "Practical Use Cases"). Identify white-space clusters. |
| 5G-03 | Internal linking audit + plan | M | ⏳ | 5G-02 | Crawl current site, log link graph. Identify orphan pages, missing cluster→pillar links. Produce a 50–100 internal-link punch list per language. |
| 5G-04 | 60-day editorial calendar | M | ⏳ | 5G-02 | 8–12 posts per language. Each entry: pillar cluster, target query, target word count, due date, source on aitoken.com.tw if any. |
| 5G-05 | Refresh cadence for time-sensitive pages | S | ⏳ | — | API pricing pages (chatgpt-api, claude-api, gemini-api) drift quarterly. AI trends drifts monthly. Set Asana recurring tasks. |
| 5G-06 | E-E-A-T signaling | M | ⏳ | — | Author bios in Sanity schema (new `author` document). Add author byline + bio to blog post template. Add `/about` and `/authors` pages. Schema.org `Person` JSON-LD per author. Material for AI-topic content trust signals. |
| 5G-07 | Newsletter / lead capture | M | ⏳ | 5A-02 | Email capture (ConvertKit / Buttondown / similar — decision TBD). Inline form on blog posts and footer. Consent-aware. |

---

# Section 5H — Marketing Planning

**Goal:** Distribute existing and new content across channels chosen on the basis of audience fit (developers + business decision-makers interested in AI). Measure with 5A baseline.

| ID | Task | Effort | Status | Depends on | Notes |
|---|---|---|---|---|---|
| 5H-01 | Channel strategy memo | M | ⏳ | 5A-04 | One-page memo: which 2–3 channels we go deep on. Candidates: LinkedIn (B2B AI buyers), Reddit (`/r/LocalLLaMA`, `/r/MachineLearning`), X/Twitter (AI dev community), Hacker News (long-form), Substack cross-posts, partnerships with AI tool aggregators. Decide on 2–3. |
| 5H-02 | Repurposing plan for existing 10 posts | M | ⏳ | 5H-01 | Per post: which channel, what format (carousel, thread, comment), when. Outcome: 30-day distribution schedule. |
| 5H-03 | Backlink + outreach plan | M | ⏳ | 5G-02 | 20–30 target sites for outreach (AI directories, Spanish-language tech blogs for ES, dev tool comparison sites). Cold email template. Track in Asana. |
| 5H-04 | Cross-language marketing | M | ⏳ | 5D-05, 5F-04 | Localize promotional assets per language. Decide whether to run separate LinkedIn / X handles per language or one multilingual handle. |
| 5H-05 | Partnership outreach: aitokenking.com.tw cross-promotion | S | ⏳ | — | Coordinated cross-linking with the Taiwan source site. Mutual blog post links, audience swap. |
| 5H-06 | Measurement dashboard for marketing | S | ⏳ | 5A-07 | Extend the Sanity widget (5A-07) with a "Marketing" tab: traffic by source, channel ROI, post-promo lift. |

---

# Backlog — Outstanding from `IMPLEMENTATION_PLAN.md`

Items not yet folded into a Phase 5 section but still owed. Run on their own cadence when there's slack between phases.

| ID | Task | Effort | Status | Origin |
|---|---|---|---|---|
| BL-01 | Astro `<Image>` migration for all `<img>` tags | L | ⏳ | Task #9 / Q-13 / S-17 |
| BL-02 | Tailwind CDN → build-step migration | M | ⏳ | Task #9 / Q-15 |
| BL-03 | Google Fonts: replace `@import` with preconnect | S | ⏳ | Task #9 / S-13 / Q-14 |
| BL-04 | JSON-LD: `Article` on blog posts | M | ⏳ | Task #9 / S-10 |
| BL-05 | JSON-LD: `FAQPage` on AI Trends + guides with FAQ | M | ⏳ | Task #9 / S-11 |
| BL-06 | JSON-LD: `Organization` site-wide | S | ⏳ | Task #9 / S-12 |
| BL-07 | JSON-LD: `BreadcrumbList` on deep pages | M | ⏳ | Task #9 / S-15 |
| BL-08 | Per-page language switcher equivalence | M | ⏳ | Task #10 / S-14 |
| BL-09 | Fill `aiTrendsPage.downloadUrl` (EN + ES) | S | ⏳ | summary.md gaps |
| BL-10 | Replace hard-coded `https://aitokenglobal.com` in blog slug page with `Astro.site` | S | ⏳ | F-08 |
| BL-11 | Document `imageMeta.ts` extending `sanity.imageAsset` (Sanity-major-upgrade risk note) | S | ⏳ | Task #11 / D-10 |
| BL-12 | Privacy / Terms footer pages (currently dead `href="#"`) | M | ⏳ | F-09 |

---

# Asana import notes

When pasting into Asana:
- **Sections:** 5A → 5H plus Backlog. One per Asana section.
- **Tasks:** one per row in each section table. Task name = the `Task` column. Description = the `Notes` column expanded.
- **Subtasks:** for tasks with embedded Claude Code prompts, paste the prompt as the first subtask (one large subtask) named "Claude Code prompt — paste into VS Code". For tasks without prompts, add subtasks ad-hoc.
- **Custom fields:** create `Effort (S/M/L)`, `Phase (5A–5H/BL)`, `Status`. Map from this doc.
- **Dependencies:** Asana supports task-level dependencies — set them using the `Depends on` column. Use the task IDs (`5A-04`, etc.) as a search key.
- **Owner roles:** `exec`/`review`/`manual` from this doc can become an Asana tag.

---

*This plan supersedes the queue at the top of `summary.md` and the queue in `audits/IMPLEMENTATION_PLAN.md`. Update this file as Phase 5 tasks complete; archive when Phase 5 closes.*
