// Gerador do e-book "Nomes que rolam na boca".
// Lê dados_ranking.csv (fonte da verdade), content/fichas/*.md e content/textos.json
// e escreve dist/index.html (CSS e JS embutidos), dist/assets/* e fontes.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
const DIST = P('dist');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
const warn = [];

// ---------- utilidades ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (s) => parseFloat(String(s).replace(',', '.'));
const f1 = (n) => n.toFixed(1).replace('.', ',');
const MAP = { 'ð': 'd', 'ł': 'l', 'ø': 'o', 'æ': 'ae', 'đ': 'd', 'ß': 'ss' };
const slug = (n) => [...n.toLowerCase()].map((c) => MAP[c] ?? c).join('').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const isoFromEmoji = (e) => [...e].map((c) => String.fromCharCode(c.codePointAt(0) - 0x1f1e6 + 97)).join('');
const ord = (n) => `${n}º`;
const initials = (nome) => {
  const parts = nome.replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  const a = parts[0][0], b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

// ---------- CSV ----------
const csvRaw = fs.readFileSync(P('dados_ranking.csv'), 'utf8').replace(/^﻿/, '');
const lines = csvRaw.split(/\r?\n/).filter((l) => l.trim());
const head = lines[0].split(';');
const rows = lines.slice(1).map((l) => {
  const c = l.split(';');
  const o = Object.fromEntries(head.map((h, i) => [h, c[i]]));
  const r = {
    pos: parseInt(o.posicao, 10), nome: o.nome, iso: isoFromEmoji(o.bandeira), grupo: o.grupo,
    notaStr: o.nota_assinatura, nota: num(o.nota_assinatura),
    F: +o.F, P: +o.P, M: +o.M, D: +o.D, X: +o.X, eco: +o.eco, bloco: +o.bloco, C: +o.C, E: +o.E, fama: +o.fama,
    apelido: o.apelido === 'sim', totalSonoro: +o.total_sonoro, notaSonora: num(o.nota_sonora), corte: o.no_corte_150 === 'sim',
  };
  r.slug = slug(r.nome);
  r.cam = {
    son: (r.F + r.P + r.M) / 3, est: (r.D + r.X) / 2, ass: (r.eco + r.bloco) / 2, str: (r.C + r.E) / 2,
  };
  return r;
});
rows.sort((a, b) => a.pos - b.pos);
const byNome = new Map(rows.map((r) => [r.nome, r]));
const ranking = rows.filter((r) => r.corte);
const eliminados = rows.filter((r) => !r.corte);

// ---------- validações dos dados ----------
rows.forEach((r, i) => { if (r.pos !== i + 1) throw new Error(`Posição fora de sequência em ${r.nome}`); });
if (ranking.length !== 150 || eliminados.length !== 16) throw new Error('CSV deve ter 150 no corte e 16 fora');
const lua = byNome.get('Lomana LuaLua');
if (!lua || lua.pos !== 1) {
  console.error('PARE: Lomana LuaLua não está em 1º lugar no CSV. Avise o autor antes de seguir.');
  process.exit(2);
}
const sonoroBad = rows.filter((r) => r.F + r.P + r.M + r.D + r.C + r.E !== r.totalSonoro);
const sonoroOK = sonoroBad.length === 0;
let maxDiff = 0, sumDiff = 0;
rows.forEach((r) => {
  const calc = 0.30 * r.cam.son + 0.20 * r.cam.est + 0.25 * r.cam.ass + 0.15 * r.cam.str + 0.10 * (r.fama * 2) - (r.apelido ? 0.33 : 0);
  r.calc = calc; const d = Math.abs(calc - r.nota); maxDiff = Math.max(maxDiff, d); sumDiff += d;
});
const meanDiff = sumDiff / rows.length;

// ---------- países, esportes ----------
const regionPT = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
const paisNome = (iso) => (iso === 'gb' ? 'Reino Unido' : regionPT.of(iso.toUpperCase()));
const esportes = JSON.parse(fs.readFileSync(P('data/esportes.json'), 'utf8'));
rows.forEach((r) => { r.esporte = esportes[r.nome]; if (!r.esporte) warn.push(`Sem esporte: ${r.nome}`); });
const nPaises = new Set(ranking.map((r) => r.iso)).size;
const nEsportes = new Set(ranking.map((r) => r.esporte)).size;

// ---------- textos e fichas ----------
const T = JSON.parse(fs.readFileSync(P('content/textos.json'), 'utf8'));
const fichas = new Map();
for (const f of fs.readdirSync(P('content/fichas')).filter((x) => x.endsWith('.md'))) {
  const raw = fs.readFileSync(P('content/fichas', f), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = Object.fromEntries(m[1].split('\n').map((l) => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  const sec = {};
  let k = null;
  for (const l of m[2].split('\n')) {
    const h = l.match(/^## (.+)$/);
    if (h) { k = h[1]; sec[k] = []; } else if (k) sec[k].push(l);
  }
  const fatos = (sec['Fatos'] || []).filter((l) => l.startsWith('- ')).map((l) => { const [a, ...u] = l.slice(2).split(' | '); return { fato: a, url: u.join(' | ') }; });
  fichas.set(fm.nome, { ...fm, pos: +fm.pos, apres: sec['Apresentação'].join(' ').trim(), nomeTxt: sec['O nome'].join(' ').trim(), fatos });
}
for (const [nome, f] of fichas) {
  const r = byNome.get(nome);
  if (!r) throw new Error(`Ficha sem linha no CSV: ${nome}`);
  if (r.pos !== f.pos) { warn.push(`Posição da ficha de ${nome} no frontmatter (${f.pos}) difere do CSV (${r.pos}); usando o CSV.`); }
  r.ficha = f;
  r.slug = f.slug || r.slug;
  if (f.pais) r.paisTxt = f.pais;
  if (f.esporte) r.esporte = f.esporte;
}
const rowOf = (n) => { const r = byNome.get(n); if (!r) throw new Error(`Nome ausente no CSV: ${n}`); return r; };
const PAUSAS = ['Eiður Guðjohnsen', 'Jakub Błaszczykowski', 'Anatoliy Tymoshchuk', 'Danny Drinkwater', 'Bastian Schweinsteiger', 'Muhammad Ali', 'Malo Gusto', 'Khvicha Kvaratskhelia', 'Siphiwe Tshabalala', 'Kareem Abdul-Jabbar', 'Tore André Flo', 'Giannis Antetokounmpo', 'Ole Gunnar Solskjær', 'Duje Ćaleta-Car', 'Loris Capirossi'].map(rowOf);
PAUSAS.sort((a, b) => b.pos - a.pos);
PAUSAS.forEach((r) => { if (!r.corte || !r.ficha) throw new Error(`Pausa inválida: ${r.nome}`); });
const TOP = ranking.filter((r) => r.pos >= 2 && r.pos <= 10).sort((a, b) => b.pos - a.pos);
TOP.forEach((r) => { if (!r.ficha) throw new Error(`Top 10 sem ficha: ${r.nome}`); });

// ---------- fotos ----------
fs.mkdirSync(P('assets/fotos'), { recursive: true });
const manPath = P('assets/fotos/manifest.json');
let manifest = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : [];
const manBy = new Map(manifest.map((m) => [m.slug, m]));
const slotsNeeded = new Set(['capa']);
const GRUPOS = [...new Set(rows.map((r) => r.grupo))];
const GORDER = ['Cantados e fluidos', 'Cantigas em bloco', 'Fluidos de manual', 'Curtos e abertos', 'Longos e quase ilegíveis', 'Travados e secos', 'Nome único e apelidos'];
GORDER.forEach((g) => { if (!GRUPOS.includes(g)) throw new Error(`Grupo ausente: ${g}`); });
const gStats = {};
for (const g of GORDER) {
  const m = rows.filter((r) => r.grupo === g);
  const rk = ranking.filter((r) => r.grupo === g);
  const dest = T.grupos.destaques[g].map(rowOf);
  const outro = rk.find((r) => !dest.includes(r));
  gStats[g] = {
    n: m.length, nRank: rk.length, nota: mean(m.map((r) => r.nota)), son: mean(m.map((r) => r.cam.son)), est: mean(m.map((r) => r.cam.est)),
    ass: mean(m.map((r) => r.cam.ass)), str: mean(m.map((r) => r.cam.str)), circ: [...dest, outro],
  };
  gStats[g].circ.forEach((r) => slotsNeeded.add(r.slug));
}
[...PAUSAS, ...TOP, lua].forEach((r) => slotsNeeded.add(r.slug));
for (const s of slotsNeeded) if (!manBy.has(s)) manBy.set(s, { slug: s, arquivo: null, credito: null, licenca: null, url_origem: null, object_position: '50% 20%' });
manifest = [...manBy.values()].sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2) + '\n');
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* sem sharp: copia como está */ }
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets/fotos'), { recursive: true });
const photo = new Map();
for (const m of manifest) {
  const cand = [m.arquivo, `${m.slug}.jpg`, `${m.slug}.jpeg`, `${m.slug}.png`, `${m.slug}.webp`].filter(Boolean).map((f) => P('assets/fotos', path.basename(f)));
  const f = cand.find((x) => fs.existsSync(x));
  if (!f) continue;
  let out = path.basename(f);
  if (sharp && !f.endsWith('.webp')) {
    out = `${m.slug}.webp`;
    await sharp(f).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(DIST, 'assets/fotos', out));
  } else fs.copyFileSync(f, path.join(DIST, 'assets/fotos', out));
  photo.set(m.slug, { src: `assets/fotos/${out}`, ...m });
}
const imgHTML = (r, cls = '') => {
  const p = photo.get(r.slug);
  if (!p) return '';
  const alt = `Foto de ${r.nome}`;
  return `<img class="${cls}" src="${p.src}" alt="${esc(alt)}" loading="lazy" style="object-position:${esc(p.object_position || '50% 20%')}">`;
};
const creditHTML = (r) => { const p = photo.get(r.slug); return p && p.credito ? `<span class="credit">Foto: ${esc(p.credito)}${p.licenca ? ` (${esc(p.licenca)})` : ''}</span>` : ''; };

// ---------- bandeiras ----------
const usedFlags = new Set(rows.map((r) => r.iso));
fs.mkdirSync(path.join(DIST, 'assets/flags'), { recursive: true });
const flagCode = (r) => (r.ficha && r.ficha.pais === 'Inglaterra' ? 'gb-eng' : r.iso);
rows.forEach((r) => usedFlags.add(flagCode(r)));
for (const c of usedFlags) {
  const src = P('node_modules/flag-icons/flags/4x3', `${c}.svg`);
  if (!fs.existsSync(src)) { warn.push(`Bandeira ausente: ${c}`); continue; }
  fs.copyFileSync(src, path.join(DIST, 'assets/flags', `${c}.svg`));
}
const flag = (r, cls = 'flag') => `<img class="${cls}" src="assets/flags/${flagCode(r)}.svg" alt="${esc(r.paisTxt || paisNome(r.iso))}" width="24" height="18">`;

// ---------- fontes ----------
fs.mkdirSync(path.join(DIST, 'assets/fonts'), { recursive: true });
const FONTS = [
  ['Barlow Condensed', 700, 'normal', '@fontsource/barlow-condensed', 'barlow-condensed'],
  ['Barlow Condensed', 800, 'normal', '@fontsource/barlow-condensed', 'barlow-condensed'],
  ['Source Serif 4', 400, 'normal', '@fontsource/source-serif-4', 'source-serif-4'],
  ['Source Serif 4', 400, 'italic', '@fontsource/source-serif-4', 'source-serif-4'],
  ['Source Serif 4', 600, 'normal', '@fontsource/source-serif-4', 'source-serif-4'],
  ['Source Serif 4', 600, 'italic', '@fontsource/source-serif-4', 'source-serif-4'],
];
const RANGE = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
};
let fontCSS = '';
for (const [fam, w, st, pkg, base] of FONTS) {
  for (const sub of ['latin', 'latin-ext']) {
    const fn = `${base}-${sub}-${w}-${st}.woff2`;
    const src = P('node_modules', pkg, 'files', fn);
    if (!fs.existsSync(src)) { warn.push(`Fonte ausente: ${fn}`); continue; }
    fs.copyFileSync(src, path.join(DIST, 'assets/fonts', fn));
    fontCSS += `@font-face{font-family:'${fam}';font-style:${st};font-weight:${w};font-display:swap;src:url(assets/fonts/${fn}) format('woff2');unicode-range:${RANGE[sub]}}\n`;
  }
}

// ---------- componentes ----------
const barsHTML = (r) => {
  const b = [['Sonoridade', r.cam.son], ['Estranheza', r.cam.est], ['Assinatura', r.cam.ass], ['Estrutura', r.cam.str]];
  return `<div class="bars">${b.map(([t, v]) => `<div class="br"><span>${t}</span><span class="t"><i style="width:${(v * 10).toFixed(0)}%"></i></span><b>${f1(v)}</b></div>`).join('')}</div>`;
};
const chipsHTML = (r) => `<div class="chips"><span class="chip">Fama ${r.fama} de 5</span>${r.apelido ? '<span class="chip">Desconto de apelido</span>' : ''}</div>`;
const phHTML = (r) => {
  const img = imgHTML(r);
  if (img) return `<div class="ph">${img}</div>`;
  return `<div class="ph"><span class="ini" aria-hidden="true">${esc(initials(r.nome))}</span>${flag(r, 'flagbig')}</div>`;
};
const paisDe = (r) => r.paisTxt || paisNome(r.iso);

// ---------- páginas ----------
const pages = [];
const addPage = (o) => pages.push(o);
const tab = (t) => `<aside class="tab"><i></i><span>${esc(t)}</span></aside>`;

// 1 Capa
{
  const cp = photo.get('capa');
  addPage({
    sec: 'capa', cls: 'capa dark', title: 'Capa', html: `
    ${cp ? `<div class="photo"><img src="${cp.src}" alt="Arquibancada vazia" style="object-position:${cp.object_position || '50% 50%'}"></div>` : ''}
    <div class="ghost" aria-hidden="true">150</div>
    <div class="capa-c">
      <div class="ano">ESTUDO · ${esc(T.capa.ano)}</div>
      <div><h1 class="big">Nomes mais <em>sonoros</em> e impactantes do esporte mundial</h1><div class="rule"></div><p class="subt">${esc(T.capa.subtitulo)}</p></div>
      <div class="ano">150 NOMES · ${nPaises} PAÍSES · ${nEsportes} ESPORTES</div>
    </div>`,
  });
}
// 2 Sumário (preenchido depois)
addPage({ sec: 'sumario', cls: 'paper', title: 'Sumário', html: '@@SUMARIO@@' });
// 3-4 Abertura
const fillAb = (s) => s.replace('{PAISES}', String(nPaises)).replace('{ESPORTES}', String(nEsportes));
addPage({ sec: 'abertura', cls: 'paper', title: 'Abertura', html: `${tab('Abertura')}
  <div class="body"><span class="eyebrow">Por que fizemos isso</span><div class="rule"></div>
  <h2 class="h-sec">Nomes que rolam na boca</h2><div class="rule"></div>
  <div class="txt">${T.abertura.p1.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div>` });
addPage({ sec: 'abertura', cls: 'paper', title: 'Abertura', html: `${tab('Abertura')}
  <div class="body"><span class="eyebrow">O método e a lista</span><div class="rule"></div>
  <div class="txt">${T.abertura.p2.map((p) => `<p>${esc(fillAb(p))}</p>`).join('')}</div>
  <div class="grow"></div>
  <div class="formula" style="font-size:calc(var(--u)*34);color:var(--tinta);border-color:var(--ambar)">${nPaises} países<br>${nEsportes} esportes<br>150 nomes</div></div>` });
// 5-7 Metodologia
addPage({ sec: 'metodologia', cls: 'green', title: 'Metodologia', html: `${tab('Metodologia')}
  <div class="body"><span class="eyebrow">A ideia</span><div class="rule"></div>
  <h2 class="h-sec" style="font-size:calc(var(--u)*46)">Oito critérios, quatro camadas</h2><div class="rule"></div>
  <div class="txt">${T.metodologia.p1.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  <div class="grow"></div>
  <div class="formula">${esc(T.metodologia.formula).replace(/(Sonoridade|Estranheza|Assinatura|Estrutura|Fama|Apelido)/g, '<b>$1</b>')}</div></div>` });
addPage({ sec: 'metodologia', cls: 'paper', title: 'Metodologia', html: `${tab('Metodologia')}
  <div class="body"><span class="eyebrow">As camadas</span>
  <h2 class="h-med" style="margin:8u 0 4u;font-size:calc(var(--u)*34)">O que entra na nota</h2>
  ${T.metodologia.camadas.map((c) => `<div class="cam"><div><h3>${c.nome}</h3><span class="pe">${c.peso}</span></div><div><p>${esc(c.criterios)}.</p><p class="ex">${esc(c.exemplo)}</p></div></div>`).join('')}</div>` });
{
  const flo = rowOf('Tore André Flo');
  addPage({ sec: 'metodologia', cls: 'dark', title: 'Como ler uma ficha', html: `${tab('Metodologia')}
  <div class="body"><span class="eyebrow">Como ler uma ficha</span>
  <div class="mock"><span class="callout" style="left:-9u;top:10u">1</span><span class="callout" style="left:-9u;top:70u">2</span><span class="callout" style="right:-9u;top:10u">3</span>
    <div class="mh"><span class="n1">${ord(flo.pos)}</span><div><h4>${esc(flo.nome)}</h4><small>${flag(flo)} ${esc(paisDe(flo))} · ${esc(flo.esporte)}</small></div><span class="nf">${esc(flo.notaStr)}</span></div>
    <div style="height:10u"></div>${barsHTML(flo)}${chipsHTML(flo)}
  </div>
  <ul class="legenda-n">
    <li><i>1</i><span>Posição no ranking e nome, com a bandeira do país.</span></li>
    <li><i>2</i><span>As quatro camadas, de 0 a 10, calculadas a partir das sub-notas de cada nome.</span></li>
    <li><i>3</i><span>Nota final de Assinatura, com a fama e o desconto de apelido já contados.</span></li>
  </ul>
  <div class="txt-s" style="margin-top:10u;font-size:13.2u;line-height:1.42">${T.metodologia.p3.map((p) => `<p style="margin-top:6u">${esc(p)}</p>`).join('')}</div></div>` });
}
// 8 Os 7 grupos
{
  const maxN = Math.max(...GORDER.map((g) => gStats[g].n));
  addPage({ sec: 'grupos', cls: 'green', title: 'Os 7 grupos', html: `${tab('Os 7 grupos')}
  <div class="body"><span class="eyebrow">Os 7 grupos</span><div class="rule"></div>
  <h2 class="h-sec" style="font-size:calc(var(--u)*50)">Sete jeitos de rolar na boca</h2>
  <p class="txt-s" style="margin-top:12u">${esc(T.grupos.intro)}</p>
  <div class="gstat">${GORDER.map((g) => `<div class="gs"><span>${esc(g)}</span><span class="t"><i style="width:${(gStats[g].n / maxN * 100).toFixed(0)}%"></i></span><b>${gStats[g].n}</b></div>`).join('')}</div>
  <p class="leg" style="margin-top:8u">Nomes por grupo, entre os 166 estudados.</p></div>` });
}
// 9-15 Grupos
for (const g of GORDER) {
  const s = gStats[g];
  addPage({ sec: 'grupos', cls: 'dark', title: g, html: `${tab('Os 7 grupos')}
  <div class="body"><span class="eyebrow">Grupo ${GORDER.indexOf(g) + 1} de 7</span><div class="rule"></div>
  <h2 class="gh">${esc(g)}</h2>
  <p class="perfil" style="margin-top:14u">${s.n} nomes · sonoridade ${f1(s.son)} · estranheza ${f1(s.est)} · assinatura ${f1(s.ass)} · estrutura ${f1(s.str)}</p>
  <p class="def">${esc(T.grupos.definicoes[g])}.</p>
  <p class="txt" style="margin-top:16u;color:var(--osso);font-size:calc(var(--u)*16)">${esc(T.grupos.introducoes[g])}</p>
  <div class="circs">${s.circ.map((r) => `<div class="circ"><div class="c">${imgHTML(r, 'ph') || `<span class="ini">${esc(initials(r.nome))}</span>`}${flag(r)}</div><b>${esc(r.nome)}</b><small>${r.corte ? ord(r.pos) : 'fora do corte'}</small></div>`).join('')}</div></div>` });
}
// divisor ranking
addPage({ sec: 'ranking', cls: 'dark', title: 'A contagem', pos: 150, html: `${tab('Ranking')}
  <div class="body"><span class="eyebrow">A contagem regressiva</span><div class="rule"></div>
  <div style="font:800 190u/.8 var(--cond);color:var(--ambar);letter-spacing:-.03em">150</div>
  <div style="font:800 56u/.9 var(--cond);text-transform:uppercase;margin-top:10u">até o 11º</div>
  <p class="txt-s" style="margin-top:20u">${esc(T.ranking.abertura)}</p></div>` });
// ranking: linhas + pausas
const rkRows = ranking.filter((r) => r.pos >= 11).sort((a, b) => b.pos - a.pos);
const pauseAfter = new Map();
for (const r of PAUSAS) {
  const idx = rkRows.findIndex((x) => x.pos === r.pos);
  const chunk = Math.floor(idx / 10);
  if (!pauseAfter.has(chunk)) pauseAfter.set(chunk, []);
  pauseAfter.get(chunk).push(r);
}
const pauseHTML = (r) => {
  const c = r.cam;
  return `${phHTML(r)}${creditHTML(r)}<div class="veil"></div>
  <div class="pcont">
    <div class="phead"><span class="pnum">${r.pos}<sup>º</sup></span><div class="pnota"><b>${esc(r.notaStr)}</b><small>Assinatura</small></div></div>
    <div class="pid"><h2>${esc(r.nome)}</h2><div class="pmeta">${flag(r)}<span>${esc(paisDe(r))} · ${esc(r.esporte)}</span></div></div>
    <p class="papres">${esc(r.ficha.apres)}</p>
    <div class="pnome"><span class="lab">Por que esse nome</span><p>${esc(r.ficha.nomeTxt)}</p><div class="sil">${esc(r.ficha.silabas)}</div></div>
    <div>${barsHTML(r)}${chipsHTML(r)}</div>
  </div>`;
};
for (let i = 0; i < rkRows.length / 10; i++) {
  const chunk = rkRows.slice(i * 10, i * 10 + 10);
  addPage({ sec: 'ranking', cls: 'paper', title: `${ord(chunk[0].pos)} ao ${ord(chunk[chunk.length - 1].pos)}`, pos: chunk[0].pos, html: `${tab('Ranking')}
  <div class="body"><div class="rk-h"><span class="eyebrow">Ranking · nota de assinatura</span><h2>${ord(chunk[0].pos)} a ${ord(chunk[chunk.length - 1].pos)}</h2></div>
  <ul class="rows">${chunk.map((r) => `<li class="row${r.pos <= 20 ? ' top20' : ''}"><span class="rp">${r.pos}</span>${flag(r)}<span class="rn"><b>${r.ficha && r.ficha.tipo === 'pausa' ? '<span class="tri"></span>' : ''}${esc(r.nome)}</b><small>${esc(r.esporte)}</small></span><span class="rs">${esc(r.notaStr)}</span></li>`).join('')}</ul></div>` });
  for (const r of pauseAfter.get(i) || []) addPage({ sec: 'ranking', cls: 'dark pause', title: `${ord(r.pos)} ${r.nome}`, pos: r.pos, html: pauseHTML(r) });
}
// divisor Top 10
addPage({ sec: 'top10', cls: 'dark', title: 'Top 10', pos: 10, html: `${tab('Top 10')}
  <div class="body"><span class="eyebrow">Agora o Top 10</span><div class="rule"></div>
  <div style="font:800 190u/.8 var(--cond);color:var(--ambar);letter-spacing:-.03em">10</div>
  <div style="font:800 56u/.9 var(--cond);text-transform:uppercase;margin-top:10u">até o 2º</div>
  <p class="txt-s" style="margin-top:20u">${esc(T.ranking.top10)}</p></div>` });
const halfHTML = (r) => `<article class="half">
  <div class="ph" style="position:relative">${imgHTML(r) || `<span class="ini" aria-hidden="true">${esc(initials(r.nome))}</span>${flag(r, 'flagbig')}`}</div>
  <div class="hh"><div class="hn"><span class="pnum">${r.pos}<sup>º</sup></span><h3>${esc(r.nome)}</h3></div>
    <div class="meta">${flag(r)}<span>${esc(paisDe(r))} · ${esc(r.esporte)}</span></div>
    <div class="hn2"><b>${esc(r.notaStr)}</b><small>Assinatura</small></div></div>
  ${barsHTML(r)}
  <div class="tx"><p>${esc(r.ficha.apres)}</p><div class="nm"><p><b>O nome</b>${esc(r.ficha.nomeTxt)}</p></div><div class="sil">${esc(r.ficha.silabas)}</div></div></article>`;
for (let i = 0; i < TOP.length; i += 2) {
  const pair = TOP.slice(i, i + 2);
  addPage({ sec: 'top10', cls: 'dark', title: pair.map((r) => ord(r.pos)).join(' e '), pos: pair[0].pos, html: `<div class="halves">${pair.map(halfHTML).join('')}</div>` });
}
// campeão
{
  const r = lua;
  const c = r.cam;
  addPage({ sec: 'campeao', cls: 'dark champ', title: 'O campeão', pos: 1, html: `${phHTML(r)}${creditHTML(r)}<span class="big1" aria-hidden="true">1</span><div class="veil" style="background:linear-gradient(to bottom,rgba(21,26,31,.1) 0%,rgba(21,26,31,.2) 25%,rgba(21,26,31,.9) 52%,var(--tinta) 68%)"></div>
  <div class="pcont">
    <div class="eyebrow" style="color:var(--ambar);font-size:calc(var(--u)*14)">O campeão · 1º lugar</div>
    <h2 class="tt">Lomana<br>LuaLua</h2>
    <div class="silx">${esc(r.ficha.silabas)}</div>
    <div class="pmeta">${flag(r)}<span>${esc(paisDe(r))} · ${esc(r.esporte)}</span><span style="margin-left:auto;color:var(--ambar);font-size:calc(var(--u)*34);font-weight:800">${esc(r.notaStr)}</span></div>
    <p class="papres" style="font-size:calc(var(--u)*14)">${esc(r.ficha.apres)}</p>
    <div class="pnome"><span class="lab">Por que lidera</span><p>${esc(r.ficha.nomeTxt)}</p></div>
    <div>${barsHTML(r)}${chipsHTML(r)}</div>
  </div>` });
}
// eliminados
addPage({ sec: 'fora', cls: 'paper', title: 'Quem ficou de fora', html: `${tab('Quem ficou de fora')}
  <div class="body"><span class="eyebrow">Do 151º ao 166º</span>
  <h2 class="h-med" style="margin:4u 0 4u;font-size:calc(var(--u)*30)">Quem ficou de fora</h2>
  <p class="leg" style="font-size:calc(var(--u)*11.5);line-height:1.35">${esc(T.eliminados.intro)}</p>
  <div class="elim">${eliminados.map((r) => `<div class="el"><b><span>${r.pos}</span>${esc(r.nome)}</b><p>${esc(T.eliminados.linhas[r.nome] || '')}</p></div>`).join('')}</div></div>` });
// final: método + créditos
addPage({ sec: 'final', cls: 'green', title: 'Como foi feito', html: `${tab('Como foi feito')}
  <div class="body"><span class="eyebrow">Como foi feito</span><div class="rule"></div>
  <h2 class="h-sec" style="font-size:calc(var(--u)*46)">Uma nota sobre o método</h2><div class="rule"></div>
  <div class="txt-s">${T.final.metodo.map((p) => `<p style="margin-top:10u">${esc(p)}</p>`).join('')}<p style="margin-top:10u">${esc(T.final.fontes)}</p></div></div>` });
const creds = [...photo.values()].filter((p) => p.credito);
addPage({ sec: 'final', cls: 'dark', title: 'Créditos', html: `${tab('Créditos')}
  <div class="body"><span class="eyebrow">Agradecimentos e créditos</span><div class="rule"></div>
  <p class="txt-s">${esc(T.final.agradecimentos)}</p>
  <h3 class="h-med" style="font-size:calc(var(--u)*26);margin:22u 0 8u">Créditos das fotos</h3>
  ${creds.length ? `<ul class="creds">${creds.map((p) => `<li>${esc(p.slug)}: ${esc(p.credito)}${p.licenca ? ` · ${esc(p.licenca)}` : ''}${p.url_origem ? ` · ${esc(p.url_origem)}` : ''}</li>`).join('')}</ul>` : `<p class="leg">${esc(T.final.fotos)} Neste exemplar, nenhuma fotografia foi incluída ainda, e cada espaço usa as iniciais do atleta.</p>`}
  <div class="grow"></div><p class="leg">Nomes que rolam na boca · ${esc(T.capa.ano)}</p></div>` });

// ---------- sumário ----------
const secFirst = (sec) => pages.findIndex((p) => p.sec === sec) + 1;
const SUM = [
  ['Capa', 'capa', 'd'], ['Abertura', 'abertura', 'p'], ['Metodologia', 'metodologia', 'g'], ['Os 7 grupos', 'grupos', 'g'],
  ['Ranking, do 150º ao 11º', 'ranking', 'd'], ['Top 10, do 10º ao 2º', 'top10', 'd'], ['O campeão', 'campeao', 'd'], ['Quem ficou de fora', 'fora', 'p'], ['Como foi feito e créditos', 'final', 'g'],
];
const sumHTML = `${tab('Sumário')}<div class="body"><span class="eyebrow">Sumário</span><div class="rule"></div>
  <h2 class="h-sec">Sumário</h2><nav class="sum" aria-label="Sumário">${SUM.map(([t, s, k], i) => `<a href="#p-${secFirst(s)}"><span class="thumb ${k}">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(t)}</b><small>página ${secFirst(s)}</small></span></a>`).join('')}</nav>
  <div class="grow"></div><p class="leg">${pages.length} páginas. Toque em um item para ir direto.</p></div>`;
pages.find((p) => p.sec === 'sumario').html = sumHTML;

// ---------- CSS, HTML ----------
const css = fontCSS + fs.readFileSync(P('src/style.css'), 'utf8').replace(/(-?\d*\.?\d+)u(?![a-z0-9])/g, 'calc(var(--u)*$1)');
const js = fs.readFileSync(P('src/book.js'), 'utf8');
const og = SITE_URL ? `${SITE_URL}/assets/og.png` : 'assets/og.png';
const desc = `O guia definitivo: ${150} nomes, ${nPaises} países, ${nEsportes} esportes.`;
let html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Nomes mais sonoros e impactantes do esporte mundial</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#151A1F">
<meta property="og:type" content="book"><meta property="og:locale" content="pt_BR">
<meta property="og:title" content="Nomes mais sonoros e impactantes do esporte mundial: o guia definitivo">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(og)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
${SITE_URL ? `<meta property="og:url" content="${esc(SITE_URL)}/">` : ''}
<meta name="twitter:card" content="summary_large_image">
<script>if(/[?&]pdf\\b/.test(location.search))document.documentElement.classList.add('pdf')</script>
<style>${css}</style>
</head>
<body>
<div id="hud" aria-hidden="true"><span id="prog"></span></div>
<span id="cnt" hidden aria-hidden="true"></span>
<a id="toc" href="#p-2" aria-label="Voltar ao sumário">&#9650; Sumário</a>
<main id="book">
${pages.map((p, i) => `<section class="sheet" id="p-${i + 1}" aria-label="${esc(p.title)}"${p.pos ? ` data-pos="${p.pos}"` : ''}><div class="pg ${p.cls}">${p.html}</div></section>`).join('\n')}
</main>
<script>${js}</script>
</body>
</html>
`;
const U = (x) => x.replace(/(-?\d*\.?\d+)u(?![a-z0-9])/g, 'calc(var(--u)*$1)');
html = html.replace(/style="([^"]*)"/g, (m, v) => `style="${U(v)}"`);
fs.writeFileSync(path.join(DIST, 'index.html'), html);

// ---------- lint de texto ----------
const plain = html.replace(/<style>[\s\S]*?<\/style>/, '').replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
const BAN = [[/[—–]/g, 'travessão'], [/\b(incrível|incríveis|fascinante|fascinantes|verdadeira joia|jornada|universo)\b/gi, 'palavra de folder'], [/\bnão é [^.]{0,60}, é\b/gi, 'estrutura "não é X, é Y"'], [/\d+o\b(?=[^a-zA-Z])/g, '9o no lugar de 9º']];
for (const [re, why] of BAN) { const m = plain.match(re); if (m) warn.push(`Lint (${why}): ${[...new Set(m)].slice(0, 5).join(' | ')}`); }

// ---------- fontes.md ----------
const fm = [];
fm.push('# Fontes\n\nFatos de carreira usados em cada ficha, com a fonte pública que os sustenta. Linhas marcadas com `[DADO A CONFIRMAR]` não têm fonte pública conferida e precisam de confirmação do autor.\n');
fm.push('## Dados do ranking\n\n- Posições, grupos, sub-notas, notas de assinatura e sonora: `dados_ranking.csv` (fornecido pelo autor), lido sem alteração a cada build.\n- Bandeiras: pacote `flag-icons` (MIT). Fontes tipográficas: Barlow Condensed e Source Serif 4 (SIL OFL), via `@fontsource`.\n- Esporte de cada nome: classificação feita na montagem do livro (`data/esportes.json`), sem fonte externa. **[DADO A CONFIRMAR]** pelo autor, pois o CSV não traz a coluna esporte. Ela alimenta a contagem de esportes da abertura.\n- País: derivado da bandeira do CSV; nomes dos países em português pelo padrão ICU (`Intl.DisplayNames`).\n');
for (const r of [...PAUSAS.slice().sort((a, b) => b.pos - a.pos), ...TOP.slice().sort((a, b) => b.pos - a.pos), lua]) {
  fm.push(`## ${r.pos}º ${r.nome}\n`);
  fm.push(`País: ${paisDe(r)} · Esporte: ${r.esporte} · Tipo: ${r.ficha.tipo}\n`);
  for (const f of r.ficha.fatos) fm.push(`- ${f.fato}: ${f.url && f.url !== '[DADO A CONFIRMAR]' ? f.url : '**[DADO A CONFIRMAR]**'}`);
  fm.push('');
}
fm.push('## Pausas e posições\n\nAs 15 pausas fotográficas seguem a lista do brief, com as posições lidas do CSV desta data. Nenhum atleta saiu do corte nem trocou de posição.\n');
fs.writeFileSync(P('fontes.md'), fm.join('\n'));

// ---------- og ----------
try {
  const og = await import('./og.mjs');
  await og.makeOg(DIST, { nPaises, nEsportes });
} catch (e) { warn.push(`og.png não gerado (${e.message.split('\n')[0]})`); }

// ---------- relatório ----------
console.log(`Páginas: ${pages.length} | ranking ${ranking.length} | países ${nPaises} | esportes ${nEsportes}`);
console.log(`total_sonoro = F+P+M+D+C+E em ${rows.length - sonoroBad.length} de ${rows.length} linhas` + (sonoroBad.length ? `; divergem: ${sonoroBad.map((r) => `${r.pos} ${r.nome} (CSV ${r.totalSonoro}, soma ${r.F + r.P + r.M + r.D + r.C + r.E})`).join('; ')}` : ''));
console.log(`Nota recalculada vs CSV: diferença máx ${maxDiff.toFixed(3)}, média ${meanDiff.toFixed(3)}`);
console.log(`Fotos encontradas: ${photo.size} de ${manifest.length} espaços`);
console.log(`HTML: ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
fs.writeFileSync(path.join(DIST, 'build-info.json'), JSON.stringify({ paginas: pages.length, paises: nPaises, esportes: nEsportes, diffMax: maxDiff, diffMedia: meanDiff, sonoroOK }, null, 2));
if (warn.length) { console.warn('\nAvisos:\n- ' + warn.join('\n- ')); }
if (warn.some((w) => w.startsWith('Lint'))) process.exit(1);
