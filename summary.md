# AI Token King — Project Session Summary

## What This Site Is
An English-language information hub for anyone learning about AI — tokens, models, APIs, aggregators, costs, etc. It is the English base template that will later be replicated across other languages. The Chinese version of the site is the content source; we translate and adapt it for a Western audience with a redesigned look.

---

## Brand Guidelines (from Brand Guidelines_1.png / _2.png)

- **Brand name:** AI Token King
- **Mascot/Logo:** Cute corgi with a crown (`AI_Token_logoPNG.avif`) — always use this, never a placeholder
- **Primary color:** `#6155F1` (purple)
- **Secondary accent:** `#3E81E5` (blue)
- **Near black (text):** `#000000` / `#1C1C1C`
- **Medium gray:** `#666666`
- **Lighter gray:** `#999999`
- **Light gray bg:** `#EBF4FF`
- **Gradient:** `#F1F1FF` → `#56F7FD` (for banners/special sections)
- **White:** `#FFFFFF`
- **Lavender bg:** `#F5F2FF` (default page background)
- **Soft purple:** `#E2DFFE` (pills, hover states)
- **Dark purple:** `#3C315B` (subheadings, nav text)
- **Heading font:** `Kanit` (weights 400–800, Google Fonts)
- **Body font:** `Plus Jakarta Sans` (weights 400–700, Google Fonts)
- **Buttons:** Rounded corners (12px), clean minimal, subtle shadows, all interactive states required
- **Icons:** Line-style, rounded, minimal — consistent with brand guidelines iconography sheet

---

## Design System (established in index.html, shared across all pages)

- Page background: `#F5F2FF`
- Grain texture overlay via SVG noise filter (body::before, z-index 9999, pointer-events none)
- Layered radial gradient hero backgrounds — never flat colors
- **Cards:** white bg, 16px border-radius, purple-tinted shadow, hover lift (-4px translateY)
- **Elevated cards:** 20px border-radius, slightly stronger shadow, no hover lift
- **Trend cards:** white bg, 16px border-radius, 4px colored left border accent, hover lift
- **Section label pills:** `#E2DFFE` bg, `#6155F1` text, uppercase, 100px border-radius
- **Buttons:**
  - `.btn-primary` — `#6155F1` bg, white text, shadow, hover lift
  - `.btn-secondary` — transparent, `#6155F1` border + text
  - `.btn-ghost` — transparent, `#6155F1` text, no border
  - `.btn-download` — `#F5F2FF` bg, `#E2DFFE` border, hover turns purple
- **Animations:** `fadeUp` keyframe (page load, staggered) + `.reveal` class via IntersectionObserver (scroll-triggered) — only `transform` and `opacity`
- **Typography:** Kanit headings with `-0.03em` to `-0.04em` tracking, Plus Jakarta Sans body at `1.7–1.8` line-height
- **Anti-generic rules:** No default Tailwind blue/indigo, no `transition-all`, no flat `shadow-md`

---

## Navigation Structure (all pages)

The logo (`AI_Token_logoPNG.avif` + "AI Token King" text) is the home button — links to `index.html`.

| Item | Type | Link |
|---|---|---|
| AI Resources | Dropdown | — |
| └ AI Trends | Sub-item | `ai-trends.html` ✅ |
| └ AI Token King User Guide | Sub-item | `user-guide.html` ✅ |
| └ Business AI Compliance | Sub-item | `compliance.html` ✅ |
| Compare Models | Top-level | `api-compare.html` ✅ |
| Use Cases | Top-level | `use-cases.html` ✅ |
| Beginners Guide | Top-level | `beginners-guide.html` ✅ |
| Blog | Top-level | `#` |
| Documentation | Top-level | `documentation.html` ✅ |
| Get Started | CTA button | `#` |

Dropdowns: click-to-open JS, close on outside click, chevron rotates 180° when open.
Active page: `.active` class on nav link; active dropdown parent also gets `.active`.

---

## Pages Built

### 1. `index.html` — Homepage
Sections (in order):
1. Sticky glassmorphism nav
2. Hero — "Master AI Tokens, Models & APIs" + stats row + mini API pricing table card
3. Token Explainer banner — "What Exactly Is an AI Token?" with visual token breakdown
4. 8 Topic Cards grid — Token Basics, Compare APIs, Calculate Costs, Read the Guide, Beginner Steps, Use Cases, Model Types, FAQ
5. Full API Comparison table — 6 models (GPT-4o, GPT-4o mini, Claude 3.5 Sonnet, Claude Haiku, Gemini 1.5 Pro, Llama 3.1 405B)
6. 3-Step Getting Started — numbered cards with gradient icon boxes
7. Blog section — 1 large featured post + 3 side posts + 3 bottom cards (placeholder images)
8. FAQ accordion — 7 questions, JS toggle
9. Newsletter CTA — gradient banner with email form
10. Footer — 4 columns: brand, Learn, Compare, More

### 2. `api-compare.html` — AI Model Type Overview
Sections (in order):
1. Sticky nav (Compare Models marked active)
2. Hero with breadcrumb + page intro + 3 type-selector anchor cards (Text / Image / Video)
3. Two-column layout: main content + sticky sidebar TOC
4. Text Models table — 25 models with English use case descriptions
5. Image Models table — 11 models
6. Video Models table — 8 models
7. FAQ accordion — 6 questions about model types
8. Bottom CTA gradient banner
9. Footer

Sidebar: sticky TOC with model count badges, active section highlight on scroll, Quick Tip box, CTA button.

### 4. `user-guide.html` — AI Token King User Guide
Two-column layout with sticky sidebar TOC. Sections: What is AI Token King, What Problems Does It Solve, Core Features (4 accent-border cards), Supported Models (GPT/Claude/Gemini/DeepSeek/Qwen), What Can You Use It For, Who Is It For (audience grid), What is OpenClaw, How to Get Started (5-step list), FAQ accordion (5 questions).

### 5. `compliance.html` — Enterprise AI Compliance Solution
Two-column layout with sticky sidebar TOC. Sections: Where Enterprises Get Stuck (6-bullet list of hard questions), Enterprise Proposal CTA (dark gradient banner), What the Solution Covers (5 accent-border cards: Procurement & Invoice Compliance, Data Masking & Security Controls, Prompt-Level Auditing, Multi-Model Routing & Failover, Internal SOP Development), Who Is This For (4 audience cards: Financial Sector, Listed Companies, High-Sensitivity Industries, Platform Companies & Startups + key signal callout), AI Token King's Role (3 cards: Local Representative, Technical Value Layer, Multi-Model Aggregation), FAQ (4 questions). Content sourced from https://www.aitoken.com.tw/enterprise-ai-compliance-solution.

### 6. `use-cases.html` — AI Token Use Cases
Full-width page. 9 use case cards in a 3-col grid, each with description, token/context considerations, and a "Common directions" tag line. Cards: Document Summarization & Organization, Q&A & Knowledge Queries, Content Creation & Copywriting, Social Media & Short-form Copy, Customer Service & FAQ Responses, Code Writing & Debugging, Translation & Multilingual Content, Image Generation & Visual Assets, Video Generation & Short-form Video. Footer note with links to Compare Models and Beginners Guide. Content sourced from https://www.aitoken.com.tw/ai-token-use-cases.

### 7. `beginners-guide.html` — AI Token Beginners Guide
Two-column layout with sticky sidebar TOC and related links panel. Sections: 3-step reading order (Step 1: what is a token, Step 2: how it's calculated, Step 3: how costs work — each with accent-border card and article link), Where Most Beginners Get Stuck (explains the sequence problem, 3 learning-path callout boxes), FAQ accordion (4 questions: APIs, points vs tokens, usage growth, price vs quality), Recommended Next Reads (3 article link cards), closing gradient CTA banner. Content sourced from https://www.aitoken.com.tw/ai-token-beginners-guide.

### 9. `token-calculator.html` — AI Token Calculator
Full-page calculator tool. Sections (in order):
1. Sticky nav (AI Resources dropdown active, Token Calculator marked active within it)
2. Hero with breadcrumb (Home → AI Resources → Token Calculator) + section label pill + h1 + intro copy
3. Two-column calculator layout:
   - Left: textarea input panel (with char counter, Calculate + Clear buttons) + Rules panel (5 bullet estimation rules)
   - Right: Results panel — summary banner (turns green with cheapest/priciest platform after input), 2×2 stat grid (Chinese chars, English words, Numbers+Symbols, Est. Input Tokens), 3 platform cost cards (OpenAI/Anthropic/Google) with colored left accent bars and green/red cost color-coding
4. FAQ accordion (4 questions: what is a token, why numbers differ, output tokens, price accuracy)
5. Gradient CTA banner — links to Compare Models + Beginners Guide
6. Footer (Token Calculator highlighted in Learn column)

**Calculator logic (ported from `qoder 資料/` reference):**
- Live calculation on every keystroke + paste event
- Chinese: 1.5 tokens/char · English: 1.1 tokens/word · Numbers+symbols: 0.3 tokens each
- Cheapest platform cost turns green, most expensive turns red
- Summary banner updates dynamically with cheapest/priciest platform name
- Clear button resets all fields and restores placeholder state

**Entry points from index.html (all wired in this session):**
- Hero floating mini card → gradient purple-blue pill, links to `token-calculator.html`
- Fundamentals section → `btn-calculator` gradient button next to "Learn Token Basics"
- "What You'll Find Here" Card 3 (Calculate Costs) → links to `token-calculator.html`
- AI Resources dropdown → 4th item "Token Calculator"

### 8. `documentation.html` — Documentation (Developer Docs)
Two-column layout: narrow sidebar with section nav, main content area. Sections: Getting Started (auth, first request with code blocks), API Reference (base URL, chat completions parameter table, models endpoint, error codes table), Token Calculation & Pricing (token reference, pricing table), OpenClaw API (overview, creating agents with JSON example), SDKs & Rate Limits (Python/Node.js code blocks, rate limits table). Uses JetBrains Mono for code blocks.
Sections (in order):
1. Sticky nav (AI Resources dropdown marked active, AI Trends marked active within it)
2. Hero with breadcrumb (Home → AI Resources → AI Trends) + headline + two-line intro
3. AI Future Trend Watch — intro copy + "Key Shifts to Watch" summary card (5 bullet points)
4. 5 Trend Cards (3+2 grid layout) with scroll-reveal animation:
   - AI Cost Control Becomes a Core Competency (purple accent)
   - Not Every Task Uses the Same Model (blue accent)
   - AI APIs Become Infrastructure (teal accent)
   - AI Agents Amplify Token & Cost Management Complexity (amber accent)
   - Data Governance Determines What AI Can and Can't Do (rose accent)
5. What Do These Changes Mean for You? — 3 audience cards (Individual Users, Teams & Managers, Enterprise Buyers)
6. Sources & Further Reading — Gartner 2031 PDF download button + 3 related article cards
7. Footer

Content source: Chinese screenshot provided in session 3. Source cited: Gartner 2031 Data, Analytics & AI Top 10 Predictions.

---

## Tooling & Workflow

- **Node.js:** v24.15.0 (installed via nvm — must source `~/.nvm/nvm.sh` in shell commands)
- **Puppeteer:** installed in project root via `npm install puppeteer`
- **Dev server:** `node serve.mjs` → `http://localhost:3000` (port 3000)
- **Screenshots:** `node screenshot.mjs http://localhost:3000/page.html label` → saves to `./temporary screenshots/screenshot-N-label.png`
- **Shell note:** Always prefix node commands with `source ~/.nvm/nvm.sh 2>/dev/null;` in Bash tool calls or node won't be found
- **Screenshot rendering:** The VSCode extension Read tool does NOT render PNG images visually — use Puppeteer's `page.evaluate()` to audit structure programmatically instead
- **CLAUDE.md screenshot note:** CLAUDE.md references a Windows Puppeteer path (`C:/Users/nateh/...`) which is stale/irrelevant — we are on macOS. Ignore that path. The actual workflow is: `node screenshot.mjs` from the project root on macOS, with Puppeteer installed locally in `node_modules/`.

---

## Content Source
All copy comes from the Chinese site screenshots. Translation: direct + light Western English adaptation. Never invent content — always source from provided screenshots.

Chinese screenshots used so far:
- `home_content.png` — homepage content (session 1)
- Model overview screenshot — api-compare page content (session 2)
- AI Trends screenshot — ai-trends page content (session 3)
- User Guide screenshot + https://www.aitoken.com.tw/ — user-guide page content (session 4)
- Compliance screenshot + https://www.aitoken.com.tw/enterprise-ai-compliance-solution — compliance page content (session 4–5)
- Use Cases screenshot + https://www.aitoken.com.tw/ai-token-use-cases — use-cases page content (session 5)
- Beginners Guide screenshot + https://www.aitoken.com.tw/ai-token-beginners-guide — beginners-guide page content (session 5)

---

## Files in Project Root

| File | Purpose |
|---|---|
| `index.html` | Homepage |
| `api-compare.html` | AI Model Type Overview |
| `ai-trends.html` | AI Trends (AI Resources dropdown) |
| `user-guide.html` | AI Token King User Guide (AI Resources dropdown) |
| `compliance.html` | Enterprise AI Compliance Solution (AI Resources dropdown) |
| `use-cases.html` | AI Token Use Cases |
| `beginners-guide.html` | AI Token Beginners Guide |
| `documentation.html` | Developer Documentation |
| `token-calculator.html` | AI Token Calculator (AI Resources dropdown) ✅ |
| `blog.html` | Blog index page ✅ |
| `blog-post.html` | Blog post template ✅ |
| `chatgpt-api.html` | ChatGPT API guide article |
| `claude-api.html` | Claude API guide article |
| `gemini-api.html` | Gemini API guide article |
| `serve.mjs` | Local dev server (Node.js, port 3000) |
| `screenshot.mjs` | Puppeteer full-page screenshot tool |
| `package.json` + `node_modules/` | npm deps (puppeteer) |
| `AI_Token_logoPNG.avif` | Brand logo — corgi with crown |
| `Brand Guidelines_1.png` | Colors, fonts, logo rules |
| `Brand Guidelines_2.png` | Iconography, button styles |
| `home_content.png` | Chinese homepage content (translation source) |
| `go-live-guide.md` | Phase 1–8 roadmap: Astro migration, Sanity CMS, Cloudflare Pages, i18n |
| `CLAUDE.md` | Project rules for Claude — read every session |
| `summary.md` | This file |

---

## Pages Still To Build
| Page | Nav location | Status |
|---|---|---|
| Blog index | Top-level nav | ✅ built (`blog.html`) |
| Blog post template | — | ✅ built (`blog-post.html`) |

**HTML prototype is feature-complete.** All nav links are wired. Next phase: Astro migration (see `go-live-guide.md`).

---

## Session 6 Changes

### Animated Gradient Hero (all pages)
- Translated Aceternity UI `BackgroundGradientAnimation` React component → pure CSS + vanilla JS for static HTML
- Implemented on hero and all page banners: CSS blob animations, SVG goo filter (`feGaussianBlur` + `feColorMatrix`), `requestAnimationFrame` mouse-tracking pointer
- Brand colors used: `#2A1F5C`, `#0D1547` (dark purple base), `#6155F1`, `#3E81E5` blobs
- Confirmed working on all 10 pages via Puppeteer DOM audit

### Link Wiring (index.html)
- Hero mini API pricing table "View API Comparison" → `https://www.aitokenking.com.tw/models`
- Hero "View full comparison" CTA → `https://www.aitokenking.com.tw/models`
- API Comparison section "View Full Comparison" → `https://www.aitokenking.com.tw/models`
- Getting Started "Choose Your Model" card CTA → `https://www.aitokenking.com.tw/models`
- Fundamentals "Learn Token Basics" CTA → `beginners-guide.html`

### Blog Spacing Fix
- Featured section top padding changed from `0` to `3rem` for even visual rhythm with hero

### API Card Brand Icons (index.html — the 3 API chooser cards)
Replaced generic SVG icons with brand-accurate inline SVGs:
- **ChatGPT/OpenAI**: OpenAI interlocking knot SVG (black `#111111`), bg `#F2F2F2`, card border `rgba(0,0,0,0.08)`, CTA `#111111`
- **Gemini**: 4-pointed star with `linearGradient` `#4285F4 → #7C3AED`, bg `#EEF2FF`, card border `rgba(66,133,244,0.15)`, CTA `#4285F4`
- **Claude/Anthropic**: 12-ray sunburst asterisk (`#CC785C`), bg `#FDF0EB`, card border `rgba(204,120,92,0.18)`, CTA `#CC785C`

## Shared Nav Code Pattern
Every page uses identical nav HTML + dropdown JS. When adding a new page, copy the nav block from an existing page and update:
1. The active `.active` class to the correct link
2. The active dropdown parent button if the page lives inside a dropdown
3. The new page's own link from `#` → its filename in all other pages

The dropdown JS block is always at the bottom of the `<script>` tag — do not duplicate it, just copy it as-is.

---

## Web Crawl Capability (for future sessions)
Claude can fetch the Chinese source site directly via `WebFetch` if given the URL. This works well for extracting text/copy from all remaining pages at once. Limitations: strips CSS/JS, won't work if the site is JS-rendered (SPA) or login-gated. Best hybrid approach: fetch URL for copy, use screenshots for layout reference on visually complex pages.

---

## Important Rules (from CLAUDE.md)
- Always invoke `frontend-design` skill before writing any frontend code
- Always check `brand_assets/` folder before designing
- Single self-contained HTML files, all styles inline
- Tailwind CSS via CDN
- Placeholder images via `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive
- Never use default Tailwind blue/indigo as primary
- Never use `transition-all`
- Every clickable element needs hover, focus-visible, and active states
- Screenshot workflow: start server → screenshot → audit via `page.evaluate()` → fix → re-screenshot (min 2 rounds)
- The VSCode Read tool does NOT render PNG images — always audit screenshots programmatically via Puppeteer
- Server may already be running from a previous session — check before starting a new one (`curl -s http://localhost:3000` or just run `node serve.mjs` and it'll error if port is taken)
