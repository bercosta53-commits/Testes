import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('.', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto('file://' + dir + 'anuncio.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('.ad').screenshot({ path: dir + 'anuncio.png' });
await browser.close();
