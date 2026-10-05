import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DiagnosticoRecuperacaoIA from "../DiagnosticoRecuperacaoIA.jsx";
import useTitulo from "../components/useTitulo.js";
import PainelDemo from "../components/PainelDemo.jsx";
import { salvarLead } from "../lib/leads.js";
import { movimentoReduzido } from "../lib/movimento.js";
import { CENARIOS, FORM_DEMO } from "../lib/demo.js";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Diagnostico() {
  useTitulo("Diagnóstico de recuperação com IA | Ubots");
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const utmContent = params.get("utm_content");

  const area = useRef(null);
  const [instancia, setInstancia] = useState({ chave: 0, cenario: null });
  const [formDemo, setFormDemo] = useState(null);

  const onLead = useCallback(async (payload) => {
    salvarLead(payload, utmContent);
    await espera(500);
  }, [utmContent]);

  const escolherCenario = (i) => setInstancia((v) => ({ chave: v.chave + 1, cenario: i }));

  const preencherFormulario = () => {
    const form = area.current?.querySelector("form");
    setFormDemo({ ...FORM_DEMO });
    if (!form) {
      // Fora da prévia: abre o cenário atual (ou o primeiro) já com o formulário preenchido.
      setInstancia((v) => ({ chave: v.chave + 1, cenario: v.cenario ?? 0 }));
      return;
    }
    const enviar = form.querySelector('button[type="submit"]');
    requestAnimationFrame(() => {
      enviar?.scrollIntoView({ behavior: movimentoReduzido() ? "auto" : "smooth", block: "center" });
      enviar?.focus({ preventScroll: true });
    });
  };

  const cenario = instancia.cenario !== null ? CENARIOS[instancia.cenario] : null;

  return (
    <div ref={area} className={demo ? "pb-24 sm:pb-80 lg:pb-0" : undefined}>
      <DiagnosticoRecuperacaoIA
        key={instancia.chave}
        onLead={onLead}
        respostasIniciais={cenario?.respostas}
        etapaInicial={cenario ? "previa" : undefined}
        formInicial={formDemo}
      />
      {demo && (
        <PainelDemo
          cenarios={CENARIOS}
          ativo={instancia.cenario}
          onCenario={escolherCenario}
          onPreencher={preencherFormulario}
        />
      )}
    </div>
  );
}
