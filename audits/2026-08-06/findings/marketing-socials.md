# Marketing, Socials and Reputation Audit

**Site:** https://aitoken.global (apex 302 to https://www.aitoken.global)
**Audit date:** 2026-08-06
**Lane question:** does this brand survive a prospect's background check?

**Verdict:** No. A prospect who searches the brand, checks the footer, looks for a privacy policy, tries to find who they would be contracting with, or looks for third party corroboration finds nothing verifiable. The site sells an "Enterprise AI Compliance Solution" to financial institutions and listed companies while disclosing no legal entity, no address, no contact channel, no privacy policy and no terms. Every commercial CTA leaves the site for a different brand on a different domain, and that relationship is never disclosed.

---

## Findings

### CRITICAL

#### C1. No legal entity, no address, no contact channel anywhere on the site

**What was probed (literal URL, literal status):**

| URL | Status | Note |
|---|---|---|
| `https://www.aitoken.global/en/compliance/` | 200 | Enterprise compliance sales page, live |
| `https://www.aitoken.global/en/about/` | 404 | |
| `https://www.aitoken.global/en/contact/` | 404 | |
| `https://www.aitoken.global/en/legal/` | 404 | |
| `https://www.aitoken.global/en/imprint/` | 404 | |
| `https://www.aitoken.global/humans.txt` | 404 | |
| `https://www.aitoken.global/.well-known/security.txt` | 404 | |

Regex sweep of the served HTML for `/en/` and `/en/compliance/` returned **zero** `mailto:` links, **zero** `tel:` links, and zero occurrences of `Ltd`, `LLC`, `Limited`, `Inc.`, `GmbH`, `company number`, `registered office`, `統一編號` or `有限公司`.

The compliance page's own conversion CTAs are self referencing dead ends:
- "Contact Enterprise Sales" links to `/en/compliance` (the page itself).
- "View Enterprise AI Compliance Proposal" links to `/en/compliance` (the page itself).

**Why it matters:** the page explicitly targets "Financial institutions, exchanges, virtual asset service providers, securities, insurance, and futures companies" and "Publicly listed companies with compliance, audit, and governance requirements". It positions the brand as a "Local Representative" that "Handles invoicing, contracts, procurement, and liability attribution". A procurement or legal reviewer at any of those organisations performs entity verification as step one. There is nothing to verify and no one to email. The lead is lost at the exact moment intent is highest.

**Action:** publish `/en/about/`, `/en/contact/` and an imprint block in the footer carrying the operating legal entity name, registration number, registered address and a monitored contact address. Point "Contact Enterprise Sales" at a real form or mailto. This is the single highest value fix in this lane.

---

#### C2. Privacy Policy and Terms of Service do not exist, while GA4 and Cloudflare analytics run on every page in four locales including Spanish

**What was probed:**

| URL | Status |
|---|---|
| `https://www.aitoken.global/en/privacy/` | 404 |
| `https://www.aitoken.global/en/privacy-policy/` | 404 |
| `https://www.aitoken.global/en/terms/` | 404 |
| `https://www.aitoken.global/en/terms-of-service/` | 404 |

The footer links that are supposed to reach them are hardcoded placeholders. From `/Users/antonioduran/Desktop/aitokenglobal/src/components/Footer.astro` lines 69 to 70:

```
<a href="#" ...>{t('footer.privacy')}</a>
<a href="#" ...>{t('footer.terms')}</a>
```

Verified live in the shipped HTML on `/en/` and `/es/`. The cookie consent banner's own "Privacy Policy" link is also `href="#"` (`class="cookie-consent__link"`).

Live tracking confirmed in the served HTML:
- GA4 `https://www.googletagmanager.com/gtag/js?id=G-2KG5EVJQ22`, with Consent Mode v2 defaulting all four signals to `denied` and `wait_for_update: 500`.
- Cloudflare Web Analytics `https://static.cloudflareinsights.com/beacon.min.js`, beacon token `88312c1f31ca4a1a998bdbe7a78b4e19`.
- No other tracking, chat or marketing vendors. Repo grep for hotjar, clarity, segment, posthog, intercom, crisp, drift, tawk, hubspot and `fbq(` returned zero hits.

**Why it matters:** the consent mechanism itself is well built (GA4 is genuinely gated, defaults denied, choice stored in `localStorage` under `atk-cookie-consent`). That engineering work is undermined by the fact that the notice it points to does not exist. Under GDPR Art. 13 a privacy notice is mandatory regardless of whether cookies are gated, and the Spanish locale plus the enterprise positioning makes EU visitors foreseeable. Separately, no terms means no limitation of liability, no jurisdiction clause and no acceptable use terms on a site that publishes pricing data enterprises may rely on.

**Action:** ship real `/[lang]/privacy/` and `/[lang]/terms/` pages in all four locales, wire the three `href="#"` placeholders (two footer, one cookie banner) to them. Until then the consent banner is making a promise the site cannot keep.

---

#### C3. Footer social icons are unedited placeholders pointing at bare platform homepages, in production, in all four locales

**What was probed:**

| Rendered href | Resolves to | Status |
|---|---|---|
| `https://twitter.com` | X homepage | 200 (not a brand profile) |
| `https://linkedin.com` | LinkedIn homepage | 200 (not a brand profile) |

Source: `/Users/antonioduran/Desktop/aitokenglobal/src/components/Footer.astro` lines 25 and 28. Verified live on `/en/`, `/es/` and `/en/compliance/`.

Compounding this: a real LinkedIn company page for the brand **does exist** and is not linked from anywhere on the site. See H2.

**Why it matters:** a prospect who clicks a social icon and lands on twitter.com's logged out homepage reads it as an abandoned or template site. It is a worse signal than having no icons at all, because it proves the footer was never finished.

**Action:** either point both at the real profiles (LinkedIn page exists today) or delete the icon row until profiles are live.

---

### HIGH

#### H1. Five different brand names are in simultaneous use, and none of them is asserted in structured data

| Name | Where it appears | Evidence |
|---|---|---|
| `AI Token` | apex redirect stub `<title>` and `og:site_name` | `https://aitoken.global/` (1723 byte stub) |
| `AI Token King` | `/en/` `<title>`, footer wordmark, logo `alt`, copyright line, blog post title suffix | served HTML |
| `AItokenKing` | destination product `<title>` and `meta description` | `https://www.aitokenking.com.tw/` |
| `AI Token King (ATK)` | LinkedIn company page name | `https://www.linkedin.com/company/ai-token-king` |
| `AI Token Global` | repo / project name | local repo |

Structured data check across `/en/`, `/es/`, `/en/blog/ai-token-pricing-for-beginners/` and `/en/compliance/`: **0 `application/ld+json` blocks on every page.** No `Organization`, no `sameAs`, no `WebSite`, no `Article`, no `publisher`. Repo grep for `sameAs`, `"Organization"`, `foundingDate`, `legalName` returned zero hits. There is also no `twitter:site` or `twitter:creator` meta on any page.

**Why it matters:** brand SERP consolidation and any future knowledge panel both depend on one canonical entity name plus `sameAs` links to owned profiles. Right now Google has no signal tying aitoken.global, aitokenking.com.tw and the LinkedIn page together, and a prospect who reads "AI Token" in the tab, "AI Token King" in the footer and "AItokenKing" after clicking Get Started reasonably suspects they have been redirected somewhere unintended.

**Action:** pick one public brand name. Add an `Organization` JSON-LD block to `BaseLayout.astro` with `name`, `legalName`, `url`, `logo`, `sameAs` (LinkedIn, and X once claimed) and `contactPoint`. Add `twitter:site` once the handle is claimed. Fix the apex stub title to match.

---

#### H2. Verified near zero social presence. One real profile exists, with 5 followers, and the site does not link to it

Every candidate handle was probed directly. Full table in the [Social platform status table](#social-platform-status-table) below. Summary of what was **verified**:

- `https://www.linkedin.com/company/ai-token-king` returns **200**. Page title "AI Token King (ATK) | LinkedIn". `og:description` states **"5 followers on LinkedIn"**. Listed website is `https://www.aitokenking.com.tw/home`, industry "Software Development", size "11-50 employees", type "Privately Held". Named employees include "Jose Antonio Duran Barrios" and "Kid Chang". LinkedIn's own JSON-LD gives `sameAs: https://www.aitokenking.com.tw/home`. This is unambiguously the brand's page, and aitoken.global does not link to it.
- X/Twitter: `x.com/aitokenglobal` **404**, `x.com/aitokenking` **404**, `x.com/AItokenKing` **404**, `x.com/ai_token_king` **404**, `x.com/aitoken_global` **404**, `x.com/aitokenglobal_` **404**, `x.com/aitokenkinghq` **404**. Verified absent.
- The two obvious short handles are held by unrelated third parties: `x.com/aitoken` 200 resolves to "森岡 健二 (@aitoken)", a Japanese personal account; `x.com/ai_token` 200 resolves to "小鳥遊 (@ai_token)", also a Japanese personal account.
- YouTube: `youtube.com/@aitokenglobal` **404**, `youtube.com/@aitokenking` **404**. `youtube.com/@aitoken` 200 is an unrelated Russian language channel titled "AITOKEN".
- GitHub: `api.github.com/users/aitokenglobal` **404**, `/aitoken` **404**, `/aitokenking` **404**. Verified absent.
- LinkedIn control test: `linkedin.com/company/microsoft` returned **200** while `linkedin.com/company/aitokenglobal` and `/aitokenking` returned **404** with identical 319687 byte bodies, so LinkedIn 404s here are discriminating, not a bot wall.

**Why it matters:** a B2B buyer's first corroboration step is LinkedIn. A 5 follower company page with no posts, not linked from the website, and an 11-50 employee claim that is unverifiable, reads as pre revenue at best. There is no second data point anywhere.

**Action:** claim `@aitokenking` on X (verified free), link the existing LinkedIn page from the footer, post to it. A LinkedIn page with 5 followers that the site refuses to link to is currently a liability; either grow it or stop having it findable while the footer says nothing.

---

#### H3. Zero review footprint under the brand, and the closest name match in the SERP is a different company

Direct probes (all bot walled to scripted requests, see the No data register):

| URL | Status |
|---|---|
| `https://www.trustpilot.com/review/aitoken.global` | 403 (curl), 403 (WebFetch) |
| `https://www.trustpilot.com/review/aitokenking.com.tw` | 403 |
| `https://www.g2.com/products/ai-token/reviews` | 403 |
| `https://www.g2.com/products/ai-token-king/reviews` | 403 |
| `https://www.capterra.com/p/aitoken/` | 403 |
| `https://www.producthunt.com/products/ai-token` | 403 |
| `https://www.producthunt.com/products/ai-token-king` | 403 |
| `https://theresanaiforthat.com/ai/ai-token/` | 403 |
| `https://www.futurepedia.io/tool/ai-token` | **404** (verified absent) |
| `https://sourceforge.net/software/product/AI-Token/` | 403 |
| `https://alternativeto.net/software/ai-token/` | 403 |

Search for `aitoken.global reviews` returns **no listing for this brand on any review platform**. What it returns instead is a different company, "AIToken Labs", with explicitly zero reviews on three platforms: GoodFirms (`https://www.goodfirms.co/company/aitoken-labs`), CrowdReviews (`https://www.crowdreviews.com/aitoken-labs`, "0 Reviews, Community Feedback Score 0.00"), and G2 (`https://www.g2.com/sellers/aitoken-labs`, "Read 0 Reviews").

**Why it matters:** a prospect searching "<brand> reviews" gets served a name-adjacent company with a zero score. That is worse than an empty result, because the reader will not carefully distinguish "AIToken Labs" from "AI Token King" and will carry away "zero reviews" as the impression.

**Action:** create and claim a G2 seller profile and a Trustpilot business profile under one canonical brand name, then solicit reviews from existing customers. Do not gate solicitation on positive sentiment (G2 and Trustpilot both prohibit review gating, and a compliance-positioned brand cannot afford a gating violation).

---

#### H4. The domain is four months old, on a one year registration, with a redacted registrant, and has zero archive history

RDAP, `https://rdap.identitydigital.services/rdap/domain/aitoken.global`, HTTP 200:

- `registration` event: **2026-04-09T10:48:36Z**
- `expiration` event: **2027-04-09T10:48:36Z** (a one year term)
- Registrar: `PDR Ltd. d/b/a PublicDomainRegistry.com`
- Registrant, admin and tech entities: fully **redacted** (`rdapConformance` includes `"redacted"`)
- Nameservers: AWS Route 53
- Status: `client transfer prohibited`

Wayback Machine CDX API, `http://web.archive.org/cdx/search/cdx?url=aitoken.global&matchType=domain&output=json`, returned **`[]`**, i.e. zero snapshots ever. Control query for `example.com` on the same endpoint returned rows, so the empty result is real. For comparison, `aitokenking.com.tw` does have snapshots (earliest observed 2026-05-18).

The destination domain is equally new. TWNIC WHOIS for `aitokenking.com.tw`: **created 2026-03-24**, expires 2027-03-24, registrant "insight software CO., LTD.", contact "Frank Kao", address "No. 96, Sec. 2, Zhongshan N. Rd., Taipei City, TW", via GANDI SAS.

**Why it matters:** every automated vendor-risk and fraud-scoring tool a corporate buyer might run weights domain age, registration term and WHOIS privacy. Four months old, one year term, privacy shielded, zero archive history is the exact profile those tools flag. Combined with C1 (no entity) and C2 (no terms), an enterprise procurement screen will fail this site.

**Action:** extend the registration to a multi-year term (cheap, immediately visible in WHOIS, materially improves automated trust scores). Consider un-redacting an organisation name in WHOIS. Neither substitutes for C1.

---

#### H5. Undisclosed commercial relationship: an "independent, free, always" content hub whose every CTA funnels to a white-label reseller of a third party platform

The footer copy reads "The definitive English-language hub for understanding AI tokens, models, and APIs. Free, always." Every commercial CTA on the site leaves for `https://www.aitokenking.com.tw` (nav "Get Started", mobile nav "Get Started", "Compare APIs" card, "Compare Models" link, footer "Documentation"), all tagged `data-ga-event="cta_get_started"`.

That destination is a white-label instance of a third party platform, not a first party product. Evidence from the shipped bundle `https://www.aitokenking.com.tw/assets/index-sSLk3Jwj.js` (297017 bytes, HTTP 200):

1. A runtime brand substitution function that rewrites the vendor's own strings into tenant strings:
```
function Ta(e,t){ const {displayBrandName:n,upperBrandName:r,companyName:o,siteUrl:a,supportEmail:i,registeredAddress:s}=t;
  return e.replace(/BASICROUTER/g,r).replace(/BasicRouter/g,n)
   .replace(/BASICWARE AI LIMITED/g,o).replace(/Basicware AI LIMITED/g,o)
   .replace(/https:\/\/basicrouter\.ai/g,a)
   .replace(/support@basicrouter\.ai/g,i) ...
```
2. The tenant registry, with the default brand being someone else's:
```
fa="BasicRouter.ai",
ha=[{keyword:"basicrouter.ai",name:"BasicRouter.ai"},
    {keyword:"midwayflow.ai",name:"MidwayFlow.ai"},
    {keyword:"aitokenking",name:"AItokenKing"},
    {keyword:"ciyuan-market",name:"词元市场"}]
```
3. The live tenant config, `https://api.aitokenking.com.tw/api/site/config`, HTTP 200:
```json
{"brandCode":"aitokenking","brandName":"AItokenKing","apiRoute":"/api/v1",
 "domain":"www.aitokenking.com.tw","backendDomain":"api.aitokenking.com.tw",
 "schemaName":"ai_token_king","isDefault":false,
 "createdAt":"2026-04-15T18:49:56","payment":[],
 "logoUrl":"https://midwayflow-flie.oss-cn-hongkong.aliyuncs.com/prod/all_backend/lyy/20260420143050859.png"}
```
Note `isDefault:false` and a logo served from the **MidwayFlow** Alibaba Cloud Hong Kong bucket. The bundle also exposes `/api/reseller/` endpoints.

Corroboration: `https://basic-ware.ai/en` describes BasicRouter as its platform giving access to "over 60 mainstream global Large Language Models". The AI Token King LinkedIn page describes itself as "a unified AI gateway" offering "92+ AI models" at "around 45% below OpenRouter".

Nowhere on aitoken.global is any of this disclosed. Repo grep across `src/` and `public/` for `affiliate`, `disclosure`, `sponsored`, `commission`, `referral` returned **zero hits**.

**Why it matters:** the site publishes comparative pricing and "API Comparison" content while every conversion path routes to one commercially interested vendor. That is a material conflict of interest presented as neutral editorial. For a brand selling *compliance* to regulated industries, an undisclosed commercial relationship in its own funnel is the worst possible look, and it is the kind of thing a competitor or a journalist finds in ten minutes.

**Action:** add a plain-language disclosure on the comparison pages and in the footer stating the commercial relationship between aitoken.global and aitokenking.com.tw, and state clearly whether the comparison content is independent. Also disclose the underlying platform provider on the compliance page, since enterprises evaluating a "Local Representative" for liability attribution need to know who is actually in the chain.

---

#### H6. The entity chain does not reconcile across three sources, and the asserted operating entity could not be verified in a public register

| Source | Entity asserted | Evidence |
|---|---|---|
| aitoken.global (the site) | **none** | zero entity strings, see C1 |
| `aitokenking.com.tw` WHOIS (TWNIC) | **insight software CO., LTD.**, Frank Kao, No. 96 Sec. 2 Zhongshan N. Rd., Taipei City, TW, created 2026-03-24, via GANDI | TWNIC WHOIS |
| `aitokenking.com.tw` shipped bundle | **BASICWARE AI LIMITED** (the string being rewritten out) | `index-sSLk3Jwj.js` |
| LinkedIn `ai-token-king` | "AI Token King (ATK)", 11-50 employees, Privately Held, no registered address published | `https://www.linkedin.com/company/ai-token-king` |
| LinkedIn `basicware-ai` | "Basicware AI Limited", HQ Hong Kong, 51-200 employees, JSON-LD address **"Unit 2705, 27/F, Yen Sheng Centre, Hong Kong"** | `https://www.linkedin.com/company/basicware-ai` |

**Register verification attempted:**
- Hong Kong Companies Registry primary source, `https://www.cr.gov.hk/docs/wrpt/RNC063_2024.09.16-2024.09.22.pdf` (HTTP 200, 728246 bytes), decompressed and searched. It contains entry 141: **"Basicware Information System Limited", CR number 67903807, registered 17-09-2024**. It does **not** contain any entity named "BASICWARE AI LIMITED".
- Therefore "BASICWARE AI LIMITED", the entity name embedded in the product the site funnels to, **could not be verified** in the HK register with free tooling. ICRIS full search requires a paid account. Marked "no data", not "absent".
- Taiwan GCIS open-data API queries for the company name and for the Zhongshan N. Rd. address returned empty bodies with HTTP 200. "insight software CO., LTD." **could not be verified** in the Taiwan register with free tooling. Marked "no data".
- OpenCorporates HK search returned a HAProxy CAPTCHA page. No data.

**Address type flag:** the Taipei address (No. 96, Sec. 2, Zhongshan N. Rd.) appears in a Taiwanese company-registry aggregator as a multi-company registration address (`https://twincn.com/Lq.aspx?q=臺北市中山區中山北路2段96號` exists as an address-level company listing page), but the page did not render for automated fetch, so the **number of co-registered companies could not be counted**. Treat as "suspected shared/serviced address, unconfirmed". The Hong Kong address (Yen Sheng Centre, Kwun Tong) is a commercial tower routinely used for registered office services; also unconfirmed at count level. Neither is proven to be a mass virtual office and neither is proven not to be.

**Why it matters:** three different names across three sources, none of them stated on the website the prospect is reading, and the one named in the product code is not findable in the register. Any diligence process stops here.

**Action:** state the contracting entity explicitly on aitoken.global, including registration number and jurisdiction, and make it consistent with whatever entity issues the invoice. If the contracting party is a Taiwan entity reselling a Hong Kong platform, say so; that is a normal structure and disclosing it is far less damaging than a prospect discovering it themselves.

---

### MEDIUM

#### M1. Cloudflare Web Analytics fires for every visitor with no consent gate, by design

`/Users/antonioduran/Desktop/aitokenglobal/src/layouts/BaseLayout.astro` line 80, verified in the served HTML comment: the beacon is described as "cookieless, no consent gate (fires for every visitor)". Cookieless analytics is defensible under most EU interpretations, and GA4 *is* properly gated, so the engineering choice is reasonable. The problem is that the disclosure which would make it defensible (C2) does not exist. **Action:** ship the privacy policy and name Cloudflare Web Analytics in it. No code change needed.

#### M2. Lookalike and typosquat landscape: the exact-match variants are parked for sale and the repo-name domain is unclaimed

| Domain | HTTPS result | State |
|---|---|---|
| `aitokenglobal.com` | DNS NXDOMAIN | **Unregistered.** Exact match of the repo/project name, available |
| `ai-token.global` | DNS NXDOMAIN | Unregistered |
| `aitokenglobal.net` | DNS NXDOMAIN | Unregistered |
| `aitoken.com` | 200 after redirect to `https://forsale.dynadot.com/aitoken.com` | Parked for sale (title "For Sale Domain: aitoken.com") |
| `aitoken.net` | 200 after redirect to `https://forsale.dynadot.com/aitoken.net` | Parked for sale |
| `aitoken.app` | 200, title "AIToken dot App: premium domain name (Buy now)" | For sale |
| `aitoken.co` | 200, GoDaddy page, H1 "Launching Soon" | Held, placeholder |
| `aitoken.io` | 200, JS redirect to `/lander` | Parked |
| `aitokens.com` | 200, JS redirect to `/lander` | Parked |
| `aitoken.dev` | 526 (Cloudflare SSL failure) | Broken, held |
| `aitoken.ai` | TLS handshake failure, A record 207.207.210.107 | Held, not serving |
| `aitokenking.com` | connection timeout, NS `cs1.ename.net` | Held by a third party |

**Why it matters:** no live confusing competitor was found, which is the good news. But `aitokenglobal.com` being free means anyone can register the project's own name, and `aitokenking.com` is already held by an unrelated party at a Chinese registrar, which blocks the natural .com for the product brand. **Action:** defensively register `aitokenglobal.com` and `ai-token.global` (low cost, removes the cheapest impersonation vector). Do not chase `aitoken.com`.

#### M3. Copyright line reads "© 2025" on an audit dated 2026-08-06, in all four locales

Verified on `/en/` ("© 2025 AI Token King. All rights reserved.") and `/es/` ("© 2025 AI Token King. Todos los derechos reservados."). A stale copyright year is one of the fastest heuristics a buyer uses to judge whether a site is maintained. **Action:** make the year dynamic in `Footer.astro`.

#### M4. Social sharing renders without brand attribution

No `twitter:site` or `twitter:creator` meta on any page probed. No `og:site_name` on `/en/`, `/es/`, the blog post, or the compliance page (it exists only on the apex redirect stub, where it says "AI Token"). No JSON-LD `publisher` on blog posts. The blog post `<title>` is "AI Token Pricing for Beginners" with no brand suffix, though Google is rendering "AI Token King Blog" as the site name in results. **Action:** add `og:site_name` and `twitter:site` in `BaseLayout.astro`, and `Article` + `publisher` JSON-LD on blog posts. Every one of 611 shared posts currently loses brand attribution.

#### M5. Category reputational adjacency: the "AI token reseller" space carries active fraud coverage

A search for the brand's own category surfaces `https://explainx.ai/blog/ai-token-black-market-claude-resellers-distillation-2026` ("AI Token Black Market: Claude Resellers at 70 to 93% Off") and `https://cloudinsight.cc/en/blog/ai-api-reseller-guide` (a Taiwan-specific "how to choose an AI API reseller" evaluation guide). The AI Token King LinkedIn page advertises "around 45% below OpenRouter".

**Why it matters:** a discount-versus-incumbent claim in a category where journalists are actively writing about pooled accounts and stolen trials means the brand needs *above average* trust signals to be believed. It currently has below average ones. This is not an accusation of wrongdoing, it is a positioning risk: the same claim that attracts the click invites the diligence that the site cannot survive. **Action:** substantiate the pricing claim with a dated, sourced comparison page, and pair the discount messaging with entity disclosure and a named support channel.

---

### LOW

#### L1. 404s serve the apex redirect stub, so a lost visitor is silently bounced to /en/
Every 404 probed returned a 1723 byte body byte-identical in size to `https://aitoken.global/`, which contains `<meta http-equiv="refresh" content="0;url=/en/">` and `window.location.replace("/en/")`. A visitor following a stale link to `/en/privacy` receives HTTP 404 and is then thrown to the homepage with no explanation. **Action:** serve a real 404 page. (Primarily an SEO/UX lane item, noted here because it is what a prospect hits when they click the dead Privacy Policy link.)

#### L2. Zero verifiable press, citations or inbound coverage
Searches for the brand name, the domain, and the brand plus "press release / news / launch 2026" returned no coverage of this property. Zero Wayback snapshots (H4) independently corroborates a near zero external footprint. Precise backlink counts require Ahrefs/Semrush/Majestic: **no data**, not estimated. **Action:** none urgent. Digital PR is premature until C1, C2 and C3 are fixed, because coverage would drive traffic to a site that fails the trust check.

#### L3. The short brand handles are held by unrelated third parties on X and YouTube
`x.com/aitoken` (Japanese personal account), `x.com/ai_token` (Japanese personal account), `youtube.com/@aitoken` (Russian language channel), `aitokenking.com` (held via ename.net). The brand cannot obtain the obvious short handles. **Action:** standardise on `aitokenking` across X, YouTube and GitHub, all three of which are verified free today, before someone else takes them.

---

## Social platform status table

Probed 2026-08-06 with a desktop Chrome user agent, following redirects. "Verified absent" is used only where a control test proved the platform returns a discriminating status.

| Platform | URL probed | HTTP | Verdict |
|---|---|---|---|
| LinkedIn (company) | `https://www.linkedin.com/company/ai-token-king` | **200** | **EXISTS.** "AI Token King (ATK)", 5 followers, 11-50 employees, links to aitokenking.com.tw. Not linked from the site |
| LinkedIn (company) | `https://www.linkedin.com/company/aitokenglobal` | 404 | Verified absent (control: `/company/microsoft` = 200) |
| LinkedIn (company) | `https://www.linkedin.com/company/aitokenking` | 404 | Verified absent |
| LinkedIn (company) | `https://www.linkedin.com/company/aitokenking-global` | 404 | Verified absent |
| LinkedIn (related) | `https://www.linkedin.com/company/basicware-ai` | 200 | Exists (platform provider, not the brand) |
| X / Twitter | `https://x.com/aitokenglobal` | 404 | Verified absent |
| X / Twitter | `https://x.com/aitokenking` | 404 | Verified absent |
| X / Twitter | `https://x.com/AItokenKing` | 404 | Verified absent |
| X / Twitter | `https://x.com/ai_token_king` | 404 | Verified absent |
| X / Twitter | `https://x.com/aitoken_global` | 404 | Verified absent |
| X / Twitter | `https://x.com/aitokenglobal_` | 404 | Verified absent |
| X / Twitter | `https://x.com/aitokenkinghq` | 404 | Verified absent |
| X / Twitter | `https://x.com/aitoken` | 200 | Taken by unrelated third party ("森岡 健二") |
| X / Twitter | `https://x.com/ai_token` | 200 | Taken by unrelated third party ("小鳥遊") |
| X / Twitter | `https://twitter.com/aitokenglobal` | 404 | Verified absent |
| GitHub | `https://api.github.com/users/aitokenglobal` | 404 | Verified absent |
| GitHub | `https://api.github.com/users/aitoken` | 404 | Verified absent |
| GitHub | `https://api.github.com/users/aitokenking` | 404 | Verified absent |
| YouTube | `https://www.youtube.com/@aitokenglobal` | 404 | Verified absent |
| YouTube | `https://www.youtube.com/@aitokenking` | 404 | Verified absent |
| YouTube | `https://www.youtube.com/@aitoken` | 200 | Taken by unrelated third party (Russian language channel) |
| Facebook | `https://www.facebook.com/aitokenglobal` | **400** | **Unverified** (bot wall) |
| Facebook | `https://www.facebook.com/aitokenking` | **400** | **Unverified** (bot wall) |
| Instagram | `https://www.instagram.com/aitokenglobal/` | 200, body is login wall (`<title>Instagram</title>`) | **Unverified** (bot wall) |
| Instagram | `https://www.instagram.com/aitokenking/` | 200, login wall | **Unverified** (bot wall) |
| TikTok | `https://www.tiktok.com/@aitokenglobal` | 200, empty body | **Unverified** (bot wall) |
| TikTok | `https://www.tiktok.com/@aitokenking` | 200, empty body | **Unverified** (bot wall) |
| Threads | `https://www.threads.net/@aitokenglobal` | 200, generic `<title>Threads</title>` | **Unverified** (bot wall) |
| Threads | `https://www.threads.net/@aitokenking` | 200, generic title | **Unverified** (bot wall) |
| Medium | `https://medium.com/@aitokenglobal` | **403** | **Unverified** (bot wall) |
| Medium | `https://aitokenglobal.medium.com/` | **403** | **Unverified** (bot wall) |
| Medium | `https://medium.com/@aitokenking` | **403** | **Unverified** (bot wall) |
| Reddit | `https://www.reddit.com/user/aitokenglobal/about.json` | **403** | **Unverified** (bot wall, both www and old) |
| Reddit | `https://www.reddit.com/user/aitokenking/about.json` | **403** | **Unverified** (bot wall) |
| Reddit | `https://www.reddit.com/r/aitoken/about.json` | **403** | **Unverified** (bot wall) |
| Discord | not linked from site, no invite found | n/a | Verified absent from site |
| Site-linked socials | `https://twitter.com` (footer icon) | 200 | Placeholder, not a profile |
| Site-linked socials | `https://linkedin.com` (footer icon) | 200 | Placeholder, not a profile |

---

## Competitor comparison table

Competitor set chosen for direct overlap with the two things this site does: model pricing comparison content, and funnelling to a multi-model API gateway.

| Metric | **AI Token / AI Token King** | **OpenRouter** | **Artificial Analysis** | **LLM Price Check** |
|---|---|---|---|---|
| Primary domain | aitoken.global | openrouter.ai | artificialanalysis.ai | llmpricecheck.com |
| Domain created (WHOIS/RDAP) | **2026-04-09** (1yr term, redacted registrant) | 2023-04-17 | 2023-12-29 | 2024-04-19 |
| Wayback snapshots | **0** (CDX returned `[]`) | no data (not queried) | no data (not queried) | no data (not queried) |
| Indexed URLs in own sitemap | **656** (611 blog URLs across 4 locales) | 6,170 | 11,476 | no sitemap in robots.txt |
| Legal entity named on site | **none** | no data (not audited) | no data (not audited) | no data (not audited) |
| Privacy policy reachable | **no (404)** | no data | no data | no data |
| X / Twitter | **none** (all handles 404) | `x.com/openrouter` 200, "@OpenRouter", linked in footer | `x.com/ArtificialAnlys` 200, **57.3K followers** per search snippet | `x.com/llmpricecheck` **404** |
| LinkedIn company page | `company/ai-token-king` 200, **5 followers**, **not linked from site** | `company/104068329` 200, linked in footer | `company/artificial-analysis` 200, linked in footer | `company/llmpricecheck` **404** |
| YouTube | none (404) | `@OpenRouterAI` 200, linked in footer | `@ArtificialAnalysisAI`, linked in footer | none |
| GitHub | none (404) | `OpenRouterTeam`, **3,570 followers, 39 public repos**, org created 2023-07-13 | `ArtificialAnalysis`, **57 followers, 2 public repos**, org created 2024-04-21 | links only to a third party repo |
| Discord | none | `discord.gg/fVyRaUDgxW`, **50,653 members, 6,056 online** (Discord API) | `discord.gg/Mk298GPZ7V`, **1,647 members, 183 online** (Discord API) | none |
| Third party reviews | **none found** | G2 seller page "16 Reviews"; Trustpilot TrustScore 1.7 / 41 reviews; Product Hunt 5.0 / 30 upvotes (all via search snippets, see No data register) | no data | no data |
| Structured data (JSON-LD) | **0 blocks on every page** | no data | no data | no data |

**Read on the benchmark:** the site is competitive on one axis only, content volume relative to its age (611 posts in four months). On every trust axis measured it is at or near zero while the two serious competitors have four to five figure community numbers, publicly linked profiles on four platforms each, and years of domain history. Notably, both real competitors link their socials from their footers; this site links two placeholders and hides the one real profile it has.

Sources for the competitor row data: `https://openrouter.ai/` (footer HTML), `https://artificialanalysis.ai/` (footer HTML), `https://llmpricecheck.com/` (footer HTML), `https://api.github.com/orgs/OpenRouterTeam`, `https://api.github.com/orgs/ArtificialAnalysis`, `https://discord.com/api/v10/invites/fVyRaUDgxW?with_counts=true`, `https://discord.com/api/v10/invites/Mk298GPZ7V?with_counts=true`, `https://openrouter.ai/sitemap.xml`, `https://artificialanalysis.ai/sitemap.xml`, `https://x.com/artificialanlys`, `https://www.g2.com/sellers/openrouter`, `https://www.trustpilot.com/review/openrouter.ai`.

---

## Brand SERP: what a prospect actually sees on page one

**Query "AI Token King":** the site's own blog posts rank (e.g. `https://www.aitoken.global/en/blog/understanding-ai-tokens-beginners-guide-api-token-mechanics/`, rendered with the site name "AI Token King Blog"). Also on the page: an unrelated Webflow template site "AI King" (`https://aiking.webflow.io/`), and generic educational pages from NVIDIA, Google Cloud and Jotform. **The brand ranks for its exact name, but shares page one with unrelated properties and with content from far larger publishers.**

**Query "AI Token King" + aitoken.global:** returns the site's blog plus `https://www.aitokenking.com.tw/home` and `https://aitoken.com/` ("AIToken | The Intelligence Currency", a cryptocurrency project). The brand's page one is shared with an unrelated crypto token.

**Query "aitoken.global reviews":** the brand does not appear at all. The page is dominated by "AIToken Labs" with zero reviews on three platforms. See H3.

**Query "aitoken.global" (mentions/citations):** no coverage of this property found. Search surfaced `https://www.scamadviser.com/check-website/aitokeninsights.com`, an unrelated domain, as the nearest name match. A prospect scanning that page one sees a scam-checker result adjacent to a similar name.

**The structural problem:** the primary public brand token "AI Token" is a generic crypto industry term (the top organic result for it is `https://markets.bitcoin.com/glossary/ai-token`). The brand cannot own it. "AI Token King" is ownable and the site already ranks for it, but the site's own `<title>` on the apex, its `og:site_name`, and the repo name all say something different. **Action:** consolidate on "AI Token King" everywhere, or pick a genuinely distinctive name. The current split guarantees the brand competes with the crypto category for its own SERP.

---

## No data / could not verify register

Every item below was probed and returned an inconclusive result. None of these should be reported as "absent".

**Bot-walled social platforms (status returned, content not readable):**
1. Facebook, `https://www.facebook.com/aitokenglobal` and `/aitokenking` : HTTP **400** to scripted requests. Presence unknown.
2. Instagram, `https://www.instagram.com/aitokenglobal/` and `/aitokenking/` : HTTP **200** but body is the generic login wall. Presence unknown.
3. TikTok, `https://www.tiktok.com/@aitokenglobal` and `/@aitokenking` : HTTP **200**, empty body. Presence unknown.
4. Threads, `https://www.threads.net/@aitokenglobal` and `/@aitokenking` : HTTP **200**, generic title only. Presence unknown.
5. Medium, `https://medium.com/@aitokenglobal`, `https://aitokenglobal.medium.com/`, `https://medium.com/@aitokenking` : HTTP **403**. Presence unknown.
6. Reddit, user and subreddit `about.json` on both `www.reddit.com` and `old.reddit.com` : HTTP **403** on every request. Presence unknown.

**Bot-walled review platforms (existence of a brand listing could not be confirmed or denied):**
7. Trustpilot, `https://www.trustpilot.com/review/aitoken.global` and `/aitokenking.com.tw` : **403** to both curl and WebFetch.
8. G2, `https://www.g2.com/products/ai-token/reviews` and `/ai-token-king/reviews` : **403**.
9. Capterra, `https://www.capterra.com/p/aitoken/` : **403** (the Capterra homepage also returned 403, so this is a blanket block, not a missing page).
10. Product Hunt, `https://www.producthunt.com/products/ai-token`, `/aitoken`, `/ai-token-king` : **403** (a known-good control, `/products/notion`, also returned 403, confirming a blanket block).
11. There's An AI For That, `https://theresanaiforthat.com/ai/ai-token/` : **403**.
12. SourceForge `https://sourceforge.net/software/product/AI-Token/`, Slashdot `https://slashdot.org/software/p/AI-Token/`, AlternativeTo `https://alternativeto.net/software/ai-token/` : **403**.
    - Only Futurepedia gave a discriminating answer: `https://www.futurepedia.io/tool/ai-token` returned **404**, verified absent.

**Company register items:**
13. "BASICWARE AI LIMITED" in the Hong Kong Companies Registry: **could not verify**. ICRIS full search requires a paid account. The CR weekly PDF `RNC063_2024.09.16-2024.09.22.pdf` was retrieved and searched and contains "Basicware Information System Limited" (CR 67903807, registered 17-09-2024) but no entity of the exact name "BASICWARE AI LIMITED".
14. "insight software CO., LTD." in the Taiwan MOEA/GCIS register: **could not verify**. GCIS open-data API endpoints returned HTTP 200 with empty bodies for both name and address queries.
15. OpenCorporates HK search, `https://opencorporates.com/companies/hk?q=BASICWARE+AI+LIMITED` : HTTP 200 but body was a HAProxy CAPTCHA. No data.
16. **Whether the Taipei address (No. 96, Sec. 2, Zhongshan N. Rd.) is a mass virtual-office address: could not verify.** An address-level company listing page exists at `https://twincn.com/Lq.aspx?q=臺北市中山區中山北路2段96號`, which indicates multiple registrations at the address, but the page returned empty to automated fetch so **the company count was not obtained**. Flagged as suspected shared/serviced address, unconfirmed.
17. **Whether the Hong Kong address (Unit 2705, 27/F, Yen Sheng Centre) is a mass registration address: could not verify.** Directory searches at hkgbusiness.com returned JS-driven pages with no result rows. Unconfirmed.
18. Incorporation date, officers and address type for the entity actually contracting with customers: **could not verify**, because the site names no entity at all (finding C1).

**Backlinks, press and traffic:**
19. Precise backlink counts, referring domain counts and domain authority for aitoken.global: **no data**. These require Ahrefs, Semrush or Majestic. Not estimated. What *was* verified for free: zero Wayback snapshots, and zero third party mentions surfaced across four distinct searches.
20. Traffic estimates for the site or any competitor: **no data**. Not estimated.

**Competitor figures taken from search snippets rather than a direct page load (marked as lower confidence):**
21. OpenRouter G2 review count ("16 Reviews", `https://www.g2.com/sellers/openrouter`), Trustpilot ("TrustScore 1.7 out of 5 across 41 reviews as of May 2026", `https://www.trustpilot.com/review/openrouter.ai`), Product Hunt ("5.0 rating, 30 upvotes"). All three source pages returned 403 to direct fetch. Figures are search-snippet derived and were **not** independently confirmed.
22. Artificial Analysis X follower count ("57.3K followers", `https://x.com/artificialanlys`): search-snippet derived. X does not expose follower counts in server-rendered meta, so this was not independently confirmed.
23. OpenRouter exact X follower count: **no data**. The profile exists (`https://x.com/openrouter`, HTTP 200, bio confirming "400+ models") but the count is not in server-rendered HTML.
24. Whether the site's GA4 property `G-2KG5EVJQ22` is actively receiving and being reviewed: **no data**. Only the client-side tag was verified.

---

## Prioritised action list

1. **C1 + C2 together, this week.** Publish `/[lang]/privacy/`, `/[lang]/terms/`, `/[lang]/about/` and `/[lang]/contact/`; put the operating legal entity, registration number, registered address and a monitored email in the footer; wire the three `href="#"` placeholders. Point "Contact Enterprise Sales" at something real.
2. **C3, one hour.** Replace or remove the two placeholder social hrefs in `src/components/Footer.astro` lines 25 and 28. The LinkedIn page already exists.
3. **H5, this week.** Disclose the aitoken.global to aitokenking.com.tw commercial relationship on the comparison pages and in the footer.
4. **H1 + M4, one day.** Pick one brand name. Add `Organization` JSON-LD with `sameAs`, plus `og:site_name` and `twitter:site`, in `BaseLayout.astro`. Fix the apex stub title.
5. **H4, ten minutes.** Extend the domain registration to a multi-year term.
6. **H2, ongoing.** Claim `@aitokenking` on X, YouTube and GitHub while they are still free. Link and actually post to the LinkedIn page.
7. **H3, this month.** Claim a Trustpilot business profile and a G2 seller profile under the canonical name. No review gating.
8. **M2, ten minutes.** Defensively register `aitokenglobal.com` and `ai-token.global`.
9. **M3, five minutes.** Make the footer copyright year dynamic.
