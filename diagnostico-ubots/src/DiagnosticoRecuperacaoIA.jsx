import React, { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Check, Lock, ShieldCheck, RotateCcw } from "lucide-react";

/* =========================================================
   CONFIGURAÇÃO — ajuste aqui no Lovable
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

/* =========================================================
   PERGUNTAS
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
    id: "contratos", fase: OPERACAO,
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
    id: "ticket", fase: OPERACAO,
    titulo: "Qual o valor médio de uma dívida em atraso?",
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
    opcoes: [
      { label: "A mesma mensagem para todos", value: 0 },
      { label: "Mensagens por faixa de atraso", value: 1 },
      { label: "Propostas por perfil de cliente", value: 2 },
      { label: "Proposta ajustada caso a caso", value: 3 },
    ],
  },
  {
    id: "canal", fase: PRONTIDAO, dim: "Canal de negociação",
    titulo: "Por onde acontece a maior parte das negociações?",
    opcoes: [
      { label: "Ligação telefônica", value: 0 },
      { label: "SMS ou e-mail", value: 1 },
      { label: "WhatsApp com atendente", value: 2 },
      { label: "WhatsApp com alguma automação", value: 3 },
    ],
  },
  {
    id: "politica", fase: PRONTIDAO, dim: "Política de negociação",
    titulo: "Como são definidos desconto, prazo e parcela?",
    opcoes: [
      { label: "Cada caso depende de aprovação", value: 0 },
      { label: "Existem faixas, mas não estão escritas", value: 1 },
      { label: "Regras documentadas por faixa", value: 2 },
      { label: "Regras parametrizadas no sistema", value: 3 },
    ],
  },
  {
    id: "integracao", fase: PRONTIDAO, dim: "Acesso aos dados",
    titulo: "Como a equipe consulta a dívida e as condições do cliente?",
    opcoes: [
      { label: "Planilhas e relatórios exportados", value: 0 },
      { label: "Sistema central, sem API disponível", value: 1 },
      { label: "Sistema com API que a TI pode liberar", value: 2 },
      { label: "API já usada em outros canais digitais", value: 3 },
    ],
  },
  {
    id: "consentimento", fase: PRONTIDAO, dim: "Consentimento e LGPD",
    titulo: "Os clientes autorizaram contato por WhatsApp?",
    opcoes: [
      { label: "Não sabemos", value: 0 },
      { label: "Só uma parte da base", value: 1 },
      { label: "A maioria, com registro", value: 3 },
    ],
  },
];

const DIMS = QUESTIONS.filter((q) => q.dim);
const MAX_PONTOS = DIMS.reduce((s, q) => s + Math.max(...q.opcoes.map((o) => o.value)), 0);

/* Multiplicadores conservadores por nível — o teste Crediauc ficou em ~15x */
const NIVEIS = [
  { max: 5, nome: "Preparar a base", mult: [2, 3],
    resumo: "O ganho existe, mas antes do agente vale organizar regras e dados." },
  { max: 10, nome: "Pronta para piloto", mult: [3, 5],
    resumo: "Sua operação já tem o essencial para testar um agente numa campanha." },
  { max: MAX_PONTOS, nome: "Pronta para escalar", mult: [4, 7],
    resumo: "Regras, canal e dados estão maduros. O agente pode entrar na operação contínua." },
];

const RECOMENDACOES = {
  regua: "Segmente a carteira pela capacidade de pagamento, não só pelos dias de atraso. É essa leitura que permite propor uma parcela que cabe no bolso.",
  canal: "Leve a negociação para o WhatsApp. O cliente responde no tempo dele, sem a pressão de uma ligação no meio do expediente.",
  politica: "Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação. O agente só negocia sozinho dentro de regras escritas.",
  integracao: "Liste com a TI os dados que o agente precisa consultar (saldo, atraso, condições) e por onde eles saem. Uma integração simples já viabiliza o piloto.",
  consentimento: "Revise a autorização de contato por WhatsApp da base em atraso. Contato com registro protege a instituição perante o CDC e a LGPD.",
};
const PASSOS_GERAIS = [
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

const fmtNum = (n) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));
const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(n);
const fmtMeses = (m) => {
  if (m < 1) return "menos de 1 mês";
  const v = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(m);
  return `${v} ${m < 2 ? "mês" : "meses"}`;
};

const fmtMesesInteiro = (m) => {
  const v = Math.max(1, Math.round(m));
  return `${fmtNum(v)} ${v === 1 ? "mês" : "meses"}`;
};

/* =========================================================
   UTILITÁRIOS DE FORMULÁRIO
   ========================================================= */
const mascaraFone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
function validar(f) {
  const e = {};
  if (f.nome.trim().length < 2) e.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Informe um e-mail válido, como nome@instituicao.com.br.";
  const dig = f.fone.replace(/\D/g, "");
  if (dig.length < 10 || dig.length > 11) e.fone = "Informe o WhatsApp com DDD.";
  if (f.instituicao.trim().length < 2) e.instituicao = "Informe o nome da instituição.";
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

function BotaoPrimario({ children, onClick, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto px-7 py-4 rounded-full font-semibold text-base focus:outline-none focus:ring-4 focus:ring-yellow-200"
      style={{ background: C.yellow, color: C.ink, opacity: disabled ? 0.6 : 1, minHeight: 52 }}
    >
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
      className="w-full text-left px-5 py-4 rounded-xl flex items-center justify-between gap-3 focus:outline-none focus:ring-4 focus:ring-yellow-200"
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
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{ width: 24, height: 24, border: `2px solid ${selecionada ? C.ink : C.line}`, background: selecionada ? C.ink : "transparent" }}
      >
        {selecionada && <Check size={14} color={C.yellow} strokeWidth={3} />}
      </span>
    </button>
  );
}

function Campo({ id, label, erro, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1" style={{ color: C.ink }}>{label}</label>
      <input
        id={id}
        {...props}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-4 focus:ring-yellow-200"
        style={{ border: `1.5px solid ${erro ? C.error : C.line}`, background: C.card, color: C.ink, minHeight: 48 }}
      />
      {erro && <p id={`${id}-erro`} className="text-sm mt-1" style={{ color: C.error }}>{erro}</p>}
    </div>
  );
}

function Barra({ rotulo, valor, largura, larguraFaixa, destaque, animar }) {
  return (
    <div>
      <div className="flex justify-between items-baseline gap-3 mb-2">
        <span className="text-sm" style={{ color: C.muted }}>{rotulo}</span>
        <span className="font-bold text-lg" style={{ color: C.ink }}>{valor}</span>
      </div>
      <div className="relative w-full rounded-full overflow-hidden" style={{ height: 14, background: C.line }}>
        {larguraFaixa !== undefined && (
          <div className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: animar ? `${larguraFaixa}%` : "0%", background: C.yellowSoft, transition: "width 1s cubic-bezier(.2,.8,.2,1) .15s" }} />
        )}
        <div className="absolute top-0 left-0 h-full rounded-full"
          style={{ width: animar ? `${largura}%` : "0%", background: destaque ? C.yellow : C.ink, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} />
      </div>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */
/* Props opcionais para integração:
   onLead(payload) substitui o webhook; respostasIniciais e etapaInicial abrem o
   diagnóstico já respondido; formInicial preenche o formulário (modo demonstração). */
export default function DiagnosticoRecuperacaoIA({ onLead, respostasIniciais, etapaInicial, formInicial } = {}) {
  const [etapa, setEtapa] = useState(etapaInicial || "intro"); // intro | quiz | previa | completo
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState(respostasIniciais || {});
  const [form, setForm] = useState({ nome: "", email: "", fone: "", instituicao: "", aceite: false });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [animar, setAnimar] = useState(false);
  const timer = useRef(null);
  const topo = useRef(null);

  const reduzido = useMemo(() => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  }, []);

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

  useEffect(() => {
    if (topo.current) topo.current.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
    if (etapa === "previa" || etapa === "completo") {
      setAnimar(false);
      const t = setTimeout(() => setAnimar(true), reduzido ? 0 : 60);
      return () => clearTimeout(t);
    }
  }, [etapa, reduzido]);

  const res = useMemo(() => calcular(resp), [resp]);
  const q = QUESTIONS[idx];

  const escolher = (valor) => {
    setResp((r) => ({ ...r, [q.id]: valor }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (idx < QUESTIONS.length - 1) setIdx(idx + 1);
      else setEtapa("previa");
    }, reduzido ? 0 : 240);
  };

  const voltar = () => {
    clearTimeout(timer.current);
    if (idx === 0) setEtapa("intro");
    else setIdx(idx - 1);
  };

  const reiniciar = () => {
    setResp({}); setIdx(0); setErros({}); setEtapa("intro");
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    const e = validar(form);
    setErros(e);
    if (Object.keys(e).length) return;
    setEnviando(true);
    const payload = {
      lead: { nome: form.nome.trim(), email: form.email.trim(), whatsapp: form.fone.replace(/\D/g, ""), instituicao: form.instituicao.trim() },
      respostas: resp,
      resultado: res && {
        nivel: res.nivel.nome, pontos: res.pontos, pontos_max: MAX_PONTOS,
        capacidade_atual_mes: Math.round(res.atual),
        capacidade_ia_mes: res.ia.map(Math.round),
        valor_adicional_mes: res.extra.map(Math.round),
      },
      origem: { pagina: typeof window !== "undefined" ? window.location.href : "", ...lerUTMs() },
      enviado_em: new Date().toISOString(),
    };
    try {
      if (onLead) {
        await onLead(payload);
      } else if (CONFIG.webhookUrl) {
        await fetch(CONFIG.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        console.info("[Diagnóstico] modo de teste, lead não enviado:", payload);
      }
    } catch (err) {
      console.error("[Diagnóstico] falha ao enviar lead:", err);
    } finally {
      setEnviando(false);
      setEtapa("completo"); // o usuário nunca fica travado por falha de rede
    }
  };

  const fase = q?.fase;
  const pergNaFase = QUESTIONS.filter((x) => x.fase === fase);
  const posNaFase = pergNaFase.findIndex((x) => x.id === q?.id) + 1;

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg, fontFamily: FONT, color: C.ink }}>
      <div ref={topo} className="max-w-xl mx-auto px-5 py-6 sm:py-10">
        <header className="flex items-center justify-between mb-8">
          <Marca />
          {etapa === "quiz" && (
            <span className="text-sm" style={{ color: C.muted }}>{idx + 1} de {QUESTIONS.length}</span>
          )}
        </header>

        {/* INTRO */}
        {etapa === "intro" && (
          <main>
            <h1 className="font-bold mb-4" style={{ fontSize: "clamp(1.9rem, 6vw, 2.6rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Qual seria o potencial da IA na sua operação de recuperação?
            </h1>
            <p className="text-lg mb-8" style={{ color: C.muted, lineHeight: 1.55 }}>
              Responda 10 perguntas sobre a sua operação de cobrança. A partir das respostas, você recebe uma estimativa e uma leitura dos principais pontos de preparação para um piloto.
            </p>

            <figure className="rounded-2xl p-5 mb-8" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <p className="text-base font-semibold mb-2" style={{ color: C.ink, lineHeight: 1.5 }}>
                No case Sicoob Crediauc, um colaborador acompanhado de um agente de IA renegociou, em 5 dias, cerca de metade do valor alcançado por 135 gerentes nos 75 dias anteriores.
              </p>
              <figcaption className="text-sm" style={{ color: C.muted, lineHeight: 1.55 }}>
                Considerando o período analisado, a experiência mostra um ganho relevante de capacidade operacional.
              </figcaption>
            </figure>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <BotaoPrimario onClick={() => { setIdx(0); setEtapa("quiz"); }}>Começar diagnóstico</BotaoPrimario>
              <span className="text-sm text-center sm:text-left" style={{ color: C.muted }}>Cerca de 2 minutos</span>
            </div>
          </main>
        )}

        {/* QUIZ */}
        {etapa === "quiz" && q && (
          <main>
            <div className="w-full rounded-full mb-6 overflow-hidden" style={{ height: 6, background: C.line }}
              role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={idx + 1}>
              <div className="h-full rounded-full"
                style={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%`, background: C.yellow, transition: reduzido ? "none" : "width .3s ease" }} />
            </div>

            <p className="text-sm font-semibold mb-2" style={{ color: C.muted }}>
              {fase}, {posNaFase} de {pergNaFase.length}
            </p>
            <h2 key={q.id} className="font-bold mb-2" style={{ fontSize: "clamp(1.4rem, 4.5vw, 1.75rem)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              {q.titulo}
            </h2>
            {q.ajuda && <p className="text-sm mb-2" style={{ color: C.muted }}>{q.ajuda}</p>}

            <div className="flex flex-col gap-3 mt-6" role="group" aria-label={q.titulo}>
              {q.opcoes.map((o) => (
                <Opcao key={String(o.value)} label={o.label} selecionada={resp[q.id] === o.value} onClick={() => escolher(o.value)} />
              ))}
            </div>

            <button type="button" onClick={voltar}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold px-2 py-2 rounded-md focus:outline-none focus:ring-4 focus:ring-yellow-200"
              style={{ color: C.muted }}>
              <ArrowLeft size={16} /> Voltar
            </button>
          </main>
        )}

        {/* PRÉVIA + FORMULÁRIO */}
        {etapa === "previa" && res && (
          <main>
            <p className="text-sm font-semibold mb-2" style={{ color: C.muted }}>Sua estimativa</p>
            <h2 className="font-bold mb-6" style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              {res.filaCoberta
                ? "Sua equipe já consegue acompanhar a fila atual. Nesse cenário, a oportunidade está em ganhar capacidade para negociações mais complexas."
                : `No ritmo atual, sua equipe levaria cerca de ${fmtMesesInteiro(res.mesesHoje)} para percorrer toda a carteira em atraso.`}
            </h2>

            <section className="rounded-2xl p-5 sm:p-6 mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <p className="text-sm mb-5" style={{ color: C.muted }}>Renegociações por mês</p>
              <div className="flex flex-col gap-5">
                <Barra rotulo="Hoje" valor={fmtNum(res.atual)} largura={(res.atual / res.ia[1]) * 100} animar={animar} />
                <Barra rotulo="Com agente de IA" valor={`${fmtNum(res.ia[0])} a ${fmtNum(res.ia[1])}`}
                  largura={(res.ia[0] / res.ia[1]) * 100} larguraFaixa={100} destaque animar={animar} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-5" style={{ borderTop: `1px solid ${C.line}` }}>
                <div>
                  <p className="text-sm mb-1" style={{ color: C.muted }}>Tempo para negociar a fila com IA</p>
                  <p className="font-bold text-lg">
                    {res.mesesIA[1] < 1 ? "menos de 1 mês" : `${fmtMeses(res.mesesIA[0])} a ${fmtMeses(res.mesesIA[1])}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: C.muted }}>Dívida renegociada a mais por mês</p>
                  <p className="font-bold text-lg">
                    {res.extra[1] > 0 ? `${fmtBRL(res.extra[0])} a ${fmtBRL(res.extra[1])}` : "Sem fila represada"}
                  </p>
                </div>
              </div>
            </section>

            <p className="text-xs mb-8" style={{ color: C.muted, lineHeight: 1.5 }}>
              Faixa conservadora, entre {res.nivel.mult[0]} e {res.nivel.mult[1]} vezes a capacidade atual, calibrada pela prontidão da sua operação. Valores se referem ao saldo das dívidas renegociadas, não ao valor recebido.
            </p>

            <section className="rounded-2xl p-5 sm:p-6" style={{ background: C.ink, color: "#FFFFFF" }}>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} color={C.yellow} />
                <span className="text-sm font-semibold" style={{ color: C.yellow }}>Nível de prontidão: {res.nivel.nome}</span>
              </div>
              <p className="text-base mb-6" style={{ color: "#FFFFFF", lineHeight: 1.55 }}>
                Acesse o diagnóstico completo para ver sua avaliação nas 5 dimensões e os próximos passos sugeridos para estruturar um agente de IA na operação.
              </p>

              <form onSubmit={enviar} noValidate className="flex flex-col gap-4 rounded-xl p-4 sm:p-5" style={{ background: C.bg, color: C.ink }}>
                <Campo id="nome" label="Nome" autoComplete="name" placeholder="Ana Souza"
                  value={form.nome} erro={erros.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                <Campo id="email" label="E-mail de trabalho" type="email" autoComplete="email" inputMode="email" placeholder="ana@cooperativa.com.br"
                  value={form.email} erro={erros.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Campo id="fone" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(51) 99999-9999"
                  value={form.fone} erro={erros.fone} onChange={(e) => setForm({ ...form, fone: mascaraFone(e.target.value) })} />
                <Campo id="instituicao" label="Instituição" autoComplete="organization" placeholder="Nome da cooperativa ou banco"
                  value={form.instituicao} erro={erros.instituicao} onChange={(e) => setForm({ ...form, instituicao: e.target.value })} />

                <div>
                  <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ lineHeight: 1.45 }}>
                    <input type="checkbox" checked={form.aceite} onChange={(e) => setForm({ ...form, aceite: e.target.checked })}
                      className="mt-1 flex-shrink-0" style={{ width: 18, height: 18, accentColor: C.ink }} />
                    <span>Autorizo a Ubots a usar estes dados para enviar o diagnóstico e entrar em contato sobre ele.</span>
                  </label>
                  {erros.aceite && <p className="text-sm mt-1" style={{ color: C.error }}>{erros.aceite}</p>}
                </div>

                <BotaoPrimario type="submit" disabled={enviando}>
                  {enviando ? "Preparando seu diagnóstico..." : "Ver diagnóstico completo"}
                </BotaoPrimario>
                <p className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                  <ShieldCheck size={14} /> Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.
                </p>
              </form>
            </section>

            <button type="button" onClick={() => { setIdx(QUESTIONS.length - 1); setEtapa("quiz"); }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold px-2 py-2 rounded-md focus:outline-none focus:ring-4 focus:ring-yellow-200"
              style={{ color: C.muted }}>
              <ArrowLeft size={16} /> Revisar respostas
            </button>
          </main>
        )}

        {/* DIAGNÓSTICO COMPLETO */}
        {etapa === "completo" && res && (
          <main>
            <p className="text-sm font-semibold mb-2" style={{ color: C.muted }}>
              Diagnóstico de {form.instituicao.trim() || "sua instituição"}
            </p>
            <h2 className="font-bold mb-3" style={{ fontSize: "clamp(1.7rem, 5.5vw, 2.3rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              {res.nivel.nome}
            </h2>
            <p className="text-lg mb-8" style={{ color: C.muted, lineHeight: 1.55 }}>{res.nivel.resumo}</p>

            <section className="rounded-2xl p-5 sm:p-6 mb-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex justify-between items-baseline mb-5">
                <p className="text-sm" style={{ color: C.muted }}>Prontidão por dimensão</p>
                <p className="font-bold">{res.pontos} de {MAX_PONTOS}</p>
              </div>
              <div className="flex flex-col gap-5">
                {res.dims.map((d) => (
                  <Barra key={d.nome} rotulo={d.nome} valor={`${d.pontos}/${d.max}`}
                    largura={Math.max((d.pontos / d.max) * 100, 3)} destaque={d.pontos >= 2} animar={animar} />
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h3 className="font-bold text-xl mb-4" style={{ letterSpacing: "-0.01em" }}>Próximos passos</h3>
              <ol className="flex flex-col gap-4">
                {res.passos.map((p, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm"
                      style={{ width: 32, height: 32, background: C.yellow, color: C.ink }}>{i + 1}</span>
                    <p className="text-base pt-1" style={{ lineHeight: 1.55 }}>{p}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl p-5 sm:p-6" style={{ background: C.yellowSoft, border: `1px solid ${C.yellow}` }}>
              <h3 className="font-bold text-lg mb-2">Quer aprofundar essa análise com os dados da sua carteira?</h3>
              <p className="text-sm mb-5" style={{ lineHeight: 1.55 }}>
                O time da Ubots pode revisar o diagnóstico com você e avaliar um formato de piloto adequado à sua operação.
              </p>
              <a href={CONFIG.ctaUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block px-7 py-4 rounded-full font-semibold text-base focus:outline-none focus:ring-4 focus:ring-yellow-200"
                style={{ background: C.ink, color: "#FFFFFF" }}>
                Conversar com um especialista
              </a>
            </section>

            <button type="button" onClick={reiniciar}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold px-2 py-2 rounded-md focus:outline-none focus:ring-4 focus:ring-yellow-200"
              style={{ color: C.muted }}>
              <RotateCcw size={16} /> Refazer diagnóstico
            </button>
          </main>
        )}
      </div>
    </div>
  );
}
