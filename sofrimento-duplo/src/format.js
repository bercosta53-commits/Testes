// Formatação pt-BR e textos de fórmula. Funções puras, sem DOM.
import { CANDIDATOS, CLUBES, RESULTADOS } from './calc.js';

const formatadores = new Map();
function formatador(opcoes) {
  const chave = JSON.stringify(opcoes);
  if (!formatadores.has(chave)) formatadores.set(chave, new Intl.NumberFormat('pt-BR', opcoes));
  return formatadores.get(chave);
}

/** 0.41028 → "41%" (casas = 0) ou "41,0%" (casas = 1). */
export const pct = (x, casas = 0) =>
  formatador({ style: 'percent', minimumFractionDigits: casas, maximumFractionDigits: casas }).format(x);

/** Casas decimais para mostrar um % do slider: 0,65 → 0 ("65%"); 0,575 → 1 ("57,5%"). */
export const casasPct = (x) => (Math.round(x * 1000) % 10 === 0 ? 0 : 1);

/** 1.2812 → "1,28". */
export const num = (x, casas = 2) =>
  formatador({ minimumFractionDigits: casas, maximumFractionDigits: casas }).format(x);

/** Probabilidade nas fórmulas: 0.401 → "0,401". */
export const dec = (x) => num(x, 3);

/** Diferença em pontos percentuais, com sinal: 0.0096 → "+1,0 p.p."; 0 → "0,0 p.p.". */
export const pp = (x, casas = 1) => {
  const v = Math.round(x * 100 * 10 ** casas) / 10 ** casas;
  const sinal = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sinal}${num(Math.abs(v), casas)} p.p.`;
};

/** "2026-10-11" → "11/10/2026". */
export const dataBR = (iso) => iso.split('-').reverse().join('/');

/** Probabilidade (0–1) → valor do campo em % com até 1 casa: 0.401 → 40.1. */
export const paraCampo = (p) => Math.round(p * 1000) / 10;

export const NOMES_RESULTADO = Object.freeze({
  gremioVence: 'Grêmio vence',
  empate: 'Empate',
  interVence: 'Inter vence',
});

export const NOMES_MODO = Object.freeze({
  probabilistico: 'Probabilístico',
  gremioVence: 'Grêmio venceu',
  empate: 'Empate',
  interVence: 'Inter venceu',
});

/**
 * Os quatro cenários, do pior para o melhor. A cor dos cenários de uma derrota
 * só é a da origem da dor: a do clube quando só ele cai, a do candidato quando
 * só ele perde.
 */
export const CENARIOS = Object.freeze([
  { chave: 'quedaEDerrota', nome: 'Sofrimento duplo', marca: 'pior', cor: () => '--c-pior', cai: true, perde: true },
  { chave: 'quedaEVitoria', nome: 'Só o clube cai', marca: null, cor: (p) => `--${p.clube}`, cai: true, perde: false },
  { chave: 'ficaEDerrota', nome: 'Só o candidato perde', marca: null, cor: (p) => `--${p.candidato}`, cai: false, perde: true },
  { chave: 'ficaEVitoria', nome: 'Nenhuma derrota', marca: 'melhor', cor: () => '--c-melhor', cai: false, perde: false },
]);

/** Token de cor de cada clube e candidato (a cor que identifica cada um). */
export const COR_IDENTIDADE = Object.freeze({
  gremio: '--gremio',
  inter: '--inter',
  lula: '--lula',
  flavio: '--flavio',
});

/** Texto do cálculo de P(rebaixa) de um clube, com o ajuste do Corinthians. */
export function formulaRebaixamento(clube, resultado, params) {
  const { resultadoJogo, riscoRebaixamento } = params;
  const ajuste = resultado.ajuste > 0 ? ` − ${dec(resultado.ajuste)} (ajuste Corinthians)` : '';
  if (resultadoJogo !== 'probabilistico') {
    return `Risco no cenário “${NOMES_MODO[resultadoJogo]}”: ${dec(riscoRebaixamento[resultadoJogo][clube])}${ajuste}`;
  }
  const { efetiva } = resultado.jogo;
  return RESULTADOS.map((r) => `${dec(efetiva[r])} × ${dec(riscoRebaixamento[r][clube])}`).join(' + ') + ajuste;
}

/** Texto do cálculo de um cenário de um perfil. */
export function formulaCenario(perfil, cenario) {
  const clube = CLUBES[perfil.clube];
  const cand = CANDIDATOS[perfil.candidato];
  const a = cenario.cai ? perfil.pClube : 1 - perfil.pClube;
  const b = cenario.perde ? 1 - perfil.pCand : perfil.pCand;
  return `P(${clube} ${cenario.cai ? 'cai' : 'fica'}) × P(${cand} ${cenario.perde ? 'perde' : 'vence'}) = ${dec(a)} × ${dec(b)}`;
}

/** Texto do cálculo das derrotas esperadas de um perfil. */
export function formulaDerrotas(perfil) {
  const clube = CLUBES[perfil.clube];
  const cand = CANDIDATOS[perfil.candidato];
  return `P(${clube} cai) + P(${cand} perde) = ${dec(perfil.pClube)} + ${dec(1 - perfil.pCand)}`;
}
