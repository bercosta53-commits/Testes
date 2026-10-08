// Renderiza fichas de post (JSON) em PNG no tamanho real, usando o mesmo motor do design system.
// Uso:
//   node scripts/render.mjs                       → todas as fichas de exemplos/ para previews/
//   node scripts/render.mjs ficha.json saida.png  → uma ficha
//   --escala=0.5                                  → reduz o PNG (padrão 1 = 1080 px de largura)
// Precisa do Playwright (npm i -D playwright) e de um Chromium instalado.
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join, basename, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const escala = Number((process.argv.find((a) => a.startsWith('--escala=')) || '--escala=1').split('=')[1]);

let playwright;
try { playwright = await import('playwright'); }
catch { playwright = await import(process.env.PLAYWRIGHT_MODULE || 'playwright'); }

const jobs = args.length
  ? [{ ficha: resolve(args[0]), saida: resolve(args[1] || args[0].replace(/\.json$/, '.png')) }]
  : readdirSync(join(root, 'exemplos')).filter((f) => f.endsWith('.json')).sort()
      .map((f) => ({ ficha: join(root, 'exemplos', f), saida: join(root, 'previews', f.replace(/\.json$/, '.png')) }));

mkdirSync(join(root, 'previews'), { recursive: true });
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: escala });
await page.goto(pathToFileURL(join(root, 'modelos/render.html')).href);
for (const { ficha, saida } of jobs) {
  const spec = JSON.parse(readFileSync(ficha, 'utf8'));
  const avisos = await page.evaluate(async (spec) => {
    document.body.innerHTML = '';
    const post = Sonata.render(spec);
    document.body.appendChild(post);
    await document.fonts.ready;
    await Promise.all([...post.querySelectorAll('img')].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })));
    Sonata.ajustar(post);
    return Sonata.validar(spec);
  }, spec);
  await page.locator('.sn-post').screenshot({ path: saida });
  console.log(basename(saida), avisos.length ? avisos.map((a) => `\n  ! ${a.campo}: ${a.aviso}`).join('') : '✓');
}
await browser.close();
