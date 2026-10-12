// Títulos curtos que dizem a conclusão de cada bloco, gerados a partir do
// cálculo. Funções puras, sem DOM.
import { CANDIDATOS, CLUBES } from './calc.js';
import { pct } from './format.js';

const TORCIDA = { gremio: 'gremista', inter: 'colorado' };

export function juntar(nomes) {
  return nomes.length <= 1 ? nomes.join('') : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
}

/** Legenda do número principal: o que a chance do líder significa. */
export function fraseLider(r) {
  if (r.lideres.length > 1) return 'de chance de sofrimento duplo para cada um';
  const [l] = r.lideres;
  return `de chance de ver o ${CLUBES[l.clube]} rebaixado e ${CANDIDATOS[l.candidato]} derrotado`;
}

/** Nome do líder, ou dos empatados. */
export function nomeLider(r) {
  return juntar(r.lideres.map((p) => p.nome));
}

/** Título do ranking: quem lidera e o que pesa mais. */
export function tituloRanking(r) {
  const [a, b] = r.ranking;
  if (r.lideres.length > 1) return `${nomeLider(r)} empatam no topo`;
  if (a.clube === b.clube) return `${a.nome} lidera, e ser ${TORCIDA[a.clube]} pesa mais que o voto`;
  if (a.candidato === b.candidato) return `${a.nome} lidera, e o voto pesa mais que o clube`;
  return `${a.nome} lidera o ranking`;
}

/** Título dos cruzamentos: a faixa do sofrimento duplo entre os perfis. */
export function tituloCruzamentos(r) {
  const ordem = [...r.perfis].sort((a, b) => a.quedaEDerrota - b.quedaEDerrota);
  const [min, max] = [ordem[0], ordem.at(-1)];
  return `O sofrimento duplo vai de ${pct(min.quedaEDerrota)} a ${pct(max.quedaEDerrota)}`;
}
