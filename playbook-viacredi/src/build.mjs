// Build: HTML -> previews PNG -> PDF (1440x810 pt) com campos de formulário.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { buildHtml } from './deck.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { PDFDocument, rgb } = require('pdf-lib');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const HTML = path.join(DIST, 'playbook-viacredi-ubots.html');
const PDF = path.join(DIST, 'playbook-viacredi-ubots.pdf');
fs.mkdirSync(path.join(DIST, 'previews'), { recursive: true });
fs.writeFileSync(HTML, buildHtml());
console.log('html', HTML);

const url = pathToFileURL(HTML).href + '?export=1';
const browser = await chromium.launch();

// previews
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2 });
  await page.goto(url);
  await page.waitForSelector('body.ready');
  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    const out = path.join(DIST, 'previews', `slide-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: out });
  }
  console.log('previews', slides.length);
}

// pdf + coleta das áreas de campos
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto(url);
await page.waitForSelector('body.ready');
const fields = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.slide').forEach((s, i) => {
    const sr = s.getBoundingClientRect();
    s.querySelectorAll('[data-field]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const ph = el.querySelector('.ph');
      let top = r.top + 3;
      if (ph) top = ph.getBoundingClientRect().bottom + 2;
      out.push({ kind: 'text', page: i, name: el.dataset.field, x: r.left - sr.left + 4, y: top - sr.top, w: r.width - 8, h: r.bottom - 3 - top });
    });
    s.querySelectorAll('[data-check]').forEach((el) => {
      const r = el.getBoundingClientRect();
      out.push({ kind: 'check', page: i, name: el.dataset.check, x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height });
    });
  });
  return out;
});
await page.emulateMedia({ media: 'print' });
const raw = await page.pdf({ width: '20in', height: '11.25in', scale: 4 / 3, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();

const doc = await PDFDocument.load(raw);
doc.setTitle('Testando agentes de IA na oferta de crédito');
doc.setAuthor('Ubots');
doc.setSubject('Playbook · Agentes de IA na Oferta de Crédito · Case Viacredi + Ubots');
doc.setLanguage('pt-BR');
const form = doc.getForm();
const pages = doc.getPages();
const ESC = rgb(7 / 255, 4 / 255, 1 / 255);
const OURO = rgb(253 / 255, 195 / 255, 72 / 255);
for (const f of fields) {
  const p = pages[f.page];
  const { height: H, width: W } = p.getSize();
  const k = W / 1440;
  const box = { x: f.x * k, y: H - (f.y + f.h) * k, width: f.w * k, height: f.h * k };
  if (f.kind === 'text') {
    const tf = form.createTextField(f.name);
    if (f.h > 40) tf.enableMultiline();
    tf.addToPage(p, { ...box, borderWidth: 0, backgroundColor: undefined, borderColor: undefined, textColor: ESC });
    tf.setFontSize(f.h > 40 ? 11 : 12);
  } else {
    const cb = form.createCheckBox(f.name);
    cb.addToPage(p, { ...box, borderWidth: 0, backgroundColor: undefined, borderColor: undefined, textColor: OURO });
  }
}
fs.writeFileSync(PDF, await doc.save());
console.log('pdf', PDF, pages.length, 'pages', pages[0].getSize(), fields.length, 'fields');
