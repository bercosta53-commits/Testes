// Gera tokens/tokens.css a partir de tokens/tokens.json (fonte única).
// Mesmo formato que o design system publicado compila: variáveis por tema + uma classe por estilo de texto.
// Uso: node scripts/build-tokens.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));
const themes = t.color.themes.map((x) => x.id);
const first = themes[0];
const val = (v) => (typeof v === 'string' && /^\{.+\}$/.test(v) ? `var(--${v.slice(1, -1)})` : String(v).toLowerCase());
const colorOf = (tok, th) => (typeof tok.value === 'string' ? (th === first ? tok.value : null) : tok.value[th] ?? null);

let css = `/* ${t.name} — generated from tokens.json */\n`;
for (const th of themes) {
  const sel = th === first ? `:root, [data-theme="${th}"]` : `[data-theme="${th}"]`;
  const lines = [];
  for (const tok of t.color.tokens) {
    const v = colorOf(tok, th);
    if (v) lines.push(`  --${tok.name}: ${val(v)};`);
  }
  if (th === first) for (const s of t.shadow?.tokens ?? []) lines.push(`  --${s.name}: ${s.value};`);
  css += `${sel} {\n${lines.join('\n')}\n}\n`;
}
const plain = [];
for (const [key, fam] of Object.entries(t)) {
  if (['color', 'type', 'shadow', 'name', 'version', 'meta'].includes(key) || !fam?.tokens) continue;
  for (const tok of fam.tokens) plain.push(`  --${tok.name}: ${tok.value};`);
}
for (const [k, stack] of Object.entries(t.type.families)) plain.push(`  --font-${k}: ${stack};`);
css += `:root {\n${plain.join('\n')}\n}\n`;
const px = (v) => (typeof v === 'number' ? `${v}px` : v);
for (const g of t.type.groups) {
  for (const s of g.styles) {
    const d = [`font-family: var(--font-${s.family ?? g.family})`, `font-size: ${px(s.fontSize)}`];
    if (s.lineHeight != null) d.push(`line-height: ${s.lineHeight}`);
    if (s.fontWeight != null) d.push(`font-weight: ${s.fontWeight}`);
    if (s.fontStyle) d.push(`font-style: ${s.fontStyle}`);
    if (s.letterSpacing) d.push(`letter-spacing: ${s.letterSpacing}`);
    css += `.${s.name} { ${d.join('; ')}; }\n`;
  }
}
writeFileSync(join(root, 'tokens/tokens.css'), css);
console.log('tokens/tokens.css gerado:', css.length, 'bytes');
