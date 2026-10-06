/* Textos e regras do painel comercial (COPY.md, seção 5). */
import { QUESTIONS, analisar, faixa, rotulo as rotuloPorId } from "../DiagnosticoRecuperacaoIA.jsx";

/* Nome de cada dimensão no meio da frase da linha do SDR. */
const DIM_FRASE = {
  regua: { em: "na régua de cobrança", de: "da régua de cobrança" },
  canal: { em: "no canal de negociação", de: "do canal de negociação" },
  politica: { em: "na política de negociação", de: "da política de negociação" },
  integracao: { em: "no acesso aos dados", de: "do acesso aos dados" },
  consentimento: { em: "na autorização de contato", de: "da autorização de contato" },
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

export const fmtNum = (n) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));
export const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);
export const fmtData = (iso) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
};
export const fmtWhatsApp = (d = "") => {
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
};

export const ORIGENS = {
  "pos-tabela": "Artigo, após os resultados",
  "cta-final": "Artigo, fim do texto",
  "barra-fixa": "Artigo, barra fixa",
};
export const rotuloOrigem = (utm) => (utm ? ORIGENS[utm] || utm : "Acesso direto");

export const SUGESTOES = {
  "Preparar a base":
    "A operação ainda tem pontos importantes para estruturar antes de um piloto. Uma boa primeira conversa pode ser um workshop para organizar esses critérios e avaliar, na sequência, a viabilidade de um piloto.",
  "Pronta para piloto":
    "Os principais fundamentos já estão presentes. A oportunidade é desenhar um piloto curto, entre 5 e 15 dias, com uma carteira bem definida, prazo claro e indicadores de contratos e valor renegociado.",
  "Pronta para escalar":
    "A operação já apresenta boa maturidade. A conversa pode avançar para um modelo contínuo, considerando integração via API e critérios de transbordo para a equipe.",
};

/* Rótulo legível de uma resposta (o texto da opção, não o valor numérico). */
export const rotuloResposta = (q, valor) => rotuloPorId(q.id, valor);
export const rotuloTipo = (valor) => rotuloPorId("tipo", valor);

/* A leitura é sempre recalculada a partir das respostas: leads da primeira versão continuam funcionando. */
const cache = new WeakMap();
export const leituraDoLead = (lead) => {
  if (!cache.has(lead)) cache.set(lead, analisar(lead.respostas));
  return cache.get(lead);
};

export const capacidadeTexto = (r) =>
  `${fmtNum(r.capacidade_atual_mes)} hoje, estimativa de ${fmtNum(r.capacidade_ia_mes[0])} a ${fmtNum(r.capacidade_ia_mes[1])} com IA`;

/* O valor a mais é o saldo renegociado no primeiro mês: depois disso a fila já é menor. */
export const potencialTexto = (r) =>
  r.valor_adicional_mes[1] > 0
    ? `${faixa(r.valor_adicional_mes[0], r.valor_adicional_mes[1], fmtBRL)} no primeiro mês`
    : "Sem fila represada";

export const dimensoes = (respostas) => analisar(respostas)?.dims ?? [];

/* Preposição antes do nome digitado: só contrai quando a primeira palavra indica o gênero
   ("do Banco Sul", "da Cooperativa Vale", "do Sicoob Centro"); nos demais casos, "de". */
const MASCULINOS = ["banco", "sicoob", "sicredi", "bradesco", "itaú", "itau", "santander", "nubank", "inter", "btg", "safra", "banrisul"];
const FEMININOS = ["cooperativa", "caixa", "financeira", "fintech", "cresol", "unicred"];
export const preposicaoDoNome = (nome) => {
  const w = nome.trim().split(/\s+/)[0].toLowerCase();
  return MASCULINOS.includes(w) ? "do" : FEMININOS.includes(w) ? "da" : "de";
};

export function linhaSDR(lead) {
  const a = leituraDoLead(lead);
  const dim = a?.critico ? DIM_FRASE[a.critico.id] : { em: "na capacidade de renegociação", de: "da capacidade de renegociação" };
  const nome = lead.lead.nome.trim().split(/\s+/)[0];
  const inst = `${preposicaoDoNome(lead.lead.instituicao)} ${lead.lead.instituicao.trim()}`;
  if (lead.interesse) {
    return `Oi, ${nome}. Recebi seu pedido de conversa sobre o diagnóstico ${inst}. O cenário ${dim.de} chamou atenção. Posso compartilhar como a Crediauc estruturou o piloto e comparar com a realidade de vocês?`;
  }
  return `Oi, ${nome}. Vi o diagnóstico ${inst} e achei interessante o cenário que apareceu ${dim.em}. Posso compartilhar como a Crediauc estruturou o piloto e comparar com a realidade de vocês?`;
}

export const fmtMesesCurto = (m) => (m === null || m === undefined ? "" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(m));

/* Exportação CSV (separador ";" e BOM para abrir direto no Excel em português).
   As colunas da primeira versão ficam na mesma ordem; as novas entram no fim. */
export function gerarCSV(leads) {
  const cabecalho = [
    "Data", "Nome", "E-mail", "WhatsApp", "Instituição", "Tipo", "Nível", "Pontos",
    "Renegociações por mês hoje", "Com IA (mínimo)", "Com IA (máximo)",
    "Potencial adicional no primeiro mês (mínimo)", "Potencial adicional no primeiro mês (máximo)", "Origem",
    ...QUESTIONS.map((q) => q.titulo),
    "Pediu conversa", "Data do pedido", "Ponto crítico", "Saldo em atraso estimado",
    "Meses para percorrer a carteira hoje", "Meses com IA (mínimo)", "Meses com IA (máximo)",
  ];
  const linhas = leads.map((l) => {
    const r = l.resultado;
    const a = leituraDoLead(l);
    const res = a?.res;
    return [
      fmtData(l.enviado_em), l.lead.nome, l.lead.email, fmtWhatsApp(l.lead.whatsapp), l.lead.instituicao,
      rotuloTipo(l.respostas.tipo), r.nivel, `${r.pontos} de ${r.pontos_max}`,
      r.capacidade_atual_mes, r.capacidade_ia_mes[0], r.capacidade_ia_mes[1],
      r.valor_adicional_mes[0], r.valor_adicional_mes[1], rotuloOrigem(l.utm_content),
      ...QUESTIONS.map((q) => rotuloResposta(q, l.respostas[q.id])),
      l.interesse ? "Sim" : "Não", l.interesse ? fmtData(l.interesse.em) : "",
      a?.critico?.nome ?? "Nenhum", l.respostas.contratos * l.respostas.ticket,
      ...(res && !res.filaCoberta ? [res.mesesHoje, res.mesesIA[0], res.mesesIA[1]].map(fmtMesesCurto) : ["", "", ""]),
    ];
  });
  const celula = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + [cabecalho, ...linhas].map((linha) => linha.map(celula).join(";")).join("\r\n");
}
