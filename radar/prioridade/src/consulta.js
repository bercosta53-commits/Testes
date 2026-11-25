// @ts-check
/**
 * Busca, filtros (OU dentro do grupo, E entre grupos), atalhos, ordenação
 * múltipla, agrupamentos, Setor × Prioridade, cruzamento de duas dimensões
 * e resumo do setor (seções 6.1 e 6.6). Funções puras.
 *
 * Os agregados são descritivos: não criam nota do setor nem nova classe.
 */
import { DIMENSOES, MODELO, NOMES_DIMENSAO } from './config.js';
import { valida } from './adaptador.js';
import { abaixoDe, atende, fmtLimite } from './numeros.js';

/** @typedef {import('./tipos').VisaoIntegradaConta} Conta */
/** @typedef {import('./tipos').ChaveDimensao} ChaveDimensao */
/** @typedef {import('./tipos').Classe} Classe */
/** @typedef {import('./tipos').SituacaoSweetSpot} SituacaoSweetSpot */

/**
 * @typedef {{ min: number | null, max: number | null }} Faixa  // min ≤ v < max
 * @typedef {{
 *   q: string,
 *   classe: Classe[],
 *   ss: SituacaoSweetSpot[],
 *   setor: string[],
 *   cob: string[],
 *   faixa: Partial<Record<ChaveDimensao, Faixa>>,
 *   notaMin: number | null,
 *   perto: boolean,
 *   qual: string[],
 *   op: string[],
 *   uf: string[],
 *   completas: boolean
 * }} Filtros
 */

export const SEM_SETOR = '__sem_setor__';

/** @returns {Filtros} */
export function filtrosVazios() {
  return { q: '', classe: [], ss: [], setor: [], cob: [], faixa: {}, notaMin: null, perto: false, qual: [], op: [], uf: [], completas: false };
}

/* ---------------- Busca ---------------- */

/**
 * Ignora caixa, acentos e pontuação.
 * @param {string | null | undefined} s
 */
export function normalizar(s) {
  return String(s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** @param {Conta} c */
function textosConta(c) {
  return [c.conta.nome, ...c.conta.nomesAlternativos].map(normalizar);
}

/** @param {Conta} c @param {string} termoNorm */
export function correspondeBusca(c, termoNorm) {
  if (!termoNorm) return true;
  if (textosConta(c).some((t) => t.includes(termoNorm))) return true;
  return normalizar(c.conta.setor).includes(termoNorm);
}

/**
 * Sugestões em dois grupos (Contas e Setores), sobre TODAS as contas.
 * @param {Conta[]} contas @param {string} termo @param {number} [limite]
 */
export function sugestoes(contas, termo, limite = 6) {
  const t = normalizar(termo);
  if (!t) return { contas: [], setores: [] };
  const porNome = contas
    .map((c) => ({ c, pos: Math.min(...textosConta(c).map((x) => { const i = x.indexOf(t); return i < 0 ? 1e9 : i; })) }))
    .filter((x) => x.pos < 1e9)
    .sort((a, b) => a.pos - b.pos || a.c.conta.nome.localeCompare(b.c.conta.nome, 'pt'))
    .slice(0, limite)
    .map((x) => x.c);
  /** @type {Map<string, number>} */
  const setores = new Map();
  for (const c of contas) {
    const s = c.conta.setor;
    if (s && normalizar(s).includes(t)) setores.set(s, (setores.get(s) || 0) + 1);
  }
  return {
    contas: porNome,
    setores: [...setores.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt')).slice(0, limite).map(([setor, n]) => ({ setor, n }))
  };
}

/* ---------------- Segmentos (faixa 6.2) ---------------- */

/** Segmentos na ordem de leitura: do sweet spot até a métrica sumir. */
export const SEGMENTOS = /** @type {const} */ (['A1', 'candidata', 'A2', 'B1', 'B2', 'C', 'fora_por_criterio', 'sem_metrica']);
/** @typedef {typeof SEGMENTOS[number]} Segmento */

const CLASSES_SEG = new Set(['A1', 'A2', 'B1', 'B2', 'C']);
/** Segmento que é uma classe (A1–C)? @param {string} s */
export function ehClasse(s) { return CLASSES_SEG.has(s); }

/** @param {Conta} c @returns {Segmento} */
export function segmentoDe(c) {
  if (c.classeIntegrada) return c.classeIntegrada;
  if (c.situacaoSweetSpot === 'candidata') return 'candidata';
  if (c.situacaoSweetSpot === 'fora_por_criterio') return 'fora_por_criterio';
  return 'sem_metrica';
}

/** @type {Record<Segmento, string>} */
export const ROTULO_SEGMENTO = {
  A1: 'A1', candidata: 'Candidatas', A2: 'A2', B1: 'B1', B2: 'B2', C: 'C',
  fora_por_criterio: '1 faltando, fora por critério', sem_metrica: '2+ faltando'
};

/** @param {Conta[]} contas */
export function distribuicao(contas) {
  /** @type {Record<Segmento, number>} */
  const r = /** @type {any} */ (Object.fromEntries(SEGMENTOS.map((s) => [s, 0])));
  for (const c of contas) r[segmentoDe(c)]++;
  return { porSegmento: r, total: contas.length, completas: contas.filter((c) => c.cobertura === 4).length };
}

/**
 * Filtro correspondente a um segmento (clicar na faixa).
 * @param {Segmento} s
 * @returns {{ grupo: 'classe' | 'ss', valor: string }}
 */
export function filtroDoSegmento(s) {
  if (s === 'candidata') return { grupo: 'ss', valor: 'candidata' };
  if (s === 'fora_por_criterio') return { grupo: 'ss', valor: 'fora_por_criterio' };
  if (s === 'sem_metrica') return { grupo: 'ss', valor: 'fora_por_falta_de_dados' };
  return { grupo: 'classe', valor: s };
}

/* ---------------- Filtros ---------------- */

/** @param {Conta} c @param {string} op */
function passaCobertura(c, op) {
  if (op === 'completa') return c.cobertura === 4;
  if (op === '3de4') return c.cobertura === 3;
  if (op === '2menos') return c.cobertura <= 2;
  if (op.startsWith('falta:')) return c.dimensoesFaltantes.includes(/** @type {ChaveDimensao} */ (op.slice(6)));
  return false;
}

/** @param {Conta} c @param {string} op */
function passaQualidade(c, op) {
  if (op === 'desatualizada') return DIMENSOES.some((k) => c.dimensoes[k].status === 'desatualizada');
  if (op === 'pendencia') return DIMENSOES.some((k) => c.dimensoes[k].pendenciasQualidade.length > 0);
  return false;
}

/** @param {Conta} c @param {string} op */
function passaOperacao(c, op) {
  if (op === 'contato') return c.conta.oficial.contatoAtivavel === true;
  if (op === 'acao') return c.conta.oficial.acaoRecomendada != null;
  return false;
}

/** Atende o atalho "perto do sweet spot": completa, não A1, ≥ N de 5 critérios. @param {Conta} c */
export function pertoDoSweetSpot(c) {
  return c.cobertura === 4 && c.classeIntegrada !== 'A1' && (c.criteriosA1Atendidos ?? 0) >= MODELO.atalhos.pertoDoSweetSpot.criteriosMinimos;
}

/**
 * @param {Conta} c @param {ChaveDimensao} k @param {Faixa} f
 * @returns {'passa' | 'falha' | 'sem_nota'}
 */
function passaFaixa(c, k, f) {
  const d = c.dimensoes[k];
  if (!valida(d)) return 'sem_nota';
  const v = /** @type {number} */ (d.nota);
  if (f.min != null && !atende(v, f.min)) return 'falha';
  if (f.max != null && !abaixoDe(v, f.max)) return 'falha';
  return 'passa';
}

/**
 * Grupos de filtro como predicados. Dentro do grupo: OU. Entre grupos: E.
 * @param {Filtros} f
 * @returns {Array<{ grupo: string, teste: (c: Conta) => boolean | 'sem_nota' }>}
 */
export function gruposAtivos(f) {
  /** @type {Array<{ grupo: string, teste: (c: Conta) => boolean | 'sem_nota' }>} */
  const g = [];
  if (f.classe.length) g.push({ grupo: 'classe', teste: (c) => c.classeIntegrada != null && f.classe.includes(c.classeIntegrada) });
  if (f.ss.length) g.push({ grupo: 'ss', teste: (c) => f.ss.includes(c.situacaoSweetSpot) });
  if (f.setor.length) g.push({ grupo: 'setor', teste: (c) => f.setor.includes(c.conta.setor ?? SEM_SETOR) });
  if (f.cob.length) g.push({ grupo: 'cob', teste: (c) => f.cob.some((op) => passaCobertura(c, op)) });
  if (f.completas) g.push({ grupo: 'completas', teste: (c) => c.cobertura === 4 });
  for (const k of DIMENSOES) {
    const fx = f.faixa[k];
    if (fx && (fx.min != null || fx.max != null)) {
      g.push({ grupo: 'faixa:' + k, teste: (c) => { const r = passaFaixa(c, k, fx); return r === 'sem_nota' ? 'sem_nota' : r === 'passa'; } });
    }
  }
  if (f.notaMin != null) {
    const min = f.notaMin;
    g.push({ grupo: 'notaMin', teste: (c) => (c.notaIntegrada == null ? 'sem_nota' : atende(c.notaIntegrada, min)) });
  }
  if (f.perto) g.push({ grupo: 'perto', teste: pertoDoSweetSpot });
  if (f.qual.length) g.push({ grupo: 'qual', teste: (c) => f.qual.some((op) => passaQualidade(c, op)) });
  if (f.op.length) g.push({ grupo: 'op', teste: (c) => f.op.some((op) => passaOperacao(c, op)) });
  if (f.uf.length) g.push({ grupo: 'uf', teste: (c) => c.conta.uf != null && f.uf.includes(c.conta.uf) });
  return g;
}

/**
 * Aplica busca e filtros. Também conta quem ficou de fora por não ter nota
 * numa dimensão filtrada e quem existe só fora dos filtros.
 * @param {Conta[]} contas @param {Filtros} f
 */
export function aplicarFiltros(contas, f) {
  const termo = normalizar(f.q);
  const grupos = gruposAtivos(f);
  /** @type {Conta[]} */
  const visiveis = [];
  let foraPorSemNota = 0;
  /** @type {Partial<Record<string, number>>} */
  const semNotaPorGrupo = {};
  let correspondemBusca = 0;
  for (const c of contas) {
    const busca = correspondeBusca(c, termo);
    if (busca) correspondemBusca++;
    let ok = true;
    let soSemNota = true;
    /** @type {string[]} */
    const gruposSemNota = [];
    for (const g of grupos) {
      const r = g.teste(c);
      if (r === true) continue;
      ok = false;
      if (r === 'sem_nota') gruposSemNota.push(g.grupo); else soSemNota = false;
    }
    if (ok && busca) visiveis.push(c);
    else if (!ok && busca && soSemNota && gruposSemNota.length) {
      foraPorSemNota++;
      for (const g of gruposSemNota) semNotaPorGrupo[g] = (semNotaPorGrupo[g] || 0) + 1;
    }
  }
  return {
    visiveis,
    total: contas.length,
    foraPorSemNota,
    semNotaPorGrupo,
    /** Termo existe, mas só fora dos filtros ativos. */
    buscaForaDosFiltros: termo ? correspondemBusca - visiveis.length : 0,
    correspondemBusca: termo ? correspondemBusca : null
  };
}

/**
 * Contagem por opção de um grupo, respeitando os OUTROS grupos (facetas).
 * @param {Conta[]} contas @param {Filtros} f @param {keyof Filtros} grupo
 * @param {(c: Conta) => string[]} valores
 */
export function contagemFaceta(contas, f, grupo, valores) {
  const semGrupo = { ...f, [grupo]: Array.isArray(f[grupo]) ? [] : f[grupo] };
  const { visiveis } = aplicarFiltros(contas, semGrupo);
  /** @type {Map<string, number>} */
  const m = new Map();
  for (const c of visiveis) for (const v of valores(c)) m.set(v, (m.get(v) || 0) + 1);
  return m;
}

const ROTULO_SS = {
  a1: 'A1 (sweet spot)', candidata: 'candidata', fora_por_classe: 'completa fora do A1',
  fora_por_criterio: 'fora por critério', fora_por_falta_de_dados: 'fora por falta de dados'
};
export { ROTULO_SS };

/** @param {string} op */
export function rotuloCobertura(op) {
  if (op === 'completa') return 'completas';
  if (op === '3de4') return '3 de 4';
  if (op === '2menos') return '2 ou menos';
  if (op.startsWith('falta:')) return 'falta ' + NOMES_DIMENSAO[/** @type {ChaveDimensao} */ (op.slice(6))].curto;
  return op;
}

/** @param {Faixa} fx */
export function rotuloFaixa(fx) {
  if (fx.min != null && fx.max != null) return fmtLimite(fx.min) + ' a < ' + fmtLimite(fx.max);
  if (fx.min != null) return '≥ ' + fmtLimite(fx.min);
  if (fx.max != null) return '< ' + fmtLimite(/** @type {number} */ (fx.max));
  return '';
}

/**
 * Chips removíveis e frase "A1 ou A2, E setor TI".
 * @param {Filtros} f
 */
export function descreverFiltros(f) {
  /** @type {Array<{ grupo: string, valor: string, rotulo: string }>} */
  const chips = [];
  /** @type {string[]} */
  const frases = [];
  /** @param {string} grupo @param {string} prefixo @param {string[]} vals @param {(v: string) => string} rot */
  const lista = (grupo, prefixo, vals, rot) => {
    if (!vals.length) return;
    vals.forEach((v) => chips.push({ grupo, valor: v, rotulo: prefixo + rot(v) }));
    frases.push(prefixo + vals.map(rot).join(' ou '));
  };
  lista('classe', '', f.classe, (v) => v);
  lista('ss', 'sweet spot: ', f.ss, (v) => ROTULO_SS[/** @type {keyof typeof ROTULO_SS} */ (v)] || v);
  lista('setor', 'setor ', f.setor, (v) => (v === SEM_SETOR ? 'sem setor' : v));
  lista('cob', 'cobertura: ', f.cob, rotuloCobertura);
  if (f.completas) { chips.push({ grupo: 'completas', valor: '1', rotulo: 'somente avaliações completas' }); frases.push('somente avaliações completas'); }
  for (const k of DIMENSOES) {
    const fx = f.faixa[k];
    if (fx && (fx.min != null || fx.max != null)) {
      const r = NOMES_DIMENSAO[k].curto + ' ' + rotuloFaixa(fx);
      chips.push({ grupo: 'faixa', valor: k, rotulo: r });
      frases.push(r);
    }
  }
  if (f.notaMin != null) { const r = 'nota integrada ≥ ' + fmtLimite(f.notaMin); chips.push({ grupo: 'notaMin', valor: '1', rotulo: r }); frases.push(r); }
  if (f.perto) { const r = 'perto do sweet spot'; chips.push({ grupo: 'perto', valor: '1', rotulo: r }); frases.push(r); }
  lista('qual', '', f.qual, (v) => (v === 'desatualizada' ? 'com dado desatualizado' : 'com pendência de qualidade'));
  lista('op', 'regras oficiais: ', f.op, (v) => (v === 'contato' ? 'contato ativável' : 'ação recomendada disponível'));
  lista('uf', 'UF ', f.uf, (v) => v);
  return { chips, frase: frases.join(', E '), quantidade: chips.length };
}

/* ---------------- Atalhos de visão ---------------- */

/** Atalhos aplicam filtros comuns, que o usuário pode ajustar depois. */
export function atalhos() {
  const a = MODELO.atalhos;
  return [
    { id: 'sweet', rotulo: 'Sweet spot', regra: 'Classe A1', filtros: { classe: /** @type {Classe[]} */ (['A1']) } },
    { id: 'investigar', rotulo: 'Investigar', regra: 'Candidatas (1 dimensão faltando)', filtros: { ss: /** @type {SituacaoSweetSpot[]} */ (['candidata']) } },
    { id: 'perto', rotulo: 'Perto do sweet spot', regra: 'Completas, não A1, com ' + a.pertoDoSweetSpot.criteriosMinimos + ' de 5 critérios de A1', filtros: { perto: true } },
    {
      id: 'encaixe', rotulo: 'Bom encaixe, timing fraco', regra: 'ICP ≥ ' + fmtLimite(a.bomEncaixeTimingFraco.icpMin) + ' e Sinais < ' + fmtLimite(a.bomEncaixeTimingFraco.sinaisAbaixoDe) + ' (acompanhar ou nutrir)',
      filtros: { faixa: { icp: { min: a.bomEncaixeTimingFraco.icpMin, max: null }, sinais: { min: null, max: a.bomEncaixeTimingFraco.sinaisAbaixoDe } } }
    },
    {
      id: 'timing', rotulo: 'Timing forte, encaixe duvidoso', regra: 'Sinais ≥ ' + fmtLimite(a.timingForteEncaixeDuvidoso.sinaisMin) + ' e ICP < ' + fmtLimite(a.timingForteEncaixeDuvidoso.icpAbaixoDe) + ' (validar o ICP antes de agir)',
      filtros: { faixa: { sinais: { min: a.timingForteEncaixeDuvidoso.sinaisMin, max: null }, icp: { min: null, max: a.timingForteEncaixeDuvidoso.icpAbaixoDe } } }
    }
  ];
}

/* ---------------- Ordenação ---------------- */

/**
 * @typedef {'prioridade' | 'nome' | 'nota' | ChaveDimensao | 'proximidade' | 'data' | 'cobertura' | 'vscs'} ColunaOrdem
 * @typedef {{ col: ColunaOrdem, dir: 1 | -1 }} CriterioOrdem
 */

const TIER = { a1: 0, fora_por_classe: 0, candidata: 1, fora_por_criterio: 2, fora_por_falta_de_dados: 3 };
/** @param {Conta} c */
export function tierDe(c) { return TIER[c.situacaoSweetSpot]; }

/** @param {Conta} c @param {ChaveDimensao} k */
const notaOuNull = (c, k) => (valida(c.dimensoes[k]) ? /** @type {number} */ (c.dimensoes[k].nota) : null);

/** Compara números com nulos sempre por último. @param {number|null} a @param {number|null} b @param {1|-1} dir */
function cmpNum(a, b, dir) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a === b ? 0 : (a < b ? -1 : 1) * dir;
}
/** @param {Conta} a @param {Conta} b */
const cmpNome = (a, b) => a.conta.nome.localeCompare(b.conta.nome, 'pt') || (a.contaId < b.contaId ? -1 : a.contaId > b.contaId ? 1 : 0);

/**
 * Ordenação inicial (seção 6.3): completas por nota ↓ (empates ICP, Sinais,
 * nome); candidatas pela menor nota exigida para A1; depois fora por
 * critério; por fim sem métrica.
 * @param {Conta} a @param {Conta} b
 */
export function cmpPrioridade(a, b) {
  const t = tierDe(a) - tierDe(b);
  if (t) return t;
  if (tierDe(a) === 0) {
    return cmpNum(a.notaIntegrada, b.notaIntegrada, -1) || cmpNum(notaOuNull(a, 'icp'), notaOuNull(b, 'icp'), -1) || cmpNum(notaOuNull(a, 'sinais'), notaOuNull(b, 'sinais'), -1) || cmpNome(a, b);
  }
  if (tierDe(a) === 1) {
    return cmpNum(a.investigacao?.notaMinimaParaA1 ?? null, b.investigacao?.notaMinimaParaA1 ?? null, 1) || cmpNum(notaOuNull(a, 'icp'), notaOuNull(b, 'icp'), -1) || cmpNum(notaOuNull(a, 'sinais'), notaOuNull(b, 'sinais'), -1) || cmpNome(a, b);
  }
  return b.cobertura - a.cobertura || cmpNum(notaOuNull(a, 'icp'), notaOuNull(b, 'icp'), -1) || cmpNome(a, b);
}

/** @param {Conta} a @param {Conta} b @param {CriterioOrdem} o */
function cmpColuna(a, b, o) {
  switch (o.col) {
    case 'prioridade': return o.dir === -1 ? cmpPrioridade(a, b) : -cmpPrioridade(a, b);
    case 'nome': return cmpNome(a, b) * o.dir;
    case 'nota': return cmpNum(a.notaIntegrada, b.notaIntegrada, o.dir);
    case 'proximidade':
      // Proximidade é leitura das regras de A1, não uma nova nota.
      return cmpNum(a.criteriosA1Atendidos, b.criteriosA1Atendidos, o.dir) || cmpNum(a.notaIntegrada, b.notaIntegrada, o.dir);
    case 'data': return cmpNum(a.dataUltimaAvaliacao ? Date.parse(a.dataUltimaAvaliacao) : null, b.dataUltimaAvaliacao ? Date.parse(b.dataUltimaAvaliacao) : null, o.dir);
    case 'cobertura': return cmpNum(a.cobertura, b.cobertura, o.dir);
    case 'vscs': return cmpNum(a.conta.oficial.score, b.conta.oficial.score, o.dir);
    default: return cmpNum(notaOuNull(a, o.col), notaOuNull(b, o.col), o.dir);
  }
}

/**
 * Ordenação múltipla. Nunca ordena pelo tamanho do polígono.
 * @param {Conta[]} contas @param {CriterioOrdem[]} ordem
 */
export function ordenar(contas, ordem) {
  const crit = ordem.length ? ordem : [{ col: /** @type {ColunaOrdem} */ ('prioridade'), dir: /** @type {-1} */ (-1) }];
  return contas.slice().sort((a, b) => {
    for (const o of crit) { const r = cmpColuna(a, b, o); if (r) return r; }
    return cmpNome(a, b);
  });
}

/** @type {Record<string, string>} */
export const ROTULO_COLUNA = {
  prioridade: 'Prioridade', nome: 'Conta', nota: 'Nota integrada', icp: 'ICP', sinais: 'Sinais', clima: 'Clima',
  oportunidadeDigital: 'Digital', proximidade: 'Proximidade', data: 'Última avaliação', cobertura: 'Cobertura', vscs: 'VSCS'
};

/** "1º ICP ↓, 2º Sinais ↓" @param {CriterioOrdem[]} ordem */
export function descreverOrdem(ordem) {
  if (!ordem.length || (ordem.length === 1 && ordem[0].col === 'prioridade' && ordem[0].dir === -1)) return 'Prioridade (padrão)';
  return ordem.map((o, i) => (i + 1) + 'º ' + ROTULO_COLUNA[o.col] + ' ' + (o.dir === -1 ? '↓' : '↑')).join(', ');
}

/* ---------------- Agrupamentos ---------------- */

/** @typedef {'' | 'setor' | 'classe' | 'sweetspot' | 'cobertura' | 'faltante'} Agrupamento */

/** @param {Conta} c @param {Agrupamento} por @returns {[string, string, number]} chave, rótulo, ordem */
function grupoDe(c, por) {
  switch (por) {
    case 'setor': return c.conta.setor ? [c.conta.setor, c.conta.setor, 0] : [SEM_SETOR, 'Sem setor', 1];
    case 'classe': { const s = segmentoDe(c); const i = SEGMENTOS.indexOf(s); return [s, ehClasse(s) ? 'Prioridade integrada ' + s : ROTULO_SEGMENTO[s], i]; }
    case 'sweetspot': { const o = ['a1', 'candidata', 'fora_por_classe', 'fora_por_criterio', 'fora_por_falta_de_dados']; return [c.situacaoSweetSpot, ROTULO_SS[c.situacaoSweetSpot], o.indexOf(c.situacaoSweetSpot)]; }
    case 'cobertura': return [String(c.cobertura), c.cobertura + ' de 4 dimensões', 4 - c.cobertura];
    case 'faltante':
      if (!c.dimensoesFaltantes.length) return ['completa', 'Completas', 0];
      if (c.dimensoesFaltantes.length === 1) { const k = c.dimensoesFaltantes[0]; return ['falta:' + k, 'Falta ' + NOMES_DIMENSAO[k].nome, 1 + DIMENSOES.indexOf(k)]; }
      return ['2mais', '2 ou mais faltando', 9];
    default: return ['todas', 'Todas', 0];
  }
}

/**
 * Agrupa SEM descartar contas (sem atributo → "Sem setor" ou equivalente).
 * @param {Conta[]} contas @param {Agrupamento} por
 */
export function agrupar(contas, por) {
  /** @type {Map<string, { chave: string, rotulo: string, ordem: number, contas: Conta[] }>} */
  const m = new Map();
  for (const c of contas) {
    const [chave, rotulo, ordem] = grupoDe(c, por);
    if (!m.has(chave)) m.set(chave, { chave, rotulo, ordem, contas: [] });
    /** @type {any} */ (m.get(chave)).contas.push(c);
  }
  return [...m.values()].sort((a, b) => a.ordem - b.ordem || a.rotulo.localeCompare(b.rotulo, 'pt'));
}

/* ---------------- Setor × Prioridade ---------------- */

/** Colunas da matriz: mesmas da faixa, para as somas fecharem. */
export const COLUNAS_MATRIZ = SEGMENTOS;

/**
 * @param {Conta[]} contas
 * @param {'a1' | 'candidata' | 'nome'} [ordem]
 */
export function matrizSetorPrioridade(contas, ordem = 'a1') {
  const grupos = agrupar(contas, 'setor');
  const linhas = grupos.map((g) => ({ chave: g.chave, rotulo: g.rotulo, celulas: distribuicao(g.contas).porSegmento, total: g.contas.length }));
  linhas.sort((a, b) => {
    if ((a.chave === SEM_SETOR) !== (b.chave === SEM_SETOR)) return a.chave === SEM_SETOR ? 1 : -1;
    if (ordem === 'a1') return b.celulas.A1 - a.celulas.A1 || b.celulas.candidata - a.celulas.candidata || a.rotulo.localeCompare(b.rotulo, 'pt');
    if (ordem === 'candidata') return b.celulas.candidata - a.celulas.candidata || b.celulas.A1 - a.celulas.A1 || a.rotulo.localeCompare(b.rotulo, 'pt');
    return a.rotulo.localeCompare(b.rotulo, 'pt');
  });
  const totais = distribuicao(contas).porSegmento;
  return { linhas, totais, total: contas.length };
}

/* ---------------- Cruzar duas dimensões ---------------- */

/** Índice da faixa de 1 ponto (a última inclui o máximo). @param {number} v */
export function indiceFaixa(v) {
  const fx = MODELO.faixasCruzamento;
  for (let i = fx.length - 1; i >= 0; i--) if (atende(v, fx[i][0])) return i;
  return 0;
}

/**
 * Grade de contagens por célula; contas sem nota em X ou Y ficam fora da
 * grade, num bloco próprio com contagem.
 * @param {Conta[]} contas @param {ChaveDimensao} x @param {ChaveDimensao} y
 */
export function cruzar(contas, x, y) {
  const n = MODELO.faixasCruzamento.length;
  const grade = Array.from({ length: n }, () => Array(n).fill(0)); // grade[iy][ix]
  let semAvaliacao = 0;
  const corte = MODELO.corteQuadrante;
  const quadrantes = { altoAlto: 0, altoBaixo: 0, baixoAlto: 0, baixoBaixo: 0 }; // X depois Y
  for (const c of contas) {
    const vx = notaOuNull(c, x), vy = notaOuNull(c, y);
    if (vx == null || vy == null) { semAvaliacao++; continue; }
    grade[indiceFaixa(vy)][indiceFaixa(vx)]++;
    const ax = atende(vx, corte), ay = atende(vy, corte);
    quadrantes[ax ? (ay ? 'altoAlto' : 'altoBaixo') : (ay ? 'baixoAlto' : 'baixoBaixo')]++;
  }
  return { faixas: MODELO.faixasCruzamento, grade, semAvaliacao, quadrantes, corte, total: contas.length };
}

/**
 * Faixa de filtro de uma célula do cruzamento.
 * @param {number} i @returns {Faixa}
 */
export function faixaDaCelula(i) {
  const fx = MODELO.faixasCruzamento;
  return { min: fx[i][0], max: i === fx.length - 1 ? null : fx[i][1] };
}

/* ---------------- Resumo do setor ---------------- */

/**
 * Média por dimensão SÓ das contas avaliadas, sempre com o n. Nunca uma
 * nota integrada do setor.
 * @param {Conta[]} contas
 */
export function resumoSetor(contas) {
  const dims = DIMENSOES.map((k) => {
    const vals = contas.map((c) => notaOuNull(c, k)).filter((v) => v != null);
    return { chave: k, media: vals.length ? /** @type {number[]} */ (vals).reduce((t, v) => t + v, 0) / vals.length : null, n: vals.length, de: contas.length };
  });
  return { total: contas.length, dimensoes: dims, distribuicao: distribuicao(contas) };
}
