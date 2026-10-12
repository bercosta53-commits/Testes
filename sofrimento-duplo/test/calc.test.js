import { describe, expect, it } from 'vitest';
import { DEFAULTS, PERFIS, calcPerfis } from '../src/calc.js';

const porId = (resultado) => Object.fromEntries(resultado.perfis.map((p) => [p.id, p]));
const comParams = (mudancas) => ({ ...structuredClone(DEFAULTS), ...mudancas });
const cenarios = (x) => x.quedaEDerrota + x.quedaEVitoria + x.ficaEDerrota + x.ficaEVitoria;

describe('calcPerfis com as premissas padrão', () => {
  const r = calcPerfis(DEFAULTS);
  const p = porId(r);

  it('usa Flávio 52% × Lula 48% e o risco de queda após o empate no Gre-Nal', () => {
    expect(r.pVence.flavio).toBe(0.52);
    expect(r.pVence.lula).toBeCloseTo(0.48, 12);
    expect(r.pRebaixa).toEqual({ gremio: 0.676, inter: 0.461 });
  });

  it.each([
    // perfil, sofrimento duplo, derrotas esperadas
    ['gremista-lula', 0.676 * 0.52, 0.676 + 0.52],
    ['gremista-flavio', 0.676 * 0.48, 0.676 + 0.48],
    ['colorado-lula', 0.461 * 0.52, 0.461 + 0.52],
    ['colorado-flavio', 0.461 * 0.48, 0.461 + 0.48],
  ])('%s', (id, pior, derrotas) => {
    expect(p[id].quedaEDerrota).toBeCloseTo(pior, 12);
    expect(p[id].derrotasEsperadas).toBeCloseTo(derrotas, 12);
  });

  it('calcula os outros três cenários', () => {
    const g = p['gremista-lula'];
    expect(g.quedaEVitoria).toBeCloseTo(0.676 * 0.48, 12);
    expect(g.ficaEDerrota).toBeCloseTo(0.324 * 0.52, 12);
    expect(g.ficaEVitoria).toBeCloseTo(0.324 * 0.48, 12);
  });

  it('ordena o ranking por derrotas esperadas: os dois gremistas no topo', () => {
    expect(r.ranking.map((x) => x.id)).toEqual(['gremista-lula', 'gremista-flavio', 'colorado-lula', 'colorado-flavio']);
    expect(r.ranking.map((x) => x.posicao)).toEqual([1, 2, 3, 4]);
    expect(r.lideres.map((x) => x.id)).toEqual(['gremista-lula']);
  });

  it('mantém os perfis na ordem fixa de PERFIS', () => {
    expect(r.perfis.map((x) => x.id)).toEqual(PERFIS.map((x) => x.id));
  });
});

describe('fórmulas do briefing original', () => {
  it('reproduzem a tabela de resultados esperados com as premissas antigas', () => {
    // P(Flávio) = 65% e risco ponderado pelos três resultados do Gre-Nal (63,12% e 44,62%).
    const r = calcPerfis({ pFlavio: 0.65, riscoRebaixamento: { gremio: 0.6312, inter: 0.446204 } });
    const p = porId(r);
    for (const [id, pior, derrotas] of [
      ['gremista-lula', 0.41, 1.28],
      ['colorado-lula', 0.29, 1.1],
      ['gremista-flavio', 0.22, 0.98],
      ['colorado-flavio', 0.16, 0.8],
    ]) {
      expect(Math.abs(p[id].quedaEDerrota - pior)).toBeLessThanOrEqual(0.01);
      expect(Math.abs(p[id].derrotasEsperadas - derrotas)).toBeLessThanOrEqual(0.01);
    }
  });
});

describe('soma dos cenários', () => {
  it('é 100% para cada perfil com os padrões', () => {
    for (const x of calcPerfis(DEFAULTS).perfis) expect(cenarios(x)).toBeCloseTo(1, 12);
  });

  it('é 100% para qualquer combinação de premissas', () => {
    let semente = 42;
    const aleatorio = () => {
      semente = (semente * 1664525 + 1013904223) % 2 ** 32;
      return semente / 2 ** 32;
    };
    for (let i = 0; i < 500; i++) {
      const params = { pFlavio: aleatorio(), riscoRebaixamento: { gremio: aleatorio(), inter: aleatorio() } };
      for (const x of calcPerfis(params).perfis) {
        expect(cenarios(x)).toBeCloseTo(1, 12);
        expect(x.derrotasEsperadas).toBeGreaterThanOrEqual(0);
        expect(x.derrotasEsperadas).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('força de Lula', () => {
  it('com eleição empatada, os dois gremistas dividem a liderança', () => {
    const r = calcPerfis(comParams({ pFlavio: 0.5 }));
    expect(r.lideres.map((x) => x.id)).toEqual(['gremista-lula', 'gremista-flavio']);
    expect(r.ranking.map((x) => x.posicao)).toEqual([1, 1, 3, 3]);
  });

  it('com Lula favorito, o gremista pró-Flávio passa a liderar', () => {
    const r = calcPerfis(comParams({ pFlavio: 0.4 }));
    expect(r.ranking[0].id).toBe('gremista-flavio');
    expect(r.ranking[0].quedaEDerrota).toBeCloseTo(0.676 * 0.6, 12);
  });
});

describe('validação', () => {
  it.each([
    ['pFlavio acima de 1', { pFlavio: 1.2 }],
    ['pFlavio negativo', { pFlavio: -0.1 }],
    ['pFlavio NaN', { pFlavio: Number.NaN }],
    ['pFlavio texto', { pFlavio: '0.52' }],
    ['risco fora de 0–1', { riscoRebaixamento: { gremio: 67.6, inter: 0.461 } }],
    ['risco ausente', { riscoRebaixamento: { gremio: 0.5 } }],
  ])('rejeita %s', (_, mudancas) => {
    expect(() => calcPerfis(comParams(mudancas))).toThrow(RangeError);
  });

  it('não altera os parâmetros recebidos', () => {
    const params = structuredClone(DEFAULTS);
    const copia = structuredClone(params);
    calcPerfis(params);
    expect(params).toEqual(copia);
  });

  it('DEFAULTS é imutável', () => {
    expect(Object.isFrozen(DEFAULTS)).toBe(true);
    expect(Object.isFrozen(DEFAULTS.riscoRebaixamento)).toBe(true);
  });
});
