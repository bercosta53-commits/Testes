import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIMENSOES } from '../src/config.js';
import { adaptarSnapshot } from '../src/adaptador.js';
import {
  SEGMENTOS, SEM_SETOR, agrupar, aplicarFiltros, atalhos, cruzar, descreverFiltros, distribuicao, filtrosVazios,
  matrizSetorPrioridade, normalizar, ordenar, resumoSetor, sugestoes
} from '../src/consulta.js';
import { mapeamentoFixture, snapshotFixture } from '../dev/fixtures.teste.js';

const { contas } = adaptarSnapshot(snapshotFixture(), mapeamentoFixture('completo'));
const f = (extra) => ({ ...filtrosVazios(), ...extra });

test('normalização da busca: caixa, acentos, pontuação e trecho', () => {
  assert.equal(normalizar('Ótica São João & Cia.'), 'otica sao joao cia');
  const r = aplicarFiltros(contas, f({ q: 'OTICA sao' }));
  assert.deepEqual(r.visiveis.map((c) => c.contaId), ['fx-b10']);
  // nome alternativo (razão social) também é buscado
  assert.equal(aplicarFiltros(contas, f({ q: 'comercial otica' })).visiveis.length, 1);
  // setor
  assert.ok(aplicarFiltros(contas, f({ q: 'healthtech' })).visiveis.every((c) => c.conta.setor === 'Healthtech'));
  const s = sugestoes(contas, 'fin');
  assert.deepEqual(s.setores.map((x) => x.setor), ['Fintech']);
});

test('busca percorre contas sem métrica e avisa quando o termo está fora dos filtros', () => {
  const r = aplicarFiltros(contas, f({ q: 'mirante credito' }));
  assert.equal(r.visiveis[0].situacaoSweetSpot, 'fora_por_falta_de_dados');
  const fora = aplicarFiltros(contas, f({ q: 'mirante credito', classe: ['A1'] }));
  assert.equal(fora.visiveis.length, 0);
  assert.equal(fora.buscaForaDosFiltros, 1);
});

test('filtros: OU dentro do grupo, E entre grupos', () => {
  const a1 = aplicarFiltros(contas, f({ classe: ['A1'] })).visiveis.length;
  const a2 = aplicarFiltros(contas, f({ classe: ['A2'] })).visiveis.length;
  assert.equal(aplicarFiltros(contas, f({ classe: ['A1', 'A2'] })).visiveis.length, a1 + a2);
  const r = aplicarFiltros(contas, f({ classe: ['A1', 'A2'], setor: ['Fintech'] })).visiveis;
  assert.ok(r.length > 0);
  assert.ok(r.every((c) => ['A1', 'A2'].includes(c.classeIntegrada) && c.conta.setor === 'Fintech'));
  assert.equal(descreverFiltros(f({ classe: ['A1', 'A2'], setor: ['Fintech'] })).frase, 'A1 ou A2, E setor Fintech');
});

test('conta sem nota na dimensão não passa no filtro de nota e é contada', () => {
  const r = aplicarFiltros(contas, f({ faixa: { clima: { min: 1, max: null } } }));
  const semClima = contas.filter((c) => c.dimensoesFaltantes.includes('clima')).length;
  assert.equal(r.visiveis.length, contas.length - semClima);
  assert.equal(r.foraPorSemNota, semClima);
  assert.equal(r.semNotaPorGrupo['faixa:clima'], semClima);
  // máximo é estrito: Sinais < 3
  const baixo = aplicarFiltros(contas, f({ faixa: { sinais: { min: null, max: 3 } } })).visiveis;
  assert.ok(baixo.every((c) => c.dimensoes.sinais.nota < 3));
});

test('contas sem setor aparecem em "Sem setor", nunca descartadas', () => {
  const r = aplicarFiltros(contas, f({ setor: [SEM_SETOR] })).visiveis;
  assert.deepEqual(r.map((c) => c.contaId), ['fx-b09']);
  const grupos = agrupar(contas, 'setor');
  assert.equal(grupos.at(-1).rotulo, 'Sem setor');
  assert.equal(grupos.reduce((t, g) => t + g.contas.length, 0), contas.length);
});

test('faixa e matriz: soma das células igual ao total do recorte', () => {
  for (const recorte of [contas, aplicarFiltros(contas, f({ setor: ['Fintech', 'Healthtech'] })).visiveis]) {
    const d = distribuicao(recorte);
    assert.equal(SEGMENTOS.reduce((t, s) => t + d.porSegmento[s], 0), recorte.length);
    const m = matrizSetorPrioridade(recorte);
    let soma = 0;
    for (const l of m.linhas) {
      const linha = SEGMENTOS.reduce((t, s) => t + l.celulas[s], 0);
      assert.equal(linha, l.total);
      soma += linha;
    }
    assert.equal(soma, recorte.length);
    assert.equal(m.total, recorte.length);
  }
});

test('cruzamento: grade + bloco sem avaliação somam o total', () => {
  for (const [x, y] of [['icp', 'sinais'], ['clima', 'oportunidadeDigital']]) {
    const r = cruzar(contas, x, y);
    const naGrade = r.grade.flat().reduce((t, n) => t + n, 0);
    assert.equal(naGrade + r.semAvaliacao, contas.length);
    assert.equal(Object.values(r.quadrantes).reduce((t, n) => t + n, 0), naGrade);
  }
});

test('ordenação padrão: completas por nota, depois candidatas, fora por critério e sem métrica', () => {
  const o = ordenar(contas, []);
  const tiers = o.map((c) => ({ a1: 0, fora_por_classe: 0, candidata: 1, fora_por_criterio: 2, fora_por_falta_de_dados: 3 })[c.situacaoSweetSpot]);
  assert.deepEqual(tiers, [...tiers].sort((a, b) => a - b));
  const completas = o.filter((c) => c.cobertura === 4);
  for (let i = 1; i < completas.length; i++) assert.ok(completas[i - 1].notaIntegrada >= completas[i].notaIntegrada);
  const cand = o.filter((c) => c.situacaoSweetSpot === 'candidata');
  for (let i = 1; i < cand.length; i++) assert.ok(cand[i - 1].investigacao.notaMinimaParaA1 <= cand[i].investigacao.notaMinimaParaA1);
  // ordenação por dimensão: nulos por último
  const porClima = ordenar(contas, [{ col: 'clima', dir: -1 }]);
  const idx = porClima.findIndex((c) => c.dimensoesFaltantes.includes('clima'));
  assert.ok(porClima.slice(idx).every((c) => c.dimensoesFaltantes.includes('clima')));
  // ordenação múltipla
  const m = ordenar(contas, [{ col: 'icp', dir: -1 }, { col: 'sinais', dir: -1 }]);
  for (let i = 1; i < m.length; i++) {
    const a = m[i - 1].dimensoes, b = m[i].dimensoes;
    if (a.icp.nota != null && a.icp.nota === b.icp.nota && a.sinais.entraNoCalculo && b.sinais.entraNoCalculo && a.sinais.nota != null && b.sinais.nota != null) assert.ok(a.sinais.nota >= b.sinais.nota);
  }
});

test('atalhos aplicam filtros comuns', () => {
  const [sweet, investigar, perto, encaixe, timing] = atalhos();
  assert.ok(aplicarFiltros(contas, f(sweet.filtros)).visiveis.every((c) => c.classeIntegrada === 'A1'));
  assert.ok(aplicarFiltros(contas, f(investigar.filtros)).visiveis.every((c) => c.situacaoSweetSpot === 'candidata'));
  const p = aplicarFiltros(contas, f(perto.filtros)).visiveis;
  assert.ok(p.length > 0 && p.every((c) => c.classeIntegrada !== 'A1' && c.criteriosA1Atendidos >= 4));
  assert.ok(aplicarFiltros(contas, f(encaixe.filtros)).visiveis.every((c) => c.dimensoes.icp.nota >= 4 && c.dimensoes.sinais.nota < 3));
  assert.ok(aplicarFiltros(contas, f(timing.filtros)).visiveis.every((c) => c.dimensoes.sinais.nota >= 4 && c.dimensoes.icp.nota < 4));
});

test('resumo do setor: média só das avaliadas, com o n, sem nota integrada do setor', () => {
  const fin = contas.filter((c) => c.conta.setor === 'Fintech');
  const r = resumoSetor(fin);
  for (const d of r.dimensoes) {
    const vals = fin.filter((c) => !c.dimensoesFaltantes.includes(d.chave)).map((c) => c.dimensoes[d.chave].nota);
    assert.equal(d.n, vals.length);
    assert.equal(d.de, fin.length);
    if (vals.length) assert.ok(Math.abs(d.media - vals.reduce((t, v) => t + v, 0) / vals.length) < 1e-12);
  }
  assert.equal('notaIntegrada' in r, false);
  assert.ok(DIMENSOES.length === r.dimensoes.length);
});
