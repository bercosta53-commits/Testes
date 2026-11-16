// Vídeo 1 · "Pré-aprovado" · ~24 s · linguagem das referências (lançamento SaaS premium)
// Tempos da locução ESTIMADOS: quando a locução do ElevenLabs chegar, só a tabela VO muda.
'use strict';

const VO = [
  /* 0 */ [0.25, 1.45, 'Crédito pré-aprovado.'],
  /* 1 */ [1.55, 3.0, 'Oferta disparada no WhatsApp.'],
  /* 2 */ [3.2, 4.3, 'E o agente de IA responde:'],
  /* 3 */ [4.35, 6.0, 'Não entendi. Responda SIM ou NÃO.', { hide: true }],
  /* 4 */ [6.5, 7.5, 'Na Viacredi, a saída foi'],
  /* 5 */ [7.5, 8.9, 'menos regra e mais contexto.', { hide: true }],
  /* 6 */ [9.2, 10.9, 'Eles escreveram o papel do agente:'],
  /* 7 */ [10.95, 12.8, 'objetivo, público, oferta, tom.', { hide: true }],
  /* 8 */ [13.2, 15.2, 'E a conversa passou a seguir o cooperado.'],
  /* 9 */ [15.6, 18.0, 'Resultado: mais de 150 mil reais em crédito,', { hide: true }],
  /* 10 */ [18.0, 19.3, 'ainda na fase de testes.', { hide: true }],
  /* 11 */ [19.9, 21.4, 'O método está no playbook.', { hide: true }],
  /* 12 */ [21.5, 22.3, 'Baixe grátis.', { hide: true }],
];
const DUR = 24;
const CX = 540;

function blobSVG(parent, color) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 100 100');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', 'M50 6C76 6 94 24 94 49C94 73 75 90 51 90C45 90 40 89 35 87L18 96L22 80C11 72 6 61 6 49C6 24 24 6 50 6Z');
  p.setAttribute('fill', color); s.appendChild(p); parent.appendChild(s);
  s.style.position = 'absolute'; return s;
}

boot(() => {
  ENGINE.capMode = 'build';
  ENGINE.init({ dur: DUR, captions: VO });

  // 01 · Fila de pré-aprovados → seleção → disparo ----------------------------
  ENGINE.scene(0, 3.15, 'light', cam => {
    const cards = [];
    for (let i = 0; i < 7; i++) {
      const c = pos(h('div', 'mini' + (i === 3 ? ' sel-target' : ''), cam), 390 + (i - 3) * 336, 760);
      c.innerHTML = '<div class="av"></div><div class="nm"></div><div class="tag">Pré-aprovado</div><div class="val">R$ ' + ['8.000', '12.000', '5.500', '15.000', '9.000', '20.000', '7.500'][i] + '</div><div class="ln"></div>';
      cards.push({ c, i, d: Math.abs(i - 3) });
    }
    const frame = pos(h('div', 'selframe', cam), 390 - 24, 760 - 24, 348, 408);
    const sent = h('div', 'center', cam, '<span style="display:inline-flex;align-items:center;gap:18px;font:600 40px Poppins;color:#0b6b3a;background:#d9fdd3;padding:22px 36px;border-radius:999px">✓✓ Enviada</span>');
    pos(sent, 0, 900);
    return {
      update(lt, t) {
        const kin = enter(t, 0.05, 0.9, E.outExpo);
        const sel = t >= wt(0, 1);
        const launch = wt(1, 1);
        cards.forEach(o => {
          o.c.classList.toggle('sel', o.i === 3 && sel);
          const base = o.i === 3 ? 1 : lerp(1, 0.9, clamp(o.d / 3));
          const p = prog(t, launch + o.d * 0.06, launch + o.d * 0.06 + 0.55);
          const up = E.inCubic(p);
          tf(o.c, { x: (1 - kin) * 420, y: -1500 * up, s: base * (o.i === 3 && sel ? 1 + 0.04 * E.outBack(prog(t, wt(0, 1), wt(0, 1) + 0.35)) : 1), r: (o.i - 3) * 6 * up, o: lerp(1, o.i === 3 ? 1 : 0.55, sel ? enter(t, wt(0, 1), 0.3) : 0) });
        });
        const kf = E.outBack(prog(t, wt(0, 1), wt(0, 1) + 0.4));
        const fp = E.inCubic(prog(t, launch, launch + 0.55));
        tf(frame, { s: lerp(1.3, 1, kf) * (1 + 0.04 * E.outBack(prog(t, wt(0, 1), wt(0, 1) + 0.35))), y: -1500 * fp, o: clamp(kf * 3) });
        const ks = E.outBack(prog(t, launch + 0.75, launch + 1.15));
        tf(sent, { s: 0.6 + 0.4 * ks, o: clamp(ks * 2) });
      },
    };
  });

  // 02 · O robô ---------------------------------------------------------------
  ENGINE.scene(3.15, 6.6, 'dark', cam => {
    const mk = () => { const g = h('div', 'abs', cam); pos(g, 0, 0, 1080, 1920); return g; };
    const ghosts = [mk(), mk()].map(g => { g.style.opacity = 0; return g; });
    const main = mk();
    const build = g => {
      const l = h('div', 'center giant', g, 'Não entendi.'); l.style.color = '#f4f2ee';
      const s = fit(l, 900); pos(l, 0, 720); l.style.fontSize = s + 'px'; l.style.width = '1080px';
      const pills = ['SIM', 'NÃO'].map((txt, i) => {
        const p = pos(h('div', 'pill', g), 120 + i * 440, 1000, 400, 150);
        Object.assign(p.style, { border: '5px solid #3b3b3b', color: '#cfcfcf', font: '600 64px Poppins', display: 'grid', placeItems: 'center' });
        p.textContent = txt; return p;
      });
      return { l, pills };
    };
    const M = build(main), G = ghosts.map(build);
    const blob = blobSVG(cam, 'var(--y)'); pos(blob, CX - 60, 900, 120, 120);
    return {
      update(lt, t) {
        const kl = enter(t, wt(3, 0), 0.4);
        tf(M.l, { y: (1 - kl) * 40, o: kl });
        M.pills.forEach((p, i) => { const k = E.outBack(prog(t, wt(3, 3 + i * 2), wt(3, 3 + i * 2) + 0.35)); tf(p, { s: 0.7 + 0.3 * k, o: clamp(k * 2) }); });
        // loop do bot: tremidas secas com eco
        const glitches = [5.25, 5.6, 5.9];
        let gk = 0; glitches.forEach(g => { if (t >= g && t < g + 0.12) gk = 1; });
        ghosts.forEach((g, i) => {
          g.style.opacity = gk ? 0.28 : 0;
          tf(g, { x: gk ? (i ? -16 : 22) : 0, y: gk ? (i ? 10 : -8) : 0 });
          G[i].l.style.opacity = M.l.style.opacity; G[i].pills.forEach((p, j) => { p.style.opacity = M.pills[j].style.opacity; });
        });
        tf(main, { x: gk ? 6 : 0 });
        // transição: a forma da marca cresce do centro e cobre o quadro
        const kb = E.inOutExpo(prog(t, 6.2, 6.55));
        tf(blob, { s: kb * 26, o: kb > 0 ? 1 : 0 });
      },
    };
  });

  // 03 · Menos regra, mais contexto ------------------------------------------
  ENGINE.scene(6.38, 9.15, 'light', (cam, el) => {
    const N = 9, bars = [];
    const hs = [300, 420, 250, 380, 460, 330, 400, 270, 350];
    for (let i = 0; i < N; i++) {
      const b = h('div', 'pill', cam);
      bars.push({ b, x: CX - (N * 56 + (N - 1) * 30) / 2 + i * 86, hh: hs[i] });
    }
    const lab = h('div', 'center small', cam, 'regras'); pos(lab, 0, 1170);
    const pillY = h('div', 'pill', cam); pillY.style.background = 'var(--y)';
    const word = maskLine(cam, 'center giant', 'contexto.'); pos(word.m, 0, 790);
    const ws = fit(word.i, 780); word.m.style.width = '1080px';
    return {
      update(lt, t) {
        el.style.clipPath = `circle(${E.inOutExpo(prog(t, 6.38, 6.75)) * 1400}px at 50% 52%)`;
        const coll = wt(5, 0), more = wt(5, 3);
        bars.forEach((o, i) => {
          const kin = E.outExpo(prog(t, 6.55 + i * 0.04, 6.95 + i * 0.04));
          const kc = E.inOutCubic(prog(t, coll + i * 0.03, coll + 0.4 + i * 0.03));
          const km = E.inOutExpo(prog(t, more - 0.05, more + 0.3));
          const hh = lerp(o.hh * kin, 56, kc);
          const x = lerp(o.x, CX - 28, km);
          Object.assign(o.b.style, { left: x + 'px', top: 960 - hh / 2 + 'px', width: '56px', height: hh + 'px', background: kc > 0.5 ? '#bdb8ae' : 'var(--ink)', opacity: 1 - km });
        });
        op(lab, enter(t, 6.9, 0.4) * (1 - enter(t, coll, 0.3)));
        const kp = E.outExpo(prog(t, more + 0.15, more + 0.7));
        const pw = lerp(56, 940, kp), ph = lerp(56, ws * 1.25, kp);
        Object.assign(pillY.style, { left: CX - pw / 2 + 'px', top: 960 - ph / 2 + 'px', width: pw + 'px', height: ph + 'px', opacity: prog(t, more, more + 0.05) });
        word.m.style.top = 960 - ws * 0.55 + 'px';
        maskT(word, enter(t, more + 0.3, 0.5));
      },
    };
  });

  // 04 · O papel do agente -----------------------------------------------------
  ENGINE.scene(9.15, 13.1, 'light', cam => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('width', 1080); svg.setAttribute('height', 1920);
    svg.style.position = 'absolute'; svg.style.left = svg.style.top = 0; cam.appendChild(svg);
    const icon = h('div', 'abs', cam);
    pos(icon, CX - 110, 690 - 110, 220, 220);
    Object.assign(icon.style, { borderRadius: '50%', background: 'var(--y)', display: 'grid', placeItems: 'center', font: '600 110px Poppins', boxShadow: 'var(--soft-shadow)' });
    icon.textContent = '✦';
    const F = ['Objetivo', 'Público', 'Oferta', 'Tom', 'Transbordo', 'Fechamento'];
    const P = [[255, 520], [825, 520], [205, 700], [875, 700], [255, 880], [825, 880]];
    const chips = F.map((f, i) => {
      const c = h('div', 'abs shadow', cam);
      Object.assign(c.style, { background: '#fff', borderRadius: '999px', padding: '18px 28px', font: '600 32px Poppins', whiteSpace: 'nowrap', display: 'flex', gap: '12px', alignItems: 'center' });
      c.innerHTML = `<span style="color:#a39b8f">0${i + 1}</span>${f}`;
      const w = c.offsetWidth, hh = c.offsetHeight;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', CX); line.setAttribute('y1', 690); line.setAttribute('stroke', '#d6d2c9'); line.setAttribute('stroke-width', 3);
      svg.appendChild(line);
      const at = i < 4 ? wt(7, i) : wt(7, 3) + 0.22 + (i - 4) * 0.12;
      return { c, w, hh, x: P[i][0], y: P[i][1], at, line };
    });
    const big = F.slice(0, 4).map((f, i) => { const g = h('div', 'center giant', cam, f + '.'); g.style.fontSize = '170px'; pos(g, 0, 1010); return { g, at: wt(7, i) }; });
    return {
      update(lt, t) {
        const ki = E.outBack(prog(t, 9.3, 9.75));
        tf(icon, { s: ki, o: clamp(ki * 2) });
        chips.forEach(o => {
          const k = E.outExpo(prog(t, o.at, o.at + 0.5));
          const x = lerp(CX, o.x, k), y = lerp(690, o.y, k);
          o.c.style.left = x - o.w / 2 + 'px'; o.c.style.top = y - o.hh / 2 + 'px';
          tf(o.c, { s: 0.6 + 0.4 * k, o: t >= o.at ? clamp(k * 3) : 0 });
          o.line.setAttribute('x2', x); o.line.setAttribute('y2', y); o.line.style.opacity = t >= o.at ? k : 0;
        });
        big.forEach((b, i) => {
          const next = big[i + 1] ? big[i + 1].at : b.at + 0.75;
          const on = t >= b.at && t < next;
          b.g.style.visibility = on ? 'visible' : 'hidden';
          tf(b.g, { s: on ? lerp(1.08, 1, E.outExpo(prog(t, b.at, b.at + 0.3))) : 1 });
        });
      },
    };
  });

  // 05 · A conversa segue o cooperado ------------------------------------------
  ENGINE.scene(13.1, 15.55, 'light', cam => {
    const card = pos(h('div', 'abs shadow', cam), 110, 480, 860, 740);
    Object.assign(card.style, { background: '#efeae2', borderRadius: '44px', overflow: 'hidden', transformOrigin: '50% 100%' });
    const head = pos(h('div', 'abs', card), 0, 0, 860, 116);
    Object.assign(head.style, { background: '#fff', display: 'flex', alignItems: 'center', gap: '18px', padding: '0 34px', font: '600 34px Poppins' });
    head.innerHTML = '<span style="width:64px;height:64px;border-radius:50%;background:var(--y);display:grid;place-items:center;font-size:30px">✦</span>Agente Viacredi <span style="color:#25d366">●</span>';
    const msgs = [
      [13.25, 'me', 'Estou reformando a cozinha.'],
      [13.75, 'bot', 'Que legal! Cozinha nova é um projeto e tanto.'],
      [14.25, 'bot', 'Essa linha de crédito pode ajudar com os gastos da reforma. Quer ver as condições?'],
      [14.85, 'me', 'Quero! Vou contratar para terminar a obra.'],
    ];
    let y = 148;
    const els = msgs.map(([at, who, txt]) => {
      const b = h('div', 'bubble ' + who, card, txt);
      Object.assign(b.style, { fontSize: '34px', maxWidth: '620px', padding: '20px 28px 18px', borderRadius: '26px', top: y + 'px' });
      if (who === 'me') b.style.right = '30px'; else b.style.left = '30px';
      y += b.offsetHeight + 18;
      return { b, at };
    });
    const note = h('div', 'center', cam, 'Reconstituição a partir do relato do projeto.'); pos(note, 0, 1250);
    Object.assign(note.style, { font: '500 22px Poppins', color: '#8d8a83' });
    return {
      update(lt, t) {
        const k = enter(t, 13.12, 0.6);
        card.style.transform = `perspective(1400px) translateY(${(1 - k) * 120}px) rotateX(${(1 - k) * 18}deg)`;
        card.style.opacity = clamp(k * 2);
        els.forEach(o => { const kb = E.outBack(prog(t, o.at, o.at + 0.35)); tf(o.b, { s: 0.85 + 0.15 * kb, o: t >= o.at ? clamp(kb * 2) : 0 }); o.b.style.transformOrigin = o.b.classList.contains('me') ? '100% 100%' : '0 100%'; });
        op(note, enter(t, 13.5, 0.4));
      },
    };
  });

  // 06 · Contratado → + R$ 150 mil ---------------------------------------------
  ENGINE.scene(15.55, 19.75, 'light', cam => {
    const A = h('div', 'abs', cam); pos(A, 0, 0, 1080, 1920);
    const lab = h('div', 'center small', A, 'Resultado'); pos(lab, 0, 330);
    const tk = buildTicket(A, 160, 560); tk.el.style.boxShadow = 'var(--soft-shadow)'; tk.el.style.border = '0';
    const fr = pos(h('div', 'selframe', A), 160 - 26, 560 - 26, 812, tk.el.offsetHeight + 52);
    const B = h('div', 'abs', cam); pos(B, 0, 0, 1080, 1920);
    const pre = h('div', 'center small', B, 'mais de'); pos(pre, 0, 640);
    const num = h('div', 'center giant', B, 'R$ 150 mil'); const ns = fit(num, 940); num.style.width = '1080px'; pos(num, 0, 720);
    const bar = pos(h('div', 'pill', B), CX - 300, 720 + ns * 0.98, 600, 22); bar.style.background = 'var(--y)';
    const post = h('div', 'center small', B, 'em crédito liberado, ainda na fase de testes.'); pos(post, 0, 760 + ns * 1.05);
    const foot = h('div', 'center', B, 'Os resultados da Viacredi não constituem projeção para outras instituições.'); pos(foot, 0, 1300);
    Object.assign(foot.style, { font: '500 22px Poppins', color: '#8d8a83' });
    const cut = 16.75;
    return {
      update(lt, t) {
        const a = t < cut; A.style.display = a ? 'block' : 'none'; B.style.display = a ? 'none' : 'block';
        const k = enter(t, 15.58, 0.5);
        tf(tk.el, { y: (1 - k) * 90, o: k });
        op(lab, k);
        const flip = prog(t, 15.95, 16.3);
        tk.set({ flip, status: flip > 0.5 ? '✓ Contratado' : '✓✓ Enviada' });
        const kf = E.outBack(prog(t, 15.95, 16.35));
        tf(fr, { s: lerp(1.15, 1, kf), o: clamp(kf * 3) });
        fr.style.background = flip > 0.5 ? 'rgba(253,195,72,.12)' : 'transparent';
        const n = Math.round(150 * E.outExpo(prog(t, cut, cut + 1.1)));
        num.textContent = `R$ ${n} mil`;
        tf(num, { s: lerp(1.06, 1, E.outExpo(prog(t, cut, cut + 0.5))) });
        op(pre, enter(t, cut, 0.3));
        const kb = E.outExpo(prog(t, cut + 0.5, cut + 1.1)); bar.style.transform = `scaleX(${kb})`;
        const kp = enter(t, cut + 0.9, 0.4); tf(post, { y: (1 - kp) * 20, o: kp });
        op(foot, enter(t, cut + 1.3, 0.4));
      },
    };
  }, { captions: false });

  // 07 · CTA ------------------------------------------------------------------
  ENGINE.scene(19.75, DUR, 'light', cam => {
    const glow = pos(h('div', 'abs', cam), -200, 300, 1480, 1100);
    glow.style.background = 'radial-gradient(closest-side, rgba(253,195,72,.55), rgba(253,195,72,0))';
    const cover = pos(h('div', 'abs', cam), 110, 330, 860, 484);
    Object.assign(cover.style, { borderRadius: '28px', backgroundImage: 'url(../assets/capa.jpg)', backgroundSize: 'cover', boxShadow: 'var(--soft-shadow)', transformOrigin: '50% 100%' });
    const title = h('div', 'center', cam, 'Como vender crédito no WhatsApp<br>com agentes de IA'); pos(title, 0, 880);
    Object.assign(title.style, { font: '600 54px/1.15 Poppins', letterSpacing: '-0.03em' });
    const btn = pos(h('div', 'abs', cam), CX - 340, 1050, 680, 124);
    Object.assign(btn.style, { background: 'var(--ink)', color: 'var(--y)', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px', font: '600 46px Poppins', letterSpacing: '-0.01em' });
    btn.innerHTML = 'Baixe o playbook grátis <span class="ar">→</span>';
    const arrow = btn.querySelector('.ar'); arrow.style.display = 'inline-block';
    const logos = pos(h('div', 'abs', cam), 0, 1250, 1080, 70);
    Object.assign(logos.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '36px' });
    logos.innerHTML = '<img src="../assets/ubots-logo.png" style="height:54px"><i style="width:2px;height:56px;background:#d6d2c9"></i><img src="../assets/viacredi-logo.png" style="height:68px">';
    const t0 = 19.75, press = wt(12, 0);
    return {
      update(lt, t) {
        glow.style.opacity = enter(t, t0, 1.2, E.outCubic);
        const kc = enter(t, t0 + 0.05, 0.8);
        cover.style.transform = `perspective(1600px) translateY(${(1 - kc) * 160}px) rotateX(${(1 - kc) * 24}deg)`; cover.style.opacity = clamp(kc * 2);
        const kt = enter(t, t0 + 0.35, 0.5); tf(title, { y: (1 - kt) * 30, o: kt });
        const kb = E.outBack(prog(t, t0 + 0.6, t0 + 1.0));
        const pr = 1 - 0.04 * Math.sin(Math.PI * prog(t, press, press + 0.22));
        tf(btn, { s: (0.8 + 0.2 * kb) * pr, o: clamp(kb * 2) });
        tf(arrow, { x: 16 * Math.sin(Math.PI * prog(t, press, press + 0.3)) });
        const kl = enter(t, t0 + 0.9, 0.5); tf(logos, { y: (1 - kl) * 20, o: kl });
      },
    };
  }, { captions: false });
});
