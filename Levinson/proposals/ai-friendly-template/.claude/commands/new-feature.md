---
name: new-feature
description: Scaffolds a new feature — runs the project's repeatable setup steps in the correct order so nothing is forgotten.
---

<!-- [TEMPLATE] Rename this file and rewrite every step for your actual project. The generic version will not be useful as-is. -->

# /new-feature

## When to use
Whenever a feature requires multiple files in lockstep — easy to forget one step otherwise.

## Steps
1. Add the data model in `[location]`.
2. Add the fetcher / repository layer in `[location]`.
3. Add the route / page / endpoint in `[location]`.
4. Add a test in `[location]`.
5. Update `SUMMARY.md` with a one-line entry for the new feature.
6. Invoke the `build-test-verify` skill to confirm everything passes.

## Arguments
- `$1` = feature name, kebab-case (e.g. `user-profile`).

## Output
A summary listing which files were created or edited, followed by the result of `build-test-verify`.
