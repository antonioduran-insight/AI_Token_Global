# Visual / UI Audit: www.aitoken.global

**Lane:** Visual / UI
**Date:** 2026-08-06
**Host audited:** `https://www.aitoken.global` (www)
**Scope:** 13 EN routes x 2 viewports (desktop 1920x1080, mobile 390x844) = 26 page-device captures
**Method:** Puppeteer 25.0.4, headless Chrome. All values are measured via `page.evaluate()` (`getBoundingClientRect`, `getComputedStyle`, `PerformanceObserver`) or the CDP network log (`Network.loadingFinished.encodedDataLength`). Contrast ratios are computed from **actual painted pixels**: the element's text is set to `transparent`, the element box is captured, and the pixels are averaged inside a canvas, then compared against the element's real computed text colour. No value in this document is estimated.

**Business lens:** this site is a sales resource for B2B lead generation. Findings are graded on whether a cold prospect would trust the interface and find a path to contact.

---

## Executive summary

The site is **visually competent and technically clean**: zero console errors, zero failed page subresources, zero broken images, zero horizontal overflow at 390px, a unique `h1` above the fold on all 26 captures, and a visible focus indicator on every tab stop tested. The craft floor is high.

The problem is not the surface, it is the **conversion machinery behind it**. Every mechanism a prospect would use to become a lead is either non-functional or absent:

- The only on-site email capture form **silently discards submissions** (zero network requests, zero feedback).
- The enterprise sales page's two named CTAs (`Contact Enterprise Sales`, `View Enterprise AI Compliance Proposal`) both link to **the page they are already on**.
- There is **no contact route, no `mailto:`, no `tel:`, and no contact link anywhere** across all 13 pages.
- `Privacy Policy` and `Terms of Service` resolve to `href="#"` on every page, including inside the cookie consent dialog that asks for the visitor's consent.

Separately, `/en/blog/` ships **18.6 MB** with a **CLS of 0.7112**, which is roughly 2.8x the "poor" Core Web Vitals threshold.

**Counts:** 4 Critical, 6 High, 7 Medium, 6 Low, plus a "what is genuinely good" register.

---

# CRITICAL

## C1. The newsletter form silently discards every lead

**Where:** `/en/` and `/en/blog/`
**Evidence:** `home-desktop-full.png` (form at document Y approximately 6,000 of 6,810), `blog-index-desktop-full.png`

Measured markup and behaviour:

```
<form onsubmit="return false;">                  <- hard-blocks submission
  <input type="email" placeholder="Enter your email">   <- no name, no id, required=false
  <button type="submit">Subscribe Free</button>   <- 152.8x45.6 px
</form>
form.action = null      form.method = null      form.id = ""
```

Live submission test (value `audit.test@example.com` set, `input` event dispatched, submit button clicked, 2,500 ms wait):

| Signal | Result |
|---|---|
| Network requests fired (xhr / fetch / document) | **0** |
| URL after submit | unchanged (`https://www.aitoken.global/en/`) |
| Input value after submit | still `audit.test@example.com` (not cleared) |
| Success or error message rendered | **none** (surrounding text unchanged) |
| Console output | only the pre-existing Tailwind CDN warning |

The input also has **no `name` attribute**, so even if a handler were attached the value would not serialise. The adjacent copy reads "Weekly roundups ... No spam, just signal" and "Join thousands of developers", which sets an expectation the form cannot meet.

**Impact:** the single on-site lead capture mechanism on a lead-generation site captures nothing, and the visitor is given no indication of failure.

---

## C2. The enterprise sales CTAs link to themselves; the site has no contact path at all

**Where:** `/en/compliance/` (the enterprise page), and site-wide
**Evidence:** `compliance-desktop-fold.png`, `compliance-desktop-full.png`, `compliance-mobile-full.png`

Verified in the live served HTML (`curl`) and in the rendered DOM:

| CTA label | Measured `href` | Size | Document Y |
|---|---|---|---|
| `Contact Enterprise Sales` | `/en/compliance` | 232 x 37.8 | 1,030.1 |
| `View Enterprise AI Compliance Proposal` | `/en/compliance` | 344.7 x 43.6 | 1,248 |

Both are `class="btn-primary"`. Both point at the URL the visitor is already viewing, so clicking reloads the page. `Contact Enterprise Sales` is the most sales-relevant control on the entire site.

Site-wide contact inventory (all 13 routes, measured):

| Signal | Count across all 13 pages |
|---|---|
| `a[href^="mailto:"]` | **0** |
| `a[href^="tel:"]` | **0** |
| Links whose text or href matches `contact\|sales\|demo\|quote\|talk\|call` | **0** on `/en/` |
| Email address in rendered body text | **0** |
| Phone number in rendered body text | **0** |
| `/contact` route in the header or footer link set | **absent** |

The header and footer link sets (enumerated in full in section 8 below) contain no contact destination.

**Impact:** a prospect who reads the enterprise compliance page and decides to buy has no measurable way to reach a human. This is the defining defect of the audit.

---

## C3. Privacy Policy and Terms of Service are dead links on every page, including inside the consent dialog

**Where:** footer on all 13 routes, plus `#cookie-consent`
**Evidence:** every `*-fold.png` (banner visible) and every `*-full.png` (footer visible); clearest in `home-desktop-fold.png` and `home-desktop-full.png`

| Link | Location | Measured `href` | Size |
|---|---|---|---|
| `Privacy Policy` | footer | `#` | 82.7 x 19.2 |
| `Terms of Service` | footer | `#` | 99.1 x 19.2 |
| `Privacy Policy` | inside `#cookie-consent` | `#` | 87.3 x 18 |

Confirmed in the served HTML for `/en/`, `/en/compliance/`, and `/en/beginners-guide/`. `document.querySelectorAll('a[href="#"]')` returns exactly these 3 elements on `/en/`.

**Impact:** the cookie banner asks for consent and offers a Privacy Policy link that goes nowhere. For a B2B buyer running vendor due diligence, and for any GDPR or procurement review, a missing privacy policy and terms is a hard disqualifier. It is also the cheapest Critical on this list to fix.

---

## C4. `/en/blog/` ships 18.6 MB and has a CLS of 0.7112

**Where:** `/en/blog/`
**Evidence:** `blog-index-desktop-full.png` (1920 x 3830), `blog-index-mobile-full.png` (390 x 8636)

| Metric | Desktop | Mobile |
|---|---|---|
| Total transferred | **18,636 KB** (18.2 MB) | 12,903 KB (12.6 MB) |
| Of which images | **18,184 KB** | 12,451 KB |
| Requests | 40 | 32 |
| **Cumulative Layout Shift** | **0.7112** | 0.0174 |
| Largest single resource | `9bcd3f2f...png` **3,301 KB** | `9bcd3f2f...png` 3,306 KB |
| Time to network idle | 3,364 ms | 2,336 ms |

CLS 0.7112 is 2.8x the 0.25 "poor" threshold. Direct cause is measurable: **no `<img>` on any route carries `width` or `height` attributes** (checked on all 104 rendered images), so every image reserves zero space until it decodes.

The desktop CLS is far worse than mobile (0.7112 vs 0.0174) because the desktop grid renders more thumbnails simultaneously above the fold.

**Impact:** on a metered mobile connection this single page can cost a prospect more data than the rest of the site combined, and the content visibly jumps while they try to read it. Blog is the top-of-funnel entry point for organic search traffic.

---

# HIGH

## H1. On mobile there is no conversion CTA above the fold on 6 of 13 pages, and the primary CTA is hidden inside the hamburger on all 13

**Evidence:** `chatgpt-api-mobile-fold.png`, `claude-api-mobile-fold.png`, `gemini-api-mobile-fold.png`, `beginners-guide-mobile-fold.png`, `use-cases-mobile-fold.png`, `ai-trends-mobile-fold.png`

Interactive elements intersecting the 390 x 844 fold, cookie banner dismissed, closed mobile nav panel excluded:

| Route | Desktop fold | Mobile fold | Mobile fold contents |
|---|---|---|---|
| `/en/` | 12 | 4 | logo, hamburger, `Start the Guide`, `View API Comparison` |
| `/en/token-calculator/` | 11 | 5 | logo, hamburger, `Home` crumb, textarea, `Clear` |
| `/en/api-compare/` | 15 | 5 | logo, hamburger, `Home` crumb, 2 anchor cards |
| `/en/chatgpt-api/` | 18 | **4** | logo, hamburger, `Home` crumb, `Compare Models` crumb |
| `/en/claude-api/` | 18 | **4** | logo, hamburger, 2 breadcrumbs |
| `/en/gemini-api/` | 18 | **4** | logo, hamburger, 2 breadcrumbs |
| `/en/beginners-guide/` | 16 | **3** | logo, hamburger, `Home` crumb |
| `/en/use-cases/` | 9 | **3** | logo, hamburger, `Home` crumb |
| `/en/user-guide/` | 20 | 5 | logo, hamburger, crumb, `Read the Guide`, `Quick Start` |
| `/en/compliance/` | 18 | 5 | logo, hamburger, crumb, `See the Solution`, `View Enterprise Proposal` |
| `/en/ai-trends/` | 9 | **3** | logo, hamburger, `Home` crumb |
| `/en/blog/` | 18 | 4 | logo, hamburger, search input, featured card |
| `/en/blog/ai-token-basics.../` | 17 | 6 | logo, hamburger, 2 crumbs, 2 tag pills |

On the six bolded routes the mobile fold contains **zero** actionable elements other than site chrome and a 37.3 x 19.2 px breadcrumb.

The `Get Started` primary CTA (`https://www.aitokenking.com.tw/home`) exists on every page, but on mobile it lives **inside `#mobile-nav-panel`**, which is closed by default (`opacity: 0`, `pointer-events: none`). Reaching it costs **2 taps** on every mobile page. On desktop it is 1 click at 135.2 x 36.4 px in the header.

## H2. Every rendered image is oversized, by up to 161x in area

**Evidence:** `home-desktop-full.png`, `home-mobile-full.png`, `blog-post-desktop-full.png`

Across the 26 captures, 104 images actually render. **100 of them exceed 2x their displayed linear size.** Worst offenders on `/en/`:

| Natural | Displayed | Linear | Area | Transferred | File |
|---|---|---|---|---|---|
| 1344 x 768 | **80 x 80** | 16.8x | **161x** | 701 KB | `23c7867a...png` |
| 1344 x 768 | **80 x 80** | 16.8x | **161x** | 733 KB | `bc4de1ca...png` |
| 1344 x 768 | **80 x 80** | 16.8x | **161x** | 913 KB | `6b87068e...png` |
| 1344 x 768 | 386.7 x 160 | 3.5x | 17x | 1,016 KB | `f8b57cd0...png` |
| 116 x 116 | 36 x 36 | 3.2x | 10x | 5.6 KB | `AI_Token_logoPNG.avif` |

Three 1344 x 768 source PNGs totalling **2,347 KB** are being downloaded to fill 80 x 80 px thumbnails. They are served from `cdn.sanity.io` as raw `image/png` with no width, format, or quality transform in the URL, on a CDN that supports those transforms natively. Mobile requests the identical full-resolution assets.

Page weight consequence: `/en/` 5,892 KB desktop (5,473 KB images), `/en/blog/ai-token-basics-for-beginners/` 6,500 KB (6,083 KB images), against 419 to 424 KB for every image-free content page.

## H3. The closed mobile nav panel holds 14 focusable links inside an `aria-hidden="true"` subtree

**Evidence:** `home-mobile-fold.png` (panel invisible), `home-mobile-navopen.png` (panel open)

Measured state of `#mobile-nav-panel` while closed, at 390 x 844:

```
display: block        visibility: visible     opacity: 0
transform: matrix(1,0,0,1,0,-12)              pointer-events: none
aria-hidden: "true"   inert: false            rect: 0,52 390x780
first link "AI Trends": tabIndex 0, rect 16,102 358x49
elementFromPoint at that link's centre -> SECTION.hero-bg  (panel is not painted)
```

Keyboard trace, 30 `Tab` presses from page load with the menu closed:

| Stops | Destination |
|---|---|
| 1 to 2 | logo, hamburger (visible) |
| **3 to 16** | **inside the closed panel** (`AI Trends`, `User Guide`, `Business AI Compliance`, `Token Calculator`, `Compare Models`, `Use Cases`, `Beginners Guide`, `Blog`, `Documentation`, 4 language links, `Get Started`) |
| 17 onward | back to visible page content |

A keyboard or screen reader user hits **14 consecutive focus stops on content they cannot see**, and focus is being placed inside a subtree explicitly marked `aria-hidden="true"` (WCAG 4.1.2, the `aria-hidden-focus` rule). The fix is `inert` or `visibility: hidden` on the closed panel.

For contrast, the **desktop** dropdown handles this correctly: closed state is `display: none`, all 5 items report a 0 x 0 rect and are removed from the tab order, and `aria-expanded` toggles `false` to `true` on click. Only the mobile panel is broken.

## H4. The cookie banner occupies a quarter of the mobile viewport and is the LCP element on 6 mobile routes

**Evidence:** every `*-mobile-fold.png` (before) vs every `*-mobile-fold-dismissed.png` (after). Desktop pair: `home-desktop-fold.png` vs `home-desktop-fold-dismissed.png`.

| Viewport | Banner rect | Share of viewport | Buttons |
|---|---|---|---|
| Desktop 1920x1080 | x680 y923 **560 x 133** | **3.6%** | `Reject non-essential` 168 x 37, `Accept all` 168 x 37 |
| Mobile 390x844 | x16 y600 **358 x 232** | **25.2%** | `Reject non-essential` 168 x 37, `Accept all` 143 x 37 |

On mobile it covers the band from y600 to y832 of an 844 px viewport, and it is the **measured LCP element** on 6 mobile routes:

`token-calculator`, `api-compare`, `claude-api`, `beginners-guide`, `user-guide`, `compliance` all report `LCP element = P.cookie-consent__text`.

Content it overlaps on mobile, measured by rect intersection:

| Route | Occluded interactive elements |
|---|---|
| `/en/token-calculator/` | the calculator `textarea`, the `Clear` button |
| `/en/api-compare/` | `Text Models` card, `Image Models` card |
| `/en/user-guide/` | `Read the Guide` (primary CTA), `Quick Start` |
| `/en/compliance/` | `View Enterprise Proposal` |
| `/en/blog/` | the featured article card |
| `/en/api-compare/` desktop | `Live API Model Pricing` card |
| `/en/blog/` desktop | 4 category filter tabs |

There is no close (X) affordance (`hasCloseX: false`), so the only way past it is to make a consent decision. Both buttons are 37 px tall, under the 44 px touch minimum.

## H5. Body and footer text below WCAG AA contrast, measured from painted pixels

The single most repeated failure, present on **all 26 captures**:

| Element | Foreground | Painted background | Ratio | Required |
|---|---|---|---|---|
| Footer tagline "The definitive English-language hub for..." | `rgb(102,102,102)` | `rgb(28,28,28)` | **2.97:1** | 4.5:1 |

Other measured failures (font size in parentheses; threshold 4.5:1 for normal text, 3:1 for 18.66px bold or 24px+):

| Route | Element | Ratio | Foreground on background |
|---|---|---|---|
| `/en/chatgpt-api/` | `View Full Comparison` sidebar CTA (13.2px) | **3.12** | `#fff` on `rgb(112,141,237)` |
| `/en/claude-api/` | `View Full Comparison` sidebar CTA (13.2px) | **3.01** | `#fff` on `rgb(96,156,189)` |
| `/en/gemini-api/` | `View Full Comparison` sidebar CTA (13.2px) | **3.29** | `#fff` on `rgb(118,133,240)` |
| `/en/beginners-guide/` | `View Model Overview` CTA (13.2px) | **3.12** | `#fff` on `rgb(112,141,237)` |
| `/en/user-guide/` | `Get Started Free` CTA (13.2px) | **3.15** | `#fff` on `rgb(112,140,238)` |
| `/en/compliance/` | `HIGH-SENSITIVITY INDUSTRIES` (12.8px bold) | **2.28** | `rgb(10,191,188)` on white |
| `/en/token-calculator/` | "Reference prices sourced from..." (12.48px) | **2.19** | `rgb(176,170,216)` on white |
| `/en/api-compare/` | model card descriptions (13.12px) | **2.56** | `rgb(153,153,153)` on `rgb(245,241,254)` |
| `/en/`, `/en/beginners-guide/`, `/en/api-compare/` | small print (12 to 12.8px) | **2.82 to 2.85** | `rgb(153,153,153)` on white |
| `/en/chatgpt-api/`, `/en/claude-api/`, `/en/gemini-api/` | hero subhead (14.8px) | **3.55 to 3.89** | `rgba(255,255,255,0.85)` on hero gradient |
| `/en/api-compare/`, `/en/blog/`, `/en/compliance/`, `/en/user-guide/`, `/en/ai-trends/` | hero subhead (16 to 16.8px) | **3.46 to 4.43** | `rgba(255,255,255,0.7)` on hero gradient |

Five distinct CTAs fail the 4.5:1 normal-text threshold. The nav `Get Started` primary CTA is fine at **5.04:1** (`#fff` on `rgb(99,87,241)`), as are the main hero CTAs (`Start the Guide` 5.16, `See the Solution` 5.18, `Read the Guide` 5.18).

## H6. Tailwind CSS is loaded from the CDN in production on all 26 captures

**Evidence:** console log captured on every route.

```
warn: cdn.tailwindcss.com should not be used in production. To use Tailwind CSS
in production, install it as a PostCSS plugin or use the Tailwind CLI
```

Measured cost: `cdn.tailwindcss.com/3.4.17` is **124 KB** and runs a full JIT compiler in the browser on every page load. Combined with `googletagmanager.com/gtag/js` at 166 KB, script weight is a flat **301 KB on every single route**, which is 72% of the total transferred bytes on the 11 image-free pages (301 of 419 to 424 KB).

For a statically pre-rendered Astro SSG site this is entirely avoidable. It also means a third-party CDN outage would change the site's appearance for every visitor.

---

# MEDIUM

## M1. The primary conversion action leaves the domain and the brand

`Get Started`, the only header CTA, points to `https://www.aitokenking.com.tw/home` with `target="_blank" rel="noopener noreferrer"`. Measured on all 13 routes at 135.2 x 36.4 px (desktop).

Off-domain links from `/en/` (5 distinct destinations):

| Destination | HTTP | Notes |
|---|---|---|
| `https://www.aitokenking.com.tw/home` | 200 | primary CTA; 3,211-byte client-rendered SPA shell |
| `https://www.aitokenking.com.tw/models` | 200 | used by `Compare APIs`, `Compare Prices`, `View Pricing Table` |
| `https://www.aitokenking.com.tw/docs` | 200 | `Documentation` in nav dropdown and footer |
| `https://twitter.com` | not fetched | see M4 |
| `https://linkedin.com` | not fetched | see M4 |

The destinations resolve (all 200), so nothing is broken. The issue is that a visitor who has been reading `aitoken.global` is handed off, in a new tab, to a **differently named domain** (`aitokenking.com.tw`) that renders client-side. Domain and brand discontinuity at the moment of conversion is a measurable trust cost on B2B funnels.

## M2. Touch targets under 44 x 44 px are pervasive on mobile

Visible interactive elements below 44 px in either dimension, at 390 x 844:

| Route | Under 44px / total visible |
|---|---|
| `/en/` | **34 / 67** |
| `/en/blog/` | **35 / 59** |
| `/en/blog/ai-token-basics.../` | 30 / 43 |
| `/en/beginners-guide/` | 28 / 45 |
| `/en/chatgpt-api/`, `/en/claude-api/`, `/en/gemini-api/` | 27 / 42 |
| `/en/use-cases/`, `/en/user-guide/`, `/en/compliance/` | 25 / 40 (35 for use-cases) |
| `/en/token-calculator/` | 24 / 41 |
| `/en/api-compare/`, `/en/ai-trends/` | 23 / 45, 23 / 37 |

Recurring offenders, with measured sizes:

| Element | Size | Occurrences |
|---|---|---|
| Every footer navigation link (`Beginner's Guide`, `Token Calculator`, `Use Cases`, `User Guide`, `API Comparison`, `ChatGPT API`, `Claude API`, `Gemini API`, `Blog`, `AI Trends`, `Enterprise Compliance`, `Documentation`) | **height 18 px** | 12 per page, all 13 pages |
| `Privacy Policy`, `Terms of Service` | height 19.2 px | 2 per page |
| Footer social icons | 36 x 36 | 2 per page |
| Breadcrumb `Home` | **37.3 x 19.2** | 11 pages |
| Breadcrumb `Blog` | 28.7 x 19.2 | blog post |
| Cookie banner buttons | 168 x 37, 143 x 37 | all pages |
| `Get Started` in mobile panel | 326 x **41.6** | all pages |
| Language links in mobile panel | 102.9 to 169.7 x **42** | all pages |
| Site logo link | 153.3 x **36** | all pages |
| Inline "See ChatGPT API highlights" style links on `/en/` | ~200 x **21** | 3 on home |

The hamburger toggle is correctly sized at exactly **44 x 44**.

## M3. Three "Read:" links on the beginners guide point at the page they are on, and render a duplicated arrow

**Evidence:** `beginners-guide-desktop-full.png`, `beginners-guide-desktop-fold.png` (two of the three are within the desktop fold at y838 and y1062)

Verified in the served HTML:

| Label as rendered | `href` | Size |
|---|---|---|
| `Read: What is an AI Token → →` | `/en/beginners-guide` | 195.5 x 20.4 |
| `Read: How AI Tokens Are Calculated → →` | `/en/beginners-guide` | 266.1 x 20.4 |
| `Read: How AI Token Pricing Works → →` | `/en/beginners-guide` | not in fold |

Two problems in one control: the destination is the current page (so the "read next" affordance does nothing), and the raw HTML contains a literal `→ →`, so a **duplicate arrow glyph is visibly rendered**. The arrow appears once in the CMS copy and once from the template.

## M4. Footer social links point at bare `twitter.com` and `linkedin.com` with no accessible name

**Evidence:** any `*-full.png` footer region

| Measured | Value |
|---|---|
| `href` | `https://twitter.com`, `https://linkedin.com` |
| Accessible name | **empty string** (no text content, no `aria-label`, no `title`) |
| Size | 36 x 36 each |
| `target` | `_blank` |

These are unconfigured placeholders pointing at the platform homepages rather than at company profiles. On a page whose job is to establish that a real company is behind the product, two social icons that lead to a generic login wall read as an unfinished site. They are also unlabelled for screen readers (WCAG 2.4.4 / 4.1.2).

## M5. The most sales-relevant pages are buried behind a dropdown

Measured header link set on desktop (`/en/`), visible links only:

| Visible in the header bar | `href` | Size |
|---|---|---|
| `AI Token King` (logo) | `/en/` | 153 x 36 |
| `Compare Models` | `/en/api-compare` | 140 x 33 |
| `Use Cases` | `/en/use-cases` | 94 x 33 |
| `Beginners Guide` | `/en/beginners-guide` | 135 x 33 |
| `Blog` | `/en/blog` | 55 x 33 |
| `Get Started` | `aitokenking.com.tw/home` | 135 x 36 |

Plus three buttons: `AI Resources`, `EN`, and the (desktop-hidden) hamburger.

Behind the `AI Resources` dropdown, `display: none` until clicked, all 5 items reporting a 0 x 0 rect while closed:

| Hidden behind one extra click | `href` | Size when open |
|---|---|---|
| `AI Trends` | `/en/ai-trends` | 212 x 41 |
| `AI Token King User Guide` | `/en/user-guide` | 212 x 62 |
| **`Business AI Compliance`** | `/en/compliance` | 212 x 41 |
| `Token Calculator` | `/en/token-calculator` | 212 x 41 |
| `Documentation` | `aitokenking.com.tw/docs` | 212 x 41 |

The enterprise compliance page, the token calculator, and the platform user guide, arguably the three highest-intent pages for a B2B buyer, all require **2 clicks** from the homepage on desktop and **2 taps** on mobile. `Business AI Compliance` in particular is the page a procurement-driven prospect needs, and it is not visible in the primary navigation.

## M6. Blog thumbnails declare themselves decorative while identical thumbnails elsewhere do not

Alt coverage across the 104 rendered images:

| Route (per device) | Rendered | Descriptive alt | `alt=""` |
|---|---|---|---|
| `/en/` | 9 | **9** | 0 |
| 10 content pages | 2 each | 2 each | 0 |
| `/en/blog/` | 13 | **3** | **10** |
| `/en/blog/ai-token-basics.../` | 10 | 7 | 3 |

**Overall: 78 of 104 (75.0%) carry descriptive alt text. 26 carry `alt=""`. Zero images are missing the `alt` attribute entirely.**

The inconsistency is the finding: the same Sanity article thumbnails carry full descriptive alt on `/en/` ("Understanding AI Token Pricing Models: A Beginner's Guide") but `alt=""` on `/en/blog/`. Empty alt is defensible when a card title sits adjacent, but it should be a deliberate, consistent choice, and it forfeits image-search surface on the page whose purpose is organic discovery.

## M7. The mobile homepage is 13,176 px tall, 15.6 screens of scrolling

**Evidence:** `home-mobile-full.png` (390 x 13176)

| Route | Desktop doc height | Mobile doc height | Mobile screens (at 844 px) |
|---|---|---|---|
| `/en/` | 6,810 | **13,176** | **15.6** |
| `/en/api-compare/` | 4,962 | 9,233 | 10.9 |
| `/en/blog/` | 3,830 | 8,636 | 10.2 |
| `/en/user-guide/` | 5,443 | 8,226 | 9.7 |
| `/en/ai-trends/` | 3,443 | 7,504 | 8.9 |
| `/en/blog/ai-token-basics.../` | 5,706 | 6,930 | 8.2 |
| `/en/compliance/` | 3,978 | 6,375 | 7.6 |
| `/en/beginners-guide/` | 3,765 | 6,359 | 7.5 |
| `/en/claude-api/`, `/en/use-cases/` | 3,584 / 2,324 | 5,690 / 5,667 | 6.7 |
| `/en/gemini-api/` | 3,272 | 5,431 | 6.4 |
| `/en/chatgpt-api/` | 3,155 | 5,203 | 6.2 |
| `/en/token-calculator/` | 2,377 | 5,097 | 6.0 |

The mobile homepage is 1.94x its desktop height. With only 2 CTAs in the mobile fold and 15.6 screens of content after them, the funnel depends entirely on a visitor scrolling further than most will.

---

# LOW

## L1. Homepage newsletter email input has no accessible name

`/en/`: `input[type=email]` with `hasLabelFor: false`, `wrappedInLabel: false`, `aria-label: null`, `aria-labelledby: null`. The only name source is `placeholder="Enter your email"`, which is not an accessible name and disappears on input (WCAG 3.3.2).

The equivalent field on `/en/blog/` **does** carry `aria-label="your@email.com"`, and the token calculator textarea correctly uses `label[for="textInput"]`, and the blog search and sort controls both carry `aria-label`. So this is a single inconsistent instance, not a pattern.

## L2. Heading order skips a level on `/en/use-cases/`

Heading sequence measured on `/en/use-cases/`: `1 3 3 3 3 3 3 3 3 3`. One `h1` to `h3` jump at "Document Summarization & Organization". No `h2` exists on the page.

All other 12 routes have clean sequences with exactly one `h1`. Total jumps across the site: **1**.

## L3. Homepage mobile `h1` contrast is 2.97:1 against a 3.0 threshold

`Master AI Tokens, Models & APIs`, 36 px weight 800 (qualifies as large text, 3:1 required). Measured `#fff` on painted background `rgb(68,157,217)` = **2.97:1**. It misses by 0.03. The same heading passes comfortably on desktop at 52 px on `rgb(91,95,197)` = **5.40:1**.

Cause is the animated hero gradient landing on a lighter blue stop at the mobile breakpoint. `hero-eyebrow` "YOUR AI KNOWLEDGE HUB" on the same mobile hero measures **2.85:1** at 12 px bold, which is a clearer failure.

## L4. Desktop dropdowns lack supporting ARIA

`header .nav-dropdown-btn` correctly toggles `aria-expanded` between `false` and `true`, but has `aria-controls: null`, `aria-haspopup: null`, and the menu container has `role: null`. Functionally usable, incomplete semantically.

## L5. The mobile pricing table scrolls horizontally with no visible affordance

`/en/` mobile: `TABLE.compare-table` measures 573.7 px wide (`right: 597.7`, overhanging the 390 px viewport by 207.7 px) inside a wrapper measuring `clientWidth 342 / scrollWidth 574` with `overflow: auto`.

The containment is correct (`document.documentElement.scrollWidth === window.innerWidth === 390`, so the **page** does not overflow), and horizontal scrolling inside the box works. But 232 px of the table, including the `OUTPUT (PER 1M TOKENS)` and `MODALITY` columns, is off-screen with no scroll hint, shadow, or fade to signal it.

## L6. Two Google Analytics beacons abort per route

Every one of the 26 captures logs exactly 2 `net::ERR_ABORTED` failures, always `fetch` requests to `google-analytics.com/g/collect`, one with `gcs=G100` (consent denied) and one with `gcs=G111` (consent granted). No other request fails on any route.

I cannot determine from the browser side whether these aborts also occur for real visitors or are an artefact of the automated consent click and page teardown. Recorded here as observed, cause **unverified**. Flagging it for the analytics lane rather than claiming a defect.

---

# What is genuinely good

Recorded with the same rigour as the defects.

| Area | Measured result |
|---|---|
| **JavaScript health** | **0** console errors and **0** uncaught page errors across all 26 captures. The only console output on any route is the single Tailwind CDN warning. |
| **Subresource integrity** | **0** HTTP 4xx or 5xx subresponses across all 26 captures. |
| **Broken assets** | **0**. All 104 rendered images have `complete: true` and non-zero `naturalWidth`. |
| **Placeholder content** | **0** `placehold.co` URLs, **0** matches for "lorem ipsum", "coming soon", "TBD", or "placeholder" in rendered body text on any route. Content is real. |
| **Mobile horizontal overflow** | **Zero on all 13 pages.** `document.documentElement.scrollWidth === window.innerWidth === 390` everywhere. This is genuinely uncommon and the responsive system deserves credit for it. |
| **Focus visibility** | 12 tab stops probed per capture, 312 total. **Zero** lacked a visible indicator. Two consistent treatments: UA default `auto 1px rgb(0,95,204)` and a custom `solid 2px rgb(97,85,241) offset 2px` brand ring. |
| **`h1` discipline** | Exactly one `h1` on all 13 routes. Present and **fully above the fold on all 26 captures**, at y179 to y241 desktop and y179 to y231 mobile. |
| **Heading structure** | 1 level-skip across 13 pages. No empty headings. |
| **Hero copy structure** | A three-part eyebrow / `h1` / subhead pattern is applied consistently across 11 of 13 routes, and every subhead passed the `elementFromPoint` hit test (nothing occludes it). |
| **Cookie consent design** | `role="dialog"`, `aria-live="polite"`, `aria-label="We value your privacy"`. `Reject non-essential` and `Accept all` are given **equal visual prominence** (168 x 37 vs 143 x 37) rather than the usual dark pattern. Choice persists to `localStorage` (`atk-cookie-consent: granted` / `denied`) and survives reload. Dismissal sets `pointer-events: none` so it never blocks interaction. |
| **Desktop dropdown a11y** | `aria-expanded` toggles correctly, and closed items report 0 x 0 and are out of the tab order. The correct pattern, implemented right (only the mobile panel got it wrong). |
| **Content page weight** | The 11 image-free routes are a lean **419 to 424 KB** each. Document HTML is 12 to 15 KB. |
| **Speed on content pages** | FCP 320 to 856 ms, LCP 320 to 856 ms, CLS 0.0019 to 0.0278 on all 11 non-blog routes. Well inside "good" thresholds. |
| **Layout integrity** | Across all 26 captures: **0** dead-whitespace gaps over 40 px between top-level sections, **0** empty sections over 60 px tall, **0** text elements overflowing the viewport. The two `overflow: hidden` clips I investigated on `/en/` turned out to be decorative absolutely-positioned gradient blobs, not clipped content, confirmed by walking the child rects. |
| **Scroll-reveal animations** | After a full scroll pass, the only elements remaining at `opacity: 0` are the dismissed cookie banner and the closed mobile nav panel. No content is stranded invisible. |
| **Alt attribute coverage** | **100%** of rendered images carry an `alt` attribute (0 missing), 75.0% descriptive. |
| **Form labelling (3 of 4)** | Token calculator textarea uses `label[for]`; blog search and blog sort select both carry `aria-label`. |

---

# Per-route performance table

Cold load, empty cache, per device. Bytes are `encodedDataLength` from the CDP network log (real transferred bytes, cross-origin included). Idle ms is wall clock from `goto` to `networkidle2`. DCL is `domContentLoadedEventEnd`. CLS is accumulated over the first 400 ms after network idle via `PerformanceObserver`.

| Route | Device | HTTP | Idle ms | DCL ms | FCP ms | LCP ms | CLS | Reqs | Total KB | Img KB | JS KB | Largest single resource |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/en/` | desktop | 200 | 1125 | 511 | 492 | 608 | 0.0278 | 26 | **5892** | 5473 | 301 | `f8b57cd0...png` 1016 KB |
| `/en/` | mobile | 200 | 2150 | 1610 | 532 | 600 | 0 | 26 | **5891** | 5472 | 301 | `f8b57cd0...png` 1015 KB |
| `/en/token-calculator/` | desktop | 200 | 939 | 379 | 856 | 856 | 0.0030 | 20 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/token-calculator/` | mobile | 200 | 2034 | 1492 | 364 | 432 | 0 | 20 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/api-compare/` | desktop | 200 | 1988 | 1444 | 472 | 672 | 0.0019 | 20 | 424 | 5 | 301 | `gtag/js` 166 KB |
| `/en/api-compare/` | mobile | 200 | 2141 | 1600 | 540 | 640 | 0 | 20 | 424 | 5 | 301 | `gtag/js` 166 KB |
| `/en/chatgpt-api/` | desktop | 200 | 1127 | 554 | 560 | 640 | 0.0181 | 20 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/chatgpt-api/` | mobile | 200 | 1008 | 463 | 440 | 476 | 0 | 20 | 420 | 5 | 301 | `gtag/js` 166 KB |
| `/en/claude-api/` | desktop | 200 | 2576 | 1845 | 688 | 756 | 0.0201 | 20 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/claude-api/` | mobile | 200 | 1994 | 1478 | 372 | 372 | 0 | 20 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/gemini-api/` | desktop | 200 | 1145 | 497 | 392 | 492 | 0.0063 | 20 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/gemini-api/` | mobile | 200 | 2308 | 1622 | 428 | 492 | 0 | 20 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/beginners-guide/` | desktop | 200 | 2066 | 1528 | 464 | 500 | 0.0224 | 19 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/beginners-guide/` | mobile | 200 | 2265 | 1732 | 584 | 584 | 0 | 19 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/use-cases/` | desktop | 200 | 1175 | 564 | 560 | 560 | 0.0053 | 19 | 419 | 5 | 301 | `gtag/js` 166 KB |
| `/en/use-cases/` | mobile | 200 | 2476 | 1951 | 444 | 476 | 0 | 19 | 419 | 5 | 301 | `gtag/js` 166 KB |
| `/en/user-guide/` | desktop | 200 | 955 | 392 | 372 | 456 | 0.0106 | 19 | 422 | 5 | 301 | `gtag/js` 166 KB |
| `/en/user-guide/` | mobile | 200 | 1972 | 1444 | 388 | 388 | 0 | 19 | 422 | 5 | 301 | `gtag/js` 166 KB |
| `/en/compliance/` | desktop | 200 | 1007 | 468 | 340 | 472 | 0.0117 | 19 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/compliance/` | mobile | 200 | 2145 | 1619 | 476 | 476 | 0 | 19 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/ai-trends/` | desktop | 200 | 905 | 373 | 320 | 320 | 0.0126 | 19 | 421 | 5 | 301 | `gtag/js` 166 KB |
| `/en/ai-trends/` | mobile | 200 | 2057 | 1518 | 556 | 556 | 0 | 19 | 421 | 6 | 301 | `gtag/js` 166 KB |
| `/en/blog/` | desktop | 200 | 3364 | 1556 | 396 | 464 | **0.7112** | 40 | **18636** | 18184 | 301 | `9bcd3f2f...png` **3301 KB** |
| `/en/blog/` | mobile | 200 | 2336 | 1724 | 616 | 884 | 0.0174 | 32 | **12903** | 12451 | 301 | `9bcd3f2f...png` 3306 KB |
| `/en/blog/ai-token-basics-for-beginners/` | desktop | 200 | 2159 | 668 | 1408 | 1476 | 0.0144 | 28 | **6500** | 6083 | 301 | `fe00ac81...png` 960 KB |
| `/en/blog/ai-token-basics-for-beginners/` | mobile | 200 | 2368 | 1642 | 508 | 824 | 0.0170 | 28 | **6491** | 6075 | 301 | `fe00ac81...png` 958 KB |

**Constant per-route overhead (identical on all 26 captures):** Script 301 KB (`gtag/js` 166 KB + `cdn.tailwindcss.com/3.4.17` 124 KB + Cloudflare Insights), Font 66 KB (Google Fonts: Kanit + Plus Jakarta Sans), Other 30 KB (`favicon-corgi.png` 26 KB + `favicon.ico` 3.7 KB), Stylesheet 5 to 7 KB.

**Third-party hosts contacted on every route:** `fonts.googleapis.com`, `fonts.gstatic.com`, `www.googletagmanager.com`, `www.google-analytics.com`, `cdn.tailwindcss.com`, `static.cloudflareinsights.com`, `cloudflareinsights.com`. Plus `cdn.sanity.io` on `/en/`, `/en/blog/`, and blog posts.

**LCP element per route (a diagnostic in itself):**

| LCP element | Routes |
|---|---|
| `H1.fade-up` | `/en/` desktop and mobile |
| A body `P` | 13 captures |
| **`P.cookie-consent__text`** | **`token-calculator` desktop, and `api-compare` / `claude-api` / `beginners-guide` / `user-guide` / `compliance` mobile (6 routes)** |
| `IMG` | `/en/blog/` and the blog post, both devices |

---

# CTA inventory

## Primary conversion action per route

| Route | Single primary conversion action | Destination | Desktop size | Above fold (desktop / mobile) | Verdict |
|---|---|---|---|---|---|
| `/en/` | `Start the Guide` | `/en/beginners-guide` | 170.8 x 41.6 | yes / yes | Educational, not commercial. The only commercial CTA is `Get Started` in the header. |
| `/en/token-calculator/` | none in the fold | `Compare Models →` at docY 1830 | 185.2 x 47.6 | no / no | **Absent above the fold.** |
| `/en/api-compare/` | `Compare Prices` | `aitokenking.com.tw/models` | 200 x 40.4 (docY 1375) | no / no | Off-domain, below the fold. |
| `/en/chatgpt-api/` | `View Full Comparison` | `/en/api-compare` | 232 x 37.8 | yes / no | Internal navigation, not conversion. |
| `/en/claude-api/` | `View Full Comparison` | `/en/api-compare` | 232 x 37.8 | yes / no | Internal navigation. |
| `/en/gemini-api/` | `View Full Comparison` | `/en/api-compare` | 232 x 37.8 | yes / no | Internal navigation. |
| `/en/beginners-guide/` | `View Model Overview` | `/en/api-compare` | 232 x 37.8 | yes / no | Internal navigation. |
| `/en/use-cases/` | `Compare Models` | `/en/api-compare` | 160.2 x 43 (docY 1785) | no / no | **Absent above the fold.** |
| `/en/user-guide/` | `Get Started Free` | `aitokenking.com.tw/home` | 232 x 37.8 (docY 1124) | no / no | The clearest commercial CTA on the site, buried at docY 1124. |
| `/en/compliance/` | `Contact Enterprise Sales` | **`/en/compliance` (self)** | 232 x 37.8 | yes / no | **BROKEN (C2).** |
| `/en/ai-trends/` | **none** | n/a | n/a | n/a | **No page-level CTA of any kind.** Only the header `Get Started`. |
| `/en/blog/` | **none** | n/a | n/a | n/a | **No page-level CTA.** Only the non-functional newsletter form (C1). |
| `/en/blog/ai-token-basics.../` | `Compare Models` | `/en/api-compare` | 232 x 37.8 (docY 873) | yes / no | Internal navigation. |

**Three routes (`/en/ai-trends/`, `/en/blog/`, and effectively `/en/compliance/`) have no working page-level conversion action.**

## Site-wide recurring CTAs

| Label | Destination | Desktop | Mobile | Contrast | Present on |
|---|---|---|---|---|---|
| `Get Started` (header) | `aitokenking.com.tw/home` `_blank` | 135.2 x 36.4 | 326 x 41.6 (in closed panel) | **5.04** pass | all 13 |
| `Documentation` | `aitokenking.com.tw/docs` `_blank` | 212 x 41 (in dropdown) | 358 x 52 (in closed panel) | not measured | all 13 |
| `Privacy Policy` | **`#`** | 82.7 x 19.2 | 82.7 x 19.2 | see H5 | all 13 |
| `Terms of Service` | **`#`** | 99.1 x 19.2 | 99.1 x 19.2 | see H5 | all 13 |
| `Accept all` | consent action | 168 x 37 | 143 x 37 | not measured | all 13 |
| `Reject non-essential` | consent action | 168 x 37 | 168 x 37 | not measured | all 13 |
| `Subscribe Free` | **no-op (C1)** | 152.8 x 45.6 | n/a | not measured | `/en/`, `/en/blog/` |

## CTAs failing the 44 x 44 touch minimum on mobile

`Get Started` 41.6 h, `See the Solution` 41.6 h, `Start the Guide` 41.6 h, `Learn Token Basics →` 41.6 h, `Compare Models` (use-cases) 41 h, `View Full Comparison` 37.8 h, `View Model Overview` 37.8 h, `Get Started Free` 37.8 h, `Contact Enterprise Sales` 37.8 h, `Read Token Guide →` 37 h, `Compare Models →` 37 h, `Start the Tutorial →` 37 h, `Explore All Articles` 37 h, both cookie banner buttons 37 h.

**14 distinct CTA styles are all between 37 and 43.6 px tall.** None reaches 44. A single shared `min-height: 44px` on the button token would resolve all of them.

## Navigation and findability

**Header (desktop, 6 visible links + 3 buttons):** logo, `Compare Models`, `Use Cases`, `Beginners Guide`, `Blog`, `Get Started`, plus `AI Resources` and `EN` dropdown buttons.

**`AI Resources` dropdown (2nd click):** `AI Trends`, `AI Token King User Guide`, `Business AI Compliance`, `Token Calculator`, `Documentation`.

**Mobile nav panel (2 taps):** the 9 page links above, 4 language links, `Get Started`. Panel measures 390 x 780 when open, covering **92.4%** of the 844 px viewport.

**Footer (15 links, identical on all 13 pages):** 2 unlabelled social icons (M4), 12 page links at 18 px height, `Privacy Policy` and `Terms of Service` at `#`.

**Clicks from the homepage to a conversion point:**

| Target | Desktop clicks | Mobile taps | Working? |
|---|---|---|---|
| Off-domain signup (`Get Started`) | **1** | **2** (hamburger first) | yes, 200 |
| Enterprise compliance page | **2** (dropdown first) | **2** | yes |
| Contact a human from the compliance page | **infinite** | **infinite** | **no, self-link (C2)** |
| Leave an email address | **1** (`Subscribe Free`) | 1 | **no, silently discarded (C1)** |
| Read the privacy policy | 1 | 1 | **no, `href="#"` (C3)** |

---

# Screenshot manifest

**Location:** `/Users/antonioduran/Desktop/aitokenglobal/audits/2026-08-06/screenshots/`
**Count:** 80 PNG files, 84 MB total, device pixel ratio 1, scrollbars hidden.

**Naming:** `<page-slug>-<desktop|mobile>-<fold|full>.png`

**States captured per route and device:**

| Suffix | State | Purpose |
|---|---|---|
| `-fold.png` | Cold first visit, **cookie banner visible**, no scroll | The true first impression. Use this for first-visit findings and for the C3 / H4 banner evidence. |
| `-fold-dismissed.png` | Same viewport after clicking `Accept all` | The interruption sequence. Diff against `-fold.png` to show exactly what the banner covered. |
| `-full.png` | Whole document after a full scroll pass (all lazy images loaded, all reveal animations triggered), banner dismissed | Layout, CTA placement, footer, page length. This is the annotation workhorse. |

| Page slug | Route | Desktop fold | Desktop full (h px) | Mobile fold | Mobile full (h px) |
|---|---|---|---|---|---|
| `home` | `/en/` | 1920x1080 | **6810** | 390x844 | **13176** |
| `token-calculator` | `/en/token-calculator/` | 1920x1080 | 2377 | 390x844 | 5097 |
| `api-compare` | `/en/api-compare/` | 1920x1080 | 4962 | 390x844 | 9233 |
| `chatgpt-api` | `/en/chatgpt-api/` | 1920x1080 | 3155 | 390x844 | 5203 |
| `claude-api` | `/en/claude-api/` | 1920x1080 | 3584 | 390x844 | 5690 |
| `gemini-api` | `/en/gemini-api/` | 1920x1080 | 3272 | 390x844 | 5431 |
| `beginners-guide` | `/en/beginners-guide/` | 1920x1080 | 3765 | 390x844 | 6359 |
| `use-cases` | `/en/use-cases/` | 1920x1080 | 2324 | 390x844 | 5667 |
| `user-guide` | `/en/user-guide/` | 1920x1080 | 5443 | 390x844 | 8226 |
| `compliance` | `/en/compliance/` | 1920x1080 | 3978 | 390x844 | 6375 |
| `ai-trends` | `/en/ai-trends/` | 1920x1080 | 3443 | 390x844 | 7504 |
| `blog-index` | `/en/blog/` | 1920x1080 | 3830 | 390x844 | 8636 |
| `blog-post` | `/en/blog/ai-token-basics-for-beginners/` | 1920x1080 | 5706 | 390x844 | 6930 |

**Three extra state captures (not part of the 78-file grid):**

| File | Shows |
|---|---|
| `home-mobile-navopen.png` | Mobile nav panel **open** (390 x 780, covering 92.4% of the viewport). Pair with `home-mobile-fold.png` for the H3 and H1 findings. |
| `home-desktop-dropdown-open.png` | `AI Resources` dropdown **open** (230 x 244 at x595 y57), exposing the 5 hidden destinations. Evidence for M5. |
| (`home-mobile-fold.png`) | Doubles as the closed-panel reference for H3. |

**Suggested picks for the annotation phase:**

| Finding | Best screenshot |
|---|---|
| C1 newsletter decoy | `home-desktop-full.png` (form near document bottom) |
| C2 self-linking sales CTAs | `compliance-desktop-fold.png` (sidebar `Contact Enterprise Sales`) and `compliance-desktop-full.png` |
| C3 dead legal links | any `-full.png` footer, e.g. `home-desktop-full.png`; plus `home-desktop-fold.png` for the in-banner link |
| C4 blog weight and CLS | `blog-index-desktop-full.png`, `blog-index-mobile-full.png` |
| H1 empty mobile folds | `chatgpt-api-mobile-fold.png`, `use-cases-mobile-fold.png`, `ai-trends-mobile-fold.png` |
| H2 oversized images | `home-desktop-full.png` (the 80 x 80 thumbnails) |
| H3 hidden tabbable nav | `home-mobile-fold.png` vs `home-mobile-navopen.png` |
| H4 cookie occlusion | any `-mobile-fold.png` vs its `-mobile-fold-dismissed.png`; strongest on `token-calculator-mobile-fold.png`, `user-guide-mobile-fold.png`, `blog-index-mobile-fold.png` |
| H5 contrast | `home-desktop-full.png` footer, `compliance-desktop-full.png` teal small print |
| M3 self-links and duplicate arrow | `beginners-guide-desktop-fold.png` (visible at y838 and y1062) |
| M4 placeholder social links | any `-full.png` footer |
| M5 buried navigation | `home-desktop-dropdown-open.png` |
| M7 mobile page length | `home-mobile-full.png` (390 x 13176) |

---

# No data / could not verify

Recorded explicitly rather than guessed.

| # | Item | Why not verified |
|---|---|---|
| 1 | **Whether the newsletter posts to any backend at all** | Verified only that the browser fires zero requests and `onsubmit="return false;"` blocks the default. A server-side or third-party integration invisible to the client cannot be ruled out from the browser, though the missing `name` attribute makes one implausible. **No data** on backend intent. |
| 2 | **Whether the two aborted GA `collect` beacons affect real users** | Observed identically on all 26 captures (L6). Cannot distinguish a genuine defect from an artefact of automated consent clicking plus page teardown. Cause **unverified**. |
| 3 | **Whether `aitokenking.com.tw` is a functional conversion destination** | Confirmed HTTP 200 with a 3,211-byte client-rendered shell for `/home`, `/models`, `/docs`. Did not evaluate the SPA's rendered content, signup flow, or whether a lead submitted there reaches this business. Out of lane. |
| 4 | **Contrast of the two cookie banner buttons and the `Documentation` nav item** | Not in the sampled target set for the pixel-based contrast pass. **No data.** |
| 5 | **Real-world load performance** | All timings are from a local headless Chrome on an unthrottled connection with an empty cache. No CPU or network throttling, no field data, no repeat-visit or warm-cache measurements. Treat the numbers as **relative comparisons between routes**, not as user-experienced timings. |
| 6 | **CLS beyond the first 400 ms after network idle** | The `PerformanceObserver` window closes then. Late shifts from lazy images further down the page are **not counted**, so 0.7112 on `/en/blog/` is a floor, not a ceiling. |
| 7 | **Tab order past the 12th stop** | The focus probe stops at 12 per capture (312 total). The extended 30-stop trace was run on `/en/` mobile only. Focus behaviour deep in the footer on other routes is **not measured**. |
| 8 | **Screen reader announcement quality** | Only programmatic ARIA state was checked (`aria-expanded`, `aria-hidden`, `role`, accessible names). No AT was driven. Reading order and announcement text are **unverified**. |
| 9 | **Non-EN locales (`/es/`, `/id/`, `/vi/`)** | Out of scope. Language switcher targets confirmed present (`/es/`, `/id/`, `/vi/`) but **not visited**. Findings here may or may not replicate. |
| 10 | **Hover and active states** | Only `:focus-visible` was probed. Hover and active styling on the 14 CTA variants is **not measured**. |
| 11 | **Reject-path analytics behaviour** | Confirmed `Reject non-essential` writes `atk-cookie-consent: denied` and persists across reload. Did **not** verify whether GA actually stops collecting after rejection. Belongs to the analytics or compliance lane. |
| 12 | **Whether `alt=""` on blog thumbnails is intentional** | Measured the inconsistency against `/en/` (M6). Editorial intent **unknown**. |
| 13 | **Print, reduced-motion, forced-colors, and dark-mode rendering** | Not captured. `prefers-reduced-motion` is referenced in the repo CSS but was **not exercised** in this pass. |
| 14 | **Viewports between 390 and 1920 px** | Only the two specified viewports were captured. The 1024, 900, and 640 px breakpoints named in the project's CSS are **untested here**. |

---

## Method note on one correction

An earlier pass computed contrast by walking ancestor `background-color` values. That method cannot resolve CSS gradients and produced false failures on every hero (for example it reported the `/en/` desktop `h1` at 1.97:1). It also used viewport-relative coordinates for `page.screenshot({clip})`, which are wrong once the page has scrolled.

Both were caught and corrected before any number in this document was written. The clip coordinate space was verified empirically (`uilane/clipcheck.mjs`): document coordinates plus `captureBeyondViewport: true` reproduce the unscrolled reference sample to within 3 RGB units, while viewport coordinates after a 116 px scroll were off by 53 units. **Every contrast figure above comes from the corrected pixel-sampling method.**
