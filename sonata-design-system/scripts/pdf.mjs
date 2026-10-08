// Gera o estudo em PDF (páginas 1920 × 1080) a partir de apresentacao/estudo.html.
// Uso: node scripts/pdf.mjs [--previas]   (--previas salva também um PNG por página em apresentacao/paginas/)
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let playwright;
try { playwright = await import('playwright'); } catch { playwright = await import(process.env.PLAYWRIGHT_MODULE || 'playwright'); }

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
await page.goto(pathToFileURL(join(root, 'apresentacao/estudo.html')).href, { waitUntil: 'load' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  document.querySelectorAll('.sn-post').forEach((p) => Sonata.ajustar(p));
});
if (process.argv.includes('--previas')) {
  const dir = join(root, 'apresentacao/paginas');
  mkdirSync(dir, { recursive: true });
  const slides = await page.locator('.slide').all();
  for (let i = 0; i < slides.length; i++) await slides[i].screenshot({ path: join(dir, String(i + 1).padStart(2, '0') + '.png') });
}
const saida = join(root, 'apresentacao/Sonata-Social-Ondas-estudo.pdf');
await page.pdf({ path: saida, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(erros.length ? 'Erros na página:\n' + erros.join('\n') : 'ok', '→', saida);
