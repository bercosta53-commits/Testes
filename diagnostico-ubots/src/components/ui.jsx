import { Check } from "lucide-react";
import { cores } from "../lib/config";

export const focoPadrao =
  "cursor-pointer focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-transparent focus-visible:ring-4 focus-visible:ring-[#8A6A00]";

export function BotaoPrimario({ children, onClick, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-4 rounded-full font-semibold text-[15px] sm:text-base whitespace-nowrap ${focoPadrao}`}
      style={{ background: cores.yellow, color: cores.ink, opacity: disabled ? 0.7 : 1, minHeight: 52 }}
    >
      {children}
    </button>
  );
}

export function BotaoTexto({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold px-2 py-2 rounded-md hover:text-[#141414] ${focoPadrao}`}
      style={{ color: cores.muted }}
    >
      {children}
    </button>
  );
}

export function Opcao({ label, selecionada, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selecionada}
      className={`group w-full min-h-[56px] text-left px-5 py-4 rounded-xl flex items-center justify-between gap-3 border-2 transition-colors duration-150 motion-safe:active:scale-[.99] ${
        selecionada
          ? "border-[#141414] bg-[#FFF4C7]"
          : "border-[#ECE4CF] bg-white hover:border-[#B9AD8C] hover:bg-[#FFFDF5]"
      } ${focoPadrao}`}
    >
      <span className="text-base">{label}</span>
      <span
        className={`flex items-center justify-center rounded-full shrink-0 w-6 h-6 border-2 ${
          selecionada ? "border-[#141414] bg-[#141414]" : "border-[#ECE4CF] group-hover:border-[#B9AD8C]"
        }`}
      >
        {selecionada && <Check size={14} color={cores.yellow} strokeWidth={3} />}
      </span>
    </button>
  );
}

export function Campo({ id, label, erro, campoRef, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1" style={{ color: cores.ink }}>
        {label}
      </label>
      <input
        id={id}
        ref={campoRef}
        {...props}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={`w-full px-4 py-3 rounded-lg text-base placeholder:text-[#A39A85] ${focoPadrao}`}
        style={{
          border: `1.5px solid ${erro ? cores.error : "#9A917C"}`,
          background: cores.card,
          color: cores.ink,
          minHeight: 48,
        }}
      />
      {erro && (
        <p id={`${id}-erro`} className="text-sm mt-1" style={{ color: cores.error }}>
          {erro}
        </p>
      )}
    </div>
  );
}

export function BarraProgresso({ largura, animar, reduzido, altura = 6 }) {
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height: altura, background: cores.line }}>
      <div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          width: animar ? `${largura}%` : "0%",
          background: cores.ink,
          transition: reduzido ? "none" : "width .9s cubic-bezier(.2,.8,.2,1)",
        }}
      />
    </div>
  );
}

const estiloNivel = {
  "Preparar a base": { fundo: "#FDE7DF", texto: "#8A2E12", ponto: "#E5673D" },
  "Pronta para piloto": { fundo: "#FFF4C7", texto: "#6A4D00", ponto: "#FFC800" },
  "Pronta para escalar": { fundo: "#DDF2E3", texto: "#17603A", ponto: "#2E9E5B" },
};

export function SeloNivel({ nivel }) {
  const e = estiloNivel[nivel] || estiloNivel["Pronta para piloto"];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: e.fundo, color: e.texto }}
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: e.ponto }} />
      {nivel}
    </span>
  );
}
