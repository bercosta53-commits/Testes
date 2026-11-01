// Diagramas do site (briefing de design §7). Linha fina, nós retos, número mono,
// rótulo de conexão sobre a linha, etapa ativa em Acid.
import { html } from './html.mjs';
import { etapas } from '../conteudo/etapas.mjs';

const fx = (v) => Number(v.toFixed(2));

// ---------------------------------------------------------------------------
// 1. Ciclo do sistema (SVG) + versão vertical para telas estreitas
// ---------------------------------------------------------------------------

const C = { W: 680, H: 480, cx: 340, cy: 228, R: 180, noL: 136, noA: 56, folga: 8, rotR: 26 };

const rad = (g) => (g * Math.PI) / 180;
const pontoNoCirculo = (g, r = C.R) => [C.cx + r * Math.cos(rad(g)), C.cy + r * Math.sin(rad(g))];
const anguloNo = (i) => -90 + 72 * i;

function caixaNo(i) {
  const [x, y] = pontoNoCirculo(anguloNo(i));
  return { x: x - C.noL / 2, y: y - C.noA / 2, l: C.noL, a: C.noA, cx: x, cy: y };
}

function dentro([px, py], c, folga) {
  return px > c.x - folga && px < c.x + c.l + folga && py > c.y - folga && py < c.y + c.a + folga;
}

// Ângulo (em graus, a partir do centro do nó) em que o círculo sai da caixa do nó.
function saidaDaCaixa(i, sentido) {
  const c = caixaNo(i);
  const base = anguloNo(i);
  for (let d = 0; d < 72; d += 0.1) {
    if (!dentro(pontoNoCirculo(base + sentido * d), c, C.folga)) return d;
  }
  return 0;
}

function arco(i) {
  const j = (i + 1) % 5;
  const ini = anguloNo(i) + saidaDaCaixa(i, +1);
  const fimBase = anguloNo(i) + 72;
  const fim = fimBase - saidaDaCaixa(j, -1);
  const [x1, y1] = pontoNoCirculo(ini);
  const [x2, y2] = pontoNoCirculo(fim);
  const d = `M${fx(x1)} ${fx(y1)}A${C.R} ${C.R} 0 0 1 ${fx(x2)} ${fx(y2)}`;
  // Ponta de seta na direção do movimento (sentido horário).
  const t = [-Math.sin(rad(fim)), Math.cos(rad(fim))];
  const n = [Math.cos(rad(fim)), Math.sin(rad(fim))];
  const a1 = [x2 - 7 * t[0] + 4 * n[0], y2 - 7 * t[1] + 4 * n[1]];
  const a2 = [x2 - 7 * t[0] - 4 * n[0], y2 - 7 * t[1] - 4 * n[1]];
  const ponta = `M${fx(a1[0])} ${fx(a1[1])}L${fx(x2)} ${fx(y2)}L${fx(a2[0])} ${fx(a2[1])}`;
  return { d, ponta };
}

function rotuloLigacao(i, linhas) {
  const g = anguloNo(i) + 36;
  const [x, y] = pontoNoCirculo(g, C.R + C.rotR);
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
  const nos = etapas.map((e, i) => {
    const c = caixaNo(i);
    return html`<a class="ciclo__no" data-no="${i + 1}" href="#${e.id}" style="--i:${i}">
      <rect x="${fx(c.x)}" y="${fx(c.y)}" width="${c.l}" height="${c.a}" rx="2"/>
      <text class="ciclo__no-n" x="${fx(c.x + 14)}" y="${fx(c.y + 22)}">${e.n}</text>
      <text class="ciclo__no-nome" x="${fx(c.x + 14)}" y="${fx(c.y + 42)}">${e.nome}</text>
    </a>`;
  });
  const arcos = etapas.map((e, i) => {
    const { d, ponta } = arco(i);
    const retorno = i === 4 ? ' ciclo__arco--retorno' : '';
    return html`<g class="ciclo__ligacao-g${retorno}" data-de="${i + 1}" style="--i:${i}">
      <path class="ciclo__arco" d="${d}" pathLength="1"/>
      <path class="ciclo__ponta" d="${ponta}"/>
    </g>`;
  });
  const rotulos = etapas.map((e, i) => rotuloLigacao(i, e.ligacao));
  // Ordem no DOM = ordem de leitura: nó, o que ele entrega, próximo nó…
  const corpo = etapas.map((e, i) => [arcos[i], nos[i], rotulos[i]]);
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

// Lista vertical ligada por uma linha contínua à esquerda (versão mobile dos ciclos).
export function cicloLista({ compacta = false } = {}) {
  return html`<ol class="ciclo-lista${compacta ? ' ciclo-lista--compacta' : ''}">
    ${etapas.map((e, i) => html`<li class="ciclo-lista__item" data-no="${i + 1}">
      <a class="ciclo-lista__no" href="#${e.id}"><span class="ciclo-lista__n">${e.n}</span><span class="ciclo-lista__nome">${e.nome}</span></a>
      <p class="ciclo-lista__ligacao${i === 4 ? ' ciclo-lista__ligacao--retorno' : ''}">${e.ligacao.join(' ')}</p>
    </li>`)}
  </ol>`;
}

// modo: 'abertura' (desenha em sequência ao entrar na tela), 'rolagem' (acompanha os blocos de texto).
export function ciclo({ ativa = 1, modo = 'fixo', classe = '' } = {}) {
  return html`<div class="ciclo desenhar ${classe}" data-ciclo data-modo="${modo}" data-ativa="${ativa}" data-padrao="${ativa}">
    ${cicloSvg()}
    ${cicloLista({ compacta: true })}
  </div>`;
}

// ---------------------------------------------------------------------------
// 4. Desconectado × conectado
// ---------------------------------------------------------------------------

export function desconectadoConectado() {
  const lista = (classe) => html`<ol class="dxc__lista ${classe}">
    ${etapas.map((e) => html`<li class="dxc__no"><span class="dxc__n">${e.n}</span><span>${e.nome}</span></li>`)}
  </ol>`;
  return html`<figure class="dxc desenhar" aria-label="Comparação entre etapas desconectadas e etapas conectadas em ciclo, com retorno de Medição para Inteligência">
    <div class="dxc__painel dxc__painel--solto">
      <p class="dxc__titulo">Desconectado</p>
      ${lista('dxc__lista--solta')}
    </div>
    <div class="dxc__painel dxc__painel--ligado">
      <p class="dxc__titulo"><span class="marca-texto">Conectado</span></p>
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
// Velora Radar no sistema: o que o Radar reúne e para qual etapa vai
// ---------------------------------------------------------------------------

export function radarNoSistema() {
  const [intel, acesso] = etapas;
  const alvo = (e) => html`<a class="radar-sis__alvo" href="#${e.id}"><span class="radar-sis__alvo-n">${e.n}</span>${e.nome}</a>`;
  return html`<figure class="radar-sis desenhar" aria-label="O Velora Radar reúne contas prioritárias e sinais de oportunidade para a Inteligência, e pessoas envolvidas na decisão de compra para o Acesso">
    <div class="radar-sis__origem"><span class="radar-sis__tipo">Tecnologia própria</span><span class="radar-sis__nome">Velora Radar</span></div>
    <ul class="radar-sis__fluxos">
      <li class="radar-sis__fluxo" style="--i:0"><span class="radar-sis__insumo">Contas prioritárias</span><span class="radar-sis__linha" aria-hidden="true"></span>${alvo(intel)}</li>
      <li class="radar-sis__fluxo" style="--i:1"><span class="radar-sis__insumo">Sinais de oportunidade</span><span class="radar-sis__linha" aria-hidden="true"></span>${alvo(intel)}</li>
      <li class="radar-sis__fluxo" style="--i:2"><span class="radar-sis__insumo">Pessoas envolvidas na decisão de compra</span><span class="radar-sis__linha" aria-hidden="true"></span>${alvo(acesso)}</li>
    </ul>
  </figure>`;
}

