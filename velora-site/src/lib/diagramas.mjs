// Diagramas do site (briefing de design §7). Linha fina, nós retos, número mono, destaque em Acid.
// O circuito das cinco etapas (seção 02) é HTML puro, em src/paginas/home.mjs: a única representação do sistema.
import { html } from './html.mjs';

const fx = (v) => Number(v.toFixed(2));
const rad = (g) => (g * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Linha do tempo RHOI
// ---------------------------------------------------------------------------
// passos: [{ letra, nome (en), verbo, texto }]
export function linhaRhoi(passos) {
  return html`<div class="rhoi desenhar">
    <ol class="rhoi__lista">
      ${passos.map((p, i) => html`<li class="rhoi__passo" style="--i:${i}">
        <span class="rhoi__marco" aria-hidden="true"></span>
        <p class="rhoi__letra" aria-hidden="true"><span>${p.letra}</span></p>
        <h3 class="rhoi__nome"><span lang="en">${p.nome}</span> — ${p.verbo}</h3>
        <p class="rhoi__texto">${p.texto}</p>
      </li>`)}
    </ol>
    <span class="rhoi__laco" aria-hidden="true"></span>
  </div>`;
}

// ---------------------------------------------------------------------------
// Velora Radar
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

// Ilustração do Velora Radar (dentro de Inteligência comercial): anéis, varredura única, empresas,
// contas priorizadas em Acid, sinais e pessoas ligadas a uma conta. Sem dados, nomes ou números.
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
  const atraso = (g) => fx((((g % 360) + 360) % 360) / 360 * 2.2);
  return html`<figure class="radar desenhar" role="img" aria-label="Ilustração: um radar com empresas como pontos; algumas, priorizadas, aparecem em destaque, uma delas com sinais ao redor e pessoas ligadas a ela.">
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
      <circle class="radar__centro" cx="${R.c}" cy="${R.c}" r="3"/>
    </svg>
  </figure>`;
}
