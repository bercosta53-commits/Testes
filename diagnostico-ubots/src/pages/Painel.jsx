import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock, Copy, Download, Inbox, Mail, MessageCircle, PhoneCall, Trash2, X } from "lucide-react";
import { QUESTIONS } from "../DiagnosticoRecuperacaoIA.jsx";
import MarcaUbots from "../components/MarcaUbots.jsx";
import SeloNivel from "../components/SeloNivel.jsx";
import Dialogo from "../components/Dialogo.jsx";
import useTitulo from "../components/useTitulo.js";
import { CHAVE_LEADS, lerLeads, limparLeads, lerUltimaVisita, registrarVisita } from "../lib/leads.js";
import {
  SUGESTOES, capacidadeTexto, fmtBRL, fmtData, fmtWhatsApp, gerarCSV, leituraDoLead, linhaSDR,
  potencialTexto, rotuloOrigem, rotuloResposta, rotuloTipo,
} from "../lib/comercial.js";
import { SeloStatus } from "../diagnostico/ui.jsx";

function SeloConversa() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-tinta px-2.5 py-1 text-xs font-semibold text-white">
      <PhoneCall size={12} aria-hidden="true" className="text-amarelo" /> Pediu conversa
    </span>
  );
}

const COLUNAS = ["Contato", "Instituição", "Nível", "Renegociações por mês", "Potencial adicional", "Origem"];
const BOTAO_SECUNDARIO =
  "inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-linha bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-tinta disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-linha";

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    area.remove();
    return ok;
  }
}

function Secao({ titulo, children }) {
  return (
    <section className="border-t border-linha px-5 py-6 sm:px-7">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-apagado">{titulo}</h3>
      {children}
    </section>
  );
}

function DetalheLead({ lead, onFechar }) {
  const [copiado, setCopiado] = useState(false);
  const r = lead.resultado;
  const a = leituraDoLead(lead);
  const dims = a?.dims ?? [];
  const linha = linhaSDR(lead);
  const fases = [...new Set(QUESTIONS.map((q) => q.fase))];

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2500);
    return () => clearTimeout(t);
  }, [copiado]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-linha bg-white px-5 py-5 sm:px-7">
        <div className="min-w-0">
          <h2 id="detalhe-titulo" className="text-xl font-bold tracking-tight">{lead.lead.nome}</h2>
          <p className="mt-1 text-sm text-apagado">{lead.lead.instituicao} · {rotuloTipo(lead.respostas.tipo)}</p>
          <div className="mt-3 flex flex-wrap gap-2"><SeloNivel nivel={r.nivel} />{lead.interesse && <SeloConversa />}</div>
        </div>
        <button type="button" onClick={onFechar} aria-label="Fechar"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-linha hover:border-tinta">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="grid gap-x-6 gap-y-2 px-5 py-5 text-sm sm:grid-cols-2 sm:px-7">
        <a href={`mailto:${lead.lead.email}`} className="flex min-w-0 items-center gap-2 rounded-md py-1 hover:underline">
          <Mail size={16} aria-hidden="true" className="flex-shrink-0 text-apagado" />
          <span className="truncate">{lead.lead.email}</span>
        </a>
        <a href={`https://wa.me/55${lead.lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md py-1 hover:underline">
          <MessageCircle size={16} aria-hidden="true" className="flex-shrink-0 text-apagado" />
          {fmtWhatsApp(lead.lead.whatsapp)}
        </a>
        <p className="flex items-center gap-2 py-1">
          <Clock size={16} aria-hidden="true" className="flex-shrink-0 text-apagado" />
          {fmtData(lead.enviado_em)}
        </p>
        <p className="flex items-center gap-2 py-1">
          <span aria-hidden="true" className="h-2 w-2 flex-shrink-0 rounded-full bg-amarelo ring-4 ring-amarelo-suave" />
          {rotuloOrigem(lead.utm_content)}
        </p>
        {lead.interesse && (
          <p className="flex items-center gap-2 py-1 font-semibold sm:col-span-2">
            <PhoneCall size={16} aria-hidden="true" className="flex-shrink-0" />
            {`Pediu conversa em ${fmtData(lead.interesse.em)}`}
          </p>
        )}
      </div>

      <dl className="mx-5 mb-6 grid gap-px overflow-hidden rounded-2xl border border-linha bg-linha sm:mx-7 sm:grid-cols-2">
        <div className="bg-creme p-4">
          <dt className="text-xs text-apagado">Renegociações por mês</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug">{capacidadeTexto(r)}</dd>
        </div>
        <div className="bg-creme p-4">
          <dt className="text-xs text-apagado">Potencial adicional</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug">{potencialTexto(r)}</dd>
        </div>
        <div className="bg-creme p-4">
          <dt className="text-xs text-apagado">Saldo em atraso estimado</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug">{fmtBRL(lead.respostas.contratos * lead.respostas.ticket)}</dd>
        </div>
        <div className="bg-creme p-4">
          <dt className="text-xs text-apagado">Ponto crítico</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug">{a?.pontoCritico?.nome ?? "Nenhum: todas as dimensões com 2 ou mais"}</dd>
        </div>
      </dl>

      {a && (
        <Secao titulo="O que o lead viu">
          <ul className="flex flex-col gap-3">
            {a.emResumo.map((t) => <li key={t} className="text-[0.95rem] leading-relaxed">{t}</li>)}
          </ul>
          {a.leituras.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2 rounded-xl bg-amarelo-suave p-4 ring-1 ring-amarelo">
              {a.leituras.map((t) => <li key={t} className="text-sm leading-relaxed">{t}</li>)}
            </ul>
          )}
        </Secao>
      )}

      <Secao titulo="Respostas">
        <div className="flex flex-col gap-6">
          {fases.map((fase) => (
            <div key={fase}>
              <p className="mb-2 text-sm font-bold">{fase}</p>
              <dl className="divide-y divide-linha rounded-xl border border-linha">
                {QUESTIONS.filter((q) => q.fase === fase).map((q) => (
                  <div key={q.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_auto] sm:gap-4">
                    <dt className="text-sm text-apagado">{q.titulo}</dt>
                    <dd className="text-sm font-semibold sm:text-right">{rotuloResposta(q, lead.respostas[q.id])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Prontidão por dimensão">
        <p className="mb-4 text-sm"><span className="font-bold">{r.pontos} de {r.pontos_max}</span></p>
        <ul className="flex flex-col gap-4">
          {dims.map((d) => (
            <li key={d.nome}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{d.nome}</span>
                <span className="flex items-center gap-2"><SeloStatus status={d.status} /><span className="font-bold tabular-nums">{d.pontos}/{d.max}</span></span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-linha" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${Math.max((d.pontos / d.max) * 100, 3)}%`, background: d.pontos >= 2 ? "#FFC800" : "#141414" }} />
              </div>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Sugestão de abordagem">
        <p className="text-[0.95rem] leading-relaxed">{SUGESTOES[r.nivel]}</p>
        {a && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold">Perguntas para a primeira ligação</p>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.95rem] leading-relaxed">
              {a.perguntasLigacao.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        )}
        <div className="mt-5 rounded-2xl bg-tinta p-5 text-white">
          <p className="text-xs font-semibold text-amarelo">Linha de abertura sugerida para o SDR</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed">{linha}</p>
          <button
            type="button"
            onClick={async () => setCopiado(await copiarTexto(linha))}
            className="foco-claro mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-amarelo px-4 py-2 text-sm font-semibold text-tinta"
          >
            {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
          <span className="sr-only" role="status">{copiado ? "Copiado" : ""}</span>
        </div>
      </Secao>
    </div>
  );
}

export default function Painel() {
  useTitulo("Leads do diagnóstico | Ubots");
  const [leads, setLeads] = useState(lerLeads);
  const [selecionado, setSelecionado] = useState(null);
  const [confirmar, setConfirmar] = useState(false);
  const [aviso, setAviso] = useState(null);
  const visitaAnterior = useRef(lerUltimaVisita());

  /* Aviso de novo lead ao voltar para o painel. */
  useEffect(() => {
    const novo = lerLeads()[0];
    if (novo && String(novo.enviado_em) > visitaAnterior.current) {
      setAviso(`Novo diagnóstico recebido: ${novo.lead.instituicao}, ${novo.resultado.nivel}.`);
    }
    registrarVisita();
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(t);
  }, [aviso]);

  /* Atualiza a lista quando um lead chega por outra aba. */
  useEffect(() => {
    const aoMudar = (e) => {
      if (e.key !== null && e.key !== CHAVE_LEADS) return;
      const lista = lerLeads();
      if (lista.length && lista[0].id !== leads[0]?.id && String(lista[0].enviado_em) > String(leads[0]?.enviado_em ?? "")) {
        setAviso(`Novo diagnóstico recebido: ${lista[0].lead.instituicao}, ${lista[0].resultado.nivel}.`);
        registrarVisita();
      }
      setLeads(lista);
    };
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, [leads]);

  const exportar = () => {
    const blob = new Blob([gerarCSV(leads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-diagnostico-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const remover = () => {
    limparLeads();
    setLeads([]);
    setConfirmar(false);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-linha bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link to="/" className="rounded-md"><MarcaUbots /></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Leads do diagnóstico</h1>
            <p className="mt-3 text-base leading-relaxed text-apagado">
              Uma visão das informações que chegam ao time comercial após cada diagnóstico. Dados de demonstração.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:shrink-0">
            <button type="button" onClick={exportar} disabled={!leads.length} className={BOTAO_SECUNDARIO}>
              <Download size={16} aria-hidden="true" /> Exportar CSV
            </button>
            <button type="button" onClick={() => setConfirmar(true)} disabled={!leads.length} className={BOTAO_SECUNDARIO}>
              <Trash2 size={16} aria-hidden="true" /> Limpar dados de demonstração
            </button>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-3xl border-2 border-dashed border-linha bg-white/60 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amarelo-suave">
              <Inbox size={24} aria-hidden="true" />
            </span>
            <p className="mt-5 max-w-md text-base leading-relaxed text-apagado">
              Ainda não há leads no painel. Ao concluir um diagnóstico em{" "}
              <Link to="/diagnostico" className="font-mono text-sm font-semibold text-tinta underline decoration-amarelo decoration-2 underline-offset-4">/diagnostico</Link>
              , os dados aparecem aqui.
            </p>
          </div>
        ) : (
          <>
            {/* Tabela no desktop */}
            <div className="mt-10 hidden overflow-hidden rounded-2xl border border-linha bg-white lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-creme">
                  <tr>
                    {COLUNAS.map((c) => (
                      <th key={c} scope="col" className="px-4 py-3 text-xs font-semibold text-apagado">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} onClick={() => setSelecionado(l)}
                      className="cursor-pointer border-t border-linha align-top transition-colors hover:bg-amarelo-suave/50">
                      <td className="px-4 py-4">
                        <button type="button" className="text-left font-semibold underline-offset-4 hover:underline">{l.lead.nome}</button>
                        <p className="mt-0.5 max-w-[200px] truncate text-xs text-apagado">{l.lead.email}</p>
                        {l.interesse && <div className="mt-2"><SeloConversa /></div>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{l.lead.instituicao}</p>
                        <p className="mt-0.5 text-xs text-apagado">{rotuloTipo(l.respostas.tipo)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <SeloNivel nivel={l.resultado.nivel} />
                        {leituraDoLead(l)?.pontoCritico && (
                          <p className="mt-2 max-w-[170px] text-xs leading-snug text-apagado">{`Ponto crítico: ${leituraDoLead(l).pontoCritico.nome.replace(/^./, (c) => c.toLowerCase())}`}</p>
                        )}
                      </td>
                      <td className="max-w-[220px] px-4 py-4 leading-snug">{capacidadeTexto(l.resultado)}</td>
                      <td className="px-4 py-4 font-semibold leading-snug">{potencialTexto(l.resultado)}</td>
                      <td className="px-4 py-4 text-apagado">{rotuloOrigem(l.utm_content)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartões no celular e tablet */}
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:hidden">
              {leads.map((l) => (
                <li key={l.id} className="flex">
                  <button type="button" onClick={() => setSelecionado(l)}
                    className="flex w-full flex-col rounded-2xl border border-linha bg-white p-5 text-left transition-colors hover:border-tinta">
                    <span className="block font-bold">{l.lead.nome}</span>
                    <span className="mt-0.5 block text-sm text-apagado">{l.lead.instituicao} · {rotuloTipo(l.respostas.tipo)}</span>
                    <span className="mt-3 flex flex-wrap gap-2"><SeloNivel nivel={l.resultado.nivel} />{l.interesse && <SeloConversa />}</span>
                    {leituraDoLead(l)?.pontoCritico && (
                      <span className="mt-2 block text-xs text-apagado">{`Ponto crítico: ${leituraDoLead(l).pontoCritico.nome.replace(/^./, (c) => c.toLowerCase())}`}</span>
                    )}
                    <span className="mt-4 grid w-full gap-3 border-t border-linha pt-4 text-sm">
                      <span>
                        <span className="block text-xs text-apagado">{COLUNAS[3]}</span>
                        <span className="mt-0.5 block leading-snug">{capacidadeTexto(l.resultado)}</span>
                      </span>
                      <span>
                        <span className="block text-xs text-apagado">{COLUNAS[4]}</span>
                        <span className="mt-0.5 block font-semibold">{potencialTexto(l.resultado)}</span>
                      </span>
                      <span>
                        <span className="block text-xs text-apagado">{COLUNAS[5]}</span>
                        <span className="mt-0.5 block">{rotuloOrigem(l.utm_content)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <Dialogo
        aberto={!!selecionado}
        onFechar={() => setSelecionado(null)}
        aria-labelledby="detalhe-titulo"
        className="gaveta m-0 ml-auto h-[100dvh] max-h-none w-full max-w-full overflow-y-auto bg-white p-0 text-tinta sm:max-w-xl"
      >
        {selecionado && <DetalheLead lead={selecionado} onFechar={() => setSelecionado(null)} />}
      </Dialogo>

      <Dialogo
        aberto={confirmar}
        onFechar={() => setConfirmar(false)}
        aria-labelledby="confirmar-titulo"
        className="modal w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-tinta"
      >
        <div className="p-6">
          <p id="confirmar-titulo" className="text-base font-semibold leading-relaxed">
            Remover todos os leads de demonstração? Essa ação não pode ser desfeita.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setConfirmar(false)} className={BOTAO_SECUNDARIO}>Cancelar</button>
            <button type="button" onClick={remover}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#B42318] px-5 py-2 text-sm font-semibold text-white hover:bg-[#9A1D14]">
              Remover leads
            </button>
          </div>
        </div>
      </Dialogo>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-auto sm:top-5 sm:justify-end sm:px-6" role="status" aria-live="polite">
        {aviso && (
          <p className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl bg-tinta px-4 py-3 text-sm text-white shadow-xl motion-safe:animate-[modal-entra_.25s_ease-out]">
            <span aria-hidden="true" className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amarelo" />
            {aviso}
          </p>
        )}
      </div>
    </div>
  );
}
