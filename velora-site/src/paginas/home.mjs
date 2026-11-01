// Home `/` — copy §2 (seções 01–09). Na v1, é o site inteiro (one page).
// Ritmo de fundos conforme briefing de design §6; fotos editoriais conforme §8.
import { html, md, raw } from '../lib/html.mjs';
import { botao, linkSeta, rotulo, secao, secaoLivre, ponte, pendente, foto, formDiagnostico, exhibitCaso, seta } from '../lib/componentes.mjs';
import { ciclo, trilho, desconectadoConectado, linhaRhoi, radar } from '../lib/diagramas.mjs';
import { etapas } from '../conteudo/etapas.mjs';

export const meta = {
  titulo: 'Velora | Aquisição B2B com método, do mercado ao contrato',
  descricao: 'Descubra onde sua aquisição está travando. A Velora conecta inteligência de mercado, abordagem, marketing, vendas e dados para gerar novas oportunidades B2B.',
};

const AGENDAR = '#agendar';

// Rótulo + texto da copy ("**Rótulo:** texto"): a frase fica inteira para leitura;
// na tela o rótulo vira linha própria em mono.
const emLinha = (r, t) => html`<strong class="ri">${r}<span class="ri__dp">:</span></strong> <span class="cap">${t}</span>`;

// 01 · Hero — foto editorial à direita, título grande atravessando, trilho do sistema na base.
function hero(ctx) {
  return secaoLivre({ tema: 'escuro', topo: true, id: 'inicio', classe: 'hero' }, html`
    <div class="hero__foto">${foto(ctx, 'hero', { sizes: '(min-width: 1200px) 46vw, 100vw', prioridade: true })}</div>
    <div class="wrap hero__conteudo">
      ${rotulo('Sistema de aquisição B2B', '01')}
      <h1 class="display-xl hero__titulo">Sua empresa pode crescer mais. <span class="hero__titulo-2">O primeiro passo é descobrir onde está travando.</span></h1>
      <div class="hero__grade">
        <p class="lead hero__lead">Sua empresa de tecnologia já tem clientes, produto validado e espaço para crescer. Nós conectamos mercado, abordagem, marketing, vendas e dados para transformar esse potencial em um caminho concreto de aquisição, do mercado certo ao contrato.</p>
        <div class="hero__acoes">
          <div class="acoes">
            ${botao('Agendar Diagnóstico de Aquisição', AGENDAR, { principal: true })}
            ${linkSeta('Ver como o sistema funciona', '#sistema')}
          </div>
          <p class="micro">Um primeiro olhar para o que está limitando seu crescimento. Sem começar por uma lista de serviços.</p>
        </div>
      </div>
    </div>
    <div class="wrap hero__trilho">${trilho()}</div>`);
}

// 02 · Onde o crescimento trava — foto sangrando à esquerda, sintomas à direita, diagrama de virada.
function ondeTrava(ctx) {
  const sintomas = [
    ['Quando a indicação sustenta quase tudo', 'Novos clientes chegam, mas não existe uma forma clara de identificar e abordar as próximas contas. Sem esse caminho, a expansão fica difícil de planejar.'],
    ['Quando os esforços não se encontram', 'Marketing produz ações, o comercial abre conversas e os resultados não se conectam. Falta uma visão compartilhada de quais contas priorizar e como fazê-las avançar.'],
    ['Quando os números não explicam o resultado', 'Há reuniões e propostas, mas pouca clareza sobre o que ajudou a fechar cada contrato — ou sobre o que impediu a venda.'],
  ];
  return secaoLivre({ tema: 'claro', id: 'onde-trava', classe: 'onde-trava' }, html`
    <div class="wrap">
      ${rotulo('Onde o crescimento trava', '02')}
      <h2 class="titulo-2 titulo-2--grande cabeca">Sua empresa sabe entregar valor. Mas sabe repetir o caminho até o próximo contrato?</h2>
    </div>
    <div class="sangra">
      <figure class="sangra__foto sangra__foto--esq foto foto--claro revelar">${foto(ctx, 'onde-trava', { sizes: '(min-width: 1024px) 55vw, 100vw' })}</figure>
      <div class="sangra__texto sangra__texto--dir">
        <p class="lead revelar">Crescer por indicação é um bom sinal: mostra que clientes confiam no que você entrega. O desafio aparece quando a empresa precisa abrir um novo mercado, alcançar outras contas e tornar esse crescimento menos dependente de oportunidades que surgem sozinhas.</p>
        <ol class="sintomas">
          ${sintomas.map(([t, p], i) => html`<li class="sintoma revelar">
            <p class="sintoma__n">${String(i + 1).padStart(2, '0')}</p>
            <h3 class="titulo-3 sintoma__titulo">${t}</h3>
            <p class="sintoma__texto">${p}</p>
          </li>`)}
        </ol>
      </div>
    </div>
    <div class="wrap">
      ${ponte('Esses sintomas podem parecer separados. Na prática, eles costumam fazer parte do mesmo problema.')}
      ${desconectadoConectado()}
    </div>`);
}

// 03 · O sistema — numeração monumental e ciclo fixo que acompanha a rolagem.
function sistema() {
  return secao({ tema: 'escuro', id: 'sistema', classe: 'sistema' }, html`
    ${rotulo('O sistema', '03')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Cinco etapas conectadas. Um caminho do mercado certo ao contrato.</h2>
    <p class="lead sistema__intro revelar">Uma lista de empresas, por si só, não gera receita. Uma campanha isolada também não. O resultado depende da passagem de informação e responsabilidade entre cada etapa da aquisição.</p>
    <div class="sistema__grade" data-sistema>
      <ol class="etapas-blocos">
        ${etapas.map((e, i) => html`<li class="etapa-bloco" id="${e.id}" data-etapa-bloco="${i + 1}">
          <p class="etapa-bloco__n">${e.n}.</p>
          <h3 class="titulo-3 etapa-bloco__nome">${e.nome} <span class="etapa-bloco__traco" aria-hidden="true">—</span> <span class="etapa-bloco__sub">${e.titulo}</span></h3>
          <p class="etapa-bloco__texto">${e.texto}</p>
          <p class="etapa-bloco__entrega"><strong class="etapa-bloco__entrega-r">Entrega<span class="ri__dp">:</span>${seta}</strong> <span class="cap">${e.entrega}</span></p>
          <p class="etapa-bloco__ligacao${i === 4 ? ' etapa-bloco__ligacao--retorno' : ''}" aria-hidden="true">${e.ligacao.join(' ')}</p>
        </li>`)}
      </ol>
      <div class="sistema__diagrama">${ciclo({ modo: 'rolagem', ativa: 1, classe: 'ciclo--sistema' })}</div>
    </div>
    <div class="apoio revelar"><p class="apoio__texto">As etapas não precisam ser implantadas todas de uma vez. Começamos pelo ponto que mais limita a sua operação.</p></div>
    ${ponte('Para saber onde começar, precisamos entender como a sua aquisição funciona hoje.')}`);
}

// 04 · Como trabalhamos — foto sangrando à direita e as quatro letras do método em escala monumental.
function comoTrabalhamos(ctx) {
  const passos = [
    { letra: 'R', nome: 'Review', verbo: 'Entender', quando: emLinha('Quando', 'no início do trabalho.'),
      corpo: html`<p>${emLinha('O que fazemos', 'analisamos mercado, clientes, operação e dados disponíveis.')}</p><p>${emLinha('O que entregamos', 'uma leitura das principais travas da aquisição.')}</p>` },
    { letra: 'H', nome: 'Hypothesis', verbo: 'Priorizar', quando: emLinha('Quando', 'após a análise inicial.'),
      corpo: html`<p>${emLinha('O que fazemos', 'formulamos hipóteses e definimos o que testar primeiro.')}</p><p>${emLinha('O que entregamos', 'prioridades ligadas a resultados de negócio.')}</p>` },
    { letra: 'O', nome: 'Operationalize', verbo: 'Executar', quando: emLinha('Quando', html`<span class="marca-texto">em ciclos de 2 a 3 semanas.</span>`),
      corpo: html`<p>${emLinha('O que fazemos', 'colocamos as ações prioritárias em prática com marketing e vendas.')}</p><p>${emLinha('O que entregamos', 'mudanças concretas no processo, nas abordagens ou nos materiais.')}</p>` },
    { letra: 'I', nome: 'Inspection', verbo: 'Aprender', quando: emLinha('Quando', 'ao fim de cada ciclo.'),
      corpo: html`<p>${emLinha('O que fazemos', 'acompanhamos as respostas do mercado e os resultados.')}</p><p>${emLinha('O que entregamos', 'decisões sobre manter, ajustar ou mudar a próxima ação.')}</p>` },
  ];
  return secaoLivre({ tema: 'claro', id: 'como-trabalhamos', classe: 'como' }, html`
    <div class="sangra sangra--topo">
      <div class="sangra__texto sangra__texto--esq">
        ${rotulo('Como trabalhamos', '04')}
        <h2 class="titulo-2 titulo-2--grande">Antes de propor uma ação, entendemos o que precisa mudar.</h2>
        <p class="lead como__intro revelar">${md('Usamos o método **RHOI** para sair do diagnóstico e chegar à execução sem perder a relação entre problema, hipótese e resultado.')}</p>
      </div>
      <figure class="sangra__foto sangra__foto--dir foto foto--claro revelar">${foto(ctx, 'como', { sizes: '(min-width: 1024px) 52vw, 100vw' })}</figure>
    </div>
    <div class="wrap">
      ${linhaRhoi(passos)}
      <p class="como__time revelar">Não chegamos para substituir o conhecimento do seu time. Trabalhamos junto com ele, conectando as áreas para que decisões e execução sigam a mesma direção.</p>
      ${ponte('Boas decisões precisam de informação confiável sobre as contas e o momento de compra.')}
    </div>`);
}

// 05 · Velora Radar — abre com uma faixa fotográfica; o Radar é desenhado como um radar.
function radarSecao(ctx) {
  const itens = [
    ['Menos dispersão', 'priorização de contas com critérios claros.'],
    ['Mais contexto', 'informação para adaptar a abordagem a cada empresa.'],
    ['Mais coordenação', 'marketing e vendas trabalham a partir da mesma visão das contas.'],
  ];
  return secaoLivre({ tema: 'escuro', id: 'velora-radar', classe: 'radar-secao' }, html`
    <figure class="faixa foto foto--escuro">
      ${foto(ctx, 'faixa', { sizes: '100vw' })}
      <div class="wrap faixa__rotulo">${rotulo('Velora Radar', '05')}</div>
    </figure>
    <div class="wrap">
      <h2 class="titulo-2 titulo-2--grande cabeca">Antes de abordar mais empresas, entenda quais merecem atenção agora.</h2>
      <div class="radar-secao__grade">
        <div class="radar-secao__texto revelar">
          <p class="lead">${md('O **Velora Radar** apoia a identificação de contas prioritárias, sinais de oportunidade e pessoas envolvidas na decisão de compra. Assim, sua equipe pode concentrar tempo nas conversas com maior relevância para o negócio.')}</p>
          <ul class="beneficios">${itens.map(([r, t]) => html`<li class="beneficio">${emLinha(r, t)}</li>`)}</ul>
        </div>
        <div class="radar-secao__visual">
          ${radar()}
          ${pendente(ctx, 'Captura de tela real do Velora Radar, com dados sensíveis ocultados (validar funcionalidades efetivamente disponíveis)', { classe: 'pendente--midia' })}
        </div>
      </div>
      ${ponte('Esse tipo de trabalho tem mais impacto quando há uma oferta validada e espaço real para abrir novos mercados.')}
    </div>`);
}

// 06 · Para quem — cartões com foto; tecnologia B2B com o dobro da largura.
function paraQuem(ctx) {
  const card = (chave, segmento, texto, destaque) => html`<article class="card-icp${destaque ? ' card-icp--destaque' : ''} revelar">
    <figure class="card-icp__foto foto foto--claro">${foto(ctx, chave, { sizes: destaque ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 100vw' })}</figure>
    <div class="card-icp__corpo">
      <h3 class="card-icp__segmento">${segmento}${destaque ? html` <span class="ri__dp">·</span> <span class="marca-texto card-icp__foco">Nosso principal foco</span>` : ''}</h3>
      <p class="card-icp__texto">${texto}</p>
    </div>
  </article>`;
  return secao({ tema: 'claro', id: 'para-quem', classe: 'para-quem' }, html`
    ${rotulo('Para quem', '06')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Para empresas que já provaram seu valor e agora precisam encontrar novos caminhos de crescimento.</h2>
    <div class="cards-icp">
      ${card('icp-tecnologia', 'Tecnologia B2B', 'Sua empresa vende software ou serviços de tecnologia, tem clientes satisfeitos e quer ir além das indicações. Podemos ajudar a definir mercados, priorizar contas, acessar decisores e criar uma forma mais consistente de transformar conversas em contratos.', true)}
      ${card('icp-profissionais', 'Serviços profissionais', 'Em mercados como jurídico, contábil e tributário, a decisão de compra depende de confiança, contexto e várias pessoas. Ajudamos a organizar a aquisição sem reduzir uma venda consultiva a volume de contatos.')}
      ${card('icp-financeiros', 'Serviços financeiros', 'Quando a oferta é complexa e o ciclo comercial exige acompanhamento, conectamos inteligência, abordagem e operação comercial para dar mais clareza ao pipeline e às decisões.')}
    </div>
    ${ponte('O método precisa se traduzir em mudanças observáveis — e comprováveis.')}`);
}

// 07 · Evidências — exhibit em formato de página de relatório.
function evidencias(ctx) {
  const { casos } = ctx.config;
  // Sem casos validados, a seção mostra como cada caso será apresentado (campos do modelo de card da copy),
  // sem nomes nem números.
  const blocos = [
    ['Contexto', 'Segmento, situação de partida e objetivo.'],
    ['Trava', 'Problema identificado.'],
    ['O que conectamos', 'Etapas e mudanças implementadas.'],
    ['Resultado', 'Indicador, variação, período e base de comparação.'],
  ];
  const estrutura = html`<article class="exhibit exhibit--estrutura revelar" aria-label="Estrutura de cada caso">
    <header class="exhibit__cabecalho"><span>Estrutura de cada caso</span></header>
    <div class="exhibit__corpo">
      ${blocos.map(([r, t], i) => html`<div class="exhibit__bloco${i === 3 ? ' exhibit__bloco--resultado' : ''}">
        <p class="exhibit__indice" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
        <p class="exhibit__rotulo">${r}</p><p>${t}</p>
      </div>`)}
    </div>
  </article>`;
  return secao({ tema: 'escuro', id: 'evidencias', classe: 'evidencias' }, html`
    ${rotulo('Evidências e resultados', '07')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Um bom sistema precisa mostrar o que mudou — e por quê.</h2>
    <p class="lead evidencias__intro revelar">Cada projeto começa por um contexto diferente. Por isso, nossos casos mostram a dificuldade inicial, as etapas que precisaram ser conectadas e o resultado observado no período.</p>
    <div class="exhibits">
      ${casos.length ? casos.map(exhibitCaso) : [
        estrutura,
        pendente(ctx, 'Caso validado 01 — nome autorizado, contexto, trava, o que conectamos e resultado (indicador, variação, período e base de comparação)'),
        pendente(ctx, 'Caso validado 02 — mesmos critérios'),
      ]}
    </div>
    ${pendente(ctx, 'Faixa de credenciais: apenas credenciais verificadas dos sócios')}
    ${ponte('O próximo passo não é contratar todas as etapas. É descobrir qual delas faz diferença primeiro.')}`);
}

// 08 · Formatos — numeração grande ligada por uma linha; o ponto de partida em Acid.
function formatos() {
  const itens = [
    ['01', 'Diagnóstico de Aquisição', html`Entendemos seu cenário, identificamos possíveis travas e definimos as perguntas que precisam ser respondidas antes de investir mais. <strong class="formatos__destaque">É por aqui que começamos.</strong>`],
    ['02', 'Programas direcionados', 'Atuamos em necessidades específicas, como estruturação de pipeline, abordagem de contas prioritárias (ABM) e integração de processos, dados e ferramentas de marketing e vendas (RevOps).'],
    ['03', 'Growth Leader as a Service', 'Acompanhamos a operação de forma contínua, ajudando a priorizar iniciativas, conectar equipes e conduzir a execução com o seu time.'],
  ];
  return secao({ tema: 'claro', id: 'formatos', classe: 'formatos-secao' }, html`
    ${rotulo('Formas de trabalhar com a Velora', '08')}
    <h2 class="titulo-2 titulo-2--grande cabeca">Um ponto de partida claro. E caminhos diferentes para executar.</h2>
    <ol class="formatos desenhar">
      ${itens.map(([n, t, p], i) => html`<li class="formatos__item" style="--i:${i}">
        <p class="formatos__n${i === 0 ? ' formatos__n--inicio' : ''}">${n}</p>
        <h3 class="titulo-3 formatos__titulo"${i === 2 ? raw(' lang="en"') : ''}>${t}</h3>
        <p class="formatos__texto">${p}</p>
      </li>`)}
    </ol>
    <div class="apoio revelar">
      <p class="apoio__texto">A recomendação depende do diagnóstico. Não existe um pacote certo antes de entendermos a operação.</p>
      ${linkSeta('Começar pelo diagnóstico', AGENDAR)}
    </div>
    ${ponte('Se sua empresa tem espaço para crescer, vale descobrir o que está impedindo esse próximo movimento.')}`);
}

// 09 · CTA final — foto da conversa sangrando à esquerda, formulário à direita.
function ctaFinal(ctx) {
  const { socios } = ctx.config;
  return secaoLivre({ tema: 'escuro', id: 'agendar', classe: 'agendar' }, html`
    <div class="sangra sangra--agendar">
      <figure class="sangra__foto sangra__foto--esq agendar__foto foto foto--escuro">${foto(ctx, 'agendar', { sizes: '(min-width: 1024px) 40vw, 100vw' })}</figure>
      <div class="sangra__texto sangra__texto--dir agendar__coluna">
        ${rotulo('Diagnóstico de Aquisição', '09')}
        <h2 class="titulo-2 titulo-2--grande">Onde a sua aquisição está travada?</h2>
        <p class="lead agendar__lead">${md('Em uma conversa de **45 minutos**, começamos a analisar o caminho entre mercado, abordagem, marketing, vendas e contrato. Você sai com uma visão inicial das questões que merecem atenção e dos próximos passos possíveis.')}</p>
        ${socios.length ? html`<ul class="retratos">${socios.map((s) => html`<li class="retrato">
            ${s.foto ? html`<img src="${s.foto.src}" alt="${s.foto.alt}" width="${s.foto.largura}" height="${s.foto.altura}" loading="lazy" decoding="async">` : ''}
            <p class="retrato__nome">${s.nome}</p><p class="retrato__papel">${s.papel}</p></li>`)}</ul>`
          : pendente(ctx, 'Retratos reais dos três sócios (produção própria)')}
        <div class="agendar__form">${formDiagnostico(ctx)}</div>
      </div>
    </div>`);
}

export function render(ctx) {
  return html`${hero(ctx)}${ondeTrava(ctx)}${sistema()}${comoTrabalhamos(ctx)}${radarSecao(ctx)}${paraQuem(ctx)}${evidencias(ctx)}${formatos()}${ctaFinal(ctx)}`;
}
