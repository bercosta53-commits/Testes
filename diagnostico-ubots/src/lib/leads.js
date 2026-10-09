// Persistência dos leads de demonstração no localStorage do navegador.
const CHAVE_LEADS = "ubots_diag_leads";
const CHAVE_PAINEL_VISTO = "ubots_diag_painel_visto";

const novoId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

export function listarLeads() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_LEADS));
    return Array.isArray(dados)
      ? dados
          .filter((l) => l && l.lead && l.respostas)
          .sort((a, b) => String(b.enviado_em).localeCompare(String(a.enviado_em)))
      : [];
  } catch {
    return [];
  }
}

export function salvarLead(payload, utmContent) {
  const lead = { id: novoId(), utm_content: utmContent || null, ...payload };
  try {
    localStorage.setItem(CHAVE_LEADS, JSON.stringify([lead, ...listarLeads()]));
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
  return lead;
}

export function atualizarLead(id, alteracoes) {
  if (!id) return null;
  const leads = listarLeads();
  const i = leads.findIndex((l) => l.id === id);
  if (i < 0) return null;
  leads[i] = { ...leads[i], ...alteracoes };
  try {
    localStorage.setItem(CHAVE_LEADS, JSON.stringify(leads));
  } catch {
    return null;
  }
  return leads[i];
}

export function limparLeads() {
  try {
    localStorage.removeItem(CHAVE_LEADS);
  } catch {
    /* ignora */
  }
}

export const painelVistoEm = () => {
  try {
    return localStorage.getItem(CHAVE_PAINEL_VISTO) || "";
  } catch {
    return "";
  }
};

export const marcarPainelVisto = () => {
  try {
    localStorage.setItem(CHAVE_PAINEL_VISTO, new Date().toISOString());
  } catch {
    /* ignora */
  }
};

export const CHAVE_STORAGE_LEADS = CHAVE_LEADS;
