/* Leitura aprofundada do diagnóstico. Usa só as respostas, a função calcular, os
   multiplicadores por nível e os números publicados do case Crediauc. É a mesma
   leitura que o lead vê e que o painel do comercial mostra. */
import {
  CONFIG, DIMS, MAX_PONTOS, NIVEIS, QUESTIONS,
  calcular, fmtBRL, fmtMeses, fmtMesesInteiro, fmtNum,
} from "./modelo.js";
import { perfil } from "./perfil.js";

/* Em empate de nota, a dimensão que mais trava um agente vem primeiro. */
const PRIORIDADE = ["politica", "consentimento", "integracao", "regua", "canal"];
/* Dimensões que, zeradas, impedem o agente de negociar sozinho. */
const BLOQUEIAM = ["politica", "consentimento", "integracao"];

/* Nome de cada dimensão no meio da frase, com artigo e contrações. */
export const DIM_FRASE = {
  regua: { o: "a régua de cobrança", em: "na régua de cobrança", de: "da régua de cobrança" },
  canal: { o: "o canal de negociação", em: "no canal de negociação", de: "do canal de negociação" },
  politica: { o: "a política de negociação", em: "na política de negociação", de: "da política de negociação" },
  integracao: { o: "o acesso aos dados", em: "no acesso aos dados", de: "do acesso aos dados" },
  consentimento: { o: "a autorização de contato", em: "na autorização de contato", de: "da autorização de contato" },
};

/* "a política de negociação, a autorização de contato e outros pontos" */
const listaDims = (dims, max = 2) => {
  const nomes = dims.slice(0, max).map((d) => DIM_FRASE[d.id].o);
  if (dims.length > max) return `${nomes.join(", ")} e outros pontos`;
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}` : nomes[0];
};

const opcao = (id, valor) => QUESTIONS.find((q) => q.id === id)?.opcoes.find((o) => o.value === valor);
export const rotuloResposta = (id, valor) => opcao(id, valor)?.label ?? "Sem resposta";

/* Mostra um valor só quando os dois extremos da faixa ficam iguais. */
export const faixa = (a, b, fmt = fmtNum) => (fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)} a ${fmt(b)}`);

const fmtDecimal = (v) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v);

/* Prazos acima de 5 anos deixam de ser lidos como meses. */
const LIMITE_MESES = 60;
export const textoMesesHoje = (m) => (m > LIMITE_MESES ? "mais de 5 anos" : `cerca de ${fmtMesesInteiro(m)}`);

/* Tempo para percorrer a carteira com o agente: [mínimo, máximo] em meses ("3,2 a 4,8 meses"). */
export const textoMesesIA = ([min, max]) => {
  if (max < 1) return "menos de 1 mês";
  if (min > LIMITE_MESES) return "mais de 5 anos";
  if (min < 1) return `até ${fmtMeses(max)}`;
  if (max > LIMITE_MESES) return `${fmtMeses(min)} a mais de 5 anos`;
  return fmtDecimal(min) === fmtDecimal(max) ? fmtMeses(max) : `${fmtDecimal(min)} a ${fmtMeses(max)}`;
};

export const pct = (x) => (x > 0 && x < 0.01 ? "menos de 1%" : `${Math.round(x * 100)}%`);
export const faixaPct = ([a, b]) => (a < 0.01 && b >= 0.01 ? `até ${pct(b)}` : faixa(a, b, pct));

/* Leitura de cada resposta: o que ela significa para um agente. A ação fica no plano de piloto. */
const LEITURAS_DIMENSAO = {
  regua: {
    0: (p) => `Hoje a proposta é igual para todos. O agente rende mais quando a proposta considera a capacidade de pagamento de cada ${p.cliente}.`,
    1: () => "Já existe segmentação por atraso. Falta considerar a capacidade de pagamento, que é o que define uma parcela que cabe no bolso.",
    2: (p) => `${p.Inst} já separa propostas por perfil. Esse critério pode orientar o agente desde o primeiro contato.`,
    3: () => "A proposta já é ajustada caso a caso. O agente pode fazer esse ajuste em mais conversas e deixar a equipe com as exceções.",
  },
  canal: {
    0: (p) => `A negociação depende de ligação. No WhatsApp, ${p.oCliente} responde no tempo dele, inclusive fora do horário comercial.`,
    1: () => "A negociação acontece por SMS ou e-mail. Para o agente entrar, ela precisa ir para o WhatsApp.",
    2: () => "O WhatsApp já é o canal principal. O agente pode assumir as etapas operacionais e passar as exceções com o histórico.",
    3: (p) => `O WhatsApp já tem automação. O agente entra no canal que ${p.osClientes} já usam e leva a negociação até a proposta.`,
  },
  politica: {
    0: () => "Cada caso depende de aprovação. Sem alçadas escritas, o agente não fecha acordos sozinho.",
    1: () => "As faixas existem, mas não estão escritas. Documentá-las vem antes do piloto.",
    2: () => "As regras estão documentadas por faixa. Esse é o ponto de partida para configurar as alçadas do agente.",
    3: () => "As regras estão parametrizadas no sistema. O agente pode consultar as condições e propor acordos dentro das alçadas.",
  },
  integracao: {
    0: () => "A consulta depende de planilhas e relatórios. O agente precisa de uma forma de consultar saldo, atraso e condições.",
    1: () => "O sistema central ainda não tem API. É preciso um caminho simples para o agente consultar saldo e condições.",
    2: () => "O sistema tem API que a TI pode liberar. Uma integração simples já viabiliza o piloto.",
    3: () => "A API já atende outros canais digitais. A integração do agente pode seguir o mesmo caminho.",
  },
  consentimento: {
    0: () => "Não há clareza sobre quem autorizou contato por WhatsApp. Confirme esse ponto antes do piloto.",
    1: (p) => `Só parte ${p.dosClientes} autorizou o contato. Isso limita o tamanho da carteira do piloto.`,
    3: (p) => `A maioria ${p.dosClientes} autorizou o contato, com registro. O contato pelo WhatsApp fica documentado desde o início.`,
  },
};

/* Recomendações do componente original, com o vocabulário do tipo e ajustadas à resposta. */
const RECOMENDACOES = {
  regua: (p, r) => `Segmente a carteira pela capacidade de pagamento${r.regua === 1 ? ", não só pelos dias de atraso" : ""}. É essa leitura que permite propor uma parcela que cabe no bolso.`,
  canal: (p, r) => `Leve a negociação para o WhatsApp. ${p.oCliente.replace(/^o/, "O")} responde no tempo dele${r.canal === 0 ? ", sem a pressão de uma ligação no meio do expediente" : ""}.`,
  politica: () => "Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação. O agente só negocia sozinho dentro de regras escritas.",
  integracao: () => "Liste com a TI os dados que o agente precisa consultar (saldo, atraso, condições) e por onde eles saem. Uma integração simples já viabiliza o piloto.",
  consentimento: (p) => `Revise a autorização de contato por WhatsApp da base em atraso. Contato com registro protege ${p.instCurta} perante o CDC e a LGPD.`,
};

export const STATUS = {
  atencao: "Resolver antes do piloto",
  foco: "Ponto de atenção",
  ajustar: "Ajustar",
  pronto: "Pronto para o agente",
};
const statusDe = (id, pontos) => (pontos >= 2 ? "pronto" : pontos === 1 ? "ajustar" : BLOQUEIAM.includes(id) ? "atencao" : "foco");

function textosDoNivel(n, p, r, fracas) {
  const critico = fracas[0];
  const imaturo = r.politica <= 1 || r.canal <= 1 || r.integracao <= 1 || r.consentimento === 0;
  const bloqueio = fracas.find((d) => d.pontos === 0 && BLOQUEIAM.includes(d.id));
  const semApi = r.integracao <= 1;

  if (n === "Preparar a base") {
    const lista = listaDims(fracas);
    return {
      resumo: `O ganho existe ${p.naInst}, mas antes do agente vale organizar ${lista}.`,
      formato: `Primeiro, um workshop para organizar ${lista}. Depois, uma campanha com data para acabar, com ${p.osClientes} que já autorizaram contato.`,
      cta: {
        titulo: "Quer organizar esses pontos com a Ubots?",
        texto: `O time da Ubots pode revisar o diagnóstico com você e ajudar ${p.inst} a organizar ${lista} antes de um piloto.`,
      },
      prioridadeSemFraca: null,
    };
  }
  if (n === "Pronta para piloto") {
    return {
      resumo: `${p.Inst} já tem o essencial para testar um agente numa campanha.${bloqueio ? ` Antes, resolva ${DIM_FRASE[bloqueio.id].o}.` : ""}`,
      formato: "Uma campanha de 5 a 15 dias, com data para acabar, como a Crediauc fez no Desenrola. Carteira bem definida, prazo claro e indicadores de contratos e valor renegociado.",
      cta: {
        titulo: `Quer desenhar o piloto ${p.daInst}?`,
        texto: "O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias.",
      },
      prioridadeSemFraca: "Prioridade: desenhar o piloto. As 5 dimensões já têm base para começar.",
    };
  }
  return {
    resumo: imaturo && critico
      ? `${p.Inst} tem quase toda a base pronta. Antes da operação contínua, resolva ${DIM_FRASE[critico.id].o}.`
      : `Regras, canal e dados ${p.daInst} estão maduros. O agente pode entrar na operação contínua.`,
    formato: imaturo && critico
      ? `Primeiro, resolver ${DIM_FRASE[critico.id].o}. Depois, uma campanha curta para definir quais casos passam para a equipe e, em seguida, a operação contínua.`
      : "Uma campanha curta para definir quais casos passam para a equipe. Depois, a operação contínua.",
    cta: {
      titulo: "Quer levar o agente para a operação contínua?",
      texto: semApi
        ? "O time da Ubots pode avaliar com você como o agente vai consultar os dados e quais casos passam para a equipe."
        : "O time da Ubots pode avaliar com você a integração via API e os critérios de transbordo para a equipe.",
    },
    prioridadeSemFraca: "Prioridade: levar o agente para a operação contínua, começando por uma campanha curta.",
  };
}

/* Primeira ligação do SDR, conforme o ponto que mais trava o agente. */
export const PERGUNTAS_LIGACAO = {
  politica: ["Até onde vão desconto, prazo e carência sem aprovação?", "Quem aprova as exceções e em quanto tempo?"],
  consentimento: ["Como a autorização de contato é registrada hoje?", "Que parte da base em atraso já autorizou o WhatsApp?"],
  integracao: ["Quais dados a equipe consulta para montar a proposta?", "A TI tem uma janela para liberar uma consulta simples?"],
  regua: ["Como a capacidade de pagamento entra na proposta hoje?", "Quais faixas de atraso concentram mais contratos?"],
  canal: ["Que parte das negociações já passa pelo WhatsApp?", "O que impede levar o restante para lá?"],
  nenhum: ["Qual carteira faria sentido para um piloto de 5 a 15 dias?", "Quais indicadores a diretoria usaria para avaliar o piloto?"],
};

/* O que duas respostas mostram juntas (no máximo duas leituras). */
function leiturasCruzadas(r, p) {
  const regras = [
    [r.canal >= 2 && r.consentimento === 0,
      "A negociação já acontece no WhatsApp, mas a autorização de contato não está mapeada. Com o agente, o volume de contatos cresce, e esse ponto pesa mais."],
    [r.canal >= 2 && r.consentimento === 1,
      `${p.Inst} já negocia pelo WhatsApp, mas a autorização de contato não cobre toda a base.`],
    [r.politica <= 1 && r.integracao >= 2,
      `${r.integracao === 3 ? "Os dados já estão disponíveis por API." : "A TI pode liberar os dados por API."} O que falta para o agente negociar sozinho são as regras escritas.`],
    [r.integracao <= 1 && r.politica >= 2,
      "As regras já estão escritas. O que falta é o agente consultar os dados de cada contrato."],
    [r.regua >= 2 && r.canal <= 1,
      "As propostas já variam por perfil, mas a conversa ainda depende de ligação, SMS ou e-mail. Levar a negociação para o WhatsApp destrava o agente."],
    [r.ritmo === 0.5 && r.pessoas >= 12,
      "Cada pessoa fecha menos de 1 renegociação por dia. Isso pode indicar que a negociação divide tempo com outras demandas, como acontecia com os gerentes da Crediauc."],
  ];
  return regras.filter(([ok]) => ok).map(([, texto]) => texto).slice(0, 2);
}

/* Caminho recomendado para o próximo nível: começa pela dimensão de menor nota (o ponto crítico)
   e sobe cada uma para a primeira opção com nota 2 ou mais, até somar os pontos que faltam. */
function proximoNivel(r, res, dims) {
  const i = NIVEIS.indexOf(res.nivel);
  const prox = NIVEIS[i + 1];
  if (!prox) return null;
  const faltam = res.nivel.max + 1 - res.pontos;
  const candidatos = [...dims].sort((a, b) => a.pontos - b.pontos || PRIORIDADE.indexOf(a.id) - PRIORIDADE.indexOf(b.id));
  const ajustes = {};
  const caminho = [];
  let ganho = 0;
  for (const d of candidatos) {
    if (ganho >= faltam) break;
    const valores = DIMS.find((q) => q.id === d.id).opcoes.map((o) => o.value);
    const alvo = valores.find((v) => v > d.pontos && v >= 2);
    if (alvo === undefined) continue;
    ajustes[d.id] = alvo;
    ganho += alvo - d.pontos;
    caminho.push({ id: d.id, nome: d.nome, de: d.resposta, para: rotuloResposta(d.id, alvo) });
  }
  const simulado = calcular({ ...r, ...ajustes });
  return { nome: prox.nome, faltam, caminho, multAtual: res.nivel.mult, mult: simulado.nivel.mult, ia: simulado.ia, nivelSimulado: simulado.nivel.nome };
}

/* Plano de piloto montado a partir das respostas. Cada linha corresponde a uma dimensão
   (ou à equipe, à linha de base e aos indicadores); a linha do ponto crítico é marcada. */
function plano(r, p, formato, critico) {
  const itens = [
    { rotulo: "Carteira inicial", dim: "consentimento", texto: {
      3: `Os ${p.clientes} que autorizaram contato por WhatsApp, com registro.`,
      1: "A parte da base com autorização registrada. Em paralelo, revise o restante.",
      0: `Antes da campanha, levante quais ${p.clientes} autorizaram contato. O piloto começa por esse grupo.`,
    }[r.consentimento] },
    { rotulo: "Canal", dim: "canal", texto: r.canal <= 1 ? "Levar a negociação para o WhatsApp."
      : r.canal === 2 ? "WhatsApp, que a equipe já usa. O agente assume as etapas operacionais."
        : "WhatsApp, a partir da automação que já existe." },
    { rotulo: "Proposta", dim: "regua", texto: r.regua === 0 ? "Segmentar a carteira pela capacidade de pagamento, para propor parcelas que cabem no bolso."
      : r.regua === 1 ? "Somar a capacidade de pagamento à segmentação por atraso que já existe."
        : r.regua === 2 ? "Usar a segmentação por perfil que já existe para orientar o agente."
          : "Usar o ajuste caso a caso como referência para as propostas do agente." },
    { rotulo: "Alçadas", dim: "politica", texto: r.politica === 0 ? "Escrever até onde vão desconto, prazo e carência sem aprovação."
      : r.politica === 1 ? "Documentar as faixas que já existem." : "Usar as regras atuais como alçada do agente." },
    { rotulo: "Dados", dim: "integracao", texto: r.integracao <= 1 ? "Listar com a TI os dados que o agente consulta (saldo, atraso, condições) e por onde eles saem."
      : r.integracao === 2 ? "Pedir à TI a liberação da API." : "Reaproveitar a API dos canais digitais." },
    { rotulo: "Equipe", texto: "1 colaborador acompanha o agente e assume as exceções, com o histórico da conversa." },
    { rotulo: "Linha de base", texto: `Hoje, a equipe tem capacidade para cerca de ${fmtNum(r.pessoas * r.ritmo)} renegociações por dia. O piloto compara o resultado do agente com esse ritmo.` },
    { rotulo: "Indicadores", texto: "Contratos renegociados, valor renegociado e valor quitado, comparados com a operação atual no mesmo período. Acompanhe também os transbordos e a reincidência dos acordos." },
  ];
  return { formato, itens: itens.map((it) => ({ ...it, prioridade: !!critico && it.dim === critico.id })) };
}

const CASE_VALOR = "cerca de R$ 3,6 mil a R$ 3,9 mil";
function caso(r, p) {
  const tipo = r.tipo === "cooperativa"
    ? "A Crediauc também é uma cooperativa de crédito, com mais de 92 mil cooperados. Lá, os gerentes dividiam o tempo entre a agência e as negociações."
    : `O case é de uma cooperativa, mas o formato se aplica ${p.aInst}: o agente negocia pelo WhatsApp, dentro das suas regras, e passa as exceções com o histórico.`;
  const ticket = r.ticket <= 1500
    ? `A dívida média ${p.daInst} fica abaixo do valor médio renegociado por contrato no case (${CASE_VALOR}). O ganho tende a vir do volume.`
    : r.ticket <= 5000
      ? `A dívida média ${p.daInst} fica na mesma faixa do valor médio renegociado por contrato no case (${CASE_VALOR}).`
      : `A dívida média ${p.daInst} fica acima do valor médio renegociado por contrato no case (${CASE_VALOR}). Defina desde o piloto quais faixas de valor o agente conduz e quais vão direto para um analista.`;
  return {
    tipo, ticket,
    limite: `O case é uma campanha curta. Não é taxa de conversão nem média de mercado. Por isso o diagnóstico usa uma faixa conservadora, e o piloto mede o resultado real ${p.daInst}.`,
  };
}

export function aprofundar(r) {
  const res = calcular(r);
  if (!res) return null;
  const p = perfil(r.tipo);
  const n = res.nivel.nome;

  const dims = DIMS.map((q) => {
    const pontos = r[q.id];
    return {
      id: q.id, nome: q.dim, pontos, max: Math.max(...q.opcoes.map((o) => o.value)),
      resposta: rotuloResposta(q.id, pontos), status: statusDe(q.id, pontos),
      leitura: LEITURAS_DIMENSAO[q.id][pontos]?.(p) ?? "",
    };
  });

  const fracas = dims.filter((d) => d.pontos < 2)
    .sort((a, b) => a.pontos - b.pontos || PRIORIDADE.indexOf(a.id) - PRIORIDADE.indexOf(b.id));
  const pontoCritico = fracas[0] || null;
  const nivel = textosDoNivel(n, p, r, fracas);

  const saldo = r.contratos * r.ticket;
  const mesesIA = textoMesesIA(res.mesesIA);
  const mesesHoje = res.filaCoberta ? null : textoMesesHoje(res.mesesHoje);
  const extraTexto = res.extra[1] > 0 ? faixa(res.extra[0], res.extra[1], fmtBRL) : null;
  const passaCarteira = res.ia[1] > r.contratos;

  const emResumo = [
    `Hoje, a equipe tem capacidade para cerca de ${fmtNum(res.atual)} renegociações por mês. Com um agente de IA, a capacidade estimada é de ${faixa(res.ia[0], res.ia[1])}${passaCarteira ? `, acima dos cerca de ${fmtNum(r.contratos)} contratos em atraso` : ""}.`,
    res.filaCoberta
      ? "A equipe já percorre a carteira atual em menos de 1 mês. O ganho está em liberar tempo para os casos que exigem análise."
      : mesesIA === "mais de 5 anos"
        ? "Para percorrer a carteira em atraso: mais de 5 anos, hoje e com o agente."
        : `Para percorrer a carteira em atraso: ${mesesHoje} hoje e ${mesesIA} com o agente.`,
    pontoCritico
      ? `Prioridade: ${DIM_FRASE[pontoCritico.id].o.replace(/^(a|o) /, "")}. ${RECOMENDACOES[pontoCritico.id](p, r).split(". ")[0].replace(/\.$/, "")}.`
      : nivel.prioridadeSemFraca,
  ];

  return {
    res, perfil: p, nivel: n, pontos: res.pontos, pontosMax: MAX_PONTOS,
    resumo: nivel.resumo,
    emResumo,
    carteira: {
      contratos: r.contratos, saldo,
      porPessoaMes: r.ritmo * CONFIG.diasUteisMes,
      coberturaHoje: Math.min(1, res.atual / r.contratos),
      mesesHoje,
      titulo: res.filaCoberta
        ? `A equipe ${p.daInst} já consegue acompanhar a fila atual. Nesse cenário, a oportunidade está em ganhar capacidade para negociações mais complexas.`
        : `No ritmo atual, a equipe ${p.daInst} levaria ${mesesHoje} para percorrer toda a carteira em atraso.`,
    },
    potencial: {
      ia: res.ia, mesesIA, extraTexto, passaCarteira,
      coberturaIA: res.ia.map((v) => Math.min(1, v / r.contratos)),
      equipeEquivalente: faixa(r.pessoas * res.nivel.mult[0], r.pessoas * res.nivel.mult[1]),
      mult: res.nivel.mult,
    },
    dims, pontoCritico, fracas,
    leituras: leiturasCruzadas(r, p),
    proximo: proximoNivel(r, res, dims),
    topo: `${p.Inst} já está no nível mais alto do diagnóstico. O próximo passo é levar o agente para a operação contínua.`,
    plano: plano(r, p, nivel.formato, pontoCritico),
    caso: caso(r, p),
    cta: nivel.cta,
    perguntasLigacao: PERGUNTAS_LIGACAO[pontoCritico?.id ?? "nenhum"],
  };
}
