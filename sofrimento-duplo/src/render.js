// Desenho do painel: destaque, ranking, matrizes 2x2, barras empilhadas e tabela.
// A estrutura é criada uma vez (montar) e depois só atualizada (renderizar),
// para que as transições de CSS animem as barras.
import { CANDIDATOS, CLUBES, PERFIS } from './calc.js';
import { CENARIOS, dec, formulaCenario, formulaDerrotas, formulaRebaixamento, num, pct } from './format.js';
import { definirDica } from './dica.js';
import { misturar, tintaSobre, token } from './cores.js';

const PIOR = CENARIOS[0];

/** Último resultado desenhado; as dicas leem daqui na hora de abrir. */
let atual = null;
const refs = { ranking: new Map(), matrizes: new Map(), empilhadas: new Map(), tabela: new Map() };

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

export function montar() {
  montarLegendas();
  montarRanking();
  montarMatrizes();
  montarEmpilhadas();
  montarTabela();
  new ResizeObserver(() => atual && ajustarRotulosEmpilhadas()).observe(document.getElementById('empilhadas'));
}

export function renderizar(r, params) {
  atual = { r, params };
  renderizarDestaque(r);
  renderizarRanking(r);
  renderizarMatrizes(r);
  renderizarEmpilhadas(r);
  renderizarTabela(r);
}

/** Esmaece os gráficos enquanto as premissas estão inválidas. */
export function marcarDesatualizado(sim) {
  for (const el of document.querySelectorAll('[data-atualizavel], #destaque')) {
    el.classList.toggle('desatualizado', sim);
  }
}

// --- Legendas -------------------------------------------------------------

function montarLegendas() {
  for (const lista of document.querySelectorAll('[data-legenda-cenarios]')) {
    lista.replaceChildren(
      ...CENARIOS.map((c) =>
        h(
          'li',
          {},
          h('span', { class: 'amostra', style: `--cor: var(${c.cor})`, 'aria-hidden': 'true' }),
          c.marca ? `${c.nome} (${c.marca})` : c.nome,
        ),
      ),
    );
  }
}

// --- Destaque -------------------------------------------------------------

function renderizarDestaque(r) {
  const [lider] = r.lideres;
  const empate = r.lideres.length > 1;
  const $ = (id) => document.getElementById(id);

  $('destaque-nome').textContent = empate ? `Empate: ${juntar(r.lideres.map((p) => p.nome))}` : lider.nome;
  $('destaque-pct').textContent = pct(lider.quedaEDerrota);
  $('destaque-frase-texto').textContent = empate
    ? 'de chance do pior cenário para cada um.'
    : `de chance de ver o ${CLUBES[lider.clube]} rebaixado e ${CANDIDATOS[lider.candidato]} derrotado.`;

  $('destaque-detalhes').hidden = empate;
  if (!empate) {
    $('medidor-clube-rotulo').textContent = `${CLUBES[lider.clube]} cai`;
    $('medidor-clube-valor').textContent = pct(lider.pClube);
    $('medidor-clube').style.width = `${lider.pClube * 100}%`;
    $('medidor-cand-rotulo').textContent = `${CANDIDATOS[lider.candidato]} perde`;
    $('medidor-cand-valor').textContent = pct(1 - lider.pCand);
    $('medidor-cand').style.width = `${(1 - lider.pCand) * 100}%`;
    $('destaque-derrotas').textContent = num(lider.derrotasEsperadas);
  }

  const ultimo = r.ranking.at(-1);
  $('destaque-outra-ponta').textContent = empate && r.lideres.length === r.ranking.length
    ? 'Todos os perfis estão empatados.'
    : `Na outra ponta, ${ultimo.nome}: ${pct(ultimo.quedaEDerrota)} de chance do pior cenário.`;
}

function juntar(nomes) {
  return nomes.length <= 1 ? nomes.join('') : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
}

// --- Ranking --------------------------------------------------------------

function montarRanking() {
  const raiz = document.getElementById('ranking');
  for (const perfil of PERFIS) {
    const posicao = h('span', { class: 'posicao' });
    const pior = h('strong');
    const piorRotulo = h('span', { class: 'pior', tabindex: '0' }, pior, ' no pior cenário');
    const segClube = h('span', { class: 'seg seg-clube' });
    const segCand = h('span', { class: 'seg seg-cand' });
    const valor = h('span', { class: 'valor' });
    const linha = h(
      'div',
      { class: 'ranking-linha', tabindex: '0' },
      h('div', { class: 'ranking-topo' }, posicao, h('span', { class: 'perfil-nome', text: perfil.nome }), piorRotulo),
      h('div', { class: 'trilho' }, segClube, segCand, valor),
    );
    raiz.append(linha);
    refs.ranking.set(perfil.id, { linha, posicao, pior, segClube, segCand, valor });

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
    definirDica(piorRotulo, () => ({
      valor: pct(p().quedaEDerrota, 1),
      titulo: `Pior cenário: ${clube} cai e ${cand} perde`,
      formula: formulaCenario(p(), PIOR),
    }));
    const resumo = () => ({
      valor: `${num(p().derrotasEsperadas)} derrotas esperadas`,
      titulo: perfil.nome,
      linhas: [
        { cor: '--s-clube', rotulo: `${clube} cai`, valor: pct(p().pClube, 1) },
        { cor: '--s-cand', rotulo: `${cand} perde`, valor: pct(1 - p().pCand, 1) },
        { cor: PIOR.cor, rotulo: 'Pior cenário', valor: pct(p().quedaEDerrota, 1) },
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
      `${p.posicao}º lugar: ${p.nome}. ${num(p.derrotasEsperadas)} derrotas esperadas; ${pct(p.quedaEDerrota, 1)} de chance do pior cenário.`,
    );
    ref.posicao.textContent = `${p.posicao}º`;
    ref.pior.textContent = pct(p.quedaEDerrota);
    ref.segClube.style.width = `${w1}%`;
    ref.segCand.style.left = `calc(${w1}% + 2px)`;
    ref.segCand.style.width = `max(0px, calc(${w2}% - 2px))`;
    ref.valor.style.left = `calc(${w1 + w2}% + 6px)`;
    ref.valor.textContent = num(p.derrotasEsperadas);
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
        titulo: `${clube} ${c.cai ? 'cai' : 'fica'} e ${cand} ${c.perde ? 'perde' : 'vence'} · ${perfil.nome}`,
        formula: formulaCenario(perfilAtual(perfil.id), c),
      }));
      return el;
    };

    const matriz = h(
      'figure',
      { class: 'matriz', tabindex: '0' },
      h('figcaption', {}, h('strong', { text: perfil.nome }), h('span', { text: `${clube} · ${cand}` })),
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
      // Intensidade proporcional à probabilidade, com um piso para a célula não sumir.
      const cor = misturar(fundo, token(c.cor), 0.08 + 0.92 * p[c.chave]);
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
    linhas: CENARIOS.map((c) => ({
      cor: c.cor,
      rotulo: c.marca ? `${c.nome} (${c.marca})` : c.nome,
      valor: pct(p[c.chave], 1),
    })),
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
      const el = h('span', { class: 'seg-cenario', style: `--cor: var(${c.cor})` }, rotulo);
      trilho.append(el);
      segmentos.set(c.chave, { el, rotulo });
      definirDica(el, () => ({
        valor: pct(perfilAtual(perfil.id)[c.chave], 1),
        titulo: `${c.marca ? `${c.nome} (${c.marca})` : c.nome} · ${perfil.nome}`,
        formula: formulaCenario(perfilAtual(perfil.id), c),
      }));
    }
    const linha = h(
      'div',
      { class: 'empilhada-linha', tabindex: '0' },
      h('span', { class: 'empilhada-nome', text: perfil.nome }),
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
