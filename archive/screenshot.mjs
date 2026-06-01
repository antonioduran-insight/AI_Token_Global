import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'temporary screenshots');
const profileDir = path.join(__dirname, '.puppeteer-profile');

if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

// Find next available number
let n = 1;
while (fs.existsSync(path.join(screenshotDir, `screenshot-${n}${label}.png`))) n++;
const outPath = path.join(screenshotDir, `screenshot-${n}${label}.png`);

// If a persisted profile exists (created by sanity-auth-setup.mjs),
// reuse it so authenticated Sanity Studio pages render properly.
// Otherwise launch a fresh browser as before.
const useProfile = fs.existsSync(profileDir);
const launchOpts = useProfile
  ? { headless: 'new', userDataDir: profileDir, args: ['--no-sandbox'] }
  : { headless: 'new', args: ['--no-sandbox'] };

const browser = await puppeteer.launch(launchOpts);
const [existingPage] = await browser.pages();
const page = existingPage || (await browser.newPage());
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
// networkidle2 (instead of networkidle0) because Sanity Studio holds an open
// WebSocket for hot-reload + live presence, so it never reaches zero connections.
await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2500)); // wait for fonts + Studio hydration
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outPath}${useProfile ? '  (using persisted Sanity session)' : ''}`);
