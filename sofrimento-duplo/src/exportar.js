// Exporta o ranking como PNG, desenhado num canvas com as cores do tema atual.
import { DEFAULTS } from './calc.js';
import { COR_IDENTIDADE, casasPct, dataBR, num, pct } from './format.js';
import { tituloRanking } from './narrativa.js';
import { token } from './cores.js';

const LARGURA = 960;
const MARGEM = 40;
const ALTURA_LINHA = 52;
const COLUNA_NOME = 230;
const COLUNA_PIOR = 150;
const ESPACO_VALOR = 48;
const ESPESSURA = 18;

export async function exportarRankingPng(resultado) {
  await document.fonts?.ready;

  const linhas = resultado.ranking;
  const texto = token('--fonte');
  const titulo = quebrarLinhas(`800 26px ${texto}`, tituloRanking(resultado), LARGURA - 2 * MARGEM);
  const yTitulo = MARGEM + 48;
  const ySub = yTitulo + (titulo.length - 1) * 32 + 32;
  const TOPO = ySub + 70;
  const altura = TOPO + linhas.length * ALTURA_LINHA + 120;
  const escala = 2;
  const canvas = document.createElement('canvas');
  canvas.width = LARGURA * escala;
  canvas.height = altura * escala;
  const ctx = canvas.getContext('2d');
  ctx.scale(escala, escala);

  const cor = Object.fromEntries(
    ['superficie', 'tinta', 'tinta-2', 'apagado', 'grade', 'eixo', 'acento', 'gremio', 'inter', 'lula', 'flavio'].map((t) => [
      t,
      token(`--${t}`),
    ]),
  );
  const identidade = (chave) => cor[COR_IDENTIDADE[chave].slice(2)];

  ctx.fillStyle = cor.superficie;
  ctx.fillRect(0, 0, LARGURA, altura);

  // Rótulo, título-conclusão e premissas
  const pf = resultado.pVence.flavio;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = cor.acento;
  ctx.font = `650 12px ${texto}`;
  ctx.fillText('SOFRIMENTO DUPLO · RANKING', MARGEM, MARGEM + 12);
  ctx.fillStyle = cor.tinta;
  ctx.font = `800 26px ${texto}`;
  titulo.forEach((linha, i) => ctx.fillText(linha, MARGEM, yTitulo + i * 32));
  ctx.fillStyle = cor['tinta-2'];
  ctx.font = `400 14px ${texto}`;
  ctx.fillText(
    `Derrotas esperadas (0 a 2) · Flávio ${pct(pf, casasPct(pf))} × Lula ${pct(1 - pf, casasPct(pf))} · risco de queda após o empate no Gre-Nal`,
    MARGEM,
    ySub,
  );

  // Cabeçalho das colunas
  const x0 = MARGEM + COLUNA_NOME;
  const xPior = LARGURA - MARGEM;
  const largura = xPior - COLUNA_PIOR - ESPACO_VALOR - x0;
  const yCab = TOPO - 16;
  ctx.fillStyle = cor['tinta-2'];
  ctx.font = `600 11px ${texto}`;
  ctx.fillText('PERFIL', MARGEM, yCab);
  ctx.fillText('DERROTAS ESPERADAS', x0, yCab);
  ctx.textAlign = 'right';
  ctx.fillText('SOFRIMENTO DUPLO', xPior, yCab);
  ctx.textAlign = 'left';
  ctx.fillStyle = cor.tinta;
  ctx.fillRect(MARGEM, yCab + 8, LARGURA - 2 * MARGEM, 2);

  const yFim = TOPO + linhas.length * ALTURA_LINHA;
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const gx = Math.round(x0 + t * largura) + 0.5;
    ctx.strokeStyle = t === 0 ? cor.eixo : cor.grade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, TOPO + 4);
    ctx.lineTo(gx, yFim - 4);
    ctx.stroke();
    ctx.fillStyle = cor.apagado;
    ctx.font = `500 11px ${texto}`;
    ctx.textAlign = t === 0 ? 'left' : t === 1 ? 'right' : 'center';
    ctx.fillText(num(t * 2, (t * 2) % 1 ? 1 : 0), gx, yFim + 16);
    ctx.textAlign = 'left';
  }

  linhas.forEach((p, i) => {
    const yMeio = TOPO + i * ALTURA_LINHA + ALTURA_LINHA / 2;

    ctx.fillStyle = cor.apagado;
    ctx.font = `600 13px ${texto}`;
    ctx.fillText(`${p.posicao}º`, MARGEM, yMeio + 5);
    ctx.fillStyle = identidade(p.clube);
    ctx.fillRect(MARGEM + 30, yMeio - 5, 9, 10);
    ctx.fillStyle = identidade(p.candidato);
    ctx.fillRect(MARGEM + 39, yMeio - 5, 9, 10);
    ctx.fillStyle = cor.tinta;
    ctx.font = `${p.posicao === 1 ? 700 : 500} 15px ${texto}`;
    ctx.fillText(p.nome, MARGEM + 56, yMeio + 5);

    const w1 = (p.pClube / 2) * largura;
    const w2 = ((1 - p.pCand) / 2) * largura;
    const yBarra = yMeio - ESPESSURA / 2;
    ctx.fillStyle = identidade(p.clube);
    ctx.fillRect(x0, yBarra, w1, ESPESSURA);
    ctx.fillStyle = identidade(p.candidato);
    retangulo(ctx, x0 + w1 + 2, yBarra, Math.max(0, w2 - 2), ESPESSURA, [0, 2, 2, 0]);

    ctx.fillStyle = cor.tinta;
    ctx.font = `600 13px ${texto}`;
    ctx.fillText(num(p.derrotasEsperadas), x0 + w1 + w2 + 8, yMeio + 5);

    ctx.textAlign = 'right';
    ctx.fillStyle = p.posicao === 1 ? cor.acento : cor.tinta;
    ctx.font = `850 22px ${texto}`;
    ctx.fillText(pct(p.quedaEDerrota), xPior, yMeio + 8);
    ctx.textAlign = 'left';

    ctx.fillStyle = cor.grade;
    ctx.fillRect(MARGEM, TOPO + (i + 1) * ALTURA_LINHA - 1, LARGURA - 2 * MARGEM, 1);
  });

  // Legenda e rodapé
  let x = MARGEM;
  const yLegenda = yFim + 48;
  ctx.font = `500 12px ${texto}`;
  for (const [rotulo, chave] of [
    ['Grêmio', 'gremio'],
    ['Inter', 'inter'],
    ['Lula (PT)', 'lula'],
    ['Flávio (PL)', 'flavio'],
  ]) {
    ctx.fillStyle = identidade(chave);
    ctx.fillRect(x, yLegenda - 10, 11, 11);
    ctx.fillStyle = cor['tinta-2'];
    ctx.fillText(rotulo, x + 17, yLegenda);
    x += 17 + ctx.measureText(rotulo).width + 22;
  }
  ctx.fillStyle = cor.grade;
  ctx.fillRect(MARGEM, yLegenda + 18, LARGURA - 2 * MARGEM, 1);
  ctx.fillStyle = cor.apagado;
  ctx.font = `400 11px ${texto}`;
  ctx.fillText('1º trecho da barra: risco de o clube cair. 2º trecho: chance de o candidato perder.', MARGEM, yLegenda + 36);
  ctx.fillText(
    `Fonte: ValorFinal; Datafolha; análise própria · Sofrimento Duplo · dados de ${dataBR(DEFAULTS.dataReferencia)} · estimativas, não previsões`,
    MARGEM,
    yLegenda + 52,
  );

  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/png'));
  await salvar(blob, 'ranking-sofrimento-duplo.png');
}

/**
 * Dentro do visualizador de artefatos do claude.ai, o download passa pelo
 * recurso "downloads" (o visitante confirma). Fora dele, usa um link comum.
 */
export async function downloadsDoVisualizador() {
  return (await window.claude?.use?.('downloads')) ?? null;
}

async function salvar(blob, nome) {
  if (window.claude?.use) {
    const downloads = await downloadsDoVisualizador();
    if (!downloads) return;
    try {
      await downloads.save({ filename: nome, data: blob });
    } catch {
      // Recusado pelo visitante ou indisponível: não há o que fazer.
    }
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Quebra o texto em linhas que cabem na largura dada, com a fonte dada. */
function quebrarLinhas(fonte, texto, largura) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = fonte;
  const linhas = [];
  let linha = '';
  for (const palavra of texto.split(' ')) {
    const teste = linha ? `${linha} ${palavra}` : palavra;
    if (ctx.measureText(teste).width > largura && linha) {
      linhas.push(linha);
      linha = palavra;
    } else {
      linha = teste;
    }
  }
  return [...linhas, linha];
}

function retangulo(ctx, x, y, w, h, raio) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, raio);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}
