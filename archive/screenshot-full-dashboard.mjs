// Sanity Studio renders the tool content inside its own scroll container,
// so puppeteer's standard `fullPage: true` only captures the outer page
// (which doesn't scroll). This script:
//   1. Loads the page
//   2. Finds the actual scrollable element inside Studio
//   3. Disables its inner scroll + resizes the viewport to its full
//      scrollHeight so everything lays out within one viewport
//   4. Takes a single screenshot of the whole thing
//
// Usage: node archive/screenshot-full-dashboard.mjs [url] [label]

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');
const profileDir = path.join(__dirname, '.puppeteer-profile');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3333/seo-insights';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

let n = 1;
while (fs.existsSync(path.join(screenshotDir, `screenshot-${n}${label}.png`))) n++;
const outPath = path.join(screenshotDir, `screenshot-${n}${label}.png`);

const useProfile = fs.existsSync(profileDir);
const launchOpts = useProfile
  ? { headless: 'new', userDataDir: profileDir, args: ['--no-sandbox'] }
  : { headless: 'new', args: ['--no-sandbox'] };

const browser = await puppeteer.launch(launchOpts);
const [existingPage] = await browser.pages();
const page = existingPage || (await browser.newPage());
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2500));

// Step 1: find the tallest inner scrollable container.
const measured = await page.evaluate(() => {
  const candidates = Array.from(document.querySelectorAll('*')).filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') return false;
    return el.scrollHeight > el.clientHeight + 4;
  });
  candidates.sort((a, b) => b.scrollHeight - a.scrollHeight);
  const target = candidates[0];
  if (!target) {
    return {
      tallestScrollHeight: document.documentElement.scrollHeight,
      docHeight: document.documentElement.scrollHeight,
      foundContainer: false,
    };
  }
  return {
    tallestScrollHeight: target.scrollHeight,
    docHeight: document.documentElement.scrollHeight,
    foundContainer: true,
    selectorHint: target.getAttribute('data-ui') || target.tagName.toLowerCase(),
  };
});

console.log('Measured:', measured);

// Step 2: disable inner scroll on every scrollable element so the
// document itself owns the full height. Also force the body min-height
// to ensure the layout doesn't collapse.
await page.evaluate(() => {
  document.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') {
      el.style.overflowY = 'visible';
      el.style.maxHeight = 'none';
      el.style.height = 'auto';
    }
  });
  document.body.style.minHeight = '100vh';
});

// Step 3: resize the viewport to be tall enough to contain everything.
const targetHeight = Math.max(measured.tallestScrollHeight, measured.docHeight) + 200;
await page.setViewport({ width: 1440, height: targetHeight, deviceScaleFactor: 1 });

// Let Sanity Studio relayout after the scroll-removal.
await new Promise((r) => setTimeout(r, 1500));

// Step 4: take the screenshot at the new viewport size.
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

const stats = fs.statSync(outPath);
console.log(`Screenshot saved: ${outPath}`);
console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB  ·  Viewport: 1440 × ${targetHeight}`);
