// @ts-check
/**
 * Módulo único de configuração do modelo integrado experimental.
 *
 * Consumido pelo cálculo (modelo.js), pelo painel de metodologia
 * (metodologia.js) e pelos testes. Mudar um limite aqui muda o cálculo
 * e o texto da tela ao mesmo tempo.
 *
 * Tudo aqui é PROPOSTA ainda não calibrada com a base real (briefing v2,
 * seção 2 e decisão D4). Não apresentar como metodologia comercial validada.
 */

/** @typedef {import('./tipos').ChaveDimensao} ChaveDimensao */
/** @typedef {import('./tipos').Classe} Classe */

/** Ordem fixa dos eixos: ICP, Sinais, Clima, Oportunidade digital. */
/** @type {ChaveDimensao[]} */
export const DIMENSOES = ['icp', 'sinais', 'clima', 'oportunidadeDigital'];

/** @type {Record<ChaveDimensao, { nome: string, curto: string, pergunta: string }>} */
export const NOMES_DIMENSAO = {
  icp: { nome: 'ICP', curto: 'ICP', pergunta: 'Esta empresa é um bom cliente para a Velora?' },
  sinais: { nome: 'Sinais', curto: 'Sinais', pergunta: 'Há fatos que justificam uma conversa agora?' },
  clima: { nome: 'Clima do setor', curto: 'Clima', pergunta: 'O contexto favorece investimento, mudança e contratação?' },
  oportunidadeDigital: { nome: 'Oportunidade digital', curto: 'Digital', pergunta: 'Há espaço relevante e viável para melhorar aquisição e conversão?' }
};

/** Rubrica proposta (seção 4). Orienta leitura; não autoriza fabricar notas. */
/** @type {Record<ChaveDimensao, string[]>} */
export const RUBRICA = {
  icp: ['Baixa aderência comprovada', 'Aderência limitada', 'Aderência intermediária', 'Forte aderência', 'Aderência muito alta'],
  sinais: ['Evidência atual de timing desfavorável', 'Indícios fracos ou pouco atuais', 'Fato relevante com timing moderado', 'Fatos recentes e consistentes', 'Convergência de fatos fortes e recentes'],
  clima: ['Forte contexto adverso documentado', 'Contexto predominantemente desfavorável', 'Contexto misto ou estável documentado', 'Contexto favorável documentado', 'Contexto muito favorável e consistente'],
  oportunidadeDigital: ['Pouco espaço ou baixa viabilidade comprovados', 'Lacunas pequenas ou de impacto limitado', 'Espaço relevante com viabilidade intermediária', 'Lacunas relevantes com boa viabilidade', 'Grande espaço de evolução com impacto e viabilidade sustentados']
};

export const MODELO = Object.freeze({
  versaoModelo: /** @type {'integrado-experimental-1'} */ ('integrado-experimental-1'),
  selo: 'Modelo experimental 1 · pesos iguais · limites ainda não calibrados',
  rotuloPrioridade: 'Prioridade integrada (experimental)',

  escala: Object.freeze({ min: 1, max: 5 }),

  /** Pesos iguais: hipótese inicial transparente. */
  pesos: Object.freeze(/** @type {Record<ChaveDimensao, number>} */ ({ icp: 1, sinais: 1, clima: 1, oportunidadeDigital: 1 })),

  /**
   * Tolerância de comparação de limites: valor >= limite - tolerancia.
   * Proteção técnica contra erro de ponto flutuante, não arredondamento.
   */
  tolerancia: 1e-9,

  /** Regras aplicadas NESTA ordem, só em avaliações completas (seção 8.2). */
  classes: Object.freeze({
    C: Object.freeze({ icpAbaixoDe: 3, notaAbaixoDe: 2.5 }),
    A1: Object.freeze({ nota: 4.5, minimos: Object.freeze({ icp: 4, sinais: 4, clima: 3, oportunidadeDigital: 3 }) }),
    A2: Object.freeze({ nota: 4.0, minimos: Object.freeze({ icp: 4, sinais: 3, clima: 3, oportunidadeDigital: 3 }) }),
    B1: Object.freeze({ nota: 3.25 })
  }),

  /** Ordem de exibição e leitura curta de cada classe. */
  ordemClasses: /** @type {Classe[]} */ (['A1', 'A2', 'B1', 'B2', 'C']),
  leituraClasse: Object.freeze(/** @type {Record<Classe, { curto: string, leitura: string }>} */ ({
    A1: { curto: 'sweet spot', leitura: 'Sweet spot: maior convergência dos quatro eixos' },
    A2: { curto: 'alta', leitura: 'Alta prioridade' },
    B1: { curto: 'boa', leitura: 'Boa conta para desenvolvimento' },
    B2: { curto: 'monitorar', leitura: 'Monitorar ou validar antes de priorizar' },
    C: { curto: 'baixa prioridade', leitura: 'Baixa prioridade no modelo integrado' }
  })),

  /**
   * Teste de viabilidade da candidata (seção 8.5): a dimensão faltante é
   * tratada como o máximo da escala SÓ para saber se A1 ainda é possível.
   * Nunca é exibido, gravado, somado em nota nem usado em ordenação.
   */
  valorTesteViabilidade: 5,

  /** Casas decimais de exibição. */
  casasNotaIntegrada: 2,

  /** Atalhos de visão (seção 6.1), também experimentais. */
  atalhos: Object.freeze({
    pertoDoSweetSpot: Object.freeze({ criteriosMinimos: 4 }),
    bomEncaixeTimingFraco: Object.freeze({ icpMin: 4, sinaisAbaixoDe: 3 }),
    timingForteEncaixeDuvidoso: Object.freeze({ sinaisMin: 4, icpAbaixoDe: 4 })
  }),

  /** Faixas do cruzamento de duas dimensões: 1 ponto cada. */
  faixasCruzamento: Object.freeze([[1, 2], [2, 3], [3, 4], [4, 5]]),
  /** Corte usado para nomear quadrantes do cruzamento ("alto" a partir de). */
  corteQuadrante: 3,

  /** Passo dos filtros de nota por dimensão. */
  passoFiltroNota: 0.5
});

/** Soma dos pesos (com pesos iguais, 4). */
export function somaPesos() {
  return DIMENSOES.reduce((t, k) => t + MODELO.pesos[k], 0);
}
