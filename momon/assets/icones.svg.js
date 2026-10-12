/*
 * Ícones e pecinhas do Momon, no mesmo estilo levemente 3D. Nenhum tem texto.
 *
 *   Momon.icones.botao(tipo)       -> botão redondo: 'coberta' | 'dormir' | 'acordar' | 'melodia-1..3'
 *   Momon.icones.particula(tipo)   -> 'flor' | 'estrela' | 'vagalume' | 'coracao' | 'z' | 'brilho'
 *   Momon.icones.pata()            -> patinha grande das zonas de amassar pãozinho
 *   Momon.icones.maozinha()        -> mãozinha que mostra onde tocar / arrastar
 *   Momon.icones.ovo()             -> ovinho de estrela (com as partes que racham)
 *
 * Os gradientes de cada desenho têm id próprio com um contador, para vários
 * desenhos iguais conviverem na mesma página.
 */
(function () {
  'use strict';

  let contador = 0;
  const novoId = nome => `mi-${nome}-${++contador}`;
  const n = v => Math.round(v * 10) / 10;
  const paradas = lista => lista.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');

  function estrela(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const ang = (-90 + i * 36) * Math.PI / 180, raio = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + `${n(cx + raio * Math.cos(ang))} ${n(cy + raio * Math.sin(ang))}`;
    }
    return d + 'Z';
  }

  function crescente(cx, cy, r1, dx, dy, r2) {
    const d = Math.hypot(dx, dy);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const px = cx + (a * dx) / d, py = cy + (a * dy) / d;
    const ux = -dy / d, uy = dx / d;
    const p1 = `${n(px + h * ux)} ${n(py + h * uy)}`, p2 = `${n(px - h * ux)} ${n(py - h * uy)}`;
    return `M${p1}A${r1} ${r1} 0 1 1 ${p2}A${r2} ${r2} 0 0 0 ${p1}Z`;
  }

  // ---------------------------------------------------------------- botões

  // Botões de feltro: um disco fofinho com pesponto em volta e o desenho aplicado
  // por cima, como um patch costurado. Fosco, sem brilho de plástico.
  // [feltro, borda escura, linha do pesponto]
  const FELTRO = {
    coberta: ['#DE7D93', '#B4566E', '#FFE9EE'],
    dormir: ['#3C4A8C', '#27306A', '#F3E2B6'],
    acordar: ['#E9A93C', '#C0812A', '#FFF4D6'],
    'melodia-1': ['#3C4A8C', '#27306A', '#F3E2B6'],
    'melodia-2': ['#3C4A8C', '#27306A', '#F3E2B6'],
    'melodia-3': ['#3C4A8C', '#27306A', '#F3E2B6'],
  };

  // Aplique: a forma, uma sombrinha embaixo (espessura do feltro) e o pesponto por dentro.
  const aplique = (d, cor, linha, extra = '') =>
    `<path d="${d}" fill="#000" opacity=".22" transform="translate(0 2.2)"/>` +
    `<path d="${d}" fill="${cor}"${extra}/>` +
    `<path d="${d}" fill="none" stroke="${linha}" stroke-width="1.3" stroke-dasharray="2.6 2.4" stroke-linecap="round" opacity=".8" transform="translate(50 50) scale(.86) translate(-50 -50)"/>`;

  // Nuvem fofinha (cantiga da nuvem e travesseiro).
  const NUVEM = 'M28 64C19 64 16 53 25 50C23 40 35 35 42 41C45 31 62 31 65 43C73 40 83 47 79 57C85 61 81 69 73 68H29Z';

  const DESENHOS = {
    // cobertinha de tricô dobrada, com a barrinha de crochê e um coração
    coberta: () => {
      let bicos = '';
      for (let x = 25; x <= 75; x += 6.25) bicos += `<circle cx="${x}" cy="71" r="3.4" fill="#FFF3E2"/>`;
      let trico = '';
      for (let y = 37; y <= 66; y += 5.2) for (let x = 28; x <= 72; x += 6) trico += `M${x - 2.2} ${n(y - 1.6)}L${x} ${n(y + 1.4)}L${x + 2.2} ${n(y - 1.6)}`;
      return `<path d="M22 46C22 38 26 33 34 33H66C74 33 78 38 78 46V68H22Z" fill="#000" opacity=".22" transform="translate(0 2.2)"/>` +
        bicos +
        `<path d="M22 46C22 38 26 33 34 33H66C74 33 78 38 78 46V68H22Z" fill="#FBE3E6"/>` +
        `<rect x="22" y="45" width="56" height="7" fill="#F2A3B4"/><rect x="22" y="58" width="56" height="5" fill="#F2A3B4"/>` +
        `<path d="${trico}" fill="none" stroke="#C9687F" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>` +
        `<path d="M22 46C22 38 26 33 34 33H66C74 33 78 38 78 46" fill="none" stroke="#fff" stroke-width="1.6" opacity=".6"/>` +
        aplique('M50 63C43 58 39.5 54.5 39.5 50.5C39.5 47.5 42 45.5 44.6 45.5C46.8 45.5 48.7 46.8 50 48.6C51.3 46.8 53.2 45.5 55.4 45.5C58 45.5 60.5 47.5 60.5 50.5C60.5 54.5 57 58 50 63Z', '#D9443A', '#FFD9CF');
    },
    // lua dormindo em cima de uma nuvenzinha, com estrelas
    dormir: () => aplique(NUVEM, '#E9E4F7', '#9C93C9', ' transform="translate(50 60) scale(.62) translate(-50 -56)"') +
      aplique(crescente(48, 40, 20, 10, -8, 17), '#F5DE97', '#B68A2E') +
      aplique(estrela(74, 27, 7, 3.2), '#F5DE97', '#B68A2E') +
      `<path d="${estrela(25, 31, 4.5, 2)}" fill="#F5DE97" opacity=".85"/>`,
    // sol de feltro: raios redondinhos e um sorriso de quem acordou
    acordar: () => {
      let raios = '';
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, longe = i % 2 ? 31 : 36, l = .2;
        const p = r => `${n(50 + Math.cos(a) * r)} ${n(50 + Math.sin(a) * r)}`;
        const lado = (r, s) => `${n(50 + Math.cos(a + s * l) * r)} ${n(50 + Math.sin(a + s * l) * r)}`;
        raios += `<path d="M${lado(19, -1)}Q${lado(longe * .8, -.25)} ${p(longe)}Q${lado(longe * .8, .25)} ${lado(19, 1)}Z" fill="#FFE7A6" stroke="#FFE7A6" stroke-width="2.5" stroke-linejoin="round"/>`;
      }
      return `<g opacity=".95">${raios}</g>` +
        aplique('M50 30A20 20 0 1 1 49.9 30Z', '#FFF2C8', '#D99A2E') +
        `<path d="M42 53Q50 60 58 53" fill="none" stroke="#B9702A" stroke-width="2.6" stroke-linecap="round"/>` +
        `<circle cx="42" cy="46" r="2.2" fill="#B9702A"/><circle cx="58" cy="46" r="2.2" fill="#B9702A"/>` +
        `<ellipse cx="38" cy="54" rx="3.5" ry="2.2" fill="#F2A07A" opacity=".55"/><ellipse cx="62" cy="54" rx="3.5" ry="2.2" fill="#F2A07A" opacity=".55"/>`;
    },
    'melodia-1': () => aplique(crescente(50, 50, 25, 12, -9, 21), '#F5DE97', '#B68A2E'),
    'melodia-2': () => aplique(estrela(50, 52, 26, 12), '#F5DE97', '#B68A2E', ' stroke="#F5DE97" stroke-width="5" stroke-linejoin="round"'),
    'melodia-3': () => aplique(NUVEM, '#EDE8FA', '#9C93C9'),
  };

  function botao(tipo) {
    const id = novoId(tipo);
    const g = nome => `${id}-${nome}`;
    const [feltro, borda, linha] = FELTRO[tipo];
    return `<svg class="icone-botao" viewBox="0 0 100 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        `<radialGradient id="${g('volume')}" cx=".42" cy=".36" r=".66">${paradas([[0, '#FFF6E8', .2], [.55, '#FFF6E8', 0], [.86, '#1A0E1E', .12], [1, '#1A0E1E', .3]])}</radialGradient>` +
        `<radialGradient id="${g('sombra')}">${paradas([[0, '#1A0E1E', .4], [1, '#1A0E1E', 0]])}</radialGradient>` +
      `</defs>` +
      `<ellipse cx="50" cy="93" rx="38" ry="6.5" fill="url(#${g('sombra')})"/>` +
      `<circle cx="50" cy="48.5" r="44.5" fill="${borda}"/>` +
      `<circle cx="50" cy="47" r="43.5" fill="${feltro}"/>` +
      `<circle cx="50" cy="47" r="43.5" fill="url(#momon-grao)" opacity=".5"/>` +
      `<circle cx="50" cy="47" r="43.5" fill="url(#${g('volume')})"/>` +
      `<circle cx="50" cy="47" r="37.5" fill="none" stroke="${linha}" stroke-width="2" stroke-dasharray="4.2 3.6" stroke-linecap="round" opacity=".85"/>` +
      `<g transform="translate(0 -3)">${DESENHOS[tipo]()}</g>` +
    `</svg>`;
  }

  // ---------------------------------------------------------------- partículas

  // Flores de chita: pétalas redondas de cor chapada, miolo contrastando e os
  // risquinhos brancos de luz que a chita tem.
  const CHITA = [['#D9443A', '#F2C230'], ['#F2C230', '#D9443A'], ['#F08FA4', '#D9443A'], ['#4A6FB5', '#F2C230'], ['#FFF1DC', '#D9443A']];

  function particula(tipo) {
    const id = novoId(tipo);
    const caixa = c => `<svg class="particula-svg" viewBox="0 0 60 60" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${c}</svg>`;
    // forma de feltro: sombrinha, a forma e o pesponto por dentro
    const feltro = (d, cor, linha) =>
      `<path d="${d}" fill="#2A1420" opacity=".25" transform="translate(0 2.5)"/>` +
      `<path d="${d}" fill="${cor}"/>` +
      `<path d="${d}" fill="url(#momon-grao)" opacity=".35"/>` +
      `<path d="${d}" fill="none" stroke="${linha}" stroke-width="1.6" stroke-dasharray="3 2.6" stroke-linecap="round" opacity=".85" transform="translate(30 30) scale(.8) translate(-30 -30)"/>`;
    switch (tipo) {
      case 'flor': {
        const [cor, miolo] = CHITA[Math.floor(Math.random() * CHITA.length)];
        let petalas = '', riscos = '';
        for (let i = 0; i < 5; i++) {
          const a = (-90 + i * 72) * Math.PI / 180;
          const x = 30 + Math.cos(a) * 13, y = 30 + Math.sin(a) * 13;
          petalas += `<circle cx="${n(x)}" cy="${n(y)}" r="11"/>`;
          riscos += `M${n(30 + Math.cos(a - .28) * 17)} ${n(30 + Math.sin(a - .28) * 17)}Q${n(30 + Math.cos(a) * 20.5)} ${n(30 + Math.sin(a) * 20.5)} ${n(30 + Math.cos(a + .2) * 18)} ${n(30 + Math.sin(a + .2) * 18)}`;
        }
        return caixa(`<g fill="#2A1420" opacity=".22" transform="translate(0 2.5)">${petalas}</g>` +
          `<g fill="${cor}">${petalas}</g>` +
          `<path d="${riscos}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>` +
          `<circle cx="30" cy="30" r="8.5" fill="${miolo}"/>` +
          `<circle cx="30" cy="30" r="3.4" fill="#FFF4DC" opacity=".85"/>`);
      }
      case 'estrela':
        return caixa(feltro(estrela(30, 32, 25, 12), '#F2C230', '#FFF4CC') +
          `<path d="${estrela(30, 32, 25, 12)}" fill="none" stroke="#F2C230" stroke-width="3" stroke-linejoin="round"/>`);
      case 'vagalume':
        return caixa(`<defs><radialGradient id="${id}">${paradas([[0, '#FFFDE0'], [.25, '#F4FF8A', .9], [1, '#E6FF5C', 0]])}</radialGradient></defs>` +
          `<circle cx="30" cy="30" r="28" fill="url(#${id})"/>` +
          `<ellipse cx="22" cy="24" rx="7" ry="4" fill="#fff" opacity=".45" transform="rotate(-30 22 24)"/>` +
          `<ellipse cx="38" cy="24" rx="7" ry="4" fill="#fff" opacity=".45" transform="rotate(30 38 24)"/>` +
          `<circle cx="30" cy="32" r="6" fill="#FFFBD0"/>`);
      case 'coracao':
        return caixa(feltro('M30 52C14 41 6 32 6 22C6 14 12 8 19 8C24 8 28 11 30 15C32 11 36 8 41 8C48 8 54 14 54 22C54 32 46 41 30 52Z', '#E0475A', '#FFD4D4'));
      case 'z':
        return caixa(`<path d="M16 16H44L16 44H44" fill="none" stroke="#B9A9FF" stroke-opacity=".35" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<path d="M16 16H44L16 44H44" fill="none" stroke="#F1ECFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
      default: // brilho
        return caixa(`<path d="M30 4Q33 27 56 30Q33 33 30 56Q27 33 4 30Q27 27 30 4Z" fill="#FFF8DC"/>`);
    }
  }

  // ---------------------------------------------------------------- pata, mãozinha, ovo

  function pata() {
    return `<svg class="pata-svg" viewBox="0 0 100 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<ellipse cx="50" cy="64" rx="22" ry="18" fill="#fff"/>` +
      `<ellipse cx="24" cy="40" rx="9" ry="11" fill="#fff" transform="rotate(-20 24 40)"/>` +
      `<ellipse cx="40" cy="27" rx="9" ry="11" fill="#fff" transform="rotate(-6 40 27)"/>` +
      `<ellipse cx="60" cy="27" rx="9" ry="11" fill="#fff" transform="rotate(6 60 27)"/>` +
      `<ellipse cx="76" cy="40" rx="9" ry="11" fill="#fff" transform="rotate(20 76 40)"/>` +
    `</svg>`;
  }

  function maozinha() {
    return `<svg class="maozinha-svg" viewBox="0 0 80 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M30 46V14C30 7 42 7 42 14V44C44 40 54 40 55 47C58 43 67 45 67 52C70 49 78 52 77 60V72C77 88 64 96 50 96H44C32 96 24 90 18 80L8 62C5 56 12 50 18 55L30 66Z" ` +
        `fill="#FFE3D1" stroke="#C98E79" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M42 46V58M55 48V60M67 54V64" stroke="#E3B19C" stroke-width="2.5" stroke-linecap="round"/>` +
      `<ellipse cx="36" cy="16" rx="3" ry="4" fill="#fff" opacity=".7"/>` +
    `</svg>`;
  }

  // Ovinho de estrela: casca de baixo, casca de cima (que sai voando) e o brilho.
  // Fosco, como cerâmica pintada, com estrelinhas de feltro costuradas.
  function ovo() {
    const id = novoId('ovo');
    const CASCA = 'M50 4C74 4 92 40 92 70C92 98 74 118 50 118C26 118 8 98 8 70C8 40 26 4 50 4Z';
    const RACHADO = 'M8 64L22 56L32 68L44 54L56 68L66 54L78 66L92 58';
    const estrelinhas = [[34, 40, 7], [63, 29, 6], [71, 63, 8], [29, 84, 6], [53, 98, 7], [48, 60, 5]]
      .map(([x, y, r]) => `<path d="${estrela(x, y + 1.2, r, r * .48)}" fill="#8E5A1A" opacity=".25"/>` +
        `<path d="${estrela(x, y, r, r * .48)}" fill="#E9AE3C" stroke="#E9AE3C" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<path d="${estrela(x, y, r * .62, r * .3)}" fill="none" stroke="#FFF1C9" stroke-width=".9" stroke-dasharray="1.6 1.3" opacity=".9"/>`).join('');
    const corpo = `<path d="${CASCA}" fill="url(#${id}-casca)"/>` +
      `<path d="${CASCA}" fill="url(#momon-grao)" opacity=".18"/>${estrelinhas}<path d="${CASCA}" fill="url(#${id}-luz)"/>`;
    return `<svg class="ovo-svg" viewBox="-10 -20 120 150" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        `<radialGradient id="${id}-casca" cx=".4" cy=".34" r=".8">${paradas([[0, '#FFFEF8'], [.5, '#FBF1E2'], [1, '#EBD6BA']])}</radialGradient>` +
        `<radialGradient id="${id}-luz" cx=".36" cy=".3" r=".8">${paradas([[0, '#FFF0C8', .35], [.45, '#FFF0C8', 0], [.84, '#7A4A34', .08], [1, '#7A4A34', .22]])}</radialGradient>` +
        `<radialGradient id="${id}-aura">${paradas([[0, '#FFE9A8', .6], [1, '#FFE9A8', 0]])}</radialGradient>` +
        `<clipPath id="${id}-baixo"><path d="${RACHADO}L92 130L8 130Z"/></clipPath>` +
        `<clipPath id="${id}-cima"><path d="${RACHADO}L92 -20L8 -20Z"/></clipPath>` +
      `</defs>` +
      `<ellipse class="ovo-aura" cx="50" cy="66" rx="62" ry="70" fill="url(#${id}-aura)"/>` +
      `<ellipse cx="50" cy="121" rx="38" ry="6" fill="#2A1420" opacity=".3"/>` +
      `<g class="ovo-baixo" clip-path="url(#${id}-baixo)">${corpo}</g>` +
      `<g class="ovo-cima"><g clip-path="url(#${id}-cima)">${corpo}</g></g>` +
      `<path class="ovo-rachado" d="${RACHADO}" fill="none" stroke="#9C6E52" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    `</svg>`;
  }

  window.Momon = window.Momon || {};
  window.Momon.icones = { botao, particula, pata, maozinha, ovo };
})();
