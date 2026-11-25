// @ts-check
/**
 * Losango de quatro eixos (seção 7). SVG acessível, sem animação contínua.
 * Topo: ICP · direita: Sinais · base: Clima do setor · esquerda: Oportunidade digital.
 * Escala 1–5 idêntica em todas as contas; centro = 0 (só referência geométrica).
 * Dimensão ausente: eixo rotulado "Sem avaliação", só pontos conhecidos e
 * segmentos entre eixos ADJACENTES conhecidos; nunca fecha o polígono.
 */
import { DIMENSOES, MODELO, NOMES_DIMENSAO } from '../config.js';
import { valida } from '../adaptador.js';
import { fmtNota } from '../numeros.js';
import { esc } from './html.js';

/** @typedef {import('../tipos').ChaveDimensao} ChaveDimensao */
/** @typedef {import('../tipos').DimensaoIntegrada} DimensaoIntegrada */

/** Direção de cada eixo (x, y). */
const DIR = /** @type {Record<ChaveDimensao, [number, number]>} */ ({ icp: [0, -1], sinais: [1, 0], clima: [0, 1], oportunidadeDigital: [-1, 0] });
/** Pares adjacentes no losango. */
export const ADJACENTES = /** @type {Array<[ChaveDimensao, ChaveDimensao]>} */ ([['icp', 'sinais'], ['sinais', 'clima'], ['clima', 'oportunidadeDigital'], ['oportunidadeDigital', 'icp']]);

/**
 * Geometria pura (testável): pontos e segmentos a desenhar.
 * @param {Record<ChaveDimensao, DimensaoIntegrada>} dims
 */
export function geometria(dims) {
  const conhecidas = DIMENSOES.filter((k) => valida(dims[k]));
  const completo = conhecidas.length === DIMENSOES.length;
  const segmentos = completo ? [] : ADJACENTES.filter(([a, b]) => conhecidas.includes(a) && conhecidas.includes(b));
  const foraDoCalculo = DIMENSOES.filter((k) => dims[k].nota != null && !dims[k].entraNoCalculo);
  return { conhecidas, completo, segmentos, foraDoCalculo };
}

/** Texto equivalente: "ICP 4,0; Sinais 3,5; Clima sem avaliação; ..." @param {Record<ChaveDimensao, DimensaoIntegrada>} dims */
export function textoEquivalente(dims) {
  return DIMENSOES.map((k) => {
    const d = dims[k];
    const nome = k === 'clima' ? 'Clima' : NOMES_DIMENSAO[k].nome;
    if (valida(d)) return nome + ' ' + fmtNota(d.nota);
    if (d.nota != null) return nome + ' ' + fmtNota(d.nota) + ' (fora do cálculo)';
    return nome + ' sem avaliação';
  }).join('; ');
}

/**
 * @param {Record<ChaveDimensao, DimensaoIntegrada>} dims
 * @param {{ tamanho?: number, rotulos?: boolean, titulo?: string }} [op]
 */
export function losango(dims, op = {}) {
  const T = op.tamanho || 280;
  const pad = op.rotulos === false ? 10 : 58;
  const R = (T - pad * 2) / 2;
  // Largura extra para os rótulos laterais ("Sem avaliação") caberem.
  const W = op.rotulos === false ? T : T + 64;
  const cx = W / 2, cy = T / 2;
  const max = MODELO.escala.max;
  /** @param {ChaveDimensao} k @param {number} v */
  const pt = (k, v) => [cx + DIR[k][0] * (R * v) / max, cy + DIR[k][1] * (R * v) / max];
  const g = geometria(dims);
  let s = '';
  for (let i = 1; i <= max; i++) {
    const p = DIMENSOES.map((k) => pt(k, i).map((n) => n.toFixed(1)).join(',')).join(' ');
    s += '<polygon class="lz-anel' + (i === max ? ' lz-anel--ext' : '') + '" points="' + p + '"/>';
  }
  for (const k of DIMENSOES) {
    const [x, y] = pt(k, max);
    s += '<line class="lz-eixo' + (valida(dims[k]) ? '' : ' lz-eixo--sem') + '" x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
  }
  // Marcas de escala no eixo ICP (1 a 5).
  if (op.rotulos !== false) for (let i = 1; i <= max; i++) {
    const [x, y] = pt('icp', i);
    s += '<text class="lz-esc" x="' + (x + 4).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '">' + i + '</text>';
  }
  if (g.completo) {
    const p = DIMENSOES.map((k) => pt(k, /** @type {number} */ (dims[k].nota)).map((n) => n.toFixed(1)).join(',')).join(' ');
    s += '<polygon class="lz-poli" points="' + p + '"/>';
  } else {
    for (const [a, b] of g.segmentos) {
      const [x1, y1] = pt(a, /** @type {number} */ (dims[a].nota));
      const [x2, y2] = pt(b, /** @type {number} */ (dims[b].nota));
      s += '<line class="lz-seg" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    }
  }
  for (const k of g.conhecidas) {
    const [x, y] = pt(k, /** @type {number} */ (dims[k].nota));
    s += '<circle class="lz-pt" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5"/>';
  }
  for (const k of g.foraDoCalculo) {
    const [x, y] = pt(k, /** @type {number} */ (dims[k].nota));
    s += '<circle class="lz-pt--fora" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4"/>';
  }
  if (op.rotulos !== false) {
    for (const k of DIMENSOES) {
      const [x, y] = pt(k, max);
      const d = dims[k];
      const dx = DIR[k][0], dy = DIR[k][1];
      const ax = dx === 0 ? 'middle' : dx > 0 ? 'start' : 'end';
      const lx = x + dx * 8, ly = y + dy * 10 + (dy < 0 ? -14 : dy > 0 ? 10 : -4);
      const nome = k === 'oportunidadeDigital' ? 'Digital' : NOMES_DIMENSAO[k].curto;
      const valor = valida(d) ? fmtNota(d.nota) : d.nota != null ? fmtNota(d.nota) + ' · fora' : 'Sem avaliação';
      s += '<text class="lz-rot" text-anchor="' + ax + '" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '">' + esc(nome) + '</text>';
      s += '<text class="' + (valida(d) ? 'lz-val' : 'lz-sem') + '" text-anchor="' + ax + '" x="' + lx.toFixed(1) + '" y="' + (ly + 15).toFixed(1) + '">' + esc(valor) + '</text>';
    }
  }
  const desc = textoEquivalente(dims);
  return '<svg class="losango" viewBox="0 0 ' + W + ' ' + T + '" role="img" aria-label="' + esc((op.titulo ? op.titulo + ': ' : '') + desc) + '">' + s + '</svg>';
}
