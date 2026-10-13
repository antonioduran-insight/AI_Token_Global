# Per-token prices with no model named: sweep

Read-only sweep of `audits/2026-10-08/content-corpus.json` (719 published posts, pulled 2026-10-08T07:28:57.264Z). A hit is a currency figure priced **per token** or **per 1,000 tokens** with no model name within ±100 characters, which is why the price scanner never flagged it.

Real prices in `src/lib/pricing.ts` run from $0.20 to $30.00 per **million** tokens. The "As $ per 1M tokens" column converts each figure so it can be read against that range.

## Counts

| | en | es | id | vi | Total |
|---|---:|---:|---:|---:|---:|
| Figures | 85 | 80 | 80 | 66 | 311 |
| Posts | 43 | 41 | 41 | 28 | 153 |
| …per token | 55 | 50 | 50 | 50 | 205 |
| …per 1K tokens | 30 | 30 | 30 | 16 | 106 |

45 article clusters.

## Kinds

- **C · real vendor named** (6 clusters, 55 figures): reads as a fact about a named company, and is false.
- **B · stated as fact, no vendor** (9 clusters, 45 figures).
- **A · framed as an example** (30 clusters, 211 figures).

## By cluster

| Kind | en slug (locales) | Figures | Framed as example | As $ per 1M tokens | Vendor named | First sentence |
|---|---|---:|---:|---|---|---|
| C | `ai-token-cost-compliance-social-media-api-strategies` (en, es, id) | 24 | 75% | $2–$10,000 | Cohere | A customer support chatbot might use a low-cost API for basic queries ($0.001 per token) and switch to a premium API ($0.01 per token) for complex issues. |
| C | `calculate-ai-token-costs-enterprise-workloads` (en, es, id, vi) | 9 | 67% | $2.5–$60 | OpenAI | Providers typically offer three discount structures: flat rate (e.g., $0.0025 per 1,000 tokens for 500M+), tiered pricing (e.g., $0.003 for 100M-200M, $0.002 fo… |
| C | `ai-token-cost-comparison-openai-anthropic-google` (en, es, id) | 9 | 0% | $30–$120 | OpenAI | OpenAI charges $0.03 per 1,000 tokens for code content, while Anthropic applies a flat 20% surcharge for code blocks in specific models. |
| C | `calculate-ai-token-costs-multilingual-applications` (en, es, id) | 6 | 0% | $25–$30 (in real range) | OpenAI | At $0.025 per 1,000 tokens, the Spanish document costs $0.031 and the Arabic version $0.038. |
| C | `ai-api-platforms-vs-chat-tools-for-businesses-and-developers` (en, es, id, vi) | 4 | 100% | $100,000 | leading AI API platform | For instance, a leading AI API platform charges around $0.10 per token for its basic tier, while a popular chat tool offers 100 free tokens per month before sca… |
| C | `ai-token-basics-guide-tokenization-api-costs` (en, es, id) | 3 | 100% | $300 | Anthropic | Anthropic's lower per-token rate would reduce this to $0.0003 × 20,000 = $6. |
| B | `google-io-2026-ai-tooling-token-cost-optimization` (en, es, id, vi) | 12 | 33% | $2 (in real range) |  | In one case study, a developer building an e-commerce search feature reduced API calls from 12 per search query to 2 by implementing the tool's suggestions, sav… |
| B | `ai-token-mechanics-guide` (en, es, id) | 6 | 0% | $30–$50 |  | A 10,000-token/day limit at $0.03 per 1,000 tokens equals $3/day, but unexpected spikes could double costs. |
| B | `optimizing-ai-driven-web-development-lowering-costs-modern-web-guidance` (en, es, id) | 6 | 0% | $150 |  | The Cost Crisis in AI-Driven Web Development The average AI-assisted code generation workflow consumes 150-300 tokens per iteration, with costs ranging from $0.… |
| B | `chrome-devtools-agents-ai-api-cost-comparison` (en, es, id) | 6 | 0% | $2 (in real range) |  | At $0.002 per 1,000 tokens, this translates to $78 in monthly savings per developer. |
| B | `optimizing-ai-token-costs-chrome-devtools-148-150` (en, es, id) | 3 | 0% | $2 (in real range) |  | With API pricing models often charging $0.002 per 1,000 tokens for input and $0.004 for output, even minor inefficiencies can lead to exponential budget overrun… |
| B | `understanding-ai-token-basics-step-by-step-guide` (en, es, id) | 3 | 0% | $375 |  | However, a 5,000-token response at $0.000375 per token costs $1.875, versus $0.00375 for a 100-token summary. |
| B | `ai-token-costs-impact-legal-contract-analysis-enterprise-guide` (en, es, id) | 3 | 0% | $30 (in real range) |  | At $0.03 per 1,000 tokens for input, this results in $750/month in direct costs. |
| B | `chrome-ai-api-costs-token-management` (en, es, id) | 3 | 0% | $2 (in real range) |  | This results in 400 tokens per post at $0.002 per 1,000 tokens, totaling $0.80 per post. |
| B | `ai-token-economics-api-costs-efficiency` (en, es, id) | 3 | 0% | $2 (in real range) |  | At $0.002 per 1,000 tokens, the base cost is $1.50 per article or $150/month. |
| A | `understanding-ai-tokens-developers-guide-managing-api-costs` (en, es, id, vi) | 38 | 79% | $2–$3,000 |  | At $0.002 per 1,000 tokens (a common pricing tier), this results in $600 monthly costs. |
| A | `ai-token-basics-for-beginners` (en, es, id, vi) | 12 | 100% | $1,000–$10,000 |  | For example, let's say you're using a language translation service with the following pricing tiers: Tier 1: 10 tokens/second ($0.01/token),Tier 2: 100 tokens/s… |
| A | `ai-token-input-output-explanation` (en, es, id, vi) | 12 | 100% | $5,000–$50,000 |  | For instance, Model A charges $0.01 per input token, while Model B charges $0.005 per input token but $0.05 per output token. |
| A | `ai-token-beginner-guide` (en, es, id, vi) | 12 | 100% | $50,000–$100,000 |  | For example, if an AI model consumes 100 tokens per hour and costs $0.10 per token, the total cost would be $10. |
| A | `calculating-ai-token-costs-made-easy` (en, vi) | 10 | 60% | $5,000,000–$10,000,000 |  | If the output complexity is moderate, the cost might be $5 per token, resulting in a total of $5000. |
| A | `understanding-ai-token-basics-for-a-smarter-future` (en, es, id, vi) | 8 | 100% | $10,000 |  | If each token costs $0.01, the total cost per hour would be $10. |
| A | `ai-token-vs-quota-explained` (en, es, id, vi) | 8 | 100% | $100,000–$150,000 |  | For instance, if you have $100 worth of credits in your account, and each token costs $0.10, then you can buy 1000 tokens with those credits. |
| A | `ai-api-pricing-token-fees-vs-functionality-costs` (en, es, id, vi) | 8 | 100% | $10,000–$20,000 |  | Assuming a token fee of $0.01 per token, the cost of processing this text would be $1. |
| A | `ai-model-pricing-comparison-strategies` (en, es, id, vi) | 8 | 100% | $5,000–$10,000 |  | In this scenario, the AI model's pricing structure charges an additional $0.01 per token for each external data access request. |
| A | `claude-api-costs-models-permissions` (en, es, id, vi) | 8 | 100% | $1,500–$2,500 |  | Assuming an input fee of $0.0015 per token and an output fee of $0.0025 per token, the total cost would be approximately $15.75. |
| A | `buying-ai-tokens-for-personal-use` (en, es, id, vi) | 8 | 100% | $100,000 |  | To illustrate this concept, imagine a platform that charges $0.10 per token. |
| A | `how-human-readable-code-impacts-ai-api-token-costs` (en, es, id, vi) | 8 | 63% | $2–$5 (in real range) |  | Consider a scenario where an API call processes 1,500 tokens at $0.002 per 1,000 tokens. |
| A | `ai-token-pricing-for-beginners` (en, es, id, vi) | 6 | 100% | $10,000–$50,000 |  | Suppose you need 1000 tokens for a specific project, and each token costs $0.01. |
| A | `clever-hans-effect-ai-token-costs-model-comparisons` (en, es, id) | 6 | 100% | $20–$25 (in real range) |  | For example, a model with 85% accuracy, 70% token efficiency, and $0.025 per 1,000 tokens would have a CEI of 23.8, compared to a model with 88% accuracy, 50% t… |
| A | `ai-coding-agents-chrome-extension-costs` (en, es, id) | 6 | 50% | $150 |  | Using standard AI tools at $0.15 per 1,000 tokens would cost $1.50. |
| A | `understanding-ai-token` (en, es, id, vi) | 4 | 100% | $10,000 |  | For instance, let's say an AI platform charges $0.01 per token. |
| A | `ai-apis-and-legal-contracts` (en, es, id, vi) | 4 | 100% | $10,000 |  | For example, Vendor A may charge $0.01 per token for a basic plan while Vendor B may offer a premium plan with a fixed monthly fee. |
| A | `claude-token-pricing-guide-for-beginners` (en, es, id, vi) | 4 | 100% | $50,000 |  | Suppose your AI model processes 1,000 tokens per minute, and each token costs $0.05. |
| A | `estimating-ai-token-costs-for-personal-users` (en, es, id, vi) | 4 | 100% | $10,000 |  | For example: If you plan to use a particular API 5 times a week for tasks lasting an average of 10 minutes each, and the model costs $0.01 per token, The Impact… |
| A | `choosing-affordable-ai-apis-for-new-users` (en, vi) | 4 | 100% | $1,000 |  | For instance, a model that charges $0.001 per token may seem affordable at first glance, but if the output requires 100 tokens, the total cost would be $1.00. |
| A | `finding-high-value-ai-models-selection-criteria` (en, es, id, vi) | 4 | 100% | $2,500 |  | However, if you use a premium pricing tier that reduces the cost per token to $0.0025, your total cost would decrease to $2500. |
| A | `gpt-token-pricing-for-ai-beginners` (en, es, id, vi) | 4 | 100% | $30 (in real range) |  | For example, in the 'Optimal' tier, users receive 7 million tokens per month for $0.030 per thousand tokens. |
| A | `ai-token-management-for-enterprises` (en, es, id, vi) | 4 | 100% | $100,000 |  | If they pay $0.10 per token, and each prompt requires 5 tokens, their total cost per interaction would be $0.50. |
| A | `saving-ai-token-costs-beginners-guide` (en, es, id, vi) | 4 | 100% | $50,000 |  | For example, let's consider an AI model that charges $0.05 per token for text processing tasks. |
| A | `calculating-ai-token-costs-for-small-businesses` (en, es, id, vi) | 4 | 100% | $10,000 |  | Assuming a flat-rate pricing model with a cost of $0.01 per token, and considering 10,000 tokens are needed monthly, the TCO would be approximately $100. |
| A | `chatgpt-api-pricing-vs-subscription-cost-difference` (en, es, id) | 3 | 100% | $100 |  | If the API pricing rate is $0.0001 per token, the total cost would amount to $1,000. |
| A | `ai-token-pricing-models-comparison` (en, es, id) | 3 | 100% | $50,000 |  | For example, if you consume 10,000 tokens at a price of $0.05 per token, your total cost would be $500. |
| A | `webmcp-ai-security-reducing-token-costs` (en, es, id) | 3 | 100% | $2 (in real range) |  | Quantifying the Cost-Benefit of WebMCP Implementation To understand WebMCP's financial impact, consider a mid-sized enterprise making 100,000 API calls monthly … |
| A | `understanding-ai-tokens-a-beginners-guide` (vi) | 3 | 67% | $30–$60 |  | Với giá $0.03 mỗi 1.000 token đầu vào và $0.06 mỗi 1.000 token đầu ra, chi phí mỗi giờ sẽ là $1.125 cho đầu vào và $0.281 cho đầu ra. |
| A | `optimize-ai-api-costs-chrome-devtools-automation` (vi) | 1 | 100% | $2,000 |  | Triển khai lên MCP server cho mỗi lần chạy kiểm thử có thể tốn $0.05 mỗi lần thực thi, cộng thêm $0.002 mỗi token API. |

Every figure, with its sentence: `per-token-prices.csv`.
