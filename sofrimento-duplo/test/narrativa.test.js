import { describe, expect, it } from 'vitest';
import { DEFAULTS, PREMISSAS_PRE_JOGO, calcPerfis } from '../src/calc.js';
import { resumoExecutivo, tituloEmpilhadas, tituloMatrizes, tituloRanking } from '../src/narrativa.js';

const base = (params) => calcPerfis({ ...params, resultadoJogo: 'probabilistico', ajusteCorinthians: 0 });

describe('resumo executivo com os padrões pós-rodada', () => {
  const r = calcPerfis(DEFAULTS);
  const [lider, peso, grenal, corinthians] = resumoExecutivo(r, base(DEFAULTS), DEFAULTS);

  it('abre com quem se dá pior', () => {
    expect(lider.rotulo).toBe('Quem se dá pior?');
    expect(lider.valor).toBe('42%');
    expect(lider.texto).toBe('Gremista pró-Lula: chance de ver o Grêmio rebaixado e Lula derrotado.');
  });

  it('aponta que o voto pesa mais quando os dois pró-Lula lideram', () => {
    expect(peso.texto).toBe('O voto pesa mais que o clube: os dois perfis pró-Lula ocupam o topo do ranking.');
    expect(peso.valor).toBe('65%');
  });

  it('descreve o empate no Gre-Nal e compara com o pré-jogo', () => {
    expect(grenal.valor).toBe('64,6%');
    expect(grenal.texto).toContain('o Inter abriu o placar no 1º tempo e o Grêmio empatou');
    expect(grenal.texto).toContain('43,1% para o Inter');
    expect(grenal.texto).toContain('Antes do jogo, eram 63,1% e 44,6%.');
  });

  it('mostra o desconto do Corinthians', () => {
    expect(corinthians.valor).toBe('−3 p.p.');
    expect(corinthians.texto).toContain('descontamos 3 p.p.');
  });
});

describe('resumo executivo em outros cenários', () => {
  it('sem ajuste, avisa que o desconto está desligado', () => {
    const r = calcPerfis(PREMISSAS_PRE_JOGO);
    const achados = resumoExecutivo(r, base(PREMISSAS_PRE_JOGO), PREMISSAS_PRE_JOGO);
    expect(achados[3].valor).toBe('0 p.p.');
    expect(achados[2].texto).toContain('Ponderando os três resultados');
  });

  it('com P(Flávio) = 50%, diz que o clube pesa mais e mostra o empate na liderança', () => {
    const params = { ...DEFAULTS, pFlavio: 0.5 };
    const r = calcPerfis(params);
    const [lider, peso] = resumoExecutivo(r, base(params), params);
    expect(lider.texto).toBe('Gremista pró-Lula e Gremista pró-Flávio empatam: cada um tem essa chance de sofrimento duplo.');
    expect(peso.texto).toBe('O clube pesa mais que o voto: os dois perfis gremistas ocupam o topo do ranking.');
  });

  it('funciona sem a base pré-jogo', () => {
    const r = calcPerfis(DEFAULTS);
    expect(resumoExecutivo(r, null, DEFAULTS)[2].texto).not.toContain('Antes do jogo');
  });
});

describe('títulos das figuras', () => {
  const r = calcPerfis(DEFAULTS);

  it('Figura 1 nomeia o líder e seus números', () => {
    expect(tituloRanking(r)).toBe(
      'Gremista pró-Lula lidera o ranking, com 1,30 derrotas esperadas em 2 e 42% de chance de sofrimento duplo',
    );
  });

  it('Figura 2 dá a faixa do sofrimento duplo', () => {
    expect(tituloMatrizes(r)).toBe(
      'A chance de sofrimento duplo vai de 15% (Colorado pró-Flávio) a 42% (Gremista pró-Lula)',
    );
  });

  it('Figura 3 aponta o perfil mais tranquilo', () => {
    expect(tituloEmpilhadas(r)).toBe(
      'Nenhum perfil chega a 50% de chance de escapar das duas derrotas; o mais perto é Colorado pró-Flávio, com 37%',
    );
  });

  it('Figura 3 muda quando algum perfil passa de 50%', () => {
    const params = { ...DEFAULTS, resultadoJogo: 'interVence', pFlavio: 0.7 };
    expect(tituloEmpilhadas(calcPerfis(params))).toBe('Colorado pró-Flávio tem mais de 50% de chance de escapar das duas derrotas');
  });
});
