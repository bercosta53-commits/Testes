/* Leitura aprofundada do diagnóstico. Usa só as respostas, a função calcular, os
   multiplicadores por nível e os números publicados do case Crediauc. É a mesma
   leitura que o lead vê e que o painel do comercial mostra. */
import {
  CONFIG, DIMS, MAX_PONTOS, NIVEIS, PASSOS_GERAIS, QUESTIONS,
  calcular, fmtBRL, fmtMeses, fmtMesesInteiro, fmtNum,
} from "./modelo.js";
import { minusculas, perfil } from "./perfil.js";

/* Em empate de nota, a dimensão que mais trava um agente vem primeiro. */
const PRIORIDADE = ["politica", "consentimento", "integracao", "regua", "canal"];

const opcao = (id, valor) => QUESTIONS.find((q) => q.id === id)?.opcoes.find((o) => o.value === valor);
export const rotuloResposta = (id, valor) => opcao(id, valor)?.label ?? "Sem resposta";

/* Mostra um valor só quando os dois extremos da faixa ficam iguais. */
export const faixa = (a, b, fmt = fmtNum) => (fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)} a ${fmt(b)}`);

/* Prazos acima de 5 anos deixam de ser lidos como meses. */
const LIMITE_MESES = 60;
export const textoMesesHoje = (m) => (m > LIMITE_MESES ? "mais de 5 anos" : `cerca de ${fmtMesesInteiro(m)}`);

/* Tempo para percorrer a carteira com o agente: [mínimo, máximo] em meses. */
export const textoMesesIA = ([min, max]) => {
  if (max < 1) return "menos de 1 mês";
  if (min > LIMITE_MESES) return "mais de 5 anos";
  if (min < 1) return `até ${fmtMeses(max)}`;
  if (max > LIMITE_MESES) return `${fmtMeses(min)} a mais de 5 anos`;
  return faixa(min, max, fmtMeses);
};

export const pct = (x) => (x > 0 && x < 0.01 ? "menos de 1%" : `${Math.round(x * 100)}%`);

const LEITURAS_DIMENSAO = {
  regua: {
    0: (p) => `Hoje a proposta é igual para todos. O agente rende mais quando a proposta considera a capacidade de pagamento de cada ${p.cliente}.`,
    1: () => "Já existe segmentação por atraso. Falta considerar a capacidade de pagamento, que é o que define uma parcela que cabe no bolso.",
    2: (p) => `${p.Inst} já separa propostas por perfil. Esse critério pode orientar o agente desde o primeiro contato.`,
    3: () => "A proposta já é ajustada caso a caso. O agente pode fazer esse ajuste em mais conversas e deixar a equipe com as exceções.",
  },
  canal: {
    0: (p) => `A negociação depende de ligação. No WhatsApp, ${p.oCliente} responde no tempo dele, sem depender do horário comercial.`,
    1: () => "A negociação acontece por SMS ou e-mail. Levá-la para o WhatsApp é o primeiro passo para o agente.",
    2: () => "O WhatsApp já é o canal principal. O agente pode assumir as etapas operacionais e passar as exceções com o histórico.",
    3: (p) => `O WhatsApp já tem automação. O agente entra no canal que ${p.osClientes} já usam e leva a negociação até a proposta.`,
  },
  politica: {
    0: () => "Cada caso depende de aprovação. Sem alçadas escritas, o agente não fecha acordos sozinho.",
    1: () => "As faixas existem, mas não estão escritas. Documentá-las é o primeiro passo do piloto.",
    2: () => "As regras estão documentadas por faixa. Esse é o ponto de partida para configurar as alçadas do agente.",
    3: () => "As regras estão parametrizadas no sistema. O agente pode consultar as condições e propor acordos dentro das alçadas.",
  },
  integracao: {
    0: () => "A consulta depende de planilhas e relatórios. Defina com a TI quais dados o agente consulta e como eles são atualizados.",
    1: () => "O sistema central ainda não tem API. Mapeie com a TI o caminho mais simples para o agente consultar saldo e condições.",
    2: () => "O sistema tem API que a TI pode liberar. Uma integração simples já viabiliza o piloto.",
    3: () => "A API já atende outros canais digitais. A integração do agente pode seguir o mesmo caminho.",
  },
  consentimento: {
    0: () => "Não há clareza sobre quem autorizou contato por WhatsApp. Esse é o primeiro ponto a confirmar antes do piloto.",
    1: (p) => `Só parte ${p.dosClientes} autorizou o contato. O piloto pode começar por esse grupo enquanto o restante é revisado.`,
    3: (p) => `A maioria ${p.dosClientes} autorizou o contato, com registro. O contato pelo WhatsApp fica documentado desde o início.`,
  },
};

/* Recomendações do componente original, com o vocabulário do tipo. */
const RECOMENDACOES = {
  regua: () => "Segmente a carteira pela capacidade de pagamento, não só pelos dias de atraso. É essa leitura que permite propor uma parcela que cabe no bolso.",
  canal: (p) => `Leve a negociação para o WhatsApp. ${p.oCliente.replace(/^o/, "O")} responde no tempo dele, sem a pressão de uma ligação no meio do expediente.`,
  politica: () => "Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação. O agente só negocia sozinho dentro de regras escritas.",
  integracao: () => "Liste com a TI os dados que o agente precisa consultar (saldo, atraso, condições) e por onde eles saem. Uma integração simples já viabiliza o piloto.",
  consentimento: (p) => `Revise a autorização de contato por WhatsApp da base em atraso. Contato com registro protege ${p.instCurta} perante o CDC e a LGPD.`,
};

export const STATUS = {
  atencao: "Resolver antes do piloto",
  ajustar: "Ajustar",
  pronto: "Pronto para o agente",
};
const statusDe = (pontos) => (pontos >= 2 ? "pronto" : pontos === 1 ? "ajustar" : "atencao");

const RESUMOS = {
  "Preparar a base": (p) => `O ganho existe ${p.naInst}, mas antes do agente vale organizar regras e dados.`,
  "Pronta para piloto": (p) => `${p.Inst} já tem o essencial para testar um agente numa campanha.`,
  "Pronta para escalar": (p) => `Regras, canal e dados ${p.daInst} estão maduros. O agente pode entrar na operação contínua.`,
};

const FORMATOS_PILOTO = {
  "Preparar a base": (p) => `Primeiro, um workshop curto para escrever as regras de negociação e mapear os dados que o agente precisa. Depois, uma campanha curta com ${p.osClientes} que já autorizaram contato.`,
  "Pronta para piloto": () => "Uma campanha de 5 a 15 dias, com data para acabar, como a Crediauc fez no Desenrola. Carteira bem definida, prazo claro e indicadores de contratos e valor renegociado.",
  "Pronta para escalar": () => "Uma campanha curta para calibrar o transbordo. Depois, a operação contínua, com integração via API e critérios de transbordo para a equipe.",
};

const CTAS = {
  "Preparar a base": (p) => ({
    titulo: "Quer organizar esses pontos com a Ubots?",
    texto: `O time da Ubots pode revisar o diagnóstico com você e ajudar ${p.inst} a organizar regras e dados antes de um piloto.`,
  }),
  "Pronta para piloto": (p) => ({
    titulo: `Quer desenhar o piloto ${p.daInst}?`,
    texto: "O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias.",
  }),
  "Pronta para escalar": () => ({
    titulo: "Quer levar o agente para a operação contínua?",
    texto: "O time da Ubots pode avaliar com você a integração via API e os critérios de transbordo para a equipe.",
  }),
};

/* Primeira ligação do SDR, conforme o ponto que mais trava o agente. */
export const PERGUNTAS_LIGACAO = {
  politica: ["Até onde vão desconto, prazo e carência sem aprovação?", "Quem aprova as exceções e em quanto tempo?"],
  consentimento: ["Como a autorização de contato é registrada hoje?", "Que parte da base em atraso já autorizou o WhatsApp?"],
  integracao: ["Quais dados a equipe consulta para montar a proposta?", "A TI tem uma janela para liberar uma consulta simples?"],
  regua: ["Como a capacidade de pagamento entra na proposta hoje?", "Quais faixas de atraso concentram mais contratos?"],
  canal: ["Que parte das negociações já passa pelo WhatsApp?", "O que impede levar o restante para lá?"],
  nenhum: ["Qual carteira faria sentido para um piloto de 5 a 15 dias?", "Quais indicadores a diretoria usaria para avaliar o piloto?"],
};

function leiturasCruzadas(r, p) {
  const regras = [
    [r.canal >= 2 && r.consentimento === 0,
      "A negociação já acontece no WhatsApp, mas a autorização de contato não está mapeada. Resolver isso vem antes de qualquer automação."],
    [r.canal >= 2 && r.consentimento === 1,
      `${p.Inst} já negocia pelo WhatsApp, mas a autorização de contato não cobre toda a base. O piloto pode começar pelos ${p.clientes} com registro.`],
    [r.politica <= 1 && r.integracao >= 2,
      "Os dados já estão acessíveis. O que falta para o agente negociar sozinho são as regras escritas."],
    [r.integracao <= 1 && r.politica >= 2,
      "As regras já estão escritas. O que falta é o agente consultar os dados de cada contrato."],
    [r.regua >= 2 && r.canal <= 1,
      "As propostas já variam por perfil, mas a conversa ainda depende de ligação, SMS ou e-mail. Levar a negociação para o WhatsApp destrava o agente."],
    [r.ritmo === 0.5 && r.pessoas >= 12,
      "Cada pessoa fecha menos de 1 renegociação por dia. Isso pode indicar que a negociação divide tempo com outras demandas, como acontecia com os gerentes da Crediauc."],
    [r.ticket >= 20000,
      `A dívida média ${p.daInst} está acima da registrada no case, de cerca de R$ 3,6 mil a R$ 3,9 mil por contrato renegociado. Defina desde o piloto quais faixas de valor o agente conduz e quais vão direto para um analista.`],
  ];
  return regras.filter(([ok]) => ok).map(([, texto]) => texto).slice(0, 2);
}

/* O caminho mais curto para o próximo nível: sobe primeiro as dimensões de menor nota,
   na ordem de prioridade, até somar os pontos que faltam. */
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

function plano(r, res, p) {
  const n = res.nivel.nome;
  const itens = [
    ["Carteira inicial", {
      3: `Os ${p.clientes} que autorizaram contato por WhatsApp, com registro.`,
      1: "A parte da base com autorização registrada. Em paralelo, revise o restante.",
      0: `Antes da campanha, levante quais ${p.clientes} autorizaram contato. O piloto começa por esse grupo.`,
    }[r.consentimento]],
    ["Canal", r.canal <= 1 ? "Levar a negociação para o WhatsApp."
      : r.canal === 2 ? "WhatsApp, que a equipe já usa. O agente assume as etapas operacionais."
        : "WhatsApp, a partir da automação que já existe."],
    ["Alçadas", r.politica === 0 ? "Escrever até onde vão desconto, prazo e carência sem aprovação."
      : r.politica === 1 ? "Documentar as faixas que já existem." : "Usar as regras atuais como alçada do agente."],
    ["Dados", r.integracao <= 1 ? "Listar com a TI os dados que o agente consulta (saldo, atraso, condições) e por onde eles saem."
      : r.integracao === 2 ? "Pedir à TI a liberação da API." : "Reaproveitar a API dos canais digitais."],
    ["Equipe", "1 colaborador acompanha o agente e assume as exceções, com o histórico da conversa."],
    ["Linha de base", `Hoje, a equipe fecha cerca de ${fmtNum(r.pessoas * r.ritmo)} renegociações por dia. O piloto compara o resultado do agente com esse ritmo.`],
    ["Indicadores", "Contratos renegociados, valor renegociado e valor quitado, comparados com a operação atual no mesmo período. Acompanhe também os transbordos e a reincidência dos acordos."],
  ];
  return { formato: FORMATOS_PILOTO[n](p), itens: itens.map(([rotulo, texto]) => ({ rotulo, texto })) };
}

function caso(r, p) {
  const tipo = r.tipo === "cooperativa"
    ? "A Crediauc também é uma cooperativa de crédito, com mais de 92 mil cooperados. Lá, os gerentes dividiam o tempo entre a agência e as negociações."
    : `O case é de uma cooperativa, mas o formato se aplica ${p.aInst}: o agente negocia pelo WhatsApp, dentro das regras da instituição, e passa as exceções com o histórico.`;
  const ticket = r.ticket <= 1500
    ? `A dívida média ${p.daInst} está abaixo da registrada no case. O ganho tende a vir do volume.`
    : r.ticket <= 5000
      ? `A dívida média ${p.daInst} está na mesma faixa da registrada no case, de cerca de R$ 3,6 mil a R$ 3,9 mil por contrato renegociado.`
      : `A dívida média ${p.daInst} está acima da registrada no case. A proposta tende a exigir mais análise, e o transbordo ganha peso.`;
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
      resposta: rotuloResposta(q.id, pontos), status: statusDe(pontos),
      leitura: LEITURAS_DIMENSAO[q.id][pontos]?.(p) ?? "",
    };
  });

  const fracas = dims.filter((d) => d.pontos < 2)
    .sort((a, b) => a.pontos - b.pontos || PRIORIDADE.indexOf(a.id) - PRIORIDADE.indexOf(b.id));
  const pontoCritico = fracas[0] || null;

  /* Mesma seleção de calcular (notas até 1, menor primeiro), com o vocabulário do tipo. */
  const passos = dims.filter((d) => d.pontos <= 1).sort((a, b) => a.pontos - b.pontos).map((d) => RECOMENDACOES[d.id](p));
  for (const s of PASSOS_GERAIS) if (passos.length < 3) passos.push(s);

  const saldo = r.contratos * r.ticket;
  const mesesIA = textoMesesIA(res.mesesIA);
  const extraTexto = res.extra[1] > 0 ? faixa(res.extra[0], res.extra[1], fmtBRL) : null;

  const emResumo = [
    `Hoje, a equipe fecha cerca de ${fmtNum(res.atual)} renegociações por mês. Com um agente de IA, a estimativa é de ${faixa(res.ia[0], res.ia[1])}.`,
    res.filaCoberta
      ? "A equipe já percorre a carteira atual em menos de 1 mês. O ganho está em liberar tempo para os casos que exigem análise."
      : `No ritmo atual, a equipe leva ${textoMesesHoje(res.mesesHoje)} para percorrer a carteira em atraso. ${mesesIA === "mais de 5 anos" ? "Com o agente, o prazo segue acima de 5 anos." : `Com o agente, a estimativa cai para ${mesesIA}.`}`,
    pontoCritico
      ? `Prioridade: ${minusculas(pontoCritico.nome)}. ${RECOMENDACOES[pontoCritico.id](p).split(". ")[0]}.`
      : "Prioridade: desenhar o piloto. As 5 dimensões já têm base para começar.",
  ];

  return {
    res, perfil: p, nivel: n, pontos: res.pontos, pontosMax: MAX_PONTOS,
    resumo: RESUMOS[n](p),
    emResumo,
    carteira: {
      contratos: r.contratos, saldo,
      porPessoaMes: r.ritmo * CONFIG.diasUteisMes,
      coberturaHoje: Math.min(1, res.atual / r.contratos),
      mesesHoje: res.filaCoberta ? null : textoMesesHoje(res.mesesHoje),
      titulo: res.filaCoberta
        ? `A equipe ${p.daInst} já consegue acompanhar a fila atual. Nesse cenário, a oportunidade está em ganhar capacidade para negociações mais complexas.`
        : `No ritmo atual, a equipe ${p.daInst} levaria ${textoMesesHoje(res.mesesHoje)} para percorrer toda a carteira em atraso.`,
    },
    potencial: {
      ia: res.ia, mesesIA, extraTexto,
      coberturaIA: res.ia.map((v) => Math.min(1, v / r.contratos)),
      equipeEquivalente: faixa(r.pessoas * res.nivel.mult[0], r.pessoas * res.nivel.mult[1]),
      mult: res.nivel.mult,
    },
    dims, pontoCritico, fracas,
    leituras: leiturasCruzadas(r, p),
    proximo: proximoNivel(r, res, dims),
    plano: plano(r, res, p),
    passos: passos.slice(0, 3),
    caso: caso(r, p),
    cta: CTAS[n](p),
    perguntasLigacao: PERGUNTAS_LIGACAO[pontoCritico?.id ?? "nenhum"],
  };
}
