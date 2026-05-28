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
### 11. User Guide (`user-guide.astro`) — NOT STARTED
### 12. Blog Index (`blog/index.astro`) — NOT STARTED
### 13. Blog Post (`blog/[slug].astro`) — NOT STARTED

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
