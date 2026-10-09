import { ArrowLeft, ArrowRight, Check, FlaskConical, Info, LoaderCircle, MessageCircle, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import { BotaoPrimario, BotaoTexto, Campo, Opcao, SeloNivel, focoPadrao } from "../components/ui";
import { analisar, capacidadeMensal, formularioVazio, lerUtms, validarFormulario } from "../lib/calculo";
import { config, cores } from "../lib/config";
import { aplicarTermos, cenariosDemo, dimensoes, formularioDemo, perguntas, pontosMax, termos } from "../lib/dados";
import { mascaraFone } from "../lib/formatar";
import { atualizarLead, salvarLead } from "../lib/leads";
import { reduzirMovimento, usePageTitle } from "../lib/util";
import Resultado from "./Resultado";

const titulo = { fontSize: "clamp(1.75rem, 5.5vw, 2.5rem)", lineHeight: 1.1, letterSpacing: "-0.03em" };
const ORDEM_CAMPOS = ["nome", "email", "fone", "instituicao", "aceite"];

/** Fluxo completo: intro → perguntas → captura de dados → resultado. */
function Fluxo({ onLead, onInteresse, onReiniciar, respostasIniciais, etapaInicial, formInicial }) {
  const [etapa, setEtapa] = useState(etapaInicial || "intro");
  const [indice, setIndice] = useState(1); // índice da pergunta atual (0 = tipo, respondido na intro)
  const [respostas, setRespostas] = useState(respostasIniciais || {});
  const [form, setForm] = useState(formularioVazio);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [lead, setLead] = useState(null);
  const [pedido, setPedido] = useState(null); // null | "enviando" | "registrado"
  const [animar, setAnimar] = useState(false);
  const temporizador = useRef(null);
  const tituloRef = useRef(null);
  const camposRef = useRef({});
  const posicaoAnterior = useRef({ etapa, indice });
  const reduzido = useMemo(reduzirMovimento, []);
  const analise = useMemo(() => analisar(respostas), [respostas]);
  const termosTipo = termos(respostas.tipo);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  useEffect(() => {
    if (formInicial) {
      setForm((f) => ({ ...f, ...formInicial }));
      setErros({});
    }
  }, [formInicial]);

  // Ao mudar de tela/pergunta: volta ao topo e move o foco para o título.
  useEffect(() => {
    const anterior = posicaoAnterior.current;
    if (anterior.etapa !== etapa || anterior.indice !== indice) {
      posicaoAnterior.current = { etapa, indice };
      window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
      tituloRef.current?.focus({ preventScroll: true });
    }
  }, [etapa, indice, reduzido]);

  // Anima as barras do resultado logo após a tela aparecer.
  useEffect(() => {
    if (etapa !== "resultado") return;
    setAnimar(false);
    const t = setTimeout(() => setAnimar(true), reduzido ? 0 : 60);
    return () => clearTimeout(t);
  }, [etapa, reduzido]);

  const responder = (pergunta, valor) => {
    setRespostas((r) => ({ ...r, [pergunta.id]: valor }));
    const posicao = perguntas.indexOf(pergunta);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      if (posicao < perguntas.length - 1) {
        setIndice(posicao + 1);
        setEtapa("quiz");
      } else {
        setEtapa("captura");
      }
    }, 280);
  };

  const voltar = () => {
    clearTimeout(temporizador.current);
    if (indice <= 1) setEtapa("intro");
    else setIndice(indice - 1);
  };

  const refazer = () => {
    setRespostas({});
    setIndice(1);
    setErros({});
    setLead(null);
    setPedido(null);
    setEtapa("intro");
    onReiniciar?.();
  };

  const alterarCampo = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const novosErros = validarFormulario(form, termosTipo.campo);
    setErros(novosErros);
    const primeiroErro = ORDEM_CAMPOS.find((c) => novosErros[c]);
    if (primeiroErro) {
      camposRef.current[primeiroErro]?.focus();
      return;
    }
    setEnviando(true);
    const res = analise.res;
    const contato = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      whatsapp: form.fone.replace(/\D/g, ""),
      instituicao: form.instituicao.trim(),
    };
    const payload = {
      lead: contato,
      respostas,
      resultado: {
        nivel: res.nivel.nome,
        pontos: res.pontos,
        pontos_max: pontosMax,
        capacidade_atual_mes: Math.round(res.atual),
        capacidade_ia_mes: res.ia.map(Math.round),
        valor_adicional_mes: res.extra.map(Math.round),
        saldo_atraso: respostas.contratos * respostas.ticket,
        ponto_critico: analise.critico?.nome ?? null,
      },
      origem: { pagina: window.location.href, ...lerUtms() },
      enviado_em: new Date().toISOString(),
    };
    let id = null;
    try {
      if (onLead) {
        id = (await onLead(payload))?.id ?? null;
      } else if (config.webhookUrl) {
        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout?.(8000),
        });
      } else {
        console.info("[Diagnóstico] modo de teste, lead não enviado:", payload);
      }
    } catch (e) {
      console.error("[Diagnóstico] falha ao enviar lead:", e);
    } finally {
      // O resultado aparece mesmo se o envio falhar.
      setEnviando(false);
      setLead({ ...contato, id });
      setEtapa("resultado");
    }
  };

  const pedirConversa = async () => {
    if (pedido) return;
    setPedido("enviando");
    let ok = false;
    try {
      if (onInteresse) ok = (await onInteresse(lead?.id ?? null)) !== false;
    } catch {
      ok = false;
    }
    if (ok) {
      setPedido("registrado");
      return;
    }
    window.open(config.ctaUrl, "_blank", "noopener");
    setPedido(null);
  };

  const pergunta = perguntas[indice];
  const mostrarTransicao =
    pergunta?.id === dimensoes[0].id && respostas.pessoas !== undefined && respostas.ritmo !== undefined;

  return (
    <div className="min-h-screen w-full bg-creme text-tinta">
      <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
        <header className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <Logo />
          {etapa === "resultado" && !pedido && (
            <button
              type="button"
              onClick={pedirConversa}
              className={`hidden lg:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-colors ${focoPadrao}`}
            >
              <MessageCircle size={16} aria-hidden="true" /> Conversar com um especialista
            </button>
          )}
        </header>

        {etapa === "intro" && (
          <main className="dg-entra grid gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-8 lg:items-start">
            <div>
              <h1 ref={tituloRef} tabIndex={-1} className="font-bold mb-4 outline-none [text-wrap:balance]" style={titulo}>
                Qual seria o potencial da IA na sua operação de recuperação?
              </h1>
              <p className="text-base sm:text-lg" style={{ color: cores.muted, lineHeight: 1.55 }}>
                Responda 10 perguntas sobre a sua operação de cobrança. Ao final, você informa seus dados e recebe o
                diagnóstico completo na hora.
              </p>
            </div>
            <section
              aria-labelledby="pergunta-tipo"
              className="rounded-2xl p-5 sm:p-6 lg:col-start-2 lg:row-start-1 lg:row-span-2"
              style={{ background: cores.card, border: `1px solid ${cores.line}` }}
            >
              <h2 id="pergunta-tipo" className="font-bold text-lg mb-4">
                Para começar, que tipo de instituição você representa?
              </h2>
              <div className="flex flex-col gap-3" role="group" aria-labelledby="pergunta-tipo">
                {perguntas[0].opcoes.map((o) => (
                  <Opcao key={o.value} label={o.label} selecionada={respostas.tipo === o.value} onClick={() => responder(perguntas[0], o.value)} />
                ))}
              </div>
              <p className="text-sm mt-4" style={{ color: cores.muted }}>10 perguntas · cerca de 2 minutos · sem custo</p>
            </section>
            <figure className="pt-6 lg:col-start-1 lg:row-start-2" style={{ borderTop: `1px solid ${cores.line}` }}>
              <p className="text-base font-semibold mb-2" style={{ lineHeight: 1.5 }}>
                No case Sicoob Crediauc, um colaborador acompanhado de um agente de IA renegociou, em 5 dias, cerca de
                metade do valor alcançado por 135 gerentes nos 75 dias anteriores.
              </p>
              <figcaption className="text-sm" style={{ color: cores.muted, lineHeight: 1.55 }}>
                Considerando o período analisado, a experiência mostra um ganho relevante de capacidade operacional.
              </figcaption>
            </figure>
          </main>
        )}

        {etapa === "quiz" && pergunta && (
          <main className="max-w-xl mx-auto">
            <div className="flex justify-between text-sm mb-2" style={{ color: cores.muted }}>
              <span id="fase" className="font-semibold">{pergunta.fase}</span>
              <span id="contador" className="tabular-nums">{indice + 1} de {perguntas.length}</span>
            </div>
            <div
              className="flex gap-1 mb-6"
              role="progressbar"
              aria-label="Progresso"
              aria-valuemin={0}
              aria-valuemax={perguntas.length}
              aria-valuenow={indice + 1}
            >
              {perguntas.map((p, i) => (
                <span
                  key={p.id}
                  className={`h-1.5 flex-1 rounded-full ${p === dimensoes[0] ? "ml-2" : ""}`}
                  style={{
                    background: i < indice ? cores.yellow : i === indice ? cores.ink : cores.line,
                    transition: reduzido ? "none" : "background .3s ease",
                  }}
                />
              ))}
            </div>
            <div key={pergunta.id} className="dg-entra">
              {mostrarTransicao && (
                <p
                  id="transicao"
                  className="flex gap-3 text-sm rounded-xl px-4 py-3 mb-6"
                  style={{ background: cores.card, border: `1px solid ${cores.line}`, lineHeight: 1.5 }}
                >
                  <span className="shrink-0 flex items-center justify-center rounded-full mt-0.5 w-5 h-5" style={{ background: cores.yellow }}>
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="font-semibold">Parte 1 concluída.</span>{" "}
                    {aplicarTermos(
                      `A equipe {daInst} tem capacidade para cerca de ${capacidadeMensal(respostas)} renegociações por mês. Agora, a prontidão para um agente de IA.`,
                      respostas.tipo,
                    )}
                  </span>
                </p>
              )}
              <h1
                ref={tituloRef}
                tabIndex={-1}
                aria-describedby={mostrarTransicao ? "fase contador transicao" : "fase contador"}
                className="font-bold mb-2 outline-none [text-wrap:balance]"
                style={{ fontSize: "clamp(1.4rem, 4.5vw, 1.75rem)", lineHeight: 1.2, letterSpacing: "-0.02em" }}
              >
                {respostas.tipo && pergunta.tituloTipo ? aplicarTermos(pergunta.tituloTipo, respostas.tipo) : pergunta.titulo}
              </h1>
              {pergunta.ajuda && <p className="text-sm mb-1" style={{ color: cores.muted }}>{pergunta.ajuda}</p>}
              {pergunta.porque && (
                <p className="flex items-start gap-1.5 text-sm" style={{ color: cores.muted }}>
                  <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> {aplicarTermos(pergunta.porque, respostas.tipo)}
                </p>
              )}
              <div className="flex flex-col gap-3 mt-6" role="group" aria-label={pergunta.titulo}>
                {pergunta.opcoes.map((o) => (
                  <Opcao key={String(o.value)} label={o.label} selecionada={respostas[pergunta.id] === o.value} onClick={() => responder(pergunta, o.value)} />
                ))}
              </div>
            </div>
            <div className="mt-8">
              <BotaoTexto onClick={voltar}><ArrowLeft size={16} aria-hidden="true" /> Voltar</BotaoTexto>
            </div>
          </main>
        )}

        {etapa === "captura" && analise && (
          <main className="dg-entra grid gap-x-16 gap-y-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: cores.muted }}>Diagnóstico concluído</p>
              <h1 ref={tituloRef} tabIndex={-1} className="font-bold outline-none [text-wrap:balance]" style={titulo}>
                {aplicarTermos("O diagnóstico {daInst} está pronto.", respostas.tipo)}
              </h1>
              <p className="text-base sm:text-lg mt-3 mb-4 sm:mb-5" style={{ color: cores.muted, lineHeight: 1.55 }}>
                Informe seus dados para ver, nesta tela:
              </p>
              <ul className="flex flex-col gap-2.5 sm:gap-3">
                {[
                  "O potencial com um agente de IA: renegociações por mês e tempo para percorrer a carteira",
                  "A prontidão nas 5 dimensões, com a leitura de cada resposta",
                  aplicarTermos("Por onde começar {naInst}", respostas.tipo),
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm sm:text-base" style={{ lineHeight: 1.45 }}>
                    <span className="shrink-0 flex items-center justify-center rounded-full mt-0.5 w-[22px] h-[22px]" style={{ background: cores.yellow }}>
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={enviar}
              noValidate
              data-form="lead"
              data-tipo={respostas.tipo}
              aria-label="Seus dados"
              aria-busy={enviando}
              className="rounded-2xl p-5 sm:p-6 lg:col-start-2 lg:row-start-1 lg:row-span-2"
              style={{ background: cores.card, border: `1px solid ${cores.line}` }}
            >
              <fieldset disabled={enviando} className="flex flex-col gap-4 min-w-0">
                <Campo id="nome" label="Nome" autoComplete="name" placeholder="Ana Souza" campoRef={(el) => (camposRef.current.nome = el)} value={form.nome} erro={erros.nome} onChange={(e) => alterarCampo("nome", e.target.value)} />
                <Campo id="email" label="E-mail de trabalho" type="email" autoComplete="email" inputMode="email" placeholder="ana@instituicao.com.br" campoRef={(el) => (camposRef.current.email = el)} value={form.email} erro={erros.email} onChange={(e) => alterarCampo("email", e.target.value)} />
                <Campo id="fone" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(51) 99999-9999" campoRef={(el) => (camposRef.current.fone = el)} value={form.fone} erro={erros.fone} onChange={(e) => alterarCampo("fone", mascaraFone(e.target.value))} />
                <Campo id="instituicao" label={termosTipo.campo} autoComplete="organization" campoRef={(el) => (camposRef.current.instituicao = el)} value={form.instituicao} erro={erros.instituicao} onChange={(e) => alterarCampo("instituicao", e.target.value)} />
                <div>
                  <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ lineHeight: 1.45 }}>
                    <input
                      type="checkbox"
                      checked={form.aceite}
                      ref={(el) => (camposRef.current.aceite = el)}
                      onChange={(e) => alterarCampo("aceite", e.target.checked)}
                      aria-invalid={!!erros.aceite}
                      aria-describedby={erros.aceite ? "aceite-erro" : undefined}
                      className={`mt-1 shrink-0 ${focoPadrao}`}
                      style={{ width: 18, height: 18, accentColor: cores.ink }}
                    />
                    <span>Autorizo a Ubots a entrar em contato sobre este diagnóstico.</span>
                  </label>
                  {erros.aceite && (
                    <p id="aceite-erro" className="text-sm mt-1" style={{ color: cores.error }}>{erros.aceite}</p>
                  )}
                </div>
                <BotaoPrimario type="submit" disabled={enviando}>
                  {enviando ? (
                    <>
                      <LoaderCircle size={18} className="shrink-0 motion-safe:animate-spin" aria-hidden="true" /> Preparando o diagnóstico
                    </>
                  ) : (
                    <>
                      Ver diagnóstico completo <ArrowRight size={18} className="shrink-0" aria-hidden="true" />
                    </>
                  )}
                </BotaoPrimario>
                <p className="flex items-center gap-2 text-xs" style={{ color: cores.muted }}>
                  <ShieldCheck size={14} className="shrink-0" aria-hidden="true" /> Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico.
                </p>
              </fieldset>
            </form>

            <div className="lg:col-start-1 lg:row-start-2">
              <BotaoTexto
                onClick={() => {
                  setIndice(perguntas.length - 1);
                  setEtapa("quiz");
                }}
              >
                <ArrowLeft size={16} aria-hidden="true" /> Revisar respostas
              </BotaoTexto>
            </div>
          </main>
        )}

        {etapa === "resultado" && analise && lead && (
          <Resultado a={analise} lead={lead} animar={animar} reduzido={reduzido} pedido={pedido} onPedir={pedirConversa} onRefazer={refazer} tituloRef={tituloRef} />
        )}
      </div>
    </div>
  );
}

/** Painel flutuante do modo demonstração (?demo=1): pula direto para cenários prontos. */
function ModoDemo({ ativo, onCenario, onPreencher }) {
  const largo = (px) => {
    try {
      return window.matchMedia(`(min-width: ${px}px)`).matches;
    } catch {
      return true;
    }
  };
  const [aberto, setAberto] = useState(() => largo(1536));
  const acionar = (fn, sempreFecha = false) => {
    fn();
    if (sempreFecha || !largo(1536)) setAberto(false);
  };

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="sem-impressao fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-tinta px-4 py-3 text-sm font-semibold text-white shadow-lg foco-claro"
      >
        <FlaskConical size={16} aria-hidden="true" className="text-amarelo" /> Modo demonstração
      </button>
    );
  }
  return (
    <aside
      aria-labelledby="demo-titulo"
      className="sem-impressao fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-linha bg-white p-4 shadow-[0_18px_48px_-16px_rgba(20,20,20,0.45)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[300px]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="demo-titulo" className="flex items-center gap-2 text-sm font-bold">
          <FlaskConical size={16} aria-hidden="true" /> Modo demonstração
        </h2>
        <button type="button" onClick={() => setAberto(false)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-apagado hover:text-tinta">
          Ocultar
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {cenariosDemo.map((c, i) => (
          <li key={c.nome}>
            <button
              type="button"
              onClick={() => acionar(() => onCenario(i))}
              aria-pressed={ativo === i}
              className={`flex w-full flex-col items-start gap-1.5 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                ativo === i ? "border-tinta bg-amarelo-suave" : "border-linha hover:border-tinta"
              }`}
            >
              <span>{c.nome}</span>
              <SeloNivel nivel={analisar(c.respostas).nivel} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => acionar(onPreencher, true)} className="mt-3 w-full rounded-full bg-tinta px-4 py-3 text-sm font-semibold text-white foco-claro hover:bg-black">
        Preencher formulário
      </button>
    </aside>
  );
}

export default function Diagnostico() {
  usePageTitle("Diagnóstico de recuperação com IA | Ubots");
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const utmContent = params.get("utm_content");
  const raiz = useRef(null);
  const [estado, setEstado] = useState({ chave: 0, cenario: null });
  const [formDemo, setFormDemo] = useState(null);

  const aoReceberLead = useCallback((payload) => salvarLead(payload, utmContent), [utmContent]);
  const aoPedirConversa = useCallback(
    (id) => !!atualizarLead(id, { interesse: { em: new Date().toISOString() } }),
    [],
  );

  // Reserva espaço para o painel de demonstração ao rolar até um elemento.
  useEffect(() => {
    if (!demo) return;
    const html = document.documentElement;
    html.style.scrollPaddingBottom = "88px";
    return () => {
      html.style.scrollPaddingBottom = "";
    };
  }, [demo]);

  const abrirCenario = (i) => {
    if (formDemo) setFormDemo({ ...formularioDemo(cenariosDemo[i].respostas.tipo) });
    setEstado((s) => ({ chave: s.chave + 1, cenario: i }));
  };

  const preencherFormulario = () => {
    const form = raiz.current?.querySelector('form[data-form="lead"]');
    if (!form) {
      // Ainda não chegou na captura: abre o cenário atual (ou o primeiro) já na etapa de dados.
      const i = estado.cenario ?? 0;
      setFormDemo({ ...formularioDemo(cenariosDemo[i].respostas.tipo) });
      setEstado((s) => ({ chave: s.chave + 1, cenario: i }));
      return;
    }
    setFormDemo({ ...formularioDemo(form.dataset.tipo) });
    const botao = form.querySelector('button[type="submit"]');
    requestAnimationFrame(() => {
      botao?.scrollIntoView({ behavior: reduzirMovimento() ? "auto" : "smooth", block: "center" });
      botao?.focus({ preventScroll: true });
    });
  };

  const cenario = estado.cenario === null ? null : cenariosDemo[estado.cenario];

  return (
    <div ref={raiz} className={demo ? "pb-24 sm:pb-80 lg:pb-20" : undefined}>
      <Fluxo
        key={estado.chave}
        onLead={aoReceberLead}
        onInteresse={aoPedirConversa}
        respostasIniciais={cenario?.respostas}
        etapaInicial={cenario ? "captura" : undefined}
        formInicial={formDemo}
        onReiniciar={() => setEstado((s) => ({ ...s, cenario: null }))}
      />
      {demo && <ModoDemo ativo={estado.cenario} onCenario={abrirCenario} onPreencher={preencherFormulario} />}
    </div>
  );
}
