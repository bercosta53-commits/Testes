// @ts-check
import { MODELO } from './config.js';

/**
 * Único ponto de comparação de limites do modelo.
 * valor >= limite - tolerância (seção 8.1). Não arredonda o valor.
 * @param {number} valor
 * @param {number} limite
 */
export function atende(valor, limite) {
  return valor >= limite - MODELO.tolerancia;
}

/**
 * Estritamente abaixo do limite, coerente com `atende`.
 * @param {number} valor
 * @param {number} limite
 */
export function abaixoDe(valor, limite) {
  return !atende(valor, limite);
}

/** @param {unknown} v */
export function numeroValido(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

const fmtCache = new Map();
/** @param {number} min @param {number} max */
function fmt(min, max) {
  const k = min + ':' + max;
  if (!fmtCache.has(k)) fmtCache.set(k, new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max }));
  return fmtCache.get(k);
}

/**
 * Nota por dimensão: uma casa quando houver decimal ("4", "3,5").
 * Inteiros aparecem como "4,0" para leitura uniforme na escala 1–5.
 * @param {number | null} v
 */
export function fmtNota(v) {
  if (v == null) return '—';
  return fmt(1, 1).format(v);
}

/**
 * Nota integrada: sempre duas casas (4,46 nunca vira "4,5" ao lado de A2).
 * @param {number | null} v
 */
export function fmtNotaIntegrada(v) {
  if (v == null) return '—';
  return fmt(MODELO.casasNotaIntegrada, MODELO.casasNotaIntegrada).format(v);
}

/**
 * Limites de regra: mostra o necessário sem perder precisão (3, 3,25, 4,5).
 * @param {number} v
 */
export function fmtLimite(v) {
  return fmt(0, 2).format(v);
}

/**
 * Nota mínima exigida: arredonda PARA CIMA em centésimos, para que o número
 * exibido sempre baste (3,2 exato fica 3,2; 3,241 vira 3,25).
 * @param {number} v
 */
export function fmtMinimoExigido(v) {
  const c = Math.ceil(v * 100 - MODELO.tolerancia * 100) / 100;
  return fmt(0, 2).format(c);
}

/**
 * Diferença que falta para um mínimo (positiva), em décimos arredondados para cima.
 * @param {number} valor @param {number} minimo
 */
export function fmtFalta(valor, minimo) {
  const d = minimo - valor;
  const c = Math.ceil(d * 100 - MODELO.tolerancia * 100) / 100;
  return fmt(1, 2).format(c);
}

/** @param {number} n */
export function fmtInteiro(n) {
  return fmt(0, 0).format(n);
}

/**
 * Data ISO → dd/mm/aaaa (sem converter fuso de datas puras).
 * @param {string | null} iso
 */
export function fmtData(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return '';
  return m[3] + '/' + m[2] + '/' + m[1];
}
