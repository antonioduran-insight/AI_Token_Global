# AI Token Global — Project Owner's Guide
## A Plain-English Reference for Every File and Folder

**Prepared for:** Antonio Duran, Project Owner
**Project website:** https://www.aitoken.global/en/
**Date:** May 2026

---

# How to Use This Guide

This guide is a reference document, not a how-to manual. Think of it as the owner's manual that came in the glove compartment of a new car — you read it to understand what everything is, where it lives, and what it does. You don't need to memorize it. Use it to:

- Understand what a developer is talking about when they reference a file
- Know where to look when something needs to change
- Understand what is safe to edit yourself (in Sanity) vs. what requires a developer
- Prepare for a handoff, a new developer onboarding, or a vendor conversation

**Abbreviation guide used in this document:**
- EN = English version of the site
- ES = Spanish version of the site
- CMS = Content Management System (the admin panel where content is written and edited)
- URL = the web address (e.g., `/en/ai-trends` is the URL for the AI Trends page)

---

---

# PART ONE: THE BIG PICTURE

## How This Website Works — The Restaurant Analogy

Before diving into individual files, it helps to understand how the whole system fits together. Think of the website like a restaurant:

**The Dining Room (what visitors see):**
The live website at `www.aitoken.global` — the published pages that anyone in the world can visit. Visitors never see how the kitchen works.

**The Kitchen (where the work happens):**
Three separate systems work together behind the scenes to produce what visitors see.

**Kitchen Station 1 — Sanity CMS (the walk-in refrigerator)**
This is where all your content lives. Headlines, body text, blog posts, images, FAQ answers, page descriptions — all of it sits in Sanity's cloud database, organized and ready to use. You access Sanity through a browser-based admin panel at `aitokenglobal.sanity.studio`. This is where you (or a content editor) make changes to what the site says, without touching any code.

**Kitchen Station 2 — Astro (the chef)**
Astro is the software framework that actually builds the website. When a build runs, Astro reaches into Sanity (the refrigerator), pulls out all the content, and assembles it into finished HTML pages — the actual web pages that will be served to visitors. Astro reads the content, applies the design, and outputs a complete, ready-to-serve website. This "cooking" process takes about 3–5 minutes and is called a "build."

**Kitchen Station 3 — AWS Amplify (the delivery service)**
Once Astro finishes building the site, AWS Amplify takes the finished pages and puts them onto servers around the world. When a visitor in Mexico or London opens your website, Amplify delivers the nearest copy of your pages to their browser quickly. Amplify also watches your GitHub code repository — the moment you push new code, it automatically triggers a new build. The site is currently live and deployed here.

**The Recipe Book (GitHub)**
The code — all the instructions for how to build the site — lives in a GitHub repository at `antonioduran-insight/AI_Token_Global`. Think of GitHub as a versioned recipe book. Every change to the code is recorded, dated, and can be rolled back if something goes wrong. No content lives in GitHub — content lives in Sanity.

**The Translation Pipeline (the prep cook)**
A set of scripts in the `scripts/` folder can automatically translate an entire page from English to another language using an AI model (Claude, accessed via the AI Token King API). Once a page is written in English and imported to Sanity, one command can generate the Spanish version. This same pipeline will eventually handle Chinese, Indonesian, and more.

---

## The Full Build Flow, Step by Step

Here is exactly what happens when a change goes live:

```
You make a content change in Sanity Studio
         |
         v
Sanity sends a "webhook" notification to AWS Amplify
(a webhook is like a phone call from Sanity saying "something changed")
         |
         v
AWS Amplify starts a new build
         |
         v
Astro runs: fetches ALL content from Sanity (all pages, all languages)
         |
         v
Astro assembles complete HTML pages for /en/ and /es/
(every page, every blog post, all at once)
         |
         v
The finished pages are uploaded to AWS's servers around the world
         |
         v
Visitors see the updated site (within 3-5 minutes of your Sanity publish)
```

Note: The Sanity-to-Amplify webhook (the automatic trigger) is on the task list but not yet wired up. Until it is, a developer needs to manually trigger a rebuild by pushing code to GitHub, or you can trigger it manually from the AWS Amplify console.

---

## The Three Things You Control vs. The Three Things Developers Control

**You control (via Sanity Studio, in your browser):**
1. All text content on every page — headlines, body copy, FAQ answers, button labels in context
2. Blog posts — creating, editing, publishing, unpublishing
3. Images attached to content — cover images for blog posts, page-level images

**Developers control (via code changes):**
1. Layout and design — how the page looks, spacing, colors, fonts
2. Adding new pages, new languages, or new content fields
3. Integrations — analytics, webhooks, new tools

**Either party controls:**
1. Sanity schema changes (adding a new field) — requires a developer to define it in code, but then you fill it in via Sanity Studio

---

---

# PART TWO: FILE AND FOLDER REFERENCE

The rest of this guide walks through every folder and file in the project, in plain English.

---

## TOP-LEVEL FILES
### (Files sitting directly in the project root folder)

---

### `README.md`

**What it is:** A text document (markdown format) that typically explains a project.

**What it does:** This particular README is the generic boilerplate that came with the Astro starter template when the project was first set up. It explains Astro in general terms, not this specific project.

**How it connects:** It does not connect to the live site — it is purely documentation that lives in the GitHub repository for any developer who opens the repo for the first time.

**Owner note:** You can ignore this file. For actual project context, read `summary.md` instead.

---

### `summary.md`

**What it is:** The real, up-to-date project status document — written specifically for this project, not a generic template.

**What it does:** Tracks what has been done, what is pending, what content is live in which language, the brand guidelines, design system notes, dev commands, and current task queue. It is the single source of truth for where the project stands at any given moment.

**How it connects:** This is a living document. Developers and Claude Code (the AI assistant) both read this to understand project context before doing any work. It is updated after every significant task.

**Owner note:** This is the first document any developer should read. If you ever brief a new developer or agency on this project, point them here first. It currently lives at the root of the project folder.

---

### `CLAUDE.md`

**What it is:** A set of instructions specifically for Claude Code — the AI assistant (powered by Anthropic's Claude model) that is used to build and maintain this project.

**What it does:** Every time Claude Code opens this project, it reads this file automatically. The file tells Claude Code exactly how to work on this project: which server to use, how to take screenshots, what design rules to follow (never use certain colors, always use the brand font, etc.), and critical technical rules like "only animate opacity and transform — never transition-all."

**How it connects:** This file has no effect on the live website. It purely governs how the AI assistant behaves when working in this codebase. If you bring in a human developer, they can read it too — it is full of useful technical constraints for this project.

**Owner note:** Think of this as the "house rules" card posted inside a vacation rental — for whoever is working on the project, not for your visitors.

---

### `go-live-guide.md`

**What it is:** A step-by-step deployment checklist that was written and used when setting up the live production environment.

**What it does:** Documents how the project was set up end-to-end: from the original HTML prototype, through migrating to Astro, connecting Sanity, deploying to AWS Amplify, setting up the domain, and configuring automatic rebuilds. It also includes the cost summary for running the project.

**How it connects:** This file does not affect the live site. It is a historical reference and a recovery guide. If this project ever needed to be rebuilt from scratch, or moved to a different hosting provider, this guide is the starting point.

**Owner note:** Useful if you ever change hosting providers or onboard a new technical team. Keep it; it saves days of reverse-engineering.

---

### `package.json`

**What it is:** The project's "ingredients list" — it tells the computer what software packages this project depends on, and what commands are available to run.

**What it does:**
- Lists every software library the project uses (Astro, the Sanity client library, the sitemap generator, etc.)
- Defines the key commands a developer runs in the terminal:
  - `npm run dev` — starts a local preview of the site at `http://localhost:4321`
  - `npm run build` — builds the full production site (what gets deployed)
  - `npm run studio` — starts the Sanity Studio admin panel locally for development

**How it connects:** This file is read by Node.js (the JavaScript runtime environment) every time a developer installs or runs the project. It is the gateway to all development tasks.

**Owner note:** You will never edit this file yourself. If a developer adds a new library to the project, this file gets updated. Think of it as the ingredients manifest — accurate, but you don't shop from it directly.

---

### `package-lock.json`

**What it is:** An auto-generated companion to `package.json` that records the exact version of every single software package used.

**What it does:** Ensures that every developer working on the project, and every build on AWS Amplify, uses identical versions of every library — no surprises from an accidental upgrade. When you run `npm install`, this file is the instruction set.

**How it connects:** Generated automatically. Do not edit it manually — it is managed by Node.js tooling.

**Owner note:** Ignore this file. It exists to prevent "it works on my machine but not yours" problems.

---

### `tsconfig.json`

**What it is:** Configuration for TypeScript — a variant of JavaScript that adds type-checking.

**What it does:** Tells the TypeScript compiler how to interpret the code in this project. Defines rules like which JavaScript version to compile to and which folders to include.

**How it connects:** Astro uses TypeScript, and the Sanity queries in `src/lib/sanity.ts` are written in TypeScript. This config file makes sure everything compiles correctly.

**Owner note:** You will never touch this file. It is set up once and left alone unless a developer upgrades Astro or TypeScript versions.

---

### `astro.config.mjs`

**What it is:** The master configuration file for the Astro framework.

**What it does:** Sets two critical things:
1. The production URL of the site: `https://aitoken.global` — this is used when generating the sitemap (the file that tells Google every URL on your site)
2. Registers the sitemap plugin, which automatically generates a `sitemap.xml` file at build time

**How it connects:** Read by Astro every time it builds the site. The `site` URL is used by the sitemap generator and is embedded in canonical URL tags (which tell Google the "official" address of each page, preventing duplicate-content issues).

**Owner note:** Only needs to change if the domain name changes. Currently set correctly to `https://aitoken.global`.

---

### `.env`

**What it is:** A file containing secret configuration values (called "environment variables") — specifically, the credentials needed to connect to Sanity.

**What it does:** Stores:
- `PUBLIC_SANITY_PROJECT_ID` = `mq3wxr8n` (the unique identifier of your Sanity project)
- `PUBLIC_SANITY_DATASET` = `production` (which database within Sanity to use)

**How it connects:** Astro reads this file when building the site, and uses these values to connect to Sanity. Without these values, the site cannot fetch any content.

**Critical security note:** This file is listed in `.gitignore` — it is intentionally never uploaded to GitHub. The same values are stored separately in the AWS Amplify Console (under App settings > Environment variables) for production builds. If `.env` ever appeared in the GitHub repository, it would be a security issue requiring immediate action.

**Owner note:** You should have a copy of this file's values stored somewhere safe offline (such as a password manager). If a developer needs to work on this project on a new computer, they need these values.

---

### `.env.example`

**What it is:** A safe, public template showing what the `.env` file should look like — without the actual secret values.

**What it does:** Shows the variable names (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`) without the actual values. Any developer who clones the repository from GitHub sees this file and knows what to fill in.

**How it connects:** This file is committed to GitHub (unlike `.env`). It is documentation, not functional code.

**Owner note:** If you ever add a new environment variable (like a Google Analytics ID), you add a placeholder line here so future developers know it is needed.

---

### `.gitignore`

**What it is:** A list of files and folders that Git (the version control system) should never upload to GitHub.

**What it does:** Prevents sensitive or unnecessary files from appearing in the GitHub repository. Key exclusions:
- `.env` — secrets
- `node_modules/` — the software packages folder (enormous, and regenerated automatically by `npm install`)
- `dist/` — the built website output (regenerated at each deploy)
- `temporary screenshots/` — screenshot files taken during development

**How it connects:** Git reads this file automatically before every commit. Items on this list are silently skipped.

**Owner note:** This file is a security and housekeeping tool. You will never edit it unless adding a new category of file you want excluded from GitHub.

---

### `AI_Token_logoPNG.avif`

**What it is:** A copy of the AI Token logo image file sitting at the project root (top level).

**What it does:** This is a duplicate of the same file in the `public/` folder (see below). The copy at the root level exists from an earlier stage of the project.

**How it connects:** The live site uses the version in `public/` — that is the authoritative location. This root-level copy is not actively referenced.

**Owner note:** This file can safely be left as-is. The image format `.avif` is a modern, highly compressed image format — smaller file size than PNG or JPEG with the same visual quality.

---

### `production.tar.gz`

**What it is:** A compressed backup file (an archive, like a `.zip`) of the Sanity CMS dataset.

**What it does:** Contains a snapshot of all Sanity content (all pages, all blog posts, all images) at the time it was exported. If the Sanity project were ever accidentally deleted or corrupted, this backup could be used to restore all content.

**How it connects:** This is a manual backup — it is not automatically updated. It does not connect to the live site.

**Owner note:** Keep this file. The date it was created should be documented alongside it. Note that a more automated weekly backup is on the Phase 5 task list (task 5A-11). The filename `production` refers to the Sanity dataset name, not the site going live.

---

### `screenshot.mjs` and `serve.mjs`

**What they are:** Small utility programs (JavaScript files) that run from the terminal.

**What they do:**
- `serve.mjs` — starts a simple local web server that serves files from the project folder at `http://localhost:3000`. Used when a developer wants to preview the archived HTML prototypes.
- `screenshot.mjs` — uses a headless browser (Puppeteer) to take an automated screenshot of any web page and save it to the `temporary screenshots/` folder.

**How they connect:** Used exclusively during development and design review. They have no effect on the live site.

**Owner note:** These are developer tools. You will rarely if ever need to touch them.

---

---

## THE `src/` FOLDER
### The Website's Source Code

Everything in `src/` is the actual code that builds the website. Think of this folder as the blueprints for the building — not the building itself (that's `dist/`), but the instructions for how to construct it.

---

### `src/pages/`
**Pages: Each File = One URL**

Every file in this folder corresponds to a web page on the live site. The structure mirrors the URL structure exactly.

---

#### `src/pages/index.astro`

**What it is:** The entry page for the root URL `/`.

**What it does:** Immediately redirects anyone who visits `https://aitoken.global/` (without any language code) to `https://aitoken.global/en/`. This ensures visitors always land on a proper language version of the site.

**How it connects:** This is a simple redirect — there is no visible content here. It is equivalent to a "lobby" that points you to the right floor.

---

#### `src/pages/[lang]/` — The Language Folder

**What it is:** A special folder whose name (`[lang]`) is a placeholder, not a literal folder named "lang."

**What it does:** Astro uses this placeholder pattern to automatically generate pages for every supported language without duplicating the code. When the site builds, Astro looks at the `SUPPORTED_LANGS` list (currently `['en', 'es']`) and creates a copy of every page inside this folder for each language:
- `[lang]/index.astro` becomes `/en/` and `/es/`
- `[lang]/ai-trends.astro` becomes `/en/ai-trends` and `/es/ai-trends`
- And so on for every page

This is the key architectural decision that makes scaling to 10–15 languages practical — you write the page once, and it works for every language automatically.

---

#### `src/pages/[lang]/index.astro` — Homepage

**What it is:** The code template for the homepage.

**What it does:** Fetches the homepage content from Sanity (for whichever language is being built), then assembles the page: hero section with headline and subheadline, feature/benefits sections, calls-to-action pointing to the AI Token King platform, and any other homepage blocks.

**How it connects:** Content comes from Sanity (`homePage` document, filtered by language). Layout and design come from this file and `src/styles/global.css`. The `BaseLayout.astro` wrapper provides the nav, footer, and HTML head.

---

#### `src/pages/[lang]/ai-trends.astro` — AI Trends Page

**What it is:** The template for the AI Trends information page.

**What it does:** Fetches the AI Trends page content from Sanity and renders: hero headline, trend cards (each with a topic tag, title, body text, and colored accent), audience sections, an FAQ accordion, and a PDF download card (note: the download URL is currently blank in Sanity — see `summary.md` known gaps).

**How it connects:** Uses the `aiTrendsPage` document type in Sanity. Both EN and ES content are live.

---

#### `src/pages/[lang]/api-compare.astro` — API Comparison Page

**What it is:** The template for the page that compares AI API providers (OpenAI, Anthropic, Google).

**What it does:** Renders a comparison of AI API providers — pricing, features, speed, use-case fit. Content is managed in Sanity.

**How it connects:** Uses the `apiComparePage` document type in Sanity.

---

#### `src/pages/[lang]/beginners-guide.astro` — Beginner's Guide

**What it is:** The template for the introductory guide aimed at people new to AI.

**What it does:** Renders a beginner-friendly explainer page about AI tokens, APIs, and how the AI Token King platform works. Content managed in Sanity.

---

#### `src/pages/[lang]/chatgpt-api.astro` — ChatGPT API Page

**What it is:** A dedicated page about OpenAI's ChatGPT API.

**What it does:** Uses the shared `ApiModelPage` component (see `src/components/`) to render a structured information page about ChatGPT's API — pricing, capabilities, use cases, FAQ. The three API pages (ChatGPT, Claude, Gemini) all share the same layout template.

---

#### `src/pages/[lang]/claude-api.astro` — Claude API Page

**What it is:** A dedicated page about Anthropic's Claude API (the same AI model that powers Claude Code, which built this website).

**What it does:** Uses the shared `ApiModelPage` component to render information about Claude's API. Same structure as the ChatGPT API page.

---

#### `src/pages/[lang]/gemini-api.astro` — Gemini API Page

**What it is:** A dedicated page about Google's Gemini API.

**What it does:** Uses the shared `ApiModelPage` component to render information about Google Gemini's API.

---

#### `src/pages/[lang]/compliance.astro` — Compliance Page

**What it is:** The template for the Business AI Compliance page.

**What it does:** Renders information about regulatory compliance considerations when using AI APIs in a business context. Content managed in Sanity.

---

#### `src/pages/[lang]/token-calculator.astro` — Token Calculator Page

**What it is:** The template for the interactive token cost calculator.

**What it does:** Renders a working JavaScript calculator that lets users estimate how much an AI API would cost for their use case. The calculator logic itself is hardcoded in JavaScript (it uses fixed formulas for token counting and pricing). The FAQ section and call-to-action text at the bottom come from Sanity.

**How it connects:** This is the only page where the main interactive feature (the calculator) is not driven by Sanity — the math is built into the page itself. The supporting content (FAQ, CTA) is Sanity-powered.

---

#### `src/pages/[lang]/use-cases.astro` — Use Cases Page

**What it is:** The template for the Use Cases page.

**What it does:** Renders real-world examples and applications of AI APIs across different industries and scenarios. Content managed in Sanity.

---

#### `src/pages/[lang]/user-guide.astro` — User Guide Page

**What it is:** The template for the AI Token King User Guide.

**What it does:** Renders a how-to guide for using the AI Token King aggregator platform (`aitokenking.com.tw`). Serves as an onboarding resource for new users of the platform. Content managed in Sanity.

---

#### `src/pages/[lang]/blog/index.astro` — Blog Listing Page

**What it is:** The template for the blog's main index page.

**What it does:** Fetches all published blog posts for the current language from Sanity and renders them as a grid of cards (each with a title, cover image, excerpt, category, and date). Currently shows all posts together. Category filter tabs (allowing visitors to filter by topic) are built into the page as of the most recent commit (Task 13), wired to the `category` field on each post.

**How it connects:** Fetches all `post` documents from Sanity where `language == currentLang` and `_type == "post"`.

---

#### `src/pages/[lang]/blog/[slug].astro` — Individual Blog Post Page

**What it is:** The template for a single blog post page.

**What it does:** The `[slug]` placeholder (like `[lang]`) means this one file generates a unique page for every blog post. When the site builds, Astro queries Sanity for all published posts, and generates one page per post. Each page renders the post's title, cover image, date, body content (formatted text with headings, paragraphs, links), and a FAQ section if one is attached to the post.

**How it connects:** Uses the `slug` field on each `post` document in Sanity to create the URL. For example, a post with slug `what-is-gpt-4` becomes the page at `/en/blog/what-is-gpt-4`.

---

### `src/components/`
**Reusable Building Blocks**

Components are page elements that appear on multiple pages and are built once, then reused. Think of them as pre-built furniture — a sofa design that can be dropped into any room.

---

#### `src/components/Nav.astro` — The Navigation Bar

**What it is:** The navigation bar that appears at the top of every single page on the site.

**What it does:**
- Renders the AI Token logo
- Shows the main navigation links (AI Trends, User Guide, Compliance, Compare Models, Use Cases, Beginners Guide, Blog, Documentation, Get Started)
- Shows the language switcher button that lets visitors switch between English and Spanish
- On small screens (mobile phones), collapses to a hamburger menu icon that opens a slide-out panel

**How it connects:** This component is included in `BaseLayout.astro`, which wraps every page. The navigation links and their labels come from `src/i18n/en.json` and `es.json` (the translation files). The language switcher dynamically reads the `SUPPORTED_LANGS` list, so adding a third language (e.g., Chinese) automatically adds it to the switcher without any code changes to this file.

**Technical note for developers:** The mobile menu uses `.mobile-nav-panel` + `.is-open` CSS class toggle. Never manipulate `.desktop-nav` via JavaScript.

---

#### `src/components/Footer.astro` — The Footer

**What it is:** The footer that appears at the bottom of every page.

**What it does:** Renders the site footer with the logo, brief tagline, quick navigation links, legal links (Privacy Policy, Terms — currently placeholder links), and copyright notice. All text is translation-aware (pulls from the i18n files).

**How it connects:** Included in `BaseLayout.astro`, like the Nav. Footer layout breakpoints (the point at which the footer columns stack on small screens) are defined in `src/styles/global.css`, not in this component directly.

---

#### `src/components/ApiModelPage.astro` — Shared API Model Template

**What it is:** A reusable page template shared by the three API pages: ChatGPT API, Claude API, and Gemini API.

**What it does:** All three API pages have the exact same structural layout — hero, features grid, pricing section, FAQ, CTA. Rather than writing this structure three times, it is written once here and each page passes in its specific content. The component receives the content as a parameter and assembles the full page.

**How it connects:** Called by `chatgpt-api.astro`, `claude-api.astro`, and `gemini-api.astro`. Each of those files fetches its specific data from Sanity and hands it to this component for rendering.

**Analogy:** Think of this as a form template. The form structure (labels, layout, fields) is the same. What changes is the data filled into the form.

---

### `src/layouts/`
**The Page Wrapper**

---

#### `src/layouts/BaseLayout.astro` — The Master Page Template

**What it is:** The HTML wrapper that every single page on the site uses. It is the first file built for every page, and the last to close.

**What it does:** Contains everything that appears on every page without exception:
- The HTML `<head>` section (invisible to visitors, but critical for search engines):
  - Page title and meta description (for Google search results)
  - Canonical URL tag (tells Google the "official" address of each page)
  - `hreflang` tags (tells Google that `/en/ai-trends` and `/es/ai-trends` are the same page in different languages — critical for multilingual SEO)
  - Open Graph tags (the title, description, and image that appear when someone shares a link on LinkedIn, WhatsApp, etc.)
  - Google Fonts loading (the Kanit heading font and Plus Jakarta Sans body font)
- The `<Nav>` component at the top
- A `<slot>` (placeholder) where each page's unique content is inserted
- The `<Footer>` component at the bottom
- The link to `global.css` (the design system)

**How it connects:** Every `.astro` page file "wraps" itself in BaseLayout. Think of it as the outer envelope — every page slides inside it and gets the nav, footer, fonts, and SEO tags automatically.

---

### `src/i18n/`
**The Translation System**

`i18n` stands for "internationalization" — a common abbreviation in web development. This folder handles the translation of UI text (the text that is part of the interface itself, not the main page content).

**Important distinction:** There are two types of text on this site:
1. **Content text** (headlines, body paragraphs, blog posts) — lives in Sanity CMS
2. **Interface text** (button labels, nav item names, "Read more", "Subscribe", form labels) — lives in this `i18n/` folder

---

#### `src/i18n/en.json` — English Interface Strings

**What it is:** A JSON file (a structured text file) containing approximately 60+ English phrases used throughout the site's interface.

**What it does:** Every button label, nav item name, "Read more" link, "Back to blog" link, form label, accessibility text, and footer legal link label is stored here as a named string. For example:
- `"nav.blog"` = `"Blog"`
- `"blog.readMore"` = `"Read More"`
- `"footer.privacy"` = `"Privacy Policy"`

**How it connects:** The function `useTranslations('en')` (defined in `index.ts`) loads this file and returns a lookup function. Every `.astro` page calls this function and uses `t('key.name')` instead of hardcoding text. This is what makes it possible to add a new language without editing every page file.

---

#### `src/i18n/es.json` — Spanish Interface Strings

**What it is:** The Spanish equivalent of `en.json` — same structure, same keys, Spanish values.

**What it does:** When Astro builds the `/es/` pages, it loads this file instead of `en.json`. Every interface element automatically appears in Spanish.

**How it connects:** Must stay perfectly in sync with `en.json` — every key present in one file must be present in the other. When a new language is added (e.g., Chinese), a new `zh-CN.json` file is created with the same keys.

---

#### `src/i18n/index.ts` — The Translation Logic

**What it is:** The JavaScript/TypeScript file that controls the translation system.

**What it does:** Three things:
1. **`SUPPORTED_LANGS`** — the master list of active languages: currently `['en', 'es']`. Adding a language to this list is the single change that makes Astro start building pages for that language.
2. **`LANG_META`** — metadata about each language: its locale code (e.g., `en-US`, `es-ES`), text direction (left-to-right for most languages, right-to-left for Arabic/Hebrew), and display name.
3. **`useTranslations(lang)`** — the function that loads the right JSON file for a given language and returns a lookup function. Every page uses this.

**How it connects:** This is the backbone of the multilingual system. When adding language 3 (e.g., Simplified Chinese `zh-CN`), you add it to `SUPPORTED_LANGS`, add its metadata to `LANG_META`, and create `src/i18n/zh-CN.json`. That is the full i18n addition for the interface layer.

---

### `src/lib/`
**The Connection to Sanity**

---

#### `src/lib/sanity.ts` — The Sanity Query Layer

**What it is:** The file that connects the website to the Sanity CMS database. It is the single place where all "fetch content from Sanity" logic lives.

**What it does:** Two things:
1. Creates the Sanity client (the connection object) using the project ID and dataset from `.env`
2. Contains all GROQ queries — one per page type

GROQ (which stands for "Graph-Relational Object Queries" — think of it as Sanity's search language, similar to how you type terms into a search bar) is how you ask Sanity "give me the homepage content in English." Each query is written once and given a descriptive name like `getAiTrendsPage(lang)` or `getBlogPosts(lang)`.

**How it connects:** Every page file in `src/pages/[lang]/` imports the function it needs from this file. For example, the AI Trends page calls `getAiTrendsPage('en')` to get the English content. This is the only file in the project that "talks" to Sanity — all other files go through this one.

**Analogy:** Think of this file as the waiter in the restaurant analogy. It knows the full menu (all possible content), takes the kitchen's (Astro's) order, goes to the walk-in refrigerator (Sanity), and brings back exactly what was ordered.

---

### `src/styles/`
**The Design System**

---

#### `src/styles/global.css` — The Visual Design System

**What it is:** The master CSS (Cascading Style Sheets) file that defines how everything on the site looks.

**What it does:** This is a comprehensive design system, not just a few color choices. It defines:
- **Brand colors:** Primary purple `#6155F1`, secondary blue `#3E81E5`, background lavender `#F5F2FF`, and all supporting tones
- **Typography:** Kanit font for all headings (with tight letter-spacing), Plus Jakarta Sans for body text (with generous line-height for readability)
- **Responsive breakpoints:** The screen widths at which the layout changes — 640px (mobile), 900px (tablet), 1024px (desktop navigation appears)
- **Component styles:** Card designs (white background, purple-tinted shadow, lift on hover), button variants (primary, secondary, ghost, download), section label pills, and more
- **Animation rules:** Fade-up entrance animation for page elements, FAQ accordion open/close animation
- **Mobile navigation:** The slide-out mobile menu panel styles
- **Grain texture overlay:** A subtle visual texture applied over the page background for depth

**How it connects:** Loaded by `BaseLayout.astro` and applied to every page on the site. If you change the primary color in this file, it changes sitewide. This is the authoritative source of the design system.

---

---

## THE `studio/` FOLDER
### The Sanity CMS Admin Panel

The `studio/` folder contains the code for the Sanity Studio — the browser-based content management interface at `aitokenglobal.sanity.studio`. When you log into Sanity and see the admin panel where you edit content, you are using this code.

The Studio code lives in the GitHub repository so schema changes (adding new fields, new content types) can be version-controlled and deployed.

---

### `studio/sanity.config.ts` — Studio Master Configuration

**What it is:** The central configuration file for the Sanity Studio.

**What it does:** Registers all the content schemas (see below) so the Studio knows what types of content exist and what fields they have. Also configures the multilingual plugin (which adds the language switcher visible when editing documents in the Studio).

**How it connects:** This is the "manifest" file. If you add a new schema type (e.g., an Author schema), you add it here to make it appear in the Studio.

---

### `studio/sanity.cli.ts` — Studio CLI Configuration

**What it is:** Configuration for the Sanity command-line tool.

**What it does:** Tells the Sanity CLI which project and dataset to connect to when deploying the Studio. Used when a developer runs `npx sanity deploy` to push schema changes live.

**How it connects:** Used only during deployment of schema changes. Has no effect on day-to-day content editing.

---

### `studio/schemas/` — Content Type Definitions
**Think of schemas like form templates**

Each file in this folder defines one type of content in Sanity — what fields it has, what types those fields are, and what they are called. If you wanted to add a new field to a page (say, a "featured image" at the top of the Compliance page), a developer would add that field to the corresponding schema file, then deploy the Studio.

---

#### `studio/schemas/homePage.ts` — Homepage Schema

**What it is:** The form template for the homepage content document.

**What it does:** Defines every field the homepage has in Sanity — hero headline, hero subtitle, statistics, body sections, calls-to-action, FAQ items, SEO title, SEO description, OG image, and more. The `language` field on this schema is what allows separate EN and ES versions to coexist.

**How it connects:** When you open Sanity Studio and navigate to "Home Page," the form you see is generated from this schema. The fields defined here exactly match what the Astro homepage fetches via `src/lib/sanity.ts`.

---

#### `studio/schemas/aiTrendsPage.ts` — AI Trends Page Schema

**What it is:** The form template for the AI Trends page.

**What it does:** Defines fields including: hero headline, hero subtitle, intro title, trend cards (each with a tag, title, body, pull quote, and accent color), audience section, FAQ items, download card fields (download title, description, and URL — the URL field is currently blank in both EN and ES), and SEO fields.

**Known gap:** The `downloadUrl` field is currently empty in Sanity for both languages. A null guard in the Astro template hides the download card until this is filled in. Once you add a real PDF URL in Sanity Studio, the download card will appear automatically.

---

#### `studio/schemas/apiComparePage.ts`, `chatgptApiPage`, `claudeApiPage`, `geminiApiPage`

**What they are:** Form templates for the API comparison and individual API pages.

**What they do:** Define the content fields for these pages — intro text, feature lists, pricing tables, FAQ items, and CTA blocks. The three individual API page schemas share a common base (defined in `apiModelPage.ts`).

---

#### `studio/schemas/apiModelPage.ts` — Shared API Model Page Schema

**What it is:** A reusable schema base shared by the ChatGPT, Claude, and Gemini API page schemas.

**What it does:** Defines the fields common to all three API pages, so those fields are not duplicated across three separate schema files. Each API-specific schema extends this base and adds its own unique fields.

---

#### `studio/schemas/beginnersGuidePage.ts`, `compliancePage.ts`, `tokenCalculatorPage.ts`, `useCasesPage.ts`, `userGuidePage.ts`

**What they are:** Form templates for the remaining content pages.

**What they do:** Each defines the fields for its respective page. The Token Calculator schema, for example, defines only the FAQ items and CTA text at the bottom (since the calculator widget itself is hardcoded in the Astro page).

---

#### `studio/schemas/post.ts` — Blog Post Schema

**What it is:** The form template for a blog post.

**What it does:** Defines all the fields a blog post has:
- `title` — the post headline
- `slug` — the URL-safe identifier (e.g., `what-is-gpt-4`) — used to build the post's URL
- `publishedAt` — publication date and time
- `language` — which language this post is in (`en`, `es`, etc.)
- `category` — the topic category (e.g., `getting-started`, `api-guides`)
- `articleNumber` — the numeric ID from the source site (aitoken.com.tw), used to link the original article and match images
- `excerpt` — short summary shown in blog listing cards
- `coverImage` — the post's featured image
- `tags` — optional topic tags
- `body` — the full post content in Portable Text format (rich text with headings, paragraphs, links, etc.)
- `faqItems` — optional FAQ block at the end of a post

**How it connects:** This schema powers both the blog listing page (which shows title, excerpt, cover image, category) and the individual post page (which renders the full `body` content).

---

#### `studio/schemas/faqItem.ts` — Reusable FAQ Block

**What it is:** A reusable content block type for FAQ (Frequently Asked Questions) question-and-answer pairs.

**What it does:** Defines two fields: `question` (plain text) and `answer` (rich text, supporting formatted paragraphs). This block type is used as an array field on multiple schemas — homepage, AI Trends page, blog posts, and several others.

**How it connects:** When you add an FAQ item to any page or post in Sanity Studio, you are creating an instance of this schema. All FAQ content across the site comes from these blocks.

---

#### `studio/schemas/imageMeta.ts` — Image with Accessibility Metadata

**What it is:** A reusable schema for an image plus its descriptive text (alt text).

**What it does:** Groups an image asset with an `alt` text field. Alt text is the written description of an image — it appears when an image fails to load, is read by screen readers for visually impaired users, and is used by search engines to understand image content. Having it as a structured field ensures alt text is never forgotten.

**How it connects:** Used wherever an image needs to be paired with alt text — for example, blog post cover images include an `imageMeta` block so the alt text can be stored alongside the image URL.

---

### `studio/config/languages.ts` — Studio Language Configuration

**What it is:** Configuration for the Sanity Studio's multilingual document plugin.

**What it does:** Defines which languages are active in the Studio UI. This is what makes the "EN / ES" language toggle appear inside the Studio when you are editing a page document. When a new language is added to the project, it is added here (as well as to `src/i18n/index.ts` on the website side).

**How it connects:** Read by `studio/sanity.config.ts`. Separate from the website's `SUPPORTED_LANGS` but must always be kept in sync with it.

---

### `studio/components/ArticleNumberFilter.tsx` — Custom Studio Component

**What it is:** A custom React component (a UI building block) added to the Sanity Studio interface.

**What it does:** Adds a filter control to the blog post list view inside Sanity Studio, allowing editors to search or filter posts by their `articleNumber` field. The article number comes from the source site (aitoken.com.tw) and is used when running the import/patch scripts to identify which articles have already been imported.

**How it connects:** Registered in `studio/sanity.config.ts`. Only visible inside the Studio — has no effect on the live website.

---

### `studio/package.json` and `studio/package-lock.json`

**What they are:** The same concept as the root-level `package.json` and `package-lock.json`, but for the Studio specifically.

**What they do:** The Studio is a separate Node.js application with its own dependencies (primarily Sanity's own packages and React). These files manage those dependencies separately from the main website.

---

---

## THE `scripts/` FOLDER
### Automation Scripts

These are standalone programs that run from the terminal (command line), not from the website itself. Think of them as the back-office machinery — they do batch work that would be tedious or impossible to do manually through the Sanity Studio interface.

There are three categories of scripts here:
1. **Import scripts** — take content from data files and push it into Sanity
2. **Patch scripts** — fix or add data to existing Sanity documents
3. **Translation scripts** — use AI to generate translated versions of content

---

### The Import Scripts
`import-home.mjs`, `import-ai-trends.mjs`, `import-api-compare.mjs`, `import-beginners-guide.mjs`, `import-chatgpt-api.mjs`, `import-claude-api.mjs`, `import-gemini-api.mjs`, `import-compliance.mjs`, `import-token-calculator.mjs`, `import-use-cases.mjs`, `import-user-guide.mjs`

**What they are:** One script per content page. Each reads the corresponding data file from `scripts/data/` and writes it into Sanity.

**What they do:** Each script:
1. Reads the relevant `.ndjson` data file (e.g., `homePage-en.ndjson`)
2. Connects to the Sanity API
3. Creates or updates the corresponding document in Sanity with all the content fields

**How they connect:** These scripts were used during the initial setup to bulk-load content into Sanity. Now that content is live, routine updates are made directly in Sanity Studio (no script needed). The scripts remain useful if content ever needs to be regenerated from scratch, or when new structured fields are added and content needs to be batch-updated.

**Analogy:** Think of these as the loading dock — they were used to stock the refrigerator (Sanity) when the restaurant first opened. Now the kitchen is running, you top up ingredients through the front door (Sanity Studio).

---

### `scripts/import-posts.mjs` — Blog Post Import Script

**What it is:** The script that imports blog posts from data files into Sanity.

**What it does:** Reads blog post data (from the `scripts/data/posts-batch-*.ndjson` files), validates the structure, and creates `post` documents in Sanity. This is used when importing a batch of posts sourced from aitoken.com.tw.

**How it connects:** The blog post pipeline runs: source articles are exported from aitoken.com.tw → formatted into the `posts-batch-N.ndjson` structure → imported into Sanity by this script → visible in Sanity Studio for review → published to the live site via the next build.

---

### `scripts/patch-post-images.mjs` — Post Image Repair Script

**What it is:** A maintenance/repair script for blog post cover images.

**What it does:** Blog posts are often imported without cover images (because the image sourcing step happens separately). This script reads an image-mapping file that connects article numbers to image URLs, then finds each matching post in Sanity and attaches the image. It "patches" existing documents rather than replacing them.

**How it connects:** Used as a follow-up step after `import-posts.mjs`. Part of the blog post pipeline.

---

### `scripts/translate-page.mjs` — The Translation Pipeline

**What it is:** The core translation automation script.

**What it does:** Takes any EN `.ndjson` content file (a page's English content) and generates a translated version in any target language. It does this by:
1. Reading the content file and extracting all translatable text fields
2. Sending those text strings (in batches of 80) to Claude via the AI Token King API
3. Receiving the translated text
4. Rebuilding the document in the same structure with translated values
5. Writing the output as a new `.ndjson` file (e.g., `homePage-es.ndjson`)

**How it connects:** This script is the bridge between the English content and all other languages. The translation pipeline workflow:
```
1. Author/edit the EN ndjson data file (in scripts/data/)
2. Import EN content to Sanity
3. Run: AI_TOKEN_KING_KEY=sk-... node scripts/translate-page.mjs scripts/data/PAGE-en.ndjson es
4. Import the generated ES ndjson to Sanity
```

**Technical note:** Uses the AI Token King API (`api.aitokenking.com.tw`) with a `sk-...` API key (stored in `.env` and kept out of GitHub). Translates approximately 80 text fields per API call. Preserves document structure, image references, colors, and URLs — only text content is translated.

---

### `scripts/data/` — Content Data Files

**What it is:** A folder of raw content data files — the "source material" used by the import scripts.

**What they are:**

**Page content files (`.ndjson` format):**
- One pair per page, per language: `homePage-en.ndjson`, `homePage-es.ndjson`, `aiTrendsPage-en.ndjson`, `aiTrendsPage-es.ndjson`, and so on through all 11 pages
- NDJSON stands for "Newline-Delimited JSON" — it is a text file format where each line is a complete JSON object. Think of each line as one database record.
- These files contain the structured content for each page: every headline, body paragraph, FAQ question and answer, etc.

**Blog post files:**
- `posts-batch-1.json` / `posts-batch-1.ndjson` — the first 10 imported blog posts in structured form
- `articles-batch-1 (1).json` — the raw article data as received from the source (aitoken.com.tw), before being structured for Sanity import
- `posts-batch-example.json` — a template file showing exactly what format a blog post must be in for the import script to accept it
- `image-map-example.json` — a template showing the expected format for mapping article numbers to image URLs (used by the patch-post-images script)

**How they connect:** The data files are the inputs; the import scripts are the processors; Sanity is the output destination. Once data is in Sanity, these files serve as an archive — a record of what was imported and when.

---

---

## THE `public/` FOLDER
### Static Files Served Directly

Files in `public/` are served exactly as-is to visitors, without any processing by Astro. What you put here is what the browser receives.

---

### `public/AI_Token_logoPNG.avif` — The Site Logo

**What it is:** The AI Token King logo image — the cute corgi with a crown — in AVIF format.

**What it does:** Used as the site logo in the navigation bar and footer, and as the default Open Graph image for social sharing. The `.avif` format is a highly compressed modern image format — visually identical to PNG but significantly smaller in file size, meaning faster load times.

**How it connects:** Referenced directly in `Nav.astro` and `Footer.astro` as `/AI_Token_logoPNG.avif` (a path from the public root).

---

### `public/favicon.ico`, `public/favicon.svg`, `public/favicon-corgi.png` — Browser Icons

**What they are:** The small icon that appears in the browser tab when someone visits the site.

**What they do:**
- `favicon.ico` — the traditional browser tab icon format, supported by all browsers
- `favicon.svg` — a scalable version of the icon (sharper on high-resolution screens)
- `favicon-corgi.png` — the corgi mascot image used as the favicon

**How they connect:** Referenced in the `<head>` section of `BaseLayout.astro`.

---

### `public/robots.txt` — Search Engine Crawler Instructions

**What it is:** A plain text file that search engine crawlers (Google's bot, Bing's bot, etc.) look for and obey.

**What it does:** Tells search engines which pages or sections of the site they are allowed to crawl and index. Currently configured to allow all crawlers to access all pages, and points to the sitemap URL so Google can find and index all pages efficiently.

**How it connects:** Search engines automatically request `/robots.txt` when they first visit a website. This is a passive file — it does not run any code, it just communicates rules.

---

---

## THE `archive/` FOLDER
### Historical Reference — Not the Live Site

The `archive/` folder is a historical record of the project's earlier stage. Nothing in this folder affects the live website.

---

### HTML Prototype Files (`*.html`)

**What they are:** The original hand-coded HTML pages built before the project was migrated to Astro and Sanity.

**Files include:** `index.html`, `ai-trends.html`, `api-compare.html`, `beginners-guide.html`, `blog-post.html`, `blog.html`, `chatgpt-api.html`, `claude-api.html`, `compliance.html`, `documentation.html`, `gemini-api.html`, `token-calculator.html`, `use-cases.html`, `user-guide.html`

**What they do:** These were the design-source prototypes. Every visual decision — layout, colors, spacing, typography, component structure — was made in these files. When migrating to Astro, these were the reference documents.

**How they connect:** These files are the design source of truth for comparison during fidelity audits (task 5B-01 in the Phase 5 plan compares these archives against the current Astro implementation). They do not serve any live pages.

---

### `archive/en/` and `archive/es/` — Archived Language Versions

**What they are:** Archived translated versions of the HTML prototypes.

**What they do:** Early in the project, the HTML prototypes were translated manually (using Python scripts — see below) into English and Spanish versions and saved here. These represent the translation work done before the Astro/Sanity pipeline existed.

---

### `archive/Brand Guidelines_1.png` and `archive/Brand Guidelines_2.png`

**What they are:** Scanned or exported images of the brand guidelines document.

**What they do:** Visual reference for the brand design — colors, typography, logo usage rules. These informed the design system now codified in `src/styles/global.css`.

**How they connect:** Reference only. The actual design system lives in `global.css`.

---

### `archive/home_content.png`

**What it is:** A screenshot of the homepage content layout, captured during the prototype phase.

**What it does:** Preserved as a visual reference for what the homepage was intended to look like.

---

### `archive/audit-history-2026-05-07/`

**What it is:** A folder containing archived versions of the project audit documents as they existed on May 7, 2026.

**What it does:** Preserves the project state at a specific point in time. The current, updated audit documents live in `audits/` at the project root.

---

### `archive/translate_all.py`, `archive/translate_detailed.py`, `archive/translate_index.py`

**What they are:** Old Python scripts used to translate the HTML prototype pages during the early project phase.

**What they do:** These were the first-generation translation tools — they performed simple text replacement on HTML files to swap out English text for another language. They were replaced by the more sophisticated `scripts/translate-page.mjs` pipeline that preserves Sanity document structure.

**How they connect:** Retired. Kept for historical reference only.

---

### `archive/screenshot.mjs` and `archive/serve.mjs`

**What they are:** Earlier versions of the screenshot and local server utility scripts.

**What they do:** The active, current versions of these scripts now live at the project root. These archived copies are from when the scripts lived inside the archive folder before the Astro migration.

---

### `archive/temporary screenshots/`

**What it is:** A folder of screenshot files taken during the prototype design and development phase.

**What they do:** Document the visual state of the website during development iterations — used for comparing design rounds, confirming fixes, and communicating with collaborators.

---

---

## THE `audits/` FOLDER
### Planning and Quality Documentation

The `audits/` folder contains documentation, audits, and planning documents. None of these files affect the live website. They are the paper trail of quality assurance and strategic planning.

---

### `audits/FINAL_PROJECT_AUDIT.md`

**What it is:** A comprehensive written audit of the entire project, conducted in English.

**What it does:** A full technical, SEO, mobile/quality, and automation audit performed by four specialist "agents" (Claude Code personas) with a supervisor synthesis. Documents every finding — what is working well, what has gaps, and the risk level of each gap. Includes an overall verdict: "GO WITH CAVEATS" (meaning the site was ready to go live with known items to address).

**How it connects:** This audit directly informed the task list in `audits/IMPLEMENTATION_PLAN.md` and later `audits/PHASE_5_TASK_PLAN.md`. It is a point-in-time document — it reflects the project state as of the audit date.

---

### `audits/FINAL_PROJECT_AUDIT_zh-TW.md`

**What it is:** The same comprehensive audit, translated into Traditional Chinese.

**What it does:** Provides the audit in Traditional Chinese for review by Chinese-speaking stakeholders or the Taiwan-based partner team.

---

### `audits/AI_Token_Global_Audit_EN.pdf` and `audits/AI_Token_Global_Audit_zh-TW.pdf`

**What they are:** PDF exports of the audit documents.

**What they do:** Shareable, print-ready versions of the audit. PDFs are easier to share with clients or stakeholders who do not have access to the GitHub repository.

---

### `audits/IMPLEMENTATION_PLAN.md`

**What it is:** The original master task list for the project, superseded by the Phase 5 plan.

**What it does:** Tracked all tasks from initial setup through go-live. Most tasks are now complete. This file is kept for historical reference. The active task list is now `PHASE_5_TASK_PLAN.md`.

---

### `audits/PHASE_5_TASK_PLAN.md`

**What it is:** The current, active task tracker for all remaining work (Phase 5: "Productize").

**What it does:** An extensive, structured project plan covering eight sections of work:
- **5A — Measurement and Ops:** Analytics (Google Analytics 4, Cloudflare), cookie consent banner, Google Search Console, AWS budget alarms, automated Sanity backups
- **5B — Component Fidelity:** Auditing the live Astro site against the original HTML prototypes and fixing any drift
- **5C — Spanish Blog Automation:** Scripts to automatically translate batches of English blog posts to Spanish
- **5D — Simplified Chinese:** Adding Chinese as language 3
- **5E — Framework Extraction:** Pulling the reusable architecture into a starter template for future projects
- **5F — Indonesian:** Adding Indonesian as language 4
- **5G — Content Planning:** Building an editorial calendar based on analytics data
- **5H — Marketing Planning:** Channel strategy, content distribution, partnership outreach

Each task includes an effort estimate (S/M/L), current status, dependencies, and in many cases a ready-to-paste Claude Code prompt for the developer to execute.

**How it connects:** This is the strategic roadmap. When briefing a developer on "what's next," hand them this document.

---

### `audits/phase-5-asana-import.csv`

**What it is:** A CSV (spreadsheet) file containing all Phase 5 tasks formatted for import into Asana (a project management tool).

**What it does:** Allows the Phase 5 task plan to be imported into Asana as a structured project with sections, tasks, and subtasks — so the work can be tracked in Asana rather than (or in addition to) the markdown file.

---

### `audits/automation-audit.md`

**What it is:** A specialized audit focused specifically on what is automated vs. what is manual in the project.

**What it does:** Documents the current state of automation — which steps in the content pipeline require human action, which run automatically, and what opportunities exist to automate further. This informed the Make.com blog pipeline work and the translation batch runner planning in Phase 5.

---

### `audits/hardcoded-content-audit.md`

**What it is:** An audit tracking all text that was originally hardcoded directly into the Astro page files (instead of coming from Sanity).

**What it does:** When the pages were first built, some text was written directly into the `.astro` files as literal English text — not pulled from Sanity and not translatable. This audit tracked all such instances. As of May 2026, all items have been resolved — all content text now comes from Sanity, and all interface text comes from the i18n JSON files.

**Status note:** This audit is effectively closed. Kept for reference.

---

### `audits/qa-mobile-audit.md`

**What it is:** A quality assurance audit specifically focused on mobile device behavior.

**What it does:** Documents testing of the site on mobile screen sizes — checking that the navigation hamburger menu works, the FAQ accordion opens and closes correctly, text is readable at small sizes, touch targets are large enough, and layout does not break on common device widths (iPhone SE at 375px, standard phones at 390px, larger phones at 430px).

---

### `audits/seo-audit.md`

**What it is:** An audit of the site's search engine optimization.

**What it does:** Documents the state of all SEO-relevant elements — meta titles and descriptions, canonical tags, hreflang implementation, Open Graph tags, sitemap, robots.txt, JSON-LD structured data, image alt text, page speed, and more. Outstanding items (JSON-LD structured data, Lighthouse mobile baseline) are carried into Phase 5 tasks.

---

### `audits/technical-audit.md`

**What it is:** A technical code quality audit.

**What it does:** Reviews the codebase for technical debt, security issues, performance issues, code organization, and adherence to best practices. Documents findings across categories: security, performance, code quality, testing, and build/deploy configuration.

---

---

## THE `content-drafts/` FOLDER
### Work-in-Progress Content

---

### `content-drafts/api-compare-en.md`

**What it is:** A draft of the API Compare page content written in Markdown format.

**What it does:** Contains the English content for the API comparison page in a human-readable plain text format. This is a working draft — it may differ from what is currently live in Sanity. Drafts are often written here first, then refined and imported into Sanity.

**How it connects:** Not directly connected to the live site. Used as a staging area for content drafts before they are finalized and imported into Sanity.

---

---

## THE `prompts/` FOLDER
### Saved Claude Code Instructions

---

### `prompts/batch-b-schemas-and-templates.md`

**What it is:** A saved prompt that was written for and used with Claude Code during a previous development session.

**What it does:** Contains the detailed instructions given to Claude Code when building the Batch B schemas and page templates (the second batch of page content types added to Sanity). Saved here so the prompt can be referenced, reused, or adapted for future similar tasks.

**How it connects:** No effect on the live site. A record of past work.

---

---

## AUTO-GENERATED FOLDERS (Do Not Edit)

These folders are created automatically by the build tools and should never be manually edited.

---

### `dist/`

**What it is:** The "distribution" folder — the fully built, ready-to-deploy website.

**What it does:** When `npm run build` runs, Astro assembles every page (fetching content from Sanity) and outputs the finished HTML, CSS, JavaScript, and image files into this folder. AWS Amplify takes this folder and deploys it to the internet.

**How it connects:** This is the "cooked food" being plated for service. It is rebuilt every time a build runs. Never edit files here — any changes would be overwritten on the next build.

---

### `.astro/`

**What it is:** Astro's internal cache folder.

**What it does:** Stores temporary files Astro generates while building, like type definitions. Speeds up subsequent builds.

**How it connects:** Managed entirely by Astro. Ignored by Git (listed in `.gitignore`).

---

### `node_modules/`

**What it is:** The folder where all installed software packages live.

**What it does:** When `npm install` runs, every package listed in `package.json` (and its sub-dependencies) is downloaded and stored here. This folder can contain tens of thousands of files. The site cannot build without it, but it is completely regenerated by running `npm install` — no unique content lives here.

**How it connects:** Referenced by Node.js and Astro internally. Never committed to GitHub (listed in `.gitignore`).

---

---

## CONFIGURATION AND TOOLING FOLDERS

---

### `.git/`

**What it is:** Git's internal database folder.

**What it does:** Contains the complete history of every code change ever made to this project — every commit, every author, every date, every line changed. This is what makes it possible to roll back to any previous state, compare changes over time, and collaborate without stepping on each other's work.

**How it connects:** Every `git commit`, `git push`, and `git log` command operates on this folder. Never delete or manually edit anything inside `.git/`.

---

### `.claude/`

**What it is:** Claude Code's configuration folder.

**What it does:** Contains Claude Code's local settings for this project (`settings.local.json`) and specialized "skill" files that teach Claude Code particular behaviors:
- `automation_engineer` — skill for building automation pipelines
- `project_supervisor` — skill for high-level project planning and synthesis
- `qa_mobile_specialist` — skill for mobile quality assurance testing
- `seo_strategist` — skill for SEO analysis and recommendations
- `technical_auditor` — skill for technical code review

**How it connects:** Read by Claude Code when it starts a session. No effect on the live website.

---

### `.vscode/`

**What it is:** Visual Studio Code editor configuration folder.

**What it does:** Contains two files:
- `extensions.json` — recommends helpful VS Code extensions for anyone who opens this project in VS Code (e.g., the Astro language extension for syntax highlighting)
- `launch.json` — configuration for VS Code's built-in debugger (for stepping through code during development)

**How it connects:** Only affects the developer's local editing environment. No effect on the live site.

---

### `.audit/`

**What it is:** A secondary folder for audit history files.

**What it does:** Stores additional audit-related historical documents that did not fit cleanly into the main `audits/` folder.

---

### `sanity_backup_22/`

**What it is:** A local backup of Sanity content data from May 22, 2026.

**What it does:** Contains a compressed backup of the Sanity dataset (`sanity_backup_22/05/2026.gz`). The date is part of the folder name. This is a point-in-time snapshot, similar to `production.tar.gz` at the root but more recent.

**How it connects:** A safety net only. Not connected to the live site. The goal is to have these backups run automatically (Phase 5, task 5A-11).

---

---

# PART THREE: HOW IT ALL CONNECTS

## The Full System Flow — Text Diagram

```
==============================================================================
  CONTENT CREATION
==============================================================================

  You (via browser)
        |
        v
  Sanity Studio
  [aitokenglobal.sanity.studio]
        |
        | (stores content in Sanity cloud database)
        v
  Sanity Cloud Database
  [Project ID: mq3wxr8n, Dataset: production]

==============================================================================
  CONTENT PIPELINE (for bulk imports and new languages)
==============================================================================

  scripts/data/*.ndjson          <-- raw content files (English)
        |
        | (import scripts)
        v
  Sanity Cloud Database

  scripts/data/*-en.ndjson       <-- English content
        |
        | (translate-page.mjs via AI Token King API + Claude)
        v
  scripts/data/*-es.ndjson       <-- Spanish content
        |
        | (import scripts)
        v
  Sanity Cloud Database

==============================================================================
  WEBSITE BUILD
==============================================================================

  GitHub Repository
  [antonioduran-insight/AI_Token_Global]
        |
        | (code push triggers build)
        v
  AWS Amplify (starts build)
        |
        v
  Astro Build Process
        |
        |-- reads astro.config.mjs (site URL, plugins)
        |-- reads src/i18n/en.json + es.json (UI strings)
        |-- reads src/styles/global.css (design system)
        |
        |-- for each language in SUPPORTED_LANGS:
        |     for each page in src/pages/[lang]/:
        |          calls src/lib/sanity.ts to fetch page content
        |          applies BaseLayout.astro (nav, footer, SEO head)
        |          renders HTML page
        |
        v
  dist/ folder (complete static HTML website)
        |
        v
  AWS Amplify CDN (servers around the world)
        |
        v
  Visitors at www.aitoken.global/en/ and /es/

==============================================================================
  TRIGGER FOR REBUILDS
==============================================================================

  Sanity content published  -->  (webhook, pending setup)  -->  AWS Amplify build
  Code pushed to GitHub     -->  (automatic)                -->  AWS Amplify build
  Manual trigger            -->  (Amplify Console)          -->  AWS Amplify build

==============================================================================
```

---

## The Files You Are Most Likely to Care About

As the project owner, here is the short list of files that are most operationally relevant to you:

**For understanding project status:**
- `summary.md` — current state, done/pending, content status by language
- `audits/PHASE_5_TASK_PLAN.md` — next phase of work, every task defined

**For deploying the live site:**
- AWS Amplify Console — `https://console.aws.amazon.com/amplify/`
- Sanity Studio — `https://aitokenglobal.sanity.studio`
- GitHub — `https://github.com/antonioduran-insight/AI_Token_Global`

**For understanding content structure:**
- `studio/schemas/` — what fields each content type has
- `src/i18n/en.json` — all interface text strings

**For reference when briefing a developer:**
- `CLAUDE.md` — design rules and technical constraints
- `go-live-guide.md` — deployment architecture and hosting setup
- `audits/FINAL_PROJECT_AUDIT.md` — full project assessment

---

## Key Accounts and Access Points

| Resource | URL | Purpose |
|---|---|---|
| Live site | https://www.aitoken.global/en/ | The live website |
| Sanity Studio | https://aitokenglobal.sanity.studio | Content management |
| GitHub repository | https://github.com/antonioduran-insight/AI_Token_Global | Code and version history |
| AWS Amplify Console | https://console.aws.amazon.com/amplify/ | Hosting and build history |
| Sanity project dashboard | https://sanity.io/manage/personal/project/mq3wxr8n | Sanity settings, webhooks, API usage |
| Source site | https://aitoken.com.tw | Blog post source (AI Token King, Taiwan) |
| AI aggregator platform | https://www.aitokenking.com.tw | The platform this website promotes |

---

## Current Known Gaps (as of May 2026)

These are items that are acknowledged, tracked, and in the Phase 5 plan:

1. **AI Trends download card** — the `downloadUrl` field in Sanity is blank. The download card is hidden on the page until a real PDF URL is added. Action: go to Sanity Studio > AI Trends Page > EN version > fill in `downloadUrl`.

2. **No Spanish blog posts** — currently only English posts are live. Spanish translations are on the Phase 5 task list (task 5C).

3. **Sanity-to-Amplify webhook not yet wired** — currently a developer must push code to GitHub to trigger a rebuild. This means publishing content in Sanity does not automatically update the live site. Task 5A-08 will fix this.

4. **No Google Analytics yet** — the site has no analytics tracking. Task 5A-04 covers setting up GA4 with proper cookie consent (required before GA4 can fire on EU/ES visitors).

5. **Privacy Policy and Terms pages** — the footer links to these pages but they are currently placeholder (`href="#"`) links. Task BL-12 covers building these pages.

---

## A Note on Jargon You May Encounter

| Term | Plain-English meaning |
|---|---|
| Static site | A website whose pages are pre-built as files rather than built on demand for each visitor. Faster and more secure than dynamic sites. |
| Build | The process of assembling all pages from source code and content. Like printing a book — you compile it once, then distribute. |
| Deploy | Uploading the built website to the hosting servers so visitors can see it. |
| GROQ | Sanity's query language — how you ask Sanity for specific content. |
| Portable Text | Sanity's rich text format — a structured way of storing formatted content (headings, paragraphs, links) that can be rendered on any platform. |
| Webhook | An automatic notification one service sends to another when something happens. Like a pager — Sanity "pages" Amplify when content is published. |
| CDN | Content Delivery Network — a global network of servers that each hold a copy of the site, so visitors get a fast response from the nearest server. |
| Git / GitHub | Git is version control software. GitHub is a website that hosts Git repositories (code libraries). |
| Commit | A saved snapshot of changes in Git — like a save point in a video game. |
| Slug | The URL-safe identifier for a page or post. For example, `what-is-gpt-4` is the slug for a post whose URL is `/en/blog/what-is-gpt-4`. |
| Schema | In Sanity, a schema is the definition of a content type — what fields it has, what types they are. Think of it as a form template. |
| Environment variable | A configuration value stored outside of the code, so sensitive values (API keys, project IDs) are not visible in the codebase. |
| hreflang | An HTML attribute that tells Google which language a page is in and which other pages are its translations. Critical for multilingual SEO. |
| Canonical URL | The "official" address of a page. Tells Google not to count the same page served at multiple URLs as duplicate content. |
| JSON / NDJSON | Structured text file formats used to store and transfer data. JSON is one object; NDJSON is many objects, one per line. |

---

*End of AI Token Global Project Owner's Guide*
*Version: May 2026*
*Prepared with Claude Code (Anthropic)*
