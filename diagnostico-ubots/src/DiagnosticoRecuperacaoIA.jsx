import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Info, ListChecks, Loader2, ShieldCheck } from "lucide-react";
import { C, CONFIG, FONT, MAX_PONTOS, QUESTIONS, calcular, fmtNum } from "./diagnostico/modelo.js";
import { aprofundar } from "./diagnostico/leitura.js";
import { ajudaPara, motivoPara, perfil, tituloPara } from "./diagnostico/perfil.js";
import { BotaoPrimario, BotaoTexto, Campo, Marca, Opcao } from "./diagnostico/ui.jsx";
import Resultado from "./diagnostico/Resultado.jsx";

/* O painel e o modo demonstração importam estes dois daqui. */
export { QUESTIONS, calcular };

const CHAVE_PROGRESSO = "ubots_diag_progresso";
const FORM_VAZIO = { nome: "", email: "", fone: "", instituicao: "", aceite: false };
const WEBMAIL = /@(gmail|googlemail|hotmail|outlook|live|msn|yahoo|icloud|me|bol|uol|terra|ig|protonmail)\.[a-z.]+$/i;
const ANALISE = (p) => [`Calculando a capacidade atual ${p.daInst}`, "Aplicando a faixa do nível de prontidão", "Montando o plano de piloto"];

/* =========================================================
   FORMULÁRIO
   ========================================================= */
const mascaraFone = (v) => {
  let d = v.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2); // colado com o código do país
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

function validar(f, tipo) {
  const e = {};
  const campo = perfil(tipo).campoNome;
  if (f.nome.trim().length < 2) e.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Informe um e-mail válido, como nome@instituicao.com.br.";
  const dig = f.fone.replace(/\D/g, "");
  if (dig.length < 10 || dig.length > 11) e.fone = "Informe o WhatsApp com DDD.";
  if (f.instituicao.trim().length < 2) e.instituicao = `Informe o ${campo.charAt(0).toLowerCase()}${campo.slice(1)}.`;
  if (!f.aceite) e.aceite = "Marque a autorização para ver o diagnóstico.";
  return e;
}

/* Sugere o nome da instituição a partir do domínio do e-mail (ana@banco-exemplo.com.br → Banco Exemplo). */
const sugerirInstituicao = (email) => {
  const m = email.trim().toLowerCase().match(/^[^\s@]+@([a-z0-9-]+)\.[a-z.]{2,}$/);
  if (!m || WEBMAIL.test(email.trim())) return null;
  return m[1].split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
};

const lerUTMs = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    const o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => { if (p.get(k)) o[k] = p.get(k); });
    return o;
  } catch { return {}; }
};

const lerProgresso = () => {
  try { return JSON.parse(sessionStorage.getItem(CHAVE_PROGRESSO)) || null; } catch { return null; }
};
const gravarProgresso = (v) => {
  try { v ? sessionStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(v)) : sessionStorage.removeItem(CHAVE_PROGRESSO); } catch { /* sem armazenamento */ }
};

const movimentoReduzido = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

/* =========================================================
   ETAPAS
   ========================================================= */
function Abertura({ q, resposta, onEscolher, tituloRef, revisando, onVoltarFormulario }) {
  return (
    <main className="entra grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:items-start">
      <div>
        <h1 ref={tituloRef} tabIndex={-1} className="font-bold mb-4 outline-none" style={{ fontSize: "clamp(1.9rem, 6vw, 2.6rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Qual seria o potencial da IA na sua operação de recuperação?
        </h1>
        <p className="text-lg" style={{ color: C.muted, lineHeight: 1.55 }}>
          Responda 10 perguntas sobre a sua operação de cobrança. Ao final, você informa seus dados e recebe o diagnóstico completo na hora.
        </p>
        <figure className="hidden lg:block rounded-2xl p-5 mt-8" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <Destaque />
        </figure>
      </div>

      <section aria-labelledby="pergunta-tipo" className="rounded-2xl p-5 sm:p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <h2 id="pergunta-tipo" className="font-bold text-lg mb-4" style={{ letterSpacing: "-0.01em" }}>
          Para começar, que tipo de instituição você representa?
        </h2>
        <div className="flex flex-col gap-3" role="group" aria-labelledby="pergunta-tipo">
          {q.opcoes.map((o, i) => (
            <Opcao key={o.value} numero={i + 1} label={o.label} selecionada={resposta === o.value} onClick={() => onEscolher(o.value)} />
          ))}
        </div>
        {revisando ? (
          <BotaoTexto onClick={onVoltarFormulario} className="mt-4"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao formulário</BotaoTexto>
        ) : (
          <p className="text-sm mt-4" style={{ color: C.muted }}>10 perguntas · cerca de 2 minutos · sem custo</p>
        )}
      </section>

      <figure className="lg:hidden rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <Destaque />
      </figure>
    </main>
  );
}

function Destaque() {
  return (
    <>
      <p className="text-base font-semibold mb-2" style={{ color: C.ink, lineHeight: 1.5 }}>
        No case Sicoob Crediauc, um colaborador acompanhado de um agente de IA renegociou, em 5 dias, cerca de metade do valor alcançado por 135 gerentes nos 75 dias anteriores.
      </p>
      <figcaption className="text-sm" style={{ color: C.muted, lineHeight: 1.55 }}>
        Considerando o período analisado, a experiência mostra um ganho relevante de capacidade operacional.
      </figcaption>
    </>
  );
}

function Pergunta({ q, idx, resp, revisando, onEscolher, onVoltar, onAvancar, onVoltarFormulario, tituloRef }) {
  const fase = q.fase;
  const daFase = QUESTIONS.filter((x) => x.fase === fase);
  const pos = daFase.findIndex((x) => x.id === q.id) + 1;
  const parte = fase === QUESTIONS[0].fase ? 1 : 2;
  const p = perfil(resp.tipo);
  const ajuda = ajudaPara(q, resp.tipo);
  const motivo = motivoPara(q, resp.tipo);
  const respondida = resp[q.id] !== undefined;
  const primeiraProntidao = q.id === QUESTIONS.find((x) => x.dim).id;
  const atual = resp.pessoas !== undefined && resp.ritmo !== undefined ? resp.pessoas * resp.ritmo * CONFIG.diasUteisMes : null;

  return (
    <main>
      <div className="flex gap-1.5 mb-6" aria-hidden="true">
        {QUESTIONS.map((x, i) => (
          <span key={x.id} className="h-1.5 flex-1 rounded-full"
            style={{ background: i <= idx ? C.yellow : C.line, transition: "background .3s ease", marginRight: i === 4 ? 6 : 0 }} />
        ))}
      </div>

      {primeiraProntidao && !revisando && atual !== null && (
        <div className="entra flex gap-3 rounded-xl p-4 mb-6 text-sm" style={{ background: C.yellowSoft, border: `1px solid ${C.yellow}`, lineHeight: 1.5 }}>
          <Check size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p id="parte1-resumo">
            <span className="font-semibold">Parte 1 concluída.</span>{" "}
            {`Pelas suas respostas, a equipe ${p.daInst} tem capacidade para cerca de ${fmtNum(atual)} renegociações por mês. Agora, 5 perguntas sobre a prontidão para um agente de IA.`}
          </p>
        </div>
      )}

      <div key={q.id} className="entra">
        <p id="parte-rotulo" className="text-sm font-semibold mb-2" style={{ color: C.muted }}>
          {`Parte ${parte} de 2 · ${fase}, ${pos} de ${daFase.length}`}
        </p>
        <h1 ref={tituloRef} tabIndex={-1} className="font-bold mb-2 outline-none"
          aria-describedby={primeiraProntidao && !revisando && atual !== null ? "parte-rotulo parte1-resumo" : "parte-rotulo"} style={{ fontSize: "clamp(1.4rem, 4.5vw, 1.75rem)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          {tituloPara(q, resp.tipo)}
        </h1>
        {ajuda && <p className="text-sm mb-1" style={{ color: C.muted }}>{ajuda}</p>}
        {motivo && (
          <p className="flex items-start gap-1.5 text-sm" style={{ color: C.muted }}>
            <Info size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" /> {motivo}
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6" role="group" aria-label={tituloPara(q, resp.tipo)}>
          {q.opcoes.map((o, i) => (
            <Opcao key={String(o.value)} numero={i + 1} label={o.label} selecionada={resp[q.id] === o.value} onClick={() => onEscolher(o.value)} />
          ))}
        </div>
        <p className="hidden sm:block text-xs mt-3" style={{ color: C.muted }}>{`Atalho: teclas 1 a ${q.opcoes.length}.`}</p>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        {revisando ? (
          <BotaoTexto onClick={onVoltarFormulario}><ArrowLeft size={16} aria-hidden="true" /> Voltar ao formulário</BotaoTexto>
        ) : (
          <BotaoTexto onClick={onVoltar}><ArrowLeft size={16} aria-hidden="true" /> Voltar</BotaoTexto>
        )}
        {respondida && !revisando && (
          <BotaoTexto onClick={onAvancar} className="!text-tinta">Avançar <ArrowRight size={16} aria-hidden="true" /></BotaoTexto>
        )}
      </div>
    </main>
  );
}

function Captura({ resp, form, setForm, erros, tocar, enviar, onAlterar, tituloRef, camposRef, respostasAbertas, setRespostasAbertas }) {
  const p = perfil(resp.tipo);
  const sugestao = !form.instituicao.trim() ? sugerirInstituicao(form.email) : null;
  const webmail = WEBMAIL.test(form.email.trim());
  const itens = [
    "Renegociações por mês, hoje e com um agente de IA",
    "Tempo para percorrer a carteira em atraso e o saldo envolvido",
    "A leitura de cada uma das 5 dimensões de prontidão",
    "O que falta para o próximo nível",
    `Um plano de piloto para ${p.inst}, com base no case Sicoob Crediauc`,
  ];

  return (
    <main className="entra grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:items-start">
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: C.muted }}>Diagnóstico concluído</p>
        <h1 ref={tituloRef} tabIndex={-1} className="font-bold outline-none" style={{ fontSize: "clamp(1.7rem, 5.5vw, 2.3rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          {`O diagnóstico ${p.daInst} está pronto.`}
        </h1>
        <p className="text-lg mt-3 mb-5" style={{ color: C.muted, lineHeight: 1.55 }}>Informe seus dados para ver o resultado completo nesta tela:</p>
        <ul className="flex flex-col gap-3 mb-6">
          {itens.map((t) => (
            <li key={t} className="flex gap-3 text-base" style={{ lineHeight: 1.45 }}>
              <span className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5" style={{ width: 22, height: 22, background: C.yellow }}>
                <Check size={13} strokeWidth={3} aria-hidden="true" />
              </span>
              {t}
            </li>
          ))}
        </ul>

        <details open={respostasAbertas} onToggle={(e) => setRespostasAbertas(e.currentTarget.open)}
          className="rounded-2xl px-5 py-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <summary className="flex cursor-pointer items-center gap-2 font-semibold text-sm rounded-md focus:outline-none focus:ring-4 focus:ring-yellow-200">
            <ListChecks size={16} aria-hidden="true" /> Suas respostas (10)
            <ChevronDown size={16} aria-hidden="true" className="ml-auto transition-transform" />
          </summary>
          <dl className="mt-3 flex flex-col">
            {QUESTIONS.map((q, i) => (
              <div key={q.id} className="flex items-start justify-between gap-3 py-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
                <div className="min-w-0">
                  <dt className="text-xs" style={{ color: C.muted }}>{q.curto}</dt>
                  <dd className="text-sm font-semibold">{q.opcoes.find((o) => o.value === resp[q.id])?.label}</dd>
                </div>
                <button type="button" onClick={() => onAlterar(i)} aria-label={`Alterar: ${q.curto}`} data-alterar={i}
                  className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-semibold underline underline-offset-2 focus:outline-none focus:ring-4 focus:ring-yellow-200">
                  Alterar
                </button>
              </div>
            ))}
          </dl>
        </details>
      </div>

      <section aria-labelledby="dados-titulo" className="rounded-2xl p-5 sm:p-6" style={{ background: C.ink }}>
        <h2 id="dados-titulo" className="sr-only">Seus dados</h2>
        <form onSubmit={enviar} noValidate data-form="lead" data-tipo={resp.tipo}
          className="flex flex-col gap-4 rounded-xl p-4 sm:p-5" style={{ background: C.bg, color: C.ink }}>
          <Campo id="nome" label="Nome" autoComplete="name" placeholder="Ana Souza" ref={(el) => { camposRef.current.nome = el; }}
            value={form.nome} erro={erros.nome} onBlur={() => tocar("nome")} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Campo id="email" label="E-mail de trabalho" type="email" autoComplete="email" inputMode="email" placeholder={p.exemploEmail}
            ref={(el) => { camposRef.current.email = el; }}
            value={form.email} erro={erros.email} onBlur={() => tocar("email")} onChange={(e) => setForm({ ...form, email: e.target.value })}
            dica={!erros.email && webmail ? `Se puder, use o e-mail ${p.daInst}. Assim o especialista identifica a sua operação.` : undefined} />
          <Campo id="fone" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(51) 99999-9999"
            ref={(el) => { camposRef.current.fone = el; }}
            value={form.fone} erro={erros.fone} onBlur={() => tocar("fone")} onChange={(e) => setForm({ ...form, fone: mascaraFone(e.target.value) })} />
          <Campo id="instituicao" label={p.campoNome} autoComplete="organization" ref={(el) => { camposRef.current.instituicao = el; }}
            value={form.instituicao} erro={erros.instituicao} onBlur={() => tocar("instituicao")} onChange={(e) => setForm({ ...form, instituicao: e.target.value })}>
            {sugestao && (
              <button type="button" onClick={() => { setForm({ ...form, instituicao: sugestao }); camposRef.current.instituicao?.focus(); }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-200"
                style={{ background: C.yellowSoft, border: `1px solid ${C.yellow}` }}>
                {`Usar “${sugestao}”`}
              </button>
            )}
          </Campo>

          <div>
            <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ lineHeight: 1.45 }}>
              <input type="checkbox" checked={form.aceite} ref={(el) => { camposRef.current.aceite = el; }}
                onChange={(e) => setForm({ ...form, aceite: e.target.checked })}
                aria-invalid={!!erros.aceite} aria-describedby={erros.aceite ? "aceite-erro" : undefined}
                className="mt-1 flex-shrink-0" style={{ width: 18, height: 18, accentColor: C.ink }} />
              <span>Autorizo a Ubots a entrar em contato sobre este diagnóstico.</span>
            </label>
            {erros.aceite && <p id="aceite-erro" className="text-sm mt-1" style={{ color: C.error }}>{erros.aceite}</p>}
          </div>

          <BotaoPrimario type="submit">Ver diagnóstico completo <ArrowRight size={18} aria-hidden="true" /></BotaoPrimario>
          <p className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
            <ShieldCheck size={14} className="flex-shrink-0" aria-hidden="true" /> Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.
          </p>
        </form>
      </section>
    </main>
  );
}

function Analise({ resp, tituloRef }) {
  const linhas = ANALISE(perfil(resp.tipo));
  const [feitas, setFeitas] = useState(() => (movimentoReduzido() ? linhas.length : 0));
  useEffect(() => {
    if (feitas >= linhas.length) return;
    const t = setTimeout(() => setFeitas((n) => n + 1), 380);
    return () => clearTimeout(t);
  }, [feitas, linhas.length]);

  return (
    <main className="entra max-w-md">
      <h1 ref={tituloRef} tabIndex={-1} className="font-bold text-2xl mb-6 outline-none" style={{ letterSpacing: "-0.02em" }}>
        Preparando seu diagnóstico...
      </h1>
      <ul className="flex flex-col gap-4" aria-live="polite">
        {linhas.map((l, i) => (
          <li key={l} className="flex items-center gap-3 text-base" style={{ color: i < feitas ? C.ink : C.muted }}>
            <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: i < feitas ? C.yellow : C.line }}>
              {i < feitas ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : i === feitas ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
            </span>
            {l}
          </li>
        ))}
      </ul>
    </main>
  );
}

/* =========================================================
   APP
   Props opcionais para integração:
   onLead(payload) substitui o webhook e pode devolver { id };
   onInteresse(id) registra o pedido de conversa;
   respostasIniciais, etapaInicial e formInicial abrem o diagnóstico já respondido (modo demonstração);
   persistir guarda o progresso na sessão do navegador.
   ========================================================= */
export default function DiagnosticoRecuperacaoIA({
  onLead, onInteresse, onReiniciar, respostasIniciais, etapaInicial, formInicial, persistir = true,
} = {}) {
  const salvo = useMemo(() => (persistir && !respostasIniciais && !etapaInicial ? lerProgresso() : null), [persistir, respostasIniciais, etapaInicial]);

  const [etapa, setEtapa] = useState(salvo?.etapa || etapaInicial || "intro"); // intro | quiz | captura | analise | resultado
  const [idx, setIdx] = useState(salvo?.idx ?? 1);
  const [resp, setResp] = useState(salvo?.resp || respostasIniciais || {});
  const [form, setForm] = useState(salvo?.form ? { ...FORM_VAZIO, ...salvo.form, aceite: false } : FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [tocados, setTocados] = useState({});
  const [revisando, setRevisando] = useState(!!salvo?.revisando);
  const [lead, setLead] = useState(salvo?.lead || null);
  const [pedido, setPedido] = useState(salvo?.pedido || null); // null | registrado | pagina | falhou
  const [respostasAbertas, setRespostasAbertas] = useState(false);
  const [voltarPara, setVoltarPara] = useState(null); // índice do "Alterar" de origem
  const timer = useRef(null);
  const tituloRef = useRef(null);
  const camposRef = useRef({});
  const anterior = useRef({ etapa, idx });
  const reduzido = useMemo(movimentoReduzido, []);

  const a = useMemo(() => (calcular(resp) ? aprofundar(resp) : null), [resp]);

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

  /* Guarda o progresso na sessão: um recarregamento não perde as respostas nem o resultado. */
  useEffect(() => {
    if (!persistir || respostasIniciais || etapaInicial) return;
    if (etapa === "intro" && !Object.keys(resp).length) { gravarProgresso(null); return; }
    const { aceite, ...dadosForm } = form; // a autorização é marcada de novo
    gravarProgresso({
      etapa: etapa === "analise" ? (lead ? "resultado" : "captura") : etapa,
      idx, resp, lead, pedido, revisando, form: etapa === "resultado" ? null : dadosForm,
    });
  }, [persistir, respostasIniciais, etapaInicial, etapa, idx, resp, lead, pedido, revisando, form]);

  /* A cada troca de pergunta ou etapa: volta ao topo e leva o foco ao título.
     Ao voltar de uma revisão, devolve o foco ao "Alterar" de origem. */
  useEffect(() => {
    if (anterior.current.etapa === etapa && anterior.current.idx === idx) return;
    anterior.current = { etapa, idx };
    if (etapa === "captura" && voltarPara !== null) {
      const botao = document.querySelector(`[data-alterar="${voltarPara}"]`);
      setVoltarPara(null);
      if (botao) {
        botao.scrollIntoView({ behavior: reduzido ? "instant" : "smooth", block: "center" });
        botao.focus({ preventScroll: true });
        return;
      }
    }
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: reduzido ? "instant" : "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [etapa, idx, reduzido, voltarPara]);

  /* Se a etapa salva exigir um resultado que não pode ser calculado, recomeça. */
  useEffect(() => {
    if ((etapa === "captura" || etapa === "resultado") && !a) setEtapa("intro");
    if (etapa === "resultado" && !lead) setEtapa("captura");
  }, [etapa, a, lead]);

  const voltarAoFormulario = () => { setRevisando(false); setRespostasAbertas(true); setEtapa("captura"); };

  const avancarPara = useCallback((proximo) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(proximo, reduzido ? 0 : 240);
  }, [reduzido]);

  const escolherTipo = (valor) => {
    setResp((r) => ({ ...r, tipo: valor }));
    if (revisando) { avancarPara(voltarAoFormulario); return; }
    avancarPara(() => { setIdx(1); setEtapa("quiz"); });
  };

  const escolher = (valor) => {
    const q = QUESTIONS[idx];
    setResp((r) => ({ ...r, [q.id]: valor }));
    if (revisando) { avancarPara(voltarAoFormulario); return; }
    avancarPara(() => { if (idx < QUESTIONS.length - 1) setIdx(idx + 1); else setEtapa("captura"); });
  };

  const voltar = () => {
    clearTimeout(timer.current);
    if (idx <= 1) setEtapa("intro");
    else setIdx(idx - 1);
  };

  const avancar = () => {
    if (idx < QUESTIONS.length - 1) setIdx(idx + 1);
    else setEtapa("captura");
  };

  const alterar = (i) => {
    setVoltarPara(i);
    setRevisando(true);
    if (i === 0) { setEtapa("intro"); return; }
    setIdx(i); setEtapa("quiz");
  };

  /* Atalhos: teclas 1 a 5 escolhem a opção (fora de campos de texto). */
  useEffect(() => {
    if (etapa !== "intro" && etapa !== "quiz") return;
    const aoTeclar = (e) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const n = Number(e.key);
      const q = etapa === "intro" ? QUESTIONS[0] : QUESTIONS[idx];
      if (!Number.isInteger(n) || n < 1 || n > q.opcoes.length) return;
      e.preventDefault();
      const valor = q.opcoes[n - 1].value;
      if (etapa === "intro") escolherTipo(valor); else escolher(valor);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  const tocar = (campo) => {
    setTocados((t) => ({ ...t, [campo]: true }));
    const e = validar(form, resp.tipo);
    setErros((atual) => ({ ...atual, [campo]: e[campo] }));
  };

  /* Depois de tocado, o erro some assim que o dado é corrigido. */
  useEffect(() => {
    const e = validar(form, resp.tipo);
    setErros((atual) => {
      const novo = {};
      for (const k of Object.keys(atual)) if (atual[k] && e[k] && (tocados[k] || k === "aceite")) novo[k] = e[k];
      return novo;
    });
  }, [form, tocados, resp.tipo]);

  const enviar = async (ev) => {
    ev.preventDefault();
    const e = validar(form, resp.tipo);
    setErros(e);
    setTocados({ nome: true, email: true, fone: true, instituicao: true, aceite: true });
    const primeiro = ["nome", "email", "fone", "instituicao", "aceite"].find((k) => e[k]);
    if (primeiro) { camposRef.current[primeiro]?.focus(); return; }

    const res = a.res;
    const dados = { nome: form.nome.trim(), email: form.email.trim(), whatsapp: form.fone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, ""), instituicao: form.instituicao.trim() };
    const payload = {
      versao: 2,
      lead: dados,
      respostas: resp,
      resultado: {
        nivel: res.nivel.nome, pontos: res.pontos, pontos_max: MAX_PONTOS,
        capacidade_atual_mes: Math.round(res.atual),
        capacidade_ia_mes: res.ia.map(Math.round),
        valor_adicional_mes: res.extra.map(Math.round),
        saldo_atraso: resp.contratos * resp.ticket,
        meses_fila_hoje: res.filaCoberta ? null : Math.round(res.mesesHoje * 10) / 10,
        meses_fila_ia: res.mesesIA.map((m) => Math.round(m * 10) / 10),
        ponto_critico: a.pontoCritico?.nome ?? null,
        leituras: a.leituras,
      },
      origem: { pagina: typeof window !== "undefined" ? window.location.href : "", ...lerUTMs() },
      enviado_em: new Date().toISOString(),
    };

    setEtapa("analise");
    const minimo = new Promise((r) => setTimeout(r, reduzido ? 0 : 1300));
    let id = null;
    try {
      if (onLead) {
        id = (await onLead(payload))?.id ?? null;
      } else if (CONFIG.webhookUrl) {
        await fetch(CONFIG.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        console.info("[Diagnóstico] modo de teste, lead não enviado:", payload);
      }
    } catch (err) {
      console.error("[Diagnóstico] falha ao enviar lead:", err);
    }
    setLead({ ...dados, id, enviado_em: payload.enviado_em }); // o usuário nunca fica travado por falha de rede
    setPedido(null);
    await minimo;
    setEtapa("resultado");
  };

  /* O pedido só aparece como registrado quando foi de fato gravado ou enviado. */
  const registraPedido = !!onInteresse || !!CONFIG.webhookUrl;
  const pedirConversa = async () => {
    let ok = false;
    try {
      if (onInteresse) {
        ok = (await onInteresse(lead?.id ?? null)) !== false;
      } else if (CONFIG.webhookUrl) {
        const r = await fetch(CONFIG.webhookUrl, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "interesse", lead, enviado_em: new Date().toISOString() }),
        });
        ok = r.ok;
      }
    } catch (err) {
      console.error("[Diagnóstico] falha ao registrar o pedido de conversa:", err);
    }
    if (ok) { setPedido("registrado"); return; }
    window.open(CONFIG.ctaUrl, "_blank", "noopener");
    setPedido(registraPedido ? "falhou" : "pagina");
  };

  const reiniciar = () => {
    clearTimeout(timer.current);
    if (persistir) gravarProgresso(null);
    setResp({}); setIdx(1); setErros({}); setTocados({}); setLead(null); setPedido(null); setRevisando(false);
    setEtapa("intro");
    onReiniciar?.();
  };

  const largura = etapa === "quiz" || etapa === "analise" ? "max-w-xl" : etapa === "resultado" ? "max-w-3xl" : "max-w-5xl";

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg, fontFamily: FONT, color: C.ink }}>
      <div className={`${largura} mx-auto px-5 py-6 sm:py-10`}>
        <header className="flex items-center justify-between mb-8">
          <Marca />
          {etapa === "quiz" && (
            <span className="text-sm" style={{ color: C.muted }} aria-live="polite">{`Pergunta ${idx + 1} de ${QUESTIONS.length}`}</span>
          )}
        </header>

        {etapa === "intro" && (
          <Abertura q={QUESTIONS[0]} resposta={resp.tipo} onEscolher={escolherTipo} tituloRef={tituloRef}
            revisando={revisando} onVoltarFormulario={voltarAoFormulario} />
        )}

        {etapa === "quiz" && QUESTIONS[idx] && (
          <Pergunta q={QUESTIONS[idx]} idx={idx} resp={resp} revisando={revisando} tituloRef={tituloRef}
            onEscolher={escolher} onVoltar={voltar} onAvancar={avancar}
            onVoltarFormulario={voltarAoFormulario} />
        )}

        {etapa === "captura" && a && (
          <Captura resp={resp} form={form} setForm={setForm} erros={erros} tocar={tocar} enviar={enviar}
            onAlterar={alterar} tituloRef={tituloRef} camposRef={camposRef}
            respostasAbertas={respostasAbertas} setRespostasAbertas={setRespostasAbertas} />
        )}

        {etapa === "analise" && <Analise resp={resp} tituloRef={tituloRef} />}

        {etapa === "resultado" && a && lead && (
          <Resultado a={a} resp={resp} lead={lead} enviadoEm={lead.enviado_em} pedido={pedido} registraPedido={registraPedido}
            onPedirConversa={pedirConversa} onRefazer={reiniciar} />
        )}
      </div>
    </div>
  );
}
