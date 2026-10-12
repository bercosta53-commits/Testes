import { describe, expect, it } from 'vitest';
import { DEFAULTS, calcPerfis } from '../src/calc.js';
import { CENARIOS, casasPct, dataBR, formulaCenario, formulaDerrotas, num, paraCampo, pct } from '../src/format.js';

describe('formatação pt-BR', () => {
  it('formata percentuais e números com vírgula', () => {
    expect(pct(0.35152)).toBe('35%');
    expect(pct(0.35152, 1)).toBe('35,2%');
    expect(num(1.196)).toBe('1,20');
    expect(dataBR('2026-10-11')).toBe('11/10/2026');
  });

  it('mostra uma casa decimal só quando o valor é quebrado', () => {
    expect(casasPct(0.52)).toBe(0);
    expect(casasPct(0.575)).toBe(1);
    expect(casasPct(0.676)).toBe(1);
  });

  it('converte probabilidade para o valor do campo em %', () => {
    expect(paraCampo(0.676)).toBe(67.6);
    expect(paraCampo(0.461)).toBe(46.1);
    expect(paraCampo(0.26)).toBe(26);
  });
});

describe('textos de fórmula', () => {
  const [gremistaLula] = calcPerfis(DEFAULTS).perfis;

  it('mostra o produto de cada cenário', () => {
    expect(formulaCenario(gremistaLula, CENARIOS[0])).toBe('P(Grêmio cai) × P(Lula perde) = 0,676 × 0,520');
    expect(formulaCenario(gremistaLula, CENARIOS[3])).toBe('P(Grêmio fica) × P(Lula vence) = 0,324 × 0,480');
  });

  it('mostra a soma das derrotas esperadas', () => {
    expect(formulaDerrotas(gremistaLula)).toBe('P(Grêmio cai) + P(Lula perde) = 0,676 + 0,520');
  });
});
