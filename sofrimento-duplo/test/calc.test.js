import { describe, expect, it } from 'vitest';
import { DEFAULTS, PERFIS, PREMISSAS_PRE_JOGO, calcPerfis, probabilidadesDoJogo } from '../src/calc.js';

const UM_PP = 0.01; // tolerância do critério de aceite: 1 ponto percentual

const porId = (resultado) => Object.fromEntries(resultado.perfis.map((p) => [p.id, p]));
const comParams = (mudancas) => ({ ...structuredClone(PREMISSAS_PRE_JOGO), ...mudancas });

describe('calcPerfis com as premissas pré-jogo do briefing', () => {
  const r = calcPerfis(PREMISSAS_PRE_JOGO);
  const p = porId(r);

  it('calcula o risco de rebaixamento ponderado pelo resultado do Gre-Nal', () => {
    // 0,401×0,472 + 0,28×0,676 + 0,319×0,792
    expect(r.pRebaixa.gremio).toBeCloseTo(0.6312, 4);
    // 0,401×0,584 + 0,28×0,461 + 0,319×0,260
    expect(r.pRebaixa.inter).toBeCloseTo(0.446204, 6);
  });

  it('usa P(Lula) = 1 − P(Flávio)', () => {
    expect(r.pVence.flavio).toBe(0.65);
    expect(r.pVence.lula).toBeCloseTo(0.35, 12);
  });

  it.each([
    // perfil, pior cenário, derrotas esperadas (tabela do briefing)
    ['gremista-lula', 0.41, 1.28],
    ['colorado-lula', 0.29, 1.1],
    ['gremista-flavio', 0.22, 0.98],
    ['colorado-flavio', 0.16, 0.8],
  ])('%s bate com a tabela de resultados esperados', (id, pior, derrotas) => {
    expect(Math.abs(p[id].quedaEDerrota - pior)).toBeLessThanOrEqual(UM_PP);
    expect(Math.abs(p[id].derrotasEsperadas - derrotas)).toBeLessThanOrEqual(UM_PP);
  });

  it('chega aos valores exatos', () => {
    expect(p['gremista-lula'].quedaEDerrota).toBeCloseTo(0.6312 * 0.65, 10);
    expect(p['colorado-lula'].quedaEDerrota).toBeCloseTo(0.446204 * 0.65, 10);
    expect(p['gremista-flavio'].quedaEDerrota).toBeCloseTo(0.6312 * 0.35, 10);
    expect(p['colorado-flavio'].quedaEDerrota).toBeCloseTo(0.446204 * 0.35, 10);
    expect(p['gremista-lula'].derrotasEsperadas).toBeCloseTo(1.2812, 10);
    expect(p['colorado-flavio'].derrotasEsperadas).toBeCloseTo(0.796204, 10);
  });

  it('calcula os outros três cenários de cada perfil', () => {
    const g = p['gremista-lula'];
    expect(g.quedaEVitoria).toBeCloseTo(0.6312 * 0.35, 10);
    expect(g.ficaEDerrota).toBeCloseTo(0.3688 * 0.65, 10);
    expect(g.ficaEVitoria).toBeCloseTo(0.3688 * 0.35, 10);
  });

  it('ordena o ranking por derrotas esperadas', () => {
    expect(r.ranking.map((x) => x.id)).toEqual([
      'gremista-lula',
      'colorado-lula',
      'gremista-flavio',
      'colorado-flavio',
    ]);
    expect(r.lideres.map((x) => x.id)).toEqual(['gremista-lula']);
    expect(r.ranking.map((x) => x.posicao)).toEqual([1, 2, 3, 4]);
  });

  it('mantém os perfis na ordem fixa de PERFIS', () => {
    expect(r.perfis.map((x) => x.id)).toEqual(PERFIS.map((x) => x.id));
  });

  it('não normaliza quando as probabilidades do jogo somam 100%', () => {
    expect(r.jogo.normalizado).toBe(false);
    expect(r.jogo.somaInformada).toBeCloseTo(1, 12);
  });

  it('não aplica ajuste do Corinthians', () => {
    expect(r.ajuste).toBe(0);
    expect(r.pRebaixa).toEqual(r.pRebaixaModelo);
  });
});

describe('calcPerfis com os padrões pós-rodada (empate no Gre-Nal e derrota do Corinthians)', () => {
  const r = calcPerfis(DEFAULTS);
  const p = porId(r);

  it('fixa o empate e desconta 3 p.p. do risco de cada clube', () => {
    expect(DEFAULTS.resultadoJogo).toBe('empate');
    expect(r.jogo.efetiva).toEqual({ gremioVence: 0, empate: 1, interVence: 0 });
    expect(r.pRebaixaModelo.gremio).toBeCloseTo(0.676, 12);
    expect(r.pRebaixaModelo.inter).toBeCloseTo(0.461, 12);
    expect(r.ajuste).toBe(0.03);
    expect(r.pRebaixa.gremio).toBeCloseTo(0.646, 12);
    expect(r.pRebaixa.inter).toBeCloseTo(0.431, 12);
  });

  it.each([
    ['gremista-lula', 0.646 * 0.65, 0.646 + 0.65],
    ['colorado-lula', 0.431 * 0.65, 0.431 + 0.65],
    ['gremista-flavio', 0.646 * 0.35, 0.646 + 0.35],
    ['colorado-flavio', 0.431 * 0.35, 0.431 + 0.35],
  ])('%s', (id, pior, derrotas) => {
    expect(p[id].quedaEDerrota).toBeCloseTo(pior, 10);
    expect(p[id].derrotasEsperadas).toBeCloseTo(derrotas, 10);
  });

  it('mantém a ordem do ranking do pré-jogo', () => {
    expect(r.ranking.map((x) => x.id)).toEqual(['gremista-lula', 'colorado-lula', 'gremista-flavio', 'colorado-flavio']);
  });
});

describe('ajuste do Corinthians', () => {
  it('desconta o mesmo valor dos dois clubes', () => {
    const r = calcPerfis(comParams({ ajusteCorinthians: 0.05 }));
    expect(r.pRebaixa.gremio).toBeCloseTo(0.6312 - 0.05, 12);
    expect(r.pRebaixa.inter).toBeCloseTo(0.446204 - 0.05, 12);
  });

  it('não deixa o risco ficar negativo', () => {
    const risco = { gremio: 0.02, inter: 0.5 };
    const r = calcPerfis(
      comParams({
        resultadoJogo: 'empate',
        ajusteCorinthians: 0.1,
        riscoRebaixamento: { gremioVence: risco, empate: risco, interVence: risco },
      }),
    );
    expect(r.pRebaixa.gremio).toBe(0);
    expect(r.pRebaixa.inter).toBeCloseTo(0.4, 12);
    for (const x of r.perfis) {
      expect(x.quedaEDerrota + x.quedaEVitoria + x.ficaEDerrota + x.ficaEVitoria).toBeCloseTo(1, 12);
    }
  });

  it('é tratado como zero quando ausente', () => {
    const { ajusteCorinthians, ...semAjuste } = structuredClone(PREMISSAS_PRE_JOGO);
    expect(calcPerfis(semAjuste).ajuste).toBe(0);
  });
});

describe('soma dos cenários', () => {
  const cenarios = (x) => x.quedaEDerrota + x.quedaEVitoria + x.ficaEDerrota + x.ficaEVitoria;

  it('é 100% para cada perfil com os padrões', () => {
    for (const x of calcPerfis(DEFAULTS).perfis) expect(cenarios(x)).toBeCloseTo(1, 12);
    for (const x of calcPerfis(PREMISSAS_PRE_JOGO).perfis) expect(cenarios(x)).toBeCloseTo(1, 12);
  });

  it('é 100% para qualquer combinação de premissas', () => {
    let semente = 42;
    const aleatorio = () => {
      semente = (semente * 1664525 + 1013904223) % 2 ** 32;
      return semente / 2 ** 32;
    };
    for (let i = 0; i < 500; i++) {
      const params = {
        pFlavio: aleatorio(),
        resultadoJogo: ['probabilistico', 'gremioVence', 'empate', 'interVence'][i % 4],
        ajusteCorinthians: aleatorio() * 0.1,
        probJogo: { gremioVence: aleatorio(), empate: aleatorio(), interVence: aleatorio() },
        riscoRebaixamento: {
          gremioVence: { gremio: aleatorio(), inter: aleatorio() },
          empate: { gremio: aleatorio(), inter: aleatorio() },
          interVence: { gremio: aleatorio(), inter: aleatorio() },
        },
      };
      for (const x of calcPerfis(params).perfis) {
        expect(cenarios(x)).toBeCloseTo(1, 12);
        expect(x.derrotasEsperadas).toBeGreaterThanOrEqual(0);
        expect(x.derrotasEsperadas).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('resultado do Gre-Nal conhecido', () => {
  it.each([
    ['gremioVence', 0.472, 0.584],
    ['empate', 0.676, 0.461],
    ['interVence', 0.792, 0.26],
  ])('%s usa só a linha correspondente da tabela de risco', (resultado, gremio, inter) => {
    const r = calcPerfis(comParams({ resultadoJogo: resultado }));
    expect(r.jogo.efetiva[resultado]).toBe(1);
    expect(r.pRebaixa.gremio).toBeCloseTo(gremio, 12);
    expect(r.pRebaixa.inter).toBeCloseTo(inter, 12);
  });

  it('ignora as probabilidades informadas, mesmo inválidas', () => {
    const r = calcPerfis(comParams({ resultadoJogo: 'interVence', probJogo: { gremioVence: 0, empate: 0, interVence: 0 } }));
    expect(r.pRebaixa.gremio).toBeCloseTo(0.792, 12);
  });

  it('com vitória do Inter, o gremista pró-Lula segue líder', () => {
    const r = calcPerfis(comParams({ resultadoJogo: 'interVence' }));
    expect(r.ranking[0].id).toBe('gremista-lula');
    expect(r.ranking[0].quedaEDerrota).toBeCloseTo(0.792 * 0.65, 12);
  });

  it('com vitória do Grêmio, o colorado pró-Lula vira o líder', () => {
    const r = calcPerfis(comParams({ resultadoJogo: 'gremioVence' }));
    expect(r.ranking[0].id).toBe('colorado-lula');
    expect(r.ranking[0].quedaEDerrota).toBeCloseTo(0.584 * 0.65, 12);
  });
});

describe('probabilidades do jogo que não somam 100%', () => {
  it('são normalizadas', () => {
    const j = probabilidadesDoJogo('probabilistico', { gremioVence: 0.5, empate: 0.25, interVence: 0.25 * 3 });
    expect(j.normalizado).toBe(true);
    expect(j.somaInformada).toBeCloseTo(1.5, 12);
    expect(j.efetiva.gremioVence).toBeCloseTo(1 / 3, 12);
    expect(j.efetiva.empate + j.efetiva.gremioVence + j.efetiva.interVence).toBeCloseTo(1, 12);
  });

  it('dão erro quando são todas zero', () => {
    expect(() => probabilidadesDoJogo('probabilistico', { gremioVence: 0, empate: 0, interVence: 0 })).toThrow(RangeError);
  });
});

describe('P(Flávio) nos extremos do slider', () => {
  it('a 50%, os dois perfis gremistas empatam na liderança e dividem a posição', () => {
    const r = calcPerfis(comParams({ pFlavio: 0.5 }));
    expect(r.lideres.map((x) => x.id)).toEqual(['gremista-lula', 'gremista-flavio']);
    expect(r.ranking.map((x) => x.posicao)).toEqual([1, 1, 3, 3]);
  });

  it('abaixo de 50%, o gremista pró-Flávio passa a liderar', () => {
    const r = calcPerfis(comParams({ pFlavio: 0.4 }));
    expect(r.ranking[0].id).toBe('gremista-flavio');
    expect(r.ranking[0].quedaEDerrota).toBeCloseTo(0.6312 * 0.6, 10);
  });
});

describe('validação', () => {
  it.each([
    ['pFlavio acima de 1', { pFlavio: 1.2 }],
    ['pFlavio negativo', { pFlavio: -0.1 }],
    ['pFlavio NaN', { pFlavio: Number.NaN }],
    ['pFlavio texto', { pFlavio: '0.65' }],
    ['modo desconhecido', { resultadoJogo: 'goleada' }],
    ['probabilidade do jogo fora de 0–1', { probJogo: { gremioVence: 40.1, empate: 0.28, interVence: 0.319 } }],
    ['risco ausente', { riscoRebaixamento: { gremioVence: { gremio: 0.5 } } }],
    ['ajuste negativo', { ajusteCorinthians: -0.01 }],
  ])('rejeita %s', (_, mudancas) => {
    expect(() => calcPerfis(comParams(mudancas))).toThrow(RangeError);
  });

  it('não altera os parâmetros recebidos', () => {
    const params = structuredClone(DEFAULTS);
    const copia = structuredClone(params);
    calcPerfis(params);
    expect(params).toEqual(copia);
  });

  it('DEFAULTS e PREMISSAS_PRE_JOGO são imutáveis', () => {
    expect(Object.isFrozen(DEFAULTS)).toBe(true);
    expect(Object.isFrozen(DEFAULTS.riscoRebaixamento.empate)).toBe(true);
    expect(Object.isFrozen(PREMISSAS_PRE_JOGO)).toBe(true);
  });
});
