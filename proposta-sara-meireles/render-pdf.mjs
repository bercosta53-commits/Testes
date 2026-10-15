// Renders proposta.html (a 16:9 deck) to a PDF in headless Chromium, one slide per page.
//
//   node render-pdf.mjs [--out proposta-sara-meireles.pdf] [--shots <dir>]
//
// proposta.html is an Artifact page (no <html>/<head> skeleton of its own), so it is
// wrapped in a minimal document next to it (photos load from ./img). Fonts load from
// Google Fonts; when HTTPS_PROXY is set, Chromium is pointed at it.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean)
  .map(s => s.trim().split(/\s+/)).map(([k, v]) => [k, v ?? true]));
const OUT = path.resolve(here, args.out ?? 'proposta-sara-meireles.pdf');
const SHOTS = args.shots ? path.resolve(args.shots) : null;

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const globalRoot = execSync('npm root -g').toString().trim();
  ({ chromium } = createRequire(import.meta.url)(path.join(globalRoot, 'playwright')));
}

const body = fs.readFileSync(path.join(here, 'proposta.html'), 'utf8');
const wrapper = path.join(here, '.render.html');
fs.writeFileSync(wrapper, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}
body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>${body}</body></html>`);

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy, args: ['--force-color-profile=srgb'] });

async function open(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(wrapper).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(() =>
    ['500 16px "Host Grotesk"', '400 16px "IBM Plex Mono"', 'italic 400 16px "Instrument Serif"']
      .filter(f => !document.fonts.check(f)));
  if (missing.length) console.warn('Fonts not loaded:', missing.join(', '));
  return page;
}

try {
  // Lay out at the slide canvas size, 1920x1080.
  const pdfPage = await open({ width: 1920, height: 1080 });
  await pdfPage.emulateMedia({ media: 'print' });
  // Cards (and blocks marked data-fit) clip their overflow, so report any whose content no longer fits.
  const clipped = await pdfPage.evaluate(() =>
    [...document.querySelectorAll('.slide')].flatMap((pg, i) =>
      [...pg.querySelectorAll('.card, [data-fit]')]
        .map(c => ({ page: i + 1, card: c.style.getPropertyValue('--a').trim() || c.dataset.fit, over: c.scrollHeight - c.clientHeight }))
        .filter(c => c.over > 1)));
  for (const c of clipped) console.warn(`slide ${c.page}, card "${c.card}": content clipped by ${c.over}px`);
  await pdfPage.pdf({ path: OUT, printBackground: true, preferCSSPageSize: true });
  console.log('PDF ->', path.relative(process.cwd(), OUT));

  if (SHOTS) {
    fs.mkdirSync(SHOTS, { recursive: true });
    for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      const page = await open(viewport);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) console.warn(`${name}: page scrolls sideways by ${overflow}px`);
      await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
      console.log('shot ->', name);
    }
  }
} finally {
  await browser.close();
  fs.rmSync(wrapper, { force: true });
}
