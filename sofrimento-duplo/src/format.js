// Formatação pt-BR, cenários e textos de fórmula. Funções puras, sem DOM.
import { CANDIDATOS, CLUBES } from './calc.js';

const formatadores = new Map();
function formatador(opcoes) {
  const chave = JSON.stringify(opcoes);
  if (!formatadores.has(chave)) formatadores.set(chave, new Intl.NumberFormat('pt-BR', opcoes));
  return formatadores.get(chave);
}

/** 0.41028 → "41%" (casas = 0) ou "41,0%" (casas = 1). */
export const pct = (x, casas = 0) =>
  formatador({ style: 'percent', minimumFractionDigits: casas, maximumFractionDigits: casas }).format(x);

/** Casas decimais para um % editável: 0,52 → 0 ("52%"); 0,676 → 1 ("67,6%"). */
export const casasPct = (x) => (Math.round(x * 1000) % 10 === 0 ? 0 : 1);

/** 1.2812 → "1,28". */
export const num = (x, casas = 2) =>
  formatador({ minimumFractionDigits: casas, maximumFractionDigits: casas }).format(x);

/** Probabilidade nas fórmulas: 0.401 → "0,401". */
export const dec = (x) => num(x, 3);

/** "2026-10-11" → "11/10/2026". */
export const dataBR = (iso) => iso.split('-').reverse().join('/');

/** Probabilidade (0–1) → valor do campo em % com até 1 casa: 0.676 → 67.6. */
export const paraCampo = (p) => Math.round(p * 1000) / 10;

/** Token de cor de cada clube e candidato. */
export const COR_IDENTIDADE = Object.freeze({
  gremio: '--gremio',
  inter: '--inter',
  lula: '--lula',
  flavio: '--flavio',
});

/**
 * Os quatro cenários, do pior para o melhor. Nas barras empilhadas, só o pior
 * leva a cor de destaque; os outros três são cinzas.
 */
export const CENARIOS = Object.freeze([
  { chave: 'quedaEDerrota', nome: 'Sofrimento duplo', marca: 'pior', cor: '--acento', cai: true, perde: true },
  { chave: 'quedaEVitoria', nome: 'Só o clube cai', marca: null, cor: '--cinza-1', cai: true, perde: false },
  { chave: 'ficaEDerrota', nome: 'Só o candidato perde', marca: null, cor: '--cinza-2', cai: false, perde: true },
  { chave: 'ficaEVitoria', nome: 'Nenhuma derrota', marca: 'melhor', cor: '--cinza-3', cai: false, perde: false },
]);

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
