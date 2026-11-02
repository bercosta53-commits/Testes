// Renderiza cada slide em PNG (1920×1080) e exporta o deck em PDF.
//   npm i -D playwright && npx playwright install chromium   (uma vez)
//   node render.mjs [pasta-dos-png]
// Saída: <pasta>/slide-NN.png (padrão: ./render) e talent-four-velora.pdf ao lado deste arquivo.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const saida = path.resolve(process.argv[2] || path.join(dir, 'render'));
const url = pathToFileURL(path.join(dir, 'index.html')).href + '?render';

fs.mkdirSync(saida, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const total = await page.evaluate(() => window.deck.total);
for (let i = 0; i < total; i++) {
  await page.evaluate((n) => window.deck.ir(n), i);
  await page.screenshot({ path: path.join(saida, `slide-${String(i + 1).padStart(2, '0')}.png`) });
}

await page.emulateMedia({ media: 'print' });
await page.pdf({ path: path.join(dir, 'talent-four-velora.pdf'), preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`${total} slides → ${saida} · PDF → talent-four-velora.pdf`);
