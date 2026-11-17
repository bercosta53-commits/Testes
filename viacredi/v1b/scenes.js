// Vídeo 1B · "O playbook" · primeiro o material, depois o embasamento (caso Viacredi) · 30,4 s
// Produto sem excesso: uma informação por vez, entrando e saindo, com personalização (a Ana).
// Tempos vêm da locução real (vo.js, gerado por audio/build_timeline.py). wt(bloco, palavra).
'use strict';

const CX = 540;

function blobSVG(parent, color) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 100 100');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', 'M50 6C76 6 94 24 94 49C94 73 75 90 51 90C45 90 40 89 35 87L18 96L22 80C11 72 6 61 6 49C6 24 24 6 50 6Z');
  p.setAttribute('fill', color); s.appendChild(p); parent.appendChild(s);
  s.style.position = 'absolute'; return s;
}
function typeIn(el, full, k) {
  const n = Math.round(full.length * clamp(k));
  el.innerHTML = full.slice(0, n) + (k > 0 && k < 1 ? '<span class="caret"></span>' : '');
}
// entra e sai: a linguagem de troca de informação
function inOut(t, tin, tout, d = 0.45) {
  const a = E.outExpo(prog(t, tin, tin + d));
  const b = E.inCubic(prog(t, tout, tout + d * 0.7));
  return { a, b, vis: t >= tin && t < tout + d * 0.7 };
}
const mixHex = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k))).join(',')})`; };

// cortes de cena (derivados da locução; mix.py usa a mesma regra)
let S;

boot(() => {
  ENGINE.capMode = 'build';
  ENGINE.liveBg = true;
  ENGINE.bgMode = new URLSearchParams(location.search).get('bg') || 'grid';
  ENGINE.init({ dur: DUR, captions: VO });
  S = { s2: wt(2, 3) - 0.25, s3: wt(3, 0) - 0.2, s4: wt(4, 2) - 0.2, s5: wt(5, 0) - 0.1, s6: wt(6, 3) - 0.35, s7: wt(7, 4) + 0.7 };   // = audio/mix.py

  // 01 · Abertura: só o título da capa, grande, montando com a fala. No "Chegou", o playbook chega como arquivo no WhatsApp
  ENGINE.scene(0, S.s2, 'light', cam => {
    const TW = ['Como', 'vender', 'crédito', 'no', 'WhatsApp', 'com', '<span class="mk">agentes de IA.</span>'];
    const ttl = h('div', 'open-title', cam, TW.map(w => `<span class="w">${w}</span>`).join(' ')); pos(ttl, 80, 0, 920);
    ttl.style.fontSize = '108px'; ttl.style.transformOrigin = '50% 0';
    const th = ttl.offsetHeight;
    const ws = [...ttl.querySelectorAll('.w')], mk = ttl.querySelector('.mk');
    const file = h('div', 'filemsg', cam, '<div class="fi"><span>PDF</span></div><div><div class="fn">Playbook Ubots</div><div class="fm">Agentes de IA · 11 páginas</div></div><div class="ft">agora <b>✓✓</b></div>');
    pos(file, 140, 880, 800);
    const arr = wt(1, 0);                      // "Chegou"
    return {
      update(lt, t) {
        const kin = enter(t, -0.2, 0.3);   // o título inteiro já no primeiro quadro, em cinza; cada palavra escurece quando é dita
        ws.forEach((w, i) => { const k = enter(t, wt(0, i) - 0.04, 0.32); w.style.opacity = lerp(0.16 * kin, 1, k); w.style.transform = `translateY(${(1 - kin) * 22}px)`; });
        mk.style.setProperty('--k', E.inOutCubic(prog(t, wt(0, 8), wt(0, 8) + 0.4)));
        // o título sai do centro e sobe para dar lugar ao arquivo
        const km = E.inOutCubic(prog(t, arr - 0.3, arr + 0.25));
        const out = E.inCubic(prog(t, S.s2 - 0.32, S.s2));
        ttl.style.top = lerp(930 - th / 2, 330, km) + 'px';
        ttl.style.transform = `translateY(${-60 * out}px) scale(${lerp(1, 0.78, km)})`;
        ttl.style.opacity = 1 - out;
        const kf = E.outBack(prog(t, arr + 0.05, arr + 0.5));
        file.style.transformOrigin = '0 100%';
        file.style.transform = `translateY(${(1 - kf) * 60 - 60 * out}px) scale(${0.85 + 0.15 * kf})`;
        file.style.opacity = clamp(kf * 2) * (1 - out);
      },
    };
  });

  // 02 · No playbook: um item por vez, em cartão que entra e sai; cada um com um gesto só -------
  ENGINE.scene(S.s2, S.s3, 'light', cam => {
    const eye = h('div', 'center', cam, 'NO PLAYBOOK'); pos(eye, 0, 300);
    Object.assign(eye.style, { font: '600 28px Poppins', letterSpacing: '.22em', color: '#8d8a83' });
    const bars = pos(h('div', 'abs', cam), 340, 366, 400, 8);
    const fills = [0, 1, 2].map(i => {
      const tr = pos(h('div', 'abs', bars), i * 140, 0, 120, 8);
      Object.assign(tr.style, { background: '#e4e1da', borderRadius: '4px', overflow: 'hidden' });
      const f = pos(h('div', 'abs', tr), 0, 0, 120, 8);
      Object.assign(f.style, { background: 'var(--ink)', transformOrigin: '0 50%' });
      return f;
    });
    const at = [wt(2, 5), wt(2, 9), wt(2, 14)];          // "papel", "limites", "começar"
    const T = ['Papel do agente', 'Limites que nunca mudam', 'Começar com poucos disparos'];
    const cards = T.map((tx, i) => {
      const c = pos(h('div', 'pcard', cam), 90, 470, 900, 700);
      c.innerHTML = `<div class="pn">0${i + 1}</div><div class="pt">${tx}</div><div class="pv"></div>`;
      return { c, v: c.querySelector('.pv') };
    });
    // 01 · o agente e o papel dele, digitado
    cards[0].v.innerHTML = '<div class="ag"><div class="av">✦</div><div><div class="an">Agente de crédito</div><div class="ar"><span class="tx"></span></div></div></div>';
    const roleTx = cards[0].v.querySelector('.tx');
    // 02 · cadeado que fecha no "nunca mudam"
    cards[1].v.innerHTML = '<div class="lock"><div class="sh"></div><div class="bd"><i></i></div></div>';
    const shackle = cards[1].v.querySelector('.sh'), lockEl = cards[1].v.querySelector('.lock');
    // 03 · uma base inteira, só 3 disparos
    const dots = [];
    const grid = h('div', 'dgrid', cards[2].v);
    for (let i = 0; i < 24; i++) dots.push(h('i', '', grid));
    const hot = [9, 3, 18];
    const tin = [S.s2 - 0.04, at[1] - 0.18, at[2] - 0.18], tout = [at[1] - 0.18, at[2] - 0.18, S.s3 - 0.3];
    return {
      update(lt, t) {
        op(eye, enter(t, S.s2 - 0.04, 0.4)); op(bars, enter(t, S.s2, 0.4));
        const end = E.inCubic(prog(t, S.s3 - 0.3, S.s3));
        eye.style.opacity *= 1 - end; bars.style.opacity *= 1 - end;
        fills.forEach((f, i) => { f.style.transform = `scaleX(${clamp(prog(t, tin[i] + 0.1, tout[i]))})`; });
        cards.forEach((o, i) => {
          const a = E.outExpo(prog(t, tin[i], tin[i] + 0.5)), b = i < 2 ? E.inCubic(prog(t, tout[i], tout[i] + 0.3)) : end;
          o.c.style.visibility = t >= tin[i] && b < 1 ? 'visible' : 'hidden';
          o.c.style.transform = `translateX(${(1 - a) * 420 - (i < 2 ? 420 : 0) * b}px) rotate(${(1 - a) * 3}deg)`;
          o.c.style.opacity = clamp(a * 1.5) * (1 - b);
        });
        typeIn(roleTx, 'Entende o plano do cooperado.', prog(t, at[0] + 0.25, at[0] + 1.0));
        const kl = prog(t, wt(2, 11) - 0.1, wt(2, 11) + 0.15);     // "mudam": fecha
        shackle.style.transform = `translateY(${-46 * (1 - E.inCubic(kl))}px)`;
        lockEl.style.transform = `scale(${1 + 0.06 * Math.sin(Math.PI * prog(t, wt(2, 11) + 0.15, wt(2, 11) + 0.45))})`;
        hot.forEach((d, j) => {
          const k = E.outBack(prog(t, wt(2, 16) + j * 0.14, wt(2, 16) + j * 0.14 + 0.3));
          dots[d].style.background = k > 0.05 ? 'var(--y)' : '';
          dots[d].style.transform = `scale(${1 + 0.35 * k})`;
          dots[d].style.boxShadow = k > 0.05 ? `0 0 0 ${Math.round(10 * k)}px rgba(253,195,72,.28)` : 'none';
        });
      },
    };
  });

  // 03 · Caso real: só o logo e o selo ----------------------------------------------------
  ENGINE.scene(S.s3, S.s4, 'light', cam => {
    const tile = pos(h('div', 'abs', cam), 190, 760, 700, 380);
    Object.assign(tile.style, { background: '#fff', borderRadius: '44px', boxShadow: 'var(--soft-shadow)', display: 'grid', placeItems: 'center' });
    tile.innerHTML = '<img src="../assets/viacredi-logo.png" style="height:150px">';
    const logo = tile.querySelector('img');
    const stamp = h('div', 'abs', cam, 'Caso real'); pos(stamp, 640, 700);
    Object.assign(stamp.style, { font: '800 44px Poppins', letterSpacing: '-.02em', background: 'var(--ink)', color: 'var(--y)', padding: '16px 32px', borderRadius: '999px', whiteSpace: 'nowrap' });
    const real = wt(3, 6), vw = wt(4, 1);
    return {
      update(lt, t) {
        const kw = E.outExpo(prog(t, S.s3 - 0.04, S.s3 + 0.55));
        tf(tile, { y: (1 - kw) * 120, s: 0.92 + 0.08 * kw, o: clamp(kw * 1.6) });
        logo.style.transform = `scale(${1 + 0.06 * Math.sin(Math.PI * prog(t, vw, vw + 0.4))})`;
        const ks = E.outBack(prog(t, real - 0.05, real + 0.3));
        stamp.style.transform = `rotate(-6deg) scale(${lerp(1.6, 1, ks)})`; stamp.style.opacity = clamp(ks * 3);
      },
    };
  });

  // 04 · Menos regra, mais contexto: o editor de instruções perde as regras e ganha contexto ----
  ENGINE.scene(S.s4, S.s5, 'light', (cam, el) => {
    const hl = h('div', 'hl', cam, '<s>menos regra<i></i></s>, mais <span class="mk">contexto.</span>'); pos(hl, 0, 250);
    hl.style.fontSize = '84px';
    const strike = hl.querySelector('s i'), emph = hl.querySelector('.mk');
    const ed = pos(h('div', 'ed', cam), 90, 470, 900, 760);
    ed.innerHTML = '<div class="ed-top"><span class="dts"><i></i><i></i><i></i></span>Instruções do agente<span class="cnt">8 regras</span></div>';
    const cnt = ed.querySelector('.cnt');
    const L = [['Não fale sobre…', 0], ['Não responda se…', 0], ['Não ofereça…', 0], ['Sempre use a frase…', 0], ['Não saia do roteiro…', 0],
      ['Seja transparente sobre juros e IOF.', 1], ['Contrate só pelo canal seguro.', 1], ['Não peça dados sensíveis.', 1]];
    const lines = L.map(([tx, keep], i) => {
      const l = h('div', 'ed-ln', ed, `<span class="n">${i + 1}</span><span class="t">${tx}<i></i></span>${keep ? '<span class="g">✓</span>' : ''}`);
      return { l, keep, i, st: l.querySelector('.t i'), g: l.querySelector('.g') };
    });
    const box = h('div', 'ctxb', ed, '<div class="h">+ Contexto</div><div class="cs"><span>Objetivo da conversa</span><span>Plano do cooperado</span><span>Oferta disponível</span></div>');
    const chips = [...box.querySelectorAll('.cs span')];
    const coll = wt(4, 4), more = wt(4, 6);   // apaga em "trocou regra", contexto em "por contexto"
    const del = lines.filter(o => !o.keep);
    return {
      update(lt, t) {
        el.style.clipPath = `circle(${E.inOutCubic(prog(t, S.s4 - 0.04, S.s4 + 0.5)) * 1400}px at 50% 52%)`;
        const ke = E.outExpo(prog(t, S.s4 + 0.1, S.s4 + 0.7));
        ed.style.transform = `perspective(1800px) translateY(${(1 - ke) * 160}px) rotateX(${(1 - ke) * 12}deg)`; ed.style.opacity = clamp(ke * 1.6);
        // manchete: aparece no "menos", risca "regra", grifa "contexto"
        const kh = enter(t, S.s4 + 0.2, 0.4); tf(hl, { y: (1 - kh) * 30, o: kh });
        strike.style.transform = `scaleX(${E.inOutCubic(prog(t, wt(4, 5), wt(4, 5) + 0.3))})`;
        emph.style.setProperty('--k', E.inOutCubic(prog(t, wt(4, 7), wt(4, 7) + 0.35)));
        // linhas: as 5 regras são riscadas e saem; ficam os 3 limites
        let y = 108, removed = 0;
        lines.forEach(o => {
          const d0 = coll + (o.keep ? 99 : del.indexOf(o) * 0.11);
          const ks = E.inOutCubic(prog(t, d0, d0 + 0.18));             // risca
          const kx = E.inCubic(prog(t, d0 + 0.16, d0 + 0.38));         // sai
          o.st.style.transform = `scaleX(${o.keep ? 0 : ks})`;
          const kin = E.outExpo(prog(t, S.s4 + 0.25 + o.i * 0.04, S.s4 + 0.65 + o.i * 0.04));
          o.l.style.top = y + 'px';
          tf(o.l, { x: -120 * kx + (1 - kin) * 40, o: kin * (1 - kx) });
          o.l.style.color = o.keep && t > coll + 0.6 ? 'var(--ink)' : '#55524c';
          if (o.g) o.g.style.opacity = enter(t, coll + 0.6, 0.3);
          const gone = E.inOutCubic(prog(t, d0 + 0.3, d0 + 0.5));
          y += 62 * (o.keep ? 1 : 1 - gone);
          if (!o.keep && gone >= 1) removed++;
        });
        cnt.textContent = t < coll + 0.5 ? `${8 - removed} regras` : '3 limites';
        // bloco de contexto cresce embaixo dos limites
        const kb = E.outExpo(prog(t, more, more + 0.5));
        box.style.top = y + 18 + 'px';
        box.style.opacity = clamp(kb * 2); box.style.transform = `scaleY(${0.6 + 0.4 * kb})`; box.style.transformOrigin = '50% 0';
        chips.forEach((c, i) => { const kc = E.outBack(prog(t, more + 0.25 + i * 0.12, more + 0.55 + i * 0.12)); c.style.display = 'inline-block'; c.style.transform = `scale(${kc})`; c.style.opacity = clamp(kc * 2); });
        ed.style.height = lerp(760, y + 18 + 230 + 24, E.inOutCubic(prog(t, coll, more + 0.4))) + 'px';
      },
    };
  });

  // 05 · A conversa segue a Ana: contexto vira oferta, oferta vira contrato ----------
  ENGINE.scene(S.s5, S.s6, 'light', cam => {
    const per = pos(h('div', 'persona', cam), 72, 466);
    per.innerHTML = '<div class="av">A</div><div><div class="nm">Ana R.</div><div class="ctx"></div></div>';
    const ctx = per.querySelector('.ctx');
    const panel = h('div', 'chatp', cam, '<div class="hd"><span class="av">✦</span><div>Agente Viacredi<div class="s">online</div></div></div>');
    pos(panel, 72, 612, 936, 604);
    const inP = (cls, html, top, side) => { const b = h('div', 'bbl ' + cls, panel, html); b.style.top = top + 'px'; b.style[side] = '28px'; b.style.boxShadow = 'none'; return b; };
    const b1 = inP('me', 'Estou <span class="mk">reformando a cozinha</span>.', 296, 'right');
    const mk = b1.querySelector('.mk');
    const b2 = inP('bot', '<span class="ai">✦ Agente de IA</span><br>Que legal! Simulei uma opção para a sua reforma:<div class="sim"><div class="a"><span>Crédito Reforma</span></div><div class="b">R$ 15.000,00</div><div class="c">24x · juros e IOF inclusos</div></div>', 128, 'left');
    b2.style.maxWidth = '820px'; b2.style.fontSize = '40px';
    const b3 = inP('me', 'Quero! Vou contratar para terminar a obra.', 226, 'right'); b3.style.maxWidth = '720px';
    const stamp = h('div', 'stamp', panel, '✓ Crédito contratado');
    const fly = h('div', 'tagfly', cam, 'reforma da cozinha');
    const steps = h('div', 'steps', cam, '<span class="st"><i></i>Contexto</span><span class="ln"></span><span class="st"><i></i>Oferta</span><span class="ln"></span><span class="st"><i></i>Decisão</span>');
    pos(steps, 72, 1246, 936);
    const st = [...steps.querySelectorAll('.st')];
    const note = h('div', 'center', cam, 'Reconstituição a partir do relato do projeto.'); pos(note, 0, 1318);
    Object.assign(note.style, { font: '500 22px Poppins', color: '#8d8a83' });
    const mr = mk.getBoundingClientRect(), sr = ENGINE.stage.getBoundingClientRect();
    const r1 = { x: mr.left - sr.left, y: mr.top - sr.top - 96 };   // nasce acima do trecho grifado, sem cobri-lo
    const rc = { x: 72 + 104, y: 466 + 52 };
    const s = S.s5;
    // cada bolha só entra depois que a anterior saiu (sem sobreposição)
    const k = Math.min(1, (S.s6 - S.s5) / 3.9);   // os tempos acompanham a duração real da cena
    const T = { b1: s + 0.08 * k, mark: s + 0.45 * k, fly: s + 0.9 * k, b1out: s + 1.35 * k, b2: s + 1.62 * k, b2out: s + 2.75 * k, b3: s + 3.02 * k, stamp: s + 3.38 * k };
    const OUT = 0.3 * k;
    return {
      update(lt, t) {
        const kp = E.outBack(prog(t, s - 0.04, s + 0.35)); tf(per, { s: 0.8 + 0.2 * kp, o: clamp(kp * 2) });
        const kq = E.outExpo(prog(t, s - 0.04, s + 0.55));
        panel.style.transform = `perspective(1800px) translateY(${(1 - kq) * 140}px) rotateX(${(1 - kq) * 10}deg)`; panel.style.opacity = clamp(kq * 1.6);
        const show = (b, tin, tout, origin) => {
          const a = E.outBack(prog(t, tin, tin + 0.35)), o = E.inCubic(prog(t, tout, tout + OUT));
          b.style.visibility = t >= tin && t < tout + OUT ? 'visible' : 'hidden';
          b.style.transformOrigin = origin;
          b.style.transform = `translateY(${(1 - a) * 40 - 120 * o}px) scale(${0.88 + 0.12 * a})`;
          b.style.opacity = clamp(a * 2) * (1 - o);
        };
        show(b1, T.b1, T.b1out, '100% 100%');
        show(b2, T.b2, T.b2out, '0 100%');
        show(b3, T.b3, 99, '100% 100%');
        mk.style.setProperty('--k', E.inOutCubic(prog(t, T.mark, T.mark + 0.3)));
        const kpop = E.outBack(prog(t, T.fly - 0.25, T.fly + 0.05));
        const kf = E.inOutCubic(prog(t, T.fly + 0.05, T.fly + 0.45));
        fly.style.visibility = t >= T.fly - 0.25 && kf < 1 ? 'visible' : 'hidden';
        fly.style.left = lerp(r1.x, rc.x, kf) + 'px';
        fly.style.top = lerp(r1.y + (1 - clamp(kpop)) * 30, rc.y, kf) + 'px';
        fly.style.opacity = clamp(kpop * 2);
        fly.style.transform = `scale(${lerp(0.7, 1, clamp(kpop)) * lerp(1, 0.8, kf)})`;
        ctx.textContent = kf >= 1 ? 'reforma da cozinha' : ''; ctx.style.display = kf >= 1 ? 'inline-block' : 'none';
        const ks = E.outBack(prog(t, T.stamp, T.stamp + 0.3));
        stamp.style.top = 226 + b3.offsetHeight + 18 + 'px'; stamp.style.right = '28px';
        tf(stamp, { s: 0.6 + 0.4 * ks, o: clamp(ks * 2) }); stamp.style.transformOrigin = '100% 0';
        st[0].classList.toggle('on', t >= T.fly); st[1].classList.toggle('on', t >= T.b2); st[2].classList.toggle('on', t >= T.b3);
        op(steps, enter(t, s + 0.2, 0.4));
        op(note, enter(t, s + 0.3, 0.4));
      },
    };
  });

  // 06 · R$ 150 mil: o número conta enquanto contratos ilustrativos passam embaixo -----
  ENGINE.scene(S.s6, S.s7, 'light', cam => {
    const pre = h('div', 'center small', cam, 'mais de'); pos(pre, 0, 560);
    const num = h('div', 'center giant', cam, 'R$ 150 mil'); const ns = fit(num, 940); pos(num, 0, 640);
    const bar = pos(h('div', 'abs', cam), CX - 500, 640 + ns * 0.5, 1000, ns * 0.36);
    Object.assign(bar.style, { background: 'var(--y)', borderRadius: ns * 0.08 + 'px', transformOrigin: '0 50%' });
    num.style.zIndex = 2; num.style.position = 'absolute';
    const post = h('div', 'center small', cam, 'em crédito liberado pelo agente'); pos(post, 0, 690 + ns * 1.05);
    const chip = h('div', 'center', cam, '<span class="chip y" style="font-size:32px;padding:14px 28px">Ainda na fase de testes</span>'); pos(chip, 0, 770 + ns * 1.05);
    // faixa de contratos (ilustrativa, sem valores) deslizando sem parar: a tela nunca fica parada
    const lane = pos(h('div', 'abs', cam), 0, 1124, 1080, 120); lane.style.overflow = 'visible';
    const NM = ['Ana R.', 'Carlos M.', 'Juliana R.', 'Roberto S.', 'Fernanda L.', 'Paulo T.', 'Lia M.', 'Marcos D.', 'Beatriz F.', 'Tiago C.'];
    const tks = NM.map((nm, i) => {
      const k = h('div', 'abs', lane, `<span style="width:52px;height:52px;border-radius:50%;background:${i ? 'var(--ice-2)' : 'var(--y)'};display:grid;place-items:center;font:700 22px Poppins">${nm[0]}</span><span><b style="font:700 26px Poppins">${nm}</b><br><span style="font:700 20px Poppins;color:#0b6b3a">✓ Crédito contratado</span></span>`);
      Object.assign(k.style, { display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', borderRadius: '24px', padding: '16px 24px 16px 16px', boxShadow: 'var(--soft-shadow)', whiteSpace: 'nowrap' });
      return { k, w: k.offsetWidth };
    });
    const total = tks.reduce((a, o) => a + o.w + 24, 0);
    // posição de repouso: dois contratos inteiros e centralizados; bordas da faixa esfumadas
    const offs = []; tks.reduce((a, o) => { offs.push(a); return a + o.w + 24; }, 0);
    const restD = 1080 + (offs[1] + offs[2] + tks[2].w) / 2 - 540;   // Carlos e Juliana no centro
    lane.style.webkitMaskImage = lane.style.maskImage = 'linear-gradient(to right, transparent 0, #000 90px, #000 990px, transparent 1080px)';
    const ill = h('div', 'center', cam, 'Ilustrativo'); pos(ill, 0, 1258);
    Object.assign(ill.style, { font: '500 20px Poppins', color: '#a39b8f' });
    const foot = h('div', 'center', cam, 'Os resultados da Viacredi não constituem projeção para outras instituições.'); pos(foot, 0, 1310);
    Object.assign(foot.style, { font: '500 22px Poppins', color: '#8d8a83' });
    const land = wt(6, 7) + 0.35;   // contagem dura a frase toda e fecha logo depois de "crédito"
    return {
      update(lt, t) {
        const pn = prog(t, S.s6 - 0.04, land), kn = 1 - (1 - pn) * (1 - pn);   // sobe de forma mais uniforme e assenta no fim
        const n = Math.round(150 * kn);
        num.textContent = `R$ ${n} mil`;
        tf(num, { s: lerp(1.08, 1, E.outExpo(prog(t, S.s6 - 0.04, S.s6 + 0.5))) * (1 + 0.02 * prog(t, land, S.s7)) });
        op(pre, enter(t, S.s6 - 0.04, 0.3));
        bar.style.transform = `scaleX(${E.outExpo(prog(t, land, land + 0.5))})`;
        const kp = enter(t, wt(6, 7), 0.4); tf(post, { y: (1 - kp) * 20, o: kp });
        const kc = E.outBack(prog(t, wt(7, 0), wt(7, 0) + 0.35)); tf(chip, { s: 0.7 + 0.3 * kc, o: clamp(kc * 2) });
        // esteira contínua da direita para a esquerda
        const kl = enter(t, S.s6 + 0.2, 0.5); lane.style.opacity = kl; op(ill, kl * 0.9);
        let x = 1080 - restD * kn;   // a faixa anda junto com a contagem e para quando ela fecha
        tks.forEach(o => { let xx = x; while (xx < -o.w - 40) xx += total; o.k.style.left = xx + 'px'; o.k.style.top = '0px'; x += o.w + 24; });
        op(foot, enter(t, wt(7, 0) + 0.2, 0.4));
      },
    };
  }, { captions: false });

  // 07 · Assinatura: Playbook Ubots · Agentes de IA ------------------------------------
  // Hierarquia: etiqueta → nome do produto → subtítulo → o playbook como objeto → CTA → logos.
  ENGINE.scene(S.s7, DUR, 'light', cam => {
    const eye = h('div', 'center', cam, 'PLAYBOOK UBOTS'); pos(eye, 0, 236);
    Object.assign(eye.style, { font: '600 26px Poppins', letterSpacing: '.22em', color: '#8d8a83' });
    const ttl = maskLine(cam, 'center giant', 'Agentes de IA'); pos(ttl.m, 0, 290); ttl.m.style.width = '1080px';
    const tsz = fit(ttl.i, 900);
    ttl.m.style.paddingBottom = Math.round(tsz * 0.28) + 'px'; ttl.m.style.marginBottom = '0';   // folga em px: a perna do "g" não é cortada
    const sub = h('div', 'center', cam, 'Como vender crédito no WhatsApp:<br>o método da Viacredi.'); pos(sub, 0, 290 + tsz * 1.18);
    Object.assign(sub.style, { font: '500 40px/1.3 Poppins', letterSpacing: '-.015em', color: '#55524c' });
    // o playbook como objeto: capa + duas páginas atrás, brilho amarelo localizado
    const glow = pos(h('div', 'abs', cam), 90, 560, 900, 640);
    glow.style.background = 'radial-gradient(closest-side, rgba(253,195,72,.6), rgba(253,195,72,0))';
    const book = pos(h('div', 'abs', cam), 150, 640, 780, 439); book.style.transformOrigin = '50% 100%';
    const pages = [[-5, -18, 10], [4, 16, 4]].map(([r, x, y]) => {
      const pg = pos(h('div', 'abs', book), x, y, 780, 439);
      Object.assign(pg.style, { background: '#fff', borderRadius: '22px', boxShadow: '0 20px 40px -24px rgba(40,30,10,.35)', transform: `rotate(${r}deg)` });
      return { pg, r };
    });
    const cover = pos(h('div', 'abs', book), 0, 0, 780, 439);
    Object.assign(cover.style, { borderRadius: '22px', backgroundImage: 'url(../assets/capa.jpg)', backgroundSize: 'cover', boxShadow: 'var(--soft-shadow)' });
    // CTA dominante
    const btn = pos(h('div', 'abs', cam), 150, 1150, 780, 132);
    Object.assign(btn.style, { background: 'var(--ink)', color: 'var(--y)', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 0 56px', font: '700 50px Poppins', letterSpacing: '-.02em' });
    btn.innerHTML = '<span>Baixe grátis</span><span class="ar" style="width:96px;height:96px;border-radius:50%;background:var(--y);color:var(--ink);display:grid;place-items:center;font:700 46px Poppins">→</span>';
    const arrow = btn.querySelector('.ar');
    const meta = h('div', 'center', cam, 'PDF gratuito · 11 páginas'); pos(meta, 0, 1306);
    Object.assign(meta.style, { font: '500 28px Poppins', color: '#8d8a83' });
    const logos = pos(h('div', 'abs', cam), 0, 1392, 1080, 64);
    Object.assign(logos.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px' });
    logos.innerHTML = '<img src="../assets/ubots-logo.png" style="height:46px"><i style="width:2px;height:48px;background:#d6d2c9"></i><img src="../assets/viacredi-logo.png" style="height:58px">';
    const t0 = S.s7, press = wt(8, 1) + 1.0;   // clique depois que a voz diz "grátis", em espaço limpo
    return {
      update(lt, t) {
        op(eye, enter(t, t0 - 0.04, 0.4));
        maskT(ttl, enter(t, t0 + 0.05, 0.55));
        const ks = enter(t, t0 + 0.3, 0.5); tf(sub, { y: (1 - ks) * 24, o: ks });
        op(glow, enter(t, t0 + 0.3, 1.0, E.outCubic));
        const kb = E.outExpo(prog(t, t0 + 0.35, t0 + 1.2));
        book.style.transform = `perspective(1800px) translateY(${(1 - kb) * 220}px) rotateX(${(1 - kb) * 28}deg) rotate(${lerp(4, -2, kb)}deg)`;
        book.style.opacity = clamp(kb * 2);
        const kf = E.outCubic(prog(t, t0 + 0.9, t0 + 1.5));            // páginas se abrem em leque
        pages.forEach(o => { o.pg.style.transform = `rotate(${o.r * kf}deg)`; });
        const kc = E.outBack(prog(t, press - 0.75, press - 0.35));
        const pr = 1 - 0.04 * Math.sin(Math.PI * prog(t, press, press + 0.22));
        tf(btn, { y: (1 - kc) * 40, s: pr, o: clamp(kc * 2) });
        // sucesso: a seta vira ✓ com um pulo
        const ok = t >= press + 0.12;
        arrow.textContent = ok ? '✓' : '→';
        const kp = E.outBack(prog(t, press + 0.12, press + 0.42));
        arrow.style.transform = ok ? `scale(${0.6 + 0.4 * kp})` : `translateX(${10 * Math.sin(Math.PI * prog(t, press, press + 0.3))}px)`;
        arrow.style.boxShadow = ok ? `0 0 0 ${(18 * (1 - prog(t, press + 0.12, press + 0.7))).toFixed(1)}px rgba(253,195,72,${(0.5 * (1 - prog(t, press + 0.12, press + 0.7))).toFixed(2)})` : 'none';
        op(meta, enter(t, press - 0.2, 0.4));
        const kl = enter(t, press + 0.1, 0.45); tf(logos, { y: (1 - kl) * 16, o: kl });
      },
    };
  }, { captions: false });
});
