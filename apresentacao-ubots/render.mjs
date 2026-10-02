// Gera o PDF da apresentação a partir de apresentacao.html (Chromium headless via Playwright).
//
//   node render.mjs            -> Apresentacao-Serie-Videos-Ubots.pdf
//   node render.mjs --png      -> também salva previews/slide-0N.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, 'Apresentacao-Serie-Videos-Ubots.pdf');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => { console.error('page error:', e); process.exitCode = 1; });
await page.goto(pathToFileURL(path.join(here, 'apresentacao.html')).href);
await page.evaluate(() => window.gradReady);

const failed = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'error').map(f => `${f.family} ${f.weight}`));
if (failed.length) { console.error('fontes com erro:', failed); process.exitCode = 1; }

if (process.argv.includes('--png')) {
  const dir = path.join(here, 'previews');
  fs.mkdirSync(dir, { recursive: true });
  const slides = await page.$$('.slide');
  for (const [i, el] of slides.entries()) {
    await el.screenshot({ path: path.join(dir, `slide-${String(i + 1).padStart(2, '0')}.png`) });
  }
}

await page.pdf({ path: OUT, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('PDF:', path.relative(process.cwd(), OUT));
