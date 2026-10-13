# Internal links audit — 2026-10-14

Built `dist/` (`npm run build` on main @ 2a4c17a, 652 pages, after S8). Counted `<a>` links from other pages, excluding `nav`, `header`, `footer`, the mobile nav panel, breadcrumbs, table of contents, cookie banner and post hero; hreflang/canonical are `<link>` and never counted. A source page counts once per target. **Contextual = article body + related box + other in-page links** (blog index listing and the sidebar CTA are reported separately). Targets: the 153 KEEP rows of `audits/2026-10-13/not-indexed-triage.csv` + calculator, api-compare, claude/chatgpt/gemini-api, beginners-guide, use-cases, compliance, user-guide in 4 locales. 173 found in dist (`/id/rss.xml` is not a page). Links to retired URLs anywhere in dist: **0**.

## a) Contextual inbound links

| Group | Pages | 0 | 1 | 2+ | With a body link | Shown as related |
|---|---:|---:|---:|---:|---:|---:|
| KEEP posts | 133 | 123 | 9 | 1 | 2 | 3 |
| Site pages | 40 | 2 | 8 | 30 | 16 | 2 |

Every KEEP post has exactly one listing link (its locale /blog/ index). Every article carries the same sidebar CTA to its locale /api-compare/ (127–169 links each).

## b) Orphans and near-orphans (≤1 contextual inbound), top 20 by impressions

| # | Page | Impr | Clicks | Pos | Body | Related | Other |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | `/en/blog/claud-api-vs-chat-version-use-cases/` | 111 | 3 | 7.3 | 0 | 0 | 0 |
| 2 | `/en/blog/geminiapi-vs-gemina-apps-for-beginners/` | 106 | 1 | 7 | 0 | 0 | 0 |
| 3 | `/en/blog/why-long-conversations-use-more-ai-tokens/` | 88 | 1 | 10.7 | 0 | 0 | 0 |
| 4 | `/en/blog/understanding-ai-tokens-beginners-guide-api-token-mechanics/` | 75 | 0 | 9.1 | 0 | 0 | 0 |
| 5 | `/vi/blog/ai-tokens-api-keys-for-beginners/` | 61 | 3 | 6.9 | 0 | 0 | 1 |
| 6 | `/en/blog/chatgpt-api-pricing-vs-subscription-cost-difference/` | 57 | 1 | 17.1 | 0 | 0 | 0 |
| 7 | `/en/blog/understanding-tokenization-in-ai-platforms-a-beginners-guide/` | 52 | 0 | 35.4 | 0 | 0 | 0 |
| 8 | `/vi/blog/ai-token-usage-limits/` | 46 | 0 | 6 | 0 | 0 | 0 |
| 9 | `/en/blog/gemini-token-pricing-guide-for-beginners/` | 41 | 0 | 13.2 | 0 | 0 | 0 |
| 10 | `/vi/blog/chatgpt-api-for-beginners-guide/` | 35 | 0 | 19.5 | 0 | 0 | 0 |
| 11 | `/vi/blog/ai-token-pricing-for-beginners/` | 34 | 1 | 9 | 0 | 0 | 0 |
| 12 | `/vi/blog/calculating-ai-token-costs-made-easy/` | 34 | 0 | 6.1 | 0 | 0 | 0 |
| 13 | `/en/blog/understanding-ai-tokens-beginners-guide-tokenization-ai-apis/` | 29 | 0 | 13.2 | 0 | 0 | 0 |
| 14 | `/en/blog/claude-api-costs-models-permissions/` | 28 | 0 | 26.2 | 0 | 0 | 0 |
| 15 | `/en/blog/ai-token-usage-dashboard-interpreter/` | 27 | 1 | 11.2 | 0 | 0 | 0 |
| 16 | `/vi/blog/claude-api-usage-and-cost-metrics-explained/` | 26 | 0 | 14.6 | 0 | 0 | 0 |
| 17 | `/en/blog/understanding-ai-tokens-developers-guide-managing-api-costs/` | 23 | 0 | 17.8 | 0 | 0 | 0 |
| 18 | `/en/blog/estimating-ai-token-usage-easily/` | 21 | 0 | 8.1 | 0 | 0 | 0 |
| 19 | `/en/blog/saving-ai-token-costs-for-beginners/` | 20 | 0 | 12 | 0 | 0 | 0 |
| 20 | `/id/blog/gemin-api-vs-gemini/` | 20 | 0 | 10.1 | 0 | 0 | 0 |

Total with ≤1: **142** (132 posts, 10 site pages: `/es/user-guide/`, `/en/user-guide/`, `/vi/ai-trends/`, `/es/compliance/`, `/en/compliance/`, `/vi/user-guide/`, `/id/user-guide/`, `/id/compliance/`, `/vi/compliance/`, `/id/ai-trends/`).

## c) How getRelatedPosts picks today

| | |
|---|---|
| Rule | Same language + same category, ordered `publishedAt desc`: the 3 newest posts in the category; filled from the newest posts in the language if fewer. Nothing else. |
| Effect | Every post in a category shows the same 3 newest posts. 591 articles × 3 = 1,773 slots go to **115 posts**; **479 of 593 published posts are never shown**. Most picked: 3 en posts at 65 links each (`context-engineering-missing-piece-enterprise-ai`, `what-altmans-token-forecast-means-for-your-ai-startup`, `why-ai-agent-trends-all-lead-back-to-token-budget`). |
| Topic fit | None: a beginner "buy AI tokens" post shows enterprise-agent posts because they are newest in its category. |
| Bad picks | Rare, because the newest posts are mostly clean: 1 thin (<600 words), 6 wrong-language bodies (14 slots), 3 in the not-indexed list (4 slots). Unpublished posts can never be picked (published-only query). |
| Who it starves | June posts: only 9 of 115 picked posts are from June, the month 239 of the 251 crawled-but-not-indexed posts were published (2026-10-13 triage). |

## d) Pages carrying the traffic (3 months, 166 clicks) and what they link to

| Page | Clicks | Body links | Related box | Sidebar | Proposed destinations (same locale) |
|---|---:|---|---|---|---|
| `/id/blog/membeli-token-ai-pemula/` | 37 (22%) | 0 | 3 newest-in-category | /id/api-compare/ | /id/token-calculator/, /id/api-compare/, /id/blog/perbandingan-konsumsi-token-chatgpt-claude-gemini/ (3 clicks), /id/blog/token-ai-vs-api-key-pemula/ (62 impr) |
| `/en/` | 16 (10%) | 0 | — | — | already links to calculator, api-compare, guides and 7 posts; add the en orphans with impressions (#1–3 in b) |
| `/en/blog/token-consumption-comparison-between-chatgpt-claude-and-gemini/` | 10 (6%) | 0 | 3 newest-in-category | /en/api-compare/ | /en/token-calculator/, /en/api-compare/, /en/blog/ai-tokens-api-keys-for-beginners/, /en/blog/claud-api-vs-chat-version-use-cases/ |
| `/en/blog/buying-ai-tokens-for-personal-use/` | 5 (3%) | 0 | 3 newest-in-category | /en/api-compare/ | template links only (protected: no body edits) — calculator via the tools row |
| `/id/token-calculator/` | 5 (3%) | 0 | — | — | add 2–3 id guides (membeli-token-ai-pemula, perbandingan-konsumsi-token-…) |
| `/id/blog/harga-token-claude-antropik-api/` | 4 (2%) | 0 | 3 newest-in-category | /id/api-compare/ | held (English body) — template links only until translated |
| `/en/blog/ai-tokens-api-keys-for-beginners/` | 4 (2%) | 0 | 3 newest-in-category | /en/api-compare/ | /en/token-calculator/, /en/blog/buying-ai-tokens-for-personal-use/, /en/blog/claud-api-vs-chat-version-use-cases/ |

None of the top posts links to the calculator. Its only contextual inbound links are 5 (3 guide bodies + 2 template). That makes Part 2 commit 3 ("Useful tools": calculator + main guide) worth doing.
