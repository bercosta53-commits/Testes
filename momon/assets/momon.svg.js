/*
 * Momon — o gatinho, desenhado em SVG com partes separadas para animar.
 *
 *   Momon.svg.criar({ humor: 'feliz', prefixo: '' })  -> string <svg>
 *
 * Cada parte é um <g id="..." data-parte="..."> (ids do briefing). O `prefixo`
 * só existe para quando há vários Momons na mesma página (ids não podem repetir);
 * no app ele fica vazio e os ids saem exatamente como "cabeca", "rabo" etc.
 * O CSS deve mirar [data-parte="..."], que vale para qualquer prefixo.
 *
 * Esquerda/direita são as da TELA (de quem olha), não as do gato:
 * tocar no lado esquerdo da tela mexe a "pata-esq".
 *
 * O humor fica em data-humor no <svg>; trocar o atributo troca a expressão
 * (as cores e transições estão em momon.css).
 *
 * Nenhum grupo animável recebe o atributo transform: o CSS sobrescreveria.
 * Quando uma forma precisa ser deslocada ou espelhada, ela ganha um <g> interno.
 */
(function () {
  'use strict';

  const HUMORES = ['neutro', 'feliz', 'ronronando', 'dormindo', 'surpreso'];

  const PARTES = [
    'corpo', 'peito-barriga', 'cabeca', 'orelha-esq', 'orelha-dir',
    'olho-esq', 'olho-dir', 'pálpebras', 'focinho', 'boca', 'bigodes',
    'lua-testa', 'pata-esq', 'pata-dir', 'rabo', 'ponta-rabo',
  ];

  const COR = {
    laranja: '#F4A45E',
    contorno: '#8E5039',
    branco: '#FFF9F1',
    rosaOrelha: '#F7A8B6',
    nariz: '#F2879D',
    olho: '#33222C',
    olhoFundo: '#6A4560',
    brilho: '#FFFFFF',
    lua: '#FCE4A8',
    pontaRabo: '#FFF4DE',
    bochecha: '#FF93A5',
    boca: '#7A3542',
    lingua: '#FF8FA3',
    sombra: '#5B3A4A',
  };

  const TRACO = 4.5;   // espessura do contorno, em unidades do viewBox (400 x 420)
  const RABO_L = 30;   // grossura do rabo

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

  // Máscara branca da parte de baixo do rosto (bochechas + ponta do focinho).
  const MASCARA = 'M24 300L24 228C60 208 112 204 146 215C166 221 180 201 200 199C220 201 234 221 254 215C288 204 340 208 376 228L376 300Z';

  // Corpo de bolinha de pão.
  const CORPO = simetrico([200, 214], [
    [272, 214, 324, 268, 331, 334],
    [336, 386, 298, 401, 200, 401],
  ]);
  const COXA = 'M104 390C92 372 91 350 110 337';

  const PEITO = 'M200 248C254 248 280 296 276 346C272 388 244 397 200 397C156 397 128 388 124 346C120 296 146 248 200 248Z';

  // Orelha esquerda (a direita é o espelho). A base fica escondida atrás da cabeça.
  const ORELHA = 'M66 162C52 120 54 70 76 46C88 32 108 32 126 44C150 60 174 78 190 94Z';
  const ORELHA_DENTRO = 'M84 146C76 114 76 82 90 64C98 54 110 54 120 62C140 76 156 90 168 102Z';
  const ORELHA_TUFO = 'M93 104Q86 88 92 72M106 101Q103 89 108 79';

  const PATA = 'M137 396C136 377 149 368 163 368C177 368 190 377 189 396C189 405 178 408 163 408C148 408 137 405 137 396Z';
  const DEDOS = 'M155 408L155 399M171 408L171 399';

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
  const PALPEBRA = 'M114 92L182 92L182 199Q148 213 114 199Z';
  const CILIOS = 'M116 198.6Q148 212.6 180 198.6';
  // Pálpebra de baixo (a bochecha que sobe no sorriso), desenhada na posição de sorriso.
  const PALPEBRA_BAIXO = 'M114 240L114 202Q148 180 182 202L182 240Z';

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

  // ---------------------------------------------------------------- montagem

  function criar(opcoes) {
    const { prefixo = '', humor = 'neutro' } = opcoes || {};
    const ref = nome => `momon-${prefixo}${nome}`; // ids internos (defs)
    const url = nome => `url(#${ref(nome)})`;
    const parte = (nome, conteudo, origem, extra = '') =>
      `<g id="${prefixo}${nome}" data-parte="${nome}"${extra}` +
      (origem ? ` style="transform-origin:${origem[0]}px ${origem[1]}px"` : '') +
      `>${conteudo}</g>`;

    const linha = (largura, cor = COR.contorno) =>
      `fill="none" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round" stroke-linejoin="round"`;
    const contorno = linha(TRACO);
    const preenchido = cor => `fill="${cor}" stroke="${COR.contorno}" stroke-width="${TRACO}" stroke-linejoin="round"`;

    const defs = `<defs>` +
      `<clipPath id="${ref('clip-cabeca')}"><path d="${CABECA}"/></clipPath>` +
      `<clipPath id="${ref('clip-corpo')}"><path d="${CORPO}"/></clipPath>` +
      ['esq', 'dir'].map(lado =>
        `<clipPath id="${ref('clip-olho-' + lado)}"><ellipse cx="${OLHO[lado][0]}" cy="${OLHO[lado][1]}" rx="${OLHO.rx + 2}" ry="${OLHO.ry + 2}"/></clipPath>`).join('') +
      `<clipPath id="${ref('clip-boca')}"><path d="${BOCA_ABERTA}"/></clipPath>` +
      `<radialGradient id="${ref('luz-lua')}">` +
        `<stop offset="0" stop-color="#FFF7D6" stop-opacity=".95"/>` +
        `<stop offset=".5" stop-color="#FFEBA8" stop-opacity=".45"/>` +
        `<stop offset="1" stop-color="#FFEBA8" stop-opacity="0"/>` +
      `</radialGradient>` +
      `<radialGradient id="${ref('luz-vagalume')}">` +
        `<stop offset="0" stop-color="#FFFBE0" stop-opacity="1"/>` +
        `<stop offset=".4" stop-color="#FFF08A" stop-opacity=".6"/>` +
        `<stop offset="1" stop-color="#FFE45C" stop-opacity="0"/>` +
      `</radialGradient>` +
    `</defs>`;

    const sombra = `<ellipse class="sombra" cx="200" cy="406" rx="160" ry="13" fill="${COR.sombra}" opacity=".14"/>`;

    // A luz da ponta fica atrás de tudo, para brilhar em volta do rabo sem borrar o contorno.
    const rabo = parte('rabo',
      `<circle class="ponta-luz" cx="${PONTA_FIM[0]}" cy="${PONTA_FIM[1]}" r="48" fill="${url('luz-vagalume')}"/>` +
      `<path d="${RABO}" ${linha(RABO_L + 2 * TRACO)}/>` +
      `<path d="${RABO}" ${linha(RABO_L, COR.laranja)}/>` +
      parte('ponta-rabo',
        `<path d="${PONTA}" fill="none" stroke="currentColor" stroke-width="${RABO_L}"/>` +
        `<circle cx="${PONTA_FIM[0]}" cy="${PONTA_FIM[1]}" r="${RABO_L / 2}" fill="currentColor"/>`,
        PONTA_FIM, ` color="${COR.pontaRabo}"`),
      RABO_CURVAS[0][0]);

    const corpo = parte('corpo',
      `<path d="${CORPO}" fill="${COR.laranja}"/>` +
      `<g clip-path="${url('clip-corpo')}">` +
        parte('peito-barriga', `<path d="${PEITO}" fill="${COR.branco}"/>`, [200, 397]) +
        `<ellipse class="sombra-cabeca" cx="200" cy="272" rx="112" ry="20" fill="#B5643A" opacity=".12"/>` +
      `</g>` +
      `<path d="${COXA}" ${linha(3.5)}/>${espelhar(`<path d="${COXA}" ${linha(3.5)}/>`)}` +
      `<path d="${CORPO}" ${contorno}/>`,
      [200, 401]);

    const pata = (lado, dx) => parte(`pata-${lado}`,
      `<g transform="translate(${dx} 0)">` +
        `<path d="${PATA}" ${preenchido(COR.branco)}/>` +
        `<path d="${DEDOS}" ${linha(3)}/>` +
      `</g>`,
      [163 + dx, 406]);

    const orelha =
      `<path d="${ORELHA}" ${preenchido(COR.laranja)}/>` +
      `<path class="orelha-dentro" d="${ORELHA_DENTRO}" fill="${COR.rosaOrelha}"/>` +
      `<path d="${ORELHA_TUFO}" ${linha(3, COR.branco)} opacity=".9"/>`;

    const lua = parte('lua-testa',
      `<circle class="lua-luz" cx="200" cy="110" r="38" fill="${url('luz-lua')}"/>` +
      `<path class="lua-forma" d="${crescente(198, 110, 17, 8.5, -6.5, 15)}" fill="${COR.lua}"/>`,
      [200, 110]);

    const olho = (lado) => {
      const [x, y] = OLHO[lado];
      return parte(`olho-${lado}`,
        `<g class="var v-neutro v-feliz v-surpreso">` +
          `<ellipse cx="${x}" cy="${y}" rx="${OLHO.rx}" ry="${OLHO.ry}" fill="${COR.olho}"/>` +
          `<ellipse cx="${x}" cy="${y + 17}" rx="14" ry="7.5" fill="${COR.olhoFundo}" opacity=".8"/>` +
          `<path d="${estrela(x + 8, y - 11, 10, 4.4)}" fill="${COR.brilho}" stroke="${COR.brilho}" stroke-width="2" stroke-linejoin="round"/>` +
          `<circle cx="${x - 10}" cy="${y + 10}" r="3.8" fill="${COR.brilho}" opacity=".85"/>` +
        `</g>`,
        [x, y]);
    };

    // Cada pálpebra é recortada no formato do olho; a de cima pisca, a de baixo sorri.
    const palpebra = (lado) => {
      const [x, y] = OLHO[lado];
      return `<g class="palpebra palpebra-${lado}" clip-path="${url('clip-olho-' + lado)}" style="transform-origin:${x}px ${y}px">` +
        `<g transform="translate(${x - OLHO.esq[0]} 0)">` +
          `<g class="palpebra-cima"><path d="${PALPEBRA}" fill="${COR.laranja}"/><path d="${CILIOS}" ${linha(4.5, COR.olho)}/></g>` +
          `<path class="palpebra-baixo" d="${PALPEBRA_BAIXO}" fill="${COR.laranja}"/>` +
        `</g>` +
      `</g>`;
    };
    const arcos = (d, largura) => `<path d="${d}" ${linha(largura, COR.olho)}/>` + espelhar(`<path d="${d}" ${linha(largura, COR.olho)}/>`);

    const palpebras = parte('pálpebras',
      palpebra('esq') + palpebra('dir') +
      `<g class="var v-ronronando">${arcos(ARCO_FELIZ, 5.5)}</g>` +
      `<g class="var v-dormindo">${arcos(ARCO_SONO, 5)}</g>`);

    const focinho = parte('focinho',
      `<path d="${NARIZ}" fill="${COR.nariz}" stroke="${COR.nariz}" stroke-width="2" stroke-linejoin="round"/>` +
      `<ellipse cx="196" cy="205" rx="3" ry="1.6" fill="#fff" opacity=".75"/>`,
      [200, 208]);

    const traco = linha(3.6);
    const boca = parte('boca',
      `<g class="var v-neutro"><path d="${bocaW(10, 8)}" ${traco}/></g>` +
      `<g class="var v-feliz">` +
        `<path d="${BOCA_ABERTA}" fill="${COR.boca}"/>` +
        `<ellipse cx="200" cy="${BOCA_Y + 16}" rx="8" ry="5.5" fill="${COR.lingua}" clip-path="${url('clip-boca')}"/>` +
        `<path d="${bocaW(11, 8)}" ${traco}/>` +
      `</g>` +
      `<g class="var v-ronronando"><path d="${bocaW(12, 7)}" ${traco}/></g>` +
      `<g class="var v-dormindo"><path d="${bocaW(8, 5)}" ${traco}/></g>` +
      `<g class="var v-surpreso"><path d="${MEIO_W}" ${traco}/>` +
        `<ellipse cx="200" cy="${BOCA_Y + 9}" rx="7" ry="8.5" fill="${COR.boca}" stroke="${COR.contorno}" stroke-width="3"/></g>`,
      [200, BOCA_Y]);

    const bigodes = parte('bigodes',
      `<g opacity=".55"><path d="${BIGODES}" ${linha(2.6)}/>${espelhar(`<path d="${BIGODES}" ${linha(2.6)}/>`)}</g>`,
      [200, 218]);

    const cabeca = parte('cabeca',
      parte('orelha-esq', orelha, [122, 122]) +
      parte('orelha-dir', espelhar(orelha), [278, 122]) +
      `<path d="${CABECA}" fill="${COR.laranja}"/>` +
      `<path d="${MASCARA}" fill="${COR.branco}" clip-path="${url('clip-cabeca')}"/>` +
      `<ellipse class="bochecha" cx="122" cy="224" rx="17" ry="9.5" fill="${COR.bochecha}"/>` +
      `<ellipse class="bochecha" cx="278" cy="224" rx="17" ry="9.5" fill="${COR.bochecha}"/>` +
      `<path d="${CABECA}" ${contorno}/>` +
      lua + olho('esq') + olho('dir') + palpebras + focinho + boca + bigodes,
      [200, 278]);

    return `<svg class="momon" viewBox="0 0 400 420" data-humor="${humor}" role="img" aria-label="Momon, o gatinho" xmlns="http://www.w3.org/2000/svg">` +
      defs + sombra + rabo + corpo + pata('esq', 0) + pata('dir', 74) + cabeca +
      `</svg>`;
  }

  window.Momon = window.Momon || {};
  window.Momon.svg = { criar, HUMORES, PARTES, COR };
})();
