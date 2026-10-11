// Desenho do painel: resumo executivo, ranking, matrizes 2x2, barras empilhadas
// e tabela. A estrutura é criada uma vez (montar) e depois só atualizada
// (renderizar), para que as transições de CSS animem as barras.
import { CANDIDATOS, CLUBES, PERFIS } from './calc.js';
import {
  CENARIOS,
  COR_IDENTIDADE,
  dec,
  formulaCenario,
  formulaDerrotas,
  formulaRebaixamento,
  num,
  pct,
  pp,
} from './format.js';
import { resumoExecutivo, tituloEmpilhadas, tituloMatrizes, tituloRanking } from './narrativa.js';
import { definirDica } from './dica.js';
import { misturar, tintaSobre, token } from './cores.js';

const PIOR = CENARIOS[0];

/** Último resultado desenhado; as dicas leem daqui na hora de abrir. */
let atual = null;
const refs = { ranking: new Map(), matrizes: new Map(), empilhadas: new Map(), tabela: new Map(), resumo: [] };

function h(tag, atributos = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(atributos)) {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v);
  }
  el.append(...filhos);
  return el;
}

const perfilAtual = (id) => atual.r.perfis.find((p) => p.id === id);
const perfilBase = (id) => atual.base?.perfis.find((p) => p.id === id) ?? null;

/** Ficha de duas cores: clube à esquerda, candidato à direita. */
function chip(perfil) {
  return h(
    'span',
    { class: 'chip', 'aria-hidden': 'true' },
    h('i', { style: `background: var(${COR_IDENTIDADE[perfil.clube]})` }),
    h('i', { style: `background: var(${COR_IDENTIDADE[perfil.candidato]})` }),
  );
}

function delta(perfil) {
  const base = perfilBase(perfil.id);
  if (!base) return { texto: '—', seta: '' };
  const d = perfil.quedaEDerrota - base.quedaEDerrota;
  const arredondado = Math.round(d * 1000);
  return { texto: pp(d), seta: arredondado > 0 ? '▲' : arredondado < 0 ? '▼' : '=' };
}

export function montar() {
  montarLegendas();
  montarResumo();
  montarRanking();
  montarMatrizes();
  montarEmpilhadas();
  montarTabela();
  new ResizeObserver(() => atual && ajustarRotulosEmpilhadas()).observe(document.getElementById('empilhadas'));
}

/**
 * @param r resultado de calcPerfis com as premissas atuais
 * @param params premissas atuais
 * @param base resultado antes do jogo, para a coluna "vs. pré-jogo" (ou null)
 */
export function renderizar(r, params, base) {
  atual = { r, params, base };
  renderizarResumo(r, base, params);
  document.getElementById('fig1-titulo').textContent = tituloRanking(r);
  document.getElementById('fig2-titulo').textContent = tituloMatrizes(r);
  document.getElementById('fig3-titulo').textContent = tituloEmpilhadas(r);
  renderizarRanking(r);
  renderizarMatrizes(r);
  renderizarEmpilhadas(r);
  renderizarTabela(r);
}

/** Esmaece os gráficos enquanto as premissas estão inválidas. */
export function marcarDesatualizado(sim) {
  for (const el of document.querySelectorAll('[data-atualizavel]')) el.classList.toggle('desatualizado', sim);
}

// --- Legendas -------------------------------------------------------------

function amostra(...tokens) {
  return h(
    'span',
    { class: 'amostra', 'aria-hidden': 'true' },
    ...tokens.map((t) => h('i', { style: `background: var(${t})` })),
  );
}

function montarLegendas() {
  for (const lista of document.querySelectorAll('[data-legenda-identidade]')) {
    lista.replaceChildren(
      h('li', { class: 'legenda-grupo', text: 'Clubes' }),
      h('li', {}, amostra('--gremio'), 'Grêmio'),
      h('li', {}, amostra('--inter'), 'Inter'),
      h('li', { class: 'legenda-grupo', text: 'Candidatos' }),
      h('li', {}, amostra('--lula'), 'Lula (PT)'),
      h('li', {}, amostra('--flavio'), 'Flávio (PL)'),
    );
  }
  for (const lista of document.querySelectorAll('[data-legenda-cenarios]')) {
    lista.replaceChildren(
      h('li', {}, amostra('--c-pior'), 'Sofrimento duplo (pior)'),
      h('li', {}, amostra('--gremio', '--inter'), 'Só o clube cai (cor do clube)'),
      h('li', {}, amostra('--lula', '--flavio'), 'Só o candidato perde (cor do candidato)'),
      h('li', {}, amostra('--c-melhor'), 'Nenhuma derrota (melhor)'),
    );
  }
}

// --- Resumo executivo -----------------------------------------------------

function montarResumo() {
  const lista = document.getElementById('resumo-lista');
  for (let i = 0; i < 4; i++) {
    const rotulo = h('p', { class: 'resumo-rotulo' });
    const valor = h('p', { class: 'resumo-valor' });
    const texto = h('p', { class: 'resumo-texto' });
    const item = h('li', { class: 'resumo-item' }, rotulo, valor, texto);
    lista.append(item);
    refs.resumo.push({ item, rotulo, valor, texto });
  }
}

function renderizarResumo(r, base, params) {
  resumoExecutivo(r, base, params).forEach((achado, i) => {
    const ref = refs.resumo[i];
    ref.item.dataset.achado = achado.id;
    ref.rotulo.textContent = achado.rotulo;
    ref.valor.textContent = achado.valor;
    ref.texto.replaceChildren(...(achado.perfil && r.lideres.length === 1 ? [chip(achado.perfil)] : []), achado.texto);
  });
}

// --- Ranking --------------------------------------------------------------

function montarRanking() {
  const raiz = document.getElementById('ranking');
  const cabecalho = h(
    'div',
    { class: 'ranking-cabecalho', 'aria-hidden': 'true' },
    h('span'),
    h('span', { class: 'col-perfil', text: 'Perfil' }),
    h('span', { class: 'col-trilho', text: 'Derrotas esperadas (0 a 2)' }),
    h('span', { class: 'col-pior', text: 'Sofrimento duplo' }),
    h('span', { class: 'col-delta', text: 'vs. pré-jogo' }),
  );
  const linhas = h('div', { class: 'ranking-linhas' });
  const eixo = h(
    'div',
    { class: 'ranking-eixo', 'aria-hidden': 'true' },
    h(
      'div',
      { class: 'eixo eixo-ranking' },
      ...[
        [0, '0'],
        [0.25, '0,5'],
        [0.5, '1'],
        [0.75, '1,5'],
        [1, '2'],
      ].map(([x, t]) => h('span', { style: `--x: ${x}`, text: t })),
    ),
  );
  raiz.append(cabecalho, linhas, eixo);

  for (const perfil of PERFIS) {
    const posicao = h('span', { class: 'posicao' });
    const piorValor = h('strong');
    const pior = h('span', { class: 'pior', tabindex: '0' }, piorValor);
    const segClube = h('span', { class: 'seg', style: `background: var(${COR_IDENTIDADE[perfil.clube]})` });
    const segCand = h('span', {
      class: 'seg seg-final',
      style: `background: var(${COR_IDENTIDADE[perfil.candidato]})`,
    });
    const valor = h('span', { class: 'valor' });
    const deltaSeta = h('span', { class: 'delta-seta', 'aria-hidden': 'true' });
    const deltaTexto = h('span');
    const deltaEl = h('span', { class: 'delta' }, deltaSeta, deltaTexto);
    const linha = h(
      'div',
      { class: 'ranking-linha', tabindex: '0' },
      posicao,
      h('span', { class: 'ranking-perfil' }, chip(perfil), h('span', { class: 'perfil-nome', text: perfil.nome })),
      h('div', { class: 'trilho' }, segClube, segCand, valor),
      pior,
      deltaEl,
    );
    linhas.append(linha);
    refs.ranking.set(perfil.id, { linha, posicao, piorValor, segClube, segCand, valor, deltaSeta, deltaTexto });

    const p = () => perfilAtual(perfil.id);
    const clube = CLUBES[perfil.clube];
    const cand = CANDIDATOS[perfil.candidato];

    definirDica(segClube, () => ({
      valor: pct(p().pClube, 1),
      titulo: `Chance de o ${clube} cair · ${perfil.nome}`,
      formula: formulaRebaixamento(perfil.clube, atual.r, atual.params),
    }));
    definirDica(segCand, () => ({
      valor: pct(1 - p().pCand, 1),
      titulo: `Chance de ${cand} perder · ${perfil.nome}`,
      formula: `1 − P(${cand} vence) = 1 − ${dec(p().pCand)}`,
    }));
    definirDica(pior, () => ({
      valor: pct(p().quedaEDerrota, 1),
      titulo: `Sofrimento duplo: ${clube} cai e ${cand} perde`,
      formula: formulaCenario(p(), PIOR),
      nota: perfilBase(perfil.id) ? `Antes do jogo: ${pct(perfilBase(perfil.id).quedaEDerrota, 1)} (${delta(p()).texto}).` : null,
    }));
    const resumo = () => ({
      valor: `${num(p().derrotasEsperadas)} derrotas esperadas`,
      titulo: perfil.nome,
      linhas: [
        { cor: COR_IDENTIDADE[perfil.clube], rotulo: `${clube} cai`, valor: pct(p().pClube, 1) },
        { cor: COR_IDENTIDADE[perfil.candidato], rotulo: `${cand} perde`, valor: pct(1 - p().pCand, 1) },
        { cor: PIOR.cor(perfil), rotulo: 'Sofrimento duplo', valor: pct(p().quedaEDerrota, 1) },
      ],
      formula: formulaDerrotas(p()),
    });
    definirDica(linha, resumo);
    definirDica(valor, resumo);
  }
}

function renderizarRanking(r) {
  r.ranking.forEach((p, i) => {
    const ref = refs.ranking.get(p.id);
    const w1 = (p.pClube / 2) * 100;
    const w2 = ((1 - p.pCand) / 2) * 100;
    const d = delta(p);
    ref.linha.style.setProperty('--pos', i);
    ref.linha.classList.toggle('lider', r.lideres.includes(p));
    ref.linha.setAttribute(
      'aria-label',
      `${p.posicao}º lugar: ${p.nome}. ${num(p.derrotasEsperadas)} derrotas esperadas; ${pct(p.quedaEDerrota, 1)} de chance de sofrimento duplo; ${d.texto} contra o pré-jogo.`,
    );
    ref.posicao.textContent = `${p.posicao}º`;
    ref.piorValor.textContent = pct(p.quedaEDerrota);
    ref.segClube.style.width = `${w1}%`;
    ref.segCand.style.left = `calc(${w1}% + 2px)`;
    ref.segCand.style.width = `max(0px, calc(${w2}% - 2px))`;
    ref.valor.style.left = `calc(${w1 + w2}% + 6px)`;
    ref.valor.textContent = num(p.derrotasEsperadas);
    ref.deltaSeta.textContent = d.seta;
    ref.deltaTexto.textContent = d.texto;
  });
}

// --- Matrizes 2x2 ---------------------------------------------------------

function montarMatrizes() {
  const raiz = document.getElementById('matrizes');
  for (const perfil of PERFIS) {
    const clube = CLUBES[perfil.clube];
    const cand = CANDIDATOS[perfil.candidato];
    const celulas = new Map();

    const celula = (c) => {
      const valor = h('span', { class: 'celula-valor' });
      const el = h('div', { class: 'celula' }, valor);
      if (c.marca) el.append(h('span', { class: 'celula-marca', text: c.marca }));
      celulas.set(c.chave, { el, valor });
      definirDica(el, () => ({
        valor: pct(perfilAtual(perfil.id)[c.chave], 1),
        titulo: `${c.nome}: ${clube} ${c.cai ? 'cai' : 'fica'} e ${cand} ${c.perde ? 'perde' : 'vence'}`,
        formula: formulaCenario(perfilAtual(perfil.id), c),
      }));
      return el;
    };

    const matriz = h(
      'figure',
      { class: 'matriz', tabindex: '0' },
      h(
        'figcaption',
        {},
        h('span', { class: 'matriz-nome' }, chip(perfil), h('strong', { text: perfil.nome })),
        h('span', { class: 'matriz-sub', text: `Cai/fica: ${clube} · Perde/vence: ${cand}` }),
      ),
      h(
        'div',
        { class: 'matriz-grade' },
        h('span'),
        h('span', { class: 'eixo-col', text: 'Perde' }),
        h('span', { class: 'eixo-col', text: 'Vence' }),
        h('span', { class: 'eixo-lin', text: 'Cai' }),
        celula(CENARIOS[0]),
        celula(CENARIOS[1]),
        h('span', { class: 'eixo-lin', text: 'Fica' }),
        celula(CENARIOS[2]),
        celula(CENARIOS[3]),
      ),
    );
    raiz.append(matriz);
    refs.matrizes.set(perfil.id, { matriz, celulas });
    definirDica(matriz, () => resumoCenarios(perfilAtual(perfil.id)));
  }
}

function renderizarMatrizes(r) {
  const fundo = token('--superficie');
  for (const p of r.perfis) {
    const { matriz, celulas } = refs.matrizes.get(p.id);
    for (const c of CENARIOS) {
      const { el, valor } = celulas.get(c.chave);
      // Intensidade cresce com a probabilidade (raiz quadrada, para separar melhor
      // as faixas baixas), com um piso para a célula não sumir.
      const cor = misturar(fundo, token(c.cor(p)), 0.12 + 0.88 * Math.sqrt(p[c.chave]));
      el.style.background = cor;
      el.style.color = tintaSobre(cor);
      valor.textContent = pct(p[c.chave]);
    }
    matriz.setAttribute('aria-label', rotuloCenarios(p));
  }
}

function resumoCenarios(p) {
  return {
    titulo: p.nome,
    linhas: CENARIOS.map((c) => ({ cor: c.cor(p), rotulo: c.nome, valor: pct(p[c.chave], 1) })),
    nota: `Cai/fica: ${CLUBES[p.clube]}. Perde/vence: ${CANDIDATOS[p.candidato]}. Soma: ${pct(somaCenarios(p), 1)}.`,
  };
}

function rotuloCenarios(p) {
  return `${p.nome}: ${CENARIOS.map((c) => `${c.nome}, ${pct(p[c.chave], 1)}`).join('; ')}.`;
}

const somaCenarios = (p) => CENARIOS.reduce((s, c) => s + p[c.chave], 0);

// --- Barras empilhadas ----------------------------------------------------

function montarEmpilhadas() {
  const raiz = document.getElementById('empilhadas');
  for (const perfil of PERFIS) {
    const segmentos = new Map();
    const trilho = h('div', { class: 'empilhada-trilho' });
    for (const c of CENARIOS) {
      const rotulo = h('span', { class: 'seg-rotulo' });
      const el = h('span', { class: 'seg-cenario', style: `--cor: var(${c.cor(perfil)})` }, rotulo);
      trilho.append(el);
      segmentos.set(c.chave, { el, rotulo });
      definirDica(el, () => ({
        valor: pct(perfilAtual(perfil.id)[c.chave], 1),
        titulo: `${c.nome} · ${perfil.nome}`,
        formula: formulaCenario(perfilAtual(perfil.id), c),
      }));
    }
    const linha = h(
      'div',
      { class: 'empilhada-linha', tabindex: '0' },
      h('span', { class: 'empilhada-nome' }, chip(perfil), perfil.nome),
      trilho,
    );
    raiz.append(linha);
    refs.empilhadas.set(perfil.id, { linha, trilho, segmentos });
    definirDica(linha, () => resumoCenarios(perfilAtual(perfil.id)));
  }
}

function renderizarEmpilhadas(r) {
  for (const p of r.perfis) {
    const { linha, segmentos } = refs.empilhadas.get(p.id);
    for (const c of CENARIOS) {
      const { el, rotulo } = segmentos.get(c.chave);
      el.style.width = `${p[c.chave] * 100}%`;
      el.classList.toggle('vazio', p[c.chave] < 0.0005);
      rotulo.textContent = pct(p[c.chave]);
      rotulo.style.color = tintaSobre(token(c.cor(p)));
    }
    linha.setAttribute('aria-label', rotuloCenarios(p));
  }
  ajustarRotulosEmpilhadas();
}

/** Só mostra o rótulo dentro do segmento quando ele cabe com folga. */
function ajustarRotulosEmpilhadas() {
  for (const p of atual.r.perfis) {
    const { trilho, segmentos } = refs.empilhadas.get(p.id);
    const largura = trilho.clientWidth;
    for (const c of CENARIOS) {
      const { rotulo } = segmentos.get(c.chave);
      rotulo.hidden = false;
      rotulo.hidden = largura * p[c.chave] < rotulo.offsetWidth + 12;
    }
  }
}

// --- Tabela ---------------------------------------------------------------

function montarTabela() {
  const corpo = document.getElementById('tabela-corpo');
  for (const perfil of PERFIS) {
    const celulas = Array.from({ length: 9 }, () => h('td'));
    corpo.append(h('tr', {}, h('th', { scope: 'row', text: perfil.nome }), ...celulas));
    refs.tabela.set(perfil.id, celulas);
  }
}

function renderizarTabela(r) {
  for (const p of r.perfis) {
    const valores = [
      pct(p.pClube, 1),
      pct(1 - p.pCand, 1),
      ...CENARIOS.map((c) => pct(p[c.chave], 1)),
      pct(somaCenarios(p), 1),
      num(p.derrotasEsperadas),
      delta(p).texto,
    ];
    refs.tabela.get(p.id).forEach((td, i) => {
      td.textContent = valores[i];
    });
  }
}
