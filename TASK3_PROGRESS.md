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
### 4. API Compare (`api-compare.astro`) — NOT STARTED
### 5. ChatGPT API (`chatgpt-api.astro`) — NOT STARTED
### 6. Claude API (`claude-api.astro`) — NOT STARTED
### 7. Gemini API (`gemini-api.astro`) — NOT STARTED
*Pages 5-7 share `ApiModelPage.astro` component — fixing one fixes all three.*
### 8. Compliance (`compliance.astro`) — NOT STARTED
### 9. Token Calculator (`token-calculator.astro`) — NOT STARTED
### 10. Use Cases (`use-cases.astro`) — NOT STARTED
### 11. User Guide (`user-guide.astro`) — NOT STARTED
### 12. Blog Index (`blog/index.astro`) — NOT STARTED
### 13. Blog Post (`blog/[slug].astro`) — NOT STARTED

---

## How to Continue
Start a new Claude Code session with this prompt:

> I'm continuing Task 3 (tweak and polish static pages) on branch `levii/tweak-polish-static-pages`. Read `TASK3_PROGRESS.md` for full context — what's done, what's remaining, and lessons learned. Start with the next NOT STARTED page. Work page by page, detailed comparison, fix, build, verify.
