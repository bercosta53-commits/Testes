// Reels Ubots · monstro (animatic) — 1080×1920, 30 fps, 45,96 s.
// Cada quadro é calculado só a partir do tempo, então o render pode ser
// paralelo e sai idêntico a cada execução. Tempos = locução real.
'use strict';
const W = 1080, H = 1920, FPS = 30, DUR = 45.96;
const C = {
  cream: '#FDF8EE', cream2: '#F5ECDA', ink: '#141210', yellow: '#F9C23C', yellowD: '#E3A51E',
  gray: '#77716A', chat: '#EFE7DB', green: '#D9FDD3', white: '#FFFFFF', dark: '#0B0907', dark2: '#1B1714',
};
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ------------------------------------------------------------------ util
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
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
function wrap(text, maxW) {
  const words = text.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    const tryL = cur ? cur + ' ' + w : w;
    if (ctx.measureText(tryL).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryL;
  }
  if (cur) lines.push(cur);
  return lines;
}
function withT(fn, x, y, s = 1, rot = 0, a = 1) {
  if (a <= 0 || s <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  fn();
  ctx.restore();
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
    ubotsDark: 'assets/logo_ubots_dark.png', ubotsLight: 'assets/logo_ubots_light.png', viacredi: 'assets/logo_viacredi.png',
    pg1: 'assets/pdf/p-01.png', pg5: 'assets/pdf/p-05.png', pg8: 'assets/pdf/p-08.png', pg9: 'assets/pdf/p-09.png', pg10: 'assets/pdf/p-10.png',
  };
  await Promise.all(Object.entries(list).map(async ([k, v]) => { IMG[k] = await loadImg(v); }));
  ENV = await (await fetch('assets/vo_env.json')).json();
  await document.fonts.load('800 40px Poppins');
  await document.fonts.load('700 40px Poppins');
  await document.fonts.load('600 40px Poppins');
  await document.fonts.load('700 40px Nunito');
  await document.fonts.load('600 40px Nunito');
  await document.fonts.load('400 40px Nunito');
  makeGrain();
}
const env = t => ENV[Math.max(0, Math.min(ENV.length - 1, Math.round(t * FPS)))] || 0;

// cover: preenche o quadro com a imagem, mantendo o ponto focal (fx, fy) perto do centro
function cover(img, scale = 1, fx = 0.5, fy = 0.5, dx = 0, dy = 0) {
  const s = Math.max(W / img.width, H / img.height) * scale;
  const dw = img.width * s, dh = img.height * s;
  let x = W / 2 - fx * dw + dx, y = H / 2 - fy * dh + dy;
  x = clamp(x, W - dw, 0); y = clamp(y, H - dh, 0);
  ctx.drawImage(img, x, y, dw, dh);
}

// ------------------------------------------------------------------ acabamento
let GRAIN = [];
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
function finish(f, vignette) {
  if (vignette) {
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vignette})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.07;
  ctx.drawImage(GRAIN[f % GRAIN.length], 0, 0, W, H);
  ctx.restore();
}

// ------------------------------------------------------------------ elementos
function sparkle(x, y, r, rot, color = C.yellow) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, rad = i % 2 ? r * 0.28 : r;
    ctx.lineTo(Math.cos(a - Math.PI / 2) * rad, Math.sin(a - Math.PI / 2) * rad);
  }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
function checkIcon(x, y, r, bg = C.ink, fg = C.yellow) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - r * 0.42, y + r * 0.02); ctx.lineTo(x - r * 0.1, y + r * 0.34); ctx.lineTo(x + r * 0.46, y - r * 0.3);
  ctx.strokeStyle = fg; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function shield(x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, -50); ctx.bezierCurveTo(22, -36, 40, -34, 44, -34);
  ctx.lineTo(44, 2); ctx.bezierCurveTo(44, 30, 22, 46, 0, 56);
  ctx.bezierCurveTo(-22, 46, -44, 30, -44, 2); ctx.lineTo(-44, -34);
  ctx.bezierCurveTo(-40, -34, -22, -36, 0, -50); ctx.closePath();
  ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
function waves(x, y, w, amp, n, gap, color, lw, phase) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const px = x + (w * i) / 60;
      const py = y + k * gap + Math.sin((i / 60) * Math.PI * 4 + phase) * amp;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
function pill(x, y, text, opts = {}) {
  const { size = 36, pad = 26, h = 74, bg = C.white, fg = C.ink, border = null, weight = 600, center = true } = opts;
  font(weight, size); const w = ctx.measureText(text).width + pad * 2;
  const x0 = center ? x - w / 2 : x;
  rr(x0, y - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (border) { ctx.lineWidth = 3; ctx.strokeStyle = border; ctx.stroke(); }
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x0 + w / 2, y + 2);
  return w;
}
// bolha de mensagem de voz: foto da persona num círculo com anel de onda reagindo à voz
function personaBubble(t, x, y, r, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const e = env(t);
  for (let k = 0; k < 48; k++) {                       // anel de áudio
    const ang = (k / 48) * Math.PI * 2 - Math.PI / 2;
    const amp = 8 + 34 * e * (0.45 + 0.55 * hash(k * 13 + Math.floor(t * 12)));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * (r + 10), y + Math.sin(ang) * (r + 10));
    ctx.lineTo(x + Math.cos(ang) * (r + 10 + amp), y + Math.sin(ang) * (r + 10 + amp));
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(x, y, r + 6, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const img = IMG.P1, s = (r * 2.5) / (img.width * 0.42);
  ctx.drawImage(img, x - img.width * 0.5 * s, y - img.height * 0.335 * s, img.width * s, img.height * s);
  ctx.restore();
  ctx.restore();
}

// ------------------------------------------------------------------ chat
function chatCard(t, title, msgs, opts = {}) {
  const X = 60, Y = 220, CW = 960, CH = opts.h ?? 930;
  ctx.save();
  ctx.shadowColor = 'rgba(40,30,10,0.18)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
  rr(X, Y, CW, CH, 44); ctx.fillStyle = C.chat; ctx.fill();
  ctx.restore();
  ctx.save(); rr(X, Y, CW, CH, 44); ctx.clip();
  // corpo com mensagens (rolagem automática)
  const top = Y + 170, bottom = Y + CH - 40;
  const items = [];
  let yy = 0;
  for (const m of msgs) {
    if (t < m.at - (m.side === 'in' ? 0.45 : 0)) break;
    const typing = m.side === 'in' && t < m.at;
    font(600, 40, 'Nunito');
    const lines = typing ? ['…'] : wrap(m.text, 640);
    const bh = typing ? 92 : lines.length * 54 + 50 + (m.buttons ? 104 : 0) + (m.seal ? 70 : 0);
    const p = typing ? 1 : eBack(prog(t, m.at, m.at + 0.3), 1.4);
    items.push({ m, lines, bh, y: yy, p, typing });
    yy += bh * clamp(p, 0, 1) + 24;
  }
  const scroll = Math.max(0, top + yy - bottom);
  for (const it of items) {
    const { m, lines, bh, p, typing } = it;
    font(600, 40, 'Nunito');
    const bw = typing ? 150 : Math.max(...lines.map(l => ctx.measureText(l).width)) + 64;
    const bx = m.side === 'in' ? X + 40 : X + CW - 40 - Math.max(bw, m.buttons ? 600 : 0);
    const by = top + it.y - scroll;
    const w = Math.max(bw, m.buttons ? 600 : 0);
    withT(() => {
      rr(0, 0, typing ? bw : w, bh - (m.buttons && !typing ? 104 : 0), 30);
      ctx.fillStyle = m.side === 'in' ? C.white : C.green; ctx.fill();
      if (typing) {
        for (let k = 0; k < 3; k++) {
          ctx.beginPath(); ctx.arc(46 + k * 30, 46, 9 + 3 * Math.sin(t * 10 - k), 0, Math.PI * 2);
          ctx.fillStyle = '#9A948C'; ctx.fill();
        }
        return;
      }
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      font(600, 40, 'Nunito');
      lines.forEach((l, i) => ctx.fillText(l, 32, 64 + i * 54));
      if (m.buttons) {
        m.buttons.forEach((b, i) => {
          rr(i * 306, bh - 92, 294, 84, 20); ctx.fillStyle = C.white; ctx.fill();
          font(700, 36); ctx.fillStyle = '#1F8F5F'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(b, i * 306 + 147, bh - 50);
        });
      }
      if (m.seal) {
        const sp = eBack(prog(t, m.seal, m.seal + 0.3), 2.2);
        withT(() => {
          rr(-150, -34, 300, 68, 34); ctx.fillStyle = C.yellow; ctx.fill();
          font(700, 34); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('✓ Contratação', 0, 2);
        }, w - 170, bh - 30, sp, -0.04, clamp(sp * 2));
      }
    }, bx + (m.side === 'in' ? 0 : w * (1 - p)) * 0, by + (1 - clamp(p)) * 30, 1, 0, clamp(p * 1.6));
  }
  // cabeçalho
  ctx.fillStyle = '#F7F4EF'; ctx.fillRect(X, Y, CW, 150);
  ctx.beginPath(); ctx.arc(X + 100, Y + 76, 44, 0, Math.PI * 2); ctx.fillStyle = C.yellow; ctx.fill();
  sparkle(X + 100, Y + 76, 26, 0, C.ink);
  font(700, 40); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(title, X + 166, Y + 70);
  const tw = ctx.measureText(title).width;
  checkIcon(X + 166 + tw + 30, Y + 57, 16, '#25B064', C.white);
  font(400, 30, 'Nunito'); ctx.fillStyle = C.gray; ctx.fillText('Conta comercial', X + 166, Y + 112);
  ctx.restore();
}

// ------------------------------------------------------------------ legendas
// [início, fim, [[texto exibido, texto falado?], ...]] — *palavra* = destaque
const SEGS = [
  [0.00, 1.39, [['Eu sou uma *IA.*']]],
  [2.21, 5.75, [['E se eu falasse'], ['feito *robô,*'], ['você já teria pulado'], ['esse vídeo.']]],
  [6.11, 11.66, [['Agora imagina'], ['um agente assim'], ['oferecendo *crédito*'], ['no seu *banco…*'], ['ou na sua *cooperativa.*']]],
  [12.03, 16.95, [['É aí que entra'], ['a *Ubots,*'], ['que cria agentes de IA'], ['pra *bancos e cooperativas.*']]],
  [17.30, 21.42, [['O salto é trocar'], ['*regra* por *contexto,*'], ['sem abrir mão'], ['da *segurança.*']]],
  [21.85, 25.87, [['Com *liberdade,*'], ['o agente para'], ['de empurrar oferta'], ['e *escuta.*']]],
  [26.20, 28.48, [['A cooperada conta'], ['da reforma da *cozinha…*']]],
  [28.73, 30.06, [['e ele ajuda'], ['na *decisão.*']]],
  [30.40, 35.44, [['Na *Viacredi,*'], ['esse modelo de agente'], ['já liberou mais de'], ['*R$ 150 mil*', 'cento e cinquenta mil reais']]],
  [35.73, 38.62, [['Que, por sinal…'], ['ainda tá em'], ['*fase de teste.*']]],
  [38.99, 41.41, [['O método completo'], ['tá no *Playbook Ubots.*']]],
  [41.71, 43.37, [['*Clica no link*'], ['e baixa o material.']]],
  [43.70, 45.40, [['Prometo'], ['não *insistir.*']]],
];
const CHUNKS = [];
for (const [a, b, chunks] of SEGS) {
  const weights = chunks.map(c => (c[1] || c[0]).replace(/\*/g, '').length + 4);
  const tot = weights.reduce((x, y) => x + y, 0);
  let acc = a;
  chunks.forEach((c, i) => {
    const d = ((b - a) * weights[i]) / tot;
    CHUNKS.push({ t0: acc, t1: i === chunks.length - 1 ? b + 0.25 : acc + d, text: c[0] });
    acc += d;
  });
}
function captions(t, theme, y) {
  const c = CHUNKS.find(c => t >= c.t0 && t < c.t1);
  if (!c || theme === 'none') return;
  const p = eBack(prog(t, c.t0, c.t0 + 0.14), 2);
  font(800, 66);
  // grupos: frase destacada vira um bloco só; o resto vai palavra por palavra
  const groups = [];
  for (const s of c.text.split(/(\*[^*]+\*)/).filter(x => x.trim())) {
    if (s.startsWith('*')) groups.push({ s: s.replace(/\*/g, '').trim(), hl: true });
    else s.trim().split(/\s+/).forEach(w => groups.push({ s: w, hl: false }));
  }
  const GAP = 22, PAD = 14;
  groups.forEach(g => { g.w = ctx.measureText(g.s).width + (g.hl ? PAD * 2 : 0); });
  const total = groups.reduce((a, g) => a + g.w, 0) + GAP * (groups.length - 1);
  const fit = Math.min(1, 980 / total);
  withT(() => {
    let x = -total / 2;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; font(800, 66);
    for (const g of groups) {
      if (g.hl) {
        rr(x, -46, g.w, 92, 18);
        ctx.fillStyle = theme === 'yellow' ? C.ink : C.yellow; ctx.fill();
        ctx.fillStyle = theme === 'yellow' ? C.yellow : C.ink;
        ctx.fillText(g.s, x + PAD, 4);
      } else {
        if (theme === 'dark') {
          ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineJoin = 'round';
          ctx.strokeText(g.s, x, 4); ctx.fillStyle = C.white;
        } else ctx.fillStyle = C.ink;
        ctx.fillText(g.s, x, 4);
      }
      x += g.w + GAP;
    }
  }, W / 2, y, (0.86 + 0.14 * p) * fit, 0, clamp(p * 3));
}

// ------------------------------------------------------------------ cenas
function bgCream() {
  ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.8, H * 0.1, 50, W * 0.8, H * 0.1, H * 0.7);
  g.addColorStop(0, 'rgba(249,194,60,0.22)'); g.addColorStop(1, 'rgba(249,194,60,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function bgDark() {
  ctx.fillStyle = C.dark; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.75, H * 0.08, 50, W * 0.75, H * 0.08, H * 0.6);
  g.addColorStop(0, 'rgba(249,194,60,0.16)'); g.addColorStop(1, 'rgba(249,194,60,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

const ROBOT = [
  { side: 'in', at: 8.75, text: 'Olá. Temos uma linha de crédito disponível para você. Deseja saber mais? Responda SIM ou NÃO.', buttons: ['SIM', 'NÃO'] },
  { side: 'out', at: 9.55, text: 'Depende, pra que serve?' },
  { side: 'in', at: 10.35, text: 'Não entendi sua resposta. Responda SIM ou NÃO.' },
];
const FLUID = [
  { side: 'out', at: 22.6, text: 'Já tenho um crédito contratado, mas achei bom saber que tem outro disponível.' },
  { side: 'in', at: 24.1, text: 'Que bom! Posso perguntar o que você está planejando?' },
  { side: 'out', at: 28.5, text: 'Estou reformando a cozinha.' },
  { side: 'in', at: 28.95, text: 'Que legal! Essa linha de crédito pode ajudar com a reforma. Quer ver as condições?' },
  { side: 'out', at: 29.45, text: 'Quero! Vou contratar para terminar a obra.', seal: 29.85 },
];
const STEPS = [['Escuta', 25.5], ['Contexto', 28.7], ['Oferta com sentido', 29.1], ['Decisão', 29.5]];

const SCENES = [
  // 01–02 · gancho: persona em tela cheia (foto estática viva)
  { a: 0, b: 6.1, cap: ['dark', 1300], vig: 0.35, draw: (t) => {
    const punch = t >= 2.21 ? 1.17 : 1;
    const drift = t >= 2.21 ? (t - 2.21) * 0.012 : t * 0.02;
    const dx = Math.sin(t * 0.7) * 4, dy = Math.cos(t * 0.5) * 3;
    cover(IMG.P1, (1.02 + drift) * punch, 0.5, 0.36, dx, dy);
    // glitch em "robô"
    if (t > 3.55 && t < 3.72) {
      const k = Math.floor((t - 3.55) * 60);
      for (let i = 0; i < 7; i++) {
        const sy = hash(k * 31 + i) * H, sh = 30 + hash(k * 17 + i) * 120, off = (hash(k * 7 + i) - 0.5) * 120;
        ctx.drawImage(cv, 0, sy, W, sh, off, sy, W, sh);
      }
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ff2a6d'; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    // ✦ no "IA"
    const sp = prog(t, 0.9, 1.25);
    if (t > 0.9 && t < 2.21) {
      const s = eBack(sp, 2.6) * (1 - prog(t, 1.9, 2.21));
      sparkle(790, 560, 70 * s, t * 1.5);
      sparkle(860, 470, 30 * s, -t * 2);
    }
  } },
  // 03 · celular na agência → mergulho na tela
  { a: 6.1, b: 8.4, cap: ['dark', 1300], vig: 0.25, draw: async (t, lt) => {
    const i = Math.floor(lt * FPS) + 1;
    const img = await vframe('v1', i, 69);
    const z = 1 + eInOut(prog(lt, 1.7, 2.3)) * 0.6;
    ctx.save(); ctx.translate(W / 2, H * 0.58); ctx.scale(z, z); ctx.translate(-W / 2, -H * 0.58);
    ctx.drawImage(img, 0, 0, W, H); ctx.restore();
    const fl = prog(lt, 1.85, 2.3);
    if (fl > 0) { ctx.fillStyle = `rgba(253,248,238,${eInOut(fl)})`; ctx.fillRect(0, 0, W, H); }
  } },
  // 04 · o robô travado em regras
  { a: 8.4, b: 12.0, cap: ['light', 1360], draw: (t, lt) => {
    bgCream();
    withT(() => chatCard(t, 'Agente de crédito', ROBOT, { h: 820 }), 0, 0, 1, 0, eOut(prog(lt, 0, 0.25)));
    const tags = [['Bancos', 10.75], ['Cooperativas', 11.05], ['Fintechs', 11.35], ['Financeiras', 11.65]];
    const xs = [300, 680, 330, 700], ys = [1120, 1120, 1218, 1218];
    tags.forEach(([s, at], i) => {
      const p = eBack(prog(t, at, at + 0.25), 2.4);
      withT(() => pill(0, 0, s, { size: 40, h: 82, bg: C.ink, fg: C.yellow, weight: 700 }), xs[i], ys[i], p, (i % 2 ? 1 : -1) * 0.04, clamp(p * 2));
    });
  } },
  // 05 · entra a Ubots
  { a: 12.0, b: 14.8, cap: ['none'], draw: (t, lt) => {
    bgDark();
    waves(-40, 1420, W + 80, 18, 3, 46, 'rgba(249,194,60,0.35)', 8, t * 2);
    const p = eBack(prog(lt, 0.25, 0.75), 1.6);
    const lw = 640, lh = lw * IMG.ubotsLight.height / IMG.ubotsLight.width;
    withT(() => ctx.drawImage(IMG.ubotsLight, -lw / 2, -lh / 2, lw, lh), W / 2, 700, 0.6 + 0.4 * p, 0, clamp(p * 2));
    const words = [['agentes', 0.95], ['de', 1.1], ['IA', 1.25]];
    font(800, 104); ctx.textBaseline = 'middle';
    let total = words.reduce((w, [s]) => w + ctx.measureText(s + ' ').width, 0), x = W / 2 - total / 2;
    for (const [s, at] of words) {
      const q = eBack(prog(lt, at, at + 0.3), 2);
      const ww = ctx.measureText(s + ' ').width;
      withT(() => { ctx.fillStyle = s === 'IA' ? C.yellow : C.white; ctx.textAlign = 'left'; font(800, 104); ctx.fillText(s, 0, 0); }, x, 960 + (1 - q) * 40, 1, 0, clamp(q * 2));
      x += ww;
    }
    const q2 = eOut(prog(lt, 1.55, 1.95));
    withT(() => { font(700, 54); ctx.fillStyle = C.yellow; ctx.textAlign = 'center'; ctx.fillText('para bancos e cooperativas', 0, 0); }, W / 2, 1090 + (1 - q2) * 30, 1, 0, q2);
  } },
  // 06 · o gerente
  { a: 14.8, b: 17.3, cap: ['dark', 1300], vig: 0.3, draw: async (t, lt) => {
    const img = await vframe('v2', Math.floor(lt * FPS) + 1, 75);
    cover(img, 1.1 + lt * 0.01, 0.55, 0.36);
  } },
  // 07 · regras riscadas → REGRA vira CONTEXTO
  { a: 17.3, b: 19.7, cap: ['none'], draw: (t, lt) => {
    bgDark();
    const rules = ['Não fale sobre…', 'Não responda se…', 'Não ofereça…', 'Sempre use a frase…', 'Não saia do roteiro…'];
    const strikes = [17.55, 18.1, 18.65, 18.8, 18.88];
    const cardA = 1 - eInOut(prog(t, 18.9, 19.15));
    withT(() => {
      rr(70, 330, 940, 760, 40); ctx.fillStyle = C.dark2; ctx.fill();
      ['#3a3430', '#3a3430', '#3a3430'].forEach((c, i) => { ctx.beginPath(); ctx.arc(130 + i * 40, 400, 12, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); });
      font(700, 36); ctx.fillStyle = C.white; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Instruções por regras', 250, 402);
      pill(860, 402, '+1 regra a cada ajuste', { size: 26, h: 54, bg: C.yellow, fg: C.ink, weight: 700 });
      ctx.textAlign = 'left';
      rules.forEach((r, i) => {
        const ap = prog(t, 17.3 + i * 0.06, 17.42 + i * 0.06);
        if (ap <= 0) return;
        const y = 520 + i * 108;
        ctx.globalAlpha = ap;
        font(600, 30); ctx.fillStyle = '#7d756d'; ctx.fillText(String(i + 1), 120, y);
        font(600, 50, 'Nunito'); ctx.fillStyle = C.white;
        const w = ctx.measureText(r).width;
        ctx.fillStyle = 'rgba(249,194,60,0.28)'; ctx.fillRect(170, y + 12, w + 10, 16);
        ctx.fillStyle = C.white; ctx.fillText(r, 175, y);
        const sp = eOut(prog(t, strikes[i], strikes[i] + 0.18));
        if (sp > 0) { ctx.fillStyle = C.yellow; ctx.fillRect(165, y - 4, (w + 20) * sp, 9); }
        ctx.globalAlpha = 1;
      });
    }, 0, 0, 1, 0, cardA);
    // REGRA → CONTEXTO
    const r1 = eOut(prog(t, 18.9, 19.05)), out = eInOut(prog(t, 19.2, 19.4));
    const c1 = eBack(prog(t, 19.25, 19.5), 1.8);
    font(800, 150); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    withT(() => {
      font(800, 150); ctx.fillStyle = C.white; ctx.fillText('REGRA', 0, 0);
      const st = eOut(prog(t, 19.05, 19.2)); const w = ctx.measureText('REGRA').width;
      ctx.fillStyle = C.yellow; ctx.fillRect(-w / 2 - 10, -8, (w + 20) * st, 16);
    }, W / 2, 860 - out * 260, 1, 0, r1 * (1 - out));
    withT(() => { font(800, 132); ctx.fillStyle = C.yellow; ctx.fillText('CONTEXTO', 0, 0); }, W / 2, 860 + (1 - c1) * 200, 0.9 + 0.1 * c1, 0, clamp(c1 * 2));
  } },
  // 08 · segurança onde importa
  { a: 19.7, b: 21.85, cap: ['yellow', 1330], draw: (t, lt) => {
    ctx.fillStyle = C.yellow; ctx.fillRect(0, 0, W, H);
    waves(-40, 1500, W + 80, 16, 3, 40, 'rgba(20,18,16,0.18)', 7, t * 2);
    const p = eBack(prog(lt, 0, 0.3), 2);
    withT(() => { ctx.beginPath(); ctx.arc(0, 0, 86, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); shield(0, 0, 1.15, C.yellow); }, W / 2, 380, p);
    withT(() => { font(800, 74); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Segurança', 0, 0); ctx.fillText('onde importa', 0, 88); }, W / 2, 560, 1, 0, eOut(prog(lt, 0.1, 0.35)));
    [['Guardrails de segurança', 19.95], ['Transparência sobre custos', 20.4], ['Contratação pelo canal seguro', 20.85]].forEach(([s, at], i) => {
      const q = eBack(prog(t, at, at + 0.28), 1.6);
      withT(() => {
        rr(-430, -62, 860, 124, 30); ctx.fillStyle = C.white; ctx.fill();
        checkIcon(-350, 0, 34);
        font(700, 42, 'Nunito'); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, -290, 2);
      }, W / 2 + (1 - q) * 120, 800 + i * 150, 1, 0, clamp(q * 2));
    });
  } },
  // 09 · o agente que escuta (+ persona em bolha de voz)
  { a: 21.85, b: 26.2, cap: ['light', 1330], draw: (t, lt) => drawFluid(t, lt) },
  // 10 · a cozinha
  { a: 26.2, b: 28.45, cap: ['dark', 1300], vig: 0.3, draw: async (t, lt) => {
    const img = await vframe('v3', Math.floor(lt * FPS) + 1, 68);
    cover(img, 1.0, 0.5, 0.4);
  } },
  // 11 · contexto → oferta → decisão
  { a: 28.45, b: 30.4, cap: ['light', 1330], draw: (t, lt) => drawFluid(t, lt + 10) },
  // 12 · o resultado
  { a: 30.4, b: 35.7, cap: ['none'], draw: (t, lt) => {
    const shake = t > 34.75 && t < 35.0 ? (hash(Math.floor(t * 60)) - 0.5) * 22 * (1 - prog(t, 34.75, 35.0)) : 0;
    ctx.save(); ctx.translate(shake, -shake * 0.6);
    ctx.fillStyle = C.yellow; ctx.fillRect(-30, -30, W + 60, H + 60);
    waves(-40, 1480, W + 80, 18, 3, 46, 'rgba(20,18,16,0.16)', 8, t * 2);
    const lp = eOut(prog(lt, 0.1, 0.45));
    withT(() => {
      rr(-230, -70, 460, 140, 70); ctx.fillStyle = C.white; ctx.fill();
      const lw = 360, lh = lw * IMG.viacredi.height / IMG.viacredi.width;
      ctx.drawImage(IMG.viacredi, -lw / 2, -lh / 2, lw, lh);
    }, W / 2, 330, 1, 0, lp);
    withT(() => pill(0, 0, 'GERAÇÃO DE NEGÓCIO', { size: 32, h: 70, bg: 'rgba(20,18,16,0.12)', fg: C.ink, weight: 700 }), W / 2, 540, 1, 0, eOut(prog(lt, 0.4, 0.7)));
    const n = Math.round(150 * eOut(prog(t, 31.4, 34.75)));
    const hit = eBack(prog(t, 34.75, 35.0), 3);
    withT(() => {
      font(800, 156); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`+R$ ${n} mil`, 0, 0);
    }, W / 2, 760, 1 + 0.08 * (t > 34.75 ? 1 - hit : 0) + (t > 34.75 ? 0 : 0), 0, eOut(prog(lt, 0.8, 1.1)));
    withT(() => {
      font(700, 50, 'Nunito'); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
      ctx.fillText('em crédito liberado pelo agente', 0, 0);
      ctx.fillText('ainda na fase de testes', 0, 66);
    }, W / 2, 930, 1, 0, eOut(prog(lt, 1.3, 1.7)));
    withT(() => {
      font(400, 30, 'Nunito'); ctx.fillStyle = 'rgba(20,18,16,0.62)'; ctx.textAlign = 'center';
      ctx.fillText('Os resultados da Viacredi não constituem', 0, 0);
      ctx.fillText('projeção para outras instituições.', 0, 40);
    }, W / 2, 1200, 1, 0, eOut(prog(lt, 1.8, 2.2)));
    ctx.restore();
  } },
  // 13 · "que, por sinal…" — câmera B
  { a: 35.7, b: 38.9, cap: ['dark', 1300], vig: 0.35, draw: (t, lt) => {
    cover(IMG.P2, 1.06 + lt * 0.012, 0.55, 0.4, Math.sin(t * 0.6) * 4, 0);
    const p = prog(t, 37.62, 37.85);
    if (p > 0) {
      const s = lerp(1.8, 1, eOut(p));
      withT(() => {
        ctx.lineWidth = 12; rr(-300, -95, 600, 190, 26);
        ctx.fillStyle = 'rgba(20,18,16,0.82)'; ctx.fill(); ctx.strokeStyle = C.yellow; ctx.stroke();
        font(800, 96); ctx.fillStyle = C.yellow; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EM TESTE', 0, 6);
      }, W / 2, 1000, s, -0.09, clamp(p * 3));
    }
  } },
  // 14 · o playbook
  { a: 38.9, b: 41.6, cap: ['dark', 1360], draw: (t, lt) => {
    bgDark();
    withT(() => pill(0, 0, 'PLAYBOOK UBOTS', { size: 34, h: 74, bg: C.yellow, fg: C.ink, weight: 800 }), W / 2, 300, 1, 0, eOut(prog(lt, 0.15, 0.4)));
    withT(() => {
      font(800, 72); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Agentes de IA na', 0, 0); ctx.fillText('Oferta de Crédito', 0, 86);
    }, W / 2, 430, 1, 0, eOut(prog(lt, 0.25, 0.55)));
    const pages = [IMG.pg1, IMG.pg5, IMG.pg9, IMG.pg10];
    const ats = [39.15, 39.4, 39.9, 40.4];
    pages.forEach((img, i) => {
      const p = eBack(prog(t, ats[i], ats[i] + 0.35), 1.3);
      if (p <= 0) return;
      const pw = 880, ph = pw * img.height / img.width;
      const rot = [-0.05, 0.035, -0.02, 0.05][i] + (1 - p) * 0.3;
      withT(() => {
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
        rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = C.white; ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.save(); rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.clip(); ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph); ctx.restore();
      }, W / 2 + (1 - p) * 700 + i * 8, 900 + i * 14, 1, rot, clamp(p * 2));
    });
  } },
  // 15 · CTA com a persona
  { a: 41.6, b: DUR, cap: ['dark', 1150], vig: 0.35, draw: (t, lt) => {
    cover(IMG.P3, 1.04 + lt * 0.01, 0.5, 0.42, Math.sin(t * 0.6) * 3, 0);
    const p = eBack(prog(t, 42.5, 42.85), 1.4);
    const endA = eInOut(prog(t, 44.8, 45.2));
    withT(() => {
      rr(-420, -90, 840, 180, 40); ctx.fillStyle = C.white; ctx.fill();
      const cw = 210, ch = cw * IMG.pg1.height / IMG.pg1.width;
      ctx.save(); rr(-390, -ch / 2, cw, ch, 10); ctx.clip(); ctx.drawImage(IMG.pg1, -390, -ch / 2, cw, ch); ctx.restore();
      font(800, 46); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Baixe o Playbook', -150, -24);
      font(600, 30, 'Nunito'); ctx.fillStyle = C.gray; ctx.fillText('Agentes de IA no crédito', -150, 30);
      const bob = Math.sin(t * 8) * 8;
      ctx.beginPath(); ctx.arc(330, 0, 52, 0, Math.PI * 2); ctx.fillStyle = C.yellow; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(330, -24 + bob); ctx.lineTo(330, 22 + bob); ctx.moveTo(310, 4 + bob); ctx.lineTo(330, 24 + bob); ctx.lineTo(350, 4 + bob); ctx.stroke();
    }, W / 2, 1380 + (1 - clamp(p)) * 260, 1, 0, clamp(p * 2) * (1 - endA));
    if (endA > 0) {
      ctx.fillStyle = `rgba(11,9,7,${0.86 * endA})`; ctx.fillRect(0, 0, W, H);
      const q = eBack(prog(t, 44.9, 45.3), 1.6);
      const lw = 560, lh = lw * IMG.ubotsLight.height / IMG.ubotsLight.width;
      withT(() => ctx.drawImage(IMG.ubotsLight, -lw / 2, -lh / 2, lw, lh), W / 2, 820, 0.7 + 0.3 * q, 0, clamp(q * 2));
      withT(() => {
        font(700, 50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = C.white; ctx.fillText('Segurança onde importa.', 0, 0);
        ctx.fillStyle = C.yellow; ctx.fillText('Conversa de verdade no resto.', 0, 70);
      }, W / 2, 1000, 1, 0, eOut(prog(t, 45.1, 45.45)));
    }
  } },
];

function drawFluid(t, lt) {
  bgCream();
  const first = t < 26.2;
  withT(() => chatCard(t, 'Agente de crédito', FLUID, { h: 880 }), 0, 0, 1, 0, first ? eOut(prog(t, 21.85, 22.1)) : 1);
  // etapas
  const y = 1160;
  font(700, 30);
  const widths = STEPS.map(([s]) => ctx.measureText(s).width + 56);
  const gap = 14, total = widths.reduce((a, b) => a + b, 0) + gap * 3;
  let x = W / 2 - total / 2;
  STEPS.forEach(([s, at], i) => {
    const on = eBack(prog(t, at, at + 0.25), 2.2);
    const active = t >= at;
    withT(() => pill(0, 0, s, { size: 30, h: 64, bg: active ? C.yellow : 'rgba(20,18,16,0.06)', fg: active ? C.ink : C.gray, weight: 700, border: active ? null : 'rgba(20,18,16,0.12)' }),
      x + widths[i] / 2, y, active ? 0.9 + 0.1 * on : 1, 0, 1);
    x += widths[i] + gap;
  });
  // persona em bolha de voz enquanto ela narra
  const pa = first ? eBack(prog(t, 21.75, 22.1), 2) : 1;
  personaBubble(t, 900, 270, 92, clamp(pa));
}

// ------------------------------------------------------------------ transições de onda (T2)
function waveWipe(t, t0, dur) {
  const p = prog(t, t0, t0 + dur);
  if (p <= 0 || p >= 1) return;
  const top = lerp(H + 200, -260, eInOut(clamp(p * 2)));
  const bot = lerp(H + 260, -200, eInOut(clamp(p * 2 - 1)));
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const x = (W * i) / 40; ctx.lineTo(x, top + Math.sin(i / 40 * Math.PI * 3 + t * 8) * 40); }
  for (let i = 40; i >= 0; i--) { const x = (W * i) / 40; ctx.lineTo(x, bot + Math.sin(i / 40 * Math.PI * 3 + t * 8 + 1) * 40); }
  ctx.closePath(); ctx.fillStyle = C.yellow; ctx.fill();
  ctx.clip();
  waves(-40, (top + bot) / 2 - 60, W + 80, 26, 3, 56, 'rgba(20,18,16,0.85)', 12, t * 6);
  ctx.restore();
}

// ------------------------------------------------------------------ render
async function renderFrame(f) {
  const t = f / FPS;
  const sc = SCENES.find(s => t >= s.a && t < s.b) || SCENES[SCENES.length - 1];
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  await sc.draw(t, t - sc.a);
  if (sc.vig) finish(f, sc.vig); else finish(f, 0);
  waveWipe(t, 11.75, 0.5);
  waveWipe(t, 38.65, 0.5);
  const [theme, y] = sc.cap;
  if (t < 45.45) captions(t, theme, y);
  ctx.restore();
}

window.REEL = { renderFrame, FPS, DUR, frames: Math.ceil(DUR * FPS) };
window.reelReady = preload().then(() => true);

// pré-visualização no navegador (sem ?render): toca em tempo real com o áudio
if (!location.search.includes('render')) {
  window.reelReady.then(async () => {
    const audio = new Audio('../audio/mix_monstro_-14LUFS.wav');
    document.body.addEventListener('click', () => { audio.currentTime = 0; audio.play(); });
    let busy = false;
    const loop = async () => {
      if (!busy) { busy = true; await renderFrame(Math.floor((audio.currentTime || 0) * FPS)); busy = false; }
      requestAnimationFrame(loop);
    };
    loop();
  });
} else document.body.classList.add('render');
