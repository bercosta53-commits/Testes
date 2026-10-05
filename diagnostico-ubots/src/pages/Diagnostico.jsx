import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DiagnosticoRecuperacaoIA from "../DiagnosticoRecuperacaoIA.jsx";
import useTitulo from "../components/useTitulo.js";
import PainelDemo from "../components/PainelDemo.jsx";
import { atualizarLead, salvarLead } from "../lib/leads.js";
import { movimentoReduzido } from "../lib/movimento.js";
import { CENARIOS, formDemo } from "../lib/demo.js";

export default function Diagnostico() {
  useTitulo("Diagnóstico de recuperação com IA | Ubots");
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const utmContent = params.get("utm_content");

  const area = useRef(null);
  const [instancia, setInstancia] = useState({ chave: 0, cenario: null });
  const [formPreenchido, setFormPreenchido] = useState(null);

  const onLead = useCallback((payload) => salvarLead(payload, utmContent), [utmContent]);
  const onInteresse = useCallback((id) => {
    atualizarLead(id, { interesse: { em: new Date().toISOString() } });
  }, []);

  /* Cada cenário abre na captação; depois do primeiro "Preencher formulário", já vem preenchido. */
  const escolherCenario = (i) => {
    if (formPreenchido) setFormPreenchido({ ...formDemo(CENARIOS[i].respostas.tipo) });
    setInstancia((v) => ({ chave: v.chave + 1, cenario: i }));
  };

  const preencherFormulario = () => {
    const form = area.current?.querySelector('form[data-form="lead"]');
    if (!form) {
      const i = instancia.cenario ?? 0;
      setFormPreenchido({ ...formDemo(CENARIOS[i].respostas.tipo) });
      setInstancia((v) => ({ chave: v.chave + 1, cenario: i }));
      return;
    }
    setFormPreenchido({ ...formDemo(form.dataset.tipo) });
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
        onInteresse={onInteresse}
        respostasIniciais={cenario?.respostas}
        etapaInicial={cenario ? "captura" : undefined}
        formInicial={formPreenchido}
        persistir={!demo}
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
