// Configuração. Valores vêm de variáveis de ambiente (VITE_*) e podem ser
// sobrescritos em tempo de execução com `configurar()` (usado pelo bundle incorporável).
const env = import.meta.env || {};

export const config = {
  ctaUrl: "https://ubots.com.br/",
  // Materiais do CTA secundário do resultado.
  playbookUrl: env.VITE_PLAYBOOK_URL || "https://ubots.com.br/",
  listaInteresseUrl: env.VITE_LISTA_INTERESSE_URL || "https://ubots.com.br/",
  diasUteisMes: 21,
  // true no protótipo: guarda os leads no navegador para o /painel. false quando incorporado na LP.
  salvarLocal: true,
  hubspot: {
    portalId: env.VITE_HUBSPOT_PORTAL_ID || "",
    formGuid: env.VITE_HUBSPOT_FORM_GUID || "",
    // Opcional: form separado para o pedido de conversa (padrão: o mesmo form).
    formGuidInteresse: env.VITE_HUBSPOT_FORM_GUID_INTERESSE || "",
    // Nomes internos das propriedades do HubSpot. Todas precisam existir como campos do form.
    // Detalhes em docs/INTEGRACAO.md.
    campos: {
      nome: "firstname",
      email: "email",
      whatsapp: "phone",
      instituicao: "company",
      area: "diag_area_atuacao",
      tipo: "diag_tipo_instituicao",
      nivel: "diag_nivel_prontidao",
      pontos: "diag_pontos",
      capacidadeAtual: "diag_renegociacoes_mes_hoje",
      capacidadeIaMin: "diag_renegociacoes_mes_ia_min",
      capacidadeIaMax: "diag_renegociacoes_mes_ia_max",
      valorExtraMin: "diag_potencial_adicional_min",
      valorExtraMax: "diag_potencial_adicional_max",
      saldoAtraso: "diag_saldo_atraso",
      pontoCritico: "diag_ponto_critico",
      aproximada: "diag_estimativa_aproximada",
      respostas: "diag_respostas",
      origem: "diag_origem",
      pediuConversa: "diag_pediu_conversa",
      pedidoEm: "diag_pedido_conversa_em",
    },
    textoConsentimento: "Autorizo a Ubots a entrar em contato sobre este diagnóstico.",
  },
};

/** Sobrescreve a configuração (mescla um nível de profundidade em `hubspot`). */
export function configurar(parcial = {}) {
  const { hubspot, ...resto } = parcial;
  Object.assign(config, resto);
  if (hubspot) {
    const { campos, ...restoHs } = hubspot;
    Object.assign(config.hubspot, restoHs);
    if (campos) Object.assign(config.hubspot.campos, campos);
  }
}

export const hubspotConfigurado = () => !!(config.hubspot.portalId && config.hubspot.formGuid);

export const cores = {
  bg: "#FFFBEF",
  card: "#FFFFFF",
  ink: "#141414",
  muted: "#6B6558",
  line: "#ECE4CF",
  yellow: "#FFC800",
  yellowSoft: "#FFF4C7",
  error: "#B42318",
};
