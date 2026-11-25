// @ts-check
import { DIMENSOES, MODELO, NOMES_DIMENSAO } from '../config.js';
import { textoEstadoDimensao, valida } from '../adaptador.js';
import { ROTULO_SS } from '../consulta.js';
import { AVISO_ABORDAGEM, leituraRubrica } from '../metodologia.js';
import { porQueClasse } from '../modelo.js';
import { fmtData, fmtFalta, fmtLimite, fmtMinimoExigido, fmtNota, fmtNotaIntegrada } from '../numeros.js';
import { seloClasse, textoProximidade } from './componentes.js';
import { esc, ico } from './html.js';
import { losango, textoEquivalente } from './losango.js';

/** @typedef {import('../tipos').VisaoIntegradaConta} Conta */
/** @typedef {import('../tipos').CriterioClasse} CriterioClasse */

/** @param {CriterioClasse} c */
function itemCheck(c) {
  const nome = c.chave === 'nota' ? 'Nota integrada' : NOMES_DIMENSAO[c.chave].nome;
  const valor = c.chave === 'nota' ? fmtNotaIntegrada(c.valor) : fmtNota(c.valor);
  const minimo = c.chave === 'nota' ? fmtNotaIntegrada(c.minimo) : fmtNota(c.minimo);
  return '<li class="' + (c.atendido ? 'sim' : 'nao') + '"><span class="marca" aria-hidden="true">' + (c.atendido ? '✓' : '✗') + '</span><span><span class="sr">' + (c.atendido ? 'Atende: ' : 'Não atende: ') + '</span>' + esc(nome) + ' <b class="num">' + valor + '</b>' +
    (c.atendido ? '' : '<span class="falta">falta ' + fmtFalta(c.valor, c.minimo) + '</span>') + '</span><span class="min">(mínimo ' + minimo + ')</span></li>';
}

/** Ação recomendada oficial: exibida como veio, preservando bloqueios. @param {unknown} a */
function textoAcao(a) {
  if (a == null) return null;
  if (typeof a === 'string') return { texto: a, bloqueio: null };
  if (typeof a === 'object') {
    const o = /** @type {Record<string, unknown>} */ (a);
    const t = [o.rotulo, o.titulo, o.texto, o.descricao].find((x) => typeof x === 'string');
    const b = [o.bloqueio, o.motivoBloqueio].find((x) => typeof x === 'string') || (o.bloqueada === true ? 'Bloqueada pelas regras oficiais' : null);
    return { texto: /** @type {string | undefined} */ (t) || 'Ação recomendada disponível (formato não reconhecido pela visão integrada).', bloqueio: /** @type {string | null} */ (b) };
  }
  return null;
}

/**
 * Painel da conta selecionada (seção 6.4).
 * @param {Conta} c
 * @param {{ posicao: number, total: number, modoApresentacao: boolean }} ctx
 */
export function painelConta(c, ctx) {
  const completa = c.cobertura === 4;
  let s = '<div class="det">';

  // 1. Nome, setor, classe e nota
  s += '<header><h2 class="det__nome" id="det-tit">' + esc(c.conta.nome) + '</h2><p class="det__meta">' + esc(c.conta.setor || 'Sem setor') + (c.conta.uf ? ' · ' + esc(c.conta.uf) : '') + (c.conta.nomesAlternativos[0] ? ' · ' + esc(c.conta.nomesAlternativos[0]) : '') + '</p>' +
    '<div class="det__prio"><span class="det__prio-rot">' + esc(MODELO.rotuloPrioridade) + '</span><span>' + seloClasse(c) + '</span>' +
    '<span class="det__prio-n">' + (completa ? fmtNotaIntegrada(c.notaIntegrada) + '<small>nota integrada</small>' : '—<small>' + c.cobertura + ' de 4 dimensões</small>') + '</span></div></header>';

  // 2. Losango
  s += '<section><p class="bloco__tit">Quatro eixos <button type="button" class="link" data-acao="como-funciona">Como funciona</button></p><div class="losango-box">' + losango(c.dimensoes, { titulo: c.conta.nome }) + '</div>' +
    '<p class="lz-legenda">' + (completa ? 'Avaliação completa: 4 de 4 dimensões.' : '<b>Avaliação incompleta: ' + c.cobertura + ' de 4 dimensões.</b> Eixo sem avaliação não recebe valor.') + '<br><span class="sr">Leitura textual: </span>' + esc(textoEquivalente(c.dimensoes)) + '</p></section>';

  // 3. Quatro notas com explicação
  s += '<section><p class="bloco__tit">Notas por dimensão</p><ul class="dims">';
  for (const k of DIMENSOES) {
    const d = c.dimensoes[k];
    const ok = valida(d);
    const leitura = d.nota != null && !d.semAchados ? 'Rubrica: ' + leituraRubrica(k, d.nota) + '. ' : '';
    s += '<li><span class="dims__nome">' + esc(NOMES_DIMENSAO[k].nome) + '</span><span class="dims__n' + (d.nota == null ? ' sem' : '') + '">' + (d.nota == null ? esc(textoEstadoDimensao(d)) : fmtNota(d.nota)) + '</span>' +
      '<p class="dims__txt">' + (d.resumo ? esc(d.resumo) : '<span class="sub" style="display:inline">' + esc(NOMES_DIMENSAO[k].pergunta) + '</span>') + '</p>' +
      '<p class="dims__estado">' + esc(leitura + (d.nota != null ? textoEstadoDimensao(d) : d.motivoExclusao || '')) + (ok || d.nota == null ? '' : ' · ' + esc(d.motivoExclusao)) + '</p></li>';
  }
  s += '</ul></section>';

  // 4. Por que esta classe? / investigação / para chegar ao sweet spot
  if (completa && c.classeIntegrada) {
    const notas = /** @type {Record<import('../tipos').ChaveDimensao, number>} */ (Object.fromEntries(DIMENSOES.map((k) => [k, /** @type {number} */ (c.dimensoes[k].nota)])));
    const pq = porQueClasse(notas, c.classeIntegrada);
    s += '<section><p class="bloco__tit">' + esc(pq.titulo) + '</p><ul class="check">' + pq.criterios.map(itemCheck).join('') + '</ul>' +
      (c.motivosClassificacao.length && c.classeIntegrada === 'C' ? '<p class="sub" style="white-space:normal;margin-top:6px">' + esc(c.motivosClassificacao[0]) + '</p>' : '') + '</section>';
    const p = textoProximidade(c);
    s += '<section><p class="bloco__tit">Para chegar ao sweet spot</p>' + (c.classeIntegrada === 'A1' ? '<p><b>No sweet spot.</b> Atende os 5 critérios de A1.</p>'
      : '<p><b>' + esc(p.principal) + '.</b></p><ul class="check" style="margin-top:4px">' + /** @type {CriterioClasse[]} */ (c.criteriosA1).filter((x) => !x.atendido).map(itemCheck).join('') + '</ul>') + '</section>';
  } else if (c.investigacao) {
    const inv = c.investigacao;
    s += '<section><p class="bloco__tit">Investigação acionável</p><dl class="caixa caixa--inv">' +
      '<div><dt>Dimensão que falta</dt><dd><b>' + esc(NOMES_DIMENSAO[inv.dimensao].nome) + '</b> — ' + esc(inv.motivo || 'sem avaliação') + '</dd></div>' +
      '<div><dt>Evidência que resolveria</dt><dd>' + esc(inv.evidenciaNecessaria || '—') + '</dd></div>' +
      '<div><dt>Nota mínima para virar A1</dt><dd>Para A1, ' + esc(NOMES_DIMENSAO[inv.dimensao].nome) + ' precisa ser <span class="destaque">≥ ' + fmtMinimoExigido(/** @type {number} */ (inv.notaMinimaParaA1)) + '</span></dd></div>' +
      '<div><dt>A2</dt><dd>' + (inv.podeChegarA2 ? 'Ainda pode chegar a A2.' : 'A2 já está fora de alcance com as notas conhecidas.') + '</dd></div>' +
      '</dl><p class="sub" style="white-space:normal;margin-top:6px">Sem nota integrada, sem classe e sem média parcial até a dimensão ser avaliada. Esta tela só apresenta a investigação: criar tarefa ou registrar resultado exige contrato próprio.</p></section>';
  } else if (c.situacaoSweetSpot === 'fora_por_criterio') {
    s += '<section><p class="bloco__tit">Por que fora do sweet spot?</p><div class="caixa"><p>Falta ' + esc(NOMES_DIMENSAO[c.dimensoesFaltantes[0]].nome) + ', mas um valor conhecido já impede A1:</p><ul class="check">' +
      c.bloqueioA1.map((b) => '<li class="nao"><span class="marca" aria-hidden="true">✗</span><span><span class="sr">Não atende: </span>' + esc(b) + '</span><span></span></li>').join('') + '</ul></div></section>';
  } else {
    s += '<section><p class="bloco__tit">Por que sem métrica?</p><div class="caixa"><p>Faltam ' + c.dimensoesFaltantes.length + ' dimensões: ' + esc(c.dimensoesFaltantes.map((k) => NOMES_DIMENSAO[k].nome).join(', ')) + '. A conta fica fora do sweet spot até completar e volta a ser candidata quando faltar só uma.</p></div></section>';
  }

  // 5. Por que esta conta? evidências com fontes e datas
  const evids = DIMENSOES.filter((k) => c.dimensoes[k].resumo || c.dimensoes[k].fontes.length);
  s += '<section><p class="bloco__tit">Por que esta conta?</p>';
  if (c.conta.evidenciaPrincipal) s += '<p style="margin-bottom:8px"><b>' + esc(c.conta.evidenciaPrincipal) + '</b></p>';
  if (evids.length) {
    s += '<ul class="evids">' + evids.map((k) => {
      const d = c.dimensoes[k];
      const fontes = d.fontes.map((f) => '<a href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">' + esc(f.titulo || new URL(f.url).hostname) + '</a>').join(', ');
      return '<li><b>' + esc(NOMES_DIMENSAO[k].curto) + ':</b> ' + esc(d.resumo || 'Sem resumo no snapshot.') + '<span class="fonte">' + (fontes || 'Sem fonte informada') + (d.dataReferencia ? ' · ' + fmtData(d.dataReferencia) : '') + '</span></li>';
    }).join('') + '</ul>';
  } else s += '<p class="sub" style="white-space:normal">Nenhuma evidência resumida disponível para esta conta.</p>';
  s += '</section>';

  // 6. O que falta validar?
  /** @type {string[]} */
  const lacunas = [];
  for (const k of DIMENSOES) {
    const d = c.dimensoes[k];
    if (d.nota == null) lacunas.push(NOMES_DIMENSAO[k].nome + ': ' + (d.motivoExclusao || textoEstadoDimensao(d)));
    else if (!d.entraNoCalculo) lacunas.push(NOMES_DIMENSAO[k].nome + ': ' + d.motivoExclusao);
    for (const p of d.pendenciasQualidade) lacunas.push(NOMES_DIMENSAO[k].nome + ': pendência de qualidade — ' + p);
    if (d.nota != null && !d.fontes.length) lacunas.push(NOMES_DIMENSAO[k].nome + ': nota sem fonte informada.');
  }
  s += '<section><p class="bloco__tit">O que falta validar?</p>' + (lacunas.length ? '<ul class="lacunas">' + lacunas.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul>' : '<p>Nada pendente nas quatro dimensões.</p>') + '</section>';

  // 7. Regras oficiais (contrato atual), separadas da camada experimental
  const of = c.conta.oficial;
  const acao = textoAcao(of.acaoRecomendada);
  s += '<section><p class="bloco__tit">Regras oficiais · contrato atual</p><div class="oficial">' +
    '<p><span class="tag">Ação recomendada</span><br>' + (acao ? esc(acao.texto) + (acao.bloqueio ? '<br><b>Bloqueio: ' + esc(acao.bloqueio) + '</b>' : '') : 'Nenhuma ação recomendada oficial disponível.') + '</p>' +
    '<p><span class="tag">VSCS</span> <b class="num">' + (of.score == null ? '—' : esc(String(of.score).replace('.', ','))) + '</b>' + (of.vscsStatus ? ' · ' + esc(of.vscsStatus) : '') + (of.tierIcp ? ' &nbsp; <span class="tag">Tier ICP</span> <b>' + esc(of.tierIcp) + '</b>' : '') + '</p>' +
    (of.contatoAtivavel == null ? '' : '<p><span class="tag">Contato</span> ' + (of.contatoAtivavel ? 'ativável pelas regras oficiais' : 'não ativável pelas regras oficiais') + '</p>') +
    '<p class="sub" style="white-space:normal">A prioridade integrada não substitui o VSCS nem o Tier ICP. ' + esc(AVISO_ABORDAGEM) + '</p></div></section>';

  s += '<p class="sub" style="white-space:normal">Modelo ' + esc(c.versaoModelo) + (ctx.modoApresentacao ? ' · modo apresentação' : '') + ' · situação: ' + esc(ROTULO_SS[c.situacaoSweetSpot]) + '</p>';
  return s + '</div>';
}

/**
 * Comparação lado a lado de até três contas (seção 6.5). Escala idêntica,
 * sem sobrepor polígonos.
 * @param {Conta[]} contas
 */
export function comparacao(contas) {
  let s = '<div class="comp-grade">' + contas.map((c) => '<article class="comp-card"><h3>' + esc(c.conta.nome) + '</h3><p class="sub">' + esc(c.conta.setor || 'Sem setor') + '</p><div style="margin:6px 0">' + seloClasse(c) + '</div><div class="losango-box">' + losango(c.dimensoes, { titulo: c.conta.nome, tamanho: 260 }) + '</div></article>').join('') + '</div>';
  /** @param {string} rot @param {(c: Conta) => string} f */
  const lin = (rot, f) => '<tr><th scope="row">' + esc(rot) + '</th>' + contas.map((c) => '<td>' + f(c) + '</td>').join('') + '</tr>';
  s += '<div class="quadro"><table class="tabela"><caption>Mesma escala de 1 a 5 em todas as contas. ' + esc(MODELO.rotuloPrioridade) + '.</caption><thead><tr><th scope="col" style="text-align:left;padding-left:14px">Medida</th>' + contas.map((c) => '<th scope="col">' + esc(c.conta.nome) + '</th>').join('') + '</tr></thead><tbody>' +
    lin('Prioridade integrada', (c) => c.classeIntegrada || (c.situacaoSweetSpot === 'candidata' ? 'Candidata' : 'Sem classe')) +
    lin('Nota integrada', (c) => '<span class="num">' + fmtNotaIntegrada(c.notaIntegrada) + '</span>') +
    DIMENSOES.map((k) => lin(NOMES_DIMENSAO[k].nome, (c) => { const d = c.dimensoes[k]; return valida(d) ? '<span class="num">' + fmtNota(d.nota) + '</span>' : esc(textoEstadoDimensao(d)); })).join('') +
    lin('Cobertura', (c) => c.cobertura + ' de 4') +
    lin('Proximidade do sweet spot', (c) => esc(textoProximidade(c).principal)) +
    lin('Limite de A1 (nota)', () => '≥ ' + fmtLimite(MODELO.classes.A1.nota)) +
    '</tbody></table></div>';
  return s;
}

export { ico };
