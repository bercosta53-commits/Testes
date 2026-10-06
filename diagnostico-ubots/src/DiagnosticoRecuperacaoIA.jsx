"use client"; // necessário no Next.js (v0); não muda nada no Vite
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info, Loader2, MessageCircle, RotateCcw, ShieldCheck } from "lucide-react";

/* =========================================================
   CONFIGURAÇÃO — ajuste aqui
   Arquivo único: depende só de React, Tailwind e lucide-react.
   ========================================================= */
const CONFIG = {
  // Webhook que recebe o lead (Make, Zapier, n8n, HubSpot via proxy, Supabase Edge Function).
  // Vazio = modo de teste: o lead só aparece no console e o fluxo segue normalmente.
  webhookUrl: "",
  // Página de contato/agenda do time comercial da Ubots (confirmar o endereço com a Ubots).
  ctaUrl: "https://ubots.com.br/",
  diasUteisMes: 21,
};

/* Identidade Ubots */
const C = {
  bg: "#FFFBEF",
  card: "#FFFFFF",
  ink: "#141414",
  muted: "#6B6558",
  line: "#ECE4CF",
  yellow: "#FFC800",
  yellowSoft: "#FFF4C7",
  error: "#B42318",
};
const FONT = "'Sora', system-ui, -apple-system, 'Segoe UI', sans-serif";
/* Foco igual no Tailwind 3 e 4: contorno transparente (visível no alto contraste) + anel dourado. */
const FOCO = "cursor-pointer focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-transparent focus-visible:ring-4 focus-visible:ring-[#8A6A00]";
const H1 = { fontSize: "clamp(1.75rem, 5.5vw, 2.5rem)", lineHeight: 1.1, letterSpacing: "-0.03em" };

/* =========================================================
   TIPO DE INSTITUIÇÃO — muda o texto, nunca os números.
   Nos textos, {inst}, {Inst}, {daInst}, {naInst}, {instCurta},
   {cliente}, {Cliente} e {clientes} são trocados pelo vocabulário do tipo.
   ========================================================= */
const PERFIS = {
  cooperativa: { inst: "a sua cooperativa", daInst: "da sua cooperativa", naInst: "na sua cooperativa", instCurta: "a cooperativa", campo: "Nome da cooperativa", cliente: "cooperado", clientes: "cooperados" },
  banco: { inst: "o seu banco", daInst: "do seu banco", naInst: "no seu banco", instCurta: "o banco", campo: "Nome do banco", cliente: "cliente", clientes: "clientes" },
  financeira: { inst: "a sua financeira", daInst: "da sua financeira", naInst: "na sua financeira", instCurta: "a financeira", campo: "Nome da financeira ou fintech", cliente: "cliente", clientes: "clientes" },
  outro: { inst: "a sua instituição", daInst: "da sua instituição", naInst: "na sua instituição", instCurta: "a instituição", campo: "Nome da instituição", cliente: "cliente", clientes: "clientes" },
};
const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const perfil = (tipo) => PERFIS[tipo] || PERFIS.outro;
const txt = (texto, tipo) => {
  const p = perfil(tipo);
  const v = { ...p, Inst: maiuscula(p.inst), Cliente: maiuscula(p.cliente) };
  return texto.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
};

/* =========================================================
   PERGUNTAS
   titulo: redação neutra (painel e CSV) · tituloTipo: redação por tipo
   porque: por que a pergunta é feita · leituras: leitura de cada resposta
   Perguntas numéricas: 5 faixas fechadas (nenhuma "mais de"); o cálculo usa
   um valor de referência redondo dentro de cada faixa.
   ========================================================= */
const OPERACAO = "Sua operação";
const PRONTIDAO = "Sua prontidão";

export const QUESTIONS = [
  {
    id: "tipo", fase: OPERACAO,
    titulo: "Que tipo de instituição você representa?",
    opcoes: [
      { label: "Cooperativa de crédito", value: "cooperativa" },
      { label: "Banco", value: "banco" },
      { label: "Financeira ou fintech", value: "financeira" },
      { label: "Outro tipo de instituição", value: "outro" },
    ],
  },
  {
    id: "pessoas", fase: OPERACAO,
    titulo: "Quantas pessoas negociam dívidas hoje?",
    tituloTipo: "Quantas pessoas negociam dívidas {naInst} hoje?",
    ajuda: "Conte todo mundo que negocia, mesmo sem dedicação exclusiva.",
    porque: "Usamos para calcular a capacidade atual da equipe.",
    opcoes: [
      { label: "1 a 5", value: 3 },
      { label: "6 a 10", value: 8 },
      { label: "11 a 20", value: 15 },
      { label: "21 a 50", value: 35 },
      { label: "51 a 100", value: 75 },
    ],
  },
  {
    id: "contratos", fase: OPERACAO,
    titulo: "Quantos contratos estão em atraso na carteira?",
    tituloTipo: "Quantos contratos estão em atraso na carteira {daInst}?",
    porque: "Define o tamanho da fila a percorrer.",
    opcoes: [
      { label: "Até 1 mil", value: 500 },
      { label: "1 mil a 5 mil", value: 3000 },
      { label: "5 mil a 10 mil", value: 7500 },
      { label: "10 mil a 20 mil", value: 15000 },
      { label: "20 mil a 50 mil", value: 35000 },
    ],
  },
  {
    id: "ticket", fase: OPERACAO,
    titulo: "Qual o valor médio de uma dívida em atraso?",
    porque: "Usamos para estimar o saldo em atraso.",
    opcoes: [
      { label: "Até R$ 1 mil", value: 500 },
      { label: "R$ 1 mil a R$ 5 mil", value: 3000 },
      { label: "R$ 5 mil a R$ 10 mil", value: 7500 },
      { label: "R$ 10 mil a R$ 20 mil", value: 15000 },
      { label: "R$ 20 mil a R$ 50 mil", value: 35000 },
    ],
  },
  {
    id: "ritmo", fase: OPERACAO,
    titulo: "Quantas renegociações cada pessoa fecha por dia, em média?",
    porque: "Com esse número, calculamos o tempo para percorrer a fila.",
    opcoes: [
      { label: "Até 2", value: 1 },
      { label: "3 a 5", value: 4 },
      { label: "6 a 10", value: 8 },
      { label: "11 a 15", value: 13 },
      { label: "16 a 20", value: 18 },
    ],
  },
  {
    id: "regua", fase: PRONTIDAO, dim: "Régua de cobrança",
    titulo: "Como o cliente em atraso recebe a proposta hoje?",
    tituloTipo: "Como o {cliente} em atraso recebe a proposta hoje?",
    porque: "Mostra se o agente já parte de uma segmentação.",
    opcoes: [
      { label: "A mesma mensagem para todos", value: 0 },
      { label: "Mensagens por faixa de atraso", value: 1 },
      { label: "Propostas por perfil", value: 2 },
      { label: "Proposta ajustada caso a caso", value: 3 },
    ],
    leituras: {
      0: "Mesma proposta para todos, sem olhar a capacidade de pagamento.",
      1: "Segmenta só por atraso, sem olhar a capacidade de pagamento.",
      2: "Propostas por perfil já podem orientar o agente.",
      3: "Proposta caso a caso: o agente leva esse ajuste para mais conversas.",
    },
  },
  {
    id: "canal", fase: PRONTIDAO, dim: "Canal de negociação",
    titulo: "Por onde acontece a maior parte das negociações?",
    porque: "Mostra quanto da negociação já está no canal do agente.",
    opcoes: [
      { label: "Ligação telefônica", value: 0 },
      { label: "SMS ou e-mail", value: 1 },
      { label: "WhatsApp com atendente", value: 2 },
      { label: "WhatsApp com alguma automação", value: 3 },
    ],
    leituras: {
      0: "Negociação por ligação, fora do canal do agente.",
      1: "SMS ou e-mail, fora do canal do agente.",
      2: "WhatsApp com atendente: o agente assume as etapas operacionais.",
      3: "WhatsApp com automação: o agente entra no canal que os {clientes} já usam.",
    },
  },
  {
    id: "politica", fase: PRONTIDAO, dim: "Política de negociação",
    titulo: "Como são definidos desconto, prazo e parcela?",
    tituloTipo: "Como {inst} define desconto, prazo e parcela?",
    porque: "O agente só negocia sozinho dentro de regras escritas.",
    opcoes: [
      { label: "Cada caso depende de aprovação", value: 0 },
      { label: "Existem faixas, mas não estão escritas", value: 1 },
      { label: "Regras documentadas por faixa", value: 2 },
      { label: "Regras parametrizadas no sistema", value: 3 },
    ],
    leituras: {
      0: "Cada caso depende de aprovação: o agente não fecha acordos sozinho.",
      1: "Faixas não escritas: o agente ainda não tem alçadas para seguir.",
      2: "Regras documentadas: base para as alçadas do agente.",
      3: "Regras parametrizadas: o agente propõe dentro das alçadas.",
    },
  },
  {
    id: "integracao", fase: PRONTIDAO, dim: "Acesso aos dados",
    titulo: "Como a equipe consulta a dívida e as condições do cliente?",
    tituloTipo: "Como a equipe consulta a dívida e as condições do {cliente}?",
    porque: "O agente precisa consultar saldo, atraso e condições durante a conversa.",
    opcoes: [
      { label: "Planilhas e relatórios exportados", value: 0 },
      { label: "Sistema central, sem API disponível", value: 1 },
      { label: "Sistema com API que a TI pode liberar", value: 2 },
      { label: "API já usada em outros canais digitais", value: 3 },
    ],
    leituras: {
      0: "Dados em planilhas, sem consulta direta para o agente.",
      1: "Sistema sem API: falta um caminho de consulta para o agente.",
      2: "API que a TI pode liberar: uma integração simples resolve.",
      3: "API já usada em canais digitais: a integração segue o mesmo caminho.",
    },
  },
  {
    id: "consentimento", fase: PRONTIDAO, dim: "Consentimento e LGPD",
    titulo: "Os clientes autorizaram contato por WhatsApp?",
    tituloTipo: "Os {clientes} autorizaram contato por WhatsApp?",
    porque: "Contato com registro protege {instCurta} perante o CDC e a LGPD.",
    opcoes: [
      { label: "Não sabemos", value: 0 },
      { label: "Só uma parte da base", value: 1 },
      { label: "A maioria, com registro", value: 3 },
    ],
    leituras: {
      0: "Não se sabe quem autorizou o contato por WhatsApp.",
      1: "Só parte da base autorizou: o agente começa por esse grupo.",
      3: "Base autorizada, com registro: o agente pode iniciar o contato.",
    },
  },
];

const DIMS = QUESTIONS.filter((q) => q.dim);
const MAX_PONTOS = DIMS.reduce((s, q) => s + Math.max(...q.opcoes.map((o) => o.value)), 0);

/* Multiplicadores conservadores por nível (premissas da On Nest) */
const NIVEIS = [
  { max: 5, nome: "Preparar a base", mult: [2, 3] },
  { max: 10, nome: "Pronta para piloto", mult: [3, 5] },
  { max: MAX_PONTOS, nome: "Pronta para escalar", mult: [4, 7] },
];

/* Por onde começar: a ação para cada dimensão fraca e, depois, os passos gerais.
   "pronto" diz como saber que o passo foi concluído. */
const RECOMENDACOES = {
  regua: {
    texto: "Segmente a carteira pela capacidade de pagamento, para propor parcelas que cabem no bolso.",
    pronto: "cada faixa de atraso tem 2 ou 3 propostas por perfil de renda ou de risco.",
  },
  canal: {
    texto: "Leve a negociação para o WhatsApp, onde o {cliente} responde no tempo dele.",
    pronto: "há um número oficial e um modelo de mensagem aprovado para abrir a conversa.",
  },
  politica: {
    texto: "Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação.",
    pronto: "uma tabela por faixa de atraso, aprovada pela diretoria, diz o que o agente pode oferecer.",
  },
  integracao: {
    texto: "Liste com a TI os dados que o agente vai consultar (saldo, atraso, condições) e por onde eles saem.",
    pronto: "a TI indica um caminho de consulta, mesmo que seja um arquivo atualizado todo dia.",
  },
  consentimento: {
    texto: "Revise quem autorizou contato por WhatsApp e registre a autorização.",
    pronto: "você sabe quantos {clientes} em atraso autorizaram, e esse grupo abre o piloto.",
  },
};
const PASSOS_GERAIS = [
  {
    rotulo: "Piloto", texto: "Comece com uma campanha com data para acabar, como a Crediauc fez no Desenrola.",
    pronto: "carteira, prazo de 5 a 15 dias e meta de valor renegociado estão definidos.",
  },
  {
    rotulo: "Transbordo", texto: "Defina quais exceções vão para um analista, sempre com o histórico da conversa.",
    pronto: "cada exceção tem um responsável e um prazo de resposta.",
  },
  {
    rotulo: "Acompanhamento", texto: "Acompanhe a reincidência dos acordos: parcela que cabe no orçamento é cumprida até o fim.",
    pronto: "um relatório semanal mostra acordos fechados, valor renegociado e parcelas pagas.",
  },
];
/* No nível mais alto, o piloto dá lugar à integração contínua. */
const PASSO_INTEGRACAO = {
  rotulo: "Integração", texto: "Conecte o agente por API, para consultar a dívida e registrar o acordo sem etapa manual.",
  pronto: "o acordo fechado na conversa aparece no sistema sem ninguém digitar.",
};

/* =========================================================
   CÁLCULO (original)
   ========================================================= */
export function calcular(r) {
  const req = ["pessoas", "contratos", "ticket", "ritmo", ...DIMS.map((d) => d.id)];
  if (req.some((k) => r[k] === undefined)) return null;

  const pontos = DIMS.reduce((s, q) => s + r[q.id], 0);
  const nivel = NIVEIS.find((n) => pontos <= n.max) || NIVEIS[NIVEIS.length - 1];

  const atual = r.pessoas * r.ritmo * CONFIG.diasUteisMes;
  const ia = [atual * nivel.mult[0], atual * nivel.mult[1]];
  const limitar = (x) => Math.min(x, r.contratos);
  const valorHoje = limitar(atual) * r.ticket;
  const valorIA = [limitar(ia[0]) * r.ticket, limitar(ia[1]) * r.ticket];

  return {
    pontos, nivel, atual, ia,
    filaCoberta: atual >= r.contratos,
    mesesHoje: r.contratos / atual,
    mesesIA: [r.contratos / ia[1], r.contratos / ia[0]],
    valorHoje, valorIA,
    extra: [valorIA[0] - valorHoje, valorIA[1] - valorHoje],
  };
}

/* =========================================================
   LEITURA DO RESULTADO — usada na tela e no painel do comercial
   ========================================================= */
const fmtNum = (n) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));
export const faixa = (a, b, fmt = fmtNum) => (fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)} a ${fmt(b)}`);

/* Números arredondados, sem casas decimais: dois algarismos significativos (1.512 -> 1.500). */
const arred = (n) => {
  if (!(n > 0)) return 0;
  const p = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
};
export const fmtQtd = (n) => fmtNum(arred(n));

/* Reais sem casas decimais: R$ 45 mil, R$ 450 mil, R$ 2 mi, R$ 30 mi, R$ 1.200 mi.
   Entre R$ 1 mi e R$ 10 mi, o milhão é inteiro. */
const partesReais = (v) => {
  const n = arred(v);
  if (n < 1e4) return [fmtNum(n), ""];
  if (n < 1e6) return [fmtNum(n / 1e3), " mil"];
  return [fmtNum(n / 1e6), " mi"];
};
const NBSP = "\u00a0"; // o valor não quebra no meio ("R$ 530 mi")
export const fmtReais = (v) => { const [n, u] = partesReais(v); return `R$${NBSP}${n}${u.replace(" ", NBSP)}`; };
export const faixaReais = ([a, b]) => {
  const [na, ua] = partesReais(a), [nb, ub] = partesReais(b);
  if (na === nb && ua === ub) return fmtReais(a);
  return ua === ub ? `R$${NBSP}${na} a ${nb}${ub.replace(" ", NBSP)}` : `${fmtReais(a)} a ${fmtReais(b)}`;
};

/* Prazo: semanas abaixo de 2 meses, meses inteiros até 2 anos, anos até 5 e "mais de 5 anos" depois. */
const SEMANAS_POR_MES = 52 / 12;
export const prazo = (m) => {
  if (m > 60) return "mais de 5 anos";
  if (Math.round(m) >= 24) return `${Math.round(m / 12)} anos`;
  if (m >= 2) return `${Math.round(m)} meses`;
  const s = Math.round(m * SEMANAS_POR_MES);
  return s < 1 ? "menos de 1 semana" : `${s} ${s === 1 ? "semana" : "semanas"}`;
};
export const prazoFaixa = ([min, max]) => {
  const [a, b] = [prazo(min), prazo(max)];
  if (a === b) return a;
  if (b === "mais de 5 anos") return `${a} ou mais`;
  if (a === "menos de 1 semana") return `até ${b}`;
  const unidade = (t) => t.replace(/^\d+ /, "").replace(/^semana$/, "semanas");
  return unidade(a) === unidade(b) ? `${a.split(" ")[0]} a ${b}` : `${a} a ${b}`;
};
/* Respostas de versões anteriores (com outras faixas) aparecem como o número de referência. */
export const rotulo = (id, valor) =>
  QUESTIONS.find((q) => q.id === id)?.opcoes.find((o) => o.value === valor)?.label ?? (typeof valor === "number" ? fmtNum(valor) : "");

/* Em empate de nota, a dimensão que mais trava um agente vem primeiro. */
const PRIORIDADE = ["politica", "consentimento", "integracao", "regua", "canal"];
const NOME_NA_FRASE = {
  regua: "a régua de cobrança", canal: "o canal de negociação", politica: "a política de negociação",
  integracao: "o acesso aos dados", consentimento: "a autorização de contato",
};

export function analisar(r) {
  const res = calcular(r);
  if (!res) return null;
  const n = res.nivel.nome;

  const dims = DIMS.map((q) => ({
    id: q.id, nome: q.dim, pontos: r[q.id], max: Math.max(...q.opcoes.map((o) => o.value)),
    resposta: rotulo(q.id, r[q.id]), leitura: txt(q.leituras[r[q.id]] ?? "", r.tipo),
  }));
  const fracas = dims.filter((d) => d.pontos < 2)
    .sort((a, b) => a.pontos - b.pontos || PRIORIDADE.indexOf(a.id) - PRIORIDADE.indexOf(b.id));
  const critico = fracas[0] || null;
  const nomes = (lista) => lista.map((d) => NOME_NA_FRASE[d.id]).join(", ").replace(/, ([^,]*)$/, " e $1");
  const bloqueios = fracas.filter((d) => d.pontos === 0 && ["politica", "consentimento", "integracao"].includes(d.id));

  const resumo = txt({
    "Preparar a base": `Antes do agente, vale organizar ${nomes(fracas.slice(0, 2))}.`,
    "Pronta para piloto": bloqueios.length
      ? `{Inst} pode testar um agente numa campanha depois de resolver ${nomes(bloqueios)}.`
      : "{Inst} já tem o essencial para testar um agente numa campanha.",
    "Pronta para escalar": critico
      ? `{Inst} tem quase toda a base pronta. Antes da operação contínua, resolva ${NOME_NA_FRASE[critico.id]}.`
      : "Regras, canal e dados {daInst} estão maduros. O agente pode entrar na operação contínua.",
  }[n], r.tipo);

  /* Por onde começar: as dimensões mais fracas (na ordem de prioridade) e, depois, os passos gerais.
     No nível mais alto, o "Piloto" dá lugar à "Integração": a conversa já é de operação contínua. */
  const gerais = n === "Pronta para escalar" ? [PASSO_INTEGRACAO, ...PASSOS_GERAIS.slice(1)] : PASSOS_GERAIS;
  const passos = [
    ...fracas.map((d) => ({ rotulo: d.nome, texto: txt(RECOMENDACOES[d.id].texto, r.tipo), pronto: txt(RECOMENDACOES[d.id].pronto, r.tipo) })),
    ...gerais,
  ].slice(0, 3);

  const cta = {
    "Preparar a base": { titulo: "Quer organizar esses pontos com a Ubots?", texto: "O time da Ubots pode revisar o diagnóstico com você e indicar por onde começar antes de um piloto." },
    "Pronta para piloto": { titulo: txt("Quer desenhar o piloto {daInst}?", r.tipo), texto: "O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias." },
    "Pronta para escalar": { titulo: "Quer levar o agente para a operação contínua?", texto: "O time da Ubots pode avaliar com você a integração e os critérios de transbordo para a equipe." },
  }[n];

  return {
    res, nivel: n, pontos: res.pontos, pontosMax: MAX_PONTOS, resumo, dims, critico, passos, cta,
    capacidadeHoje: fmtQtd(res.atual),
    capacidadeIA: faixa(res.ia[0], res.ia[1], fmtQtd),
    tempoHoje: prazo(res.mesesHoje),
    tempoIA: prazoFaixa(res.mesesIA),
    valorHoje: fmtReais(res.valorHoje),
    valorIA: faixaReais(res.valorIA),
    extra: res.extra[1] > 0 ? faixaReais(res.extra) : null,
    saldo: fmtReais(r.contratos * r.ticket),
    contratos: fmtQtd(r.contratos),
  };
}

/* =========================================================
   FORMULÁRIO
   ========================================================= */
const FORM_VAZIO = { nome: "", email: "", fone: "", instituicao: "", aceite: false };

const mascaraFone = (v) => {
  let d = v.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
function validar(f, tipo) {
  const e = {};
  if (f.nome.trim().length < 2) e.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Informe um e-mail válido, como nome@instituicao.com.br.";
  const dig = f.fone.replace(/\D/g, "");
  if (dig.length < 10 || dig.length > 11) e.fone = "Informe o WhatsApp com DDD.";
  if (f.instituicao.trim().length < 2) e.instituicao = `Informe o ${perfil(tipo).campo.charAt(0).toLowerCase()}${perfil(tipo).campo.slice(1)}.`;
  if (!f.aceite) e.aceite = "Marque a autorização para ver o diagnóstico.";
  return e;
}
const lerUTMs = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    const o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => { if (p.get(k)) o[k] = p.get(k); });
    return o;
  } catch { return {}; }
};

/* =========================================================
   COMPONENTES
   ========================================================= */
/* Entrada suave de cada etapa e pergunta (desligada com movimento reduzido). */
const CSS = "@keyframes dg-entra{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.dg-entra{animation:dg-entra .24s ease-out both}@media (prefers-reduced-motion:reduce){.dg-entra{animation:none}}";

function Marca() {
  return (
    <div className="flex items-center gap-2" aria-label="Ubots">
      <span style={{ width: 12, height: 12, borderRadius: "50% 50% 50% 0", background: C.yellow, display: "inline-block" }} />
      <span className="font-bold text-lg" style={{ color: C.ink, letterSpacing: "-0.02em" }}>ubots</span>
    </div>
  );
}

function BotaoPrimario({ children, onClick, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-4 rounded-full font-semibold text-[15px] sm:text-base whitespace-nowrap ${FOCO}`}
      style={{ background: C.yellow, color: C.ink, opacity: disabled ? 0.7 : 1, minHeight: 52 }}
    >
      {children}
    </button>
  );
}

function BotaoTexto({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold px-2 py-2 rounded-md hover:text-[#141414] ${FOCO}`} style={{ color: C.muted }}>
      {children}
    </button>
  );
}

function Opcao({ label, selecionada, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selecionada}
      className={`group w-full min-h-[56px] text-left px-5 py-4 rounded-xl flex items-center justify-between gap-3 border-2 transition-colors duration-150 motion-safe:active:scale-[.99] ${
        selecionada ? "border-[#141414] bg-[#FFF4C7]" : "border-[#ECE4CF] bg-white hover:border-[#B9AD8C] hover:bg-[#FFFDF5]"} ${FOCO}`}
    >
      <span className="text-base">{label}</span>
      <span className={`flex items-center justify-center rounded-full shrink-0 w-6 h-6 border-2 ${selecionada ? "border-[#141414] bg-[#141414]" : "border-[#ECE4CF] group-hover:border-[#B9AD8C]"}`}>
        {selecionada && <Check size={14} color={C.yellow} strokeWidth={3} />}
      </span>
    </button>
  );
}

function Campo({ id, label, erro, campoRef, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1" style={{ color: C.ink }}>{label}</label>
      <input
        id={id}
        ref={campoRef}
        {...props}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={`w-full px-4 py-3 rounded-lg text-base placeholder:text-[#A39A85] ${FOCO}`}
        style={{ border: `1.5px solid ${erro ? C.error : "#9A917C"}`, background: C.card, color: C.ink, minHeight: 48 }}
      />
      {erro && <p id={`${id}-erro`} className="text-sm mt-1" style={{ color: C.error }}>{erro}</p>}
    </div>
  );
}

function Barra({ largura, animar, reduzido, altura = 6 }) {
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height: altura, background: C.line }}>
      <div className="absolute top-0 left-0 h-full rounded-full"
        style={{ width: animar ? `${largura}%` : "0%", background: C.ink, transition: reduzido ? "none" : "width .9s cubic-bezier(.2,.8,.2,1)" }} />
    </div>
  );
}

/* Comparativo do potencial: 3 colunas a partir de 640px; no celular, o rótulo ocupa a linha de cima. */
const LINHA_POTENCIAL = "grid grid-cols-2 gap-x-3 sm:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_minmax(0,1.2fr)]";

/* Resultado em uma página: nível, potencial, prontidão, por onde começar e conversa. */
function Resultado({ a, lead, animar, reduzido, pedido, onPedir, onRefazer, tituloRef }) {
  const { res } = a;
  const confirmacao = useRef(null);
  useEffect(() => { if (pedido === "registrado") confirmacao.current?.focus(); }, [pedido]);
  const nivelAtual = NIVEIS.findIndex((n) => n.nome === a.nivel);

  return (
    <main className="dg-entra">
      {/* Cabeçalho: veredito à esquerda, escala dos 3 níveis à direita */}
      <div className="flex flex-col gap-5 mb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: C.muted }}>Diagnóstico · {lead.instituicao}</p>
          <h1 ref={tituloRef} tabIndex={-1} className="font-bold outline-none [text-wrap:balance]" style={H1}>{a.nivel}</h1>
          <p className="text-base sm:text-lg mt-2 [text-wrap:pretty]" style={{ color: C.muted, lineHeight: 1.5 }}>{a.resumo}</p>
        </div>
        <ol className="grid grid-cols-3 gap-1.5 shrink-0 lg:w-[380px]" aria-label={`Nível de prontidão: ${a.pontos} de ${a.pontosMax} pontos`}>
          {NIVEIS.map((n, i) => (
            <li key={n.nome} aria-current={i === nivelAtual ? "step" : undefined}>
              <div className="h-1.5 rounded-full" style={{ background: i === nivelAtual ? C.yellow : i < nivelAtual ? C.ink : C.line }} />
              <p className={`text-xs mt-2 ${i === nivelAtual ? "font-semibold" : ""}`} style={{ color: i === nivelAtual ? C.ink : C.muted }}>{n.nome}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Potencial: comparativo direto entre hoje e com o agente, sobre a carteira informada */}
        <section aria-labelledby="potencial" className="rounded-2xl p-5 sm:p-6 flex flex-col" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <h2 id="potencial" className="font-bold text-lg [text-wrap:balance]">O potencial com um agente de IA</h2>
          <p className="text-sm mt-1" style={{ color: C.muted, lineHeight: 1.5 }}>
            Carteira em atraso: {a.contratos} contratos, cerca de {a.saldo}.
          </p>
          <div role="table" aria-label="Hoje e com um agente de IA" className="mt-4">
            <div role="row" className={LINHA_POTENCIAL}>
              <span role="columnheader" className="hidden sm:block"><span className="sr-only">Indicador</span></span>
              <span role="columnheader" className="text-xs font-semibold pt-2.5 pb-2" style={{ color: C.muted }}>Hoje</span>
              <span role="columnheader" className="text-xs font-semibold pt-2.5 pb-2 px-3 rounded-t-lg" style={{ background: C.yellowSoft }}>Com agente de IA</span>
            </div>
            {[
              ["Renegociações por mês", a.capacidadeHoje, a.capacidadeIA],
              ["Prazo para negociar toda a carteira", a.tempoHoje, a.tempoIA],
              ["Valor renegociado no 1º mês", a.valorHoje, a.valorIA],
            ].map(([rot, hoje, ia], i, todas) => (
              <div role="row" key={rot} className={LINHA_POTENCIAL} style={{ borderTop: `1px solid ${C.line}` }}>
                <span role="rowheader" className="col-span-2 sm:col-span-1 text-sm pt-2.5 sm:pb-2.5 [text-wrap:balance]" style={{ color: C.muted, lineHeight: 1.35 }}>{rot}</span>
                <span role="cell" className="text-[15px] font-semibold tabular-nums py-2 sm:py-2.5" style={{ lineHeight: 1.35 }}>{hoje}</span>
                <span role="cell" className={`text-[15px] font-bold tabular-nums py-2 sm:py-2.5 px-3 ${i === todas.length - 1 ? "rounded-b-lg" : ""}`}
                  style={{ background: C.yellowSoft, lineHeight: 1.35 }}>{ia}</span>
              </div>
            ))}
          </div>
          <p className="text-sm mt-4" style={{ lineHeight: 1.5 }}>
            {a.extra
              ? <>Diferença estimada no 1º mês: <strong className="tabular-nums">+{a.extra}</strong> renegociados.</>
              : <>A equipe já negocia a carteira inteira em {a.tempoHoje}. Com o agente, a estimativa é de <strong>{a.tempoIA}</strong>.</>}
          </p>
          <p className="text-xs mt-auto pt-3" style={{ color: C.muted, lineHeight: 1.5 }}>
            {`Estimativa conservadora: ${res.nivel.mult[0]} a ${res.nivel.mult[1]} vezes a capacidade de hoje, conforme a prontidão. Valores arredondados. Renegociado não é o mesmo que recebido.`}
          </p>
        </section>

        {/* Prontidão: barras em tinta; o amarelo marca só a prioridade */}
        <section aria-labelledby="prontidao" className="rounded-2xl p-5 sm:p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex justify-between items-baseline mb-4">
            <h2 id="prontidao" className="font-bold text-lg">Prontidão por dimensão</h2>
            <span className="text-sm font-bold tabular-nums">{a.pontos}/{a.pontosMax}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {a.dims.map((d) => (
              <li key={d.id}>
                <div className="flex justify-between items-baseline gap-2 text-sm mb-1">
                  <span className="font-semibold">
                    {d.nome}
                    {a.critico?.id === d.id && (
                      <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: C.yellow, color: C.ink }}>Prioridade</span>
                    )}
                  </span>
                  <span className="font-bold shrink-0 tabular-nums">{d.pontos}/{d.max}</span>
                </div>
                <Barra largura={Math.max((d.pontos / d.max) * 100, 4)} animar={animar} reduzido={reduzido} />
                <p className="text-xs mt-1" style={{ color: C.muted, lineHeight: 1.45 }}>{d.leitura}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Por onde começar: lista, sem caixas; o passo 1 conversa com o selo "Prioridade" */}
      <section aria-labelledby="comecar" className="mt-8">
        <h2 id="comecar" className="font-bold text-lg mb-3">Por onde começar</h2>
        <ol className="grid gap-4 md:gap-6 md:grid-flow-col md:auto-cols-fr">
          {a.passos.map((s, i) => (
            <li key={s.rotulo} className="flex gap-3 pt-4" style={{ borderTop: `2px solid ${i === 0 ? C.ink : C.line}` }}>
              <span className="shrink-0 flex items-center justify-center rounded-full font-bold text-sm w-7 h-7"
                style={i === 0 ? { background: C.yellow, color: C.ink } : { border: `1.5px solid ${C.line}`, color: C.ink }}>{i + 1}</span>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: C.muted, letterSpacing: "0.06em" }}>{s.rotulo}</p>
                <p className="text-sm mt-1" style={{ lineHeight: 1.5 }}>{s.texto}</p>
                <p className="text-xs mt-1.5" style={{ color: C.muted, lineHeight: 1.5 }}>
                  <span className="font-semibold" style={{ color: C.ink }}>Pronto quando:</span> {s.pronto}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Conversa: o fechamento da página, com a única ação em amarelo */}
      <section id="conversa" aria-labelledby="conversa-titulo" className="mt-8 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: C.ink, color: "#FFFFFF" }}>
        <div className="lg:max-w-xl">
          <h2 id="conversa-titulo" className="font-bold text-lg">{a.cta.titulo}</h2>
          <p className="text-sm mt-1" style={{ color: "#D9D2BF", lineHeight: 1.5 }}>{a.cta.texto}</p>
        </div>
        <div className="shrink-0 lg:max-w-sm">
          {pedido === "registrado" ? (
            <p ref={confirmacao} tabIndex={-1} role="status" className="flex items-start gap-2 text-sm font-semibold outline-none" style={{ lineHeight: 1.5 }}>
              <Check size={18} className="shrink-0 mt-0.5" style={{ color: C.yellow }} aria-hidden="true" />
              Pedido registrado. O time da Ubots vai falar com você pelo WhatsApp, com este diagnóstico em mãos.
            </p>
          ) : (
            <BotaoPrimario onClick={onPedir} disabled={pedido === "enviando"}>
              <MessageCircle size={18} className="hidden sm:block shrink-0" aria-hidden="true" /> Conversar com um especialista
            </BotaoPrimario>
          )}
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs" style={{ color: C.muted }}>
          {`Como calculamos: pessoas × renegociações por dia × ${CONFIG.diasUteisMes} dias úteis, multiplicado pela faixa do nível. Cada resposta usa um valor de referência dentro da faixa escolhida, e os resultados são arredondados.`}
        </p>
        <BotaoTexto onClick={onRefazer}><RotateCcw size={16} aria-hidden="true" /> Refazer diagnóstico</BotaoTexto>
      </div>
    </main>
  );
}

/* =========================================================
   APP
   Props opcionais (integração):
   onLead(payload) substitui o webhook e pode devolver { id };
   onInteresse(id) registra o pedido de conversa e devolve true se gravou;
   respostasIniciais, etapaInicial e formInicial abrem o diagnóstico já respondido.
   ========================================================= */
export default function DiagnosticoRecuperacaoIA({ onLead, onInteresse, onReiniciar, respostasIniciais, etapaInicial, formInicial } = {}) {
  const [etapa, setEtapa] = useState(etapaInicial || "intro"); // intro | quiz | captura | resultado
  const [idx, setIdx] = useState(1);
  const [resp, setResp] = useState(respostasIniciais || {});
  const [form, setForm] = useState(FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [lead, setLead] = useState(null);
  const [pedido, setPedido] = useState(null); // null | enviando | registrado
  const [animar, setAnimar] = useState(false);
  const timer = useRef(null);
  const titulo = useRef(null);
  const campos = useRef({});
  const anterior = useRef({ etapa, idx });

  const reduzido = useMemo(() => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  }, []);
  const a = useMemo(() => analisar(resp), [resp]);
  const p = perfil(resp.tipo);

  useEffect(() => {
    if (!document.getElementById("font-sora")) {
      const l = document.createElement("link");
      l.id = "font-sora"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap";
      document.head.appendChild(l);
    }
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (formInicial) { setForm((f) => ({ ...f, ...formInicial })); setErros({}); }
  }, [formInicial]);

  /* A cada troca de pergunta ou etapa: topo da página e foco no título. */
  useEffect(() => {
    if (anterior.current.etapa === etapa && anterior.current.idx === idx) return;
    anterior.current = { etapa, idx };
    window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
    titulo.current?.focus({ preventScroll: true });
  }, [etapa, idx, reduzido]);

  useEffect(() => {
    if (etapa !== "resultado") return undefined;
    setAnimar(false);
    const t = setTimeout(() => setAnimar(true), reduzido ? 0 : 60);
    return () => clearTimeout(t);
  }, [etapa, reduzido]);

  /* A opção marcada fica visível por um instante antes de avançar (também com movimento reduzido). */
  const depois = (fn) => { clearTimeout(timer.current); timer.current = setTimeout(fn, 280); };

  const escolher = (q, valor) => {
    setResp((r) => ({ ...r, [q.id]: valor }));
    const i = QUESTIONS.indexOf(q);
    depois(() => {
      if (i < QUESTIONS.length - 1) { setIdx(i + 1); setEtapa("quiz"); } else setEtapa("captura");
    });
  };

  const voltar = () => {
    clearTimeout(timer.current);
    if (idx <= 1) setEtapa("intro");
    else setIdx(idx - 1);
  };

  const reiniciar = () => {
    setResp({}); setIdx(1); setErros({}); setLead(null); setPedido(null); setEtapa("intro");
    onReiniciar?.();
  };

  /* Atualiza um campo e apaga o erro dele, se houver. */
  const mudar = (k, v) => { setForm((f) => ({ ...f, [k]: v })); if (erros[k]) setErros((e) => ({ ...e, [k]: undefined })); };

  const enviar = async (ev) => {
    ev.preventDefault();
    const e = validar(form, resp.tipo);
    setErros(e);
    const primeiro = ["nome", "email", "fone", "instituicao", "aceite"].find((k) => e[k]);
    if (primeiro) { campos.current[primeiro]?.focus(); return; }
    setEnviando(true);
    const res = a.res;
    const dados = { nome: form.nome.trim(), email: form.email.trim(), whatsapp: form.fone.replace(/\D/g, ""), instituicao: form.instituicao.trim() };
    const payload = {
      lead: dados,
      respostas: resp,
      resultado: {
        nivel: res.nivel.nome, pontos: res.pontos, pontos_max: MAX_PONTOS,
        capacidade_atual_mes: Math.round(res.atual),
        capacidade_ia_mes: res.ia.map(Math.round),
        valor_adicional_mes: res.extra.map(Math.round),
        saldo_atraso: resp.contratos * resp.ticket,
        ponto_critico: a.critico?.nome ?? null,
      },
      origem: { pagina: typeof window !== "undefined" ? window.location.href : "", ...lerUTMs() },
      enviado_em: new Date().toISOString(),
    };
    let id = null;
    try {
      if (onLead) id = (await onLead(payload))?.id ?? null;
      else if (CONFIG.webhookUrl) {
        // Limite de 8 s: um webhook lento não prende a pessoa na tela.
        await fetch(CONFIG.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout?.(8000) });
      } else console.info("[Diagnóstico] modo de teste, lead não enviado:", payload);
    } catch (err) {
      console.error("[Diagnóstico] falha ao enviar lead:", err);
    } finally {
      setEnviando(false);
      setLead({ ...dados, id }); // o usuário nunca fica travado por falha de rede
      setEtapa("resultado");
    }
  };

  const pedirConversa = async () => {
    if (pedido) return;
    setPedido("enviando");
    let ok = false;
    try { if (onInteresse) ok = (await onInteresse(lead?.id ?? null)) !== false; } catch { ok = false; }
    if (ok) { setPedido("registrado"); return; }
    window.open(CONFIG.ctaUrl, "_blank", "noopener"); // sem registro: abre a página de contato
    setPedido(null);
  };

  const q = QUESTIONS[idx];
  const transicao = q?.id === DIMS[0].id && resp.pessoas !== undefined && resp.ritmo !== undefined;

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg, fontFamily: FONT, color: C.ink }}>
      <style>{CSS}</style>
      <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
        <header className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <Marca />
          {etapa === "resultado" && !pedido && (
            <button type="button" onClick={pedirConversa}
              className={`hidden lg:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-colors ${FOCO}`}>
              <MessageCircle size={16} aria-hidden="true" /> Conversar com um especialista
            </button>
          )}
        </header>

        {/* ABERTURA, já com a pergunta 1 (no celular, a pergunta vem antes do case) */}
        {etapa === "intro" && (
          <main className="dg-entra grid gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-8 lg:items-start">
            <div>
              <h1 ref={titulo} tabIndex={-1} className="font-bold mb-4 outline-none [text-wrap:balance]" style={H1}>
                Qual seria o potencial da IA na sua operação de recuperação?
              </h1>
              <p className="text-base sm:text-lg" style={{ color: C.muted, lineHeight: 1.55 }}>
                Responda 10 perguntas sobre a sua operação de cobrança. Ao final, você informa seus dados e recebe o diagnóstico completo na hora.
              </p>
            </div>
            <section aria-labelledby="pergunta-tipo" className="rounded-2xl p-5 sm:p-6 lg:col-start-2 lg:row-start-1 lg:row-span-2" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <h2 id="pergunta-tipo" className="font-bold text-lg mb-4">Para começar, que tipo de instituição você representa?</h2>
              <div className="flex flex-col gap-3" role="group" aria-labelledby="pergunta-tipo">
                {QUESTIONS[0].opcoes.map((o) => (
                  <Opcao key={o.value} label={o.label} selecionada={resp.tipo === o.value} onClick={() => escolher(QUESTIONS[0], o.value)} />
                ))}
              </div>
              <p className="text-sm mt-4" style={{ color: C.muted }}>10 perguntas · cerca de 2 minutos · sem custo</p>
            </section>
            <figure className="pt-6 lg:col-start-1 lg:row-start-2" style={{ borderTop: `1px solid ${C.line}` }}>
              <p className="text-base font-semibold mb-2" style={{ lineHeight: 1.5 }}>
                No case Sicoob Crediauc, um colaborador acompanhado de um agente de IA renegociou, em 5 dias, cerca de metade do valor alcançado por 135 gerentes nos 75 dias anteriores.
              </p>
              <figcaption className="text-sm" style={{ color: C.muted, lineHeight: 1.55 }}>
                Considerando o período analisado, a experiência mostra um ganho relevante de capacidade operacional.
              </figcaption>
            </figure>
          </main>
        )}

        {/* QUIZ */}
        {etapa === "quiz" && q && (
          <main className="max-w-xl mx-auto">
            <div className="flex justify-between text-sm mb-2" style={{ color: C.muted }}>
              <span id="fase" className="font-semibold">{q.fase}</span>
              <span id="contador" className="tabular-nums">{idx + 1} de {QUESTIONS.length}</span>
            </div>
            <div className="flex gap-1 mb-6" role="progressbar" aria-label="Progresso" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={idx + 1}>
              {QUESTIONS.map((x, i) => (
                <span key={x.id} className={`h-1.5 flex-1 rounded-full ${x === DIMS[0] ? "ml-2" : ""}`}
                  style={{ background: i < idx ? C.yellow : i === idx ? C.ink : C.line, transition: reduzido ? "none" : "background .3s ease" }} />
              ))}
            </div>

            <div key={q.id} className="dg-entra">
              {transicao && (
                <p id="transicao" className="flex gap-3 text-sm rounded-xl px-4 py-3 mb-6" style={{ background: C.card, border: `1px solid ${C.line}`, lineHeight: 1.5 }}>
                  <span className="shrink-0 flex items-center justify-center rounded-full mt-0.5 w-5 h-5" style={{ background: C.yellow }}>
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="font-semibold">Parte 1 concluída.</span>{" "}
                    {txt(`A equipe {daInst} tem capacidade para cerca de ${fmtQtd(resp.pessoas * resp.ritmo * CONFIG.diasUteisMes)} renegociações por mês. Agora, a prontidão para um agente de IA.`, resp.tipo)}
                  </span>
                </p>
              )}
              <h1 ref={titulo} tabIndex={-1} aria-describedby={transicao ? "fase contador transicao" : "fase contador"}
                className="font-bold mb-2 outline-none [text-wrap:balance]" style={{ fontSize: "clamp(1.4rem, 4.5vw, 1.75rem)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {resp.tipo && q.tituloTipo ? txt(q.tituloTipo, resp.tipo) : q.titulo}
              </h1>
              {q.ajuda && <p className="text-sm mb-1" style={{ color: C.muted }}>{q.ajuda}</p>}
              {q.porque && (
                <p className="flex items-start gap-1.5 text-sm" style={{ color: C.muted }}>
                  <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> {txt(q.porque, resp.tipo)}
                </p>
              )}

              <div className="flex flex-col gap-3 mt-6" role="group" aria-label={q.titulo}>
                {q.opcoes.map((o) => (
                  <Opcao key={String(o.value)} label={o.label} selecionada={resp[q.id] === o.value} onClick={() => escolher(q, o.value)} />
                ))}
              </div>
            </div>

            <div className="mt-8"><BotaoTexto onClick={voltar}><ArrowLeft size={16} aria-hidden="true" /> Voltar</BotaoTexto></div>
          </main>
        )}

        {/* CAPTAÇÃO: nenhum número aparece antes do envio */}
        {etapa === "captura" && a && (
          <main className="dg-entra grid gap-x-16 gap-y-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: C.muted }}>Diagnóstico concluído</p>
              <h1 ref={titulo} tabIndex={-1} className="font-bold outline-none [text-wrap:balance]" style={H1}>
                {txt("O diagnóstico {daInst} está pronto.", resp.tipo)}
              </h1>
              <p className="text-base sm:text-lg mt-3 mb-4 sm:mb-5" style={{ color: C.muted, lineHeight: 1.55 }}>Informe seus dados para ver, nesta tela:</p>
              <ul className="flex flex-col gap-2.5 sm:gap-3">
                {["O potencial com um agente de IA: renegociações por mês e tempo para percorrer a carteira",
                  "A prontidão nas 5 dimensões, com a leitura de cada resposta",
                  txt("Por onde começar {naInst}", resp.tipo)].map((t) => (
                  <li key={t} className="flex gap-3 text-sm sm:text-base" style={{ lineHeight: 1.45 }}>
                    <span className="shrink-0 flex items-center justify-center rounded-full mt-0.5 w-[22px] h-[22px]" style={{ background: C.yellow }}>
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={enviar} noValidate data-form="lead" data-tipo={resp.tipo} aria-label="Seus dados" aria-busy={enviando}
              className="rounded-2xl p-5 sm:p-6 lg:col-start-2 lg:row-start-1 lg:row-span-2" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <fieldset disabled={enviando} className="flex flex-col gap-4 min-w-0">
                <Campo id="nome" label="Nome" autoComplete="name" placeholder="Ana Souza" campoRef={(el) => { campos.current.nome = el; }}
                  value={form.nome} erro={erros.nome} onChange={(e) => mudar("nome", e.target.value)} />
                <Campo id="email" label="E-mail de trabalho" type="email" autoComplete="email" inputMode="email" placeholder="ana@instituicao.com.br" campoRef={(el) => { campos.current.email = el; }}
                  value={form.email} erro={erros.email} onChange={(e) => mudar("email", e.target.value)} />
                <Campo id="fone" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(51) 99999-9999" campoRef={(el) => { campos.current.fone = el; }}
                  value={form.fone} erro={erros.fone} onChange={(e) => mudar("fone", mascaraFone(e.target.value))} />
                <Campo id="instituicao" label={p.campo} autoComplete="organization" campoRef={(el) => { campos.current.instituicao = el; }}
                  value={form.instituicao} erro={erros.instituicao} onChange={(e) => mudar("instituicao", e.target.value)} />
                <div>
                  <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ lineHeight: 1.45 }}>
                    <input type="checkbox" checked={form.aceite} ref={(el) => { campos.current.aceite = el; }}
                      onChange={(e) => mudar("aceite", e.target.checked)}
                      aria-invalid={!!erros.aceite} aria-describedby={erros.aceite ? "aceite-erro" : undefined}
                      className={`mt-1 shrink-0 ${FOCO}`} style={{ width: 18, height: 18, accentColor: C.ink }} />
                    <span>Autorizo a Ubots a entrar em contato sobre este diagnóstico.</span>
                  </label>
                  {erros.aceite && <p id="aceite-erro" className="text-sm mt-1" style={{ color: C.error }}>{erros.aceite}</p>}
                </div>
                <BotaoPrimario type="submit" disabled={enviando}>
                  {enviando
                    ? <><Loader2 size={18} className="shrink-0 motion-safe:animate-spin" aria-hidden="true" /> Preparando o diagnóstico</>
                    : <>Ver diagnóstico completo <ArrowRight size={18} className="shrink-0" aria-hidden="true" /></>}
                </BotaoPrimario>
                <p className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                  <ShieldCheck size={14} className="shrink-0" aria-hidden="true" /> Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.
                </p>
              </fieldset>
            </form>

            <div className="lg:col-start-1 lg:row-start-2">
              <BotaoTexto onClick={() => { setIdx(QUESTIONS.length - 1); setEtapa("quiz"); }}>
                <ArrowLeft size={16} aria-hidden="true" /> Revisar respostas
              </BotaoTexto>
            </div>
          </main>
        )}

        {/* RESULTADO */}
        {etapa === "resultado" && a && lead && (
          <Resultado a={a} lead={lead} animar={animar} reduzido={reduzido} pedido={pedido}
            onPedir={pedirConversa} onRefazer={reiniciar} tituloRef={titulo} />
        )}
      </div>
    </div>
  );
}
