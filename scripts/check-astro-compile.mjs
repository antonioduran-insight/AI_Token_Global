/**
 * Compiles every .astro file and checks the result is valid JavaScript.
 *
 * ── Why this exists ──
 * @astrojs/compiler 4.0.0 hoists `export` statements out of the frontmatter to
 * module scope, and it locates them by byte offset. Some frontmatter makes it
 * miscount: the export is hoisted *and* left behind inside the component
 * function, where `export` is illegal. The build then dies with
 *
 *   Unexpected "export"  —  src/pages/[lang]/blog/[slug].astro:42:0
 *
 * pointing at a line that has nothing to do with it, from esbuild, nine seconds
 * into a nine-minute build. The trigger is content-sensitive to the point of
 * absurdity — adding one `/` inside a template literal in the frontmatter was
 * enough — so the only defence is to compile every page and look.
 *
 * Runs in about a second. `npm test` calls it, so a change that trips the
 * compiler fails immediately instead of at the end of a full build.
 */
import { transform } from '@astrojs/compiler';
import { transformSync } from 'esbuild';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(process.cwd(), 'src');

function astroFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) astroFiles(path, out);
    else if (entry.name.endsWith('.astro')) out.push(path);
  }
  return out;
}

const failures = [];
const files = astroFiles(ROOT);

for (const file of files) {
  const rel = relative(process.cwd(), file);
  const source = readFileSync(file, 'utf8');

  let compiled;
  try {
    compiled = await transform(source, { filename: rel, sourcemap: false });
  } catch (error) {
    failures.push(`${rel}: compiler threw — ${error?.message ?? error}`);
    continue;
  }

  for (const diagnostic of compiled.diagnostics ?? []) {
    if (diagnostic.severity === 1) failures.push(`${rel}: ${diagnostic.text}`);
  }

  // The duplicate is the specific symptom of the hoisting bug, so name it.
  const exports = compiled.code.match(/^\s*export\s+(async\s+)?function\s+(\w+)/gm) ?? [];
  const seen = new Set();
  for (const match of exports) {
    const name = match.trim().split(/\s+/).pop();
    if (seen.has(name)) {
      failures.push(`${rel}: "export function ${name}" emitted twice — the compiler hoisted it and left a copy inside the component. Reword the frontmatter (see this script's header).`);
    }
    seen.add(name);
  }

  try {
    transformSync(compiled.code, { loader: 'ts', sourcefile: rel });
  } catch (error) {
    const first = error.errors?.[0];
    failures.push(`${rel}: compiled output is not valid JS — ${first?.text ?? error.message} (generated line ${first?.location?.line ?? '?'})`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s) in ${files.length} .astro file(s):\n`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('');
  process.exit(1);
}
console.log(`${files.length} .astro files compile to valid JavaScript.`);
