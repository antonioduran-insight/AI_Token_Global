<!-- [TEMPLATE] Drop this file at the repo root. Tick the boxes as your project actually meets each item. If you can tick all five, an AI agent can do useful work here without stumbling on the basics. -->

# AI-Readiness Checklist

Tick each box once during setup. After that, leave this file alone.

Five items. Short on purpose — a long checklist gets skimmed, a short one gets used.

- [ ] **Project-specific README.** Describes what this project actually is — not a framework template. Without this, an agent's first read of the repo tells it nothing.
- [ ] **A `CLAUDE.md` that points at the source of truth.** Short, links out to longer docs, doesn't try to be the source of truth itself. Long instruction files drift; short ones with pointers stay accurate.
- [ ] **One discoverable "verify my change" command.** `npm run check`, `make test`, `cargo check` — the exact tool doesn't matter, the existence does. Without it, agents have no fast correctness signal beyond a full build.
- [ ] **Honest `.env.example`.** Every environment variable an agent might need, with safe placeholder values and a one-line comment explaining each. If your project has no env vars, an empty `.env.example` (with a comment explaining that) ticks this box — the point is that the env-var surface is documented, even when zero.
- [ ] **A "gotchas" (or "where the dragons are") section in `CLAUDE.md`.** Generated files, vendored code, archived folders, naming conventions not enforced by code. This is where agents quietly make wrong edits.
