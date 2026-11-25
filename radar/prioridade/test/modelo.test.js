import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODELO } from '../src/config.js';
import { avaliarUmaFaltante, calcularNotaIntegrada, classificar, notaNecessaria, porQueClasse, proximidadeA1 } from '../src/modelo.js';
import { atende, fmtMinimoExigido, fmtNotaIntegrada } from '../src/numeros.js';

/** Notas cuja média é exatamente `alvo`, com ICP 4 e Sinais 4 (passam nos mínimos de A). */
function comMedia(alvo, { icp = 4, sinais = 4 } = {}) {
  const resto = alvo * 4 - icp - sinais; // dividido igualmente entre Clima e Digital
  return { icp, sinais, clima: resto / 2, oportunidadeDigital: resto / 2 };
}

test('nota integrada é a média simples, sem arredondar', () => {
  assert.equal(calcularNotaIntegrada({ icp: 4.5, sinais: 4.5, clima: 4, oportunidadeDigital: 5 }), 4.5);
  assert.equal(calcularNotaIntegrada({ icp: 3.5, sinais: 4.5, clima: 4, oportunidadeDigital: 4.2 }), 4.05);
  assert.equal(fmtNotaIntegrada(4.46), '4,46');
});

test('fronteiras da nota integrada', () => {
  // ICP 4 e Sinais 4 garantem os mínimos; a nota decide a classe.
  const casos = [
    [2.4999, 'C'], [2.5, 'B2'], [3.2499, 'B2'], [3.25, 'B1'], [3.9999, 'B1'], [4.0, 'A2'], [4.4999, 'A2'], [4.5, 'A1']
  ];
  for (const [nota, esperado] of casos) {
    const notas = nota < 4 ? comMedia(nota, { icp: 3, sinais: 3 }) : comMedia(nota);
    // nota < 4: mantém ICP ≥ 3 (sem trava) e usa ICP 3 para não atender A.
    const r = classificar(notas);
    assert.equal(r.classe, esperado, `nota ${nota} → ${r.classe}, esperado ${esperado}`);
  }
});

test('mínimos de A', () => {
  // ICP 3,99 com média alta cai para B1
  assert.equal(classificar({ icp: 3.99, sinais: 5, clima: 5, oportunidadeDigital: 5 }).classe, 'B1');
  // Sinais 3,99 em perfil A1 cai para A2
  assert.equal(classificar({ icp: 5, sinais: 3.99, clima: 5, oportunidadeDigital: 5 }).classe, 'A2');
  // Clima ou Digital 2,99 com média alta cai para B1
  assert.equal(classificar({ icp: 5, sinais: 5, clima: 2.99, oportunidadeDigital: 5 }).classe, 'B1');
  assert.equal(classificar({ icp: 5, sinais: 5, clima: 5, oportunidadeDigital: 2.99 }).classe, 'B1');
});

test('trava: ICP < 3 com todas as demais em 5 resulta em C', () => {
  const r = classificar({ icp: 2.99, sinais: 5, clima: 5, oportunidadeDigital: 5 });
  assert.equal(r.classe, 'C');
  assert.match(r.motivos[0], /Trava/);
  assert.equal(classificar({ icp: 3, sinais: 5, clima: 5, oportunidadeDigital: 5 }).classe, 'B1');
});

test('comparação segura de decimais em casos que divergem em float', () => {
  // Somas exatas no limite, mas a média em float fica 1 ulp abaixo.
  const a1 = { icp: 4.6, sinais: 4.8, clima: 4.7, oportunidadeDigital: 3.9 };
  assert.ok(calcularNotaIntegrada(a1) < 4.5, 'pré-condição: float diverge');
  assert.equal(classificar(a1).classe, 'A1');

  const a2 = { icp: 4, sinais: 3.1, clima: 4.3, oportunidadeDigital: 4.6 };
  assert.ok(calcularNotaIntegrada(a2) < 4);
  assert.equal(classificar(a2).classe, 'A2');

  const b1 = { icp: 3, sinais: 1.1, clima: 4.3, oportunidadeDigital: 4.6 };
  assert.ok(calcularNotaIntegrada(b1) < 3.25);
  assert.equal(classificar(b1).classe, 'B1');

  const c = { icp: 3, sinais: 1.1, clima: 4.3, oportunidadeDigital: 1.6 };
  assert.ok(calcularNotaIntegrada(c) < 2.5);
  assert.equal(classificar(c).classe, 'B2', '2,5 exato não é C');

  // Normalização 0–100 (1 + 4v/100): 82, 95, 76, 97 somam exatamente 18.
  const n = (v) => 1 + (4 * v) / 100;
  const norm = { icp: n(82), sinais: n(95), clima: n(76), oportunidadeDigital: n(97) };
  assert.ok(calcularNotaIntegrada(norm) < 4.5);
  assert.equal(classificar(norm).classe, 'A1');

  // A tolerância vive num único lugar e não é arredondamento.
  assert.equal(MODELO.tolerancia, 1e-9);
  assert.equal(atende(4.4999, 4.5), false);
});

test('proximidade do sweet spot conta critérios de A1', () => {
  const p = proximidadeA1({ icp: 3.5, sinais: 4.5, clima: 4, oportunidadeDigital: 4.2 });
  assert.equal(p.atendidos, 3); // nota 4,05 < 4,5 e ICP 3,5 < 4
  assert.deepEqual(p.criterios.filter((c) => !c.atendido).map((c) => c.chave), ['nota', 'icp']);
});

test('"Por que esta classe?" compara com a classe acima', () => {
  const r = porQueClasse({ icp: 3.5, sinais: 4.5, clima: 4, oportunidadeDigital: 4.2 }, 'B1');
  assert.equal(r.titulo, 'Por que B1 e não A2?');
  assert.deepEqual(r.criterios.map((c) => c.atendido), [true, false, true, true, true]);
});

test('nota mínima para A1 com uma dimensão faltando', () => {
  // Soma conhecida 12,5 pede 5,5: candidatura cai.
  let r = avaliarUmaFaltante({ icp: 4, sinais: 4.5, oportunidadeDigital: 4 }, 'clima');
  assert.equal(r.notaNecessariaA1, 5.5);
  assert.equal(r.viavelA1, false);
  assert.match(r.bloqueios[0], /acima da escala/);
  // Soma 14 pede 4,0.
  r = avaliarUmaFaltante({ icp: 5, sinais: 5, oportunidadeDigital: 4 }, 'clima');
  assert.equal(r.notaNecessariaA1, 4);
  assert.equal(r.viavelA1, true);
  // ICP faltando pede no mínimo 4, mesmo se a soma pedir menos.
  r = avaliarUmaFaltante({ sinais: 5, clima: 5, oportunidadeDigital: 5 }, 'icp');
  assert.equal(r.notaNecessariaA1, 4);
  // Clima faltando pede no mínimo 3.
  r = avaliarUmaFaltante({ icp: 5, sinais: 5, oportunidadeDigital: 5 }, 'clima');
  assert.equal(r.notaNecessariaA1, 3);
  // Exemplo do briefing: "Clima precisa ser ≥ 3,2".
  r = avaliarUmaFaltante({ icp: 5, sinais: 4.8, oportunidadeDigital: 5 }, 'clima');
  assert.equal(fmtMinimoExigido(r.notaNecessariaA1), '3,2');
  // Fórmula geral = 18 − soma, com pesos iguais.
  assert.equal(notaNecessaria({ icp: 4.5, sinais: 4.5, oportunidadeDigital: 4.5 }, 'clima', 'A1'), 18 - 13.5);
});

test('valor conhecido que impede A1 gera bloqueio legível', () => {
  const r = avaliarUmaFaltante({ icp: 3.5, sinais: 5, oportunidadeDigital: 5 }, 'clima');
  assert.equal(r.viavelA1, false);
  assert.deepEqual(r.bloqueios, ['ICP 3,5 < 4']);
  assert.equal(r.podeChegarA2, false);
  const r2 = avaliarUmaFaltante({ icp: 4, sinais: 3.5, oportunidadeDigital: 4 }, 'clima');
  assert.equal(r2.viavelA1, false);
  assert.equal(r2.podeChegarA2, true);
});

test('arredondamento da nota mínima exibida é sempre para cima', () => {
  assert.equal(fmtMinimoExigido(3.241), '3,25');
  assert.equal(fmtMinimoExigido(3.2), '3,2');
  assert.equal(fmtMinimoExigido(4), '4');
});
