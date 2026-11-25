import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODELO } from '../src/config.js';
import { adaptarConta } from '../src/adaptador.js';
import { estadoInicial, escreverUrl, lerUrl } from '../src/estado-url.js';
import { passosMetodologia, tabelaClasses } from '../src/metodologia.js';
import { geometria, losango, textoEquivalente } from '../src/ui/losango.js';
import { mapeamentoFixture, snapshotFixture } from '../dev/fixtures.teste.js';

const mapa = mapeamentoFixture('completo');
const porId = (id) => adaptarConta(snapshotFixture().contas.find((c) => c.id === id), mapa);

test('metodologia é gerada da configuração', () => {
  const p = passosMetodologia();
  assert.equal(p.length, 5);
  assert.match(p[2].titulo, /ICP abaixo de 3 vira C/);
  assert.match(p[2].titulo, /Sinais ≥ 3 \(A2\) ou ≥ 4 \(A1\)/);
  assert.match(p[1].titulo, /média simples/);
  // Os exemplos da regra completa batem com o classificador real.
  for (const l of tabelaClasses()) assert.equal(l.classeCalculada, l.classe, l.exemplo);
});

test('mudar o limite na configuração muda o texto', async () => {
  const cfg = await import('../src/config.js');
  const original = cfg.MODELO.classes.C;
  assert.ok(Object.isFrozen(original), 'configuração congelada: só muda editando config.js');
  assert.match(passosMetodologia()[2].detalhe, new RegExp('A1 ' + String(MODELO.classes.A1.nota).replace('.', ',')));
});

test('estado da visão sobrevive à URL (ida e volta)', () => {
  const e = estadoInicial();
  e.filtros.q = 'ótica';
  e.filtros.classe = ['A1', 'A2'];
  e.filtros.setor = ['Serviços de TI', '__sem_setor__'];
  e.filtros.faixa = { icp: { min: 4, max: null }, sinais: { min: null, max: 3 } };
  e.filtros.notaMin = 3.25;
  e.filtros.perto = true;
  e.ordem = [{ col: 'icp', dir: -1 }, { col: 'nome', dir: 1 }];
  e.agrupar = 'setor';
  e.visao = 'cruzar'; e.x = 'clima'; e.y = 'oportunidadeDigital';
  e.conta = 'fx-b01';
  e.comparar = ['fx-b01', 'fx-b02'];
  e.comparacaoAberta = true;
  e.colunas = ['proximidade'];
  const volta = lerUrl(escreverUrl(e));
  assert.deepEqual(volta, e);
  assert.equal(escreverUrl(estadoInicial()), '');
  // limite de 3 na comparação vindo da URL
  assert.equal(lerUrl('?cmp=a&cmp=b&cmp=c&cmp=d').comparar.length, 3);
});

test('losango: segmentos só entre eixos adjacentes conhecidos', () => {
  const g = geometria(porId('fx-b04').dimensoes); // falta Clima
  assert.equal(g.completo, false);
  assert.deepEqual(new Set(g.segmentos.map((s) => s.join('-'))), new Set(['icp-sinais', 'oportunidadeDigital-icp']));
  const svg = losango(porId('fx-b04').dimensoes);
  assert.ok(!svg.includes('lz-poli'), 'não fecha polígono com eixo ausente');
  assert.match(svg, /Sem avaliação/);
  // opostos conhecidos (ICP e Clima) sem os adjacentes ficam isolados
  const d = porId('fx-b11').dimensoes; // faltam Sinais e Clima → ICP e Digital são adjacentes
  assert.deepEqual(geometria(d).segmentos.map((s) => s.join('-')), ['oportunidadeDigital-icp']);
  const opostos = { ...porId('fx-b02').dimensoes };
  opostos.sinais = { ...opostos.sinais, nota: null, entraNoCalculo: false };
  opostos.oportunidadeDigital = { ...opostos.oportunidadeDigital, nota: null, entraNoCalculo: false };
  assert.deepEqual(geometria(opostos).segmentos, []);
  assert.equal(textoEquivalente(porId('fx-b04').dimensoes), 'ICP 5,0; Sinais 4,8; Clima sem avaliação; Oportunidade digital 5,0');
});

test('losango completo fecha o polígono; desatualizada fora do cálculo vira ponto vazado', () => {
  assert.match(losango(porId('fx-b01').dimensoes), /lz-poli/);
  const g = geometria(porId('fx-b07').dimensoes); // Clima desatualizado sem política
  assert.deepEqual(g.foraDoCalculo, ['clima']);
  assert.equal(g.completo, false);
});
