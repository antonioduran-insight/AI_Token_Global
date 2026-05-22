<!-- [TEMPLATE] Keep this under 100 lines. Point at other files; don't duplicate their content here. -->

# CLAUDE.md — Working Rules for AI Agents

## Project Context
<!-- 2-4 lines: what is this project, what is locked-in. Link to SUMMARY.md for the full picture. -->
- This project is [one-sentence description].
- Architecture is locked in: [framework] + [data layer] + [host]. Do not propose changes to these.
- The source of truth for current state is `SUMMARY.md`.

## Where to Look
<!-- Pointers to the docs an agent should read before making a non-trivial change. -->
- `SUMMARY.md` — what's done, what's in progress, what's blocked
- `docs/decisions/` — why the project is built the way it is (ADRs)
- `CHECKLIST.md` — AI-readiness baseline for this repo

## Hard Rules
<!-- Things an agent must never do. Be specific. Each rule should be testable by reading a file. -->
- Do not edit anything inside `dist/`, `node_modules/`, or other generated/vendored folders.
- Do not hardcode [project-specific value, e.g. translated text] in source files — read it from [config location].
- Every change must pass `[verify command, e.g. npm run check]` before being reported as complete.

## Gotchas
<!-- Places agents quietly make wrong edits. One line per gotcha saves the next agent an hour. -->
- File [X] exists in two places ([archived path] and [active path]) — only edit the active one.
- The [dynamic routing or similar pattern] is generated — adding a new route means updating [list location], not just adding a file.
- [Any naming convention or invariant that isn't enforced by code.]

## When You Make Changes
<!-- One bullet per update rule. Each rule tells an agent what to update besides the code they just touched. The point is to keep the docs in this file (and SUMMARY/ADRs) from drifting out of sync with reality. -->
- **Update `SUMMARY.md`** when [what kind of state change triggers an update — e.g., completing a milestone, fixing a known issue, adopting or changing an architectural decision (new dependency, switched tooling, deploy host changed), shipping a new feature].
- **Update `CLAUDE.md` itself** when [what kind of change triggers a self-update — e.g., paths, commands, or conventions referenced in this file have moved or been renamed].
- **Update `README.md`** when [what kind of change triggers a README update — e.g., the dev/build/verify commands change, the dev-server port changes, ownership changes, or the one-sentence project description changes].
- **Write an ADR in `docs/decisions/`** when [what kind of decision deserves an ADR — e.g., adopting a new dependency, switching a tool, locking in an architectural pattern].
- **Run `[verify command, e.g. npm run check && npm run build]`** before reporting any change as complete.
