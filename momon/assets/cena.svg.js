/*
 * Cena do Momon: o cantinho dele numa casa brasileira, à noite.
 *
 *   Momon.cena.quarto(formato)        -> <svg> do cômodo: parede de reboco com barrado, chão
 *                                        de lajota, tapete de crochê, janela com venezianas
 *                                        azul-colonial, abajur de franja, desenho de criança na
 *                                        parede, samambaia no macramê e cesto de novelos.
 *   Momon.cena.luzes(formato)         -> <svg> do que brilha: o céu da janela (lua, estrelas,
 *                                        telhados com janelinhas acesas, vaga-lumes), o feixe de
 *                                        luar, a luz do abajur (classe "abajur-luz", que apaga na
 *                                        hora de dormir) e os adesivos que brilham no escuro.
 *                                        Fica por cima da camada de noite.
 *   Momon.cena.primeiroPlano(formato) -> <svg> das folhas de costela-de-adão (só deitado).
 *   Momon.cena.almofada()             -> <svg> da almofada de chita onde ele senta (mesmas
 *                                        coordenadas do Momon).
 *   Momon.cena.papel()                -> textura de papel pintado (data URL), para pôr por cima.
 *
 * Dois formatos (Momon.cena.FORMATOS):
 *   'retrato'   celular em pé, o principal: viewBox 1400 x 2000. No celular aparece a faixa
 *               do meio (x de 250 a 1150), e tudo o que conta a história cabe nela: a janela
 *               em cima, o desenho e o abajur de pé à esquerda, a samambaia à direita.
 *   'paisagem'  tablet e celular deitados: viewBox 1600 x 1000.
 * As camadas usam preserveAspectRatio "xMidYMax slice": cobrem a tela inteira e se alinham.
 * Os objetos são desenhados uma vez (nas coordenadas do quarto deitado) e postos no lugar
 * de cada formato com [x, y, escala]. Tudo é estático, então pode ter mais detalhe que o gatinho.
 */
(function () {
  'use strict';

  const n = v => Math.round(v * 10) / 10;
  const pt = (x, y) => `${n(x)} ${n(y)}`;

  const paradas = lista => lista.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
  const linear = (id, lista, atributos = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${atributos}>${paradas(lista)}</linearGradient>`;
  const radial = (id, lista, atributos = '') => `<radialGradient id="${id}"${atributos}>${paradas(lista)}</radialGradient>`;
  const svg = (classe, f, conteudo) =>
    `<svg class="${classe}" viewBox="0 0 ${f.largura} ${f.altura}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${conteudo}</svg>`;
  // Põe um objeto no lugar: o ponto de referência dele (nas coordenadas em que foi
  // desenhado) vai para (x, y), com a escala pedida.
  const lugar = (ref, [x, y, k = 1]) => (x === ref[0] && y === ref[1] && k === 1)
    ? '' : ` transform="translate(${n(x - ref[0] * k)} ${n(y - ref[1] * k)}) scale(${k})"`;
  const noLugar = (ref, pos, conteudo) => {
    const t = lugar(ref, pos);
    return t ? `<g${t}>${conteudo}</g>` : conteudo;
  };

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

  // Brilhinho de 4 pontas (estrelas).
  function brilho(cx, cy, r) {
    const i = r * .26;
    return `M${pt(cx, cy - r)}Q${pt(cx + i, cy - i)} ${pt(cx + r, cy)}Q${pt(cx + i, cy + i)} ${pt(cx, cy + r)}` +
      `Q${pt(cx - i, cy + i)} ${pt(cx - r, cy)}Q${pt(cx - i, cy - i)} ${pt(cx, cy - r)}Z`;
  }

  // Lua crescente (a mesma forma da testa do Momon).
  function crescente(cx, cy, r1, dx, dy, r2) {
    const d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const px = cx + (a * dx) / d, py = cy + (a * dy) / d;
    const ux = -dy / d, uy = dx / d;
    return `M${pt(px + h * ux, py + h * uy)}A${r1} ${r1} 0 1 1 ${pt(px - h * ux, py - h * uy)}A${r2} ${r2} 0 0 0 ${pt(px + h * ux, py + h * uy)}Z`;
  }

  // Flor de chita: pétalas redondas em volta de um miolo (achatada para ficar deitada).
  function florDeChita(cx, cy, r, petalas, cor, miolo, achatar = 1, giro = 0) {
    let d = '';
    for (let i = 0; i < petalas; i++) {
      const a = giro + i * Math.PI * 2 / petalas;
      const px = cx + Math.cos(a) * r * .62, py = cy + Math.sin(a) * r * .62 * achatar;
      d += `<ellipse cx="${n(px)}" cy="${n(py)}" rx="${n(r * .46)}" ry="${n(r * .46 * achatar)}" fill="${cor}"/>`;
    }
    return d + `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(r * .38)}" ry="${n(r * .38 * achatar)}" fill="${miolo}"/>` +
      `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(r * .16)}" ry="${n(r * .16 * achatar)}" fill="#FFF4D6" opacity=".8"/>`;
  }

  // Adesivos de estrelinha que brilham no escuro, colados na parede (x, y, raio, giro).
  // De dia são de plástico clarinho; quando a luz apaga, acendem (camada de luzes).
  function estrelaRedonda(cx, cy, R, giro) {
    // estrela de 5 pontas com as pontas arredondadas (como adesivo de verdade)
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (-90 + giro + i * 36) * Math.PI / 180, r = i % 2 ? R * .48 : R;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    let d = '';
    for (let i = 0; i < 10; i++) {
      const p = pts[i], q = pts[(i + 1) % 10];
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      d += (i ? '' : `M${pt(...m)}`);
      const r2 = pts[(i + 1) % 10], s2 = pts[(i + 2) % 10];
      d += `Q${pt(...r2)} ${pt((r2[0] + s2[0]) / 2, (r2[1] + s2[1]) / 2)}`;
    }
    return d + 'Z';
  }
  const adesivos = (f, cor, extra = '') => f.adesivos.map(([x, y, r, g]) => `<path d="${estrelaRedonda(x, y, r, g)}" fill="${cor}"${extra}/>`).join('') +
    `<path d="${crescente(f.luaAdesivo[0], f.luaAdesivo[1], f.luaAdesivo[2], 11, -8, f.luaAdesivo[2] * .82)}" fill="${cor}"${extra}/>`;

  // Janela: moldura com o alto em arco abatido. "alto" estica a janela para cima (em pé
  // ela é mais alta, como as janelas de duas folhas); o peitoril fica no mesmo lugar.
  const vao = alto => `M628 ${168 - alto}Q800 ${126 - alto} 972 ${168 - alto}L972 540L628 540Z`;
  const moldura = alto => `M598 ${160 - alto}Q800 ${102 - alto} 1002 ${160 - alto}L1002 562L598 562Z`;
  // Cúpula do abajur (vista um pouquinho de cima: as bocas são elipses).
  const CUPULA = 'M274 470L250 562A80 13 0 0 0 410 562L386 470A56 9 0 0 1 274 470Z';

  // Pontos de referência de cada objeto, nas coordenadas em que ele foi desenhado.
  const REF = {
    janela: alto => [800, 102 - alto],  // alto do arco
    abajur: [330, 470],      // boca de cima da cúpula
    desenho: [364, 298],     // meio do papel
    samambaia: [1240, 236],  // boca do vaso
    cesto: [1320, 840],      // fundo do cesto
    tapete: [800, 884],      // meio do tapete
  };

  // Linhas do chão em perspectiva: lajotas com a mesma profundidade, cada fileira um
  // pouco maior que a de trás.
  const fileiras = (horizonte, chao, quantas, passo) =>
    Array.from({ length: quantas }, (_, k) => Math.round(horizonte + (chao - horizonte) / (1 - passo * k)));

  const FORMATOS = {
    // celular em pé: o formato principal
    retrato: {
      largura: 1400, altura: 2000,
      chao: 1290, barrado: 850, fuga: [700, 640], linhas: fileiras(640, 1290, 10, .065), lajota: 82,
      tapete: [700, 1742, 1.2],
      janela: [700, 218, 1.12], alto: 100, veneziana: 100,
      abajur: { tipo: 'pe', pos: [305, 640, .72], pe: 1332 },
      desenho: [305, 470, .78],
      samambaia: [1095, 470, .85],
      cesto: [1122, 1384, .8],
      adesivos: [[296, 120, 14, -8], [400, 52, 10, 14], [505, 168, 12, 4], [640, 62, 16, -12], [770, 150, 11, 20],
        [880, 50, 14, -4], [1000, 184, 11, 10], [1196, 110, 14, -16], [1262, 300, 11, 6], [290, 330, 11, -10], [288, 588, 10, 16]],
      luaAdesivo: [536, 90, 19],
      luar: {
        feixe: 'M520 821L880 821L1010 2000L330 2000Z',
        mancha: 'M560 1520L880 1520L990 1960L430 1960Z',
        cruz: 'M722 1520L712 1960M495 1700L935 1700',
      },
      folhas: false,
    },
    // tablet e celular deitados
    paisagem: {
      largura: 1600, altura: 1000,
      chao: 712, barrado: 566, fuga: [800, 380], linhas: [712, 728, 748, 774, 807, 848, 899, 962, 1040], lajota: 86,
      tapete: [800, 884, 1],
      janela: [800, 102, 1], alto: 0, veneziana: 128,
      abajur: { tipo: 'mesa', pos: [330, 470, 1] },
      desenho: [364, 298, 1],
      samambaia: [1240, 236, 1],
      cesto: [1320, 840, 1],
      adesivos: [[140, 110, 17, -8], [262, 52, 11, 14], [452, 128, 13, 4], [562, 48, 18, -12], [724, 42, 12, 20],
        [902, 56, 16, -4], [1064, 92, 12, 10], [1160, 36, 10, -16], [1462, 118, 18, 6], [1546, 262, 12, -10], [1490, 430, 14, 16]],
      luaAdesivo: [380, 62, 22],
      luar: {
        feixe: 'M640 540L972 540L1000 1000L520 1000Z',
        mancha: 'M682 760L948 760L1004 990L556 990Z',
        cruz: 'M818 760L830 990M670 852L978 852',
      },
      folhas: true,
    },
  };
  const formatoDe = nome => FORMATOS[nome] || FORMATOS.retrato;

  // ---------------------------------------------------------------- quarto

  function quarto(formato) {
    const f = formatoDe(formato);
    const W = f.largura, H = f.altura;
    const rnd = sorteio(42);
    const defs = `<defs>` +
      linear('cq-parede', [[0, '#3E625F'], [.55, '#5D8781'], [1, '#6B938B']]) +
      linear('cq-barrado', [[0, '#2E5450'], [1, '#26443F']]) +
      radial('cq-canto', [[0, '#000', 0], [.62, '#0B1618', 0], [1, '#0B1618', .55]], ' cx=".5" cy=".42" r=".75"') +
      linear('cq-moldura', [[0, '#F6ECD9'], [1, '#D9C7A9']]) +
      linear('cq-veneziana', [[0, '#4C82B6'], [1, '#2F5D8E']], 'x1="0" y1="0" x2="1" y2="0"') +
      linear('cq-chao', [[0, '#8E4A2E'], [1, '#B4633F']]) +
      linear('cq-rodape', [[0, '#5B3A28'], [1, '#3D2619']]) +
      linear('cq-mesa', [[0, '#9A6A45'], [1, '#6E4529']]) +
      linear('cq-cupula', [[0, '#C98F2E'], [.5, '#F2C25A'], [1, '#C98F2E']], 'x1="0" y1="0" x2="1" y2="0"') +
      linear('cq-vaso', [[0, '#2F6F80'], [.5, '#4B95A4'], [1, '#245766']], 'x1="0" y1="0" x2="1" y2="0"') +
      linear('cq-barro', [[0, '#C46B45'], [1, '#8E4529']], 'x1="0" y1="0" x2="1" y2="0"') +
      linear('cq-cesto', [[0, '#D3A564'], [1, '#9C6E36']]) +
      radial('cq-sombra', [[0, '#120A0C', .5], [1, '#120A0C', 0]]) +
    `</defs>`;

    // Parede: reboco esverdeado, barrado escuro embaixo, cantos mais escuros.
    const parede = `<rect width="${W}" height="${f.chao}" fill="url(#cq-parede)"/>` +
      `<rect y="${f.barrado}" width="${W}" height="${f.chao - f.barrado}" fill="url(#cq-barrado)"/>` +
      `<rect y="${f.barrado - 4}" width="${W}" height="6" fill="#D9C7A9" opacity=".55"/>`;

    // Chão de lajota em perspectiva (ponto de fuga no meio da parede).
    const FUGA = f.fuga, CHAO = f.chao;
    const linhas = f.linhas;
    const xs = [];
    for (let k = -14; k <= 14; k++) xs.push(FUGA[0] + k * f.lajota);
    const noChao = (x0, y) => FUGA[0] + (x0 - FUGA[0]) * (y - FUGA[1]) / (CHAO - FUGA[1]);
    let lajotas = '';
    const tons = ['#A9573A', '#B5603F', '#9E4F33', '#B86A47', '#A65A3B', '#AF5E3D'];
    for (let i = 0; i < linhas.length - 1; i++) {
      for (let j = 0; j < xs.length - 1; j++) {
        const y0 = linhas[i], y1 = linhas[i + 1];
        const q = [[noChao(xs[j], y0), y0], [noChao(xs[j + 1], y0), y0], [noChao(xs[j + 1], y1), y1], [noChao(xs[j], y1), y1]];
        lajotas += `<path d="M${q.map(p => pt(...p)).join('L')}Z" fill="${tons[Math.floor(rnd() * tons.length)]}"/>`;
      }
    }
    const ultima = linhas[linhas.length - 1];
    let rejunte = linhas.map(y => `M0 ${y}H${W}`).join('');
    xs.forEach(x => { rejunte += `M${pt(noChao(x, CHAO), CHAO)}L${pt(noChao(x, ultima), ultima)}`; });
    const chao = `<rect y="${CHAO}" width="${W}" height="${H - CHAO}" fill="url(#cq-chao)"/>` + lajotas +
      `<path d="${rejunte}" stroke="#6E3420" stroke-width="3" opacity=".55"/>` +
      `<rect y="${CHAO - 12}" width="${W}" height="18" fill="url(#cq-rodape)"/>`;

    // Tapete de crochê redondo, com a borda de bicos.
    let bicos = '';
    for (let i = 0; i < 64; i++) {
      const a = i / 64 * Math.PI * 2;
      bicos += `<ellipse cx="${n(800 + Math.cos(a) * 520)}" cy="${n(884 + Math.sin(a) * 104)}" rx="18" ry="8" fill="#EADBB8"/>`;
    }
    const aneis = [[506, 101, '#F1E4C6'], [452, 90, '#E7B54A'], [400, 80, '#F1E4C6'], [340, 68, '#D9705A'], [280, 56, '#F1E4C6'], [210, 42, '#E7B54A'], [130, 26, '#F1E4C6']];
    let pontos = '';
    aneis.forEach(([rx, ry], k) => {
      if (k % 2) return;
      for (let i = 0; i < 48; i++) {
        const a = i / 48 * Math.PI * 2;
        pontos += `<circle cx="${n(800 + Math.cos(a) * (rx - 14))}" cy="${n(884 + Math.sin(a) * (ry - 3))}" r="2.6" fill="#B89870" opacity=".5"/>`;
      }
    });
    const tapete = noLugar(REF.tapete, f.tapete, `<ellipse cx="800" cy="896" rx="540" ry="112" fill="url(#cq-sombra)"/>` + bicos +
      aneis.map(([rx, ry, cor]) => `<ellipse cx="800" cy="884" rx="${rx}" ry="${ry}" fill="${cor}"/>`).join('') + pontos);

    // Janela: moldura creme, peitoril, venezianas azuis abertas na parede.
    // A veneziana encosta na moldura (esq/dir) e abre para fora, com a largura do formato.
    const veneziana = (encosto, lado, largura) => {
      const topo = 150 - f.alto, base = 558;
      const esq = lado > 0 ? encosto : encosto - largura, dir = esq + largura;
      let ripas = '';
      for (let y = topo + 26; y < base - 16; y += 15) ripas += `M${esq + 14} ${y}H${dir - 14}`;
      return `<rect x="${esq}" y="${topo}" width="${largura}" height="${base - topo}" rx="4" fill="url(#cq-veneziana)"/>` +
        `<rect x="${esq + 10}" y="${topo + 14}" width="${largura - 20}" height="${base - topo - 28}" rx="3" fill="#2A5583" opacity=".55"/>` +
        `<path d="${ripas}" stroke="#7FB0DD" stroke-width="5" opacity=".55"/>` +
        `<path d="${ripas}" stroke="#1E436C" stroke-width="2" opacity=".6" transform="translate(0 4)"/>` +
        `<rect x="${lado < 0 ? dir - 10 : esq + 4}" y="${topo + 180}" width="6" height="26" rx="3" fill="#2A2E36" opacity=".7"/>`;
    };
    const janela = veneziana(598, -1, f.veneziana) + veneziana(1002, 1, f.veneziana) +
      `<path d="${moldura(f.alto)}" fill="url(#cq-moldura)"/>` +
      `<path d="M598 ${160 - f.alto}Q800 ${102 - f.alto} 1002 ${160 - f.alto}" fill="none" stroke="#FFF8EC" stroke-width="5" opacity=".6"/>` +
      `<rect x="574" y="556" width="452" height="26" rx="6" fill="#EDE0C8"/>` +
      `<rect x="580" y="582" width="440" height="10" rx="5" fill="#1C1110" opacity=".3"/>` +
      // cactozinho no peitoril
      `<path d="M918 556L922 528H958L962 556Z" fill="url(#cq-barro)"/>` +
      `<path d="M928 530C924 506 930 488 940 486C950 488 956 506 952 530Z" fill="#4E8C5A"/>` +
      `<path d="M952 512C962 510 966 500 964 492" fill="none" stroke="#4E8C5A" stroke-width="8" stroke-linecap="round"/>` +
      `<circle cx="940" cy="484" r="5" fill="#F28CA0"/>`;

    // Desenho de criança preso na parede: o Momon com a lua, um sol e um coração.
    const desenho = `<g${lugar(REF.desenho, f.desenho)}><g transform="rotate(-5 360 300)">` +
      `<rect x="294" y="242" width="140" height="112" rx="3" fill="#FFF8EA"/>` +
      `<rect x="294" y="242" width="140" height="112" rx="3" fill="#000" opacity=".06" transform="translate(4 5)"/>` +
      `<rect x="300" y="236" width="34" height="12" fill="#F4F0D0" opacity=".7" transform="rotate(-12 317 242)"/>` +
      `<rect x="396" y="236" width="34" height="12" fill="#F4F0D0" opacity=".7" transform="rotate(10 413 242)"/>` +
      `<circle cx="352" cy="306" r="26" fill="none" stroke="#EC8A33" stroke-width="5"/>` +
      `<path d="M330 290L332 268L346 282M362 281L374 266L376 290" fill="none" stroke="#EC8A33" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<path d="M347 298Q352 294 354 299" fill="none" stroke="#E2B13B" stroke-width="4" stroke-linecap="round"/>` +
      `<circle cx="343" cy="309" r="2.5" fill="#3A2A2A"/><circle cx="361" cy="309" r="2.5" fill="#3A2A2A"/>` +
      `<path d="M346 318Q352 323 358 318" fill="none" stroke="#3A2A2A" stroke-width="2.5" stroke-linecap="round"/>` +
      `<circle cx="410" cy="266" r="10" fill="none" stroke="#F2C12E" stroke-width="4"/>` +
      `<path d="M410 250V246M424 266H428M410 282V286M396 266H392" stroke="#F2C12E" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M408 330C400 323 397 318 400 314C403 311 407 313 408 316C409 313 413 311 416 314C419 318 416 323 408 330Z" fill="#E8546B"/>` +
      `<path d="M304 344Q330 336 360 344T424 342" fill="none" stroke="#6DB36D" stroke-width="4" stroke-linecap="round"/>` +
    `</g></g>`;

    // Abajur de franja: a cúpula é a mesma; deitado ele fica numa mesinha com livros,
    // em pé é de pé alto (a haste passa por trás do Momon e chega no chão).
    let franja = '';
    for (let x = 254; x <= 406; x += 12) {
      const y = 562 + 13 * Math.sqrt(Math.max(0, 1 - ((x - 330) / 80) ** 2));
      franja += `<path d="M${x} ${n(y)}V${n(y + 7)}" stroke="#C98A2E" stroke-width="2"/><circle cx="${x}" cy="${n(y + 10)}" r="4.5" fill="#E1A13A"/>`;
    }
    const cupula = `<ellipse cx="330" cy="470" rx="56" ry="9" fill="#8A5A1E"/>` +
      `<path d="${CUPULA}" fill="url(#cq-cupula)"/>` +
      `<path d="M302 472L288 573M330 479V575M358 472L372 573" stroke="#B57A24" stroke-width="2" opacity=".3"/>` +
      franja;
    const abajur = f.abajur.tipo === 'mesa'
      ? noLugar(REF.abajur, f.abajur.pos, `<ellipse cx="330" cy="770" rx="130" ry="18" fill="url(#cq-sombra)"/>` +
        `<path d="M262 650L248 764M330 654V770M398 650L412 764" stroke="#6E4529" stroke-width="10" stroke-linecap="round"/>` +
        `<ellipse cx="330" cy="648" rx="118" ry="20" fill="#5E3A22"/>` +
        `<ellipse cx="330" cy="640" rx="118" ry="20" fill="url(#cq-mesa)"/>` +
        // livros
        `<rect x="384" y="616" width="74" height="13" rx="3" fill="#C9473E"/>` +
        `<rect x="390" y="603" width="64" height="13" rx="3" fill="#3E8B6E"/>` +
        `<rect x="386" y="591" width="70" height="12" rx="3" fill="#E7B54A"/>` +
        `<path d="M386 603H456M390 616H454" stroke="#fff" stroke-width="1.5" opacity=".35"/>` +
        // pé de cerâmica e cúpula
        `<path d="M308 636C296 620 300 596 318 586H342C360 596 364 620 352 636Z" fill="url(#cq-vaso)"/>` +
        `<rect x="324" y="560" width="12" height="28" fill="#C9B79C"/>` +
        cupula)
      : (() => {
        const [x, y, k] = f.abajur.pos, chao = f.abajur.pe;
        const baixo = y + (575 - 470) * k;
        return `<ellipse cx="${x}" cy="${chao + 6}" rx="${n(110 * k)}" ry="16" fill="url(#cq-sombra)"/>` +
          // haste de latão com um nó no meio e o pé redondo
          `<path d="M${x} ${n(baixo)}V${chao}" stroke="#6E4E2A" stroke-width="9" stroke-linecap="round"/>` +
          `<path d="M${x - 1.5} ${n(baixo)}V${chao}" stroke="#C9A060" stroke-width="2.5" opacity=".7"/>` +
          `<ellipse cx="${x}" cy="${n((baixo + chao) / 2)}" rx="9" ry="12" fill="#8A6A3A"/>` +
          `<ellipse cx="${x}" cy="${chao}" rx="${n(58 * k)}" ry="13" fill="#4E3420"/>` +
          `<ellipse cx="${x}" cy="${chao - 4}" rx="${n(54 * k)}" ry="11" fill="url(#cq-mesa)"/>` +
          noLugar(REF.abajur, f.abajur.pos, cupula);
      })();

    // Samambaia pendurada num macramê: as folhas de trás, o vaso, as folhas da frente.
    const samambaia = (() => {
      const X = 1240, BOCA = 236;
      // macramê: argola, três cordas que se cruzam em nós e abraçam o vaso, e a franja embaixo
      const corda = '#E9DCC0', cordaSombra = '#B9A98A';
      const nos = [[1240, 70], [1222, 150], [1258, 150], [1240, 196]];
      const macrame = `<path d="M1240 -10V58" stroke="${corda}" stroke-width="5"/>` +
        `<path d="M1238 66L1206 230M1240 66L1240 150L1222 196L1214 230M1242 66L1240 150L1258 196L1266 230M1240 70L1222 150L1240 196L1258 150L1240 70" fill="none" stroke="${corda}" stroke-width="3.5"/>` +
        `<path d="M1238 66L1206 230M1242 66L1274 230" fill="none" stroke="${cordaSombra}" stroke-width="3.5"/>` +
        nos.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="9" fill="${corda}"/><path d="M${x - 6} ${y - 2}H${x + 6}M${x - 6} ${y + 3}H${x + 6}" stroke="${cordaSombra}" stroke-width="1.5"/>`).join('');
      const franja = `<path d="M1240 300V330" stroke="${corda}" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M1234 330L1228 384M1238 330L1236 392M1242 330L1244 390M1246 330L1252 382" stroke="${corda}" stroke-width="3" stroke-linecap="round"/>`;
      // uma fronde: sobe um pouco por cima da boca do vaso e cai, com folíolos densos
      const fronde = (lado, abre, sobe, cai, x0, fase) => {
        const p0 = [x0, BOCA], p1 = [x0 + abre * .45, BOCA - sobe], p2 = [x0 + abre, BOCA - sobe * .6], p3 = [x0 + abre * 1.12, BOCA + cai];
        const em = t => {
          const u = 1 - t;
          return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
        };
        let folhas = '';
        const N = 30;
        for (let k = 3; k < N; k++) {
          const t = k / N, a = em(t), b = em(Math.min(1, t + .01));
          const dir = Math.atan2(b[1] - a[1], b[0] - a[0]);
          const tam = 21 * Math.sin(Math.PI * Math.min(1, t * 1.05 + .05)) * (1 - t * .35) + 4;
          for (const s2 of [-1, 1]) {
            const ang = dir + s2 * 1.05 + (k % 2 ? .08 : -.08) + fase;
            const ux = Math.cos(ang), uy = Math.sin(ang), larg = tam * .3;
            const ponta = [a[0] + ux * tam, a[1] + uy * tam];
            folhas += `M${pt(...a)}Q${pt(a[0] + ux * tam * .5 - uy * larg, a[1] + uy * tam * .5 + ux * larg)} ${pt(...ponta)}` +
              `Q${pt(a[0] + ux * tam * .5 + uy * larg, a[1] + uy * tam * .5 - ux * larg)} ${pt(...a)}Z`;
          }
        }
        return { haste: `M${pt(...p0)}C${pt(...p1)} ${pt(...p2)} ${pt(...p3)}`, folhas };
      };
      const camada = (quantas, tons, sobeMax, semente) => {
        const r = sorteio(semente);
        const porTom = tons.map(() => ''), hastes = tons.map(() => '');
        for (let f = 0; f < quantas; f++) {
          const lado = f % 2 ? 1 : -1;
          const abre = lado * (40 + r() * 120);
          const fr = fronde(lado, abre, 20 + r() * sobeMax, 90 + r() * 220, X + (r() - .5) * 46, (r() - .5) * .2);
          const i = f % tons.length;
          porTom[i] += fr.folhas;
          hastes[i] += fr.haste;
        }
        return tons.map((tom, i) => `<path d="${hastes[i]}" fill="none" stroke="${tom}" stroke-width="2.5"/><path d="${porTom[i]}" fill="${tom}"/>`).join('');
      };
      const vaso = `<path d="M1204 236H1276L1266 292Q1240 302 1214 292Z" fill="url(#cq-barro)"/>` +
        `<path d="M1210 252H1270" stroke="#7A3A22" stroke-width="2" opacity=".5"/>` +
        `<rect x="1198" y="230" width="84" height="14" rx="6" fill="#D47A52"/>` +
        `<rect x="1198" y="230" width="84" height="4" rx="2" fill="#F0A27C" opacity=".6"/>`;
      const [x, y, k] = f.samambaia;
      const ateOTeto = y - (REF.samambaia[1] + 10) * k > 0
        ? `<path d="M${x} 0V${n(y - (REF.samambaia[1] - 58) * k)}" stroke="${corda}" stroke-width="${n(5 * k)}"/>` : '';
      return ateOTeto + noLugar(REF.samambaia, f.samambaia, macrame + franja +
        camada(9, ['#2F5E3B', '#386E45'], 40, 12) + vaso +
        camada(8, ['#4E9259', '#5FA866', '#46854F'], 70, 19));
    })();

    // Cesto de vime com novelos (os brinquedos que vêm depois).
    let tramas = '';
    for (let x = 1236; x <= 1400; x += 14) tramas += `M${x} 762L${x + 10} 832`;
    const cesto = noLugar(REF.cesto, f.cesto, `<ellipse cx="1320" cy="840" rx="110" ry="18" fill="url(#cq-sombra)"/>` +
      `<circle cx="1284" cy="752" r="34" fill="#E87D8F"/><path d="M1258 740Q1284 728 1310 746M1262 760Q1288 748 1314 766" fill="none" stroke="#C85D70" stroke-width="3"/>` +
      `<circle cx="1346" cy="746" r="30" fill="#E7B54A"/><path d="M1324 736Q1346 726 1370 742M1326 756Q1348 744 1372 760" fill="none" stroke="#C4902E" stroke-width="3"/>` +
      `<path d="M1228 758H1412L1398 836Q1320 850 1242 836Z" fill="url(#cq-cesto)"/>` +
      `<path d="${tramas}" stroke="#8C5E2B" stroke-width="3" opacity=".45"/>` +
      `<rect x="1222" y="752" width="196" height="14" rx="7" fill="#C49452"/>` +
      `<circle cx="1180" cy="858" r="24" fill="#5FB1A6"/><path d="M1162 850Q1180 840 1198 854M1164 866Q1182 856 1200 870" fill="none" stroke="#3E8C82" stroke-width="3"/>` +
      `<path d="M1156 862C1110 880 1060 900 1010 902" fill="none" stroke="#5FB1A6" stroke-width="3" stroke-linecap="round"/>`);

    return svg('cena-quarto', f, defs + parede + adesivos(f, '#E6EBCF', ' opacity=".5"') + chao + tapete +
      noLugar(REF.janela(f.alto), f.janela, janela) + desenho + abajur + samambaia + cesto +
      `<rect width="${W}" height="${H}" fill="url(#cq-canto)"/>`);
  }

  // ---------------------------------------------------------------- luzes

  function luzes(formato) {
    const f = formatoDe(formato);
    const rnd = sorteio(7);
    const defs = `<defs>` +
      linear('cl-ceu', [[0, '#14244D'], [.55, '#253C74'], [1, '#43599A']]) +
      radial('cl-lua', [[0, '#FFF4CC', .85], [.4, '#FFE7A0', .3], [1, '#FFE7A0', 0]]) +
      linear('cl-lua-forma', [[0, '#FFF8DE'], [1, '#F3D48A']], 'x1="0" y1="0" x2="1" y2="1"') +
      radial('cl-abajur', [[0, '#FFD58A', .55], [.35, '#FFC46A', .22], [1, '#FFC46A', 0]]) +
      radial('cl-vagalume', [[0, '#FFFBD0', 1], [.3, '#F0FF8A', .7], [1, '#E0FF60', 0]]) +
      linear('cl-feixe', [[0, '#C9DEFF', .16], [1, '#C9DEFF', 0]]) +
      linear('cl-luar', [[0, '#D6E6FF', .26], [1, '#D6E6FF', .1]]) +
      linear('cl-cupula-acesa', [[0, '#FFE6A8', .9], [1, '#FFC860', .75]]) +
      radial('cl-adesivo', [[0, '#D8FF9C', .5], [.45, '#C8F58A', .14], [1, '#C8F58A', 0]]) +
      linear('cl-cone-cima', [[0, '#FFE2A0', 0], [1, '#FFE2A0', .2]]) +
      linear('cl-cone-baixo', [[0, '#FFE2A0', .32], [1, '#FFE2A0', .06]]) +
      radial('cl-chao-quente', [[0, '#FFC978', .22], [1, '#FFC978', 0]]) +
      `<clipPath id="cl-vao"><path d="${vao(f.alto)}"/></clipPath>` +
    `</defs>`;

    // Lá fora: céu, lua grande, estrelas, morro, telhados com janelinhas acesas, uma palmeira.
    const A = f.alto, LUA = [892, 236 - A * .55];
    let estrelas = '';
    for (let i = 0; i < 24 + A / 8; i++) {
      const x = 640 + rnd() * 320, y = 150 - A + rnd() * (250 + A);
      if (Math.hypot(x - LUA[0], y - LUA[1]) < 80) continue;
      const r = 2.5 + rnd() * 5;
      estrelas += `<path class="estrela-janela" style="animation-delay:${n(rnd() * 3)}s" d="${brilho(x, y, r)}" fill="#FFF4CF"/>`;
    }
    const telhado = (x, y, l, a, cor) => `<path d="M${x} ${y}L${x + l / 2} ${y - a}L${x + l} ${y}V560H${x}Z" fill="${cor}"/>` +
      `<path d="M${x - 6} ${y + 2}L${x + l / 2} ${y - a}L${x + l + 6} ${y + 2}" fill="none" stroke="#6A3328" stroke-width="7" stroke-linejoin="round"/>`;
    const janelinha = (x, y) => `<rect x="${x}" y="${y}" width="12" height="14" rx="2" fill="#FFD27A"/>` +
      `<rect x="${x - 8}" y="${y - 8}" width="28" height="30" rx="8" fill="#FFD27A" opacity=".18"/>`;
    const lafora = `<g clip-path="url(#cl-vao)">` +
      `<rect x="600" y="${110 - A}" width="400" height="${460 + A}" fill="url(#cl-ceu)"/>` +
      estrelas +
      `<circle cx="${LUA[0]}" cy="${LUA[1]}" r="120" fill="url(#cl-lua)"/>` +
      `<path d="${crescente(LUA[0] - 4, LUA[1] + 2, 50, 24, -18, 43)}" fill="url(#cl-lua-forma)"/>` +
      `<path d="M600 470C680 440 760 452 820 470C880 446 950 440 1000 456V560H600Z" fill="#26305C"/>` +
      telhado(612, 492, 120, 40, '#2B2846') + telhado(716, 506, 100, 34, '#332E50') + telhado(860, 486, 132, 44, '#2B2846') +
      janelinha(652, 506) + janelinha(756, 518) + janelinha(900, 504) + janelinha(946, 514) +
      // palmeira
      `<path d="M820 540C822 500 818 470 826 440" fill="none" stroke="#1E1F38" stroke-width="7" stroke-linecap="round"/>` +
      [[-60, 30], [-40, -6], [10, -24], [52, -4], [66, 26]].map(([dx, dy]) =>
        `<path d="M826 440Q${826 + dx * .5} ${440 + dy - 22} ${826 + dx} ${440 + dy}" fill="none" stroke="#1E1F38" stroke-width="8" stroke-linecap="round"/>`).join('') +
      // vaga-lumes lá fora
      [[700, 470], [760, 430], [940, 450], [980, 410], [672, 420]].map(([x, y], i) =>
        `<circle class="vagalume-janela" style="animation-delay:${i * .7}s" cx="${x}" cy="${y}" r="14" fill="url(#cl-vagalume)"/>`).join('') +
    `</g>` +
    // a cruz da janela
    `<rect x="794" y="${134 - A}" width="12" height="${406 + A}" fill="#E9DCC4"/>` +
    `<rect x="628" y="${330 - A * .5}" width="344" height="12" fill="#E9DCC4"/>`;

    // Feixe de luar: entra pela janela e desenha a janela no chão, em volta do Momon.
    const luar = `<path d="${f.luar.feixe}" fill="url(#cl-feixe)"/>` +
      `<path d="${f.luar.mancha}" fill="url(#cl-luar)"/>` +
      `<path d="${f.luar.cruz}" stroke="#0C1426" stroke-width="16" opacity=".14"/>`;

    // Cone de luz com borda macia: várias camadas, cada uma mais larga e mais fraca.
    const cone = ([[x0, y0], [x1, y1]], yFim, abre, macio, grad) => {
      let d = '';
      for (let k = 0; k < 5; k++) {
        const extra = abre + macio * (k - 2) / 2;
        d += `<path d="M${x0 + 2} ${y0}L${x1 - 2} ${y1}L${x1 + extra} ${yFim}L${x0 - extra} ${yFim}Z" fill="url(#${grad})" opacity=".36"/>`;
      }
      return d;
    };

    // Luz do abajur (apaga na hora de dormir): o halo, o cone para cima e para baixo
    // na parede, a cúpula acesa por dentro e, embaixo, a mesinha ou o chão iluminados.
    const cupulaAcesa = noLugar(REF.abajur, f.abajur.pos, `<path d="${CUPULA}" fill="url(#cl-cupula-acesa)"/>` +
      `<ellipse cx="330" cy="470" rx="54" ry="8" fill="#FFF3C8"/>` +
      `<path d="M302 472L288 573M330 479V575M358 472L372 573" stroke="#C98A2E" stroke-width="2" opacity=".25"/>`);
    let abajur;
    if (f.abajur.tipo === 'mesa') {
      abajur = `<circle cx="330" cy="540" r="520" fill="url(#cl-abajur)"/>` +
        cone([[278, 470], [382, 470]], 0, 150, 210, 'cl-cone-cima') +
        cone([[254, 566], [406, 566]], 642, 100, 26, 'cl-cone-baixo') +
        `<ellipse cx="330" cy="640" rx="116" ry="19" fill="#FFD27A" opacity=".28"/>` +
        `<ellipse cx="330" cy="782" rx="280" ry="46" fill="url(#cl-chao-quente)"/>`;
    } else {
      const [x, y, k] = f.abajur.pos, chao = f.abajur.pe;
      const X = v => n(x + (v - 330) * k), Y = v => n(y + (v - 470) * k);
      abajur = `<circle cx="${x}" cy="${Y(520)}" r="440" fill="url(#cl-abajur)"/>` +
        cone([[X(278), Y(470)], [X(382), Y(470)]], 0, 120, 170, 'cl-cone-cima') +
        cone([[X(254), Y(566)], [X(406), Y(566)]], chao, 70, 60, 'cl-cone-baixo') +
        `<ellipse cx="${x}" cy="${chao + 8}" rx="230" ry="40" fill="url(#cl-chao-quente)"/>`;
    }
    abajur = `<g class="abajur-luz">${abajur}${cupulaAcesa}</g>`;

    const brilhamNoEscuro = `<g class="adesivos-acesos">` +
      f.adesivos.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${n(r * 2.6)}" fill="url(#cl-adesivo)"/>`).join('') +
      `<circle cx="${f.luaAdesivo[0]}" cy="${f.luaAdesivo[1]}" r="${f.luaAdesivo[2] * 2.6}" fill="url(#cl-adesivo)"/>` +
      adesivos(f, '#E2FFB8') +
    `</g>`;
    return svg('cena-luzes', f, defs + luar + noLugar(REF.janela(f.alto), f.janela, lafora) + abajur + brilhamNoEscuro);
  }

  // ---------------------------------------------------------------- primeiro plano

  // Folha de costela-de-adão. Coordenadas locais: o cabinho em (0,0), a ponta em (L,0).
  // O contorno é um coração alongado; os recortes e os furinhos são feitos com máscara.
  function costelaDeAdao(id, L, rnd) {
    const P = (x, y) => pt(x * L, y * L);
    const metade = s => `C${P(-.1, s * .1)} ${P(-.13, s * .33)} ${P(.04, s * .42)}` +
      `C${P(.22, s * .54)} ${P(.64, s * .52)} ${P(.86, s * .26)}C${P(.95, s * .14)} ${P(1, s * .05)} ${P(1, 0)}`;
    const contorno = `M${P(.02, 0)}${metade(-1)}` +
      `C${P(1, .05)} ${P(.95, .14)} ${P(.86, .26)}C${P(.64, .52)} ${P(.22, .54)} ${P(.04, .42)}C${P(-.13, .33)} ${P(-.1, .1)} ${P(.02, 0)}Z`;
    let cortes = '', furos = '';
    for (const lado of [-1, 1]) {
      for (let k = 0; k < 5; k++) {
        const x0 = .14 + k * .16 + (rnd() - .5) * .03;
        const dentro = .09 + rnd() * .04;                     // o recorte para antes da nervura
        const ang = (62 - k * 7 + (rnd() - .5) * 8) * Math.PI / 180;
        const ux = Math.cos(ang), uy = Math.sin(ang) * lado;
        const ini = [x0 + ux * dentro / Math.sin(ang) * .2, lado * dentro];
        const fim = [ini[0] + ux * .7, ini[1] + uy * .7];
        const g = .03 + rnd() * .014;                         // largura do recorte na borda
        const px = -uy * g, py = ux * g;
        cortes += `M${P(...ini)}L${P(fim[0] + px, fim[1] + py)}L${P(fim[0] - px, fim[1] - py)}Z`;
        if (k > 0 && k < 4 && rnd() < .8) {
          const fx = x0 - .07, fy = lado * (.045 + rnd() * .02);
          furos += `<ellipse cx="${n(fx * L)}" cy="${n(fy * L)}" rx="${n(L * .04)}" ry="${n(L * .016)}" transform="rotate(${n(lado * ang * 180 / Math.PI)} ${n(fx * L)} ${n(fy * L)})"/>`;
        }
      }
    }
    return {
      mascara: `<mask id="${id}" maskUnits="userSpaceOnUse" x="${-L * .3}" y="${-L * .7}" width="${L * 1.6}" height="${L * 1.4}">` +
        `<rect x="${-L * .3}" y="${-L * .7}" width="${L * 1.6}" height="${L * 1.4}" fill="#fff"/>` +
        `<path d="${cortes}" fill="#000"/><g fill="#000">${furos}</g></mask>`,
      contorno,
    };
  }

  // Duas folhas escuras entrando pelo canto de baixo: dão profundidade (a câmera está
  // "atrás" das plantas). Só no formato deitado; em pé, o canto é dos botões.
  function primeiroPlano(formato) {
    const f = formatoDe(formato);
    if (!f.folhas) return svg('cena-primeiro-plano', f, '');
    const rnd = sorteio(31);
    let defs = '', corpo = '';
    [[-50, 880, -34, 310, '#142822', '#47776A'], [-40, 1020, -8, 250, '#1A322B', '#53897A']].forEach(([x, y, giro, L, tom, luz], i) => {
      const f = costelaDeAdao(`cp-recorte-${i}`, L, rnd);
      defs += f.mascara;
      corpo += `<g transform="translate(${x} ${y}) rotate(${giro})">` +
        `<path d="M${-L * .6} ${L * .02}Q${-L * .3} 0 ${L * .02} 0" fill="none" stroke="${tom}" stroke-width="${n(L * .035)}" stroke-linecap="round"/>` +
        `<g mask="url(#cp-recorte-${i})">` +
          `<path d="${f.contorno}" fill="${tom}"/>` +
          // borda de cima pega o luar (a janela fica à direita)
          `<path d="${f.contorno}" fill="none" stroke="${luz}" stroke-width="${n(L * .012)}" opacity=".45" transform="translate(0 ${-L * .006})"/>` +
          `<path d="M${L * .02} 0Q${L * .5} ${-L * .03} ${L * .98} 0" fill="none" stroke="${luz}" stroke-width="${n(L * .014)}" opacity=".55" stroke-linecap="round"/>` +
        `</g>` +
      `</g>`;
    });
    return svg('cena-primeiro-plano', f, `<defs>${defs}</defs>` + corpo);
  }

  // ---------------------------------------------------------------- almofada

  // Almofada de chita, na mesma escala do Momon (viewBox 0 0 400 420); passa um pouco das bordas.
  function almofada() {
    const flores = [
      [70, 392, 22, '#D9443A', '#F2C230', 0], [150, 372, 18, '#F2C230', '#D9443A', .4], [236, 366, 20, '#F08FA4', '#D9443A', .2],
      [318, 380, 22, '#D9443A', '#F2C230', .6], [372, 404, 14, '#F2C230', '#D9443A', .1], [26, 414, 14, '#F08FA4', '#F2C230', .3],
      [118, 420, 16, '#F2C230', '#D9443A', .5], [204, 426, 22, '#D9443A', '#F2C230', .9], [286, 424, 16, '#F08FA4', '#F2C230', .7],
    ];
    const folhas = [[104, 386, -20], [192, 376, 30], [276, 372, -40], [350, 394, 20], [58, 420, 40], [160, 428, -30], [246, 434, 10], [334, 430, -20]];
    return `<svg class="almofada" viewBox="-40 300 480 170" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        linear('ca-lado', [[0, '#1E3E78'], [1, '#132A55']]) +
        radial('ca-luz', [[0, '#FFFFFF', .14], [.6, '#FFFFFF', 0], [1, '#0A1430', .35]], ' cx=".4" cy=".3" r=".8"') +
        radial('ca-sombra', [[0, '#10080A', .55], [1, '#10080A', 0]]) +
        `<clipPath id="ca-tampo"><ellipse cx="200" cy="398" rx="216" ry="54"/></clipPath>` +
        `<clipPath id="ca-lateral"><path d="M-16 398C-16 446 92 466 200 466C308 466 416 446 416 398Z"/></clipPath>` +
      `</defs>` +
      `<ellipse cx="200" cy="452" rx="244" ry="26" fill="url(#ca-sombra)"/>` +
      // lateral (a chita continua, mais escura)
      `<path d="M-16 398C-16 446 92 466 200 466C308 466 416 446 416 398Z" fill="url(#ca-lado)"/>` +
      `<g clip-path="url(#ca-lateral)" opacity=".7">` +
        [[10, 440, '#D9443A'], [96, 452, '#F2C230'], [190, 458, '#F08FA4'], [282, 452, '#D9443A'], [370, 440, '#F2C230']].map(([x, y, cor]) =>
          florDeChita(x, y, 15, 6, cor, '#1E3E78', .7)).join('') +
      `</g>` +
      // tampo de chita
      `<ellipse cx="200" cy="398" rx="216" ry="54" fill="#244A8C"/>` +
      `<g clip-path="url(#ca-tampo)">` +
        folhas.map(([x, y, g]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="6" fill="#3E8B57" transform="rotate(${g} ${x} ${y})"/>`).join('') +
        flores.map(([x, y, r, cor, miolo, giro]) => florDeChita(x, y, r, 6, cor, miolo, .5, giro)).join('') +
        [[40, 370], [120, 350], [272, 352], [350, 372], [176, 404], [258, 404], [98, 404]].map(([x, y]) =>
          florDeChita(x, y, 6, 5, '#FFF4E4', '#F2C230', .5)).join('') +
        `<ellipse cx="200" cy="398" rx="216" ry="54" fill="url(#ca-luz)"/>` +
      `</g>` +
      // cordão amarelo em volta
      `<ellipse cx="200" cy="398" rx="214" ry="53" fill="none" stroke="#E9B43E" stroke-width="7"/>` +
      `<ellipse cx="200" cy="398" rx="214" ry="53" fill="none" stroke="#B9852A" stroke-width="7" stroke-dasharray="3 6" opacity=".6"/>` +
    `</svg>`;
  }

  // ---------------------------------------------------------------- papel

  // Textura de papel pintado: manchas largas e bem leves e um grão quase invisível,
  // para pôr por cima de tudo (512 px, mostrada a 256 px: fica nítida em tela retina).
  let papelPronto = null;
  function papel() {
    if (papelPronto || typeof document === 'undefined') return papelPronto;
    const tam = 512, c = document.createElement('canvas');
    c.width = c.height = tam;
    const g = c.getContext('2d');
    const rnd = sorteio(5);
    // manchas (repetidas nas bordas para o ladrilho emendar sem costura). São muitas e se
    // sobrepõem, então cada uma é bem fraquinha: no todo o papel escurece o branco só uns 3%.
    for (let i = 0; i < 70; i++) {
      const x = rnd() * tam, y = rnd() * tam, r = 50 + rnd() * 150;
      const claro = rnd() < .5;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, claro ? 'rgba(255,246,226,.02)' : 'rgba(40,24,16,.012)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      for (const dx of [-tam, 0, tam]) for (const dy of [-tam, 0, tam]) { g.save(); g.translate(dx, dy); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
    }
    // grão
    const img = g.getImageData(0, 0, tam, tam);
    for (let i = 0; i < tam * tam; i++) {
      const v = rnd() * 2 - 1, k = i * 4;
      const a = Math.pow(Math.abs(v), 4) * 20;
      const cor = v > 0 ? 255 : 30;
      const aOld = img.data[k + 3] / 255, aNew = a / 255;
      const aTot = aNew + aOld * (1 - aNew);
      if (aTot <= 0) continue;
      for (let c2 = 0; c2 < 3; c2++) img.data[k + c2] = (cor * aNew + img.data[k + c2] * aOld * (1 - aNew)) / aTot;
      img.data[k + 3] = aTot * 255;
    }
    g.putImageData(img, 0, 0);
    papelPronto = c.toDataURL('image/png');
    return papelPronto;
  }

  window.Momon = window.Momon || {};
  window.Momon.cena = { quarto, luzes, primeiroPlano, almofada, papel, FORMATOS };
})();
