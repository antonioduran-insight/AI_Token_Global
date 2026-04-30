# AI Token Global — Go-Live Guide

## Overview

This guide covers everything from finishing the current HTML prototype to a fully deployed, scalable, multilingual site on Cloudflare Pages.

---

## Phase 1 — Finish the HTML Prototype (Current Session)

Complete all remaining design and content work in the raw HTML files. This prototype is the design source of truth for the migration.

**This session's checklist:**
- [ ] Documentation nav link → redirect to `https://www.aitokenking.com.tw/docs`
- [ ] Blog index page (with reference design)
- [ ] Blog post base template (1–3 sample posts)
- [ ] Animations and dynamic elements across all pages
- [ ] Additional hyperlinks to the AI Token King aggregator platform

**When prototype is done, do not add more HTML pages.** All future content goes through the CMS after migration.

---

## Phase 2 — Set Up GitHub Repository

1. Create a GitHub account at https://github.com if you don't have one
2. Create a new repository: `aitokenglobal` (public or private, your choice)
3. In your terminal, from the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial prototype commit"
   git remote add origin https://github.com/YOUR_USERNAME/aitokenglobal.git
   git push -u origin main
   ```
4. Verify all files appear on GitHub

**Note:** Add a `.gitignore` file to exclude `node_modules/` and `temporary screenshots/` before committing.

---

## Phase 3 — Migrate to Astro (SSG)

This is the most important step before adding 200+ blog articles. Astro generates static HTML at build time, supports components (single nav/footer), and integrates with a CMS.

### 3.1 Install Astro
```bash
npm create astro@latest aitokenglobal-astro
cd aitokenglobal-astro
npm install
```

### 3.2 Port the Design System
- Copy your CSS variables, fonts, and global styles into `src/styles/global.css`
- Create layout components:
  - `src/layouts/BaseLayout.astro` — wraps every page (head, nav, footer)
  - `src/components/Nav.astro` — single nav component, used everywhere
  - `src/components/Footer.astro`

### 3.3 Port Existing Pages
Convert each HTML file to an Astro page in `src/pages/`:
- `index.html` → `src/pages/index.astro`
- `api-compare.html` → `src/pages/api-compare.astro`
- etc.

### 3.4 Set Up Blog Routing
Astro supports Markdown-based blog posts natively:
```
src/
  pages/
    blog/
      index.astro        ← blog index page
      [slug].astro       ← dynamic post template
  content/
    blog/
      post-1.md
      post-2.md
      ...
```

Each `.md` file becomes a blog post automatically. No hand-coding HTML per post.

---

## Phase 4 — Set Up a Headless CMS (Sanity)

For 200+ articles and regular publishing without touching code. This also enables non-developers to edit **any page content** — not just blog posts.

### 4.1 Create a Sanity project
1. Go to https://sanity.io and create a free account
2. Create a new project: `AI Token Global`
3. Install the Sanity Studio locally:
   ```bash
   npm create sanity@latest
   ```

### 4.2 Define your content schema

**Blog posts** — one document per article:
- `title` (string)
- `slug` (slug)
- `publishedAt` (datetime)
- `language` (string — `en`, `zh`, `es`, etc.)
- `body` (block content / rich text)
- `excerpt` (text)
- `coverImage` (image)
- `tags` (array of strings)

**Page singletons** — one document per page per language, for editing page content without touching code:
- `homePage` → hero headline, subheading, stats, CTA text
- `blogIndexPage` → headline, intro copy
- `apiComparePage` → intro copy, table data
- etc.

This means **any page on any language version can be edited from the Sanity dashboard** — no code changes needed for copy updates.

### 4.3 Connect Astro to Sanity
Install the Sanity client:
```bash
npm install @sanity/client
```

Fetch posts at build time in `[slug].astro`:
```js
import { createClient } from '@sanity/client'
const client = createClient({ projectId: 'YOUR_ID', dataset: 'production', useCdn: true })
const posts = await client.fetch(`*[_type == "post"]`)
```

### 4.4 Load your 200 articles
Options:
- Import from CSV/spreadsheet via Sanity's import tool
- Paste directly into Sanity Studio's editor
- Use the Sanity CLI for bulk import from JSON

---

## Phase 5 — Multilingual Setup

Since this site is the base template for other language versions, there are two approaches:

### Option A — Single repo, i18n routes (recommended)

One codebase, one CMS, one deployment. All languages live in the same project.

**Folder structure:**
```
src/pages/
  en/
    index.astro
    blog/
      index.astro
      [slug].astro
  zh/
    index.astro
    blog/
  es/
    index.astro
    blog/
```

**How to edit a specific language's page:**
- **Blog posts:** In Sanity, filter by `language == "es"` and edit the Spanish post
- **Page copy** (hero text, section headings, etc.): In Sanity, open the `homePage` singleton for `es` and edit the fields — no code needed
- **Design/layout changes:** Edit the shared Astro component once — it updates all languages automatically

**How Sanity connects to language routes:**
Each content document has a `language` field. Astro fetches only documents matching the current route's language:
```js
// src/pages/es/blog/[slug].astro
const posts = await client.fetch(`*[_type == "post" && language == "es"]`)
```

### Option B — Separate repos per language

Clone the entire repo for each language. Each language version is independently deployed.

- **Pro:** Full independence — different teams, different designs, different deploy schedules
- **Con:** Design/nav updates must be applied to each repo manually
- **When to use:** Only if language versions diverge significantly in ownership or design

**Recommendation:** Start with Option A. If a language version needs to diverge heavily, fork it into Option B at that point.

---

## Phase 6 — Deploy to Cloudflare Pages

### 6.1 Create a Cloudflare account
Go to https://cloudflare.com and sign up (free).

### 6.2 Connect GitHub to Cloudflare Pages
1. In Cloudflare dashboard → **Pages** → **Create a project**
2. Connect your GitHub account
3. Select the `aitokenglobal` repository
4. Configure build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**

Cloudflare will build and deploy automatically on every `git push`.

### 6.3 Custom Domain
1. In Cloudflare Pages → your project → **Custom domains**
2. Add your domain (e.g., `aitokenglobal.com`)
3. If your domain is already on Cloudflare DNS, it connects instantly
4. If not, update your domain's nameservers to Cloudflare's

### 6.4 Automatic Rebuilds on New Content
When you publish a new article in Sanity, trigger a Cloudflare Pages rebuild via a **Deploy Hook**:
1. Cloudflare Pages → Settings → **Deploy Hooks** → create a hook URL
2. In Sanity → Settings → **Webhooks** → paste the Cloudflare hook URL
3. Now every time you publish in Sanity, the site rebuilds and goes live within ~1 minute

---

## Phase 7 — Animations & Dynamic Elements

Already planned for this session. No architecture changes needed — static sites support full JS animations.

Recommended libraries (CDN-friendly, no build step required for prototype):
- **GSAP** — scroll-triggered animations, timeline sequences
- **AOS (Animate on Scroll)** — lightweight, easy to add to existing elements

These carry over to Astro with no changes.

---

## Phase 8 — SEO & Launch Prep

Before going live:
- [ ] Add `<meta>` description tags to every page
- [ ] Add Open Graph tags (for social sharing previews)
- [ ] Create a `sitemap.xml` (Astro generates this automatically with `@astrojs/sitemap`)
- [ ] Create a `robots.txt`
- [ ] Set up Google Search Console and submit sitemap
- [ ] Verify Cloudflare caching rules are set correctly (static assets: long TTL)
- [ ] Test on mobile (Chrome DevTools → responsive mode)
- [ ] Test page load speed via https://pagespeed.web.dev

---

## Cost Summary (at scale)

| Service | Free Tier | Paid (when needed) |
|---|---|---|
| GitHub | Free (public or private repos) | — |
| Astro | Free (open source) | — |
| Sanity | Free up to 3 users, 100k API calls/mo | ~$15/mo (Growth) |
| Cloudflare Pages | Free (unlimited sites, 500 builds/mo) | ~$20/mo (Pro, for more builds) |
| Domain | ~$10–15/yr | — |
| **Total** | **~$10–15/yr** | **~$35–50/mo at scale** |

---

## Quick Reference — Key URLs

| Resource | URL |
|---|---|
| GitHub | https://github.com |
| Astro docs | https://docs.astro.build |
| Sanity | https://sanity.io |
| Cloudflare Pages docs | https://developers.cloudflare.com/pages |
| Pagespeed test | https://pagespeed.web.dev |

---

*Last updated: 2026-04-29*
