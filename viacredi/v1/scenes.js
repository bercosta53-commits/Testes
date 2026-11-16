// Vídeo 1 · "Pré-aprovado" · 32 s · linguagem das referências (lançamento SaaS premium)
// Ritmo em ondas: minimalista (uma ideia por quadro) ↔ carregado (tela de produto).
// Tempos da locução ESTIMADOS: quando a locução do ElevenLabs chegar, só a tabela VO muda.
// Tempo de leitura mínimo: palavra/número gigante ≥ 1,5 s; frase ≥ 1 s após a última palavra;
// tela de produto ≥ 2,5 s inteira na tela.
'use strict';

const VO = [
  /* 0 */ [0.3, 1.5, 'Crédito pré-aprovado.'],
  /* 1 */ [1.6, 3.0, 'Oferta disparada no WhatsApp.'],
  /* 2 */ [3.75, 4.85, 'E o agente de IA responde:'],
  /* 3 */ [4.95, 6.65, 'Não entendi. Responda SIM ou NÃO.', { hide: true }],
  /* 4 */ [7.5, 8.5, 'Na Viacredi, a saída foi'],
  /* 5 */ [8.5, 10.0, 'menos regra e mais contexto.', { hide: true }],
  /* 6 */ [11.3, 12.9, 'Eles escreveram o papel do agente:'],
  /* 7 */ [13.0, 14.8, 'objetivo, público, oferta, tom.', { hide: true }],
  /* 8 */ [17.6, 19.7, 'E a conversa passou a seguir o cooperado.'],
  /* 9 */ [22.3, 24.5, 'Resultado: mais de 150 mil reais em crédito,', { hide: true }],
  /* 10 */ [24.5, 25.6, 'ainda na fase de testes.', { hide: true }],
  /* 11 */ [28.7, 30.2, 'O método está no playbook.', { hide: true }],
  /* 12 */ [30.3, 31.1, 'Baixe grátis.', { hide: true }],
];
const DUR = 32;
const CX = 540;

function blobSVG(parent, color) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 100 100');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', 'M50 6C76 6 94 24 94 49C94 73 75 90 51 90C45 90 40 89 35 87L18 96L22 80C11 72 6 61 6 49C6 24 24 6 50 6Z');
  p.setAttribute('fill', color); s.appendChild(p); parent.appendChild(s);
  s.style.position = 'absolute'; return s;
}
function svgLayer(parent) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', 1080); s.setAttribute('height', 1920);
  Object.assign(s.style, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
  parent.appendChild(s); return s;
}
function svgEl(svg, tag, attrs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  svg.appendChild(e); return e;
}
function cursor(parent) {
  const c = h('div', 'abs', parent);
  c.innerHTML = '<svg width="54" height="64" viewBox="0 0 27 32"><path d="M2 2 L2 26 L8.5 20 L13 30 L17 28 L12.5 18.5 L21 18.5 Z" fill="#070401" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';
  c.style.zIndex = 4; return c;
}
// box relativo ao palco (sem as transformações de câmera, medido na montagem)
function rel(e) {
  const r = e.getBoundingClientRect(), s = ENGINE.stage.getBoundingClientRect();
  return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
}
// digita um texto: k de 0 a 1
function typeIn(el, full, k, caret = true) {
  const n = Math.round(full.length * clamp(k));
  el.innerHTML = full.slice(0, n) + (caret && k > 0 && k < 1 ? '<span class="caret"></span>' : '');
}

boot(() => {
  ENGINE.capMode = 'build';
  ENGINE.init({ dur: DUR, captions: VO });

  // 01 · Fila de pré-aprovados → seleção → disparo  (minimalista) ---------------
  ENGINE.scene(0, 3.6, 'light', cam => {
    const cards = [];
    for (let i = 0; i < 7; i++) {
      const c = pos(h('div', 'mini', cam), 390 + (i - 3) * 336, 780);
      c.innerHTML = '<div class="av"></div><div class="nm"></div><div class="tag">Pré-aprovado</div><div class="val">R$ ' + ['8.000', '12.000', '5.500', '15.000', '9.000', '20.000', '7.500'][i] + '</div><div class="ln"></div>';
      cards.push({ c, i, d: Math.abs(i - 3) });
    }
    const frame = pos(h('div', 'selframe', cam), 390 - 24, 780 - 24, 348, 408);
    const sent = h('div', 'center', cam, '<span style="display:inline-flex;align-items:center;gap:18px;font:600 44px Poppins;color:#0b6b3a;background:#d9fdd3;padding:24px 40px;border-radius:999px">✓✓ Enviada para a base</span>');
    pos(sent, 0, 900);
    return {
      update(lt, t) {
        const kin = enter(t, 0.05, 1.0, E.outExpo);
        const selT = wt(0, 1), sel = t >= selT;
        const launch = wt(1, 1) + 0.1;
        cards.forEach(o => {
          o.c.classList.toggle('sel', o.i === 3 && sel);
          const base = o.i === 3 ? 1 : lerp(1, 0.9, clamp(o.d / 3));
          const up = E.inCubic(prog(t, launch + o.d * 0.07, launch + o.d * 0.07 + 0.6));
          const pop = o.i === 3 && sel ? 1 + 0.04 * E.outBack(prog(t, selT, selT + 0.35)) : 1;
          tf(o.c, { x: (1 - kin) * 420, y: -1500 * up, s: base * pop, r: (o.i - 3) * 6 * up, o: lerp(1, o.i === 3 ? 1 : 0.55, sel ? enter(t, selT, 0.3) : 0) });
        });
        const kf = E.outBack(prog(t, selT, selT + 0.4));
        const fp = E.inCubic(prog(t, launch, launch + 0.6));
        tf(frame, { s: lerp(1.3, 1, kf) * (1 + 0.04 * E.outBack(prog(t, selT, selT + 0.35))), y: -1500 * fp, o: clamp(kf * 3) });
        const ks = E.outBack(prog(t, launch + 0.55, launch + 0.95));
        tf(sent, { s: 0.6 + 0.4 * ks, o: clamp(ks * 2) });
      },
    };
  });

  // 02 · O robô  (minimalista, escuro) ---------------------------------------
  ENGINE.scene(3.6, 7.25, 'dark', cam => {
    const mk = () => { const g = h('div', 'abs', cam); pos(g, 0, 0, 1080, 1920); return g; };
    const ghosts = [mk(), mk()];
    const main = mk();
    const build = g => {
      const l = h('div', 'center giant', g, 'Não entendi.'); l.style.color = '#f4f2ee';
      const s = fit(l, 900); pos(l, 0, 740); l.style.fontSize = s + 'px';
      const pills = ['SIM', 'NÃO'].map((txt, i) => {
        const p = pos(h('div', 'pill', g), 120 + i * 440, 1010, 400, 150);
        Object.assign(p.style, { border: '5px solid #3b3b3b', color: '#cfcfcf', font: '600 64px Poppins', display: 'grid', placeItems: 'center' });
        p.textContent = txt; return p;
      });
      return { l, pills };
    };
    const M = build(main), G = ghosts.map(build);
    // indicador "digitando…" enquanto a frase-guia se monta
    const typing = h('div', 'center', cam, '<span style="display:inline-flex;gap:16px;background:#1d1d1d;padding:30px 40px;border-radius:40px"><i></i><i></i><i></i></span>');
    pos(typing, 0, 820);
    const dots = [...typing.querySelectorAll('i')];
    dots.forEach(d => Object.assign(d.style, { width: '22px', height: '22px', borderRadius: '50%', background: '#8a8a8a', display: 'block' }));
    const blob = blobSVG(cam, 'var(--y)'); pos(blob, CX - 60, 900, 120, 120);
    return {
      update(lt, t) {
        const t0 = wt(3, 0);
        const ky = enter(t, 3.7, 0.35) * (1 - enter(t, t0 - 0.15, 0.15));
        tf(typing, { s: 0.8 + 0.2 * ky, o: ky });
        dots.forEach((d, i) => { d.style.transform = `translateY(${-10 * Math.max(0, Math.sin(t * 9 - i * 0.9))}px)`; });
        const kl = enter(t, t0, 0.4);
        tf(M.l, { y: (1 - kl) * 40, o: kl });
        M.pills.forEach((p, i) => { const a = wt(3, 3 + i * 2); const k = E.outBack(prog(t, a, a + 0.35)); tf(p, { s: 0.7 + 0.3 * k, o: clamp(k * 2) }); });
        // loop do bot: tremidas secas com eco
        let gk = 0; [6.68, 6.84, 6.98].forEach(g => { if (t >= g && t < g + 0.12) gk = 1; });
        ghosts.forEach((g, i) => {
          g.style.opacity = gk ? 0.28 : 0;
          tf(g, { x: gk ? (i ? -16 : 22) : 0, y: gk ? (i ? 10 : -8) : 0 });
          G[i].l.style.opacity = M.l.style.opacity; G[i].pills.forEach((p, j) => { p.style.opacity = M.pills[j].style.opacity; });
        });
        tf(main, { x: gk ? 6 : 0 });
        const kb = E.inOutExpo(prog(t, 6.92, 7.25));
        tf(blob, { s: kb * 26, o: kb > 0 ? 1 : 0 });
      },
    };
  });

  // 03 · Menos regra, mais contexto  (minimalista) ----------------------------
  ENGINE.scene(7.05, 11.1, 'light', (cam, el) => {
    const N = 9, bars = [];
    const hs = [300, 420, 250, 380, 460, 330, 400, 270, 350];
    for (let i = 0; i < N; i++) bars.push({ b: h('div', 'pill', cam), x: CX - (N * 56 + (N - 1) * 30) / 2 + i * 86, hh: hs[i] });
    const lab = h('div', 'center small', cam, 'regras do agente'); pos(lab, 0, 1190);
    const pillY = h('div', 'pill', cam); pillY.style.background = 'var(--y)';
    const word = maskLine(cam, 'center giant', 'contexto.'); pos(word.m, 0, 790);
    const ws = fit(word.i, 780); word.m.style.width = '1080px';
    return {
      update(lt, t) {
        el.style.clipPath = `circle(${E.inOutExpo(prog(t, 7.05, 7.43)) * 1400}px at 50% 52%)`;
        const coll = wt(5, 0), more = wt(5, 3);
        bars.forEach((o, i) => {
          const kin = E.outExpo(prog(t, 7.3 + i * 0.05, 7.75 + i * 0.05));
          const kc = E.inOutCubic(prog(t, coll + i * 0.03, coll + 0.4 + i * 0.03));
          const km = E.inOutExpo(prog(t, more - 0.05, more + 0.3));
          const hh = lerp(o.hh * kin, 56, kc);
          Object.assign(o.b.style, { left: lerp(o.x, CX - 28, km) + 'px', top: 960 - hh / 2 + 'px', width: '56px', height: hh + 'px', background: kc > 0.5 ? '#bdb8ae' : 'var(--ink)', opacity: 1 - km });
        });
        op(lab, enter(t, 7.7, 0.4) * (1 - enter(t, coll, 0.3)));
        const kp = E.outExpo(prog(t, more + 0.15, more + 0.7));
        const pw = lerp(56, 940, kp), ph = lerp(56, ws * 1.25, kp);
        Object.assign(pillY.style, { left: CX - pw / 2 + 'px', top: 960 - ph / 2 + 'px', width: pw + 'px', height: ph + 'px', opacity: prog(t, more, more + 0.05) });
        word.m.style.top = 960 - ws * 0.55 + 'px';
        maskT(word, enter(t, more + 0.3, 0.5));
      },
    };
  });

  // 04 · O papel do agente: minimalista → Agent Builder (carregado) -------------
  ENGINE.scene(11.1, 17.5, 'light', cam => {
    const A = h('div', 'abs', cam); pos(A, 0, 0, 1080, 1920); A.style.transformOrigin = '50% 40%';
    const svg = svgLayer(A);
    const icon = pos(h('div', 'abs', A), CX - 110, 690 - 110, 220, 220);
    Object.assign(icon.style, { borderRadius: '50%', background: 'var(--y)', display: 'grid', placeItems: 'center', font: '600 110px Poppins', boxShadow: 'var(--soft-shadow)' });
    icon.textContent = '✦';
    const F = ['Objetivo', 'Público', 'Oferta', 'Tom', 'Transbordo', 'Fechamento'];
    const P = [[255, 520], [825, 520], [205, 700], [875, 700], [255, 880], [825, 880]];
    const chips = F.map((f, i) => {
      const c = h('div', 'abs shadow', A);
      Object.assign(c.style, { background: '#fff', borderRadius: '999px', padding: '18px 28px', font: '600 32px Poppins', whiteSpace: 'nowrap', display: 'flex', gap: '12px', alignItems: 'center' });
      c.innerHTML = `<span style="color:#a39b8f">0${i + 1}</span>${f}`;
      const line = svgEl(svg, 'line', { x1: CX, y1: 690, stroke: '#d6d2c9', 'stroke-width': 3 });
      const at = i < 4 ? wt(7, i) : wt(7, 3) + 0.3 + (i - 4) * 0.15;
      return { c, w: c.offsetWidth, hh: c.offsetHeight, x: P[i][0], y: P[i][1], at, line };
    });
    const big = F.slice(0, 4).map((f, i) => { const g = h('div', 'center giant', A, f + '.'); g.style.fontSize = '170px'; pos(g, 0, 1010); return { g, at: wt(7, i) }; });

    // Agent Builder (tela de produto)
    const R = wt(7, 3) + 0.55;
    const app = pos(h('div', 'app', cam), 60, 300, 960, 1110);
    app.innerHTML = `
      <div class="app-top"><img src="../assets/ubots-logo.png"><span class="sep"></span><span>Agent Builder</span><span>›</span><b>Agente de Crédito · Viacredi</b><span class="av"></span></div>
      <div class="app-h"><span class="t">Papel do agente</span><span class="st">Em teste</span><span class="btn">Salvar</span></div>
      <div class="tabs"><span class="on">Papel</span><span>Guardrails</span><span>Conversas de teste</span><span>Indicadores</span></div>
      <div class="fields"></div>
      <div class="guard"><div class="gt">🛡 Guardrails críticos · o que nunca muda</div></div>`;
    const V = [
      'Entender o plano do cooperado e mostrar se a linha ajuda.',
      'Cooperados com crédito pré-aprovado, já com filtro de risco.',
      'Linha pré-aprovada, com juros e IOF na simulação.',
      'Próximo e simples, como um bom atendente da cooperativa.',
      'Comparar linhas ou caso fora do escopo: time de negócios.',
      'Contratação 100% pelo app, o canal seguro.',
    ];
    const fv = F.map((f, i) => {
      const d = h('div', 'field', app.querySelector('.fields'), `<div class="fl"><i>0${i + 1}</i>${f}</div><div class="fv"></div>`);
      return { d, v: d.querySelector('.fv'), full: V[i], at: R + 0.25 + i * 0.08 };
    });
    const G = ['Não pede nem expõe dados sensíveis', 'Transparência sobre juros, IOF e custos', 'Contratação só pelo canal seguro', 'Condições especiais vão para análise humana'];
    const gi = G.map((g, i) => ({ e: h('div', 'gi', app.querySelector('.guard'), `<b>✓</b>${g}`), at: R + 0.6 + i * 0.1 }));
    const btn = app.querySelector('.btn');
    const toast = h('div', 'abs', cam, '✓ Papel do agente salvo'); pos(toast, 0, 0);
    Object.assign(toast.style, { left: '50%', top: '1478px', transform: 'translateX(-50%)', font: '600 28px Poppins', background: 'var(--ink)', color: 'var(--y)', padding: '18px 30px', borderRadius: '99px', whiteSpace: 'nowrap' });
    const note = h('div', 'illus', cam, 'Exemplo ilustrativo'); pos(note, 72, 1430);
    const cur = cursor(cam);
    const bR = { x: 60 + 960 - 30 - 110, y: 300 + 84 + 26 + 26 };
    const click = R + 1.55;
    return {
      update(lt, t) {
        // parte minimalista
        const ki = E.outBack(prog(t, 11.3, 11.75));
        tf(icon, { s: ki, o: clamp(ki * 2) });
        chips.forEach(o => {
          const k = E.outExpo(prog(t, o.at, o.at + 0.5));
          const x = lerp(CX, o.x, k), y = lerp(690, o.y, k);
          o.c.style.left = x - o.w / 2 + 'px'; o.c.style.top = y - o.hh / 2 + 'px';
          tf(o.c, { s: 0.6 + 0.4 * k, o: t >= o.at ? clamp(k * 3) : 0 });
          o.line.setAttribute('x2', x); o.line.setAttribute('y2', y); o.line.style.opacity = t >= o.at ? k : 0;
        });
        big.forEach((b, i) => {
          const next = big[i + 1] ? big[i + 1].at : b.at + 0.9;
          const on = t >= b.at && t < next;
          b.g.style.visibility = on ? 'visible' : 'hidden';
          tf(b.g, { s: on ? lerp(1.08, 1, E.outExpo(prog(t, b.at, b.at + 0.3))) : 1 });
        });
        // passagem para o produto: o diagrama recua, a tela sobe
        const kx = E.inOutCubic(prog(t, R - 0.1, R + 0.45));
        tf(A, { s: 1 - 0.35 * kx, y: -200 * kx, o: 1 - kx });
        const ka = E.outExpo(prog(t, R, R + 0.7));
        app.style.transform = `perspective(1800px) translateY(${(1 - ka) * 220}px) rotateX(${(1 - ka) * 14}deg) scale(${0.94 + 0.06 * ka})`;
        app.style.opacity = clamp(ka * 1.6);
        note.style.opacity = clamp(ka * 1.6);
        fv.forEach(o => typeIn(o.v, o.full, prog(t, o.at, o.at + 0.4)));
        gi.forEach(o => { const k = enter(t, o.at, 0.3); tf(o.e, { x: (1 - k) * 30, o: k }); });
        // cursor vai até "Salvar" e clica
        const kc = E.inOutCubic(prog(t, click - 0.6, click));
        cur.style.display = t > click - 0.65 ? 'block' : 'none';
        pos(cur, lerp(760, bR.x + 60, kc), lerp(1300, bR.y + 30, kc));
        const pr = Math.sin(Math.PI * prog(t, click, click + 0.2));
        tf(cur, { s: 1 - 0.15 * pr });
        btn.style.transform = `scale(${1 - 0.06 * pr})`;
        const kt = E.outBack(prog(t, click + 0.15, click + 0.5));
        toast.style.opacity = clamp(kt * 2); toast.style.transform = `translateX(-50%) scale(${0.8 + 0.2 * kt})`;
      },
    };
  });

  // 05 · A conversa segue o cooperado  (carregado: celular + anotações) --------
  ENGINE.scene(17.5, 22.2, 'light', cam => {
    const svg = svgLayer(cam);
    const phone = pos(h('div', 'phone', cam), 60, 440, 580, 1060);
    phone.innerHTML = `<div class="screen"><div class="sbar"><span>9:41</span><span>●●● ◔</span></div><div class="island"></div>
      <div class="wa-h"><span>‹</span><span class="av">✦</span><div><div class="n">Agente Viacredi <span style="color:#25d366">●</span></div><div class="s">Conta comercial</div></div></div>
      <div class="wa-body"><div class="wa-list"></div></div></div>`;
    const list = phone.querySelector('.wa-list');
    const M = [
      [17.75, 'me', 'Já tenho um crédito contratado, mas achei bom saber que tem outro disponível.', '14:21'],
      [18.45, 'bot', 'Que bom! Posso perguntar o que você está planejando?', '14:21', 0],
      [19.15, 'me', 'Estou reformando a cozinha.', '14:23', 1],
      [19.85, 'bot', '<span class="ai">✦ Agente de IA</span><br>Que legal! Simulei uma opção para a sua reforma:<div class="sim"><div class="a">Crédito Reforma</div><div class="b">R$ 15.000,00</div><div class="c">24x · Juros e IOF inclusos</div></div>', '14:24', 2],
      [20.6, 'me', 'Quero! Vou contratar para terminar a obra.', '14:26', 3],
    ];
    const msgs = M.map(([at, who, html, ts, ann]) => {
      const m = h('div', 'msg ' + who, list, html + `<span class="ts">${ts}${who === 'me' ? ' ✓✓' : ''}</span>`);
      let extra = null;
      if (ann === 2) extra = h('div', 'cta-wa', list, '↗ Ver condições no app');
      return { m, extra, at, ann, who };
    });
    const badge = h('div', 'badge', list, '✓ Crédito contratado');
    const A = [
      ['Escuta', 'Em vez de insistir, o agente pergunta.'],
      ['Contexto', 'A reforma vira o assunto da conversa.'],
      ['Oferta com sentido', 'O crédito aparece dentro do plano dela.'],
      ['Decisão', 'A cooperada decide contratar.'],
    ];
    const anns = A.map(([t1, d], i) => h('div', 'ann', cam, `<span class="n">${i + 1}</span><div class="t">${t1}</div><div class="d">${d}</div>`));
    const note = h('div', 'illus', cam, 'Reconstituição a partir do relato do projeto.'); pos(note, 0, 1515, 1080); Object.assign(note.style, { fontSize: '20px', textAlign: 'center' });
    // posições finais (medidas na montagem)
    const lastMe = msgs[4].m;
    const bm = rel(lastMe);
    Object.assign(badge.style, { position: 'relative', display: 'inline-block', marginLeft: 'auto', float: 'right', marginTop: '-6px' });
    let prevEnd = 440;
    const links = msgs.filter(o => o.ann != null).map(o => {
      const r = rel(o.m), a = anns[o.ann];
      const cy = r.y + r.h / 2;
      const ah = a.offsetHeight;
      const ay = Math.max(prevEnd + 16, cy - ah / 2);
      prevEnd = ay + ah;
      pos(a, 680, ay);
      const x0 = r.x + r.w, mid = 660, ty = ay + ah / 2;
      const path = svgEl(svg, 'path', { d: `M${x0} ${cy} H${mid - 12} Q${mid} ${cy} ${mid} ${cy + Math.sign(ty - cy) * 12} V${ty - Math.sign(ty - cy) * 12} Q${mid} ${ty} ${mid + 12} ${ty} H680`, fill: 'none', stroke: '#070401', 'stroke-width': 3 });
      const len = path.getTotalLength(); path.style.strokeDasharray = len;
      const dot = svgEl(svg, 'circle', { cx: x0, cy, r: 10, fill: '#fdc348', stroke: '#070401', 'stroke-width': 3 });
      return { o, a, path, len, dot };
    });
    svg.style.zIndex = 3;
    return {
      update(lt, t) {
        const k = enter(t, 17.53, 0.7);
        phone.style.transform = `perspective(1800px) translateY(${(1 - k) * 200}px) rotateY(${(1 - k) * -14}deg)`;
        phone.style.opacity = clamp(k * 2);
        msgs.forEach(o => {
          const kb = E.outBack(prog(t, o.at, o.at + 0.35));
          o.m.style.opacity = t >= o.at ? clamp(kb * 2) : 0;
          o.m.style.transform = `scale(${0.85 + 0.15 * kb})`; o.m.style.transformOrigin = o.who === 'me' ? '100% 100%' : '0 100%';
          if (o.extra) { const ke = enter(t, o.at + 0.35, 0.3); o.extra.style.opacity = ke; o.extra.style.transform = `translateY(${(1 - ke) * 10}px)`; }
        });
        const kg = E.outBack(prog(t, 21.0, 21.35)); badge.style.opacity = clamp(kg * 2); badge.style.transform = `scale(${0.6 + 0.4 * kg})`;
        links.forEach(L => {
          const a0 = L.o.at + 0.25;
          const kp = E.inOutCubic(prog(t, a0, a0 + 0.35));
          L.path.style.strokeDashoffset = L.len * (1 - kp); L.path.style.opacity = t >= a0 ? 1 : 0;
          L.dot.style.opacity = t >= a0 ? 1 : 0;
          const ka = E.outExpo(prog(t, a0 + 0.25, a0 + 0.7));
          tf(L.a, { x: (1 - ka) * 40, o: ka });
        });
        op(note, enter(t, 18.4, 0.4));
      },
    };
  });

  // 06 · Contratado → R$ 150 mil  (minimalista) --------------------------------
  ENGINE.scene(22.2, 25.9, 'light', cam => {
    const A = h('div', 'abs', cam); pos(A, 0, 0, 1080, 1920);
    const lab = h('div', 'center small', A, 'Resultado'); pos(lab, 0, 400);
    const tk = buildTicket(A, 160, 600); tk.el.style.boxShadow = 'var(--soft-shadow)'; tk.el.style.border = '0';
    const fr = pos(h('div', 'selframe', A), 160 - 26, 600 - 26, 812, tk.el.offsetHeight + 52);
    const B = h('div', 'abs', cam); pos(B, 0, 0, 1080, 1920);
    const pre = h('div', 'center small', B, 'mais de'); pos(pre, 0, 650);
    const num = h('div', 'center giant', B, 'R$ 150 mil'); const ns = fit(num, 940); pos(num, 0, 730);
    const bar = pos(h('div', 'pill', B), CX - 300, 730 + ns * 0.98, 600, 22); bar.style.background = 'var(--y)';
    const post = h('div', 'center small', B, 'em crédito liberado, ainda na fase de testes.'); pos(post, 0, 770 + ns * 1.05);
    const cut = 23.35;
    return {
      update(lt, t) {
        const a = t < cut; A.style.display = a ? 'block' : 'none'; B.style.display = a ? 'none' : 'block';
        const k = enter(t, 22.22, 0.5);
        tf(tk.el, { y: (1 - k) * 90, o: k }); op(lab, k);
        const flip = prog(t, 22.55, 22.9);
        tk.set({ flip, status: flip > 0.5 ? '✓ Contratado' : '✓✓ Enviada' });
        const kf = E.outBack(prog(t, 22.55, 22.95));
        tf(fr, { s: lerp(1.15, 1, kf), o: clamp(kf * 3) });
        fr.style.background = flip > 0.5 ? 'rgba(253,195,72,.12)' : 'transparent';
        const n = Math.round(150 * E.outExpo(prog(t, cut, cut + 1.1)));
        num.textContent = `R$ ${n} mil`;
        tf(num, { s: lerp(1.06, 1, E.outExpo(prog(t, cut, cut + 0.5))) });
        op(pre, enter(t, cut, 0.3));
        bar.style.transform = `scaleX(${E.outExpo(prog(t, cut + 0.5, cut + 1.1))})`;
        const kp = enter(t, cut + 0.9, 0.4); tf(post, { y: (1 - kp) * 20, o: kp });
      },
    };
  }, { captions: false });

  // 07 · Indicadores do teste  (carregado; só números do ebook, pág. 8) ---------
  ENGINE.scene(25.9, 28.5, 'light', cam => {
    const head = h('div', 'center', cam, '<span style="font:600 30px Poppins">Indicadores do teste</span> <span style="font:600 22px Poppins;background:var(--y-soft);color:#7a5600;padding:8px 16px;border-radius:99px;margin-left:10px;vertical-align:4px">Viacredi · fase de testes</span>');
    pos(head, 0, 300);
    const K = [
      ['hero', 72, 400, 936, 300, 'Geração de negócio', '+R$ 150 mil', 'em crédito liberado por meio do agente.'],
      ['', 72, 720, 458, 300, 'Autonomia do time', '4 agentes', 'criados pela própria equipe no Agent Builder.'],
      ['', 550, 720, 458, 300, 'Transbordo', 'Baixo', 'e, quando acontece, vai com nota de contexto.'],
      ['', 72, 1040, 936, 230, 'Meta até dezembro', '+10%', 'das ações ativas com agente generativo.'],
    ];
    const cards = K.map(([c, x, y, w, hh, k, v, d], i) => {
      const e = pos(h('div', 'kpi ' + c, cam, `<div class="k">${k}</div><div class="v">${v}</div><div class="d">${d}</div>`), x, y, w, hh);
      return { e, at: 25.98 + i * 0.14 };
    });
    const foot = h('div', 'center', cam, 'Os resultados da Viacredi não constituem projeção para outras instituições.'); pos(foot, 0, 1300);
    Object.assign(foot.style, { font: '500 22px Poppins', color: '#8d8a83' });
    return {
      update(lt, t) {
        op(head, enter(t, 25.92, 0.3));
        cards.forEach(o => { const k = E.outExpo(prog(t, o.at, o.at + 0.6)); tf(o.e, { y: (1 - k) * 90, s: 0.96 + 0.04 * k, o: clamp(k * 2) }); });
        op(foot, enter(t, 26.5, 0.4));
      },
    };
  }, { captions: false });

  // 08 · CTA ------------------------------------------------------------------
  ENGINE.scene(28.5, DUR, 'light', cam => {
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
    const t0 = 28.5, press = wt(12, 0);
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
