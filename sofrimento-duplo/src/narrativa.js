// Textos de conclusão (resumo executivo e títulos das figuras), gerados a
// partir do cálculo. Funções puras, sem DOM.
import { CANDIDATOS, CLUBES } from './calc.js';
import { NOMES_MODO, casasPct, num, pct } from './format.js';

const TORCIDA = { gremio: 'gremistas', inter: 'colorados' };

export function juntar(nomes) {
  return nomes.length <= 1 ? nomes.join('') : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
}

/** "3 p.p." ou "2,5 p.p." para um valor na escala 0–1. */
function pontos(x) {
  return `${num(x * 100, casasPct(x))} p.p.`;
}

/**
 * Os quatro achados do resumo executivo.
 * @param r resultado de calcPerfis com as premissas atuais
 * @param base resultado de calcPerfis antes do jogo (ou null se não der para calcular)
 * @param params premissas atuais
 */
export function resumoExecutivo(r, base, params) {
  return [achadoLider(r), achadoPeso(r), achadoGreNal(r, base, params), achadoCorinthians(r)];
}

function achadoLider(r) {
  const [lider] = r.lideres;
  const texto =
    r.lideres.length > 1
      ? `${juntar(r.lideres.map((p) => p.nome))} empatam: cada um tem essa chance de sofrimento duplo.`
      : `${lider.nome}: chance de ver o ${CLUBES[lider.clube]} rebaixado e ${CANDIDATOS[lider.candidato]} derrotado.`;
  return { id: 'lider', rotulo: 'Quem se dá pior?', valor: pct(lider.quedaEDerrota), texto, perfil: lider };
}

function achadoPeso(r) {
  const [a, b] = r.ranking;
  if (a.candidato === b.candidato) {
    const cand = CANDIDATOS[a.candidato];
    return {
      id: 'peso',
      rotulo: `Chance de ${cand} perder`,
      valor: pct(1 - a.pCand),
      texto: `O voto pesa mais que o clube: os dois perfis pró-${cand} ocupam o topo do ranking.`,
    };
  }
  if (a.clube === b.clube) {
    const clube = CLUBES[a.clube];
    return {
      id: 'peso',
      rotulo: `Risco de o ${clube} cair`,
      valor: pct(a.pClube),
      texto: `O clube pesa mais que o voto: os dois perfis ${TORCIDA[a.clube]} ocupam o topo do ranking.`,
    };
  }
  return {
    id: 'peso',
    rotulo: 'Derrotas esperadas do líder',
    valor: num(a.derrotasEsperadas),
    texto: 'Clube e voto pesam de forma parecida: o topo do ranking mistura torcida e candidato.',
  };
}

function achadoGreNal(r, base, params) {
  const g = pct(r.pRebaixa.gremio, 1);
  const i = pct(r.pRebaixa.inter, 1);
  const antes = base ? ` Antes do jogo, eram ${pct(base.pRebaixa.gremio, 1)} e ${pct(base.pRebaixa.inter, 1)}.` : '';
  const comAjuste = r.ajuste > 0 ? ', já com o ajuste do Corinthians' : '';
  let texto;
  if (params.resultadoJogo === 'empate') {
    texto = `Com o empate no Gre-Nal (o Inter abriu o placar no 1º tempo e o Grêmio empatou), o risco de queda fica em ${g} para o Grêmio e ${i} para o Inter${comAjuste}.${antes}`;
  } else if (params.resultadoJogo === 'probabilistico') {
    texto = `Ponderando os três resultados possíveis do Gre-Nal, o risco de queda é de ${g} para o Grêmio e ${i} para o Inter${comAjuste}.`;
  } else {
    texto = `No cenário “${NOMES_MODO[params.resultadoJogo]}”, o risco de queda fica em ${g} para o Grêmio e ${i} para o Inter${comAjuste}.${antes}`;
  }
  return { id: 'grenal', rotulo: 'Risco de o Grêmio cair', valor: g, texto };
}

function achadoCorinthians(r) {
  if (r.ajuste > 0) {
    return {
      id: 'corinthians',
      rotulo: 'Ajuste pela derrota do Corinthians',
      valor: `−${pontos(r.ajuste)}`,
      texto: `O Corinthians perdeu e segue perto da zona de rebaixamento. Como o modelo de risco é anterior à rodada, descontamos ${pontos(r.ajuste)} do risco de Grêmio e Inter (estimativa desta análise).`,
    };
  }
  return {
    id: 'corinthians',
    rotulo: 'Ajuste pela derrota do Corinthians',
    valor: '0 p.p.',
    texto: 'Ajuste desligado: o risco de Grêmio e Inter segue o modelo anterior à rodada.',
  };
}

/** Título-conclusão da figura do ranking. */
export function tituloRanking(r) {
  const [l] = r.lideres;
  const numeros = `${num(l.derrotasEsperadas)} derrotas esperadas em 2 e ${pct(l.quedaEDerrota)} de chance de sofrimento duplo`;
  if (r.lideres.length > 1) return `${juntar(r.lideres.map((p) => p.nome))} dividem a liderança, com ${numeros}`;
  return `${l.nome} lidera o ranking, com ${numeros}`;
}

/** Título-conclusão da figura das matrizes. */
export function tituloMatrizes(r) {
  const ordem = [...r.perfis].sort((a, b) => a.quedaEDerrota - b.quedaEDerrota);
  const [min, max] = [ordem[0], ordem.at(-1)];
  return `A chance de sofrimento duplo vai de ${pct(min.quedaEDerrota)} (${min.nome}) a ${pct(max.quedaEDerrota)} (${max.nome})`;
}

/** Título-conclusão da figura das barras empilhadas. */
export function tituloEmpilhadas(r) {
  const acima = r.perfis.filter((p) => p.ficaEVitoria > 0.5);
  if (acima.length) {
    return `${juntar(acima.map((p) => p.nome))} ${acima.length > 1 ? 'têm' : 'tem'} mais de 50% de chance de escapar das duas derrotas`;
  }
  const melhor = r.perfis.reduce((a, b) => (b.ficaEVitoria > a.ficaEVitoria ? b : a));
  return `Nenhum perfil chega a 50% de chance de escapar das duas derrotas; o mais perto é ${melhor.nome}, com ${pct(melhor.ficaEVitoria)}`;
}
