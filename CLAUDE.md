# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed in the project root via `npm install puppeteer` (macOS). No external path needed — `node_modules/puppeteer` is used directly.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- **The VSCode Read tool does NOT render PNG images visually.** Do not try to read screenshots with the Read tool. Instead, audit pages programmatically using Puppeteer's `page.evaluate()` to inspect the DOM, classes, styles, and link hrefs.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Responsive System (Astro project)
- **Dev server for Astro:** `npm run dev` → `http://localhost:4321` (or next available port)
- **Screenshots:** `node screenshot.mjs http://localhost:4321/en/page label`
- **Breakpoints** (defined in `src/styles/global.css`):
  - `1024px` — mobile nav switches to desktop nav
  - `900px` — grid layouts collapse
  - `640px` — single-column, footer stacks
- **Mobile nav:** use `.mobile-nav-panel` + `.is-open` class toggle (JS in `Nav.astro`). Never toggle `.desktop-nav` visibility via JS.
- **Only animate `transform` and `opacity`.** Never `transition: width`, `transition: max-height`, or `transition-all`.
- **FAQ accordion:** use `.faq-answer` / `.faq-answer.open` classes + `window.toggleFaq()`. No `max-height` transitions.
- **Progress bar:** use `transform: scaleX()` + `transform-origin: left`, not `width`.
- **Footer breakpoints** are in `global.css` only (900px → 1fr 1fr, 640px → 1fr). Do not add scoped `<style>` to Footer.astro.
- **`prefers-reduced-motion`** block is in `global.css`. All new animations must be covered there.
- **Font loading:** Google Fonts loaded via `<link>` in `BaseLayout.astro` only. No `@import` in CSS files.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
