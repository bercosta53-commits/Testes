// @ts-check
/**
 * Adaptador de apresentação (seção 10): snapshot → VisaoIntegradaConta[].
 * Funções puras. Não escreve no snapshot, não corrige dados em silêncio,
 * não cria campos e não recria contas por nome (preserva o ID opaco).
 */
import { DIMENSOES, MODELO, NOMES_DIMENSAO } from './config.js';
import { avaliarUmaFaltante, classificar, proximidadeA1 } from './modelo.js';
import { EVIDENCIA_NECESSARIA } from './mapeamento.js';
import { fmtData, numeroValido } from './numeros.js';

/** @typedef {import('./tipos').ChaveDimensao} ChaveDimensao */
/** @typedef {import('./tipos').DimensaoIntegrada} DimensaoIntegrada */
/** @typedef {import('./tipos').MapeamentoDimensao} MapeamentoDimensao */
/** @typedef {import('./tipos').Mapeamento} Mapeamento */
/** @typedef {import('./tipos').VisaoIntegradaConta} VisaoIntegradaConta */
/** @typedef {import('./tipos').Snapshot} Snapshot */
/** @typedef {import('./tipos').OpcoesAdaptador} OpcoesAdaptador */
/** @typedef {import('./tipos').ResultadoAdaptador} ResultadoAdaptador */

/**
 * Lê um caminho com pontos ("v2.icp.score").
 * @param {unknown} obj @param {string | null | undefined} caminho
 * @returns {unknown}
 */
export function ler(obj, caminho) {
  if (!caminho) return undefined;
  /** @type {unknown} */
  let atual = obj;
  for (const parte of caminho.split('.')) {
    if (atual == null || typeof atual !== 'object') return undefined;
    atual = /** @type {Record<string, unknown>} */ (atual)[parte];
  }
  return atual;
}

/** @param {unknown} obj @param {string[]} candidatos */
function primeiro(obj, candidatos) {
  for (const c of candidatos) {
    const v = ler(obj, c);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

/** @param {unknown} v */
function texto(v) {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

/** Data comprovável: só aceita ISO 8601 (aaaa-mm-dd...). @param {unknown} v */
export function dataIso(v) {
  if (typeof v !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}/.test(v)) return null;
  const t = Date.parse(v.length === 10 ? v + 'T00:00:00Z' : v);
  return Number.isFinite(t) ? v : null;
}

/**
 * Apenas http(s). @param {unknown} v
 * @returns {import('./tipos').Fonte[]}
 */
export function fontesSeguras(v) {
  if (!Array.isArray(v)) return [];
  /** @type {import('./tipos').Fonte[]} */
  const r = [];
  for (const item of v) {
    const url = typeof item === 'string' ? item : item && typeof item === 'object' ? /** @type {any} */ (item).url : null;
    const titulo = item && typeof item === 'object' ? texto(/** @type {any} */ (item).titulo) : null;
    if (typeof url !== 'string') continue;
    try {
      const u = new URL(url);
      if (u.protocol === 'http:' || u.protocol === 'https:') r.push({ url: u.href, titulo });
    } catch { /* URL inválida: ignorada */ }
  }
  return r;
}

/** @param {MapeamentoDimensao} m */
function origemDe(m) {
  return { campoOrigem: m.campoOrigem ?? null, escalaOriginal: m.escalaOriginal ?? null, transformacao: m.transformacao ?? null, mapeamento: m.mapeamento };
}

/**
 * @param {Record<string, unknown>} conta
 * @param {MapeamentoDimensao} m
 * @param {OpcoesAdaptador} opcoes
 * @returns {DimensaoIntegrada}
 */
export function adaptarDimensao(conta, m, opcoes = {}) {
  /** @type {DimensaoIntegrada} */
  const d = {
    nota: null, resumo: null, status: 'sem_avaliacao', motivoSemNota: null, semAchados: false,
    entraNoCalculo: false, motivoExclusao: null, dataReferencia: null, fontes: [], origem: origemDe(m), pendenciasQualidade: []
  };

  if (opcoes.modoApresentacao && m.ocultaEmApresentacao) {
    d.motivoSemNota = 'oculto_modo_apresentacao';
    d.motivoExclusao = 'Indisponível nesta visão (modo apresentação).';
    return d;
  }
  if (m.mapeamento !== 'documentado' || !m.campoOrigem || typeof m.converter !== 'function') {
    d.motivoSemNota = m.mapeamento === 'indisponivel' ? 'nao_coletado' : 'metodo_nao_mapeado';
    d.motivoExclusao = m.mapeamento === 'indisponivel' ? 'Dimensão indisponível no projeto.' : 'Pendente de mapeamento: método original ainda não documentado na escala 1–5.';
    return d;
  }

  d.resumo = texto(ler(conta, m.campoResumo));
  d.dataReferencia = dataIso(ler(conta, m.campoData));
  d.fontes = fontesSeguras(ler(conta, m.campoFontes));
  d.semAchados = ler(conta, m.campoSemAchados) === true;

  const bruto = ler(conta, m.campoOrigem);
  if (bruto === undefined || bruto === null) {
    d.motivoSemNota = d.semAchados ? null : 'nao_coletado';
    d.motivoExclusao = d.semAchados
      ? 'Busca concluída sem achados; o método oficial não produziu nota.'
      : 'Nenhuma busca ou avaliação realizada.';
    return d;
  }
  if (!numeroValido(bruto)) {
    d.motivoSemNota = 'fora_do_intervalo';
    d.pendenciasQualidade.push('valor ' + JSON.stringify(bruto) + ' não numérico em ' + m.campoOrigem);
    d.motivoExclusao = 'Dado inconsistente.';
    return d;
  }
  const v = /** @type {number} */ (bruto);
  if ((m.min != null && v < m.min) || (m.max != null && v > m.max)) {
    d.motivoSemNota = 'fora_do_intervalo';
    d.pendenciasQualidade.push('valor ' + String(v).replace('.', ',') + ' fora do intervalo ' + (m.escalaOriginal || m.min + '-' + m.max));
    d.motivoExclusao = 'Dado inconsistente.';
    return d;
  }
  let nota = m.converter(v);
  const { min, max } = MODELO.escala;
  if (!numeroValido(nota) || nota < min - MODELO.tolerancia || nota > max + MODELO.tolerancia) {
    d.motivoSemNota = 'fora_do_intervalo';
    d.pendenciasQualidade.push('transformação gerou ' + String(nota) + ', fora da escala 1–5');
    d.motivoExclusao = 'Dado não mapeável na escala 1–5.';
    return d;
  }
  // Só remove ruído de ponto flutuante na borda da escala (ex.: 5,0000000001).
  nota = Math.min(max, Math.max(min, nota));
  d.nota = nota;

  if (ler(conta, m.campoDesatualizada) === true) {
    d.status = 'desatualizada';
    const politica = m.desatualizadaEntraNoCalculo;
    d.entraNoCalculo = politica === true;
    d.motivoExclusao = politica === true ? null
      : politica === false ? 'Desatualizada: a política de validade exclui do cálculo.'
        : 'Desatualizada e sem política de validade definida: exibida, fora do cálculo.';
  } else {
    d.status = 'avaliada';
    d.entraNoCalculo = true;
  }
  return d;
}

/** @param {DimensaoIntegrada} d */
export function valida(d) {
  return d.nota != null && d.entraNoCalculo;
}

/** @param {DimensaoIntegrada} d */
function motivoInvestigacao(d) {
  if (d.status === 'desatualizada') return d.motivoExclusao;
  if (d.semAchados) return 'Busca concluída sem achados; o método oficial não produziu nota (decisão D1).';
  switch (d.motivoSemNota) {
    case 'nao_coletado': return d.origem.mapeamento === 'indisponivel' ? 'Dimensão ainda indisponível no projeto.' : 'Não coletado: nenhuma busca ou avaliação realizada.';
    case 'fora_do_intervalo': return 'Dado inconsistente: ' + d.pendenciasQualidade.join('; ') + '.';
    case 'metodo_nao_mapeado': return 'Método original ainda não mapeado para a escala 1–5.';
    case 'oculto_modo_apresentacao': return 'Oculta no modo apresentação.';
    default: return d.motivoExclusao;
  }
}

/**
 * @param {Record<string, unknown>} bruta
 * @param {Mapeamento} mapa
 * @param {OpcoesAdaptador} [opcoes]
 * @returns {VisaoIntegradaConta}
 */
export function adaptarConta(bruta, mapa, opcoes = {}) {
  const mc = mapa.conta;
  /** @type {Record<ChaveDimensao, DimensaoIntegrada>} */
  const dimensoes = /** @type {any} */ ({});
  for (const k of DIMENSOES) dimensoes[k] = adaptarDimensao(bruta, mapa.dimensoes[k], opcoes);

  const faltantes = DIMENSOES.filter((k) => !valida(dimensoes[k]));
  const cobertura = DIMENSOES.length - faltantes.length;
  /** @type {Partial<Record<ChaveDimensao, number>>} */
  const conhecidas = {};
  for (const k of DIMENSOES) if (valida(dimensoes[k])) conhecidas[k] = /** @type {number} */ (dimensoes[k].nota);

  const acao = ler(bruta, mc.acaoRecomendada);
  const contato = primeiro(bruta, mc.contatoAtivavel);
  const score = ler(bruta, mc.score);
  const alternativos = mc.nomesAlternativos.map((c) => texto(ler(bruta, c))).filter((x) => x != null);

  /** @type {VisaoIntegradaConta} */
  const v = {
    contaId: String(ler(bruta, mc.id)),
    conta: {
      nome: texto(ler(bruta, mc.nome)) || '(conta sem nome no snapshot)',
      nomesAlternativos: /** @type {string[]} */ (alternativos),
      setor: texto(primeiro(bruta, mc.setor)),
      uf: texto(primeiro(bruta, mc.uf)),
      evidenciaPrincipal: texto(primeiro(bruta, mc.evidenciaPrincipal)),
      oficial: {
        score: numeroValido(score) ? /** @type {number} */ (score) : null,
        vscsStatus: texto(ler(bruta, mc.vscsStatus)),
        tierIcp: texto(primeiro(bruta, mc.tierIcp)),
        acaoRecomendada: acao === undefined ? null : acao,
        contatoAtivavel: typeof contato === 'boolean' ? contato : null
      }
    },
    dimensoes,
    cobertura,
    notaIntegrada: null,
    classeIntegrada: null,
    versaoModelo: MODELO.versaoModelo,
    motivosClassificacao: [],
    criteriosA1: null,
    criteriosA1Atendidos: null,
    dimensoesFaltantes: faltantes,
    situacaoSweetSpot: 'fora_por_falta_de_dados',
    bloqueioA1: [],
    investigacao: null,
    dataUltimaAvaliacao: DIMENSOES.map((k) => dimensoes[k].dataReferencia).filter(Boolean).sort().pop() || null
  };

  if (cobertura === DIMENSOES.length) {
    const notas = /** @type {Record<ChaveDimensao, number>} */ (conhecidas);
    const r = classificar(notas);
    const p = proximidadeA1(notas);
    v.notaIntegrada = r.nota;
    v.classeIntegrada = r.classe;
    v.motivosClassificacao = r.motivos;
    v.criteriosA1 = p.criterios;
    v.criteriosA1Atendidos = p.atendidos;
    v.situacaoSweetSpot = r.classe === 'A1' ? 'a1' : 'fora_por_classe';
  } else if (faltantes.length === 1) {
    const f = faltantes[0];
    const r = avaliarUmaFaltante(conhecidas, f);
    v.motivosClassificacao = ['Avaliação incompleta: ' + cobertura + ' de 4 dimensões. Sem nota integrada e sem média parcial.'];
    if (r.viavelA1) {
      v.situacaoSweetSpot = 'candidata';
      v.investigacao = {
        dimensao: f,
        motivo: motivoInvestigacao(dimensoes[f]),
        evidenciaNecessaria: mapa.dimensoes[f].evidenciaNecessaria || EVIDENCIA_NECESSARIA[f],
        notaMinimaParaA1: r.notaNecessariaA1,
        podeChegarA2: r.podeChegarA2
      };
    } else {
      v.situacaoSweetSpot = 'fora_por_criterio';
      v.bloqueioA1 = r.bloqueios;
    }
  } else {
    v.motivosClassificacao = ['Faltam ' + faltantes.length + ' dimensões (' + faltantes.map((k) => NOMES_DIMENSAO[k].nome).join(', ') + '): fora do sweet spot até completar.'];
  }
  return v;
}

/**
 * @param {Snapshot} snapshot
 * @param {Mapeamento} mapa
 * @param {OpcoesAdaptador} [opcoes]
 * @returns {ResultadoAdaptador}
 */
export function adaptarSnapshot(snapshot, mapa, opcoes = {}) {
  if (!snapshot || !Array.isArray(snapshot.contas)) throw new Error('Snapshot sem lista de contas.');
  /** @type {ResultadoAdaptador['descartadas']} */
  const descartadas = [];
  /** @type {VisaoIntegradaConta[]} */
  const contas = [];
  const vistos = new Set();
  snapshot.contas.forEach((bruta, indice) => {
    const id = ler(bruta, mapa.conta.id);
    if ((typeof id !== 'string' || !id) && typeof id !== 'number') {
      descartadas.push({ indice, motivo: 'registro sem ID' });
      return;
    }
    if (vistos.has(String(id))) {
      descartadas.push({ indice, motivo: 'ID repetido ' + String(id) });
      return;
    }
    vistos.add(String(id));
    contas.push(adaptarConta(bruta, mapa, opcoes));
  });
  const algum = (/** @type {(c: VisaoIntegradaConta) => boolean} */ f) => contas.some(f);
  return {
    contas,
    atualizadoEm: dataIso(snapshot.atualizadoEm) ? /** @type {string} */ (snapshot.atualizadoEm) : null,
    camposDisponiveis: {
      setor: algum((c) => c.conta.setor != null),
      uf: algum((c) => c.conta.uf != null),
      contatoAtivavel: algum((c) => c.conta.oficial.contatoAtivavel != null),
      acaoRecomendada: algum((c) => c.conta.oficial.acaoRecomendada != null),
      evidencia: algum((c) => c.conta.evidenciaPrincipal != null)
    },
    descartadas
  };
}

/**
 * Linhas da tabela "Origem das notas" (seção 5.3).
 * @param {Mapeamento} mapa
 */
export function origemDasNotas(mapa) {
  return DIMENSOES.map((k) => {
    const m = mapa.dimensoes[k];
    return {
      chave: k,
      eixo: NOMES_DIMENSAO[k].nome,
      fonte: m.campoOrigem || m.fonteNoProjeto || '—',
      escalaOriginal: m.escalaOriginal || '—',
      transformacao: m.transformacao || '—',
      estado: m.mapeamento === 'documentado' ? (m.fixture ? 'Documentado (fixture de teste)' : 'Documentado')
        : m.mapeamento === 'indisponivel' ? 'Indisponível' : 'Pendente de mapeamento',
      fixture: !!m.fixture
    };
  });
}

/**
 * Texto curto do estado de uma dimensão sem depender de cor (seção 4.1).
 * @param {DimensaoIntegrada} d
 */
export function textoEstadoDimensao(d) {
  if (d.motivoSemNota === 'oculto_modo_apresentacao') return 'Indisponível nesta visão';
  if (d.nota == null) {
    if (d.semAchados) return 'Nenhum sinal relevante encontrado' + (d.dataReferencia ? ' (busca em ' + fmtData(d.dataReferencia) + ')' : '');
    if (d.motivoSemNota === 'fora_do_intervalo') return 'Sem avaliação — dado inconsistente';
    if (d.origem.mapeamento === 'pendente') return 'Pendente de mapeamento';
    if (d.origem.mapeamento === 'indisponivel') return 'Indisponível';
    return 'Sem avaliação';
  }
  if (d.status === 'desatualizada') return 'Desatualizada' + (d.dataReferencia ? ' desde ' + fmtData(d.dataReferencia) : '') + (d.entraNoCalculo ? '' : ' · fora do cálculo');
  if (d.semAchados) return 'Sem sinais encontrados';
  return 'Avaliada' + (d.dataReferencia ? ' em ' + fmtData(d.dataReferencia) : '');
}
