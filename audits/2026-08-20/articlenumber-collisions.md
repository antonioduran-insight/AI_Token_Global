# `articleNumber` collisions

Generated 2026-08-20 by `node scripts/audit-article-numbers.mjs` against the `production` dataset. Read-only — this script cannot write to Sanity.

## Summary

| | |
|---|---|
| Published posts | 638 |
| Distinct `articleNumber`s in use | 171 |
| Highest number in use | 171 |
| Numbers colliding within a language | **0** () |
| Posts affected | **0** |
| Posts with no number at all | 0 |

`articleNumber` is the only thing connecting a post to its translations, so a
collision breaks hreflang: where two posts in the same language share a number,
nothing identifies which one a Spanish post translates. The site handles that by
emitting a self-referencing hreflang only and warning at build time, rather than
guessing a pair — a wrong pair is a claim Google acts on.

## Before reassigning anything: this changes what readers see

`articleNumber` is not only a key. It is the sort order posts are fetched in
(`getAllPosts` orders by `coalesce(articleNumber, 999999) asc`), so changing a
number moves the post in three reader-facing places:

| Where | What `articleNumber` decides |
|---|---|
| Home page | Which 7 posts appear at all (`allPosts.slice(0, 7)`), and which is the large featured card (`blogPosts[0]`) |
| Blog index | Which post fills the featured slot — `pickFeatured` takes the first match in DOM order, and DOM order is this sort |
| Blog index | The "Most Popular" sort option, which is `articleNumber` ascending |

The blog index defaults to "Latest" (publication date), so the main grid order
does not move — but the featured slot and the whole home-page selection do.
Lowest number wins in each case, so moving a post to a low free number promotes
it to the home page, and moving it high removes it from there.

## The collisions

For each number: every post that currently carries it, then a **suggested**
grouping of which look like translations of each other.

The suggestion is inferred, not recorded. Signals used, in order of weight:
cover image asset (a translation reuses the source article's image), body block
count, publication timestamp (a cluster was written within seconds of itself),
and shared slug (`en` and `vi` often share one). Each cluster below says which
signals agreed. **Open both posts before acting on any of it.**

## Also found: documents sharing one URL

**2 slugs are claimed by more than one document in the same language**, covering 5 documents. This is not an `articleNumber` problem and it is worse than one: a language and a slug together decide the URL, so only one of these documents can be served at `/<lang>/blog/<slug>/`. The build writes them in fetch order and the last one wins, which means the others are unreachable — their content is live in Sanity and absent from the site.

| Language | Slug | Documents | `articleNumber`s | Document IDs |
|---|---|---|---|---|
| en | `ai-token-pricing-models-comparison` | 3 | 1, 103, 51 | `NzB7IaLHdyz2K2TRSs0NQp` (2026-06-09)<br>`cxG6WGqtby4sD0hmXNirH1` (2026-06-10)<br>`lT0MJhwbFtcMofmR8I8IU1` (2026-06-04) |
| id | `memahami-mekanisme-token-ai` | 2 | 112, 130 | `7Ahi24M7FaSDiVrQoaHKUG` (2026-06-17)<br>`GWcybyvSzKo1HK4vzSXwsk` (2026-07-02) |

Only one of these overlaps the collision list above, so fixing the numbers
alone would leave the rest in place. Each needs a decision in the Studio:
keep one document and delete the others, or give the survivors distinct slugs.

For context on the IDs: 135 documents carry a `-<language>` suffix, which is how the translation pipeline names a locale copy. A document whose suffix matches its own `language` — an `-en` document that is already English — is a copy the pipeline should not have made, and is worth checking first.

## Numbers that are free

Nothing below the current maximum of 171 is free.

Everything from **172** upward is also free.

Which to use depends on what the number should do to the ordering described
above. A gap low in the range promotes a post toward the home page; a number
above 171 sends it to the end of the fetch order and off the home page.

Resolving the 0 collisions needs **0 free numbers** if every suggested cluster keeps a distinct one.

## Context: numbers missing a locale

Not a collision and not a bug, but it shapes how many hreflang links a post gets. 30 number(s) are missing at least one locale:

| Missing locale(s) | Count | Numbers |
|---|---|---|
| vi | 22 | 51, 103, 122–141 |
| es, id, vi | 8 | 142–143, 145, 153–156, 171 |

---

Re-run `node scripts/audit-article-numbers.mjs` after editing in the Studio to
confirm the collision count is zero.
