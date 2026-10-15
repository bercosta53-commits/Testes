// Renders proposta.html to an A4 PDF in headless Chromium.
//
//   node render-pdf.mjs [--out proposta-sara-meireles.pdf] [--shots <dir>]
//
// proposta.html is an Artifact page (no <html>/<head> skeleton of its own), so it is
// wrapped in a minimal document here. Fonts load from Google Fonts; when HTTPS_PROXY is
// set, Chromium is pointed at it.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

const page_ = fs.readFileSync(path.join(here, 'proposta.html'), 'utf8');
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}
body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>${page_}</body></html>`;

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy, args: ['--force-color-profile=srgb'] });

async function open(viewport, colorScheme) {
  const page = await browser.newPage({ viewport, colorScheme, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(() =>
    ['800 16px Archivo', '500 16px "IBM Plex Mono"'].filter(f => !document.fonts.check(f)));
  if (missing.length) console.warn('Fonts not loaded:', missing.join(', '));
  return page;
}

// Lay out at the A4 sheet's own width (210 mm at 96 dpi) so script-measured sizes match the PDF.
const pdfPage = await open({ width: 794, height: 1123 }, 'light');
await pdfPage.emulateMedia({ media: 'print', colorScheme: 'light' });
// The page fits its cover title and draws its dash fields from the laid-out sizes,
// so redo that for the A4 layout, then flag any plate whose content outgrows its page.
const overflowing = await pdfPage.evaluate(async () => {
  const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await frame();
  window.__layout?.();
  await frame();
  return [...document.querySelectorAll('.plate > .inner')]
    .map((el, i) => ({ page: i + 1, over: el.scrollHeight - el.clientHeight }))
    .filter(p => p.over > 1);
});
for (const { page, over } of overflowing) console.warn(`page ${page}: content overflows by ${over}px`);
await pdfPage.pdf({ path: OUT, printBackground: true, preferCSSPageSize: true });
console.log('PDF ->', path.relative(process.cwd(), OUT));

if (SHOTS) {
  fs.mkdirSync(SHOTS, { recursive: true });
  for (const [name, viewport, scheme] of [
    ['desktop', { width: 1440, height: 900 }, 'dark'],
    ['mobile', { width: 390, height: 844 }, 'dark'],
  ]) {
    const page = await open(viewport, scheme);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.warn(`${name}: page scrolls sideways by ${overflow}px`);
    await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
    console.log('shot ->', name);
  }
}

await browser.close();
