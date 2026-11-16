// Vídeo 1 · "Pré-aprovado" · ~24 s
// Tempos da locução ESTIMADOS. Quando a locução do ElevenLabs chegar, só a tabela VO muda;
// as cenas leem os tempos das palavras via wt(bloco, palavra).
'use strict';

const VO = [
  /* 0 */ [0.25, 1.45, 'Crédito pré-aprovado.', { hide: true }],
  /* 1 */ [1.55, 3.0, 'Oferta disparada no WhatsApp.'],
  /* 2 */ [3.2, 4.3, 'E o agente de IA responde:'],
  /* 3 */ [4.35, 6.0, '“Não entendi. Responda SIM ou NÃO.”', { hide: true }],
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

boot(() => {
  ENGINE.init({ dur: DUR, captions: VO, meta: buildMeta('Playbook · Viacredi × Ubots') });

  // 01 · Pré-aprovado + disparo ------------------------------------------------
  ENGINE.scene(0, 3.15, 'light', cam => {
    const l1 = maskLine(cam, 'abs display', 'Crédito'); pos(l1.m, 72, 236);
    const l2 = maskLine(cam, 'abs display', 'pré-aprovado.');
    const s1 = fit(l1.i, 936); fit(l2.i, 936);
    pos(l2.m, 72, 236 + s1 * 0.93);
    // rajada de cópias do ticket (o disparo)
    const N = 18, clones = [];
    for (let i = 0; i < N; i++) {
      const c = h('div', 'abs', cam);
      Object.assign(c.style, { width: '380px', height: '214px', background: '#fff', border: '2px solid var(--line)', borderRadius: '24px', padding: '26px 28px' });
      c.innerHTML = '<div class="chip" style="font-size:15px;padding:7px 13px">✦ Crédito pré-aprovado</div><div style="font:800 52px Poppins;letter-spacing:-.04em;margin-top:16px">R$ 15.000,00</div><div style="height:10px;width:60%;background:var(--y-soft);border-radius:6px;margin-top:14px"></div>';
      const ang = -Math.PI / 2 + (hash(i * 3.1) - 0.35) * 1.9;
      clones.push({ c, ang, dist: 1500 + hash(i) * 500, rot: (hash(i * 7.7) - 0.5) * 26, at: wt(1, 1) + i * 0.055 });
    }
    const tk = buildTicket(cam, 160, 760);
    const ticketCx = 160 + 380 - 190, ticketCy = 760 + 216 - 107;
    return {
      update(lt, t) {
        maskT(l1, enter(t, 0.2, 0.55)); maskT(l2, enter(t, 0.42, 0.55));
        const k = enter(t, 0.75, 0.55);
        const kick = 1 - 0.03 * Math.sin(Math.PI * prog(t, wt(1, 1), wt(1, 1) + 0.25));
        tf(tk.el, { y: (1 - k) * 120, s: (0.92 + 0.08 * k) * kick, o: clamp(k * 1.6) });
        tk.set({ status: t >= wt(1, 3) ? '✓✓ Enviada' : '' });
        clones.forEach(o => {
          const p = prog(t, o.at, o.at + 0.75);
          o.c.style.visibility = p > 0 && p < 1 ? 'visible' : 'hidden';
          const e = E.inCubic(p) * 0.75 + E.outCubic(p) * 0.25;
          tf(o.c, { x: ticketCx + Math.cos(o.ang) * o.dist * e, y: ticketCy + Math.sin(o.ang) * o.dist * e, s: lerp(0.9, 0.55, p), r: o.rot * p });
        });
      },
    };
  });

  // 02 · O robô --------------------------------------------------------------
  ENGINE.scene(3.15, 6.5, 'dark', cam => {
    const head = pos(h('div', 'abs', cam), 72, 236);
    head.innerHTML = '<div style="display:flex;align-items:center;gap:20px"><div style="width:76px;height:76px;border-radius:50%;background:var(--y);color:var(--ink);display:grid;place-items:center;font-size:38px">✦</div><div><div style="font:700 38px Poppins">Agente de IA</div><div style="font:600 26px Nunito;color:var(--gray-2)">online</div></div></div>';
    const bot = 'Não entendi. Responda <b>SIM</b> ou <b>NÃO</b>.';
    const chat = buildChat(cam, [
      { t: 3.3, who: 'me', html: 'Depende. Serve pra quê?' },
      { t: wt(3, 0), who: 'bot', html: bot, qr: ['↩ SIM', '↩ NÃO'] },
      { t: 5.15, who: 'bot', html: bot, jitter: 1 },
      { t: 5.55, who: 'bot', html: bot, jitter: 1 },
      { t: 5.9, who: 'bot', html: bot, jitter: 1 },
    ], { top: 360, bottom: 1215, size: 54, width: 800 });
    const note = pos(h('div', 'abs', cam, 'Exemplo ilustrativo'), 72, 1228);
    Object.assign(note.style, { font: '600 22px Nunito', color: 'var(--gray-2)' });
    return { update(lt, t) { const k = enter(t, 3.2, 0.4); tf(head, { y: (1 - k) * 20, o: k }); chat.update(t); } };
  });

  // 03 · Menos regra, mais contexto (painel amarelo sobe e cobre o preto) -----
  ENGINE.scene(6.2, 9.15, 'yellow', (cam, el) => {
    const chip = pos(h('div', 'chip ink abs', cam, 'Viacredi · julho'), 72, 236);
    const B1 = maskLine(cam, 'abs display', 'mais'), B2 = maskLine(cam, 'abs display', 'contexto.');
    const big = fit(B2.i, 936); B1.i.style.fontSize = big + 'px';
    const A = maskLine(cam, 'abs display', '<span>menos </span><span class="rg" style="display:inline-block;transform-origin:0 85%">regra</span>');
    A.i.style.fontSize = big * 0.5 + 'px';
    const rg = A.i.querySelector('.rg');
    pos(A.m, 72, 360); pos(B1.m, 72, 520); pos(B2.m, 72, 520 + big * 0.93);
    const wv = wave(cam, '', 280, 120); pos(wv.svg, 72, 560 + big * 2); wv.svg.style.position = 'absolute';
    return {
      update(lt, t) {
        const k = enter(t, 6.2, 0.38, E.inOutExpo);
        el.style.clipPath = `inset(${(1 - k) * 100}% 0 0 0)`;
        const kc = enter(t, 6.5, 0.4); tf(chip, { y: (1 - kc) * 24, o: kc });
        maskT(A, enter(t, wt(5, 0), 0.45));
        const sh = E.inOutCubic(prog(t, wt(5, 1), wt(5, 1) + 0.5));
        rg.style.transform = `scale(${lerp(1, 0.42, sh)})`; rg.style.opacity = lerp(1, 0.35, sh);
        const kb1 = enter(t, wt(5, 3), 0.5), kb2 = enter(t, wt(5, 3) + 0.1, 0.5);
        maskT(B1, kb1); maskT(B2, kb2);
        B1.m.style.transform = `scale(${lerp(1.08, 1, kb1)})`; B1.m.style.transformOrigin = '0 100%';
        B2.m.style.transform = `scale(${lerp(1.08, 1, kb2)})`; B2.m.style.transformOrigin = '0 100%';
        wv.set(t * 5, 1, enter(t, wt(5, 3) + 0.2, 0.7, E.outCubic));
      },
    };
  });

  // 04 · O papel do agente ----------------------------------------------------
  ENGINE.scene(9.15, 13.1, 'light', cam => {
    const chip = pos(h('div', 'chip y abs', cam, 'Papel do agente · pág. 9'), 72, 236);
    const F = [
      ['Objetivo', 'Qual resultado a conversa deve buscar?'],
      ['Público', 'Para quem é a oferta e em que momento da relação?'],
      ['Oferta', 'Quais linhas e condições o agente pode apresentar?'],
      ['Tom', 'Como a sua instituição conversa quando atende bem?'],
      ['Transbordo', 'Quando o humano assume e o que ele precisa receber?'],
      ['Fechamento', 'Por qual canal a contratação é concluída?'],
    ];
    const cards = F.map(([lab, q], i) => {
      const c = pos(h('div', 'card'), 72 + (i % 2) * 478, 330 + Math.floor(i / 2) * 290, 458, 268);
      cam.appendChild(c);
      c.style.padding = '30px 32px';
      c.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><span class="chip y" style="font-size:24px;padding:8px 16px">0${i + 1}</span><span class="ok" style="width:52px;height:52px;border-radius:50%;background:var(--ink);color:var(--y);display:grid;place-items:center;font:800 28px Poppins">✓</span></div><div style="font:800 50px Poppins;letter-spacing:-.03em;margin-top:22px">${lab}</div><div style="font:600 26px/1.3 Nunito;color:var(--gray);margin-top:10px">${q}</div>`;
      const at = i < 4 ? wt(7, i) : wt(7, 3) + 0.35 + (i - 4) * 0.2;
      return { c, ok: c.querySelector('.ok'), at, appear: 9.35 + i * 0.07 };
    });
    return {
      update(lt, t) {
        const kc = enter(t, 9.2, 0.4); tf(chip, { y: (1 - kc) * 24, o: kc });
        cards.forEach(o => {
          const ka = enter(t, o.appear, 0.5), on = t >= o.at;
          const pop = on ? E.outBack(prog(t, o.at, o.at + 0.35)) : 0;
          o.c.style.borderStyle = on ? 'solid' : 'dashed';
          o.c.style.borderColor = on ? 'var(--ink)' : 'var(--line)';
          o.c.style.background = on ? '#fff' : 'transparent';
          tf(o.c, { y: (1 - ka) * 50, s: on ? 0.96 + 0.04 * pop : 1, o: ka * (on ? 1 : 0.45) });
          tf(o.ok, { s: on ? pop : 0 });
        });
      },
    };
  });

  // 05 · A conversa segue o cooperado ---------------------------------------
  ENGINE.scene(13.1, 15.5, 'light', cam => {
    const chat = buildChat(cam, [
      { t: 13.2, who: 'me', html: 'Estou reformando a cozinha.', ts: '14:23' },
      { t: 13.7, who: 'bot', html: 'Que legal! Cozinha nova é um projeto e tanto.', ts: '14:23' },
      { t: 14.25, who: 'bot', html: 'Essa linha de crédito pode ajudar com os gastos da reforma. Quer ver as condições?', ts: '14:24' },
      { t: 14.85, who: 'me', html: 'Quero! Vou contratar para terminar a obra.', ts: '14:26' },
    ], { top: 236, bottom: 1215, size: 46, width: 780 });
    cam.querySelectorAll('.bubble.bot').forEach(b => { b.style.border = '2px solid var(--line)'; });
    const note = pos(h('div', 'abs', cam, 'Reconstituição a partir do relato do projeto.'), 72, 1228);
    Object.assign(note.style, { font: '600 22px Nunito', color: 'var(--gray)' });
    return { update(lt, t) { chat.update(t); } };
  });

  // 06 · Contratado + R$ 150 mil ---------------------------------------------
  ENGINE.scene(15.5, 19.75, 'dark', cam => {
    const tk = buildTicket(cam, 72, 250);
    tk.el.style.transformOrigin = '0 0';
    const lab = pos(h('div', 'label abs', cam, 'Geração de negócio · fase de testes'), 72, 742);
    lab.style.color = 'var(--y)';
    const num = maskLine(cam, 'abs display', '+R$ 150 mil'); pos(num.m, 72, 790);
    num.i.style.color = 'var(--y)';
    const size = fit(num.i, 936);
    const desc = pos(h('div', 'body abs', cam, 'em crédito liberado pelo agente, ainda na fase de testes.'), 72, 800 + size * 1.02, 900);
    desc.style.fontSize = '40px';
    const foot = pos(h('div', 'abs', cam, 'Os resultados da Viacredi não constituem projeção para outras instituições.'), 72, 1196, 936);
    Object.assign(foot.style, { font: '600 22px Nunito', color: 'var(--gray-2)' });
    const wv = wave(cam, '', 170, 80); wv.svg.style.position = 'absolute'; pos(wv.svg, 838, 722); wv.svg.style.color = 'var(--y)';
    return {
      update(lt, t) {
        const k = enter(t, 15.55, 0.5);
        tf(tk.el, { y: (1 - k) * 80, s: 0.82, o: k });
        tk.set({ flip: prog(t, 16.05, 16.45), status: t >= 16.3 ? '✓ Contratado' : '✓✓ Enviada' });
        const kl = enter(t, 16.45, 0.4); tf(lab, { y: (1 - kl) * 20, o: kl });
        maskT(num, enter(t, 16.55, 0.5));
        const n = Math.round(150 * E.outExpo(prog(t, 16.55, 17.7)));
        num.i.textContent = `+R$ ${n} mil`;
        const kd = enter(t, 17.2, 0.5); tf(desc, { y: (1 - kd) * 24, o: kd });
        op(foot, enter(t, 17.5, 0.5));
        wv.set(t * 5, 1, enter(t, 16.8, 0.6, E.outCubic));
      },
    };
  }, { captions: false });

  // 07 · CTA -----------------------------------------------------------------
  ENGINE.scene(19.75, DUR, 'light', cam => buildCTA(cam, 19.75, wt(12, 0)), { captions: false });
});
