/* Textos e regras do painel comercial (COPY.md, seção 5). */
import { QUESTIONS, calcular } from "../DiagnosticoRecuperacaoIA.jsx";

export const fmtNum = (n) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));
export const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(n);
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
    "A operação ainda tem alguns pontos importantes para estruturar, principalmente em regras de negociação e acesso aos dados. Uma boa primeira conversa pode ser um workshop para organizar esses critérios e avaliar, na sequência, a viabilidade de um piloto.",
  "Pronta para piloto":
    "Os principais fundamentos já estão presentes. A oportunidade é desenhar um piloto curto, entre 5 e 15 dias, com uma carteira bem definida, prazo claro e indicadores de contratos e valor renegociado.",
  "Pronta para escalar":
    "A operação já apresenta boa maturidade em regras, canais e acesso aos dados. A conversa pode avançar para um modelo contínuo, considerando integração via API e critérios de transbordo para a equipe.",
};

/* Rótulo legível de uma resposta (o texto da opção, não o valor numérico). */
export const rotuloResposta = (q, valor) => q.opcoes.find((o) => o.value === valor)?.label ?? "Sem resposta";
export const rotuloTipo = (valor) => rotuloResposta(QUESTIONS[0], valor);

export const capacidadeTexto = (r) =>
  `${fmtNum(r.capacidade_atual_mes)} hoje, estimativa de ${fmtNum(r.capacidade_ia_mes[0])} a ${fmtNum(r.capacidade_ia_mes[1])} com IA`;

export const potencialTexto = (r) =>
  r.valor_adicional_mes[1] > 0
    ? `${fmtBRL(r.valor_adicional_mes[0])} a ${fmtBRL(r.valor_adicional_mes[1])} por mês`
    : "Sem fila represada";

export const dimensoes = (respostas) => calcular(respostas)?.dims ?? [];

/* Minúsculas para o meio da frase, preservando siglas como LGPD. */
const minusculas = (s) => s.split(" ").map((p) => (p.length > 1 && p === p.toUpperCase() ? p : p.toLowerCase())).join(" ");

export function linhaSDR(lead) {
  const dims = dimensoes(lead.respostas);
  const menor = dims.reduce((m, d) => (m === null || d.pontos < m.pontos ? d : m), null);
  const foco = menor && menor.pontos < 2 ? minusculas(menor.nome) : "capacidade de renegociação";
  const nome = lead.lead.nome.trim().split(/\s+/)[0];
  return `Oi, ${nome}. Vi o diagnóstico da ${lead.lead.instituicao} e achei interessante o cenário que apareceu em ${foco}. Posso compartilhar como a Crediauc estruturou o piloto e comparar com a realidade de vocês?`;
}

/* Exportação CSV (separador ";" e BOM para abrir direto no Excel em português). */
export function gerarCSV(leads) {
  const cabecalho = [
    "Data", "Nome", "E-mail", "WhatsApp", "Instituição", "Tipo", "Nível", "Pontos",
    "Renegociações por mês hoje", "Com IA (mínimo)", "Com IA (máximo)",
    "Potencial adicional por mês (mínimo)", "Potencial adicional por mês (máximo)", "Origem",
    ...QUESTIONS.map((q) => q.titulo),
  ];
  const linhas = leads.map((l) => {
    const r = l.resultado;
    return [
      fmtData(l.enviado_em), l.lead.nome, l.lead.email, fmtWhatsApp(l.lead.whatsapp), l.lead.instituicao,
      rotuloTipo(l.respostas.tipo), r.nivel, `${r.pontos} de ${r.pontos_max}`,
      r.capacidade_atual_mes, r.capacidade_ia_mes[0], r.capacidade_ia_mes[1],
      r.valor_adicional_mes[0], r.valor_adicional_mes[1], rotuloOrigem(l.utm_content),
      ...QUESTIONS.map((q) => rotuloResposta(q, l.respostas[q.id])),
    ];
  });
  const celula = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + [cabecalho, ...linhas].map((linha) => linha.map(celula).join(";")).join("\r\n");
}
