import { analisar, rotuloResposta } from "./calculo";
import { perguntas } from "./dados";
import { dataHora, decimal, faixaMoeda, faixaNumero, formatarFone, numeroAprox } from "./formatar";

export const origens = {
  "pos-tabela": "Artigo, após os resultados",
  "cta-final": "Artigo, fim do texto",
  "barra-fixa": "Artigo, barra fixa",
};
export const origem = (utm) => (utm ? origens[utm] || utm : "Acesso direto");

export const pontoCriticoTexto = {
  regua: { em: "na régua de cobrança", de: "da régua de cobrança" },
  canal: { em: "no canal de negociação", de: "do canal de negociação" },
  politica: { em: "na política de negociação", de: "da política de negociação" },
  integracao: { em: "no acesso aos dados", de: "do acesso aos dados" },
  consentimento: { em: "na autorização de contato", de: "da autorização de contato" },
};

export const perguntasPrimeiraLigacao = {
  politica: [
    "Até onde vão desconto, prazo e carência sem aprovação?",
    "Quem aprova as exceções e em quanto tempo?",
  ],
  consentimento: [
    "Como a autorização de contato é registrada hoje?",
    "Que parte da base em atraso já autorizou o WhatsApp?",
  ],
  integracao: [
    "Quais dados a equipe consulta para montar a proposta?",
    "A TI tem uma janela para liberar uma consulta simples?",
  ],
  regua: [
    "Como a capacidade de pagamento entra na proposta hoje?",
    "Quais faixas de atraso concentram mais contratos?",
  ],
  canal: [
    "Que parte das negociações já passa pelo WhatsApp?",
    "O que impede levar o restante para lá?",
  ],
  nenhum: [
    "Qual carteira faria sentido para um piloto de 5 a 15 dias?",
    "Quais indicadores a diretoria usaria para avaliar o piloto?",
  ],
};

export const abordagemPorNivel = {
  "Preparar a base":
    "A operação ainda tem pontos importantes para estruturar antes de um piloto. Uma boa primeira conversa pode ser um workshop para organizar esses critérios e avaliar, na sequência, a viabilidade de um piloto.",
  "Pronta para piloto":
    "Os principais fundamentos já estão presentes. A oportunidade é desenhar um piloto curto, entre 5 e 15 dias, com uma carteira bem definida, prazo claro e indicadores de contratos e valor renegociado.",
  "Pronta para escalar":
    "A operação já apresenta boa maturidade. A conversa pode avançar para um modelo contínuo, considerando integração via API e critérios de transbordo para a equipe.",
};

// Cache da análise por lead (evita recalcular a cada render).
const cache = new WeakMap();
export const analiseDoLead = (lead) => {
  if (!cache.has(lead)) cache.set(lead, analisar(lead.respostas));
  return cache.get(lead);
};

export const capacidadeTexto = (r) =>
  `${numeroAprox(r.capacidade_atual_mes)} hoje, estimativa de ${faixaNumero(
    r.capacidade_ia_mes[0],
    r.capacidade_ia_mes[1],
    numeroAprox,
  )} com IA`;

export const potencialAdicionalTexto = (r) =>
  r.valor_adicional_mes[1] > 0
    ? `${faixaMoeda(r.valor_adicional_mes)} no primeiro mês`
    : "Sem fila represada";

// Artigo da instituição ("do Banco X", "da Cooperativa Y", "de Z").
const MASCULINAS = ["banco", "sicoob", "sicredi", "bradesco", "itaú", "itau", "santander", "nubank", "inter", "btg", "safra", "banrisul"];
const FEMININAS = ["cooperativa", "caixa", "financeira", "fintech", "cresol", "unicred"];
const preposicao = (nome) => {
  const primeira = nome.trim().split(/\s+/)[0].toLowerCase();
  return MASCULINAS.includes(primeira) ? "do" : FEMININAS.includes(primeira) ? "da" : "de";
};

/** Linha de abertura sugerida para o SDR. */
export function linhaDeAbertura(lead) {
  const analise = analiseDoLead(lead);
  const foco = analise?.critico
    ? pontoCriticoTexto[analise.critico.id]
    : { em: "na capacidade de renegociação", de: "da capacidade de renegociação" };
  const nome = lead.lead.nome.trim().split(/\s+/)[0];
  const inst = `${preposicao(lead.lead.instituicao)} ${lead.lead.instituicao.trim()}`;
  return lead.interesse
    ? `Oi, ${nome}. Recebi seu pedido de conversa sobre o diagnóstico ${inst}. O cenário ${foco.de} chamou atenção. Posso compartilhar como a Crediauc estruturou o piloto e comparar com a realidade de vocês?`
    : `Oi, ${nome}. Vi o diagnóstico ${inst} e achei interessante o cenário que apareceu ${foco.em}. Posso compartilhar como a Crediauc estruturou o piloto e comparar com a realidade de vocês?`;
}

/** CSV (separador ;, com BOM para abrir bem no Excel). */
export function gerarCsv(leads) {
  const cabecalho = [
    "Data", "Nome", "E-mail", "WhatsApp", "Instituição", "Tipo", "Nível", "Pontos",
    "Renegociações por mês hoje", "Com IA (mínimo)", "Com IA (máximo)",
    "Potencial adicional no primeiro mês (mínimo)", "Potencial adicional no primeiro mês (máximo)",
    "Origem",
    ...perguntas.map((p) => p.titulo),
    "Pediu conversa", "Data do pedido", "Ponto crítico", "Saldo em atraso estimado",
    "Meses para percorrer a carteira hoje", "Meses com IA (mínimo)", "Meses com IA (máximo)",
  ];
  const linhas = leads.map((l) => {
    const r = l.resultado;
    const analise = analiseDoLead(l);
    const res = analise?.res;
    return [
      dataHora(l.enviado_em), l.lead.nome, l.lead.email, formatarFone(l.lead.whatsapp),
      l.lead.instituicao, rotuloResposta("tipo", l.respostas.tipo), r.nivel,
      `${r.pontos} de ${r.pontos_max}`, r.capacidade_atual_mes,
      r.capacidade_ia_mes[0], r.capacidade_ia_mes[1],
      r.valor_adicional_mes[0], r.valor_adicional_mes[1],
      origem(l.utm_content),
      ...perguntas.map((p) => rotuloResposta(p.id, l.respostas[p.id])),
      l.interesse ? "Sim" : "Não", l.interesse ? dataHora(l.interesse.em) : "",
      analise?.critico?.nome ?? "Nenhum", l.respostas.contratos * l.respostas.ticket,
      ...(res && !res.filaCoberta
        ? [res.mesesHoje, res.mesesIA[0], res.mesesIA[1]].map(decimal)
        : ["", "", ""]),
    ];
  });
  const celula = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + [cabecalho, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n");
}
