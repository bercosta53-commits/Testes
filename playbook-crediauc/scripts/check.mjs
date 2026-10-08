// Verificação do deck (seção 8 do brief) + exportação de PNGs e PDF.
//
//   npm run check            (usa o Chromium do Playwright; CHROMIUM_PATH sobrescreve)
//
// Por slide, em viewport 1920×1080, com a rede bloqueada (o deck precisa abrir offline):
//   · overflow do slide (scroll maior que a área) e de qualquer bloco interno;
//   · texto corrido acima de 60 palavras;
//   · texto visível com fonte abaixo de 18 px;
//   · número fora da lista permitida (seção 6 do brief);
//   · contraste abaixo de 4,5:1 (3:1 para texto grande);
//   · texto fora da área útil (120 px nas laterais, 48 px no topo e 100 px na base);
//   · peso de fonte usado sem a face embutida correspondente.
// A palavra-chave dos títulos usa o degradê amarelo da marca (como na apresentação de referência):
// o contraste dela é medido e sai como AVISO, não como falha. Os brilhos do fundo do slide são decoração
// e não entram na conta; o contraste é medido contra a cor de base do slide.
// Depois exporta out/slides/slide-NN.png e out/playbook-crediauc.pdf e confere o PDF com pdfinfo.
//
// "Texto corrido" segue o orçamento da seção 5: contam parágrafos, leads, faixas, perguntas, notas
// e avisos. Não contam títulos, rótulos, números com legendas, cabeçalho, notas do apresentador
// e a microcopy dos componentes (campos, checklists, passos das raias, nós do fluxograma e da cadeia,
// card de entrega, rótulos de diagrama). Os totais de palavras visíveis saem no relatório.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(raiz, 'src/index.html');
const pastaSlides = path.join(raiz, 'out/slides');
const pdfPath = path.join(raiz, 'out/playbook-crediauc.pdf');
fs.mkdirSync(pastaSlides, { recursive: true });

const LIMITE_PALAVRAS = 60;
const FONTE_MINIMA = 18;
const FACES_EMBUTIDAS = { 'Poppins': [500, 600, 700, 800], 'Nunito': [500, 600, 700] };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const bloqueadas = [];
await context.route('**/*', rota => {
  const url = rota.request().url();
  if (/^(file|data|about|blob):/.test(url)) return rota.continue();
  bloqueadas.push(url);
  return rota.abort();
});
const page = await context.newPage();
const errosJs = [];
page.on('pageerror', e => errosJs.push(e.message));

await page.goto(`${pathToFileURL(htmlPath).href}?export#1`);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => document.documentElement.dataset.pronto === 'sim'); // degradês já viraram SVG
const total = await page.evaluate(() => document.querySelectorAll('.slide').length);

// Roda dentro da página: mede um slide e devolve as violações encontradas.
function analisar({ indice, limitePalavras, fonteMinima }) {
  const slide = document.querySelectorAll('.slide')[indice];
  const caixa = slide.getBoundingClientRect();
  const visivel = el => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, opacityProperty: true, visibilityProperty: true });
  const resumo = (el, txt) => {
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '';
    const t = (txt ?? el.textContent).replace(/\s+/g, ' ').trim().slice(0, 48);
    return `<${el.tagName.toLowerCase()}${cls}>${t ? ` "${t}"` : ''}`;
  };
  const r = { nome: slide.dataset.nome, overflow: [], internos: [], corrido: 0, visiveis: 0, pequenos: [], numeros: [], contraste: [], avisos: [], foraDaArea: [], fontes: [] };

  const cor = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };

  // 1. Overflow do slide (critério do brief)
  if (slide.scrollHeight > slide.clientHeight || slide.scrollWidth > slide.clientWidth)
    r.overflow.push(`slide ${slide.scrollWidth}×${slide.scrollHeight} > ${slide.clientWidth}×${slide.clientHeight}`);

  // 2. Nós de texto visíveis, com os retângulos de cada linha
  const textos = [];
  const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent.trim() || el.closest('.notes') || !visivel(el)) continue;
    let bloco = el;
    // SVG de texto (degradê) conta como conteúdo em linha do bloco HTML que o contém
    while (bloco !== slide && (bloco instanceof SVGElement || getComputedStyle(bloco).display === 'inline')) bloco = bloco.parentElement;
    range.selectNodeContents(n);
    const rects = [...range.getClientRects()].filter(q => q.width > 1 && q.height > 1);
    textos.push({ n, el, bloco, rects });
  }

  // 1b. Caixas (elementos com fundo ou borda): texto não vaza delas e não invade caixa alheia;
  //     textos de blocos diferentes não se sobrepõem.
  const TOL = 2;
  const cruza = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > TOL && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > TOL;
  const temCaixa = el => {
    const cs = getComputedStyle(el), bg = cor(cs.backgroundColor);
    return (bg && bg.a > 0) || ['Top', 'Right', 'Bottom', 'Left'].some(l => parseFloat(cs[`border${l}Width`]) > 0 && cs[`border${l}Style`] !== 'none');
  };
  const caixas = [...slide.querySelectorAll('*')].filter(el => !(el instanceof SVGElement) && !el.closest('.notes, [data-recorte]') && visivel(el) && temCaixa(el));
  for (const c of caixas) {
    const q = c.getBoundingClientRect();
    const [x0, y0, x1, y1] = [q.left - caixa.left, q.top - caixa.top, q.right - caixa.left, q.bottom - caixa.top];
    if (x0 < 119.5 || y0 < 47.5 || x1 > 1800.5 || y1 > 980.5)
      r.foraDaArea.push(`caixa ${resumo(c, '')} [${Math.round(x0)}, ${Math.round(y0)} → ${Math.round(x1)}, ${Math.round(y1)}]`);
  }
  const relatados = new Set();
  const relatar = (chave, msg) => { if (!relatados.has(chave)) { relatados.add(chave); r.internos.push(msg); } };
  for (const t of textos) for (const q of t.rects) {
    for (const c of caixas) {
      const b = c.getBoundingClientRect();
      if (c.contains(t.el)) {
        if (q.left < b.left - 1 || q.right > b.right + 1 || q.top < b.top - 1 || q.bottom > b.bottom + 1)
          relatar(`v${caixas.indexOf(c)}|${textos.indexOf(t)}`, `texto vaza da caixa ${resumo(c, '')}: ${resumo(t.bloco)}`);
      } else if (cruza(q, b)) relatar(`c${caixas.indexOf(c)}|${textos.indexOf(t)}`, `texto invade a caixa ${resumo(c, '')}: ${resumo(t.bloco)}`);
    }
  }
  const idBloco = new Map();
  const id = b => { if (!idBloco.has(b)) idBloco.set(b, idBloco.size); return idBloco.get(b); };
  for (let i = 0; i < textos.length; i++) for (let j = i + 1; j < textos.length; j++) {
    const a = textos[i], b = textos[j];
    if (a.bloco === b.bloco || a.bloco.contains(b.bloco) || b.bloco.contains(a.bloco)) continue;
    if (a.rects.some(p => b.rects.some(q => cruza(p, q))))
      relatar(`s${id(a.bloco)}|${id(b.bloco)}`, `textos sobrepostos: ${resumo(a.bloco)} × ${resumo(b.bloco)}`);
  }

  // 2a. Palavras de texto corrido
  const FORA_DO_ORCAMENTO = [
    'h1', 'h2', 'h3',                                                         // títulos
    '.eyebrow', '.rotulo', '.chip', '.botao', '.trilho', '.raia-cab', '.ref', // rótulos
    '.numero',                                                                // números e legendas
    '.topo',                                                                  // cabeçalho
    '.campo', '.check', '.passo', '.no', '.ramo', '.fluxo',                            // microcopy de componente
    '.no-cadeia', '.derivacao', '.entrega', '.diagrama', '.capitulo',
  ].join(',');
  const contar = t => t.replace(/R\$\s*[\d.]+(,\d+)?|\d+º|[\d.,]+/g, ' ').split(/\s+/).filter(w => /\p{L}/u.test(w)).length;
  for (const { n, el } of textos) {
    const k = contar(n.textContent);
    r.visiveis += k;
    if (!el.closest(FORA_DO_ORCAMENTO)) r.corrido += k;
  }

  // 2b. Tamanho de fonte, fontes usadas e contraste
  const sobre = (c, base) => ({ r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a), a: 1 });
  const lum = c => { const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const clipTexto = cs => cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text';
  const fundo = el => {
    const cadeia = [];
    for (let a = el; a; a = a.parentElement) { cadeia.push(a); if (a === slide) break; }
    let base = { r: 255, g: 255, b: 255, a: 1 }, opacidade = 1;
    for (const a of cadeia.reverse()) {
      const cs = getComputedStyle(a);
      const gradienteDeTexto = clipTexto(cs);
      // brilhos do slide são decoração; fundo em degradê em outro elemento: contraste não medido
      if (cs.backgroundImage !== 'none' && a !== slide && !gradienteDeTexto) return null;
      const c = gradienteDeTexto ? null : cor(cs.backgroundColor);
      if (c && c.a > 0) base = sobre(c, base);
      opacidade *= parseFloat(cs.opacity);
    }
    return { base, opacidade };
  };
  // texto pintado com degradê (background-clip: text): devolve as cores das paradas do degradê
  const coresDoDegrade = el => {
    if (el instanceof SVGElement) { // SVG <text> com fill="url(#…)"
      const id = getComputedStyle(el).fill.match(/url\("?#([^")]+)"?\)/)?.[1];
      const g = id && document.getElementById(id);
      return g ? [...g.querySelectorAll('stop')].map(s => cor(getComputedStyle(s).stopColor)) : null;
    }
    for (let a = el; a && a !== slide; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (clipTexto(cs) && cs.backgroundImage !== 'none') return [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m => cor(m[0]));
      if (cs.display !== 'inline' && a !== el) break;
    }
    return null;
  };
  const vistos = new Set();
  for (const { el } of textos) {
    if (vistos.has(el)) continue;
    vistos.add(el);
    const cs = getComputedStyle(el);
    const tamanho = parseFloat(cs.fontSize), peso = parseInt(cs.fontWeight, 10);
    if (tamanho < fonteMinima) r.pequenos.push(`${resumo(el)} ${tamanho}px`);
    r.fontes.push(`${cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()}|${peso}`);
    const f = fundo(el), c = cor(cs.color);
    if (!f) continue;
    const grande = tamanho >= 24 || (tamanho >= 18.66 && peso >= 700);
    const minimo = grande ? 3 : 4.5;
    const degrade = coresDoDegrade(el);
    if (degrade?.length) {
      const pior = Math.min(...degrade.map(g => razao(sobre({ ...g, a: g.a * f.opacidade }, f.base), f.base)));
      if (pior < minimo) r.avisos.push(`degradê da marca em ${resumo(el)}: ${pior.toFixed(2)}:1 (mínimo ${minimo}:1)`);
      continue;
    }
    if (!c) continue;
    const frente = sobre({ ...c, a: c.a * f.opacidade }, f.base);
    const valor = razao(frente, f.base);
    if (valor < minimo) r.contraste.push(`${resumo(el)} ${valor.toFixed(2)}:1 < ${minimo}:1`);
  }

  // 3. Números (por bloco, para juntar "R$" e valor) e área útil
  const blocos = [...new Set(textos.map(t => t.bloco))];
  const DINHEIRO = ['R$ 23.402,22', 'R$ 3.546,30', 'R$ 5.700,00'];
  const totalSlides = document.querySelectorAll('.slide').length;
  // texto do próprio bloco: entra o conteúdo em linha (inline, inline-block…); filhos em bloco são varridos à parte
  const proprio = el => [...el.childNodes].map(n => n.nodeType === 3 ? n.textContent
    : n.nodeType === 1 && (n instanceof SVGElement || getComputedStyle(n).display.startsWith('inline')) ? proprio(n) : ' ').join('');
  for (const b of blocos) {
    const txt = proprio(b).replace(/\s+/g, ' ').trim();
    if (b.closest('.pagina')) { if (!/^0[1-9] \/ 0[1-9]$/.test(txt)) r.numeros.push(`paginação "${txt}"`); continue; }
    for (const m of txt.matchAll(/R\$\s*\d[\d.]*,\d{2}|\d+º|×\s*\d+|\d+(?:[.,]\d+)*/g)) {
      const s = m[0], antes = txt.slice(0, m.index);
      let ok;
      if (s.startsWith('R$')) ok = DINHEIRO.includes(s.replace(/^R\$\s*/, 'R$ '));
      else if (s.endsWith('º')) ok = s === '13º';
      else if (s.startsWith('×')) ok = /^×\s*100$/.test(s);
      else if (b.closest('.marco')) ok = ['1', '2', '3'].includes(s);
      else if (b.closest('.indice-num')) ok = /^0[1-9]$/.test(s) && Number(s) <= totalSlides; // sumário da introdução
      else if (/slides?\s+(\d\s+e\s+)?$/i.test(antes)) ok = /^[1-9]$/.test(s) && Number(s) <= totalSlides;
      else ok = s === '5' || s === '6';
      if (!ok) r.numeros.push(`"${s}" em ${resumo(b, txt)}`);
    }
    const q = b.getBoundingClientRect();
    const [x0, y0, x1, y1] = [q.left - caixa.left, q.top - caixa.top, q.right - caixa.left, q.bottom - caixa.top];
    if (x0 < 119.5 || y0 < 47.5 || x1 > 1800.5 || y1 > 980.5)
      r.foraDaArea.push(`${resumo(b, txt)} [${Math.round(x0)}, ${Math.round(y0)} → ${Math.round(x1)}, ${Math.round(y1)}]`);
  }
  r.fontes = [...new Set(r.fontes)];
  return r;
}

const falhas = [];
const avisos = [];
const linhas = [];
const fontesUsadas = new Set();
for (let i = 0; i < total; i++) {
  if (i > 0) await page.keyboard.press('ArrowRight');
  await page.waitForFunction(k => document.querySelectorAll('.slide')[k].classList.contains('ativo'), i);
  const indicador = await page.textContent('#nav-indicador');
  const esperado = `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const r = await page.evaluate(analisar, { indice: i, limitePalavras: LIMITE_PALAVRAS, fonteMinima: FONTE_MINIMA });
  const nn = String(i + 1).padStart(2, '0');
  const f = [];
  if (indicador !== esperado) f.push(`indicador mostra "${indicador}", esperado "${esperado}"`);
  r.overflow.forEach(x => f.push(`overflow: ${x}`));
  r.internos.forEach(x => f.push(x));
  if (r.corrido > LIMITE_PALAVRAS) f.push(`texto corrido com ${r.corrido} palavras (limite ${LIMITE_PALAVRAS})`);
  r.pequenos.forEach(x => f.push(`fonte < ${FONTE_MINIMA}px: ${x}`));
  r.numeros.forEach(x => f.push(`número fora da lista: ${x}`));
  r.contraste.forEach(x => f.push(`contraste: ${x}`));
  r.foraDaArea.forEach(x => f.push(`fora da área útil: ${x}`));
  r.fontes.forEach(x => fontesUsadas.add(x));
  r.avisos.forEach(x => avisos.push(`slide ${nn} · ${x}`));
  falhas.push(...f.map(x => `slide ${nn} · ${x}`));
  linhas.push({ slide: nn, nome: r.nome, corrido: r.corrido, visiveis: r.visiveis, falhas: f.length });
  await page.locator('.slide').nth(i).screenshot({ path: path.join(pastaSlides, `slide-${nn}.png`) });
}

// Fontes: todo peso usado precisa ter face embutida e carregada (rede bloqueada).
for (const chave of fontesUsadas) {
  const [familia, peso] = chave.split('|');
  if (!FACES_EMBUTIDAS[familia]?.includes(Number(peso))) { falhas.push(`fonte sem face embutida: ${familia} ${peso}`); continue; }
  const ok = await page.evaluate(([fam, p]) => document.fonts.check(`${p} 20px "${fam}"`), [familia, peso]);
  if (!ok) falhas.push(`fonte não carregou offline: ${familia} ${peso}`);
}
const facesComErro = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'error').map(f => `${f.family} ${f.weight}`));
facesComErro.forEach(x => falhas.push(`face com erro de carregamento: ${x}`));
errosJs.forEach(x => falhas.push(`erro de JavaScript: ${x}`));

// PDF: uma página por slide, de 1920×1080 (1440×810 pt).
await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true });
const info = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
const paginas = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
const formato = info.match(/^Page size:\s+(.+)$/m)?.[1].trim();
if (paginas !== total) falhas.push(`PDF com ${paginas} páginas, esperado ${total}`);
if (!/^1440(\.0+)? x 810(\.0+)? pts/.test(formato ?? '')) falhas.push(`PDF com página "${formato}", esperado 1440 x 810 pts (1920×1080 px)`);
await browser.close();

console.log('\nslide  nome               corrido  visíveis  falhas');
for (const l of linhas) console.log(`  ${l.slide}   ${l.nome.padEnd(18)} ${String(l.corrido).padStart(4)}/${LIMITE_PALAVRAS}  ${String(l.visiveis).padStart(6)}  ${String(l.falhas).padStart(6)}`);
console.log(`\nfontes usadas: ${[...fontesUsadas].sort().join(', ')}`);
console.log(`requisições externas bloqueadas: ${bloqueadas.length}${bloqueadas.length ? ` (${[...new Set(bloqueadas.map(u => new URL(u).host))].join(', ')})` : ''}`);
console.log(`PDF: ${paginas} páginas · ${formato} → ${path.relative(raiz, pdfPath)}`);
console.log(`PNGs: ${path.relative(raiz, pastaSlides)}/slide-01.png … slide-${String(total).padStart(2, '0')}.png`);
if (avisos.length) {
  console.log(`\n! ${avisos.length} aviso(s) — exceção de marca, não reprovam:`);
  avisos.forEach(x => console.log(`  - ${x}`));
}
if (falhas.length) {
  console.log(`\n✗ ${falhas.length} falha(s):`);
  falhas.forEach(x => console.log(`  - ${x}`));
  process.exit(1);
}
console.log('\n✓ Todas as verificações passaram.');
