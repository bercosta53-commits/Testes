/*
 * Momon — o gatinho, desenhado em SVG com partes separadas para animar.
 *
 *   Momon.svg.criar({ humor: 'emburrado', prefixo: '' })  -> string <svg>
 *
 * Personalidade: o Momon é emburradinho, mas muito carinhoso. Os humores de
 * PROGRESSAO vão do emburrado ao feliz: é o caminho que o carinho e a atenção
 * fazem com ele. Emburrado aqui é bico e nariz empinado, nunca bravo nem triste.
 *
 * Estilo levemente 3D, sem contorno: cada volume tem a cor do pelo e, por cima,
 * uma camada de luz (brilho em cima à esquerda, sombra embaixo à direita).
 * Só gradientes, nenhum filtro, para animar leve em tablet modesto.
 *
 * Cada parte é um <g id="..." data-parte="..."> (ids do briefing). O `prefixo`
 * só existe para quando há vários Momons na mesma página (ids não podem repetir);
 * no app ele fica vazio e os ids saem exatamente como "cabeca", "rabo" etc.
 * O CSS deve mirar [data-parte="..."], que vale para qualquer prefixo.
 *
 * Esquerda/direita são as da TELA (de quem olha), não as do gato:
 * tocar no lado esquerdo da tela mexe a "pata-esq".
 *
 * O humor fica em data-humor no <svg>; as poses, cores e transições de cada
 * humor estão em momon.css. Nenhum grupo animável recebe o atributo transform
 * (o CSS sobrescreveria): quando uma forma precisa ser deslocada ou espelhada,
 * ela ganha um <g> interno.
 */
(function () {
  'use strict';

  // Do emburrado ao feliz: é por aqui que o carinho vai levando o Momon.
  const PROGRESSAO = ['emburrado', 'desconfiado', 'amolecendo', 'contente', 'feliz'];
  const ESPECIAIS = ['ronronando', 'dormindo', 'surpreso'];
  const HUMORES = [...PROGRESSAO, ...ESPECIAIS];

  const PARTES = [
    'corpo', 'peito-barriga', 'cabeca', 'orelha-esq', 'orelha-dir',
    'olho-esq', 'olho-dir', 'pálpebras', 'focinho', 'boca', 'bigodes',
    'lua-testa', 'pata-esq', 'pata-dir', 'rabo', 'ponta-rabo',
  ];

  const COR = {
    laranja: '#F4A45E',
    laranjaSombra: '#D57A3D',
    laranjaLuz: '#FFC892',
    branco: '#FFF9F1',
    sombra: '#7A3A4A',     // cor da sombra que cai sobre o pelo (laranja e branco)
    rosaOrelha: '#F7A3B3',
    nariz: '#F2849C',
    olho: '#1C1015',
    lua: '#FCE4A8',
    pontaRabo: '#FFF4DE',
    bochecha: '#FF8EA6',
    boca: '#6E3528',
    lingua: '#FF8FA3',
    bigode: '#C9A595',
  };

  const RABO_L = 30; // grossura do rabo

  // Olhos: centro e raios.
  const OLHO = { rx: 25, ry: 30, esq: [148, 174], dir: [252, 174] };

  const n = v => Math.round(v * 10) / 10;
  const pt = (x, y) => `${n(x)} ${n(y)}`;

  // Espelha um conteúdo na vertical x = 200 (desenho do lado esq -> lado dir).
  const espelhar = conteudo => `<g transform="matrix(-1 0 0 1 400 0)">${conteudo}</g>`;

  // Contorno simétrico: recebe a metade direita (de cima até embaixo, ambos em
  // x = 200) como curvas [c1x, c1y, c2x, c2y, x, y] e fecha pela metade espelhada.
  function simetrico(inicio, curvas) {
    const pontos = [inicio];
    let d = `M${pt(...inicio)}`;
    for (const c of curvas) {
      d += `C${pt(c[0], c[1])} ${pt(c[2], c[3])} ${pt(c[4], c[5])}`;
      pontos.push([c[4], c[5]]);
    }
    for (let i = curvas.length - 1; i >= 0; i--) {
      const c = curvas[i], ant = pontos[i];
      d += `C${pt(400 - c[2], c[3])} ${pt(400 - c[0], c[1])} ${pt(400 - ant[0], ant[1])}`;
    }
    return d + 'Z';
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

  // Trecho final [t..1] de uma curva cúbica (de Casteljau).
  function finalDaCurva([p0, p1, p2, p3], t) {
    const mix = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const q0 = mix(p0, p1), q1 = mix(p1, p2), q2 = mix(p2, p3);
    const r0 = mix(q0, q1), r1 = mix(q1, q2), s = mix(r0, r1);
    return `M${pt(...s)}C${pt(...r1)} ${pt(...q2)} ${pt(...p3)}`;
  }

  // ---------------------------------------------------------------- formas

  // Cabeça grande e larga, com um tufinho de pelo em cada bochecha.
  const CABECA = simetrico([200, 66], [
    [288, 66, 344, 112, 345, 172],
    [346, 196, 341, 214, 333, 226],
    [340, 232, 347, 238, 350, 246],
    [344, 249, 336, 251, 328, 253],
    [306, 274, 262, 283, 200, 283],
  ]);

  // Pelo branco da parte de baixo do rosto (bochechas + ponta do focinho).
  const MASCARA = 'M24 300L24 228C60 208 112 204 146 215C166 221 180 201 200 199C220 201 234 221 254 215C288 204 340 208 376 228L376 300Z';

  // Corpo de bolinha de pão, com os pezinhos de trás aparecendo dos lados.
  const CORPO = simetrico([200, 214], [
    [272, 214, 324, 268, 331, 334],
    [336, 386, 298, 401, 200, 401],
  ]);
  const PE_TRAS = 'M82 401C82 392 91 387 104 387C117 387 126 392 126 401C126 408 117 411 104 411C91 411 82 408 82 401Z';

  // Orelha esquerda (a direita é o espelho). A base fica escondida atrás da cabeça.
  const ORELHA = 'M66 162C52 120 54 70 76 46C88 32 108 32 126 44C150 60 174 78 190 94Z';
  const ORELHA_DENTRO = 'M84 146C76 114 76 82 90 64C98 54 110 54 120 62C140 76 156 90 168 102Z';
  const ORELHA_TUFO = 'M93 104Q86 88 92 72M106 101Q103 89 108 79';

  const PATA = 'M137 396C136 377 149 368 163 368C177 368 190 377 189 396C189 405 178 408 163 408C148 408 137 405 137 396Z';
  const DEDOS = 'M155 407L155 399M171 407L171 399';

  // Rabo: sai de trás do corpo, faz um "S" e sobe pela direita.
  const RABO_CURVAS = [
    [[262, 388], [326, 398], [376, 374], [374, 322]],
    [[374, 322], [372, 280], [352, 262], [360, 224]],
    [[360, 224], [363, 208], [372, 198], [383, 193]],
  ];
  const RABO = `M${pt(...RABO_CURVAS[0][0])}` +
    RABO_CURVAS.map(([, a, b, c]) => `C${pt(...a)} ${pt(...b)} ${pt(...c)}`).join('');
  // A ponta clarinha (a que acende como vaga-lume) é o finalzinho da última curva.
  const PONTA = finalDaCurva(RABO_CURVAS[2], 0.3);
  const PONTA_FIM = RABO_CURVAS[2][3];

  // Pálpebra de cima, desenhada FECHADA (o CSS a levanta para abrir).
  const PALPEBRA = 'M110 92L186 92L186 199Q148 213 110 199Z';
  const CILIOS = 'M113 198.4Q148 212.4 183 198.4';
  // Pálpebra de baixo (a bochecha que sobe no sorriso), desenhada na posição de sorriso.
  const PALPEBRA_BAIXO = 'M110 240L110 202Q148 180 186 202L186 240Z';

  // Olhos fechados: arco de contentamento (ronronando) e arco de sono.
  const ARCO_FELIZ = 'M125 183Q148 158 171 183';
  const ARCO_SONO = 'M125 177Q148 199 171 177';

  const NARIZ = 'M189.5 204.5Q200 199 210.5 204.5Q208.5 212 200 215.5Q191.5 212 189.5 204.5Z';

  const BIGODES = 'M126 214Q92 202 36 200M126 224Q92 218 38 220';

  // Boca: o tracinho do nariz até a boca e o "w".
  const BOCA_Y = 223;
  const MEIO_W = `M200 216L200 ${BOCA_Y}`;
  function bocaW(abre, fundo) {
    const lado = s => {
      const x = k => 200 + s * abre * k;
      return `M200 ${BOCA_Y}Q${n(x(.45))} ${BOCA_Y + fundo} ${n(x(1))} ${n(BOCA_Y + fundo * .7)}` +
        `Q${n(x(1.3))} ${n(BOCA_Y + fundo * .45)} ${n(x(1.35))} ${n(BOCA_Y - fundo * .05)}`;
    };
    return MEIO_W + lado(-1) + lado(1);
  }
  const BOCA_ABERTA = `M187 ${BOCA_Y + 2}C189 ${BOCA_Y + 21} 211 ${BOCA_Y + 21} 213 ${BOCA_Y + 2}C206 ${BOCA_Y + 6} 194 ${BOCA_Y + 6} 187 ${BOCA_Y + 2}Z`;
  // Bico de emburrado: cantos para baixo e o lábio de baixo um pouco para fora.
  const BOCA_BICO = `M200 216L200 222M190.5 230Q194 222.5 200 222Q206 222.5 209.5 230M195.5 232.5Q200 235.5 204.5 232.5`;
  // Desconfiado: quase reto.
  const BOCA_RETA = `${MEIO_W}M190 226Q195 224.5 200 ${BOCA_Y}Q205 224.5 210 226`;
  // Amolecendo: segurando o sorriso, só um cantinho sobe.
  const BOCA_CANTINHO = `${MEIO_W}M200 ${BOCA_Y}Q194.5 227 189.5 225.5M200 ${BOCA_Y}Q205 229.5 211 226.5Q213.5 225 214 222`;

  // ---------------------------------------------------------------- montagem

  function criar(opcoes) {
    const { prefixo = '', humor = PROGRESSAO[0] } = opcoes || {};
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

    const defs = `<defs>` +
      `<clipPath id="${ref('clip-cabeca')}"><path d="${CABECA}"/></clipPath>` +
      `<clipPath id="${ref('clip-corpo')}"><path d="${CORPO}"/></clipPath>` +
      `<clipPath id="${ref('clip-orelha')}"><path d="${ORELHA_DENTRO}"/></clipPath>` +
      ['esq', 'dir'].map(lado =>
        `<clipPath id="${ref('clip-olho-' + lado)}"><ellipse cx="${OLHO[lado][0]}" cy="${OLHO[lado][1]}" rx="${OLHO.rx + 2}" ry="${OLHO.ry + 2}"/></clipPath>`).join('') +
      `<clipPath id="${ref('clip-boca')}"><path d="${BOCA_ABERTA}"/></clipPath>` +
      // A luz de cada volume: brilho, depois nada, depois sombra (com um tico de luz rebatida na borda).
      radial('volume', [[0, '#FFF8EC', .42], [.36, '#FFF8EC', 0], [.6, COR.sombra, .04], [.86, COR.sombra, .26], [1, COR.sombra, .18]],
        ' cx=".42" cy=".36" r=".74" fx=".34" fy=".22"') +
      radial('volume-cabeca', [[0, '#FFF8EC', .42], [.32, '#FFF8EC', 0], [.62, COR.sombra, .03], [.9, COR.sombra, .2], [1, COR.sombra, .14]],
        ' cx=".42" cy=".34" r=".84" fx=".34" fy=".2"') +
      radial('rebatida', [[0, '#FFF6EA', .5], [1, '#FFF6EA', 0]]) +
      // contraluz: uma linha de luz fria na borda direita (a lua da janela)
      radial('contraluz', [[0, '#EEF1FF', 0], [.84, '#EEF1FF', 0], [.95, '#EEF1FF', .5], [1, '#EEF1FF', 0]],
        ' cx=".3" cy=".44" r=".76"') +
      radial('brilho', [[0, '#FFF8EC', .3], [1, '#FFF8EC', 0]]) +
      radial('olheira', [[0, COR.sombra, 0], [.8, COR.sombra, 0], [.9, COR.sombra, .13], [1, COR.sombra, 0]]) +
      radial('branco', [[0, COR.branco], [.7, COR.branco], [1, COR.branco, 0]]) +
      radial('oclusao', [[0, '#6E2A1C', .4], [1, '#6E2A1C', 0]]) +
      radial('chao', [[0, '#4A2A35', .34], [.55, '#4A2A35', .16], [1, '#4A2A35', 0]]) +
      radial('rubor', [[0, COR.bochecha, .85], [.55, COR.bochecha, .4], [1, COR.bochecha, 0]]) +
      radial('olho', [[0, '#7A4A34'], [.32, '#3B2127'], [.78, COR.olho], [1, '#130A0E']], ' cx=".5" cy=".8" r=".8" fx=".5" fy=".92"') +
      linear('olho-sombra', [[0, '#000', .5], [.42, '#000', 0]], vertical) +
      radial('olho-luz', [[0, '#E3A06E', .7], [1, '#E3A06E', 0]]) +
      linear('palpebra', [[0, COR.laranja], [.82, COR.laranja], [1, COR.laranjaSombra]], vertical) +
      linear('nariz', [[0, '#FFB9C6'], [.55, COR.nariz], [1, '#D65E7B']], 'x1=".3" y1="0" x2=".6" y2="1"') +
      radial('focinho', [[0, '#FFFFFF', .9], [.6, '#FFFFFF', .5], [1, '#FFFFFF', 0]], ' cx=".42" cy=".36" r=".7"') +
      linear('lua', [[0, '#FFF6D8'], [1, '#F2CC78']], 'x1="0" y1="0" x2="1" y2="1"') +
      linear('dentro-orelha', [[0, '#FFC9D2'], [.6, COR.rosaOrelha], [1, '#E2869B']], 'x1=".3" y1="0" x2=".7" y2="1"') +
      radial('pata', [[0, '#FFFFFF'], [.55, '#FFF6EE'], [1, '#E6CDC6']], ' cx=".38" cy=".28" r=".85"') +
      linear('boca', [[0, '#5A2230'], [1, '#8E3A48']], vertical) +
      radial('luz-lua', [[0, '#FFF7D6', .95], [.5, '#FFEBA8', .45], [1, '#FFEBA8', 0]]) +
      radial('luz-vagalume', [[0, '#FFFBE0'], [.4, '#FFF08A', .6], [1, '#FFE45C', 0]]) +
    `</defs>`;

    // Mancha macia: elipse com borda que some (pelo branco, sombra, bochecha).
    const mancha = (cx, cy, rx, ry, preenchimento, extra = '') =>
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${url(preenchimento)}"${extra}/>`;
    // Volume: o mesmo contorno pintado com a cor do pelo e depois com a luz.
    const luz = (d, gradiente = 'volume') => `<path d="${d}" fill="${url(gradiente)}"/>`;
    // Forma com borda macia (pelo): o preenchimento e, por fora, traços cada vez
    // mais largos e transparentes. Faz o papel de um desfoque, sem filtro.
    const macio = (d, cor) =>
      [[20, .07], [13, .13], [7, .24], [3, .45]].map(([largura, a]) =>
        `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${largura}" stroke-opacity="${a}" stroke-linejoin="round"/>`).join('') +
      `<path d="${d}" fill="${cor}"/>`;

    const chao = mancha(200, 403, 172, 19, 'chao');

    // Tubo (rabo): camadas cada vez mais finas e claras, deslocadas na direção
    // da luz. Na ponta, o começo é reto e o fim é redondo.
    const tubo = (d, camadas, ponta) => camadas.map(([cor, fracao, desloc, a = 1]) => {
      const largura = RABO_L * fracao;
      const forma = ponta
        ? `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${largura}"/>` +
          `<circle cx="${PONTA_FIM[0]}" cy="${PONTA_FIM[1]}" r="${largura / 2}" fill="${cor}"/>`
        : `<path d="${d}" ${linha(largura, cor)}/>`;
      return `<g transform="translate(${-desloc} ${-desloc})"${a < 1 ? ` opacity="${a}"` : ''}>${forma}</g>`;
    }).join('');

    const rabo = parte('rabo',
      `<circle class="ponta-luz" cx="${PONTA_FIM[0]}" cy="${PONTA_FIM[1]}" r="50" fill="${url('luz-vagalume')}"/>` +
      tubo(RABO, [[COR.laranjaSombra, 1, 0], ['#E58F4E', .84, 1.2], [COR.laranja, .64, 2.6], ['#FBB777', .38, 4.2], ['#FFD9B3', .16, 5.6, .7]]) +
      parte('ponta-rabo',
        tubo(PONTA, [['#E5C9A4', 1, 0], ['#F2DFC4', .84, 1.2], [COR.pontaRabo, .64, 2.6], ['#FFFBF2', .38, 4.2], ['#FFFFFF', .16, 5.6, .8]], true) +
        `<g class="ponta-acesa">${tubo(PONTA, [['#FFE97A', 1, 0], ['#FFF6B0', .6, 2.6], ['#FFFFFF', .2, 4.6, .8]], true)}</g>`,
        PONTA_FIM) +
      // o corpo faz sombra no começo do rabo
      mancha(268, 384, 34, 22, 'oclusao'),
      RABO_CURVAS[0][0]);

    // Coxa: só um brilho macio na lateral de baixo, sugerindo o volume.
    const coxa = mancha(104, 352, 38, 28, 'brilho');
    const peTras = mancha(104, 410, 26, 6, 'oclusao') + `<path d="${PE_TRAS}" fill="${url('pata')}"/>`;

    const corpo = parte('corpo',
      peTras + espelhar(peTras) +
      `<g clip-path="${url('clip-corpo')}">` +
        `<path d="${CORPO}" fill="${COR.laranja}"/>` +
        parte('peito-barriga', mancha(200, 342, 76, 80, 'branco'), [200, 400]) +
        luz(CORPO) + luz(CORPO, 'contraluz') +
        coxa + espelhar(coxa) +
        // a cabeça faz sombra no peito
        mancha(200, 278, 128, 34, 'oclusao') +
      `</g>`,
      [200, 401]);

    const pata = (lado, dx) => parte(`pata-${lado}`,
      `<g transform="translate(${dx} 0)">` +
        mancha(163, 407, 30, 7, 'oclusao') +
        `<path d="${PATA}" fill="${url('pata')}"/>` +
        `<path d="${DEDOS}" ${linha(2.6, '#DCBDB3')}/>` +
      `</g>`,
      [163 + dx, 406]);

    const orelha =
      `<path d="${ORELHA}" fill="${COR.laranja}"/>` + luz(ORELHA) +
      `<path d="${ORELHA_DENTRO}" fill="${url('dentro-orelha')}"/>` +
      `<g clip-path="${url('clip-orelha')}">` +
        `<path class="orelha-rubor" d="${ORELHA_DENTRO}" fill="#FF6F91"/>` +
        // a borda da orelha faz sombra do lado de dentro
        `<path d="${ORELHA_DENTRO}" fill="none" stroke="${COR.sombra}" stroke-opacity=".18" stroke-width="12"/>` +
      `</g>` +
      `<path d="${ORELHA_TUFO}" ${linha(3, COR.branco)} opacity=".85"/>` +
      // base da orelha, atrás da cabeça, mais escura
      mancha(128, 128, 52, 30, 'oclusao');

    const LUA = crescente(198, 110, 17, 8.5, -6.5, 15);
    const lua = parte('lua-testa',
      `<circle class="lua-luz" cx="200" cy="110" r="40" fill="${url('luz-lua')}"/>` +
      `<path d="${LUA}" fill="${url('lua')}"/>` +
      `<path class="lua-acesa" d="${LUA}" fill="#FFFBE8"/>`,
      [200, 110]);

    const olho = (lado) => {
      const [x, y] = OLHO[lado];
      return parte(`olho-${lado}`,
        `<g class="var v-aberto">` +
          mancha(x, y + 1, OLHO.rx + 6, OLHO.ry + 6, 'olheira') +
          `<ellipse cx="${x}" cy="${y}" rx="${OLHO.rx}" ry="${OLHO.ry}" fill="${url('olho')}"/>` +
          mancha(x, y + 17, 16, 10, 'olho-luz') +
          `<ellipse cx="${x}" cy="${y}" rx="${OLHO.rx}" ry="${OLHO.ry}" fill="${url('olho-sombra')}"/>` +
          `<path class="olho-estrela"${origem([x + 8, y - 11])} d="${estrela(x + 8, y - 11, 10, 4.4)}" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>` +
          `<circle cx="${x - 10}" cy="${y + 11}" r="3.6" fill="#fff" opacity=".8"/>` +
        `</g>`,
        [x, y]);
    };

    // Cada pálpebra é recortada no formato do olho; a de cima pisca e emburra, a de baixo sorri.
    const palpebra = (lado) => {
      const [x, y] = OLHO[lado];
      const [ex, ey] = OLHO.esq;
      return `<g class="palpebra palpebra-${lado}" clip-path="${url('clip-olho-' + lado)}"${origem([x, y])}>` +
        `<g transform="translate(${x - ex} 0)">` +
          `<g class="palpebra-cima"${origem([ex, ey])}><path d="${PALPEBRA}" fill="${url('palpebra')}"/><path d="${CILIOS}" ${linha(4.2, '#4A2620')}/></g>` +
          `<path class="palpebra-baixo"${origem([ex, ey])} d="${PALPEBRA_BAIXO}" fill="${COR.laranja}"/>` +
        `</g>` +
      `</g>`;
    };
    const arcos = (d, largura) => `<path d="${d}" ${linha(largura, '#3A1E1E')}/>` + espelhar(`<path d="${d}" ${linha(largura, '#3A1E1E')}/>`);

    const palpebras = parte('pálpebras',
      palpebra('esq') + palpebra('dir') +
      `<g class="var v-ronronando">${arcos(ARCO_FELIZ, 5.5)}</g>` +
      `<g class="var v-dormindo">${arcos(ARCO_SONO, 5)}</g>`);

    const focinho = parte('focinho',
      // bochechinhas do focinho (onde nascem os bigodes), fofas
      mancha(188, 228, 15, 12, 'focinho') + mancha(212, 228, 15, 12, 'focinho') +
      `<path d="${NARIZ}" fill="${url('nariz')}" stroke="${COR.nariz}" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<ellipse cx="196" cy="205.5" rx="3.2" ry="1.7" fill="#fff" opacity=".8"/>`,
      [200, 208]);

    const traco = linha(3.4, COR.boca);
    const boca = parte('boca',
      `<g class="var v-emburrado"><path d="${BOCA_BICO}" ${traco}/></g>` +
      `<g class="var v-desconfiado"><path d="${BOCA_RETA}" ${traco}/></g>` +
      `<g class="var v-amolecendo"><path d="${BOCA_CANTINHO}" ${traco}/></g>` +
      `<g class="var v-contente"><path d="${bocaW(11, 8)}" ${traco}/></g>` +
      `<g class="var v-feliz">` +
        `<path d="${BOCA_ABERTA}" fill="${url('boca')}"/>` +
        `<ellipse cx="200" cy="${BOCA_Y + 16}" rx="8" ry="5.5" fill="${COR.lingua}" clip-path="${url('clip-boca')}"/>` +
        `<path d="${bocaW(11, 8)}" ${traco}/>` +
      `</g>` +
      `<g class="var v-ronronando"><path d="${bocaW(12, 7)}" ${traco}/></g>` +
      `<g class="var v-dormindo"><path d="${bocaW(8, 5)}" ${traco}/></g>` +
      `<g class="var v-surpreso"><path d="${MEIO_W}" ${traco}/>` +
        `<ellipse cx="200" cy="${BOCA_Y + 9}" rx="6.5" ry="8" fill="${url('boca')}"/></g>`,
      [200, BOCA_Y]);

    const bigodes = parte('bigodes',
      `<path d="${BIGODES}" ${linha(2.3, COR.bigode)}/>${espelhar(`<path d="${BIGODES}" ${linha(2.3, COR.bigode)}/>`)}`,
      [200, 218]);

    // A pele do rosto (pelo branco e bochechas) e os traços andam juntos quando
    // ele vira o rosto; a luz da cabeça fica parada. É isso que dá a ideia de 3D.
    const cabeca = parte('cabeca',
      `<g class="orelhas">` +
        parte('orelha-esq', orelha, [122, 122]) +
        parte('orelha-dir', espelhar(orelha), [278, 122]) +
      `</g>` +
      `<g clip-path="${url('clip-cabeca')}">` +
        `<path d="${CABECA}" fill="${COR.laranja}"/>` +
        `<g class="rosto-pele">` +
          macio(MASCARA, COR.branco) +
          mancha(122, 226, 22, 13, 'rubor', ' class="bochecha"') +
          mancha(278, 226, 22, 13, 'rubor', ' class="bochecha"') +
        `</g>` +
        luz(CABECA, 'volume-cabeca') + luz(CABECA, 'contraluz') +
        mancha(200, 292, 150, 44, 'rebatida') +
      `</g>` +
      `<g class="rosto">` +
        lua + olho('esq') + olho('dir') + palpebras + focinho + boca + bigodes +
      `</g>`,
      [200, 278]);

    return `<svg class="momon" viewBox="0 0 400 420" data-humor="${humor}" role="img" aria-label="Momon, o gatinho" xmlns="http://www.w3.org/2000/svg">` +
      defs + chao + rabo + corpo + pata('esq', 0) + pata('dir', 74) + cabeca +
      `</svg>`;
  }

  window.Momon = window.Momon || {};
  window.Momon.svg = { criar, HUMORES, PROGRESSAO, ESPECIAIS, PARTES, COR };
})();
