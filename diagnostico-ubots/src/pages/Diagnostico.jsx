import { FlaskConical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Fluxo from "../components/Fluxo";
import { SeloNivel } from "../components/ui";
import { analisar } from "../lib/calculo";
import { cenariosDemo, formularioDemo } from "../lib/dados";
import { reduzirMovimento, usePageTitle } from "../lib/util";

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
        utmContent={utmContent}
        respostasIniciais={cenario?.respostas}
        etapaInicial={cenario ? "captura" : undefined}
        formInicial={formDemo}
        onReiniciar={() => setEstado((s) => ({ ...s, cenario: null }))}
      />
      {demo && <ModoDemo ativo={estado.cenario} onCenario={abrirCenario} onPreencher={preencherFormulario} />}
    </div>
  );
}
