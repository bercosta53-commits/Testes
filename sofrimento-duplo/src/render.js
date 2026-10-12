// Desenho do painel: destaque, mapa, ranking, cruzamentos e tabela. A
// estrutura é criada uma vez (montar) e depois só atualizada (renderizar),
// para que as transições de CSS animem as barras.
import { CANDIDATOS, CLUBES, PERFIS } from './calc.js';
import { CENARIOS, COR_IDENTIDADE, dec, formulaCenario, formulaDerrotas, num, pct } from './format.js';
import { fraseLider, nomeLider, tituloCruzamentos, tituloRanking } from './narrativa.js';
import { definirDica } from './dica.js';
import { misturar, tintaSobre, token } from './cores.js';
import { montarMapa, renderizarMapa } from './mapa.js';

const PIOR = CENARIOS[0];

/** Último resultado desenhado; as dicas leem daqui na hora de abrir. */
let atual = null;
const refs = { ranking: new Map(), matrizes: new Map(), empilhadas: new Map(), tabela: new Map() };
const $ = (id) => document.getElementById(id);

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

const perfilAtual = (id) => atual.perfis.find((p) => p.id === id);

/** Ficha de duas cores: clube à esquerda, candidato à direita. */
function chip(perfil) {
  return h(
    'span',
    { class: 'chip', 'aria-hidden': 'true' },
    h('i', { style: `background: var(${COR_IDENTIDADE[perfil.clube]})` }),
    h('i', { style: `background: var(${COR_IDENTIDADE[perfil.candidato]})` }),
  );
}

export function montar() {
  montarLegendas();
  montarMapa($('mapa'));
  montarRanking();
  montarMatrizes();
  montarEmpilhadas();
  montarTabela();
  new ResizeObserver(() => atual && ajustarRotulosEmpilhadas()).observe($('empilhadas'));
}

export function renderizar(r) {
  atual = r;
  renderizarLider(r);
  renderizarMapa(r);
  $('ranking-titulo').textContent = tituloRanking(r);
  $('cruz-titulo').textContent = tituloCruzamentos(r);
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

function amostra(token) {
  return h('span', { class: 'amostra', style: `background: var(${token})`, 'aria-hidden': 'true' });
}

function montarLegendas() {
  for (const lista of document.querySelectorAll('[data-legenda-identidade]')) {
    lista.replaceChildren(
      h('li', {}, amostra('--gremio'), 'Grêmio'),
      h('li', {}, amostra('--inter'), 'Inter'),
      h('li', {}, amostra('--lula'), 'Lula'),
      h('li', {}, amostra('--flavio'), 'Flávio'),
      h('li', { class: 'legenda-nota', text: '1º trecho: clube cai · 2º trecho: candidato perde' }),
    );
  }
  for (const lista of document.querySelectorAll('[data-legenda-cenarios]')) {
    lista.replaceChildren(...CENARIOS.map((c) => h('li', {}, amostra(c.cor), c.nome)));
  }
}

// --- Destaque -------------------------------------------------------------

function renderizarLider(r) {
  const [lider] = r.lideres;
  $('lider-pct').textContent = pct(lider.quedaEDerrota);
  $('lider-nome').replaceChildren(...(r.lideres.length === 1 ? [chip(lider)] : []), nomeLider(r));
  $('lider-frase').textContent = fraseLider(r);
  const ultimo = r.ranking.at(-1);
  $('outra-ponta').hidden = r.lideres.length === r.ranking.length;
  $('outra-ponta-nome').replaceChildren(chip(ultimo), ultimo.nome);
  $('outra-ponta-pct').textContent = pct(ultimo.quedaEDerrota);
  $('kpi-gremio').textContent = pct(r.pRebaixa.gremio, 1);
  $('kpi-gremio-barra').style.width = `${r.pRebaixa.gremio * 100}%`;
  $('kpi-inter').textContent = pct(r.pRebaixa.inter, 1);
  $('kpi-inter-barra').style.width = `${r.pRebaixa.inter * 100}%`;
  $('kpi-lula').textContent = pct(r.pVence.lula, Math.round(r.pVence.lula * 1000) % 10 ? 1 : 0);
  $('kpi-lula-barra').style.width = `${r.pVence.lula * 100}%`;
}

// --- Ranking --------------------------------------------------------------

function montarRanking() {
  const raiz = $('ranking');
  const cabecalho = h(
    'div',
    { class: 'ranking-cabecalho', 'aria-hidden': 'true' },
    h('span'),
    h('span', { class: 'col-perfil', text: 'Perfil' }),
    h('span', { class: 'col-trilho', text: 'Derrotas esperadas' }),
    h('span', { class: 'col-pior', text: 'Sofrimento duplo' }),
  );
  const linhas = h('div', { class: 'ranking-linhas' });
  const eixo = h(
    'div',
    { class: 'ranking-eixo', 'aria-hidden': 'true' },
    h(
      'div',
      { class: 'eixo' },
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
    const segCand = h('span', { class: 'seg seg-final', style: `background: var(${COR_IDENTIDADE[perfil.candidato]})` });
    const valor = h('span', { class: 'valor' });
    const linha = h(
      'div',
      { class: 'ranking-linha', tabindex: '0' },
      posicao,
      h('span', { class: 'ranking-perfil' }, chip(perfil), h('span', { class: 'perfil-nome', text: perfil.nome })),
      h('div', { class: 'trilho' }, segClube, segCand, valor),
      pior,
    );
    linhas.append(linha);
    refs.ranking.set(perfil.id, { linha, posicao, piorValor, segClube, segCand, valor });

    const p = () => perfilAtual(perfil.id);
    const clube = CLUBES[perfil.clube];
    const cand = CANDIDATOS[perfil.candidato];
    definirDica(segClube, () => ({
      valor: pct(p().pClube, 1),
      titulo: `Chance de o ${clube} cair`,
      nota: 'ValorFinal, dado o empate no Gre-Nal.',
    }));
    definirDica(segCand, () => ({
      valor: pct(1 - p().pCand, 1),
      titulo: `Chance de ${cand} perder`,
      formula: `1 − P(${cand} vence) = 1 − ${dec(p().pCand)}`,
    }));
    definirDica(pior, () => ({
      valor: pct(p().quedaEDerrota, 1),
      titulo: `Sofrimento duplo: ${clube} cai e ${cand} perde`,
      formula: formulaCenario(p(), PIOR),
    }));
    const resumo = () => ({
      valor: `${num(p().derrotasEsperadas)} derrotas esperadas`,
      titulo: perfil.nome,
      linhas: [
        { cor: COR_IDENTIDADE[perfil.clube], rotulo: `${clube} cai`, valor: pct(p().pClube, 1) },
        { cor: COR_IDENTIDADE[perfil.candidato], rotulo: `${cand} perde`, valor: pct(1 - p().pCand, 1) },
        { cor: PIOR.cor, rotulo: 'Sofrimento duplo', valor: pct(p().quedaEDerrota, 1) },
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
    ref.linha.style.setProperty('--pos', i);
    ref.linha.classList.toggle('lider', r.lideres.includes(p));
    ref.linha.setAttribute(
      'aria-label',
      `${p.posicao}º lugar: ${p.nome}. ${num(p.derrotasEsperadas)} derrotas esperadas; ${pct(p.quedaEDerrota, 1)} de chance de sofrimento duplo.`,
    );
    ref.posicao.textContent = `${p.posicao}º`;
    ref.piorValor.textContent = pct(p.quedaEDerrota);
    ref.segClube.style.width = `${w1}%`;
    ref.segCand.style.left = `calc(${w1}% + 2px)`;
    ref.segCand.style.width = `max(0px, calc(${w2}% - 2px))`;
    ref.valor.style.left = `calc(${w1 + w2}% + 6px)`;
    ref.valor.textContent = num(p.derrotasEsperadas);
  });
}

// --- Matrizes 2x2 (uma cor só: intensidade = probabilidade) ----------------

function montarMatrizes() {
  const raiz = $('matrizes');
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
      h('figcaption', {}, chip(perfil), h('strong', { text: perfil.nome })),
      h(
        'div',
        { class: 'matriz-grade' },
        h('span'),
        h('span', { class: 'eixo-col', text: `${cand} perde` }),
        h('span', { class: 'eixo-col', text: `${cand} vence` }),
        h('span', { class: 'eixo-lin', text: `${clube} cai` }),
        celula(CENARIOS[0]),
        celula(CENARIOS[1]),
        h('span', { class: 'eixo-lin', text: `${clube} fica` }),
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
  const acento = token('--acento');
  // Escala de calor: a célula de menor chance (entre todas as matrizes) fica
  // clara e a de maior chance, cheia.
  const valores = r.perfis.flatMap((p) => CENARIOS.map((c) => p[c.chave]));
  const [min, max] = [Math.min(...valores), Math.max(...valores)];
  for (const p of r.perfis) {
    const { matriz, celulas } = refs.matrizes.get(p.id);
    for (const c of CENARIOS) {
      const { el, valor } = celulas.get(c.chave);
      const t = max - min > 1e-9 ? (p[c.chave] - min) / (max - min) : 0.5;
      const cor = misturar(fundo, acento, 0.12 + 0.88 * t);
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
    linhas: CENARIOS.map((c) => ({ cor: c.cor, rotulo: c.nome, valor: pct(p[c.chave], 1) })),
    nota: `Soma: ${pct(somaCenarios(p), 1)}.`,
  };
}

function rotuloCenarios(p) {
  return `${p.nome}: ${CENARIOS.map((c) => `${c.nome}, ${pct(p[c.chave], 1)}`).join('; ')}.`;
}

const somaCenarios = (p) => CENARIOS.reduce((s, c) => s + p[c.chave], 0);

// --- Barras empilhadas (destaque no pior, cinzas no resto) ----------------

function montarEmpilhadas() {
  const raiz = $('empilhadas');
  for (const perfil of PERFIS) {
    const segmentos = new Map();
    const trilho = h('div', { class: 'empilhada-trilho' });
    for (const c of CENARIOS) {
      const rotulo = h('span', { class: 'seg-rotulo' });
      const el = h('span', { class: 'seg-cenario', style: `--cor: var(${c.cor})` }, rotulo);
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
      rotulo.style.color = tintaSobre(token(c.cor));
    }
    linha.setAttribute('aria-label', rotuloCenarios(p));
  }
  ajustarRotulosEmpilhadas();
}

/** Só mostra o rótulo dentro do segmento quando ele cabe com folga. */
function ajustarRotulosEmpilhadas() {
  for (const p of atual.perfis) {
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
  const corpo = $('tabela-corpo');
  for (const perfil of PERFIS) {
    const celulas = Array.from({ length: 8 }, () => h('td'));
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
    ];
    refs.tabela.get(p.id).forEach((td, i) => {
      td.textContent = valores[i];
    });
  }
}
