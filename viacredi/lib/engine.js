// Motor de motion: cada quadro é uma função pura do tempo t (segundos).
// Mesma ideia do showreel/, mas a cena é DOM (HTML/CSS) para tipografia e UI nítidas.
// O preview toca no navegador; o render.mjs chama ENGINE.seek(t) quadro a quadro.
'use strict';

const W = 1080, H = 1920, FPS = 30;
const M = 72;                 // margem lateral da grade
const CW = W - M * 2;         // largura útil (936)

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: t => t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
};
// Animação de entrada padrão da linguagem: rápida, sem "flutuar".
const enter = (t, t0, d = 0.45, ease = E.outExpo) => ease(prog(t, t0, t0 + d));
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

function h(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
function pos(e, x, y, w, hh) {
  e.style.left = x + 'px'; e.style.top = y + 'px';
  if (w != null) e.style.width = w + 'px';
  if (hh != null) e.style.height = hh + 'px';
  return e;
}
function tf(e, { x = 0, y = 0, s = 1, sx, sy, r = 0, o } = {}) {
  e.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${sx ?? s},${sy ?? s})`;
  if (o != null) e.style.opacity = o;
}
const op = (e, o) => { e.style.opacity = o; };
const show = (e, v) => { e.style.visibility = v ? 'visible' : 'hidden'; };
// Revela por máscara: o conteúdo sobe de dentro de uma linha recortada.
function maskLine(parent, cls, html) {
  const m = h('div', 'mask ' + (cls || ''), parent);
  const i = h('div', 'mask-in', m, html);
  return { m, i };
}
function maskT(ml, k) { ml.i.style.transform = `translate3d(0,${(1 - k) * 110}%,0)`; }
// Ajusta o corpo do texto para ocupar exatamente a largura dada.
function fit(e, width, max = 600) {
  e.style.fontSize = '100px';
  const pw = e.style.width; e.style.width = 'max-content';
  const w = e.scrollWidth;
  e.style.width = pw;
  const size = Math.min(max, (100 * width) / w);
  e.style.fontSize = size.toFixed(2) + 'px';
  return size;
}
// Ondas do ebook (≈): 3 senoides empilhadas, fase animada.
function wave(parent, cls, w = 180, hh = 96, lines = 3) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${hh}`);
  svg.setAttribute('width', w); svg.setAttribute('height', hh);
  svg.classList.add('wave'); if (cls) svg.classList.add(cls);
  const paths = [];
  for (let i = 0; i < lines; i++) { const p = document.createElementNS(ns, 'path'); svg.appendChild(p); paths.push(p); }
  parent.appendChild(svg);
  return {
    svg,
    set(phase, amp = 1, draw = 1) {
      const gap = hh / (lines + 0.4), A = gap * 0.28 * amp, per = w / 2.5;
      paths.forEach((p, i) => {
        const y0 = gap * (i + 0.7); let d = '';
        const n = Math.max(2, Math.round(60 * draw));
        for (let k = 0; k <= n; k++) {
          const x = 8 + (w - 16) * draw * (k / n);
          const y = y0 + Math.sin((x / per) * Math.PI * 2 + phase) * A;
          d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        p.setAttribute('d', d);
      });
    },
  };
}

// ---------------------------------------------------------------- legendas
// VO: lista de [t0, t1, texto]. Cada bloco vira uma legenda; as palavras acendem
// distribuídas pelo número de letras (trocar por alinhamento real da locução).
function buildCaptions(stage, chunks) {
  const box = h('div', 'cap', stage);
  const items = chunks.map(([t0, t1, text, opt = {}]) => {
    const el = h('div', 'cap-line', box);
    const words = text.split(' ');
    const total = words.reduce((a, w) => a + w.length + 1, 0);
    let acc = 0;
    const ws = words.map((w, i) => {
      const s = h('span', 'w', el, w + ' '); s.style.display = 'inline-block'; s.style.whiteSpace = 'pre';
      // tempo real da palavra (transcrição) quando existe; senão, distribuído pelas letras
      const at = opt.words ? opt.words[i] : t0 + (acc / total) * (t1 - t0);
      acc += w.length + 1;
      return { s, at };
    });
    return { el, t0, t1, ws, hide: !!opt.hide };
  });
  return {
    box, items,
    update(t, visible) {
      items.forEach((it, i) => {
        const next = items[i + 1];
        // a frase fica na tela até a próxima começar ou a cena dela acabar (tempo de leitura)
        const home = ENGINE.scenes.filter(s => s.t0 <= it.t0 + 0.08).pop();
        const end = Math.min(next ? next.t0 - 0.02 : Infinity, home ? home.t1 : it.t1 + 1.5);
        const on = visible && !it.hide && t >= it.t0 - 0.08 && t < end;
        it.el.style.display = on ? 'block' : 'none';
        if (!on) return;
        const k = enter(t, it.t0 - 0.08, 0.3);
        tf(it.el, { y: (1 - k) * 18, o: k });
        if (ENGINE.capMode === 'build') {
          // modo referência: cada palavra nasce quando é dita (cinza → tinta, sobe 14 px)
          it.ws.forEach(w => { const kw = enter(t, w.at - 0.04, 0.32); w.s.style.opacity = kw; w.s.style.transform = `translateY(${(1 - kw) * 14}px)`; w.s.classList.toggle('on', kw > 0.98); });
        } else it.ws.forEach(w => w.s.classList.toggle('on', t >= w.at - 0.02));
      });
    },
  };
}

// ---------------------------------------------------------------- grão
function buildGrain(stage) {
  const c = h('canvas', 'grain', stage);
  c.width = W / 2; c.height = H / 2;
  const ctx = c.getContext('2d');
  const tiles = [];
  for (let k = 0; k < 6; k++) {
    const img = ctx.createImageData(c.width, c.height);
    let a = (k + 1) * 9973;
    for (let i = 0; i < img.data.length; i += 4) {
      a = (a * 1103515245 + 12345) & 0x7fffffff;
      const v = a & 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    tiles.push(img);
  }
  return { update(t) { ctx.putImageData(tiles[Math.floor(t * 30 + 1e-6) % tiles.length], 0, 0); } };
}

// ---------------------------------------------------------------- motor
const ENGINE = {
  scenes: [], dur: 10, t: 0,
  init({ dur, captions, meta }) {
    this.dur = dur;
    this.stage = document.getElementById('stage');
    this.root = h('div', 'scenes', this.stage);
    this.cap = captions ? buildCaptions(this.stage, captions) : null;
    this.grain = buildGrain(this.stage);
    if (meta) this.meta = meta(this.stage);
  },
  // tone: 'light' | 'dark' | 'yellow' (define cor da legenda e da barra de topo)
  scene(t0, t1, tone, build, { captions = true } = {}) {
    const el = h('div', 'scene tone-' + tone, this.root);
    const cam = h('div', 'cam', el);
    el.style.display = 'block';           // visível durante a montagem para medir texto
    const api = build(cam, el) || {};
    el.style.display = 'none';
    this.scenes.push({ t0, t1, tone, el, cam, update: api.update || (() => {}), captions });
  },
  seek(t) {
    this.t = t;
    let top = null;
    for (const s of this.scenes) {
      const on = t >= s.t0 && t < s.t1;
      s.el.style.display = on ? 'block' : 'none';
      if (on) {
        // câmera: empurrão lento e contínuo dá vida sem "flutuar"
        const k = prog(t, s.t0, s.t1);
        s.cam.style.transform = `scale(${1 + 0.025 * k})`;
        s.update(t - s.t0, t);
        top = s;
      }
    }
    if (top) this.stage.dataset.tone = top.tone;
    if (this.cap) this.cap.update(t, top ? top.captions : false);
    if (this.meta) this.meta.update(t, top);
    this.grain.update(t);
  },
};

// ---------------------------------------------------------------- preview
async function boot(setup) {
  await Promise.all(['600','700','800','900'].map(w => document.fonts.load(`${w} 100px Poppins`))
    .concat(['400','600','700','800'].map(w => document.fonts.load(`${w} 100px Nunito`))));
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => (i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
  setup();
  const render = new URLSearchParams(location.search).has('render');
  if (render) { ENGINE.seek(0); window.ready = true; return; }
  document.body.classList.add('preview');
  const bar = h('div', 'controls', document.body);
  const play = h('button', '', bar, '▶');
  const range = h('input', '', bar); range.type = 'range'; range.min = 0; range.max = ENGINE.dur; range.step = 1 / FPS;
  const time = h('span', 'time', bar);
  const audios = ['audio/mix.wav'].map(src => { const a = new Audio(src); a.preload = 'auto'; a.onerror = () => { a.broken = true; }; return a; });
  let playing = false, t0 = 0, base = 0;
  const fitStage = () => {
    const s = Math.min((innerHeight - 70) / H, innerWidth / W);
    ENGINE.stage.style.transform = `scale(${s})`;
    document.querySelector('.frame').style.width = W * s + 'px';
    document.querySelector('.frame').style.height = H * s + 'px';
  };
  addEventListener('resize', fitStage); fitStage();
  const set = t => { ENGINE.seek(t); range.value = t; time.textContent = t.toFixed(2) + ' s'; };
  const toggle = () => {
    playing = !playing; play.textContent = playing ? '❚❚' : '▶';
    if (playing) {
      if (ENGINE.t >= ENGINE.dur - 0.05) set(0);
      base = ENGINE.t; t0 = performance.now();
      audios.forEach(a => { if (!a.broken) { a.currentTime = base; a.play().catch(() => {}); } });
      requestAnimationFrame(loop);
    } else audios.forEach(a => a.pause());
  };
  const loop = () => {
    if (!playing) return;
    const t = base + (performance.now() - t0) / 1000;
    if (t >= ENGINE.dur) { set(ENGINE.dur - 1 / FPS); toggle(); return; }
    set(t); requestAnimationFrame(loop);
  };
  play.onclick = toggle;
  range.oninput = () => { if (playing) toggle(); set(+range.value); };
  addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
  const q = new URLSearchParams(location.search).get('t');
  set(q ? +q : 0);
}
