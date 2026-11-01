// Utilitários de HTML: escape por padrão, HTML confiável só via raw().

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(valor) {
  return String(valor).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

class Bruto {
  constructor(texto) { this.texto = texto; }
  toString() { return this.texto; }
}

export const raw = (texto) => new Bruto(String(texto));

function renderizar(valor) {
  if (valor === null || valor === undefined || valor === false || valor === true) return '';
  if (Array.isArray(valor)) return valor.map(renderizar).join('');
  if (valor instanceof Bruto) return valor.texto;
  return esc(valor);
}

// Template tag: interpolações são escapadas, exceto valores raw() e arrays deles.
export function html(partes, ...valores) {
  let saida = partes[0];
  valores.forEach((v, i) => { saida += renderizar(v) + partes[i + 1]; });
  return raw(saida);
}

// Markdown mínimo da copy: **negrito**. Todo o resto é escapado.
export function md(texto) {
  return raw(esc(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
}

export const juntar = (itens) => raw(itens.map(renderizar).join(''));
