import { Check, Clock, Copy, Mail, MessageCircle, PhoneCall, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SeloNivel } from "../components/ui";
import { rotuloResposta } from "../lib/calculo";
import { perguntas } from "../lib/dados";
import { dataHora, formatarFone, moeda } from "../lib/formatar";
import {
  abordagemPorNivel,
  analiseDoLead,
  capacidadeTexto,
  linhaDeAbertura,
  origem,
  perguntasPrimeiraLigacao,
  potencialAdicionalTexto,
} from "../lib/painel";

export async function copiarTexto(texto) {
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
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export function SeloInteresse() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-tinta px-2.5 py-1 text-xs font-semibold text-white">
      <PhoneCall size={12} aria-hidden="true" className="text-amarelo" /> Pediu conversa
    </span>
  );
}

function SeloDimensao({ pontos }) {
  const [fundo, texto, rotulo] =
    pontos >= 2
      ? ["#DDF2E3", "#17603A", "Pronto"]
      : pontos === 1
        ? ["#FFF4C7", "#6A4D00", "Ajustar"]
        : ["#FDE7DF", "#8A2E12", "Resolver"];
  return (
    <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: fundo, color: texto }}>
      {rotulo}
    </span>
  );
}

const Bloco = ({ titulo, children }) => (
  <section className="border-t border-linha px-5 py-6 sm:px-7">
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-apagado">{titulo}</h3>
    {children}
  </section>
);

const Metrica = ({ rotulo, valor }) => (
  <div className="bg-creme p-4">
    <dt className="text-xs text-apagado">{rotulo}</dt>
    <dd className="mt-1 text-sm font-semibold leading-snug">{valor}</dd>
  </div>
);

/** Conteúdo da gaveta com o detalhe de um lead. */
export default function DetalheLead({ lead, onFechar }) {
  const [copiado, setCopiado] = useState(false);
  const r = lead.resultado;
  const analise = analiseDoLead(lead);
  const dims = analise?.dims ?? [];
  const abertura = linhaDeAbertura(lead);
  const fases = [...new Set(perguntas.map((p) => p.fase))];

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
          <p className="mt-1 text-sm text-apagado">
            {lead.lead.instituicao} · {rotuloResposta("tipo", lead.respostas.tipo)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SeloNivel nivel={r.nivel} />
            {lead.interesse && <SeloInteresse />}
          </div>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-linha hover:border-tinta"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="grid gap-x-6 gap-y-2 px-5 py-5 text-sm sm:grid-cols-2 sm:px-7">
        <a href={`mailto:${lead.lead.email}`} className="flex min-w-0 items-center gap-2 rounded-md py-1 hover:underline">
          <Mail size={16} aria-hidden="true" className="flex-shrink-0 text-apagado" />
          <span className="truncate">{lead.lead.email}</span>
        </a>
        <a
          href={`https://wa.me/55${lead.lead.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md py-1 hover:underline"
        >
          <MessageCircle size={16} aria-hidden="true" className="flex-shrink-0 text-apagado" />
          {formatarFone(lead.lead.whatsapp)}
        </a>
        <p className="flex items-center gap-2 py-1">
          <Clock size={16} aria-hidden="true" className="flex-shrink-0 text-apagado" />
          {dataHora(lead.enviado_em)}
        </p>
        <p className="flex items-center gap-2 py-1">
          <span aria-hidden="true" className="h-2 w-2 flex-shrink-0 rounded-full bg-amarelo ring-4 ring-amarelo-suave" />
          {origem(lead.utm_content)}
        </p>
        {lead.interesse && (
          <p className="flex items-center gap-2 py-1 font-semibold sm:col-span-2">
            <PhoneCall size={16} aria-hidden="true" className="flex-shrink-0" />
            Pediu conversa em {dataHora(lead.interesse.em)}
          </p>
        )}
      </div>

      <dl className="mx-5 mb-6 grid gap-px overflow-hidden rounded-2xl border border-linha bg-linha sm:mx-7 sm:grid-cols-2">
        <Metrica rotulo="Renegociações por mês" valor={capacidadeTexto(r)} />
        <Metrica rotulo="Potencial adicional" valor={potencialAdicionalTexto(r)} />
        <Metrica rotulo="Saldo em atraso estimado" valor={moeda(lead.respostas.contratos * lead.respostas.ticket)} />
        <Metrica rotulo="Ponto crítico" valor={analise?.critico?.nome ?? "Nenhum: todas as dimensões com 2 pontos ou mais"} />
      </dl>

      {analise && (
        <Bloco titulo="O que o lead viu no resultado">
          <p className="text-[0.95rem] leading-relaxed">{analise.resumo}</p>
          <p className="mb-2 mt-4 text-sm font-bold">Por onde começar</p>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[0.95rem] leading-relaxed">
            {analise.passos.map((p) => (
              <li key={p.rotulo}>
                <span className="font-semibold">{p.rotulo}:</span> {p.texto}
                <span className="block text-apagado">Pronto quando: {p.pronto}</span>
              </li>
            ))}
          </ol>
        </Bloco>
      )}

      <Bloco titulo="Respostas">
        <div className="flex flex-col gap-6">
          {fases.map((fase) => (
            <div key={fase}>
              <p className="mb-2 text-sm font-bold">{fase}</p>
              <dl className="divide-y divide-linha rounded-xl border border-linha">
                {perguntas
                  .filter((p) => p.fase === fase)
                  .map((p) => (
                    <div key={p.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_auto] sm:gap-4">
                      <dt className="text-sm text-apagado">{p.titulo}</dt>
                      <dd className="text-sm font-semibold sm:text-right">{rotuloResposta(p.id, lead.respostas[p.id])}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Prontidão por dimensão">
        <p className="mb-4 text-sm">
          <span className="font-bold">{r.pontos} de {r.pontos_max} pontos</span>
        </p>
        <ul className="flex flex-col gap-4">
          {dims.map((d) => (
            <li key={d.id}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{d.nome}</span>
                <span className="flex items-center gap-2">
                  <SeloDimensao pontos={d.pontos} />
                  <span className="font-bold tabular-nums">{d.pontos}/{d.max}</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-linha" aria-hidden="true">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max((d.pontos / d.max) * 100, 3)}%`, background: d.pontos >= 2 ? "#FFC800" : "#141414" }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Bloco>

      <Bloco titulo="Sugestão de abordagem">
        <p className="text-[0.95rem] leading-relaxed">{abordagemPorNivel[r.nivel]}</p>
        {analise && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold">Perguntas para a primeira ligação</p>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.95rem] leading-relaxed">
              {perguntasPrimeiraLigacao[analise.critico?.id ?? "nenhum"].map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5 rounded-2xl bg-tinta p-5 text-white">
          <p className="text-xs font-semibold text-amarelo">Linha de abertura sugerida para o SDR</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed">{abertura}</p>
          <button
            type="button"
            onClick={async () => setCopiado(await copiarTexto(abertura))}
            className="foco-claro mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-amarelo px-4 py-2 text-sm font-semibold text-tinta"
          >
            {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
          <span className="sr-only" role="status">{copiado ? "Copiado" : ""}</span>
        </div>
      </Bloco>
    </div>
  );
}
