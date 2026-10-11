// Exporta o ranking de sofrimento como PNG, desenhado num canvas com as cores
// do tema atual.
import { NOMES_MODO, casasPct, dataBR, num, pct } from './format.js';
import { DEFAULTS } from './calc.js';
import { token } from './cores.js';

const LARGURA = 800;
const MARGEM = 32;
const ALTURA_LINHA = 56;
const TOPO_GRAFICO = 132;
const COLUNA_NOME = 200;
const COLUNA_PIOR = 132;
const ESPACO_VALOR = 48;
const ESPESSURA = 20;

export async function exportarRankingPng(resultado, params) {
  await document.fonts?.ready;

  const linhas = resultado.ranking;
  const altura = TOPO_GRAFICO + linhas.length * ALTURA_LINHA + 76;
  const escala = 2;
  const canvas = document.createElement('canvas');
  canvas.width = LARGURA * escala;
  canvas.height = altura * escala;
  const ctx = canvas.getContext('2d');
  ctx.scale(escala, escala);

  const cor = {
    fundo: token('--superficie'),
    tinta: token('--tinta'),
    tinta2: token('--tinta-2'),
    apagado: token('--apagado'),
    grade: token('--grade'),
    eixo: token('--eixo'),
    clube: token('--s-clube'),
    cand: token('--s-cand'),
  };
  const texto = token('--fonte-texto');
  const titulo = token('--fonte-titulo');

  ctx.fillStyle = cor.fundo;
  ctx.fillRect(0, 0, LARGURA, altura);

  // Título, premissas e legenda
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = cor.tinta;
  ctx.font = `700 30px ${titulo}`;
  ctx.fillText('Ranking de sofrimento', MARGEM, MARGEM + 26);
  ctx.fillStyle = cor.tinta2;
  ctx.font = `400 14px ${texto}`;
  ctx.fillText(
    `Derrotas esperadas (0 a 2) · P(Flávio vence) ${pct(params.pFlavio, casasPct(params.pFlavio))} · Gre-Nal: ${NOMES_MODO[params.resultadoJogo]}`,
    MARGEM,
    MARGEM + 52,
  );

  let x = MARGEM;
  const yLegenda = MARGEM + 80;
  for (const [rotulo, c] of [
    ['Clube rebaixado', cor.clube],
    ['Candidato derrotado', cor.cand],
  ]) {
    ctx.fillStyle = c;
    retangulo(ctx, x, yLegenda - 10, 12, 12, 2);
    ctx.fillStyle = cor.tinta2;
    ctx.font = `500 13px ${texto}`;
    ctx.fillText(rotulo, x + 18, yLegenda);
    x += 18 + ctx.measureText(rotulo).width + 24;
  }

  // Área das barras
  const x0 = MARGEM + COLUNA_NOME;
  const largura = LARGURA - MARGEM - COLUNA_PIOR - ESPACO_VALOR - x0;
  const yFim = TOPO_GRAFICO + linhas.length * ALTURA_LINHA;

  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const gx = Math.round(x0 + t * largura) + 0.5;
    ctx.strokeStyle = t === 0 ? cor.eixo : cor.grade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, TOPO_GRAFICO - 8);
    ctx.lineTo(gx, yFim);
    ctx.stroke();
    ctx.fillStyle = cor.apagado;
    ctx.font = `500 12px ${texto}`;
    ctx.textAlign = 'center';
    ctx.fillText(num(t * 2, t * 2 % 1 ? 1 : 0), gx, yFim + 18);
    ctx.textAlign = 'left';
  }

  linhas.forEach((p, i) => {
    const yMeio = TOPO_GRAFICO + i * ALTURA_LINHA + ALTURA_LINHA / 2;

    ctx.fillStyle = cor.apagado;
    ctx.font = `600 14px ${texto}`;
    ctx.fillText(`${p.posicao}º`, MARGEM, yMeio + 5);
    ctx.fillStyle = cor.tinta;
    ctx.font = `${p.posicao === 1 ? 600 : 500} 15px ${texto}`;
    ctx.fillText(p.nome, MARGEM + 30, yMeio + 5);

    const w1 = (p.pClube / 2) * largura;
    const w2 = ((1 - p.pCand) / 2) * largura;
    const yBarra = yMeio - ESPESSURA / 2;
    ctx.fillStyle = cor.clube;
    ctx.fillRect(x0, yBarra, w1, ESPESSURA);
    ctx.fillStyle = cor.cand;
    retangulo(ctx, x0 + w1 + 2, yBarra, Math.max(0, w2 - 2), ESPESSURA, [0, 4, 4, 0]);

    ctx.fillStyle = cor.tinta;
    ctx.font = `600 14px ${texto}`;
    ctx.fillText(num(p.derrotasEsperadas), x0 + w1 + w2 + 8, yMeio + 5);

    ctx.textAlign = 'right';
    ctx.fillStyle = cor.tinta;
    ctx.font = `700 22px ${titulo}`;
    const pior = pct(p.quedaEDerrota);
    ctx.fillText(pior, LARGURA - MARGEM, yMeio + 2);
    ctx.fillStyle = cor.apagado;
    ctx.font = `400 12px ${texto}`;
    ctx.fillText('no pior cenário', LARGURA - MARGEM, yMeio + 18);
    ctx.textAlign = 'left';
  });

  ctx.fillStyle = cor.apagado;
  ctx.font = `400 12px ${texto}`;
  ctx.fillText(
    `Sofrimento Duplo · Gre-Nal × Eleição 2026 · dados de ${dataBR(DEFAULTS.dataReferencia)} · estimativas, não previsões`,
    MARGEM,
    altura - 24,
  );

  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/png'));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ranking-sofrimento-duplo.png';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function retangulo(ctx, x, y, w, h, raio) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, raio);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}
