# Champion post facts DRY RUN: 2026-11-25T05:59:23.272Z

Source: `audits/2026-11-24/champion-audit.csv` (branch antonio/champion-audit-2026-11-24), column claims_stale_or_wrong / typos_title_slug_headings.
Prices: `src/lib/pricing.ts`, read at run time — Claude Sonnet 5.5 $2.00/$10.00 (checked 2026-11-25) · Claude Fable 5.2 $8.00/$40.00 (checked 2026-11-25) · Gemini 3.8 Flash $1.50/$7.50 (checked 2026-11-25) · Gemini 4 Argon $4.00/$20.00 (checked 2026-11-25) — USD per 1M input/output tokens.
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

> For instance, if you have $100 worth of credits in your account and use Claude Sonnet 5.5, which charges $2.00 per 1 million input tokens, those credits cover 50 million input tokens. Switch to Claude Fable 5.2 at $8.00 per 1 million input tokens and the same $100 covers only 12.5 million. Output tokens cost more ($10.00 and $40.00 per 1 million respectively), so a real workload that mixes input and output gets fewer tokens for the same credits.

### `ib3eeq87` (h3, span `ib3eeq87c`) — "Subsection: " prefix in heading

Before:

> Subsection: Pay-Per-Use vs Tiered Pricing

After:

> Pay-Per-Use vs Tiered Pricing

### `d63528ga` (normal, span `d63528gac`) — token defined as "a unit of processing volume"

Before:

> At its core, an AI token represents a unit of processing volume used by AI models. It's akin to a currency that enables you to access and utilize the computing power of these sophisticated algorithms. The value of an AI token varies depending on several factors, including the complexity of the task, the type of model, and even the provider's pricing strategy. Understanding how tokens are calculated can help you anticipate your costs better.

After:

> At its core, an AI token is a chunk of text that an AI model reads or writes: often a whole word, sometimes part of a word, a punctuation mark or a space. Providers count the tokens you send in and the tokens the model writes back, and charge a price per million tokens that depends on the model. Understanding how tokens are counted can help you anticipate your costs better.

### `j5zo08ha` (normal, span `j5zo08hac`) — unsourced "discounts for bulk purchases" claim

Before:

> Each AI platform has its own pricing strategy for tokens, which can range from pay-per-use to tiered pricing. Some providers offer discounts for bulk purchases or long-term commitments, while others might charge extra for premium services or support.

After:

> Each AI platform has its own pricing strategy for tokens, which can range from pay-per-use to tiered pricing. Prices usually differ from model to model, and input and output tokens are often priced separately.

## en · ai-token-input-output-explanation

Document `uomub2hTG94T3nqbFXOMbR` · _rev `uomub2hTG94T3nqbFXVGH2`

### `jqhoplw5` (normal, span `jqhoplw5c`) — Model A output price missing; conclusion unsupported; prices ~1,000x real

Before:

> For instance, Model A charges $0.01 per input token, while Model B charges $0.005 per input token but $0.05 per output token. If your application requires a high number of output tokens, Model A might be more cost-effective.

After:

> For instance, Model A (Claude Sonnet 5.5) charges $2.00 per 1 million input tokens and $10.00 per 1 million output tokens, while Model B (Gemini 3.8 Flash) charges $1.50 and $7.50. A job that sends 100,000 input tokens and gets 1,000,000 output tokens back costs $0.20 + $10.00 = $10.20 on Model A and $0.15 + $7.50 = $7.65 on Model B. Output is about 98% of both bills, so if your application generates a lot of output tokens, compare output prices first: here that makes Model B the cheaper option by $2.55.

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

> The primary difference between Gemini API and Gemini Apps lies in their pricing models. Gemini API is billed per token, with input and output tokens priced separately: Gemini 4 Argon, for example, costs $4.00 per 1 million input tokens and $20.00 per 1 million output tokens (Google's regular price, checked November 25, 2026).

### `14ryqo61` (normal, span `14ryqo61c`) — made-up "basic, premium, and enterprise" plan tiers
Source: https://gemini.google/subscriptions/ (checked 2026-11-24)

Before:

> In contrast, Gemini Apps operates on a subscription-based model, with plans tailored to specific use cases and user requirements. Users can choose from various tiers, including basic, premium, and enterprise options, depending on their AI needs and budget.

After:

> In contrast, the Gemini app is not billed per token. It has a free version and paid monthly Google AI plans (Google AI Plus, Google AI Pro and Google AI Ultra).

## vi · ai-token-vs-quota-explained

Document `VdSyE50eHa1ZkhVq3OmrQL-vi` · _rev `7PTiuFKp5NOfYngu8ZUSP8`

### `zqbxp1gj` (normal, span `zqbxp1gjc`) — token defined as a unit of processing power

Before:

> Ví dụ, nếu một mô hình AI cụ thể cần 1000 đơn vị sức mạnh xử lý để hoàn thành một tác vụ, và mỗi đơn vị tương đương một token, thì bạn sẽ cần 1000 token để chạy mô hình đó. Tuy nhiên, không phải tất cả các mô hình đều tiêu thụ cùng một lượng tài nguyên — một số có thể cần nhiều hoặc ít token hơn cho cùng một tác vụ.

After:

> Trên thực tế, token là một mẩu văn bản: khoảng ¾ một từ tiếng Anh, tức chừng 4 ký tự, nên 1.000 token tương đương khoảng 750 từ tiếng Anh. Mức sử dụng của bạn là số token bạn gửi vào (đầu vào) cộng với số token mô hình trả về (đầu ra). Mỗi mô hình có bộ tách token (tokenizer) và mức giá riêng, nên cùng một tác vụ có thể dùng số token khác nhau và tốn chi phí khác nhau trên từng mô hình.

### `jhxescf5` (h3, span `jhxescf5c`) — "Tiểu mục: " prefix in heading

Before:

> Tiểu mục: So sánh giới hạn Token và Quota

After:

> So sánh giới hạn Token và Quota

### `anax9hxh` (normal, span `anax9hxhc`) — $0.10/token example

Before:

> Ví dụ, nếu bạn có $100 credits trong tài khoản và mỗi token có giá $0.10, thì bạn có thể mua 1000 token với số credits đó. Tuy nhiên, nếu giá mỗi token tăng lên $0.15, thì 1000 token ban đầu sẽ có giá $150.

After:

> Ví dụ, nếu bạn có $100 credits trong tài khoản và dùng Claude Sonnet 5.5, với giá $2.00 cho mỗi 1 triệu token đầu vào, số credits đó đủ cho 50 triệu token đầu vào. Nếu chuyển sang Claude Fable 5.2 với giá $8.00 cho mỗi 1 triệu token đầu vào, cùng $100 chỉ đủ cho 12,5 triệu token. Token đầu ra đắt hơn (lần lượt $10.00 và $40.00 cho mỗi 1 triệu token), nên một khối lượng công việc thực tế có cả đầu vào lẫn đầu ra sẽ nhận được ít token hơn với cùng số credits.

### `ib3eeq87` (h3, span `ib3eeq87c`) — "Tiểu mục: " prefix in heading

Before:

> Tiểu mục: Pay-Per-Use và Định giá theo tầng

After:

> Pay-Per-Use và Định giá theo tầng

### `d63528ga` (normal, span `d63528gac`) — token defined as "a unit of processing volume"

Before:

> Về cơ bản, một token AI đại diện cho một đơn vị khối lượng xử lý mà các mô hình AI sử dụng. Bạn có thể coi nó như một loại tiền tệ cho phép bạn truy cập và tận dụng sức mạnh tính toán của các thuật toán tinh vi này. Giá trị của một token AI thay đổi tùy thuộc vào nhiều yếu tố, bao gồm độ phức tạp của tác vụ, loại mô hình, và thậm chí cả chiến lược định giá của nhà cung cấp. Hiểu cách token được tính toán sẽ giúp bạn dự đoán chi phí tốt hơn.

After:

> Về cơ bản, một token AI là một mẩu văn bản mà mô hình AI đọc hoặc viết ra: thường là cả một từ, đôi khi là một phần của từ, một dấu câu hoặc một khoảng trắng. Nhà cung cấp đếm số token bạn gửi vào và số token mô hình trả về, rồi tính phí theo mức giá cho mỗi 1 triệu token, tùy theo từng mô hình. Hiểu cách token được đếm sẽ giúp bạn dự đoán chi phí tốt hơn.

### `j5zo08ha` (normal, span `j5zo08hac`) — unsourced "discounts for bulk purchases" claim

Before:

> Mỗi nền tảng AI có chiến lược định giá token riêng, có thể dao động từ trả theo lượng sử dụng (pay-per-use) đến định giá theo tầng (tiered pricing). Một số nhà cung cấp cung cấp chiết khấu cho việc mua số lượng lớn hoặc cam kết dài hạn, trong khi những nhà cung cấp khác có thể tính thêm phí cho các dịch vụ hoặc hỗ trợ cao cấp.

After:

> Mỗi nền tảng AI có chiến lược định giá token riêng, có thể dao động từ trả theo lượng sử dụng (pay-per-use) đến định giá theo tầng (tiered pricing). Giá thường khác nhau giữa các mô hình, và token đầu vào và đầu ra thường được tính giá riêng.

## vi · ai-token-input-output-explanation

Document `uomub2hTG94T3nqbFXOMbR-vi` · _rev `7PTiuFKp5NOfYngu8ZRXhs`

### `jqhoplw5` (normal, span `jqhoplw5c`) — Model A output price missing; conclusion unsupported; prices ~1,000x real

Before:

> Ví dụ, Mô hình A tính $0.01 cho mỗi token đầu vào, trong khi Mô hình B tính $0.005 cho mỗi token đầu vào nhưng $0.05 cho mỗi token đầu ra. Nếu ứng dụng của bạn cần nhiều token đầu ra, Mô hình A có thể tiết kiệm chi phí hơn.

After:

> Ví dụ, Mô hình A (Claude Sonnet 5.5) tính $2.00 cho mỗi 1 triệu token đầu vào và $10.00 cho mỗi 1 triệu token đầu ra, trong khi Mô hình B (Gemini 3.8 Flash) tính $1.50 và $7.50. Một tác vụ gửi 100.000 token đầu vào và nhận về 1.000.000 token đầu ra tốn $0.20 + $10.00 = $10.20 trên Mô hình A và $0.15 + $7.50 = $7.65 trên Mô hình B. Đầu ra chiếm khoảng 98% của cả hai hóa đơn, vì vậy nếu ứng dụng của bạn tạo ra nhiều token đầu ra, hãy so sánh giá đầu ra trước: trong ví dụ này, Mô hình B rẻ hơn $2.55.

## vi · ai-api-tokens-explained-for-beginners

Document `uomub2hTG94T3nqbFWRf9c-vi` · _rev `7PTiuFKp5NOfYngu8ZNru8`

### `by95mph8` (normal, span `by95mph8c`) — tokens "calculated based on the complexity of your request"

Before:

> Token AI qua API được tính toán dựa trên độ phức tạp của yêu cầu. Các yếu tố ảnh hưởng có thể bao gồm độ dài văn bản, tham số truy vấn, và thậm chí cả sức mạnh xử lý mà mô hình AI cần dùng.

After:

> Token AI qua API được đếm từ chính văn bản: phần đầu vào bạn gửi (prompt, hướng dẫn và lịch sử hội thoại) cộng với phần đầu ra mà mô hình tạo ra. Bộ tách token (tokenizer) của mô hình chia văn bản đó thành các token, mỗi token khoảng ¾ một từ tiếng Anh, và cả token đầu vào lẫn đầu ra đều được tính vào mức sử dụng của bạn.

### `oy34stad` (normal, span `oy34stadc`) — follow-up repeats the "complexity / processing requirements" claim

Before:

> Ví dụ, nếu bạn đang dùng mô hình AI hội thoại để tạo phản hồi cho chatbot chăm sóc khách hàng, số lượng token sử dụng sẽ phụ thuộc vào độ phức tạp của các cuộc trò chuyện và yêu cầu xử lý của mô hình.

After:

> Ví dụ, nếu bạn đang dùng mô hình AI hội thoại để tạo phản hồi cho chatbot chăm sóc khách hàng, số lượng token sử dụng sẽ phụ thuộc vào lượng văn bản gửi vào (tin nhắn của khách hàng cộng với lịch sử hội thoại gửi kèm mỗi yêu cầu) và độ dài câu trả lời của mô hình.

## vi · tai-sao-claude-bi-ngat-giua-chung

Document `aitk-vi-150` · _rev `I6DFcTJpaKFnGpRNPHgqnw`

### `b2` (normal, span `b2s0`) — "ký tự Hán" sentence left from the zh-TW source · sentence-only change

Before:

> Một ký tự Hán hoặc một từ tiếng Anh thường được tách thành một hoặc nhiều token.

After:

> Một từ ngắn, thông dụng thường chỉ là một token, còn những từ dài hơn hoặc ít gặp sẽ bị tách thành nhiều token.

## vi · geminiapi-vs-gemina-apps-for-beginners

Document `g3jTIj9ubDWnGQfo9PTTiG-vi` · _rev `97luqmnzEkVELN5ugBL0gk`

### `mwx1g3er` (normal, span `mwx1g3erc`) — "tiered pricing … discounts for bulk token purchases"

Before:

> Sự khác biệt chính giữa Gemini API và Gemini Apps nằm ở mô hình định giá. Gemini API cung cấp cấu trúc giá theo bậc dựa trên mức sử dụng token, với chiết khấu cho việc mua token số lượng lớn.

After:

> Sự khác biệt chính giữa Gemini API và Gemini Apps nằm ở mô hình định giá. Gemini API tính phí theo token, với giá riêng cho token đầu vào và đầu ra: ví dụ, Gemini 4 Argon có giá $4.00 cho mỗi 1 triệu token đầu vào và $20.00 cho mỗi 1 triệu token đầu ra (giá thông thường của Google, kiểm tra ngày 25 tháng 11, 2026).

### `14ryqo61` (normal, span `14ryqo61c`) — made-up "basic, premium, enterprise" plan tiers
Source: https://gemini.google/subscriptions/ (checked 2026-11-24)

Before:

> Ngược lại, Gemini Apps hoạt động theo mô hình đăng ký, với các gói được điều chỉnh theo từng trường hợp sử dụng cụ thể và nhu cầu người dùng. Bạn có thể chọn từ nhiều bậc khác nhau, bao gồm tùy chọn cơ bản, premium và doanh nghiệp, tùy thuộc vào nhu cầu AI và ngân sách của bạn.

After:

> Ngược lại, ứng dụng Gemini không tính phí theo token. Ứng dụng có phiên bản miễn phí và các gói Google AI trả phí hằng tháng (Google AI Plus, Google AI Pro và Google AI Ultra).

## Guard skips: 0

## Would write: 25 span(s) in 11 document(s), ONE transaction, each pinned to the _rev read now

Undo: `node scripts/patch-champion-facts.mjs --revert` (dry run), then `SANITY_TOKEN=… … --revert --apply`.

