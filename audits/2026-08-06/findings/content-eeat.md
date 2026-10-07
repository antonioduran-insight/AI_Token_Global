# Content and E-E-A-T Audit: aitoken.global

**Lane:** Content quality, E-E-A-T, trust signals, conversion readiness
**Audit date:** 2026-08-06
**Target:** `https://www.aitoken.global` (apex 302s to www; probed www throughout)
**Business frame:** the site is a sales resource for B2B lead generation. Every finding below is scored against one question: when a prospective B2B customer lands here, does this site earn their trust and move them toward contact?

**Note on quotes:** all quoted copy is verbatim from the served HTML. Source punctuation (including em dashes present in the site's own copy) is preserved inside quotation marks. My own prose contains none.

---

## 1. Method and coverage

| What | How | Volume |
|---|---|---|
| Sitemap parse | `curl https://aitoken.global/sitemap-0.xml` | 656 URLs confirmed (611 blog + 44 template + 1 root) |
| Template pages | Fetched raw HTML, all 4 locales | 44/44 (all HTTP 200) |
| EN blog corpus | Fetched raw HTML, every post | 162 posts + 1 blog index (163 `/en/blog/` sitemap URLs = 162 posts plus the index itself) |
| Locale blog spot-check | Systematic sample, every 15th URL | es 11, id 11, vi 9 (31 posts) |
| Text extraction | cheerio, `<script>`/`<style>` stripped | all of the above |
| JS-render comparison | Puppeteer `networkidle2` vs raw HTML | 3 pages + the off-site CTA destination |
| Trust page probing | Direct HTTP on 12 conventional paths, `/en/` and root | 24 requests |
| Near-duplicate detection | 5-gram shingle containment, all 162x161 EN post pairs | 13,041 pairs |
| Competitor benchmark | Live fetch of 5 competitor sites | see section 12 |

**Word-count clarification.** The ground-truth figure of 1422 to 2255 raw served words on EN template pages counts inline script and JSON payload text. Stripping `<script>`/`<style>`, actual **visible body text** on EN template pages ranges **637 to 1414 words**, and roughly 300 of those are shared nav plus footer chrome. Unique on-page prose is therefore closer to **340 to 1110 words** per template page. This materially changes the depth assessment in section 6.

---

## 2. Headline verdict

**E-E-A-T score: 28 / 100.** Conversion readiness: near zero for self-service lead capture, and actively broken for the enterprise path.

The single most important structural fact: **aitoken.global does not capture leads.** It has exactly two `<form>` elements across the entire English site, both newsletter stubs hardcoded with `onsubmit="return false;"`. There is no contact form, no email address, no phone number, no company entity, no About page, and no working Privacy Policy or Terms link anywhere on the domain. The only functioning conversion action is an off-site link to `https://www.aitokenking.com.tw/home`, which serves a **Traditional Chinese** page (`lang="zh-Hant"`, title `AItokenKing - 首頁`) to English, Spanish, Indonesian, and Vietnamese visitors.

The second most important fact: **this is a pricing resource whose prices are one to two model generations stale**, and the site's own blog proves it knows better. On 2026-07-30 it published `What Is Claude Opus 5?` quoting `Anthropic states the two are priced identically — $5 per million input tokens and $25 per million output tokens`. On the same day, `/en/claude-api/` was, and still is, telling buyers `Claude 3 Opus: $15.00 / 1M input tokens · $75.00 / 1M output tokens`.

---

## 3. What is genuinely good

Recorded deliberately, because a later chapter depends on it.

1. **Full server-side rendering.** Puppeteer-rendered text matches raw HTML on every page tested. A non-JS crawler and an LLM see 100% of the content. This is a real competitive advantage and the foundation everything else can be built on. By contrast, the parent product site `aitokenking.com.tw` served **zero body text** without JavaScript, and competitor `openrouter.ai/models` was unfetchable for the same reason.

2. **The July and August 2026 blog cohort is genuinely strong.** 33 posts, median **1878 words**, zero under 800 words. `what-is-claude-opus-5` (2026-07-30) attributes claims properly: `Anthropic explains that Opus 5's cyber classifiers are proportionally less restrictive than the equivalent mechanism on Fable 5`. It also contains a rare and admirable transparency note: `This piece also did not use an automated view-count scraping pipeline for this topic selection, so no view count is reported here rather than substituting an estimate`. That is better editorial discipline than any of the three benchmark competitors show.

3. **Honest limitation disclosure on the calculator.** `/en/token-calculator/` states plainly: `This tool estimates input cost only — output (response) tokens are not included.` and `Different models use different tokenizers; actual token counts may vary slightly.` and `Prices shown are AI Token King reference prices. Always verify with the official platform for billing.` Many competitors do not disclose this.

4. **Privacy-respecting cookie consent.** `We use cookies to understand how visitors use the site so we can improve it. Analytics stays off until you accept.` with `Reject non-essential` given equal prominence to `Accept all`. This is a genuine, above-average trust behaviour.

5. **Provider guide pages are well-architected.** `/en/chatgpt-api/`, `/en/claude-api/`, `/en/gemini-api/` all carry a sticky section TOC, a `Further Reading` block, and a `Common Questions` FAQ. The FAQ content is technically accurate: `OpenAI uses tiktoken (BPE-based), Anthropic uses their own tokenizer, and Google uses SentencePiece.` That is correct and specific.

6. **No literal content duplication.** 5-gram shingle analysis across all 13,041 EN post pairs found **zero pairs above 10% containment**. Whatever else is true, these posts were not spun or copy-pasted from each other.

7. **Translation quality is high.** ES, ID, and VI bodies read as native prose, not machine output. Bylines and dates are properly localised (`Editorial de AI Token King`, `Tim Editorial AI Token King`, `Ban biên tập AI Token King`, `4 de junio de 2026`, `4 Juni 2026`, `4 tháng 6, 2026`). Zero English sentence leaks found in ES, ID, or VI body copy.

8. **Analytics instrumentation exists on CTAs.** `data-ga-event="cta_get_started" data-ga-location="nav"`. Conversion measurement is wired up, which means fixes will be measurable.

9. **Blog posts have on-page TOC, tags, category breadcrumbs, share buttons, a bottom CTA block, and 3 related posts.** The template is sound. Only the linking inside the body is missing.

---

## 4. E-E-A-T scorecard

Weights reflect that this is a **pricing and comparison resource**, where data accuracy and freshness are the product itself, not a supporting attribute. Trustworthiness is therefore weighted highest.

| Dimension | Weight | Score | Rationale (evidence in sections below) |
|---|---:|---:|---|
| **Experience** | 20 | **6** | Jul/Aug 2026 posts show real first-hand engagement and disclose their own method. Against that: no case studies, no named practitioner, no "we tested this", no screenshots of real API usage, and the June cohort contains posts that prove no first-hand knowledge of the subject (see C-2). Calculator uses a word-count approximation, not a real tokenizer, so even the tool is not built on hands-on token work. |
| **Expertise** | 25 | **11** | Provider guide pages and FAQs are technically correct and well-organised. Against that: two homepage-featured posts describe "AI tokens" as blockchain assets; zero named authors; zero stated credentials; the model lineup on every money page is one to two generations obsolete. |
| **Authoritativeness** | 20 | **4** | 162 EN posts across 4 locales is real scale. Against that: no About page, no team, no company entity, no address, 3 of 162 posts carry any external citation, the single sourcing link on the template pages has an **empty `href`**, social links point at `https://linkedin.com` and `https://twitter.com` root domains, and the brand appears under four different names. |
| **Trustworthiness** | 35 | **7** | Cookie consent and price disclaimers are genuine positives. Against that: `Privacy Policy` and `Terms of Service` are both `href="#"`; a cookie banner links to a privacy policy that does not exist; `© 2025` in August 2026; no contact of any kind; the site contradicts itself on prices; five different model counts are claimed; no "last updated" signal anywhere; the enterprise sales CTA links to itself; the newsletter is a dead stub. |
| **Total** | **100** | **28** | |

For calibration: `llm-prices.com` scores poorly on Authoritativeness (no About, no contact) but near-maximum on Trustworthiness because its data carries `"updated_at": "2026-08-05"` and an auditable git history. Freshness alone buys more trust in this niche than any amount of prose.

---

## 5. Findings

### CRITICAL

---

#### C-1. There is no lead capture anywhere on the site, and the enterprise sales CTA links to itself

**Evidence.** Exactly two `<form>` elements exist across all 11 EN template pages, the blog index, and all 162 blog posts:

- `/en/` : `<form style="..." onsubmit="return false;">` containing `<input type="email" placeholder="Enter your email">` and `Subscribe Free`
- `/en/blog/` : `<form class="newsletter-form" onsubmit="return false;">` containing `<input type="email" placeholder="your@email.com">`

Both are hardcoded to cancel submission. Grep for `mailchimp|convertkit|formspree|hubspot|netlify` across the served HTML returns zero matches. Puppeteer confirms the homepage form resolves to `action: null`. The copy beneath it reads `Join thousands of developers and AI enthusiasts. Unsubscribe anytime.` and `No spam — just signal.` Neither statement can be true, because nothing is captured.

`/en/compliance/` is the highest-intent page on the site. It targets `Financial institutions, exchanges, virtual asset service providers, securities, insurance, and futures companies.` Its closing copy is `Talk to us about your organization's AI compliance requirements.` followed by a primary button. The button markup is:

```html
<a href="/en/compliance" class="btn-primary" > Contact Enterprise Sales
<a href="/en/compliance" class="btn-primary" > View Enterprise AI Compliance Proposal
```

Both point at the page they are already on. A CFO at a regulated institution who reads that entire page and clicks the sales button is returned to the top of the same page. There is no email, no phone, no form, no calendar link.

Zero `mailto:`, `tel:`, or bare email addresses appear anywhere across the 11 EN template pages.

**Business impact.** Every dollar of traffic acquisition spend on this site is unconvertible. High-intent enterprise visitors, the most valuable segment the site attracts, hit a literal dead end at the moment of highest purchase intent. The parent platform already publishes a working contact address (`aitokenking@insight-software.com`, found on `aitokenking.com.tw/home`), so this is not a business constraint, it is an omission.

**Action.**
1. Ship a real `/en/contact/` page (and `/es/`, `/id/`, `/vi/`) with a server-backed form, a published email, a stated response SLA ("we reply within one business day"), and the company entity.
2. Repoint both `/en/compliance/` primary buttons at it, with the compliance context prefilled.
3. Wire the newsletter to a real ESP or remove it. A dead subscribe box that claims `Join thousands of developers` is worse than no box.
4. Add an inline CTA block or lead magnet to the blog post template. 162 posts currently have zero conversion surface in the body.

---

#### C-2. Two homepage-featured blog posts describe "AI tokens" as blockchain assets, which is categorically wrong and destroys expertise on the site's core topic

**Evidence.** `/en/blog/calculating-ai-token-costs` is one of seven posts featured in the homepage `Learn From Our Blog` module. Verbatim from the post body:

> `There are several factors that influence the cost of using AI tokens. These include the type of token, its complexity, the computing power required to process it, and the network fees associated with transferring it.`

> `AI tokens can be broadly categorized into two types: simple and complex tokens.`

> `The complexity of an AI token is determined by its architecture, which can include multiple layers and nodes.`

> `In addition to the computational cost of processing an AI token, you'll also need to consider the network fees associated with transferring it. These fees can vary depending on the blockchain or network being used.`

> `One approach is to use a proxy service that can help reduce network fees associated with transferring AI tokens.`

None of this describes LLM tokens. There are no network fees, no blockchain, and no "transferring" of an LLM token.

`/en/blog/understanding-tokenization-in-ai-platforms-a-beginners-guide` is also homepage-featured. Its opening line:

> `In the world of finance, tokenization is a revolutionary concept that has transformed the way we conduct transactions`

> `Tokenization refers to the process of converting assets into digital tokens, allowing for secure and efficient transfer of ownership`

> `There are several types of tokens used in financial transactions. The most common type is the security token, which represents ownership of an asset or debt. Security tokens are ideal for representing ownership, while utility tokens offer access to exclusive services.`

> `By leveraging blockchain technology, AI-powered systems can create secure and tamper-proof tokens for data processing and storage`

This post is entirely about financial asset tokenization and security tokens. It shares nothing but a word with LLM tokenization.

A scan of the full EN corpus for `blockchain|cryptocurrency|smart contract|network fee|tokenomics` flags a third: `calculating-ai-token-costs-for-small-businesses`. (Four other posts are legitimately about crypto as a subject: `ai-investment-story-2026-crypto`, `agentic-ai-crypto-relationship-explained`, `crypto-investment-trends-2026-explained`, `ai-crypto-market-trends-and-analysis`. Those are off-topic for a pricing resource but not factually wrong.)

**Business impact.** These are the two most damaging posts on the site, and they are the ones the homepage promotes. A technical evaluator, exactly the person a B2B AI infrastructure sale depends on, reads two paragraphs and concludes the publisher does not understand its own product category. Trust is unrecoverable from that point. It also poisons the AI-citation channel: an LLM ingesting this content learns a false association between "AI token cost" and blockchain fees, attributed to this brand.

**Action.** Unpublish or fully rewrite all three posts today, and remove them from the homepage feature module immediately. Then run the crypto-term scan across the ES, ID, and VI translations of the same posts, because the errors will have been faithfully translated.

---

#### C-3. Pricing on every money page is one to two model generations stale, with no "last updated" signal, and the site contradicts itself

**Evidence.** As of 2026-08-06, this is what the money pages state.

`/en/` homepage comparison table:

| Model | Provider | Context | Input | Output |
|---|---|---|---|---|
| GPT-4o | OpenAI | 128K | $2.50 | $10.00 |
| GPT-4o mini | OpenAI | 128K | $0.15 | $0.60 |
| Claude 3.5 Sonnet | Anthropic | 200K | $3.00 | $15.00 |
| Claude 3 Haiku | Anthropic | 200K | $0.25 | $1.25 |
| Gemini 1.5 Pro | Google | 1M | $1.25 | $5.00 |
| Llama 3.1 405B | Meta | 128K | $5.00 | $15.00 |

`/en/chatgpt-api/` `Pricing Reference`: `GPT-4o`, `GPT-4o mini`, `GPT-4 Turbo: $10.00 / 1M input tokens · $30.00 / 1M output tokens`, `o1: $15.00 / 1M input tokens · $60.00 / 1M output tokens`. No GPT-5 anything.

`/en/claude-api/` `Pricing Reference`: `Claude 3.5 Sonnet: $3.00 / 1M input tokens · $15.00 / 1M output tokens`, `Claude 3.5 Haiku: $0.80 / 1M input tokens · $4.00 / 1M output tokens`, `Claude 3 Opus: $15.00 / 1M input tokens · $75.00 / 1M output tokens`.

`/en/gemini-api/` `Pricing Reference`: `Gemini 1.5 Pro:$1.25 / 1M input tokens · $5.00 / 1M output tokens (up to 128K context)`, `Gemini 1.5 Pro (128K+):$2.50 / 1M input tokens · $10.00 / 1M output tokens`, `Gemini 1.5 Flash:$0.075 / 1M input tokens · $0.30 / 1M output tokens`, `Gemini 1.0 Pro:$0.50 / 1M input tokens · $1.50 / 1M output tokens`.

**The site's own blog contradicts these pages.** `/en/blog/what-is-claude-opus-5` (published 2026-07-30) states:

> `Anthropic states the two are priced identically — $5 per million input tokens and $25 per million output tokens, with Fast mode at twice the base price`

Independently corroborated: `llm-prices.com/current-v1.json` (`"updated_at": "2026-08-05"`) lists Claude Opus 4.5 through 4.8 at 5 input / 25 output. So `/en/claude-api/` is off by **3x on input and 3x on output** for the current Opus tier.

**The site contradicts itself internally on Gemini.** `/en/token-calculator/` card reads `Google Gemini 1.5 Pro AI Token King ref. price: $2.00 / 1M tokens · USD`. `/en/gemini-api/` and the homepage table both say `$1.25`. Same model, same site, two different prices.

**The site contradicts itself internally on Claude Opus.** Calculator: `Anthropic Claude Opus AI Token King ref. price: $5.00 / 1M tokens`. Provider page: `Claude 3 Opus: $15.00 / 1M input tokens`. (The $5.00 figure happens to be correct for current Opus, but the page that carries the brand-name authority says $15.00.)

**No freshness signal exists.** A grep for `last updated|updated on|prices as of|as of [Month] [Year]` across all EN template pages and all 162 blog posts returns nothing usable. The strongest statement on the site is the calculator FAQ: `The prices are AI Token King reference prices and are updated periodically.` "Periodically" is not a date.

**Sourcing is circular.** `Reference prices sourced from AI Token King.` The site cites itself as the authority for its own numbers. There is no link to OpenAI, Anthropic, or Google pricing documentation anywhere on any money page.

**Business impact.** This is the core product failing. A buyer who spot-checks one number against Anthropic's published pricing discovers the site is 3x wrong, and every other number on the site becomes suspect, including the correct ones. Worse, an LLM that cites this site propagates the wrong prices under this brand's name.

**Action.**
1. Add a visible `Prices verified: YYYY-MM-DD` line adjacent to every price table and every calculator card. DocsBot renders theirs twice, verbatim `Pricing verified Jul 30, 2026` and `Prices in USD per million tokens. Verified 2026-07-30.` Copy that pattern exactly.
2. Refresh the model lineup to the current frontier. The parent platform `aitokenking.com.tw` **already publishes current pricing** (`claude-opus-5` at 5/25, `claude-opus-4.8` at 5/25, `gpt-5.4` at 5/22.5, `qwen3.7-plus`, `kimi-k2.7-code`, `deepseek-v3.2`, `glm-5.1`, `minimax-m2.7`). The data exists inside the business. Build a sync.
3. Reconcile the calculator against the provider pages, or drive both from one source.
4. Link each price to the provider's official pricing page.
5. Add a one-paragraph methodology note: where prices come from, how often they are checked, and what "AI Token King reference price" means relative to provider list price.

---

#### C-4. Privacy Policy and Terms of Service do not exist, and the cookie banner links to a page that is not there

**Evidence.** Footer markup on every page in every locale:

```html
<a href="#" ...>Privacy Policy</a>
<a href="#" ...>Terms of Service</a>
```

The cookie consent banner also links to a non-existent policy:

```html
We use cookies to understand how visitors use the site so we can improve it. Analytics stays off until you accept.
<a href="#" class="cookie-consent__link">Privacy Policy</a>
```

Probed and confirmed 404 on both `/en/` and root: `/privacy/`, `/privacy-policy/`, `/terms/`, `/legal/`.

**Business impact.** Three separate problems. (a) Legal: a cookie consent mechanism that references a privacy policy which does not exist is a GDPR and CCPA exposure, and the site targets Spanish and EU-adjacent audiences. (b) Procurement: no enterprise vendor-assessment process clears a supplier with no published terms. This alone disqualifies the site from the exact enterprise deals `/en/compliance/` is written to win. (c) E-E-A-T: Google's quality guidance treats missing policy pages on a commercial site as a direct trust deficit.

**Action.** Publish real, dated Privacy Policy and Terms pages in all four locales this week. The parent site already has `/privacy` and `/terms` at `aitokenking.com.tw`; adapt and localise them. Add `Last updated: YYYY-MM-DD` to each.

---

#### C-5. `/en/api-compare/` is the site's flagship comparison page and contains no comparison data at all

**Evidence.** The homepage links to `/en/api-compare/` **five separate times**, labelled `Compare Models`, `View API Comparison`, `View Full Comparison`, `View full comparison`, and `2. Compare APIs`. It is also in the top nav and the footer. It is unambiguously the site's most-promoted destination.

The page contains **zero `<table>` elements**. Its H1 is `AI Model Type Overview`, not a comparison. Its content is three headings (`Text Models`, `Image Models`, `Video Models`) with one descriptive paragraph each, plus a six-question FAQ.

Every actual pricing CTA on the page leaves the domain:

| Link text | href |
|---|---|
| `View Live Pricing` | `https://www.aitokenking.com.tw/models` |
| `Compare Prices` | `https://www.aitokenking.com.tw/models` |
| `View Pricing Table →` | `https://www.aitokenking.com.tw/models` |

The in-page anchors `View Text Models →`, `View Image Models →`, `View Video Models →` jump to `#text-models`, `#image-models`, `#video-models`, which are headings with two sentences underneath and no data.

The page also advertises data it does not have: `Real-time pricing for 60+ models — including Claude, GPT, Gemini, DeepSeek, and more.`

**Business impact.** The site's single highest-intent internal destination fails to deliver what six separate links promised, then ejects the visitor to a Chinese-language SPA. This is the largest single leak in the funnel, and it is also the page most likely to rank for commercial "compare AI API pricing" queries, meaning first-time visitors experience the worst page on the site.

**Action.** Render the actual comparison table server-side on `/en/api-compare/`, sourced from the same data the parent platform already serves. Keep the off-site CTA, but only after the visitor has been given the comparison they came for.

---

### HIGH

---

#### H-1. Five mutually contradictory model counts are published across the site

**Evidence.**

| Location | Claim |
|---|---|
| `/en/` meta description | `Compare 60+ models` |
| `/en/` H2 | `Compare 60+ AI Models Side by Side` |
| `/en/api-compare/` meta description | `Compare 40+ AI models across text, image, and video.` |
| `/en/api-compare/` body | `Real-time pricing for 60+ models` |
| `/en/api-compare/` category chips | `Text Models 25`, `Image Models 11`, `Video Models 8` (sums to 44) |
| `/en/token-calculator/` | `See a full breakdown of 25+ models` |
| Actual parent platform, rendered | `93+ AI 模型`, breakdown `文本 47 圖像 21 視頻 25` (sums to 93) |
| Actual calculator, in code | `const pricing = { openai: 2.5, claude: 5, gemini: 2 }` (3 models) |

The homepage and api-compare pages contradict each other in their own meta descriptions. The api-compare page contradicts itself between its body copy and its own category counts. And the real number, 93, is higher than anything the site claims, so the site is simultaneously inconsistent **and** underselling.

**Business impact.** A buyer who counts the rows notices. Inconsistent quantitative claims on a site whose product is quantitative comparison is a direct competence signal.

**Action.** Pick one number, derive it from the live data source, and template it into every location. Given the parent platform serves 93, lead with that.

---

#### H-2. Zero of 162 EN blog posts link to a money page, and zero link to another blog post

**Evidence.** Programmatic extraction of every `<a href>` inside the `<article>` element of all 162 posts:

- Posts with at least one link to a money page (`/token-calculator`, `/api-compare`, `/chatgpt-api`, `/claude-api`, `/gemini-api`, `/compliance`, `/use-cases`, `/user-guide`, `/beginners-guide`): **0**
- Posts with at least one link to another blog post: **0**
- Posts with any internal link at all in the body: **0**
- Posts with any external citation: **3**

The only in-body links on a typical post are the two social share buttons. Example, `calculating-ai-token-costs`, complete list of article hrefs:

```
https://twitter.com/intent/tweet?text=Calculating%20AI%20Token%20Costs...
https://www.linkedin.com/sharing/share-offsite/?url=...
```

The template does provide a fixed post-footer CTA (`Compare live pricing across 60+ models and calculate your exact token costs before committing.` linking to `/en/api-compare` and `/en/token-calculator`) and three related-post cards. Those are the only paths out, and they are identical on all 162 posts.

**Business impact.** 611 blog URLs, the overwhelming majority of the site's crawl surface and its organic entry points, pass no contextual authority to the pages that need to rank commercially, and give the reader no in-context reason to move toward a conversion point. The blog functions as 162 isolated leaves.

**Action.** Add 3 to 5 contextual in-body links per post: one to the most relevant money page, two to related posts. Prioritise the 48 posts with `cost` in the H1, which should all link to `/en/token-calculator/`. This is mechanical, high-leverage work.

---

#### H-3. Severe keyword cannibalization across the June 2026 cohort

**Evidence.** Title-level bigram overlap analysis across all 162 EN posts found **162 title pairs at 50% or higher overlap**, including six at 100%:

| Overlap | Title A | Title B |
|---:|---|---|
| 1.00 | `Understanding AI Token Basics for Beginners` | `Understanding AI Token Basics for a Smarter Future` |
| 1.00 | `Understanding AI Token Basics for Beginners` | `Understanding AI Token Basics: A Step-by-Step Guide for Beginners` |
| 1.00 | `Understanding AI Token Basics for Beginners` | `Understanding AI Token: A Beginner's Guide to Basics and Cost Control` |
| 1.00 | `Calculating AI Token Costs Made Easy` | `Calculating AI Token Costs: A Beginner's Guide` |
| 1.00 | `The Complete Guide to Calculating AI Token Costs for Small Businesses` | `Calculating AI Token Costs: A Beginner's Guide` |
| 1.00 | `Understanding AI Token Usage Dashboard` | `Understanding AI Token Usage for Beginners` |

Two pairs share an **exact duplicate `<title>` tag**:

- `AI Token Mechanics Explained for Developers` on both `ai-token-mechanics-guide` and `understanding-ai-token-mechanics`
- `AI Tokens Explained` on both `understanding-ai-token-basics-for-a-smarter-future` and `why-ai-uses-tokens-a-simplified-explanation`

Cluster sizes in the EN corpus:

| Cluster | Posts |
|---|---:|
| H1 contains `cost` | 48 |
| H1 begins `Understanding` | 42 |
| H1 contains `AI Token` | 67 |
| H1 contains `Guide` | 37 |
| H1 contains `Beginner` | 29 |
| Chrome DevTools angle on token costs | 5 |
| Google I/O 2026 angle on token costs | 5 |

The tightest commercial cluster, "how to calculate AI token costs", has at minimum eight competing posts: `ai-token-cost-calculation-simplified` (Jun 4, 642w), `calculating-ai-token-costs-made-easy` (Jun 4, 715w), `estimating-ai-token-costs-for-personal-users` (Jun 4, 538w), `calculating-ai-token-costs` (Jun 9, 535w), `calculating-ai-token-costs-for-small-businesses` (Jun 11, 781w), `calculate-ai-token-costs-enterprise-workloads` (Jun 19, 1742w), `calculate-ai-token-costs-business-2024` (Jun 21, 1994w), `calculate-ai-token-costs-2026-guide` (Jul 8, 1814w).

**Important nuance, in fairness:** 5-gram shingle analysis found **zero pairs above 10% text containment**. These are not spun duplicates. The problem is search-intent collision, not plagiarism, and the fix is consolidation rather than deletion.

**Business impact.** Eight thin pages competing for one query means none of them accumulates enough authority to rank, while the two strongest (the 1742w and 1814w versions) are diluted by six weak siblings.

**Action.** Consolidate each cluster into one canonical long-form guide, 301 the rest into it, and preserve any unique examples by merging them in. Start with the eight-post cost-calculation cluster and the four-post `Understanding AI Token Basics` cluster.

---

#### H-4. Zero named humans, zero credentials, zero About page, and no company entity anywhere on the domain

**Evidence.** All 162 EN posts carry the identical byline `AI Token King Editorial`, rendered as `<span class="post-author-name">AI Token King Editorial</span>`. It is not a link. There is no bio, no photo (a generic SVG person icon is used), no credentials, and no author archive page. `/en/authors/` returns 404.

Probed and confirmed 404: `/about/`, `/en/about/`, `/about-us/`, `/en/about-us/`, `/team/`, `/en/team/`, `/editorial-policy/`, `/methodology/`, `/case-studies/`.

Zero email addresses, `mailto:` links, phone numbers, or postal addresses appear in the served HTML of any of the 11 EN template pages.

The footer's only self-description is `The definitive English-language hub for understanding AI tokens, models, and APIs. Free, always.` and `© 2025 AI Token King. All rights reserved.` No legal entity is named.

Meanwhile, the parent platform at `aitokenking.com.tw` publishes all of this: `/about-us`, `/contact-us`, `mailto:aitokenking@insight-software.com`, and a named corporate entity `BASICWARE AI LIMITED` linking to `https://basic-ware.ai`.

**Business impact.** For B2B, anonymity is disqualifying. A buyer evaluating a compliance and procurement vendor (the exact pitch on `/en/compliance/`) cannot verify who they would be contracting with. The information exists one domain away and is simply not surfaced here.

**Action.** Publish `/en/about/` with the real entity (`BASICWARE AI LIMITED`), the relationship to AI Token King and Insight Software, and at least two named humans with roles and relevant background. Replace `AI Token King Editorial` with real bylines on the Jul/Aug cohort at minimum, since those posts are good enough to put a name on.

---

#### H-5. `© 2025` on every page in August 2026, and the site's only source citation has an empty href

**Evidence.** Footer of every page in every locale: `© 2025 AI Token King. All rights reserved.` / `© 2025 AI Token King. Todos los derechos reservados.`

`/en/ai-trends/` is the only template page with a `Sources & Further Reading` section. Its copy:

> `This page draws primarily from Gartner's 2031 Data, Analytics & AI Top 10 Predictions. If you'd like to read the full report, you can download the original document for reference.`

The download link markup:

```html
<a href class="btn-download">... 2031 Data, Analytics & AI Top 10 Predictions (Gartner Report · PDF)</a>
```

The `href` attribute is **empty**. The site's single external sourcing claim on its template pages cannot be verified by any reader.

**Business impact.** A stale copyright year is the most-recognised "abandoned site" heuristic there is, and it sits at the bottom of every page a lead reads. The broken source link converts the site's one gesture toward authoritativeness into evidence against it.

**Action.** Template the copyright year. Fix or remove the Gartner link; if the report cannot be redistributed, link to Gartner's own landing page for it.

---

#### H-6. The only working conversion path sends English, Spanish, Indonesian, and Vietnamese leads to a Traditional Chinese page

**Evidence.** The `Get Started` nav button on every page in every locale:

```html
<a href="https://www.aitokenking.com.tw/home" class="btn-primary desktop-nav"
   data-ga-event="cta_get_started" data-ga-location="nav" target="_blank" rel="noopener noreferrer">Get Started
```

Rendered destination (Puppeteer): `title: "AItokenKing - 首頁"`, `lang: "zh-Hant"`, body copy `全球智能, 一站式 API`, `免費試用`, `登錄`. Pricing is denominated in credits with `1 AItokenKing Credits = 1 USD ≈ 31.50 TWD`.

The same off-site destination is used for `Documentation` (`/docs`), `Compare Models`, `Compare Prices`, `View Live Pricing`, and `View Pricing Table →`.

Additionally, the destination serves **zero body text without JavaScript** (raw `curl` returns `<title>AItokenKing</title>` and an empty shell), so it is invisible to crawlers and unusable on a slow or restricted connection.

**Business impact.** The entire multilingual content investment (611 posts, 4 locales) funnels into a single Chinese-language endpoint. Bounce at that hop will be near-total for non-Chinese-reading leads. This is the reason the lead-gen numbers will look bad even after C-1 is fixed, unless it is addressed in the same sprint.

**Action.** Either localise the destination, or intercept the click with a native `/en/get-started/` page that captures the lead before handing off.

---

### MEDIUM

---

#### M-1. Money-page content is too thin to convince, especially the calculator

**Evidence.** Visible body text, `<script>`/`<style>` stripped, including roughly 300 words of shared nav plus footer:

| Page | Visible words | Approx. unique prose | Assessment |
|---|---:|---:|---|
| `/en/` | 1403 | ~1100 | Adequate for a hub |
| `/en/api-compare/` | 1414 | ~1110 | Adequate word count, **zero data** (see C-5) |
| `/en/user-guide/` | 1168 | ~870 | Adequate; it is a product page for the parent platform |
| `/en/beginners-guide/` | 1123 | ~820 | Thin for a "definitive" beginner guide |
| `/en/claude-api/` | 1011 | ~710 | Thin for a commercial provider page |
| `/en/ai-trends/` | 994 | ~690 | Thin |
| `/en/chatgpt-api/` | 966 | ~670 | Thin |
| `/en/gemini-api/` | 961 | ~660 | Thin |
| `/en/compliance/` | 863 | ~560 | **Too thin** for an enterprise sales page |
| `/en/use-cases/` | 668 | ~370 | **Too thin**; 9 H3s with one sentence each |
| `/en/token-calculator/` | 637 | ~340 | **Critically thin**, and it is a named nav item |

This is a coverage judgement, not a word target. What is actually missing:

- `/en/token-calculator/` covers 3 models (`GPT-4o`, `Claude Opus`, `Gemini 1.5 Pro`), input tokens only, no output tokens, no cached-input pricing, no context-window tiers, no currency other than USD, no batch pricing, and no real tokenizer. Competitors cover 90 to 142 models with three-way input / cached / output splits and long-context tiering.
- `/en/use-cases/` has 9 use cases with a single sentence each and no cost worked example. For a cost resource, every use case should carry a token estimate and a dollar figure.
- `/en/compliance/` names its target industries and its five solution pillars but offers no proof: no case study, no named customer, no certification, no audit standard reference (SOC 2, ISO 27001), and no downloadable proposal despite `View the Full Enterprise AI Compliance Proposal` appearing twice.
- Provider pages have no benchmark data, no latency figures, no rate-limit information, and no "when NOT to use this" section beyond generic prose.

**Action.** Priority order: (1) rebuild the calculator with output tokens, cached-input, and the full model list; (2) add a real comparison table to api-compare; (3) add one case study and one downloadable proposal to compliance; (4) add cost worked examples to use-cases.

---

#### M-2. The June 2026 cohort is thin bulk content; the Jul/Aug cohort is not. They should not be treated as one corpus

**Evidence.** Publication timeline for the 162 EN posts: **June 2026: 129 posts. July 2026: 30 posts. August 2026: 3 posts.** The June figure is a bulk launch, with 30-plus posts dated June 4 alone.

| Cohort | Posts | Median words | Mean words | Under 800 words |
|---|---:|---:|---:|---:|
| June 2026 | 129 | 650 | 836 | **100 of 129 (78%)** |
| Jul-Aug 2026 | 33 | 1878 | 1843 | **0 of 33 (0%)** |

Corpus-wide: min 412 words (`geminia-api-vs-gemini`), median 715, max 2680.

The shortest posts are the most commercially relevant ones: `chatgpt-vs-claude-vs-gemini-ai-models-comparison` (489w), `ai-token-price-comparison` (509w), `get-chatgpt-api-key-beginners-guide` (495w), `ai-platforms-for-small-businesses` (419w).

**Assessment.** Yes, the June cohort reads as thin AI-generated bulk: uniform 500 to 700 word length, formulaic `Understanding X` titling, no citations, no internal links, no first-hand detail, and in three cases (C-2) factually wrong about the core subject. The Jul/Aug cohort is the opposite and reads as genuinely useful.

**Action.** Treat these as two different problems. Consolidate and prune June aggressively (target roughly 40 strong posts from 129). Protect and extend the Jul/Aug editorial model, and put real bylines on it.

---

#### M-3. Topical drift dilutes the pricing-resource positioning

**Evidence.** Real H1s from the EN corpus:

- `Byzantine Empire Lessons for AI API Token Cost Strategy`
- `How the Clever Hans Effect Shapes AI Token Costs and Model Comparisons`
- `How Social Media Age Restrictions Inform AI API Cost Management for Developers`
- `AI API Cost Optimization with Chrome's Element-Scoped View Transitions`
- `Angular 17 AI API Cost Optimization: How New Features Reduce Token Expenses`
- `Revolutionizing Web Experiences with Declarative Partial Updates: Implications for AI API Costs`

Five posts hang on Chrome DevTools, five on Google I/O 2026. Separately, a substantial compliance cluster is Taiwan-specific on an English-language global site: `Understanding Taiwan's PDPA and AI API Integration`, `Taiwan Companies Using AI APIs: Understanding Legal Risks and Responsibilities`, `Why EU AI Act Enforcement 2026 Matters to Taiwan`.

**Business impact.** Every post about Byzantine military strategy or Angular 17 that carries a forced "and this affects token costs" hook trains search engines and LLMs that this domain is a general tech blog, not the authoritative AI pricing reference. It also wastes the crawl budget that the money pages need.

**Action.** Define a topical boundary and enforce it: AI model pricing, token economics, cost optimisation, and AI procurement/compliance. Move or retire the rest. Keep the Taiwan compliance content but make its geography explicit in the title, or move it under a regional path.

---

#### M-4. No structured data anywhere on the site, and no machine-readable dates

**Evidence.** `application/ld+json` script count: **0** across all 162 blog posts and **0** across all 11 EN template pages. No `Organization`, no `Article`, no `FAQPage`, no `BreadcrumbList`, no `Product` markup.

Blog posts additionally have: **0** `<time>` elements, **0** `article:published_time` meta tags, **0** `meta name="author"`, and `og:type` set to `website` rather than `article`. The publication date exists only as untagged visible text (`July 30, 2026`).

This is notable because the site **has** well-formed FAQ blocks on the homepage, api-compare, token-calculator, compliance, and all three provider pages, all of which would qualify for `FAQPage` markup immediately.

**Business impact.** No rich results, no author entity, no organisation entity, and nothing telling a crawler or an LLM when a price was published. For a pricing resource, an undated price is a price nobody should quote.

**Action.** Add `Organization` (with the real entity and contact point), `Article` with `datePublished` and `dateModified` on posts, `FAQPage` on the eight pages that already have FAQ blocks, and `BreadcrumbList`. Set `og:type: article` on posts.

---

#### M-5. Locale spot-check: translation quality is high, but URL slugs and one CTA are not localised

**Evidence.** 31 posts sampled (es 11, id 11, vi 9) plus all 33 non-EN template pages. **No source-language sentence leaks were found in any locale body copy.** Bylines and dates are correctly localised in all three.

Issues found:

| Severity | Locale | Issue | Evidence |
|---|---|---|---|
| Medium | es | Enterprise sales CTA hardcodes the EN URL, dumping Spanish leads onto the English page | `/es/compliance/`: `<a href="/en/compliance" class="btn-primary">` labelled `Contactar al Equipo de Ventas Empresariales`. ID and VI correctly use `/id/compliance` and `/vi/compliance`. |
| Medium | vi | 58 of 135 VI blog URLs (43%) use untranslated English slugs | `/vi/blog/adopting-ai-api-for-business`, `/vi/blog/ai-hype-reality-2026`, `/vi/blog/ai-token-input-output-explanation`, `/vi/blog/ai-token-vs-quota-explained` |
| Low | es | Spelling error in a homepage-featured post title | `Óptimización de Costos de Tokens para Pequeñas Empresas` (correct Spanish is `Optimización`). Appears in the visible heading and the image `alt` text. |
| Low | id | Non-word in title, H1, and URL slug | `Mengilih Platform Token AI: Panduan untuk Pemula` at `/id/blog/mengilih-platform-token-ai-panduan`. Correct Indonesian is `Memilih`. 15 occurrences in the served HTML. |
| Low | es | Brand name mistranslated in a URL slug | `/es/blog/claudio-api-para-principiantes`. The body correctly says `Claude`; only the slug says `Claudio`. |
| Low | id | English slug on a localised post | `/id/blog/how-new-ai-model-is-54-percent-more-token-efficient-what-it-means-for-cost` |
| Low | es | Anglicism in an H2 | `¿Cómo Elegir una API de Modelo Mainstream?` |

Slug localisation rate: es 10 of 157 English-looking (94% localised), id 11 of 156 (93%), vi 58 of 135 (57%).

All four locales carry every one of the sitewide critical defects: `href="#"` policy links, `© 2025`, dead newsletter form, no contact, stale pricing.

**Action.** Fix the ES compliance CTA href (one-line change, highest impact). Fix the two visible-copy typos. Backfill VI slugs with 301s.

---

### LOW

---

#### L-1. Brand identity is inconsistent across four names

**Evidence.**

| Variant | Where |
|---|---|
| `AI Token King` | All body copy and the logo. 7 occurrences on `/en/`, 8 on api-compare, 11 on token-calculator, 21 on user-guide. Zero occurrences of `AI Token Global`. |
| `AI Token` | Root `og:site_name` and root `<title>`: `AI Token \| AI Pricing, Token Calculator & API Comparison` |
| `AItokenKing` | Parent platform title: `AItokenKing - 首頁` |
| `aitoken.global` | The domain the visitor is on |
| `BASICWARE AI LIMITED` | The actual legal entity, published only on the parent site |

**Business impact.** A visitor cannot tell what company they are dealing with. It also splits brand-search signal and makes the entity unresolvable for an LLM trying to attribute a claim.

**Action.** Choose the canonical brand, use it in `og:site_name`, `<title>` suffix, footer, and `Organization` schema, and state the relationship to the legal entity on the About page.

---

#### L-2. Assorted copy defects

**Evidence.**

| Issue | Location | Verbatim |
|---|---|---|
| Post published 2026 with `2024` in the title | `/en/blog/calculate-ai-token-costs-business-2024` (pub. June 21, 2026) | `How to Calculate AI Token Costs for Your Business in 2024: A Step-by-Step Guide` |
| Typo in URL slug | `/en/blog/geminia-api-vs-gemini` | `geminia` |
| Missing space after colon, 4 instances, inconsistent with the ChatGPT and Claude pages | `/en/gemini-api/` | `Gemini 1.5 Pro:$1.25 / 1M input tokens`, `Gemini 1.5 Flash:$0.075`, `Gemini 1.0 Pro:$0.50` (vs `GPT-4o: $2.50` with a space) |
| Placeholder social links | Footer, every page | `<a href="https://linkedin.com">` and `<a href="https://twitter.com">` with empty link text |
| Title / H1 mismatch on 147 of 162 posts | e.g. `calculating-ai-token-costs` | `<title>Understanding AI Token Pricing</title>` vs H1 `Calculating AI Token Costs: A Beginner's Guide` |
| Unfulfilled promise in copy | `/en/compliance/` | `View the Full Enterprise AI Compliance Proposal` appears twice; no proposal document is linked or downloadable |

**Checked and clean:** no `Lorem ipsum`, no `TODO`, no `FIXME`, no `undefined`, no `NaN` in rendered output. The three `PLACEHOLDER` hits in `/en/token-calculator/` are a JavaScript variable name (`SUMMARY_PLACEHOLDER`), not user-facing copy. This is a false positive and is not a defect.

---

## 6. Content depth by page type

| Page type | Count (EN) | Expectation for a B2B pricing resource | Verdict |
|---|---:|---|---|
| Homepage | 1 | Value prop, proof, comparison teaser, clear next step | **Partial.** Good structure and a strong FAQ. Fails on proof (no logos, no numbers, no named humans) and on the CTA, which is off-site. |
| Comparison hub | 1 | The actual comparison data, filterable, dated, sourced | **Fail.** Zero tables. See C-5. |
| Calculator | 1 | Multi-model, input + output + cached, real tokenizer, dated prices | **Fail.** 3 models, input only, approximation formula, undated, self-sourced. See M-1. |
| Provider guides | 3 | What it is, when to use, current pricing, limits, alternatives | **Partial.** Structure and FAQs are good. Pricing is 1 to 2 generations stale. No benchmarks or rate limits. |
| Educational | 2 (`beginners-guide`, `use-cases`) | Worked examples with real numbers | **Partial.** `beginners-guide` sequences well. `use-cases` is 9 one-sentence entries with no cost math. |
| Enterprise / lead-gen | 1 (`compliance`) | Problem, solution, proof, contact | **Fail on two of four.** Problem and solution are well written. No proof at all, and the contact CTA is a self-link. See C-1. |
| Product page | 1 (`user-guide`) | What the platform does, pricing, how to start | **Adequate.** Clearest commercial page on the site. All CTAs leave the domain. |
| Trend content | 1 (`ai-trends`) | Sourced forward-looking analysis | **Partial.** Only page that attempts sourcing; the source link is broken. See H-5. |
| Blog | 162 | Depth, sourcing, attribution, internal linking | **Bimodal.** See M-2. |

---

## 7. Conversion path analysis

### CTA inventory, EN money pages

| Page | Primary CTA | Destination | Working? |
|---|---|---|---|
| `/en/` | `Get Started` (nav) | `https://www.aitokenking.com.tw/home` | Yes, off-site, Chinese |
| `/en/` | `Start the Guide` | `/en/beginners-guide` | Yes, on-site, non-commercial |
| `/en/` | `Subscribe Free` | `onsubmit="return false;"` | **No** |
| `/en/api-compare/` | `View Live Pricing`, `Compare Prices`, `View Pricing Table →` | `https://www.aitokenking.com.tw/models` | Yes, off-site, Chinese |
| `/en/token-calculator/` | `Compare Models →` | `/en/api-compare` | Yes, lands on a page with no data |
| `/en/chatgpt-api/`, `/claude-api/`, `/gemini-api/` | `View Full Comparison` | `/en/api-compare` | Yes, lands on a page with no data |
| `/en/compliance/` | `Contact Enterprise Sales` | `/en/compliance` | **No, self-link** |
| `/en/compliance/` | `View Enterprise AI Compliance Proposal` | `/en/compliance` | **No, self-link** |
| `/en/user-guide/` | `Get Started Free` | `https://www.aitokenking.com.tw/home` | Yes, off-site, Chinese |
| Blog post (all 162) | `Compare Models` | `/en/api-compare` | Yes, lands on a page with no data |
| `/en/blog/` | newsletter | `onsubmit="return false;"` | **No** |

### Click trace from a blog post to a conversion point

A visitor arrives on `/en/blog/calculating-ai-token-costs` from search (the most likely entry, given 611 blog URLs versus 44 template URLs).

**Path A, the intended one.**
1. Scroll past the whole article (zero in-body links) to the footer CTA: `Compare live pricing across 60+ models and calculate your exact token costs before committing.` Click `Compare Models`. → `/en/api-compare/` **(click 1)**
2. Page promises `Real-time pricing for 60+ models` but shows no table. Click `View Live Pricing`. → `https://www.aitokenking.com.tw/models`, new tab **(click 2)**
3. Land on a Traditional Chinese JavaScript SPA. **(click 3+ to register, in a language they cannot read)**

**Minimum 3 clicks, one domain change, one language change, and zero lead capture on aitoken.global at any step.**

**Path B, the nav shortcut.** `Get Started` → `aitokenking.com.tw/home`, 1 click, same Chinese-language wall.

**Path C, the enterprise path.** `/en/compliance/` → `Contact Enterprise Sales` → `/en/compliance/`. Infinite loop. **Zero clicks of forward progress.**

**Path D, soft capture.** Newsletter form. Dead.

### Assessment

A 611-post blog with no in-body conversion surface, no lead capture, and a broken enterprise CTA is the defining finding of this audit. The content engine is producing traffic that the site has no mechanism to convert. Fixing C-1 (real contact page and working forms) plus H-2 (in-body links) plus C-5 (real comparison data) is the entire near-term conversion programme, and none of the three requires new content.

---

## 8. AI-citation readiness: 38 / 100

| Component | Weight | Score | Evidence |
|---|---:|---:|---|
| Crawlable without JavaScript | 20 | **20** | Verified by Puppeteer versus raw `curl` on 3 pages. 100% of content is server-rendered. The strongest asset the site has. |
| Facts stated in self-contained, quotable form | 20 | **12** | FAQ answers are excellent quotable units, e.g. `In English, one token is roughly 4 characters or ¾ of a word` and `Each AI provider uses a different tokenizer — the algorithm that splits text into tokens. OpenAI uses tiktoken (BPE-based), Anthropic uses their own tokenizer, and Google uses SentencePiece.` Pricing lists are cleanly structured. Deduction: many claims are hedged into unquotability (`Prices are approximate and subject to change`), and the calculator's numbers are unattributable. |
| Claims are sourced and attributable | 20 | **2** | 3 of 162 posts carry any external citation. The one sourcing link on the template pages has an empty `href`. Price sourcing is circular: `Reference prices sourced from AI Token King.` |
| Freshness is machine-readable | 20 | **2** | Zero JSON-LD, zero `<time>`, zero `article:published_time`, `og:type: website` on articles, no "last updated" on any price. Dates exist only as untagged visible text. |
| Entity clarity and brand-near-claim | 20 | **2** | Zero `Organization` schema. Four brand variants. No author entity. The brand *is* named adjacent to its price claims (`AI Token King ref. price: $2.50 / 1M tokens`), which is structurally correct, but the claim is stale, so successful citation actively harms the brand. |
| **Total** | **100** | **38** | |

**The asymmetry worth acting on:** the hard part (server-side rendering) is already done and done well. The remaining 62 points are almost entirely mechanical: add JSON-LD, add dated price stamps, cite the provider pricing pages. That is a matter of days, not months, and it converts the strongest technical asset on the site into an actual citation channel.

---

## 9. Competitor benchmark

Three competitors, all fetched live on 2026-08-06.

### 9.1 `https://www.llm-prices.com/` (freshness benchmark)

Single-page calculator plus a sortable table over 142 models across 11 vendors, backed by `https://www.llm-prices.com/current-v1.json` and the public repo `https://github.com/simonw/llm-prices`.

| What they have | What aitoken.global has |
|---|---|
| Visible `Prices last updated:` populated from `"updated_at": "2026-08-05"` | No freshness signal anywhere |
| Version-controlled price data with public git history (`2026-07-30 Price drops for GPT-5.6 Luna and Terra`) | Self-referential `AI Token King reference prices` |
| 142 models, 11 vendors | 3 in the calculator, 6 in the homepage table, 0 on api-compare |
| Three-way split: `Number of input tokens`, `Number of cached input tokens`, `Number of output tokens` | Input tokens only |
| Long-context tiers as separate rows: `GPT-5.4 ≤272k` vs `>272k`, `Claude Sonnet 4 and 4.5 ≤200k` vs `>200k` | Gemini 1.5 only |
| Honest note: `Note: Different models use different tokenizers, so direct token-based price comparisons may not be entirely accurate.` | Comparable disclosure present. **Parity.** |

Notably, this site has **no About page, no contact, and no company entity**, and it is still the most trusted resource in the niche. Freshness alone carries it.

### 9.2 `https://docsbot.ai/tools/gpt-openai-api-pricing-calculator` (commercial playbook)

A free 90-model, 15-provider calculator published as a lead magnet by a paid SaaS.

| What they have | What aitoken.global has |
|---|---|
| `Pricing verified Jul 30, 2026` rendered twice, plus `Prices in USD per million tokens. Verified 2026-07-30.` in the table caption | Nothing |
| Stated methodology: `Standard public API list prices in US dollars` | `Reference prices sourced from AI Token King.` |
| Scope disclaimer: `Your invoice can differ because of provider-specific tokenization, minimum charges, regional pricing, or negotiated discounts.` | Weaker equivalent present |
| Cached-input fallback logic disclosed: `The calculator charges that portion at the model's normal input rate and labels the fallback, so caching never creates an artificial discount.` | No cached-input support at all |
| Context and max-output shown per model (`200K/64K`) | Context on the homepage table only |
| Interlinked tool cluster: calculator + `LLM AI Model Directory` + `AI Terms Glossary` + comparison page | Calculator and api-compare, neither of which links usefully to the other |
| Working CTAs: `Build your first DocsBot free`, `Explore the LLM model directory →` | Dead newsletter, self-linking sales button |
| Buyer-honest FAQ: `Should I choose the cheapest model?` / `Cost is one constraint. Test shortlisted models against your own quality, latency, context, and reliability requirements before committing production traffic.` | FAQs are good but stop short of procurement guidance |

**This is the closest analogue to aitoken.global's business model and the template to copy.**

### 9.3 `https://artificialanalysis.ai/` (authority play)

594 models, 22 evaluations, positioned as `Independent analysis of AI`.

| What they have | What aitoken.global has |
|---|---|
| Contact page at `/contact` with a published email `media@artificialanalysis.ai` | No contact of any kind |
| Deep methodology disclosure at `/methodology` and `/methodology/intelligence-benchmarking` | None |
| Sourcing statement: `Prices shown are the current prices listed by providers.` | Circular self-sourcing |
| Dated changelog (`5 Aug`, `4 Aug`, `3 Aug`) as an implied freshness proof | None |
| **Deprecation callouts on pricing pages**: Claude Sonnet 4.5 is flagged as deprecated with a recommendation to consider `Claude Sonnet 4.6 (Non-reasoning)` instead | Deprecated models presented as current with no flag |
| Price cross-referenced to measured quality and latency, so the page answers "is this worth it" | Price only |
| Same model priced across Anthropic, Azure, Google Vertex, Amazon, Databricks | Single price per model |
| Working newsletter (`Get notified about new articles`) and a paid tier | Dead newsletter |

Note that they also have **no About page** (`/about` returns 404) and **no named individuals**, and still out-rank on trust, because methodology and freshness substitute for identity in this niche.

### 9.4 Cautionary case: `https://llmpricecheck.com/`

This site **does** cite its sources (`OpenAI Pricing, Anthropic Pricing, Google Cloud Pricing, Mistral Pricing, Cohere Pricing, Amazon Bedrock Pricing, Groq Pricing`) and credits quality scores to `Artificial Analysis Models Leaderboard`. But it has no "last updated" date and its newest entries are `gpt-4o` and `claude-3-opus`, and it lists `gpt-4o: Input $5, Output $15`, which is the old `chatgpt-4o-latest` rate. **Citing sources does not rescue a page that has not been refreshed.** This is precisely the trap aitoken.global is currently in, and it is the reason freshness must be fixed before sourcing.

### 9.5 The gap in one table

| Capability | llm-prices | DocsBot | Artificial Analysis | **aitoken.global** |
|---|:-:|:-:|:-:|:-:|
| Visible "last verified" date | Yes | Yes | Changelog | **No** |
| Models covered | 142 | 90 | 594 | **3 in calc, 6 on homepage** |
| Input + cached + output split | Yes | Yes | Yes | **Input only** |
| Long-context tier pricing | Yes | Partial | Yes | **Gemini 1.5 only** |
| Stated methodology | Repo + README | Yes | Yes | **No** |
| Links to provider pricing docs | No | No | No | **No (parity)** |
| Deprecation flags | Implicit | Implicit | Explicit | **No** |
| Named author or entity | GitHub identity | Company | Company | **No** |
| Working contact | No | No | Yes | **No** |
| Working lead capture | N/A | Yes | Yes | **No** |
| Privacy policy / terms | Not applicable | Yes | Yes | **`href="#"`** |
| Full server-side rendering | Partial (JSON fetch) | Yes | Yes | **Yes** |
| Editorial blog at scale | No | Partial | Yes | **Yes, 611 posts** |
| Multilingual | No | No | No | **Yes, 4 locales** |

**Read this table both ways.** aitoken.global loses on every data-freshness and trust column, which are the columns that decide the sale in this niche. It wins outright on server-side rendering, editorial volume, and multilingual coverage, which none of the three competitors have. The strategy that follows is not "publish more", it is "make the data trustworthy and let the existing content volume do the work".

---

## 10. Prioritised action list

**This week, and none of these require new content.**

1. Unpublish or rewrite the three crypto-confused posts and pull them from the homepage feature module. (C-2)
2. Fix the two `/en/compliance/` self-linking CTAs. (C-1)
3. Publish Privacy Policy and Terms in all 4 locales; fix the 3 `href="#"` links per page. (C-4)
4. Template the copyright year. (H-5)
5. Fix the ES compliance CTA `href="/en/compliance"` → `/es/compliance`. (M-5)
6. Fix or remove the empty-`href` Gartner link. (H-5)

**Next two weeks.**

7. Ship `/en/contact/` (all locales) with a working form, published email, and stated response time. Repoint the compliance CTAs at it. (C-1)
8. Wire the newsletter to a real ESP, or remove it and its false `Join thousands of developers` claim. (C-1)
9. Add `Prices verified: YYYY-MM-DD` next to every price table and calculator card. (C-3)
10. Refresh all pricing from the parent platform's live data, which already carries current models. Reconcile the calculator against the provider pages. (C-3)
11. Render a real comparison table on `/en/api-compare/`. (C-5)
12. Normalise the model count to one number derived from live data. (H-1)

**Next quarter.**

13. Add 3 to 5 contextual in-body links per blog post, starting with the 48 cost-themed posts. (H-2)
14. Consolidate the cannibalising clusters with 301s. Start with the 8-post cost-calculation cluster. (H-3)
15. Publish `/en/about/` with the real entity (`BASICWARE AI LIMITED`) and named humans; replace `AI Token King Editorial` with real bylines on the Jul/Aug cohort. (H-4)
16. Add JSON-LD sitewide: `Organization`, `Article` with `dateModified`, `FAQPage` on the 8 pages that already have FAQs. (M-4)
17. Rebuild the calculator: full model list, output tokens, cached-input pricing, context tiers. (M-1)
18. Localise the `Get Started` destination or intercept it with a native lead-capture step. (H-6)
19. Add one case study and a downloadable proposal to `/en/compliance/`. (M-1)
20. Publish an editorial and pricing-methodology page. (H-4, C-3)

---

## 11. No data / could not verify

Recorded explicitly. Nothing below is estimated or inferred.

1. **Whether the Gartner report cited on `/en/ai-trends/` exists.** The page claims `Gartner's 2031 Data, Analytics & AI Top 10 Predictions`. The download link has an empty `href`, so the source is unverifiable from the page. I did not attempt to verify the report independently. **No data.**

2. **Whether `AI Token King reference prices` are intended as reseller prices rather than provider list prices.** The calculator card says `Anthropic Claude Opus AI Token King ref. price: $5.00 / 1M tokens` while `/en/claude-api/` says `Claude 3 Opus: $15.00 / 1M input tokens`. The two could be reconciled if the calculator quotes a reseller rate, but no page states this. **No data on intent.** The internal contradiction is verified regardless.

3. **Whether Llama 3.1 405B at `$5.00 / $15.00` is currently accurate.** No benchmark competitor carried a Llama 405B row. **No data.**

4. **Whether Claude 3 Haiku at `$0.25 / $1.25`, GPT-4 Turbo at `$10.00 / $30.00`, o1 at `$15.00 / $60.00`, and Gemini 1.0 Pro at `$0.50 / $1.50` were accurate at the time of writing.** These models are absent from all three maintained competitor trackers, consistent with deprecation. I could not verify the figures. The staleness of the lineup is verified; the historical accuracy of the numbers is **no data**.

5. **Actual organic traffic, rankings, impressions, or conversion rates.** No analytics access. All conversion findings describe path integrity, not measured behaviour. **No data.**

6. **Whether the newsletter input is captured by any client-side script not present in the served HTML.** I found `onsubmit="return false;"`, no `action`, and no ESP script tags. A hosted tag manager could theoretically intercept it. **No data**, though the balance of evidence is strongly against.

7. **What a visitor sees after signing up on `aitokenking.com.tw`.** I rendered `/home` only, and did not create an account. Whether an English UI exists behind login is **no data**.

8. **Full-corpus factual accuracy of the 162 EN posts.** I read the full text of roughly 30 posts and ran keyword scans across all 162. Three factually broken posts are verified by direct quotation. Whether more exist beyond the crypto-confusion pattern is **no data**.

9. **Whether the June 2026 posts were AI-generated.** The signature (129 posts in one month, uniform 500 to 700 words, formulaic titling, zero citations, zero internal links, category-level factual errors) is consistent with bulk AI generation. I have no provenance data. Stated as an assessment, not a verified fact.

10. **Translation fidelity of the es/id/vi corpus beyond the 31 sampled posts.** Sampling was systematic (every 15th sitemap URL) but covers roughly 7% of each locale. Findings are representative, not exhaustive. **No data** on the remaining 93%.

11. **Whether `/en/compliance/` claims (data masking, prompt auditing, multi-model routing) are actually delivered.** These are product claims about the parent platform. Not verifiable from the marketing site. **No data.**

12. **Whether the crypto-confusion errors were faithfully translated into es/id/vi.** Flagged as a likely follow-up in C-2, but I did not verify the translated versions of those three specific posts. **No data.**
