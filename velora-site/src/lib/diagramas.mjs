// Diagramas do site (briefing de design §7). Linha fina, nós retos, número mono,
// rótulo de conexão sobre a linha, etapa ativa em Acid.
import { html } from './html.mjs';
import { etapas } from '../conteudo/etapas.mjs';

const fx = (v) => Number(v.toFixed(2));
const rad = (g) => (g * Math.PI) / 180;
const anguloNo = (i) => -90 + 72 * i;

// ---------------------------------------------------------------------------
// Geometria de um anel de 5 nós (usada no ciclo do sistema e no "conectado")
// ---------------------------------------------------------------------------
function anel(G) {
  const ponto = (g, r = G.R) => [G.cx + r * Math.cos(rad(g)), G.cy + r * Math.sin(rad(g))];
  const caixa = (i) => {
    const [x, y] = ponto(anguloNo(i));
    return { x: x - G.noL / 2, y: y - G.noA / 2, l: G.noL, a: G.noA, cx: x, cy: y };
  };
  const dentro = ([px, py], c) => px > c.x - G.folga && px < c.x + c.l + G.folga && py > c.y - G.folga && py < c.y + c.a + G.folga;
  const saida = (i, sentido) => {
    const c = caixa(i);
    for (let d = 0; d < 72; d += 0.1) if (!dentro(ponto(anguloNo(i) + sentido * d), c)) return d;
    return 0;
  };
  const arco = (i) => {
    const j = (i + 1) % 5;
    const ini = anguloNo(i) + saida(i, +1);
    const fim = anguloNo(i) + 72 - saida(j, -1);
    const [x1, y1] = ponto(ini);
    const [x2, y2] = ponto(fim);
    const d = `M${fx(x1)} ${fx(y1)}A${G.R} ${G.R} 0 0 1 ${fx(x2)} ${fx(y2)}`;
    const t = [-Math.sin(rad(fim)), Math.cos(rad(fim))];
    const n = [Math.cos(rad(fim)), Math.sin(rad(fim))];
    const p = G.ponta || 7;
    const a1 = [x2 - p * t[0] + (p * 0.57) * n[0], y2 - p * t[1] + (p * 0.57) * n[1]];
    const a2 = [x2 - p * t[0] - (p * 0.57) * n[0], y2 - p * t[1] - (p * 0.57) * n[1]];
    const ponta = `M${fx(a1[0])} ${fx(a1[1])}L${fx(x2)} ${fx(y2)}L${fx(a2[0])} ${fx(a2[1])}`;
    return { d, ponta };
  };
  return { ponto, caixa, arco };
}

// ---------------------------------------------------------------------------
// 1. Ciclo do sistema (seção 03): SVG + versão vertical para telas estreitas
// ---------------------------------------------------------------------------
const C = { W: 680, H: 480, cx: 340, cy: 228, R: 180, noL: 136, noA: 56, folga: 8, rotR: 26 };
const CICLO = anel(C);

function rotuloLigacao(i, linhas) {
  const g = anguloNo(i) + 36;
  const [x, y] = CICLO.ponto(g, C.R + C.rotR);
  const cos = Math.cos(rad(g));
  const sen = Math.sin(rad(g));
  const ancora = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
  const alt = 14;
  let y0;
  if (sen < -0.5) y0 = y - alt * (linhas.length - 1) - 2;
  else if (sen > 0.5) y0 = y + 12;
  else y0 = y - (alt * (linhas.length - 1)) / 2 + 4;
  return html`<text class="ciclo__ligacao" data-de="${i + 1}" x="${fx(x)}" y="${fx(y0)}" text-anchor="${ancora}" style="--i:${i}">${linhas.map(
    (l, k) => html`<tspan x="${fx(x)}" dy="${k === 0 ? 0 : alt}">${l.toUpperCase()}</tspan>`
  )}</text>`;
}

export function cicloSvg() {
  const corpo = etapas.map((e, i) => {
    const c = CICLO.caixa(i);
    const { d, ponta } = CICLO.arco(i);
    return [
      html`<g class="ciclo__ligacao-g${i === 4 ? ' ciclo__arco--retorno' : ''}" data-de="${i + 1}" style="--i:${i}">
        <path class="ciclo__arco" id="ciclo-arco-${i + 1}" d="${d}" pathLength="1"/>
        <path class="ciclo__ponta" d="${ponta}"/>
        <circle class="ciclo__pulso" r="5" data-de="${i + 1}"><animateMotion dur="0.9s" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".4 0 .2 1" keyPoints="0;1"><mpath href="#ciclo-arco-${i + 1}"/></animateMotion></circle>
      </g>`,
      html`<a class="ciclo__no" data-no="${i + 1}" href="#${e.id}" style="--i:${i}">
        <rect x="${fx(c.x)}" y="${fx(c.y)}" width="${c.l}" height="${c.a}" rx="2"/>
        <text class="ciclo__no-n" x="${fx(c.x + 14)}" y="${fx(c.y + 22)}">${e.n}</text>
        <text class="ciclo__no-nome" x="${fx(c.x + 14)}" y="${fx(c.y + 42)}">${e.nome}</text>
      </a>`,
      rotuloLigacao(i, e.ligacao),
    ];
  });
  return html`<div class="ciclo__desenho">
    <svg class="ciclo__svg" viewBox="0 0 ${C.W} ${C.H}" role="group" aria-label="Ciclo do sistema: 01 Inteligência, 02 Acesso, 03 Demanda, 04 Conversão e 05 Medição, que volta para Inteligência">
      ${corpo}
    </svg>
    <div class="ciclo__centro" aria-hidden="true" style="top:${fx((C.cy / C.H) * 100)}%">
      ${etapas.map((e, i) => html`<div class="ciclo__resumo" data-resumo="${i + 1}">
        <p class="ciclo__resumo-n">${e.n}</p>
        <p class="ciclo__resumo-txt">${e.titulo}</p>
      </div>`)}
    </div>
  </div>`;
}

// Lista vertical ligada por uma linha contínua à esquerda (versão estreita dos ciclos).
export function cicloLista({ compacta = false } = {}) {
  return html`<ol class="ciclo-lista${compacta ? ' ciclo-lista--compacta' : ''}">
    ${etapas.map((e, i) => html`<li class="ciclo-lista__item" data-no="${i + 1}">
      <a class="ciclo-lista__no" href="#${e.id}"><span class="ciclo-lista__n">${e.n}</span><span class="ciclo-lista__nome">${e.nome}</span></a>
      <p class="ciclo-lista__ligacao${i === 4 ? ' ciclo-lista__ligacao--retorno' : ''}">${e.ligacao.join(' ')}</p>
    </li>`)}
  </ol>`;
}

// modo 'rolagem': a etapa ativa acompanha os blocos de texto da seção 03.
export function ciclo({ ativa = 1, modo = 'rolagem', classe = '' } = {}) {
  return html`<div class="ciclo desenhar ${classe}" data-ciclo data-modo="${modo}" data-ativa="${ativa}" data-padrao="${ativa}">
    ${cicloSvg()}
    ${cicloLista({ compacta: true })}
  </div>`;
}

// ---------------------------------------------------------------------------
// Trilho do hero: as cinco etapas em linha, com o retorno de Medição para Inteligência.
// Um pulso Acid percorre o caminho uma vez (5 s) e a etapa 01 acende.
// ---------------------------------------------------------------------------
export function trilho() {
  return html`<div class="trilho-bloco">
    <div class="trilho desenhar" data-trilho data-ativa="1">
      <ol class="trilho__lista" aria-label="Sistema de aquisição em cinco etapas, com retorno de Medição para Inteligência">
        ${etapas.map((e, i) => html`<li class="trilho__etapa" data-no="${i + 1}" style="--i:${i}">
          <a class="trilho__no" href="#${e.id}"><span class="trilho__marco" aria-hidden="true"></span><span class="trilho__n">${e.n}</span><span class="trilho__nome">${e.nome}</span></a>
          <p class="trilho__ligacao${i === 4 ? ' trilho__ligacao--retorno' : ''}">${i === 4 ? e.ligacao.join(' ') : e.ligacao.map((l, k) => html`<span>${l}</span>${k === 0 ? ' ' : ''}`)}</p>
        </li>`)}
      </ol>
      <span class="trilho__retorno" aria-hidden="true"></span>
      <span class="trilho__pulso" aria-hidden="true"></span>
    </div>
    <div class="ciclo ciclo--so-lista" data-ativa="1">${cicloLista({ compacta: true })}</div>
  </div>`;
}

// ---------------------------------------------------------------------------
// 4. Desconectado × conectado
// ---------------------------------------------------------------------------
const D = { W: 560, H: 420, noL: 150, noA: 46 };
const SOLTOS = [[28, 30], [346, 92], [64, 190], [372, 262], [150, 344]];
const CONECTADO = anel({ cx: 280, cy: 212, R: 152, noL: 132, noA: 44, folga: 7, ponta: 8 });

function centro([x, y]) { return [x + D.noL / 2, y + D.noA / 2]; }
// Ponto na borda do retângulo do nó, na direção (dx, dy) a partir do centro.
function borda([cx, cy], dx, dy, l, a) {
  const tx = dx ? (l / 2) / Math.abs(dx) : Infinity;
  const ty = dy ? (a / 2) / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty) + 6 / Math.hypot(dx, dy);
  return [cx + dx * t, cy + dy * t];
}

function noSvg(x, y, l, a, e, classe = '') {
  return html`<g class="dxc__no-g ${classe}">
    <rect x="${fx(x)}" y="${fx(y)}" width="${l}" height="${a}" rx="2"/>
    <text class="dxc__n-svg" x="${fx(x + 14)}" y="${fx(y + a / 2 + 4)}">${e.n}</text>
    <text class="dxc__nome-svg" x="${fx(x + 44)}" y="${fx(y + a / 2 + 5)}">${e.nome}</text>
  </g>`;
}

function svgSolto() {
  const tocos = SOLTOS.slice(0, 4).map((p, i) => {
    const a = centro(p);
    const b = centro(SOLTOS[i + 1]);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const ini = borda(a, dx, dy, D.noL, D.noA);
    const fim = borda(b, -dx, -dy, D.noL, D.noA);
    const vx = fim[0] - ini[0];
    const vy = fim[1] - ini[1];
    const m1 = [ini[0] + vx * 0.34, ini[1] + vy * 0.34];
    const m2 = [fim[0] - vx * 0.2, fim[1] - vy * 0.2];
    return html`<path class="dxc__toco" d="M${fx(ini[0])} ${fx(ini[1])}L${fx(m1[0])} ${fx(m1[1])}M${fx(m2[0])} ${fx(m2[1])}L${fx(fim[0])} ${fx(fim[1])}"/>`;
  });
  return html`<svg class="dxc__svg" viewBox="0 0 ${D.W} ${D.H}" aria-hidden="true">
    ${tocos}
    ${SOLTOS.map(([x, y], i) => noSvg(x, y, D.noL, D.noA, etapas[i]))}
  </svg>`;
}

function svgConectado() {
  return html`<svg class="dxc__svg" viewBox="0 0 ${D.W} ${D.H}" aria-hidden="true">
    ${etapas.map((e, i) => {
      const { d, ponta } = CONECTADO.arco(i);
      return html`<g class="dxc__arco-g${i === 4 ? ' dxc__arco-g--retorno' : ''}" style="--i:${i}"><path class="dxc__arco" d="${d}" pathLength="1"/><path class="dxc__ponta" d="${ponta}"/></g>`;
    })}
    ${etapas.map((e, i) => {
      const c = CONECTADO.caixa(i);
      return noSvg(c.x, c.y, c.l, c.a, e);
    })}
  </svg>`;
}

export function desconectadoConectado() {
  const lista = (classe) => html`<ol class="dxc__lista ${classe}">
    ${etapas.map((e) => html`<li class="dxc__no"><span class="dxc__n">${e.n}</span><span>${e.nome}</span></li>`)}
  </ol>`;
  return html`<figure class="dxc desenhar" aria-label="Comparação entre etapas desconectadas e etapas conectadas em ciclo, com retorno de Medição para Inteligência">
    <div class="dxc__painel dxc__painel--solto">
      <p class="dxc__titulo">Desconectado</p>
      ${svgSolto()}
      ${lista('dxc__lista--solta')}
    </div>
    <div class="dxc__painel dxc__painel--ligado tema-escuro">
      <p class="dxc__titulo"><span class="marca-texto">Conectado</span></p>
      ${svgConectado()}
      ${lista('dxc__lista--ligada')}
    </div>
  </figure>`;
}

// ---------------------------------------------------------------------------
// 3. Linha do tempo RHOI
// ---------------------------------------------------------------------------
// passos: [{ letra, nome (en), verbo, quando (html), corpo (html) }]
export function linhaRhoi(passos) {
  return html`<div class="rhoi desenhar">
    <ol class="rhoi__lista">
      ${passos.map((p, i) => html`<li class="rhoi__passo" style="--i:${i}">
        <span class="rhoi__marco" aria-hidden="true"></span>
        <p class="rhoi__letra" aria-hidden="true">${p.letra}</p>
        <h3 class="rhoi__nome"><span lang="en">${p.nome}</span> <span class="rhoi__sep" aria-hidden="true">·</span> ${p.verbo}</h3>
        <p class="rhoi__quando">${p.quando}</p>
        <div class="rhoi__corpo">${p.corpo}</div>
      </li>`)}
    </ol>
    <span class="rhoi__laco" aria-hidden="true"></span>
  </div>`;
}

// ---------------------------------------------------------------------------
// Velora Radar: anéis de prioridade, contas, sinais e comitê de compra.
// É um diagrama do papel do Radar, não uma tela do produto: sem dados, nomes ou números.
// ---------------------------------------------------------------------------
function aleatorio(semente) {
  let a = semente;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function radar() {
  const R = { c: 300, aneis: [72, 144, 216, 280] };
  const polar = (g, r) => [R.c + r * Math.cos(rad(g - 90)), R.c + r * Math.sin(rad(g - 90))];
  // Contas prioritárias (Acid) e o comitê ligado à primeira.
  const prioritarias = [[312, 118], [48, 178], [168, 98]];
  const [p1, p2, p3] = prioritarias.map(([g, r]) => ({ g, r, xy: polar(g, r) }));
  const comite = [[-34, -22], [30, -30], [-8, 34]].map(([dx, dy]) => [p1.xy[0] + dx, p1.xy[1] + dy]);
  const especiais = [p1.xy, p2.xy, p3.xy, ...comite];
  const rnd = aleatorio(11);
  const contas = [];
  while (contas.length < 42) {
    const g = rnd() * 360;
    const r = 34 + Math.sqrt(rnd()) * 238;
    const xy = polar(g, r);
    if (especiais.some(([x, y]) => Math.hypot(x - xy[0], y - xy[1]) < 26)) continue;
    if (contas.some((c) => Math.hypot(c.xy[0] - xy[0], c.xy[1] - xy[1]) < 18)) continue;
    contas.push({ g, xy });
  }
  // Marcadores numerados das legendas (1 contas prioritárias, 2 sinais, 3 pessoas na decisão).
  const marca = (n, [x, y]) => html`<g class="radar__marca"><circle cx="${fx(x)}" cy="${fx(y)}" r="12"/><text x="${fx(x)}" y="${fx(y + 4)}" text-anchor="middle">${n}</text></g>`;
  const atraso = (g) => fx((((g % 360) + 360) % 360) / 360 * 2.2);
  return html`<figure class="radar desenhar" aria-labelledby="radar-legenda">
    <svg class="radar__svg" viewBox="0 0 600 600" aria-hidden="true">
      ${R.aneis.map((r, i) => html`<circle class="radar__anel${i === R.aneis.length - 1 ? ' radar__anel--externo' : ''}" cx="${R.c}" cy="${R.c}" r="${r}"/>`)}
      <path class="radar__cruz" d="M${R.c} 14V586M14 ${R.c}H586M${fx(polar(45, 280)[0])} ${fx(polar(45, 280)[1])}L${fx(polar(225, 280)[0])} ${fx(polar(225, 280)[1])}M${fx(polar(135, 280)[0])} ${fx(polar(135, 280)[1])}L${fx(polar(315, 280)[0])} ${fx(polar(315, 280)[1])}"/>
      ${contas.map((c) => html`<circle class="radar__conta" cx="${fx(c.xy[0])}" cy="${fx(c.xy[1])}" r="3.4" style="--atraso:${atraso(c.g)}s"/>`)}
      ${comite.map(([x, y]) => html`<line class="radar__elo" x1="${fx(p1.xy[0])}" y1="${fx(p1.xy[1])}" x2="${fx(x)}" y2="${fx(y)}" style="--atraso:${atraso(p1.g)}s"/>`)}
      ${comite.map(([x, y]) => html`<circle class="radar__pessoa" cx="${fx(x)}" cy="${fx(y)}" r="4.5" style="--atraso:${atraso(p1.g)}s"/>`)}
      <circle class="radar__sinal" cx="${fx(p2.xy[0])}" cy="${fx(p2.xy[1])}" r="16" style="--atraso:${atraso(p2.g)}s"/>
      <circle class="radar__sinal radar__sinal--2" cx="${fx(p2.xy[0])}" cy="${fx(p2.xy[1])}" r="27" style="--atraso:${atraso(p2.g)}s"/>
      ${[p1, p2, p3].map((p) => html`<circle class="radar__prioritaria" cx="${fx(p.xy[0])}" cy="${fx(p.xy[1])}" r="7" style="--atraso:${atraso(p.g)}s"/>`)}
      <g class="radar__varredura"><line x1="${R.c}" y1="${R.c}" x2="${R.c}" y2="${R.c - 280}"/></g>
      ${marca(1, [p3.xy[0] + 26, p3.xy[1] + 22])}
      ${marca(2, [p2.xy[0] + 40, p2.xy[1] - 22])}
      ${marca(3, [p1.xy[0] - 52, p1.xy[1] - 34])}
      <circle class="radar__centro" cx="${R.c}" cy="${R.c}" r="3"/>
    </svg>
    <figcaption class="radar__legenda" id="radar-legenda">
      <ol>
        <li><span class="radar__legenda-n" aria-hidden="true">1</span><span class="radar__legenda-txt">Contas prioritárias</span><a class="radar__legenda-alvo" href="#etapa-inteligencia"><span class="radar__legenda-seta" aria-hidden="true">→</span> 01 Inteligência</a></li>
        <li><span class="radar__legenda-n" aria-hidden="true">2</span><span class="radar__legenda-txt">Sinais de oportunidade</span><a class="radar__legenda-alvo" href="#etapa-inteligencia"><span class="radar__legenda-seta" aria-hidden="true">→</span> 01 Inteligência</a></li>
        <li><span class="radar__legenda-n" aria-hidden="true">3</span><span class="radar__legenda-txt">Pessoas envolvidas na decisão de compra</span><a class="radar__legenda-alvo" href="#etapa-acesso"><span class="radar__legenda-seta" aria-hidden="true">→</span> 02 Acesso</a></li>
      </ol>
    </figcaption>
  </figure>`;
}
