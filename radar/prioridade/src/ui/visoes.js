// @ts-check
import { DIMENSOES, MODELO, NOMES_DIMENSAO } from '../config.js';
import { COLUNAS_MATRIZ, ROTULO_SEGMENTO, SEM_SETOR, agrupar, ehClasse, cruzar, matrizSetorPrioridade, resumoSetor, segmentoDe, tierDe } from '../consulta.js';
import { MAX_COMPARAR } from '../estado-url.js';
import { fmtData, fmtLimite, fmtNota } from '../numeros.js';
import { RAMPA, celulaPrioridade, indicador, miniDist, plural, textoProximidade } from './componentes.js';
import { esc, ico } from './html.js';

/** @typedef {import('../tipos').VisaoIntegradaConta} Conta */
/** @typedef {import('../estado-url.js').EstadoVisao} EstadoVisao */

const ROTULO_TIER = [
  ['Avaliações completas', 'nota integrada e classe calculadas'],
  ['Candidatas ao sweet spot', '1 dimensão a investigar · sem nota nem classe'],
  ['1 dimensão faltando, fora do sweet spot por critério', 'um valor conhecido já impede A1'],
  ['Sem métrica', '2 ou mais dimensões faltando · voltam a ser candidatas ao completar']
];

/** @param {EstadoVisao} st */
function ordemPadrao(st) {
  return !st.ordem.length || (st.ordem.length === 1 && st.ordem[0].col === 'prioridade' && st.ordem[0].dir === -1);
}

/**
 * @param {EstadoVisao} st @param {string} col @param {string} rotulo @param {string} cls
 */
function th(st, col, rotulo, cls) {
  const i = st.ordem.findIndex((o) => o.col === col);
  const o = st.ordem[i];
  const ariaSort = i === 0 ? (o.dir === -1 ? 'descending' : 'ascending') : null;
  const marca = i >= 0 ? (o.dir === -1 ? '↓' : '↑') + (st.ordem.length > 1 ? '<sup>' + (i + 1) + '</sup>' : '') : '';
  return '<th class="' + cls + '" scope="col"' + (ariaSort ? ' aria-sort="' + ariaSort + '"' : '') + '><button type="button" class="ordenar" data-acao="ordenar" data-col="' + col + '" title="Clique ordena; Shift+clique soma um critério">' + esc(rotulo) + ' <span aria-hidden="true">' + marca + '</span></button></th>';
}

/**
 * @param {Conta} c @param {EstadoVisao} st @param {Set<string>} cmp @param {string | null} destaque
 */
function linha(c, st, cmp, destaque) {
  const seg = segmentoDe(c);
  const aberta = st.conta === c.contaId;
  const marcada = cmp.has(c.contaId);
  const cheio = cmp.size >= MAX_COMPARAR && !marcada;
  const p = textoProximidade(c);
  const col = new Set(st.colunas);
  const pend = DIMENSOES.filter((k) => c.dimensoes[k].pendenciasQualidade.length).length;
  const velhas = DIMENSOES.filter((k) => c.dimensoes[k].status === 'desatualizada').length;
  const dimsMovel = '<span class="dims-movel">' + DIMENSOES.map((k) => { const d = c.dimensoes[k]; return '<span>' + NOMES_DIMENSAO[k].curto + ' <b>' + (d.nota != null && d.entraNoCalculo ? fmtNota(d.nota) : '—') + '</b></span>'; }).join('') + '</span><span class="dims-movel"><b>' + esc(p.principal) + '</b>' + esc(p.detalhe) + '</span>';
  let s = '<tr class="linha e-' + seg + (aberta ? ' is-aberta' : '') + (destaque === c.contaId ? ' is-destaque' : '') + '" data-acao="abrir" data-id="' + esc(c.contaId) + '" id="linha-' + esc(c.contaId) + '">';
  s += '<td class="c-cmp"><span class="cmp-sel"><input type="checkbox" class="chk" data-acao="comparar" data-id="' + esc(c.contaId) + '"' + (marcada ? ' checked' : '') + (cheio ? ' disabled aria-describedby="limite-cmp"' : '') + ' aria-label="' + esc('Comparar ' + c.conta.nome) + '"></span></td>';
  s += '<td class="c-conta"><button type="button" class="conta__abrir" data-acao="abrir" data-id="' + esc(c.contaId) + '" aria-expanded="' + aberta + '">' + esc(c.conta.nome) + '</button><span class="sub">' + esc(c.conta.setor || 'Sem setor') + (c.conta.uf ? ' · ' + esc(c.conta.uf) : '') + '</span>' + dimsMovel + '</td>';
  s += '<td class="c-prio">' + celulaPrioridade(c) + '</td>';
  for (const k of DIMENSOES) s += '<td class="c-dim">' + indicador(c.dimensoes[k], k) + '</td>';
  if (col.has('proximidade')) s += '<td class="c-prox"><div class="prox"><b>' + esc(p.principal) + '</b><span class="sub">' + esc(p.detalhe) + '</span></div></td>';
  if (col.has('evidencia')) s += '<td class="c-evid"><span class="evid">' + (c.conta.evidenciaPrincipal ? esc(c.conta.evidenciaPrincipal) : '<span class="sub">Sem evidência principal no snapshot</span>') + '</span></td>';
  if (col.has('situacao')) s += '<td class="c-sit"><span class="sit"><b>' + c.cobertura + '</b> de 4 no cálculo</span>' + (pend ? '<span class="pend">' + plural(pend, 'pendência', 'pendências') + '</span>' : '') + (velhas ? '<span class="pend">' + plural(velhas, 'desatualizada', 'desatualizadas') + '</span>' : '') + '</td>';
  if (col.has('data')) s += '<td class="c-data"><span class="sit">' + (c.dataUltimaAvaliacao ? fmtData(c.dataUltimaAvaliacao) : '—') + '</span></td>';
  return s + '</tr>';
}

/**
 * Lista comparativa (seção 6.3), com agrupamento opcional (6.6).
 * @param {Conta[]} contas ordenadas
 * @param {EstadoVisao} st
 * @param {string | null} destaque
 */
export function lista(contas, st, destaque) {
  const col = new Set(st.colunas);
  const cmp = new Set(st.comparar);
  let cab = '<tr><th class="c-cmp" scope="col"><span class="sr">Comparar</span></th>' + th(st, 'nome', 'Conta', 'c-conta') + th(st, 'prioridade', 'Prioridade integrada', 'c-prio');
  for (const k of DIMENSOES) cab += th(st, k, k === 'oportunidadeDigital' ? 'Digital' : NOMES_DIMENSAO[k].curto, 'c-dim');
  if (col.has('proximidade')) cab += th(st, 'proximidade', 'Proximidade do sweet spot', 'c-prox');
  if (col.has('evidencia')) cab += '<th class="c-evid" scope="col">Evidência principal</th>';
  if (col.has('situacao')) cab += th(st, 'cobertura', 'Situação', 'c-sit');
  if (col.has('data')) cab += th(st, 'data', 'Última avaliação', 'c-data');
  cab += '</tr>';
  const ncol = 3 + DIMENSOES.length + ['proximidade', 'evidencia', 'situacao', 'data'].filter((c) => col.has(c)).length;

  let corpo = '';
  if (st.agrupar) {
    for (const g of agrupar(contas, st.agrupar)) {
      const fechado = st.recolhidos.includes(g.chave);
      corpo += '<tr class="grupo"><th colspan="' + ncol + '" scope="rowgroup"><div class="grupo__cab"><button type="button" data-acao="recolher" data-grupo="' + esc(g.chave) + '" aria-expanded="' + !fechado + '">' + ico('baixo') + esc(g.rotulo) + '</button><span class="meta num">' + plural(g.contas.length, 'conta', 'contas') + '</span>' + miniDist(g.contas) + '</div></th></tr>';
      if (!fechado) corpo += g.contas.map((c) => linha(c, st, cmp, destaque)).join('');
    }
  } else if (ordemPadrao(st)) {
    let tier = -1;
    for (const c of contas) {
      const t = tierDe(c);
      if (t !== tier) {
        tier = t;
        const n = contas.filter((x) => tierDe(x) === t).length;
        corpo += '<tr class="sep"><th colspan="' + ncol + '" scope="rowgroup">' + esc(ROTULO_TIER[t][0]) + ' · <span class="num">' + n + '</span><span>' + esc(ROTULO_TIER[t][1]) + '</span></th></tr>';
      }
      corpo += linha(c, st, cmp, destaque);
    }
  } else {
    corpo = contas.map((c) => linha(c, st, cmp, destaque)).join('');
  }
  return '<div class="quadro"><table class="lista"><caption class="sr">Contas e prioridade integrada experimental</caption><thead>' + cab + '</thead><tbody>' + corpo + '</tbody></table></div>' +
    '<p class="sr" id="limite-cmp">Limite de ' + MAX_COMPARAR + ' contas na comparação. Remova uma para incluir outra.</p>';
}

/**
 * Setor × Prioridade (seção 6.6, item 4).
 * @param {Conta[]} contas @param {EstadoVisao} st
 */
export function matriz(contas, st) {
  const m = matrizSetorPrioridade(contas, st.ordemMatriz);
  const nomeCol = (/** @type {string} */ s) => ehClasse(s) ? s : s === 'candidata' ? 'Candidatas' : s === 'fora_por_criterio' ? '1 falt., fora' : 'Sem métrica';
  const max = Math.max(1, ...m.linhas.flatMap((l) => COLUNAS_MATRIZ.map((s) => l.celulas[s])));
  /** @param {string} setor @param {string} s @param {number} n @param {string} rotSetor */
  const cel = (setor, s, n, rotSetor) => {
    const r = ehClasse(s) ? RAMPA[/** @type {keyof typeof RAMPA} */ (s)] : 'var(--ink)';
    return '<td><button type="button" class="celula" data-acao="celula-matriz" data-setor="' + esc(setor) + '" data-seg="' + s + '"' + (n ? '' : ' disabled') + ' aria-label="' + esc(rotSetor + ', ' + ROTULO_SEGMENTO[/** @type {keyof typeof ROTULO_SEGMENTO} */ (s)] + ': ' + n + (n ? '. Filtrar a lista' : '')) + '">' + n +
      (n ? '<span class="marca" style="--r:' + r + ';--o:' + (0.25 + 0.75 * n / max).toFixed(2) + '" aria-hidden="true"></span>' : '') + '</button></td>';
  };
  const ordem = '<label>Ordenar setores <select class="sel" data-acao="ordem-matriz"><option value="a1"' + (st.ordemMatriz === 'a1' ? ' selected' : '') + '>por A1</option><option value="candidata"' + (st.ordemMatriz === 'candidata' ? ' selected' : '') + '>por candidatas</option><option value="nome"' + (st.ordemMatriz === 'nome' ? ' selected' : '') + '>por nome</option></select></label>';
  let s = '<div class="quadro"><div class="cruz-ctrl">' + ordem + '<span class="sub" style="margin:0">Números em texto; a marca só reforça. Clique numa célula para filtrar a lista.</span></div>';
  s += '<table class="tabela"><caption><b>Setor × Prioridade</b> · ' + plural(m.total, 'conta', 'contas') + ' no recorte. Descritivo: não cria nota do setor.</caption><thead><tr><th scope="col" style="text-align:left;padding-left:14px">Setor</th>' + COLUNAS_MATRIZ.map((c) => '<th scope="col">' + esc(nomeCol(c)) + '</th>').join('') + '<th scope="col">Total</th></tr></thead><tbody>';
  for (const l of m.linhas) s += '<tr><th scope="row">' + esc(l.rotulo) + '</th>' + COLUNAS_MATRIZ.map((c) => cel(l.chave, c, l.celulas[c], l.rotulo)).join('') + '<td class="tot">' + l.total + '</td></tr>';
  s += '</tbody><tfoot><tr><th scope="row">Total</th>' + COLUNAS_MATRIZ.map((c) => '<td class="tot">' + m.totais[c] + '</td>').join('') + '<td class="tot">' + m.total + '</td></tr></tfoot></table></div>';
  return s;
}

/**
 * Cruzar duas dimensões (seção 6.6, item 5).
 * @param {Conta[]} contas @param {EstadoVisao} st
 */
export function cruzamento(contas, st) {
  const r = cruzar(contas, st.x, st.y);
  const nx = NOMES_DIMENSAO[st.x].nome, ny = NOMES_DIMENSAO[st.y].nome;
  const sel = (/** @type {'x' | 'y'} */ eixo) => '<label>' + eixo.toUpperCase() + ' <select class="sel" data-acao="eixo" data-eixo="' + eixo + '">' + DIMENSOES.map((k) => '<option value="' + k + '"' + (st[eixo] === k ? ' selected' : '') + '>' + esc(NOMES_DIMENSAO[k].nome) + '</option>').join('') + '</select></label>';
  const faixaTxt = (/** @type {number[]} */ f, /** @type {number} */ i) => fmtLimite(f[0]) + (i === r.faixas.length - 1 ? '–' + fmtLimite(f[1]) : ' a <' + fmtLimite(f[1]));
  const max = Math.max(1, ...r.grade.flat());
  let s = '<div class="quadro"><div class="cruz-ctrl">' + sel('x') + sel('y') + (st.x === st.y ? '<span class="pend">Escolha dimensões diferentes</span>' : '') + '<span class="sub" style="margin:0">Faixas de 1 ponto; contagem por célula. Clique para filtrar.</span></div><div class="cruz">';
  s += '<table class="tabela"><caption><b>' + esc(ny) + '</b> (linhas) × <b>' + esc(nx) + '</b> (colunas) · ' + plural(r.total - r.semAvaliacao, 'conta', 'contas') + ' na grade</caption><thead><tr><th scope="col"><span class="sr">' + esc(ny) + ' \\ ' + esc(nx) + '</span></th>' +
    r.faixas.map((f, i) => '<th scope="col">' + esc(NOMES_DIMENSAO[st.x].curto + ' ' + faixaTxt(f, i)) + '</th>').join('') + '</tr></thead><tbody>';
  for (let iy = r.faixas.length - 1; iy >= 0; iy--) {
    s += '<tr><th scope="row">' + esc(NOMES_DIMENSAO[st.y].curto + ' ' + faixaTxt(r.faixas[iy], iy)) + '</th>';
    for (let ix = 0; ix < r.faixas.length; ix++) {
      const n = r.grade[iy][ix];
      const dens = n / max * 0.85;
      s += '<td><button type="button" class="celula celula--dens' + (dens > 0.5 ? ' escura' : '') + '" style="--d:' + dens.toFixed(2) + '" data-acao="celula-cruz" data-ix="' + ix + '" data-iy="' + iy + '"' + (n ? '' : ' disabled') + ' aria-label="' + esc(NOMES_DIMENSAO[st.x].curto + ' ' + faixaTxt(r.faixas[ix], ix) + ', ' + NOMES_DIMENSAO[st.y].curto + ' ' + faixaTxt(r.faixas[iy], iy) + ': ' + n + ' contas') + '">' + n + '</button></td>';
    }
    s += '</tr>';
  }
  s += '</tbody></table>';
  const c = fmtLimite(r.corte);
  const q = r.quadrantes;
  const cx = NOMES_DIMENSAO[st.x].curto, cy = NOMES_DIMENSAO[st.y].curto;
  s += '<div class="quads"><h3>Quadrantes (alto = ≥ ' + c + ')</h3><ul>' +
    '<li><span>' + esc(cx + ' alto, ' + cy + ' alto') + '</span><b>' + q.altoAlto + '</b></li>' +
    '<li><span>' + esc(cx + ' alto, ' + cy + ' baixo') + '</span><b>' + q.altoBaixo + '</b></li>' +
    '<li><span>' + esc(cx + ' baixo, ' + cy + ' alto') + '</span><b>' + q.baixoAlto + '</b></li>' +
    '<li><span>' + esc(cx + ' baixo, ' + cy + ' baixo') + '</span><b>' + q.baixoBaixo + '</b></li></ul>' +
    '<div class="semav"><b class="num">' + r.semAvaliacao + '</b> sem avaliação em ' + esc(cx) + ' ou ' + esc(cy) + ', fora da grade.' + (r.semAvaliacao ? ' <button type="button" class="link" data-acao="sem-av-cruz">Ver na lista</button>' : '') + '</div></div>';
  return s + '</div></div>';
}

/**
 * Resumo do setor (quando exatamente um setor está filtrado).
 * @param {string} setor @param {Conta[]} contas
 * @param {{ climaVinculado: boolean, rotaClima: string | null }} op
 */
export function resumoDoSetor(setor, contas, op) {
  const r = resumoSetor(contas);
  const nome = setor === SEM_SETOR ? 'Sem setor' : setor;
  const dims = r.dimensoes.filter((d) => d.chave !== 'clima').map((d) => '<span class="dimr">' + esc(NOMES_DIMENSAO[d.chave].curto) + ' <b>' + (d.media == null ? '—' : fmtNota(d.media)) + '</b> <span>· ' + d.n + ' de ' + d.de + '</span></span>').join('');
  const clima = r.dimensoes.find((d) => d.chave === 'clima');
  let txtClima;
  if (!op.climaVinculado) txtClima = 'Clima do setor: vínculo com a taxonomia do Clima pendente';
  else if (!clima || clima.n === 0) txtClima = 'Clima do setor: indisponível';
  else txtClima = 'Clima ' + fmtNota(clima.media) + ' · ' + clima.n + ' de ' + clima.de;
  const link = op.rotaClima ? ' <a class="link" href="' + esc(op.rotaClima) + '">Ver página Clima</a>' : '';
  return '<section class="resumo-setor" aria-label="Resumo do setor"><h2>' + esc(nome) + '</h2><span class="num">' + plural(r.total, 'conta', 'contas') + '</span>' + miniDist(contas) + dims + '<span class="dimr">' + esc(txtClima) + link + '</span><span class="sub" style="margin:0">Médias só das contas avaliadas, com o n. Sem nota integrada do setor.</span></section>';
}

export { MODELO };
