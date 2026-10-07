// Embute as fontes do deck (pacotes @fontsource, subconjunto latin) em base64 no
// src/index.html, entre os marcadores /* @fonts:start */ e /* @fonts:end */.
// Idempotente: rode de novo depois de atualizar os pacotes de fonte.
//
//   npm run fonts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'src/index.html');

const familias = [
  ['Poppins', 'poppins', [400, 500, 600, 700, 800]],
  ['Inter', 'inter', [400, 500, 600]],
  ['JetBrains Mono', 'jetbrains-mono', [500, 700]],
];

const regras = familias.flatMap(([familia, pacote, pesos]) => pesos.map(peso => {
  const arquivo = path.join(root, 'node_modules/@fontsource', pacote, 'files', `${pacote}-latin-${peso}-normal.woff2`);
  const base64 = fs.readFileSync(arquivo).toString('base64');
  return `@font-face{font-family:'${familia}';font-style:normal;font-weight:${peso};font-display:block;` +
    `src:url(data:font/woff2;base64,${base64}) format('woff2')}`;
}));

const html = fs.readFileSync(htmlPath, 'utf8');
const marcadores = /(\/\* @fonts:start \*\/)[\s\S]*?(\/\* @fonts:end \*\/)/;
if (!marcadores.test(html)) throw new Error('Marcadores /* @fonts:start */ e /* @fonts:end */ não encontrados em src/index.html');
fs.writeFileSync(htmlPath, html.replace(marcadores, () => `/* @fonts:start */\n${regras.join('\n')}\n/* @fonts:end */`));
const kb = regras.join('').length / 1024;
console.log(`${regras.length} faces embutidas em src/index.html (${kb.toFixed(0)} KB)`);
