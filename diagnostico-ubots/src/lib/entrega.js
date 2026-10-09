import { numerica, rotuloResposta } from "./calculo";
import { config, hubspotConfigurado } from "./config";
import { perguntas } from "./dados";
import { emitir } from "./eventos";
import { atualizarLead, salvarLead } from "./leads";

const CHAVE_PENDENTES = "ubots_diag_pendentes";
const TIMEOUT_MS = 8000;

/** Dados do lead + resultado, no formato interno (usado no painel e convertido para o HubSpot). */
export function montarPayload({ contato, respostas, analise, origem }) {
  const res = analise.res;
  const n = numerica(respostas);
  return {
    lead: contato,
    respostas,
    resultado: {
      nivel: res.nivel.nome,
      pontos: res.pontos,
      pontos_max: analise.pontosMax,
      capacidade_atual_mes: Math.round(res.atual),
      capacidade_ia_mes: res.ia.map(Math.round),
      valor_adicional_mes: res.extra.map(Math.round),
      saldo_atraso: n.contratos * n.ticket,
      ponto_critico: analise.critico?.nome ?? null,
      estimativa_aproximada: analise.aproximada,
    },
    origem,
    enviado_em: new Date().toISOString(),
  };
}

const resumoRespostas = (respostas) =>
  perguntas
    .map((p) => {
      const rotulo = rotuloResposta(p.id, respostas[p.id]);
      const extra = p.id === "integracao" && respostas.integracao_outro ? ` (${respostas.integracao_outro})` : "";
      return `${p.titulo} ${rotulo}${extra}`;
    })
    .join("\n");

const lerCookie = (nome) => {
  try {
    return document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`))?.[1] || undefined;
  } catch {
    return undefined;
  }
};

/** Converte o payload nos campos do formulário do HubSpot. */
export function camposHubspot(payload, extras = {}) {
  const c = config.hubspot.campos;
  const { lead, respostas, resultado: r } = payload;
  const valores = {
    [c.nome]: lead.nome,
    [c.email]: lead.email,
    [c.whatsapp]: lead.whatsapp,
    [c.instituicao]: lead.instituicao,
    [c.area]: lead.area,
    [c.tipo]: rotuloResposta("tipo", respostas.tipo),
    [c.nivel]: r.nivel,
    [c.pontos]: `${r.pontos} de ${r.pontos_max}`,
    [c.capacidadeAtual]: r.capacidade_atual_mes,
    [c.capacidadeIaMin]: r.capacidade_ia_mes[0],
    [c.capacidadeIaMax]: r.capacidade_ia_mes[1],
    [c.valorExtraMin]: r.valor_adicional_mes[0],
    [c.valorExtraMax]: r.valor_adicional_mes[1],
    [c.saldoAtraso]: r.saldo_atraso,
    [c.pontoCritico]: r.ponto_critico ?? "Nenhum",
    [c.aproximada]: r.estimativa_aproximada ? "Sim" : "Não",
    [c.respostas]: resumoRespostas(respostas),
    [c.origem]: payload.origem?.utm_content ?? "Acesso direto",
    ...extras,
  };
  return Object.entries(valores)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([name, value]) => ({ objectTypeId: "0-1", name, value: String(value) }));
}

/** Envia ao formulário do HubSpot (API pública de submissão, sem token). */
async function enviarAoHubspot(payload, { guid, extras } = {}) {
  const { portalId, formGuid, textoConsentimento } = config.hubspot;
  const corpo = {
    submittedAt: Date.now(),
    fields: camposHubspot(payload, extras),
    context: {
      hutk: lerCookie("hubspotutk"),
      pageUri: payload.origem?.pagina || window.location.href,
      pageName: document.title,
    },
    legalConsentOptions: { consent: { consentToProcess: true, text: textoConsentimento } },
  };
  const resposta = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${guid || formGuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout?.(TIMEOUT_MS),
    },
  );
  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(`HubSpot respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`);
  }
}

// ---- Fila de reenvio: se o envio falhar, o lead não se perde ----
const lerPendentes = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PENDENTES)) || [];
  } catch {
    return [];
  }
};
const gravarPendentes = (lista) => {
  try {
    localStorage.setItem(CHAVE_PENDENTES, JSON.stringify(lista));
  } catch {
    /* sem armazenamento: sem fila */
  }
};

/** Tenta reenviar o que ficou pendente (chamado ao abrir o diagnóstico). */
export async function reenviarPendentes() {
  if (!hubspotConfigurado()) return;
  const restantes = [];
  for (const item of lerPendentes()) {
    try {
      await enviarAoHubspot(item.payload, { guid: item.guid, extras: item.extras });
    } catch {
      restantes.push(item);
    }
  }
  gravarPendentes(restantes);
}

async function entregar(payload, { fila = true, ...opcoes } = {}) {
  if (!hubspotConfigurado()) {
    console.info("[Diagnóstico] HubSpot não configurado (modo de teste), nada foi enviado:", payload);
    return true;
  }
  try {
    await enviarAoHubspot(payload, opcoes);
    return true;
  } catch (e) {
    console.error("[Diagnóstico] falha ao enviar ao HubSpot, guardado para reenvio:", e);
    if (fila) gravarPendentes([...lerPendentes(), { payload, ...opcoes }]);
    return false;
  }
}

/** Entrega o lead. O resultado aparece para a pessoa mesmo que o envio falhe (fica na fila). */
export async function entregarLead(payload, utmContent) {
  const local = config.salvarLocal ? salvarLead(payload, utmContent) : null;
  const ok = await entregar(payload);
  emitir("lead_enviado", { nivel: payload.resultado.nivel, enviado: ok, origem: payload.origem?.utm_content ?? null });
  return { id: local?.id ?? null, payload, enviado: ok };
}

/** Registra o pedido de conversa, associado ao mesmo contato (e-mail) e ao resultado. Retorna true se registrou. */
export async function registrarPedidoConversa(lead) {
  const c = config.hubspot.campos;
  const em = new Date().toISOString();
  const ok = hubspotConfigurado()
    ? await entregar(lead.payload, {
        fila: false, // se falhar, a pessoa vê o erro e tenta de novo
        guid: config.hubspot.formGuidInteresse || undefined,
        extras: { [c.pediuConversa]: "Sim", [c.pedidoEm]: em },
      })
    : (console.info("[Diagnóstico] pedido de conversa (modo de teste):", lead.payload.lead.email), true);
  if (config.salvarLocal) atualizarLead(lead.id, { interesse: { em } });
  if (ok) emitir("pedido_conversa", { nivel: lead.payload.resultado.nivel });
  return ok;
}
