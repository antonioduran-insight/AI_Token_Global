# Champion post facts DRY RUN: 2026-11-24T10:44:03.530Z

Source: `audits/2026-11-24/champion-audit.csv` (branch antonio/champion-audit-2026-11-24), column claims_stale_or_wrong / typos_title_slug_headings.
Prices: `src/lib/pricing.ts`, read at run time — Claude Sonnet 5 $2.00/$10.00 (checked 2026-09-03) · Claude Opus 5 $5.00/$25.00 (checked 2026-09-03) · Claude Haiku 4.5 $1.00/$5.00 (checked 2026-09-03) · Gemini 3.5 Flash-Lite $0.30/$2.50 (checked 2026-09-03) · Gemini 3.1 Pro $2.00/$12.00 (checked 2026-09-03) — USD per 1M input/output tokens.
Only the span text of the blocks below changes. Title, slug, seo, excerpt, style and every other block are untouched.

## en · ai-token-vs-quota-explained

Document `VdSyE50eHa1ZkhVq3OmrQL` · _rev `KAAbgJhsj8A89jq2g6wAg2`

### `zqbxp1gj` (normal, span `zqbxp1gjc`) — token defined as a unit of processing power

Before:

> For instance, if a particular AI model requires 1000 units of processing power to complete a single task, and each unit is equivalent to one token, then you would need 1000 tokens to run that specific model. However, not all models consume the same amount of resources; some might require more or fewer tokens for the same task.

After:

> In practice, a token is a chunk of text: roughly ¾ of an English word, or about 4 characters, so 1,000 tokens is about 750 words. Your usage is the number of tokens you send in (input) plus the number the model writes back (output). Models use different tokenizers and charge different prices per token, so the same task can use a different number of tokens, and cost a different amount, on each model.

### `jhxescf5` (h3, span `jhxescf5c`) — "Subsection: " prefix in heading

Before:

> Subsection: Token vs Quota Limits

After:

> Token vs Quota Limits

### `anax9hxh` (normal, span `anax9hxhc`) — $0.10/token example, backwards "only $150" logic

Before:

> For instance, if you have $100 worth of credits in your account, and each token costs $0.10, then you can buy 1000 tokens with those credits. However, if the price per token increases to $0.15, your initial 1000 tokens would cost only $150.

After:

> For instance, if you have $100 worth of credits in your account and use Claude Sonnet 5, which charges $2.00 per 1 million input tokens, those credits cover 50 million input tokens. Switch to Claude Opus 5 at $5.00 per 1 million input tokens and the same $100 covers only 20 million. Output tokens cost more ($10.00 and $25.00 per 1 million respectively), so a real workload that mixes input and output gets fewer tokens for the same credits.

### `ib3eeq87` (h3, span `ib3eeq87c`) — "Subsection: " prefix in heading

Before:

> Subsection: Pay-Per-Use vs Tiered Pricing

After:

> Pay-Per-Use vs Tiered Pricing

## en · ai-token-input-output-explanation

Document `uomub2hTG94T3nqbFXOMbR` · _rev `uomub2hTG94T3nqbFXVGH2`

### `jqhoplw5` (normal, span `jqhoplw5c`) — Model A output price missing; conclusion unsupported; prices ~1,000x real

Before:

> For instance, Model A charges $0.01 per input token, while Model B charges $0.005 per input token but $0.05 per output token. If your application requires a high number of output tokens, Model A might be more cost-effective.

After:

> For instance, Model A (Claude Haiku 4.5) charges $1.00 per 1 million input tokens and $5.00 per 1 million output tokens, while Model B (Gemini 3.5 Flash-Lite) charges $0.30 and $2.50. A job that sends 100,000 input tokens and gets 1,000,000 output tokens back costs $0.10 + $5.00 = $5.10 on Model A and $0.03 + $2.50 = $2.53 on Model B. Output is about 98% of Model A's bill and 99% of Model B's, so if your application generates a lot of output tokens, compare output prices first: here that makes Model B the cheaper option by $2.57.

## en · ai-api-tokens-explained-for-beginners

Document `uomub2hTG94T3nqbFWRf9c` · _rev `VKNTFpWe8NfJwy5gVWDM6r`

### `by95mph8` (normal, span `by95mph8c`) — tokens "calculated based on the complexity of your request"

Before:

> AI API tokens are calculated based on the complexity of your request. This can include factors such as text length, query parameters, and even the AI model's processing power required.

After:

> AI API tokens are counted from the text itself: the input you send (your prompt, instructions and any conversation history) plus the output the model generates. The model's tokenizer splits that text into tokens, each roughly ¾ of an English word, and both the input and the output tokens count toward your usage.

### `oy34stad` (normal, span `oy34stadc`) — follow-up repeats the "complexity / processing requirements" claim

Before:

> For instance, if you're using a conversational AI model to generate responses for a customer service chatbot, the number of tokens used will depend on the complexity of the conversations and the model's processing requirements.

After:

> For instance, if you're using a conversational AI model to generate responses for a customer service chatbot, the number of tokens used will depend on how much text goes in (the customer's messages plus the conversation history sent with each request) and how long the model's replies are.

## en · why-does-claude-keep-cutting-off-mid-conversation

Document `aitk-en-150` · _rev `KAAbgJhsj8A89jq2g6wAg2`

### `b2` (normal, span `b2s0`) — "Chinese character" sentence left from the zh-TW source · sentence-only change

Before:

> A single Chinese character or English word is often split into one or more tokens.

After:

> A common English word is usually one token, while longer or rarer words get split into several.

## es · por-que-claude-sigue-interrumpiendo-la-conversacion-a-mitad-de-camino

Document `aitk-es-150` · _rev `KAAbgJhsj8A89jq2g6wAg2`

### `b2` (normal, span `b2s0`) — "carácter chino" sentence left from the zh-TW source · sentence-only change

Before:

> Un solo carácter chino o una palabra en inglés suele dividirse en uno o más tokens.

After:

> En español, una palabra corta y común suele ser un solo token, mientras que las palabras más largas o poco frecuentes se dividen en varios.

## en · geminiapi-vs-gemina-apps-for-beginners

Document `g3jTIj9ubDWnGQfo9PTTiG` · _rev `g3jTIj9ubDWnGQfo9PYx5A`

### `mwx1g3er` (normal, span `mwx1g3erc`) — "tiered pricing … discounts for bulk token purchases"

Before:

> The primary difference between Gemini API and Gemini Apps lies in their pricing models. Gemini API offers a tiered pricing structure based on token usage, with discounts available for bulk token purchases.

After:

> The primary difference between Gemini API and Gemini Apps lies in their pricing models. Gemini API is billed per token, with input and output tokens priced separately: Gemini 3.1 Pro, for example, costs $2.00 per 1 million input tokens and $12.00 per 1 million output tokens (Google's price as of September 3, 2026).

### `14ryqo61` (normal, span `14ryqo61c`) — made-up "basic, premium, and enterprise" plan tiers
Source: https://gemini.google/subscriptions/ (checked 2026-11-24)

Before:

> In contrast, Gemini Apps operates on a subscription-based model, with plans tailored to specific use cases and user requirements. Users can choose from various tiers, including basic, premium, and enterprise options, depending on their AI needs and budget.

After:

> In contrast, the Gemini app is not billed per token. It has a free version and paid monthly Google AI plans (Google AI Plus, Google AI Pro and Google AI Ultra).

## Guard skips: 0 (drafts not checked: no token in this dry run; --apply always checks)

## Would write: 11 span(s) in 6 document(s), ONE transaction, each pinned to the _rev read now

Undo: `node scripts/patch-champion-facts.mjs --revert` (dry run), then `SANITY_TOKEN=… … --revert --apply`.

