/*
 * Momon — o gatinho, desenhado em SVG com partes separadas para animar.
 *
 *   Momon.svg.criar({ humor: 'emburrado', pose: 'sentado', prefixo: '' })  -> string <svg>
 *   Momon.svg.texturas()  -> <svg> escondido com o grão de pintura (pôr uma vez na página)
 *
 * Quem é ele: um gatinho ruivo e branco, gordinho, com cara larga de velhinho
 * resmungão. As bochechas são de pelo armado e o topete fica arrepiado de quem
 * acabou de acordar. As orelhas são pequenas, e a da direita tem a pontinha dobrada.
 * As sobrancelhas de pelo mostram o humor. Os olhos são âmbar, e as pupilas
 * crescem quando ele fica feliz. O rabo é de espanador, com a ponta que acende
 * como vaga-lume. Ele é emburradinho, mas muito carinhoso: os humores de PROGRESSAO
 * vão do emburrado ao feliz, que é o caminho que o carinho faz com ele.
 *
 * Estilo: ilustração de livro, levemente 3D. O pelo é fosco (nada de brilho
 * de plástico). As silhuetas são de tufos e há fios de pelo desenhados. A luz
 * quente vem do abajur (esquerda) e a fria, da lua da janela (direita), com um
 * grão de pintura por cima. Só gradientes e padrões, nenhum filtro, para animar
 * leve em tablet modesto. O pelo é gerado com sorteio de semente fixa: sai sempre igual.
 *
 * Cada parte é um <g id="..." data-parte="..."> (ids do briefing). O `prefixo`
 * só existe para quando há vários Momons na mesma página (ids não podem repetir).
 * O CSS mira [data-parte="..."]. Esquerda/direita são as da TELA.
 * Humor em data-humor e pose (sentado | enroscado) em data-pose, no <svg>;
 * poses, cores e animações de repouso ficam em momon.css. Nenhum grupo animável
 * recebe o atributo transform (o CSS sobrescreveria): formas deslocadas ou
 * espelhadas ganham um <g> interno.
 */
(function () {
  'use strict';

  // Do emburrado ao feliz: é por aqui que o carinho vai levando o Momon.
  const PROGRESSAO = ['emburrado', 'desconfiado', 'amolecendo', 'contente', 'feliz'];
  const ESPECIAIS = ['ronronando', 'dormindo', 'surpreso'];
  const HUMORES = [...PROGRESSAO, ...ESPECIAIS];
  // De passagem, usados pelo app: amassando pãozinho e bocejando.
  const OUTROS = ['amassando', 'bocejo'];

  const PARTES = [
    'corpo', 'peito-barriga', 'cabeca', 'orelha-esq', 'orelha-dir',
    'olho-esq', 'olho-dir', 'pálpebras', 'focinho', 'boca', 'bigodes',
    'lua-testa', 'pata-esq', 'pata-dir', 'rabo', 'ponta-rabo',
  ];

  const COR = {
    ruivo: '#E2853A',
    ruivoClaro: '#F3A75C',
    ruivoSombra: '#B05424',
    ruivoFundo: '#7E3417',
    branco: '#FFF4E4',
    brancoSombra: '#E3C8B4',
    sombra: '#5E2418',      // sombra quente que cai sobre o pelo
    luzQuente: '#FFD68E',   // abajur
    luzFria: '#B4D4F2',     // lua da janela
    rosaOrelha: '#E58F9B',
    nariz: '#D86F80',
    pupila: '#170D10',
    lua: '#FFE6A6',
    pontaRabo: '#FFF2DA',
    bochecha: '#F08A8C',
    boca: '#4E1F1C',
    lingua: '#EE7D8D',
    // usado pela página de teste para mostrar a paleta
    laranja: '#E2853A',
    olho: '#E9A23B',
  };

  const n = v => Math.round(v * 10) / 10;
  const pt = (x, y) => `${n(x)} ${n(y)}`;

  // Espelha um conteúdo na vertical x = 200 (desenho do lado esq -> lado dir).
  const espelhar = conteudo => `<g transform="matrix(-1 0 0 1 400 0)">${conteudo}</g>`;

  // ---------------------------------------------------------------- geometria

  // Sorteio com semente: o pelo sai sempre igual, em todo carregamento.
  function sorteio(semente) {
    let s = semente >>> 0;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cubica([p0, p1, p2, p3], t) {
    const u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
  }

  // Meia forma (lado direito, de cima até embaixo, começo e fim em x = 200) -> forma inteira.
  function formaSimetrica(inicio, curvas) {
    const segs = [];
    let ant = inicio;
    for (const c of curvas) {
      const fim = [c[4], c[5]];
      segs.push([ant, [c[0], c[1]], [c[2], c[3]], fim]);
      ant = fim;
    }
    for (let i = segs.length - 1; i >= 0; i--) {
      const [a, b, c, d] = segs[i];
      segs.push([[400 - d[0], d[1]], [400 - c[0], c[1]], [400 - b[0], b[1]], [400 - a[0], a[1]]]);
    }
    return segs;
  }

  // Forma fechada a partir de cúbicas soltas: [[x0, y0], [c1x, c1y, c2x, c2y, x, y], ...].
  function forma(inicio, curvas) {
    const segs = [];
    let ant = inicio;
    for (const c of curvas) {
      const fim = [c[4], c[5]];
      segs.push([ant, [c[0], c[1]], [c[2], c[3]], fim]);
      ant = fim;
    }
    return segs;
  }

  const caminho = segs => `M${pt(...segs[0][0])}` + segs.map(([, a, b, c]) => `C${pt(...a)} ${pt(...b)} ${pt(...c)}`).join('') + 'Z';

  // Pontos igualmente espaçados ao longo de uma forma fechada.
  function pontosDe(segs, passo) {
    const densos = [];
    for (const s of segs) for (let i = 0; i < 48; i++) densos.push(cubica(s, i / 48));
    return reamostrar(densos, passo);
  }

  function reamostrar(pts, passo) {
    const saida = [pts[0]];
    let falta = passo;
    for (let i = 1; i <= pts.length; i++) {
      let a = pts[i - 1];
      const b = pts[i % pts.length];
      let d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (d >= falta) {
        const k = falta / d;
        a = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
        saida.push(a);
        d -= falta;
        falta = passo;
      }
      falta -= d;
    }
    const ult = saida[saida.length - 1];
    if (Math.hypot(ult[0] - saida[0][0], ult[1] - saida[0][1]) < passo * .5) saida.pop();
    return saida;
  }

  // Garante o sentido horário (na tela), que é o que o contorno de pelo espera.
  function horario(pts) {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    return area < 0 ? pts.slice().reverse() : pts;
  }

  // Contorno de pelo: cada trechinho vira um tufo para fora, deitado para baixo (ou
  // para fora, no alto da cabeça). Quase todos são tufos macios, redondinhos e de
  // tamanhos diferentes; de vez em quando, uma mecha pontuda. altura(x, y) diz o
  // tamanho naquele lugar; 0 = contorno liso.
  function peludo(pts, altura, rnd, centroX = 200) {
    pts = horario(pts);
    const total = pts.length;
    let d = `M${pt(...pts[0])}`;
    for (let i = 0; i < total; i++) {
      const a = pts[i], b = pts[(i + 1) % total];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const h = altura(mx, my) * (.45 + .9 * rnd());
      if (h < 1) { d += `L${pt(...b)}`; continue; }
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = dy / len, ny = -dx / len;
      let k;
      if (Math.abs(dy) > Math.abs(dx) * .3) k = dy > 0 ? .78 : .22;
      else k = (mx > centroX) === (dx > 0) ? .78 : .22;
      if (rnd() < .78) {
        // tufo macio: uma lombadinha torta, deitada para o lado do pelo
        const c1 = [a[0] + dx * (k - .35) + nx * h * 1.25, a[1] + dy * (k - .35) + ny * h * 1.25];
        const c2 = [a[0] + dx * (k + .2) + nx * h * 1.1, a[1] + dy * (k + .2) + ny * h * 1.1];
        d += `C${pt(...c1)} ${pt(...c2)} ${pt(...b)}`;
      } else {
        // mecha pontuda
        const ponta = [a[0] + dx * k + nx * h * 1.2, a[1] + dy * k + ny * h * 1.2];
        const c1 = [a[0] + dx * k * .45 + nx * h * .9, a[1] + dy * k * .45 + ny * h * .9];
        const c2 = [ponta[0] + (b[0] - ponta[0]) * .5 + nx * h * .15, ponta[1] + (b[1] - ponta[1]) * .5 + ny * h * .15];
        d += `Q${pt(...c1)} ${pt(...ponta)}Q${pt(...c2)} ${pt(...b)}`;
      }
    }
    return d + 'Z';
  }

  // Fios de pelo: risquinhos curvos espalhados numa elipse, seguindo a direção do pelo.
  function fios(cx, cy, rx, ry, quantos, direcao, rnd, comprimento = [7, 14]) {
    let d = '';
    for (let i = 0; i < quantos; i++) {
      const ang = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
      const x = cx + Math.cos(ang) * rx * r, y = cy + Math.sin(ang) * ry * r;
      const dir = direcao(x, y) + (rnd() - .5) * .5;
      const len = comprimento[0] + rnd() * (comprimento[1] - comprimento[0]);
      const ex = x + Math.cos(dir) * len, ey = y + Math.sin(dir) * len;
      const curva = (rnd() - .5) * len * .5;
      const qx = (x + ex) / 2 - Math.sin(dir) * curva, qy = (y + ey) / 2 + Math.cos(dir) * curva;
      d += `M${pt(x, y)}Q${pt(qx, qy)} ${pt(ex, ey)}`;
    }
    return d;
  }

  // Tubo de pelo em volta de uma linha central (o rabo): pontos do contorno.
  function tubo(segs, largura, passo = 9) {
    const centro = [];
    for (const s of segs) for (let i = 0; i < 40; i++) centro.push(cubica(s, i / 40));
    const ult = segs[segs.length - 1][3];
    centro.push(ult);
    const linha = reamostrar(centro, passo).concat([ult]);
    const esq = [], dir = [];
    linha.forEach((p, i) => {
      const a = linha[Math.max(0, i - 1)], b = linha[Math.min(linha.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const w = largura(i / (linha.length - 1)) / 2;
      esq.push([p[0] - dy / len * w, p[1] + dx / len * w]);
      dir.push([p[0] + dy / len * w, p[1] - dx / len * w]);
    });
    // ponta redonda
    const p = linha[linha.length - 1], q = linha[linha.length - 2];
    const ang = Math.atan2(p[1] - q[1], p[0] - q[0]);
    const r = largura(1) / 2, tampa = [];
    for (let k = 1; k < 8; k++) {
      const a = ang + Math.PI / 2 - Math.PI * k / 8;
      tampa.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]);
    }
    return { pontos: esq.concat(tampa, dir.reverse()), linha };
  }

  // Lua crescente: círculo maior menos um círculo deslocado.
  function crescente(cx, cy, r1, dx, dy, r2) {
    const d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const px = cx + (a * dx) / d, py = cy + (a * dy) / d;
    const ux = -dy / d, uy = dx / d;
    const p1 = pt(px + h * ux, py + h * uy), p2 = pt(px - h * ux, py - h * uy);
    return `M${p1}A${r1} ${r1} 0 1 1 ${p2}A${r2} ${r2} 0 0 0 ${p1}Z`;
  }

  // Estrela de 5 pontas (o reflexo nos olhos).
  function estrela(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const ang = (-90 + i * 36) * Math.PI / 180, raio = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + pt(cx + raio * Math.cos(ang), cy + raio * Math.sin(ang));
    }
    return d + 'Z';
  }

  // ---------------------------------------------------------------- formas (calculadas uma vez)

  const rnd = sorteio(2024);

  // Cabeça larga, de topo achatado; os tufos armam as bochechas.
  const CABECA_LISA = formaSimetrica([200, 70], [
    [254, 68, 302, 82, 326, 112],
    [346, 136, 350, 166, 346, 192],
    [342, 228, 324, 256, 296, 272],
    [266, 287, 236, 292, 200, 292],
  ]);
  const tufoDaCabeca = (x, y) => {
    const ang = Math.atan2(y - 182, Math.abs(x - 200)) * 180 / Math.PI; // 0 = lado, 90 = queixo, -90 = topo
    if (ang > 82) return 3;
    if (ang > 4) return 4 + 9 * Math.sin(Math.PI * Math.min(ang, 72) / 82);
    if (ang > -26) return 3;
    return 0;
  };
  const CABECA = peludo(pontosDe(CABECA_LISA, 15), tufoDaCabeca, rnd);

  // Pelo branco da parte de baixo do rosto (bochechas + ponta do focinho).
  const MASCARA = 'M0 320L0 206C60 190 108 206 128 214C158 226 178 200 200 196C222 200 242 226 272 214C292 206 340 190 400 206L400 320Z';

  // Topete arrepiado (fica atrás da cabeça, só as pontas aparecem).
  const TOPETE = 'M176 84Q166 64 168 46Q182 58 189 74Q189 54 199 38Q207 55 207 73Q215 60 229 54Q224 70 222 86Z';

  // Orelhas pequenas, nos lados do alto da cabeça. A direita tem a pontinha dobrada.
  const ORELHA = 'M90 140C74 114 64 84 70 62C74 48 92 44 108 52C128 62 148 78 166 96Z';
  const ORELHA_DENTRO = 'M98 126C86 106 80 84 84 70C87 60 98 58 109 63C124 71 138 82 150 96Z';
  const ORELHA_DOBRADA = 'M90 140C74 114 68 92 72 76Q90 60 110 54C130 63 148 78 166 96Z';
  const ORELHA_ABA = 'M72 76Q90 60 110 54Q108 74 98 94Q82 88 72 76Z';
  const ORELHA_TUFO = 'M104 120Q94 104 97 88M116 112Q110 98 115 86M127 106Q125 96 131 88';

  // Olhos âmbar com pupila grande.
  const OLHO = { rx: 24, ry: 25, esq: [148, 182], dir: [252, 182] };

  // Sobrancelhas de pelo claro (a da direita é o espelho).
  const SOBRANCELHA = 'M119 150Q141 132 167 141';
  const SOBRANCELHA_FIOS = 'M160 137L165 129M152 135L154 127';
  const SOBRANCELHA_CENTRO = [143, 142];

  // Pálpebra de cima, desenhada FECHADA (o CSS a levanta para abrir).
  const PALPEBRA = 'M112 96L184 96L184 208Q148 222 112 208Z';
  const CILIOS = 'M115 207.4Q148 220.6 181 207.4';
  // Pálpebra de baixo (a bochecha que sobe no sorriso), desenhada na posição de sorriso.
  const PALPEBRA_BAIXO = 'M112 252L112 213Q148 186 184 213L184 252Z';

  // Olhos fechados: arco de contentamento (ronronando) e arco de sono.
  const ARCO_FELIZ = 'M126 191Q148 166 170 191';
  const ARCO_SONO = 'M126 185Q148 207 170 185';

  // Focinho: duas almofadinhas fofas, o narizinho e o queixo.
  const ALMOFADAS = [[185, 227], [215, 227]];
  const NARIZ = 'M190 207Q200 202 210 207Q208.5 214.5 200 218Q191.5 214.5 190 207Z';
  const PINTINHAS = [[174, 224], [176, 232], [183, 236], [172, 216]];

  // Bigodes compridos (os da direita são o espelho), meio caídos de jeito.
  const BIGODES = 'M172 223Q116 208 46 210M172 231Q118 228 52 244M174 238Q126 242 70 264';
  const RAIZ_BIGODE = [172, 230];

  // Boca, embaixo das almofadinhas.
  const BOCA_Y = 242;
  const MEIO = `M200 218L200 ${BOCA_Y - 4}`;
  const BOCA = {
    // bico de emburrado: cantinhos para baixo e o lábio de baixo para fora
    bico: `${MEIO}M191 ${BOCA_Y + 5}Q200 ${BOCA_Y - 5} 209 ${BOCA_Y + 5}M195 ${BOCA_Y + 8}Q200 ${BOCA_Y + 11} 205 ${BOCA_Y + 8}`,
    reta: `${MEIO}M191 ${BOCA_Y + 1}Q200 ${BOCA_Y - 1} 210 ${BOCA_Y + 2}`,
    cantinho: `${MEIO}M190 ${BOCA_Y}Q197 ${BOCA_Y + 3} 202 ${BOCA_Y + 2}Q208 ${BOCA_Y + 1} 212 ${BOCA_Y - 4}`,
    w: `${MEIO}M200 ${BOCA_Y - 4}Q196 ${BOCA_Y + 4} 189 ${BOCA_Y + 1}M200 ${BOCA_Y - 4}Q204 ${BOCA_Y + 4} 211 ${BOCA_Y + 1}`,
    sono: `${MEIO}M195 ${BOCA_Y}Q200 ${BOCA_Y + 3} 205 ${BOCA_Y}`,
    aberta: `M187 ${BOCA_Y - 2}Q200 ${BOCA_Y - 5} 213 ${BOCA_Y - 2}C212 ${BOCA_Y + 14} 188 ${BOCA_Y + 14} 187 ${BOCA_Y - 2}Z`,
  };
  const BOCA_O = { cx: 200, cy: BOCA_Y + 3, rx: 6, ry: 7.5 };
  const BOCA_BOCEJO = { cx: 200, cy: BOCA_Y + 4, rx: 13, ry: 16 };

  // Corpo de pera, peito branco armado, pernas curtas de meia branca, coxas redondas.
  const CORPO_LISO = formaSimetrica([200, 228], [
    [268, 228, 318, 268, 326, 326],
    [333, 378, 306, 404, 200, 404],
  ]);
  const CORPO = peludo(pontosDe(CORPO_LISO, 16), (x, y) => (y > 376 ? 0 : 2.5), rnd);
  const PEITO_LISO = formaSimetrica([200, 252], [
    [250, 252, 276, 292, 272, 336],
    [270, 376, 248, 404, 200, 406],
  ]);
  const PEITO = peludo(pontosDe(PEITO_LISO, 14), (x, y) => (y > 356 ? 2 : 7), rnd);
  const COXA_LISA = forma([66, 372], [
    [62, 340, 84, 318, 110, 318], [138, 318, 152, 340, 150, 368], [148, 396, 128, 406, 104, 405], [80, 404, 68, 394, 66, 372],
  ]);
  const COXA = peludo(pontosDe(COXA_LISA, 14), (x, y) => (y > 390 || x > 138 ? 0 : 3.5), rnd, 108);
  // perna curtinha e gordinha: o peito armado cobre o comecinho
  const PERNA = 'M149 368C147 382 145 392 144 401C143 411 155 416 168 416C181 416 193 411 192 401C191 392 189 382 187 368Z';
  const DEDOS = 'M161 414L161 406M175 414L175 406';

  // Rabo de espanador: sai de trás da coxa direita e sobe fazendo um "S".
  const RABO_CURVAS = [
    [[292, 396], [352, 408], [390, 366], [384, 304]],
    [[384, 304], [380, 258], [364, 236], [376, 190]],
  ];
  const larguraDoRabo = t => (t < .1 ? 26 + t * 120 : t < .5 ? 38 + (t - .1) * 12 : 43 - (t - .5) * 10);
  const RABO_TUBO = tubo(RABO_CURVAS, larguraDoRabo);
  const RABO = peludo(reamostrar(RABO_TUBO.pontos, 15), (x, y) => (y > 372 && x < 330 ? 0 : 6.5), rnd, 360);
  const PONTA_FIM = RABO_CURVAS[1][3];

  // ---------------------------------------------------------------- enroscado

  // Deitado em bolinha (dormindo, e no fim do amassar pãozinho). A cabeça é a do
  // sentado; o rabo dá a volta pela frente e a ponta acesa fica perto do rosto.
  const ENROSCADO_LISO = forma([70, 398], [
    [48, 362, 66, 302, 136, 284], [188, 268, 272, 266, 324, 292], [374, 318, 378, 382, 352, 402], [300, 412, 118, 412, 70, 398],
  ]);
  const ENROSCADO = peludo(pontosDe(ENROSCADO_LISO, 16), (x, y) => (y > 394 ? 0 : 4), rnd, 212);
  const RABO_ENR_CURVAS = [
    [[340, 330], [392, 366], [358, 414], [290, 412]],
    [[290, 412], [250, 411], [222, 408], [198, 400]],
  ];
  const RABO_ENR_TUBO = tubo(RABO_ENR_CURVAS, t => (t < .1 ? 24 + t * 120 : 36 - t * 4));
  const RABO_ENR = peludo(reamostrar(RABO_ENR_TUBO.pontos, 15), (x, y) => (x > 330 && y < 350 ? 0 : 5.5), rnd, 280);
  const PONTA_ENR_FIM = RABO_ENR_CURVAS[1][3];
  const PATINHAS_ENROSCADO = [[108, 397, 25, 12], [158, 401, 23, 11]];

  // Mantinha de dormir, que cobre o corpo enroscado (a cabeça fica de fora): uma colcha
  // de retalhos de chita. Os retalhos seguem o volume do corpo (as costuras de cima
  // fazem curva), cada um com a sua estampa; em cima, a dobra mostra o forro.
  const MANTINHA = 'M166 312C210 282 300 276 348 299C384 318 388 384 362 405C332 415 220 415 174 411C158 381 156 337 166 312Z';
  const MANTINHA_DOBRA = 'M170 318C214 292 298 287 342 307';
  // Tecidos: [fundo, estampa, cor da estampa, miolo].
  const TECIDOS = [
    ['#2F4E8E', 'flor', '#F6E7C8', '#E9B23E'],   // chita azul
    ['#DFA23A', 'poa', '#FFF1D2'],               // mostarda de poá
    ['#E58A9E', 'flor', '#FFF4EA', '#D9443A'],   // rosa
    ['#C4473E', 'flor', '#F2C230', '#2F4E8E'],   // vermelho
    ['#F0E1C0', 'flor', '#D9443A', '#E9B23E'],   // creme
    ['#4A957A', 'poa', '#F0E1C0'],               // verde
  ];
  const COLCHA = (() => {
    const r = sorteio(23);
    // (u, v) da colcha -> ponto do desenho, por cima do corpo redondo
    const mapa = (u, v) => [146 + 252 * u + 16 * (u - .5) * v, 270 + 148 * v - 30 * Math.pow(1 - v, 1.2) * Math.sin(Math.PI * u)];
    const vs = [0, .36, .69, 1];
    const ARRANJO = [[0, 1, 4, 2, 5], [3, 4, 0, 5, 1], [2, 5, 1, 3, 0]];
    const linhaEm = (pontos) => 'M' + pontos.map(q => pt(...q)).join('L');
    const retalhos = [];
    let costuras = '', pesponto = '';
    for (let j = 0; j < 3; j++) {
      // cada fileira tem as costuras num lugar um pouco diferente (feito à mão)
      const us = [0, .2, .4, .6, .8, 1].map((u, i, a) => (i && i < a.length - 1 ? u + (r() - .5) * .06 + (j % 2 ? .05 : -.02) : u));
      for (let i = 0; i < 5; i++) {
        const [u0, u1, v0, v1] = [us[i], us[i + 1], vs[j], vs[j + 1]];
        const P = [];
        for (let k = 0; k <= 4; k++) P.push(mapa(u0 + (u1 - u0) * k / 4, v0));
        for (let k = 1; k <= 4; k++) P.push(mapa(u1, v0 + (v1 - v0) * k / 4));
        for (let k = 1; k <= 4; k++) P.push(mapa(u1 - (u1 - u0) * k / 4, v1));
        for (let k = 1; k < 4; k++) P.push(mapa(u0, v1 - (v1 - v0) * k / 4));
        retalhos.push({ d: linhaEm(P) + 'Z', tecido: ARRANJO[j][i] });
        if (i > 0) {
          const costura = [0, 1, 2, 3, 4].map(k => mapa(u0, v0 + (v1 - v0) * k / 4));
          costuras += linhaEm(costura);
          pesponto += linhaEm(costura.map(([x, y]) => [x + 4, y]));
        }
      }
      if (j > 0) {
        const costura = Array.from({ length: 13 }, (_, k) => mapa(k / 12, vs[j]));
        costuras += linhaEm(costura);
        pesponto += linhaEm(costura.map(([x, y]) => [x, y + 4]));
      }
    }
    return { retalhos, costuras, pesponto };
  })();

  // Cobertinha de amassar pãozinho, esticada embaixo dele: tricô rosa com listras
  // creme e uma barrinha de crochê de bicos em volta.
  const COBERTINHA = 'M30 393C40 372 110 362 200 362C290 362 360 372 370 393C378 409 330 425 200 425C70 425 22 409 30 393Z';
  const TRICO = (() => {
    let d = '', fileira = 0;
    for (let y = 367; y <= 423; y += 6.4, fileira++) {
      const k = (y - 393.5) / 31, meia = 170 * Math.sqrt(Math.max(0, 1 - k * k));
      for (let x = 200 - meia + 8 + (fileira % 2) * 4.3; x <= 200 + meia - 8; x += 8.6) {
        d += `M${pt(x - 3.3, y - 2.6)}L${pt(x, y + 2)}L${pt(x + 3.3, y - 2.6)}`;
      }
    }
    return d;
  })();
  const BICOS = Array.from({ length: 46 }, (_, i) => {
    const a = i / 46 * Math.PI * 2;
    return [200 + Math.cos(a) * 170, 394 + Math.sin(a) * 31.5];
  });

  // Fios de pelo (calculados uma vez).
  const FIOS = {
    peito: fios(200, 330, 52, 52, 26, () => Math.PI / 2, rnd, [8, 14]),
    bochechaEsq: fios(102, 236, 34, 22, 12, (x, y) => Math.atan2(y - 200, x - 200), rnd, [7, 12]),
    bochechaDir: fios(298, 236, 34, 22, 12, (x, y) => Math.atan2(y - 200, x - 200), rnd, [7, 12]),
    testa: fios(200, 112, 70, 26, 12, (x) => -Math.PI / 2 + (x - 200) / 140, rnd, [6, 10]),
    corpoEsq: fios(110, 300, 26, 34, 10, () => Math.PI * .62, rnd, [8, 13]),
    corpoDir: fios(290, 300, 26, 34, 10, () => Math.PI * .38, rnd, [8, 13]),
    rabo: (() => {
      let d = '';
      RABO_TUBO.linha.forEach((p, i, l) => {
        if (i < 3 || i > l.length - 4 || rnd() < .45) return;
        const q = l[Math.min(l.length - 1, i + 1)];
        const ang = Math.atan2(q[1] - p[1], q[0] - p[0]) + (rnd() - .5) * .5;
        const lado = (rnd() - .5) * 26;
        const len = 7 + rnd() * 9;
        const x = p[0] - Math.sin(ang) * lado, y = p[1] + Math.cos(ang) * lado;
        const curva = (rnd() - .5) * 6;
        d += `M${pt(x, y)}Q${pt(x + Math.cos(ang) * len / 2 - Math.sin(ang) * curva, y + Math.sin(ang) * len / 2 + Math.cos(ang) * curva)} ${pt(x + Math.cos(ang) * len, y + Math.sin(ang) * len)}`;
      });
      return d;
    })(),
  };

  // ---------------------------------------------------------------- grão de pintura

  let grao = null;
  function gerarGrao() {
    const tam = 128, c = document.createElement('canvas');
    c.width = c.height = tam;
    const g = c.getContext('2d');
    const img = g.createImageData(tam, tam);
    const sorte = sorteio(11);
    for (let i = 0; i < tam * tam; i++) {
      const v = sorte() * 2 - 1;
      const k = i * 4;
      const cor = v > 0 ? 255 : 40;
      img.data[k] = cor;
      img.data[k + 1] = cor;
      img.data[k + 2] = v > 0 ? 245 : 30;
      img.data[k + 3] = Math.pow(Math.abs(v), 2.4) * 120;
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  // Padrão de grão usado por todos os Momons da página (pôr uma vez, em qualquer lugar).
  function texturas() {
    if (!grao && typeof document !== 'undefined') grao = gerarGrao();
    if (!grao) return '';
    return `<svg class="momon-texturas" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>` +
      `<pattern id="momon-grao" patternUnits="userSpaceOnUse" width="90" height="90"><image href="${grao}" width="90" height="90"/></pattern>` +
      `</defs></svg>`;
  }

  // ---------------------------------------------------------------- montagem

  function criar(opcoes) {
    const { prefixo = '', humor = PROGRESSAO[0], pose = 'sentado' } = opcoes || {};
    const ref = nome => `momon-${prefixo}${nome}`; // ids internos (defs)
    const url = nome => `url(#${ref(nome)})`;
    const origem = ([x, y]) => ` style="transform-origin:${x}px ${y}px"`;
    const parte = (nome, conteudo, centro, extra = '') =>
      `<g id="${prefixo}${nome}" data-parte="${nome}"${extra}${centro ? origem(centro) : ''}>${conteudo}</g>`;

    const linha = (largura, cor) =>
      `fill="none" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round" stroke-linejoin="round"`;

    const paradas = lista => lista.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
    const radial = (nome, lista, atributos = '') => `<radialGradient id="${ref(nome)}"${atributos}>${paradas(lista)}</radialGradient>`;
    const linear = (nome, lista, atributos) => `<linearGradient id="${ref(nome)}" ${atributos}>${paradas(lista)}</linearGradient>`;
    const vertical = 'x1="0" y1="0" x2="0" y2="1"';
    const clip = (nome, d) => `<clipPath id="${ref(nome)}"><path d="${d}"/></clipPath>`;

    const defs = `<defs>` +
      clip('clip-cabeca', CABECA) + clip('clip-corpo', CORPO) + clip('clip-orelha', ORELHA_DENTRO) +
      clip('clip-rabo', RABO) + clip('clip-rabo-enr', RABO_ENR) +
      ['esq', 'dir'].map(lado =>
        `<clipPath id="${ref('clip-olho-' + lado)}"><ellipse cx="${OLHO[lado][0]}" cy="${OLHO[lado][1]}" rx="${OLHO.rx + 2}" ry="${OLHO.ry + 2}"/></clipPath>`).join('') +
      clip('clip-boca', BOCA.aberta) +
      `<clipPath id="${ref('clip-boca-bocejo')}"><ellipse cx="${BOCA_BOCEJO.cx}" cy="${BOCA_BOCEJO.cy}" rx="${BOCA_BOCEJO.rx}" ry="${BOCA_BOCEJO.ry}"/></clipPath>` +
      // a ponta do rabo: o que fica além de um círculo de pelo em volta do fim
      `<clipPath id="${ref('clip-ponta')}"><path d="${peludo(reamostrar(Array.from({ length: 36 }, (_, i) => [PONTA_FIM[0] + Math.cos(i / 36 * Math.PI * 2) * 42, PONTA_FIM[1] + 6 + Math.sin(i / 36 * Math.PI * 2) * 42]), 9), () => 5, sorteio(7))}"/></clipPath>` +
      `<clipPath id="${ref('clip-ponta-enr')}"><circle cx="${PONTA_ENR_FIM[0] - 6}" cy="${PONTA_ENR_FIM[1]}" r="38"/></clipPath>` +
      // luz e sombra (fosco: nada de brilho branco de plástico)
      radial('sombra', [[0, COR.sombra, 0], [.5, COR.sombra, .02], [.82, COR.sombra, .26], [1, COR.sombra, .38]],
        ' cx=".4" cy=".3" r=".8" fx=".34" fy=".2"') +
      radial('quente', [[0, COR.luzQuente, .34], [1, COR.luzQuente, 0]], ' cx=".26" cy=".28" r=".6"') +
      radial('fria', [[0, COR.luzFria, 0], [.82, COR.luzFria, 0], [.94, COR.luzFria, .55], [1, COR.luzFria, 0]], ' cx=".3" cy=".42" r=".76"') +
      radial('rebatida', [[0, '#FFE9D2', .45], [1, '#FFE9D2', 0]]) +
      radial('oclusao', [[0, '#4A1A10', .42], [1, '#4A1A10', 0]]) +
      radial('chao', [[0, '#1C1220', .45], [.55, '#1C1220', .2], [1, '#1C1220', 0]]) +
      radial('branco', [[0, COR.branco], [.7, COR.branco], [1, COR.branco, 0]]) +
      radial('rubor', [[0, COR.bochecha, .75], [.55, COR.bochecha, .32], [1, COR.bochecha, 0]]) +
      radial('olheira', [[0, COR.sombra, 0], [.78, COR.sombra, 0], [.9, COR.sombra, .22], [1, COR.sombra, 0]]) +
      radial('iris', [[0, '#FFE592'], [.42, '#F4B94B'], [.82, '#D5832A'], [1, '#9D5118']], ' cx=".5" cy=".62" r=".6"') +
      linear('olho-sombra', [[0, '#1E0E08', .62], [.46, '#1E0E08', 0]], vertical) +
      linear('palpebra', [[0, COR.ruivo], [.8, COR.ruivo], [1, COR.ruivoSombra]], vertical) +
      linear('nariz', [[0, '#F0A0AE'], [.55, COR.nariz], [1, '#B4525F']], 'x1=".3" y1="0" x2=".6" y2="1"') +
      radial('almofada', [[0, '#FFFFFF'], [.55, COR.branco], [1, COR.brancoSombra]], ' cx=".42" cy=".34" r=".78"') +
      linear('lua', [[0, '#FFF3CC'], [1, '#F0C977']], 'x1="0" y1="0" x2="1" y2="1"') +
      linear('dentro-orelha', [[0, '#F7B9C2'], [.6, COR.rosaOrelha], [1, '#B8606F']], 'x1=".3" y1="0" x2=".7" y2="1"') +
      linear('perna', [[0, COR.branco, 0], [.22, COR.branco], [1, COR.branco]], vertical) +
      radial('pata', [[0, '#FFFFFF'], [.5, COR.branco], [1, COR.brancoSombra]], ' cx=".4" cy=".3" r=".85"') +
      linear('boca', [[0, '#3F1418'], [1, '#7E2E3A']], vertical) +
      radial('luz-lua', [[0, '#FFF7D6', .95], [.5, '#FFEBA8', .45], [1, '#FFEBA8', 0]]) +
      radial('luz-vagalume', [[0, '#FFFBE0'], [.4, '#FFF08A', .6], [1, '#FFE45C', 0]]) +
      radial('ponta-acesa', [[0, '#FFFDE8'], [.5, '#FFF29A'], [1, '#FFE066', .85]], ' cx=".5" cy=".4" r=".6"') +
      TECIDOS.map(([fundo, estampa, cor, miolo], i) => estampa === 'poa'
        ? `<pattern id="${ref('tecido-' + i)}" patternUnits="userSpaceOnUse" width="13" height="11">` +
          `<rect width="13" height="11" fill="${fundo}"/><circle cx="3" cy="3" r="1.9" fill="${cor}"/><circle cx="9.5" cy="8.5" r="1.9" fill="${cor}"/></pattern>`
        : `<pattern id="${ref('tecido-' + i)}" patternUnits="userSpaceOnUse" width="26" height="22">` +
          `<rect width="26" height="22" fill="${fundo}"/>` +
          [[6.5, 6], [19.5, 17]].map(([x, y]) =>
            [0, 1, 2, 3, 4].map(k => `<circle cx="${n(x + Math.cos(k * 1.2566 - 1.57) * 2.9)}" cy="${n(y + Math.sin(k * 1.2566 - 1.57) * 2.9)}" r="2.3" fill="${cor}"/>`).join('') +
            `<circle cx="${x}" cy="${y}" r="1.6" fill="${miolo}"/>`).join('') +
          `<path d="M14 4Q16 2 18.5 3.5M1 14Q3 12 5.5 13.5" stroke="#5E9B5A" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
          `</pattern>`).join('') +
      radial('colcha-luz', [[0, '#FFE2B0', .22], [.5, '#FFE2B0', 0], [.85, '#20142E', .18], [1, '#20142E', .32]], ' cx=".34" cy=".2" r=".85"') +
      linear('cobertinha', [[0, '#F2A6B6'], [1, '#D97A90']], vertical) +
      radial('amassado', [[0, '#9E4A62', .5], [1, '#9E4A62', 0]]) +
    `</defs>`;

    // Mancha macia: elipse com borda que some (pelo branco, sombra, bochecha).
    const mancha = (cx, cy, rx, ry, preenchimento, extra = '') =>
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${url(preenchimento)}"${extra}/>`;
    // Luz de um volume: sombra quente embaixo à direita, abajur em cima à esquerda,
    // lua na borda direita e o grão de pintura por cima.
    const luz = (d, { quente = true, fria = true, grao: comGrao = true } = {}) =>
      `<path d="${d}" fill="${url('sombra')}"/>` +
      (quente ? `<path d="${d}" fill="${url('quente')}"/>` : '') +
      (fria ? `<path d="${d}" fill="${url('fria')}"/>` : '') +
      (comGrao ? `<path class="grao" d="${d}" fill="url(#momon-grao)" opacity=".38"/>` : '');
    // Forma com borda macia (pelo): o preenchimento e, por fora, traços cada vez
    // mais largos e transparentes. Faz o papel de um desfoque, sem filtro.
    const macio = (d, cor) =>
      [[20, .07], [13, .13], [7, .24], [3, .45]].map(([largura, a]) =>
        `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${largura}" stroke-opacity="${a}" stroke-linejoin="round"/>`).join('') +
      `<path d="${d}" fill="${cor}"/>`;
    const tracos = (d, cor, largura, a) => `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round" opacity="${a}"/>`;

    const chao = mancha(200, 406, 176, 19, 'chao');

    // ------------------------------------------------ rabo (atrás de tudo)
    const pontaAcesa = d => `<g class="ponta-acesa"><path d="${d}" fill="${url('ponta-acesa')}"/></g>`;
    const rabo = parte('rabo',
      `<circle class="ponta-luz" cx="${PONTA_FIM[0]}" cy="${PONTA_FIM[1]}" r="58" fill="${url('luz-vagalume')}"/>` +
      `<path d="${RABO}" fill="${COR.ruivo}"/>` +
      `<g clip-path="${url('clip-rabo')}">` + luz(RABO) + tracos(FIOS.rabo, COR.ruivoClaro, 2, .55) + `</g>` +
      parte('ponta-rabo',
        `<g clip-path="${url('clip-ponta')}">` +
          `<path d="${RABO}" fill="${COR.pontaRabo}"/>` + luz(RABO, { quente: false }) +
          pontaAcesa(RABO) +
        `</g>`,
        PONTA_FIM) +
      // o corpo faz sombra no começo do rabo
      mancha(296, 390, 40, 24, 'oclusao'),
      RABO_CURVAS[0][0]);

    // ------------------------------------------------ corpo, peito, coxas
    const coxa = `<path d="${COXA}" fill="${COR.ruivo}"/>` + luz(COXA, { fria: false }) +
      `<path d="M146 360Q140 392 122 404" fill="none" stroke="${COR.ruivoFundo}" stroke-width="5" stroke-linecap="round" opacity=".28"/>` +
      mancha(118, 408, 18, 5, 'oclusao') + `<ellipse cx="117" cy="405" rx="16" ry="8" fill="${url('pata')}"/>` +
      `<path d="M112 411L112 406M121 411L121 406" ${linha(2, '#C9A894')}/>`;
    const corpo = parte('corpo',
      `<path d="${CORPO}" fill="${COR.ruivo}"/>` +
      `<g clip-path="${url('clip-corpo')}">` +
        luz(CORPO) +
        tracos(FIOS.corpoEsq + FIOS.corpoDir, COR.ruivoSombra, 1.8, .45) +
        parte('peito-barriga',
          `<path d="${PEITO}" fill="${COR.branco}"/>` + luz(PEITO, { quente: false }) +
          tracos(FIOS.peito, COR.brancoSombra, 1.6, .8),
          [200, 400]) +
        // a cabeça faz sombra no peito
        mancha(200, 286, 132, 38, 'oclusao') +
      `</g>` +
      coxa + espelhar(coxa),
      [200, 404]);

    // Perna curta de meia branca; o topo some dentro do peito.
    const pata = (lado, dx) => parte(`pata-${lado}`,
      `<g transform="translate(${dx} 0)">` +
        mancha(167, 414, 30, 7, 'oclusao') +
        `<path d="${PERNA}" fill="${url('perna')}"/>` +
        `<path d="M186 380C188 390 190 396 190 402" fill="none" stroke="${COR.brancoSombra}" stroke-width="4" stroke-linecap="round" opacity=".7"/>` +
        `<path d="${DEDOS}" ${linha(2.4, '#C9A894')}/>` +
      `</g>`,
      [167 + dx, 412]);

    // ------------------------------------------------ cabeça
    const orelha = (dobrada) => `<g class="orelha-mexe"${origem([124, 118])}>` +
      `<path d="${dobrada ? ORELHA_DOBRADA : ORELHA}" fill="${COR.ruivo}"/>` + luz(dobrada ? ORELHA_DOBRADA : ORELHA, { fria: false }) +
      `<path d="${ORELHA_DENTRO}" fill="${url('dentro-orelha')}"/>` +
      `<g clip-path="${url('clip-orelha')}">` +
        `<path class="orelha-rubor" d="${ORELHA_DENTRO}" fill="#FF6F91"/>` +
        `<path d="${ORELHA_DENTRO}" fill="none" stroke="${COR.sombra}" stroke-opacity=".3" stroke-width="12"/>` +
      `</g>` +
      tracos(ORELHA_TUFO, COR.branco, 2.6, .9) +
      (dobrada
        ? `<path d="M72 76Q90 60 110 54" fill="none" stroke="${COR.ruivoFundo}" stroke-width="6" opacity=".35" stroke-linecap="round"/>` +
          `<path d="${ORELHA_ABA}" fill="${COR.ruivo}"/>` + luz(ORELHA_ABA, { fria: false, grao: false })
        : '') +
      mancha(128, 128, 52, 30, 'oclusao') +
    `</g>`;

    const LUA = crescente(198, 106, 15, 7.5, -5.5, 13);
    const lua = parte('lua-testa',
      `<circle class="lua-luz" cx="200" cy="106" r="38" fill="${url('luz-lua')}"/>` +
      `<path d="${LUA}" fill="${url('lua')}"/>` +
      `<path class="lua-acesa" d="${LUA}" fill="#FFFBE8"/>`,
      [200, 106]);

    const sobrancelha = `<path d="${SOBRANCELHA}" ${linha(9, COR.ruivoFundo)} opacity=".35" transform="translate(0 2.5)"/>` +
      `<path d="${SOBRANCELHA}" ${linha(7.5, '#FFF0D6')}/>` + tracos(SOBRANCELHA_FIOS, '#FFF0D6', 2.4, 1);
    const [scx, scy] = SOBRANCELHA_CENTRO;
    const sobrancelhas = `<g class="sobrancelhas">` +
      `<g class="sobrancelha sobrancelha-esq"${origem([scx, scy])}>${sobrancelha}</g>` +
      `<g class="sobrancelha sobrancelha-dir"${origem([400 - scx, scy])}>${espelhar(sobrancelha)}</g>` +
    `</g>`;

    const olho = (lado) => {
      const [x, y] = OLHO[lado];
      return parte(`olho-${lado}`,
        `<g class="var v-aberto">` +
          mancha(x, y + 1, OLHO.rx + 7, OLHO.ry + 7, 'olheira') +
          `<ellipse cx="${x}" cy="${y}" rx="${OLHO.rx}" ry="${OLHO.ry}" fill="#3B200F"/>` +
          `<ellipse cx="${x}" cy="${y}" rx="${OLHO.rx - 1.6}" ry="${OLHO.ry - 1.6}" fill="${url('iris')}"/>` +
          `<g class="pupila"${origem([x, y + 2])}><ellipse cx="${x}" cy="${y + 2}" rx="13" ry="16.5" fill="${COR.pupila}"/></g>` +
          `<ellipse cx="${x}" cy="${y}" rx="${OLHO.rx}" ry="${OLHO.ry}" fill="${url('olho-sombra')}"/>` +
          `<path d="M${x - 14} ${y + 13}Q${x} ${y + 22} ${x + 15} ${y + 11}" fill="none" stroke="${COR.luzFria}" stroke-width="3" stroke-linecap="round" opacity=".45"/>` +
          `<path class="olho-estrela"${origem([x + 8, y - 10])} d="${estrela(x + 8, y - 10, 8.5, 3.8)}" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>` +
          `<circle cx="${x - 9}" cy="${y + 9}" r="3" fill="#fff" opacity=".8"/>` +
        `</g>`,
        [x, y]);
    };

    // Cada pálpebra é recortada no formato do olho; a de cima pisca e emburra, a de baixo sorri.
    const palpebra = (lado) => {
      const [x, y] = OLHO[lado];
      const [ex, ey] = OLHO.esq;
      return `<g class="palpebra palpebra-${lado}" clip-path="${url('clip-olho-' + lado)}"${origem([x, y])}>` +
        `<g transform="translate(${x - ex} 0)">` +
          `<g class="palpebra-cima"${origem([ex, ey])}><path d="${PALPEBRA}" fill="${url('palpebra')}"/><path d="${CILIOS}" ${linha(4, '#3A1A10')}/></g>` +
          `<path class="palpebra-baixo"${origem([ex, ey])} d="${PALPEBRA_BAIXO}" fill="${COR.ruivo}"/>` +
        `</g>` +
      `</g>`;
    };
    const arcos = (d, largura) => `<path d="${d}" ${linha(largura, '#3A1A10')}/>` + espelhar(`<path d="${d}" ${linha(largura, '#3A1A10')}/>`);

    const palpebras = parte('pálpebras',
      palpebra('esq') + palpebra('dir') +
      `<g class="var v-ronronando v-bocejo">${arcos(ARCO_FELIZ, 5)}</g>` +
      `<g class="var v-dormindo">${arcos(ARCO_SONO, 4.6)}</g>`);

    const focinho = parte('focinho',
      mancha(200, 252, 22, 12, 'oclusao') +
      `<ellipse cx="200" cy="254" rx="15" ry="9" fill="${url('almofada')}"/>` +
      ALMOFADAS.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="18.5" fill="${url('almofada')}"/>`).join('') +
      PINTINHAS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${COR.ruivoSombra}" opacity=".45"/>` +
        `<circle cx="${400 - x}" cy="${y}" r="1.5" fill="${COR.ruivoSombra}" opacity=".45"/>`).join('') +
      `<path d="${NARIZ}" fill="${url('nariz')}" stroke="${COR.nariz}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<ellipse cx="196.5" cy="207.5" rx="3" ry="1.5" fill="#fff" opacity=".7"/>`,
      [200, 212]);

    const traco = linha(3.2, COR.boca);
    const boca = parte('boca',
      `<g class="var v-emburrado"><path d="${BOCA.bico}" ${traco}/></g>` +
      `<g class="var v-desconfiado"><path d="${BOCA.reta}" ${traco}/></g>` +
      `<g class="var v-amolecendo"><path d="${BOCA.cantinho}" ${traco}/></g>` +
      `<g class="var v-contente v-amassando v-ronronando"><path d="${BOCA.w}" ${traco}/></g>` +
      `<g class="var v-feliz">` +
        `<path d="${BOCA.aberta}" fill="${url('boca')}"/>` +
        `<ellipse cx="200" cy="${BOCA_Y + 9}" rx="7.5" ry="5" fill="${COR.lingua}" clip-path="${url('clip-boca')}"/>` +
        `<path d="${MEIO}" ${traco}/>` +
      `</g>` +
      `<g class="var v-dormindo"><path d="${BOCA.sono}" ${traco}/></g>` +
      `<g class="var v-surpreso"><path d="${MEIO}" ${traco}/>` +
        `<ellipse cx="${BOCA_O.cx}" cy="${BOCA_O.cy}" rx="${BOCA_O.rx}" ry="${BOCA_O.ry}" fill="${url('boca')}"/></g>` +
      `<g class="var v-bocejo">` +
        `<ellipse cx="${BOCA_BOCEJO.cx}" cy="${BOCA_BOCEJO.cy}" rx="${BOCA_BOCEJO.rx}" ry="${BOCA_BOCEJO.ry}" fill="${url('boca')}"/>` +
        `<ellipse cx="200" cy="${BOCA_BOCEJO.cy + 12}" rx="9" ry="6.5" fill="${COR.lingua}" clip-path="${url('clip-boca-bocejo')}"/>` +
      `</g>`,
      [200, BOCA_Y]);

    // bigode: um fio escuro por baixo e um claro por cima (aparece no claro e no escuro)
    const bigode = `<path d="${BIGODES}" ${linha(2.6, '#6E4A3A')} opacity=".3"/><path d="${BIGODES}" ${linha(1.7, '#FFF9F0')} opacity=".85"/>`;
    const bigodes = parte('bigodes',
      `<g class="bigode bigode-esq"${origem(RAIZ_BIGODE)}>${bigode}</g>` +
      `<g class="bigode bigode-dir"${origem([400 - RAIZ_BIGODE[0], RAIZ_BIGODE[1]])}>${espelhar(bigode)}</g>`,
      [200, 230]);

    const topete = `<g class="topete"${origem([200, 82])}>` +
      `<path d="${TOPETE}" fill="${COR.ruivo}"/>` + luz(TOPETE, { fria: false }) +
    `</g>`;

    // A pele do rosto (pelo branco e bochechas) e os traços andam juntos quando
    // ele vira o rosto; a luz da cabeça fica parada. É isso que dá a ideia de 3D.
    const cabeca = parte('cabeca',
      topete +
      `<g class="orelhas">` +
        parte('orelha-esq', orelha(false), [122, 122]) +
        parte('orelha-dir', espelhar(orelha(true)), [278, 122]) +
      `</g>` +
      `<path d="${CABECA}" fill="${COR.ruivo}"/>` +
      `<g clip-path="${url('clip-cabeca')}">` +
        `<g class="rosto-pele">` +
          macio(MASCARA, COR.branco) +
          tracos(FIOS.bochechaEsq + FIOS.bochechaDir, COR.brancoSombra, 1.6, .9) +
          mancha(116, 228, 22, 12, 'rubor', ' class="bochecha"') +
          mancha(284, 228, 22, 12, 'rubor', ' class="bochecha"') +
        `</g>` +
        luz(CABECA) +
        tracos(FIOS.testa, COR.ruivoSombra, 1.6, .28) +
        mancha(200, 300, 150, 40, 'rebatida') +
      `</g>` +
      `<g class="rosto">` +
        lua + sobrancelhas + olho('esq') + olho('dir') + palpebras + focinho + boca + bigodes +
      `</g>`,
      [200, 280]);

    // ------------------------------------------------ pose enroscado
    const enroscadoAtras = `<g class="pose-enroscado">` +
      mancha(205, 406, 184, 18, 'chao') +
      `<g class="respira-enroscado"${origem([210, 406])}>` +
        `<path d="${ENROSCADO}" fill="${COR.ruivo}"/>` +
        `<g clip-path="url(#${ref('clip-enr')})">` + luz(ENROSCADO) + `</g>` +
      `</g>` +
      // embaixo da mantinha o rabo continua lá (só a pontinha fica de fora)
      `<path d="${RABO_ENR}" fill="${COR.ruivo}"/>` +
      `<g clip-path="${url('clip-rabo-enr')}">` + luz(RABO_ENR) + `</g>` +
    `</g>`;
    const enroscadoFrente = `<g class="pose-enroscado">` +
      `<circle class="ponta-luz" cx="${PONTA_ENR_FIM[0]}" cy="${PONTA_ENR_FIM[1]}" r="52" fill="${url('luz-vagalume')}"/>` +
      `<g class="rabo-enr-fora">` +
        `<path d="${RABO_ENR}" fill="${COR.ruivo}"/>` +
        `<g clip-path="${url('clip-rabo-enr')}">` + luz(RABO_ENR) + `</g>` +
      `</g>` +
      `<g clip-path="${url('clip-ponta-enr')}">` +
        `<path d="${RABO_ENR}" fill="${COR.pontaRabo}"/>` + luz(RABO_ENR, { quente: false }) + pontaAcesa(RABO_ENR) +
      `</g>` +
      PATINHAS_ENROSCADO.map(([cx, cy, rx, ry]) =>
        mancha(cx, cy + 9, rx, 5, 'oclusao') + `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${url('pata')}"/>`).join('') +
    `</g>`;

    // ------------------------------------------------ cobertas
    const cobertinha = `<g class="cobertinha"${origem([200, 400])}>` +
      BICOS.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="6.5" fill="#F4E6CC"/>`).join('') +
      `<path d="${COBERTINHA}" fill="${url('cobertinha')}"/>` +
      `<g clip-path="${url('clip-cobertinha')}">` +
        `<rect x="0" y="377" width="400" height="7" fill="#F6E4CF"/><rect x="0" y="403" width="400" height="7" fill="#F6E4CF"/>` +
        `<path d="${TRICO}" ${linha(2, '#FFF4F0')} opacity=".38"/>` +
        `<path d="${TRICO}" ${linha(1.4, '#8E3A52')} opacity=".22" transform="translate(0 2)"/>` +
      `</g>` +
      `<path d="${COBERTINHA}" fill="none" stroke="#B9637A" stroke-width="2" opacity=".5"/>` +
      mancha(167, 411, 34, 9, 'amassado', ' class="amassado amassado-esq" style="transform-origin:167px 411px"') +
      mancha(233, 411, 34, 9, 'amassado', ' class="amassado amassado-dir" style="transform-origin:233px 411px"') +
    `</g>`;
    const mantinha = `<g class="mantinha"><g class="mantinha-respira"${origem([260, 410])}>` +
      mancha(262, 410, 104, 10, 'oclusao') +
      `<g clip-path="${url('clip-mantinha')}">` +
        COLCHA.retalhos.map(({ d, tecido }) => `<path d="${d}" fill="${url('tecido-' + tecido)}"/>`).join('') +
        `<path d="${COLCHA.costuras}" ${linha(2.2, '#2A1620')} opacity=".3"/>` +
        `<path d="${COLCHA.pesponto}" ${linha(1.5, '#FFF4DC')} stroke-dasharray="3.5 3" opacity=".75"/>` +
        `<path d="${MANTINHA}" fill="${url('colcha-luz')}"/>` +
        `<path class="grao" d="${MANTINHA}" fill="url(#momon-grao)" opacity=".3"/>` +
        // o forro aparecendo na dobra de cima, com o pesponto
        `<path d="${MANTINHA_DOBRA}" ${linha(26, '#F3E7CF')}/>` +
        `<path d="${MANTINHA_DOBRA}" ${linha(1.5, '#C4473E')} stroke-dasharray="3.5 3" opacity=".7" transform="translate(0 7)"/>` +
        `<path d="${MANTINHA_DOBRA}" ${linha(4, '#5B2A2A')} opacity=".22" transform="translate(0 13)"/>` +
        // viés em volta
        `<path d="${MANTINHA}" fill="none" stroke="#A8423A" stroke-width="7"/>` +
      `</g>` +
    `</g></g>`;

    return `<svg class="momon" viewBox="0 0 400 420" data-humor="${humor}" data-pose="${pose}" role="img" aria-label="Momon, o gatinho" xmlns="http://www.w3.org/2000/svg">` +
      defs.replace('</defs>', clip('clip-enr', ENROSCADO) + clip('clip-mantinha', MANTINHA) + clip('clip-cobertinha', COBERTINHA) + '</defs>') +
      `<g class="pulo"${origem([200, 410])}>` +
        cobertinha +
        `<g class="pose-sentado"${origem([200, 405])}>` + chao + rabo + corpo + pata('esq', 0) + pata('dir', 66) + `</g>` +
        enroscadoAtras + mantinha + enroscadoFrente +
        `<g class="cabeca-pose"${origem([200, 280])}><g class="cabeca-respira">` + cabeca + `</g></g>` +
      `</g>` +
      `</svg>`;
  }

  window.Momon = window.Momon || {};
  window.Momon.svg = { criar, texturas, HUMORES, PROGRESSAO, ESPECIAIS, OUTROS, PARTES, COR };
})();
