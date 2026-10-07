# Content corpus findings — 2026-10-07

Corpus: 723 published posts (en 193, es 184, id 184, vi 162), pulled 2026-10-07T08:48:54.724Z. Prices checked against `src/lib/pricing.ts` base fields. Full rows: `content-findings.csv` (4155 rows). This file reports; it does not recommend.

## 1. Price claims

3819 currency figures found. MISMATCH 124 (high confidence 23, low 101) · MATCH 51 · UNVERIFIABLE 3644.

Mismatches by model and locale:

| Model | en | es | id | vi | Total |
|---|---|---|---|---|---|
| GPT-5.6 Sol | 18 | 16 | 16 | 15 | 65 |
| GPT-5.6 Terra | 6 | 6 | 6 | 6 | 24 |
| GPT-5.6 Luna | 6 | 6 | 6 | 6 | 24 |
| Claude Opus 5 | 2 | 1 | 1 | 1 | 5 |
| Gemini 3.1 Pro | 1 | 1 | 1 | 1 | 4 |
| Claude Sonnet 5 | 2 | 0 | 0 | 0 | 2 |

Most frequent mismatched figures:

| Model | Figure | Expected | Posts | Confidence |
|---|---|---|---|---|
| Gemini 3.1 Pro | $0.02 | input $2.00 / output $12.00 | 4 | high |
| GPT-5.6 Sol | $4 | input $5.00 / output $30.00 | 4 | high |
| GPT-5.6 Sol | $4 | input $5.00 | 4 | high |
| GPT-5.6 Sol | $20 | output $30.00 | 4 | high |
| GPT-5.6 Sol | $75 | output $30.00 | 4 | high |
| GPT-5.6 Sol | $20 | input $5.00 / output $30.00 | 4 | low |
| GPT-5.6 Sol | $8 | input $5.00 | 4 | low |
| GPT-5.6 Terra | $4 | input $2.00 | 4 | low |
| GPT-5.6 Terra | $18 | output $12.00 | 4 | low |
| GPT-5.6 Luna | $0.4 | input $0.20 | 4 | low |
| GPT-5.6 Luna | $1.8 | output $1.20 | 4 | low |
| GPT-5.6 Sol | $40 | output $30.00 | 4 | low |
| GPT-5.6 Terra | $24 | output $12.00 | 4 | low |
| GPT-5.6 Luna | $2.4 | output $1.20 | 4 | low |
| GPT-5.6 Sol | $10 | output $30.00 | 4 | low |

## 2. Near-duplicates

Body: 0 same-language pairs above 0.7 (65241 pairs compared, translation clusters excluded). Titles: 3 pairs above 0.8. Same translationKey in one language: 0.


| Title score | Post A | Post B | |
|---|---|---|---|
| 1.000 | vi · Hướng Dẫn Sử Dụng Token AI Cho Người Mới Bắt Đầu | vi · Hướng Dẫn Sử Dụng Token AI cho Người Mới Bắt Đầu | same language |
| 0.867 | vi · Tiết Kiệm Chi Phí Token AI: Hướng Dẫn Tối Ưu Chi Phí Cho Người Mới | vi · Tiết Kiệm Chi Phí Token AI: Hướng Dẫn Cho Người Mới Về Tối Ưu Hóa Chi Phí | same language |
| 0.857 | en · Understanding AI Token: A Comprehensive Guide | en · Understanding AI Token Conversion: A Comprehensive Guide | same language |

Title prefixes: 19 groups of 3+ same-language posts share their first three title words (case-insensitive, leading articles ignored), covering 95 posts (en 6, es 5, id 6, vi 2 groups).

| Posts | Locale | First three words | Titles |
|---|---|---|---|
| 18 | en | understanding ai token | Understanding AI Token Pricing Models: A Beginner's Guide<br>Understanding AI Token Basics for a Smarter Future<br>Understanding AI Token: A Comprehensive Guide<br>Understanding AI Token vs Quota for Beginners<br>Understanding AI Token Basics for Beginners<br>Understanding AI Token Conversion: A Comprehensive Guide<br>Understanding AI Token Usage for Beginners<br>Understanding AI Token Pricing Structures<br>Understanding AI Token Pricing Models<br>Understanding AI Token Pricing for Beginners: A Step-by-Step Guide<br>Understanding AI Token Prepayment vs Postpayment<br>Understanding AI Token Management for Enterprises<br>Understanding AI Token: A Beginner's Guide to Basics and Cost Control<br>Understanding AI Token Usage Dashboard<br>Understanding AI Token Pricing Models: A Comparison Guide<br>Understanding AI Token Mechanics: How Tokens Power AI Models and Impact Costs<br>Understanding AI Token Basics: A Step-by-Step Guide for Beginners<br>Understanding AI Token Economics: How Tokens Power API Costs and Efficiency |
| 10 | vi | hiểu về token | Hiểu về Token AI: Hướng dẫn toàn diện<br>Hiểu về Token AI và Quota dành cho người mới bắt đầu<br>Hiểu về Token AI và API Key cho Người Mới Bắt Đầu<br>Hiểu Về Token AI: Sự Khác Biệt Giữa Tiếng Anh và Tiếng Trung<br>Hiểu Về Token AI: Hướng Dẫn Cơ Bản Và Kiểm Soát Chi Phí Cho Người Mới<br>Hiểu Về Token Hóa Trong Tài Chính: Kỷ Nguyên Mới Của Tài Sản Kỹ Thuật Số<br>Hiểu về Token AI: Hướng Dẫn Cho Người Mới về Tokenization trong API AI<br>Hiểu về Token AI: Hướng Dẫn Toàn Diện cho Nhà Phát Triển và Doanh Nghiệp<br>Hiểu về Token AI: Hướng dẫn cho Người Mới về Cách Chúng Hoạt Động và Tại Sao Chúng Quan Trọng<br>Hiểu Về Token Hóa Trong Các Nền Tảng AI: Hướng Dẫn Cho Người Mới |
| 8 | en | understanding ai tokens | Understanding AI Tokens and API Keys for Beginners<br>Understanding AI Tokens: The Difference Between English and Chinese<br>Understanding AI Tokens: A Beginner's Guide to Tokenization in AI APIs<br>Understanding AI Tokens: A Comprehensive Guide for Developers and Businesses<br>Understanding AI Tokens: A Developer's Guide to Managing API Costs<br>Understanding AI Tokens: A Beginner's Guide to How They Work and Why They Matter<br>Understanding AI Tokens: A Beginner's Guide to Tokenization and API Cost Basics<br>Understanding AI Tokens: A Beginner's Guide to API Token Mechanics |
| 6 | id | memahami token ai | Memahami Token AI vs Kuota untuk Pemula<br>Memahami Token AI dan Kunci API untuk Pemula<br>Memahami Token AI untuk Pemula<br>Memahami Token AI: Panduan Awal untuk Dasar-dasar dan Pengendalian Biaya<br>Memahami Token AI: Panduan Dasar untuk Pemula tentang Cara Kerja dan Pentingnya Token dalam Sistem AI<br>Memahami Token AI: Panduan untuk Pemula tentang Mekanika Token API |
| 6 | vi | tối ưu hóa | Tối Ưu Hóa Sử Dụng Token cho Hợp Đồng Pháp Lý Lớn: Hướng Dẫn Thực Tế<br>Tối Ưu Hóa Chi Phí Token AI của Claude Code cho Quá Trình Phát Triển Hiệu Quả<br>Tối Ưu Hóa Chi Phí API AI với View Transitions Theo Phạm Vi Phần Tử của Chrome<br>Tối Ưu Hóa Chi Phí API AI Với Chrome DevTools Automation<br>Tối Ưu Hóa Chi Phí API AI với Angular 17: Cách Các Tính Năng Mới Giảm Chi Phí Token<br>Tối ưu hóa chi phí token AI cho doanh nghiệp nhỏ |
| 5 | id | menghitung biaya token | Menghitung Biaya Token AI yang Mudah<br>Menghitung Biaya Token AI untuk Pengguna Pribadi<br>Menghitung Biaya Token AI Dijelaskan dengan Sederhana<br>Menghitung Biaya Token AI untuk Bisnis Kecil<br>Menghitung Biaya Token AI: Panduan Pengantar |
| 4 | en | understanding ai api | Understanding AI API Tokens: A Guide for Beginners<br>Understanding AI API Data Retention Explained<br>Understanding AI API Pricing: Token Fees vs Functionality Costs<br>Understanding AI API Platforms vs Chat Tools for Businesses and Developers |
| 4 | en | how to calculate | How to Calculate AI Token Costs for Enterprise Workloads<br>How to Calculate AI Token Costs for Your Business in 2024: A Step-by-Step Guide<br>How to Calculate AI Token Costs for Multilingual Applications<br>How to Calculate AI Token Costs for Your Project in 2026: A Step-by-Step Guide |
| 4 | es | entendiendo los tokens | Entendiendo los tokens de inteligencia artificial para principiantes<br>Entendiendo los Tokens de IA: Guía Completa para Desarrolladores y Empresas<br>Entendiendo los Tokens de IA: Guía Práctica para Gestión de Costos de APIs<br>Entendiendo los tokens de IA: Una guía para principiantes sobre tokenización y cálculo de costos de API |
| 3 | en | how to use | How to Use ChatGPT API for Beginners<br>How to Use AI Tokens for Beginners<br>How to Use Gemini 3.8 Flash TTS Voice Cloning: Voice Design, a 30-Second Sample, and Consent Risks Explained |
| 3 | en | optimizing ai token | Optimizing AI Token Costs with Chrome DevTools 148-150 Features<br>Optimizing AI Token Costs with Chrome DevTools Insights from Google I/O Connect Berlin<br>Optimizing AI Token Costs for Small Businesses |
| 3 | es | entendiendo los modelos | Entendiendo los modelos de precios de tokens AI: Una guía para principiantes<br>Entendiendo los modelos de precios de tokens de Inteligencia Artificial<br>Entendiendo los Modelos de Precios de Tokens de Inteligencia Artificial: Una Guía de Comparación |
| 3 | es | guía completa para | Guía completa para entender los tokens de inteligencia artificial<br>La Guía Completa para Evaluar a Vendedores de Inteligencia Artificial<br>La Guía Completa para Calcular los Costos de Tokens de Inteligencia Artificial para Pequeñas Empresas |
| 3 | es | cómo calcular los | Cómo Calcular los Costos de Tokens de IA para Cargas de Trabajo Empresariales<br>Cómo calcular los costos de tokens de IA para aplicaciones multilingües<br>Cómo calcular los costos de tokens de IA para tu proyecto en 2026 |
| 3 | es | optimización de costos | Optimización de costos de tokens de IA con características de Chrome DevTools 148-150<br>Optimización de Costos de Tokens de IA en el Desarrollo Web Moderno<br>Optimización de costos de tokens de IA con herramientas de desarrollo de Chrome desde Google I/O Connect Berlin |
| 3 | id | mengerti model harga | Mengerti Model Harga Token AI: Panduan Dasar<br>Mengerti Model Harga Token AI<br>Mengerti Model Harga Token AI: Panduan Perbandingan |
| 3 | id | mengerti harga token | Mengerti Harga Token Claude: Panduan Lengkap<br>Mengerti Harga Token AI untuk Pemula<br>Mengerti Harga Token GPT untuk Pemula |
| 3 | id | optimasi biaya token | Optimasi Biaya Token AI untuk Pemula<br>Optimasi Biaya Token AI dengan Pembaruan Google I/O 2026: WebMCP, Model Lokal, dan Fitur Skills<br>Optimasi Biaya Token AI untuk Usaha Kecil |
| 3 | id | cara menghitung biaya | Cara Menghitung Biaya Token AI untuk Bisnis Anda di 2024: Panduan Langkah Demi Langkah<br>Cara Menghitung Biaya Token AI untuk Aplikasi Multibahasa<br>Cara Menghitung Biaya Token AI untuk Proyek Anda Tahun 2026 |

## 3. Stale markers

| Marker | Posts | en | es | id | vi |
|---|---|---|---|---|---|
| year 2023 | 35 | 10 | 10 | 10 | 5 |
| year 2024 | 19 | 6 | 5 | 5 | 3 |
| GPT-4o | 12 | 4 | 4 | 4 | 0 |
| GPT-4 | 68 | 20 | 21 | 20 | 7 |
| Claude 3.5 | 0 | 0 | 0 | 0 | 0 |
| Claude 3 | 46 | 14 | 15 | 14 | 3 |
| Gemini 1.5 | 0 | 0 | 0 | 0 | 0 |
| Gemini 2 | 0 | 0 | 0 | 0 | 0 |
| phrase + date | 6 | 3 | 1 | 1 | 1 |

100 posts carry at least one marker.

## 4. Structure

| Check | Posts | en | es | id | vi |
|---|---|---|---|---|---|
| SHORT | 0 | 0 | 0 | 0 | 0 |
| NO_HEADINGS | 0 | 0 | 0 | 0 | 0 |
| EMPTY_BLOCKS | 12 | 3 | 3 | 3 | 3 |
| MISSING_TRANSLATION_KEY | 40 | 16 | 8 | 8 | 8 |

Keyless posts: 40 distinct articleNumbers across 40 posts (142–247); 24 non-en keyless posts reuse an en keyless slug, which is what the near-duplicate pass clusters them by.

## 5. Traffic join

Source: `Claude outputs/gsc-traffic-by-page-2026-10-07.csv`, 401 blog rows (3 "#fragment" rows folded into their post).

- **351 of 723 posts have no GSC row** and are marked impressions=0 (en 74/193, es 102/184, id 107/184, vi 68/162). Their avg_position is blank — there is no position to report.
- 372 posts matched a GSC row.
- 29 GSC blog rows match no current post (renamed or deleted slugs): `/es/blog/cmo-comprobar-el-uso-de-la-api-de-claude-veamos-primero-uso-facturacin-y-estos-4-campos/` (249 impr), `/en/blog/how-to-check-the-usage-of-ai-token-which-backend-number-is-the-most-important/` (47 impr), `/en/blog/approximately-how-many-ai-tokens-will-be-used-to-write-a-1000-word-article/` (44 impr), `/en/blog/what-is-the-price-of-ai-token-newbies-should-first-understand-where-the-fees-come-from/` (40 impr), `/es/blog/qu-es-la-api-chatgpt-en-qu-se-diferencia-de-chatgpt-y-para-qu-escenarios-de-uso-es-adecuado/` (35 impr), `/es/blog/qu-es-claude-api-cul-es-la-diferencia-entre-la-versin-de-chat-de-claude-y-quin-es-apto-para-usar/` (22 impr), `/en/blog/how-to-buy-ai-token-the-simplest-way-for-individual-users-to-understand/` (21 impr), `/es/blog/cmo-solicitar-la-clave-api-chatgpt-clasificando-el-proceso-de-activacin-por-primera-vez-para-nov/` (20 impr), `/es/blog/cmo-ver-la-facturacin-de-gemini-token-recopilacin-enfocada-de-costos-del-modelo-de-google/` (10 impr), `/es/blog/cmo-comprobar-el-uso-de-ai-token-los-principiantes-pueden-entender-los-nmeros-en-segundo-plano-s/` (8 impr), ….
