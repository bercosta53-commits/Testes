// Peças reaproveitadas pelos dois vídeos: barra de topo, ticket, chat, CTA.
'use strict';

function buildMeta(left) {
  return stage => {
    const m = h('div', 'meta label', stage);
    h('span', '', m, left);
    const num = h('span', 'num', m);
    const rule = h('div', 'rule', m); const fill = h('i', '', rule);
    return {
      update(t, top) {
        const i = ENGINE.scenes.indexOf(top);
        num.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(ENGINE.scenes.length).padStart(2, '0');
        fill.style.width = (100 * t / ENGINE.dur).toFixed(2) + '%';
      },
    };
  };
}

// Tempo em que a palavra j do bloco de locução k é dita (vem das legendas).
const wt = (k, j = 0) => ENGINE.cap.items[k].ws[j].at;

// Ticket de crédito pré-aprovado: a âncora no ICP.
function buildTicket(parent, x, y) {
  const el = pos(h('div', 'ticket', parent), x, y);
  const chips = h('div', 't-chip', el);
  const a = h('div', 'chip', chips, '✦ Crédito pré-aprovado');
  const b = h('div', 'chip y', chips, '✓ Crédito contratado');
  h('div', 't-val', el, 'R$ 15.000,00');
  h('div', 't-sub', el, '24x · juros e IOF inclusos');
  h('div', 't-sep', el);
  const foot = h('div', 't-foot', el);
  h('span', '', foot, 'Oferta via WhatsApp');
  const st = h('span', '', foot, '');
  return {
    el,
    // flip: 0 = pré-aprovado, 1 = contratado
    set({ flip = 0, status = '' } = {}) {
      const fa = clamp(flip * 2), fb = clamp(flip * 2 - 1);
      a.style.transform = `perspective(600px) rotateX(${fa * 90}deg)`; a.style.opacity = fa < 1 ? 1 : 0;
      b.style.transform = `perspective(600px) rotateX(${(1 - fb) * -90}deg)`; b.style.opacity = fb > 0 ? 1 : 0;
      st.textContent = status;
    },
  };
}

// Chat em recorte macro. items: [{t, who:'me'|'bot', html, qr?:[..]}]
// A conversa rola para cima quando passa da área [top, bottom].
function buildChat(parent, items, { top = 330, bottom = 1230, size = 50, width = 820, gap = 26 } = {}) {
  const view = pos(h('div', 'abs', parent), 0, top, 1080, bottom - top);
  view.style.overflow = 'hidden';
  view.style.maskImage = view.style.webkitMaskImage = 'linear-gradient(to bottom, transparent 0, #000 70px)';
  const list = pos(h('div', 'abs', view), 0, 0, 1080);
  let yy = 70;
  const els = items.map(it => {
    const wrap = pos(h('div', 'abs', list), 0, yy, 1080);
    const b = h('div', 'bubble ' + (it.who === 'me' ? 'me' : 'bot'), wrap, it.html + (it.ts ? `<span class="ts">${it.ts}</span>` : ''));
    b.style.fontSize = size + 'px'; b.style.maxWidth = width + 'px';
    b.style.position = 'relative'; b.style.display = 'inline-block';
    wrap.style.textAlign = it.who === 'me' ? 'right' : 'left';
    wrap.style.padding = '0 72px';
    if (it.qr) {
      const q = h('div', 'qr', wrap); q.style.position = 'relative'; q.style.marginTop = '14px';
      it.qr.forEach(s => h('div', '', q, s));
    }
    const hh = wrap.offsetHeight;
    const o = { wrap, b, y: yy, hh, t: it.t, jitter: it.jitter };
    yy += hh + gap;
    return o;
  });
  const vh = bottom - top;
  return {
    update(t) {
      let last = -1;
      els.forEach((e, i) => {
        if (t >= e.t) last = i;
        const k = enter(t, e.t, 0.42);
        e.wrap.style.visibility = t >= e.t ? 'visible' : 'hidden';
        let jx = 0;
        if (e.jitter && t >= e.t && t < e.t + 0.22) jx = (hash(Math.floor(t * 30) + e.t) - 0.5) * 18;
        tf(e.wrap, { x: jx, y: (1 - k) * 60, o: k });
      });
      // rolagem: acompanha a última mensagem que entrou
      const need = i => (i < 0 ? 0 : Math.max(0, els[i].y + els[i].hh - vh + 10));
      const s = last < 0 ? 0 : lerp(need(last - 1), need(last), enter(t, els[last].t, 0.5, E.outCubic));
      list.style.transform = `translate3d(0,${-s}px,0)`;
    },
  };
}

// CTA final, igual nos dois vídeos (assinatura da campanha).
function buildCTA(cam, t0, pressAt) {
  const card = pos(h('div', 'abs', cam), 72, 250, 936, 527);
  card.style.borderRadius = '28px'; card.style.overflow = 'hidden'; card.style.border = '2px solid var(--line)'; card.style.background = 'var(--cream-2)';
  const slices = [0, 1, 2, 3].map(i => {
    const s = pos(h('div', 'abs', card), i * 234, 0, 234, 527);
    s.style.backgroundImage = 'url(../assets/capa.jpg)';
    s.style.backgroundSize = '936px 527px';
    s.style.backgroundPosition = `${-i * 234}px 0`;
    return s;
  });
  const chip = pos(h('div', 'chip abs', cam, 'Playbook gratuito · 11 páginas'), 72, 826);
  const title = pos(h('div', 'title abs', cam, 'Como vender crédito no WhatsApp com agentes de IA'), 72, 900, 936);
  title.style.fontSize = '64px';
  const btn = pos(h('div', 'abs', cam), 72, 1092, 936, 128);
  Object.assign(btn.style, { background: 'var(--ink)', borderRadius: '26px', color: 'var(--y)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px', fontFamily: 'Poppins', fontWeight: 700, fontSize: '46px', letterSpacing: '-0.01em' });
  h('span', '', btn, 'Baixe o playbook grátis');
  const arrow = h('span', '', btn, '→');
  const logos = pos(h('div', 'abs', cam), 72, 1268, 936, 70);
  Object.assign(logos.style, { display: 'flex', alignItems: 'center', gap: '36px' });
  const l1 = h('img', '', logos); l1.src = '../assets/ubots-logo.png'; l1.style.height = '54px';
  const d = h('div', '', logos); Object.assign(d.style, { width: '2px', height: '56px', background: 'var(--line)' });
  const l2 = h('img', '', logos); l2.src = '../assets/viacredi-logo.png'; l2.style.height = '68px';
  return {
    update(lt, t) {
      slices.forEach((s, i) => { const k = enter(t, t0 + 0.05 + i * 0.07, 0.6, E.outExpo); s.style.transform = `translate3d(0,${(1 - k) * 105}%,0)`; });
      const kc = enter(t, t0 + 0.35, 0.4); tf(chip, { y: (1 - kc) * 30, o: kc });
      const kt = enter(t, t0 + 0.45, 0.5); tf(title, { y: (1 - kt) * 40, o: kt });
      const kb = enter(t, t0 + 0.7, 0.5);
      const press = 1 - 0.035 * Math.sin(Math.PI * prog(t, pressAt, pressAt + 0.22));
      tf(btn, { y: (1 - kb) * 50, s: press, o: kb });
      tf(arrow, { x: 14 * Math.sin(Math.PI * prog(t, pressAt, pressAt + 0.3)) });
      const kl = enter(t, t0 + 0.9, 0.5); tf(logos, { y: (1 - kl) * 20, o: kl });
    },
  };
}
