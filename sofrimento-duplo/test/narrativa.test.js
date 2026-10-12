import { describe, expect, it } from 'vitest';
import { DEFAULTS, calcPerfis } from '../src/calc.js';
import { fraseLider, nomeLider, tituloCruzamentos, tituloRanking } from '../src/narrativa.js';

const com = (mudancas) => calcPerfis({ ...structuredClone(DEFAULTS), ...mudancas });

describe('textos com as premissas padrão', () => {
  const r = calcPerfis(DEFAULTS);

  it('nomeia quem se dá pior e o que a chance significa', () => {
    expect(nomeLider(r)).toBe('Gremista pró-Lula');
    expect(fraseLider(r)).toBe('de chance de ver o Grêmio rebaixado e Lula derrotado');
  });

  it('diz que ser gremista pesa mais que o voto', () => {
    expect(tituloRanking(r)).toBe('Gremista pró-Lula lidera, e ser gremista pesa mais que o voto');
  });

  it('dá a faixa do sofrimento duplo', () => {
    expect(tituloCruzamentos(r)).toBe('O sofrimento duplo vai de 22% a 35%');
  });
});

describe('textos em outros cenários', () => {
  it('eleição empatada: anuncia o empate no topo', () => {
    const r = com({ pFlavio: 0.5 });
    expect(nomeLider(r)).toBe('Gremista pró-Lula e Gremista pró-Flávio');
    expect(fraseLider(r)).toBe('de chance de sofrimento duplo para cada um');
    expect(tituloRanking(r)).toBe('Gremista pró-Lula e Gremista pró-Flávio empatam no topo');
  });

  it('clubes com risco parecido: o voto pesa mais', () => {
    const r = com({ riscoRebaixamento: { gremio: 0.5, inter: 0.48 } });
    expect(tituloRanking(r)).toBe('Gremista pró-Lula lidera, e o voto pesa mais que o clube');
  });
});
