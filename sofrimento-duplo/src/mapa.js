// Mapa do sofrimento: cada perfil é um ponto (x = chance de o candidato perder,
// y = chance de o clube cair) sobre curvas de mesmo sofrimento duplo (x · y).
// O SVG é desenhado no tamanho real do contêiner para o texto não encolher.
import { CANDIDATOS, CLUBES, PERFIS } from './calc.js';
import { CENARIOS, formulaCenario, pct } from './format.js';
import { definirDica } from './dica.js';

const NS = 'http://www.w3.org/2000/svg';
const X0 = 0.25;
const X1 = 0.75;
const NIVEIS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
const MARGEM = { t: 30, r: 14, b: 46, l: 42 };

let raiz = null;
let svg = null;
let camadas = null;
let dims = null;
let atual = null;
const pontos = new Map();

function s(tag, atributos = {}, ...filhos) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(atributos)) el.setAttribute(k, v);
  el.append(...filhos);
  return el;
}

const sx = (x) => MARGEM.l + ((x - X0) / (X1 - X0)) * (dims.w - MARGEM.l - MARGEM.r);
const sy = (y) => MARGEM.t + (1 - y) * (dims.h - MARGEM.t - MARGEM.b);

export function montarMapa(elemento) {
  raiz = elemento;
  svg = s('svg', { class: 'mapa-svg', role: 'img', 'aria-labelledby': 'mapa-titulo' });
  camadas = { faixas: s('g'), curvas: s('g'), eixos: s('g'), pontos: s('g') };
  svg.append(camadas.faixas, camadas.curvas, camadas.eixos, camadas.pontos);
  raiz.append(svg);

  for (const perfil of PERFIS) {
    const nome = s('text', { class: 'ponto-nome' });
    nome.textContent = perfil.nome;
    const valor = s('text', { class: 'ponto-valor' });
    const rotulo = s('g', { class: 'ponto-rotulo' }, nome, valor);
    const marca = s('circle', { class: 'ponto-marca', r: 6 });
    const alvo = s('circle', { class: 'ponto-alvo', r: 16 });
    const grupo = s('g', { class: 'ponto', tabindex: 0 }, alvo, marca, rotulo);
    camadas.pontos.append(grupo);
    pontos.set(perfil.id, { grupo, marca, rotulo, nome, valor });

    definirDica(grupo, () => {
      const p = atual.perfis.find((x) => x.id === perfil.id);
      return {
        valor: `${pct(p.quedaEDerrota, 1)} de sofrimento duplo`,
        titulo: perfil.nome,
        linhas: [
          { cor: '--tinta-2', rotulo: `${CLUBES[p.clube]} cai`, valor: pct(p.pClube, 1) },
          { cor: '--tinta-2', rotulo: `${CANDIDATOS[p.candidato]} perde`, valor: pct(1 - p.pCand, 1) },
        ],
        formula: formulaCenario(p, CENARIOS[0]),
      };
    });
  }

  new ResizeObserver(() => {
    if (!atual) return;
    svg.classList.add('sem-transicao');
    desenharFundo();
    posicionar();
    requestAnimationFrame(() => svg.classList.remove('sem-transicao'));
  }).observe(raiz);
}

export function renderizarMapa(r) {
  atual = r;
  if (!dims || dims.w !== raiz.clientWidth) desenharFundo();
  posicionar();
}

/** Faixas, curvas e eixos: só mudam com o tamanho do gráfico. */
function desenharFundo() {
  const w = raiz.clientWidth;
  const h = Math.round(Math.min(430, Math.max(300, w * 0.62)));
  dims = { w, h };
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const amostras = Array.from({ length: 61 }, (_, i) => X0 + ((X1 - X0) * i) / 60);
  const ponto = (x, y) => `${sx(x).toFixed(1)},${sy(Math.min(1, y)).toFixed(1)}`;

  // Faixas entre curvas, mais escuras onde o produto é maior.
  const limites = [0, ...NIVEIS, Infinity];
  camadas.faixas.replaceChildren(
    ...limites.slice(0, -1).map((baixo, i) => {
      const alto = limites[i + 1];
      const inferior = amostras.map((x) => ponto(x, baixo / x));
      const superior = amostras.map((x) => ponto(x, alto === Infinity ? 1 : alto / x)).reverse();
      return s('path', {
        class: 'faixa',
        d: `M${inferior.join('L')}L${superior.join('L')}Z`,
        'fill-opacity': (i * 0.045).toFixed(3),
      });
    }),
  );

  // Curvas de mesmo sofrimento duplo. O valor fica na borda de cima, onde a
  // curva entra no gráfico; as curvas baixas, que não chegam lá, levam o valor
  // na borda direita. Assim os rótulos ficam longe dos pontos.
  camadas.curvas.replaceChildren(
    ...NIVEIS.flatMap((k) => {
      const xs = amostras.filter((x) => k / x <= 1.0001);
      const curva = s('path', { class: 'curva', d: `M${xs.map((x) => ponto(x, k / x)).join('L')}` });
      const noTopo = k >= X0;
      const rotulo = s('text', {
        class: 'curva-rotulo',
        x: noTopo ? sx(k) + 4 : sx(X1) - 4,
        y: noTopo ? sy(1) + 13 : sy(k / X1) - 5,
        'text-anchor': noTopo ? 'start' : 'end',
      });
      rotulo.textContent = pct(k);
      return [curva, rotulo];
    }),
  );

  // Eixos, marcas e a referência de eleição empatada.
  const base = sy(0);
  const elementos = [
    s('line', { class: 'eixo-linha', x1: sx(X0), x2: sx(X1), y1: base, y2: base }),
    s('line', { class: 'eixo-linha', x1: sx(X0), x2: sx(X0), y1: sy(1), y2: base }),
    s('line', { class: 'referencia', x1: sx(0.5), x2: sx(0.5), y1: sy(1), y2: base }),
  ];
  const texto = (conteudo, atributos) => {
    const t = s('text', atributos);
    t.textContent = conteudo;
    return t;
  };
  for (const x of [0.3, 0.4, 0.5, 0.6, 0.7]) {
    elementos.push(texto(pct(x), { class: 'eixo-texto', x: sx(x), y: base + 16, 'text-anchor': 'middle' }));
  }
  for (const y of [0, 0.25, 0.5, 0.75, 1]) {
    elementos.push(texto(pct(y), { class: 'eixo-texto', x: sx(X0) - 6, y: sy(y) + 4, 'text-anchor': 'end' }));
  }
  elementos.push(
    texto('Chance de o candidato perder →', { class: 'eixo-titulo', x: sx(X1), y: h - 6, 'text-anchor': 'end' }),
    texto('↑ Chance de o clube cair', { class: 'eixo-titulo', x: 2, y: 14 }),
    texto('eleição empatada', { class: 'referencia-texto', x: sx(0.5) + 5, y: base - 8 }),
  );
  camadas.eixos.replaceChildren(...elementos);
}

/** Move os pontos e arruma os rótulos para não se sobreporem. */
function posicionar() {
  const r = atual;
  const lideres = new Set(r.lideres.map((p) => p.id));
  const pos = new Map(r.perfis.map((p) => [p.id, { p, x: sx(1 - p.pCand), y: sy(p.pClube) }]));

  for (const { p, x, y } of pos.values()) {
    const ref = pontos.get(p.id);
    const lider = lideres.has(p.id);
    ref.grupo.style.transform = `translate(${x}px, ${y}px)`;
    ref.grupo.classList.toggle('lider', lider);
    ref.marca.setAttribute('r', lider ? 8 : 6);
    ref.valor.textContent = pct(p.quedaEDerrota);
    ref.grupo.setAttribute('aria-label', `${p.nome}: ${pct(p.quedaEDerrota, 1)} de chance de sofrimento duplo.`);
  }

  // Cada clube forma um par (pró-Lula e pró-Flávio) na mesma altura.
  const clubeDeCima = r.pRebaixa.inter > r.pRebaixa.gremio ? 'inter' : 'gremio';
  const perto = Math.abs(r.pRebaixa.gremio - r.pRebaixa.inter) * (dims.h - MARGEM.t - MARGEM.b) < 36;
  for (const clube of Object.keys(CLUBES)) {
    const [a, b] = r.perfis.filter((p) => p.clube === clube).map((p) => pos.get(p.id));
    const largura = Math.max(...[a, b].map((q) => larguraRotulo(pontos.get(q.p.id))));
    const emCima = clube === clubeDeCima;
    const lado = Math.abs(a.x - b.x) < largura + 16;
    for (const q of [a, b]) {
      const ref = pontos.get(q.p.id);
      const outro = q === a ? b : a;
      if (lado) {
        // Rótulos para fora do par: o ponto mais à direita escreve à direita.
        const direita = q.x > outro.x || (q.x === outro.x && q.p.candidato === 'lula');
        const dy = perto ? (emCima ? -10 : 10) : 0;
        colocar(ref, direita ? 'start' : 'end', direita ? 13 : -13, dy - 2, dy + 12);
      } else {
        // Pares afastados: rótulo centrado acima (par de cima) ou abaixo.
        const centro = Math.min(Math.max(q.x, largura / 2 + 2), dims.w - largura / 2 - 2);
        colocar(ref, 'middle', centro - q.x, emCima ? -26 : 20, emCima ? -12 : 34);
      }
    }
  }
}

function larguraRotulo(ref) {
  return Math.max(ref.nome.getComputedTextLength(), ref.valor.getComputedTextLength());
}

function colocar(ref, ancora, dx, yNome, yValor) {
  for (const t of [ref.nome, ref.valor]) t.setAttribute('text-anchor', ancora);
  ref.nome.setAttribute('y', yNome);
  ref.valor.setAttribute('y', yValor);
  ref.rotulo.style.transform = `translate(${dx}px, 0)`;
}
