# Task 3: Tweak and Polish Static Pages

## Goal
Compare every Astro page against its archive HTML reference (`archive/`) and fix inconsistencies — layout, styling, hardcoded text, missing elements, hover effects, animations. The archive files are the design standard.

## Branch
`levii/tweak-polish-static-pages`

## Key Lessons Learned
- NEVER do high-level scans. Compare every inline style value, every element, every hover effect line by line.
- PortableText renders its own `<p>` tags — don't wrap `pt()` output in `<p>`, use `<div>` instead.
- Whitespace between `<span>` elements matters for word-breaking — put each on its own line.
- Always build (`npm run build`) and verify after changes.
- Check ripple effects: i18n key sync, language-setup agent compatibility, Footer/global.css affect all pages.

---

## Pages Status

### 1. Homepage (`index.astro`) — DONE
**Commit:** `1c51b30`

**Issues found and fixed:**
- Blog section was entirely hardcoded placeholders → replaced with dynamic Sanity posts via `getAllPosts(lang)`
- Newsletter CTA section was missing → added as visual placeholder (form doesn't submit yet)
- Gemini logo SVG was wrong shape (pointy diamond) → replaced with proper Google sparkle path
- Token explainer 2nd paragraph: nested `<p>` inside `<p>` broke text wrapping → changed outer to `<div>`
- Token breakdown spans had no whitespace between them → put each span on own line for word-breaking
- Footer missing social media icons → added Twitter/LinkedIn with hover effects
- Footer link colors too light (#999/#888) → darkened to match archive (#666/#555)
- Animation delays wrong (0.08s-0.32s) → matched archive values (0.05s-0.26s)
- Nav link padding too narrow (0.5rem) → widened to archive value (0.75rem)
- API chooser cards missing hover lift effect → added CSS hover with translateY(-4px)
- API card link arrows missing gap animation on hover → added CSS gap transition
- FAQ chevron rotation timing wrong (0.25s) → matched archive (0.3s)
- Step link ghost buttons had lopsided hover background (padding-left: 0) → removed override for even padding
- `tokenBody2Fallback` was plain text → now renders HTML with bold tags via `set:html`
- Added 7 new i18n keys across en/es/id (tokenBody2Fallback + 6 newsletter keys)

**Not changed (intentional):**
- FAQ animation technique (Astro uses display:block, archive uses max-height) — Astro's is better for accessibility
- `.reveal` scroll animation classes — Astro improvement over archive
- Grid class names (.topics-grid, .steps-grid, etc.) — needed for responsive breakpoints
- `flex-wrap: wrap` on stats row — prevents mobile overflow
- Comparison table data (model names/prices) — same in all languages, matches archive

### 2. Beginners Guide (`beginners-guide.astro`) — DONE

**Issues found and fixed:**
- Section h2s were plain text → added 48px gradient icon boxes with SVGs next to each h2 (checkmark, warning, question, book)
- Step cards were flat `card-elevated` blocks → added numbered circles (40px, gradient bg), colored left borders (#6155F1/#3E81E5/#0ABFBC), flex layout with number on left
- Step label + link colors were all #6155F1 → now color-coded per step matching archive
- "Where Beginners Get Stuck" callouts had flat 0.08 opacity bg + full 1px border → changed to gradient bg (0.05→0.02), left-only 3px border, colored Kanit titles
- Callouts + body text were separate elements → wrapped inside one white card container matching archive
- Callout body text was 0.95rem/1.8 → fixed to 0.875rem/1.65 to match archive via `.callout-block` scoped style
- Next Reads used 3-column grid of simple cards → changed to vertical list with 36px icon boxes (per-card colors), title+excerpt, and arrow icons
- Closing CTA had only one button → added second "Explore Use Cases" `btn-secondary` button with white border/text
- Closing CTA missing second decorative circle → added bottom-left circle (200px, rgba(255,255,255,0.04))
- Sidebar had only 2 items → added "Quick Tip" card (3rd item) with tip text
- Sidebar CTA gradient was `linear-gradient(40deg, #2A1F5C, #0D1547)` → fixed to `linear-gradient(135deg, #6155F1, #3E81E5)` matching archive
- Sidebar CTA text changed from generic pricing copy to archive's "understand basics → compare models" messaging
- Sidebar CTA button text changed from "Compare Models" to "View Model Overview" matching archive
- Hero label icon was a star SVG → changed to simple circle matching archive
- `pt()` strong color was #1C1C1C → changed to #3C315B matching archive
- `.prose-article strong` color was #1C1C1C → changed to #3C315B
- `.toc-link` was missing `.active` state → added `background: #E2DFFE; color: #6155F1; font-weight: 600`
- `.toc-link` styles didn't match archive sidebar-link → updated font-size (0.855rem), padding (0.5rem 0.875rem), border-radius (8px), color (#555)
- First TOC link didn't start with active class → added `active` class to first link
- Removed `.reads-grid` responsive override (no longer needed with flex column layout)
- Added 4 new i18n keys across en/es/id: `viewModelOverview`, `quickTipTitle`, `quickTipBody`, `exploreUseCases`
- Updated 2 existing i18n keys across en/es/id: `sidebarCtaTitle`, `sidebarCtaBody` to match archive wording

**Not changed (intentional):**
- FAQ uses `window.toggleFaq()` / `.faq-question` / `.faq-answer` classes from global.css instead of archive's inline FAQ JS — Astro's shared system is better
- `.reveal` scroll animation classes — Astro improvement over archive
- 900px breakpoint for layout collapse — matches project responsive system
- Portable Text rendering for Sanity content — dynamic vs archive's hardcoded text

### 3. AI Trends (`ai-trends.astro`) — DONE

**Issues found and fixed:**
- Hero first subtitle color was `rgba(255,255,255,0.85)` with `font-weight:500` → fixed to `rgba(255,255,255,0.7)` with default weight to match archive
- Hero second subtitle (`.hero-subtitle2 p`) color was `rgba(255,255,255,0.7)` with `font-weight:500` → fixed to `rgba(255,255,255,0.5)` with default weight to match archive
- Download CTA was an elaborate card with icon box, title+meta, and arrow (`.cta-download`) → replaced with simple inline `.btn-download` button matching archive (bg: #F5F2FF, border: #E2DFFE, 12px radius)
- Removed all `.cta-download*` CSS classes, added `.btn-download` CSS matching archive's button style

**Not changed (intentional):**
- Animation delay values (global.css uses 0.05/0.12/0.19s vs archive's 0.07/0.14/0.21s) — global values were tuned in homepage pass, shared across all pages
- `intro-grid` class name vs archive's `hero-inner` — same responsive behavior, more semantic name
- Trend card `display:flex;flex-direction:column` — Astro enhancement for consistent card heights
- Conditional FAQ section — only renders if Sanity has FAQ data (archive has none, section doesn't appear)
- PortableText rendering for Sanity-driven content vs archive's hardcoded text
### 4. API Compare (`api-compare.astro`) — DONE

**Issues found and fixed:**
- Hero layout was centered with `max-width: 760px` → changed to left-aligned with `max-width: 1200px` wrapper and `max-width: 720px` text column matching archive
- Type cards were in a separate section below hero with white project background → moved INSIDE hero (on the dark gradient), as `.section-anchor-card` elements
- Type cards had `border-radius: 20px`, no border, vertical icon-at-top layout → changed to 16px radius, `2px solid transparent` border (→ #6155F1 on hover), horizontal layout: gradient icon (48×48, 12px) + (Kanit 1.05rem title + small gray 0.75rem #999 subtitle) header, then description, then text-only btn-ghost CTA
- Type card icons were flat #F5F2FF with purple SVG → per-card gradient backgrounds (text=#6155F1→#3E81E5, image=#3E81E5→#56c7fd, video=#56c7fd→#6155F1) with white SVG strokes
- Type card subtitle was uppercase purple #6155F1 → changed to plain gray #999 0.75rem matching archive
- Type card CTA was an SVG arrow → changed to text-arrow `→` suffix (Sanity ctaLabel already contains `→`, so no JSX suffix added)
- Pricing callout was a light `banner-gradient` div with separate `btn-primary` → replaced with full clickable `<a class="pricing-callout-card">` using dark gradient `linear-gradient(135deg, #2A1F5C 0%, #0D1547 60%, #1a2a6c 100%)`, decorative radial blobs, translucent 52×52 icon with backdrop-blur, white Kanit title + cyan "Live" badge `rgba(86,247,253,0.2)`/#56F7FD, white "View Live Pricing" chip on right
- Pricing callout section padding was `0 1.5rem 3rem` → changed to `2.5rem 1.5rem 0` matching archive
- Page had no sidebar → added 240px sticky `aside.sidebar-col` with TOC links (per-section icons + count badges), Quick Tip box (#F5F2FF bg, 3px #6155F1 left border), and "Compare Prices" full-width btn-primary CTA
- Main content was full-width sections → wrapped in `compare-grid` with `grid-template-columns: 1fr 240px; gap: 3rem; max-width: 1200px`
- Model sections had plain h2 headers → added `.model-section-head` with 44×44 gradient icon-box + (h2 + gray 0.82rem #999 subtitle stacked)
- Model tables used HTML `<table class="compare-table">` with code-styled purple model names → replaced with div-grid `.model-row` (220px 1fr columns), 14px Plus Jakarta Sans weight 700 color #3C315B model names (no code/background), plus a `.model-table-header` row with uppercase "MODEL NAME / BEST FOR / USE CASE" 0.72rem 700 #999 labels
- FAQ was a separate centered section below content with no card → moved inside main column as `model-section` with icon-box (44×44 #E2DFFE with #6155F1 SVG) + h2 header and a `.card-elevated .faq-card` container (padding 0.5rem 2rem) wrapping all FAQ items
- FAQ chevron was 16px → upsized to 18px matching archive
- FAQ answer body was project default → scoped `.faq-answer-body` to font-size 0.9rem, line-height 1.75, color #666 with `:global(strong)` → #3C315B 700
- FAQ question prefix was added in JSX (`${idx + 1}.`) → removed; Sanity content already contains "1. ", "2. " etc. (was producing "1. 1. ..." double prefix)
- `pt()` strong color was #1C1C1C → changed to #3C315B matching archive ul/strong style
- Bottom CTA was dark `hero-bg` full-width section with centered text → replaced with light page bg containing a `.bottom-cta-card` (gradient #6155F1→#3E81E5→#56c7fd, border-radius 24px, padding 3rem), grid `1fr auto` layout with text left + 2 buttons right, decorative white radial blobs, white solid "View Pricing Table →" button and translucent border "Back to Home" button
- Added active TOC scroll-spy script (no max-height/width transitions — only adds/removes `.active` class)
- Added 4 new i18n keys across en/es/id: `tocFaqLabel`, `quickTipTitle`, `quickTipBody`, `comparePricesBtn`

**Not changed (intentional):**
- FAQ uses `window.toggleFaq()` / `.faq-question` / `.faq-answer` classes from global.css (display:none/block) instead of archive's max-height transitions — Astro's shared accessible system per CLAUDE.md responsive rules
- `.reveal` scroll animation classes — Astro improvement over archive
- 1024px breakpoint for sidebar collapse — matches project responsive system
- Portable Text rendering for Sanity content vs archive's hardcoded text
- Per-card icon gradients defined inline (data-driven from `card.icon` field) rather than 3 separate inline-styled SVGs in archive — same visual output, less repetition
### 5. ChatGPT API (`chatgpt-api.astro`) — DONE
### 6. Claude API (`claude-api.astro`) — COVERED BY SAME COMPONENT (pending Sanity content)
### 7. Gemini API (`gemini-api.astro`) — COVERED BY SAME COMPONENT (pending Sanity content)
*Pages 5-7 share `ApiModelPage.astro` component — one rewrite covers all three.*

**Issues found and fixed (`ApiModelPage.astro`):**
- Hero was a dark blob-gradient section with `.section-label` "API Guide" chip and a single 800px column → rewritten as a light overlay section (`linear-gradient(135deg,rgba(97,85,241,.08)→rgba(62,129,229,.06),#F5F2FF`) on a 1200px container, with an inner solid gradient card (16px radius, 2rem 2.5rem padding) wrapping h1+subtitle; removed goo blobs, fade-up on breadcrumb, and the API Guide chip
- Per-model hero accents updated: chatgpt = purple→blue, claude = teal→blue (`#2D8653→#3E81E5`), gemini = blue→purple (`#3E81E5→#6155F1`); each model also has matching translucent section overlay
- h1 was 44px clamp `-0.04em` mb 16px → 32px clamp `1.5rem,3vw,2rem`, `-0.03em`, mb 0.5rem
- Subtitle was 1.05rem rgba(0.75) lh 1.65 mw 560px → 0.925rem rgba(0.85) lh 1.7 mw 580px
- Breadcrumb colors were rgba(white) (for dark hero) → #999 with #6155F1 hover and #CCC chevrons; current-page span is #6155F1 600
- Breadcrumb final span was `page.heroHeadline` ("ChatGPT API Guide") → short label via new i18n key `chatgptApiShort` ("ChatGPT API")
- Layout wrapper was `.api-layout` 1fr 300px grid with `padding 3rem 1.5rem` → `.post-layout` 1fr 280px grid inside outer `padding 2.5rem 1.5rem 5rem`; breakpoint moved from 900px to 1060px (matches archive)
- Article body was using `.article-h2` scoped class with `1.5rem 700 -0.03em mb 0.875rem pb 0.625rem` + bottom 2px purple border → rewritten as `.article-body :global(h2)` with `1.4rem 800 -0.03em lh 1.2 mt 2.5rem mb 0.75rem pt 2rem` + top 1px rgba(97,85,241,0.1) border (first-child resets these)
- Added an `Overview` h2 (`{page.heroHeadline}`) at the top of the article (was missing → article started with prose body)
- Added `.article-body :global(h3)` for "Pricing Reference": Kanit 1.05rem 700 `-0.02em` mt 1.5rem mb 0.5rem
- Article paragraph was `0.975rem #3C315B lh 1.8 mb 1.125rem` → `0.95rem #444 lh 1.85 mb 1rem`
- Article li was `0.975rem #3C315B lh 1.75 mb 0` → `0.95rem #444 lh 1.8 mb 0.3rem`
- `pt()` link/strong override styles removed (color/text-decoration moved into `.article-body :global(a/strong)` CSS so PortableText links no longer carry inline font-weight 600 or color attrs)
- Pricing reference card (`pricing-ref card-elevated` with purple dot label, divider, and "View full model comparison" link) → replaced with plain `<h3>Pricing Reference</h3>` + prose, matching archive's flat layout
- Further reading custom flex-row links (with arrow svgs and inline styles) → simple `<ul><li><a>` to flow through standard article-body styles
- FAQ was wrapped in a non-existent custom `.faq-card` styling → rewrote as inline `.faq-wrap` (1px rgba(97,85,241,0.1) top border) with `.faq-row` items (1px rgba(97,85,241,0.08) bottom border each; last has none); button styles scoped as `.faq-q` (0.925rem 600 padding 1.125rem 0); answer body 0.9rem #555 lh 1.8 pb 1.125rem
- FAQ classes were `.faq-question`/`.faq-answer` from global.css → renamed to `.faq-q`/`.faq-answer` so the page can scope its own padding/colors without colliding with shared global styles; reused `window.toggleFaq()` so behaviour stays identical
- Sidebar was `.api-sidebar` 300px w, top 80px → `.post-sidebar` 280px w, top 88px (matches archive)
- Sidebar TOC card was `card-elevated` (20px radius, dual shadow, 22px 24px padding) → `.sidebar-card` (white, 16px radius, 1.5rem padding, single shadow `0 2px 10px rgba(97,85,241,0.08)`)
- "On This Page" title was Kanit 0.875rem 700 #1C1C1C normal-case `letter-spacing: 0.01em` → 0.72rem 700 #6155F1 uppercase `letter-spacing: 0.07em` matching archive
- TOC links (`.toc-link`) were 0.825rem 500 #666 padding 0.3rem 0.5rem radius 6px → renamed `.sidebar-link`, sized 0.845rem 500 #666 padding 0.45rem 0.875rem radius 7px; active state bg #E2DFFE color #6155F1 weight 600
- First TOC link wasn't auto-active → added `active` class to "Overview" anchor + scroll-spy `IntersectionObserver` swaps active class as user scrolls (replacing earlier reliance on `.reveal` only)
- First TOC label was the same as breadcrumb ("ChatGPT API") → uses new `apiModel.tocOverview` i18n key ("Overview")
- "Compare All Models" sidebar CTA was using the dark hero gradient + standard `.btn-primary` (purple solid) → uses per-model `cardBg` gradient (matching archive's gradient card) with 16px radius 1.5rem padding; button styles inlined as `.sidebar-cta-btn` (translucent rgba(255,255,255,0.2) bg, 1px solid rgba(255,255,255,0.35) border, no shadow)
- "Compare All Models" body text key updated across en/es/id: "Full live pricing for 60+ models" → "See ChatGPT, Claude, and Gemini side-by-side on pricing, context window, and use case fit"
- "View All Models" button label key updated across en/es/id: "View All Models" → "View Full Comparison" (matches archive's CTA copy)
- "Also Compare" card was `card-elevated` 22px 24px padding → `.sidebar-card-tight` 16px radius 1.375rem padding single shadow
- "Also Compare" title was 0.875rem #1C1C1C normal case → 0.75rem #3C315B uppercase letter-spacing 0.04em
- "Also Compare" links were pill-style chips with bg #F5F2FF padding 0.625rem 0.875rem radius 10px and uniform #3C315B color → plain inline links 0.85rem 600 no padding/bg, with per-model colors hardcoded in `ALSO_COMPARE_COLOR` map (chatgpt page → claude=#6155F1, gemini=#3E81E5; claude page → chatgpt=#6155F1, gemini=#3E81E5; gemini page → chatgpt=#6155F1, claude=#2D8653); gap animation `0.375rem ↔ 0.625rem` on hover
- "Also Compare" link labels were "Claude API"/"Gemini API" → use new i18n keys `claudeApiGuide`/`geminiApiGuide` etc. ("Claude API Guide" / "Guía de la API de Claude" / "Panduan API Claude")
- BaseLayout `activePage` was `${modelSlug}-api` (no matching nav link, so no active highlight) → `"api-compare"` so the top nav "Compare Models" link highlights, matching archive
- Added 7 new i18n keys across en/es/id: `chatgptApiShort`, `claudeApiShort`, `geminiApiShort`, `chatgptApiGuide`, `claudeApiGuide`, `geminiApiGuide`, `tocOverview`
- Updated 2 existing i18n keys across en/es/id: `compareAllModelsBody`, `viewAllModelsBtn`

**Not changed (intentional):**
- Claude/Gemini Sanity content doesn't exist yet → both pages redirect to `/${lang}/`. Component rewrite already covers them; only Sanity content needs to be authored. ChatGPT was used as the canonical verification page since it's the only one with data.
- `pricingReference` content in Sanity for chatgpt-api lacks `<strong>` markup on model names (archive bolds "GPT-4o:", "GPT-4o mini:" etc.) — this is a content authoring gap, not a styling issue; the prose-article CSS handles `strong` correctly when present
- Sidebar TOC labels in archive used shorter custom strings ("Common Use Cases", "How Pricing Works", "Who It's For", "Comparison Tips") that differ from h2 text — Astro uses the Sanity `whatIsTitle` etc. (same as h2 text) since the schema has no separate sidebar-label fields; adding them would require schema changes out of scope here
- Section IDs differ for some sections (archive: `#who-fits`, `#comparison-tips`; Astro: `#unique-section`, `#comparing`) — internal anchors stay consistent across the Astro site; visible TOC behaviour is identical
- Top-nav `.nav-link.active` background is `#E2DFFE` in `global.css` (matches every other Astro page and the api-compare archive), whereas chatgpt-api archive uses a slightly lighter `#EDE9FF` — the archive is internally inconsistent; we keep the project-wide global value
- Specific Sanity content text differs from archive (e.g., archive links "AI Token Basics" vs Astro's "What is an AI Token?") — content delta, not a styling issue
- Reveal animation classes (`.reveal`) — Astro improvement over archive's `.fade-up`-only scheme
### 8. Compliance (`compliance.astro`) — DONE

**Issues found and fixed:**
- Breadcrumb was 2-level (Home → heroHeadline) → expanded to 3-level (Home → AI Resources → Business AI Compliance) matching archive
- Hero was missing CTA buttons row → added "See the Solution" (btn-primary) + "View Enterprise Proposal" (btn-secondary, translucent white border/bg) with delay-3 fade-up
- Hero subtitle missing `margin-bottom: 0.625rem` → added so the CTA row sits at the archive's spacing
- BaseLayout was not receiving `activePage`/`activeDropdown` → set `activePage="compliance"` and `activeDropdown="resources"` so the top-nav dropdown highlights
- All 5 section H2s (blockers, solution, who, role, faq) were plain text → wrapped each in a `.section-head` flex row (gap 1rem) with a 48×48 `.cp-icon-box` (14px radius) carrying section-specific gradient + SVG:
  - blockers = `#F43F5E → #F59E0B` + warning triangle
  - solution = `#6155F1 → #3E81E5` + verified-badge check
  - who = `#3E81E5 → #0ABFBC` + users
  - role = `#3C315B → #6155F1` + stacked-layers
  - faq = `#6155F1 → #3E81E5` + question circle
- Section heads also moved margin-bottom from `.section-h2` onto the wrapper (1.25rem for blockers, 1.5rem for the rest) so the icon-box+h2 row spaces correctly
- Solution + Audience cards were using `.card-elevated` (20px radius, no hover) → switched to `.card` (16px radius + translateY(-4px) hover lift) matching archive
- Solution card body text was inheriting `.prose-article p` (0.95rem/1.8/#555) → scoped `.solution-card .prose-article p` to `0.9rem/1.75/#555 margin:0` to match archive
- Role card body text was inheriting same prose default → scoped `.role-card .prose-article p` to `0.85rem/1.65/#555 margin:0` to match archive's smaller copy
- Audience footnote body was inheriting prose default (#555) → scoped `.audience-footnote .prose-article p` to `0.9rem/1.75/#3C315B margin:0` to match archive's darker text inside the gradient callout
- Blockers intro card had `margin-top:1.25rem` → bumped to `1.5rem` to match archive's `margin-bottom:1.5rem` on the intro `<p>`
- Blockers intro PortableText had default 1rem trailing margin (extra gap before the white card) → scoped `.blockers-intro p { margin-bottom: 0 }`
- Sidebar CTA card was `border-radius:20px; padding:1.375rem 1.5rem` → changed to `16px; padding:1.5rem` matching archive's `.sidebar-link`-aligned CTA card
- `.toc-link` was sized `0.825rem padding 0.3rem 0.5rem radius 6px` → upsized to `0.855rem padding 0.5rem 0.875rem radius 8px color #555` to match archive `.sidebar-link`
- `.toc-link.active` selector did not exist in CSS → added `background:#E2DFFE; color:#6155F1; font-weight:600` (script was adding the class but with no rule to apply)
- First TOC link wasn't auto-active → added `active` class to the Blockers anchor so the active state shows on page load before scroll-spy fires
- Responsive breakpoint for sidebar collapse was 900px → moved to 1024px (matches archive `.page-layout` collapse and other Astro pages' sidebar pattern)
- Two-col / three-col grid collapse stayed at 768px (audience 2-col, role 3-col), unchanged from archive
- FAQ chevron was `width 16 stroke-width 1.75` → upsized to `width 18 stroke-width 2` matching archive `.faq-chevron`
- `pt()` strong marker was hardcoding `font-weight:700;color:#1C1C1C` inline on every `<strong>` → removed inline styles; the global `.prose-article strong` rule already covers this and scoped overrides can now win without specificity collisions
- Added 3 new i18n keys across en/es/id: `breadcrumbParent`, `heroCtaPrimary`, `heroCtaSecondary`

**Not changed (intentional):**
- `.faq-item` border color is `#EDEDEF` from `global.css` (archive uses `rgba(97,85,241,0.1)`) — shared global is consistent across all Astro pages; keeping the project value rather than diverging this one page
- `.faq-answer` accessibility classes (display:none/block + .open) from global.css vs archive's max-height transitions — Astro's shared accessible system per CLAUDE.md responsive rules
- `.reveal` scroll-animation classes — Astro improvement over archive
- Portable Text rendering for Sanity content vs archive's hardcoded text
- `.section-head` + `.cp-icon-box` defined as page-local classes (vs global `.icon-box` which is 52×52 with `#F5F2FF` bg) — keeps the compliance icon-box at the archive's 48×48 size without affecting other pages that use the global 52×52 icon-box
### 9. Token Calculator (`token-calculator.astro`) — DONE

**Issues found and fixed:**
- Hero was centered with 1200px container and starred `Free Tool` chip → changed to left-aligned with 680px text column, 3-level breadcrumb (Home → AI Resources → Token Calculator) at top, and a circle-SVG `Free Tool` chip matching archive
- Hero h1 was `clamp(2rem, 4vw, 3rem)` → resized to `clamp(2rem, 4vw, 2.875rem)` matching archive
- Hero h1 mb was `1.125rem` → adjusted to `1rem` matching archive; subtitle 1.05rem mw 640 → 1rem mw 560 matching archive
- BaseLayout was missing `activePage`/`activeDropdown` → set `activePage="token-calculator"` and `activeDropdown="resources"` so the AI Resources dropdown highlights
- Hero `pt` blob filter id was `hero-goo` → changed to `page-goo` so it doesn't collide with index.astro's hero (which uses `hero-goo`)
- Entire calculator was single-column 900px max-width with simple textarea-then-results stack → rewrote as `.calc-grid` 2-column `minmax(340px, 420px) 1fr` layout: LEFT = input panel (card-elevated 1.75rem padding) + rules panel (card-elevated 1.5rem padding); RIGHT = results panel (card-elevated 1.75rem padding)
- Input panel: textarea was 160px min-height with absolute-positioned char counter inside → 220px min-height with `.calc-textarea` class (border #E2DFFE, bg #FDFCFF, radius 14px, focus shadow `0 0 0 4px rgba(97,85,241,0.1)`), char counter moved below as `.char-counter` right-aligned 0.75rem #B0AAD8
- Calculate button was using global `.btn-primary` (solid purple #6155F1) → switched to `.btn-calc` (gradient `#6155F1→#3E81E5`, 0.95rem/700, padding 0.75rem 1.5rem, shadow `0 4px 18px rgba(97,85,241,0.4)`, internal `::before` lighten gradient)
- Clear button was 1.5px purple border ghost → `.btn-clear` (bg #F0EEFF, color #6155F1, border 1.5px #E2DFFE, padding 0.75rem 1.25rem, 0.95rem/600)
- Rules panel was missing entirely → added new panel with icon-box header (32×32 #F0EEFF + info-circle svg) + `Estimation Rules` Kanit title, then `.rule-list` with 5 bulleted `.rule-dot` (6×6 #6155F1) items, body 0.875rem/1.7 #555, dividers 1px #F0EEFF between
- Results panel: was hidden (`display:none`) until calc and showed only after results → now always visible with a `.summary-banner` placeholder ("Enter text above to begin calculating. Only input costs are estimated.") that swaps to a green "Lowest cost / Highest cost / Input cost only" highlight after calculating
- Results header: was h2 alone → now h2 + `.mini-badge` "Input cost only" inline (right side, flex space-between)
- Stat grid was 3 columns of summary numbers + a 4th highlighted column with extra border-left → restructured as 2x2 grid of `.stat-box` cards: bg #FAFAFE, border 1.5px #EDEDEF, radius 14px, padding 1.125rem 1.25rem; 4th box `.stat-box.highlight` with gradient bg + purple border + extra `.mini-badge` "Input only" alongside its label
- Stat value font-size was 2rem → bumped to 2.25rem with line-height 1 matching archive
- Symbols label was "Symbols" → changed to "Numbers & Symbols" matching archive
- Cost breakdown was a 3-column grid of small `.cost-card` cards with colored top border (#74AA9C, #D4A17A, #4285F4) → replaced with stacked vertical `.platform-card` rows, each a horizontal flex layout (accent bar 3×48 + name+meta on left, est cost on right)
- Platform branding: was using OpenAI/Claude/Gemini brand colors as top borders → switched to full-card brand bg tints (`.openai` bg #F8FAFC, `.claude` bg #FFF8F4 + border rgba(232,130,77,0.2), `.gemini` bg #F6F4FF + border rgba(97,85,241,0.15)); accent bar uses brand gradient (openai #1C1C1C, claude #E8834D→#C9622A, gemini #6155F1→#3E81E5)
- Platform model names: were "OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro" with single-line layout → restructured into provider name + colored model chip (OpenAI + GPT-4o gray chip, Anthropic + Claude Opus orange chip, Google + Gemini 1.5 Pro purple chip) plus a "AI Token King ref. price: $X / 1M tokens · USD" meta line
- Pricing rates: Claude was $3.00/1M (Claude 3.5 Sonnet), Gemini was $1.25/1M → updated to $5.00/1M (Claude Opus) and $2.00/1M (Gemini 1.5 Pro) matching archive pricing.openai=2.5, claude=5, gemini=2
- Cost values: were always #1C1C1C neutral → added dynamic `.cheapest` (#16A34A green) and `.priciest` (#DC2626 red) colors that swap based on min/max comparison after calculating
- Cost value font-size was 1.5rem → upsized to 1.75rem matching archive
- Disclaimer text was a generic "Estimates only" line → replaced with archive's "Reference prices sourced from AI Token King. Actual billing depends..."
- FAQ section was single column 900px max-width with a single FAQ card → restructured as 2-column `.faq-grid` (1fr 1fr, gap 3rem): LEFT = section label + h2 + intro + "Read the Beginners Guide →" btn-secondary; RIGHT = card-elevated FAQ accordion
- FAQ section-label was plain text → now has inline `<circle>` SVG icon matching archive
- FAQ chevron stroke was 1.75 → upsized to 2 matching archive
- FAQ answer body was using default styling → scoped `.faq-answer-body` with 0.9rem/1.75/#555 and `:global(strong)` → #3C315B 700
- CTA banner: gradient was `linear-gradient(135deg, #3C315B 0%, #6155F1 100%)` with single arrow button → replaced with `.cta-card` gradient `#6155F1 → #3E81E5 60% → #56c7fd 100%`, 24px radius, 3rem 3.5rem padding, flex space-between layout with two decorative `.cta-blob` circles (top-right 220×220 + bottom-left 200×200), text on left + two buttons on right (`.cta-primary` solid white + `.cta-secondary` translucent border)
- CTA inner padding/title size: was h3 1.4rem with 520px subtitle → now div 1.75rem with 480px subtitle matching archive
- Token calculator JS: was inline string regex with broken multi-byte unicode escapes producing wrong counts → cleaned to archive's logic (`/[一-鿿]/g`, `/[A-Za-z]+(?:'[A-Za-z]+)*/g`, `/[0-9]/g`) with token formula `c*1.5 + e*1.1 + s*0.3`
- Summary banner update logic was missing entirely → added archive's `updateSummary` (placeholder/results swap + green highlight on results, with min/max platform names in bold)
- Char counter logic was using i18n `charCountInitial`/`charCountSuffix` strings concatenated → simplified to plain number + static "characters" suffix in markup, matching archive's `<span id="charCount">0</span> characters`
- i18n: removed `charCountInitial`/`charCountSuffix`/`priceNoteOpenai`/`priceNoteClaude`/`priceNoteGemini` (no longer used)
- Added 17 new i18n keys across en/es/id: `breadcrumbParent`, `charCountWord`, `rulesTitle`, `rule1`-`rule5`, `inputCostOnly`, `inputOnly`, `summaryPlaceholder`, `summaryLowest`, `summaryHighest`, `estInputCost`, `refPriceLabel`, `tokens`, `readBeginnersGuide`
- Updated 4 existing i18n keys across en/es/id: `inputLabel` ("Paste or type your text below" → "Input Text"), `inputPlaceholder` (generic → archive's longer "Paste any text — an article, a prompt..."), `calculateBtn` ("Calculate Tokens" → "Calculate"), `symbolsLabel` ("Symbols" → "Numbers & Symbols"), `disclaimer` (rewrite to archive's text)

**Not changed (intentional):**
- `.faq-question` font-size stays at global.css's 0.975rem (vs archive 0.95rem) — shared across every Astro page; not diverging this one page
- `.faq-item` border color from global.css (#EDEDEF) vs archive (#EDEDEF) — same value
- `.faq-answer` accessibility classes (display:none/block + .open) from global.css vs archive's max-height transitions — Astro's shared accessible system per CLAUDE.md responsive rules
- `.reveal` scroll-animation classes — Astro improvement over archive's `.fade-up`-only scheme
- 1024px breakpoint for calc-grid+faq-grid collapse, 640px for stat-grid collapse — matches project responsive system
- Hero pointer blob (archive's `.blob-pointer` mousemove follower) not added — Astro's `.hero-bg-canvas` already has 5 animated blobs, and the project-wide hero pattern has no mouse follower
- PortableText rendering for Sanity content (FAQ answers) vs archive's hardcoded text
- Calc i18n init script uses `define:vars` for compile-time injection of summary strings, vs archive's hardcoded English literals — needed for the calculator to update its summary in es/id correctly
### 10. Use Cases (`use-cases.astro`) — DONE

**Issues found and fixed:**
- Hero was centered (`text-align:center; margin:0 auto`) → changed to left-aligned with 1200px outer wrapper and inner `max-width:760px` text column matching archive
- Hero was missing breadcrumb → added "Home → AI Token Use Cases" row (rgba(255,255,255,0.5) text, 0.8rem) before section-label, with `margin-bottom:1.75rem`
- Hero subtitle had `margin:0 auto` (centered) → changed to `margin-bottom:0.625rem` (10px) matching archive's left-aligned layout
- Hero filter id was `hero-goo` → changed to `uc-page-goo` so it doesn't collide with other pages
- BaseLayout was missing `activePage` → set `activePage="use-cases"` so the top-nav "Use Cases" link highlights
- Cards grid: was `1fr 1fr 1fr` with `gap:1.25rem` and no `margin-bottom` → switched to `repeat(3,1fr)` with `gap:1.5rem` and `margin-bottom:3rem` matching archive
- Card class: was `card-elevated` (project default, no hover lift) → switched to page-local `.use-case-card` (white bg, 20px radius, archive-exact box-shadow `0 4px 20px rgba(97,85,241,0.09), 0 1px 4px rgba(0,0,0,0.05)`, hover `translateY(-5px)` with deeper shadow)
- Card padding: was `1.5rem 1.625rem` directly on outer → moved to inner div with archive's exact `1.625rem 1.75rem 1.375rem` padding
- Card header: was h2 stacked below a 40×40 box with just a colored dot → restructured as flex row (gap 0.75rem, mb 1.125rem) containing 44×44 gradient icon-box with white SVG + h3 title; h3 is now `<h3>` (was `<h2>`), with `line-height:1.25` and `margin:0` (in-row alignment)
- Icon box was `40×40` `rgba(color,0.094)` flat bg with a small colored circle dot, no SVG → upsized to `44×44` `border-radius:12px` with 9 unique gradient pairs and 9 unique white-stroke SVGs (clipboard, question circle, edit-pencil, social-f, chat-bubble, code-brackets, translate, image, video) matching archive cards
- Card description: `line-height:1.7`/`mb:0.625rem` → `line-height:1.75`/`mb:1.125rem` matching archive
- Common directions row: was a top-border thin line (1px solid rgba(accent,0.125)) under the description → replaced with full colored callout band `border-radius:10px` `padding:0.75rem 1rem` with per-card bg (F5F2FF / EBF4FF / E0FAF9 / FEF3C7 / EBF4FF / F5F2FF / E0FAF9 / FFF1F2 / F5F2FF) + uppercase label (0.72rem 700 letter-spacing 0.05em in accent color) followed by body text (0.82rem #3C315B) matching archive's 9 distinct callout color schemes
- Per-card accent color used by callout label: hardcoded `CARD_VISUALS` array (purple/blue/teal/amber/blue/purple/teal/rose/purple) matching archive — card #4 uses `#D97706` for the label color on the amber `#FEF3C7` bg (vs the gradient's `#F59E0B → #F43F5E`) per archive
- Section padding: `3rem 1.5rem 4rem` + separate footer section `0 1.5rem 4rem` → unified into single `3rem 1.5rem 5rem` section wrapping both cards + footer note, matching archive
- Footer note: was `padding:1.5rem 1.75rem` `max-width:800px` no CTA buttons no text-align → changed to `padding:1.625rem 2rem` `max-width:820px` `text-align:center` `margin:0 auto 3.5rem` with a 2-button CTA row below the prose (`btn-primary` "Compare Models" + `btn-secondary` "Beginners Guide" 0.875rem with `gap:0.875rem` `margin-top:1.25rem` `justify-content:center`)
- Footer note prose: `0.925rem #3C315B lh 1.8 margin-bottom 0.875rem` (with `:last-child` reset) → scoped `.footer-note .prose-article p` to `0.925rem #3C315B lh 1.8 margin:0` (single paragraph, no trailing margin) matching archive's `<p style="margin:0;">`
- Footer note strong: `color:#1C1C1C` matches archive — kept (removed redundant inline `style="font-weight:700;color:#1C1C1C;"` from `pt()` helper since the scoped CSS already covers it)
- `.uc-grid` class → renamed `.cases-grid` matching archive
- Added 3 new i18n keys across en/es/id under new `useCasesPage` section: `commonDirectionsLabel`, `footerCtaPrimary`, `footerCtaSecondary`

**Not changed (intentional):**
- `.reveal` scroll-animation classes — Astro improvement over archive's `.fade-up`-only scheme
- Per-card animation delays (`animation-delay: 0.06s` on cards 2/5/8 etc.) — these were noops in archive (`.reveal` uses `transition`, not `animation`), so omitted in Astro
- 900px / 640px breakpoints for cases-grid collapse — matches project responsive system (archive uses 768px → 1fr; project uses two-step 900px → 1fr 1fr → 640px → 1fr for tablets)
- Hero pointer blob (archive's `.blob-pointer` mousemove follower) not added — Astro's `.hero-bg-canvas` already has 5 animated blobs, and the project-wide hero pattern has no mouse follower
- PortableText rendering for Sanity `footerNoteBody` vs archive's hardcoded text — dynamic content
- Inline `style="font-weight:700;color:#1C1C1C;"` removed from `pt()` strong markdef — scoped `.footer-note .prose-article strong` rule now handles it without specificity collisions
### 11. User Guide (`user-guide.astro`) — DONE

**Issues found and fixed:**
- Hero was missing CTA buttons row → added "Read the Guide" (btn-primary) + "Quick Start" (btn-secondary, translucent white border/bg) with `delay-4` (0.28s) fade-up
- Breadcrumb was 2-level (Home → heroHeadline) → expanded to 3-level (Home → AI Resources → User Guide) matching archive
- Hero subtitle2 was `0.9rem/1.65/rgba(255,255,255,0.55)` with no `margin-bottom` → fixed to `0.925rem/1.7/rgba(255,255,255,0.5)` with `margin-bottom: 1.75rem` so the CTA row spaces correctly
- BaseLayout was missing `activePage`/`activeDropdown` → set `activePage="user-guide"` and `activeDropdown="resources"` so the top-nav AI Resources dropdown highlights
- Hero filter id was `hero-goo` → changed to `ug-page-goo` so it doesn't collide with index.astro's hero (which uses `hero-goo`)
- Hero heroLabel icon was a star path → changed to simple solid `<circle cx="8" cy="8" r="8"/>` matching archive
- All 9 section H2s (what-is/problems/features/models/use-cases/audience/openclaw/getting-started/faq) were plain text → wrapped each in a new `.ug-section-head` flex row (gap 1rem) with a 48×48 `.ug-icon-box` (14px radius) carrying section-specific gradient + SVG:
  - what-is = `#6155F1 → #3E81E5` + database/layers
  - problems = `#3E81E5 → #0ABFBC` + verified-badge with check
  - features = `#6155F1 → #F59E0B` + lightning bolt
  - models = `#3E81E5 → #6155F1` + monitor
  - use-cases = `#F59E0B → #F43F5E` + clipboard with check
  - audience = `#6155F1 → #0ABFBC` + users
  - openclaw = `#3C315B → #6155F1` + info circle
  - getting-started = `#22C55E → #0ABFBC` + play triangle
  - faq = `#6155F1 → #3E81E5` + question circle
- Section margin-bottom was `3rem` → bumped to `3.5rem` matching archive
- Section H2 was using `margin-bottom: 1.125rem` (now lives on `.ug-section-head` wrapper instead); section-head margin-bottom is `1.25rem` (default), `1.5rem` (models/audience/getting-started/faq), `1.75rem` (features) per archive's per-section spacing
- What-is section was missing 2-column Problem/Solution summary cards → added 2-col `.two-col-grid` with two `.card`s: left card "THE PROBLEM" (purple icon-circle + uppercase label + 3 items with red `✕` markers); right card "THE SOLUTION" (green checkmark + uppercase label + 3 items with green `✓` markers). Items hardcoded via 6 new i18n keys
- Problems section was rendering portable text as a plain `<ul>` (default bullet styling) → restructured as `.ug-problems-callout` gradient box `linear-gradient(135deg, #F5F2FF, #EBF4FF)` 16px radius 1.75rem padding wrapping: intro paragraph (font-size 0.875rem weight 600 color #3C315B mb 1rem) + extracted list-items rendered as colored-dot rows (8×8 dot cycling #6155F1/#3E81E5/#0ABFBC/#F59E0B then repeating) + body text 0.9rem #3C315B lh 1.6
- Implemented helper logic to split `problemsBody` portable text into `problemsIntro` (non-list blocks) and `problemsBullets` (`listItem === 'bullet'` blocks) so list semantics survive the visual rewrite
- Features section: cards had 36×36 icon-boxes with colored dots + 22px padding + no border → switched to archive layout: `.card` with `border-left: 4px solid <color>` (#6155F1/#3E81E5/#0ABFBC/#F59E0B), padding `1.5rem 1.75rem`, h3 1.1rem Kanit, body 0.9rem/1.75 #555. No icon-box per card
- Features cards stack gap was `1rem` → bumped to `1.25rem` matching archive
- Models section was a vertical flex column of cards with `border-left: 3px solid <color>` + plain title → switched to 2-col `.two-col-grid` of `.card`s (no border-left, colored Kanit title 1rem 700 + 0.875rem #555 description); last odd-index card gets `grid-column: span 2`. Model title colors: #6155F1/#3E81E5/#0ABFBC/#F59E0B/#6155F1 (5 series)
- Use-cases section was rendering the entire body as prose, swallowing the "Simply put" callout into the flow → split body into `head` (all but last paragraph) + `tail` (last paragraph), rendered tail as `.ug-callout` box (bg #F5F2FF, border 1px rgba(97,85,241,0.12), 14px radius, 1.25rem 1.5rem padding) matching archive
- OpenClaw section: same issue → split body and render last paragraph as `.ug-callout` gradient `linear-gradient(135deg, rgba(97,85,241,0.06), rgba(62,129,229,0.06))` with same dimensions and border
- Audience cards used `card-elevated` (no hover) → switched to `.card` (16px radius + translateY(-4px) hover lift) matching archive; last odd-index card gets `grid-column: span 2`; role label colors map to AUDIENCE_COLOR array (#6155F1/#3E81E5/#0ABFBC/#F59E0B/#F43F5E)
- Audience card padding was `1.25rem 1.375rem` → bumped to `1.375rem 1.5rem` matching archive
- Getting Started step cards used `card-elevated` (with hover) → switched to plain inline white styled `.ug-step-card` (bg #fff, 14px radius, padding 1.25rem 1.375rem, shadow `0 2px 8px rgba(97,85,241,0.07)`, no hover) since archive's steps don't lift on hover
- Step card gap was `1rem` → reduced to `0.875rem` matching archive
- Step card number circle font-size was `0.875rem` → bumped to `0.9rem` matching archive
- Getting Started section was missing the "New users don't need to research model specs first" callout at the bottom → added new `.ug-callout` gradient `linear-gradient(135deg, #F5F2FF, #EBF4FF)` 14px radius 1.25rem 1.5rem padding with bold-prefixed body via new i18n key `gettingStartedTip` (rendered via `set:html` to preserve the `<strong>` markup)
- FAQ chevron was `width:16, stroke-width:1.75` → upsized to `width:18, stroke-width:2` matching archive
- FAQ answer body was using default `.prose-article` styling → scoped `.ug-faq-answer-body p` to `font-size: 0.9rem; line-height: 1.75; color: #555; padding-bottom: 1.25rem` matching archive `.faq-body`
- Sidebar TOC card was `card-elevated` (20px radius, dual shadow) → switched to plain white `.ug-sidebar-card` (16px radius, single shadow `0 2px 10px rgba(97,85,241,0.08)`, 1.5rem padding) matching archive's `.sidebar-link`-aligned TOC card
- `.toc-link` styles updated: font-size `0.825rem → 0.855rem`, padding `0.3rem 0.5rem → 0.5rem 0.875rem`, radius `6px → 8px`, color `#666 → #555` matching archive `.sidebar-link`
- `.toc-link.active` rule did not exist in CSS → added `background:#E2DFFE; color:#6155F1; font-weight:600` (scroll-spy script was adding the class but with no rule it had no effect)
- First TOC link wasn't auto-active → added `active` class to the What-is anchor so the active state shows on page load before scroll-spy fires
- Scroll-spy was observing all `[id]` elements (including dropdowns, etc.) → narrowed selector to `article > section[id]` to only observe page sections
- Sidebar CTA card was `linear-gradient(135deg, #3E81E5, #6155F1)` (blue→purple), 20px radius, `1.375rem 1.5rem` padding → fixed to archive's `linear-gradient(135deg, #6155F1, #3E81E5)` (purple→blue), 16px radius, uniform 1.5rem padding
- Sidebar CTA title text was "Get Started Free" → updated to "Ready to try it?" via i18n
- Sidebar CTA body text was "Start using AI Token King to manage and optimize your AI usage." → updated to "New users get free tokens to explore all supported models." via i18n
- Sidebar CTA button label was using `nav.getStarted` ("Get Started") → uses new i18n key `userGuide.sidebarCtaBtn` ("Get Started Free")
- Sidebar CTA button arrow icon was 12×12 → upsized to 13×13 matching archive
- Sidebar CTA body font-size was `0.8rem` → bumped to `0.825rem` matching archive
- Sidebar CTA title font-size was `0.95rem` → bumped to `1rem` matching archive
- `pt()` strong marker was hardcoding `font-weight:700;color:#1C1C1C` inline on every `<strong>` → removed inline styles (`<strong>${children}</strong>` only); the global `.prose-article strong` rule now applies and was updated from `#1C1C1C → #3C315B` matching archive's inline override
- Responsive breakpoint for sidebar collapse was 900px → moved to 1024px matching archive `.guide-layout` collapse
- Two-col grid collapse (problem/models/audience) was at 900px (via single rule) → moved to 768px matching archive `.problem-grid` / `.audience-grid` collapse
- Added 18 new i18n keys across en/es/id under `userGuide`: `problemsFallback`, `useCasesFallback`, `openclawFallback`, `whatIsFallback`, `breadcrumbParent`, `heroCtaPrimary`, `heroCtaSecondary`, `problemLabel`, `solutionLabel`, `problemItem1-3`, `solutionItem1-3`, `gettingStartedTip`, `sidebarCtaBtn`
- Updated 2 existing i18n keys across en/es/id: `sidebarCtaTitle` ("Get Started Free" → "Ready to try it?"), `sidebarCtaBody` (generic intro → "New users get free tokens to explore all supported models.")

**Not changed (intentional):**
- `.faq-question`/`.faq-answer` accessibility classes (display:none/block + .open) from global.css vs archive's max-height transitions — Astro's shared accessible system per CLAUDE.md responsive rules
- `.faq-item` border color from global.css (`#EDEDEF`) vs archive (`rgba(97,85,241,0.1)`) — shared global is consistent across all Astro pages; keeping the project value
- `.reveal` scroll-animation classes — Astro improvement over archive's `.fade-up`-only scheme
- `.ug-section-head` + `.ug-icon-box` defined as page-local classes (vs global `.icon-box` which has bg `#F5F2FF`) — keeps the user-guide icon-boxes at the archive's gradient-bg 48×48 size without affecting other pages
- Portable Text rendering for Sanity content (whatIs/problems/useCases/openclaw bodies, feature/model/audience/step descriptions, FAQ answers) vs archive's hardcoded text — dynamic content
- Sanity content for the "Simply put:" / "Think of it as:" callouts does NOT have `<strong>` markup on the leading clause (archive bolds it) — this is a content authoring gap, not a styling issue; the scoped `.ug-callout strong` rule handles bolding correctly when present
- Problem/Solution summary items in the what-is section are hardcoded via i18n (3 items each, matching archive's static markup) since they're a distinct summary distinct from `problemsBody` — adding them as Sanity schema fields would be out of scope here
- Hero pointer blob (archive's `.blob-pointer` mousemove follower) not added — Astro's `.hero-bg-canvas` already has 5 animated blobs, and the project-wide hero pattern has no mouse follower
### 12. Blog Index (`blog/index.astro`) — DONE

**Issues found and fixed:**
- Hero content was a 800px text column with no search bar → widened to a 1200px centered container, added the archive's decorative `<input type="search">` (translucent white bg, 14px radius, magnifier icon on the left)
- Hero subtitle was 1.05rem `margin: 0 auto` (no bottom margin, so the search bar sat flush) → 1rem with `margin: 0 auto 2.5rem` matching archive
- Hero section padding was `4rem 1.5rem 3.5rem` → `4rem 1.5rem 3rem` matching archive
- Hero label background was `rgba(226,223,254,0.18)` → `rgba(226,223,254,0.15)` matching archive
- Hero filter id was `hero-goo` → renamed to `blog-page-goo` so it doesn't collide with other pages
- Updated 2 existing i18n keys across en/es/id: `latestArticles` ("Latest Articles" → "AI Token King Articles"), `heroTitle` ("AI Token King Blog" → "AI Token Article Hub"), `heroSubtitle` ("Insights on..." → "Explore guides on AI token basics, cost calculation, model comparisons, platform purchasing, and more — helping you find the right learning path faster.")
- Added "Featured Article" section header (Kanit 1.25rem 700 #1C1C1C, `margin-bottom: 1.5rem`) above the featured card — was entirely missing
- Featured card was a `.card` 2-column grid (1fr 1fr, 576px each) with 16px radius and the project default card shadow → rewrote as `.featured-card` (white, 20px radius, archive's exact box-shadow `0 4px 24px rgba(97,85,241,0.1), 0 1px 6px rgba(0,0,0,0.05)`, hover `translateY(-4px)` + deeper shadow), with `.featured-inner` flex row containing a fixed 480px image on the left + flex:1 content on the right
- Featured image was a single dark-gradient div with optional image on top → now `.featured-img` with the cover image (object-fit cover), a `.featured-img-overlay` purple→blue mix-blend-multiply gradient, and a `.featured-img-sheen` translucent diagonal sheen matching archive
- Featured h2 was 1.6rem/700/-0.03em → `clamp(1.35rem, 2.5vw, 1.75rem)`/800/-0.03em matching archive's responsive heading
- Featured card had no hover lift or arrow gap animation → added both (matches archive's `.featured-card:hover` + `.btn-ghost` gap expansion)
- Featured meta row showed only date → added "Read Article →" inline btn-ghost on the right with hover gap animation matching archive
- Featured card had only one tag pill (category) → added a 2nd tag pill row showing category + first tag (when present) matching archive's "AI Token Basics + Beginner" pattern
- Filter tabs class was `.filter-tab` with count badges (e.g. "All Posts 95") → renamed to archive's `.cat-tab`, removed all count badges (archive has none)
- Filter tab styling: was transparent bg + 1.5px solid #E2DFFE border → white bg + 1.5px solid rgba(97,85,241,0.15) border matching archive
- Filter tab padding: was 0.45rem 1rem → 0.5rem 1.125rem matching archive
- Filter tab font-size: was 0.82rem → 0.825rem matching archive
- Active tab had no box-shadow → added `box-shadow: 0 2px 10px rgba(97,85,241,0.3)` matching archive
- Filter container was `.filter-bar` with margin-bottom 2.5rem directly on the bar → wrapped in an outer div with `margin-bottom: 2.5rem` and used `.cat-scroll` for the inline flex row matching archive structure
- Results bar was entirely missing → added "Showing {n} of {total} articles" using i18n template + decorative Sort by dropdown matching archive (uses real counts from Sanity, not the hardcoded "12 of 200+")
- Post card class was `.card` (no overflow:hidden) with style-attribute padding → switched to `.post-card` (white, 16px radius, overflow hidden, archive's exact box-shadow, hover translateY(-3px) + shadow grow)
- Post image area was 160px gradient div with category pill overlaid on top → 200px `.post-img-wrap` with cover-fit image + `.post-img-overlay` linear-gradient-to-top tint (color cycles per category) matching archive
- Post card has no image hover zoom → added `transform: scale(1.05)` transition on `.post-img` when card is hovered matching archive
- Category pill was overlaid absolutely on image → moved INSIDE body content as part of `.post-tag-row` (above title) matching archive's layout
- Tag pill color: was always purple `#E2DFFE`/`#6155F1` → added 5-variant color map (`tag-purple`/`tag-blue`/`tag-dark`/`tag-green`/`tag-amber`) keyed off category via `CAT_PILL` lookup (compliance=dark, pricing/models=blue, platform=amber, tutorials=green, others=purple) matching archive
- Post card body padding: was 1.5rem → 1.375rem (22px) matching archive
- Post card h3: was 1.1rem → 1.05rem matching archive
- Post card excerpt: was 0.85rem → 0.825rem matching archive
- Post date: was 0.78rem → 0.775rem matching archive
- Post card meta row was just date → added "Read →" small label on right (0.775rem #6155F1 600 with gap expansion on hover) matching archive
- Post grid `margin-bottom: 0` → `margin-bottom: 3rem` matching archive (gives room above pagination)
- Pagination was entirely missing → added `.pagination` nav with prev/next arrows, numbered `.page-btn`s (36×36, 9px radius), `.page-ellipsis` "···" separator, and "Page N of M" status label. Algorithm anchors first 3 pages + last + current neighbourhood to match archive's "1 2 3 … 17" pattern; auto-hides when only 1 page total. Wired to the existing filter so pagination resets and re-renders per category.
- Filter logic was 2-pass (separate featured/grid passes) → unified into a single `render()` that picks the first matching post for the featured slot, paginates the remainder, updates the showing/total counts, rebuilds pagination chrome, and toggles the empty state in one place
- Pagination clicks: smooth-scroll to the post grid so users don't get teleported back to the hero
- Newsletter CTA banner was entirely missing → added `.newsletter-banner` (gradient `#6155F1 → #3E81E5`, 20px radius, 3rem 2.5rem padding) with two decorative `.newsletter-blob` circles (top-right 200×200, bottom-left 160×160), `.newsletter-copy` left side (Kanit clamp(1.25rem,2.5vw,1.625rem) title + 0.9rem rgba(255,255,255,0.8) subtitle), `.newsletter-form` right side with email input + Subscribe button (decorative — `onsubmit="return false;"` so no double-submit during the placeholder phase)
- Responsive breakpoints: 1023px (featured card stacks vertically, image becomes 220px tall, post grid drops to 2 columns) and 640px (post grid drops to 1 column, tabs shrink, newsletter form input flexes) matching archive's 860px / 640px tiers (using 1023px to align with project's other pages where the nav switches)
- Added 12 new i18n keys across en/es/id under `blog`: `searchPlaceholder`, `featuredArticle`, `read`, `showingPosts` (templated `{n}` / `{total}`), `sortBy`, `sortLatest`, `sortPopular`, `sortBeginner`, `pageOf` (templated `{n}` / `{total}`), `newsletterTitle`, `newsletterCopy`, `newsletterEmail`, `newsletterSubscribe`
- Updated 4 existing i18n keys across en/es/id under `blog`: `latestArticles`, `heroTitle`, `heroSubtitle`, `readArticle` ("Read article" → "Read Article")
- Removed the inline `style="..."` attributes that were duplicating CSS rules; everything now lives in a single scoped `<style>` block for consistency with the other pages

**Not changed (intentional):**
- Sort dropdown is decorative (selecting a different sort doesn't actually re-sort) — matches archive's behaviour exactly; real sorting would need either client-side `Date.parse` work or a Sanity ordering switch that's out of scope
- Search input is decorative — matches archive (no filter handler on input); making it functional would duplicate the category-filter scope
- Pagination uses real post count (e.g. "Page 1 of 8" for 95 posts) instead of archive's hardcoded "Page 1 of 17" — matching archive's literal numbers would lie about the data
- "Showing 12 of N articles" uses the real total instead of archive's hardcoded "200+" — same rationale
- `.reveal` scroll-animation classes — Astro improvement over archive's `.fade-up`-only scheme; deferred reveals on the newsletter banner survive translation
- Hero pointer blob (archive's `.blob-pointer` mousemove follower) not added — project-wide hero pattern has no mouse follower; `.hero-bg-canvas` already has 4 animated blobs
- Post card images use real Sanity cover images when present and fall back to a per-category gradient block (with the AI Token King logo motif) — archive uses hardcoded `placehold.co` URLs which don't generalize
- Category pill colour map (`CAT_PILL`) covers all 7 schema categories; archive has hardcoded HTML per post — same visual output, data-driven
- Filter tab list only shows categories that have at least one post (existing behaviour preserved) — archive's static list shows all categories regardless

### 13. Blog Post (`blog/[slug].astro`) — DONE

**Issues found and fixed:**
- Hero was a dark gradient `linear-gradient(40deg, #2A1F5C, #0D1547)` with `.hero-bg` goo blobs + white text → rewrote as a LIGHT hero `.post-hero` with archive's radial gradients (`radial-gradient(80% 60% at 70% 0%, rgba(97,85,241,0.1) 0%, transparent 55%), radial-gradient(40% 50% at 5% 100%, rgba(62,129,229,0.08) 0%, transparent 50%), #F5F2FF`); padding `3rem 1.5rem 2.5rem`
- Hero used a single 800px column → switched to `1200px` outer wrapper with an inner `.post-hero-col` 800px column matching archive
- Breadcrumb was 2-level (Home → post.title in long form, white-text on dark hero) → 3-level Home → Blog → CATEGORY using the post's `category` field; colors `#999` with `#6155F1` 600 final span and `#CCC` chevrons matching archive
- Hero had no tag pill row → added `.post-hero-tags` row above title with category pill (per-category color from `CAT_PILL`) + first user tag (`tag-blue` variant), each clickable to `/blog`
- Tag pill styles inlined as page-local `.tag-pill` + 5 colour variants (`tag-purple`/`tag-blue`/`tag-dark`/`tag-green`/`tag-amber`) matching archive: padding `0.25rem 0.75rem`, radius `100px`, font-size `0.72rem` 700 letter-spacing `0.04em` uppercase, with hover bg darken
- Title color was `#fff` → `#1C1C1C` matching the light hero
- Title margin-bottom was `1rem` → `1.125rem` matching archive
- Hero showed `post.excerpt` paragraph between title and meta → removed (archive has no excerpt in hero; title goes straight to meta row)
- Meta row was a single date span (`{formatDate(post.publishedAt)}`) → rebuilt with archive's full meta: 32×32 gradient avatar (purple→blue) + user-icon SVG, "AI Token King Editorial" 0.85rem 600 #3C315B, date #999, dot separator, `{n} min read`, dot separator, category — with `padding-bottom: 1.5rem; border-bottom: 1px solid rgba(97,85,241,0.12)` to match archive's underline separator
- Reading time was not computed → added `countWords()` helper that walks Portable Text blocks (`block.children[].text`) and divides by 225 wpm; minimum 1 minute. Surfaced via new `blog.minRead` i18n key (`{n} min read` / `{n} min de lectura` / `{n} menit baca`)
- Author label hardcoded → moved to new i18n key `blog.author` ("AI Token King Editorial" / "Equipo Editorial de AI Token King" / "Tim Editorial AI Token King")
- Hero/cover image was an auto-height `<img>` inside a `border-radius: 16px` wrapper → rewrote as `.hero-img` (420px fixed height, 18px radius, overflow hidden, 2.5rem mb), with category-tinted gradient bg fallback, an `img` cover layer (object-fit: cover), a `linear-gradient(to top, <catTint> 0%, transparent 50%)` overlay, and an additional `rgba(97,85,241,0.15)` mix-blend-multiply tint matching archive's 3-layer treatment
- Article body used `.prose` (h2 `2rem 0 0.75rem`, p `1rem`/`1.8`/`#3C315B mb 1.25rem`) → rewrote as `.article-body` with archive-exact typography: h2 `1.5rem` 800 Kanit `-0.03em` lh 1.2 mt `2.5rem` mb `0.875rem` pt `2rem` with `border-top: 1px solid rgba(97,85,241,0.1)` (and `:global(h2:first-child)` resets these three for the leading section); h3 `1.1rem` 700 `-0.02em` mt `1.75rem` mb `0.625rem`; p `0.975rem` lh `1.85` #444 mb `1.125rem`; li `0.975rem` lh `1.8` #444 mb `0.375rem`; strong #1C1C1C 700; a #6155F1 underline `text-underline-offset: 3px` with hover #4e44d4
- Inline code used `#F5F2FF`/`#6155F1` background → swapped to archive's `#E2DFFE`/`#3C315B` with JetBrains Mono/Fira Code font-family fallback, padding `0.15rem 0.45rem` radius `5px`
- Blockquote was just a `border-left: 3px solid #6155F1` with `padding-left: 1.25rem` → full archive treatment: `border-left: 3px solid #6155F1`, `background: #F5F2FF`, `border-radius: 0 12px 12px 0`, padding `1.125rem 1.375rem`, italic `#3C315B`, font-size `0.975rem`, line-height `1.8`
- Code block (`pre`) styling kept dark `#1C1C1C` bg matching archive (was already correct, just scoped under `.article-body :global(pre)`)
- Sanity image rendering produced an inline-styled `<figure>` with hardcoded margin/radius → switched to `.article-figure` class (margin `2rem 0`, radius `12px`, overflow hidden); figcaption `0.8rem #999` center-aligned matching archive
- Article body h2/h3 had no anchor IDs → added a custom `block` renderer in `@portabletext/to-html` (`h2: ({ value, children }) => '<h2 id="..." >...'`) that walks `value.children[].text` to build a deduplicated slug. Same logic runs twice: once to collect headings for the TOC list (passed to the sidebar), and once during PortableText render — `usedSlugs` is reset between passes so both produce matching IDs
- Slugifier supports Unicode (`/[^\p{L}\p{N}]+/gu`) so non-Latin titles still produce stable anchors; duplicates get `-2`, `-3` suffixes
- Share row used `btn-ghost` (transparent, no border) and only Twitter + LinkedIn → swapped to custom `.share-btn` class (white bg, `1.5px solid rgba(97,85,241,0.15)` border, padding `0.5rem 1rem`, radius `8px`, font-size `0.8rem` 600 #3C315B), 3 buttons: X/Twitter, LinkedIn, Copy Link (with link-2 SVG). Hover bg `#EDE9FF` border `rgba(97,85,241,0.3)` color `#6155F1`
- Share row had `gap: 1rem` and `margin-top: 3rem` → `gap: 0.75rem` and `margin-top: 2.5rem` `padding-top: 2rem` `border-top: 1px solid rgba(97,85,241,0.1)` matching archive
- Share row label "Share:" (`blog.share`) → updated to "Share this article:" / "Comparte este artículo:" / "Bagikan artikel ini:" matching archive
- Copy-link button stored its labels in `dataset.copy`/`dataset.copied` but replaced the full `textContent` (clobbering the icon SVG) → split into `<svg> + <span class="copy-label">` so the JS toggles only the span, preserving the icon
- Back-to-Blog button removed: not present in archive (the share row + sidebar replace its function)
- Sidebar was 3 cards: Published date, Tags, CTA → rebuilt as 3 archive cards: TOC ("On This Page"), CTA ("Try AI Token King"), Article Info ("Article Info")
- Sidebar position was `top: 84px` → `top: 88px` matching archive
- Sidebar cards used `.card-elevated` (20px radius, dual shadow) → switched to local `.sidebar-card` (white, 16px radius, padding `1.5rem` for TOC, `1.375rem` for Info, single shadow `0 2px 10px rgba(97,85,241,0.08)`)
- Sidebar eyebrow labels — old card titles were Kanit `0.875rem` 700 `#1C1C1C` normal-case → archive's mix:
  - TOC: `.sidebar-eyebrow` 0.72rem 700 #6155F1 uppercase letter-spacing `0.07em`
  - Article Info: `.sidebar-info-eyebrow` 0.75rem 700 #3C315B uppercase letter-spacing `0.04em`
- TOC `.sidebar-link` styles: padding `0.45rem 0.875rem`, radius 7px, font-size `0.845rem` 500 #666, with hover bg `#F5F2FF`/color `#6155F1` and active state bg `#E2DFFE`/color `#6155F1`/weight 600 — matching archive
- First TOC link wasn't auto-active → added `active` class to first heading on render so the highlight shows before scroll-spy kicks in
- Scroll-spy uses `IntersectionObserver` with `rootMargin: '-20% 0px -70% 0px'` to swap active class as user scrolls — no max-height/width transitions per CLAUDE.md rules
- Sidebar CTA gradient and decoration: kept `linear-gradient(135deg, #6155F1, #3E81E5)`, added `.sidebar-cta-blob` decorative 80×80 white circle at top-right `-20px -20px` matching archive
- CTA title was `1rem` 700 white, body `0.85rem` opacity 0.8 → kept title at 1rem; body resized to `0.825rem` opacity `0.88` line-height `1.6` matching archive
- CTA copy "Compare models, calculate costs, and manage your AI usage — free." → updated `blog.tryCopy` to archive's "Compare live pricing across 60+ models and calculate your exact token costs before committing." across en/es/id
- CTA button was an `inline-flex` `.btn-primary` override with white bg + #6155F1 text → replaced with `.sidebar-cta-btn` (`width: 100%`, `justify-content: center`, bg `rgba(255,255,255,0.2)`, border `1px solid rgba(255,255,255,0.35)`, color #fff, no shadow, hover bg `rgba(255,255,255,0.3)`) matching archive
- CTA button text "Get Started" (`blog.tryButton`) → updated to "Compare Models" / "Comparar Modelos" / "Bandingkan Model" across en/es/id, with the link pointing to `/${lang}/api-compare` (was external `aitokenking.com.tw/home`)
- Article Info card was missing → added new `.sidebar-info` card with 3 rows: clock SVG + reading time, calendar SVG + date, tag SVG + category. Rows are `0.825rem #666` with `0.625rem` gap, icons `#999` 1.75 stroke
- Related Articles section was completely missing → built from new `getRelatedPosts(currentSlug, lang, category, 3)` Sanity helper that prefers same-category posts and falls back to most recent
- Related grid uses `repeat(3, 1fr)` `gap: 1.5rem`, each `.related-card` is white 16px radius `box-shadow: 0 2px 12px rgba(97,85,241,0.07)`, hover `translateY(-3px)` deeper shadow, with category-tinted `.related-img-wrap` (160px height), category pill, Kanit `0.975rem` 700 title, `0.775rem #999` date — matching archive's hardcoded structure
- Related card image hover-zoom (`transform: scale(1.06)` on `:hover`) added matching archive
- Reading progress bar was `top: 64px z-index: 99` (would slide under the sticky nav) → moved to `top: 0 z-index: 200` matching archive; kept `transform: scaleX()` + `transform-origin: left` per CLAUDE.md rules (archive uses `width %` but the project standard is `scaleX`)
- Post layout was `grid-template-columns: 1fr 280px gap: 3.5rem` → matches archive (verified via Puppeteer: `864px 280px` `gap: 56px`)
- Responsive breakpoint moved from 900px to 1024px to match the rest of the Astro site's sidebar-collapse breakpoint (project standard); also collapses `.related-grid` to 2 cols at 900px and 1 col at 640px (with `hero-img` height reducing to 220px at 640px) matching archive
- Sanity `getPostBySlug` query didn't include `category` → added `category` to the GROQ projection so it's available for the breadcrumb, hero pill, sidebar info row, and `getRelatedPosts`
- Added `getRelatedPosts` Sanity helper: 1st query fetches same-category posts ordered by `publishedAt desc, articleNumber asc` excluding the current slug; if fewer than `limit` found, a 2nd query fills with other recent posts in the same language, excluding the current slug and the already-picked posts
- Added 6 new i18n keys across en/es/id: `blog.author`, `blog.minRead`, `blog.articleInfo`, `blog.relatedArticles`, `blog.viewAllArticles`
- Updated 3 existing i18n keys across en/es/id: `blog.share` ("Share:" → "Share this article:"), `blog.tryCopy` (rewritten to archive's "Compare live pricing..."), `blog.tryButton` ("Get Started" → "Compare Models")

**Not changed (intentional):**
- Reading progress bar uses `transform: scaleX()` (archive uses `width %`) — required by CLAUDE.md responsive rules ("transform: scaleX() + transform-origin: left, not width")
- `.reveal` scroll-animation classes — Astro improvement over archive's `.fade-up`-only scheme
- 1024px sidebar-collapse breakpoint (archive uses 1060px) — matches project responsive system used by every other Astro page
- "Back to Blog" / generic share row label dropped — archive doesn't show a back button in the article body (uses breadcrumb + share); keeping `blog.backToBlog` key in case it's reused elsewhere
- Author hardcoded as "AI Token King Editorial" (matches archive's hardcoded byline) — Sanity `post` schema has no `author` field; adding one would be schema work out of scope here
- Reading time computed client-side from `body` word count at build time (225 wpm) rather than via a stored Sanity field — archive hardcodes "8 min read" with no schema field either
- Headings list for TOC built at build time from `body` blocks with `style === 'h2'` — h3s are skipped to avoid noisy nested entries in the sidebar (archive shows only h2s)
- Code-block renderer kept dark `#1C1C1C` bg (matches archive) — Sanity rarely supplies these but the styling is preserved for when content authors do
- Related cards use category gradient fallback bg + `mix-blend-multiply` cover image overlay — uses same `CAT_PILL`/`CAT_GRADIENT`/`CAT_TINT` lookups as the blog index page for consistency
- Sanity Portable Text image renderer outputs `<figure class="article-figure">` rather than inline styles — keeps the page-local `.article-body :global(.article-figure)` CSS in charge of layout (margin/radius/figcaption)
- Slugifier output may differ from archive's hand-authored anchors (e.g. archive uses `#what-is-a-token`, ours generates `#what-is-an-ai-token`) — anchors aren't a visible delta; what matters is that the TOC links resolve to the rendered headings, which they do

---

## How to Continue
Start a new Claude Code session with this prompt:

> I'm continuing Task 3 (tweak and polish static pages) on branch `levii/tweak-polish-static-pages`.
>
> **Before writing ANY code:**
> 1. Read `CLAUDE.md` fully — it has hard rules you must follow.
> 2. Invoke the `/frontend-design` skill — this is mandatory per CLAUDE.md, every session, no exceptions.
> 3. Read `TASK3_PROGRESS.md` for full context — what's done, what's remaining, and lessons learned.
>
> **Then, for the next NOT STARTED page:**
> 1. Read the Astro source file and the archive HTML reference (`archive/en/<page>.html`) in full.
> 2. Start both servers: `node archive/serve.mjs` (port 3000, archive) and `npm run dev` (port 4321, Astro).
> 3. Screenshot both with `node archive/screenshot.mjs <url> <label>`.
> 4. Run a detailed Puppeteer `page.evaluate()` comparison — check every section's styles, colors, font sizes, weights, padding, margins, hover effects, layout. Don't do high-level scans.
> 5. List every difference found.
> 6. Fix each difference.
> 7. `npm run build` — must pass.
> 8. Re-audit with Puppeteer to confirm all differences are resolved (comparison round 2).
> 9. Screenshot the fixed page.
> 10. Update `TASK3_PROGRESS.md` with findings.
> 11. Commit: `fix(<page>): polish static page to match archive reference`.
>
> Work ONE page at a time. Do not start the next page until the current one is committed.
