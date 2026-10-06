import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info, MessageCircle, RotateCcw, ShieldCheck } from "lucide-react";

/* =========================================================
   CONFIGURAÇÃO — ajuste aqui
   Arquivo único: depende só de React, Tailwind e lucide-react.
   ========================================================= */
const CONFIG = {
  // Webhook que recebe o lead (Make, Zapier, n8n, HubSpot via proxy, Supabase Edge Function).
  // Vazio = modo de teste: o lead só aparece no console e o fluxo segue normalmente.
  webhookUrl: "",
  // Página de contato/agenda do time comercial da Ubots.
  ctaUrl: "https://ubots.com.br/contato",
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
const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8A6A00]";

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
      { label: "6 a 20", value: 12 },
      { label: "21 a 50", value: 35 },
      { label: "51 a 150", value: 100 },
      { label: "Mais de 150", value: 200 },
    ],
  },
  {
    id: "contratos", fase: OPERACAO,
    titulo: "Quantos contratos estão em atraso na carteira?",
    tituloTipo: "Quantos contratos estão em atraso na carteira {daInst}?",
    porque: "Define o tamanho da fila a percorrer.",
    opcoes: [
      { label: "Até 500", value: 300 },
      { label: "500 a 2 mil", value: 1200 },
      { label: "2 mil a 10 mil", value: 6000 },
      { label: "10 mil a 50 mil", value: 25000 },
      { label: "Mais de 50 mil", value: 70000 },
    ],
  },
  {
    id: "ticket", fase: OPERACAO,
    titulo: "Qual o valor médio de uma dívida em atraso?",
    porque: "Usamos para estimar o saldo em atraso.",
    opcoes: [
      { label: "Até R$ 2 mil", value: 1500 },
      { label: "R$ 2 mil a R$ 10 mil", value: 5000 },
      { label: "R$ 10 mil a R$ 50 mil", value: 20000 },
      { label: "Mais de R$ 50 mil", value: 75000 },
    ],
  },
  {
    id: "ritmo", fase: OPERACAO,
    titulo: "Quantas renegociações cada pessoa fecha por dia, em média?",
    porque: "Com esse número, calculamos o tempo para percorrer a fila.",
    opcoes: [
      { label: "Menos de 1", value: 0.5 },
      { label: "1 a 3", value: 2 },
      { label: "4 a 8", value: 6 },
      { label: "Mais de 8", value: 10 },
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
  { max: 5, nome: "Preparar a base", mult: [2, 3],
    resumo: "O ganho existe, mas antes do agente vale organizar regras e dados." },
  { max: 10, nome: "Pronta para piloto", mult: [3, 5],
    resumo: "Sua operação já tem o essencial para testar um agente numa campanha." },
  { max: MAX_PONTOS, nome: "Pronta para escalar", mult: [4, 7],
    resumo: "Regras, canal e dados estão maduros. O agente pode entrar na operação contínua." },
];

/* Por onde começar: a ação para cada dimensão fraca e, depois, os passos gerais. */
const RECOMENDACOES = {
  regua: "Segmente a carteira pela capacidade de pagamento, para propor parcelas que cabem no bolso.",
  canal: "Leve a negociação para o WhatsApp, onde o {cliente} responde no tempo dele.",
  politica: "Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação.",
  integracao: "Liste com a TI os dados que o agente vai consultar (saldo, atraso, condições) e por onde eles saem.",
  consentimento: "Revise quem autorizou contato por WhatsApp e registre a autorização.",
};
const PASSOS_GERAIS = [
  { rotulo: "Piloto", texto: "Comece com uma campanha com data para acabar, como a Crediauc fez no Desenrola." },
  { rotulo: "Transbordo", texto: "Defina quais exceções vão para um analista, sempre com o histórico da conversa." },
  { rotulo: "Acompanhamento", texto: "Acompanhe a reincidência dos acordos: parcela que cabe no orçamento é cumprida até o fim." },
];

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

  return {
    pontos, nivel, atual, ia,
    filaCoberta: atual >= r.contratos,
    mesesHoje: r.contratos / atual,
    mesesIA: [r.contratos / ia[1], r.contratos / ia[0]],
    extra: [(limitar(ia[0]) - limitar(atual)) * r.ticket, (limitar(ia[1]) - limitar(atual)) * r.ticket],
    dims: DIMS.map((q) => ({ nome: q.dim, pontos: r[q.id], max: Math.max(...q.opcoes.map((o) => o.value)) })),
  };
}

/* =========================================================
   LEITURA DO RESULTADO — usada na tela e no painel do comercial
   ========================================================= */
const fmtNum = (n) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));
const fmtDec = (n) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);
export const faixa = (a, b, fmt = fmtNum) => (fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)} a ${fmt(b)}`);
/* Prazo: uma casa decimal até 10 meses, meses inteiros até 2 anos, anos até 5 e "mais de 5 anos" depois. */
const prazo = (m) => {
  if (m < 1) return "menos de 1 mês";
  if (m > 60) return "mais de 5 anos";
  if (m > 24) return `${Math.round(m / 12)} anos`;
  const v = m < 10 ? fmtDec(m) : fmtNum(m);
  return `${v} ${parseFloat(v.replace(",", ".")) < 2 ? "mês" : "meses"}`;
};
const prazoIA = ([min, max]) => {
  if (max < 1) return "menos de 1 mês";
  if (min < 1) return `até ${prazo(max)}`;
  const [a, b] = [prazo(min), prazo(max)];
  return a === b ? a : `${a.replace(/ (mês|meses|anos)$/, (m, u) => (b.endsWith(u) ? "" : m))} a ${b}`;
};
export const rotulo = (id, valor) => QUESTIONS.find((q) => q.id === id)?.opcoes.find((o) => o.value === valor)?.label ?? "";

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
  const nomes = (lista) => lista.slice(0, 2).map((d) => NOME_NA_FRASE[d.id]).join(" e ");
  const bloqueios = fracas.filter((d) => d.pontos === 0 && ["politica", "consentimento", "integracao"].includes(d.id));

  const resumo = txt({
    "Preparar a base": `Antes do agente, vale organizar ${nomes(fracas)}.`,
    "Pronta para piloto": bloqueios.length
      ? `{Inst} pode testar um agente numa campanha depois de resolver ${nomes(bloqueios)}.`
      : "{Inst} já tem o essencial para testar um agente numa campanha.",
    "Pronta para escalar": critico
      ? `{Inst} tem quase toda a base pronta. Antes da operação contínua, resolva ${NOME_NA_FRASE[critico.id]}.`
      : "Regras, canal e dados {daInst} estão maduros. O agente pode entrar na operação contínua.",
  }[n], r.tipo);

  /* Por onde começar: as dimensões mais fracas (na ordem de prioridade) e, depois, os passos gerais.
     No nível mais alto, o passo "Piloto" sai: a conversa já é de operação contínua. */
  const gerais = n === "Pronta para escalar" ? PASSOS_GERAIS.slice(1) : PASSOS_GERAIS;
  const passos = [
    ...fracas.map((d) => ({ rotulo: d.nome, texto: txt(RECOMENDACOES[d.id], r.tipo) })),
    ...gerais,
  ].slice(0, 3);

  const cta = {
    "Preparar a base": { titulo: "Quer organizar esses pontos com a Ubots?", texto: "O time da Ubots pode revisar o diagnóstico com você e indicar por onde começar antes de um piloto." },
    "Pronta para piloto": { titulo: txt("Quer desenhar o piloto {daInst}?", r.tipo), texto: "O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias." },
    "Pronta para escalar": { titulo: "Quer levar o agente para a operação contínua?", texto: "O time da Ubots pode avaliar com você a integração e os critérios de transbordo para a equipe." },
  }[n];

  return {
    res, nivel: n, pontos: res.pontos, pontosMax: MAX_PONTOS, resumo, dims, critico, passos, cta,
    capacidadeHoje: fmtNum(res.atual),
    capacidadeIA: faixa(res.ia[0], res.ia[1]),
    tempoHoje: prazo(res.mesesHoje),
    tempoIA: prazoIA(res.mesesIA),
    extra: res.extra[1] > 0 ? faixa(res.extra[0], res.extra[1], fmtBRL) : null,
    saldo: fmtBRL(r.contratos * r.ticket),
    contratos: fmtNum(r.contratos),
    passaCarteira: res.ia[1] > r.contratos,
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
function Marca() {
  return (
    <div className="flex items-center gap-2" aria-label="Ubots">
      <span style={{ width: 12, height: 12, borderRadius: "50% 50% 50% 0", background: C.yellow, display: "inline-block" }} />
      <span className="font-bold text-lg" style={{ color: C.ink, letterSpacing: "-0.02em" }}>ubots</span>
    </div>
  );
}

function BotaoPrimario({ children, onClick, type = "button", disabled, escuro }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base ${FOCO}`}
      style={{ background: escuro ? C.ink : C.yellow, color: escuro ? "#FFFFFF" : C.ink, opacity: disabled ? 0.6 : 1, minHeight: 52 }}
    >
      {children}
    </button>
  );
}

function BotaoTexto({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold px-2 py-2 rounded-md ${FOCO}`} style={{ color: C.muted }}>
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
      className={`w-full text-left px-5 py-4 rounded-xl flex items-center justify-between gap-3 ${FOCO}`}
      style={{
        border: `2px solid ${selecionada ? C.ink : C.line}`,
        background: selecionada ? C.yellowSoft : C.card,
        color: C.ink,
        transition: "border-color .15s ease, background .15s ease",
        minHeight: 56,
      }}
    >
      <span className="text-base">{label}</span>
      <span
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 24, height: 24, border: `2px solid ${selecionada ? C.ink : C.line}`, background: selecionada ? C.ink : "transparent" }}
      >
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
        className={`w-full px-4 py-3 rounded-lg text-base ${FOCO}`}
        style={{ border: `1.5px solid ${erro ? C.error : C.line}`, background: C.card, color: C.ink, minHeight: 48 }}
      />
      {erro && <p id={`${id}-erro`} className="text-sm mt-1" style={{ color: C.error }}>{erro}</p>}
    </div>
  );
}

function Barra({ largura, larguraFaixa, destaque, animar, reduzido, altura = 10 }) {
  const t = (s) => (reduzido ? "none" : s);
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height: altura, background: C.line }}>
      {larguraFaixa !== undefined && (
        <div className="absolute top-0 left-0 h-full rounded-full"
          style={{ width: animar ? `${larguraFaixa}%` : "0%", background: C.yellowSoft, transition: t("width 1s cubic-bezier(.2,.8,.2,1) .15s") }} />
      )}
      <div className="absolute top-0 left-0 h-full rounded-full"
        style={{ width: animar ? `${largura}%` : "0%", background: destaque ? C.yellow : C.ink, transition: t("width .9s cubic-bezier(.2,.8,.2,1)") }} />
    </div>
  );
}

function Numero({ rotulo: r, valor, apoio }) {
  return (
    <div>
      <p className="text-xs" style={{ color: C.muted }}>{r}</p>
      <p className="font-bold text-lg leading-tight mt-1">{valor}</p>
      {apoio && <p className="text-xs mt-0.5" style={{ color: C.muted }}>{apoio}</p>}
    </div>
  );
}

/* Resultado em uma página: nível, potencial, prontidão, por onde começar e conversa. */
function Resultado({ a, lead, animar, reduzido, pedido, onPedir, onRefazer, tituloRef }) {
  const { res } = a;
  const confirmacao = useRef(null);
  useEffect(() => { if (pedido) confirmacao.current?.focus(); }, [pedido]);

  const conversa = pedido ? (
    <p ref={confirmacao} tabIndex={-1} role="status" className="flex items-start gap-2 text-sm font-semibold outline-none" style={{ lineHeight: 1.5 }}>
      <Check size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      {pedido === "registrado"
        ? "Pedido registrado. O time da Ubots vai falar com você pelo WhatsApp, com este diagnóstico em mãos."
        : "Abrimos a página de contato da Ubots em uma nova aba."}
    </p>
  ) : (
    <BotaoPrimario escuro onClick={onPedir}><MessageCircle size={18} aria-hidden="true" /> Conversar com um especialista</BotaoPrimario>
  );

  return (
    <main>
      <div className="flex flex-col gap-1 mb-6">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>Diagnóstico · {lead.instituicao}</p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 ref={tituloRef} tabIndex={-1} className="font-bold outline-none" style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            {a.nivel}
          </h1>
          <span className="text-sm font-semibold" style={{ color: C.muted }}>Nível de prontidão · {a.pontos} de {a.pontosMax} pontos</span>
        </div>
        <p className="text-base sm:text-lg mt-1" style={{ color: C.muted, lineHeight: 1.5 }}>{a.resumo}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Potencial */}
        <section aria-labelledby="potencial" className="rounded-2xl p-5 sm:p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <h2 id="potencial" className="font-bold text-lg mb-4">O potencial com um agente de IA</h2>
          <p className="text-xs mb-2" style={{ color: C.muted }}>Capacidade de renegociação por mês</p>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-sm mb-1"><span style={{ color: C.muted }}>Hoje</span><span className="font-bold">{a.capacidadeHoje}</span></div>
              <Barra largura={(res.atual / res.ia[1]) * 100} animar={animar} reduzido={reduzido} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span style={{ color: C.muted }}>Com agente de IA</span><span className="font-bold">{a.capacidadeIA}</span></div>
              <Barra largura={(res.ia[0] / res.ia[1]) * 100} larguraFaixa={100} destaque animar={animar} reduzido={reduzido} />
            </div>
          </div>
          {a.passaCarteira && (
            <p className="text-xs mt-2" style={{ color: C.muted }}>{`Acima dos cerca de ${a.contratos} contratos em atraso: o agente cobre a carteira no mês.`}</p>
          )}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
            <Numero rotulo="Tempo para percorrer a carteira" valor={res.filaCoberta ? "Fila em dia" : a.tempoIA} apoio={res.filaCoberta ? "a equipe já cobre a carteira no mês" : `hoje: ${a.tempoHoje}`} />
            <Numero rotulo="Dívida renegociada a mais no 1º mês" valor={a.extra ?? "Sem fila represada"} apoio={`saldo em atraso: ${a.saldo}`} />
          </div>
          <p className="text-xs mt-4" style={{ color: C.muted, lineHeight: 1.5 }}>
            {`Faixa conservadora, de ${res.nivel.mult[0]} a ${res.nivel.mult[1]} vezes a capacidade atual, conforme a prontidão. Valores sobre o saldo renegociado, não sobre o valor recebido.`}
          </p>
        </section>

        {/* Prontidão */}
        <section aria-labelledby="prontidao" className="rounded-2xl p-5 sm:p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex justify-between items-baseline mb-4">
            <h2 id="prontidao" className="font-bold text-lg">Prontidão por dimensão</h2>
            <span className="text-sm font-bold">{a.pontos}/{a.pontosMax}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {a.dims.map((d) => (
              <li key={d.id}>
                <div className="flex justify-between items-baseline gap-2 text-sm mb-1">
                  <span className="font-semibold">
                    {d.nome}
                    {a.critico?.id === d.id && (
                      <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: C.ink, color: "#FFFFFF" }}>Prioridade</span>
                    )}
                  </span>
                  <span className="font-bold shrink-0">{d.pontos}/{d.max}</span>
                </div>
                <Barra largura={Math.max((d.pontos / d.max) * 100, 4)} destaque={d.pontos >= 2} animar={animar} reduzido={reduzido} altura={6} />
                <p className="text-xs mt-1" style={{ color: C.muted, lineHeight: 1.45 }}>{d.leitura}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Por onde começar */}
      <section aria-labelledby="comecar" className="mt-6">
        <h2 id="comecar" className="font-bold text-lg mb-3">Por onde começar</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {a.passos.map((s, i) => (
            <li key={s.rotulo} className="flex gap-3 rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <span className="shrink-0 flex items-center justify-center rounded-full font-bold text-sm" style={{ width: 28, height: 28, background: C.yellow, color: C.ink }}>{i + 1}</span>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: C.muted, letterSpacing: "0.06em" }}>{s.rotulo}</p>
                <p className="text-sm mt-1" style={{ lineHeight: 1.5 }}>{s.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Conversa */}
      <section aria-labelledby="conversa" className="mt-6 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: C.yellowSoft, border: `1px solid ${C.yellow}` }}>
        <div className="lg:max-w-xl">
          <h2 id="conversa" className="font-bold text-lg">{a.cta.titulo}</h2>
          <p className="text-sm mt-1" style={{ lineHeight: 1.5 }}>{a.cta.texto}</p>
        </div>
        <div className="shrink-0">{conversa}</div>
      </section>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs" style={{ color: C.muted }}>
          Como calculamos: pessoas × renegociações por dia × 21 dias úteis, multiplicado pela faixa do nível. Cada resposta usa o valor de referência da faixa escolhida.
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
  const [pedido, setPedido] = useState(null);
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

  const depois = (fn) => { clearTimeout(timer.current); timer.current = setTimeout(fn, reduzido ? 0 : 240); };

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
        await fetch(CONFIG.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
    let ok = false;
    try { if (onInteresse) ok = (await onInteresse(lead?.id ?? null)) !== false; } catch { ok = false; }
    if (ok) { setPedido("registrado"); return; }
    window.open(CONFIG.ctaUrl, "_blank", "noopener");
    setPedido("pagina");
  };

  const q = QUESTIONS[idx];
  const daFase = QUESTIONS.filter((x) => x.fase === q?.fase);
  const pos = daFase.findIndex((x) => x.id === q?.id) + 1;
  const atual = resp.pessoas !== undefined && resp.ritmo !== undefined ? resp.pessoas * resp.ritmo * CONFIG.diasUteisMes : null;
  const largura = etapa === "quiz" ? "max-w-xl" : etapa === "resultado" ? "max-w-6xl" : "max-w-5xl";

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg, fontFamily: FONT, color: C.ink }}>
      <div className={`${largura} mx-auto px-5 py-6 sm:py-8`}>
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <Marca />
          {etapa === "quiz" && <span className="text-sm" style={{ color: C.muted }} aria-live="polite">{idx + 1} de {QUESTIONS.length}</span>}
        </header>

        {/* ABERTURA, já com a pergunta 1 */}
        {etapa === "intro" && (
          <main className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <div>
              <h1 ref={titulo} tabIndex={-1} className="font-bold mb-4 outline-none" style={{ fontSize: "clamp(1.9rem, 6vw, 2.6rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
                Qual seria o potencial da IA na sua operação de recuperação?
              </h1>
              <p className="text-lg mb-6" style={{ color: C.muted, lineHeight: 1.55 }}>
                Responda 10 perguntas sobre a sua operação de cobrança. Ao final, você informa seus dados e recebe o diagnóstico completo na hora.
              </p>
              <figure className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <p className="text-base font-semibold mb-2" style={{ lineHeight: 1.5 }}>
                  No case Sicoob Crediauc, um colaborador acompanhado de um agente de IA renegociou, em 5 dias, cerca de metade do valor alcançado por 135 gerentes nos 75 dias anteriores.
                </p>
                <figcaption className="text-sm" style={{ color: C.muted, lineHeight: 1.55 }}>
                  Considerando o período analisado, a experiência mostra um ganho relevante de capacidade operacional.
                </figcaption>
              </figure>
            </div>
            <section aria-labelledby="pergunta-tipo" className="rounded-2xl p-5 sm:p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <h2 id="pergunta-tipo" className="font-bold text-lg mb-4">Para começar, que tipo de instituição você representa?</h2>
              <div className="flex flex-col gap-3" role="group" aria-labelledby="pergunta-tipo">
                {QUESTIONS[0].opcoes.map((o) => (
                  <Opcao key={o.value} label={o.label} selecionada={resp.tipo === o.value} onClick={() => escolher(QUESTIONS[0], o.value)} />
                ))}
              </div>
              <p className="text-sm mt-4" style={{ color: C.muted }}>10 perguntas · cerca de 2 minutos · sem custo</p>
            </section>
          </main>
        )}

        {/* QUIZ */}
        {etapa === "quiz" && q && (
          <main>
            <div className="w-full rounded-full mb-6 overflow-hidden" style={{ height: 6, background: C.line }}
              role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={idx + 1}>
              <div className="h-full rounded-full" style={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%`, background: C.yellow, transition: reduzido ? "none" : "width .3s ease" }} />
            </div>

            {q.id === DIMS[0].id && atual !== null && (
              <p id="transicao" className="text-sm rounded-xl p-4 mb-6" style={{ background: C.yellowSoft, border: `1px solid ${C.yellow}`, lineHeight: 1.5 }}>
                <span className="font-semibold">Parte 1 concluída.</span>{" "}
                {txt(`Pelas suas respostas, a equipe {daInst} tem capacidade para cerca de ${fmtNum(atual)} renegociações por mês. Agora, 5 perguntas sobre a prontidão para um agente de IA.`, resp.tipo)}
              </p>
            )}

            <p id="fase" className="text-sm font-semibold mb-2" style={{ color: C.muted }}>{q.fase}, {pos} de {daFase.length}</p>
            <h1 ref={titulo} tabIndex={-1} key={q.id} aria-describedby={q.id === DIMS[0].id && atual !== null ? "fase transicao" : "fase"}
              className="font-bold mb-2 outline-none" style={{ fontSize: "clamp(1.4rem, 4.5vw, 1.75rem)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
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

            <div className="mt-8"><BotaoTexto onClick={voltar}><ArrowLeft size={16} aria-hidden="true" /> Voltar</BotaoTexto></div>
          </main>
        )}

        {/* CAPTAÇÃO: nenhum número aparece antes do envio */}
        {etapa === "captura" && a && (
          <main className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: C.muted }}>Diagnóstico concluído</p>
              <h1 ref={titulo} tabIndex={-1} className="font-bold outline-none" style={{ fontSize: "clamp(1.7rem, 5.5vw, 2.3rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
                {txt("O diagnóstico {daInst} está pronto.", resp.tipo)}
              </h1>
              <p className="text-lg mt-3 mb-5" style={{ color: C.muted, lineHeight: 1.55 }}>Informe seus dados para ver, nesta tela:</p>
              <ul className="flex flex-col gap-3">
                {["O potencial com um agente de IA: renegociações por mês e tempo para percorrer a carteira",
                  "A prontidão nas 5 dimensões, com a leitura de cada resposta",
                  txt("Por onde começar {naInst}", resp.tipo)].map((t) => (
                  <li key={t} className="flex gap-3 text-base" style={{ lineHeight: 1.45 }}>
                    <span className="shrink-0 flex items-center justify-center rounded-full mt-0.5" style={{ width: 22, height: 22, background: C.yellow }}>
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <BotaoTexto onClick={() => { setIdx(QUESTIONS.length - 1); setEtapa("quiz"); }}>
                  <ArrowLeft size={16} aria-hidden="true" /> Revisar respostas
                </BotaoTexto>
              </div>
            </div>

            <form onSubmit={enviar} noValidate data-form="lead" data-tipo={resp.tipo} aria-label="Seus dados"
              className="flex flex-col gap-4 rounded-2xl p-5 sm:p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <Campo id="nome" label="Nome" autoComplete="name" placeholder="Ana Souza" campoRef={(el) => { campos.current.nome = el; }}
                value={form.nome} erro={erros.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Campo id="email" label="E-mail de trabalho" type="email" autoComplete="email" inputMode="email" placeholder="ana@instituicao.com.br" campoRef={(el) => { campos.current.email = el; }}
                value={form.email} erro={erros.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Campo id="fone" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(51) 99999-9999" campoRef={(el) => { campos.current.fone = el; }}
                value={form.fone} erro={erros.fone} onChange={(e) => setForm({ ...form, fone: mascaraFone(e.target.value) })} />
              <Campo id="instituicao" label={p.campo} autoComplete="organization" campoRef={(el) => { campos.current.instituicao = el; }}
                value={form.instituicao} erro={erros.instituicao} onChange={(e) => setForm({ ...form, instituicao: e.target.value })} />
              <div>
                <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ lineHeight: 1.45 }}>
                  <input type="checkbox" checked={form.aceite} ref={(el) => { campos.current.aceite = el; }}
                    onChange={(e) => setForm({ ...form, aceite: e.target.checked })}
                    aria-invalid={!!erros.aceite} aria-describedby={erros.aceite ? "aceite-erro" : undefined}
                    className="mt-1 shrink-0" style={{ width: 18, height: 18, accentColor: C.ink }} />
                  <span>Autorizo a Ubots a entrar em contato sobre este diagnóstico.</span>
                </label>
                {erros.aceite && <p id="aceite-erro" className="text-sm mt-1" style={{ color: C.error }}>{erros.aceite}</p>}
              </div>
              <BotaoPrimario type="submit" disabled={enviando}>
                {enviando ? "Preparando seu diagnóstico..." : <>Ver diagnóstico completo <ArrowRight size={18} aria-hidden="true" /></>}
              </BotaoPrimario>
              <p className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                <ShieldCheck size={14} className="shrink-0" aria-hidden="true" /> Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.
              </p>
            </form>
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
