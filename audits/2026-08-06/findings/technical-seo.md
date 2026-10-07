# Technical SEO Findings: aitoken.global

Audit date: 2026-08-06
Lane: Technical SEO
Scope: full depth on EN; hreflang / canonical / indexability only for es, id, vi
Method: live HTTP probes against production plus source reading at `/Users/antonioduran/Desktop/aitokenglobal`

Context that shapes severity: this site is a lead-generation resource, not a storefront. Findings are weighted by how much they cost in organic discovery, snippet quality, and first-impression credibility for a prospective lead.

---

## Summary table

| # | Severity | Finding | Blast radius |
|---|---|---|---|
| 1 | Critical | hreflang cluster is broken on every blog post: 1,817 of 3,035 annotations point at 404s | 607 blog posts, all 4 locales |
| 2 | Critical | Zero JSON-LD structured data anywhere on the site | 656 URLs |
| 3 | High | Every canonical, og:url, hreflang href, and sitemap `<loc>` uses the apex host, which 302s | 656 URLs (fixed by PR #24) |
| 4 | High | Blog index ships 146 unique untransformed Sanity PNGs, 620 KB to 1.06 MB each, no pagination | 4 blog index pages |
| 5 | High | Apex to www redirect is **302**, not 301 | every apex request |
| 6 | Medium | No security headers at all on any response | all responses |
| 7 | Medium | Redirect chains up to 3 hops on the most common entry form | typed / linked traffic |
| 8 | Medium | `max-age=0` on hashed immutable assets and images | all static assets |
| 9 | Medium | Sitemap has zero `<lastmod>` and zero `xhtml:link` alternates | 656 URLs |
| 10 | Medium | Blog posts emit `og:type=website`, no `article:published_time`, no `og:site_name` | 607 blog posts |
| 11 | Low | Root `/` is a meta-refresh shell; `og:url` there points to `/` not `/en/` | 1 URL |
| 12 | Low | Tailwind CDN runtime compiler loaded on every page | 656 URLs |

---

## 1. CRITICAL: hreflang points at 404s on essentially every blog post

### What we observed

`BaseLayout.astro` builds hreflang by string-swapping the locale segment of the current path:

`/Users/antonioduran/Desktop/aitokenglobal/src/layouts/BaseLayout.astro:39-42`

```
const hreflangs = SUPPORTED_LANGS.map(l => ({
  lang: l,
  url: new URL(Astro.url.pathname.replace(`/${lang}/`, `/${l}/`), siteOrigin).href,
}));
```

That assumes the slug after the locale is identical in every language. It is not. Blog slugs are translated in Sanity. Live proof on an EN post:

```
$ curl -sS https://www.aitoken.global/en/blog/ai-adoption-trends-2026/ | grep alternate
<link rel="alternate" hreflang="en" href="https://aitoken.global/en/blog/ai-adoption-trends-2026/">
<link rel="alternate" hreflang="es" href="https://aitoken.global/es/blog/ai-adoption-trends-2026/">
<link rel="alternate" hreflang="id" href="https://aitoken.global/id/blog/ai-adoption-trends-2026/">
<link rel="alternate" hreflang="vi" href="https://aitoken.global/vi/blog/ai-adoption-trends-2026/">
<link rel="alternate" hreflang="x-default" href="https://aitoken.global/en/blog/ai-adoption-trends-2026/">

$ curl -o /dev/null -w '%{http_code}' https://www.aitoken.global/es/blog/ai-adoption-trends-2026/
404
$ curl -o /dev/null -w '%{http_code}' https://www.aitoken.global/id/blog/ai-adoption-trends-2026/
404
```

It fails in the reverse direction too, and it takes x-default with it:

```
$ curl -sS https://www.aitoken.global/es/blog/adopcion-apis-inteligencia-artificial-empresas/ | grep alternate
<link rel="alternate" hreflang="en" href="https://aitoken.global/en/blog/adopcion-apis-inteligencia-artificial-empresas/">
<link rel="alternate" hreflang="id" href="https://aitoken.global/id/blog/adopcion-apis-inteligencia-artificial-empresas/">
<link rel="alternate" hreflang="vi" href="https://aitoken.global/vi/blog/adopcion-apis-inteligencia-artificial-empresas/">
<link rel="alternate" hreflang="x-default" href="https://aitoken.global/en/blog/adopcion-apis-inteligencia-artificial-empresas/">

/en/blog/adopcion-apis-inteligencia-artificial-empresas/   404
/id/blog/adopcion-apis-inteligencia-artificial-empresas/   404
/vi/blog/adopcion-apis-inteligencia-artificial-empresas/   404
```

Quantified against the live sitemap (656 URLs, 607 of them blog posts):

```
blog posts per locale:  en=162  es=156  id=155  vi=134
EN posts whose hreflang="es" target exists:   4 / 162   (158 broken, 97.5%)
EN posts whose hreflang="id" target exists:   8 / 162   (154 broken, 95.1%)
EN posts whose hreflang="vi" target exists: 127 / 162   ( 35 broken, 21.6%)
es posts whose hreflang="en" target is missing: 152 / 156
id posts whose hreflang="en" target is missing: 147 / 155
vi posts whose hreflang="en" target is missing:   7 / 134

Total hreflang annotations emitted across all blog posts (4 langs + x-default): 3,035
Annotations resolving to a 404:                                                1,817  (59.9%)
x-default 404 rate: es 152/156, id 147/155, vi 7/134, en 0/162
```

Only the 11 template pages per locale have a genuinely valid, reciprocal, self-referencing cluster. Verified for all four locales, for example:

```
$ curl -sS https://www.aitoken.global/vi/ | grep -E 'canonical|alternate'
<link rel="canonical" href="https://aitoken.global/vi/">
<link rel="alternate" hreflang="en" href="https://aitoken.global/en/">
... es, id, vi ...
<link rel="alternate" hreflang="x-default" href="https://aitoken.global/en/">
```

VI mostly works by accident: 127 of its 162 EN counterparts kept the English slug, so the naive path swap happens to resolve.

### Why it hurts lead acquisition

The blog is 607 of 656 URLs, so it is 93% of the crawlable surface and the entire top-of-funnel. Google discards hreflang annotations that point to non-200 URLs, so the ES and ID sites currently get **no** language-targeting signal at all. Those two locales are competing against the EN pages as if they were unrelated duplicates rather than declared translations. That means: wrong-language results shown to Spanish and Indonesian searchers, no consolidation of ranking signals between translations, and Search Console filling with "no return tag" and "hreflang points to a 404" errors that suppress crawl priority across the whole property. This is the single largest constraint on organic lead volume from the three non-English markets.

### The fix

`src/layouts/BaseLayout.astro:39-42` must not guess the alternate path. It needs to receive a real map of translation URLs.

1. Add a translation link field to the Sanity `post` schema (a reference to sibling-language documents, or a shared `translationGroupId`).
2. In `src/pages/[lang]/blog/[slug].astro`, query the sibling slugs and pass them to `BaseLayout` as a new `alternates` prop.
3. In `BaseLayout.astro`, emit `<link rel="alternate">` **only** for locales present in that prop. Keep the current path-swap behaviour only as the fallback for the 11 template pages, whose paths genuinely are identical across locales.
4. Set `x-default` to the EN member of the group when one exists, and omit the tag entirely when it does not, rather than pointing it at a 404.

Until the schema work lands, an immediate partial mitigation is to suppress hreflang output on `/[lang]/blog/[slug]` pages entirely. A missing annotation is strictly better than 1,817 annotations pointing at 404s.

Note: PR #24 does **not** address this. It only changes the host in these URLs from apex to www, which converts 1,817 404s into 1,817 404s on a different hostname.

---

## 2. CRITICAL: no structured data anywhere on the site

### What we observed

```
$ grep -rn 'ld+json\|application/ld\|schema.org' src/
(no matches)
```

Confirmed against live HTML on every page type:

```
/en/                                  JSON-LD blocks: 0   (101,367 bytes)
/en/token-calculator/                 JSON-LD blocks: 0   ( 51,672 bytes)
/en/api-compare/                      JSON-LD blocks: 0   ( 69,722 bytes)
/en/blog/                             JSON-LD blocks: 0   (644,184 bytes)
/en/blog/ai-adoption-trends-2026/     JSON-LD blocks: 0   ( 51,728 bytes)
```

The site already contains the exact content these schemas describe, unmarked:

```
page                        faq-answer blocks   h1   h2   h3
/en/                                8            1    8    4
/en/token-calculator/               9            1    2    0
/en/api-compare/                   14            1    4    0
/en/blog/ai-adoption-trends-2026/   1            1    5    4
```

`go-live-guide.md:26` lists JSON-LD as Phase 8 post-deploy polish. It was never done.

### Why it hurts lead acquisition

Ranked by business impact for a lead resource:

- **Organization** (missing, highest priority). Without it there is no entity for "AI Token King" in Google's Knowledge Graph, no logo in results, and no `sameAs` link to the commercial site `aitokenking.com.tw` that the nav CTA points at. A prospective enterprise lead searching the brand name sees an unverified blue link. This is the cheapest credibility win available.
- **FAQPage** (missing, second priority). There are 8 to 14 FAQ blocks already rendered on `/en/`, `/en/token-calculator/`, and `/en/api-compare/`. These are the money pages. FAQ rich results measurably expand SERP real estate and pre-answer the objections a lead has before clicking.
- **Article / BlogPosting** (missing, third priority). 607 blog posts with a title, an author-less byline, a cover image, and a publish date, none of it machine-readable. No Top Stories eligibility, no article date in the snippet, weaker E-E-A-T signalling on compliance and pricing topics where trust drives conversion.
- **BreadcrumbList** (missing). `/en/blog/<slug>/` is three levels deep. Breadcrumbs replace the raw URL in the SERP with a readable trail, which lifts CTR on long slugs.
- **WebSite + SearchAction** (missing). Low value here because there is no site search endpoint to point it at. Deprioritise.
- **Product / Offer** (not applicable). The site sells nothing directly and quotes third-party vendor prices. Do not mark those up as Offers; that is a structured-data policy violation. The token pricing tables could legitimately carry a `Dataset` or plain `Table` treatment, but that is a low-value experiment, not a priority.

### The fix

Add a `<script type="application/ld+json">` block in the head of `src/layouts/BaseLayout.astro`, immediately after the Twitter Card block at line 111.

1. **Organization + WebSite**, emitted on every page as an `@graph`. Fields: `name: "AI Token King"`, `url` (www origin), `logo` pointing at `/AI_Token_logoPNG.avif` or a PNG equivalent, `sameAs: ["https://www.aitokenking.com.tw/home"]`.
2. **FAQPage**, driven by the same Sanity `faq` array the accordions already render. Add an optional `faq` prop to `BaseLayout` and pass it from `src/pages/[lang]/index.astro`, `token-calculator.astro`, and `api-compare.astro`. Only emit when the array is non-empty, and only include questions actually visible in the HTML.
3. **BlogPosting + BreadcrumbList**, emitted from `src/pages/[lang]/blog/[slug].astro`, which already has `post.title`, `post.coverImage`, and `postUrl` in scope at line 146.

Validate with the Rich Results Test after deploy. Expect Organization and FAQPage to be eligible within days.

---

## 3. HIGH: apex host on every canonical, og:url, hreflang href, and sitemap loc

### What we observed

Root cause is one line:

`/Users/antonioduran/Desktop/aitokenglobal/astro.config.mjs:6`

```
site: 'https://aitoken.global',
```

Everything downstream derives from `Astro.site`:

- `src/layouts/BaseLayout.astro:30-31`: `siteOrigin` then `canonicalURL`, used for canonical, og:url and all hreflang hrefs
- `src/layouts/BaseLayout.astro:34`: `ogImageUrl` default
- `src/pages/[lang]/blog/[slug].astro:145-146`: `postUrl`, used in the Twitter and LinkedIn share links
- `@astrojs/sitemap`: every `<loc>`
- `public/robots.txt:4`: the `Sitemap:` line, hardcoded

Measured blast radius:

```
$ curl -sS https://www.aitoken.global/sitemap-0.xml | grep -c '<loc>'
656
$ grep -c '<loc>https://aitoken.global' sitemap-0.xml
656
$ grep -c '<loc>https://www.aitoken.global' sitemap-0.xml
0

$ curl -sS https://www.aitoken.global/robots.txt
User-agent: *
Allow: /

Sitemap: https://aitoken.global/sitemap-index.xml
```

Per-page absolute-URL signals, all apex, all 302:

```
$ curl -sS https://www.aitoken.global/en/ | grep -E 'canonical|og:url|og:image'
<link rel="canonical" href="https://aitoken.global/en/">
<meta property="og:url" content="https://aitoken.global/en/">
<meta property="og:image" content="https://aitoken.global/og-image.png">
```

Internal navigation links are **not** affected. They are root-relative and therefore host-agnostic:

```
page                            ABS apex   relative-root   external   fragment
/en/                                6            65            12         4
/en/token-calculator/               6            44            10         3
/en/blog/ai-adoption-trends-2026/   6            49            12         9
```

The 6 absolute apex hrefs per page are exactly the canonical plus the five hreflang alternates. `src/components/Nav.astro` uses template-literal relative paths (`href={`/${lang}/`}`) throughout, so crawling stays on whatever host the crawler entered on.

Which host Google is likely indexing: **www**, and the apex signals are being overridden rather than obeyed. Google will not index a URL whose canonical 302s to a different host; it follows the redirect and treats the destination as the canonical candidate. Search Console is configured as a Domain property, so both hosts roll up into one report and the split is invisible there:

`/Users/antonioduran/Desktop/aitokenglobal/.github/workflows/refresh-seo-data.yml:47`

```
GSC_SITE_URL: 'sc-domain:aitoken.global'
```

That is fortunate for reporting but it also means nobody has been alerted to the mismatch.

### Why it hurts lead acquisition

Every crawl of every one of the 656 URLs burns an extra round trip before any HTML is returned, on a site whose crawl budget is already stretched across 607 blog posts. Measured cost:

```
https://aitoken.global/en/       redirects=1  ttfb=0.255s  total=0.265s
https://www.aitoken.global/en/   redirects=0  ttfb=0.038s  total=0.047s
```

That is a 217 ms penalty on the entry hop, roughly 5.6x. Beyond crawl waste, the self-contradiction (a canonical that does not resolve to itself) is a weak, ambiguous signal that slows consolidation and delays new blog posts entering the index. For a lead-gen resource whose entire funnel is organic discovery of long-tail pricing questions, slower indexation is directly fewer leads.

### The fix

**Already fixed by open PR #24, branch `antonioduran/canonical-www-seo-fix`, commit `04a55a1 fix(seo): standardize canonical/sitemap/og host to www.aitoken.global`.**

Verified diff contents:

| File | Change |
|---|---|
| `astro.config.mjs` | `site: 'https://aitoken.global'` → `'https://www.aitoken.global'` |
| `public/robots.txt` | Sitemap line → www |
| `src/layouts/BaseLayout.astro:30` | fallback origin `https://aitokenglobal.com` → `https://www.aitoken.global` |
| `src/pages/[lang]/blog/[slug].astro:145` | same fallback correction |
| `src/pages/index.astro` | hardcoded apex canonical / og:url / og:image / twitter:image replaced with `${siteOrigin}` template literals |

Note the pre-existing fallback was `https://aitokenglobal.com`, a domain that is not this site at all. It never fired because `Astro.site` is always set, but the correction is right.

**Merging PR #24 resolves finding 3 in full.** It does not resolve findings 1, 2, 4, 5, 6, 8, 9, 10 or 12. PR #24 also bundles an unrelated dynamic-copyright-year change across `Footer.astro` and all four i18n files, which by the repo's own one-logical-change-per-commit rule should have been a separate commit; the two commits are already separate (`04a55a1` and `4af0b6b`) so this is only a PR-hygiene note, not a blocker.

Recommend merging PR #24 now, then submitting the www sitemap in Search Console and leaving the apex sitemap in place for a few weeks so Google re-crawls the old set and picks up the new canonicals.

---

## 4. HIGH: blog index ships 146 full-resolution PNGs with no pagination

### What we observed

```
$ curl -sS https://www.aitoken.global/en/blog/ | wc -c
644540    (raw)   48,687 brotli
```

Content analysis of the served HTML:

```
post links on the page:        162  (every published EN post, no pagination)
<img> tags:                    296
loading="lazy":                293
width/height attributes:         0
cdn.sanity.io image srcs:      294  (146 unique)
Sanity images with any transform query param:  0
rel="next" / rel="prev":       none
```

Sampled the first five unique images:

```
622,482 bytes   image/png
701,130 bytes   image/png
732,617 bytes   image/png
912,408 bytes   image/png
619,948 bytes   image/png
```

And the one used as a blog post og:image:

```
$ curl -o /dev/null -w '%{size_download} %{content_type}' \
  https://cdn.sanity.io/images/mq3wxr8n/production/f046759f47ffda7327444ccbff2d939a1db1cc7a-1344x768.png
1058115  image/png
```

Every URL is the raw `-1344x768.png` asset with no `?w=`, `?fm=webp`, `?q=` or `?auto=format`. At roughly 700 KB average across 146 unique images, a full scroll of `/en/blog/` transfers on the order of 100 MB.

### Why it hurts lead acquisition

`/en/blog/` is the hub that distributes crawl equity and internal links to all 162 posts, and it is a common organic landing page for browse-intent queries. Three compounding problems:

1. **Mobile bounce.** Lazy loading defers the images but does not shrink them. As soon as a visitor scrolls, they are pulling 700 KB PNGs where a 40 KB WebP would look identical at the rendered card size. On a mobile connection the page becomes unusable, and a lead who bounces from the hub never reaches a post, let alone the CTA.
2. **CLS.** Zero of the 296 `<img>` tags carry `width`/`height`. Every image reflows the grid as it arrives, which is both a Core Web Vitals penalty and a visibly janky first impression for an enterprise buyer evaluating credibility.
3. **Crawl inefficiency.** 162 links on one unpaginated page means Googlebot renders a 644 KB document to discover the post set, and there is no `rel=next` chain to signal ordering or recency.

### The fix

1. **Add Sanity image transforms.** The Sanity CDN does this at the URL level, no build step. In `src/pages/[lang]/blog/index.astro` (and anywhere else a `coverImage` URL is emitted), append `?w=600&fm=webp&q=75&auto=format` for card thumbnails and `?w=1200&fm=webp&q=80&auto=format` for hero images. Expect roughly a 90 to 95% reduction per image.
2. **Add explicit `width` and `height`** (or a CSS `aspect-ratio` on the card image container) to every `<img>` to eliminate CLS.
3. **Paginate the index** at 12 to 24 posts per page using Astro's `paginate()` in `getStaticPaths`, and emit `rel="next"` / `rel="prev"`. Add the paginated URLs to the sitemap.
4. Leave the og:image URLs at a 1200x630 transform: `?w=1200&h=630&fit=crop&fm=jpg&q=80`. See finding 10.

---

## 5. HIGH: apex to www redirect is 302, not 301

### What we observed

```
$ curl -sSI https://aitoken.global/en/
HTTP/2 302
location: https://www.aitoken.global/en/
x-cache: Miss from cloudfront
via: 1.1 ... .cloudfront.net (CloudFront)
```

Note there is no `server:` header on the 302 and `x-cache: Miss from cloudfront` on every request, which indicates the redirect is generated at the edge (CloudFront Function or a redirect-only S3 website endpoint) rather than served from cache.

By contrast the trailing-slash redirect is correctly permanent:

```
$ curl -sSI https://www.aitoken.global/en/token-calculator
HTTP/2 301
location: /en/token-calculator/
```

And the HTTP-to-HTTPS upgrade is also correct:

```
$ curl -sSI http://aitoken.global/
HTTP/1.1 301 Moved Permanently
Server: CloudFront
Location: https://aitoken.global/
```

So the 302 is the odd one out.

### Why it hurts lead acquisition

A 302 tells Google the apex is the real home and www is a temporary detour. Google generally works out the intent eventually, but a 302 does not transfer signals as decisively as a 301 and it keeps the apex URLs alive as indexation candidates. Combined with finding 3 (every canonical also pointing at the apex), the two signals reinforce each other in the wrong direction: canonical says apex, redirect says apex is permanent-ish. Any inbound backlinks a lead-gen resource earns to `aitoken.global/...` are having their equity passed through a soft redirect instead of a hard one.

This is also a prerequisite for finding 6. HSTS cannot be safely deployed on a host whose canonical redirect is temporary.

### The fix

Change the redirect status from 302 to 301 at the edge.

- If the redirect is a **CloudFront Function** on the apex distribution's viewer-request event, change the returned `statusCode` from `302` to `301` and `statusDescription` to `Moved Permanently`, then publish the function and invalidate `/*`.
- If it is an **S3 static-website redirect bucket** (`RedirectAllRequestsTo`), S3 emits 301 by default, which means something in front is downgrading it. Check for a CloudFront Function or Lambda@Edge on the apex distribution.
- If it is a **CloudFront distribution-level** redirect, verify no origin-response function is rewriting the status.

There is no file in this repo that controls the redirect. It is AWS console or IaC only, and no IaC for it exists in the repo (see the No data register).

---

## 6. MEDIUM: no security headers on any response

### What we observed

Full header dump, HTML:

```
$ curl -sSI https://www.aitoken.global/en/
HTTP/2 200
content-type: text/html
content-length: 101505
date: Thu, 06 Aug 2026 09:11:56 GMT
cache-control: public, max-age=0, s-maxage=31536000
server: AmazonS3
accept-ranges: bytes
etag: "b7ded904b94eca707ce850d08e8e1126"
last-modified: Thu, 06 Aug 2026 04:04:30 GMT
x-cache: Hit from cloudfront
via: 1.1 c4e3b1d50cc50b7dbfefd37df9ad2414.cloudfront.net (CloudFront)
x-amz-cf-pop: TPE53-P4
alt-svc: h3=":443"; ma=86400
age: 283
```

Checked five resource types for the six standard headers (`strict-transport-security`, `content-security-policy`, `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`):

```
https://www.aitoken.global/en/                        security headers present: 0
https://www.aitoken.global/robots.txt                 security headers present: 0
https://www.aitoken.global/sitemap-0.xml              security headers present: 0
https://www.aitoken.global/_astro/sanity.CPVpdr2L.css security headers present: 0
https://www.aitoken.global/og-image.png               security headers present: 0
```

No `_headers` file, no `customHttp.yml`, no `amplify.yml` exists in the repo:

```
$ find . -maxdepth 3 \( -name '_headers' -o -name 'customHttp.yml' -o -name 'amplify.yml' \) -not -path './node_modules/*'
(no results)
```

### Why it hurts lead acquisition

Security headers are not a direct ranking factor, but for this specific site they are a sales objection. The content set includes `/en/compliance/` ("Enterprise Compliance"), and 155-plus posts on GDPR, Taiwan PDPA, AI API data-usage policies, and legal contracts. A prospect evaluating you as a compliance-adjacent vendor who runs a security scanner (or whose procurement team does) will get an F grade on securityheaders.com for a site that is selling compliance guidance. That is a credibility gap the content itself is trying to close.

The concrete technical risks:

- **No HSTS.** The apex answers on port 80 and 301s to HTTPS, so there is a plaintext window on every first visit that is exploitable via SSL-strip on hostile networks.
- **No `X-Content-Type-Options: nosniff`.** Combined with an S3 origin, any file with a wrong or missing `Content-Type` can be MIME-sniffed into executable script.
- **No CSP.** The pages already load third-party script from `googletagmanager.com`, `static.cloudflareinsights.com`, and `cdn.tailwindcss.com`, plus 9 inline `<script>` blocks on the calculator page. Any injection through Sanity's Portable Text HTML pipeline (`toHTML` in `src/pages/[lang]/blog/[slug].astro:130-142`) executes unconstrained.
- **No `X-Frame-Options` / `frame-ancestors`.** The site can be framed and clickjacked, which matters because the token calculator is the primary interactive lead magnet.

### The fix

Create a **CloudFront Response Headers Policy** and attach it to the default cache behaviour on the www distribution. This requires no code change and no redeploy.

Console path: CloudFront → Policies → Response headers → Create policy. Recommended starting values:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `Content-Security-Policy` | start in `Content-Security-Policy-Report-Only` mode |

A workable starting CSP given the observed third-party set:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com https://cdn.tailwindcss.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https://cdn.sanity.io https://www.googletagmanager.com;
connect-src 'self' https://www.google-analytics.com https://cloudflareinsights.com;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
```

`'unsafe-inline'` in `script-src` is unavoidable while the Tailwind CDN config block and the 7 to 9 inline scripts per page remain. Removing it depends on migrating Tailwind to a build step (see finding 12), which would also let you drop `cdn.tailwindcss.com` from the allowlist.

Order of operations: fix finding 5 (302 to 301) **before** enabling HSTS with `preload`, otherwise you pin a temporary redirect for two years.

---

## 7. MEDIUM: redirect chains up to 3 hops

### What we observed

Measured every combination:

```
$ curl -sSIL http://aitoken.global/en/token-calculator
HTTP/1.1 301  ->  https://aitoken.global/en/token-calculator      (http to https)
HTTP/2   302  ->  https://www.aitoken.global/en/token-calculator  (apex to www)
HTTP/2   301  ->  /en/token-calculator/                           (trailing slash)
HTTP/2   200
TOTAL redirects=3  time=0.750s
```

```
$ curl -sSIL http://aitoken.global/
301 -> https://aitoken.global/
302 -> https://www.aitoken.global/
200
TOTAL redirects=2
```

```
$ curl -sSIL https://aitoken.global/en/token-calculator
302 -> https://www.aitoken.global/en/token-calculator
301 -> /en/token-calculator/
200
TOTAL redirects=2
```

Sampled 29 sitemap URLs across all four locales (7 each plus root). Every single one behaved identically:

```
apex=302  follow=200  hops=1   www=200
```

**Zero 404s and zero broken URLs in the sitemap sample.** The only defect is the universal one-hop 302.

The 3-hop case is important because the http-apex form is exactly what a human types, what gets printed on collateral, and what appears in older backlinks.

### Why it hurts lead acquisition

750 ms spent on redirects before a single byte of HTML arrives, on the token calculator, which is the site's primary interactive lead magnet. Mobile users on high-latency connections pay more than the measured figure. Google also caps redirect-chain following and discounts equity across hops.

### The fix

Two changes collapse the worst case from 3 hops to 1:

1. Fix finding 5 so the apex hop is a 301 rather than a 302, and configure the apex distribution to redirect straight to `https://www.aitoken.global/<path>` in a single hop from the http listener as well (a CloudFront Function on the apex viewer-request can emit the final https-www location directly, skipping the intermediate https-apex step).
2. Make internal and external references use trailing slashes so the third hop never fires. Internal nav is the offender: `src/components/Nav.astro:43,47,51,55,66,67,68,69,116-125` emits `href={`/${lang}/token-calculator`}` with no trailing slash, so **every single internal navigation click currently takes a 301**. Adding the trailing slash to those template literals removes a 301 from every page transition on the site. This is a small, high-value, low-risk edit.

---

## 8. MEDIUM: `max-age=0` on immutable hashed assets and images

### What we observed

Identical cache policy on every resource type regardless of mutability:

```
/en/                             cache-control: public, max-age=0, s-maxage=31536000
/robots.txt                      cache-control: public, max-age=0, s-maxage=31536000
/sitemap-0.xml                   cache-control: public, max-age=0, s-maxage=31536000
/_astro/sanity.CPVpdr2L.css      cache-control: public, max-age=0, s-maxage=31536000
/og-image.png                    cache-control: public, max-age=0, s-maxage=31536000
```

Asset weights:

```
/_astro/sanity.CPVpdr2L.css            15,876 raw / 3,382 brotli
/_astro/token-calculator.BFJgFm5v.css   6,263 raw / 1,609 brotli
/og-image.png                         150,777 (no compression, correct for PNG)
```

### Assessment of `max-age=0, s-maxage=31536000` on HTML

For **HTML this policy is correct and deliberate**. `max-age=0` forces the browser to revalidate so a content update is visible immediately, while `s-maxage=31536000` lets CloudFront hold it at the edge indefinitely. That is the standard SSG-on-CDN pattern.

**The one-year edge cache is not currently stale.** Evidence:

```
last-modified: Thu, 06 Aug 2026 04:04:30 GMT
age: 283
date: Thu, 06 Aug 2026 09:11:56 GMT
```

Today is 2026-08-06, so the edge is serving a build produced about five hours before the probe. Meanwhile the newest commit on `origin/main` is:

```
$ git log -1 --format='%h %ad %s' --date=iso origin/main
4375609 2026-08-03 09:43:59 +0000 chore(seo): refresh data snapshots [skip ci]
```

The deployed build is three days newer than the newest commit, which means builds are being triggered by something other than a git push, almost certainly a Sanity webhook. So a rebuild-plus-invalidation path exists and is working. What I could not verify is *what* performs the invalidation (see the No data register).

### The real problem: `max-age=0` on hashed assets

`/_astro/sanity.CPVpdr2L.css` has a content hash in its filename. It can never change without changing its URL, so it should be cached in the browser forever. `max-age=0` forces a revalidation round trip for that file on **every page navigation**, for every visitor, on a site with no client-side router. Same for `og-image.png`, `favicon-corgi.png`, and the 146 Sanity images (which are on Sanity's CDN with its own policy, so those are outside your control, but the `/_astro/` and `/public/` assets are yours).

### Why it hurts lead acquisition

Multi-page sessions are exactly the behaviour you want from a lead (home to calculator to comparison to blog). Every one of those transitions currently pays an avoidable revalidation for the shared stylesheet. It is a small per-hop cost that lands precisely on your highest-intent visitors.

### The fix

Split the cache policy by path prefix in CloudFront, using two additional cache behaviours on the www distribution:

| Path pattern | Cache-Control |
|---|---|
| `/_astro/*` | `public, max-age=31536000, immutable` |
| `*.png`, `*.ico`, `*.svg`, `*.avif` | `public, max-age=604800` |
| `/sitemap*.xml`, `/robots.txt` | `public, max-age=3600, s-maxage=86400` |
| everything else (HTML) | keep `public, max-age=0, s-maxage=31536000` |

Set these via a CloudFront **Response Headers Policy** (custom `Cache-Control`) attached to the new behaviours, or by setting the `Cache-Control` metadata at upload time in the S3 sync step. The `/sitemap*.xml` change matters separately: a one-year edge cache on the sitemap means a newly published post might not appear in the crawlable sitemap until the next invalidation.

---

## 9. MEDIUM: sitemap has no lastmod and no hreflang alternates

### What we observed

```
$ curl -sS https://www.aitoken.global/sitemap-index.xml
<?xml version="1.0" encoding="UTF-8"?><sitemapindex ...><sitemap><loc>https://aitoken.global/sitemap-0.xml</loc></sitemap></sitemapindex>

$ grep -c '<lastmod>' sitemap-0.xml
0
$ grep -c 'xhtml:link' sitemap-0.xml
0
$ grep -c '<loc>' sitemap-0.xml
656
```

The `xhtml` namespace is declared in the `<urlset>` element but never used. Entries are bare:

```
<url><loc>https://aitoken.global/en/blog/ai-adoption-trends-2026/</loc></url>
```

Locale distribution:

```
en: 162 posts + 11 template pages + blog index = 174
es: 156 posts + 11 + index = 168
id: 155 posts + 11 + index = 167
vi: 134 posts + 11 + index = 146
root: 1
```

### Why it hurts lead acquisition

- **No `lastmod`** means Google has no cheap signal for which of 656 URLs changed. On a site where you are actively refreshing pricing data (the whole value proposition is current AI token prices), the absence of `lastmod` means updated pricing pages are re-crawled on Google's own slow schedule rather than promptly. Stale prices in a SERP snippet are worse than no snippet for a pricing resource.
- **No `xhtml:link` alternates** means the sitemap carries none of the language relationships. Given finding 1 has destroyed the in-page hreflang for blog posts, the sitemap was the one remaining channel that could have carried correct language mappings, and it carries nothing.

### The fix

In `astro.config.mjs:7`, configure the sitemap integration:

```js
integrations: [sitemap({
  serialize(item) {
    item.lastmod = /* Sanity _updatedAt for this URL */;
    return item;
  },
})],
```

`@astrojs/sitemap` supports both a `serialize` hook and an `i18n` option. Do **not** use the built-in `i18n` option here: it generates alternates by the same naive path-swap that caused finding 1, so it would replicate 1,817 bad annotations into the sitemap. Emit alternates only from the real translation map once the Sanity schema work in finding 1 is done.

For `lastmod`, `src/lib/sanity.ts` already queries documents; add `_updatedAt` to the projections and build a slug-to-timestamp map the `serialize` hook can read. Only claim a `lastmod` you can substantiate; a fabricated or build-time-now timestamp on all 656 URLs is worse than omitting the field.

---

## 10. MEDIUM: blog posts declare `og:type=website` and carry no article metadata

### What we observed

```
$ curl -sS https://www.aitoken.global/en/blog/ai-adoption-trends-2026/ | grep 'og:\|twitter:'
<meta property="og:type" content="website">
<meta property="og:url" content="https://aitoken.global/en/blog/ai-adoption-trends-2026/">
<meta property="og:title" content="AI Adoption Trends in 2026">
<meta property="og:description" content="Discover the growth of AI software...">
<meta property="og:image" content="https://cdn.sanity.io/images/mq3wxr8n/production/f046759f47ffda7327444ccbff2d939a1db1cc7a-1344x768.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
```

Checked for the missing set:

```
og:site_name present:            False
twitter:site present:            False
article:published_time present:  False
<time> elements in the document: none
```

Three separate defects:

1. **`og:type` is hardcoded to `website`** at `src/layouts/BaseLayout.astro:93`. Every one of the 607 blog posts claims to be a website homepage rather than an article.
2. **`og:image:width`/`height` are hardcoded to 1200/630** at `src/layouts/BaseLayout.astro:97-98`, but the actual image served is `1344x768` and weighs 1,058,115 bytes. The declared dimensions are a lie, and the file is a 1 MB PNG being handed to social scrapers.
3. **`og:site_name` is absent from `BaseLayout`** entirely. Ironically the root shell at `src/pages/index.astro:20` does have it (`content="AI Token"`), so the one page nobody links to is the only one with a site name.

### Why it hurts lead acquisition

Blog posts are the shareable asset. When a prospect or a partner shares a pricing-comparison post into a Slack, LinkedIn, or WhatsApp thread inside a target account, the unfurl is your entire first impression with that account. Right now that unfurl has no site name (so no brand attribution), no publish date (so no recency signal on a topic where recency is the whole point), a mistyped card type, and a 1 MB image that some scrapers will time out on and drop entirely, leaving a bare text link. Every one of those is a lost warm-referral impression.

### The fix

In `src/layouts/BaseLayout.astro`:

- Add an `ogType` prop defaulting to `'website'`; pass `'article'` from `src/pages/[lang]/blog/[slug].astro:154-160`.
- Add `<meta property="og:site_name" content="AI Token King" />` unconditionally.
- When `ogType === 'article'`, emit `article:published_time` and `article:modified_time` from the post's Sanity `publishedAt` and `_updatedAt`.
- Append a Sanity transform to the og:image URL so the dimensions match the declaration and the file is small: `?w=1200&h=630&fit=crop&fm=jpg&q=80`.
- Add `<time datetime="...">` to the rendered post byline so the date is machine-readable in the HTML as well as the meta tags.

Do this alongside finding 2's `BlogPosting` JSON-LD, since both need the same date fields wired through.

---

## 11. LOW: root shell og:url points at `/`, not `/en/`

### What we observed

`/Users/antonioduran/Desktop/aitokenglobal/src/pages/index.astro`, served verbatim:

```html
<link rel="canonical" href="https://aitoken.global/en/" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://aitoken.global/" />
...
<meta http-equiv="refresh" content="0;url=/en/" />
</head>
<body>
  <script>window.location.replace('/en/');</script>
</body>
```

The canonical correctly points at `/en/` but `og:url` points at `/` (the shell itself). This is an internal inconsistency in the same head block.

### Why it hurts lead acquisition

Minor. When the bare domain is shared, some scrapers key on `og:url` and will attribute engagement to `/` rather than `/en/`, splitting social signals across two URLs. The meta-refresh plus JS redirect pattern itself is fine and correct here, since scrapers read the tags before the refresh fires.

### The fix

`src/pages/index.astro:16` (post-PR-#24 line numbering): change `content={`${siteOrigin}/`}` to `content={`${siteOrigin}/en/`}` so `og:url` matches the canonical.

Note PR #24 touches this exact line (converting the hardcoded apex to a template literal) but preserves the `/` path, so this stays broken after the merge. Worth folding into that PR before it lands.

---

## 12. LOW: Tailwind CDN runtime compiler on every page

### What we observed

`src/layouts/BaseLayout.astro:120-125`:

```html
<!-- Tailwind CDN (defer). Source comment notes: full build-step migration is Task #9 -->
<script is:inline>window.tailwind = window.tailwind || {};</script>
<script defer src="https://cdn.tailwindcss.com" is:inline></script>
```

Render-blocking analysis of the served HTML:

```
/en/
  external stylesheets: 2   (fonts.googleapis.com css2, /_astro/sanity.CPVpdr2L.css)
  external scripts: 3       (gtag async, cloudflareinsights defer, cdn.tailwindcss.com defer)
  render-blocking scripts (no defer/async/module): 0
  inline <script> blocks: 7
  inline <style> blocks: 1  (750 bytes)
  preconnect hints: 2       (fonts.googleapis.com, fonts.gstatic.com)

/en/token-calculator/
  external stylesheets: 3
  external scripts: 3, render-blocking: 0
  inline <script> blocks: 9
  inline <style> blocks: 0
```

Payload summary:

```
page                                raw HTML   brotli HTML
/en/                                 101,505      17,524
/en/token-calculator/                 51,793      11,823
/en/blog/                            644,540      48,687
/en/blog/ai-adoption-trends-2026/     51,821      11,895

/_astro/sanity.CPVpdr2L.css           15,876       3,382
/_astro/token-calculator.BFJgFm5v.css  6,263       1,609
fonts.googleapis.com css2              1,986         330
```

### Assessment

The script loading is well done. Zero render-blocking scripts, correct `async` on gtag, correct `defer` elsewhere, and preconnect hints on both font hosts. Brotli negotiates correctly on all resources. HTTP/2 and h3 advertised.

The two remaining render-blocking resources per page are stylesheets: the Google Fonts CSS (330 bytes brotli, mitigated by preconnect and `display=swap`) and the Astro CSS bundle (3,382 bytes brotli). Both are small. This is not an emergency.

The Tailwind CDN is the weak point. `cdn.tailwindcss.com` is the browser-side JIT compiler, not a prebuilt stylesheet. It downloads a compiler, parses every class name in the DOM, and generates CSS at runtime on every page load. Because it is deferred, it runs after parse, which means a visible flash of unstyled content on slow connections. It also forces `'unsafe-inline'` in any CSP (finding 6), since the config block at lines 126-152 is an inline script.

### Why it hurts lead acquisition

Low direct impact given the deferral, but it caps how good Core Web Vitals can get and it blocks a tight CSP. The comment in the source already flags it: "full build-step migration is Task #9".

### The fix

Migrate Tailwind to a build step (`@astrojs/tailwind` or Tailwind v4 via Vite). Move the theme extension currently inline at `src/layouts/BaseLayout.astro:126-152` (brand colours `#6155F1`, `#3E81E5`, etc., the Kanit/Plus Jakarta Sans font families, and the custom letter-spacing tokens) into `tailwind.config.mjs`. Delete both inline script blocks and the CDN `<script>`. This removes a third-party dependency from the critical path, eliminates FOUC, and unlocks a CSP without `'unsafe-inline'` for scripts.

Also consider self-hosting the two Google Fonts families to remove the last cross-origin render-blocking stylesheet.

---

## Indexability check (clean)

Verified, no issues found:

- **No `noindex` on any live page.** `grep -rn 'noindex' src/` shows the mechanism exists (`BaseLayout.astro:89`, driven by an optional Sanity `seo.noindex` boolean, defaulting to `false` on every page), but no served page carries the tag. Confirmed on `/en/`, `/en/token-calculator/`, `/en/api-compare/`, `/en/blog/`, and a blog post: `robots meta: []` in all cases.
- **robots.txt is permissive and correct** apart from the apex Sitemap URL (finding 3):
  ```
  User-agent: *
  Allow: /

  Sitemap: https://aitoken.global/sitemap-index.xml
  ```
- **Real 404s, no soft-404s.** `curl -sSI https://www.aitoken.global/en/this-does-not-exist-xyz/` returns `HTTP/2 404`, `content-length: 1723`.
- **No orphan template pages.** All 11 EN template pages are reachable from `src/components/Nav.astro` (desktop nav lines 43-69, mobile nav lines 116-125) and are all present in the sitemap.
- **Every EN template page has exactly one `<h1>`**, confirmed on the four pages sampled.
- **No cloaking**, confirmed in the pre-established ground truth and consistent with everything observed here.

One orphan pattern worth noting rather than a defect: individual blog posts are reachable only from `/[lang]/blog/`, which is unpaginated. There is no category or tag archive, and no "recent posts" module in the footer. All 162 EN posts hang off a single 644 KB hub page. Adding pagination (finding 4) plus category archives would improve both crawl depth and the internal-link graph.

---

## Merge-order recommendation

1. **Merge PR #24** (`antonioduran/canonical-www-seo-fix`). Resolves finding 3 entirely. Fold the finding 11 one-liner into it before merging.
2. **Fix the apex 302 to 301** (finding 5) at CloudFront. No code change, no deploy.
3. **Add the CloudFront Response Headers Policy** (finding 6) with CSP in report-only mode, and the split cache behaviours (finding 8) in the same console session.
4. **Add trailing slashes to `Nav.astro` hrefs** (finding 7). One-file edit, removes a 301 from every internal click.
5. **Add JSON-LD** (finding 2), starting with Organization plus FAQPage on the three money pages. Highest ratio of lead-acquisition value to effort in this entire report.
6. **Add Sanity image transforms and paginate the blog index** (finding 4).
7. **Fix og:type, og:site_name, article dates** (finding 10) together with the BlogPosting schema from step 5.
8. **Fix hreflang properly** (finding 1). Largest total impact but requires Sanity schema work, so it lands last. Ship the interim mitigation (suppress hreflang on blog posts) immediately in the meantime.
9. **Add sitemap lastmod** (finding 9) once `_updatedAt` is in the Sanity projections.
10. **Migrate Tailwind off the CDN** (finding 12). Unlocks the tighter CSP.

---

## No data / could not verify

The following could not be established from HTTP probes or repo contents. Each needs AWS console access or Search Console access to resolve.

1. **What performs the CloudFront invalidation on deploy.** There is no `amplify.yml`, no `customHttp.yml`, no `_headers`, and no deploy workflow in the repo (`.github/workflows/` contains only `refresh-seo-data.yml`, which refreshes Sanity data snapshots and redeploys the Studio, not the website). Evidence that *something* works: served `last-modified: Thu, 06 Aug 2026 04:04:30 GMT` is three days newer than the newest `origin/main` commit (`4375609`, 2026-08-03 09:43:59), so a non-git-triggered rebuild and cache flush is happening, most plausibly a Sanity webhook into Amplify or a CodePipeline. But the mechanism, its invalidation scope (`/*` vs targeted paths), and whether it is guaranteed to fire on every content publish are all unverified. **This matters**: with `s-maxage=31536000`, any publish path that skips invalidation leaves that URL stale at the edge for up to a year. Recommend confirming in the AWS console and documenting it in the repo.

2. **Whether the hosting is Amplify Hosting or a hand-rolled S3 plus CloudFront stack.** `go-live-guide.md` (Phase 6, lines 214-288) describes an AWS Amplify deployment. Response headers show `server: AmazonS3` behind `via: ... .cloudfront.net`, which is consistent with either. The fix instructions in findings 5, 6, and 8 differ slightly between the two (Amplify exposes custom headers via `customHttp.yml` in the repo; a raw CloudFront stack needs a console-side Response Headers Policy). Both paths are given where it matters, but the operator should confirm which applies.

3. **The exact mechanism generating the apex 302.** The 302 carries no `server:` header and always shows `x-cache: Miss from cloudfront`, which points to an edge-generated response (CloudFront Function, Lambda@Edge, or a redirect-only S3 website endpoint). Cannot distinguish from outside. The finding-5 fix lists all three possibilities.

4. **Which host Google has actually indexed, and current index coverage.** Search Console is a Domain property (`sc-domain:aitoken.global`, per `.github/workflows/refresh-seo-data.yml:47`), which rolls apex and www into a single report by design, so the split is not observable there and is certainly not observable from outside. My conclusion in finding 3 that www is being indexed is a well-founded inference from redirect and canonical behaviour, not a measurement. **Verify directly**: run a `site:` query for both hosts, and check the Page Indexing report for "Alternate page with proper canonical tag" and "Page with redirect" counts.

5. **Actual hreflang error counts in Search Console.** Finding 1's 1,817 figure is computed from the live sitemap and confirmed by spot HTTP probes on 8 alternate URLs. It is arithmetic on verified data, not a GSC readout. The International Targeting report will give the authoritative number and should be checked to confirm the scale.

6. **Whether the 302-to-www or the apex canonical is currently suppressing indexation of specific URLs.** Requires the GSC URL Inspection API or manual inspection per URL. Not attempted.

7. **Core Web Vitals field data (CrUX).** Finding 4 and finding 12 describe payload and layout-stability problems from first principles (measured bytes, absent width/height attributes). No lab run (Lighthouse) or field data (CrUX / PageSpeed Insights) was collected in this lane. `go-live-guide.md:327` notes a Lighthouse mobile baseline as an open to-do that was never completed. Recommend capturing one before and after the finding-4 image work so the improvement is quantified.

8. **Total transfer weight of a full `/en/blog/` scroll.** The roughly 100 MB figure in finding 4 is `146 unique images x ~700 KB average`, where the average comes from a 6-image sample (622,482 / 701,130 / 732,617 / 912,408 / 619,948 / 1,058,115 bytes). All 146 were not individually measured. The order of magnitude is solid; the precise total is not.

9. **Whether Sanity's own CDN cache headers on `cdn.sanity.io` images are optimal.** Out of scope for probes run here, and not under this project's control beyond the URL-level transform parameters recommended in finding 4.

10. **Backlink profile and how much equity is currently flowing through the apex 302.** No backlink data source was available in this lane. The severity assigned to finding 5 assumes a non-trivial number of apex-pointing inbound links exists; if the profile is near-empty the practical urgency drops (though the fix is cheap enough that it should be done regardless).
