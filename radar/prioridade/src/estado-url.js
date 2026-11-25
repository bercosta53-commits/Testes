// @ts-check
/**
 * Estado da visão ↔ parâmetros de consulta (seção 6.1 e 6.5): filtros,
 * busca, ordenação, agrupamento, visão, seleção e comparação sobrevivem a
 * recarregar e podem ser compartilhados por link.
 */
import { DIMENSOES } from './config.js';
import { filtrosVazios } from './consulta.js';

/** @typedef {import('./consulta.js').Filtros} Filtros */
/** @typedef {import('./consulta.js').CriterioOrdem} CriterioOrdem */
/** @typedef {import('./consulta.js').Agrupamento} Agrupamento */
/** @typedef {import('./tipos').ChaveDimensao} ChaveDimensao */

/**
 * @typedef {{
 *   filtros: Filtros,
 *   ordem: CriterioOrdem[],
 *   agrupar: Agrupamento,
 *   visao: 'lista' | 'setor' | 'cruzar',
 *   x: ChaveDimensao,
 *   y: ChaveDimensao,
 *   ordemMatriz: 'a1' | 'candidata' | 'nome',
 *   conta: string | null,
 *   comparar: string[],
 *   comparacaoAberta: boolean,
 *   colunas: string[],
 *   recolhidos: string[]
 * }} EstadoVisao
 */

export const COLUNAS_OPCIONAIS = /** @type {const} */ (['proximidade', 'evidencia', 'situacao', 'data']);
export const MAX_COMPARAR = 3;

/** @returns {EstadoVisao} */
export function estadoInicial() {
  return {
    filtros: filtrosVazios(), ordem: [], agrupar: '', visao: 'lista', x: 'icp', y: 'sinais', ordemMatriz: 'a1',
    conta: null, comparar: [], comparacaoAberta: false, colunas: ['proximidade', 'evidencia', 'situacao'], recolhidos: []
  };
}

const CLASSES = ['A1', 'A2', 'B1', 'B2', 'C'];
const SS = ['a1', 'candidata', 'fora_por_classe', 'fora_por_criterio', 'fora_por_falta_de_dados'];
const COLS_ORDEM = ['prioridade', 'nome', 'nota', 'icp', 'sinais', 'clima', 'oportunidadeDigital', 'proximidade', 'data', 'cobertura', 'vscs'];
const AGRUP = ['', 'setor', 'classe', 'sweetspot', 'cobertura', 'faltante'];

/** @param {string | null} s */
function num(s) {
  if (s == null || s === '') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {string} search
 * @returns {EstadoVisao}
 */
export function lerUrl(search) {
  const p = new URLSearchParams(search);
  const e = estadoInicial();
  const f = e.filtros;
  f.q = p.get('q') || '';
  f.classe = /** @type {any} */ (p.getAll('cl').filter((v) => CLASSES.includes(v)));
  f.ss = /** @type {any} */ (p.getAll('ss').filter((v) => SS.includes(v)));
  f.setor = p.getAll('st');
  f.cob = p.getAll('cob');
  for (const k of DIMENSOES) {
    const v = p.get('f_' + k);
    if (v && v.includes(':')) {
      const [a, b] = v.split(':');
      const fx = { min: num(a), max: num(b) };
      if (fx.min != null || fx.max != null) f.faixa[k] = fx;
    }
  }
  f.notaMin = num(p.get('nm'));
  f.perto = p.get('perto') === '1';
  f.qual = p.getAll('qual');
  f.op = p.getAll('op');
  f.uf = p.getAll('uf');
  f.completas = p.get('comp') === '1';
  e.ordem = p.getAll('o').map((s) => {
    const [col, d] = s.split('.');
    return COLS_ORDEM.includes(col) ? { col: /** @type {any} */ (col), dir: /** @type {1 | -1} */ (d === 'a' ? 1 : -1) } : null;
  }).filter((x) => x != null);
  const ag = p.get('ag') || '';
  e.agrupar = /** @type {Agrupamento} */ (AGRUP.includes(ag) ? ag : '');
  const v = p.get('v');
  e.visao = v === 'setor' || v === 'cruzar' ? v : 'lista';
  const x = p.get('x'), y = p.get('y');
  if (x && DIMENSOES.includes(/** @type {any} */ (x))) e.x = /** @type {ChaveDimensao} */ (x);
  if (y && DIMENSOES.includes(/** @type {any} */ (y))) e.y = /** @type {ChaveDimensao} */ (y);
  const om = p.get('om');
  if (om === 'candidata' || om === 'nome') e.ordemMatriz = om;
  e.conta = p.get('c');
  e.comparar = [...new Set(p.getAll('cmp'))].slice(0, MAX_COMPARAR);
  e.comparacaoAberta = p.get('cmpv') === '1' && e.comparar.length > 0;
  if (p.has('cols')) e.colunas = (p.get('cols') || '').split(',').filter((c) => /** @type {readonly string[]} */ (COLUNAS_OPCIONAIS).includes(c));
  e.recolhidos = p.getAll('rg');
  return e;
}

/**
 * @param {EstadoVisao} e
 * @returns {string} "?q=..." ou ""
 */
export function escreverUrl(e) {
  const p = new URLSearchParams();
  const f = e.filtros;
  if (f.q) p.set('q', f.q);
  f.classe.forEach((v) => p.append('cl', v));
  f.ss.forEach((v) => p.append('ss', v));
  f.setor.forEach((v) => p.append('st', v));
  f.cob.forEach((v) => p.append('cob', v));
  for (const k of DIMENSOES) {
    const fx = f.faixa[k];
    if (fx && (fx.min != null || fx.max != null)) p.set('f_' + k, (fx.min ?? '') + ':' + (fx.max ?? ''));
  }
  if (f.notaMin != null) p.set('nm', String(f.notaMin));
  if (f.perto) p.set('perto', '1');
  f.qual.forEach((v) => p.append('qual', v));
  f.op.forEach((v) => p.append('op', v));
  f.uf.forEach((v) => p.append('uf', v));
  if (f.completas) p.set('comp', '1');
  e.ordem.forEach((o) => p.append('o', o.col + '.' + (o.dir === 1 ? 'a' : 'd')));
  if (e.agrupar) p.set('ag', e.agrupar);
  if (e.visao !== 'lista') p.set('v', e.visao);
  if (e.visao === 'cruzar') { p.set('x', e.x); p.set('y', e.y); }
  if (e.visao === 'setor' && e.ordemMatriz !== 'a1') p.set('om', e.ordemMatriz);
  if (e.conta) p.set('c', e.conta);
  e.comparar.forEach((id) => p.append('cmp', id));
  if (e.comparacaoAberta && e.comparar.length) p.set('cmpv', '1');
  const padrao = estadoInicial().colunas.join(',');
  if (e.colunas.join(',') !== padrao) p.set('cols', e.colunas.join(','));
  e.recolhidos.forEach((g) => p.append('rg', g));
  const s = p.toString();
  return s ? '?' + s : '';
}
