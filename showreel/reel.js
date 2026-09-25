// Motion Showreel 2026 — every frame is a pure function of time, so the reel
// can be rendered offline, frame-exact, in parallel, with real motion blur.
'use strict';

const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const BPM = 128, BEAT = 60 / BPM, DUR = 15, FPS = 60;
const FRAMES = DUR * FPS;
const TAU = Math.PI * 2;

const C = {
  ink: '#0c0b10', ink2: '#17151e', paper: '#f3efe6', coral: '#ff4a2b',
  lime: '#d6ff3d', cobalt: '#2c34ff', pink: '#ff9ad5',
};

const F = {
  display: s => `900 ${s}px Unbounded`,
  grotesk: (s, w = 700) => `${w} ${s}px 'Space Grotesk'`,
  mono: (s, w = 500) => `${w} ${s}px 'JetBrains Mono'`,
  serif: s => `italic 400 ${s}px 'Instrument Serif'`,
};

// ---------------------------------------------------------------- math
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (x, a, b) => clamp((x - a) / (b - a));
const E = {
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: t => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  outBounce: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
};
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(t)))).join(',')})`;
}
const decay = (b, at, k) => (b < at ? 0 : Math.exp(-(b - at) * k));

// ---------------------------------------------------------------- timeline
// [beat, strength, flash]
const HITS = [[4, 1, 0], [8, 0.8, 0], [12, 1.1, 0.7], [15, 1.3, 0.8], [16, 1, 0.25], [20, 0.8, 0],
  [24, 0.7, 0], [25.15, 1, 0], [28, 1.4, 0.9]];

// ---------------------------------------------------------------- text helpers
function measure(ctx, font, text) { ctx.font = font; return ctx.measureText(text).width; }

// Letters rise out of a mask line, staggered.
function maskedText(ctx, text, x, baseline, size, font, color, lb, t0, opt = {}) {
  const { stagger = 0.045, dur = 0.55, align = 'center', ease = E.outExpo, dir = 1, clip = true } = opt;
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  const total = ctx.measureText(text).width;
  const x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  if (clip) { ctx.beginPath(); ctx.rect(-W, baseline - size * 1.0, W * 3, size * 1.22); ctx.clip(); }
  for (let i = 0; i < text.length; i++) {
    const p = ease(prog(lb, t0 + i * stagger, t0 + i * stagger + dur));
    if (p <= 0) continue;
    const pre = ctx.measureText(text.slice(0, i)).width;
    ctx.fillText(text[i], x0 + pre, baseline + (1 - p) * size * 1.15 * dir);
  }
  ctx.restore();
  return total;
}

// Monospace type-on with a block cursor.
function typeOn(ctx, text, x, y, size, color, lb, t0, cps = 40, opt = {}) {
  const n = Math.floor(clamp((lb - t0) * BEAT * cps, 0, text.length));
  if (lb < t0) return;
  ctx.save();
  ctx.font = F.mono(size, opt.weight || 500);
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  if (opt.align === 'right') { ctx.textAlign = 'right'; }
  ctx.fillText(text.slice(0, n), x, y);
  if (n < text.length || Math.floor(lb * 4) % 2 === 0) {
    const w = ctx.measureText(text.slice(0, n)).width;
    const cx = opt.align === 'right' ? x + 4 : x + w + 4;
    if (!opt.noCursor) ctx.fillRect(cx, y - size * 0.8, size * 0.55, size * 0.95);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- precomputed assets
const ASSETS = {};
function polyRadii(verts, n) {
  const out = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const th = (k / n) * TAU, dx = Math.cos(th), dy = Math.sin(th);
    let best = 0;
    for (let j = 0; j < verts.length; j++) {
      const [ax, ay] = verts[j], [bx, by] = verts[(j + 1) % verts.length];
      const ex = bx - ax, ey = by - ay;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const s = (ax * ey - ay * ex) / den;
      const u = (ax * dy - ay * dx) / den;
      if (s > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.max(best, s);
    }
    out[k] = best;
  }
  return out;
}
function ngon(n, r, a0) { return Array.from({ length: n }, (_, j) => [r * Math.cos(a0 + (j / n) * TAU), r * Math.sin(a0 + (j / n) * TAU)]); }

function buildAssets() {
  const N = 240;
  ASSETS.N = N;
  const circle = new Float32Array(N).fill(1);
  const square = polyRadii(ngon(4, 1.22, Math.PI / 4), N);
  const tri = polyRadii(ngon(3, 1.38, -Math.PI / 2), N);
  const starV = [];
  for (let j = 0; j < 10; j++) { const r = j % 2 ? 0.58 : 1.36, a = -Math.PI / 2 + (j / 10) * TAU; starV.push([r * Math.cos(a), r * Math.sin(a)]); }
  const star = polyRadii(starV, N);
  const hex = polyRadii(ngon(6, 1.08, 0), N);
  ASSETS.shapes = [circle, square, tri, star, hex];

  // particle targets from type
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  let size = 330;
  g.font = F.display(size);
  const tw = g.measureText('CRAFT').width;
  size = Math.min(size, size * 1480 / tw);
  g.font = F.display(size);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
  g.fillText('CRAFT', CX, CY - 10);
  const data = g.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let y = 0; y < H; y += 5) for (let x = 0; x < W; x += 5) if (data[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
  const r = rng(7);
  for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  const NP = 2600;
  let minx = Infinity, maxx = -Infinity;
  for (const p of pts) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); }
  ASSETS.particles = Array.from({ length: NP }, (_, i) => {
    const [tx, ty] = pts[i % pts.length];
    const c = r();
    return {
      tx: tx + (r() - 0.5) * 3, ty: ty + (r() - 0.5) * 3,
      xn: (tx - minx) / (maxx - minx),
      a: r() * TAU, rad: 160 + Math.pow(r(), 0.7) * 820,
      a2: r() * TAU, rad2: 300 + r() * 1300,
      p1: r() * TAU, p2: r() * TAU, sp: 0.6 + r() * 1.4,
      s: 2.2 + r() * 2.6,
      col: c < 0.8 ? 0 : c < 0.93 ? 1 : 2,
    };
  });

  // 3D formations
  const M = 1100;
  ASSETS.M = M;
  const sphere = [], torus = [], cube = [], helix = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < M; i++) {
    const y = 1 - (i / (M - 1)) * 2, rr = Math.sqrt(1 - y * y), th = ga * i;
    sphere.push([Math.cos(th) * rr * 330, y * 330, Math.sin(th) * rr * 330]);
    const u = ((i % 44) / 44) * TAU, v = (Math.floor(i / 44) / 25) * TAU;
    torus.push([(300 + 115 * Math.cos(u)) * Math.cos(v), 115 * Math.sin(u), (300 + 115 * Math.cos(u)) * Math.sin(v)]);
    const f = i % 6, k = Math.floor(i / 6), gu = (k % 14) / 13 * 2 - 1, gv = Math.floor(k / 14) / 13 * 2 - 1, s = 250;
    const faces = [[s, gu * s, gv * s], [-s, gu * s, gv * s], [gu * s, s, gv * s], [gu * s, -s, gv * s], [gu * s, gv * s, s], [gu * s, gv * s, -s]];
    cube.push(faces[f]);
    const hy = lerp(-420, 420, i / M), ha = (i / M) * TAU * 2.2 + (i % 2) * Math.PI;
    // two strands, every 11th point sits on a rung between them
    const hr = i % 11 === 0 ? 210 * ((((i * 37) % 100) / 100) * 2 - 1) : 210;
    helix.push([Math.cos(ha) * hr, hy, Math.sin(ha) * hr]);
  }
  ASSETS.forms = [sphere, torus, cube, helix];
  ASSETS.depthIdx = new Uint16Array(M);
  ASSETS.proj = new Float32Array(M * 4);

  // truchet orientation per tile
  ASSETS.tile = (i, j) => (hash(i * 31.7 + j * 17.3) > 0.5 ? 1 : 0);

  // film grain plates
  ASSETS.grain = [];
  const gr = rng(99);
  for (let k = 0; k < 6; k++) {
    const c = document.createElement('canvas'); c.width = 960; c.height = 540;
    const x = c.getContext('2d'), im = x.createImageData(960, 540);
    for (let p = 0; p < im.data.length; p += 4) {
      const v = gr() * 255;
      im.data[p] = im.data[p + 1] = im.data[p + 2] = v; im.data[p + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    ASSETS.grain.push(c);
  }
}

// ---------------------------------------------------------------- scene 1: ignition (beats 0-4)
function S1(ctx, b) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // blueprint grid draws on
  ctx.save();
  ctx.strokeStyle = 'rgba(243,239,230,0.07)'; ctx.lineWidth = 1;
  for (let i = 1; i < 16; i++) {
    const p = E.outExpo(prog(b, 1 + i * 0.03, 1.8 + i * 0.03));
    const x = i * 120;
    ctx.beginPath(); ctx.moveTo(x, CY - CY * p); ctx.lineTo(x, CY + CY * p); ctx.stroke();
  }
  for (let j = 1; j < 9; j++) {
    const p = E.outExpo(prog(b, 1.2 + j * 0.03, 2 + j * 0.03));
    const y = j * 120;
    ctx.beginPath(); ctx.moveTo(CX - CX * p, y); ctx.lineTo(CX + CX * p, y); ctx.stroke();
  }
  ctx.restore();

  // crosshair from the dot
  const ch = E.outExpo(prog(b, 1, 1.7));
  ctx.save();
  ctx.strokeStyle = C.coral; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX - 60 - 700 * ch, CY); ctx.lineTo(CX - 60, CY);
  ctx.moveTo(CX + 60, CY); ctx.lineTo(CX + 60 + 700 * ch, CY);
  ctx.moveTo(CX, CY - 60 - 380 * ch); ctx.lineTo(CX, CY - 60);
  ctx.moveTo(CX, CY + 60); ctx.lineTo(CX, CY + 60 + 380 * ch);
  ctx.stroke();
  // ticks
  ctx.fillStyle = C.coral;
  for (let k = 1; k <= 7; k++) {
    if (k * 100 > 700 * ch) break;
    ctx.fillRect(CX + 60 + k * 100 - 1, CY - 8, 2, 16);
    ctx.fillRect(CX - 60 - k * 100 - 1, CY - 8, 2, 16);
  }
  ctx.restore();

  // beat rings
  for (let k = 0; k < 4; k++) {
    if (b < k) continue;
    const p = prog(b, k, k + 1.6);
    if (p >= 1) continue;
    ctx.save();
    ctx.strokeStyle = k % 2 ? C.paper : C.coral;
    ctx.globalAlpha = (1 - p) * 0.9;
    ctx.lineWidth = lerp(6, 1, p);
    ctx.beginPath(); ctx.arc(CX, CY, 24 + E.outExpo(p) * 640, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  // the dot: pops, pulses on the beat, then swallows the frame
  let r = 16 * E.outElastic(prog(b, 0, 0.9));
  for (let k = 0; k < 3; k++) r *= 1 + 0.55 * decay(b, k + 1, 7);
  const grow = E.inExpo(prog(b, 3.15, 4));
  r = lerp(r, 1250, grow);
  ctx.fillStyle = C.coral;
  ctx.beginPath(); ctx.arc(CX, CY, r, 0, TAU); ctx.fill();

  // copy
  ctx.save();
  ctx.globalAlpha = 1 - prog(b, 3.3, 3.6);
  typeOn(ctx, '> boot showreel_2026.mov', 160, 880, 24, C.paper, b, 0.4, 38);
  typeOn(ctx, '> loading 15 seconds of craft', 160, 920, 24, C.paper, b, 1.4, 38);
  const pct = Math.round(E.inOutCubic(prog(b, 1.4, 3.3)) * 100);
  if (b > 1.4) {
    ctx.font = F.mono(24); ctx.fillStyle = C.lime;
    ctx.fillText(`[${'■'.repeat(Math.round(pct / 5)).padEnd(20, '·')}] ${String(pct).padStart(3, '0')}%`, 160, 960);
  }
  const ready = E.outExpo(prog(b, 2, 2.6));
  ctx.globalAlpha *= ready;
  ctx.font = F.serif(64); ctx.fillStyle = C.paper; ctx.textAlign = 'center';
  ctx.fillText('ready?', CX, CY - 110 - (1 - ready) * 30);
  ctx.restore();
}

// ---------------------------------------------------------------- scene 2: kinetic type (beats 4-8)
function S2(ctx, b) {
  const lb = b;
  ctx.fillStyle = C.coral; ctx.fillRect(0, 0, W, H);
  const size = 190;
  const out = E.inExpo(prog(lb, 6.35, 6.85));

  // stripes in the background sweeping on the offbeats
  ctx.save();
  ctx.fillStyle = 'rgba(12,11,16,0.08)';
  for (let k = 0; k < 6; k++) {
    const x = ((lb - 4) * 520 + k * 360) % (W + 400) - 200;
    ctx.fillRect(x, 0, 60, H);
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-W * out, 0);
  maskedText(ctx, 'I MAKE', CX, 330, size, F.display(size), C.ink, lb, 4.0);
  ctx.restore();

  ctx.save();
  ctx.translate(W * out, 0);
  // PIXELS: outline first, then a fill wipes across
  ctx.font = F.display(size);
  const pw = ctx.measureText('PIXELS').width;
  const px = CX - pw / 2;
  ctx.lineWidth = 4; ctx.strokeStyle = C.paper;
  const pin = E.outExpo(prog(lb, 5, 5.45));
  ctx.save();
  ctx.beginPath(); ctx.rect(px - 20, 560 - size * 1.0, (pw + 40) * pin, size * 1.25); ctx.clip();
  ctx.strokeText('PIXELS', px, 560);
  ctx.restore();
  const fill = E.inOutExpo(prog(lb, 5.35, 5.9));
  ctx.save();
  ctx.beginPath(); ctx.rect(px - 20, 560 - size, (pw + 40) * fill, size * 1.25); ctx.clip();
  ctx.fillStyle = C.paper; ctx.fillText('PIXELS', px, 560);
  ctx.restore();
  // pixel-grid squares riding the wipe edge
  if (fill > 0 && fill < 1) {
    ctx.fillStyle = C.ink;
    for (let k = 0; k < 9; k++) {
      const s = 18 + (k % 3) * 8;
      ctx.fillRect(px - 20 + (pw + 40) * fill + (k % 3) * 24, 560 - size * 0.9 + k * 22, s, s);
    }
  }
  ctx.restore();

  // MOVE. — lands, then takes over the frame with echoes
  const grow = E.inOutExpo(prog(lb, 6.4, 7.2));
  const scale = lerp(1, 2.35, grow);
  const cy = lerp(790, CY + 120, grow);
  ctx.save();
  ctx.translate(CX, cy);
  ctx.scale(scale, scale);
  const echo = E.outExpo(prog(lb, 6.9, 7.5));
  if (echo > 0) {
    ctx.font = F.display(size); ctx.textAlign = 'center';
    ctx.lineWidth = 2.5 / scale * 1.6; ctx.strokeStyle = C.ink;
    for (let k = 6; k >= 1; k--) {
      ctx.globalAlpha = (1 - k / 7) * echo;
      ctx.strokeText('MOVE.', 0, -k * 62 * echo);
      ctx.strokeText('MOVE.', 0, k * 62 * echo);
    }
    ctx.globalAlpha = 1;
  }
  const wob = 1 + 0.08 * Math.sin(prog(lb, 6, 6.6) * Math.PI * 3) * decay(lb, 6, 5);
  ctx.scale(1 / wob, wob);
  maskedText(ctx, 'MOVE.', 0, 0, size, F.display(size), C.ink, lb, 6.0, { stagger: 0.03, dur: 0.45, ease: t => E.outBack(t, 2.4), clip: false });
  ctx.restore();

  // tiny spec labels
  ctx.save();
  ctx.font = F.mono(20); ctx.fillStyle = C.ink;
  ctx.globalAlpha = E.outExpo(prog(lb, 4.3, 4.8)) * (1 - out);
  ctx.fillText('UNBOUNDED BLACK / 190PX / TRACKING 0', 160, 400);
  ctx.globalAlpha = E.outExpo(prog(lb, 5.3, 5.8)) * (1 - out);
  ctx.fillText('STROKE → FILL / ease.inOutExpo', 160, 630);
  ctx.restore();
}

// ---------------------------------------------------------------- scene 3: shape & easing (beats 8-12)
const SHAPE_KEYS = [8, 9, 10, 11, 11.5];
const SHAPE_COLS = [C.coral, C.lime, C.paper, C.pink, C.coral];
const SHAPE_NAMES = ['CIRCLE', 'SQUARE', 'TRIANGLE', 'STAR', 'HEXAGON'];
function shapeState(b) {
  // index of current morph + eased progress (with overshoot)
  let idx = 0;
  for (let i = 1; i < SHAPE_KEYS.length; i++) if (b >= SHAPE_KEYS[i]) idx = i;
  const p = idx === 0 ? 1 : prog(b, SHAPE_KEYS[idx], SHAPE_KEYS[idx] + 0.45);
  const e = idx === 0 ? 1 : E.outBack(p, 2.2);
  let rot = 0;
  for (let i = 1; i < SHAPE_KEYS.length; i++) rot += (Math.PI / 2) * E.outExpo(prog(b, SHAPE_KEYS[i], SHAPE_KEYS[i] + 0.6));
  rot += (b - 8) * 0.15;
  let sq = 1;
  for (let i = 0; i < SHAPE_KEYS.length; i++) {
    const q = b - SHAPE_KEYS[i];
    if (q >= 0) sq += 0.2 * Math.sin(q * 16) * Math.exp(-q * 5);
  }
  const intro = E.outBack(prog(b, 7.7, 8.3), 2);
  const outro = 1 - E.inBack(prog(b, 11.72, 12), 2.5);
  return { idx, e, rot, sq, scale: intro * outro, p };
}
function drawShape(ctx, st, R, t) {
  const N = ASSETS.N, A = ASSETS.shapes[Math.max(0, st.idx - 1)], Bs = ASSETS.shapes[st.idx];
  ctx.beginPath();
  for (let k = 0; k <= N; k++) {
    const i = k % N, th = (i / N) * TAU;
    let r = st.idx === 0 ? Bs[i] : lerp(A[i], Bs[i], st.e);
    r *= 1 + 0.02 * Math.sin(th * 6 + t * 3);
    const x = Math.cos(th + st.rot) * r * R * st.sq, y = Math.sin(th + st.rot) * r * R / st.sq;
    k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function S3(ctx, b) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // dot grid
  ctx.fillStyle = 'rgba(243,239,230,0.12)';
  for (let y = 60; y < H; y += 60) for (let x = 60; x < W; x += 60) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);

  const st = shapeState(b);
  const col = st.idx === 0 ? SHAPE_COLS[0] : mix(SHAPE_COLS[st.idx - 1], SHAPE_COLS[st.idx], prog(b, SHAPE_KEYS[st.idx], SHAPE_KEYS[st.idx] + 0.3));
  const R = 230 * st.scale;

  // orbiters (back half)
  const orb = k => {
    const a = b * 1.4 + (k * TAU) / 3;
    return { x: CX + Math.cos(a) * 420, y: CY + Math.sin(a) * 120 - 20 * k, z: Math.sin(a), s: 14 + 6 * k };
  };
  const drawOrb = (o, k) => {
    ctx.fillStyle = [C.lime, C.pink, C.paper][k];
    ctx.beginPath(); ctx.arc(o.x, o.y, o.s * (0.7 + 0.3 * o.z) * st.scale, 0, TAU); ctx.fill();
  };
  for (let k = 0; k < 3; k++) { const o = orb(k); if (o.z < 0) drawOrb(o, k); }

  ctx.save();
  ctx.translate(CX, CY);
  // time echoes
  for (let k = 5; k >= 1; k--) {
    const sb = b - k * 0.055, es = shapeState(sb);
    ctx.save();
    drawShape(ctx, es, 230 * es.scale, sb);
    ctx.globalAlpha = 0.45 * (1 - k / 6);
    ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke();
    ctx.restore();
  }
  drawShape(ctx, st, R, b);
  ctx.fillStyle = col; ctx.fill();
  ctx.restore();

  for (let k = 0; k < 3; k++) { const o = orb(k); if (o.z >= 0) drawOrb(o, k); }

  // shape list on the left with a sliding highlight
  const vis = E.outExpo(prog(b, 8, 8.6)) * (1 - prog(b, 11.7, 12));
  ctx.save();
  ctx.globalAlpha = vis;
  const hy = 420 + st.idx * 56 - (1 - E.outExpo(st.p)) * 56 * (st.idx ? 1 : 0);
  ctx.fillStyle = C.lime;
  ctx.fillRect(150, hy - 34, 250, 46);
  ctx.font = F.mono(24, 800);
  SHAPE_NAMES.forEach((n, i) => {
    ctx.fillStyle = i === st.idx ? C.ink : 'rgba(243,239,230,0.5)';
    ctx.fillText(`0${i + 1}  ${n}`, 166, 420 + i * 56);
  });
  ctx.restore();

  // easing graph on the right
  ctx.save();
  ctx.globalAlpha = vis;
  const gx = 1480, gy = 660, gs = 280;
  ctx.strokeStyle = 'rgba(243,239,230,0.35)'; ctx.lineWidth = 1.5;
  ctx.strokeRect(gx, gy - gs, gs, gs);
  ctx.setLineDash([4, 6]);
  ctx.beginPath(); ctx.moveTo(gx, gy - gs); ctx.lineTo(gx + gs, gy - gs); ctx.stroke();
  ctx.setLineDash([]);
  const draw = E.outExpo(prog(b, 8.2, 9));
  ctx.strokeStyle = C.paper; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 60 * draw; i++) {
    const x = i / 60, y = E.outBack(x, 2.2);
    const px = gx + x * gs, py = gy - y * gs * 0.85;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  const pp = st.p, py = gy - E.outBack(pp, 2.2) * gs * 0.85;
  ctx.fillStyle = C.coral;
  ctx.beginPath(); ctx.arc(gx + pp * gs, py, 9, 0, TAU); ctx.fill();
  ctx.fillRect(gx + gs + 16, py - 2, 30, 4);
  ctx.font = F.mono(20); ctx.fillStyle = C.paper;
  ctx.fillText('ease.outBack(2.2)', gx, gy + 40);
  ctx.fillStyle = C.lime;
  ctx.fillText(`t=${pp.toFixed(2)}  v=${E.outBack(pp, 2.2).toFixed(3)}`, gx, gy + 72);
  ctx.restore();
}

// ---------------------------------------------------------------- scene 4: particles (beats 12-16)
function particlePos(p, lb, out) {
  const bp = E.outExpo(prog(lb, 0, 1.5));
  const a = p.a + bp * 1.1 + lb * 0.25 * p.sp;
  const sw = 70 * bp;
  let x = CX + Math.cos(a) * p.rad * bp + sw * Math.sin(lb * 2.1 * p.sp + p.p1);
  let y = CY + Math.sin(a) * p.rad * bp * 0.62 + sw * Math.cos(lb * 1.7 * p.sp + p.p2);
  const t0 = 1.05 + p.xn * 0.55;
  const ap = E.inOutCubic(prog(lb, t0, t0 + 0.85));
  x = lerp(x, p.tx, ap); y = lerp(y, p.ty, ap);
  if (ap >= 1 && lb < 3) { x += Math.sin(lb * 9 + p.p1) * 1.3; y += Math.cos(lb * 8 + p.p2) * 1.3; }
  const ep = E.outExpo(prog(lb, 3, 4.2));
  if (ep > 0) {
    const dx = p.tx - CX, dy = p.ty - CY, d = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx) * 0.7 + p.a2 * 0.3;
    x += Math.cos(ang) * p.rad2 * ep * (0.4 + d / 900);
    y += Math.sin(ang) * p.rad2 * ep * (0.4 + d / 900) + 140 * ep * ep;
  }
  out[0] = x; out[1] = y;
  return ap;
}
function S4(ctx, b) {
  const lb = b - 12;
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // shockwave
  for (const [at, col] of [[0, C.paper], [3, C.lime]]) {
    const p = prog(lb, at, at + 1);
    if (lb >= at && p < 1) {
      ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 1 - p; ctx.lineWidth = 10 * (1 - p) + 1;
      ctx.beginPath(); ctx.arc(CX, CY, E.outExpo(p) * 1100, 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  const cols = [C.lime, C.coral, C.paper];
  const tmp = [0, 0];
  for (let c = 0; c < 3; c++) {
    ctx.fillStyle = cols[c];
    for (const p of ASSETS.particles) {
      if (p.col !== c) continue;
      const ap = particlePos(p, lb, tmp);
      const s = p.s * (1 + (1 - ap) * 0.4);
      ctx.fillRect(tmp[0] - s / 2, tmp[1] - s / 2, s, s);
    }
  }
  const cap = E.outExpo(prog(lb, 2.1, 2.6)) * (1 - prog(lb, 2.9, 3.05));
  ctx.save();
  ctx.globalAlpha = cap;
  ctx.font = F.mono(24); ctx.fillStyle = C.paper; ctx.textAlign = 'center';
  ctx.fillText(`${ASSETS.particles.length.toLocaleString('en-US')} PARTICLES  ·  0 KEYFRAMES  ·  1 IDEA`, CX, 800 + (1 - cap) * 20);
  ctx.restore();
}

// ---------------------------------------------------------------- scene 5: 3D (beats 16-20)
function S5(ctx, b) {
  const lb = b - 16;
  ctx.fillStyle = C.cobalt; ctx.fillRect(0, 0, W, H);

  // outlined marquee
  ctx.save();
  ctx.font = F.display(250); ctx.strokeStyle = 'rgba(243,239,230,0.16)'; ctx.lineWidth = 2;
  const txt = 'DEPTH · SPACE · CAMERA · ';
  const tw = ctx.measureText(txt).width;
  const o1 = -((lb * 260) % tw), o2 = -tw + ((lb * 260) % tw);
  for (let k = -1; k < 3; k++) { ctx.strokeText(txt, o1 + k * tw, 330); ctx.strokeText(txt, o2 + k * tw, 1010); }
  ctx.restore();

  const forms = ASSETS.forms, M = ASSETS.M;
  let kick = 0;
  for (const k of [1, 2, 3]) kick += 0.9 * E.outExpo(prog(lb, k, k + 0.8));
  const ry = lb * 0.85 + kick + (1 - E.outExpo(prog(lb, 0, 1.2))) * -3;
  const rx = 0.42 + 0.22 * Math.sin(lb * 0.9);
  const rz = 0.12 * Math.sin(lb * 0.6);
  const intro = E.outExpo(prog(lb, 0, 0.9));
  const D = lerp(1350, 950, E.inOutCubic(prog(lb, 0, 3.5)));
  const cyr = Math.cos(ry), syr = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx), czr = Math.cos(rz), szr = Math.sin(rz);
  const proj = ASSETS.proj, idx = ASSETS.depthIdx;
  for (let i = 0; i < M; i++) {
    let fi = 0, fp = 0;
    for (const k of [1, 2, 3]) {
      const st = k + (i / M) * 0.3;
      const q = E.inOutExpo(prog(lb, st, st + 0.6));
      if (q > 0) { fi = k - 1; fp = q; }
    }
    const A = forms[fi][i], Bf = forms[Math.min(3, fi + (fp > 0 ? 1 : 0))][i];
    let x = lerp(A[0], Bf[0], fp) * intro, y = lerp(A[1], Bf[1], fp) * intro, z = lerp(A[2], Bf[2], fp) * intro;
    // spiral in from depth at the start
    z += (1 - intro) * 1400 * hash(i);
    let x1 = x * cyr + z * syr, z1 = -x * syr + z * cyr;
    let y1 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr;
    let x2 = x1 * czr - y1 * szr, y2 = x1 * szr + y1 * czr;
    const pz = 1000 / (D + z2);
    proj[i * 4] = CX + x2 * pz; proj[i * 4 + 1] = CY + y2 * pz; proj[i * 4 + 2] = z2; proj[i * 4 + 3] = pz;
    idx[i] = i;
  }
  const sorted = Array.from(idx).sort((a, c) => proj[c * 4 + 2] - proj[a * 4 + 2]);

  // orbit rings
  ctx.save();
  ctx.lineWidth = 1.5;
  for (let r = 0; r < 3; r++) {
    const tilt = r * 1.05 + 0.3, rad = 470 + r * 40;
    ctx.strokeStyle = r === 1 ? C.lime : C.paper;
    ctx.globalAlpha = 0.45 * intro;
    ctx.beginPath();
    for (let k = 0; k <= 120; k++) {
      const a = (k / 120) * TAU;
      let x = Math.cos(a) * rad, y = Math.sin(a) * rad * Math.cos(tilt), z = Math.sin(a) * rad * Math.sin(tilt);
      let x1 = x * cyr + z * syr, z1 = -x * syr + z * cyr;
      let y1 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr;
      const pz = 1000 / (D + z2);
      k ? ctx.lineTo(CX + x1 * pz, CY + y1 * pz) : ctx.moveTo(CX + x1 * pz, CY + y1 * pz);
    }
    ctx.stroke();
  }
  ctx.restore();

  for (const i of sorted) {
    const x = proj[i * 4], y = proj[i * 4 + 1], z = proj[i * 4 + 2], pz = proj[i * 4 + 3];
    const s = 4.6 * pz;
    const depth = clamp((z + 400) / 800);
    ctx.globalAlpha = lerp(1, 0.3, depth);
    ctx.fillStyle = i % 9 === 0 ? C.lime : i % 23 === 0 ? C.coral : C.paper;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;

  // readout
  const names = ['SPHERE', 'TORUS', 'CUBE', 'HELIX'];
  let cur = 0; for (const k of [1, 2, 3]) if (lb >= k + 0.3) cur = k;
  ctx.save();
  ctx.font = F.mono(20); ctx.fillStyle = C.paper;
  ctx.fillText(`FORM  ${names[cur]}`, 160, 820);
  ctx.fillText(`POINTS  ${M}`, 160, 852);
  ctx.fillText(`CAM.Z  ${D.toFixed(0)}  ROT.Y  ${((ry * 180 / Math.PI) % 360).toFixed(1)}°`, 160, 884);
  ctx.restore();
}

// ---------------------------------------------------------------- scene 6: truchet rhythm (beats 20-24)
const WAVES = [[20, CX, CY], [21, 0, 0], [22, W, H], [23, W, 0], [23.5, 0, H]];
function drawTruchet(ctx, b, fg, accent) {
  const cell = 120, lb = b - 20;
  ctx.lineCap = 'round';
  for (let j = -4; j < 13; j++) for (let i = -5; i < 21; i++) {
    const tx = i * cell + cell / 2, ty = j * cell + cell / 2;
    const dist = Math.hypot(tx - CX, ty - CY) / cell;
    const sc = E.outBack(prog(lb, dist * 0.03, dist * 0.03 + 0.45), 2);
    if (sc <= 0) continue;
    let th = ASSETS.tile(i, j) * Math.PI / 2;
    for (const [wb, sx, sy] of WAVES) {
      const d = Math.hypot(tx - sx, ty - sy) / cell * 0.028;
      th += (Math.PI / 2) * E.outBack(prog(b, wb + d, wb + d + 0.42), 1.6);
    }
    ctx.save();
    ctx.translate(tx, ty); ctx.rotate(th); ctx.scale(sc, sc);
    ctx.strokeStyle = hash(i * 7.1 + j * 3.3) < 0.1 ? accent : fg;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(-cell / 2, -cell / 2, cell / 2, 0, Math.PI / 2);
    ctx.moveTo(cell / 2, cell / 2 - cell / 2);
    ctx.arc(cell / 2, cell / 2, cell / 2, -Math.PI / 2, -Math.PI, true);
    ctx.stroke();
    ctx.restore();
  }
}
function S6(ctx, b) {
  const lb = b - 20;
  const z = E.inOutCubic(prog(lb, 2, 4));
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(CX, CY); ctx.rotate(z * Math.PI / 4); ctx.scale(1 + z * 1.2, 1 + z * 1.2); ctx.translate(-CX, -CY);
  drawTruchet(ctx, b, C.ink, C.coral);
  ctx.restore();
  const R = E.inOutExpo(prog(lb, 2, 2.6)) * 1200;
  if (R > 0) {
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, TAU); ctx.clip();
    ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
    ctx.translate(CX, CY); ctx.rotate(z * Math.PI / 4); ctx.scale(1 + z * 1.2, 1 + z * 1.2); ctx.translate(-CX, -CY);
    drawTruchet(ctx, b, C.lime, C.coral);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- scene 7: principles montage (beats 24-26)
function fitSize(ctx, text, max, base) { const w = measure(ctx, F.display(base), text); return Math.min(base, (base * max) / w); }
function S7(ctx, b) {
  const w = b < 24.5 ? 0 : b < 25 ? 1 : b < 25.5 ? 2 : 3;
  const lb = b;
  if (w === 0) {
    ctx.fillStyle = C.lime; ctx.fillRect(0, 0, W, H);
    const s = fitSize(ctx, 'TIMING', 1500, 260);
    ctx.font = F.display(s); ctx.fillStyle = C.ink;
    const tw = ctx.measureText('TIMING').width;
    for (let i = 0; i < 6; i++) {
      const pre = ctx.measureText('TIMING'.slice(0, i)).width;
      const p = E.outBounce(prog(lb, 24 + i * 0.035, 24 + i * 0.035 + 0.3));
      ctx.fillText('TIMING'[i], CX - tw / 2 + pre, lerp(-100, CY + s * 0.36, p));
    }
    ctx.font = F.mono(22); ctx.fillText('01 — EVERY FRAME COUNTS', 160, 900);
  } else if (w === 1) {
    ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
    const s = 170;
    const track = lerp(-0.08, 0.3, E.outExpo(prog(lb, 24.5, 24.95))) * s;
    ctx.font = F.display(s);
    const word = 'SPACING';
    const widths = [...word].map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((a, c) => a + c, 0) + track * (word.length - 1);
    let x = CX - total / 2;
    const base = CY + s * 0.36;
    for (let i = 0; i < word.length; i++) {
      ctx.fillStyle = C.paper; ctx.fillText(word[i], x, base);
      if (i < word.length - 1 && track > 4) {
        const gx0 = x + widths[i] + 4, gx1 = x + widths[i] + track - 4;
        ctx.strokeStyle = C.coral; ctx.fillStyle = C.coral; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(gx0, base + 40); ctx.lineTo(gx1, base + 40);
        ctx.moveTo(gx0, base + 30); ctx.lineTo(gx0, base + 50); ctx.moveTo(gx1, base + 30); ctx.lineTo(gx1, base + 50);
        ctx.stroke();
        ctx.font = F.mono(14); ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(track)}`, (gx0 + gx1) / 2, base + 72);
        ctx.textAlign = 'left'; ctx.font = F.display(s);
      }
      x += widths[i] + track;
    }
    ctx.font = F.mono(22); ctx.fillStyle = C.paper; ctx.fillText('02 — THE GAPS ARE THE DESIGN', 160, 900);
  } else if (w === 2) {
    ctx.fillStyle = C.coral; ctx.fillRect(0, 0, W, H);
    const s = fitSize(ctx, 'WEIGHT', 1500, 280);
    const land = 25.15;
    const fall = E.inCubic(prog(lb, 25, land));
    const q = Math.max(0, lb - land);
    const squash = lb < land ? 1 : 1 - 0.32 * Math.cos(q * 22) * Math.exp(-q * 9);
    const stretch = lb < land ? 1 + 0.25 * fall : 1;
    ctx.save();
    ctx.translate(CX, lerp(-150, CY + s * 0.36, fall));
    ctx.scale(1 / Math.sqrt(squash / stretch), squash * stretch);
    ctx.font = F.display(s); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText('WEIGHT', 0, 0);
    ctx.restore();
    ctx.fillStyle = C.ink; ctx.fillRect(0, CY + s * 0.36 + 18, W, 6);
    ctx.font = F.mono(22); ctx.fillText('03 — SQUASH, STRETCH, SETTLE', 160, 900);
  } else {
    ctx.fillStyle = C.cobalt; ctx.fillRect(0, 0, W, H);
    const s = 150;
    ctx.font = F.display(s);
    const unit = 'RHYTHM  ', uw = ctx.measureText(unit).width;
    const pulse = 1 + 0.06 * (decay(lb, 25.5, 9) + decay(lb, 25.75, 9) + decay(lb, 26, 9) + decay(lb, 26.25, 9) + decay(lb, 26.5, 9));
    for (let r = 0; r < 7; r++) {
      const dir = r % 2 ? 1 : -1;
      const off = ((lb - 25.5) * 900 * dir) % uw;
      const y = 120 + r * 150;
      ctx.save();
      ctx.translate(CX, y); ctx.scale(pulse, pulse); ctx.translate(-CX, -y);
      for (let k = -2; k < 7; k++) {
        const x = off + k * uw - uw;
        if (r === 3) { ctx.fillStyle = C.lime; ctx.fillText(unit, x, y + s * 0.36); }
        else { ctx.strokeStyle = C.paper; ctx.lineWidth = 2; ctx.strokeText(unit, x, y + s * 0.36); }
      }
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------- scene 7b: the reel in the reel (beats 26-28)
const TILE_TIMES = [
  u => 1.1 + u * 0.9, u => 4.2 + u * 1.2, u => 8.6 + u * 1.3,
  u => 13.0 + u * 0.95, null, u => 16.9 + u * 1.2,
  u => 20.4 + u * 1.4, u => 24 + (u % 0.5), u => 10.2 + u * 0.8,
];
function sceneAt(ctx, b) {
  if (b < 4) S1(ctx, b);
  else if (b < 8) S2(ctx, b);
  else if (b < 12) S3(ctx, b);
  else if (b < 16) S4(ctx, b);
  else if (b < 20) S5(ctx, b);
  else if (b < 24) S6(ctx, b);
  else S7(ctx, b);
}
function S7b(ctx, b) {
  const u = b - 26;
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const z = E.inOutExpo(prog(u, 0, 0.9));
  const s = lerp(1, 0.29, z);
  const gap = 1.1;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const i = r * 3 + c;
    const dist = Math.hypot(r - 1, c - 1);
    const fly = E.inBack(prog(u, 1.45 + dist * 0.12, 1.95 + dist * 0.06), 2.2);
    let px = (c - 1) * W * gap, py = (r - 1) * H * gap;
    px *= 1 - fly; py *= 1 - fly;
    const ts = s * (1 - fly) * (1 + 0.04 * Math.sin(u * 3 + i));
    if (ts <= 0.002) continue;
    const rot = fly * (i % 2 ? 1 : -1) * 0.6 + z * 0.03 * Math.sin(i * 2 + u * 2);
    ctx.save();
    ctx.translate(CX + px * s, CY + py * s);
    ctx.rotate(rot);
    ctx.scale(ts, ts);
    ctx.translate(-CX, -CY);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(0, 0, W, H, 40 * z / Math.max(ts, 0.1)); else ctx.rect(0, 0, W, H);
    ctx.clip();
    if (i === 4) S7(ctx, b); else sceneAt(ctx, TILE_TIMES[i](u));
    ctx.restore();
  }
}

// ---------------------------------------------------------------- scene 8: sign-off (beats 28-32)
function drawMark(ctx, x, y, lb, R) {
  const cols = [C.coral, C.lime, C.paper, C.pink, C.coral, C.lime, C.paper, C.pink];
  let rot = lb * 0.25;
  for (const k of [1, 2, 3]) rot += (Math.PI / 4) * E.outExpo(prog(lb, k, k + 0.5));
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  for (let k = 0; k < 8; k++) {
    const g = E.outElastic(prog(lb, k * 0.04, k * 0.04 + 1.1));
    if (g <= 0) continue;
    ctx.save();
    ctx.rotate((k * TAU) / 8);
    ctx.fillStyle = cols[k];
    const len = R * g, wd = R * 0.3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(R * 0.22, -wd / 2, len, wd, wd / 2); else ctx.rect(R * 0.22, -wd / 2, len, wd);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = C.paper;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.12 * E.outBack(prog(lb, 0, 0.4), 3), 0, TAU); ctx.fill();
  ctx.restore();
}
function S8(ctx, b) {
  const lb = b - 28;
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // pulse rings behind
  for (let k = 0; k < 4; k++) {
    const p = prog(lb, k, k + 2);
    if (lb < k || p >= 1) continue;
    ctx.save(); ctx.strokeStyle = C.paper; ctx.globalAlpha = 0.18 * (1 - p); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(CX, 360, 150 + E.outExpo(p) * 900, 0, TAU); ctx.stroke(); ctx.restore();
  }
  drawMark(ctx, CX, 360, lb, 130);
  maskedText(ctx, 'CLAUDE', CX, 650, 178, F.display(178), C.paper, lb, 0.45, { stagger: 0.05, dur: 0.7 });
  const sub = E.outExpo(prog(lb, 1.1, 1.8));
  ctx.save();
  ctx.globalAlpha = sub;
  ctx.font = F.serif(92); ctx.fillStyle = C.coral; ctx.textAlign = 'center';
  ctx.fillText('motion designer', CX, 770 + (1 - sub) * 30);
  ctx.restore();
  // rule that draws out from center
  const rule = E.inOutExpo(prog(lb, 1.4, 2.2));
  ctx.fillStyle = 'rgba(243,239,230,0.3)';
  ctx.fillRect(CX - 560 * rule, 830, 1120 * rule, 2);
  const line = 'SHOWREEL 2026   ·   AVAILABLE FOR HIRE   →';
  ctx.save();
  ctx.font = F.mono(26); const lw = ctx.measureText(line).width;
  ctx.restore();
  typeOn(ctx, line, CX - lw / 2, 890, 26, C.lime, lb, 1.9, 60);
}

// ---------------------------------------------------------------- HUD
const LABELS = [
  [0, '00 — IGNITION'], [4, '01 — KINETIC TYPE'], [8, '02 — SHAPE & EASING'], [12, '03 — PARTICLES & FIELDS'],
  [16, '04 — 3D & CAMERA'], [20, '05 — SYSTEMS & RHYTHM'], [24, '06 — PRINCIPLES'], [26, '07 — THE REEL'], [28, '08 — SIGN-OFF'],
];
function hudColor(b) {
  if (b < 4) return C.paper;
  if (b < 8) return C.ink;
  if (b < 20) return C.paper;
  if (b < 22.3) return C.ink;
  if (b < 24) return C.paper;
  if (b < 24.5) return C.ink;
  if (b < 25) return C.paper;
  if (b < 25.5) return C.ink;
  return C.paper;
}
function drawHUD(ctx, b, t) {
  const a = E.outExpo(prog(b, 0.5, 1.5)) * (1 - prog(b, 31.3, 31.6));
  if (a <= 0) return;
  const col = hudColor(b);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
  const m = 48, L = 34;
  ctx.beginPath();
  ctx.moveTo(m, m + L); ctx.lineTo(m, m); ctx.lineTo(m + L, m);
  ctx.moveTo(W - m - L, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + L);
  ctx.moveTo(m, H - m - L); ctx.lineTo(m, H - m); ctx.lineTo(m + L, H - m);
  ctx.moveTo(W - m - L, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - L);
  ctx.stroke();

  let lab = LABELS[0];
  for (const l of LABELS) if (b >= l[0]) lab = l;
  ctx.font = F.mono(18, 800);
  const n = Math.floor(clamp((b - lab[0]) * 14, 0, lab[1].length));
  ctx.fillRect(92, 83, 10, 10);
  ctx.fillText(lab[1].slice(0, lab[0] === 0 ? lab[1].length : n), 114, 94);

  const fr = Math.floor(t * FPS + 1e-6);
  const ss = Math.floor(fr / FPS), ff = fr % FPS;
  ctx.textAlign = 'right';
  ctx.font = F.mono(18, 500);
  ctx.fillText(`TC 00:00:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, W - 92, 94);
  const bar = Math.floor(b / 4) + 1, bt = Math.floor(b % 4) + 1;
  ctx.fillText(`${BPM} BPM  ·  BAR ${Math.min(bar, 8)}.${bt}`, W - 92, 122);
  if (Math.floor(b * 2) % 2 === 0) { ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(W - 330, 88, 6, 0, TAU); ctx.fill(); ctx.fillStyle = col; }

  ctx.textAlign = 'left';
  ctx.fillText('CLAUDE / MOTION REEL ©2026', 92, H - 84);
  // progress with bar ticks
  const px = W - 92 - 320, py = H - 92;
  ctx.globalAlpha = a * 0.3; ctx.fillRect(px, py, 320, 3);
  ctx.globalAlpha = a; ctx.fillRect(px, py, 320 * (t / DUR), 3);
  for (let k = 0; k <= 8; k++) ctx.fillRect(px + k * 40 - 1, py - 6, 2, 15);
  ctx.restore();
}

// ---------------------------------------------------------------- composition
function shake(b) {
  let x = 0, y = 0, r = 0;
  for (const [hb, s] of HITS) {
    const d = decay(b, hb, 7) * s;
    if (d < 0.001) continue;
    x += d * 22 * noise1(b * 45 + hb * 13);
    y += d * 22 * noise1(b * 45 + hb * 29 + 100);
    r += d * 0.012 * noise1(b * 30 + hb);
  }
  return [x, y, r];
}
function composeScene(ctx, t) {
  const b = t / BEAT;
  ctx.save();
  const [sx, sy, sr] = shake(b);
  const mag = Math.hypot(sx, sy);
  ctx.translate(CX + sx, CY + sy); ctx.rotate(sr); ctx.scale(1 + mag / 600, 1 + mag / 600); ctx.translate(-CX, -CY);

  if (b >= 7.5 && b < 8) {
    // split reveal: the type rips apart, shape scene underneath
    S3(ctx, b);
    const p = E.inExpo(prog(b, 7.5, 8));
    for (const [y0, dir] of [[0, -1], [CY, 1]]) {
      ctx.save();
      ctx.translate(0, dir * p * CY * 1.05);
      ctx.beginPath(); ctx.rect(0, y0, W, CY); ctx.clip();
      S2(ctx, b);
      ctx.restore();
    }
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, CY - 1 - p * 4, W, 2 + p * 8 * (1 - p));
  } else if (b < 26) sceneAt(ctx, b);
  else if (b < 28) S7b(ctx, b);
  else S8(ctx, b);

  ctx.restore();
  drawHUD(ctx, b, t);

  // iris close to the opening dot — the bookend
  if (b >= 31.4) {
    const p = E.inOutExpo(prog(b, 31.4, 31.85));
    const R = lerp(1200, 16, p);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(CX, CY, R, 0, TAU, true);
    ctx.fillStyle = '#000'; ctx.fill('evenodd');
    if (p >= 1) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const d = 1 - E.inBack(prog(b, 31.85, 31.98), 3);
      ctx.fillStyle = C.coral;
      ctx.beginPath(); ctx.arc(CX, CY, 16 * Math.max(0, d), 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- post
let buf, bufCtx, fx, fxCtx, chan;
function ensureBuffers() {
  if (buf) return;
  buf = document.createElement('canvas'); buf.width = W; buf.height = H; bufCtx = buf.getContext('2d');
  fx = document.createElement('canvas'); fx.width = W; fx.height = H; fxCtx = fx.getContext('2d');
  chan = [0, 1, 2].map(() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; });
}
function post(ctx, t, frame) {
  const b = t / BEAT;
  // glitch into the grid scene
  if ((b >= 19.55 && b < 20) || (b >= 11.85 && b < 12)) {
    fxCtx.drawImage(ctx.canvas, 0, 0);
    const seed = Math.floor(b * 16);
    const r = rng(seed * 7919);
    const amt = b >= 19.55 ? prog(b, 19.55, 20) : 0.5;
    for (let k = 0; k < 14; k++) {
      const y = Math.floor(r() * H), h = 10 + Math.floor(r() * 120 * amt);
      const dx = (r() - 0.5) * 260 * amt;
      ctx.drawImage(fx, 0, y, W, h, dx, y, W, h);
    }
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = r() < 0.5 ? C.lime : C.coral;
    if (r() < 0.35 * amt + 0.1) ctx.fillRect(0, Math.floor(r() * H), W, 30 + r() * 80);
    ctx.globalCompositeOperation = 'source-over';
  }
  // chromatic aberration on hits
  let ca = 0, flash = 0;
  for (const [hb, s, fl] of HITS) { ca += decay(b, hb, 6) * s; flash += decay(b, hb, 9) * fl; }
  if (b >= 19.55 && b < 20) ca += 0.6;
  const off = ca * 14;
  if (off > 0.6) {
    fxCtx.drawImage(ctx.canvas, 0, 0);
    const tints = ['#ff0000', '#00ff00', '#0000ff'];
    chan.forEach((c, i) => {
      const g = c.getContext('2d');
      g.globalCompositeOperation = 'source-over'; g.drawImage(fx, 0, 0);
      g.globalCompositeOperation = 'multiply'; g.fillStyle = tints[i]; g.fillRect(0, 0, W, H);
    });
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(chan[0], -off, 0); ctx.drawImage(chan[1], 0, 0); ctx.drawImage(chan[2], off, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (flash > 0.01) { ctx.fillStyle = `rgba(255,252,245,${Math.min(0.6, flash)})`; ctx.fillRect(0, 0, W, H); }
  // vignette
  const g = ctx.createRadialGradient(CX, CY, H * 0.45, CX, CY, H * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // grain
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.09;
  const gi = ASSETS.grain[frame % ASSETS.grain.length];
  const ox = -(frame * 137) % 960, oy = -(frame * 71) % 540;
  for (let x = ox; x < W; x += 960) for (let y = oy; y < H; y += 540) ctx.drawImage(gi, x, y);
  ctx.restore();
}

// Real motion blur: average several sub-frame renders across a 180° shutter.
function renderFrame(frame, samples = 5) {
  ensureBuffers();
  const ctx = document.getElementById('c').getContext('2d');
  const shutter = 0.5;
  for (let k = 0; k < samples; k++) {
    const t = Math.min(DUR - 1e-4, (frame + (samples === 1 ? 0 : ((k + 0.5) / samples - 0.5) * shutter)) / FPS);
    bufCtx.setTransform(1, 0, 0, 1, 0, 0);
    bufCtx.globalAlpha = 1; bufCtx.globalCompositeOperation = 'source-over';
    composeScene(bufCtx, Math.max(0, t));
    ctx.globalAlpha = 1 / (k + 1);
    ctx.drawImage(buf, 0, 0);
  }
  ctx.globalAlpha = 1;
  post(ctx, frame / FPS, frame);
}

// ---------------------------------------------------------------- boot
window.REEL = { W, H, FPS, FRAMES, DUR, renderFrame };
window.reelReady = (async () => {
  await Promise.all([F.display(100), F.grotesk(40), F.mono(20), F.mono(20, 800), F.serif(40)].map(f => document.fonts.load(f)));
  buildAssets();
  return true;
})();

if (!/render/.test(location.search)) {
  // Live preview: plays in real time with the soundtrack (click to start).
  window.reelReady.then(() => {
    const audio = new Audio('showreel.wav');
    const btn = document.createElement('button');
    btn.id = 'play'; btn.textContent = '▶  PLAY SHOWREEL';
    document.body.appendChild(btn);
    renderFrame(0, 1);
    let start = null;
    const loop = now => {
      if (start === null) start = now;
      const f = Math.floor(((now - start) / 1000) * FPS) % FRAMES;
      renderFrame(f, 1);
      requestAnimationFrame(loop);
    };
    btn.onclick = () => { btn.remove(); audio.loop = true; audio.play().catch(() => {}); requestAnimationFrame(loop); };
  });
} else {
  document.body.classList.add('render');
}
