// Grêmio Náutico União — "Verão no União", filme de aquisição, 30 s, 1920×1080.
// Cada quadro é calculado só a partir do tempo t (s): renderFrame(f) é determinístico,
// então a renderização pode rodar em paralelo e sempre dá o mesmo resultado.
(() => {
  const W = 1920, H = 1080, FPS = 30, DUR = 30;
  const SAFE_X = Math.round(W * 0.08);           // 154 px — margem lateral do roteiro
  const C = {
    paper: '#F8F7F3', white: '#FFFFFF', stone: '#EBEBE5', ink: '#102A3B',
    muted: '#4B5961', blue: '#004F91', cyan: '#00BFF3',
  };

  // ---------------------------------------------------------------- tempos (roteiro V3)
  // Trilha a 117,5 BPM: batida n em BEAT0 + n·BEAT. Todo corte cai numa batida, dentro da
  // janela do roteiro e antes da palavra correspondente na locução.
  const BEAT = 0.510839, BEAT0 = -0.0232, b = n => +(BEAT0 + n * BEAT).toFixed(3);
  const T = {
    hook: 0.0,        // Já imaginou ser sócio do União?
    mote: b(7),       // 3,55  O verão tem encontro marcado no União.
    pisc: b(13),      // 6,62  Piscina.
    tenis: b(16),     // 8,15  Tênis.
    sol: b(18),       // 9,17  Dias ao sol.
    amigos: b(22),    // 11,22 Amigos por perto.
    familia: b(25),   // 12,75 Tempo em família.
    fill: b(28),      // 14,28 a última foto da convivência preenche o quadro
    parte: b(30),     // 15,30 Você também pode fazer parte.
    sedes: b(37),     // 18,88 4 sedes / Muitos jeitos de viver o União.
    cta: b(47),       // 23,99 O próximo encontro pode ser o seu.
    seja: b(51),      // 26,03 Seja sócio do União.
    acorde: b(52),    // 26,54 acorde de resolução da trilha
    botao: b(54),     // 27,56 Quero conhecer o União →
    end: 30.0,
  };

  // ---------------------------------------------------------------- assets
  const HD = 'assets/photos/hd/';
  const PHOTOS = {
    // sedes — acervo do site (fotos reais, identificadas na LP)
    apPiscina: 'assets/photos/ap-piscina.jpg',
    moinhos: 'assets/photos/moinhos-piscina.jpg',
    tenis: 'assets/photos/petropole-tenis.jpg',
    ilha: 'assets/photos/ilha-aerea.jpg',
    // cenas de vida — fotos novas
    lagoa: HD + 'piscina-lagoa-convivencia-fim-de-tarde.jpg',
    paiFilha: HD + 'pai-filha-picole-borda.jpg',
    pes: HD + 'criancas-pes-borda-piscina.jpg',
    amigas: HD + 'amigas-tenis-saibro.jpg',
    bolas: HD + 'bolas-tenis-saibro-detalhe.jpg',
    avoNeto: HD + 'avo-neto-tenis-saibro.jpg',
    mulher: HD + 'mulher-sorrindo-borda-piscina.jpg',
    raquete: HD + 'raquete-drink-espreguicadeira.jpg',
    mesa: HD + 'amigos-mesa-pos-tenis.jpg',
    mergulho: HD + 'familia-mergulho-piscina.jpg',
    piquenique: HD + 'piquenique-familia-gramado.jpg',
    escudo: 'assets/logo-escudo.png',
  };
  const img = {};
  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const fonts = [
    new FontFace('Inst', 'url(assets/fonts/InstrumentSans.ttf)', { weight: '400 700', stretch: '75% 100%' }),
    new FontFace('InstSerif', 'url(assets/fonts/InstrumentSerif-Italic.ttf)', { style: 'italic' }),
  ];
  window.filmReady = Promise.all([
    ...fonts.map(f => f.load().then(ff => document.fonts.add(ff))),
    ...Object.entries(PHOTOS).map(([k, v]) => load(v).then(i => { img[k] = i; })),
  ]);

  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  // ---------------------------------------------------------------- utilidades
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eOutCubic = p => 1 - Math.pow(1 - p, 3);
  const eOutQuart = p => 1 - Math.pow(1 - p, 4);
  const eInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const between = (t, a, b) => t >= a && t < b;

  // Foto em "cover" dentro de um retângulo, com zoom e foco (cx, cy normalizados) e pan em px.
  function photo(im, r, o = {}) {
    const { cx = 0.5, cy = 0.5, zoom = 1, dx = 0, dy = 0, filter = 'none', alpha = 1 } = o;
    const s = Math.max(r.w / im.width, r.h / im.height) * zoom;
    const w = im.width * s, h = im.height * s;
    let x = r.x + r.w / 2 - cx * w + dx, y = r.y + r.h / 2 - cy * h + dy;
    x = clamp(x, r.x + r.w - w, r.x); y = clamp(y, r.y + r.h - h, r.y);
    ctx.save();
    ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.filter = filter;
    ctx.drawImage(im, x, y, w, h);
    ctx.restore();
  }

  function rect(r, color, alpha = 1) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.restore(); }

  // Gradiente linear de deep-ink para legibilidade, sem "apagar o verão".
  function shade(x0, y0, x1, y1, a0, a1 = 0, color = '16,42,59') {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(${color},${a0})`);
    g.addColorStop(1, `rgba(${color},${a1})`);
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  const font = (size, weight = 500, fam = 'sans') =>
    fam === 'serif' ? `italic 400 ${size}px InstSerif` : `${weight} ${size}px Inst`;

  function measure(str, size, weight, fam, track = 0) {
    ctx.save(); ctx.font = font(size, weight, fam); ctx.letterSpacing = `${track * size}px`;
    const w = ctx.measureText(str).width; ctx.restore(); return w;
  }

  // Maior corpo (≤ max) em que todas as linhas cabem em maxW.
  function fit(lines, max, maxW, weight = 500, fam = 'sans', track = 0) {
    const widest = Math.max(...lines.map(l => measure(l, 100, weight, fam, track)));
    return Math.min(max, Math.floor(100 * maxW / widest));
  }

  // Texto com entrada em fade + deslocamento curto (sem bounce).
  // runs: [{text, color}] para colorir palavras dentro da mesma linha.
  function text(str, x, y, o = {}) {
    const { size = 80, weight = 500, fam = 'sans', color = C.white, alpha = 1, align = 'left',
      track = fam === 'serif' ? 0 : -0.02, shadow = 0, runs = null } = o;
    if (alpha <= 0.001) return;
    ctx.save();
    ctx.font = font(size, weight, fam);
    ctx.letterSpacing = `${track * size}px`;
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = alpha;
    if (shadow) { ctx.shadowColor = `rgba(8,22,32,${shadow})`; ctx.shadowBlur = size * 0.35; ctx.shadowOffsetY = size * 0.04; }
    const parts = runs ?? [{ text: str, color }];
    const total = parts.reduce((s, p) => s + ctx.measureText(p.text).width, 0);
    let cx = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
    for (const p of parts) { ctx.fillStyle = p.color ?? color; ctx.fillText(p.text, cx, y); cx += ctx.measureText(p.text).width; }
    ctx.restore();
  }

  // Curva de entrada/saída de um elemento de texto: devolve opacidade e deslocamento.
  function inOut(t, tin, tout = Infinity, { dur = 0.45, rise = 16, outDur = 0.22 } = {}) {
    const pi = eOutCubic(prog(t, tin, tin + dur));
    const po = Number.isFinite(tout) ? prog(t, tout, tout + outDur) : 0;
    return { a: pi * (1 - po), dy: (1 - pi) * rise - po * 8 };
  }

  function escudo(x, y, h, alpha = 1, shadow = false) {
    const im = img.escudo, w = h * im.width / im.height;
    ctx.save(); ctx.globalAlpha = alpha;
    if (shadow) { ctx.shadowColor = 'rgba(8,22,32,.35)'; ctx.shadowBlur = h * 0.18; ctx.shadowOffsetY = h * 0.03; }
    ctx.drawImage(im, x, y, w, h); ctx.restore();
    return w;
  }

  const FULL = { x: 0, y: 0, w: W, h: H };
  const GRADE = 'saturate(1.06) contrast(1.03) brightness(1.02)';

  // Painéis lado a lado (dípticos/trípticos) com linhas finas de paper entre eles.
  // Cada painel entra por expansão horizontal, um por vez, e tem um leve zoom/pan interno.
  function panels(t, t0, list, { gap = 6, stagger = 0.12, dur = 0.38, end = t0 + 2 } = {}) {
    rect(FULL, C.paper);
    const n = list.length, pw = (W - gap * (n - 1)) / n;
    let covered = 0;
    list.forEach((s, i) => {
      const ti = t0 + i * stagger;
      const o = i === 0 ? 1 : eOutQuart(prog(t, ti, ti + dur));
      if (o <= 0) return;
      const x = i * (pw + gap), p = prog(t, t0, end);
      covered = x + pw * o;
      photo(img[s.k], { x, y: 0, w: pw * o, h: H },
        { cx: s.cx ?? 0.5, cy: lerp(s.cy ?? 0.5, (s.cy ?? 0.5) + (i % 2 ? -0.03 : 0.03), p), zoom: lerp(s.zoom ?? 1.04, (s.zoom ?? 1.04) + 0.04, p), filter: GRADE });
    });
    return covered;                     // largura já coberta por foto (o degradê do rótulo não passa disso)
  }

  // ---------------------------------------------------------------- cenas
  // 00:00–00:03.5 — GANCHO: piscinas-lagoa cheias de gente já no primeiro quadro.
  function sHook(t) {
    const p = prog(t, T.hook, T.mote);
    photo(img.lagoa, FULL, { cx: lerp(0.47, 0.5, p), cy: 0.55, zoom: lerp(1.0, 1.03, p), filter: GRADE });
    // texto no céu, para não cobrir as pessoas na borda da piscina
    shade(0, 0, 0, H * 0.5, 0.5);
    shade(0, 0, W * 0.65, 0, 0.22);
    const lines = ['Já imaginou ser', 'sócio do União?'];
    const size = fit(lines, 116, W * 0.52);
    const e = inOut(t, 0.25, Infinity, { dur: 0.42, rise: 16 });
    text(lines[0], SAFE_X, 108 + size * 1.05 + e.dy, { size, alpha: e.a, shadow: 0.3 });
    text(lines[1], SAFE_X, 108 + size * 2.07 + e.dy, { size, alpha: e.a, shadow: 0.3 });
  }

  // 00:03.5–00:06.8 — ASSINATURA: composição editorial; família na borda da piscina no painel.
  function sMote(t) {
    rect(FULL, C.paper);
    const p = prog(t, T.mote, T.pisc);
    const open = eOutQuart(prog(t, T.mote, T.mote + 0.55));   // a foto cheia recua para o painel
    const px = lerp(0, 940, open);
    photo(img.paiFilha, { x: px, y: 0, w: W - px, h: H }, { cx: 0.5, cy: lerp(0.46, 0.5, p), zoom: lerp(1.0, 1.03, p), filter: GRADE });
    const lines = ['O verão tem', 'encontro marcado', 'no União.'];
    const size = fit(lines, 112, 940 - SAFE_X - 70, 400, 'serif');
    const lh = size * 1.06, y0 = 540 + size * 0.3 - lh;
    const lab = inOut(t, T.mote + 0.2, Infinity, { dur: 0.4, rise: 10 });
    text('Verão no União', SAFE_X, y0 - size * 1.05 + lab.dy, { size: 26, color: C.muted, alpha: lab.a, track: 0 });
    lines.forEach((l, i) => {
      const e = inOut(t, T.mote + 0.2 + i * 0.12, Infinity, { dur: 0.5, rise: 18 });
      const runs = i === 1 ? [{ text: 'encontro', color: C.blue }, { text: ' marcado', color: C.ink }] : null;
      text(l, SAFE_X, y0 + i * lh + e.dy, { size, fam: 'serif', color: C.ink, alpha: e.a, runs });
    });
    const r = eOutCubic(prog(t, T.mote + 0.9, T.mote + 1.5));
    rect({ x: SAFE_X, y: y0 + 2 * lh + size * 0.55, w: 120 * r, h: 3 }, C.blue);
  }

  // 00:06.8–00:11.3 — LAZER E MOVIMENTO: uma palavra por corte, no beat.
  function sLazer(t) {
    let label, s0, covered = W;
    if (t < T.tenis) {
      const p = prog(t, T.pisc, T.tenis);
      photo(img.pes, FULL, { cx: lerp(0.46, 0.52, p), cy: 0.55, zoom: lerp(1.0, 1.04, p), filter: GRADE });
      label = 'Piscina.'; s0 = T.pisc;
    } else if (t < T.sol) {
      covered = panels(t, T.tenis, [{ k: 'amigas', cy: 0.48 }, { k: 'bolas', cy: 0.5 }, { k: 'avoNeto', cy: 0.55 }], { stagger: 0.1, dur: 0.32, end: T.sol });
      label = 'Tênis.'; s0 = T.tenis;
    } else {
      covered = panels(t, T.sol, [{ k: 'mulher', cy: 0.45 }, { k: 'raquete', cy: 0.55 }], { stagger: 0.14, dur: 0.4, end: T.amigos });
      label = 'Dias ao sol.'; s0 = T.sol;
    }
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, covered, H); ctx.clip();
    shade(0, H, 0, H * 0.45, 0.6);
    ctx.restore();
    const e = inOut(t, s0 + 0.04, Infinity, { dur: 0.35, rise: 14 });
    text(label, SAFE_X, 930 + e.dy, { size: 132, alpha: e.a, shadow: 0.25 });
  }

  // 00:11.3–00:15.5 — CONVIVÊNCIA: janelas que se expandem na horizontal; a última preenche o quadro.
  function sConvivencia(t) {
    rect(FULL, C.paper);
    const band = { x: 0, y: 300, w: W, h: 560 };
    // janela 1 — amigos à mesa
    const o1 = eOutQuart(prog(t, T.amigos, T.amigos + 0.7));
    const w1 = lerp(W * 0.32, W, o1);
    photo(img.mesa, { x: (W - w1) / 2, y: band.y, w: w1, h: band.h },
      { cx: 0.5, cy: 0.5, zoom: lerp(1.0, 1.05, prog(t, T.amigos, T.familia)), filter: GRADE });
    // janela 2 — família, entra por cima e depois toma o quadro
    if (t >= T.familia) {
      const o2 = eOutQuart(prog(t, T.familia, T.familia + 0.6));
      const w2 = lerp(W * 0.18, W, o2);
      const f = eInOut(prog(t, T.fill, T.parte - 0.05));
      const r = { x: (W - w2) / 2, y: lerp(band.y, 0, f), w: w2, h: lerp(band.h, H, f) };
      photo(img.mergulho, r, { cx: lerp(0.5, 0.48, f), cy: 0.5, zoom: lerp(1.04, 1.0, prog(t, T.familia, T.parte)), filter: GRADE });
    }
    const a = inOut(t, T.amigos + 0.15, T.familia - 0.1, { dur: 0.4, rise: 14 });
    text('Amigos por perto.', SAFE_X, 220 + a.dy, { size: 88, color: C.ink, alpha: a.a });
    const b = inOut(t, T.familia + 0.12, T.fill - 0.2, { dur: 0.4, rise: 14 });
    text('Tempo em família.', SAFE_X, 220 + b.dy, { size: 88, color: C.ink, alpha: b.a });
  }

  // 00:15.5–00:18.8 — PERTENCIMENTO: família à sombra das árvores + reforço de associação.
  function sParte(t) {
    const p = prog(t, T.parte, T.sedes);
    rect(FULL, C.ink);
    const open = eOutQuart(prog(t, T.parte, T.parte + 0.55));   // a foto cheia recua para a esquerda
    const pw = lerp(W, 900, open);
    photo(img.piquenique, { x: 0, y: 0, w: pw, h: H }, { cx: 0.5, cy: lerp(0.6, 0.64, p), zoom: lerp(1.0, 1.04, p), filter: GRADE });
    const lines = ['Você também', 'pode fazer parte.'];
    const x = 900 + 100, size = fit(lines, 108, W - SAFE_X - x);
    const e = inOut(t, T.parte + 0.3, Infinity, { dur: 0.5, rise: 16 });
    text(lines[0], x, 500 + e.dy, { size, alpha: e.a });
    text(lines[1], x, 500 + size * 1.04 + e.dy, { size, alpha: e.a });
    const s = inOut(t, T.parte + 1.0, Infinity, { dur: 0.45, rise: 10 });
    text('Conheça o União.', x, 500 + size * 1.04 + 90 + s.dy, { size: 40, color: '#BFD3E6', alpha: s.a, track: 0 });
  }

  // 00:18.8–00:24.0 — GRANDEZA E DIVERSIDADE: mosaico 2×2 das quatro sedes.
  const SEDES = [
    { k: 'apPiscina', name: 'Alto Petrópolis', cx: 0.5, cy: 0.62, zoom: 1.0 },
    { k: 'moinhos', name: 'Moinhos de Vento', cx: 0.55, cy: 0.6, zoom: 1.0 },
    { k: 'tenis', name: 'União Petrópole', cx: 0.5, cy: 0.6, zoom: 1.0 },
    { k: 'ilha', name: 'Ilha do Pavão', cx: 0.5, cy: 0.6, zoom: 1.0 },
  ];
  function sSedes(t) {
    rect(FULL, C.paper);
    const top = 300, gap = 4, cw = (W - gap) / 2, ch = (H - top - gap) / 2;
    SEDES.forEach((s, i) => {
      const t0 = T.sedes + i * BEAT;            // uma sede por batida; todas em tela aos 20,9 s
      if (t < t0) return;
      const col = i % 2, row = Math.floor(i / 2);
      const cell = { x: col * (cw + gap), y: top + row * (ch + gap), w: cw, h: ch };
      const o = eOutQuart(prog(t, t0, t0 + 0.5));
      const r = { ...cell, w: cell.w * o, x: col === 0 ? cell.x : cell.x };
      const drift = prog(t, t0, T.cta);
      photo(img[s.k], r, { cx: s.cx + (i % 2 ? -1 : 1) * 0.04 * drift, cy: s.cy, zoom: s.zoom * lerp(1.1, 1.0, eOutCubic(prog(t, t0, t0 + 1.2))) * lerp(1, 1.03, drift), filter: GRADE });
      ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
      const g = ctx.createLinearGradient(0, cell.y, 0, cell.y + 170);
      g.addColorStop(0, 'rgba(16,42,59,.55)'); g.addColorStop(1, 'rgba(16,42,59,0)');
      ctx.fillStyle = g; ctx.fillRect(cell.x, cell.y, cell.w, 170);
      ctx.restore();
      const e = inOut(t, t0 + 0.25, Infinity, { dur: 0.4, rise: 8 });
      text(s.name, cell.x + (col === 0 ? SAFE_X : 56), cell.y + 72 + e.dy, { size: 40, alpha: e.a, shadow: 0.25 });
    });
    const a = inOut(t, T.sedes + 0.2, Infinity, { dur: 0.45, rise: 14 });
    text('4 sedes.', SAFE_X, 218 + a.dy, { size: 128, color: C.ink, alpha: a.a });
    const b = inOut(t, T.sedes + 1.4, Infinity, { dur: 0.45, rise: 10 });
    text('Muitos jeitos de viver o União.', W - SAFE_X, 210 + b.dy, { size: 52, color: C.muted, alpha: b.a, align: 'right', track: -0.01 });
  }

  // 00:24–00:30 — FECHAMENTO / CONVERSÃO.
  function sCTA(t) {
    const p = prog(t, T.cta, T.end);
    // Volta às piscinas-lagoa, mais perto das pessoas; no acorde de resolução a luz abre um pouco.
    const lum = eOutCubic(prog(t, T.acorde, T.acorde + 0.9));
    photo(img.lagoa, FULL, { cx: lerp(0.66, 0.7, p), cy: 0.58, zoom: lerp(1.07, 1.12, eOutCubic(p)),
      filter: `saturate(1.06) contrast(1.03) brightness(${(1.02 + 0.05 * lum).toFixed(3)})` });
    shade(0, 0, W * 0.72, 0, 0.7 - 0.06 * lum);
    shade(0, H, 0, H * 0.5, 0.4);

    // 24–26: convite
    const a = inOut(t, T.cta + 0.1, Infinity, { dur: 0.5, rise: 18 });
    const dim = lerp(1, 0.86, eOutCubic(prog(t, T.seja, T.seja + 0.5)));
    text('O próximo encontro pode ser o seu.', SAFE_X, 330 + a.dy, { size: 66, fam: 'serif', alpha: a.a * dim, shadow: 0.25 });

    // 26–28: headline protagonista
    const lines = ['Seja sócio', 'do União.'];
    const hs = 140;
    const b = inOut(t, T.seja, Infinity, { dur: 0.5, rise: 20 });
    text(lines[0], SAFE_X, 496 + b.dy, { size: hs, weight: 600, alpha: b.a, shadow: 0.25, track: -0.03 });
    text(lines[1], SAFE_X, 496 + hs * 1.0 + b.dy, { size: hs, weight: 600, alpha: b.a, shadow: 0.25, track: -0.03 });

    // 28–30: botão gráfico (expansão horizontal) + assinatura
    const label = 'Quero conhecer o União  →';
    const bs = 40, bw = measure(label, bs, 500, 'sans', 0) + 2 * 48, bh = 96, by = 728;
    const o = eOutCubic(prog(t, T.botao, T.botao + 0.5));
    if (o > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(8,22,32,.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 6;
      ctx.fillStyle = C.white;
      ctx.beginPath(); ctx.roundRect(SAFE_X, by, Math.max(bh * 0.3, bw * o), bh, 4); ctx.fill();
      ctx.restore();
      const l = prog(t, T.botao + 0.22, T.botao + 0.55);
      text(label, SAFE_X + 48, by + bh / 2 + bs * 0.36, { size: bs, color: C.blue, alpha: l, track: 0,
        runs: [{ text: 'Quero conhecer o União  ', color: C.blue }, { text: '→', color: C.blue }] });
    }
    const lg = inOut(t, T.botao + 0.15, Infinity, { dur: 0.6, rise: 10 });
    if (lg.a > 0) {
      const sh = 132, sy = H - 108 - sh + lg.dy, sw = sh * img.escudo.width / img.escudo.height;
      const sx = W - SAFE_X - sw;
      escudo(sx, sy, sh, lg.a, true);
      text('Grêmio Náutico União', sx - 30, sy + sh * 0.5, { size: 40, weight: 600, alpha: lg.a, align: 'right', track: -0.01, shadow: 0.3 });
      text('Porto Alegre, desde 1906', sx - 30, sy + sh * 0.5 + 44, { size: 28, alpha: lg.a * 0.9, align: 'right', track: 0, shadow: 0.3 });
    }
  }

  // Escudo discreto no canto, do mote até o fechamento.
  function bug(t) {
    const a = prog(t, T.mote + 0.3, T.mote + 0.8) * (1 - prog(t, T.cta - 0.25, T.cta));
    if (a <= 0) return;
    const h = 70, w = h * img.escudo.width / img.escudo.height;
    escudo(W - 72 - w, 56, h, a * 0.96, true);
  }

  function draw(t) {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (t < T.mote) sHook(t);
    else if (t < T.pisc) sMote(t);
    else if (t < T.amigos) sLazer(t);
    else if (t < T.parte) sConvivencia(t);
    else if (t < T.sedes) sParte(t);
    else if (t < T.cta) sSedes(t);
    else sCTA(t);
    bug(t);
    ctx.restore();
  }

  window.FILM = { W, H, FPS, DUR, T, draw, renderFrame: f => draw(f / FPS) };

  // ---------------------------------------------------------------- pré-visualização no navegador
  const render = new URLSearchParams(location.search).has('render');
  if (render) { document.body.classList.add('render'); return; }
  const audio = document.getElementById('a'), scrub = document.getElementById('scrub'), tc = document.getElementById('tc');
  let playing = false;
  document.getElementById('play').onclick = () => { playing = !playing; playing ? audio.play() : audio.pause(); };
  scrub.oninput = () => { audio.currentTime = +scrub.value; };
  window.filmReady.then(function loop() {
    const t = Math.min(DUR - 1 / FPS, audio.currentTime || +scrub.value);
    draw(t); tc.textContent = t.toFixed(2); if (playing) scrub.value = t;
    requestAnimationFrame(loop);
  });
})();
