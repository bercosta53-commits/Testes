// Gera o HTML do Playbook Viacredi + Ubots (10 slides, 1440x810).
// A copy vem do playbook-viacredi-ubots.md e não deve ser reescrita aqui.
//
// Sistema de diagramação (vale para todos os slides):
//   margens laterais 96px · header em y=40 · zona de título a partir de y=108
//   régua de título 940px (máx. 2 linhas) · régua de subtítulo 800px
//   zona de conteúdo ocupa toda a altura restante até o rodapé (y=766)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = (p) => path.join(ROOT, 'assets', p);
const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(A(p)).toString('base64')}`;

const TOTAL = 10;
export const LOGO = {
  ubots: b64('logo-ubots.png', 'image/png'),
  ubotsDark: b64('logo-ubots-dark.png', 'image/png'),
  via: b64('logo-viacredi.png', 'image/png'),
  viaDark: b64('logo-viacredi-dark.png', 'image/png'),
  iconIA: b64('icon-ia.png', 'image/png'),
  iconWA: b64('icon-whatsapp.png', 'image/png'),
};

const FONTS = [
  ['Poppins', 500, 'normal', 'Poppins-Medium.ttf'],
  ['Poppins', 600, 'normal', 'Poppins-SemiBold.ttf'],
  ['Poppins', 700, 'normal', 'Poppins-Bold.ttf'],
  ['Nunito', 400, 'normal', 'Nunito-Regular.ttf'],
  ['Nunito', 600, 'normal', 'Nunito-SemiBold.ttf'],
  ['Nunito', 700, 'normal', 'Nunito-Bold.ttf'],
  ['Nunito', 800, 'normal', 'Nunito-ExtraBold.ttf'],
  ['Nunito', 400, 'italic', 'Nunito-Italic.ttf'],
  ['Nunito', 600, 'italic', 'Nunito-SemiBoldItalic.ttf'],
  ['Inter', 400, 'normal', 'Inter-Regular.ttf'],
  ['Inter', 500, 'normal', 'Inter-Medium.ttf'],
  ['Inter', 600, 'normal', 'Inter-SemiBold.ttf'],
  ['Inter', 700, 'normal', 'Inter-Bold.ttf'],
]
  .map(([f, w, s, file]) => `@font-face{font-family:'${f}';font-weight:${w};font-style:${s};font-display:block;src:url(${b64('fonts/' + file, 'font/ttf')}) format('truetype');}`)
  .join('\n');

// ---------- helpers ----------
const gold = (s) => s.replace(/==(.+?)==/g, '<span class="gold">$1</span>');
const tbc = (s) => `<span class="tbc">${s}</span>`;
const CARGO = tbc('[cargo A CONFIRMAR]');
const FALA = tbc('[Fala A CONFIRMAR com a Giovanna]');

const header = (n, dark = false, withPill = true, partner = true) => `
  <header class="hdr">
    <div class="logos">
      <img class="ub" src="${dark ? LOGO.ubotsDark : LOGO.ubots}" alt="Ubots">
      ${partner ? `<span class="vdiv"></span>
      <img class="vc" src="${dark ? LOGO.viaDark : LOGO.via}" alt="Viacredi">` : ''}
    </div>
    <div class="hdr-r">${withPill ? pill() : ''}<div class="count"><b>${String(n).padStart(2, '0')}</b> <span>/ ${TOTAL}</span></div></div>
  </header>`;

const pill = (t = 'Playbook · Agentes de IA na Oferta de Crédito') => `<div class="pill">${t}</div>`;
const titleBlock = (title, sub, { subW } = {}) => `
    <div class="tblock">
      <h1 class="t">${gold(title)}</h1>
      ${sub ? `<p class="sub"${subW ? ` style="max-width:${subW}px"` : ''}>${sub}</p>` : ''}
    </div>`;

export const wave = (color = 'var(--ouro)', w = 112, rows = 3, sw = 4) => {
  const step = 12.5, amp = 5.5, gap = 14;
  const rowsSvg = [];
  for (let r = 0; r < rows; r++) {
    const y = 8 + r * gap;
    let d = `M3 ${y} Q${3 + step / 2} ${y - amp * 2 + 2} ${3 + step} ${y}`;
    for (let x = 3 + step * 2; x <= w - 3; x += step) d += ` T${x} ${y}`;
    rowsSvg.push(`<path d="${d}"/>`);
  }
  const h = 8 + (rows - 1) * gap + 8;
  return `<svg class="wave" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${rowsSvg.join('')}</svg>`;
};

export const ICON = {
  wa: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M12 5.3a6.7 6.7 0 0 0-5.8 10.1l-.9 3.3 3.4-.9A6.7 6.7 0 1 0 12 5.3z" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.7 9.1c.2-.4.4-.4.6-.4h.4c.1 0 .3 0 .4.3l.5 1.2c.1.1.1.3 0 .4l-.3.5c-.1.1-.2.2-.1.4.3.5.7 1 1.2 1.4.4.3.9.6 1.4.8.2.1.3 0 .4-.1l.5-.6c.1-.2.3-.2.4-.1l1.2.6c.2.1.3.2.3.3 0 .4-.1.9-.5 1.2-.4.3-1 .5-1.6.4-1.4-.3-2.6-1.1-3.5-2.1-.8-.9-1.4-2-1.4-3 0-.5.2-.9.5-1.1z" fill="#fff"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" fill="currentColor"/></svg>`,
  ticks: `<svg class="tk" viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6.5l3 3L10 3M7.5 9.5l.5.5L14.5 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  status: `<svg viewBox="0 0 56 12" aria-hidden="true" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0.5" width="3" height="11.5" rx="1"/><path d="M28 3.2a8.6 8.6 0 0 1 11 0l-1.3 1.5a6.6 6.6 0 0 0-8.4 0zM30.4 6a5 5 0 0 1 6.2 0l-1.3 1.5a3 3 0 0 0-3.6 0zM33.5 9.2l1.4 1.6-1.4 1.4-1.4-1.4z"/><rect x="43" y="1" width="11" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="44.8" y="2.8" width="7.4" height="6.4" rx="1.3"/></svg>`,
  bulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/></svg>`,
  chat: `<path d="M4 5h16v11H9l-5 4z"/>`,
  fwd: `<path d="M4 12h14M13 6l6 6-6 6"/>`,
  doc: `<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 14l2 2 3.5-4"/>`,
  money: `<rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/>`,
  person: `<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>`,
  shield: `<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>`,
  back: `<path d="M15 5l-7 7 7 7"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  mic: `<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>`,
  dots: `<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>`,
  lock: `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
  phone: `<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>`,
  user2: `<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.6 3.2-5.5 6-5.5s5.2 1.9 6 5.5"/><path d="M15.5 4.8a3.2 3.2 0 0 1 0 6.4M17 14.6c2 .5 3.4 2.3 4 5.4"/>`,
  check: `<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
  ban: `<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>`,
  video: `<rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="M15.5 10.5l5.5-3v9l-5.5-3z"/>`,
  call: `<path d="M6.6 3.5h2.9l1.6 4-2.1 1.5a11 11 0 0 0 6 6l1.5-2.1 4 1.6v2.9a2 2 0 0 1-2.1 2A16 16 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1z"/>`,
  camera: `<path d="M3.5 8.5h3.5l2-2.5h6l2 2.5h3.5v10.5h-17z"/><circle cx="12" cy="13.2" r="3.4"/>`,
  sticker: `<circle cx="12" cy="12" r="8.5"/><path d="M8.6 14.3c1.9 2 4.9 2 6.8 0"/><circle cx="9.3" cy="10" r=".8" fill="currentColor"/><circle cx="14.7" cy="10" r=".8" fill="currentColor"/>`,
  reply: `<path d="M10 7.5L5 12l5 4.5"/><path d="M5 12h9a5 5 0 0 1 5 5v1.5"/>`,
  ext: `<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5.5H4.5V6H10"/>`,
  inbox: `<path d="M4 13l2.5-8h11L20 13v6H4z"/><path d="M4 13h4.5l1.5 2.5h4l1.5-2.5H20"/>`,
};
export const lineIcon = (k, sw = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

export const bars = (...ws) => ws.map((w) => `<i class="bar" style="width:${w}%"></i>`).join('');

const quote = (text, { dark = false, cls = '' } = {}) => `
  <figure class="quote ${dark ? 'on-dark' : ''} ${cls}">
    <span class="qmark" aria-hidden="true">“</span>
    <blockquote>${text}</blockquote>
    <figcaption>Giovanna · ${CARGO}, Viacredi<span class="sep"></span>${FALA}</figcaption>
  </figure>`;

// --- componentes de produto (WhatsApp, alta fidelidade) ---
const VERIFIED = `<svg class="w-ver" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#25D366"/><path d="M4.6 8.3l2.2 2.1 4.6-4.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// tela do WhatsApp (iOS, modo claro). size: 'lg' | 'sm'
export const waScreen = ({ status = false, size = 'lg', body = '', input = true, date = true, cls = '' } = {}) => `
  <div class="wa2 ${size} ${cls}">
    ${status ? `<div class="w-sbar"><b>9:41</b><span class="island"></span>${ICON.status}</div>` : ''}
    <div class="w-top">
      <span class="w-back">${lineIcon('back', 2.2)}</span>
      <span class="w-av">${ICON.spark}</span>
      <span class="w-id"><b>Agente Viacredi${VERIFIED}</b><small>Conta comercial</small></span>
      <span class="w-act">${lineIcon('video', 1.7)}${lineIcon('call', 1.7)}</span>
    </div>
    <div class="w-chat">${date ? '<span class="w-date">Hoje</span>' : ''}${body}</div>
    ${input ? `<div class="w-in">${lineIcon('plus', 1.9)}<span class="w-field">${lineIcon('sticker', 1.6)}</span>${lineIcon('camera', 1.7)}${lineIcon('mic', 1.7)}</div>` : ''}
  </div>`;
// mensagem. side: 'ag' (agente, recebida) | 'us' (cooperado, enviada)
export const m = (side, html, time, { anchor, btns, cls = '', react } = {}) => `
  <div class="m ${side} ${cls}"${anchor ? ` data-anchor="${anchor}"` : ''}>
    <div class="mb">${html}<span class="sp"></span><span class="mt">${time}${side === 'us' ? ICON.ticks : ''}</span>${react ? `<span class="react">${react}</span>` : ''}</div>
    ${btns ? `<div class="mbtns">${btns.map((b) => `<span class="mbtn">${lineIcon(b.icon || 'reply', 2)}${b.t}</span>`).join('')}</div>` : ''}
  </div>`;
export const aiTag = `<span class="w-ai">${ICON.spark}Agente de IA</span>`;

const field = (label, ph, { h = 74, id } = {}) => `
  <div class="field">
    <label>${label}</label>
    <div class="box" style="height:${h}px" ${id ? `data-field="${id}"` : ''}>${ph ? `<span class="ph">${ph}</span>` : ''}</div>
  </div>`;

const check = (id, dark = false) => `<span class="cb ${dark ? 'cb-d' : ''}" ${id ? `data-check="${id}"` : ''}></span>`;

// ---------- slides ----------
const s1 = `
<section class="slide light cover" id="s1">
  ${header(1, false, false, false)}
  <div class="cover-l">
    <div class="cl-top">
      <div class="pill-w"><i></i>Guia Prático</div>
      <h1 class="t cover-t">${gold('Testando ==Agentes de IA==')}<br>na Oferta de Crédito</h1>
      <p class="case-l"><i></i>Baseado no caso Viacredi + Ubots</p>
      <p class="lead">Menos regras, mais contexto: o que a Viacredi aprendeu ao colocar um agente de IA para conversar sobre crédito com seus cooperados e como essa experiência pode ajudar a sua instituição.</p>
    </div>
    <ol class="cover-steps">
      <li><span class="cn">1</span><b>Preparar<br>o Agente</b></li>
      <li><span class="cn">2</span><b>Testar em Volume<br>Controlado</b></li>
      <li><span class="cn">3</span><b>Avaliar<br>e Escalar</b></li>
    </ol>
    <div class="cl-aud">
      <span class="aud-l">Material para</span>
      <ul class="aud-tags"><li>Cooperativas de Crédito</li><li>Bancos e Fintechs</li><li>Instituições Financeiras</li><li>Serviços Financeiros</li><li>Financeiras</li></ul>
    </div>
  </div>
  <div class="cover-art" aria-hidden="true" data-bleed>
    <div class="ca-glow"></div>
    <svg class="ca-orbit" viewBox="0 0 700 700"><circle cx="350" cy="350" r="200"/><circle cx="350" cy="350" r="270"/></svg>
    <div class="ca-phone phone2">
      ${waScreen({ status: true, body: `
        ${m('ag', `${aiTag}Oi! Você tem um crédito pré-aprovado. Quer ver como ele pode ajudar nos seus planos?`, '10:30')}
        ${m('us', 'Quero sim! Estou reformando a cozinha.', '10:31')}
        ${m('ag', `Que legal! Simulei uma opção para a sua reforma:
          <span class="sim"><span class="sim-l">Crédito Reforma</span><b class="sim-v">R$ 15.000,00</b><span class="sim-d">24x · Juros e IOF inclusos</span></span>`, '10:31', { btns: [{ t: 'Ver condições no app', icon: 'ext' }] })}
        ${m('us', 'Perfeito, quero contratar.', '10:33', { react: `${lineIcon('check', 2.6)}Crédito Contratado` })}
      ` })}
    </div>
    <img class="ca-ia" src="${LOGO.iconIA}" alt="">
    <img class="ca-wa" src="${LOGO.iconWA}" alt="">
    ${wave('var(--escuro)', 72, 3, 3)}
  </div>
</section>`;

const s2 = `
<section class="slide light" id="s2">
  ${header(2)}
  <div class="main">
    ${titleBlock('Uma cooperativa de 74 anos decidiu ==testar IA generativa== na venda de crédito')}
    <div class="content s2">
      <div class="s2-card">
        <div class="body-txt">
          <p>A Viacredi, cooperativa do Sistema Ailos com sede em Blumenau, tem <b>mais de 1 milhão de cooperados</b> e <b>mais de 100 postos</b> em Santa Catarina e no Paraná. A proximidade com os cooperados sempre esteve no centro da sua atuação.</p>
          <p>O desafio era ampliar a oferta de crédito com agentes de IA sem abrir mão da proximidade no atendimento. Era um território novo: a cooperativa usava bots de fluxo, baseados em regras fixas, e ainda não tinha indicadores de IA generativa para orientar o teste.</p>
        </div>
        <div class="protag">
          <span class="mono">G</span>
          <div>
            <div class="pt-nm"><b>Giovanna</b> · ${CARGO}</div>
            <div class="pt-ds">Conduziu o projeto desde o primeiro teste até a operação atual.</div>
          </div>
        </div>
      </div>
      <div class="s2-r">
        <h3 class="h3">Ponto de partida</h3>
        <div class="pp"><span class="num">1</span><div><b>Bots de fluxo</b><p>Conversas limitadas a regras e caminhos predefinidos.</p></div></div>
        <div class="pp"><span class="num">2</span><div><b>Sem histórico</b><p>Sem indicadores prévios de IA generativa para comparar.</p></div></div>
        <div class="pp hl"><span class="num">3</span><div><b>Parceria com a Ubots</b><p>Construir e testar um agente de IA para a oferta de crédito.</p></div></div>
      </div>
    </div>
    <div class="results">
      <div class="rs-l"><span class="rs-tag">Fase de teste</span><b>Resultados do teste</b><small>Números obtidos antes de a operação estar totalmente estruturada.</small></div>
      <div class="rs-m"><b>+R$ 150 mil</b><span>em crédito liberado por meio do agente</span></div>
      <div class="rs-m"><b>4 agentes</b><span>construídos pela própria equipe no Agent Builder</span></div>
      <div class="rs-m"><b>Transbordo baixo</b><span>com nota de contexto para o time de negócios</span></div>
      <div class="rs-m"><b>+10%</b><span>meta de ações ativas com agente generativo até dezembro</span></div>
    </div>
  </div>
</section>`;

const s3 = `
<section class="slide light" id="s3">
  ${header(3)}
  <div class="main">
    ${titleBlock('O primeiro instinto foi ==empilhar regras==, e o agente virou um bot de fluxo', 'Cada "não pode" parecia tornar o agente mais seguro. Na prática, a conversa ficava mais rígida, e cada nova regra para deixá-lo simpático acabava reforçando o tom robótico.')}
    <div class="content s3">
      <div class="cmp">
        <div class="cmp-col">
          <div class="editor">
            <div class="ed-hd"><span class="dots"><i></i><i></i><i></i></span><b>Instruções por regras</b><span class="badge">+ 1 regra a cada ajuste</span></div>
            <ol class="rules">
              <li><span class="mk">Não fale sobre…</span></li>
              <li><span class="mk">Não responda se…</span></li>
              <li><span class="mk">Não ofereça…</span></li>
              <li><span class="mk">Sempre use a frase…</span></li>
              <li><span class="mk">Não saia do roteiro…</span></li>
              <li class="ghost"><i class="bar" style="width:38%"></i><span class="caret"></span></li>
            </ol>
          </div>
        </div>
        <div class="cmp-arr" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON.fwd}</svg></div>
        <div class="cmp-col">
          <div class="wa-card">
            <div class="win-lbl"><b>Conversa resultante</b></div>
            ${waScreen({ date: false, input: false, body: `
              ${m('ag', 'Olá. Temos uma linha de crédito disponível para você. Deseja saber mais? Responda SIM ou NÃO.', '10:02', { btns: [{ t: 'SIM' }, { t: 'NÃO' }], cls: 'btn-row' })}
              ${m('us', 'Depende, pra que serve?', '10:04')}
              ${m('ag', 'Não entendi sua resposta. Responda SIM ou NÃO.', '10:04', { cls: 'robot' })}
            ` })}
          </div>
        </div>
      </div>
      <p class="cap">Exemplo ilustrativo.</p>
      <div class="s3-bot">
        ${quote('"A gente colocava regra atrás de regra: não pode isso, não pode aquilo. E o agente ficava cada vez mais mecânico."', { cls: 'qcard' })}
        <div class="callout">${wave('var(--ouro)', 80, 2, 3.5)}<p>Na prática, era IA generativa trabalhando com os mesmos limites de um bot de fluxo.</p></div>
      </div>
    </div>
  </div>
</section>`;

const s4 = `
<section class="slide dark" id="s4">
  ${header(4, true)}
  <div class="main">
    ${titleBlock('A virada veio quando o agente ==entendeu o papel dele==', 'Na primeira semana de julho, a Viacredi repensou a lógica do agente. Reduziu as regras, deixou mais claro o papel dele no prompt e preservou os guardrails essenciais de segurança, com a ajuda da própria IA.', { subW: 1010 })}
    <div class="content s4">
      <div class="s4-grid">
        <div class="cols3">
          <div class="col saiu"><span class="cl-i">−</span><h4>O que saiu</h4><ul><li>Regras de comportamento em excesso</li><li>Roteiro fechado para cada resposta</li></ul></div>
          <div class="col entrou"><span class="cl-i">+</span><h4>O que entrou</h4><ul><li>O objetivo da conversa</li><li>O contexto do cooperado e da oferta</li><li>Liberdade para conversar sobre o que o cooperado trouxer</li></ul></div>
          <div class="col ficou"><span class="cl-i">${lineIcon('shield', 2)}</span><h4>O que ficou</h4><ul><li>Guardrails críticos de segurança</li><li>Transparência sobre custos</li><li>Contratação pelo canal seguro</li></ul></div>
        </div>
        ${quote('"Quando expliquei ao agente qual era o papel dele e o que ele precisava alcançar, a experiência melhorou na hora. Hoje, quando aparece um problema, eu levo para a própria IA e a gente constrói a solução junto."', { dark: true, cls: 'q4' })}
      </div>
      <p class="apoio">Saudação, transbordo e volume de mensagens passaram a ser ajustados com apoio da IA, sem criar uma regra a cada mudança.</p>
      <div class="band"><span>Segurança onde importa, conversa de verdade no resto.</span>${wave('var(--escuro)', 96, 2, 3.5)}</div>
    </div>
  </div>
</section>`;

const s5 = `
<section class="slide light" id="s5">
  ${header(5)}
  <svg class="conn" data-conn></svg>
  <div class="main">
    ${titleBlock('Uma conversa sobre ==reforma de cozinha== terminou em contratação de crédito', 'Poucos dias depois da mudança, uma cooperada disse que já tinha um crédito contratado, mas gostou de saber que havia outra opção. A conversa seguiu sem um roteiro pronto.', { subW: 860 })}
    <div class="content s5">
      <div class="s5-l" data-bleed>
        <div class="stage"></div>
        <div class="phone phone2">
          ${waScreen({ status: true, date: false, body: `
            ${m('us', 'Já tenho um crédito contratado, mas achei bom saber que tem outro disponível.', '14:21')}
            ${m('ag', 'Que bom! Posso perguntar o que você está planejando?', '14:21', { anchor: 'a1' })}
            ${m('us', 'Estou reformando a cozinha.', '14:23', { anchor: 'a2' })}
            ${m('ag', 'Que legal! Cozinha nova é um projeto e tanto: móveis, eletros e obra ao mesmo tempo.', '14:23')}
            ${m('ag', 'Essa linha de crédito pode ajudar com os gastos da reforma. Quer ver as condições?', '14:24', { anchor: 'a3', cls: 'cont' })}
            ${m('us', 'Quero! Vou contratar para terminar a obra.', '14:26', { anchor: 'a4', react: `${lineIcon('check', 2.6)}Contratação` })}
          ` })}
        </div>
      </div>
      <div class="anns">
        <div class="ann" data-ann="a1"><span class="ann-n">1</span><div><b>Escuta</b><p>Em vez de insistir na oferta, o agente procura entender o interesse.</p></div></div>
        <div class="ann" data-ann="a2"><span class="ann-n">2</span><div><b>Contexto</b><p>A cooperada fala da reforma, e o agente acompanha o assunto com naturalidade.</p></div></div>
        <div class="ann" data-ann="a3"><span class="ann-n">3</span><div><b>Oferta com sentido</b><p>O crédito passa a fazer sentido dentro do plano da cooperada.</p></div></div>
        <div class="ann" data-ann="a4"><span class="ann-n">4</span><div><b>Decisão da cooperada</b><p>A cooperada decide contratar. A conversa não seguiu um roteiro pronto.</p></div></div>
        <p class="cap">Reconstituição a partir do relato do projeto.</p>
      </div>
    </div>
  </div>
</section>`;

const s6 = `
<section class="slide light" id="s6">
  ${header(6)}
  <div class="main">
    <div class="trow">
      ${titleBlock('A liberdade para conversar veio junto com ==transparência e segurança==', 'O contexto torna a conversa mais natural sem deixar a segurança de lado: o agente esclarece custos, orienta a contratação pelo canal seguro e envolve o time humano quando necessário.', { subW: 760 })}
      ${quote('"O mercado costuma travar tudo num roteiro fechado. A liberdade guiada por contexto é o que deixa a experiência perto de um atendimento humano bem feito."', { cls: 'pull' })}
    </div>
    <div class="content s6">
      <div class="cards3">
        <div class="c6">
          <div class="c6-hd"><span class="num">1</span><div><h4>Custos às claras</h4><p class="sup">Transparência sem esperar o cooperado insistir.</p></div></div>
          <div class="stage6">
            ${waScreen({ size: 'sm', date: false, body: `
              ${m('us', 'Quais são os custos da retirada?', '09:12')}
              ${m('ag', 'É um crédito com juros e IOF. Antes de contratar, você vê o valor de cada custo na simulação.', '09:12')}
              ${m('ag', 'Se quiser comparar com outras linhas, eu te encaminho para o nosso time.', '09:13', { cls: 'cont', btns: [{ t: 'Falar com o time humano', icon: 'user2' }] })}
            ` })}
          </div>
        </div>
        <div class="c6">
          <div class="c6-hd"><span class="num">2</span><div><h4>Fechamento pelo app</h4><p class="sup">O canal seguro vira orientação, e não bloqueio.</p></div></div>
          <div class="stage6">
            ${waScreen({ size: 'sm', date: false, body: `
              ${m('us', 'Dá para fechar aqui mesmo, pelo WhatsApp?', '16:40')}
              ${m('ag', `Por segurança, a contratação é 100% digital pelo aplicativo. É rápido:<ol class="w-steps"><li><b>1</b>Abra o app e acesse Crédito</li><li><b>2</b>Escolha a proposta enviada</li><li><b>3</b>Revise e confirme</li></ol>`, '16:41', { btns: [{ t: 'Abrir o aplicativo', icon: 'ext' }] })}
            ` })}
          </div>
        </div>
        <div class="c6">
          <div class="c6-hd"><span class="num">3</span><div><h4>Transbordo com contexto</h4><p class="sup">O transbordo ficou baixo. Quando ocorre, o time recebe o contexto e continua sem pedir repetição ao cooperado.</p></div></div>
          <div class="stage6">
            <div class="ub-con">
              <div class="uc-top"><img src="${LOGO.ubots}" alt="Ubots"><span class="uc-tab on">${lineIcon('inbox', 2)}Transbordos</span><span class="uc-dot"></span></div>
              <div class="uc-body">
                <div class="uc-row"><span class="uc-av">${lineIcon('person', 2)}</span><span class="uc-who"><b>Cooperado [nome]</b><small>WhatsApp · agora</small></span><span class="uc-tag">Transbordo</span></div>
                <div class="uc-note">
                  <b class="uc-nt">${ICON.spark}Nota para o time de negócios</b>
                  <dl>
                    <dt>Cooperado:</dt><dd>[nome]</dd>
                    <dt>Interesse:</dt><dd>linha de crédito [X]</dd>
                    <dt>Ponto em aberto:</dt><dd>quer comparar com outras linhas</dd>
                    <dt>Histórico:</dt><dd>conversa completa anexada</dd>
                  </dl>
                </div>
                <span class="uc-btn">Assumir conversa ${lineIcon('fwd', 2.2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

const tl = [
  ['Abril a junho', 'Testes controlados. Pausas frequentes para refinar o agente, preparar o time e definir os novos indicadores.', 'teste', 'Testes controlados'],
  ['Junho', 'Pausa total para reestruturar os disparos e planejar a escala.', 'pausa', 'Pausa'],
  ['1ª semana de julho', 'A virada: menos regras, mais contexto.', 'virada', 'Virada'],
  ['2ª semana de julho', 'Testes retomados com a nova versão do agente.', 'retomada', 'Retomada'],
  ['Até dezembro', 'Meta de rodar mais de 10% das ações ativas com agente generativo.', 'meta', 'Meta'],
];
const s7 = `
<section class="slide light" id="s7">
  ${header(7)}
  <div class="main">
    ${titleBlock('Testar pouco, pausar e voltar melhor ==fez parte do método==', 'A Viacredi começou com cooperados reais, em pequenos volumes e com filtros de risco. A cada pausa, a equipe revia as conversas, ajustava o agente e preparava o próximo teste.')}
    <div class="content s7">
      <ol class="phases">
        ${tl.map(([t, d, k, tag], i) => `
        <li class="ph ${k}">
          <span class="ph-track"></span>
          <span class="ph-n">${String(i + 1).padStart(2, '0')}</span>
          <b>${t}</b>
          <p>${d}</p>
          <span class="ph-tag">${tag}</span>
        </li>`).join('')}
      </ol>
      <div class="ub-band">
        <div class="ubb-hd"><img src="${LOGO.ubots}" alt="Ubots"><h3 class="h3">O papel da Ubots</h3>${wave('var(--ouro)', 72, 2, 3)}</div>
        <p>A Ubots construiu o primeiro agente em parceria com a Viacredi e ofereceu a plataforma para a equipe testar no próprio ritmo. Com o Agent Builder, o time ganhou autonomia: Giovanna já criou quatro agentes sem depender da equipe de implementação.</p>
        <p>Próximos passos: testar um agente mais generalista e expandir para produtos sem risco de crédito, como cartões e aplicações, no onboarding de novos cooperados.</p>
      </div>
    </div>
    <p class="foot">Mais de R$ 150 mil em crédito liberados antes de a operação estar totalmente estruturada.</p>
  </div>
</section>`;

const s8fields = [
  ['Objetivo', 'Qual resultado a conversa deve buscar?'],
  ['Público', 'Para quem é a oferta e em que momento da relação?'],
  ['Oferta', 'Quais linhas e condições o agente pode apresentar?'],
  ['Tom', 'Como a sua instituição conversa quando atende bem?'],
  ['Transbordo', 'Quando o humano assume e o que ele precisa receber?'],
  ['Fechamento', 'Por qual canal a contratação é concluída?'],
];
const s8guard = [
  'Informações que o agente não pode pedir nem expor',
  'Condições que exigem análise humana',
  'Transparência sobre juros, IOF e demais custos',
  'Canal seguro para a contratação',
  'Quem revisa as conversas e com que frequência',
];
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
const s8 = `
<section class="slide light" id="s8">
  ${header(8)}
  <div class="main">
    ${titleBlock('Antes de escrever regras, escreva ==o papel do agente==', 'Comece pelo propósito: por que o agente existe, com quem vai conversar e até onde pode ir. Use as perguntas abaixo para definir o primeiro teste da sua instituição.')}
    <div class="content s8">
      <div class="ws">
        ${s8fields.map(([l, p], i) => `
        <div class="wf">
          <div class="wf-hd"><span class="wf-n">${String(i + 1).padStart(2, '0')}</span><b>${l}</b></div>
          <p class="wf-q">${p}</p>
          <div class="wf-area" data-field="s8_${slug(l)}"><i></i><i></i></div>
        </div>`).join('')}
      </div>
      <div class="darkbox">
        <div class="db-hd"><span class="db-i">${lineIcon('shield', 2)}</span>${wave('var(--ouro)', 76, 2, 3)}</div>
        <h3>Guardrails críticos: o que nunca muda</h3>
        <ul class="cklist">${s8guard.map((g, i) => `<li>${check(`s8_guard_${i + 1}`, true)}<span>${g}</span></li>`).join('')}</ul>
      </div>
    </div>
    <div class="tip"><span class="tip-i">${ICON.bulb}</span><p>Na Viacredi, a própria IA ajudou a construir os guardrails e ajustar a operação. Comece por esse diálogo.</p></div>
  </div>
</section>`;

const steps = [
  ['Preparação', 'Defina o papel e os limites do agente, o público inicial com filtros de risco, os responsáveis e os indicadores do teste.', 'agente pronto para conversar com um grupo pequeno.', ['Data', 'Responsável'], 'dk'],
  ['Teste', 'Comece com poucos disparos, acompanhe as conversas e faça pausas para ajustar o que for necessário.', 'conversas revisadas e ajustes registrados.', ['Início', 'Término', 'Responsável'], 'au'],
  ['Avaliação', 'Reúna os resultados, os transbordos e os aprendizados sobre a qualidade das conversas.', 'decisão de continuar, ajustar ou ampliar.', ['Data', 'Responsável'], 'dk'],
];
const inds = [
  ['chat', 'Resposta', 'Cooperados que responderam ÷ cooperados abordados'],
  ['fwd', 'Avanço', 'Conversas que chegaram à apresentação da oferta'],
  ['doc', 'Contratação', 'Contratações ÷ conversas com interesse'],
  ['money', 'Valor', 'Crédito contratado no período'],
  ['person', 'Transbordo', 'Transferências para o humano e seus motivos'],
  ['shield', 'Qualidade', 'Conversas revisadas sem desvio dos guardrails'],
];
const s9 = `
<section class="slide light" id="s9">
  ${header(9)}
  <div class="main">
    ${titleBlock('Teste em ==volume controlado== e meça o que muda na conversa')}
    <div class="content s9">
      <div class="steps3">
        ${steps.map(([t, d, e, fs, c], i) => `
        <div class="step ${c}">
          <div class="st-hd"><span class="st-n">${i + 1}</span><b>${t}</b></div>
          <div class="st-body">
            <p class="st-d">${d}</p>
            <div class="entrega"><b>Entrega:</b> ${e}</div>
            <div class="st-f" style="grid-template-columns:${fs.length === 3 ? '1fr 1fr 1.3fr' : '1fr 1.5fr'}">
              ${fs.map((f) => field(f, '', { h: 34, id: `s9_${i + 1}_${slug(f)}` })).join('')}
            </div>
          </div>
        </div>`).join('')}
      </div>
      <div class="inds">
        <div class="ind-line"></div>
        ${inds.map(([ic, t, d]) => `<div class="ind"><span class="ic">${lineIcon(ic, 1.9)}</span><b>${t}</b><p>${d}</p></div>`).join('')}
      </div>
      <div class="evalbar">
        <ul class="qs">
          <li><span class="q">?</span>O teste respondeu ao objetivo definido na página 8?</li>
          <li><span class="q">?</span>Quais situações exigiram participação humana?</li>
          <li><span class="q">?</span>O que ajustar antes de ampliar o volume?</li>
        </ul>
        <div class="dec">
          ${['Continuar', 'Ajustar', 'Ampliar'].map((d) => `<span class="dpill">${check(`s9_${d.toLowerCase()}`, true)}${d}</span>`).join('')}
        </div>
      </div>
    </div>
    <p class="foot sm">Os resultados da Viacredi não constituem projeção para outras instituições.</p>
  </div>
</section>`;

const levar = [
  ['Papel do agente', 'pág. 8'],
  ['Guardrails críticos', 'pág. 8'],
  ['Plano de teste e responsáveis', 'pág. 9'],
  ['Indicadores e critério de decisão', 'pág. 9'],
];
const s10 = `
<section class="slide dark cta" id="s10">
  ${header(10, true, false)}
  <div class="main">
    <div class="cta-top">
      <div>
        ${pill()}
        <h1 class="t">${gold('Desenhe o ==primeiro teste== de agente de IA na sua instituição')}</h1>
      </div>
      <p class="sub">Este guia ajuda sua equipe a definir o papel do agente, os cuidados de segurança e o plano de teste antes da primeira conversa com os cooperados.</p>
    </div>
    <div class="cta-grid">
      <div class="cta-main">
        <div class="cm-hd"><span class="cm-i">${ICON.spark}</span>${wave('var(--escuro)', 96, 3, 3.5)}</div>
        <h3>Converse com a Ubots sobre a sua operação</h3>
        <p>Traga a linha de crédito que faz sentido testar e as definições do playbook. Podemos construir os próximos passos juntos.</p>
        <div class="cta-row">
          <a class="btn" href="#url-a-confirmar">Falar com um especialista <span aria-hidden="true">→</span></a>
          <span class="url">${tbc('[URL A CONFIRMAR, com UTM]')}</span>
        </div>
      </div>
      <div class="dcard levar-card">
        <h3>Leve para a conversa</h3>
        <ul class="levar">${levar.map(([t, sl], i) => `<li>${check(`s10_${i + 1}`, true)}<span class="lv"><small>${String(i + 1).padStart(2, '0')}</small>${t}</span><em>${sl}</em></li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>`;

// ---------- css ----------
export const CSS = `
${FONTS}
:root{
  --ouro:#FDC348; --escuro:#070401; --branco:#FFFDF9;
  --cinza-medio:#6C6C71; --cinza-claro:#AFAFB4; --ouro-suave:#FFF3D1;
  /* derivados do sistema */
  --ouro-texto:#6B4D00;   /* texto pequeno sobre ouro-suave */
  --ouro-fundo:#FFF8E7;   /* áreas de escrita e faixas leves */
  --ouro-linha:#F0DDAE;   /* bordas e pautas sobre tons de ouro */
  --card:#FFFFFF; --linha:#EEE7D8; --dark-card:#15110C; --dark-line:#2C2620;
  --sombra:0 1px 2px rgba(107,77,0,.06), 0 12px 32px rgba(107,77,0,.08);
  --tbc:#B4005E; --tbc-bg:#FFE1F0;
  --mx:96px; --regua:940px; --regua-sub:860px;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#24201B}
body{font-family:'Nunito',sans-serif;color:var(--escuro);-webkit-font-smoothing:antialiased}
.deck{display:flex;flex-direction:column;align-items:center;gap:28px;padding:28px 0;zoom:var(--z,1)}
.slide{width:1440px;height:810px;position:relative;overflow:hidden;flex:none;page-break-after:always;break-after:page;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.slide.light{background:
  radial-gradient(760px 560px at 100% 0%, var(--ouro-suave) 0%, rgba(255,243,209,.55) 38%, rgba(255,243,209,0) 72%),
  radial-gradient(620px 420px at 0% 100%, rgba(255,243,209,.5) 0%, rgba(255,243,209,0) 70%),
  var(--branco)}
.slide.dark{background:
  radial-gradient(820px 520px at 78% 8%, rgba(253,195,72,.11) 0%, rgba(253,195,72,0) 70%),
  var(--escuro); color:var(--branco)}
ul,ol{list-style:none}
b{font-weight:700}

/* header */
.hdr{position:absolute;top:40px;left:var(--mx);right:var(--mx);height:36px;display:flex;align-items:center;justify-content:space-between;z-index:5}
.logos{display:flex;align-items:center;gap:20px}
.logos .ub{height:27px}
.logos .vc{height:32px}
.vdiv{width:1px;height:28px;background:var(--cinza-claro)}
.dark .vdiv{background:#4A443D}
.hdr-r{display:flex;align-items:center;gap:22px}
.count{font:500 13px/1 'Poppins';letter-spacing:.06em;color:var(--cinza-medio)}
.count b{font-weight:600;color:var(--escuro)}
.dark .count{color:var(--cinza-claro)} .dark .count b{color:var(--branco)}

/* grade vertical comum */
.main{position:absolute;top:118px;left:var(--mx);right:var(--mx);bottom:44px;display:flex;flex-direction:column}
.tblock{flex:none}
.pill{display:inline-block;background:var(--ouro-suave);color:var(--ouro-texto);font:500 12px/1 'Poppins';padding:8px 14px;border-radius:999px}
.dark .pill{background:rgba(253,195,72,.14);color:var(--ouro)}
h1.t{font:700 42px/1.14 'Poppins';letter-spacing:-.026em;margin-top:0;color:var(--escuro);max-width:var(--regua)}
.dark h1.t{color:var(--branco)}
.gold{color:var(--ouro)}
.sub{font:400 17px/1.55 'Nunito';color:var(--cinza-medio);margin-top:14px;max-width:var(--regua-sub)}
.dark .sub{color:var(--cinza-claro)}
.content{flex:1;min-height:0;margin-top:32px;display:flex;flex-direction:column}
.foot{flex:none;margin-top:18px;font:400 12px/1.3 'Nunito';color:var(--cinza-medio)}
.foot.sm{font-size:11px}
.h3{font:700 18px/1.2 'Poppins'}
.cap{font:400 11px/1.3 'Nunito';color:var(--cinza-medio)}
.tbc{color:var(--tbc);background:var(--tbc-bg);border-radius:4px;padding:1px 5px;font-style:normal;font-weight:700;white-space:nowrap}
.card{background:var(--card);border:1px solid var(--linha);border-radius:20px;box-shadow:var(--sombra)}
.num{font:700 40px/1 'Poppins';color:var(--ouro);letter-spacing:-.02em}
.bar{display:block;height:7px;border-radius:4px;background:rgba(7,4,1,.12)}
.bar+.bar{margin-top:6px}
.wave{display:block}

/* field (slide 9) */
.field label{display:block;font:600 12px/1.2 'Nunito';color:var(--escuro);margin-bottom:6px}
.box{border:1px solid var(--ouro-linha);border-radius:9px;background:var(--ouro-fundo)}
.cb{width:18px;height:18px;border:2px solid var(--ouro-texto);border-radius:5px;flex:none;display:inline-block;background:transparent}
.cb.cb-d{border-color:var(--ouro)}

/* quote */
.quote{position:relative;padding-left:62px}
.quote .qmark{position:absolute;left:0;top:-10px;font:800 96px/1 'Nunito';color:var(--ouro)}
.quote blockquote{font:italic 400 18px/1.5 'Nunito';color:var(--escuro)}
.quote figcaption{margin-top:10px;font:600 13px/1.6 'Nunito';color:var(--cinza-medio)}
.quote .sep{display:inline-block;width:4px;height:4px;border-radius:50%;background:var(--cinza-claro);vertical-align:middle;margin:0 10px}
.quote.on-dark blockquote{color:var(--branco)}
.quote.on-dark figcaption{color:var(--cinza-claro)}

/* ===== produto: WhatsApp (alta fidelidade, iOS claro) ===== */
.wa2{display:flex;flex-direction:column;background:#EFE7DC;font-family:'Inter',sans-serif;color:#141414;overflow:hidden;-webkit-font-smoothing:antialiased}
.w-sbar{position:relative;display:flex;justify-content:space-between;align-items:center;padding:15px 26px 7px 32px;background:#F7F6F3;font:600 14px/1 'Inter';color:#141414}
.w-sbar svg{width:56px;height:12px}
.island{position:absolute;left:50%;top:9px;width:92px;height:26px;margin-left:-46px;border-radius:14px;background:#0A0806}
.w-top{display:flex;align-items:center;gap:9px;padding:7px 14px 9px 6px;background:#F7F6F3;border-bottom:1px solid #DDD7CC}
.w-back{width:24px;height:24px;color:#141414;flex:none} .w-back svg{width:24px;height:24px;display:block}
.w-av{width:36px;height:36px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;flex:none}
.w-av svg{width:17px;height:17px}
.w-id{flex:1;min-width:0;display:flex;flex-direction:column}
.w-id b{display:flex;align-items:center;gap:4px;font:600 15px/1.15 'Inter';white-space:nowrap;letter-spacing:-.01em}
.w-ver{width:14px;height:14px;flex:none}
.w-id small{font:400 12px/1.2 'Inter';color:#655F58;margin-top:2px}
.w-act{display:flex;gap:18px;color:#141414;flex:none} .w-act svg{width:22px;height:22px;display:block}
.w-chat{flex:1;min-height:0;display:flex;flex-direction:column;gap:4px;padding:10px 12px 12px;overflow:hidden;
  background:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='160'%20height='160'%20viewBox='0%200%20160%20160'%20fill='none'%20stroke='%23A8946E'%20stroke-opacity='.22'%20stroke-width='1.4'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Ccircle%20cx='22'%20cy='24'%20r='7'/%3E%3Cpath%20d='M62%2014h20a5%205%200%200%201%205%205v9a5%205%200%200%201-5%205H71l-6%205v-5h-3a5%205%200%200%201-5-5v-9a5%205%200%200%201%205-5z'/%3E%3Cpath%20d='M128%2012l3%206%206.5%201-4.7%204.5%201.1%206.5-5.9-3.1-5.9%203.1%201.1-6.5L118.5%2019l6.5-1z'/%3E%3Cpath%20d='M26%2076c-4-5-12-1-9%205%202%204%209%208%209%208s7-4%209-8c3-6-5-10-9-5z'/%3E%3Cpath%20d='M66%2066l12%2012M78%2066L66%2078'/%3E%3Crect%20x='116'%20y='64'%20width='22'%20height='16'%20rx='3'/%3E%3Ccircle%20cx='127'%20cy='72'%20r='3.5'/%3E%3Cpath%20d='M12%20124q6-8%2012%200t12%200t12%200'/%3E%3Crect%20x='64'%20y='112'%20width='18'%20height='18'%20rx='3'%20transform='rotate%2814%2073%20121%29'/%3E%3Cpath%20d='M126%20112v20M116%20122h20'/%3E%3Cpath%20d='M100%2040l6%206-6%206M44%20140l6-6%206%206'/%3E%3Ccircle%20cx='146'%20cy='148'%20r='3'/%3E%3Ccircle%20cx='96'%20cy='96'%20r='2'/%3E%3C/svg%3E") 0 0/160px 160px, #EFE7DC}
.w-date{align-self:center;font:500 11.5px/1 'Inter';color:#5E5850;background:rgba(255,255,255,.94);padding:5px 10px;border-radius:7px;box-shadow:0 1px .5px rgba(0,0,0,.12);margin:0 0 6px}
.m{display:flex;flex-direction:column;max-width:82%;position:relative}
.m.ag{align-self:flex-start;margin-left:6px} .m.us{align-self:flex-end;margin-right:6px}
.m.ag + .m.us, .m.us + .m.ag{margin-top:6px}
.mb{position:relative;font:400 14px/1.36 'Inter';letter-spacing:-.005em;padding:6px 8px 7px 9px;border-radius:8px;box-shadow:0 1px .5px rgba(0,0,0,.13);color:#141414}
.m.ag .mb{background:#fff;border-top-left-radius:0}
.m.us .mb{background:#D9FDD3;border-top-right-radius:0}
.m.ag .mb:before{content:"";position:absolute;left:-7px;top:0;width:8px;height:13px;background:#fff;clip-path:polygon(100% 0,0 0,100% 100%)}
.m.us .mb:before{content:"";position:absolute;right:-7px;top:0;width:8px;height:13px;background:#D9FDD3;clip-path:polygon(0 0,100% 0,0 100%)}
.m.cont .mb{border-radius:8px} .m.cont .mb:before{display:none}
.sp{display:inline-block;width:40px;height:1px}
.m.us .sp{width:58px}
.mt{position:absolute;right:8px;bottom:5px;display:flex;align-items:center;gap:3px;font:400 11px/1 'Inter';color:#655F58}
.mt .tk{width:16px;height:11px;color:#7D776F}
.react{position:absolute;left:8px;bottom:-13px;display:inline-flex;align-items:center;gap:4px;background:var(--ouro);color:var(--escuro);font:600 11px/1 'Inter';padding:4px 8px 4px 6px;border-radius:999px;border:2px solid #EFE7DC}
.react svg{width:11px;height:11px}
.m:has(.react){margin-bottom:14px}
.mbtns{display:flex;flex-direction:column;gap:2px;margin-top:2px}
.m.btn-row .mbtns{flex-direction:row}
.m.btn-row .mbtn{flex:1}
.mbtn{display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;border-radius:8px;padding:9px 10px;font:500 13.5px/1 'Inter';color:#0E7A4B;box-shadow:0 1px .5px rgba(0,0,0,.13)}
.mbtn svg{width:15px;height:15px;flex:none}
.m.robot .mb{outline:1.5px dashed rgba(180,0,94,0);}
.w-in{display:flex;align-items:center;gap:13px;padding:8px 14px 12px;background:#F7F6F3;color:#141414}
.w-in > svg{width:22px;height:22px;flex:none}
.w-field{flex:1;display:flex;align-items:center;justify-content:flex-end;height:34px;border-radius:18px;background:#fff;border:1px solid #DDD7CC;padding:0 9px;color:#655F58}
.w-field svg{width:20px;height:20px}
.w-ai{display:flex;align-items:center;gap:4px;width:max-content;margin-bottom:5px;font:600 10.5px/1 'Inter';color:var(--ouro-texto);background:var(--ouro-suave);padding:4px 7px 4px 6px;border-radius:5px}
.w-ai svg{width:10px;height:10px;color:#D29A12}
.sim{display:flex;flex-direction:column;gap:4px;margin:8px 0 2px;background:#F7F4EE;border:1px solid #E8E2D7;border-radius:8px;padding:10px 11px}
.sim-l{font:500 11px/1 'Inter';color:#655F58}
.sim-v{font:700 19px/1.1 'Inter';letter-spacing:-.02em}
.sim-d{font:500 11.5px/1.3 'Inter';color:var(--ouro-texto)}
.w-steps{margin:7px 0 2px;display:flex;flex-direction:column;gap:5px}
.w-steps li{display:flex;align-items:center;gap:7px;font:400 12.5px/1.3 'Inter'}
.w-steps b{width:17px;height:17px;border-radius:50%;background:var(--escuro);color:var(--branco);font:600 10px/17px 'Inter';text-align:center;flex:none}
/* tamanho pequeno (cards) */
.wa2.sm .w-top{padding:6px 10px 7px 4px;gap:7px}
.wa2.sm .w-back,.wa2.sm .w-back svg{width:20px;height:20px}
.wa2.sm .w-av{width:30px;height:30px} .wa2.sm .w-av svg{width:14px;height:14px}
.wa2.sm .w-id b{font-size:13px} .wa2.sm .w-id small{font-size:10.5px}
.wa2.sm .w-ver{width:12px;height:12px}
.wa2.sm .w-act{gap:13px} .wa2.sm .w-act svg{width:18px;height:18px}
.wa2.sm .w-chat{padding:9px 10px 10px}
.wa2.sm .mb{font-size:12.5px;line-height:1.34;padding:5px 7px 6px 8px}
.wa2.sm .mt{font-size:10px;bottom:4px;right:7px}
.wa2.sm .sp{width:34px} .wa2.sm .m.us .sp{width:50px}
.wa2.sm .mbtn{font-size:12px;padding:8px}
/* aparelho */
.phone2{background:#0A0806;border-radius:52px;padding:10px;box-shadow:0 34px 64px rgba(107,77,0,.28), inset 0 0 0 2px #2A2520}
.phone2 > .wa2{height:100%;border-radius:42px}

/* ---------- s1 capa ---------- */
.cover .count b,.cover .count{color:var(--escuro)}
.cover-l{position:absolute;left:var(--mx);top:122px;bottom:44px;width:720px;display:flex;flex-direction:column;justify-content:space-between}
.pill-w{display:inline-flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--linha);border-radius:999px;padding:9px 16px;font:600 13px/1 'Poppins';box-shadow:0 4px 14px rgba(107,77,0,.06)}
.pill-w i{width:8px;height:8px;border-radius:50%;background:var(--ouro)}
h1.cover-t{font-size:60px;line-height:1.06;margin-top:22px;letter-spacing:-.034em;max-width:none}
.case-l{display:flex;align-items:center;gap:10px;margin-top:16px;font:500 14px/1 'Poppins';color:var(--cinza-medio)}
.case-l i{width:26px;height:2px;background:var(--ouro);border-radius:2px}
.lead{font:400 19px/1.55 'Nunito';color:var(--escuro);margin-top:20px;max-width:650px}
.cover-steps{display:grid;grid-template-columns:repeat(3,1fr);background:var(--card);border:1px solid var(--linha);border-radius:22px;box-shadow:var(--sombra);overflow:hidden}
.cover-steps li{display:flex;align-items:center;gap:16px;padding:22px 22px}
.cover-steps li+li{border-left:1px solid var(--linha)}
.cover-steps li:nth-child(2){background:var(--ouro-fundo)}
.cover-steps .cn{font:700 48px/1 'Poppins';color:var(--ouro);letter-spacing:-.03em;flex:none}
.cover-steps b{font:600 16px/1.3 'Poppins'}
.aud-l{display:block;font:600 12px/1 'Poppins';color:var(--ouro-texto);letter-spacing:.08em;text-transform:uppercase}
.aud-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.aud-tags li{font:500 13.5px/1 'Poppins';padding:10px 15px;border-radius:999px;background:var(--escuro);color:var(--branco)}
.aud{font:400 12px/1.4 'Nunito';color:var(--cinza-medio);margin-top:14px}
.cover-art{position:absolute;left:860px;top:24px;right:24px;bottom:24px;border-radius:34px;overflow:hidden;
  background:linear-gradient(160deg,#FFDB80 0%,var(--ouro) 46%,#F6B42E 100%)}
.ca-glow{position:absolute;left:-60px;top:-80px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(255,253,249,.6),rgba(255,253,249,0) 62%)}
.ca-orbit{position:absolute;left:-72px;top:30px;width:700px;height:700px;fill:none;stroke:rgba(255,253,249,.6);stroke-width:1.5}
.ca-phone{position:absolute;left:112px;top:40px;width:338px;height:682px}
.ca-phone .w-chat{gap:6px;padding:14px 12px 12px}
.ca-phone .mb{font-size:13.5px}
.selo{display:inline-flex;align-items:center;gap:5px;background:var(--escuro);color:var(--ouro);font:600 9.5px/1 'Poppins';padding:4px 8px 4px 6px;border-radius:999px}
.selo svg{width:9px;height:9px}
.sim-hd{display:flex;align-items:center;gap:7px;padding-bottom:7px;border-bottom:1px solid var(--linha)}
.sim-hd span{width:20px;height:20px;border-radius:6px;background:var(--ouro);display:grid;place-items:center}
.sim-hd svg{width:12px;height:12px}
.sim-hd b{font:700 11.5px/1 'Poppins'}
.sim dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin-top:7px;font:400 11px/1.3 'Nunito'}
.sim dt{color:var(--cinza-medio)} .sim dd{text-align:right;font-weight:700}
.sim-btn{display:block;margin-top:9px;text-align:center;background:var(--escuro);color:var(--ouro);font:600 10.5px/1 'Poppins';padding:7px 0;border-radius:999px}
.done{align-self:flex-end;margin-right:4px;display:inline-flex;align-items:center;gap:6px;margin-top:2px;background:var(--escuro);color:var(--branco);font:600 11px/1 'Poppins';padding:7px 12px 7px 9px;border-radius:999px;box-shadow:0 4px 10px rgba(7,4,1,.18)}
.done svg{width:13px;height:13px;color:var(--ouro)}
.ca-ia{position:absolute;left:58px;top:150px;width:72px;height:72px;border-radius:20px;transform:rotate(-8deg);box-shadow:0 18px 34px rgba(80,40,120,.35)}
.ca-wa{position:absolute;right:46px;top:500px;width:62px;height:62px;border-radius:18px;transform:rotate(8deg);box-shadow:0 18px 34px rgba(20,110,60,.30)}
.ca-ctx{position:absolute;left:16px;top:626px;width:214px;padding:14px 16px 14px;background:#fff;border-radius:18px;box-shadow:0 24px 44px rgba(107,77,0,.30);transform:rotate(-3deg)}
.ctx-hd{display:flex;align-items:center;gap:9px;padding-bottom:9px;border-bottom:1px solid var(--linha)}
.ctx-hd b{font:700 12px/1.2 'Poppins'}
.ctx-i{width:26px;height:26px;border-radius:8px;background:var(--escuro);color:var(--ouro);display:grid;place-items:center;flex:none}
.ctx-i svg{width:13px;height:13px}
.ca-ctx dl{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;margin-top:9px;font:400 11.5px/1.3 'Nunito'}
.ca-ctx dt{color:var(--cinza-medio)} .ca-ctx dd{font-weight:700}
.cover-art > .wave{position:absolute;left:34px;bottom:40px;opacity:.85}

/* ---------- s2 ---------- */
.s2{display:grid;grid-template-columns:1.55fr 1fr;grid-template-rows:minmax(0,1fr);gap:24px}
.results{flex:none;margin-top:18px;display:grid;grid-template-columns:1.25fr repeat(4,1fr);background:var(--escuro);color:var(--branco);border-radius:20px;overflow:hidden}
.results > div{padding:16px 20px;display:flex;flex-direction:column;justify-content:center;gap:5px}
.results .rs-m{border-left:1px solid var(--dark-line)}
.rs-tag{align-self:flex-start;font:600 10.5px/1 'Poppins';letter-spacing:.06em;text-transform:uppercase;color:var(--escuro);background:var(--ouro);padding:5px 8px;border-radius:5px}
.rs-l b{font:700 17px/1.2 'Poppins';margin-top:4px}
.rs-l small{font:400 12px/1.35 'Nunito';color:var(--cinza-claro)}
.rs-m b{font:700 22px/1.1 'Poppins';color:var(--ouro);letter-spacing:-.01em}
.rs-m span{font:400 12.5px/1.35 'Nunito';color:var(--cinza-claro)}
.s2-card{display:flex;flex-direction:column;justify-content:space-between;background:var(--card);border:1px solid var(--linha);border-radius:22px;box-shadow:var(--sombra);overflow:hidden}
.body-txt{padding:26px 32px 0}
.body-txt p{font:400 18px/1.62 'Nunito';color:var(--escuro)}
.body-txt p b{font-weight:800}
.body-txt p+p{margin-top:18px}
.protag{display:flex;align-items:center;gap:16px;background:var(--ouro-fundo);border-top:1px solid var(--ouro-linha);padding:14px 32px;margin-top:18px}
.mono{width:48px;height:48px;border-radius:50%;background:var(--ouro);display:grid;place-items:center;font:700 20px/1 'Poppins';flex:none}
.pt-nm{font:400 16px/1.3 'Nunito'} .pt-nm b{font:700 16px 'Poppins'}
.pt-ds{font:400 14.5px/1.4 'Nunito';color:var(--escuro);opacity:.78;margin-top:3px}
.s2-r{display:flex;flex-direction:column;gap:10px}
.s2-r .h3{margin:4px 0 0}
.pp{flex:1;display:flex;gap:18px;align-items:center;background:var(--card);border:1px solid var(--linha);border-radius:16px;padding:10px 20px;box-shadow:var(--sombra)}
.pp .num{width:30px;text-align:center;flex:none}
.pp b{font:700 16.5px/1.25 'Poppins'}
.pp p{font:400 14.5px/1.45 'Nunito';color:var(--cinza-medio);margin-top:4px}
.pp.hl{background:var(--escuro);border-color:var(--escuro)}
.pp.hl b{color:var(--branco)} .pp.hl p{color:var(--cinza-claro)}

/* ---------- s3 ---------- */
.s3{gap:0}
.cmp{flex:1;min-height:0;display:grid;grid-template-columns:1fr 70px 1fr;align-items:stretch}
.cmp-col{display:flex;min-height:0}
.editor{flex:1;background:#141009;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(7,4,1,.18);display:flex;flex-direction:column}
.ed-hd{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #2A241C;font:600 13px/1 'Poppins';color:var(--branco)}
.ed-hd .dots{display:flex;gap:6px} .ed-hd .dots i{width:10px;height:10px;border-radius:50%;background:#3A332A}
.badge{margin-left:auto;background:var(--ouro);color:var(--escuro);font:600 11px/1 'Poppins';padding:6px 11px;border-radius:999px}
.rules{counter-reset:r;padding:16px 20px;display:flex;flex-direction:column;justify-content:center;gap:11px;flex:1}
.rules li{counter-increment:r;display:flex;align-items:center;gap:16px;font:600 16.5px/1.3 'Nunito';color:var(--branco)}
.rules li:before{content:counter(r);font:500 12px/1 'Poppins';color:var(--cinza-claro);width:14px;text-align:right}
.mk{background:linear-gradient(transparent 50%, rgba(253,195,72,.38) 50%, rgba(253,195,72,.38) 94%, transparent 94%);padding:0 4px}
.rules li.ghost .bar{height:9px;background:rgba(253,195,72,.22);flex:none}
.rules li.g2{opacity:.6}
.caret{width:2px;height:18px;background:var(--ouro)}
.cmp-arr{display:grid;place-items:center;color:var(--escuro)}
.cmp-arr svg{width:42px;height:42px;padding:10px;border-radius:50%;background:var(--ouro);box-shadow:0 8px 18px rgba(214,160,40,.35)}
.wa-card{flex:1;min-height:0;display:flex;flex-direction:column;border-radius:20px;overflow:hidden;background:#fff;border:1px solid var(--linha);box-shadow:var(--sombra)}
.win-lbl{padding:11px 16px;font:600 13px/1 'Poppins';border-bottom:1px solid var(--linha)}
.wa-card .wa2{flex:1;min-height:0}
.wa-card .w-chat{justify-content:center;gap:6px}
.s3 .cap{margin-top:10px}
.s3-bot{display:grid;grid-template-columns:1.5fr 1fr;gap:28px;margin-top:22px;align-items:stretch}
.qcard{background:var(--card);border:1px solid var(--linha);border-radius:18px;padding:20px 26px 16px 92px;box-shadow:var(--sombra)}
.qcard .qmark{left:26px;top:12px}
.callout{background:var(--escuro);color:var(--branco);border-radius:18px;padding:20px 26px;display:flex;gap:18px;align-items:center}
.callout p{font:600 18px/1.4 'Poppins'}
.callout .wave{flex:none}

/* ---------- s4 ---------- */
.s4-grid{flex:1;min-height:0;display:grid;grid-template-columns:1.62fr 1fr;gap:48px;align-items:stretch}
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.col{border-radius:18px;padding:20px 20px 20px;position:relative}
.cl-i{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font:600 20px/1 'Poppins';margin-bottom:12px}
.cl-i svg{width:17px;height:17px}
.col h4{font:700 18px/1.2 'Poppins';margin-bottom:12px}
.col li{font:400 15.5px/1.4 'Nunito';padding-left:22px;position:relative}
.col li+li{margin-top:10px}
.col.saiu{border:1.5px dashed #5A544D}
.col.saiu .cl-i{border:1.5px solid var(--cinza-claro);color:var(--cinza-claro)}
.col.saiu h4{color:var(--cinza-claro)}
.col.saiu li{color:var(--cinza-claro);text-decoration:line-through;text-decoration-color:var(--cinza-claro)}
.col.saiu li:before{content:"×";position:absolute;left:2px;top:-1px;font:600 16px/1.4 'Poppins';color:var(--cinza-claro)}
.col.entrou{border:1.5px solid var(--ouro);background:rgba(253,195,72,.07)}
.col.entrou .cl-i{background:rgba(253,195,72,.16);color:var(--ouro)}
.col.entrou h4{color:var(--ouro)}
.col.entrou li{color:var(--branco)}
.col.entrou li:before{content:"+";position:absolute;left:2px;top:-1px;font:600 16px/1.4 'Poppins';color:var(--ouro)}
.col.ficou{background:var(--ouro);color:var(--escuro)}
.col.ficou .cl-i{background:var(--escuro);color:var(--ouro)}
.col.ficou li:before{content:"";position:absolute;left:3px;top:5px;width:6px;height:11px;border:solid var(--escuro);border-width:0 2px 2px 0;transform:rotate(45deg)}
.q4{align-self:center}
.q4 blockquote{font-size:19px}
.apoio{font:400 15px/1.4 'Nunito';color:var(--cinza-claro);margin-top:16px}
.band{margin-top:16px;background:var(--ouro);color:var(--escuro);border-radius:18px;padding:20px 30px;display:flex;align-items:center;justify-content:space-between}
.band span{font:700 22px/1.2 'Poppins';letter-spacing:-.01em}

/* ---------- s5 ---------- */
.conn{position:absolute;inset:0;width:1440px;height:810px;pointer-events:none;z-index:3;overflow:visible}
.s5{display:grid;grid-template-columns:520px 1fr;gap:0}
.s5-l{position:relative}
.stage{position:absolute;left:0;right:30px;top:24px;bottom:-60px;border-radius:28px 28px 0 0;background:linear-gradient(180deg,var(--ouro-suave),rgba(255,243,209,.2))}
.phone{position:absolute;left:54px;top:-8px;width:392px;height:580px}
.phone .w-chat{gap:3px;padding:8px 12px}
.phone .mb{font-size:13px}
.phone .w-top{padding:5px 14px 7px 6px}
.phone .w-sbar{padding:13px 26px 5px 32px}
.selo-c{display:inline-flex;align-items:center;margin-top:9px;background:var(--ouro);color:var(--escuro);font:600 11px/1 'Poppins';padding:6px 10px;border-radius:999px}
.anns{display:flex;flex-direction:column;justify-content:space-between;padding:2px 0 0 92px}
.ann{display:flex;gap:18px;align-items:flex-start;padding:14px 20px;background:var(--card);border:1px solid var(--linha);border-radius:16px;box-shadow:var(--sombra)}
.ann-n{width:34px;height:34px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;font:700 15px/1 'Poppins';flex:none;position:relative;z-index:4}
.ann b{font:700 17px/1.2 'Poppins'}
.ann p{font:400 15px/1.45 'Nunito';color:var(--cinza-medio);margin-top:3px}
.anns .cap{margin-top:2px}

/* ---------- s6 ---------- */
.trow{display:grid;grid-template-columns:1fr 400px;gap:56px;align-items:end}
.trow .tblock h1.t{max-width:800px}
.pull{padding:4px 0 2px 26px;border-left:3px solid var(--ouro);margin-bottom:2px}
.pull .qmark{display:none}
.pull blockquote{font:italic 400 16.5px/1.5 'Nunito'}
.pull figcaption{font-size:12px;line-height:1.75;margin-top:8px}
.s6{gap:0}
.cards3{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:minmax(0,1fr);gap:22px}
.c6{min-height:0;background:var(--card);border:1px solid var(--linha);border-radius:22px;padding:18px 18px 0;display:flex;flex-direction:column;box-shadow:var(--sombra);overflow:hidden}
.c6-hd{display:flex;gap:14px;align-items:flex-start;min-height:62px;padding:0 2px}
.c6-hd .num{width:26px;line-height:.85;flex:none}
.c6-hd h4{font:700 17px/1.2 'Poppins'}
.sup{font:400 13.5px/1.42 'Nunito';color:var(--cinza-medio);margin-top:4px}
.stage6{flex:1;min-height:0;margin-top:14px;border-radius:16px 16px 0 0;overflow:hidden;display:flex;box-shadow:0 0 0 1px var(--linha), 0 -6px 20px rgba(107,77,0,.06)}
.stage6 > .wa2{flex:1}
.stage6 .w-chat{justify-content:flex-start}
.ub-con{flex:1;display:flex;flex-direction:column;background:#F6F3EC;font-family:'Inter',sans-serif}
.uc-top{display:flex;align-items:center;gap:12px;padding:9px 12px;background:#fff;border-bottom:1px solid var(--linha)}
.uc-top img{height:15px}
.uc-tab{display:flex;align-items:center;gap:5px;font:600 11.5px/1 'Inter';padding:6px 9px;border-radius:7px;color:#655F58}
.uc-tab.on{background:var(--ouro-suave);color:var(--ouro-texto)}
.uc-tab svg{width:13px;height:13px}
.uc-dot{margin-left:auto;width:24px;height:24px;border-radius:50%;background:var(--ouro)}
.uc-body{flex:1;padding:10px 12px 12px;display:flex;flex-direction:column;gap:9px}
.uc-row{display:flex;align-items:center;gap:9px}
.uc-av{width:30px;height:30px;border-radius:50%;background:var(--escuro);color:var(--ouro);display:grid;place-items:center;flex:none}
.uc-av svg{width:15px;height:15px}
.uc-who{flex:1;display:flex;flex-direction:column}
.uc-who b{font:600 12.5px/1.2 'Inter'} .uc-who small{font:400 10.5px/1.3 'Inter';color:#655F58}
.uc-tag{font:600 10.5px/1 'Inter';color:var(--escuro);background:var(--ouro);padding:5px 8px;border-radius:999px}
.uc-note{background:#fff;border:1px solid #E8E2D7;border-left:3px solid var(--ouro);border-radius:9px;padding:10px 11px}
.uc-nt{display:flex;align-items:center;gap:6px;font:700 12px/1.2 'Inter';margin-bottom:8px}
.uc-nt svg{width:12px;height:12px;color:#D29A12}
.uc-note dl{display:grid;grid-template-columns:auto 1fr;gap:5px 8px;font:400 11.5px/1.35 'Inter'}
.uc-note dt{font-weight:600;color:#655F58}
.uc-btn{margin-top:auto;align-self:stretch;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--escuro);color:var(--branco);font:600 12px/1 'Inter';padding:10px;border-radius:9px}
.uc-btn svg{width:13px;height:13px;color:var(--ouro)}

/* ---------- s7 (fases) ---------- */
.s7{gap:16px}
.phases{flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,1fr);background:var(--card);border:1px solid var(--linha);border-radius:22px;box-shadow:var(--sombra);overflow:hidden}
.ph{position:relative;display:flex;flex-direction:column;padding:0 22px 20px}
.ph+.ph{border-left:1px solid var(--linha)}
.ph-track{display:block;height:8px;margin:0 -22px 20px;background:var(--ouro)}
.ph.pausa .ph-track{background:repeating-linear-gradient(135deg,#CFC8BA 0 6px,#EEE8DC 6px 12px)}
.ph.virada{background:var(--escuro);color:var(--branco);border-left-color:var(--escuro)}
.ph.virada + .ph{border-left-color:var(--escuro)}
.ph.virada .ph-track{background:var(--ouro)}
.ph.retomada .ph-track{background:var(--ouro)}
.ph.meta .ph-track{background:repeating-linear-gradient(90deg,var(--ouro) 0 12px,transparent 12px 20px);background-color:var(--ouro-fundo)}
.ph-n{font:700 40px/1 'Poppins';color:var(--ouro);letter-spacing:-.03em}
.ph b{font:700 16.5px/1.25 'Poppins';margin-top:14px}
.ph p{font:400 14px/1.5 'Nunito';color:var(--cinza-medio);margin-top:8px}
.ph.virada p{color:var(--cinza-claro)}
.ph-tag{margin-top:auto;align-self:flex-start;font:600 11px/1 'Poppins';padding:6px 10px;border-radius:999px;background:var(--ouro-suave);color:var(--ouro-texto)}
.ph.pausa .ph-tag{background:#EEE8DC;color:#4F4A43}
.ph.virada .ph-tag{background:var(--ouro);color:var(--escuro)}
.ph.meta .ph-tag{background:transparent;border:1.5px dashed var(--ouro-texto)}
.ub-band{flex:none;display:grid;grid-template-columns:250px 1fr 1fr;gap:32px;align-items:start;background:var(--card);border:1.5px solid var(--ouro);border-radius:20px;padding:20px 28px;box-shadow:var(--sombra)}
.ubb-hd{display:flex;flex-direction:column;gap:10px}
.ubb-hd img{height:22px;width:max-content}
.ubb-hd .wave{margin-top:4px}
.ub-band p{font:400 14.5px/1.55 'Nunito'}

/* ---------- s8 ---------- */
.s8{display:grid;grid-template-columns:1fr 430px;grid-template-rows:minmax(0,1fr);gap:24px}
.ws{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,minmax(0,1fr));gap:14px}
.wf{background:var(--card);border:1px solid var(--linha);border-radius:16px;padding:16px 16px 14px;display:flex;flex-direction:column;box-shadow:var(--sombra)}
.wf-hd{display:flex;align-items:center;gap:10px}
.wf-n{font:700 12px/1 'Poppins';color:var(--escuro);background:var(--ouro);border-radius:7px;padding:5px 7px}
.wf-hd b{font:700 16px/1 'Poppins'}
.wf-q{font:400 13.5px/1.38 'Nunito';color:var(--cinza-medio);margin-top:8px;min-height:37px}
.wf-area{flex:1;min-height:30px;margin-top:9px;border-radius:10px;background:var(--ouro-fundo);border:1px solid var(--ouro-linha);position:relative;
  background-image:repeating-linear-gradient(180deg,transparent 0,transparent 25px,var(--ouro-linha) 25px,var(--ouro-linha) 26px);background-position:0 4px;background-clip:padding-box}
.wf-area i{display:none}
.darkbox{position:relative;background:var(--escuro);color:var(--branco);border-radius:22px;padding:22px 28px 16px;display:flex;flex-direction:column;
  background-image:radial-gradient(360px 240px at 100% 0%, rgba(253,195,72,.16), rgba(253,195,72,0) 70%)}
.db-hd{display:flex;align-items:center;justify-content:space-between}
.db-i{width:40px;height:40px;border-radius:12px;background:var(--ouro);color:var(--escuro);display:grid;place-items:center}
.db-i svg{width:22px;height:22px}
.darkbox h3{font:700 19px/1.3 'Poppins';margin-top:14px}
.cklist{margin-top:8px;display:flex;flex-direction:column;flex:1;justify-content:space-between}
.cklist li{display:flex;gap:14px;align-items:flex-start;font:400 15px/1.38 'Nunito';padding:9px 0;border-top:1px solid var(--dark-line)}
.cklist .cb{margin-top:1px}
.tip{flex:none;margin-top:16px;display:flex;align-items:center;gap:16px;background:var(--ouro-suave);border-radius:16px;padding:14px 22px}
.tip-i{width:36px;height:36px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;flex:none}
.tip-i svg{width:20px;height:20px}
.tip p{font:600 15.5px/1.4 'Nunito'}

/* ---------- s9 ---------- */
.s9{gap:0}
.steps3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.step{background:var(--card);border:1px solid var(--linha);border-radius:18px;overflow:hidden;box-shadow:var(--sombra);display:flex;flex-direction:column}
.st-hd{display:flex;align-items:center;gap:12px;padding:12px 18px;background:var(--escuro);color:var(--branco)}
.step.au .st-hd{background:var(--ouro);color:var(--escuro)}
.st-n{width:30px;height:30px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;font:700 14px/1 'Poppins'}
.step.au .st-n{background:var(--escuro);color:var(--ouro)}
.st-hd b{font:700 17px/1 'Poppins'}
.st-body{padding:12px 18px 16px;display:flex;flex-direction:column;flex:1}
.st-d{font:400 13.5px/1.45 'Nunito';color:var(--cinza-medio);min-height:39px}
.entrega{background:var(--ouro-fundo);border:1px solid var(--ouro-linha);border-left:4px solid var(--ouro);border-radius:8px;padding:8px 12px;font:400 13px/1.4 'Nunito';margin-top:10px}
.entrega b{font-weight:800}
.st-f{display:grid;gap:10px;margin-top:auto;padding-top:12px}
.st-f .field label{font-size:11.5px;margin-bottom:5px}
.inds{position:relative;flex:1;min-height:128px;margin-top:16px;display:grid;grid-template-columns:repeat(6,1fr);gap:18px;align-items:start;align-content:center;background:var(--ouro-suave);border-radius:18px;padding:16px 26px}
.ind-line{display:none}
.ind:not(:last-child):before{content:"";position:absolute;left:50px;right:-12px;top:19px;height:2px;background:repeating-linear-gradient(90deg,#D9A93A 0 6px,transparent 6px 11px)}
.ind{position:relative}
.ind .ic{width:40px;height:40px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;box-shadow:0 0 0 5px var(--ouro-suave)}
.ind .ic svg{width:19px;height:19px}
.ind b{display:block;font:700 15px/1.2 'Poppins';margin-top:10px}
.ind p{font:400 12.5px/1.4 'Nunito';color:var(--ouro-texto);margin-top:3px}
.evalbar{flex:none;margin-top:16px;background:var(--escuro);color:var(--branco);border-radius:18px;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.qs{display:grid;grid-template-columns:auto auto;gap:7px 30px}
.qs li{display:flex;align-items:center;gap:9px;font:400 14px/1.3 'Nunito'}
.q{width:19px;height:19px;border-radius:50%;background:rgba(253,195,72,.16);color:var(--ouro);font:700 11px/19px 'Poppins';text-align:center;flex:none}
.dec{display:flex;gap:10px}
.dpill{display:flex;align-items:center;gap:9px;border:1px solid #3A332B;background:#17130E;border-radius:999px;padding:10px 17px 10px 12px;font:600 14px/1 'Poppins'}

/* ---------- s10 ---------- */
.cta .main{top:118px}
.cta-top{display:grid;grid-template-columns:1fr 340px;gap:56px;align-items:end}
.cta h1.t{font-size:50px;line-height:1.1;margin-top:18px;max-width:860px;letter-spacing:-.03em}
.cta .sub{font-size:17px;line-height:1.55;margin:0 0 6px;max-width:none}
.cta-grid{flex:1;min-height:0;display:grid;grid-template-columns:1.15fr 1fr;gap:24px;margin-top:40px}
.cta-main{position:relative;display:flex;flex-direction:column;background:linear-gradient(150deg,#FFD978 0%,var(--ouro) 45%,#F4AE2A 100%) var(--ouro);color:var(--escuro);border-radius:26px;padding:30px 36px 32px;overflow:hidden}
.cta-main:after{content:"";position:absolute;right:-90px;top:-110px;width:320px;height:320px;border-radius:50%;border:34px solid rgba(255,253,249,.25)}
.cm-hd{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1}
.cm-i{width:48px;height:48px;border-radius:14px;background:var(--escuro);color:var(--ouro);display:grid;place-items:center}
.cm-i svg{width:22px;height:22px}
.cta-main h3{font:700 30px/1.15 'Poppins';letter-spacing:-.02em;margin-top:auto;max-width:520px;position:relative;z-index:1}
.cta-main p{font:400 17px/1.5 'Nunito';margin-top:12px;max-width:500px;position:relative;z-index:1}
.cta-row{display:flex;align-items:center;gap:18px;margin-top:26px;position:relative;z-index:1}
.btn{display:inline-flex;align-items:center;gap:14px;background:var(--escuro);color:var(--ouro);text-decoration:none;font:600 18px/1 'Poppins';padding:20px 30px;border-radius:999px;box-shadow:0 14px 30px rgba(7,4,1,.25)}
.btn span{font-size:21px}
.url{font-size:12px}
.dcard{background:var(--dark-card);border:1px solid var(--dark-line);border-radius:26px;padding:30px 34px;display:flex;flex-direction:column}
.dcard h3{font:700 24px/1.25 'Poppins';color:var(--branco)}
.levar{flex:1;display:flex;flex-direction:column;justify-content:space-between;margin-top:14px}
.levar li{display:flex;align-items:center;gap:16px;padding:16px 0;border-top:1px solid var(--dark-line);font:600 17px/1.3 'Poppins';color:var(--branco)}
.levar .cb{width:22px;height:22px;border-radius:6px}
.levar .lv{flex:1;display:flex;flex-direction:column;gap:5px}
.levar .lv small{font:600 11px/1 'Poppins';color:var(--cinza-claro);letter-spacing:.08em}
.levar em{font:600 12px/1 'Poppins';font-style:normal;color:var(--ouro);background:rgba(253,195,72,.14);padding:7px 11px;border-radius:999px}

/* print / export */
@page{margin:0}
@media print{
  html,body{background:none}
  .deck{zoom:1 !important;gap:0;padding:0;display:block}
  .slide{box-shadow:none}
}
body.export{background:none} body.export .deck{gap:0;padding:0;zoom:1}
body.export .slide{box-shadow:none}
`;

// ---------- runtime JS (conectores do slide 5 + navegação) ----------
const JS = `
(function(){
  var exportMode = /[?&]export/.test(location.search);
  if (exportMode) document.body.classList.add('export');
  function connectors(){
    document.querySelectorAll('svg[data-conn]').forEach(function(svg){
      var slide = svg.closest('.slide'); var sr = slide.getBoundingClientRect();
      var k = sr.width / 1440; var out = '';
      var phone = slide.querySelector('.phone').getBoundingClientRect();
      slide.querySelectorAll('[data-ann]').forEach(function(a, idx){
        var t = slide.querySelector('[data-anchor="'+a.dataset.ann+'"]'); if(!t) return;
        var n = a.querySelector('.ann-n').getBoundingClientRect();
        var b = t.getBoundingClientRect();
        var x1 = (b.right - sr.left)/k, y1 = (b.top + b.height/2 - sr.top)/k;
        var x2 = (a.getBoundingClientRect().left - sr.left)/k, y2 = (n.top + n.height/2 - sr.top)/k;
        var xm = (phone.right - sr.left)/k + 26 + idx*12;
        var dy = y2 - y1, r = Math.min(10, Math.abs(dy)/2), s = dy > 0 ? 1 : -1;
        var d = Math.abs(dy) < 2 ? 'M'+x1+' '+y1+' H'+x2
          : 'M'+x1+' '+y1+' H'+(xm-r)+' Q'+xm+' '+y1+' '+xm+' '+(y1+s*r)+' V'+(y2-s*r)+' Q'+xm+' '+y2+' '+(xm+r)+' '+y2+' H'+x2;
        out += '<path d="'+d+'" fill="none" stroke="#070401" stroke-width="1.4" stroke-dasharray="1 0"/>';
        out += '<circle cx="'+x1+'" cy="'+y1+'" r="5.5" fill="#FDC348" stroke="#070401" stroke-width="1.8"/>';
      });
      svg.setAttribute('viewBox','0 0 1440 810'); svg.innerHTML = out;
    });
  }
  function fit(){
    if (exportMode) return;
    var z = Math.min(1, (window.innerWidth - 40) / 1440);
    document.querySelector('.deck').style.setProperty('--z', z);
  }
  function go(d){
    var s = [].slice.call(document.querySelectorAll('.slide'));
    var mid = window.innerHeight/2, cur = 0;
    s.forEach(function(el,i){ var r = el.getBoundingClientRect(); if (r.top <= mid) cur = i; });
    var nx = Math.max(0, Math.min(s.length-1, cur + d));
    s[nx].scrollIntoView({behavior:'smooth', block:'center'});
  }
  document.addEventListener('keydown', function(e){
    if (['ArrowDown','ArrowRight','PageDown',' '].indexOf(e.key) > -1){ e.preventDefault(); go(1); }
    if (['ArrowUp','ArrowLeft','PageUp'].indexOf(e.key) > -1){ e.preventDefault(); go(-1); }
  });
  window.addEventListener('resize', fit);
  document.fonts.ready.then(function(){ connectors(); fit(); document.body.classList.add('ready'); });
})();
`;

export function buildHtml() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Playbook Agentes de IA</title>
<style>${CSS}</style>
</head>
<body>
<main class="deck">
${[s1, s2, s3, s4, s5, s6, s7, s8, s9, s10].join('\n')}
</main>
<script>${JS}</script>
</body>
</html>`;
}
