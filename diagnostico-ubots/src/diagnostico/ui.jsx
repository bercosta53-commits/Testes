/* Peças visuais do diagnóstico (identidade Ubots do componente original). */
import { forwardRef } from "react";
import { AlertTriangle, Check, CircleDot } from "lucide-react";
import { C } from "./modelo.js";
import { STATUS } from "./leitura.js";

export function Marca() {
  return (
    <div className="flex items-center gap-2" aria-label="Ubots">
      <span style={{ width: 12, height: 12, borderRadius: "50% 50% 50% 0", background: C.yellow, display: "inline-block" }} />
      <span className="font-bold text-lg" style={{ color: C.ink, letterSpacing: "-0.02em" }}>ubots</span>
    </div>
  );
}

export function BotaoPrimario({ children, onClick, type = "button", disabled, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base focus:outline-none focus:ring-4 focus:ring-yellow-200 ${className}`}
      style={{ background: C.yellow, color: C.ink, opacity: disabled ? 0.6 : 1, minHeight: 52 }}
    >
      {children}
    </button>
  );
}

export function BotaoTexto({ children, onClick, className = "" }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-2 text-sm font-semibold px-2 py-2 rounded-md focus:outline-none focus:ring-4 focus:ring-yellow-200 hover:text-tinta ${className}`}
      style={{ color: C.muted }}>
      {children}
    </button>
  );
}

/* Opção de resposta. O número mostra o atalho de teclado (a partir de 640px). */
export function Opcao({ label, numero, selecionada, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selecionada}
      className="w-full text-left px-4 sm:px-5 py-4 rounded-xl flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-yellow-200 hover:border-tinta"
      style={{
        border: `2px solid ${selecionada ? C.ink : C.line}`,
        background: selecionada ? C.yellowSoft : C.card,
        color: C.ink,
        transition: "border-color .15s ease, background .15s ease",
        minHeight: 56,
      }}
    >
      <span aria-hidden="true" className="hidden sm:flex flex-shrink-0 items-center justify-center rounded-md text-xs font-semibold"
        style={{ width: 24, height: 24, border: `1.5px solid ${selecionada ? C.ink : C.line}`, color: C.muted }}>
        {numero}
      </span>
      <span className="flex-1 text-base">{label}</span>
      <span
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{ width: 24, height: 24, border: `2px solid ${selecionada ? C.ink : C.line}`, background: selecionada ? C.ink : "transparent" }}
      >
        {selecionada && <Check size={14} color={C.yellow} strokeWidth={3} />}
      </span>
    </button>
  );
}

export const Campo = forwardRef(function Campo({ id, label, erro, dica, children, ...props }, ref) {
  const descritores = [erro && `${id}-erro`, dica && `${id}-dica`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1" style={{ color: C.ink }}>{label}</label>
      <input
        id={id}
        ref={ref}
        {...props}
        aria-invalid={!!erro}
        aria-describedby={descritores}
        className="w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-4 focus:ring-yellow-200"
        style={{ border: `1.5px solid ${erro ? C.error : C.line}`, background: C.card, color: C.ink, minHeight: 48 }}
      />
      {erro && <p id={`${id}-erro`} className="text-sm mt-1" style={{ color: C.error }}>{erro}</p>}
      {dica && <p id={`${id}-dica`} className="text-sm mt-1" style={{ color: C.muted }}>{dica}</p>}
      {children}
    </div>
  );
});

/* Barra horizontal com faixa opcional e marcador (por exemplo, o tamanho da carteira). */
export function Barra({ rotulo, valor, largura, larguraFaixa, destaque, animar, marcador }) {
  const w = (x) => `${Math.max(0, Math.min(100, x))}%`;
  return (
    <div>
      <div className="flex justify-between items-baseline gap-3 mb-2">
        <span className="text-sm" style={{ color: C.muted }}>{rotulo}</span>
        <span className="font-bold text-lg text-right" style={{ color: C.ink }}>{valor}</span>
      </div>
      <div className="relative w-full rounded-full" style={{ height: 14, background: C.line }}>
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {larguraFaixa !== undefined && (
            <div className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: animar ? w(larguraFaixa) : "0%", background: C.yellowSoft, transition: "width 1s cubic-bezier(.2,.8,.2,1) .15s" }} />
          )}
          <div className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: animar ? w(largura) : "0%", background: destaque ? C.yellow : C.ink, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} />
        </div>
        {marcador !== undefined && marcador < 100 && (
          <span aria-hidden="true" className="absolute -top-1 -bottom-1 w-0.5 rounded-full" style={{ left: w(marcador), background: C.ink }} />
        )}
      </div>
    </div>
  );
}

export function Indicador({ rotulo, valor, apoio }) {
  return (
    <div className="rounded-xl p-4" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
      <p className="text-xs leading-snug" style={{ color: C.muted }}>{rotulo}</p>
      <p className="mt-1 text-xl font-bold leading-tight" style={{ color: C.ink, letterSpacing: "-0.01em" }}>{valor}</p>
      {apoio && <p className="mt-1 text-xs leading-snug" style={{ color: C.muted }}>{apoio}</p>}
    </div>
  );
}

const ESTILO_STATUS = {
  pronto: { fundo: "#DDF2E3", texto: "#17603A", Icone: Check },
  ajustar: { fundo: "#FFF4C7", texto: "#6A4D00", Icone: CircleDot },
  atencao: { fundo: "#FDE7DF", texto: "#8A2E12", Icone: AlertTriangle },
};

export function SeloStatus({ status }) {
  const { fundo, texto, Icone } = ESTILO_STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: fundo, color: texto }}>
      <Icone size={13} aria-hidden="true" strokeWidth={2.5} />
      {STATUS[status]}
    </span>
  );
}

export function Secao({ id, titulo, children, className = "" }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`scroll-mt-20 ${className}`}>
      <h2 id={`${id}-titulo`} className="font-bold text-xl sm:text-2xl mb-4" style={{ letterSpacing: "-0.02em" }}>{titulo}</h2>
      {children}
    </section>
  );
}

export function Cartao({ children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 sm:p-6 ${className}`} style={{ background: C.card, border: `1px solid ${C.line}` }}>
      {children}
    </div>
  );
}
