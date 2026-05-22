---
name: new-feature
description: Scaffolds a new feature — runs the project's repeatable setup steps in the correct order so nothing is forgotten.
---

<!-- [TEMPLATE] Rename this file and rewrite every step for your actual project. The generic version will not be useful as-is. -->

# /new-feature

## When to use
Whenever a feature requires multiple files in lockstep — easy to forget one step otherwise.
Run once per feature, passing a different `$1` each time.

## Steps
1. Add the data model in `[location]`.
2. Add the fetcher / repository layer in `[location]`.
3. Add the route / page / endpoint in `[location]`.
4. Wire the new entry point into wherever this project registers navigation, routing, or the site index (e.g. a nav component, a routes array, a sitemap, an exports file). If no such registration point exists yet, create one. Only skip if the entry point is intentionally unreachable (e.g. a hidden post-submit page) — and if so, add a code comment explaining why.
5. Add a test in `[location]`.
6. Update `SUMMARY.md` with a one-line entry for the new feature.
7. Invoke the `build-test-verify` skill to confirm everything passes.

## Arguments
- `$1` = feature name, kebab-case (e.g. `user-profile`).

## Output
A summary listing which files were created or edited, followed by the result of `build-test-verify`.
