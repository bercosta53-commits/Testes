import { describe, expect, it } from 'vitest';
import { DEFAULTS, PREMISSAS_PRE_JOGO, calcPerfis } from '../src/calc.js';
import {
  CENARIOS,
  casasPct,
  dataBR,
  formulaCenario,
  formulaDerrotas,
  formulaRebaixamento,
  num,
  paraCampo,
  pct,
  pp,
} from '../src/format.js';

describe('formatação pt-BR', () => {
  it('formata percentuais e números com vírgula', () => {
    expect(pct(0.41028)).toBe('41%');
    expect(pct(0.41028, 1)).toBe('41,0%');
    expect(num(1.2812)).toBe('1,28');
    expect(dataBR('2026-10-11')).toBe('11/10/2026');
  });

  it('mostra uma casa no slider só quando o valor é quebrado', () => {
    expect(casasPct(0.65)).toBe(0);
    expect(casasPct(0.575)).toBe(1);
    expect(casasPct(0.4)).toBe(0);
  });

  it('formata diferenças em pontos percentuais com sinal', () => {
    expect(pp(0.0096)).toBe('+1,0 p.p.');
    expect(pp(-0.01)).toBe('−1,0 p.p.');
    expect(pp(0.00001)).toBe('0,0 p.p.');
  });

  it('converte probabilidade para o valor do campo em %', () => {
    expect(paraCampo(0.401)).toBe(40.1);
    expect(paraCampo(0.26)).toBe(26);
    expect(paraCampo(0.676)).toBe(67.6);
  });
});

describe('textos de fórmula', () => {
  const r = calcPerfis(PREMISSAS_PRE_JOGO);
  const gremistaLula = r.perfis[0];

  it('mostra a soma ponderada do risco de rebaixamento', () => {
    expect(formulaRebaixamento('gremio', r, PREMISSAS_PRE_JOGO)).toBe('0,401 × 0,472 + 0,280 × 0,676 + 0,319 × 0,792');
  });

  it('mostra o risco condicional e o ajuste quando o resultado está fixado', () => {
    expect(formulaRebaixamento('inter', calcPerfis(DEFAULTS), DEFAULTS)).toBe(
      'Risco no cenário “Empate”: 0,461 − 0,030 (ajuste Corinthians)',
    );
  });

  it('mostra o produto de cada cenário e a soma das derrotas', () => {
    expect(formulaCenario(gremistaLula, CENARIOS[0])).toBe('P(Grêmio cai) × P(Lula perde) = 0,631 × 0,650');
    expect(formulaCenario(gremistaLula, CENARIOS[3])).toBe('P(Grêmio fica) × P(Lula vence) = 0,369 × 0,350');
    expect(formulaDerrotas(gremistaLula)).toBe('P(Grêmio cai) + P(Lula perde) = 0,631 + 0,650');
  });
});
