// @ts-check
import { DIMENSOES, MODELO, NOMES_DIMENSAO } from '../config.js';
import { origemDasNotas, textoEstadoDimensao, valida } from '../adaptador.js';
import {
  ROTULO_SEGMENTO, ROTULO_SS, SEGMENTOS, SEM_SETOR, aplicarFiltros, atalhos, contagemFaceta, descreverFiltros,
  distribuicao, ehClasse, filtroDoSegmento, rotuloCobertura
} from '../consulta.js';
import { AVISO_ABORDAGEM, TERMOS, passosMetodologia, tabelaClasses } from '../metodologia.js';
import { descreverFalta } from '../modelo.js';
import { fmtInteiro, fmtLimite, fmtMinimoExigido, fmtNota, fmtNotaIntegrada } from '../numeros.js';
import { esc, ico } from './html.js';

/** @typedef {import('../tipos').VisaoIntegradaConta} Conta */
/** @typedef {import('../tipos').ChaveDimensao} ChaveDimensao */
/** @typedef {import('../tipos').DimensaoIntegrada} DimensaoIntegrada */
/** @typedef {import('../consulta.js').Filtros} Filtros */
/** @typedef {import('../consulta.js').Segmento} Segmento */

/** Cor da rampa por segmento (só preenchimento). */
export const RAMPA = { A1: 'var(--r-a1)', A2: 'var(--r-a2)', B1: 'var(--r-b1)', B2: 'var(--r-b2)', C: 'var(--r-c)' };

/** @param {number} n @param {string} um @param {string} varios */
export const plural = (n, um, varios) => fmtInteiro(n) + ' ' + (n === 1 ? um : varios);

/* ---------- Indicadores ---------- */

/**
 * Indicador curto de dimensão: número + barra de 5 passos + rótulo acessível.
 * @param {DimensaoIntegrada} d @param {ChaveDimensao} k
 */
export function indicador(d, k) {
  const nome = NOMES_DIMENSAO[k].nome;
  if (d.nota == null) {
    const t = textoEstadoDimensao(d);
    const curto = d.motivoSemNota === 'oculto_modo_apresentacao' ? 'oculta' : d.semAchados ? 'sem achados' : d.motivoSemNota === 'fora_do_intervalo' ? 'inconsist.' : d.origem.mapeamento === 'pendente' ? 'pendente' : 's/ aval.';
    return '<div class="ind ind--sem" title="' + esc(nome + ': ' + t) + '"><span class="ind__barra" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="ind__n">' + esc(curto) + '</span><span class="sr">' + esc(nome + ': ' + t) + '</span></div>';
  }
  const velha = d.status === 'desatualizada';
  const cheios = Math.floor(d.nota + MODELO.tolerancia);
  let barra = '';
  for (let i = 1; i <= 5; i++) barra += '<i' + (i <= cheios ? ' class="on"' : '') + '></i>';
  const extra = velha ? (d.entraNoCalculo ? ' desatualizada' : ' desatualizada, fora do cálculo') : d.semAchados ? ' sem sinais encontrados' : '';
  return '<div class="ind' + (velha ? ' ind--velha' : '') + '"><span class="ind__n" aria-hidden="true">' + fmtNota(d.nota) + (velha ? ' <small>desat.</small>' : '') + '</span><span class="ind__barra" aria-hidden="true">' + barra + '</span><span class="sr">' + esc(nome + ' ' + fmtNota(d.nota) + ' de 5' + extra) + '</span></div>';
}

/** Selo da prioridade integrada (sempre com o rótulo experimental acessível). @param {Conta} c */
export function seloClasse(c) {
  if (c.classeIntegrada) {
    const k = c.classeIntegrada;
    return '<span class="classe classe--' + k + '"><span class="sr">' + esc(MODELO.rotuloPrioridade) + ': </span>' + k + (k === 'A1' ? ' · sweet spot' : '') + '</span>';
  }
  if (c.situacaoSweetSpot === 'candidata') return '<span class="classe classe--candidata">Candidata</span>';
  if (c.situacaoSweetSpot === 'fora_por_criterio') return '<span class="classe classe--fora_por_criterio">Fora · critério</span>';
  return '<span class="classe classe--sem_metrica">Sem métrica</span>';
}

/** @param {Conta} c */
export function celulaPrioridade(c) {
  if (c.notaIntegrada != null) return seloClasse(c) + '<span class="prio__n">' + fmtNotaIntegrada(c.notaIntegrada) + '</span>';
  const extra = c.situacaoSweetSpot === 'candidata' ? 'investigar · ' : '';
  return seloClasse(c) + '<span class="prio__n"><span>' + extra + c.cobertura + ' de 4 dimensões</span></span>';
}

/**
 * Proximidade do sweet spot em texto (seção 8.4 e 6.3).
 * @param {Conta} c @returns {{ principal: string, detalhe: string }}
 */
export function textoProximidade(c) {
  if (c.classeIntegrada === 'A1') return { principal: 'No sweet spot', detalhe: 'Atende os 5 critérios de A1' };
  if (c.criteriosA1) {
    const faltas = c.criteriosA1.filter((x) => !x.atendido);
    return {
      principal: 'Atende ' + c.criteriosA1Atendidos + ' de 5 critérios de A1',
      detalhe: 'Falta ' + faltas.map((x) => (x.chave === 'nota' ? 'nota' : NOMES_DIMENSAO[x.chave].curto) + ' +' + fmtLimite(Math.ceil((x.minimo - x.valor) * 100 - 1e-7) / 100)).join(' · ')
    };
  }
  if (c.investigacao) {
    const k = c.investigacao.dimensao;
    return {
      principal: 'Investigar: ' + NOMES_DIMENSAO[k].nome,
      detalhe: 'Precisa de nota ≥ ' + fmtMinimoExigido(/** @type {number} */ (c.investigacao.notaMinimaParaA1)) + ' para A1' + (c.investigacao.podeChegarA2 ? '' : ' · A2 já fora de alcance')
    };
  }
  if (c.situacaoSweetSpot === 'fora_por_criterio') return { principal: 'Fora do sweet spot por critério', detalhe: c.bloqueioA1.join(' · ') + ' · falta ' + NOMES_DIMENSAO[c.dimensoesFaltantes[0]].curto };
  return { principal: 'Sem métrica: faltam ' + c.dimensoesFaltantes.length, detalhe: 'Falta ' + c.dimensoesFaltantes.map((k) => NOMES_DIMENSAO[k].curto).join(', ') };
}

/* ---------- Faixa "Do ambiente ao sweet spot" ---------- */

const GRUPOS_FAIXA = /** @type {Array<{ rot: string, segs: Segmento[] }>} */ ([
  { rot: 'Sweet spot', segs: ['A1'] },
  { rot: 'Candidatas', segs: ['candidata'] },
  { rot: 'Aproximadas', segs: ['A2', 'B1'] },
  { rot: 'Métrica enfraquece', segs: ['B2', 'C', 'fora_por_criterio'] },
  { rot: 'Sem métrica', segs: ['sem_metrica'] }
]);

/** @param {Segmento} s @param {number} n */
function rotuloSeg(s, n) {
  if (s === 'A1') return 'sweet spot';
  if (s === 'candidata') return '1 a investigar';
  if (s === 'A2') return 'alta';
  if (s === 'B1') return 'boa';
  if (s === 'B2') return 'monitorar';
  if (s === 'C') return 'baixa';
  if (s === 'fora_por_criterio') return '1 faltando, fora';
  return '2+ faltando';
}

/**
 * Equivalente textual da faixa.
 * @param {ReturnType<typeof distribuicao>} d
 */
export function textoFaixa(d) {
  const p = d.porSegmento;
  return fmtInteiro(d.total) + ' contas no recorte, ' + fmtInteiro(d.completas) + ' com as quatro dimensões: ' +
    p.A1 + ' em A1, ' + p.candidata + ' candidatas com 1 dimensão a investigar, ' + p.A2 + ' em A2, ' + p.B1 + ' em B1, ' + p.B2 + ' em B2, ' + p.C + ' em C, ' +
    p.fora_por_criterio + ' com 1 dimensão faltando e fora do sweet spot por critério, ' + p.sem_metrica + ' sem métrica por terem 2 ou mais dimensões faltando.';
}

/**
 * @param {Conta[]} contasRecorte contas do recorte, sem os filtros de classe e sweet spot
 * @param {Filtros} f
 * @param {number} totalMonitoradas
 */
export function faixa(contasRecorte, f, totalMonitoradas) {
  const d = distribuicao(contasRecorte);
  const semCompletas = d.completas === 0;
  const total = Math.max(1, d.total);
  /** @param {Segmento} s */
  const ativo = (s) => { const x = filtroDoSegmento(s); return (x.grupo === 'classe' ? /** @type {string[]} */ (f.classe) : /** @type {string[]} */ (f.ss)).includes(x.valor); };
  let trilho = '';
  GRUPOS_FAIXA.forEach((g, gi) => {
    let segs = g.segs;
    const classes = segs.filter(ehClasse);
    if (semCompletas && classes.length === segs.length) {
      // Sem avaliações completas não há classes a mostrar: a faixa diz isso em texto.
      if (gi === 0) trilho += '<div class="faixa__grupo" style="flex:0 1 auto"><span class="faixa__rot">' + esc(g.rot) + '</span><p class="faixa__nota">Nenhuma conta com as quatro dimensões avaliadas: sem A1 a exibir.</p></div><span class="faixa__seta" aria-hidden="true">' + ico('dir') + '</span>';
      return;
    }
    if (semCompletas) segs = segs.filter((s) => !ehClasse(s));
    const n = segs.reduce((t, s) => t + d.porSegmento[s], 0);
    trilho += '<div class="faixa__grupo" style="flex:' + Math.max(n / total, 0.001).toFixed(3) + ' 1 auto"><span class="faixa__rot">' + esc(g.rot) + '</span><div class="faixa__segs">';
    for (const s of segs) {
      const c = d.porSegmento[s];
      const a = ativo(s);
      trilho += '<button type="button" class="seg seg--' + s + '" style="flex:' + Math.max(c / total, 0.001).toFixed(3) + ' 1 0" data-acao="segmento" data-seg="' + s + '" aria-pressed="' + a + '"' + (c === 0 && !a ? ' disabled' : '') +
        ' aria-label="' + esc(ROTULO_SEGMENTO[s] + ': ' + c + (a ? '. Filtro ativo; clique para remover' : '. Clique para filtrar')) + '">' +
        '<span class="seg__barra" aria-hidden="true"></span><span class="seg__txt" aria-hidden="true">' + (ehClasse(s) ? '<b>' + s + '</b> ' : '') + '<b>' + c + '</b><span>' + esc(rotuloSeg(s, c)) + '</span></span></button>';
    }
    trilho += '</div></div>';
    if (gi < GRUPOS_FAIXA.length - 1) trilho += '<span class="faixa__seta" aria-hidden="true">' + ico('dir') + '</span>';
  });
  const recorte = d.total !== totalMonitoradas;
  return '<section class="faixa" aria-labelledby="faixa-tit">' +
    '<div class="faixa__amb"><span class="faixa__rot" id="faixa-tit">Ambiente</span><p><b>' + fmtInteiro(d.total) + '</b><span>' + (recorte ? 'no recorte, de ' + fmtInteiro(totalMonitoradas) : 'contas monitoradas') + '</span></p><span>' + fmtInteiro(d.completas) + ' com as 4 dimensões</span></div>' +
    '<div class="faixa__trilho" role="group" aria-label="Do ambiente ao sweet spot. Clique num segmento para filtrar a lista.">' + trilho + '</div>' +
    '<p class="sr">' + esc(textoFaixa(d)) + '</p></section>';
}

/** Mini-faixa de distribuição para cabeçalhos de grupo e resumo do setor. @param {Conta[]} contas */
export function miniDist(contas) {
  const d = distribuicao(contas);
  let s = '';
  for (const seg of SEGMENTOS) {
    const n = d.porSegmento[seg];
    if (!n) continue;
    s += '<i class="' + seg + '" style="flex:' + n + ';' + (ehClasse(seg) ? '--r:' + RAMPA[/** @type {keyof typeof RAMPA} */ (seg)] : '') + '"></i>';
  }
  const txt = SEGMENTOS.filter((x) => d.porSegmento[x]).map((x) => ROTULO_SEGMENTO[x] + ' ' + d.porSegmento[x]).join(', ');
  return '<span class="mini-dist" aria-hidden="true" style="display:inline-flex">' + s + '</span><span class="sr">' + esc(txt) + '</span>';
}

/* ---------- Metodologia ---------- */

/** @param {string} termo @param {string} rotulo @param {string | null} aberto */
export function termo(termo, rotulo, aberto) {
  const id = 'def-' + termo.replace(/\s+/g, '-');
  const a = aberto === termo;
  return '<button type="button" class="termo" data-acao="termo" data-termo="' + esc(termo) + '" aria-expanded="' + a + '" aria-controls="' + id + '">' + esc(rotulo) + '</button>' +
    (a ? '<span class="definicao" id="' + id + '" role="note">' + esc(/** @type {Record<string, string>} */ (TERMOS)[termo]) + '</span>' : '');
}

/**
 * @param {{ aberto: boolean, regra: boolean, origem: boolean, termo: string | null }} ui
 * @param {import('../tipos').Mapeamento} mapa
 */
export function metodologia(ui, mapa) {
  const passos = passosMetodologia();
  const topo = '<div class="metodo__topo"><h2 id="metodo-tit">Como ler a prioridade</h2><span class="selo-exp">' + esc(MODELO.selo) + '</span>' +
    '<button type="button" class="btn btn--mini btn--sem-borda metodo__alternar" data-acao="metodo" aria-expanded="' + ui.aberto + '" aria-controls="metodo-corpo">' + (ui.aberto ? 'Recolher' : 'Mostrar os 5 passos') + ico('baixo') + '</button></div>';
  if (!ui.aberto) return '<section class="metodo" id="metodologia" aria-labelledby="metodo-tit">' + topo + '</section>';
  /** @param {string} t */
  const comTermos = (t) => {
    let s = esc(t);
    s = s.replace(/^Nota integrada/, () => termo('nota integrada', 'Nota integrada', ui.termo));
    s = s.replace(/^Travas/, () => termo('trava', 'Travas', ui.termo));
    s = s.replace(/A1 sweet spot/, () => 'A1 ' + termo('sweet spot', 'sweet spot', ui.termo));
    s = s.replace(/segue candidata/, () => 'segue ' + termo('candidata', 'candidata', ui.termo));
    return s;
  };
  let corpo = '<ol class="passos">' + passos.map((p, i) => '<li class="passo"><span class="passo__n" aria-hidden="true">' + (i + 1) + '</span><p class="passo__t">' + comTermos(p.titulo) + '</p><p class="passo__d">' + comTermos(p.detalhe) + '</p></li>').join('') + '</ol>';
  corpo += '<div class="metodo__pe"><p><b>' + esc(AVISO_ABORDAGEM) + '</b></p>' +
    '<button type="button" class="link" data-acao="regra" aria-expanded="' + ui.regra + '">' + (ui.regra ? 'Ocultar regra completa' : 'Ver regra completa') + '</button>' +
    '<button type="button" class="link" data-acao="origem" aria-expanded="' + ui.origem + '">' + (ui.origem ? 'Ocultar origem das notas' : 'Ver origem de cada nota') + '</button></div>';
  if (ui.regra) {
    corpo += '<table class="regras"><caption class="sr">Regra completa das classes, aplicada nesta ordem</caption><thead><tr><th>Ordem</th><th>Classe</th><th>Regra proposta</th><th>Leitura</th><th>Exemplo (calculado)</th></tr></thead><tbody>' +
      tabelaClasses().map((l, i) => '<tr><td class="num">' + (i + 1) + '</td><td><b>' + l.classe + '</b></td><td>' + esc(l.regra) + '</td><td>' + esc(l.leitura) + '</td><td class="ex">' + esc(l.exemplo) + '</td></tr>').join('') +
      '</tbody></table><p class="passo__d" style="margin-top:8px">Só avaliações completas recebem classe. Como C vem primeiro, B1 e B2 já têm ICP ≥ ' + fmtLimite(MODELO.classes.C.icpAbaixoDe) + '. Comparações usam tolerância fixa de ' + String(MODELO.tolerancia).replace('.', ',') + ', sem arredondar a nota.</p>';
  }
  if (ui.origem) corpo += tabelaOrigem(mapa);
  return '<section class="metodo" id="metodologia" aria-labelledby="metodo-tit">' + topo + '<div class="metodo__corpo" id="metodo-corpo">' + corpo + '</div></section>';
}

/** Origem das notas: método original → escala visual (seção 5.3). @param {import('../tipos').Mapeamento} mapa */
export function tabelaOrigem(mapa) {
  const linhas = origemDasNotas(mapa);
  return '<table class="origem-t" style="margin-top:12px"><caption class="sr">Origem das notas</caption><thead><tr><th>Eixo</th><th>Fonte no projeto</th><th>Escala original</th><th>Transformação</th><th>Mapeamento</th></tr></thead><tbody>' +
    linhas.map((l) => '<tr><td><b>' + esc(l.eixo) + '</b></td><td><code>' + esc(l.fonte) + '</code></td><td>' + esc(l.escalaOriginal) + '</td><td><code>' + esc(l.transformacao) + '</code></td><td>' + esc(l.estado) + '</td></tr>').join('') +
    '</tbody></table><p class="passo__d" style="margin-top:6px">Dimensão sem mapeamento documentado não entra no cálculo. ' + esc(mapa.rotulo) + '.</p>';
}

/* ---------- Filtros ---------- */

/**
 * @param {string} grupo @param {string} valor @param {string} rotulo @param {boolean} marcado @param {number | null} n
 * @param {boolean} [rascunho]
 */
function opcao(grupo, valor, rotulo, marcado, n, rascunho) {
  return '<label class="opcao"><input class="chk" type="checkbox" data-acao="filtro" data-grupo="' + grupo + '" data-valor="' + esc(valor) + '"' + (rascunho ? ' data-rascunho="1"' : '') + (marcado ? ' checked' : '') + '><span>' + esc(rotulo) + '</span>' + (n == null ? '' : '<span class="num">' + n + '</span>') + '</label>';
}

/**
 * Conteúdo de cada grupo de filtro (usado nos popovers e na folha do celular).
 * @param {string} grupo @param {Conta[]} contas @param {Filtros} f
 * @param {import('../tipos').ResultadoAdaptador['camposDisponiveis']} campos
 * @param {boolean} [rascunho]
 */
export function conteudoGrupo(grupo, contas, f, campos, rascunho) {
  const r = !!rascunho;
  if (grupo === 'classe') {
    const m = contagemFaceta(contas, f, 'classe', (c) => (c.classeIntegrada ? [c.classeIntegrada] : []));
    return '<div class="grupo-f"><p class="grupo-f__tit">Prioridade integrada (experimental)<span>seleção múltipla</span></p>' +
      MODELO.ordemClasses.map((k) => opcao('classe', k, k + ' · ' + MODELO.leituraClasse[k].curto, f.classe.includes(k), m.get(k) || 0, r)).join('') + '</div>';
  }
  if (grupo === 'ss') {
    const m = contagemFaceta(contas, f, 'ss', (c) => [c.situacaoSweetSpot]);
    return '<div class="grupo-f"><p class="grupo-f__tit">Sweet spot<span>mesmos segmentos da faixa</span></p>' +
      /** @type {Array<keyof typeof ROTULO_SS>} */ (['a1', 'candidata', 'fora_por_classe', 'fora_por_criterio', 'fora_por_falta_de_dados']).map((k) => opcao('ss', k, ROTULO_SS[k], f.ss.includes(k), m.get(k) || 0, r)).join('') + '</div>';
  }
  if (grupo === 'setor') {
    const m = contagemFaceta(contas, f, 'setor', (c) => [c.conta.setor ?? SEM_SETOR]);
    const todos = [...new Set(contas.map((c) => c.conta.setor).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'pt'));
    return '<div class="grupo-f"><p class="grupo-f__tit">Setor ou vertical<span>seleção múltipla</span></p>' +
      todos.map((s) => opcao('setor', /** @type {string} */ (s), /** @type {string} */ (s), f.setor.includes(/** @type {string} */ (s)), m.get(/** @type {string} */ (s)) || 0, r)).join('') +
      opcao('setor', SEM_SETOR, 'Sem setor', f.setor.includes(SEM_SETOR), m.get(SEM_SETOR) || 0, r) + '</div>';
  }
  if (grupo === 'cob') {
    const ops = ['completa', '3de4', '2menos', ...DIMENSOES.map((k) => 'falta:' + k)];
    const m = contagemFaceta(contas, f, 'cob', (c) => ops.filter((op) => (op === 'completa' ? c.cobertura === 4 : op === '3de4' ? c.cobertura === 3 : op === '2menos' ? c.cobertura <= 2 : c.dimensoesFaltantes.includes(/** @type {any} */ (op.slice(6))))));
    return '<div class="grupo-f"><p class="grupo-f__tit">Cobertura<span>fila de investigação</span></p>' + ops.map((op) => opcao('cob', op, rotuloCobertura(op).replace(/^./, (x) => x.toUpperCase()), f.cob.includes(op), m.get(op) || 0, r)).join('') + '</div>';
  }
  if (grupo === 'notas') {
    const passos = [];
    for (let v = MODELO.escala.min; v <= MODELO.escala.max + 1e-9; v += MODELO.passoFiltroNota) passos.push(v);
    const linhas = DIMENSOES.map((k) => {
      const fx = f.faixa[k] || { min: null, max: null };
      const sMin = '<select class="sel" aria-label="' + esc(NOMES_DIMENSAO[k].nome + ': nota mínima') + '" data-acao="faixa" data-dim="' + k + '" data-lado="min"' + (r ? ' data-rascunho="1"' : '') + '><option value="">mín. qualquer</option>' + passos.map((v) => '<option value="' + v + '"' + (fx.min === v ? ' selected' : '') + '>≥ ' + fmtLimite(v) + '</option>').join('') + '</select>';
      const sMax = '<select class="sel" aria-label="' + esc(NOMES_DIMENSAO[k].nome + ': abaixo de') + '" data-acao="faixa" data-dim="' + k + '" data-lado="max"' + (r ? ' data-rascunho="1"' : '') + '><option value="">máx. qualquer</option>' + passos.slice(1).map((v) => '<option value="' + v + '"' + (fx.max === v ? ' selected' : '') + '>< ' + fmtLimite(v) + '</option>').join('') + '</select>';
      return '<div class="faixa-dim"><label>' + esc(NOMES_DIMENSAO[k].curto) + '</label>' + sMin + sMax + '</div>';
    }).join('');
    const nm = '<div class="faixa-dim"><label for="f-nm' + (r ? '-r' : '') + '">Integrada</label><select class="sel" id="f-nm' + (r ? '-r' : '') + '" data-acao="notamin"' + (r ? ' data-rascunho="1"' : '') + '><option value="">mín. qualquer</option>' + [2.5, 3, 3.25, 3.5, 4, 4.5].map((v) => '<option value="' + v + '"' + (f.notaMin === v ? ' selected' : '') + '>≥ ' + fmtLimite(v) + '</option>').join('') + '</select><span></span></div>';
    return '<div class="grupo-f"><p class="grupo-f__tit">Nota por dimensão<span>passos de ' + fmtLimite(MODELO.passoFiltroNota) + '</span></p><p class="grupo-f__nota">Conta sem nota na dimensão não passa no filtro; a tela avisa quantas ficaram de fora. Cada dimensão é um grupo (E).</p>' + linhas + '</div>' +
      '<div class="grupo-f"><p class="grupo-f__tit">Nota integrada<span>só avaliações completas</span></p>' + nm + '</div>' +
      '<div class="grupo-f"><p class="grupo-f__tit">Proximidade</p>' + opcao('perto', '1', 'Perto do sweet spot (' + MODELO.atalhos.pertoDoSweetSpot.criteriosMinimos + ' de 5 critérios, fora do A1)', f.perto, null, r) + '</div>';
  }
  if (grupo === 'qual') {
    const m = contagemFaceta(contas, f, 'qual', (c) => [
      ...(DIMENSOES.some((k) => c.dimensoes[k].status === 'desatualizada') ? ['desatualizada'] : []),
      ...(DIMENSOES.some((k) => c.dimensoes[k].pendenciasQualidade.length) ? ['pendencia'] : [])
    ]);
    return '<div class="grupo-f"><p class="grupo-f__tit">Qualidade e validade</p>' + opcao('qual', 'desatualizada', 'Com dado desatualizado', f.qual.includes('desatualizada'), m.get('desatualizada') || 0, r) + opcao('qual', 'pendencia', 'Com pendência de qualidade', f.qual.includes('pendencia'), m.get('pendencia') || 0, r) + '</div>';
  }
  if (grupo === 'op') {
    let s = '<div class="grupo-f"><p class="grupo-f__tit">Operação · regras oficiais<span>não são classes experimentais</span></p>';
    const m = contagemFaceta(contas, f, 'op', (c) => [...(c.conta.oficial.contatoAtivavel === true ? ['contato'] : []), ...(c.conta.oficial.acaoRecomendada != null ? ['acao'] : [])]);
    if (campos.contatoAtivavel) s += opcao('op', 'contato', 'Contato ativável', f.op.includes('contato'), m.get('contato') || 0, r);
    if (campos.acaoRecomendada) s += opcao('op', 'acao', 'Ação recomendada disponível', f.op.includes('acao'), m.get('acao') || 0, r);
    s += '</div>';
    if (campos.uf) {
      const mu = contagemFaceta(contas, f, 'uf', (c) => (c.conta.uf ? [c.conta.uf] : []));
      const ufs = [...new Set(contas.map((c) => c.conta.uf).filter(Boolean))].sort();
      s += '<div class="grupo-f"><p class="grupo-f__tit">UF</p>' + ufs.map((u) => opcao('uf', /** @type {string} */ (u), /** @type {string} */ (u), f.uf.includes(/** @type {string} */ (u)), mu.get(/** @type {string} */ (u)) || 0, r)).join('') + '</div>';
    }
    return s;
  }
  return '';
}

/** @param {Filtros} f @param {string} grupo */
export function contaAtivosGrupo(f, grupo) {
  switch (grupo) {
    case 'classe': return f.classe.length;
    case 'ss': return f.ss.length;
    case 'setor': return f.setor.length;
    case 'cob': return f.cob.length;
    case 'notas': return Object.values(f.faixa).filter((x) => x && (x.min != null || x.max != null)).length + (f.notaMin != null ? 1 : 0) + (f.perto ? 1 : 0);
    case 'qual': return f.qual.length;
    case 'op': return f.op.length + f.uf.length;
    default: return 0;
  }
}

export const GRUPOS_FILTRO = [
  { id: 'classe', rotulo: 'Prioridade' },
  { id: 'ss', rotulo: 'Sweet spot' },
  { id: 'setor', rotulo: 'Setor' },
  { id: 'cob', rotulo: 'Cobertura' },
  { id: 'notas', rotulo: 'Notas' },
  { id: 'qual', rotulo: 'Qualidade' },
  { id: 'op', rotulo: 'Regras oficiais', oficial: true }
];

/**
 * Barra de filtros (desktop), chips e frase lógica.
 * @param {Conta[]} contas @param {Filtros} f @param {string | null} popover
 * @param {import('../tipos').ResultadoAdaptador['camposDisponiveis']} campos
 */
export function barraFiltros(contas, f, popover, campos) {
  const temOficial = campos.contatoAtivavel || campos.acaoRecomendada || campos.uf;
  const botoes = GRUPOS_FILTRO.filter((g) => g.id !== 'op' || temOficial).filter((g) => g.id !== 'setor' || campos.setor || f.setor.length).map((g) => {
    const n = contaAtivosGrupo(f, g.id);
    const aberto = popover === g.id;
    return '<div class="filtro' + (g.oficial ? ' filtro--oficial' : '') + '"><button type="button" class="filtro__btn' + (n ? ' is-ativo' : '') + '" id="fb-' + g.id + '" data-acao="popover" data-pop="' + g.id + '" aria-expanded="' + aberto + '" aria-haspopup="true">' + esc(g.rotulo) + (n ? ' <span class="num">' + n + '</span>' : '') + ico('baixo') + '</button>' +
      (aberto ? '<div class="pop' + (g.id === 'op' || g.id === 'qual' ? ' pop--dir' : '') + '" role="dialog" aria-label="' + esc('Filtro: ' + g.rotulo) + '" data-pop-corpo="' + g.id + '">' + conteudoGrupo(g.id, contas, f, campos) + '</div>' : '') + '</div>';
  }).join('');
  return '<div class="filtros" role="toolbar" aria-label="Filtros">' + botoes + '</div>';
}

/** @param {Filtros} f */
export function chipsFiltros(f) {
  const d = descreverFiltros({ ...f, q: '' });
  if (!d.quantidade) return '';
  return '<div class="chips" aria-label="Filtros ativos">' + d.chips.map((c) => '<span class="chip">' + esc(c.rotulo) + '<button type="button" data-acao="tirar-chip" data-grupo="' + esc(c.grupo) + '" data-valor="' + esc(c.valor) + '" aria-label="' + esc('Remover filtro ' + c.rotulo) + '">' + ico('x') + '</button></span>').join('') +
    '<button type="button" class="limpar" data-acao="limpar">Limpar tudo</button></div>' +
    '<p class="logica">Mostrando contas com <b>' + esc(d.frase) + '</b>. <span>Dentro de um grupo vale OU; entre grupos vale E.</span></p>';
}

/** @param {Filtros} f @param {string | null} atalhoAtivo */
export function barraAtalhos(f, atalhoAtivo) {
  return '<div class="atalhos" role="group" aria-label="Atalhos de visão (experimentais)"><span class="atalhos__rot">Atalhos (experimentais):</span>' +
    atalhos().map((a) => '<button type="button" class="atalho" data-acao="atalho" data-atalho="' + a.id + '" aria-pressed="' + (atalhoAtivo === a.id) + '" title="' + esc(a.regra) + '">' + esc(a.rotulo) + '<span class="sr"> — ' + esc(a.regra) + '</span></button>').join('') + '</div>';
}

export { aplicarFiltros, descreverFalta };
