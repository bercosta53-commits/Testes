// Exporta, a partir do motor (bundle/sonata.js): os grafismos em SVG (assets/elementos)
// e o catálogo de modelos para IA (ia/modelos.json). Uso: node scripts/exportar.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'bundle/sonata.js'), 'utf8'), ctx);
const S = ctx.window.Sonata;
const tokens = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));
const cor = Object.fromEntries(tokens.color.tokens.filter((t) => typeof t.value === 'string').map((t) => [t.name, t.value]));
const svg = (s) => '<?xml version="1.0" encoding="UTF-8"?>\n' + s.replace(' class="sn-el sn-arcos"', '').replace(' class="sn-el sn-onda"', '').replace(' class="sn-linha"', '').replace(' class="sn-el sn-linhas-onda"', '').replace(' aria-hidden="true"', ' xmlns="http://www.w3.org/2000/svg"') + '\n';
const out = (f, s) => { writeFileSync(join(root, 'assets/elementos', f), svg(s)); console.log('assets/elementos/' + f); };

out('arcos-escuta-agua.svg', S.elementos.arcos({ w: 600, h: 600, cx: 600, cy: 0, r: 300, passo: 70, espessura: 24, de: 90, ate: 180, cores: [cor['agua-400'], cor['agua-200'], cor['agua-100']] }));
out('arcos-escuta-marinho.svg', S.elementos.arcos({ w: 600, h: 600, cx: 600, cy: 0, r: 300, passo: 70, espessura: 24, de: 90, ate: 180, cores: [cor['agua-400'], cor['marinho-600'], cor['marinho-700']] }));
out('arcos-escuta-branco.svg', S.elementos.arcos({ w: 600, h: 600, cx: 600, cy: 0, r: 300, passo: 70, espessura: 24, de: 90, ate: 180, cores: [cor['branco']], opacidades: [1, 0.55, 0.28] }));
out('arcos-retrato.svg', S.elementos.arcos({ w: 520, h: 520, cx: 300, cy: 300, r: 130, passo: 40, espessura: 16, de: 196, ate: 284, cores: [cor['agua-400'], cor['agua-300'], cor['agua-200']] }));
out('onda-base-agua.svg', S.elementos.onda({ w: 1080, h: 320, altura: 230, amplitude: 32, cores: [cor['agua-200'], cor['agua-400']] }));
out('onda-base-marinho.svg', S.elementos.onda({ w: 1080, h: 320, altura: 230, amplitude: 32, cores: [cor['marinho-600'], cor['agua-400']] }));
out('linha-de-som.svg', S.elementos.linhaDeSom({ largura: 888, altura: 112, cor: cor['agua-400'], corSuave: cor['agua-200'] }));
out('linhas-de-onda-nevoa.svg', S.elementos.linhasDeOnda({ w: 1080, h: 1350 }).replace(/var\(--grafismo-medio\)/g, cor['marinho-200']));
out('linhas-de-onda-marinho.svg', S.elementos.linhasDeOnda({ w: 1080, h: 1350 }).replace(/var\(--grafismo-medio\)/g, cor['marinho-600']));

// Ícones de linha (24 × 24, traço 2, cor atual) — base Feather Icons, licença MIT.
mkdirSync(join(root, 'assets/elementos/icones'), { recursive: true });
for (const nome of S.icones) {
  const svg = S.elementos.icone(nome, 24).replace(' class="sn-icone" aria-hidden="true"', ' xmlns="http://www.w3.org/2000/svg"');
  writeFileSync(join(root, 'assets/elementos/icones', nome + '.svg'), svg + '\n');
}
console.log('assets/elementos/icones/ (' + S.icones.length + ')');

const catalogo = {
  versao: S.versao,
  formatos: S.formatos,
  vocabularioEvitado: S.vocabularioEvitado,
  modelos: S.modelos
};
writeFileSync(join(root, 'ia/modelos.json'), JSON.stringify(catalogo, null, 2) + '\n');
console.log('ia/modelos.json');

// Exemplos embutidos para a galeria (modelos/index.html abre direto do disco, sem servidor).
const exemplos = readdirSync(join(root, 'exemplos')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => ({ arquivo: f, ficha: JSON.parse(readFileSync(join(root, 'exemplos', f), 'utf8')) }));
writeFileSync(join(root, 'modelos/exemplos.js'), '// Gerado por scripts/exportar.mjs a partir de exemplos/*.json\nwindow.EXEMPLOS = ' + JSON.stringify(exemplos, null, 1) + ';\n');
console.log('modelos/exemplos.js');
