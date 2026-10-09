import { MessageCircle, RotateCcw, Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { BarraProgresso, BotaoPrimario, BotaoTexto } from "../components/ui";
import { cores, config } from "../lib/config";
import { niveis } from "../lib/dados";

const titulo = { fontSize: "clamp(1.75rem, 5.5vw, 2.5rem)", lineHeight: 1.1, letterSpacing: "-0.03em" };
const gradeTabela =
  "grid grid-cols-2 gap-x-3 sm:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_minmax(0,1.2fr)]";

export default function Resultado({ a, lead, animar, reduzido, pedido, onPedir, onRefazer, tituloRef }) {
  const { res } = a;
  const statusRef = useRef(null);
  useEffect(() => {
    if (pedido === "registrado") statusRef.current?.focus();
  }, [pedido]);
  const indiceNivel = niveis.findIndex((n) => n.nome === a.nivel);

  const linhas = [
    ["Renegociações por mês", a.capacidadeHoje, a.capacidadeIA],
    ["Prazo para negociar toda a carteira", a.tempoHoje, a.tempoIA],
    ["Valor renegociado no 1º mês", a.valorHoje, a.valorIA],
  ];

  return (
    <main className="dg-entra">
      <div className="flex flex-col gap-5 mb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: cores.muted }}>
            Diagnóstico · {lead.instituicao}
          </p>
          <h1 ref={tituloRef} tabIndex={-1} className="font-bold outline-none [text-wrap:balance]" style={titulo}>
            {a.nivel}
          </h1>
          <p className="text-base sm:text-lg mt-2 [text-wrap:pretty]" style={{ color: cores.muted, lineHeight: 1.5 }}>
            {a.resumo}
          </p>
        </div>
        <ol
          className="grid grid-cols-3 gap-1.5 shrink-0 lg:w-[380px]"
          aria-label={`Nível de prontidão: ${a.pontos} de ${a.pontosMax} pontos`}
        >
          {niveis.map((n, i) => (
            <li key={n.nome} aria-current={i === indiceNivel ? "step" : undefined}>
              <div
                className="h-1.5 rounded-full"
                style={{ background: i === indiceNivel ? cores.yellow : i < indiceNivel ? cores.ink : cores.line }}
              />
              <p
                className={`text-xs mt-2 ${i === indiceNivel ? "font-semibold" : ""}`}
                style={{ color: i === indiceNivel ? cores.ink : cores.muted }}
              >
                {n.nome}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="potencial"
          className="rounded-2xl p-5 sm:p-6 flex flex-col"
          style={{ background: cores.card, border: `1px solid ${cores.line}` }}
        >
          <h2 id="potencial" className="font-bold text-lg [text-wrap:balance]">O potencial com um agente de IA</h2>
          <p className="text-sm mt-1" style={{ color: cores.muted, lineHeight: 1.5 }}>
            Carteira em atraso: {a.contratos} contratos, cerca de {a.saldo}.
          </p>
          <div role="table" aria-label="Hoje e com um agente de IA" className="mt-4">
            <div role="row" className={gradeTabela}>
              <span role="columnheader" className="hidden sm:block"><span className="sr-only">Indicador</span></span>
              <span role="columnheader" className="text-xs font-semibold pt-2.5 pb-2" style={{ color: cores.muted }}>Hoje</span>
              <span role="columnheader" className="text-xs font-semibold pt-2.5 pb-2 px-3 rounded-t-lg" style={{ background: cores.yellowSoft }}>
                Com agente de IA
              </span>
            </div>
            {linhas.map(([rotulo, hoje, ia], i) => (
              <div key={rotulo} role="row" className={gradeTabela} style={{ borderTop: `1px solid ${cores.line}` }}>
                <span
                  role="rowheader"
                  className="col-span-2 sm:col-span-1 text-sm pt-2.5 sm:pb-2.5 [text-wrap:balance]"
                  style={{ color: cores.muted, lineHeight: 1.35 }}
                >
                  {rotulo}
                </span>
                <span role="cell" className="text-[15px] font-semibold tabular-nums py-2 sm:py-2.5" style={{ lineHeight: 1.35 }}>
                  {hoje}
                </span>
                <span
                  role="cell"
                  className={`text-[15px] font-bold tabular-nums py-2 sm:py-2.5 px-3 ${i === linhas.length - 1 ? "rounded-b-lg" : ""}`}
                  style={{ background: cores.yellowSoft, lineHeight: 1.35 }}
                >
                  {ia}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm mt-4" style={{ lineHeight: 1.5 }}>
            {a.extra ? (
              <>
                Diferença estimada no 1º mês: <strong className="tabular-nums">+{a.extra}</strong> renegociados.
              </>
            ) : (
              <>
                A equipe já negocia a carteira inteira em {a.tempoHoje}. Com o agente, a estimativa é de{" "}
                <strong>{a.tempoIA}</strong>.
              </>
            )}
          </p>
          <p className="text-xs mt-auto pt-3" style={{ color: cores.muted, lineHeight: 1.5 }}>
            Estimativa conservadora: {res.nivel.mult[0]} a {res.nivel.mult[1]} vezes a capacidade de hoje, conforme a
            prontidão. Valores arredondados. Renegociado não é o mesmo que recebido.
          </p>
        </section>

        <section
          aria-labelledby="prontidao"
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: cores.card, border: `1px solid ${cores.line}` }}
        >
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
                      <span
                        className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: cores.yellow, color: cores.ink }}
                      >
                        Prioridade
                      </span>
                    )}
                  </span>
                  <span className="font-bold shrink-0 tabular-nums">{d.pontos}/{d.max}</span>
                </div>
                <BarraProgresso largura={Math.max((d.pontos / d.max) * 100, 4)} animar={animar} reduzido={reduzido} />
                <p className="text-xs mt-1" style={{ color: cores.muted, lineHeight: 1.45 }}>{d.leitura}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="comecar" className="mt-8">
        <h2 id="comecar" className="font-bold text-lg mb-3">Por onde começar</h2>
        <ol className="grid gap-4 md:gap-6 md:grid-flow-col md:auto-cols-fr">
          {a.passos.map((p, i) => (
            <li key={p.rotulo} className="flex gap-3 pt-4" style={{ borderTop: `2px solid ${i === 0 ? cores.ink : cores.line}` }}>
              <span
                className="shrink-0 flex items-center justify-center rounded-full font-bold text-sm w-7 h-7"
                style={i === 0 ? { background: cores.yellow, color: cores.ink } : { border: `1.5px solid ${cores.line}`, color: cores.ink }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: cores.muted, letterSpacing: "0.06em" }}>{p.rotulo}</p>
                <p className="text-sm mt-1" style={{ lineHeight: 1.5 }}>{p.texto}</p>
                <p className="text-xs mt-1.5" style={{ color: cores.muted, lineHeight: 1.5 }}>
                  <span className="font-semibold" style={{ color: cores.ink }}>Pronto quando:</span> {p.pronto}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="conversa"
        aria-labelledby="conversa-titulo"
        className="mt-8 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: cores.ink, color: "#FFFFFF" }}
      >
        <div className="lg:max-w-xl">
          <h2 id="conversa-titulo" className="font-bold text-lg">{a.cta.titulo}</h2>
          <p className="text-sm mt-1" style={{ color: "#D9D2BF", lineHeight: 1.5 }}>{a.cta.texto}</p>
        </div>
        <div className="shrink-0 lg:max-w-sm">
          {pedido === "registrado" ? (
            <p
              ref={statusRef}
              tabIndex={-1}
              role="status"
              className="flex items-start gap-2 text-sm font-semibold outline-none"
              style={{ lineHeight: 1.5 }}
            >
              <Check size={18} className="shrink-0 mt-0.5" style={{ color: cores.yellow }} aria-hidden="true" />
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
        <p className="text-xs" style={{ color: cores.muted }}>
          Como calculamos: pessoas × renegociações por dia × {config.diasUteisMes} dias úteis, multiplicado pela faixa do
          nível. Cada resposta usa um valor de referência dentro da faixa escolhida, e os resultados são arredondados.
        </p>
        <BotaoTexto onClick={onRefazer}>
          <RotateCcw size={16} aria-hidden="true" /> Refazer diagnóstico
        </BotaoTexto>
      </div>
    </main>
  );
}
