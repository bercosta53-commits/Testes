// Vídeo 1 · "Pré-aprovado" · 30 s · linguagem das referências (lançamento SaaS premium)
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
  ENGINE.init({ dur: DUR, captions: VO });
  S = { s2: 4.0, s3: wt(3, 0) - 0.3, s4: wt(5, 0) - 0.35, s5: wt(7, 0) - 0.12, s6: wt(8, 0) - 0.05, s7: wt(10, 0) - 0.2 };

  // 01 · Base pré-aprovada com nomes → seleciona a Ana → disparo ------------------
  ENGINE.scene(0, S.s2, 'light', cam => {
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
        const kin = enter(t, 0.05, 0.8, E.outExpo);
        const selT = wt(0, 1), sel = t >= selT;
        const launch = wt(1, 1) + 0.1;
        cards.forEach(o => {
          o.c.classList.toggle('sel', o.i === 3 && sel);
          const base = o.i === 3 ? 1 : lerp(1, 0.9, clamp(o.d / 3));
          const up = E.inCubic(prog(t, launch + o.d * 0.06, launch + o.d * 0.06 + 0.5));
          const pop = o.i === 3 && sel ? 1 + 0.04 * E.outBack(prog(t, selT, selT + 0.3)) : 1;
          tf(o.c, { x: (1 - kin) * 420, y: -1500 * up, s: base * pop, r: (o.i - 3) * 6 * up, o: lerp(1, o.i === 3 ? 1 : 0.5, sel ? enter(t, selT, 0.3) : 0) });
        });
        const kf = E.outBack(prog(t, selT, selT + 0.35));
        const fp = E.inCubic(prog(t, launch, launch + 0.5));
        tf(frame, { s: lerp(1.3, 1, kf) * (1 + 0.04 * E.outBack(prog(t, selT, selT + 0.3))), y: -1500 * fp, o: clamp(kf * 3) });
        const ks = E.outBack(prog(t, launch + 0.5, launch + 0.85));
        tf(sent, { s: 0.6 + 0.4 * ks, o: clamp(ks * 2) });
      },
    };
  });

  // 02 · Agente cheio de regra: as regras se empilham e soterram o agente -----------
  ENGINE.scene(S.s2, S.s3 + 0.75, 'dark', cam => {
    const icon = pos(h('div', 'abs', cam), CX - 120, 860 - 120, 240, 240);
    Object.assign(icon.style, { borderRadius: '50%', display: 'grid', placeItems: 'center', font: '600 120px Poppins', color: 'var(--ink)' });
    icon.textContent = '✦';
    const lab = h('div', 'center', cam, 'Agente de IA'); pos(lab, 0, 1130);
    Object.assign(lab.style, { font: '600 34px Poppins', color: '#bdb8ae' });
    const R = ['Não fale sobre…', 'Não responda se…', 'Não ofereça…', 'Sempre use a frase…', 'Não saia do roteiro…', 'Não improvise.', 'Siga o script.', 'Não mude de assunto.'];
    const t0 = wt(2, 2), t1 = wt(2, 9); // "agente" → "como"
    const chips = R.map((txt, i) => {
      const c = h('div', 'abs', cam, txt);
      Object.assign(c.style, { font: `600 ${i < 5 ? 42 : 36}px Poppins`, background: '#f4f2ee', color: 'var(--ink)', padding: '16px 26px', borderRadius: '16px', whiteSpace: 'nowrap', boxShadow: '0 20px 40px -20px rgba(0,0,0,.6)' });
      const ang = hash(i * 3.3) * Math.PI * 2, rad = 120 + hash(i * 7.1) * 260;
      const at = t0 + (t1 - t0) * (i / (R.length - 1));
      const w = c.offsetWidth, x = clamp(CX + Math.cos(ang) * rad * 1.1, 72 + w / 2 + 10, 1008 - w / 2 - 10);
      return { c, w, x, y: 860 + Math.sin(ang) * rad * 0.9, r: (hash(i * 9.7) - 0.5) * 22, at, from: ang };
    });
    const blob = blobSVG(cam, 'var(--y)'); pos(blob, CX - 60, 900, 120, 120);
    return {
      update(lt, t) {
        const ki = E.outBack(prog(t, S.s2 - 0.04, S.s2 + 0.4));
        tf(icon, { s: ki * (1 - 0.15 * prog(t, t0, wt(2, 10))), o: clamp(ki * 2) });
        icon.style.background = mixHex('#fdc348', '#4a4a4a', prog(t, wt(2, 5), wt(2, 10)));
        op(lab, enter(t, S.s2 + 0.2, 0.3));
        chips.forEach(o => {
          const k = E.outExpo(prog(t, o.at, o.at + 0.45));
          const dx = Math.cos(o.from) * 900 * (1 - k), dy = Math.sin(o.from) * 900 * (1 - k);
          o.c.style.left = o.x - o.w / 2 + dx + 'px'; o.c.style.top = o.y - 30 + dy + 'px';
          o.c.style.transform = `rotate(${o.r * k}deg)`; o.c.style.opacity = t >= o.at ? 1 : 0;
        });
        // no "robô": tudo trava num tremor seco
        const shake = t > wt(2, 10) && t < wt(2, 10) + 0.25 ? (hash(Math.floor(t * 30)) - 0.5) * 14 : 0;
        cam.style.translate = `${shake}px 0`;
        const kb = E.inOutCubic(prog(t, S.s3 - 0.25, S.s3 + 0.3));
        tf(blob, { s: kb * 26, o: kb > 0 ? 1 : 0 });
      },
    };
  });

  // 03 · Menos regra, mais contexto (minimalista) --------------------------------
  ENGINE.scene(S.s3, S.s4, 'light', (cam, el) => {
    const N = 9, bars = [];
    const hs = [300, 420, 250, 380, 460, 330, 400, 270, 350];
    for (let i = 0; i < N; i++) bars.push({ b: h('div', 'pill', cam), x: CX - (N * 56 + (N - 1) * 30) / 2 + i * 86, hh: hs[i] });
    const lab = h('div', 'center small', cam, 'regras do agente'); pos(lab, 0, 1190);
    const pillY = h('div', 'pill', cam); pillY.style.background = 'var(--y)';
    const word = maskLine(cam, 'center giant', 'contexto.'); pos(word.m, 0, 790);
    const ws = fit(word.i, 780); word.m.style.width = '1080px';
    return {
      update(lt, t) {
        el.style.clipPath = `circle(${E.inOutCubic(prog(t, S.s3 + 0.1, S.s3 + 0.65)) * 1400}px at 50% 52%)`;
        const coll = wt(4, 0), more = wt(4, 3);
        bars.forEach((o, i) => {
          const kin = E.outExpo(prog(t, S.s3 + 0.45 + i * 0.04, S.s3 + 0.85 + i * 0.04));
          const kc = E.inOutCubic(prog(t, coll + i * 0.025, coll + 0.35 + i * 0.025));
          const km = E.inOutExpo(prog(t, more - 0.05, more + 0.25));
          const hh = lerp(o.hh * kin, 56, kc);
          Object.assign(o.b.style, { left: lerp(o.x, CX - 28, km) + 'px', top: 960 - hh / 2 + 'px', width: '56px', height: hh + 'px', background: kc > 0.5 ? '#bdb8ae' : 'var(--ink)', opacity: 1 - km });
        });
        op(lab, enter(t, S.s3 + 0.8, 0.3) * (1 - enter(t, coll, 0.3)));
        const kp = E.outExpo(prog(t, more + 0.05, more + 0.5));
        const pw = lerp(56, 940, kp), ph = lerp(56, ws * 1.25, kp);
        Object.assign(pillY.style, { left: CX - pw / 2 + 'px', top: 960 - ph / 2 + 'px', width: pw + 'px', height: ph + 'px', opacity: prog(t, more, more + 0.05) });
        word.m.style.top = 960 - ws * 0.55 + 'px';
        maskT(word, enter(t, wt(4, 4), 0.4));
      },
    };
  });

  // 04 · Agent Builder: o campo falado entra grande; os anteriores viram lista com ✓ ----
  ENGINE.scene(S.s4, S.s5, 'light', cam => {
    const win = pos(h('div', 'win', cam), 90, 500, 900, 640);
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
    const rows = F.map(([lab, val], i) => {
      const r = h('div', 'frow', body, `<div class="hd"><span class="num">0${i + 1}</span><span class="ok">✓</span><span class="lab">${lab}</span></div><div class="val"></div>`);
      const at = wt(6, i), done = i < 3 ? wt(6, i + 1) : 99;
      return { r, lab: r.querySelector('.lab'), v: r.querySelector('.val'), num: r.querySelector('.num'), ok: r.querySelector('.ok'), val, at, done, i };
    });
    const toast = h('div', 'toast', cam, '✓ Papel do agente salvo'); pos(toast, 0, 1190);
    const toastAt = wt(6, 3) + 0.6;
    return {
      update(lt, t) {
        const kw = E.outExpo(prog(t, S.s4 - 0.04, S.s4 + 0.6));
        win.style.transform = `perspective(1800px) translateY(${(1 - kw) * 180}px) rotateX(${(1 - kw) * 12}deg)`;
        win.style.opacity = clamp(kw * 1.6);
        const io = inOut(t, S.s4 + 0.2, wt(6, 0) - 0.3, 0.4);
        intro.style.visibility = io.vis ? 'visible' : 'hidden';
        tf(intro, { x: -200 * io.b, y: (1 - io.a) * 40, o: io.a * (1 - io.b) });
        typeIn(introTx, 'Papel do agente', prog(t, wt(5, 3), wt(5, 3) + 0.5));
        introTx.parentElement.style.color = t > wt(5, 3) ? 'var(--ink)' : '#a39b8f';
        const nDone = rows.filter(o => t >= o.done).length;
        rows.forEach(o => {
          const ka = E.outExpo(prog(t, o.at, o.at + 0.4));           // entra
          const kd = E.inOutCubic(prog(t, o.done, o.done + 0.4));    // vira item da lista
          o.r.style.visibility = t >= o.at ? 'visible' : 'hidden';
          const listY = 26 + o.i * 64, activeY = 30 + nDone * 64 + 14;
          o.r.style.top = lerp(activeY, listY, kd) + 'px';
          o.lab.style.fontSize = lerp(84, 34, kd) + 'px';
          o.lab.style.color = kd > 0.5 ? '#55524c' : 'var(--ink)';
          o.num.style.display = kd > 0.5 ? 'none' : 'inline-block';
          o.ok.style.display = kd > 0.5 ? 'grid' : 'none';
          typeIn(o.v, o.val, prog(t, o.at + 0.1, o.at + 0.55));
          o.v.style.opacity = 1 - kd; o.v.style.height = lerp(50, 0, kd) + 'px';
          tf(o.r, { x: (1 - ka) * 220, o: ka });
          dots[o.i].classList.toggle('on', t >= o.at);
        });
        const kt = E.outBack(prog(t, toastAt, toastAt + 0.35));
        toast.style.left = '50%'; toast.style.transform = `translateX(-50%) scale(${0.7 + 0.3 * kt})`; toast.style.opacity = clamp(kt * 2);
      },
    };
  });

  // 05 · A conversa segue a Ana: contexto vira oferta, oferta vira contrato ----------
  ENGINE.scene(S.s5, S.s6, 'light', cam => {
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
    const mr = mk.getBoundingClientRect(), sr = ENGINE.stage.getBoundingClientRect();
    const r0 = { x: mr.left - sr.left, y: mr.top - sr.top };
    const r1 = { x: r0.x, y: r0.y - 96 };
    const rc = { x: 72 + 104, y: 440 + 52 };
    const s = S.s5;
    const T = { b1: s + 0.05, mark: s + 0.5, fly: s + 1.0, b1out: s + 1.55, b2: s + 1.65, b2out: s + 3.05, b3: s + 3.32, stamp: s + 3.7 };
    return {
      update(lt, t) {
        const kp = E.outBack(prog(t, s - 0.04, s + 0.35)); tf(per, { s: 0.8 + 0.2 * kp, o: clamp(kp * 2) });
        const i1 = inOut(t, s - 0.04, T.b1out, 0.35);
        b1.style.visibility = i1.vis ? 'visible' : 'hidden';
        tf(b1, { y: (1 - i1.a) * 60 - 260 * i1.b, s: 0.9 + 0.1 * i1.a, o: i1.a * (1 - i1.b) }); b1.style.transformOrigin = '100% 100%';
        mk.style.backgroundSize = `${E.inOutCubic(prog(t, T.mark, T.mark + 0.3)) * 100}% 100%`;
        const kpop = E.outBack(prog(t, T.fly - 0.25, T.fly + 0.05));
        const kf = E.inOutCubic(prog(t, T.fly + 0.05, T.fly + 0.45));
        fly.style.visibility = t >= T.fly - 0.25 && kf < 1 ? 'visible' : 'hidden';
        fly.style.left = lerp(r0.x, lerp(r1.x, rc.x, kf), clamp(kpop)) + 'px';
        fly.style.top = lerp(r0.y, lerp(r1.y, rc.y, kf), clamp(kpop)) + 'px';
        fly.style.transform = `scale(${lerp(0.6, 1, clamp(kpop)) * lerp(1, 0.8, kf)})`;
        ctx.textContent = kf >= 1 ? 'reforma da cozinha' : '';
        ctx.style.display = kf >= 1 ? 'inline-block' : 'none';
        const i2 = inOut(t, T.b2, T.b2out, 0.35);
        b2.style.visibility = i2.vis ? 'visible' : 'hidden';
        tf(b2, { y: (1 - i2.a) * 60 - 260 * i2.b, s: 0.9 + 0.1 * i2.a, o: i2.a * (1 - i2.b) }); b2.style.transformOrigin = '0 100%';
        const i3 = inOut(t, T.b3, 99, 0.35);
        b3.style.visibility = i3.vis ? 'visible' : 'hidden';
        tf(b3, { y: (1 - i3.a) * 60, s: 0.9 + 0.1 * i3.a, o: i3.a }); b3.style.transformOrigin = '100% 100%';
        const ks = E.outBack(prog(t, T.stamp, T.stamp + 0.3));
        pos(stamp, 0, 820 + b3.offsetHeight + 24); stamp.style.left = 'auto'; stamp.style.right = '72px';
        tf(stamp, { s: 0.6 + 0.4 * ks, o: clamp(ks * 2) }); stamp.style.transformOrigin = '100% 0';
        op(note, enter(t, s + 0.3, 0.4));
      },
    };
  });

  // 06 · R$ 150 mil (minimalista) ----------------------------------------------
  ENGINE.scene(S.s6, S.s7, 'light', cam => {
    const pre = h('div', 'center small', cam, 'mais de'); pos(pre, 0, 650);
    const num = h('div', 'center giant', cam, 'R$ 150 mil'); const ns = fit(num, 940); pos(num, 0, 730);
    const bar = pos(h('div', 'pill', cam), CX - 300, 730 + ns * 0.98, 600, 22); bar.style.background = 'var(--y)';
    const post = h('div', 'center small', cam, 'em crédito liberado'); pos(post, 0, 770 + ns * 1.05);
    const chip = h('div', 'center', cam, '<span class="chip y" style="font-size:32px;padding:14px 28px">Ainda na fase de testes</span>'); pos(chip, 0, 850 + ns * 1.05);
    const foot = h('div', 'center', cam, 'Os resultados da Viacredi não constituem projeção para outras instituições.'); pos(foot, 0, 1250);
    Object.assign(foot.style, { font: '500 22px Poppins', color: '#8d8a83' });
    const c0 = S.s6 + 0.05, land = wt(8, 3) + 0.12;
    return {
      update(lt, t) {
        const n = Math.round(150 * E.outCubic(prog(t, S.s6 - 0.04, land)));
        num.textContent = `R$ ${n} mil`;
        tf(num, { s: lerp(1.06, 1, E.outExpo(prog(t, c0, c0 + 0.5))) });
        op(pre, enter(t, S.s6 - 0.04, 0.3));
        bar.style.transform = `scaleX(${E.outExpo(prog(t, land, land + 0.5))})`;
        const kp = enter(t, wt(8, 7), 0.4); tf(post, { y: (1 - kp) * 20, o: kp });
        const kc = E.outBack(prog(t, wt(9, 0), wt(9, 0) + 0.35)); tf(chip, { s: 0.7 + 0.3 * kc, o: clamp(kc * 2) });
        op(foot, enter(t, wt(9, 4), 0.4));
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
    ttl.m.style.paddingBottom = '0.22em'; ttl.m.style.marginBottom = '0';   // não corta a perna do "g"
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
    const t0 = S.s7, press = wt(11, 0);
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
        arrow.style.transform = `translateX(${10 * Math.sin(Math.PI * prog(t, press, press + 0.3))}px)`;
        op(meta, enter(t, press - 0.2, 0.4));
        const kl = enter(t, press + 0.1, 0.45); tf(logos, { y: (1 - kl) * 16, o: kl });
      },
    };
  }, { captions: false });
});
