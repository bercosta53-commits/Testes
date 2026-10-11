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

  const BASES = {
    coberta: ['#FFE3EA', '#F7A6BB', '#D9798F'],
    dormir: ['#8483D6', '#4D4A9E', '#2F2C6E'],
    acordar: ['#FFF0B8', '#FFC960', '#E89A2E'],
    'melodia-1': ['#9C9BE6', '#5F5CB4', '#3C3982'],
    'melodia-2': ['#9C9BE6', '#5F5CB4', '#3C3982'],
    'melodia-3': ['#9C9BE6', '#5F5CB4', '#3C3982'],
  };

  const DESENHOS = {
    // cobertinha dobrada, com pespontos e um coraçãozinho
    coberta: g => `<rect x="24" y="52" width="52" height="16" rx="8" fill="#F38DA8"/>` +
      `<rect x="22" y="40" width="56" height="17" rx="8.5" fill="#FFC2D1"/>` +
      `<rect x="20" y="27" width="60" height="18" rx="9" fill="url(#${g('claro')})"/>` +
      `<path d="M28 36H72M28 48.5H72M30 60H70" stroke="#fff" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity=".85"/>` +
      `<path d="M50 74C42 68 38 64 38 60C38 56.5 41 54.5 44 54.5C46.5 54.5 48.5 56 50 58C51.5 56 53.5 54.5 56 54.5C59 54.5 62 56.5 62 60C62 64 58 68 50 74Z" fill="#FF6F91" stroke="#fff" stroke-width="2"/>`,
    // lua dormindo num travesseiro
    dormir: g => `<path d="M18 64C18 54 32 52 50 52C68 52 82 54 82 64C82 74 68 76 50 76C32 76 18 74 18 64Z" fill="url(#${g('travesseiro')})"/>` +
      `<path d="M26 64H74" stroke="#fff" stroke-width="2" stroke-dasharray="3 4" opacity=".6"/>` +
      `<path d="${crescente(50, 38, 21, 11, -8, 18)}" fill="#FFF0BE"/>` +
      `<path d="${estrela(74, 26, 6, 2.6)}" fill="#FFF0BE" stroke="#FFF0BE" stroke-linejoin="round"/>` +
      `<path d="${estrela(24, 30, 4, 1.8)}" fill="#FFF0BE" stroke="#FFF0BE" stroke-linejoin="round" opacity=".8"/>`,
    // sol
    acordar: () => {
      let raios = '';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        raios += `<path d="M${n(50 + Math.cos(a) * 25)} ${n(50 + Math.sin(a) * 25)}L${n(50 + Math.cos(a) * 34)} ${n(50 + Math.sin(a) * 34)}" stroke="#FFF7DA" stroke-width="6" stroke-linecap="round"/>`;
      }
      return raios + `<circle cx="50" cy="50" r="17" fill="#FFF7DA"/>` +
        `<path d="M43 52Q50 58 57 52" fill="none" stroke="#E8952E" stroke-width="3" stroke-linecap="round"/>`;
    },
    'melodia-1': () => `<path d="${crescente(50, 50, 24, 12, -9, 21)}" fill="#FFF0BE"/>`,
    'melodia-2': () => `<path d="${estrela(50, 52, 25, 11)}" fill="#FFE27A" stroke="#FFE27A" stroke-width="4" stroke-linejoin="round"/>`,
    'melodia-3': () => `<path d="M26 62C18 62 16 50 25 48C24 38 36 34 42 40C45 30 62 30 64 42C72 40 82 46 78 56C84 60 80 68 72 66H28Z" fill="#F4F2FF"/>` +
      `<path d="M30 60H72" stroke="#C9C4F0" stroke-width="3" stroke-linecap="round"/>`,
  };

  function botao(tipo) {
    const id = novoId(tipo);
    const g = nome => `${id}-${nome}`;
    const [claro, meio, escuro] = BASES[tipo];
    return `<svg class="icone-botao" viewBox="0 0 100 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        `<radialGradient id="${g('base')}" cx=".42" cy=".34" r=".72" fx=".36" fy=".24">${paradas([[0, claro], [.55, meio], [1, escuro]])}</radialGradient>` +
        `<radialGradient id="${g('sombra')}">${paradas([[0, '#2A1A26', .35], [1, '#2A1A26', 0]])}</radialGradient>` +
        `<linearGradient id="${g('claro')}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#FFF3F6'], [1, '#FFD3DE']])}</linearGradient>` +
        `<linearGradient id="${g('travesseiro')}" x1="0" y1="0" x2="0" y2="1">${paradas([[0, '#E7E0FF'], [1, '#B9AEF0']])}</linearGradient>` +
      `</defs>` +
      `<ellipse cx="50" cy="93" rx="36" ry="6" fill="url(#${g('sombra')})"/>` +
      `<circle cx="50" cy="48" r="44" fill="url(#${g('base')})"/>` +
      `<ellipse cx="40" cy="20" rx="20" ry="9" fill="#fff" opacity=".28"/>` +
      `<g transform="translate(0 -2)">${DESENHOS[tipo](g)}</g>` +
    `</svg>`;
  }

  // ---------------------------------------------------------------- partículas

  const CORES_FLOR = [['#FFC2D1', '#FF8FAB'], ['#FFE3B0', '#FFC36E'], ['#E3D6FF', '#B9A3F5'], ['#C9F2E6', '#86D4BF']];

  function particula(tipo) {
    const id = novoId(tipo);
    const caixa = c => `<svg class="particula-svg" viewBox="0 0 60 60" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${c}</svg>`;
    switch (tipo) {
      case 'flor': {
        const [claro, escuro] = CORES_FLOR[Math.floor(Math.random() * CORES_FLOR.length)];
        let petalas = '';
        for (let i = 0; i < 5; i++) {
          petalas += `<ellipse cx="30" cy="15" rx="9" ry="13" fill="url(#${id})" transform="rotate(${i * 72} 30 30)"/>`;
        }
        return caixa(`<defs><radialGradient id="${id}" cx=".5" cy=".8" r=".9">${paradas([[0, '#fff'], [.4, claro], [1, escuro]])}</radialGradient></defs>` +
          petalas + `<circle cx="30" cy="30" r="8" fill="#FFD66B"/><circle cx="27.5" cy="27.5" r="2.5" fill="#fff" opacity=".8"/>`);
      }
      case 'estrela':
        return caixa(`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${paradas([[0, '#FFF7C8'], [1, '#FFC93D']])}</linearGradient></defs>` +
          `<path d="${estrela(30, 32, 24, 11)}" fill="url(#${id})" stroke="#FFE37A" stroke-width="3" stroke-linejoin="round"/>` +
          `<ellipse cx="25" cy="24" rx="4" ry="2.5" fill="#fff" opacity=".8"/>`);
      case 'vagalume':
        return caixa(`<defs><radialGradient id="${id}">${paradas([[0, '#FFFDE0'], [.25, '#F4FF8A', .9], [1, '#E6FF5C', 0]])}</radialGradient></defs>` +
          `<circle cx="30" cy="30" r="28" fill="url(#${id})"/>` +
          `<ellipse cx="22" cy="24" rx="7" ry="4" fill="#fff" opacity=".55" transform="rotate(-30 22 24)"/>` +
          `<ellipse cx="38" cy="24" rx="7" ry="4" fill="#fff" opacity=".55" transform="rotate(30 38 24)"/>` +
          `<circle cx="30" cy="32" r="6" fill="#FFFBD0"/>`);
      case 'coracao':
        return caixa(`<defs><radialGradient id="${id}" cx=".38" cy=".3" r=".8">${paradas([[0, '#FFD0DC'], [.5, '#FF7D9C'], [1, '#E5517A']])}</radialGradient></defs>` +
          `<path d="M30 52C14 41 6 32 6 22C6 14 12 8 19 8C24 8 28 11 30 15C32 11 36 8 41 8C48 8 54 14 54 22C54 32 46 41 30 52Z" fill="url(#${id})"/>` +
          `<ellipse cx="19" cy="18" rx="5" ry="3.5" fill="#fff" opacity=".7" transform="rotate(-25 19 18)"/>`);
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
  function ovo() {
    const id = novoId('ovo');
    const CASCA = 'M50 4C74 4 92 40 92 70C92 98 74 118 50 118C26 118 8 98 8 70C8 40 26 4 50 4Z';
    const RACHADO = 'M8 64L22 56L32 68L44 54L56 68L66 54L78 66L92 58';
    const estrelinhas = [[34, 40, 6], [62, 30, 5], [70, 62, 7], [30, 82, 5], [52, 96, 6], [48, 58, 4]]
      .map(([x, y, r]) => `<path d="${estrela(x, y, r, r * .45)}" fill="#FFD66B" stroke="#FFD66B" stroke-linejoin="round"/>`).join('');
    const corpo = `<path d="${CASCA}" fill="url(#${id}-casca)"/>${estrelinhas}<path d="${CASCA}" fill="url(#${id}-luz)"/>`;
    return `<svg class="ovo-svg" viewBox="-10 -20 120 150" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
        `<radialGradient id="${id}-casca" cx=".4" cy=".35" r=".8">${paradas([[0, '#FFFFFF'], [.55, '#FFF5E6'], [1, '#F2DCC4']])}</radialGradient>` +
        `<radialGradient id="${id}-luz" cx=".42" cy=".34" r=".74" fx=".34" fy=".2">${paradas([[0, '#fff', .5], [.4, '#fff', 0], [.85, '#9C6E5A', .16], [1, '#9C6E5A', .24]])}</radialGradient>` +
        `<radialGradient id="${id}-aura">${paradas([[0, '#FFF3B0', .7], [1, '#FFF3B0', 0]])}</radialGradient>` +
        `<clipPath id="${id}-baixo"><path d="${RACHADO}L92 130L8 130Z"/></clipPath>` +
        `<clipPath id="${id}-cima"><path d="${RACHADO}L92 -20L8 -20Z"/></clipPath>` +
      `</defs>` +
      `<ellipse class="ovo-aura" cx="50" cy="66" rx="62" ry="70" fill="url(#${id}-aura)"/>` +
      `<ellipse cx="50" cy="122" rx="40" ry="7" fill="#3E2A36" opacity=".25"/>` +
      `<g class="ovo-baixo" clip-path="url(#${id}-baixo)">${corpo}</g>` +
      `<g class="ovo-cima"><g clip-path="url(#${id}-cima)">${corpo}</g></g>` +
      `<path class="ovo-rachado" d="${RACHADO}" fill="none" stroke="#B88A6E" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    `</svg>`;
  }

  window.Momon = window.Momon || {};
  window.Momon.icones = { botao, particula, pata, maozinha, ovo };
})();
