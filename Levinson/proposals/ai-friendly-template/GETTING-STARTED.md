# Getting Started

This template gives you the structural pieces of an AI-friendly project. Follow the steps below once you've cloned it.

## Step 0 — Describe Your Project

Before opening Claude, get clear on a few things about what you're building:

- **What is it?** (one sentence)
- **Who is it for?**
- **Rough scope:** single page / multi-page site / app / CLI / library?
- **Stack:** which framework, language, CMS? (Or: *"I don't know — suggest one."*)
- **Specific requirements:** design style, performance targets, integrations, accessibility?

Then open Claude in this folder and paste a message like this (filled in with your answers):

> *Read `GETTING-STARTED.md` and follow its steps to set up this project. Here's what I'm building: [one sentence]. It's for [audience]. Scope: [scope]. Stack: [stack, or "suggest one"]. Specific requirements: [list, or "none beyond defaults"].*

**Worked example (a portfolio site):**

> *Read `GETTING-STARTED.md` and follow its steps. I'm building a personal portfolio site — a developer showcasing past projects, a short bio, and a contact form. Scope: 4–5 pages, content-heavy, no backend. Stack: Astro + Tailwind, deploying to Cloudflare Pages. Specific requirements: dark mode by default, fast LCP, accessible.*

The more specific your description, the more accurate the filled-in `CLAUDE.md` and `README.md` will be.

## Steps

1. **(Human step, before launching Claude.)** Clone this folder as your new project root. Rename it to your project name.

2. **Scaffold your framework into the project root.**

   Tell Claude what stack you want to use — framework, language, or general tooling. If you're not sure, ask Claude to suggest one based on your Step 0 description. Claude will scaffold the stack into the project root and handle any conflicts with the template's existing files (placeholders in `src/`, `tests/`, `scripts/`; root files like `CLAUDE.md`, `README.md`, `.gitignore`).

   Canonical files Claude must preserve as-is: `README.md`, `CLAUDE.md`, `SUMMARY.md`, `CHECKLIST.md`, `.editorconfig`, `.env.example`, `.claude/`, `docs/`. For anything else the scaffolder generates, Claude should merge or replace sensibly. If Claude hits something it can't resolve safely, it should stop and ask rather than guess.

   After scaffolding, review what Claude did before moving on to step 3.

   *Hint for Claude: different scaffolders use different flag conventions. Don't guess — check the scaffolder's `--help` output, or look up current docs, before invoking. For npm-family CLIs, boolean-negation flags usually take the `--no-<flag>` form (`--no-install`, `--no-git`) — forms like `--install false` and `--git false` get silently ignored by some scaffolders (including `create-astro`).*

   *Note: Claude has more current knowledge about scaffolder behavior than this document can. Trust Claude's judgment on tool-specific quirks — if a stack needs special handling, let Claude handle it.*

3. **Run `claude` and ask it to read the codebase and fill in `CLAUDE.md`, `README.md`, `SUMMARY.md`, and `.env.example`** based on what it finds. For `.env.example`, replace the placeholder with the variables your stack actually needs — or empty the variables section if your project has none. A starting prompt: *"Read the repo and fill in the placeholders in CLAUDE.md, README.md, SUMMARY.md, and .env.example with the real values for this project."*

   *If you haven't already done so in Step 0, describe your project to Claude before this step runs. Claude can't fill in accurate values without that context.*

**3b. Ask Claude to add subfolder `CLAUDE.md` files** inside `src/`, `tests/`, and `scripts/` with folder-specific rules based on your stack. Each subfolder `CLAUDE.md` should include its own short "When You Make Changes" note — something like: *"Update this file when the rules or conventions in it change — paths, patterns, named exports, etc."* Note: the `README.md` files already in those folders are for humans ("what goes here"); the `CLAUDE.md` files are for the AI ("what rules apply here"). A real project needs both.

**3c. Ask Claude to tailor `.claude/`.** The template ships with generic versions of `.claude/commands/new-feature.md`, `.claude/agents/code-reviewer.md`, and `.claude/skills/build-test-verify.md`. Each file has its own `[TEMPLATE]` instructions at the top — Claude should follow them: **rewrite** the contents for the project's actual workflow (the real verify command, what "add a feature" means here, the specific checks the reviewer should run), **rename** files where appropriate (e.g. `/new-feature` → `/new-page` for a content site), or **delete** any file whose concept doesn't apply yet (e.g. `build-test-verify.md` if there's no lint/test stage configured). Don't ship generic placeholders into a real project.

4. **Review what Claude wrote and correct anything wrong.** Especially architectural claims and "Hard Rules" — Claude can guess these correctly often, but not always.

5. **Add your real `.env` values.** Copy `.env.example` to `.env`, fill in the secrets, and keep `.env.example` updated whenever you add a new variable. If your stack has no environment variables (e.g. a static site with no API keys), `.env.example` should already be empty or near-empty after Step 3 — leave it that way. The point of `.env.example` is to document the project's env-var surface, even when that surface is zero. (If Claude merged scaffolder-generated variables into `.env.example` during scaffolding, double-check those have safe placeholder values too — never commit a real secret.)

6. **Delete this `GETTING-STARTED.md`** once your project is up and running. Future contributors need `README.md`, not the bootstrap guide.

**Keep `CLAUDE.md` accurate as the project evolves.** Every time a file path changes, a command changes, or a new convention is agreed on, update it. A stale `CLAUDE.md` is worse than no `CLAUDE.md` — it actively sends agents the wrong way.

**Decide whether to use ADRs.** `docs/decisions/` is provided for architectural decision records. ADRs are optional — only commit to them if your team will actually write them. An empty `docs/decisions/` folder is worse than no folder.
