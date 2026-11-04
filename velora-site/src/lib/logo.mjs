// Logo oficial da Velora em SVG (vetorizado do PNG oficial: scripts/vetorizar-logo.py).
// Emblema, palavra e assinatura usam currentColor (a cor vem do fundo: grafite no claro, quase branco no escuro);
// o ponto mantém o verde do arquivo oficial. Cada listra do emblema é uma forma própria, para a animação de entrada.
import { raw } from './html.mjs';
import { LOGO } from '../conteudo/logo-velora.mjs';

const VIEWBOX = {
  completo: `0 0 ${LOGO.largura} ${LOGO.altura}`, // emblema + velora. + Growth & Beyond
  compacto: `0 0 ${LOGO.largura} 540`, // sem a assinatura (ilegível em tamanho de cabeçalho)
  palavra: '600 90 1324 352', // só "velora." (assinatura em escala de cartaz no rodapé)
};

const emblema = () =>
  `<g class="logo__emblema">${LOGO.emblema.map((d, k) => `<path class="logo__listra" style="--k:${k}" d="${d}"/>`).join('')}</g>`;
const palavra = () => `<path class="logo__palavra" fill-rule="evenodd" d="${LOGO.palavra}"/>`;
const ponto = () => `<circle class="logo__ponto" cx="${LOGO.ponto.cx}" cy="${LOGO.ponto.cy}" r="${LOGO.ponto.r}"/>`;
const assinatura = () => `<path class="logo__assinatura" fill-rule="evenodd" d="${LOGO.assinatura}"/>`;

// Decorativo por padrão (aria-hidden): o nome acessível fica no link que envolve o logo.
export function logo({ variante = 'compacto', classe = '' } = {}) {
  const partes =
    variante === 'palavra' ? palavra() + ponto()
      : variante === 'completo' ? emblema() + palavra() + ponto() + assinatura()
        : emblema() + palavra() + ponto();
  return raw(`<svg class="logo logo--${variante} ${classe}" viewBox="${VIEWBOX[variante]}" aria-hidden="true" focusable="false">${partes}</svg>`);
}

export const corLogo = { forma: LOGO.cor, ponto: LOGO.corPonto };
