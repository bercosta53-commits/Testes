// Gera um HTML único e autocontido a partir de dist/: CSS, JS, fontes e fotos embutidos.
// Serve para abrir direto no navegador ou enviar como anexo, sem pasta de assets.
//   node build.mjs && node scripts/arquivo-unico.mjs [saída]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
const saida = path.resolve(process.argv[2] || path.join(raiz, 'arquivo-unico', 'velora-site.html'));

const TIPOS = { '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const dataUri = async (arquivo) => `data:${TIPOS[path.extname(arquivo)]};base64,${(await readFile(arquivo)).toString('base64')}`;
const semVersao = (href) => href.replace(/\?.*$/, '');

let html = await readFile(path.join(dist, 'index.html'), 'utf8');

// Pré-carregamentos não fazem sentido com tudo embutido.
html = html.replace(/<link rel="preload"[^>]*>\n?/g, '');

// CSS embutido, com as fontes como data URI.
const linkCss = html.match(/<link rel="stylesheet" href="([^"]+)">/);
let css = await readFile(path.join(dist, semVersao(linkCss[1])), 'utf8');
const fontes = [...new Set([...css.matchAll(/url\('(\.\.\/fonts\/[^']+)'\)/g)].map((m) => m[1]))];
for (const f of fontes) {
  css = css.split(`url('${f}')`).join(`url('${await dataUri(path.join(dist, 'assets/css', f))}')`);
}
html = html.replace(linkCss[0], () => `<style>\n${css}\n</style>`);

// JS embutido (o script já espera o DOMContentLoaded quando roda no <head>).
const tagJs = html.match(/<script src="([^"]+)" defer><\/script>/);
const js = (await readFile(path.join(dist, semVersao(tagJs[1])), 'utf8')).replace(/<\//g, '<\\/');
html = html.replace(tagJs[0], () => `<script>\n${js}\n</script>`);

// Fotos: a versão maior de cada uma, embutida; srcset/sizes saem.
const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
for (const tag of imgs) {
  const src = tag.match(/ src="([^"]+)"/)[1];
  if (src.startsWith('data:')) continue;
  const nova = tag
    .replace(/ srcset="[^"]*"/, '')
    .replace(/ sizes="[^"]*"/, '')
    .replace(/ src="[^"]+"/, ` src="${await dataUri(path.join(dist, src))}"`);
  html = html.replace(tag, () => nova);
}

const restantes = [...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map((m) => m[1]);
if (restantes.length) throw new Error(`Referências não embutidas: ${restantes.join(', ')}`);

await mkdir(path.dirname(saida), { recursive: true });
await writeFile(saida, html);
console.log(`${path.relative(process.cwd(), saida)} · ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB · ${fontes.length} fontes e ${imgs.length} fotos embutidas`);
