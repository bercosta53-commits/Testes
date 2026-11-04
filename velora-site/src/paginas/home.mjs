// Home `/` — copy editorial v2 (velora-copy-site-v2-editorial.md, §B · seções 00–07). Site one page.
// Uma seção, uma função (§A): as cinco etapas só no hero e no sistema; o Radar só dentro de Inteligência comercial;
// as entregas de GLaaS só em "O que entregamos"; os quatro dados externos só na faixa de evidências.
// Ritmo de fundos alternado (briefing de design §6): Ink, Bone, Ink, Bone…
import { html, raw } from '../lib/html.mjs';
import { botao, linkSeta, rotulo, secao, secaoLivre, pendente, foto, formConversa, exhibitCaso, textoCta } from '../lib/componentes.mjs';
import { linhaRhoi, radar } from '../lib/diagramas.mjs';
import { etapas } from '../conteudo/etapas.mjs';

// SEO title e meta description: a copy v2 não os redefine; seguem os aprovados na copy v1.
export const meta = {
  titulo: 'Velora | Aquisição B2B com método, do mercado ao contrato',
  descricao: 'Descubra onde sua aquisição está travando. A Velora conecta inteligência de mercado, abordagem, marketing, vendas e dados para gerar novas oportunidades B2B.',
};

const CONVERSA = '#conversa';

// Espaço técnico reservado (copy v2 §A e §C.7–8): sem nada visível enquanto não houver conteúdo validado.
const reservado = (texto) => raw(`<!-- Reservado: ${texto} -->`);

// 00 · Hero — uma promessa, dois caminhos e a faixa com as cinco etapas.
function hero(ctx) {
  return secaoLivre({ tema: 'escuro', topo: true, id: 'inicio', classe: 'hero' }, html`
    <div class="hero__foto">${foto(ctx, 'hero', { sizes: '(min-width: 1200px) 50vw, 100vw', prioridade: true })}</div>
    <div class="wrap hero__conteudo">
      ${rotulo('Aquisição B2B · Estratégia e execução')}
      <h1 class="display-xl hero__titulo"><span class="hero__titulo-1">Crescimento não trava por falta de esforço.</span> <span class="hero__titulo-2">Trava por falta de sistema.</span></h1>
      <p class="lead hero__lead">Conectamos inteligência de mercado, abordagem, marketing e vendas para transformar oportunidades em contratos, com prioridades claras e execução acompanhada.</p>
      <div class="acoes hero__acoes">
        ${botao(textoCta(ctx), CONVERSA, { principal: true })}
        ${linkSeta('Conhecer nossas entregas', '#entregas')}
      </div>
    </div>
    <div class="wrap hero__faixa-wrap">
      <p class="hero__faixa">${etapas.map((e, i) => html`${i ? html`<span class="hero__faixa-sep"> · </span>` : ''}<span class="hero__faixa-item" style="--k:${i}">${e.nome}</span>`)}</p>
    </div>`);
}

// 01 · Onde a aquisição trava — quatro situações distintas e uma única faixa de evidências externas.
const DORES = [
  ['Crescimento concentrado', 'As indicações funcionam, mas abrir novas contas e mercados exige outros caminhos.'],
  ['Áreas em ritmos diferentes', 'Marketing e vendas trabalham, mas não compartilham prioridades sobre contas e oportunidades.'],
  ['Investimento sem avanço comercial', 'Campanhas, conteúdo e eventos geram atividade sem impacto claro no pipeline.'],
  ['Dados sem resposta', 'Há reuniões e propostas, mas pouca clareza sobre o que faz uma oportunidade avançar ou se perder.'],
];

// Benchmarks externos (não são resultados da Velora). Fontes verificadas na copy v2, §C.
const DADOS = [
  { n: '~80%', texto: 'Das compras B2B estudadas foram vencidas pelo fornecedor preferido antes do contato com vendas.',
    fonte: '6sense · Buyer Experience Research, 2025', url: 'https://6sense.com/science-of-b2b/getting-to-yes-why-vendors-win-and-how-buying-groups-agree' },
  { n: '5–16', texto: 'Pessoas podem integrar um grupo de decisão B2B complexo.',
    fonte: 'Gartner · Sales Survey, 2025', url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-07-gartner-sales-survey-finds-74-percent-of-b2b-buyer-teams-demonstrate-unhealthy-conflict-during-the-decision-process' },
  { n: '49%', texto: 'Dos líderes comerciais pesquisados disseram que vendas e marketing definem de maneira muito diferente um lead qualificado.',
    fonte: 'Gartner · CSO Survey, 2025', url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-21-gartner-survey-reveals-less-than-half-of-csos-report-their-organization-met-several-2024-strategic-goals' },
  { n: '28%', texto: 'Das empresas pesquisadas conseguem relacionar investimentos em marca ao pipeline comercial.',
    fonte: 'Benchmarkit · Brand vs Demand Benchmarks, 2026', url: 'https://www.benchmarkit.ai/brandvsdemandbenchmarks' },
];

function ondeTrava(ctx) {
  return secaoLivre({ tema: 'claro', id: 'onde-trava', classe: 'onde-trava' }, html`
    <div class="wrap">
      ${rotulo('Onde a aquisição trava', '01')}
      <h2 class="titulo-2 titulo-2--grande cabeca">Sua empresa sabe entregar valor. O desafio é repetir o caminho até o próximo contrato.</h2>
    </div>
    <div class="sangra">
      <figure class="sangra__foto sangra__foto--esq onde-trava__foto foto revelar-foto">${foto(ctx, 'onde-trava', { sizes: '(min-width: 1024px) 50vw, 100vw' })}</figure>
      <div class="sangra__texto sangra__texto--dir">
        <p class="lead revelar">Os obstáculos variam. Em muitos casos, estão na passagem entre decisões de mercado, marketing e vendas.</p>
        <ol class="dores">
          ${DORES.map(([t, p], i) => html`<li class="dor revelar">
            <p class="dor__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
            <h3 class="titulo-3 dor__titulo">${t}</h3>
            <p class="dor__texto">${p}</p>
          </li>`)}
        </ol>
      </div>
    </div>
    <div class="wrap">
      <div class="evidencias tema-escuro revelar" data-foco-acid>
        <h3 class="titulo-2 evidencias__titulo">A decisão de compra começa antes da conversa comercial.</h3>
        <ul class="dados">
          ${DADOS.map((d, i) => html`<li class="dado${i === 0 ? ' dado--foco' : ''}">
            <p class="dado__n">${d.n}</p>
            <p class="dado__texto">${d.texto}</p>
            <p class="dado__fonte"><a href="${d.url}" rel="noopener">${d.fonte}</a></p>
          </li>`)}
        </ul>
      </div>
    </div>`);
}

// 02 · O sistema — a única representação gráfica das cinco etapas: um circuito que volta ao início.
function sistema() {
  return secao({ tema: 'escuro', id: 'sistema', classe: 'sistema' }, html`
    ${rotulo('O sistema', '02')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Cinco etapas conectadas. Do mercado certo ao contrato.</h2>
    <p class="lead sistema__abertura revelar">Cada etapa tem um papel. O resultado depende de como as decisões passam de uma para outra.</p>
    <ol class="circuito desenhar" data-circuito data-ativa="1" data-foco-acid>
      ${etapas.map((e, i) => html`<li class="circuito__etapa${i === 0 ? ' is-ativa' : ''}" id="${e.id}" data-etapa="${i + 1}" style="--i:${i}">
        <span class="circuito__no" aria-hidden="true"></span>
        <span class="circuito__liga" aria-hidden="true"></span>
        <p class="circuito__n">${e.n}</p>
        <h3 class="titulo-3 circuito__nome">${e.nome}</h3>
        <p class="circuito__texto">${e.texto}</p>
      </li>`)}
    </ol>
    <p class="fechamento revelar">Não é preciso redesenhar toda a operação. Começamos pelo ponto de maior impacto.</p>`);
}

// 03 · O que entregamos — quatro frentes operacionais e uma coordenação transversal.
const FRENTES = [
  { n: '01', titulo: 'Inteligência comercial', texto: 'Encontrar as oportunidades que merecem atenção e entender por que abordá-las.',
    itens: ['Perfil de cliente ideal e mapeamento de mercado.', 'Contas priorizadas por aderência e contexto.', 'Oportunidades em novos segmentos ou na carteira atual.'] },
  { n: '02', titulo: 'ABM', complemento: 'Marketing baseado em contas', texto: 'Marketing e vendas trabalhando nas mesmas empresas, com abordagens adequadas a cada contexto.',
    itens: ['Mapeamento de decisores e participantes da compra.', 'Mensagens e conteúdos por grupo de contas.', 'Cadências de contato e ações coordenadas no LinkedIn.'] },
  { n: '03', titulo: 'Processo comercial', texto: 'Criar continuidade entre a primeira conversa, a oportunidade e o contrato.',
    itens: ['Critérios de qualificação e etapas do funil.', 'Materiais de apoio à conversa e à proposta.', 'Rotinas de acompanhamento e revisão do pipeline.'] },
  { n: '04', titulo: 'RevOps', complemento: 'Operações de receita', texto: 'Conectar processos, dados e ferramentas para apoiar melhores decisões comerciais.',
    itens: ['Estrutura e qualidade de dados no CRM.', 'Acompanhamento da origem à evolução das oportunidades.', 'Indicadores de conversão e motivos de ganho ou perda.'] },
];
const GLAAS = {
  n: '05', titulo: 'Liderança de crescimento', en: 'Growth Leader as a Service',
  texto: 'Coordenação sênior para transformar prioridades em iniciativas acompanhadas junto às equipes.',
  itens: ['Plano de prioridades e responsáveis.', 'Coordenação de iniciativas entre áreas e parceiros.', 'Rituais de decisão, acompanhamento e ajustes.'],
};

const entregaveis = (itens) => html`<ul class="entregaveis">${itens.map((t) => html`<li>${t}</li>`)}</ul>`;

function frente(f, i) {
  return html`<article class="frente frente--${f.n} revelar" style="--i:${i}">
    <p class="frente__n" aria-hidden="true">${f.n}</p>
    <h3 class="titulo-3 frente__titulo">${f.titulo}${f.complemento ? html`<span class="ri__dp"> —</span> <span class="frente__complemento">${f.complemento}</span>` : ''}</h3>
    <p class="frente__texto">${f.texto}</p>
    ${entregaveis(f.itens)}
  </article>`;
}

function entregas(ctx) {
  const [inteligencia, ...demais] = FRENTES;
  return secao({ tema: 'claro', id: 'entregas', classe: 'entregas' }, html`
    ${rotulo('O que entregamos', '03')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Estratégia que se transforma em trabalho concreto.</h2>
    <p class="lead entregas__abertura revelar">Atuamos em frentes que podem ser combinadas conforme o contexto e a prioridade de cada empresa.</p>
    <div class="entregas__grade">
      ${frente(inteligencia, 0)}
      <aside class="radar-painel tema-escuro revelar" aria-labelledby="velora-radar" data-foco-acid>
        <div class="radar-painel__texto">
          <h4 class="radar-painel__titulo" id="velora-radar">Velora Radar</h4>
          <p class="radar-painel__descricao">Nossa ferramenta de inteligência reúne sinais observáveis sobre empresas e apoia a priorização de contas e decisores. A análise transforma esses sinais em contexto para abordagens comerciais.</p>
          ${pendente(ctx, 'Captura de tela real do Velora Radar, com dados sensíveis ocultados (validar funcionalidades efetivamente disponíveis)')}
        </div>
        <div class="radar-painel__visual">${radar()}</div>
      </aside>
      ${demais.map((f, i) => frente(f, i + 1))}
      <article class="glaas tema-escuro revelar">
        <div class="glaas__cabeca">
          <p class="glaas__n" aria-hidden="true">${GLAAS.n}</p>
          <h3 class="glaas__titulo">${GLAAS.titulo}<span class="ri__dp"> · </span> <span class="glaas__en" lang="en">${GLAAS.en}</span></h3>
          <p class="glaas__texto">${GLAAS.texto}</p>
        </div>
        ${entregaveis(GLAAS.itens)}
      </article>
    </div>`);
}

// 04 · Como trabalhamos — só ritmo, sequência e decisão (o RHOI não repete serviços).
function comoTrabalhamos(ctx) {
  const passos = [
    { letra: 'R', nome: 'Review', verbo: 'Entender', texto: 'Analisamos mercado, operação e dados para localizar os principais obstáculos.' },
    { letra: 'H', nome: 'Hypothesis', verbo: 'Priorizar', texto: 'Definimos hipóteses e escolhemos o que merece atenção primeiro.' },
    { letra: 'O', nome: 'Operationalize', verbo: 'Executar', texto: 'Conduzimos as iniciativas com os responsáveis, em ciclos de duas a três semanas.' },
    { letra: 'I', nome: 'Inspection', verbo: 'Aprender', texto: 'Avaliamos a resposta do mercado e decidimos o que manter, ajustar ou interromper.' },
  ];
  return secaoLivre({ tema: 'escuro', id: 'como-trabalhamos', classe: 'como' }, html`
    <div class="sangra sangra--topo">
      <div class="sangra__texto sangra__texto--esq">
        ${rotulo('Como trabalhamos', '04')}
        <h2 class="titulo-2 titulo-2--grande">Um método para decidir, executar e aprender.</h2>
        <p class="lead como__abertura revelar">O RHOI organiza o trabalho em ciclos curtos, com decisões construídas junto à liderança e às equipes.</p>
      </div>
      <figure class="sangra__foto sangra__foto--dir como__foto foto revelar-foto revelar-foto--dir">${foto(ctx, 'como', { sizes: '(min-width: 1024px) 50vw, 100vw' })}</figure>
    </div>
    <div class="wrap">
      ${linhaRhoi(passos)}
      <p class="fechamento revelar">Trabalhamos com o seu time, respeitando o conhecimento de quem já conduz a operação.</p>
    </div>`);
}

// 05 · Para quem — Tecnologia B2B em destaque; espaço reservado para dois casos verificáveis.
function paraQuem(ctx) {
  const { casos } = ctx.config;
  const card = (segmento, texto, destaque) => html`<article class="card-icp${destaque ? ' card-icp--destaque' : ''} revelar">
    ${destaque ? html`<figure class="card-icp__foto foto revelar-foto">${foto(ctx, 'icp-tecnologia', { sizes: '(min-width: 768px) 50vw, 100vw' })}</figure>` : ''}
    <div class="card-icp__corpo">
      <h3 class="card-icp__segmento">${segmento}</h3>
      <p class="card-icp__texto">${texto}</p>
    </div>
  </article>`;
  return secao({ tema: 'claro', id: 'para-quem', classe: 'para-quem' }, html`
    ${rotulo('Para quem', '05')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Para empresas que já provaram valor e querem tornar a aquisição mais consistente.</h2>
    <div class="cards-icp">
      ${card('Tecnologia B2B', 'Nosso foco são empresas de software e serviços de tecnologia com venda consultiva e oportunidades de expansão em contas, segmentos ou regiões.', true)}
      ${card('Serviços profissionais', 'Operações jurídicas, contábeis e tributárias, nas quais confiança e múltiplos envolvidos influenciam a decisão.')}
      ${card('Serviços financeiros', 'Negócios com ofertas complexas, ciclos comerciais longos e necessidade de acompanhamento das oportunidades.')}
    </div>
    ${casos.length
      ? html`<div class="casos" id="casos">${casos.slice(0, 2).map(exhibitCaso)}</div>`
      : [
        reservado('dois casos verificáveis (config.mjs → casos), âncora #casos'),
        pendente(ctx, 'Dois casos verificáveis: números, período, atribuição e autorização de divulgação validados (contexto, obstáculo, ações, indicador e comparação). Nada aparece no site enquanto config.mjs → casos estiver vazio.'),
      ]}`);
}

// 06 · Formas de trabalhar — só a relação de contratação; o ponto de partida em Acid.
function formatos() {
  const itens = [
    ['01', 'Diagnóstico de Aquisição', 'Um projeto de análise e priorização que identifica obstáculos, oportunidades e um plano inicial de ação.'],
    ['02', 'Programas direcionados', 'Projetos com escopo e prazo definidos para implementar iniciativas específicas de aquisição.'],
    ['03', 'Growth Leader as a Service', 'Modelo de acompanhamento continuado para conduzir prioridades e projetos junto à liderança da empresa.'],
  ];
  return secao({ tema: 'escuro', id: 'formatos', classe: 'formatos-secao' }, html`
    ${rotulo('Formas de trabalhar', '06')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Um ponto de partida claro. Formatos adequados a cada desafio.</h2>
    <ol class="formatos desenhar" data-foco-acid>
      ${itens.map(([n, t, p], i) => html`<li class="formatos__item" style="--i:${i}">
        <p class="formatos__n${i === 0 ? ' formatos__n--inicio' : ''}" aria-hidden="true">${n}</p>
        <h3 class="titulo-3 formatos__titulo"${i === 2 ? raw(' lang="en"') : ''}>${t}</h3>
        <p class="formatos__texto">${p}</p>
      </li>`)}
    </ol>`);
}

// 07 · Conversa inicial — o próximo passo e o formulário.
function conversa(ctx) {
  const { equipe, privacidade } = ctx.config;
  return secaoLivre({ tema: 'claro', id: 'conversa', classe: 'conversa' }, html`
    <div class="sangra sangra--conversa">
      <figure class="sangra__foto sangra__foto--esq conversa__foto foto revelar-foto revelar-foto--baixo">${foto(ctx, 'agendar', { sizes: '(min-width: 1024px) 43vw, 100vw' })}</figure>
      <div class="sangra__texto sangra__texto--dir conversa__coluna">
        ${rotulo('Conversa inicial', '07')}
        <h2 class="titulo-2 titulo-2--grande">Onde sua aquisição precisa avançar?</h2>
        <p class="lead conversa__texto">Em uma conversa de 45 minutos, conhecemos seu contexto, discutimos os principais desafios e avaliamos por onde começar.</p>
        ${equipe.length
          ? html`<ul class="equipe" id="equipe">${equipe.map((p) => html`<li class="pessoa">
              ${p.foto ? html`<img src="${p.foto.src}" alt="${p.foto.alt}" width="${p.foto.largura}" height="${p.foto.altura}" loading="lazy" decoding="async">` : ''}
              <p class="pessoa__nome">${p.nome}</p><p class="pessoa__papel">${p.papel}</p><p class="pessoa__senioridade">${p.senioridade}</p></li>`)}</ul>`
          : [
            reservado('equipe validada (config.mjs → equipe), âncora #equipe'),
            pendente(ctx, 'Equipe: retrato e duas linhas de senioridade por pessoa, com papel claro no projeto. Validar composição e títulos (não assumir que advisor é sócio).'),
          ]}
        <div class="conversa__form">${formConversa(ctx)}</div>
        ${privacidade.texto ? '' : pendente(ctx, 'Aviso de privacidade / LGPD e link da política de dados (texto a aprovar: config.mjs → privacidade).')}
      </div>
    </div>`);
}

export function render(ctx) {
  return html`${hero(ctx)}${ondeTrava(ctx)}${sistema()}${entregas(ctx)}${comoTrabalhamos(ctx)}${paraQuem(ctx)}${formatos()}${conversa(ctx)}`;
}
