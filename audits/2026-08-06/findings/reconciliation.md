# Cross-lane reconciliation

Conflicts between specialist lanes, resolved against primary evidence. Recorded for the report appendix.

## 1. hreflang breakage rate

| Source | Broken | Denominator | Rate |
|---|---|---|---|
| Technical SEO lane | 1,817 | 3,035 | 59.9% |
| Page inventory lane | 1,511 | 2,620 | 57.7% |
| Raw dataset `page-inventory-data.tsv`, columns 26 and 27, summed | 1,511 | 3,275 | 46.1% |

**Resolution: 1,511 broken of 3,275 total annotations (46.1%).**

Why this evidence won: the two lanes agree on the broken count (1,511 appears in both the page-inventory prose and the raw per-URL dataset), and the page-inventory lane HEAD-checked all 1,257 unique alternate targets individually, finding 1,257 of 1,257 return HTTP 404. The disagreement is confined to the denominator. The page-inventory prose figure (2,620) contradicts that lane's own dataset (3,275 summed across 656 rows), so the prose percentage is a reporting error, not a measurement one. The technical SEO lane's 1,817 could not be reproduced from the per-URL data and is treated as a differing counting convention (likely counting apex-redirecting targets as broken alongside true 404s).

**Preferred framing for the report:** the per-page figure is both more defensible and more damning. **603 of 656 pages (91.9%) emit at least one dead alternate; only 53 pages have all four alternates live.** All three sources support this.

## 2. Duplicate metadata: brief expectation not supported

The master prompt anticipated duplicate titles and descriptions as "usually the biggest finding". Measured on full coverage, it is not:

- 7 duplicate-title groups (14 URLs, only 8 within-locale)
- 0 duplicate meta descriptions sitewide
- 1 duplicate H1 pair, 1 canonical collision
- 0 pages sharing identical body content

Recorded as a genuine negative finding. The real duplication risk is semantic, not textual: 55 EN blog title pairs score Jaccard 0.50 or above, covering 53 of 162 EN posts (32.7%).

## 3. Translated SEO metadata is genuinely translated

Also a negative finding, against expectation. Joining EN to translations via shared Sanity cover assets produced 399 comparable pairs: 3 identical titles (all vi), 0 identical descriptions, 0 identical H1s.

## 4. SPA-without-SSR pattern does not apply

The master prompt flags this as "the single most common killer finding on modern sites". Verified absent: the site is static Astro SSG on S3 and CloudFront, HTML is fully server-rendered (101,505 bytes uncompressed), and default UA, Googlebot, and GPTBot all receive byte-identical responses. No cloaking, no prerender dependency.

## 5. Scope of PR #24 (`antonioduran/canonical-www-seo-fix`, commit 04a55a1)

Corrects an early assumption made during Phase 1. The PR resolves the apex-host issue on canonicals, og:urls, hreflang hrefs, and sitemap locs, and additionally fixes a wrong fallback origin (`aitokenglobal.com`). It does **not** fix the hreflang slug bug: it relocates the 1,511 dead alternates to the www hostname, where they remain dead.

## 6. Independently verified by the lead auditor

Re-probed directly rather than accepted from lane reports:

- Zero `application/ld+json` blocks on all 5 page types probed. Confirmed, and the dataset shows 656 of 656 pages at zero.
- Apex returns 302, not 301. Confirmed.
- hreflang mechanism confirmed on `/en/blog/ai-token-basics-for-beginners/`: es and id alternates resolve to 404 after following redirects, while en and vi return 200. The real Spanish equivalent exists under a different slug (`/es/blog/ai-token-explained-guia-para-principiantes/`), proving the naive locale-segment swap is the cause.
- All 607 blog posts carry exactly 0 in-article internal links. Summed from the dataset, total is 0, not merely low.
