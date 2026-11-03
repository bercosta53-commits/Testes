// Grêmio Náutico União — "Verão no União", filme de aquisição, 30 s, 1920×1080.
//
// Motor: cada quadro é calculado só a partir do tempo t (determinístico). A montagem é uma
// linha do tempo de PLANOS (cada um com sua câmera) ligados por TRANSIÇÕES compostas em
// buffers; a TIPOGRAFIA é uma camada própria por cima. Na renderização final cada quadro é
// a média de várias amostras dentro do obturador (180°), o que dá desfoque de movimento real
// nos movimentos rápidos. Acabamento: vinheta e grão leves.
(() => {
  const W = 1920, H = 1080, FPS = 30, DUR = 30;
  const SAFE_X = 154;                               // 8% — margem lateral do roteiro
  const C = { paper: '#F8F7F3', white: '#FFFFFF', ink: '#102A3B', muted: '#4B5961', blue: '#004F91', cyan: '#00BFF3' };

  // ---------------------------------------------------------------- grade musical
  // Trilha a 117,5 BPM (com um compasso repetido, ver audio.py). Batida n = BEAT0 + n·BEAT.
  const BEAT = 0.510839, BEAT0 = -0.0232;
  const b = n => BEAT0 + n * BEAT;

  // ---------------------------------------------------------------- assets
  const HD = 'assets/photos/hd/';
  const PHOTOS = {
    // sedes — acervo do site (fotos reais, identificadas na LP)
    apPiscina: 'assets/photos/ap-piscina.jpg',
    moinhos: 'assets/photos/moinhos-piscina.jpg',
    petropole: 'assets/photos/petropole-tenis.jpg',
    ilha: 'assets/photos/ilha-aerea.jpg',
    // vida no clube — fotos novas
    lagoa: HD + 'piscina-lagoa-convivencia-fim-de-tarde.jpg',
    deck: HD + 'amigos-deck-guaiba-fim-de-tarde.jpg',
    paiFilha: HD + 'pai-filha-picole-borda.jpg',
    pes: HD + 'criancas-pes-borda-piscina.jpg',
    mergulho: HD + 'familia-mergulho-piscina.jpg',
    amigas: HD + 'amigas-tenis-saibro.jpg',
    bolas: HD + 'bolas-tenis-saibro-detalhe.jpg',
    avoNeto: HD + 'avo-neto-tenis-saibro.jpg',
    escolinha: HD + 'escolinha-tenis-saibro.jpg',
    mulher: HD + 'mulher-sorrindo-borda-piscina.jpg',
    raquete: HD + 'raquete-drink-espreguicadeira.jpg',
    casal: HD + 'casal-espreguicadeiras-sombra.jpg',
    mesa: HD + 'amigos-mesa-pos-tenis.jpg',
    mesaDet: HD + 'amigos-mesa-restaurante.jpg',
    piquenique: HD + 'piquenique-familia-gramado.jpg',
    orla: HD + 'familia-orla-guaiba-ilha.jpg',
    remo: HD + 'remo-guaiba-entardecer.jpg',
    escudo: 'assets/logo-escudo.png',
  };
  const img = {};
  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(src)); i.src = src; });
  const fonts = [
    new FontFace('Inst', 'url(assets/fonts/InstrumentSans.ttf)', { weight: '400 700', stretch: '75% 100%' }),
    new FontFace('InstSerif', 'url(assets/fonts/InstrumentSerif-Italic.ttf)', { style: 'italic' }),
  ];

  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const out = document.getElementById('c'), octx = out.getContext('2d');
  const bufA = mk(), bufB = mk(), frame = mk(), maskBuf = mk();
  const fctx = frame.getContext('2d');
  for (const c of [out, bufA, bufB, frame, maskBuf]) c.getContext('2d').imageSmoothingQuality = 'high';
  let ctx = fctx;                                   // contexto de desenho corrente

  // ---------------------------------------------------------------- utilidades
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eOutCubic = p => 1 - Math.pow(1 - p, 3);
  const eOutExpo = p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eInExpo = p => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10));
  const eInOutExpo = p => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const eInCubic = p => p * p * p;
  const eInOutQuint = p => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2);
  const eInOutCubic = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const FULL = { x: 0, y: 0, w: W, h: H };
  const GRADE = 'saturate(1.07) contrast(1.04) brightness(1.02)';

  // Foto em "cover" num retângulo. cx/cy: foco normalizado; zoom ≥ 1; dx/dy: pan em px; rot em graus.
  function photo(im, r, o = {}) {
    const { cx = 0.5, cy = 0.5, zoom = 1, dx = 0, dy = 0, rot = 0, filter = GRADE, alpha = 1, radius = 0 } = o;
    const s = Math.max(r.w / im.width, r.h / im.height) * zoom;
    const w = im.width * s, h = im.height * s;
    let x = r.w / 2 - cx * w + dx, y = r.h / 2 - cy * h + dy;
    // mantém a foto cobrindo o quadro; com rotação, reserva a margem que o giro consome
    const rad = Math.abs(rot) * Math.PI / 180, m = Math.sin(rad) * Math.max(r.w, r.h) * 0.6;
    x = r.w - w + m <= -m ? clamp(x, r.w - w + m, -m) : (r.w - w) / 2;
    y = r.h - h + m <= -m ? clamp(y, r.h - h + m, -m) : (r.h - h) / 2;
    ctx.save();
    ctx.beginPath(); radius ? ctx.roundRect(r.x, r.y, r.w, r.h, radius) : ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    ctx.globalAlpha = alpha; ctx.filter = filter;
    if (rot) { const mx = r.x + r.w / 2, my = r.y + r.h / 2; ctx.translate(mx, my); ctx.rotate(rot * Math.PI / 180); ctx.translate(-mx, -my); }
    ctx.drawImage(im, r.x + x, r.y + y, w, h);
    ctx.restore();
  }
  const full = (k, o) => photo(img[k], FULL, o);
  function fill(color, a = 1, r = FULL) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.restore(); }
  function grad(x0, y0, x1, y1, a0, a1 = 0, rgb = '12,30,44') {
    if (a0 <= 0 && a1 <= 0) return;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(${rgb},${a0})`); g.addColorStop(1, `rgba(${rgb},${a1})`);
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // Câmera de "chegada": começa mais perto/girada e assenta com desaceleração exponencial.
  const arrive = (t, t0, d, from, to) => lerp(from, to, eOutExpo(prog(t, t0, t0 + d)));

  const font = (size, weight = 600, fam = 'sans') => (fam === 'serif' ? `italic 400 ${size}px InstSerif` : `${weight} ${size}px Inst`);
  function measure(str, size, weight = 600, fam = 'sans', track = -0.03) {
    ctx.save(); ctx.font = font(size, weight, fam); ctx.letterSpacing = `${fam === 'serif' ? 0 : track * size}px`;
    const w = ctx.measureText(str).width; ctx.restore(); return w;
  }

  // ---------------------------------------------------------------- tipografia cinética
  // Linha de palavras: cada palavra sobe de dentro de uma máscara (linha de base) com
  // desaceleração exponencial, em cascata curta; na saída, sobe e sai pela máscara.
  // words: [{w, fam, weight, color, size}] ou strings.
  function kline(t, words, x, y, o) {
    const { size = 120, weight = 600, fam = 'sans', color = C.white, t0, stagger = 0.055, dur = 0.7,
      tOut = Infinity, outDur = 0.36, align = 'left', shadow = 0.28, track = -0.03 } = o;
    kline.last = null;
    if (t < t0) return 0;
    if (Number.isFinite(tOut) && t > tOut + outDur + stagger * ws_len(words)) return 0;
    const ws = words.map(w => (typeof w === 'string' ? { w } : w)).map(w => ({
      ...w, fam: w.fam ?? fam, weight: w.weight ?? weight, color: w.color ?? color, size: w.size ?? size }));
    const space = measure(' ', size, weight, fam, track);
    const widths = ws.map(w => measure(w.w, w.size, w.weight, w.fam, track));
    const total = widths.reduce((s, v) => s + v, 0) + space * (ws.length - 1);
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    let vis = 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - size, y - size * 1.12, total + size * 2, size * 1.46); ctx.clip();
    ws.forEach((w, i) => {
      const ti = w.at ?? t0 + i * stagger;
      const pi = eOutExpo(prog(t, ti, ti + dur));
      const po = Number.isFinite(tOut) ? eInOutCubic(prog(t, tOut + i * stagger * 0.5, tOut + i * stagger * 0.5 + outDur)) : 0;
      const dy = (1 - pi) * size * 1.2 - po * size * 1.6;
      vis = Math.max(vis, pi * (1 - po));
      if (po >= 0.999 || pi <= 0) { cx += widths[i] + space; return; }
      ctx.save();
      ctx.font = font(w.size, w.weight, w.fam);
      ctx.letterSpacing = `${w.fam === 'serif' ? 0 : track * w.size}px`;
      ctx.fillStyle = w.color;
      if (shadow) { ctx.shadowColor = `rgba(6,18,28,${shadow})`; ctx.shadowBlur = w.size * 0.3; ctx.shadowOffsetY = w.size * 0.03; }
      ctx.fillText(w.w, cx, y + dy);
      ctx.restore();
      w.x = cx; w.width = widths[i];
      cx += widths[i] + space;
    });
    ctx.restore();
    kline.last = ws;                                // posições, para sublinhados
    return vis;
  }
  const ws_len = w => w.length * 0.5 + 0.05;
  // Visibilidade de um bloco de texto (para escurecimentos que acompanham o texto).
  const vis = (t, t0, tOut = Infinity) => eOutCubic(prog(t, t0 - 0.1, t0 + 0.35)) * (Number.isFinite(tOut) ? 1 - prog(t, tOut, tOut + 0.45) : 1);

  function escudo(x, y, h, alpha = 1, shadow = true) {
    const im = img.escudo, w = h * im.width / im.height;
    ctx.save(); ctx.globalAlpha = alpha;
    if (shadow) { ctx.shadowColor = 'rgba(8,22,32,.35)'; ctx.shadowBlur = h * 0.18; ctx.shadowOffsetY = h * 0.03; }
    ctx.drawImage(im, x, y, w, h); ctx.restore();
    return w;
  }

  // ---------------------------------------------------------------- planos
  // Câmera do deck (usada dentro da palavra "verão" e depois em tela cheia — continuidade).
  const deckCam = t => ({ cx: 0.5, cy: 0.5, zoom: lerp(1.06, 1.16, prog(t, b(7), b(13.5))), dx: lerp(40, -50, eInOutCubic(prog(t, b(7), b(13.5)))) });

  // Palavra "verão" gigante preenchida com foto; atravessada por zoom no fim.
  let verao = null;                                 // {bmp, scale, x, y, ax, ay}
  function prepVerao() {
    const size = 600, c = mk(W * 2, H * 2), g = c.getContext('2d');
    ctx = g; const wTxt = measure('verão', size, 700, 'sans', -0.045); ctx = fctx;
    const fs = Math.min(size, size * (W - 2 * 120) / wTxt);
    g.scale(2, 2);
    g.font = font(fs, 700); g.letterSpacing = `${-0.045 * fs}px`; g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
    const tw = g.measureText('verão').width, x = (W - tw) / 2, y = H / 2 + fs * 0.27;
    g.fillText('verão', x, y);
    // âncora do zoom: ponto mais "fundo" dentro do traço (maior min(run horizontal, run vertical))
    const D = g.getImageData(0, 0, W * 2, H * 2).data, on = (X, Y) => D[(Y * W * 2 + X) * 4 + 3] > 200;
    let best = { sc: 0, x: W, y: H };
    for (let Y = Math.round((y - fs * 0.6) * 2); Y < y * 2; Y += 6) {
      for (let X = Math.round(x * 2); X < (x + tw) * 2; X += 6) {
        if (!on(X, Y)) continue;
        let l = X, r = X, u = Y, d = Y;
        while (l > 0 && on(l - 1, Y)) l--; while (r < W * 2 - 1 && on(r + 1, Y)) r++;
        while (u > 0 && on(X, u - 1)) u--; while (d < H * 2 - 1 && on(X, d + 1)) d++;
        const sc = Math.min(X - l, r - X, Y - u, d - Y);
        if (sc > best.sc) best = { sc, x: X, y: Y };
      }
    }
    const letters = [...'verão'].map((ch, i) => ({ ch, x: x + g.measureText('verão'.slice(0, i)).width }));
    verao = { bmp: c, fs, x, y, letters, ax: best.x / 2, ay: best.y / 2 };
  }
  function sVerao(t) {
    fill(C.paper);
    const tz0 = b(8), tz1 = b(8) + 0.46;                 // zoom através da letra
    const m = maskBuf.getContext('2d');
    m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H);
    if (t < tz0) {
      m.font = font(verao.fs, 700); m.letterSpacing = `${-0.045 * verao.fs}px`; m.fillStyle = '#fff';
      m.save(); m.beginPath(); m.rect(0, verao.y - verao.fs * 1.3, W, verao.fs * 1.6); m.clip();
      verao.letters.forEach((l, i) => {
        const p = eOutExpo(prog(t, b(7) - 0.12 + i * 0.045, b(7) - 0.12 + i * 0.045 + 0.75));
        m.fillText(l.ch, l.x, verao.y + (1 - p) * verao.fs * 1.4);
      });
      m.restore();
    } else {
      const p = eInExpo(prog(t, tz0, tz1)), s = Math.pow(70, p);
      m.setTransform(s, 0, 0, s, verao.ax * (1 - s), verao.ay * (1 - s));
      m.drawImage(verao.bmp, 0, 0, W, H);
      m.setTransform(1, 0, 0, 1, 0, 0);
    }
    m.globalCompositeOperation = 'source-in';
    const prev = ctx; ctx = m; full('deck', deckCam(t)); ctx = prev;
    ctx.drawImage(maskBuf, 0, 0);
  }

  // Tríptico / díptico: painéis que entram deslizando em direções alternadas.
  function slidePanels(t, t0, list, { axis = 'y', stagger = 0.08, dur = 0.62, drift = 0.05, gap = 6 } = {}) {
    const n = list.length, pw = (W - gap * (n - 1)) / n;
    list.forEach((s, i) => {
      const e = eOutExpo(prog(t, t0 + i * stagger, t0 + i * stagger + dur));
      const sgn = i % 2 ? -1 : 1;
      const x = i * (pw + gap) + (axis === 'x' ? sgn * -1 * (1 - e) * (pw + 200) * (i === 0 ? 1 : -1) : 0);
      const y = axis === 'y' ? sgn * (1 - e) * H : 0;
      const p = prog(t, t0, t0 + 2.2);
      const k = typeof s.k === 'function' ? s.k(t) : s.k;
      photo(img[k], { x, y, w: pw, h: H }, { cx: s.cx ?? 0.5, cy: (s.cy ?? 0.5) + sgn * drift * (p - 0.5), zoom: (s.zoom ?? 1.06) + 0.04 * p });
    });
  }

  // "Dias ao sol": díptico; no beat o painel direito troca de foto com um empurrão vertical.
  function sSol(t) {
    fill(C.paper);
    const t0 = b(18) - 0.4, pw = (W - 6) / 2, p = prog(t, t0, t0 + 2.4);
    photo(img.mulher, { x: 0, y: 0, w: pw, h: H }, { cy: 0.45 + 0.06 * (p - 0.5), zoom: 1.06 + 0.06 * p });
    const e = eInOutExpo(prog(t, b(19) - 0.18, b(19) + 0.18));
    photo(img.raquete, { x: pw + 6, y: -e * H, w: pw, h: H }, { cy: 0.52 - 0.06 * (p - 0.5), zoom: 1.08 });
    if (e > 0) photo(img.casal, { x: pw + 6, y: (1 - e) * H, w: pw, h: H }, { cy: lerp(0.52, 0.46, prog(t, b(19), b(20))), zoom: 1.06 });
  }

  // Mural infinito de fotos (pertencimento): colunas que rolam em sentidos alternados.
  const WALL = [
    ['amigas', 'raquete', 'pes', 'casal', 'escolinha', 'mesaDet'],
    ['bolas', 'deck', 'paiFilha', 'lagoa', 'avoNeto', 'mergulho'],
    ['piquenique', 'mesa', 'amigas', 'orla', 'raquete', 'pes'],
    ['casal', 'paiFilha', 'mulher', 'escolinha', 'mesaDet', 'deck'],
    ['mergulho', 'avoNeto', 'lagoa', 'bolas', 'piquenique', 'remo'],
    ['raquete', 'orla', 'pes', 'mesa', 'amigas', 'paiFilha'],
    ['escolinha', 'casal', 'bolas', 'deck', 'mulher', 'lagoa'],
  ];
  const sMural = t => wall(t, { t0: b(30), s0: 5.25, s1: 1.0, rot0: 0, rot1: -4, v: 70, end: b(37.5) });
  function wall(t, { t0, s0, s1, rot0, rot1, v, end, sd = 1.5 }) {
    fill(C.ink);
    const cw = 372, ch = 496, gap = 18;
    const s = arrive(t, t0, sd, s0, s1) * lerp(1, 0.93, prog(t, t0 + sd, end));
    const rot = arrive(t, t0, sd, rot0, rot1);
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.rotate(rot * Math.PI / 180); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
    WALL.forEach((col, c) => {
      const dir = c % 2 ? 1 : -1, x = W / 2 + (c - 3) * (cw + gap) - cw / 2;
      const off = (c === 3 ? 0 : (c % 2 ? 0.5 : 0.15) * (ch + gap)) + dir * v * (t - t0);
      for (let k = -3; k <= 4; k++) {
        const y = H / 2 - ch / 2 + k * (ch + gap) + off;
        if (s < 1.6 && (y > H * 1.6 || y + ch < -H * 0.6)) continue;
        const key = col[((k + 2) % col.length + col.length) % col.length];
        photo(img[key], { x, y, w: cw, h: ch }, { zoom: 1.04, filter: 'none' });
      }
    });
    ctx.restore();
  }

  // Sedes: uma por vez, com leitura (≈1,3 s cada), em formato de "stories".
  const SEDE_T = [b(37), b(39.5), b(42), b(44.5), b(47)];
  const SEDES = [
    { k: 'apPiscina', name: ['Alto', 'Petrópolis'], desc: 'Área verde, lago e piscinas térmicas', cx: 0.5, cy: 0.6 },
    { k: 'moinhos', name: ['Moinhos', 'de', 'Vento'], desc: 'Piscinas no coração do bairro', cx: 0.6, cy: 0.6 },
    { k: 'petropole', name: ['União', 'Petrópole'], desc: 'Quadras de tênis de saibro', cx: 0.5, cy: 0.62 },
    { k: 'ilha', name: ['Ilha', 'do', 'Pavão'], desc: 'Sede náutica, no Guaíba', cx: 0.5, cy: 0.55 },
  ];
  const sedeShot = i => t => {
    const a = SEDE_T[i], z = SEDE_T[i + 1];
    full(SEDES[i].k, { cx: SEDES[i].cx, cy: SEDES[i].cy, zoom: arrive(t, a, 1.0, 1.24, 1.05) + 0.03 * prog(t, a + 1, z + 0.3),
      dx: lerp(50, -50, prog(t, a - 0.2, z + 0.2)) * (i % 2 ? -1 : 1) });
  };

  // FECHAMENTO 1 — o mural volta, girando para o outro lado e rolando mais rápido.
  const sWallEnd = t => wall(t, { t0: b(47), s0: 1.9, s1: 1.0, rot0: 9, rot1: 5, v: 150, end: b(51.5), sd: 1.3 });

  // FECHAMENTO 2 — "hero" de site: carrosséis de fotos rolando acima e abaixo do título.
  const STRIPS = [
    { y: 72, dir: -1, list: ['lagoa', 'amigas', 'deck', 'pes', 'mesa', 'paiFilha', 'escolinha', 'mergulho'] },
    { y: H - 72 - 230, dir: 1, list: ['piquenique', 'raquete', 'orla', 'avoNeto', 'mulher', 'bolas', 'casal', 'lagoa'] },
  ];
  const CLICK = 28.1;                                   // "Clique" na locução: 27,71–28,15
  function sEnd(t) {
    fill(C.ink);
    const cw = 320, ch = 230, gap = 22, L = 8 * (cw + gap);
    const e = eOutExpo(prog(t, b(52) - 0.02, b(52) + 0.8));
    const burst = 700 * eOutExpo(prog(t, CLICK + 0.02, CLICK + 1.0));   // o clique acelera os carrosséis
    STRIPS.forEach((st, r) => {
      const off = st.dir * (170 * (t - b(51)) + burst), enter = -st.dir * (1 - e) * W * 1.4;
      st.list.forEach((k, i) => {
        let x = ((i * (cw + gap) + off) % L + L) % L - (cw + gap);
        if (x > W + cw) x -= L;
        x += enter;                                     // entrada no acorde, depois da repetição
        if (x > W || x + cw < 0) return;
        photo(img[k], { x, y: st.y, w: cw, h: ch }, { radius: 18, zoom: 1.05, filter: 'none' });
      });
    });
  }

  // Linha do tempo: [início, fim, desenho, transição de entrada].
  // Transições centradas no início do plano: whip (chicote com desfoque), slats (faixas),
  // window (janela que se expande empurrando a cena anterior para trás), over (o plano entra
  // por cima por conta própria), cut.
  const SHOTS = [
    { a: 0, draw: t => full('lagoa', { cx: arrive(t, 0, 2.2, 0.44, 0.5) + 0.02 * prog(t, 2.2, 4), cy: 0.55,
        zoom: arrive(t, 0, 2.0, 1.32, 1.07) - 0.02 * prog(t, 2, 4), rot: arrive(t, 0, 2.0, -2.5, 0) }) },
    { a: b(7), tr: { type: 'whip', d: 0.42, dir: [-1, 0] }, draw: sVerao },
    { a: b(8) + 0.46, tr: { type: 'cut' }, draw: t => full('deck', deckCam(t)) },
    { a: b(13), tr: { type: 'zoom', d: 0.56 }, draw: t => full('pes', {
        cx: 0.5, cy: 0.55, zoom: arrive(t, b(13), 1.0, 1.22, 1.04), rot: arrive(t, b(13), 1.0, 2, 0), dx: lerp(0, -30, prog(t, b(13), b(15))) }) },
    { a: b(15), tr: { type: 'whip', d: 0.36, dir: [0, -1] }, draw: t => full('mergulho', {
        cx: 0.5, cy: 0.5, zoom: 1.02, dx: lerp(-110, 110, prog(t, b(14.5), b(16.6))) }) },
    { a: b(16), tr: { type: 'over', d: 0.9 }, draw: t => slidePanels(t, b(16) - 0.22, [
        { k: 'amigas', cy: 0.46 }, { k: 'bolas', cy: 0.5 }, { k: 'avoNeto', cy: 0.55 }], { axis: 'y' }) },
    { a: b(18), tr: { type: 'whip', d: 0.38, dir: [-1, 0] }, draw: sSol },
    { a: b(20), tr: { type: 'zoom', d: 0.5 }, draw: t => full('escolinha', {
        cy: 0.5, zoom: arrive(t, b(20), 1.0, 1.18, 1.06), dx: lerp(60, -60, prog(t, b(19.5), b(22.5))) }) },
    { a: b(22), tr: { type: 'window', d: 0.62 }, draw: t => {
        full('mesa', { cy: 0.5, zoom: lerp(1.04, 1.12, prog(t, b(21.4), b(25.5))), dx: lerp(30, -30, prog(t, b(21.4), b(25.5))) });
        // cartão sobreposto (detalhe da mesa), em profundidade
        const e = eOutExpo(prog(t, b(23) - 0.1, b(23) + 0.6)), x2 = eInExpo(prog(t, b(25) - 0.45, b(25) - 0.05));
        if (e > 0) {
          const cw = 430, ch = 560, x = W - SAFE_X - cw + 40, y = lerp(H + 40, 250, e) + x2 * 700;
          ctx.save(); ctx.translate(x + cw / 2, y + ch / 2); ctx.rotate((lerp(-9, -3.5, e)) * Math.PI / 180);
          ctx.shadowColor = 'rgba(6,18,28,.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
          ctx.fillStyle = '#fff'; ctx.fillRect(-cw / 2 - 12, -ch / 2 - 12, cw + 24, ch + 24); ctx.restore();
          ctx.save(); ctx.translate(x + cw / 2, y + ch / 2); ctx.rotate((lerp(-9, -3.5, e)) * Math.PI / 180); ctx.translate(-(x + cw / 2), -(y + ch / 2));
          photo(img.mesaDet, { x, y, w: cw, h: ch }, { cy: 0.55, zoom: 1.05 });
          ctx.restore();
        }
      } },
    { a: b(25), tr: { type: 'over', d: 0.85 }, draw: t => slidePanels(t, b(25) - 0.2, [
        { k: 'paiFilha', cy: 0.48 }, { k: 'piquenique', cy: 0.6 }], { axis: 'y', stagger: 0.09 }) },
    { a: b(28), tr: { type: 'whip', d: 0.4, dir: [-1, 0] }, draw: t => full('orla', {
        cy: 0.5, zoom: 1.03, dx: lerp(-150, 150, prog(t, b(27.6), b(30.4))) }) },
    { a: b(30), tr: { type: 'window', d: 0.5 }, draw: sMural },
    { a: SEDE_T[0], tr: { type: 'whip', d: 0.38, dir: [-1, 0] }, draw: sedeShot(0) },
    { a: SEDE_T[1], tr: { type: 'whip', d: 0.36, dir: [0, -1] }, draw: sedeShot(1) },
    { a: SEDE_T[2], tr: { type: 'whip', d: 0.36, dir: [-1, 0] }, draw: sedeShot(2) },
    { a: SEDE_T[3], tr: { type: 'whip', d: 0.36, dir: [0, -1] }, draw: sedeShot(3) },
    { a: b(47), tr: { type: 'window', d: 0.55 }, draw: sWallEnd },
    { a: b(51), tr: { type: 'whip', d: 0.4, dir: [0, -1] }, draw: sEnd },
  ];
  SHOTS.forEach((s, i) => { s.b = SHOTS[i + 1]?.a ?? DUR; });

  function renderShot(i, t, buf) {
    const g = buf.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, W, H);
    const prev = ctx; ctx = g; SHOTS[i].draw(t); ctx = prev;
    return buf;
  }

  function composite(t) {
    // transição ativa?
    for (let k = 1; k < SHOTS.length; k++) {
      const s = SHOTS[k], tr = s.tr;
      if (!tr || tr.type === 'cut' || !tr.d) continue;
      const t0 = s.a - tr.d / 2, t1 = s.a + tr.d / 2;
      if (t >= t0 && t < t1) {
        const p = (t - t0) / tr.d;
        const A = renderShot(k - 1, t, bufA), B = renderShot(k, t, bufB);
        transition(tr, p, A, B);
        return;
      }
    }
    let i = SHOTS.findIndex(s => t >= s.a && t < s.b); if (i < 0) i = SHOTS.length - 1;
    ctx.drawImage(renderShot(i, t, bufA), 0, 0);
  }

  function transition(tr, p, A, B) {
    if (tr.type === 'whip') {
      // empurrão com profundidade: a cena que sai anda mais devagar, recua e escurece (paralaxe);
      // a que entra cobre por cima, com sombra na borda, e assenta com leve zoom.
      const e = eInOutQuint(p), [dx, dy] = tr.dir;
      const sa = lerp(1, 0.9, e), sb = lerp(1.06, 1, eOutCubic(p));
      ctx.save(); ctx.translate(W / 2 + dx * W * 0.45 * e, H / 2 + dy * H * 0.45 * e); ctx.scale(sa, sa); ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(A, 0, 0); ctx.restore();
      fill('#06121c', 0.55 * e);
      ctx.save();
      ctx.translate(W / 2 - dx * W * (1 - e), H / 2 - dy * H * (1 - e)); ctx.scale(sb, sb); ctx.translate(-W / 2, -H / 2);
      ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 80; ctx.shadowOffsetX = dx * 30; ctx.shadowOffsetY = dy * 30;
      ctx.drawImage(B, 0, 0); ctx.restore();
    } else if (tr.type === 'zoom') {
      // mergulho: a cena que sai acelera para dentro, a que entra chega de perto e assenta
      const sa = lerp(1, 1.7, eInCubic(p)), sb = lerp(1.45, 1, eOutCubic(p)), mix = eInOutCubic(prog(p, 0.4, 0.6));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sa, sa); ctx.translate(-W / 2, -H / 2); ctx.drawImage(A, 0, 0); ctx.restore();
      ctx.save(); ctx.globalAlpha = mix; ctx.translate(W / 2, H / 2); ctx.scale(sb, sb); ctx.translate(-W / 2, -H / 2); ctx.drawImage(B, 0, 0); ctx.restore();
      fill('#ffffff', 0.12 * Math.sin(Math.PI * mix));
    } else if (tr.type === 'slats') {
      ctx.drawImage(A, 0, 0);
      const n = tr.n, hh = H / n;
      for (let j = 0; j < n; j++) {
        const e = eOutExpo(clamp((p - j * 0.05) / 0.62)), sgn = j % 2 ? -1 : 1;
        ctx.drawImage(B, 0, j * hh, W, hh + 1, sgn * (1 - e) * W, j * hh, W, hh + 1);
      }
    } else if (tr.type === 'window') {
      const e = eInOutExpo(p);
      const s = lerp(1, 0.86, e);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2); ctx.drawImage(A, 0, 0); ctx.restore();
      fill('#0c1e2c', 0.5 * e);
      const w = lerp(W * 0.12, W, e), h = lerp(H * 0.2, H, e), x = (W - w) / 2, y = (H - h) / 2;
      const sb = lerp(1.25, 1, e);
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, lerp(28, 0, e)); ctx.clip();
      ctx.translate(W / 2, H / 2); ctx.scale(sb, sb); ctx.translate(-W / 2, -H / 2); ctx.drawImage(B, 0, 0);
      ctx.restore();
    } else if (tr.type === 'over') {
      ctx.drawImage(A, 0, 0); ctx.drawImage(B, 0, 0);
    }
  }

  // Cursor de mouse: entra pelo canto, desacelera sobre o botão, clica e sai de cena.
  function cursorPos(t, tx, ty) {
    const p = eInOutCubic(prog(t, 27.4, CLICK - 0.04));
    const x = lerp(W * 0.86, tx, p) + Math.sin(Math.PI * p) * 70, y = lerp(H + 60, ty, p) - Math.sin(Math.PI * p) * 40;
    const leave = eInOutCubic(prog(t, 28.9, 29.45));
    return { x: x + leave * 160, y: y + leave * 260, a: prog(t, 27.4, 27.55) * (1 - prog(t, 29.15, 29.45)) };
  }
  function drawCursor(x, y, a, k = 1) {
    if (a <= 0) return;
    const P = [[0, 0], [0, 27], [6.6, 20.6], [11, 31], [15.6, 29], [11.4, 19.4], [20.2, 19.4]];
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(2.6 * k, 2.6 * k);
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
    ctx.beginPath(); P.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath();
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------- camada de tipografia
  function typeLayer(t) {
    // GANCHO — Já imaginou ser sócio do União?
    {
      const t0 = 0.22, tOut = b(7) - 0.36, s = 150;
      grad(0, 0, 0, H * 0.62, 0.52 * vis(t, t0, tOut));
      grad(0, 0, W * 0.6, 0, 0.25 * vis(t, t0, tOut));
      kline(t, ['Já', 'imaginou'], SAFE_X, 120 + s, { size: s, t0, tOut });
      kline(t, ['ser', { w: 'sócio', fam: 'serif', size: s * 1.14 }], SAFE_X, 120 + s * 2.02, { size: s, t0: t0 + 0.11, tOut });
      kline(t, ['do', 'União?'], SAFE_X, 120 + s * 3.04, { size: s, t0: t0 + 0.22, tOut });
    }
    // MOTE — assinatura sobre o deck
    {
      const t0 = b(8) + 0.5, tOut = b(13) - 0.42, s = 118;
      grad(0, 0, W * 0.75, H * 0.5, 0.6 * vis(t, t0, tOut));
      kline(t, ['O', 'verão', 'tem'], SAFE_X, 300, { size: s, fam: 'serif', t0, tOut, shadow: 0.35 });
      kline(t, ['encontro', 'marcado'], SAFE_X, 300 + s * 1.05, { size: s, fam: 'serif', t0: t0 + 0.12, tOut, shadow: 0.35 });
      const ws = kline.last;
      kline(t, ['no', 'União.'], SAFE_X, 300 + s * 2.1, { size: s, fam: 'serif', t0: 5.3, tOut, shadow: 0.35 });
      if (ws && t > t0) {                                  // sublinhado que "marca" o encontro
        const e = eOutExpo(prog(t, 4.8, 5.4)) * (1 - prog(t, tOut, tOut + 0.3));
        fill(C.cyan, 1, { x: ws[0].x, y: 300 + s * 1.05 + 22, w: ws[0].width * e, h: 7 });
      }
    }
    // LAZER — palavras grandes
    const big = (word, t0, tOut) => {
      grad(0, H, 0, H * 0.45, 0.62 * vis(t, t0, tOut));
      kline(t, [word], SAFE_X - 8, 955, { size: 236, t0, tOut, track: -0.045, stagger: 0 });
    };
    big('Piscina.', b(13) + 0.25, b(16) - 0.25);
    big('Tênis.', b(16) + 0.08, b(18) - 0.15);
    grad(0, H, 0, H * 0.45, 0.62 * vis(t, b(18) + 0.05, b(20) + 0.05));
    kline(t, ['Dias', 'ao', 'sol.'], SAFE_X - 8, 955, { size: 236, t0: b(18) + 0.05, tOut: b(20) + 0.05, track: -0.045 });
    // CONVIVÊNCIA
    {
      const t0 = b(22) + 0.28, tOut = b(25) - 0.3;
      grad(0, H, 0, H * 0.42, 0.6 * vis(t, t0, tOut));
      kline(t, ['Amigos', 'por', 'perto.'], SAFE_X, 950, { size: 150, t0, tOut });
      const t1 = b(25) + 0.16, tOut1 = b(28) + 0.5;
      grad(0, H, 0, H * 0.42, 0.6 * vis(t, t1, tOut1));
      kline(t, ['Tempo', 'em', 'família.'], SAFE_X, 950, { size: 150, t0: t1, tOut: tOut1 });
    }
    // PERTENCIMENTO — sobre o mural
    {
      const t0 = 15.72, tOut = b(37) - 0.4;
      fill('#0c1e2c', 0.5 * vis(t, t0 - 0.1, tOut));
      kline(t, ['Você', 'também'], W / 2, 480, { size: 156, t0, tOut, align: 'center', shadow: 0.3 });
      kline(t, ['pode', 'fazer', 'parte.'], W / 2, 480 + 165, { size: 156, t0: 16.15, tOut, align: 'center', shadow: 0.3 });
      kline(t, ['Conheça', 'o', 'União.'], W / 2, 480 + 290, { size: 52, weight: 500, t0: 16.9, tOut, align: 'center', track: -0.01 });
    }
    // SEDES — barra de progresso (stories), cabeçalho que acompanha o VO, nome + descrição
    {
      const S = SEDE_T, v = vis(t, S[0] + 0.05, S[4] - 0.3);
      if (v > 0) {
        grad(0, H, 0, H * 0.5, 0.62 * v);
        grad(0, 0, 0, H * 0.32, 0.45 * v);
        const segW = (W - SAFE_X - 300 - 36) / 4;
        for (let i = 0; i < 4; i++) {
          const r = { x: SAFE_X + i * (segW + 12), y: 66, w: segW, h: 5 };
          fill('#ffffff', 0.3 * v, r);
          fill('#ffffff', v, { ...r, w: segW * prog(t, S[i], S[i + 1]) });
        }
      }
      kline(t, [{ w: '4', weight: 700 }, 'sedes.'], SAFE_X, 196, { size: 84, t0: S[0] + 0.12, tOut: 19.92 });
      kline(t, ['Muitos', 'jeitos', 'de', 'viver', 'o', 'União.'], SAFE_X, 196, { size: 84, t0: 20.15, tOut: S[4] - 0.4, stagger: 0.045 });
      SEDES.forEach((sd, i) => {
        kline(t, sd.name, SAFE_X - 4, 880, { size: 160, weight: 700, track: -0.045, t0: S[i] + 0.08, tOut: S[i + 1] - 0.34, outDur: 0.3, stagger: 0.05 });
        kline(t, [sd.desc], SAFE_X, 962, { size: 44, weight: 500, track: -0.01, t0: S[i] + 0.2, tOut: S[i + 1] - 0.36, outDur: 0.28 });
      });
    }
    // FECHAMENTO 1 — sobre o mural
    {
      const t0 = 23.9, tOut = b(51) - 0.3;
      fill('#0c1e2c', 0.55 * vis(t, t0 - 0.1, tOut));
      kline(t, ['O', 'próximo', 'encontro'], W / 2, 500, { size: 150, fam: 'serif', t0, tOut, align: 'center', stagger: 0.07, shadow: 0.4 });
      kline(t, ['pode', 'ser', 'o', 'seu.'], W / 2, 500 + 150, { size: 150, fam: 'serif', t0: 24.78, tOut, align: 'center', stagger: 0.07, shadow: 0.4 });
    }
    // FECHAMENTO 2 — hero: "Seja sócio" gigante encolhe no acorde e vira título de site
    if (t >= b(51) - 0.1) {
      const size = 188, yb = 582, ys = yb - 0.36 * size;
      const words = [{ w: 'Seja', at: 26.0 }, { w: 'sócio', at: 26.28 }, { w: 'do', at: 26.84 }, { w: 'União.', at: 26.96 }];
      const wd = words.map(w => measure(w.w, size, 700, 'sans', -0.045)), sp = measure(' ', size, 700, 'sans', -0.045);
      const total = wd.reduce((a, v) => a + v, 0) + sp * 3, x0 = W / 2 - total / 2;
      const xs = x0 + (wd[0] + sp + wd[1]) / 2;                 // centro de "Seja sócio"
      const e = eInOutExpo(prog(t, b(52), b(52) + 0.62)), sc = lerp(1.95, 1, e);
      ctx.save();
      ctx.translate(lerp(W / 2, xs, e), lerp(H / 2, ys, e)); ctx.scale(sc, sc); ctx.translate(-xs, -ys);
      kline(t, words, W / 2, yb, { size, weight: 700, t0: 26.0, align: 'center', track: -0.045, shadow: 0.2 });
      ctx.restore();
      const ul = eOutExpo(prog(t, b(52) + 0.5, b(52) + 1.1));
      if (ul > 0) fill(C.cyan, 1, { x: W / 2 - total / 2 * ul, y: yb + 30, w: total * ul, h: 8 });

      // assinatura (escudo + nome), centralizada acima do título
      const lg = eOutExpo(prog(t, b(52) + 0.55, b(52) + 1.3));
      if (lg > 0) {
        const sh = 76, sw = sh * img.escudo.width / img.escudo.height;
        const n1 = measure('Grêmio Náutico União', 38, 600, 'sans', -0.015), gw = sw + 22 + n1, gx = W / 2 - gw / 2, gy = 334 + (1 - lg) * 24;
        escudo(gx, gy, sh, lg, false);
        ctx.save(); ctx.globalAlpha = lg; ctx.fillStyle = '#fff';
        ctx.font = font(38, 600); ctx.letterSpacing = `${-0.015 * 38}px`; ctx.fillText('Grêmio Náutico União', gx + sw + 22, gy + 36);
        ctx.font = font(26, 500); ctx.letterSpacing = '0px'; ctx.fillStyle = '#BFD3E6'; ctx.fillText('Porto Alegre, desde 1906', gx + sw + 22, gy + 68);
        ctx.restore();
      }

      // botão + cursor que clica em "Clique"
      const bs = 42, label = ['Quero', 'conhecer', 'o', 'União', '→'];
      const bw = measure(label.join(' '), bs, 500, 'sans', -0.01) + 2 * 54, bh = 98, bx = W / 2 - bw / 2, by = 648;
      const o = eOutExpo(prog(t, 27.15, 27.75));
      if (o > 0) {
        const cur = cursorPos(t, bx + bw * 0.64, by + bh * 0.62);
        const over = t > CLICK - 0.2, press = Math.sin(Math.PI * prog(t, CLICK, CLICK + 0.18));
        const k = 1 - 0.035 * press;
        ctx.save();
        ctx.translate(W / 2, by + bh / 2); ctx.scale(k, k); ctx.translate(-W / 2, -(by + bh / 2));
        ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
        ctx.fillStyle = over ? (press > 0.05 ? '#DCE8F4' : '#EEF4FA') : '#fff';
        const w = bw * o;
        ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, by, w, bh, 8); ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, by, w, bh, 8); ctx.clip();
        const rp = prog(t, CLICK + 0.02, CLICK + 0.7);                // onda do clique
        if (rp > 0 && rp < 1) { ctx.fillStyle = `rgba(0,79,145,${0.3 * (1 - rp)})`; ctx.beginPath(); ctx.arc(cur.x, cur.y, 30 + bw * 0.75 * eOutCubic(rp), 0, Math.PI * 2); ctx.fill(); }
        kline(t, label, bx + 54, by + bh / 2 + bs * 0.36, { size: bs, weight: 500, color: C.blue, t0: 27.3, shadow: 0, track: -0.01, stagger: 0.04, dur: 0.6 });
        ctx.restore();
        drawCursor(cur.x, cur.y, cur.a, 1 - 0.12 * press);
      }
    }
    // Escudo discreto no canto, do mote até o fechamento
    const a = prog(t, b(8) + 0.5, b(8) + 0.9) * (1 - prog(t, b(47) - 0.3, b(47)));
    if (a > 0) { const h = 72; escudo(W - 72 - h * img.escudo.width / img.escudo.height, 54, h, a * 0.97); }
  }

  // ---------------------------------------------------------------- acabamento
  const grain = [];
  function prepGrain() {
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 6; k++) {
      const c = mk(960, 540), g = c.getContext('2d'), d = g.createImageData(960, 540);
      for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (rnd() - 0.5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      g.putImageData(d, 0, 0); grain.push(c);
    }
  }
  function finish(g, f) {
    g.save();
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.07; g.drawImage(grain[f % grain.length], 0, 0, W, H);
    g.restore();
  }

  function drawFrame(t) {
    ctx = fctx;
    fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.globalAlpha = 1; fctx.filter = 'none'; fctx.globalCompositeOperation = 'source-over';
    fctx.fillStyle = C.paper; fctx.fillRect(0, 0, W, H);
    composite(t);
    typeLayer(t);
  }

  // Quadro final: média de `samples` amostras em meio quadro (obturador de 180°).
  const inTransition = t => SHOTS.some(s => s.tr && s.tr.d && s.tr.type !== 'cut' && Math.abs(t - s.a) < s.tr.d / 2 + 0.04);
  function renderFrame(f, samples = 6) {
    const t = f / FPS;
    const fast = samples > 1 && inTransition(t);           // transições: mais amostras, obturador de 270°
    const n = fast ? 12 : samples, shutter = fast ? 0.75 : 0.5;
    samples = n;
    octx.setTransform(1, 0, 0, 1, 0, 0); octx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < samples; i++) {
      const ts = samples === 1 ? t : t + ((i + 0.5) / samples - 0.5) * shutter / FPS;
      drawFrame(clamp(ts, 0, DUR - 1e-3));
      octx.globalAlpha = 1 / (i + 1);
      octx.drawImage(frame, 0, 0);
    }
    octx.globalAlpha = 1;
    finish(octx, f);
  }

  window.filmReady = Promise.all([
    ...fonts.map(f => f.load().then(ff => document.fonts.add(ff))),
    ...Object.entries(PHOTOS).map(([k, v]) => load(v).then(i => { img[k] = i; })),
  ]).then(() => { prepVerao(); prepGrain(); });

  window.FILM = { W, H, FPS, DUR, b, renderFrame };

  // ---------------------------------------------------------------- pré-visualização no navegador
  if (new URLSearchParams(location.search).has('render')) { document.body.classList.add('render'); return; }
  const audio = document.getElementById('a'), scrub = document.getElementById('scrub'), tc = document.getElementById('tc');
  let playing = false;
  document.getElementById('play').onclick = () => { playing = !playing; playing ? audio.play() : audio.pause(); };
  scrub.oninput = () => { audio.currentTime = +scrub.value; };
  window.filmReady.then(function loop() {
    const t = Math.min(DUR - 1 / FPS, audio.currentTime || +scrub.value);
    renderFrame(Math.round(t * FPS), 1); tc.textContent = t.toFixed(2); if (playing) scrub.value = t;
    requestAnimationFrame(loop);
  });
})();
