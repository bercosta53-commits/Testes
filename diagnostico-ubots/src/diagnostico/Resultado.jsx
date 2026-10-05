import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CalendarClock, Check, ChevronDown, Gauge, Lightbulb, MessageCircle, Printer, RotateCcw, Target,
} from "lucide-react";
import { C, fmtBRL, fmtNum } from "./modelo.js";
import { faixa, pct, rotuloResposta } from "./leitura.js";
import { minusculas } from "./perfil.js";
import { Barra, BotaoTexto, Cartao, Indicador, SeloStatus, Secao } from "./ui.jsx";

const fmtWhatsApp = (d = "") =>
  d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d;

const fmtDecimal = (v) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v);

const CASE = [
  ["Período", "75 dias", "5 dias"],
  ["Equipe", "135 gerentes", "1 colaborador"],
  ["Contratos renegociados", "13", "6"],
  ["Valor renegociado", "R$ 46.228,00", "R$ 23.402,22"],
];

/* Navegação entre as seções de um resultado longo. */
function Navegacao({ secoes }) {
  const [ativa, setAtiva] = useState(secoes[0].id);
  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      let atual = secoes[0].id;
      for (const s of secoes) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) atual = s.id;
      }
      setAtiva(atual);
    };
    const aoRolar = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => { cancelAnimationFrame(quadro); window.removeEventListener("scroll", aoRolar); };
  }, [secoes]);

  const ir = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    let reduzido = false;
    try { reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* sem suporte */ }
    el.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
    el.querySelector("h2")?.focus({ preventScroll: true });
  };

  return (
    <nav aria-label="Seções do diagnóstico" className="sem-impressao sticky top-0 z-20 -mx-5 px-5 py-3 mb-8"
      style={{ background: "rgba(255,251,239,0.94)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${C.line}` }}>
      <ol className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {secoes.map((s) => (
          <li key={s.id} className="flex-shrink-0">
            <a href={`#${s.id}`} onClick={(e) => ir(e, s.id)} aria-current={ativa === s.id ? "location" : undefined}
              className="block rounded-full px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-200"
              style={ativa === s.id ? { background: C.ink, color: "#fff" } : { background: C.card, color: C.muted, border: `1px solid ${C.line}` }}>
              {s.rotulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PedidoConversa({ a, lead, interesse, onPedir, enviando }) {
  return (
    <section id="conversa" aria-labelledby="conversa-titulo" className="scroll-mt-20 rounded-2xl p-5 sm:p-7"
      style={{ background: C.yellowSoft, border: `1px solid ${C.yellow}` }}>
      <h2 id="conversa-titulo" tabIndex={-1} className="font-bold text-xl outline-none" style={{ letterSpacing: "-0.01em" }}>{a.cta.titulo}</h2>
      <p className="text-base mt-2 mb-5" style={{ lineHeight: 1.55 }}>{a.cta.texto}</p>
      {interesse ? (
        <p role="status" className="flex items-start gap-3 rounded-xl p-4 text-sm font-semibold" style={{ background: C.card, lineHeight: 1.5 }}>
          <Check size={18} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          {`Pedido registrado. O time da Ubots vai falar com você pelo WhatsApp ${fmtWhatsApp(lead.whatsapp)}, com este diagnóstico em mãos.`}
        </p>
      ) : (
        <>
          <button type="button" onClick={onPedir} disabled={enviando}
            className="sem-impressao inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base focus:outline-none focus:ring-4 focus:ring-yellow-200"
            style={{ background: C.ink, color: "#FFFFFF", minHeight: 52, opacity: enviando ? 0.7 : 1 }}>
            <MessageCircle size={18} aria-hidden="true" /> Conversar com um especialista
          </button>
          <p className="sem-impressao text-sm mt-3" style={{ color: C.muted }}>Sem novo formulário. O especialista recebe este diagnóstico.</p>
        </>
      )}
    </section>
  );
}

export default function Resultado({ a, resp, lead, enviadoEm, interesse, onPedirConversa, onRefazer }) {
  const titulo = useRef(null);
  const [animar, setAnimar] = useState(false);
  const [pedindo, setPedindo] = useState(false);
  const { res, perfil: p } = a;

  useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
    const t = setTimeout(() => setAnimar(true), 60);
    return () => clearTimeout(t);
  }, []);

  const secoes = [
    { id: "resumo", rotulo: "Resumo" },
    { id: "carteira", rotulo: "Carteira" },
    { id: "potencial", rotulo: "Potencial" },
    { id: "prontidao", rotulo: "Prontidão" },
    { id: "nivel", rotulo: a.proximo ? "Próximo nível" : "Nível" },
    { id: "piloto", rotulo: "Piloto" },
    { id: "case", rotulo: "Case" },
  ];

  const pedir = async () => {
    setPedindo(true);
    try { await onPedirConversa(); } finally { setPedindo(false); }
  };

  const imprimir = () => {
    const fechados = [...document.querySelectorAll("details:not([open])")];
    fechados.forEach((d) => { d.open = true; });
    window.print();
    fechados.forEach((d) => { d.open = false; });
  };

  const irParaConversa = () => {
    const el = document.getElementById("conversa");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector("h2")?.focus({ preventScroll: true });
  };

  const data = (() => {
    try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(enviadoEm)); } catch { return ""; }
  })();
  const contratosLabel = rotuloResposta("contratos", resp.contratos);
  const ticketLabel = rotuloResposta("ticket", resp.ticket);
  const marcador = res.ia[1] > resp.contratos ? (resp.contratos / res.ia[1]) * 100 : undefined;

  return (
    <main className="entra">
      {/* Cabeçalho e resumo */}
      <section id="resumo" aria-labelledby="resultado-titulo" className="scroll-mt-20">
        <p className="text-sm font-semibold" style={{ color: C.muted }}>
          Diagnóstico · {lead.instituicao}{data && ` · ${data}`}
        </p>
        <p className="mt-6 text-xs font-semibold uppercase" style={{ color: C.muted, letterSpacing: "0.12em" }}>Nível de prontidão</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 id="resultado-titulo" ref={titulo} tabIndex={-1} className="font-bold outline-none"
            style={{ fontSize: "clamp(2rem, 6vw, 2.8rem)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            {a.nivel}
          </h1>
          <span className="text-base font-semibold" style={{ color: C.muted }}>{a.pontos} de {a.pontosMax} pontos</span>
        </div>
        <p className="text-lg mt-3" style={{ color: C.muted, lineHeight: 1.55 }}>{a.resumo}</p>

        <div className="mt-6 rounded-2xl p-5 sm:p-6" style={{ background: C.ink, color: "#fff" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: C.yellow }}>Em resumo</p>
          <ul className="flex flex-col gap-4">
            {[Gauge, CalendarClock, Target].map((Icone, i) => (
              <li key={i} className="flex gap-3">
                <Icone size={20} className="mt-0.5 flex-shrink-0" style={{ color: C.yellow }} aria-hidden="true" />
                <p className="text-base" style={{ lineHeight: 1.55 }}>{a.emResumo[i]}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="sem-impressao mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={irParaConversa}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-200"
            style={{ background: C.yellow, color: C.ink }}>
            <MessageCircle size={16} aria-hidden="true" /> Conversar com um especialista
          </button>
          <button type="button" onClick={imprimir}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-200"
            style={{ background: C.card, color: C.ink, border: `1px solid ${C.line}` }}>
            <Printer size={16} aria-hidden="true" /> Salvar em PDF
          </button>
        </div>
      </section>

      <div className="mt-10">
        <Navegacao secoes={secoes} />
      </div>

      <div className="flex flex-col gap-14">
        {/* Carteira hoje */}
        <Secao id="carteira" titulo={`A carteira ${p.daInst} hoje`}>
          <p className="text-lg font-semibold mb-5" style={{ lineHeight: 1.45 }}>{a.carteira.titulo}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Indicador rotulo="Contratos em atraso" valor={`cerca de ${fmtNum(resp.contratos)}`} apoio={`Faixa: ${contratosLabel}`} />
            <Indicador rotulo="Saldo em atraso estimado" valor={fmtBRL(a.carteira.saldo)} apoio={`Dívida média: ${ticketLabel}`} />
            <Indicador rotulo="Renegociações por mês" valor={fmtNum(res.atual)} apoio={`${fmtNum(resp.pessoas)} pessoas × ${fmtDecimal(resp.ritmo)} por dia × 21 dias úteis`} />
            <Indicador rotulo="Carteira negociada por mês" valor={pct(a.carteira.coberturaHoje)} apoio="no ritmo atual" />
          </div>
          <p className="text-xs mt-3" style={{ color: C.muted, lineHeight: 1.5 }}>
            {`Cada resposta usa um valor de referência da faixa escolhida: ${fmtNum(resp.pessoas)} pessoas para "${rotuloResposta("pessoas", resp.pessoas)}" e ${fmtDecimal(resp.ritmo)} renegociações por dia para "${rotuloResposta("ritmo", resp.ritmo)}".`}
          </p>
        </Secao>

        {/* Potencial com IA */}
        <Secao id="potencial" titulo="O potencial com um agente de IA">
          <Cartao>
            <p className="text-sm mb-5" style={{ color: C.muted }}>Renegociações por mês</p>
            <div className="flex flex-col gap-5">
              <Barra rotulo="Hoje" valor={fmtNum(res.atual)} largura={(res.atual / res.ia[1]) * 100} animar={animar} marcador={marcador} />
              <Barra rotulo="Com agente de IA" valor={faixa(res.ia[0], res.ia[1])}
                largura={(res.ia[0] / res.ia[1]) * 100} larguraFaixa={100} destaque animar={animar} marcador={marcador} />
            </div>
            {marcador !== undefined && (
              <p className="flex items-center gap-2 text-xs mt-4" style={{ color: C.muted }}>
                <span aria-hidden="true" className="inline-block w-0.5 h-3 rounded-full" style={{ background: C.ink }} />
                {`Carteira em atraso: cerca de ${fmtNum(resp.contratos)} contratos`}
              </p>
            )}

            {!res.filaCoberta && (
              <>
                <p className="text-sm mt-8 mb-5" style={{ color: C.muted }}>Tempo para percorrer a carteira em atraso</p>
                <div className="flex flex-col gap-5">
                  <Barra rotulo="Hoje" valor={a.carteira.mesesHoje.replace(/^cerca de /, "")} largura={100} animar={animar} />
                  <Barra rotulo="Com agente de IA" valor={a.potencial.mesesIA}
                    largura={(res.mesesIA[0] / res.mesesHoje) * 100} larguraFaixa={(res.mesesIA[1] / res.mesesHoje) * 100} destaque animar={animar} />
                </div>
              </>
            )}
          </Cartao>

          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <Indicador rotulo="Dívida renegociada a mais no primeiro mês" valor={a.potencial.extraTexto ?? "Sem fila represada"} />
            <Indicador rotulo="Carteira negociada por mês com IA" valor={faixa(a.potencial.coberturaIA[0], a.potencial.coberturaIA[1], pct)} />
            <Indicador rotulo="Capacidade equivalente" valor={`${a.potencial.equipeEquivalente} pessoas`} apoio="no ritmo atual da equipe" />
          </div>
          <p className="text-sm mt-4" style={{ lineHeight: 1.55 }}>
            {`Com o agente, a capacidade ${p.daInst} equivale à de ${a.potencial.equipeEquivalente} pessoas no ritmo atual. A equipe segue com os casos que exigem análise, decisão ou negociação personalizada.`}
          </p>
          <p className="text-xs mt-3" style={{ color: C.muted, lineHeight: 1.5 }}>
            {`Faixa conservadora, entre ${res.nivel.mult[0]} e ${res.nivel.mult[1]} vezes a capacidade atual, calibrada pela prontidão ${p.daInst}. Valores se referem ao saldo das dívidas renegociadas, não ao valor recebido.`}
          </p>
        </Secao>

        {/* Prontidão por dimensão */}
        <Secao id="prontidao" titulo="Prontidão por dimensão">
          <p className="text-base mb-5" style={{ lineHeight: 1.55 }}>
            <span className="font-bold">{a.pontos} de {a.pontosMax} pontos.</span>{" "}
            {a.pontoCritico
              ? `O ponto que mais limita um agente hoje é ${minusculas(a.pontoCritico.nome)}.`
              : "As 5 dimensões já têm base para um piloto."}
          </p>

          {a.leituras.length > 0 && (
            <div className="rounded-2xl p-5 mb-5" style={{ background: C.yellowSoft, border: `1px solid ${C.yellow}` }}>
              <p className="flex items-center gap-2 text-sm font-bold mb-3">
                <Lightbulb size={16} aria-hidden="true" /> O que as suas respostas mostram juntas
              </p>
              <ul className="flex flex-col gap-2">
                {a.leituras.map((l) => <li key={l} className="text-sm" style={{ lineHeight: 1.55 }}>{l}</li>)}
              </ul>
            </div>
          )}

          <ul className="flex flex-col gap-3">
            {a.dims.map((d) => (
              <li key={d.id}>
                <Cartao>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-bold text-base">{d.nome}</h3>
                    <SeloStatus status={d.status} />
                  </div>
                  <Barra rotulo={`Sua resposta: ${d.resposta}`} valor={`${d.pontos}/${d.max}`}
                    largura={Math.max((d.pontos / d.max) * 100, 3)} destaque={d.pontos >= 2} animar={animar} />
                  <p className="text-sm mt-3" style={{ lineHeight: 1.55 }}>{d.leitura}</p>
                </Cartao>
              </li>
            ))}
          </ul>
        </Secao>

        {/* Próximo nível */}
        <Secao id="nivel" titulo={a.proximo ? "O caminho para o próximo nível" : "O que vem depois"}>
          {a.proximo ? (
            <Cartao>
              <p className="text-base mb-4" style={{ lineHeight: 1.55 }}>
                {`${p.Inst} está a ${a.proximo.faltam} ${a.proximo.faltam === 1 ? "ponto" : "pontos"} do nível “${a.proximo.nome}”. O caminho mais curto:`}
              </p>
              <ol className="flex flex-col gap-3">
                {a.proximo.caminho.map((c, i) => (
                  <li key={c.id} className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-xs"
                      style={{ width: 26, height: 26, background: C.yellow, color: C.ink }}>{i + 1}</span>
                    <p className="text-sm pt-1" style={{ lineHeight: 1.5 }}>
                      <span className="font-semibold">{c.nome}:</span> de “{c.de}” para “{c.para}”.
                    </p>
                  </li>
                ))}
              </ol>
              <p className="text-sm mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}`, lineHeight: 1.55 }}>
                {`Nesse nível, a faixa passa de ${a.proximo.multAtual[0]} a ${a.proximo.multAtual[1]} para ${a.proximo.mult[0]} a ${a.proximo.mult[1]} vezes a capacidade atual: `}
                <span className="font-bold">{`${faixa(a.proximo.ia[0], a.proximo.ia[1])} renegociações por mês`}</span>
                {", com a mesma equipe."}
              </p>
            </Cartao>
          ) : (
            <Cartao>
              <p className="text-base" style={{ lineHeight: 1.55 }}>
                {`${p.Inst} já está no nível mais alto do diagnóstico. O ganho agora depende de levar o agente para a operação contínua, com integração via API e critérios de transbordo para a equipe.`}
              </p>
            </Cartao>
          )}
        </Secao>

        {/* Plano de piloto */}
        <Secao id="piloto" titulo={`Plano de piloto para ${p.inst}`}>
          <p className="text-base mb-5" style={{ lineHeight: 1.55 }}>{a.plano.formato}</p>
          <dl className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}`, background: C.card }}>
            {a.plano.itens.map((it, i) => (
              <div key={it.rotulo} className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr] sm:gap-6"
                style={i ? { borderTop: `1px solid ${C.line}` } : undefined}>
                <dt className="text-sm font-bold">{it.rotulo}</dt>
                <dd className="text-sm" style={{ lineHeight: 1.55 }}>{it.texto}</dd>
              </div>
            ))}
          </dl>

          <h3 className="font-bold text-lg mt-8 mb-4">Próximos passos</h3>
          <ol className="flex flex-col gap-4">
            {a.passos.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm"
                  style={{ width: 32, height: 32, background: C.yellow, color: C.ink }}>{i + 1}</span>
                <p className="text-base pt-1" style={{ lineHeight: 1.55 }}>{s}</p>
              </li>
            ))}
          </ol>
        </Secao>

        {/* Case */}
        <Secao id="case" titulo={`${p.Inst} e o case Sicoob Crediauc`}>
          <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${C.line}`, background: C.card }}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                  <th scope="col" className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Indicador</th>
                  <th scope="col" className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Operação humana</th>
                  <th scope="col" className="px-4 py-3 font-semibold" style={{ background: C.yellowSoft }}>Agente de IA + 1 colaborador</th>
                </tr>
              </thead>
              <tbody>
                {CASE.map(([ind, h, ia], i) => (
                  <tr key={ind} style={i < CASE.length - 1 ? { borderBottom: `1px solid ${C.line}` } : undefined}>
                    <th scope="row" className="px-4 py-3 font-semibold">{ind}</th>
                    <td className="px-4 py-3 whitespace-nowrap">{h}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold" style={{ background: "rgba(255,244,199,0.6)" }}>{ia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-col gap-3 text-base" style={{ lineHeight: 1.55 }}>
            <p>{a.caso.tipo}</p>
            <p>{a.caso.ticket}</p>
            <p className="text-sm" style={{ color: C.muted }}>{a.caso.limite}</p>
          </div>
          <Link to="/artigo" className="sem-impressao mt-4 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 rounded-md focus:outline-none focus:ring-4 focus:ring-yellow-200"
            style={{ textDecorationColor: C.yellow, textDecorationThickness: 2 }}>
            Ler o case <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Secao>

        <PedidoConversa a={a} lead={lead} interesse={interesse} onPedir={pedir} enviando={pedindo} />

        <details className="rounded-2xl px-5 py-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <summary className="flex cursor-pointer items-center justify-between gap-3 font-bold rounded-md focus:outline-none focus:ring-4 focus:ring-yellow-200">
            Como calculamos <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: C.muted, lineHeight: 1.6 }}>
            <p>Capacidade hoje: pessoas × renegociações por pessoa por dia × 21 dias úteis.</p>
            <p>{`Com IA: capacidade hoje × ${res.nivel.mult[0]} a ${res.nivel.mult[1]}, conforme o nível de prontidão (2 a 3, 3 a 5 ou 4 a 7 vezes).`}</p>
            <p>Saldo em atraso: contratos em atraso × valor médio da dívida.</p>
            <p>Dívida renegociada a mais no primeiro mês: renegociações a mais, limitadas aos contratos em atraso, × valor médio da dívida.</p>
            <p>A estimativa não considera novos atrasos nem a taxa de aceite das propostas. As faixas são premissas conservadoras, não uma promessa de resultado.</p>
          </div>
        </details>

        <div className="sem-impressao flex flex-wrap gap-2">
          <BotaoTexto onClick={imprimir}><Printer size={16} aria-hidden="true" /> Salvar em PDF</BotaoTexto>
          <BotaoTexto onClick={onRefazer}><RotateCcw size={16} aria-hidden="true" /> Refazer diagnóstico</BotaoTexto>
        </div>
      </div>
    </main>
  );
}
