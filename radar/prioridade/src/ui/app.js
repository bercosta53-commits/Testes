// @ts-check
/**
 * Página "Prioridade de contas": estado, renderização e eventos.
 * Lê o snapshot por uma fonte injetada; nunca escreve no snapshot.
 */
import { DIMENSOES, NOMES_DIMENSAO } from '../config.js';
import { adaptarSnapshot } from '../adaptador.js';
import {
  aplicarFiltros, atalhos, descreverFiltros, descreverOrdem, faixaDaCelula, filtroDoSegmento, filtrosVazios, normalizar, ordenar, sugestoes
} from '../consulta.js';
import { COLUNAS_OPCIONAIS, MAX_COMPARAR, escreverUrl, lerUrl } from '../estado-url.js';
import { fmtData } from '../numeros.js';
import { barraAtalhos, barraFiltros, chipsFiltros, conteudoGrupo, faixa, metodologia, plural } from './componentes.js';
import { SIMBOLOS, esc, ico } from './html.js';
import { comparacao, painelConta } from './painel.js';
import { cruzamento, lista, matriz, resumoDoSetor } from './visoes.js';

/** @typedef {import('../tipos').VisaoIntegradaConta} Conta */
/** @typedef {import('../tipos').Mapeamento} Mapeamento */
/** @typedef {import('../tipos').Snapshot} Snapshot */
/** @typedef {import('../consulta.js').Filtros} Filtros */

/**
 * @typedef {{
 *   carregar: () => Promise<{ snapshot: Snapshot, mapeamento: Mapeamento }>,
 *   modoApresentacao?: boolean,
 *   fixture?: boolean,
 *   rotas?: { clima?: string | null, sinais?: string | null },
 *   climaVinculadoAoSetor?: boolean,
 *   logo?: string
 * }} OpcoesPagina
 */

const PREF_METODO = 'velora-radar:metodologia';
/** @param {string} k */
function lerPref(k) { try { return window.localStorage.getItem(k); } catch { return null; } }
/** @param {string} k @param {string} v */
function gravarPref(k, v) { try { window.localStorage.setItem(k, v); } catch { /* sem armazenamento: segue sem lembrar */ } }

/** @param {Filtros} f */
const copiaFiltros = (f) => /** @type {Filtros} */ (JSON.parse(JSON.stringify(f)));

/**
 * @param {HTMLElement} raiz
 * @param {OpcoesPagina} opcoes
 */
export function iniciar(raiz, opcoes) {
  /** @type {import('../tipos').ResultadoAdaptador | null} */
  let dados = null;
  /** @type {Mapeamento | null} */
  let mapa = null;
  /** @type {string | null} */
  let erro = null;
  let carregando = true;
  let st = lerUrl(location.search);
  const ui = {
    /** @type {string | null} */ popover: null,
    metodo: lerPref(PREF_METODO) !== 'recolhido',
    regra: false, origem: false,
    /** @type {string | null} */ termo: null,
    sugIdx: -1, sugAberta: false,
    folha: false,
    /** @type {Filtros | null} */ rascunho: null,
    /** @type {string | null} */ destaque: null,
    scrollLista: 0,
    toast: ''
  };
  let toastTimer = 0;
  const modo = !!opcoes.modoApresentacao;

  /* ---------- Shell (montado uma vez) ---------- */
  const logo = opcoes.logo ? '<img src="' + esc(opcoes.logo) + '" alt="Velora">' : '<b style="color:#fff;font-family:var(--f-display)">Velora</b>';
  const navExtra = [
    opcoes.rotas?.sinais ? '<a class="nav__item" href="' + esc(opcoes.rotas.sinais) + '">' + ico('sinal') + 'Sinais</a>' : '',
    opcoes.rotas?.clima ? '<a class="nav__item" href="' + esc(opcoes.rotas.clima) + '">' + ico('clima') + 'Clima do setor</a>' : ''
  ].join('');
  raiz.classList.add('radar-raiz');
  raiz.innerHTML = SIMBOLOS +
    '<div class="app" id="app"><aside class="lateral" aria-label="Navegação"><div class="lateral__logo">' + logo + '</div>' +
    '<nav class="nav" aria-label="Seções do Radar"><span class="nav__item" aria-current="page">' + ico('prio') + 'Prioridade de contas</span>' + navExtra + '</nav>' +
    '<div class="lateral__pe"><p class="sinc" id="sinc"></p></div></aside>' +
    '<div class="principal"><header class="topo"><span class="topo__logo">' + (opcoes.logo ? '<img class="topo__logo" src="' + esc(opcoes.logo) + '" alt="Velora">' : '') + '</span>' +
    '<p class="trilha">Radar' + ico('dir') + '<b>Prioridade de contas</b></p>' +
    '<div class="busca" role="search">' + ico('busca') + '<label class="sr" for="busca">Buscar empresa ou setor</label>' +
    '<input id="busca" type="search" autocomplete="off" spellcheck="false" placeholder="Buscar empresa ou setor" role="combobox" aria-expanded="false" aria-controls="sugestoes" aria-autocomplete="list">' +
    '<button type="button" class="busca__limpar" data-acao="limpar-busca" aria-label="Limpar busca" hidden>' + ico('x') + '</button><kbd aria-hidden="true">/</kbd>' +
    '<div class="sugestoes" id="sugestoes" role="listbox" aria-label="Sugestões" hidden></div></div>' +
    '<button type="button" class="btn btn--mini topo__copiar" data-acao="copiar-link" title="Copiar link desta visão">' + ico('link') + '<span>Copiar link da visão</span></button></header>' +
    '<main class="conteudo" id="conteudo"><div class="pagina" id="pagina"></div></main></div>' +
    '<div class="veu" data-acao="fechar-painel"></div>' +
    '<aside class="detalhe" id="detalhe" aria-labelledby="det-tit" hidden></aside>' +
    '<div class="bandeja" id="bandeja" role="region" aria-label="Comparação" hidden></div>' +
    '<div id="comparacao"></div><div id="folha"></div><div class="toast" id="toast" role="status" aria-live="polite" hidden></div></div>';

  const $ = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.getElementById(id));
  const busca = /** @type {HTMLInputElement} */ ($('busca'));
  busca.value = st.filtros.q;

  /* ---------- Derivados ---------- */
  function contas() { return dados ? dados.contas : []; }
  function derivar() {
    const todas = contas();
    const r = aplicarFiltros(todas, st.filtros);
    const ordenadas = ordenar(r.visiveis, st.ordem);
    const recorteFaixa = aplicarFiltros(todas, { ...st.filtros, classe: [], ss: [] }).visiveis;
    return { todas, ...r, ordenadas, recorteFaixa };
  }
  function atalhoAtivo() {
    const atual = JSON.stringify({ ...st.filtros, q: '' });
    const a = atalhos().find((x) => JSON.stringify({ ...filtrosVazios(), ...x.filtros, q: '' }) === atual);
    return a ? a.id : null;
  }

  /* ---------- URL ---------- */
  function syncUrl(push = false) {
    const url = location.pathname + escreverUrl(st) + location.hash;
    if (url === location.pathname + location.search + location.hash) return;
    if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
  }

  /* ---------- Render ---------- */
  function chaveFoco(/** @type {Element | null} */ el) {
    if (!el || el === document.body) return null;
    if (el.id) return '#' + el.id;
    const d = /** @type {HTMLElement} */ (el).dataset || {};
    return ['acao', 'grupo', 'valor', 'seg', 'col', 'id', 'dim', 'lado', 'atalho', 'pop', 'visao', 'eixo', 'ix', 'iy', 'setor'].map((k) => d[k] || '').join('|') || null;
  }
  function restaurarFoco(/** @type {string | null} */ k) {
    if (!k || document.activeElement === busca) return;
    if (k.startsWith('#')) { const el = document.getElementById(k.slice(1)); if (el) el.focus(); return; }
    for (const el of raiz.querySelectorAll('[data-acao]')) if (chaveFoco(el) === k) { /** @type {HTMLElement} */ (el).focus(); return; }
  }

  function render() {
    const foco = chaveFoco(document.activeElement);
    const pagina = $('pagina');
    $('sinc').innerHTML = dados && dados.atualizadoEm ? '<i></i><span><b>Última carga de sinais concluída</b>' + fmtData(dados.atualizadoEm) + horaDe(dados.atualizadoEm) + '<br>Não vale para todas as dimensões.</span>' : '';
    if (carregando) { pagina.innerHTML = '<div class="esqueleto" aria-busy="true" aria-label="Carregando contas"><i></i><i style="height:64px"></i><i></i><i></i><i></i><i></i></div>'; return; }
    if (erro) {
      pagina.innerHTML = '<div class="estado" role="alert"><div><h2>Não foi possível carregar as contas</h2><p>' + esc(erro) + '</p><p>Nada foi alterado no snapshot.</p><button type="button" class="btn" data-acao="tentar" style="margin-top:14px">Tentar de novo</button></div></div>';
      return;
    }
    const d = derivar();
    pagina.innerHTML = paginaHtml(d);
    renderPainel(d);
    renderBandeja();
    renderComparacao();
    renderFolha();
    renderSugestoes();
    restaurarFoco(foco);
    $('app').classList.toggle('com-detalhe', !!contaAberta());
  }

  /** @param {string} iso */
  function horaDe(iso) { const m = /T(\d{2}):(\d{2})/.exec(iso); return m ? ', ' + m[1] + ':' + m[2] : ''; }

  /** @param {ReturnType<typeof derivar>} d */
  function paginaHtml(d) {
    const f = st.filtros;
    let s = '';
    if (opcoes.fixture) s += '<p class="fixture-aviso" role="note"><b>FIXTURE DE TESTE</b> Contas, notas e fontes fictícias para desenvolvimento e capturas de tela. Não é produção.</p>';
    if (dados && dados.descartadas.length) s += '<p class="aviso" role="note">' + plural(dados.descartadas.length, 'registro do snapshot não pôde ser exibido', 'registros do snapshot não puderam ser exibidos') + ': ' + esc(dados.descartadas.map((x) => x.motivo).join('; ')) + '.</p>';

    // Cabeçalho compacto
    s += '<div class="cab"><div class="cab__tit"><h1>Prioridade de contas</h1><button type="button" class="link" data-acao="como-funciona">Como funciona</button><span class="selo-exp">Modelo experimental 1 · limites não calibrados</span></div>' +
      '<div class="cab__lado"><span class="contagem" aria-live="polite"><b>' + d.visiveis.length + '</b> de <b>' + d.total + '</b> contas</span>' +
      '<button type="button" class="alternar" data-acao="completas" aria-pressed="' + f.completas + '"><i></i>Somente avaliações completas</button></div></div>';

    s += metodologia({ aberto: ui.metodo, regra: ui.regra, origem: ui.origem, termo: ui.termo }, /** @type {Mapeamento} */ (mapa));
    s += faixa(d.recorteFaixa, f, d.total);

    // Visão, atalhos e filtros
    s += '<div class="barra"><div class="segmentos" role="group" aria-label="Visão">' +
      [['lista', 'Lista'], ['setor', 'Setor × Prioridade'], ['cruzar', 'Cruzar duas dimensões']].map(([v, r]) => '<button type="button" data-acao="visao" data-visao="' + v + '" aria-pressed="' + (st.visao === v) + '">' + r + '</button>').join('') + '</div>' + barraAtalhos(f, atalhoAtivo()) + '</div>';
    const campos = /** @type {any} */ (dados).camposDisponiveis;
    s += barraFiltros(d.todas, f, ui.popover, campos);
    const nAtivos = descreverFiltros({ ...f, q: '' }).quantidade;
    s += '<div class="filtros-movel"><button type="button" class="btn" data-acao="folha-abrir" aria-haspopup="dialog">' + ico('filtro') + 'Filtros' + (nAtivos ? ' (' + nAtivos + ')' : '') + '</button></div>';
    s += chipsFiltros(f);

    // Avisos honestos sobre o recorte
    s += avisos(d);
    if (f.setor.length === 1) s += resumoDoSetor(f.setor[0], d.visiveis, { climaVinculado: !!opcoes.climaVinculadoAoSetor, rotaClima: opcoes.rotas?.clima || null });

    if (st.visao === 'setor') s += matriz(d.visiveis, st);
    else if (st.visao === 'cruzar') s += cruzamento(d.visiveis, st);
    else s += ferramentasLista() + (d.ordenadas.length ? lista(d.ordenadas, st, ui.destaque) : vazio(d));
    return s;
  }

  function ferramentasLista() {
    const ag = [['', 'Sem agrupamento'], ['setor', 'Setor'], ['classe', 'Prioridade integrada'], ['sweetspot', 'Situação do sweet spot'], ['cobertura', 'Cobertura'], ['faltante', 'Dimensão faltante']];
    const nomesCol = { proximidade: 'Proximidade do sweet spot', evidencia: 'Evidência principal', situacao: 'Situação (cobertura e pendências)', data: 'Data da última avaliação' };
    const aberto = ui.popover === 'colunas';
    return '<div class="ferr"><div class="ferr__esq"><span>Ordem: <b>' + esc(descreverOrdem(st.ordem)) + '</b></span>' + (st.ordem.length ? '<button type="button" class="limpar" data-acao="ordem-padrao">Voltar à ordem padrão</button>' : '') + '<span class="sub" style="margin:0">Clique no cabeçalho ordena; Shift+clique soma um critério.</span></div>' +
      '<div class="ferr__dir"><label class="ordenar-movel">Ordenar por <select class="sel" data-acao="ordenar-sel">' + [['prioridade.d', 'Prioridade (padrão)'], ['nota.d', 'Nota integrada'], ['proximidade.d', 'Proximidade do sweet spot'], ['icp.d', 'ICP'], ['sinais.d', 'Sinais'], ['clima.d', 'Clima'], ['oportunidadeDigital.d', 'Oportunidade digital'], ['nome.a', 'Nome']].map(([v, r]) => '<option value="' + v + '"' + ((st.ordem[0] ? st.ordem[0].col + '.' + (st.ordem[0].dir === 1 ? 'a' : 'd') : 'prioridade.d') === v ? ' selected' : '') + '>' + r + '</option>').join('') + '</select></label>' +
      '<label>Agrupar por <select class="sel" data-acao="agrupar">' + ag.map(([v, r]) => '<option value="' + v + '"' + (st.agrupar === v ? ' selected' : '') + '>' + r + '</option>').join('') + '</select></label>' +
      '<div class="filtro"><button type="button" class="filtro__btn" data-acao="popover" data-pop="colunas" aria-expanded="' + aberto + '">Colunas' + ico('baixo') + '</button>' +
      (aberto ? '<div class="pop pop--dir" role="dialog" aria-label="Colunas visíveis"><div class="grupo-f"><p class="grupo-f__tit">Colunas<span>Conta e dimensões ficam sempre</span></p>' +
        COLUNAS_OPCIONAIS.map((c) => '<label class="opcao"><input class="chk" type="checkbox" data-acao="coluna" data-valor="' + c + '"' + (st.colunas.includes(c) ? ' checked' : '') + '><span>' + nomesCol[c] + '</span><span></span></label>').join('') + '</div></div>' : '') + '</div></div></div>';
  }

  /** @param {ReturnType<typeof derivar>} d */
  function avisos(d) {
    const f = st.filtros;
    let s = '';
    if (f.q) {
      if (d.correspondemBusca === 0) s += '<p class="aviso" role="status">Nenhuma conta ou setor com “' + esc(f.q) + '”. <button type="button" class="link" data-acao="limpar-busca">Limpar busca</button></p>';
      else if (d.buscaForaDosFiltros > 0) s += '<p class="aviso" role="status"><span>Busca “' + esc(f.q) + '”: <b>' + d.visiveis.length + '</b> no recorte atual · <b>' + d.buscaForaDosFiltros + '</b> fora dos filtros.</span><button type="button" class="link" data-acao="ver-fora">Ver fora dos filtros</button><button type="button" class="link" data-acao="limpar-busca">Limpar busca</button></p>';
    }
    if (d.foraPorSemNota > 0) {
      const partes = Object.entries(d.semNotaPorGrupo).map(([g, n]) => {
        const k = g.startsWith('faixa:') ? NOMES_DIMENSAO[/** @type {keyof typeof NOMES_DIMENSAO} */ (g.slice(6))].nome : 'nota integrada';
        return n + ' sem nota em ' + k;
      });
      s += '<p class="aviso aviso--suave" role="status">' + plural(d.foraPorSemNota, 'conta ficou', 'contas ficaram') + ' de fora do filtro de nota por não ter avaliação (' + esc(partes.join('; ')) + '). Sem nota não é nota baixa.</p>';
    }
    const completas = d.todas.filter((c) => c.cobertura === 4).length;
    if (completas === 0 && d.todas.length) {
      const faltam = DIMENSOES.filter((k) => /** @type {Mapeamento} */ (mapa).dimensoes[k].mapeamento !== 'documentado').map((k) => NOMES_DIMENSAO[k].nome + ' (' + (/** @type {Mapeamento} */ (mapa).dimensoes[k].mapeamento === 'indisponivel' ? 'indisponível' : 'pendente de mapeamento') + ')');
      s += '<p class="aviso" role="note"><span><b>Nenhuma conta tem as quatro dimensões avaliadas</b>, então não há nota integrada nem classe A1–C. ' + (faltam.length ? 'Sem mapeamento: ' + esc(faltam.join(', ')) + '. ' : '') + 'A lista mostra candidatas (1 dimensão a investigar) e contas sem métrica, sem média parcial.</span></p>';
    }
    return s;
  }

  /** @param {ReturnType<typeof derivar>} d */
  function vazio(d) {
    if (!d.total) return '<div class="quadro"><div class="vazio"><h2>Nenhuma conta no snapshot</h2><p>O snapshot carregado não tem contas monitoradas. Nada a priorizar ainda.</p></div></div>';
    return '<div class="quadro"><div class="vazio"><h2>Nenhuma conta neste recorte</h2><p>' + (st.filtros.q ? 'Busca “' + esc(st.filtros.q) + '” · ' : '') + 'Os filtros ativos não deixam nenhuma conta passar. As outras ' + d.total + ' continuam no Radar.</p><button type="button" class="btn" data-acao="limpar">Limpar filtros</button>' + (st.filtros.q ? ' <button type="button" class="btn" data-acao="limpar-busca">Limpar busca</button>' : '') + '</div></div>';
  }

  function contaAberta() { return st.conta ? contas().find((c) => c.contaId === st.conta) || null : null; }

  /** @param {ReturnType<typeof derivar>} d */
  function renderPainel(d) {
    const el = $('detalhe');
    const c = contaAberta();
    if (!c) { el.hidden = true; el.innerHTML = ''; return; }
    const i = d.ordenadas.findIndex((x) => x.contaId === c.contaId);
    const nav = i >= 0 ? '<span>Conta ' + (i + 1) + ' de ' + d.ordenadas.length + ' no recorte</span><button type="button" class="icone-btn" data-acao="painel-ant" aria-label="Conta anterior"' + (i <= 0 ? ' disabled' : '') + '>' + ico('cima') + '</button><button type="button" class="icone-btn" data-acao="painel-prox" aria-label="Próxima conta"' + (i >= d.ordenadas.length - 1 ? ' disabled' : '') + '>' + ico('baixo') + '</button>' : '<span>Fora do recorte atual</span>';
    const rolar = el.querySelector('.detalhe__rolar');
    const mesmo = el.dataset.id === c.contaId;
    const topo = mesmo && rolar ? rolar.scrollTop : 0;
    el.innerHTML = '<div class="detalhe__barra">' + nav + '<button type="button" class="icone-btn fechar" data-acao="fechar-painel" aria-label="Fechar painel da conta">' + ico('x') + '</button></div><div class="detalhe__rolar">' + painelConta(c, { posicao: i + 1, total: d.ordenadas.length, modoApresentacao: modo }) + '</div>';
    el.dataset.id = c.contaId;
    el.hidden = false;
    const r2 = el.querySelector('.detalhe__rolar'); if (r2) r2.scrollTop = topo;
  }

  function renderBandeja() {
    const el = $('bandeja');
    const sel = st.comparar.map((id) => contas().find((c) => c.contaId === id)).filter(Boolean);
    if (!sel.length) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '<span>Comparar <b>' + sel.length + '</b> de ' + MAX_COMPARAR + '</span>' + sel.map((c) => '<span class="chip">' + esc(/** @type {Conta} */ (c).conta.nome) + '<button type="button" data-acao="tirar-cmp" data-id="' + esc(/** @type {Conta} */ (c).contaId) + '" aria-label="' + esc('Tirar ' + /** @type {Conta} */ (c).conta.nome + ' da comparação') + '">' + ico('x') + '</button></span>').join('') +
      '<button type="button" class="btn btn--mini btn--primario" data-acao="abrir-cmp"' + (sel.length < 2 ? ' disabled' : '') + '>Comparar lado a lado</button><button type="button" class="btn btn--mini btn--escuro" data-acao="limpar-cmp">Limpar</button>' +
      (sel.length >= MAX_COMPARAR ? '<span class="bandeja__aviso">Limite de ' + MAX_COMPARAR + ' contas atingido: remova uma para incluir outra.</span>' : sel.length < 2 ? '<span class="bandeja__aviso">Selecione pelo menos 2 contas.</span>' : '');
  }

  function renderComparacao() {
    const el = $('comparacao');
    const sel = /** @type {Conta[]} */ (st.comparar.map((id) => contas().find((c) => c.contaId === id)).filter(Boolean));
    if (!st.comparacaoAberta || sel.length < 1) { el.innerHTML = ''; return; }
    el.innerHTML = '<div class="veu-comp" data-acao="fechar-cmp"></div><section class="comparacao" role="dialog" aria-modal="true" aria-labelledby="cmp-tit"><div class="comparacao__topo"><h2 id="cmp-tit">Comparação · ' + sel.length + ' contas</h2><span class="selo-exp">Mesma escala 1–5</span><button type="button" class="icone-btn fechar" data-acao="fechar-cmp" id="fechar-cmp" aria-label="Fechar comparação">' + ico('x') + '</button></div><div class="comparacao__corpo">' + comparacao(sel) + '</div></section>';
  }

  function renderFolha() {
    const el = $('folha');
    if (!ui.folha || !ui.rascunho) { el.innerHTML = ''; return; }
    const campos = /** @type {any} */ (dados).camposDisponiveis;
    const grupos = ['classe', 'ss', 'setor', 'cob', 'notas', 'qual'].concat(campos.contatoAtivavel || campos.acaoRecomendada || campos.uf ? ['op'] : []);
    const n = aplicarFiltros(contas(), ui.rascunho).visiveis.length;
    el.innerHTML = '<div class="veu-comp" data-acao="folha-cancelar"></div><section class="folha" role="dialog" aria-modal="true" aria-labelledby="folha-tit"><div class="folha__topo"><h2 id="folha-tit">Filtros</h2><button type="button" class="limpar" data-acao="folha-limpar">Limpar tudo</button><button type="button" class="icone-btn" style="margin-left:auto" data-acao="folha-cancelar" aria-label="Fechar sem aplicar">' + ico('x') + '</button></div>' +
      '<div class="folha__corpo">' + grupos.map((g) => conteudoGrupo(g, contas(), /** @type {Filtros} */ (ui.rascunho), campos, true)).join('') + '</div>' +
      '<div class="folha__pe"><button type="button" class="btn" data-acao="folha-cancelar">Cancelar</button><button type="button" class="btn btn--primario" data-acao="folha-aplicar" id="folha-aplicar">Aplicar · ' + n + ' contas</button></div></section>';
  }

  /* ---------- Busca com sugestões ---------- */
  function listaSugestoes() {
    const s = sugestoes(contas(), busca.value);
    return [...s.contas.map((c) => ({ tipo: 'conta', id: c.contaId, rot: c.conta.nome, sub: (c.conta.setor || 'Sem setor') + ' · ' + (c.classeIntegrada || (c.situacaoSweetSpot === 'candidata' ? 'candidata' : 'sem classe')) })),
      ...s.setores.map((x) => ({ tipo: 'setor', id: x.setor, rot: x.setor, sub: plural(x.n, 'conta', 'contas') }))];
  }
  /** @param {string} txt */
  function marcar(txt) {
    const t = normalizar(busca.value);
    if (!t) return esc(txt);
    const n = normalizar(txt);
    // Destaca o trecho só quando a normalização preserva posições.
    const i = n.indexOf(t);
    if (i < 0 || n.length !== txt.length) return esc(txt);
    return esc(txt.slice(0, i)) + '<mark>' + esc(txt.slice(i, i + t.length)) + '</mark>' + esc(txt.slice(i + t.length));
  }
  function renderSugestoes() {
    const el = $('sugestoes');
    const limpar = /** @type {HTMLElement} */ (raiz.querySelector('.busca__limpar'));
    limpar.hidden = !busca.value;
    if (!ui.sugAberta || !busca.value.trim() || !dados) { el.hidden = true; busca.setAttribute('aria-expanded', 'false'); busca.removeAttribute('aria-activedescendant'); return; }
    const itens = listaSugestoes();
    let s = '';
    const grupo = (/** @type {string} */ tipo, /** @type {string} */ rot) => {
      const gs = itens.map((x, i) => ({ ...x, i })).filter((x) => x.tipo === tipo);
      if (!gs.length) return '';
      return '<p class="sugestoes__grupo" role="presentation">' + rot + '</p>' + gs.map((x) => '<div class="sugestao" role="option" id="sug-' + x.i + '" data-acao="sugestao" data-indice="' + x.i + '" aria-selected="' + (ui.sugIdx === x.i) + '"><b>' + marcar(x.rot) + '</b><span>' + esc(x.sub) + '</span></div>').join('');
    };
    s += grupo('conta', 'Contas') + grupo('setor', 'Setores');
    if (!itens.length) s += '<p class="sugestoes__vazio">Nenhuma conta ou setor com “' + esc(busca.value) + '”.</p>';
    s += '<p class="sugestoes__dica">↑↓ navega · Enter escolhe · Esc fecha · texto livre filtra a lista</p>';
    el.innerHTML = s;
    el.hidden = false;
    busca.setAttribute('aria-expanded', 'true');
    if (ui.sugIdx >= 0) busca.setAttribute('aria-activedescendant', 'sug-' + ui.sugIdx); else busca.removeAttribute('aria-activedescendant');
  }
  /** @param {number} i */
  function escolherSugestao(i) {
    const x = listaSugestoes()[i];
    if (!x) return;
    st.filtros.q = '';
    busca.value = '';
    ui.sugAberta = false; ui.sugIdx = -1;
    if (x.tipo === 'conta') { abrirConta(x.id, true); }
    else { if (!st.filtros.setor.includes(x.id)) st.filtros.setor.push(x.id); syncUrl(); render(); }
  }

  busca.addEventListener('input', () => { st.filtros.q = busca.value; ui.sugAberta = true; ui.sugIdx = -1; syncUrl(); render(); });
  busca.addEventListener('focus', () => { if (busca.value) { ui.sugAberta = true; renderSugestoes(); } });
  busca.addEventListener('keydown', (ev) => {
    const n = listaSugestoes().length;
    if (ev.key === 'ArrowDown') { ev.preventDefault(); ui.sugAberta = true; ui.sugIdx = n ? (ui.sugIdx + 1) % n : -1; renderSugestoes(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); ui.sugIdx = n ? (ui.sugIdx - 1 + n) % n : -1; renderSugestoes(); }
    else if (ev.key === 'Enter') { ev.preventDefault(); if (ui.sugAberta && ui.sugIdx >= 0) escolherSugestao(ui.sugIdx); else { ui.sugAberta = false; renderSugestoes(); } }
    else if (ev.key === 'Escape') { ev.stopPropagation(); if (ui.sugAberta && busca.value) { ui.sugAberta = false; renderSugestoes(); } else if (busca.value) { busca.value = ''; st.filtros.q = ''; syncUrl(); render(); } else busca.blur(); }
  });

  /* ---------- Ações ---------- */
  /** @param {string} id @param {boolean} [destacar] */
  function abrirConta(id, destacar) {
    const conteudo = $('conteudo');
    if (!st.conta) ui.scrollLista = conteudo.scrollTop;
    st.conta = id;
    ui.destaque = destacar ? id : null;
    syncUrl(true);
    render();
    if (destacar) rolarAteLinha(id, 'center');
    const tit = document.getElementById('det-tit');
    if (tit && window.innerWidth <= 720) { tit.setAttribute('tabindex', '-1'); tit.focus(); }
  }
  /** Rola só a área de conteúdo (nunca o documento). @param {string} id @param {'center' | 'nearest'} modo */
  function rolarAteLinha(id, modo) {
    const tr = document.getElementById('linha-' + id);
    const area = $('conteudo');
    if (!tr) return;
    const a = area.getBoundingClientRect(), r = tr.getBoundingClientRect();
    let alvo = area.scrollTop;
    if (modo === 'center') alvo += r.top - a.top - (a.height - r.height) / 2;
    else if (r.top < a.top + 40) alvo += r.top - a.top - 40;
    else if (r.bottom > a.bottom) alvo += r.bottom - a.bottom;
    area.scrollTo({ top: Math.max(0, alvo), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function fecharConta() {
    const id = st.conta;
    st.conta = null; ui.destaque = null;
    syncUrl(true);
    render();
    $('conteudo').scrollTop = ui.scrollLista;
    const btn = id ? raiz.querySelector('.conta__abrir[data-id="' + CSS.escape(id) + '"]') : null;
    if (btn) /** @type {HTMLElement} */ (btn).focus();
  }

  /** @param {Filtros} f @param {string} grupo @param {string} valor */
  function alternar(f, grupo, valor) {
    if (grupo === 'perto') { f.perto = !f.perto; return; }
    const arr = /** @type {string[]} */ (/** @type {any} */ (f)[grupo]);
    const i = arr.indexOf(valor);
    if (i >= 0) arr.splice(i, 1); else arr.push(valor);
  }

  /** @param {string} grupo @param {string} valor */
  function tirarChip(grupo, valor) {
    const f = st.filtros;
    if (grupo === 'faixa') delete f.faixa[/** @type {keyof Filtros['faixa']} */ (valor)];
    else if (grupo === 'notaMin') f.notaMin = null;
    else if (grupo === 'perto') f.perto = false;
    else if (grupo === 'completas') f.completas = false;
    else alternar(f, grupo, valor);
  }

  function mostrarToast(/** @type {string} */ msg) {
    const el = $('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { el.hidden = true; }, 2600);
  }

  /** @param {Event} ev */
  function aoClicar(ev) {
    const alvo = /** @type {HTMLElement} */ (ev.target);
    if (ui.popover && !alvo.closest('.filtro')) { ui.popover = null; render(); }
    if (ui.sugAberta && !alvo.closest('.busca')) { ui.sugAberta = false; renderSugestoes(); }
    const el = /** @type {HTMLElement | null} */ (alvo.closest('[data-acao]'));
    if (!el || !raiz.contains(el)) return;
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) return; // tratados em 'change'
    const a = el.dataset.acao;
    const f = st.filtros;
    const mev = /** @type {MouseEvent} */ (ev);
    switch (a) {
      case 'abrir': {
        if (el.tagName === 'TR' && alvo.closest('input, button, a, label')) return;
        const id = /** @type {string} */ (el.dataset.id);
        if (st.conta === id && el.tagName !== 'TR') fecharConta(); else abrirConta(id);
        return;
      }
      case 'fechar-painel': fecharConta(); return;
      case 'painel-ant': case 'painel-prox': {
        const d = derivar();
        const i = d.ordenadas.findIndex((x) => x.contaId === st.conta);
        const j = a === 'painel-ant' ? i - 1 : i + 1;
        if (d.ordenadas[j]) { st.conta = d.ordenadas[j].contaId; syncUrl(); render(); rolarAteLinha(st.conta, 'nearest'); }
        return;
      }
      case 'segmento': {
        const x = filtroDoSegmento(/** @type {any} */ (el.dataset.seg));
        alternar(f, x.grupo, x.valor);
        break;
      }
      case 'tirar-chip': tirarChip(/** @type {string} */ (el.dataset.grupo), /** @type {string} */ (el.dataset.valor)); break;
      case 'limpar': st.filtros = { ...filtrosVazios(), q: f.q }; break;
      case 'ver-fora': st.filtros = { ...filtrosVazios(), q: f.q }; break;
      case 'limpar-busca': busca.value = ''; f.q = ''; ui.sugAberta = false; break;
      case 'popover': ui.popover = ui.popover === el.dataset.pop ? null : /** @type {string} */ (el.dataset.pop); render(); return;
      case 'atalho': {
        const at = atalhos().find((x) => x.id === el.dataset.atalho);
        if (!at) return;
        st.filtros = atalhoAtivo() === at.id ? { ...filtrosVazios(), q: f.q } : { ...filtrosVazios(), ...copiaFiltros(/** @type {any} */ ({ ...filtrosVazios(), ...at.filtros })), q: f.q };
        if (st.visao !== 'lista') st.visao = 'lista';
        break;
      }
      case 'completas': f.completas = !f.completas; break;
      case 'visao': st.visao = /** @type {any} */ (el.dataset.visao); ui.popover = null; break;
      case 'ordenar': {
        const col = /** @type {any} */ (el.dataset.col);
        const i = st.ordem.findIndex((o) => o.col === col);
        const padraoDir = col === 'nome' ? 1 : -1;
        if (mev.shiftKey) {
          if (i >= 0) st.ordem[i] = { col, dir: /** @type {1 | -1} */ (-st.ordem[i].dir) };
          else { if (!st.ordem.length) st.ordem.push({ col: 'prioridade', dir: -1 }); st.ordem.push({ col, dir: /** @type {1 | -1} */ (padraoDir) }); }
        } else if (i === 0 && st.ordem.length === 1) st.ordem = [{ col, dir: /** @type {1 | -1} */ (-st.ordem[0].dir) }];
        else st.ordem = [{ col, dir: /** @type {1 | -1} */ (padraoDir) }];
        if (st.ordem.length === 1 && st.ordem[0].col === 'prioridade' && st.ordem[0].dir === -1) st.ordem = [];
        break;
      }
      case 'ordem-padrao': st.ordem = []; break;
      case 'recolher': {
        const g = /** @type {string} */ (el.dataset.grupo);
        st.recolhidos = st.recolhidos.includes(g) ? st.recolhidos.filter((x) => x !== g) : [...st.recolhidos, g];
        break;
      }
      case 'tirar-cmp': st.comparar = st.comparar.filter((x) => x !== el.dataset.id); if (st.comparar.length < 2) st.comparacaoAberta = false; break;
      case 'limpar-cmp': st.comparar = []; st.comparacaoAberta = false; break;
      case 'abrir-cmp': st.comparacaoAberta = true; syncUrl(true); render(); document.getElementById('fechar-cmp')?.focus(); return;
      case 'fechar-cmp': st.comparacaoAberta = false; syncUrl(true); render(); /** @type {HTMLElement | null} */ (raiz.querySelector('[data-acao="abrir-cmp"]'))?.focus(); return;
      case 'metodo': ui.metodo = !ui.metodo; gravarPref(PREF_METODO, ui.metodo ? 'aberto' : 'recolhido'); render(); return;
      case 'regra': ui.regra = !ui.regra; render(); return;
      case 'origem': ui.origem = !ui.origem; render(); return;
      case 'termo': ui.termo = ui.termo === el.dataset.termo ? null : /** @type {string} */ (el.dataset.termo); render(); return;
      case 'como-funciona': {
        ui.metodo = true; ui.regra = true;
        if (window.innerWidth <= 720 && st.conta) { st.conta = null; syncUrl(true); }
        render();
        const m = document.getElementById('metodologia');
        if (m) { m.scrollIntoView({ block: 'start' }); /** @type {HTMLElement | null} */ (m.querySelector('[data-acao="metodo"]'))?.focus(); }
        return;
      }
      case 'celula-matriz': {
        const setor = /** @type {string} */ (el.dataset.setor);
        const x = filtroDoSegmento(/** @type {any} */ (el.dataset.seg));
        st.filtros = { ...filtrosVazios(), q: f.q, setor: [setor], [x.grupo]: [x.valor] };
        st.visao = 'lista';
        break;
      }
      case 'celula-cruz': {
        const ix = Number(el.dataset.ix), iy = Number(el.dataset.iy);
        f.faixa = { ...f.faixa, [st.x]: faixaDaCelula(ix), [st.y]: faixaDaCelula(iy) };
        st.visao = 'lista';
        break;
      }
      case 'sem-av-cruz': f.cob = ['falta:' + st.x, 'falta:' + st.y]; st.visao = 'lista'; break;
      case 'copiar-link': {
        const url = location.origin + location.pathname + escreverUrl(st);
        const ok = () => mostrarToast('Link da visão copiado.');
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, () => mostrarToast('Não foi possível copiar. O link está na barra de endereço.'));
        else mostrarToast('Copie o link da barra de endereço.');
        return;
      }
      case 'folha-abrir': ui.folha = true; ui.rascunho = copiaFiltros(f); render(); document.getElementById('folha-aplicar')?.focus(); return;
      case 'folha-cancelar': ui.folha = false; ui.rascunho = null; render(); return;
      case 'folha-limpar': ui.rascunho = { ...filtrosVazios(), q: f.q }; render(); return;
      case 'folha-aplicar': if (ui.rascunho) st.filtros = { ...ui.rascunho, q: f.q }; ui.folha = false; ui.rascunho = null; break;
      case 'sugestao': escolherSugestao(Number(el.dataset.indice)); return;
      case 'tentar': carregar(); return;
      default: return;
    }
    syncUrl();
    render();
  }

  /** @param {Event} ev */
  function aoMudar(ev) {
    const el = /** @type {HTMLInputElement | HTMLSelectElement} */ (ev.target);
    const a = el.dataset.acao;
    if (!a) return;
    const f = el.dataset.rascunho && ui.rascunho ? ui.rascunho : st.filtros;
    switch (a) {
      case 'filtro': alternar(f, /** @type {string} */ (el.dataset.grupo), /** @type {string} */ (el.dataset.valor)); break;
      case 'faixa': {
        const k = /** @type {keyof Filtros['faixa']} */ (el.dataset.dim);
        const atual = f.faixa[k] || { min: null, max: null };
        const v = el.value === '' ? null : Number(el.value);
        const nova = { ...atual, [/** @type {'min' | 'max'} */ (el.dataset.lado)]: v };
        if (nova.min == null && nova.max == null) delete f.faixa[k]; else f.faixa[k] = nova;
        break;
      }
      case 'notamin': f.notaMin = el.value === '' ? null : Number(el.value); break;
      case 'agrupar': st.agrupar = /** @type {any} */ (el.value); st.recolhidos = []; break;
      case 'ordenar-sel': {
        const [col, d] = el.value.split('.');
        st.ordem = col === 'prioridade' ? [] : [{ col: /** @type {any} */ (col), dir: d === 'a' ? 1 : -1 }];
        break;
      }
      case 'coluna': {
        const c = /** @type {string} */ (el.dataset.valor);
        st.colunas = st.colunas.includes(c) ? st.colunas.filter((x) => x !== c) : COLUNAS_OPCIONAIS.filter((x) => x === c || st.colunas.includes(x));
        break;
      }
      case 'comparar': {
        const id = /** @type {string} */ (el.dataset.id);
        if (st.comparar.includes(id)) st.comparar = st.comparar.filter((x) => x !== id);
        else if (st.comparar.length < MAX_COMPARAR) st.comparar = [...st.comparar, id];
        if (st.comparar.length < 2) st.comparacaoAberta = false;
        break;
      }
      case 'eixo': st[/** @type {'x' | 'y'} */ (el.dataset.eixo)] = /** @type {any} */ (el.value); break;
      case 'ordem-matriz': st.ordemMatriz = /** @type {any} */ (el.value); break;
      default: return;
    }
    if (f !== st.filtros) { render(); return; }
    syncUrl();
    render();
  }

  raiz.addEventListener('click', aoClicar);
  // Cliques fora do app (raro: o app ocupa a página) fecham o popover; ignora nós já removidos pelo render.
  document.addEventListener('click', (ev) => {
    const t = /** @type {Node} */ (ev.target);
    if (ui.popover && t.isConnected && !raiz.contains(t)) { ui.popover = null; render(); }
  });
  raiz.addEventListener('change', aoMudar);
  document.addEventListener('keydown', (ev) => {
    const t = /** @type {HTMLElement} */ (ev.target);
    const digitando = t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
    if (ev.key === '/' && !digitando) { ev.preventDefault(); busca.focus(); busca.select(); return; }
    if (ev.key === 'Escape') {
      if (ui.popover) { const p = ui.popover; ui.popover = null; render(); document.getElementById('fb-' + p)?.focus(); }
      else if (ui.folha) { ui.folha = false; ui.rascunho = null; render(); }
      else if (st.comparacaoAberta) { st.comparacaoAberta = false; syncUrl(true); render(); }
      else if (st.conta) fecharConta();
    }
  });
  window.addEventListener('popstate', () => {
    const q = st.filtros.q;
    st = lerUrl(location.search);
    if (st.filtros.q !== q) busca.value = st.filtros.q;
    render();
  });

  async function carregar() {
    carregando = true; erro = null; render();
    try {
      const r = await opcoes.carregar();
      mapa = r.mapeamento;
      dados = adaptarSnapshot(r.snapshot, r.mapeamento, { modoApresentacao: modo });
      // IDs que não existem mais saem da seleção e da comparação, sem erro.
      const ids = new Set(dados.contas.map((c) => c.contaId));
      if (st.conta && !ids.has(st.conta)) st.conta = null;
      st.comparar = st.comparar.filter((id) => ids.has(id));
    } catch (e) {
      erro = e instanceof Error ? e.message : String(e);
    }
    carregando = false;
    render();
  }
  carregar();
  return { recarregar: carregar };
}
