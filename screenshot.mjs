// Screenshot helper described in CLAUDE.md.
//
//   node screenshot.mjs <url> [label] [viewportWidth]
//
// Saves to ./temporary screenshots/screenshot-N[-label].png (auto-incremented,
// never overwritten). Default viewport is 1440px wide; pass a third argument for
// mobile passes, e.g. `node screenshot.mjs http://localhost:4321/en/contact contact-mobile 390`.
//
// Chrome: puppeteer's own download is used when present, otherwise the system
// Chrome (or PUPPETEER_EXECUTABLE_PATH) so this works without `puppeteer browsers install`.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import puppeteer from 'puppeteer';

const [url, label, widthArg] = process.argv.slice(2);
if (!url) {
  console.error('usage: node screenshot.mjs <url> [label] [viewportWidth]');
  process.exit(1);
}

const width = Number(widthArg) || 1440;
const height = width < 700 ? 844 : 900;
const OUT_DIR = './temporary screenshots';
mkdirSync(OUT_DIR, { recursive: true });

const next = readdirSync(OUT_DIR)
  .map(f => Number(/^screenshot-(\d+)/.exec(f)?.[1]))
  .filter(n => Number.isFinite(n))
  .reduce((max, n) => Math.max(max, n), 0) + 1;
const file = `${OUT_DIR}/screenshot-${next}${label ? '-' + label : ''}.png`;

const SYSTEM_CHROME = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => p && existsSync(p));

let browser;
try {
  browser = await puppeteer.launch();
} catch (err) {
  if (!SYSTEM_CHROME) throw err;
  browser = await puppeteer.launch({ executablePath: SYSTEM_CHROME });
}

const page = await browser.newPage();
await page.setViewport({ width, height, isMobile: width < 700, hasTouch: width < 700 });
await page.goto(url, { waitUntil: 'networkidle2' });
// Let scroll-reveal elements settle so the capture matches what a visitor sees.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 80));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: file, fullPage: true });
await browser.close();

console.log(`saved ${file}  (${width}x${height})`);
