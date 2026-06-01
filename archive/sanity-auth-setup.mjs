// One-time interactive login flow for puppeteer screenshots of Sanity Studio.
//
// What it does:
//   1. Opens a real (visible) Chromium window pointed at the local Studio
//   2. You log in manually using your normal Sanity credentials
//   3. When you're done logging in, press Enter in this terminal
//   4. The browser profile is saved to archive/.puppeteer-profile/
//   5. Future runs of screenshot.mjs / verify-*.mjs reuse that profile
//      and skip the login screen entirely
//
// Re-run this script if your session expires (you'll see a login screen
// in the screenshots again).
//
// Usage:  node archive/sanity-auth-setup.mjs [url]
//   default url: http://localhost:3333/

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profileDir = path.join(__dirname, '.puppeteer-profile');
const url = process.argv[2] || 'http://localhost:3333/';

console.log(`Profile directory: ${profileDir}`);
console.log(`Opening: ${url}`);
console.log('');
console.log('Steps:');
console.log('  1. A Chromium window will open.');
console.log('  2. Log in using whichever Sanity sign-in method you use (Google / GitHub / e-mail).');
console.log('  3. Once you can see the Studio (the project content, not the login screen), come back here.');
console.log('  4. Press Enter to save the session and close the browser.');
console.log('');

const browser = await puppeteer.launch({
  headless: false,
  userDataDir: profileDir,
  defaultViewport: null,
  args: ['--start-maximized'],
});

const [page] = await browser.pages();
await page.goto(url);

await new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Press Enter when you are logged in and ready to save the session... ', () => {
    rl.close();
    resolve();
  });
});

await browser.close();
console.log('');
console.log('✔ Session saved.');
console.log('  Future screenshot scripts will reuse this login automatically.');
console.log('  If you ever see a login screen in a screenshot again, re-run this script.');
