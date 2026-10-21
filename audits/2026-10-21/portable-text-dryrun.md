# Portable-text fixes DRY RUN: 2026-10-21T10:11:53.071Z

Export `audits/2026-10-21/image-prompts.csv` already exists; kept as is.

## Plan: 51 imagePrompt deletion(s) in 12 doc(s) · 3 block split(s)

- A `5bTmGH4csQ2ze7LA77pImv` /en/blog/ai-token-usage-dashboard-interpreter/: delete 5 imagePrompt block(s) (`or29pfog`, `u5r2iv08`, `jhowgo4l`, `6wz9r4zm`, `5xt5iuax`)
- A `5bTmGH4csQ2ze7LA77pImv-vi` /vi/blog/ai-token-usage-dashboard-interpreter/: delete 5 imagePrompt block(s) (`or29pfog`, `u5r2iv08`, `jhowgo4l`, `6wz9r4zm`, `5xt5iuax`)
- A `Lu5cRtKnjW1G8cWSaZkY55` /en/blog/ai-token-price-comparison/: delete 5 imagePrompt block(s) (`o6wnsqad`, `b183purn`, `x4bljlmm`, `lttbd41b`, `fv59v1ix`)
- A `Lu5cRtKnjW1G8cWSaZkY55-vi` /vi/blog/ai-token-price-comparison/: delete 5 imagePrompt block(s) (`o6wnsqad`, `b183purn`, `x4bljlmm`, `lttbd41b`, `fv59v1ix`)
- A `PXBreekz6ug9jLuKVwZKwz` /en/blog/ai-api-pricing-token-fees-vs-functionality-costs/: delete 3 imagePrompt block(s) (`f4hrin4m`, `2atqohei`, `y5a5cp8i`)
- A `VKNTFpWe8NfJwy5gVWHDkk-vi` /vi/blog/cloud-agency-contracts-ai-api-risks/: delete 2 imagePrompt block(s) (`lqai4i6i`, `2r4azie0`)
- A `dShP6JdGzwBHy3qr2AsvVI-vi` /vi/blog/lowering-ai-token-expenses-strategies-for-cost-optimization/: delete 5 imagePrompt block(s) (`ynhzbpb9`, `nw88dxvu`, `2nbjd9p8`, `82kt4hwp`, `r1mjxa9s`)
- A `g3jTIj9ubDWnGQfo9PjMAq` /en/blog/multi-model-platform-benefits-applications/: delete 5 imagePrompt block(s) (`l15ffkc9`, `ipw1jskr`, `ta9fy1b4`, `a6rz98sk`, `g4fbdh42`)
- A `lT0MJhwbFtcMofmR8I8yJt-vi` /vi/blog/choosing-affordable-ai-apis-for-new-users/: delete 3 imagePrompt block(s) (`0wzs5d2b`, `tvnn217w`, `g30nqehf`)
- A `uomub2hTG94T3nqbFWijkq-vi` /vi/blog/confidential-documents-ai-apis-risks-precautions/: delete 3 imagePrompt block(s) (`9b8l9jgw`, `zeofq9gh`, `84hz65cg`)
- A `uomub2hTG94T3nqbFXWzo9` /en/blog/calculating-ai-token-costs-made-easy/: delete 5 imagePrompt block(s) (`h1lejtil`, `bhq5hg6j`, `ohipe7kb`, `0nh3oktt`, `jctx7rbw`)
- A `uomub2hTG94T3nqbFXWzo9-vi` /vi/blog/calculating-ai-token-costs-made-easy/: delete 5 imagePrompt block(s) (`h1lejtil`, `bhq5hg6j`, `ohipe7kb`, `0nh3oktt`, `jctx7rbw`)
- B `VdSyE50eHa1ZkhVq3P8eci-vi` /vi/blog/ai-token-basics-for-beginners/: block `bgy4aea5` → 3 bullets: "Bậc 1: 10 token/giây ($0.01/token)" · "Bậc 2: 100 token/giây ($0.005/token)" · "Bậc 3: 1.000 token/giây ($0.001/token)"
- B `VdSyE50eHa1ZkhVq3P8fQs` /es/blog/tokens-de-inteligencia-artificial-basico/: block `bgy4aea5` → 3 bullets: "Tier 1: 10 tokens/second ($0.01/token)" · "Tier 2: 100 tokens/second ($0.005/token)" · "Tier 3: 1,000 tokens/second ($0.001/token)"
- B `VdSyE50eHa1ZkhVq3P8fpx` /id/blog/token-ai-basik/: block `bgy4aea5` → 3 bullets: "Tier 1: 10 tokens/second ($0.01/token)" · "Tier 2: 100 tokens/second ($0.005/token)" · "Tier 3: 1,000 tokens/second ($0.001/token)"

## Guard skips: 0

## Would write: 15 patch(es) in ONE transaction, each pinned to the _rev read now

## After the next build

`npm run build 2>&1 | tee build.log && node scripts/patch-portable-text.mjs --check-dist build.log`: expect 0 [portable-text] lines and every tier string inside <li>.

Undo: `node scripts/patch-portable-text.mjs --revert` (dry run), then `SANITY_TOKEN=… … --revert --apply`.

