import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIMENSOES } from '../src/config.js';
import { adaptarConta, adaptarSnapshot, fontesSeguras, origemDasNotas, textoEstadoDimensao } from '../src/adaptador.js';
import { CAMPOS_CONTA_PADRAO, MAPEAMENTO_PRODUCAO, linear0a100 } from '../src/mapeamento.js';

/** Mapeamento de teste: valores já na escala 1–5 em `t.<dim>.v`. */
function mapaTeste(extra = {}) {
  const dim = (k) => ({
    mapeamento: 'documentado', campoOrigem: `t.${k}.v`, escalaOriginal: '1-5', transformacao: 'v', min: 1, max: 5, converter: (v) => v,
    campoResumo: `t.${k}.resumo`, campoData: `t.${k}.data`, campoFontes: `t.${k}.fontes`, campoSemAchados: `t.${k}.semAchados`, campoDesatualizada: `t.${k}.velha`,
    desatualizadaEntraNoCalculo: null, ...(extra[k] || {})
  });
  return { rotulo: 'teste', conta: { ...CAMPOS_CONTA_PADRAO, evidenciaPrincipal: ['evid'] }, dimensoes: Object.fromEntries(DIMENSOES.map((k) => [k, dim(k)])) };
}

function conta(notas, extra = {}) {
  const t = {};
  for (const k of DIMENSOES) t[k] = notas[k] === undefined ? {} : { v: notas[k], data: '2026-11-20' };
  return { id: 'id-opaco-1', nome: 'Conta X', setor: 'TI', t, ...extra };
}

const COMPLETA = { icp: 4.5, sinais: 4.5, clima: 4, oportunidadeDigital: 5 };

test('avaliação completa classifica e preserva o ID opaco', () => {
  const v = adaptarConta(conta(COMPLETA), mapaTeste());
  assert.equal(v.contaId, 'id-opaco-1');
  assert.equal(v.cobertura, 4);
  assert.equal(v.notaIntegrada, 4.5);
  assert.equal(v.classeIntegrada, 'A1');
  assert.equal(v.situacaoSweetSpot, 'a1');
  assert.equal(v.criteriosA1Atendidos, 5);
  assert.equal(v.versaoModelo, 'integrado-experimental-1');
});

test('ausência de cada dimensão: nota e classe null, 3 de 4, candidata quando A1 é viável', () => {
  for (const k of DIMENSOES) {
    const notas = { icp: 5, sinais: 5, clima: 5, oportunidadeDigital: 5 };
    delete notas[k];
    const v = adaptarConta(conta(notas), mapaTeste());
    assert.equal(v.notaIntegrada, null, k);
    assert.equal(v.classeIntegrada, null, k);
    assert.equal(v.cobertura, 3, k);
    assert.deepEqual(v.dimensoesFaltantes, [k]);
    assert.equal(v.situacaoSweetSpot, 'candidata', k);
    assert.equal(v.investigacao?.dimensao, k);
    assert.equal(v.dimensoes[k].motivoSemNota, 'nao_coletado');
  }
});

test('regra de faltas: 0, 1 viável, 1 com bloqueio, 2 em qualquer combinação', () => {
  assert.equal(adaptarConta(conta(COMPLETA), mapaTeste()).situacaoSweetSpot, 'a1');
  assert.equal(adaptarConta(conta({ icp: 5, sinais: 4, oportunidadeDigital: 4 }), mapaTeste()).situacaoSweetSpot, 'candidata');
  const bloq = adaptarConta(conta({ icp: 3.5, sinais: 5, oportunidadeDigital: 5 }), mapaTeste());
  assert.equal(bloq.situacaoSweetSpot, 'fora_por_criterio');
  assert.deepEqual(bloq.bloqueioA1, ['ICP 3,5 < 4']);
  assert.equal(bloq.investigacao, null);
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const notas = { icp: 5, sinais: 5, clima: 5, oportunidadeDigital: 5 };
    delete notas[DIMENSOES[i]]; delete notas[DIMENSOES[j]];
    const v = adaptarConta(conta(notas), mapaTeste());
    assert.equal(v.situacaoSweetSpot, 'fora_por_falta_de_dados');
    assert.equal(v.notaIntegrada, null);
    assert.equal(v.cobertura, 2);
  }
  const snap = adaptarSnapshot({ contas: [conta({ icp: 5 })] }, mapaTeste());
  assert.equal(snap.contas.length, 1, 'conta com 2+ faltando continua listada');
});

test('o valor do teste de viabilidade nunca aparece no estado', () => {
  const v = adaptarConta(conta({ icp: 5, sinais: 5, oportunidadeDigital: 4 }), mapaTeste());
  assert.equal(v.investigacao?.notaMinimaParaA1, 4);
  assert.equal(v.dimensoes.clima.nota, null);
  assert.equal(v.notaIntegrada, null);
  // Nenhum campo do estado guarda 5 para o Clima.
  assert.ok(!JSON.stringify(v.dimensoes.clima).includes(':5'));
  assert.equal(v.investigacao?.podeChegarA2, true);
});

test('candidata que completa a dimensão é classificada normalmente, sem herdar estado', () => {
  const antes = adaptarConta(conta({ icp: 5, sinais: 5, oportunidadeDigital: 4 }), mapaTeste());
  assert.equal(antes.situacaoSweetSpot, 'candidata');
  // Com Clima 4 (a nota mínima informada), vira A1.
  const depois = adaptarConta(conta({ icp: 5, sinais: 5, clima: 4, oportunidadeDigital: 4 }), mapaTeste());
  assert.equal(depois.situacaoSweetSpot, 'a1');
  assert.equal(depois.investigacao, null);
  assert.equal(depois.classeIntegrada, 'A1');
  assert.equal(depois.notaIntegrada, 4.5);
  assert.equal(depois.cobertura, 4);
  // Com Clima 3, completa mas abaixo da nota: A2, sem resquício de candidata.
  const outra = adaptarConta(conta({ icp: 5, sinais: 5, clima: 3, oportunidadeDigital: 4 }), mapaTeste());
  assert.equal(outra.classeIntegrada, 'A2');
  assert.equal(outra.situacaoSweetSpot, 'fora_por_classe');
  assert.equal(outra.investigacao, null);
});

test('dimensão desatualizada sem política: exibida, fora do cálculo e fora da cobertura', () => {
  const c = conta(COMPLETA);
  c.t.clima.velha = true;
  const v = adaptarConta(c, mapaTeste());
  assert.equal(v.dimensoes.clima.nota, 4);
  assert.equal(v.dimensoes.clima.status, 'desatualizada');
  assert.equal(v.dimensoes.clima.entraNoCalculo, false);
  assert.match(v.dimensoes.clima.motivoExclusao, /sem política/);
  assert.equal(v.cobertura, 3);
  assert.equal(v.notaIntegrada, null);
  assert.equal(v.situacaoSweetSpot, 'candidata');
  // Com política explícita que aceita, entra no cálculo.
  const v2 = adaptarConta(c, mapaTeste({ clima: { desatualizadaEntraNoCalculo: true } }));
  assert.equal(v2.cobertura, 4);
  assert.match(textoEstadoDimensao(v.dimensoes.clima), /Desatualizada desde 20\/11\/2026 · fora do cálculo/);
});

test('dado fora do intervalo gera pendência e dimensão indisponível', () => {
  const mapa = mapaTeste({ icp: { min: 0, max: 100, escalaOriginal: '0-100', converter: linear0a100, transformacao: '1 + 4 * v / 100' } });
  const c = conta(COMPLETA);
  c.t.icp.v = 112;
  const v = adaptarConta(c, mapa);
  assert.equal(v.dimensoes.icp.nota, null);
  assert.equal(v.dimensoes.icp.motivoSemNota, 'fora_do_intervalo');
  assert.deepEqual(v.dimensoes.icp.pendenciasQualidade, ['valor 112 fora do intervalo 0-100']);
  assert.equal(textoEstadoDimensao(v.dimensoes.icp), 'Sem avaliação — dado inconsistente');
  // Não numérico também.
  c.t.icp.v = 'alto';
  assert.equal(adaptarConta(c, mapa).dimensoes.icp.motivoSemNota, 'fora_do_intervalo');
  // NaN/Infinity nunca viram nota.
  c.t.icp.v = Number.NaN;
  assert.equal(adaptarConta(c, mapa).dimensoes.icp.nota, null);
});

test('sem achados não vira nota 1 nem "timing desfavorável"', () => {
  const c = conta({ icp: 5, clima: 5, oportunidadeDigital: 5 });
  c.t.sinais = { semAchados: true, data: '2026-11-18' };
  const v = adaptarConta(c, mapaTeste());
  assert.equal(v.dimensoes.sinais.nota, null);
  assert.equal(v.dimensoes.sinais.semAchados, true);
  assert.equal(textoEstadoDimensao(v.dimensoes.sinais), 'Nenhum sinal relevante encontrado (busca em 18/11/2026)');
  assert.match(v.investigacao?.motivo || '', /sem achados/);
  // Se o método oficial produzir nota mínima, o rótulo é "sem sinais encontrados".
  c.t.sinais.v = 1;
  const v2 = adaptarConta(c, mapaTeste());
  assert.equal(v2.dimensoes.sinais.nota, 1);
  assert.equal(textoEstadoDimensao(v2.dimensoes.sinais), 'Sem sinais encontrados');
});

test('modo apresentação: dimensão oculta conta como faltante e não vaza o valor', () => {
  const mapa = mapaTeste({ clima: { ocultaEmApresentacao: true } });
  const v = adaptarConta(conta(COMPLETA), mapa, { modoApresentacao: true });
  assert.equal(v.dimensoes.clima.nota, null);
  assert.equal(v.dimensoes.clima.motivoSemNota, 'oculto_modo_apresentacao');
  assert.equal(v.dimensoes.clima.resumo, null);
  assert.equal(v.classeIntegrada, null);
  assert.equal(textoEstadoDimensao(v.dimensoes.clima), 'Indisponível nesta visão');
  assert.equal(adaptarConta(conta(COMPLETA), mapa).classeIntegrada, 'A1');
});

test('produção: sem mapeamento documentado nenhuma dimensão entra no cálculo', () => {
  const r = adaptarSnapshot({ atualizadoEm: '2026-11-25T07:40:00-03:00', contas: [{ id: 'a', nome: 'A', score: 72, vscsStatus: 'ok', v2: { vscs: 72 } }] }, MAPEAMENTO_PRODUCAO);
  const v = r.contas[0];
  assert.equal(v.cobertura, 0);
  assert.equal(v.situacaoSweetSpot, 'fora_por_falta_de_dados');
  assert.equal(v.dimensoes.icp.motivoSemNota, 'metodo_nao_mapeado');
  assert.equal(v.dimensoes.clima.origem.mapeamento, 'indisponivel');
  assert.equal(v.conta.oficial.score, 72, 'VSCS preservado como veio');
  assert.deepEqual(origemDasNotas(MAPEAMENTO_PRODUCAO).map((l) => l.estado), ['Pendente de mapeamento', 'Pendente de mapeamento', 'Indisponível', 'Pendente de mapeamento']);
});

test('registros sem ID ou repetidos não somem em silêncio', () => {
  const r = adaptarSnapshot({ contas: [{ nome: 'sem id' }, { id: 'x', nome: 'X' }, { id: 'x', nome: 'X2' }] }, mapaTeste());
  assert.equal(r.contas.length, 1);
  assert.deepEqual(r.descartadas.map((d) => d.motivo), ['registro sem ID', 'ID repetido x']);
});

test('fontes: apenas http(s)', () => {
  const f = fontesSeguras(['https://a.com/x', 'javascript:alert(1)', { url: 'http://b.com', titulo: 'B' }, { url: 'ftp://c' }, 12]);
  assert.deepEqual(f.map((x) => x.url), ['https://a.com/x', 'http://b.com/']);
});
