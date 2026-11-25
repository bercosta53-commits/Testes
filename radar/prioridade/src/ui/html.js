// @ts-check
/** Utilitários de marcação. Todo texto vindo de dados passa por `esc`. */

/** @param {unknown} s */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
}

/** @param {string} nome @param {string} [cls] */
export function ico(nome, cls) {
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + nome + '"/></svg>';
}

/** Símbolos SVG usados pela página. */
export const SIMBOLOS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-prio" viewBox="0 0 16 16"><path d="M8 2.5 13.5 8 8 13.5 2.5 8z"/><path d="M8 5.5 10.5 8 8 10.5 5.5 8z"/></symbol>
  <symbol id="i-busca" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/></symbol>
  <symbol id="i-baixo" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></symbol>
  <symbol id="i-dir" viewBox="0 0 16 16"><path d="M6 4l4 4-4 4"/></symbol>
  <symbol id="i-x" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></symbol>
  <symbol id="i-link" viewBox="0 0 16 16"><path d="M6.5 9.5l3-3M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 0 1 4.5 9l1-1"/></symbol>
  <symbol id="i-filtro" viewBox="0 0 16 16"><path d="M2.5 4h11M4.5 8h7M6.5 12h3"/></symbol>
  <symbol id="i-seta" viewBox="0 0 16 16"><path d="M3 8h10M9.5 4.5 13 8l-3.5 3.5"/></symbol>
  <symbol id="i-cima" viewBox="0 0 16 16"><path d="M4 10l4-4 4 4"/></symbol>
  <symbol id="i-sinal" viewBox="0 0 16 16"><path d="M2 9h2.5l1.5-4 3 7 1.5-3H14"/></symbol>
  <symbol id="i-clima" viewBox="0 0 16 16"><path d="M4.5 11.5h7a2.5 2.5 0 0 0 0-5 3.5 3.5 0 0 0-6.8 1A2 2 0 0 0 4.5 11.5z"/></symbol>
</svg>`;
