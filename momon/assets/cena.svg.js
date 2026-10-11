/*
 * Cena do Momon: um quarto aconchegante à noite, no mesmo estilo levemente 3D.
 *
 *   Momon.cena.quarto()   -> <svg> do cômodo (parede, chão, tapete, cortinas, planta, abajur)
 *   Momon.cena.luzes()    -> <svg> do que brilha (janela com lua e estrelas, varal de luzinhas,
 *                            luz do abajur). Fica por cima da camada de noite, então continua
 *                            aceso quando o quarto escurece.
 *   Momon.cena.almofada() -> <svg> da almofada onde ele senta (mesmas coordenadas do Momon).
 *
 * quarto() e luzes() usam o mesmo viewBox (1600 x 1000) e preserveAspectRatio
 * "xMidYMax slice": cobrem a tela inteira e se alinham entre si. O que importa
 * (janela, tapete) fica no meio, que é o que sobra no celular em pé.
 */
(function () {
  'use strict';

  const VIEWBOX = '0 0 1600 1000';
  const n = v => Math.round(v * 10) / 10;

  const paradas = lista => lista.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
  const linear = (id, lista, atributos = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${atributos}>${paradas(lista)}</linearGradient>`;
  const radial = (id, lista, atributos = '') => `<radialGradient id="${id}"${atributos}>${paradas(lista)}</radialGradient>`;
  const svg = (classe, conteudo) =>
    `<svg class="${classe}" viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${conteudo}</svg>`;

  // Brilhinho de 4 pontas (estrelas da janela).
  function brilho(cx, cy, r) {
    const i = r * .28;
    return `M${n(cx)} ${n(cy - r)}Q${n(cx + i)} ${n(cy - i)} ${n(cx + r)} ${n(cy)}Q${n(cx + i)} ${n(cy + i)} ${n(cx)} ${n(cy + r)}` +
      `Q${n(cx - i)} ${n(cy + i)} ${n(cx - r)} ${n(cy)}Q${n(cx - i)} ${n(cy - i)} ${n(cx)} ${n(cy - r)}Z`;
  }

  // Lua crescente (a mesma forma da testa do Momon).
  function crescente(cx, cy, r1, dx, dy, r2) {
    const d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const px = cx + (a * dx) / d, py = cy + (a * dy) / d;
    const ux = -dy / d, uy = dx / d;
    const p1 = `${n(px + h * ux)} ${n(py + h * uy)}`, p2 = `${n(px - h * ux)} ${n(py - h * uy)}`;
    return `M${p1}A${r1} ${r1} 0 1 1 ${p2}A${r2} ${r2} 0 0 0 ${p1}Z`;
  }

  // Janela com o alto em arco. (x, y) = canto de cima à esquerda; r = raio do arco.
  const janela = (x, y, l, a) => {
    const r = l / 2;
    return `M${x} ${y + r}A${r} ${r} 0 0 1 ${x + l} ${y + r}L${x + l} ${y + a}L${x} ${y + a}Z`;
  };

  // ---------------------------------------------------------------- quarto

  function quarto() {
    const defs = `<defs>` +
      linear('cq-parede', [[0, '#BBA5DD'], [.5, '#DDBFD8'], [1, '#F2D5C8']]) +
      radial('cq-parede-luz', [[0, '#FFE9D6', .55], [1, '#FFE9D6', 0]]) +
      linear('cq-chao', [[0, '#E2B193'], [1, '#C98F70']]) +
      linear('cq-rodape', [[0, '#FFF3E8'], [1, '#EBD6C6']]) +
      radial('cq-tapete', [[0, '#FFE7DA'], [.7, '#FBD3C4'], [1, '#EEB6A6']]) +
      linear('cq-cortina', [[0, '#F7C3CF'], [.5, '#EFA8BA'], [1, '#E595AA']], 'x1="0" y1="0" x2="1" y2="0"') +
      linear('cq-moldura', [[0, '#FFF8EF'], [1, '#EBDCCD']]) +
      linear('cq-vaso', [[0, '#E8957A'], [1, '#C46E58']], 'x1="0" y1="0" x2="1" y2="0"') +
      radial('cq-folha', [[0, '#A7D8A0'], [1, '#6FB27A']], ' cx=".35" cy=".3" r=".8"') +
      radial('cq-sombra', [[0, '#5A3448', .3], [1, '#5A3448', 0]]) +
      linear('cq-mesa', [[0, '#F3DCC8'], [1, '#D9B79C']]) +
    `</defs>`;

    // Pintinhas bem leves no papel de parede.
    let pintas = '';
    for (let y = 60; y < 700; y += 80) {
      for (let x = (y / 80) % 2 ? 40 : 80; x < 1600; x += 80) {
        pintas += `<circle cx="${x}" cy="${y}" r="4" fill="#fff"/>`;
      }
    }

    // Tábuas do chão, mais largas perto de quem olha.
    const tabuas = [752, 792, 842, 904, 978].map(y =>
      `<path d="M0 ${y}H1600" stroke="#F1C9AE" stroke-width="3" opacity=".55"/>`).join('');

    // Cortinas presas dos lados da janela, com dobras feitas de faixas.
    const cortina = (x, lado) => {
      const s = lado; // 1 = esquerda, -1 = direita
      const d = `M${x} 92C${x + s * 120} 92 ${x + s * 150} 92 ${x + s * 150} 92` +
        `C${x + s * 140} 260 ${x + s * 96} 380 ${x + s * 72} 446` +
        `C${x + s * 96} 520 ${x + s * 112} 600 ${x + s * 118} 660L${x} 660Z`;
      const dobras = [0.25, 0.5, 0.75].map(k =>
        `<path d="M${x + s * 150 * k} 96C${x + s * 140 * k} 280 ${x + s * 70 * k} 400 ${x + s * 60 * k + s * 10} 446C${x + s * 80 * k} 540 ${x + s * 96 * k} 610 ${x + s * 100 * k} 656" ` +
        `fill="none" stroke="#D07E95" stroke-width="10" stroke-opacity=".22" stroke-linecap="round"/>`).join('');
      return `<path d="${d}" fill="url(#cq-cortina)"/>${dobras}` +
        `<path d="M${x + s * 46} 440Q${x + s * 78} 452 ${x + s * 98} 438" fill="none" stroke="#FFF1C9" stroke-width="12" stroke-linecap="round"/>`;
    };

    const planta = `<g>` +
      `<ellipse cx="250" cy="842" rx="96" ry="16" fill="url(#cq-sombra)"/>` +
      ['M250 730C190 690 170 610 196 560C236 600 256 660 250 730Z', 'M250 730C300 680 330 610 310 556C268 600 246 664 250 730Z',
        'M250 730C220 650 236 570 262 530C282 580 278 660 250 730Z', 'M250 730C180 720 140 680 132 640C186 640 226 670 250 730Z',
        'M250 730C320 724 362 690 372 648C316 646 274 676 250 730Z'].map(d => `<path d="${d}" fill="url(#cq-folha)"/>`).join('') +
      `<path d="M190 720H310L296 836Q250 850 204 836Z" fill="url(#cq-vaso)"/>` +
      `<rect x="182" y="712" width="136" height="26" rx="10" fill="#EEA48C"/>` +
    `</g>`;

    const mesinha = `<g>` +
      `<ellipse cx="1360" cy="846" rx="110" ry="18" fill="url(#cq-sombra)"/>` +
      `<rect x="1352" y="680" width="16" height="160" rx="6" fill="#D2AE93"/>` +
      `<ellipse cx="1360" cy="676" rx="96" ry="18" fill="url(#cq-mesa)"/>` +
      // abajur de cogumelo
      `<rect x="1346" y="590" width="28" height="86" rx="12" fill="#FFF3E2"/>` +
      `<path d="M1270 600C1270 530 1450 530 1450 600Q1360 622 1270 600Z" fill="#F7B4C2"/>` +
      [[1310, 574, 10], [1360, 560, 8], [1404, 580, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3EA" opacity=".9"/>`).join('') +
    `</g>`;

    return svg('cena-quarto', defs +
      `<rect width="1600" height="740" fill="url(#cq-parede)"/>` +
      `<g opacity=".18">${pintas}</g>` +
      `<ellipse cx="800" cy="360" rx="560" ry="360" fill="url(#cq-parede-luz)"/>` +
      `<rect y="720" width="1600" height="280" fill="url(#cq-chao)"/>` + tabuas +
      `<rect y="708" width="1600" height="20" fill="url(#cq-rodape)"/>` +
      `<rect y="728" width="1600" height="8" fill="#9C6650" opacity=".18"/>` +
      // tapete redondo onde fica a almofada
      `<ellipse cx="800" cy="884" rx="540" ry="100" fill="#C98F70" opacity=".35"/>` +
      `<ellipse cx="800" cy="876" rx="530" ry="96" fill="url(#cq-tapete)"/>` +
      `<ellipse cx="800" cy="876" rx="486" ry="78" fill="none" stroke="#FFF4EC" stroke-width="5" stroke-dasharray="14 12" opacity=".8"/>` +
      // sombra da janela na parede e o parapeito
      `<path d="${janela(578, 112, 444, 500)}" fill="#8B6A9E" opacity=".14"/>` +
      `<path d="${janela(590, 120, 420, 484)}" fill="url(#cq-moldura)"/>` +
      `<rect x="562" y="596" width="476" height="30" rx="12" fill="url(#cq-moldura)"/>` +
      `<rect x="570" y="626" width="460" height="10" rx="5" fill="#9C6F86" opacity=".18"/>` +
      // varão das cortinas
      `<rect x="500" y="84" width="600" height="14" rx="7" fill="#C9A184"/>` +
      `<circle cx="500" cy="91" r="14" fill="#E2BC9F"/><circle cx="1100" cy="91" r="14" fill="#E2BC9F"/>` +
      cortina(500, 1) + cortina(1100, -1) +
      planta + mesinha);
  }

  // ---------------------------------------------------------------- luzes

  function luzes() {
    const ESTRELAS = [[680, 230, 9], [742, 312, 6], [700, 420, 7], [836, 200, 6], [948, 378, 8], [880, 470, 5],
      [760, 500, 6], [655, 340, 5], [930, 520, 6], [812, 404, 5]];
    const LAMPADAS = ['#FFE58A', '#FFC1D2', '#B9F0DF', '#FFE58A', '#FFC1D2', '#B9F0DF', '#FFE58A', '#FFC1D2', '#B9F0DF'];
    const VARAL = 'M530 104Q800 196 1070 104';

    const defs = `<defs>` +
      linear('cl-ceu', [[0, '#272A66'], [.6, '#45428A'], [1, '#7C68A8']]) +
      radial('cl-lua', [[0, '#FFF6D2', .9], [.45, '#FFE9A0', .35], [1, '#FFE9A0', 0]]) +
      linear('cl-lua-forma', [[0, '#FFF8DE'], [1, '#F6D88C']], 'x1="0" y1="0" x2="1" y2="1"') +
      radial('cl-lampada', [[0, '#FFF6D6', .9], [1, '#FFF6D6', 0]]) +
      radial('cl-abajur', [[0, '#FFE2B8', .55], [1, '#FFE2B8', 0]]) +
      `<clipPath id="cl-vidro"><path d="${janela(616, 146, 368, 432)}"/></clipPath>` +
    `</defs>`;

    const ceu = `<g clip-path="url(#cl-vidro)">` +
      `<rect x="600" y="130" width="400" height="460" fill="url(#cl-ceu)"/>` +
      `<circle cx="902" cy="250" r="110" fill="url(#cl-lua)"/>` +
      `<path d="${crescente(898, 252, 46, 22, -16, 40)}" fill="url(#cl-lua-forma)"/>` +
      ESTRELAS.map(([x, y, r], i) =>
        `<path class="estrela-janela" style="animation-delay:${(i * .37) % 3}s" d="${brilho(x, y, r)}" fill="#FFF7DA"/>`).join('') +
      // morrinhos lá fora
      `<path d="M600 540C680 486 760 500 820 530C880 490 960 480 1010 520V600H600Z" fill="#3B3672"/>` +
      `<path d="M600 566C700 530 820 548 900 566C940 552 980 550 1010 560V600H600Z" fill="#2D2A5E"/>` +
    `</g>` +
    // a cruz da janela
    `<rect x="793" y="146" width="14" height="432" fill="#F2E6DA"/>` +
    `<rect x="616" y="352" width="368" height="14" fill="#F2E6DA"/>` +
    // reflexo no vidro
    `<path d="M640 300L700 200L716 210L656 310Z" fill="#fff" opacity=".08"/>`;

    // Varal de luzinhas em cima da janela.
    const lampadas = LAMPADAS.map((cor, i) => {
      const t = (i + .5) / LAMPADAS.length;
      const x = 530 + 540 * t, y = 104 + 92 * 4 * t * (1 - t) * .5 + 2;
      return `<circle class="lampada" style="animation-delay:${(i * .53) % 2.4}s" cx="${n(x)}" cy="${n(y + 18)}" r="30" fill="url(#cl-lampada)"/>` +
        `<rect x="${n(x - 4)}" y="${n(y)}" width="8" height="8" rx="2" fill="#8E7A6B"/>` +
        `<ellipse cx="${n(x)}" cy="${n(y + 18)}" rx="9" ry="12" fill="${cor}"/>` +
        `<ellipse cx="${n(x - 3)}" cy="${n(y + 13)}" rx="3" ry="4" fill="#fff" opacity=".7"/>`;
    }).join('');

    return svg('cena-luzes', defs + ceu +
      `<path d="${VARAL}" fill="none" stroke="#8E7A6B" stroke-width="3"/>` + lampadas +
      `<circle class="luz-abajur" cx="1360" cy="600" r="180" fill="url(#cl-abajur)"/>`);
  }

  // ---------------------------------------------------------------- almofada

  // Na mesma escala do Momon (viewBox 0 0 400 420); passa um pouco das bordas.
  function almofada() {
    return `<svg class="almofada" viewBox="-40 300 480 170" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        linear('ca-lado', [[0, '#9FD6C9'], [1, '#6FB3A4']]) +
        radial('ca-topo', [[0, '#E2F6F0'], [.7, '#C2E9DF'], [1, '#A6DACC']], ' cx=".45" cy=".4" r=".7"') +
        radial('ca-sombra', [[0, '#3E2A36', .35], [1, '#3E2A36', 0]]) +
      `</defs>` +
      `<ellipse cx="200" cy="440" rx="236" ry="26" fill="url(#ca-sombra)"/>` +
      `<path d="M-16 404C-16 444 92 462 200 462C308 462 416 444 416 404L416 392H-16Z" fill="url(#ca-lado)"/>` +
      `<ellipse cx="200" cy="394" rx="216" ry="52" fill="url(#ca-topo)"/>` +
      `<ellipse cx="200" cy="394" rx="188" ry="40" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="9 9" opacity=".6"/>` +
      `<path d="M30 372Q60 350 120 346" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".45"/>` +
    `</svg>`;
  }

  window.Momon = window.Momon || {};
  window.Momon.cena = { quarto, luzes, almofada };
})();
