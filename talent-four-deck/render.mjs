// Renderiza cada slide em PNG (1920×1080) e exporta os decks em PDF.
//   npm i -D playwright && npx playwright install chromium   (uma vez)
//   node render.mjs                 → as duas versões
//   node render.mjs master          → só a apresentação master (index.html)
//   node render.mjs executivo       → só a versão executiva (executivo.html)
// Saída: render/<versão>/slide-NN.png e o PDF de cada versão ao lado deste arquivo.
// A pasta dos PNG pode ser trocada com RENDER_DIR=/outra/pasta.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const VERSOES = {
  master: { html: 'index.html', pdf: 'talent-four-velora.pdf' },
  executivo: { html: 'executivo.html', pdf: 'talent-four-velora-executivo.pdf' },
};
const pedidas = process.argv.slice(2).filter((v) => VERSOES[v]);
const alvo = pedidas.length ? pedidas : Object.keys(VERSOES);
const raiz = path.resolve(process.env.RENDER_DIR || path.join(dir, 'render'));

const browser = await chromium.launch();
for (const nome of alvo) {
  const { html, pdf } = VERSOES[nome];
  const saida = path.join(raiz, nome);
  fs.mkdirSync(saida, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(dir, html)).href + '?render', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => window.deck.total);
  for (let i = 0; i < total; i++) {
    await page.evaluate((n) => window.deck.ir(n), i);
    await page.screenshot({ path: path.join(saida, `slide-${String(i + 1).padStart(2, '0')}.png`) });
  }
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(dir, pdf), preferCSSPageSize: true, printBackground: true });
  await page.close();
  console.log(`${nome}: ${total} slides → ${saida} · PDF → ${pdf}`);
}
await browser.close();
