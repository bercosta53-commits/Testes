// QA da seção 7 do playbook-viacredi-ubots.md. Gera dist/qa-report.md.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = path.join(ROOT, 'dist/playbook-viacredi-ubots.html');
const PDF = path.join(ROOT, 'dist/playbook-viacredi-ubots.pdf');
const MD = fs.readFileSync(path.join(ROOT, 'playbook-viacredi-ubots.md'), 'utf8');

const norm = (s) => s.replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase(); // caixa ignorada: há rótulos em CSS uppercase

// ---- fragmentos de copy por slide, extraídos do .md ----
function copyFragments() {
  const out = {};
  const parts = MD.split(/^### Slide (\d+)[^\n]*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const n = +parts[i];
    const body = parts[i + 1].split(/^---$/m)[0];
    const frags = [];
    for (let line of body.split('\n')) {
      line = line.replace(/\*\*/g, '').replace(/`/g, '');
      const t = line.trim();
      if (!t || /^Layout:/.test(t)) continue;
      if (/^(- )?(Mini chat|Wireframe|Conversa no celular|Cards à direita|Painel|Coluna|Card |Campos:|Indicadores:|Etapas:|Barra escura:|Linha do tempo:|Anotações:|Caixa escura|Dica|Faixa de citação|Card esquerdo:|Card direito|Botão|Faixa de resultados)/.test(t) && !/: \S/.test(t.replace(/^- /, '').replace(/^[^:]+:/, '')) ) continue;
      let v = t.replace(/^- /, '').replace(/^\d+\. /, '');
      const lab = v.match(/^(Pílula|Título|Subtítulo|Linha de público[^:]*|Citação|Callout escuro|Linha de apoio[^:]*|Faixa final[^:]*|Rodapé[^:]*|Legenda[^:]*|Rótulo de público|Tags de público|Linha de origem[^:]*|Selo no canto|Corpo \(esquerda\)|Card da protagonista[^:]*|Dica[^:]*|Faixa de citação|Chips de etapas[^:]*):\s*(.*)$/);
      if (lab) v = lab[2];
      else if (/^(Painel|Coluna|Card|Mini chat|Wireframe|Caixa escura|Barra escura|Botão)/.test(v)) continue;
      v = v.replace(/==/g, '').replace(/\s*\[(Fala|cargo|URL)[^\]]*\]/g, '').replace(/\(link:.*$/, '');
      if (/^(Cooperada|Agente|Cooperado):/.test(v)) v = v.replace(/^\w+:\s*/, '');
      if (/barras|sem conteúdo|substituir pelo print/.test(v)) continue;
      v = v.replace(/^Checkboxes: /, '');
      v = v.replace(/^"|"$/g, '');
      const pieces = v.split(/ · | → |Entrega: |Campos: /).map((x) => x.trim().replace(/^"|"$/g, '').replace(/[.]$/, '')).filter((x) => x.length > 2);
      frags.push(...pieces);
    }
    out[n] = frags;
  }
  return out;
}

const report = [];
const ok = (b) => (b ? 'OK' : 'FALHOU');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto(pathToFileURL(HTML).href + '?export=1');
await page.waitForSelector('body.ready');

const data = await page.evaluate(() => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el, slide) => {
    const stack = [];
    for (let e = el; e && e !== slide.parentElement; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; }
    }
    let base = slide.classList.contains('dark') ? { r: 7, g: 4, b: 1, a: 1 } : { r: 255, g: 253, b: 249, a: 1 };
    // slides claros: o pior caso do gradiente é o ouro-suave
    if (!stack.length || stack[stack.length - 1].a < 1) base = slide.classList.contains('dark') ? base : base;
    let col = stack.length && stack[stack.length - 1].a >= 1 ? stack.pop() : base;
    while (stack.length) col = over(stack.pop(), col);
    return col;
  };
  const hueSat = ({ r, g, b }) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; const d = mx - mn; if (!d) return { h: 0, s: 0, l }; const s = d / (1 - Math.abs(2 * l - 1)); let h; if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return { h, s, l }; };
  return [...document.querySelectorAll('.slide')].map((slide, i) => {
    const texts = [];
    const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; if (!n.textContent.trim()) continue;
      const el = n.parentElement; const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const fg = parse(cs.color); const bg = bgOf(el, slide);
      const fgc = over(fg, bg);
      const L1 = lum(fgc), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      texts.push({ t: n.textContent.trim().slice(0, 50), size: parseFloat(cs.fontSize), weight: +cs.fontWeight, ratio: +ratio.toFixed(2), bigGold: !!el.closest('.gold,.num,.big-n,.qmark,.cn') && parseFloat(cs.fontSize) >= 40 });
    }
    // cores azul/teal (exceto o logo, que é imagem)
    const blue = [];
    slide.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      const vals = [cs.color, cs.backgroundColor, cs.borderTopColor, cs.borderLeftColor, cs.fill, cs.stroke, ...(cs.backgroundImage.match(/rgba?\([^)]+\)/g) || [])];
      for (const v of vals) { const c = parse(v || ''); if (!c || c.a === 0) continue; const { h, s, l } = hueSat(c); if (h >= 165 && h <= 265 && s > 0.2 && l > 0.08 && l < 0.92) blue.push(el.tagName + '.' + el.className + ' ' + v); }
    });
    slide.querySelectorAll('svg [fill],svg [stroke]').forEach((el) => { for (const a of ['fill', 'stroke']) { const v = el.getAttribute(a); if (v && /^#/.test(v)) { let hx = v.slice(1); if (hx.length === 3) hx = hx.split('').map((c) => c + c).join(''); const x = parseInt(hx, 16); const c = { r: x >> 16, g: (x >> 8) & 255, b: x & 255 }; const { h, s } = hueSat(c); if (h >= 165 && h <= 265 && s > 0.2) blue.push('svg ' + v); } } });
    return {
      n: i + 1, dark: slide.classList.contains('dark'), text: slide.innerText,
      counter: slide.querySelector('.count').innerText.replace(/\s+/g, ' ').trim(),
      titleLines: (() => { const h = slide.querySelector('h1.t'); if (!h) return 0; const cs = getComputedStyle(h); return Math.round(h.getBoundingClientRect().height / parseFloat(cs.lineHeight)); })(),
      titleW: (() => { const h = slide.querySelector('h1.t'); if (!h) return 0; const r = document.createRange(); r.selectNodeContents(h); return Math.round(Math.max(...[...r.getClientRects()].map((x) => x.width))); })(),
      texts, blue, tbc: [...slide.querySelectorAll('.tbc')].map((e) => e.innerText),
      overflow: [...slide.querySelectorAll('*')].filter((e) => { if (e.closest('[data-bleed]')) return false; const r = e.getBoundingClientRect(), s = slide.getBoundingClientRect(); return r.width && (r.right > s.right + 1 || r.bottom > s.bottom + 1 || r.left < s.left - 1); }).map((e) => String(e.className.baseVal ?? e.className)).slice(0, 5)
        .concat((() => { const c = slide.querySelector('.content'); if (!c) return []; const cr = c.getBoundingClientRect(); return [...c.querySelectorAll('*')].filter((e) => !e.closest('[data-bleed]') && e.getBoundingClientRect().height && e.getBoundingClientRect().bottom > cr.bottom + 1).map((e) => 'fora da zona de conteúdo: ' + String(e.className.baseVal ?? e.className)).slice(0, 5); })()),
    };
  });
});
await browser.close();

const frags = copyFragments();
report.push('# QA · Playbook Viacredi + Ubots', '', `Gerado em ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`, '');

// 1. azul/teal e travessões
const allBlue = data.flatMap((d) => d.blue.map((b) => `slide ${d.n}: ${b}`));
const dashes = data.filter((d) => /[—–]/.test(d.text)).map((d) => d.n);
report.push('## Checklist', '');
report.push(`- [${allBlue.length ? ' ' : 'x'}] Nenhum azul ou teal nos elementos do layout: ${ok(!allBlue.length)}${allBlue.length ? '\n  - ' + allBlue.join('\n  - ') : ''} (exceções em imagem: o logo Viacredi e o ícone de IA da capa mantêm as cores originais)`);
report.push(`- [${dashes.length ? ' ' : 'x'}] Nenhum travessão (— ou –) no texto visível: ${ok(!dashes.length)}${dashes.length ? ' slides ' + dashes.join(', ') : ''}`);
// 2. contraste
const minRows = data.map((d) => {
  const worst = d.texts.filter((x) => !x.bigGold).reduce((a, b) => (b.ratio < a.ratio ? b : a));
  const smallest = d.texts.reduce((a, b) => (b.size < a.size ? b : a));
  return { n: d.n, worst, smallest };
});
const contrastOk = minRows.every((r) => r.worst.ratio >= 4.5);
report.push(`- [${contrastOk ? 'x' : ' '}] Contraste ≥ 4,5:1 em todo texto: ${ok(contrastOk)} (tabela abaixo)`);
// 3. contador
const counters = data.map((d) => d.counter === `${String(d.n).padStart(2, '0')} / 10`);
report.push(`- [${counters.every(Boolean) ? 'x' : ' '}] Contador de página 01 / 10 … 10 / 10: ${ok(counters.every(Boolean))}`);
// régua de título
const tl = data.map((d) => `${String(d.n).padStart(2, '0')}: ${d.titleLines} linha(s), ${d.titleW}px`);
const tOk = data.every((d) => d.titleLines <= 2 && (d.n === 1 || d.n === 10 || d.titleW <= 940));
report.push(`- [${tOk ? 'x' : ' '}] Régua de título: no máximo 2 linhas e 940px de largura (capa e CTA têm régua própria): ${ok(tOk)}\n  - ${tl.join(' · ')}`);
// 4. copy
const missing = [];
for (const d of data) {
  const txt = norm(d.text);
  for (const f of frags[d.n] || []) if (!txt.includes(norm(f))) missing.push(`slide ${d.n}: "${f}"`);
}
report.push(`- [${missing.length ? ' ' : 'x'}] Copy idêntica ao .md (${Object.values(frags).flat().length} trechos conferidos): ${missing.length ? missing.length + ' trecho(s) para revisar' : 'OK'}${missing.length ? '\n  - ' + missing.join('\n  - ') : ''}`);
// 5. A CONFIRMAR
const tbcs = data.flatMap((d) => d.tbc.map((t) => `slide ${d.n}: ${t}`));
report.push(`- [ ] Nenhum [A CONFIRMAR] sobrando na versão final: PENDENTE, ${tbcs.length} marcações em magenta neste rascunho\n  - ${tbcs.join('\n  - ')}`);
// 6. escuros
const darks = data.filter((d) => d.dark).map((d) => d.n);
const seq = darks.some((n, i) => darks[i + 1] === n + 1);
report.push(`- [${seq ? ' ' : 'x'}] Dois slides escuros nunca em sequência: ${ok(!seq)} (escuros: ${darks.join(', ')})`);
// 7. PDF
const pdfDoc = await PDFDocument.load(fs.readFileSync(PDF));
const sizes = pdfDoc.getPages().map((p) => p.getSize());
const sizeOk = sizes.length === 10 && sizes.every((s) => Math.round(s.width) === 1440 && Math.round(s.height) === 810);
let words = 0;
try { words = execFileSync('pdftotext', [PDF, '-']).toString().split(/\s+/).filter(Boolean).length; } catch {}
const nFields = pdfDoc.getForm().getFields().length;
report.push(`- [${sizeOk && words > 500 ? 'x' : ' '}] PDF com texto selecionável e 10 páginas de 1440×810 pt: ${ok(sizeOk && words > 500)} (${sizes.length} páginas, ${words} palavras extraídas por pdftotext, ${nFields} campos de formulário)`);
// overflow
const ovf = data.filter((d) => d.overflow.length).map((d) => `slide ${d.n}: ${d.overflow.join(', ')}`);
report.push(`- [${ovf.length ? ' ' : 'x'}] Nenhum elemento vazando do slide ou da zona de conteúdo (exceto sangrias intencionais da capa e do celular do slide 5): ${ok(!ovf.length)}${ovf.length ? '\n  - ' + ovf.join('\n  - ') : ''}`);

report.push('', '## Contraste por slide', '', '| Slide | Menor contraste | Texto | Menor fonte |', '|---|---|---|---|');
for (const r of minRows) report.push(`| ${String(r.n).padStart(2, '0')} | ${r.worst.ratio.toFixed(2)}:1 | ${r.worst.t.replace(/\|/g, '/')} (${r.worst.size}px) | ${r.smallest.size}px · ${r.smallest.ratio.toFixed(2)}:1 |`);
report.push('', 'Fundo considerado: a cor sólida do elemento ou do card mais próximo; nos slides claros sem card, o `--branco`. Títulos, numerais e aspas em ouro (≥ 40px) ficam fora da regra de 4,5:1 por serem texto grande decorativo, conforme a seção 2 do brief; não entram na tabela.', '', 'Trecho "Conversa anonimizada. Dados da cooperada preservados." (slide 5): substituído de propósito pela legenda "Reconstituição a partir do relato do projeto.", como o brief manda quando não há print aprovado. Volta quando entrar o print-cozinha.png.');

const out = path.join(ROOT, 'dist/qa-report.md');
fs.writeFileSync(out, report.join('\n') + '\n');
console.log(report.join('\n'));
