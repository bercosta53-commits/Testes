// Modelo "Sofrimento Duplo": chance de cada perfil de torcedor/eleitor ver o
// clube rebaixado e o candidato derrotado no 2º turno. Só funções puras, sem DOM.

/**
 * Premissas padrão. Todas aparecem na tela e podem ser editadas.
 * Probabilidades sempre na escala 0–1.
 */
export const DEFAULTS = deepFreeze({
  dataReferencia: '2026-10-11',

  // Política: 2º turno em 25/10/2026, Lula (PT) x Flávio Bolsonaro (PL).
  // Chance de vitória igual à divisão dos votos válidos no Datafolha de 06–07/10
  // (Flávio 52% x Lula 48%). No 1º turno: Flávio 47,03% x Lula 45,16%.
  pFlavio: 0.52,

  // Risco de rebaixamento de cada clube depois do empate no Gre-Nal da 30ª
  // rodada (modelo ValorFinal, risco condicional ao empate).
  riscoRebaixamento: { gremio: 0.676, inter: 0.461 },
});

/** Faixa do controle de P(Flávio vence): de Lula favorito a Flávio favorito. */
export const FAIXA_P_FLAVIO = Object.freeze({ min: 0.3, max: 0.7 });

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
 * Calcula os quatro cenários de cada perfil. Clube e eleição são tratados como
 * independentes, então cada cenário é o produto das probabilidades marginais.
 *
 * @param {typeof DEFAULTS} params
 */
export function calcPerfis(params = DEFAULTS) {
  const pFlavio = prob(params.pFlavio, 'pFlavio');
  const pVence = { flavio: pFlavio, lula: 1 - pFlavio };
  const pRebaixa = Object.fromEntries(
    Object.keys(CLUBES).map((c) => [c, prob(params.riscoRebaixamento?.[c], `riscoRebaixamento.${c}`)]),
  );

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

  return { pVence, pRebaixa, perfis, ranking, lideres };
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
