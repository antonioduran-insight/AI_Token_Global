# Champion pages (Sanity copy) DRY RUN: 2026-11-25T05:27:18.522Z

Source: `audits/2026-11-24/champion-audit.csv` (branch antonio/champion-audit-2026-11-24) and PR #56 "Copy in Sanity, left untouched".
Models by role from `src/lib/pricing.ts`, read at run time (USD per 1M input/output tokens): OpenAI everyday GPT-6.2 Sol $2.00/$10.00 (checked 2026-11-25) · OpenAI flagship GPT-6.2 Astra $8.00/$40.00 (checked 2026-11-25) · Anthropic everyday Claude Sonnet 5.5 $2.00/$10.00 (checked 2026-11-25) · Google everyday Gemini 3.8 Flash $1.50/$7.50 (checked 2026-11-25).
Only the fields below change. Every other field, block, span and mark is untouched.

## homePage-en · /en/

Document `homePage-en` · _rev `jOCtSpWch7UC6QC30F7aK3`

### `faq[_key=="1c0739d593ea"].answer[_key=="3c53c6c715ae"].children[_key=="3695c687b396"].text` — FAQ "1,000 AI API calls" cites GPT-4o mini / GPT-4o (not in pricing.ts)

Before:

> It depends heavily on the model and your average prompt/response length. For GPT-4o mini with short prompts (~500 tokens in, ~200 out), 1,000 calls would cost roughly $0.075–$0.15. For GPT-4o with longer conversations, the same 1,000 calls could cost $5–$20. Use our Token Calculator to estimate your specific scenario.

After:

> It depends heavily on the model and your average prompt/response length. With GPT-6.2 Sol ($2.00 per 1M input tokens, $10.00 per 1M output tokens) and short prompts (~500 tokens in, ~200 out), 1,000 calls cost 1,000 × (500 × $2.00 + 200 × $10.00) ÷ 1,000,000 = $3.00. With GPT-6.2 Astra ($8.00 / $40.00) and longer conversations (~2,000 tokens in, ~500 out), the same 1,000 calls cost 1,000 × (2,000 × $8.00 + 500 × $40.00) ÷ 1,000,000 = $36.00. Prices as of November 25, 2026. Use our Token Calculator to estimate your specific scenario.

### `heroStats[_key=="94f2946a6713"].statNumber` — hero stat: AI Token King catalog lists 146 models (2026-11-25)

Before:

> 60+

After:

> 140+

## homePage-es · /es/

Document `homePage-es` · _rev `msX1xboyN0yvLlOgnJXtc8`

### `faq[_key=="1c0739d593ea"].answer[_key=="3c53c6c715ae"].children[_key=="3695c687b396"].text` — FAQ "1,000 AI API calls" cites GPT-4o mini / GPT-4o (not in pricing.ts)

Before:

> Depende en gran medida del modelo y de la longitud promedio de tus prompts y respuestas. Con GPT-4o mini y prompts cortos (~500 tokens de entrada, ~200 de salida), 1,000 llamadas costarían aproximadamente $0.075–$0.15. Con GPT-4o y conversaciones más largas, esas mismas 1,000 llamadas podrían costar entre $5 y $20. Usa nuestra Calculadora de Tokens para estimar tu escenario específico.

After:

> Depende en gran medida del modelo y de la longitud promedio de tus prompts y respuestas. Con GPT-6.2 Sol ($2.00 por 1M de tokens de entrada y $10.00 por 1M de tokens de salida) y prompts cortos (~500 tokens de entrada, ~200 de salida), 1,000 llamadas cuestan 1,000 × (500 × $2.00 + 200 × $10.00) ÷ 1,000,000 = $3.00. Con GPT-6.2 Astra ($8.00 / $40.00) y conversaciones más largas (~2,000 tokens de entrada, ~500 de salida), esas mismas 1,000 llamadas cuestan 1,000 × (2,000 × $8.00 + 500 × $40.00) ÷ 1,000,000 = $36.00. Precios al 25 de noviembre de 2026. Usa nuestra Calculadora de Tokens para estimar tu escenario específico.

### `heroStats[_key=="94f2946a6713"].statNumber` — hero stat: AI Token King catalog lists 146 models (2026-11-25)

Before:

> 60+

After:

> 140+

### `faq[_key=="6915e6383bc5"].answer[_key=="949420912f4d"].children[_key=="73911c7d59ef"].text` — FAQ "¿Qué es una API de Modelo?" names GPT-4o as an example model · phrase-only change

Before:

> GPT-4o, Claude o Gemini

After:

> GPT-6.2 Sol, Claude Sonnet 5.5 o Gemini 3.8 Flash

## homePage-id · /id/

Document `homePage-id` · _rev `kTT88iozTCUfRl76jshxjy`

### `faq[_key=="1c0739d593ea"].answer[_key=="3c53c6c715ae"].children[_key=="3695c687b396"].text` — FAQ "1,000 AI API calls" cites GPT-4o mini / GPT-4o (not in pricing.ts)

Before:

> Sangat tergantung pada model dan rata-rata panjang prompt/respons kamu. Untuk GPT-4o mini dengan prompt pendek (~500 token masuk, ~200 keluar), 1.000 panggilan akan menelan biaya sekitar $0,075–$0,15. Untuk GPT-4o dengan percakapan lebih panjang, 1.000 panggilan yang sama bisa mencapai $5–$20. Gunakan Kalkulator Token kami untuk memperkirakan skenario spesifikmu.

After:

> Sangat tergantung pada model dan rata-rata panjang prompt/respons kamu. Dengan GPT-6.2 Sol ($2,00 per 1 juta token input, $10,00 per 1 juta token output) dan prompt pendek (~500 token masuk, ~200 keluar), 1.000 panggilan menelan biaya 1.000 × (500 × $2,00 + 200 × $10,00) ÷ 1.000.000 = $3,00. Dengan GPT-6.2 Astra ($8,00 / $40,00) dan percakapan lebih panjang (~2.000 token masuk, ~500 keluar), 1.000 panggilan yang sama mencapai 1.000 × (2.000 × $8,00 + 500 × $40,00) ÷ 1.000.000 = $36,00. Harga per 25 November 2026. Gunakan Kalkulator Token kami untuk memperkirakan skenario spesifikmu.

### `heroStats[_key=="94f2946a6713"].statNumber` — hero stat: AI Token King catalog lists 146 models (2026-11-25)

Before:

> 60+

After:

> 140+

## homePage-vi · /vi/

Document `homePage-vi` · _rev `HGC0i0hV3qn3DmfUOXsBnT`

### `faq[_key=="1c0739d593ea"].answer[_key=="3c53c6c715ae"].children[_key=="3695c687b396"].text` — FAQ "1,000 AI API calls" cites GPT-4o mini / GPT-4o (not in pricing.ts)

Before:

> Điều này phụ thuộc nhiều vào mô hình và độ dài prompt/phản hồi trung bình của bạn. Với GPT-4o mini và prompt ngắn (~500 token đầu vào, ~200 đầu ra), 1.000 lệnh gọi sẽ tốn khoảng $0.075–$0.15. Với GPT-4o và các cuộc hội thoại dài hơn, 1.000 lệnh gọi tương tự có thể tốn $5–$20. Hãy dùng Máy tính Token của chúng tôi để ước tính cho tình huống cụ thể của bạn.

After:

> Điều này phụ thuộc nhiều vào mô hình và độ dài prompt/phản hồi trung bình của bạn. Với GPT-6.2 Sol ($2.00 cho mỗi 1 triệu token đầu vào, $10.00 cho mỗi 1 triệu token đầu ra) và prompt ngắn (~500 token đầu vào, ~200 đầu ra), 1.000 lệnh gọi tốn 1.000 × (500 × $2.00 + 200 × $10.00) ÷ 1.000.000 = $3.00. Với GPT-6.2 Astra ($8.00 / $40.00) và các cuộc hội thoại dài hơn (~2.000 token đầu vào, ~500 đầu ra), 1.000 lệnh gọi tương tự tốn 1.000 × (2.000 × $8.00 + 500 × $40.00) ÷ 1.000.000 = $36.00. Giá tính đến 25 tháng 11, 2026. Hãy dùng Máy tính Token của chúng tôi để ước tính cho tình huống cụ thể của bạn.

### `heroStats[_key=="94f2946a6713"].statNumber` — hero stat: AI Token King catalog lists 146 models (2026-11-25)

Before:

> 60+

After:

> 140+

## apiComparePage-en · /en/api-compare/

Document `apiComparePage-en` · _rev `Qgw4f4CopAxmRMOCwzy7dO`

### `faq[_key=="9e4f450fb294"].answer[_key=="d36012b574fd"].children[_key=="fdac3c3d6ded"].text` — FAQ 4 recommends GPT-4o (not in pricing.ts)

Before:

> . We recommend beginning with established models like GPT-4o or Claude Sonnet, as they have the best documentation and largest community support.

After:

> . We recommend starting with an everyday model such as GPT-6.2 Sol or Claude Sonnet 5.5. They cost much less than the flagship models (GPT-6.2 Sol: $2.00 per 1M input tokens and $10.00 per 1M output tokens, vs $8.00 and $40.00 for GPT-6.2 Astra), and you can move up to a flagship when a task needs it.

## apiComparePage-es · /es/api-compare/

Document `apiComparePage-es` · _rev `LJTww3gscvOUdq4I6yaSSI`

### `faq[_key=="9e4f450fb294"].answer[_key=="d36012b574fd"].children[_key=="fdac3c3d6ded"].text` — FAQ 4 recommends GPT-4o (not in pricing.ts)

Before:

> . Te recomendamos empezar con modelos consolidados como GPT-4o o Claude Sonnet, ya que cuentan con la mejor documentación y el mayor soporte de la comunidad.

After:

> . Te recomendamos empezar con un modelo de uso diario como GPT-6.2 Sol o Claude Sonnet 5.5. Cuestan mucho menos que los modelos insignia (GPT-6.2 Sol: $2.00 por 1M de tokens de entrada y $10.00 por 1M de tokens de salida, frente a $8.00 y $40.00 de GPT-6.2 Astra), y puedes pasar a un modelo insignia cuando una tarea lo requiera.

## apiComparePage-id · /id/api-compare/

Document `apiComparePage-id` · _rev `I0GYJbFQTSVGZqGEVEQoHG`

### `faq[_key=="9e4f450fb294"].answer[_key=="d36012b574fd"].children[_key=="fdac3c3d6ded"].text` — FAQ 4 recommends GPT-4o (not in pricing.ts)

Before:

> . Kami sarankan untuk mulai dengan model-model mapan seperti GPT-4o atau Claude Sonnet, karena keduanya memiliki dokumentasi terbaik dan dukungan komunitas terbesar.

After:

> . Kami sarankan mulai dengan model sehari-hari seperti GPT-6.2 Sol atau Claude Sonnet 5.5. Biayanya jauh lebih murah daripada model unggulan (GPT-6.2 Sol: $2,00 per 1 juta token input dan $10,00 per 1 juta token output, dibandingkan $8,00 dan $40,00 untuk GPT-6.2 Astra), dan kamu bisa beralih ke model unggulan saat tugasnya membutuhkan.

## apiComparePage-vi · /vi/api-compare/

Document `apiComparePage-vi` · _rev `97luqmnzEkVELN5ug5L6Ba`

### `faq[_key=="9e4f450fb294"].answer[_key=="d36012b574fd"].children[_key=="fdac3c3d6ded"].text` — FAQ 4 recommends GPT-4o (not in pricing.ts)

Before:

> . Chúng tôi khuyên bạn nên bắt đầu với các mô hình đã được kiểm chứng như GPT-4o hoặc Claude Sonnet, vì chúng có tài liệu tốt nhất và cộng đồng hỗ trợ lớn nhất.

After:

> . Chúng tôi khuyên bạn nên bắt đầu với một mô hình dùng hằng ngày như GPT-6.2 Sol hoặc Claude Sonnet 5.5. Chúng rẻ hơn nhiều so với các mô hình hàng đầu (GPT-6.2 Sol: $2.00 cho mỗi 1 triệu token đầu vào và $10.00 cho mỗi 1 triệu token đầu ra, so với $8.00 và $40.00 của GPT-6.2 Astra), và bạn có thể chuyển sang mô hình hàng đầu khi tác vụ cần.

## tokenCalculatorPage-id · /id/token-calculator/

Document `tokenCalculatorPage-id` · _rev `KAAbgJhsj8A89jq2g6wAg2`

### `heroHeadline` — H1 in English on the id page; target "kalkulator token AI"

Before:

> AI Token Calculator

After:

> Kalkulator Token AI

### `seo.seoTitle` — <title> in English on the id page; target "kalkulator token AI"

Before:

> AI Token Calculator — Estimasi Biaya Seketika

After:

> Kalkulator Token AI — Hitung Token & Estimasi Biaya API

## Guard skips: 0 (drafts not checked: no token in this dry run; --apply always checks)

## Would write: 15 field(s) in 9 document(s), ONE transaction, each pinned to the _rev read now

Undo: `node scripts/patch-champion-pages.mjs --revert` (dry run), then `SANITY_TOKEN=… … --revert --apply`.

