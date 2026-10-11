// Modelo "Sofrimento Duplo": chance de cada perfil de torcedor/eleitor ver o
// clube rebaixado e o candidato derrotado no 2º turno. Só funções puras, sem DOM.

/**
 * Premissas padrão. Todas aparecem na tela e podem ser editadas.
 * Probabilidades sempre na escala 0–1.
 */
export const DEFAULTS = deepFreeze({
  dataReferencia: '2026-10-11',

  // Política: 2º turno em 25/10/2026, Lula (PT) x Flávio Bolsonaro (PL).
  // Base: Datafolha 06–07/10 (Flávio 52% x Lula 48% dos votos válidos) e
  // 1º turno (Flávio 47,03% x Lula 45,16%). P(Lula) = 1 − P(Flávio).
  pFlavio: 0.65,

  // Futebol: Grêmio x Inter, 30ª rodada do Brasileirão (11/10/2026).
  // 'probabilistico' usa probJogo; os demais fixam o resultado em 100%.
  resultadoJogo: 'probabilistico',
  probJogo: { gremioVence: 0.401, empate: 0.28, interVence: 0.319 },

  // Risco de rebaixamento de cada clube, condicional ao resultado do Gre-Nal
  // (modelo ValorFinal, pré-jogo).
  riscoRebaixamento: {
    gremioVence: { gremio: 0.472, inter: 0.584 },
    empate: { gremio: 0.676, inter: 0.461 },
    interVence: { gremio: 0.792, inter: 0.26 },
  },
});

/** Faixa do slider de P(Flávio vence). */
export const FAIXA_P_FLAVIO = Object.freeze({ min: 0.4, max: 0.7 });

export const RESULTADOS = Object.freeze(['gremioVence', 'empate', 'interVence']);
export const MODOS_JOGO = Object.freeze(['probabilistico', ...RESULTADOS]);

export const CLUBES = Object.freeze({ gremio: 'Grêmio', inter: 'Inter' });
export const CANDIDATOS = Object.freeze({ lula: 'Lula', flavio: 'Flávio' });

export const PERFIS = deepFreeze([
  { id: 'gremista-lula', nome: 'Gremista pró-Lula', clube: 'gremio', candidato: 'lula' },
  { id: 'colorado-lula', nome: 'Colorado pró-Lula', clube: 'inter', candidato: 'lula' },
  { id: 'gremista-flavio', nome: 'Gremista pró-Flávio', clube: 'gremio', candidato: 'flavio' },
  { id: 'colorado-flavio', nome: 'Colorado pró-Flávio', clube: 'inter', candidato: 'flavio' },
]);

const EPS = 1e-9;

/**
 * Calcula os quatro cenários de cada perfil.
 *
 * Clube e eleição são tratados como independentes, então cada cenário é o
 * produto das probabilidades marginais. Se as três probabilidades do jogo não
 * somarem 1, elas são normalizadas (e `jogo.normalizado` vira true).
 *
 * @param {typeof DEFAULTS} params
 */
export function calcPerfis(params = DEFAULTS) {
  const pFlavio = prob(params.pFlavio, 'pFlavio');
  const pVence = { flavio: pFlavio, lula: 1 - pFlavio };

  const jogo = probabilidadesDoJogo(params.resultadoJogo, params.probJogo);
  const pRebaixa = riscoDeRebaixamento(jogo.efetiva, params.riscoRebaixamento);

  const perfis = PERFIS.map((perfil) => {
    const pClube = pRebaixa[perfil.clube];
    const pCand = pVence[perfil.candidato];
    return {
      ...perfil,
      pClube,
      pCand,
      quedaEDerrota: pClube * (1 - pCand), // pior cenário
      quedaEVitoria: pClube * pCand,
      ficaEDerrota: (1 - pClube) * (1 - pCand),
      ficaEVitoria: (1 - pClube) * pCand, // melhor cenário
      derrotasEsperadas: pClube + (1 - pCand), // 0 a 2
    };
  });

  const ranking = [...perfis].sort(compararSofrimento);
  ranking.forEach((p, i) => {
    // Perfis empatados dividem a mesma posição.
    const empatado = i > 0 && compararSofrimento(p, ranking[i - 1]) === 0;
    p.posicao = empatado ? ranking[i - 1].posicao : i + 1;
  });
  const lideres = ranking.filter((p) => p.posicao === 1);

  return { pVence, jogo, pRebaixa, perfis, ranking, lideres };
}

/**
 * Probabilidades efetivas do Gre-Nal.
 * Resultado conhecido: 1 para ele e 0 para os outros.
 */
export function probabilidadesDoJogo(resultadoJogo, probJogo) {
  if (!MODOS_JOGO.includes(resultadoJogo)) {
    throw new RangeError(`resultadoJogo inválido: ${resultadoJogo}`);
  }

  if (resultadoJogo !== 'probabilistico') {
    const efetiva = Object.fromEntries(RESULTADOS.map((r) => [r, r === resultadoJogo ? 1 : 0]));
    return { efetiva, somaInformada: 1, normalizado: false };
  }

  const informada = Object.fromEntries(RESULTADOS.map((r) => [r, prob(probJogo?.[r], `probJogo.${r}`)]));
  const somaInformada = RESULTADOS.reduce((s, r) => s + informada[r], 0);
  if (somaInformada <= 0) {
    throw new RangeError('As probabilidades do jogo não podem ser todas zero.');
  }

  const normalizado = Math.abs(somaInformada - 1) > EPS;
  const efetiva = normalizado
    ? Object.fromEntries(RESULTADOS.map((r) => [r, informada[r] / somaInformada]))
    : informada;
  return { efetiva, somaInformada, normalizado };
}

/** P(rebaixa) de cada clube = soma de P(resultado) × risco condicional. */
export function riscoDeRebaixamento(probEfetiva, risco) {
  return Object.fromEntries(
    Object.keys(CLUBES).map((clube) => [
      clube,
      RESULTADOS.reduce(
        (soma, r) => soma + probEfetiva[r] * prob(risco?.[r]?.[clube], `riscoRebaixamento.${r}.${clube}`),
        0,
      ),
    ]),
  );
}

/**
 * Ordem do ranking: mais derrotas esperadas primeiro; empate decidido pelo
 * pior cenário; depois a ordem fixa de PERFIS.
 */
function compararSofrimento(a, b) {
  const dDerrotas = b.derrotasEsperadas - a.derrotasEsperadas;
  if (Math.abs(dDerrotas) > EPS) return dDerrotas;
  const dPior = b.quedaEDerrota - a.quedaEDerrota;
  if (Math.abs(dPior) > EPS) return dPior;
  return 0;
}

function prob(valor, nome) {
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0 || valor > 1) {
    throw new RangeError(`${nome} deve ser um número entre 0 e 1 (recebido: ${valor}).`);
  }
  return valor;
}

function deepFreeze(obj) {
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') deepFreeze(v);
  }
  return Object.freeze(obj);
}
