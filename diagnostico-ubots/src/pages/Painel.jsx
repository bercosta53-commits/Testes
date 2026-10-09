import { Download, Inbox, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Dialogo from "../components/Dialogo";
import Logo from "../components/Logo";
import { SeloNivel } from "../components/ui";
import { rotuloResposta } from "../lib/calculo";
import {
  CHAVE_STORAGE_LEADS,
  limparLeads,
  listarLeads,
  marcarPainelVisto,
  painelVistoEm,
} from "../lib/leads";
import { analiseDoLead, capacidadeTexto, gerarCsv, origem, potencialAdicionalTexto } from "../lib/painel";
import { usePageTitle } from "../lib/util";
import DetalheLead, { SeloInteresse } from "./DetalheLead";

const colunas = ["Contato", "Instituição", "Nível", "Renegociações por mês", "Potencial adicional", "Origem"];

const botaoSecundario =
  "inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-linha bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-tinta disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-linha";

const pontoCritico = (lead) => {
  const critico = analiseDoLead(lead)?.critico;
  return critico ? `Ponto crítico: ${critico.nome.replace(/^./, (c) => c.toLowerCase())}` : null;
};

const avisoNovoLead = (lead) => `Novo diagnóstico recebido: ${lead.lead.instituicao}, ${lead.resultado.nivel}.`;

function baixarCsv(leads) {
  const blob = new Blob([gerarCsv(leads)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-diagnostico-${new Intl.DateTimeFormat("sv-SE").format(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Painel() {
  usePageTitle("Leads do diagnóstico | Ubots");
  const [leads, setLeads] = useState(listarLeads);
  const [abertoId, setAbertoId] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const vistoEm = useRef(painelVistoEm());
  const tituloRef = useRef(null);
  const aberto = leads.find((l) => l.id === abertoId) ?? null;
  const mostrarAviso = aviso && !aberto && !confirmando;

  // Ao abrir: avisa se há lead novo desde a última visita.
  useEffect(() => {
    const maisRecente = listarLeads()[0];
    if (maisRecente && String(maisRecente.enviado_em) > vistoEm.current) setAviso(avisoNovoLead(maisRecente));
    else marcarPainelVisto();
  }, []);

  useEffect(() => {
    if (!mostrarAviso) return;
    marcarPainelVisto();
    const t = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(t);
  }, [mostrarAviso]);

  // Atualiza em tempo real quando outra aba registra um lead.
  useEffect(() => {
    const aoMudar = (evento) => {
      if (evento.key !== null && evento.key !== CHAVE_STORAGE_LEADS) return;
      const atuais = listarLeads();
      if (
        atuais.length &&
        atuais[0].id !== leads[0]?.id &&
        String(atuais[0].enviado_em) > String(leads[0]?.enviado_em ?? "")
      ) {
        setAviso(avisoNovoLead(atuais[0]));
      }
      setLeads(atuais);
    };
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, [leads]);

  const remover = () => {
    limparLeads();
    setLeads([]);
    setConfirmando(false);
    requestAnimationFrame(() => tituloRef.current?.focus());
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-linha bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link to="/" className="rounded-md"><Logo /></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 ref={tituloRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.03em] focus:outline-none sm:text-4xl">
              Leads do diagnóstico
            </h1>
            <p className="mt-3 text-base leading-relaxed text-apagado">
              Uma visão das informações que chegam ao time comercial após cada diagnóstico. Dados de demonstração.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:shrink-0">
            <button type="button" onClick={() => baixarCsv(leads)} disabled={!leads.length} className={botaoSecundario}>
              <Download size={16} aria-hidden="true" /> Exportar CSV
            </button>
            <button type="button" onClick={() => setConfirmando(true)} disabled={!leads.length} className={botaoSecundario}>
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
              <Link to="/diagnostico" className="font-mono text-sm font-semibold text-tinta underline decoration-amarelo decoration-2 underline-offset-4">
                /diagnostico
              </Link>
              , os dados aparecem aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 hidden overflow-hidden rounded-2xl border border-linha bg-white lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-creme">
                  <tr>
                    {colunas.map((c) => (
                      <th key={c} scope="col" className="px-4 py-3 text-xs font-semibold text-apagado">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => setAbertoId(l.id)}
                      className="cursor-pointer border-t border-linha align-top transition-colors hover:bg-amarelo-suave/50"
                    >
                      <td className="px-4 py-4">
                        <button type="button" className="text-left font-semibold underline-offset-4 hover:underline">{l.lead.nome}</button>
                        <p className="mt-0.5 max-w-[200px] truncate text-xs text-apagado">{l.lead.email}</p>
                        {l.interesse && <div className="mt-2"><SeloInteresse /></div>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{l.lead.instituicao}</p>
                        <p className="mt-0.5 text-xs text-apagado">{rotuloResposta("tipo", l.respostas.tipo)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <SeloNivel nivel={l.resultado.nivel} />
                        {pontoCritico(l) && <p className="mt-2 max-w-[170px] text-xs leading-snug text-apagado">{pontoCritico(l)}</p>}
                      </td>
                      <td className="max-w-[220px] px-4 py-4 leading-snug">{capacidadeTexto(l.resultado)}</td>
                      <td className="px-4 py-4 font-semibold leading-snug">{potencialAdicionalTexto(l.resultado)}</td>
                      <td className="px-4 py-4 text-apagado">{origem(l.utm_content)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:hidden">
              {leads.map((l) => (
                <li key={l.id} className="flex">
                  <button
                    type="button"
                    onClick={() => setAbertoId(l.id)}
                    className="flex w-full flex-col rounded-2xl border border-linha bg-white p-5 text-left transition-colors hover:border-tinta"
                  >
                    <span className="block font-bold">{l.lead.nome}</span>
                    <span className="mt-0.5 block text-sm text-apagado">
                      {l.lead.instituicao} · {rotuloResposta("tipo", l.respostas.tipo)}
                    </span>
                    <span className="mt-3 flex flex-wrap gap-2">
                      <SeloNivel nivel={l.resultado.nivel} />
                      {l.interesse && <SeloInteresse />}
                    </span>
                    {pontoCritico(l) && <span className="mt-2 block text-xs text-apagado">{pontoCritico(l)}</span>}
                    <span className="mt-4 grid w-full gap-3 border-t border-linha pt-4 text-sm">
                      <span>
                        <span className="block text-xs text-apagado">{colunas[3]}</span>
                        <span className="mt-0.5 block leading-snug">{capacidadeTexto(l.resultado)}</span>
                      </span>
                      <span>
                        <span className="block text-xs text-apagado">{colunas[4]}</span>
                        <span className="mt-0.5 block font-semibold">{potencialAdicionalTexto(l.resultado)}</span>
                      </span>
                      <span>
                        <span className="block text-xs text-apagado">{colunas[5]}</span>
                        <span className="mt-0.5 block">{origem(l.utm_content)}</span>
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
        aberto={!!aberto}
        onFechar={() => setAbertoId(null)}
        aria-labelledby="detalhe-titulo"
        className="gaveta m-0 ml-auto h-[100dvh] max-h-none w-full max-w-full overflow-y-auto bg-white p-0 text-tinta sm:max-w-xl"
      >
        {aberto && <DetalheLead lead={aberto} onFechar={() => setAbertoId(null)} />}
      </Dialogo>

      <Dialogo
        aberto={confirmando}
        onFechar={() => setConfirmando(false)}
        aria-labelledby="confirmar-titulo"
        className="modal w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-tinta"
      >
        <div className="p-6">
          <p id="confirmar-titulo" className="text-base font-semibold leading-relaxed">
            Remover todos os leads de demonstração? Essa ação não pode ser desfeita.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setConfirmando(false)} className={botaoSecundario}>Cancelar</button>
            <button
              type="button"
              onClick={remover}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#B42318] px-5 py-2 text-sm font-semibold text-white hover:bg-[#9A1D14]"
            >
              Remover leads
            </button>
          </div>
        </div>
      </Dialogo>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-auto sm:top-5 sm:justify-end sm:px-6"
        role="status"
        aria-live="polite"
      >
        {mostrarAviso && (
          <p className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl bg-tinta px-4 py-3 text-sm text-white shadow-xl motion-safe:animate-[modal-entra_.25s_ease-out]">
            <span aria-hidden="true" className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amarelo" />
            {aviso}
          </p>
        )}
      </div>
    </div>
  );
}
