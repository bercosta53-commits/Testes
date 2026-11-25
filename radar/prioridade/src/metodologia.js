// @ts-check
/**
 * Texto da metodologia gerado da MESMA configuração que o cálculo usa
 * (seção 5). Mudar um limite em config.js muda este texto.
 */
import { DIMENSOES, MODELO, NOMES_DIMENSAO, RUBRICA } from './config.js';
import { classificar } from './modelo.js';
import { fmtLimite, fmtNota, fmtNotaIntegrada } from './numeros.js';

/** @typedef {import('./tipos').Classe} Classe */

const pesosIguais = () => DIMENSOES.every((k) => MODELO.pesos[k] === MODELO.pesos.icp);

/** Cinco passos do painel "Como ler a prioridade". */
export function passosMetodologia() {
  const c = MODELO.classes;
  const a1 = c.A1.minimos, a2 = c.A2.minimos;
  const outras = /** @type {const} */ (['clima', 'oportunidadeDigital']);
  const outrasIguais = outras.every((k) => a1[k] === a2[k]);
  const minOutras = outrasIguais && a1.clima === a1.oportunidadeDigital
    ? NOMES_DIMENSAO.clima.nome + ' e ' + NOMES_DIMENSAO.oportunidadeDigital.nome + ' ≥ ' + fmtLimite(a1.clima)
    : outras.map((k) => NOMES_DIMENSAO[k].nome + ' ≥ ' + fmtLimite(a2[k]) + ' (A2) ou ≥ ' + fmtLimite(a1[k]) + ' (A1)').join(', ');
  const icpA = a1.icp === a2.icp ? 'ICP ≥ ' + fmtLimite(a1.icp) : 'ICP ≥ ' + fmtLimite(a2.icp) + ' (A2) ou ≥ ' + fmtLimite(a1.icp) + ' (A1)';
  return [
    {
      titulo: 'Quatro perguntas, notas de ' + MODELO.escala.min + ' a ' + MODELO.escala.max + ' (maior = mais oportunidade)',
      detalhe: DIMENSOES.map((k) => NOMES_DIMENSAO[k].nome).join(' · ')
    },
    {
      titulo: 'Nota integrada = ' + (pesosIguais() ? 'média simples das quatro' : 'média ponderada das quatro') + ' (só com as quatro avaliadas)',
      detalhe: 'Calculada sem arredondar; exibida com ' + MODELO.casasNotaIntegrada + ' casas. Não usa a área do gráfico.'
    },
    {
      titulo: 'Travas: ICP abaixo de ' + fmtLimite(c.C.icpAbaixoDe) + ' vira C. Para A: ' + icpA + ', Sinais ≥ ' + fmtLimite(a2.sinais) + ' (A2) ou ≥ ' + fmtLimite(a1.sinais) + ' (A1), ' + minOutras,
      detalhe: 'Nota integrada mínima: A1 ' + fmtLimite(c.A1.nota) + ' · A2 ' + fmtLimite(c.A2.nota) + ' · B1 ' + fmtLimite(c.B1.nota) + ' · abaixo de ' + fmtLimite(c.C.notaAbaixoDe) + ' vira C.'
    },
    {
      titulo: 'Classe: ' + MODELO.ordemClasses.map((k) => k + ' ' + MODELO.leituraClasse[k].curto).join(' · '),
      detalhe: 'Sweet spot = A1. Aproximadas = completas que atendem a maior parte dos critérios de A1.'
    },
    {
      titulo: 'Sem evidência = "Sem avaliação", nunca vira nota nem entra na média.',
      detalhe: 'Falta 1 dimensão: a conta segue candidata e vira investigação. Faltam 2 ou mais: sai do sweet spot até completar.'
    }
  ];
}

export const AVISO_ABORDAGEM = 'Esta classe não autoriza abordagem. Elegibilidade e contatos seguem o contrato oficial.';

/** Definições curtas exibidas ao toque ou ao foco. */
export const TERMOS = {
  'nota integrada': 'Média das quatro notas de 1 a 5. Só existe quando as quatro dimensões estão avaliadas.',
  trava: 'Regra que impede uma classe mesmo com média alta. Ex.: ICP abaixo de ' + fmtLimite(MODELO.classes.C.icpAbaixoDe) + ' sempre vira C.',
  'sweet spot': 'Classe A1: os quatro eixos convergem e todos os mínimos são atendidos.',
  candidata: 'Conta com exatamente uma dimensão sem nota que ainda pode chegar a A1. Não tem nota nem classe; tem uma investigação.'
};

/**
 * Exemplos de uma linha por classe, CALCULADOS pelo classificador real
 * (se a configuração mudar e o exemplo deixar de valer, o teste acusa).
 * @returns {Array<{ classe: Classe, regra: string, leitura: string, exemplo: string, notas: Record<string, number>, classeCalculada: Classe }>}
 */
export function tabelaClasses() {
  const c = MODELO.classes;
  const m = (/** @type {Record<string, number>} */ o) => Object.entries(o).map(([k, v]) => NOMES_DIMENSAO[/** @type {keyof typeof NOMES_DIMENSAO} */ (k)].curto + ' ' + fmtNota(v)).join(' · ');
  /** @type {Array<[Classe, string, Record<string, number>]>} */
  const linhas = [
    ['C', 'ICP < ' + fmtLimite(c.C.icpAbaixoDe) + ' OU nota integrada < ' + fmtLimite(c.C.notaAbaixoDe), { icp: 2.5, sinais: 5, clima: 5, oportunidadeDigital: 5 }],
    ['A1', 'Nota ≥ ' + fmtLimite(c.A1.nota) + ' E ' + DIMENSOES.map((k) => NOMES_DIMENSAO[k].curto + ' ≥ ' + fmtLimite(c.A1.minimos[k])).join(' E '), { icp: 4.5, sinais: 4.5, clima: 4, oportunidadeDigital: 5 }],
    ['A2', 'Nota ≥ ' + fmtLimite(c.A2.nota) + ' E ' + DIMENSOES.map((k) => NOMES_DIMENSAO[k].curto + ' ≥ ' + fmtLimite(c.A2.minimos[k])).join(' E '), { icp: 4, sinais: 3.5, clima: 4, oportunidadeDigital: 4.5 }],
    ['B1', 'Nota ≥ ' + fmtLimite(c.B1.nota), { icp: 3.5, sinais: 4.5, clima: 4, oportunidadeDigital: 4.2 }],
    ['B2', 'Demais avaliações completas', { icp: 3, sinais: 3, clima: 3, oportunidadeDigital: 3.5 }]
  ];
  return linhas.map(([classe, regra, notas]) => {
    const r = classificar(/** @type {any} */ (notas));
    return {
      classe, regra, leitura: MODELO.leituraClasse[classe].leitura, notas, classeCalculada: r.classe,
      exemplo: m(notas) + ' → ' + fmtNotaIntegrada(r.nota) + ' → ' + r.classe
    };
  });
}

/** Rubrica para exibir ao lado da nota (nunca para "sem achados"). */
export function leituraRubrica(/** @type {import('./tipos').ChaveDimensao} */ k, /** @type {number} */ nota) {
  // Conservador: 3,5 lê como nível 3 (não arredonda para cima a descrição).
  const i = Math.min(4, Math.max(0, Math.floor(nota + MODELO.tolerancia) - 1));
  return RUBRICA[k][i];
}
