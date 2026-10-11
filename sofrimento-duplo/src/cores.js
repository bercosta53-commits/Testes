// Leitura dos tokens de cor do tema atual e utilitários de contraste.

const TINTA_ESCURA = '#0e1116';
const TINTA_CLARA = '#ffffff';

/** Lê um token de cor (ex.: '--c-pior') do tema aplicado agora. */
export function token(nome) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

function rgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function hex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/** Mistura `cor` sobre `fundo` com intensidade t (0 = só fundo, 1 = só cor). */
export function misturar(fundo, cor, t) {
  const a = rgb(fundo);
  const b = rgb(cor);
  return hex(a.map((v, i) => v + (b[i] - v) * t));
}

function luminancia(hexCor) {
  const [r, g, b] = rgb(hexCor).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Cor de texto (escura ou branca) com mais contraste sobre o fundo dado. */
export function tintaSobre(fundo) {
  return contraste(fundo, TINTA_ESCURA) >= contraste(fundo, TINTA_CLARA) ? TINTA_ESCURA : TINTA_CLARA;
}
