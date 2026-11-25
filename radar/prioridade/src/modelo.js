// @ts-check
/**
 * Camada experimental: nota integrada, classes A1–C, proximidade do sweet
 * spot e regra de dados faltando. Funções puras, sem efeitos colaterais.
 * Não substitui o VSCS nem o Tier ICP (seção 9).
 */
import { DIMENSOES, MODELO, NOMES_DIMENSAO, somaPesos } from './config.js';
import { abaixoDe, atende, fmtFalta, fmtLimite, fmtMinimoExigido, fmtNota, fmtNotaIntegrada } from './numeros.js';

/** @typedef {import('./tipos').ChaveDimensao} ChaveDimensao */
/** @typedef {import('./tipos').Classe} Classe */
/** @typedef {import('./tipos').CriterioClasse} CriterioClasse */
/** @typedef {Record<ChaveDimensao, number>} Notas */

/**
 * Média ponderada (pesos iguais por padrão). Sem arredondar.
 * @param {Notas} notas
 */
export function calcularNotaIntegrada(notas) {
  let t = 0;
  for (const k of DIMENSOES) t += notas[k] * MODELO.pesos[k];
  return t / somaPesos();
}

/**
 * Critérios de uma classe A, na ordem: nota, ICP, Sinais, Clima, Digital.
 * @param {Notas} notas
 * @param {'A1' | 'A2'} classe
 * @param {number} [nota]
 * @returns {CriterioClasse[]}
 */
export function criteriosDaClasse(notas, classe, nota = calcularNotaIntegrada(notas)) {
  const regra = MODELO.classes[classe];
  /** @type {CriterioClasse[]} */
  const lista = [{ chave: 'nota', rotulo: 'Nota integrada ≥ ' + fmtLimite(regra.nota), atendido: atende(nota, regra.nota), valor: nota, minimo: regra.nota }];
  for (const k of DIMENSOES) {
    const min = regra.minimos[k];
    lista.push({ chave: k, rotulo: NOMES_DIMENSAO[k].nome + ' ≥ ' + fmtLimite(min), atendido: atende(notas[k], min), valor: notas[k], minimo: min });
  }
  return lista;
}

/**
 * Classifica uma avaliação COMPLETA, na ordem da seção 8.2:
 * C (trava) → A1 → A2 → B1 → B2.
 * @param {Notas} notas
 * @returns {{ classe: Classe, nota: number, motivos: string[] }}
 */
export function classificar(notas) {
  const nota = calcularNotaIntegrada(notas);
  const c = MODELO.classes.C;
  if (abaixoDe(notas.icp, c.icpAbaixoDe)) {
    return { classe: 'C', nota, motivos: ['Trava: ICP ' + fmtNota(notas.icp) + ' abaixo de ' + fmtLimite(c.icpAbaixoDe) + '. Nenhuma média compensa aderência baixa.'] };
  }
  if (abaixoDe(nota, c.notaAbaixoDe)) {
    return { classe: 'C', nota, motivos: ['Nota integrada ' + fmtNotaIntegrada(nota) + ' abaixo de ' + fmtLimite(c.notaAbaixoDe) + '.'] };
  }
  const a1 = criteriosDaClasse(notas, 'A1', nota);
  if (a1.every((x) => x.atendido)) return { classe: 'A1', nota, motivos: ['Atende os cinco critérios do sweet spot.'] };
  const a2 = criteriosDaClasse(notas, 'A2', nota);
  if (a2.every((x) => x.atendido)) {
    return { classe: 'A2', nota, motivos: a1.filter((x) => !x.atendido).map((x) => 'Para A1 falta: ' + descreverFalta(x)) };
  }
  const falhasA2 = a2.filter((x) => !x.atendido).map((x) => 'Para A2 falta: ' + descreverFalta(x));
  if (atende(nota, MODELO.classes.B1.nota)) return { classe: 'B1', nota, motivos: falhasA2 };
  return { classe: 'B2', nota, motivos: ['Nota integrada ' + fmtNotaIntegrada(nota) + ' abaixo de ' + fmtLimite(MODELO.classes.B1.nota) + ' (mínimo de B1).'].concat(falhasA2) };
}

/** @param {CriterioClasse} c */
export function descreverFalta(c) {
  const nome = c.chave === 'nota' ? 'nota integrada' : NOMES_DIMENSAO[c.chave].nome;
  const valor = c.chave === 'nota' ? fmtNotaIntegrada(c.valor) : fmtNota(c.valor);
  return nome + ' ' + valor + ' (mínimo ' + fmtLimite(c.minimo) + ', falta ' + fmtFalta(c.valor, c.minimo) + ')';
}

/**
 * Proximidade do sweet spot (seção 8.4), em avaliações completas.
 * @param {Notas} notas
 */
export function proximidadeA1(notas) {
  const criterios = criteriosDaClasse(notas, 'A1');
  return { criterios, atendidos: criterios.filter((c) => c.atendido).length };
}

/**
 * "Por que esta classe?" (seção 5.2): compara com a classe imediatamente acima.
 * @param {Notas} notas
 * @param {Classe} classe
 * @returns {{ titulo: string, criterios: CriterioClasse[] }}
 */
export function porQueClasse(notas, classe) {
  const nota = calcularNotaIntegrada(notas);
  if (classe === 'A1') return { titulo: 'Por que A1?', criterios: criteriosDaClasse(notas, 'A1', nota) };
  if (classe === 'A2') return { titulo: 'Por que A2 e não A1?', criterios: criteriosDaClasse(notas, 'A1', nota) };
  if (classe === 'B1') return { titulo: 'Por que B1 e não A2?', criterios: criteriosDaClasse(notas, 'A2', nota) };
  if (classe === 'B2') {
    const b1 = MODELO.classes.B1.nota;
    return { titulo: 'Por que B2 e não B1?', criterios: [{ chave: 'nota', rotulo: 'Nota integrada ≥ ' + fmtLimite(b1), atendido: atende(nota, b1), valor: nota, minimo: b1 }] };
  }
  const c = MODELO.classes.C;
  return {
    titulo: 'Por que C?',
    criterios: [
      { chave: 'icp', rotulo: 'Trava: ICP ≥ ' + fmtLimite(c.icpAbaixoDe), atendido: atende(notas.icp, c.icpAbaixoDe), valor: notas.icp, minimo: c.icpAbaixoDe },
      { chave: 'nota', rotulo: 'Nota integrada ≥ ' + fmtLimite(c.notaAbaixoDe), atendido: atende(nota, c.notaAbaixoDe), valor: nota, minimo: c.notaAbaixoDe }
    ]
  };
}

/**
 * Nota que a dimensão faltante precisaria ter para a conta chegar à classe,
 * pela nota integrada e pelo mínimo individual. Com pesos iguais e A1,
 * equivale a max(18 − soma das três conhecidas, mínimo da dimensão).
 * @param {Partial<Notas>} conhecidas
 * @param {ChaveDimensao} faltante
 * @param {'A1' | 'A2'} classe
 */
export function notaNecessaria(conhecidas, faltante, classe) {
  const regra = MODELO.classes[classe];
  let soma = 0;
  for (const k of DIMENSOES) if (k !== faltante) soma += /** @type {number} */ (conhecidas[k]) * MODELO.pesos[k];
  const pelaNota = (regra.nota * somaPesos() - soma) / MODELO.pesos[faltante];
  return Math.max(pelaNota, regra.minimos[faltante]);
}

/**
 * Aplica as regras de uma classe A tratando a faltante como o valor de teste.
 * O valor de teste fica restrito a esta função (seção 8.5).
 * @param {Partial<Notas>} conhecidas
 * @param {ChaveDimensao} faltante
 * @param {'A1' | 'A2'} classe
 */
function viavel(conhecidas, faltante, classe) {
  /** @type {Notas} */
  const teste = /** @type {Notas} */ ({ ...conhecidas, [faltante]: MODELO.valorTesteViabilidade });
  if (abaixoDe(teste.icp, MODELO.classes.C.icpAbaixoDe)) return false;
  return criteriosDaClasse(teste, classe).every((c) => c.atendido);
}

/**
 * Regra de dados faltando com exatamente 1 dimensão ausente (seção 8.5).
 * @param {Partial<Notas>} conhecidas
 * @param {ChaveDimensao} faltante
 */
export function avaliarUmaFaltante(conhecidas, faltante) {
  const viavelA1 = viavel(conhecidas, faltante, 'A1');
  const necessariaA1 = notaNecessaria(conhecidas, faltante, 'A1');
  /** @type {string[]} */
  const bloqueios = [];
  if (!viavelA1) {
    const min = MODELO.classes.A1.minimos;
    for (const k of DIMENSOES) {
      if (k === faltante) continue;
      const v = /** @type {number} */ (conhecidas[k]);
      if (abaixoDe(v, min[k])) bloqueios.push(NOMES_DIMENSAO[k].nome + ' ' + fmtNota(v) + ' < ' + fmtLimite(min[k]));
    }
    if (!bloqueios.length) {
      bloqueios.push('Para A1, ' + NOMES_DIMENSAO[faltante].nome + ' precisaria ser ≥ ' + fmtMinimoExigido(necessariaA1) + ', acima da escala de 1 a 5');
    }
  }
  return {
    viavelA1,
    /** Valor exigido pelas regras; pode passar de 5 (aí a candidatura cai). */
    notaNecessariaA1: necessariaA1,
    podeChegarA2: viavel(conhecidas, faltante, 'A2'),
    notaNecessariaA2: notaNecessaria(conhecidas, faltante, 'A2'),
    bloqueios
  };
}
