# High-confidence price mismatches: extract, 2026-10-07

There are 19 rows from `content-findings.csv` (status MISMATCH, confidence high), across 9 posts in 3 article clusters. The 4 GPT-5.6 Cyber `$75` rows are excluded as false positives. Each sentence is quoted verbatim from the live Sanity block (fetched read-only 2026-10-07). When one sentence carries two flagged figures it appears once, with both figures listed. "Other figures in the sentence" lists every other price the analyser found there, with its status, so a replacement sentence can fix them together.

Correct prices, from `src/lib/pricing.ts`:

- **GPT-5.6 Sol**: $5.00 input / $30.00 output per 1M tokens
- **Gemini 3.1 Pro**: $2.00 input / $12.00 output per 1M tokens
- **Claude Sonnet 5**: $2.00 input / $10.00 output per 1M tokens

## GPT-5.6 Sol price cut (25 Aug 2026)

The temporary $4 / $20 rate is no longer on openai.com/api/pricing (checked 2026-10-07); Sol is $5.00 / $30.00 again.

**Linked by translationKey: yes.** All 4 locales carry `fafa6a9b-de6b-4f03-8278-a230e528b773` (articleNumber 173), so `*[_type=="post" && translationKey=="fafa6a9b-de6b-4f03-8278-a230e528b773"]` finds every one.

### en · `gpt-5-6-sol-price-cut-2026-vs-claude-opus-5`

- _id: `YDnwDiutEyNP1AlOwQpDHa`
- publishedAt: 2026-08-25T07:00:00.000Z

**Block `b0`** (normal)

> On August 21, 2026, OpenAI officially cut API pricing for GPT-5.6 Sol again: input dropped from $5 to $4 per million tokens, and output dropped from $30 to $20 — a cut of more than 20%, running through at least November 21.

- Figure **$4** · model GPT-5.6 Sol · text says unspecified side · correct: input $5.00 / output $30.00
- Other figures in the sentence: $20 (MISMATCH, low, GPT-5.6 Sol); $5 (MATCH, GPT-5.6 Sol); $30 (MATCH, GPT-5.6 Sol)

**Block `b33`** (normal)

> Put the two official price sheets side by side: GPT-5.6 Sol (Standard, short context) is $4.00 input / $20.00 output; Claude Opus 5 (Standard) is $5 input / $25 output.

- Figure **$4.00** · model GPT-5.6 Sol · text says input · correct: input $5.00
- Figure **$20.00** · model GPT-5.6 Sol · text says output · correct: output $30.00
- Other figures in the sentence: $5 (MATCH, Claude Opus 5); $25 (MATCH, Claude Opus 5)

### es · `gpt-5-6-baja-de-precio-vs-claude-opus-5`

- _id: `HgaihXXCLvBQsD0m2g8fSQ`
- publishedAt: 2026-08-25T07:00:00.000Z

**Block `b0`** (normal)

> El 21 de agosto de 2026, OpenAI recortó oficialmente de nuevo el precio de la API de GPT-5.6 Sol: la entrada bajó de 5 a 4 dólares por millón de tokens, y la salida bajó de 30 a 20 dólares, una reducción de más del 20%, vigente al menos hasta el 21 de noviembre.

- Figure **4 dólares** · model GPT-5.6 Sol · text says input · correct: input $5.00
- Figure **20 dólares** · model GPT-5.6 Sol · text says output · correct: output $30.00

**Block `b33`** (normal)

> Poniendo lado a lado los precios oficiales de ambos: GPT-5.6 Sol (Standard, contexto corto) cuesta $4.00 de entrada / $20.00 de salida; Claude Opus 5 (Standard) cuesta $5 de entrada / $25 de salida.

- Figure **$4.00** · model GPT-5.6 Sol · text says input · correct: input $5.00
- Figure **$20.00** · model GPT-5.6 Sol · text says output · correct: output $30.00
- Other figures in the sentence: $5 (MATCH, Claude Opus 5); $25 (MATCH, Claude Opus 5)

### id · `gpt-5-6-sol-price-cut-2026-vs-claude-opus-5`

- _id: `HgaihXXCLvBQsD0m2g8jEc`
- publishedAt: 2026-08-25T07:00:00.000Z

**Block `b0`** (normal)

> Pada 21 Agustus 2026, OpenAI resmi memangkas lagi harga API GPT-5.6 Sol: harga input turun dari $5 menjadi $4 per juta token, dan harga output turun dari $30 menjadi $20, penurunan lebih dari 20%, promo ini berlaku setidaknya hingga 21 November.

- Figure **$4** · model GPT-5.6 Sol · text says unspecified side · correct: input $5.00 / output $30.00
- Other figures in the sentence: $20 (MISMATCH, low, GPT-5.6 Sol); $5 (MATCH, GPT-5.6 Sol); $30 (MATCH, GPT-5.6 Sol)

**Block `b33`** (normal)

> Kalau kita bandingkan kedua harga resmi berdampingan: GPT-5.6 Sol (Standard, konteks pendek) adalah $4.00 input / $20.00 output; Claude Opus 5 (Standard) adalah $5 input / $25 output.

- Figure **$4.00** · model GPT-5.6 Sol · text says input · correct: input $5.00
- Figure **$20.00** · model GPT-5.6 Sol · text says output · correct: output $30.00
- Other figures in the sentence: $5 (MATCH, Claude Opus 5); $25 (MATCH, Claude Opus 5)

### vi · `gpt-5-6-sol-price-cut-2026-vs-claude-opus-5`

- _id: `HgaihXXCLvBQsD0m2g8laz`
- publishedAt: 2026-08-25T07:00:00.000Z

**Block `b0`** (normal)

> Ngày 21 tháng 8 năm 2026, OpenAI chính thức cắt giảm giá API của GPT-5.6 Sol thêm một lần nữa: giá đầu vào giảm từ 5 xuống 4 USD mỗi triệu token, giá đầu ra giảm từ 30 xuống 20 USD, mức giảm hơn 20%, khuyến mãi kéo dài ít nhất đến ngày 21 tháng 11.

- Figure **4 USD** · model GPT-5.6 Sol · text says input · correct: input $5.00
- Other figures in the sentence: 20 USD (UNVERIFIABLE)

**Block `b33`** (normal)

> Đặt hai bảng giá chính thức cạnh nhau để so sánh: GPT-5.6 Sol (Standard, ngữ cảnh ngắn) có giá $4.00 đầu vào / $20.00 đầu ra; Claude Opus 5 (Standard) có giá $5 đầu vào / $25 đầu ra.

- Figure **$4.00** · model GPT-5.6 Sol · text says input · correct: input $5.00
- Figure **$20.00** · model GPT-5.6 Sol · text says output · correct: output $30.00
- Other figures in the sentence: $5 (MATCH, Claude Opus 5); $25 (MATCH, Claude Opus 5)

## AI model comparison 2026 (Gemini 3.1 Pro "$0.020 per token")

$0.020 per token is $20,000 per 1M tokens.

The es and id posts carry this block (`lmbjugq0`) in **untranslated English**, so the replacement for those two needs Spanish and Indonesian wording, not a figure swap.

**Linked by translationKey: yes.** All 4 locales carry `bb266270-1be1-4837-915e-9b1189547c4c` (articleNumber 55), so `*[_type=="post" && translationKey=="bb266270-1be1-4837-915e-9b1189547c4c"]` finds every one.

### en · `ai-model-comparison-2026-price-speed-use-cases`

- _id: `lT0MJhwbFtcMofmR8IAAnJ`
- publishedAt: 2026-06-04T16:45:50.198Z

**Block `lmbjugq0`** (normal)

> According to Google's pricing plan, Gemini 3.1 Pro costs $0.020 per token, which is significantly lower than GPT-5.4.

- Figure **$0.020** · model Gemini 3.1 Pro · text says unspecified side · correct: input $2.00 / output $12.00

### es · `comparacion-de-modelos-de-inteligencia-artificial-para-2026`

- _id: `PXBreekz6ug9jLuKVwmbYV`
- publishedAt: 2026-06-04T16:45:51.086Z

**Block `lmbjugq0`** (normal)

> According to Google's pricing plan, Gemini 3.1 Pro costs $0.020 per token, which is significantly lower than GPT-5.4.

- Figure **$0.020** · model Gemini 3.1 Pro · text says unspecified side · correct: input $2.00 / output $12.00

### id · `perbandingan-model-ai-harga-kecepatan-aplikasi`

- _id: `lT0MJhwbFtcMofmR8IADGr`
- publishedAt: 2026-06-04T16:45:52.669Z

**Block `lmbjugq0`** (normal)

> According to Google's pricing plan, Gemini 3.1 Pro costs $0.020 per token, which is significantly lower than GPT-5.4.

- Figure **$0.020** · model Gemini 3.1 Pro · text says unspecified side · correct: input $2.00 / output $12.00

### vi · `ai-model-comparison-2026-price-speed-use-cases`

- _id: `lT0MJhwbFtcMofmR8IAAnJ-vi`
- publishedAt: 2026-06-04T16:45:50.198Z

**Block `lmbjugq0`** (normal)

> Theo bảng giá của Google, Gemini 3.1 Pro có giá $0.020 mỗi token, thấp hơn đáng kể so với GPT-5.4.

- Figure **$0.020** · model Gemini 3.1 Pro · text says unspecified side · correct: input $2.00 / output $12.00

## What is Claude Sonnet 5

The $3 / $15 rise from 1 Sept 2026 was cancelled (Anthropic; see #34). $2 / $10 is the standard price.

**Linked by translationKey: no.** `aitk-en-155` has no translationKey. No es/id/vi translation of this post exists, so there is nothing to keep in sync; but if one is ever made, it will not be findable from this post.

### en · `what-is-claude-sonnet-5`

- _id: `aitk-en-155`
- publishedAt: 2026-07-31T05:00:00.000Z

**Block `b21`** (normal)

> Per Anthropic's official announcement, the introductory price ($2 per million input tokens, $10 per million output tokens) runs through August 31, 2026, after which it reverts to standard pricing ($3 per million input tokens, $15 per million output tokens).

- Figure **$3** · model Claude Sonnet 5 · text says input · correct: input $2.00
- Figure **$15** · model Claude Sonnet 5 · text says output · correct: output $10.00
- Other figures in the sentence: $2 (MATCH, Claude Sonnet 5); $10 (UNVERIFIABLE)
