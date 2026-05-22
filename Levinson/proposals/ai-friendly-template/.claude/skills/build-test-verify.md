---
name: build-test-verify
description: Runs the project's lint, test, and build commands in order and reports failures. Invoke at the end of any code change to verify correctness before reporting done.
---

<!-- [TEMPLATE] Rewrite the commands below for your project. Keep the order: cheapest signal first, most expensive last. -->

# Build / Test / Verify

## Steps (run in order, stop on first failure)
1. **Lint:** `npm run lint` — fastest, catches style issues.
2. **Typecheck:** `npm run check` — catches type errors without doing a full build.
3. **Test:** `npm run test` — runs the test suite.
4. **Build:** `npm run build` — final correctness signal.

## On failure
Stop at the first failing step. Report the exact failing command and the first 20 lines of error output. Do not attempt to fix unrelated issues at the same time.

## On success
Report each step that passed in one line. Do not paste full successful output — it adds noise.
