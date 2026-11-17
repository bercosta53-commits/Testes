// Playbook Viacredi x Ubots — conteúdo dos slides (v. ajustada conforme revisão da Bianca)
const TOTAL = 13;
const pad = n => String(n).padStart(2, '0');

const P = {
  spark: '<path fill="currentColor" stroke="none" d="M12 1.5l2.3 7.2 7.2 2.3-7.2 2.3L12 20.5l-2.3-7.2L2.5 11l7.2-2.3z"/>',
  shield: '<path d="M12 2.8l7.5 3v5.6c0 5-3.2 8.4-7.5 10.2-4.3-1.8-7.5-5.2-7.5-10.2V5.8z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.6"/>',
  video: '<path d="M3 7.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3z"/><path d="M16 11.2l5-3v7.6l-5-3z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  arrow: '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  filechk: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  cam: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
};
const I = (n, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${P[n]}</svg>`;
const verified = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#25d366"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ticks = '<svg viewBox="0 0 24 24" width="17" height="17" style="vertical-align:-3px;margin-left:4px" fill="none" stroke="#53bdeb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12.5l4 4L13 8"/><path d="M9.5 15l1.5 1.5L18.5 8.5"/></svg>';
const waveSvg = (c = '#070401', w = 130, sw = 5) => `<svg class="wave" width="${w}" height="${w * .46}" viewBox="0 0 130 60" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"><path d="M4 12c12-14 22 14 34 0s22 14 34 0 22 14 34 0 14 6 20 0"/><path d="M4 30c12-14 22 14 34 0s22 14 34 0 22 14 34 0 14 6 20 0"/><path d="M4 48c12-14 22 14 34 0s22 14 34 0 22 14 34 0 14 6 20 0"/></svg>`;
const quoteGlyph = '<svg width="74" height="60" viewBox="0 0 74 60" fill="#fdc348"><path d="M0 36C0 16 12 3 30 0l3 8C22 11 17 17 16 25h16v35H0zM41 36c0-20 12-33 30-36l3 8c-11 3-16 9-17 17h16v35H41z"/></svg>';

const hdr = (n, dark) => `
<div class="hdr"><img class="u" src="img/ubots-${dark ? 'light' : 'dark'}.png"><div class="sep"></div><img class="v" src="img/viacredi${dark ? '-dark' : ''}.png"></div>
<div class="hr"><div class="chip">Playbook · Agentes de IA na oferta de crédito</div><div class="pn">${pad(n)}<i>/</i>${TOTAL}</div></div>`;

const wa = (o) => `<div class="wa" style="${o.style || ''}"><div class="wa-h">${I('back', 'class="back"')}<div class="av">${I('spark')}</div><div><div class="nm">${o.name}${verified}</div><div class="st">Conta comercial</div></div><div class="ic">${I('video')}${I('phone')}</div></div><div class="wa-b" style="${o.bstyle || ''}">${o.body}</div>${o.input === false ? '' : `<div class="wa-in">${I('plus')}<div class="box"></div>${I('cam')}${I('mic')}</div>`}</div>`;
const m = (t, html, time, tk) => `<div class="m ${t}" ${''}>${html}<span class="tm">${time}${tk ? ticks : ''}</span></div>`;
const btn = (icon, txt) => `<div class="wa-btn">${I(icon)}${txt}</div>`;

const AUTH = 'Giovanna Schwambach · Analista de Chatbots e WhatsApp, Viacredi';
const CONFIRM = '<span class="tag">[Fala A CONFIRMAR com a Giovanna]</span>';

const slides = [];

/* ---------------------------------------------------------------- 01 CAPA */
slides.push(`
<section class="slide light" id="s1">
  <div class="hdr" style="top:58px"><img class="u" src="img/ubots-dark.png"></div>
  <div class="abs" style="left:128px;top:208px;height:46px;border:2px solid #ece4d3;background:#fff;border-radius:30px;display:flex;align-items:center;gap:12px;padding:0 22px 0 20px;font:600 20px Poppins;box-shadow:0 4px 14px rgba(0,0,0,.05)"><span style="width:12px;height:12px;border-radius:50%;background:var(--amber)"></span>Playbook</div>
  <h1 class="abs pop" style="left:128px;top:296px;width:880px;font-weight:700;font-size:72px;line-height:1.12;letter-spacing:-.04em;white-space:nowrap">Como dar <span style="color:var(--amber)">liberdade à IA</span><br>na oferta de crédito<br>sem abrir mão<br>da segurança</h1>
  <p class="abs" style="left:128px;top:672px;width:800px;font:400 25px/1.6 Nunito;color:var(--muted)">Como a Viacredi fez o agente de IA conversar de verdade no WhatsApp e liberou mais de R$&nbsp;150&nbsp;mil em crédito ainda nos&nbsp;testes.</p>
  <div class="abs" style="left:128px;top:836px;font:700 17px Poppins;letter-spacing:.14em;color:#6b4a00">MATERIAL PARA</div>
  <div class="abs" style="left:128px;top:870px;display:flex;gap:14px;font:500 22px Poppins">
    <span style="border:2px solid #d9d2c3;border-radius:34px;padding:11px 26px;background:rgba(255,255,255,.6)">Cooperativas de crédito</span>
    <span style="border:2px solid #d9d2c3;border-radius:34px;padding:11px 26px;background:rgba(255,255,255,.6)">Bancos e fintechs</span>
    <span style="border:2px solid #d9d2c3;border-radius:34px;padding:11px 26px;background:rgba(255,255,255,.6)">Financeiras</span>
  </div>

  <div class="abs" style="left:1146px;top:32px;width:741px;height:1016px;border-radius:56px;background:linear-gradient(165deg,#ffe28f 0%,#fdc348 55%,#f5b236 100%)"></div>
  <div class="abs pn" style="left:1738px;top:66px;font-size:19px">01<i>/</i>${TOTAL}</div>
  <div class="phone" style="left:1290px;top:86px;width:454px;height:908px"><div class="scr">
    <div class="sb"><span>9:41</span><div class="isl"></div><svg viewBox="0 0 70 20"><rect x="0" y="12" width="5" height="8" rx="1.5" fill="#111"/><rect x="8" y="8" width="5" height="12" rx="1.5" fill="#111"/><rect x="16" y="4" width="5" height="16" rx="1.5" fill="#111"/><rect x="24" y="0" width="5" height="20" rx="1.5" fill="#111"/><path d="M38 6a10 10 0 0 1 14 0M41 10a6 6 0 0 1 8 0" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="45" cy="14" r="1.8" fill="#111"/><rect x="56" y="3" width="14" height="14" rx="4" fill="#111"/></svg></div>
    ${wa({ name: 'Agente de Crédito', style: 'flex:1;border-radius:0', bstyle: 'padding:16px 14px;gap:9px', body: `
      <div style="align-self:center;background:#fff;border-radius:10px;font:500 15px Inter;color:#555;padding:4px 14px;margin-bottom:4px">Hoje</div>
      <div class="m in" style="max-width:90%"><div class="aitag" style="align-self:flex-start;display:inline-flex;margin:0 0 6px">${I('spark')}Agente de IA</div><br>Oi! Você tem um crédito pré-aprovado. Quer ver como ele pode ajudar nos seus planos?<span class="tm">10:30</span></div>
      ${m('out', 'Quero sim! Estou reformando a cozinha.', '10:31', 1)}
      <div class="m in" style="max-width:90%;padding-bottom:8px">Que legal! Simulei uma opção para a sua reforma:
        <div style="background:#f4f0e8;border:1px solid #e4dccb;border-radius:12px;padding:12px 14px;margin:10px 0 4px"><div style="font:500 15px Inter;color:#555">Crédito Reforma</div><div style="font:700 28px/1.25 Inter">R$ 15.000,00</div><div style="font:500 15px Inter;color:#8a5a00;margin-top:2px">24x · Juros e IOF inclusos</div></div><span class="tm">10:31</span></div>
      <div class="wa-btn">${I('ext')}Ver condições no app</div>
      ${m('out', 'Perfeito, quero contratar.', '10:33', 1)}
      <div class="badge">${I('check', 'stroke-width="3"')}Crédito contratado</div>` })}
  </div></div>
  <img class="abs" src="img/icon-a.png" style="left:1218px;top:226px;width:106px;height:106px;border-radius:28px;transform:rotate(-8deg);box-shadow:0 14px 30px rgba(80,40,120,.3)">
  <img class="abs" src="img/icon-b.png" style="left:1738px;top:694px;width:92px;height:92px;border-radius:26px;transform:rotate(7deg);box-shadow:0 14px 30px rgba(0,80,30,.3)">
</section>`);

/* ---------------------------------------------------------------- 02 DOR (nova) */
const pain = (n, title, text, pg, pgName) => `
<div class="card" style="padding:30px 34px 28px;display:flex;flex-direction:column;gap:12px">
  <div style="display:flex;align-items:center;gap:16px"><div style="width:46px;height:46px;border-radius:50%;background:var(--amber);font:700 24px Poppins;display:flex;align-items:center;justify-content:center;flex:none">${n}</div><div class="pop" style="font:600 28px/1.2 Poppins;letter-spacing:-.02em">${title}</div></div>
  <div style="font:400 22px/1.5 Nunito;color:var(--muted);flex:1">${text}</div>
  <div style="display:flex;align-items:center;gap:12px;font:600 18px Poppins;color:#5a3d00"><span style="background:rgba(253,195,72,.3);border-radius:22px;padding:6px 16px;flex:none;white-space:nowrap">pág. ${pg}</span><span style="font:600 19px Nunito;color:var(--ink)">${pgName}</span><span style="width:22px;margin-left:auto;color:var(--amber-d)">${I('arrow')}</span></div>
</div>`;
slides.push(`
<section class="slide light" id="s2">${hdr(2)}
  <h2 class="t">O crédito está pré-aprovado. <em>A conversa, não.</em></h2>
  <p class="sub" style="top:236px">Quatro sinais de que a oferta de crédito ficou parada na conversa. Cada um aponta para a página que o resolve.</p>

  <div class="card abs" style="left:128px;top:344px;width:552px;height:656px;padding:30px 30px 0;display:flex;flex-direction:column">
    <div style="font:700 16px Poppins;letter-spacing:.14em;color:#6b4a00">O QUE O COOPERADO VÊ</div>
    <div style="margin-top:18px;border-radius:26px;overflow:hidden;box-shadow:0 0 0 2px #eadfc7">
    ${wa({ name: 'Agente de Crédito', input: false, bstyle: 'padding:22px 16px;gap:12px;min-height:250px', body: `
      <div style="align-self:center;background:#fff;border-radius:10px;font:500 14px Inter;color:#555;padding:4px 14px">Hoje</div>
      <div class="m in" style="max-width:92%;font-size:19px">Olá. Temos uma linha de crédito pré-aprovada para você. Deseja saber mais?<span class="tm">10:02${ticks.replace('#53bdeb', '#53bdeb')}</span></div>
      <div style="align-self:center;margin-top:34px;width:70px;border-top:3px dotted #bcae92"></div>` })}
    </div>
    <div style="margin-top:24px;font:700 38px/1.1 Poppins;letter-spacing:-.03em">Visualizada.<br><span style="color:var(--amber)">Sem resposta.</span></div>
    <div style="margin-top:14px;font:400 21px/1.5 Nunito;color:var(--muted)">O crédito existe, o cooperado tem interesse em potencial, mas a conversa não acontece.</div>
  </div>

  <div class="abs" style="left:720px;top:344px;width:1072px;height:656px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:32px">
    ${pain(1, 'O cooperado não responde', 'A mensagem chega como mais um disparo. Sem uma conversa de verdade, a oferta não anda.', 6, 'Sem roteiro pronto')}
    ${pain(2, 'O bot não entende', 'Qualquer resposta fora do roteiro cai em “não entendi” e a conversa trava.', 5, 'Explique ao agente o papel dele')}
    ${pain(3, 'Medo de a IA falar demais', 'Dar liberdade ao agente assusta quando não está claro o que ele pode e o que nunca pode fazer.', 7, 'Liberdade com transparência e segurança')}
    ${pain(4, 'Sem régua para medir', 'Sem indicadores definidos, não dá para saber se o teste funcionou nem se vale ampliar.', 12, 'Teste em volume controlado e meça')}
  </div>
</section>`);

/* ---------------------------------------------------------------- 03 PONTO DE PARTIDA */
const sp = (n, t, d, dark) => `<div style="${dark ? 'background:#070401;color:#fff;' : 'background:#fff;border:2px solid #f3ead6;'}border-radius:28px;flex:1;display:flex;align-items:center;gap:26px;padding:0 34px;box-shadow:0 10px 30px rgba(160,120,30,.08)"><div class="pop" style="font:700 64px Poppins;color:var(--amber);width:48px;text-align:center">${n}</div><div><div class="pop" style="font:600 25px/1.25 Poppins;${dark ? 'color:var(--yellow)' : ''}">${t}</div><div style="font:400 21px/1.45 Nunito;color:${dark ? 'var(--muted-dark)' : 'var(--muted)'};margin-top:4px">${d}</div></div></div>`;
slides.push(`
<section class="slide light" id="s3">${hdr(3)}
  <h2 class="t">01. Entenda o <em>ponto de partida</em></h2>
  <p class="sub" style="top:236px">Uma das maiores cooperativas de crédito do Brasil decidiu testar IA generativa na venda de crédito, sem abrir mão da proximidade com os cooperados.</p>

  <div class="card abs" style="left:128px;top:344px;width:991px;height:656px;overflow:hidden;border-radius:34px">
    <div style="padding:38px 46px 0;font:400 24px/1.62 Nunito">
      <p>A Viacredi, cooperativa do Sistema Ailos com sede em Blumenau, tem <b style="font-weight:800">mais de 1 milhão de cooperados</b> e <b style="font-weight:800">mais de 100 postos</b> em Santa Catarina e no Paraná. A proximidade com os cooperados sempre esteve no centro da sua atuação.</p>
      <p style="margin-top:20px">O desafio era ampliar a oferta de crédito com agentes de IA sem abrir mão da proximidade no atendimento. Era um território novo: a cooperativa usava bots de fluxo, baseados em regras fixas, e ainda não tinha indicadores de IA generativa para orientar o teste.</p>
    </div>
    <div class="abs" style="left:46px;right:46px;top:372px;border-radius:22px;background:linear-gradient(100deg,#fdc348,#ffd56f);padding:16px 28px;display:flex;align-items:center;gap:28px;height:116px">
      <div style="flex:none"><div style="font:700 15px Poppins;letter-spacing:.12em;color:#4a3300">NOS TESTES</div><div class="pop" style="font:700 46px/1.05 Poppins;letter-spacing:-.04em">+R$ 150 mil</div></div>
      <div style="font:600 21px/1.4 Nunito;color:#2b1c00;flex:1;border-left:2px solid rgba(7,4,1,.25);padding-left:26px">em crédito liberado por meio do agente, ainda na fase de testes. <span style="font-weight:800;white-space:nowrap">Veja os resultados na pág. 9 →</span></div>
    </div>
    <div class="abs" style="left:0;right:0;bottom:0;height:104px;background:#fff6e0;border-top:2px solid #f6e9c9;display:flex;align-items:center;gap:22px;padding:0 46px">
      <div style="width:66px;height:66px;border-radius:50%;background:var(--amber);font:700 28px Poppins;display:flex;align-items:center;justify-content:center;flex:none">G</div>
      <div><div style="font:700 26px Poppins;letter-spacing:-.02em">Giovanna Schwambach <span style="font:500 20px Nunito;color:var(--muted);letter-spacing:0"> · Analista de Chatbots e WhatsApp</span></div>
      <div style="font:400 20px Nunito;color:var(--muted);margin-top:2px">Conduziu o projeto desde o primeiro teste até a operação atual.</div></div>
    </div>
  </div>

  <div class="abs pop" style="left:1152px;top:344px;font:600 26px Poppins;letter-spacing:-.02em">Ponto de partida</div>
  <div class="abs" style="left:1152px;top:394px;width:640px;height:606px;display:flex;flex-direction:column;gap:24px">
    ${sp(1, 'Bots de fluxo', 'Conversas limitadas a regras e caminhos predefinidos.')}
    ${sp(2, 'Sem histórico', 'Sem indicadores prévios de IA generativa para comparar.')}
    ${sp(3, 'Proximidade em jogo', 'Testar IA na oferta de crédito sem perder o jeito próximo de atender.', true)}
  </div>
</section>`);

/* ---------------------------------------------------------------- 04 EVITE EMPILHAR REGRAS */
const rl = (n, t) => `<div style="display:flex;align-items:center;gap:26px;font:500 22px Nunito;color:#f3ecdc;height:46px"><span style="width:26px;color:#8a8372;font:400 17px Inter;text-align:right">${n}</span><span style="background:linear-gradient(transparent 62%,rgba(253,195,72,.35) 62%);padding:0 3px">${t}</span></div>`;
slides.push(`
<section class="slide light" id="s4">${hdr(4)}
  <h2 class="t">02. Evite <em>empilhar regras</em> no agente</h2>
  <p class="sub" style="top:236px">Cada “não pode” parecia tornar o agente mais seguro. Na prática, a conversa ficava rígida e o tom, robótico.</p>

  <div class="abs" style="left:128px;top:336px;width:785px;height:440px;border-radius:30px;background:#141009;box-shadow:0 22px 50px rgba(40,25,0,.28);overflow:hidden">
    <div style="height:62px;border-bottom:1px solid #2a2418;display:flex;align-items:center;padding:0 22px;gap:9px"><i style="width:14px;height:14px;border-radius:50%;background:#3b3425"></i><i style="width:14px;height:14px;border-radius:50%;background:#3b3425"></i><i style="width:14px;height:14px;border-radius:50%;background:#3b3425"></i><span style="font:600 20px Poppins;color:#fff;margin-left:12px">Instruções por regras</span><span style="margin-left:auto;background:var(--amber);border-radius:22px;font:700 16px Poppins;padding:7px 16px">+ 1 regra a cada ajuste</span></div>
    <div style="padding:32px 36px">${rl(1, 'Não fale sobre…')}${rl(2, 'Não responda se…')}${rl(3, 'Não ofereça…')}${rl(4, 'Sempre use a frase…')}${rl(5, 'Não saia do roteiro…')}
      <div style="display:flex;align-items:center;gap:26px;height:46px"><span style="width:26px;color:#8a8372;font:400 17px Inter;text-align:right">6</span><span style="width:290px;height:14px;border-radius:8px;background:#4a3b17"></span><span style="width:3px;height:30px;background:var(--amber)"></span></div></div>
  </div>
  <div class="abs" style="left:913px;top:567px;width:2px"></div>
  <div class="abs" style="left:939px;top:525px;width:62px;height:62px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(200,140,0,.35)"><span style="width:28px;color:#070401">${I('arrow', 'stroke-width="2.6"')}</span></div>

  <div class="card abs" style="left:1008px;top:336px;width:784px;height:440px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column">
    <div style="padding:20px 24px 14px;font:600 21px Poppins;background:#fff">Conversa resultante</div>
    ${wa({ name: 'Assistente de crédito', input: false, style: 'flex:1', bstyle: 'padding:18px 22px;gap:9px', body: `
      <div class="m in" style="max-width:90%;font-size:20px">Olá. Temos uma linha de crédito disponível para você. Deseja saber mais? Responda SIM ou NÃO.<span class="tm">10:02</span></div>
      <div style="display:flex;gap:9px;width:90%"><div class="wa-btn half">${I('back')}SIM</div><div class="wa-btn half">${I('back')}NÃO</div></div>
      ${m('out', 'Depende, pra que serve?', '10:04', 1)}
      <div class="m in" style="font-size:20px">Não entendi sua resposta. Responda SIM ou NÃO.<span class="tm">10:04</span></div>` })}
  </div>
  <div class="abs" style="left:128px;top:788px;font:400 17px Nunito;color:var(--muted)">Exemplo ilustrativo.</div>

  <div class="card abs" style="left:128px;top:832px;width:1060px;height:168px;border-radius:26px;display:flex;align-items:center;gap:30px;padding:0 40px">
    <div style="flex:none;margin-top:-18px">${quoteGlyph}</div>
    <div><div style="font:italic 400 24px/1.55 Nunito">“A gente colocava regra atrás de regra: não pode isso, não pode aquilo. E o agente ficava cada vez mais mecânico.”</div>
    <div class="cite" style="margin-top:6px">${AUTH} ${CONFIRM}</div></div>
  </div>
  <div class="abs" style="left:1228px;top:832px;width:564px;height:168px;border-radius:26px;background:#070401;color:#fff;display:flex;align-items:center;gap:28px;padding:0 36px"><div style="flex:none">${waveSvg('#fdc348', 94, 4.5)}</div><div style="font:600 25px/1.4 Poppins;letter-spacing:-.015em">Na prática, era IA generativa trabalhando com os mesmos limites de um bot de fluxo.</div></div>
</section>`);

/* ---------------------------------------------------------------- 05 EXPLIQUE O PAPEL (escura) */
const li = (sign, t) => `<div style="display:flex;gap:12px;font:400 21px/1.4 Nunito;margin-top:12px"><span style="color:var(--amber);font-weight:800;width:16px;flex:none">${sign}</span><span>${t}</span></div>`;
slides.push(`
<section class="slide dark" id="s5">${hdr(5, true)}
  <h2 class="t">03. Explique ao agente <em>o papel dele</em></h2>
  <p class="sub" style="top:236px;max-width:1500px">Em julho de 2026, a Viacredi reduziu as regras, deixou claro o papel do agente e preservou os guardrails de segurança.</p>

  <div class="abs" style="left:128px;top:316px;width:330px;height:484px;border:2px dashed #4a4336;border-radius:30px;padding:34px 30px">
    <div style="font:700 15px Poppins;letter-spacing:.14em;color:#d3cdbd">ANTES</div>
    <div class="pop" style="font:600 30px/1.2 Poppins;margin:10px 0 4px;color:#fff">Regras</div>
    <div style="font:400 19px Nunito;color:#d3cdbd;margin-bottom:12px">O que saiu</div>
    <div style="display:flex;gap:12px;font:400 21px/1.4 Nunito;margin-top:14px;color:#d3cdbd"><span style="font-weight:800;width:16px;flex:none">×</span><span style="text-decoration:line-through;text-decoration-color:#8a8372">Regras de comportamento em excesso</span></div>
    <div style="display:flex;gap:12px;font:400 21px/1.4 Nunito;margin-top:14px;color:#d3cdbd"><span style="font-weight:800;width:16px;flex:none">×</span><span style="text-decoration:line-through;text-decoration-color:#8a8372">Roteiro fechado para cada resposta</span></div>
    <div style="margin-top:18px;border-top:1px dashed #4a4336;padding-top:14px;font:400 18px/1.5 Nunito;color:#a59e8b;font-style:italic">Não fale sobre…<br>Não responda se…<br>Sempre use a frase…</div>
  </div>
  <div class="abs" style="left:490px;top:316px;width:1302px;height:484px;border:2px solid var(--amber);border-radius:30px;background:#1a1307;padding:24px 38px 0">
    <div style="display:flex;align-items:center;gap:14px"><div style="font:700 15px Poppins;letter-spacing:.14em;color:var(--amber)">DEPOIS</div><div class="pop" style="font:600 30px Poppins;letter-spacing:-.02em">Papel e contexto</div><span style="margin-left:14px;font:600 15px Nunito;background:#2b2210;color:#d3cdbd;border-radius:20px;padding:4px 14px">Exemplo genérico</span></div>
    <div style="display:grid;grid-template-columns:1fr 330px;gap:12px 40px;margin-top:16px;align-items:stretch">
      <div style="border-left:5px solid var(--amber);padding-left:24px;font:400 20px/1.45 Nunito;color:#f4efe2;display:flex;align-items:center">Você é o agente de crédito da cooperativa no WhatsApp. Seu objetivo é entender o que o cooperado está planejando e mostrar, quando fizer sentido, como o crédito pré-aprovado pode ajudar.</div>
      <div style="border:2px solid #4a3a14;background:#241a09;border-radius:16px;padding:10px 16px;font:400 18px/1.4 Nunito"><b class="pop" style="font:600 17px Poppins;color:var(--amber)">+ O que entrou</b><br>O objetivo da conversa e o contexto do cooperado e da oferta</div>
      <div style="border-left:5px solid var(--amber);padding-left:24px;font:400 20px/1.45 Nunito;color:#f4efe2;display:flex;align-items:center">Converse sobre o que ele trouxer, com o jeito próximo da cooperativa. Não insista na oferta: primeiro entenda o interesse.</div>
      <div style="border:2px solid #4a3a14;background:#241a09;border-radius:16px;padding:10px 16px;font:400 18px/1.4 Nunito"><b class="pop" style="font:600 17px Poppins;color:var(--amber)">+ O que entrou</b><br>Liberdade para conversar sobre o que o cooperado trouxer</div>
      <div style="border-left:5px solid #fff;padding-left:24px;font:400 20px/1.45 Nunito;color:#f4efe2;display:flex;align-items:center">Sempre informe juros, IOF e demais custos com clareza. A contratação é feita apenas pelo aplicativo; oriente o passo a passo. Se ele quiser comparar linhas ou pedir algo que exige análise, transfira para o time com um resumo da conversa.</div>
      <div style="background:var(--amber);color:#070401;border-radius:16px;padding:10px 16px;font:400 18px/1.4 Nunito"><b class="pop" style="font:600 17px Poppins;display:inline-flex;align-items:center;gap:7px"><span style="width:20px;display:block">${I('shield')}</span>O que ficou</b><br>Guardrails críticos de segurança, transparência sobre custos e contratação pelo canal seguro</div>
    </div>
    <div style="margin-top:12px;font:400 17px/1.4 Nunito;color:#d3cdbd">Saudação, transbordo e volume de mensagens passaram a ser ajustados com apoio da IA, sem criar uma regra a cada mudança.</div>
  </div>

  <div class="abs" style="left:128px;top:828px;width:1664px;display:flex;align-items:center;gap:30px">
    <div style="flex:none">${quoteGlyph}</div>
    <div><div style="font:italic 400 22px/1.45 Nunito;color:#f4efe2">“Quando expliquei ao agente qual era o papel dele e o que ele precisava alcançar, a experiência melhorou na hora. Hoje, quando aparece um problema, eu levo para a própria IA e a gente constrói a solução junto.”</div>
    <div class="cite" style="margin-top:4px">${AUTH} ${CONFIRM}</div></div>
  </div>
  <div class="abs" style="left:128px;top:936px;width:1664px;height:64px;border-radius:20px;background:var(--amber);display:flex;align-items:center;justify-content:space-between;padding:0 40px"><span class="pop" style="font:700 26px Poppins;letter-spacing:-.025em">Segurança onde importa, conversa de verdade no resto.</span><span style="margin-top:2px">${waveSvg('#070401', 88, 4.5)}</span></div>
</section>`);

/* ---------------------------------------------------------------- 06 SEM ROTEIRO PRONTO */
const step = (n, t, d, top, h) => `<div class="card abs" style="left:946px;top:${top}px;width:846px;height:${h}px;border-radius:24px;display:flex;align-items:center;gap:22px;padding:0 30px"><div style="width:46px;height:46px;border-radius:50%;background:var(--amber);font:700 22px Poppins;display:flex;align-items:center;justify-content:center;flex:none">${n}</div><div><div class="pop" style="font:600 26px Poppins;letter-spacing:-.02em">${t}</div><div style="font:400 21px/1.45 Nunito;color:var(--muted);margin-top:2px">${d}</div></div></div>`;
slides.push(`
<section class="slide light" id="s6">${hdr(6)}
  <h2 class="t">04. Sem <em>roteiro pronto</em></h2>
  <p class="sub" style="top:236px">Poucos dias após a mudança, uma conversa sobre reforma de cozinha terminou em contratação de crédito, sem roteiro pronto.</p>

  <div class="abs" style="left:128px;top:386px;width:652px;height:700px;border-radius:40px 40px 0 0;background:#fdeec4"></div>
  <style>#s6 .m{font-size:17px;padding:8px 12px 6px;max-width:86%}#s6 .wa-b{gap:8px;padding:12px 14px}#s6 .wa-in{padding:10px 14px}#s6 .wa-in .box{height:42px}</style>
  <div class="phone" style="left:200px;top:343px;width:524px;height:742px;border-radius:72px 72px 0 0"><div class="scr" style="border-radius:60px 60px 0 0">
    <div class="sb"><span>9:41</span><div class="isl"></div><svg viewBox="0 0 70 20"><rect x="0" y="12" width="5" height="8" rx="1.5" fill="#111"/><rect x="8" y="8" width="5" height="12" rx="1.5" fill="#111"/><rect x="16" y="4" width="5" height="16" rx="1.5" fill="#111"/><rect x="24" y="0" width="5" height="20" rx="1.5" fill="#111"/><path d="M38 6a10 10 0 0 1 14 0M41 10a6 6 0 0 1 8 0" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="45" cy="14" r="1.8" fill="#111"/><rect x="56" y="3" width="14" height="14" rx="4" fill="#111"/></svg></div>
    ${wa({ name: 'Agente Viacredi', style: 'flex:1;border-radius:0', bstyle: '', body: `
      ${m('out', 'Já tenho um crédito contratado, mas achei bom saber que tem outro disponível.', '14:21', 1)}
      <div class="m in" id="b1">Que bom! Posso perguntar o que você está planejando?<span class="tm">14:21</span></div>
      <div class="m out" id="b2">Estou reformando a cozinha.<span class="tm">14:23${ticks}</span></div>
      <div class="m in">Que legal! Cozinha nova é um projeto e tanto: móveis, eletros e obra ao mesmo tempo.<span class="tm">14:23</span></div>
      <div class="m in" id="b3">Essa linha de crédito pode ajudar com os gastos da reforma? Quer ver as condições?<span class="tm">14:24</span></div>
      <div class="m out" id="b4">Quero! Vou contratar para terminar a obra.<span class="tm">14:26${ticks}</span></div>
      <div class="badge">${I('check', 'stroke-width="3"')}Contratação</div>` })}
  </div></div>

  ${step(1, 'Escuta', 'Em vez de insistir na oferta, o agente procura entender o interesse.', 349, 104)}
  ${step(2, 'Contexto', 'A cooperada fala da reforma, e o agente acompanha o assunto com naturalidade.', 500, 132)}
  ${step(3, 'Oferta com sentido', 'O crédito passa a fazer sentido dentro do plano da cooperada.', 682, 104)}
  ${step(4, 'Decisão da cooperada', 'A cooperada decide contratar. A conversa não seguiu um roteiro pronto.', 834, 104)}
  <svg class="abs" style="left:0;top:0" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" stroke="#070401" stroke-width="2.4" id="lines"></svg>
  <div class="abs" style="left:946px;top:982px;font:400 17px Nunito;color:var(--muted)">Reconstituição a partir do relato do projeto.</div>
</section>`);

/* ---------------------------------------------------------------- 07 LIBERDADE + TRANSPARÊNCIA */
const sc = (n, t, d) => `<div style="display:flex;gap:18px;align-items:flex-start;padding:24px 28px 0"><div class="num" style="font-size:60px;margin-top:-6px">${n}</div><div><div class="pop" style="font:600 26px Poppins;letter-spacing:-.02em">${t}</div><div style="font:400 20px/1.45 Nunito;color:var(--muted);margin-top:4px;min-height:58px">${d}</div></div></div>`;
slides.push(`
<section class="slide light" id="s7">${hdr(7)}
  <h2 class="t" style="top:166px;line-height:1.15">05. Combine liberdade com<br><em>transparência e segurança</em></h2>
  <p class="sub" style="top:362px;font-size:22.5px;max-width:1000px;line-height:1.55;top:326px">O agente esclarece custos, orienta a contratação pelo canal seguro e envolve o time humano quando necessário.</p>
  <div class="abs" style="left:1260px;top:150px;width:532px;border-left:4px solid var(--amber);padding-left:26px">
    <div style="font:italic 400 22px/1.55 Nunito">“O mercado costuma travar tudo num roteiro fechado. A liberdade guiada por contexto é o que deixa a experiência perto de um atendimento humano bem feito.”</div>
    <div class="cite" style="margin-top:8px;font-size:17.5px">${AUTH} ${CONFIRM}</div>
  </div>

  <div class="card abs" style="left:128px;top:424px;width:534px;height:576px;border-radius:30px;overflow:hidden">${sc(1, 'Custos às claras', 'Transparência sem esperar o cooperado insistir.')}
    ${wa({ name: 'Agente Viacredi', style: 'margin:14px 22px 0;height:438px;border-radius:20px 20px 0 0', input: false, bstyle: 'padding:12px 12px;gap:7px', body: `
      ${m('out', 'Quais são os custos desse crédito?', '09:12', 1)}
      <div class="m in" style="font-size:16.5px">É um crédito com juros e IOF. Antes de contratar, você vê o valor de cada custo na simulação.<span class="tm">09:12</span></div>
      <div class="m in" style="font-size:16.5px">Se quiser comparar com outras linhas, eu te encaminho para o nosso time.<span class="tm">09:13</span></div>
      <div class="wa-btn" style="font-size:16.5px">${I('users')}Falar com o time humano</div>` })}</div>

  <div class="card abs" style="left:692px;top:424px;width:535px;height:576px;border-radius:30px;overflow:hidden">${sc(2, 'Fechamento pelo app', 'O canal seguro vira orientação, e não bloqueio.')}
    ${wa({ name: 'Agente Viacredi', style: 'margin:14px 22px 0;height:438px;border-radius:20px 20px 0 0', input: false, bstyle: 'padding:12px 12px;gap:7px', body: `
      ${m('out', 'Dá para fechar aqui mesmo, pelo WhatsApp?', '16:40', 1)}
      <div class="m in" style="font-size:16.5px">Por segurança, a contratação é 100% digital pelo aplicativo. É rápido:
        <div style="margin-top:6px;display:flex;flex-direction:column;gap:5px"><div><span class="no">1</span>Abra o app e acesse Crédito</div><div><span class="no">2</span>Escolha a proposta enviada</div><div><span class="no">3</span>Revise e confirme</div></div><span class="tm">16:41</span></div>
      <div class="wa-btn" style="font-size:16.5px">${I('ext')}Abrir o aplicativo</div>` })}</div>

  <div class="card abs" style="left:1258px;top:424px;width:534px;height:576px;border-radius:30px;overflow:hidden">${sc(3, 'Transbordo com contexto', 'Quando o humano assume, recebe o resumo da conversa e continua sem pedir que o cooperado repita nada.')}
    <div style="margin:18px 22px 0;border:2px solid #efe4cc;border-radius:20px 20px 0 0;height:438px;background:#fdfaf3;overflow:hidden">
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#fff;border-bottom:1px solid #efe4cc"><img src="img/ubots-dark.png" style="height:25px"><span style="display:flex;align-items:center;gap:7px;font:600 15px Nunito;background:#fff3d1;border-radius:9px;padding:4px 11px"><span style="width:16px">${I('inbox')}</span>Transbordos</span><span style="margin-left:auto;width:30px;height:30px;border-radius:50%;background:var(--amber)"></span></div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px"><div style="width:42px;height:42px;border-radius:50%;background:#070401;color:#fff;display:flex;align-items:center;justify-content:center"><span style="width:21px">${I('user')}</span></div><div><div class="pop" style="font:600 17px Poppins">Maria</div><div style="font:400 14px Nunito;color:#6b6556">WhatsApp · agora</div></div><span style="margin-left:auto;background:var(--amber);border-radius:12px;font:700 14px Poppins;padding:4px 12px">Transbordo</span></div>
      <div style="margin:0 14px;background:#fff;border:1px solid #efe4cc;border-left:5px solid var(--amber);border-radius:12px;padding:12px 14px">
        <div class="pop" style="font:600 16px Poppins;display:flex;align-items:center;gap:7px;margin-bottom:8px"><span style="width:15px;color:var(--amber-d)">${I('spark')}</span>Nota para o time de negócios</div>
        <div style="font:400 15px/1.45 Nunito;display:grid;grid-template-columns:auto 1fr;gap:3px 10px"><span style="color:var(--muted)">Cooperado:</span><span>Maria</span><span style="color:var(--muted)">Interesse:</span><span>Crédito pessoal pré-aprovado</span><span style="color:var(--muted)">Ponto em aberto:</span><span>quer comparar com outras linhas</span><span style="color:var(--muted)">Histórico:</span><span>conversa completa anexada</span></div></div>
      <div style="margin:18px 14px 0;background:#070401;color:#fff;border-radius:12px;height:44px;display:flex;align-items:center;justify-content:center;gap:8px;font:600 17px Poppins">Assumir conversa <span style="width:18px;color:var(--amber)">${I('arrow')}</span></div>
    </div></div>
  <style>.no{display:inline-flex;width:22px;height:22px;border-radius:50%;background:#070401;color:#fff;font:700 13px Inter;align-items:center;justify-content:center;margin-right:8px}</style>
</section>`);

/* ---------------------------------------------------------------- 08 TIMELINE */
const tl = (n, t, ttl, d, pill, active, pstyle) => `<div style="position:relative;padding:36px 30px 0;${active ? 'background:#070401;color:#fff' : ''};display:flex;flex-direction:column">
  <div style="position:absolute;left:0;right:0;top:0;height:12px;${pstyle}"></div>
  <div class="num" style="font-size:56px">${n}</div>
  <div class="pop" style="font:600 25px/1.3 Poppins;letter-spacing:-.02em;margin-top:14px;min-height:66px">${t}</div>
  <div style="font:400 20px/1.5 Nunito;color:${active ? 'var(--muted-dark)' : 'var(--muted)'};margin-top:12px;flex:1">${d}</div>
  <div style="margin-bottom:34px"><span style="${pill}">${ttl}</span></div></div>`;
const pillS = 'display:inline-block;font:600 17px Poppins;border-radius:22px;padding:7px 18px;';
slides.push(`
<section class="slide light" id="s8">${hdr(8)}
  <h2 class="t">06. Teste pouco, <em>pause e volte melhor</em></h2>
  <p class="sub" style="top:236px">A Viacredi começou com cooperados reais, pequenos volumes e filtros de risco, e usou cada pausa para ajustar o agente.</p>
  <div class="card abs" style="left:128px;top:344px;width:1664px;height:452px;border-radius:30px;overflow:hidden;display:grid;grid-template-columns:repeat(5,1fr)">
    ${tl('01', 'Abril a junho de 2026', 'Testes controlados', 'Testes controlados. Pausas frequentes para refinar o agente, preparar o time e definir os novos indicadores.', pillS + 'background:#fff0c9;color:#5a3d00', false, 'background:var(--amber)')}
    ${tl('02', 'Junho de 2026', 'Pausa', 'Pausa total para reestruturar os disparos e planejar a escala.', pillS + 'background:#ece7dc;color:#5a5446', false, 'background:repeating-linear-gradient(135deg,#d8d0c0 0 8px,#ece7dc 8px 16px)')}
    ${tl('03', '1ª semana de julho de 2026', 'Virada', 'Reformulação das instruções e esclarecimento do papel do agente: menos regras e mais contexto.', pillS + 'background:var(--amber);color:#070401', true, 'background:var(--amber)')}
    ${tl('04', '2ª semana de julho de 2026', 'Retomada', 'Testes retomados com a nova versão do agente.', pillS + 'background:#fff0c9;color:#5a3d00', false, 'background:var(--amber)')}
    ${tl('05', 'Até dezembro de 2026', 'Meta', 'Meta de rodar mais de 10% das ações ativas com agente generativo.', pillS + 'border:2px dashed #7a5a14;color:#5a3d00;padding:5px 16px', false, 'background:repeating-linear-gradient(90deg,var(--amber) 0 12px,transparent 12px 24px)')}
  </div>
  <div class="card abs" style="left:128px;top:828px;width:1664px;height:172px;border-radius:30px;display:flex;align-items:center;gap:50px;padding:0 46px;border-color:#fbd98b">
    <div style="flex:none;width:420px"><div class="pop" style="font:700 30px Poppins;letter-spacing:-.025em">O que ficou com o time</div>
      <div style="margin-top:10px">${waveSvg('#fdc348', 100, 4.5)}</div></div>
    <div style="flex:1.5;font:400 20px/1.5 Nunito;color:var(--ink)">O primeiro agente foi construído em parceria. Depois disso, o time da Viacredi passou a criar os próprios agentes: a Giovanna já colocou quatro no ar por conta própria, ajustando instruções, tom e transbordo no ritmo da operação. Quando surgia uma dúvida técnica ou um caso novo, o time da Ubots entrava como apoio.</div>
    <div style="flex:1;font:400 20px/1.5 Nunito;color:var(--ink)"><b style="font-weight:800">Próximo passo:</b> levar a IA para produtos sem risco de crédito, como cartões e aplicações, no onboarding de novos cooperados.</div>
  </div>
</section>`);

/* ---------------------------------------------------------------- 09 RESULTADOS (escura) */
const rc = (lab, big, txt, extra = '') => `<div style="border:2px solid #2a2418;background:#110d05;border-radius:30px;padding:28px 36px;display:flex;flex-direction:column;justify-content:center;${extra}"><div><span style="display:inline-block;font:700 15px Poppins;letter-spacing:.12em;color:var(--amber);background:#2b2210;border-radius:22px;padding:7px 16px">${lab}</span></div>${big}<div style="font:400 19px/1.45 Nunito;color:var(--muted-dark);margin-top:8px">${txt}</div></div>`;
slides.push(`
<section class="slide dark" id="s9">${hdr(9, true)}
  <h2 class="t">07. O que a Viacredi <em>alcançou ainda nos testes</em></h2>
  <p class="sub" style="top:236px">Resultados da fase de testes, antes de a operação estar totalmente estruturada.</p>
  <div class="abs" style="left:128px;top:344px;width:560px;height:580px;border-radius:34px;background:linear-gradient(165deg,#ffd978,#fdc348 55%,#f5b236);padding:44px 48px;color:#070401">
    <div class="abs" style="right:44px;top:44px">${waveSvg('#070401', 130, 5)}</div>
    <div style="position:absolute;left:44px;right:44px;top:170px"><span style="display:inline-block;font:700 15px Poppins;letter-spacing:.12em;background:rgba(7,4,1,.12);border-radius:22px;padding:7px 16px">GERAÇÃO DE NEGÓCIO</span>
      <div class="pop" style="font:700 84px/1.1 Poppins;letter-spacing:-.05em;margin-top:20px">+R$ 150 mil</div>
      <div style="font:600 24px/1.5 Nunito;margin-top:12px">em crédito liberado por meio do agente, ainda na fase de testes.</div></div>
  </div>
  <div class="abs" style="left:720px;top:344px;width:1072px;height:580px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:minmax(0,1fr) minmax(0,1fr);gap:24px">
    ${rc('TRANSBORDO COM CONTEXTO', '<div class="pop" style="font:600 32px/1.15 Poppins;letter-spacing:-.025em;margin-top:14px">Ninguém recomeça do zero</div>', 'Quando a conversa precisa de uma pessoa, o agente envia um resumo ao time de negócios, que continua de onde parou, sem pedir que o cooperado repita nada.')}
    ${rc('VELOCIDADE', '<div class="pop" style="font:600 32px/1.15 Poppins;letter-spacing:-.025em;margin-top:14px;color:var(--yellow)">Resultado em dias</div>', 'Poucos dias depois da nova instrução, uma conversa livre já terminava em contratação.')}
    ${rc('AUTONOMIA DO TIME', '<div class="pop" style="font:700 36px/1.15 Poppins;letter-spacing:-.025em;margin-top:14px">4 agentes</div>', 'criados pelo próprio time da cooperativa, sem depender de TI ou de fornecedor.')}
    <div style="border:3px solid var(--amber);background:linear-gradient(160deg,#2a1e08,#140e04);border-radius:30px;padding:30px 40px;display:flex;flex-direction:column;justify-content:center;box-shadow:0 0 50px rgba(253,195,72,.28)"><div><span style="display:inline-block;font:700 15px Poppins;letter-spacing:.12em;color:#070401;background:var(--amber);border-radius:22px;padding:7px 16px">META ATÉ DEZEMBRO DE 2026</span></div>
      <div class="pop" style="font:800 96px/1 Poppins;letter-spacing:-.05em;margin-top:12px;color:var(--yellow)">+10%</div>
      <div style="font:600 20px/1.45 Nunito;color:#fff;margin-top:6px">meta de ações ativas com agente generativo</div></div>
  </div>
  <div class="abs" style="left:128px;top:952px;font:400 17px Nunito;color:var(--muted-dark)">Os resultados da Viacredi não constituem projeção para outras instituições.</div>
</section>`);

/* ---------------------------------------------------------------- 10 DEFINA O PAPEL */
const rcard = (n, t, q, f, x, y) => `<div class="card abs" style="left:${x}px;top:${y}px;width:340px;height:314px;border-radius:28px;padding:22px 24px">
  <div style="display:flex;align-items:center;gap:12px"><span style="background:var(--amber);border-radius:9px;font:700 17px Poppins;padding:4px 10px">${pad(n)}</span><span class="pop" style="font:600 26px Poppins;letter-spacing:-.02em">${t}</span></div>
  <div style="font:400 19.5px/1.45 Nunito;color:var(--muted);margin-top:8px;height:58px">${q}</div>
  <div class="fld ruled" data-f="${f}" data-ml="1" style="left:24px;right:24px;top:146px;height:146px"></div></div>`;
const gitem = (t, f) => `<div class="it" style="flex:1"><div class="cbx fld0" data-f="${f}" data-cb="1"></div><div>${t}</div></div>`;
slides.push(`
<section class="slide light" id="s10">${hdr(10)}
  <h2 class="t">08. Defina <em>o papel do agente</em></h2>
  <p class="sub" style="top:236px">Responda às 6 perguntas e marque os guardrails. Na próxima página, as respostas viram a instrução do agente.</p>
  ${rcard(1, 'Objetivo', 'Qual resultado a conversa deve buscar?', 'papel_objetivo', 128, 344)}
  ${rcard(2, 'Público', 'Para quem é a oferta e em que momento da relação?', 'papel_publico', 488, 344)}
  ${rcard(3, 'Oferta', 'Quais linhas e condições o agente pode apresentar?', 'papel_oferta', 848, 344)}
  ${rcard(4, 'Tom', 'Como a sua instituição conversa quando atende bem?', 'papel_tom', 128, 686)}
  ${rcard(5, 'Transbordo', 'Quando o humano assume e o que ele precisa receber?', 'papel_transbordo', 488, 686)}
  ${rcard(6, 'Fechamento', 'Por qual canal a contratação é concluída?', 'papel_fechamento', 848, 686)}
  <div class="gbox" style="left:1219px;top:344px;width:573px;height:656px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="ico">${I('shield')}</div>${waveSvg('#fdc348', 96, 4)}</div>
    <h3>Guardrails críticos: o que nunca muda</h3>
    <div style="flex:1;display:flex;flex-direction:column">
      ${gitem('Informações que o agente não pode pedir nem expor', 'guard_info')}
      ${gitem('Condições que exigem análise humana', 'guard_analise')}
      ${gitem('Transparência sobre juros, IOF e demais custos', 'guard_custos')}
      ${gitem('Canal seguro para a contratação', 'guard_canal')}
      ${gitem('Quem revisa as conversas e com que frequência', 'guard_revisao')}
    </div>
  </div>
</section>`);

/* ---------------------------------------------------------------- 11 JUNTE TUDO (nova) */
const fl = (name, w, hint) => `<span class="field" data-f="${name}" data-tip="${hint}" style="width:${w}px"></span>`;
const row = (badge, html) => `<div class="irow"><div class="bdg">${badge}</div><div class="ird">${html}</div></div>`;
const shieldBdg = `<div class="sh">${I('shield')}</div>`;
const num = n => `<div class="nb">${pad(n)}</div>`;
slides.push(`
<section class="slide light" id="s11">${hdr(11)}
  <style>
    .irow{display:flex;gap:20px;align-items:flex-start;padding:7px 0;border-top:1px solid #f4e9cf}
    .irow:first-child{border-top:0}
    .bdg{width:44px;flex:none;display:flex;justify-content:center;padding-top:1px}
    .nb{width:44px;height:32px;border-radius:10px;background:var(--amber);font:700 18px Poppins;display:flex;align-items:center;justify-content:center}
    .sh{width:44px;height:32px;border-radius:10px;background:var(--amber);display:flex;align-items:center;justify-content:center}
    .sh svg{width:24px;height:24px;color:#070401}
    .ird{font:400 20.5px/34px Nunito;flex:1}
    .ird b{font-weight:800}
  </style>
  <h2 class="t">09. Junte tudo <em>em uma instrução</em></h2>
  <p class="sub" style="top:236px">Transforme as respostas da página anterior no texto que o agente vai seguir.</p>

  <div class="card abs" style="left:128px;top:330px;width:1130px;height:560px;border-radius:30px;padding:14px 32px;border-color:#f1dfb0;display:flex;flex-direction:column;justify-content:space-between">
    ${row('', `Você é o agente de crédito da ${fl('inst_instituicao', 230, 'instituição')} no WhatsApp.`)}
    ${row(num(1), `Seu objetivo é ${fl('inst_objetivo', 440, 'objetivo')}.`)}
    ${row(num(2), `Você conversa com ${fl('inst_publico', 250, 'público')}, que estão ${fl('inst_momento', 300, 'momento da relação')}.`)}
    ${row(num(3), `Você pode apresentar ${fl('inst_oferta', 330, 'linhas e condições')}. Primeiro entenda o que a pessoa está planejando; ofereça só quando fizer sentido.`)}
    ${row(num(4), `Fale como ${fl('inst_tom', 520, 'tom')}.`)}
    ${row(num(5), `Chame alguém do time quando ${fl('inst_situacoes', 260, 'situações')} e envie ${fl('inst_envio', 330, 'o que o humano precisa receber')}.`)}
    ${row(num(6), `A contratação é concluída apenas por ${fl('inst_canal', 300, 'canal')}. Oriente o passo a passo.`)}
    ${row(shieldBdg, `Nunca peça ou exponha ${fl('inst_proibidas', 430, 'informações proibidas')}.`)}
    ${row(shieldBdg, `Nunca decida sobre ${fl('inst_analise', 340, 'condições que exigem análise humana')}; nesses casos, transfira para o time.`)}
    ${row(shieldBdg, `Sempre informe juros, IOF e demais custos antes da contratação.`)}
  </div>
  <div class="abs" style="left:132px;top:900px;font:400 17px Nunito;color:var(--muted)">Modelo de referência. Adapte à linguagem e às regras da sua instituição.</div>

  <div class="gbox" style="left:1298px;top:330px;width:494px;height:560px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="ico">${I('list')}</div>${waveSvg('#fdc348', 96, 4)}</div>
    <h3>Antes de colocar no ar</h3>
    <div style="flex:1;display:flex;flex-direction:column">
      <div class="it" style="flex:1"><div class="cbx" data-f="ar_voz" data-cb="1"></div><div><b style="font-weight:800">Leia em voz alta:</b> soa como a sua instituição atendendo bem?</div></div>
      <div class="it" style="flex:1"><div class="cbx" data-f="ar_teste" data-cb="1"></div><div><b style="font-weight:800">Teste com perguntas difíceis:</b> custos, pedido fora do tema, “dá para fechar aqui pelo WhatsApp?”</div></div>
      <div class="it" style="flex:1"><div class="cbx" data-f="ar_ia" data-cb="1"></div><div><b style="font-weight:800">Cole a instrução numa IA</b> e peça que ela aponte lacunas e riscos.</div></div>
    </div>
  </div>

  <div class="abs" style="left:128px;top:944px;width:1664px;height:56px;border-radius:20px;background:#fff3d1;display:flex;align-items:center;gap:18px;padding:0 20px"><div style="width:42px;height:42px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;flex:none"><span style="width:22px">${I('bulb')}</span></div><div style="font:600 21.5px Nunito">Na Viacredi, a própria IA ajudou a construir os guardrails e ajustar a operação. Comece por esse diálogo.</div></div>
</section>`);

/* ---------------------------------------------------------------- 12 TESTE EM VOLUME CONTROLADO */
const fb = (name, label, x, y, w) => `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px"><div style="font:400 16px Nunito;color:var(--muted)">${label}</div><div class="fld" data-f="${name}" style="position:relative;height:42px;margin-top:4px;border-radius:12px"></div></div>`;
const phase = (x, dark, n, t, desc, deliv, fields, headBg, headCol) => `<div class="card abs" style="left:${x}px;top:316px;width:530px;height:360px;border-radius:26px;overflow:hidden">
  <div style="height:70px;background:${headBg};color:${headCol};display:flex;align-items:center;gap:16px;padding:0 26px"><span style="width:40px;height:40px;border-radius:50%;background:${dark ? 'var(--amber)' : '#070401'};color:${dark ? '#070401' : 'var(--amber)'};font:700 20px Poppins;display:flex;align-items:center;justify-content:center">${n}</span><span class="pop" style="font:600 26px Poppins">${t}</span></div>
  <div style="padding:14px 26px 0;font:400 18.5px/1.45 Nunito;color:var(--muted);height:106px">${desc}</div>
  <div style="margin:0 26px;border-left:5px solid var(--amber);background:#fff8e6;border-radius:10px;padding:10px 16px;font:400 18.5px/1.4 Nunito"><b style="font-weight:800">Entrega:</b> ${deliv}</div></div>`;
slides.push(`
<section class="slide light" id="s12">${hdr(12)}
  <h2 class="t">10. Teste em <em>volume controlado</em> e meça</h2>
  <p class="sub" style="top:236px">Defina antes o que é sucesso. Depois, decida com números se continua, ajusta ou amplia.</p>
  ${phase(128, true, 1, 'Preparação', 'Defina o papel e os limites do agente, o público inicial com filtros de risco, os responsáveis e os indicadores do teste.', 'agente pronto para conversar com um grupo pequeno.', 0, '#070401', '#fff')}
  ${phase(695, false, 2, 'Teste', 'Comece com poucos disparos, acompanhe as conversas e faça pausas para ajustar o que for necessário.', 'conversas revisadas e ajustes registrados.', 0, 'var(--amber)', '#070401')}
  ${phase(1262, true, 3, 'Avaliação', 'Reúna os resultados, os transbordos e os aprendizados sobre a qualidade das conversas.', 'decisão de continuar, ajustar ou ampliar.', 0, '#070401', '#fff')}
  ${fb('prep_data', 'Data', 154, 584, 150)}${fb('prep_resp', 'Responsável', 322, 584, 306)}
  ${fb('teste_inicio', 'Início', 721, 584, 150)}${fb('teste_fim', 'Término', 889, 584, 150)}${fb('teste_resp', 'Responsável', 1057, 584, 150)}
  ${fb('aval_data', 'Data', 1288, 584, 150)}${fb('aval_resp', 'Responsável', 1456, 584, 310)}

  <div class="abs" style="left:128px;top:700px;width:1664px;height:200px;border-radius:28px;background:#fff3d1;padding:0 40px;display:flex;gap:0">
    ${[['chat', 'Resposta', 'Pessoas que responderam ÷ pessoas abordadas'], ['arrow', 'Avanço', 'Conversas que chegaram à oferta ÷ conversas iniciadas'], ['filechk', 'Contratação', 'Contratações ÷ conversas que chegaram à oferta'], ['cash', 'Valor', 'Crédito contratado no período'], ['user', 'Transbordo', 'Transferências para o humano e seus motivos'], ['shield', 'Qualidade', 'Conversas revisadas sem desvio dos guardrails']].map(([ic, t, d], i) => `<div style="flex:1;position:relative;padding-top:24px;padding-right:18px"><div style="position:absolute;left:0;right:0;top:${24 + 29}px;border-top:2px dashed #e8c36a;${i == 0 ? 'left:60px' : ''}${i == 5 ? ';right:auto;width:0' : ''}"></div><div style="position:relative;width:58px;height:58px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;z-index:1"><span style="width:28px;color:#070401">${I(ic)}</span></div><div class="pop" style="font:600 23px Poppins;margin-top:14px">${t}</div><div style="font:400 17.5px/1.45 Nunito;color:var(--muted);margin-top:4px">${d}</div></div>`).join('')}
  </div>

  <div class="abs" style="left:128px;top:924px;width:1664px;height:76px;border-radius:24px;background:#070401;color:#fff;display:flex;align-items:center;padding:0 30px;gap:28px">
    <div style="font:400 19px/1.5 Nunito;flex:1;display:grid;grid-template-columns:auto auto;gap:2px 34px;align-content:center"><span><b style="color:var(--amber)">?</b>&nbsp; O teste respondeu ao objetivo definido na página 10?</span><span><b style="color:var(--amber)">?</b>&nbsp; Quais situações exigiram participação humana?</span><span><b style="color:var(--amber)">?</b>&nbsp; O que ajustar antes de ampliar o volume?</span></div>
    ${['Continuar', 'Ajustar', 'Ampliar'].map(t => `<div style="display:flex;align-items:center;gap:12px;border:2px solid #3a3326;border-radius:34px;padding:10px 24px 10px 18px;font:600 21px Poppins"><span class="cbx" data-f="dec_${t.toLowerCase()}" data-cb="1" style="width:28px;height:28px;border:3px solid var(--amber);border-radius:8px;display:block"></span>${t}</div>`).join('')}
  </div>
</section>`);

/* ---------------------------------------------------------------- 13 CTA (escura) */
const cl = (n, t, pg, f) => `<div style="display:flex;align-items:center;gap:22px;border-top:1px solid #2c261b;flex:1"><span class="cbx" data-f="${f}" data-cb="1" style="width:32px;height:32px;border:3px solid var(--amber);border-radius:9px;flex:none"></span><div style="flex:1"><div style="font:700 15px Poppins;color:#a59e8b">${n}</div><div class="pop" style="font:500 27px Poppins;letter-spacing:-.015em">${t}</div></div><span style="font:600 17px Poppins;color:var(--amber);background:#2b2210;border-radius:20px;padding:8px 18px">pág. ${pg}</span></div>`;
slides.push(`
<section class="slide dark" id="s13">
  <div class="hdr"><img class="u" src="img/ubots-light.png"><div class="sep"></div><img class="v" src="img/viacredi-dark.png"></div>
  <div class="hr"><div class="pn">13<i>/</i>${TOTAL}</div></div>
  <div class="abs chip" style="left:128px;top:156px">Playbook · Agentes de IA na oferta de crédito</div>
  <h2 class="abs pop" style="left:128px;top:236px;font:700 64px/1.1 Poppins;letter-spacing:-.036em;width:1300px">Quer aplicar <span style="color:var(--amber)">este método</span> na sua instituição?</h2>
  <div class="abs" style="left:128px;top:430px;width:872px;height:570px;border-radius:34px;background:linear-gradient(165deg,#ffd978,#fdc348 55%,#f5b236);padding:44px 52px;color:#070401">
    <div style="width:64px;height:64px;border-radius:18px;background:#070401;display:flex;align-items:center;justify-content:center"><span style="width:32px;color:var(--amber)">${I('spark')}</span></div>
    <div class="abs" style="right:52px;top:48px">${waveSvg('#070401', 120, 5)}</div>
    <div class="abs" style="left:52px;right:52px;top:212px"><div class="pop" style="font:700 49px/1.12 Poppins;letter-spacing:-.035em">Leve seu plano para um diagnóstico</div>
      <div style="font:600 23px/1.55 Nunito;margin-top:16px">Traga a linha de crédito que faz sentido testar e as definições do playbook. Podemos construir os próximos passos juntos.</div></div>
    <div class="abs" style="left:52px;bottom:44px;display:flex;align-items:center;gap:18px"><div style="height:68px;border-radius:40px;background:#070401;color:var(--amber);display:flex;align-items:center;gap:16px;padding:0 40px;font:600 26px Poppins">Agendar diagnóstico <span style="width:26px">${I('arrow')}</span></div><span class="tag" style="font-size:15px">[URL A CONFIRMAR, com UTM]</span></div>
  </div>
  <div class="abs" style="left:1033px;top:430px;width:759px;height:570px;border-radius:34px;border:2px solid #2a2418;background:#110d05;padding:34px 44px 14px;display:flex;flex-direction:column">
    <div class="pop" style="font:600 30px Poppins;letter-spacing:-.02em;margin-bottom:16px">Leve para a conversa</div>
    ${cl('01', 'Papel do agente', '10–11', 'lv_papel')}${cl('02', 'Guardrails críticos', 10, 'lv_guardrails')}${cl('03', 'Plano de teste e responsáveis', 12, 'lv_plano')}${cl('04', 'Indicadores e critério de decisão', 12, 'lv_indicadores')}
  </div>
</section>`);

module.exports = { slides };
