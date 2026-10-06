/* Modelo do diagnóstico: perguntas, níveis, cálculo e formatação.
   As perguntas, os valores, os multiplicadores e a função calcular vêm do componente original
   sem alteração; "curto" é só o rótulo usado no resumo de respostas. */

export const CONFIG = {
  // Webhook que recebe o lead (Make, Zapier, n8n, HubSpot via proxy, Supabase Edge Function).
  // Vazio = modo de teste: o lead só aparece no console e o fluxo segue normalmente.
  webhookUrl: "",
  // Página de contato/agenda do time comercial da Ubots.
  ctaUrl: "https://ubots.com.br/contato",
  diasUteisMes: 21,
};

/* Identidade Ubots */
export const C = {
  bg: "#FFFBEF",
  card: "#FFFFFF",
  ink: "#141414",
  muted: "#6B6558",
  line: "#ECE4CF",
  yellow: "#FFC800",
  yellowSoft: "#FFF4C7",
  error: "#B42318",
};
export const FONT = "'Sora', system-ui, -apple-system, 'Segoe UI', sans-serif";

export const OPERACAO = "Sua operação";
export const PRONTIDAO = "Sua prontidão";

export const QUESTIONS = [
  {
    id: "tipo", curto: "Tipo de instituição", fase: OPERACAO,
    titulo: "Que tipo de instituição você representa?",
    opcoes: [
      { label: "Cooperativa de crédito", value: "cooperativa" },
      { label: "Banco", value: "banco" },
      { label: "Financeira ou fintech", value: "financeira" },
      { label: "Outro tipo de instituição", value: "outro" },
    ],
  },
  {
    id: "pessoas", curto: "Pessoas que negociam", fase: OPERACAO,
    titulo: "Quantas pessoas negociam dívidas hoje?",
    ajuda: "Conte todo mundo que negocia, mesmo sem dedicação exclusiva.",
    opcoes: [
      { label: "1 a 5", value: 3 },
      { label: "6 a 20", value: 12 },
      { label: "21 a 50", value: 35 },
      { label: "51 a 150", value: 100 },
      { label: "Mais de 150", value: 200 },
    ],
  },
  {
    id: "contratos", curto: "Contratos em atraso", fase: OPERACAO,
    titulo: "Quantos contratos estão em atraso na carteira?",
    opcoes: [
      { label: "Até 500", value: 300 },
      { label: "500 a 2 mil", value: 1200 },
      { label: "2 mil a 10 mil", value: 6000 },
      { label: "10 mil a 50 mil", value: 25000 },
      { label: "Mais de 50 mil", value: 70000 },
    ],
  },
  {
    id: "ticket", curto: "Valor médio da dívida", fase: OPERACAO,
    titulo: "Qual o valor médio de uma dívida em atraso?",
    opcoes: [
      { label: "Até R$ 2 mil", value: 1500 },
      { label: "R$ 2 mil a R$ 10 mil", value: 5000 },
      { label: "R$ 10 mil a R$ 50 mil", value: 20000 },
      { label: "Mais de R$ 50 mil", value: 75000 },
    ],
  },
  {
    id: "ritmo", curto: "Renegociações por pessoa por dia", fase: OPERACAO,
    titulo: "Quantas renegociações cada pessoa fecha por dia, em média?",
    opcoes: [
      { label: "Menos de 1", value: 0.5 },
      { label: "1 a 3", value: 2 },
      { label: "4 a 8", value: 6 },
      { label: "Mais de 8", value: 10 },
    ],
  },
  {
    id: "regua", curto: "Régua de cobrança", fase: PRONTIDAO, dim: "Régua de cobrança",
    titulo: "Como o cliente em atraso recebe a proposta hoje?",
    opcoes: [
      { label: "A mesma mensagem para todos", value: 0 },
      { label: "Mensagens por faixa de atraso", value: 1 },
      { label: "Propostas por perfil", value: 2 },
      { label: "Proposta ajustada caso a caso", value: 3 },
    ],
  },
  {
    id: "canal", curto: "Canal de negociação", fase: PRONTIDAO, dim: "Canal de negociação",
    titulo: "Por onde acontece a maior parte das negociações?",
    opcoes: [
      { label: "Ligação telefônica", value: 0 },
      { label: "SMS ou e-mail", value: 1 },
      { label: "WhatsApp com atendente", value: 2 },
      { label: "WhatsApp com alguma automação", value: 3 },
    ],
  },
  {
    id: "politica", curto: "Política de negociação", fase: PRONTIDAO, dim: "Política de negociação",
    titulo: "Como são definidos desconto, prazo e parcela?",
    opcoes: [
      { label: "Cada caso depende de aprovação", value: 0 },
      { label: "Existem faixas, mas não estão escritas", value: 1 },
      { label: "Regras documentadas por faixa", value: 2 },
      { label: "Regras parametrizadas no sistema", value: 3 },
    ],
  },
  {
    id: "integracao", curto: "Acesso aos dados", fase: PRONTIDAO, dim: "Acesso aos dados",
    titulo: "Como a equipe consulta a dívida e as condições do cliente?",
    opcoes: [
      { label: "Planilhas e relatórios exportados", value: 0 },
      { label: "Sistema central, sem API disponível", value: 1 },
      { label: "Sistema com API que a TI pode liberar", value: 2 },
      { label: "API já usada em outros canais digitais", value: 3 },
    ],
  },
  {
    id: "consentimento", curto: "Consentimento e LGPD", fase: PRONTIDAO, dim: "Consentimento e LGPD",
    titulo: "Os clientes autorizaram contato por WhatsApp?",
    opcoes: [
      { label: "Não sabemos", value: 0 },
      { label: "Só uma parte da base", value: 1 },
      { label: "A maioria, com registro", value: 3 },
    ],
  },
];

export const DIMS = QUESTIONS.filter((q) => q.dim);
export const MAX_PONTOS = DIMS.reduce((s, q) => s + Math.max(...q.opcoes.map((o) => o.value)), 0);

/* Multiplicadores conservadores por nível — o teste Crediauc ficou em ~15x */
export const NIVEIS = [
  { max: 5, nome: "Preparar a base", mult: [2, 3],
    resumo: "O ganho existe, mas antes do agente vale organizar regras e dados." },
  { max: 10, nome: "Pronta para piloto", mult: [3, 5],
    resumo: "Sua operação já tem o essencial para testar um agente numa campanha." },
  { max: MAX_PONTOS, nome: "Pronta para escalar", mult: [4, 7],
    resumo: "Regras, canal e dados estão maduros. O agente pode entrar na operação contínua." },
];

export const RECOMENDACOES = {
  regua: "Segmente a carteira pela capacidade de pagamento, não só pelos dias de atraso. É essa leitura que permite propor uma parcela que cabe no bolso.",
  canal: "Leve a negociação para o WhatsApp. O cliente responde no tempo dele, sem a pressão de uma ligação no meio do expediente.",
  politica: "Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação. O agente só negocia sozinho dentro de regras escritas.",
  integracao: "Liste com a TI os dados que o agente precisa consultar (saldo, atraso, condições) e por onde eles saem. Uma integração simples já viabiliza o piloto.",
  consentimento: "Revise a autorização de contato por WhatsApp da base em atraso. Contato com registro protege a instituição perante o CDC e a LGPD.",
};
export const PASSOS_GERAIS = [
  "Comece com uma campanha com data para acabar, como a Crediauc fez no Desenrola, e compare contratos renegociados e valor quitado com a operação atual.",
  "Defina o transbordo: quais exceções vão para um analista, sempre com o histórico da conversa junto.",
  "Acompanhe a reincidência dos acordos fechados pelo agente. Parcela que cabe no orçamento tende a ser cumprida até o fim.",
];

/* =========================================================
   CÁLCULO
   ========================================================= */
export function calcular(r) {
  const req = ["pessoas", "contratos", "ticket", "ritmo", ...DIMS.map((d) => d.id)];
  if (req.some((k) => r[k] === undefined)) return null;

  const pontos = DIMS.reduce((s, q) => s + r[q.id], 0);
  const nivel = NIVEIS.find((n) => pontos <= n.max) || NIVEIS[NIVEIS.length - 1];

  const atual = r.pessoas * r.ritmo * CONFIG.diasUteisMes;
  const ia = [atual * nivel.mult[0], atual * nivel.mult[1]];
  const limitar = (x) => Math.min(x, r.contratos);

  const passos = DIMS
    .map((q) => ({ id: q.id, pontos: r[q.id] }))
    .filter((d) => d.pontos <= 1)
    .sort((a, b) => a.pontos - b.pontos)
    .map((d) => RECOMENDACOES[d.id]);
  for (const p of PASSOS_GERAIS) if (passos.length < 3) passos.push(p);

  return {
    pontos, nivel, atual, ia,
    filaCoberta: atual >= r.contratos,
    mesesHoje: r.contratos / atual,
    mesesIA: [r.contratos / ia[1], r.contratos / ia[0]],
    extra: [(limitar(ia[0]) - limitar(atual)) * r.ticket, (limitar(ia[1]) - limitar(atual)) * r.ticket],
    dims: DIMS.map((q) => ({ nome: q.dim, pontos: r[q.id], max: Math.max(...q.opcoes.map((o) => o.value)) })),
    passos: passos.slice(0, 3),
  };
}

export const fmtNum = (n) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));
export const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);
export const fmtMeses = (m) => {
  if (m < 1) return "menos de 1 mês";
  const v = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(m);
  return `${v} ${m < 2 ? "mês" : "meses"}`;
};

export const fmtMesesInteiro = (m) => {
  const v = Math.max(1, Math.round(m));
  return `${fmtNum(v)} ${v === 1 ? "mês" : "meses"}`;
};
