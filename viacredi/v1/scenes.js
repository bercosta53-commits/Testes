// Vídeo 1 · "Pré-aprovado" · 32 s · linguagem das referências (lançamento SaaS premium)
// Produto sem excesso: uma informação por vez, entrando e saindo, com personalização (a Ana).
// Tempos vêm da locução real (vo.js, gerado da transcrição). wt(bloco, palavra) = tempo da palavra.
'use strict';

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
function typeIn(el, full, k) {
  const n = Math.round(full.length * clamp(k));
  el.innerHTML = full.slice(0, n) + (k > 0 && k < 1 ? '<span class="caret"></span>' : '');
}
// entra (de baixo/direita) e sai (para cima/esquerda): a linguagem de troca de informação
function inOut(t, tin, tout, d = 0.45) {
  const a = E.outExpo(prog(t, tin, tin + d));
  const b = E.inCubic(prog(t, tout, tout + d * 0.7));
  return { a, b, vis: t >= tin && t < tout + d * 0.7 };
}

boot(() => {
  ENGINE.capMode = 'build';
  ENGINE.init({ dur: DUR, captions: VO });

  // 01 · Base pré-aprovada com nomes → seleciona a Ana → disparo ------------------
  ENGINE.scene(0, 4.45, 'light', cam => {
    const N = [['CM', 'Carlos M.', '8.000'], ['JR', 'Juliana R.', '12.000'], ['RS', 'Roberto S.', '5.500'], ['A', 'Ana R.', '15.000'], ['FL', 'Fernanda L.', '9.000'], ['PT', 'Paulo T.', '20.000'], ['LM', 'Lia M.', '7.500']];
    const cards = N.map(([ini, nm, v], i) => {
      const c = pos(h('div', 'mini', cam), 390 + (i - 3) * 336, 780);
      c.innerHTML = `<div class="who"><div class="ini">${ini}</div><div class="nmt">${nm}</div></div><div class="tag">Pré-aprovado</div><div class="val">R$ ${v}</div><div class="ln"></div>`;
      return { c, i, d: Math.abs(i - 3) };
    });
    const frame = pos(h('div', 'selframe', cam), 390 - 24, 780 - 24, 348, 408);
    const sent = h('div', 'center', cam, '<span style="display:inline-flex;align-items:center;gap:16px;font:600 46px Poppins;color:#0b6b3a;background:#d9fdd3;padding:26px 42px;border-radius:999px">✓✓ Enviada para a Ana</span>');
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
          tf(o.c, { x: (1 - kin) * 420, y: -1500 * up, s: base * pop, r: (o.i - 3) * 6 * up, o: lerp(1, o.i === 3 ? 1 : 0.5, sel ? enter(t, selT, 0.3) : 0) });
        });
        const kf = E.outBack(prog(t, selT, selT + 0.4));
        const fp = E.inCubic(prog(t, launch, launch + 0.6));
        tf(frame, { s: lerp(1.3, 1, kf) * (1 + 0.04 * E.outBack(prog(t, selT, selT + 0.35))), y: -1500 * fp, o: clamp(kf * 3) });
        const ks = E.outBack(prog(t, launch + 0.6, launch + 1.0));
        tf(sent, { s: 0.6 + 0.4 * ks, o: clamp(ks * 2) });
      },
    };
  });

  // 02 · O robô (minimalista, escuro) -------------------------------------------
  ENGINE.scene(4.45, 9.45, 'dark', cam => {
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
    const typing = h('div', 'center', cam, '<span style="display:inline-flex;gap:16px;background:#1d1d1d;padding:30px 40px;border-radius:40px"><i></i><i></i><i></i></span>');
    pos(typing, 0, 820);
    const dots = [...typing.querySelectorAll('i')];
    dots.forEach(d => Object.assign(d.style, { width: '22px', height: '22px', borderRadius: '50%', background: '#8a8a8a', display: 'block' }));
    const blob = blobSVG(cam, 'var(--y)'); pos(blob, CX - 60, 900, 120, 120);
    return {
      update(lt, t) {
        const t0 = wt(3, 0);
        const ky = enter(t, 4.6, 0.35) * (1 - enter(t, t0 - 0.15, 0.15));
        tf(typing, { s: 0.8 + 0.2 * ky, o: ky });
        dots.forEach((d, i) => { d.style.transform = `translateY(${-10 * Math.max(0, Math.sin(t * 9 - i * 0.9))}px)`; });
        const kl = enter(t, t0, 0.4);
        tf(M.l, { y: (1 - kl) * 40, o: kl });
        M.pills.forEach((p, i) => { const a = wt(3, 3 + i * 2); const k = E.outBack(prog(t, a, a + 0.35)); tf(p, { s: 0.7 + 0.3 * k, o: clamp(k * 2) }); });
        let gk = 0; [8.92, 9.04].forEach(g => { if (t >= g && t < g + 0.1) gk = 1; });
        ghosts.forEach((g, i) => {
          g.style.opacity = gk ? 0.28 : 0;
          tf(g, { x: gk ? (i ? -16 : 22) : 0, y: gk ? (i ? 10 : -8) : 0 });
          G[i].l.style.opacity = M.l.style.opacity; G[i].pills.forEach((p, j) => { p.style.opacity = M.pills[j].style.opacity; });
        });
        tf(main, { x: gk ? 6 : 0 });
        const kb = E.inOutExpo(prog(t, 9.12, 9.45));
        tf(blob, { s: kb * 26, o: kb > 0 ? 1 : 0 });
      },
    };
  });

  // 03 · Menos regra, mais contexto (minimalista) --------------------------------
  ENGINE.scene(9.3, 13.95, 'light', (cam, el) => {
    const N = 9, bars = [];
    const hs = [300, 420, 250, 380, 460, 330, 400, 270, 350];
    for (let i = 0; i < N; i++) bars.push({ b: h('div', 'pill', cam), x: CX - (N * 56 + (N - 1) * 30) / 2 + i * 86, hh: hs[i] });
    const lab = h('div', 'center small', cam, 'regras do agente'); pos(lab, 0, 1190);
    const pillY = h('div', 'pill', cam); pillY.style.background = 'var(--y)';
    const word = maskLine(cam, 'center giant', 'contexto.'); pos(word.m, 0, 790);
    const ws = fit(word.i, 780); word.m.style.width = '1080px';
    return {
      update(lt, t) {
        el.style.clipPath = `circle(${E.inOutExpo(prog(t, 9.3, 9.68)) * 1400}px at 50% 52%)`;
        const coll = wt(5, 0), more = wt(5, 3);
        bars.forEach((o, i) => {
          const kin = E.outExpo(prog(t, 9.55 + i * 0.05, 10.0 + i * 0.05));
          const kc = E.inOutCubic(prog(t, coll + i * 0.03, coll + 0.4 + i * 0.03));
          const km = E.inOutExpo(prog(t, more - 0.05, more + 0.3));
          const hh = lerp(o.hh * kin, 56, kc);
          Object.assign(o.b.style, { left: lerp(o.x, CX - 28, km) + 'px', top: 960 - hh / 2 + 'px', width: '56px', height: hh + 'px', background: kc > 0.5 ? '#bdb8ae' : 'var(--ink)', opacity: 1 - km });
        });
        op(lab, enter(t, 10.0, 0.4) * (1 - enter(t, coll, 0.3)));
        const kp = E.outExpo(prog(t, more + 0.1, more + 0.6));
        const pw = lerp(56, 940, kp), ph = lerp(56, ws * 1.25, kp);
        Object.assign(pillY.style, { left: CX - pw / 2 + 'px', top: 960 - ph / 2 + 'px', width: pw + 'px', height: ph + 'px', opacity: prog(t, more, more + 0.05) });
        word.m.style.top = 960 - ws * 0.55 + 'px';
        maskT(word, enter(t, wt(5, 4), 0.45));
      },
    };
  });

  // 04 · Agent Builder: um campo por vez, entrando e saindo ------------------------
  ENGINE.scene(13.95, 19.45, 'light', cam => {
    const win = pos(h('div', 'win', cam), 90, 560, 900, 520);
    win.innerHTML = `<div class="win-top"><img src="../assets/ubots-logo.png"><span class="sep"></span><span>Agent Builder</span><span class="dots"><i></i><i></i><i></i><i></i></span></div><div class="win-body"></div>`;
    const body = win.querySelector('.win-body');
    const dots = [...win.querySelectorAll('.dots i')];
    const intro = h('div', 'fcard intro', body, '<div class="t">Agente de crédito</div><div class="in"><span class="tx"></span></div>');
    const introTx = intro.querySelector('.tx');
    const F = [
      ['Objetivo', 'Entender o plano do cooperado.'],
      ['Público', 'Quem tem crédito pré-aprovado.'],
      ['Oferta', 'A linha que cabe no plano.'],
      ['Tom', 'Próximo, como a cooperativa.'],
    ];
    const cards = F.map(([lab, val], i) => {
      const c = h('div', 'fcard', body, `<span class="num">0${i + 1}</span><div class="lab">${lab}</div><div class="val"></div>`);
      const at = wt(7, i), next = i < 3 ? wt(7, i + 1) : 99;
      return { c, v: c.querySelector('.val'), val, at, next };
    });
    const toast = h('div', 'toast', cam, '✓ Papel do agente salvo'); pos(toast, 0, 1140);
    const toastAt = wt(7, 3) + 0.45;
    return {
      update(lt, t) {
        const kw = E.outExpo(prog(t, 14.0, 14.7));
        win.style.transform = `perspective(1800px) translateY(${(1 - kw) * 180}px) rotateX(${(1 - kw) * 12}deg)`;
        win.style.opacity = clamp(kw * 1.6);
        // abertura: "Papel do agente" sendo digitado no campo
        const io = inOut(t, 14.2, wt(7, 0) - 0.25);
        intro.style.visibility = io.vis ? 'visible' : 'hidden';
        tf(intro, { x: -200 * io.b, y: (1 - io.a) * 40, o: io.a * (1 - io.b) });
        typeIn(introTx, 'Papel do agente', prog(t, wt(6, 3), wt(6, 3) + 0.6));
        introTx.parentElement.style.color = t > wt(6, 3) ? 'var(--ink)' : '#a39b8f';
        cards.forEach((o, i) => {
          const r = inOut(t, o.at + 0.02, i < 3 ? o.next - 0.24 : 99, 0.32);
          o.c.style.visibility = r.vis ? 'visible' : 'hidden';
          tf(o.c, { x: (1 - r.a) * 260 - 320 * r.b, o: r.a * (1 - r.b) });
          typeIn(o.v, o.val, prog(t, o.at + 0.12, o.at + 0.55));
          dots[i].classList.toggle('on', t >= o.at);
        });
        const kt = E.outBack(prog(t, toastAt, toastAt + 0.35));
        toast.style.left = '50%'; toast.style.transform = `translateX(-50%) scale(${0.7 + 0.3 * kt})`; toast.style.opacity = clamp(kt * 2);
      },
    };
  });

  // 05 · A conversa segue a Ana: contexto vira oferta, oferta vira contrato ----------
  ENGINE.scene(19.45, 23.3, 'light', cam => {
    const per = pos(h('div', 'persona', cam), 72, 440);
    per.innerHTML = '<div class="av">A</div><div><div class="nm">Ana R.</div><div class="ctx"></div></div>';
    const ctx = per.querySelector('.ctx');
    const b1 = h('div', 'bbl me', cam, 'Estou <mark>reformando a cozinha</mark>.'); pos(b1, 0, 760); b1.style.right = '72px'; b1.style.left = 'auto';
    const mk = b1.querySelector('mark');
    const fly = h('div', 'tagfly', cam, 'reforma da cozinha');
    const b2 = h('div', 'bbl bot', cam, '<span class="ai">✦ Agente de IA</span><br>Que legal! Simulei uma opção para a sua reforma:<div class="sim"><div class="a"><span>Crédito Reforma</span></div><div class="b">R$ 15.000,00</div><div class="c">24x · juros e IOF inclusos</div></div>');
    pos(b2, 72, 640); b2.style.maxWidth = '860px';
    const b3 = h('div', 'bbl me', cam, 'Quero! Vou contratar para terminar a obra.'); pos(b3, 0, 820); b3.style.right = '72px'; b3.style.left = 'auto'; b3.style.maxWidth = '760px';
    const stamp = h('div', 'stamp', cam, '✓ Crédito contratado');
    const note = h('div', 'center', cam, 'Reconstituição a partir do relato do projeto.'); pos(note, 0, 1250);
    Object.assign(note.style, { font: '500 22px Poppins', color: '#8d8a83' });
    // posições para o voo da etiqueta
    const mr = mk.getBoundingClientRect(), sr = ENGINE.stage.getBoundingClientRect();
    const r0 = { x: mr.left - sr.left, y: mr.top - sr.top };          // sai de cima do trecho grifado
    const r1 = { x: r0.x, y: r0.y - 96 };
    const rc = { x: 72 + 104, y: 440 + 52 };
    const T = { b1: 19.5, mark: 19.95, fly: 20.35, b1out: 20.85, b2: 20.95, b2out: 22.15, b3: 22.25, stamp: 22.7 };
    return {
      update(lt, t) {
        const kp = E.outBack(prog(t, 19.47, 19.85)); tf(per, { s: 0.8 + 0.2 * kp, o: clamp(kp * 2) });
        const i1 = inOut(t, T.b1, T.b1out, 0.4);
        b1.style.visibility = i1.vis ? 'visible' : 'hidden';
        tf(b1, { y: (1 - i1.a) * 60 - 260 * i1.b, s: 0.9 + 0.1 * i1.a, o: i1.a * (1 - i1.b) }); b1.style.transformOrigin = '100% 100%';
        mk.style.backgroundSize = `${E.inOutCubic(prog(t, T.mark, T.mark + 0.35)) * 100}% 100%`;
        // a etiqueta sai da bolha e encaixa no cartão da Ana (personalização)
        const kpop = E.outBack(prog(t, T.fly - 0.25, T.fly + 0.05));     // salta da bolha
        const kf = E.inOutCubic(prog(t, T.fly + 0.05, T.fly + 0.5));      // voa até o cartão da Ana
        fly.style.visibility = t >= T.fly - 0.25 && kf < 1 ? 'visible' : 'hidden';
        fly.style.left = lerp(r0.x, lerp(r1.x, rc.x, kf), clamp(kpop)) + 'px';
        fly.style.top = lerp(r0.y, lerp(r1.y, rc.y, kf), clamp(kpop)) + 'px';
        fly.style.transform = `scale(${lerp(0.6, 1, clamp(kpop)) * lerp(1, 0.8, kf)})`;
        ctx.textContent = kf >= 1 ? 'reforma da cozinha' : '';
        ctx.style.display = kf >= 1 ? 'inline-block' : 'none';
        const i2 = inOut(t, T.b2, T.b2out, 0.4);
        b2.style.visibility = i2.vis ? 'visible' : 'hidden';
        tf(b2, { y: (1 - i2.a) * 60 - 260 * i2.b, s: 0.9 + 0.1 * i2.a, o: i2.a * (1 - i2.b) }); b2.style.transformOrigin = '0 100%';
        const i3 = inOut(t, T.b3, 99, 0.4);
        b3.style.visibility = i3.vis ? 'visible' : 'hidden';
        tf(b3, { y: (1 - i3.a) * 60, s: 0.9 + 0.1 * i3.a, o: i3.a }); b3.style.transformOrigin = '100% 100%';
        const ks = E.outBack(prog(t, T.stamp, T.stamp + 0.35));
        pos(stamp, 1008 - 400, 820 + b3.offsetHeight + 24); stamp.style.left = 'auto'; stamp.style.right = '72px';
        tf(stamp, { s: 0.6 + 0.4 * ks, o: clamp(ks * 2) }); stamp.style.transformOrigin = '100% 0';
        op(note, enter(t, 19.8, 0.4));
      },
    };
  });

  // 06 · R$ 150 mil (minimalista) ----------------------------------------------
  ENGINE.scene(23.3, 28.4, 'light', cam => {
    const pre = h('div', 'center small', cam, 'mais de'); pos(pre, 0, 650);
    const num = h('div', 'center giant', cam, 'R$ 150 mil'); const ns = fit(num, 940); pos(num, 0, 730);
    const bar = pos(h('div', 'pill', cam), CX - 300, 730 + ns * 0.98, 600, 22); bar.style.background = 'var(--y)';
    const post = h('div', 'center small', cam, 'em crédito liberado'); pos(post, 0, 770 + ns * 1.05);
    const chip = h('div', 'center', cam, '<span class="chip y" style="font-size:32px;padding:14px 28px">Ainda na fase de testes</span>'); pos(chip, 0, 850 + ns * 1.05);
    const foot = h('div', 'center', cam, 'Os resultados da Viacredi não constituem projeção para outras instituições.'); pos(foot, 0, 1250);
    Object.assign(foot.style, { font: '500 22px Poppins', color: '#8d8a83' });
    const c0 = 23.35, land = wt(9, 3) + 0.12;
    return {
      update(lt, t) {
        const n = Math.round(150 * E.outCubic(prog(t, c0, land)));
        num.textContent = `R$ ${n} mil`;
        tf(num, { s: lerp(1.06, 1, E.outExpo(prog(t, c0, c0 + 0.5))) });
        op(pre, enter(t, c0, 0.3));
        bar.style.transform = `scaleX(${E.outExpo(prog(t, land, land + 0.6))})`;
        const kp = enter(t, wt(9, 7), 0.4); tf(post, { y: (1 - kp) * 20, o: kp });
        const kc = E.outBack(prog(t, wt(10, 0), wt(10, 0) + 0.4)); tf(chip, { s: 0.7 + 0.3 * kc, o: clamp(kc * 2) });
        op(foot, enter(t, 26.9, 0.4));
      },
    };
  }, { captions: false });

  // 07 · CTA --------------------------------------------------------------------
  ENGINE.scene(28.4, DUR, 'light', cam => {
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
    const t0 = 28.4, press = wt(12, 0);
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
