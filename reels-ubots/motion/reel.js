// Reels Ubots · monstro v2 — 1080×1920, 30 fps, 45,96 s.
// Estética alinhada ao animatic de referência (v1b): papel creme quadriculado,
// títulos revelados palavra a palavra (cinza → preto) com marca-texto amarelo,
// cards brancos com sombra suave, traços amarelos finos nos cantos.
// Cada quadro é calculado só a partir do tempo (render paralelo e determinístico).
'use strict';
const W = 1080, H = 1920, FPS = 30, DUR = 48.1;
const END_T0 = 45.1;   // tela final (porte da tela final do v1b)
const C = {
  paper: '#F9F8F1', grid: 'rgba(30,25,15,0.045)', ink: '#141210', soft: '#BDB6AC', gray: '#8A847C',
  yellow: '#F9C23C', yellowL: '#FCE3A0', white: '#FFFFFF', chat: '#F2EEE6', green: '#D9FDD3',
  greenT: '#1E7A4C', red: '#C8443A', dark: '#0B0907',
};
// tema: o papel claro é o mundo da Ubots; o escuro, o mundo do robô travado em regras
const LIGHT = { dark: false, text: C.ink, soft: C.soft, card: C.white, stroke: 'rgba(20,18,16,0.05)', shadow: 'rgba(70,55,25,0.13)',
  chatBody: C.chat, inB: C.white, outB: C.green, head: C.white, sub: C.gray, num: '#B4ADA4', struck: '#A39A90',
  pillBg: C.white, pillBorder: 'rgba(20,18,16,0.15)', rule: 'rgba(0,0,0,0.06)' };
const DARK = { dark: true, text: '#F3EEE6', soft: '#4C4640', card: '#191512', stroke: 'rgba(255,255,255,0.07)', shadow: 'rgba(0,0,0,0.55)',
  chatBody: '#110E0C', inB: '#27221E', outB: '#1D3A2A', head: '#1E1A17', sub: '#8C857D', num: '#6D655D', struck: '#6D655D',
  pillBg: '#1E1A17', pillBorder: 'rgba(255,255,255,0.16)', rule: 'rgba(255,255,255,0.07)' };
let P = LIGHT;
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');
let TKR;

// ------------------------------------------------------------------ util
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
const eInOut = t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eBack = (t, s = 1.8) => { t = clamp(t); return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const hash = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

function rr(x, y, w, h, r) {
  w = Math.max(0, w); h = Math.max(0, h);
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function font(w, s, fam = 'Poppins') { ctx.font = `${w} ${s}px ${fam}`; }
function text(s, x, y, { w = 600, size = 30, fam = 'Poppins', color = null, align = 'left', base = 'middle' } = {}) {
  font(w, size, fam); ctx.fillStyle = color || P.text; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
  return ctx.measureText(s).width;
}
function wrap(s, maxW) {
  const words = s.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function withT(fn, x, y, s = 1, rot = 0, a = 1) {
  if (a <= 0.001 || s <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); fn(); ctx.restore();
}

// ------------------------------------------------------------------ assets
const IMG = {};
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
let ENV = [];
const vcache = new Map();
async function vframe(dir, i, n) {
  i = Math.max(1, Math.min(n, i));
  const key = `${dir}/${i}`;
  if (!vcache.has(key)) {
    if (vcache.size > 40) vcache.delete(vcache.keys().next().value);
    vcache.set(key, await loadImg(`assets/${dir}/f${String(i).padStart(3, '0')}.jpg`));
  }
  return vcache.get(key);
}
async function preload() {
  const list = {
    P1: 'assets/persona/P1.jpg', P2: 'assets/persona/P2.jpg', P3: 'assets/persona/P3.jpg',
    ubots: 'assets/logo_ubots_dark.png', viacredi: 'assets/logo_viacredi.png', pg1: 'assets/pdf/p-01.png',
    capa: 'assets/v1b/capa.jpg', in2: 'assets/v1b/pg2.jpg', in9: 'assets/v1b/pg9.jpg', in10: 'assets/v1b/pg10.jpg', ubotsRef: 'assets/v1b/ubots-logo.png', viaRef: 'assets/v1b/viacredi-logo.png',
  };
  await Promise.all(Object.entries(list).map(async ([k, v]) => { IMG[k] = await loadImg(v); }));
  ENV = await (await fetch('assets/vo_env.json')).json();
  for (const f of ['800 40px Poppins', '700 40px Poppins', '600 40px Poppins', '700 40px Nunito', '600 40px Nunito', '400 40px Nunito'])
    await document.fonts.load(f);
  makeGrain(); makePaper();
}
const env = t => ENV[Math.max(0, Math.min(ENV.length - 1, Math.round(t * FPS)))] || 0;

function cover(img, scale = 1, fx = 0.5, fy = 0.5, dx = 0, dy = 0) {
  const s = Math.max(W / img.width, H / img.height) * scale;
  const dw = img.width * s, dh = img.height * s;
  let x = W / 2 - fx * dw + dx, y = H / 2 - fy * dh + dy;
  x = clamp(x, W - dw, 0); y = clamp(y, H - dh, 0);
  ctx.drawImage(img, x, y, dw, dh);
}

// ------------------------------------------------------------------ papel + acabamento
let GRAIN = [], PAPER, DARKPAPER;
function makeGrain() {
  for (let k = 0; k < 4; k++) {
    const g = document.createElement('canvas'); g.width = 540; g.height = 960;
    const gx = g.getContext('2d'), id = gx.createImageData(540, 960);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 120;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    gx.putImageData(id, 0, 0); GRAIN.push(g);
  }
}
function makePaper() {
  PAPER = document.createElement('canvas'); PAPER.width = W; PAPER.height = H;
  const p = PAPER.getContext('2d');
  p.fillStyle = C.paper; p.fillRect(0, 0, W, H);
  p.strokeStyle = C.grid; p.lineWidth = 2;
  for (let x = 0; x <= W; x += 54) { p.beginPath(); p.moveTo(x + 0.5, 0); p.lineTo(x + 0.5, H); p.stroke(); }
  for (let y = 0; y <= H; y += 54) { p.beginPath(); p.moveTo(0, y + 0.5); p.lineTo(W, y + 0.5); p.stroke(); }
  DARKPAPER = document.createElement('canvas'); DARKPAPER.width = W; DARKPAPER.height = H;
  const d = DARKPAPER.getContext('2d');
  d.fillStyle = C.dark; d.fillRect(0, 0, W, H);
  const g = d.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H * 0.45, H * 0.8);
  g.addColorStop(0, 'rgba(60,45,20,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = g; d.fillRect(0, 0, W, H);
  d.strokeStyle = 'rgba(255,255,255,0.035)'; d.lineWidth = 2;
  for (let x = 0; x <= W; x += 54) { d.beginPath(); d.moveTo(x + 0.5, 0); d.lineTo(x + 0.5, H); d.stroke(); }
  for (let y = 0; y <= H; y += 54) { d.beginPath(); d.moveTo(0, y + 0.5); d.lineTo(W, y + 0.5); d.stroke(); }
}
function finish(f, vignette) {
  if (vignette) {
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vignette})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = vignette ? 0.07 : 0.035;
  ctx.drawImage(GRAIN[f % GRAIN.length], 0, 0, W, H); ctx.restore();
}
// papel com traços amarelos finos nos cantos (giram devagar)
function paper(t) {
  ctx.drawImage(P.dark ? DARKPAPER : PAPER, 0, 0);
  ctx.save(); ctx.strokeStyle = P.dark ? 'rgba(249,194,60,0.55)' : C.yellow; ctx.lineWidth = 6; ctx.lineCap = 'round';
  const d = Math.sin(t * 0.6) * 0.06;
  ctx.beginPath(); ctx.arc(W + 40, 1960, 300, Math.PI * 1.08 + d, Math.PI * 1.36 + d); ctx.stroke();
  ctx.beginPath(); ctx.arc(-60, 1980, 280, Math.PI * 1.62 - d, Math.PI * 1.86 - d); ctx.stroke();
  ctx.beginPath(); ctx.arc(W + 30, 330, 210, Math.PI * 0.96 + d, Math.PI * 1.2 + d); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(40, 120 + d * 80); ctx.lineTo(120, 160); ctx.lineTo(100, 90); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ componentes
function card(x, y, w, h, r = 34, fill = null) {
  ctx.save();
  ctx.shadowColor = P.shadow; ctx.shadowBlur = 46; ctx.shadowOffsetY = 16;
  rr(x, y, w, h, r); ctx.fillStyle = fill || P.card; ctx.fill();
  ctx.restore();
  rr(x, y, w, h, r); ctx.strokeStyle = P.stroke; ctx.lineWidth = 2; ctx.stroke();
}
function sparkle(x, y, r, rot = 0, color = C.ink, stroke = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, rad = i % 2 ? r * 0.3 : r;
    ctx.lineTo(Math.cos(a - Math.PI / 2) * rad, Math.sin(a - Math.PI / 2) * rad);
  }
  ctx.closePath();
  if (stroke) { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function check(x, y, r, bg, fg) {
  if (bg) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(x - r * 0.42, y + r * 0.02); ctx.lineTo(x - r * 0.1, y + r * 0.34); ctx.lineTo(x + r * 0.46, y - r * 0.3);
  ctx.strokeStyle = fg; ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function pill(cx, cy, s, { size = 30, h = 60, bg = C.yellow, fg = C.ink, w = 700, fam = 'Poppins', border } = {}) {
  font(w, size, fam); const pw = ctx.measureText(s).width + h * 0.9;
  rr(cx - pw / 2, cy - h / 2, pw, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, cx, cy + 2);
  return pw;
}
function smallCaps(s, cx, cy, color = C.gray) {
  font(600, 27); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx) { ctx.letterSpacing = '7px'; ctx.fillText(s, cx + 3.5, cy); ctx.letterSpacing = '0px'; } else ctx.fillText(s, cx, cy);
}
function waves(x, y, w, amp, n, gap, color, lw, phase) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const px = x + (w * i) / 60, py = y + k * gap + Math.sin((i / 60) * Math.PI * 4 + phase) * amp;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
function lock(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -40, 42, Math.PI, 0); ctx.lineTo(42, 0); ctx.moveTo(-42, -40); ctx.lineTo(-42, 0); ctx.stroke();
  rr(-80, -6, 160, 120, 26); ctx.fillStyle = C.yellow; ctx.fill();
  rr(-9, 30, 18, 46, 9); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
}
function avatar(x, y, r, letter, bg = C.yellow) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
  text(letter, x, y + 2, { w: 700, size: r * 0.9, align: 'center' });
}
// a persona como narradora: pequeno avatar com anel de voz (cenas de motion)
function narrator(t, a = 1) {
  if (a <= 0) return;
  const x = W / 2, y = 180, r = 46, e = env(t);
  ctx.save(); ctx.globalAlpha *= a;
  for (let k = 0; k < 40; k++) {
    const ang = (k / 40) * Math.PI * 2 - Math.PI / 2;
    const amp = 5 + 22 * e * (0.45 + 0.55 * hash(k * 13 + Math.floor(t * 12)));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * (r + 8), y + Math.sin(ang) * (r + 8));
    ctx.lineTo(x + Math.cos(ang) * (r + 8 + amp), y + Math.sin(ang) * (r + 8 + amp));
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const img = IMG.P1, s = (r * 2.5) / (img.width * 0.42);
  ctx.drawImage(img, x - img.width * 0.5 * s, y - img.height * 0.335 * s, img.width * s, img.height * s);
  ctx.restore(); ctx.restore();
}

// ------------------------------------------------------------------ texto falado (tempo por palavra)
// *destaque* = marca-texto amarelo · ~risco~ = riscado
const SEGS = [
  [0.00, 1.39, ['Eu sou uma *IA.*']],
  [2.21, 5.75, ['E se eu falasse', 'feito *robô,*', 'você já teria pulado', 'esse vídeo.']],
  [6.11, 11.66, ['Agora imagina', 'um agente assim', 'oferecendo *crédito*', 'no seu *banco…*', 'ou na sua *cooperativa.*']],
  [12.03, 16.95, ['É aí que entra', 'a *Ubots,*', 'que cria agentes de IA', 'pra *bancos e cooperativas.*']],
  [17.30, 21.42, ['O salto é trocar', '~regra~ por *contexto,*', 'sem abrir mão', 'da *segurança.*']],
  [21.85, 25.87, ['Com *liberdade,*', 'o agente para', 'de empurrar oferta', 'e *escuta.*']],
  [26.20, 28.48, ['A cooperada conta', 'da reforma da *cozinha…*']],
  [28.73, 30.06, ['e ele ajuda', 'na *decisão.*']],
  [30.40, 35.44, ['Na *Viacredi,*', 'esse modelo de agente', 'já liberou mais de', ['*R$ 150 mil*', 'cento e cinquenta mil reais']]],
  [35.73, 36.83, ['Que, por sinal…']],
  [37.03, 38.76, ['ainda tá em', '*fase de teste.*']],
  [38.99, 41.41, ['O método completo', 'tá no *Playbook Ubots.*']],
  [41.71, 43.69, ['*Clica no link*', 'e baixa o material.']],
  [44.10, 44.99, ['É *grátis.*']],
];
const CHUNKS = [], WORDS = [];
for (const [a, b, chunks] of SEGS) {
  const list = chunks.map(c => (Array.isArray(c) ? c : [c, c]));
  const weights = list.map(([d, s]) => s.replace(/[*~]/g, '').length + 4);
  const tot = weights.reduce((x, y) => x + y, 0);
  let acc = a;
  list.forEach(([disp], i) => {
    const d = ((b - a) * weights[i]) / tot;
    CHUNKS.push({ t0: acc, t1: i === list.length - 1 ? b + 0.25 : acc + d, text: disp });
    // palavras do trecho, com o tempo distribuído pelo comprimento
    const toks = [];
    let mode = null;
    for (const raw of disp.split(' ')) {
      let w = raw, m = mode;
      if (w.startsWith('*')) { m = 'hl'; w = w.slice(1); } else if (w.startsWith('~')) { m = 'st'; w = w.slice(1); }
      let end = false;
      if (w.endsWith('*') || w.endsWith('~')) { w = w.slice(0, -1); end = true; }
      else if (/[*~][.,…]$/.test(w)) { w = w.replace(/[*~]/, ''); end = true; }
      toks.push({ w, m }); mode = end ? null : m;
    }
    const tl = toks.reduce((s, x) => s + x.w.length + 1, 0);
    let acc2 = acc;
    toks.forEach(tk => { WORDS.push({ ...tk, t: acc2 }); acc2 += (d * (tk.w.length + 1)) / tl; });
    acc += d;
  });
}

// título revelado palavra a palavra: cinza → preto, marca-texto e risco no tempo da fala
const T_CTX = (WORDS.find(w => w.w.startsWith('contexto')) || { t: 18.9 }).t;
function headline(t, from, to, y, { size = 70, maxW = 930, a = 1, lh = 1.16 } = {}) {
  const words = WORDS.filter(w => w.t >= from - 0.05 && w.t < to);
  if (!words.length || a <= 0) return y;
  font(800, size);
  const sp = ctx.measureText(' ').width;
  const lines = [[]];
  let lw = 0;
  for (const w of words) {
    const ww = ctx.measureText(w.w).width;
    if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
    lines[lines.length - 1].push({ ...w, ww });
    lw += ww + sp;
  }
  ctx.save(); ctx.globalAlpha *= a;
  lines.forEach((ln, li) => {
    const total = ln.reduce((s, w) => s + w.ww, 0) + sp * (ln.length - 1);
    let x = W / 2 - total / 2;
    const yy = y + li * size * lh;
    // marca-texto atrás das palavras destacadas (cresce da esquerda quando a palavra é dita)
    ln.forEach((w, i) => {
      if (w.m === 'hl') {
        const p = eOut(prog(t, w.t, w.t + 0.28));
        const ext = i < ln.length - 1 && ln[i + 1].m === 'hl' ? sp : 0;
        if (p > 0 && !P.dark) { rr(x - 10, yy - size * 0.02, (w.ww + 20 + ext) * p, size * 0.46, 8); ctx.fillStyle = C.yellow; ctx.fill(); }
      }
      x += w.ww + sp;
    });
    x = W / 2 - total / 2;
    ln.forEach(w => {
      const on = prog(t, w.t - 0.02, w.t + 0.12);
      font(800, size); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const done = P.dark && w.m === 'hl' ? C.yellow : P.text;
      ctx.fillStyle = on >= 1 ? done : on <= 0 ? P.soft : mix(P.soft, done, on);
      if (w.m === 'st') ctx.fillStyle = on >= 1 ? (P.dark ? '#7A7068' : '#9C8F84') : P.soft;
      ctx.fillText(w.w, x, yy);
      if (w.m === 'st') {
        const p = eOut(prog(t, w.t + 0.15, w.t + 0.4));
        if (p > 0) { ctx.fillStyle = C.red; ctx.fillRect(x - 4, yy - 3, (w.ww + 8) * p, 7); }
      }
      x += w.ww + sp;
    });
  });
  ctx.restore();
  return y + lines.length * size * lh;
}
function mix(a, b, t) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`;
}

// legenda sobre persona e vídeos
function captions(t, y) {
  const c = CHUNKS.find(c => t >= c.t0 && t < c.t1);
  if (!c) return;
  const p = eBack(prog(t, c.t0, c.t0 + 0.14), 2);
  font(800, 64);
  const groups = [];
  for (const s of c.text.split(/([*~][^*~]+[*~])/).filter(x => x.trim())) {
    if (/^[*~]/.test(s)) groups.push({ s: s.replace(/[*~]/g, '').trim(), hl: true });
    else s.trim().split(/\s+/).forEach(w => groups.push({ s: w, hl: false }));
  }
  const GAP = 20;
  groups.forEach(g => { g.w = ctx.measureText(g.s).width; });
  const total = groups.reduce((a, g) => a + g.w, 0) + GAP * (groups.length - 1);
  const fit = Math.min(1, 960 / total);
  withT(() => {
    let x = -total / 2;
    font(800, 64); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const g of groups) {
      if (g.hl) { rr(x - 10, 2, g.w + 20, 32, 8); ctx.fillStyle = C.yellow; ctx.fill(); }
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineJoin = 'round'; ctx.strokeText(g.s, x, 4);
      ctx.fillStyle = C.white; ctx.fillText(g.s, x, 4);
      x += g.w + GAP;
    }
  }, W / 2, y, (0.86 + 0.14 * p) * fit, 0, clamp(p * 3));
}

// ------------------------------------------------------------------ chat
function chatBubble(x, y, w, lines, side, extra = 0) {
  const h = lines.length * 50 + 44 + extra;
  rr(x, y, w, h, 26); ctx.fillStyle = side === 'in' ? C.white : C.green; ctx.fill();
  return h;
}
function chat(t, x, y, w, h, title, msgs) {
  card(x, y, w, h, 34);
  ctx.save(); rr(x, y, w, h, 34); ctx.clip();
  ctx.fillStyle = P.chatBody; ctx.fillRect(x, y + 118, w, h - 118);
  const top = y + 150, bottom = y + h - 30, inner = w - 80;
  const items = [];
  let yy = 0;
  for (const m of msgs) {
    if (t < m.at - (m.side === 'in' ? 0.45 : 0)) break;
    const typing = m.side === 'in' && t < m.at;
    font(600, 38, 'Nunito');
    const lines = typing ? [] : wrap(m.text, inner * 0.74);
    const extra = (m.offer ? 210 : 0) + (m.seal ? 64 : 0) + (m.tag ? 40 : 0);
    const bh = typing ? 84 : lines.length * 50 + 44 + extra;
    const p = typing ? 1 : eBack(prog(t, m.at, m.at + 0.3), 1.4);
    items.push({ m, lines, bh, y: yy, p, typing, extra });
    yy += bh * clamp(p) + 22;
  }
  const scroll = Math.max(0, top + yy - bottom);
  for (const it of items) {
    const { m, lines, bh, p, typing } = it;
    font(600, 38, 'Nunito');
    const tw = typing ? 130 : Math.max(m.offer ? inner * 0.74 : 0, ...lines.map(l => ctx.measureText(l).width)) + 60;
    const bx = m.side === 'in' ? x + 40 : x + w - 40 - tw;
    const by = top + it.y - scroll;
    withT(() => {
      rr(0, 0, tw, bh, 26); ctx.fillStyle = m.side === 'in' ? P.inB : P.outB; ctx.fill();
      if (typing) {
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(40 + k * 26, 42, 8 + 3 * Math.sin(t * 10 - k), 0, Math.PI * 2); ctx.fillStyle = '#A59E95'; ctx.fill(); }
        return;
      }
      let oy = 0;
      if (m.tag) { pill(110, 34, '✦ Agente de IA', { size: 22, h: 40, bg: C.yellowL, fg: '#8A6512', w: 700 }); oy = 40; }
      lines.forEach((l, i) => {
        const yy = 52 + oy + i * 50;
        if (m.hl && l.includes(m.hl)) {               // marca-texto dentro da mensagem
          const pre = l.slice(0, l.indexOf(m.hl)); font(600, 38, 'Nunito');
          const x0 = 30 + ctx.measureText(pre).width, ww = ctx.measureText(m.hl).width;
          const hp = eOut(prog(t, m.at + 0.15, m.at + 0.45));
          rr(x0 - 4, yy - 2, (ww + 8) * hp, 20, 5); ctx.fillStyle = C.yellow; ctx.fill();
        }
        text(l, 30, yy, { w: 600, size: 38, fam: 'Nunito' });
      });
      if (m.offer) {
        const oy2 = 44 + oy + lines.length * 50;
        rr(24, oy2, tw - 48, 186, 18); ctx.fillStyle = '#FBF8F2'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 2; ctx.stroke();
        pill(130, oy2 + 36, 'Crédito Reforma', { size: 22, h: 38, bg: C.yellowL, fg: '#8A6512' });
        text('R$ 15.000,00', 50, oy2 + 100, { w: 800, size: 52 });
        text('24x · juros e IOF inclusos', 50, oy2 + 152, { w: 600, size: 26, fam: 'Nunito', color: C.gray });
      }
      if (m.seal) {
        const sp = eBack(prog(t, m.seal, m.seal + 0.3), 2.2);
        withT(() => pill(0, 0, '✓ Crédito contratado', { size: 26, h: 52, bg: C.yellow }), tw - 150, bh - 40, sp, -0.03, sp * 2);
      }
    }, bx, by + (1 - clamp(p)) * 30, 1, 0, clamp(p * 1.6));
  }
  ctx.restore();
  // cabeçalho
  ctx.save(); rr(x, y, w, 118, 34); ctx.clip(); ctx.fillStyle = P.head; ctx.fillRect(x, y, w, 118); ctx.restore();
  ctx.fillStyle = P.rule; ctx.fillRect(x, y + 117, w, 2);
  avatar(x + 66, y + 59, 30, '', C.yellow); sparkle(x + 66, y + 59, 17, 0, C.ink);
  text(title, x + 116, y + 46, { w: 700, size: 34 });
  text(P.dark ? 'responde só SIM ou NÃO' : 'online', x + 116, y + 84, { w: 600, size: 24, fam: 'Nunito', color: P.sub });
}
// etapas Contexto — Oferta — Decisão (bolinhas ligadas por traço)
function steps(t, cy, list) {
  font(700, 30);
  const ws = list.map(([s]) => ctx.measureText(s).width + 34);
  const gap = 60, total = ws.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
  let x = W / 2 - total / 2;
  list.forEach(([s, at], i) => {
    const on = t >= at, p = eBack(prog(t, at, at + 0.25), 2.5);
    ctx.beginPath(); ctx.arc(x + 10, cy, on ? 10 * (0.6 + 0.4 * p) : 8, 0, Math.PI * 2); ctx.fillStyle = on ? C.yellow : '#D6D0C7'; ctx.fill();
    text(s, x + 30, cy + 2, { w: 700, size: 30, color: on ? C.ink : '#B4ADA4' });
    if (i < list.length - 1) { ctx.fillStyle = '#D6D0C7'; ctx.fillRect(x + ws[i] + 10, cy - 1, gap - 20, 2); }
    x += ws[i] + gap;
  });
}
// documento do playbook no estilo "mensagem com PDF"
function docCard(cx, cy, w, a = 1, rot = 0) {
  const img = IMG.capa, ih = w * img.height / img.width, h = ih + 150;
  withT(() => {
    card(-w / 2 - 20, -h / 2, w + 40, h, 28);
    ctx.save(); rr(-w / 2, -h / 2 + 20, w, ih, 18); ctx.clip(); ctx.drawImage(img, -w / 2, -h / 2 + 20, w, ih); ctx.restore();
    text('Playbook Ubots · Agentes de IA', -w / 2 + 6, h / 2 - 82, { w: 700, size: 34 });
    text('10 páginas · PDF', -w / 2 + 6, h / 2 - 38, { w: 600, size: 24, fam: 'Nunito', color: C.gray });
    text('agora ✓✓', w / 2 - 6, h / 2 - 38, { w: 600, size: 22, fam: 'Nunito', color: '#53A6E8', align: 'right' });
  }, cx, cy, 1, rot, a);
}
function ctaButton(cx, cy, label, t, icon = 'arrow') {
  rr(cx - 360, cy - 58, 720, 116, 58); ctx.fillStyle = C.ink; ctx.fill();
  text(label, cx - 300, cy + 3, { w: 800, size: 46, color: C.yellow });
  ctx.beginPath(); ctx.arc(cx + 290, cy, 40, 0, Math.PI * 2); ctx.fillStyle = C.yellow; ctx.fill();
  if (icon === 'check') check(cx + 290, cy, 40, null, C.ink);
  else {
    const b = Math.sin(t * 8) * 5;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 290, cy - 18 + b); ctx.lineTo(cx + 290, cy + 16 + b);
    ctx.moveTo(cx + 275, cy + 2 + b); ctx.lineTo(cx + 290, cy + 18 + b); ctx.lineTo(cx + 305, cy + 2 + b); ctx.stroke();
  }
}
function logosRow(cy, a = 1) {
  withT(() => {
    const lw = 230, lh = lw * IMG.ubots.height / IMG.ubots.width;
    ctx.drawImage(IMG.ubots, -lw - 34, -lh / 2, lw, lh);
    ctx.fillStyle = 'rgba(20,18,16,0.2)'; ctx.fillRect(-1, -34, 2, 68);
    const vw = 220, vh = vw * IMG.viacredi.height / IMG.viacredi.width;
    ctx.drawImage(IMG.viacredi, 34, -vh / 2, vw, vh);
  }, W / 2, cy, 1, 0, a);
}

// ------------------------------------------------------------------ dados das cenas
const ROBOT = [
  { side: 'in', at: 8.75, text: 'Olá. Temos uma linha de crédito disponível. Deseja saber mais? Responda SIM ou NÃO.' },
  { side: 'out', at: 9.55, text: 'Depende, pra que serve?' },
  { side: 'in', at: 10.35, text: 'Não entendi sua resposta. Responda SIM ou NÃO.' },
];
const FLUID = [
  { side: 'out', at: 22.6, text: 'Já tenho um crédito contratado, mas achei bom saber que tem outro disponível.' },
  { side: 'in', at: 24.1, text: 'Que bom! Posso perguntar o que você está planejando?', tag: true },
  { side: 'out', at: 28.5, text: 'Estou reformando a cozinha.', hl: 'reformando a cozinha' },
  { side: 'in', at: 28.95, text: 'Que legal! Simulei uma opção para a sua reforma:', tag: true, offer: true },
  { side: 'out', at: 29.45, text: 'Quero! Vou contratar para terminar a obra.', seal: 29.85 },
];
const RULES = ['Não fale sobre…', 'Não responda se…', 'Não ofereça…', 'Sempre use a frase…', 'Não saia do roteiro…'];
const LIMITS = [['Seja transparente sobre juros e IOF.', 19.95], ['Contrate só pelo canal seguro.', 20.4], ['Não peça dados sensíveis.', 20.85]];
const PEOPLE = [['A', 'Ana R.'], ['C', 'Carlos M.'], ['J', 'Juliana R.'], ['R', 'Roberto S.'], ['M', 'Marta L.'], ['P', 'Paulo T.']];

// entrada suave do conteúdo de uma cena sobre o papel (o papel continua; só o conteúdo troca)
const enter = (lt, d = 0.32) => eOut(prog(lt, 0, d));

// ------------------------------------------------------------------ cenas
const SCENES = [
  // gancho: persona em tela cheia (foto estática viva)
  { a: 0, b: 6.1, cap: 1300, vig: 0.35, draw: async (t) => {
    const punch = t >= 2.21 ? 1.17 : 1;
    const drift = t >= 2.21 ? (t - 2.21) * 0.012 : t * 0.02;
    const hook = await vframe('lipsync/hook', Math.floor(t * FPS) + 1, 184);     // lipsync ElevenLabs (OmniHuman)
    cover(hook, (1.02 + drift) * punch, 0.5, 0.36, Math.sin(t * 0.7) * 4, Math.cos(t * 0.5) * 3);
    glitchFX(t, 3.5, 0.4);                              // glitch em "robô"
    if (t > 0.9 && t < 2.21) {                        // ✦ no "IA"
      const s = eBack(prog(t, 0.9, 1.25), 2.6) * (1 - prog(t, 1.9, 2.21));
      sparkle(790, 560, 64 * s, t * 1.2, C.yellow); sparkle(858, 474, 26 * s, -t * 2, C.white);
    }
  } },
  // celular na agência → mergulho na tela (o brilho vira o papel)
  { a: 6.1, b: 8.4, cap: 1300, vig: 0.25, draw: async (t, lt) => {
    const img = await vframe('v1', Math.floor(lt * FPS) + 1, 69);
    const z = 1 + eInOut(prog(lt, 1.7, 2.3)) * 0.6;
    ctx.save(); ctx.translate(W / 2, H * 0.58); ctx.scale(z, z); ctx.translate(-W / 2, -H * 0.58); ctx.drawImage(img, 0, 0, W, H); ctx.restore();
    const fl = prog(lt, 1.85, 2.3);
    if (fl > 0) { ctx.globalAlpha = eInOut(fl); ctx.drawImage(DARKPAPER, 0, 0); ctx.globalAlpha = 1; }
  } },
  // o robô travado em regra — "no seu banco… ou na sua cooperativa"
  { a: 8.4, b: 12.0, paper: true, dark: true, draw: (t, lt) => {
    const e = enter(lt);
    headline(t, 9.4, 12.0, 330, { size: 66, a: e });
    withT(() => chat(t, 90, 560, 900, 700, 'Agente de crédito', ROBOT), 0, (1 - e) * 50, 1, 0, e);
    [['Bancos', 10.75], ['Cooperativas', 11.05], ['Fintechs', 11.35], ['Financeiras', 11.65]].forEach(([s, at], i) => {
      const p = eBack(prog(t, at, at + 0.25), 2.4);
      withT(() => pill(0, 0, s, { size: 32, h: 66, bg: P.pillBg, fg: P.text, border: P.pillBorder }), [245, 520, 750, 960][i] - 60, 1340, p, 0, p * 2);
    });
  } },
  // entra a Ubots
  { a: 12.0, b: 16.0, narr: true, draw: (t, lt) => iris(t, lt, W / 2, 500, 0, 0.5, drawUbots) },
];
// troca de mundo: desenha a cena no escuro e revela a versão clara num círculo que cresce
function iris(t, lt, cx, cy, t0, dur, fn) {
  const r = eInOut(prog(lt, t0, t0 + dur)) * 2300;
  if (r < 2290) { P = DARK; paper(t); fn(t, lt); }
  if (r > 0) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    P = LIGHT; paper(t); fn(t, lt); ctx.restore();
    if (r < 2290) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = C.yellow; ctx.lineWidth = 8; ctx.stroke(); }
  }
  P = LIGHT;
}
function drawUbots(t, lt) {
  const e = enter(lt);
  waves(120, 150, 840, 14, 2, 38, 'rgba(249,194,60,0.55)', 6, t * 2);
  withT(() => smallCaps('É AÍ QUE ENTRA', W / 2, 0), 0, 330, 1, 0, e);
  const p = eBack(prog(t, 12.4, 12.9), 1.7);
  const lw = 720, lh = lw * IMG.ubots.height / IMG.ubots.width;
  withT(() => { ctx.drawImage(IMG.ubots, -lw / 2, -lh / 2, lw, lh); sparkle(lw / 2 + 34, -lh / 2 - 6, 30 * p, t, C.ink, true); }, W / 2, 500, 0.7 + 0.3 * p, 0, p * 2);
  headline(t, 12.9, 17.0, 650, { size: 68, a: e });
  // o agente em ação: card de conversa com a oferta chegando
  const cp = eBack(prog(t, 13.5, 13.95), 1.3);
  withT(() => {
    chat(t, 90, 0, 900, 640, 'Agente de crédito', [
      { side: 'in', at: 14.1, text: 'Oi! Você tem um crédito pré-aprovado. Quer ver como ele pode ajudar nos seus planos?', tag: true },
      { side: 'out', at: 14.95, text: 'Quero ver!' },
      { side: 'in', at: 15.4, text: 'Simulei uma opção pra você 👇' },
    ]);
  }, 0, 1010 + (1 - clamp(cp)) * 80, 1, 0, clamp(cp * 1.5));
  // selos flutuando em volta do card
  [['✦ Agente de IA', 190, 1010, 14.2, -0.06], ['Segurança onde importa', 790, 1690, 15.2, 0.05]].forEach(([s2, x, y, at, r]) => {
    const q = eBack(prog(t, at, at + 0.3), 2.2);
    withT(() => pill(0, 0, s2, { size: 28, h: 58, bg: C.ink, fg: C.yellow }), x, y + Math.sin(t * 2 + x) * 6, q, r, q * 2);
  });
}
function drawSalto(t, lt) {
  const e = enter(lt);
    headline(t, 17.3, 21.85, 330, { size: 62, a: e });
  withT(() => {
    card(90, 560, 900, 720, 34);
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(140 + k * 26, 630, 7, 0, Math.PI * 2); ctx.fillStyle = P.dark ? '#3A332D' : '#D6D0C7'; ctx.fill(); }
    text('Instruções do agente', 230, 632, { w: 700, size: 34 });
    const flip = eInOut(prog(t, 19.0, 19.3));
    withT(() => pill(0, 0, flip < 0.5 ? '8 regras' : '3 limites', { size: 26, h: 52, bg: P.dark ? C.yellow : C.ink, fg: P.dark ? C.ink : C.yellow }), 880, 632, 1, 0, 1 - Math.sin(flip * Math.PI) * 0.6);
    ctx.fillStyle = P.rule; ctx.fillRect(90, 690, 900, 2);
    const strikes = [17.55, 18.1, 18.65, 18.8, 18.9];
    RULES.forEach((r, i) => {
      const gone = eInOut(prog(t, 19.1 + i * 0.03, 19.35 + i * 0.03));
      const y = 760 + i * 74;
      ctx.save(); ctx.globalAlpha *= 1 - gone * 0.75;
      text(String(i + 1), 140, y, { w: 600, size: 26, color: P.num });
      const w = text(r, 180, y, { w: 600, size: 38, fam: 'Nunito', color: t > strikes[i] ? P.struck : P.text });
      const sp = eOut(prog(t, strikes[i], strikes[i] + 0.2));
      if (sp > 0) { ctx.fillStyle = C.red; ctx.fillRect(176, y - 2, (w + 8) * sp, 5); }
      ctx.restore();
    });
    LIMITS.forEach(([s, at], i) => {
      const q = eBack(prog(t, at, at + 0.3), 1.6);
      withT(() => {
        text(String(6 + i), 0, 0, { w: 600, size: 26, color: P.num });
        const w = text(s, 40, 0, { w: 700, size: 38, fam: 'Nunito' });
        check(40 + w + 34, 0, 18, P.dark ? C.yellow : C.ink, P.dark ? C.ink : C.yellow);
      }, 140 + (1 - q) * 40, 1060 + i * 64, 1, 0, q * 1.5);
    });
  }, 0, (1 - e) * 50, 1, 0, e);
  // card empilhado: limites que nunca mudam
  const lp = eBack(prog(t, 20.95, 21.3), 1.5);
  withT(() => {
    card(-250, -190, 500, 380, 32);
    pill(-190, -130, '02', { size: 24, h: 40, bg: C.yellow });
    text('Limites que', -210, -60, { w: 800, size: 46 });
    text('nunca mudam', -210, -6, { w: 800, size: 46 });
    lock(150, 80, 0.62 + 0.04 * Math.sin(t * 6));
  }, 720, 1470, 1, 0.05 * (1 - lp) + 0.03, lp * 1.5);
}
const SCENES2 = [
  // o gerente
  { a: 16.0, b: 17.3, cap: 1300, vig: 0.3, draw: async (t, lt) => {
    const img = await vframe('v2', Math.floor(lt * FPS) + 16, 75);
    cover(img, 1.1 + lt * 0.01, 0.55, 0.36);
  } },
  // o salto: no escuro as regras são riscadas; no "contexto" a luz entra
  { a: 17.3, b: 21.85, narr: true, draw: (t, lt) => iris(t, lt, W / 2, 900, T_CTX - 17.3, 0.45, drawSalto) },
  // o agente que escuta
  { a: 21.85, b: 26.2, paper: true, draw: (t, lt) => drawFluid(t, lt, 21.85, 26.2) },
  // a cozinha
  { a: 26.2, b: 28.45, cap: 1300, vig: 0.3, draw: async (t, lt) => {
    const img = await vframe('v3', Math.floor(lt * FPS) + 1, 68);
    cover(img, 1.0, 0.5, 0.4);
  } },
  // contexto → oferta → decisão
  { a: 28.45, b: 30.4, paper: true, draw: (t, lt) => drawFluid(t, lt, 28.45, 30.4) },
  // caso real: Viacredi
  { a: 30.4, b: 32.35, paper: true, draw: (t, lt) => {
    const e = enter(lt);
    headline(t, 30.4, 32.35, 360, { size: 70, a: e });
    withT(() => {
      card(-330, -230, 660, 460, 36);
      ctx.save(); rr(-330, -230, 660, 460, 36); ctx.clip();
      const g = ctx.createLinearGradient(0, -230, 0, -120); g.addColorStop(0, C.yellow); g.addColorStop(1, '#FBD573');
      ctx.fillStyle = g; ctx.fillRect(-330, -230, 660, 110); ctx.restore();
      ctx.beginPath(); ctx.arc(0, -120, 62, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(0, -120, 54, 0, Math.PI * 2); ctx.clip();
      const vh = 108, vw = vh * IMG.viacredi.width / IMG.viacredi.height;
      ctx.drawImage(IMG.viacredi, -54 - 4, -120 - vh / 2, vw, vh); ctx.restore();
      const nw = text('Viacredi', -20, -10, { w: 800, size: 54, align: 'center' });
      check(nw / 2 + 4, -12, 17, '#25B064', C.white);
      text('Conta comercial · Cooperativa do Sistema Ailos', 0, 50, { w: 600, size: 24, fam: 'Nunito', color: C.gray, align: 'center' });
      const n = eOut(prog(t, 30.7, 31.8));
      text(n < 1 ? `+${Math.round(n * 1000000).toLocaleString('pt-BR')}` : '+1 milhão', 0, 128, { w: 800, size: 60, align: 'center' });
      text('cooperados em SC e PR', 0, 180, { w: 600, size: 26, fam: 'Nunito', color: C.gray, align: 'center' });
      const tp = eBack(prog(t, 31.25, 31.55), 2.4);
      withT(() => pill(0, 0, 'Caso real', { size: 28, h: 56, bg: C.ink, fg: C.yellow }), 250, -230, tp, -0.12, tp * 2);
    }, W / 2, 900 + (1 - e) * 60, 1, 0, e);
  } },
  // o resultado
  { a: 32.35, b: 35.7, paper: true, draw: (t, lt) => {
    const e = enter(lt);
    const shake = t > 34.75 && t < 35.0 ? (hash(Math.floor(t * 60)) - 0.5) * 18 * (1 - prog(t, 34.75, 35.0)) : 0;
    ctx.save(); ctx.translate(shake, 0);
    withT(() => text('mais de', W / 2, 0, { w: 600, size: 40, fam: 'Nunito', color: C.gray, align: 'center' }), 0, 640, 1, 0, e);
    const n = Math.round(150 * eOut(prog(t, 32.6, 34.75)));
    const mp = eOut(prog(t, 34.6, 34.95));
    font(800, 172); const label = `R$ ${n} mil`, lw = ctx.measureText('R$ 150 mil').width;
    withT(() => {
      if (mp > 0) { rr(-lw / 2 - 18, 6, (lw + 36) * mp, 78, 12); ctx.fillStyle = C.yellow; ctx.fill(); }
      text(label, 0, 0, { w: 800, size: 172, align: 'center' });
    }, W / 2, 790, 1 + 0.05 * (1 - eOut(prog(t, 34.75, 35.1))) * (t > 34.75), 0, e);
    withT(() => text('em crédito liberado pelo agente', W / 2, 0, { w: 600, size: 40, fam: 'Nunito', color: '#4F4A44', align: 'center' }), 0, 960, 1, 0, eOut(prog(lt, 0.3, 0.6)));
    const pp = eBack(prog(t, 33.2, 33.5), 2);
    withT(() => pill(0, 0, 'Ainda na fase de testes', { size: 34, h: 72 }), W / 2, 1060, pp, 0, pp * 2);
    ctx.restore();
    // faixa de contratações (ilustrativa) rolando — presa entre margens de 60 px, com esmaecimento nas pontas
    if (!TKR) { TKR = document.createElement('canvas'); TKR.width = W; TKR.height = 170; }
    const tk = TKR.getContext('2d');
    tk.clearRect(0, 0, W, 170);
    const main = ctx; ctx = tk;                                      // desenha os cards no canvas auxiliar
    const off = -((t - 32.35) * 140) % (PEOPLE.length * 300);
    for (let k = -1; k < PEOPLE.length * 2; k++) {
      const [l, n2] = PEOPLE[((k % PEOPLE.length) + PEOPLE.length) % PEOPLE.length];
      const x = off + k * 300;
      if (x < -320 || x > W + 20) continue;
      withT(() => {
        card(0, -52, 270, 104, 20);
        avatar(52, 0, 24, l, '#F1EDE6');
        text(n2, 90, -16, { w: 700, size: 26 });
        text('✓ Crédito contratado', 90, 20, { w: 700, size: 20, fam: 'Nunito', color: C.greenT });
      }, x, 85, 1, 0, 1);
    }
    tk.globalCompositeOperation = 'destination-in';                  // máscara: some antes de tocar as bordas
    const mg = tk.createLinearGradient(60, 0, 1020, 0);
    mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(0.09, 'rgba(0,0,0,1)');
    mg.addColorStop(0.91, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
    tk.fillStyle = mg; tk.fillRect(60, 0, 960, 170);
    tk.globalCompositeOperation = 'source-over';
    tk.save(); tk.globalCompositeOperation = 'destination-in'; tk.fillStyle = '#000';
    tk.fillRect(0, 0, 0, 0); tk.restore();
    ctx = main;
    ctx.save(); ctx.globalAlpha *= eOut(prog(lt, 0.5, 0.8));
    ctx.beginPath(); ctx.rect(60, 1145, 960, 170); ctx.clip();       // nada fora das margens
    ctx.drawImage(TKR, 0, 1145);
    ctx.restore();
    withT(() => {
      text('Ilustrativo', W / 2, 0, { w: 600, size: 22, fam: 'Nunito', color: '#A8A198', align: 'center' });
      text('Os resultados da Viacredi não constituem projeção para outras instituições.', W / 2, 44, { w: 600, size: 22, fam: 'Nunito', color: '#8F887F', align: 'center' });
    }, 0, 1330, 1, 0, eOut(prog(lt, 0.8, 1.1)));
  } },
  // "que, por sinal…" — câmera B
  { a: 35.7, b: 38.9, cap: 1300, vig: 0.35, draw: async (t, lt) => {
    const f = await vframe('lipsync/camb', Math.floor((t - 35.73) * FPS) + 1, 91);    // lipsync da câmera B
    cover(f, 1.04 + lt * 0.01, 0.55, 0.4, 0, 0);
  } },
  // o playbook
  { a: 38.9, b: 41.6, paper: true, draw: (t, lt) => {
    const e = enter(lt);
    withT(() => smallCaps('PLAYBOOK UBOTS', W / 2, 0), 0, 330, 1, 0, e);
    headline(t, 38.9, 41.6, 430, { size: 74, a: e });
    withT(() => text('Como ofertar crédito no WhatsApp: o método da Viacredi.', W / 2, 0, { w: 600, size: 32, fam: 'Nunito', color: '#4F4A44', align: 'center' }), 0, 640, 1, 0, eOut(prog(lt, 0.3, 0.6)));
    playbookPages(t);
  } },
  // CTA com a persona: o take inteiro da fala, sem corte no meio
  { a: 41.6, b: END_T0, cap: 1180, vig: 0.35, draw: async (t, lt) => {
    const f = await vframe('lipsync/cta', Math.floor((t - 41.71) * FPS) + 1, 97);   // a fala começa em 41,71 s
    cover(f, 1.04 + lt * 0.012, 0.5, 0.42, Math.sin(t * 0.6) * 3, 0);
  } },
  // encerramento (tela final aprovada no v3)
  { a: END_T0, b: DUR, paper: true, draw: (t, lt) => {
    const e = enter(lt, 0.25);
    withT(() => smallCaps('PLAYBOOK UBOTS', W / 2, 0), 0, 330, 1, 0, e);
    withT(() => text('Agentes de IA', W / 2, 0, { w: 800, size: 104, align: 'center' }), 0, 440, 1, 0, e);
    withT(() => {
      text('Como ofertar crédito no WhatsApp:', W / 2, 0, { w: 600, size: 36, fam: 'Nunito', color: '#4F4A44', align: 'center' });
      text('o método da Viacredi.', W / 2, 48, { w: 600, size: 36, fam: 'Nunito', color: '#4F4A44', align: 'center' });
    }, 0, 550, 1, 0, eOut(prog(lt, 0.1, 0.35)));
    docCard(W / 2, 930, 680, eOut(prog(lt, 0.15, 0.4)), 0);
    const bp = eBack(prog(t, END_T0 + 0.25, END_T0 + 0.55), 1.8);
    withT(() => ctaButton(0, 0, 'Baixe grátis', t, 'check'), W / 2, 1270, bp, 0, bp * 2);
    withT(() => text('PDF gratuito', W / 2, 0, { w: 600, size: 28, fam: 'Nunito', color: C.gray, align: 'center' }), 0, 1375, 1, 0, bp);
    logosRow(1490, eOut(prog(t, END_T0 + 0.45, END_T0 + 0.75)));
  } },
];

SCENES.push(...SCENES2);

// glitch digital forte: tremor de zoom, canais RGB separados, faixas deslocadas, blocos, linhas e flashes
let GLA, GLB;
function glitchFX(t, t0, dur) {
  const p = (t - t0) / dur;
  if (p < 0 || p > 1) return;
  if (!GLA) { GLA = document.createElement('canvas'); GLA.width = W; GLA.height = H; GLB = document.createElement('canvas'); GLB.width = W; GLB.height = H; }
  const k = Math.floor(t * FPS), inten = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
  const a = GLA.getContext('2d'), b = GLB.getContext('2d');
  a.clearRect(0, 0, W, H); a.drawImage(cv, 0, 0);
  const z = 1 + 0.07 * hash(k * 3.1) * inten, jx = (hash(k * 5.3) - 0.5) * 70 * inten, jy = (hash(k * 7.7) - 0.5) * 40 * inten;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const dx = (26 + 40 * hash(k * 1.9)) * inten;
  [['#ff0000', -dx], ['#00ff00', 0], ['#0000ff', dx]].forEach(([col, off]) => {
    b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, W, H); b.drawImage(GLA, 0, 0);
    b.globalCompositeOperation = 'multiply'; b.fillStyle = col; b.fillRect(0, 0, W, H);
    ctx.drawImage(GLB, off + jx - (W * (z - 1)) / 2, jy - (H * (z - 1)) / 2, W * z, H * z);
  });
  ctx.restore();
  for (let i = 0; i < 12; i++) {                                    // faixas deslocadas
    const sy = hash(k * 31 + i) * H, sh = 28 + hash(k * 17 + i) * 170, off = (hash(k * 7 + i) - 0.5) * 520 * inten;
    ctx.drawImage(GLA, 0, sy, W, sh, off, sy, W, sh);
  }
  for (let i = 0; i < 5; i++) {                                     // blocos de cor
    ctx.globalAlpha = 0.5 * inten; ctx.fillStyle = [C.yellow, '#ff2a6d', '#22e0ff', '#ffffff', '#000'][i];
    ctx.fillRect(hash(k * 11 + i) * W, hash(k * 13 + i) * H, 120 + hash(k * 3 + i) * 380, 8 + hash(k * 19 + i) * 34);
  }
  ctx.globalAlpha = 0.18 * inten; ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);          // linhas de varredura
  ctx.globalAlpha = 1;
  if (k % 3 === 0 && p < 0.8) { ctx.fillStyle = `rgba(255,255,255,${0.35 * inten})`; ctx.fillRect(0, 0, W, H); }   // flash
  if (p < 0.1) { ctx.fillStyle = 'rgba(249,194,60,0.35)'; ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------------ páginas do playbook (animação da v1)
// a capa chega primeiro; as páginas internas voam da direita girando, como na v1,
// e se encaixam ATRÁS da capa, abrindo um leque que aparece pelas bordas.
function playbookPages(t) {
  const pw = 820, cy = 1040;
  const cover = IMG.capa, ch = pw * cover.height / cover.width;
  const pages = [
    [IMG.in2, 39.4, 0.075, -70, -36],
    [IMG.in9, 39.9, -0.06, 64, -14],
    [IMG.in10, 40.4, 0.035, 18, 30],
  ];
  const sheet = (img, x, y, rot, a) => withT(() => {
    const ph = pw * img.height / img.width;
    ctx.shadowColor = 'rgba(40,30,10,0.25)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = C.white; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.save(); rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.clip(); ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph); ctx.restore();
  }, x, y, 1, rot, a);
  // páginas (atrás), na ordem em que chegam
  pages.forEach(([img, at, r, dx, dy]) => {
    const p = eBack(prog(t, at, at + 0.35), 1.3);
    if (p <= 0) return;
    sheet(img, W / 2 + dx * p + (1 - p) * 700, cy + dy * p, r * p + (1 - p) * 0.3, clamp(p * 2));
  });
  // capa (na frente)
  const cp = eBack(prog(t, 39.15, 39.5), 1.3);
  if (cp > 0) sheet(cover, W / 2 + (1 - cp) * 700, cy, -0.02 + (1 - cp) * 0.3, clamp(cp * 2));
}

function drawFluid(t, lt, a, b) {
  const first = a < 26;
  const e = first ? enter(lt) : 1;
  headline(t, a, b, 330, { size: 58, a: e });
  const by = first ? 520 : 470;
  withT(() => {
    // cooperada
    card(90, by, 360, 108, 54);
    avatar(146, by + 54, 30, 'A');
    text('Ana R.', 192, by + (t > 28.6 ? 36 : 54), { w: 700, size: 32 });
    const tg = eOut(prog(t, 28.6, 28.9));
    if (tg > 0) withT(() => pill(0, 0, 'reforma da cozinha', { size: 20, h: 34, bg: C.yellowL, fg: '#8A6512', w: 600, fam: 'Nunito' }), 290, by + 76, 1, 0, tg);
    chat(t, 90, by + 140, 900, first ? 700 : 760, 'Agente de crédito', FLUID);
  }, 0, (1 - e) * 50, 1, 0, e);
  const sy = by + (first ? 900 : 960);
  steps(t, sy, [['Escuta', 25.5], ['Contexto', 28.7], ['Oferta', 29.1], ['Decisão', 29.5]]);
  text('Reconstituição a partir do relato do projeto.', W / 2, sy + 56, { w: 600, size: 22, fam: 'Nunito', color: '#A8A198', align: 'center' });
}

// ------------------------------------------------------------------ render
async function renderFrame(f) {
  const t = f / FPS;
  const sc = SCENES.find(s => t >= s.a && t < s.b) || SCENES[SCENES.length - 1];
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  P = sc.dark ? DARK : LIGHT;
  if (sc.paper) paper(t);
  await sc.draw(t, t - sc.a);
  P = LIGHT;
  finish(f, sc.vig || 0);
  if (sc.cap && t < END_T0) captions(t, sc.cap);
  ctx.restore();
}

window.REEL = { renderFrame, FPS, DUR, frames: Math.ceil(DUR * FPS) };
window.reelReady = preload().then(() => true);

if (!location.search.includes('render')) {
  window.reelReady.then(async () => {
    const audio = new Audio('../audio/mix_monstro_v3_-14LUFS.wav');
    document.body.addEventListener('click', () => { audio.currentTime = 0; audio.play(); });
    let busy = false;
    const loop = async () => {
      if (!busy) { busy = true; await renderFrame(Math.floor((audio.currentTime || 0) * FPS)); busy = false; }
      requestAnimationFrame(loop);
    };
    loop();
  });
} else document.body.classList.add('render');
