const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.resolve(__dirname, 'painel.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // report pages whose content overflows
  const over = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => {
    const f = pg.querySelector('.foot').getBoundingClientRect(); const r = pg.getBoundingClientRect();
    return { page: i + 1, footBottom: Math.round(f.bottom - r.top), pageH: Math.round(r.height), fonts: document.fonts.check('9pt Inter') };
  }));
  console.log(JSON.stringify(over));
  await p.pdf({ path: path.resolve(__dirname, 'Nuclimagem_Painel_Setembro2026.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
