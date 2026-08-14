# `articleNumber` collisions

Generated 2026-08-14 by `node scripts/audit-article-numbers.mjs` against the `production` dataset. Read-only — this script cannot write to Sanity.

## Summary

| | |
|---|---|
| Published posts | 639 |
| Distinct `articleNumber`s in use | 165 |
| Highest number in use | 166 |
| Numbers colliding within a language | **4** (1, 2, 60, 144) |
| Posts affected | **38** |
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

### `articleNumber` 1 — 16 posts

Per language: en ×4, es ×4, id ×4, vi ×4

| Language | Title | Slug | Cover asset | Blocks | publishedAt |
|---|---|---|---|---|---|
| en | Does AI Token Affect Answer Quality? | `ai-token-impact-answer-quality` | `…6b87068e` | 26 | 2026-06-04T11:02:52.123Z |
| en | Understanding AI Token Pricing Models: A Beginner's Guide | `ai-token-pricing-models-comparison` | `…2ab27d41` | 20 | 2026-06-09T05:38:10.766Z |
| en | Calculating AI Token Costs: A Beginner's Guide | `calculating-ai-token-costs` | `…23c7867a` | 22 | 2026-06-09T04:25:15.151Z |
| en | Optimizing AI Token Costs for Small Businesses | `optimizing-ai-token-costs-for-small-businesses` | `…bc4de1ca` | 23 | 2026-06-08T09:47:10.266Z |
| es | Calculando Costos de Token AI: Una Guía para Principiantes | `calculando-costos-de-token-ai-guia-para-principiantes` | `…23c7867a` | 22 | 2026-06-09T04:25:16.608Z |
| es | Entendiendo los modelos de precios de tokens AI: Una guía para principiantes | `entendiendo-los-modelos-de-precios-de-tokens-ai` | `…2ab27d41` | 20 | 2026-06-09T05:38:12.268Z |
| es | Óptimización de Costos de Tokens para Pequeñas Empresas | `optimizacion-de-costos-de-tokens-para-pequenas-empresas` | `…bc4de1ca` | 23 | 2026-06-08T09:47:11.501Z |
| es | ¿Influye el Token de Inteligencia Artificial en la Calidad de la Respuesta? | `token-ai-cualidad-respuesta` | `…6b87068e` | 26 | 2026-06-04T11:02:53.568Z |
| id | Apakah Token AI Mempengaruhi Kualitas Jawaban? | `apakah-token-ai-mempengaruhi-kualitas-jawaban` | `…6b87068e` | 26 | 2026-06-04T11:02:54.269Z |
| id | Mengerti Model Harga Token AI: Panduan Dasar | `mengerti-model-harga-token-ai-panduan-dasar` | `…2ab27d41` | 20 | 2026-06-09T05:38:13.228Z |
| id | Menghitung Biaya Token AI: Panduan Pengantar | `menghitung-biaya-token-ai-panduan-pengantar` | `…23c7867a` | 22 | 2026-06-09T04:25:18.240Z |
| id | Optimasi Biaya Token AI untuk Usaha Kecil | `optimasi-biaya-token-ai-usaha-kecil` | `…bc4de1ca` | 23 | 2026-06-08T09:47:12.374Z |
| vi | Token AI Có Ảnh Hưởng Đến Chất Lượng Câu Trả Lời Không? | `ai-token-impact-answer-quality` | `…6b87068e` | 26 | 2026-06-04T11:02:52.123Z |
| vi | Hiểu các mô hình định giá token AI: Hướng dẫn cho người mới | `ai-token-pricing-models-comparison` | `…2ab27d41` | 20 | 2026-06-09T05:38:10.766Z |
| vi | Tính Chi Phí Token AI: Hướng Dẫn cho Người Mới | `calculating-ai-token-costs` | `…23c7867a` | 22 | 2026-06-09T04:25:15.151Z |
| vi | Tối ưu hóa chi phí token AI cho doanh nghiệp nhỏ | `optimizing-ai-token-costs-for-small-businesses` | `…bc4de1ca` | 23 | 2026-06-08T09:47:10.266Z |

**Suggested clusters** (each should end up with its own number):

1. ✅ strong — same cover image, same block count (26), published within 2s, shares a slug across locales
   - `en` `ai-token-impact-answer-quality` — Does AI Token Affect Answer Quality?
   - `es` `token-ai-cualidad-respuesta` — ¿Influye el Token de Inteligencia Artificial en la Calidad de la Respuesta?
   - `id` `apakah-token-ai-mempengaruhi-kualitas-jawaban` — Apakah Token AI Mempengaruhi Kualitas Jawaban?
   - `vi` `ai-token-impact-answer-quality` — Token AI Có Ảnh Hưởng Đến Chất Lượng Câu Trả Lời Không?
2. ✅ strong — same cover image, same block count (23), published within 2s, shares a slug across locales
   - `en` `optimizing-ai-token-costs-for-small-businesses` — Optimizing AI Token Costs for Small Businesses
   - `es` `optimizacion-de-costos-de-tokens-para-pequenas-empresas` — Óptimización de Costos de Tokens para Pequeñas Empresas
   - `id` `optimasi-biaya-token-ai-usaha-kecil` — Optimasi Biaya Token AI untuk Usaha Kecil
   - `vi` `optimizing-ai-token-costs-for-small-businesses` — Tối ưu hóa chi phí token AI cho doanh nghiệp nhỏ
3. ✅ strong — same cover image, same block count (22), published within 3s, identical tags, shares a slug across locales
   - `en` `calculating-ai-token-costs` — Calculating AI Token Costs: A Beginner's Guide
   - `es` `calculando-costos-de-token-ai-guia-para-principiantes` — Calculando Costos de Token AI: Una Guía para Principiantes
   - `id` `menghitung-biaya-token-ai-panduan-pengantar` — Menghitung Biaya Token AI: Panduan Pengantar
   - `vi` `calculating-ai-token-costs` — Tính Chi Phí Token AI: Hướng Dẫn cho Người Mới
4. ✅ strong — same cover image, same block count (20), published within 2s, shares a slug across locales
   - `en` `ai-token-pricing-models-comparison` — Understanding AI Token Pricing Models: A Beginner's Guide
   - `es` `entendiendo-los-modelos-de-precios-de-tokens-ai` — Entendiendo los modelos de precios de tokens AI: Una guía para principiantes
   - `id` `mengerti-model-harga-token-ai-panduan-dasar` — Mengerti Model Harga Token AI: Panduan Dasar
   - `vi` `ai-token-pricing-models-comparison` — Hiểu các mô hình định giá token AI: Hướng dẫn cho người mới

4 strong, 0 likely, 0 single, 0 needing review. Number 1 can stay with one cluster; every other cluster needs a free number.

### `articleNumber` 2 — 12 posts

Per language: en ×3, es ×3, id ×3, vi ×3

| Language | Title | Slug | Cover asset | Blocks | publishedAt |
|---|---|---|---|---|---|
| en | AI Token Provider Comparison: Prices, Features, and Use Cases | `ai-token-provider-comparison-prices-features-use-cases` | `…e7fab0c8` | 26 | 2026-06-09T04:32:10.292Z |
| en | Understanding AI Token Basics for a Smarter Future | `understanding-ai-token-basics-for-a-smarter-future` | `…f8b57cd0` | 26 | 2026-06-04T11:03:47.877Z |
| en | Understanding Tokenization in AI Platforms: A Beginner's Guide | `understanding-tokenization-in-ai-platforms-a-beginners-guide` | `…9d8a68ea` | 33 | 2026-06-08T09:48:16.440Z |
| es | Comparativa de proveedores de tokens de inteligencia artificial: precios, características y escenarios de uso | `comparativa-proveedores-tokens-inteligencia-artificial` | `…e7fab0c8` | 26 | 2026-06-09T04:32:11.620Z |
| es | Guía completa para entender los tokens de inteligencia artificial | `comprendiendo-tokens-de-inteligencia-artificial` | `…f8b57cd0` | 26 | 2026-06-04T11:03:49.349Z |
| es | Entendiendo la Tokenización en Plataformas de Inteligencia Artificial: Una Guía para Principiantes | `entendiendo-tokenizacion-en-plataformas-de-inteligencia-artificial-una-guia-para-principiantes` | `…9d8a68ea` | 33 | 2026-06-08T09:48:17.544Z |
| id | Mengenal Token AI untuk Pemula: Panduan Lengkap | `mengenal-token-ai-untuk-pemula-panduan-lengkap` | `…f8b57cd0` | 26 | 2026-06-04T11:03:50.314Z |
| id | Mengerti Tokenisasi dalam Platform AI: Panduan untuk Pemula | `mengerti-tokenisasi-dalam-platform-ai-panduan-untuk-pemula` | `…9d8a68ea` | 33 | 2026-06-08T09:48:19.222Z |
| id | Perbandingan Penyedia Token AI: Harga, Fitur, dan Kasus Penggunaan | `perbandingan-penyedia-token-ai-harga-fitur-dan-kasus-penggunaan` | `…e7fab0c8` | 26 | 2026-06-09T04:32:12.737Z |
| vi | So Sánh Nhà Cung Cấp Token AI: Giá Cả, Tính Năng và Trường Hợp Sử Dụng | `ai-token-provider-comparison-prices-features-use-cases` | `…e7fab0c8` | 26 | 2026-06-09T04:32:10.292Z |
| vi | Kiến Thức Cơ Bản Về Token AI Cho Tương Lai Thông Minh Hơn | `understanding-ai-token-basics-for-a-smarter-future` | `…f8b57cd0` | 26 | 2026-06-04T11:03:47.877Z |
| vi | Hiểu Về Token Hóa Trong Các Nền Tảng AI: Hướng Dẫn Cho Người Mới | `understanding-tokenization-in-ai-platforms-a-beginners-guide` | `…9d8a68ea` | 33 | 2026-06-08T09:48:16.440Z |

**Suggested clusters** (each should end up with its own number):

1. ✅ strong — same cover image, same block count (26), published within 2s, shares a slug across locales
   - `en` `understanding-ai-token-basics-for-a-smarter-future` — Understanding AI Token Basics for a Smarter Future
   - `es` `comprendiendo-tokens-de-inteligencia-artificial` — Guía completa para entender los tokens de inteligencia artificial
   - `id` `mengenal-token-ai-untuk-pemula-panduan-lengkap` — Mengenal Token AI untuk Pemula: Panduan Lengkap
   - `vi` `understanding-ai-token-basics-for-a-smarter-future` — Kiến Thức Cơ Bản Về Token AI Cho Tương Lai Thông Minh Hơn
2. ✅ strong — same cover image, same block count (33), published within 3s, identical tags, shares a slug across locales
   - `en` `understanding-tokenization-in-ai-platforms-a-beginners-guide` — Understanding Tokenization in AI Platforms: A Beginner's Guide
   - `es` `entendiendo-tokenizacion-en-plataformas-de-inteligencia-artificial-una-guia-para-principiantes` — Entendiendo la Tokenización en Plataformas de Inteligencia Artificial: Una Guía para Principiantes
   - `id` `mengerti-tokenisasi-dalam-platform-ai-panduan-untuk-pemula` — Mengerti Tokenisasi dalam Platform AI: Panduan untuk Pemula
   - `vi` `understanding-tokenization-in-ai-platforms-a-beginners-guide` — Hiểu Về Token Hóa Trong Các Nền Tảng AI: Hướng Dẫn Cho Người Mới
3. ✅ strong — same cover image, same block count (26), published within 2s, identical tags, shares a slug across locales
   - `en` `ai-token-provider-comparison-prices-features-use-cases` — AI Token Provider Comparison: Prices, Features, and Use Cases
   - `es` `comparativa-proveedores-tokens-inteligencia-artificial` — Comparativa de proveedores de tokens de inteligencia artificial: precios, características y escenarios de uso
   - `id` `perbandingan-penyedia-token-ai-harga-fitur-dan-kasus-penggunaan` — Perbandingan Penyedia Token AI: Harga, Fitur, dan Kasus Penggunaan
   - `vi` `ai-token-provider-comparison-prices-features-use-cases` — So Sánh Nhà Cung Cấp Token AI: Giá Cả, Tính Năng và Trường Hợp Sử Dụng

3 strong, 0 likely, 0 single, 0 needing review. Number 2 can stay with one cluster; every other cluster needs a free number.

### `articleNumber` 60 — 5 posts

Per language: en ×2, es ×1, id ×1, vi ×1

| Language | Title | Slug | Cover asset | Blocks | publishedAt |
|---|---|---|---|---|---|
| en | Choosing the Right AI Model for Your Needs | `choosing-the-right-ai-model-for-your-needs` | `…10b3eaeb` | 32 | 2026-06-04T17:21:23.791Z |
| en | Choosing the Right AI Model for Your Needs | `choosing-the-right-ai-model-for-your-needs` | `…10b3eaeb` | 32 | 2026-06-04T17:21:23.791Z |
| es | ¿Cómo elegir el modelo de IA adecuado para tus necesidades? | `elegir-modelo-ia-necesidades` | `…10b3eaeb` | 32 | 2026-06-04T17:21:25.343Z |
| id | Memilih Model AI yang Tepat untuk Kebutuhan Anda | `memilih-model-ai-yang-tepat` | `…10b3eaeb` | 32 | 2026-06-04T17:21:26.953Z |
| vi | Chọn Đúng Mô Hình AI Cho Nhu Cầu Của Bạn | `choosing-the-right-ai-model-for-your-needs` | `…10b3eaeb` | 32 | 2026-06-04T17:21:23.791Z |

> **⚠️ Not a translation problem — duplicate documents.** 1 pair(s) below are two Sanity documents with the same language *and* the same slug, so they are the same post twice. Two documents cannot both own one URL: the build writes one over the other, and whichever loses is unreachable. Delete the redundant document rather than renumbering it.
>
> - `en` / `choosing-the-right-ai-model-for-your-needs` — `g3jTIj9ubDWnGQfo9PLqB2` (created 2026-06-04T17:21:23Z) and `g3jTIj9ubDWnGQfo9PLqB2-en` (created 2026-06-04T17:21:23Z)

**Suggested clusters** (each should end up with its own number):

1. ⚠️ needs review — **5 posts but only 4 distinct language(s)** — same cover image, same block count (32), published within 3s, identical tags, shares a slug across locales
   - `en` `choosing-the-right-ai-model-for-your-needs` — Choosing the Right AI Model for Your Needs
   - `en` `choosing-the-right-ai-model-for-your-needs` — Choosing the Right AI Model for Your Needs
   - `es` `elegir-modelo-ia-necesidades` — ¿Cómo elegir el modelo de IA adecuado para tus necesidades?
   - `id` `memilih-model-ai-yang-tepat` — Memilih Model AI yang Tepat untuk Kebutuhan Anda
   - `vi` `choosing-the-right-ai-model-for-your-needs` — Chọn Đúng Mô Hình AI Cho Nhu Cầu Của Bạn

0 strong, 0 likely, 0 single, 1 needing review. Number 60 can stay with one cluster; every other cluster needs a free number.

### `articleNumber` 144 — 5 posts

Per language: en ×2, es ×1, id ×1, vi ×1

| Language | Title | Slug | Cover asset | Blocks | publishedAt |
|---|---|---|---|---|---|
| en | MCP vs API: Why AI Agents Burn So Many Tokens — and How Protocol Design Fixes It | `mcp-vs-api-ai-agent-token-cost-efficiency` | — | 30 | 2026-07-17T09:00:00.000Z |
| en | The Agent That Passed the Demo and Failed on Monday: Inside Google's Gemini Enterprise Agent Platform | `what-is-google-gemini-enterprise-agent-platform-and-pricing` | — | 23 | 2026-07-18T17:12:09.000Z |
| es | MCP vs API: Por qué los Agentes de IA Consumen Tantos Tokens — y Cómo el Diseño del Protocolo lo Soluciona | `mcp-vs-api-eficiencia-tokens-agentes-ia` | — | 30 | 2026-07-17T09:00:00.000Z |
| id | MCP vs API: Mengapa AI Agent Menghabiskan Terlalu Banyak Token — dan Bagaimana Desain Protokol Mengatasinya | `mcp-vs-api-efisiensi-biaya-token-ai-agent` | — | 30 | 2026-07-17T09:00:00.000Z |
| vi | MCP vs API: Tại Sao AI Agent Đốt Quá Nhiều Token — và Cách Thiết Kế Giao Thức Giải Quyết Vấn Đề Này | `mcp-vs-api-ai-agent-token-cost-efficiency` | — | 30 | 2026-07-17T09:00:00.000Z |

**Suggested clusters** (each should end up with its own number):

1. 🟡 likely — same block count (30), published within 0s, identical tags, shares a slug across locales, no cover image on any member, so that signal is silent
   - `en` `mcp-vs-api-ai-agent-token-cost-efficiency` — MCP vs API: Why AI Agents Burn So Many Tokens — and How Protocol Design Fixes It
   - `es` `mcp-vs-api-eficiencia-tokens-agentes-ia` — MCP vs API: Por qué los Agentes de IA Consumen Tantos Tokens — y Cómo el Diseño del Protocolo lo Soluciona
   - `id` `mcp-vs-api-efisiensi-biaya-token-ai-agent` — MCP vs API: Mengapa AI Agent Menghabiskan Terlalu Banyak Token — dan Bagaimana Desain Protokol Mengatasinya
   - `vi` `mcp-vs-api-ai-agent-token-cost-efficiency` — MCP vs API: Tại Sao AI Agent Đốt Quá Nhiều Token — và Cách Thiết Kế Giao Thức Giải Quyết Vấn Đề Này
2. ℹ️ single post, no translations found
   - `en` `what-is-google-gemini-enterprise-agent-platform-and-pricing` — The Agent That Passed the Demo and Failed on Monday: Inside Google's Gemini Enterprise Agent Platform

0 strong, 1 likely, 1 single, 0 needing review. Number 144 can stay with one cluster; every other cluster needs a free number.

## Also found: documents sharing one URL

**3 slugs are claimed by more than one document in the same language**, covering 7 documents. This is not an `articleNumber` problem and it is worse than one: a language and a slug together decide the URL, so only one of these documents can be served at `/<lang>/blog/<slug>/`. The build writes them in fetch order and the last one wins, which means the others are unreachable — their content is live in Sanity and absent from the site.

| Language | Slug | Documents | `articleNumber`s | Document IDs |
|---|---|---|---|---|
| en | `ai-token-pricing-models-comparison` | 3 | 1, 103, 51 | `NzB7IaLHdyz2K2TRSs0NQp` (2026-06-09)<br>`cxG6WGqtby4sD0hmXNirH1` (2026-06-10)<br>`lT0MJhwbFtcMofmR8I8IU1` (2026-06-04) |
| id | `memahami-mekanisme-token-ai` | 2 | 112, 130 | `7Ahi24M7FaSDiVrQoaHKUG` (2026-06-17)<br>`GWcybyvSzKo1HK4vzSXwsk` (2026-07-02) |
| en | `choosing-the-right-ai-model-for-your-needs` | 2 | 60, 60 | `g3jTIj9ubDWnGQfo9PLqB2` (2026-06-04)<br>`g3jTIj9ubDWnGQfo9PLqB2-en` (2026-06-04) |

Only one of these overlaps the collision list above, so fixing the numbers
alone would leave the rest in place. Each needs a decision in the Studio:
keep one document and delete the others, or give the survivors distinct slugs.

For context on the IDs: 136 documents carry a `-<language>` suffix, which is how the translation pipeline names a locale copy. A document whose suffix matches its own `language` — an `-en` document that is already English — is a copy the pipeline should not have made, and is worth checking first.

## Numbers that are free

Unused below the current maximum of 166: **102** (1 number).

Everything from **167** upward is also free.

Which to use depends on what the number should do to the ordering described
above. A gap low in the range promotes a post toward the home page; a number
above 166 sends it to the end of the fetch order and off the home page.

Resolving the 4 collisions needs **6 free numbers** if every suggested cluster keeps a distinct one.

## Context: numbers missing a locale

Not a collision and not a bug, but it shapes how many hreflang links a post gets. 29 number(s) are missing at least one locale:

| Missing locale(s) | Count | Numbers |
|---|---|---|
| vi | 22 | 51, 103, 122–141 |
| es, id, vi | 7 | 142–143, 145, 153–156 |

---

Re-run `node scripts/audit-article-numbers.mjs` after editing in the Studio to
confirm the collision count is zero.
