// Gera o HTML do Playbook Viacredi + Ubots (10 slides, 1440x810).
// A copy vem do playbook-viacredi-ubots.md e não deve ser reescrita aqui.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = (p) => path.join(ROOT, 'assets', p);
const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(A(p)).toString('base64')}`;

const TOTAL = 10;
const LOGO = {
  ubots: b64('logo-ubots.png', 'image/png'),
  ubotsDark: b64('logo-ubots-dark.png', 'image/png'),
  via: b64('logo-viacredi.png', 'image/png'),
  viaDark: b64('logo-viacredi-dark.png', 'image/png'),
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
]
  .map(([f, w, s, file]) => `@font-face{font-family:'${f}';font-weight:${w};font-style:${s};font-display:block;src:url(${b64('fonts/' + file, 'font/ttf')}) format('truetype');}`)
  .join('\n');

// ---------- helpers ----------
const gold = (s) => s.replace(/==(.+?)==/g, '<span class="gold">$1</span>');
const tbc = (s) => `<span class="tbc">${s}</span>`;
const CARGO = tbc('[cargo A CONFIRMAR]');
const FALA = tbc('[Fala A CONFIRMAR com a Giovanna]');

const header = (n, dark = false) => `
  <header class="hdr">
    <div class="logos">
      <img class="ub" src="${dark ? LOGO.ubotsDark : LOGO.ubots}" alt="Ubots">
      <span class="vdiv"></span>
      <img class="vc" src="${dark ? LOGO.viaDark : LOGO.via}" alt="Viacredi">
    </div>
    <div class="count"><b>${String(n).padStart(2, '0')}</b> <span>/ ${TOTAL}</span></div>
  </header>`;

const pill = (t = 'Playbook · Agentes de IA na Oferta de Crédito') => `<div class="pill">${t}</div>`;

const wave = (color = 'var(--ouro)', w = 112, rows = 3, sw = 4) => {
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

const ICON = {
  wa: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M12 5.3a6.7 6.7 0 0 0-5.8 10.1l-.9 3.3 3.4-.9A6.7 6.7 0 1 0 12 5.3z" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.7 9.1c.2-.4.4-.4.6-.4h.4c.1 0 .3 0 .4.3l.5 1.2c.1.1.1.3 0 .4l-.3.5c-.1.1-.2.2-.1.4.3.5.7 1 1.2 1.4.4.3.9.6 1.4.8.2.1.3 0 .4-.1l.5-.6c.1-.2.3-.2.4-.1l1.2.6c.2.1.3.2.3.3 0 .4-.1.9-.5 1.2-.4.3-1 .5-1.6.4-1.4-.3-2.6-1.1-3.5-2.1-.8-.9-1.4-2-1.4-3 0-.5.2-.9.5-1.1z" fill="#fff"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" fill="currentColor"/></svg>`,
  bulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/></svg>`,
  chat: `<path d="M4 5h16v11H9l-5 4z"/>`,
  fwd: `<path d="M4 12h14M13 6l6 6-6 6"/>`,
  doc: `<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 14l2 2 3.5-4"/>`,
  money: `<rect x="3" y="7" width="18" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.5"/>`,
  person: `<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>`,
  shield: `<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>`,
  back: `<path d="M15 5l-7 7 7 7"/>`,
};
const lineIcon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

const bars = (...ws) => ws.map((w) => `<i class="bar" style="width:${w}%"></i>`).join('');

const quote = (text, { dark = false, cls = '' } = {}) => `
  <figure class="quote ${dark ? 'on-dark' : ''} ${cls}">
    <span class="qmark" aria-hidden="true">“</span>
    <blockquote>${text}</blockquote>
    <figcaption>Giovanna · ${CARGO}, Viacredi <span class="sep"></span>${FALA}</figcaption>
  </figure>`;

const waHeader = (name = 'Agente Viacredi') => `
  <div class="wa-hd">
    <span class="wa-av">${ICON.spark}</span>
    <span class="wa-name">${name}</span>
    <span class="wa-ico">${ICON.wa}</span>
  </div>`;

const field = (label, ph, { h = 74, id } = {}) => `
  <div class="field">
    <label>${label}</label>
    <div class="box" style="height:${h}px" ${id ? `data-field="${id}"` : ''}>${ph ? `<span class="ph">${ph}</span>` : ''}</div>
  </div>`;

const check = (id, dark = false) => `<span class="cb ${dark ? 'cb-d' : ''}" ${id ? `data-check="${id}"` : ''}></span>`;

// ---------- slides ----------
const s1 = `
<section class="slide light" id="s1">
  ${header(1)}
  <div class="cover-l">
    <div class="pill-w"><i></i>Guia prático</div>
    <h1 class="t cover">${gold('Testando ==agentes de IA==')}<br>na oferta de crédito</h1>
    <p class="lead">Menos regras, mais contexto: o que a Viacredi aprendeu ao colocar um agente de IA para conversar com cooperados sobre crédito, e como levar esse teste para a sua instituição.</p>
    <p class="aud">Para bancos, cooperativas de crédito e instituições financeiras · Baseado no case Viacredi + Ubots</p>
    <div class="chips">
      <div class="chip"><span class="n dk">1</span>Preparar o agente</div>
      <span class="arr" aria-hidden="true"></span>
      <div class="chip"><span class="n au">2</span>Testar em volume controlado</div>
      <span class="arr" aria-hidden="true"></span>
      <div class="chip"><span class="n dk">3</span>Avaliar e escalar</div>
    </div>
  </div>
  <div class="cover-art" aria-hidden="true">
    <div class="ring"></div>
    <div class="list-card">
      <i class="bar dkbar" style="width:70%"></i>
      <div class="li"><span class="ck on"></span>${bars(72)}</div>
      <div class="li"><span class="ck on"></span>${bars(60)}</div>
      <div class="li"><span class="ck"></span>${bars(66)}</div>
      <div class="li"><span class="ck"></span>${bars(52)}</div>
    </div>
    <div class="chat-card">
      <div class="cc-hd">
        <span class="cc-av">${ICON.spark}</span>
        <span class="cc-nm"><i class="bar" style="width:92px;height:9px;background:var(--escuro);opacity:.85"></i><i class="bar" style="width:56px;margin-top:6px"></i></span>
        <span class="cc-wa">${ICON.wa}</span>
      </div>
      <div class="cc-b ag"><span class="selo">${ICON.spark}Agente de IA</span>${bars(88, 64)}</div>
      <div class="cc-b us">${bars(82, 50)}</div>
      <div class="cc-b ag">${bars(84, 70)}<i class="bar au" style="width:46%"></i></div>
      <div class="cc-b us">${bars(60)}</div>
    </div>
    <div class="spark-dot">${ICON.spark}</div>
    ${wave('#FFFDF9', 104, 3, 4)}
  </div>
</section>`;

const s2 = `
<section class="slide light" id="s2">
  ${header(2)}
  <div class="main">
    ${pill()}
    <h1 class="t" style="max-width:1120px">${gold('Uma cooperativa de 74 anos decidiu ==testar IA generativa== na venda de crédito')}</h1>
    <div class="s2-grid">
      <div class="s2-l">
        <div class="body-txt">
          <p>A Viacredi, cooperativa do Sistema Ailos com sede em Blumenau, tem mais de 1 milhão de cooperados e mais de 100 postos em Santa Catarina e no Paraná. Relacionamento próximo sempre foi a estratégia da casa.</p>
          <p>O desafio era ampliar a oferta de linhas de crédito com agentes de IA sem perder esse jeito de atender. E sem referência de mercado: até ali, a cooperativa trabalhava com bots de fluxo, de regras fixas, e não tinha nenhuma métrica de IA generativa para comparar.</p>
        </div>
        <div class="protag">
          <span class="mono">G</span>
          <div>
            <div class="pt-nm"><b>Giovanna</b> · ${CARGO}</div>
            <div class="pt-ds">Conduziu o projeto do primeiro teste à operação atual.</div>
          </div>
        </div>
      </div>
      <div class="s2-r">
        <h3 class="h3">Ponto de partida</h3>
        <div class="pp"><span class="num">1</span><div><b>Bots de fluxo</b><p>Conversas presas a regras fixas e caminhos pré-definidos.</p></div></div>
        <div class="pp"><span class="num">2</span><div><b>Sem histórico</b><p>Nenhum indicador de IA generativa para usar como base.</p></div></div>
        <div class="pp"><span class="num">3</span><div><b>Parceria com a Ubots</b><p>Construir e testar um agente de IA para a oferta de crédito.</p></div></div>
      </div>
    </div>
  </div>
  <p class="foot">Ainda na fase de testes, mais de R$ 150 mil em crédito foram liberados por meio do agente.</p>
</section>`;

const s3 = `
<section class="slide light" id="s3">
  ${header(3)}
  <div class="main">
    ${pill()}
    <h1 class="t" style="max-width:1180px">${gold('O primeiro instinto foi ==empilhar regras==, e o agente virou um bot de fluxo')}</h1>
    <p class="sub">Cada "não pode" parecia deixar o agente mais seguro. Na prática, deixou a conversa mais rígida, e cada tentativa de torná-lo simpático com novas regras reforçava o tom robótico.</p>
    <div class="cmp">
      <div class="panel editor">
        <div class="ed-hd"><span class="dots"><i></i><i></i><i></i></span><b>Instruções por regras</b><span class="badge">+ 1 regra a cada ajuste</span></div>
        <ol class="rules">
          <li><span class="mk">Não fale sobre…</span></li>
          <li><span class="mk">Não responda se…</span></li>
          <li><span class="mk">Não ofereça…</span></li>
          <li><span class="mk">Sempre use a frase…</span></li>
          <li><span class="mk">Não saia do roteiro…</span></li>
        </ol>
      </div>
      <div class="cmp-arr" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON.fwd}</svg></div>
      <div class="panel wa">
        <div class="wa-top"><b>Conversa resultante</b></div>
        ${waHeader()}
        <div class="wa-body">
          <div class="msg ag">Olá. Temos uma linha de crédito disponível para você. Deseja saber mais? Responda SIM ou NÃO.</div>
          <div class="msg us">Depende, pra que serve?</div>
          <div class="msg ag">Não entendi sua resposta. Responda SIM ou NÃO.</div>
        </div>
      </div>
    </div>
    <p class="cap">Exemplo ilustrativo.</p>
    <div class="s3-bot">
      ${quote('"A gente colocava regra atrás de regra: não pode isso, não pode aquilo. E o agente ficava cada vez mais mecânico."')}
      <div class="callout">${wave('var(--ouro)', 80, 2, 3.5)}<p>Na prática, era IA generativa trabalhando com os mesmos limites de um bot de fluxo.</p></div>
    </div>
  </div>
</section>`;

const s4 = `
<section class="slide dark" id="s4">
  ${header(4, true)}
  <div class="main">
    ${pill()}
    <h1 class="t">${gold('A virada veio quando o agente ==entendeu o papel dele==')}</h1>
    <p class="sub" style="max-width:1140px">Na primeira semana de julho, a Viacredi reformulou a lógica do agente. Tirou o excesso de regras, explicou no prompt o conceito e o objetivo do papel dele e manteve só os guardrails críticos de segurança, desenhados com a ajuda da própria IA.</p>
    <div class="s4-grid">
      <div class="cols3">
        <div class="col saiu"><h4>O que saiu</h4><ul><li>Regras de comportamento em excesso</li><li>Roteiro fechado para cada resposta</li></ul></div>
        <div class="col entrou"><h4>O que entrou</h4><ul><li>O objetivo da conversa</li><li>O contexto do cooperado e da oferta</li><li>Liberdade para conversar sobre o que o cooperado trouxer</li></ul></div>
        <div class="col ficou"><h4>O que ficou</h4><ul><li>Guardrails críticos de segurança</li><li>Transparência sobre custos</li><li>Contratação pelo canal seguro</li></ul></div>
      </div>
      ${quote('"Quando expliquei ao agente qual era o papel dele e o que ele precisava alcançar, a experiência melhorou na hora. Hoje, quando aparece um problema, eu levo para a própria IA e a gente constrói a solução junto."', { dark: true, cls: 'q4' })}
    </div>
    <p class="apoio">Saudação, transbordo e volume de mensagens passaram a ser ajustados em conjunto com a IA, sem nova regra manual.</p>
    <div class="band"><span>Segurança onde importa, conversa de verdade no resto.</span>${wave('var(--escuro)', 96, 2, 3.5)}</div>
  </div>
</section>`;

const s5 = `
<section class="slide light" id="s5">
  ${header(5)}
  <svg class="conn" data-conn></svg>
  <div class="main">
    ${pill()}
    <h1 class="t" style="max-width:1180px">${gold('Uma conversa sobre ==reforma de cozinha== terminou em contratação de crédito')}</h1>
    <p class="sub">Dias depois da mudança, uma cooperada respondeu à oferta dizendo que já tinha um crédito contratado, mas que era bom saber de outro disponível. Nada do que veio depois estava roteirizado.</p>
    <div class="s5-grid">
      <div class="s5-l">
        <div class="phone">
          <div class="screen">
            <div class="wa-hd big"><span class="bk">${lineIcon('back')}</span><span class="wa-av">${ICON.spark}</span><span class="wa-name">Agente Viacredi<small>online</small></span><span class="wa-ico">${ICON.wa}</span></div>
            <div class="wa-body">
              <div class="msg us">Já tenho um crédito contratado, mas achei bom saber que tem outro disponível.</div>
              <div class="msg ag" data-anchor="a1">Que bom! Posso perguntar o que você está planejando?</div>
              <div class="msg us" data-anchor="a2">Estou reformando a cozinha.</div>
              <div class="msg ag bars-only">${bars(92, 74)}</div>
              <div class="msg ag bars-only" data-anchor="a3">${bars(88, 80, 46)}</div>
              <div class="msg us bars-only" data-anchor="a4">${bars(90, 58)}<span class="selo-c">Contratação</span></div>
            </div>
          </div>
        </div>
        <p class="cap s5-cap">Reconstituição a partir do relato do projeto.</p>
      </div>
      <div class="anns">
        <div class="ann" data-ann="a1"><span class="ann-n">1</span><div><b>Escuta</b><p>Em vez de repetir a oferta, o agente pergunta o motivo do interesse.</p></div></div>
        <div class="ann" data-ann="a2"><span class="ann-n">2</span><div><b>Contexto</b><p>A cooperada conta da reforma e o agente conversa sobre ela, como faria um bom atendente.</p></div></div>
        <div class="ann" data-ann="a3"><span class="ann-n">3</span><div><b>Oferta com sentido</b><p>O crédito aparece como resposta a um plano real, e não como disparo genérico.</p></div></div>
        <div class="ann" data-ann="a4"><span class="ann-n">4</span><div><b>Decisão da cooperada</b><p>A contratação vem da conversa. Nenhum passo estava previsto em roteiro.</p></div></div>
      </div>
    </div>
  </div>
</section>`;

const s6 = `
<section class="slide light" id="s6">
  ${header(6)}
  <div class="main">
    ${pill()}
    <h1 class="t" style="max-width:1180px">${gold('A liberdade para conversar veio junto com ==transparência e segurança==')}</h1>
    <p class="sub">O mesmo contexto que deixa a conversa natural também protege o cooperado: o agente explica custos, orienta a contratação pelo canal seguro e chama o time humano quando faz sentido.</p>
    <div class="cards3">
      <div class="c6">
        <h4><span class="num sm">1</span>Custos às claras</h4>
        <div class="mini">
          ${waHeader()}
          <div class="wa-body">
            <div class="msg us">Quais são os custos da retirada?</div>
            <div class="msg ag">É um crédito com juros e IOF. ${bars(90, 70)}</div>
            <div class="msg ag">${bars(84)}<span class="chip-in">Falar com o time humano</span></div>
          </div>
        </div>
        <p class="sup">Transparência sem esperar o cooperado insistir.</p>
      </div>
      <div class="c6">
        <h4><span class="num sm">2</span>Fechamento pelo app</h4>
        <div class="mini">
          ${waHeader()}
          <div class="wa-body">
            <div class="msg us">Dá para fechar aqui mesmo, pelo WhatsApp?</div>
            <div class="msg ag">Por segurança, a contratação é 100% digital pelo aplicativo. ${bars(70)}
              <ol class="steps"><li><span>1</span>${bars(80)}</li><li><span>2</span>${bars(64)}</li><li><span>3</span>${bars(72)}</li></ol>
            </div>
          </div>
        </div>
        <p class="sup">O canal seguro vira orientação, e não bloqueio.</p>
      </div>
      <div class="c6">
        <h4><span class="num sm">3</span>Transbordo com contexto</h4>
        <div class="mini note-wrap">
          <div class="note">
            <span class="pin" aria-hidden="true"></span>
            <b class="nt">Nota para o time de negócios</b>
            <dl>
              <dt>Cooperado:</dt><dd>[nome]</dd>
              <dt>Interesse:</dt><dd>linha de crédito [X]</dd>
              <dt>Ponto em aberto:</dt><dd>quer comparar com outras linhas</dd>
              <dt>Histórico:</dt><dd>conversa completa anexada</dd>
            </dl>
          </div>
        </div>
        <p class="sup">O transbordo ficou baixo. Quando acontece, o time continua a conversa sem pedir que o cooperado repita nada.</p>
      </div>
    </div>
    ${quote('"O mercado costuma travar tudo num roteiro fechado. A liberdade guiada por contexto é o que deixa a experiência perto de um atendimento humano bem feito."', { cls: 'qband' })}
  </div>
</section>`;

const tl = [
  ['Abril a junho', 'Testes controlados. Pausas frequentes para refinar o agente, preparar o time e definir os novos indicadores.', ''],
  ['Junho', 'Pausa total para reestruturar os disparos e planejar a escala.', 'pause'],
  ['1ª semana de julho', 'A virada: menos regras, mais contexto.', 'key'],
  ['2ª semana de julho', 'Testes retomados com a nova versão do agente.', ''],
  ['Até dezembro', 'Meta de rodar mais de 10% das ações ativas com agente generativo.', 'goal'],
];
const s7 = `
<section class="slide light" id="s7">
  ${header(7)}
  <div class="main">
    ${pill()}
    <h1 class="t" style="max-width:1120px">${gold('Testar pouco, pausar e voltar melhor ==fez parte do método==')}</h1>
    <p class="sub">A Viacredi não começou em escala. Começou com cooperados reais, volume baixo e filtros de risco, e tratou cada pausa como parte do teste.</p>
    <div class="s7-grid">
      <div class="tl">
        <div class="tl-line"></div><div class="tl-dash"></div>
        ${tl.map(([t, d, k], i) => `
        <div class="ms ${k}">
          <span class="big-n">${i + 1}</span>
          <span class="dot"></span>
          <b>${t}</b>
          <p>${d}</p>
        </div>`).join('')}
      </div>
      <aside class="ubots-panel">
        <h3 class="h3">O papel da Ubots</h3>
        <p>A Ubots entrou como parceira na construção do primeiro agente e como plataforma para o time testar no próprio ritmo. Com o Agent Builder, a equipe da Viacredi ganhou autonomia: Giovanna já construiu 4 agentes sem depender do time de implementação.</p>
        <p>Próximos passos da cooperativa: um agente mais generalista e agentes para produtos sem risco de crédito, como cartão e aplicações no onboarding de novos cooperados.</p>
        ${wave('var(--ouro)', 88, 2, 3.5)}
      </aside>
    </div>
  </div>
  <p class="foot">Mais de R$ 150 mil em crédito liberados antes de a operação estar totalmente estruturada.</p>
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
const s8 = `
<section class="slide light" id="s8">
  ${header(8)}
  <div class="main">
    ${pill()}
    <h1 class="t">${gold('Antes de escrever regras, escreva ==o papel do agente==')}</h1>
    <p class="sub">Explique ao agente para que ele existe, com quem conversa e onde termina a autonomia dele. Preencha com as definições da sua instituição.</p>
    <div class="s8-grid">
      <div class="card fields6">
        ${s8fields.map(([l, p], i) => field(l, p, { h: 96, id: `s8_${l.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}` })).join('')}
      </div>
      <div class="darkbox">
        <h3>Guardrails críticos: o que nunca muda</h3>
        <ul class="cklist">${s8guard.map((g, i) => `<li>${check(`s8_guard_${i + 1}`, true)}<span>${g}</span></li>`).join('')}</ul>
        ${wave('var(--ouro)', 112, 3, 4)}
      </div>
    </div>
    <div class="tip"><span class="tip-i">${ICON.bulb}</span><p>Na Viacredi, a própria IA ajudou a desenhar os guardrails e a resolver os ajustes do dia a dia. Comece por aí.</p></div>
  </div>
</section>`;

const steps = [
  ['Preparação', 'Papel do agente e guardrails escritos, público definido com filtros de risco, responsáveis e indicadores combinados.', 'agente pronto para conversar com um grupo pequeno.', ['Data', 'Responsável'], 'dk'],
  ['Teste', 'Disparos em volume baixo, leitura das conversas e pausas para ajustar sempre que preciso.', 'conversas revisadas e ajustes registrados.', ['Início', 'Término', 'Responsável'], 'au'],
  ['Avaliação', 'Resultados, transbordos e qualidade das conversas consolidados.', 'decisão de continuar, ajustar ou ampliar.', ['Data', 'Responsável'], 'dk'],
];
const inds = [
  ['chat', 'Resposta', 'Clientes que responderam ÷ clientes abordados'],
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
    ${pill()}
    <h1 class="t" style="max-width:1100px">${gold('Teste em ==volume controlado== e meça o que muda na conversa')}</h1>
    <div class="steps3">
      ${steps.map(([t, d, e, fs, c], i) => `
      <div class="card step">
        <div class="st-hd"><span class="n ${c}">${i + 1}</span><b>${t}</b></div>
        <p class="st-d">${d}</p>
        <div class="entrega"><b>Entrega:</b> ${e}</div>
        <div class="st-f" style="grid-template-columns:${fs.length === 3 ? '1fr 1fr 1.3fr' : '1fr 1.5fr'}">
          ${fs.map((f) => field(f, '', { h: 32, id: `s9_${i + 1}_${f.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}` })).join('')}
        </div>
      </div>`).join('')}
    </div>
    <div class="inds">
      <div class="ind-line"></div>
      ${inds.map(([ic, t, d]) => `<div class="ind"><span class="ic">${lineIcon(ic)}</span><b>${t}</b><p>${d}</p></div>`).join('')}
    </div>
    <div class="evalbar">
      <ul class="qs">
        <li><span class="q">?</span>O teste respondeu ao objetivo definido no slide 8?</li>
        <li><span class="q">?</span>Quais situações exigiram participação humana?</li>
        <li><span class="q">?</span>O que ajustar antes de ampliar o volume?</li>
      </ul>
      <div class="dec">
        ${['Continuar', 'Ajustar', 'Ampliar'].map((d) => `<span class="dpill">${check(`s9_${d.toLowerCase()}`, true)}${d}</span>`).join('')}
      </div>
    </div>
  </div>
  <p class="foot sm">Os resultados da Viacredi não constituem projeção para outras instituições.</p>
</section>`;

const levar = [
  ['Papel do agente', 'slide 8'],
  ['Guardrails críticos', 'slide 8'],
  ['Plano de teste e responsáveis', 'slide 9'],
  ['Indicadores e critério de decisão', 'slide 9'],
];
const s10 = `
<section class="slide dark cta" id="s10">
  ${header(10, true)}
  <div class="main center">
    ${pill()}
    <h1 class="t">${gold('Desenhe o ==primeiro teste== de agente')}<br>de IA na sua instituição</h1>
    <p class="sub">Use este guia para definir o papel do agente, os guardrails e o plano de teste antes de colocar a primeira conversa no ar.</p>
    <div class="cta-grid">
      <div class="dcard">
        <h3>Converse com a Ubots sobre a sua operação</h3>
        <p>Leve a linha de crédito que você quer testar e as definições preenchidas neste playbook.</p>
        <div class="cta-row">
          <div>
            <a class="btn" href="#url-a-confirmar">Falar com um especialista <span aria-hidden="true">→</span></a>
            <div class="url">${tbc('[URL A CONFIRMAR, com UTM]')}</div>
          </div>
          ${wave('var(--ouro)', 112, 3, 4)}
        </div>
      </div>
      <div class="dcard">
        <h3>Leve para a conversa</h3>
        <ul class="levar">${levar.map(([t, s], i) => `<li>${check(`s10_${i + 1}`, true)}<span>${t}</span><em>${s}</em></li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>`;

// ---------- css ----------
const CSS = `
${FONTS}
:root{
  --ouro:#FDC348; --escuro:#070401; --branco:#FFFDF9;
  --cinza-medio:#6C6C71; --cinza-claro:#AFAFB4; --ouro-suave:#FFF3D1;
  /* derivados */
  --ouro-texto:#6B4D00;  /* texto pequeno sobre ouro-suave */
  --card:#FFFFFF; --linha:#ECE5D6; --dark-card:#15110C; --dark-line:#2C2620;
  --tbc:#B4005E; --tbc-bg:#FFE1F0;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#24201B}
body{font-family:'Nunito',sans-serif;color:var(--escuro);-webkit-font-smoothing:antialiased}
.deck{display:flex;flex-direction:column;align-items:center;gap:28px;padding:28px 0;zoom:var(--z,1)}
.slide{width:1440px;height:810px;position:relative;overflow:hidden;flex:none;page-break-after:always;break-after:page;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.slide.light{background:
  radial-gradient(760px 560px at 100% 0%, var(--ouro-suave) 0%, rgba(255,243,209,.55) 38%, rgba(255,243,209,0) 72%),
  radial-gradient(620px 420px at 0% 100%, rgba(255,243,209,.55) 0%, rgba(255,243,209,0) 70%),
  var(--branco)}
.slide.dark{background:
  radial-gradient(820px 520px at 50% 18%, rgba(253,195,72,.10) 0%, rgba(253,195,72,0) 70%),
  var(--escuro); color:var(--branco)}
ul,ol{list-style:none}

/* header */
.hdr{position:absolute;top:40px;left:90px;right:90px;height:36px;display:flex;align-items:center;justify-content:space-between;z-index:3}
.logos{display:flex;align-items:center;gap:20px}
.logos .ub{height:28px}
.logos .vc{height:33px}
.vdiv{width:1px;height:30px;background:var(--cinza-claro)}
.dark .vdiv{background:#4A443D}
.count{font:500 13px/1 'Poppins';letter-spacing:.06em;color:var(--cinza-medio)}
.count b{font-weight:600;color:var(--escuro)}
.dark .count{color:var(--cinza-claro)} .dark .count b{color:var(--branco)}

/* layout base */
.main{position:absolute;top:100px;left:90px;right:90px;bottom:40px;display:flex;flex-direction:column}
.pill{align-self:flex-start;background:var(--ouro-suave);color:var(--ouro-texto);font:500 12px/1 'Poppins';padding:8px 14px;border-radius:999px}
.dark .pill{background:rgba(253,195,72,.14);color:var(--ouro)}
h1.t{font:700 44px/1.12 'Poppins';letter-spacing:-.028em;margin-top:14px;color:var(--escuro)}
.dark h1.t{color:var(--branco)}
.gold{color:var(--ouro)}
.sub{font:400 16px/1.5 'Nunito';color:var(--cinza-medio);margin-top:10px;max-width:1080px}
.dark .sub{color:var(--cinza-claro)}
.h3{font:700 18px/1.2 'Poppins'}
.cap{font:400 11px/1.3 'Nunito';color:var(--cinza-medio)}
.foot{position:absolute;left:90px;bottom:30px;font:400 12px/1.3 'Nunito';color:var(--cinza-medio)}
.foot.sm{font-size:11px}
.tbc{color:var(--tbc);background:var(--tbc-bg);border-radius:4px;padding:1px 5px;font-style:normal;font-weight:700;white-space:nowrap}
.card{background:var(--card);border:1px solid var(--linha);border-radius:18px;box-shadow:0 10px 30px rgba(107,77,0,.07)}
.num{font:700 40px/1 'Poppins';color:var(--ouro);letter-spacing:-.02em}
.n{width:30px;height:30px;border-radius:50%;display:inline-grid;place-items:center;font:600 14px/1 'Poppins';flex:none}
.n.dk{background:var(--escuro);color:var(--branco)} .n.au{background:var(--ouro);color:var(--escuro)}
.bar{display:block;height:7px;border-radius:4px;background:rgba(7,4,1,.13)}
.bar+.bar{margin-top:6px}
.wave{display:block}

/* field */
.field label{display:block;font:600 12px/1.2 'Nunito';color:var(--escuro);margin-bottom:6px}
.box{border:1px solid var(--cinza-claro);border-radius:8px;background:#fff;padding:9px 12px}
.box .ph{display:block;font:400 13px/1.35 'Nunito';color:var(--cinza-medio)}
.cb{width:18px;height:18px;border:2px solid var(--ouro-texto);border-radius:5px;flex:none;display:inline-block;background:transparent}
.cb.cb-d{border-color:var(--ouro)}

/* quote */
.quote{position:relative;padding-left:58px}
.quote .qmark{position:absolute;left:0;top:-8px;font:800 96px/1 'Nunito';color:var(--ouro)}
.quote blockquote{font:italic 400 18px/1.5 'Nunito';color:var(--escuro)}
.quote figcaption{margin-top:10px;font:600 13px/1.6 'Nunito';color:var(--cinza-medio)}
.quote .sep{display:inline-block;width:4px;height:4px;border-radius:50%;background:var(--cinza-claro);vertical-align:middle;margin:0 8px}
.quote.on-dark blockquote{color:var(--branco)}
.quote.on-dark figcaption{color:var(--cinza-claro)}

/* whatsapp */
.wa-hd{display:flex;align-items:center;gap:9px;background:var(--escuro);color:var(--branco);padding:9px 12px}
.wa-av{width:26px;height:26px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;flex:none}
.wa-av svg{width:13px;height:13px}
.wa-name{font:600 13px/1.1 'Poppins';flex:1;display:flex;flex-direction:column}
.wa-name small{font:400 11px/1.2 'Nunito';color:var(--cinza-claro);margin-top:2px}
.wa-ico svg{width:16px;height:16px;display:block}
.wa-body{display:flex;flex-direction:column;gap:8px;padding:12px}
.msg{max-width:82%;font:400 13.5px/1.4 'Nunito';padding:8px 11px;border-radius:12px;color:var(--escuro)}
.msg.ag{align-self:flex-start;background:var(--ouro-suave);border-top-left-radius:3px}
.msg.us{align-self:flex-end;background:#fff;border:1px solid var(--cinza-claro);border-top-right-radius:3px}
.msg.ag .bar{background:rgba(107,77,0,.22)}
.msg.bars-only{width:62%;padding:11px 12px}
.msg > .bar:first-child{margin-top:6px}
.msg.bars-only > .bar:first-child{margin-top:0}

/* ---------- s1 ---------- */
.cover-l{position:absolute;left:90px;top:212px;width:820px}
.pill-w{display:inline-flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--linha);border-radius:999px;padding:9px 16px;font:500 13px/1 'Poppins';box-shadow:0 4px 14px rgba(107,77,0,.06)}
.pill-w i{width:8px;height:8px;border-radius:50%;background:var(--ouro)}
h1.t.cover{font-size:60px;line-height:1.08;margin-top:22px;letter-spacing:-.032em}
.lead{font:400 19px/1.5 'Nunito';color:var(--escuro);margin-top:22px;max-width:720px}
.aud{font:400 12px/1.4 'Nunito';color:var(--cinza-medio);margin-top:16px}
.chips{display:flex;align-items:center;gap:12px;margin-top:34px}
.chip{white-space:nowrap;display:flex;align-items:center;gap:11px;background:#fff;border:1px solid var(--linha);border-radius:14px;padding:11px 16px 11px 11px;font:600 15px/1 'Poppins';box-shadow:0 8px 20px rgba(107,77,0,.07)}
.arr{width:30px;height:2px;background:var(--cinza-claro);position:relative}
.arr:after{content:"";position:absolute;right:-1px;top:-4px;width:8px;height:8px;border-top:2px solid var(--cinza-claro);border-right:2px solid var(--cinza-claro);transform:rotate(45deg)}
.cover-art{position:absolute;left:930px;top:122px;width:420px;height:596px;border-radius:38px;overflow:hidden;
  background:linear-gradient(160deg,#FFD873 0%,var(--ouro) 45%,#F6B532 100%);box-shadow:0 30px 60px rgba(107,77,0,.18)}
.cover-art .ring{position:absolute;left:-120px;top:-130px;width:340px;height:340px;border-radius:50%;border:28px solid rgba(255,253,249,.28)}
.list-card{position:absolute;left:26px;top:250px;width:190px;padding:20px 18px;background:rgba(255,253,249,.92);border-radius:20px;transform:rotate(-6deg);box-shadow:0 16px 30px rgba(107,77,0,.16)}
.list-card .dkbar{height:10px;background:rgba(7,4,1,.72);margin-bottom:16px}
.list-card .li{display:flex;align-items:center;gap:10px;margin-top:14px}
.list-card .li .bar{flex:1;background:rgba(107,77,0,.18)}
.ck{width:20px;height:20px;border-radius:6px;border:2px solid #E3A21A;flex:none;position:relative;background:#fff}
.ck.on{background:var(--ouro)}
.ck.on:after{content:"";position:absolute;left:5px;top:1px;width:5px;height:10px;border:solid var(--escuro);border-width:0 2px 2px 0;transform:rotate(45deg)}
.chat-card{position:absolute;left:128px;top:108px;width:262px;padding:18px 16px 20px;background:#fff;border-radius:24px;transform:rotate(3deg);box-shadow:0 24px 44px rgba(107,77,0,.22)}
.cc-hd{display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid var(--linha);margin-bottom:14px}
.cc-av{width:36px;height:36px;border-radius:50%;background:var(--ouro-suave);color:#E3A21A;display:grid;place-items:center}
.cc-av svg{width:18px;height:18px}
.cc-nm{flex:1}
.cc-wa svg{width:20px;height:20px;display:block}
.cc-b{border-radius:14px;padding:12px 13px;margin-top:10px}
.cc-b.ag{background:var(--ouro-suave);width:86%;border-top-left-radius:4px}
.cc-b.ag .bar{background:rgba(107,77,0,.24)}
.cc-b.ag .bar.au{background:var(--ouro);height:10px}
.cc-b.us{background:#F4F1EA;width:74%;margin-left:auto;border-top-right-radius:4px}
.selo{display:inline-flex;align-items:center;gap:5px;background:var(--escuro);color:var(--ouro);font:600 10.5px/1 'Poppins';padding:5px 8px 5px 7px;border-radius:999px;margin-bottom:9px}
.selo svg{width:10px;height:10px}
.spark-dot{position:absolute;right:22px;top:70px;width:66px;height:66px;border-radius:50%;background:var(--escuro);color:var(--ouro);display:grid;place-items:center;box-shadow:0 14px 26px rgba(7,4,1,.25)}
.spark-dot svg{width:28px;height:28px}
.cover-art .wave{position:absolute;right:30px;bottom:30px}

/* ---------- s2 ---------- */
.s2-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:56px;margin-top:52px}
.s2-l{display:flex;flex-direction:column}
.body-txt p{font:400 19px/1.66 'Nunito';color:var(--escuro)}
.body-txt p+p{margin-top:20px}
.protag{margin-top:40px;display:flex;align-items:center;gap:16px;background:var(--card);border:1px solid var(--linha);border-radius:16px;padding:16px 20px;box-shadow:0 10px 30px rgba(107,77,0,.07)}
.mono{width:46px;height:46px;border-radius:50%;background:var(--ouro);display:grid;place-items:center;font:700 20px/1 'Poppins';flex:none}
.pt-nm{font:400 16px/1.3 'Nunito'} .pt-nm b{font:700 16px 'Poppins'}
.pt-ds{font:400 14.5px/1.4 'Nunito';color:var(--cinza-medio);margin-top:3px}
.s2-r{display:flex;flex-direction:column;gap:16px}
.s2-r .h3{margin-bottom:2px}
.pp{display:flex;gap:18px;align-items:flex-start;background:var(--card);border:1px solid var(--linha);border-radius:16px;padding:26px 24px;box-shadow:0 10px 30px rgba(107,77,0,.06)}
.pp .num{width:30px;text-align:center}
.pp b{font:700 16px/1.25 'Poppins'}
.pp p{font:400 14.5px/1.45 'Nunito';color:var(--cinza-medio);margin-top:4px}

/* ---------- s3 ---------- */
.cmp{display:grid;grid-template-columns:1fr 64px 1fr;align-items:stretch;margin-top:22px}
.panel{background:var(--card);border:1px solid var(--linha);border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(107,77,0,.07)}
.ed-hd{display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--linha);font:600 13px/1 'Poppins'}
.ed-hd .dots{display:flex;gap:5px} .ed-hd .dots i{width:9px;height:9px;border-radius:50%;background:var(--cinza-claro)}
.badge{margin-left:auto;background:var(--escuro);color:var(--ouro);font:600 11px/1 'Poppins';padding:6px 10px;border-radius:999px}
.rules{counter-reset:r;padding:18px 18px 18px 16px;display:flex;flex-direction:column;gap:12px}
.rules li{counter-increment:r;display:flex;align-items:center;gap:14px;font:600 17px/1.3 'Nunito'}
.rules li:before{content:counter(r);font:500 12px/1 'Poppins';color:var(--cinza-medio);width:12px;text-align:right}
.mk{background:linear-gradient(transparent 52%, #FDE3A0 52%, #FDE3A0 92%, transparent 92%);padding:0 3px}
.cmp-arr{display:grid;place-items:center;color:var(--escuro)}
.cmp-arr svg{width:40px;height:40px;padding:9px;border-radius:50%;background:var(--ouro);overflow:visible}
.panel.wa{display:flex;flex-direction:column}
.wa-top{padding:11px 16px;font:600 13px/1 'Poppins';border-bottom:1px solid var(--linha)}
.panel.wa .wa-hd{padding:7px 12px}
.panel.wa .wa-body{gap:10px;padding:16px 16px;background:var(--branco);flex:1;justify-content:center}
.panel.wa .msg{font-size:15px;padding:9px 13px}
.cmp + .cap{margin-top:8px}
.s3-bot{display:grid;grid-template-columns:1.55fr 1fr;gap:40px;margin-top:auto;align-items:end}
.callout{background:var(--escuro);color:var(--branco);border-radius:18px;padding:20px 24px;display:flex;gap:18px;align-items:center}
.callout p{font:600 18px/1.4 'Poppins'}
.callout .wave{flex:none}

/* ---------- s4 ---------- */
.s4-grid{display:grid;grid-template-columns:1.62fr 1fr;gap:44px;margin-top:30px;align-items:stretch}
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.col{border-radius:16px;padding:24px 22px 26px;min-height:300px}
.col h4{font:700 19px/1.2 'Poppins';margin-bottom:18px}
.col li{font:400 17px/1.4 'Nunito';padding-left:24px;position:relative}
.col li+li{margin-top:14px}
.col.saiu{border:1.5px dashed var(--cinza-medio)}
.col.saiu h4{color:var(--cinza-claro)}
.col.saiu li{color:var(--cinza-claro);text-decoration:line-through;text-decoration-color:var(--cinza-claro)}
.col.saiu li:before{content:"×";position:absolute;left:2px;top:-1px;font:600 16px/1.4 'Poppins';color:var(--cinza-claro)}
.col.entrou{border:1.5px solid var(--ouro);background:rgba(253,195,72,.06)}
.col.entrou h4{color:var(--ouro)}
.col.entrou li{color:var(--branco)}
.col.entrou li:before{content:"+";position:absolute;left:2px;top:-1px;font:600 16px/1.4 'Poppins';color:var(--ouro)}
.col.ficou{background:var(--ouro);color:var(--escuro)}
.col.ficou li:before{content:"";position:absolute;left:3px;top:5px;width:6px;height:11px;border:solid var(--escuro);border-width:0 2px 2px 0;transform:rotate(45deg)}
.q4{align-self:center}
.q4 blockquote{font-size:20px}
.apoio{font:400 15px/1.4 'Nunito';color:var(--cinza-claro);margin-top:22px}
.band{margin-top:auto;background:var(--ouro);color:var(--escuro);border-radius:16px;padding:18px 28px;display:flex;align-items:center;justify-content:space-between}
.band span{font:700 22px/1.2 'Poppins';letter-spacing:-.01em}

/* ---------- s5 ---------- */
.conn{position:absolute;inset:0;width:1440px;height:810px;pointer-events:none;z-index:2;overflow:visible}
.s5-grid{display:grid;grid-template-columns:560px 1fr;gap:0;margin-top:14px;flex:1;min-height:0}
.s5-l{position:relative}
.phone{position:absolute;left:60px;top:0;width:384px;height:446px;background:var(--escuro);border-radius:44px;padding:9px;box-shadow:0 30px 60px rgba(7,4,1,.22)}
.screen{width:100%;height:100%;border-radius:36px;overflow:hidden;background:var(--branco);display:flex;flex-direction:column}
.wa-hd.big{padding:16px 14px 9px}
.wa-hd .bk{color:var(--branco);width:16px;height:16px} .wa-hd .bk svg{width:16px;height:16px;display:block}
.phone .wa-body{gap:7px;padding:11px 13px}
.phone .msg{font-size:13px;padding:7px 10px}
.phone .msg.bars-only{padding:9px 11px}
.selo-c{display:inline-block;margin-top:9px;background:var(--ouro);color:var(--escuro);font:600 11px/1 'Poppins';padding:6px 10px;border-radius:999px}
.s5-cap{position:absolute;left:60px;top:456px}
.anns{display:flex;flex-direction:column;justify-content:space-between;padding:4px 0 10px 80px}
.ann{display:flex;gap:16px;align-items:flex-start;max-width:600px}
.ann-n{width:32px;height:32px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;font:700 15px/1 'Poppins';flex:none;position:relative;z-index:3}
.ann b{font:700 17px/1.2 'Poppins'}
.ann p{font:400 15px/1.45 'Nunito';color:var(--cinza-medio);margin-top:4px}

/* ---------- s6 ---------- */
.cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:18px}
.c6{background:var(--card);border:1px solid var(--linha);border-radius:18px;padding:14px 18px 14px;display:flex;flex-direction:column;box-shadow:0 10px 30px rgba(107,77,0,.07)}
.c6 h4{display:flex;align-items:center;gap:12px;font:700 17px/1.2 'Poppins'}
.num.sm{font-size:40px;width:26px;line-height:.9}
.mini{margin-top:10px;border:1px solid var(--linha);border-radius:14px;overflow:hidden;background:var(--branco);height:222px}
.mini .wa-hd{padding:5px 10px}
.mini .wa-av{width:22px;height:22px}
.mini .wa-name{font-size:12px}
.mini .wa-body{padding:9px 10px;gap:6px}
.mini .msg{font-size:12.5px;line-height:1.35;padding:6px 10px;max-width:90%}
.mini .msg > .bar:first-child{margin-top:5px}
.chip-in{display:inline-block;margin-top:8px;background:var(--escuro);color:var(--branco);font:600 10.5px/1 'Poppins';padding:6px 9px;border-radius:999px}
.steps{margin-top:7px;display:flex;flex-direction:column;gap:5px}
.steps li{display:flex;align-items:center;gap:8px}
.steps li span{width:17px;height:17px;border-radius:50%;background:var(--escuro);color:var(--branco);font:600 10px/17px 'Poppins';text-align:center;flex:none}
.steps li .bar{flex:1;margin:0}
.note-wrap{display:grid;place-items:center;background:var(--branco)}
.note{position:relative;width:86%;background:var(--ouro-suave);border-radius:6px 6px 6px 22px;padding:20px 18px 14px;transform:rotate(-1.6deg);box-shadow:0 12px 22px rgba(107,77,0,.14)}
.note .pin{position:absolute;top:-7px;left:50%;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--escuro)}
.note .nt{display:block;font:700 13px/1.2 'Poppins';margin-bottom:9px}
.note dl{display:grid;grid-template-columns:auto 1fr;gap:5px 8px;font:400 12.5px/1.35 'Nunito'}
.note dt{font-weight:700}
.sup{font:400 14px/1.4 'Nunito';color:var(--cinza-medio);margin-top:10px}
.qband{margin-top:14px;background:var(--card);border:1px solid var(--linha);border-radius:18px;padding:13px 26px 11px 84px;box-shadow:0 10px 30px rgba(107,77,0,.06)}
.qband .qmark{left:24px;top:8px;font-size:80px}
.qband blockquote{font-size:16px;line-height:1.45}
.qband figcaption{margin-top:3px}

/* ---------- s7 ---------- */
.s7-grid{display:grid;grid-template-columns:1fr 410px;gap:48px;margin-top:40px;align-items:start}
.tl{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:18px}
.tl-line{position:absolute;left:8px;top:77px;width:calc(80% - 4px);height:2px;background:var(--escuro)}
.tl-dash{position:absolute;left:calc(80% + 4px);top:77px;right:60px;height:0;border-top:2px dashed var(--escuro)}
.ms{position:relative;display:flex;flex-direction:column}
.ms .big-n{font:700 56px/1 'Poppins';color:var(--ouro);height:62px}
.ms .dot{width:16px;height:16px;border-radius:50%;background:var(--ouro);border:2px solid var(--escuro);margin:7px 0 16px;position:relative;z-index:1}
.ms.key .dot{width:24px;height:24px;margin:3px 0 12px -4px;box-shadow:0 0 0 6px rgba(253,195,72,.35)}
.ms.pause .dot{background:var(--branco)}
.ms.goal .dot{background:var(--branco);border-style:dashed}
.ms b{font:700 17px/1.25 'Poppins'}
.ms p{font:400 15px/1.5 'Nunito';color:var(--cinza-medio);margin-top:8px}
.ms.key b{background:var(--escuro);color:var(--ouro);align-self:flex-start;padding:5px 9px;border-radius:8px;margin-left:-2px}
.ubots-panel{position:relative;border:1.5px solid var(--ouro);background:var(--card);border-radius:20px;padding:26px 28px 76px}
.ubots-panel p{font:400 15px/1.55 'Nunito';margin-top:12px}
.ubots-panel .h3{margin-bottom:2px}
.ubots-panel .wave{position:absolute;right:22px;bottom:20px}

/* ---------- s8 ---------- */
.s8-grid{display:grid;grid-template-columns:1fr 430px;gap:24px;margin-top:22px}
.fields6{display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;padding:20px 22px}
.darkbox{position:relative;background:var(--escuro);color:var(--branco);border-radius:20px;padding:30px 30px}
.darkbox h3{font:700 20px/1.3 'Poppins';max-width:330px}
.cklist{margin-top:24px;display:flex;flex-direction:column;gap:17px}
.cklist li{display:flex;gap:12px;align-items:flex-start;font:400 16px/1.4 'Nunito'}
.cklist .cb{margin-top:1px}
.darkbox .wave{position:absolute;right:26px;bottom:22px}
.tip{margin-top:auto;display:flex;align-items:center;gap:16px;background:var(--ouro-suave);border-radius:14px;padding:13px 20px}
.tip-i{width:34px;height:34px;border-radius:50%;background:var(--ouro);color:var(--escuro);display:grid;place-items:center;flex:none}
.tip-i svg{width:19px;height:19px}
.tip p{font:600 15px/1.4 'Nunito'}

/* ---------- s9 ---------- */
.steps3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:20px}
.step{padding:14px 18px 16px;display:flex;flex-direction:column}
.st-hd{display:flex;align-items:center;gap:11px}
.st-hd b{font:700 17px/1 'Poppins'}
.st-d{font:400 13.5px/1.45 'Nunito';color:var(--cinza-medio);margin-top:8px;min-height:59px}
.entrega{background:var(--ouro-suave);border-left:3px solid var(--ouro);border-radius:6px;padding:8px 11px;font:400 13px/1.4 'Nunito';margin-top:8px}
.entrega b{font-weight:800}
.st-f{display:grid;gap:10px;margin-top:10px}
.st-f .field label{font-size:11.5px;margin-bottom:4px}
.inds{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:16px;margin-top:18px}
.ind-line{position:absolute;left:18px;right:calc(16.66% - 18px);top:17px;height:1.5px;background:var(--cinza-claro)}
.ind{position:relative}
.ind .ic{width:36px;height:36px;border-radius:50%;border:1.5px solid var(--escuro);background:#fff;display:grid;place-items:center}
.ind .ic svg{width:18px;height:18px}
.ind b{display:block;font:700 15px/1.2 'Poppins';margin-top:9px}
.ind p{font:400 12.5px/1.4 'Nunito';color:var(--cinza-medio);margin-top:3px}
.evalbar{margin-top:auto;margin-bottom:16px;background:var(--escuro);color:var(--branco);border-radius:16px;padding:13px 22px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.qs{display:grid;grid-template-columns:auto auto;gap:6px 30px}
.qs li{display:flex;align-items:center;gap:9px;font:400 14px/1.3 'Nunito'}
.q{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--cinza-claro);color:var(--cinza-claro);font:600 10.5px/15px 'Poppins';text-align:center;flex:none}
.dec{display:flex;gap:10px}
.dpill{display:flex;align-items:center;gap:9px;border:1px solid #3A332B;background:#14100B;border-radius:999px;padding:9px 16px 9px 12px;font:600 14px/1 'Poppins'}

/* ---------- s10 ---------- */
.main.center{align-items:center;text-align:center}
.cta .main{top:96px}
.main.center .pill{align-self:center;margin-top:8px}
.cta h1.t{font-size:52px;margin-top:22px}
.cta .sub{max-width:700px;font-size:17px;margin-top:14px}
.cta-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;width:100%;margin-top:auto;text-align:left}
.dcard{background:var(--dark-card);border:1px solid var(--dark-line);border-radius:22px;padding:30px 34px;display:flex;flex-direction:column;min-height:330px}
.dcard h3{font:700 22px/1.25 'Poppins';color:var(--branco)}
.dcard > p{font:400 16px/1.5 'Nunito';color:var(--cinza-claro);margin-top:8px;max-width:520px}
.cta-row{display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto}
.btn{display:inline-flex;align-items:center;gap:12px;background:var(--ouro);color:var(--escuro);text-decoration:none;font:600 17px/1 'Poppins';padding:18px 26px;border-radius:999px;box-shadow:0 10px 26px rgba(253,195,72,.25)}
.url{margin-top:12px;font-size:12px}
.btn span{font-size:20px}
.levar{margin-top:16px}
.levar li{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--dark-line);font:400 16px/1.3 'Nunito';color:var(--branco)}
.levar li:last-child{border-bottom:0}
.levar li > span:not(.cb){flex:1}
.levar em{font:600 12px/1 'Poppins';font-style:normal;color:var(--ouro);background:rgba(253,195,72,.14);padding:6px 10px;border-radius:999px}

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
      slide.querySelectorAll('[data-ann]').forEach(function(a, idx){
        var t = slide.querySelector('[data-anchor="'+a.dataset.ann+'"]'); if(!t) return;
        var n = a.querySelector('.ann-n').getBoundingClientRect();
        var b = t.getBoundingClientRect();
        var x1 = (b.right - sr.left)/k, y1 = (b.top + b.height/2 - sr.top)/k;
        var x2 = (n.left - sr.left)/k, y2 = (n.top + n.height/2 - sr.top)/k;
        var phone = slide.querySelector('.phone').getBoundingClientRect();
        var xm = (phone.right - sr.left)/k + 30 + idx*16;
        out += '<path d="M'+x1+' '+y1+' H'+(xm-10)+' Q'+xm+' '+y1+' '+xm+' '+(y1+(y2>y1?10:-10))+' V'+(y2+(y2>y1?-10:10))+' Q'+xm+' '+y2+' '+(xm+10)+' '+y2+' H'+(x2-2)+'" fill="none" stroke="#6C6C71" stroke-width="1.4"/>';
        out += '<circle cx="'+x1+'" cy="'+y1+'" r="5" fill="#FDC348" stroke="#070401" stroke-width="1.6"/>';
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
