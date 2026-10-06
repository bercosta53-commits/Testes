import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { calcular } from "../DiagnosticoRecuperacaoIA.jsx";
import SeloNivel from "./SeloNivel.jsx";

/* Seletor flutuante do modo demonstração (?demo=1). Só aparece na apresentação. */
export default function PainelDemo({ cenarios, ativo, onCenario, onPreencher }) {
  // Abaixo de 1536px começa recolhido e se recolhe após cada ação; "Preencher formulário"
  // recolhe em qualquer largura. Assim o seletor não cobre o formulário nem as opções.
  const larguraMin = (px) => {
    try { return window.matchMedia(`(min-width: ${px}px)`).matches; } catch { return true; }
  };
  const [aberto, setAberto] = useState(() => larguraMin(1536));
  const agir = (acao, recolher = false) => { acao(); if (recolher || !larguraMin(1536)) setAberto(false); };

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
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-apagado hover:text-tinta"
        >
          <X size={14} aria-hidden="true" /> Ocultar
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {cenarios.map((c, i) => (
          <li key={c.nome}>
            <button
              type="button"
              onClick={() => agir(() => onCenario(i))}
              aria-pressed={ativo === i}
              className={`flex w-full flex-col items-start gap-1.5 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors ${ativo === i ? "border-tinta bg-amarelo-suave" : "border-linha hover:border-tinta"}`}
            >
              <span>{c.nome}</span>
              <SeloNivel nivel={calcular(c.respostas).nivel.nome} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => agir(onPreencher, true)}
        className="mt-3 w-full rounded-full bg-tinta px-4 py-3 text-sm font-semibold text-white foco-claro hover:bg-black"
      >
        Preencher formulário
      </button>
    </aside>
  );
}
