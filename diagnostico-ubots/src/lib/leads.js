/* Armazenamento dos leads do protótipo (sem backend). */
export const CHAVE_LEADS = "ubots_diag_leads";
const CHAVE_VISTO = "ubots_diag_painel_visto";

const novoId = () => {
  try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
};

export function lerLeads() {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE_LEADS));
    if (!Array.isArray(v)) return [];
    return v
      .filter((l) => l && l.lead && l.respostas)
      .sort((a, b) => String(b.enviado_em).localeCompare(String(a.enviado_em)));
  } catch {
    return [];
  }
}

export function salvarLead(payload, utmContent) {
  const lead = { id: novoId(), utm_content: utmContent || null, ...payload };
  try {
    localStorage.setItem(CHAVE_LEADS, JSON.stringify([lead, ...lerLeads()]));
  } catch {
    /* armazenamento indisponível: o fluxo do diagnóstico continua normalmente */
  }
  return lead;
}

export function limparLeads() {
  try { localStorage.removeItem(CHAVE_LEADS); } catch { /* sem armazenamento */ }
}

/* Momento da última visita ao painel, para o aviso de novo lead. */
export function lerUltimaVisita() {
  try { return localStorage.getItem(CHAVE_VISTO) || ""; } catch { return ""; }
}

export function registrarVisita() {
  try { localStorage.setItem(CHAVE_VISTO, new Date().toISOString()); } catch { /* sem armazenamento */ }
}
