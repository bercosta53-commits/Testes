// Bundle incorporável: <ubots-diagnostico> para colar em qualquer página (ex.: LP da Ubots no Lovable).
// O CSS fica dentro de um Shadow DOM, então nada vaza para a página nem herda estilos dela.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Fluxo from "./components/Fluxo";
import css from "./index.css?inline";
import { configurar } from "./lib/config";

const ATRIBUTOS = {
  "portal-id": (v) => ({ hubspot: { portalId: v } }),
  "form-guid": (v) => ({ hubspot: { formGuid: v } }),
  "form-guid-interesse": (v) => ({ hubspot: { formGuidInteresse: v } }),
  "playbook-url": (v) => ({ playbookUrl: v }),
  "lista-interesse-url": (v) => ({ listaInteresseUrl: v }),
};

class UbotsDiagnostico extends HTMLElement {
  connectedCallback() {
    if (this.raiz) return;
    // Ordem de precedência: window.UbotsDiagnosticoConfig < atributos do elemento.
    configurar({ salvarLocal: false, ...(window.UbotsDiagnosticoConfig || {}) });
    for (const [attr, montar] of Object.entries(ATRIBUTOS)) {
      const valor = this.getAttribute(attr);
      if (valor) configurar(montar(valor));
    }
    const utmContent =
      this.getAttribute("utm-content") || new URLSearchParams(window.location.search).get("utm_content") || undefined;

    const sombra = this.attachShadow({ mode: "open" });
    const estilo = document.createElement("style");
    estilo.textContent = `:host{display:block}${css}`;
    const montagem = document.createElement("div");
    sombra.append(estilo, montagem);

    this.raiz = createRoot(montagem);
    this.raiz.render(
      <StrictMode>
        <Fluxo incorporado utmContent={utmContent} />
      </StrictMode>,
    );
  }

  disconnectedCallback() {
    this.raiz?.unmount();
    this.raiz = null;
    // Permite reconectar: o shadow root já existe, então limpamos o conteúdo.
    this.shadowRoot?.replaceChildren();
  }
}

if (!customElements.get("ubots-diagnostico")) customElements.define("ubots-diagnostico", UbotsDiagnostico);
