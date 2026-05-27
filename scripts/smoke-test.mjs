// scripts/smoke-test.mjs
// Hits every key page across all 3 languages and reports:
// - HTTP status
// - JS console errors
// - Unresolved i18n keys (untranslated keys fall back to the raw key path)
// - Nav language dropdown completeness

import puppeteer from 'puppeteer';

const BASE = 'http://localhost:4321';
const LANGS = ['en', 'es', 'id'];
const ROUTES = [
  '/',
  '/ai-trends',
  '/api-compare',
  '/beginners-guide',
  '/blog',
  '/chatgpt-api',
  '/claude-api',
  '/compliance',
  '/gemini-api',
  '/token-calculator',
  '/use-cases',
  '/user-guide',
];

// Heuristic: an unresolved key looks like 'home.readMore' or 'apiCompare.faqFallback' —
// dot-notation with at least one segment of camelCase. Real prose almost never matches.
const KEY_PATH_REGEX = /\b[a-z]+(?:[A-Z][a-z]*)*(?:\.[a-z]+(?:[A-Z][a-z]*)*){1,3}\b/g;

// Strings that match KEY_PATH_REGEX but are legitimate (filenames, identifiers, etc.)
const KEY_PATH_ALLOWLIST = new Set([
  'aitoken.global',
  'ai.token',
  'sanity.io',
]);

async function audit(page, url) {
  const errors = [];
  const consoleErrors = [];

  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  let status, body;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    status = resp.status();
    body = await page.content();
  } catch (e) {
    return { url, status: 'NAVIGATE_FAIL', error: e.message };
  }

  if (status >= 400) errors.push(`HTTP ${status}`);

  // Check nav has all 3 languages
  const langDropdown = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.lang-switcher a, .nav-dropdown-menu a'));
    return links.map(a => a.getAttribute('href')).filter(h => h && /^\/(en|es|id)\//.test(h));
  });
  const navLangs = new Set(langDropdown.map(h => h.split('/')[1]));
  if (navLangs.size < 3) errors.push(`Nav only shows langs: ${[...navLangs].join(',')}`);

  // Check for unresolved i18n keys in visible text
  const visibleText = await page.evaluate(() => document.body.innerText);
  const candidateMatches = visibleText.match(KEY_PATH_REGEX) || [];
  const unresolved = [...new Set(candidateMatches)].filter(m => !KEY_PATH_ALLOWLIST.has(m));

  return {
    url,
    status,
    errors,
    consoleErrors,
    unresolvedKeys: unresolved,
  };
}

async function main() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];
  for (const lang of LANGS) {
    for (const route of ROUTES) {
      const url = `${BASE}/${lang}${route}`;
      const r = await audit(page, url);
      results.push(r);
      const tag = r.errors?.length || r.consoleErrors?.length || r.unresolvedKeys?.length ? '⚠️ ' : '✅';
      console.log(`${tag} ${url} [${r.status}]`);
    }
  }

  await browser.close();

  // Summary
  console.log('\n──────── SUMMARY ────────');
  const problems = results.filter(r => r.errors?.length || r.consoleErrors?.length || r.unresolvedKeys?.length);
  if (problems.length === 0) {
    console.log('✅ All', results.length, 'pages clean.');
    return;
  }

  console.log(`⚠️  ${problems.length}/${results.length} pages have issues:\n`);
  for (const p of problems) {
    console.log(`\n  ${p.url}`);
    if (p.errors?.length) console.log('    HTTP/load errors:', p.errors);
    if (p.consoleErrors?.length) console.log('    Console errors:', p.consoleErrors.slice(0, 3));
    if (p.unresolvedKeys?.length) console.log('    Possible unresolved i18n keys:', p.unresolvedKeys.slice(0, 5));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
