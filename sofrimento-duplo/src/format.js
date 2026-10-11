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

/** Os quatro cenários, na ordem do pior para o melhor. */
export const CENARIOS = Object.freeze([
  { chave: 'quedaEDerrota', nome: 'Cai e perde', marca: 'pior', cor: '--c-pior', cai: true, perde: true },
  { chave: 'quedaEVitoria', nome: 'Cai, mas vence', marca: null, cor: '--c-cai-vence', cai: true, perde: false },
  { chave: 'ficaEDerrota', nome: 'Fica, mas perde', marca: null, cor: '--c-fica-perde', cai: false, perde: true },
  { chave: 'ficaEVitoria', nome: 'Fica e vence', marca: 'melhor', cor: '--c-melhor', cai: false, perde: false },
]);

/** Texto do cálculo de P(rebaixa) de um clube. */
export function formulaRebaixamento(clube, resultado, params) {
  const { resultadoJogo, riscoRebaixamento } = params;
  if (resultadoJogo !== 'probabilistico') {
    return `Resultado fixado (${NOMES_MODO[resultadoJogo]}): risco condicional de ${dec(riscoRebaixamento[resultadoJogo][clube])}`;
  }
  const { efetiva } = resultado.jogo;
  return RESULTADOS.map((r) => `${dec(efetiva[r])} × ${dec(riscoRebaixamento[r][clube])}`).join(' + ');
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
